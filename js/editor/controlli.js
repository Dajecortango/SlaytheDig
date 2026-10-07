/* ==========================================================================
   EDITOR: CONTROLLI AUTOMATICI
   Immagini e audio mancanti, effetti non validi, riferimenti rotti: validateCampaign e
   l'elenco dei problemi sotto le schede.
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

/* ---------- Controlli ---------- */
const imageStatus = new Map();  // percorso -> 'ok' | 'missing' | 'pending'

function checkImage(path) {
    if (!path || pendingAssets.has(path)) return 'ok';
    if (!imageStatus.has(path)) {
        imageStatus.set(path, 'pending');
        const img = new Image();
        img.onload = () => { imageStatus.set(path, 'ok'); renderIssues(); };
        img.onerror = () => { imageStatus.set(path, 'missing'); renderIssues(); };
        img.src = path;
    }
    return imageStatus.get(path);
}

// Come checkImage, per i file audio
function checkAudio(path) {
    if (!path || pendingAssets.has(path)) return 'ok';
    if (!imageStatus.has(path)) {
        imageStatus.set(path, 'pending');
        const audio = new Audio();
        audio.addEventListener('loadedmetadata', () => { imageStatus.set(path, 'ok'); renderIssues(); });
        audio.addEventListener('error', () => { imageStatus.set(path, 'missing'); renderIssues(); });
        audio.preload = 'metadata';
        audio.src = path;
    }
    return imageStatus.get(path);
}

function checkEffects(effects, where, issues, tab, sel) {
    if (effects == null) return;
    if (!Array.isArray(effects)) { issues.push({ level: 'error', msg: `${where}: "effects" deve essere un elenco`, tab, sel }); return; }
    effects.forEach(e => {
        const needed = EFFECT_TYPES[e && e.effect];
        if (!needed) issues.push({ level: 'error', msg: `${where}: effetto sconosciuto "${e && e.effect}"`, tab, sel });
        else needed.filter(p => e[p] === undefined).forEach(p => issues.push({ level: 'error', msg: `${where}: all'effetto "${e.effect}" manca "${p}"`, tab, sel }));
        if (e && e.effect === 'hero_set' && e.stat !== undefined && !HERO_FLAGS[e.stat]) {
            issues.push({ level: 'error', msg: `${where}: segnale "${esc(e.stat)}" sconosciuto al motore (noti: ${Object.keys(HERO_FLAGS).join(', ')})`, tab, sel });
        }
        if (e && e.effect === 'hero_item' && e.item !== undefined && !(LIBRERIA.armeria || {})[e.item]) {
            issues.push({ level: 'error', msg: `${where}: oggetto "${esc(e.item)}" non trovato nell'armeria`, tab, sel });
        }
    });
}

