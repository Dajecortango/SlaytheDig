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
        return `id ${n.id} · livello ${n.level} · ${t}${what} → ${(n.next || []).join(', ') || 'fine'}`;
    };

    content.innerHTML = `
        <div class="ed-map-wrap">
            <div class="ed-map" id="edMap"></div>
            <div class="ed-legend">${Object.values(NODE_TYPES).map(t => `<span style="--c:${t.color}">${t.label}</span>`).join('')}
                <span style="--c:transparent; outline:2px solid var(--wc-yellow); border-radius:50%">partenza</span></div>
        </div>
        <div class="ed-list-actions">
            <button data-action="addNode">Aggiungi nodo</button>
            <button data-action="duplicateNode" ${sel ? '' : 'disabled'}>Duplica</button>
            <button data-action="renumberNodes">Rinumera id</button>
            <button class="ed-danger" data-action="deleteNode" ${sel ? '' : 'disabled'}>Elimina</button>
        </div>
        <div class="ed-split">
            <div class="ed-list">${sorted.map(n => `
                <div class="ed-list-item ${n.id === selection.map ? 'active' : ''}" ${azione('selectNode', n.id)}>
                    ${esc(n.icon || '')} ${esc(n.title || '(senza titolo)')}
                    <small>${esc(nodeSub(n))}</small>
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
            node.icon = NODE_ICONS[node.type] || node.icon;
            Object.values(NODE_TYPES).forEach(t => { if (t.ref && t.ref !== NODE_TYPES[node.type].ref) delete node[t.ref]; });
            const ref = NODE_TYPES[node.type].ref;
            if (ref && node[ref] == null) node[ref] = ref === 'restId' || ref === 'merchantId' ? 'default' : '';
            renderNodeForm(node);
        }
        if (key === 'enemy') renderNodeForm(node);
        if (key === 'id') selection.map = node.id;
        markDirty();
    });
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
    nodes.forEach(n => {
        const p = pos(n);
        const t = NODE_TYPES[n.type] || { color: '#777' };
        const enemyName = n.enemy && lib.bestiario[n.enemy] ? ` — ${lib.bestiario[n.enemy].name}` : '';
        svg += `<g class="node ${n.active ? 'active-node' : ''} ${n.id === selection.map ? 'selected' : ''}" data-id="${n.id}">
            <title>${esc(n.title)} (id ${n.id})${esc(enemyName)}</title>
            <circle cx="${p.x}" cy="${p.y}" r="16" fill="${t.color}"/>
            <text x="${p.x}" y="${p.y + 4}">${n.id}</text></g>`;
    });
    box.innerHTML = `<svg viewBox="0 0 ${MAP_W} ${H}" xmlns="http://www.w3.org/2000/svg">${svg}<line class="link-preview hidden" x1="0" y1="0" x2="0" y2="0"/></svg>
        <p class="ed-map-help">Trascina un nodo per spostarlo (in orizzontale e di livello). Shift + trascina da un nodo a un altro per creare o togliere il collegamento. Clic per selezionarlo.</p>`;
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

    if (!drag.moved) { selectNode(node.id); return; }

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
    const sel = camp.mapNodes.find(n => n.id === selection.map);
    const node = { id: nextNodeId(), level: sel ? sel.level + 1 : 0, x: 400, type: 'combat', enemy: '', title: 'Nuovo nodo', icon: NODE_ICONS.combat, done: false, active: !sel, next: [], image: '' };
    camp.mapNodes.push(node);
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
    if (!confirm(`Eliminare il nodo ${id}? Verrà tolto anche dai collegamenti degli altri nodi.`)) return;
    camp.mapNodes = camp.mapNodes.filter(n => n.id !== id);
    camp.mapNodes.forEach(n => { n.next = (n.next || []).filter(x => x !== id); });
    selection.map = null;
    markDirty();
    render();
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
