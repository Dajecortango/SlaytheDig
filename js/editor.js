/* ==========================================================================
   EDITOR DELLE CAMPAGNE
   Modifica le campagne (data/campagne/<id>.js) e la libreria condivisa
   (data/libreria/: armeria, bestiario, reliquie, maledizioni) con moduli,
   anteprima della mappa e controlli automatici.
   Le campagne richiamano gli elementi della libreria per id (vedi js/libreria.js):
   nei nodi si sceglie il nemico dal bestiario, nelle sfide ricompensa e punizione
   da reliquie e maledizioni, nella campagna l'armeria iniziale e il bottino dall'armeria.
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
    { k: 'name', label: 'Nome', wide: true, help: 'Il nome decide anche il ritratto se l\'eroe ne ha uno in HERO_PORTRAITS (js/game.js)' },
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

// Eroe della libreria: statistiche + abilità tra cui scegliere
const HERO_LIB_FIELDS = [...HERO_FIELDS, {
    k: 'abilities', label: 'Abilità tra cui scegliere (JSON)', type: 'json', wide: true,
    help: 'Passive: { "id", "name", "desc", "isCombatActive": false, "effects": [...] } oppure { "name", "type": "passive_stat", "stat", "val" }. ' +
          'Attive: { "id", "name", "desc", "isCombatActive": true, "actionName" } — il comportamento è in js/game.js per id.'
}];

// Oggetto dell'armeria (l'id è la chiave nella libreria)
const ITEM_FIELDS = [
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
    { k: 'image', label: 'Immagine dello scontro', type: 'image', folder: 'immagini', wide: true,
      help: 'Usata da tutti i nodi con questo nemico, salvo quelli che indicano un\'immagine propria' },
    { k: 'hp', label: 'HP', type: 'number' },
    { k: 'maxHp', label: 'HP massimi', type: 'number' },
    { k: 'att', label: 'Attacco', type: 'number', help: 'Da superare per difendersi e aiutare' },
    { k: 'ca', label: 'Classe armatura', type: 'number', help: 'Da superare per colpire' },
    { k: 'dmg', label: 'Danno', type: 'number' },
    { k: 'desc', label: 'Descrizione', type: 'textarea', wide: true },
    { k: 'sfxAttack', label: 'Suono quando attacca', type: 'audio', folder: 'audio/nemici', wide: true },
    { k: 'sfxHit', label: 'Suono quando viene colpito', type: 'audio', folder: 'audio/nemici', wide: true },
    { k: 'sfxDeath', label: 'Suono quando muore', type: 'audio', folder: 'audio/nemici', wide: true,
      help: 'Vuoti = suoni generati del gioco. Se manca quello della morte, alla morte suona quello del colpo.' }
];

const RELIC_FIELDS = [
    { k: 'name', label: 'Nome', wide: true, help: 'Molte reliquie hanno un effetto legato al nome esatto in js/game.js (hasRelic): rinominarle ne cambia il comportamento' },
    { k: 'desc', label: 'Descrizione mostrata al giocatore', wide: true },
    { k: 'effects', label: 'Effetti all\'ottenimento (JSON)', type: 'json', wide: true, nullable: true,
      help: 'Es. [{ "effect": "party_stat", "stat": "fth", "val": 1 }] — vuoto = nessun effetto immediato' }
];

const CURSE_FIELDS = [
    { k: 'name', label: 'Nome', wide: true },
    { k: 'desc', label: 'Descrizione mostrata al giocatore', wide: true },
    { k: 'effects', label: 'Effetti (JSON)', type: 'json', wide: true, nullable: true,
      help: 'Di solito { "effect": "add_curse", "text": "Nome (effetto)" } più eventuali penalità, es. { "effect": "party_stat", "stat": "fth", "val": -1 }' }
];

const keysOf = obj => Object.keys(obj || {});
const refOptions = collection => () => [['', '—'], ...keysOf(camp[collection]).map(k => [k, k])];
const enemyOptions = () => [['', '—'], ...Object.entries(lib.bestiario).map(([k, e]) => [k, `${e.name} (HP ${e.maxHp} · CA ${e.ca} · Att ${e.att} · Danno ${e.dmg})`])];

const CHALLENGE_FIELDS = [
    { k: 'title', label: 'Titolo', wide: true },
    { k: 'stat', label: 'Statistica', type: 'select', options: () => [['int', 'Intelligenza'], ['fth', 'Fede'], ['str', 'Forza']] },
    { k: 'cd', label: 'Classe di difficoltà', type: 'number' },
    { k: 'desc', label: 'Descrizione', type: 'textarea', wide: true },
    { k: 'ignoreText', label: 'Testo se ignorata', type: 'textarea', wide: true },
    { k: 'successText', label: 'Testo di successo', type: 'textarea', wide: true },
    { k: 'failText', label: 'Testo di fallimento', type: 'textarea', wide: true },
    { k: 'reward', label: 'Ricompensa', type: 'libref', lib: 'reliquie', wide: true,
      custom: () => ({ type: 'coins', name: '', desc: '', effects: [{ effect: 'coins', val: 10 }] }),
      help: 'Una reliquia della libreria, oppure "Personalizzata" per un premio immediato (es. monete)' },
    { k: 'punishment', label: 'Punizione', type: 'libref', lib: 'maledizioni', wide: true,
      custom: () => ({ type: 'injury', name: '', desc: '', effects: [{ effect: 'party_damage', val: 1 }] }),
      help: 'Una maledizione della libreria, oppure "Personalizzata" per un danno o una penalità immediata' }
];

const NODE_FIELDS = [
    { k: 'id', label: 'Id', type: 'number' },
    { k: 'level', label: 'Livello (0 = partenza)', type: 'number' },
    { k: 'x', label: 'Posizione orizzontale (0–800)', type: 'number' },
    { k: 'type', label: 'Tipo', type: 'select', options: () => Object.entries(NODE_TYPES).map(([k, t]) => [k, t.label]) },
    { k: 'enemy', label: 'Nemico (dal bestiario)', type: 'select', options: enemyOptions, wide: true, showIf: n => n.type === 'combat' || n.type === 'elite' },
    { k: 'challengeId', label: 'Sfida', type: 'select', options: refOptions('challenges'), showIf: n => n.type === 'challenge' },
    { k: 'treasureId', label: 'Testo del tesoro', type: 'select', options: refOptions('treasures'), showIf: n => n.type === 'treasure' },
    { k: 'merchantId', label: 'Testo del mercante', type: 'select', options: refOptions('merchants'), showIf: n => n.type === 'merchant' },
    { k: 'restId', label: 'Testo del riposo', type: 'select', options: refOptions('rests'), showIf: n => n.type === 'rest' },
    { k: 'title', label: 'Titolo', wide: true },
    { k: 'icon', label: 'Icona' },
    { k: 'image', label: 'Immagine', type: 'image', folder: 'immagini', wide: true,
      help: 'Negli scontri, vuoto = immagine del nemico nel bestiario' },
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
let camp = null;                                         // campagna in modifica, con i riferimenti per id
let lib = JSON.parse(JSON.stringify(window.LIBRERIA));   // copia modificabile della libreria condivisa
const libDirty = new Set();                              // file della libreria modificati (armeria, bestiario, ...)
let currentTab = 'general';
const selection = { challenges: null, map: null, itemList: 'initialArmory',
                    bestiario: null, armeria: null, reliquie: null, maledizioni: null, eroi: null };
let dirty = false;

const deepCopy = obj => JSON.parse(JSON.stringify(obj));
const esc = str => String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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

async function offerDraftRestore() {
    let draft = null;
    try { draft = await kvGet('draft'); } catch (e) { return false; }
    if (!draft || !draft.campaign) return false;
    const libNote = (draft.libDirty || []).length ? ` e modifiche alla libreria (${draft.libDirty.join(', ')})` : '';
    if (confirm(`C'è una bozza non salvata di "${draft.campaign.title}"${libNote} (${draft.savedAt}). Ripristinarla?`)) {
        pendingAssets.clear();
        (draft.assets || []).forEach(([p, blob]) => addPendingAsset(p, blob));
        if (draft.library) lib = draft.library;
        libDirty.clear();
        (draft.libDirty || []).forEach(k => libDirty.add(k));
        setCampaign(draft.campaign);
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

function setCampaign(data) {
    camp = data;
    ['challenges', 'merchants', 'rests', 'treasures'].forEach(k => { if (!camp[k] || typeof camp[k] !== 'object') camp[k] = {}; });
    ['heroes', 'initialArmory', 'mapNodes'].forEach(k => { if (!Array.isArray(camp[k])) camp[k] = []; });
    if (camp.lootItems !== null && !Array.isArray(camp.lootItems)) camp.lootItems = null;
    selection.challenges = keysOf(camp.challenges)[0] || null;
    selection.map = camp.mapNodes[0] ? camp.mapNodes[0].id : null;
    dirty = false;
    render();
}

function switchCampaign(data) {
    pendingAssets.clear();
    if (!libDirty.size) clearDraft();
    setCampaign(data);
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

/* ---------- Riferimenti alla libreria in tutte le campagne ---------- */
// Per ogni campagna (quella in modifica e le altre caricate) restituisce quante volte usa l'elemento
function libraryUsage(kind, key) {
    const count = raw => {
        if (kind === 'bestiario') return (raw.mapNodes || []).filter(n => n.enemy === key).length;
        if (kind === 'reliquie') return Object.values(raw.challenges || {}).filter(c => c.reward === key).length;
        if (kind === 'maledizioni') return Object.values(raw.challenges || {}).filter(c => c.punishment === key).length;
        if (kind === 'eroi') return (raw.heroes || []).filter(h => h === key).length;
        if (kind === 'armeria') {
            const loot = raw.lootItems === null || raw.lootItems === undefined ? [] : raw.lootItems;
            return [...(raw.initialArmory || []), ...loot].filter(r => r === key).length;
        }
        return 0;
    };
    const uses = [];
    const others = Object.values(rawCampaigns()).filter(c => !camp || c.id !== camp.id);
    [camp, ...others].filter(Boolean).forEach(raw => {
        const n = count(raw);
        if (n) uses.push({ id: raw.id, title: raw.title, n, current: raw === camp });
    });
    if (kind === 'armeria' && (lib.lootPredefinito || []).includes(key)) uses.push({ id: '', title: 'bottino predefinito', n: 1, current: true });
    return uses;
}

