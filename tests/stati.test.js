// Stati degli eroi (js/motore/speciali.js): stordito, avvelenato, silenziato, furia; "purifica" li toglie
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const eroe = (name, extra = {}) => ({ name, hp: 4, maxHp: 4, str: 2, int: 1, fth: 1, dmg: 1, items: [], base_armor: 0, current_armor: 0,
        att_bonus: 0, def_bonus: 0, help_bonus_val: 0, att_penalty: 0, ...extra });
    const attiva = { id: '__colpo', name: 'Colpo', isCombatActive: true, combat: { dice: 1 } };
    const prepara = (party, speciali) => {
        stato.party = party;
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = 0;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.stsMapNodes = [{ id: 1, level: 0, type: 'combat', next: [2] }, { id: 2, level: 1, type: 'combat', next: [] }];
        stato.currentNodeId = 1;
        stato.helpBonus = 0; stato.helpDmgBonus = 0; stato.combatRound = 1;
        party.forEach(h => { h.hasActed = true; });  // turno del nemico: gli eroi hanno già agito
        stato.activeEnemy = { name: 'Strega', hp: 10, maxHp: 10, ca: 4, att: 4, dmg: 1, speciali };
        return stato.activeEnemy;
    };

    t.test('silenziato: niente abilità attiva per 2 round, poi torna', () => {
        const a = eroe('A', { chosenAbility: attiva });
        const n = prepara([a], [{ quando: 'colpisce', fai: 'silenzia', durata: 2 }]);
        g.resolveMonsterAttack(n, a);
        t.ok(g.isSilenced(a));
        stato.combatRound = 2; a.hasActed = false;
        t.ok(!g.abilityUsable(a).ok && /Silenziato/.test(g.abilityUsable(a).reason), 'round 2: no');
        stato.combatRound = 3;
        t.ok(!g.abilityUsable(a).ok, 'round 3: no');
        stato.combatRound = 4;
        t.ok(g.abilityUsable(a).ok, 'round 4: sì');
        t.ok(g.heroStatuses(a).length === 0);
    });

    t.test('furia: solo Attacca; Difendi, Aiuta e abilità bloccati (anche nel simulatore)', () => {
        const a = eroe('A', { chosenAbility: attiva });
        const n = prepara([a], [{ quando: 'colpisce', fai: 'infuria', durata: 1 }]);
        g.resolveMonsterAttack(n, a);
        stato.combatRound = 2; a.hasActed = false;
        t.ok(g.isRaging(a));
        ['defend', 'help', 'ability'].forEach(x => t.ok(!g.combatActionAllowed(a, x).ok, x));
        t.ok(g.combatActionAllowed(a, 'attack').ok && g.combatActionAllowed(a, 'use_item').ok);
        const hpBefore = n.hp;
        g.simExecuteCombatAction(a, 'defend', [6]);
        t.uguale(0, a.current_armor, 'il simulatore non difende');
        t.ok(n.hp <= hpBefore, 'attacca al posto di difendere');
        stato.combatRound = 3;
        t.ok(!g.isRaging(a), 'dura 1 round');
    });

    t.test('stati sulla carta dell\'eroe e "purifica" che li toglie tutti', () => {
        const a = eroe('A', { stunnedRounds: 1, poison: { val: 1, rounds: 2 }, silencedUntil: 5, rageUntil: 5 });
        prepara([a], []);
        t.uguale(['stordito', 'avvelenato', 'silenziato', 'furia'], g.heroStatuses(a).map(s => s.key));
        t.ok(/BTNSilence/.test(g.heroStatusesHtml(a)), 'icona');
        a.items.push({ name: 'Acqua santa', speciali: [{ quando: 'inizio_round', fai: 'purifica' }] });
        g.fireSpecialsAll('inizio_round');
        t.uguale(0, g.heroStatuses(a).length);
    });

    t.test('a fine scontro gli stati finiscono', () => {
        const a = eroe('A', { poison: { val: 1, rounds: 2 }, silencedUntil: 9, rageUntil: 9 });
        prepara([a], []);
        g.expireTempBuffs(true);
        t.uguale(0, g.heroStatuses(a).length);
    });
};
