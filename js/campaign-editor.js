/* ==========================================================================
   EDITOR CAMPAGNE
   Crea/modifica campagne interamente in-browser (bozze in IndexedDB, immagini
   comprese) e le rende subito giocabili iniettandole in window.CAMPAIGNS,
   la stessa mappa letta da js/game.js. "Esporta" scrive i file reali
   (campaign.json + campaign.js + assets/) su disco, con fallback .zip nei
   browser senza File System Access API.
   Tutti gli identificatori di questo file usano il prefisso "editor" per non
   entrare in conflitto con le variabili globali di js/game.js (stesso scope).
   ========================================================================== */

/* ---------------------------------------------------------------- IndexedDB */
const EDITOR_DB_NAME = 'dignitas_editor';
const EDITOR_DB_VERSION = 2;
let editorDbPromise = null;

function editorOpenDb() {
    if (editorDbPromise) return editorDbPromise;
    editorDbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(EDITOR_DB_NAME, EDITOR_DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains('drafts')) db.createObjectStore('drafts', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('assets')) db.createObjectStore('assets', { keyPath: 'key' });
            if (!db.objectStoreNames.contains('handles')) db.createObjectStore('handles', { keyPath: 'key' });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
    return editorDbPromise;
}

async function editorDbGetHandle(key) {
    const db = await editorOpenDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('handles', 'readonly');
        const req = tx.objectStore('handles').get(key);
        req.onsuccess = () => resolve(req.result ? req.result.handle : null);
        req.onerror = () => reject(req.error);
    });
}

async function editorDbPutHandle(key, handle) {
    const db = await editorOpenDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('handles', 'readwrite');
        tx.objectStore('handles').put({ key, handle });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function editorDbGetAllDrafts() {
    const db = await editorOpenDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('drafts', 'readonly');
        const req = tx.objectStore('drafts').getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}

async function editorDbPutDraft(draft) {
    const db = await editorOpenDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('drafts', 'readwrite');
        tx.objectStore('drafts').put(draft);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function editorDbDeleteDraft(id) {
    const db = await editorOpenDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('drafts', 'readwrite');
        tx.objectStore('drafts').delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function editorDbPutAsset(key, blob) {
    const db = await editorOpenDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('assets', 'readwrite');
        tx.objectStore('assets').put({ key, blob });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function editorDbGetAssetsForDraft(id) {
    const db = await editorOpenDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('assets', 'readonly');
        const req = tx.objectStore('assets').getAll();
        req.onsuccess = () => resolve((req.result || []).filter(a => a.key.startsWith(id + '::')));
        req.onerror = () => reject(req.error);
    });
}

async function editorDbDeleteAssetsForDraft(id) {
    const assets = await editorDbGetAssetsForDraft(id);
    const db = await editorOpenDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('assets', 'readwrite');
        const store = tx.objectStore('assets');
        assets.forEach(a => store.delete(a.key));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

/* ---------------------------------------------------------------- Stato */
let editorDraftsList = [];      // [{id, title, badge}, ...] per la sidebar
let editorDraft = null;         // bozza attualmente aperta (schema identico a campaign.js)
let editorAssetCache = {};      // relPath -> {blob, url}  (per la bozza aperta)
let editorTab = 'info';

/* ---------------------------------------------------------------- Utility */
function editorSlug(str, existingIds) {
    let base = String(str || '').toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (!base) base = 'voce';
    let id = base, n = 2;
    const used = existingIds || [];
    while (used.includes(id)) { id = `${base}_${n++}`; }
    return id;
}

function editorNum(v, def) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : (def === undefined ? 0 : def);
}

function editorNewHero() {
    return { name: 'Nuovo Eroe', str: 3, int: 3, fth: 3, maxHp: 4, hp: 4, dmg: 1, base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, items: [], portrait: '' };
}

function editorNewAbility() { return { name: 'Nuova Abilità', type: 'passive_stat', stat: 'str', val: 1 }; }

function editorNewItem() { return { id: editorSlug('oggetto', []), name: 'Nuovo Oggetto', desc: '' }; }

function editorNewEnemy() { return { name: 'Nuovo Nemico', hp: 6, maxHp: 6, att: 6, dmg: 1, ca: 6, desc: '' }; }

function editorNewChallenge() {
    return {
        title: 'Nuova Sfida', desc: '', ignoreText: '', successText: '', failText: '',
        stat: 'int', cd: 7, reward: null, punishment: null
    };
}

function editorNewDraft() {
    const heroNames = ['Eroe Uno', 'Eroe Due', 'Eroe Tre'];
    return {
        id: '', title: 'Nuova Campagna', badge: 'Nuova Campagna', description: '', coverImage: '', introText: '',
        heroes: heroNames.map(n => Object.assign(editorNewHero(), { name: n })),
        abilities: Object.fromEntries(heroNames.map(n => [n, [editorNewAbility(), editorNewAbility()]])),
        initialArmory: [],
        enemies: {},
        challenges: {},
        merchants: { default: '' },
        rests: { default: '' },
        treasures: { default: '' },
        lootItems: [],
        mapNodes: []
    };
}

function editorCloneDraft(d) { return JSON.parse(JSON.stringify(d)); }

/* ---------------------------------------------------------------- Apertura / selezione bozze */
async function openCampaignEditor() {
    editorDraftsList = await editorDbGetAllDrafts();
    if (!editorDraft && editorDraftsList.length > 0) {
        await editorLoadDraft(editorDraftsList[0].id);
    } else if (!editorDraft) {
        editorDraft = editorNewDraft();
        editorAssetCache = {};
    }
    editorTab = 'info';
    showScreen('screenCampaignEditor');
    editorRender();
}

async function editorLoadDraft(id) {
    const rows = await editorDbGetAllDrafts();
    const found = rows.find(r => r.id === id);
    if (!found) return;
    editorDraft = editorCloneDraft(found);
    Object.values(editorAssetCache).forEach(a => { if (a.url) URL.revokeObjectURL(a.url); });
    editorAssetCache = {};
    const assets = await editorDbGetAssetsForDraft(id);
    assets.forEach(a => {
        const relPath = a.key.slice((id + '::').length);
        editorAssetCache[relPath] = { blob: a.blob, url: URL.createObjectURL(a.blob) };
    });
    editorTab = 'info';
}

function editorCreateNewDraft() {
    editorDraft = editorNewDraft();
    Object.values(editorAssetCache).forEach(a => { if (a.url) URL.revokeObjectURL(a.url); });
    editorAssetCache = {};
    editorTab = 'info';
    editorRender();
}

function editorDeleteDraft(id) {
    openModal('Elimina campagna', `<p>Eliminare definitivamente questa bozza e le sue immagini? L'azione non è reversibile.</p>`, [
        { label: 'Annulla' },
        {
            label: 'Elimina', className: 'btn-danger', onClick: async () => {
                await editorDbDeleteDraft(id);
                await editorDbDeleteAssetsForDraft(id);
                if (window.CAMPAIGNS) delete window.CAMPAIGNS[id];
                if (editorDraft && editorDraft.id === id) { editorDraft = null; }
                editorDraftsList = await editorDbGetAllDrafts();
                if (!editorDraft) {
                    if (editorDraftsList.length > 0) await editorLoadDraft(editorDraftsList[0].id);
                    else { editorDraft = editorNewDraft(); editorAssetCache = {}; }
                }
                editorRender();
            }
        }
    ]);
}

/* ---------------------------------------------------------------- Salvataggio + aggancio al motore */
function editorValidate(d) {
    const warn = [];
    if (!d.title.trim()) warn.push('Manca il titolo della campagna.');
    if (d.heroes.length < 3) warn.push('Servono almeno 3 eroi (il party può arrivare fino a 5).');
    if (d.initialArmory.length === 0) warn.push('Armeria iniziale vuota: senza almeno un oggetto la creazione del party si blocca (il pulsante "Conferma Eroe" resta disabilitato finché non se ne sceglie uno).');
    if (Object.keys(d.enemies).length === 0) warn.push('Nessun nemico definito.');
    if (d.mapNodes.length === 0) warn.push('La mappa è vuota: aggiungi almeno un nodo nel Livello 1.');
    else if (!d.mapNodes.some(n => n.level === 0)) warn.push('Nessun nodo al Livello 1: la spedizione non avrebbe un punto di partenza.');
    d.mapNodes.forEach(n => {
        if (n.type === 'combat' || n.type === 'elite') { if (!n.enemy || !d.enemies[n.enemy]) warn.push(`Nodo "${n.title}": nemico non impostato.`); }
        if (n.type === 'challenge') { if (!n.challengeId || !d.challenges[n.challengeId]) warn.push(`Nodo "${n.title}": sfida non impostata.`); }
    });
    return warn;
}

/* ---------------------------------------------------------------- Cartella campagne/ ricordata */
// Ricordiamo l'handle della cartella campagne/ (File System Access API) in IndexedDB così, dopo
// il primo permesso concesso dall'utente, i salvataggi successivi scrivono su disco senza
// riproporre il selettore ogni volta.
const EDITOR_CAMPAGNE_HANDLE_KEY = 'campagneDir';

async function editorGetCampagneDirHandle(promptIfMissing) {
    if (!window.showDirectoryPicker) return null;
    let handle = await editorDbGetHandle(EDITOR_CAMPAGNE_HANDLE_KEY);
    if (handle) {
        try {
            let perm = await handle.queryPermission({ mode: 'readwrite' });
            if (perm !== 'granted' && promptIfMissing) perm = await handle.requestPermission({ mode: 'readwrite' });
            if (perm === 'granted') return handle;
        } catch (e) { /* handle non più valido: si ripassa sotto per chiederne uno nuovo */ }
    }
    if (!promptIfMissing) return null;
    try {
        handle = await window.showDirectoryPicker({ id: 'dignitas-campagne' });
    } catch (e) {
        return null; // utente ha annullato il selettore
    }
    await editorDbPutHandle(EDITOR_CAMPAGNE_HANDLE_KEY, handle);
    return handle;
}

function editorForgetCampagneDir() {
    editorDbPutHandle(EDITOR_CAMPAGNE_HANDLE_KEY, null).then(() => editorRenderTabPanel());
}

async function editorWriteFile(dirHandle, name, data) {
    const fh = await dirHandle.getFileHandle(name, { create: true });
    const w = await fh.createWritable();
    await w.write(data);
    await w.close();
}

// Scrive campaign.json + campaign.js + assets/ dentro dirHandle/<draft.id>/. Usata sia dal
// salvataggio automatico sia dall'esportazione esplicita.
async function editorWriteCampaignToDir(dirHandle, draft) {
    const jsonText = JSON.stringify(draft, null, 2);
    const jsText = editorBuildCampaignJsText(draft);
    const assetFiles = editorCollectAssetFiles(draft);

    const campDir = await dirHandle.getDirectoryHandle(draft.id, { create: true });
    await editorWriteFile(campDir, 'campaign.json', jsonText);
    await editorWriteFile(campDir, 'campaign.js', jsText);
    const assetsDir = await campDir.getDirectoryHandle('assets', { create: true });
    for (const relPath in assetFiles) {
        const filename = relPath.split('/').pop();
        await editorWriteFile(assetsDir, filename, assetFiles[relPath]);
    }
}

async function editorSaveDraft(showConfirm) {
    if (!editorDraft.id) {
        const existing = (await editorDbGetAllDrafts()).map(r => r.id).concat(Object.keys(campaignsDatabase || {}));
        editorDraft.id = editorSlug(editorDraft.title, existing);
    }
    for (const path in editorAssetCache) {
        const entry = editorAssetCache[path];
        if (entry.blob) await editorDbPutAsset(editorDraft.id + '::' + path, entry.blob);
    }
    await editorDbPutDraft(editorCloneDraft(editorDraft));
    editorHydrateIntoCampaigns(editorDraft);
    editorDraftsList = await editorDbGetAllDrafts();

    let diskStatus = null; // null = non tentato, true = scritta, false = fallita/rifiutata
    const dirHandle = await editorGetCampagneDirHandle(true);
    if (dirHandle) {
        try {
            await editorWriteCampaignToDir(dirHandle, editorCloneDraft(editorDraft));
            diskStatus = true;
        } catch (e) { diskStatus = false; }
    } else if (window.showDirectoryPicker) {
        diskStatus = false; // API disponibile ma l'utente non ha scelto/concesso la cartella
    }

    if (showConfirm) {
        const warnings = editorValidate(editorDraft);
        const warnHtml = warnings.length ? `<p style="color:var(--curse-color);"><strong>Attenzione:</strong></p><ul style="text-align:left;">${warnings.map(w => `<li>${esc(w)}</li>`).join('')}</ul>` : '<p>Nessun problema rilevato.</p>';
        let diskMsg;
        if (diskStatus === true) diskMsg = `<p>Scritta anche su disco in <code>campagne/${esc(editorDraft.id)}/</code>.</p>`;
        else if (diskStatus === false) diskMsg = `<p style="color:var(--curse-color);">Non è stato possibile scrivere su disco (cartella non selezionata o permesso negato) — usa "Esporta" nella scheda omonima per riprovare o scaricare uno .zip.</p>`;
        else diskMsg = `<p>Il tuo browser non supporta la scrittura diretta su disco: usa "Esporta" per scaricare uno .zip.</p>`;
        openModal('Bozza salvata', `<p>La campagna "${esc(editorDraft.title)}" è salvata e già selezionabile in "Nuova Partita".</p>${diskMsg}${warnHtml}`, [{ label: 'OK' }]);
    }
    editorRender();
}

function editorHydrateIntoCampaigns(draft) {
    const hydrated = editorCloneDraft(draft);
    const resolveImg = (p) => (p && editorAssetCache[p] && editorAssetCache[p].url) ? editorAssetCache[p].url : p;
    hydrated.coverImage = resolveImg(hydrated.coverImage);
    (hydrated.mapNodes || []).forEach(n => { if (n.image) n.image = resolveImg(n.image); });
    (hydrated.heroes || []).forEach(h => { if (h.portrait) h.portrait = resolveImg(h.portrait); });
    window.CAMPAIGNS = window.CAMPAIGNS || {};
    window.CAMPAIGNS[draft.id] = hydrated;
    if (typeof registerCampaignHeroPortraits === 'function') registerCampaignHeroPortraits(hydrated.heroes);
}

// Ricarica tutte le bozze salvate (con le loro immagini) in window.CAMPAIGNS all'avvio,
// così restano giocabili anche dopo un ricaricamento della pagina.
async function editorHydrateAllOnStartup() {
    try {
        const rows = await editorDbGetAllDrafts();
        for (const row of rows) {
            const assets = await editorDbGetAssetsForDraft(row.id);
            const cache = {};
            assets.forEach(a => { cache[a.key.slice((row.id + '::').length)] = { url: URL.createObjectURL(a.blob) }; });
            const hydrated = editorCloneDraft(row);
            const resolveImg = (p) => (p && cache[p]) ? cache[p].url : p;
            hydrated.coverImage = resolveImg(hydrated.coverImage);
            (hydrated.mapNodes || []).forEach(n => { if (n.image) n.image = resolveImg(n.image); });
            (hydrated.heroes || []).forEach(h => { if (h.portrait) h.portrait = resolveImg(h.portrait); });
            window.CAMPAIGNS = window.CAMPAIGNS || {};
            window.CAMPAIGNS[row.id] = hydrated;
            if (typeof registerCampaignHeroPortraits === 'function') registerCampaignHeroPortraits(hydrated.heroes);
        }
    } catch (e) { /* IndexedDB non disponibile: si prosegue solo con le campagne ufficiali */ }
}
document.addEventListener('DOMContentLoaded', editorHydrateAllOnStartup);

/* ---------------------------------------------------------------- Immagini */
// L'<input type="file"> è dentro una <label>: il click sulla tile apre già il
// selettore nativo, qui reagiamo solo al file scelto (oninput/onchange).
function editorFilePicked(inputEl, onPicked) {
    const file = inputEl.files[0];
    if (!file) return;
    onPicked(file);
    inputEl.value = '';
}

function editorAssetPathFor(filename) {
    const clean = String(filename).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9.]+/g, '_');
    return `campagne/${editorDraft.id || '_bozza'}/assets/${clean}`;
}

