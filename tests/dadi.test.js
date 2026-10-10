// Sacchetto dei dadi degli eroi (DICE_BAG in js/regole.js, rollD6 / peekHeroDice in js/combattimento.js)
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const bag = g.eval('DICE_BAG');

    const conta = (valori, v) => valori.filter(x => x === v).length;

    t.test('DICE_BAG: numeri coerenti (1 e 6 entrano nel sacchetto)', () => {
        t.ok(bag.size === 0 || bag.ones + bag.sixes <= bag.size, 'troppi 1 e 6 per la grandezza del sacchetto');
    });

    t.test('ogni blocco del sacchetto ha esattamente i suoi 1 e 6, gli altri tra 2 e 5', () => {
        if (!bag.size) return;
        const eroe = { name: 'Icaro' };
        const tiri = Array.from({ length: bag.size * 50 }, () => g.rollD6(null, 0, eroe));
        for (let i = 0; i < tiri.length; i += bag.size) {
            const blocco = tiri.slice(i, i + bag.size);
            t.uguale(bag.ones, conta(blocco, 1), `1 nel blocco ${i / bag.size}`);
            t.uguale(bag.sixes, conta(blocco, 6), `6 nel blocco ${i / bag.size}`);
        }
        t.ok(tiri.every(v => v >= 1 && v <= 6), 'valori fuori da 1-6');
    });

    t.test('un sacchetto per eroe: i tiri di uno non consumano quelli dell\'altro', () => {
        if (!bag.size) return;
        const a = { name: 'Icaro' }, b = { name: 'Astarte' };
        const tiriA = [];
        for (let i = 0; i < bag.size; i++) {
            tiriA.push(g.rollD6(null, 0, a));
            g.rollD6(null, 0, b);
            g.rollD6(null, 0, b);
        }
        t.uguale(bag.sixes, conta(tiriA, 6));
        t.uguale(bag.ones, conta(tiriA, 1));
    });

    t.test('peekHeroDice mostra i prossimi dadi senza pescarli; il tiro dal telefono li consuma', () => {
        if (!bag.size) return;
        const eroe = { name: 'Dioforo' };
        const visti = g.peekHeroDice(eroe, 2);
        t.uguale(visti, g.peekHeroDice(eroe, 2), 'guardare non deve pescare');
        // Come executeCombatHeroRoll(result.rolls) con i valori rimandati dal server
        t.uguale(visti[0], g.rollD6(visti, 0, eroe));
        t.uguale(visti[1], g.rollD6(visti, 1, eroe));
        t.ok(g.peekHeroDice(eroe, 1)[0] !== undefined, 'il sacchetto si riempie da solo');
    });

    t.test('un valore imposto (test, server vecchio) vale anche se non è il prossimo del sacchetto', () => {
        const eroe = { name: 'Ascadeo', diceBag: [2, 3, 4, 5, 1, 6] };
        t.uguale(6, g.rollD6([6], 0, eroe));
        t.uguale([2, 3, 4, 5, 1, 6], eroe.diceBag, 'il sacchetto non cambia');
    });

    t.test('i dadi del sacchetto si contano nel Diario', () => {
        stato.expeditionStats = { diceRolls: [0, 0, 0, 0, 0, 0] };
        const eroe = { name: 'Icaro', diceBag: [6, 1] };
        g.rollD6(null, 0, eroe);
        g.rollD6(null, 0, eroe);
        t.uguale([1, 0, 0, 0, 0, 1], stato.expeditionStats.diceRolls);
    });
};
