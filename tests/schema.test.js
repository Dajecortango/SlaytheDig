// Scheda dei dati (js/schema.js): i dati la rispettano e i moduli dell'editor non hanno campi che lei non conosce
const { caricaPagina } = require('./ambiente');

const LIBRERIE = ['armeria', 'bestiario', 'reliquie', 'maledizioni', 'abilita', 'eroi', 'azioni_elite', 'benedizioni'];

module.exports = (t, carica) => {
    const g = carica();
    const S = g.eval('DATI_SCHEMA');

    t.test('ogni elemento della libreria rispetta la scheda dei dati (niente campi sconosciuti)', () => {
        LIBRERIE.forEach(kind => g.controllaLibreria(kind, g.LIBRERIA[kind]).forEach(p => t.ok(false, `${p.livello}: ${p.msg}`)));
    });

    t.test('ogni campagna (sfide, trame, nodi) rispetta la scheda dei dati', () => {
        Object.values(g.CAMPAIGNS_RAW).forEach(c => g.controllaCampagna(c).forEach(p => t.ok(false, `${p.livello}: ${p.msg}`)));
    });

    t.test('il controllo trova i problemi: campo sconosciuto, tipo sbagliato, obbligatorio mancante, valore non ammesso, effetto sbagliato', () => {
        const p = g.controllaElemento(S.armeria, { name: 'Spada', dmg: 'tanto', rarity: 'mitico', forza: 2,
            speciali: [{ quando: 'colpo', fai: 'sconto', val: 1 }] }, 'prova');
        const msg = p.map(x => `${x.livello} ${x.msg}`).join(' | ');
        t.ok(/avviso.*"forza" sconosciuto/.test(msg), 'campo sconosciuto');
        t.ok(/errore.*"dmg" deve essere un numero/.test(msg), 'tipo');
        t.ok(/errore.*"rarity" vale "mitico"/.test(msg), 'valore');
        t.ok(/errore.*"sconto" non ha senso con "colpo"/.test(msg), 'effetto speciale');
        t.ok(g.controllaElemento(S.bestiario, { name: 'Lupo' }, 'prova').some(x => /manca "hp"/.test(x.msg)), 'obbligatorio');
    });

    // I moduli dell'editor descrivono gli stessi campi: un campo nell'editor che la scheda non ha è un dato che il gioco non legge
    t.test('ogni campo dei moduli dell\'editor esiste nella scheda dei dati', () => {
        const ed = caricaPagina('editor.html');
        const moduli = {
            GENERAL_FIELDS: 'campagna', HERO_LIB_FIELDS: 'eroi', ABILITY_FIELDS: 'abilita', ITEM_FIELDS: 'armeria', ENEMY_FIELDS: 'bestiario',
            ELITE_ACTION_FIELDS: 'azioni_elite', RELIC_FIELDS: 'reliquie', BLESSING_FIELDS: 'benedizioni', CURSE_FIELDS: 'maledizioni',
            CHALLENGE_FIELDS: 'sfida', NODE_FIELDS: 'nodo', STORY_FIELDS: 'trama'
        };
        Object.entries(moduli).forEach(([nome, kind]) => {
            const campi = ed.eval(nome);
            t.ok(Array.isArray(campi) && campi.length, nome);
            campi.filter(f => f.type !== 'portraitframe').forEach(f => {
                const [k, sub] = f.k.split('.');
                const c = S[kind][k];
                t.ok(c, `${nome}: "${k}" non è nella scheda di ${kind}`);
                if (c && sub) t.ok(c.schema && c.schema[sub], `${nome}: "${f.k}" non è nella scheda di ${kind}`);
            });
        });
    });

    t.test('riferimenti per id negli effetti: oggetto, reliquia e maledizione che non esistono sono errori', () => {
        const effetti = [{ effect: 'hero_item', item: 'non_esiste', val: 1 }, { effect: 'relic', id: 'nessuna' }, { effect: 'curse', id: 'nessuna' },
            { effect: 'hero_item', item: 'cristallo_flammaurea', val: 1 }];
        const out = g.controllaRiferimentiEffetti(effetti, 'Prova');
        t.uguale(3, out.length);
        t.ok(/oggetto "non_esiste" non trovato/.test(out[0].msg), out[0].msg);
        const abil = { name: 'X', speciali: [{ quando: 'uscita_mercante', fai: 'oggetto', item: 'non_esiste' }] };
        t.ok(g.controllaElemento(S.abilita, abil, 'X').some(p => /non_esiste/.test(p.msg)), 'anche negli effetti speciali');
    });

    t.test('riferimenti: nell editor contano gli oggetti della libreria in modifica (SCHEMA_LIB)', () => {
        const abil = { name: 'X', speciali: [{ quando: 'uscita_mercante', fai: 'oggetto', item: 'nuovo_dall_editor' }] };
        t.ok(g.controllaElemento(S.abilita, abil, 'X').length > 0, 'con la libreria caricata manca');
        try {
            g.eval('SCHEMA_LIB = { armeria: { nuovo_dall_editor: { name: "Nuovo" } } }');
            t.uguale(0, g.controllaElemento(S.abilita, abil, 'X').length, 'con quella in modifica c è');
        } finally { g.eval('SCHEMA_LIB = null'); }
    });
};