function usageText(uses) {
    return uses.length ? uses.map(u => `${u.title}${u.n > 1 ? ` (${u.n})` : ''}`).join(', ') : 'non usato';
}

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
// Nemici, oggetti, reliquie e maledizioni sono richiamati per id da data/libreria/.
window.CAMPAIGNS = window.CAMPAIGNS || {};
window.CAMPAIGNS[${JSON.stringify(camp.id)}] = ${formatJson(camp)};
`;
}

const LIB_KINDS = ['armeria', 'bestiario', 'reliquie', 'maledizioni', 'eroi'];
const LIB_LABELS = { armeria: 'Armeria', bestiario: 'Bestiario', reliquie: 'Reliquie', maledizioni: 'Maledizioni', eroi: 'Eroi' };
const LIB_HEADERS = {
    armeria: 'Armeria: tutti gli oggetti (armi, armature, consumabili...), condivisi dalle campagne.\n// Le campagne li richiamano per id in "initialArmory" e "lootItems".',
    bestiario: 'Bestiario: tutti i nemici, condivisi dalle campagne.\n// I nodi della mappa li richiamano per id nel campo "enemy".',
    reliquie: 'Reliquie: ricompense delle sfide, condivise dalle campagne.\n// Le sfide le richiamano per id nel campo "reward". Molte reliquie hanno un effetto\n// gestito per nome in js/game.js (hasRelic): rinominarle ne cambia il comportamento.',
    maledizioni: 'Maledizioni: punizioni delle sfide, condivise dalle campagne.\n// Le sfide le richiamano per id nel campo "punishment".',
    eroi: 'Eroi: statistiche iniziali e abilità tra cui scegliere, condivisi dalle campagne.\n// Le campagne li richiamano per id nel campo "heroes". Le abilità attive (isCombatActive)\n// sono gestite per id in js/game.js; il ritratto, se manca in HERO_PORTRAITS, viene da "portrait".'
};

function libraryFileText(kind) {
    const extra = kind === 'armeria'
        ? `\n// Bottino delle campagne con "lootItems": null\nwindow.LIBRERIA.lootPredefinito = ${formatJson(lib.lootPredefinito || [])};\n`
        : '';
    return `// ${LIB_HEADERS[kind]}
// Il contenuto dopo "=" è JSON puro. Si modifica anche dall'editor delle campagne.
window.LIBRERIA = window.LIBRERIA || {};
window.LIBRERIA.${kind} = ${formatJson(lib[kind])};
${extra}`;
}

