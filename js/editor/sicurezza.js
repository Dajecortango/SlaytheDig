/* ==========================================================================
   EDITOR: RETE DI SICUREZZA
   Annulla / Ripeti (Ctrl+Z / Ctrl+Y fuori dalle caselle di testo, pulsanti ↶ ↷): a ogni markDirty /
   markLibDirty si tiene la fotografia di prima (campagna + libreria); i cambiamenti allo stesso elemento
   entro 1 secondo sono un passo solo; al massimo HISTORY_MAX passi.
   Finestra di conferma (edConfirm) al posto di confirm(), messaggio in basso con "Annulla" (edToast),
   copia di un elemento della libreria usato anche altrove, solo per la campagna aperta (copyForCampaign).
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

const HISTORY_MAX = 50;
const HISTORY_MERGE_MS = 1000;
let histBase = null;        // fotografia dello stato attuale (stringa JSON)
let undoStack = [], redoStack = [];
let lastRecordAt = 0, lastRecordKey = '';
let historyRestoring = false;
let savedState = null;      // campagna e libreria com'erano all'ultimo salvataggio (per "non salvata" dopo un annulla)

function historyMarkSaved() {
    savedState = { camp: JSON.stringify(camp), lib: Object.fromEntries(LIB_KINDS.map(k => [k, JSON.stringify(lib[k])])) };
}

const snapshotState = () => JSON.stringify({ camp, lib, libDirty: [...libDirty], dirty });

function historyReset() {
    savedState = null;
    histBase = snapshotState();
    undoStack = [];
    redoStack = [];
    lastRecordAt = 0;
    updateUndoButtons();
}

// Nome del passo: scheda ed elemento (es. "Nemici: Lupo")
function historyLabel() {
    const btn = document.querySelector(`#edTabs button[data-tab="${currentTab}"]`);
    const tab = (btn && btn.textContent.trim()) || currentTab;
    let what = '';
    if (currentTab === 'map') what = ((camp.mapNodes || []).find(n => n.id === selection.map) || {}).title || '';
    else if (COLLECTIONS[currentTab] && selection[currentTab]) {
        const el = COLLECTIONS[currentTab].store()[selection[currentTab]];
        what = el ? COLLECTIONS[currentTab].label(el) || selection[currentTab] : selection[currentTab];
    }
    return what ? `${tab}: ${what}` : tab;
}

function historyRecord() {
    if (historyRestoring || histBase === null) return;
    const snap = snapshotState();
    if (snap === histBase) return;
    const now = Date.now();
    const key = `${currentTab}:${currentTab === 'map' ? selection.map : selection[currentTab]}`;
    if (!undoStack.length || now - lastRecordAt > HISTORY_MERGE_MS || key !== lastRecordKey) {
        undoStack.push({ snap: histBase, label: historyLabel() });
        if (undoStack.length > HISTORY_MAX) undoStack.shift();
    }
    redoStack = [];
    histBase = snap;
    lastRecordAt = now;
    lastRecordKey = key;
    updateUndoButtons();
}

function restoreSnapshot(snap) {
    const d = JSON.parse(snap);
    camp = d.camp;
    lib = d.lib;
    libDirty.clear();
    d.libDirty.forEach(k => libDirty.add(k));
    dirty = d.dirty;
    // Dopo un salvataggio: è "da salvare" quello che è diverso da ciò che è su disco
    if (savedState) {
        dirty = JSON.stringify(camp) !== savedState.camp;
        libDirty.clear();
        LIB_KINDS.forEach(k => { if (JSON.stringify(lib[k]) !== savedState.lib[k]) libDirty.add(k); });
    }
    pendingPick = null;
    mapLink = null;
    histBase = snap;
    lastRecordAt = 0;
    historyRestoring = true;
    try { render(); } finally { historyRestoring = false; }
    scheduleDraftSave();
    updateUndoButtons();
}

function undo() {
    const step = undoStack.pop();
    if (!step) return;
    redoStack.push({ snap: histBase, label: step.label });
    restoreSnapshot(step.snap);
    edToast(`Annullato: ${step.label}`);
}

function redo() {
    const step = redoStack.pop();
    if (!step) return;
    undoStack.push({ snap: histBase, label: step.label });
    restoreSnapshot(step.snap);
    edToast(`Rifatto: ${step.label}`);
}

function updateUndoButtons() {
    const u = document.getElementById('edUndo'), r = document.getElementById('edRedo');
    if (u) { u.disabled = !undoStack.length; u.title = undoStack.length ? `Annulla: ${undoStack[undoStack.length - 1].label} (Ctrl+Z)` : 'Niente da annullare'; }
    if (r) { r.disabled = !redoStack.length; r.title = redoStack.length ? `Ripeti: ${redoStack[redoStack.length - 1].label} (Ctrl+Y)` : 'Niente da ripetere'; }
}

// Ctrl+Z / Ctrl+Y: dentro una casella di testo resta quello del browser
document.addEventListener('keydown', e => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k !== 'z' && k !== 'y') return;
    if (e.target.closest('input, textarea, select, [contenteditable]') || document.getElementById('edConfirm')) return;
    e.preventDefault();
    if (k === 'y' || e.shiftKey) redo(); else undo();
});

/* ---------- Finestra di conferma e messaggi ---------- */
let confirmAction = null;
// opts: { title, html, ok, danger } ; danger = il pulsante sicuro (Annulla) è quello principale
function edConfirm(opts, onOk) {
    edConfirmClose();
    confirmAction = onOk;
    const box = document.createElement('div');
    box.id = 'edConfirm';
    box.className = 'ed-confirm-overlay';
    box.innerHTML = `<div class="ed-confirm" role="dialog" aria-modal="true">
        <h3>${esc(opts.title)}</h3>
        <div class="ed-confirm-body">${opts.html || ''}</div>
        <div class="ed-confirm-actions">
            <button type="button" class="${opts.danger || opts.ok === null ? 'ed-save' : ''}" ${azione('edConfirmClose')}>${opts.ok === null ? 'Ho capito' : 'Annulla'}</button>
            ${opts.ok === null ? '' : `<button type="button" class="${opts.danger ? 'ed-danger' : 'ed-save'}" ${azione('edConfirmOk')}>${esc(opts.ok || 'Conferma')}</button>`}
        </div></div>`;
    document.body.appendChild(box);
    box.querySelector('.ed-confirm-actions button').focus();
}
function edConfirmOk() {
    const action = confirmAction;
    edConfirmClose();
    if (action) action();
}
function edConfirmClose() {
    confirmAction = null;
    const box = document.getElementById('edConfirm');
    if (box) box.remove();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.getElementById('edConfirm')) edConfirmClose(); });

