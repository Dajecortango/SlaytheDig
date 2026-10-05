// Fasi dei nemici: soglie, reazioni (contrattacco, colpo ad area), schemi (carica, predatore, furia), ruggito
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const nemico = id => JSON.parse(JSON.stringify(g.LIBRERIA.bestiario[id]));
    const eroe = (name, extra = {}) => ({ name, hp: 6, maxHp: 6, current_armor: 0, fth: 1, str: 2, dmg: 1, ...extra });
    const prepara = eroi => {
        stato.party = eroi; stato.combatRound = 1; stato.unlockedRelics = []; stato.activeCurses = [];
        stato.party.atamanoUsed = true;
        return eroi;
    };

    t.test('Tremabosco: sotto il 50% travolge a ogni turno (bersaglio pieno, 1 agli eroi accanto)', () => {
        const [a, b, c] = prepara([eroe('A', { hp: 20 }), eroe('B', { hp: 20 }), eroe('C', { hp: 20 })]);
        const tb = nemico('tremabosco');
        tb.hp = Math.floor(tb.maxHp / 2);
        g.checkEnemyPhases(tb, a);
        t.uguale('travolge', tb.schema);
        t.ok(g.resolveEnemyTurn(tb, b).attacked, 'primo turno');
        t.ok(g.resolveEnemyTurn(tb, b).attacked, 'anche il secondo, senza pause');
        t.uguale([18, 20 - 2 * tb.dmg, 18], [a.hp, b.hp, c.hp]);
    });

    t.test('una soglia scatta una volta sola, quando la vita scende a quel valore o sotto', () => {
        const [a] = prepara([eroe('A')]);
        const boia = nemico('boia_rinnegati');
        boia.hp = Math.floor(boia.maxHp / 2) + 1;
        t.uguale(0, g.checkEnemyPhases(boia, a).length, 'sopra la soglia niente');
        boia.hp = Math.floor(boia.maxHp / 2);
        t.ok(g.checkEnemyPhases(boia, a).some(e => e.type === 'phase'), 'alla soglia scatta');
        t.uguale(0, g.checkEnemyPhases(boia, a).length, 'una volta sola');
    });

    t.test('Boia: in furia sotto il 50% +1 danno e attacca da solo l\'eroe con meno HP + armatura', () => {
        const [a, b] = prepara([eroe('A', { current_armor: 1 }), eroe('B', { hp: 5 })]);
        const boia = nemico('boia_rinnegati');
        const danno = boia.dmg;
        boia.hp = 1;
        g.checkEnemyPhases(boia, a);
        t.uguale(danno + 1, boia.dmg);
        t.uguale('predatore', boia.schema);
        t.uguale([6, 5], [a.hp, b.hp], 'non colpisce subito');
        t.uguale('B', g.resolveEnemyTurn(boia, a).target.name, 'B: 5 contro 7 di A');
    });

    t.test('reazione di una fase: al turno del nemico colpisce chi l\'ha fatta scattare, poi torna normale', () => {
        const [a, b] = prepara([eroe('A'), eroe('B')]);
        const boia = nemico('boia_rinnegati');
        boia.fasi = [{ soglia: 50, reazione: 'contrattacco', bonusDanno: 1 }];
        const danno = boia.dmg;
        boia.hp = 1;
        g.checkEnemyPhases(boia, b);
        t.uguale(danno + 1, boia.dmg);
        t.uguale([6, 6], [a.hp, b.hp], 'non colpisce subito');
        const r = g.resolveEnemyTurn(boia, a);
        t.uguale('B', r.target.name, 'al suo turno colpisce B, anche se il bersaglio scelto era A');
        t.uguale(6 - (danno + 1), b.hp, 'con il danno nuovo');
        t.uguale(6, a.hp);
        t.uguale('A', g.resolveEnemyTurn(boia, a).target.name, 'poi torna normale');
    });

    t.test('Hungrabarn: al 66% carica come il Tremabosco, travolgendo al primo turno dopo la soglia', () => {
        const [a, b, c] = prepara([eroe('A'), eroe('B'), eroe('C')]);
        const h = nemico('hungrabarn');
        h.hp = Math.floor(h.maxHp * 0.66);
        g.checkEnemyPhases(h, b);
        t.uguale('carica', h.schema);
        t.uguale([6, 6, 6], [a.hp, b.hp, c.hp], 'la fase non colpisce subito');
        t.ok(g.resolveEnemyTurn(h, b).attacked, 'primo turno dopo la soglia: travolge subito');
        t.uguale(6 - h.dmg, b.hp, 'travolge B');
        t.uguale([5, 5], [a.hp, c.hp], 'e 1 danno agli eroi accanto');
        t.ok(!g.resolveEnemyTurn(h, b).attacked, 'poi raspa il terreno');
    });

    t.test('Hungrabarn: un colpo che supera 66% e 33% fa scattare entrambe le fasi, in ordine (finisce in furia)', () => {
        const [a, b] = prepara([eroe('A'), eroe('B')]);
        const h = nemico('hungrabarn');
        h.hp = 2;
        const ev = g.checkEnemyPhases(h, b);
        t.uguale(2, ev.filter(e => e.type === 'phase').length);
        t.uguale('furia', h.schema);
    });

    t.test('ruggito: -1 al tiro nel prossimo turno solo per chi ha Fede sotto 4, poi scade', () => {
        const [a, b] = prepara([eroe('A', { fth: 1 }), eroe('B', { fth: 4 })]);
        const h = nemico('hungrabarn');
        h.fasiFatte = [0];
        h.hp = 1;
        g.checkEnemyPhases(h, a);
        t.uguale(undefined, a.att_bonus, 'non subito: dal prossimo turno');
        stato.combatRound = 2; g.applyPendingBuffs();
        t.uguale(-1, a.att_bonus); t.ok(!b.att_bonus, 'Fede 4 resiste');
        stato.combatRound = 3; g.expireTempBuffs(); g.applyPendingBuffs();
        t.uguale(0, a.att_bonus, 'scaduto dopo un turno');
    });

    t.test('furia: +1 danno a ogni turno del nemico', () => {
        const [a] = prepara([eroe('A', { hp: 20, maxHp: 20 })]);
        const h = nemico('hungrabarn'); h.schema = 'furia';
        const d = h.dmg;
        g.resolveEnemyTurn(h, a);
        g.resolveEnemyTurn(h, a);
        t.uguale(d + 2, h.dmg);
        t.uguale(20 - (d + 1) - (d + 2), a.hp);
    });

    t.test('carica: un turno raspa (nessun danno), il successivo travolge il bersaglio e 1 agli eroi accanto', () => {
        const [a, b, c] = prepara([eroe('A'), eroe('B'), eroe('C')]);
        const tb = nemico('tremabosco'); tb.schema = 'carica';
        const r1 = g.resolveEnemyTurn(tb, b);
        t.ok(!r1.attacked); t.uguale([6, 6, 6], [a.hp, b.hp, c.hp]);
        const r2 = g.resolveEnemyTurn(tb, b);
        t.ok(r2.attacked);
        t.uguale(6 - tb.dmg, b.hp);
        t.uguale([5, 5], [a.hp, c.hp]);
        t.ok(!g.resolveEnemyTurn(tb, b).attacked, 'poi ricomincia a caricare');
    });

    t.test('predatore: attacca da solo l\'eroe con meno HP + armatura, ignorando la scelta', () => {
        const [a, b] = prepara([eroe('A', { hp: 3, current_armor: 2 }), eroe('B', { hp: 4, current_armor: 0 })]);
        const m = nemico('mastino_bokgar'); m.schema = 'predatore';
        t.uguale('B', g.predatorTarget().name, 'B: 4 contro 5 di A');
        const r = g.resolveEnemyTurn(m, a);
        t.uguale('B', r.target.name);
    });

    t.test('un nemico senza fasi non cambia niente', () => {
        const [a] = prepara([eroe('A')]);
        const lupi = nemico('lupi');
        lupi.hp = 1;
        t.uguale(0, g.checkEnemyPhases(lupi, a).length);
    });
};
