// Numeri casuali della partita (rng in js/comune.js): con un seme la sequenza si ripete uguale
module.exports = (t, carica) => {
    const g = carica();

    t.test('rng con seme: stessa sequenza a parità di seme, poi di nuovo casuale', () => {
        g.setRngSeed(42);
        const a = [g.rng(), g.rng(), g.rng()];
        g.setRngSeed(42);
        const b = [g.rng(), g.rng(), g.rng()];
        g.setRngSeed(null);
        t.uguale(a, b);
        t.ok(a.every(x => x >= 0 && x < 1));
        t.ok(g.getRngState() === null, 'senza seme torna Math.random');
    });

    t.test('una partita simulata con lo stesso seme finisce allo stesso modo', () => {
        const id = Object.keys(g.CAMPAIGNS).find(k => g.CAMPAIGNS[k].heroes && g.CAMPAIGNS[k].heroes.length && !g.CAMPAIGNS[k].procedurale);
        const data = g.simCampaignData(id);
        const sel = data.heroes.slice(0, 3).map(h => ({ name: h.name, abilityIdx: 0, itemIdx: -1 }));
        const gioca = () => {
            g.setRngSeed(7);
            const r = g.simRunOne(data, sel, g.eval('SIM_PROFILES').esperto);
            g.setRngSeed(null);
            return JSON.stringify(r);
        };
        t.uguale(gioca(), gioca());
    });
};