function editorSetCoverImage(file) {
    const path = editorAssetPathFor(file.name);
    if (editorAssetCache[path] && editorAssetCache[path].url) URL.revokeObjectURL(editorAssetCache[path].url);
    editorAssetCache[path] = { blob: file, url: URL.createObjectURL(file) };
    editorDraft.coverImage = path;
    editorRenderTabPanel();
}
function editorClearCoverImage() { editorDraft.coverImage = ''; editorRenderTabPanel(); }

function editorSetNodeImage(nodeId, file) {
    const path = editorAssetPathFor(file.name);
    if (editorAssetCache[path] && editorAssetCache[path].url) URL.revokeObjectURL(editorAssetCache[path].url);
    editorAssetCache[path] = { blob: file, url: URL.createObjectURL(file) };
    const node = editorDraft.mapNodes.find(n => n.id === nodeId);
    if (node) node.image = path;
    editorRenderTabPanel();
}
function editorClearNodeImage(nodeId) {
    const node = editorDraft.mapNodes.find(n => n.id === nodeId);
    if (node) node.image = '';
    editorRenderTabPanel();
}

function editorImgSrc(relPath) {
    if (!relPath) return '';
    if (editorAssetCache[relPath]) return editorAssetCache[relPath].url;
    return relPath;
}

/* ---------------------------------------------------------------- Render principale */
function editorRender() {
    const root = document.getElementById('editorRoot');
    if (!editorDraft) { root.innerHTML = ''; return; }
    root.innerHTML = `
        <div class="editor-split">
            <div class="editor-layout">
                <div class="editor-sidebar">
                    <h3>Campagne (bozze)</h3>
                    <div id="editorDraftList"></div>
                    <button class="btn-block" onclick="editorCreateNewDraft()">+ Nuova Campagna</button>
                </div>
                <div class="editor-main">
                    <div class="editor-tabs" id="editorTabs"></div>
                    <div id="editorTabPanel"></div>
                    <div class="editor-toolbar">
                        <button class="btn-proceed" onclick="editorSaveDraft(true)">Salva Bozza (giocabile subito)</button>
                        <button onclick="editorPlaytest()">Vai a "Nuova Partita"</button>
                        <button onclick="showScreen('screenStart')">Chiudi Editor</button>
                    </div>
                </div>
            </div>
            <div class="editor-graph-panel">
                <h3>Mappa della spedizione</h3>
                <p class="editor-graph-hint">Stessa mappa vista in partita: si popola man mano che aggiungi nodi nella scheda "Mappa".</p>
                <div class="sts-map-wrapper" id="editorMapWrapper">
                    <div class="sts-map-nodes" id="editorMapNodesContainer">
                        <svg class="sts-map-svg" id="editorMapSvg"></svg>
                    </div>
                </div>
                <div class="map-legend" id="editorMapLegend"></div>
            </div>
        </div>`;
    editorRenderSidebar();
    editorRenderTabs();
    editorRenderTabPanel();
    editorRenderStsMapPreview();
}