let toastTimer = null;
function edToast(text, withUndo = false) {
    let t = document.getElementById('edToast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'edToast';
        t.className = 'ed-toast';
        t.setAttribute('role', 'status');
        document.body.appendChild(t);
    }
    t.innerHTML = `<span>${esc(text)}</span>${withUndo ? `<button type="button" class="btn-small" ${azione('toastUndo')}>Annulla</button>` : ''}`;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), withUndo ? 10000 : 3000);
}
function toastUndo() {
    const t = document.getElementById('edToast');
    if (t) t.classList.remove('show');
    undo();
}

/* ---------- Libreria condivisa: avviso e copia solo per questa campagna ---------- */
const sharedAck = new Set();   // "tipo:id" già confermati in questa sessione ("cambialo ovunque")
const COPY_KINDS = ['bestiario', 'armeria', 'reliquie', 'maledizioni'];  // gli eroi no: ritratti e passive sono legati al nome

function sharedBannerHtml(kind, key) {
    if (!COLLECTIONS[kind].library || sharedAck.has(`${kind}:${key}`)) return '';
    const uses = COLLECTIONS[kind].usage(key);
    const elsewhere = usedElsewhere(uses).filter(u => u.id);
    if (!elsewhere.length) return '';
    const here = uses.some(u => u.current && u.id === camp.id);
    return `<div class="ed-shared-banner">
        <span>Attenzione: è usato anche in <b>${esc(usageText(elsewhere))}</b>. Se lo cambi, cambia anche lì.</span>
        <button type="button" class="btn-small" ${azione('sharedOk', kind, key)}>Va bene, cambialo ovunque</button>
        ${here && COPY_KINDS.includes(kind) ? `<button type="button" class="btn-small ed-save" ${azione('copyForCampaign', kind, key)}>Fanne una copia solo per «${esc(camp.title)}»</button>` : ''}
    </div>`;
}
function sharedOk(kind, key) {
    sharedAck.add(`${kind}:${key}`);
    render();
}

// La campagna c usa newKey al posto di oldKey (solo lei: la libreria e le altre campagne non cambiano)
function replaceCampaignRefsIn(c, kind, oldKey, newKey) {
    const swap = list => (list || []).map(r => r === oldKey ? newKey : r);
    if (kind === 'bestiario') (c.mapNodes || []).forEach(n => { if (n.enemy === oldKey) n.enemy = newKey; });
    if (kind === 'eroi') c.heroes = swap(c.heroes);
    if (kind === 'armeria') {
        c.initialArmory = swap(c.initialArmory);
        // Bottino predefinito: la campagna passa a un elenco suo, uguale ma con la copia
        if (c.lootItems == null && (lib.lootPredefinito || []).includes(oldKey)) c.lootItems = swap(lib.lootPredefinito);
        else if (Array.isArray(c.lootItems)) c.lootItems = swap(c.lootItems);
    }
    if (kind === 'reliquie' || kind === 'maledizioni') {
        const field = kind === 'reliquie' ? 'reward' : 'punishment';
        Object.values(c.challenges || {}).forEach(ch => {
            if (ch[field] === oldKey) ch[field] = newKey;
            (ch.strade || []).forEach(r => { if (r[field] === oldKey) r[field] = newKey; });
        });
    }
}

function copyForCampaign(kind, key) {
    const col = COLLECTIONS[kind];
    const src = col.store()[key];
    if (!src) return;
    // Stesso nome (il giocatore vede quello), id nuovo ricavato da nome e campagna
    const name = src[nameField(kind)] || key;
    const copy = deepCopy(src);
    const newKey = uniqueKey(kind, `${name} ${camp.id}`);
    if ('id' in copy) copy.id = newKey;
    col.store()[newKey] = copy;
    if (col.afterKeyChange) col.afterKeyChange(copy, newKey);
    selection[kind] = newKey;
    recordRecent(kind, newKey);
    replaceCampaignRefsIn(camp, kind, key, newKey);
    col.dirty();
    sharedAck.add(`${kind}:${newKey}`);
    markDirty();
    render();
    edToast(`Copia creata: «${camp.title}» ora usa la sua copia di «${name}», le altre campagne restano come prima`);
}
