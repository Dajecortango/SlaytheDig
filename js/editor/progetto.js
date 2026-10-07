/* ==========================================================================
   EDITOR: ESPORTAZIONE E SALVATAGGIO NEL PROGETTO
   Riferimenti alla libreria in tutte le campagne, testo dei file di campagna e libreria,
   "Salva nel progetto" (File System Access API), .zip scritto a mano, "Prova nel gioco".
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

/* ---------- Riferimenti alla libreria in tutte le campagne ---------- */
// Per ogni campagna (quella in modifica e le altre caricate) restituisce quante volte usa l'elemento
function libraryUsage(kind, key) {
    // Le abilità sono usate dagli eroi della libreria, non direttamente dalle campagne
    if (kind === 'abilita') {
        return Object.entries(lib.eroi).filter(([, h]) => (h.abilities || []).includes(key))
            .map(([id, h]) => ({ id, title: h.name, n: 1, current: true }));
    }
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

const LIB_KINDS = ['armeria', 'bestiario', 'reliquie', 'maledizioni', 'eroi', 'abilita'];
const LIB_LABELS = { armeria: 'Armeria', bestiario: 'Bestiario', reliquie: 'Reliquie', maledizioni: 'Maledizioni', eroi: 'Eroi', abilita: 'Abilità' };
const LIB_HEADERS = {
    armeria: 'Armeria: tutti gli oggetti (armi, armature, consumabili...), condivisi dalle campagne.\n// Le campagne li richiamano per id in "initialArmory" e "lootItems".',
    bestiario: 'Bestiario: tutti i nemici, condivisi dalle campagne.\n// I nodi della mappa li richiamano per id nel campo "enemy".',
    reliquie: 'Reliquie: ricompense delle sfide, condivise dalle campagne.\n// Le sfide le richiamano per id nel campo "reward". Molte reliquie hanno un effetto\n// gestito per nome in js/game.js (hasRelic): rinominarle ne cambia il comportamento.',
    maledizioni: 'Maledizioni: punizioni delle sfide, condivise dalle campagne.\n// Le sfide le richiamano per id nel campo "punishment".',
    eroi: 'Eroi: statistiche iniziali e abilità tra cui scegliere, condivisi dalle campagne.\n// Le campagne li richiamano per id nel campo "heroes"; le abilità sono id della libreria Abilità\n// (data/libreria/abilita.js). Ritratti: "portrait" e "portraitWounded" (2 HP o meno),\n// inquadratura nell\'icona con "portraitPos" (punto da tenere al centro) e "portraitZoom";\n// "portraitWoundedPos"/"portraitWoundedZoom" se il ritratto da ferito va inquadrato diversamente,\n// "portraitStrikeZoom" per lo zoom nella cinematica d\'attacco (vuoto = calcolato da portraitZoom).',
    abilita: 'Abilità: passive e attive degli eroi, condivise dalla libreria Eroi.\n// Gli eroi le richiamano per id nel campo "abilities". Le passive agiscono con "effects"\n// (o con "type": "passive_stat"); le attive (isCombatActive) agiscono con "combat" (vedi abilityCombat in js/game.js).\n// "icon" è l\'icona di Warcraft III mostrata nel gioco.'
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
        ...Object.values(lib.bestiario).flatMap(e => [e.image, e.video, e.sfxAttack, e.sfxHit, e.sfxDeath]),
        ...Object.values(lib.eroi || {}).flatMap(h => [h.portrait, h.portraitWounded]),
        ...Object.values(lib.abilita || {}).map(a => a.icon)]);
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

/* Scrittura diretta nel progetto (Edge/Chrome). La cartella scelta viene ricordata, ma deve essere
   quella da cui è aperto l'editor: se è un'altra copia del progetto (per esempio una cartella estratta
   da uno .zip) la si dimentica e si chiede di nuovo, così non si salva nella copia sbagliata. */

// Nome della cartella da cui è aperto editor.html (solo con file://; con un server non si può sapere)
function openedFolderName() {
    if (location.protocol !== 'file:') return null;
    const parts = decodeURIComponent(location.pathname).split('/').filter(Boolean);
    return parts.length >= 2 ? parts[parts.length - 2] : null;
}

async function projectDir(ask) {
    const expected = openedFolderName();
    let handle = null;
    try { handle = await kvGet('projectDir'); } catch (e) {}
    if (handle && expected && handle.name !== expected) {
        await kvDel('projectDir');
        if (ask) alert(`La cartella ricordata per i salvataggi è «${handle.name}», ma l'editor è aperto da «${expected}».\n\nScegli la cartella «${expected}»: i file verranno aggiornati lì.`);
        handle = null;
    }
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
    if (expected && handle.name !== expected &&
        !confirm(`Hai scelto «${handle.name}», ma l'editor è aperto da «${expected}».\n\nSalvare comunque in «${handle.name}»? (Annulla per non salvare)`)) {
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
        alert(`Salvati ${files.length} file nella cartella «${root.name}»:\n${files.map(([p]) => '• ' + p).join('\n')}` +
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
