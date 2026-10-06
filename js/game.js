        /* ==========================================================================
           DATABASE DELLE CAMPAGNE
           ========================================================================== */
        // I dati di ogni campagna stanno in data/campagne/<id>.js (JSON puro, caricati prima di questo file).
        // L'ordine dei tag <script> in index.html decide l'ordine delle campagne nel menu.
        const campaignsDatabase = window.CAMPAIGNS || {};

        /* ==========================================================================
           STATO GLOBALE RUNTIME
           ========================================================================== */
        let enemies = {};
        let challengesData = {};
        let restsData = {};
        let merchantsData = {};
        let treasuresData = {};

        let campaignHeroes = [];
        let campaignAbilities = {};
        let campaignArmory = [];

        let partySize = 3;

        // Stato della partita in corso, tutto in un oggetto: è quello che finisce nei salvataggi
        // (vedi saveData in js/salvataggi.js) e che il simulatore reimposta a ogni run.
        //   currentCampaign: campagna risolta (copia), stsMapNodes: nodi con done/active, currentNodeId: nodo attuale
        //   party: eroi, partyCoins: monete, unlockedRelics / activeCurses: reliquie e maledizioni
        //   expeditionStats: statistiche della spedizione (anche la rotazione dei temi musicali)
        //   challengeState: sfida in corso; activeEnemy, helpBonus, combatRound: scontro in corso
        const newExpeditionStats = () => ({ combatsWon: 0, challengesPassed: 0, challengesFailed: 0, coinsEarned: 0, itemsFound: 0, combatThemes: 0, elitesWon: 0, diceRolls: [0, 0, 0, 0, 0, 0] });
        const stato = {
            currentCampaign: null,
            stsMapNodes: [],
            currentNodeId: null,
            party: [],
            partyCoins: 0,
            unlockedRelics: [],
            activeCurses: [],
            expeditionStats: newExpeditionStats(),
            challengeState: null,
            activeEnemy: null,
            helpBonus: 0,
            combatRound: 0,
            procSeed: null  // seme della mappa delle campagne procedurali (js/procedurale.js)
        };

        // Stato della presentazione: schermata attiva, fase del combattimento
        let currentScreenId = 'screenStart';
        let combatPhase = 'none';
