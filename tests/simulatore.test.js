// Simulatore: profilo Esperto e ricerca a simulazioni (fotografia della partita, scelte che non cambiano lo stato)
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const eroe = (name, extra = {}) => ({ name, hp: 4, maxHp: 4, str: 2, int: 2, fth: 2, dmg: 1, items: [],
        base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, ...extra });

    t.test('Esperto: il colpo del nemico va su chi perde meno senza cadere', () => {
        const a = eroe('A', { hp: 1 }), b = eroe('B', { hp: 4, current_armor: 2 }), c = eroe('C', { hp: 3 });
        t.uguale('B', g.simExpertTarget([a, b, c], 2).name, 'l\'armatura assorbe tutto');
        t.uguale('C', g.simExpertTarget([a, eroe('B', { hp: 2 }), c], 2).name, 'a parità di danno, chi resta con più HP');
    });

    t.test('Esperto: chi cadrebbe al prossimo colpo si difende', () => {
        const a = eroe('A', { hp: 2, str: 3 }), b = eroe('B', { hp: 4, str: 3 });
        stato.party = [a, b];
        stato.unlockedRelics = []; stato.activeCurses = [];
        stato.stsMapNodes = [{ id: 1, level: 0, type: 'combat' }, { id: 2, level: 5, type: 'combat' }];
        stato.currentNodeId = 1;
        stato.helpBonus = 0; stato.helpDmgBonus = 0;
        // Il nemico punta il più debole (Predatore): A
        stato.activeEnemy = { name: 'N', hp: 10, maxHp: 10, att: 5, ca: 8, dmg: 2, turnoAzione: { turnoBersaglio: 'piu_debole' } };
        t.uguale('defend', g.simExpertAction(a, stato.activeEnemy, { remaining: [b] }));
        t.ok(g.simExpertAction(b, stato.activeEnemy, { remaining: [] }) !== 'defend', 'B non è il bersaglio');
    });

    t.test('fotografia della partita: si rimette tutto, anche i segni appesi alla compagnia', () => {
        stato.party = [eroe('A')];
        stato.party.specialUses = { scontro: {}, capitolo: { 'r:sigillo_runico#0': 1 } };
        stato.party.lootExtraChoices = 1;
        stato.partyCoins = 7; stato.unlockedRelics = []; stato.activeCurses = [];
        stato.stsMapNodes = [{ id: 1, level: 0, type: 'rest', next: [] }];
        stato.expeditionStats = g.eval('newExpeditionStats()');
        const snap = g.simSnapshot({ visitCounts: { rest: 2 } });
        stato.party[0].hp = 0; stato.partyCoins = 0; stato.party = [];
        const ctx = g.simRestore(snap);
        t.uguale([4, 7, 1, 1], [stato.party[0].hp, stato.partyCoins, stato.party.specialUses.capitolo['r:sigillo_runico#0'], stato.party.lootExtraChoices]);
        t.uguale(2, ctx.visitCounts.rest);
    });

    t.test('ricerca a simulazioni: sceglie un nodo della partita attuale e la lascia com\'era', () => {
        const id = Object.keys(g.CAMPAIGNS).find(k => g.CAMPAIGNS[k].heroes && g.CAMPAIGNS[k].heroes.length && !g.CAMPAIGNS[k].procedurale);
        const data = g.simCampaignData(id);
        const sel = data.heroes.slice(0, 3).map(h => ({ name: h.name, abilityIdx: 0, itemIdx: -1 }));
        const profilo = g.simLookaheadProfile(g.eval('SIM_PROFILES').esperto, 2);
        // Prima partita giocata fino in fondo: nessun errore, esito vero o falso
        const res = g.simRunOne(data, sel, profilo);
        t.ok(typeof res.victory === 'boolean');
        // Una scelta a un bivio non tocca lo stato
        g.simRunOne(data, sel, g.eval('SIM_PROFILES').esperto);  // prepara le variabili della campagna
        stato.stsMapNodes = JSON.parse(JSON.stringify(data.mapNodes));
        g.simBuildParty(data, sel);
        stato.partyCoins = 0; stato.unlockedRelics = []; stato.activeCurses = [];
        stato.expeditionStats = g.eval('newExpeditionStats()');
        const aperti = stato.stsMapNodes.filter(n => n.active && !n.done);
        const ctx = { visitCounts: {}, lootRotationIdx: 0, monsterTargetRotationIdx: 0 };
        const prima = g.simSnapshot(ctx);
        const scelto = profilo.chooseNode(aperti, ctx);
        t.ok(stato.stsMapNodes.includes(scelto), 'nodo della partita di adesso');
        t.uguale(prima, g.simSnapshot(ctx), 'stato com\'era');
    });

    t.test('misure degli scontri: una partita riporta round e HP persi di ogni scontro (tools/difficolta.mjs e tools/scontro.mjs)', () => {
        const id = Object.keys(g.CAMPAIGNS)[0];
        const data = g.simCampaignData(id);
        const sel = data.heroes.slice(0, 3).map(h => ({ name: h.name, abilityIdx: 0, itemIdx: data.armory.length ? 0 : -1 }));
        const res = g.simRunOne(data, sel, g.eval('SIM_PROFILES').esperto);
        t.ok(Array.isArray(res.scontri) && res.scontri.length > 0, `scontri registrati: ${res.scontri.length}`);
        res.scontri.forEach(s => {
            t.ok(s.rounds >= 1, `round ${s.rounds}`);
            t.ok(s.hpPersi >= 0, `HP persi ${s.hpPersi}`);
            t.ok(typeof s.vinto === 'boolean' && typeof s.elite === 'boolean' && s.enemy, 'campi completi');
        });
    });
};
