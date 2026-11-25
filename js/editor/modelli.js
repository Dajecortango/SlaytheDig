/* ==========================================================================
   EDITOR: MODELLI DI NODO PRONTI
   Nella scheda Mappa, "Modelli pronti": un clic aggiunge dopo il punto scelto un nodo già compilato
   (tipo, titolo, nemico o prova, testi in tono cupo) che poi si cambia come gli altri.
   I nemici, le reliquie e le maledizioni sono id della libreria condivisa (data/libreria/): se uno
   sparisce, tests/editor_modelli.test.js se ne accorge. Prove, trame e testi di riposi, mercanti
   e tesori finiscono nella campagna con una chiave nuova (mai sopra una che esiste già).
   insertNodeTemplateIn è pura sulla campagna passata (niente DOM): la usano i test.
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

const NODE_TEMPLATES = [
    {
        key: 'imboscata', label: 'Imboscata', type: 'combat', title: 'Imboscata sul sentiero', enemy: 'banditi_strada',
        desc: 'Scontro con dei banditi appostati tra gli alberi'
    },
    {
        key: 'tesoro_custodito', label: 'Tesoro custodito', type: 'elite', title: 'Il tesoro custodito', enemy: 'mastino_bokgar',
        desc: 'Scontro elite: una bestia veglia su qualcosa che vale la pena prendere'
    },
    {
        key: 'santuario', label: 'Santuario', type: 'story', title: 'Il santuario dimenticato',
        desc: 'Evento con una scelta: pregare (prova di Fede) o tirare dritto',
        trama: {
            title: 'Il santuario dimenticato',
            text: 'Tra i rovi affiora un altare di pietra annerita. Qualcuno, un tempo, ha inciso preghiere sulla sua base; ora il muschio le divora una lettera alla volta.\n\nL\'aria qui è ferma, come se trattenesse il fiato. Forse gli antichi dei ascoltano ancora. Forse non hanno mai ascoltato.',
            scelte: [
                { testo: 'Inginocchiarsi e pregare', stat: 'fth', cd: 7,
                  effetti: [{ effect: 'party_heal', val: 2 }],
                  esito: 'Le parole escono incerte, poi più salde. Un tepore lento scende sulle ferite: per una volta, qualcuno ha risposto.',
                  fallimento: { effetti: [{ effect: 'party_damage', val: 1 }],
                      esito: 'Il silenzio si fa più pesante. Una fitta gelida vi attraversa il petto: questo luogo non vuole visitatori.' } },
                { testo: 'Non disturbare i morti', esito: 'Lasciate l\'altare al suo muschio e alle sue preghiere. Certe porte è meglio non bussarle.' }
            ]
        }
    },
    {
        key: 'mercante_errante', label: 'Mercante errante', type: 'merchant', title: 'Il mercante errante',
        desc: 'Mercante con un testo suo',
        testo: 'Un carretto sgangherato, un mulo che non alza la testa e un uomo dal sorriso storto. Vende ferri, unguenti e storie, e non chiede da dove vengano i vostri Scudi. Voi non chiedete da dove vengano le sue merci.'
    },
    {
        key: 'bivacco', label: 'Bivacco', type: 'rest', title: 'Il bivacco tra le rocce',
        desc: 'Riposo con un messaggio suo',
        testo: 'Una sporgenza di roccia ripara dal vento. Il fuoco stenta, poi prende. Per qualche ora il mondo si restringe al cerchio di luce: fuori, il buio aspetta paziente.'
    },
    {
        key: 'forziere', label: 'Forziere abbandonato', type: 'treasure', title: 'Il forziere abbandonato',
        desc: 'Tesoro con un testo suo',
        testo: 'Sotto un telo marcito giace un forziere con il lucchetto spezzato. Chi lo ha lasciato qui aveva fretta, o non è più tornato a prenderlo. Le due cose, da queste parti, spesso coincidono.'
    },
    {
        key: 'bivio', label: 'Bivio con prova', type: 'challenge', title: 'Il bivio nella nebbia',
        desc: 'Prova di Intelligenza: premio una reliquia, punizione una maledizione',
        sfida: {
            title: 'Il bivio nella nebbia', stat: 'int', cd: 7,
            desc: 'Il sentiero si divide in tre dove la nebbia è più fitta. Le pietre miliari sono state divelte, i segni sui tronchi raschiati via di recente. Qualcuno non vuole che si trovi la strada giusta.',
            ignoreText: 'Scegliete il sentiero più battuto e sperate che sia quello giusto. La nebbia si richiude alle vostre spalle.',
            successText: 'Il muschio cresce dal lato giusto, il vento porta odore di fumo: la strada è quella. Lungo il cammino trovate perfino una vecchia carta della zona, dimenticata in una nicchia.',
            failText: 'Ore di cammino in cerchio, finché la nebbia non vi restituisce al punto di partenza. La stanchezza annebbia la mente più della foschia.',
            reward: 'mappa_della_regione', punishment: 'cattiva_memoria'
        }
    },
    {
        key: 'altare_profanato', label: 'Altare profanato', type: 'challenge', title: 'L\'altare profanato',
        desc: 'Prova di Fede: premio una reliquia, punizione una maledizione',
        sfida: {
            title: 'L\'altare profanato', stat: 'fth', cd: 8,
            desc: 'Ossa disposte in cerchio, candele di sego nero, un simbolo tracciato col sangue sulla pietra. Il rito è stato interrotto a metà, e qualcosa, nell\'aria, è rimasto in attesa di essere finito.',
            ignoreText: 'Passate oltre senza guardare. Il simbolo, però, sembra seguirvi con lo sguardo.',
            successText: 'Con voce ferma recitate le parole della purificazione. Le candele si spengono tutte insieme; tra le ceneri resta una lanterna di ferro che non si scalda mai.',
            failText: 'Le parole vi muoiono in gola. Qualcosa ride, piano, da sotto la pietra. Ve ne andate, ma la sensazione di essere stati marchiati non vi lascia.',
            reward: 'lanterna_dei_morti', punishment: 'sacrilego'
        }
    }
];

// Chiave libera in un oggetto della campagna (sfide, trame, testi): base, base_2, base_3...
function freeCampaignKey(store, base) {
    let key = base;
    for (let i = 2; store[key] != null; i++) key = `${base}_${i}`;
    return key;
}

/* Aggiunge alla campagna c, dopo il nodo afterId (o come partenza se manca), il nodo del modello key.
   Restituisce il nodo nuovo (null se il modello non esiste). */
