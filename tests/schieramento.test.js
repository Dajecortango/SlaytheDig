// Schieramento: al riposo il master riordina gli eroi (trascinando le carte, o con le frecce del master a distanza)
module.exports = (t, carica) => {
    const eroe = nome => ({ name: nome, hp: 4, maxHp: 4, dmg: 1, str: 1, int: 1, fth: 1, base_armor: 0, current_armor: 0, items: [] });
    const ordine = g => g.eval('stato.party.map(h => h.name).join()');
    const prepara = (schermata = 'screenRest') => {
        const g = carica();
        g.eval('stato').party = ['A', 'B', 'C', 'D'].map(eroe);
        g.eval(`currentScreenId = '${schermata}'; updatePartyStatusBars = () => {};`);
        return g;
    };

    t.test('spostaEroe: al riposo porta un eroe in una posizione, gli altri scalano', () => {
        const g = prepara();
        t.ok(g.spostaEroe('A', 2));
        t.uguale('B,C,A,D', ordine(g));
        t.ok(g.spostaEroe('D', 0));
        t.uguale('D,B,C,A', ordine(g));
        t.ok(g.spostaEroe('B', 99), 'oltre la fine: ultimo posto');
        t.uguale('D,C,A,B', ordine(g));
        t.ok(!g.spostaEroe('C', 1), 'stesso posto: niente');
        t.ok(!g.spostaEroe('Nessuno', 0));
        t.uguale('D,C,A,B', ordine(g));
    });

    t.test('spostaEroe: anche un eroe caduto si sposta; fuori dal riposo no', () => {
        const g = prepara();
        g.eval('stato.party[1].hp = 0');
        t.ok(g.spostaEroe('B', 3));
        t.uguale('A,C,D,B', ordine(g));
        const scontro = prepara('screenCombat');
        t.ok(!scontro.spostaEroe('A', 2));
        t.ok(!scontro.spostaEroeDi('A', 1));
        t.uguale('A,B,C,D', ordine(scontro));
    });

    t.test('frecce del master a distanza: un posto alla volta, solo al riposo e non ai bordi', () => {
        const g = prepara();
        t.ok(g.spostaEroeDi('B', -1));
        t.uguale('B,A,C,D', ordine(g));
        t.ok(!g.spostaEroeDi('B', -1), 'già primo');
        t.ok(g.spostaEroeDi('C', 1));
        t.uguale('B,A,D,C', ordine(g));
        const primo = g.riordinoFrecceHtml(g.eval('stato.party[0]')), mezzo = g.riordinoFrecceHtml(g.eval('stato.party[1]'));
        t.ok(!primo.includes('◀') && primo.includes('▶'), 'il primo non va a sinistra');
        t.ok(mezzo.includes('◀') && mezzo.includes('▶'));
        t.ok(mezzo.includes('data-action="spostaEroeDi"'));
        t.uguale('', prepara('screenMap').riordinoFrecceHtml(eroe('A')), 'fuori dal riposo niente frecce');
    });

    t.test('online: riordinare è del master, un giocatore non può', () => {
        const g = carica();
        const ctx = { schermata: 'screenRest', owners: { A: 'Marco' }, modalOwner: null, voto: null };
        ['spostaEroe', 'spostaEroeDi'].forEach(az => {
            const r = g.onlineCanRun(az, ['A', 1], 'Marco', ctx);
            t.ok(!r.ok && !r.voto && !r.pronto, `${az} solo del master`);
        });
    });

    t.test('posizioneRiordino: la carta trascinata prende il posto di quella di cui supera il centro', () => {
        const g = carica();
        const centri = [100, 300, 500, 700];
        t.uguale(0, g.posizioneRiordino(centri, 0, 250));
        t.uguale(1, g.posizioneRiordino(centri, 0, 320));
        t.uguale(3, g.posizioneRiordino(centri, 0, 900));
        t.uguale(0, g.posizioneRiordino(centri, 2, 50));
        t.uguale(1, g.posizioneRiordino(centri, 2, 290));
        t.uguale(2, g.posizioneRiordino(centri, 2, 520));
    });
};
