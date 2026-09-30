/* ==========================================================================
   EDITOR DELLE CAMPAGNE
   Modifica i dati di data/campagne/<id>.js con moduli, anteprima della mappa
   e controlli automatici.
   Dal branch campaign-editor di Valerio (adattate al formato con "effects"):
   - "Salva nel progetto": scrive direttamente i file nella cartella del gioco
     (File System Access API di Edge/Chrome), con .zip di riserva;
   - caricamento delle immagini (copertina, nodi, ritratti);
   - bozza salvata da sola nel browser (IndexedDB);
   - "Prova nel gioco": apre il gioco con la campagna in modifica.
   ========================================================================== */

// Tipi di effetto interpretati da applyEffects() in js/game.js
const KNOWN_EFFECTS = {
    hero_stat: ['stat', 'val'],
    hero_set: ['stat', 'val'],
    party_stat: ['stat', 'val'],
    party_max_hp: ['val'],
    party_damage: ['val'],
    coins: ['val'],
    add_curse: ['text']
};

const NODE_TYPES = {
    combat: { label: 'Scontro', color: '#c0392b', ref: 'enemy' },
    elite: { label: 'Scontro elite', color: '#8e44ad', ref: 'enemy' },
    challenge: { label: 'Sfida', color: '#2980b9', ref: 'challengeId' },
    treasure: { label: 'Tesoro', color: '#d4a017', ref: 'treasureId' },
    merchant: { label: 'Mercante', color: '#27ae60', ref: 'merchantId' },
    rest: { label: 'Riposo', color: '#e67e22', ref: 'restId' },
    captain: { label: 'Meta (capitano)', color: '#ecf0f1', ref: null }
};
const NODE_ICONS = { combat: '🗡️', elite: '👹', challenge: '❓', treasure: '💎', merchant: '🪙', rest: '⛺', captain: '👑' };

const GENERAL_FIELDS = [
    { k: 'id', label: 'Id (nome del file)', help: 'Solo lettere minuscole, numeri e _' },
    { k: 'title', label: 'Titolo' },
    { k: 'badge', label: 'Etichetta' },
    { k: 'coverImage', label: 'Immagine di copertina', type: 'image', folder: 'immagini', wide: true },
    { k: 'description', label: 'Descrizione breve', type: 'textarea', wide: true },
    { k: 'introText', label: 'Testo introduttivo', type: 'textarea', wide: true }
];

const HERO_FIELDS = [
    { k: 'name', label: 'Nome', wide: true, help: 'Le abilità sono legate al nome: rinominando l\'eroe vengono spostate anche loro' },
    { k: 'str', label: 'Forza', type: 'number' },
    { k: 'int', label: 'Intelligenza', type: 'number' },
    { k: 'fth', label: 'Fede', type: 'number' },
    { k: 'maxHp', label: 'HP massimi', type: 'number' },
    { k: 'dmg', label: 'Danno', type: 'number' },
    { k: 'base_armor', label: 'Armatura base', type: 'number' },
    { k: 'portrait', label: 'Ritratto', type: 'image', folder: 'immagini/ritratti', wide: true,
      help: 'Usato se il gioco non ha già un ritratto per questo nome' },
    { k: 'portraitWounded', label: 'Ritratto da ferito', type: 'image', folder: 'immagini/ritratti', wide: true,
      help: 'Facoltativo: mostrato con metà HP o meno' }
];

const ITEM_FIELDS = [
    { k: 'id', label: 'Id', help: 'Unico; decide anche l\'icona in js/game.js (ITEM_IMAGES_BY_ID)' },
    { k: 'name', label: 'Nome' },
    { k: 'rarity', label: 'Rarità', type: 'select', omitEmpty: true, options: () => [['', '—'], ['comune', 'Comune'], ['raro', 'Raro'], ['epico', 'Epico']] },
    { k: 'type', label: 'Tipo', type: 'select', omitEmpty: true,
      options: () => [['', 'Equipaggiamento'], ['consumable_heal', 'Consumabile: cura'], ['consumable_full', 'Consumabile: cura completa']] },
    { k: 'heal_val', label: 'HP curati', type: 'number', omitEmpty: true, showIf: it => it.type === 'consumable_heal' },
    { k: 'str', label: 'Forza', type: 'number', omitEmpty: true },
    { k: 'dmg', label: 'Danno', type: 'number', omitEmpty: true },
    { k: 'armor', label: 'Armatura', type: 'number', omitEmpty: true },
    { k: 'att_penalty', label: 'Penalità attacco', type: 'number', omitEmpty: true },
    { k: 'def_bonus', label: 'Bonus difesa', type: 'number', omitEmpty: true },
    { k: 'help_bonus_val', label: 'Bonus aiuto', type: 'number', omitEmpty: true },
    { k: 'fth', label: 'Fede', type: 'number', omitEmpty: true },
    { k: 'int', label: 'Intelligenza', type: 'number', omitEmpty: true },
    { k: 'desc', label: 'Descrizione mostrata al giocatore', wide: true }
];

const ENEMY_FIELDS = [
    { k: 'name', label: 'Nome', wide: true },
    { k: 'hp', label: 'HP', type: 'number' },
    { k: 'maxHp', label: 'HP massimi', type: 'number' },
    { k: 'att', label: 'Attacco', type: 'number', help: 'Da superare per difendersi e aiutare' },
    { k: 'ca', label: 'Classe armatura', type: 'number', help: 'Da superare per colpire' },
    { k: 'dmg', label: 'Danno', type: 'number' },
    { k: 'desc', label: 'Descrizione', type: 'textarea', wide: true }
];

