// Passive degli eroi che agiscono con un segnale sull'eroe: Astarte (Veleni) e Dioforo (Era solo una prova!)
module.exports = (t, carica) => {
    const g = carica();

    const prepara = () => {
        const stato = g.eval('stato');
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = 0;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.stsMapNodes = []; stato.currentNodeId = null;
        stato.helpBonus = 0; stato.helpDmgBonus = 0; stato.combatRound = 1;
        return stato;
    };

    t.test('Veleni ed altri composti: Aiuta riuscito dà +1 al tiro e +1 al danno al prossimo attacco', () => {
        const stato = prepara();
        const astarte = { name: 'Astarte', hp: 4, maxHp: 4, str: 0, dmg: 2, current_armor: 0, items: [], helpDmgBonus: 1 };
        const altro = { name: 'B', hp: 4, maxHp: 4, str: 0, dmg: 1, current_armor: 0, items: [] };
        const nemico = { name: 'N', hp: 20, maxHp: 20, att: 3, ca: 3, dmg: 1 };
        stato.party = [astarte, altro];
        const aiuto = g.resolveHelp(astarte, nemico, [6]);
        t.ok(aiuto.success, 'aiuto riuscito');
        t.uguale(1, stato.helpBonus);
        t.uguale(1, stato.helpDmgBonus);
        const colpo = g.resolveAttack(altro, nemico, [6]);
        t.uguale(2, colpo.dmg, '1 danno base + 1 dall\'aiuto');
        t.uguale(0, stato.helpDmgBonus, 'consumato dal colpo');
    });

    t.test('Veleni ed altri composti: il danno in più non passa al round successivo', () => {
        const stato = prepara();
        const astarte = { name: 'Astarte', hp: 4, maxHp: 4, str: 0, dmg: 2, current_armor: 0, items: [], helpDmgBonus: 1 };
        stato.party = [astarte];
        g.resolveHelp(astarte, { att: 3, ca: 3 }, [6]);
        t.uguale(1, stato.helpDmgBonus);
        g.eval('stato.helpDmgBonus = 0'); // come startHeroesTurnCycle
        const colpo = g.resolveAttack(astarte, { hp: 20, ca: 3 }, [6]);
        t.uguale(2, colpo.dmg);
    });

    t.test('un Aiuta senza la passiva non dà danno in più', () => {
        const stato = prepara();
        const eroe = { name: 'A', hp: 4, maxHp: 4, str: 0, dmg: 1, current_armor: 0, items: [] };
        stato.party = [eroe];
        g.resolveHelp(eroe, { att: 3 }, [6]);
        t.uguale(0, stato.helpDmgBonus || 0);
    });

    t.test('Era solo una prova!: una prova fallita si ripete una volta con -1', () => {
        const stato = prepara();
        const dioforo = { name: 'Dioforo', hp: 4, int: 2, challengeRerollMalus: 1 };
        stato.party = [dioforo];
        const sfida = { stat: 'int', cd: 6, reward: null, punishment: null };
        stato.challengeState = sfida;
        // primo tiro 2 (2+2 = 4, fallisce), secondo 5 (5+2-1 = 6, riesce)
        const ok = g.resolveChallenge(dioforo, sfida, [2, null, 5]);
        t.ok(ok.rerolled, 'ritentata');
        t.ok(ok.success, 'riuscita al secondo tentativo');
        t.uguale(6, ok.total);
        // secondo tiro 4 (4+2-1 = 5, fallisce ancora)
        const ko = g.resolveChallenge(dioforo, sfida, [2, null, 4]);
        t.ok(ko.rerolled && !ko.success, 'fallita anche al secondo tentativo');
        t.uguale(1, stato.expeditionStats.challengesFailed, 'conta una prova fallita sola');
    });

    t.test('Era solo una prova!: nessun ritiro se la prova riesce o se l\'eroe non ha la passiva', () => {
        const stato = prepara();
        const sfida = { stat: 'int', cd: 6, reward: null, punishment: null };
        stato.challengeState = sfida;
        const riuscita = g.resolveChallenge({ name: 'Dioforo', int: 2, challengeRerollMalus: 1 }, sfida, [5]);
        t.ok(riuscita.success && !riuscita.rerolled);
        const senza = g.resolveChallenge({ name: 'A', int: 2 }, sfida, [2, null, 6]);
        t.ok(!senza.success && !senza.rerolled);
    });

    t.test('Tanto ho tenacia: la prima volta a 0 HP torna con 2 HP, la seconda no', () => {
        const stato = prepara();
        const eroe = { name: 'T', hp: 1, maxHp: 4, current_armor: 0, items: [], tenacityRevive: 2 };
        stato.party = [eroe];
        const nemico = { name: 'N', dmg: 3 };
        const r1 = g.resolveMonsterAttack(nemico, eroe);
        t.uguale(2, eroe.hp);
        t.ok(!r1.targetDied && eroe.tenacityUsed, 'rialzato, segno scritto');
        const r2 = g.resolveMonsterAttack(nemico, eroe);
        t.uguale(0, eroe.hp);
        t.ok(r2.targetDied, 'la seconda volta cade');
    });

    t.test('Cerusico da Battaglia: dopo lo scontro cura 1 HP all\'eroe vivo più ferito', () => {
        const stato = prepara();
        const cerusico = { name: 'C', hp: 4, maxHp: 4, postCombatHeal: 1 };
        const poco = { name: 'P', hp: 3, maxHp: 4 };
        const molto = { name: 'M', hp: 1, maxHp: 5 };
        const caduto = { name: 'X', hp: 0, maxHp: 4 };
        stato.party = [cerusico, poco, molto, caduto];
        const res = g.battleSurgeonHeal();
        t.uguale(2, molto.hp);
        t.uguale(3, poco.hp);
        t.uguale(0, caduto.hp, 'i caduti non si curano');
        t.uguale(1, res.length);
        cerusico.hp = 0;
        t.uguale(0, g.battleSurgeonHeal().length, 'il cerusico caduto non cura');
    });
};
