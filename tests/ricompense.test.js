// Ricompense delle sfide non troppo grandi: il +1 alle prove vale per 2 prove, poi la reliquia si consuma
module.exports = (t, carica) => {
    t.test('reliquie "+1 alle prove": valgono per 2 prove, poi si consumano', () => {
        const g = carica();
        const lib = g.LIBRERIA;
        ['polvere_boreale', 'lamina_astrale_celestica', 'manoscritti_firmamentisti'].forEach(id => {
            const s = lib.reliquie[id].speciali[0];
            t.uguale({ quando: 'prova', fai: 'bonus_tiro', val: 1, limite: 'capitolo', volte: 2, rompe: true }, s, id);
        });
        const stato = g.eval('stato');
        stato.unlockedRelics = [{ id: 'polvere_boreale', ...lib.reliquie.polvere_boreale }]; stato.activeCurses = []; stato.partyCoins = 0;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.stsMapNodes = [{ id: 0, level: 1, type: 'challenge', next: [1] }, { id: 1, level: 2, type: 'combat', next: [] }];
        stato.currentNodeId = 0;
        const a = { name: 'A', hp: 4, maxHp: 4, str: 2, int: 2, fth: 2, dmg: 1, items: [], base_armor: 0, current_armor: 0 };
        stato.party = [a];
        // CD 5 con Intelligenza 2: con 2 sul dado riesce solo con il +1 della Polvere
        const sfida = { stat: 'int', cd: 5, reward: null, punishment: null };
        stato.challengeState = sfida;
        t.ok(g.resolveChallenge(a, sfida, [2]).success, 'prima prova: +1');
        t.ok(g.resolveChallenge(a, sfida, [2]).success, 'seconda prova: +1');
        t.ok(!stato.unlockedRelics.some(r => r.id === 'polvere_boreale'), 'poi si consuma');
        t.ok(!g.resolveChallenge(a, sfida, [2]).success, 'terza prova: niente bonus');
    });

    t.test('reliquie che davano +1 a tutti: ora +1 a un eroe solo (chi supera la prova)', () => {
        const g = carica();
        const R = g.LIBRERIA.reliquie;
        Object.entries(R).forEach(([id, r]) => t.ok(!(r.effects || []).some(e => e.effect === 'party_stat' && e.val > 0), `${id}: niente +statistica a tutti`));
        const stato = g.eval('stato');
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = 0;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.stsMapNodes = [{ id: 0, level: 1, type: 'challenge', next: [1] }, { id: 1, level: 2, type: 'combat', next: [] }];
        stato.currentNodeId = 0;
        const eroe = (name, fth) => ({ name, hp: 4, maxHp: 4, str: 2, int: 2, fth, dmg: 1, items: [], base_armor: 0, current_armor: 0 });
        const a = eroe('A', 3), b = eroe('B', 1), c = eroe('C', 2);
        stato.party = [a, b, c];
        const sfida = { stat: 'int', cd: 2, reward: { id: 'benedizione_del_primigenio', ...R.benedizione_del_primigenio } };
        stato.challengeState = sfida;
        g.resolveChallenge(a, sfida, [6]);
        t.uguale([4, 1, 2], [a.fth, b.fth, c.fth], 'solo chi ha superato la prova');
        // Fuori da una prova (bottino degli elite, mercante): all'eroe in piedi con la statistica più bassa
        stato.unlockedRelics = [];
        g.grantRelic('lanterna_dei_morti');
        t.uguale([4, 2, 2], [a.fth, b.fth, c.fth]);
    });

    t.test('Bussola dell\'Occhio Cieco: +1 ai prossimi 6 tiri, poi si rompe', () => {
        const g = carica();
        t.uguale([{ quando: 'tiro', fai: 'bonus_tiro', val: 1, limite: 'capitolo', volte: 6, rompe: true }], g.LIBRERIA.reliquie.frammento_di_yr_drazul.speciali);
    });
};