function editorRenderSidebar() {
    const box = document.getElementById('editorDraftList');
    if (editorDraftsList.length === 0) {
        box.innerHTML = `<p class="editor-hint">Nessuna bozza salvata ancora.</p>`;
        return;
    }
    box.innerHTML = editorDraftsList.map(d => `
        <div class="editor-draft-item ${editorDraft && editorDraft.id === d.id ? 'is-active' : ''}" onclick="editorLoadDraft('${esc(d.id)}').then(editorRender)">
            <span>${esc(d.title || d.id)}</span>
            <span class="del-x" onclick="event.stopPropagation(); editorDeleteDraft('${esc(d.id)}')" title="Elimina">✕</span>
        </div>`).join('');
}

const EDITOR_TABS = [
    ['info', 'Info'], ['heroes', 'Eroi'], ['armory', 'Armeria'], ['map', 'Grafo'], ['export', 'Esporta']
];

function editorRenderTabs() {
    document.getElementById('editorTabs').innerHTML = EDITOR_TABS.map(([key, label]) => `
        <button class="editor-tab-btn ${editorTab === key ? 'is-active' : ''}" onclick="editorSwitchTab('${key}')">${label}</button>
    `).join('');
}

function editorSwitchTab(key) { editorTab = key; editorRenderTabs(); editorRenderTabPanel(); }

function editorRenderTabPanel() {
    const panel = document.getElementById('editorTabPanel');
    switch (editorTab) {
        case 'info': panel.innerHTML = editorTplInfo(); break;
        case 'heroes': editorRenderHeroes(panel); break;
        case 'armory': editorRenderArmory(panel); break;
        case 'map': editorRenderMap(panel); break;
        case 'export': editorRenderExport(panel); break;
    }
    editorRenderStsMapPreview();
}

function editorPlaytest() { showScreen('screenStart'); goToCampaigns(); }

/* ---------------------------------------------------------------- Tab: Info */
function editorTplInfo() {
    const d = editorDraft;
    return `
        <div class="editor-form-row"><label>Titolo</label><input type="text" value="${esc(d.title)}" oninput="editorDraft.title=this.value"></div>
        <div class="editor-form-row"><label>Badge (etichetta breve nel carosello)</label><input type="text" value="${esc(d.badge)}" oninput="editorDraft.badge=this.value"></div>
        <div class="editor-form-row"><label>Descrizione (scheda campagna)</label><textarea oninput="editorDraft.description=this.value">${esc(d.description)}</textarea></div>
        <div class="editor-form-row"><label>Testo introduttivo (prima della mappa)</label><textarea oninput="editorDraft.introText=this.value" style="min-height:100px;">${esc(d.introText)}</textarea></div>
        <div class="editor-form-row">
            <label>Immagine di copertina</label>
            ${editorImageTileHtml(d.coverImage, 'editorSetCoverImage', 'editorClearCoverImage')}
        </div>
        <p class="editor-hint">L'ID interno della campagna (usato nei salvataggi) viene generato dal titolo al primo salvataggio e poi resta fisso.${d.id ? ` ID attuale: <code>${esc(d.id)}</code>` : ''}</p>
    `;
}

function editorImageTileHtml(path, onPickedFn, onClearFn, extraArg) {
    const src = editorImgSrc(path);
    const argStr = extraArg !== undefined ? `${extraArg},` : '';
    return `
        <label class="editor-image-tile">
            ${src ? `<img src="${src}" alt="">` : 'Clicca per caricare un\'immagine'}
            <input type="file" accept="image/*" onchange="editorFilePicked(this, f => ${onPickedFn}(${argStr}f))">
        </label>
        ${path ? `<div><button class="btn-small" onclick="${onClearFn}(${extraArg !== undefined ? extraArg : ''})">Rimuovi immagine</button></div>` : ''}
    `;
}

/* ---------------------------------------------------------------- Tab: Eroi */
let editorHeroCreateOpen = false;
let editorHeroCreateDraft = null; // { hero, abilities: [a, a] } mentre si compila "+ Aggiungi Nuovo Eroe"

function editorHeroHue(idx) { return (idx * 67) % 360; }

function editorHeroPortraitInner(hero) {
    if (!hero.portrait) return `<span>${esc((hero.name || '?').charAt(0))}</span>`;
    return `<img class="portrait-img" src="${editorImgSrc(hero.portrait)}" alt="${esc(hero.name)}" style="object-position:50% 38%; transform:scale(1.5); transform-origin:50% 38%;">`;
}

function editorToggleHeroCreate() {
    editorHeroCreateOpen = !editorHeroCreateOpen;
    editorHeroCreateDraft = editorHeroCreateOpen ? { hero: editorNewHero(), abilities: [editorNewAbility(), editorNewAbility()] } : null;
    editorRenderTabPanel();
}

function editorSetHeroCreatePortrait(file) {
    const path = editorAssetPathFor(file.name);
    if (editorAssetCache[path] && editorAssetCache[path].url) URL.revokeObjectURL(editorAssetCache[path].url);
    editorAssetCache[path] = { blob: file, url: URL.createObjectURL(file) };
    editorHeroCreateDraft.hero.portrait = path;
    editorRenderTabPanel();
}
function editorClearHeroCreatePortrait() { editorHeroCreateDraft.hero.portrait = ''; editorRenderTabPanel(); }

function editorHeroCreateBoxHtml() {
    const hero = editorHeroCreateDraft.hero;
    const abilities = editorHeroCreateDraft.abilities;
    return `
        <div class="editor-list-card">
            <div class="editor-form-row"><label>Nome</label><input type="text" value="${esc(hero.name)}" oninput="editorHeroCreateDraft.hero.name=this.value"></div>
            <div class="editor-form-grid">
                <div class="editor-form-row"><label>Forza</label><input type="number" value="${hero.str}" oninput="editorHeroCreateDraft.hero.str=editorNum(this.value)"></div>
                <div class="editor-form-row"><label>Intelligenza</label><input type="number" value="${hero.int}" oninput="editorHeroCreateDraft.hero.int=editorNum(this.value)"></div>
                <div class="editor-form-row"><label>Fede</label><input type="number" value="${hero.fth}" oninput="editorHeroCreateDraft.hero.fth=editorNum(this.value)"></div>
                <div class="editor-form-row"><label>HP Max</label><input type="number" value="${hero.maxHp}" oninput="editorHeroCreateDraft.hero.maxHp=editorHeroCreateDraft.hero.hp=editorNum(this.value,4)"></div>
                <div class="editor-form-row"><label>Danno</label><input type="number" value="${hero.dmg}" oninput="editorHeroCreateDraft.hero.dmg=editorNum(this.value,1)"></div>
            </div>
            <div class="editor-form-row"><label>Ritratto (opzionale)</label>
                ${editorImageTileHtml(hero.portrait, 'editorSetHeroCreatePortrait', 'editorClearHeroCreatePortrait')}
            </div>
            <div class="editor-section-title" style="font-size:0.78rem;">Abilità</div>
            ${abilities.map((ab, aidx) => `
                <div class="editor-form-grid" style="margin-bottom:6px;">
                    <div class="editor-form-row"><label>Nome abilità</label><input type="text" value="${esc(ab.name)}" oninput="editorHeroCreateDraft.abilities[${aidx}].name=this.value"></div>
                    <div class="editor-form-row"><label>Statistica</label>
                        <select onchange="editorHeroCreateDraft.abilities[${aidx}].stat=this.value">
                            ${['str', 'int', 'fth', 'hp', 'dmg'].map(s => `<option value="${s}" ${ab.stat === s ? 'selected' : ''}>${s.toUpperCase()}</option>`).join('')}
                        </select>
                    </div>
                    <div class="editor-form-row"><label>Valore (+)</label><input type="number" value="${ab.val}" oninput="editorHeroCreateDraft.abilities[${aidx}].val=editorNum(this.value,1)"></div>
                </div>
            `).join('')}
            <button class="btn-proceed" onclick="editorConfirmCreateHero()">Crea Eroe</button>
        </div>
    `;
}

function editorConfirmCreateHero() {
    const hero = editorHeroCreateDraft.hero;
    if (!hero.name.trim()) hero.name = 'Nuovo Eroe';
    const existingNames = editorDraft.heroes.map(h => h.name);
    if (existingNames.includes(hero.name)) {
        let n = 2;
        while (existingNames.includes(`${hero.name} (${n})`)) n++;
        hero.name = `${hero.name} (${n})`;
    }
    editorDraft.heroes.push(hero);
    editorDraft.abilities[hero.name] = editorHeroCreateDraft.abilities;
    editorHeroCreateOpen = false;
    editorHeroCreateDraft = null;
    editorRenderTabPanel();
}

function editorRenderHeroes(panel) {
    const d = editorDraft;
    panel.innerHTML = `
        <p class="editor-hint">Da 3 a 5 eroi, ognuno con 2 abilità (bonus permanente a una statistica) scelte alla creazione del party. Clicca un eroe per vederne o modificarne i dettagli.</p>
        <button class="editor-add-btn" onclick="editorToggleHeroCreate()" ${d.heroes.length >= 5 && !editorHeroCreateOpen ? 'disabled' : ''}>${editorHeroCreateOpen ? 'Annulla Creazione' : '+ Aggiungi Nuovo Eroe'}</button>
        <div id="editorHeroCreateBox">${editorHeroCreateOpen ? editorHeroCreateBoxHtml() : ''}</div>
        <div class="armory-grid" id="editorHeroGallery">
            ${d.heroes.map((h, idx) => `
                <button class="armory-btn" onclick="editorOpenHeroModal(${idx})">
                    <span class="hero-portrait small ${h.portrait ? 'has-portrait' : ''}" style="--hue:${editorHeroHue(idx)}">${editorHeroPortraitInner(h)}</span>
                    <span class="tile-text"><strong>${esc(h.name)}</strong><span class="tile-sub">FOR ${h.str} · INT ${h.int} · FED ${h.fth} · HP ${h.maxHp}</span></span>
                </button>
            `).join('') || '<p class="editor-hint">Nessun eroe ancora creato.</p>'}
        </div>
    `;
}

