// Passaggi a tema tra le schermate (js/game.js: screenTransitionFor, sipario in css/style.css)
const fs = require('fs');
const path = require('path');
const { ROOT } = require('./ambiente');

module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const nodo = type => {
        stato.stsMapNodes = [{ id: 1, level: 0, type, next: [2] }, { id: 2, level: 1, type: 'combat', next: [] }];
        stato.currentNodeId = 1;
    };

    t.test('ogni schermata ha il suo passaggio: taglio allo scontro, oro al bottino, fuoco al riposo', () => {
        nodo('combat');
        t.uguale('taglio', g.screenTransitionFor('screenMap', 'screenCombat'));
        t.uguale('oro', g.screenTransitionFor('screenCombat', 'screenLoot'));
        t.uguale('oro', g.screenTransitionFor('screenMap', 'screenTreasure'));
        t.uguale('fuoco', g.screenTransitionFor('screenMap', 'screenRest'));
        t.uguale('buio', g.screenTransitionFor('screenCombat', 'screenDefeat'));
        t.uguale('gloria', g.screenTransitionFor('screenMap', 'screenVictory'));
        t.uguale('base', g.screenTransitionFor('screenLoot', 'screenMap'));
    });

    t.test('elite e boss: taglio rosso', () => {
        nodo('elite');
        t.uguale('taglio-elite', g.screenTransitionFor('screenMap', 'screenCombat'));
    });

    t.test('dal tesoro al suo bottino il bagliore d\'oro non si ripete', () => {
        t.uguale('base', g.screenTransitionFor('screenTreasure', 'screenTreasureLoot'));
    });

    t.test('il foglio di stile ha un sipario per ogni passaggio', () => {
        const css = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
        ['taglio', 'taglio-elite', 'oro', 'fuoco', 'buio', 'gloria'].forEach(x =>
            t.ok(css.includes(`#screenCurtain.t-${x}`), `manca #screenCurtain.t-${x}`));
    });
};
