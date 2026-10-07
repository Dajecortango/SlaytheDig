// Bottino degli scontri (rarità per livello e per elite) e merce del mercante
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const lib = g.LIBRERIA;

    // Bottino con tutte le rarità: tutto l'armeria
    g.eval('gameItems = Object.values(LIBRERIA.armeria)');
    // Livello 1..17 su una mappa di 17 livelli (avanzamento = (livello - 1) / 16)
    const prepara = (level) => {
        stato.stsMapNodes = [{ id: 1, level: level - 1, type: 'combat' }, { id: 2, level: 16, type: 'combat' }];
        stato.currentNodeId = 1;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.unlockedRelics = []; stato.activeCurses = [];
        stato.party = [{ name: 'A', hp: 2, maxHp: 4, items: [] }];
    };
    const rarita = (isElite, n = 3000) => {
        const conta = {};
        for (let i = 0; i < n; i++) { const r = g.itemRarity(g.pickLootItem(isElite)); conta[r] = (conta[r] || 0) + 1; }
        return conta;
    };

    t.test('pesi del bottino: dal primo livello all\u2019ultimo in proporzione all\u2019avanzamento', () => {
        t.uguale({ scarso: 20, comune: 55, non_comune: 20, raro: 5 }, g.lootRarityWeights(false, 0));
        t.uguale({ scarso: 10, comune: 30, non_comune: 20, raro: 20, epico: 15, leggendario: 5 }, g.lootRarityWeights(false, 0.5));
        t.uguale({ comune: 5, non_comune: 20, raro: 35, epico: 30, leggendario: 10 }, g.lootRarityWeights(false, 1));
        prepara(9);
        t.uguale(g.lootRarityWeights(false, 0.5), g.lootRarityWeights(false), 'livello 9 di 17 = metà mappa');
    });

    t.test('primo livello: tre quarti scarsi o comuni, niente epici', () => {
        prepara(1);
        const c = rarita(false, 4000);
        const bassi = ((c.scarso || 0) + (c.comune || 0)) / 4000;
        t.ok(bassi > 0.7 && bassi < 0.8, `scarsi + comuni ${Math.round(bassi * 100)}%`);
        t.ok(!c.epico && !c.leggendario);
    });

    t.test('elite: più avanti di 0,4 nella tabella, senza scarsi e comuni', () => {
        t.uguale({ non_comune: 20, raro: 17, epico: 12, leggendario: 4 }, g.lootRarityWeights(true, 0));
        t.uguale(g.lootRarityWeights(false, 1), { comune: 5, ...g.lootRarityWeights(true, 0.8) }, 'oltre la fine resta l\u2019ultimo livello');
        prepara(1);
        const c = rarita(true, 600);
        t.ok(!c.scarso && !c.comune, 'niente scarsi o comuni dagli elite');
    });

    t.test('grantRelic dà una reliquia non posseduta e ne applica gli effetti', () => {
        prepara(3);
        stato.party = [{ name: 'A', hp: 4, maxHp: 4, fth: 1, items: [] }];
        const r = g.grantRelic('anello_d_arvale');
        t.ok(r && g.hasRelic('anello_d_arvale'));
        t.uguale(2, stato.party[0].fth, '+1 Fede a tutti');
        t.uguale(null, g.grantRelic('anello_d_arvale'), 'non si prende due volte');
        for (let i = 0; i < 50; i++) { const id = g.pickUnownedRelicId(); t.ok(id !== 'anello_d_arvale'); }
    });

    t.test('mercante: 4 armi o armature, 2 consumabili, il medico; nessuna reliquia', () => {
        prepara(3);
        const stock = g.generateMerchantStock();
        const oggetti = stock.filter(e => e.kind === 'item');
        t.uguale(4, oggetti.filter(e => !(e.item.type || '').startsWith('consumable')).length);
        t.uguale(2, oggetti.filter(e => (e.item.type || '').startsWith('consumable')).length);
        t.uguale(1, stock.filter(e => e.kind === 'medic').length);
        t.uguale(0, stock.filter(e => e.kind === 'relic').length);
        const medico = stock.find(e => e.kind === 'medic');
        t.uguale(5, medico.price, '5 monete per HP'); t.ok(medico.fixedPrice && medico.revealed);
    });

    t.test('il prezzo del medico non cambia con sconti o contrattazione', () => {
        prepara(9);
        stato.party = [{ name: 'A', hp: 2, maxHp: 4, merchantDiscount: 0.2, items: [] }];
        g.eval("merchantHaggle = 'ok'");
        g.stockMerchant();
        const medico = g.eval('merchantItemsWithPrices').find(e => e.kind === 'medic');
        t.uguale(5, medico.price);
        g.eval('merchantHaggle = null');
    });
};
