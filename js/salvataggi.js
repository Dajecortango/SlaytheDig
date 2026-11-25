/* ==========================================================================
   SALVATAGGI
   Tre slot in localStorage (dignitas_save_1..3): carica, salva, elimina,
   esporta in un file e importa da file. Ogni salvataggio ha una versione del
   formato: readSave() porta i salvataggi vecchi al formato attuale (migrateSave).
   Diviso da js/game.js: stesso ambito globale (usa stato, LIBRERIA, showScreen...).
   Caricato dopo js/game.js; le funzioni si chiamano tra file solo dopo il caricamento
   (l'avvio vero e proprio è in js/avvio.js, caricato per ultimo).
   ========================================================================== */

        // Tre slot di salvataggio in localStorage. Il vecchio salvataggio unico finisce nello slot 1.
        const SAVE_SLOTS = 3;
        const saveKey = slot => `dignitas_save_${slot}`;
        let currentSaveSlot = null;  // slot della partita in corso (per sovrascriverlo e cancellarlo alla sconfitta)

        /* ---------- Formato e migrazioni ----------
           Versione 7 (come la 5, con stato.gmProvaMod, bonus/malus del master alle prove; la 6 porta gli effetti speciali in specialUses). Versione 5 (come la 4, con stato.onlineOwners della partita online: eroe → eroe, perché il giocatore è l'eroe che ha scelto; la 4 rinomina la valuta in Scudi): { version, campaignId, timestamp, stato: { stsMapNodes: [{ id, done, active }],
           currentNodeId, party, partyFlags, partyCoins, unlockedRelics: [{ id, name, desc }],
           activeCurses: [{ id, text }], expeditionStats } }.
           I nodi tengono solo lo stato: il contenuto viene dalla campagna attuale.
           Per cambiare il formato: alza SAVE_VERSION e aggiungi in SAVE_MIGRATIONS la funzione
           che porta un salvataggio dalla versione precedente a quella nuova. */
        const SAVE_VERSION = 8;
        const SAVE_MIGRATIONS = {
            // Versione 1 (senza "version"): campi della partita sparsi al primo livello, nodi completi
            1: old => ({
                version: 2,
                campaignId: old.campaignId,
                timestamp: old.timestamp,
                stato: {
                    stsMapNodes: (old.stsMapNodes || []).map(n => ({ id: n.id, done: !!n.done, active: !!n.active })),
                    currentNodeId: old.currentNodeId ?? null,
                    party: old.party || [],
                    partyFlags: {},
                    partyCoins: old.partyCoins || 0,
                    unlockedRelics: old.unlockedRelics || [],
                    activeCurses: old.activeCurses || [],
                    expeditionStats: old.expeditionStats || {}
                }
            }),
            // Versione 2 -> 3: reliquie e maledizioni con l'id della libreria; le passive degli eroi
            // scrivono sempre il loro segnale (prima il motore controllava anche l'id dell'abilità)
            2: old => {
                const s = old.stato;
                const relicLib = Object.entries(LIBRERIA.reliquie || {});
                const curseLib = Object.entries(LIBRERIA.maledizioni || {});
                const relics = (s.unlockedRelics || []).map(r => {
                    const found = relicLib.find(([, lr]) => lr.name === r.name);
                    return { id: found ? found[0] : idFromName(r.name), name: r.name, desc: r.desc };
                });
                const curses = (s.activeCurses || []).map(text => {
                    if (typeof text !== 'string') return text;
                    const found = curseLib.find(([, c]) => text.startsWith(c.name) ||
                        (c.effects || []).some(e => e.effect === 'add_curse' && e.text === text));
                    return { id: found ? found[0] : idFromName(text.split(' (')[0]), text };
                });
                (s.party || []).forEach(restorePassiveFlags);
                return { ...old, version: 3, stato: { ...s, unlockedRelics: relics, activeCurses: curses } };
            },
            // Versione 3 -> 4: la valuta si chiama Scudi; la maledizione "-15% ricompensa monete" cambia id e testo
            // (anche quella di un salvataggio 2, riconosciuta dal vecchio testo "Maledizione: -15% monete")
            3: old => {
                const s = old.stato;
                const nuova = (LIBRERIA.maledizioni || {})['15_scudi_di_ricompensa'];
                const vecchia = c => c && (c.id === '15_ricompensa_monete' || c.text === 'Maledizione: -15% monete');
                const curses = (s.activeCurses || []).map(c => vecchia(c)
                    ? { id: '15_scudi_di_ricompensa', text: nuova ? `${nuova.name} (${nuova.desc})` : c.text } : c);
                return { ...old, version: 4, stato: { ...s, activeCurses: curses } };
            },
            // Versione 4 -> 5: proprietari degli eroi nella partita online (vuoti per le partite di prima)
            4: old => ({ ...old, version: 5, stato: { ...old.stato, onlineOwners: old.stato.onlineOwners || {} } }),
            // Versione 5 -> 6: effetti speciali "quando → fai" (js/motore/speciali.js). I segni delle reliquie e degli
            // oggetti diventano usi in specialUses; le passive convertite non scrivono più segnali sull'eroe.
            5: old => {
                const s = old.stato;
                const flags = s.partyFlags || {};
                const capitolo = {};
                if (flags.sigilloCharges) capitolo['r:sigillo_runico#0'] = flags.sigilloCharges;
                (s.party || []).forEach(h => {
                    const uses = { scontro: {}, capitolo: {} };
                    // Tanto ho tenacia / Runa della Rinascita: una volta per capitolo
                    if (h.tenacityUsed) {
                        uses.capitolo['a:runa_rinascita#0'] = 1;
                        if (h.chosenAbility && h.chosenAbility.id) uses.capitolo[`a:${h.chosenAbility.id}#0`] = 1;
                    }
                    // Occhio di Gazza: il primo bottino di un elite era già stato usato dalla compagnia
                    if (flags.gazzaUsed) (h.items || []).filter(it => it.loot_extra_once || it.id === 'occhio_gazza')
                        .forEach(it => { uses.capitolo[`o:${it.id || it.name}#0`] = 1; });
                    h.specialUses = uses;
                    ['tenacityRevive', 'tenacityUsed', 'postCombatHeal', 'dodgeNoArmor', 'bonusLootCoins', 'merchantDiscount',
                        'firstHitUsed', 'rerollUsed', 'lastStandUsed'].forEach(k => delete h[k]);
                });
                const partyFlags = { lootExtraChoices: flags.lootExtraChoices || 0, specialUses: { scontro: {}, capitolo } };
                return { ...old, version: 6, stato: { ...s, partyFlags } };
            },
            // Versione 6 -> 7: bonus/malus del master alle prove (Pannello di Controllo), zero per le partite di prima
            6: old => ({ ...old, version: 7, stato: { ...old.stato, gmProvaMod: Number(old.stato.gmProvaMod) || 0 } }),
            // Versione 7 -> 8: le mappe procedurali sono dungeon a piani. Una partita procedurale di prima non si può
            // riprendere (dal seme uscirebbe un'altra mappa): il salvataggio non è più valido
            7: old => (campaignsDatabase[old.campaignId] && campaignsDatabase[old.campaignId].procedurale ? null : { ...old, version: 8 })
        };

        // Porta un salvataggio di qualunque versione al formato attuale (null se non è un salvataggio valido)
        function migrateSave(data) {
            if (!data || typeof data !== 'object' || !data.campaignId) return null;
            let version = data.version || 1;
            while (version < SAVE_VERSION) {
                const step = SAVE_MIGRATIONS[version];
                if (!step) return null;
                data = step(data);
                if (!data) return null;
                version = data.version;
            }
            if (version > SAVE_VERSION || !data.stato || !Array.isArray(data.stato.party)) return null;
            return data;
        }

        function readSave(slot) {
            try { return migrateSave(JSON.parse(localStorage.getItem(saveKey(slot)) || 'null')); } catch (e) { return null; }
        }

        function writeSave(slot, data) {
            localStorage.setItem(saveKey(slot), JSON.stringify(data));
        }

        /* ---------- Spazio nella memoria del browser (localStorage) ----------
           I browser danno circa 5 milioni di caratteri per sito (Chrome, Edge, Firefox): MEMORIA_LIMITE è una stima.
           memoriaUsata conta chiavi e valori del gioco (dignitas_*) e il totale. Sopra MEMORIA_AVVISO si avvisa e si
           propone "Esporta tutto": un solo file .json con salvataggi, progressi, compendio e opzioni (backupCompleto). */
        const MEMORIA_LIMITE = 5 * 1024 * 1024;
        const MEMORIA_AVVISO = 0.8;
        const BACKUP_TIPO = 'slay-the-dig-backup';

        function memoriaUsata() {
            let totale = 0, gioco = 0;
            const chiavi = [];
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    const n = k.length + (localStorage.getItem(k) || '').length;
                    totale += n;
                    if (k.startsWith('dignitas_')) { gioco += n; chiavi.push({ k, n }); }
                }
            } catch (e) {}
            return { totale, gioco, chiavi, quota: Math.min(1, totale / MEMORIA_LIMITE) };
        }

        function memoriaHtml() {
            const m = memoriaUsata();
            const pct = Math.round(m.quota * 100);
            const pieno = m.quota >= MEMORIA_AVVISO;
            return `<p class="save-memory${pieno ? ' is-full' : ''}">Memoria del browser: <b>${pct}%</b> usata (circa ${Math.ceil(m.totale / 1024)} KB su ${MEMORIA_LIMITE / 1024 / 1024} MB)${pieno
                ? '. Quasi piena: esporta tutto in un file ed elimina i salvataggi che non servono.' : ''}</p>`;
        }

        // Dopo un salvataggio riuscito: avviso se la memoria è quasi piena
        function avvisaMemoria() {
            const m = memoriaUsata();
            if (m.quota >= MEMORIA_AVVISO) uiError(`Memoria del browser quasi piena (${Math.round(m.quota * 100)}%): da Carica partita usa "Esporta tutto"`);
        }

        // Tutto ciò che il gioco tiene nel browser (chiavi dignitas_*), per un file di riserva
        function backupCompleto() {
            const chiavi = {};
            memoriaUsata().chiavi.forEach(({ k }) => { chiavi[k] = localStorage.getItem(k); });
            return { tipo: BACKUP_TIPO, data: new Date().toISOString(), saveVersion: SAVE_VERSION, chiavi };
        }

        function esportaTutto() {
            const blob = new Blob([JSON.stringify(backupCompleto(), null, 1)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `slay-the-dig_tutto_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
            uiMessage('Salvataggi, progressi e opzioni esportati nella cartella dei download');
        }

        // Rimette nel browser un file di "Esporta tutto" (solo chiavi dignitas_*). true se riuscito
        function ripristinaBackup(backup) {
            if (!backup || backup.tipo !== BACKUP_TIPO || !backup.chiavi || typeof backup.chiavi !== 'object') return false;
            const voci = Object.entries(backup.chiavi).filter(([k, v]) => k.startsWith('dignitas_') && typeof v === 'string');
            try { voci.forEach(([k, v]) => localStorage.setItem(k, v)); } catch (e) { return false; }
            return true;
        }

        // Fotografia della partita in corso nel formato attuale
        function buildSaveData() {
            return {
                version: SAVE_VERSION,
                campaignId: stato.currentCampaign.id,
                timestamp: new Date().toLocaleString("it-IT"),
                stato: {
                    stsMapNodes: stato.stsMapNodes.map(n => ({ id: n.id, done: !!n.done, active: !!n.active })),
                    currentNodeId: stato.currentNodeId,
                    procSeed: stato.procSeed || null,  // campagne procedurali: la mappa si rigenera da qui
                    party: stato.party,
                    // Segnali delle reliquie appesi all'elenco degli eroi (JSON.stringify non li salverebbe)
                    partyFlags: { lootExtraChoices: stato.party.lootExtraChoices || 0, specialUses: stato.party.specialUses || null },
                    partyCoins: stato.partyCoins,
                    unlockedRelics: stato.unlockedRelics.map(r => ({ id: r.id, name: r.name, desc: r.desc })),
                    activeCurses: stato.activeCurses,
                    expeditionStats: stato.expeditionStats,
                    onlineOwners: stato.onlineOwners || {},
                    gmProvaMod: gmProvaMod()
                }
            };
        }

        // Le passive agiscono con i segnali scritti sull'eroe (hero_set: bonusLootCoins, challengeRerollMalus...).
        // Un salvataggio può non averli: abilità salvata senza id prima della libreria Abilità, o passiva
        // aggiunta dopo. Al caricamento si rimettono quelli che mancano (mai quelli già presenti).
        function restorePassiveFlags(hero) {
            const ab = hero && hero.chosenAbility;
            if (!ab || ab.isCombatActive) return;
            const lib = LIBRERIA.abilita || {};
            const full = lib[ab.id] || Object.values(lib).find(a => a.name === ab.name) || ab;
            (full.effects || ab.effects || []).forEach(e => {
                if (e.effect === 'hero_set' && hero[e.stat] === undefined) hero[e.stat] = e.val;
            });
        }

        function migrateOldSave() {
            try {
                const old = localStorage.getItem("dignitas_savegame");
                if (old && !localStorage.getItem(saveKey(1))) localStorage.setItem(saveKey(1), old);
                localStorage.removeItem("dignitas_savegame");
            } catch (e) {}
        }

        function hasAnySave() {
            for (let slot = 1; slot <= SAVE_SLOTS; slot++) if (readSave(slot)) return true;
            return false;
        }

        function checkSavedGame() {
            migrateOldSave();
            const btn = document.getElementById("btnContinueSavedGame");
            if (btn) btn.classList.toggle("hidden", !hasAnySave());
        }

        function deleteCurrentSave() {
            if (currentSaveSlot == null) return;
            try { localStorage.removeItem(saveKey(currentSaveSlot)); } catch (e) {}
            checkSavedGame();
        }

        // Riga descrittiva di uno slot: campagna, livello raggiunto, compagnia e data
        function saveSlotHtml(slot, data, actions) {
            const label = slot ? `Slot ${slot}` : 'Partita';
            if (!data) {
                return `<div class="save-slot empty"><div class="save-slot-info"><b>${label}</b><span>Vuoto</span></div><div class="save-slot-actions">${actions}</div></div>`;
            }
            const s = data.stato;
            const camp = campaignsDatabase[data.campaignId] && campaignForPlay(data.campaignId, s.procSeed);
            const nodes = camp ? camp.mapNodes : [];
            const node = nodes.find(n => n.id === s.currentNodeId);
            const maxLevel = Math.max(0, ...nodes.map(n => n.level));
            const levelText = node ? `Livello ${node.level + 1} di ${maxLevel + 1}` : 'Inizio della mappa';
            const heroes = (s.party || []).map(h => esc(h.name)).join(', ');
            return `<div class="save-slot">
                <div class="save-slot-info">
                    <b>${label} · ${esc(camp ? camp.title : data.campaignId)}</b>
                    <span>${levelText} · ${s.partyCoins || 0} Scudi</span>
                    <span>${heroes}</span>
                    <small>Salvata il ${esc(data.timestamp || '')}</small>
                </div>
                <div class="save-slot-actions">${actions}</div>
            </div>`;
        }

        function saveGame() {
            if (!stato.currentCampaign || stato.party.length === 0) {
                uiError("Non c'è nessuna partita in corso da salvare");
                return;
            }
            if (stato.party.every(p => p.hp <= 0)) {
                uiError("La compagnia è caduta: non si può salvare una partita persa");
                return;
            }
            // Si salva solo dalla mappa: dentro un nodo (scontro, mercante, tesoro, prova...) lo stato
            // è a metà e ricaricando si potrebbe rifare il nodo o perdere quello che si è comprato
            if (currentScreenId !== 'screenMap') {
                uiError("Si può salvare solo dalla mappa, tra un nodo e l'altro");
                return;
            }
            const rows = [];
            for (let slot = 1; slot <= SAVE_SLOTS; slot++) {
                const current = slot === currentSaveSlot ? ' <em class="save-current">partita attuale</em>' : '';
                rows.push(saveSlotHtml(slot, readSave(slot), `<button class="btn-small" ${azione('saveToSlot', slot)}>Salva qui</button>${current}`));
            }
            openModal('Salva partita', `<div class="save-slots">${rows.join('')}</div>${memoriaHtml()}`,
                [{ label: 'Esporta in un file', className: 'btn-proceed', onClick: () => downloadSave(buildSaveData()) },
                 { label: 'Annulla', className: 'btn-danger' }], { wide: true });
        }

        function saveToSlot(slot) {
            const existing = readSave(slot);
            const write = () => {
                const saveData = buildSaveData();
                try {
                    writeSave(slot, saveData);
                    currentSaveSlot = slot;
                    checkSavedGame();
                    openModal('Partita salvata', `<p>Salvata nello slot ${slot} (${saveData.timestamp}).</p>${memoriaHtml()}`);
                    avvisaMemoria();
                } catch (e) {
                    openModal('Errore', `<p>Salvataggio non riuscito: memoria piena o non disponibile.</p>${memoriaHtml()}<p>Esporta questa partita in un file, poi elimina i salvataggi vecchi da Carica partita.</p>`,
                        [{ label: 'Esporta questa partita', className: 'btn-proceed', onClick: () => downloadSave(saveData) }, { label: 'Chiudi', className: 'btn-danger' }]);
                }
            };
            closeModal();
            if (existing && slot !== currentSaveSlot) {
                openModal('Sovrascrivere lo slot?', saveSlotHtml(slot, existing, ''),
                    [{ label: 'Annulla', className: 'btn-proceed' }, { label: 'Sovrascrivi', className: 'btn-danger', onClick: () => setTimeout(write, 0) }]);
            } else {
                write();
            }
        }

        function loadGame() {
            migrateOldSave();
            const rows = [];
            for (let slot = 1; slot <= SAVE_SLOTS; slot++) {
                const data = readSave(slot);
                const actions = data
                    ? `<button class="btn-small btn-proceed" ${azione('loadFromSlot', slot)}>Carica</button><button class="btn-small" ${azione('exportSlot', slot)}>Esporta</button><button class="btn-small btn-danger" ${azione('deleteSlot', slot)}>Elimina</button>`
                    : '';
                rows.push(saveSlotHtml(slot, data, actions));
            }
            openModal('Carica partita', `<div class="save-slots">${rows.join('')}</div>${memoriaHtml()}`,
                [{ label: 'Importa da file', className: 'btn-proceed', onClick: () => setTimeout(pickSaveFile, 0) },
                 { label: 'Esporta tutto', className: 'btn-proceed', onClick: () => esportaTutto() },
                 { label: 'Chiudi', className: 'btn-danger' }], { wide: true });
        }

        function deleteSlot(slot) {
            const data = readSave(slot);
            closeModal();
            openModal('Eliminare il salvataggio?', saveSlotHtml(slot, data, ''),
                [{ label: 'Annulla', className: 'btn-proceed', onClick: () => setTimeout(loadGame, 0) },
                 { label: 'Elimina', className: 'btn-danger', onClick: () => {
                    try { localStorage.removeItem(saveKey(slot)); } catch (e) {}
                    if (currentSaveSlot === slot) currentSaveSlot = null;
                    checkSavedGame();
                    setTimeout(loadGame, 0);
                 } }]);
        }

        function loadFromSlot(slot) {
            const data = readSave(slot);
            closeModal();
            if (!data) { openModal('Slot vuoto', '<p>Nessun salvataggio in questo slot.</p>'); return; }
            if (applySaveData(data)) currentSaveSlot = slot;
        }

        // Rimette in gioco un salvataggio (già nel formato attuale). False se non si può caricare.
        function applySaveData(data) {
            try {
                const rawCamp = campaignsDatabase[data.campaignId] && campaignForPlay(data.campaignId, data.stato.procSeed);
                if (!rawCamp) {
                    openModal('Errore', `<p>Campagna del salvataggio non trovata: <b>${esc(data.campaignId)}</b>.</p>`);
                    return false;
                }
                const s = data.stato;

                stato.currentCampaign = rawCamp;
                stato.procSeed = s.procSeed || null;
                // I nodi vengono dalla campagna attuale: del salvataggio si tiene solo lo stato
                stato.stsMapNodes = stato.currentCampaign.mapNodes.map(node => {
                    const saved = (s.stsMapNodes || []).find(n => n.id === node.id);
                    // Un nodo aggiunto alla campagna dopo il salvataggio resta chiuso (non riapre un livello già passato)
                    return saved ? { ...node, done: saved.done, active: saved.active } : { ...node, done: false, active: false };
                });
                enemies = stato.currentCampaign.enemies;
                challengesData = stato.currentCampaign.challenges;
                restsData = stato.currentCampaign.rests;
                merchantsData = stato.currentCampaign.merchants;
                treasuresData = stato.currentCampaign.treasures;
                gameItems = stato.currentCampaign.lootItems && stato.currentCampaign.lootItems.length > 0 ? stato.currentCampaign.lootItems : DEFAULT_GAME_ITEMS;

                campaignHeroes = stato.currentCampaign.heroes || [];
                registerCampaignHeroPortraits(campaignHeroes);
                campaignAbilities = rawCamp.abilities || {};
                campaignArmory = stato.currentCampaign.initialArmory || [];

                stato.party = s.party;
                // Salvataggio fatto durante uno scontro: si tolgono i potenziamenti temporanei rimasti
                expireTempBuffs(true);
                const flags = s.partyFlags || {};
                if (flags.lootExtraChoices) stato.party.lootExtraChoices = flags.lootExtraChoices;
                if (flags.specialUses) stato.party.specialUses = flags.specialUses;  // limiti degli effetti speciali delle reliquie
                // Benedizioni che non esistono più (Grazia, tolta nella versione 1.10)
                stato.party.forEach(h => { if (h.blessings) h.blessings = h.blessings.filter(x => PRAYER_BLESSINGS[x.id]); });
                stato.partyCoins = s.partyCoins || 0;
                stato.activeCurses = s.activeCurses || [];
                stato.onlineOwners = s.onlineOwners || {};
                stato.gmProvaMod = Number(s.gmProvaMod) || 0;
                stato.expeditionStats = Object.assign(newExpeditionStats(), s.expeditionStats || {});
                displayedCoins = stato.partyCoins;
                stato.currentNodeId = s.currentNodeId;
                currentSaveSlot = null;

                // Ricolleghiamo abilità e reliquie ai dati della campagna
                stato.party.forEach(hero => {
                    if (hero.chosenAbility) {
                        const heroAbList = campaignAbilities[hero.name] || [];
                        const fullAb = heroAbList.find(a => a.name === hero.chosenAbility.name || a.id === hero.chosenAbility.id);
                        if (fullAb) hero.chosenAbility = fullAb;
                        restorePassiveFlags(hero);
                    }
                });

                // Ricollegate alla libreria per id (il contenuto aggiornato, l'id resta quello salvato)
                stato.unlockedRelics = (s.unlockedRelics || []).map(savedRelic =>
                    LIBRERIA.reliquie[savedRelic.id] ? { ...LIBRERIA.reliquie[savedRelic.id], id: savedRelic.id } : savedRelic);

                document.getElementById('mapCampaignHeader').textContent = `Mappa: ${stato.currentCampaign.title}`;
                updatePartyStatusBars();
                startMap();
                return true;
            } catch (err) {
                openModal('Errore', '<p>Errore durante il caricamento del salvataggio.</p>');
                console.error(err);
                return false;
            }
        }

        /* ---------- Esporta e importa: un salvataggio diventa un file .json da copiare su un altro PC ---------- */
        function saveFileName(data) {
            const date = new Date().toISOString().slice(0, 10);
            return `slay-the-dig_${data.campaignId}_${date}.json`;
        }

        function downloadSave(data) {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = saveFileName(data);
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
            uiMessage('Salvataggio esportato nella cartella dei download');
        }

        function exportSlot(slot) {
            const data = readSave(slot);
            if (data) downloadSave(data);
        }

        function pickSaveFile() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,application/json';
            input.addEventListener('change', () => {
                const file = input.files && input.files[0];
                if (!file) return;
                file.text().then(importSaveText).catch(() => openModal('Errore', '<p>Impossibile leggere il file.</p>'));
            });
            input.click();
        }

        // Controlla il file importato e chiede in quale slot metterlo
        function importSaveText(text) {
            let data = null;
            let grezzo = null;
            try { grezzo = JSON.parse(text); } catch (e) {}
            // File di "Esporta tutto": rimette salvataggi, progressi, compendio e opzioni (chiede conferma)
            if (grezzo && grezzo.tipo === BACKUP_TIPO) {
                const n = Object.keys(grezzo.chiavi || {}).length;
                openModal('Ripristinare tutto?', `<p>Il file contiene ${n} voci (salvataggi, progressi, compendio, opzioni) del ${esc(String(grezzo.data || '').slice(0, 10))}.</p><p>Quelle con lo stesso nome nel browser vengono sostituite.</p>`,
                    [{ label: 'Annulla', className: 'btn-proceed' }, { label: 'Ripristina', className: 'btn-danger', onClick: () => {
                        if (!ripristinaBackup(grezzo)) { setTimeout(() => openModal('Errore', '<p>Ripristino non riuscito: memoria piena o file rovinato.</p>'), 0); return; }
                        checkSavedGame();
                        uiMessage('Ripristinato: ricarica la pagina per vedere progressi e opzioni');
                    } }]);
                return;
            }
            try { data = migrateSave(grezzo); } catch (e) {}
            if (!data) {
                openModal('File non valido', '<p>Il file non è un salvataggio di Slay the Dig, oppure è di una versione più recente del gioco.</p>');
                return;
            }
            if (!campaignsDatabase[data.campaignId]) {
                openModal('Campagna mancante', `<p>Il salvataggio è della campagna <b>${esc(data.campaignId)}</b>, che in questo gioco non c'è.</p>`);
                return;
            }
            window.pendingImportedSave = data;
            const rows = [saveSlotHtml(0, data, '')];
            for (let slot = 1; slot <= SAVE_SLOTS; slot++) {
                rows.push(saveSlotHtml(slot, readSave(slot), `<button class="btn-small btn-proceed" ${azione('storeImportedSave', slot)}>Importa qui</button>`));
            }
            openModal('Importa salvataggio', `<p>Salvataggio letto dal file:</p><div class="save-slots">${rows.join('')}</div>`,
                [{ label: 'Annulla', className: 'btn-danger' }], { wide: true });
        }

        function storeImportedSave(slot, confirmed = false) {
            const data = window.pendingImportedSave;
            if (!data) return;
            const existing = readSave(slot);
            if (existing && !confirmed) {
                closeModal();
                openModal('Sovrascrivere lo slot?', saveSlotHtml(slot, existing, ''),
                    [{ label: 'Annulla', className: 'btn-proceed', onClick: () => setTimeout(() => importSaveText(JSON.stringify(data)), 0) },
                     { label: 'Sovrascrivi', className: 'btn-danger', onClick: () => setTimeout(() => storeImportedSave(slot, true), 0) }]);
                return;
            }
            try {
                writeSave(slot, data);
            } catch (e) {
                openModal('Errore', '<p>Importazione non riuscita: memoria piena o non disponibile.</p>');
                return;
            }
            window.pendingImportedSave = null;
            checkSavedGame();
            closeModal();
            setTimeout(loadGame, 0);
            uiMessage(`Salvataggio importato nello slot ${slot}`);
        }

        window.addEventListener('DOMContentLoaded', () => {
            checkSavedGame();
        });
