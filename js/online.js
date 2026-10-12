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
function onlinePronto(giocatore, nome, args) { onlineState.attore = null; chiamaAzione(nome, args, null); }

/* ---------- Stanza, creazione a turno, chi deve agire ---------- */
// Giocatori in ordine d'ingresso (anche i disconnessi: il loro posto resta)
const onlineOrdine = () => onlineState.giocatori.map(gi => gi.name);

// Creazione degli eroi: a turno, il primo giocatore senza eroe nell'ordine d'ingresso
function onlineTurnoCreazione() {
    if (!onlineState.attivo || currentScreenId !== 'screenParty') return null;
    const conEroe = Object.values(stato.onlineOwners || {});
    return onlineOrdine().find(n => !conEroe.includes(n)) || null;
}

// Chi deve agire adesso (per l'avviso "Tocca a te" dei giocatori)
function onlineAttesi() {
    if (!onlineState.attivo) return [];
    const owners = stato.onlineOwners || {};
    if (onlineState.voto) return onlineGiocatoriCollegati().filter(n => !(n in onlineState.voto.voti));
    if (onlineState.pronti) return onlineGiocatoriCollegati().filter(n => !onlineState.pronti.has(n));
    if (currentScreenId === 'screenParty') return [onlineTurnoCreazione()].filter(Boolean);
    if (heroNeedingDiscard) return [owners[heroNeedingDiscard.name]].filter(Boolean);
    if (currentScreenId === 'screenCombat' && combatPhase === 'heroes') {
        if (currentActiveHero) return [owners[currentActiveHero.name]].filter(Boolean);
        return [...new Set(stato.party.filter(h => h.hp > 0 && !h.hasActed).map(h => owners[h.name]).filter(Boolean))];
    }
    if (currentScreenId === 'screenChallenge' && selectedChallengeHero) return [owners[selectedChallengeHero.name]].filter(Boolean);
    if (currentScreenId === 'screenRest' && selectedPrayerHero) return [owners[selectedPrayerHero.name]].filter(Boolean);
    return [];
}

// Stanza cambiata (ingresso, uscita): la lista dei giocatori nella schermata della compagnia e lo stato
function onlineStanzaCambiata() {
    onlineDisegnaLobby();
    onlineInviaStato();
}
function onlineDisegnaLobby() {
    const area = document.getElementById('partyConfigArea');
    if (!area) return;
    let box = document.getElementById('onlineLobby');
    if (!onlineState.attivo) { if (box) box.remove(); return; }
    if (!box) { box = document.createElement('div'); box.id = 'onlineLobby'; box.className = 'wc-inset'; area.prepend(box); }
    const righe = onlineState.giocatori.map(gi => `<li>${esc(gi.name)} ${gi.connected ? '🟢' : '⚪'}</li>`).join('') || '<li>Nessun giocatore: manda il link</li>';
    box.innerHTML = `<p><b>Giocatori nella stanza</b> (un eroe a testa)</p><ul>${righe}</ul>`;
}

// Numero di eroi = giocatori collegati (il master non gioca), entro il massimo della campagna
if (typeof confirmPartySize === 'function') {
    const confermaOrig = confirmPartySize;
    confirmPartySize = function () {
        if (onlineState.attivo) {
            const n = onlineGiocatoriCollegati().length;
            const sel = document.getElementById('partySizeSelect');
            const max = Math.max(...[...sel.options].map(o => Number(o.value)));
            if (n < 1) { uiError('Nessun giocatore collegato'); return; }
            if (n > max) { uiError(`Troppi giocatori: questa campagna ne permette al massimo ${max}`); return; }
            if (![...sel.options].some(o => Number(o.value) === n)) sel.insertAdjacentHTML('beforeend', `<option value="${n}">${n} Eroi</option>`);
            sel.value = String(n);
            stato.onlineOwners = {};
        }
        return confermaOrig.apply(this, arguments);
    };
}
// L'eroe appena creato diventa del giocatore di turno
if (typeof nextHero === 'function') {
    const prossimoOrig = nextHero;
    nextHero = function () {
        const chi = onlineTurnoCreazione();
        if (onlineState.attivo && chi && activeHeroForCreation) stato.onlineOwners = { ...(stato.onlineOwners || {}), [activeHeroForCreation.name]: chi };
        return prossimoOrig.apply(this, arguments);
    };
}
if (typeof startPartyCreation === 'function') {
    const creaOrig = startPartyCreation;
    startPartyCreation = function () { const r = creaOrig.apply(this, arguments); stato.onlineOwners = {}; onlineDisegnaLobby(); return r; };
}

