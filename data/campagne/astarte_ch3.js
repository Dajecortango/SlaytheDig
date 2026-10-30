// Campagna " Caccia alla Bestia - Capitolo Tre".
// Il contenuto dopo "=" è JSON puro: niente funzioni, gli effetti sono descritti nei campi "effects"
// e interpretati da applyEffects() in js/game.js. È un file .js (e non .json) perché il gioco
// si apre con doppio click da file:// e il browser blocca fetch() di file locali.
// Nemici, oggetti, reliquie e maledizioni sono richiamati per id da data/libreria/.
window.CAMPAIGNS = window.CAMPAIGNS || {};
window.CAMPAIGNS["astarte_ch3"] = {
    "id": "astarte_ch3",
    "title": " Caccia alla Bestia - Capitolo Tre",
    "avventura": "caccia_alla_bestia",
    "capitolo": 3,
    "badge": "Nuova Campagna",
    "description": "",
    "coverImage": "",
    "introText": "",
    "heroes": ["icaro", "astarte", "ascadeo", "dioforo"],
    "initialArmory": ["spada", "ascia", "alabarda", "scudo", "armatura_leggera", "libro_fede", "tomo_conoscenza", "unguento"],
    "challenges": {
        "la_cengia_di_ghiaccio_vivo": {
            "title": "La Cengia di Ghiaccio Vivo",
            "desc": "Il sentiero si riduce a una lingua di roccia larga appena due spanne, interamente vetrificata da uno strato di ghiaccio trasparente formatosi per il vento costante. Sotto i vostri scarponi si apre un salto nel vuoto di centinaia di metri, immerso in un mare di nuvole grigie. All'inizio del passaggio notate dei vecchi chiodi da roccia piantati nella parete di granito, probabilmente lasciati da una precedente spedizione dei vostri cugini del Ceppo di Giuditta, ma il ferro è coperto di galaverna e la corda che li univa è spezzata a metà.",
            "ignoreText": "Valutate che attraversare su quel vetro inclinato equivale a un suicidio. Decidete di arrampicarvi a monte scavalcando la cresta rocciosa: un percorso massacrante che vi spezzerà il fiato, ma che vi terrà lontani dal baratro.",
            "successText": "Sfruttando i chiodi piantati dai vostri cugini, assicurate una delle vostre funi e intagliate con la punta delle lame dei gradini netti nella crosta di ghiaccio. Procedendo legati in cordata e tenendo il baricentro basso contro la parete, superate lo strapiombo senza scivolare. Dall'altra parte della cengia trovate una sacca da scalata rimasta ancorata all'ultimo anello di ferro.",
            "failText": "Uno scarpone perde aderenza sul ghiaccio liscio come specchio. Chi scivola riesce ad aggrapparsi disperatamente alla corda, ma lo strattone improvviso sbatte l'intera compagnia contro gli spuntoni di granito della parete, lasciandovi con il fiato spezzato, le mani sanguinanti e il terrore del vuoto nelle gambe.",
            "stat": "int",
            "cd": 7,
            "reward": "erbe_di_montagna",
            "punishment": "venti_sferzanti"
        },
        "nuova_sfida": {
            "title": "Il Caduto del Ceppo di Dario",
            "desc": "Incastrato in una spaccatura tra due lastroni di ghiaccio perenne, scorgete un corpo perfettamente conservato dal gelo secco d'alta quota. Indossa un'armatura di cuoio e metallo e porta al braccio il simbolo della corda intrecciata del Ceppo di Dario Silvano. È un vostro cugino, salito quassù chissà quanti mesi fa durante l'Ingens Venatio alla ricerca di qualche reliquia perduta, e ucciso non da una bestia ma da una caduta che gli ha spezzato l'osso del collo. Tra i guanti irrigiditi dal ghiaccio stringe ancora un astuccio cilindrico di ferro chiuso con ceralacca.",
            "ignoreText": "A questa quota ogni sforzo fisico consuma il poco ossigeno che avete nei polmoni. Sussurrate il motto della Famiglia per onorare il cugino caduto nel Drakengrad e proseguite senza fermarvi a scavare nel ghiaccio.",
            "successText": "Usando i pugnali come scalpelli, rompete con pazienza il blocco di ghiaccio attorno alle braccia del vostro cugino senza danneggiare il corpo. Dopo aver recuperato l'astuccio e il suo anello con il sigillo per riportarlo a Rocca Tempesta, fate franare un cumulo di pietre sopra la spaccatura, offrendogli un tumulo degno di un Dignitas.",
            "failText": "Colpite il ghiaccio con troppa forza per la fretta di ripartire. La vibrazione fa cedere la lastra su cui poggia il cadavere, che scivola più a fondo nel crepaccio buio trascinando con sé l'astuccio. Nel tentativo di afferrarlo vi procurate dolorose escoriazioni contro i cristalli taglienti, restando con il rimorso di aver lasciato un familiare senza sepoltura.",
            "stat": "fth",
            "cd": 7,
            "reward": "lascito_del_caduto",
            "punishment": "bruciature_da_gelo"
        },
        "il_mal_di_montagna": {
            "title": "Il Mal di Montagna",
            "desc": "Salendo lungo una ripida spalla di detriti vulcanici e ghiaccio, l'altitudine estrema inizia a presentare il suo conto. L'aria è talmente povera che ogni passo richiede tre respiri profondi; a due dei vostri compagni inizia a sanguinare il naso per il freddo secco, mentre una violenta emicrania batte contro le tempie, offuscando la vista con macchie scure. Continuare a forzare l'andatura in queste condizioni rischia di far collassare i polmoni o il cuore prima ancora di arrivare in vetta.",
            "ignoreText": "Stringete i denti e imponete alla compagnia di non rallentare, affidandovi unicamente alla disciplina marziale della Famiglia: arriverete in cima in tempo, ma pagherete lo sforzo sul vostro fisico.",
            "successText": "Chi tra voi ha studiato con i cerusici del Ceppo di Belfiore o di Efialte riconosce subito i sintomi dell'ipossia acuta. Fate fermare immediatamente la colonna, sciogliete della neve in un pentolino scaldato con una candela di sego e fate masticare a tutti delle radici amare essiccate che dilatano il respiro. Regolando il passo su un ritmo lento e cadenzato, superate il dislivello mantenendo la mente lucida e il corpo integro.",
            "failText": "Tentate di rimediare alla spossatezza bevendo qualche sorso di liquore forte per scaldarvi il petto. L'alcol a questa quota non fa che peggiorare la mancanza d'ossigeno: la testa vi gira vorticosamente, il vomito vi piega in due sulla neve e arrivate in cima al pendio svuotati di ogni forza.",
            "stat": "int",
            "cd": 7,
            "reward": "radice_delle_montagne",
            "punishment": "maledizione_congelante"
        },
        "lo_specchio_del_gheist": {
            "title": "Lo Specchio del Gheist",
            "desc": "Attraversando un falsopiano spazzato da raffiche di neve orizzontale che bruciano gli occhi, scorgete a una trentina di passi fuori traccia una figura inginocchiata nella tormenta. Sembra un giovane esploratore senza mantello che agita debolmente un braccio chiedendo soccorso. Eppure, a questa quota proibitiva, nessuno sopravvivrebbe mezz'ora vestito a quel modo, e il vento gli passa attraverso senza muovere i suoi abiti: è l'inganno di un Gheist del Gelo, lo spirito di un uomo morto assiderato che cerca di attirarvi fuori dal sentiero sicuro per farvi sprofondare in un crepaccio coperto dalla neve fresca. Poco distante dall'apparizione, però, spunta dal ghiaccio l'elsa reale di un'arma appartenuta a una vittima precedente.",
            "ignoreText": " Ricordando gli avvertimenti scritti da vostro zio Oreste nel suo Bestiario, abbassate lo sguardo sugli scarponi e tirate dritto controvento ignorando i lamenti. Lo spirito si perde nella bufera senza potervi nuocere.\n\n",
            "successText": "Mantenendo una volontà di ferro e ignorando completamente la figura che vi chiama per nome, avanzate legati in cordata sondando la crosta nevosa con le aste delle lance ad ogni singolo passo. Individuate il bordo esatto del crepaccio nascosto, recuperate l'arma dal ghiaccio solido e tornate sul sentiero prima che lo spirito possa confondere i vostri sensi.",
            "failText": "Il dubbio che possa trattarsi davvero di un cugino rimasto ferito vi fa esitare e deviare di qualche passo. Tanto basta perché il Gheist confonda i vostri punti di riferimento nella tormenta: la crosta di neve cede sotto il piede del primo della fila e, sebbene la corda lo salvi dal baratro, l'urto contro il labbro di ghiaccio e il gelo accumulato vi lasciano scossi e indolenziti.",
            "stat": "fth",
            "cd": 8,
            "reward": "nuova_reliquia",
            "punishment": "anima_bruciata"
        }
    },
    "merchants": { "default": "" },
    "rests": { "default": "" },
    "treasures": {},
    "lootItems": null,
    "mapNodes": [
        { "id": 0, "level": 0, "x": 201, "type": "combat", "enemy": "branco_di_warg_d_altura", "title": "Livello 1 - Scontro", "icon": "🗡️", "done": false, "active": true, "next": [3], "image": "immagini/branco_di_warg_nella_tormenta_montana.webp" },
        { "id": 1, "level": 0, "x": 428, "type": "combat", "enemy": "branco_di_warg_d_altura", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": true, "next": [4], "image": "" },
        { "id": 2, "level": 0, "x": 646, "type": "combat", "enemy": "branco_di_warg_d_altura", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": true, "next": [5], "image": "" },
        { "id": 3, "level": 1, "x": 239, "type": "combat", "enemy": "brachidanio_delle_vette", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [6], "image": "immagini/bestia_corazzata_nel_passo_innevato.webp" },
        { "id": 4, "level": 1, "x": 428, "type": "combat", "enemy": "brachidanio_delle_vette", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [10], "image": "" },
        { "id": 5, "level": 1, "x": 608, "type": "combat", "enemy": "brachidanio_delle_vette", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [7], "image": "" },
        { "id": 6, "level": 2, "x": 296, "type": "challenge", "title": "Sfida", "icon": "❓", "done": false, "active": false, "next": [8, 12], "image": "immagini/sentiero_di_ghiaccio_tra_le_nuvole.webp", "challengeId": "la_cengia_di_ghiaccio_vivo" },
        { "id": 7, "level": 2, "x": 554, "type": "challenge", "title": "Sfida", "icon": "❓", "done": false, "active": false, "next": [12, 11], "image": "", "challengeId": "la_cengia_di_ghiaccio_vivo" },
        { "id": 8, "level": 3, "x": 299, "type": "combat", "enemy": "warg_solengo", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [9], "image": "immagini/scontro_sul_crinale_innevato.webp" },
        { "id": 9, "level": 4, "x": 280, "type": "elite", "enemy": "vespertilio_magno", "title": "Nuovo nodo", "icon": "👹", "done": false, "active": false, "next": [16, 19], "image": "" },
        { "id": 10, "level": 2, "x": 429, "type": "combat", "enemy": "coppia_di_garriatori", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [12], "image": "immagini/agguato_nel_passo_ghiacciato.webp" },
        { "id": 11, "level": 3, "x": 579, "type": "merchant", "title": "Nuovo nodo", "icon": "🪙", "done": false, "active": false, "next": [13], "image": "immagini/mercante_di_montagna_nella_neve.webp", "merchantId": "default" },
        { "id": 12, "level": 3, "x": 430, "type": "elite", "enemy": "vespertilio_magno", "title": "Nuovo nodo", "icon": "👹", "done": false, "active": false, "next": [15, 18], "image": "immagini/agguato_del_pipistrello_nelle_caverne_ghiacciate.webp" },
        { "id": 13, "level": 4, "x": 604, "type": "combat", "enemy": "warg_solengo", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [17, 20], "image": "immagini/scontro_sul_crinale_innevato.webp" },
        { "id": 14, "level": 6, "x": 333, "type": "challenge", "title": "Nuovo nodo", "icon": "❓", "done": false, "active": false, "next": [24], "image": "immagini/ascesa_nella_tormenta_invernale.webp", "challengeId": "il_mal_di_montagna" },
        { "id": 15, "level": 4, "x": 381, "type": "rest", "title": "Nuovo nodo", "icon": "⛺", "done": false, "active": false, "next": [19], "image": "immagini/rifugio_nella_tempesta_di_neve.webp", "restId": "default" },
        { "id": 16, "level": 5, "x": 258, "type": "rest", "title": "Nuovo nodo", "icon": "⛺", "done": false, "active": false, "next": [14], "image": "immagini/mercante_di_cristalli_nella_caverna_ghiacciata.webp", "restId": "default" },
        { "id": 17, "level": 5, "x": 623, "type": "elite", "enemy": "golem_terrigeno_delle_vette", "title": "Nuovo nodo", "icon": "👹", "done": false, "active": false, "next": [23], "image": "immagini/golem_di_ghiaccio_tra_le_montagne.webp" },
        { "id": 18, "level": 4, "x": 484, "type": "merchant", "title": "Nuovo nodo", "icon": "🪙", "done": false, "active": false, "next": [20], "image": "", "merchantId": "default" },
        { "id": 19, "level": 5, "x": 359, "type": "combat", "enemy": "coppia_di_ghoul_dell_ossario", "title": "Scontro", "icon": "🗡️", "done": false, "active": false, "next": [22], "image": "immagini/ghoul_delle_montagne_innevate.webp" },
        { "id": 20, "level": 5, "x": 504, "type": "challenge", "title": "Nuovo nodo", "icon": "❓", "done": false, "active": false, "next": [22], "image": "immagini/esploratore_congelato_nell_abisso_ghiacciato.webp", "challengeId": "nuova_sfida" },
        { "id": 21, "level": 8, "x": 379, "type": "elite", "enemy": "kreehorn_territoriale", "title": "Scontro", "icon": "👹", "done": false, "active": false, "next": [25], "image": "immagini/bestia_glaciale_nel_canyon_innevato.webp" },
        { "id": 22, "level": 6, "x": 441, "type": "combat", "enemy": "spettro_dei_tumuli", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [24], "image": "immagini/spettro_d_ombra_nel_tumulo_innevato.webp" },
        { "id": 23, "level": 6, "x": 555, "type": "rest", "title": "Nuovo nodo", "icon": "⛺", "done": false, "active": false, "next": [24], "image": "", "restId": "default" },
        { "id": 24, "level": 7, "x": 443, "type": "story", "title": "Nuovo nodo", "icon": "📜", "done": false, "active": false, "next": [21, 26], "image": "", "storyId": "trama_24" },
        { "id": 25, "level": 9, "x": 397, "type": "rest", "title": "Nuovo nodo", "icon": "⛺", "done": false, "active": false, "next": [28, 29], "image": "", "restId": "default" },
        { "id": 26, "level": 8, "x": 497, "type": "combat", "enemy": "muta_di_ghofuuri", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [27], "image": "immagini/branco_dei_lupi_ghoul_nella_tormenta_.webp" },
        { "id": 27, "level": 9, "x": 480, "type": "merchant", "title": "Nuovo nodo", "icon": "🪙", "done": false, "active": false, "next": [29, 31], "image": "", "merchantId": "default" },
        { "id": 28, "level": 10, "x": 348, "type": "combat", "enemy": "mantombra_delle_spelonche", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [32], "image": "immagini/mostro_alato_nelle_caverne_ghiacciate.webp" },
        { "id": 29, "level": 10, "x": 443, "type": "combat", "enemy": "kranh_grodd_delle_vette", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [32, 33], "image": "immagini/lupo_corrotto_nel_passo_innevato.webp" },
        { "id": 30, "level": 12, "x": 441, "type": "rest", "title": "Nuovo nodo", "icon": "⛺", "done": false, "active": false, "next": [34], "image": "", "restId": "default" },
        { "id": 31, "level": 10, "x": 529, "type": "rest", "title": "Nuovo nodo", "icon": "⛺", "done": false, "active": false, "next": [33], "image": "", "restId": "default" },
        { "id": 32, "level": 11, "x": 387, "type": "elite", "enemy": "aracnomantropo_delle_rovine", "title": "Scontro", "icon": "👹", "done": false, "active": false, "next": [30], "image": "immagini/mostro_aracnide_tra_le_rovine_innevate.webp" },
        { "id": 33, "level": 11, "x": 490, "type": "elite", "enemy": "aracnomantropo_delle_rovine", "title": "Nuovo nodo", "icon": "👹", "done": false, "active": false, "next": [30], "image": "" },
        { "id": 34, "level": 13, "x": 444, "type": "elite", "title": "Nuovo nodo", "icon": "👹", "done": false, "active": false, "next": [], "image": "immagini/gigante_macilento_tra_neve_e_ossa.webp", "enemy": "hungrabarn_dei_picchi" }
    ],
    "stories": {
        "trama_24": { "title": "Nuovo nodo", "text": "" }
    }
};
