// Cure: pozioni che rialzano i caduti, bottino solo agli eroi vivi
module.exports = (t, carica) => {
    const g = carica();
    const lib = g.LIBRERIA;

    const prepara = () => {
        const stato = g.eval('stato');
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = 0;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        return stato;
    };

    t.test('pozioni di cura rare o migliori rialzano un eroe caduto, quelle comuni no', () => {
        const stato = prepara();
        const caduto = () => ({ name: 'C', hp: 0, maxHp: 4, items: [] });
        const conPozione = id => ({ name: 'P', hp: 3, maxHp: 4, items: [JSON.parse(JSON.stringify(lib.armeria[id]))] });

        let a = conPozione('pozione'), b = caduto();   // raro, cura 4 HP
        stato.party = [a, b];
        t.ok(g.useConsumable('P', 0, 'C'), 'pozione rara usata sul caduto');
        t.uguale(4, b.hp);

        a = conPozione('balsamo_curativo'); b = caduto();   // comune
        stato.party = [a, b];
        t.ok(!g.useConsumable('P', 0, 'C'), 'balsamo comune rifiutato');
        t.uguale(0, b.hp);
        t.uguale(1, a.items.length, 'il balsamo resta nello zaino');
    });

    t.test('Pozione di Rigenerazione: +1 HP a inizio di ogni round, finisce con lo scontro', () => {
        const stato = prepara();
        const a = { name: 'A', hp: 1, maxHp: 4, items: [JSON.parse(JSON.stringify(lib.armeria.pozione_rigenerazione))] };
        stato.party = [a, { name: 'B', hp: 2, maxHp: 4, items: [] }];
        stato.combatRound = 1;
        t.ok(g.eval('isCombatConsumable')(a.items[0]), 'solo in combattimento');
        g.applyTempBuff(a, a.items[0]);
        g.applyRegen(); g.applyRegen();
        t.uguale(3, a.hp);
        t.uguale(2, stato.party[1].hp, 'solo chi l\'ha bevuta');
        g.expireTempBuffs(true);
        g.applyRegen();
        t.uguale(3, a.hp, 'finito lo scontro non rigenera più');
    });

    t.test('il bottino si assegna solo agli eroi vivi', () => {
        const stato = prepara();
        stato.party = [{ name: 'Vivo', hp: 2, maxHp: 4, items: [] }, { name: 'Caduto', hp: 0, maxHp: 4, items: [] }];
        const html = g.heroOptionsForItem(lib.armeria.balsamo_curativo);
        t.ok(html.includes('Vivo') && !html.includes('Caduto'));
    });
};