const campaignFilePath = () => `data/campagne/${camp.id}.js`;
const libraryFilePath = kind => `data/libreria/${kind}.js`;

// Immagini caricate che la campagna usa ancora (le altre non vengono scritte)
function usedPendingAssets() {
    const used = new Set([camp.coverImage, ...camp.mapNodes.map(n => n.image),
        ...Object.values(lib.bestiario).flatMap(e => [e.image, e.sfxAttack, e.sfxHit, e.sfxDeath]),
        ...Object.values(lib.eroi || {}).flatMap(h => [h.portrait, h.portraitWounded])]);
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
    const eol = text.includes('\r\n') ? '\r\n' : '\n';
    await writeProjectFile(root, page, text.slice(0, lineStart) + `${indent}<script src="${src}"></script>${eol}` + text.slice(lineStart));
    return true;
}

// File da scrivere: la campagna, i file di libreria modificati, le immagini caricate
function filesToSave() {
    return [
        [campaignFilePath(), campaignFileText()],
        ...[...libDirty].map(kind => [libraryFilePath(kind), libraryFileText(kind)]),
        ...usedPendingAssets().map(([p, a]) => [p, a.blob])
    ];
}

function afterSave() {
    dirty = false;
    libDirty.clear();
    // Le altre campagne aperte in seguito devono vedere la libreria aggiornata
    window.LIBRERIA = deepCopy(lib);
    clearDraft();
    render();
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
        const files = filesToSave();
        for (const [path, data] of files) await writeProjectFile(root, path, data);
        const added = [];
        if (await ensureScriptTag(root, 'index.html', 'js/libreria.js')) added.push('index.html');
        if (await ensureScriptTag(root, 'editor.html', 'js/libreria.js')) added.push('editor.html');
        const libs = [...libDirty];
        afterSave();
        alert(`Salvati ${files.length} file:\n${files.map(([p]) => '• ' + p).join('\n')}` +
            (libs.length ? `\n\nLibreria aggiornata (${libs.join(', ')}): vale per tutte le campagne.` : '') +
            (added.length ? `\n\nCampagna nuova: aggiunta a ${added.join(' e ')}; ricarica l'editor per vederla nell'elenco.` : ''));
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
    const readme = `Estrai questo archivio nella cartella del gioco (quella con index.html), sovrascrivendo i file.\n\n` +
        `Se la campagna "${camp.id}" è nuova, aggiungi in index.html ed editor.html, subito prima di js/libreria.js:\n` +
        `<script src="${campaignFilePath()}"></script>\n` +
        (libDirty.size ? `\nL'archivio contiene anche la libreria modificata (${[...libDirty].join(', ')}), che vale per tutte le campagne.\n` : '');
    download(await buildZip([...filesToSave(), ['LEGGIMI_campagna.txt', readme]]), `${camp.id || 'campagna'}.zip`);
    afterSave();
}

