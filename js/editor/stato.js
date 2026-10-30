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
let currentTab = 'home';
const selection = { challenges: null, map: null, itemList: 'initialArmory',
                    bestiario: null, armeria: null, reliquie: null, maledizioni: null, eroi: null, abilita: null,
                    elite: null, azioni_elite: null, benedizioni: null, avventure: null };
let dirty = false;

const deepCopy = obj => JSON.parse(JSON.stringify(obj));

function markDirty() {
    dirty = true;
    renderIssues();
    if (currentTab === 'map') renderMapPreview();
    scheduleDraftSave();
    historyRecord();
    updateCampaignName();
}

function markLibDirty(key) {
    libDirty.add(key);
    renderIssues();
    scheduleDraftSave();
    historyRecord();
    updateCampaignName();
}

// Nome della campagna aperta in alto, con "● non salvata" se ci sono modifiche da salvare
function updateCampaignName() {
    const el = document.getElementById('edCampaignName');
    if (!el) return;
    el.innerHTML = campaignChosen ? `${esc(camp.title || '(senza titolo)')}${hasUnsaved() ? ' <span class="ed-unsaved" title="Ci sono modifiche non ancora salvate">● non salvata</span>' : ''}` : '';
}

const hasUnsaved = () => dirty || libDirty.size > 0;

/* ---------- Modalità Avanzate ----------
   Spenta (di partenza) nasconde id, effetti speciali, campi JSON, elite e i salvataggi tecnici:
   classe "ed-advanced" sul body (CSS: .ed-adv-only / .ed-simple-only) e campi "avanzato: true" saltati da renderForm. */
const ADVANCED_KEY = 'dignitas_editor_avanzate';
function isAdvanced() {
    try { return localStorage.getItem(ADVANCED_KEY) === '1'; } catch (e) { return false; }
}
function setAdvanced(on) {
    try { localStorage.setItem(ADVANCED_KEY, on ? '1' : '0'); } catch (e) { /* non ricordato: vale per questa pagina */ }
    document.body.classList.toggle('ed-advanced', !!on);
    const box = document.getElementById('edAdvanced');
    if (box) box.checked = !!on;
    render();
}
const toggleAdvanced = () => setAdvanced(!document.body.classList.contains('ed-advanced'));

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

/* Immagine caricata o trascinata: diventa WebP (lato massimo IMAGE_MAX_SIDE, qualità 0.75, come
   tools/ottimizza_immagini.mjs) con un nome pulito. Un nome generico (screenshot, file_0000…, IMG_…)
   prende quello dell'elemento (eroe, nemico, nodo: imageNameHint). Icone, interfaccia, cursori, SVG
   e GIF restano come sono; se il browser non sa scrivere WebP resta il file originale. */
const IMAGE_MAX_SIDE = 1024;
const IMAGE_KEEP_FOLDER = /^immagini\/(icone|ui|cursori)(\/|$)/;
const GENERIC_IMAGE_NAME = /^(screenshot|schermata|screen_shot|image|immagine|img|file|photo|foto|pxl|dsc|download|gemini_generated|generated|chatgpt_image|dall_e|untitled|senza_titolo)|^[0-9a-f_-]{12,}$|^[\d_ -]+$/;

function imageNameHint(obj, key) {
    const base = safeFileName(String((obj && (obj.name || obj.title)) || '').replace(/^livello\s*\d+\s*-\s*/i, ''))
        .replace(/\./g, '').replace(/^_+|_+$/g, '').slice(0, 60);
    if (!base) return '';
    if (key === 'portraitWounded') return `${base}_ferito`;
    if (key === 'coverImage') return `copertina_${base}`;
    return base;
}

function imageBaseName(fileName, hint) {
    const base = safeFileName(fileName.replace(/\.[^.]+$/, '')).replace(/^_+|_+$/g, '');
    return hint && (!base || GENERIC_IMAGE_NAME.test(base)) ? hint : (base || 'immagine');
}

// Un percorso libero fra le immagini in attesa (un secondo caricamento con lo stesso nome non copre il primo)
function freeAssetPath(folder, name, ext) {
    let path = `${folder}/${name}${ext}`;
    for (let i = 2; pendingAssets.has(path); i++) path = `${folder}/${name}_${i}${ext}`;
    return path;
}

