// Oggetti con un effetto speciale "quando → fai" (campo "speciali" dell'armeria, motore in js/motore/speciali.js)
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
            t.ok(Array.isArray(it.speciali) && it.speciali.length && it.speciali.every(s => g.eval('SPECIALI_FAI')[s.fai] && g.eval('SPECIALI_QUANDO')[s.quando]),
                `${id}: ha un effetto speciale conosciuto`);
        });
    });

    t.test('Corno da Guerra di Allmän: +1 al tiro per colpire a tutti nel primo round, poi scade', () => {
        const stato = prepara();
        const a = eroe('A', { items: [oggetto('corno_allman')] }), b = eroe('B');
        stato.party = [a, b];
        stato.combatRound = 0;
        g.startCombatSpecials();
        stato.combatRound = 1;
        t.uguale(1, a.att_bonus); t.uguale(1, b.att_bonus, 'anche chi non ha il corno');
        stato.combatRound = 2;
        g.expireTempBuffs();
        t.uguale(0, a.att_bonus); t.uguale(0, b.att_bonus);
    });

    t.test('Ascia del Primo Sangue: +2 danni solo se colpisce nel primo round', () => {
        const stato = prepara();
        const a = eroe('A', { items: [oggetto('ascia_primo_sangue')] });
        stato.party = [a];
        g.startCombatSpecials();
        const n = nemico({ ca: 6 });
        t.uguale(3, g.resolveAttack(a, n, [5]).dmg, 'round 1: 1 + 2');
        t.uguale(1, g.resolveAttack(a, n, [5]).dmg, 'secondo colpo nel round 1: 1');
        stato.combatRound = 2;
        t.uguale(1, g.resolveAttack(a, n, [5]).dmg, 'round 2: 1');
        g.startCombatSpecials();
        stato.combatRound = 1;
        t.uguale(0, g.resolveAttack(a, n, [2]).dmg, 'mancato nel round 1');
        stato.combatRound = 2;
        t.uguale(1, g.resolveAttack(a, n, [5]).dmg, 'colpo nel round 2 dopo un errore: niente bonus');
        g.startCombatSpecials();
        stato.combatRound = 1;
        t.uguale(3, g.resolveAttack(a, nemico(), [5]).dmg, 'nuovo scontro');
    });

    t.test('Mazza del Boia di Seistad: +2 danni se il nemico ha metà vita o meno', () => {
        const stato = prepara();
        const a = eroe('A', { items: [oggetto('mazza_boia_seistad')] });
        stato.party = [a];
        g.startCombatSpecials();
        t.uguale(1, g.resolveAttack(a, nemico({ hp: 6 }), [5]).dmg);
        t.uguale(3, g.resolveAttack(a, nemico({ hp: 5 }), [5]).dmg);
    });

    t.test('Catena di Ghiacceterno: il primo colpo a segno stordisce, senza danni in più', () => {
        const stato = prepara();
        const a = eroe('A', { items: [oggetto('catena_ghiacceterno')] });
        stato.party = [a];
        g.startCombatSpecials();
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
        g.startCombatSpecials();
        const res = g.resolveAttack(a, nemico(), [1, 5]);
        t.ok(res.hit, 'ritirato e colpito'); t.uguale(5, res.roll);
        t.ok(!g.resolveAttack(a, nemico(), [1, 5]).hit, 'una volta per scontro');
        g.startCombatSpecials();
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
            t.ok(tip.includes(g.specialeTesto(it.speciali[0], 'oggetto').slice(0, 12)), `${id}: tooltip`);
            t.ok(g.simItemValue(it) > 0, `${id}: il simulatore gli dà un valore`);
        });
    });
    t.test('rari: Spadone del Primo Sangue e Ascia del Carnefice usano gli effetti dei non comuni', () => {
        const stato = prepara();
        const spadone = lib.armeria.spadone_primo_sangue, ascia = lib.armeria.ascia_carnefice_glostok;
        const ha = (it, s) => it.speciali.some(x => Object.entries(s).every(([k, v]) => x[k] === v));
        t.ok(spadone && spadone.rarity === 'raro' && spadone.str === 1 && ha(spadone, { quando: 'colpo', fai: 'danni', val: 2, limite: 'scontro' }), 'spadone');
        t.ok(ascia && ascia.rarity === 'raro' && ascia.dmg === 1 && ha(ascia, { quando: 'colpo', se: 'nemico_meta', fai: 'danni', val: 2 }), 'ascia');
        const a = eroe('A', { items: [oggetto('spadone_primo_sangue')] });
        stato.party = [a];
        g.startCombatSpecials();
        t.uguale(3, g.resolveAttack(a, nemico(), [5]).dmg, '1 + 2 al primo colpo');
        t.uguale(1, g.resolveAttack(a, nemico(), [5]).dmg, 'secondo colpo: 1');
    });

    t.test('Pugnale Succhiasangue: colpo a segno, una volta su due cura 1 HP', () => {
        const stato = prepara();
        const a = eroe('A', { hp: 2, items: [oggetto('pugnale_succhiasangue')] });
        stato.party = [a];
        g.startCombatSpecials();
        g.eval('Math.__r = Math.random; Math.random = () => 0.2');
        g.resolveAttack(a, nemico(), [5]);
        t.uguale(3, a.hp, 'curato');
        g.eval('Math.random = () => 0.8');
        g.resolveAttack(a, nemico(), [5]);
        t.uguale(3, a.hp, 'non questa volta');
        g.eval('Math.random = Math.__r');
    });

    t.test('Lama di Ghiaccio di Hvid: ogni colpo a segno toglie 1 all\'Attacco del nemico, al massimo 2', () => {
        const stato = prepara();
        const a = eroe('A', { items: [oggetto('lama_ghiaccio_hvid')] });
        stato.party = [a];
        g.startCombatSpecials();
        const n = nemico({ att: 5 });
        g.resolveAttack(a, n, [5]); t.uguale(4, n.att);
        g.resolveAttack(a, n, [5]); t.uguale(3, n.att);
        g.resolveAttack(a, n, [5]); t.uguale(3, n.att, 'massimo -2');
    });

    t.test('Corazza dell\'Ultimo Baluardo: a 2 HP o meno +2 armatura subito, una volta per scontro', () => {
        const stato = prepara();
        const a = eroe('A', { items: [oggetto('corazza_ultimo_baluardo')] });
        a.items[0].armor = 0;  // conta solo l'effetto speciale
        stato.party = [a];
        g.startCombatSpecials();
        g.resolveMonsterAttack(nemico({ dmg: 2 }), a);
        t.uguale(2, a.hp); t.uguale(2, a.current_armor, 'scatta');
        a.current_armor = 0; a.hp = 2;
        g.resolveMonsterAttack(nemico({ dmg: 1 }), a);
        t.uguale(0, a.current_armor, 'una volta sola');
    });

    // Ogni effetto speciale scritto nei dati (anche dall'editor) usa solo parole che il motore conosce
    t.test('librerie: ogni effetto speciale usa quando, fai, condizioni e bersagli conosciuti', () => {
        const Q = g.eval('SPECIALI_QUANDO'), F = g.eval('SPECIALI_FAI'), SE = g.eval('SPECIALI_SE'), B = g.eval('SPECIALI_BERSAGLI');
        const ST = { ...g.eval('SPECIALI_STAT'), ...g.eval('SPECIALI_STAT_NEMICO') };
        let n = 0;
        for (const kind of ['armeria', 'reliquie', 'maledizioni', 'abilita']) {
            for (const [id, el] of Object.entries(lib[kind] || {})) (el.speciali || []).forEach(s => {
                n++;
                const dove = `${kind}.${id}`;
                t.ok(Q[s.quando], `${dove}: quando "${s.quando}"`);
                t.ok(F[s.fai] && F[s.fai].quando.includes(s.quando), `${dove}: "${s.fai}" non ha senso con "${s.quando}"`);
                if (s.se) t.ok(SE[s.se], `${dove}: condizione "${s.se}"`);
                if (s.bersaglio) t.ok(B[s.bersaglio], `${dove}: bersaglio "${s.bersaglio}"`);
                if (s.stat) t.ok(ST[s.stat], `${dove}: statistica "${s.stat}"`);
                if (s.limite) t.ok(['scontro', 'capitolo'].includes(s.limite), `${dove}: limite "${s.limite}"`);
            });
        }
        t.ok(n >= 40, `effetti speciali trovati: ${n}`);
    });

    t.test('oggetti nel formato di prima (salvataggi): i vecchi campi valgono ancora come effetti speciali', () => {
        const stato = prepara();
        const vecchio = { id: 'ascia_primo_sangue', name: 'Ascia del Primo Sangue', rarity: 'non_comune', first_hit_dmg: 2 };
        t.uguale('colpo', g.itemSpecials(vecchio)[0].quando);
        const a = eroe('A', { items: [vecchio] });
        stato.party = [a];
        g.startCombatSpecials();
        t.uguale(3, g.resolveAttack(a, nemico(), [5]).dmg, '1 + 2 al primo colpo');
        t.uguale(1, g.resolveAttack(a, nemico(), [5]).dmg);
    });

    t.test('effetto nuovo scritto solo con i dati: "inizio round → cura" su un oggetto inventato', () => {
        const stato = prepara();
        const a = eroe('A', { hp: 1, items: [{ name: 'Anello di prova', speciali: [{ quando: 'inizio_round', fai: 'cura', val: 1, round: 2 }] }] });
        stato.party = [a];
        stato.combatRound = 1;
        g.fireSpecialsAll('inizio_round');
        t.uguale(1, a.hp, 'round 1: niente');
        stato.combatRound = 2;
        const res = g.fireSpecialsAll('inizio_round');
        t.uguale(2, a.hp, 'round 2: +1 HP');
        t.ok(res.notes[0].includes('Anello di prova'), 'nota con il nome della fonte');
    });

    t.test('"rompe" consuma l\'oggetto finite le volte; "limite capitolo" resta fra gli scontri', () => {
        const stato = prepara();
        const pietra = { name: 'Pietra del tuono', speciali: [{ quando: 'inizio_scontro', fai: 'danni', val: 2, limite: 'capitolo', volte: 2, rompe: true }] };
        const a = eroe('A', { items: [pietra] });
        stato.party = [a];
        stato.activeEnemy = nemico();
        g.startCombatSpecials();
        t.uguale(8, stato.activeEnemy.hp);
        t.uguale(1, a.items.length, 'dopo il primo uso resta');
        stato.activeEnemy = nemico();
        g.startCombatSpecials();
        t.uguale(8, stato.activeEnemy.hp, 'secondo scontro: scatta ancora');
        t.uguale(0, a.items.length, 'finite le volte si consuma');
    });
};