function editorSetHeroAbilityField(heroIdx, abIdx, field, value) {
    const hero = editorDraft.heroes[heroIdx];
    const abs = editorDraft.abilities[hero.name];
    if (abs && abs[abIdx]) abs[abIdx][field] = value;
}

function editorSetHeroModalPortrait(idx, file) {
    const path = editorAssetPathFor(file.name);
    if (editorAssetCache[path] && editorAssetCache[path].url) URL.revokeObjectURL(editorAssetCache[path].url);
    editorAssetCache[path] = { blob: file, url: URL.createObjectURL(file) };
    editorDraft.heroes[idx].portrait = path;
    editorOpenHeroModal(idx);
}
function editorClearHeroModalPortrait(idx) { editorDraft.heroes[idx].portrait = ''; editorOpenHeroModal(idx); }

function editorOpenHeroModal(idx) {
    const h = editorDraft.heroes[idx];
    const abilities = editorDraft.abilities[h.name] || [];
    const body = `
        <div class="editor-form-row"><label>Nome</label><input type="text" value="${esc(h.name)}" oninput="editorSetHeroName(${idx}, this.value)"></div>
        <div class="editor-form-grid">
            <div class="editor-form-row"><label>Forza</label><input type="number" value="${h.str}" oninput="editorDraft.heroes[${idx}].str=editorNum(this.value)"></div>
            <div class="editor-form-row"><label>Intelligenza</label><input type="number" value="${h.int}" oninput="editorDraft.heroes[${idx}].int=editorNum(this.value)"></div>
            <div class="editor-form-row"><label>Fede</label><input type="number" value="${h.fth}" oninput="editorDraft.heroes[${idx}].fth=editorNum(this.value)"></div>
            <div class="editor-form-row"><label>HP Max</label><input type="number" value="${h.maxHp}" oninput="editorSetHeroHp(${idx}, this.value)"></div>
            <div class="editor-form-row"><label>Danno</label><input type="number" value="${h.dmg}" oninput="editorDraft.heroes[${idx}].dmg=editorNum(this.value)"></div>
        </div>
        <div class="editor-form-row"><label>Ritratto</label>
            <label class="editor-image-tile">
                ${h.portrait ? `<img src="${editorImgSrc(h.portrait)}" alt="">` : 'Clicca per caricare un\'immagine'}
                <input type="file" accept="image/*" onchange="editorFilePicked(this, f => editorSetHeroModalPortrait(${idx}, f))">
            </label>
            ${h.portrait ? `<div><button class="btn-small" onclick="editorClearHeroModalPortrait(${idx})">Rimuovi ritratto</button></div>` : ''}
        </div>
        <div class="editor-section-title" style="font-size:0.78rem;">Abilità</div>
        ${abilities.map((ab, aidx) => `
            <div class="editor-form-grid" style="margin-bottom:6px;">
                <div class="editor-form-row"><label>Nome abilità</label><input type="text" value="${esc(ab.name)}" oninput="editorSetHeroAbilityField(${idx}, ${aidx}, 'name', this.value)"></div>
                <div class="editor-form-row"><label>Statistica</label>
                    <select onchange="editorSetHeroAbilityField(${idx}, ${aidx}, 'stat', this.value)">
                        ${['str', 'int', 'fth', 'hp', 'dmg'].map(s => `<option value="${s}" ${ab.stat === s ? 'selected' : ''}>${s.toUpperCase()}</option>`).join('')}
                    </select>
                </div>
                <div class="editor-form-row"><label>Valore (+)</label><input type="number" value="${ab.val}" oninput="editorSetHeroAbilityField(${idx}, ${aidx}, 'val', editorNum(this.value,1))"></div>
            </div>
        `).join('')}
    `;
    openModal(`Eroe: ${esc(h.name)}`, body, [
        { label: 'Rimuovi Eroe', className: 'btn-danger', disabled: editorDraft.heroes.length <= 3, onClick: () => editorRemoveHero(idx) },
        { label: 'Chiudi', onClick: () => editorRenderTabPanel() }
    ]);
}

function editorRemoveHero(idx) {
    const h = editorDraft.heroes[idx];
    delete editorDraft.abilities[h.name];
    editorDraft.heroes.splice(idx, 1);
    editorRenderTabPanel();
}
function editorSetHeroName(idx, name) {
    const old = editorDraft.heroes[idx].name;
    editorDraft.heroes[idx].name = name;
    if (editorDraft.abilities[old] && old !== name) {
        editorDraft.abilities[name] = editorDraft.abilities[old];
        delete editorDraft.abilities[old];
    }
}
function editorSetHeroHp(idx, val) {
    const n = editorNum(val, 4);
    editorDraft.heroes[idx].maxHp = n;
    editorDraft.heroes[idx].hp = n;
}

/* ---------------------------------------------------------------- Tab: Armeria (+ bottino) */
function editorItemFieldsHtml(item, pathPrefix, refreshCall) {
    refreshCall = refreshCall || 'editorRenderTabPanel()';
    return `
        <div class="editor-form-row"><label>Nome</label><input type="text" value="${esc(item.name)}" oninput="${pathPrefix}.name=this.value"></div>
        <div class="editor-form-row"><label>Descrizione (mostrata al giocatore)</label><input type="text" value="${esc(item.desc || '')}" oninput="${pathPrefix}.desc=this.value"></div>
        <div class="editor-form-grid">
            ${['str', 'dmg', 'armor', 'fth', 'int', 'help_bonus_val', 'att_penalty', 'def_bonus'].map(f => `
                <div class="editor-form-row"><label>${f}</label><input type="number" value="${item[f] || 0}" oninput="${pathPrefix}.${f}=editorNum(this.value)||undefined"></div>
            `).join('')}
        </div>
        <div class="editor-form-row"><label>Consumabile</label>
            <select onchange="${pathPrefix}.type=this.value||undefined; ${refreshCall};">
                <option value="" ${!item.type ? 'selected' : ''}>No (equipaggiamento permanente)</option>
                <option value="consumable_heal" ${item.type === 'consumable_heal' ? 'selected' : ''}>Sì — cura HP (usa heal_val sotto)</option>
                <option value="consumable_full" ${item.type === 'consumable_full' ? 'selected' : ''}>Sì — cura tutti gli HP</option>
            </select>
        </div>
        ${item.type === 'consumable_heal' ? `<div class="editor-form-row"><label>HP curati</label><input type="number" value="${item.heal_val || 0}" oninput="${pathPrefix}.heal_val=editorNum(this.value)"></div>` : ''}
    `;
}

let editorItemCreateOpen = { initialArmory: false, lootItems: false };
let editorItemCreateDraft = { initialArmory: null, lootItems: null };

function editorToggleItemCreate(key) {
    editorItemCreateOpen[key] = !editorItemCreateOpen[key];
    editorItemCreateDraft[key] = editorItemCreateOpen[key] ? editorNewItem() : null;
    editorRenderTabPanel();
}

function editorConfirmCreateItem(key) {
    const item = editorItemCreateDraft[key];
    if (!item.name.trim()) item.name = 'Nuovo Oggetto';
    item.id = editorSlug(item.name, editorDraft[key].map(x => x.id));
    editorDraft[key].push(item);
    editorItemCreateOpen[key] = false;
    editorItemCreateDraft[key] = null;
    editorRenderTabPanel();
}

function editorItemGalleryHtml(key) {
    const arr = editorDraft[key];
    if (!arr.length) return `<p class="editor-hint">Nessun oggetto.</p>`;
    return `<div class="armory-grid">${arr.map((item, idx) => `
        <button class="armory-btn" onclick="editorOpenItemModal('${key}', ${idx})">
            ${itemIconHtml(item)}
            <span class="tile-text"><strong>${esc(item.name)}</strong><span class="tile-sub">${esc(item.desc || '')}</span></span>
        </button>
    `).join('')}</div>`;
}

function editorOpenItemModal(key, idx) {
    const item = editorDraft[key][idx];
    const body = editorItemFieldsHtml(item, `editorDraft.${key}[${idx}]`, `editorOpenItemModal('${key}',${idx})`);
    openModal(`Oggetto: ${esc(item.name)}`, body, [
        { label: 'Rimuovi Oggetto', className: 'btn-danger', onClick: () => { editorDraft[key].splice(idx, 1); editorRenderTabPanel(); } },
        { label: 'Chiudi', onClick: () => editorRenderTabPanel() }
    ]);
}

