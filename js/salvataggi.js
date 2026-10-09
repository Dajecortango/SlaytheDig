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
           Versione 3: { version, campaignId, timestamp, stato: { stsMapNodes: [{ id, done, active }],
           currentNodeId, party, partyFlags, partyCoins, unlockedRelics: [{ id, name, desc }],
           activeCurses: [{ id, text }], expeditionStats } }.
           I nodi tengono solo lo stato: il contenuto viene dalla campagna attuale.
           Per cambiare il formato: alza SAVE_VERSION e aggiungi in SAVE_MIGRATIONS la funzione
           che porta un salvataggio dalla versione precedente a quella nuova. */
        const SAVE_VERSION = 3;
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
            }
        };

        // Porta un salvataggio di qualunque versione al formato attuale (null se non è un salvataggio valido)
        function migrateSave(data) {
            if (!data || typeof data !== 'object' || !data.campaignId) return null;
            let version = data.version || 1;
            while (version < SAVE_VERSION) {
                const step = SAVE_MIGRATIONS[version];
                if (!step) return null;
                data = step(data);
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
                    partyFlags: { atamanoUsed: !!stato.party.atamanoUsed, sigilloCharges: stato.party.sigilloCharges || 0 },
                    partyCoins: stato.partyCoins,
                    unlockedRelics: stato.unlockedRelics.map(r => ({ id: r.id, name: r.name, desc: r.desc })),
                    activeCurses: stato.activeCurses,
                    expeditionStats: stato.expeditionStats
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
                    <span>${levelText} · ${s.partyCoins || 0} monete</span>
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
            openModal('Salva partita', `<div class="save-slots">${rows.join('')}</div>`,
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
                    openModal('Partita salvata', `<p>Salvata nello slot ${slot} (${saveData.timestamp}).</p>`);
                } catch (e) {
                    openModal('Errore', '<p>Salvataggio non riuscito: memoria piena o non disponibile.</p>');
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
            openModal('Carica partita', `<div class="save-slots">${rows.join('')}</div>`,
                [{ label: 'Importa da file', className: 'btn-proceed', onClick: () => setTimeout(pickSaveFile, 0) },
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
                if (flags.atamanoUsed) stato.party.atamanoUsed = true;
                if (flags.sigilloCharges) stato.party.sigilloCharges = flags.sigilloCharges;
                stato.partyCoins = s.partyCoins || 0;
                stato.activeCurses = s.activeCurses || [];
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
            try { data = migrateSave(JSON.parse(text)); } catch (e) {}
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
