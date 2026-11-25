// Difficoltà stimata dell'editor (js/editor/difficolta.js): statistiche, script del motore, simulazione vera
const vm = require('vm');
const { caricaPagina, carica, SCRIPT_MOTORE } = require('./ambiente');

module.exports = (t) => {
    const ed = caricaPagina('editor.html');

    t.test('statistiche: vittorie, margine, HP nelle vittorie, dove si cade', () => {
        const r = [
            { victory: true, hp: 10, hpMax: 20 }, { victory: true, hp: 20, hpMax: 20 },
            { victory: false, deathCause: 'Lupi' }, { victory: false, deathCause: 'Lupi' }, { victory: false, deathCause: 'Il ponte' }
        ];
        const s = ed.difficoltaStatistiche(r, null);
        t.uguale(5, s.partite);
        t.uguale(2, s.vinte);
        t.uguale(40, s.pct);
        t.uguale(43, s.margine);
        t.uguale(15, s.hpMedi);
        t.uguale(75, s.hpPct);
        t.uguale([{ dove: 'Lupi', volte: 2, pct: 40 }, { dove: 'Il ponte', volte: 1, pct: 20 }], s.morti);
        t.uguale(null, s.obiettivo);
    });

    t.test('statistiche: confronto con la difficoltà voluta', () => {
        const r = n => Array.from({ length: 10 }, (_, i) => ({ victory: i < n, hp: 5, hpMax: 10, deathCause: 'X' }));
        t.uguale('difficile', ed.difficoltaStatistiche(r(3), { vittoriaMin: 40, vittoriaMax: 70 }).obiettivo.esito);
        t.uguale('dentro', ed.difficoltaStatistiche(r(5), { vittoriaMin: 40, vittoriaMax: 70 }).obiettivo.esito);
        t.uguale('facile', ed.difficoltaStatistiche(r(8), { vittoriaMin: 40, vittoriaMax: 70 }).obiettivo.esito);
        t.uguale({ min: 0, max: 60, esito: 'facile' }, ed.difficoltaStatistiche(r(8), { vittoriaMax: 60 }).obiettivo);
        const vuote = ed.difficoltaStatistiche([], null);
        t.uguale(0, vuote.pct);
        t.uguale(null, vuote.hpMedi);
    });

    t.test('script del motore nella pagina nascosta: quelli dei test, nello stesso ordine (senza la partita online)', () => {
        t.uguale(SCRIPT_MOTORE.filter(f => f !== 'js/online.js'), [...ed.eval('SIM_SCRIPT_MOTORE')]);
    });

    // Il codice della pagina nascosta (edSimPrepara / edSimUna) gira sul motore dei test con una campagna dell'editor
    t.test('la pagina nascosta simula una campagna dell\'editor', () => {
        const html = ed.simFrameHtml();
        const codice = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).pop();
        t.ok(/function edSimPrepara/.test(codice), 'codice della pagina nascosta');
        const g = carica();
        vm.runInContext(codice, g);
        const camp = JSON.parse(JSON.stringify(g.CAMPAIGNS_RAW.tutorial));
        camp.id = 'prova_editor';
        const prep = g.edSimPrepara(JSON.stringify(ed.eval('lib')), JSON.stringify(camp));
        t.ok(prep.sel.length > 0, 'compagnia');
        const risultati = Array.from({ length: 5 }, () => g.edSimUna(prep));
        risultati.forEach(r => t.ok(typeof r.victory === 'boolean' && r.hpMax > 0, JSON.stringify(r)));
        const s = ed.difficoltaStatistiche(risultati, camp.difficolta);
        t.uguale(5, s.partite);
    });
};
