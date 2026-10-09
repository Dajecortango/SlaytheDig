// Correzioni della sessione di ricerca dei bug dopo la 1.7: mappa, finale, mappe procedurali, fasi dei nemici,
// Factotum, scarto, mercante, reliquie
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const eroe = (nome, extra = {}) => ({ name: nome, hp: 4, maxHp: 4, str: 2, int: 2, fth: 2, dmg: 1, items: [],
        base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, ...extra });
    const prepara = party => {
        stato.party = party;
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = 0;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.combatRound = 1;
        g.eval("currentScreenId = 'screenMap'");
    };

    t.test('mappa: un collegamento che salta un livello non lascia aperto il nodo non scelto', () => {
        prepara([eroe('A')]);
        stato.stsMapNodes = [
            { id: 0, level: 0, type: 'rest', next: [1, 2], active: true },
            { id: 1, level: 1, type: 'rest', next: [3], active: false },
            { id: 2, level: 2, type: 'rest', next: [3], active: false },
            { id: 3, level: 3, type: 'rest', next: [], active: false }
        ];
        stato.currentNodeId = 0; g.advanceNode();
        stato.currentNodeId = 2; g.advanceNode();
        t.uguale([3], stato.stsMapNodes.filter(n => n.active).map(n => n.id), 'aperto solo il nodo dopo quello scelto');
    });

    t.test('finale perso: cancella lo slot di salvataggio come la sconfitta in combattimento', () => {
        prepara([eroe('A')]);
        stato.stsMapNodes = [{ id: 0, level: 0, type: 'challenge', next: [], active: true }];
        stato.currentNodeId = 0;
        g.eval('globalThis.__cancellato = false; deleteCurrentSave = () => { globalThis.__cancellato = true; }');
        g.finishLostFinal();
        t.ok(g.eval('globalThis.__cancellato'));
    });

    t.test('mappa procedurale: con lo stesso seme la forma non cambia se cambiano le altre campagne', () => {
        const forma = c => c.mapNodes.map(n => `${n.id}:${n.level}:${n.type}:${n.next.join(',')}`).join(' ');
        const prima = forma(g.campaignForPlay('drakengrad', 777));
        const tut = g.CAMPAIGNS.tutorial;
        const nodi = tut.mapNodes;
        tut.challenges.__prova = { title: 'Prova', desc: '', stat: 'int', cd: 7 };
        tut.mapNodes = [...nodi, { id: 999, level: 1, type: 'challenge', challengeId: '__prova', next: [] }];
        const dopo = forma(g.campaignForPlay('drakengrad', 777));
        tut.mapNodes = nodi; delete tut.challenges.__prova;
        t.uguale(prima, dopo);
    });

    const nemicoConReazione = extra => ({ name: 'N', hp: 6, maxHp: 10, att: 99, dmg: 2, ca: 7,
        fasi: [{ soglia: 60, testo: 'Reagisce', reazione: 'contrattacco' }], ...extra });

    t.test('fasi: un nemico stordito non fa l\'attacco in risposta', () => {
        const a = eroe('A');
        prepara([a]);
        g.checkEnemyPhases(nemicoConReazione({ isStunned: true }), a);
        t.uguale(4, a.hp);
    });

    t.test('fasi: l\'attacco in risposta non conta come "colpito nel turno del nemico" (Dente per dente)', () => {
        const a = eroe('A', { lastHitRound: 0, lastHitDamage: 1 });
        prepara([a]);
        g.checkEnemyPhases(nemicoConReazione(), a);
        t.ok(a.hp < 4, 'la reazione colpisce');
        t.uguale([0, 1], [a.lastHitRound, a.lastHitDamage]);
    });

    t.test('Libertas in furor: chi ha agito e poi è caduto conta come primo', () => {
        const b = eroe('B', { firstActorStrBonus: 1 });
        prepara([eroe('A', { hp: 0, hasActed: true }), b]);
        t.uguale(0, g.firstActorBonus(b));
    });

    t.test('rianimato durante lo scontro: riprende l\'armatura; l\'abilità torna disponibile a ogni scontro', () => {
        const a = eroe('A', { hp: 0, base_armor: 2, current_armor: 0 });
        prepara([a]);
        g.healHero(a, 2);
        t.uguale(2, a.current_armor);
    });

    t.test('Factotum: un potenziamento temporaneo scaduto non lascia punti in più', () => {
        g.eval("campaignHeroes = [{ name: 'F', str: 3, int: 2, fth: 1 }]");
        const f = eroe('F', { str: 3, int: 2, fth: 1 });
        g.applyEffects(g.LIBRERIA.abilita.factotum.effects, f);
        prepara([f]);
        const stocco = JSON.parse(JSON.stringify(g.LIBRERIA.armeria.stocco_duellante));
        f.int += 1; f.items.push(stocco); g.applyItemEffects(stocco, f); g.refreshScaledBonuses(f);
        const prima = [f.str, f.int, f.fth];
        g.applyTempBuff(f, { buff_stat: 'str', buff_val: 1, buff_rounds: 1, name: 'Grappa' });
        g.refreshScaledBonuses(f);
        g.expireTempBuffs(true); g.refreshScaledBonuses(f);
        t.uguale(prima, [f.str, f.int, f.fth]);
    });

    t.test('scarto: se lo zaino si svuota mentre si sceglie, non si scarta niente', () => {
        const a = eroe('A', { hp: 2, items: [{ id: 'u', name: 'Unguento', type: 'consumable_heal', heal_val: 1 },
            { id: 's', name: 'Spada' }, { id: 's2', name: 'Spada 2' }] });
        prepara([a]);
        g.eval("currentScreenId = 'screenMerchant'");
        let fatto = 0;
        g.assignItemToHero({ id: 'p', name: 'Pugnale' }, a, () => fatto++);
        t.uguale('screenDiscard', g.eval('currentScreenId'));
        g.useConsumable('A', 0, 'A');
        t.uguale(['Spada', 'Spada 2', 'Pugnale'], a.items.map(i => i.name));
        t.uguale('screenMerchant', g.eval('currentScreenId'));
        t.uguale(1, fatto);
    });

    t.test('mercante: un oggetto comprato non si rivende per più di metà del prezzo pagato', () => {
        const raro = { id: 'r', name: 'R', rarity: 'raro' };
        t.uguale(5, g.itemSellPrice(raro));
        t.uguale(2, g.itemSellPrice({ ...raro, paidPrice: 5 }));
        t.uguale(1, g.itemSellPrice({ ...raro, paidPrice: 1 }));
    });

    t.test('Dente del grande lupo: cura il ferito con meno HP, non chi è già al massimo', () => {
        const pieno = eroe('A', { hp: 3, maxHp: 3 }), ferito = eroe('B', { hp: 4, maxHp: 6 });
        prepara([pieno, ferito]);
        stato.unlockedRelics = [{ id: 'dente_del_grande_lupo' }];
        stato.activeEnemy = { name: 'N', hp: 0, maxHp: 5 };
        stato.stsMapNodes = [{ id: 0, level: 0, type: 'combat', next: [1] }, { id: 1, level: 1, type: 'combat', next: [] }];
        stato.currentNodeId = 0;
        g.triggerLoot();
        t.uguale(5, ferito.hp);
    });
};
