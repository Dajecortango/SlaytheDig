/* ==========================================================================
   PARTITA ONLINE — LATO MASTER
   Attiva solo quando il master apre la partita online dalle Opzioni (pagina
   servita da http://localhost:8787). Manda ai giocatori le regioni cambiate
   della pagina, riceve i loro clic, li esegue se onlineCanRun lo permette
   (js/online-regole.js), gestisce voti, "Ho finito", capo e proprietari.
   ========================================================================== */
// Il master apre il gioco dal server (http://localhost:8787): stesse origine e porta per le chiamate
const ONLINE_BASE = (typeof location !== 'undefined' && /^https?:$/.test(location.protocol)) ? location.origin : 'http://localhost:8787';
const onlineState = { attivo: false, code: null, giocatori: [], voto: null, pronti: null, modalOwner: null, attore: null };
const onlineDopoClic = [];
let onlineMasterStream = null;

const onlineAttivo = () => onlineState.attivo;
const onlineGiocatoriCollegati = () => onlineState.giocatori.filter(gi => gi.connected).map(gi => gi.name);

function onlinePost(url, body) {
    return fetch(ONLINE_BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) })
        .then(r => r.json()).catch(() => ({ error: 'Server non raggiungibile' }));
}
const onlineAvvisa = (giocatore, testo) => onlinePost('/api/online/avviso', { giocatore, testo });

// Elemento al percorso (indici fra i figli senza SCRIPT e AUDIO), come lo calcola la pagina del giocatore
function trovaElementoRemoto(root, percorso) {
    let n = root;
    for (const i of percorso || []) {
        const figli = n ? [...n.children].filter(c => c.tagName !== 'SCRIPT' && c.tagName !== 'AUDIO') : [];
        n = figli[i];
        if (!n) return null;
    }
    return n || null;
}

/* ---------- Regioni della pagina ---------- */
// Copia di un elemento con i valori correnti dei campi scritti negli attributi (i giocatori vedono le stesse scelte)
function onlineSerializza(el) {
    if (!el) return null;
    const copia = el.cloneNode(true);
    const orig = el.querySelectorAll('select, input, textarea');
    copia.querySelectorAll('select, input, textarea').forEach((c, i) => {
        const o = orig[i];
        if (c.tagName === 'SELECT') [...c.options].forEach(op => op.toggleAttribute('selected', op.value === o.value));
        else if (o.type === 'checkbox') c.toggleAttribute('checked', o.checked);
        else c.setAttribute('value', o.value);
    });
    copia.querySelectorAll('script, audio').forEach(n => n.remove());
    return copia.outerHTML;
}
const ONLINE_OVERLAY_ESCLUSI = ['gameContainer', 'partyTopBar', 'partyConsole', 'wc3Modal', 'wc3Tooltip', 'embers', 'onlineMasterBar'];
function onlineRegioni() {
    const screen = document.querySelector('#gameContainer > div:not(.hidden)');
    const modal = document.getElementById('wc3Modal');
    const overlays = [...document.body.children].filter(c => !ONLINE_OVERLAY_ESCLUSI.includes(c.id)
        && !['SCRIPT', 'AUDIO', 'VIDEO'].includes(c.tagName) && !c.classList.contains('menu-scene') && !c.classList.contains('hidden'));
    return {
        body: document.body.className,
        topbar: onlineSerializza(document.getElementById('partyTopBar')),
        console: onlineSerializza(document.getElementById('partyConsole')),
        screen: onlineSerializza(screen),
        modal: modal.classList.contains('hidden') ? null : onlineSerializza(modal),
        overlays: overlays.map(onlineSerializza).join('') || null
    };
}
let onlineUltimeRegioni = {}, onlineInvioTimer = null;
function onlinePianificaInvio() {
    if (!onlineState.attivo || onlineInvioTimer) return;
    onlineInvioTimer = setTimeout(() => {
        onlineInvioTimer = null;
        const ora = onlineRegioni();
        Object.keys(ora).forEach(k => { if (ora[k] === null) delete ora[k]; });
        const diff = changedRegions(onlineUltimeRegioni, ora);
        onlineUltimeRegioni = ora;
        if (Object.keys(diff).length) onlinePost('/api/online/parti', { parti: diff });
    }, ONLINE_FRAME_MS);
}
const onlineOsservatore = typeof MutationObserver === 'function' ? new MutationObserver(onlinePianificaInvio) : null;

