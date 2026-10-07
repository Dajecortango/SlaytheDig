// Medico del mercante (tetto di HP per mercante, conferma delle spese grosse) e scelta del bottino
module.exports = (t, carica) => {
    const g = carica();

    const prepara = () => {
        const stato = g.eval('stato');
        stato.unlockedRelics = []; stato.activeCurses = [];
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.stsMapNodes = [{ id: 0, level: 1 }]; stato.currentNodeId = 0;
        g.eval("merchantItemsWithPrices = [{ kind: 'medic', item: {}, price: MEDIC_PRICE_PER_HP, fixedPrice: true, revealed: true }]");
        g.eval('merchantMedicHealed = 0');
        g.eval('openModal = (t, b, a) => { globalThis.__modal = { titolo: t, azioni: a || [] }; }');
        return stato;
    };
    const finestra = () => g.eval('globalThis.__modal');
    const clicca = etichetta => finestra().azioni.find(a => a.label.startsWith(etichetta)).onClick();

    t.test('medico: 5 monete per HP, al massimo 4 HP in tutto per mercante', () => {
        const stato = prepara();
        const a = { name: 'A', hp: 0, maxHp: 4, items: [], base_armor: 0, current_armor: 0 }, b = { name: 'B', hp: 1, maxHp: 4, items: [], base_armor: 0, current_armor: 0 };
        stato.party = [a, b]; stato.partyCoins = 100;
        g.openMedicHeal(0, a);
        t.uguale(4, finestra().azioni.filter(x => x.label.startsWith('+')).length, 'da +1 a +4');
        clicca('+3');
        t.uguale(3, a.hp); t.uguale(85, stato.partyCoins);
        g.openMedicHeal(0, b);
        t.uguale(1, finestra().azioni.filter(x => x.label.startsWith('+')).length, 'resta 1 HP');
        clicca('+1');
        t.uguale(2, b.hp); t.uguale(80, stato.partyCoins);
        g.openMedic(0);
        t.uguale(4, g.eval('merchantMedicHealed'), 'tetto raggiunto');
    });

    t.test('medico: chiede conferma se la cura costa almeno metà delle monete', () => {
        const stato = prepara();
        const a = { name: 'A', hp: 0, maxHp: 4, items: [], base_armor: 0, current_armor: 0 };
        stato.party = [a]; stato.partyCoins = 20;
        g.openMedicHeal(0, a);
        clicca('+2');   // 10 su 20: conferma
        t.uguale('Sei sicuro?', finestra().titolo);
        t.uguale(0, a.hp, 'non ancora pagato');
        clicca('Paga');
        t.uguale(2, a.hp); t.uguale(10, stato.partyCoins);
        g.openMedicHeal(0, a);
        stato.partyCoins = 100;
        clicca('+1');   // 5 su 100: niente conferma
        t.uguale(3, a.hp);
    });

    t.test('bottino: due oggetti diversi fra cui sceglierne uno', () => {
        prepara();
        const scelte = g.pickLootChoices(false);
        t.uguale(g.eval('LOOT_CHOICES'), scelte.length);
        t.ok(scelte[0] !== scelte[1], 'diversi');
    });
};