const CHALLENGE_FIELDS = [
    { k: 'title', label: 'Titolo', wide: true },
    { k: 'stat', label: 'Statistica', type: 'select', options: () => [['int', 'Intelligenza'], ['fth', 'Fede'], ['str', 'Forza']] },
    { k: 'cd', label: 'Classe di difficoltà', type: 'number' },
    { k: 'desc', label: 'Descrizione', type: 'textarea', wide: true },
    { k: 'ignoreText', label: 'Testo se ignorata', type: 'textarea', wide: true },
    { k: 'successText', label: 'Testo di successo', type: 'textarea', wide: true },
    { k: 'failText', label: 'Testo di fallimento', type: 'textarea', wide: true },
    { k: 'reward', label: 'Ricompensa (JSON)', type: 'json', wide: true, nullable: true,
      help: 'Es. { "type": "relic", "name": "…", "desc": "…", "effects": [{ "effect": "party_stat", "stat": "fth", "val": 1 }] } — vuoto = nessuna' },
    { k: 'punishment', label: 'Punizione (JSON)', type: 'json', wide: true, nullable: true,
      help: 'Es. { "type": "curse", "name": "…", "desc": "…", "effects": [{ "effect": "add_curse", "text": "Nome (effetto)" }] } — vuoto = nessuna' }
];

const keysOf = obj => Object.keys(obj || {});
const refOptions = collection => () => [['', '—'], ...keysOf(camp[collection]).map(k => [k, k])];

const NODE_FIELDS = [
    { k: 'id', label: 'Id', type: 'number' },
    { k: 'level', label: 'Livello (0 = partenza)', type: 'number' },
    { k: 'x', label: 'Posizione orizzontale (0–800)', type: 'number' },
    { k: 'type', label: 'Tipo', type: 'select', options: () => Object.entries(NODE_TYPES).map(([k, t]) => [k, t.label]) },
    { k: 'enemy', label: 'Nemico', type: 'select', options: refOptions('enemies'), showIf: n => n.type === 'combat' || n.type === 'elite' },
    { k: 'challengeId', label: 'Sfida', type: 'select', options: refOptions('challenges'), showIf: n => n.type === 'challenge' },
    { k: 'treasureId', label: 'Testo del tesoro', type: 'select', options: refOptions('treasures'), showIf: n => n.type === 'treasure' },
    { k: 'merchantId', label: 'Testo del mercante', type: 'select', options: refOptions('merchants'), showIf: n => n.type === 'merchant' },
    { k: 'restId', label: 'Testo del riposo', type: 'select', options: refOptions('rests'), showIf: n => n.type === 'rest' },
    { k: 'title', label: 'Titolo', wide: true },
    { k: 'icon', label: 'Icona' },
    { k: 'image', label: 'Immagine', type: 'image', folder: 'immagini', wide: true },
    { k: 'next', label: 'Collegamenti (id separati da virgola)', type: 'idlist' },
    { k: 'active', label: 'Nodo di partenza', type: 'checkbox' }
];

const OTHER_SECTIONS = [
    { k: 'merchants', label: 'Testi dei mercanti', help: 'Chiave usata da merchantId nei nodi ("default" vale per tutti).' },
    { k: 'rests', label: 'Testi dei riposi', help: 'Chiave usata da restId nei nodi.' },
    { k: 'treasures', label: 'Testi dei tesori', help: 'Chiave usata da treasureId nei nodi.' }
];

const ITEM_LISTS = { initialArmory: 'Armeria iniziale', lootItems: 'Bottino' };

/* ---------- Stato ---------- */
let camp = null;
let currentTab = 'general';
const selection = { enemies: null, challenges: null, map: null, heroes: 0, itemList: 'initialArmory', item: 0 };
let dirty = false;

const deepCopy = obj => JSON.parse(JSON.stringify(obj));
const esc = str => String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function markDirty() {
    dirty = true;
    renderIssues();
    if (currentTab === 'map') renderMapPreview();
    scheduleDraftSave();
}

window.addEventListener('beforeunload', e => {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
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

function pickImage(folder, onPicked) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
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
        kvSet('draft', { campaign: deepCopy(camp), assets: [...pendingAssets].map(([p, a]) => [p, a.blob]), savedAt: new Date().toLocaleString('it-IT') })
            .catch(() => {});
    }, 800);
}

async function clearDraft() {
    clearTimeout(draftTimer);
    try { await kvDel('draft'); } catch (e) {}
}

async function offerDraftRestore() {
    let draft = null;
    try { draft = await kvGet('draft'); } catch (e) { return false; }
    if (!draft || !draft.campaign) return false;
    if (confirm(`C'è una bozza non salvata di "${draft.campaign.title}" (${draft.savedAt}). Ripristinarla?`)) {
        pendingAssets.clear();
        (draft.assets || []).forEach(([p, blob]) => addPendingAsset(p, blob));
        setCampaign(draft.campaign);
        dirty = true;
        return true;
    }
    await clearDraft();
    return false;
}

/* ---------- Caricamento ---------- */
function fillCampaignSelect() {
    const campaigns = window.CAMPAIGNS || {};
    document.getElementById('edCampaignSelect').innerHTML = Object.values(campaigns)
        .map(c => `<option value="${esc(c.id)}">${esc(c.title)} (${esc(c.id)})</option>`).join('');
}

function confirmDiscard() {
    return !dirty || confirm('Ci sono modifiche non salvate nel progetto. Continuare e perderle?');
}

function setCampaign(data) {
    camp = data;
    ['enemies', 'challenges', 'merchants', 'rests', 'treasures', 'abilities'].forEach(k => { if (!camp[k] || typeof camp[k] !== 'object') camp[k] = {}; });
    ['heroes', 'initialArmory', 'mapNodes'].forEach(k => { if (!Array.isArray(camp[k])) camp[k] = []; });
    if (camp.lootItems !== null && !Array.isArray(camp.lootItems)) camp.lootItems = null;
    selection.enemies = keysOf(camp.enemies)[0] || null;
    selection.challenges = keysOf(camp.challenges)[0] || null;
    selection.map = camp.mapNodes[0] ? camp.mapNodes[0].id : null;
    selection.heroes = 0;
    selection.item = 0;
    heroNameBeforeEdit = camp.heroes[0] ? camp.heroes[0].name : null;
    dirty = false;
    render();
}

function switchCampaign(data) {
    pendingAssets.clear();
    clearDraft();
    setCampaign(data);
}

function loadSelectedCampaign() {
    const id = document.getElementById('edCampaignSelect').value;
    if (!id || !confirmDiscard()) return;
    switchCampaign(deepCopy(window.CAMPAIGNS[id]));
}

