// Mercante: prezzi, contrattazione, sconto delle passive, rinnovo della merce
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const eroe = (extra = {}) => ({ name: 'A', hp: 4, maxHp: 4, items: [], ...extra });

    t.test('Inganno del drago verde: -20% sui prezzi finché l\'eroe è vivo', () => {
        const a = eroe();
        g.applyEffects(g.LIBRERIA.abilita.inganno_drago_verde.effects, a);
        stato.party = [a, eroe({ name: 'B' })];
        g.eval('merchantHaggle = null');
        t.uguale(8, g.merchantPrice(10));
        t.uguale(1, g.merchantPrice(1), 'mai sotto 1 moneta');
        a.hp = 0;
        t.uguale(10, g.merchantPrice(10), 'eroe morto: niente sconto');
    });

    t.test('lo sconto si somma alla contrattazione riuscita, ma due eroi con lo sconto non si sommano', () => {
        stato.party = [eroe({ merchantDiscount: 0.2 }), eroe({ name: 'B', merchantDiscount: 0.2 })];
        g.eval("merchantHaggle = 'ok'");
        t.uguale(6, g.merchantPrice(10), '10 -25% = 7, poi -20% = 5,6 → 6');
        g.eval('merchantHaggle = null');
        t.uguale(8, g.merchantPrice(10));
    });

    t.test('il costo di "Rinnova la merce" non cambia con lo sconto', () => {
        stato.party = [eroe({ merchantDiscount: 0.2 })];
        t.uguale(5, g.eval('MERCHANT_REROLL_COST'));
    });

    t.test("La mano è più veloce dell'occhio: il primo oggetto è gratis, il secondo no, il medico si paga", () => {
        const ladro = eroe({ name: 'L' });
        g.applyEffects(g.LIBRERIA.abilita.mano_veloce.effects, ladro);
        stato.party = [ladro];
        g.eval('merchantStolen = false');
        const oggetto = { kind: 'item', price: 12 }, medico = { kind: 'medic', price: 7 };
        t.uguale(0, g.effectiveMerchantPrice(oggetto));
        t.uguale(7, g.effectiveMerchantPrice(medico), 'il medico non si ruba');
        g.eval('merchantStolen = true');
        t.uguale(12, g.effectiveMerchantPrice(oggetto), 'dopo il furto si paga');
        g.eval('merchantStolen = false');
        ladro.hp = 0;
        t.uguale(12, g.effectiveMerchantPrice(oggetto), 'ladro morto: niente furto');
    });
};
