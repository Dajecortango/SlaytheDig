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
        t.ok(g.onlineCanRun('confirmCombatHeroChoice', [], 'Sara', base({ selects: { combatHeroSelect: 'Astarte' } })).ok);
        t.ok(!g.onlineCanRun('confirmCombatHeroChoice', [], 'Sara', base({ selects: { combatHeroSelect: 'Icaro' } })).ok, 'menu con l\'eroe di un altro');
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

    t.test('mappa: il clic di un giocatore è un voto; showScreen solo per vittoria e sconfitta', () => {
        t.uguale('mappa', g.onlineCanRun('selectStsNode', [3], 'Marco', base({ screen: 'screenMap' })).voto);
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

    t.test('nextCaptain: un capo diverso a ogni livello, salta i disconnessi', () => {
        const gi = [{ name: 'Marco', connected: true }, { name: 'Sara', connected: false }, { name: 'Luca', connected: true }];
        t.uguale('Marco', g.nextCaptain(gi, 0));
        t.uguale('Luca', g.nextCaptain(gi, 1));
        t.uguale('Marco', g.nextCaptain(gi, 2));
        t.uguale(null, g.nextCaptain([], 0));
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
        t.uguale(5, vecchio.version);
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

    t.test('creazione a turno: tocca al giocatore successivo, l\'eroe diventa suo', () => {
        const h = carica();
        h.eval(`onlineState.attivo = true; onlineState.giocatori = [{ name: 'Marco', connected: true }, { name: 'Sara', connected: true }];
            stato.party = []; stato.onlineOwners = {}; currentScreenId = 'screenParty';`);
        t.uguale('Marco', h.onlineTurnoCreazione());
        h.eval(`stato.party.push({ name: 'Icaro' }); stato.onlineOwners.Icaro = 'Marco';`);
        t.uguale('Sara', h.onlineTurnoCreazione());
        h.eval(`currentScreenId = 'screenMap';`);
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

    t.test('voto della prova: "Lascia perdere" chiude la prova, un eroe la affronta', () => {
        const h = carica();
        h.eval(`onlineState.attivo = true; onlineState.giocatori = [{ name: 'Marco', connected: true }];
            stato.party = [{ name: 'Icaro', hp: 3, maxHp: 4 }, { name: 'Astarte', hp: 0, maxHp: 4 }];
            globalThis.__fatto = []; challengeChoose = a => __fatto.push('scelta:' + a); confirmChallengeHero = () => __fatto.push('eroe');
            isFinalNode = () => false; onlineApriVotoProva();`);
        const op = h.eval('onlineState.voto.opzioni.map(o => o.id)');
        t.uguale(['Icaro', '__lascia'], op, 'solo gli eroi in piedi, più Lascia perdere');
        h.onlineVota('Marco', h.eval('onlineState.voto.id'), 'Icaro');
        t.uguale(['scelta:true', 'eroe'], h.eval('__fatto'));
    });
};