function newCampaign() {
    if (!confirmDiscard()) return;
    switchCampaign({
        id: 'nuova_campagna', title: 'Nuova campagna', badge: 'Nuova Campagna', description: '', coverImage: '', introText: '',
        heroes: [], abilities: {}, initialArmory: [], enemies: {}, challenges: {},
        merchants: { default: '' }, rests: { default: '' }, treasures: {}, lootItems: null,
        mapNodes: [{ id: 0, level: 0, x: 400, type: 'combat', enemy: '', title: 'Livello 1 - Scontro', icon: '🗡️', done: false, active: true, next: [], image: '' }]
    });
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

/* ---------- Esportazione ---------- */
// JSON indentato; gli oggetti "piatti" (nodi, eroi, oggetti, effetti) restano su una riga
function formatJson(value, indent = 0) {
    const pad = ' '.repeat(indent), padIn = ' '.repeat(indent + 4);
    const isFlat = x => x === null || typeof x !== 'object' || (Array.isArray(x) && x.every(y => y === null || typeof y !== 'object'));
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) {
        if (value.every(isFlat)) return JSON.stringify(value).replace(/,/g, ', ');
        return '[\n' + value.map(x => padIn + formatJson(x, indent + 4)).join(',\n') + '\n' + pad + ']';
    }
    const entries = Object.entries(value);
    if (entries.length === 0) return '{}';
    const oneLine = '{ ' + entries.map(([k, x]) => JSON.stringify(k) + ': ' + formatJson(x)).join(', ') + ' }';
    const flat = entries.every(([, x]) => isFlat(x)) && !entries.some(([, x]) => typeof x === 'string' && x.length > 120);
    if (flat && oneLine.length <= 260) return oneLine;
    return '{\n' + entries.map(([k, x]) => padIn + JSON.stringify(k) + ': ' + formatJson(x, indent + 4)).join(',\n') + '\n' + pad + '}';
}

function campaignFileText() {
    return `// Campagna "${camp.title}".
// Il contenuto dopo "=" è JSON puro: niente funzioni, gli effetti sono descritti nei campi "effects"
// e interpretati da applyEffects() in js/game.js. È un file .js (e non .json) perché il gioco
// si apre con doppio click da file:// e il browser blocca fetch() di file locali.
window.CAMPAIGNS = window.CAMPAIGNS || {};
window.CAMPAIGNS[${JSON.stringify(camp.id)}] = ${formatJson(camp)};
`;
}

const campaignFilePath = () => `data/campagne/${camp.id}.js`;

// Immagini caricate che la campagna usa ancora (le altre non vengono scritte)
function usedPendingAssets() {
    const used = new Set([camp.coverImage, ...camp.mapNodes.map(n => n.image), ...camp.heroes.flatMap(h => [h.portrait, h.portraitWounded])]);
    return [...pendingAssets].filter(([path]) => used.has(path));
}

function confirmErrors(action) {
    const errors = validateCampaign().filter(i => i.level === 'error');
    return !errors.length || confirm(`Ci sono ${errors.length} errori nei controlli. ${action} comunque?`);
}

function download(blob, name) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

/* Scrittura diretta nel progetto (Edge/Chrome). La cartella scelta viene ricordata. */
async function projectDir(ask) {
    let handle = null;
    try { handle = await kvGet('projectDir'); } catch (e) {}
    if (handle) {
        let perm = await handle.queryPermission({ mode: 'readwrite' });
        if (perm !== 'granted' && ask) perm = await handle.requestPermission({ mode: 'readwrite' });
        if (perm === 'granted') return handle;
    }
    if (!ask) return null;
    try {
        handle = await window.showDirectoryPicker({ id: 'slay-the-dig', mode: 'readwrite' });
    } catch (e) {
        return null;  // selezione annullata
    }
    try {
        await handle.getFileHandle('index.html');
        await handle.getFileHandle('editor.html');
    } catch (e) {
        alert('Scegli la cartella principale del progetto, quella che contiene index.html ed editor.html.');
        return null;
    }
    await kvSet('projectDir', handle);
    return handle;
}

async function forgetProjectDir() {
    await kvDel('projectDir');
    alert('Cartella dimenticata: al prossimo salvataggio verrà chiesta di nuovo.');
}

async function writeProjectFile(root, path, data) {
    const parts = path.split('/');
    let dir = root;
    for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part, { create: true });
    const writable = await (await dir.getFileHandle(parts[parts.length - 1], { create: true })).createWritable();
    await writable.write(data);
    await writable.close();
}

async function readProjectText(root, path) {
    const parts = path.split('/');
    let dir = root;
    for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part);
    return (await (await dir.getFileHandle(parts[parts.length - 1])).getFile()).text();
}

// Aggiunge <script src="data/campagne/<id>.js"> in una pagina, prima dello script indicato
async function ensureScriptTag(root, page, beforeSrc) {
    const text = await readProjectText(root, page);
    const src = campaignFilePath();
    if (text.includes(`"${src}"`)) return false;
    const anchor = `<script src="${beforeSrc}"></script>`;
    const at = text.indexOf(anchor);
    if (at < 0) throw new Error(`in ${page} non trovo ${anchor}`);
    const lineStart = text.lastIndexOf('\n', at) + 1;
    const indent = text.slice(lineStart, at);
    await writeProjectFile(root, page, text.slice(0, lineStart) + `${indent}<script src="${src}"></script>\n` + text.slice(lineStart));
    return true;
}

async function saveToProject() {
    if (!camp || !confirmErrors('Salvare')) return;
    if (!window.showDirectoryPicker) {
        alert('Questo browser non può scrivere nella cartella del progetto: scarico uno .zip da estrarre nella cartella del gioco.');
        return downloadZip();
    }
    const root = await projectDir(true);
    if (!root) return;
    try {
        await writeProjectFile(root, campaignFilePath(), campaignFileText());
        const assets = usedPendingAssets();
        for (const [path, asset] of assets) await writeProjectFile(root, path, asset.blob);
        const added = [];
        if (await ensureScriptTag(root, 'index.html', 'js/game.js')) added.push('index.html');
        if (await ensureScriptTag(root, 'editor.html', 'js/editor.js')) added.push('editor.html');
        dirty = false;
        await clearDraft();
        alert(`Salvato ${campaignFilePath()}` +
            (assets.length ? ` e ${assets.length} immagini` : '') +
            (added.length ? `.\nCampagna nuova: aggiunta a ${added.join(' e ')}; ricarica l'editor per vederla nell'elenco.` : '.'));
    } catch (err) {
        alert(`Salvataggio non riuscito: ${err.message}\nPuoi usare "Scarica .zip".`);
    }
}

