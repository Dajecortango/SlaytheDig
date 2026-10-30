// Avventure (data/libreria/avventure.js): nel menu "Nuova Partita" le campagne con "avventura" diventano capitoli
// di una sola scheda, in ordine di "capitolo"; le altre restano schede a sé (campaignMenuEntries in js/game.js)
module.exports = (t, carica) => {
    const g = carica();
    const voci = () => g.campaignMenuEntries();

    t.test('ogni campagna con "avventura" richiama un\'avventura della libreria, con un numero di capitolo', () => {
        Object.values(g.CAMPAIGNS_RAW).filter(c => c.avventura).forEach(c => {
            t.ok(g.LIBRERIA.avventure[c.avventura], `${c.id}: avventura "${c.avventura}" esiste`);
            t.ok(Number.isInteger(c.capitolo) && c.capitolo > 0, `${c.id}: capitolo`);
        });
    });

    t.test('Caccia alla Bestia: una scheda sola con i quattro capitoli in ordine', () => {
        const caccia = voci().find(e => e.id === 'caccia_alla_bestia');
        t.ok(caccia && caccia.kind === 'avventura', 'è un\'avventura');
        t.uguale('astarte_ch1,astarte_ch2,astarte_ch3,caccia_alla_bestia_capitolo_finale', caccia.chapters.map(c => c.id).join(','));
        t.ok(!voci().some(e => e.kind === 'campagna' && e.id.startsWith('astarte_')), 'i capitoli non sono anche schede a sé');
    });

    t.test('senza avventura una campagna resta una scheda a sé; ogni campagna giocabile compare una volta', () => {
        const tutorial = voci().find(e => e.id === 'tutorial');
        t.ok(tutorial && tutorial.kind === 'campagna', 'tutorial a sé');
        const ids = voci().flatMap(e => e.kind === 'avventura' ? e.chapters.map(c => c.id) : [e.id]).sort();
        t.uguale(g.playableCampaigns().map(c => c.id).sort().join(','), ids.join(','));
    });

    t.test('copertina dell\'avventura: la sua, altrimenti quella del primo capitolo che ne ha una', () => {
        const caccia = voci().find(e => e.id === 'caccia_alla_bestia');
        t.uguale(g.CAMPAIGNS.astarte_ch1.coverImage, caccia.cover);
    });

    t.test('nome del capitolo nell\'elenco: senza il nome dell\'avventura davanti', () => {
        t.uguale('Capitolo Uno', g.chapterLabel({ title: 'Caccia alla Bestia, Capitolo Uno' }, 'Caccia alla Bestia'));
        t.uguale('Capitolo Finale', g.chapterLabel({ title: 'Caccia Alla Bestia - Capitolo Finale' }, 'Caccia alla Bestia'));
        t.uguale('Parte I: La Danza di Kesia', g.chapterLabel({ title: 'Fredlös, Parte I: La Danza di Kesia' }, 'Fredlös'));
        t.uguale('Un altro nome', g.chapterLabel({ title: 'Un altro nome' }, 'Caccia alla Bestia'));
    });
};