/* ---------- Capo della spedizione: uno per livello della mappa ---------- */
function onlineCapo() {
    if (!onlineState.attivo) return null;
    const nodo = stato.stsMapNodes.find(n => n.id === stato.currentNodeId);
    return nextCaptain(onlineState.giocatori, nodo ? nodo.level + 1 : 0);
}

/* ---------- Voti ---------- */
let onlineVotoTimer = null, onlineVotoSeq = 0;
function onlineApriVoto({ tipo, domanda, opzioni, secondi = VOTE_SECONDS, esegui }) {
    if (!onlineState.attivo || !onlineGiocatoriCollegati().length) { esegui(opzioni[0].id); return; }
    clearTimeout(onlineVotoTimer);
    onlineState.voto = { id: `v${++onlineVotoSeq}`, tipo, domanda, opzioni, voti: {}, scadenza: Date.now() + secondi * 1000, esegui };
    onlineVotoTimer = setTimeout(() => onlineChiudiVoto(), secondi * 1000);
    onlineInviaStato();
}
function onlineVota(giocatore, id, op) {
    const v = onlineState.voto;
    if (!v || v.id !== id || !v.opzioni.some(o => o.id === op)) return;
    v.voti[giocatore] = op;
    if (onlineGiocatoriCollegati().every(n => n in v.voti)) onlineChiudiVoto();
    else onlineInviaStato();
}
function onlineChiudiVoto(forzato) {
    const v = onlineState.voto;
    if (!v) return;
    clearTimeout(onlineVotoTimer);
    onlineState.voto = null;
    const vincente = forzato !== undefined ? forzato
        : resolveVote(v.voti, v.opzioni.map(o => o.id), onlineCapo(), onlineGiocatoriCollegati());
    onlineInviaStato();
    onlineState.attore = null;
    v.esegui(vincente);
    onlineInviaStato();
}
function onlineForzaVoto(op) { onlineChiudiVoto(op); }

// Clic di un giocatore che diventa un voto (regole 'voto:<tipo>' di js/online-regole.js)
function onlineVotoDaClic(tipo, nome, args, giocatore) {
    const v = onlineState.voto;
    if (tipo === 'mappa') {
        if (!v || v.tipo !== 'mappa') onlineApriVotoMappa();
        if (onlineState.voto) onlineVota(giocatore, onlineState.voto.id, String(args[0]));
        return;
    }
    onlineVotoSpeciale(tipo, nome, args, giocatore);  // Task 9
}

/* ---------- Voto della mappa ---------- */
function onlineApriVotoMappa() {
    const aperti = stato.stsMapNodes.filter(n => n.active && !n.done);
    if (!aperti.length) return;
    const nome = n => (typeof nodeBannerInfo === 'function' ? `${nodeBannerInfo(n).kind}: ${nodeBannerInfo(n).title}` : n.type);
    onlineApriVoto({ tipo: 'mappa', domanda: 'Dove andiamo?', opzioni: aperti.map(n => ({ id: String(n.id), label: nome(n) })),
        esegui: id => selectStsNode(Number(id)) });
}
// Arrivati sulla mappa con più strade: il voto parte da solo
if (typeof showScreen === 'function') {
    const mostraOrig = showScreen;
    showScreen = function (id) {
        const r = mostraOrig.apply(this, arguments);
        if (onlineState.attivo) {
            if (onlineState.voto && id !== 'screenMap' && onlineState.voto.tipo === 'mappa') { clearTimeout(onlineVotoTimer); onlineState.voto = null; }
            if (id === 'screenMap' && stato.stsMapNodes.filter(n => n.active && !n.done).length > 1) setTimeout(onlineApriVotoMappa, 600);
            onlineInviaStato();
        }
        return r;
    };
}

