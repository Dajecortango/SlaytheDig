// Partita online: permessi, voti, capo della spedizione, regioni cambiate, media leggeri (js/online-regole.js)
module.exports = (t, carica) => {
    const g = carica();
    const M = g.eval('ONLINE_MASTER');
    const base = (extra = {}) => ({ screen: 'screenCombat', owners: { Icaro: 'Marco', Astarte: 'Sara' }, activeHero: null,
        selects: {}, creationTurn: null, discardHero: null, challengeHero: null, prayingHero: null, captainHero: null,
        modalOwner: null, voto: null, ...extra });

    t.test('il master può tutto, le azioni non elencate sono solo sue', () => {
        t.ok(g.onlineCanRun('saveGame', [], M, base()).ok);
        t.ok(!g.onlineCanRun('saveGame', [], 'Marco', base()).ok);
        t.ok(!g.onlineCanRun('azioneInventata', [], 'Marco', base()).ok);
    });

    t.test('scontro: si agisce solo con il proprio eroe', () => {
        t.ok(g.onlineCanRun('selectCombatAction', ['attack'], 'Marco', base({ activeHero: 'Icaro' })).ok);
        t.ok(!g.onlineCanRun('selectCombatAction', ['attack'], 'Sara', base({ activeHero: 'Icaro' })).ok);
        t.ok(g.onlineCanRun('confirmCombatHeroChoice', ['Astarte'], 'Sara', base()).ok);
        t.ok(!g.onlineCanRun('confirmCombatHeroChoice', ['Icaro'], 'Sara', base()).ok, 'ritratto dell\'eroe di un altro');
    });

    t.test('argomento con il nome dell\'eroe, scarto, creazione, finestre', () => {
        t.ok(g.onlineCanRun('trySellItem', ['Icaro', 0], 'Marco', base({ screen: 'screenMerchant' })).ok);
        t.ok(!g.onlineCanRun('trySellItem', ['Icaro', 0], 'Sara', base({ screen: 'screenMerchant' })).ok);
        t.ok(g.onlineCanRun('executeDiscard', [1], 'Sara', base({ discardHero: 'Astarte' })).ok);
        t.ok(g.onlineCanRun('selectHeroCard', ['Icaro'], 'Marco', base({ screen: 'screenParty', creationTurn: 'Marco' })).ok);
        t.ok(!g.onlineCanRun('selectHeroCard', ['Icaro'], 'Sara', base({ screen: 'screenParty', creationTurn: 'Marco' })).ok);
        t.ok(g.onlineCanRun('__modal', [0], 'Sara', base({ modalOwner: null })).ok, 'finestra del gioco: chiunque');
        t.ok(!g.onlineCanRun('__modal', [0], 'Sara', base({ modalOwner: 'Marco' })).ok, 'finestra aperta da Marco');
    });

    t.test('mappa, prove e preghiera: decide il master (nessun giocatore, nemmeno il capo); showScreen solo per vittoria e sconfitta', () => {
        const capo = base({ screen: 'screenMap', capo: 'Marco', selects: { challengeHeroSelect: 'Icaro', prayerHeroSelect: 'Icaro' } });
        for (const [azione, args] of [['selectStsNode', [3]], ['challengeChoose', [true]], ['challengeChoose', [false]],
            ['confirmChallengeHero', []], ['startPrayer', []], ['confirmPrayerHero', []]]) {
            const r = g.onlineCanRun(azione, args, 'Marco', capo);
            t.ok(!r.ok && !r.voto && !r.primo && !r.pronto, `${azione} solo del master`);
        }
        t.ok(g.onlineCanRun('selectStsNode', [3], g.eval('ONLINE_MASTER'), capo).ok);
        t.ok(g.onlineCanRun('showScreen', ['screenVictory'], 'Marco', base()).ok);
        t.ok(!g.onlineCanRun('showScreen', ['screenStart'], 'Marco', base()).ok);
    });

    t.test('resolveVote: maggioranza, pareggio e silenzio al capo, disconnessi esclusi', () => {
        const op = ['a', 'b', 'c'];
        t.uguale('b', g.resolveVote({ Marco: 'b', Sara: 'b', Luca: 'a' }, op, 'Luca', ['Marco', 'Sara', 'Luca']));
        t.uguale('a', g.resolveVote({ Marco: 'b', Luca: 'a' }, op, 'Luca', ['Marco', 'Luca']), 'pareggio: vince il voto del capo');
        t.uguale('a', g.resolveVote({}, op, 'Luca', ['Luca']), 'nessun voto: la prima opzione');
        t.uguale('b', g.resolveVote({ Marco: 'b', Sara: 'a' }, op, 'Luca', ['Marco']), 'Sara disconnessa non conta');
        t.uguale(null, g.resolveVote({ Marco: 'x' }, op, 'Luca', ['Marco']) === 'x' ? 'x' : null, 'opzione inesistente ignorata');
    });

    t.test('capo della spedizione: il primo giocatore; se è disconnesso, il primo collegato dopo di lui', () => {
        const gi = [{ name: 'Marco', connected: true }, { name: 'Sara', connected: true }, { name: 'Luca', connected: true }];
        t.uguale('Marco', g.capoSpedizione(['Marco', 'Sara', 'Luca'], gi));
        t.uguale('Sara', g.capoSpedizione(['Marco', 'Sara', 'Luca'], [{ name: 'Marco', connected: false }, ...gi.slice(1)]));
        t.uguale('Luca', g.capoSpedizione(['Luca', 'Marco'], gi), 'conta l\'ordine della compagnia');
        t.uguale(null, g.capoSpedizione([], gi));
    });

    t.test('changedRegions e media leggeri', () => {
        t.uguale({}, g.changedRegions({ a: '1', b: '2' }, { a: '1', b: '2' }));
        t.uguale({ b: '3', c: null }, g.changedRegions({ a: '1', b: '2', c: 'x' }, { a: '1', b: '3' }));
        t.uguale('/leggero/immagini/scene/x.webp', g.leggeroUrl('immagini/scene/x.webp'));
        t.uguale('immagini/icone/BTNA.png', g.leggeroUrl('immagini/icone/BTNA.png'), 'le icone restano');
        t.uguale('<img src="/leggero/immagini/a.webp"><video src="/leggero/video/nemici/b.mp4">',
            g.rendiLeggero('<img src="immagini/a.webp"><video src="video/nemici/b.mp4">'));
        t.uguale('url(&quot;/leggero/immagini/c.webp&quot;)', g.rendiLeggero('url(&quot;immagini/c.webp&quot;)'));
    });

    t.test('cancello delle azioni: se onlineGate dice no, la funzione non parte', () => {
        const h = carica();
        h.eval('globalThis.__chiamate = 0; globalThis.provaAzione = () => { globalThis.__chiamate++; }');
        t.ok(h.chiamaAzione('provaAzione', [], null));
        h.eval('window.onlineGate = () => false');
        t.ok(!h.chiamaAzione('provaAzione', [], null));
        t.uguale(1, h.eval('globalThis.__chiamate'));
    });

    t.test('salvataggio: i proprietari degli eroi vanno e tornano, i vecchi salvataggi hanno {}', () => {
        const h = carica();
        const stato = h.eval('stato');
        stato.currentCampaign = h.CAMPAIGNS.tutorial;
        stato.stsMapNodes = []; stato.party = [{ name: 'Curio Dignitas', hp: 4, maxHp: 4, items: [] }];
        stato.unlockedRelics = []; stato.activeCurses = []; stato.expeditionStats = h.eval('newExpeditionStats()');
        stato.onlineOwners = { 'Curio Dignitas': 'Marco' };
        const data = h.buildSaveData();
        t.uguale({ 'Curio Dignitas': 'Marco' }, data.stato.onlineOwners);
        stato.onlineOwners = {};
        t.ok(h.applySaveData(JSON.parse(JSON.stringify(data))));
        t.uguale({ 'Curio Dignitas': 'Marco' }, stato.onlineOwners);
        const vecchio = h.migrateSave({ version: 4, campaignId: 'tutorial', stato: { party: [], activeCurses: [] } });
        t.uguale(6, vecchio.version);
        t.uguale({}, vecchio.stato.onlineOwners);
    });

    t.test('trovaElementoRemoto: segue il percorso saltando SCRIPT e AUDIO', () => {
        const h = carica();
        const nodo = (tag, figli = []) => ({ tagName: tag, children: figli });
        const bersaglio = nodo('BUTTON');
        const root = nodo('DIV', [nodo('AUDIO'), nodo('DIV', [nodo('SPAN'), bersaglio])]);
        t.ok(h.trovaElementoRemoto(root, [0, 1]) === bersaglio);
        t.uguale(null, h.trovaElementoRemoto(root, [5]));
    });

    t.test('creazione a turno: tocca a chi sta creando, solo se il suo giocatore è collegato', () => {
        const h = carica();
        h.eval(`onlineState.attivo = true; onlineState.giocatori = [{ id: '1', name: 'Icaro', connected: true }, { id: '2', name: null, connected: true }];
            stato.party = []; stato.onlineOwners = {}; currentScreenId = 'screenParty'; onlineState.creando = null;`);
        t.uguale(null, h.onlineTurnoCreazione(), 'nessuno sta creando');
        h.eval(`onlineState.creando = 'Icaro';`);
        t.uguale('Icaro', h.onlineTurnoCreazione());
        t.uguale(['Icaro'], h.onlineAttesi());
        h.eval(`onlineState.creando = 'Astarte';`);
        t.uguale(null, h.onlineTurnoCreazione(), 'nessun giocatore con quel nome: decide il master');
        h.eval(`onlineState.creando = 'Icaro'; onlineState.giocatori[0].connected = false;`);
        t.uguale(null, h.onlineTurnoCreazione(), 'scollegato');
        h.eval(`onlineState.giocatori[0].connected = true; currentScreenId = 'screenMap';`);
        t.uguale(null, h.onlineTurnoCreazione());
    });

    t.test('voto: si chiude quando votano tutti, esegue l\'opzione vincente', () => {
        const h = carica();
        h.eval(`onlineState.attivo = true; onlineState.giocatori = [{ name: 'Marco', connected: true }, { name: 'Sara', connected: true }];
            globalThis.__scelto = null;
            onlineApriVoto({ tipo: 'prova', domanda: 'Dove?', opzioni: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], secondi: 30, esegui: id => { globalThis.__scelto = id; } });`);
        const id = h.eval('onlineState.voto.id');
        h.onlineVota('Marco', id, 'b');
        t.uguale(null, h.eval('globalThis.__scelto'), 'manca Sara');
        h.onlineVota('Sara', id, 'b');
        t.uguale('b', h.eval('globalThis.__scelto'));
        t.uguale(null, h.eval('onlineState.voto'));
    });


    t.test('master a distanza: non ha un eroe (fuori da squadra, voti e capo), ma può fare tutto', () => {
        const h = carica();
        h.eval(`onlineState.attivo = true; onlineState.giocatori = [{ name: 'Gianni', connected: true, ruolo: 'master' },
            { name: 'Marco', connected: true, ruolo: 'giocatore' }, { name: 'Pia', connected: true, ruolo: 'moderatore' }];
            stato.onlineOwners = {}; stato.party = [{ name: 'Marco' }]; currentScreenId = 'screenMap';`);
        t.uguale('Marco', h.eval('onlineGiocatoriCollegati()').join(','));
        t.uguale('Marco', h.onlineCapo(), 'il capo viene dalla compagnia');
        t.uguale('Gianni', h.onlineAttesi().join(','), 'sulla mappa tocca al master scegliere la strada');
        const prova = (chi, azione) => h.eval(`(() => { onlineState.attore = ${JSON.stringify(chi)}; const r = window.onlineGate(${JSON.stringify(azione)}, [3]); onlineState.attore = null; return r; })()`);
        h.eval('globalThis.onlineAvvisa = () => {}');
        t.ok(prova('Gianni', 'selectStsNode'), 'il master a distanza sceglie la strada');
        t.ok(prova('Gianni', 'gmSetEnemyHp'), 'e usa il Pannello di Controllo');
        t.ok(!prova('Marco', 'selectStsNode'), 'il giocatore no');
        t.ok(!prova('Pia', 'selectStsNode'), 'il moderatore no');
        t.ok(h.eval("ruoloSenzaEroe('master') && ruoloSenzaEroe('moderatore') && !ruoloSenzaEroe('giocatore')"));
    });

    t.test('master a distanza: decide un voto e fa partire chi non ha finito; un giocatore no', () => {
        const h = carica();
        h.eval(`onlineState.attivo = true; onlineState.giocatori = [{ name: 'Gianni', connected: true, ruolo: 'master' },
            { name: 'Marco', connected: true }, { name: 'Sara', connected: true }];
            globalThis.onlineAvvisa = () => {}; globalThis.__scelto = null; globalThis.__partito = 0; globalThis.advanceNode = () => { __partito++; };
            onlineApriVoto({ tipo: 'prova', domanda: 'Dove?', opzioni: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], secondi: 30, esegui: id => { globalThis.__scelto = id; } });`);
        const id = h.eval('onlineState.voto.id');
        h.onlineEseguiClic({ giocatore: 'Marco', azione: '__forza_voto', args: [id, 'b'] });
        t.uguale(null, h.eval('__scelto'), 'un giocatore non può forzare');
        h.onlineEseguiClic({ giocatore: 'Gianni', azione: '__forza_voto', args: [id, 'b'] });
        t.uguale('b', h.eval('__scelto'));
        h.onlinePronto('Marco', 'advanceNode', []);
        h.onlineEseguiClic({ giocatore: 'Gianni', azione: '__forza_pronti', args: [] });
        t.uguale(1, h.eval('__partito'), 'si parte anche senza Sara');
    });

    t.test('Ho finito: si parte quando l\'hanno premuto tutti i collegati', () => {
        const h = carica();
        h.eval(`onlineState.attivo = true; onlineState.giocatori = [{ name: 'Marco', connected: true }, { name: 'Sara', connected: true }, { name: 'Luca', connected: false }];
            globalThis.__partito = 0; globalThis.advanceNode = () => { __partito++; };`);
        h.onlinePronto('Marco', 'advanceNode', []);
        t.uguale(0, h.eval('__partito'));
        h.onlinePronto('Sara', 'advanceNode', []);
        t.uguale(1, h.eval('__partito'), 'Luca è disconnesso: non si aspetta');
        t.uguale(null, h.eval('onlineState.pronti'));
    });

    t.test('salvataggio automatico online: lo slot "online" si scrive e si rilegge', () => {
        const h = carica();
        h.eval(`onlineState.attivo = true; stato.currentCampaign = CAMPAIGNS.tutorial; stato.stsMapNodes = []; stato.party = [];
            stato.unlockedRelics = []; stato.activeCurses = []; stato.expeditionStats = newExpeditionStats(); stato.onlineOwners = { A: 'Marco' };`);
        h.onlineSalvaAutomatico();
        t.uguale({ A: 'Marco' }, h.readSave('online').stato.onlineOwners);
    });

    // ----- Revisione finale -----
    const conDue = h => h.eval(`onlineState.attivo = true; onlineState.giocatori = [{ name: 'Marco', connected: true }, { name: 'Sara', connected: true }];`);

    t.test('revisione #1: un giocatore non può chiamarsi come il master', () => {
        const h = carica();
        t.ok(!h.nomeGiocatoreValido('__master__'));
        t.ok(!h.nomeGiocatoreValido('__qualcosa'));
        t.ok(!h.nomeGiocatoreValido(''));
        t.ok(h.nomeGiocatoreValido('Marco'));
    });

    t.test('revisione #2: cambiando schermata un voto aperto si annulla senza eseguire', () => {
        const h = carica();
        conDue(h);
        h.eval(`globalThis.__n = 0; onlineApriVoto({ tipo: 'bersaglio', domanda: '?', opzioni: [{ id: 'a', label: 'A' }], esegui: () => { __n++; } });
            showScreen('screenLoot');`);
        t.uguale(null, h.eval('onlineState.voto'));
        t.uguale(0, h.eval('__n'));
    });

    t.test('revisione #2: un\'azione del master che risolve il voto lo annulla', () => {
        const h = carica();
        conDue(h);
        h.eval(`onlineApriVoto({ tipo: 'bersaglio', domanda: '?', opzioni: [{ id: 'a', label: 'A' }], esegui: () => {} });`);
        t.ok(h.eval(`window.onlineGate('executeMonsterAttack', [])`));
        t.uguale(null, h.eval('onlineState.voto'));
    });


    t.test('turno del nemico: il ritratto cliccato da un giocatore è il suo voto sul bersaglio', () => {
        const h = carica();
        conDue(h);
        h.eval(`stato.party = [{ name: 'Ottavio', hp: 4 }, { name: 'Caino', hp: 3 }, { name: 'Icaro', hp: 0 }];
            monsterTargetFree = true;
            onlineVotoSpeciale('bersaglio', 'executeMonsterAttack', ['Caino'], 'Marco');`);
        t.uguale('bersaglio', h.eval('onlineState.voto.tipo'));
        t.uguale('Ottavio,Caino', h.eval('onlineState.voto.opzioni.map(o => o.id).join()'));
        t.uguale('Caino', h.eval('onlineState.voto.voti.Marco'));
        // Bersaglio deciso dal nemico: il clic di un giocatore non apre voti
        h.eval(`onlineAnnullaVoto(); monsterTargetFree = false; onlineVotoSpeciale('bersaglio', 'executeMonsterAttack', ['Caino'], 'Sara');`);
        t.uguale(null, h.eval('onlineState.voto'));
    });

    t.test('revisione #3: un elemento nascosto non si può cliccare da remoto', () => {
        const h = carica();
        const el = (dentroNascosto, disabled = false) => ({ disabled, closest: sel => (dentroNascosto && /hidden/.test(sel)) ? {} : null });
        t.ok(h.elementoCliccabile(el(false)));
        t.ok(!h.elementoCliccabile(el(true)));
        t.ok(!h.elementoCliccabile(el(false, true)));
        t.ok(!h.elementoCliccabile(null));
    });

    t.test('revisione #4: la finestra aperta da un clic del master è solo sua', () => {
        const h = carica();
        conDue(h);
        h.eval(`window.onlineGate('openOptions', []); openModal('Prova', '<p>x</p>');`);
        t.uguale(h.eval('ONLINE_MASTER'), h.eval('onlineState.modalOwner'));
        t.ok(!h.onlineCanRun('__modal', [0], 'Marco', { modalOwner: h.eval('onlineState.modalOwner') }).ok);
    });

    t.test('revisione #5: la creazione non tocca a uno spettatore né a un giocatore scollegato', () => {
        const h = carica();
        h.eval(`onlineState.attivo = true; onlineState.giocatori = [{ id: '1', name: null, connected: true }, { id: '2', name: 'Marco', connected: false }];
            stato.party = []; stato.onlineOwners = {}; currentScreenId = 'screenParty'; onlineState.creando = 'Marco';`);
        t.uguale(null, h.onlineTurnoCreazione());
        t.uguale([], h.onlineAttesi());
    });

    t.test('revisione #6: senza giocatori collegati nessun voto e nessuna esecuzione automatica', () => {
        const h = carica();
        h.eval(`onlineState.attivo = true; onlineState.giocatori = [{ name: 'Marco', connected: false }]; globalThis.__n = 0;
            onlineApriVoto({ tipo: 'bersaglio', domanda: '?', opzioni: [{ id: 'a', label: 'A' }], esegui: () => { __n++; } });`);
        t.uguale(0, h.eval('__n'));
        t.uguale(null, h.eval('onlineState.voto'));
    });

    t.test('revisione #8: le animazioni (stile) non fanno ripartire l\'invio della schermata', () => {
        const h = carica();
        const o = h.eval('ONLINE_OSSERVA');
        t.ok(o.attributes && Array.isArray(o.attributeFilter));
        t.ok(!o.attributeFilter.includes('style'));
        t.ok(o.attributeFilter.includes('class'));
    });

    t.test('sovrimpressioni: solo gli elementi aggiunti al body dopo il caricamento (mai le schermate del gioco)', () => {
        const h = carica();
        const el = (tag, extra = {}) => ({ tagName: tag, id: '', classList: { contains: c => (extra.classi || []).includes(c) }, ...extra });
        const layout = el('DIV', { classi: ['game-layout'] }), barra = el('DIV', { id: 'partyTopBar' });
        const banner = el('DIV', { classi: ['event-banner'] }), script = el('SCRIPT'), nascosto = el('DIV', { classi: ['hidden'] });
        const masterBar = el('DIV', { id: 'onlineMasterBar' });
        const fuori = h.onlineSovrimpressioni([layout, barra, banner, script, nascosto, masterBar], new Set([layout, barra, script]));
        t.ok(fuori.length === 1 && fuori[0] === banner);
    });

    t.test('mappa dei giocatori: i nodi futuri non dicono cosa contengono (niente tipo), quelli passati e il boss sì', () => {
        const h = carica();
        t.uguale('sts-node node-ignoto available', h.classiNodoGiocatore('sts-node node-merchant available'));
        t.uguale('sts-node node-ignoto upcoming unreachable', h.classiNodoGiocatore('sts-node node-elite upcoming unreachable'));
        t.uguale('sts-node node-combat completed', h.classiNodoGiocatore('sts-node node-combat completed'), 'già fatto: resta');
        t.uguale(null, h.classiNodoGiocatore('sts-node node-combat upcoming node-goal'), 'il boss resta uguale');
        t.uguale(null, h.classiNodoGiocatore('sts-node node-elite upcoming', true), 'nodo vicino: resta uguale');
    });

    t.test('mappa dei giocatori: si vedono i nodi aperti e i loro successivi, fino a due passi', () => {
        const h = carica();
        const nodi = [
            { id: 1, done: true, next: [2, 3] },
            { id: 2, active: true, next: [4] },
            { id: 3, active: true, next: [5] },
            { id: 4, next: [6] }, { id: 5, next: [6] }, { id: 6, next: [] },
        ];
        t.uguale('2,3,4,5', [...h.nodiVisibiliGiocatori(nodi, 2)].sort().join(','));
        t.uguale('2,3', [...h.nodiVisibiliGiocatori(nodi, 1)].sort().join(','), 'un passo: solo quelli aperti');
    });

    t.test('rosaOnline: fasi e stati degli eroi', () => {
        const h = carica();
        t.uguale('attesa', h.rosaOnline('screenStart', ['A', 'B'], [], {}, null).fase);
        const r = h.rosaOnline('screenParty', ['A', 'B', 'C', 'D'], ['A'], { B: {} }, 'C');
        t.uguale('creazione', r.fase);
        t.uguale('creato,sospeso,in_creazione,da_creare', r.eroi.map(e => e.stato).join(','));
        t.uguale('C', r.creando);
        const p = h.rosaOnline('screenMap', ['A', 'B'], ['A', 'B'], {}, null);
        t.uguale('partita', p.fase);
        t.uguale('creato,creato', p.eroi.map(e => e.stato).join(','));
    });

    t.test('esitoSceltaEroe: eroe occupato, scollegato, creazione in corso', () => {
        const h = carica();
        const gioc = [{ id: '1', name: 'A', connected: true, ruolo: 'giocatore' }, { id: '2', name: 'B', connected: false, ruolo: 'giocatore' },
            { id: '3', name: null, connected: true, ruolo: 'giocatore' }];
        const chi = { id: '3', name: null, ruolo: 'giocatore' };
        const rosa = h.rosaOnline('screenMap', ['A', 'B', 'C', 'D'], ['A', 'B', 'C', 'D'], {}, null);
        t.uguale('A è già in gioco', h.esitoSceltaEroe('A', chi, gioc, rosa).motivo);
        const b = h.esitoSceltaEroe('B', chi, gioc, rosa);
        t.ok(b.ok && b.libera === '2', 'eroe di uno scollegato: si libera il suo posto');
        const cre = h.rosaOnline('screenParty', ['A', 'B', 'C', 'D'], [], {}, 'C');
        t.uguale('Sta creando: C', h.esitoSceltaEroe('D', chi, gioc, cre).motivo);
        t.ok(h.esitoSceltaEroe('C', chi, gioc, cre).ok, 'si può scegliere quello in creazione');
        t.uguale('Hai già un eroe', h.esitoSceltaEroe('D', { ...chi, name: 'A' }, gioc, rosa).motivo);
        t.ok(!h.esitoSceltaEroe('D', { ...chi, ruolo: 'moderatore' }, gioc, rosa).ok);
        const att = h.rosaOnline('screenStart', ['A'], [], {}, null);
        t.uguale('Eroe non disponibile', h.esitoSceltaEroe('A', chi, gioc, att).motivo);
        const libero = h.esitoSceltaEroe('D', chi, gioc, rosa);
        t.ok(libero.ok && libero.libera === null);
    });

    t.test('nomeModeratore e ownersIdentita', () => {
        const h = carica();
        t.uguale('Moderatore', h.nomeModeratore([]));
        t.uguale('Moderatore 2', h.nomeModeratore([{ name: 'Moderatore' }]));
        t.uguale('Moderatore 3', h.nomeModeratore([{ name: 'Moderatore' }, { name: 'Moderatore 2' }]));
        t.uguale('{"Icaro":"Icaro"}', JSON.stringify(h.ownersIdentita([{ name: 'Icaro' }])));
    });

    // ----- Lobby: si entra scegliendo un eroe (master) -----
    // Gioco online sulla creazione di Loch Ein parte 1 (6 eroi, il primo è Alastorta con le rune); onlinePost registrato in __post
    const lobby = () => {
        const h = carica();
        h.eval(`onlineState.attivo = true; stato.currentCampaign = CAMPAIGNS.loch_ein_parte_1;
            campaignHeroes = stato.currentCampaign.heroes; campaignAbilities = stato.currentCampaign.abilities || {};
            campaignArmory = stato.currentCampaign.initialArmory || [];
            stato.party = []; stato.onlineOwners = {}; currentScreenId = 'screenParty';
            globalThis.__post = []; globalThis.onlinePost = (url, body) => { __post.push({ url, body }); return Promise.resolve({}); };`);
        return { h, eroi: h.eval('campaignHeroes.map(e => e.name)') };
    };

    t.test('creazione chi prima arriva: la scelta fa partire la creazione, la seconda aspetta', () => {
        const { h, eroi: [, e1, e2] } = lobby();
        h.eval(`onlineState.giocatori = [{ id: '1', name: ${JSON.stringify(e1)}, connected: true }, { id: '2', name: ${JSON.stringify(e2)}, connected: true }];`);
        h.onlineSceltaEroe({ id: '1', eroe: e1 });
        t.uguale(e1, h.eval('onlineState.creando'));
        t.uguale(e1, h.eval('activeHeroForCreation.name'));
        t.uguale(e1, h.onlineTurnoCreazione());
        h.onlineSceltaEroe({ id: '2', eroe: e2 });
        const libera = h.eval(`__post.filter(p => p.url === '/api/online/libera')`);
        t.uguale(1, libera.length);
        t.uguale({ id: '2', motivo: `Sta creando: ${e1}` }, libera[0].body);
        t.uguale(e1, h.eval('activeHeroForCreation.name'), 'la creazione in corso non cambia');
        // La rosa va nello stato per i giocatori
        const stati = h.eval(`__post.filter(p => p.url === '/api/online/stato')`);
        const rosa = stati[stati.length - 1].body.rosa;
        t.uguale('creazione', rosa.fase);
        t.uguale(e1, rosa.creando);
        t.uguale('in_creazione', rosa.eroi.find(e => e.nome === e1).stato);
    });

    t.test('creazione sospesa: la bozza tiene le rune scelte e si riprende', () => {
        const { h, eroi: [alastorta] } = lobby();
        h.eval(`onlineState.giocatori = [{ id: '1', name: ${JSON.stringify(alastorta)}, connected: true }];`);
        h.onlineSceltaEroe({ id: '1', eroe: alastorta });
        t.uguale('scelta', h.eval('activeHeroForCreation.creationStep'));
        h.toggleCreationRune(h.eval('activeHeroForCreation.runeOptions[0]'));
        h.eval('onlineState.giocatori[0].connected = false');
        h.onlineStanzaCambiata();
        t.uguale(1, h.eval(`onlineState.bozze[${JSON.stringify(alastorta)}].equippedRunes.length`));
        t.uguale(null, h.eval('onlineState.creando'));
        t.uguale(null, h.eval('activeHeroForCreation'));
        t.uguale('sospeso', h.onlineRosa().eroi.find(e => e.nome === alastorta).stato);
        h.eval('onlineState.giocatori[0].connected = true');
        h.onlineSceltaEroe({ id: '1', eroe: alastorta });
        t.uguale(1, h.eval('activeHeroForCreation.equippedRunes.length'));
        t.uguale('scelta', h.eval('activeHeroForCreation.creationStep'));
        t.uguale(alastorta, h.eval('onlineState.creando'));
        t.uguale([], h.eval('Object.keys(onlineState.bozze)'));
    });

    t.test('creazione sospesa: il giocatore che rientra con il suo token la riprende da solo', () => {
        const { h, eroi: [alastorta] } = lobby();
        h.eval(`onlineState.giocatori = [{ id: '1', name: ${JSON.stringify(alastorta)}, connected: true }];`);
        h.onlineSceltaEroe({ id: '1', eroe: alastorta });
        h.eval('onlineState.giocatori[0].connected = false');
        h.onlineStanzaCambiata();
        t.uguale(null, h.eval('onlineState.creando'));
        h.eval('onlineState.giocatori[0].connected = true');
        h.onlineStanzaCambiata();
        t.uguale(alastorta, h.eval('onlineState.creando'));
        t.uguale(alastorta, h.onlineTurnoCreazione());
    });

    t.test('creazione sospesa: chi rientra mentre un altro crea la riprende quando l\'altro ha finito', () => {
        const { h, eroi: [alastorta, e1] } = lobby();
        h.eval(`onlineState.giocatori = [{ id: '1', name: ${JSON.stringify(alastorta)}, connected: true }, { id: '2', name: ${JSON.stringify(e1)}, connected: true }];`);
        h.onlineSceltaEroe({ id: '1', eroe: alastorta });
        h.eval('onlineState.giocatori[0].connected = false');
        h.onlineStanzaCambiata();
        h.onlineSceltaEroe({ id: '2', eroe: e1 });
        t.uguale(e1, h.eval('onlineState.creando'));
        h.eval('onlineState.giocatori[0].connected = true');
        h.onlineStanzaCambiata();
        t.uguale(e1, h.eval('onlineState.creando'), 'la creazione in corso non si tocca');
        h.selectAbility(0);
        h.nextHero();
        t.uguale(alastorta, h.eval('onlineState.creando'), 'finita la creazione dell\'altro, riprende la sua');
        t.uguale(alastorta, h.eval('activeHeroForCreation.name'));
    });

    t.test('creazione del master: non si sospende; la bozza la riprende anche il master', () => {
        const { h, eroi: [alastorta, e1] } = lobby();
        h.eval(`onlineState.giocatori = [];`);
        h.selectHeroCard(e1);
        t.uguale(e1, h.eval('onlineState.creando'));
        h.onlineStanzaCambiata();
        t.uguale(e1, h.eval('onlineState.creando'), 'nessun giocatore con quel nome: la creazione resta');
        h.eval(`onlineState.creando = null; onlineState.bozze[${JSON.stringify(alastorta)}] = { name: ${JSON.stringify(alastorta)}, creationStep: 'armeria', items: [] };`);
        h.onlineRiprendiBozza(alastorta);
        t.uguale(alastorta, h.eval('onlineState.creando'));
        t.uguale('armeria', h.eval('activeHeroForCreation.creationStep'));
    });

    t.test('owners: identità dopo nextHero e dopo un salvataggio vecchio', () => {
        const { h, eroi: [, e1] } = lobby();
        h.eval(`onlineState.giocatori = [{ id: '1', name: ${JSON.stringify(e1)}, connected: true }];`);
        h.onlineSceltaEroe({ id: '1', eroe: e1 });
        h.selectAbility(0);
        t.uguale('armeria', h.eval('activeHeroForCreation.creationStep'));
        h.nextHero();
        t.uguale({ [e1]: e1 }, h.eval('stato.onlineOwners'));
        t.uguale(null, h.eval('onlineState.creando'));
        t.ok(!('creationStep' in h.eval('stato.party[0]')), 'il passo della creazione non resta sull\'eroe');
        h.eval(`stato.stsMapNodes = []; stato.party = [{ name: ${JSON.stringify(e1)}, hp: 4, maxHp: 4, items: [] }];
            stato.unlockedRelics = []; stato.activeCurses = []; stato.expeditionStats = newExpeditionStats();
            stato.onlineOwners = { ${JSON.stringify(e1)}: 'Marco' }; writeSave('online', buildSaveData()); stato.onlineOwners = {}; stato.party = [];`);
        h.onlineRiprendi();
        t.uguale({ [e1]: e1 }, h.eval('stato.onlineOwners'));
    });

    // Revisione finale #1: un capitolo nuovo (o la stessa campagna riprovata) nella stessa stanza libera i nomi vecchi
    const liberati = h => h.eval(`__post.filter(p => p.url === '/api/online/libera').map(p => p.body)`);
    const stanzaConNomi = (h, nomi) => h.eval(`onlineState.giocatori = [
        ${nomi.map((n, i) => `{ id: '${i + 1}', name: ${JSON.stringify(n)}, connected: true, ruolo: 'giocatore' }`).join(', ')},
        { id: 's', name: null, connected: true, ruolo: 'giocatore' }, { id: 'm', name: 'Master', connected: true, ruolo: 'master' },
        { id: 'g', name: 'Moderatore', connected: true, ruolo: 'moderatore' }];`);
    const MOTIVO_CAPITOLO = 'Nuovo capitolo: scegli il tuo eroe';

    t.test('revisione finale #1: una nuova creazione della compagnia libera i nomi dei giocatori (riprova o capitolo nuovo)', () => {
        const { h, eroi: [a, b] } = lobby();
        stanzaConNomi(h, [a, b, 'Vecchio Eroe']);
        h.eval("globalThis.__err2 = []; uiMessage = (t, k) => { if (k === 'error') __err2.push(t); };");
        h.onlineStanzaCambiata();  // il master conosce i giocatori collegati con il loro eroe
        h.startPartyCreation();
        t.uguale([{ id: '1', motivo: MOTIVO_CAPITOLO }, { id: '2', motivo: MOTIVO_CAPITOLO }, { id: '3', motivo: MOTIVO_CAPITOLO }], liberati(h));
        t.uguale([null, null, null, null, 'Master', 'Moderatore'], h.eval('onlineState.giocatori.map(g => g.name)'), 'la stanza locale è già aggiornata');
        t.uguale('da_creare', h.onlineRosa().eroi.find(e => e.nome === a).stato);
        // Non è una disconnessione: niente "si è disconnesso" al master
        h.onlineStanzaCambiata();
        t.uguale([], h.eval('__err2'), 'nessun avviso di disconnessione per i nomi liberati');
    });

    t.test('revisione finale #1: azzerando la partita online si liberano i nomi; offline nessuna chiamata', () => {
        const { h, eroi: [a] } = lobby();
        stanzaConNomi(h, [a]);
        h.azzeraPartita();
        t.uguale([{ id: '1', motivo: MOTIVO_CAPITOLO }], liberati(h));
        t.uguale(null, h.eval('onlineState.giocatori[0].name'));
        h.eval(`onlineState.attivo = false; __post.length = 0; onlineState.giocatori[0].name = ${JSON.stringify(a)};`);
        h.azzeraPartita();
        t.uguale([], liberati(h), 'fuori dalla partita online niente libera');
    });

    t.test('revisione finale #1: riprendendo una partita si liberano solo i nomi che non sono nella compagnia', () => {
        const { h, eroi: [a, b] } = lobby();
        h.eval(`stato.stsMapNodes = []; stato.party = [{ name: ${JSON.stringify(a)}, hp: 4, maxHp: 4, items: [] }];
            stato.unlockedRelics = []; stato.activeCurses = []; stato.expeditionStats = newExpeditionStats();
            writeSave('online', buildSaveData()); stato.party = [];`);
        stanzaConNomi(h, [a, b]);
        h.onlineRiprendi();
        const l = liberati(h);
        t.uguale(1, l.length);
        t.uguale('2', l[0].id);
        t.uguale([a, null], h.eval('onlineState.giocatori.slice(0, 2).map(g => g.name)'));
    });

    t.test('revisione finale #5: il master a distanza che preme "Riprendi" mentre un altro crea riceve l\'avviso', () => {
        const { h, eroi: [a, b] } = lobby();
        h.eval(`onlineState.creando = ${JSON.stringify(b)}; onlineState.bozze[${JSON.stringify(a)}] = { name: ${JSON.stringify(a)}, items: [] };
            onlineState.attore = 'Master';`);
        h.onlineRiprendiBozza(a);
        const avvisi = h.eval(`__post.filter(p => p.url === '/api/online/avviso').map(p => p.body)`);
        t.uguale([{ giocatore: 'Master', testo: `Sta creando: ${b}` }], avvisi);
        t.ok(h.eval(`${JSON.stringify(a)} in onlineState.bozze`), 'la bozza resta in sospeso');
    });

    t.test('revisione finale #3: un eroe in sospeso non si sceglie mentre un altro crea', () => {
        const h = carica();
        const chi = { id: '3', name: null, ruolo: 'giocatore' };
        const gioc = [{ id: '2', name: 'B', connected: false, ruolo: 'giocatore' }, { id: '3', name: null, connected: true, ruolo: 'giocatore' }];
        const rosa = h.rosaOnline('screenParty', ['A', 'B', 'C'], [], { B: {} }, 'C');
        const e = h.esitoSceltaEroe('B', chi, gioc, rosa);
        t.uguale('Sta creando: C', e.motivo, 'il token del vecchio giocatore resta valido');
        t.ok(!e.ok);
        const libera = h.esitoSceltaEroe('B', chi, gioc, h.rosaOnline('screenParty', ['A', 'B', 'C'], [], { B: {} }, null));
        t.ok(libera.ok && libera.libera === '2', 'senza creazioni in corso la bozza si prende');
    });

    t.test('spettatori: niente voti, niente clic, niente capo', () => {
        const h = carica();
        h.eval(`onlineState.attivo = true; onlineState.giocatori = [{ id: '1', name: null, connected: true }, { id: '2', name: 'Icaro', connected: true }];
            stato.party = [{ name: 'Icaro' }]; globalThis.onlinePost = () => Promise.resolve({});`);
        t.uguale(['Icaro'], h.eval('onlineGiocatoriCollegati()'));
        t.uguale('Icaro', h.onlineCapo());
        h.eval(`onlineApriVoto({ tipo: 'prova', domanda: '?', opzioni: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], secondi: 30, esegui: () => {} });`);
        const id = h.eval('onlineState.voto.id');
        h.onlineEseguiClic({ giocatore: null, azione: '__vota', args: [id, 'a'] });
        t.uguale({}, h.eval('onlineState.voto.voti'));
    });
};
