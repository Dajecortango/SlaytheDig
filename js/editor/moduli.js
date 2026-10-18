/* ==========================================================================
   EDITOR: MODULI GENERICI
   Percorsi con il punto (getPath / setPath), inquadratura dei ritratti trascinando
   l'anteprima, renderForm (tutti i tipi di campo, effetti, liste di riferimenti).
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

/* ---------- Moduli generici ---------- */
// I campi possono indicare un percorso con il punto (es. "combat.dice" = obj.combat.dice)
function getPath(obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function setPath(obj, path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((o, k) => (o[k] && typeof o[k] === 'object' ? o[k] : (o[k] = {})), obj);
    target[last] = value;
}
function deletePath(obj, path) {
    const keys = path.split('.');
    const last = keys.pop();
    const parents = [obj];
    for (const k of keys) {
        const next = parents[parents.length - 1][k];
        if (!next || typeof next !== 'object') return;
        parents.push(next);
    }
    delete parents[parents.length - 1][last];
    // Toglie gli oggetti rimasti vuoti (es. "combat": {})
    for (let i = keys.length - 1; i >= 0; i--) {
        if (Object.keys(parents[i + 1]).length) break;
        delete parents[i][keys[i]];
    }
}

// Valori predefiniti e zoom della cinematica: HERO_PORTRAIT_DEFAULTS e strikeZoomFor in js/comune.js
const parsePos = pos => (pos || HERO_PORTRAIT_DEFAULTS.pos).split(/\s+/).map(v => parseFloat(v)).map(v => (Number.isFinite(v) ? v : 50));
const round1 = v => Math.round(v * 10) / 10;

// Modulo "Inquadratura del ritratto": per il ritratto normale e per quello da ferito
// un'icona da trascinare, il cursore dello zoom e l'anteprima della cinematica d'attacco.
function portraitFrameEditor(hero, onChange) {
    const box = document.createElement('div');
    box.className = 'ed-portrait-frames';
    if (!hero.portrait) {
        box.innerHTML = '<p class="ed-help">Carica prima un ritratto.</p>';
        return box;
    }

    const variants = [{ label: 'Ritratto', src: 'portrait', pos: 'portraitPos', zoom: 'portraitZoom' }];
    if (hero.portraitWounded) variants.push({ label: 'Da ferito', src: 'portraitWounded', pos: 'portraitWoundedPos', zoom: 'portraitWoundedZoom', wounded: true });

    const current = v => {
        const pos = hero[v.pos] || (v.wounded && hero.portraitPos) || HERO_PORTRAIT_DEFAULTS.pos;
        const zoom = Number(hero[v.zoom]) || (v.wounded && Number(hero.portraitZoom)) || HERO_PORTRAIT_DEFAULTS.zoom;
        return { pos, zoom };
    };
    const strikeZoom = v => Number(hero.portraitStrikeZoom) || strikeZoomFor(current(v).zoom);

    const cards = variants.map(v => {
        const card = document.createElement('div');
        card.className = 'ed-portrait-card';
        card.innerHTML = `
            <strong>${esc(v.label)}</strong>
            <div class="ed-portrait-icon" title="Trascina per spostare l'inquadratura"><img alt="" draggable="false"></div>
            <label class="ed-portrait-zoom">Zoom <input type="range" min="1" max="3.5" step="0.05"><output></output></label>
            <div class="ed-portrait-strike" title="Anteprima della cinematica d'attacco"><img alt="" draggable="false"></div>
            <small class="ed-portrait-info"></small>
            <div class="ed-portrait-actions">
                ${v.wounded
                    ? '<button type="button" class="btn-small" data-act="same">Come il ritratto normale</button>'
                    : '<button type="button" class="btn-small" data-act="reset">Ripristina</button>'}
            </div>`;
        const icon = card.querySelector('.ed-portrait-icon img');
        const strike = card.querySelector('.ed-portrait-strike img');
        const range = card.querySelector('input[type=range]');
        const out = card.querySelector('output');
        const info = card.querySelector('.ed-portrait-info');
        icon.src = strike.src = assetUrl(hero[v.src]);

        const paint = () => {
            const { pos, zoom } = current(v);
            const sz = strikeZoom(v);
            Object.assign(icon.style, { objectPosition: pos, transformOrigin: pos, transform: `scale(${zoom})` });
            Object.assign(strike.style, { objectPosition: pos, transformOrigin: pos, transform: `scale(${sz})` });
            range.value = zoom;
            out.textContent = zoom.toFixed(2);
            info.textContent = `Centro ${pos} · zoom cinematica ${sz.toFixed(2)}${hero.portraitStrikeZoom ? '' : ' (automatico)'}`;
        };
        card.paint = paint;

        range.addEventListener('input', () => {
            hero[v.zoom] = Number(range.value);
            if (v.wounded && !hero[v.pos]) hero[v.pos] = current(v).pos;
            onChange(v.zoom);
            cards.forEach(c => c.paint());
        });

        // Trascinando verso destra l'immagine si sposta a destra: il centro inquadrato va a sinistra
        const frame = card.querySelector('.ed-portrait-icon');
        frame.addEventListener('pointerdown', e => {
            e.preventDefault();
            frame.setPointerCapture(e.pointerId);
            const start = { x: e.clientX, y: e.clientY, pos: parsePos(current(v).pos), zoom: current(v).zoom };
            const size = frame.getBoundingClientRect().width;
            const move = ev => {
                const x = Math.min(100, Math.max(0, start.pos[0] - (ev.clientX - start.x) / size * 100 / start.zoom));
                const y = Math.min(100, Math.max(0, start.pos[1] - (ev.clientY - start.y) / size * 100 / start.zoom));
                hero[v.pos] = `${round1(x)}% ${round1(y)}%`;
                if (v.wounded && !hero[v.zoom]) hero[v.zoom] = start.zoom;
                paint();
            };
            const up = () => {
                frame.removeEventListener('pointermove', move);
                frame.removeEventListener('pointerup', up);
                frame.removeEventListener('pointercancel', up);
                onChange(v.pos);
            };
            frame.addEventListener('pointermove', move);
            frame.addEventListener('pointerup', up);
            frame.addEventListener('pointercancel', up);
        });

        card.querySelector('.ed-portrait-actions').addEventListener('click', e => {
            const act = e.target.closest('button') && e.target.closest('button').dataset.act;
            if (!act) return;
            delete hero[v.pos];
            delete hero[v.zoom];
            if (act === 'reset' && !v.wounded) { hero.portraitPos = HERO_PORTRAIT_DEFAULTS.pos; hero.portraitZoom = HERO_PORTRAIT_DEFAULTS.zoom; }
            onChange(v.pos);
            cards.forEach(c => c.paint());
        });
        return card;
    });

    // Zoom della cinematica: automatico (calcolato dallo zoom dell'icona) oppure scelto a mano
    const strikeRow = document.createElement('label');
    strikeRow.className = 'ed-portrait-zoom ed-portrait-strike-zoom';
    strikeRow.innerHTML = `<input type="checkbox"> Zoom della cinematica scelto a mano <input type="range" min="1" max="3" step="0.05"><output></output>`;
    const [manual, strikeRange] = strikeRow.querySelectorAll('input');
    const strikeOut = strikeRow.querySelector('output');
    const paintStrike = () => {
        manual.checked = !!hero.portraitStrikeZoom;
        strikeRange.disabled = !manual.checked;
        strikeRange.value = strikeZoom(variants[0]);
        strikeOut.textContent = Number(strikeRange.value).toFixed(2);
    };
    manual.addEventListener('change', () => {
        if (manual.checked) hero.portraitStrikeZoom = strikeZoom(variants[0]);
        else delete hero.portraitStrikeZoom;
        onChange('portraitStrikeZoom');
        paintStrike();
        cards.forEach(c => c.paint());
    });
    strikeRange.addEventListener('input', () => {
        hero.portraitStrikeZoom = Number(strikeRange.value);
        onChange('portraitStrikeZoom');
        paintStrike();
        cards.forEach(c => c.paint());
    });

    box.append(...cards, strikeRow);
    cards.forEach(c => c.paint());
    paintStrike();
    return box;
}

/* ---------- Effetti speciali "quando → fai" ----------
   Un riquadro per effetto: quando scatta e cosa fa (solo le azioni che hanno senso in quel momento),
   i campi dell'azione, poi condizione, round, probabilità e limite. Sotto, la riga che leggerà il giocatore.
   f.vocab sceglie il vocabolario: "eroe" (oggetti, reliquie, maledizioni, passive, benedizioni: SPECIALI_* in
   js/comune.js), "abilita" (effetti delle attive: quando la usa / se colpisce / se manca), "nemico" (bestiario e
   azioni degli elite: NEMICO_*). f.k può essere un percorso (es. "combat.effetti"). Vuoto = campo assente.
   "Aggiungi da un modello" mette un effetto già pronto (SPECIALI_MODELLI), da ritoccare. */
const SPECIALI_MODELLI = {
    eroe: {
        'Spine: chi lo colpisce subisce 1 danno': { quando: 'dopo_colpito', fai: 'danni', val: 1 },
        'Vendetta: se perde HP, 2 danni al nemico': { quando: 'perde_hp', fai: 'danni', val: 2 },
        'Vampiro: 50% di curare 1 HP a ogni colpo': { quando: 'colpo', prob: 50, fai: 'cura', val: 1 },
        'Primo sangue: +2 danni al primo colpo': { quando: 'colpo', fai: 'danni', val: 2, limite: 'scontro' },
        'Boia: +2 danni col nemico a metà vita': { quando: 'colpo', se: 'nemico_meta', fai: 'danni', val: 2 },
        'Stordimento: il primo colpo stordisce': { quando: 'colpo', fai: 'stordisci', limite: 'scontro' },
        'Ultimo baluardo: +2 armatura da ferito': { quando: 'dopo_colpito', se: 'ferito', fai: 'armatura', val: 2, limite: 'scontro' },
        'Seconda vita: resta a 1 HP (una volta per capitolo)': { quando: 'colpo_mortale', fai: 'rialza', val: 1, limite: 'capitolo' },
        'Corno: +1 al tiro a tutti nel primo round': { quando: 'inizio_scontro', fai: 'potenzia', stat: 'att_bonus', val: 1, durata: 1, bersaglio: 'compagnia' },
        'Rigenerazione: +1 HP a inizio round': { quando: 'inizio_round', fai: 'cura', val: 1 },
        'Fortuna: +1 a ogni tiro di dado': { quando: 'tiro', fai: 'bonus_tiro', val: 1 },
        'Taglia: +5 Scudi a ogni nemico sconfitto': { quando: 'nemico_sconfitto', fai: 'monete', val: 5 },
        'Avido: +3 Scudi dopo ogni scontro': { quando: 'fine_scontro', fai: 'monete', val: 3 },
        'Amico dei mercanti: -10% sui prezzi': { quando: 'mercante', fai: 'sconto_percento', val: 10 },
        'Riposo profondo: +1 HP al riposo': { quando: 'riposo', fai: 'bonus_cura', val: 1 },
        "Purezza: a inizio round toglie gli stati all'eroe": { quando: 'inizio_round', fai: 'purifica' }
    },
    abilita: {
        'Se colpisce, cura 1 HP a tutta la compagnia': { quando: 'colpo', fai: 'cura', val: 1, bersaglio: 'compagnia' },
        'Se colpisce, stordisce il nemico': { quando: 'colpo', fai: 'stordisci' },
        'Quando la usa, +2 armatura all\'eroe con meno HP': { quando: 'uso', fai: 'armatura', val: 2, bersaglio: 'meno_hp' },
        'Quando la usa, +1 Forza a tutti per 2 round': { quando: 'uso', fai: 'potenzia', stat: 'str', val: 1, durata: 2, bersaglio: 'compagnia' },
        'Se manca, l\'eroe si cura di 1 HP': { quando: 'mancato', fai: 'cura', val: 1 }
    },
    nemico: {
        'Spine: chi lo colpisce subisce 1 danno': { quando: 'colpito', fai: 'danni', val: 1 },
        'Rigenera 1 HP a inizio round': { quando: 'inizio_round', fai: 'cura', val: 1 },
        'Veleno: chi viene colpito perde 1 HP per 3 round': { quando: 'colpisce', fai: 'veleno', val: 1, durata: 3 },
        'Urlo: -1 al tiro a tutti per 2 round all\'inizio': { quando: 'inizio_scontro', fai: 'malus', val: 1, durata: 2, bersaglio: 'tutti' },
        'Ladro: ruba 5 Scudi quando colpisce': { quando: 'colpisce', fai: 'ruba_scudi', val: 5 },
        'Furia: +1 danno quando scende a metà vita': { quando: 'colpito', se: 'sotto_meta', fai: 'potenzia', stat: 'dmg', val: 1, limite: 'scontro' },
        'Esplosione alla soglia: 2 danni a tutti': { quando: 'soglia', fai: 'danni', val: 2, bersaglio: 'tutti' },
        "Silenzio: chi lo colpisce perde l'abilità per 2 round": { quando: 'colpito', fai: 'silenzia', durata: 2 },
        'Urlo di guerra: tutti in furia per 2 round alla soglia': { quando: 'soglia', fai: 'infuria', durata: 2, bersaglio: 'tutti' }
    }
};

function specialiVocab(vocab) {
    if (vocab === 'nemico') return {
        quando: NEMICO_QUANDO, fai: NEMICO_FAI, faiFor: () => NEMICO_FAI, se: NEMICO_SE, bersagli: NEMICO_BERSAGLI,
        limiti: { scontro: 'Per scontro' }, rompe: false, testo: s => nemicoTesto(s), nuovo: { quando: 'colpito', fai: 'danni', val: 1 }
    };
    const quando = vocab === 'abilita' ? SPECIALI_QUANDO_ABILITA : SPECIALI_QUANDO;
    return {
        quando, fai: SPECIALI_FAI, se: SPECIALI_SE, bersagli: SPECIALI_BERSAGLI,
        faiFor: q => Object.fromEntries(Object.entries(SPECIALI_FAI).filter(([, d]) => d.quando.includes(q))),
        limiti: vocab === 'abilita' ? {} : { scontro: 'Per scontro', capitolo: 'Per capitolo' }, rompe: vocab !== 'abilita',
        testo: (s, tipo) => specialeTesto(s, tipo), nuovo: vocab === 'abilita' ? { quando: 'colpo', fai: 'danni', val: 1 } : { quando: 'colpo', fai: 'danni', val: 1 }
    };
}

function specialiEditor(obj, f, onChange) {
    const V = specialiVocab(f.vocab || 'eroe');
    const box = document.createElement('div');
    box.className = 'ed-specials';
    // Il campo nasce solo quando si aggiunge il primo effetto: aprire un elemento non cambia i suoi dati
    const list = () => { const l = getPath(obj, f.k); return Array.isArray(l) ? l : []; };
    const ensure = () => { let l = getPath(obj, f.k); if (!Array.isArray(l)) { l = []; setPath(obj, f.k, l); } return l; };
    const save = () => { if (!list().length) deletePath(obj, f.k); onChange(f.k); };
    const opts = (map, value, empty) => (empty ? `<option value="">${esc(empty)}</option>` : '') + Object.entries(map)
        .map(([k, l]) => `<option value="${esc(k)}" ${k === value ? 'selected' : ''}>${esc(typeof l === 'string' ? l : l.label)}</option>`).join('');
    const num = (k, label, s, extra = '') => `<label>${esc(label)}<input type="number" data-k="${k}" value="${s[k] ?? ''}" ${extra}></label>`;

    const paint = () => {
        box.innerHTML = '';
        list().forEach((s, i) => {
            const fai = V.faiFor(s.quando);
            if (!fai[s.fai]) s.fai = Object.keys(fai)[0];
            const campi = (V.fai[s.fai] || {}).campi || [];
            const card = document.createElement('div');
            card.className = 'ed-special';
            card.innerHTML = `
                <div class="ed-special-row">
                    <label>Quando<select data-k="quando">${opts(V.quando, s.quando)}</select></label>
                    <label>Fai<select data-k="fai">${opts(fai, s.fai)}</select></label>
                    ${campi.includes('val') ? num('val', 'Valore', s) : ''}
                    ${campi.includes('stat') ? `<label>Statistica<select data-k="stat">${opts(SPECIALI_STAT, s.stat)}</select></label>` : ''}
                    ${campi.includes('stat_nemico') ? `<label>Statistica del nemico<select data-k="stat">${opts(SPECIALI_STAT_NEMICO, s.stat)}</select></label>` : ''}
                    ${campi.includes('durata') ? num('durata', 'Round (vuoto = tutto lo scontro)', s, 'min="1"') : ''}
                    ${campi.includes('bersaglio') ? `<label>A chi<select data-k="bersaglio">${opts(V.bersagli, s.bersaglio || 'eroe')}</select></label>` : ''}
                    ${campi.includes('item') ? `<label>Oggetto<select data-k="item">${opts({ ...Object.fromEntries(Object.entries(lib.armeria || {}).map(([k, v]) => [k, v.name || k])),
                        ...(s.item && !(lib.armeria || {})[s.item] ? { [s.item]: `${s.item} (non trovato)` } : {}) }, s.item)}</select></label>` : ''}
                </div>
                <div class="ed-special-row">
                    <label>Condizione<select data-k="se">${opts(V.se, s.se, 'Sempre')}</select></label>
                    ${num('round', 'Solo nel round', s, 'min="1"')}
                    ${num('prob', 'Probabilità %', s, 'min="1" max="100"')}
                    ${Object.keys(V.limiti).length ? `<label>Limite<select data-k="limite">${opts(V.limiti, s.limite, 'Nessuno')}</select></label>` : ''}
                    ${s.limite ? num('volte', 'Volte', s, 'min="1"') : ''}
                    ${V.rompe ? `<label class="ed-special-check"><input type="checkbox" data-k="rompe" ${s.rompe ? 'checked' : ''}>Poi si esaurisce</label>` : ''}
                    <button type="button" class="btn-small ed-danger" data-act="del">Togli</button>
                </div>
                <div class="ed-special-text"></div>`;
            const text = card.querySelector('.ed-special-text');
            const refresh = () => { text.textContent = V.testo(s, f.tipo); };
            refresh();
            card.addEventListener('change', e => {
                const el = e.target, k = el.dataset.k;
                if (!k) return;
                if (el.type === 'checkbox') { if (el.checked) s[k] = true; else delete s[k]; }
                else if (el.type === 'number') { if (el.value === '') delete s[k]; else s[k] = Number(el.value); }
                else if (el.value === '' || (k === 'bersaglio' && el.value === 'eroe')) delete s[k];
                else s[k] = el.value;
                // Campi che non servono più all'azione nuova (es. statistica dopo aver scelto "Cura")
                if (k === 'quando' || k === 'fai') {
                    const now = V.faiFor(s.quando);
                    if (!now[s.fai]) s.fai = Object.keys(now)[0];
                    const keep = (V.fai[s.fai] || {}).campi || [];
                    if (!keep.includes('val')) delete s.val;
                    if (!keep.includes('stat') && !keep.includes('stat_nemico')) delete s.stat;
                    if (keep.includes('stat_nemico') && !SPECIALI_STAT_NEMICO[s.stat]) s.stat = 'att';
                    if (keep.includes('stat') && !SPECIALI_STAT[s.stat]) s.stat = 'str';
                    if (!keep.includes('durata')) delete s.durata;
                    if (!keep.includes('bersaglio')) delete s.bersaglio;
                    if (!keep.includes('item')) delete s.item;
                    else if (!s.item) s.item = Object.keys(lib.armeria || {})[0];
                }
                if (k === 'limite' && !s.limite) delete s.volte;
                save();
                if (['quando', 'fai', 'limite'].includes(k)) paint(); else refresh();
            });
            card.querySelector('[data-act="del"]').addEventListener('click', () => { list().splice(i, 1); save(); paint(); });
            box.appendChild(card);
        });
        const row = document.createElement('div');
        row.className = 'ed-special-row';
        const modelli = SPECIALI_MODELLI[f.vocab || 'eroe'] || {};
        row.innerHTML = `<button type="button" class="btn-small" data-act="add">Aggiungi un effetto</button>
            <select data-act="model"><option value="">Aggiungi da un modello…</option>${Object.keys(modelli).map(k => `<option value="${esc(k)}">${esc(k)}</option>`).join('')}</select>`;
        row.querySelector('[data-act="add"]').addEventListener('click', () => { ensure().push({ ...V.nuovo }); save(); paint(); });
        row.querySelector('[data-act="model"]').addEventListener('change', e => {
            if (!e.target.value) return;
            ensure().push(JSON.parse(JSON.stringify(modelli[e.target.value])));
            save(); paint();
        });
        box.appendChild(row);
    };
    paint();
    return box;
}

/* ---------- Effetti di applyEffects composti con i menu ----------
   Un riga per effetto: tipo (EFFECT_LABELS in js/comune.js) e solo i campi che servono (EFFECT_TYPES).
   list = l'elenco da modificare (si cambia sul posto), save = da chiamare a ogni modifica. */
function effectListEditor(list, save, nuovo = { effect: 'coins', val: 10 }) {
    const box = document.createElement('div');
    box.className = 'ed-specials';
    const opts = (map, value) => Object.entries(map).map(([k, l]) => `<option value="${esc(k)}" ${k === value ? 'selected' : ''}>${esc(l)}</option>`).join('');
    const libOpts = (kind, value) => opts({ ...Object.fromEntries(Object.entries(lib[kind] || {}).map(([k, v]) => [k, v.name || k])),
        ...(value && !(lib[kind] || {})[value] ? { [value]: `${value} (non trovato)` } : {}) }, value);
    const paint = () => {
        box.innerHTML = '';
        list.forEach((e, i) => {
            const need = EFFECT_TYPES[e.effect] || [];
            const row = document.createElement('div');
            row.className = 'ed-special-row ed-special';
            row.innerHTML = `<label>Effetto<select data-k="effect">${opts(EFFECT_LABELS, e.effect)}</select></label>
                ${need.includes('stat') && e.effect !== 'hero_set' ? `<label>Statistica<select data-k="stat">${opts(EFFECT_STATS, e.stat)}</select></label>` : ''}
                ${need.includes('stat') && e.effect === 'hero_set' ? `<label>Segnale<select data-k="stat">${opts(HERO_FLAGS, e.stat)}</select></label>` : ''}
                ${need.includes('val') ? `<label>Valore<input type="number" data-k="val" value="${e.val ?? ''}"></label>` : ''}
                ${need.includes('text') ? `<label>Testo<input type="text" data-k="text" value="${esc(e.text || '')}"></label>` : ''}
                ${need.includes('item') ? `<label>Oggetto<select data-k="item">${libOpts('armeria', e.item)}</select></label>` : ''}
                ${e.effect === 'relic' ? `<label>Reliquia<select data-k="id">${libOpts('reliquie', e.id)}</select></label>` : ''}
                ${e.effect === 'curse' ? `<label>Maledizione<select data-k="id">${libOpts('maledizioni', e.id)}</select></label>` : ''}
                <button type="button" class="btn-small ed-danger" data-act="del">Togli</button>`;
            row.addEventListener('change', ev => {
                const k = ev.target.dataset.k;
                if (!k) return;
                e[k] = ev.target.type === 'number' ? Number(ev.target.value) : ev.target.value;
                if (k === 'effect') {
                    // Solo i campi del tipo nuovo, con un valore di partenza
                    Object.keys(e).filter(x => x !== 'effect').forEach(x => delete e[x]);
                    const n = EFFECT_TYPES[e.effect] || [];
                    if (n.includes('val')) e.val = 1;
                    if (n.includes('stat')) e.stat = e.effect === 'hero_set' ? Object.keys(HERO_FLAGS)[0] : 'str';
                    if (n.includes('text')) e.text = 'Nuova maledizione';
                    if (n.includes('item')) e.item = Object.keys(lib.armeria || {})[0];
                    if (e.effect === 'relic') e.id = Object.keys(lib.reliquie || {})[0];
                    if (e.effect === 'curse') e.id = Object.keys(lib.maledizioni || {})[0];
                    save(); paint(); return;
                }
                save();
            });
            row.querySelector('[data-act="del"]').addEventListener('click', () => { list.splice(i, 1); save(); paint(); });
            box.appendChild(row);
        });
        const add = document.createElement('button');
        add.type = 'button';
        add.className = 'btn-small';
        add.textContent = 'Aggiungi un effetto';
        add.addEventListener('click', () => { list.push({ ...nuovo }); save(); paint(); });
        box.appendChild(add);
    };
    paint();
    return box;
}

// Strade di una sfida: [{ testo, stat, cd, successText, failText, reward, punishment }] (challengeWithRoad in js/prove.js).
// Premio e punizione: id della libreria, o vuoto = quelli della sfida
function roadListEditor(obj, f, onChange) {
    const box = document.createElement('div');
    box.className = 'ed-specials';
    const list = () => (Array.isArray(obj[f.k]) ? obj[f.k] : []);
    const ensure = () => (Array.isArray(obj[f.k]) ? obj[f.k] : (obj[f.k] = []));
    const save = () => { if (!list().length) delete obj[f.k]; onChange(f.k); };
    const libSelect = (k, kind, value) => `<select data-k="${k}"><option value="">Come la sfida</option>${Object.entries(lib[kind] || {})
        .map(([id, v]) => `<option value="${esc(id)}" ${id === value ? 'selected' : ''}>${esc(v.name || id)}</option>`).join('')}</select>`;
    const paint = () => {
        box.innerHTML = '';
        list().forEach((r, i) => {
            const card = document.createElement('div');
            card.className = 'ed-special';
            card.innerHTML = `
                <div class="ed-special-row">
                    <label class="ed-grow">Testo del pulsante<input type="text" data-k="testo" value="${esc(r.testo || '')}"></label>
                    <label>Statistica<select data-k="stat">${Object.entries(STAT_LABELS).map(([k, l]) => `<option value="${k}" ${k === r.stat ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
                    <label>CD<input type="number" data-k="cd" min="1" value="${r.cd ?? ''}"></label>
                    <label>Malus al tiro<input type="number" data-k="malus" min="0" value="${r.malus ?? ''}" placeholder="${obj.malus || 0}"></label>
                    <button type="button" class="btn-small ed-danger" data-act="del">Togli</button>
                </div>
                <div class="ed-choice-part"><b>Prezzo pagato subito scegliendo questo modo</b> <small>(facoltativo: es. Scudi, danni a tutti, una maledizione)</small></div>
                <div class="ed-special-row">
                    <label>Premio${libSelect('reward', 'reliquie', typeof r.reward === 'string' ? r.reward : '')}</label>
                    <label>Punizione${libSelect('punishment', 'maledizioni', typeof r.punishment === 'string' ? r.punishment : '')}</label>
                </div>
                <label class="ed-choice-text">Testo di successo (vuoto = quello della sfida)<textarea data-k="successText">${esc(r.successText || '')}</textarea></label>
                <label class="ed-choice-text">Testo di fallimento (vuoto = quello della sfida)<textarea data-k="failText">${esc(r.failText || '')}</textarea></label>`;
            // Prezzo: elenco di effetti con i menu (come gli effetti degli eventi), dopo la riga del titolo
            const prezzo = r.prezzo || [];
            card.querySelector('.ed-choice-part').after(effectListEditor(prezzo, () => { if (prezzo.length) r.prezzo = prezzo; else delete r.prezzo; save(); }, { effect: 'coins', val: -10 }));
            card.addEventListener('change', ev => {
                const k = ev.target.dataset.k;
                if (!k || ev.target.closest('.ed-special') !== card) return;
                if (ev.target.type === 'number') { if (ev.target.value === '') delete r[k]; else r[k] = Number(ev.target.value); }
                else if (ev.target.value === '') delete r[k];
                else r[k] = ev.target.value;
                save();
            });
            card.querySelector('[data-act="del"]').addEventListener('click', () => { list().splice(i, 1); save(); paint(); });
            box.appendChild(card);
        });
        const add = document.createElement('button');
        add.type = 'button';
        add.className = 'btn-small';
        add.textContent = 'Aggiungi un modo di affrontarla';
        add.addEventListener('click', () => { ensure().push({ testo: 'Nuovo modo', stat: obj.stat || 'str', cd: obj.cd || 7 }); save(); paint(); });
        box.appendChild(add);
    };
    paint();
    return box;
}

// Scelte di un evento: [{ testo, costo, stat, cd, effetti, esito, fallimento: { effetti, esito } }] (js/prove.js)
function choiceListEditor(obj, f, onChange) {
    const box = document.createElement('div');
    box.className = 'ed-specials';
    const list = () => (Array.isArray(obj[f.k]) ? obj[f.k] : []);
    const ensure = () => (Array.isArray(obj[f.k]) ? obj[f.k] : (obj[f.k] = []));
    const save = () => { if (!list().length) delete obj[f.k]; onChange(f.k); };
    const paint = () => {
        box.innerHTML = '';
        list().forEach((c, i) => {
            const card = document.createElement('div');
            card.className = 'ed-special';
            card.innerHTML = `
                <div class="ed-special-row">
                    <label class="ed-grow">Testo del pulsante<input type="text" data-k="testo" value="${esc(c.testo || '')}"></label>
                    <label>Costo in Scudi<input type="number" data-k="costo" min="0" value="${c.costo ?? ''}"></label>
                    <label>Prova<select data-k="stat"><option value="">Nessuna</option>${Object.entries(STAT_LABELS).map(([k, l]) => `<option value="${k}" ${k === c.stat ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
                    ${c.stat ? `<label>CD<input type="number" data-k="cd" min="1" value="${c.cd ?? ''}"></label>` : ''}
                    <button type="button" class="btn-small ed-danger" data-act="del">Togli</button>
                </div>
                <div class="ed-choice-part"><b>${c.stat ? 'Se riesce' : 'Effetti'}</b></div>
                <label class="ed-choice-text">Esito (testo mostrato dopo la scelta)<textarea data-k="esito">${esc(c.esito || '')}</textarea></label>
                ${c.stat ? `<div class="ed-choice-part"><b>Se fallisce</b></div>
                <label class="ed-choice-text">Esito del fallimento<textarea data-k="esito_f">${esc((c.fallimento || {}).esito || '')}</textarea></label>` : ''}`;
            // Elenchi degli effetti: dopo la riga "Se riesce" e dopo "Se fallisce"
            const parts = card.querySelectorAll('.ed-choice-part');
            c.effetti = c.effetti || [];
            parts[0].after(effectListEditor(c.effetti, save));
            if (c.stat) {
                c.fallimento = c.fallimento || { effetti: [] };
                c.fallimento.effetti = c.fallimento.effetti || [];
                parts[1].after(effectListEditor(c.fallimento.effetti, save));
            }
            card.addEventListener('change', ev => {
                const k = ev.target.dataset.k;
                if (!k || ev.target.closest('.ed-specials') !== box && ev.target.closest('.ed-special') !== card) return;
                if (k === 'esito_f') { (c.fallimento = c.fallimento || { effetti: [] }).esito = ev.target.value; save(); return; }
                if (ev.target.type === 'number') { if (ev.target.value === '') delete c[k]; else c[k] = Number(ev.target.value); }
                else if (ev.target.value === '') delete c[k];
                else c[k] = ev.target.value;
                if (k === 'stat') {
                    if (!c.stat) { delete c.cd; delete c.fallimento; } else c.cd = c.cd || 7;
                    save(); paint(); return;
                }
                save();
            });
            card.querySelector('[data-act="del"]').addEventListener('click', () => { list().splice(i, 1); save(); paint(); });
            box.appendChild(card);
        });
        const add = document.createElement('button');
        add.type = 'button';
        add.className = 'btn-small';
        add.textContent = 'Aggiungi una scelta';
        add.addEventListener('click', () => { ensure().push({ testo: 'Nuova scelta', effetti: [], esito: '' }); save(); paint(); });
        box.appendChild(add);
    };
    paint();
    return box;
}

// Potenziamenti [{ buff_stat, buff_val }] (benedizioni "al prossimo scontro"): statistiche come le pozioni
const BUFF_LIST_STATS = { att_bonus: 'Tiro per colpire', dmg: 'Danno', str: 'Forza', def_bonus: 'Difesa', help_bonus_val: 'Aiuto',
    current_armor: 'Armatura (subito)', regen: 'HP a inizio round' };
function buffListEditor(obj, f, onChange) {
    const box = document.createElement('div');
    box.className = 'ed-specials';
    const list = () => (Array.isArray(obj[f.k]) ? obj[f.k] : []);
    const ensure = () => (Array.isArray(obj[f.k]) ? obj[f.k] : (obj[f.k] = []));
    const paint = () => {
        box.innerHTML = '';
        list().forEach((b, i) => {
            const row = document.createElement('div');
            row.className = 'ed-special-row ed-special';
            row.innerHTML = `<label>Statistica<select>${Object.entries(BUFF_LIST_STATS).map(([k, l]) => `<option value="${k}" ${k === b.buff_stat ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
                <label>Valore<input type="number" value="${b.buff_val ?? 1}"></label>
                <button type="button" class="btn-small ed-danger">Togli</button>`;
            row.querySelector('select').addEventListener('change', e => { b.buff_stat = e.target.value; onChange(f.k); });
            row.querySelector('input').addEventListener('change', e => { b.buff_val = Number(e.target.value) || 0; onChange(f.k); });
            row.querySelector('button').addEventListener('click', () => { list().splice(i, 1); onChange(f.k); paint(); });
            box.appendChild(row);
        });
        const add = document.createElement('button');
        add.type = 'button';
        add.className = 'btn-small';
        add.textContent = 'Aggiungi un potenziamento';
        add.addEventListener('click', () => { ensure().push({ buff_stat: 'att_bonus', buff_val: 1 }); onChange(f.k); paint(); });
        box.appendChild(add);
    };
    paint();
    return box;
}

// Campi da mostrare: quelli che valgono per questo elemento (showIf) e, con Avanzate spente, non avanzati
function visibleFields(fields, obj, advanced = document.body.classList.contains('ed-advanced')) {
    return fields.filter(f => (!f.showIf || f.showIf(obj)) && (advanced || !f.avanzato));
}

/* ---------- Avvisi sui numeri ----------
   Un valore fuori da quanto c'è già nella libreria (stesso ruolo per i nemici: normali / elite e boss;
   stessa rarità e stesso genere per gli oggetti) dà una riga gialla sotto il campo. Non blocca niente. */
const enemyRole = e => Array.isArray(e.fasi) && e.fasi.length ? 'elite' : 'normale';
function numberRangeWarning(kind, key, obj) {
    const v = obj[key];
    if (typeof v !== 'number' || !v) return '';
    let peers, chi;
    if (kind === 'bestiario') {
        const role = enemyRole(obj);
        peers = Object.values(lib.bestiario || {}).filter(e => e !== obj && enemyRole(e) === role);
        chi = role === 'elite' ? 'gli elite e i boss del gioco' : 'i nemici normali del gioco';
    } else {
        const r = obj.rarity || 'comune';
        const cons = (obj.type || '').startsWith('consumable');
        const same = Object.values(lib.armeria || {}).filter(it => it !== obj && (it.type || '').startsWith('consumable') === cons);
        peers = same.filter(it => (it.rarity || 'comune') === r);
        chi = `gli oggetti ${(RARITY_LABELS[r] || r).toLowerCase()} del gioco`;
        // Pochi oggetti di quella rarità con questo bonus: si confronta con tutti
        if (peers.filter(x => x[key] > 0).length < 3) { peers = same; chi = 'gli oggetti del gioco'; }
    }
    const vals = peers.map(x => x[key]).filter(x => typeof x === 'number' && x > 0);
    if (vals.length < 3) return '';
    const min = Math.min(...vals), max = Math.max(...vals);
    return v < min || v > max ? `Fuori dal solito: ${chi} hanno da ${min} a ${max}` : '';
}

/* ---------- "Crea nuovo…" da un menu ----------
   Dal menu del nemico di un nodo (o della reliquia / maledizione di una prova) si crea l'elemento nella
   libreria; appena creato è già scelto lì, e un riquadro riporta indietro quando si è finito di sistemarlo. */
let pendingPick = null;   // { kind, obj, key, tab, label, done }
function startCreateFor(kind, obj, key, label) {
    pendingPick = { kind, obj, key, tab: currentTab, label, done: false };
    switchTab(kind);
    if (COLLECTIONS[kind].wizard) { wizardOpen = kind; render(); } else addKeyed(kind);
}
function finishPendingPick(kind, newKey) {
    if (!pendingPick || pendingPick.done || pendingPick.kind !== kind) return;
    pendingPick.obj[pendingPick.key] = newKey;
    pendingPick.done = true;
    pendingPick.newKey = newKey;
    markDirty();
}
function returnFromPick() {
    const tab = pendingPick ? pendingPick.tab : 'general';
    pendingPick = null;
    switchTab(tab);
}
const pickBannerHtml = (kind, key) => pendingPick && pendingPick.done && pendingPick.kind === kind && pendingPick.newKey === key
    ? `<p class="ed-pick-banner">Fatto: è già scelto in ${esc(pendingPick.label)}. Sistemalo qui e poi <button type="button" class="btn-small ed-save" ${azione('returnFromPick')}>Torna indietro</button></p>`
    : '';

/* ---------- Menu lunghi: ordine alfabetico e casella di ricerca ----------
   ordinaOpzioni mette le voci [valore, testo] in ordine alfabetico; "— Nessuna —" (valore vuoto) resta in cima,
   "+ Crea nuova…" e "Personalizzata…" in fondo. menuCercabile aggiunge sopra il menu una casella "Cerca…"
   quando le voci sono più di MENU_CERCA_DA: scrivendo, il menu si apre come elenco con solo le voci che
   contengono il testo (senza maiuscole né accenti); un clic su una voce la sceglie come prima. */
const MENU_CERCA_DA = 8;
const MENU_VOCI_FISSE = ['', '__new', '__custom'];
function ordinaOpzioni(opts) {
    const testa = opts.filter(([v]) => v === '');
    const coda = opts.filter(([v]) => v === '__new' || v === '__custom');
    const resto = opts.filter(([v]) => !MENU_VOCI_FISSE.includes(v))
        .sort((a, b) => String(a[1]).localeCompare(String(b[1]), 'it', { sensitivity: 'base' }));
    return [...testa, ...resto, ...coda];
}
// Voci del menu che contengono il testo cercato (le voci fisse restano sempre)
function opzioniTrovate(opts, testo) {
    const q = searchText(testo);
    return opts.filter(([v, l]) => !q || MENU_VOCI_FISSE.includes(v) || searchText(l).includes(q));
}
function menuCercabile(select) {
    const voci = [...select.options].filter(o => !MENU_VOCI_FISSE.includes(o.value));
    if (voci.length <= MENU_CERCA_DA) return select;
    const box = document.createElement('div');
    box.className = 'ed-menu-cercabile';
    const cerca = document.createElement('input');
    cerca.type = 'search';
    cerca.className = 'ed-menu-cerca';
    cerca.placeholder = `Cerca fra ${voci.length}…`;
    const conta = document.createElement('span');
    conta.className = 'ed-menu-conta';
    cerca.addEventListener('input', () => {
        const q = searchText(cerca.value);
        let visibili = 0, trovati = 0;
        [...select.options].forEach(o => {
            const fissa = MENU_VOCI_FISSE.includes(o.value);
            o.hidden = !!q && !fissa && !searchText(o.textContent).includes(q);
            if (!o.hidden) { visibili++; if (!fissa) trovati++; }
        });
        // Con un testo cercato il menu resta aperto come elenco: le voci trovate si vedono subito
        select.size = q ? Math.max(2, Math.min(8, visibili)) : 0;
        select.classList.toggle('ed-menu-aperto', !!q);
        conta.textContent = q ? (trovati ? `${trovati} ${trovati === 1 ? 'trovato' : 'trovati'}` : 'Nessuno trovato') : '';
    });
    cerca.addEventListener('keydown', e => { if (e.key === 'Escape') { cerca.value = ''; cerca.dispatchEvent(new Event('input')); } });
    box.append(cerca, conta, select);
    return box;
}

/* ---------- Numeri: pulsanti − e + accanto alla casella ----------
   Ogni clic cambia di 1 e manda lo stesso evento "input" della tastiera (salvataggio, avvisi e aiuti si aggiornano). */
function numeroConPulsanti(input) {
    const box = document.createElement('div');
    box.className = 'ed-stepper';
    const passo = d => () => {
        input.value = String((Number(input.value) || 0) + d);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const meno = document.createElement('button');
    meno.type = 'button';
    meno.className = 'btn-small ed-num-btn';
    meno.textContent = '−';
    meno.title = 'Togli 1';
    meno.addEventListener('click', passo(-1));
    const piu = document.createElement('button');
    piu.type = 'button';
    piu.className = 'btn-small ed-num-btn';
    piu.textContent = '+';
    piu.title = 'Aggiungi 1';
    piu.addEventListener('click', passo(1));
    box.append(meno, input, piu);
    return box;
}

// Miniatura dell'elemento scelto in un menu (nemico di un nodo, reliquia di una prova): si vede subito se è quello giusto
function miniaturaScelta(src, nome) {
    const box = document.createElement('div');
    box.className = 'ed-scelta-mini';
    if (src) {
        const img = document.createElement('img');
        img.src = assetUrl(src);
        img.alt = '';
        img.onerror = () => { img.remove(); };
        box.appendChild(img);
    }
    const testo = document.createElement('span');
    testo.textContent = nome;
    box.appendChild(testo);
    return box;
}

// Gruppi che restano chiusi finché i loro campi sono vuoti
const FORM_CLOSED_GROUPS = ['Altri bonus', 'Suoni e video'];
const isEmptyValue = v => v == null || v === '' || v === 0 || v === false || (Array.isArray(v) && !v.length);

function renderForm(container, obj, fields, onChange) {
    container.innerHTML = '';
    // Campi divisi per gruppo (nell'ordine in cui compaiono); senza gruppi, un modulo solo come prima
    const order = [], byGroup = new Map();
    visibleFields(fields, obj).forEach(f => {
        const g = f.gruppo || '';
        if (!byGroup.has(g)) { byGroup.set(g, []); order.push(g); }
        byGroup.get(g).push(f);
    });
    let form;
    order.forEach(g => {
        form = document.createElement('div');
        form.className = 'ed-form';
        if (g) {
            const closable = FORM_CLOSED_GROUPS.includes(g);
            const box = document.createElement(closable ? 'details' : 'section');
            box.className = 'ed-group';
            box.innerHTML = closable ? `<summary class="ed-group-title">${esc(g)}</summary>` : `<h4 class="ed-group-title">${esc(g)}</h4>`;
            if (closable && !byGroup.get(g).every(f => isEmptyValue(getPath(obj, f.k)))) box.open = true;
            box.appendChild(form);
            container.appendChild(box);
        } else container.appendChild(form);
        byGroup.get(g).forEach(renderField);
    });
    // Impostazioni avanzate già compilate ma nascoste: si dice che ci sono, con il modo per vederle
    const hiddenSet = document.body.classList.contains('ed-advanced') ? [] : fields.filter(f => f.avanzato && !f.automatico && (!f.showIf || f.showIf(obj)) && !isEmptyValue(getPath(obj, f.k)));
    if (hiddenSet.length) container.insertAdjacentHTML('beforeend', `<p class="ed-hidden-set">Ha anche impostazioni avanzate (${esc(hiddenSet.map(f => f.label).join(', '))}).
        <button type="button" class="btn-small" ${azione('setAdvanced', true)}>Mostrale</button></p>`);

    function renderField(f) {
        const wrap = document.createElement('div');
        wrap.className = 'ed-field' + (f.wide ? ' wide' : '');
        const id = `f_${f.k.replace(/\./g, '_')}_${Math.random().toString(36).slice(2, 7)}`;
        // La spiegazione fissa sta nel "?" accanto al nome; quella calcolata (es. prezzo) resta sotto il campo
        const tip = typeof f.help === 'string' ? f.help : '';
        wrap.innerHTML = `<label for="${id}">${esc(f.label)}${tip ? ` <span class="ed-q" tabindex="0" data-q="${esc(tip)}" aria-label="${esc(tip)}">?</span>` : ''}</label>`;
        wrap.dataset.field = f.k;
        let input;
        const value = getPath(obj, f.k);

        // Riferimento a una libreria (reliquie, maledizioni) oppure elemento personalizzato scritto nella sfida
        if (f.type === 'libref') {
            input = document.createElement('select');
            const entries = Object.entries(lib[f.lib]).map(([k, v]) => [k, `${v.name} — ${v.desc || ''}`]);
            const mode = value == null ? '' : typeof value === 'string' ? value : '__custom';
            if (typeof value === 'string' && !lib[f.lib][value]) entries.push([value, `${value} (non trovato)`]);
            input.innerHTML = ordinaOpzioni([['', '— Nessuna —'], ...entries, ['__new', '+ Crea nuova…'], ['__custom', 'Personalizzata (scritta nella sfida)…']])
                .map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('');
            input.value = mode;
            input.id = id;
            input.addEventListener('change', () => {
                if (input.value === '__new') { input.value = mode; startCreateFor(f.lib, obj, f.k, `«${obj.title || obj.name || 'questa prova'}»`); return; }
                if (input.value === '') obj[f.k] = null;
                else if (input.value === '__custom') obj[f.k] = typeof value === 'object' && value ? value : f.custom();
                else obj[f.k] = input.value;
                onChange(f.k);
                render();
            });
            wrap.appendChild(menuCercabile(input));
            const scelto = typeof value === 'string' && lib[f.lib][value];
            if (scelto) wrap.appendChild(miniaturaScelta(scelto.icon || scelto.image, scelto.name));
            if (mode === '__custom') {
                const ta = document.createElement('textarea');
                ta.className = 'ed-json';
                ta.value = JSON.stringify(value, null, 2);
                ta.addEventListener('input', () => {
                    try { obj[f.k] = JSON.parse(ta.value); ta.classList.remove('ed-invalid'); onChange(f.k); }
                    catch (err) { ta.classList.add('ed-invalid'); ta.title = err.message; }
                });
                wrap.appendChild(ta);
            } else if (mode) {
                wrap.insertAdjacentHTML('beforeend', `<a href="#" class="ed-goto" ${azione('gotoLibrary', f.lib, mode)}>Modifica in ${LIB_LABELS[f.lib]}</a>`);
            }
            form.appendChild(wrap);
            return;
        }

        // Effetti (reliquie, maledizioni, passive): elenco composto con i menu, come le scelte degli eventi
        if (f.type === 'effetti') {
            const list = Array.isArray(value) ? value : [];
            wrap.appendChild(effectListEditor(list, () => {
                if (list.length) setPath(obj, f.k, list); else deletePath(obj, f.k);
                onChange(f.k);
            }, f.nuovo || { effect: 'party_stat', stat: 'fth', val: 1 }));
            form.appendChild(wrap);
            return;
        }

        // "Porta a" di un nodo: i nodi successivi per nome, con la × per toglierli e un menu per aggiungerne
        if (f.type === 'nodelinks') {
            const list = Array.isArray(value) ? value : [];
            const nodeName = n => `${n.title || NODE_TYPES[n.type]?.label || 'Nodo'}${isAdvanced() ? ` (${n.id})` : ''}`;
            const byId = new Map(camp.mapNodes.map(n => [n.id, n]));
            const box = document.createElement('div');
            box.className = 'ed-chips';
            box.innerHTML = list.map(nid => `<span class="ed-chip" style="--c:${(NODE_TYPES[byId.get(nid)?.type] || {}).color || '#777'}">
                ${esc(byId.has(nid) ? nodeName(byId.get(nid)) : `nodo ${nid} (non esiste)`)}
                <button type="button" title="Togli" ${azione('nodeUnlinkFromForm', obj.id, nid)}>×</button></span>`).join('')
                || '<span class="ed-help">Nessuno: qui finisce la campagna.</span>';
            const options = camp.mapNodes.filter(n => n.id !== obj.id && !list.includes(n.id) && (n.level || 0) > (obj.level || 0))
                .sort((x, y) => x.level - y.level || x.x - y.x);
            const row = document.createElement('div');
            row.className = 'ed-add-row';
            row.innerHTML = options.length
                ? `<select id="${id}">${options.map(n => `<option value="${n.id}">${esc(nodeName(n))}</option>`).join('')}</select>
                   <button type="button" class="btn-small" ${azione('nodeLinkFromForm', obj.id, `#${id}`)}>Collega</button>`
                : '<span class="ed-help">Per collegarlo a un punto nuovo usa "Aggiungi un nodo dopo" dal menu del nodo sulla mappa.</span>';
            wrap.append(box, row);
            form.appendChild(wrap);
            return;
        }

        // Strade di una sfida: statistica, difficoltà, testi, premio e punizione per ogni approccio
        if (f.type === 'roadlist') {
            wrap.appendChild(roadListEditor(obj, f, onChange));
            form.appendChild(wrap);
            return;
        }

        // Scelte di un evento (nodo di trama): costo, prova, effetti ed esito
        if (f.type === 'choicelist') {
            wrap.appendChild(choiceListEditor(obj, f, onChange));
            form.appendChild(wrap);
            return;
        }

        // Potenziamenti di una benedizione: statistica e valore, uno per riga
        if (f.type === 'bufflist') {
            wrap.appendChild(buffListEditor(obj, f, onChange));
            form.appendChild(wrap);
            return;
        }

        // Effetti speciali "quando → fai": elenco composto con i menu
        if (f.type === 'speciali') {
            wrap.appendChild(specialiEditor(obj, f, onChange));
            form.appendChild(wrap);
            return;
        }

        // Inquadratura dei ritratti (icona e cinematica d'attacco), come le calcola js/game.js
        if (f.type === 'portraitframe') {
            wrap.appendChild(portraitFrameEditor(obj, onChange));
            form.appendChild(wrap);
            return;
        }

        // Elenco di id di una libreria (abilità di un eroe): togli, riordina, aggiungi
        if (f.type === 'reflist') {
            // Il campo nasce solo quando si aggiunge il primo elemento: aprire l'eroe non cambia i suoi dati
            const list = Array.isArray(value) ? value : [];
            const box = document.createElement('div');
            box.className = 'ed-picklist';
            box.innerHTML = list.map((ref, i) => {
                const el = typeof ref === 'string' ? lib[f.lib][ref] : ref;
                const label = typeof ref !== 'string' ? `${ref.name} (scritta nell'eroe)` : el ? el.name : `${ref} (non trovata)`;
                const sub = el ? abilitySummary(el) : '';
                return `<div class="ed-pick" data-i="${i}">
                    ${el && el.icon ? `<img class="ed-list-portrait" src="${esc(assetUrl(el.icon))}" alt="" loading="lazy" decoding="async" ${azioneSu('error', 'nascondiImmagine', '$el')}>` : ''}
                    <span>${esc(label)}<small>${esc(sub)}</small></span>
                    ${i > 0 ? '<button type="button" class="btn-small" data-act="up" title="Sposta su">▲</button>' : ''}
                    ${typeof ref === 'string' && el ? '<button type="button" class="btn-small" data-act="goto">Modifica</button>' : ''}
                    <button type="button" class="btn-small ed-danger" data-act="del">Togli</button>
                </div>`;
            }).join('') || '<p class="ed-help">Nessuna abilità.</p>';
            box.addEventListener('click', e => {
                const btn = e.target.closest('button[data-act]');
                if (!btn) return;
                const i = Number(btn.closest('.ed-pick').dataset.i);
                if (btn.dataset.act === 'goto') { gotoLibrary(f.lib, list[i]); return; }
                if (btn.dataset.act === 'del') list.splice(i, 1);
                if (btn.dataset.act === 'up') [list[i - 1], list[i]] = [list[i], list[i - 1]];
                onChange(f.k);
                render();
            });
            const available = Object.entries(lib[f.lib]).filter(([k]) => !list.includes(k));
            const row = document.createElement('div');
            row.className = 'ed-add-row';
            const select = document.createElement('select');
            select.id = id;
            select.innerHTML = ordinaOpzioni(available.map(([k, v]) => [k, `${v.name} — ${v.isCombatActive ? 'Attiva' : 'Passiva'}`]))
                .map(([k, l]) => `<option value="${esc(k)}">${esc(l)}</option>`).join('');
            const add = document.createElement('button');
            add.type = 'button';
            add.className = 'btn-small';
            add.textContent = `Aggiungi da ${LIB_LABELS[f.lib]}`;
            add.disabled = !available.length;
            add.addEventListener('click', () => { if (!select.value) return; if (!Array.isArray(obj[f.k])) obj[f.k] = list; list.push(select.value); onChange(f.k); render(); });
            row.append(menuCercabile(select), add);
            wrap.append(box, row);
            form.appendChild(wrap);
            return;
        }

        switch (f.type) {
            case 'textarea':
                input = document.createElement('textarea');
                input.value = value ?? '';
                break;
            case 'json':
                input = document.createElement('textarea');
                input.className = 'ed-json';
                input.value = value == null ? '' : JSON.stringify(value, null, 2);
                break;
            case 'select': {
                input = document.createElement('select');
                let opts = f.options();
                if (value != null && value !== '' && !opts.some(([v]) => v === String(value))) opts.push([String(value), `${value} (non trovato)`]);
                if (f.creaNuovo) opts.push(['__new', '+ Crea nuovo…']);
                // Menu di elementi (nemici, prove, testi): in ordine alfabetico; quelli con un ordine loro restano com'erano
                if (f.cercabile) opts = ordinaOpzioni(opts);
                input.innerHTML = opts.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('');
                input.value = value ?? '';
                break;
            }
            case 'checkbox':
                input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = !!value;
                break;
            case 'idlist':
                input = document.createElement('input');
                input.value = (value || []).join(', ');
                break;
            default:
                input = document.createElement('input');
                input.type = f.type === 'number' ? 'number' : 'text';
                input.value = value ?? '';
                if (f.placeholder) input.placeholder = typeof f.placeholder === 'function' ? f.placeholder(obj) : f.placeholder;
        }
        input.id = id;
        const commit = () => {
            if (f.creaNuovo && input.value === '__new') {
                input.value = value ?? '';
                startCreateFor(f.creaNuovo, obj, f.k, `«${obj.title || obj.name || 'questo nodo'}»`);
                return;
            }
            let v;
            if (f.type === 'number') v = input.value === '' ? null : Number(input.value);
            else if (f.type === 'checkbox') v = input.checked;
            else if (f.type === 'idlist') v = input.value.split(/[,\s]+/).filter(Boolean).map(Number).filter(n => !Number.isNaN(n));
            else if (f.type === 'json') {
                if (input.value.trim() === '' && f.nullable) v = null;
                else {
                    try { v = JSON.parse(input.value); input.classList.remove('ed-invalid'); }
                    catch (err) { input.classList.add('ed-invalid'); input.title = err.message; return; }
                }
            } else v = f.numeric ? Number(input.value) : input.value;
            // Campi facoltativi: vuoto, zero o falso = campo assente, per tenere pulito il JSON
            if ((f.omitEmpty && (v === null || v === '' || v === 0 || v === false)) || (f.type === 'json' && f.nullable && v === null)) deletePath(obj, f.k);
            else setPath(obj, f.k, v);
            onChange(f.k);
        };
        input.addEventListener(f.type === 'select' || f.type === 'checkbox' ? 'change' : 'input', commit);
        // Numeri: − e + accanto (non per i numeri tecnici delle Avanzate: id, livello, posizione)
        if (f.type === 'number' && !f.avanzato) wrap.appendChild(numeroConPulsanti(input));
        else if (f.cercabile) wrap.appendChild(menuCercabile(input));
        else wrap.appendChild(input);
        if (f.miniatura && value) {
            const [src, nome] = f.miniatura(obj) || [];
            if (nome) wrap.appendChild(miniaturaScelta(src, nome));
        }

        // Campo immagine o suono: percorso + pulsante di caricamento + anteprima (miniatura o ascolto)
        if (f.type === 'audio') {
            const row = document.createElement('div');
            row.className = 'ed-image-row';
            wrap.replaceChild(row, input);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-small';
            btn.textContent = 'Carica…';
            btn.addEventListener('click', () => pickFile(f.folder || 'audio', 'audio/*', path => { input.value = path; commit(); }));
            const play = document.createElement('button');
            play.type = 'button';
            play.className = 'btn-small ed-play';
            play.textContent = '▶';
            play.title = 'Ascolta';
            play.addEventListener('click', () => { if (input.value) new Audio(assetUrl(input.value)).play().catch(() => alert('Suono non trovato: ' + input.value)); });
            row.append(input, btn, play);
        }
        if (f.type === 'video') {
            const row = document.createElement('div');
            row.className = 'ed-image-row';
            wrap.replaceChild(row, input);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-small';
            btn.textContent = 'Carica…';
            const thumb = document.createElement('video');
            thumb.className = 'ed-thumb';
            thumb.muted = true;
            thumb.loop = true;
            thumb.autoplay = true;
            thumb.playsInline = true;
            thumb.onerror = () => { thumb.hidden = true; };
            const updateThumb = () => { thumb.hidden = !input.value; if (input.value) thumb.src = assetUrl(input.value); };
            btn.addEventListener('click', () => pickFile(f.folder || 'video', 'video/*', path => { input.value = path; commit(); updateThumb(); }));
            input.addEventListener('input', updateThumb);
            row.append(input, btn, thumb);
            updateThumb();
        }
        if (f.type === 'image') {
            const row = document.createElement('div');
            row.className = 'ed-image-row';
            wrap.replaceChild(row, input);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-small';
            btn.textContent = 'Carica…';
            const thumb = document.createElement('img');
            thumb.className = 'ed-thumb';
            thumb.alt = '';
            thumb.onerror = () => { thumb.hidden = true; };
            const updateThumb = () => { thumb.hidden = !input.value; if (input.value) thumb.src = assetUrl(input.value); };
            btn.addEventListener('click', () => pickFile(f.folder || 'immagini', 'image/*', path => { input.value = path; commit(); updateThumb(); }));
            input.addEventListener('input', updateThumb);
            row.append(input, btn, thumb);
            updateThumb();
            // Un file trascinato sul campo: come "Carica…" (copiato nel progetto al salvataggio)
            row.title = 'Trascina qui un\'immagine';
            row.addEventListener('dragover', e => { e.preventDefault(); row.classList.add('ed-drop'); });
            row.addEventListener('dragleave', () => row.classList.remove('ed-drop'));
            row.addEventListener('drop', e => {
                e.preventDefault();
                row.classList.remove('ed-drop');
                const file = [...(e.dataTransfer.files || [])].find(x => /^image\//.test(x.type));
                if (!file) return;
                const path = `${f.folder || 'immagini'}/${safeFileName(file.name)}`;
                addPendingAsset(path, file);
                input.value = path;
                commit();
                updateThumb();
            });
        }
        if (f.k === 'enemy' && value && lib.bestiario[value]) {
            wrap.insertAdjacentHTML('beforeend', `<a href="#" class="ed-goto" ${azione('gotoLibrary', 'bestiario', value)}>Modifica tra i Nemici</a>`);
        }
        if (f.range) {
            const warn = document.createElement('span');
            warn.className = 'ed-warn';
            const update = () => { warn.textContent = numberRangeWarning(f.range, f.k, obj); warn.hidden = !warn.textContent; };
            input.addEventListener('input', update);
            update();
            wrap.appendChild(warn);
        }
        // Testo d'aiuto calcolato dal modulo (es. prezzo dal mercante): si aggiorna mentre si scrive
        if (typeof f.help === 'function') {
            wrap.insertAdjacentHTML('beforeend', `<span class="ed-help">${esc(f.help(obj))}</span>`);
            input.addEventListener('input', () => { wrap.querySelector('.ed-help').textContent = f.help(obj); });
        }
        form.appendChild(wrap);
    }
}