// Reliquie e maledizioni si riconoscono per id (la chiave nella libreria), non per nome:
// così si possono rinominare dall'editor senza rompere il loro effetto.
// Id ricavato da un nome, per gli elementi scritti dentro una campagna o i salvataggi vecchi
// ("Scudo dell'Atamano" -> "scudo_dell_atamano", come le chiavi della libreria).
function idFromName(name) {
    return String(name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function hasRelic(relicId) {
    return stato.unlockedRelics.some(r => r.id === relicId);
}

// Le maledizioni sono { id, text }: "text" è la riga mostrata al giocatore ("Nome (descrizione)")
function hasCurse(curseId) {
    return stato.activeCurses.some(c => c.id === curseId);
}

function curseText(curse) {
    return typeof curse === 'string' ? curse : curse.text;
}

// Dà al party la reliquia della libreria con questo id (bottino degli elite, mercante)
function grantRelic(relicId) {
    const relic = LIBRERIA.reliquie[relicId];
    if (!relic || hasRelic(relicId)) return null;
    const owned = { ...relic, id: relicId };
    stato.unlockedRelics.push(owned);
    applyEffects(relic.effects);
    discover('relics', relic.name);
    return owned;
}

// Una reliquia a caso fra quelle della libreria che il party non ha ancora (null se le ha tutte)
function pickUnownedRelicId() {
    const ids = Object.keys(LIBRERIA.reliquie || {}).filter(id => !hasRelic(id));
    return ids.length ? ids[Math.floor(Math.random() * ids.length)] : null;
}

function breakRelic(relicId) {
    const idx = stato.unlockedRelics.findIndex(r => r.id === relicId);
    if (idx > -1) {
        stato.unlockedRelics.splice(idx, 1);
        updatePartyStatusBars();
    }
}

        // Effetto hero_item: mette nello zaino dell'eroe "count" copie di un oggetto dell'armeria
        // (i consumabili uguali in pile da CONSUMABLE_STACK). Non conta come l'oggetto iniziale scelto.
        function giveHeroItem(hero, itemId, count) {
            const base = (LIBRERIA.armeria || {})[itemId];
            if (!base) { console.warn('hero_item: oggetto sconosciuto', itemId); return; }
            const consumable = (base.type || '').startsWith('consumable');
            let left = count;
            while (left > 0) {
                const copy = JSON.parse(JSON.stringify(base));
                const n = consumable ? Math.min(left, CONSUMABLE_STACK) : 1;
                if (n > 1) copy.qty = n;
                hero.items.push(copy);
                if (!consumable) applyItemEffects(copy, hero);
                left -= n;
            }
            discover('items', itemId);
        }

        // Interprete degli effetti descritti nei dati delle campagne (campo "effects").
        // Gli effetti "hero_*" agiscono sull'eroe passato, gli altri sull'intera compagnia.
        // I tipi sono elencati in EFFECT_TYPES (js/comune.js, usato anche dall'editor): un tipo nuovo va aggiunto lì e qui.
        function applyEffects(effects, hero) {
            (effects || []).forEach(e => {
                switch (e.effect) {
                    case 'hero_stat': hero[e.stat] = (hero[e.stat] || 0) + e.val; break;
                    case 'hero_set': hero[e.stat] = e.val; break;
                    case 'party_stat': stato.party.forEach(h => { h[e.stat] = Math.max(0, (h[e.stat] || 0) + e.val); }); break;
                    case 'party_max_hp': stato.party.forEach(h => { h.maxHp += e.val; h.hp += e.val; }); break;
                    case 'party_damage': stato.party.forEach(h => { h.hp = Math.max(1, h.hp - e.val); }); break;
                    case 'coins': stato.partyCoins = Math.max(0, stato.partyCoins + e.val); break;
                    case 'add_curse': stato.activeCurses.push({ id: e.id || idFromName(e.text), text: e.text }); break;
                    case 'hero_item': if (hero) giveHeroItem(hero, e.item, e.val || 1); break;
                    default: console.warn('Effetto sconosciuto:', e);
                }
            });
            // Fede o Intelligenza cambiate: aggiorna i bonus degli oggetti in scala
            if (typeof refreshScaledBonuses === 'function') { stato.party.forEach(refreshScaledBonuses); if (hero) refreshScaledBonuses(hero); }
        }
	


        // Bottino delle campagne con "lootItems": null (elenco in data/libreria/armeria.js)
        const LIBRERIA = window.LIBRERIA || { armeria: {}, bestiario: {}, reliquie: {}, maledizioni: {}, lootPredefinito: [] };
        const DEFAULT_GAME_ITEMS = (LIBRERIA.lootPredefinito || []).map(id => LIBRERIA.armeria[id]).filter(Boolean);
        let gameItems = DEFAULT_GAME_ITEMS;

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
                    // Libreria modificata nell'editor: vale solo per questa scheda; si risolvono di nuovo tutte le campagne
                    if (data.library) {
                        Object.assign(LIBRERIA, data.library);
                        DEFAULT_GAME_ITEMS.splice(0, DEFAULT_GAME_ITEMS.length, ...(LIBRERIA.lootPredefinito || []).map(i => LIBRERIA.armeria[i]).filter(Boolean));
                        resolveAllCampaigns();
                    }
                    // Le immagini caricate nell'editor e non ancora salvate arrivano come file: le si mostra da memoria
                    const urls = new Map((data.assets || []).map(([path, blob]) => [path, URL.createObjectURL(blob)]));
                    const fix = path => urls.get(path) || path;
                    // Icone di oggetti e abilità caricate nell'editor (prima di risolvere la campagna, che ne copia i dati)
                    ['armeria', 'abilita'].forEach(kind => Object.values(LIBRERIA[kind] || {}).forEach(el => { if (el.icon) el.icon = fix(el.icon); }));
                    const camp = resolveCampaign(data.campaign, LIBRERIA);
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
            // Le campagne procedurali generano qui la loro mappa, da un seme nuovo
            const seed = campaignsDatabase[campaignId] && campaignsDatabase[campaignId].procedurale ? newProcSeed() : null;
            const rawCamp = campaignForPlay(campaignId, seed);
            if(!rawCamp) return;
            stato.procSeed = seed;

            stato.currentCampaign = rawCamp;

            stato.stsMapNodes = stato.currentCampaign.mapNodes;
            enemies = stato.currentCampaign.enemies;
            challengesData = stato.currentCampaign.challenges;
            restsData = stato.currentCampaign.rests;
            merchantsData = stato.currentCampaign.merchants;
            treasuresData = stato.currentCampaign.treasures;

            campaignHeroes = stato.currentCampaign.heroes || [];
            registerCampaignHeroPortraits(campaignHeroes);
            campaignAbilities = rawCamp.abilities || {};
            campaignArmory = stato.currentCampaign.initialArmory || [];

            gameItems = stato.currentCampaign.lootItems && stato.currentCampaign.lootItems.length > 0 ? stato.currentCampaign.lootItems : DEFAULT_GAME_ITEMS;
            currentSaveSlot = null;  // nuova partita: nessuno slot finché non la si salva

            document.getElementById('campaignIntroTitle').textContent = stato.currentCampaign.title;
            document.getElementById('campaignIntroImg').src = stato.currentCampaign.coverImage;
            document.getElementById('campaignIntroDesc').innerHTML = `<strong>Descrizione:</strong> ${stato.currentCampaign.introText}`;
            document.getElementById('mapCampaignHeader').textContent = `Mappa: ${stato.currentCampaign.title}`;

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

        // Versione del gioco, mostrata in basso a destra nel menu (aggiornarla a ogni release)
        const GAME_VERSION = '1.3';
        document.getElementById('menuVersion').textContent = `Slay the Dig · versione ${GAME_VERSION}`;

        const MENU_SCENE_SCREENS = ['screenStart', 'screenCampaigns'];

        // Video di sfondo dei menu (iniziale e scelta campagna): muto, in riproduzione solo quando sono visibili
        // (e con gli effetti animati attivi). Se non si carica resta la scena disegnata.
        function updateMenuVideo() {
            const video = document.getElementById('menuVideo');
            if (!video) return;
            video.muted = true;
            const shouldPlay = document.body.classList.contains('menu-mode') && !document.body.classList.contains('no-anim');
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

        // 26. Breve "sipario" scuro che copre il cambio di schermata
        function playScreenCurtain() {
            if (!animationsEnabled()) return;
            let curtain = document.getElementById('screenCurtain');
            if (!curtain) {
                curtain = document.createElement('div');
                curtain.id = 'screenCurtain';
                curtain.setAttribute('aria-hidden', 'true');
                document.body.appendChild(curtain);
            }
            curtain.classList.remove('play');
            void curtain.offsetWidth;
            curtain.classList.add('play');
        }

        function showScreen(screenId) {
            if (currentScreenId && currentScreenId !== screenId) playScreenCurtain();
            currentScreenId = screenId;
            if (screenId !== 'screenCombat') combatPhase = 'none';
            document.querySelectorAll('.container > div').forEach(div => div.classList.add('hidden'));
            // Menu iniziale e scelta campagna: scena a tutto schermo senza barre, come i menu di Warcraft III
            document.body.classList.toggle('menu-mode', MENU_SCENE_SCREENS.includes(screenId));
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

        function setCounter(el, value) {
            const prev = el.dataset.value != null ? Number(el.dataset.value) : null;
            el.dataset.value = value;
            if (prev === null || prev === value) { el.textContent = value; return; }
            countText(el, prev, value, null, 400);
            setTimeout(() => { el.textContent = value; }, 460);
        }

        function updatePartyStatusBars() {
            stato.party.forEach(refreshScaledBonuses);
            const container = document.getElementById('partyStatusBarContent');
            animateCoinCounter(stato.partyCoins);

            setCounter(document.getElementById('topBarRelics'), stato.unlockedRelics.length);
            document.getElementById('topBarRelicsWrap').dataset.tip = stato.unlockedRelics.length > 0
                ? `Reliquie||${stato.unlockedRelics.map(r => `<b style="color:var(--relic-color)">${r.name}</b>: ${r.desc}`).join('<br>')}`
                : 'Reliquie||Nessuna reliquia ottenuta.';

            setCounter(document.getElementById('topBarCurses'), stato.activeCurses.length);
            document.getElementById('topBarCursesWrap').dataset.tip = stato.activeCurses.length > 0
                ? `Maledizioni||${stato.activeCurses.map(curseText).join('<br>')}`
                : 'Maledizioni||Nessuna maledizione attiva.';

            document.body.classList.toggle('no-party', stato.party.length === 0);

            if (stato.party.length === 0) {
                container.innerHTML = `<div class="console-empty">Nessun eroe reclutato</div>`;
                return;
            }

            container.innerHTML = stato.party.map(heroCardHtml).join('');
            animateBars(container);
            fxDiffHeroes();
            renderTurnBar();
        }

        /* ---------- Messaggi a schermo in stile WoW ----------
           uiError: rosso (azione non possibile), uiMessage: giallo (avviso). Al massimo 3 righe. */
        function uiMessage(text, kind = 'info') {
            let box = document.getElementById('uiMessages');
            if (!box) {
                box = document.createElement('div');
                box.id = 'uiMessages';
                box.className = 'ui-messages';
                box.setAttribute('role', 'status');
                document.body.appendChild(box);
            }
            const line = document.createElement('div');
            line.className = `ui-message ${kind}`;
            line.textContent = text;
            box.appendChild(line);
            while (box.children.length > 3) box.firstChild.remove();
            setTimeout(() => line.remove(), 2900);
            if (kind === 'error' && typeof synthSfx === 'function') synthSfx('one');
        }
        const uiError = text => uiMessage(text, 'error');

        function triggerConsumableFeedback(hero, target, item) {
            const log = document.getElementById('combatLog');
            if(log && !document.getElementById('screenCombat').classList.contains('hidden')) {
                logCombat(`🧪 ${hero.name} usa ${item.name} su ${target.name}!`);
            } else {
                uiMessage(`${hero.name} ha usato ${item.name} su ${target.name}`);
            }
        }

        /* ---------- 35. Parole chiave colorate nei testi ----------
           Solo su testo semplice (descrizioni di campagne, sfide, oggetti): prima si fa l'escape,
           poi le parole chiave diventano <span class="kw kw-..."> (colori in css/wc3-base.css). */
        const KEYWORD_CLASS = {
            forza: 'str', fede: 'fth', intelligenza: 'int', hp: 'hp', armatura: 'armor', danno: 'dmg', danni: 'dmg',
            moneta: 'coin', monete: 'coin', oro: 'coin', reliquia: 'relic', reliquie: 'relic',
            maledizione: 'curse', maledizioni: 'curse', aiuto: 'help', difesa: 'armor'
        };
        const KEYWORD_RE = new RegExp(`\\b(${Object.keys(KEYWORD_CLASS).join('|')})\\b`, 'gi');
        function kw(text) {
            return esc(text == null ? '' : String(text)).replace(KEYWORD_RE, w => `<span class="kw kw-${KEYWORD_CLASS[w.toLowerCase()]}">${w}</span>`);
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

        function itemIconName(item) {
            const key = `${item.id || ''} ${item.name}`.toLowerCase();
            if (/pozione|unguento|balsamo/.test(key)) return 'potion';
            if (/ascia/.test(key)) return 'axe';
            if (/pugnale|stocco|martello/.test(key)) return 'sword';
            if (/corazza/.test(key)) return 'armor';
            if (/balsamo/.test(key)) return 'potion';
            if (/alabarda/.test(key)) return 'spear';
            if (/spada/.test(key)) return 'sword';
            if (/scudo/.test(key)) return 'shield';
            if (/armatura|brigantina/.test(key)) return 'armor';
            if (/libro|tomo/.test(key)) return 'book';
            if (/amuleto|ankh|corona/.test(key)) return 'amulet';
            if (/anello/.test(key)) return 'ring';
            return 'bag';
        }

        // Rarità dell'oggetto; gli oggetti senza rarità contano come comuni
        // Rarità in stile World of Warcraft, dalla più bassa alla più alta (colori in css/wc3-base.css)
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

        // Icone di oggetti non più nell'armeria, tenute per i vecchi salvataggi.
        // Le icone degli oggetti stanno nel campo "icon" di data/libreria/armeria.js (si caricano dall'editor).
        const ITEM_ICONS_LEGACY = {
            amuleto_viandante: 'immagini/icone/BTNNecklace.png',
            tomo_alchemico: 'immagini/icone/BTNSorceressMaster.png',
            corazza_nordica: 'immagini/icone/BTNLeatherUpgradeOne.png'
        };

        // Icona dell'oggetto: campo "icon" (anche per gli oggetti dei salvataggi vecchi, presa dall'armeria),
        // poi le icone tenute per i vecchi salvataggi, poi quella per tipo
        function itemImageSrc(item) {
            const fromLib = LIBRERIA.armeria && LIBRERIA.armeria[item.id];
            return item.icon || (fromLib && fromLib.icon) || ITEM_ICONS_LEGACY[item.id] || ITEM_IMAGES[itemIconName(item)];
        }

        function itemIconInner(item) {
            const src = itemImageSrc(item);
            return src ? `<img class="item-img" src="${src}" alt="">` : svgIcon(itemIconName(item));
        }

        function itemIconHtml(item) {
            const hasImage = !!itemImageSrc(item);
            return `<span class="icon-frame ic-${itemCategory(item)} rar-${itemRarity(item)} ${hasImage ? 'has-img' : ''}">${itemIconInner(item)}</span>`;
        }

        // Icona WC3 dell'abilità: campo "icon" della libreria Abilità (data/libreria/abilita.js).
        // Le partite salvate prima della libreria non hanno "icon": si cerca per id. Senza icona resta quella SVG.
        function abilityIconSrc(ability) {
            if (!ability) return null;
            const fromLib = window.LIBRERIA && window.LIBRERIA.abilita && window.LIBRERIA.abilita[ability.id];
            return ability.icon || (fromLib && fromLib.icon) || null;
        }

        function abilityIconHtml(ability) {
            const src = abilityIconSrc(ability);
            if (src) return `<span class="icon-frame ic-arcane has-img"><img class="item-img" src="${src}" alt=""></span>`;
            return `<span class="icon-frame ic-arcane">${svgIcon(ability.isCombatActive ? 'star' : 'rune')}</span>`;
        }

        function abilityCmdIconHtml(ability) {
            const src = abilityIconSrc(ability);
            return src ? `<img class="cmd-img" src="${src}" alt="">` : svgIcon('star');
        }

        function abilityMarkHtml(ability) {
            const src = abilityIconSrc(ability);
            return src ? `<img class="ability-mark" src="${src}" alt="">` : '★';
        }

        function clampPct(value, max) {
            return max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
        }

        function hpClass(pct) {
            return pct > 60 ? '' : (pct > 30 ? 'hp-mid' : 'hp-low');
        }

        // 23. Statistica verde se più alta di quella iniziale dell'eroe, rossa se più bassa (oggetti, reliquie, maledizioni)
        function heroStatHtml(h, key, short, label, help) {
            const base = (campaignHeroes || []).find(b => b.name === h.name);
            const start = base ? base[key] : h[key];
            const cls = h[key] > start ? 'stat-up' : h[key] < start ? 'stat-down' : '';
            const note = cls ? `<br><span class="tip-hint">Iniziale ${start}, ora ${h[key]}</span>` : '';
            return `<span class="${cls}" data-tip="${esc(label + '||' + help + note)}"><i>${short}</i>${h[key]}</span>`;
        }

        /* ---------- 10. Barre della vita con scia e 27. numeri che scorrono ----------
           La scia chiara resta dov'era la vita e si accorcia con un attimo di ritardo;
           il numero scorre dal valore precedente al nuovo. barMemory ricorda l'ultimo stato. */
        const barMemory = new Map();  // chiave -> { pct, value }
        function barGhostHtml(key, pct, value) {
            return `<div class="hp-bar-ghost" data-ghost-key="${esc(key)}" data-pct="${pct}" data-value="${value}" style="width: ${pct}%;"></div>`;
        }

        function animateBars(scope) {
            (scope || document).querySelectorAll('.hp-bar-ghost[data-ghost-key]').forEach(ghost => {
                const key = ghost.dataset.ghostKey;
                const pct = Number(ghost.dataset.pct), value = Number(ghost.dataset.value);
                const prev = barMemory.get(key);
                barMemory.set(key, { pct, value });
                const text = ghost.parentNode.querySelector('[data-count-key]');
                if (!prev || !animationsEnabled()) return;
                if (prev.pct > pct) {
                    ghost.style.transition = 'none';
                    ghost.style.width = `${prev.pct}%`;
                    void ghost.offsetWidth;
                    ghost.style.transition = '';
                    ghost.style.width = `${pct}%`;
                }
                if (text && prev.value !== value) countText(text, prev.value, value, text.dataset.countMax);
            });
        }

        // Fa scorrere un numero (anche nella forma "x/max") dal valore precedente al nuovo
        function countText(el, from, to, max, duration = 450) {
            if (!animationsEnabled() || from === to) return;
            const start = performance.now();
            const suffix = max ? `/${max}` : '';
            el.classList.add(to < from ? 'count-down' : 'count-up');
            const step = now => {
                const t = Math.min(1, (now - start) / duration);
                el.textContent = `${Math.round(from + (to - from) * t)}${suffix}`;
                if (t < 1) requestAnimationFrame(step);
                else setTimeout(() => el.classList.remove('count-down', 'count-up'), 300);
            };
            requestAnimationFrame(step);
        }

        function heroCardHtml(h) {
            const hpPct = clampPct(h.hp, h.maxHp);
            const armorMax = Math.max(h.base_armor, h.current_armor);
            const armorPct = clampPct(h.current_armor, armorMax);
            const slotCount = Math.max(BACKPACK_SIZE, h.items.length);
            let slots = '';
            for (let i = 0; i < slotCount; i++) {
                const it = h.items[i];
                if (!it) { slots += `<div class="inv-slot empty"></div>`; continue; }
                const usable = it.type && it.type.startsWith('consumable');
                const tip = itemTip(it, h) + (usable ? '<br><span class="tip-hint">Clicca per usare</span>' : '');
                const hasImage = !!itemImageSrc(it);
                slots += `<div class="inv-slot ic-${itemCategory(it)} rar-${itemRarity(it)} ${usable ? 'usable' : ''} ${hasImage ? 'has-img' : ''}" data-tip="${esc(tip)}" ${usable ? `onclick="useConsumableFromTopbar('${h.name}', ${i})"` : ''}>${itemIconInner(it)}${(it.qty || 1) > 1 ? `<span class="inv-qty">x${it.qty}</span>` : ''}</div>`;
            }

            return `
                <div class="hero-mini-card ${h.hp <= 0 ? 'dead' : ''} ${heroTurnClass(h)}" data-hero="${esc(h.name)}">
                    ${heroBuffsHtml(h)}
                    <div class="hero-portrait ${heroPortraitClass(h.name)}" style="--hue:${heroHue(h.name)}">${heroPortraitInner(h.name, h.hp, h.maxHp)}</div>
                    <div class="hero-bars">
                        <div class="hero-card-name" title="${esc(h.name)}">${h.name}</div>
                        <div class="hp-bar-container" data-tip="Punti Vita||${h.hp} su ${h.maxHp}">
                            ${barGhostHtml(`hero:${h.name}`, hpPct, h.hp)}
                            <div class="hp-bar-fill ${hpClass(hpPct)}" style="width: ${hpPct}%;"></div>
                            <div class="hp-bar-text" data-count-key="hero:${esc(h.name)}" data-count-max="${h.maxHp}">${h.hp}/${h.maxHp}</div>
                        </div>
                        <div class="hp-bar-container armor ${h.base_armor > 0 || h.current_armor > 0 ? '' : 'is-empty'}" data-tip="Armatura||${h.current_armor} attuale su ${h.base_armor} base. Assorbe i danni prima degli HP e si rigenera a ogni scontro.">
                            <div class="hp-bar-fill" style="width: ${armorPct}%;"></div>
                            <div class="hp-bar-text">${h.current_armor}/${h.base_armor}</div>
                        </div>
                    </div>
                    <div class="hero-stats">
                        ${heroStatHtml(h, 'str', 'FOR', 'Forza', 'Si somma ai tiri di attacco, difesa e aiuto.')}
                        ${heroStatHtml(h, 'int', 'INT', 'Intelligenza', 'Usata nelle prove di intelletto e nella contrattazione.')}
                        ${heroStatHtml(h, 'fth', 'FED', 'Fede', 'Usata nelle prove di fede.')}
                        ${heroStatHtml(h, 'dmg', 'DAN', 'Danno', 'Danni inflitti con un attacco riuscito.')}
                    </div>
                    ${h.chosenAbility ? `<div class="hero-ability" data-tip="${esc(h.chosenAbility.name + "||" + (h.chosenAbility.desc || ""))}">${abilityMarkHtml(h.chosenAbility)} ${h.chosenAbility.name}</div>` : ""}
                    <div class="hero-inventory">${slots}<span class="inv-label ${h.items.length >= BACKPACK_SIZE ? 'full' : ''}">Zaino ${h.items.length}/${BACKPACK_SIZE}</span></div>
                </div>`;
        }

        /* ---------- Finestra modale ---------- */
        function openModal(title, bodyHtml, actions, options = {}) {
            const box = document.querySelector('#wc3Modal .modal-box');
            box.classList.toggle('wide', !!options.wide);
            if (document.getElementById('wc3Modal').classList.contains('hidden')) {
                box.classList.remove('modal-drop');
                void box.offsetWidth;
                box.classList.add('modal-drop');
            }
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

            // Esc in combattimento, prima del tiro: dal dado torna alle azioni, dalle azioni alla scelta dell'eroe
            if (e.key === 'Escape') {
                const back = ['combatDiceBackBtn', 'combatChangeHeroBtn'].map(id => document.getElementById(id)).find(isUsable);
                if (back) { e.preventDefault(); back.click(); return; }
            }

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
            stato.party.forEach(hero => {
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
            stato.party.forEach(hero => fxHeroSeen.set(hero, { hp: hero.hp, armor: hero.current_armor }));
        }

        function fxDiffEnemy() {
            if (!stato.activeEnemy) return;
            const prev = fxEnemySeen.get(stato.activeEnemy);
            fxEnemySeen.set(stato.activeEnemy, { hp: stato.activeEnemy.hp, stunned: stato.activeEnemy.isStunned });
            const box = document.getElementById('enemyInfo');
            if (stato.activeEnemy.hp > 0) box.classList.remove('defeated');
            if (!prev) return;
            if (stato.activeEnemy.hp <= 0 && prev.hp > 0) onEnemyDefeated(box);
            const dHp = stato.activeEnemy.hp - prev.hp;
            if (dHp < 0) {
                fxHit(box);
                // Alla morte "sfxDeath" (o, se manca, "sfxHit"); altrimenti "sfxHit"; senza file il suono generato
                const dead = stato.activeEnemy.hp <= 0;
                if (!(dead && playEnemySfx('sfxDeath')) && !playEnemySfx('sfxHit')) synthSfx('enemy');
                fxFloatOn(box, `${dHp}`, fxNextEnemyHitCritical ? 'crit' : 'dmg');
            }
            if (stato.activeEnemy.isStunned && !prev.stunned) fxFloatOn(box, 'Stordito', 'stun', 200);
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
            // Nuovo volume subito sul brano che suona (non su quello che sta sfumando)
            if (musicActive && !musicActive.paused && !musicActive.loopOutgoing) {
                clearInterval(musicActive.fadeTimer);
                musicActive.volume = gameOptions.musicVolume;
            }
        }

        /* ---------- Compendio: nemici, reliquie, maledizioni e oggetti scoperti in tutte le partite ---------- */
        const COMPENDIUM_KEY = 'dignitas_compendium';
        const COMPENDIUM_KINDS = ['enemies', 'relics', 'curses', 'items'];
        const compendium = (() => {
            let saved = {};
            try { saved = JSON.parse(localStorage.getItem(COMPENDIUM_KEY) || '{}'); } catch (e) {}
            // Prima i nemici erano registrati come "campagna:chiave": si passa all'id del bestiario
            const ENEMY_ALIASES = { 'tutorial:disertori': 'disertori_affamati' };
            if (saved.enemies) saved.enemies = saved.enemies.map(k => ENEMY_ALIASES[k] || (k.includes(':') ? k.split(':').pop() : k));
            return Object.fromEntries(COMPENDIUM_KINDS.map(k => [k, new Set(saved[k] || [])]));
        })();

        function discover(kind, key) {
            if (!key || compendium[kind].has(key)) return;
            compendium[kind].add(key);
            try {
                localStorage.setItem(COMPENDIUM_KEY, JSON.stringify(Object.fromEntries(COMPENDIUM_KINDS.map(k => [k, [...compendium[k]]]))));
            } catch (e) {}
        }

        // Tutte le voci possibili: la libreria condivisa (data/libreria/), con le campagne in cui compaiono
        function compendiumCatalog() {
            const usedIn = {};  // "tipo:id" -> titoli delle campagne
            const mark = (kind, id, camp) => { (usedIn[kind + ':' + id] = usedIn[kind + ':' + id] || new Set()).add(camp.title); };
            Object.entries(window.CAMPAIGNS_RAW || {}).forEach(([id, raw]) => {
                const camp = campaignsDatabase[id] || raw;
                (raw.mapNodes || []).forEach(n => { if (n.enemy) mark('enemies', n.enemy, camp); });
                Object.values(raw.challenges || {}).forEach(ch => {
                    if (typeof ch.reward === 'string') mark('relics', ch.reward, camp);
                    if (typeof ch.punishment === 'string') mark('curses', ch.punishment, camp);
                });
                [...(raw.initialArmory || []), ...(raw.lootItems || LIBRERIA.lootPredefinito || [])]
                    .forEach(ref => { if (typeof ref === 'string') mark('items', ref, camp); });
            });
            const where = (kind, id) => [...(usedIn[kind + ':' + id] || [])].join(', ');
            return {
                enemies: Object.entries(LIBRERIA.bestiario).map(([id, e]) => ({ key: id, enemy: e, campaign: where('enemies', id) })),
                relics: Object.entries(LIBRERIA.reliquie).map(([id, r]) => ({ key: r.name, entry: r, campaign: where('relics', id) })),
                curses: Object.entries(LIBRERIA.maledizioni).map(([id, c]) => ({ key: c.name, entry: c, campaign: where('curses', id) })),
                items: Object.values(LIBRERIA.armeria).map(item => ({ key: item.id, item }))
            };
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
                const face = e.image ? `<span class="icon-frame has-img"><img class="item-img codex-enemy-img" src="${e.image}" alt="" onerror="this.parentNode.innerHTML=svgIcon('skull')"></span>` : `<span class="icon-frame ic-arcane">${svgIcon('skull')}</span>`;
                return `<div class="codex-card">${face}<span class="tile-text"><strong>${esc(e.name)}</strong>
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
                    <p>Dado naturale: un <b>6</b> sul dado riesce sempre, un <b>1</b> fallisce sempre, qualunque siano bonus e difficoltà.</p>
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
            if (!animationsEnabled() || !stato.currentCampaign) { startMap(); return; }

            const overlay = document.createElement('div');
            overlay.className = 'chapter-overlay';
            overlay.innerHTML = `
                <div class="chapter-content">
                    <div class="chapter-kicker">La spedizione ha inizio</div>
                    <div class="chapter-title">${stato.currentCampaign.title}</div>
                    <div class="chapter-rule"></div>
                    <div class="chapter-sub">${stato.currentCampaign.badge || ''}</div>
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
            if (currentScreenId !== 'screenCombat' || !stato.activeEnemy || combatPhase === 'none') { bar.innerHTML = ''; return; }

            const heroChips = stato.party.filter(h => h.hp > 0).map(h => {
                const state = combatPhase === 'won' || h.hasActed ? 'done' : (h === currentActiveHero ? 'current' : '');
                const note = state === 'done' ? 'Ha già agito in questo round' : (state === 'current' ? 'Sta agendo' : 'Deve ancora agire');
                const inner = HERO_PORTRAITS[h.name] ? heroPortraitInner(h.name, h.hp, h.maxHp) : h.name.charAt(0);
                return `<span class="turn-chip ${state}" style="--hue:${heroHue(h.name)}" data-tip="${esc(h.name)}||${note}">${inner}</span>`;
            }).join('');
            const enemyState = combatPhase === 'monster' ? 'current' : (combatPhase === 'won' ? 'done' : '');
            const enemyNote = combatPhase === 'monster' ? 'Sta attaccando' : (combatPhase === 'won' ? 'Sconfitto' : 'Attacca dopo la compagnia');
            bar.innerHTML = `
                <span class="turn-round">Round ${stato.combatRound}</span>
                ${heroChips}
                <span class="turn-sep">▶</span>
                <span class="turn-chip enemy ${enemyState}" data-tip="${esc(stato.activeEnemy.name)}||${enemyNote}">${svgIcon('skull')}</span>`;
        }

        /* ---------- 7. Nemico sconfitto ---------- */
        function onEnemyDefeated(box) {
            combatPhase = 'won';
            stato.expeditionStats.combatsWon++;
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
            const doneLevels = stato.stsMapNodes.filter(n => n.done).map(n => n.level);
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
            // Contatore del livello nella barra delle risorse in alto a destra
            document.getElementById('topBarLevel').textContent = `${Math.min(completed + 1, total)}/${total}`;
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
            if (gained) stato.expeditionStats.coinsEarned += diff;

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
        // Copia volante di un'icona verso un contatore della barra in alto; restituisce la durata in ms
        function flyIconToCounter(img, counter) {
            if (!img || !counter || !animationsEnabled() || counter.offsetParent === null || !img.animate) return 0;
            const from = img.getBoundingClientRect();
            const target = (counter.querySelector('img') || counter).getBoundingClientRect();
            const ghost = img.cloneNode();
            ghost.className = 'fly-icon';
            Object.assign(ghost.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` });
            document.body.appendChild(ghost);
            const dx = target.left + target.width / 2 - (from.left + from.width / 2);
            const dy = target.top + target.height / 2 - (from.top + from.height / 2);
            const scale = Math.max(0.2, target.width / from.width);
            const duration = 750;
            // Traiettoria ad arco: sale un po' prima di puntare al contatore
            ghost.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 60}px) scale(${(1 + scale) / 2}) rotate(-12deg)`, opacity: 1, offset: 0.5 },
                { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.4 }
            ], { duration, easing: 'cubic-bezier(.45,.05,.55,.95)', fill: 'forwards' });
            setTimeout(() => ghost.remove(), duration + 50);
            return duration;
        }

        function showOutcomeOverlay(kind, data) {
            const isRelic = kind === 'relic';
            const overlay = document.createElement('div');
            overlay.className = `outcome-overlay ${isRelic ? '' : 'curse'}`;
            overlay.innerHTML = `
                <div class="outcome-card">
                    <div class="${isRelic ? 'outcome-sparkles' : 'outcome-smoke'}"></div>
                    <div class="outcome-icon"><img src="${isRelic ? 'immagini/icone/BTNEnchantedGemstone.png' : 'immagini/icone/BTNOrbOfCorruption.png'}" alt=""></div>
                    <div class="outcome-kind">${isRelic ? 'Reliquia ottenuta' : 'Maledizione subita'}</div>
                    <div class="outcome-name">${data.name}</div>
                    <div class="outcome-desc">${kw(data.desc || '')}</div>
                    <div class="outcome-hint">Clicca per continuare</div>
                </div>`;

            let closed = false;
            const close = () => {
                if (closed) return;
                closed = true;
                const counter = document.getElementById(isRelic ? 'topBarRelicsWrap' : 'topBarCursesWrap');
                const flash = () => {
                    counter.classList.remove('relic-flash');
                    void counter.offsetWidth;
                    counter.classList.add('relic-flash');
                    setTimeout(() => counter.classList.remove('relic-flash'), 1900);
                };
                // L'icona vola dalla finestra al contatore in alto; il contatore lampeggia all'arrivo
                const flight = flyIconToCounter(overlay.querySelector('.outcome-icon img'), counter);
                overlay.classList.add('closing');
                setTimeout(() => overlay.remove(), 300);
                setTimeout(flash, flight);
            };
            overlay.addEventListener('click', close);
            document.body.appendChild(overlay);
            setTimeout(close, 5000);
        }

        /* ---------- 16. Diario della compagnia ---------- */
        function openJournal() {
            if (stato.party.length === 0) {
                uiError('Nessuna spedizione in corso: recluta prima la compagnia');
                return;
            }

            const heroesHtml = stato.party.map(h => {
                const bonuses = [];
                if (h.att_bonus) bonuses.push(`<span class="stat-chip"><i>ATT</i>+${h.att_bonus}</span>`);
                if (h.att_penalty) bonuses.push(`<span class="stat-chip"><i>ATT</i>-${h.att_penalty}</span>`);
                if (h.def_bonus) bonuses.push(`<span class="stat-chip"><i>DIF</i>+${h.def_bonus}</span>`);
                if (h.def_armor) bonuses.push(`<span class="stat-chip"><i>SCUDO</i>+${h.def_armor}</span>`);
                if (h.help_bonus_val) bonuses.push(`<span class="stat-chip"><i>AIUTO</i>+${h.help_bonus_val}</span>`);
                const items = h.items.length
                    ? h.items.map(it => `<div class="journal-item">${itemIconHtml(it)}<span><b>${it.name}</b>${(it.qty || 1) > 1 ? ` x${it.qty}` : ''} — ${it.desc}</span></div>`).join('')
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

            const relics = stato.unlockedRelics.length
                ? stato.unlockedRelics.map(r => `<div class="relic"><b>${r.name}</b> — ${r.desc}</div>`).join('')
                : '<span class="journal-empty">Nessuna reliquia ottenuta</span>';
            const curses = stato.activeCurses.length
                ? stato.activeCurses.map(c => `<div class="curse">${curseText(c)}</div>`).join('')
                : '<span class="journal-empty">Nessuna maledizione attiva</span>';

            const doneLevels = stato.stsMapNodes.filter(n => n.done).map(n => n.level);
            const totalLevels = stato.stsMapNodes.length ? Math.max(...stato.stsMapNodes.map(n => n.level)) + 1 : 0;
            const stat = (value, label) => `<div class="journal-stat"><b>${value}</b><span>${label}</span></div>`;

            openModal(`Diario — ${stato.currentCampaign ? stato.currentCampaign.title : 'Spedizione'}`, `
                <div class="journal-section"><h4>La Compagnia</h4><div class="journal-heroes">${heroesHtml}</div></div>
                <div class="journal-section"><h4>Reliquie</h4><div class="journal-list">${relics}</div></div>
                <div class="journal-section"><h4>Maledizioni</h4><div class="journal-list">${curses}</div></div>
                <div class="journal-section"><h4>La Spedizione</h4>
                    <div class="journal-stats">
                        ${stat(`${doneLevels.length ? Math.max(...doneLevels) + 1 : 0} / ${totalLevels}`, 'Livelli superati')}
                        ${stat(stato.expeditionStats.combatsWon, 'Scontri vinti')}
                        ${stat(stato.expeditionStats.challengesPassed, 'Sfide superate')}
                        ${stat(stato.expeditionStats.challengesFailed, 'Sfide fallite')}
                        ${stat(stato.expeditionStats.coinsEarned, 'Monete raccolte')}
                        ${stat(stato.expeditionStats.itemsFound, 'Oggetti trovati')}
                        ${stat(`${stato.party.filter(h => h.hp > 0).length} / ${stato.party.length}`, 'Eroi in piedi')}
                    </div>
                </div>
                ${diceStatsHtml()}`,
                [{ label: 'Chiudi', className: 'btn-proceed' }],
                { wide: true });
        }

        // Quante volte è uscita ogni faccia nei dadi degli eroi in questa spedizione (vedi rollD6):
        // barre in proporzione, percentuale accanto al 16,7% atteso e media accanto a 3,5
        function diceStatsHtml() {
            const counts = (stato.expeditionStats && stato.expeditionStats.diceRolls) || [0, 0, 0, 0, 0, 0];
            const total = counts.reduce((a, b) => a + b, 0);
            if (!total) return '<div class="journal-section"><h4>I dadi</h4><span class="journal-empty">Nessun dado tirato finora</span></div>';
            const max = Math.max(...counts);
            const mean = counts.reduce((sum, n, i) => sum + n * (i + 1), 0) / total;
            const bars = counts.map((n, i) => `
                <div class="dice-bar" data-tip="Faccia ${i + 1}||Uscita ${n} volte su ${total} (${(n / total * 100).toFixed(1)}%). Con un dado onesto ci si aspetta il 16,7%.">
                    <span class="dice-bar-fill" style="height:${max ? Math.round(n / max * 100) : 0}%"></span>
                    <b>${i + 1}</b><small>${Math.round(n / total * 100)}%</small>
                </div>`).join('');
            return `<div class="journal-section"><h4>I dadi</h4>
                <div class="dice-stats">${bars}</div>
                <div class="dice-stats-note">${total} dadi tirati dagli eroi · media ${mean.toFixed(2)} (attesa 3,50)${total < 60 ? ' · con pochi tiri le differenze sono normali' : ''}</div>
            </div>`;
        }

        /* ---------- 17. Conferma prima di lasciare mercante e tesoro ---------- */
        function confirmLeaveTreasure() {
            const left = currentTreasureItems.filter(Boolean).length;
            if (left === 0) { advanceNode(); return; }
            openModal('Lasciare il tesoro?',
                `<p>Nello scrigno ${left === 1 ? 'resta ancora <b>1</b> oggetto' : `restano ancora <b>${left}</b> oggetti`} da prelevare.</p>`,
                [{ label: 'Torna allo scrigno', className: 'btn-proceed' }, { label: 'Prosegui comunque', className: 'btn-danger', onClick: advanceNode }]);
        }


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

