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

    t.test('Libertas in furor: +1 danno solo al primo eroe che agisce nel round', () => {
        const a = { name: 'A', str: 9, dmg: 2, hp: 4, hasActed: false };
        g.applyEffects(abilita('libertas_in_furor').effects, a);
        const b = { name: 'B', str: 9, dmg: 1, hp: 4, hasActed: false };
        const morto = { name: 'M', hp: 0, hasActed: true };
        prepara([a, b, morto]);
        t.uguale(3, g.resolveAttack(a, { hp: 50, ca: 2 }, [5]).dmg, 'primo ad agire');
        b.hasActed = true;
        t.uguale(2, g.resolveAttack(a, { hp: 50, ca: 2 }, [5]).dmg, 'dopo un altro');
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
};
