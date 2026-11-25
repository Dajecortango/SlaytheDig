// Partita online: riconnessione del master (stanza ricordata nel browser, ripresa della partita) e reazioni dei giocatori
// (voci fisse, limite di frequenza, fumetti sullo schermo del master). Server: node tools/prova_online.mjs
module.exports = (t, carica) => {
    const R = require('../js/online-regole.js');

    t.test('reazioni: solo voci predefinite, una ogni 3 secondi, spente dal master, mai dal master a distanza', () => {
        t.ok(R.ONLINE_REAZIONI.length >= 5 && R.ONLINE_REAZIONI.length <= 6, '5-6 voci');
        t.ok(R.ONLINE_REAZIONI.every(r => /^[a-z_]+$/.test(r.id) && r.testo && r.icona), 'ogni voce ha id, testo e icona');
        t.uguale(3000, R.ONLINE_REAZIONE_MS);
        t.ok(R.esitoReazione('tifo', 0, 1000, { ruolo: 'giocatore' }).ok, 'la prima passa');
        t.ok(!R.esitoReazione('<script>', 0, 1000, {}).ok, 'testo libero rifiutato');
        t.ok(!R.esitoReazione('tifo', 10000, 12000, {}).ok, 'troppo presto');
        t.ok(R.esitoReazione('tifo', 10000, 13000, {}).ok, 'dopo 3 secondi sì');
        t.uguale('Il master ha spento le reazioni', R.esitoReazione('risata', 0, 1, { spente: true }).motivo);
        t.ok(!R.esitoReazione('risata', 0, 1, { ruolo: 'master' }).ok);
        t.ok(R.esitoReazione('paura', 0, 1, { ruolo: 'moderatore' }).ok, 'il moderatore può');
    });

    t.test('avviso del master assente: attesa con i minuti che restano, chiusa, scaduta', () => {
        t.uguale('', R.testoMasterAssente({ online: true }, 0));
        t.uguale('Il master si è disconnesso, attendere…', R.testoMasterAssente({ online: false }, 0));
        t.ok(/attendere… \(stanza aperta ancora 30 min\)/.test(R.testoMasterAssente({ online: false, scadenza: 30 * 60000 }, 0)));
        t.ok(/ancora 1 min/.test(R.testoMasterAssente({ online: false, scadenza: 1000 }, 5000)), 'mai meno di un minuto');
        t.uguale('Il master ha chiuso la partita', R.testoMasterAssente({ online: false, chiusa: true }, 0));
        t.uguale('Il master non è tornato: la partita è chiusa', R.testoMasterAssente({ online: false, chiusa: true, scaduta: true }, 0));
    });

    const conPost = h => h.eval(`globalThis.__post = []; globalThis.onlinePost = (url, body) => { __post.push({ url, body }); return Promise.resolve({}); };
        globalThis.onlineMostraLink = () => { globalThis.__link = (globalThis.__link || 0) + 1; };
        globalThis.onlineRiprendi = () => { globalThis.__ripresa = (globalThis.__ripresa || 0) + 1; };`);

    t.test('stanza ricordata: codice e segreto nel browser, chiave a parte (non nei salvataggi)', () => {
        const h = carica();
        conPost(h);
        h.onlineAttiva({ code: 'abc123', segreto: 's'.repeat(32), chiaveMaster: 'k1', giocatori: [{ id: '1', name: 'Icaro', connected: true }] }, false);
        t.uguale({ code: 'abc123', segreto: 's'.repeat(32), chiaveMaster: 'k1', salvataggio: null }, h.onlineMemoria());
        t.uguale('Icaro', h.eval('onlineState.giocatori[0].name'), 'i giocatori della stanza arrivano con /apri');
        t.uguale(1, h.eval('__link'), 'stanza nuova: la finestra del link');
        h.eval(`stato.currentCampaign = CAMPAIGNS.tutorial; stato.stsMapNodes = []; stato.party = [{ name: 'Icaro' }];
            stato.unlockedRelics = []; stato.activeCurses = []; stato.expeditionStats = newExpeditionStats();`);
        h.onlineSalvaAutomatico();
        t.uguale('abc123', h.onlineMemoria().salvataggio, 'il salvataggio automatico dice a che stanza appartiene');
        t.ok(h.readSave('online'), 'lo slot online resta quello di sempre');
        h.onlineChiudi();
        t.uguale(null, h.onlineMemoria(), 'chiusa dal master: dimenticata');
        t.ok(h.eval(`__post.some(p => p.url === '/api/online/chiudi')`));
    });

    t.test('riprendi: stessa stanza con il suo salvataggio → partita ripresa; stanza nuova → niente', () => {
        const h = carica();
        conPost(h);
        h.eval(`stato.currentCampaign = CAMPAIGNS.tutorial; stato.stsMapNodes = []; stato.party = [{ name: 'Icaro' }];
            stato.unlockedRelics = []; stato.activeCurses = []; stato.expeditionStats = newExpeditionStats();`);
        h.onlineAttiva({ code: 'abc123', segreto: 'x', chiaveMaster: 'k' }, false);
        h.onlineSalvaAutomatico();
        // Pagina ricaricata: lo stato online riparte da zero, la memoria resta
        h.eval('onlineState.attivo = false;');
        h.onlineAttiva({ code: 'abc123', segreto: 'x', chiaveMaster: 'k', giocatori: [] }, true);
        t.uguale(1, h.eval('__ripresa'), 'stessa stanza: la partita riparte dall\'ultima mappa');
        t.uguale('abc123', h.onlineMemoria().salvataggio, 'il legame col salvataggio resta');
        t.uguale(1, h.eval('__link'), 'riprendendo niente finestra del link');
        // Server ripartito: /apri dà una stanza nuova, il salvataggio non è suo
        h.eval('onlineState.attivo = false;');
        h.onlineAttiva({ code: 'zzz999', segreto: 'y', chiaveMaster: 'k2' }, true);
        t.uguale(1, h.eval('__ripresa'), 'stanza diversa: nessuna partita ripresa');
        t.uguale(null, h.onlineMemoria().salvataggio);
        t.uguale('zzz999', h.onlineMemoria().code);
    });

    t.test('stanza persa sul server (flusso chiuso): si chiude solo qui, senza /chiudi', () => {
        const h = carica();
        conPost(h);
        h.eval(`globalThis.__flussi = []; globalThis.EventSource = function () { const f = { readyState: 0, close() { f.readyState = 2; }, addEventListener() {} }; __flussi.push(f); return f; };`);
        h.onlineAttiva({ code: 'abc123', segreto: 'x' }, false);
        const prima = h.eval('__post.length');
        h.eval(`__flussi[0].readyState = 2; __flussi[0].onerror();`);
        t.ok(!h.eval('onlineState.attivo'), 'partita online spenta');
        t.uguale(null, h.onlineMemoria(), 'memoria tolta');
        t.ok(!h.eval(`__post.slice(${prima}).some(p => p.url === '/api/online/chiudi')`), 'niente /chiudi a una stanza che non c\'è');
    });

    t.test('flusso del master riaperto: la schermata si rimanda intera', () => {
        const h = carica();
        conPost(h);
        h.eval(`globalThis.__flussi = []; globalThis.EventSource = function () { const f = { readyState: 0, close() {}, addEventListener() {} }; __flussi.push(f); return f; };`);
        h.onlineAttiva({ code: 'abc123', segreto: 'x' }, false);
        h.eval(`onlineUltimeRegioni = { screen: 'vecchia' };`);
        h.eval('__flussi[0].onopen()');
        t.uguale({}, h.eval('onlineUltimeRegioni'));
    });

    t.test('reazioni sullo schermo del master: fumetto con il nome (o "Uno spettatore"), al massimo 4, spente dalle Opzioni', () => {
        const h = carica();
        conPost(h);
        h.eval(`
            const nodo = tag => ({ tag, children: [], attrs: {}, style: {}, classList: { add() {}, remove() {}, contains: () => false }, id: '', className: '', innerHTML: '', parent: null,
                setAttribute(k, v) { this.attrs[k] = v; },
                appendChild(c) { c.parent = this; this.children.push(c); return c; },
                remove() { if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1); if (this === __strato) __strato = null; },
                get firstElementChild() { return this.children[0]; } });
            globalThis.__strato = null;
            document.createElement = tag => nodo(tag);
            document.getElementById = id => id === 'onlineReazioniStrato' ? __strato : null;
            document.body.appendChild = el => { if (el.id === 'onlineReazioniStrato') __strato = el; return el; };
            onlineState.attivo = true;`);
        h.onlineMostraReazione({ reazione: 'famiglia', chi: 'Icaro' });
        t.ok(/Icaro/.test(h.eval('__strato.children[0].innerHTML')) && /Per la Famiglia!/.test(h.eval('__strato.children[0].innerHTML')));
        h.onlineMostraReazione({ reazione: 'risata', chi: null });
        t.ok(/Uno spettatore/.test(h.eval('__strato.children[1].innerHTML')));
        h.onlineMostraReazione({ reazione: 'inventata', chi: 'X' });
        t.uguale(2, h.eval('__strato.children.length'), 'voce sconosciuta ignorata');
        for (let i = 0; i < 5; i++) h.onlineMostraReazione({ reazione: 'tifo', chi: 'Zeno' });
        t.uguale(4, h.eval('__strato.children.length'), 'restano gli ultimi 4');
        h.onlineMostraReazione({ reazione: 'tifo', chi: '<b>x</b>' });
        t.ok(!/<b>x<\/b>/.test(h.eval('__strato.children[3].innerHTML')), 'il nome è protetto');
        t.ok(h.eval('onlineReazioniAccese()'));
        h.onlineCambiaReazioni();
        t.ok(!h.eval('onlineReazioniAccese()'));
        t.uguale(false, h.eval(`__post.filter(p => p.url === '/api/online/stato').at(-1).body.reazioni`), 'lo stato dice ai giocatori che sono spente');
        h.onlineMostraReazione({ reazione: 'tifo', chi: 'Zeno' });
        t.uguale(null, h.eval('__strato'), 'spente: nessun fumetto');
    });
};
