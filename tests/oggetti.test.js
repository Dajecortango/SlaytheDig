// Oggetti: difesa con gli scudi, pile di consumabili, consumabili da danno e potenziamenti temporanei
module.exports = (t, carica) => {
    const g = carica();
    const lib = g.LIBRERIA.armeria;
    const copia = id => JSON.parse(JSON.stringify(lib[id]));
    const eroe = (extra = {}) => ({ name: 'A', str: 2, int: 1, fth: 1, dmg: 1, hp: 4, maxHp: 4, base_armor: 0, current_armor: 0,
        att_penalty: 0, def_bonus: 0, help_bonus_val: 0, items: [], ...extra });
    const prepara = eroi => {
        const stato = g.eval('stato');
        stato.party = eroi; stato.combatRound = 1; stato.helpBonus = 0;
        stato.unlockedRelics = []; stato.activeCurses = [];
        stato.activeEnemy = { name: 'Lupo', hp: 10, maxHp: 10, att: 5, ca: 7, dmg: 1 };
        return stato;
    };

    t.test('Difendi senza scudo: +1 Armatura', () => {
        const a = eroe(); prepara([a]);
        const r = g.resolveDefend(a, { att: 2 }, [5]);
        t.ok(r.success); t.uguale(1, r.gained); t.uguale(1, a.current_armor);
    });

    t.test('Difendi con lo Scudo Rinforzato in Ferro: +3 Armatura (1 + 2) e +1 al tiro', () => {
        const a = eroe(); prepara([a]);
        g.assignItemToHero(copia('scudo_ferro'), a, () => {});
        t.uguale(2, a.def_armor); t.uguale(1, a.def_bonus);
        t.uguale(0, a.base_armor, 'lo scudo non dà più armatura fissa');
        const r = g.resolveDefend(a, { att: 9 }, [6]);
        t.uguale(3, r.gained);
        t.uguale(6 + 2 + 1, r.total, 'tiro + Forza + Difesa dello scudo');
    });

    t.test('Difendi fallito: nessuna armatura', () => {
        const a = eroe({ def_armor: 2 }); prepara([a]);
        const r = g.resolveDefend(a, { att: 99 }, [2]);
        t.ok(!r.success); t.uguale(0, a.current_armor);
    });

    t.test('scartare lo scudo toglie anche l\'armatura con Difendi', () => {
        const a = eroe(); prepara([a]);
        g.assignItemToHero(copia('scudo'), a, () => {});
        t.uguale(1, a.def_armor);
        g.revertItemEffects(a.items[0], a); a.items.splice(0, 1);
        t.uguale(0, a.def_armor);
    });

    t.test('due consumabili uguali stanno nello stesso slot; il terzo ne occupa un altro', () => {
        const a = eroe(); prepara([a]);
        let chiamate = 0;
        for (let i = 0; i < 3; i++) g.assignItemToHero(copia('pozione'), a, () => chiamate++);
        t.uguale(3, chiamate, 'la funzione di ritorno parte sempre');
        t.uguale(2, a.items.length);
        t.uguale([2, 1], a.items.map(it => it.qty || 1));
    });

    t.test('zaino pieno ma con una pila libera: il consumabile si aggiunge senza scartare', () => {
        const a = eroe(); prepara([a]);
        ['spada', 'scudo', 'pozione'].forEach(id => g.assignItemToHero(copia(id), a, () => {}));
        g.assignItemToHero(copia('pozione'), a, () => {});
        t.uguale(3, a.items.length);
        t.uguale(2, a.items[2].qty);
    });

    t.test('usare una cura da una pila toglie una copia alla volta', () => {
        const a = eroe({ hp: 1 }); const stato = prepara([a]);
        g.eval("currentScreenId = 'screenMap'");
        a.items = [{ ...copia('unguento'), qty: 2 }];
        t.ok(g.useConsumable('A', 0, 'A'));
        t.uguale(3, a.hp); t.uguale(1, a.items[0].qty);
        t.ok(g.useConsumable('A', 0, 'A'));
        t.uguale(0, a.items.length);
        t.ok(stato);
    });

    t.test('consumabile da danno: 2 danni al nemico in combattimento, rifiutato fuori', () => {
        const a = eroe(); const stato = prepara([a]);
        a.items = [copia('bomba_acido')];
        g.eval("currentScreenId = 'screenMap'");
        t.ok(!g.useConsumable('A', 0), 'fuori dal combattimento non si usa');
        t.uguale(1, a.items.length, 'e resta nello zaino');
        g.eval("currentScreenId = 'screenCombat'");
        t.ok(g.useConsumable('A', 0));
        t.uguale(8, stato.activeEnemy.hp);
        t.uguale(0, a.items.length);
    });

    t.test('potenziamento di 1 round: vale nel round in cui si usa, poi scade', () => {
        const a = eroe(); const stato = prepara([a]);
        g.eval("currentScreenId = 'screenCombat'");
        a.items = [copia('grappa_soldato')];
        t.ok(g.useConsumable('A', 0, 'A'));
        t.uguale(3, a.str, 'Forza 2 + 1');
        stato.combatRound = 2;
        const scaduti = g.expireTempBuffs();
        t.uguale(1, scaduti.length);
        t.uguale(2, a.str, 'tornata come prima');
    });

    t.test('potenziamento di 3 round: scade all\'inizio del quarto', () => {
        const a = eroe(); const stato = prepara([a]);
        g.eval("currentScreenId = 'screenCombat'");
        a.items = [copia('olio_da_lama')];
        g.useConsumable('A', 0, 'A');
        for (const round of [2, 3]) { stato.combatRound = round; g.expireTempBuffs(); t.uguale(2, a.dmg, `ancora attivo al round ${round}`); }
        stato.combatRound = 4; g.expireTempBuffs();
        t.uguale(1, a.dmg);
    });

    t.test('potenziamento per tutto lo scontro: scade solo a fine scontro (o caricando una partita)', () => {
        const a = eroe(); const stato = prepara([a]);
        g.eval("currentScreenId = 'screenCombat'");
        a.items = [copia('elisir_berserker')];
        g.useConsumable('A', 0, 'A');
        stato.combatRound = 30; g.expireTempBuffs();
        t.uguale(4, a.str);
        g.expireTempBuffs(true);
        t.uguale(2, a.str);
        t.uguale(0, a.tempBuffs.length);
    });

    t.test('Infuso di Corteccia: +2 Armatura subito, non scade', () => {
        const a = eroe(); const stato = prepara([a]);
        g.eval("currentScreenId = 'screenCombat'");
        a.items = [copia('infuso_corteccia')];
        g.useConsumable('A', 0, 'A');
        t.uguale(2, a.current_armor);
        stato.combatRound = 5; g.expireTempBuffs(true);
        t.uguale(2, a.current_armor);
    });

    t.test('il simulatore non spreca i consumabili da danno come cure', () => {
        const a = eroe({ hp: 1 }); prepara([a]);
        a.items = [copia('olio_bollente')];
        t.ok(!g.simUseConsumable(a, 0, a));
        t.uguale(1, a.items.length);
    });

    t.test('effetto hero_item (Morte fiammeggiante): 2 Polvere Nera in una pila; 3 copie fanno 2 + 1', () => {
        const a = eroe(); prepara([a]);
        g.applyEffects(g.LIBRERIA.abilita.morte_fiammeggiante.effects, a);
        t.uguale(1, a.items.length); t.uguale('cristallo_flammaurea', a.items[0].id); t.uguale(2, a.items[0].qty);
        const b = eroe({ name: 'B' }); prepara([b]);
        g.applyEffects([{ effect: 'hero_item', item: 'cristallo_flammaurea', val: 3 }], b);
        t.uguale([2, 1], b.items.map(it => it.qty || 1));
        const c = eroe({ name: 'C' }); prepara([c]);
        g.applyEffects([{ effect: 'hero_item', item: 'spada', val: 1 }], c);
        t.uguale(3, c.str, 'un oggetto da equipaggiare applica le sue statistiche');
    });
};
