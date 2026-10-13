// Prezzo degli oggetti: campo "prezzo" dell'armeria (Scudi), altrimenti quello della rarità (ITEM_BASE_PRICE)
const { caricaPagina } = require('./ambiente');

module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');

    t.test('senza prezzo vale quello della rarità, con il prezzo quello scritto', () => {
        t.uguale(g.eval('ITEM_BASE_PRICE.raro'), g.itemBasePrice({ name: 'Spada', rarity: 'raro' }));
        t.uguale(17, g.itemBasePrice({ name: 'Spada', rarity: 'raro', prezzo: 17 }));
        t.uguale(g.eval('ITEM_BASE_PRICE.comune'), g.itemBasePrice({ name: 'Senza rarità' }));
    });

    t.test('il mercante parte dal prezzo scritto, e si rivende a metà', () => {
        const item = { name: 'Spada cara', rarity: 'comune', prezzo: 40 };
        stato.stsMapNodes = [{ id: 1, level: 0, type: 'merchant', next: [] }];
        stato.currentNodeId = 1;
        stato.unlockedRelics = []; stato.activeCurses = []; stato.party = [];
        const spread = g.eval('ITEM_PRICE_SPREAD.comune');
        g.__spada = item;
        const prima = g.eval('gameItems');
        g.eval('gameItems = [__spada]');
        const prezzi = [];
        for (let i = 0; i < 20; i++) prezzi.push(...g.generateMerchantStock().filter(x => x.kind === 'item' && x.item.name === 'Spada cara').map(x => x.price));
        g.__prima = prima;
        g.eval('gameItems = __prima');
        t.ok(prezzi.length > 0, 'la spada esce dal mercante');
        t.ok(prezzi.every(p => p >= 40 - spread && p <= 40 + spread), `prezzi ${prezzi.join(',')}`);
        t.uguale(20, g.itemSellPrice(item));
    });

    t.test('editor: campo "Prezzo in Scudi" con il prezzo della rarità e quanto costa dal mercante', () => {
        const ed = caricaPagina('editor.html');
        const f = ed.eval('ITEM_FIELDS').find(x => x.k === 'prezzo');
        t.ok(f && f.type === 'number', 'campo prezzo');
        const raro = ed.eval('ITEM_BASE_PRICE.raro');
        t.uguale(String(raro), String(f.placeholder({ rarity: 'raro' })));
        t.ok(/Scudi/.test(f.help({ rarity: 'raro', prezzo: 20 })) && /18-22 Scudi/.test(f.help({ rarity: 'raro', prezzo: 20 })), f.help({ rarity: 'raro', prezzo: 20 }));
    });
};
