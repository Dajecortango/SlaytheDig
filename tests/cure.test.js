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

        let a = conPozione('pozione'), b = caduto();   // raro, cura tutto
        stato.party = [a, b];
        t.ok(g.useConsumable('P', 0, 'C'), 'pozione rara usata sul caduto');
        t.uguale(4, b.hp);

        a = conPozione('balsamo_curativo'); b = caduto();   // comune
        stato.party = [a, b];
        t.ok(!g.useConsumable('P', 0, 'C'), 'balsamo comune rifiutato');
        t.uguale(0, b.hp);
        t.uguale(1, a.items.length, 'il balsamo resta nello zaino');
    });

    t.test('il bottino si assegna solo agli eroi vivi', () => {
        const stato = prepara();
        stato.party = [{ name: 'Vivo', hp: 2, maxHp: 4, items: [] }, { name: 'Caduto', hp: 0, maxHp: 4, items: [] }];
        const html = g.heroOptionsForItem(lib.armeria.balsamo_curativo);
        t.ok(html.includes('Vivo') && !html.includes('Caduto'));
    });
};
