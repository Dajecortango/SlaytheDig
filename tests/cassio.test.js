// Pozioni di Cassio (combat.instabile): d6 alchemico all'uso, 1 = fallimento, 2-5 = normale, 6 = capolavoro;
// Tintura ed Elisir vanno all'eroe scelto (bersaglio "scelto", hero.potionTarget)
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const A = g.LIBRERIA.abilita;
    const eroe = (name, extra = {}) => ({ name, hp: 4, maxHp: 4, str: 2, int: 4, fth: 1, dmg: 1, items: [], base_armor: 0, current_armor: 0,
        att_bonus: 0, def_bonus: 0, help_bonus_val: 0, att_penalty: 0, ...extra });
    const prepara = party => {
        stato.party = party;
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = 0;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.stsMapNodes = [{ id: 1, level: 0, type: 'combat', next: [2] }, { id: 2, level: 1, type: 'combat', next: [] }];
        stato.currentNodeId = 1;
        stato.helpBonus = 0; stato.helpDmgBonus = 0; stato.combatRound = 1;
        stato.activeEnemy = { name: 'Lupo', hp: 10, maxHp: 10, ca: 6, att: 5, dmg: 1 };
        return stato.activeEnemy;
    };
    const usa = (abil, roll, target, extra = {}) => {
        const c = eroe('Cassio', { chosenAbility: A[abil], ...extra });
        const b = eroe('Curio', { str: 4 });
        const n = prepara([c, b]);
        if (target) c.potionTarget = target === 'Curio' ? 'Curio' : 'Cassio';
        const r = g.resolveAbility(c, n, [roll]);
        return { c, b, n, r };
    };

    t.test('esito del dado alchemico', () => {
        t.uguale(['fallimento', 'normale', 'normale', 'normale', 'normale', 'capolavoro'], [1, 2, 3, 4, 5, 6].map(g.alchemyOutcome));
    });

    t.test('tre pozioni: senza tiro per colpire, una volta per scontro', () => {
        ['cassio_fiala_flammaurea', 'cassio_tintura_corteccia', 'cassio_elisir_toro'].forEach(id => {
            const c = eroe('Cassio', { chosenAbility: A[id] }); prepara([c]);
            t.ok(g.abilityIsInstant(c), id);
            g.resolveAbility(c, stato.activeEnemy, [3]);
            t.ok(!g.abilityUsable(c).ok, `${id}: già usata`);
        });
        t.ok(!g.abilityNeedsTarget(A.cassio_fiala_flammaurea));
        t.ok(g.abilityNeedsTarget(A.cassio_tintura_corteccia) && g.abilityNeedsTarget(A.cassio_elisir_toro));
    });

    t.test('Fiala: 2 danni, 3 con il 6, con l\'1 Cassio perde 1 HP (mai sotto 1) e il nemico niente', () => {
        let x = usa('cassio_fiala_flammaurea', 4);
        t.uguale(8, x.n.hp); t.uguale('normale', x.r.alchemy.esito); t.uguale(2, x.r.dmg);
        x = usa('cassio_fiala_flammaurea', 6);
        t.uguale(7, x.n.hp);
        x = usa('cassio_fiala_flammaurea', 1);
        t.uguale(10, x.n.hp); t.uguale(3, x.c.hp);
        x = usa('cassio_fiala_flammaurea', 1, null, { hp: 1 });
        t.uguale(1, x.c.hp, 'a 1 HP non muore per la sua fiala');
    });

    t.test('Tintura: armatura all\'eroe scelto; con l\'1 il nemico prende +1 CA', () => {
        let x = usa('cassio_tintura_corteccia', 3, 'Curio');
        t.uguale(2, x.b.current_armor); t.uguale(0, x.c.current_armor); t.uguale('Curio', x.r.alchemy.target);
        x = usa('cassio_tintura_corteccia', 6, 'Cassio');
        t.uguale(3, x.c.current_armor);
        x = usa('cassio_tintura_corteccia', 1, 'Curio');
        t.uguale(0, x.b.current_armor); t.uguale(7, x.n.ca);
    });

    t.test('Elisir: +1 Forza e +1 Danno per 2 round, fino a fine scontro con il 6, −1 Forza con l\'1', () => {
        let x = usa('cassio_elisir_toro', 2, 'Curio');
        t.uguale(5, x.b.str); t.uguale(2, x.b.dmg); t.uguale(2, x.c.str, 'non a Cassio');
        stato.combatRound = 3; g.expireTempBuffs();
        t.uguale(4, x.b.str, 'finito dopo 2 round'); t.uguale(1, x.b.dmg);
        x = usa('cassio_elisir_toro', 6, 'Curio');
        stato.combatRound = 9; g.expireTempBuffs();
        t.uguale(5, x.b.str, 'capolavoro: dura tutto lo scontro');
        g.expireTempBuffs(true);
        t.uguale(4, x.b.str);
        x = usa('cassio_elisir_toro', 1, 'Curio');
        t.uguale(3, x.b.str, 'fallimento: −1 Forza');
        stato.combatRound = 3; g.expireTempBuffs();
        t.uguale(4, x.b.str);
    });

    t.test('Lista dei torti: la Tintura non dà armatura a Pancrazio', () => {
        const c = eroe('Cassio', { chosenAbility: A.cassio_tintura_corteccia });
        const p = eroe('Pancrazio', { noArmor: 1 });
        const n = prepara([c, p]);
        c.potionTarget = 'Pancrazio';
        g.resolveAbility(c, n, [4]);
        t.uguale(0, p.current_armor);
    });

    t.test('simulatore: armatura a chi è più esposto, Elisir a chi colpisce più forte', () => {
        const c = eroe('Cassio', { chosenAbility: A.cassio_tintura_corteccia });
        const b = eroe('Curio', { str: 4, hp: 2 });
        prepara([c, b]);
        t.uguale('Curio', g.simPotionTarget(c));
        c.chosenAbility = A.cassio_elisir_toro;
        t.uguale('Curio', g.simPotionTarget(c));
    });
};
