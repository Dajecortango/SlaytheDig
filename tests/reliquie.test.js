// Reliquie e maledizioni per id: le chiavi della libreria, quelle usate nel codice, premi e punizioni delle sfide
const fs = require('fs');
const path = require('path');
const { ROOT } = require('./ambiente');

// Reliquie con un effetto nel codice ma (ancora) senza scheda nella libreria: dovrebbe restare vuoto
const ORFANE = [];

module.exports = (t, carica) => {
    const g = carica();
    const lib = g.LIBRERIA;

    t.test('idFromName dà le stesse chiavi della libreria (reliquie e maledizioni)', () => {
        for (const [id, r] of Object.entries(lib.reliquie)) t.uguale(id, g.idFromName(r.name), `reliquia "${r.name}"`);
        for (const [id, c] of Object.entries(lib.maledizioni)) t.uguale(id, g.idFromName(c.name), `maledizione "${c.name}"`);
    });

    t.test('ogni id usato nel codice esiste nella libreria (o è tra le reliquie orfane note)', () => {
        const codice = ['js/game.js', 'js/combattimento.js', 'js/loot.js', 'js/shop.js', 'js/simulator.js']
            .map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
        const relic = [...codice.matchAll(/(?:hasRelic|breakRelic)\('([^']+)'\)/g)].map(m => m[1]);
        const curse = [...codice.matchAll(/hasCurse\('([^']+)'\)/g)].map(m => m[1]);
        // relicCombatBonus usa i nomi (convertiti con idFromName)
        const daNomi = [...codice.matchAll(/\badd\((?:stato\.combatRound === \d+|isElite), "([^"]+)"/g)].map(m => g.idFromName(m[1]));
        t.ok(daNomi.length >= 5, `trovate solo ${daNomi.length} reliquie in relicCombatBonus`);
        for (const id of [...relic, ...daNomi]) t.ok(lib.reliquie[id] || ORFANE.includes(id), `reliquia sconosciuta: ${id}`);
        for (const id of curse) t.ok(lib.maledizioni[id], `maledizione sconosciuta: ${id}`);
        const orfaneTrovate = ORFANE.filter(id => !lib.reliquie[id]);
        if (orfaneTrovate.length) t.avviso(`reliquie con effetto nel codice ma senza scheda: ${orfaneTrovate.join(', ')}`);
    });

    t.test('premio di una sfida: la reliquia entra con il suo id; il premio in monete non diventa una reliquia', () => {
        const stato = g.eval('stato');
        stato.party = [{ name: 'A', int: 30, fth: 30, str: 30, hp: 4 }];
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = 0;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        const conRelic = { stat: 'int', cd: 2, reward: { id: 'corno_antico', ...lib.reliquie.corno_antico }, punishment: null };
        stato.challengeState = { stat: 'int', challenge: conRelic };
        g.resolveChallenge(stato.party[0], conRelic, [6]);
        t.ok(g.hasRelic('corno_antico'), 'reliquia per id');
        const monete = { stat: 'int', cd: 2, reward: { type: 'coins', name: '15 Monete', desc: '', effects: [{ effect: 'coins', val: 15 }] } };
        g.resolveChallenge(stato.party[0], monete, [6]);
        t.uguale(1, stato.unlockedRelics.length, 'le monete non vanno tra le reliquie');
        t.uguale(15, stato.partyCoins);
    });

    t.test('punizione di una sfida: la maledizione prende l\'id della libreria', () => {
        const stato = g.eval('stato');
        stato.party = [{ name: 'A', int: 0, fth: 0, str: 0, hp: 4 }];
        stato.unlockedRelics = []; stato.activeCurses = [];
        stato.expeditionStats = g.eval('newExpeditionStats()');
        for (const id of ['presagio_di_morte', '15_ricompensa_monete', 'sbornia_pesante']) {
            const sfida = { stat: 'int', cd: 99, reward: null, punishment: { id, ...lib.maledizioni[id] } };
            stato.challengeState = { stat: 'int', challenge: sfida };
            g.resolveChallenge(stato.party[0], sfida, [2]);
            t.ok(g.hasCurse(id), `maledizione ${id}`);
        }
        t.uguale(3, stato.activeCurses.length);
        t.ok(stato.activeCurses.every(c => typeof c.text === 'string'), 'ogni maledizione ha il testo da mostrare');
    });
};
