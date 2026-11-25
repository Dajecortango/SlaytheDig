// Progressi: i capitoli si aprono uno dopo l'altro, le avventure in ordine (Caccia alla Bestia, Fredlös, Loch Ein),
// gli eroi del Drakengrad finendo le avventure. "Sblocca tutto" (opzione del master) apre tutto.
module.exports = (t, carica) => {
    const CACCIA = ['astarte_ch1', 'astarte_ch2', 'astarte_ch3', 'caccia_alla_bestia_capitolo_finale'];
    const FREDLOS = ['fredlos_parte_1', 'fredlos_parte_2', 'fredlos_parte_3'];
    const LOCH = ['loch_ein_parte_1', 'loch_ein_parte_2', 'loch_ein_parte_3'];
    const nomi = g => g.eval('campaignHeroes').map(h => h.libId);

    t.test('all\'inizio: solo il primo capitolo di Caccia alla Bestia; Fredlös e Loch Ein chiuse', () => {
        const g = carica();
        t.uguale('', g.bloccoCampagna('astarte_ch1'));
        t.ok(g.bloccoCampagna('astarte_ch2').includes('Capitolo Uno'), g.bloccoCampagna('astarte_ch2'));
        t.ok(g.bloccoAvventura('fredlos').includes('Caccia alla Bestia'));
        t.ok(g.bloccoAvventura('loch_ein').includes('Fredlös'));
        t.ok(g.bloccoCampagna('fredlos_parte_1') && g.bloccoCampagna('loch_ein_parte_1'));
        ['tutorial', 'drakengrad'].forEach(id => t.uguale('', g.bloccoCampagna(id), `${id} sempre aperta`));
        const voci = g.campaignMenuEntries();
        t.uguale([false, true, true], ['caccia_alla_bestia', 'fredlos', 'loch_ein'].map(id => !!voci.find(e => e.id === id).blocco));
    });

    t.test('vincendo si apre il capitolo dopo, poi l\'avventura dopo; i progressi restano', () => {
        const g = carica();
        t.ok(g.segnaCampagnaCompletata('astarte_ch1').some(n => /Capitolo Due/.test(n)), 'dice cosa si è aperto');
        t.uguale('', g.bloccoCampagna('astarte_ch2'));
        t.ok(g.bloccoCampagna('astarte_ch3'), 'il terzo resta chiuso');
        t.uguale([], g.segnaCampagnaCompletata('astarte_ch1'), 'rivincere non sblocca altro');
        CACCIA.slice(1, 3).forEach(id => g.segnaCampagnaCompletata(id));
        t.ok(g.bloccoAvventura('fredlos'), 'manca il capitolo finale');
        const nuovi = g.segnaCampagnaCompletata(CACCIA[3]);
        t.uguale('', g.bloccoAvventura('fredlos'));
        t.ok(nuovi.includes('Icaro') && nuovi.some(n => /Fredlös/.test(n)), nuovi.join(', '));
        t.ok(g.bloccoCampagna('fredlos_parte_2') && g.bloccoAvventura('loch_ein'));
        FREDLOS.forEach(id => g.segnaCampagnaCompletata(id));
        t.uguale('', g.bloccoCampagna('loch_ein_parte_1'));
        t.uguale(CACCIA.length + FREDLOS.length, g.campagneCompletate().size);
    });

    t.test('Drakengrad: prima i cinque del tutorial, poi quattro eroi per ogni avventura finita', () => {
        const g = carica();
        const tutorial = g.CAMPAIGNS.tutorial.heroes.map(h => h.libId);
        g.selectCampaign('drakengrad');
        t.uguale(tutorial, nomi(g));
        CACCIA.forEach(id => g.segnaCampagnaCompletata(id));
        g.selectCampaign('drakengrad');
        t.uguale([...tutorial, 'icaro', 'astarte', 'dioforo', 'ascadeo'], nomi(g));
        FREDLOS.forEach(id => g.segnaCampagnaCompletata(id));
        g.selectCampaign('drakengrad');
        t.uguale(13, nomi(g).length);
        t.ok(['zeno', 'aiace_dignitas', 'aurelio_dignitas', 'enea_dignitas'].every(id => nomi(g).includes(id)));
        LOCH.forEach(id => g.segnaCampagnaCompletata(id));
        g.selectCampaign('drakengrad');
        t.uguale(17, nomi(g).length);
        t.ok(['ofelia_dignitas', 'pandora_dignitas', 'pancrazio_dignitas', 'alastorta_dignitas'].every(id => nomi(g).includes(id)));
    });

    t.test('ogni eroe e ogni avventura di "eroiDopo" e "dopo" esiste', () => {
        const g = carica();
        const avv = g.LIBRERIA.avventure;
        Object.entries(avv).forEach(([id, a]) => t.ok(!a.dopo || (avv[a.dopo] && a.dopo !== id), `${id}: dopo ${a.dopo}`));
        Object.values(g.eval('CAMPAIGNS_RAW')).forEach(c => Object.entries(c.eroiDopo || {}).forEach(([a, ids]) => {
            t.ok(avv[a], `${c.id}: avventura ${a}`);
            ids.forEach(id => t.ok(c.heroes.includes(id), `${c.id}: ${id} non è fra gli eroi`));
        }));
    });

    t.test('"Sblocca tutto": tutto aperto senza toccare i progressi', () => {
        const g = carica();
        g.eval('gameOptions').sbloccaTutto = true;
        t.uguale('', g.bloccoCampagna('loch_ein_parte_3'));
        t.uguale('', g.bloccoAvventura('loch_ein'));
        g.selectCampaign('drakengrad');
        t.uguale(17, nomi(g).length);
        t.uguale(0, g.campagneCompletate().size);
    });
};
