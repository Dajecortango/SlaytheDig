/* ==========================================================================
   PARTITA ONLINE — LATO MASTER
   Attiva solo quando il master apre la partita online dalle Opzioni (pagina
   servita da http://localhost:8787). Manda ai giocatori le regioni cambiate
   della pagina, riceve i loro clic, li esegue se onlineCanRun lo permette
   (js/online-regole.js), gestisce voti, "Ho finito", capo e proprietari.
   ========================================================================== */
// Il master apre il gioco dal server (http://localhost:8787): stesse origine e porta per le chiamate
const ONLINE_BASE = (typeof location !== 'undefined' && /^https?:$/.test(location.protocol)) ? location.origin : 'http://localhost:8787';
const onlineState = { attivo: false, code: null, segreto: null, giocatori: [], voto: null, pronti: null, modalOwner: null, attore: null,
    ultimoClicMaster: 0, ordineCreazione: null };
const onlineDopoClic = [];
let onlineMasterStream = null;

const onlineAttivo = () => onlineState.attivo;
// Il moderatore (ruolo 'moderatore', "Entra come Moderatore" nella lobby) non ha un eroe: resta fuori dai
// giocatori "veri" così non conta per la dimensione della squadra, la creazione a turno, i voti, i "pronti"
// o il capo spedizione (tutti derivati da queste due funzioni). Può solo usare il Pannello di Controllo (onlineGate).
const onlineGiocatoriCollegati = () => onlineState.giocatori.filter(gi => gi.connected && gi.ruolo !== 'moderatore').map(gi => gi.name);
const onlineRuolo = nome => { const gi = onlineState.giocatori.find(g => g.name === nome); return (gi && gi.ruolo) || 'giocatore'; };

