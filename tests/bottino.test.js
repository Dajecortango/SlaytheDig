// Bottino degli scontri (rarità per livello e per elite) e merce del mercante
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const lib = g.LIBRERIA;

    // Bottino con tutte le rarità: tutto l'armeria
    g.eval('gameItems = Object.values(LIBRERIA.armeria)');
    const prepara = (level, elitesWon = 0) => {
        stato.stsMapNodes = [{ id: 1, level: level - 1, type: 'combat' }, { id: 2, level: 15, type: 'combat' }];
        stato.currentNodeId = 1;
        stato.expeditionStats = { ...g.eval('newExpeditionStats()'), elitesWon };
        stato.unlockedRelics = []; stato.activeCurses = [];
        stato.party = [{ name: 'A', hp: 2, maxHp: 4, items: [] }];
    };
    const rarita = (isElite, n = 3000) => {
        const conta = {};
        for (let i = 0; i < n; i++) { const r = g.itemRarity(g.pickLootItem(isElite)); conta[r] = (conta[r] || 0) + 1; }
        return conta;
    };

    t.test('tabella per livello: le rarità ammesse sono solo quelle della riga', () => {
        const righe = { 1: ['comune', 'non_comune'], 4: ['comune', 'non_comune', 'raro'], 7: ['comune', 'non_comune', 'raro', 'epico'],
            10: ['raro', 'epico', 'leggendario'], 13: ['raro', 'epico', 'leggendario'], 16: ['raro', 'epico', 'leggendario'] };
        for (const [livello, ammesse] of Object.entries(righe)) {
            prepara(Number(livello));
            const trovate = Object.keys(rarita(false, 600));
            t.ok(trovate.every(r => ammesse.includes(r)), `livello ${livello}: trovate ${trovate.join(', ')}`);
        }
    });

    t.test('livelli 1-2: circa 70% comuni e 30% non comuni', () => {
        prepara(2);
        const c = rarita(false, 4000);
        const comuni = c.comune / 4000;
        t.ok(comuni > 0.65 && comuni < 0.75, `comuni ${Math.round(comuni * 100)}%`);
    });

    t.test('elite: primo 80/20 raro-epico, terzo anche leggendario', () => {
        prepara(5, 0);
        t.uguale({ raro: 80, epico: 20 }, g.lootRarityWeights(true));
        prepara(5, 1);
        t.uguale({ raro: 70, epico: 30 }, g.lootRarityWeights(true));
        prepara(5, 7);
        t.uguale({ raro: 30, epico: 50, leggendario: 20 }, g.lootRarityWeights(true));
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
