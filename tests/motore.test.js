// Struttura del motore (js/motore/): moduli con il loro oggetto in window.Motore, solo regole, niente DOM
const fs = require('fs');
const path = require('path');
const { ROOT } = require('./ambiente');

module.exports = (t, carica) => {
    const g = carica();
    const file = nome => fs.readFileSync(path.join(ROOT, 'js', 'motore', nome), 'utf8');
    const moduli = fs.readdirSync(path.join(ROOT, 'js', 'motore')).filter(f => f.endsWith('.js'));

    t.test('ogni file del motore espone il suo modulo in window.Motore', () => {
        t.uguale(['prove', 'scontro', 'speciali', 'tiri'], Object.keys(g.Motore).sort());
        t.ok(typeof g.Motore.scontro.resolveAttack === 'function' && g.Motore.scontro.resolveAttack === g.resolveAttack, 'stessa funzione anche globale');
        t.ok(typeof g.Motore.tiri.rollD6 === 'function' && typeof g.Motore.prove.resolveChallenge === 'function' && typeof g.Motore.speciali.fireSpecials === 'function');
    });

    t.test('il motore non tocca la pagina: niente document, getElementById, innerHTML, finestre o messaggi a schermo', () => {
        moduli.forEach(f => {
            const testo = file(f).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');  // senza commenti
            ['document.', 'getElementById', 'innerHTML', 'openModal(', 'uiMessage(', 'uiError(', 'logCombat(', 'showScreen('].forEach(x =>
                t.ok(!testo.includes(x), `${f} usa ${x}`));
        });
    });

    t.test('index.html e i test caricano gli stessi file del motore', () => {
        const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
        moduli.forEach(f => t.ok(html.includes(`js/motore/${f}`), `index.html carica js/motore/${f}`));
    });
};