/* Prova nel gioco: il gioco legge la campagna (e la libreria modificata) dalla chiave "playtest" (vedi js/game.js) */
async function playtest() {
    if (!camp) return;
    try {
        await kvSet('playtest', {
            campaign: deepCopy(camp),
            library: libDirty.size ? deepCopy(lib) : null,
            assets: [...pendingAssets].map(([p, a]) => [p, a.blob])
        });
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

        // Riferimento a una libreria (reliquie, maledizioni) oppure elemento personalizzato scritto nella sfida
        if (f.type === 'libref') {
            input = document.createElement('select');
            const entries = Object.entries(lib[f.lib]).map(([k, v]) => [k, `${v.name} — ${v.desc || ''}`]);
            const mode = value == null ? '' : typeof value === 'string' ? value : '__custom';
            if (typeof value === 'string' && !lib[f.lib][value]) entries.push([value, `${value} (non trovato)`]);
            input.innerHTML = [['', '— Nessuna —'], ...entries, ['__custom', 'Personalizzata (scritta nella sfida)…']]
                .map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('');
            input.value = mode;
            input.id = id;
            input.addEventListener('change', () => {
                if (input.value === '') obj[f.k] = null;
                else if (input.value === '__custom') obj[f.k] = typeof value === 'object' && value ? value : f.custom();
                else obj[f.k] = input.value;
                onChange(f.k);
                render();
            });
            wrap.appendChild(input);
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
                wrap.insertAdjacentHTML('beforeend', `<a href="#" class="ed-goto" onclick="gotoLibrary('${f.lib}', '${esc(mode)}'); return false;">Modifica in ${LIB_LABELS[f.lib]}</a>`);
            }
            if (f.help) wrap.insertAdjacentHTML('beforeend', `<span class="ed-help">${esc(f.help)}</span>`);
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
            // Campi facoltativi: vuoto o zero = campo assente, per tenere pulito il JSON
            if ((f.omitEmpty && (v === null || v === '' || v === 0)) || (f.type === 'json' && f.nullable && v === null)) delete obj[f.k];
            else obj[f.k] = v;
            onChange(f.k);
        };
        input.addEventListener(f.type === 'select' || f.type === 'checkbox' ? 'change' : 'input', commit);
        wrap.appendChild(input);

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
        }
        if (f.k === 'enemy' && value && lib.bestiario[value]) {
            wrap.insertAdjacentHTML('beforeend', `<a href="#" class="ed-goto" onclick="gotoLibrary('bestiario', '${esc(value)}'); return false;">Modifica nel Bestiario</a>`);
        }
        if (f.help) wrap.insertAdjacentHTML('beforeend', `<span class="ed-help">${esc(f.help)}</span>`);
        form.appendChild(wrap);
    });
    container.appendChild(form);
}

/* ---------- Raccolte con chiave: sfide (campagna) e le quattro librerie ---------- */
const COLLECTIONS = {
    challenges: {
        store: () => camp.challenges, setStore: v => { camp.challenges = v; },
        fields: CHALLENGE_FIELDS, label: c => c.title, keyHint: 'nuova_sfida',
        create: () => ({ title: 'Nuova sfida', desc: '', ignoreText: '', successText: '', failText: '', stat: 'int', cd: 7, reward: null, punishment: null }),
        usage: key => { const n = camp.mapNodes.filter(nd => nd.challengeId === key).length; return n ? [{ title: camp.title, n, current: true }] : []; },
        renameRefs: (oldKey, key) => camp.mapNodes.forEach(n => { if (n.challengeId === oldKey) n.challengeId = key; }),
        dirty: () => markDirty()
    },
    bestiario: {
        library: true, fields: ENEMY_FIELDS, label: e => e.name, keyHint: 'nuovo_nemico',
        create: () => ({ name: 'Nuovo nemico', hp: 8, maxHp: 8, att: 7, dmg: 1, ca: 7, desc: '' }),
        sub: e => `HP ${e.maxHp} · CA ${e.ca} · Att ${e.att} · Danno ${e.dmg}`,
        renameRefs: (oldKey, key) => camp.mapNodes.forEach(n => { if (n.enemy === oldKey) n.enemy = key; })
    },
    armeria: {
        library: true, fields: ITEM_FIELDS, label: i => i.name, keyHint: 'nuovo_oggetto',
        create: key => ({ id: key, name: 'Nuovo oggetto', rarity: 'comune', desc: '' }),
        sub: i => [i.rarity, i.desc].filter(Boolean).join(' · '),
        afterKeyChange: (obj, key) => { obj.id = key; },
        renameRefs: (oldKey, key) => {
            const swap = list => list && list.forEach((r, i) => { if (r === oldKey) list[i] = key; });
            swap(camp.initialArmory); swap(camp.lootItems); swap(lib.lootPredefinito);
        }
    },
    reliquie: {
        library: true, fields: RELIC_FIELDS, label: r => r.name, keyHint: 'nuova_reliquia',
        create: () => ({ type: 'relic', name: 'Nuova reliquia', desc: '' }),
        sub: r => r.desc,
        renameRefs: (oldKey, key) => Object.values(camp.challenges).forEach(c => { if (c.reward === oldKey) c.reward = key; })
    },
    eroi: {
        library: true, fields: HERO_LIB_FIELDS, label: h => h.name, keyHint: 'nuovo_eroe',
        create: () => ({ ...newHeroTemplate('Nuovo eroe'), abilities: [] }),
        sub: h => `FOR ${h.str} · INT ${h.int} · FEDE ${h.fth} · HP ${h.maxHp} · ${(h.abilities || []).length} abilità`,
        afterChange: (h, key) => {
            if (key === 'maxHp') h.hp = h.maxHp;
            if (key === 'base_armor') h.current_armor = h.base_armor;
        },
        renameRefs: (oldKey, key) => camp.heroes.forEach((h, i) => { if (h === oldKey) camp.heroes[i] = key; })
    },
    maledizioni: {
        library: true, fields: CURSE_FIELDS, label: c => c.name, keyHint: 'nuova_maledizione',
        create: () => ({ type: 'curse', name: 'Nuova maledizione', desc: '', effects: [{ effect: 'add_curse', text: 'Nuova maledizione' }] }),
        sub: c => c.desc,
        renameRefs: (oldKey, key) => Object.values(camp.challenges).forEach(c => { if (c.punishment === oldKey) c.punishment = key; })
    }
};
LIB_KINDS.forEach(kind => Object.assign(COLLECTIONS[kind], {
    store: () => lib[kind], setStore: v => { lib[kind] = v; },
    usage: key => libraryUsage(kind, key),
    dirty: () => markLibDirty(kind)
}));

