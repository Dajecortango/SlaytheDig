// Motore del combattimento: dado naturale, attacco del nemico, abilità attive e passive di combattimento
module.exports = (t, carica) => {
    const g = carica();
    const abilita = id => JSON.parse(JSON.stringify(g.LIBRERIA.abilita[id]));
    const prepara = (eroi, round = 1) => {
        g.eval('stato').party = eroi;
        g.eval('stato').combatRound = round;
        g.eval('stato').helpBonus = 0;
        g.eval('stato').unlockedRelics = [];
        g.eval('stato').activeCurses = [];
    };

    t.test('dado naturale: 6 riesce sempre, 1 fallisce sempre', () => {
        t.ok(g.naturalRollSuccess(6, 6, 20));
        t.ok(!g.naturalRollSuccess(1, 30, 5));
        t.ok(g.naturalRollSuccess(3, 10, 10));
    });

    t.test('attacco del nemico: prima l\'armatura, poi gli HP', () => {
        const eroe = { name: 'A', hp: 4, maxHp: 4, current_armor: 1 };
        prepara([eroe]);
        const r = g.resolveMonsterAttack({ dmg: 3 }, eroe);
        t.uguale(0, eroe.current_armor);
        t.uguale(2, eroe.hp);
        t.uguale(2, r.hpDamage);
    });

    t.test('Dente per dente: non usabile senza essere stati colpiti', () => {
        const eroe = { name: 'D', str: 2, dmg: 1, hp: 4, current_armor: 0, chosenAbility: abilita('dente_per_dente') };
        prepara([eroe]);
        t.ok(!g.abilityUsable(eroe).ok);
    });

    t.test('Dente per dente: dopo un colpo da 3 (1 armatura + 2 HP) infligge 1 + 3 se il tiro colpisce', () => {
        const eroe = { name: 'D', str: 2, dmg: 1, hp: 4, current_armor: 1, chosenAbility: abilita('dente_per_dente') };
        const nemico = { hp: 20, ca: 99, dmg: 3 };
        prepara([eroe], 1);
        g.resolveMonsterAttack(nemico, eroe);
        g.eval('stato').combatRound = 2;
        t.ok(g.abilityUsable(eroe).ok, 'usabile nel round dopo');
        const mancato = g.resolveAbility(eroe, nemico, [1]);
        t.ok(!mancato.hit && !mancato.autoHit, 'con un 1 manca: niente colpo automatico');
        t.uguale(20, nemico.hp);
        eroe.abilityUsedThisCombat = false;
        const r = g.resolveAbility(eroe, nemico, [6]);
        t.ok(r.hit, 'il 6 naturale colpisce');
        t.uguale(4, r.dmg);
        t.uguale(16, nemico.hp);
    });

    t.test('Dente per dente: colpito due round fa non vale; colpo annullato dallo Scudo dell\'Atamano non vale', () => {
        const eroe = { name: 'D', str: 2, dmg: 1, hp: 4, current_armor: 0, chosenAbility: abilita('dente_per_dente') };
        prepara([eroe], 1);
        g.resolveMonsterAttack({ dmg: 1 }, eroe);
        g.eval('stato').combatRound = 3;
        t.ok(!g.abilityUsable(eroe).ok, 'due round dopo');
        g.eval('stato').unlockedRelics = [{ id: 'scudo_dell_atamano', name: "Scudo dell'Atamano" }];
        g.eval('stato').party.atamanoUsed = false;
        g.resolveMonsterAttack({ dmg: 2 }, eroe);
        g.eval('stato').combatRound = 4;
        t.ok(!g.abilityUsable(eroe).ok, 'colpo annullato');
    });

    t.test('Libertas in furor: +1 Forza al tiro solo al primo eroe che agisce nel round', () => {
        const a = { name: 'A', str: 3, dmg: 2, hp: 4, hasActed: false, current_armor: 0 };
        g.applyEffects(abilita('libertas_in_furor').effects, a);
        const b = { name: 'B', str: 3, dmg: 1, hp: 4, hasActed: false };
        const morto = { name: 'M', hp: 0, hasActed: false };  // a inizio round tutti tornano a hasActed false
        prepara([a, b, morto]);
        const primo = g.resolveAttack(a, { hp: 50, ca: 9 }, [5]);
        t.uguale(9, primo.total, 'primo ad agire: 5 + 3 + 1');
        t.uguale(2, primo.dmg, 'il danno non cambia');
        t.uguale(9, g.resolveDefend(a, { att: 9 }, [5]).total, 'vale anche per Difendi');
        b.hasActed = true;
        t.uguale(8, g.resolveAttack(a, { hp: 50, ca: 9 }, [5]).total, 'dopo un altro');
    });

    t.test('reliquie di combattimento riconosciute per id', () => {
        prepara([]);
        g.eval('stato').combatRound = 1;
        g.eval('stato').unlockedRelics = [{ id: 'frammento_di_yr_drazul', name: 'Frammento di Yr-Drazul' }];
        t.uguale(1, g.relicDiceBonus());
        t.uguale(1, g.relicCombatBonus().att);
    });

    t.test('Presagio di Morte (per id): il nemico fa 1 danno in più', () => {
        const eroe = { name: 'A', hp: 4, maxHp: 4, current_armor: 0 };
        prepara([eroe]);
        g.eval('stato').activeCurses = [{ id: 'presagio_di_morte', text: 'Presagio di Morte (+1 danno subito)' }];
        g.resolveMonsterAttack({ dmg: 1 }, eroe);
        t.uguale(2, eroe.hp);
    });

    t.test('abilità 7: probabilità della somma esatta (7 = 6 su 36)', () => {
        t.uguale(6 / 36, g.exactSumChance(7));
        t.uguale(1 / 36, g.exactSumChance(12));
    });

    t.test('abilità 7: con 3 + 4 un nemico normale è sconfitto, con 3 + 3 non succede niente', () => {
        const eroe = { name: 'S', str: 2, dmg: 1, hp: 4, chosenAbility: abilita('sette') };
        const stato = g.eval('stato');
        prepara([eroe]);
        stato.stsMapNodes = [{ id: 1, level: 0, type: 'combat' }, { id: 2, level: 5, type: 'captain' }];
        stato.currentNodeId = 1;
        const nemico = { hp: 15, maxHp: 15 };
        const mancato = g.resolveAbility(eroe, nemico, [3, 3]);
        t.ok(!mancato.hit); t.uguale(15, nemico.hp);
        eroe.abilityUsedThisCombat = false;
        const r = g.resolveAbility(eroe, nemico, [3, 4]);
        t.ok(r.hit && !r.eliteHalf); t.uguale(0, nemico.hp); t.uguale(15, r.dmg);
    });

    t.test('abilità 7: un elite o il boss finale scende a metà vita (e non viene curato se è già sotto)', () => {
        const eroe = { name: 'S', str: 2, dmg: 1, hp: 4, chosenAbility: abilita('sette') };
        const stato = g.eval('stato');
        prepara([eroe]);
        stato.stsMapNodes = [{ id: 1, level: 2, type: 'elite' }, { id: 2, level: 9, type: 'combat' }];
        stato.currentNodeId = 1;
        const elite = { hp: 16, maxHp: 16 };
        const r = g.resolveAbility(eroe, elite, [6, 1]);
        t.ok(r.eliteHalf); t.uguale(8, elite.hp);
        stato.currentNodeId = 2;  // ultimo livello della mappa = boss finale
        const boss = { hp: 5, maxHp: 18 };
        eroe.abilityUsedThisCombat = false;
        g.resolveAbility(eroe, boss, [2, 5]);
        t.uguale(5, boss.hp, 'già sotto la metà: resta uguale');
    });

    t.test('Va bene, prendo lo scudo: +4 Armatura senza tiro, una volta per scontro', () => {
        const eroe = { name: 'S', str: 2, dmg: 1, hp: 4, current_armor: 1, chosenAbility: abilita('va_bene_prendo_lo_scudo') };
        prepara([eroe]);
        g.eval('stato').helpBonus = 1;
        t.ok(g.abilityIsInstant(eroe), 'si risolve senza dadi');
        const r = g.resolveAbility(eroe, { hp: 10, ca: 7 });
        t.ok(r.instant); t.uguale(4, r.gained);
        t.uguale(5, eroe.current_armor);
        t.uguale(1, g.eval('stato').helpBonus, 'il bonus di Aiuta resta');
        t.ok(!g.abilityUsable(eroe).ok, 'già usata in questo scontro');
    });

    t.test('Orgoglio di mamma: +2 al tiro e +1 al danno', () => {
        const eroe = { name: 'M', str: 2, dmg: 1, hp: 4, att_penalty: 0, chosenAbility: abilita('orgoglio_di_mamma') };
        prepara([eroe]);
        const nemico = { hp: 10, ca: 8 };
        const r = g.resolveAbility(eroe, nemico, [4]);
        t.uguale(4 + 2 + 2, r.total, 'tiro 4 + Forza 2 + 2');
        t.ok(r.hit, '8 contro CA 8 colpisce');
        t.uguale(2, r.dmg, 'danno 1 + 1');
        t.uguale(8, nemico.hp);
    });

    t.test('Neanche un graffio: senza armatura, con 5+ il colpo è ignorato; con 4 no; con armatura non si tira', () => {
        const casuale = Math.random;
        const conDado = (faccia, fn) => { Math.random = () => (faccia - 1) / 6 + 0.01; try { return fn(); } finally { Math.random = casuale; } };
        const eroe = { name: 'G', hp: 4, maxHp: 4, current_armor: 0 };
        g.applyEffects(abilita('neanche_un_graffio').effects, eroe);
        prepara([eroe]);
        const schivato = conDado(5, () => g.resolveMonsterAttack({ dmg: 3 }, eroe));
        t.uguale(4, eroe.hp, 'con 5 nessun danno');
        t.ok(schivato.events.some(e => e.type === 'dodge'));
        conDado(4, () => g.resolveMonsterAttack({ dmg: 3 }, eroe));
        t.uguale(1, eroe.hp, 'con 4 il colpo passa');
        eroe.hp = 4; eroe.current_armor = 1;
        const r = conDado(6, () => g.resolveMonsterAttack({ dmg: 3 }, eroe));
        t.ok(!r.events.some(e => e.type === 'dodge' || e.type === 'dodge_fail'), 'con armatura non si tira');
        t.uguale(2, eroe.hp);
    });

    t.test('ogni dado degli eroi viene contato nelle statistiche della spedizione', () => {
        const stato = g.eval('stato');
        stato.expeditionStats = g.eval('newExpeditionStats()');
        [1, 6, 6, 3].forEach(v => g.rollD6([v], 0));
        t.uguale([1, 0, 1, 0, 0, 2], stato.expeditionStats.diceRolls);
        delete stato.expeditionStats.diceRolls;   // salvataggio vecchio senza il campo
        g.rollD6([2], 0);
        t.uguale([0, 1, 0, 0, 0, 0], stato.expeditionStats.diceRolls);
    });
};