async function prepareImage(file, folder, hint) {
    const name = imageBaseName(file.name, hint);
    const ext = ((file.name.match(/\.[^.]+$/) || [''])[0] || '').toLowerCase();
    const keep = IMAGE_KEEP_FOLDER.test(folder) || /svg|gif/.test(file.type) || typeof createImageBitmap !== 'function';
    if (!keep) {
        try {
            const bmp = await createImageBitmap(file);
            const scale = Math.min(1, IMAGE_MAX_SIDE / Math.max(bmp.width, bmp.height));
            if (!(file.type === 'image/webp' && scale === 1)) {
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(bmp.width * scale);
                canvas.height = Math.round(bmp.height * scale);
                canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
                if (bmp.close) bmp.close();
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.75));
                if (blob && blob.type === 'image/webp') return { path: freeAssetPath(folder, name, '.webp'), blob };
            }
        } catch (e) { /* immagine che il browser non sa leggere: resta l'originale */ }
    }
    return { path: freeAssetPath(folder, name, ext), blob: file };
}

// Immagine scelta o trascinata su un campo: preparata, messa fra quelle in attesa, poi onReady(percorso)
function addImageFile(file, folder, hint, onReady) {
    prepareImage(file, folder, hint).then(({ path, blob }) => {
        addPendingAsset(path, blob);
        onReady(path);
    });
}

function pickFile(folder, accept, onPicked, hint) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = () => {
        const file = input.files[0];
        if (!file) return;
        if (/^image\//.test(accept)) return addImageFile(file, folder, hint, onPicked);
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
    homeDraft = null;   // la bozza nel browser sta per diventare questa: quella offerta nella Home non c'è più
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
    homeDraft = null;
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

// Bozza salvata nel browser (null se non c'è): la Home la offre con "Riprendi da dove eri rimasto"
async function readDraft() {
    try {
        const draft = await kvGet('draft');
        return draft && draft.campaign ? draft : null;
    } catch (e) { return null; }
}

function restoreDraft(draft) {
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
    historyReset();
}

/* ---------- Caricamento ---------- */
const rawCampaigns = () => window.CAMPAIGNS_RAW || window.CAMPAIGNS || {};

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
    pendingPick = null;
    mapLink = null;
    render();
    historyReset();
}

function switchCampaign(data, origin = data.id) {
    pendingAssets.clear();
    if (!libDirty.size) clearDraft();
    setCampaign(data, origin);
}

// Id libero tra le campagne del progetto: base, base_2, base_3...
function uniqueCampaignId(base) {
    const ids = new Set(Object.keys(rawCampaigns()));
    const root = base || 'campagna';
    let id = root;
    for (let i = 2; ids.has(id); i++) id = `${root}_${i}`;
    return id;
}

// Campagna nuova: già giocabile come forma (scontro → riposo → boss finale), da riempire
function blankCampaign(title = 'Nuova campagna') {
    const node = (id, level, type, titolo, next, extra = {}) =>
        ({ id, level, x: 400, type, title: titolo, icon: NODE_ICONS[type], done: false, active: id === 0, next, image: '', ...extra });
    return {
        id: uniqueCampaignId(idFromName(title)), title, badge: 'Nuova Campagna', description: '', coverImage: '', introText: '',
        heroes: [], initialArmory: [], challenges: {},
        merchants: { default: '' }, rests: { default: '' }, treasures: {}, lootItems: null,
        mapNodes: [
            node(0, 0, 'combat', 'Primo scontro', [1], { enemy: '' }),
            node(1, 1, 'rest', 'Riposo', [2], { restId: 'default' }),
            node(2, 2, 'combat', 'Boss finale', [], { enemy: '' })
        ]
    };
}

// Copia di una campagna del progetto, come campagna nuova (id nuovo dal titolo)
function campaignCopy(src, title) {
    const c = deepCopy(src);
    c.title = title || `${src.title} (copia)`;
    c.id = uniqueCampaignId(idFromName(c.title));
    return c;
}

function openCampaign(id) {
    if (!rawCampaigns()[id] || !confirmDiscard()) return false;
    switchCampaign(deepCopy(rawCampaigns()[id]));
    return true;
}

function newCampaign(title) {
    if (!confirmDiscard()) return false;
    switchCampaign(blankCampaign(title || undefined), null);
    return true;
}

// Legge un file .js della cartella data/campagne (o un .json con la sola campagna)
function readCampaignFile(file, onDone) {
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
            if (onDone) onDone();
        } catch (err) {
            alert(`Impossibile leggere ${file.name}: ${err.message}`);
        }
    };
    reader.readAsText(file);
}
