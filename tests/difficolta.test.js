// Difficoltà delle campagne: il simulatore gioca ogni campagna con il profilo Esperto (un giocatore attento:
// gli altri profili hanno stili sbagliati apposta e abbassavano la media) e con ogni gruppo di eroi della
// dimensione massima scelta nel gioco (fino a 5; prima abilità e primo oggetto iniziale). Se la campagna ha il
// campo "difficolta" ({ vittoriaMin, vittoriaMax } in %), avvisa quando la vittoria esce dal margine.
// È un avviso e non un errore: il risultato è casuale e oscilla di qualche punto. Per una misura più
// precisa (scelte iniziali migliori, ricerca a simulazioni, margine d'errore): node tools/difficolta.mjs
const RUNS = 60;  // partite per gruppo
const MAX_GRUPPI = 8;

module.exports = (t, carica) => {
    const g = carica();
    const profili = ['esperto'];

    // Tutti i gruppi di "size" eroi (la compagnia più numerosa che il gioco permette, come setupPartySizeSelector)
    const gruppi = (heroes, size = Math.min(5, heroes.length)) => {
        if (size === 0) return [[]];
        return heroes.flatMap((h, i) => gruppi(heroes.slice(i + 1), size - 1).map(g => [h, ...g])).filter(g => g.length === size);
    };

    for (const id of Object.keys(g.CAMPAIGNS)) {
        t.test(`campagna ${id}: vittoria dell'Esperto nel simulatore`, () => {
            const data = g.simCampaignData(id);
            const giocabile = data.mapNodes.every(n => !['combat', 'elite'].includes(n.type) || (n.enemy && data.enemies[n.enemy]));
            if (!giocabile || data.heroes.length === 0) { console.log(`      ${id}: non simulata (campagna incompleta)`); return; }
            let somma = 0, conteggio = 0;
            // Con molti eroi (es. 9 eroi a gruppi di 5) si prova un campione di MAX_GRUPPI gruppi, per restare veloci
            const tutti = gruppi(data.heroes);
            const scelti = tutti.length > MAX_GRUPPI ? tutti.filter((_, i) => i % Math.ceil(tutti.length / MAX_GRUPPI) === 0) : tutti;
            for (const trio of scelti) {
                const sel = trio.map(h => ({ name: h.name, abilityIdx: 0, itemIdx: data.armory.length ? 0 : -1 }));
                const res = g.simRunAll(g.simCampaignData(id), sel, profili, RUNS);
                Object.values(res).forEach(r => { somma += r.winRate; conteggio++; });
            }
            const media = Math.round(somma / conteggio);
            const d = g.CAMPAIGNS[id].difficolta || {};
            const min = d.vittoriaMin ?? null, max = d.vittoriaMax ?? null;
            console.log(`      ${id}: Esperto vince il ${media}%${min != null || max != null ? ` (obiettivo ${min ?? 0}–${max ?? 100}%)` : ' (nessun obiettivo indicato)'}`);
            if (min != null && media < min) t.avviso(`${id}: troppo difficile, l'Esperto vince il ${media}%, sotto il ${min}%`);
            if (max != null && media > max) t.avviso(`${id}: troppo facile, l'Esperto vince il ${media}%, sopra il ${max}%`);
        });
    }
};
