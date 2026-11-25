/* ==========================================================================
   MOTORE DI GIOCO: STATO, CAMPAGNE E SCHERMATE
   Stato globale della partita (stato), reliquie e maledizioni per id, effetti descrittivi
   (applyEffects), scelta della campagna (carosello, campagna di prova dall'editor), numero
   di eroi, video dei menu, cambio di schermata (showScreen), barre del party e messaggi a schermo.
   Primo file del motore: dopo di lui, nello stesso ambito globale, js/interfaccia.js,
   js/effetti.js, js/menu.js, js/spedizione.js e poi js/creazione.js e gli altri.
   ========================================================================== */

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
            gmProvaMod: 0,          // bonus (+) o malus (−) del master a tutte le prove (Pannello di Controllo)
            onlineOwners: {},       // partita online: eroe -> eroe (il giocatore è l'eroe che ha scelto, js/online.js)
            challengeState: null,
            activeEnemy: null,
            helpBonus: 0,
            helpDmgBonus: 0,  // danno in più da un Aiuta con "Veleni ed altri composti", solo per il round
            combatRound: 0,
            procSeed: null  // seme della mappa delle campagne procedurali (js/procedurale.js)
        };

        // Stato della presentazione: schermata attiva, fase del combattimento
        let currentScreenId = 'screenStart';
        let combatPhase = 'none';
// Reliquie e maledizioni si riconoscono per id (la chiave nella libreria), non per nome:
// così si possono rinominare dall'editor senza rompere il loro effetto.
// idFromName (id ricavato da un nome) è in js/comune.js: lo usa anche l'editor per gli id automatici

function hasRelic(relicId) {
    return stato.unlockedRelics.some(r => r.id === relicId);
}

// Nome attuale della reliquia (dalla libreria): l'id resta fisso, il nome si può cambiare
function relicName(relicId) {
    const r = (window.LIBRERIA && LIBRERIA.reliquie || {})[relicId];
    return r ? r.name : relicId;
}

// Le maledizioni sono { id, text }: "text" è la riga mostrata al giocatore ("Nome (descrizione)")
function hasCurse(curseId) {
    return stato.activeCurses.some(c => c.id === curseId);
}

function curseText(curse) {
    return typeof curse === 'string' ? curse : curse.text;
}

function relicHeroTarget(effects) {
    const e = (effects || []).find(x => /^hero_/.test(x.effect));
    if (!e) return null;
    const vivi = stato.party.filter(h => h.hp > 0);
    if (!vivi.length) return null;
    return e.stat ? vivi.reduce((b, h) => (h[e.stat] || 0) < (b[e.stat] || 0) ? h : b) : vivi[0];
}

// Dà al party la reliquia della libreria con questo id (bottino degli elite, mercante)
function grantRelic(relicId) {
    const relic = LIBRERIA.reliquie[relicId];
    if (!relic || hasRelic(relicId)) return null;
    const owned = { ...relic, id: relicId };
    stato.unlockedRelics.push(owned);
    // Effetti "hero_*" (es. +1 Fede a un eroe): senza una prova vanno a un eroe solo, quello in piedi
    // con la statistica più bassa (il primo della compagnia a parità), non a tutti
    const eroe = relicHeroTarget(relic.effects);
    applyEffects(relic.effects, eroe);
    discover('relics', relic.name);
    return owned;
}

// Una reliquia a caso fra quelle della libreria che il party non ha ancora (null se le ha tutte)
function pickUnownedRelicId() {
    const ids = Object.keys(LIBRERIA.reliquie || {}).filter(id => !hasRelic(id));
    return ids.length ? ids[Math.floor(rng() * ids.length)] : null;
}

