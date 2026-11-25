// Controllo dei testi dell'editor (js/editor/testi.js): refusi, lunghezza, "Scudi" minuscolo, testi vuoti
const { caricaPagina } = require('./ambiente');

module.exports = (t) => {
    const ed = caricaPagina('editor.html');
    const problemi = s => ed.controllaTesto(s).join(' | ');

    t.test('refusi comuni', () => {
        t.ok(/doppio spazio/.test(problemi('Il  ponte crollato')), 'doppio spazio');
        t.ok(/spazio prima/.test(problemi('Avanti , presto !')), 'spazio prima della punteggiatura');
        t.ok(/po'/.test(problemi('Riposate un pò.')), 'un pò');
        t.ok(/qual è/.test(problemi("Qual'è la strada?")), "qual'è");
        t.ok(/perché/.test(problemi('Non so perchè.')), 'perchè');
        t.ok(/poiché/.test(problemi('Fuggite, poichè arrivano.')), 'poichè');
        t.ok(/né/.test(problemi('Non c\'è acqua nè cibo.')), 'nè');
        t.ok(/È/.test(problemi("E' tardi.")), "E'");
        t.ok(/mescolati/.test(problemi("L'orso e l’ascia")), 'apostrofi misti');
    });

    t.test('testi corretti: nessun avviso', () => {
        ['Riposate un po\'. Qual è la strada? Non so perché, né dove.', 'È tardi... forse troppo.', 'Il cavaliere alza lo scudo e para il colpo.',
            'Gli scudi dei soldati giacciono nel fango.', 'Uno scudo di quercia, 10 Scudi.', 'Pagate 5 Scudi al barcaiolo.', 'C\'è un\'aria strana.']
            .forEach(s => t.uguale('', problemi(s), s));
    });

    t.test('"scudi" minuscolo solo quando è la valuta', () => {
        t.ok(/Scudi/.test(problemi('Trovate 15 scudi nella cassa.')), 'numero + scudi');
        t.ok(/Scudi/.test(problemi('Un gruzzolo di scudi.')), 'gruzzolo di scudi');
        t.ok(/Scudi/.test(problemi('Il passaggio costa scudi sonanti.')), 'costa scudi');
        t.uguale('', problemi('Uno scudo spezzato e due scudi ammaccati.'));
    });

    t.test('testo troppo lungo per la casella', () => {
        t.ok(/troppo lungo \(61/.test(ed.controllaTesto('x'.repeat(61), 60).join()), 'oltre il limite');
        t.uguale(0, ed.controllaTesto('x'.repeat(60), 60).length);
    });

    t.test('avvisi della campagna: portano alla scheda e al campo giusti', () => {
        const c = ed.blankCampaign();
        c.description = 'Una valle  fredda.';
        c.introText = '';
        c.mapNodes[0].title = '';
        c.challenges = { ponte: { title: 'Il ponte', stat: 'int', cd: 6, desc: 'Servono 10 scudi.', successText: 'x', failText: 'y', ignoreText: 'z' } };
        c.stories = { trama_1: { title: 'La radura', text: 'Silenzio.', scelte: [{ testo: '', esito: 'Bene' }] } };
        c.mapNodes[1].type = 'story';
        c.mapNodes[1].storyId = 'trama_1';
        const is = ed.textIssues(c);
        const trova = re => is.find(i => re.test(i.msg));
        const desc = trova(/descrizione breve.*doppio spazio/);
        t.ok(desc && desc.tab === 'general' && desc.field === '[data-field="description"]', JSON.stringify(desc));
        t.ok(trova(/testo introduttivo.*vuoto/), 'testo introduttivo vuoto');
        const nodo = trova(/Nodo.*titolo.*vuoto/);
        t.ok(nodo && nodo.tab === 'map' && nodo.sel === c.mapNodes[0].id && /data-field="title"/.test(nodo.field), JSON.stringify(nodo));
        const sfida = trova(/Sfida.*Scudi/);
        t.ok(sfida && sfida.tab === 'challenges' && sfida.sel === 'ponte' && sfida.field === '[data-field="desc"]', JSON.stringify(sfida));
        const scelta = trova(/scelta 1.*pulsante.*vuoto/);
        t.ok(scelta && scelta.sel === c.mapNodes[1].id && /\.ed-story/.test(scelta.field), JSON.stringify(scelta));
        t.ok(is.every(i => i.level === 'warn'), 'solo consigli, mai errori');
    });

    t.test('le campagne del progetto hanno pochi avvisi sui testi', () => {
        Object.values(ed.CAMPAIGNS_RAW || ed.CAMPAIGNS).forEach(c => {
            const n = ed.textIssues(c).length;
            if (n > 10) t.avviso(`${c.id}: ${n} avvisi sui testi (vedi "Da sistemare" nell'editor)`);
        });
    });
};