function renderCollection(name) {
    const col = COLLECTIONS[name];
    const content = document.getElementById('edContent');
    const items = col.store();
    const keys = keysOf(items);
    if (!keys.includes(selection[name])) selection[name] = keys[0] || null;
    const sel = selection[name];
    const intro = col.library
        ? `<p class="ed-lib-note">Libreria condivisa da tutte le campagne (<code>${libraryFilePath(name)}</code>). Le modifiche valgono ovunque l'elemento è usato.</p>`
        : '';

    content.innerHTML = `${intro}
        <div class="ed-list-actions">
            <button onclick="addKeyed('${name}')">Aggiungi</button>
            <button onclick="duplicateKeyed('${name}')" ${sel ? '' : 'disabled'}>Duplica</button>
            <button onclick="renameKeyed('${name}')" ${sel ? '' : 'disabled'}>Rinomina id</button>
            <button class="ed-danger" onclick="deleteKeyed('${name}')" ${sel ? '' : 'disabled'}>Elimina</button>
        </div>
        <div class="ed-split">
            <div class="ed-list">${keys.map(k => `
                <div class="ed-list-item ${k === sel ? 'active' : ''}" onclick="selectKeyed('${name}', '${esc(k)}')">
                    ${esc(col.label(items[k]) || k)}<small>${esc(k)}${col.sub ? ' · ' + esc(col.sub(items[k]) || '') : ''}</small>
                    <small class="ed-usage">${esc(usageText(col.usage(k)))}</small>
                </div>`).join('') || '<div class="ed-list-item">Nessun elemento</div>'}
            </div>
            <div class="ed-detail" id="edDetail"></div>
        </div>`;
    if (sel) {
        const uses = col.usage(sel);
        const detail = document.getElementById('edDetail');
        renderForm(detail, items[sel], col.fields, key => {
            if (col.afterChange) col.afterChange(items[sel], key);
            col.dirty();
            const active = document.querySelector('.ed-list-item.active');
            if (active && (key === 'name' || key === 'title')) active.firstChild.textContent = col.label(items[sel]) || sel;
        });
        detail.insertAdjacentHTML('afterbegin', `<p class="ed-usage-box"><b>Id:</b> <code>${esc(sel)}</code> · <b>Usato in:</b> ${esc(usageText(uses))}</p>`);
    }
}

function selectKeyed(name, key) {
    selection[name] = key;
    render();
}

function gotoLibrary(kind, key) {
    selection[kind] = key;
    switchTab(kind);
}

function askKey(name, suggestion) {
    const key = prompt('Id (solo lettere minuscole, numeri e _):', suggestion);
    if (key == null) return null;
    if (!/^[a-z0-9_]+$/.test(key)) { alert('Id non valido.'); return null; }
    if (COLLECTIONS[name].store()[key]) { alert('Esiste già un elemento con questo id.'); return null; }
    return key;
}

function addKeyed(name) {
    const col = COLLECTIONS[name];
    const key = askKey(name, col.keyHint);
    if (!key) return;
    col.store()[key] = col.create(key);
    selection[name] = key;
    col.dirty();
    render();
}

function duplicateKeyed(name) {
    const col = COLLECTIONS[name];
    const src = selection[name];
    const key = askKey(name, `${src}_copia`);
    if (!key) return;
    col.store()[key] = deepCopy(col.store()[src]);
    if (col.afterKeyChange) col.afterKeyChange(col.store()[key], key);
    selection[name] = key;
    col.dirty();
    render();
}

// Uso in campagne diverse da quella aperta: lì l'editor non può aggiornare i riferimenti
const usedElsewhere = uses => uses.filter(u => !u.current);

function renameKeyed(name) {
    const col = COLLECTIONS[name];
    const oldKey = selection[name];
    const elsewhere = col.library ? usedElsewhere(col.usage(oldKey)) : [];
    if (elsewhere.length) {
        alert(`"${oldKey}" è usato anche in: ${usageText(elsewhere)}.\nApri quelle campagne e sostituiscilo prima di cambiare l'id, altrimenti smetterebbero di trovarlo.`);
        return;
    }
    const key = askKey(name, oldKey);
    if (!key) return;
    // Ricostruisce l'oggetto per mantenere l'ordine delle chiavi
    col.setStore(Object.fromEntries(Object.entries(col.store()).map(([k, v]) => [k === oldKey ? key : k, v])));
    if (col.afterKeyChange) col.afterKeyChange(col.store()[key], key);
    col.renameRefs(oldKey, key);
    selection[name] = key;
    col.dirty();
    if (col.library) markDirty();  // i riferimenti nella campagna aperta sono cambiati
    render();
}

