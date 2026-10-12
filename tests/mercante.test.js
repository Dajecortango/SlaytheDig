// Mercante: prezzi, contrattazione, sconto delle passive, rinnovo della merce
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const eroe = (extra = {}) => ({ name: 'A', hp: 4, maxHp: 4, items: [], ...extra });

    // Inganno del drago verde: effetto speciale "mercante → sconto_percento 20" dell'abilità scelta
    const drago = (extra = {}) => eroe({ chosenAbility: { id: 'inganno_drago_verde', name: 'Inganno del drago verde' }, ...extra });

    t.test('Inganno del drago verde: -20% sui prezzi finché l\'eroe è vivo', () => {
        stato.unlockedRelics = []; stato.activeCurses = [];
        const a = drago();
        stato.party = [a, eroe({ name: 'B' })];
        t.uguale(0.8, g.specialPriceFactor());
        a.hp = 0;
        t.uguale(1, g.specialPriceFactor(), 'eroe morto: niente sconto');
    });

    t.test('due eroi con lo stesso sconto non si sommano; la Moneta di Fredlös sì (si moltiplicano)', () => {
        stato.activeCurses = [];
        stato.party = [drago(), drago({ name: 'B' })];
        stato.unlockedRelics = [];
        t.uguale(0.8, g.specialPriceFactor());
        stato.unlockedRelics = [{ id: 'moneta_di_fredlos' }];
        t.uguale(0.4, Math.round(g.specialPriceFactor() * 100) / 100);
        stato.unlockedRelics = [];
    });

    t.test('la contrattazione vale sul prezzo già scontato; il costo di "Rinnova la merce" non cambia', () => {
        stato.party = [drago()];
        g.eval("merchantHaggle = 'ok'");
        t.uguale(7, g.merchantPrice(10), '10 -25% = 7,5 → 7');
        g.eval('merchantHaggle = null');
        t.uguale(10, g.merchantPrice(10));
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