function onlinePost(url, body) {
    const headers = { 'Content-Type': 'application/json', ...(onlineState.segreto ? { 'X-Online-Segreto': onlineState.segreto } : {}) };
    return fetch(ONLINE_BASE + url, { method: 'POST', headers, body: JSON.stringify(body || {}) })
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
    // Scorrimento (non è un attributo): carosello dei capitoli, diario dello scontro... lo riapplica la pagina del giocatore
    const tuttiOrig = [el, ...el.querySelectorAll('*')], tutteCopie = [copia, ...copia.querySelectorAll('*')];
    tuttiOrig.forEach((o, i) => {
        if ((o.scrollLeft || o.scrollTop) && tutteCopie[i]) tutteCopie[i].setAttribute('data-online-scroll', `${Math.round(o.scrollLeft)},${Math.round(o.scrollTop)}`);
    });
    const orig = el.querySelectorAll('select, input, textarea');
    copia.querySelectorAll('select, input, textarea').forEach((c, i) => {
        const o = orig[i];
        if (c.tagName === 'SELECT') [...c.options].forEach(op => op.toggleAttribute('selected', op.value === o.value));
        else if (o.type === 'checkbox') c.toggleAttribute('checked', o.checked);
        else c.setAttribute('value', o.value);
    });
    copia.querySelectorAll('script, audio').forEach(n => n.remove());
    // Mappa: i giocatori non vedono cosa c'è nei nodi lontani ancora da fare (solo il master lo sa)
    const vicini = nodiVisibiliGiocatori(stato.stsMapNodes, typeof ONLINE_NODI_VISIBILI === 'number' ? ONLINE_NODI_VISIBILI : 1);
    copia.querySelectorAll('.sts-node').forEach(n => {
        const classi = classiNodoGiocatore(n.className, vicini.has(Number(n.dataset.nodeId)) || vicini.has(n.dataset.nodeId));
        if (!classi || classi === n.className) return;
        n.className = classi;
        n.innerHTML = typeof svgIcon === 'function' ? svgIcon('question') : '?';
        n.removeAttribute('data-tip');
    });
    // Pannelli appesi che dondolano (js/wc3fx.js): il loro stile cambia a ogni fotogramma, ai giocatori basta la posizione di riposo
    const ANIMATI = '.wc-hang, .wc-sway, .wc-chains span';
    [copia, ...copia.querySelectorAll(ANIMATI)].forEach(n => { if (n.matches && n.matches(ANIMATI)) n.removeAttribute('style'); });
    return copia.outerHTML;
}
// Sovrimpressioni (titolo del capitolo, nodo scelto, cinematica d'attacco...): solo ciò che il gioco aggiunge al body
// dopo il caricamento. Gli elementi fissi della pagina (barre, .game-layout con tutte le schermate) hanno le loro regioni.
// Eccezione: .fx-layer (numeri fluttuanti, js/effetti.js) nasce al caricamento ma il suo contenuto cambia durante
// il gioco: si manda sempre, così anche i giocatori vedono danni, cure e critici.
const ONLINE_FIGLI_STATICI = typeof document !== 'undefined' && document.body ? new Set(document.body.children) : new Set();
function onlineSovrimpressioni(figli, statici) {
    return [...figli].filter(c => (!statici.has(c) || c.classList.contains('fx-layer')) && c.id !== 'onlineMasterBar'
        && !['SCRIPT', 'AUDIO', 'VIDEO'].includes(c.tagName) && !c.classList.contains('hidden'));
}
// Scena dei menu (video di sfondo, paesaggio): fissa nella pagina, si manda una volta. Senza le gocce della pioggia,
// che il gioco aggiunge di continuo (si rimanderebbe la scena a ogni goccia)
function onlineScenaMenu() {
    const scena = document.querySelector('.menu-scene');
    if (!scena) return null;
    const html = onlineSerializza(scena);
    const t = document.createElement('template');
    t.innerHTML = html;
    t.content.querySelectorAll('#menuRain > *').forEach(n => n.remove());
    return t.innerHTML;
}
function onlineRegioni() {
    const screen = document.querySelector('#gameContainer > div:not(.hidden)');
    const modal = document.getElementById('wc3Modal');
    // Pannello di Controllo (js/combattimento.js, gmOpenPanel): resta privato sullo schermo del master,
    // non si specchia mai ai giocatori collegati (il moderatore ha il suo pannello a parte, vedi gmstato)
    const modaleGM = !modal.classList.contains('hidden') && modal.querySelector('.gm-panel-modal');
    const overlays = onlineSovrimpressioni(document.body.children, ONLINE_FIGLI_STATICI);
    return {
        body: document.body.className,
        scena: onlineScenaMenu(),
        topbar: onlineSerializza(document.getElementById('partyTopBar')),
        console: onlineSerializza(document.getElementById('partyConsole')),
        screen: onlineSerializza(screen),
        modal: (modal.classList.contains('hidden') || modaleGM) ? null : onlineSerializza(modal),
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
        selects: Object.fromEntries(['lootHeroSelect', 'treasureHeroSelect', 'merchantHeroSelect',
            'captainHeroSelect'].map(id => [id, onlineValoreMenu(id)])),
        creationTurn: onlineTurnoCreazione(),
        discardHero: heroNeedingDiscard ? heroNeedingDiscard.name : null,
        challengeHero: selectedChallengeHero ? selectedChallengeHero.name : null,
        prayingHero: selectedPrayerHero ? selectedPrayerHero.name : null,
        captainHero: selectedCaptainHero ? selectedCaptainHero.name : null,
        modalOwner: onlineState.modalOwner,
        capo: onlineCapo(),
        voto: onlineState.voto
    };
}

