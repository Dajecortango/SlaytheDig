// Aurelio Dignitas: Ira Traboccante (passiva, segnale hero_set "iraTraboccante"). Ogni tiro fallito della compagnia
// in scontro dà 1 Collera (+1 al suo tiro per colpire per carica, al massimo IRA_MAX); al massimo va in Furia e il suo
// prossimo attacco fa IRA_DANNI_SFOGO danni in più, poi la Collera torna a 0 (iraDopoTiro in js/motore/speciali.js)
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const A = g.LIBRERIA.abilita;
    const MAX = g.eval('IRA_MAX');
    const SFOGO = g.eval('IRA_DANNI_SFOGO');

    const eroe = (name, extra = {}) => ({ name, hp: 4, maxHp: 4, str: 2, int: 2, fth: 2, dmg: 1, items: [], base_armor: 0,
        current_armor: 0, att_bonus: 0, def_bonus: 0, help_bonus_val: 0, att_penalty: 0, ...extra });
    const aurelio = () => {
        const h = JSON.parse(JSON.stringify(g.LIBRERIA.eroi.aurelio_dignitas));
        g.applyEffects(A.aurelio_ira_traboccante.effects, h);
        return h;
    };
    const prepara = (party, enemy = {}) => {
        stato.party = party;
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = 0;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.helpBonus = 0; stato.helpDmgBonus = 0; stato.combatRound = 1;
        stato.activeEnemy = { name: 'Lupo', hp: 30, maxHp: 30, ca: 99, att: 99, dmg: 1, ...enemy };
        return stato.activeEnemy;
    };

    t.test('scheda: Aurelio ha Fede 4, la passiva Ira Traboccante e l\'attiva Mano di Draken; gioca in Fredlös', () => {
        const h = g.LIBRERIA.eroi.aurelio_dignitas;
        t.uguale(4, h.fth);
        t.uguale('aurelio_ira_traboccante,aurelio_mano_di_draken', h.abilities.join(','));
        t.ok(A.aurelio_ira_traboccante && !A.aurelio_ira_traboccante.isCombatActive, 'passiva');
        t.ok(A.aurelio_mano_di_draken && A.aurelio_mano_di_draken.isCombatActive, 'attiva');
        t.ok(g.CAMPAIGNS_RAW.fredlos_parte_1.heroes.includes('aurelio_dignitas'), 'in Fredlös');
    });

    t.test('Mano di Draken: senza tiro cura 2 HP all\'eroe scelto, non ad Aurelio; una volta per scontro', () => {
        const a = aurelio(), b = eroe('B', { hp: 1 });
        a.chosenAbility = A.aurelio_mano_di_draken;
        a.hp = 2;
        const n = prepara([a, b]);
        t.ok(g.abilityIsInstant(a), 'senza tiro');
        t.ok(g.abilityNeedsTarget(a.chosenAbility), 'chiede a chi darla');
        a.potionTarget = 'B';
        const r = g.resolveAbility(a, n, []);
        t.ok(r.instant, 'istantanea');
        t.uguale(3, b.hp, 'B guarisce di 2');
        t.uguale(2, a.hp, 'Aurelio no');
        t.uguale(30, n.hp, 'nessun danno al nemico');
        t.ok(!a.potionTarget, 'scelta consumata');
        t.ok(!g.abilityUsable(a).ok, 'una volta per scontro');
        t.ok(!a.collera, 'senza tiro non dà Collera');
    });

    t.test('Mano di Draken: senza scelta cura Aurelio stesso, mai oltre gli HP massimi', () => {
        const a = aurelio(), b = eroe('B');
        a.chosenAbility = A.aurelio_mano_di_draken;
        a.hp = 3;
        const n = prepara([a, b]);
        g.resolveAbility(a, n, []);
        t.uguale(4, a.hp);
    });

    t.test('simulatore: Mano di Draken sul più ferito, e solo se qualcuno ha perso almeno 2 HP', () => {
        const a = aurelio(), b = eroe('B'), c = eroe('C', { hp: 2 });
        a.chosenAbility = A.aurelio_mano_di_draken;
        prepara([a, b, c]);
        t.uguale('C', g.simPotionTarget(a));
        const esperto = g.eval('SIM_PROFILES').esperto;
        c.hp = 4;
        t.ok(esperto.combatAction(a, stato.activeEnemy, { remaining: [] }) !== 'ability', 'tutti sani: non la spreca');
        c.hp = 2;
        t.uguale('ability', esperto.combatAction(a, stato.activeEnemy, { remaining: [] }));
    });

    t.test('i tiri falliti dei compagni danno Collera, che è un bonus al tiro per colpire di Aurelio', () => {
        const a = aurelio(), b = eroe('B');
        const n = prepara([a, b]);
        const r = g.resolveAttack(b, n, [2]);
        t.uguale(1, a.collera);
        t.ok(r.itemNotes.some(x => x.includes('Collera 1/')), 'nota nel diario');
        g.resolveDefend(b, n, [2]);
        t.uguale(2, a.collera, 'anche Difendi');
        t.uguale(2, g.relicCombatBonus(a).att, '+1 al tiro per carica');
        t.uguale(0, g.relicCombatBonus(b).att, 'solo per Aurelio');
        t.ok(g.heroStatuses(a).some(s => s.key === 'collera' && s.count === 2), 'icona sulla carta con le cariche');
    });

    t.test('la Collera è anche +1 a Difendi per carica, solo per Aurelio', () => {
        const a = aurelio(), b = eroe('B');
        const n = prepara([a, b], { att: 6 });
        g.resolveAttack(b, n, [2]);
        g.resolveAttack(b, n, [2]);
        t.uguale(2, g.relicDiceBonus('difesa', a), '+2 con 2 cariche');
        t.uguale(0, g.relicDiceBonus('difesa', b));
        // 2 + Forza 2 + Collera 2 = 6: la difesa contro Attacco 6 riesce
        t.ok(g.resolveDefend(a, n, [2]).success, 'difesa riuscita grazie alla Collera');
    });

    t.test('dopo l\'attacco del nemico la Collera si azzera, anche in Furia', () => {
        const a = aurelio(), b = eroe('B');
        const n = prepara([a, b], { att: 1 });
        g.resolveAttack(b, n, [2]);
        t.uguale(1, a.collera);
        const r = g.resolveEnemyTurn(n, b);
        t.ok(r.attacked);
        t.ok(!a.collera, 'Collera a 0');
        t.ok(r.events.some(ev => ev.text.includes('si placa')), 'nota nel diario');
        for (let i = 0; i < MAX; i++) g.resolveAttack(b, n, [2]);
        t.ok(a.iraSfogo && !g.combatActionAllowed(a, 'defend').ok, 'in Furia');
        g.resolveEnemyTurn(n, b);
        t.ok(!a.collera && !a.iraSfogo, 'Furia finita');
        t.ok(g.combatActionAllowed(a, 'defend').ok, 'può di nuovo difendere');
    });

    t.test('i successi non danno Collera', () => {
        const a = aurelio(), b = eroe('B');
        const n = prepara([a, b], { ca: 2 });
        g.resolveAttack(b, n, [6]);
        t.ok(!a.collera, 'niente Collera');
    });

    t.test(`a ${MAX} cariche va in Furia: può solo attaccare, l'attacco fa +${SFOGO} danni e la Collera torna a 0`, () => {
        const a = aurelio(), b = eroe('B');
        const n = prepara([a, b]);
        for (let i = 0; i < MAX; i++) g.resolveHelp(b, n, [2]);
        t.uguale(MAX, a.collera);
        t.ok(a.iraSfogo, 'sfogo pronto');
        t.ok(!g.combatActionAllowed(a, 'defend').ok, 'niente Difendi in Furia');
        g.resolveHelp(b, n, [2]);
        t.uguale(MAX, a.collera, 'non supera il massimo');
        n.ca = 2;
        const prima = n.hp;
        const r = g.resolveAttack(a, n, [6]);
        t.ok(r.hit, 'colpisce');
        t.uguale(a.dmg + SFOGO, prima - n.hp, 'danni dello sfogo');
        t.uguale(0, a.collera, 'Collera azzerata');
        t.ok(!a.iraSfogo && g.combatActionAllowed(a, 'defend').ok, 'la Furia finisce');
    });

    t.test('lo sfogo mancato azzera lo stesso la Collera e non conta come nuovo errore', () => {
        const a = aurelio(), b = eroe('B');
        const n = prepara([a, b]);
        for (let i = 0; i < MAX; i++) g.resolveAttack(b, n, [2]);
        g.resolveAttack(a, n, [2]);
        t.uguale(0, a.collera);
    });

    t.test('a inizio e fine scontro la Collera si azzera', () => {
        const a = aurelio(), b = eroe('B');
        const n = prepara([a, b]);
        g.resolveAttack(b, n, [2]);
        g.expireTempBuffs(true);
        t.ok(!a.collera, 'fine scontro');
        g.resolveAttack(b, n, [2]);
        g.startCombatSpecials();
        t.ok(!a.collera, 'inizio scontro');
    });

    t.test('senza la passiva nessuno accumula Collera', () => {
        const a = eroe('A'), b = eroe('B');
        const n = prepara([a, b]);
        g.resolveAttack(b, n, [2]);
        t.ok(!a.collera && !b.collera);
    });
};
