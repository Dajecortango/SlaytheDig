// Eroi al massimo nella compagnia: 5 di norma, il campo "maxEroi" della campagna può cambiarlo,
// mai più degli eroi che la campagna ha.
module.exports = (t, carica) => {
    const g = carica();
    const eroi = n => Array.from({ length: n }, (_, i) => ({ name: `E${i}` }));

    t.test('partyMaxSize: 5 di norma, maxEroi se c\'è, mai più degli eroi della campagna', () => {
        t.uguale(5, g.partyMaxSize({ heroes: eroi(7) }));
        t.uguale(4, g.partyMaxSize({ heroes: eroi(4) }));
        t.uguale(6, g.partyMaxSize({ heroes: eroi(7), maxEroi: 6 }));
        t.uguale(4, g.partyMaxSize({ heroes: eroi(4), maxEroi: 6 }));
    });

    t.test('Loch Ein parte 1 e 2: si possono scegliere 6 eroi', () => {
        for (const id of ['loch_ein_parte_1', 'loch_ein_parte_2']) {
            t.uguale(6, g.partyMaxSize(g.simCampaignData(id).campaign), id);
        }
    });
};