function deleteKeyed(name) {
    const col = COLLECTIONS[name];
    const key = selection[name];
    const uses = col.usage(key);
    if (col.library && uses.length) {
        alert(`"${key}" è usato in: ${usageText(uses)}.\nToglilo da lì prima di eliminarlo dalla libreria.`);
        return;
    }
    if (!confirm(`Eliminare "${key}"?${uses.length ? ` È usato da ${uses[0].n} nodi della mappa.` : ''}`)) return;
    delete col.store()[key];
    selection[name] = null;
    col.dirty();
    render();
}

/* ---------- Eroi della campagna: scelti dalla libreria ---------- */
function heroRefLabel(ref) {
    if (typeof ref !== 'string') return `${ref.name} (scritto nella campagna)`;
    const h = lib.eroi[ref];
    return h ? h.name : `${ref} (non trovato fra gli eroi)`;
}

function renderHeroesTab() {
    const content = document.getElementById('edContent');
    const available = Object.entries(lib.eroi).filter(([id]) => !camp.heroes.includes(id));
    content.innerHTML = `
        <p class="ed-lib-note">Gli eroi stanno nella libreria <a href="#" onclick="switchTab('eroi'); return false;">Eroi</a>, condivisa da tutte le campagne:
            qui si sceglie quali può reclutare questa campagna. Statistiche, ritratti e abilità si modificano lì.</p>
        <div class="ed-detail">
            <div class="ed-picklist">${camp.heroes.map((ref, i) => {
                const h = typeof ref === 'string' ? lib.eroi[ref] : ref;
                return `
                <div class="ed-pick">
                    ${h && h.portrait ? `<img class="ed-list-portrait" src="${esc(assetUrl(h.portrait))}" alt="" onerror="this.hidden=true">` : ''}
                    <span>${esc(heroRefLabel(ref))}<small>${h ? `FOR ${h.str} · INT ${h.int} · FEDE ${h.fth} · HP ${h.maxHp} · ${(h.abilities || []).length} abilità` : ''}</small></span>
                    ${typeof ref === 'string' && lib.eroi[ref] ? `<button class="btn-small" onclick="gotoLibrary('eroi', '${esc(ref)}')">Modifica</button>` : ''}
                    <button class="btn-small ed-danger" onclick="removeCampaignHero(${i})">Togli</button>
                </div>`;
            }).join('') || '<p class="ed-help">Nessun eroe: aggiungine almeno uno.</p>'}
            </div>
            <div class="ed-add-row">
                <select id="edAddHero">${available.map(([id, h]) => `<option value="${esc(id)}">${esc(h.name)} — FOR ${h.str} · INT ${h.int} · FEDE ${h.fth} · HP ${h.maxHp}</option>`).join('')}</select>
                <button class="btn-small" onclick="addCampaignHero()" ${available.length ? '' : 'disabled'}>Aggiungi dalla libreria</button>
            </div>
        </div>`;
}

function newHeroTemplate(name) {
    return { name, str: 3, int: 2, fth: 2, maxHp: 4, hp: 4, dmg: 1, base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, items: [] };
}

function addCampaignHero() {
    const id = document.getElementById('edAddHero').value;
    if (!id) return;
    camp.heroes.push(id);
    markDirty();
    render();
}

function removeCampaignHero(i) {
    camp.heroes.splice(i, 1);
    markDirty();
    render();
}

/* ---------- Oggetti della campagna: scelti dall'armeria ---------- */
function itemLabel(ref) {
    if (typeof ref !== 'string') return `${ref.name} (scritto nella campagna)`;
    const it = lib.armeria[ref];
    return it ? `${it.name}${it.rarity ? ' · ' + it.rarity : ''}` : `${ref} (non trovato nell'armeria)`;
}

