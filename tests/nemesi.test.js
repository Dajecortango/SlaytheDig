// Nemesi di un nemico (campo "nemesi" = id della libreria Eroi): finché quell'eroe è in piedi, il nemico attacca lui
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const eroe = (name, libId, extra = {}) => ({ name, libId, hp: 6, maxHp: 6, current_armor: 0, fth: 1, str: 2, dmg: 1,
        items: [], att_bonus: 0, def_bonus: 0, help_bonus_val: 0, att_penalty: 0, base_armor: 0, ...extra });
    const prepara = (nemico) => {
        const eroi = [eroe('Alastorta', 'alastorta_dignitas'), eroe('Pancrazio', 'pancrazio_dignitas'), eroe('Cassio', 'cassio_dignitas')];
        stato.party = eroi; stato.combatRound = 1; stato.unlockedRelics = []; stato.activeCurses = [];
        stato.party.atamanoUsed = true;
        stato.activeEnemy = nemico; stato.helpBonus = 0; stato.helpDmgBonus = 0; stato.partyCoins = 0;
        stato.stsMapNodes = [{ id: 1, level: 0, type: 'combat', next: [] }]; stato.currentNodeId = 1;
        return eroi;
    };
    const nemico = (extra = {}) => ({ name: 'Eldric', hp: 20, maxHp: 20, att: 7, dmg: 2, ca: 8, nemesi: 'pancrazio_dignitas', ...extra });

    t.test('Eldric ha Pancrazio come nemesi', () => {
        t.uguale('pancrazio_dignitas', g.LIBRERIA.bestiario.eldric_dei_cavalcantici.nemesi);
    });

    t.test('il colpo va alla nemesi anche se il giocatore sceglie un altro eroe', () => {
        const [a, p] = prepara(nemico());
        const n = stato.activeEnemy;
        t.uguale(p, g.enemyChosenTarget(n), 'il nemico sceglie da solo Pancrazio');
        const res = g.resolveEnemyTurn(n, a);
        t.uguale(p, res.target);
        t.uguale([6, 4], [a.hp, p.hp]);
        t.ok(g.enemyIntentText(n).includes('Pancrazio'), 'l\'intenzione lo dice');
    });

    t.test('vale anche quando una fase lo fa puntare il più forte o il più debole', () => {
        const [a, p, c] = prepara(nemico({ turnoAzione: { turno: true, turnoBersaglio: 'piu_debole' } }));
        a.hp = 1;
        g.resolveEnemyTurn(stato.activeEnemy, null);
        t.uguale([1, 4, 6], [a.hp, p.hp, c.hp]);
    });

    t.test('Pancrazio a terra: il nemico torna a scegliere come al solito', () => {
        const [a, p] = prepara(nemico());
        p.hp = 0;
        t.uguale(null, g.enemyChosenTarget(stato.activeEnemy), 'di nuovo bersaglio libero');
        const res = g.resolveEnemyTurn(stato.activeEnemy, a);
        t.uguale(a, res.target);
        t.uguale(4, a.hp);
    });

    t.test('i colpi contro tutta la compagnia restano per tutti', () => {
        const [a, p, c] = prepara(nemico({ turnoAzione: { turno: true, turnoBersaglio: 'tutti' } }));
        g.resolveEnemyTurn(stato.activeEnemy, null);
        t.uguale([4, 4, 4], [a.hp, p.hp, c.hp]);
    });

    t.test('i danni speciali al più forte vanno alla nemesi', () => {
        const [a, p] = prepara(nemico({ speciali: [{ quando: 'inizio_scontro', fai: 'danni', val: 1, bersaglio: 'piu_forte' }] }));
        a.hp = 6; a.current_armor = 3;
        g.fireEnemySpecials('inizio_scontro', stato.activeEnemy, null);
        t.uguale([6, 5], [a.hp, p.hp]);
    });

    t.test('il primo colpo sulla nemesi segna il suono, una volta sola', () => {
        t.ok(g.LIBRERIA.bestiario.eldric_dei_cavalcantici.sfxNemesi, 'Eldric ha il suono');
        const [a, p] = prepara(nemico());
        const n = stato.activeEnemy;
        g.resolveMonsterAttack(n, a);
        t.ok(!n.nemesiColpita, 'un altro eroe colpito: niente');
        p.current_armor = 5;
        g.resolveMonsterAttack(n, p, { dmg: 0 });
        t.ok(!n.nemesiColpita, 'colpo da 0 danni: niente');
        g.resolveMonsterAttack(n, p);
        t.ok(n.nemesiColpita && n.nemesiSuonoInAttesa, 'colpo sull\'armatura di Pancrazio: suono in attesa');
        n.nemesiSuonoInAttesa = false;
        g.resolveMonsterAttack(n, p);
        t.ok(!n.nemesiSuonoInAttesa, 'il secondo colpo non lo risuona');
    });
};
