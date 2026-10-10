// Animazioni rapide, bottino preso dal telefono (takeLootChoice) e scena mandata ai telefoni
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const eroe = (name, extra = {}) => ({ name, hp: 4, maxHp: 4, str: 2, int: 2, fth: 2, dmg: 1, items: [],
        base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, ...extra });

    t.test('animazioni rapide: le durate si dimezzano solo con l\'opzione attiva', () => {
        t.uguale(500, g.animTime(500));
        g.eval('gameOptions.fastAnimations = true');
        t.uguale(250, g.animTime(500));
        g.eval('gameOptions.fastAnimations = false');
    });

    t.test('bottino dal telefono: l\'eroe prende un oggetto, una volta sola, e si prosegue', () => {
        const [a, b] = stato.party = [eroe('A'), eroe('B')];
        stato.unlockedRelics = []; stato.activeCurses = [];
        stato.expeditionStats = g.eval('newExpeditionStats()');
        g.eval(`currentScreenId = 'screenLoot'; lootTaken = false; lootChoices = [{ id: 'x', name: 'X' }, { id: 'y', name: 'Y' }];
            globalThis.__avanti = 0; advanceNode = () => { globalThis.__avanti++; }`);
        t.ok(g.takeLootChoice(1, 'B'));
        t.uguale(['Y'], b.items.map(i => i.name));
        t.ok(!g.takeLootChoice(0, 'A'), 'il secondo arriva tardi');
        t.uguale([], a.items);
        t.uguale(1, g.eval('globalThis.__avanti'));
    });

    t.test('bottino dal telefono: con lo zaino pieno scarta l\'oggetto indicato', () => {
        const a = eroe('A', { items: [{ id: '1', name: 'Uno' }, { id: '2', name: 'Due' }, { id: '3', name: 'Tre' }] });
        stato.party = [a];
        g.eval(`currentScreenId = 'screenLoot'; lootTaken = false; lootChoices = [{ id: 'x', name: 'X' }]`);
        g.takeLootChoice(0, 'A', 1);
        t.uguale(['Uno', 'Tre', 'X'], a.items.map(i => i.name));
    });

    t.test('un caduto non prende il bottino', () => {
        stato.party = [eroe('A', { hp: 0 })];
        g.eval(`currentScreenId = 'screenLoot'; lootTaken = false; lootChoices = [{ id: 'x', name: 'X' }]`);
        t.ok(!g.takeLootChoice(0, 'A'));
    });
};
