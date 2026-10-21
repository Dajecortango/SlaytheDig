/* ==========================================================================
   EDITOR: MAPPA
   Scheda Mappa: modulo del nodo, anteprima SVG, trascinamento dei nodi,
   aggiungi, duplica, elimina e rinumera i nodi.
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

/* ---------- Mappa ---------- */
function renderMapTab() {
    const content = document.getElementById('edContent');
    const nodes = camp.mapNodes;
    if (!nodes.some(n => n.id === selection.map)) selection.map = nodes[0] ? nodes[0].id : null;
    const sel = nodes.find(n => n.id === selection.map);
    const sorted = [...nodes].sort((a, b) => a.level - b.level || a.x - b.x);
    const nodeSub = n => {
        const t = NODE_TYPES[n.type] ? NODE_TYPES[n.type].label : n.type;
        const what = n.enemy ? ` (${lib.bestiario[n.enemy] ? lib.bestiario[n.enemy].name : n.enemy})` : '';
        return `livello ${n.level + 1} · ${t}${what}`;
    };
    const problemNodes = nodes.filter(n => nodeProblems(n).some(p => p.livello === 'errore'));
    const hint = mapLink
        ? `<p class="ed-map-status">${mapLink.mode === 'link' ? 'Clicca il punto a cui collegare' : 'Clicca il collegamento da togliere di'} «${esc((nodes.find(n => n.id === mapLink.from) || {}).title || '')}» · <button class="btn-small" ${azione('cancelMapLink')}>Annulla</button></p>`
        : problemNodes.length
            ? `<p class="ed-map-status ed-map-bad">⚠ ${problemNodes.length === 1 ? '1 punto da sistemare' : `${problemNodes.length} punti da sistemare`} <button class="btn-small" ${azione('selectNode', problemNodes[0].id)}>Mostrami il primo</button></p>`
            : '';

    content.innerHTML = `
        ${hint}
        <div class="ed-map-wrap">
            <div class="ed-map" id="edMap"></div>
            <div class="ed-legend">${Object.values(NODE_TYPES).map(t => `<span style="--c:${t.color}">${t.label}</span>`).join('')}
                <span style="--c:transparent; outline:2px solid var(--wc-yellow); border-radius:50%">partenza</span></div>
        </div>
        <div class="ed-list-actions">
            <button data-action="addNode">${sel ? 'Aggiungi un nodo dopo quello scelto' : 'Aggiungi nodo'}</button>
            <button class="ed-adv-only" data-action="duplicateNode" ${sel ? '' : 'disabled'}>Duplica</button>
            <button class="ed-adv-only" data-action="renumberNodes">Rinumera id</button>
            <button class="ed-danger" data-action="deleteNode" ${sel ? '' : 'disabled'}>Elimina</button>
        </div>
        <div class="ed-split">
            <div class="ed-list">${sorted.map(n => `
                <div class="ed-list-item ${n.id === selection.map ? 'active' : ''} ${problemNodes.includes(n) ? 'ed-has-problem' : ''}" ${azione('selectNode', n.id)}>
                    ${esc(n.icon || '')} ${esc(n.title || '(senza titolo)')}
                    <small><span class="ed-adv-only">id ${n.id} · </span>${esc(nodeSub(n))}</small>
                </div>`).join('')}
            </div>
            <div class="ed-detail" id="edDetail"></div>
        </div>`;
    renderMapPreview();
    if (sel) renderNodeForm(sel);
}

function renderNodeForm(node) {
    renderForm(document.getElementById('edDetail'), node, NODE_FIELDS, key => {
        if (key === 'type') {
            applyNodeType(node, node.type);
            renderNodeForm(node);
        }
        if (key === 'enemy' || key === 'storyId' || key === 'restId') renderNodeForm(node);
        if (key === 'id') selection.map = node.id;
        markDirty();
    });
    // Problemi del nodo sopra il modulo, in parole semplici
    const probs = nodeProblems(node);
    if (probs.length) document.getElementById('edDetail').insertAdjacentHTML('afterbegin',
        `<ul class="ed-node-problems">${probs.map(p => `<li class="${p.livello === 'errore' ? 'err' : 'warn'}">${esc(p.msg)}</li>`).join('')}</ul>`);
    if (node.type === 'story') renderStoryForm(node);
    if (node.type === 'rest') renderRestForm(node);
}

