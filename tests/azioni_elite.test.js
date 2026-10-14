// Azioni speciali degli elite (data/azioni_elite/azioni_elite.js): solo dati, interpretati dal motore
const { caricaPagina } = require('./ambiente');

module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const azioni = g.LIBRERIA.azioni_elite;
    const eroe = (name, extra = {}) => ({ name, hp: 6, maxHp: 6, current_armor: 0, fth: 1, str: 2, dmg: 1, ...extra });
    const prepara = eroi => {
        stato.party = eroi; stato.combatRound = 1; stato.unlockedRelics = []; stato.activeCurses = [];
        stato.party.atamanoUsed = true;
        return eroi;
    };
    // Nemico con una soglia al 50% che usa le azioni indicate, già sceso sotto la soglia
    const elite = (ids, extra = {}) => ({ name: 'Elite', hp: 5, maxHp: 10, att: 7, dmg: 2, ca: 7,
        fasi: [{ soglia: 50, testo: 'Scatta!', azioni: ids }], ...extra });

    t.test('ogni fase del bestiario richiama azioni che esistono', () => {
        Object.entries(g.LIBRERIA.bestiario).forEach(([k, e]) => (e.fasi || []).forEach(f => {
            t.ok(Array.isArray(f.azioni) && f.azioni.length, `${k}: soglia ${f.soglia} con azioni`);
            f.azioni.forEach(id => t.ok(azioni[id], `${k}: azione ${id}`));
        }));
    });

    t.test('un\'azione scritta per intero nella fase funziona come una della libreria', () => {
        const [a] = prepara([eroe('A')]);
        const n = elite([{ name: 'Su misura', bonusCA: 3 }]);
        g.checkEnemyPhases(n, a);
        t.uguale(10, n.ca);
    });

    // Le 13 azioni nate con gli effetti speciali dei nemici (speciali con NEMICO_QUANDO / NEMICO_FAI)
    const conItems = h => Object.assign(h, { items: [], att_bonus: 0, def_bonus: 0, help_bonus_val: 0, att_penalty: 0, base_armor: 0 });
    const scontro = (n, eroi) => {
        stato.activeEnemy = n; stato.helpBonus = 0; stato.helpDmgBonus = 0; stato.partyCoins = 20;
        stato.stsMapNodes = [{ id: 1, level: 0, type: 'elite', next: [2] }, { id: 2, level: 1, type: 'combat', next: [] }];
        stato.currentNodeId = 1;
        eroi.forEach(conItems);
        return n;
    };

    t.test('le 13 azioni nuove esistono, con nome e descrizione', () => {
        ['pelle_di_brina', 'morso_velenoso', 'nube_tossica', 'ladro_di_tombe', 'ultimo_sangue', 'ululato_del_branco', 'frenesia',
            'maledizione_del_sangue', 'scudo_d_ossa', 'bersaglio_marcato', 'pioggia_di_frecce', 'furia_ultimo_round', 'rito_di_sangue']
            .forEach(id => t.ok(azioni[id] && azioni[id].name && azioni[id].desc, id));
    });

    t.test('Pelle di Brina: +2 CA e chi lo colpisce subisce 1 danno', () => {
        const [a] = prepara([eroe('A')]);
        const n = scontro(elite(['pelle_di_brina']), [a]);
        g.checkEnemyPhases(n, a);
        t.uguale(9, n.ca);
        g.resolveAttack(a, n, [6]);
        t.uguale(5, a.hp);
    });

    t.test('Nube Tossica e Morso Velenoso: veleno a tutti subito, poi a chi viene colpito', () => {
        const [a, b] = prepara([eroe('A'), eroe('B')]);
        const n = scontro(elite(['nube_tossica', 'morso_velenoso']), [a, b]);
        g.checkEnemyPhases(n, a);
        t.ok(a.poison && b.poison, 'tutti avvelenati');
        g.startRoundSpecials();
        t.uguale([5, 5], [a.hp, b.hp]);
        delete b.poison;
        g.resolveMonsterAttack(n, b);
        t.ok(b.poison && b.poison.rounds === 3, 'il morso avvelena per 3 round');
    });

    t.test('Ladro di Tombe: +1 Attacco e ruba 5 Scudi a ogni colpo', () => {
        const [a] = prepara([eroe('A')]);
        const n = scontro(elite(['ladro_di_tombe']), [a]);
        g.checkEnemyPhases(n, a);
        t.uguale(8, n.att);
        g.resolveMonsterAttack(n, a);
        t.uguale(15, stato.partyCoins);
    });

    t.test("Scudo d'Ossa: +3 CA, poi -1 CA a ogni round per 3 round", () => {
        const [a] = prepara([eroe('A')]);
        const n = scontro(elite(['scudo_d_ossa']), [a]);
        g.checkEnemyPhases(n, a);
        t.uguale(10, n.ca);
        for (let i = 0; i < 5; i++) g.startRoundSpecials();
        t.uguale(7, n.ca, "torna com'era");
    });

    t.test('Ululato del Branco: a inizio round stordisce un eroe a caso, con probabilità', () => {
        const [a] = prepara([eroe('A')]);
        const n = scontro(elite(['ululato_del_branco']), [a]);
        g.checkEnemyPhases(n, a);
        g.eval('Math.__r = Math.random; Math.random = () => 0.1');
        g.startRoundSpecials();
        g.eval('Math.random = Math.__r');
        t.ok(a.stunnedRounds >= 1, 'stordito');
    });

    t.test('Frenesia: due colpi a turno e -2 CA; Pioggia di Frecce: 1 a tutti e attacco più debole', () => {
        const [a, b] = prepara([eroe('A'), eroe('B')]);
        const n = scontro(elite(['frenesia']), [a, b]);
        g.checkEnemyPhases(n, a);
        t.uguale(5, n.ca);
        g.resolveEnemyTurn(n, a);
        t.uguale(2, a.hp, 'due colpi da 2');
        const [c, d] = prepara([eroe('C'), eroe('D')]);
        const p = scontro(elite(['pioggia_di_frecce']), [c, d]);
        g.checkEnemyPhases(p, c);
        g.resolveEnemyTurn(p, c);
        t.uguale([4, 5], [c.hp, d.hp], 'C: 1 + 1, D: 1');
    });

    t.test('Rito di Sangue in una soglia a tempo: al round 3 recupera 5 HP', () => {
        const [a] = prepara([eroe('A')]);
        const n = scontro({ name: 'Sciamano', hp: 4, maxHp: 12, att: 7, dmg: 1, ca: 7, fasi: [{ round: 3, soglia: 50, testo: 'Il rito!', azioni: ['rito_di_sangue'] }] }, [a]);
        stato.combatRound = 3;
        g.checkEnemyRoundPhases(n);
        t.uguale(9, n.hp);
    });

    t.test('Esplosione: 2 danni subito a tutta la compagnia', () => {
        const [a, b] = prepara([eroe('A'), eroe('B', { current_armor: 1 })]);
        g.checkEnemyPhases(elite(['esplosione']), a);
        t.uguale([4, 5], [a.hp, b.hp], 'l\'armatura assorbe come sempre');
    });

    t.test('Corazza di pietra e Secondo vento: +2 CA e 4 HP recuperati (non oltre il massimo)', () => {
        const [a] = prepara([eroe('A')]);
        const n = elite(['corazza_di_pietra', 'secondo_vento']);
        g.checkEnemyPhases(n, a);
        t.uguale(9, n.ca); t.uguale(9, n.hp);
        const m = elite(['secondo_vento'], { hp: 5, maxHp: 7, fasi: [{ soglia: 80, azioni: ['secondo_vento'] }] });
        g.checkEnemyPhases(m, a);
        t.uguale(7, m.hp);
    });

    t.test('Frantuma scudi: tutti perdono l\'armatura', () => {
        const [a, b] = prepara([eroe('A', { current_armor: 2 }), eroe('B', { current_armor: 1 })]);
        g.checkEnemyPhases(elite(['frantuma_scudi']), a);
        t.uguale([0, 0], [a.current_armor, b.current_armor]);
    });

    t.test('Urlo paralizzante: chi ha ferito il nemico salta il prossimo turno, poi torna ad agire', () => {
        const [a, b] = prepara([eroe('A'), eroe('B')]);
        g.checkEnemyPhases(elite(['urlo_paralizzante']), a);
        stato.party.forEach(h => { h.hasActed = false; });
        t.uguale(['A'], g.applyHeroStuns().map(h => h.name));
        t.ok(a.hasActed && !b.hasActed, 'A salta il turno');
        stato.party.forEach(h => { h.hasActed = false; });
        t.uguale(0, g.applyHeroStuns().length, 'il round dopo agisce');
    });

    t.test('Terrore: -1 al tiro per 2 turni, chi ha Fede 5 resiste', () => {
        const [a, b] = prepara([eroe('A'), eroe('B', { fth: 5 })]);
        g.checkEnemyPhases(elite(['terrore']), a);
        stato.combatRound = 2; g.applyPendingBuffs();
        t.uguale(-1, a.att_bonus); t.ok(!b.att_bonus);
        stato.combatRound = 3; g.expireTempBuffs(); g.applyPendingBuffs();
        t.uguale(-1, a.att_bonus, 'ancora al secondo turno');
        stato.combatRound = 4; g.expireTempBuffs(); g.applyPendingBuffs();
        t.uguale(0, a.att_bonus);
    });

    t.test('Spazzata: a ogni turno 1 danno a tutta la compagnia, senza bersaglio scelto', () => {
        const [a, b] = prepara([eroe('A'), eroe('B')]);
        const n = elite(['spazzata']);
        g.checkEnemyPhases(n, a);
        t.uguale('spazzata', n.schema);
        t.ok(g.resolveEnemyTurn(n, undefined).attacked);
        t.uguale([5, 5], [a.hp, b.hp]);
    });

    t.test('Doppio assalto: due colpi al bersaglio a ogni turno', () => {
        const [a] = prepara([eroe('A', { hp: 10, maxHp: 10 })]);
        const n = elite(['doppio_assalto']);
        g.checkEnemyPhases(n, a);
        g.resolveEnemyTurn(n, a);
        t.uguale(10 - 2 * n.dmg, a.hp);
    });

    t.test('Colpo d\'Odio: dopo il colpo al bersaglio, un secondo colpo al più robusto fra gli altri', () => {
        const [a, b, c] = prepara([eroe('A', { hp: 6 }), eroe('B', { hp: 4, current_armor: 1 }), eroe('C', { hp: 3 })]);
        const n = elite(['colpo_d_odio']);
        g.checkEnemyPhases(n, a);
        g.resolveEnemyTurn(n, a);
        t.uguale(6 - n.dmg, a.hp, 'il bersaglio scelto prende il colpo normale');
        t.uguale(4 + 1 - 2, b.hp, 'B (4 HP + 1 armatura) prende il Colpo d\'Odio, l\'armatura para 1');
        t.uguale(3, c.hp);
        // Chi difende attira il colpo: con più armatura C diventa il più robusto
        c.current_armor = 3;
        const bPrima = b.hp;
        g.resolveEnemyTurn(n, a);
        t.uguale(bPrima, b.hp);
        t.uguale([3, 1], [c.hp, c.current_armor], 'C ha preso il colpo sull\'armatura');
        t.ok(/Colpo d'Odio/.test(g.enemyIntentText(n)), 'l\'intenzione lo annuncia');
    });

    t.test('Colpo d\'Odio: con un solo eroe in piedi non c\'è un secondo bersaglio', () => {
        const [a] = prepara([eroe('A', { hp: 10, maxHp: 10 })]);
        const n = elite(['colpo_d_odio']);
        g.checkEnemyPhases(n, a);
        g.resolveEnemyTurn(n, a);
        t.uguale(10 - n.dmg, a.hp);
    });

    t.test('Rigenerazione e Sete di sangue: il nemico si cura a ogni turno', () => {
        const [a] = prepara([eroe('A', { hp: 10, maxHp: 10 })]);
        const r = elite(['rigenerazione']);
        g.checkEnemyPhases(r, a);
        g.resolveEnemyTurn(r, a);
        t.uguale(6, r.hp);
        const s = elite(['sete_di_sangue']);
        g.checkEnemyPhases(s, a);
        g.resolveEnemyTurn(s, a);
        t.uguale(5 + s.dmg, s.hp, 'recupera i danni tolti agli HP');
    });

    t.test('Aura gelida: 1 danno a tutti prima dell\'attacco normale', () => {
        const [a, b] = prepara([eroe('A'), eroe('B')]);
        const n = elite(['aura_gelida']);
        g.checkEnemyPhases(n, a);
        g.resolveEnemyTurn(n, b);
        t.uguale([5, 6 - 1 - n.dmg], [a.hp, b.hp]);
    });

    t.test('Duellante: attacca da solo l\'eroe con più HP + armatura', () => {
        const [a, b] = prepara([eroe('A', { hp: 3 }), eroe('B', { hp: 5, current_armor: 1 })]);
        const n = elite(['duellante']);
        g.checkEnemyPhases(n, a);
        t.uguale('B', g.enemyChosenTarget(n).name);
        t.uguale('B', g.resolveEnemyTurn(n, a).target.name);
    });

    t.test('un\'azione a ogni turno sostituisce quella di prima (l\'ultima scattata vale)', () => {
        const [a] = prepara([eroe('A', { hp: 20, maxHp: 20 })]);
        const n = { name: 'E', hp: 2, maxHp: 10, att: 7, dmg: 1, ca: 7,
            fasi: [{ soglia: 66, azioni: ['carica'] }, { soglia: 33, azioni: ['furia'] }] };
        g.checkEnemyPhases(n, a);
        t.uguale('furia', n.schema);
        t.ok(!g.enemyIsPreparing(n), 'niente più preparazione');
        t.ok(g.resolveEnemyTurn(n, a).attacked);
    });

    t.test('l\'intenzione del nemico si compone dalle azioni', () => {
        prepara([eroe('A'), eroe('B')]);
        const n = elite(['spazzata']);
        g.checkEnemyPhases(n, stato.party[0]);
        t.ok(g.enemyIntentText(n).includes('tutta la compagnia'));
        const c = elite(['carica']);
        c.schema = 'carica';
        t.ok(g.enemyIntentText(c).startsWith('Si prepara'));
    });

    t.test('editor: ogni azione della libreria ha una descrizione e passa i controlli', () => {
        const ed = caricaPagina('editor.html');
        Object.entries(azioni).forEach(([k, a]) => t.ok(ed.describeEliteAction(a) !== 'nessun effetto', k));
        t.uguale('data/azioni_elite/azioni_elite.js', ed.eval('libraryFilePath')('azioni_elite'));
        t.uguale(['hungrabarn', 'tremabosco_striato', 'madre_silfidi'], ed.libraryUsage('azioni_elite', 'ruggito_primordiale').map(u => u.id));
        const errori = ed.validateCampaign().filter(i => i.level === 'error' && /Elite|Azione elite/.test(i.msg));
        t.uguale([], errori.map(i => i.msg));
        // La scheda Elite si disegna e modifica le soglie (con il DOM finto dei test)
        ed.eval("selection.elite = 'hungrabarn'; currentTab = 'elite'");
        ed.render();
        const h = ed.eval('lib').bestiario.hungrabarn;
        ed.eliteSetThreshold(1, 80);
        t.uguale([80, 66], h.fasi.map(f => f.soglia), 'riordinate dalla soglia più alta');
        ed.eliteRemoveAction(1, 0);
        t.uguale([], h.fasi[1].azioni);
        t.ok(ed.eval('libDirty').has('bestiario'));
    });
};
