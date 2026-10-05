// Difficoltà delle campagne: il simulatore gioca ogni campagna con tutti i profili e con ogni gruppo
// di eroi della dimensione massima scelta nel gioco (fino a 5; prima abilità e primo oggetto iniziale). Se la campagna ha il campo "difficolta"
// ({ vittoriaMin, vittoriaMax } in %), avvisa quando la vittoria media esce dal margine.
// È un avviso e non un errore: il risultato è casuale e oscilla di qualche punto.
const RUNS = 40;  // partite per profilo e per gruppo

module.exports = (t, carica) => {
    const g = carica();
    const profili = Object.keys(g.eval('SIM_PROFILES'));

    // Tutti i gruppi di "size" eroi (la compagnia più numerosa che il gioco permette, come setupPartySizeSelector)
    const gruppi = (heroes, size = Math.min(5, heroes.length)) => {
        if (size === 0) return [[]];
        return heroes.flatMap((h, i) => gruppi(heroes.slice(i + 1), size - 1).map(g => [h, ...g])).filter(g => g.length === size);
    };

    for (const id of Object.keys(g.CAMPAIGNS)) {
        t.test(`campagna ${id}: vittoria media del simulatore`, () => {
            const data = g.simCampaignData(id);
            const giocabile = data.mapNodes.every(n => !['combat', 'elite'].includes(n.type) || (n.enemy && data.enemies[n.enemy]));
            if (!giocabile || data.heroes.length === 0) { console.log(`      ${id}: non simulata (campagna incompleta)`); return; }
            let somma = 0, conteggio = 0;
            for (const trio of gruppi(data.heroes)) {
                const sel = trio.map(h => ({ name: h.name, abilityIdx: 0, itemIdx: data.armory.length ? 0 : -1 }));
                const res = g.simRunAll(g.simCampaignData(id), sel, profili, RUNS);
                Object.values(res).forEach(r => { somma += r.winRate; conteggio++; });
            }
            const media = Math.round(somma / conteggio);
            const d = g.CAMPAIGNS[id].difficolta || {};
            const min = d.vittoriaMin ?? null, max = d.vittoriaMax ?? null;
            console.log(`      ${id}: vittoria media ${media}%${min != null || max != null ? ` (obiettivo ${min ?? 0}–${max ?? 100}%)` : ' (nessun obiettivo indicato)'}`);
            if (min != null && media < min) t.avviso(`${id}: troppo difficile, vittoria media ${media}% sotto il ${min}%`);
            if (max != null && media > max) t.avviso(`${id}: troppo facile, vittoria media ${media}% sopra il ${max}%`);
        });
    }
};