// Cancello di js/azioni.js: il master locale passa sempre; i clic dei giocatori passano da onlineCanRun
window.onlineGate = function (nome, args) {
    if (!onlineState.attivo) return true;
    if (!onlineState.attore) {
        // Clic del master (o del gioco): un'azione che decide un voto aperto lo annulla; le finestre che apre sono sue
        onlineState.ultimoClicMaster = Date.now();
        if (votoAnnullatoDa(nome, onlineState.voto)) onlineAnnullaVoto();
        return true;
    }
    const giocatore = onlineState.attore;
    // Moderatore: solo il Pannello di Controllo (ONLINE_AZIONI_MODERATORE, js/online-regole.js), mai le
    // azioni di un giocatore (non ha un eroe) né quelle libere del master
    if (onlineRuolo(giocatore) === 'moderatore') {
        if (ONLINE_AZIONI_MODERATORE.includes(nome)) return true;
        onlineAvvisa(giocatore, 'Solo il master può farlo');
        return false;
    }
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
    if (!nomeGiocatoreValido(c.giocatore)) return;  // nomi riservati (il master): mai dai giocatori
    if (c.azione === '__vota') { onlineVota(c.giocatore, c.args[0], c.args[1]); return; }
    const root = c.regione === 'overlays' ? null : (ONLINE_RADICI[c.regione] || (() => null))();
    const el = root && trovaElementoRemoto(root, c.percorso);
    const attr = { click: 'action', change: 'change', input: 'input', keydown: 'enter' }[c.tipo] || 'action';
    const atteso = c.azione === '__modal' ? (el && el.dataset.modalBtn === String(c.args[0])) : (el && el.dataset[attr] === c.azione);
    if (!atteso || !elementoCliccabile(el)) { onlineAvvisa(c.giocatore, 'La schermata è cambiata, riprova'); return; }
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

/* ---------- Pannello privato del moderatore ----------
   Niente clic su uno schermo condiviso: il moderatore chiama direttamente una delle
   ONLINE_AZIONI_MODERATORE (js/online-regole.js) con opts.silent, così js/combattimento.js
   non apre/aggiorna la finestra #wc3Modal (quella la vedrebbero anche il master e, specchiata,
   tutti i giocatori). I dati del suo pannello arrivano solo a lui via onlinePianificaGmStato. */
function onlineEseguiClicModeratore(c) {
    if (!c || onlineRuolo(c.giocatore) !== 'moderatore') return;
    if (!ONLINE_AZIONI_MODERATORE.includes(c.azione) || typeof window[c.azione] !== 'function') return;
    const args = Array.isArray(c.args) ? c.args : [];
    window[c.azione](...args, { silent: true });
}

// Squadra e nemico attuali per il pannello del moderatore (solo i dati, mai una finestra)
function onlineGmStatoPayload() {
    const enemy = (typeof currentScreenId !== 'undefined' && currentScreenId === 'screenCombat' && stato.activeEnemy)
        ? { name: stato.activeEnemy.name, hp: Math.max(0, stato.activeEnemy.hp), maxHp: stato.activeEnemy.maxHp } : null;
    return { heroes: (stato.party || []).map(h => ({ name: h.name, hp: h.hp, maxHp: h.maxHp })), enemy };
}
let onlineGmStatoTimer = null;
function onlinePianificaGmStato() {
    if (!onlineState.attivo || onlineGmStatoTimer) return;
    onlineGmStatoTimer = setTimeout(() => { onlineGmStatoTimer = null; onlinePost('/api/online/gmstato', onlineGmStatoPayload()); }, 150);
}
// La squadra e il nemico cambiano con questi due aggiornamenti dell'interfaccia: basta agganciarsi a loro
['updatePartyStatusBars', 'updateEnemyInfoUI'].forEach(nome => {
    if (typeof window[nome] !== 'function') return;
    const originale = window[nome];
    window[nome] = function (...args) { const r = originale.apply(this, args); onlinePianificaGmStato(); return r; };
});

/* ---------- Finestre aperte da un giocatore ---------- */
if (typeof openModal === 'function') {
    const apriOrig = openModal;
    openModal = function (...a) {
        // Aperta da un giocatore: sua; da un clic del master (stesso giro): del master; dal gioco più tardi: di tutti
        onlineState.modalOwner = onlineState.attore || (Date.now() - onlineState.ultimoClicMaster < 50 ? ONLINE_MASTER : null);
        return apriOrig.apply(this, a);
    };
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
        onlineState.attivo = true; onlineState.code = r.code; onlineState.segreto = r.segreto;
        if (onlineMasterStream) onlineMasterStream.close();
        onlineMasterStream = new EventSource(`${ONLINE_BASE}/api/online/master?segreto=${encodeURIComponent(onlineState.segreto)}`);
        onlineMasterStream.addEventListener('stanza', e => { onlineState.giocatori = JSON.parse(e.data).giocatori; onlineStanzaCambiata(); });
        onlineMasterStream.addEventListener('clic', e => onlineEseguiClic(JSON.parse(e.data)));
        onlineMasterStream.addEventListener('clic-moderatore', e => onlineEseguiClicModeratore(JSON.parse(e.data)));
        if (onlineOsservatore) onlineOsservatore.observe(document.body, ONLINE_OSSERVA);
        document.addEventListener('scroll', onlinePianificaInvio, true);  // lo scorrimento non cambia il DOM
        onlineUltimeRegioni = {};
        onlinePianificaInvio();
        onlineInviaStato();
        onlineMostraLink();
    });
}
function onlineChiudi() {
    onlinePost('/api/online/chiudi');
    onlineState.attivo = false; onlineState.code = null; onlineState.segreto = null; onlineState.ordineCreazione = null; onlineState.giocatori = []; onlineState.voto = null; onlineState.pronti = null;
    if (onlineMasterStream) onlineMasterStream.close();
    if (onlineOsservatore) onlineOsservatore.disconnect();
    document.removeEventListener('scroll', onlinePianificaInvio, true);
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

/* ---------- Stanza, creazione a turno, chi deve agire ---------- */
// Giocatori in ordine d'ingresso (anche i disconnessi: il loro posto resta; niente moderatori, vedi onlineGiocatoriCollegati)
const onlineOrdine = () => onlineState.giocatori.filter(gi => gi.ruolo !== 'moderatore').map(gi => gi.name);

// Creazione degli eroi: a turno, il primo giocatore senza eroe nell'ordine d'ingresso
function onlineTurnoCreazione() {
    if (!onlineState.attivo || currentScreenId !== 'screenParty') return null;
    const conEroe = Object.values(stato.onlineOwners || {});
    // Ordine fissato quando il master conferma la compagnia: solo chi era collegato allora
    return (onlineState.ordineCreazione || onlineGiocatoriCollegati()).find(n => !conEroe.includes(n)) || null;
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
    onlineAvvisoConnessioni();
    onlineDisegnaLobby();
    onlineInviaStato();
    onlinePianificaGmStato();  // un moderatore appena entrato riceve subito i dati del suo pannello
}
function onlineDisegnaLobby() {
    const area = document.getElementById('partyConfigArea');
    if (!area) return;
    let box = document.getElementById('onlineLobby');
    if (!onlineState.attivo) { if (box) box.remove(); return; }
    if (!box) { box = document.createElement('div'); box.id = 'onlineLobby'; box.className = 'wc-inset'; area.prepend(box); }
    const righe = onlineState.giocatori.map(gi => `<li>${esc(gi.name)}${gi.ruolo === 'moderatore' ? ' (Moderatore)' : ''} ${gi.connected ? '🟢' : '⚪'}</li>`).join('') || '<li>Nessun giocatore: manda il link</li>';
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
            onlineState.ordineCreazione = onlineGiocatoriCollegati();
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
    return capoSpedizione(onlineState.ordineCreazione || onlineOrdine(), onlineState.giocatori);
}


/* ---------- Voti ---------- */
let onlineVotoTimer = null, onlineVotoSeq = 0;
function onlineApriVoto({ tipo, domanda, opzioni, secondi = VOTE_SECONDS, esegui }) {
    // Senza giocatori collegati nessun voto: il master decide con i pulsanti del gioco
    if (!onlineState.attivo || !onlineGiocatoriCollegati().length) return;
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
// Voto annullato senza eseguire niente (schermata lasciata, o il master ha deciso con i pulsanti del gioco)
function onlineAnnullaVoto() {
    clearTimeout(onlineVotoTimer);
    onlineState.voto = null;
    onlineInviaStato();
}
let onlineSchermataPrima = null;

// Clic di un giocatore che diventa un voto (regole 'voto:<tipo>' di js/online-regole.js)
function onlineVotoDaClic(tipo, nome, args, giocatore) {
    onlineVotoSpeciale(tipo, nome, args, giocatore);
}

// Cambio di schermata: i voti e i pronti della schermata lasciata non valgono più
if (typeof showScreen === 'function') {
    const mostraOrig = showScreen;
    showScreen = function (id) {
        onlineSchermataPrima = currentScreenId;
        const r = mostraOrig.apply(this, arguments);
        if (onlineState.attivo) {
            if (onlineState.voto && id !== onlineSchermataPrima) onlineAnnullaVoto();  // il voto riguardava la schermata lasciata
            if (onlineState.pronti) { onlineState.pronti = null; onlineProntiAzione = null; }  // nuova schermata: i pronti ripartono da zero
            if (id === 'screenMap') onlineSalvaAutomatico();  // si riprende da qui se il master chiude
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
    const giocatori = onlineState.giocatori.map(gi => `${esc(gi.name)}${gi.ruolo === 'moderatore' ? ' (Moderatore)' : ''}${gi.connected ? '' : ' (disconnesso)'}${onlineCapo() === gi.name ? ' 👑' : ''}`).join(', ');
    bar.innerHTML = `<b>Master</b> · ${giocatori || 'nessun giocatore'}`
        + (v ? `<br>${esc(v.domanda)} ${v.opzioni.map(o => `<button class="btn-small" ${azione('onlineForzaVoto', o.id)}>${esc(o.label)} · ${Object.values(v.voti).filter(x => x === o.id).length}</button>`).join(' ')}` : '')
        + (onlineState.pronti ? `<br>Pronti ${onlineState.pronti.size}/${onlineGiocatoriCollegati().length} <button class="btn-small" ${azione('onlineForzaPronti')}>Si parte</button>` : '');
}


/* ---------- Voti di prova, preghiera, bersaglio, mercante ---------- */
const onlineEroiInPiedi = () => stato.party.filter(h => h.hp > 0).map(h => ({ id: h.name, label: h.name }));

function onlineApriVotoBersaglio() {
    onlineApriVoto({ tipo: 'bersaglio', domanda: 'Chi riceve il colpo del nemico?', opzioni: onlineEroiInPiedi(), secondi: VOTE_SECONDS_TARGET,
        esegui: id => executeMonsterAttack(id) });
}

function onlineVotoSpeciale(tipo, nome, args, giocatore) {
    if (tipo === 'bersaglio') {
        // Il ritratto cliccato dal giocatore è il suo voto (il voto si apre se non c'è ancora);
        // con il bersaglio deciso dal nemico o contro tutti conferma solo il master
        if (!monsterTargetFree) return;
        if (!onlineState.voto) onlineApriVotoBersaglio();
        if (onlineState.voto && onlineState.voto.tipo === tipo && args && args[0]) onlineVota(giocatore, onlineState.voto.id, args[0]);
        return;
    }
    if (onlineState.voto && onlineState.voto.tipo === tipo) return;
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

// Il voto sul bersaglio si apre da solo al turno del nemico (quando il bersaglio lo sceglie la compagnia)
[['startMonsterTurn', () => {
     const area = document.getElementById('monsterTargetArea');
     if (monsterTargetFree && area && !area.classList.contains('hidden')) onlineApriVotoBersaglio();
 }]].forEach(([nome, dopo]) => {
    if (typeof window[nome] !== 'function') return;
    const orig = window[nome];
    window[nome] = function () { const r = orig.apply(this, arguments); if (onlineState.attivo) dopo(); return r; };
});

/* ---------- Ho finito (riposo e mercante) ---------- */
let onlineProntiAzione = null;
function onlinePronto(giocatore, nome, args) {
    if (!onlineState.pronti) { onlineState.pronti = new Set(); onlineProntiAzione = { nome, args }; }
    onlineState.pronti.add(giocatore);
    if (onlineGiocatoriCollegati().every(n => onlineState.pronti.has(n))) onlineForzaPronti();
    else onlineInviaStato();
}
function onlineForzaPronti() {
    const a = onlineProntiAzione;
    onlineState.pronti = null; onlineProntiAzione = null;
    onlineState.attore = null;
    if (a) chiamaAzione(a.nome, a.args, null);
    onlineInviaStato();
}

/* ---------- Salvataggio automatico e ripresa ---------- */
function onlineSalvaAutomatico() {
    if (!onlineState.attivo || !stato.currentCampaign) return;
    try { writeSave('online', buildSaveData()); } catch (e) { console.error('Salvataggio online non riuscito', e); }
}
function onlineRiprendi() {
    if (!readSave('online')) { uiError('Nessuna partita online salvata'); return; }
    loadFromSlot('online');
}

// Avviso al master quando un giocatore si disconnette o rientra
let onlineCollegatiPrima = [];
function onlineAvvisoConnessioni() {
    const ora = onlineGiocatoriCollegati();
    onlineCollegatiPrima.filter(n => !ora.includes(n)).forEach(n => uiError(`${n} si è disconnesso: comandi tu il suo eroe finché non torna`));
    ora.filter(n => !onlineCollegatiPrima.includes(n)).forEach(n => uiMessage(`${n} è nella stanza`));
    onlineCollegatiPrima = ora;
    if (onlineState.voto && ora.length && ora.every(n => n in onlineState.voto.voti)) onlineChiudiVoto();
    if (onlineState.pronti && ora.length && ora.every(n => onlineState.pronti.has(n))) onlineForzaPronti();
}

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
               <span><button class="btn-small" ${azione('onlineMostraLink')}>Link</button>${readSave('online') ? ` <button class="btn-small" ${azione('onlineRiprendi')}>Riprendi l'ultima</button>` : ''} <button class="btn-small btn-danger" ${azione('onlineChiudi')}>Chiudi</button></span>`
            : `<span class="option-label">Partita online<small>Tu sei il master: i giocatori si collegano con un link e comandano un eroe ciascuno</small></span>
               <span><button class="btn-small btn-proceed" ${azione('onlineApri')}>Apri la stanza</button></span>`;
        body.appendChild(box);
    };
}
