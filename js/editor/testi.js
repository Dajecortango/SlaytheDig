/* ==========================================================================
   EDITOR: CONTROLLO DEI TESTI
   Consigli sui testi della campagna aperta, nella colonna "Da sistemare" (validateCampaign li aggiunge):
   testi troppo lunghi per la loro casella, refusi comuni dell'italiano, "scudi" minuscolo quando è la
   valuta, testi vuoti che il giocatore vedrebbe. Ogni avviso porta al campo (issue.field: selettore CSS
   della casella dentro #edContent, vedi renderIssues in js/editor/controlli.js).
   controllaTesto è pura (niente DOM): la provano tests/editor_testi.test.js.
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

/* Lunghezza massima (caratteri) che sta bene nella casella del gioco: titoli sulla mappa e sui pulsanti,
   descrizioni nelle schermate. Valori presi un po' sopra i testi più lunghi delle campagne attuali. */
const TESTI_LIMITI = {
    'campagna.title': 50, 'campagna.badge': 24, 'campagna.description': 320, 'campagna.introText': 900,
    'nodo.title': 60,
    'trama.title': 50, 'trama.text': 1500, 'scelta.testo': 70, 'scelta.esito': 700,
    'sfida.title': 50, 'sfida.desc': 1200, 'sfida.ignoreText': 400, 'sfida.successText': 900, 'sfida.failText': 900, 'strada.testo': 70,
    'luogo': 1200   // testi di riposi, mercanti e tesori
};

// Parole con l'accento acuto (é) scritte spesso con quello grave (è)
const TESTI_ACUTE = /\b(perch|poich|bench|affinch|finch|cosicch|giacch|sicch|purch|nonch|anzich|fuorch)è(?![\p{L}])/iu;
// Parole vicine agli Scudi quando sono la valuta ("un gruzzolo di scudi", "costa scudi")
const TESTI_VALUTA = /\b(gruzzol\w*|sacchett\w*|borsell\w*|borsa|borse|manciata|mucchio|costa|costano|costare|pagate|pagare|paga|spendere|spendete|guadagnate|guadagnare|ricompensa)\s+(di\s+|in\s+)?scud[oi]\b/;

/* Problemi di un testo, in parole semplici (elenco vuoto = tutto bene).
   limite: caratteri al massimo (facoltativo). */
