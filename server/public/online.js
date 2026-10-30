/* ==========================================================================
   PAGINA DEL GIOCATORE (partita online)
   Inserisce le regioni della schermata del master, mostra tooltip, voto,
   turno e avvisi, inoltra i clic al master (che decide se eseguirli).
   ========================================================================== */
(function () {
    const code = location.pathname.split('/')[2] || '';
    const NGROK = { 'ngrok-skip-browser-warning': 'true' };
    let token = null, nome = null, ruolo = 'giocatore', stato = {}, flusso = null, ultimoSegnale = 0;
    // Link del master a distanza (onlineLinkMaster in js/online.js): /online/<codice>?master=<chiave>
    const chiaveMaster = new URLSearchParams(location.search).get('master') || '';
    // Token salvato a parte per il master: lo stesso browser può aprire il link del master e quello di un giocatore
    const CHIAVE = `dignitas_online_${code}${chiaveMaster ? '_master' : ''}`;
    const $ = id => document.getElementById(id);

    const salvato = () => { try { return JSON.parse(localStorage.getItem(CHIAVE) || 'null'); } catch (e) { return null; } };
    const salva = v => { try { localStorage.setItem(CHIAVE, JSON.stringify(v)); } catch (e) {} };

    function post(url, body) {
        const ctrl = window.AbortController ? new AbortController() : null;
        if (ctrl) setTimeout(() => ctrl.abort(), 8000);
        return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...NGROK }, body: JSON.stringify(body), signal: ctrl && ctrl.signal })
            .then(r => r.json());
    }

    /* ---------- Ingresso ----------
       Il giocatore entra da solo, senza scrivere niente: prende il nome scegliendo un eroe (disegnaScelta).
       Il modulo d'ingresso resta per due casi: il link del master ("Entra come Master", ruolo 'master' con la
       chiave del link) e il moderatore (pulsantino nell'angolo del pannello di scelta o d'attesa): niente eroe,
       può solo aprire il Pannello di Controllo del master (js/online.js, onlineGate + ONLINE_AZIONI_MODERATORE). */
    let mioId = null;  // id pubblico nella stanza: con questo si legge il proprio nome da stato.giocatori
    function errore(testo) {
        if (!$('onlineJoin').classList.contains('online-hidden')) $('onlineJoinErrore').textContent = testo;
        else mostraAvviso(testo, true);
    }
    // Un solo tentativo alla volta: con il server giù i tentativi non si moltiplicano (ognuno, al ritorno del server
    // con i token dimenticati, creerebbe un giocatore nuovo senza nome). riprova: il prossimo tentativo già fissato;
    // entrando: una richiesta di ingresso (avvio o onlineEntra) in corso
    let riprova = null, entrando = false;
    function ripianifica(fn) {
        if (riprova) return;
        riprova = setTimeout(() => { riprova = null; fn(); }, 3000);
    }
    window.onlineEntra = function (ruoloRichiesto) {
        if (entrando) return;
        entrando = true;
        const corpo = { code };
        if (ruoloRichiesto === 'moderatore') corpo.ruolo = 'moderatore';
        if (ruoloRichiesto === 'master') { corpo.ruolo = 'master'; corpo.chiave = chiaveMaster; }
        post('/api/online/entra', corpo).then(r => {
            entrando = false;
            // Ingresso automatico in una stanza che non c'è più (master ripartito con un codice nuovo): un avviso che resta,
            // senza altri tentativi (il link vecchio non tornerà a funzionare)
            if (r.error && !ruoloRichiesto && /Stanza non trovata/.test(r.error)) {
                if (flusso) { flusso.close(); flusso = null; }
                token = null;  // il controllo del flusso muto non riapre niente
                mostraAvviso('Stanza non trovata: chiedi al master un link nuovo', true);
                return;
            }
            if (r.error) { errore(r.error); return; }
            entrato(r);
        }).catch(() => {
            entrando = false;
            // Il giocatore normale non ha un modulo da cui riprovare: si riprova da soli
            if (!ruoloRichiesto) ripianifica(() => window.onlineEntra());
            else errore('Connessione non riuscita, riprova');
        });
    };
    function entrato(r) {
        token = r.token; mioId = r.id || null; nome = r.nome; ruolo = r.ruolo || 'giocatore';
        salva({ token, nome, ruolo });
        $('onlineJoin').classList.add('online-hidden');
        mostraAvviso('');
        applicaRuolo();
        collega();
    }

    // La pagina del giocatore non carica js/azioni.js: il modulo d'ingresso ha i suoi ascoltatori
    $('onlineEntraModeratoreBtn').addEventListener('click', () => window.onlineEntra('moderatore'));
    $('onlineEntraMasterBtn').addEventListener('click', () => window.onlineEntra('master'));
    $('onlineJoinIndietro').addEventListener('click', () => $('onlineJoin').classList.add('online-hidden'));
    // Con il link del master si entra solo come master
    if (chiaveMaster) {
        $('onlineJoin').classList.add('online-join-master');
        $('onlineJoinTitolo').textContent = 'Guida la spedizione';
        $('onlineJoinTesto').textContent = 'Sei il master: guiderai la partita da qui, anche se il gioco gira sul PC di un altro.';
    }

    function avvio() {
        if (entrando) return;
        const s = salvato();
        const nuovo = () => { if (chiaveMaster) $('onlineJoin').classList.remove('online-hidden'); else window.onlineEntra(); };
        if (!s || !s.token) { nuovo(); return; }
        entrando = true;
        post('/api/online/entra', { code, token: s.token }).then(r => {
            entrando = false;
            // Token che la stanza non conosce più (stanza riaperta, posto preso da un altro...): si rientra da nuovi
            if (r.error) { try { localStorage.removeItem(CHIAVE); } catch (e) {} nuovo(); return; }
            entrato(r);
        }).catch(() => { entrando = false; ripianifica(avvio); });
    }

    /* ---------- Stream ---------- */
    function collega() {
        if (flusso) flusso.close();
        // z=1: regioni compresse dentro gli eventi (lo stream resta in chiaro, che i proxy come ngrok non trattengono)
        const z = typeof DecompressionStream === 'function' ? '&z=1' : '';
        flusso = new EventSource(`/api/online/flusso?code=${encodeURIComponent(code)}&token=${encodeURIComponent(token)}${z}&ngrok-skip-browser-warning=true`);
        ultimoSegnale = Date.now();
        const on = (ev, fn) => flusso.addEventListener(ev, e => { ultimoSegnale = Date.now(); try { fn(JSON.parse(e.data)); } catch (err) { console.error(err); } });
        on('parti', p => { codaParti = codaParti.then(() => p && p.z ? decomprimi(p.z) : p).then(applicaParti).catch(err => console.error(err)); });
        on('stato', s => { stato = s || {}; aggiornaNome(); disegnaBarra(); musica(); segnaEroi(); disegnaScelta(); });
        on('master', m => mostraAvviso(m.online ? '' : (m.chiusa ? 'Il master ha chiuso la partita' : 'Il master non è collegato'), !m.online));
        on('avviso', a => mostraAvviso(a.testo));
        on('gmstato', renderModPanel);  // solo per il moderatore: il server manda questo evento solo ai suoi flussi
        on('ping', () => {});
        // Flusso chiuso del tutto (anche per un token non più valido, 403): si rientra da avvio, che con un token scaduto entra da nuovi
        flusso.onerror = () => { if (flusso.readyState === 2) ripianifica(avvio); };
    }
    // Controllo del flusso muto: niente se un rientro è già in corso o fissato (non si apre una seconda strada)
    const rientroInCorso = () => !!riprova || entrando;
    setInterval(() => { if (token && !rientroInCorso() && Date.now() - ultimoSegnale > 35000) collega(); }, 10000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && token && !rientroInCorso() && Date.now() - ultimoSegnale > 20000) collega(); });

    /* ---------- Regioni ---------- */
    // Le regioni compresse si decomprimono in ordine d'arrivo (una coda: due eventi non si scavalcano)
    let codaParti = Promise.resolve();
    async function decomprimi(b64) {
        const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const testo = await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
        return JSON.parse(testo);
    }
    const DOVE = { topbar: 'partyTopBar', console: 'partyConsole', modal: 'wc3Modal' };
    // Si aggiornano solo i pezzi cambiati (morphdom, js/vendor/): animazioni CSS, immagini e scorrimento restano
    // dove sono invece di ripartire a ogni aggiornamento del master. Senza morphdom si sostituisce tutto.
    const OPZIONI_MORPH = { onBeforeElUpdated: (da, a) => !da.isEqualNode(a) };
    function elementoDa(html) {
        const t = document.createElement('template');
        t.innerHTML = rendiLeggero(html);
        return t.content.firstElementChild;
    }
    function trasforma(vecchio, nuovo) {
        if (!nuovo) return vecchio;
        if (typeof morphdom === 'function') return morphdom(vecchio, nuovo, OPZIONI_MORPH);
        vecchio.replaceWith(nuovo);
        return nuovo;
    }
    // Scorrimento del master (carosello dei capitoli, diario...): data-online-scroll="x,y" scritto da js/online.js
    function applicaScorrimento(root) {
        if (!root) return;
        [root, ...root.querySelectorAll('[data-online-scroll]')].forEach(el => {
            const v = el.getAttribute && el.getAttribute('data-online-scroll');
            if (!v) return;
            const [x, y] = v.split(',').map(Number);
            if (Math.abs(el.scrollLeft - x) > 2 || Math.abs(el.scrollTop - y) > 2) el.scrollTo({ left: x, top: y, behavior: 'smooth' });
        });
    }
    // Video (sfondo del menu, nemici elite e boss): senza audio, partono da soli quando sono visibili.
    // Il master li avvia dal codice (play()), che nella copia della pagina non c'è
    function avviaVideo() {
        document.querySelectorAll('video[src]').forEach(v => {
            v.muted = true; v.playsInline = true;
            if (v.closest('.hidden')) { if (!v.paused) v.pause(); return; }
            if (v.paused) v.play().catch(() => {});
        });
    }
    function applicaParti(parti) {
        Object.entries(parti || {}).forEach(([k, html]) => {
            if (k === 'body') { document.body.className = 'online-guest ' + (html || ''); return; }
            if (k === 'screen') {
                const box = $('gameContainer');
                const nuovo = html ? elementoDa(html) : null;
                const attuale = box.firstElementChild;
                // Stessa schermata: si aggiorna; schermata nuova: si mette al posto della vecchia (parte la sua animazione d'ingresso)
                if (nuovo && attuale && attuale.id && attuale.id === nuovo.id) applicaScorrimento(trasforma(attuale, nuovo));
                else { box.replaceChildren(...(nuovo ? [nuovo] : [])); applicaScorrimento(nuovo); }
                return;
            }
            if (k === 'scena') {
                const scena = document.querySelector('.menu-scene');
                if (scena && html) trasforma(scena, elementoDa(html));
                return;
            }
            if (k === 'overlays') {
                const box = $('onlineOverlays');
                trasforma(box, elementoDa(`<div id="onlineOverlays">${html || ''}</div>`));
                return;
            }
            const id = DOVE[k];
            if (!id) return;
            const vecchio = $(id);
            if (!html) { vecchio.innerHTML = ''; if (k === 'modal') vecchio.classList.add('hidden'); return; }
            applicaScorrimento(trasforma(vecchio, elementoDa(html)));
        });
        avviaVideo();
        segnaEroi();
        disegnaScelta();  // i ritratti del pannello si prendono dalle regioni appena arrivate
    }

    /* ---------- Il mio eroe e il turno degli altri ---------- */
    // Le carte arrivano dal master uguali per tutti: qui si segna quella del giocatore (cornice dorata e "TU") e si
    // spengono un poco le altre. Nello scontro, quando agisce l'eroe di un altro, i comandi sono grigi con
    // "Tocca a Icaro" (il nome di un giocatore è quello del suo eroe). Si rifà a ogni aggiornamento (morphdom rimette le classi del master).
    function segnaEroi() {
        const owners = stato.owners || {};
        document.querySelectorAll('.hero-mini-card[data-hero]').forEach(c => {
            const chi = owners[c.dataset.hero];
            c.classList.toggle('online-mio', !!nome && chi === nome);
            c.classList.toggle('online-altro', !!chi && chi !== nome);
        });
        turnoAltrui(owners);
    }
    function turnoAltrui(owners) {
        const sezione = $('heroTurnSection');
        if (!sezione) return;
        let riga = $('onlineTurnoAltrui');
        const carte = [...document.querySelectorAll('.hero-mini-card[data-hero]')];
        const attivo = carte.find(c => c.classList.contains('is-turn'));
        // Eroi che possono agire adesso: quello scelto, o (prima della scelta) chi non ha ancora agito
        const possono = attivo ? [attivo] : carte.filter(c => !c.classList.contains('has-acted') && !c.classList.contains('dead'));
        const altrui = possono.filter(c => owners[c.dataset.hero] && owners[c.dataset.hero] !== nome);
        // Il master a distanza può agire per chiunque (come il master sul PC): niente comandi spenti
        const master = ruolo === 'master';
        const tocca = !master && possono.length && !possono.some(c => owners[c.dataset.hero] === nome) && altrui.length;
        const comandi = attivo ? sezione.querySelectorAll('#combatActionButtons .cmd-btn, #combatChangeHeroBtn')
            : sezione.querySelectorAll('#heroChoiceArea button');
        // Ritratti di chi agisce: spenti quelli degli eroi di un altro giocatore
        const altro = b => !master && !!b.dataset.hero && !!owners[b.dataset.hero] && owners[b.dataset.hero] !== nome;
        comandi.forEach(b => {
            const spegni = tocca || (!attivo && altro(b));
            // data-online-era: il pulsante era già disattivato dal master (resta così quando torna il proprio turno)
            if (spegni && !b.classList.contains('online-non-mio')) {
                b.dataset.onlineEra = b.disabled ? '1' : '';
                b.disabled = true; b.classList.add('online-non-mio');
            } else if (!spegni && b.classList.contains('online-non-mio')) {
                b.classList.remove('online-non-mio');
                b.disabled = b.dataset.onlineEra === '1';
                delete b.dataset.onlineEra;
            }
        });
        if (!tocca) { if (riga) riga.remove(); return; }
        if (!riga) {
            riga = document.createElement('p');
            riga.id = 'onlineTurnoAltrui';
            sezione.prepend(riga);
        }
        const testo = 'Tocca a ' + altrui.map(c => c.dataset.hero).join(', ');
        if (riga.textContent !== testo) riga.textContent = testo;
    }

    /* ---------- Scelta dell'eroe e attesa ----------
       Il giocatore entra senza nome e prende quello dell'eroe che sceglie (/api/online/scegli). I pannelli sono
       della sola pagina del giocatore, disegnati dallo stato (stato.rosa, stato.giocatori), non specchiati dal
       master; sotto si continua a vedere la schermata del master. */
    const senzaEroe = () => ruolo === 'giocatore' && !nome;
    let sceltaFatta = 0;  // momento dell'ultima scelta riuscita
    // Il proprio nome si legge da stato.giocatori (i giocatori non ricevono l'evento "stanza"): può tornare null
    // quando il master libera l'eroe (/libera; il motivo arriva con un "avviso")
    function aggiornaNome() {
        const io = mioId && (stato.giocatori || []).find(gi => gi.id === mioId);
        if (!io) return;
        const n = io.name == null ? null : io.name;
        // Lo stato conferma il nome: finita l'attesa dopo la scelta (un /libera successivo si vede subito)
        if (n === nome) { if (n !== null) sceltaFatta = 0; return; }
        // Subito dopo una scelta può arrivare uno stato mandato prima di essa, ancora senza nome: si aspetta il prossimo
        if (n === null && Date.now() - sceltaFatta < 4000) return;
        nome = n;
        salva({ token, nome, ruolo });
    }
    let scegliendo = false;
    function scegli(eroe) {
        if (!eroe || scegliendo || !senzaEroe()) return;
        scegliendo = true;
        post('/api/online/scegli', { code, token, eroe: String(eroe) }).then(r => {
            if (!r || r.error) { mostraAvviso((r && r.error) || 'Scelta non riuscita'); return; }
            nome = r.nome || String(eroe); sceltaFatta = Date.now();
            salva({ token, nome, ruolo });
            disegnaBarra(); segnaEroi(); disegnaScelta();
        }).catch(() => mostraAvviso('Connessione persa, riprova')).then(() => { scegliendo = false; });
    }
    // Ritratti: la pagina non ha i dati degli eroi (HERO_PORTRAITS di js/ritratti.js), quindi copia l'immagine
    // del ritratto da quello che il master ha già mandato (griglia della creazione, carte degli eroi) e la
    // ricorda; senza, l'iniziale su fondo colorato, come fa il gioco per un eroe senza ritratto
    const ritratti = {};
    function ritratto(n) {
        if (!ritratti[n]) {
            const img = [...document.querySelectorAll('img.portrait-img')].find(i => i.alt === n && !i.classList.contains('is-wounded'));
            if (img) ritratti[n] = img.outerHTML;
        }
        if (ritratti[n]) return `<span class="hero-portrait has-portrait">${ritratti[n]}</span>`;
        let tinta = 0;
        for (const ch of n) tinta = (tinta * 31 + ch.charCodeAt(0)) % 360;
        return `<span class="hero-portrait" style="--hue:${tinta}"><span>${esc(n.charAt(0))}</span></span>`;
    }
    const NOTE_ROSA = { da_creare: 'da creare', in_creazione: 'in creazione', sospeso: 'creazione in sospeso', creato: 'libero' };
    let ultimaScelta = '';
    function disegnaScelta() {
        const rosa = stato.rosa || null;
        const fase = rosa ? rosa.fase : 'attesa';
        const attesa = ruolo === 'giocatore' && !nome && fase === 'attesa';
        const scelta = senzaEroe() && (fase === 'creazione' || fase === 'partita');
        $('onlineAttesa').classList.toggle('online-hidden', !attesa);
        $('onlineScelta').classList.toggle('online-hidden', !scelta);
        if (!scelta) return;
        const giocatori = stato.giocatori || [];
        const io = { id: mioId, name: null, ruolo };
        const eroi = rosa.eroi || [];
        let occupati = 0;
        const voci = eroi.map(e => {
            // Occupato: lo ha un giocatore collegato (uno scollegato lo perde a chi lo sceglie)
            const occupato = giocatori.some(gi => gi.id !== mioId && gi.name === e.nome && gi.connected);
            if (occupato) occupati++;
            const esito = occupato ? null : esitoSceltaEroe(e.nome, io, giocatori, rosa);
            const libero = !!esito && esito.ok;
            const nota = occupato ? (e.stato === 'in_creazione' ? 'Sta creando: ' + e.nome : 'occupato')
                : libero ? (NOTE_ROSA[e.stato] || 'libero') : esito.motivo;
            return `<button type="button" class="online-eroe${libero ? '' : ' online-eroe-occupato'}" data-eroe="${esc(e.nome)}"${libero ? '' : ' disabled'}>`
                + `${ritratto(e.nome)}<span class="online-eroe-nome">${esc(e.nome)}</span><span class="online-eroe-nota">${esc(nota)}</span></button>`;
        });
        const tutti = eroi.length > 0 && occupati >= eroi.length;
        const box = $('onlineScelta');
        box.classList.toggle('online-scelta-guarda', tutti || !eroi.length);
        // Rosa ancora vuota: si aspetta il master (non "tutti in gioco")
        const html = !eroi.length ? '<p class="online-scelta-testo">Il master sta preparando il capitolo…</p>'
            : tutti ? '<p class="online-scelta-testo">Stai guardando: tutti gli eroi sono in gioco</p>'
            : `<h2 class="wc-heading">Scegli il tuo eroe</h2><div class="online-eroi">${voci.join('')}</div>`;
        // Si riscrive solo se cambia (il browser riscrive l'HTML a modo suo: si confronta con l'ultimo scritto)
        if (html !== ultimaScelta) { $('onlineSceltaCorpo').innerHTML = html; ultimaScelta = html; }
    }
    $('onlineScelta').addEventListener('click', e => {
        const b = e.target.closest('button[data-eroe]');
        if (b && !b.disabled) scegli(b.dataset.eroe);
    });
    // Pulsantino "Moderatore" nell'angolo dei pannelli: apre il modulo d'ingresso del moderatore
    document.querySelectorAll('[data-online-moderatore]').forEach(b => b.addEventListener('click', () => {
        $('onlineJoinErrore').textContent = '';
        $('onlineJoin').classList.remove('online-hidden');
    }));

    // Regione e percorso di un elemento (indici fra i figli, senza SCRIPT e AUDIO): il master trova lo stesso elemento
    const RADICI = { partyTopBar: 'topbar', partyConsole: 'console', wc3Modal: 'modal' };
    function radiceDi(el) {
        const scr = $('gameContainer');
        if (scr.contains(el)) return { regione: 'screen', root: scr.firstElementChild };
        const ov = $('onlineOverlays');
        if (ov.contains(el)) return { regione: 'overlays', root: ov };
        for (const [id, reg] of Object.entries(RADICI)) { const r = $(id); if (r && r.contains(el)) return { regione: reg, root: r }; }
        return null;
    }
    const figli = n => [...n.children].filter(c => c.tagName !== 'SCRIPT' && c.tagName !== 'AUDIO');
    function percorso(root, el) {
        const p = [];
        for (let n = el; n && n !== root; n = n.parentElement) p.unshift(figli(n.parentElement).indexOf(n));
        return p;
    }
    // Valori dei menu e dei campi della regione (proprietà, non attributi), per percorso
    function valori(root) {
        const out = {};
        root.querySelectorAll('select, input, textarea').forEach(c => { out[percorso(root, c).join('.')] = c.type === 'checkbox' ? c.checked : c.value; });
        return out;
    }

    /* ---------- Clic ---------- */
    const SEL = { click: '[data-action], [data-modal-btn]', change: '[data-change]', input: '[data-input]', keydown: '[data-enter]' };
    function inoltra(tipo, e) {
        if (!token || ['onlineJoin', 'onlineScelta', 'onlineAttesa'].some(id => $(id).contains(e.target))) return;
        if (tipo === 'keydown' && e.key !== 'Enter') return;
        if (e.target.closest && e.target.closest('#onlineBar')) return;  // la barra ha le sue azioni
        const el = e.target.closest && e.target.closest(SEL[tipo]);
        if (!el || el.disabled) return;
        const r = radiceDi(el);
        if (!r) return;
        e.preventDefault(); e.stopPropagation();
        const modale = el.dataset.modalBtn !== undefined;
        const attr = { click: 'action', change: 'change', input: 'input', keydown: 'enter' }[tipo];
        let args = [];
        try { args = JSON.parse(el.dataset[{ click: 'args', change: 'changeArgs', input: 'inputArgs', keydown: 'enterArgs' }[tipo]] || '[]'); } catch (err) {}
        args = (Array.isArray(args) ? args : [args]).map(a => a === '$value' ? el.value : a === '$checked' ? el.checked : a);
        // Giocatore senza eroe che tocca un eroe nella griglia della creazione: è la sua scelta (/api/online/scegli)
        if (!modale && tipo === 'click' && el.dataset.action === 'selectHeroCard' && senzaEroe()) { scegli(args[0]); return; }
        post('/api/online/clic', { code, token, tipo, regione: r.regione, percorso: percorso(r.root, el),
            azione: modale ? '__modal' : el.dataset[attr], args: modale ? [Number(el.dataset.modalBtn)] : args, valori: valori(r.root) })
            .then(x => { if (x && x.error) mostraAvviso(x.error); }).catch(() => mostraAvviso('Connessione persa, riprova'));
    }
    ['click', 'change', 'input', 'keydown'].forEach(tipo => document.addEventListener(tipo, e => inoltra(tipo, e), true));

    /* ---------- Barra: turno, voto, pronti, musica ---------- */
    const comando = (azione, args) => post('/api/online/clic', { code, token, tipo: 'click', regione: null, percorso: [], azione, args, valori: {} });
    window.onlineVota = (id, op) => comando('__vota', [id, op]);
    // Master a distanza: chiude il voto con l'opzione scelta, o fa partire tutti anche se qualcuno non ha finito
    window.onlineForzaVoto = (id, op) => comando('__forza_voto', [id, op]);
    window.onlineForzaPronti = () => comando('__forza_pronti', []);
    function disegnaBarra() {
        const v = stato.voto;
        const attesoIo = (stato.attesi || []).includes(nome);
        // Spettatore (giocatore senza eroe): non vota e non conta nei "pronti", quindi niente di quei comandi
        const spettatore = ruolo === 'giocatore' && nome == null;
        const parti = [];
        parti.push(`<div class="wc-panel">${esc(nome || (ruolo === 'giocatore' ? 'Spettatore' : ''))}${ruolo === 'master' ? ' · Master' : ''}${nome && stato.capo === nome ? ' 👑' : ''}${attesoIo ? ' · <span id="onlineTurno">Tocca a te</span>' : ''}</div>`);
        if (ruolo !== 'master' && stato.masterRemoto && !stato.masterRemoto.connesso) parti.push('<div class="wc-panel" id="onlineMasterAttesa">Il master si sta riconnettendo…</div>');
        if (v && ruolo === 'master') {
            parti.push(`<div class="wc-panel"><b>${esc(v.domanda)}</b> Decidi: ${v.opzioni.map(o =>
                `<button class="btn-small" data-action="onlineForzaVoto" data-args='${esc(JSON.stringify([v.id, o.id]))}'>${esc(o.label)} ${conta(v, o.id)}</button>`).join(' ')}</div>`);
        } else if (v && !spettatore) {
            const mio = (v.voti || {})[nome];
            const secondi = Math.max(0, Math.ceil((v.scadenza - Date.now() + (stato.orologio ? Date.now() - stato.orologio : 0)) / 1000));
            parti.push(`<div class="wc-panel"><b>${esc(v.domanda)}</b> (${secondi}s) ${v.opzioni.map(o =>
                `<button class="btn-small ${mio === o.id ? 'mio' : ''}" data-action="onlineVota" data-args='${esc(JSON.stringify([v.id, o.id]))}'>${esc(o.label)} ${conta(v, o.id)}</button>`).join(' ')}</div>`);
        }
        if (stato.pronti && !spettatore) parti.push(`<div class="wc-panel">Pronti: ${stato.pronti.fatti.length}/${stato.pronti.totale}${stato.pronti.fatti.includes(nome) ? ' ✓' : ''}${ruolo === 'master' ? ' <button class="btn-small" data-action="onlineForzaPronti">Si parte</button>' : ''}</div>`);
        parti.push(`<div class="wc-panel"><button class="btn-small" data-action="onlineMusica">${musicaAccesa() ? '🔊' : '🔇'} Musica</button></div>`);
        $('onlineBar').innerHTML = parti.join('');
    }
    const conta = (v, id) => { const n = Object.values(v.voti || {}).filter(x => x === id).length; return n ? `· ${n}` : ''; };
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    // Clic della barra: non passano dall'inoltro (vedi inoltra), li gestisce questo ascoltatore
    $('onlineBar').addEventListener('click', e => {
        const b = e.target.closest('[data-action]');
        if (!b) return;
        let a = []; try { a = JSON.parse(b.dataset.args || '[]'); } catch (err) {}
        if (typeof window[b.dataset.action] === 'function') window[b.dataset.action](...a);
    });
    setInterval(() => { if (stato.voto) disegnaBarra(); }, 1000);

    const musicaAccesa = () => { try { return localStorage.getItem('dignitas_online_musica') === '1'; } catch (e) { return false; } };
    window.onlineMusica = () => { try { localStorage.setItem('dignitas_online_musica', musicaAccesa() ? '0' : '1'); } catch (e) {} musica(); disegnaBarra(); };
    function musica() {
        const a = $('onlineMusica');
        const src = musicaAccesa() && stato.musica ? stato.musica : '';
        if (!src) { a.pause(); return; }
        if (a.getAttribute('src') !== src) { a.setAttribute('src', src); a.volume = 0.5; }
        a.play().catch(() => {});
    }

    /* ---------- Pannello privato del moderatore ----------
       Non è una regione specchiata (onlineRegioni/applicaParti): esiste solo su questa pagina, popolato
       dall'evento "gmstato" che il server manda solo ai flussi con ruolo 'moderatore' (mai al master
       né agli altri giocatori). I pulsanti chiamano direttamente window.onlineModAzione, senza passare
       dall'inoltro dei clic (inoltra) che simula un clic sullo schermo del master. */
    function applicaRuolo() {
        $('onlineModPanel').classList.toggle('online-hidden', !['moderatore', 'master'].includes(ruolo));
        document.documentElement.dataset.ruolo = ruolo;
        disegnaBarra();
        disegnaScelta();
    }
    // Il pulsante apre/chiude il pannello solo su questa pagina: nessun'altra ha idea che esista
    $('onlineModToggle').addEventListener('click', () => $('onlineModBox').classList.toggle('online-hidden'));
    function renderModPanel(dati) {
        if (!['moderatore', 'master'].includes(ruolo)) return;
        const box = $('onlineModBody');
        if (!box) return;
        const d = dati || { heroes: [], enemy: null };
        const riga = (nomeEroe, hp, maxHp, prefissoArgs, caduto) => `
            <div class="onmod-row">
                <span class="onmod-name">${esc(nomeEroe)}${caduto && hp <= 0 ? ' (caduto)' : ''}</span>
                <span class="onmod-controls">
                    <button data-mod="${prefissoArgs.adjust}" data-args='${esc(JSON.stringify([...prefissoArgs.base, -5]))}'>-5</button>
                    <button data-mod="${prefissoArgs.adjust}" data-args='${esc(JSON.stringify([...prefissoArgs.base, -1]))}'>-1</button>
                    <input type="number" value="${hp}" data-mod="${prefissoArgs.set}" data-args-base='${esc(JSON.stringify(prefissoArgs.base))}'>
                    <span>/ ${maxHp}</span>
                    <button data-mod="${prefissoArgs.adjust}" data-args='${esc(JSON.stringify([...prefissoArgs.base, 1]))}'>+1</button>
                    <button data-mod="${prefissoArgs.adjust}" data-args='${esc(JSON.stringify([...prefissoArgs.base, 5]))}'>+5</button>
                </span>
            </div>`;
        const heroRows = (d.heroes || []).map(h => riga(h.name, h.hp, h.maxHp, { adjust: 'gmAdjustHeroHp', set: 'gmSetHeroHp', base: [h.name] }, true))
            .join('') || '<p class="online-join-hint">Nessuna squadra in gioco.</p>';
        const enemyHtml = d.enemy ? riga(d.enemy.name, d.enemy.hp, d.enemy.maxHp, { adjust: 'gmAdjustEnemyHp', set: 'gmSetEnemyHp', base: [] }, false)
            : '<p class="online-join-hint">Nessuno scontro in corso.</p>';
        box.innerHTML = `
            <p class="online-join-hint">Squadra</p>
            ${heroRows}
            <div class="onmod-actions">
                <button class="btn-small" data-mod="gmRefillParty" data-args="[]">Rifornisci HP</button>
                <button class="btn-small" data-mod="gmClearPartyStatuses" data-args="[]">Pulisci Stati</button>
            </div>
            <p class="online-join-hint">Nemico</p>
            ${enemyHtml}`;
    }
    window.onlineModAzione = (azione, args) => post('/api/online/moderatore-azione', { code, token, azione, args })
        .then(r => { if (r && r.error) mostraAvviso(r.error); }).catch(() => mostraAvviso('Connessione persa, riprova'));
    $('onlineModPanel').addEventListener('click', e => {
        const b = e.target.closest('button[data-mod]');
        if (!b) return;
        let a = []; try { a = JSON.parse(b.dataset.args || '[]'); } catch (err) {}
        window.onlineModAzione(b.dataset.mod, a);
    });
    $('onlineModPanel').addEventListener('change', e => {
        const inp = e.target.closest('input[data-mod]');
        if (!inp) return;
        let base = []; try { base = JSON.parse(inp.dataset.argsBase || '[]'); } catch (err) {}
        window.onlineModAzione(inp.dataset.mod, [...base, Number(inp.value) || 0]);
    });

    /* ---------- Avvisi e tooltip ---------- */
    let avvisoTimer = null;
    function mostraAvviso(testo, fisso) {
        const box = $('onlineAvviso');
        clearTimeout(avvisoTimer);
        if (!testo) { box.classList.add('online-hidden'); return; }
        box.textContent = testo; box.classList.remove('online-hidden');
        if (!fisso) avvisoTimer = setTimeout(() => box.classList.add('online-hidden'), 3000);
    }
    document.addEventListener('mouseover', e => {
        const el = e.target.closest && e.target.closest('[data-tip]');
        const tip = $('wc3Tooltip');
        if (!el) { tip.classList.remove('show'); return; }
        const [titolo, desc] = String(el.dataset.tip).split('||');
        tip.innerHTML = `<div class="tip-title">${titolo}</div>${desc ? `<div class="tip-body">${desc}</div>` : ''}`;
        tip.classList.add('show');
    });
    document.addEventListener('mousemove', e => {
        const tip = $('wc3Tooltip');
        if (!tip.classList.contains('show')) return;
        tip.style.left = Math.min(e.clientX + 16, innerWidth - tip.offsetWidth - 8) + 'px';
        tip.style.top = Math.min(e.clientY + 16, innerHeight - tip.offsetHeight - 8) + 'px';
    });

    avvio();
})();
