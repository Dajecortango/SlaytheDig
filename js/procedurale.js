/* ==========================================================================
   CAMPAGNE PROCEDURALI (es. "Il percorso per il Drakengrad")
   Una campagna con il campo "procedurale" non ha una mappa scritta: a ogni nuova
   partita se ne genera una da un seme (stato.procSeed, salvato con la partita, così
   ricaricando torna la stessa mappa). Nemici da tutto il bestiario (normali, elite
   con fasi, boss: procEnemyRole), il resto riciclato dalle altre campagne: sfide ed
   eventi (trame con scelte) con le loro immagini, testi e immagini di mercanti,
   riposi e tesori.

   La mappa è un dungeon a piani (campo "procedurale": { piani, stanze }): ogni piano ha
   "stanze" livelli di stanze a bivi, poi un accampamento (riposo o mercante) e un guardiano
   da battere per scendere: un elite, il boss all'ultimo piano. La difficoltà cresce a ogni
   livello: nemici scelti tra i più forti man mano che si scende, con vita, Attacco e CA
   aumentati (PROC_SCALA in js/regole.js), sfide più difficili verso la fine.

   Caricato dopo js/libreria.js e js/comune.js, prima di js/game.js.
   campaignForPlay(id, seed) è il punto d'ingresso per gioco, salvataggi e simulatore.
   ========================================================================== */

// Crescita della difficoltà: PROC_SCALA in js/regole.js