function controllaTesto(testo, limite = 0) {
    const out = [];
    const s = String(testo ?? '');
    if (!s) return out;
    if (limite && s.length > limite) out.push(`troppo lungo (${s.length} caratteri, ne stanno circa ${limite})`);
    if (/\S {2,}\S/.test(s)) out.push('doppio spazio');
    if (/ +[,;:!?]/.test(s) || / +\.(?!\.)/.test(s)) out.push('spazio prima della punteggiatura');
    if (/\bp[òó](?![\p{L}])/iu.test(s)) out.push('"pò": si scrive "po\'"');
    if (/\bqual['’] ?(è|e|era)(?![\p{L}])/iu.test(s)) out.push('"qual\'è": si scrive "qual è" (senza apostrofo)');
    const acuta = s.match(TESTI_ACUTE);
    if (acuta) out.push(`"${acuta[0]}": si scrive con l'accento acuto (${acuta[0].slice(0, -1)}é)`);
    if (/(^|[^\p{L}'’])nè(?![\p{L}])/u.test(s)) out.push('"nè": si scrive "né"');
    if (/(^|[^\p{L}])E['’](?=\s)/u.test(s)) out.push('"E\'": si scrive "È"');
    if (/'/.test(s) && /’/.test(s)) out.push('apostrofi diritti (\') e curvi (’) mescolati');
    if (/\b\d+\s+scud[oi]\b/.test(s) || TESTI_VALUTA.test(s)) out.push('la valuta si scrive "Scudi" con la maiuscola');
    return out;
}

/* Tutti i consigli sui testi della campagna c, nel formato di validateCampaign
   ({ level, msg, tab, sel, field }). field = dove mettere il cursore. */
function textIssues(c) {
    const out = [];
    const quale = (dove, campo, testo, chiave, tab, sel, field, vuoto) => {
        const t = typeof testo === 'string' ? testo : '';
        if (!t.trim()) {
            if (vuoto) out.push({ level: 'warn', msg: `${dove}: il campo «${campo}» è vuoto`, tab, sel, field });
            return;
        }
        controllaTesto(t, TESTI_LIMITI[chiave]).forEach(p => out.push({ level: 'warn', msg: `${dove}, ${campo}: ${esc(p)}`, tab, sel, field }));
    };
    const campo = k => `[data-field="${k}"]`;

    quale('Campagna', 'titolo', c.title, 'campagna.title', 'general', null, campo('title'), false);  // il titolo vuoto lo dice già validateCampaign
    quale('Campagna', 'etichetta', c.badge, 'campagna.badge', 'general', null, campo('badge'), false);
    quale('Campagna', 'descrizione breve', c.description, 'campagna.description', 'general', null, campo('description'), true);
    quale('Campagna', 'testo introduttivo', c.introText, 'campagna.introText', 'general', null, campo('introText'), true);

    const nodi = c.mapNodes || [];
    nodi.forEach(n => quale(`Nodo <b>${esc(n.title || n.id)}</b>`, 'titolo', n.title, 'nodo.title', 'map', n.id, `#edDetail > :not(.ed-story) ${campo('title')}`, true));

    Object.entries(c.stories || {}).forEach(([k, s]) => {
        const nodo = nodi.find(n => n.storyId === k);
        if (!nodo || !s) return;   // una trama che nessun nodo usa non si vede nel gioco
        const dove = `Trama <b>${esc(s.title || k)}</b>`;
        const box = sel => `.ed-story ${sel}`;
        quale(dove, 'titolo', s.title, 'trama.title', 'map', nodo.id, box(campo('title')), false);
        quale(dove, 'descrizione', s.text, 'trama.text', 'map', nodo.id, box(campo('text')), false);  // vuota: la segnala già nodeProblems
        (Array.isArray(s.scelte) ? s.scelte : []).forEach((x, i) => {
            quale(`${dove}, scelta ${i + 1}`, 'testo del pulsante', x && x.testo, 'scelta.testo', 'map', nodo.id, box(campo('scelte')), true);
            quale(`${dove}, scelta ${i + 1}`, 'esito', x && x.esito, 'scelta.esito', 'map', nodo.id, box(campo('scelte')), true);
        });
    });

    Object.entries(c.challenges || {}).forEach(([k, s]) => {
        if (!s) return;
        const dove = `Sfida <b>${esc(s.title || k)}</b>`;
        // I testi vuoti delle sfide li segnala già validateCampaign: qui solo lunghezza e refusi
        [['title', 'titolo'], ['desc', 'descrizione'], ['ignoreText', 'testo se ignorata'], ['successText', 'testo di successo'], ['failText', 'testo di fallimento']]
            .forEach(([f, nome]) => quale(dove, nome, s[f], `sfida.${f}`, 'challenges', k, campo(f), false));
        (Array.isArray(s.testiSacrificio) ? s.testiSacrificio : []).forEach((t, i) => quale(dove, `testo dopo il ${i + 1}° sacrificio`, t, 'sfida.successText', 'challenges', k, campo(`testiSacrificio.${i}`), false));
        (Array.isArray(s.strade) ? s.strade : []).forEach((r, i) => {
            if (!r) return;
            quale(`${dove}, modo ${i + 1}`, 'testo del pulsante', r.testo, 'strada.testo', 'challenges', k, campo('strade'), false);
            quale(`${dove}, modo ${i + 1}`, 'testo di successo', r.successText, 'sfida.successText', 'challenges', k, campo('strade'), false);
            quale(`${dove}, modo ${i + 1}`, 'testo di fallimento', r.failText, 'sfida.failText', 'challenges', k, campo('strade'), false);
        });
    });

    // Riposi, mercanti e tesori: si scrivono nella scheda Testi (il riposo anche sotto il suo nodo)
    [['rests', 'Riposo'], ['merchants', 'Mercante'], ['treasures', 'Tesoro']].forEach(([coll, nome]) =>
        Object.entries(c[coll] || {}).forEach(([k, t]) => {
            const nodo = coll === 'rests' && nodi.find(n => n.type === 'rest' && (n.restId || 'default') === k);
            if (nodo) quale(`${nome} <b>${esc(nodo.title || k)}</b>`, 'messaggio', t, 'luogo', 'map', nodo.id, '.ed-story textarea', false);
            else quale(`${nome} <b>${esc(k)}</b>`, 'testo', t, 'luogo', 'other', null, `#edOther_${coll}`, false);
        }));
    return out;
}