/* ---------- Stato per i giocatori ---------- */
function onlineInviaStato() {
    if (!onlineState.attivo) return;
    onlinePost('/api/online/stato', {
        voto: onlineState.voto && { id: onlineState.voto.id, domanda: onlineState.voto.domanda, opzioni: onlineState.voto.opzioni,
            voti: onlineState.voto.voti, scadenza: onlineState.voto.scadenza },
        orologio: Date.now(),
        pronti: onlineState.pronti && { fatti: [...onlineState.pronti], totale: onlineGiocatoriCollegati().length },
        capo: onlineCapo(), owners: stato.onlineOwners || {}, attesi: onlineAttesi(),
        musica: (typeof musicActive !== 'undefined' && musicActive && musicActive.getAttribute('src')) || null,
        giocatori: onlineState.giocatori
    });
    onlineDisegnaBarraMaster();
}

/* ---------- Contesto e permessi ---------- */
function onlineValoreMenu(id) {
    const el = document.getElementById(id);
    return el && el.value ? el.value : null;
}
function contestoOnline() {
    return {
        screen: currentScreenId,
        owners: stato.onlineOwners || {},
        activeHero: currentActiveHero ? currentActiveHero.name : null,
        selects: Object.fromEntries(['combatHeroSelect', 'lootHeroSelect', 'treasureHeroSelect', 'merchantHeroSelect',
            'challengeHeroSelect', 'captainHeroSelect', 'prayerHeroSelect'].map(id => [id, onlineValoreMenu(id)])),
        creationTurn: onlineTurnoCreazione(),
        discardHero: heroNeedingDiscard ? heroNeedingDiscard.name : null,
        challengeHero: selectedChallengeHero ? selectedChallengeHero.name : null,
        prayingHero: selectedPrayerHero ? selectedPrayerHero.name : null,
        captainHero: selectedCaptainHero ? selectedCaptainHero.name : null,
        modalOwner: onlineState.modalOwner,
        voto: onlineState.voto
    };
}

// Cancello di js/azioni.js: il master locale passa sempre; i clic dei giocatori passano da onlineCanRun
window.onlineGate = function (nome, args) {
    if (!onlineState.attivo || !onlineState.attore) return true;
    const giocatore = onlineState.attore;
    const r = onlineCanRun(nome, args, giocatore, contestoOnline());
    if (r.ok) return true;
    if (r.voto) { onlineVotoDaClic(r.voto, nome, args, giocatore); return false; }
    if (r.pronto) { onlinePronto(giocatore, nome, args); return false; }
    onlineAvvisa(giocatore, r.motivo || 'Non è il tuo turno');
    return false;
};

/* ---------- Clic dei giocatori ---------- */
const ONLINE_RADICI = {
    screen: () => document.querySelector('#gameContainer > div:not(.hidden)'),
    topbar: () => document.getElementById('partyTopBar'),
    console: () => document.getElementById('partyConsole'),
    modal: () => document.getElementById('wc3Modal')
};
function onlineEseguiClic(c) {
    if (c.azione === '__vota') { onlineVota(c.giocatore, c.args[0], c.args[1]); return; }
    const root = c.regione === 'overlays' ? null : (ONLINE_RADICI[c.regione] || (() => null))();
    const el = root && trovaElementoRemoto(root, c.percorso);
    const attr = { click: 'action', change: 'change', input: 'input', keydown: 'enter' }[c.tipo] || 'action';
    const atteso = c.azione === '__modal' ? (el && el.dataset.modalBtn === String(c.args[0])) : (el && el.dataset[attr] === c.azione);
    if (!atteso) { onlineAvvisa(c.giocatore, 'La schermata è cambiata, riprova'); return; }
    if (c.azione === '__modal') {
        const r = onlineCanRun('__modal', c.args, c.giocatore, contestoOnline());
        if (!r.ok) { onlineAvvisa(c.giocatore, r.motivo); return; }
    }
    // Valori dei campi della regione, come li vede il giocatore
    Object.entries(c.valori || {}).forEach(([p, v]) => {
        const campo = trovaElementoRemoto(root, p.split('.').map(Number));
        if (!campo || !('value' in campo)) return;
        if (campo.type === 'checkbox') campo.checked = !!v; else campo.value = v;
    });
    onlineState.attore = c.giocatore;
    try {
        if (c.tipo === 'change' || c.tipo === 'input') el.dispatchEvent(new Event(c.tipo, { bubbles: true }));
        else if (c.tipo === 'keydown') el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        else el.click();
    } finally {
        onlineState.attore = null;
    }
    onlineDopoClic.forEach(fn => fn(c));
    onlineInviaStato();
}