function editorRenderArmory(panel) {
    panel.innerHTML = `
        <p class="editor-hint">Armeria iniziale: oggetti tra cui scegliere alla creazione del party (1 a testa). Deve contenerne almeno uno, altrimenti la creazione del party si blocca. Clicca un oggetto per modificarlo.</p>
        <button class="editor-add-btn" onclick="editorToggleItemCreate('initialArmory')">${editorItemCreateOpen.initialArmory ? 'Annulla Creazione' : '+ Aggiungi Oggetto Iniziale'}</button>
        <div id="editorArmoryCreateBox">${editorItemCreateOpen.initialArmory ? `<div class="editor-list-card">${editorItemFieldsHtml(editorItemCreateDraft.initialArmory, 'editorItemCreateDraft.initialArmory')}<button class="btn-proceed" onclick="editorConfirmCreateItem('initialArmory')">Crea Oggetto</button></div>` : ''}</div>
        <div id="editorArmoryGallery">${editorItemGalleryHtml('initialArmory')}</div>

        <div class="editor-section-title">Bottino di scontro (opzionale)</div>
        <p class="editor-hint">Se vuoto, il bottino userà il catalogo generico del motore. Se compilato, sostituisce il pool per questa campagna.</p>
        <button class="editor-add-btn" onclick="editorToggleItemCreate('lootItems')">${editorItemCreateOpen.lootItems ? 'Annulla Creazione' : '+ Aggiungi Oggetto Bottino'}</button>
        <div id="editorLootCreateBox">${editorItemCreateOpen.lootItems ? `<div class="editor-list-card">${editorItemFieldsHtml(editorItemCreateDraft.lootItems, 'editorItemCreateDraft.lootItems')}<button class="btn-proceed" onclick="editorConfirmCreateItem('lootItems')">Crea Oggetto</button></div>` : ''}</div>
        <div id="editorLootGallery">${editorItemGalleryHtml('lootItems')}</div>
    `;
}

/* ---------------------------------------------------------------- Tab: Nemici */
function editorSetEnemyHp(id, val) { const n = editorNum(val, 1); editorDraft.enemies[id].hp = n; editorDraft.enemies[id].maxHp = n; }

/* ---------------------------------------------------------------- Ricompensa/punizione di una sfida
   (usata dentro la modale del nodo — vedi più sotto) */
