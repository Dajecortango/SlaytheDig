// Dati delle campagne: ogni riferimento per id deve esistere nella libreria.
// I campi lasciati vuoti (campagna ancora in lavorazione) sono solo avvisi, non errori.
const fs = require('fs');
const path = require('path');
const { ROOT } = require('./ambiente');

module.exports = (t, carica) => {
    const g = carica();
    const lib = g.LIBRERIA;
    const raw = g.CAMPAIGNS_RAW;

    for (const [id, c] of Object.entries(raw)) {
        t.test(`campagna ${id}: riferimenti alla libreria`, () => {
            const errori = [];
            (c.heroes || []).forEach(h => { if (typeof h === 'string' && !lib.eroi[h]) errori.push(`eroe ${h}`); });
            [...(c.initialArmory || []), ...(c.lootItems || [])].forEach(i => { if (typeof i === 'string' && !lib.armeria[i]) errori.push(`oggetto ${i}`); });
            Object.entries(c.challenges || {}).forEach(([k, ch]) => {
                if (typeof ch.reward === 'string' && !lib.reliquie[ch.reward]) errori.push(`sfida ${k}: reliquia ${ch.reward}`);
                if (typeof ch.punishment === 'string' && !lib.maledizioni[ch.punishment]) errori.push(`sfida ${k}: maledizione ${ch.punishment}`);
            });
            const nodi = c.mapNodes || [];
            nodi.forEach(n => {
                if (n.enemy && !lib.bestiario[n.enemy] && !(c.enemies || {})[n.enemy]) errori.push(`nodo ${n.id}: nemico ${n.enemy}`);
                if (n.challengeId && !(c.challenges || {})[n.challengeId]) errori.push(`nodo ${n.id}: sfida ${n.challengeId}`);
                (n.next || []).forEach(x => { if (!nodi.some(m => m.id === x)) errori.push(`nodo ${n.id}: collegamento a ${x} che non esiste`); });
            });
            t.ok(!errori.length, errori.join('; '));

            // Avvisi: campi vuoti, nodi senza uscita
            const vuoti = nodi.filter(n => (['combat', 'elite'].includes(n.type) && !n.enemy) || (n.type === 'challenge' && !n.challengeId)).length;
            if (vuoti) t.avviso(`${id}: ${vuoti} nodi senza nemico o senza sfida (campagna in lavorazione?)`);
            const maxLevel = Math.max(...nodi.map(n => n.level));
            const ciechi = nodi.filter(n => !(n.next || []).length && n.level !== maxLevel && n.type !== 'captain').map(n => n.id);
            if (ciechi.length) t.avviso(`${id}: nodi senza uscita prima della fine: ${ciechi.join(', ')}`);
        });
    }

    t.test('ogni immagine richiamata dalla libreria e dalle campagne esiste (o ha il segnaposto)', () => {
        const percorsi = new Set();
        Object.values(lib.bestiario).forEach(e => e.image && percorsi.add(e.image));
        Object.values(lib.eroi).forEach(h => { if (h.portrait) percorsi.add(h.portrait); if (h.portraitWounded) percorsi.add(h.portraitWounded); });
        Object.values(lib.armeria).forEach(i => i.icon && percorsi.add(i.icon));
        Object.values(lib.abilita).forEach(a => a.icon && percorsi.add(a.icon));
        Object.values(raw).forEach(c => (c.mapNodes || []).forEach(n => n.image && percorsi.add(n.image)));
        const mancanti = [...percorsi].filter(p => !fs.existsSync(path.join(ROOT, p)));
        // Ritratti e icone mancanti sono errori; scene di nodi e nemici hanno il segnaposto
        const gravi = mancanti.filter(p => p.startsWith('immagini/ritratti/') || p.startsWith('immagini/icone/'));
        t.ok(!gravi.length, `mancano: ${gravi.join(', ')}`);
        if (mancanti.length > gravi.length) t.avviso(`${mancanti.length - gravi.length} scene senza immagine (si vede il segnaposto)`);
    });
};
