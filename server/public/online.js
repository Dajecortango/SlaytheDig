/* ==========================================================================
   PAGINA DEL GIOCATORE (partita online)
   Inserisce le regioni della schermata del master, mostra tooltip, voto,
   turno e avvisi, inoltra i clic al master (che decide se eseguirli).
   ========================================================================== */
(function () {
    const code = location.pathname.split('/')[2] || '';
    const CHIAVE = `dignitas_online_${code}`;
    const NGROK = { 'ngrok-skip-browser-warning': 'true' };
    let token = null, nome = null, ruolo = 'giocatore', stato = {}, flusso = null, ultimoSegnale = 0;
    const $ = id => document.getElementById(id);

    const salvato = () => { try { return JSON.parse(localStorage.getItem(CHIAVE) || 'null'); } catch (e) { return null; } };
    const salva = v => { try { localStorage.setItem(CHIAVE, JSON.stringify(v)); } catch (e) {} };

    function post(url, body) {
        const ctrl = window.AbortController ? new AbortController() : null;
        if (ctrl) setTimeout(() => ctrl.abort(), 8000);
        return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...NGROK }, body: JSON.stringify(body), signal: ctrl && ctrl.signal })
            .then(r => r.json());
    }

    /* ---------- Ingresso ---------- */
    // ruolo 'moderatore' (pulsante "Entra come Moderatore"): niente eroe, può solo aprire il Pannello
    // di Controllo del master (js/online.js, onlineGate + ONLINE_AZIONI_MODERATORE)
    window.onlineEntra = function (ruoloRichiesto) {
        const n = $('onlineNome').value;
        const corpo = { code, nome: n };
        if (ruoloRichiesto === 'moderatore') corpo.ruolo = 'moderatore';
        post('/api/online/entra', corpo).then(r => {
            if (r.error) { $('onlineJoinErrore').textContent = r.error; return; }
            token = r.token; nome = r.nome; ruolo = r.ruolo || 'giocatore'; salva({ token, nome });
            $('onlineJoin').classList.add('online-hidden');
            applicaRuolo();
            collega();
        }).catch(() => { $('onlineJoinErrore').textContent = 'Connessione non riuscita, riprova'; });
    };

    // La pagina del giocatore non carica js/azioni.js: il modulo d'ingresso ha i suoi ascoltatori
    document.getElementById('onlineEntraBtn').addEventListener('click', () => window.onlineEntra());
    document.getElementById('onlineEntraModeratoreBtn').addEventListener('click', () => window.onlineEntra('moderatore'));
    document.getElementById('onlineNome').addEventListener('keydown', e => { if (e.key === 'Enter') window.onlineEntra(); });

    function avvio() {
        const s = salvato();
        if (!s) { $('onlineJoin').classList.remove('online-hidden'); $('onlineNome').focus(); return; }
        post('/api/online/entra', { code, nome: s.nome, token: s.token }).then(r => {
            if (r.error) { localStorage.removeItem(CHIAVE); $('onlineJoin').classList.remove('online-hidden'); return; }
            token = r.token; nome = r.nome; ruolo = r.ruolo || 'giocatore'; salva({ token, nome });
            applicaRuolo();
            collega();
        }).catch(() => setTimeout(avvio, 3000));
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
        on('stato', s => { stato = s || {}; disegnaBarra(); musica(); segnaEroi(); });
        on('master', m => mostraAvviso(m.online ? '' : (m.chiusa ? 'Il master ha chiuso la partita' : 'Il master non è collegato'), !m.online));
        on('avviso', a => mostraAvviso(a.testo));
        on('gmstato', renderModPanel);  // solo per il moderatore: il server manda questo evento solo ai suoi flussi
        on('ping', () => {});
        flusso.onerror = () => { if (flusso.readyState === 2) setTimeout(collega, 3000); };
    }
    setInterval(() => { if (token && Date.now() - ultimoSegnale > 35000) collega(); }, 10000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && token && Date.now() - ultimoSegnale > 20000) collega(); });

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
    }

    /* ---------- Il mio eroe e il turno degli altri ---------- */
    // Le carte arrivano dal master uguali per tutti: qui si segna quella del giocatore (cornice dorata e "TU") e si
    // spengono un poco le altre. Nello scontro, quando agisce l'eroe di un altro, i comandi sono grigi con
    // "Tocca a Luca (Icaro)". Si rifà a ogni aggiornamento (morphdom rimette le classi del master).
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
        const tocca = possono.length && !possono.some(c => owners[c.dataset.hero] === nome) && altrui.length;
        const comandi = attivo ? sezione.querySelectorAll('#combatActionButtons .cmd-btn, #combatChangeHeroBtn')
            : sezione.querySelectorAll('#heroChoiceArea button');
        // Ritratti di chi agisce: spenti quelli degli eroi di un altro giocatore
        const altro = b => !!b.dataset.hero && !!owners[b.dataset.hero] && owners[b.dataset.hero] !== nome;
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
        const testo = 'Tocca a ' + altrui.map(c => `${owners[c.dataset.hero]} (${c.dataset.hero})`).join(', ');
        if (riga.textContent !== testo) riga.textContent = testo;
    }

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
        if (!token || $('onlineJoin').contains(e.target)) return;
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
        post('/api/online/clic', { code, token, tipo, regione: r.regione, percorso: percorso(r.root, el),
            azione: modale ? '__modal' : el.dataset[attr], args: modale ? [Number(el.dataset.modalBtn)] : args, valori: valori(r.root) })
            .then(x => { if (x && x.error) mostraAvviso(x.error); }).catch(() => mostraAvviso('Connessione persa, riprova'));
    }
    ['click', 'change', 'input', 'keydown'].forEach(tipo => document.addEventListener(tipo, e => inoltra(tipo, e), true));

    /* ---------- Barra: turno, voto, pronti, musica ---------- */
    window.onlineVota = (id, op) => post('/api/online/clic', { code, token, tipo: 'click', regione: null, percorso: [], azione: '__vota', args: [id, op], valori: {} });
    function disegnaBarra() {
        const v = stato.voto;
        const attesoIo = (stato.attesi || []).includes(nome);
        const parti = [];
        parti.push(`<div class="wc-panel">${esc(nome || '')}${stato.capo === nome ? ' 👑' : ''}${attesoIo ? ' · <span id="onlineTurno">Tocca a te</span>' : ''}</div>`);
        if (v) {
            const mio = (v.voti || {})[nome];
            const secondi = Math.max(0, Math.ceil((v.scadenza - Date.now() + (stato.orologio ? Date.now() - stato.orologio : 0)) / 1000));
            parti.push(`<div class="wc-panel"><b>${esc(v.domanda)}</b> (${secondi}s) ${v.opzioni.map(o =>
                `<button class="btn-small ${mio === o.id ? 'mio' : ''}" data-action="onlineVota" data-args='${esc(JSON.stringify([v.id, o.id]))}'>${esc(o.label)} ${conta(v, o.id)}</button>`).join(' ')}</div>`);
        }
        if (stato.pronti) parti.push(`<div class="wc-panel">Pronti: ${stato.pronti.fatti.length}/${stato.pronti.totale}${stato.pronti.fatti.includes(nome) ? ' ✓' : ''}</div>`);
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
        $('onlineModPanel').classList.toggle('online-hidden', ruolo !== 'moderatore');
    }
    // Il pulsante apre/chiude il pannello solo su questa pagina: nessun'altra ha idea che esista
    $('onlineModToggle').addEventListener('click', () => $('onlineModBox').classList.toggle('online-hidden'));
    function renderModPanel(dati) {
        if (ruolo !== 'moderatore') return;
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