/* .zip senza compressione, scritto a mano (nessuna libreria esterna) */
const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c >>> 0;
    }
    return table;
})();
function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
}
async function buildZip(files) {  // files: [[percorso, Blob | stringa]]
    const enc = new TextEncoder();
    const parts = [], central = [];
    let offset = 0;
    for (const [path, content] of files) {
        const data = typeof content === 'string' ? enc.encode(content) : new Uint8Array(await content.arrayBuffer());
        const name = enc.encode(path);
        const crc = crc32(data);
        const local = new DataView(new ArrayBuffer(30));
        local.setUint32(0, 0x04034b50, true); local.setUint16(4, 20, true); local.setUint16(6, 0x0800, true);
        local.setUint32(14, crc, true); local.setUint32(18, data.length, true); local.setUint32(22, data.length, true);
        local.setUint16(26, name.length, true);
        const head = new DataView(new ArrayBuffer(46));
        head.setUint32(0, 0x02014b50, true); head.setUint16(4, 20, true); head.setUint16(6, 20, true); head.setUint16(8, 0x0800, true);
        head.setUint32(16, crc, true); head.setUint32(20, data.length, true); head.setUint32(24, data.length, true);
        head.setUint16(28, name.length, true); head.setUint32(42, offset, true);
        parts.push(local, name, data);
        central.push(head, name);
        offset += 30 + name.length + data.length;
    }
    const size = central.reduce((s, p) => s + (p.byteLength ?? p.length), 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, size, true); end.setUint32(16, offset, true);
    return new Blob([...parts, ...central, end], { type: 'application/zip' });
}

async function downloadZip() {
    if (!camp || !confirmErrors('Scaricare')) return;
    const readme = `Estrai questo archivio nella cartella del gioco (quella con index.html).\n\n` +
        `Se la campagna "${camp.id}" è nuova, aggiungi in index.html (prima di js/game.js) ed editor.html (prima di js/editor.js):\n` +
        `<script src="${campaignFilePath()}"></script>\n`;
    const files = [[campaignFilePath(), campaignFileText()], ...usedPendingAssets().map(([p, a]) => [p, a.blob]), ['LEGGIMI_campagna.txt', readme]];
    download(await buildZip(files), `${camp.id || 'campagna'}.zip`);
    dirty = false;
    await clearDraft();
}

/* Prova nel gioco: il gioco legge la campagna dalla chiave "playtest" (vedi js/game.js) */
async function playtest() {
    if (!camp) return;
    try {
        await kvSet('playtest', { campaign: deepCopy(camp), assets: [...pendingAssets].map(([p, a]) => [p, a.blob]) });
        window.open(`index.html?prova=${encodeURIComponent(camp.id)}`, '_blank');
    } catch (e) {
        alert('Impossibile preparare la prova: archivio del browser non disponibile.');
    }
}

/* ---------- Moduli generici ---------- */
function renderForm(container, obj, fields, onChange) {
    container.innerHTML = '';
    const form = document.createElement('div');
    form.className = 'ed-form';
    fields.forEach(f => {
        if (f.showIf && !f.showIf(obj)) return;
        const wrap = document.createElement('div');
        wrap.className = 'ed-field' + (f.wide ? ' wide' : '');
        const id = `f_${f.k}_${Math.random().toString(36).slice(2, 7)}`;
        wrap.innerHTML = `<label for="${id}">${esc(f.label)}</label>`;
        let input;
        const value = obj[f.k];
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
                const opts = f.options();
                if (value != null && value !== '' && !opts.some(([v]) => v === String(value))) opts.push([String(value), `${value} (non trovato)`]);
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
        }
        input.id = id;
        const commit = () => {
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
            } else v = input.value;
            // Campi facoltativi degli oggetti: vuoto o zero = campo assente, per tenere pulito il JSON
            if (f.omitEmpty && (v === null || v === '' || v === 0)) delete obj[f.k];
            else obj[f.k] = v;
            onChange(f.k);
        };
        input.addEventListener(f.type === 'select' || f.type === 'checkbox' ? 'change' : 'input', commit);
        wrap.appendChild(input);

        // Campo immagine: percorso + pulsante di caricamento + anteprima
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
            btn.addEventListener('click', () => pickImage(f.folder || 'immagini', path => { input.value = path; commit(); updateThumb(); }));
            input.addEventListener('input', updateThumb);
            row.append(input, btn, thumb);
            updateThumb();
        }
        if (f.help) wrap.insertAdjacentHTML('beforeend', `<span class="ed-help">${esc(f.help)}</span>`);
        form.appendChild(wrap);
    });
    container.appendChild(form);
}

// Lista a sinistra + dettaglio a destra per le raccolte con chiave (nemici, sfide)
function renderKeyedCollection(collection, fields, labelOf, refField) {
    const content = document.getElementById('edContent');
    const items = camp[collection];
    const keys = keysOf(items);
    if (!keys.includes(selection[collection])) selection[collection] = keys[0] || null;
    const sel = selection[collection];

    content.innerHTML = `
        <div class="ed-list-actions">
            <button onclick="addKeyed('${collection}')">Aggiungi</button>
            <button onclick="duplicateKeyed('${collection}')" ${sel ? '' : 'disabled'}>Duplica</button>
            <button onclick="renameKeyed('${collection}', '${refField}')" ${sel ? '' : 'disabled'}>Rinomina chiave</button>
            <button class="ed-danger" onclick="deleteKeyed('${collection}', '${refField}')" ${sel ? '' : 'disabled'}>Elimina</button>
        </div>
        <div class="ed-split">
            <div class="ed-list">${keys.map(k => `
                <div class="ed-list-item ${k === sel ? 'active' : ''}" onclick="selectKeyed('${collection}', '${esc(k)}')">
                    ${esc(labelOf(items[k]) || k)}<small>${esc(k)} · ${usageCount(refField, k)} nodi</small>
                </div>`).join('') || '<div class="ed-list-item">Nessun elemento</div>'}
            </div>
            <div class="ed-detail" id="edDetail"></div>
        </div>`;
    if (sel) {
        renderForm(document.getElementById('edDetail'), items[sel], fields, () => {
            markDirty();
            const active = document.querySelector('.ed-list-item.active');
            if (active) active.firstChild.textContent = labelOf(items[sel]) || sel;
        });
    }
}