/* ---------- Finestre aperte da un giocatore ---------- */
if (typeof openModal === 'function') {
    const apriOrig = openModal;
    openModal = function (...a) { onlineState.modalOwner = onlineState.attore || null; return apriOrig.apply(this, a); };
}
// Medico: cura solo il proprio eroe (spec, sezione 5)
if (typeof openMedicHeal === 'function') {
    const curaOrig = openMedicHeal;
    openMedicHeal = function (idx, hero) {
        if (onlineState.attivo && onlineState.attore && (stato.onlineOwners || {})[hero && hero.name] !== onlineState.attore) {
            onlineAvvisa(onlineState.attore, 'Il medico cura solo il tuo eroe'); return;
        }
        return curaOrig.apply(this, arguments);
    };
}

/* ---------- Attivazione ---------- */
function onlineApri() {
    if (location.protocol === 'file:') { uiError('La partita online funziona solo dal server: avvia avvia-server.bat'); return; }
    onlinePost('/api/online/apri').then(r => {
        if (r.error || !r.code) { uiError(r.error || 'Server non raggiungibile'); return; }
        onlineState.attivo = true; onlineState.code = r.code;
        if (onlineMasterStream) onlineMasterStream.close();
        onlineMasterStream = new EventSource(`${ONLINE_BASE}/api/online/master`);
        onlineMasterStream.addEventListener('stanza', e => { onlineState.giocatori = JSON.parse(e.data).giocatori; onlineStanzaCambiata(); });
        onlineMasterStream.addEventListener('clic', e => onlineEseguiClic(JSON.parse(e.data)));
        if (onlineOsservatore) onlineOsservatore.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
        onlineUltimeRegioni = {};
        onlinePianificaInvio();
        onlineInviaStato();
        onlineMostraLink();
    });
}
function onlineChiudi() {
    onlinePost('/api/online/chiudi');
    onlineState.attivo = false; onlineState.code = null; onlineState.giocatori = []; onlineState.voto = null; onlineState.pronti = null;
    if (onlineMasterStream) onlineMasterStream.close();
    if (onlineOsservatore) onlineOsservatore.disconnect();
    onlineDisegnaBarraMaster();
}
function onlineLink() {
    const base = window.__remoteTunnelUrl || ONLINE_BASE;  // tunnel ngrok attivo (js/remote.js), altrimenti l'indirizzo locale
    return `${base}/online/${onlineState.code}`;
}
function onlineMostraLink() {
    openModal('Partita online', `<p>Manda questo link ai giocatori (su Discord):</p>
        <p><input id="onlineLinkBox" readonly value="${esc(onlineLink())}" style="width:100%"></p>
        <p>Per giocare fuori casa attiva prima il <b>tunnel ngrok</b> dalle Opzioni (Compagnia connessa via QR): il link userà il suo indirizzo.</p>`,
        [{ label: 'OK', className: 'btn-proceed' }], { wide: true });
}

/* ---------- Funzioni completate nei passi successivi (creazione, voti, pronti, capo, barra) ---------- */
function onlineTurnoCreazione() { return null; }
function onlineCapo() { return null; }
function onlineAttesi() { return []; }
function onlineVotoDaClic(tipo, nome, args, giocatore) { onlineAvvisa(giocatore, 'Voto non ancora disponibile'); }
function onlineVota(giocatore, id, op) {}
function onlinePronto(giocatore, nome, args) { onlineState.attore = null; chiamaAzione(nome, args, null); }
function onlineStanzaCambiata() { onlineInviaStato(); }
function onlineDisegnaBarraMaster() {}

/* ---------- Pannello nelle Opzioni ---------- */
if (typeof openOptions === 'function') {
    const opzioniOrig = openOptions;
    openOptions = function (...a) {
        opzioniOrig.apply(this, a);
        const body = document.getElementById('wc3ModalBody');
        if (!body) return;
        const box = document.createElement('div');
        box.className = 'options-grid';
        box.innerHTML = onlineState.attivo
            ? `<span class="option-label">Partita online attiva<small>${esc(onlineGiocatoriCollegati().join(', ') || 'Nessun giocatore collegato')}</small></span>
               <span><button class="btn-small" ${azione('onlineMostraLink')}>Link</button> <button class="btn-small btn-danger" ${azione('onlineChiudi')}>Chiudi</button></span>`
            : `<span class="option-label">Partita online<small>Tu sei il master: i giocatori si collegano con un link e comandano un eroe ciascuno</small></span>
               <span><button class="btn-small btn-proceed" ${azione('onlineApri')}>Apri la stanza</button></span>`;
        body.appendChild(box);
    };
}