// Nodo di riposo: il messaggio si scrive qui, in camp.rests[restId].
// Se il testo è "default" o lo usano anche altri riposi, alla prima modifica il nodo
// prende un testo tutto suo ("riposo_<id>"): così si cambia solo questo riposo.
function renderRestForm(node) {
    camp.rests = camp.rests || {};
    const key = node.restId || 'default';
    const shared = camp.mapNodes.filter(n => n !== node && n.type === 'rest' && (n.restId || 'default') === key).length;
    const data = { text: camp.rests[key] || '' };
    const box = document.createElement('div');
    box.className = 'ed-story';
    const note = key === 'default' ? 'testo comune a tutti i riposi'
        : shared === 1 ? 'usato anche da un altro riposo'
        : shared ? `usato anche da altri ${shared} riposi` : esc(key);
    box.innerHTML = `<h3>Messaggio del riposo <small>(${note})</small></h3><div></div>`;
    document.getElementById('edDetail').appendChild(box);
    renderForm(box.lastElementChild, data, [
        { k: 'text', label: 'Descrizione', type: 'textarea', wide: true,
          help: 'Il testo mostrato all\'arrivo al riposo, dopo "Descrizione:". Scrivendo qui cambia solo questo riposo. Vuoto = testo comune dei riposi.' }
    ], () => {
        if (key === 'default' || shared) {
            let own = `riposo_${node.id}`;
            for (let i = 2; camp.rests[own] != null; i++) own = `riposo_${node.id}_${i}`;
            camp.rests[own] = data.text;
            node.restId = own;
            markDirty();
            // Nuova chiave: ridisegna il modulo e torna a scrivere nella casella
            renderNodeForm(node);
            const ta = document.querySelector('#edDetail .ed-story textarea');
            if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
            return;
        }
        camp.rests[key] = data.text;
        markDirty();
    });
    const ta = box.querySelector('textarea');
    if (ta) ta.placeholder = camp.rests.default || 'Trovate un luogo sicuro dove riposare e recuperare le forze.';
}

// Nodo di trama: titolo e descrizione si scrivono qui, in camp.stories[storyId].
// Senza trama scelta se ne crea una nuova per il nodo (chiave "trama_<id>").
function renderStoryForm(node) {
    camp.stories = camp.stories || {};
    if (!node.storyId) {
        let key = `trama_${node.id}`;
        for (let i = 2; camp.stories[key]; i++) key = `trama_${node.id}_${i}`;
        camp.stories[key] = { title: (node.title || '').replace(/^Livello \d+ - /, ''), text: '' };
        node.storyId = key;
        renderNodeForm(node);
        return;
    }
    if (!camp.stories[node.storyId]) camp.stories[node.storyId] = { title: '', text: '' };
    const box = document.createElement('div');
    box.className = 'ed-story';
    box.innerHTML = `<h3>Testo della trama <small>(${esc(node.storyId)})</small></h3><div></div>`;
    document.getElementById('edDetail').appendChild(box);
    renderForm(box.lastElementChild, camp.stories[node.storyId], STORY_FIELDS, markDirty);
}

// Geometria dell'anteprima della mappa: x libera 20–780, livelli su righe distanti MAP_STEP_Y
const MAP_W = 800, MAP_STEP_Y = 70;
function mapGeometry() {
    const maxLevel = Math.max(1, ...camp.mapNodes.map(n => n.level || 0));
    const H = maxLevel * MAP_STEP_Y + 80;
    return {
        maxLevel, H,
        pos: n => ({ x: Math.max(20, Math.min(MAP_W - 20, n.x || 0)), y: H - 40 - (n.level || 0) * MAP_STEP_Y }),
        levelAt: y => Math.max(0, Math.round((H - 40 - Math.max(-30, Math.min(H, y))) / MAP_STEP_Y))
    };
}

