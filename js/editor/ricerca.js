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
