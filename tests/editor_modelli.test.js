// Modelli di nodo pronti dell'editor (js/editor/modelli.js): id della libreria esistenti, dati validi, chiavi nuove
const { caricaPagina } = require('./ambiente');

module.exports = (t) => {
    const ed = caricaPagina('editor.html');
    const M = ed.eval('NODE_TEMPLATES');
    const S = ed.eval('DATI_SCHEMA');
    const L = ed.LIBRERIA;

    t.test('da 5 a 8 modelli, chiavi diverse, tipi di nodo conosciuti', () => {
        t.ok(M.length >= 5 && M.length <= 8, `modelli: ${M.length}`);
        t.uguale(M.length, new Set(M.map(m => m.key)).size, 'chiavi ripetute');
        const tipi = ed.eval('NODE_TYPES');
        M.forEach(m => t.ok(tipi[m.type], `${m.key}: tipo "${m.type}"`));
    });

    t.test('nemici, reliquie e maledizioni dei modelli esistono nella libreria', () => {
        M.forEach(m => {
            if (m.enemy) t.ok(L.bestiario[m.enemy], `${m.key}: nemico "${m.enemy}"`);
            if (m.type === 'elite') t.ok(Array.isArray(L.bestiario[m.enemy].fasi), `${m.key}: "${m.enemy}" non è un elite`);
            if (m.sfida && typeof m.sfida.reward === 'string') t.ok(L.reliquie[m.sfida.reward], `${m.key}: reliquia "${m.sfida.reward}"`);
            if (m.sfida && typeof m.sfida.punishment === 'string') t.ok(L.maledizioni[m.sfida.punishment], `${m.key}: maledizione "${m.sfida.punishment}"`);
        });
    });

    t.test('ogni modello inserito dà un nodo senza errori e dati validi per la scheda dei dati', () => {
        M.forEach(m => {
            const c = ed.blankCampaign();
            const node = ed.insertNodeTemplateIn(c, c.mapNodes[0].id, m.key);
            t.ok(node && c.mapNodes.includes(node), `${m.key}: nodo aggiunto`);
            t.ok(c.mapNodes[0].next.includes(node.id), `${m.key}: collegato dal nodo scelto`);
            t.uguale([], ed.controllaElemento(S.nodo, node, m.key).filter(p => p.livello === 'errore'), `${m.key}: nodo`);
            // Senza uscita è normale: il nodo è appena stato aggiunto in cima
            const errori = ed.nodeProblems(node, c).filter(p => p.livello === 'errore' && !/Senza uscita/.test(p.msg));
            t.uguale([], errori.map(p => p.msg), `${m.key}: problemi del nodo`);
            if (node.challengeId) t.uguale([], ed.controllaElemento(S.sfida, c.challenges[node.challengeId], m.key).filter(p => p.livello === 'errore'), `${m.key}: sfida`);
            if (node.storyId) t.uguale([], ed.controllaElemento(S.trama, c.stories[node.storyId], m.key).filter(p => p.livello === 'errore'), `${m.key}: trama`);
        });
    });

    t.test('i testi dei modelli passano il controllo dei testi', () => {
        M.forEach(m => {
            const c = ed.blankCampaign();
            c.description = 'x'; c.introText = 'x';
            ed.insertNodeTemplateIn(c, c.mapNodes[0].id, m.key);
            t.uguale([], ed.textIssues(c).map(i => i.msg), m.key);
        });
    });

    t.test('due volte lo stesso modello: chiavi nuove, niente sovrascritto', () => {
        const c = ed.blankCampaign();
        const a = ed.insertNodeTemplateIn(c, c.mapNodes[0].id, 'bivio');
        const b = ed.insertNodeTemplateIn(c, c.mapNodes[0].id, 'bivio');
        t.ok(a.challengeId !== b.challengeId && c.challenges[a.challengeId] && c.challenges[b.challengeId], `${a.challengeId} / ${b.challengeId}`);
        t.ok(a.id !== b.id, 'id dei nodi diversi');
        t.uguale(null, ed.insertNodeTemplateIn(c, null, 'non_esiste'));
    });
};