function renderMapPreview() {
    const box = document.getElementById('edMap');
    if (!box) return;
    const nodes = camp.mapNodes;
    const { maxLevel, H, pos } = mapGeometry();
    const byId = new Map(nodes.map(n => [n.id, n]));

    let svg = '';
    for (let l = 0; l <= maxLevel; l++) {
        svg += `<line class="level-row" x1="30" y1="${H - 40 - l * MAP_STEP_Y}" x2="${MAP_W - 10}" y2="${H - 40 - l * MAP_STEP_Y}"/>`;
        svg += `<text class="level-label" x="6" y="${H - 36 - l * MAP_STEP_Y}">L${l + 1}</text>`;
    }
    nodes.forEach(n => (n.next || []).forEach(id => {
        const a = pos(n), target = byId.get(id);
        if (!target) return;
        const b = pos(target);
        const bad = (target.level || 0) <= (n.level || 0);
        svg += `<line class="edge ${bad ? 'bad' : ''}" data-from="${n.id}" data-to="${id}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
    }));
    const candidates = mapLinkCandidates();
    nodes.forEach(n => {
        const p = pos(n);
        const t = NODE_TYPES[n.type] || { color: '#777' };
        const enemyName = n.enemy && lib.bestiario[n.enemy] ? ` — ${lib.bestiario[n.enemy].name}` : '';
        const probs = nodeProblems(n);
        const err = probs.some(x => x.livello === 'errore');
        const linkCls = candidates ? (candidates.has(n.id) ? 'link-candidate' : n.id === mapLink.from ? 'link-source' : 'link-dim') : '';
        svg += `<g class="node ${n.active ? 'active-node' : ''} ${n.id === selection.map ? 'selected' : ''} ${linkCls}" data-id="${n.id}">
            <title>${esc(n.title)}${esc(enemyName)}${probs.map(x => `\n• ${esc(x.msg)}`).join('')}</title>
            <circle cx="${p.x}" cy="${p.y}" r="16" fill="${t.color}"/>
            <text x="${p.x}" y="${p.y + 4}">${esc(n.icon || n.id)}</text>
            ${err ? `<circle class="badge err" cx="${p.x + 13}" cy="${p.y - 13}" r="7"/><text class="badge-t" x="${p.x + 13}" y="${p.y - 9.5}">!</text>`
                : probs.length ? `<circle class="badge warn" cx="${p.x + 13}" cy="${p.y - 13}" r="5"/>` : ''}</g>`;
    });
    box.innerHTML = `<svg viewBox="0 0 ${MAP_W} ${H}" xmlns="http://www.w3.org/2000/svg">${svg}<line class="link-preview hidden" x1="0" y1="0" x2="0" y2="0"/></svg>
        <p class="ed-map-help">Clicca un punto per il suo menu: aggiungi un punto dopo, collega, cambia tipo. Trascinalo per spostarlo<span class="ed-adv-only"> (Shift + trascina da un nodo a un altro: crea o toglie il collegamento)</span>. <b style="color:#e74c3c">!</b> = manca qualcosa, <b style="color:#f1c40f">●</b> = manca solo l'immagine.</p>`;
    box.querySelector('svg').addEventListener('pointerdown', onMapPointerDown);
}

/* Trascinamento dei nodi (drag and drop) nell'anteprima della mappa */
let mapDrag = null;

function svgPoint(svg, e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function onMapPointerDown(e) {
    const g = e.target.closest('g.node');
    if (!g) return;
    e.preventDefault();
    const svg = e.currentTarget;
    const node = camp.mapNodes.find(n => n.id === Number(g.dataset.id));
    mapDrag = { svg, g, node, start: svgPoint(svg, e), moved: false, link: e.shiftKey, x: node.x, level: node.level };
    try { svg.setPointerCapture(e.pointerId); } catch (err) { /* puntatore non catturabile: si trascina lo stesso */ }
    svg.addEventListener('pointermove', onMapPointerMove);
    svg.addEventListener('pointerup', onMapPointerUp, { once: true });
    svg.addEventListener('pointercancel', onMapPointerUp, { once: true });
}

function onMapPointerMove(e) {
    if (!mapDrag) return;
    const { svg, g, node, start } = mapDrag;
    const p = svgPoint(svg, e);
    if (!mapDrag.moved && Math.hypot(p.x - start.x, p.y - start.y) < 4) return;
    mapDrag.moved = true;
    const { H, pos, levelAt } = mapGeometry();

    if (mapDrag.link) {
        // Shift: linea provvisoria dal nodo al puntatore
        const from = pos(node);
        const line = svg.querySelector('.link-preview');
        line.classList.remove('hidden');
        line.setAttribute('x1', from.x); line.setAttribute('y1', from.y);
        line.setAttribute('x2', p.x); line.setAttribute('y2', p.y);
        return;
    }

    // Posizione agganciata alla riga del livello più vicino (anche un livello nuovo in cima)
    mapDrag.x = Math.round(Math.max(20, Math.min(MAP_W - 20, p.x)));
    mapDrag.level = levelAt(p.y);
    const y = H - 40 - mapDrag.level * MAP_STEP_Y;
    g.classList.add('dragging');
    g.querySelector('circle').setAttribute('cx', mapDrag.x);
    g.querySelector('circle').setAttribute('cy', y);
    g.querySelector('text').setAttribute('x', mapDrag.x);
    g.querySelector('text').setAttribute('y', y + 4);
    // I collegamenti seguono il nodo
    svg.querySelectorAll(`line.edge[data-from="${node.id}"]`).forEach(l => { l.setAttribute('x1', mapDrag.x); l.setAttribute('y1', y); });
    svg.querySelectorAll(`line.edge[data-to="${node.id}"]`).forEach(l => { l.setAttribute('x2', mapDrag.x); l.setAttribute('y2', y); });
}

function onMapPointerUp(e) {
    if (!mapDrag) return;
    const drag = mapDrag;
    drag.svg.removeEventListener('pointermove', onMapPointerMove);
    mapDrag = null;
    const node = drag.node;

    if (!drag.moved) {
        if (mapLink) { finishMapLink(node.id); return; }
        selection.map = node.id;
        render();
        openNodeMenu(node.id, e.clientX, e.clientY);
        return;
    }

    if (drag.link) {
        // Rilascio sopra un altro nodo: aggiunge il collegamento, o lo toglie se c'era già
        const p = svgPoint(drag.svg, e);
        const { pos } = mapGeometry();
        const target = camp.mapNodes.find(n => { const q = pos(n); return Math.hypot(q.x - p.x, q.y - p.y) <= 20; });
        const targetId = target ? target.id : null;
        if (targetId != null && targetId !== node.id) {
            node.next = node.next || [];
            const i = node.next.indexOf(targetId);
            if (i >= 0) node.next.splice(i, 1); else node.next.push(targetId);
            node.next.sort((x, y) => x - y);
            selection.map = node.id;
            markDirty();
        }
        render();
        return;
    }

    if (node.x !== drag.x || node.level !== drag.level) {
        node.x = drag.x;
        node.level = drag.level;
        selection.map = node.id;
        markDirty();
    }
    render();
}

function selectNode(id) {
    selection.map = id;
    render();
}

function nextNodeId() {
    return camp.mapNodes.reduce((max, n) => Math.max(max, n.id), -1) + 1;
}

function addNode() {
    const node = addNodeAfterIn(camp, selection.map);
    selection.map = node.id;
    markDirty();
    render();
}

function duplicateNode() {
    const sel = camp.mapNodes.find(n => n.id === selection.map);
    const node = { ...deepCopy(sel), id: nextNodeId(), x: Math.min(780, sel.x + 60) };
    camp.mapNodes.push(node);
    selection.map = node.id;
    markDirty();
    render();
}

function deleteNode() {
    const id = selection.map;
    const node = camp.mapNodes.find(n => n.id === id);
    if (!node) return;
    const from = camp.mapNodes.filter(n => (n.next || []).includes(id));
    edConfirm({
        title: `Eliminare «${node.title || `nodo ${id}`}»?`,
        html: from.length || (node.next || []).length
            ? `<p>Si perdono i collegamenti${from.length ? ` da ${from.map(n => `«${esc(n.title || n.id)}»`).join(', ')}` : ''}${(node.next || []).length ? ` verso ${node.next.length === 1 ? '1 punto' : `${node.next.length} punti`}` : ''}.</p>`
            : '<p>Non è collegato a niente.</p>',
        ok: 'Elimina',
        danger: true
    }, () => {
        camp.mapNodes = camp.mapNodes.filter(n => n.id !== id);
        camp.mapNodes.forEach(n => { n.next = (n.next || []).filter(x => x !== id); });
        selection.map = null;
        markDirty();
        render();
        edToast(`Eliminato «${node.title || `nodo ${id}`}»`, true);
    });
}

// Riassegna gli id in ordine di livello e posizione (0, 1, 2, ...) aggiornando i collegamenti
function renumberNodes() {
    const sorted = [...camp.mapNodes].sort((a, b) => a.level - b.level || a.x - b.x);
    const map = new Map(sorted.map((n, i) => [n.id, i]));
    sorted.forEach(n => {
        n.id = map.get(n.id);
        n.next = (n.next || []).map(x => map.has(x) ? map.get(x) : x);
    });
    camp.mapNodes = sorted;
    selection.map = map.get(selection.map) ?? null;
    markDirty();
    render();
}

/* ---------- Mappa guidata: problemi dei nodi, menu del nodo, collegamenti con due clic ---------- */

// Nodi che si raggiungono da una partenza (active) seguendo i collegamenti
function reachableNodeIds(nodes) {
    const byId = new Map(nodes.map(n => [n.id, n]));
    const seen = new Set();
    const todo = nodes.filter(n => n.active).map(n => n.id);
    while (todo.length) {
        const id = todo.pop();
        if (seen.has(id) || !byId.has(id)) continue;
        seen.add(id);
        (byId.get(id).next || []).forEach(x => todo.push(x));
    }
    return seen;
}

// Cosa manca a un nodo, in parole semplici: errori (la partita non funziona) e consigli
function nodeProblems(node, c = camp) {
    const out = [];
    const err = msg => out.push({ livello: 'errore', msg });
    const tip = msg => out.push({ livello: 'consiglio', msg });
    const nodes = c.mapNodes || [];
    const ids = new Set(nodes.map(n => n.id));
    const maxLevel = Math.max(0, ...nodes.map(n => n.level || 0));
    if (node.type === 'combat' || node.type === 'elite') {
        if (!node.enemy) err('Scontro senza nemico: scegline uno');
        else if (!lib.bestiario[node.enemy]) err('Il nemico scelto non esiste più');
    }
    if (node.type === 'challenge' && !(node.challengeId && (c.challenges || {})[node.challengeId])) err('Prova non scelta');
    if (node.type === 'story' && node.storyId && !((c.stories || {})[node.storyId] || {}).text) tip('Testo della trama vuoto');
    if (!(node.next || []).length && (node.level || 0) < maxLevel) err('Senza uscita: la partita si fermerebbe qui');
    if ((node.next || []).some(x => !ids.has(x))) err('Porta a un punto che non esiste più');
    if (!reachableNodeIds(nodes).has(node.id)) err('Non si arriva qui dalla partenza');
    const enemyImage = node.enemy && lib.bestiario[node.enemy] && lib.bestiario[node.enemy].image;
    if (!node.image && !enemyImage && node.type !== 'story') tip('Senza immagine (si vedrà un disegno di riserva)');
    return out;
}

// Imposta il tipo di un nodo: icona, contenuto giusto per il tipo (quello degli altri tipi si toglie)
function applyNodeType(node, type) {
    node.type = type;
    node.icon = NODE_ICONS[type] || node.icon;
    Object.values(NODE_TYPES).forEach(t => { if (t.ref && t.ref !== NODE_TYPES[type].ref) delete node[t.ref]; });
    const ref = NODE_TYPES[type].ref;
    if (ref && node[ref] == null) node[ref] = ref === 'restId' || ref === 'merchantId' ? 'default' : '';
}

// Nuovo nodo al livello sopra quello dato, già collegato da lui (senza id: in fondo ai nodi)
function addNodeAfterIn(c, id) {
    const from = c.mapNodes.find(n => n.id === id);
    const level = from ? (from.level || 0) + 1 : 0;
    const taken = c.mapNodes.filter(n => n.level === level).map(n => n.x);
    let x = from ? from.x : 400;
    for (let step = 0; taken.some(t => Math.abs(t - x) < 50) && step < 16; step++) x = Math.max(40, Math.min(760, (from ? from.x : 400) + (step % 2 ? -1 : 1) * 60 * Math.ceil((step + 1) / 2)));
    const node = { id: c.mapNodes.reduce((m, n) => Math.max(m, n.id), -1) + 1, level, x, type: 'combat', enemy: '', title: 'Nuovo punto',
        icon: NODE_ICONS.combat, done: false, active: !from, next: [], image: '' };
    c.mapNodes.push(node);
    if (from) from.next = [...(from.next || []), node.id].sort((a, b) => a - b);
    return node;
}

function toggleNodeLinkIn(c, fromId, toId) {
    const from = c.mapNodes.find(n => n.id === fromId);
    if (!from || fromId === toId) return;
    const next = from.next || [];
    from.next = next.includes(toId) ? next.filter(x => x !== toId) : [...next, toId].sort((a, b) => a - b);
}

let mapLink = null;   // { from, mode: 'link' | 'unlink' } mentre si sceglie il nodo da collegare
function mapLinkCandidates() {
    if (!mapLink) return null;
    const from = camp.mapNodes.find(n => n.id === mapLink.from);
    if (!from) return null;
    const next = from.next || [];
    return new Set(camp.mapNodes.filter(n => mapLink.mode === 'unlink' ? next.includes(n.id)
        : n.id !== from.id && !next.includes(n.id) && (n.level || 0) > (from.level || 0)).map(n => n.id));
}
function nodeLinkStart(id, mode) {
    closeNodeMenu();
    mapLink = { from: id, mode };
    render();
}
function cancelMapLink() {
    mapLink = null;
    render();
}
function finishMapLink(toId) {
    const cand = mapLinkCandidates();
    const from = mapLink.from;
    mapLink = null;
    if (cand && cand.has(toId)) { toggleNodeLinkIn(camp, from, toId); selection.map = from; markDirty(); }
    render();
}
function nodeLinkFromForm(fromId, selectSel) {
    const sel = document.querySelector(selectSel);
    if (!sel || sel.value === '') return;
    toggleNodeLinkIn(camp, fromId, Number(sel.value));
    markDirty();
    render();
}
function nodeUnlinkFromForm(fromId, toId) {
    toggleNodeLinkIn(camp, fromId, toId);
    markDirty();
    render();
}

function nodeAddAfter(id) {
    closeNodeMenu();
    const node = addNodeAfterIn(camp, id);
    selection.map = node.id;
    markDirty();
    render();
}
function nodeSetType(id, type) {
    closeNodeMenu();
    const node = camp.mapNodes.find(n => n.id === id);
    if (!node) return;
    applyNodeType(node, type);
    selection.map = id;
    markDirty();
    render();
}
function nodeEdit(id) {
    closeNodeMenu();
    selection.map = id;
    render();
    const d = document.getElementById('edDetail');
    if (d) d.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function nodeDelete(id) {
    closeNodeMenu();
    selection.map = id;
    deleteNode();
}

// Menu accanto al nodo cliccato
function openNodeMenu(id, x, y) {
    closeNodeMenu();
    const node = camp.mapNodes.find(n => n.id === id);
    if (!node) return;
    const menu = document.createElement('div');
    menu.id = 'edNodeMenu';
    menu.className = 'ed-node-menu';
    menu.innerHTML = `<b>${esc(node.title || 'Punto della mappa')}</b>
        <button type="button" ${azione('nodeAddAfter', id)}>➕ Aggiungi un punto dopo questo</button>
        <button type="button" ${azione('nodeLinkStart', id, 'link')}>🔗 Collega a…</button>
        ${(node.next || []).length ? `<button type="button" ${azione('nodeLinkStart', id, 'unlink')}>✂ Scollega da…</button>` : ''}
        <span class="ed-node-menu-label">Cambia tipo</span>
        <div class="ed-node-types">${Object.entries(NODE_TYPES).map(([k, t]) => `<button type="button" class="${k === node.type ? 'on' : ''}" style="--c:${t.color}" title="${esc(t.label)}" ${azione('nodeSetType', id, k)}>${NODE_ICONS[k] || ''} ${esc(t.label)}</button>`).join('')}</div>
        <button type="button" ${azione('nodeEdit', id)}>✎ Modifica</button>
        <button type="button" class="ed-danger" ${azione('nodeDelete', id)}>Elimina</button>`;
    document.body.appendChild(menu);
    const w = menu.offsetWidth, h = menu.offsetHeight;
    menu.style.left = `${Math.max(8, Math.min(window.innerWidth - w - 8, x + 14))}px`;
    menu.style.top = `${Math.max(8, Math.min(window.innerHeight - h - 8, y - 20))}px`;
}
function closeNodeMenu() {
    const m = document.getElementById('edNodeMenu');
    if (m) m.remove();
}
document.addEventListener('pointerdown', e => {
    if (!e.target.closest('#edNodeMenu') && !e.target.closest('#edMap g.node')) closeNodeMenu();
});
document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    closeNodeMenu();
    if (mapLink) cancelMapLink();
});