function breakRelic(relicId) {
    const idx = stato.unlockedRelics.findIndex(r => r.id === relicId);
    if (idx > -1) {
        stato.unlockedRelics.splice(idx, 1);
        updatePartyStatusBars();
    }
}

        // Effetto hero_item: mette nello zaino dell'eroe "count" copie di un oggetto dell'armeria.
        // I consumabili uguali vanno prima nelle pile esistenti (CONSUMABLE_STACK); senza posto nello
        // zaino (BACKPACK_SIZE) le copie in più vanno perse. Non conta come l'oggetto iniziale scelto.
        function giveHeroItem(hero, itemId, count) {
            const base = (LIBRERIA.armeria || {})[itemId];
            if (!base) { console.warn('hero_item: oggetto sconosciuto', itemId); return; }
            if (!heroCanUseItem(hero, base)) { uiMessage(`${hero.name} non può portare ${base.name}`); return; }
            const consumable = (base.type || '').startsWith('consumable');
            let lost = 0;
            for (let i = 0; i < count; i++) {
                const pila = stackableSlot(hero, base);
                if (pila) { pila.qty = (pila.qty || 1) + 1; continue; }
                if (hero.items.length >= BACKPACK_SIZE) { lost++; continue; }
                const copy = JSON.parse(JSON.stringify(base));
                hero.items.push(copy);
                if (!consumable) applyItemEffects(copy, hero);
            }
            if (lost) uiMessage(`Zaino di ${hero.name} pieno: ${lost} ${base.name} ${lost === 1 ? 'va perso' : 'vanno persi'}`);
            discover('items', itemId);
        }

        // Interprete degli effetti descritti nei dati delle campagne (campo "effects").
        // Gli effetti "hero_*" agiscono sull'eroe passato (es. chi ha affrontato la prova); senza eroe
        // (es. una reliquia) su ogni eroe in piedi. Gli altri sull'intera compagnia; i caduti restano a 0 HP.
        // I tipi sono elencati in EFFECT_TYPES (js/comune.js, usato anche dall'editor): un tipo nuovo va aggiunto lì e qui.
        function applyEffects(effects, hero) {
            const targets = hero ? [hero] : stato.party.filter(h => h.hp > 0);
            (effects || []).forEach(e => {
                switch (e.effect) {
                    case 'hero_stat': targets.forEach(h => { h[e.stat] = (h[e.stat] || 0) + e.val; }); break;
                    case 'hero_set': targets.forEach(h => { h[e.stat] = e.val; }); break;
                    case 'party_stat': stato.party.forEach(h => { h[e.stat] = Math.max(0, (h[e.stat] || 0) + e.val); }); break;
                    // Più HP massimi a tutti; quelli attuali solo a chi è in piedi (un caduto non si rialza)
                    case 'party_max_hp': stato.party.forEach(h => { h.maxHp += e.val; if (h.hp > 0) h.hp = Math.max(1, Math.min(h.maxHp, h.hp + e.val)); }); break;
                    // Danno a chi è in piedi, che resta almeno a 1 HP; i caduti restano a 0
                    case 'party_damage': stato.party.forEach(h => { if (h.hp > 0) h.hp = Math.max(1, h.hp - e.val); }); break;
                    case 'coins': stato.partyCoins = Math.max(0, stato.partyCoins + e.val); break;
                    case 'add_curse': stato.activeCurses.push({ id: e.id || idFromName(e.text), text: e.text }); break;
                    case 'hero_item': targets.forEach(h => giveHeroItem(h, e.item, e.val || 1)); break;
                    case 'party_heal': stato.party.filter(h => h.hp > 0).forEach(h => healHero(h, e.val || 1)); break;
                    case 'relic': grantRelic(e.id); break;
                    // Maledizione della libreria, come la punizione di una prova (applyPunishment in js/prove.js), una volta sola
                    case 'curse': {
                        const c = (LIBRERIA.maledizioni || {})[e.id];
                        if (c && !hasCurse(e.id)) applyPunishment({ ...c, id: e.id }, hero);
                        break;
                    }
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

        // Campagne giocabili: senza eroi (es. una campagna ancora in lavorazione) la creazione del party non partirebbe
        function playableCampaigns() {
            return Object.values(campaignsDatabase).filter(c => (c.heroes || []).length > 0);
        }

        /* ---------- Progressi: capitoli, avventure ed eroi che si sbloccano giocando ----------
           Le campagne vinte restano in localStorage (dignitas_progresso). Un capitolo si apre vincendo quello prima;
           un'avventura con "dopo" (data/libreria/avventure.js) si apre finendo l'avventura indicata; gli eroi in
           "eroiDopo" di una campagna ({ avventura: [id degli eroi] }) si possono scegliere solo finita quell'avventura.
           L'opzione "Sblocca tutto" (per il master) apre tutto senza toccare i progressi. */
        const PROGRESSO_KEY = 'dignitas_progresso';
        function campagneCompletate() {
            try { return new Set(JSON.parse(localStorage.getItem(PROGRESSO_KEY) || '[]')); } catch (e) { return new Set(); }
        }
        const tuttoSbloccato = () => typeof gameOptions !== 'undefined' && !!gameOptions.sbloccaTutto;
        const capitoliAvventura = advId => playableCampaigns().filter(c => c.avventura === advId).sort((a, b) => (a.capitolo || 0) - (b.capitolo || 0));
        function avventuraCompletata(advId, fatte = campagneCompletate()) {
            const capitoli = capitoliAvventura(advId);
            return capitoli.length > 0 && capitoli.every(c => fatte.has(c.id));
        }
        // Perché un'avventura è ancora chiusa ('' = aperta)
        function bloccoAvventura(advId, fatte = campagneCompletate()) {
            const avventure = LIBRERIA.avventure || {};
            const adv = avventure[advId];
            if (tuttoSbloccato() || !adv || !adv.dopo || !avventure[adv.dopo] || avventuraCompletata(adv.dopo, fatte)) return '';
            return `Si sblocca completando «${avventure[adv.dopo].title}»`;
        }
        // Perché una campagna è ancora chiusa ('' = si può giocare): l'avventura è chiusa o manca un capitolo prima
        function bloccoCampagna(campaignId, fatte = campagneCompletate()) {
            const c = campaignsDatabase[campaignId];
            const adv = c && c.avventura && (LIBRERIA.avventure || {})[c.avventura];
            if (tuttoSbloccato() || !adv) return '';
            const chiusa = bloccoAvventura(c.avventura, fatte);
            if (chiusa) return chiusa;
            const capitoli = capitoliAvventura(c.avventura);
            const prima = capitoli.slice(0, capitoli.findIndex(x => x.id === c.id)).find(x => !fatte.has(x.id));
            return prima ? `Si sblocca completando «${chapterLabel(prima, adv.title)}»` : '';
        }
        // Eroi di una campagna ancora chiusi: { libId: titolo dell'avventura da finire }
        function eroiBloccati(camp, fatte = campagneCompletate()) {
            const chiusi = {};
            if (tuttoSbloccato()) return chiusi;
            Object.entries((camp && camp.eroiDopo) || {}).forEach(([advId, ids]) => {
                const adv = (LIBRERIA.avventure || {})[advId];
                if (adv && !avventuraCompletata(advId, fatte)) (ids || []).forEach(id => { chiusi[id] = adv.title; });
            });
            return chiusi;
        }
        // Tutto ciò che è aperto con queste campagne vinte: per dire cosa si è appena sbloccato
        function sbloccatiCon(fatte) {
            const nomi = new Set();
            playableCampaigns().forEach(c => {
                if (c.avventura && !bloccoCampagna(c.id, fatte)) nomi.add(c.title);
                const chiusi = eroiBloccati(c, fatte);
                (c.heroes || []).forEach(h => { if (c.eroiDopo && !chiusi[h.libId]) nomi.add(h.name); });
            });
            return nomi;
        }
        // Campagna vinta: resta nei progressi; restituisce i nomi di ciò che si è appena aperto
        function segnaCampagnaCompletata(campaignId) {
            const fatte = campagneCompletate();
            if (!campaignId || fatte.has(campaignId)) return [];
            const prima = sbloccatiCon(fatte);
            fatte.add(campaignId);
            try { localStorage.setItem(PROGRESSO_KEY, JSON.stringify([...fatte])); } catch (e) { /* senza archivio i progressi valgono per questa pagina */ }
            return [...sbloccatiCon(fatte)].filter(n => !prima.has(n));
        }

        /* ---------- Avventure e capitoli ----------
           Il menu "Nuova Partita" mostra le avventure (LIBRERIA.avventure, data/libreria/avventure.js) e le campagne
           a sé. Una campagna con "avventura" è un capitolo: si sceglie nella pagina dell'avventura (screenAdventure),
           in ordine di "capitolo". Ordine delle voci: quello dei <script> della loro prima campagna. */
        function campaignMenuEntries() {
            const avventure = LIBRERIA.avventure || {};
            const entries = [];
            const byAdventure = {};
            playableCampaigns().forEach(c => {
                const adv = c.avventura && avventure[c.avventura];
                if (!adv) { entries.push({ kind: 'campagna', id: c.id, title: c.title, badge: c.badge || '', description: c.description || '', cover: c.coverImage }); return; }
                if (!byAdventure[c.avventura]) {
                    byAdventure[c.avventura] = { kind: 'avventura', id: c.avventura, title: adv.title, badge: adv.badge || 'Avventura', description: adv.description || '', chapters: [], blocco: bloccoAvventura(c.avventura) };
                    entries.push(byAdventure[c.avventura]);
                }
                byAdventure[c.avventura].chapters.push(c);
            });
            Object.values(byAdventure).forEach(e => {
                e.chapters.sort((a, b) => (a.capitolo || 0) - (b.capitolo || 0));
                // Senza copertina sua, quella del primo capitolo che ne ha una
                e.cover = avventure[e.id].coverImage || (e.chapters.find(c => c.coverImage) || {}).coverImage;
            });
            return entries;
        }

        // Nome del capitolo nell'elenco: il titolo della campagna senza il nome dell'avventura davanti
        // ("Caccia alla Bestia, Capitolo Uno" -> "Capitolo Uno")
        function chapterLabel(c, adventureTitle) {
            const title = String(c.title || '').trim();
            const prefix = String(adventureTitle || '').trim().toLowerCase();
            if (!prefix || !title.toLowerCase().startsWith(prefix)) return title;
            return title.slice(prefix.length).replace(/^[\s,:;.\-–—]+/, '') || title;
        }

        // focusId: avventura o campagna da mettere al centro (tornando indietro dalla pagina di un'avventura)
        function goToCampaigns(focusId) {
            showScreen('screenCampaigns');
            const grid = document.getElementById('campaignsGridList');
            const entries = campaignMenuEntries();
            grid.innerHTML = entries.map((e, idx) => `
                <div class="campaign-card${e.blocco ? ' is-locked' : ''}" tabindex="0" role="button" data-index="${idx}" ${azione('onCampaignCardClick', idx, e.kind, e.id)} ${azioneSu('enter', 'openMenuEntry', e.kind, e.id)}>
                    <div>
                        <div class="campaign-cover"><img src="${esc(e.cover || 'immagini/segnaposto/cover.svg')}" alt="${esc(e.title)}" ${IMG_LAZY}></div>
                        <span class="campaign-badge">${esc(e.badge)}${e.kind === 'avventura' ? ` · ${e.chapters.length} ${e.chapters.length === 1 ? 'capitolo' : 'capitoli'}` : ''}</span>
                        <h3>${esc(e.title)}</h3>
                        <p>${esc(e.description)}</p>
                        ${e.blocco ? `<p class="campaign-lock">${esc(e.blocco)}</p>` : ''}
                    </div>
                    <button class="btn-small" tabindex="-1">${e.blocco ? 'Bloccata' : e.kind === 'avventura' ? 'Scegli Capitolo' : 'Scegli Spedizione'}</button>
                </div>
            `).join('');

            document.getElementById('campaignDots').innerHTML = entries.map((e, idx) => `
                <button class="carousel-dot" ${azione('goToCampaignSlide', idx)} aria-label="${esc(e.title)}"></button>
            `).join('') + `<span class="carousel-counter" id="campaignCounter"></span>`;

            bindCampaignCarousel();
            const start = Math.max(0, entries.findIndex(e => e.id === focusId));
            activeCampaignSlide = start;
            requestAnimationFrame(() => {
                grid.style.scrollBehavior = 'auto';
                goToCampaignSlide(start);
                grid.style.scrollBehavior = '';
            });
        }

        // Voce del menu scelta: un'avventura apre la sua pagina, una campagna a sé parte subito
        function openMenuEntry(kind, id) {
            const blocco = kind === 'avventura' ? bloccoAvventura(id) : bloccoCampagna(id);
            if (blocco) { uiMessage(blocco); return; }
            if (kind === 'avventura') openAdventure(id);
            else selectCampaign(id);
        }

        // Pagina di un'avventura: capitoli a destra, copertina e descrizione del capitolo scelto a sinistra
        let currentAdventure = null;  // { id, chapters, selected }
        function openAdventure(id, chapterId) {
            const entry = campaignMenuEntries().find(e => e.kind === 'avventura' && e.id === id);
            if (!entry) return;
            // Senza un capitolo indicato si parte dall'ultimo aperto: quello a cui si è arrivati
            const aperti = entry.chapters.map(c => !bloccoCampagna(c.id));
            const selected = Math.max(0, chapterId ? entry.chapters.findIndex(c => c.id === chapterId) : aperti.lastIndexOf(true));
            currentAdventure = { id, entry, selected };
            showScreen('screenAdventure');
            document.getElementById('adventureBadge').textContent = entry.badge;
            document.getElementById('adventureTitle').textContent = entry.title;
            document.getElementById('adventureChapters').innerHTML = entry.chapters.map((c, i) => `
                <button class="adventure-chapter${aperti[i] ? '' : ' is-locked'}" role="option" data-index="${i}" ${azione('selectAdventureChapter', i)} ${azioneSu('dblclick', 'playAdventureChapter', i)}>
                    <span class="adventure-chapter-num">${romanNumeral(i + 1)}</span>
                    <span class="adventure-chapter-name">${esc(chapterLabel(c, entry.title))}${aperti[i] ? '' : ' · bloccato'}</span>
                </button>
            `).join('');
            bindAdventureKeys();
            selectAdventureChapter(selected);
        }

        function selectAdventureChapter(i) {
            if (!currentAdventure) return;
            const chapters = currentAdventure.entry.chapters;
            i = Math.max(0, Math.min(chapters.length - 1, i));
            currentAdventure.selected = i;
            const c = chapters[i];
            document.querySelectorAll('#adventureChapters .adventure-chapter').forEach((el, k) => {
                el.classList.toggle('is-active', k === i);
                el.setAttribute('aria-selected', k === i ? 'true' : 'false');
            });
            document.getElementById('adventureCover').src = c.coverImage || currentAdventure.entry.cover || 'immagini/segnaposto/cover.svg';
            document.getElementById('adventureCover').alt = c.title;
            document.getElementById('adventureChapterTitle').textContent = c.title;
            const blocco = bloccoCampagna(c.id);
            document.getElementById('adventureChapterDesc').textContent = (blocco ? blocco + '. ' : '') + (c.description || currentAdventure.entry.description);
        }

        // "Gioca" (o doppio clic sul capitolo): si parte come scegliendo la campagna
        function playAdventureChapter(i) {
            if (!currentAdventure) return;
            const c = currentAdventure.entry.chapters[i == null ? currentAdventure.selected : i];
            if (!c) return;
            const blocco = bloccoCampagna(c.id);
            if (blocco) { uiMessage(blocco); return; }
            selectCampaign(c.id);
        }

        function adventureBack() {
            goToCampaigns(currentAdventure && currentAdventure.id);
        }

        function romanNumeral(n) {
            return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][n - 1] || String(n);
        }

        // Frecce su e giù per scegliere il capitolo, Invio per giocarlo, Esc per tornare alle avventure
        function bindAdventureKeys() {
            if (bindAdventureKeys.done) return;
            bindAdventureKeys.done = true;
            document.addEventListener('keydown', e => {
                if (!currentAdventure || document.getElementById('screenAdventure').classList.contains('hidden')) return;
                if (!document.getElementById('wc3Modal').classList.contains('hidden')) return;
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    selectAdventureChapter(currentAdventure.selected + (e.key === 'ArrowDown' ? 1 : -1));
                    const active = document.querySelector('#adventureChapters .adventure-chapter.is-active');
                    if (active) active.focus();
                } else if (e.key === 'Enter') { e.preventDefault(); playAdventureChapter(); }
                else if (e.key === 'Escape') { e.preventDefault(); adventureBack(); }
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

        // index.html?seme=123: tutti i numeri casuali della partita in una sequenza fissa (rng in js/comune.js),
        // per riprovare uguale una partita in cui è comparso un problema
        (function seedFromUrl() {
            const seme = new URLSearchParams(location.search).get('seme');
            if (seme != null && seme !== '') setRngSeed(Number(seme) || [...seme].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7));
        })();

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
                        // PRAYER_BLESSINGS (js/comune.js) è l'oggetto di prima: si riempie con le benedizioni modificate
                        if (data.library.benedizioni) { Object.keys(PRAYER_BLESSINGS).forEach(k => delete PRAYER_BLESSINGS[k]); Object.assign(PRAYER_BLESSINGS, data.library.benedizioni); }
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
                    // Video e suoni dei nemici caricati nell'editor (il video degli elite e dei boss gira in ciclo nello scontro)
                    Object.values(camp.enemies || {}).forEach(e => ['image', 'video', 'sfxAttack', 'sfxHit', 'sfxDeath', 'sfxNemesi'].forEach(k => { if (e[k]) e[k] = fix(e[k]); }));
                    (camp.heroes || []).forEach(h => {
                        if (h.portrait) h.portrait = fix(h.portrait);
                        if (h.portraitWounded) h.portraitWounded = fix(h.portraitWounded);
                        if (Array.isArray(h.immaginiUno)) h.immaginiUno = h.immaginiUno.map(fix);
                        if (Array.isArray(h.suoniUno)) h.suoniUno = h.suoniUno.map(fix);
                    });
                    camp.title = `[Prova] ${camp.title}`;
                    camp.badge = "Prova dall'editor";
                    campaignsDatabase[camp.id] = camp;
                    // "Prova da qui" dell'editor: compagnia già fatta, si parte dal nodo scelto
                    if (data.partenza && new URLSearchParams(location.search).get('nodo') != null) { startPlaytestFromNode(camp.id, data.partenza); return; }
                    // Apre subito la scelta: la pagina dell'avventura con il capitolo di prova, o la campagna al centro
                    if (camp.avventura && (LIBRERIA.avventure || {})[camp.avventura]) openAdventure(camp.avventura, camp.id);
                    else goToCampaigns(camp.id);
                };
            };
        })();

        /* "Prova da qui" dell'editor (js/editor/progetto.js): partenza = { nodeId, eroi: [nomi] }.
           La compagnia si crea da sola (prima abilità e primo oggetto che l'eroe può portare, come il
           simulatore: simBuildHero) e sulla mappa è raggiungibile solo il nodo scelto. */
        function startPlaytestFromNode(campaignId, partenza) {
            selectCampaign(campaignId);
            const camp = stato.currentCampaign;
            if (!camp) return;
            const dati = { heroes: camp.heroes || [], abilities: campaignAbilities, armory: campaignArmory };
            registerCampaignHeroPortraits(dati.heroes);
            stato.party = (partenza.eroi || []).filter(nome => dati.heroes.some(h => h.name === nome)).map(nome => {
                const base = dati.heroes.find(h => h.name === nome);
                return simBuildHero(dati, nome, 0, dati.armory.findIndex(it => heroCanUseItem(base, it)));
            });
            if (!stato.party.length) { uiError('Prova da qui: nessuno degli eroi scelti è nella campagna'); return; }
            partySize = stato.party.length;
            updatePartyStatusBars();
            const nodo = stato.stsMapNodes.find(n => n.id === partenza.nodeId);
            if (nodo) {
                stato.stsMapNodes.forEach(n => { n.active = false; });
                nodo.active = true;
                // Il segnalino della compagnia parte dal punto che porta lì (la vista si centra sul nodo)
                const prima = stato.stsMapNodes.find(n => (n.next || []).includes(nodo.id));
                if (prima) prima.done = true;
            } else uiMessage('Il punto scelto non c\'è in questa mappa: si parte dall\'inizio');
            startExpedition();
        }

        function scrollCampaigns(dir) {
            goToCampaignSlide(activeCampaignSlide + dir);
        }

        // Clic su una scheda laterale: la porta al centro; clic sulla scheda centrale: la sceglie
        function onCampaignCardClick(idx, kind, id) {
            if (idx !== activeCampaignSlide) {
                goToCampaignSlide(idx);
                return;
            }
            openMenuEntry(kind, id);
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

            // Eroi ancora da sbloccare (eroiDopo): non si possono scegliere finché l'avventura non è finita
            const chiusi = eroiBloccati(stato.currentCampaign);
            campaignHeroes = (stato.currentCampaign.heroes || []).filter(h => !chiusi[h.libId]);
            const daFinire = [...new Set(Object.values(chiusi))];
            if (daFinire.length) uiMessage(`Altri eroi si sbloccano completando ${daFinire.map(t => `«${t}»`).join(', ')}`);
            registerCampaignHeroPortraits(campaignHeroes);
            campaignAbilities = rawCamp.abilities || {};
            campaignArmory = stato.currentCampaign.initialArmory || [];

            gameItems = stato.currentCampaign.lootItems && stato.currentCampaign.lootItems.length > 0 ? stato.currentCampaign.lootItems : DEFAULT_GAME_ITEMS;
            currentSaveSlot = null;  // nuova partita: nessuno slot finché non la si salva

            document.getElementById('campaignIntroTitle').textContent = stato.currentCampaign.title;
            document.getElementById('campaignIntroImg').src = stato.currentCampaign.coverImage || 'immagini/segnaposto/cover.svg';
            document.getElementById('campaignIntroDesc').innerHTML = `<strong>Descrizione:</strong> ${stato.currentCampaign.introText}`;
            document.getElementById('mapCampaignHeader').textContent = `Mappa: ${stato.currentCampaign.title}`;

            setupPartySizeSelector();
            startPartyCreation();
        }

        function setupPartySizeSelector() {
            const sizeSelect = document.getElementById('partySizeSelect');
            const totalHeroes = campaignHeroes.length;
            const minSize = partyMinSize(stato.currentCampaign);
            const maxSize = Math.min(totalHeroes, Math.max(minSize, partyMaxSize(stato.currentCampaign)));

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
        const GAME_VERSION = '1.8';
        document.getElementById('menuVersion').textContent = `Slay the Dig · versione ${GAME_VERSION}`;

        const MENU_SCENE_SCREENS = ['screenStart', 'screenCampaigns', 'screenAdventure'];

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

        // 26. Sipario tra le schermate, con un passaggio a tema: taglio di spada verso lo scontro (rosso con elite e boss),
        // bagliore d'oro verso bottino e tesori, fuoco verso il riposo, buio verso la sconfitta, gloria verso la vittoria
        const SCREEN_TRANSITIONS = {
            screenCombat: 'taglio', screenLoot: 'oro', screenTreasure: 'oro', screenTreasureLoot: 'oro',
            screenRest: 'fuoco', screenDefeat: 'buio', screenVictory: 'gloria'
        };
        function screenTransitionFor(from, to) {
            const tema = SCREEN_TRANSITIONS[to] || 'base';
            if (tema !== 'base' && SCREEN_TRANSITIONS[from] === tema) return 'base';  // tesoro -> suo bottino: una volta sola
            if (tema === 'taglio' && currentEnemyIsEliteOrBoss()) return 'taglio-elite';
            return tema;
        }

        function playScreenCurtain(tema = 'base') {
            if (!animationsEnabled()) return;
            let curtain = document.getElementById('screenCurtain');
            if (!curtain) {
                curtain = document.createElement('div');
                curtain.id = 'screenCurtain';
                curtain.setAttribute('aria-hidden', 'true');
                curtain.innerHTML = '<i class="sc-half sc-a"></i><i class="sc-half sc-b"></i><b class="sc-slash"><i></i></b>';
                document.body.appendChild(curtain);
            }
            curtain.className = '';
            void curtain.offsetWidth;
            curtain.className = `play t-${tema}`;
            void curtain.offsetWidth;
            speedUpAnimations(curtain);
        }

        function showScreen(screenId) {
            if (currentScreenId && currentScreenId !== screenId) playScreenCurtain(screenTransitionFor(currentScreenId, screenId));
            currentScreenId = screenId;
            if (screenId !== 'screenCombat') combatPhase = 'none';
            // Fine partita: il riepilogo si scrive prima di mostrare la schermata (js/spedizione.js)
            if (screenId === 'screenVictory' || screenId === 'screenDefeat') mostraRiepilogo(screenId === 'screenVictory' ? 'vittoria' : 'sconfitta');
            document.querySelectorAll('.container > div').forEach(div => div.classList.add('hidden'));
            // Menu iniziale e scelta campagna: scena a tutto schermo senza barre, come i menu di Warcraft III
            document.body.classList.toggle('menu-mode', MENU_SCENE_SCREENS.includes(screenId));
            // Riposo: la notte scurisce i bordi e il falò illumina le carte degli eroi (css/style.css, "Riposo")
            document.body.classList.toggle('riposo-notte', screenId === 'screenRest');
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
            playNemesisSfx();
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
