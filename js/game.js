        /* ==========================================================================
           DATABASE DELLE CAMPAGNE
           ========================================================================== */
        // I dati di ogni campagna stanno in data/campagne/<id>.js (JSON puro, caricati prima di questo file).
        // L'ordine dei tag <script> in index.html decide l'ordine delle campagne nel menu.
        const campaignsDatabase = window.CAMPAIGNS || {};

        /* ==========================================================================
           STATO GLOBALE RUNTIME
           ========================================================================== */
        let currentCampaign = null;
        let stsMapNodes = [];
        let enemies = {};
        let challengesData = {};
        let restsData = {};
        let merchantsData = {};
        let treasuresData = {};

        let campaignHeroes = [];
        let campaignAbilities = {};
        let campaignArmory = [];

        let partySize = 3;
        let party = [];
        let partyCoins = 0;
        let unlockedRelics = [];
        let activeCurses = [];
        let currentNodeId = null;
        let challengeState = null;

        // Stato della presentazione: schermata attiva, fase e round del combattimento, statistiche
        let currentScreenId = 'screenStart';
        let combatPhase = 'none';
        let combatRound = 0;
        const newExpeditionStats = () => ({ combatsWon: 0, challengesPassed: 0, challengesFailed: 0, coinsEarned: 0, itemsFound: 0 });
        let expeditionStats = newExpeditionStats();
	function hasRelic(relicName) {
    return unlockedRelics.some(r => r.name === relicName);
}

// Le maledizioni sono salvate come testo "Nome (descrizione)": si riconoscono dal nome iniziale
function hasCurse(curseName) {
    return activeCurses.some(c => c.startsWith(curseName));
}

