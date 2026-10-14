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

    // Probabilità finali arrotondate all'unità
    // in ordine dalla rarità più bassa, come le tabelle di prima
    const quote = cascata => Object.fromEntries(Object.entries(g.cascadeShares(cascata)).reverse().map(([r, v]) => [r, Math.round(v)]));

    t.test('cascata del bottino: dal primo livello all\u2019ultimo in proporzione all\u2019avanzamento', () => {
        t.uguale([['leggendario', 0], ['epico', 0], ['raro', 5], ['non_comune', 21.1], ['comune', 73.3], ['scarso', 100]], g.lootRarityCascade(false, 0));
        t.uguale({ scarso: 20, comune: 55, non_comune: 20, raro: 5 }, quote(g.lootRarityCascade(false, 0)));
        t.uguale({ scarso: 5, comune: 29, non_comune: 34, raro: 26, epico: 4, leggendario: 2 }, quote(g.lootRarityCascade(false, 0.5)));
        t.uguale({ comune: 9, non_comune: 35, raro: 44, epico: 8, leggendario: 4 }, quote(g.lootRarityCascade(false, 1)));
        prepara(9);
        t.uguale(g.lootRarityCascade(false, 0.5), g.lootRarityCascade(false), 'livello 9 di 17 = metà mappa');
    });

    t.test('cascata del mercante: stesse probabilità finali della tabella di prima', () => {
        t.uguale({ scarso: 10, comune: 38, non_comune: 27, raro: 20, epico: 5 }, quote(g.merchantRarityCascade(0)));
        t.uguale({ comune: 10, non_comune: 35, raro: 44, epico: 8, leggendario: 3 }, quote(g.merchantRarityCascade(1)));
    });

    t.test('cascata: le rarità che il bottino non ha si saltano, i leggendari non cambiano', () => {
        const prova = (pool, cascata, n = 20000) => {
            g.setRngSeed(7);
            const conta = {};
            for (let i = 0; i < n; i++) { const r = g.rollRarityCascade(pool, cascata); conta[r] = (conta[r] || 0) + 1; }
            return Object.fromEntries(Object.entries(conta).map(([r, c]) => [r, c / n * 100]));
        };
        const fine = g.lootRarityCascade(false, 1);
        // Senza epici: i leggendari restano al 4%, la quota degli epici scende ai rari
        const senzaEpici = prova([{ rarity: 'leggendario' }, { rarity: 'raro' }, { rarity: 'comune' }], fine);
        t.ok(Math.abs(senzaEpici.leggendario - 4) < 0.6, `leggendari ${senzaEpici.leggendario.toFixed(1)}%`);
        t.ok(!senzaEpici.epico && !senzaEpici.non_comune && !senzaEpici.scarso);
        // Senza le rarità basse il resto va alla più bassa presente, non sale
        const soloAlte = prova([{ rarity: 'epico' }, { rarity: 'raro' }], g.lootRarityCascade(false, 0));
        t.uguale({ raro: 100 }, soloAlte, 'al primo livello niente epici anche se mancano le rarità basse');
        // Elite: la cascata si ferma ai non comuni, un bottino di soli comuni non ha rarità della cascata
        const elite = g.lootRarityCascade(true, 0);
        t.uguale(null, g.rollRarityCascade([{ rarity: 'comune' }], elite));
        t.ok(g.pickByRarity([{ rarity: 'comune', id: 'x' }], elite).id === 'x', 'nessuna rarità della cascata: un oggetto qualunque');
    });

    t.test('primo livello: tre quarti scarsi o comuni, niente epici', () => {
        prepara(1);
        const c = rarita(false, 4000);
        const bassi = ((c.scarso || 0) + (c.comune || 0)) / 4000;
        t.ok(bassi > 0.7 && bassi < 0.8, `scarsi + comuni ${Math.round(bassi * 100)}%`);
        t.ok(!c.epico && !c.leggendario);
    });

    t.test('elite: più avanti di 0,4 nella cascata, che si ferma ai non comuni', () => {
        const elite = g.lootRarityCascade(true, 0);
        t.uguale(['leggendario', 'epico', 'raro', 'non_comune'], elite.map(([r]) => r));
        t.uguale(100, elite[3][1], 'i non comuni prendono il resto');
        t.uguale(g.lootRarityCascade(false, 1).slice(0, 3), g.lootRarityCascade(true, 0.8).slice(0, 3), 'oltre la fine resta l\u2019ultimo livello');
        prepara(1);
        const c = rarita(true, 600);
        t.ok(!c.scarso && !c.comune, 'niente scarsi o comuni dagli elite');
    });

    t.test('epici e leggendari restano all\u20198% e al 4% anche per gli elite all\u2019ultimo livello', () => {
        const elite = g.cascadeShares(g.lootRarityCascade(true, 1));
        t.uguale(8, Math.round(elite.epico));
        t.uguale(4, Math.round(elite.leggendario));
        t.uguale(100, Math.round(Object.values(elite).reduce((a, b) => a + b, 0)));
        prepara(17);
        const c = rarita(true, 6000);
        t.ok((c.epico || 0) / 6000 < 0.1 && (c.leggendario || 0) / 6000 < 0.055, `elite: epici ${c.epico || 0}, leggendari ${c.leggendario || 0} su 6000`);
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