function insertNodeTemplateIn(c, afterId, key) {
    const t = NODE_TEMPLATES.find(x => x.key === key);
    if (!t) return null;
    const node = addNodeAfterIn(c, afterId);
    applyNodeType(node, t.type);
    node.title = t.title;
    if (t.enemy) node.enemy = t.enemy;
    if (t.sfida) {
        c.challenges = c.challenges || {};
        node.challengeId = freeCampaignKey(c.challenges, t.key);
        c.challenges[node.challengeId] = deepCopy(t.sfida);
    }
    if (t.trama) {
        c.stories = c.stories || {};
        node.storyId = freeCampaignKey(c.stories, `trama_${t.key}`);
        c.stories[node.storyId] = deepCopy(t.trama);
    }
    if (t.testo) {
        const [coll, ref] = { rest: ['rests', 'restId'], merchant: ['merchants', 'merchantId'], treasure: ['treasures', 'treasureId'] }[t.type];
        c[coll] = c[coll] || {};
        node[ref] = freeCampaignKey(c[coll], t.key);
        c[coll][node[ref]] = t.testo;
    }
    return node;
}

// Pulsante di un modello nella scheda Mappa
function addNodeTemplate(key) {
    const node = insertNodeTemplateIn(camp, selection.map, key);
    if (!node) return;
    selection.map = node.id;
    markDirty();
    render();
    edToast(`Aggiunto «${node.title}»: trascinalo dove vuoi e cambia i testi a piacere`);
}

function nodeTemplatesHtml() {
    return `<div class="ed-templates"><span class="ed-templates-label" title="Un clic aggiunge un punto già compilato dopo quello scelto">Modelli pronti</span>
        ${NODE_TEMPLATES.map(t => `<button type="button" class="btn-small" style="--c:${(NODE_TYPES[t.type] || {}).color || '#777'}"
            title="${esc(t.desc)}" ${azione('addNodeTemplate', t.key)}>${NODE_ICONS[t.type] || ''} ${esc(t.label)}</button>`).join('')}</div>`;
}
