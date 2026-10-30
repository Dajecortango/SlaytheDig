// Enea Dignitas: due abilità insieme. Hammergradiano Puro è un'abilità fissa ("abilitaFisse", sempre attiva:
// +1 Forza, +1 Fede, +1 Danno), Scudo del Nord è l'attiva (+2 Armatura a sé, +1 agli eroi accanto, bersaglio "vicini")
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const A = g.LIBRERIA.abilita;
    const eroe = (name, extra = {}) => ({ name, hp: 4, maxHp: 4, str: 2, int: 2, fth: 2, dmg: 1, items: [], base_armor: 0, current_armor: 0,
        att_bonus: 0, def_bonus: 0, help_bonus_val: 0, att_penalty: 0, ...extra });
    const prepara = party => {
        stato.party = party;
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = 0;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.helpBonus = 0; stato.helpDmgBonus = 0; stato.combatRound = 1;
        stato.activeEnemy = { name: 'Lupo', hp: 10, maxHp: 10, ca: 6, att: 5, dmg: 1 };
        return stato.activeEnemy;
    };
    const enea = () => {
        const h = JSON.parse(JSON.stringify(g.LIBRERIA.eroi.enea_dignitas));
        g.applyFixedAbilities(h);
        h.chosenAbility = A.enea_scudo_del_nord;
        return h;
    };

    t.test('scheda: 4 Forza, 1 Intelligenza, 2 Fede, 1 Danno, 5 HP; Hammergradiano Puro fissa e Scudo del Nord da scegliere', () => {
        const h = g.LIBRERIA.eroi.enea_dignitas;
        t.uguale('4,1,2,1,5', [h.str, h.int, h.fth, h.dmg, h.maxHp].join(','));
        t.uguale('enea_hammergradiano_puro', h.abilitaFisse.join(','));
        t.uguale('enea_scudo_del_nord', h.abilities.join(','));
        t.ok(A.enea_hammergradiano_puro && !A.enea_hammergradiano_puro.isCombatActive, 'passiva');
        t.ok(A.enea_scudo_del_nord && A.enea_scudo_del_nord.isCombatActive, 'attiva');
    });

    t.test('Hammergradiano Puro: alla creazione +1 Forza, +1 Fede, niente Danno', () => {
        const h = enea();
        t.uguale('5,1,3,1,5', [h.str, h.int, h.fth, h.dmg, h.maxHp].join(','));
    });

    t.test('gli effetti speciali di un\'abilità fissa agiscono anche se l\'eroe ne ha scelta un\'altra', () => {
        A.__prova_fissa = { id: '__prova_fissa', name: 'Prova', isCombatActive: false,
            speciali: [{ quando: 'inizio_scontro', fai: 'armatura', val: 1 }] };
        const h = eroe('Fisso', { abilitaFisse: ['__prova_fissa'], chosenAbility: A.enea_scudo_del_nord });
        prepara([h]);
        g.fireSpecials('inizio_scontro', h);
        t.uguale(1, h.current_armor);
        delete A.__prova_fissa;
    });

    t.test('Scudo del Nord: senza tiro, +2 Armatura a Enea e +1 agli eroi accanto, non agli altri', () => {
        const e = enea();
        const a = eroe('A'), b = eroe('B'), c = eroe('C');
        const n = prepara([a, e, b, c]);
        t.ok(g.abilityIsInstant(e), 'senza tiro');
        const r = g.resolveAbility(e, n, [3]);
        t.uguale(2, e.current_armor, 'Enea');
        t.uguale(1, a.current_armor, 'accanto a sinistra');
        t.uguale(1, b.current_armor, 'accanto a destra');
        t.uguale(0, c.current_armor, 'lontano');
        t.uguale(10, n.hp, 'nessun danno al nemico');
        t.ok(r.instant, 'istantanea');
        t.ok(!g.abilityUsable(e).ok, 'una volta per scontro');
    });

    t.test('Scudo del Nord: un eroe accanto caduto non riceve armatura; in fondo alla fila un solo vicino', () => {
        const e = enea();
        const a = eroe('A', { hp: 0 }), b = eroe('B');
        prepara([a, e, b]);
        g.resolveAbility(e, stato.activeEnemy, [3]);
        t.uguale(0, a.current_armor);
        t.uguale(1, b.current_armor);
        const e2 = enea(), d = eroe('D');
        prepara([e2, d]);
        g.resolveAbility(e2, stato.activeEnemy, [3]);
        t.uguale(2, e2.current_armor);
        t.uguale(1, d.current_armor);
    });

    t.test('simulatore: Enea nasce con le abilità fisse già applicate', () => {
        const dati = g.simCampaignData(Object.keys(g.CAMPAIGNS)[0]);
        dati.heroes = [...dati.heroes, { ...JSON.parse(JSON.stringify(g.LIBRERIA.eroi.enea_dignitas)) }];
        dati.abilities['Enea Dignitas'] = [A.enea_scudo_del_nord];
        const h = g.simBuildHero(dati, 'Enea Dignitas', 0, null);
        t.uguale('5,3,1', [h.str, h.fth, h.dmg].join(','));
        t.uguale('enea_scudo_del_nord', h.chosenAbility.id);
    });
};
