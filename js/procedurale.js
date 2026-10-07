/* ==========================================================================
   CAMPAGNE PROCEDURALI (es. "Il percorso per il Drakengrad")
   Una campagna con il campo "procedurale" non ha una mappa scritta: a ogni nuova
   partita se ne genera una da un seme (stato.procSeed, salvato con la partita, così
   ricaricando torna la stessa mappa). Tutto è riciclato dalle altre campagne:
   nemici (normali, elite, boss), sfide con le loro immagini, testi e immagini di
   mercanti, riposi e tesori. La difficoltà cresce in modo costante col livello:
   nemici scelti tra i più forti man mano che si sale e con vita e statistiche
   aumentate (DRAKENGRAD_SCALA), sfide più difficili verso la fine.

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
    return Math.floor(Math.random() * 2147483647) + 1;
}

// Materiale delle altre campagne (già risolte): nemici per ruolo, sfide, testi e immagini per tipo di nodo
function procPools(selfId) {
    const pools = { normal: [], elite: [], boss: [], challenges: [], images: { merchant: [], rest: [], treasure: [] },
        texts: { merchant: [], rest: [], treasure: [] } };
    const seen = { normal: new Set(), elite: new Set(), boss: new Set(), challenges: new Set() };
    Object.values(window.CAMPAIGNS || {}).forEach(c => {
        if (!c || c.id === selfId || c.procedurale) return;
        const nodes = c.mapNodes || [];
        if (!nodes.length) return;
        const maxLevel = Math.max(...nodes.map(n => n.level));
        nodes.forEach(n => {
            if ((n.type === 'combat' || n.type === 'elite') && n.enemy && c.enemies[n.enemy] && !/mancante/i.test(c.enemies[n.enemy].name)) {
                const role = n.level === maxLevel ? 'boss' : n.type === 'elite' ? 'elite' : 'normal';
                if (seen[role].has(n.enemy)) return;
                seen[role].add(n.enemy);
                pools[role].push({ id: n.enemy, enemy: c.enemies[n.enemy], image: n.image });
            } else if (n.type === 'challenge' && n.challengeId && c.challenges[n.challengeId]) {
                const key = `${c.id}__${n.challengeId}`;
                if (seen.challenges.has(key)) return;
                seen.challenges.add(key);
                pools.challenges.push({ key, challenge: c.challenges[n.challengeId], image: n.image });
            } else if (pools.images[n.type] && n.image) {
                pools.images[n.type].push(n.image);
            }
        });
        Object.values(c.merchants || {}).forEach(t => t && pools.texts.merchant.push(t));
        Object.values(c.rests || {}).forEach(t => t && pools.texts.rest.push(t));
        Object.values(c.treasures || {}).forEach(t => t && pools.texts.treasure.push(t));
    });
    // Forza di un nemico, per metterli in fila dal più debole al più forte
    const power = e => e.hp * e.dmg * Math.pow(1.25, (e.ca || 0) + (e.att || 0));
    ['normal', 'elite', 'boss'].forEach(r => pools[r].sort((a, b) => power(a.enemy) - power(b.enemy)));
    // Senza boss nelle altre campagne si usano gli elite più forti
    if (!pools.boss.length) pools.boss = pools.elite.slice(-2);
    return pools;
}

// Genera la campagna giocabile (forma delle campagne risolte) dal modello "raw" e dal seme
function generateProceduralCampaign(raw, seed) {
    const rng = procRng(seed);
    const pick = list => list[Math.floor(rng() * list.length)];
    const shuffle = list => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const camp = resolveCampaign({ ...raw, mapNodes: [], challenges: {}, merchants: {}, rests: {}, treasures: {} });
    const pools = procPools(raw.id);
    const cfg = raw.procedurale || {};
    const levels = Math.max(6, cfg.livelli || 16);
    const last = levels - 1;
    camp.enemies = {};
    camp.mapNodes = [];

    // Nemico per il livello: tra quelli adatti all'avanzamento, con le statistiche cresciute
    const usedEnemies = new Set();
    function enemyFor(role, level) {
        const p = level / last;
        const list = pools[role].length ? pools[role] : pools.normal;
        const center = Math.round(p * (list.length - 1));
        const span = Math.max(1, Math.round(list.length * 0.2));
        const candidates = list.slice(Math.max(0, center - span), center + span + 1);
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

    // Testi e immagini di mercanti, riposi e tesori: uno per nodo, pescati dalle altre campagne
    function textFor(kind, level) {
        const coll = { merchant: 'merchants', rest: 'rests', treasure: 'treasures' }[kind];
        const key = `${kind}_${level}_${Object.keys(camp[coll]).length}`;
        camp[coll][key] = pools.texts[kind].length ? pick(pools.texts[kind]) : '';
        return { key, image: pools.images[kind].length ? pick(pools.images[kind]) : '' };
    }

    // Quanti nodi per livello: 2-4, uno solo per il boss, due riposi prima del boss
    const counts = [];
    for (let l = 0; l < levels; l++) counts.push(l === last ? 1 : l === last - 1 ? 2 : l === 0 ? 2 + Math.floor(rng() * 2) : 2 + Math.floor(rng() * 3));

    // Tipi: primo livello solo scontri; elite dal quinto livello (almeno uno a 1/3 e a 2/3 del percorso);
    // mercante garantito circa ogni 4 livelli; riposi prima del boss
    const eliteLevels = [Math.round(last * 0.38), Math.round(last * 0.7)];
    const merchantLevels = [3, Math.round(last * 0.5), last - 3];
    function typeFor(level, idx) {
        if (level === last) return 'boss';
        if (level === last - 1) return 'rest';
        if (level === 0) return 'combat';
        if (idx === 0 && eliteLevels.includes(level)) return 'elite';
        if (idx === 1 && merchantLevels.includes(level)) return 'merchant';
        const r = rng();
        if (level >= 4 && r < 0.12) return 'elite';
        if (r < 0.52) return 'combat';
        if (r < 0.74) return 'challenge';
        if (r < 0.84) return 'merchant';
        if (r < 0.93) return 'rest';
        return 'treasure';
    }

    const LABEL = { combat: 'Scontro', elite: 'Scontro elite', challenge: 'Sfida', merchant: 'Mercante', rest: 'Riposo', treasure: 'Tesoro' };
    const ICON = { combat: '🗡️', elite: '👹', challenge: '❓', merchant: '🪙', rest: '⛺', treasure: '💎' };
    let nextId = 0;
    const byLevel = counts.map((count, level) => {
        const xs = Array.from({ length: count }, (_, i) => Math.round(count === 1 ? 400 : 140 + i * (520 / (count - 1)) + (rng() - 0.5) * 40));
        return xs.map((x, idx) => {
            let type = typeFor(level, idx);
            const node = { id: nextId++, level, x, type, title: '', icon: '', done: false, active: level === 0, next: [], image: '' };
            if (type === 'boss' || type === 'combat' || type === 'elite') {
                const e = enemyFor(type === 'combat' ? 'normal' : type, level);
                node.type = type === 'boss' ? 'combat' : type;
                node.enemy = e.id;
                node.image = e.image || '';
                node.title = type === 'boss' ? `Livello ${level + 1} - ${camp.enemies[e.id].name} (Boss)` : `Livello ${level + 1} - ${LABEL[type]}`;
                node.icon = ICON[node.type];
            } else if (type === 'challenge') {
                const ch = challengeFor(level);
                node.challengeId = ch.key;
                node.image = ch.image || '';
            } else {
                const t = textFor(type, level);
                node[{ merchant: 'merchantId', rest: 'restId', treasure: 'treasureId' }[type]] = t.key;
                node.image = t.image;
            }
            if (!node.title) node.title = `Livello ${level + 1} - ${LABEL[node.type]}`;
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
