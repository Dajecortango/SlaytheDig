/* ==========================================================================
   EDITOR: ELITE E BOSS
   Scheda "Elite": nemici del bestiario con le fasi (soglie di vita e azioni speciali).
   Un elite si crea da zero o da un nemico del bestiario; per ogni soglia si scrive il testo
   e si scelgono le azioni dalla libreria Azioni elite (data/azioni_elite/azioni_elite.js),
   che si creano nella scheda "Azioni elite" senza toccare il codice.
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

// Nemici della scheda Elite: quelli con le fasi e quelli usati in un nodo elite di qualche campagna
function eliteKeys() {
    const onEliteNodes = new Set([camp, ...Object.values(rawCampaigns())].filter(Boolean)
        .flatMap(c => (c.mapNodes || []).filter(n => n.type === 'elite').map(n => n.enemy)));
    return keysOf(lib.bestiario).filter(k => Array.isArray(lib.bestiario[k].fasi) || onEliteNodes.has(k));
}

const selectedElite = () => lib.bestiario[selection.elite] || null;

// Fase nel formato di prima (schema, reazione, bonusDanno, ruggito): diventa un elenco di azioni
function migrateLegacyPhase(f) {
    if (!(f.schema || f.reazione || f.bonusDanno || f.ruggito)) return false;
    const azioni = f.azioni || [];
    if (f.bonusDanno) azioni.push(f.bonusDanno === 1 && lib.azioni_elite.furore ? 'furore' : { name: 'Furore', desc: `+${f.bonusDanno} danno`, bonusDanno: f.bonusDanno });
    if (f.schema) azioni.push(f.schema);
    if (f.ruggito) {
        const same = keysOf(lib.azioni_elite).find(k => {
            const a = lib.azioni_elite[k];
            return a.malus === (f.ruggito.malus || 1) && (a.malusRound || 1) === 1 && (a.resisteFede || 0) === (f.ruggito.fedeMin || 0) && !a.turno && !a.colpo;
        });
        azioni.push(same || { name: 'Ruggito', malus: f.ruggito.malus || 1, malusRound: 1, resisteFede: f.ruggito.fedeMin || 0 });
    }
    if (f.reazione) azioni.push(f.reazione);
    f.azioni = azioni;
    delete f.schema; delete f.reazione; delete f.bonusDanno; delete f.ruggito;
    return true;
}

function renderEliteTab() {
    const content = document.getElementById('edContent');
    const keys = eliteKeys();
    if (!keys.includes(selection.elite)) selection.elite = keys[0] || null;
    const sel = selection.elite;
    const others = keysOf(lib.bestiario).filter(k => !keys.includes(k));
    content.innerHTML = `
        <p class="ed-lib-note">Elite e boss: soglie di vita e azioni speciali. I nemici stanno nel Bestiario (<code>${libraryFilePath('bestiario')}</code>),
            le azioni nella scheda <a href="#" ${azione('switchTab', 'azioni_elite')}>Azioni elite</a> (<code>${libraryFilePath('azioni_elite')}</code>).</p>
        <div class="ed-list-actions">
            <button ${azione('newElite')}>Nuovo elite</button>
            <select id="edEliteFrom">${others.map(k => `<option value="${esc(k)}">${esc(lib.bestiario[k].name || k)} (${esc(k)})</option>`).join('')}</select>
            <button ${azione('makeElite')} ${others.length ? '' : 'disabled'}>Rendi elite</button>
            <button class="ed-danger" ${azione('unmakeElite')} ${sel && Array.isArray(lib.bestiario[sel].fasi) ? '' : 'disabled'}>Togli le soglie</button>
        </div>
        <div class="ed-split">
            <div class="ed-list">${keys.map(k => {
                const e = lib.bestiario[k];
                const n = (e.fasi || []).length;
                return `<div class="ed-list-item ${k === sel ? 'active' : ''}" ${azione('selectKeyed', 'elite', k)}>
                    ${esc(e.name || k)}<small>${esc(k)} · HP ${e.maxHp} · ${n ? `${n} ${n === 1 ? 'soglia' : 'soglie'}` : 'nessuna soglia'}</small>
                    <small class="ed-usage">${esc(usageText(libraryUsage('bestiario', k)))}</small>
                </div>`;
            }).join('') || '<div class="ed-list-item">Nessun elite</div>'}
            </div>
            <div class="ed-detail" id="edDetail"></div>
        </div>`;
    if (sel) renderEliteDetail(document.getElementById('edDetail'), sel);
}

function renderEliteDetail(detail, key) {
    const e = lib.bestiario[key];
    if (!Array.isArray(e.fasi)) e.fasi = [];
    if (e.fasi.map(migrateLegacyPhase).some(Boolean)) markLibDirty('bestiario');
    const stats = document.createElement('div');
    renderForm(stats, e, ENEMY_FIELDS, field => {
        markLibDirty('bestiario');
        if (field === 'name') { const active = document.querySelector('.ed-list-item.active'); if (active) active.firstChild.textContent = e.name || key; }
        if (field === 'maxHp' || field === 'hp') renderElitePhases();
    });
    detail.innerHTML = `<p class="ed-usage-box"><b>Id:</b> <code>${esc(key)}</code> · <b>Usato in:</b> ${esc(usageText(libraryUsage('bestiario', key)))}</p>
        <h3>Soglie e azioni speciali</h3>
        <p class="ed-help">Quando la vita scende alla soglia o sotto, la fase scatta una volta: si legge il testo e partono le azioni, in ordine.
            Le azioni "alla soglia" agiscono subito; quelle "a ogni turno" cambiano da quel momento il modo in cui il nemico attacca (l'ultima scattata vale).</p>
        <div id="edElitePhases"></div>
        <h3>Statistiche e immagini</h3>`;
    detail.appendChild(stats);
    renderElitePhases();
}

// Barra della vita con le tacche delle soglie, poi un riquadro per ogni soglia
function renderElitePhases() {
    const box = document.getElementById('edElitePhases');
    const e = selectedElite();
    if (!box || !e) return;
    const maxHp = Number(e.maxHp) || 1;
    const actionOptions = keysOf(lib.azioni_elite).map(k => {
        const a = lib.azioni_elite[k];
        return `<option value="${esc(k)}">${esc(a.name || k)}${a.turno ? ' (a ogni turno)' : ''} — ${esc(a.desc || '')}</option>`;
    }).join('');
    const bar = `<div class="ed-elite-bar">${e.fasi.map((f, i) => `<span class="ed-elite-tick" style="left:${Math.min(100, Math.max(0, f.soglia))}%">
        <b>${i + 1}</b><small>${f.soglia}%</small></span>`).join('')}</div>`;
    const phases = e.fasi.map((f, i) => {
        const hpAt = Math.floor(maxHp * f.soglia / 100);
        const list = (f.azioni || []).map((ref, j) => {
            const a = typeof ref === 'string' ? lib.azioni_elite[ref] : ref;
            const label = !a ? `${ref} (non trovata)` : typeof ref === 'string' ? (a.name || ref) : `${a.name || 'Azione'} (scritta nella fase)`;
            return `<div class="ed-pick">
                ${a && a.icon ? `<img class="ed-list-portrait" src="${esc(assetUrl(a.icon))}" alt="" ${azioneSu('error', 'nascondiImmagine', '$el')}>` : ''}
                <span>${esc(label)} ${a ? `<em class="ed-elite-when">${a.turno ? 'a ogni turno' : 'alla soglia'}</em>` : ''}<small>${esc(a ? describeEliteAction(a) : '')}</small></span>
                ${j > 0 ? `<button type="button" class="btn-small" title="Sposta su" ${azione('eliteMoveAction', i, j)}>▲</button>` : ''}
                ${typeof ref === 'string' && a ? `<button type="button" class="btn-small" ${azione('gotoLibrary', 'azioni_elite', ref)}>Modifica</button>` : ''}
                <button type="button" class="btn-small ed-danger" ${azione('eliteRemoveAction', i, j)}>Togli</button>
            </div>`;
        }).join('') || '<p class="ed-help">Nessuna azione: la soglia mostra solo il testo.</p>';
        return `<div class="ed-elite-phase">
            <div class="ed-elite-phase-head">
                <strong>Soglia ${i + 1}</strong>
                <label>al <input type="number" min="1" max="99" value="${esc(f.soglia)}" ${azioneSu('change', 'eliteSetThreshold', i, '$value')}> % di vita</label>
                <small>scatta a ${hpAt} HP su ${maxHp} o meno</small>
                <button type="button" class="btn-small ed-danger" ${azione('eliteRemovePhase', i)}>Elimina soglia</button>
            </div>
            <label class="ed-elite-label">Testo mostrato quando scatta</label>
            <textarea rows="2" ${azioneSu('input', 'eliteSetPhaseText', i, '$value')}>${esc(f.testo || '')}</textarea>
            <label class="ed-elite-label">Azioni</label>
            <div class="ed-picklist">${list}</div>
            <div class="ed-add-row">
                <select id="edEliteAdd${i}">${actionOptions}</select>
                <button type="button" class="btn-small" ${azione('eliteAddAction', i)} ${actionOptions ? '' : 'disabled'}>Aggiungi azione</button>
            </div>
        </div>`;
    }).join('');
    box.innerHTML = `${bar}${phases || '<p class="ed-help">Nessuna soglia: il nemico combatte sempre allo stesso modo.</p>'}
        <button type="button" ${azione('eliteAddPhase')}>Aggiungi soglia</button>`;
}

function eliteChanged(redraw = true) {
    markLibDirty('bestiario');
    if (redraw) renderElitePhases();
}

// Le fasi restano ordinate dalla soglia più alta: è l'ordine in cui scattano
function sortElitePhases(e) {
    e.fasi.sort((a, b) => b.soglia - a.soglia);
}

function newElite() {
    const key = askKey('bestiario', 'nuovo_elite');
    if (!key) return;
    lib.bestiario[key] = { name: 'Nuovo elite', hp: 16, maxHp: 16, att: 7, dmg: 2, ca: 8, desc: '',
        fasi: [{ soglia: 50, testo: '', azioni: [] }] };
    selection.elite = key;
    markLibDirty('bestiario');
    render();
}

function makeElite() {
    const key = document.getElementById('edEliteFrom').value;
    const e = lib.bestiario[key];
    if (!e) return;
    e.fasi = [{ soglia: 50, testo: '', azioni: [] }];
    selection.elite = key;
    markLibDirty('bestiario');
    render();
}

function unmakeElite() {
    const e = selectedElite();
    if (!e || !confirm(`Togliere tutte le soglie a "${e.name}"? Resta nel bestiario come nemico normale.`)) return;
    delete e.fasi;
    markLibDirty('bestiario');
    render();
}

function eliteAddPhase() {
    const e = selectedElite();
    if (!e) return;
    const lowest = e.fasi.length ? Math.min(...e.fasi.map(f => f.soglia)) : 66;
    e.fasi.push({ soglia: Math.max(1, e.fasi.length ? Math.round(lowest / 2) : 50), testo: '', azioni: [] });
    sortElitePhases(e);
    eliteChanged();
}

function eliteRemovePhase(i) {
    const e = selectedElite();
    if (!e || !confirm(`Eliminare la soglia ${i + 1} (${e.fasi[i].soglia}%)?`)) return;
    e.fasi.splice(i, 1);
    eliteChanged();
}

function eliteSetThreshold(i, value) {
    const e = selectedElite();
    const v = Math.round(Number(value));
    if (!e || !e.fasi[i] || !Number.isFinite(v)) return;
    e.fasi[i].soglia = Math.min(99, Math.max(1, v));
    sortElitePhases(e);
    eliteChanged();
}

// Il testo si aggiorna mentre si scrive, senza ridisegnare (il riquadro perderebbe il cursore)
function eliteSetPhaseText(i, value) {
    const e = selectedElite();
    if (!e || !e.fasi[i]) return;
    e.fasi[i].testo = value;
    eliteChanged(false);
}

function eliteAddAction(i) {
    const e = selectedElite();
    const id = (document.getElementById(`edEliteAdd${i}`) || {}).value;
    if (!e || !e.fasi[i] || !id) return;
    (e.fasi[i].azioni = e.fasi[i].azioni || []).push(id);
    eliteChanged();
}

function eliteRemoveAction(i, j) {
    const e = selectedElite();
    if (!e || !e.fasi[i]) return;
    e.fasi[i].azioni.splice(j, 1);
    eliteChanged();
}

function eliteMoveAction(i, j) {
    const e = selectedElite();
    const list = e && e.fasi[i] && e.fasi[i].azioni;
    if (!list || j < 1) return;
    [list[j - 1], list[j]] = [list[j], list[j - 1]];
    eliteChanged();
}