function renderItemsTab() {
    const content = document.getElementById('edContent');
    const listKey = selection.itemList;
    const usesDefault = listKey === 'lootItems' && camp.lootItems === null;
    const list = usesDefault ? (lib.lootPredefinito || []) : camp[listKey];
    const available = Object.entries(lib.armeria).filter(([id]) => usesDefault || !list.includes(id));

    content.innerHTML = `
        <div class="ed-list-actions">
            ${Object.entries(ITEM_LISTS).map(([k, label]) => `<button class="ed-subtab ${k === listKey ? 'active' : ''}" onclick="selectItemList('${k}')">${label}</button>`).join('')}
        </div>
        <p class="ed-lib-note">Gli oggetti stanno nell'<a href="#" onclick="switchTab('armeria'); return false;">Armeria</a>, condivisa da tutte le campagne: qui si sceglie quali usa questa campagna.</p>
        ${listKey === 'lootItems' ? `<label class="ed-check"><input type="checkbox" ${usesDefault ? 'checked' : ''} onchange="toggleDefaultLoot(this.checked)">
            Usa il bottino predefinito (elenco nell'armeria, condiviso)</label>` : ''}
        <div class="ed-detail">
            <div class="ed-picklist">${list.map((ref, i) => `
                <div class="ed-pick">
                    <span>${esc(itemLabel(ref))}<small>${esc(typeof ref === 'string' ? ref : ref.id)}${typeof ref === 'string' && lib.armeria[ref] ? ' · ' + esc(lib.armeria[ref].desc || '') : ''}</small></span>
                    ${typeof ref === 'string' && lib.armeria[ref] ? `<button class="btn-small" onclick="gotoLibrary('armeria', '${esc(ref)}')">Modifica</button>` : ''}
                    ${usesDefault ? '' : `<button class="btn-small ed-danger" onclick="removeCampaignItem(${i})">Togli</button>`}
                </div>`).join('') || '<p class="ed-help">Nessun oggetto.</p>'}
            </div>
            ${usesDefault ? '' : `
            <div class="ed-add-row">
                <select id="edAddItem">${available.map(([id, it]) => `<option value="${esc(id)}">${esc(it.name)}${it.rarity ? ' · ' + esc(it.rarity) : ''} — ${esc(it.desc || '')}</option>`).join('')}</select>
                <button class="btn-small" onclick="addCampaignItem()" ${available.length ? '' : 'disabled'}>Aggiungi dall'armeria</button>
            </div>`}
        </div>`;
}

function selectItemList(k) { selection.itemList = k; render(); }

function toggleDefaultLoot(useDefault) {
    if (useDefault) {
        if (camp.lootItems && camp.lootItems.length && !confirm('Sostituire il bottino della campagna con quello predefinito?')) return render();
        camp.lootItems = null;
    } else {
        camp.lootItems = [...(lib.lootPredefinito || [])];
    }
    markDirty();
    render();
}

function addCampaignItem() {
    const id = document.getElementById('edAddItem').value;
    if (!id) return;
    camp[selection.itemList].push(id);
    markDirty();
    render();
}

function removeCampaignItem(i) {
    camp[selection.itemList].splice(i, 1);
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
            <button onclick="addNode()">Aggiungi nodo</button>
            <button onclick="duplicateNode()" ${sel ? '' : 'disabled'}>Duplica</button>
            <button onclick="renumberNodes()">Rinumera id</button>
            <button class="ed-danger" onclick="deleteNode()" ${sel ? '' : 'disabled'}>Elimina</button>
        </div>
        <div class="ed-split">
            <div class="ed-list">${sorted.map(n => `
                <div class="ed-list-item ${n.id === selection.map ? 'active' : ''}" onclick="selectNode(${n.id})">
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

// Come checkImage, per i file audio
function checkAudio(path) {
    if (!path || pendingAssets.has(path)) return 'ok';
    if (!imageStatus.has(path)) {
        imageStatus.set(path, 'pending');
        const audio = new Audio();
        audio.addEventListener('loadedmetadata', () => { imageStatus.set(path, 'ok'); renderIssues(); });
        audio.addEventListener('error', () => { imageStatus.set(path, 'missing'); renderIssues(); });
        audio.preload = 'metadata';
        audio.src = path;
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
    camp.heroes.forEach(ref => {
        if (typeof ref === 'string' && !lib.eroi[ref]) add('error', `Eroe <b>${esc(ref)}</b> non trovato nella libreria Eroi`, 'heroes');
    });

    // Oggetti della campagna: devono esistere nell'armeria
    Object.entries(ITEM_LISTS).forEach(([listKey, label]) => {
        (camp[listKey] || []).forEach(ref => {
            if (typeof ref === 'string' && !lib.armeria[ref]) add('error', `${label}: oggetto <b>${esc(ref)}</b> non trovato nell'armeria`, 'items');
        });
    });
    if (!camp.initialArmory.length) add('warn', 'Armeria iniziale vuota: gli eroi partono senza oggetti da scegliere', 'items');

    Object.entries(camp.challenges).forEach(([k, c]) => {
        if (!['int', 'fth', 'str'].includes(c.stat)) add('error', `Sfida <b>${k}</b>: statistica non valida`, 'challenges', k);
        if (typeof c.cd !== 'number') add('error', `Sfida <b>${k}</b>: classe di difficoltà mancante`, 'challenges', k);
        ['desc', 'successText', 'failText', 'ignoreText'].forEach(f => { if (!c[f]) add('warn', `Sfida <b>${k}</b>: testo "${f}" vuoto`, 'challenges', k); });
        [['reward', 'reliquie', 'ricompensa'], ['punishment', 'maledizioni', 'punizione']].forEach(([field, kind, label]) => {
            const v = c[field];
            if (typeof v === 'string' && !lib[kind][v]) add('error', `Sfida <b>${k}</b>: ${label} "${esc(v)}" non trovata in ${LIB_LABELS[kind]}`, 'challenges', k);
            else if (v && typeof v === 'object') checkEffects(v.effects, `Sfida <b>${k}</b> (${label})`, issues, 'challenges', k);
        });
    });

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
        else if (type.ref === 'enemy' && !lib.bestiario[n.enemy] && !(camp.enemies && camp.enemies[n.enemy])) add('error', `${name}: nemico "${n.enemy || ''}" non trovato nel bestiario`, 'map', n.id);
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

    // Libreria condivisa
    Object.entries(lib.bestiario).forEach(([k, e]) => {
        ['hp', 'maxHp', 'att', 'dmg', 'ca'].forEach(f => { if (typeof e[f] !== 'number') add('error', `Bestiario <b>${k}</b>: "${f}" non è un numero`, 'bestiario', k); });
        if (checkImage(e.image) === 'missing') add('warn', `Bestiario <b>${k}</b>: immagine non trovata ${esc(e.image)}`, 'bestiario', k);
        ['sfxAttack', 'sfxHit', 'sfxDeath'].forEach(f => { if (checkAudio(e[f]) === 'missing') add('warn', `Bestiario <b>${k}</b>: suono non trovato ${esc(e[f])}`, 'bestiario', k); });
        if (e.hp !== e.maxHp) add('warn', `Bestiario <b>${k}</b>: HP (${e.hp}) diversi da HP massimi (${e.maxHp})`, 'bestiario', k);
        if (!e.name) add('warn', `Bestiario <b>${k}</b>: nome mancante`, 'bestiario', k);
    });
    Object.entries(lib.armeria).forEach(([k, it]) => {
        if (it.id !== k) add('error', `Armeria <b>${k}</b>: il campo id ("${esc(it.id)}") deve coincidere con la chiave`, 'armeria', k);
        if (!it.name) add('warn', `Armeria <b>${k}</b>: nome mancante`, 'armeria', k);
    });
    (lib.lootPredefinito || []).forEach(id => { if (!lib.armeria[id]) add('error', `Bottino predefinito: "${esc(id)}" non trovato nell'armeria`, 'armeria'); });
    Object.entries(lib.reliquie).forEach(([k, r]) => {
        if (!r.name) add('warn', `Reliquia <b>${k}</b>: nome mancante`, 'reliquie', k);
        checkEffects(r.effects, `Reliquia <b>${k}</b>`, issues, 'reliquie', k);
    });
    const heroNames = new Map();
    Object.entries(lib.eroi).forEach(([k, h]) => {
        heroNames.set(h.name, (heroNames.get(h.name) || 0) + 1);
        const name = `Eroe <b>${esc(h.name)}</b>`;
        ['str', 'int', 'fth', 'maxHp', 'dmg'].forEach(f => { if (typeof h[f] !== 'number') add('error', `${name}: "${f}" non è un numero`, 'eroi', k); });
        if (!(h.abilities || []).length) add('warn', `${name}: nessuna abilità tra cui scegliere`, 'eroi', k);
        (h.abilities || []).forEach(a => { if (a.effects) checkEffects(a.effects, `Abilità <b>${esc(a.name)}</b> di ${esc(h.name)}`, issues, 'eroi', k); });
        if (checkImage(h.portrait) === 'missing') add('warn', `${name}: ritratto non trovato ${esc(h.portrait)}`, 'eroi', k);
        if (checkImage(h.portraitWounded) === 'missing') add('warn', `${name}: ritratto da ferito non trovato ${esc(h.portraitWounded)}`, 'eroi', k);
    });
    heroNames.forEach((count, n) => { if (count > 1) add('error', `Più eroi della libreria si chiamano <b>${esc(n)}</b>`, 'eroi'); });
    Object.entries(lib.maledizioni).forEach(([k, c]) => {
        if (!c.name) add('warn', `Maledizione <b>${k}</b>: nome mancante`, 'maledizioni', k);
        checkEffects(c.effects, `Maledizione <b>${k}</b>`, issues, 'maledizioni', k);
    });
    return issues;
}

function renderIssues() {
    if (!camp) return;
    const issues = validateCampaign().sort((a, b) => (a.level === 'error' ? 0 : 1) - (b.level === 'error' ? 0 : 1));
    const errors = issues.filter(i => i.level === 'error').length;
    document.getElementById('edIssueCount').textContent = issues.length ? `(${errors} errori, ${issues.length - errors} avvisi)` : '';
    const unsavedLib = libDirty.size ? `<p class="ed-lib-unsaved">Libreria modificata e non salvata: ${[...libDirty].map(k => LIB_LABELS[k]).join(', ')}</p>` : '';
    document.getElementById('edIssues').innerHTML = unsavedLib + (issues.length
        ? issues.map((i, idx) => `<div class="ed-issue ${i.level}" data-idx="${idx}">${i.msg}</div>`).join('')
        : '<p class="ed-ok">Nessun problema trovato.</p>');
    document.querySelectorAll('#edIssues .ed-issue').forEach(el => el.addEventListener('click', () => {
        const issue = issues[el.dataset.idx];
        if (issue.sel != null) {
            selection[issue.tab] = issue.sel;
        }
        switchTab(issue.tab);
    }));
}

/* ---------- Navigazione ---------- */
const TABS = ['general', 'map', 'heroes', 'items', 'challenges', 'other', ...LIB_KINDS];

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('#edTabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    render();
}

document.getElementById('edTabs').addEventListener('click', e => {
    const btn = e.target.closest('button[data-tab]');
    if (btn) switchTab(btn.dataset.tab);
});

function render() {
    if (!camp) return;
    if (currentTab === 'general') renderGeneralTab();
    else if (currentTab === 'map') renderMapTab();
    else if (currentTab === 'heroes') renderHeroesTab();
    else if (currentTab === 'items') renderItemsTab();
    else if (currentTab === 'other') renderOtherTab();
    else renderCollection(currentTab);  // sfide e librerie
    renderIssues();
}

fillCampaignSelect();
const firstCampaign = Object.values(rawCampaigns())[0];
if (firstCampaign) setCampaign(deepCopy(firstCampaign)); else newCampaign();

// Apre direttamente una scheda da indirizzo, es. editor.html#bestiario
if (TABS.includes(location.hash.slice(1))) switchTab(location.hash.slice(1));

// Se c'è una bozza non salvata, propone di ripristinarla
if (window.indexedDB) offerDraftRestore();
