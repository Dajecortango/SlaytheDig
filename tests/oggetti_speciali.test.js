// Oggetti non comuni con un effetto speciale (campi dell'armeria letti dal motore, elenco ITEM_SPECIALS in js/comune.js)
module.exports = (t, carica) => {
    const g = carica();
    const lib = g.LIBRERIA;

    const oggetto = id => JSON.parse(JSON.stringify(lib.armeria[id]));
    const eroe = (nome, extra = {}) => ({ name: nome, hp: 4, maxHp: 4, str: 2, int: 2, fth: 2, dmg: 1, items: [], base_armor: 0, current_armor: 0, def_bonus: 0, help_bonus_val: 0, att_bonus: 0, att_penalty: 0, ...extra });
    const prepara = () => {
        const stato = g.eval('stato');
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = 0;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.stsMapNodes = [{ id: 0, level: 1, type: 'combat', next: [1] }, { id: 1, level: 2, type: 'combat', next: [] }];
        stato.currentNodeId = 0;
        stato.helpBonus = 0; stato.helpDmgBonus = 0; stato.combatRound = 1;
        g.eval("currentScreenId = 'screenMap'");
        return stato;
    };
    const nemico = (extra = {}) => ({ name: 'Lupo', hp: 10, maxHp: 10, ca: 4, att: 4, dmg: 1, ...extra });

    const NUOVI = ['corno_allman', 'ascia_primo_sangue', 'mazza_boia_seistad', 'scudo_spina_kranen', 'catena_ghiacceterno',
        'talismano_corvo', 'mappa_contrabbandiere', 'dado_osso_gunnar', 'lingua_argento', 'occhio_gazza', 'coperta_rurikstad', 'erbario_fonnish'];

    t.test('i 12 oggetti nuovi sono non comuni, con icona, e stanno nel bottino', () => {
        NUOVI.forEach(id => {
            const it = lib.armeria[id];
            t.ok(it, `${id} esiste`);
            if (!it) return;
            t.uguale('non_comune', it.rarity, id);
            t.ok(it.icon && it.desc, `${id}: icona e descrizione`);
            t.ok(lib.lootPredefinito.includes(id), `${id} nel bottino predefinito`);
            t.ok(g.eval('ITEM_SPECIALS').some(s => it[s.k]), `${id}: ha un effetto speciale conosciuto`);
        });
    });

    t.test('Corno da Guerra di Allmän: +1 al tiro per colpire a tutti nel primo round, poi scade', () => {
        const stato = prepara();
        const a = eroe('A', { items: [oggetto('corno_allman')] }), b = eroe('B');
        stato.party = [a, b];
        stato.combatRound = 0;
        g.startCombatItemEffects();
        stato.combatRound = 1;
        t.uguale(1, a.att_bonus); t.uguale(1, b.att_bonus, 'anche chi non ha il corno');
        stato.combatRound = 2;
        g.expireTempBuffs();
        t.uguale(0, a.att_bonus); t.uguale(0, b.att_bonus);
    });

    t.test('Ascia del Primo Sangue: +2 danni solo al primo colpo a segno dello scontro', () => {
        const stato = prepara();
        const a = eroe('A', { items: [oggetto('ascia_primo_sangue')] });
        stato.party = [a];
        g.startCombatItemEffects();
        const n = nemico({ ca: 6 });
        t.uguale(0, g.resolveAttack(a, n, [2]).dmg, 'mancato: non consuma');
        t.uguale(3, g.resolveAttack(a, n, [5]).dmg, 'primo colpo: 1 + 2');
        t.uguale(1, g.resolveAttack(a, n, [5]).dmg, 'secondo colpo: 1');
        g.startCombatItemEffects();
        t.uguale(3, g.resolveAttack(a, nemico(), [5]).dmg, 'nuovo scontro');
    });

    t.test('Mazza del Boia di Seistad: +2 danni se il nemico ha metà vita o meno', () => {
        const stato = prepara();
        const a = eroe('A', { items: [oggetto('mazza_boia_seistad')] });
        stato.party = [a];
        g.startCombatItemEffects();
        t.uguale(1, g.resolveAttack(a, nemico({ hp: 6 }), [5]).dmg);
        t.uguale(3, g.resolveAttack(a, nemico({ hp: 5 }), [5]).dmg);
    });

    t.test('Catena di Ghiacceterno: il primo colpo a segno stordisce, senza danni in più', () => {
        const stato = prepara();
        const a = eroe('A', { items: [oggetto('catena_ghiacceterno')] });
        stato.party = [a];
        g.startCombatItemEffects();
        const n = nemico();
        const res = g.resolveAttack(a, n, [5]);
        t.uguale(1, res.dmg); t.ok(n.isStunned, 'stordito');
        n.isStunned = false;
        g.resolveAttack(a, n, [5]);
        t.ok(!n.isStunned, 'una volta per scontro');
    });

    t.test('Scudo a Spina di Kranen: chi ha difeso nel round fa 1 danno al nemico che lo colpisce', () => {
        const stato = prepara();
        const a = eroe('A', { items: [oggetto('scudo_spina_kranen')] });
        stato.party = [a];
        const n = nemico();
        g.resolveDefend(a, n, [1]);
        g.resolveEnemyTurn(n, a);
        t.uguale(9, n.hp, 'spina');
        stato.combatRound = 2;
        g.resolveEnemyTurn(n, a);
        t.uguale(9, n.hp, 'nel round dopo non ha difeso');
    });

    t.test('Talismano del Corvo: se cade un alleato +1 Forza fino a fine scontro', () => {
        const stato = prepara();
        const a = eroe('A', { items: [oggetto('talismano_corvo')] }), b = eroe('B', { hp: 1 });
        stato.party = [a, b];
        g.resolveMonsterAttack(nemico({ dmg: 3 }), b);
        t.uguale(0, b.hp);
        t.uguale(3, a.str);
        g.expireTempBuffs(true);
        t.uguale(2, a.str, 'a fine scontro torna');
    });

    t.test('Dado d\'Osso di Gunnar: un tiro fallito per scontro si ritira', () => {
        const stato = prepara();
        const a = eroe('A', { items: [oggetto('dado_osso_gunnar')] });
        stato.party = [a];
        g.startCombatItemEffects();
        const res = g.resolveAttack(a, nemico(), [1, 5]);
        t.ok(res.hit, 'ritirato e colpito'); t.uguale(5, res.roll);
        t.ok(!g.resolveAttack(a, nemico(), [1, 5]).hit, 'una volta per scontro');
        g.startCombatItemEffects();
        t.ok(g.resolveDefend(a, nemico(), [1, 6]).success, 'vale anche per Difendi');
    });

    t.test('Mappa del Contrabbandiere: una prova fallita non punisce, poi la mappa sparisce', () => {
        const stato = prepara();
        const a = eroe('A', { int: 0, items: [oggetto('mappa_contrabbandiere')] });
        stato.party = [a];
        const sfida = { stat: 'int', cd: 99, reward: null, punishment: { type: 'curse', name: 'Gelo nelle ossa', desc: 'x', effects: [] } };
        stato.challengeState = sfida;
        const res = g.resolveChallenge(a, sfida, [2]);
        t.ok(!res.success && !res.punishmentApplied, 'niente punizione');
        t.uguale(0, stato.activeCurses.length);
        t.uguale(0, a.items.length, 'la mappa si consuma');
        t.ok(g.resolveChallenge(a, sfida, [2]).punishmentApplied, 'la seconda volta punisce');
    });

    t.test('Lingua d\'Argento: +1 al tiro per contrattare', () => {
        prepara();
        const a = eroe('A', { int: 2, items: [oggetto('lingua_argento')] });
        t.uguale(6, g.haggleRollTotal(a, 3));
        t.uguale(5, g.haggleRollTotal(eroe('B', { int: 2 }), 3));
    });

    t.test('Occhio di Gazza: una carta in più al primo bottino di un elite, una volta per capitolo', () => {
        const stato = prepara();
        g.eval("gameItems = LIBRERIA.lootPredefinito.map(id => LIBRERIA.armeria[id])");
        stato.party = [eroe('A', { items: [oggetto('occhio_gazza')] })];
        t.uguale(3, g.pickLootChoices(false).length, 'scontro normale: no');
        t.uguale(4, g.pickLootChoices(true).length, 'elite: una in più');
        t.uguale(3, g.pickLootChoices(true).length, 'una volta sola');
    });

    t.test('Coperta di Lana di Rurikstad: +1 HP al riposo per chi la porta', () => {
        const stato = prepara();
        const a = eroe('A', { hp: 1, items: [oggetto('coperta_rurikstad')] }), b = eroe('B', { hp: 1 });
        stato.party = [a, b];
        g.resolveRest();
        t.uguale(3, a.hp); t.uguale(2, b.hp);
    });

    t.test('Erbario dei Fonnish: le pozioni di cura usate dall\'eroe curano 1 HP in più', () => {
        const stato = prepara();
        const a = eroe('A', { items: [oggetto('erbario_fonnish'), oggetto('balsamo_curativo')] }), b = eroe('B', { hp: 1 });
        stato.party = [a, b];
        g.useConsumable('A', 1, 'B');
        t.uguale(4, b.hp, '1 + 2 + 1');
    });

    t.test('tooltip e simulatore conoscono gli effetti speciali', () => {
        NUOVI.forEach(id => {
            const it = lib.armeria[id];
            if (!it) return;
            const tip = g.itemTip(it).replace(/<[^>]+>/g, '');
            const s = g.eval('ITEM_SPECIALS').find(x => it[x.k]);
            t.ok(tip.includes(s.tip(it[s.k]).slice(0, 12)), `${id}: tooltip`);
            t.ok(g.simItemValue(it) > 0, `${id}: il simulatore gli dà un valore`);
        });
    });
};