function usageCount(refField, key) {
    return camp.mapNodes.filter(n => n[refField] === key).length;
}

function selectKeyed(collection, key) {
    selection[collection] = key;
    render();
}

function askKey(collection, suggestion) {
    const key = prompt('Chiave (solo lettere minuscole, numeri e _):', suggestion);
    if (key == null) return null;
    if (!/^[a-z0-9_]+$/.test(key)) { alert('Chiave non valida.'); return null; }
    if (camp[collection][key]) { alert('Esiste già un elemento con questa chiave.'); return null; }
    return key;
}

function addKeyed(collection) {
    const key = askKey(collection, collection === 'enemies' ? 'nuovo_nemico' : 'nuova_sfida');
    if (!key) return;
    camp[collection][key] = collection === 'enemies'
        ? { name: 'Nuovo nemico', hp: 8, maxHp: 8, att: 7, dmg: 1, ca: 7, desc: '' }
        : { title: 'Nuova sfida', desc: '', ignoreText: '', successText: '', failText: '', stat: 'int', cd: 7, reward: null, punishment: null };
    selection[collection] = key;
    markDirty();
    render();
}

function duplicateKeyed(collection) {
    const src = selection[collection];
    const key = askKey(collection, `${src}_copia`);
    if (!key) return;
    camp[collection][key] = deepCopy(camp[collection][src]);
    selection[collection] = key;
    markDirty();
    render();
}

function renameKeyed(collection, refField) {
    const oldKey = selection[collection];
    const key = askKey(collection, oldKey);
    if (!key) return;
    // Ricostruisce l'oggetto per mantenere l'ordine delle chiavi
    camp[collection] = Object.fromEntries(Object.entries(camp[collection]).map(([k, v]) => [k === oldKey ? key : k, v]));
    camp.mapNodes.forEach(n => { if (n[refField] === oldKey) n[refField] = key; });
    selection[collection] = key;
    markDirty();
    render();
}

function deleteKeyed(collection, refField) {
    const key = selection[collection];
    const used = usageCount(refField, key);
    if (!confirm(`Eliminare "${key}"?${used ? ` È usato da ${used} nodi della mappa.` : ''}`)) return;
    delete camp[collection][key];
    selection[collection] = null;
    markDirty();
    render();
}

/* ---------- Eroi ---------- */
function renderHeroesTab() {
    const content = document.getElementById('edContent');
    const heroes = camp.heroes;
    if (selection.heroes >= heroes.length) selection.heroes = heroes.length - 1;
    const hero = heroes[selection.heroes];

    content.innerHTML = `
        <div class="ed-list-actions">
            <button onclick="addHero()">Aggiungi eroe</button>
            <button onclick="duplicateHero()" ${hero ? '' : 'disabled'}>Duplica</button>
            <button class="ed-danger" onclick="deleteHero()" ${hero ? '' : 'disabled'}>Elimina</button>
        </div>
        <div class="ed-split">
            <div class="ed-list">${heroes.map((h, i) => `
                <div class="ed-list-item ed-hero-item ${i === selection.heroes ? 'active' : ''}" onclick="selectHero(${i})">
                    ${h.portrait ? `<img class="ed-list-portrait" src="${esc(assetUrl(h.portrait))}" alt="" onerror="this.hidden=true">` : ''}
                    <span>${esc(h.name)}<small>FOR ${h.str} · INT ${h.int} · FEDE ${h.fth} · HP ${h.maxHp} · ${(camp.abilities[h.name] || []).length} abilità</small></span>
                </div>`).join('') || '<div class="ed-list-item">Nessun eroe</div>'}
            </div>
            <div class="ed-detail">
                <div id="edHeroForm"></div>
                <h3>Abilità (JSON)</h3>
                <div id="edHeroAbilities"></div>
            </div>
        </div>`;
    if (!hero) return;

    renderForm(document.getElementById('edHeroForm'), hero, HERO_FIELDS, key => {
        if (key === 'name') renameHeroAbilities(hero);
        if (key === 'maxHp') hero.hp = hero.maxHp;
        if (key === 'base_armor') hero.current_armor = hero.base_armor;
        markDirty();
    });
    const holder = { abilities: camp.abilities[hero.name] || [] };
    renderForm(document.getElementById('edHeroAbilities'), holder, [{
        k: 'abilities', label: 'Elenco delle abilità tra cui scegliere', type: 'json', wide: true,
        help: 'Passive: { "id", "name", "desc", "isCombatActive": false, "effects": [...] } oppure { "name", "type": "passive_stat", "stat", "val" }. ' +
              'Attive: { "id", "name", "desc", "isCombatActive": true, "actionName" } — il comportamento è in js/game.js per id.'
    }], () => {
        camp.abilities[hero.name] = holder.abilities;
        markDirty();
    });
}

// Le abilità sono indicizzate per nome dell'eroe: seguono il rinomina mantenendo l'ordine
let heroNameBeforeEdit = null;
function renameHeroAbilities(hero) {
    const oldName = heroNameBeforeEdit;
    heroNameBeforeEdit = hero.name;
    if (oldName == null || oldName === hero.name || !(oldName in camp.abilities)) return;
    camp.abilities = Object.fromEntries(Object.entries(camp.abilities).map(([k, v]) => [k === oldName ? hero.name : k, v]));
}

function selectHero(i) {
    selection.heroes = i;
    heroNameBeforeEdit = camp.heroes[i] ? camp.heroes[i].name : null;
    render();
}

