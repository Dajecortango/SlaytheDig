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