function breakRelic(relicName) {
    const idx = unlockedRelics.findIndex(r => r.name === relicName);
    if (idx > -1) {
        unlockedRelics.splice(idx, 1);
        updatePartyStatusBars();
    }
}

        // Interprete degli effetti descritti nei dati delle campagne (campo "effects").
        // Gli effetti "hero_*" agiscono sull'eroe passato, gli altri sull'intera compagnia.
        function applyEffects(effects, hero) {
            (effects || []).forEach(e => {
                switch (e.effect) {
                    case 'hero_stat': hero[e.stat] = (hero[e.stat] || 0) + e.val; break;
                    case 'hero_set': hero[e.stat] = e.val; break;
                    case 'party_stat': party.forEach(h => { h[e.stat] = Math.max(0, (h[e.stat] || 0) + e.val); }); break;
                    case 'party_max_hp': party.forEach(h => { h.maxHp += e.val; h.hp += e.val; }); break;
                    case 'party_damage': party.forEach(h => { h.hp = Math.max(1, h.hp - e.val); }); break;
                    case 'coins': partyCoins = Math.max(0, partyCoins + e.val); break;
                    case 'add_curse': activeCurses.push(e.text); break;
                    default: console.warn('Effetto sconosciuto:', e);
                }
            });
        }
	


        const DEFAULT_GAME_ITEMS = [
            { id: "spada_affilata", name: "Spada affilata", rarity: "raro", str: 1, dmg: 1, desc: "+1 Forza, +1 Danno" },
            { id: "ascia_pesante", name: "Ascia pesante", rarity: "raro", dmg: 2, desc: "+2 Danni" },
            { id: "armatura_leggera_loot", name: "Armatura leggera", rarity: "comune", armor: 1, desc: "+1 Armatura" },
            { id: "armatura_pesante_loot", name: "Armatura pesante", rarity: "raro", armor: 2, att_penalty: 1, desc: "+2 Armatura, -1 Tiro Attacco" },
            { id: "pozione", name: "Pozione di guarigione", rarity: "raro", type: "consumable_full", desc: "Consumabile: Recupera 100% HP" },
            { id: "amuleto", name: "Amuleto sacro", rarity: "comune", fth: 1, desc: "+1 Fede" },
            { id: "anello", name: "Anello della concentrazione", rarity: "comune", int: 1, desc: "+1 Intelligenza" },
            { id: "scudo_pesante", name: "Scudo pesante", rarity: "raro", armor: 1, def_bonus: 1, desc: "+1 Armatura, +1 Tiro Difesa" }
        ];
        let gameItems = DEFAULT_GAME_ITEMS;

        /* ==========================================================================
           SISTEMA DI SALVATAGGIO / CARICAMENTO (LOCALSTORAGE)
           ========================================================================== */
        // Tre slot di salvataggio in localStorage. Il vecchio salvataggio unico finisce nello slot 1.
        const SAVE_SLOTS = 3;
        const saveKey = slot => `dignitas_save_${slot}`;
        let currentSaveSlot = null;  // slot della partita in corso (per sovrascriverlo e cancellarlo alla sconfitta)

        function readSave(slot) {
            try { return JSON.parse(localStorage.getItem(saveKey(slot)) || 'null'); } catch (e) { return null; }
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
            if (!data) {
                return `<div class="save-slot empty"><div class="save-slot-info"><b>Slot ${slot}</b><span>Vuoto</span></div><div class="save-slot-actions">${actions}</div></div>`;
            }
            const camp = campaignsDatabase[data.campaignId];
            const node = (data.stsMapNodes || []).find(n => n.id === data.currentNodeId);
            const maxLevel = Math.max(0, ...(data.stsMapNodes || []).map(n => n.level));
            const levelText = node ? `Livello ${node.level + 1} di ${maxLevel + 1}` : 'Inizio della mappa';
            const heroes = (data.party || []).map(h => esc(h.name)).join(', ');
            return `<div class="save-slot">
                <div class="save-slot-info">
                    <b>Slot ${slot} · ${esc(camp ? camp.title : data.campaignId)}</b>
                    <span>${levelText} · ${data.partyCoins || 0} monete</span>
                    <span>${heroes}</span>
                    <small>Salvata il ${esc(data.timestamp || '')}</small>
                </div>
                <div class="save-slot-actions">${actions}</div>
            </div>`;
        }

        function saveGame() {
            if (!currentCampaign || party.length === 0) {
                alert("Non c'è nessuna partita in corso da salvare!");
                return;
            }
            if (party.every(p => p.hp <= 0)) {
                alert("La compagnia è caduta: non si può salvare una partita persa.");
                return;
            }
            const rows = [];
            for (let slot = 1; slot <= SAVE_SLOTS; slot++) {
                const current = slot === currentSaveSlot ? ' <em class="save-current">partita attuale</em>' : '';
                rows.push(saveSlotHtml(slot, readSave(slot), `<button class="btn-small" onclick="saveToSlot(${slot})">Salva qui</button>${current}`));
            }
            openModal('Salva partita', `<div class="save-slots">${rows.join('')}</div>`, [{ label: 'Annulla', className: 'btn-danger' }], { wide: true });
        }

        function saveToSlot(slot) {
            const existing = readSave(slot);
            const write = () => {
                const saveData = {
                    campaignId: currentCampaign.id,
                    party: party,
                    partyCoins: partyCoins,
                    unlockedRelics: unlockedRelics.map(r => ({ name: r.name, desc: r.desc })),
                    activeCurses: activeCurses,
                    stsMapNodes: stsMapNodes,
                    currentNodeId: currentNodeId,
                    expeditionStats: expeditionStats,
                    timestamp: new Date().toLocaleString("it-IT")
                };
                try {
                    localStorage.setItem(saveKey(slot), JSON.stringify(saveData));
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
                    ? `<button class="btn-small btn-proceed" onclick="loadFromSlot(${slot})">Carica</button><button class="btn-small btn-danger" onclick="deleteSlot(${slot})">Elimina</button>`
                    : '';
                rows.push(saveSlotHtml(slot, data, actions));
            }
            openModal('Carica partita', `<div class="save-slots">${rows.join('')}</div>`, [{ label: 'Chiudi', className: 'btn-danger' }], { wide: true });
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

            try {
                const rawCamp = campaignsDatabase[data.campaignId];
                if (!rawCamp) {
                    openModal('Errore', '<p>Campagna del salvataggio non trovata.</p>');
                    return;
                }

                currentCampaign = JSON.parse(JSON.stringify(rawCamp));
                stsMapNodes = data.stsMapNodes;
                enemies = currentCampaign.enemies;
                challengesData = currentCampaign.challenges;
                restsData = currentCampaign.rests;
                merchantsData = currentCampaign.merchants;
                treasuresData = currentCampaign.treasures;
                gameItems = currentCampaign.lootItems && currentCampaign.lootItems.length > 0 ? currentCampaign.lootItems : DEFAULT_GAME_ITEMS;

                campaignHeroes = currentCampaign.heroes || [];
                registerCampaignHeroPortraits(campaignHeroes);
                campaignAbilities = rawCamp.abilities || {};
                campaignArmory = currentCampaign.initialArmory || [];

                party = data.party;
                partyCoins = data.partyCoins;
                activeCurses = data.activeCurses || [];
                expeditionStats = Object.assign(newExpeditionStats(), data.expeditionStats || {});
                displayedCoins = data.partyCoins;
                currentNodeId = data.currentNodeId;
                currentSaveSlot = slot;

                // Ricolleghiamo abilità e reliquie ai dati della campagna
                party.forEach(hero => {
                    if (hero.chosenAbility) {
                        const heroAbList = campaignAbilities[hero.name] || [];
                        const fullAb = heroAbList.find(a => a.name === hero.chosenAbility.name || a.id === hero.chosenAbility.id);
                        if (fullAb) hero.chosenAbility = fullAb;
                    }
                });

                unlockedRelics = (data.unlockedRelics || []).map(savedRelic => {
                    for (const k in challengesData) {
                        if (challengesData[k].reward && challengesData[k].reward.name === savedRelic.name) {
                            return challengesData[k].reward;
                        }
                    }
                    return savedRelic;
                });

                document.getElementById('mapCampaignHeader').textContent = `Mappa: ${currentCampaign.title}`;
                updatePartyStatusBars();
                startMap();
            } catch (err) {
                openModal('Errore', '<p>Errore durante il caricamento del salvataggio.</p>');
                console.error(err);
            }
        }

        window.addEventListener('DOMContentLoaded', () => {
            checkSavedGame();
        });

        function goToCampaigns() {
            showScreen('screenCampaigns');
            const grid = document.getElementById('campaignsGridList');
            const campaigns = Object.values(campaignsDatabase);
            grid.innerHTML = campaigns.map((c, idx) => `
                <div class="campaign-card" tabindex="0" role="button" data-index="${idx}" onclick="onCampaignCardClick(${idx}, '${c.id}')" onkeydown="if(event.key==='Enter'){selectCampaign('${c.id}')}">
                    <div>
                        <div class="campaign-cover"><img src="${c.coverImage}" alt="${c.title}"></div>
                        <span class="campaign-badge">${c.badge}</span>
                        <h3>${c.title}</h3>
                        <p>${c.description}</p>
                    </div>
                    <button class="btn-small" tabindex="-1">Scegli Spedizione</button>
                </div>
            `).join('');

            document.getElementById('campaignDots').innerHTML = campaigns.map((c, idx) => `
                <button class="carousel-dot" onclick="goToCampaignSlide(${idx})" aria-label="${c.title}"></button>
            `).join('') + `<span class="carousel-counter" id="campaignCounter"></span>`;

            bindCampaignCarousel();
            activeCampaignSlide = 0;
            requestAnimationFrame(() => {
                grid.style.scrollBehavior = 'auto';
                goToCampaignSlide(0);
                grid.style.scrollBehavior = '';
            });
        }

        /* ---------- Carosello campagne ---------- */
        let activeCampaignSlide = 0;
        let campaignWheelLock = false;

        function campaignCards() {
            return Array.from(document.querySelectorAll('#campaignsGridList .campaign-card'));
        }

        function goToCampaignSlide(idx) {
            const track = document.getElementById('campaignsGridList');
            const cards = campaignCards();
            if (cards.length === 0) return;
            idx = Math.max(0, Math.min(cards.length - 1, idx));
            const card = cards[idx];
            track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2 });
            activeCampaignSlide = idx;
            updateCampaignCarouselState();
        }

        /* "Prova nel gioco" dall'editor: index.html?prova=<id> carica la campagna in modifica
           (salvata dall'editor in IndexedDB, chiave "playtest") solo per questa scheda del browser. */
        (function loadPlaytestCampaign() {
            const id = new URLSearchParams(location.search).get('prova');
            if (!id || !window.indexedDB) return;
            const req = indexedDB.open('dignitas_editor', 1);
            req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains('kv')) req.result.createObjectStore('kv'); };
            req.onsuccess = () => {
                const get = req.result.transaction('kv', 'readonly').objectStore('kv').get('playtest');
                get.onsuccess = () => {
                    const data = get.result;
                    if (!data || !data.campaign || data.campaign.id !== id) return;
                    // Le immagini caricate nell'editor e non ancora salvate arrivano come file: le si mostra da memoria
                    const urls = new Map((data.assets || []).map(([path, blob]) => [path, URL.createObjectURL(blob)]));
                    const fix = path => urls.get(path) || path;
                    const camp = data.campaign;
                    camp.coverImage = fix(camp.coverImage);
                    (camp.mapNodes || []).forEach(n => { n.image = fix(n.image); });
                    (camp.heroes || []).forEach(h => {
                        if (h.portrait) h.portrait = fix(h.portrait);
                        if (h.portraitWounded) h.portraitWounded = fix(h.portraitWounded);
                    });
                    camp.title = `[Prova] ${camp.title}`;
                    camp.badge = "Prova dall'editor";
                    campaignsDatabase[camp.id] = camp;
                    // Apre subito la scelta campagna con la campagna di prova al centro
                    goToCampaigns();
                    const idx = Object.keys(campaignsDatabase).indexOf(camp.id);
                    setTimeout(() => goToCampaignSlide(idx), 50);
                };
            };
        })();

        function scrollCampaigns(dir) {
            goToCampaignSlide(activeCampaignSlide + dir);
        }

        // Clic su una scheda laterale: la porta al centro; clic sulla scheda centrale: la sceglie
        function onCampaignCardClick(idx, campaignId) {
            if (idx !== activeCampaignSlide) {
                goToCampaignSlide(idx);
                return;
            }
            selectCampaign(campaignId);
        }

        function updateCampaignCarouselState() {
            const track = document.getElementById('campaignsGridList');
            const cards = campaignCards();
            if (cards.length === 0) return;

            const center = track.scrollLeft + track.clientWidth / 2;
            let nearest = 0;
            let bestDist = Infinity;
            cards.forEach((card, i) => {
                const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
                if (dist < bestDist) { bestDist = dist; nearest = i; }
            });
            activeCampaignSlide = nearest;

            cards.forEach((card, i) => card.classList.toggle('is-active', i === nearest));
            document.querySelectorAll('#campaignDots .carousel-dot').forEach((dot, i) => dot.classList.toggle('is-active', i === nearest));
            document.getElementById('campaignCounter').textContent = `${nearest + 1} / ${cards.length}`;
            document.getElementById('campaignPrev').disabled = nearest === 0;
            document.getElementById('campaignNext').disabled = nearest === cards.length - 1;
        }

        function bindCampaignCarousel() {
            const track = document.getElementById('campaignsGridList');
            if (track.dataset.bound) return;
            track.dataset.bound = 'true';

            let rafPending = false;
            track.addEventListener('scroll', () => {
                if (rafPending) return;
                rafPending = true;
                requestAnimationFrame(() => { rafPending = false; updateCampaignCarouselState(); });
            });

            // La rotella del mouse scorre di una campagna alla volta
            track.addEventListener('wheel', e => {
                const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
                if (Math.abs(delta) < 4) return;
                e.preventDefault();
                if (campaignWheelLock) return;
                campaignWheelLock = true;
                scrollCampaigns(delta > 0 ? 1 : -1);
                setTimeout(() => { campaignWheelLock = false; }, 450);
            }, { passive: false });

            window.addEventListener('resize', () => {
                if (!document.getElementById('screenCampaigns').classList.contains('hidden')) goToCampaignSlide(activeCampaignSlide);
            });

            document.addEventListener('keydown', e => {
                if (document.getElementById('screenCampaigns').classList.contains('hidden')) return;
                if (!document.getElementById('wc3Modal').classList.contains('hidden')) return;
                if (e.key === 'ArrowLeft') { e.preventDefault(); scrollCampaigns(-1); }
                else if (e.key === 'ArrowRight') { e.preventDefault(); scrollCampaigns(1); }
            });
        }

        function selectCampaign(campaignId) {
            const rawCamp = campaignsDatabase[campaignId];
            if(!rawCamp) return;

            currentCampaign = JSON.parse(JSON.stringify(rawCamp));

            stsMapNodes = currentCampaign.mapNodes;
            enemies = currentCampaign.enemies;
            challengesData = currentCampaign.challenges;
            restsData = currentCampaign.rests;
            merchantsData = currentCampaign.merchants;
            treasuresData = currentCampaign.treasures;

            campaignHeroes = currentCampaign.heroes || [];
            registerCampaignHeroPortraits(campaignHeroes);
            campaignAbilities = rawCamp.abilities || {};
            campaignArmory = currentCampaign.initialArmory || [];

            gameItems = currentCampaign.lootItems && currentCampaign.lootItems.length > 0 ? currentCampaign.lootItems : DEFAULT_GAME_ITEMS;
            currentSaveSlot = null;  // nuova partita: nessuno slot finché non la si salva

            document.getElementById('campaignIntroTitle').textContent = currentCampaign.title;
            document.getElementById('campaignIntroImg').src = currentCampaign.coverImage;
            document.getElementById('campaignIntroDesc').innerHTML = `<strong>Descrizione:</strong> ${currentCampaign.introText}`;
            document.getElementById('mapCampaignHeader').textContent = `Mappa: ${currentCampaign.title}`;

            setupPartySizeSelector();
            startPartyCreation();
        }

        function setupPartySizeSelector() {
            const sizeSelect = document.getElementById('partySizeSelect');
            const totalHeroes = campaignHeroes.length;
            const minSize = Math.min(3, totalHeroes);
            const maxSize = Math.min(5, totalHeroes);

            sizeSelect.innerHTML = '';
            for(let s = minSize; s <= maxSize; s++) {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = `${s} Eroi`;
                if(s === minSize) opt.selected = true;
                sizeSelect.appendChild(opt);
            }
            document.getElementById('partyStepText').textContent = `Scegli quanti membri comporranno la spedizione (${minSize} - ${maxSize}):`;
        }

        const MENU_SCENE_SCREENS = ['screenStart', 'screenCampaigns'];

        // Video di sfondo della schermata principale: muto, in riproduzione solo quando la schermata è visibile
        // (e con gli effetti animati attivi). Se non si carica resta la scena disegnata.
        function updateMenuVideo() {
            const video = document.getElementById('menuVideo');
            if (!video) return;
            video.muted = true;
            const shouldPlay = document.body.classList.contains('menu-start') && !document.body.classList.contains('no-anim');
            if (shouldPlay) video.play().catch(() => {});
            else video.pause();
        }

        (function initMenuVideo() {
            const video = document.getElementById('menuVideo');
            if (!video) return;
            video.muted = true;
            video.addEventListener('playing', () => document.body.classList.add('menu-video-ok'));
            video.addEventListener('error', () => document.body.classList.remove('menu-video-ok'));
        })();

        function showScreen(screenId) {
            currentScreenId = screenId;
            if (screenId !== 'screenCombat') combatPhase = 'none';
            document.querySelectorAll('.container > div').forEach(div => div.classList.add('hidden'));
            // Menu iniziale e scelta campagna: scena a tutto schermo senza barre, come i menu di Warcraft III
            document.body.classList.toggle('menu-mode', MENU_SCENE_SCREENS.includes(screenId));
            document.body.classList.toggle('menu-start', screenId === 'screenStart');
            updateMenuVideo();
            const screen = document.getElementById(screenId);
            screen.classList.remove('hidden');
            screen.classList.remove('screen-enter');
            void screen.offsetWidth;
            screen.classList.add('screen-enter');
            document.getElementById('gameContainer').scrollTop = 0;
            updatePartyStatusBars();
            updateMenuMusic(screenId);
            startPendingTypewriters(screen);
        }

        /* ---------- Audio: musica dei menu ed effetti sonori ---------- */
        const MENU_MUSIC_SCREENS = ['screenStart', 'screenCampaigns', 'screenParty'];
        let currentAudioScreen = 'screenStart';
        let soundMuted = false;
        let musicFadeTimer = null;
        try { soundMuted = localStorage.getItem('dignitas_muted') === '1'; } catch (e) {}

        function fadeMusicTo(target, onDone) {
            const music = document.getElementById('menuMusic');
            clearInterval(musicFadeTimer);
            musicFadeTimer = setInterval(() => {
                const step = 0.05;
                const next = music.volume + Math.sign(target - music.volume) * step;
                if (Math.abs(target - music.volume) <= step) {
                    music.volume = target;
                    clearInterval(musicFadeTimer);
                    if (onDone) onDone();
                } else {
                    music.volume = Math.min(1, Math.max(0, next));
                }
            }, 60);
        }

        // Avvia o ferma la musica in base alla schermata attiva
        function updateMenuMusic(screenId) {
            if (screenId) currentAudioScreen = screenId;
            const music = document.getElementById('menuMusic');
            const shouldPlay = MENU_MUSIC_SCREENS.includes(currentAudioScreen);

            if (shouldPlay && music.paused) {
                music.volume = 0;
                music.play().then(() => fadeMusicTo(gameOptions.musicVolume)).catch(() => {
                    // Il browser blocca l'audio finché l'utente non interagisce con la pagina
                });
            } else if (!shouldPlay && !music.paused) {
                fadeMusicTo(0, () => { music.pause(); music.currentTime = 0; });
            }
        }

        // Riproduce un effetto sonoro rispettando il silenziamento globale
        function playSfx(src, volume = 0.7) {
            if (soundMuted) return;
            const sfx = new Audio(src);
            sfx.volume = Math.min(1, volume * gameOptions.sfxVolume);
            sfx.play().catch(() => {});
        }

        // Suoni dei colpi generati con Web Audio (nessun file audio necessario):
        // 'armor' = clangore metallico, 'hit' = colpo sordo sugli HP di un eroe, 'enemy' = colpo sul nemico
        let sfxCtx = null;
        function synthSfx(kind) {
            if (soundMuted || !gameOptions.sfxVolume) return;
            try { sfxCtx = sfxCtx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
            const ctx = sfxCtx;
            if (ctx.state === 'suspended') ctx.resume();
            const t = ctx.currentTime;
            const out = ctx.createGain();
            out.gain.value = 0.5 * gameOptions.sfxVolume;
            out.connect(ctx.destination);

            // Tono breve con inviluppo che si spegne: base per i suoni leggeri (passaggio del mouse, dadi)
            const tone = (type, from, to, start, dur, peak, target = out) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(from, t + start);
                osc.frequency.exponentialRampToValueAtTime(to, t + start + dur);
                gain.gain.setValueAtTime(0.0001, t + start);
                gain.gain.exponentialRampToValueAtTime(peak, t + start + 0.008);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + start + dur);
                osc.connect(gain).connect(target);
                osc.start(t + start);
                osc.stop(t + start + dur + 0.02);
            };
            // Colpetto di rumore filtrato (legno/osso che batte)
            const tick = (start, freq, peak) => {
                const len = Math.floor(ctx.sampleRate * 0.03);
                const buf = ctx.createBuffer(1, len, ctx.sampleRate);
                const d = buf.getChannelData(0);
                for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
                const src = ctx.createBufferSource();
                src.buffer = buf;
                const band = ctx.createBiquadFilter();
                band.type = 'bandpass';
                band.frequency.value = freq;
                band.Q.value = 2.5;
                const g = ctx.createGain();
                g.gain.value = peak;
                src.connect(band).connect(g).connect(out);
                src.start(t + start);
            };

            if (kind === 'hover') {
                // Leggero "tic" metallico al passaggio del mouse sui pulsanti
                tone('sine', 1900, 1500, 0, 0.05, 0.05);
                return;
            }
            if (kind === 'dice') {
                // Dadi che rotolano: colpetti irregolari per circa mezzo secondo
                let at = 0;
                for (let i = 0; i < 8; i++) {
                    tick(at, 1800 + Math.random() * 1600, 0.35 + Math.random() * 0.3);
                    at += 0.04 + Math.random() * 0.04;
                }
                return;
            }
            if (kind === 'dice-land') {
                tick(0, 1200, 0.6);
                return;
            }
            if (kind === 'six') {
                // 6 naturale: accordo luminoso ascendente
                tick(0, 1200, 0.6);
                [660, 880, 1320].forEach((f, i) => tone('triangle', f, f, 0.03 + i * 0.07, 0.45, 0.16));
                return;
            }
            if (kind === 'one') {
                // 1 naturale: nota grave che scende
                tick(0, 900, 0.6);
                const low = ctx.createBiquadFilter();
                low.type = 'lowpass';
                low.frequency.value = 900;
                low.connect(out);
                tone('sawtooth', 220, 95, 0.03, 0.45, 0.2, low);
                return;
            }

            if (kind === 'armor') {
                // Toni acuti non armonici che si spengono in fretta, come metallo colpito
                [880, 1370, 2120].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'square';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.18 / (i + 1), t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
                    osc.connect(gain).connect(out);
                    osc.start(t);
                    osc.stop(t + 0.4);
                });
                return;
            }

            // Colpo sordo: breve rumore filtrato più un tonfo grave che scende di tono
            const low = kind === 'enemy' ? 90 : 130;
            const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.15), ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = kind === 'enemy' ? 900 : 600;
            const noiseGain = ctx.createGain();
            noiseGain.gain.value = 0.6;
            noise.connect(filter).connect(noiseGain).connect(out);
            noise.start(t);

            const thud = ctx.createOscillator();
            const thudGain = ctx.createGain();
            thud.type = 'sine';
            thud.frequency.setValueAtTime(low, t);
            thud.frequency.exponentialRampToValueAtTime(45, t + 0.2);
            thudGain.gain.setValueAtTime(0.7, t);
            thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            thud.connect(thudGain).connect(out);
            thud.start(t);
            thud.stop(t + 0.3);
        }

        function diceOutcomeSfx(value) {
            synthSfx(value === 6 ? 'six' : value === 1 ? 'one' : 'dice-land');
        }

        // Suono leggero al passaggio del mouse su pulsanti e schede (una volta per elemento, non sui disattivati)
        let lastHoverTarget = null;
        let lastHoverTime = 0;
        document.addEventListener('mouseover', e => {
            const target = e.target.closest(CLICKABLE_SELECTOR);
            if (target === lastHoverTarget) return;
            lastHoverTarget = target;
            if (!target || target.disabled) return;
            const now = performance.now();
            if (now - lastHoverTime < 45) return;
            lastHoverTime = now;
            synthSfx('hover');
        });

        // Suono di clic su ogni pulsante e scheda cliccabile, in tutte le schermate
        const CLICK_SFX = 'audio/click.ogg';
        const CLICKABLE_SELECTOR = 'button, [role="button"], .campaign-card, .armory-btn';
        const clickSfxPreload = new Audio(CLICK_SFX);
        clickSfxPreload.preload = 'auto';

        document.addEventListener('click', e => {
            const target = e.target.closest(CLICKABLE_SELECTOR);
            if (!target || target.disabled) return;
            playSfx(CLICK_SFX, 0.8);
        }, true);

        function applySoundState() {
            // Il video dei menu resta sempre muto
            document.querySelectorAll('audio, video:not(#menuVideo)').forEach(media => { media.muted = soundMuted; });
        }

        // Il silenziamento si imposta dalla finestra Opzioni
        function setSoundMuted(muted) {
            soundMuted = muted;
            try { localStorage.setItem('dignitas_muted', soundMuted ? '1' : '0'); } catch (e) {}
            applySoundState();
            updateMenuMusic();
        }

        // I browser avviano l'audio solo dopo la prima interazione dell'utente
        function unlockAudioOnce() {
            updateMenuMusic();
            document.removeEventListener('pointerdown', unlockAudioOnce);
            document.removeEventListener('keydown', unlockAudioOnce);
        }
        document.addEventListener('pointerdown', unlockAudioOnce);
        document.addEventListener('keydown', unlockAudioOnce);

        window.addEventListener('DOMContentLoaded', () => {
            applySoundState();
            updateMenuMusic('screenStart');
        });

        function updatePartyStatusBars() {
            const container = document.getElementById('partyStatusBarContent');
            animateCoinCounter(partyCoins);

            document.getElementById('topBarRelics').textContent = unlockedRelics.length;
            document.getElementById('topBarRelicsWrap').dataset.tip = unlockedRelics.length > 0
                ? `Reliquie||${unlockedRelics.map(r => `<b style="color:var(--relic-color)">${r.name}</b>: ${r.desc}`).join('<br>')}`
                : 'Reliquie||Nessuna reliquia ottenuta.';

            document.getElementById('topBarCurses').textContent = activeCurses.length;
            document.getElementById('topBarCursesWrap').dataset.tip = activeCurses.length > 0
                ? `Maledizioni||${activeCurses.join('<br>')}`
                : 'Maledizioni||Nessuna maledizione attiva.';

            document.body.classList.toggle('no-party', party.length === 0);
            document.getElementById('consoleCount').textContent = party.length > 0
                ? `${party.filter(p => p.hp > 0).length}/${party.length}`
                : '—';

            if (party.length === 0) {
                container.innerHTML = `<div class="console-empty">Nessun eroe reclutato</div>`;
                return;
            }

            container.innerHTML = party.map(heroCardHtml).join('');
            fxDiffHeroes();
            renderTurnBar();
        }

        window.useConsumableFromTopbar = function(heroName, itemIdx) {
            let hero = party.find(p => p.name === heroName);
            if(!hero) return;
            let item = hero.items[itemIdx];
            if(!item || !item.type || !item.type.startsWith('consumable')) return;

            openModal(
                item.name,
                `<p>${item.desc}</p><p>A quale membro della spedizione vuoi applicarlo?</p>`,
                party.map(p => ({
                    label: `${p.name} (HP ${p.hp}/${p.maxHp})`,
                    disabled: p.hp <= 0,
                    onClick: () => useConsumable(hero.name, itemIdx, p.name)
                })).concat([{ label: 'Annulla', className: 'btn-danger' }])
            );
        };


        function startPartyCreation() {
            showScreen('screenParty');
            party = [];
            partyCoins = 0;
            displayedCoins = 0;
            unlockedRelics = [];
            activeCurses = [];
            expeditionStats = newExpeditionStats();
            document.getElementById('partyConfigArea').classList.remove('hidden');
            document.getElementById('heroCreationArea').classList.add('hidden');
            document.getElementById('abilityArea').classList.add('hidden');
            document.getElementById('armoryArea').classList.remove('hidden');
            document.getElementById('armoryArea').classList.add('hidden');
            document.getElementById('btnProceedHero').classList.add('hidden');
            updatePartyStatusBars();
        }

        function confirmPartySize() {
            partySize = parseInt(document.getElementById('partySizeSelect').value);
            document.getElementById('partyConfigArea').classList.add('hidden');
            document.getElementById('heroCreationArea').classList.remove('hidden');
            document.getElementById('partyHeaderTitle').textContent = "Reclutamento Eroi";
            document.getElementById('partyNarrativeBox').innerHTML = `<strong>Descrizione:</strong> Scegli i membri che comporranno la squadra e assegna loro le abilità e l'armeria iniziale.`;
            loadHeroGridOptions();
        }

        function loadHeroGridOptions() {
            const gridContainer = document.getElementById('heroGridButtons');
            const availableHeroes = campaignHeroes.filter(h => !party.some(p => p.name === h.name));

            gridContainer.innerHTML = availableHeroes.map(h => `
                <button class="armory-btn" onclick="selectHeroCard('${h.name}')">
                    <span class="hero-portrait small ${heroPortraitClass(h.name)}" style="--hue:${heroHue(h.name)}">${heroPortraitInner(h.name)}</span>
                    <span class="tile-text">
                        <strong>${h.name}</strong>
                        <span class="tile-sub stat-chips">
                            <span class="stat-chip"><i>FOR</i>${h.str}</span>
                            <span class="stat-chip"><i>INT</i>${h.int}</span>
                            <span class="stat-chip"><i>FED</i>${h.fth}</span>
                            <span class="stat-chip"><i>HP</i>${h.maxHp}</span>
                        </span>
                    </span>
                </button>
            `).join('');
        }

        let activeHeroForCreation = null;
        function selectHeroCard(heroName) {
            activeHeroForCreation = JSON.parse(JSON.stringify(campaignHeroes.find(h => h.name === heroName)));
            document.getElementById('heroCreationArea').classList.add('hidden');

            const heroAbilities = campaignAbilities[heroName] || [];
            if(heroAbilities.length > 0) {
                document.getElementById('abilityArea').classList.remove('hidden');
                document.getElementById('abilityButtons').innerHTML = heroAbilities.map((ab, idx) => `
                    <button class="armory-btn" onclick="selectAbility(${idx})" style="width:100%; margin:5px 0;">
                        ${abilityIconHtml(ab)}
                        <span class="tile-text">
                            <strong>${ab.name}</strong>
                            ${ab.desc ? `<span class="tile-sub">${ab.desc}</span>` : ''}
                        </span>
                    </button>
                `).join('');
            } else {
                document.getElementById('armoryArea').classList.remove('hidden');
                document.getElementById('btnProceedHero').classList.remove('hidden');
                loadArmoryOptions();
            }
        }

        function selectAbility(idx) {
            const chosen = campaignAbilities[activeHeroForCreation.name][idx];
            activeHeroForCreation.chosenAbility = chosen;

            if(chosen.type === 'passive_stat') {
                if(chosen.stat === 'str') activeHeroForCreation.str += chosen.val;
                else if(chosen.stat === 'int') activeHeroForCreation.int += chosen.val;
                else if(chosen.stat === 'fth') activeHeroForCreation.fth += chosen.val;
                else if(chosen.stat === 'hp') { activeHeroForCreation.maxHp += chosen.val; activeHeroForCreation.hp += chosen.val; }
            }
            else if(chosen.effects) {
                applyEffects(chosen.effects, activeHeroForCreation);
            }

            document.getElementById('abilityArea').classList.add('hidden');
            document.getElementById('armoryArea').classList.remove('hidden');
            document.getElementById('btnProceedHero').classList.remove('hidden');
            loadArmoryOptions();
        }

        function loadArmoryOptions() {
            const hasItem = activeHeroForCreation.items.length > 0;
            document.getElementById('inventoryCountText').textContent = hasItem ?
                `Oggetto scelto: ${activeHeroForCreation.items[0].name} (Clicca di nuovo per deselezionare)` : `Seleziona 1 oggetto iniziale (Max 1):`;

            document.getElementById('btnProceedHero').disabled = !hasItem;

            document.getElementById('armoryButtons').innerHTML = campaignArmory.map((item, idx) => {
                const isSelected = hasItem && activeHeroForCreation.items[0].name === item.name;
                return `
                    <button class="armory-btn ${isSelected ? 'selected' : ''}" onclick="togglePickItem(${idx})">
                        ${itemIconHtml(item)}
                        <span class="tile-text">
                            <strong>${item.name}</strong>
                            <span class="tile-sub">${item.desc}</span>
                            ${isSelected ? '<span class="tile-tag">Selezionato</span>' : ''}
                        </span>
                    </button>
                `;
            }).join('');
        }

        function togglePickItem(idx) {
            const item = campaignArmory[idx];
            const hasItem = activeHeroForCreation.items.length > 0;

            if (hasItem) {
                if (activeHeroForCreation.items[0].name === item.name) {
                    revertItemEffects(activeHeroForCreation.items[0], activeHeroForCreation);
                    activeHeroForCreation.items = [];
                } else {
                    revertItemEffects(activeHeroForCreation.items[0], activeHeroForCreation);
                    activeHeroForCreation.items = [];
                    let newItem = JSON.parse(JSON.stringify(item));
                    activeHeroForCreation.items.push(newItem);
                    applyItemEffects(newItem, activeHeroForCreation);
                    discover('items', newItem.id);
                }
            } else {
                let newItem = JSON.parse(JSON.stringify(item));
                activeHeroForCreation.items.push(newItem);
                applyItemEffects(newItem, activeHeroForCreation);
                discover('items', newItem.id);
            }
            loadArmoryOptions();
        }

        function nextHero() {
            party.push(activeHeroForCreation);
            updatePartyStatusBars();
            document.getElementById('armoryArea').classList.add('hidden');
            document.getElementById('btnProceedHero').classList.add('hidden');

            if(party.length < partySize) {
                document.getElementById('heroCreationArea').classList.remove('hidden');
                loadHeroGridOptions();
            } else {
                showScreen('screenCampaignIntro');
            }
        }

        function startMap() {
            showScreen('screenMap');
            renderStsMap();
            setTimeout(() => {
                const wrapper = document.getElementById('stsMapWrapper');
                const token = document.getElementById('partyToken');
                // Centra la vista sul segnalino della compagnia (o sul fondo della mappa all'inizio)
                wrapper.scrollTop = token
                    ? parseFloat(token.style.top) - wrapper.clientHeight * 0.6
                    : wrapper.scrollHeight;
            }, 50);
        }

        function renderStsMap() {
            const nodesContainer = document.getElementById('stsMapNodesContainer');
            const svgContainer = document.getElementById('stsMapSvg');
            Array.from(nodesContainer.children).forEach(child => { if(child.id !== 'stsMapSvg') child.remove(); });

            let maxLevel = Math.max(...stsMapNodes.map(n => n.level), 1);
            const totalLevels = maxLevel + 1;
            const containerHeight = Math.max(900, totalLevels * 175);
            nodesContainer.style.height = `${containerHeight}px`;
            svgContainer.style.height = `${containerHeight}px`;
            svgContainer.setAttribute("viewBox", `0 0 800 ${containerHeight}`);

            const stepY = (containerHeight - 140) / maxLevel;

            const currentActiveNode = stsMapNodes.find(n => n.active);
            const currentLevel = currentActiveNode ? currentActiveNode.level : (stsMapNodes.filter(n => n.done).length > 0 ? Math.max(...stsMapNodes.filter(n => n.done).map(n => n.level)) + 1 : 0);

            let svgLinesHtml = '';
            stsMapNodes.forEach(node => {
                node.next.forEach(nextId => {
                    const targetNode = stsMapNodes.find(n => n.id === nextId);
                    if(targetNode) {
                        const y1 = containerHeight - (node.level * stepY + 70);
                        const y2 = containerHeight - (targetNode.level * stepY + 70);

                        let pathClass = "";
                        if (targetNode.active && node.done) pathClass = "path-open";
                        else if (targetNode.active) pathClass = "path-next";
                        else if (node.done && targetNode.done) pathClass = "path-taken";
                        else if (node.done) pathClass = "path-closed";
                        else if (targetNode.level < currentLevel) pathClass = "path-closed";

                        svgLinesHtml += `<line class="${pathClass}" x1="${node.x}" y1="${y1}" x2="${targetNode.x}" y2="${y2}" />`;
                    }
                });
            });
            svgContainer.innerHTML = svgLinesHtml;
            renderMapLegend();

            stsMapNodes.forEach(node => {
                let statusClass = "upcoming";
                if (node.done) {
                    statusClass = "completed";
                } else if (node.active) {
                    statusClass = "available";
                } else if (node.level < currentLevel && !node.done) {
                    statusClass = "excluded";
                }

                const nodeEl = document.createElement('div');
                nodeEl.className = `sts-node node-${node.type} ${statusClass}`;
                nodeEl.style.left = `${node.x}px`;
                nodeEl.style.top = `${containerHeight - (node.level * stepY + 70)}px`;
                const isBoss = node.level === maxLevel || node.type === 'captain';
                if (isBoss) {
                    nodeEl.setAttribute('data-boss', 'true');
                    nodeEl.classList.add('node-goal');
                }

                nodeEl.innerHTML = svgIcon(isBoss ? 'crown' : (NODE_ICON[node.type] || 'question'));
                if(node.active && !node.done) {
                    nodeEl.onclick = () => selectStsNode(node.id);
                }
                nodesContainer.appendChild(nodeEl);
            });

            renderPartyToken(nodesContainer, containerHeight, stepY);
            renderExpeditionProgress(maxLevel);
        }

        /* ---------- Segnalino della compagnia sulla mappa ---------- */
        let lastPartyTokenPos = null;

        function renderPartyToken(nodesContainer, containerHeight, stepY) {
            const doneNodes = stsMapNodes.filter(n => n.done);
            if (doneNodes.length === 0) {
                // Prima del primo nodo il segnalino non si vede: entrerà dal fondo della mappa
                const firstLevel = stsMapNodes.filter(n => n.level === 0);
                const avgX = firstLevel.reduce((s, n) => s + n.x, 0) / Math.max(1, firstLevel.length);
                lastPartyTokenPos = { x: avgX, y: containerHeight + 60, nodes: stsMapNodes };
                return;
            }
            const last = doneNodes.reduce((a, b) => (b.level > a.level ? b : a));
            const pos = { x: last.x, y: containerHeight - (last.level * stepY + 70) };

            const token = document.createElement('div');
            token.id = 'partyToken';
            token.className = 'party-token';
            token.innerHTML = `<svg viewBox="0 0 64 72" aria-hidden="true">
                <path d="M32 3 L60 12 V34 C60 52 47 64 32 69 C17 64 4 52 4 34 V12 Z" fill="url(#gradGold)" stroke="#000" stroke-width="2"/>
                <path d="M32 10 L54 17 V34 C54 48 44 58 32 62 C20 58 10 48 10 34 V17 Z" fill="url(#gradRed)" stroke="#000"/>
                <text x="32" y="46" text-anchor="middle" font-family="Cinzel, Georgia, serif" font-weight="900" font-size="28" fill="url(#gradGold)" stroke="#000" stroke-width="1">D</text>
            </svg>`;
            token.dataset.tip = 'La Compagnia||Posizione attuale della spedizione.';

            const from = lastPartyTokenPos && lastPartyTokenPos.nodes === stsMapNodes ? lastPartyTokenPos : null;
            const moves = from && (from.x !== pos.x || from.y !== pos.y) && animationsEnabled();
            const start = moves ? from : pos;
            token.style.left = `${start.x}px`;
            token.style.top = `${start.y}px`;
            nodesContainer.appendChild(token);

            if (moves) {
                token.classList.add('moving');
                void token.offsetWidth;
                token.style.left = `${pos.x}px`;
                token.style.top = `${pos.y}px`;
                setTimeout(() => token.classList.remove('moving'), 950);
            }
            lastPartyTokenPos = { x: pos.x, y: pos.y, nodes: stsMapNodes };
        }

        /* ---------- Titolo dell'evento prima di entrare nel nodo ---------- */
        let nodeBannerBusy = false;

        function nodeBannerInfo(node) {
            const maxLevel = Math.max(...stsMapNodes.map(n => n.level));
            const isBoss = node.level === maxLevel || node.type === 'captain';
            let kind = NODE_LABEL[node.type] || 'Evento';
            let title = kind;
            if ((node.type === 'combat' || node.type === 'elite') && enemies[node.enemy]) title = enemies[node.enemy].name;
            else if (node.type === 'challenge' && challengesData[node.challengeId]) title = challengesData[node.challengeId].title;
            if (isBoss) kind = node.type === 'challenge' ? 'Prova Finale' : 'Scontro Finale';
            return { kind, title, sub: node.title, icon: isBoss ? 'crown' : (NODE_ICON[node.type] || 'question'), isBoss };
        }

        function selectStsNode(id) {
            if (nodeBannerBusy) return;
            const node = stsMapNodes.find(n => n.id === id);
            if (!node) return;
            if (!animationsEnabled()) { enterStsNode(id); return; }

            nodeBannerBusy = true;
            const info = nodeBannerInfo(node);
            const banner = document.createElement('div');
            banner.className = `event-banner ${info.isBoss ? 'boss' : ''}`;
            banner.innerHTML = `
                <div class="event-banner-inner">
                    <div class="event-banner-icon">${svgIcon(info.icon)}</div>
                    <div class="event-banner-kind">${info.kind}</div>
                    <div class="event-banner-title">${info.title}</div>
                    <div class="event-banner-sub">${info.sub}</div>
                </div>`;
            document.body.appendChild(banner);

            // La schermata cambia sotto il titolo, poi il titolo sfuma
            setTimeout(() => enterStsNode(id), 1000);
            setTimeout(() => { banner.remove(); nodeBannerBusy = false; }, 1500);
        }

        function enterStsNode(id) {
            currentNodeId = id;
            const node = stsMapNodes.find(n => n.id === id);

            if(node.type === 'combat' || node.type === 'elite') {
                if(node.image) document.getElementById('combatImg').src = node.image;
                startCombat(node.enemy);
            }
            else if(node.type === 'challenge') {
                if(node.image) document.getElementById('challengeImg').src = node.image;
                startChallenge(node.challengeId);
            }
            else if(node.type === 'rest') {
                if(node.image) document.getElementById('restImg').src = node.image;
                startRest(node.restId);
            }
            else if(node.type === 'merchant') {
                if(node.image) document.getElementById('merchantImg').src = node.image;
                startMerchant(node.merchantId);
            }
            else if(node.type === 'treasure') {
                if(node.image) document.getElementById('treasureImg').src = node.image;
                startTreasure(node.treasureId);
            }
            else if(node.type === 'captain') {
                startCaptainFinale();
            }
        }

        function advanceNode() {
            const currentNode = stsMapNodes.find(n => n.id === currentNodeId);
            if(currentNode) {
                currentNode.done = true;
                currentNode.active = false;
                stsMapNodes.forEach(n => { if(n.level === currentNode.level && n.active) n.active = false; });

                if(currentNode.next.length === 0) {
                    showScreen('screenVictory');
                    return;
                }

                currentNode.next.forEach(nextId => {
                    const nextNode = stsMapNodes.find(n => n.id === nextId);
                    if(nextNode) nextNode.active = true;
                });
            }
            startMap();
        }

        function applyItemEffects(item, hero) {
            if(item.str) hero.str += item.str;
            if(item.dmg) hero.dmg += item.dmg;
            if(item.armor) {
                hero.base_armor += item.armor;
                if (hero.hp > 0) hero.current_armor += item.armor;
            }
            if(item.att_penalty) hero.att_penalty += item.att_penalty;
            if(item.def_bonus) hero.def_bonus += item.def_bonus;
            if(item.help_bonus_val) hero.help_bonus_val += item.help_bonus_val;
            if(item.fth) hero.fth += item.fth;
            if(item.int) hero.int += item.int;
        }

        function revertItemEffects(item, hero) {
            if(item.str) hero.str -= item.str;
            if(item.dmg) hero.dmg -= item.dmg;
            if(item.armor) {
                hero.base_armor -= item.armor;
                hero.current_armor = Math.max(0, hero.current_armor - item.armor);
            }
            if(item.att_penalty) hero.att_penalty -= item.att_penalty;
            if(item.def_bonus) hero.def_bonus -= item.def_bonus;
            if(item.help_bonus_val) hero.help_bonus_val -= item.help_bonus_val;
            if(item.fth) hero.fth -= item.fth;
            if(item.int) hero.int -= item.int;
        }

        window.useConsumable = function(heroName, itemIdx, targetName = null) {
            let hero = party.find(p => p.name === heroName);
            if(!hero) return false;
            let item = hero.items[itemIdx];
            if(!item || !item.type || !item.type.startsWith('consumable')) return false;

            let target = targetName ? party.find(p => p.name === targetName) : hero;
            if(!target || target.hp <= 0) {
                alert("Bersaglio non valido o non disponibile!");
                return false;
            }

            if(item.type === 'consumable_heal') {
                target.hp = Math.min(target.maxHp, target.hp + item.heal_val);
                hero.items.splice(itemIdx, 1);
                updatePartyStatusBars();
                triggerConsumableFeedback(hero, target, item);
            } else if(item.type === 'consumable_full') {
                target.hp = target.maxHp;
                hero.items.splice(itemIdx, 1);
                updatePartyStatusBars();
                triggerConsumableFeedback(hero, target, item);
            }
            return true;
        };

        function triggerConsumableFeedback(hero, target, item) {
            const log = document.getElementById('combatLog');
            if(log && !document.getElementById('screenCombat').classList.contains('hidden')) {
                logCombat(`🧪 ${hero.name} usa ${item.name} su ${target.name}!`);
            } else {
                alert(`${hero.name} ha usato ${item.name} su ${target.name}!`);
            }
        }

        // Statistiche che un oggetto modifica, con l'etichetta mostrata nell'anteprima
        const ITEM_STAT_PREVIEW = [
            { key: 'str', label: 'Forza', get: h => h.str },
            { key: 'dmg', label: 'Danno', get: h => h.dmg },
            { key: 'armor', label: 'Armatura', get: h => h.base_armor },
            { key: 'fth', label: 'Fede', get: h => h.fth },
            { key: 'int', label: 'Intelligenza', get: h => h.int },
            { key: 'def_bonus', label: 'Difesa', get: h => h.def_bonus || 0 },
            { key: 'help_bonus_val', label: 'Aiuto', get: h => h.help_bonus_val || 0 },
            { key: 'att_penalty', label: 'Attacco', get: h => attackMod(h), sign: -1 }
        ];

        // Es. "Forza 3→4, Danno 1→2": come cambierebbe l'eroe equipaggiando l'oggetto
        function itemDeltaText(item, hero) {
            if (item.type && item.type.startsWith('consumable')) return 'consumabile nello zaino';
            const parts = ITEM_STAT_PREVIEW.filter(st => item[st.key]).map(st => {
                const before = st.get(hero);
                return `${st.label} ${before}→${before + item[st.key] * (st.sign || 1)}`;
            });
            return parts.join(', ') || 'nessun effetto sulle statistiche';
        }

        function heroOptionsForItem(item) {
            return party.filter(p => p.hp > 0).map(h => {
                const full = h.items.length >= 3 ? ' · zaino pieno, dovrai scartare' : '';
                return `<option value="${h.name}">${h.name} — ${itemDeltaText(item, h)}${full}</option>`;
            }).join('');
        }

        let discardCallback = null;
        let heroNeedingDiscard = null;

        function assignItemToHero(item, hero, callback) {
            discover('items', item.id);
            let newItem = JSON.parse(JSON.stringify(item));
            hero.items.push(newItem);
            applyItemEffects(newItem, hero);
            updatePartyStatusBars();

            if (hero.items.length > 3) {
                heroNeedingDiscard = hero;
                discardCallback = callback;
                showScreen('screenDiscard');
                renderDiscardScreen();
            } else {
                callback();
            }
        }

        function renderDiscardScreen() {
            document.getElementById('discardHeroName').textContent = heroNeedingDiscard.name;
            document.getElementById('discardItemsList').innerHTML = heroNeedingDiscard.items.map((it, idx) => `
                <button class="armory-btn" onclick="executeDiscard(${idx})">
                    ${itemIconHtml(it)}
                    <span class="tile-text">
                        <strong>${it.name}</strong>
                        <span class="tile-sub">${it.desc}</span>
                        <span class="tile-tag danger">Scarta</span>
                    </span>
                </button>
            `).join('');
        }

        function executeDiscard(idx) {
            const itemToRemove = heroNeedingDiscard.items[idx];
            revertItemEffects(itemToRemove, heroNeedingDiscard);
            heroNeedingDiscard.items.splice(idx, 1);
            updatePartyStatusBars();
            discardCallback();
        }

        /* ==========================================================================
           LOGICA COMBATTIMENTO ED ESECUZIONE ABILITA'
           ========================================================================== */
        let activeEnemy = null;
        let helpBonus = 0;
        let chosenAction = null;
        let currentActiveHero = null;

        function startCombat(enemyKey) {
    showScreen('screenCombat');
    activeEnemy = JSON.parse(JSON.stringify(enemies[enemyKey]));
    discover('enemies', `${currentCampaign.id}:${enemyKey}`);
    activeEnemy.isStunned = false;
    
    // Reliquia: Occhio del corvo
    if (hasRelic("Occhio del corvo")) activeEnemy.att = Math.max(1, activeEnemy.att - 1);
    
    // Flag per Scudo dell'Atamano
    party.atamanoUsed = false;

    helpBonus = 0;

            document.getElementById('combatDescBox').innerHTML = `<strong>Descrizione:</strong> ${activeEnemy.desc}`;

            party.forEach(h => {
                if(h.hp > 0) {
                    h.current_armor = h.base_armor;
                    h.abilityUsedThisCombat = false;
                } else {
                    h.current_armor = 0;
                }
            });
            fxResyncHeroes();
            combatRound = 0;
            document.getElementById('combatLootBtn').classList.remove('btn-attention');

            document.getElementById('combatLog').innerHTML = `Combatti contro ${activeEnemy.name}! (Armature e Abilità ripristinate)<br>`;
            startHeroesTurnCycle();
        }

        function logCombat(text) {
            const log = document.getElementById('combatLog');
            log.innerHTML += text + "<br>";
            log.scrollTop = log.scrollHeight;
        }

        function updateEnemyInfoUI() {
            let hpPercent = clampPct(activeEnemy.hp, activeEnemy.maxHp);
            let stunBadge = activeEnemy.isStunned ? `<span class="stun-badge">Stordito</span>` : '';

            document.getElementById('enemyInfo').innerHTML = `
                <div class="enemy-head">
                    <div class="icon-frame enemy-emblem">${svgIcon('skull')}</div>
                    <div class="enemy-main">
                        <div class="enemy-name">${activeEnemy.name}${stunBadge}</div>
                        <div class="hp-bar-container big">
                            <div class="hp-bar-fill ${hpClass(hpPercent)}" style="width: ${hpPercent}%;"></div>
                            <div class="hp-bar-text">${Math.max(0, activeEnemy.hp)} / ${activeEnemy.maxHp}</div>
                        </div>
                    </div>
                </div>
                <div class="enemy-stats">
                    <span data-tip="Classe Armatura||Il totale di Forza + d6 necessario per colpire.">${svgIcon('shield')} CA <b>${activeEnemy.ca}</b></span>
                    <span data-tip="Attacco||Il totale necessario per difendersi o aiutare.">${svgIcon('sword')} Att <b>${activeEnemy.att}</b></span>
                    <span data-tip="Danno||Danni inflitti a ogni attacco del nemico.">${svgIcon('drop')} Dmg <b>${activeEnemy.dmg}</b></span>
                </div>
            `;
            fxDiffEnemy();
        }

        function startHeroesTurnCycle() {
            party.forEach(h => { if(h.hp > 0) h.hasActed = false; });
            combatRound++;
            updateEnemyInfoUI();
            showHeroSelectionPhase();
        }

        function showHeroSelectionPhase() {
            document.getElementById('heroTurnSection').classList.remove('hidden');
            document.getElementById('monsterTurnSection').classList.add('hidden');
            document.getElementById('combatNextBtn').classList.add('hidden');
            document.getElementById('combatLootBtn').classList.add('hidden');
            document.getElementById('heroChoiceArea').classList.remove('hidden');
            document.getElementById('heroActionControlArea').classList.add('hidden');
            document.getElementById('combatItemSubmenu').classList.add('hidden');

            const available = party.filter(p => p.hp > 0 && !p.hasActed);
            if(available.length === 0) { startMonsterTurn(); return; }
            combatPhase = 'heroes';
            currentActiveHero = null;
            document.getElementById('combatHeroSelect').innerHTML = available.map(h => `<option value="${h.name}">${h.name} (HP: ${h.hp})</option>`).join('');
            updatePartyStatusBars();
        }

        function confirmCombatHeroChoice() {
            currentActiveHero = party.find(p => p.name === document.getElementById('combatHeroSelect').value);
            document.getElementById('heroChoiceArea').classList.add('hidden');
            document.getElementById('heroActionControlArea').classList.remove('hidden');
            document.getElementById('combatActionButtons').classList.remove('hidden');
            document.getElementById('combatItemSubmenu').classList.add('hidden');
            document.getElementById('combatDiceArea').classList.add('hidden');

            const rollBtn = document.getElementById('rollCombatBtn');
            rollBtn.disabled = false;

            document.getElementById('activeCombatantText').textContent = `Tocca a: ${currentActiveHero.name}`;
            updatePartyStatusBars();

            const btnAbility = document.getElementById('btnCombatAbility');
            if (currentActiveHero.chosenAbility) {
                btnAbility.querySelector('.cmd-ability-icon').innerHTML = abilityCmdIconHtml(currentActiveHero.chosenAbility);
            }
            const hasCombatAbility = currentActiveHero.chosenAbility && currentActiveHero.chosenAbility.isCombatActive;
            const alreadyUsed = currentActiveHero.abilityUsedThisCombat;

            if (hasCombatAbility && !alreadyUsed) {
                btnAbility.disabled = false;
                btnAbility.style.display = "";
                btnAbility.dataset.tip = `${currentActiveHero.chosenAbility.name} [T]||${currentActiveHero.chosenAbility.desc}`;
                btnAbility.querySelector('.cmd-ability-label').textContent = currentActiveHero.chosenAbility.name;
                btnAbility.querySelector('.cmd-sub').textContent = '1 per scontro';
            } else if (hasCombatAbility && alreadyUsed) {
                btnAbility.disabled = true;
                btnAbility.style.display = "";
                btnAbility.querySelector('.cmd-ability-label').textContent = currentActiveHero.chosenAbility.name;
                btnAbility.querySelector('.cmd-sub').textContent = 'Usata';
                btnAbility.dataset.tip = `${currentActiveHero.chosenAbility.name}||Già utilizzata in questo scontro`;
            } else {
                btnAbility.disabled = true;
                btnAbility.style.display = "none";
            }
            updateActionPreviews(currentActiveHero);
        }

        /* ---------- Anteprima dell'esito sui pulsanti azione ---------- */
        // Modificatore fisso ai tiri per colpire: bonus (es. "Benedetti da Jag Antar") meno penalità (armature pesanti, maledizioni)
        function attackMod(hero) {
            return (hero.att_bonus || 0) - (hero.att_penalty || 0);
        }

        // Probabilità di ottenere almeno 'needed' con un d6, o con due d6 tenendo il migliore (twoDice) o il peggiore (worst)
        function rollChance(needed, twoDice, worst = false) {
            if (needed <= 1) return 1;
            if (needed > 6) return 0;
            const fail = (needed - 1) / 6;
            if (worst) return (1 - fail) * (1 - fail);
            return twoDice ? 1 - fail * fail : 1 - fail;
        }

        function chanceText(needed, twoDice, worst = false) {
            const pct = Math.round(rollChance(needed, twoDice, worst) * 100);
            if (needed <= 1) return { short: 'Sicuro', long: 'Riuscita garantita', pct };
            if (needed > 6) return { short: 'Impossibile', long: 'Nessun risultato del dado basta', pct };
            const note = worst ? ' (tieni il peggiore di due)' : (twoDice ? ' (tieni il migliore di due)' : '');
            return { short: `${needed}+ · ${pct}%`, long: `Ti serve ${needed} o più sul dado${note}: ${pct}% di riuscita`, pct };
        }

        // Stessi calcoli usati da executeCombatHeroRoll, mostrati prima del tiro
        function updateActionPreviews(hero) {
            if (!hero || !activeEnemy) return;
            const attackNeeded = activeEnemy.ca - hero.str - helpBonus - attackMod(hero);
            const defendNeeded = activeEnemy.att - hero.str - (hero.def_bonus || 0);
            const helpNeeded = activeEnemy.att - hero.str - (hero.help_bonus_val || 0);

            const setPreview = (id, title, desc, needed, twoDice) => {
                const btn = document.getElementById(id);
                const info = chanceText(needed, twoDice);
                btn.querySelector('.cmd-sub').textContent = info.short;
                btn.querySelector('.cmd-sub').dataset.chance = info.pct >= 67 ? 'high' : (info.pct >= 34 ? 'mid' : 'low');
                btn.dataset.tip = `${title}||${desc}<br><span class="tip-hint">${info.long}</span>`;
            };

            setPreview('cmdAttack', 'Attacca [Q]', `Forza + d6 contro CA ${activeEnemy.ca}. Se riesci infliggi ${hero.dmg} danni.`, attackNeeded, false);
            setPreview('cmdDefend', 'Difendi [W]', `Forza + d6 contro l'attacco nemico (${activeEnemy.att}). Se riesci ottieni +1 Armatura.`, defendNeeded, false);
            setPreview('cmdHelp', 'Aiuta [E]', `Forza + d6 contro l'attacco nemico (${activeEnemy.att}). Se riesci il prossimo attacco ottiene +1.`, helpNeeded, false);

            const ability = hero.chosenAbility;
            if (ability && ability.isCombatActive && !hero.abilityUsedThisCombat) {
                let needed = attackNeeded;
                if (ability.id === 'dioforo_penna') {
                    needed = activeEnemy.ca - (hero.str + hero.int) - helpBonus - attackMod(hero);
                }
                setPreview('btnCombatAbility', `${ability.name} [T]`, ability.desc, needed, ability.id === 'icaro_trucchi');
            }
      }
        function selectCombatAction(action) {
            chosenAction = action;
            if (action === 'use_item') {
                let consumables = currentActiveHero.items.filter(it => it.type && it.type.startsWith('consumable'));
                if (consumables.length === 0) {
                    alert("Questo eroe non ha oggetti consumabili nello zaino!");
                    return;
                }
                document.getElementById('combatActionButtons').classList.add('hidden');
                document.getElementById('combatItemSubmenu').classList.remove('hidden');

                document.getElementById('combatConsumableSelect').innerHTML = currentActiveHero.items
                    .map((it, idx) => ({ it, idx }))
                    .filter(obj => obj.it.type && obj.it.type.startsWith('consumable'))
                    .map(obj => `<option value="${obj.idx}">${obj.it.name} (${obj.it.desc})</option>`)
                    .join('');

                document.getElementById('combatTargetSelect').innerHTML = party
                    .filter(p => p.hp > 0)
                    .map(p => `<option value="${p.name}">${p.name} (HP: ${p.hp}/${p.maxHp})</option>`)
                    .join('');
            } else {
                document.getElementById('combatActionButtons').classList.add('hidden');
                document.getElementById('combatDiceArea').classList.remove('hidden');
                document.getElementById('diceCombatResult').textContent = "Tira il dado...";
                document.getElementById('rollCombatBtn').disabled = false;

                // "Trucchi del mestiere" di Icaro: due dadi visibili, si tiene il più alto
                const twoDice = combatRollUsesTwoDice(currentActiveHero, action);
                const dice1 = document.getElementById('diceCombat');
                const dice2 = document.getElementById('diceCombat2');
                dice1.classList.remove('discarded');
                dice2.classList.remove('discarded');
                dice2.textContent = "6";
                dice2.classList.toggle('hidden', !twoDice);
                document.getElementById('rollCombatBtn').textContent = twoDice ? "Tira (2D6, tieni il migliore)" : "Tira (D6)";
            }
        }

        function combatRollUsesTwoDice(hero, action) {
            return action === 'ability' && !!hero && !!hero.chosenAbility && hero.chosenAbility.id === 'icaro_trucchi';
        }

        function cancelCombatItemSubmenu() {
            document.getElementById('combatItemSubmenu').classList.add('hidden');
            document.getElementById('combatActionButtons').classList.remove('hidden');
        }

        function executeCombatUseItem() {
            let itemIdx = parseInt(document.getElementById('combatConsumableSelect').value);
            let targetName = document.getElementById('combatTargetSelect').value;

            // Se l'oggetto non viene usato il turno resta all'eroe
            if (!useConsumable(currentActiveHero.name, itemIdx, targetName)) return;

            currentActiveHero.hasActed = true;
            document.getElementById('combatItemSubmenu').classList.add('hidden');
            document.getElementById('heroActionControlArea').classList.add('hidden');

            const available = party.filter(p => p.hp > 0 && !p.hasActed);
            if (available.length === 0) {
                startMonsterTurn();
            } else {
                showHeroSelectionPhase();
            }
        }

        function executeCombatHeroRoll() {
            const rollBtn = document.getElementById('rollCombatBtn');
            if (rollBtn.disabled) return;

            const diceBox = document.getElementById('diceCombat');
            const diceBox2 = document.getElementById('diceCombat2');
            const twoDice = combatRollUsesTwoDice(currentActiveHero, chosenAction);
            rollBtn.disabled = true;
            diceBox.classList.add('rolling');
            if (twoDice) diceBox2.classList.add('rolling');
            synthSfx('dice');

            let counter = 0;
            const interval = setInterval(() => {
                diceBox.textContent = Math.floor(Math.random() * 6) + 1;
                if (twoDice) diceBox2.textContent = Math.floor(Math.random() * 6) + 1;
                counter += 50;
                if(counter >= 500) {
                    clearInterval(interval);
                    diceBox.classList.remove('rolling');
                    diceBox2.classList.remove('rolling');

                    const hero = currentActiveHero;
                    const enemyHpBefore = activeEnemy.hp;
                    const armorBefore = hero.current_armor;

                    if(chosenAction === 'attack') {
                        const roll = Math.floor(Math.random() * 6) + 1;
                        diceBox.textContent = roll;
                        
                        // Modificatori Reliquie Attacco/Danno
                        let relicAttBonus = 0;
                        let relicDmgBonus = 0;
                        const isElite = stsMapNodes.find(n => n.id === currentNodeId)?.type === 'elite';

                        if (combatRound === 1 && hasRelic("Stendardo da battaglia")) relicAttBonus += 1;
                        if (combatRound === 2 && hasRelic("Zanna del leone bianco")) relicDmgBonus += 2;
                        if (combatRound === 3 && hasRelic("Corno antico")) relicDmgBonus += 1;
                        if (isElite) {
                            if (hasRelic("Idolo del cacciatore")) relicDmgBonus += 1;
                            if (hasRelic("Catena di Norgrad")) relicAttBonus += 1;
                        }

                        let total = roll + hero.str + helpBonus + attackMod(hero) + relicAttBonus;
                        helpBonus = 0;
                        
                        logCombat(`${hero.name} attacca: Tiro ${roll} + Forza ${hero.str}${attackMod(hero) ? ` ${attackMod(hero) > 0 ? '+' : '−'} ${Math.abs(attackMod(hero))} Mod.` : ''}${relicAttBonus > 0 ? ' + Reliquia' : ''} = ${total} (CA: ${activeEnemy.ca})`);

                        if(total >= activeEnemy.ca) {
                            let finalDmg = hero.dmg + relicDmgBonus;
                            activeEnemy.hp -= finalDmg;
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">SUCCESSO!</span> ${finalDmg} danni.`;
                            logCombat(`Colpo riuscito! Infliggi ${finalDmg} danni.`);
                        } else {
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">MANCATO!</span>`;
                        }
                    }
                    else if(chosenAction === 'ability') {
    hero.abilityUsedThisCombat = true;
    const abId = hero.chosenAbility.id;

    if (abId === 'zeno_colpo_benedetto') {
        const roll = Math.floor(Math.random() * 6) + 1;
        diceBox.textContent = roll;
        let total = roll + hero.str + helpBonus + attackMod(hero);
        helpBonus = 0;
        let totalDmg = hero.dmg + (hero.fth || 0);
        logCombat(`✨ ${hero.name} infonde il colpo di fede sacra! Tiro ${roll} + Forza ${hero.str} = ${total} (CA: ${activeEnemy.ca})`);

        if (total >= activeEnemy.ca) {
            activeEnemy.hp -= totalDmg;
            document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">COLPO BENEDETTO!</span> Infliggi ${totalDmg} danni (${hero.dmg} base + ${hero.fth} Fede)!`;
            logCombat(`La luce divina guida la lama: infliggi ${totalDmg} danni!`);
        } else {
            document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">MANCATO!</span>`;
        }
    }
    else if (abId === 'dioforo_penna') {
        const roll = Math.floor(Math.random() * 6) + 1;
        diceBox.textContent = roll;
        let intBonus = hero.int || 0;
        let total = roll + hero.str + intBonus + helpBonus + attackMod(hero);
        helpBonus = 0;
        logCombat(`📜 ${hero.name} sfrutta l'intelletto! Tiro ${roll} + Forza ${hero.str} + Int ${intBonus} = ${total} (CA: ${activeEnemy.ca})`);

        if (total >= activeEnemy.ca) {
            activeEnemy.hp -= hero.dmg;
            document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">COLPO A SEGNO!</span> ${hero.dmg} danni.`;
            logCombat(`Un calcolo perfetto individua il punto debole: infliggi ${hero.dmg} danni!`);
        } else {
            document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">MANCATO!</span>`;
        }
    }
    else if (abId === 'icaro_trucchi') {
                            const d1 = Math.floor(Math.random() * 6) + 1;
                            const d2 = Math.floor(Math.random() * 6) + 1;
                            const roll = Math.max(d1, d2);
                            diceBox.textContent = d1;
                            diceBox2.textContent = d2;
                            (d2 > d1 ? diceBox : diceBox2).classList.add('discarded');
                            let total = roll + hero.str + helpBonus + attackMod(hero);
                            helpBonus = 0;
                            logCombat(`✨ ${hero.name} usa Trucchi del Mestiere! Tira [${d1}, ${d2}] -> Tiene ${roll}. Totale: ${total} (CA: ${activeEnemy.ca})`);

                            if (total >= activeEnemy.ca) {
                                activeEnemy.hp -= hero.dmg;
                                document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">COLPO A SEGNO!</span> ${hero.dmg} danni.`;
                            } else {
                                document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">MANCATO!</span>`;
                            }
                        }
                        else if (abId === 'astarte_affondo') {
                            const roll = Math.floor(Math.random() * 6) + 1;
                            diceBox.textContent = roll;
                            let total = roll + hero.str + helpBonus + attackMod(hero);
                            helpBonus = 0;
                            let extraDmg = hero.dmg * 2;
                            logCombat(`🗡️ ${hero.name} scatena Affondo Mortale! Tiro ${roll} + Forza ${hero.str} = ${total} (CA: ${activeEnemy.ca})`);

                            if (total >= activeEnemy.ca) {
                                activeEnemy.hp -= extraDmg;
                                fxNextEnemyHitCritical = true;
                                document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">COLPO CRITICO!</span> Infliggi ${extraDmg} danni raddoppiati!`;
                                logCombat(`L'affondo trafigge il nemico infliggendo ${extraDmg} danni!`);
                            } else {
                                document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">MANCATO!</span>`;
                            }
                        }
                        else if (abId === 'ascadeo_segnato') {
                            const roll = Math.floor(Math.random() * 6) + 1;
                            diceBox.textContent = roll;
                            let total = roll + hero.str + helpBonus + attackMod(hero);
                            helpBonus = 0;
                            logCombat(`❄️ ${hero.name} colpisce nel nome di Hvid! Tiro ${roll} + Forza ${hero.str} = ${total} (CA: ${activeEnemy.ca})`);

                            if (total >= activeEnemy.ca) {
                                activeEnemy.hp -= hero.dmg;
                                activeEnemy.isStunned = true;
                                document.getElementById('diceCombatResult').innerHTML = `<span style="color:#3498db;">STORDITO!</span> ${hero.dmg} danni e nemico congelato per un turno.`;
                                logCombat(`Il nemico barcolla congelato dal gelo di Hvid: salterà il prossimo attacco!`);
                            } else {
                                document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">MANCATO!</span>`;
                            }
                        }
                    }
                    else if(chosenAction === 'defend') {
                        const roll = Math.floor(Math.random() * 6) + 1;
                        diceBox.textContent = roll;
                        let total = roll + hero.str + (hero.def_bonus || 0);
                        logCombat(`${hero.name} si difende: Tiro ${roll} + Forza ${hero.str} = ${total}`);
                        if(total >= activeEnemy.att) {
                            hero.current_armor += 1;
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">DIFESA RIUSCITA!</span> +1 Armatura.`;
                            logCombat(`${hero.name} alza la guardia (+1 Armatura).`);
                        } else {
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">FALLITO.</span>`;
                        }
                    }
                    else if(chosenAction === 'help') {
                        const roll = Math.floor(Math.random() * 6) + 1;
                        diceBox.textContent = roll;
                        let total = roll + hero.str + (hero.help_bonus_val || 0);
                        logCombat(`${hero.name} aiuta: Tiro ${roll} + Forza ${hero.str} = ${total}`);
                        if(total >= activeEnemy.att) {
                            helpBonus = 1;
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">AIUTO RIUSCITO!</span> +1 al prossimo.`;
                        } else {
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">FALLITO.</span>`;
                        }
                    }

                    diceOutcomeSfx(twoDice ? Math.max(+diceBox.textContent, +diceBox2.textContent) : +diceBox.textContent);

                    const finishRoll = () => {
                    hero.hasActed = true;
                    updateEnemyInfoUI();
                    updatePartyStatusBars();

                    // Esiti senza variazione di HP: mancato, fallito, aiuto riuscito
                    if ((chosenAction === 'attack' || chosenAction === 'ability') && activeEnemy.hp === enemyHpBefore) {
                        fxFloatOn(document.getElementById('enemyInfo'), 'Mancato', 'miss');
                    } else if (chosenAction === 'defend' && hero.current_armor === armorBefore) {
                        fxFloatOnHero(hero, 'Fallito', 'miss');
                    } else if (chosenAction === 'help') {
                        const helped = document.getElementById('diceCombatResult').textContent.includes('RIUSCITO');
                        fxFloatOnHero(hero, helped ? '+1 al prossimo' : 'Fallito', helped ? 'buff' : 'miss');
                    }

                    if(activeEnemy.hp <= 0) {
                        logCombat(`Hai sconfitto ${activeEnemy.name}! Vittoria!`);
                        document.getElementById('combatLootBtn').classList.remove('hidden');
                        document.getElementById('heroActionControlArea').classList.add('hidden');
                        return;
                    }
                    document.getElementById('combatNextBtn').classList.remove('hidden');
                    };

                    // Colpo a segno (attacco o abilità): prima la cinematica col ritratto, poi danni ed effetti
                    const landed = (chosenAction === 'attack' || chosenAction === 'ability') && activeEnemy.hp < enemyHpBefore;
                    if (landed) {
                        playHeroStrike(hero, chosenAction === 'ability' ? hero.chosenAbility : null, finishRoll);
                    } else {
                        finishRoll();
                    }
                }
            }, 50);
        }

        function proceedCombatPhase() {
            document.getElementById('combatNextBtn').classList.add('hidden');
            showHeroSelectionPhase();
        }

        function startMonsterTurn() {
            combatPhase = 'monster';
            currentActiveHero = null;
            updatePartyStatusBars();
            document.getElementById('heroTurnSection').classList.add('hidden');
            document.getElementById('monsterTurnSection').classList.remove('hidden');

            if(activeEnemy.isStunned) {
                activeEnemy.isStunned = false;
                document.getElementById('monsterTurnText').textContent = `${activeEnemy.name} è stordito e non può attaccare!`;
                logCombat(`⏳ ${activeEnemy.name} si riprende dallo stordimento e salta il turno!`);
                updateEnemyInfoUI();

                document.getElementById('monsterTargetArea').classList.add('hidden');
                document.getElementById('combatNextBtn').classList.remove('hidden');
                document.getElementById('combatNextBtn').onclick = function() {
                    document.getElementById('combatNextBtn').classList.add('hidden');
                    document.getElementById('monsterTargetArea').classList.remove('hidden');
                    document.getElementById('combatNextBtn').onclick = proceedCombatPhase;
                    startHeroesTurnCycle();
                };
                return;
            }

            document.getElementById('monsterTargetArea').classList.remove('hidden');
            document.getElementById('monsterTurnText').textContent = `Turno di ${activeEnemy.name}!`;
            document.getElementById('monsterTargetSelect').innerHTML = party.filter(p => p.hp > 0).map(h => `<option value="${h.name}">${h.name} (HP: ${h.hp})</option>`).join('');
        }

        function executeMonsterAttack() {
            const target = party.find(p => p.name === document.getElementById('monsterTargetSelect').value);
            logCombat(`--- ${activeEnemy.name} attacca ${target.name}! ---`);

            let incomingDamage = activeEnemy.dmg;

            // Maledizione: Presagio di Morte (+1 a ogni danno subito)
            if (hasCurse("Presagio di Morte")) {
                incomingDamage += 1;
                logCombat(`💀 Presagio di Morte: il colpo infligge 1 danno in più.`);
            }

            // Reliquia: Scudo dell'Atamano (annulla il primo attacco)
            if (hasRelic("Scudo dell'Atamano") && !party.atamanoUsed) {
                party.atamanoUsed = true;
                incomingDamage = 0;
                logCombat(`🛡️ Lo Scudo dell'Atamano assorbe completamente il primo colpo del combattimento!`);
            }

            if (target.current_armor > 0 && incomingDamage > 0) {
                if (target.current_armor >= incomingDamage) {
                    target.current_armor -= incomingDamage;
                    logCombat(`L'armatura assorbe interamente il colpo!`);
                    incomingDamage = 0;
                } else {
                    incomingDamage -= target.current_armor;
                    logCombat(`L'armatura si infrange. I restanti ${incomingDamage} colpiscono gli HP!`);
                    target.current_armor = 0;
                }
            }

            if (incomingDamage > 0) {
                // Reliquia: Marchio di Jag Antar (salvavita)
                if (target.hp - incomingDamage <= 0 && hasRelic("Marchio di Jag Antar")) {
                    target.hp = 1;
                    breakRelic("Marchio di Jag Antar");
                    logCombat(`✨ Il Marchio di Jag Antar si infrange, salvando ${target.name} da morte certa!`);
                } else {
                    target.hp = Math.max(0, target.hp - incomingDamage);
                    logCombat(`${target.name} subisce ${incomingDamage} danni agli HP!`);
                }
            }

            updatePartyStatusBars();

            if(party.every(p => p.hp <= 0)) {
                // La sconfitta è definitiva: il salvataggio non deve permettere di annullarla
                deleteCurrentSave();
                showScreen('screenDefeat');
                return;
            }

            document.getElementById('monsterTurnSection').classList.add('hidden');
            document.getElementById('combatNextBtn').classList.remove('hidden');
            document.getElementById('combatNextBtn').onclick = function() {
                document.getElementById('combatNextBtn').classList.add('hidden');
                document.getElementById('combatNextBtn').onclick = proceedCombatPhase;
                startHeroesTurnCycle();
            };
        }

        let currentLootItem = null;

        // Avanzamento nella mappa del nodo corrente: 0 al primo livello, 1 all'ultimo
        function mapProgress() {
            const node = stsMapNodes.find(n => n.id === currentNodeId);
            const maxLevel = Math.max(...stsMapNodes.map(n => n.level), 1);
            return node ? Math.min(1, node.level / maxLevel) : 0;
        }

        // Probabilità (in %) di comune/raro/epico: salgono raro ed epico andando avanti e negli scontri elite
        function lootRarityWeights(isElite, progress) {
            const lerp = (a, b) => a + (b - a) * progress;
            return isElite
                ? { comune: lerp(30, 10), raro: lerp(50, 50), epico: lerp(20, 40) }
                : { comune: lerp(70, 40), raro: lerp(25, 45), epico: lerp(5, 15) };
        }

        // Pesca un oggetto: prima la rarità secondo i pesi, poi un oggetto a caso di quella rarità
        function pickLootItem(isElite, progress) {
            const weights = lootRarityWeights(isElite, progress);
            const available = Object.keys(weights).filter(r => gameItems.some(i => itemRarity(i) === r));
            if (available.length === 0) return gameItems[Math.floor(Math.random() * gameItems.length)];
            const total = available.reduce((sum, r) => sum + weights[r], 0);
            let pick = Math.random() * total;
            let rarity = available[available.length - 1];
            for (const r of available) {
                pick -= weights[r];
                if (pick < 0) { rarity = r; break; }
            }
            const pool = gameItems.filter(i => itemRarity(i) === rarity);
            return pool[Math.floor(Math.random() * pool.length)];
        }

        // Oro base moltiplicato per l'avanzamento (fino a x2 all'ultimo livello) e +50% negli scontri elite
        function scaledCoins(amounts, isElite) {
            const base = amounts[Math.floor(Math.random() * amounts.length)];
            return Math.round(base * (1 + mapProgress()) * (isElite ? 1.5 : 1));
        }

        function triggerLoot() {
            showScreen('screenLoot');

            // Reliquia: Dente del grande lupo
            if (hasRelic("Dente del grande lupo")) {
                let lowestHero = party.filter(h => h.hp > 0).reduce((prev, curr) => prev.hp < curr.hp ? prev : curr);
                if (lowestHero && lowestHero.hp < lowestHero.maxHp) {
                    lowestHero.hp += 1;
                }
            }

            const currentNode = stsMapNodes.find(n => n.id === currentNodeId);
            const isEliteCombat = currentNode && (currentNode.type === 'elite' || currentNode.type === 'captain');
            let coins = scaledCoins([3, 5, 7, 9, 12], isEliteCombat);

            if (activeCurses.includes("Maledizione: -15% monete")) {
                coins = Math.floor(coins * 0.85);
            }

            // Abilità di Icaro "Fammi dare un'occhiata": monete extra garantite dopo ogni scontro, se è vivo.
            // L'id dell'abilità copre i salvataggi creati prima di questa versione.
            const lootBonusHeroes = party.filter(h => h.hp > 0 && (h.bonusLootCoins || (h.chosenAbility && h.chosenAbility.id === 'icaro_oro')));
            const lootBonus = lootBonusHeroes.reduce((sum, h) => sum + (h.bonusLootCoins || 3), 0);
            coins += lootBonus;
            document.getElementById('lootCoinsBonus').textContent = lootBonus
                ? `(di cui +${lootBonus} da ${lootBonusHeroes.map(h => h.name).join(', ')}: Fammi dare un'occhiata)` : '';

            partyCoins += coins;

            currentLootItem = pickLootItem(isEliteCombat, mapProgress());
            expeditionStats.itemsFound++;

            document.getElementById('lootCoinsText').textContent = coins;
            document.getElementById('lootItemIcon').innerHTML = itemIconHtml(currentLootItem);
            document.getElementById('lootItemName').textContent = currentLootItem.name;
            document.getElementById('lootItemDesc').textContent = currentLootItem.desc;
            revealAsCard(document.querySelector('#screenLoot .loot-panel'), 0);
            document.getElementById('lootHeroSelect').innerHTML = heroOptionsForItem(currentLootItem);

            updatePartyStatusBars();
        }

        function confirmLootAssignment() {
            const hero = party.find(p => p.name === document.getElementById('lootHeroSelect').value);
            assignItemToHero(currentLootItem, hero, () => {
                advanceNode();
            });
        }

        let currentTreasureItems = [];
        let selectedTreasureItem = null;

        function startTreasure(treasureId) {
            showScreen('screenTreasure');
            const descText = treasuresData[treasureId] || "Un antico forziere cattura la vostra attenzione.";
            document.getElementById('treasureDescBox').innerHTML = `<strong>Descrizione:</strong> ${descText}`;
        }

        function openTreasure() {
            showScreen('screenTreasureLoot');
            let coins = scaledCoins([5, 8, 10, 15], false);

            if (activeCurses.includes("Maledizione: -15% monete")) {
                coins = Math.floor(coins * 0.85);
            }

            partyCoins += coins;

            currentTreasureItems = [];
            for(let i = 0; i < 3; i++) {
                let randomItm = gameItems[Math.floor(Math.random() * gameItems.length)];
                currentTreasureItems.push(randomItm);
            }

            document.getElementById('treasureCoinsText').textContent = coins;
            document.getElementById('treasureAssignArea').classList.add('hidden');
            document.getElementById('btnExitTreasure').classList.remove('hidden');

            // Lo scrigno si apre, poi monete e oggetti compaiono come carte
            const chestDelay = playChestAnimation();
            coinFlightDelay = chestDelay;
            renderTreasureItemsGrid();
            document.querySelectorAll('#treasureItemsList .armory-btn').forEach((card, i) => revealAsCard(card, chestDelay + i * 160));
            updatePartyStatusBars();
            coinFlightDelay = 0;
        }

        function renderTreasureItemsGrid() {
            document.getElementById('treasureItemsList').innerHTML = currentTreasureItems.map((it, idx) => {
                if(!it) {
                    return `<div class="armory-btn taken"><span class="tile-text"><strong>Prelevato</strong></span></div>`;
                }
                return `
                    <button class="armory-btn" onclick="selectTreasureItem(${idx})">
                        ${itemIconHtml(it)}
                        <span class="tile-text">
                            <strong>${it.name}</strong>
                            <span class="tile-sub">${it.desc}</span>
                            <span class="tile-tag">Prendi</span>
                        </span>
                    </button>
                `;
            }).join('');
        }

        let selectedTreasureIndex = null;
        function selectTreasureItem(idx) {
            selectedTreasureIndex = idx;
            selectedTreasureItem = currentTreasureItems[idx];

            document.getElementById('treasureItemsList').classList.add('hidden');
            document.getElementById('btnExitTreasure').classList.add('hidden');
            document.getElementById('treasureAssignArea').classList.remove('hidden');

            document.getElementById('selectedTreasureName').textContent = selectedTreasureItem.name;
            document.getElementById('selectedTreasureDesc').textContent = selectedTreasureItem.desc;
            document.getElementById('treasureHeroSelect').innerHTML = heroOptionsForItem(selectedTreasureItem);
        }

        function cancelTreasureItemSelection() {
            document.getElementById('treasureAssignArea').classList.add('hidden');
            document.getElementById('treasureItemsList').classList.remove('hidden');
            document.getElementById('btnExitTreasure').classList.remove('hidden');
        }

        function confirmTreasureAssignment() {
            const hero = party.find(p => p.name === document.getElementById('treasureHeroSelect').value);
            expeditionStats.itemsFound++;
            assignItemToHero(selectedTreasureItem, hero, () => {
                currentTreasureItems[selectedTreasureIndex] = null;
                cancelTreasureItemSelection();
                renderTreasureItemsGrid();
            });
        }

        // Prezzo base per rarità: il mercante vende con una piccola oscillazione e compra a metà
        const ITEM_BASE_PRICE = { comune: 5, raro: 11, epico: 21 };
        const ITEM_PRICE_SPREAD = { comune: 1, raro: 2, epico: 3 };

        function itemSellPrice(item) {
            return Math.max(1, Math.floor(ITEM_BASE_PRICE[itemRarity(item)] / 2));
        }

        let merchantItemsWithPrices = [];
        let currentMerchantItem = null;

       function startMerchant(merchantId) {
    showScreen('screenMerchant');
    const descText = merchantsData[merchantId] || merchantsData.default || "Un mercante di passaggio offre i suoi beni.";
    document.getElementById('merchantDescBox').innerHTML = `<strong>Descrizione:</strong> ${descText}`;

    document.getElementById('merchantAssignArea').classList.add('hidden');
    document.getElementById('merchantItemsList').classList.remove('hidden');
    document.getElementById('btnExitMerchant').classList.remove('hidden');

    merchantItemsWithPrices = [];
    showMerchantTab('buy');
    
    // Divisione per rarità
    const commons = gameItems.filter(i => itemRarity(i) === 'comune');
    const rares = gameItems.filter(i => itemRarity(i) === 'raro');
    const epics = gameItems.filter(i => itemRarity(i) === 'epico');
    // Se manca una fascia di rarità si pesca dall'intero bottino
    const pick = pool => {
        const source = pool.length > 0 ? pool : gameItems;
        return source[Math.floor(Math.random() * source.length)];
    };

    // Il mercante offre sempre: 1 comune, 1 raro, 1 raro o epico
    let shopPool = [
        pick(commons),
        pick(rares),
        (Math.random() > 0.7 && epics.length > 0) ? pick(epics) : pick(rares)
    ];

    shopPool.forEach(item => {
        if (!item) return;
        const rarity = itemRarity(item);
        const spread = ITEM_PRICE_SPREAD[rarity];
        let basePrice = ITEM_BASE_PRICE[rarity] + Math.floor(Math.random() * (spread * 2 + 1)) - spread;

        // Applica gli sconti delle reliquie
        if (hasRelic("Moneta di fredlos")) basePrice = Math.floor(basePrice * 0.5);
        if (hasRelic("Lasciapassare mercantile")) basePrice = Math.max(1, basePrice - 3);
        // Maledizione: Rancore del Mercante (+2 monete su ogni articolo)
        if (hasCurse("Rancore del Mercante")) basePrice += 2;

        merchantItemsWithPrices.push({ item, price: basePrice });
    });

    renderMerchantShop();
}

        function renderMerchantShop() {
            document.getElementById('merchantItemsList').innerHTML = merchantItemsWithPrices.map((entry, idx) => {
                if(!entry) {
                    return `<div class="armory-btn taken"><span class="tile-text"><strong>Venduto</strong></span></div>`;
                }
                const canAfford = partyCoins >= entry.price;
                return `
                    <button class="armory-btn ${canAfford ? '' : 'unaffordable'}" onclick="tryBuyMerchantItem(${idx})">
                        ${itemIconHtml(entry.item)}
                        <span class="tile-text">
                            <strong>${entry.item.name}</strong>
                            <span class="tile-sub">${entry.item.desc}</span>
                        </span>
                        <span class="price ${canAfford ? '' : 'too-much'}"><span class="coin"></span>${entry.price}</span>
                    </button>
                `;
            }).join('');
        }

        function tryBuyMerchantItem(idx) {
            let entry = merchantItemsWithPrices[idx];
            if(partyCoins < entry.price) {
                alert("Non hai abbastanza monete per questo oggetto!");
                return;
            }

            partyCoins -= entry.price;
            currentMerchantItem = entry.item;
            merchantItemsWithPrices[idx] = null;

            document.getElementById('merchantItemsList').classList.add('hidden');
            document.getElementById('merchantTabs').classList.add('hidden');
            document.getElementById('btnExitMerchant').classList.add('hidden');
            document.getElementById('merchantAssignArea').classList.remove('hidden');
            document.getElementById('merchantHeroSelect').innerHTML = heroOptionsForItem(currentMerchantItem);

            updatePartyStatusBars();
        }

        function confirmMerchantAssignment() {
            const hero = party.find(p => p.name === document.getElementById('merchantHeroSelect').value);
            document.getElementById('merchantAssignArea').classList.add('hidden');
            assignItemToHero(currentMerchantItem, hero, () => {
                document.getElementById('merchantItemsList').classList.remove('hidden');
                document.getElementById('merchantTabs').classList.remove('hidden');
                document.getElementById('btnExitMerchant').classList.remove('hidden');
                renderMerchantShop();
            });
        }

        /* ==========================================================================
           GESTIONE SFIDE
           ========================================================================== */
        function startChallenge(challengeId) {
            showScreen('screenChallenge');
            challengeState = challengesData[challengeId] || {
                title: "Sfida",
                desc: "descrizione da scrivere",
                ignoreText: "descrizione da scrivere",
                successText: "descrizione da scrivere",
                failText: "descrizione da scrivere",
                stat: "str",
                cd: 6
            };

            document.getElementById('challengeTitle').textContent = challengeState.title;
            document.getElementById('challengeNarrativeBox').innerHTML = `<strong>Descrizione:</strong> ${challengeState.desc}`;

            document.getElementById('challengeStage1').classList.remove('hidden');
            document.getElementById('challengeStage2').classList.add('hidden');
            document.getElementById('diceChallengeSection').classList.add('hidden');
            document.getElementById('closeChallengeBtn').classList.add('hidden');

            document.getElementById('closeChallengeBtn').onclick = advanceNode;
        }

        function challengeChoose(approach) {
            if(!approach) {
                document.getElementById('challengeNarrativeBox').innerHTML = `<strong>Descrizione:</strong> ${challengeState.ignoreText}`;
                document.getElementById('challengeStage1').classList.add('hidden');
                document.getElementById('closeChallengeBtn').classList.remove('hidden');
                return;
            }
            document.getElementById('challengeNarrativeBox').innerHTML = `<strong>Descrizione:</strong> Un membro della compagnia si fa avanti per affrontare la prova.`;
            document.getElementById('challengeStage1').classList.add('hidden');
            document.getElementById('challengeStage2').classList.remove('hidden');
            document.getElementById('challengeHeroSelect').innerHTML = party.filter(p => p.hp > 0).map(h => {
                const mods = challengeModifiers(h);
                return `<option value="${h.name}">${h.name} (${STAT_LABELS[challengeState.stat] || 'Stat'} ${mods.statValue}) · ${challengeChanceInfo(mods).short}</option>`;
            }).join('');
        }

        let selectedChallengeHero = null;
        function confirmChallengeHero() {
            selectedChallengeHero = party.filter(p => p.hp > 0).find(p => p.name === document.getElementById('challengeHeroSelect').value);
            document.getElementById('challengeStage2').classList.add('hidden');
            document.getElementById('diceChallengeSection').classList.remove('hidden');

            const statLabel = STAT_LABELS[challengeState.stat] || 'Statistica';
            document.getElementById('challengeCdText').textContent = `Prova di ${statLabel} (Classe di Difficoltà: ${challengeState.cd})`;

            // Probabilità di riuscita prima del tiro, con gli stessi modificatori di executeChallengeRoll
            const mods = challengeModifiers(selectedChallengeHero);
            const info = challengeChanceInfo(mods);
            const chanceEl = document.getElementById('challengeChance');
            chanceEl.textContent = info.long;
            chanceEl.dataset.chance = info.pct >= 67 ? 'high' : (info.pct >= 34 ? 'mid' : 'low');

            const log = document.getElementById('challengeLog');
            log.innerHTML = '';
            log.classList.add('hidden');
            document.getElementById('rollChallengeBtn').disabled = false;
            document.getElementById('diceChallenge').textContent = "6";

            // Con vantaggio o svantaggio si mostrano due dadi già prima del tiro
            const rollMode = challengeRollMode(selectedChallengeHero);
            const twoDice = rollMode.mode !== 'single';
            const dice2 = document.getElementById('diceChallenge2');
            dice2.textContent = "6";
            dice2.classList.toggle('hidden', !twoDice);
            document.getElementById('diceChallenge').classList.remove('discarded');
            dice2.classList.remove('discarded');
            const note = document.getElementById('diceChallengeNote');
            note.textContent = rollMode.note || '';
            note.classList.toggle('hidden', !rollMode.note);
            document.getElementById('rollChallengeBtn').textContent =
                rollMode.mode === 'best' ? "Tira (2D6, tieni il migliore)" : (rollMode.mode === 'worst' ? "Tira (2D6, tieni il peggiore)" : "Tira (D6)");
        }

        // Come si tira in una prova: 'best' (vantaggio), 'worst' (svantaggio) o 'single'.
        // Vantaggio: abilità di Dioforo "Era solo una prova!" nelle prove di Intelligenza e Fede
        // (si controlla anche l'id dell'abilità per i salvataggi privi del flag).
        // Svantaggio: maledizione "Fede Inaridita" nelle prove di Fede. Se ci sono entrambi si annullano.
        function challengeRollMode(hero) {
            if (!hero || !challengeState) return { mode: 'single' };
            const stat = challengeState.stat;
            const advantage = (stat === 'int' || stat === 'fth') &&
                (!!hero.hasAdvantageOnIntFth || (hero.chosenAbility && hero.chosenAbility.id === 'dioforo_era_solo_una_prova'));
            const disadvantage = stat === 'fth' && hasCurse("Fede Inaridita");
            if (advantage && disadvantage) return { mode: 'single', note: 'Era solo una prova! e Fede Inaridita si annullano: un solo dado' };
            if (advantage) return { mode: 'best', note: `Era solo una prova! ${hero.name} tira due dadi e tiene il più alto`, source: 'Era solo una prova!' };
            if (disadvantage) return { mode: 'worst', note: 'Fede Inaridita: si tirano due dadi e si tiene il più basso', source: 'Fede Inaridita' };
            return { mode: 'single' };
        }

        const STAT_LABELS = { int: 'Intelligenza', fth: 'Fede', str: 'Forza' };

        // Modificatori di una prova per l'eroe scelto, senza consumare le reliquie
        function challengeModifiers(hero) {
            const statValue = (hero && hero[challengeState.stat]) || 0;
            const relics = [];
            if (hasRelic("Anello del giuramento")) relics.push({ name: "Anello del giuramento", val: 3 });
            if (hasRelic("Sigillo runico")) relics.push({ name: "Sigillo runico", val: 2 });
            return {
                statValue,
                relics,
                relicBonus: relics.reduce((sum, r) => sum + r.val, 0),
                rollMode: challengeRollMode(hero).mode,
                safetyNet: hasRelic("Frammento di matrice")
            };
        }

        function challengeChanceInfo(mods) {
            const needed = challengeState.cd - mods.statValue - mods.relicBonus;
            if (mods.safetyNet) return { short: 'Sicuro', long: 'Riuscita garantita: il Frammento di matrice trasforma un fallimento in successo', pct: 100 };
            return chanceText(needed, mods.rollMode === 'best', mods.rollMode === 'worst');
        }

        function addChallengeLog(text) {
            const log = document.getElementById('challengeLog');
            log.classList.remove('hidden');
            log.innerHTML += `<div>${text}</div>`;
            log.scrollTop = log.scrollHeight;
        }

        function executeChallengeRoll() {
            const rollBtn = document.getElementById('rollChallengeBtn');
            const diceBox = document.getElementById('diceChallenge');
            const diceBox2 = document.getElementById('diceChallenge2');
            const rollMode = challengeRollMode(selectedChallengeHero);
            const twoDice = rollMode.mode !== 'single';
            rollBtn.disabled = true; diceBox.classList.add('rolling');
            if (twoDice) diceBox2.classList.add('rolling');
            synthSfx('dice');

            let counter = 0;
            const interval = setInterval(() => {
                diceBox.textContent = Math.floor(Math.random() * 6) + 1;
                if (twoDice) diceBox2.textContent = Math.floor(Math.random() * 6) + 1;
                counter += 50;
                if(counter >= 500) {
                    clearInterval(interval);
                    let roll = Math.floor(Math.random() * 6) + 1;
                    diceBox.textContent = roll;
                    diceBox.classList.remove('rolling');

                    const mods = challengeModifiers(selectedChallengeHero);
                    const statLabel = STAT_LABELS[challengeState.stat] || 'Statistica';

                    // Vantaggio (tiene il più alto) o svantaggio (tiene il più basso)
                    if (twoDice) {
                        const roll2 = Math.floor(Math.random() * 6) + 1;
                        diceBox2.textContent = roll2;
                        diceBox2.classList.remove('rolling');
                        const best = rollMode.mode === 'best';
                        const kept = best ? Math.max(roll, roll2) : Math.min(roll, roll2);
                        const secondKept = best ? roll2 > roll : roll2 < roll;
                        (secondKept ? diceBox : diceBox2).classList.add('discarded');
                        document.getElementById('diceChallengeNote').textContent =
                            `${rollMode.source}: dadi [${roll}, ${roll2}], tiene ${kept}`;
                        addChallengeLog(`🎲 Dadi [${roll}, ${roll2}]: tiene <b>${kept}</b> (${rollMode.source})`);
                        roll = kept;
                    } else {
                        addChallengeLog(`🎲 Dado: <b>${roll}</b>`);
                    }

                    diceOutcomeSfx(roll);
                    const statValue = mods.statValue;
                    addChallengeLog(`+${statValue} ${statLabel} (${selectedChallengeHero ? selectedChallengeHero.name : '—'})`);

                    // Modificatori Reliquie Sfide
                    let relicBonus = 0;
                    if (hasRelic("Anello del giuramento")) {
                        relicBonus += 3;
                        breakRelic("Anello del giuramento");
                        addChallengeLog('+3 Anello del giuramento (la reliquia si rompe)');
                    }
                    if (hasRelic("Sigillo runico")) {
                        relicBonus += 2;
                        party.sigilloCharges = (party.sigilloCharges || 0) + 1;
                        const broken = party.sigilloCharges >= 2;
                        if (broken) breakRelic("Sigillo runico");
                        addChallengeLog(`+2 Sigillo runico (${broken ? 'la reliquia si rompe' : 'resta 1 prova'})`);
                    }

                    let total = roll + statValue + relicBonus;
                    addChallengeLog(`= <b>${total}</b> contro CD ${challengeState.cd}`);

                    // Reliquia: Frammento di matrice (converte il fallimento in successo)
                    if (total < challengeState.cd && hasRelic("Frammento di matrice")) {
                        total = challengeState.cd;
                        breakRelic("Frammento di matrice");
                        addChallengeLog('Frammento di matrice: il fallimento diventa un successo (la reliquia si rompe)');
                    }
                    addChallengeLog(total >= challengeState.cd ? '<b class="log-success">Successo</b>' : '<b class="log-fail">Fallimento</b>');

                    if(total >= challengeState.cd) {
                        let rewardMsg = "";
                        if (challengeState.reward) {
                            unlockedRelics.push(challengeState.reward);
                            applyEffects(challengeState.reward.effects);
                            if (challengeState.reward.type === 'relic') discover('relics', challengeState.reward.name);
                            rewardMsg = `<br><strong style="color:var(--relic-color);">Reliquia ottenuta: ${challengeState.reward.name} (${challengeState.reward.desc})</strong>`;
                            showOutcomeOverlay('relic', challengeState.reward);
                        }
                        expeditionStats.challengesPassed++;
                        document.getElementById('challengeNarrativeBox').innerHTML = `<strong>Successo! (${total} vs CD ${challengeState.cd})</strong><br>${challengeState.successText || 'Prova superata!'}${rewardMsg}`;

                        if (challengeState.stat === 'scelta_finale' || challengeState.title === "Accampamento") {
                            document.getElementById('closeChallengeBtn').onclick = () => showScreen('screenVictory');
                        } else {
                            document.getElementById('closeChallengeBtn').onclick = advanceNode;
                        }
                    } else {
                        let punishmentMsg = "";
                        if (challengeState.punishment) {
                            const cursesBefore = activeCurses.length;
                            applyEffects(challengeState.punishment.effects);
                            if (challengeState.punishment.type === 'curse') discover('curses', challengeState.punishment.name);
                            // Molte maledizioni modificano solo gli eroi: le registriamo comunque
                            // perché compaiano nel contatore in alto e nel Diario
                            if (activeCurses.length === cursesBefore) {
                                activeCurses.push(`${challengeState.punishment.name} (${challengeState.punishment.desc})`);
                            }
                            punishmentMsg = `<br><strong style="color:var(--curse-color);">Maledizione subita: ${challengeState.punishment.name} (${challengeState.punishment.desc})</strong>`;
                            showOutcomeOverlay('curse', challengeState.punishment);
                        }
                        expeditionStats.challengesFailed++;
                        document.getElementById('challengeNarrativeBox').innerHTML = `<strong>Fallimento! (${total} vs CD ${challengeState.cd})</strong><br>${challengeState.failText || 'Prova fallita!'}${punishmentMsg}`;
                        document.getElementById('closeChallengeBtn').onclick = advanceNode;
                    }

                    updatePartyStatusBars();
                    document.getElementById('closeChallengeBtn').classList.remove('hidden');
                }
            }, 50);
        }

        function startRest(restId) {
            showScreen('screenRest');
            const restDesc = restsData[restId] || "Trovate un luogo sicuro dove riposare e recuperare le forze.";
            document.getElementById('restDescBox').innerHTML = `<strong>Descrizione:</strong> ${restDesc}`;

            // Il riposo cura 1 HP a ogni eroe vivo (più l'eventuale bonus della reliquia), senza superare gli HP massimi
            const healAmount = 1 + (hasRelic("Unguento dell'erborista") ? 1 : 0);
            const healLines = [];
            party.forEach(h => {
                if (h.hp <= 0) return;
                const before = h.hp;
                h.hp = Math.min(h.maxHp, h.hp + healAmount);
                healLines.push(h.hp > before
                    ? `${esc(h.name)}: +${h.hp - before} HP (${h.hp}/${h.maxHp})`
                    : `${esc(h.name)}: già in piena salute`);
            });
            document.getElementById('restDescBox').innerHTML += `<br><br><strong>Il riposo vi ristora:</strong><br>${healLines.join('<br>')}`;
            // Maledizione: Gelo nelle ossa (-1 ai tiri per colpire) dura solo fino al prossimo riposo
            const geloIdx = activeCurses.findIndex(c => c.startsWith("Gelo nelle ossa"));
            if (geloIdx > -1) {
                activeCurses.splice(geloIdx, 1);
                party.forEach(h => { h.att_penalty = Math.max(0, (h.att_penalty || 0) - 1); });
                document.getElementById('restDescBox').innerHTML += `<br>Il calore del fuoco scioglie il <strong>Gelo nelle ossa</strong>: la penalità ai tiri per colpire svanisce.`;
            }

            // Reliquia: Pietra del focolare (rimuove 1 maledizione a caso)
            if (hasRelic("Pietra del focolare") && activeCurses.length > 0) {
                const rIdx = Math.floor(Math.random() * activeCurses.length);
                activeCurses.splice(rIdx, 1);
            }
            updatePartyStatusBars();
        }

        function startCaptainFinale() {
            showScreen('screenCaptain');
            document.getElementById('captainHeroSelect').innerHTML = party.filter(p => p.hp > 0).map(h => `<option value="${h.name}">${h.name}</option>`).join('');
        }

        let captainActionType = ''; let selectedCaptainHero = null;
        function captainAction(type) {
            captainActionType = type;
            selectedCaptainHero = party.find(p => p.name === document.getElementById('captainHeroSelect').value);
            document.getElementById('captainHeroSelect').style.display = 'none';
            document.getElementById('diceCaptainSection').classList.remove('hidden');
        }

        function executeCaptainRoll() {
            const rollBtn = document.getElementById('rollCaptainBtn');
            const diceBox = document.getElementById('diceCaptain');
            rollBtn.disabled = true; diceBox.classList.add('rolling');
            synthSfx('dice');

            let counter = 0;
            const interval = setInterval(() => {
                diceBox.textContent = Math.floor(Math.random() * 6) + 1;
                counter += 50;
                if(counter >= 500) {
                    clearInterval(interval);
                    const roll = Math.floor(Math.random() * 6) + 1;
                    diceBox.textContent = roll; diceBox.classList.remove('rolling');
                    diceOutcomeSfx(roll);

                    if (captainActionType === 'force') {
                        document.getElementById('resultCaptainLog').innerHTML = `<span style="color:#ff4d4d;">RAMANZINA!</span> Perdi il 50% degli HP.`;
                        selectedCaptainHero.hp = Math.max(1, Math.floor(selectedCaptainHero.hp / 2));
                    } else {
                        let statVal = captainActionType === 'faith' ? selectedCaptainHero.fth : selectedCaptainHero.int;
                        let cd = 6;
                        if(roll + statVal >= cd) {
                            document.getElementById('resultCaptainLog').innerHTML = `<span style="color:var(--gold);">VITTORIA!</span> Meta raggiunta!`;
                        } else {
                            document.getElementById('resultCaptainLog').innerHTML = `<span style="color:#ff4d4d;">FALLITO!</span>`;
                        }
                    }
                    updatePartyStatusBars();

                    const endBtn = document.getElementById('endGameBtn');
                    endBtn.classList.remove('hidden');
                    endBtn.textContent = "Vedi Vittoria / Fine Campagna";
                    endBtn.onclick = () => showScreen('screenVictory');
                }
            }, 50);
        }

        /* =========================================================
           INTERFACCIA "REIGN OF CHAOS": icone, tooltip, modali, tasti
           ========================================================= */
        const ICONS = {
            sword: '<path d="M19.5 4.5L9 15M19.5 4.5V8M19.5 4.5H16M6.5 12.5l5 5M8.2 15.8L4.5 19.5"/>',
            axe: '<path d="M5 20L15.5 6.5"/><path d="M12.5 4.5c3.2-1.4 6.6.6 7.5 4-2.2 0-4.2 1-5.3 3.1-1.3-2.4-2.2-4.6-2.2-7.1z"/>',
            spear: '<path d="M4.5 19.5L16 8"/><path d="M16 8l1.2-4.2L21 2.9l-.9 3.8z"/><path d="M13.5 6.5l4 4"/>',
            shield: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M12 7v10M8.5 11h7"/>',
            armor: '<path d="M8 4l4 2 4-2 4 3-2 4v9H6v-9L4 7z"/><path d="M9 12h6M12 6v14"/>',
            book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/><path d="M12 6.5v5M9.8 8.5h4.4"/>',
            potion: '<path d="M10 3h4M10.5 3v5L6 16a3 3 0 0 0 2.6 5h6.8A3 3 0 0 0 18 16l-4.5-8V3"/><path d="M8 14h8"/>',
            amulet: '<path d="M6 3l6 7.5L18 3"/><circle cx="12" cy="15" r="5"/><circle cx="12" cy="15" r="1.6"/>',
            ring: '<circle cx="12" cy="14.5" r="6"/><path d="M9.5 6.5L12 3l2.5 3.5L12 8.5z"/>',
            bag: '<path d="M9 4h6l-1.5 3h-3z"/><path d="M10.5 7C6 9 4 13 4 16a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4c0-3-2-7-6.5-9"/>',
            pouch: '<path d="M9 4h6l-1.5 3h-3z"/><path d="M10.5 7C6 9 4 13 4 16a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4c0-3-2-7-6.5-9"/><path d="M14 11.5h-3a1.3 1.3 0 0 0 0 2.6h2a1.3 1.3 0 0 1 0 2.6h-3M12 10.5v1M12 16.7v1"/>',
            skull: '<path d="M12 3a7 7 0 0 0-7 7c0 2.5 1.3 4 2.5 5v3h9v-3c1.2-1 2.5-2.5 2.5-5a7 7 0 0 0-7-7z"/><circle cx="9.3" cy="10.5" r="1.6"/><circle cx="14.7" cy="10.5" r="1.6"/><path d="M10 18v2.5M12 18v2.5M14 18v2.5"/>',
            question: '<circle cx="12" cy="12" r="9"/><path d="M9.3 9.3a2.8 2.8 0 1 1 4.2 2.4c-.9.5-1.5 1.2-1.5 2.2v.6"/><path d="M12 17.4v.2"/>',
            chest: '<rect x="3" y="10" width="18" height="10" rx="1"/><path d="M3 10c0-4 3-6 9-6s9 2 9 6M3 13.5h18"/><rect x="10.5" y="12" width="3" height="4"/>',
            fire: '<path d="M12 3c1 3 4.5 4.6 4.5 8.5a4.5 4.5 0 0 1-9 0c0-2 1-3.4 2.2-4.4 0 2 .9 3.2 2 3.2 0-3-1.1-4.3.3-7.3z"/><path d="M4 21l16-3.5M4 17.5L20 21"/>',
            crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/><path d="M5 16h14"/>',
            drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
            star: '<path d="M12 2.5l2.6 6 6.4.6-4.9 4.2 1.5 6.3L12 16.3 6.4 19.6l1.5-6.3L3 9.1l6.4-.6z"/>',
            rune: '<path d="M12 2l8 5v10l-8 5-8-5V7z"/><path d="M12 7v10M9 9.5l6 5M15 9.5l-6 5"/>'
        };

        function svgIcon(name) {
            return `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.bag}</svg>`;
        }

        function esc(str) {
            return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        function itemIconName(item) {
            const key = `${item.id || ''} ${item.name}`.toLowerCase();
            if (/pozione|unguento|balsamo/.test(key)) return 'potion';
            if (/ascia/.test(key)) return 'axe';
            if (/pugnale/.test(key)) return 'sword';
            if (/corazza/.test(key)) return 'armor';
            if (/balsamo/.test(key)) return 'potion';
            if (/alabarda/.test(key)) return 'spear';
            if (/spada/.test(key)) return 'sword';
            if (/scudo/.test(key)) return 'shield';
            if (/armatura/.test(key)) return 'armor';
            if (/libro|tomo/.test(key)) return 'book';
            if (/amuleto/.test(key)) return 'amulet';
            if (/anello/.test(key)) return 'ring';
            return 'bag';
        }

        // Rarità dell'oggetto; gli oggetti senza rarità contano come comuni
        const RARITY_LABELS = { comune: 'Comune', raro: 'Raro', epico: 'Epico' };
        function itemRarity(item) {
            return RARITY_LABELS[item && item.rarity] ? item.rarity : 'comune';
        }

        function itemCategory(item) {
            const icon = itemIconName(item);
            if (icon === 'potion') return 'consumable';
            if (['sword', 'axe', 'spear'].includes(icon)) return 'weapon';
            if (['shield', 'armor'].includes(icon)) return 'armor';
            return 'arcane';
        }

        // Icone raster in stile WC3 per tipo di oggetto; gli altri tipi usano l'icona SVG
        const ITEM_IMAGES = {
            axe: 'immagini/icone/BTNOrcMeleeUpOne.webp'
        };

        // Icone raster per singolo oggetto (id); hanno la precedenza su quelle per tipo
        const ITEM_IMAGES_BY_ID = {
            // Armi
            spada: 'immagini/icone/BTNSteelMelee.png',
            spada_affilata: 'immagini/icone/BTNThoriumMelee.png',
            spada_norgrad: 'immagini/icone/BTNArcaniteMelee.png',
            lama_acciaio_lunare: 'immagini/icone/BTNFrostMourne.png',
            pugnale_rapido: 'immagini/icone/BTNDaggerOfEscape.png',
            ascia: 'immagini/icone/BTNOrcMeleeUpOne.png',
            ascia_taglialegna: 'immagini/icone/BTNSturdyWarAxe.png',
            ascia_pesante: 'immagini/icone/BTNOrcMeleeUpThree.png',
            mannaia_pesante: 'immagini/icone/BTNOrcMeleeUpTwo.png',
            martello_breccia: 'immagini/icone/BTNHammer.png',
            alabarda: 'immagini/icone/BTNEnvenomedSpear.png',
            alabarda_guardia: 'immagini/icone/BTNImpalingBolt.png',
            bastone_rinforzato: 'immagini/icone/BTNAncestralStaff.png',

            // Scudi e armature (gli oggetti con lo stesso nome condividono l'icona)
            scudo: 'immagini/icone/BTNHumanArmorUpOne.png',
            scudo_legno: 'immagini/icone/BTNSteelArmor.png',
            scudo_ferro: 'immagini/icone/BTNHumanArmorUpTwo.png',
            scudo_pesante: 'immagini/icone/BTNShieldOfHonor.png',
            armatura_leggera: 'immagini/icone/BTNReinforcedHides.png',
            armatura_leggera_loot: 'immagini/icone/BTNReinforcedHides.png',
            corazza_cuoio: 'immagini/icone/BTNLeatherUpgradeOne.png',
            armatura_pesante: 'immagini/icone/BTNMoonArmor.png',
            armatura_pesante_loot: 'immagini/icone/BTNMoonArmor.png',
            corazza_scaglie: 'immagini/icone/BTNNagaArmorUp1.png',
            gorgiera_veterano: 'immagini/icone/BTNImprovedMoonArmor.png',
            corazza_piastre_leone: 'immagini/icone/BTNBladeBaneArmor.png',

            // Libri, amuleti e oggetti arcani
            libro_fede: 'immagini/icone/BTNSpellBookBLS.png',
            tomo_conoscenza: 'immagini/icone/BTNTomeOfIntelligence.png',
            tomo_proibito: 'immagini/icone/BTNBookOfTheDead.png',
            taccuino_cartografo: 'immagini/icone/BTNGerardsLostLedger.png',
            amuleto_legno_santo: 'immagini/icone/BTNPeriapt1.png',
            amuleto: 'immagini/icone/BTNAmulet.png',
            simbolo_jag_antar: 'immagini/icone/BTNPeriapt.png',
            reliquiario_tascabile: 'immagini/icone/BTNSacredRelic.png',
            cappa_sussurri: 'immagini/icone/BTNCloak.png',
            anello: 'immagini/icone/BTNRingPurple.png',

            // Consumabili
            unguento: 'immagini/icone/BTNHealingSalve.png',
            balsamo_curativo: 'immagini/icone/BTNSnazzyPotion.png',
            unguento_fortificante: 'immagini/icone/BTNPotionGreen.png',
            pozione: 'immagini/icone/BTNPotionRed.png',
            pozione_rigenerazione: 'immagini/icone/BTNPotionOfRestoration.png',
            elisir_sangue_vivo: 'immagini/icone/BTNPotionOfVampirism.png',

            // Oggetti non più presenti nelle campagne, tenuti per i vecchi salvataggi
            amuleto_viandante: 'immagini/icone/BTNNecklace.png',
            tomo_alchemico: 'immagini/icone/BTNSorceressMaster.png',
            corazza_nordica: 'immagini/icone/BTNLeatherUpgradeOne.png'
        };

        function itemImageSrc(item) {
            return ITEM_IMAGES_BY_ID[item.id] || ITEM_IMAGES[itemIconName(item)];
        }

        function itemIconInner(item) {
            const src = itemImageSrc(item);
            return src ? `<img class="item-img" src="${src}" alt="">` : svgIcon(itemIconName(item));
        }

        function itemIconHtml(item) {
            const hasImage = !!itemImageSrc(item);
            return `<span class="icon-frame ic-${itemCategory(item)} rar-${itemRarity(item)} ${hasImage ? 'has-img' : ''}">${itemIconInner(item)}</span>`;
        }

        // Icone raster WC3 per abilità, indicizzate per id abilità; le altre usano l'icona SVG
        const ABILITY_IMAGES = {
            astarte_veleni: 'immagini/icone/BTNCorrosiveBreath.png',
            astarte_affondo: 'immagini/icone/BTNSacrifice.png',
            icaro_oro: 'immagini/icone/BTNMagicalSentry.png',
            icaro_trucchi: 'immagini/icone/BTNSilence-Reforged.png',
            ascadeo_ghiaccio: 'immagini/icone/BTNFreezingBreath.png',
            ascadeo_segnato: 'immagini/icone/BTNFrostWolf.png',
            zeno_colpo_benedetto: 'immagini/icone/BTNInnerFire.png',
            zeno_addestramento: 'immagini/icone/BTNGauntletsOfOgrePower.png',
            dioforo_era_solo_una_prova: 'immagini/icone/BTNSnazzyScroll.png',
            dioforo_penna: 'immagini/icone/BTNBrilliance.png'
        };

        function abilityIconHtml(ability) {
            const src = ABILITY_IMAGES[ability.id];
            if (src) return `<span class="icon-frame ic-arcane has-img"><img class="item-img" src="${src}" alt=""></span>`;
            return `<span class="icon-frame ic-arcane">${svgIcon(ability.isCombatActive ? 'star' : 'rune')}</span>`;
        }

        function abilityCmdIconHtml(ability) {
            const src = ABILITY_IMAGES[ability.id];
            return src ? `<img class="cmd-img" src="${src}" alt="">` : svgIcon('star');
        }

        function abilityMarkHtml(ability) {
            const src = ABILITY_IMAGES[ability.id];
            return src ? `<img class="ability-mark" src="${src}" alt="">` : '★';
        }

        // Ritratti degli eroi per nome; senza ritratto si usa l'iniziale su sfondo colorato.
        // pos = punto dell'immagine da tenere al centro, zoom = ingrandimento sul volto
        // woundedSrc = ritratto usato quando l'eroe è ferito (vedi isHeroWounded),
        // con la sua inquadratura woundedPos / woundedZoom
        const HERO_PORTRAITS = {
            'Icaro': {
                src: 'immagini/ritratti/icaro.jpg',
                pos: '40% 33%',
                zoom: 1.9,
                woundedSrc: 'immagini/ritratti/icaro_ferito.jpg',
                woundedPos: '40% 34%',
                woundedZoom: 1.9
            },
            'Astarte': {
                src: 'immagini/ritratti/astarte.jpg',
                pos: '51% 42%',
                zoom: 1.9,
                woundedSrc: 'immagini/ritratti/astarte_ferita.jpg',
                woundedPos: '51% 38%',
                woundedZoom: 1.6
            },
            'Ascadeo': {
                src: 'immagini/ritratti/ascadeo.jpg',
                pos: '50% 38%',
                zoom: 2.2,
                woundedSrc: 'immagini/ritratti/ascadeo_ferito.jpg',
                woundedPos: '48% 40%',
                woundedZoom: 1.8
            },
            'Zeno': {
                src: 'immagini/ritratti/zeno.jpg',
                pos: '54% 34%',
                zoom: 1.4,
                woundedSrc: 'immagini/ritratti/zeno_ferito.jpg',
                woundedPos: '53% 30%',
                woundedZoom: 1.4
            }
        };

        // Precarica i ritratti "feriti" per evitare lo sfarfallio al cambio
        Object.values(HERO_PORTRAITS).forEach(p => { if (p.woundedSrc) new Image().src = p.woundedSrc; });

        // Ritratti indicati nei dati della campagna (campi "portrait" e "portraitWounded" dell'eroe,
        // ad es. caricati con l'editor): valgono per gli eroi che non hanno già un ritratto qui sopra.
        // Idea ripresa dal branch campaign-editor di Valerio.
        function registerCampaignHeroPortraits(heroes) {
            (heroes || []).forEach(h => {
                if (!h.portrait || HERO_PORTRAITS[h.name]) return;
                const pos = h.portraitPos || '50% 38%';
                const zoom = h.portraitZoom || 1.7;
                HERO_PORTRAITS[h.name] = { src: h.portrait, pos, zoom };
                if (h.portraitWounded) {
                    Object.assign(HERO_PORTRAITS[h.name], { woundedSrc: h.portraitWounded, woundedPos: pos, woundedZoom: zoom });
                    new Image().src = h.portraitWounded;
                }
            });
        }

        // Un eroe è ferito quando ha metà degli HP massimi o meno (2 su 4), ma è ancora in piedi
        function isHeroWounded(hp, maxHp) {
            return typeof hp === 'number' && typeof maxHp === 'number' && hp > 0 && hp <= maxHp / 2;
        }

        // Ritratto ferito: usa woundedSrc se presente, altrimenti applica l'effetto grafico "ferito"
        function heroPortraitInner(name, hp, maxHp) {
            const p = HERO_PORTRAITS[name];
            const wounded = isHeroWounded(hp, maxHp);
            const woundFx = '<span class="wound-fx" aria-hidden="true"></span>';
            if (!p) return `<span>${name.charAt(0)}</span>${wounded ? woundFx : ''}`;
            // Con un ritratto ferito dedicato basta l'immagine; senza, si usa l'effetto grafico
            if (wounded && p.woundedSrc) {
                const pos = p.woundedPos || p.pos;
                const zoom = p.woundedZoom || p.zoom;
                return `<img class="portrait-img" src="${p.woundedSrc}" alt="${name}" style="object-position:${pos}; transform:scale(${zoom}); transform-origin:${pos};">`;
            }
            const imgClass = wounded ? 'portrait-img is-wounded' : 'portrait-img';
            return `<img class="${imgClass}" src="${p.src}" alt="${name}" style="object-position:${p.pos}; transform:scale(${p.zoom}); transform-origin:${p.pos};">${wounded ? woundFx : ''}`;
        }

        // Cinematica d'attacco, solo per i colpi a segno: il ritratto dell'eroe attraversa
        // una banda diagonale e colpisce. Con un'abilità (ability non nullo) la cinematica
        // è più lunga e marcata: raggi, doppio taglio a X, scintille e nome dell'abilità.
        // Senza ritratto o con animazioni disattivate si passa subito al risultato.
        // Un click sulla cinematica la salta.
        function playHeroStrike(hero, ability, onDone) {
            const p = HERO_PORTRAITS[hero.name];
            if (!p || !animationsEnabled()) { onDone(); return; }
            const wounded = p.woundedSrc && isHeroWounded(hero.hp, hero.maxHp);
            const src = wounded ? p.woundedSrc : p.src;
            const pos = wounded ? (p.woundedPos || p.pos) : p.pos;

            const sparks = ability
                ? Array.from({ length: 14 }, (_, i) => `<span style="--a:${i * (360 / 14)}deg; --d:${140 + (i % 3) * 70}px;"></span>`).join('')
                : '';
            const overlay = document.createElement('div');
            overlay.className = `strike-cine${ability ? ' ability' : ''}`;
            overlay.setAttribute('aria-hidden', 'true');
            overlay.innerHTML = `
                ${ability ? '<div class="strike-rays"></div>' : ''}
                <div class="strike-band">
                    <div class="strike-lines"></div>
                    <div class="strike-hero"><img src="${src}" alt="" style="object-position:${pos};"></div>
                    <div class="strike-name">${esc(hero.name)}</div>
                    ${ability ? `<div class="strike-ability"><span>Abilità</span>${esc(ability.name)}</div>` : ''}
                </div>
                <div class="strike-slash"></div>
                ${ability ? '<div class="strike-slash second"></div><div class="strike-sparks">' + sparks + '</div>' : ''}
                <div class="strike-flash"></div>`;
            document.body.appendChild(overlay);

            let finished = false;
            const finish = () => {
                if (finished) return;
                finished = true;
                clearTimeout(timer);
                overlay.remove();
                onDone();
            };
            const timer = setTimeout(finish, ability ? 1700 : 1150);
            overlay.addEventListener('click', finish);
        }

        function heroPortraitClass(name) {
            return HERO_PORTRAITS[name] ? 'has-portrait' : '';
        }

        const HERO_HUES = [4, 212, 38, 285, 130];
        function heroHue(name) {
            const idx = campaignHeroes.findIndex(b => b.name === name);
            if (idx >= 0) return HERO_HUES[idx % HERO_HUES.length];
            let hash = 0;
            for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
            return hash;
        }

        function clampPct(value, max) {
            return max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
        }

        function hpClass(pct) {
            return pct > 60 ? '' : (pct > 30 ? 'hp-mid' : 'hp-low');
        }

        function heroCardHtml(h) {
            const hpPct = clampPct(h.hp, h.maxHp);
            const armorMax = Math.max(h.base_armor, h.current_armor);
            const armorPct = clampPct(h.current_armor, armorMax);
            const slotCount = Math.max(3, h.items.length);
            let slots = '';
            for (let i = 0; i < slotCount; i++) {
                const it = h.items[i];
                if (!it) { slots += `<div class="inv-slot empty"></div>`; continue; }
                const usable = it.type && it.type.startsWith('consumable');
                const tip = `${it.name}||${it.desc}${usable ? '<br><span class="tip-hint">Clicca per usare</span>' : ''}`;
                const hasImage = !!itemImageSrc(it);
                slots += `<div class="inv-slot ic-${itemCategory(it)} rar-${itemRarity(it)} ${usable ? 'usable' : ''} ${hasImage ? 'has-img' : ''}" data-tip="${esc(tip)}" ${usable ? `onclick="useConsumableFromTopbar('${h.name}', ${i})"` : ''}>${itemIconInner(it)}</div>`;
            }

            return `
                <div class="hero-mini-card ${h.hp <= 0 ? 'dead' : ''} ${heroTurnClass(h)}" data-hero="${esc(h.name)}">
                    <div class="hero-portrait ${heroPortraitClass(h.name)}" style="--hue:${heroHue(h.name)}">${heroPortraitInner(h.name, h.hp, h.maxHp)}</div>
                    <div class="hero-bars">
                        <div class="hero-card-name" title="${esc(h.name)}">${h.name}</div>
                        <div class="hp-bar-container" data-tip="Punti Vita||${h.hp} su ${h.maxHp}">
                            <div class="hp-bar-fill ${hpClass(hpPct)}" style="width: ${hpPct}%;"></div>
                            <div class="hp-bar-text">${h.hp}/${h.maxHp}</div>
                        </div>
                        <div class="hp-bar-container armor" data-tip="Armatura||${h.current_armor} attuale su ${h.base_armor} base. Assorbe i danni prima degli HP e si rigenera a ogni scontro.">
                            <div class="hp-bar-fill" style="width: ${armorPct}%;"></div>
                            <div class="hp-bar-text">${h.current_armor}/${h.base_armor}</div>
                        </div>
                    </div>
                    <div class="hero-stats">
                        <span data-tip="Forza||Si somma ai tiri di attacco, difesa e aiuto."><i>FOR</i>${h.str}</span>
                        <span data-tip="Intelligenza||Usata nelle prove di intelletto."><i>INT</i>${h.int}</span>
                        <span data-tip="Fede||Usata nelle prove di fede."><i>FED</i>${h.fth}</span>
                        <span data-tip="Danno||Danni inflitti con un attacco riuscito."><i>DAN</i>${h.dmg}</span>
                    </div>
                    ${h.chosenAbility ? `<div class="hero-ability" data-tip="${esc(h.chosenAbility.name + "||" + (h.chosenAbility.desc || ""))}">${abilityMarkHtml(h.chosenAbility)} ${h.chosenAbility.name}</div>` : ""}
                    <div class="hero-inventory">${slots}<span class="inv-label">Zaino</span></div>
                </div>`;
        }

        const NODE_ICON = { combat: 'sword', elite: 'skull', challenge: 'question', rest: 'fire', merchant: 'pouch', treasure: 'chest', captain: 'crown' };
        const NODE_LABEL = { combat: 'Scontro', elite: 'Scontro Elite', challenge: 'Sfida', rest: 'Riposo', merchant: 'Mercante', treasure: 'Tesoro', captain: 'Meta' };

        function renderMapLegend() {
            const legend = document.getElementById('mapLegend');
            if (legend.childElementCount > 0) return;
            legend.innerHTML = ['combat', 'elite', 'challenge', 'treasure', 'merchant', 'rest'].map(type => `
                <span><span class="sts-node node-${type} legend-dot">${svgIcon(NODE_ICON[type])}</span>${NODE_LABEL[type]}</span>
            `).join('') + `<span><span class="sts-node node-goal legend-dot">${svgIcon('crown')}</span>Meta</span>`;
        }

        /* ---------- Finestra modale ---------- */
        function openModal(title, bodyHtml, actions, options = {}) {
            document.querySelector('#wc3Modal .modal-box').classList.toggle('wide', !!options.wide);
            document.getElementById('wc3ModalTitle').textContent = title;
            document.getElementById('wc3ModalBody').innerHTML = bodyHtml;
            const actionsBox = document.getElementById('wc3ModalActions');
            actionsBox.innerHTML = '';
            (actions || [{ label: 'OK' }]).forEach(action => {
                const btn = document.createElement('button');
                btn.textContent = action.label;
                if (action.className) btn.className = action.className;
                if (action.disabled) btn.disabled = true;
                btn.addEventListener('click', () => {
                    closeModal();
                    if (action.onClick) action.onClick();
                });
                actionsBox.appendChild(btn);
            });
            document.getElementById('wc3Modal').classList.remove('hidden');
            const first = actionsBox.querySelector('button:not(:disabled)');
            if (first) first.focus();
        }

        function closeModal() {
            document.getElementById('wc3Modal').classList.add('hidden');
        }

        // Gli avvisi del gioco usano la finestra in stile WC3 invece di quella del browser
        window.alert = function(message) {
            openModal('Avviso', `<p>${message}</p>`, [{ label: 'OK' }]);
        };

        /* ---------- Tooltip ---------- */
        const tooltipEl = document.getElementById('wc3Tooltip');

        function positionTooltip(e) {
            const pad = 16;
            const rect = tooltipEl.getBoundingClientRect();
            let x = e.clientX + pad;
            let y = e.clientY + pad;
            if (x + rect.width > window.innerWidth - 8) x = e.clientX - rect.width - pad;
            if (y + rect.height > window.innerHeight - 8) y = e.clientY - rect.height - pad;
            tooltipEl.style.left = `${Math.max(8, x)}px`;
            tooltipEl.style.top = `${Math.max(8, y)}px`;
        }

        document.addEventListener('mouseover', e => {
            const target = e.target.closest('[data-tip]');
            if (!target) { tooltipEl.classList.remove('show'); return; }
            const [title, body] = target.dataset.tip.split('||');
            tooltipEl.innerHTML = `<div class="tip-title">${title}</div>${body ? `<div class="tip-body">${body}</div>` : ''}`;
            tooltipEl.classList.add('show');
            positionTooltip(e);
        });
        document.addEventListener('mousemove', e => {
            if (tooltipEl.classList.contains('show')) positionTooltip(e);
        });
        document.addEventListener('mousedown', () => tooltipEl.classList.remove('show'));

        /* ---------- Tasti rapidi (griglia QWER come la plancia comandi di WC3) ---------- */
        function isUsable(el) {
            return el && !el.disabled && el.offsetParent !== null;
        }

        document.addEventListener('keydown', e => {
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            const modalOpen = !document.getElementById('wc3Modal').classList.contains('hidden');
            if (modalOpen) {
                if (e.key === 'Escape') closeModal();
                return;
            }
            if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;

            const hotkeys = { q: 'cmdAttack', w: 'cmdDefend', e: 'cmdHelp', r: 'cmdItem', t: 'btnCombatAbility' };
            const cmd = document.getElementById(hotkeys[e.key.toLowerCase()]);
            if (isUsable(cmd)) { e.preventDefault(); cmd.click(); return; }

            if (e.key === ' ' && document.activeElement.tagName !== 'BUTTON') {
                const roll = ['rollCombatBtn', 'rollChallengeBtn', 'rollCaptainBtn']
                    .map(id => document.getElementById(id))
                    .find(isUsable);
                if (roll) { e.preventDefault(); roll.click(); }
            }
        });

        /* ---------- Segnaposto per immagini mancanti ---------- */
        function markMissingImage(img) {
            const box = img.parentElement;
            if (!box) return;
            box.classList.add('img-missing');
            box.setAttribute('data-alt', img.alt || '');
        }
        document.addEventListener('error', e => {
            if (e.target.tagName === 'IMG') markMissingImage(e.target);
        }, true);
        document.addEventListener('load', e => {
            if (e.target.tagName === 'IMG' && e.target.parentElement) e.target.parentElement.classList.remove('img-missing');
        }, true);
        document.querySelectorAll('img').forEach(img => {
            if (img.complete && img.naturalWidth === 0) markMissingImage(img);
        });

        /* ---------- Numeri fluttuanti e colpi ---------- */
        const fxLayer = document.createElement('div');
        fxLayer.className = 'fx-layer';
        document.body.appendChild(fxLayer);

        const fxHeroSeen = new WeakMap();   // eroe -> { hp, armor } dell'ultimo aggiornamento
        const fxEnemySeen = new WeakMap();  // nemico -> { hp, stunned }
        let fxNextEnemyHitCritical = false;

        // Scritte ravvicinate sullo stesso bersaglio vengono impilate per non sovrapporsi
        const fxStacks = new Map();

        function fxFloatOn(el, text, kind, delay = 0) {
            if (!gameOptions.floatingNumbers || !el || el.offsetParent === null) return;
            const rect = el.getBoundingClientRect();
            const key = el.id || el.dataset.hero || 'fx';
            const now = performance.now();
            const stack = fxStacks.get(key);
            const slot = stack && now - stack.time < 500 ? stack.slot + 1 : 0;
            fxStacks.set(key, { time: now, slot });

            const float = document.createElement('div');
            float.className = `fx-float ${kind}`;
            float.textContent = text;
            float.style.left = `${rect.left + rect.width / 2 + (Math.random() * 16 - 8)}px`;
            float.style.top = `${rect.top + Math.min(rect.height * 0.25, 40) - slot * 30}px`;
            float.style.animationDelay = `${delay}ms`;
            fxLayer.appendChild(float);
            setTimeout(() => float.remove(), 1200 + delay);
        }

        function fxHit(el) {
            if (!el || !animationsEnabled()) return;
            el.classList.remove('fx-hit');
            void el.offsetWidth;
            el.classList.add('fx-hit');
            setTimeout(() => el.classList.remove('fx-hit'), 450);
        }

        function heroCardEl(hero) {
            return document.querySelector(`.hero-mini-card[data-hero="${CSS.escape(hero.name)}"]`);
        }

        function fxFloatOnHero(hero, text, kind) {
            fxFloatOn(heroCardEl(hero), text, kind);
        }

        // Confronta HP e armatura degli eroi con l'aggiornamento precedente e mostra le variazioni
        function fxDiffHeroes() {
            party.forEach(hero => {
                const prev = fxHeroSeen.get(hero);
                fxHeroSeen.set(hero, { hp: hero.hp, armor: hero.current_armor });
                if (!prev) return;
                const card = heroCardEl(hero);
                const dHp = hero.hp - prev.hp;
                const dArmor = hero.current_armor - prev.armor;
                if (dHp < 0 || dArmor < 0) fxHit(card);
                if (dArmor < 0) synthSfx('armor');
                if (dHp < 0) setTimeout(() => synthSfx('hit'), dArmor < 0 ? 180 : 0);
                if (dArmor < 0) fxFloatOn(card, `${dArmor} Armatura`, 'armor');
                if (dArmor > 0) fxFloatOn(card, `+${dArmor} Armatura`, 'armor');
                if (dHp < 0) fxFloatOn(card, `${dHp}`, 'dmg', dArmor !== 0 ? 180 : 0);
                if (dHp > 0) fxFloatOn(card, `+${dHp}`, 'heal');
            });
        }

        // Registra lo stato attuale senza animazioni (es. armature ripristinate a inizio scontro)
        function fxResyncHeroes() {
            party.forEach(hero => fxHeroSeen.set(hero, { hp: hero.hp, armor: hero.current_armor }));
        }

        function fxDiffEnemy() {
            if (!activeEnemy) return;
            const prev = fxEnemySeen.get(activeEnemy);
            fxEnemySeen.set(activeEnemy, { hp: activeEnemy.hp, stunned: activeEnemy.isStunned });
            const box = document.getElementById('enemyInfo');
            if (activeEnemy.hp > 0) box.classList.remove('defeated');
            if (!prev) return;
            if (activeEnemy.hp <= 0 && prev.hp > 0) onEnemyDefeated(box);
            const dHp = activeEnemy.hp - prev.hp;
            if (dHp < 0) {
                fxHit(box);
                synthSfx('enemy');
                fxFloatOn(box, `${dHp}`, fxNextEnemyHitCritical ? 'crit' : 'dmg');
            }
            if (activeEnemy.isStunned && !prev.stunned) fxFloatOn(box, 'Stordito', 'stun', 200);
            fxNextEnemyHitCritical = false;
        }

        /* ---------- Testo narrativo a macchina da scrivere ---------- */
        const TYPE_MIN_LENGTH = 40;
        const typingState = new WeakMap();

        function stopTypewriter(box, reveal) {
            const state = typingState.get(box);
            if (!state) return;
            cancelAnimationFrame(state.raf);
            if (reveal) state.parts.forEach(p => { p.node.data = p.text; });
            box.classList.remove('typing');
            box.removeAttribute('title');
            typingState.delete(box);
        }

        function startTypewriter(box) {
            stopTypewriter(box, false);
            delete box.dataset.typePending;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || gameOptions.textSpeed <= 0) return;

            const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
            const parts = [];
            while (walker.nextNode()) parts.push({ node: walker.currentNode, text: walker.currentNode.data });
            const total = parts.reduce((sum, p) => sum + p.text.length, 0);
            if (total < TYPE_MIN_LENGTH) return;

            parts.forEach(p => { p.node.data = ''; });
            box.classList.add('typing');
            box.title = 'Clicca per mostrare tutto il testo';
            const state = { parts, raf: null, index: 0 };
            typingState.set(box, state);

            const step = () => {
                let budget = gameOptions.textSpeed;
                while (budget > 0 && state.index < parts.length) {
                    const p = parts[state.index];
                    const shown = p.node.data.length;
                    const take = Math.min(budget, p.text.length - shown);
                    p.node.data = p.text.slice(0, shown + take);
                    budget -= take;
                    if (p.node.data.length >= p.text.length) state.index++;
                }
                if (state.index < parts.length) state.raf = requestAnimationFrame(step);
                else stopTypewriter(box, true);
            };
            state.raf = requestAnimationFrame(step);
        }

        // Ogni volta che il gioco scrive un nuovo testo nel riquadro, parte l'effetto
        const typeObserver = new MutationObserver(mutations => {
            const boxes = new Set(mutations.map(m => m.target));
            boxes.forEach(box => {
                if (box.offsetParent === null) {
                    stopTypewriter(box, false);
                    box.dataset.typePending = '1';
                } else {
                    startTypewriter(box);
                }
            });
        });
        document.querySelectorAll('.narrative-desc-box').forEach(box => typeObserver.observe(box, { childList: true }));

        // Testi scritti mentre la schermata era nascosta: partono quando diventa visibile
        function startPendingTypewriters(screen) {
            screen.querySelectorAll('.narrative-desc-box[data-type-pending]').forEach(startTypewriter);
        }

        document.addEventListener('click', e => {
            const box = e.target.closest('.narrative-desc-box.typing');
            if (box) stopTypewriter(box, true);
        });

        /* ---------- 19. Opzioni di gioco ---------- */
        const DEFAULT_OPTIONS = { textSpeed: 2, textSize: 1, musicVolume: 0.5, sfxVolume: 0.8, animations: true, floatingNumbers: true };
        let gameOptions = Object.assign({}, DEFAULT_OPTIONS);
        try { Object.assign(gameOptions, JSON.parse(localStorage.getItem('dignitas_options') || '{}')); } catch (e) {}

        function saveOptions() {
            try { localStorage.setItem('dignitas_options', JSON.stringify(gameOptions)); } catch (e) {}
        }

        function animationsEnabled() {
            return gameOptions.animations && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }

        function applyOptions() {
            document.body.classList.toggle('no-anim', !gameOptions.animations);
            updateMenuVideo();
            document.body.style.setProperty('--text-scale', gameOptions.textSize);
            const music = document.getElementById('menuMusic');
            if (!music.paused) {
                clearInterval(musicFadeTimer);
                music.volume = gameOptions.musicVolume;
            }
        }

        /* ---------- Compendio: nemici, reliquie, maledizioni e oggetti scoperti in tutte le partite ---------- */
        const COMPENDIUM_KEY = 'dignitas_compendium';
        const COMPENDIUM_KINDS = ['enemies', 'relics', 'curses', 'items'];
        const compendium = (() => {
            let saved = {};
            try { saved = JSON.parse(localStorage.getItem(COMPENDIUM_KEY) || '{}'); } catch (e) {}
            return Object.fromEntries(COMPENDIUM_KINDS.map(k => [k, new Set(saved[k] || [])]));
        })();

        function discover(kind, key) {
            if (!key || compendium[kind].has(key)) return;
            compendium[kind].add(key);
            try {
                localStorage.setItem(COMPENDIUM_KEY, JSON.stringify(Object.fromEntries(COMPENDIUM_KINDS.map(k => [k, [...compendium[k]]]))));
            } catch (e) {}
        }

        // Tutte le voci possibili, lette dai dati delle campagne (senza doppioni)
        function compendiumCatalog() {
            const catalog = { enemies: [], relics: [], curses: [], items: [] };
            const seen = { relics: new Set(), curses: new Set(), items: new Set() };
            const addItem = item => {
                if (!item || seen.items.has(item.id)) return;
                seen.items.add(item.id);
                catalog.items.push({ key: item.id, item });
            };
            Object.values(campaignsDatabase).forEach(camp => {
                Object.entries(camp.enemies || {}).forEach(([k, e]) => catalog.enemies.push({ key: `${camp.id}:${k}`, enemy: e, campaign: camp.title }));
                Object.values(camp.challenges || {}).forEach(ch => {
                    if (ch.reward && ch.reward.type === 'relic' && !seen.relics.has(ch.reward.name)) {
                        seen.relics.add(ch.reward.name);
                        catalog.relics.push({ key: ch.reward.name, entry: ch.reward, campaign: camp.title });
                    }
                    if (ch.punishment && ch.punishment.type === 'curse' && !seen.curses.has(ch.punishment.name)) {
                        seen.curses.add(ch.punishment.name);
                        catalog.curses.push({ key: ch.punishment.name, entry: ch.punishment, campaign: camp.title });
                    }
                });
                (camp.initialArmory || []).forEach(addItem);
                (camp.lootItems || []).forEach(addItem);
            });
            DEFAULT_GAME_ITEMS.forEach(addItem);
            return catalog;
        }

        const COMPENDIUM_TABS = [
            { kind: 'enemies', label: 'Nemici' },
            { kind: 'relics', label: 'Reliquie' },
            { kind: 'curses', label: 'Maledizioni' },
            { kind: 'items', label: 'Oggetti' }
        ];

        function compendiumCardHtml(kind, v) {
            const known = compendium[kind].has(v.key);
            if (!known) {
                return `<div class="codex-card unknown"><span class="icon-frame">${svgIcon('question')}</span><span class="tile-text"><strong>???</strong><span class="tile-sub">Non ancora scoperto</span></span></div>`;
            }
            if (kind === 'items') {
                return `<div class="codex-card">${itemIconHtml(v.item)}<span class="tile-text"><strong>${esc(v.item.name)}</strong><span class="tile-sub">${esc(v.item.desc)}</span><span class="tile-tag">${esc(RARITY_LABELS[itemRarity(v.item)] || '')}</span></span></div>`;
            }
            if (kind === 'enemies') {
                const e = v.enemy;
                return `<div class="codex-card"><span class="icon-frame ic-arcane">${svgIcon('skull')}</span><span class="tile-text"><strong>${esc(e.name)}</strong>
                    <span class="tile-sub">HP ${e.maxHp} · CA ${e.ca} · Attacco ${e.att} · Danno ${e.dmg}</span><span class="tile-tag">${esc(v.campaign)}</span></span></div>`;
            }
            const img = kind === 'relics' ? 'immagini/icone/BTNEnchantedGemstone.png' : 'immagini/icone/BTNOrbOfCorruption.png';
            return `<div class="codex-card"><span class="icon-frame has-img"><img class="item-img" src="${img}" alt=""></span><span class="tile-text"><strong>${esc(v.entry.name)}</strong>
                <span class="tile-sub">${esc(v.entry.desc)}</span><span class="tile-tag">${esc(v.campaign)}</span></span></div>`;
        }

        function openCompendium(kind = 'enemies') {
            const catalog = compendiumCatalog();
            const tabs = COMPENDIUM_TABS.map(t => {
                const found = catalog[t.kind].filter(v => compendium[t.kind].has(v.key)).length;
                return `<button class="btn-small codex-tab ${t.kind === kind ? 'active' : ''}" onclick="openCompendium('${t.kind}')">${t.label} <span>${found}/${catalog[t.kind].length}</span></button>`;
            }).join('');
            const cards = catalog[kind].map(v => compendiumCardHtml(kind, v)).join('') || '<p class="panel-label">Nessuna voce.</p>';
            openModal('Compendio', `<div class="codex-tabs">${tabs}</div><div class="codex-grid">${cards}</div>`,
                [{ label: 'Chiudi', className: 'btn-proceed' }], { wide: true });
        }

        function openHowToPlay() {
            openModal('Come si gioca', `
                <div class="howto">
                    <p>Scegli una campagna, componi la compagnia e assegna a ogni eroe un'abilità e un oggetto iniziale.</p>
                    <p>Sulla mappa avanza di livello in livello: <b>scontri</b>, <b>sfide</b>, <b>tesori</b>, <b>mercanti</b> e <b>riposi</b>. Il boss attende in cima.</p>
                    <p>In combattimento ogni eroe tira un d6 e aggiunge la Forza: <b>Attacca</b> contro la CA del nemico, <b>Difendi</b> e <b>Aiuta</b> contro il suo Attacco.</p>
                    <p>Nelle sfide si tira un d6 più Intelligenza o Fede contro la Classe di Difficoltà. Superarle dà reliquie, fallirle maledizioni.</p>
                    <p>Tasti rapidi in combattimento: <span class="keycap">Q</span><span class="keycap">W</span><span class="keycap">E</span><span class="keycap">R</span><span class="keycap">T</span> azioni, <span class="keycap">Spazio</span> tira il dado.</p>
                </div>`, [{ label: 'Chiudi', className: 'btn-proceed' }], { wide: true });
        }

        function openOptions() {
            const speeds = [[1, 'Lenta'], [2, 'Normale'], [4, 'Veloce'], [0, 'Istantanea']];
            const sizes = [[1, 'Normale'], [1.15, 'Grande'], [1.3, 'Molto grande']];
            const pct = v => Math.round(v * 100);
            openModal('Opzioni', `
                <div class="options-grid">
                    <div class="option-row">
                        <span class="option-label">Velocità del testo<small>Descrizioni scritte a macchina</small></span>
                        <select id="optTextSpeed">${speeds.map(([v, l]) => `<option value="${v}" ${gameOptions.textSpeed === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
                    </div>
                    <div class="option-row">
                        <span class="option-label">Dimensione del testo<small>Descrizioni, registro, oggetti e finestre</small></span>
                        <select id="optTextSize">${sizes.map(([v, l]) => `<option value="${v}" ${gameOptions.textSize === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
                    </div>
                    <div class="option-row">
                        <span class="option-label">Audio<small>Musica ed effetti sonori</small></span>
                        <label class="option-toggle"><input type="checkbox" id="optMuted" ${soundMuted ? 'checked' : ''}> Silenzia tutto</label>
                    </div>
                    <div class="option-row">
                        <span class="option-label">Volume musica</span>
                        <div class="option-range"><input type="range" id="optMusic" min="0" max="100" value="${pct(gameOptions.musicVolume)}"><output id="optMusicOut">${pct(gameOptions.musicVolume)}%</output></div>
                    </div>
                    <div class="option-row">
                        <span class="option-label">Volume effetti</span>
                        <div class="option-range"><input type="range" id="optSfx" min="0" max="100" value="${pct(gameOptions.sfxVolume)}"><output id="optSfxOut">${pct(gameOptions.sfxVolume)}%</output></div>
                    </div>
                    <div class="option-row">
                        <span class="option-label">Effetti animati<small>Titoli degli eventi, scrigno, carte, tremolii</small></span>
                        <label class="option-toggle"><input type="checkbox" id="optAnim" ${gameOptions.animations ? 'checked' : ''}> Attivi</label>
                    </div>
                    <div class="option-row">
                        <span class="option-label">Numeri fluttuanti<small>Danni, cure e armatura sopra i bersagli</small></span>
                        <label class="option-toggle"><input type="checkbox" id="optNumbers" ${gameOptions.floatingNumbers ? 'checked' : ''}> Attivi</label>
                    </div>
                </div>`,
                [
                    { label: 'Chiudi', className: 'btn-proceed' },
                    { label: 'Ripristina predefinite', onClick: () => { gameOptions = Object.assign({}, DEFAULT_OPTIONS); saveOptions(); applyOptions(); openOptions(); } }
                ]);

            const bind = (id, event, handler) => document.getElementById(id).addEventListener(event, e => { handler(e.target); saveOptions(); });
            bind('optTextSpeed', 'change', el => { gameOptions.textSpeed = Number(el.value); });
            bind('optTextSize', 'change', el => { gameOptions.textSize = Number(el.value); applyOptions(); });
            document.getElementById('optMuted').addEventListener('change', e => setSoundMuted(e.target.checked));
            bind('optMusic', 'input', el => {
                gameOptions.musicVolume = el.value / 100;
                document.getElementById('optMusicOut').textContent = `${el.value}%`;
                applyOptions();
            });
            bind('optSfx', 'input', el => {
                gameOptions.sfxVolume = el.value / 100;
                document.getElementById('optSfxOut').textContent = `${el.value}%`;
            });
            document.getElementById('optSfx').addEventListener('change', () => playSfx(CLICK_SFX, 0.8));
            bind('optAnim', 'change', el => { gameOptions.animations = el.checked; applyOptions(); });
            bind('optNumbers', 'change', el => { gameOptions.floatingNumbers = el.checked; });
        }

        /* ---------- Schermata del capitolo prima della mappa ---------- */
        function startExpedition() {
            if (!animationsEnabled() || !currentCampaign) { startMap(); return; }

            const overlay = document.createElement('div');
            overlay.className = 'chapter-overlay';
            overlay.innerHTML = `
                <div class="chapter-content">
                    <div class="chapter-kicker">La spedizione ha inizio</div>
                    <div class="chapter-title">${currentCampaign.title}</div>
                    <div class="chapter-rule"></div>
                    <div class="chapter-sub">${currentCampaign.badge || ''}</div>
                    <div class="chapter-skip">Clicca per continuare</div>
                </div>`;
            document.body.appendChild(overlay);
            void overlay.offsetWidth;
            overlay.classList.add('show');

            // La mappa viene preparata sotto lo schermo nero, poi il titolo sfuma
            let finished = false;
            const finish = () => {
                if (finished) return;
                finished = true;
                clearTimeout(autoTimer);
                startMap();
                overlay.classList.remove('show');
                setTimeout(() => overlay.remove(), 850);
            };
            const autoTimer = setTimeout(finish, 3200);
            setTimeout(() => overlay.addEventListener('click', finish), 400);
        }

        /* ---------- 1 e 6. Eroe di turno e barra dei turni ---------- */
        function heroTurnClass(h) {
            if (currentScreenId !== 'screenCombat' || h.hp <= 0) return '';
            if (combatPhase === 'heroes') {
                if (h === currentActiveHero && !h.hasActed) return 'is-turn';
                if (h.hasActed) return 'has-acted';
                return currentActiveHero ? 'is-waiting' : '';
            }
            if (combatPhase === 'monster') return 'is-waiting';
            return '';
        }

        function renderTurnBar() {
            const bar = document.getElementById('turnOrderBar');
            if (!bar) return;
            if (currentScreenId !== 'screenCombat' || !activeEnemy || combatPhase === 'none') { bar.innerHTML = ''; return; }

            const heroChips = party.filter(h => h.hp > 0).map(h => {
                const state = combatPhase === 'won' || h.hasActed ? 'done' : (h === currentActiveHero ? 'current' : '');
                const note = state === 'done' ? 'Ha già agito in questo round' : (state === 'current' ? 'Sta agendo' : 'Deve ancora agire');
                const inner = HERO_PORTRAITS[h.name] ? heroPortraitInner(h.name, h.hp, h.maxHp) : h.name.charAt(0);
                return `<span class="turn-chip ${state}" style="--hue:${heroHue(h.name)}" data-tip="${esc(h.name)}||${note}">${inner}</span>`;
            }).join('');
            const enemyState = combatPhase === 'monster' ? 'current' : (combatPhase === 'won' ? 'done' : '');
            const enemyNote = combatPhase === 'monster' ? 'Sta attaccando' : (combatPhase === 'won' ? 'Sconfitto' : 'Attacca dopo la compagnia');
            bar.innerHTML = `
                <span class="turn-round">Round ${combatRound}</span>
                ${heroChips}
                <span class="turn-sep">▶</span>
                <span class="turn-chip enemy ${enemyState}" data-tip="${esc(activeEnemy.name)}||${enemyNote}">${svgIcon('skull')}</span>`;
        }

        /* ---------- 7. Nemico sconfitto ---------- */
        function onEnemyDefeated(box) {
            combatPhase = 'won';
            expeditionStats.combatsWon++;
            box.classList.add('defeated');
            const stamp = document.createElement('div');
            stamp.className = 'victory-stamp';
            stamp.textContent = 'Vittoria!';
            box.appendChild(stamp);
            document.getElementById('combatLootBtn').classList.add('btn-attention');
        }

        /* ---------- 10. Avanzamento della spedizione ---------- */
        function renderExpeditionProgress(maxLevel) {
            const el = document.getElementById('expeditionProgress');
            const doneLevels = stsMapNodes.filter(n => n.done).map(n => n.level);
            const completed = doneLevels.length ? Math.max(...doneLevels) + 1 : 0;
            const total = maxLevel + 1;
            let segments = '';
            for (let level = 0; level < total; level++) {
                const cls = level < completed ? 'done' : (level === completed ? 'current' : '');
                segments += `<span class="progress-seg ${cls}"></span>`;
            }
            el.innerHTML = `
                <span class="progress-label">Livello ${Math.min(completed + 1, total)} / ${total}</span>
                <div class="progress-track">${segments}</div>
                <span class="progress-boss ${completed >= total ? 'reached' : ''}" data-tip="Meta finale||Livello ${total}">${svgIcon('crown')}</span>`;
        }

        /* ---------- 11. Scrigno che si apre ---------- */
        // Restituisce dopo quanti ms lo scrigno è aperto (0 se le animazioni sono disattivate)
        function playChestAnimation() {
            if (!animationsEnabled()) return 0;
            const overlay = document.createElement('div');
            overlay.className = 'chest-overlay';
            overlay.innerHTML = `
                <div class="chest-stage">
                    <div class="chest-rays"></div>
                    <svg class="chest-svg" viewBox="0 0 220 200" aria-hidden="true">
                        <defs>
                            <linearGradient id="chestWood" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stop-color="#7a4a22"/><stop offset="1" stop-color="#2e1706"/>
                            </linearGradient>
                        </defs>
                        <ellipse class="chest-glow" cx="110" cy="90" rx="72" ry="12" fill="#ffe28a"/>
                        <rect x="30" y="88" width="160" height="82" rx="4" fill="url(#chestWood)" stroke="#000" stroke-width="3"/>
                        <rect x="30" y="100" width="160" height="9" fill="url(#gradGold)" stroke="#000"/>
                        <rect x="30" y="150" width="160" height="9" fill="url(#gradGold)" stroke="#000"/>
                        <rect x="58" y="88" width="12" height="82" fill="url(#gradGold)" stroke="#000"/>
                        <rect x="150" y="88" width="12" height="82" fill="url(#gradGold)" stroke="#000"/>
                        <rect x="97" y="94" width="26" height="28" rx="3" fill="url(#gradGold)" stroke="#000" stroke-width="2"/>
                        <circle cx="110" cy="106" r="4" fill="#000"/><rect x="108.5" y="106" width="3" height="9" fill="#000"/>
                        <g class="chest-lid">
                            <path d="M30 88 V68 Q30 44 62 44 H158 Q190 44 190 68 V88 Z" fill="url(#chestWood)" stroke="#000" stroke-width="3"/>
                            <rect x="58" y="45" width="12" height="43" fill="url(#gradGold)" stroke="#000"/>
                            <rect x="150" y="45" width="12" height="43" fill="url(#gradGold)" stroke="#000"/>
                            <rect x="30" y="78" width="160" height="10" fill="url(#gradGold)" stroke="#000"/>
                        </g>
                    </svg>
                </div>`;
            document.body.appendChild(overlay);
            setTimeout(() => overlay.remove(), 1600);
            return 1250;
        }

        /* ---------- 12. Monete che volano verso il contatore ---------- */
        let displayedCoins = 0;
        let coinFlightDelay = 0;
        let coinTickTimeout = null;
        const COIN_FLY_SCREENS = ['screenLoot', 'screenTreasureLoot', 'screenCombat', 'screenChallenge', 'screenRest'];

        function setCoinText(value) {
            document.getElementById('topBarCoins').textContent = value;
        }

        function coinSourceElement() {
            const sources = { screenLoot: 'lootCoinsText', screenTreasureLoot: 'treasureCoinsText', screenCombat: 'enemyInfo' };
            return document.getElementById(sources[currentScreenId] || 'gameContainer');
        }

        let coinTickInterval = null;

        // Timer invece di requestAnimationFrame: il valore finale arriva anche con la scheda in background
        function tickCoinCounter(from, to, delay, duration, onDone) {
            clearTimeout(coinTickTimeout);
            clearInterval(coinTickInterval);
            coinTickTimeout = setTimeout(() => {
                const start = Date.now();
                coinTickInterval = setInterval(() => {
                    const p = Math.min(1, (Date.now() - start) / duration);
                    setCoinText(Math.round(from + (to - from) * p));
                    if (p >= 1) {
                        clearInterval(coinTickInterval);
                        if (onDone) onDone();
                    }
                }, 30);
            }, delay);
        }

        function spawnFlyingCoins(srcEl, dstEl, count, delay) {
            const s = srcEl.getBoundingClientRect();
            const d = dstEl.getBoundingClientRect();
            for (let i = 0; i < count; i++) {
                const coin = document.createElement('div');
                coin.className = 'fly-coin';
                coin.innerHTML = '<span class="coin"></span>';
                coin.style.left = `${s.left + s.width / 2 + (Math.random() * 60 - 30)}px`;
                coin.style.top = `${s.top + s.height / 2 + (Math.random() * 40 - 20)}px`;
                coin.style.opacity = '0';
                document.body.appendChild(coin);
                setTimeout(() => {
                    coin.style.opacity = '1';
                    coin.style.left = `${d.left + 20}px`;
                    coin.style.top = `${d.top + d.height / 2}px`;
                }, delay + i * 70);
                setTimeout(() => { coin.style.opacity = '0'; }, delay + i * 70 + 720);
                setTimeout(() => coin.remove(), delay + i * 70 + 950);
            }
        }

        function animateCoinCounter(target) {
            const diff = target - displayedCoins;
            if (diff === 0) { setCoinText(target); return; }
            const from = displayedCoins;
            displayedCoins = target;
            const wrap = document.getElementById('topBarCoinsWrap');
            const gained = diff > 0 && COIN_FLY_SCREENS.includes(currentScreenId);
            const spent = diff < 0 && currentScreenId === 'screenMerchant';
            if (gained) expeditionStats.coinsEarned += diff;

            if (!animationsEnabled() || (!gained && !spent)) { setCoinText(target); return; }

            if (gained) {
                spawnFlyingCoins(coinSourceElement(), wrap, Math.min(diff, 10), coinFlightDelay);
                tickCoinCounter(from, target, coinFlightDelay + 650, 500, () => {
                    wrap.classList.remove('coin-bump');
                    void wrap.offsetWidth;
                    wrap.classList.add('coin-bump');
                });
            } else {
                wrap.classList.add('coin-spend');
                tickCoinCounter(from, target, 0, 400, () => wrap.classList.remove('coin-spend'));
            }
        }

        /* ---------- 13. Oggetti rivelati come carte ---------- */
        function revealAsCard(el, delay) {
            if (!el || !animationsEnabled()) return;
            el.classList.remove('card-reveal');
            void el.offsetWidth;
            el.style.animationDelay = `${delay}ms`;
            el.classList.add('card-reveal');
            setTimeout(() => { el.classList.remove('card-reveal'); el.style.animationDelay = ''; }, delay + 700);
        }

        /* ---------- 14. Reliquia ottenuta / maledizione subita ---------- */
        function showOutcomeOverlay(kind, data) {
            const isRelic = kind === 'relic';
            const overlay = document.createElement('div');
            overlay.className = `outcome-overlay ${isRelic ? '' : 'curse'}`;
            overlay.innerHTML = `
                <div class="outcome-card">
                    <div class="${isRelic ? 'outcome-sparkles' : 'outcome-smoke'}"></div>
                    <div class="outcome-icon"><img src="${isRelic ? 'immagini/icone/BTNEnchantedGemstone-Reforged.png' : 'immagini/icone/BTNOrbOfCorruption-Reforged.png'}" alt=""></div>
                    <div class="outcome-kind">${isRelic ? 'Reliquia ottenuta' : 'Maledizione subita'}</div>
                    <div class="outcome-name">${data.name}</div>
                    <div class="outcome-desc">${data.desc || ''}</div>
                    <div class="outcome-hint">Clicca per continuare</div>
                </div>`;

            let closed = false;
            const close = () => {
                if (closed) return;
                closed = true;
                overlay.classList.add('closing');
                setTimeout(() => overlay.remove(), 300);
                const counter = document.getElementById(isRelic ? 'topBarRelicsWrap' : 'topBarCursesWrap');
                counter.classList.remove('relic-flash');
                void counter.offsetWidth;
                counter.classList.add('relic-flash');
                setTimeout(() => counter.classList.remove('relic-flash'), 1900);
            };
            overlay.addEventListener('click', close);
            document.body.appendChild(overlay);
            setTimeout(close, 5000);
        }

        /* ---------- 16. Diario della compagnia ---------- */
        function openJournal() {
            if (party.length === 0) {
                alert('Nessuna spedizione in corso: recluta prima la compagnia.');
                return;
            }

            const heroesHtml = party.map(h => {
                const bonuses = [];
                if (h.att_bonus) bonuses.push(`<span class="stat-chip"><i>ATT</i>+${h.att_bonus}</span>`);
                if (h.att_penalty) bonuses.push(`<span class="stat-chip"><i>ATT</i>-${h.att_penalty}</span>`);
                if (h.def_bonus) bonuses.push(`<span class="stat-chip"><i>DIF</i>+${h.def_bonus}</span>`);
                if (h.help_bonus_val) bonuses.push(`<span class="stat-chip"><i>AIUTO</i>+${h.help_bonus_val}</span>`);
                const items = h.items.length
                    ? h.items.map(it => `<div class="journal-item">${itemIconHtml(it)}<span><b>${it.name}</b> — ${it.desc}</span></div>`).join('')
                    : '<span class="journal-empty">Zaino vuoto</span>';
                return `
                    <div class="journal-hero ${h.hp <= 0 ? 'dead' : ''}">
                        <div class="hero-portrait ${heroPortraitClass(h.name)}" style="--hue:${heroHue(h.name)}">${heroPortraitInner(h.name, h.hp, h.maxHp)}</div>
                        <div>
                            <div class="journal-hero-name">${h.name}</div>
                            <div class="journal-hero-hp">HP ${h.hp}/${h.maxHp} · Armatura ${h.current_armor}/${h.base_armor}${h.hp <= 0 ? ' · Caduto' : ''}</div>
                        </div>
                        <span class="stat-chips">
                            <span class="stat-chip"><i>FOR</i>${h.str}</span>
                            <span class="stat-chip"><i>INT</i>${h.int}</span>
                            <span class="stat-chip"><i>FED</i>${h.fth}</span>
                            <span class="stat-chip"><i>DAN</i>${h.dmg}</span>
                            ${bonuses.join('')}
                        </span>
                        ${h.chosenAbility ? `<div class="journal-line">${abilityMarkHtml(h.chosenAbility)} <b>${h.chosenAbility.name}</b>${h.chosenAbility.desc ? ` — ${h.chosenAbility.desc}` : ''}</div>` : ''}
                        <div class="journal-items">${items}</div>
                    </div>`;
            }).join('');

            const relics = unlockedRelics.length
                ? unlockedRelics.map(r => `<div class="relic"><b>${r.name}</b> — ${r.desc}</div>`).join('')
                : '<span class="journal-empty">Nessuna reliquia ottenuta</span>';
            const curses = activeCurses.length
                ? activeCurses.map(c => `<div class="curse">${c}</div>`).join('')
                : '<span class="journal-empty">Nessuna maledizione attiva</span>';

            const doneLevels = stsMapNodes.filter(n => n.done).map(n => n.level);
            const totalLevels = stsMapNodes.length ? Math.max(...stsMapNodes.map(n => n.level)) + 1 : 0;
            const stat = (value, label) => `<div class="journal-stat"><b>${value}</b><span>${label}</span></div>`;

            openModal(`Diario — ${currentCampaign ? currentCampaign.title : 'Spedizione'}`, `
                <div class="journal-section"><h4>La Compagnia</h4><div class="journal-heroes">${heroesHtml}</div></div>
                <div class="journal-section"><h4>Reliquie</h4><div class="journal-list">${relics}</div></div>
                <div class="journal-section"><h4>Maledizioni</h4><div class="journal-list">${curses}</div></div>
                <div class="journal-section"><h4>La Spedizione</h4>
                    <div class="journal-stats">
                        ${stat(`${doneLevels.length ? Math.max(...doneLevels) + 1 : 0} / ${totalLevels}`, 'Livelli superati')}
                        ${stat(expeditionStats.combatsWon, 'Scontri vinti')}
                        ${stat(expeditionStats.challengesPassed, 'Sfide superate')}
                        ${stat(expeditionStats.challengesFailed, 'Sfide fallite')}
                        ${stat(expeditionStats.coinsEarned, 'Monete raccolte')}
                        ${stat(expeditionStats.itemsFound, 'Oggetti trovati')}
                        ${stat(`${party.filter(h => h.hp > 0).length} / ${party.length}`, 'Eroi in piedi')}
                    </div>
                </div>`,
                [{ label: 'Chiudi', className: 'btn-proceed' }],
                { wide: true });
        }

        /* ---------- 17. Conferma prima di lasciare mercante e tesoro ---------- */
        function showMerchantTab(tab) {
            const selling = tab === 'sell';
            document.getElementById('merchantTabBuy').classList.toggle('active', !selling);
            document.getElementById('merchantTabSell').classList.toggle('active', selling);
            document.getElementById('merchantItemsList').classList.toggle('hidden', selling);
            document.getElementById('merchantSellList').classList.toggle('hidden', !selling);
            if (selling) renderMerchantSellList(); else renderMerchantShop();
        }

        function renderMerchantSellList() {
            const entries = [];
            party.forEach(hero => hero.items.forEach((item, idx) => entries.push({ hero, item, idx })));
            const list = document.getElementById('merchantSellList');
            if (entries.length === 0) {
                list.innerHTML = `<p class="panel-label">La compagnia non ha oggetti da vendere.</p>`;
                return;
            }
            list.innerHTML = entries.map(({ hero, item, idx }) => `
                <button class="armory-btn" onclick="trySellItem('${esc(hero.name)}', ${idx})">
                    ${itemIconHtml(item)}
                    <span class="tile-text">
                        <strong>${item.name}</strong>
                        <span class="tile-sub">${item.desc}</span>
                        <span class="tile-tag">${esc(hero.name)}</span>
                    </span>
                    <span class="price sell"><span class="coin"></span>+${itemSellPrice(item)}</span>
                </button>
            `).join('');
        }

        function trySellItem(heroName, idx) {
            const hero = party.find(h => h.name === heroName);
            const item = hero && hero.items[idx];
            if (!item) return;
            const price = itemSellPrice(item);
            openModal('Vendere l\'oggetto?',
                `<p>Vendi <b>${item.name}</b> di ${esc(hero.name)} per <b style="color:var(--wc-yellow)">${price}</b> monete?</p>`,
                [{ label: 'Annulla', className: 'btn-proceed' }, { label: 'Vendi', className: 'btn-danger', onClick: () => {
                    revertItemEffects(item, hero);
                    hero.items.splice(idx, 1);
                    partyCoins += price;
                    updatePartyStatusBars();
                    renderMerchantSellList();
                } }]);
        }

        function confirmLeaveMerchant() {
            const affordable = merchantItemsWithPrices.some(entry => entry && partyCoins >= entry.price);
            if (!affordable) { advanceNode(); return; }
            openModal('Lasciare il mercante?',
                `<p>Hai ancora <b style="color:var(--wc-yellow)">${partyCoins}</b> monete e ci sono oggetti che puoi permetterti.</p>`,
                [{ label: 'Resta nel negozio', className: 'btn-proceed' }, { label: 'Esci comunque', className: 'btn-danger', onClick: advanceNode }]);
        }

        function confirmLeaveTreasure() {
            const left = currentTreasureItems.filter(Boolean).length;
            if (left === 0) { advanceNode(); return; }
            openModal('Lasciare il tesoro?',
                `<p>Nello scrigno ${left === 1 ? 'resta ancora <b>1</b> oggetto' : `restano ancora <b>${left}</b> oggetti`} da prelevare.</p>`,
                [{ label: 'Torna allo scrigno', className: 'btn-proceed' }, { label: 'Prosegui comunque', className: 'btn-danger', onClick: advanceNode }]);
        }

        applyOptions();

        /* ---------- Braci di sfondo ---------- */
        (function spawnEmbers() {
            const box = document.getElementById('embers');
            for (let i = 0; i < 22; i++) {
                const ember = document.createElement('span');
                const size = 2 + Math.random() * 3;
                ember.style.left = `${Math.random() * 100}%`;
                ember.style.width = ember.style.height = `${size}px`;
                ember.style.animationDuration = `${9 + Math.random() * 9}s`;
                ember.style.animationDelay = `${-Math.random() * 18}s`;
                ember.style.setProperty('--drift', `${Math.random() * 140 - 70}px`);
                box.appendChild(ember);
            }
        })();

        /* ---------- Pioggia della scena dei menu ---------- */
        (function spawnRain() {
            const box = document.getElementById('menuRain');
            for (let i = 0; i < 90; i++) {
                const drop = document.createElement('span');
                drop.style.left = `${Math.random() * 110 - 5}%`;
                drop.style.height = `${40 + Math.random() * 50}px`;
                drop.style.opacity = (0.15 + Math.random() * 0.35).toFixed(2);
                drop.style.animationDuration = `${0.55 + Math.random() * 0.5}s`;
                drop.style.animationDelay = `${-Math.random() * 2}s`;
                box.appendChild(drop);
            }
        })();

        updatePartyStatusBars();