function newHeroTemplate(name) {
    return { name, str: 3, int: 2, fth: 2, maxHp: 4, hp: 4, dmg: 1, base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, items: [] };
}

function uniqueHeroName(base) {
    let name = base, n = 2;
    while (camp.heroes.some(h => h.name === name)) name = `${base} ${n++}`;
    return name;
}

function addHero() {
    const hero = newHeroTemplate(uniqueHeroName('Nuovo eroe'));
    camp.heroes.push(hero);
    camp.abilities[hero.name] = [];
    selectHero(camp.heroes.length - 1);
    markDirty();
}

function duplicateHero() {
    const src = camp.heroes[selection.heroes];
    const hero = { ...deepCopy(src), name: uniqueHeroName(`${src.name} (copia)`) };
    camp.heroes.push(hero);
    camp.abilities[hero.name] = deepCopy(camp.abilities[src.name] || []);
    selectHero(camp.heroes.length - 1);
    markDirty();
}

function deleteHero() {
    const hero = camp.heroes[selection.heroes];
    if (!confirm(`Eliminare ${hero.name} e le sue abilità?`)) return;
    camp.heroes.splice(selection.heroes, 1);
    delete camp.abilities[hero.name];
    selectHero(Math.max(0, selection.heroes - 1));
    markDirty();
}

/* ---------- Oggetti (armeria iniziale e bottino) ---------- */
function renderItemsTab() {
    const content = document.getElementById('edContent');
    const listKey = selection.itemList;
    const usesDefault = listKey === 'lootItems' && camp.lootItems === null;
    const list = usesDefault ? [] : camp[listKey];
    if (selection.item >= list.length) selection.item = list.length - 1;
    const item = list[selection.item];

    content.innerHTML = `
        <div class="ed-list-actions">
            ${Object.entries(ITEM_LISTS).map(([k, label]) => `<button class="ed-subtab ${k === listKey ? 'active' : ''}" onclick="selectItemList('${k}')">${label}</button>`).join('')}
        </div>
        ${listKey === 'lootItems' ? `<label class="ed-check"><input type="checkbox" ${usesDefault ? 'checked' : ''} onchange="toggleDefaultLoot(this.checked)">
            Usa il catalogo predefinito del gioco (in js/game.js) invece di un bottino proprio</label>` : ''}
        ${usesDefault ? '' : `
        <div class="ed-list-actions">
            <button onclick="addItem()">Aggiungi oggetto</button>
            <button onclick="duplicateItem()" ${item ? '' : 'disabled'}>Duplica</button>
            <button class="ed-danger" onclick="deleteItem()" ${item ? '' : 'disabled'}>Elimina</button>
        </div>
        <div class="ed-split">
            <div class="ed-list">${list.map((it, i) => `
                <div class="ed-list-item ${i === selection.item ? 'active' : ''}" onclick="selectItem(${i})">
                    ${esc(it.name || it.id)}<small>${esc(it.id)}${it.rarity ? ' · ' + esc(it.rarity) : ''} · ${esc(it.desc || '')}</small>
                </div>`).join('') || '<div class="ed-list-item">Nessun oggetto</div>'}
            </div>
            <div class="ed-detail" id="edDetail"></div>
        </div>`}`;
    if (!item) return;
    renderForm(document.getElementById('edDetail'), item, ITEM_FIELDS, key => {
        markDirty();
        if (key === 'type') renderItemsTab();
    });
}

function selectItemList(k) { selection.itemList = k; selection.item = 0; render(); }
function selectItem(i) { selection.item = i; render(); }

function toggleDefaultLoot(useDefault) {
    if (!useDefault && camp.lootItems === null) camp.lootItems = [];
    else if (useDefault && camp.lootItems && camp.lootItems.length && !confirm('Eliminare il bottino proprio della campagna?')) return render();
    else if (useDefault) camp.lootItems = null;
    markDirty();
    render();
}

function uniqueItemId(base) {
    const all = new Set([...camp.initialArmory, ...(camp.lootItems || [])].map(i => i.id));
    let id = base, n = 2;
    while (all.has(id)) id = `${base}_${n++}`;
    return id;
}

function addItem() {
    const list = camp[selection.itemList];
    list.push({ id: uniqueItemId('nuovo_oggetto'), name: 'Nuovo oggetto', rarity: 'comune', desc: '' });
    selection.item = list.length - 1;
    markDirty();
    render();
}

function duplicateItem() {
    const list = camp[selection.itemList];
    const src = list[selection.item];
    list.push({ ...deepCopy(src), id: uniqueItemId(`${src.id}_copia`) });
    selection.item = list.length - 1;
    markDirty();
    render();
}

function deleteItem() {
    const list = camp[selection.itemList];
    if (!confirm(`Eliminare ${list[selection.item].name}?`)) return;
    list.splice(selection.item, 1);
    selection.item = Math.max(0, selection.item - 1);
    markDirty();
    render();
}

/* ---------- Mappa ---------- */
function renderMapTab() {
    const content = document.getElementById('edContent');
    const nodes = camp.mapNodes;
    if (!nodes.some(n => n.id === selection.map)) selection.map = nodes[0] ? nodes[0].id : null;
    const sel = nodes.find(n => n.id === selection.map);
    const sorted = [...nodes].sort((a, b) => a.level - b.level || a.x - b.x);

    content.innerHTML = `
        <div class="ed-map-wrap">
            <div class="ed-map" id="edMap"></div>
            <div class="ed-legend">${Object.values(NODE_TYPES).map(t => `<span style="--c:${t.color}">${t.label}</span>`).join('')}
                <span style="--c:transparent; outline:2px solid var(--wc-yellow); border-radius:50%">partenza</span></div>
        </div>
        <div class="ed-list-actions">
            <button onclick="addNode()">Aggiungi nodo</button>
            <button onclick="duplicateNode()" ${sel ? '' : 'disabled'}>Duplica</button>
            <button onclick="renumberNodes()">Rinumera id</button>
            <button class="ed-danger" onclick="deleteNode()" ${sel ? '' : 'disabled'}>Elimina</button>
        </div>
        <div class="ed-split">
            <div class="ed-list">${sorted.map(n => `
                <div class="ed-list-item ${n.id === selection.map ? 'active' : ''}" onclick="selectNode(${n.id})">
                    ${esc(n.icon || '')} ${esc(n.title || '(senza titolo)')}
                    <small>id ${n.id} · livello ${n.level} · ${esc(NODE_TYPES[n.type] ? NODE_TYPES[n.type].label : n.type)} → ${(n.next || []).join(', ') || 'fine'}</small>
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
        if (key === 'id') selection.map = node.id;
        markDirty();
    });
}

