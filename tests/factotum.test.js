// Passiva Factotum: Forza -> Intelligenza -> Fede -> Forza, ogni 2 punti guadagnati oltre a quelli iniziali
module.exports = (t, carica) => {
    const g = carica();
    const prepara = () => {
        g.eval("campaignHeroes = [{ name: 'F', str: 3, int: 2, fth: 1 }]");
        const f = { name: 'F', str: 3, int: 2, fth: 1, dmg: 1, hp: 4, maxHp: 4, base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, items: [] };
        g.applyEffects(g.LIBRERIA.abilita.factotum.effects, f);
        g.eval('stato').party = [f];
        return f;
    };
    const oggetto = stats => ({ id: 'prova', name: 'Prova', ...stats });
    const togli = (f, o) => { g.revertItemEffects(o, f); f.items.splice(f.items.indexOf(o), 1); g.refreshScaledBonuses(f); };

    t.test('senza punti guadagnati non cambia niente', () => {
        const f = prepara();
        g.refreshScaledBonuses(f);
        t.uguale([3, 2, 1], [f.str, f.int, f.fth]);
    });

    t.test('+1 Forza non basta, +2 Forza dà +1 Intelligenza; togliendo l\'oggetto il bonus sparisce', () => {
        const f = prepara();
        const uno = oggetto({ str: 1 });
        f.items.push(uno); g.applyItemEffects(uno, f);
        t.uguale([4, 2, 1], [f.str, f.int, f.fth], 'con +1 niente');
        togli(f, uno);
        const due = oggetto({ str: 2 });
        f.items.push(due); g.applyItemEffects(due, f);
        t.uguale([5, 3, 1], [f.str, f.int, f.fth]);
        togli(f, due);
        t.uguale([3, 2, 1], [f.str, f.int, f.fth]);
    });

    t.test('i punti dati da Factotum non alimentano le altre conversioni (niente catena)', () => {
        const f = prepara();
        const o = oggetto({ str: 8 });   // +4 Int da Factotum: NON deve dare +2 Fede
        f.items.push(o); g.applyItemEffects(o, f);
        for (let i = 0; i < 5; i++) g.refreshScaledBonuses(f);  // ricalcoli ripetuti: valori stabili
        t.uguale([11, 6, 1], [f.str, f.int, f.fth]);
    });

    t.test('le tre conversioni insieme: +2 a ogni statistica dà +1 a ognuna', () => {
        const f = prepara();
        const o = oggetto({ str: 2, int: 2, fth: 2 });
        f.items.push(o); g.applyItemEffects(o, f);
        t.uguale([6, 5, 4], [f.str, f.int, f.fth]);
    });

    t.test('statistiche sotto quelle iniziali (maledizioni) non danno bonus negativi', () => {
        const f = prepara();
        f.int -= 2; g.refreshScaledBonuses(f);
        t.uguale([3, 0, 1], [f.str, f.int, f.fth]);
    });

    t.test('il valore del segnale decide ogni quanti punti (3 = ogni 3)', () => {
        const f = prepara();
        f.factotum = 3;
        const o = oggetto({ str: 2 });
        f.items.push(o); g.applyItemEffects(o, f);
        t.uguale([5, 2, 1], [f.str, f.int, f.fth], 'con 3 servono 3 punti');
    });
};
