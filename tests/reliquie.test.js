// Reliquie e maledizioni per id: le chiavi della libreria, quelle usate nel codice, premi e punizioni delle sfide
const fs = require('fs');
const path = require('path');
const { ROOT } = require('./ambiente');

// Reliquie con un effetto nel codice ma (ancora) senza scheda nella libreria: dovrebbe restare vuoto
const ORFANE = [];

module.exports = (t, carica) => {
    const g = carica();
    const lib = g.LIBRERIA;

    t.test('Anello del giuramento (+3) e Sigillo runico (+2) valgono per i prossimi tiri di dado, di qualsiasi tipo', () => {
        const stato = g.eval('stato');
        const eroe = { name: 'A', hp: 4, maxHp: 4, str: 2, dmg: 1, current_armor: 0, items: [] };
        const nemico = { name: 'N', hp: 20, maxHp: 20, att: 20, ca: 20, dmg: 1 };
        stato.party = [eroe]; stato.party.sigilloCharges = 0; stato.helpBonus = 0; stato.combatRound = 1;
        stato.stsMapNodes = []; stato.currentNodeId = null; stato.activeCurses = [];
        stato.unlockedRelics = [{ id: 'anello_del_giuramento' }, { id: 'sigillo_runico' }];
        t.uguale(5, g.relicDiceBonus(), 'anteprima: +3 +2, senza consumarle');
        const r1 = g.resolveDefend(eroe, nemico, [3]);
        t.uguale(3 + 2 + 5, r1.total, 'difesa: dado 3 + Forza 2 + 5');
        t.ok(!g.hasRelic('anello_del_giuramento'), "l'Anello si rompe dopo un tiro");
        t.ok(g.hasRelic('sigillo_runico'), 'al Sigillo resta un tiro');
        const r2 = g.resolveAttack(eroe, nemico, [3]);
        t.uguale(3 + 2 + 2, r2.total, 'attacco: solo il Sigillo');
        t.ok(!g.hasRelic('sigillo_runico'), 'il Sigillo si rompe dopo il secondo tiro');
        t.uguale(3 + 2, g.resolveHelp(eroe, nemico, [3]).total, 'poi niente bonus');
    });

    t.test('la Mannaia Pesante è epica', () => t.uguale('epico', lib.armeria.mannaia_pesante.rarity));

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
