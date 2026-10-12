// Prove con più strade (sfida.strade, js/prove.js): ogni approccio ha statistica, CD, testi, premio e punizione
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const eroe = (name, extra = {}) => ({ name, hp: 4, maxHp: 4, str: 1, int: 1, fth: 1, dmg: 1, items: [], ...extra });
    const sfidaGrezza = {
        title: 'Il ponte crollato', stat: 'str', cd: 9, desc: 'x', successText: 'Passate.', failText: 'Cadete.', ignoreText: 'x',
        reward: 'frammento_di_yr_drazul', punishment: 'rancore_del_mercante',
        strade: [
            { testo: 'Saltate', stat: 'str', cd: 9 },
            { testo: 'Studiate le pietre', stat: 'int', cd: 6, successText: 'Trovate un passaggio.', reward: 'mappa_della_regione' },
            { testo: 'Pregate', stat: 'fth', cd: 7, punishment: 'sacrilego' }
        ]
    };
    const prepara = () => {
        stato.party = [eroe('A', { int: 4 }), eroe('B', { str: 2 })];
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = 0;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.stsMapNodes = [{ id: 1, level: 0, type: 'challenge', next: [2] }, { id: 2, level: 1, type: 'combat', next: [] }];
        stato.currentNodeId = 1;
        return g.resolveCampaign({ id: 'prova', challenges: { ponte: sfidaGrezza } }).challenges.ponte;
    };

    t.test('la libreria risolve premio e punizione anche dentro le strade', () => {
        const sfida = prepara();
        t.uguale('mappa_della_regione', sfida.strade[1].reward.id);
        t.uguale('sacrilego', sfida.strade[2].punishment.id);
    });

    t.test('challengeWithRoad: statistica, CD e testi della strada; quello che manca resta della sfida', () => {
        const sfida = prepara();
        const s = g.challengeWithRoad(sfida, 1);
        t.uguale(['int', 6, 'Trovate un passaggio.', 'Cadete.'], [s.stat, s.cd, s.successText, s.failText]);
        t.uguale('mappa_della_regione', s.reward.id);
        t.uguale('rancore_del_mercante', s.punishment.id, 'punizione della sfida');
        t.uguale('str', sfida.stat, 'la sfida originale non cambia');
    });

    t.test('la strada scelta decide la prova: Studiate le pietre con l\'Intelligenza di A', () => {
        const sfida = prepara();
        const s = g.challengeWithRoad(sfida, 1);
        stato.challengeState = s;
        const res = g.resolveChallenge(stato.party[0], s, [3]);
        t.ok(res.success, '3 + 4 Intelligenza = 7 contro CD 6');
        t.ok(g.hasRelic('mappa_della_regione'), 'premio della strada');
    });

    t.test('simulatore: sceglie la strada con la migliore probabilità', () => {
        const sfida = prepara();
        t.uguale(1, g.bestChallengeRoad(sfida).i, 'Intelligenza 4 contro CD 6');
    });
};
