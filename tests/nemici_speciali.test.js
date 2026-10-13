// Effetti speciali dei nemici (bestiario e azioni degli elite), fasi a tempo, abilità attive componibili
// e i momenti "perde_hp" e "nemico_sconfitto" degli eroi (js/motore/speciali.js, js/combattimento.js)
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const eroe = (name, extra = {}) => ({ name, hp: 4, maxHp: 4, str: 2, int: 1, fth: 1, dmg: 1, items: [], base_armor: 0, current_armor: 0,
        att_bonus: 0, def_bonus: 0, help_bonus_val: 0, att_penalty: 0, ...extra });
    const prepara = (party, enemy) => {
        stato.party = party;
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = 20;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.stsMapNodes = [{ id: 1, level: 0, type: 'combat', next: [2] }, { id: 2, level: 3, type: 'combat', next: [] }];
        stato.currentNodeId = 1;
        stato.helpBonus = 0; stato.helpDmgBonus = 0; stato.combatRound = 1;
        stato.activeEnemy = { name: 'Lupo', hp: 10, maxHp: 10, ca: 4, att: 4, dmg: 1, ...enemy };
        return stato.activeEnemy;
    };

    t.test('nemico con spine: chi lo colpisce subisce 1 danno (l\'armatura conta)', () => {
        const a = eroe('A');
        const lupo = prepara([a], { speciali: [{ quando: 'colpito', fai: 'danni', val: 1 }] });
        const res = g.resolveAttack(a, lupo, [5]);
        t.ok(res.hit);
        t.uguale(3, a.hp);
        t.ok(res.itemNotes.some(n => n.includes('Lupo')), 'nota nel diario');
    });

    t.test('veleno: chi viene colpito perde 1 HP a ogni round per 2 round, senza armatura; finisce con lo scontro', () => {
        const a = eroe('A', { current_armor: 5 });
        const lupo = prepara([a], { speciali: [{ quando: 'colpisce', fai: 'veleno', val: 1, durata: 2 }] });
        g.resolveMonsterAttack(lupo, a);
        t.ok(a.poison, 'avvelenato');
        g.startRoundSpecials(); t.uguale(3, a.hp);
        g.startRoundSpecials(); t.uguale(2, a.hp);
        g.startRoundSpecials(); t.uguale(2, a.hp, 'dopo 2 round il veleno finisce');
        a.poison = { val: 1, rounds: 3 };
        g.expireTempBuffs(true);
        t.ok(!a.poison, 'a fine scontro sparisce');
    });

    t.test('nemico: rigenera a inizio round, una volta per scontro con il limite; ruba Scudi', () => {
        const a = eroe('A');
        const lupo = prepara([a], { hp: 5, speciali: [{ quando: 'inizio_round', fai: 'cura', val: 2, limite: 'scontro' },
            { quando: 'colpisce', fai: 'ruba_scudi', val: 5 }] });
        g.startRoundSpecials(); t.uguale(7, lupo.hp);
        g.startRoundSpecials(); t.uguale(7, lupo.hp, 'limite: una volta');
        g.resolveMonsterAttack(lupo, a);
        t.uguale(15, stato.partyCoins);
    });

    t.test('azione di un elite con effetti speciali: "alla soglia" subito, gli altri da quel momento', () => {
        const a = eroe('A'), b = eroe('B');
        const boss = prepara([a, b], { hp: 6, fasi: [{ soglia: 60, testo: 'Infuria!', azioni: [{ name: 'Esplosione',
            speciali: [{ quando: 'soglia', fai: 'danni', val: 2, bersaglio: 'tutti' }, { quando: 'colpito', fai: 'danni', val: 1 }] }] }] });
        const ev = g.checkEnemyPhases(boss, a);
        t.ok(ev.some(e => e.type === 'phase'));
        t.uguale([2, 2], [a.hp, b.hp], 'esplosione a tutti');
        g.resolveAttack(b, boss, [5]);
        t.uguale(1, b.hp, 'da ora ha le spine');
        g.checkEnemyPhases(boss, a);
        t.uguale(2, a.hp, '"alla soglia" non si ripete');
    });

    t.test('fase a tempo: scatta all\'inizio del round indicato, non con la vita', () => {
        const a = eroe('A');
        const boss = prepara([a], { fasi: [{ round: 3, soglia: 50, testo: 'Il tempo stringe', azioni: [{ name: 'Furore', bonusDanno: 2 }] }] });
        boss.hp = 1;
        t.uguale(0, g.checkEnemyPhases(boss, a).length, 'la vita non conta');
        stato.combatRound = 2;
        t.uguale(0, g.checkEnemyRoundPhases(boss).length);
        stato.combatRound = 3;
        t.ok(g.checkEnemyRoundPhases(boss).some(e => e.type === 'phase'));
        t.uguale(3, boss.dmg);
        t.uguale(0, g.checkEnemyRoundPhases(boss).length, 'una volta sola');
    });

    t.test('abilità attiva con effetti: se colpisce cura tutta la compagnia; se manca no', () => {
        const a = eroe('A', { hp: 2 }), b = eroe('B', { hp: 2 });
        const lupo = prepara([a, b]);
        a.chosenAbility = { id: '__prova', name: 'Colpo santo', isCombatActive: true,
            combat: { dice: 1, effetti: [{ quando: 'colpo', fai: 'cura', val: 1, bersaglio: 'compagnia' }, { quando: 'mancato', fai: 'armatura', val: 1 }] } };
        const res = g.resolveAbility(a, lupo, [5]);
        t.ok(res.hit);
        t.uguale([3, 3], [a.hp, b.hp]);
        a.abilityUsedThisCombat = false;
        const miss = g.resolveAbility(a, lupo, [1]);
        t.ok(!miss.hit);
        t.uguale(1, a.current_armor, 'se manca: +1 armatura');
    });

    t.test('abilità "senza tiro": niente dado, agiscono solo gli effetti "quando la usa"', () => {
        const a = eroe('A'), b = eroe('B', { hp: 1 });
        const lupo = prepara([a, b]);
        a.chosenAbility = { id: '__prova2', name: 'Canto', isCombatActive: true,
            combat: { senzaTiro: true, effetti: [{ quando: 'uso', fai: 'cura', val: 2, bersaglio: 'meno_hp' }] } };
        t.ok(g.abilityIsInstant(a));
        const res = g.resolveAbility(a, lupo);
        t.ok(res.instant && !res.hit);
        t.uguale(3, b.hp);
        t.uguale(10, lupo.hp, 'nessun danno al nemico');
    });

    t.test('eroe: "perde HP" colpisce il nemico; "sconfigge il nemico" dà Scudi', () => {
        const a = eroe('A', { items: [{ name: 'Anello della vendetta', speciali: [{ quando: 'perde_hp', fai: 'danni', val: 2 },
            { quando: 'nemico_sconfitto', fai: 'monete', val: 5 }] }] });
        const lupo = prepara([a], { hp: 3 });
        g.resolveMonsterAttack(lupo, a);
        t.uguale(1, lupo.hp, 'ferito: 2 danni al nemico');
        a.current_armor = 5;
        g.resolveMonsterAttack(lupo, a);
        t.uguale(1, lupo.hp, 'colpo assorbito dall\'armatura: niente vendetta');
        g.resolveAttack(a, lupo, [5]);
        t.uguale(25, stato.partyCoins, 'nemico sconfitto: +5 Scudi');
    });

    t.test('editor: i modelli pronti usano solo parole conosciute', () => {
        // SPECIALI_MODELLI sta in js/editor/moduli.js (l'editor non si carica nei test): si legge dal file
        const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'editor', 'moduli.js'), 'utf8');
        const ed = g.eval('(' + src.match(/const SPECIALI_MODELLI = (\{[\s\S]*?\n\});/)[1] + ')');
        const Q = g.eval('SPECIALI_QUANDO'), QA = g.eval('SPECIALI_QUANDO_ABILITA'), F = g.eval('SPECIALI_FAI');
        const NQ = g.eval('NEMICO_QUANDO'), NF = g.eval('NEMICO_FAI');
        Object.entries(ed.eroe).forEach(([k, s]) => t.ok(Q[s.quando] && F[s.fai] && F[s.fai].quando.includes(s.quando), `modello "${k}"`));
        Object.entries(ed.abilita).forEach(([k, s]) => t.ok(QA[s.quando] && F[s.fai] && F[s.fai].quando.includes(s.quando), `modello "${k}"`));
        Object.entries(ed.nemico).forEach(([k, s]) => t.ok(NQ[s.quando] && NF[s.fai], `modello "${k}"`));
    });
};