// Generatore di numeri casuali con seme (mulberry32): stessa sequenza a parità di seme
function procRng(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function newProcSeed() {
    return Math.floor(rng() * 2147483647) + 1;
}

// Forza di un nemico, per metterli in fila dal più debole al più forte: statistiche, più le azioni
// delle fasi e gli effetti speciali (un elite con Danno 1 ma tre fasi cattive non è un elite debole)
function procEnemyPower(e) {
    const azioni = (e.fasi || []).reduce((s, f) => s + Math.max(1, (f.azioni || []).length), 0);
    const speciali = (e.speciali || []).length;
    return e.hp * e.dmg * Math.pow(1.25, (e.ca || 0) + (e.att || 0)) * (1 + 0.5 * azioni + 0.25 * speciali);
}

// Ruolo di un nemico del bestiario: boss se lo è in un capitolo o se ha almeno 2 fasi e 20 HP,
// elite se ha fasi, altrimenti normale
function procEnemyRole(e, usedAsBoss) {
    const fasi = Array.isArray(e.fasi) ? e.fasi.length : 0;
    if (usedAsBoss || (fasi >= 2 && (e.maxHp || 0) >= 20)) return 'boss';
    return fasi ? 'elite' : 'normal';
}

// Materiale: tutti i nemici del bestiario (con l'immagine del nodo in cui compaiono nei capitoli, se c'è)
// e, dalle altre campagne già risolte, sfide, eventi (trame con "scelte"), testi e immagini per tipo di nodo
function procPools(selfId) {
    const pools = { normal: [], elite: [], boss: [], challenges: [], events: [], images: { merchant: [], rest: [], treasure: [] },
        texts: { merchant: [], rest: [], treasure: [] } };
    const seen = { challenges: new Set(), events: new Set() };
    const nodeImage = {}, bosses = new Set();
    Object.values(window.CAMPAIGNS || {}).forEach(c => {
        if (!c || c.id === selfId || c.procedurale) return;
        const nodes = c.mapNodes || [];
        if (!nodes.length) return;
        const maxLevel = Math.max(...nodes.map(n => n.level));
        nodes.forEach(n => {
            if ((n.type === 'combat' || n.type === 'elite') && n.enemy) {
                if (n.level === maxLevel) bosses.add(n.enemy);
                if (n.image && !nodeImage[n.enemy]) nodeImage[n.enemy] = n.image;
            } else if (n.type === 'challenge' && n.challengeId && c.challenges[n.challengeId]) {
                const key = `${c.id}__${n.challengeId}`;
                if (seen.challenges.has(key)) return;
                seen.challenges.add(key);
                pools.challenges.push({ key, challenge: c.challenges[n.challengeId], image: n.image });
            } else if (n.type === 'story' && n.storyId && c.stories && c.stories[n.storyId] && (c.stories[n.storyId].scelte || []).length) {
                // Solo gli eventi (con scelte): i racconti sono legati alla trama del loro capitolo
                const key = `${c.id}__${n.storyId}`;
                if (seen.events.has(key)) return;
                seen.events.add(key);
                pools.events.push({ key, story: c.stories[n.storyId], image: n.image });
            } else if (pools.images[n.type] && n.image) {
                pools.images[n.type].push(n.image);
            }
        });
        Object.values(c.merchants || {}).forEach(t => t && pools.texts.merchant.push(t));
        Object.values(c.rests || {}).forEach(t => t && pools.texts.rest.push(t));
        Object.values(c.treasures || {}).forEach(t => t && pools.texts.treasure.push(t));
    });
    // Tutto il bestiario, tranne i nemici del tutorial e i segnaposto
    const bestiario = (window.LIBRERIA || {}).bestiario || {};
    Object.entries(bestiario).forEach(([id, e]) => {
        if (!e || /tutorial/i.test(id) || /mancante/i.test(e.name || '') || !e.maxHp) return;
        pools[procEnemyRole(e, bosses.has(id))].push({ id, enemy: e, image: nodeImage[id] || e.image || '' });
    });
    ['normal', 'elite', 'boss'].forEach(r => pools[r].sort((a, b) => procEnemyPower(a.enemy) - procEnemyPower(b.enemy) || a.id.localeCompare(b.id)));
    // Senza boss si usano gli elite più forti
    if (!pools.boss.length) pools.boss = pools.elite.slice(-2);
    return pools;
}

// Genera la campagna giocabile (forma delle campagne risolte) dal modello "raw" e dal seme
function generateProceduralCampaign(raw, seed) {
    // Due sequenze separate: la forma della mappa (livelli, tipi, posizioni, collegamenti) non dipende
    // dal materiale delle altre campagne, così un nemico o una sfida aggiunti altrove non cambiano
    // la mappa di una partita salvata (il salvataggio tiene solo done/active dei nodi per id)
    const rng = procRng(seed);
    const contentRng = procRng((seed ^ 0x9E3779B9) >>> 0 || 1);
    const pick = list => list[Math.floor(contentRng() * list.length)];
    const shuffle = list => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(contentRng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const camp = resolveCampaign({ ...raw, mapNodes: [], challenges: {}, merchants: {}, rests: {}, treasures: {}, stories: {} });
    const pools = procPools(raw.id);
    const cfg = raw.procedurale || {};
    // Piani del dungeon: "stanze" livelli a bivi, un accampamento e il guardiano (stanze + 2 livelli per piano)
    const piani = Math.max(1, cfg.piani || 3);
    const stanze = Math.max(2, cfg.stanze || 4);
    const perPiano = stanze + 2;
    const levels = piani * perPiano;
    const last = levels - 1;
    const pianoDi = level => Math.floor(level / perPiano);
    const postoDi = level => level % perPiano;  // 0..stanze-1 stanze, stanze = accampamento, stanze + 1 = guardiano
    camp.enemies = {};
    camp.mapNodes = [];

    // Nemico per il livello: tra quelli adatti all'avanzamento, con le statistiche cresciute
    const usedEnemies = new Set();
    function enemyFor(role, level) {
        const p = level / last;
        const list = pools[role].length ? pools[role] : pools.normal;
        const center = Math.round(p * (list.length - 1));
        const span = Math.max(1, Math.round(list.length * 0.2));
        // Il boss è sempre all'ultimo livello: si pesca fra tutti, altrimenti uscirebbero solo i più forti
        const candidates = role === 'boss' ? list : list.slice(Math.max(0, center - span), center + span + 1);
        const fresh = candidates.filter(c => !usedEnemies.has(c.id));
        const src = pick(fresh.length ? fresh : candidates);
        usedEnemies.add(src.id);
        const id = `${src.id}__l${level}`;
        const e = JSON.parse(JSON.stringify(src.enemy));
        e.hp = e.maxHp = Math.max(1, Math.round(e.maxHp * PROC_SCALA.hp(p)));
        e.att += PROC_SCALA.att(p);
        e.ca += PROC_SCALA.ca(p);

        camp.enemies[id] = e;
        return { id, image: src.image || e.image };
    }

    const challengeDeck = shuffle(pools.challenges);
    function challengeFor(level) {
        if (!challengeDeck.length) challengeDeck.push(...shuffle(pools.challenges));
        const src = challengeDeck.pop();
        const ch = JSON.parse(JSON.stringify(src.challenge));
        ch.cd = (ch.cd || 7) + PROC_SCALA.cd(level / last);
        const key = `${src.key}__l${level}`;
        camp.challenges[key] = ch;
        return { key, image: src.image };
    }

    // Eventi delle altre campagne (trame con scelte), in un mazzo come le sfide
    const eventDeck = shuffle(pools.events);
    function eventFor(level) {
        if (!eventDeck.length) eventDeck.push(...shuffle(pools.events));
        const src = eventDeck.pop();
        const key = `${src.key}__l${level}`;
        camp.stories[key] = JSON.parse(JSON.stringify(src.story));
        return { key, image: src.image, title: src.story.title };
    }

    // Testi e immagini di mercanti, riposi e tesori: uno per nodo, pescati dalle altre campagne
    function textFor(kind, level) {
        const coll = { merchant: 'merchants', rest: 'rests', treasure: 'treasures' }[kind];
        const key = `${kind}_${level}_${Object.keys(camp[coll]).length}`;
        camp[coll][key] = pools.texts[kind].length ? pick(pools.texts[kind]) : '';
        return { key, image: pools.images[kind].length ? pick(pools.images[kind]) : '' };
    }

    // Quanti nodi per livello: 2-4 nelle stanze, due all'accampamento (riposo e mercante), uno solo il guardiano
    const counts = [];
    for (let l = 0; l < levels; l++) {
        const posto = postoDi(l);
        counts.push(posto === stanze + 1 ? 1 : posto === stanze ? 2 : l === 0 ? 2 + Math.floor(rng() * 2) : 2 + Math.floor(rng() * 3));
    }

    // Tipi: all'ingresso solo scontri; ogni piano ha almeno un mercante a metà; dal secondo piano
    // può uscire un elite anche nelle stanze; il guardiano è un elite, il boss all'ultimo piano
    function typeFor(level, idx) {
        const posto = postoDi(level), piano = pianoDi(level);
        if (posto === stanze + 1) return level === last ? 'boss' : 'elite';
        if (posto === stanze) return idx === 0 ? 'rest' : 'merchant';
        if (level === 0) return 'combat';
        if (idx === 1 && posto === Math.floor(stanze / 2)) return 'merchant';
        const r = rng();
        if (piano >= 1 && r < 0.1) return 'elite';
        if (r < 0.54) return 'combat';
        if (r < 0.78) return 'challenge';
        if (r < 0.86) return 'rest';
        if (r < 0.93) return 'merchant';
        return 'treasure';
    }

    const LABEL = { story: 'Evento', combat: 'Scontro', elite: 'Scontro elite', challenge: 'Sfida', merchant: 'Mercante', rest: 'Riposo', treasure: 'Tesoro' };
    const ICON = { combat: '🗡️', elite: '👹', challenge: '❓', merchant: '🪙', rest: '⛺', treasure: '💎', story: '📜' };
    let nextId = 0;
    const byLevel = counts.map((count, level) => {
        const xs = Array.from({ length: count }, (_, i) => Math.round(count === 1 ? 400 : 140 + i * (520 / (count - 1)) + (rng() - 0.5) * 40));
        return xs.map((x, idx) => {
            let type = typeFor(level, idx);
            const guardiano = postoDi(level) === stanze + 1;
            const dove = guardiano ? `Piano ${pianoDi(level) + 1}` : postoDi(level) === stanze ? `Piano ${pianoDi(level) + 1}, accampamento` : `Piano ${pianoDi(level) + 1}, stanza ${postoDi(level) + 1}`;
            const node = { id: nextId++, level, x, type, title: '', icon: '', done: false, active: level === 0, next: [], image: '' };
            if (type === 'boss' || type === 'combat' || type === 'elite') {
                const e = enemyFor(type === 'combat' ? 'normal' : type, level);
                node.type = type === 'boss' ? 'combat' : type;
                node.enemy = e.id;
                node.image = e.image || '';
                node.title = type === 'boss' ? `${dove} - ${camp.enemies[e.id].name} (Boss)` : guardiano ? `${dove} - ${camp.enemies[e.id].name} (Guardiano)` : `${dove} - ${LABEL[type]}`;
                node.icon = ICON[node.type];
            } else if (type === 'challenge' && pools.events.length && procRng((seed ^ Math.imul(node.id + 1, 0x85EBCA6B)) >>> 0 || 1)() < PROC_EVENTI) {
                // Evento al posto della sfida: deciso per nodo con una sequenza a parte, la forma della mappa non cambia
                const ev = eventFor(level);
                node.type = 'story';
                node.storyId = ev.key;
                node.image = ev.image || '';
                node.title = `${dove} - ${ev.title || 'Evento'}`;
            } else if (type === 'challenge') {
                const ch = challengeFor(level);
                node.challengeId = ch.key;
                node.image = ch.image || '';
            } else {
                const t = textFor(type, level);
                node[{ merchant: 'merchantId', rest: 'restId', treasure: 'treasureId' }[type]] = t.key;
                node.image = t.image;
            }
            if (!node.title) node.title = `${dove} - ${LABEL[node.type]}`;
            if (!node.icon) node.icon = ICON[node.type];
            camp.mapNodes.push(node);
            return node;
        });
    });

    // Collegamenti: ogni nodo va a quello "sotto" di sé nel livello successivo e a volte al vicino;
    // poi ogni nodo del livello successivo riceve almeno un collegamento
    for (let l = 0; l < last; l++) {
        const from = byLevel[l], to = byLevel[l + 1];
        from.forEach((n, i) => {
            const j = to.length === 1 ? 0 : Math.round(i * (to.length - 1) / Math.max(1, from.length - 1));
            n.next.push(to[j].id);
            const k = j + (rng() < 0.5 ? -1 : 1);
            if (rng() < 0.45 && to[k] && !n.next.includes(to[k].id)) n.next.push(to[k].id);
        });
        to.forEach((m, j) => {
            if (from.some(n => n.next.includes(m.id))) return;
            const nearest = from.reduce((best, n) => Math.abs(n.x - m.x) < Math.abs(best.x - m.x) ? n : best, from[0]);
            nearest.next.push(m.id);
        });
        from.forEach(n => n.next.sort((a, b) => a - b));
    }
    camp.procSeed = seed;
    return camp;
}

// Campagna pronta da giocare: quella risolta, oppure (se procedurale) quella generata dal seme
function campaignForPlay(campaignId, seed) {
    const camp = (window.CAMPAIGNS || {})[campaignId];
    if (!camp) return null;
    if (!camp.procedurale) return JSON.parse(JSON.stringify(camp));
    const raw = (window.CAMPAIGNS_RAW || {})[campaignId] || camp;
    return generateProceduralCampaign(raw, seed || newProcSeed());
}
