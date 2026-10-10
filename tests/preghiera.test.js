// Preghiera ai riposi: d6 + Fede contro PRAYER_CD, benedizioni per un eroe o per tutta la compagnia
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const eroe = (name, extra = {}) => ({ name, hp: 4, maxHp: 6, str: 2, int: 2, fth: 2, dmg: 1, items: [],
        base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, ...extra });
    const prepara = party => {
        stato.party = party;
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = 0;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.combatRound = 1;
        return party;
    };
    // Dado truccato per il prossimo tiro: senza sacchetto (DICE_BAG.size = 0) il tiro viene da Math.random
    const dado = v => g.eval(`globalThis.__vero = Math.random; globalThis.__bag = DICE_BAG.size; DICE_BAG.size = 0; Math.random = () => ${(v - 1) / 6 + 0.01}`);
    const dadoVero = () => g.eval('Math.random = globalThis.__vero; DICE_BAG.size = globalThis.__bag');

    t.test('tiro: serve 7 con d6 + Fede; con 9 o un 6 la benedizione è maggiore', () => {
        const [a] = prepara([eroe('A', { fth: 2 })]);
        dado(4); const r1 = g.prayerRoll(a); dadoVero();
        t.ok(!r1.success, '4 + 2 = 6');
        dado(6); const r2 = g.prayerRoll(a); dadoVero();
        t.ok(r2.success && r2.major, '6 naturale');
        a.fth = 4;
        dado(3); const r3 = g.prayerRoll(a); dadoVero();
        t.ok(r3.success && !r3.major, '3 + 4 = 7: minore');
        dado(1); const r4 = g.prayerRoll(eroe('B', { fth: 9 })); dadoVero();
        t.ok(!r4.success, 'un 1 fallisce sempre');
    });

    t.test('si pescano benedizioni del livello giusto, solo quelle utili adesso', () => {
        prepara([eroe('A', { hp: 6 })]);   // nessun ferito, nessuna maledizione
        for (let i = 0; i < 20; i++) {
            const minori = g.pickBlessings(false);
            t.uguale(g.eval('PRAYER_CHOICES'), minori.length);
            t.ok(minori.every(b => b.livello === 'minore' && b.id !== 'veglia' && b.id !== 'purificazione'));
            t.ok(g.pickBlessings(true).every(b => b.livello === 'maggiore' && b.id !== 'miracolo'));
        }
    });

    t.test('benedizione per un eroe: solo lui, visibile sulla carta; al prossimo scontro diventa un potenziamento', () => {
        const [a, b] = prepara([eroe('A'), eroe('B')]);
        g.applyBlessing(g.eval('blessingData')('lama_consacrata'), a);
        g.applyBlessing(g.eval('blessingData')('scudo_della_fede'), a);
        t.ok(g.heroBlessingsHtml(a).includes('BTNHolyBolt'), 'icona sulla carta');
        t.uguale('', g.heroBlessingsHtml(b));
        g.applyCombatBlessings();
        t.uguale([2, 2], [a.dmg, a.current_armor]);
        t.uguale([1, 0], [b.dmg, b.current_armor]);
        t.uguale([], a.blessings, 'usate');
        g.expireTempBuffs(true);
        t.uguale(1, a.dmg, 'finito lo scontro il danno torna come prima');
    });

    t.test('Grazia: la prima volta che andrebbe a 0 HP torna con 2 HP, poi non più', () => {
        const [a] = prepara([eroe('A', { hp: 1 })]);
        stato.party.atamanoUsed = true;
        g.applyBlessing(g.eval('blessingData')('grazia'), a);
        const nemico = { name: 'N', dmg: 3 };
        g.resolveMonsterAttack(nemico, a);
        t.uguale(2, a.hp);
        t.ok(!g.eval('hasBlessing')(a, 'grazia'));
        g.resolveMonsterAttack(nemico, a);
        t.uguale(0, a.hp);
    });

    t.test('Fede incrollabile: +1 Fede per sempre; Miracolo e Purificazione valgono per tutta la compagnia', () => {
        const [a, b] = prepara([eroe('A'), eroe('B', { hp: 0 })]);
        g.applyBlessing(g.eval('blessingData')('fede_incrollabile'), a);
        t.uguale(3, a.fth);
        g.applyBlessing(g.eval('blessingData')('miracolo'));
        t.uguale([6, 6], [a.hp, b.hp], 'anche il caduto');
        stato.activeCurses = [{ id: 'x', text: 'X (prova)' }];
        g.applyBlessing(g.eval('blessingData')('purificazione'));
        t.uguale(0, stato.activeCurses.length);
    });

    t.test('riposo: un eroe solo prega una volta, poi sceglie la benedizione e a chi darla', () => {
        const [a, b] = prepara([eroe('A', { fth: 3 }), eroe('B')]);
        g.eval('restsData = {}');
        g.startRest('default');
        t.ok(g.eval('restPrayer') === null);
        dado(6); g.prayAtRest('A'); dadoVero();
        const p = g.eval('restPrayer');
        t.ok(p.success && p.major && p.choices.length);
        dado(6); g.prayAtRest('B'); dadoVero();
        t.uguale('A', g.eval('restPrayer').hero, 'una sola preghiera per riposo');
        const idx = p.choices.findIndex(c => c.bersaglio === 'eroe');
        g.chooseBlessing(idx);
        g.giveBlessing('B');
        t.ok(g.eval('hasBlessing')(b, p.choices[idx].id) || p.choices[idx].effetto === 'fede', 'va a B');
        t.ok(p.text, 'fatto');
    });

    t.test('simulatore: al riposo prega l\'eroe con più Fede', () => {
        const [a, b] = prepara([eroe('A', { fth: 1 }), eroe('B', { fth: 3 })]);
        dado(6); g.simPray(); dadoVero();
        t.ok([a, b].some(h => (h.blessings || []).length) || b.fth === 4 || a.hp === 6);
    });
};
