// Memoria del browser: quanto spazio usa il gioco, "Esporta tutto" e il ripristino da file
module.exports = (t, carica) => {
    const g = carica();

    // localStorage con key() e length, come quello vero
    const memoria = () => {
        const data = {};
        return {
            getItem: k => (k in data ? data[k] : null),
            setItem: (k, v) => { data[k] = String(v); },
            removeItem: k => { delete data[k]; },
            key: i => Object.keys(data)[i] ?? null,
            get length() { return Object.keys(data).length; },
            _data: data
        };
    };

    t.test('memoria usata: conta chiavi e valori, separa quelli del gioco', () => {
        const ls = memoria();
        g.localStorage = ls;
        ls.setItem('dignitas_save_1', 'x'.repeat(100));
        ls.setItem('altro_sito', 'y'.repeat(50));
        const m = g.memoriaUsata();
        t.uguale('dignitas_save_1'.length + 100 + 'altro_sito'.length + 50, m.totale);
        t.uguale('dignitas_save_1'.length + 100, m.gioco);
        t.uguale(1, m.chiavi.length);
        t.ok(m.quota > 0 && m.quota < 0.01, 'quota piccola');
    });

    t.test('esporta tutto e ripristina: solo le chiavi dignitas_*, file sbagliati rifiutati', () => {
        const ls = memoria();
        g.localStorage = ls;
        ls.setItem('dignitas_save_2', '{"a":1}');
        ls.setItem('dignitas_progresso', '["tutorial"]');
        ls.setItem('estraneo', 'z');
        const backup = g.backupCompleto();
        t.uguale('slay-the-dig-backup', backup.tipo);
        t.uguale(2, Object.keys(backup.chiavi).length);

        const nuovo = memoria();
        g.localStorage = nuovo;
        backup.chiavi.intruso = 'no';
        t.ok(g.ripristinaBackup(backup), 'ripristinato');
        t.uguale('{"a":1}', nuovo.getItem('dignitas_save_2'));
        t.uguale('["tutorial"]', nuovo.getItem('dignitas_progresso'));
        t.uguale(null, nuovo.getItem('intruso'), 'chiavi estranee ignorate');
        t.ok(!g.ripristinaBackup({ tipo: 'altro', chiavi: {} }), 'tipo sbagliato');
        t.ok(!g.ripristinaBackup(null), 'niente file');
    });
};