function editorRewardPunishmentHtml(id, key, obj, defaultType, refreshCall) {
    refreshCall = refreshCall || 'editorRenderTabPanel()';
    const on = !!obj;
    return `
        <div class="editor-form-row">
            <label>${key === 'reward' ? 'Ricompensa (successo)' : 'Punizione (fallimento)'}</label>
            <select onchange="editorToggleRP('${esc(id)}','${key}',this.value,'${defaultType}', () => { ${refreshCall}; })">
                <option value="off" ${!on ? 'selected' : ''}>Nessuna</option>
                <option value="on" ${on ? 'selected' : ''}>Sì</option>
            </select>
        </div>
        ${on ? `
        <div class="editor-form-grid">
            <div class="editor-form-row"><label>Tipo</label>
                <select onchange="editorDraft.challenges['${esc(id)}'].${key}.type=this.value">
                    ${['relic', 'curse', 'coins', 'injury', 'penalty'].map(t => `<option value="${t}" ${obj.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
            </div>
            <div class="editor-form-row"><label>Nome</label><input type="text" value="${esc(obj.name)}" oninput="editorDraft.challenges['${esc(id)}'].${key}.name=this.value"></div>
        </div>
        <div class="editor-form-row"><label>Descrizione effetto (testo, mostrato al giocatore)</label><input type="text" value="${esc(obj.desc)}" oninput="editorDraft.challenges['${esc(id)}'].${key}.desc=this.value"></div>
        ` : ''}
    `;
}
function editorToggleRP(id, key, value, defaultType, refreshFn) {
    editorDraft.challenges[id][key] = value === 'on' ? { type: defaultType, name: '', desc: '' } : null;
    (refreshFn || editorRenderTabPanel)();
}

/* ---------------------------------------------------------------- Tab: Grafo
   A sinistra si crea solo la struttura (livelli e nodi vuoti). Ogni nodo si configura
   (tipo, nemico/sfida/mercante/riposo/tesoro, immagine, collegamenti) cliccandolo nella
   mappa a destra, che apre una modale — stesso pattern di Eroi/Armeria. */
const EDITOR_NODE_TYPES = [
    ['combat', 'Scontro', '🗡️'], ['elite', 'Scontro Elite', '👹'], ['challenge', 'Sfida', '❓'],
    ['rest', 'Riposo', '⛺'], ['merchant', 'Mercante', '🪙'], ['treasure', 'Tesoro', '💎'], ['captain', 'Meta Finale', '👑']
];
function editorNodeTypeIcon(type) { const t = EDITOR_NODE_TYPES.find(x => x[0] === type); return t ? t[2] : '❔'; }

function editorRenderMap(panel) {
    const d = editorDraft;
    const maxLevel = d.mapNodes.length ? Math.max(...d.mapNodes.map(n => n.level)) : -1;
    const levels = [];
    for (let l = 0; l <= maxLevel; l++) levels.push(l);
    panel.innerHTML = `
        <p class="editor-hint">Qui crei solo la struttura: livelli e nodi. Per configurare un nodo — tipo, nemico/sfida/mercante/riposo/tesoro, immagine, collegamenti al livello successivo — cliccalo nella mappa a destra.</p>
        <div class="editor-map-levels" id="editorMapLevels"></div>
        <button class="btn-block" onclick="editorAddMapLevel()">+ Aggiungi Livello ${levels.length + 1}</button>
    `;
    const box = document.getElementById('editorMapLevels');
    box.innerHTML = levels.map(l => editorMapColumnHtml(l)).join('');
}

function editorMapColumnHtml(level) {
    const nodes = editorDraft.mapNodes.filter(n => n.level === level);
    return `
        <div class="editor-map-col">
            <div class="editor-map-col-head">Livello ${level + 1}</div>
            ${nodes.map(n => `
                <div class="editor-node-card type-${n.type}">
                    <button class="editor-node-stub" onclick="editorOpenNodeModal(${n.id}, true)">${n.icon || editorNodeTypeIcon(n.type)} ${esc(n.title)}</button>
                    <button class="editor-remove-btn" onclick="editorRemoveNode(${n.id})">Rimuovi</button>
                </div>
            `).join('')}
            <button class="editor-map-add" onclick="editorAddNode(${level})">+ Nodo</button>
        </div>
    `;
}

/* ---------- Modale di configurazione del singolo nodo (aperta cliccando nella mappa) ---------- */
// editorNodeSubDetailsOpen: mostra/nasconde i campi di modifica del nemico/sfida/mercante/
// riposo/tesoro assegnato al nodo aperto nella modale. Si riapre automaticamente quando la
// modale viene aperta da fuori (resetDetails=true) o quando si crea/sceglie un nuovo elemento;
// resta com'è (aperto o chiuso) per i refresh interni innescati da altre modifiche.
let editorNodeSubDetailsOpen = true;
function editorToggleNodeSubDetails(nodeId) {
    editorNodeSubDetailsOpen = !editorNodeSubDetailsOpen;
    editorOpenNodeModal(nodeId);
}

function editorOpenNodeModal(nodeId, resetDetails) {
    if (resetDetails) editorNodeSubDetailsOpen = true;
    const n = editorDraft.mapNodes.find(x => x.id === nodeId);
    if (!n) return;
    openModal(`Nodo: ${esc(n.title || ('Livello ' + (n.level + 1)))}`, editorNodeModalBodyHtml(n), [
        { label: 'Rimuovi Nodo', className: 'btn-danger', onClick: () => editorRemoveNode(nodeId) },
        { label: 'Chiudi', onClick: () => editorRenderTabPanel() }
    ], { wide: true });
}

function editorNodeModalBodyHtml(n) {
    let sub = '';
    if (n.type === 'combat' || n.type === 'elite') sub = editorNodeEnemySectionHtml(n);
    else if (n.type === 'challenge') sub = editorNodeChallengeSectionHtml(n);
    else if (n.type === 'rest') sub = editorNodeRestSectionHtml(n);
    else if (n.type === 'merchant') sub = editorNodeMerchantSectionHtml(n);
    else if (n.type === 'treasure') sub = editorNodeTreasureSectionHtml(n);
    const src = editorImgSrc(n.image);
    return `
        <div class="editor-form-row"><label>Titolo</label><input type="text" value="${esc(n.title)}" oninput="editorSetNodeField(${n.id},'title',this.value); editorRenderStsMapPreview();"></div>
        <div class="editor-form-row"><label>Tipo di nodo</label>
            <select onchange="editorSetNodeType(${n.id}, this.value); editorOpenNodeModal(${n.id});">
                ${EDITOR_NODE_TYPES.map(([t, label]) => `<option value="${t}" ${n.type === t ? 'selected' : ''}>${label}</option>`).join('')}
            </select>
        </div>
        <div class="editor-form-row"><label>Immagine nodo</label>
            <label class="editor-image-tile">
                ${src ? `<img src="${src}" alt="">` : 'Clicca per caricare un\'immagine'}
                <input type="file" accept="image/*" onchange="editorFilePicked(this, f => editorSetNodeImageModal(${n.id}, f))">
            </label>
            ${n.image ? `<div><button class="btn-small" onclick="editorClearNodeImageModal(${n.id})">Rimuovi immagine</button></div>` : ''}
        </div>
        ${sub}
        ${editorNodeConnectionsHtml(n)}
    `;
}

function editorSetNodeImageModal(nodeId, file) { editorSetNodeImage(nodeId, file); editorOpenNodeModal(nodeId); }
function editorClearNodeImageModal(nodeId) { editorClearNodeImage(nodeId); editorOpenNodeModal(nodeId); }

function editorNodeConnectionsHtml(n) {
    const maxLevel = editorDraft.mapNodes.length ? Math.max(...editorDraft.mapNodes.map(x => x.level)) : 0;
    if (n.level >= maxLevel) return `<div class="editor-section-title" style="font-size:0.78rem;">Collegamenti</div><p class="editor-hint">Ultimo livello: fine spedizione (vittoria) se non collegato a nulla.</p>`;
    const nextNodes = editorDraft.mapNodes.filter(x => x.level === n.level + 1);
    return `
        <div class="editor-section-title" style="font-size:0.78rem;">Collega a → (Livello ${n.level + 2})</div>
        <div class="editor-next-chips">
            ${nextNodes.length === 0 ? '<span class="editor-hint">nessun nodo nel livello successivo</span>' : nextNodes.map(nn => `
                <button type="button" class="editor-next-chip ${n.next.includes(nn.id) ? 'is-on' : ''}" onclick="editorToggleNext(${n.id}, ${nn.id}); editorOpenNodeModal(${n.id});">${esc(nn.title)}</button>
            `).join('')}
        </div>
    `;
}

/* ---------- Sotto-oggetto: Nemico ---------- */
function editorNodeEnemySectionHtml(n) {
    const d = editorDraft;
    const ids = Object.keys(d.enemies);
    return `
        <div class="editor-section-title" style="font-size:0.78rem;">Nemico</div>
        <div class="editor-form-row"><label>Nemico assegnato</label>
            <select onchange="editorNodeSubDetailsOpen=true; editorSetNodeField(${n.id}, 'enemy', this.value); editorOpenNodeModal(${n.id});">
                <option value="">— nessuno —</option>
                ${ids.map(id => `<option value="${esc(id)}" ${n.enemy === id ? 'selected' : ''}>${esc(d.enemies[id].name)}</option>`).join('')}
            </select>
        </div>
        <button class="editor-add-btn" onclick="editorCreateNodeEnemy(${n.id})">+ Crea Nuovo Nemico</button>
        ${n.enemy && d.enemies[n.enemy] ? (editorNodeSubDetailsOpen
            ? `<button class="btn-small" onclick="editorToggleNodeSubDetails(${n.id})">✕ Chiudi Dettagli Nemico</button>` + editorEnemyEditFieldsHtml(n.enemy)
            : `<button class="btn-small" onclick="editorToggleNodeSubDetails(${n.id})">Mostra Dettagli Nemico</button>`) : ''}
    `;
}
function editorEnemyEditFieldsHtml(id) {
    const e = editorDraft.enemies[id];
    return `
        <div class="editor-list-card">
            <div class="editor-form-row"><label>Nome</label><input type="text" value="${esc(e.name)}" oninput="editorDraft.enemies['${esc(id)}'].name=this.value"></div>
            <div class="editor-form-grid">
                <div class="editor-form-row"><label>HP</label><input type="number" value="${e.hp}" oninput="editorSetEnemyHp('${esc(id)}', this.value)"></div>
                <div class="editor-form-row"><label>Attacco</label><input type="number" value="${e.att}" oninput="editorDraft.enemies['${esc(id)}'].att=editorNum(this.value)"></div>
                <div class="editor-form-row"><label>Danno</label><input type="number" value="${e.dmg}" oninput="editorDraft.enemies['${esc(id)}'].dmg=editorNum(this.value)"></div>
                <div class="editor-form-row"><label>Classe Armatura</label><input type="number" value="${e.ca}" oninput="editorDraft.enemies['${esc(id)}'].ca=editorNum(this.value)"></div>
            </div>
            <div class="editor-form-row"><label>Descrizione (narrativa, mostrata a inizio scontro)</label><textarea oninput="editorDraft.enemies['${esc(id)}'].desc=this.value">${esc(e.desc || '')}</textarea></div>
        </div>
    `;
}
function editorCreateNodeEnemy(nodeId) {
    const id = editorSlug('nuovo_nemico', Object.keys(editorDraft.enemies));
    editorDraft.enemies[id] = editorNewEnemy();
    editorSetNodeField(nodeId, 'enemy', id);
    editorNodeSubDetailsOpen = true;
    editorOpenNodeModal(nodeId);
}

/* ---------- Sotto-oggetto: Sfida ---------- */
function editorNodeChallengeSectionHtml(n) {
    const d = editorDraft;
    const ids = Object.keys(d.challenges);
    return `
        <div class="editor-section-title" style="font-size:0.78rem;">Sfida</div>
        <div class="editor-form-row"><label>Sfida assegnata</label>
            <select onchange="editorNodeSubDetailsOpen=true; editorSetNodeField(${n.id}, 'challengeId', this.value); editorOpenNodeModal(${n.id});">
                <option value="">— nessuna —</option>
                ${ids.map(id => `<option value="${esc(id)}" ${n.challengeId === id ? 'selected' : ''}>${esc(d.challenges[id].title)}</option>`).join('')}
            </select>
        </div>
        <button class="editor-add-btn" onclick="editorCreateNodeChallenge(${n.id})">+ Crea Nuova Sfida</button>
        ${n.challengeId && d.challenges[n.challengeId] ? (editorNodeSubDetailsOpen
            ? `<button class="btn-small" onclick="editorToggleNodeSubDetails(${n.id})">✕ Chiudi Dettagli Sfida</button>` + editorChallengeEditFieldsHtml(n.challengeId, n.id)
            : `<button class="btn-small" onclick="editorToggleNodeSubDetails(${n.id})">Mostra Dettagli Sfida</button>`) : ''}
    `;
}
function editorChallengeEditFieldsHtml(id, nodeId) {
    const c = editorDraft.challenges[id];
    const refresh = `editorOpenNodeModal(${nodeId})`;
    return `
        <div class="editor-list-card">
            <div class="editor-form-row"><label>Titolo</label><input type="text" value="${esc(c.title)}" oninput="editorDraft.challenges['${esc(id)}'].title=this.value"></div>
            <div class="editor-form-row"><label>Descrizione (situazione)</label><textarea oninput="editorDraft.challenges['${esc(id)}'].desc=this.value">${esc(c.desc)}</textarea></div>
            <div class="editor-form-grid">
                <div class="editor-form-row"><label>Statistica testata</label>
                    <select onchange="editorDraft.challenges['${esc(id)}'].stat=this.value">
                        ${['int', 'fth', 'str'].map(s => `<option value="${s}" ${c.stat === s ? 'selected' : ''}>${s.toUpperCase()}</option>`).join('')}
                    </select>
                </div>
                <div class="editor-form-row"><label>CD (difficoltà)</label><input type="number" value="${c.cd}" oninput="editorDraft.challenges['${esc(id)}'].cd=editorNum(this.value,7)"></div>
            </div>
            <div class="editor-form-row"><label>Testo se ignorata</label><input type="text" value="${esc(c.ignoreText || '')}" oninput="editorDraft.challenges['${esc(id)}'].ignoreText=this.value"></div>
            <div class="editor-form-row"><label>Testo se superata</label><input type="text" value="${esc(c.successText || '')}" oninput="editorDraft.challenges['${esc(id)}'].successText=this.value"></div>
            <div class="editor-form-row"><label>Testo se fallita</label><input type="text" value="${esc(c.failText || '')}" oninput="editorDraft.challenges['${esc(id)}'].failText=this.value"></div>
            ${editorRewardPunishmentHtml(id, 'reward', c.reward, 'relic', refresh)}
            ${editorRewardPunishmentHtml(id, 'punishment', c.punishment, 'curse', refresh)}
        </div>
    `;
}
function editorCreateNodeChallenge(nodeId) {
    const id = editorSlug('nuova_sfida', Object.keys(editorDraft.challenges));
    editorDraft.challenges[id] = editorNewChallenge();
    editorSetNodeField(nodeId, 'challengeId', id);
    editorNodeSubDetailsOpen = true;
    editorOpenNodeModal(nodeId);
}

/* ---------- Sotto-oggetti a testo semplice: Riposo, Mercante, Tesoro ---------- */
function editorNodeRestSectionHtml(n) {
    const d = editorDraft;
    const keys = Object.keys(d.rests);
    return `
        <div class="editor-section-title" style="font-size:0.78rem;">Riposo</div>
        <div class="editor-form-row"><label>Voce assegnata</label>
            <select onchange="editorNodeSubDetailsOpen=true; editorSetNodeField(${n.id}, 'restId', this.value); editorOpenNodeModal(${n.id});">
                <option value="">— nessuna —</option>
                ${keys.map(k => `<option value="${esc(k)}" ${n.restId === k ? 'selected' : ''}>${esc(k)}</option>`).join('')}
            </select>
        </div>
        <button class="editor-add-btn" onclick="editorCreateNodeRest(${n.id})">+ Crea Nuova Voce Riposo</button>
        ${n.restId && d.rests[n.restId] !== undefined ? (editorNodeSubDetailsOpen
            ? `<button class="btn-small" onclick="editorToggleNodeSubDetails(${n.id})">✕ Chiudi Dettagli Riposo</button><div class="editor-list-card"><div class="editor-form-row"><label>Testo</label><textarea oninput="editorDraft.rests['${esc(n.restId)}']=this.value">${esc(d.rests[n.restId])}</textarea></div></div>`
            : `<button class="btn-small" onclick="editorToggleNodeSubDetails(${n.id})">Mostra Dettagli Riposo</button>`) : ''}
    `;
}
function editorCreateNodeRest(nodeId) {
    const key = editorSlug('riposo', Object.keys(editorDraft.rests));
    editorDraft.rests[key] = '';
    editorSetNodeField(nodeId, 'restId', key);
    editorNodeSubDetailsOpen = true;
    editorOpenNodeModal(nodeId);
}

function editorNodeMerchantSectionHtml(n) {
    const d = editorDraft;
    const keys = Object.keys(d.merchants);
    return `
        <div class="editor-section-title" style="font-size:0.78rem;">Mercante</div>
        <div class="editor-form-row"><label>Voce assegnata</label>
            <select onchange="editorNodeSubDetailsOpen=true; editorSetNodeField(${n.id}, 'merchantId', this.value); editorOpenNodeModal(${n.id});">
                <option value="">— nessuna —</option>
                ${keys.map(k => `<option value="${esc(k)}" ${n.merchantId === k ? 'selected' : ''}>${esc(k)}</option>`).join('')}
            </select>
        </div>
        <button class="editor-add-btn" onclick="editorCreateNodeMerchant(${n.id})">+ Crea Nuova Voce Mercante</button>
        ${n.merchantId && d.merchants[n.merchantId] !== undefined ? (editorNodeSubDetailsOpen
            ? `<button class="btn-small" onclick="editorToggleNodeSubDetails(${n.id})">✕ Chiudi Dettagli Mercante</button><div class="editor-list-card"><div class="editor-form-row"><label>Testo</label><textarea oninput="editorDraft.merchants['${esc(n.merchantId)}']=this.value">${esc(d.merchants[n.merchantId])}</textarea></div></div>`
            : `<button class="btn-small" onclick="editorToggleNodeSubDetails(${n.id})">Mostra Dettagli Mercante</button>`) : ''}
    `;
}
function editorCreateNodeMerchant(nodeId) {
    const key = editorSlug('mercante', Object.keys(editorDraft.merchants));
    editorDraft.merchants[key] = '';
    editorSetNodeField(nodeId, 'merchantId', key);
    editorNodeSubDetailsOpen = true;
    editorOpenNodeModal(nodeId);
}

function editorNodeTreasureSectionHtml(n) {
    const d = editorDraft;
    const keys = Object.keys(d.treasures);
    return `
        <div class="editor-section-title" style="font-size:0.78rem;">Tesoro</div>
        <div class="editor-form-row"><label>Voce assegnata</label>
            <select onchange="editorNodeSubDetailsOpen=true; editorSetNodeField(${n.id}, 'treasureId', this.value); editorOpenNodeModal(${n.id});">
                <option value="">— nessuna —</option>
                ${keys.map(k => `<option value="${esc(k)}" ${n.treasureId === k ? 'selected' : ''}>${esc(k)}</option>`).join('')}
            </select>
        </div>
        <button class="editor-add-btn" onclick="editorCreateNodeTreasure(${n.id})">+ Crea Nuova Voce Tesoro</button>
        ${n.treasureId && d.treasures[n.treasureId] !== undefined ? (editorNodeSubDetailsOpen
            ? `<button class="btn-small" onclick="editorToggleNodeSubDetails(${n.id})">✕ Chiudi Dettagli Tesoro</button><div class="editor-list-card"><div class="editor-form-row"><label>Testo</label><textarea oninput="editorDraft.treasures['${esc(n.treasureId)}']=this.value">${esc(d.treasures[n.treasureId])}</textarea></div></div>`
            : `<button class="btn-small" onclick="editorToggleNodeSubDetails(${n.id})">Mostra Dettagli Tesoro</button>`) : ''}
    `;
}
function editorCreateNodeTreasure(nodeId) {
    const key = editorSlug('tesoro', Object.keys(editorDraft.treasures));
    editorDraft.treasures[key] = '';
    editorSetNodeField(nodeId, 'treasureId', key);
    editorNodeSubDetailsOpen = true;
    editorOpenNodeModal(nodeId);
}

function editorNextNodeId() {
    return editorDraft.mapNodes.length ? Math.max(...editorDraft.mapNodes.map(n => n.id)) + 1 : 0;
}
// La mappa reale non dispone i nodi da sola (l'x è un dato fisso della campagna): qui li
// ridistribuiamo orizzontalmente ogni volta che un livello cambia numero di nodi, così non
// finiscono mai sovrapposti nell'anteprima a destra (che riusa lo stesso renderer del gioco).
function editorAutoLayoutLevelX(level) {
    const list = editorDraft.mapNodes.filter(n => n.level === level);
    const minX = 150, maxX = 650;
    if (list.length <= 1) { list.forEach(n => { n.x = 400; }); return; }
    list.forEach((n, i) => { n.x = Math.round(minX + (maxX - minX) * i / (list.length - 1)); });
}

function editorAddNode(level) {
    const id = editorNextNodeId();
    const type = 'combat';
    editorDraft.mapNodes.push({
        id, level, x: 400, type,
        title: `Livello ${level + 1} - ${EDITOR_NODE_TYPES.find(t => t[0] === type)[1]}`,
        icon: editorNodeTypeIcon(type),
        done: false, active: level === 0,
        next: [], image: ''
    });
    editorAutoLayoutLevelX(level);
    editorRenderTabPanel();
}
function editorAddMapLevel() {
    // Nessun nodo da creare: la colonna appare quando il primo nodo viene aggiunto lì.
    const maxLevel = editorDraft.mapNodes.length ? Math.max(...editorDraft.mapNodes.map(n => n.level)) : -1;
    editorAddNode(maxLevel + 1);
}
function editorRemoveNode(id) {
    const removed = editorDraft.mapNodes.find(n => n.id === id);
    editorDraft.mapNodes = editorDraft.mapNodes.filter(n => n.id !== id);
    editorDraft.mapNodes.forEach(n => { n.next = n.next.filter(x => x !== id); });
    if (removed) editorAutoLayoutLevelX(removed.level);
    editorRenderTabPanel();
}
function editorSetNodeField(id, field, value) {
    const n = editorDraft.mapNodes.find(x => x.id === id);
    if (n) n[field] = value;
}
function editorSetNodeType(id, type) {
    const n = editorDraft.mapNodes.find(x => x.id === id);
    if (!n) return;
    n.type = type;
    n.icon = editorNodeTypeIcon(type);
    editorRenderTabPanel();
}
function editorToggleNext(fromId, toId) {
    const n = editorDraft.mapNodes.find(x => x.id === fromId);
    if (!n) return;
    const i = n.next.indexOf(toId);
    if (i >= 0) n.next.splice(i, 1); else n.next.push(toId);
    editorRenderTabPanel();
}

/* ---------------------------------------------------------------- Mappa (anteprima live, sola lettura) */
// Ricalca esattamente renderStsMap()/renderMapLegend() di js/game.js (stessi elementi, stesse
// classi CSS, stesse icone) ma legge editorDraft.mapNodes invece di stsMapNodes e non è
// interattiva: nessuna partita è in corso, quindi si limita a mostrare i nodi di Livello 1
// come "disponibili" (esattamente lo stato di una spedizione mai iniziata) e il resto come
// "da esplorare", senza percorso già fatto.
function editorNodeTooltipText(n) {
    const d = editorDraft;
    let ref = '';
    if ((n.type === 'combat' || n.type === 'elite') && n.enemy && d.enemies[n.enemy]) ref = d.enemies[n.enemy].name;
    else if (n.type === 'challenge' && n.challengeId && d.challenges[n.challengeId]) ref = d.challenges[n.challengeId].title;
    else if (n.type === 'rest' && n.restId) ref = `riposo: ${n.restId}`;
    else if (n.type === 'merchant' && n.merchantId) ref = `mercante: ${n.merchantId}`;
    else if (n.type === 'treasure' && n.treasureId) ref = `tesoro: ${n.treasureId}`;
    const typeLabel = (EDITOR_NODE_TYPES.find(t => t[0] === n.type) || [, n.type])[1];
    return `${n.title || ''} — ${typeLabel}${ref ? ' (' + ref + ')' : ''}`;
}

function editorRenderStsMapPreview() {
    const nodesContainer = document.getElementById('editorMapNodesContainer');
    const svgContainer = document.getElementById('editorMapSvg');
    if (!nodesContainer || !svgContainer) return; // pannello non ancora montato
    Array.from(nodesContainer.children).forEach(child => { if (child.id !== 'editorMapSvg') child.remove(); });

    const nodes = editorDraft ? editorDraft.mapNodes : [];
    if (!nodes.length) {
        svgContainer.innerHTML = '';
        svgContainer.setAttribute('viewBox', '0 0 800 260');
        nodesContainer.style.width = '100%';
        nodesContainer.style.height = svgContainer.style.height = '260px';
        nodesContainer.style.transform = 'none';
        const empty = document.createElement('div');
        empty.className = 'editor-graph-empty';
        empty.textContent = 'Nessun nodo mappa ancora creato. Vai alla scheda "Mappa" per iniziare.';
        nodesContainer.appendChild(empty);
        document.getElementById('editorMapLegend').innerHTML = '';
        return;
    }
    nodesContainer.style.width = '800px';

    let maxLevel = Math.max(...nodes.map(n => n.level), 1);
    const totalLevels = maxLevel + 1;
    const containerHeight = Math.max(900, totalLevels * 175);
    nodesContainer.style.height = `${containerHeight}px`;
    svgContainer.style.height = `${containerHeight}px`;
    svgContainer.setAttribute('viewBox', `0 0 800 ${containerHeight}`);

    const stepY = (containerHeight - 140) / maxLevel;

    let svgLinesHtml = '';
    nodes.forEach(node => {
        (node.next || []).forEach(nextId => {
            const targetNode = nodes.find(n => n.id === nextId);
            if (targetNode) {
                const y1 = containerHeight - (node.level * stepY + 70);
                const y2 = containerHeight - (targetNode.level * stepY + 70);
                svgLinesHtml += `<line x1="${node.x}" y1="${y1}" x2="${targetNode.x}" y2="${y2}" />`;
            }
        });
    });
    svgContainer.innerHTML = svgLinesHtml;

    nodes.forEach(node => {
        const statusClass = node.level === 0 ? 'available' : 'upcoming';
        const nodeEl = document.createElement('div');
        nodeEl.className = `sts-node node-${node.type} ${statusClass}`;
        nodeEl.style.left = `${node.x}px`;
        nodeEl.style.top = `${containerHeight - (node.level * stepY + 70)}px`;
        nodeEl.style.cursor = 'pointer';
        nodeEl.onclick = () => editorOpenNodeModal(node.id, true);
        const isBoss = node.level === maxLevel || node.type === 'captain';
        if (isBoss) {
            nodeEl.setAttribute('data-boss', 'true');
            nodeEl.classList.add('node-goal');
        }
        nodeEl.innerHTML = svgIcon(isBoss ? 'crown' : (NODE_ICON[node.type] || 'question'));
        nodeEl.title = editorNodeTooltipText(node);
        nodesContainer.appendChild(nodeEl);
    });

    editorRenderMapLegend();

    // Niente scroll: la mappa reale è larga 800px fissi e alta quanto serve per i livelli, qui
    // la scaliamo per intero (mai oltre la dimensione reale) dentro la vista disponibile, così
    // si vedono sempre tutti i nodi insieme invece di doverli cercare scorrendo.
    requestAnimationFrame(() => {
        const wrapper = document.getElementById('editorMapWrapper');
        if (!wrapper) return;
        const scale = Math.min(wrapper.clientWidth / 800, wrapper.clientHeight / containerHeight, 1);
        const offsetX = Math.max(0, (wrapper.clientWidth - 800 * scale) / 2);
        nodesContainer.style.transform = `translateX(${offsetX}px) scale(${scale})`;
    });
}

function editorRenderMapLegend() {
    const legend = document.getElementById('editorMapLegend');
    if (!legend) return;
    legend.innerHTML = ['combat', 'elite', 'challenge', 'treasure', 'merchant', 'rest'].map(type => `
        <span><span class="sts-node node-${type} legend-dot">${svgIcon(NODE_ICON[type])}</span>${NODE_LABEL[type]}</span>
    `).join('') + `<span><span class="sts-node node-goal legend-dot">${svgIcon('crown')}</span>Meta</span>`;
}

/* ---------------------------------------------------------------- Tab: Esporta */
function editorRenderExport(panel) {
    const d = editorDraft;
    const warnings = editorValidate(d);
    const hasFsa = !!window.showDirectoryPicker;
    panel.innerHTML = `
        <div class="editor-export-box">
            ${hasFsa ? `
                <p>"Salva Bozza" scrive già in automatico dentro <code>campagne/${esc(d.id || '&lt;id&gt;')}/</code> (<code>campaign.json</code>, <code>campaign.js</code>, <code>assets/</code>): la prima volta ti verrà chiesto di selezionare la cartella <code>campagne</code> del progetto, poi verrà ricordata.</p>
                <p>Se non hai ancora una campagna con nessun nodo/eroe, ricordati comunque di aggiungere in <code>index.html</code>, prima di <code>js/game.js</code>:</p>
                <p><code>&lt;script src="campagne/${esc(d.id || '&lt;id&gt;')}/campaign.js"&gt;&lt;/script&gt;</code></p>
            ` : `
                <p>Questo browser non supporta la scrittura diretta su disco. "Salva Bozza" rende comunque la campagna giocabile subito qui nel browser; usa "Esporta" per scaricare uno <code>.zip</code> da estrarre tu dentro <code>campagne/</code>.</p>
            `}
        </div>
        ${warnings.length ? `<div class="editor-section-title">Avvisi</div><ul>${warnings.map(w => `<li class="editor-hint">${esc(w)}</li>`).join('')}</ul>` : ''}
        <div class="editor-toolbar" style="border-top:none;">
            <button class="btn-proceed" onclick="editorExportCampaign()">${hasFsa ? 'Scrivi/Aggiorna su Disco Ora' : 'Scarica .zip'}</button>
            ${hasFsa ? '<button onclick="editorForgetCampagneDir()">Cambia Cartella "campagne"</button>' : ''}
        </div>
    `;
}

function editorBuildCampaignJsText(campaign) {
    return `/* Creata con l'Editor Campagne di Slay the Dig. */\n(function (root) {\n    const campaign = ${JSON.stringify(campaign, null, 4)};\n    if (typeof module !== 'undefined' && module.exports) {\n        module.exports = campaign;\n    } else {\n        root.CAMPAIGNS = root.CAMPAIGNS || {};\n        root.CAMPAIGNS['${campaign.id}'] = campaign;\n    }\n})(typeof window !== 'undefined' ? window : globalThis);\n`;
}

function editorCollectAssetFiles(draft) {
    // path relativo -> Blob, solo per le immagini davvero referenziate
    const files = {};
    const add = (p) => { if (p && editorAssetCache[p] && editorAssetCache[p].blob) files[p] = editorAssetCache[p].blob; };
    add(draft.coverImage);
    (draft.mapNodes || []).forEach(n => add(n.image));
    return files;
}

async function editorExportCampaign() {
    if (!editorDraft.id) await editorSaveDraft(false);
    const draft = editorCloneDraft(editorDraft);

    const dirHandle = await editorGetCampagneDirHandle(true);
    if (dirHandle) {
        try {
            await editorWriteCampaignToDir(dirHandle, draft);
            openModal('Esportazione completata', `<p>Cartella <code>campagne/${esc(draft.id)}/</code> scritta su disco con <code>campaign.json</code>, <code>campaign.js</code> e <code>assets/</code>.</p>`, [{ label: 'OK' }]);
            return;
        } catch (err) {
            // Fallisce silenziosamente in ZIP se la scrittura su disco non va a buon fine
        }
    }
    const jsonText = JSON.stringify(draft, null, 2);
    const jsText = editorBuildCampaignJsText(draft);
    const assetFiles = editorCollectAssetFiles(draft);
    await editorExportZipFallback(draft, jsonText, jsText, assetFiles);
}

async function editorExportZipFallback(draft, jsonText, jsText, assetFiles) {
    const enc = new TextEncoder();
    const files = [
        { path: `${draft.id}/campaign.json`, data: enc.encode(jsonText) },
        { path: `${draft.id}/campaign.js`, data: enc.encode(jsText) }
    ];
    for (const relPath in assetFiles) {
        const filename = relPath.split('/').pop();
        const buf = new Uint8Array(await assetFiles[relPath].arrayBuffer());
        files.push({ path: `${draft.id}/assets/${filename}`, data: buf });
    }
    const blob = editorBuildZip(files);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${draft.id}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    openModal('Download avviato', `<p>Il tuo browser non permette la scrittura diretta su disco: è stato scaricato <code>${esc(draft.id)}.zip</code>.</p><p>Estrailo dentro <code>campagne/</code> e aggiungi lo <code>&lt;script&gt;</code> in <code>index.html</code> come indicato.</p>`, [{ label: 'OK' }]);
}

/* ---------------------------------------------------------------- Mini scrittore ZIP (solo store, senza compressione) */
const EDITOR_CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        table[n] = c >>> 0;
    }
    return table;
})();
function editorCrc32(buf) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) crc = EDITOR_CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
}
function editorDosDateTime() {
    const d = new Date();
    const time = ((d.getHours() & 0x1F) << 11) | ((d.getMinutes() & 0x3F) << 5) | ((d.getSeconds() >> 1) & 0x1F);
    const date = (((d.getFullYear() - 1980) & 0x7F) << 9) | (((d.getMonth() + 1) & 0xF) << 5) | (d.getDate() & 0x1F);
    return { time, date };
}
function editorBuildZip(files) {
    const { time, date } = editorDosDateTime();
    const enc = new TextEncoder();
    const localChunks = [];
    const centralChunks = [];
    let offset = 0;

    files.forEach(f => {
        const nameBytes = enc.encode(f.path);
        const crc = editorCrc32(f.data);
        const size = f.data.length;

        const local = new DataView(new ArrayBuffer(30));
        local.setUint32(0, 0x04034b50, true);
        local.setUint16(4, 20, true);       // versione minima
        local.setUint16(6, 0x0800, true);   // flag: nomi file UTF-8
        local.setUint16(8, 0, true);        // metodo: store
        local.setUint16(10, time, true);
        local.setUint16(12, date, true);
        local.setUint32(14, crc, true);
        local.setUint32(18, size, true);
        local.setUint32(22, size, true);
        local.setUint16(26, nameBytes.length, true);
        local.setUint16(28, 0, true);
        localChunks.push(new Uint8Array(local.buffer), nameBytes, f.data);

        const central = new DataView(new ArrayBuffer(46));
        central.setUint32(0, 0x02014b50, true);
        central.setUint16(4, 20, true);
        central.setUint16(6, 20, true);
        central.setUint16(8, 0x0800, true);
        central.setUint16(10, 0, true);
        central.setUint16(12, time, true);
        central.setUint16(14, date, true);
        central.setUint32(16, crc, true);
        central.setUint32(20, size, true);
        central.setUint32(24, size, true);
        central.setUint16(28, nameBytes.length, true);
        central.setUint16(30, 0, true);
        central.setUint16(32, 0, true);
        central.setUint16(34, 0, true);
        central.setUint16(36, 0, true);
        central.setUint32(38, 0, true);
        central.setUint32(42, offset, true);
        centralChunks.push(new Uint8Array(central.buffer), nameBytes);

        offset += 30 + nameBytes.length + size;
    });

    const centralStart = offset;
    let centralSize = 0;
    centralChunks.forEach(c => centralSize += c.length);

    const eocd = new DataView(new ArrayBuffer(22));
    eocd.setUint32(0, 0x06054b50, true);
    eocd.setUint16(4, 0, true);
    eocd.setUint16(6, 0, true);
    eocd.setUint16(8, files.length, true);
    eocd.setUint16(10, files.length, true);
    eocd.setUint32(12, centralSize, true);
    eocd.setUint32(16, centralStart, true);
    eocd.setUint16(20, 0, true);

    return new Blob([...localChunks, ...centralChunks, new Uint8Array(eocd.buffer)], { type: 'application/zip' });
}