function renderMapPreview() {
    const box = document.getElementById('edMap');
    if (!box) return;
    const nodes = camp.mapNodes;
    const maxLevel = Math.max(1, ...nodes.map(n => n.level || 0));
    const W = 800, stepY = 70, H = maxLevel * stepY + 80;
    const pos = n => ({ x: Math.max(20, Math.min(W - 20, n.x || 0)), y: H - 40 - (n.level || 0) * stepY });
    const byId = new Map(nodes.map(n => [n.id, n]));

    let svg = '';
    for (let l = 0; l <= maxLevel; l++) svg += `<text class="level-label" x="6" y="${H - 36 - l * stepY}">L${l + 1}</text>`;
    nodes.forEach(n => (n.next || []).forEach(id => {
        const a = pos(n), target = byId.get(id);
        if (!target) return;
        const b = pos(target);
        const bad = (target.level || 0) <= (n.level || 0);
        svg += `<line class="edge ${bad ? 'bad' : ''}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
    }));
    nodes.forEach(n => {
        const p = pos(n);
        const t = NODE_TYPES[n.type] || { color: '#777' };
        svg += `<g class="node ${n.active ? 'active-node' : ''} ${n.id === selection.map ? 'selected' : ''}" onclick="selectNode(${n.id})">
            <title>${esc(n.title)} (id ${n.id})</title>
            <circle cx="${p.x}" cy="${p.y}" r="16" fill="${t.color}"/>
            <text x="${p.x}" y="${p.y + 4}">${n.id}</text></g>`;
    });
    box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
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

/* ---------- Testi (JSON) ---------- */
function renderOtherTab() {
    const content = document.getElementById('edContent');
    content.innerHTML = OTHER_SECTIONS.map(s => `<h3>${esc(s.label)}</h3><div id="edOther_${s.k}"></div>`).join('');
    OTHER_SECTIONS.forEach(s => renderForm(document.getElementById(`edOther_${s.k}`), camp,
        [{ k: s.k, label: 'JSON', type: 'json', wide: true, help: s.help }], markDirty));
}

/* ---------- Generale ---------- */
function renderGeneralTab() {
    const content = document.getElementById('edContent');
    content.innerHTML = `<div class="ed-detail" id="edDetail"></div>`;
    renderForm(document.getElementById('edDetail'), camp, GENERAL_FIELDS, markDirty);
}

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

function checkEffects(effects, where, issues, tab, sel) {
    if (effects == null) return;
    if (!Array.isArray(effects)) { issues.push({ level: 'error', msg: `${where}: "effects" deve essere un elenco`, tab, sel }); return; }
    effects.forEach(e => {
        const needed = KNOWN_EFFECTS[e && e.effect];
        if (!needed) issues.push({ level: 'error', msg: `${where}: effetto sconosciuto "${e && e.effect}"`, tab, sel });
        else needed.filter(p => e[p] === undefined).forEach(p => issues.push({ level: 'error', msg: `${where}: all'effetto "${e.effect}" manca "${p}"`, tab, sel }));
    });
}

function validateCampaign() {
    const issues = [];
    const add = (level, msg, tab, sel) => issues.push({ level, msg, tab, sel });
    if (!camp.id || !/^[a-z0-9_]+$/.test(camp.id)) add('error', 'Id della campagna mancante o non valido', 'general');
    if (!camp.title) add('warn', 'Titolo della campagna mancante', 'general');
    if (checkImage(camp.coverImage) === 'missing') add('warn', `Copertina non trovata: ${camp.coverImage}`, 'general');

    if (!camp.heroes.length) add('error', 'Nessun eroe nella campagna', 'heroes');
    const heroNames = new Map();
    camp.heroes.forEach((h, i) => {
        heroNames.set(h.name, (heroNames.get(h.name) || 0) + 1);
        const name = `Eroe <b>${esc(h.name)}</b>`;
        ['str', 'int', 'fth', 'maxHp', 'dmg'].forEach(f => { if (typeof h[f] !== 'number') add('error', `${name}: "${f}" non è un numero`, 'heroes', i); });
        if (!(camp.abilities[h.name] || []).length) add('warn', `${name}: nessuna abilità tra cui scegliere`, 'heroes', i);
        if (checkImage(h.portrait) === 'missing') add('warn', `${name}: ritratto non trovato ${h.portrait}`, 'heroes', i);
        if (checkImage(h.portraitWounded) === 'missing') add('warn', `${name}: ritratto da ferito non trovato ${h.portraitWounded}`, 'heroes', i);
    });
    heroNames.forEach((count, n) => { if (count > 1) add('error', `Più eroi si chiamano <b>${esc(n)}</b>`, 'heroes'); });
    Object.keys(camp.abilities).forEach(n => { if (!heroNames.has(n)) add('warn', `Abilità per <b>${esc(n)}</b>, che non è tra gli eroi`, 'heroes'); });

    Object.keys(ITEM_LISTS).forEach(listKey => {
        const ids = new Map();
        (camp[listKey] || []).forEach(it => {
            ids.set(it.id, (ids.get(it.id) || 0) + 1);
            if (!it.id) add('error', `${ITEM_LISTS[listKey]}: oggetto senza id`, 'items');
            if (!it.name) add('warn', `${ITEM_LISTS[listKey]}: oggetto <b>${esc(it.id)}</b> senza nome`, 'items');
        });
        ids.forEach((count, id) => { if (count > 1) add('error', `${ITEM_LISTS[listKey]}: id <b>${esc(id)}</b> ripetuto`, 'items'); });
    });

    Object.entries(camp.enemies).forEach(([k, e]) => {
        ['hp', 'maxHp', 'att', 'dmg', 'ca'].forEach(f => { if (typeof e[f] !== 'number') add('error', `Nemico <b>${k}</b>: "${f}" non è un numero`, 'enemies', k); });
        if (e.hp !== e.maxHp) add('warn', `Nemico <b>${k}</b>: HP (${e.hp}) diversi da HP massimi (${e.maxHp})`, 'enemies', k);
        if (!e.name) add('warn', `Nemico <b>${k}</b>: nome mancante`, 'enemies', k);
    });

    Object.entries(camp.challenges).forEach(([k, c]) => {
        if (!['int', 'fth', 'str'].includes(c.stat)) add('error', `Sfida <b>${k}</b>: statistica non valida`, 'challenges', k);
        if (typeof c.cd !== 'number') add('error', `Sfida <b>${k}</b>: classe di difficoltà mancante`, 'challenges', k);
        ['desc', 'successText', 'failText', 'ignoreText'].forEach(f => { if (!c[f]) add('warn', `Sfida <b>${k}</b>: testo "${f}" vuoto`, 'challenges', k); });
        if (c.reward) checkEffects(c.reward.effects, `Sfida <b>${k}</b> (ricompensa)`, issues, 'challenges', k);
        if (c.punishment) checkEffects(c.punishment.effects, `Sfida <b>${k}</b> (punizione)`, issues, 'challenges', k);
    });

    Object.entries(camp.abilities).forEach(([hero, list]) => (list || []).forEach(a => {
        const i = camp.heroes.findIndex(h => h.name === hero);
        if (a.effects) checkEffects(a.effects, `Abilità <b>${esc(a.name)}</b> di ${esc(hero)}`, issues, 'heroes', i >= 0 ? i : undefined);
    }));

    const nodes = camp.mapNodes;
    const ids = new Map();
    nodes.forEach(n => ids.set(n.id, (ids.get(n.id) || 0) + 1));
    const byId = new Map(nodes.map(n => [n.id, n]));
    const incoming = new Set(nodes.flatMap(n => n.next || []));
    if (!nodes.some(n => n.active)) add('error', 'Nessun nodo di partenza (spunta "Nodo di partenza")', 'map');
    nodes.forEach(n => {
        const name = `Nodo <b>${n.id}</b>`;
        if (ids.get(n.id) > 1) add('error', `${name}: id duplicato`, 'map', n.id);
        const type = NODE_TYPES[n.type];
        if (!type) add('error', `${name}: tipo "${n.type}" sconosciuto`, 'map', n.id);
        else if (type.ref === 'enemy' && !camp.enemies[n.enemy]) add('error', `${name}: nemico "${n.enemy || ''}" inesistente`, 'map', n.id);
        else if (type.ref === 'challengeId' && !camp.challenges[n.challengeId]) add('warn', `${name}: sfida "${n.challengeId || ''}" inesistente (il gioco userà una sfida vuota)`, 'map', n.id);
        else if (type.ref && ['treasureId', 'merchantId', 'restId'].includes(type.ref)) {
            const coll = { treasureId: 'treasures', merchantId: 'merchants', restId: 'rests' }[type.ref];
            if (camp[coll][n[type.ref]] == null && !(type.ref === 'merchantId' && camp.merchants.default)) add('warn', `${name}: testo "${n[type.ref]}" non trovato in ${coll} (verrà usato un testo generico)`, 'map', n.id);
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
    return issues;
}

function renderIssues() {
    if (!camp) return;
    const issues = validateCampaign().sort((a, b) => (a.level === 'error' ? 0 : 1) - (b.level === 'error' ? 0 : 1));
    const errors = issues.filter(i => i.level === 'error').length;
    document.getElementById('edIssueCount').textContent = issues.length ? `(${errors} errori, ${issues.length - errors} avvisi)` : '';
    document.getElementById('edIssues').innerHTML = issues.length
        ? issues.map((i, idx) => `<div class="ed-issue ${i.level}" data-idx="${idx}">${i.msg}</div>`).join('')
        : '<p class="ed-ok">Nessun problema trovato.</p>';
    document.querySelectorAll('#edIssues .ed-issue').forEach(el => el.addEventListener('click', () => {
        const issue = issues[el.dataset.idx];
        if (issue.sel != null) {
            if (issue.tab === 'heroes') { selection.heroes = issue.sel; heroNameBeforeEdit = (camp.heroes[issue.sel] || {}).name; }
            else selection[issue.tab] = issue.sel;
        }
        switchTab(issue.tab);
    }));
}

/* ---------- Navigazione ---------- */
const TABS = ['general', 'map', 'heroes', 'items', 'enemies', 'challenges', 'other'];

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('#edTabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    if (tab === 'heroes') heroNameBeforeEdit = (camp.heroes[selection.heroes] || {}).name ?? null;
    render();
}

document.getElementById('edTabs').addEventListener('click', e => {
    if (e.target.dataset.tab) switchTab(e.target.dataset.tab);
});

function render() {
    if (!camp) return;
    if (currentTab === 'general') renderGeneralTab();
    else if (currentTab === 'map') renderMapTab();
    else if (currentTab === 'heroes') renderHeroesTab();
    else if (currentTab === 'items') renderItemsTab();
    else if (currentTab === 'enemies') renderKeyedCollection('enemies', ENEMY_FIELDS, e => e.name, 'enemy');
    else if (currentTab === 'challenges') renderKeyedCollection('challenges', CHALLENGE_FIELDS, c => c.title, 'challengeId');
    else renderOtherTab();
    renderIssues();
}

fillCampaignSelect();
const firstCampaign = Object.values(window.CAMPAIGNS || {})[0];
if (firstCampaign) setCampaign(deepCopy(firstCampaign)); else newCampaign();

// Apre direttamente una scheda da indirizzo, es. editor.html#map
if (TABS.includes(location.hash.slice(1))) switchTab(location.hash.slice(1));

// Se c'è una bozza non salvata, propone di ripristinarla
if (window.indexedDB) offerDraftRestore();
