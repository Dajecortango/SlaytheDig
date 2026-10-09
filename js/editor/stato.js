/* ==========================================================================
   EDITOR: STATO, ARCHIVIO LOCALE E CARICAMENTO
   Campagna e libreria in modifica, modifiche non salvate, IndexedDB (dignitas_editor, store kv),
   immagini caricate e non ancora scritte, bozza salvata da sola, scelta e apertura delle campagne.
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

/* ---------- Stato ---------- */
let camp = null;                                         // campagna in modifica, con i riferimenti per id
let lib = JSON.parse(JSON.stringify(window.LIBRERIA));   // copia modificabile della libreria condivisa
const libDirty = new Set();                              // file della libreria modificati (armeria, bestiario, ...)
let currentTab = 'general';
const selection = { challenges: null, map: null, itemList: 'initialArmory',
                    bestiario: null, armeria: null, reliquie: null, maledizioni: null, eroi: null, abilita: null,
                    elite: null, azioni_elite: null };
let dirty = false;

const deepCopy = obj => JSON.parse(JSON.stringify(obj));

function markDirty() {
    dirty = true;
    renderIssues();
    if (currentTab === 'map') renderMapPreview();
    scheduleDraftSave();
}

function markLibDirty(key) {
    libDirty.add(key);
    renderIssues();
    scheduleDraftSave();
}

const hasUnsaved = () => dirty || libDirty.size > 0;

window.addEventListener('beforeunload', e => {
    if (hasUnsaved()) { e.preventDefault(); e.returnValue = ''; }
});

/* ---------- Archivio locale (IndexedDB): bozza, cartella del progetto, prova nel gioco ---------- */
// Lo stesso database è letto da js/game.js per "Prova nel gioco" (chiave "playtest").
let edDbPromise = null;
function edDb() {
    if (!edDbPromise) {
        edDbPromise = new Promise((resolve, reject) => {
            const req = indexedDB.open('dignitas_editor', 1);
            req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains('kv')) req.result.createObjectStore('kv'); };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }
    return edDbPromise;
}
async function kv(mode, fn) {
    const db = await edDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('kv', mode);
        const req = fn(tx.objectStore('kv'));
        tx.oncomplete = () => resolve(req && req.result);
        tx.onerror = () => reject(tx.error);
    });
}
const kvGet = key => kv('readonly', s => s.get(key));
const kvSet = (key, value) => kv('readwrite', s => s.put(value, key));
const kvDel = key => kv('readwrite', s => s.delete(key));

/* ---------- Immagini caricate e non ancora scritte nel progetto ---------- */
const pendingAssets = new Map();  // percorso -> { blob, url }
const assetUrl = path => (pendingAssets.get(path) || {}).url || path;

function safeFileName(name) {
    return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9._-]+/g, '_');
}

function addPendingAsset(path, blob) {
    const old = pendingAssets.get(path);
    if (old) URL.revokeObjectURL(old.url);
    pendingAssets.set(path, { blob, url: URL.createObjectURL(blob) });
    imageStatus.set(path, 'ok');
}

function pickFile(folder, accept, onPicked) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = () => {
        const file = input.files[0];
        if (!file) return;
        const path = `${folder}/${safeFileName(file.name)}`;
        addPendingAsset(path, file);
        onPicked(path);
    };
    input.click();
}

/* ---------- Bozza salvata da sola ---------- */
let draftTimer = null;
function scheduleDraftSave() {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
        kvSet('draft', {
            campaign: deepCopy(camp),
            origin: campaignOrigin,
            library: libDirty.size ? deepCopy(lib) : null,
            libDirty: [...libDirty],
            assets: [...pendingAssets].map(([p, a]) => [p, a.blob]),
            savedAt: new Date().toLocaleString('it-IT')
        }).catch(() => {});
    }, 800);
}

async function clearDraft() {
    clearTimeout(draftTimer);
    try { await kvDel('draft'); } catch (e) {}
}

// Le immagini del progetto sono passate da .jpg/.jpeg/.jfif a .webp: una bozza salvata prima
// avrebbe i vecchi percorsi. Si aggiornano tutti tranne quelli delle immagini caricate nella bozza stessa.
function webpPaths(val, keep) {
    if (typeof val === 'string') return /^immagini\/.+\.(jpe?g|jfif)$/i.test(val) && !keep.has(val) ? val.replace(/\.(jpe?g|jfif)$/i, '.webp') : val;
    if (Array.isArray(val)) return val.map(v => webpPaths(v, keep));
    if (val && typeof val === 'object') return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, webpPaths(v, keep)]));
    return val;
}

