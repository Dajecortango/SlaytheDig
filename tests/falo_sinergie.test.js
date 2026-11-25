// Attività al falò (al posto della preghiera) e sinergie della Famiglia (solo campagne con "sinergie")
module.exports = (t, carica) => {
    const g = carica();
    const lib = g.LIBRERIA;

    const prepara = (party, coins = 0) => {
        const stato = g.eval('stato');
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = coins;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.party = party;
        return stato;
    };
    const eroe = (name, extra = {}) => ({ name, hp: 4, maxHp: 4, str: 2, int: 1, fth: 1, dmg: 1, base_armor: 0, current_armor: 0, items: [], ...extra });
    const cfg = g.eval('REST_ACTIVITIES');

    t.test('falò: veglia cura solo un eroe ferito e scelto', () => {
        const a = eroe('A', { hp: 1 }), b = eroe('B', { hp: 2 });
        prepara([a, b]);
        t.ok(g.doRestActivity('veglia', { hero: 'A' }), 'veglia fatta');
        t.uguale(Math.min(4, 1 + cfg.veglia.hp), a.hp);
        t.uguale(2, b.hp, 'l\'altro resta com\'era');
    });

    t.test('falò: veglia non si fa se nessuno è ferito', () => {
        prepara([eroe('A'), eroe('B')]);
        const v = g.restActivities().find(x => x.id === 'veglia');
        t.ok(v.blocco, 'bloccata');
        t.ok(!g.doRestActivity('veglia', { hero: 'A' }), 'rifiutata');
    });

    t.test('falò: lama affilata vale per il prossimo scontro e poi sparisce', () => {
        const a = eroe('A');
        prepara([a]);
        t.ok(g.doRestActivity('affilare', { hero: 'A' }));
        const stat = cfg.affilare.stat, prima = a[stat];
        const usati = g.applyCombatBlessings();
        t.uguale(prima + cfg.affilare.val, a[stat], 'potenziamento a inizio scontro');
        t.ok(usati.some(u => u.hero === a), 'riga nel diario');
        g.expireTempBuffs(true);
        t.uguale(prima, a[stat], 'finito lo scontro torna come prima');
        g.applyCombatBlessings();
        t.uguale(prima, a[stat], 'non vale per lo scontro dopo');
    });

    t.test('falò: allenarsi costa Scudi, dà +1 permanente, al massimo come da regole', () => {
        const a = eroe('A');
        const stato = prepara([a], cfg.allenarsi.costo * 5);
        t.ok(g.doRestActivity('allenarsi', { hero: 'A', stat: 'str' }));
        t.uguale(3, a.str);
        t.uguale(cfg.allenarsi.costo * 4, stato.partyCoins);
        for (let i = 1; i < cfg.allenarsi.massimo; i++) g.doRestActivity('allenarsi', { hero: 'A', stat: 'str' });
        t.ok(!g.doRestActivity('allenarsi', { hero: 'A', stat: 'str' }), 'oltre il massimo rifiutato');
    });

    t.test('falò: allenarsi senza Scudi bloccato, statistica non ammessa rifiutata', () => {
        prepara([eroe('A')], 0);
        t.ok(g.restActivities().find(x => x.id === 'allenarsi').blocco, 'senza Scudi');
        const stato = prepara([eroe('A')], 999);
        t.ok(!g.doRestActivity('allenarsi', { hero: 'A', stat: 'maxHp' }), 'maxHp non si allena');
        t.uguale(999, stato.partyCoins, 'niente pagato');
    });

    t.test('falò: purificarsi toglie la maledizione scelta e costa HP', () => {
        const a = eroe('A', { hp: 3 });
        const stato = prepara([a]);
        stato.activeCurses = [{ id: 'x', text: 'Prima' }, { id: 'y', text: 'Seconda' }];
        t.ok(g.doRestActivity('purificarsi', { hero: 'A', curse: 1 }));
        t.uguale(3 - cfg.purificarsi.hp, a.hp);
        t.uguale(1, stato.activeCurses.length);
        t.uguale('x', stato.activeCurses[0].id);
        const b = eroe('B', { hp: cfg.purificarsi.hp });
        prepara([b]).activeCurses = [{ id: 'x', text: 'Prima' }];
        t.ok(!g.doRestActivity('purificarsi', { hero: 'B', curse: 0 }), 'chi resterebbe a 0 HP non può');
    });

    t.test('sinergie: niente senza il campo "sinergie" della campagna', () => {
        const ids = g.eval('SINERGIE')[0].eroi.slice(0, 4);
        const party = ids.map(id => ({ ...JSON.parse(JSON.stringify(lib.eroi[id])), libId: id }));
        prepara(party);
        t.uguale(0, g.applicaSinergie({ id: 'x' }).length);
        t.uguale(0, g.applicaSinergie(null).length);
    });

    t.test('sinergie: con abbastanza eroi dello stesso gruppo, il bonus va a ognuno di loro', () => {
        const s = g.eval('SINERGIE')[0];
        const soglia = s.soglie[0];
        const ids = s.eroi.slice(0, soglia.n);
        const altro = Object.keys(lib.eroi).find(id => !s.eroi.includes(id));
        const party = ids.concat(altro).map(id => ({ ...JSON.parse(JSON.stringify(lib.eroi[id])), libId: id }));
        const prima = party.map(h => ({ ...h }));
        prepara(party);
        const righe = g.applicaSinergie({ sinergie: true });
        t.uguale(1, righe.length);
        t.uguale(s.id, righe[0].id);
        soglia.effects.forEach(e => {
            party.slice(0, soglia.n).forEach((h, i) => t.uguale((prima[i][e.stat] || 0) + e.val, h[e.stat], `${h.name} ${e.stat}`));
            t.uguale(prima[soglia.n][e.stat] || 0, party[soglia.n][e.stat] || 0, 'chi è fuori dal gruppo non cambia');
        });
    });

    t.test('sinergie: sotto la soglia nessun bonus; il Drakengrad le ha accese', () => {
        const s = g.eval('SINERGIE')[0];
        const ids = s.eroi.slice(0, s.soglie[0].n - 1);
        prepara(ids.map(id => ({ ...JSON.parse(JSON.stringify(lib.eroi[id])), libId: id })));
        t.uguale(0, g.applicaSinergie({ sinergie: true }).length);
        t.ok(g.CAMPAIGNS.drakengrad.sinergie === true, 'Drakengrad');
        t.ok(Object.values(g.CAMPAIGNS).filter(c => c.sinergie).length === 1, 'solo il Drakengrad');
        g.eval('SINERGIE').forEach(x => x.eroi.forEach(id => t.ok(lib.eroi[id], `eroe ${id} della sinergia ${x.id} esiste`)));
    });
};