/* ---------- Barra del master (non inviata ai giocatori) ---------- */
function onlineDisegnaBarraMaster() {
    let bar = document.getElementById('onlineMasterBar');
    if (!onlineState.attivo) { if (bar) bar.remove(); return; }
    if (!bar) { bar = document.createElement('div'); bar.id = 'onlineMasterBar'; bar.className = 'wc-panel';
        bar.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:12px;z-index:40;padding:8px 14px;max-width:calc(100% - 32px)';
        document.body.appendChild(bar); }
    const v = onlineState.voto;
    const giocatori = onlineState.giocatori.map(gi => `${esc(gi.name)}${gi.connected ? '' : ' (disconnesso)'}${onlineCapo() === gi.name ? ' 👑' : ''}`).join(', ');
    bar.innerHTML = `<b>Master</b> · ${giocatori || 'nessun giocatore'}`
        + (v ? `<br>${esc(v.domanda)} ${v.opzioni.map(o => `<button class="btn-small" ${azione('onlineForzaVoto', o.id)}>${esc(o.label)} · ${Object.values(v.voti).filter(x => x === o.id).length}</button>`).join(' ')}` : '')
        + (onlineState.pronti ? `<br>Pronti ${onlineState.pronti.size}/${onlineGiocatoriCollegati().length} <button class="btn-small" ${azione('onlineForzaPronti')}>Si parte</button>` : '');
}

function onlineForzaPronti() {}

/* ---------- Voti di prova, preghiera, bersaglio, mercante ---------- */
const onlineEroiInPiedi = () => stato.party.filter(h => h.hp > 0).map(h => ({ id: h.name, label: h.name }));

function onlineApriVotoProva() {
    const opzioni = onlineEroiInPiedi();
    if (!isFinalNode()) opzioni.push({ id: '__lascia', label: 'Lascia perdere' });
    onlineApriVoto({ tipo: 'prova', domanda: 'Chi affronta la prova?', opzioni, esegui: id => {
        if (id === '__lascia') { challengeChoose(false); return; }
        challengeChoose(true);
        const sel = document.getElementById('challengeHeroSelect');
        if (sel) sel.value = id;
        confirmChallengeHero();
    } });
}
function onlineApriVotoPreghiera() {
    if (restPrayer) return;
    onlineApriVoto({ tipo: 'preghiera', domanda: 'Chi prega?', opzioni: [...onlineEroiInPiedi(), { id: '__nessuno', label: 'Nessuno' }],
        esegui: id => { if (id === '__nessuno') return; startPrayer(); confirmPrayerHero(id); } });
}
function onlineApriVotoBersaglio() {
    onlineApriVoto({ tipo: 'bersaglio', domanda: 'Chi riceve il colpo del nemico?', opzioni: onlineEroiInPiedi(), secondi: VOTE_SECONDS_TARGET,
        esegui: id => { const sel = document.getElementById('monsterTargetSelect'); if (sel) sel.value = id; executeMonsterAttack(); } });
}

function onlineVotoSpeciale(tipo, nome, args, giocatore) {
    if (onlineState.voto && onlineState.voto.tipo === tipo) return;
    if (tipo === 'bersaglio') { onlineApriVotoBersaglio(); return; }
    if (tipo === 'contratta') {
        if (merchantHaggle !== null) return;
        onlineApriVoto({ tipo, domanda: 'Contrattiamo con il mercante?', opzioni: [{ id: '__no', label: 'No' },
            ...stato.party.filter(h => h.hp > 0).map(h => ({ id: h.name, label: `Sì, con ${h.name}` }))],
            esegui: id => { if (id !== '__no') haggle(id); } });
        return;
    }
    if (tipo === 'rinnova') {
        onlineApriVoto({ tipo, domanda: `Rinnoviamo la merce (${MERCHANT_REROLL_COST} Scudi)?`, opzioni: [{ id: 'no', label: 'No' }, { id: 'si', label: 'Sì' }],
            esegui: id => { if (id === 'si') rerollMerchantStock(); } });
    }
}

// I voti si aprono da soli entrando nella prova, nel riposo, al turno del nemico
[['startChallenge', () => setTimeout(onlineApriVotoProva, 800)],
 ['startRest', () => setTimeout(onlineApriVotoPreghiera, 800)],
 ['startMonsterTurn', () => {
     const sel = document.getElementById('monsterTargetSelect');
     const area = document.getElementById('monsterTargetArea');
     if (sel && !sel.disabled && area && !area.classList.contains('hidden')) onlineApriVotoBersaglio();
 }]].forEach(([nome, dopo]) => {
    if (typeof window[nome] !== 'function') return;
    const orig = window[nome];
    window[nome] = function () { const r = orig.apply(this, arguments); if (onlineState.attivo) dopo(); return r; };
});

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
