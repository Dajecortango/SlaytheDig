/* ==========================================================================
   EDITOR: RICERCA GLOBALE
   Casella "Cerca ovunque" nella barra delle schede: trova nomi e testi nella campagna aperta
   (nodi della mappa, sfide, trame, testi di mercanti, riposi e tesori) e in tutta la libreria
   (anche dentro descrizioni, effetti e fasi), e porta all'elemento con un clic.
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html,
   caricato prima di avvio.js. searchText e LIB_LABELS vengono da raccolte.js e progetto.js.
   ========================================================================== */

let searchResults = [];

// Tutto ciò che si può cercare: { label (tipo), name, text (dove cercare), go (dove portare) }
function searchIndex() {
    const out = [];
    const node = n => `${n.title || ''} ${n.type || ''} ${(lib.bestiario[n.enemy] || {}).name || ''}`;
    (camp.mapNodes || []).forEach(n => out.push({ label: 'Nodo', name: n.title || `Nodo ${n.id}`, text: node(n), go: () => { selection.map = n.id; switchTab('map'); } }));
    Object.entries(camp.challenges || {}).forEach(([k, c]) => out.push({ label: 'Sfida', name: c.title || k, text: `${k} ${JSON.stringify(c)}`,
        go: () => { selection.challenges = k; switchTab('challenges'); } }));
    Object.entries(camp.stories || {}).forEach(([k, s]) => {
        const n = (camp.mapNodes || []).find(x => x.storyId === k);
        out.push({ label: 'Trama', name: s.title || k, text: `${k} ${JSON.stringify(s)}`, go: () => { if (n) selection.map = n.id; switchTab(n ? 'map' : 'other'); } });
    });
    [['merchants', 'Mercante'], ['rests', 'Riposo'], ['treasures', 'Tesoro']].forEach(([key, label]) =>
        Object.entries(camp[key] || {}).forEach(([k, v]) => out.push({ label, name: k, text: `${k} ${v}`, go: () => switchTab('other') })));
    LIB_KINDS.forEach(kind => Object.entries(lib[kind] || {}).forEach(([k, el]) => out.push({
        label: LIB_LABELS[kind], name: el.name || el.title || k, text: `${k} ${JSON.stringify(el)}`,
        go: () => gotoLibrary(kind, k)
    })));
    return out;
}

// Prima chi ha il testo nel nome, poi chi lo ha solo nel contenuto; al massimo 40 risultati
function globalSearch(value) {
    const box = document.getElementById('edSearchResults');
    const q = searchText(value).trim();
    if (q.length < 2) { box.classList.add('hidden'); searchResults = []; return; }
    const all = searchIndex().map(r => ({ ...r, inName: searchText(r.name).includes(q), inText: searchText(r.text).includes(q) }))
        .filter(r => r.inName || r.inText);
    searchResults = [...all.filter(r => r.inName), ...all.filter(r => !r.inName)].slice(0, 40);
    box.innerHTML = searchResults.length
        ? searchResults.map((r, i) => `<button type="button" class="ed-search-hit" ${azione('gotoSearchResult', i)}><small>${esc(r.label)}</small> ${esc(r.name)}${r.inName ? '' : ' <em>(nel testo)</em>'}</button>`).join('')
        : '<p class="ed-help">Niente trovato.</p>';
    box.classList.remove('hidden');
}

function gotoSearchResult(i) {
    const r = searchResults[i];
    if (!r) return;
    document.getElementById('edSearchResults').classList.add('hidden');
    r.go();
}

// Clic fuori dalla ricerca o Esc: si chiudono i risultati
document.addEventListener('click', e => {
    if (!e.target.closest || e.target.closest('.ed-search')) return;
    const box = document.getElementById('edSearchResults');
    if (box) box.classList.add('hidden');
});
document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const box = document.getElementById('edSearchResults');
    if (box) box.classList.add('hidden');
});

/* ---------- Recenti e preferiti ----------
   Nella colonna a destra: gli ultimi 10 elementi modificati e quelli segnati con la stella (☆ accanto all'id).
   Voci { tab, key }: tab = scheda della raccolta (armeria, bestiario, elite, challenges...). Si ricordano nel
   browser (localStorage, solo per comodità: se non c'è, le liste restano vuote). */
const QUICK_KEYS = { recenti: 'dignitas_editor_recenti', preferiti: 'dignitas_editor_preferiti' };
function quickList(kind) {
    try { return JSON.parse(localStorage.getItem(QUICK_KEYS[kind]) || '[]'); } catch (e) { return []; }
}
function quickSave(kind, list) {
    try { localStorage.setItem(QUICK_KEYS[kind], JSON.stringify(list)); } catch (e) { /* senza archivio: niente liste */ }
}

// Elemento di una voce: per la scheda Elite il nemico del bestiario
function quickElement(tab, key) {
    if (tab === 'elite') return lib.bestiario[key];
    const col = COLLECTIONS[tab];
    return col ? (col.store() || {})[key] : null;
}

function quickName(tab, key) {
    const el = quickElement(tab, key);
    return el ? (el.name || el.title || key) : null;
}

function recordRecent(tab, key) {
    if (!key) return;
    const list = quickList('recenti').filter(r => !(r.tab === tab && r.key === key));
    list.unshift({ tab, key });
    quickSave('recenti', list.slice(0, 10));
    renderQuickNav();
}

const isFavourite = (tab, key) => quickList('preferiti').some(r => r.tab === tab && r.key === key);
const starHtml = (tab, key) => `<button type="button" class="ed-star ${isFavourite(tab, key) ? 'on' : ''}" title="Preferito" ${azione('toggleFavourite', tab, key)}>${isFavourite(tab, key) ? '★' : '☆'}</button>`;

function toggleFavourite(tab, key) {
    const list = quickList('preferiti');
    const i = list.findIndex(r => r.tab === tab && r.key === key);
    if (i > -1) list.splice(i, 1); else list.push({ tab, key });
    quickSave('preferiti', list);
    document.querySelectorAll('.ed-star').forEach(b => { b.classList.toggle('on', i < 0); b.textContent = i < 0 ? '★' : '☆'; });
    renderQuickNav();
}

function gotoQuick(tab, key) {
    selection[tab] = key;
    wizardOpen = null;
    switchTab(tab);
}

const QUICK_TAB_LABELS = { elite: 'Elite', challenges: 'Sfida' };
function renderQuickNav() {
    const box = document.getElementById('edQuickNav');
    if (!box) return;
    const section = (title, list) => {
        const rows = list.map(r => ({ ...r, name: quickName(r.tab, r.key) })).filter(r => r.name);
        if (!rows.length) return '';
        return `<h3 class="ed-quick-title">${title}</h3>${rows.map(r => `<a href="#" class="ed-quick" ${azione('gotoQuick', r.tab, r.key)}>
            <small>${esc(QUICK_TAB_LABELS[r.tab] || LIB_LABELS[r.tab] || r.tab)}</small> ${esc(r.name)}</a>`).join('')}`;
    };
    box.innerHTML = section('★ Preferiti', quickList('preferiti')) + section('Modificati di recente', quickList('recenti'));
}
