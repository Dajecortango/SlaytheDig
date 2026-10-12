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
};