function validateCampaign() {
    const issues = [];
    const add = (level, msg, tab, sel) => issues.push({ level, msg, tab, sel });
    if (!camp.id || !/^[a-z0-9_]+$/.test(camp.id)) add('error', 'Id della campagna mancante o non valido', 'general');
    // Un id già usato da un'altra campagna: "Salva nel progetto" ne sovrascriverebbe il file
    else if (camp.id !== campaignOrigin && rawCampaigns()[camp.id]) add('error', `Id "${esc(camp.id)}" già usato dalla campagna "${esc(rawCampaigns()[camp.id].title || camp.id)}": salvando la sovrascriveresti`, 'general');
    if (!camp.title) add('warn', 'Titolo della campagna mancante', 'general');
    if (checkImage(camp.coverImage) === 'missing') add('warn', `Copertina non trovata: ${camp.coverImage}`, 'general');

    if (!camp.heroes.length) add('error', 'Nessun eroe nella campagna', 'heroes');
    camp.heroes.forEach(ref => {
        if (typeof ref === 'string' && !lib.eroi[ref]) add('error', `Eroe <b>${esc(ref)}</b> non trovato nella libreria Eroi`, 'heroes');
    });

    // Oggetti della campagna: devono esistere nell'armeria
    Object.entries(ITEM_LISTS).forEach(([listKey, label]) => {
        (camp[listKey] || []).forEach(ref => {
            if (typeof ref === 'string' && !lib.armeria[ref]) add('error', `${label}: oggetto <b>${esc(ref)}</b> non trovato nell'armeria`, 'items');
        });
    });
    if (!camp.initialArmory.length) add('warn', 'Armeria iniziale vuota: gli eroi partono senza oggetti da scegliere', 'items');

    Object.entries(camp.challenges).forEach(([k, c]) => {
        if (!['int', 'fth', 'str'].includes(c.stat)) add('error', `Sfida <b>${k}</b>: statistica non valida`, 'challenges', k);
        if (typeof c.cd !== 'number') add('error', `Sfida <b>${k}</b>: classe di difficoltà mancante`, 'challenges', k);
        ['desc', 'successText', 'failText', 'ignoreText'].forEach(f => { if (!c[f]) add('warn', `Sfida <b>${k}</b>: testo "${f}" vuoto`, 'challenges', k); });
        [['reward', 'reliquie', 'ricompensa'], ['punishment', 'maledizioni', 'punizione']].forEach(([field, kind, label]) => {
            const v = c[field];
            if (typeof v === 'string' && !lib[kind][v]) add('error', `Sfida <b>${k}</b>: ${label} "${esc(v)}" non trovata in ${LIB_LABELS[kind]}`, 'challenges', k);
            else if (v && typeof v === 'object') checkEffects(v.effects, `Sfida <b>${k}</b> (${label})`, issues, 'challenges', k);
        });
    });

    const nodes = camp.mapNodes;
    const ids = new Map();
    nodes.forEach(n => ids.set(n.id, (ids.get(n.id) || 0) + 1));
    const byId = new Map(nodes.map(n => [n.id, n]));
    const incoming = new Set(nodes.flatMap(n => n.next || []));
    // Campagna procedurale: la mappa si genera a ogni partita (js/procedurale.js), nel file è vuota
    const procedurale = !!camp.procedurale;
    if (!procedurale && !nodes.some(n => n.active)) add('error', 'Nessun nodo di partenza (spunta "Nodo di partenza")', 'map');
    nodes.forEach(n => {
        const name = `Nodo <b>${n.id}</b>`;
        if (ids.get(n.id) > 1) add('error', `${name}: id duplicato`, 'map', n.id);
        const type = NODE_TYPES[n.type];
        if (!type) add('error', `${name}: tipo "${n.type}" sconosciuto`, 'map', n.id);
        else if (type.ref === 'enemy' && !lib.bestiario[n.enemy] && !(camp.enemies && camp.enemies[n.enemy])) add('error', `${name}: nemico "${n.enemy || ''}" non trovato nel bestiario`, 'map', n.id);
        else if (type.ref === 'challengeId' && !camp.challenges[n.challengeId]) add('warn', `${name}: sfida "${n.challengeId || ''}" inesistente (il gioco userà una sfida vuota)`, 'map', n.id);
        else if (type.ref && ['treasureId', 'merchantId', 'restId', 'storyId'].includes(type.ref)) {
            const coll = { treasureId: 'treasures', merchantId: 'merchants', restId: 'rests', storyId: 'stories' }[type.ref];
            if ((camp[coll] || {})[n[type.ref]] == null && !(type.ref === 'merchantId' && camp.merchants.default)) add('warn', `${name}: testo "${n[type.ref]}" non trovato in ${coll} (verrà usato un testo generico)`, 'map', n.id);
            else if (type.ref === 'storyId' && !((camp.stories[n.storyId] || {}).text || '').trim()) add('warn', `${name}: la trama "${esc(n.storyId)}" non ha ancora una descrizione`, 'map', n.id);
        }
        (n.next || []).forEach(id => {
            const target = byId.get(id);
            if (!target) add('error', `${name}: collegamento a nodo inesistente ${id}`, 'map', n.id);
            else if (target.level <= n.level) add('warn', `${name}: collegamento a ${id} che non è a un livello successivo`, 'map', n.id);
        });
        if (!n.active && !incoming.has(n.id)) add('warn', `${name}: irraggiungibile (nessun nodo porta qui)`, 'map', n.id);
        if (checkImage(n.image) === 'missing') add('warn', `${name}: immagine non trovata ${n.image}`, 'map', n.id);
    });
    const maxLevel = Math.max(0, ...nodes.map(n => n.level));
    if (nodes.length && !nodes.some(n => n.level === maxLevel && (n.next || []).length === 0)) add('warn', 'Nessun nodo finale senza collegamenti all\'ultimo livello', 'map');

    // Libreria condivisa
    Object.entries(lib.bestiario).forEach(([k, e]) => {
        ['hp', 'maxHp', 'att', 'dmg', 'ca'].forEach(f => { if (typeof e[f] !== 'number') add('error', `Bestiario <b>${k}</b>: "${f}" non è un numero`, 'bestiario', k); });
        if (checkImage(e.image) === 'missing') add('warn', `Bestiario <b>${k}</b>: immagine non trovata ${esc(e.image)}`, 'bestiario', k);
        ['sfxAttack', 'sfxHit', 'sfxDeath'].forEach(f => { if (checkAudio(e[f]) === 'missing') add('warn', `Bestiario <b>${k}</b>: suono non trovato ${esc(e[f])}`, 'bestiario', k); });
        if (e.hp !== e.maxHp) add('warn', `Bestiario <b>${k}</b>: HP (${e.hp}) diversi da HP massimi (${e.maxHp})`, 'bestiario', k);
        if (!e.name) add('warn', `Bestiario <b>${k}</b>: nome mancante`, 'bestiario', k);
        if (e.fasi != null) {
            if (!Array.isArray(e.fasi)) add('error', `Bestiario <b>${k}</b>: "fasi" deve essere un elenco`, 'bestiario', k);
            else e.fasi.forEach((f, i) => {
                if (typeof f.soglia !== 'number') add('error', `Bestiario <b>${k}</b>: fase ${i + 1} senza "soglia" numerica`, 'bestiario', k);
                if (f.schema && !ENEMY_PHASE_SCHEMES.includes(f.schema)) add('error', `Bestiario <b>${k}</b>: fase ${i + 1}, schema "${esc(f.schema)}" sconosciuto (${ENEMY_PHASE_SCHEMES.join(', ')})`, 'bestiario', k);
                if (f.reazione && !ENEMY_PHASE_REACTIONS.includes(f.reazione)) add('error', `Bestiario <b>${k}</b>: fase ${i + 1}, reazione "${esc(f.reazione)}" sconosciuta (${ENEMY_PHASE_REACTIONS.join(', ')})`, 'bestiario', k);
            });
        }
    });
    Object.entries(lib.armeria).forEach(([k, it]) => {
        if (it.id !== k) add('error', `Armeria <b>${k}</b>: il campo id ("${esc(it.id)}") deve coincidere con la chiave`, 'armeria', k);
        if (it.scaling != null) {
            if (!Array.isArray(it.scaling)) add('error', `Armeria <b>${k}</b>: "scaling" deve essere un elenco`, 'armeria', k);
            else it.scaling.forEach(sc => {
                if (!['str', 'dmg', 'armor', 'def_bonus', 'def_armor', 'help_bonus_val'].includes(sc.stat)) add('error', `Armeria <b>${k}</b>: scaling con "stat" non valida (${esc(sc.stat)})`, 'armeria', k);
                if (!['fth', 'int'].includes(sc.per)) add('error', `Armeria <b>${k}</b>: scaling con "per" non valido (${esc(sc.per)}): usa fth o int`, 'armeria', k);
                if (!(sc.every >= 1)) add('error', `Armeria <b>${k}</b>: scaling con "every" mancante o minore di 1`, 'armeria', k);
            });
        }
        if (!it.name) add('warn', `Armeria <b>${k}</b>: nome mancante`, 'armeria', k);
    });
    (lib.lootPredefinito || []).forEach(id => { if (!lib.armeria[id]) add('error', `Bottino predefinito: "${esc(id)}" non trovato nell'armeria`, 'armeria'); });
    Object.entries(lib.reliquie).forEach(([k, r]) => {
        if (!r.name) add('warn', `Reliquia <b>${k}</b>: nome mancante`, 'reliquie', k);
        checkEffects(r.effects, `Reliquia <b>${k}</b>`, issues, 'reliquie', k);
    });
    const heroNames = new Map();
    Object.entries(lib.eroi).forEach(([k, h]) => {
        heroNames.set(h.name, (heroNames.get(h.name) || 0) + 1);
        const name = `Eroe <b>${esc(h.name)}</b>`;
        ['str', 'int', 'fth', 'maxHp', 'dmg'].forEach(f => { if (typeof h[f] !== 'number') add('error', `${name}: "${f}" non è un numero`, 'eroi', k); });
        if (!(h.abilities || []).length) add('warn', `${name}: nessuna abilità tra cui scegliere`, 'eroi', k);
        (h.abilities || []).forEach(a => {
            if (typeof a === 'string') { if (!lib.abilita[a]) add('error', `${name}: abilità "${esc(a)}" non trovata nella libreria Abilità`, 'eroi', k); }
            else if (a.effects) checkEffects(a.effects, `Abilità <b>${esc(a.name)}</b> di ${esc(h.name)}`, issues, 'eroi', k);
        });
        if (checkImage(h.portrait) === 'missing') add('warn', `${name}: ritratto non trovato ${esc(h.portrait)}`, 'eroi', k);
        if (checkImage(h.portraitWounded) === 'missing') add('warn', `${name}: ritratto da ferito non trovato ${esc(h.portraitWounded)}`, 'eroi', k);
    });
    heroNames.forEach((count, n) => { if (count > 1) add('error', `Più eroi della libreria si chiamano <b>${esc(n)}</b>`, 'eroi'); });
    Object.entries(lib.maledizioni).forEach(([k, c]) => {
        if (!c.name) add('warn', `Maledizione <b>${k}</b>: nome mancante`, 'maledizioni', k);
        checkEffects(c.effects, `Maledizione <b>${k}</b>`, issues, 'maledizioni', k);
    });
    Object.entries(lib.abilita).forEach(([k, a]) => {
        const name = `Abilità <b>${esc(a.name || k)}</b>`;
        if (!a.name) add('warn', `Abilità <b>${k}</b>: nome mancante`, 'abilita', k);
        if (!a.desc) add('warn', `${name}: descrizione mancante (il giocatore non sa cosa fa)`, 'abilita', k);
        if (a.isCombatActive && !(a.combat && typeof a.combat === 'object')) add('warn', `${name}: abilità attiva senza comportamento ("combat"), in combattimento non farà nulla`, 'abilita', k);
        if (isPassiveStat(a) && typeof a.val !== 'number') add('error', `${name}: "Bonus" non è un numero`, 'abilita', k);
        if (!a.isCombatActive) checkEffects(a.effects, name, issues, 'abilita', k);
        if (checkImage(a.icon) === 'missing') add('warn', `${name}: icona non trovata ${esc(a.icon)}`, 'abilita', k);
    });
    return issues;
}

function renderIssues() {
    if (!camp) return;
    const issues = validateCampaign().sort((a, b) => (a.level === 'error' ? 0 : 1) - (b.level === 'error' ? 0 : 1));
    const errors = issues.filter(i => i.level === 'error').length;
    document.getElementById('edIssueCount').textContent = issues.length ? `(${errors} errori, ${issues.length - errors} avvisi)` : '';
    const unsavedLib = libDirty.size ? `<p class="ed-lib-unsaved">Libreria modificata e non salvata: ${[...libDirty].map(k => LIB_LABELS[k]).join(', ')}</p>` : '';
    document.getElementById('edIssues').innerHTML = unsavedLib + (issues.length
        ? issues.map((i, idx) => `<div class="ed-issue ${i.level}" data-idx="${idx}">${i.msg}</div>`).join('')
        : '<p class="ed-ok">Nessun problema trovato.</p>');
    document.querySelectorAll('#edIssues .ed-issue').forEach(el => el.addEventListener('click', () => {
        const issue = issues[el.dataset.idx];
        if (issue.sel != null) {
            selection[issue.tab] = issue.sel;
        }
        switchTab(issue.tab);
    }));
}
