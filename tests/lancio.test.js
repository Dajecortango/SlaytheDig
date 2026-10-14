// Lancio della panca (Pancrazio, combat.lancia): lancia un oggetto dello zaino, danni per rarità (LANCIO_DANNI);
// se colpisce l'oggetto torna a fine scontro, se manca è perso; un consumabile si consuma sempre
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const arm = g.LIBRERIA.armeria;
    const DANNI = g.eval('LANCIO_DANNI');
    const copia = id => JSON.parse(JSON.stringify(arm[id]));
    // Un oggetto da equipaggiare (non consumabile) con Forza, della rarità chiesta
    const equip = rar => Object.keys(arm).find(k => !(arm[k].type || '').startsWith('consumable') && g.itemRarity(arm[k]) === rar && arm[k].str);
    const consumabile = Object.keys(arm).find(k => (arm[k].type || '').startsWith('consumable'));
    const pancrazio = (extra = {}) => ({ name: 'Pancrazio', hp: 4, maxHp: 4, str: 4, int: 2, fth: 1, dmg: 1, items: [], base_armor: 0,
        current_armor: 0, att_bonus: 0, def_bonus: 0, help_bonus_val: 0, att_penalty: 0,
        chosenAbility: g.LIBRERIA.abilita.pancrazio_lancio_panca, ...extra });
    const prepara = party => {
        stato.party = party;
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = 0;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.stsMapNodes = [{ id: 1, level: 0, type: 'combat', next: [2] }, { id: 2, level: 1, type: 'combat', next: [] }];
        stato.currentNodeId = 1;
        stato.helpBonus = 0; stato.helpDmgBonus = 0; stato.combatRound = 1;
        stato.activeEnemy = { name: 'Orso', hp: 30, maxHp: 30, ca: 6, att: 5, dmg: 1 };
        return stato.activeEnemy;
    };
    const dai = (hero, id) => g.assignItemToHero(copia(id), hero, () => {});

    t.test('tabella dei danni: da 1 (scarso) a 6 (leggendario)', () => {
        t.uguale({ scarso: 1, comune: 2, non_comune: 3, raro: 4, epico: 5, leggendario: 6 }, DANNI);
    });

    t.test('zaino vuoto: l\'abilità non si può usare', () => {
        const p = pancrazio(); prepara([p]);
        t.ok(!g.abilityUsable(p).ok);
        dai(p, consumabile);
        t.ok(g.abilityUsable(p).ok);
    });

    t.test('colpisce: danni della rarità, niente bonus fino a fine scontro, poi l\'oggetto torna', () => {
        const id = equip('raro') || equip('non_comune');
        t.ok(id, 'c\'è un oggetto con Forza da provare');
        const p = pancrazio(); const n = prepara([p]);
        dai(p, id);
        const forza = p.str;
        p.throwIdx = 0;
        t.uguale(DANNI[g.itemRarity(arm[id])], g.expectedHitDamage(p, 'ability'), 'anteprima del danno');
        const r = g.resolveAbility(p, n, [6]);
        t.ok(r.hit); t.uguale(arm[id].name, r.thrown);
        t.uguale(30 - DANNI[g.itemRarity(arm[id])], n.hp);
        t.uguale(0, p.items.length, 'lasciato lo zaino');
        t.uguale(forza - arm[id].str, p.str, 'i bonus dell\'oggetto se ne vanno');
        const note = g.combatVictorySpecials().notes;
        t.uguale(1, p.items.length); t.uguale(id, p.items[0].id);
        t.uguale(forza, p.str, 'raccolto: i bonus tornano');
        t.ok(note.some(x => /raccoglie/.test(x)), note.join(' | '));
        t.ok(!p.thrownItems);
    });

    t.test('manca: l\'oggetto è perso, anche a fine scontro', () => {
        const id = equip('comune') || equip('non_comune');
        const p = pancrazio(); const n = prepara([p]);
        dai(p, id); dai(p, consumabile);
        p.throwIdx = 0;
        const r = g.resolveAbility(p, n, [1]);
        t.ok(!r.hit); t.uguale(30, n.hp);
        t.uguale(1, p.items.length); t.ok(p.items[0].id !== id);
        g.combatVictorySpecials();
        t.uguale(1, p.items.length, 'non torna');
    });

    t.test('consumabile lanciato: una copia della pila, si consuma anche se colpisce', () => {
        const p = pancrazio(); const n = prepara([p]);
        dai(p, consumabile); dai(p, consumabile);
        t.uguale(2, p.items[0].qty);
        p.throwIdx = 0;
        t.ok(g.resolveAbility(p, n, [6]).hit);
        t.uguale(1, p.items[0].qty || 1);
        g.combatVictorySpecials();
        t.uguale(1, p.items[0].qty || 1, 'non torna');
    });

    t.test('simulatore: lancia l\'oggetto che rende di più (danni meno valore)', () => {
        const p = pancrazio(); prepara([p]);
        dai(p, consumabile);
        const id = equip('raro') || equip('non_comune');
        dai(p, id);
        const atteso = p.items.reduce((b, it, i) => (g.throwDamage(it) - g.simItemValue(it) > g.throwDamage(p.items[b]) - g.simItemValue(p.items[b]) ? i : b), 0);
        t.uguale(atteso, g.simThrowChoice(p));
    });
};