async function offerDraftRestore() {
    let draft = null;
    try { draft = await kvGet('draft'); } catch (e) { return false; }
    if (!draft || !draft.campaign) return false;
    const libNote = (draft.libDirty || []).length ? ` e modifiche alla libreria (${draft.libDirty.join(', ')})` : '';
    if (confirm(`C'è una bozza non salvata di "${draft.campaign.title}"${libNote} (${draft.savedAt}). Ripristinarla?`)) {
        pendingAssets.clear();
        (draft.assets || []).forEach(([p, blob]) => addPendingAsset(p, blob));
        // Una bozza salvata prima di una nuova libreria (es. Abilità) la prende dai file del progetto
        const uploaded = new Set((draft.assets || []).map(([p]) => p));
        draft.campaign = webpPaths(draft.campaign, uploaded);
        if (draft.library) draft.library = webpPaths(draft.library, uploaded);
        if (draft.library) lib = { ...deepCopy(window.LIBRERIA), ...draft.library };
        libDirty.clear();
        (draft.libDirty || []).forEach(k => libDirty.add(k));
        setCampaign(draft.campaign, draft.origin !== undefined ? draft.origin : draft.campaign.id);
        dirty = true;
        return true;
    }
    await clearDraft();
    return false;
}

/* ---------- Caricamento ---------- */
const rawCampaigns = () => window.CAMPAIGNS_RAW || window.CAMPAIGNS || {};

function fillCampaignSelect() {
    document.getElementById('edCampaignSelect').innerHTML = Object.values(rawCampaigns())
        .map(c => `<option value="${esc(c.id)}">${esc(c.title)} (${esc(c.id)})</option>`).join('');
}

function confirmDiscard() {
    return !dirty || confirm('Ci sono modifiche alla campagna non salvate nel progetto. Continuare e perderle?');
}

// Id della campagna così com'era quando è stata aperta (null = campagna nuova): se l'id viene
// cambiato in quello di un'altra campagna del progetto, validateCampaign lo segnala
let campaignOrigin = null;

function setCampaign(data, origin = data.id) {
    camp = data;
    campaignOrigin = origin;
    ['challenges', 'merchants', 'rests', 'treasures', 'stories'].forEach(k => { if (!camp[k] || typeof camp[k] !== 'object') camp[k] = {}; });
    ['heroes', 'initialArmory', 'mapNodes'].forEach(k => { if (!Array.isArray(camp[k])) camp[k] = []; });
    if (camp.lootItems !== null && !Array.isArray(camp.lootItems)) camp.lootItems = null;
    selection.challenges = keysOf(camp.challenges)[0] || null;
    selection.map = camp.mapNodes[0] ? camp.mapNodes[0].id : null;
    dirty = false;
    render();
}

function switchCampaign(data, origin = data.id) {
    pendingAssets.clear();
    if (!libDirty.size) clearDraft();
    setCampaign(data, origin);
}

function loadSelectedCampaign() {
    const id = document.getElementById('edCampaignSelect').value;
    if (!id || !confirmDiscard()) return;
    switchCampaign(deepCopy(rawCampaigns()[id]));
}

function newCampaign() {
    if (!confirmDiscard()) return;
    switchCampaign({
        id: 'nuova_campagna', title: 'Nuova campagna', badge: 'Nuova Campagna', description: '', coverImage: '', introText: '',
        heroes: [], initialArmory: [], challenges: {},
        merchants: { default: '' }, rests: { default: '' }, treasures: {}, lootItems: null,
        mapNodes: [{ id: 0, level: 0, x: 400, type: 'combat', enemy: '', title: 'Livello 1 - Scontro', icon: '🗡️', done: false, active: true, next: [], image: '' }]
    }, null);
}

// Legge un file .js della cartella data/campagne (o un .json con la sola campagna)
document.getElementById('edFileInput').addEventListener('change', e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file || !confirmDiscard()) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            let data;
            if (file.name.endsWith('.json')) {
                data = JSON.parse(reader.result);
            } else {
                const sandbox = {};
                new Function('window', reader.result)(sandbox);
                data = Object.values(sandbox.CAMPAIGNS || {})[0];
            }
            if (!data || typeof data !== 'object') throw new Error('nessuna campagna trovata nel file');
            switchCampaign(data);
        } catch (err) {
            alert(`Impossibile leggere ${file.name}: ${err.message}`);
        }
    };
    reader.readAsText(file);
});
