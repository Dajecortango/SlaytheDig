// Campagna "Loch Ein, Parte Uno: Verso la Caduta dai Cieli".
// Il contenuto dopo "=" è JSON puro: niente funzioni, gli effetti sono descritti nei campi "effects"
// e interpretati da applyEffects() in js/game.js. È un file .js (e non .json) perché il gioco
// si apre con doppio click da file:// e il browser blocca fetch() di file locali.
// Nemici, oggetti, reliquie e maledizioni sono richiamati per id da data/libreria/.
window.CAMPAIGNS = window.CAMPAIGNS || {};
window.CAMPAIGNS["loch_ein_parte_1"] = {
    "id": "loch_ein_parte_1",
    "title": "Loch Ein, Parte Uno: Verso la Caduta dai Cieli",
    "avventura": "loch_ein",
    "capitolo": 1,
    "badge": "Parte Uno",
    "description": "Da Seistad alla conca di Loch Ein: le campagne abbandonate della Lega di Finngalk, il fiume Nederjin, il Sentiero di Brumafosca e le sponde maledette del lago, fino al varco sommerso.",
    "coverImage": "",
    "introText": "Lasciate la sicurezza del Pieve della Fortezza di Seistad. Davanti a voi si aprono le prime vie della Lega di Finngalk, ormai prive delle pattuglie della Gensarmia Commerciale.",
    "heroes": ["alastorta_dignitas", "pancrazio_dignitas", "cassio_dignitas", "ofelia_dignitas", "pandora_dignitas", "aiace_dignitas"],
    "initialArmory": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "balsamo_curativo"],
    "challenges": {
        "carro_impantanato": {
            "title": "Il Carro Impantanato",
            "desc": "Lungo il sentiero fangoso vi imbattete in un carro mercantile con una ruota spezzata, abbandonato di recente dopo una fuga precipitosa. La cassa di carico è ancora chiusa con un pesante lucchetto, ma il fango intorno al mezzo ribolle in modo innaturale e notate delle sagome scivolose muoversi nell'acquitrino adiacente.",
            "ignoreText": "Preferite non rischiare un'imboscata per del bottino incerto e aggirate l'acquitrino, proseguendo la vostra marcia.",
            "successText": "Con rapidità e coordinazione riuscite a forzare il lucchetto e a recuperare il contenuto della cassa prima che il terreno ceda o che le creature della palude possano accerchiarvi.",
            "failText": "Mentre cercate di forzare la cassa, il fango cede sotto i vostri stivali e una nube di miasmi putridi si sprigiona dal fondale smosso, costringendovi a una ritirata caotica e logorante.",
            "stat": "str",
            "cd": 7,
            "reward": {
                "type": "coins",
                "name": "Il carico del carro",
                "desc": "+15 Scudi alla cassa della compagnia",
                "effects": [
                    { "effect": "coins", "val": 15 }
                ]
            },
            "punishment": {
                "type": "injury",
                "name": "Miasmi della palude",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "cerusiche_di_wildevar": {
            "title": "Le Cerusiche di Wildevar",
            "desc": "Passate ai margini di Wildevar, un piccolo villaggio avvolto dal fumo degli incensi e devoto agli Atani. Alcune donne vestite con abiti semplici, seguaci di Charite, la Benedizione della Speranza, stanno curando dei popolani feriti dai briganti. Vi notano, ma guardano le vostre armi con timore e diffidenza.",
            "ignoreText": "Tirate dritto senza disturbare la comunità, lasciando le guaritrici al loro lavoro.",
            "successText": "Vi avvicinate mostrando rispetto per le tradizioni locali e per l'Atani della cura; rincuorate dalle vostre parole, le cerusiche condividono con voi i loro decotti e la loro sapienza medica.",
            "failText": "Il vostro approccio brusco e marziale spaventa gli abitanti del villaggio; le donne si barricano nelle case di legno e siete costretti ad allontanarvi sotto gli sguardi ostili della comunità.",
            "stat": "fth",
            "cd": 7,
            "reward": "unguento_dell_erborista",
            "punishment": "maledetti_dai_popolani"
        },
        "rive_dopo_la_piena": {
            "title": "Le Rive dopo la Piena",
            "desc": "Camminate lungo gli argini fangosi dove la piena regolare del Nederjin si è appena ritirata. Dal terreno molle spuntano le fronde caratteristiche di una preziosa Radice di Antimonia. Estrarla a mani nude senza le dovute precauzioni può causare stridori mortali, ma avete delle corde con voi.",
            "ignoreText": "Lasciate il tubero dov'è; il rischio di finire con le orecchie sanguinanti per un reagente alchemico è troppo alto.",
            "successText": "Legate saldamente una fune alla radice, vi allontanate a distanza di sicurezza tappandovi le orecchie e tirate con forza: il tubero umanoide viene sradicato strillando a vuoto, fino a placarsi.",
            "failText": "La corda scivola mentre il tubero è scoperto a metà; l'urlo disumano della Mandragola Stridente vi investe in pieno, facendovi sanguinare il naso e le orecchie prima che riusciate a fuggire.",
            "stat": "str",
            "cd": 7,
            "reward": {
                "type": "item",
                "name": "Radice di Antimonia",
                "desc": "Chi ha tirato la fune ottiene un Unguento Fortificante",
                "effects": [
                    { "effect": "hero_item", "item": "unguento_fortificante", "val": 1 }
                ]
            },
            "punishment": "tormento_mentale"
        },
        "chiatta_abbandonata": {
            "title": "La Chiatta Abbandonata",
            "desc": "Per evitare i ponti principali, raggiungete un vecchio attracco di contrabbandieri dove una chiatta di legno è ancora legata a una fune che attraversa il Nederjin. La corrente è impetuosa e sul fondale scuro del fiume vi sembra di scorgere ombre tentacolari in attesa.",
            "ignoreText": "Rinunciate alla chiatta e fate una lunga ed estenuante deviazione a piedi lungo la riva per trovare un passaggio più sicuro.",
            "successText": "Governate la chiatta con forza e perizia, contrastando la furia della corrente e toccando la sponda opposta prima che i predatori del fondale possano risalire in superficie. Sul fondo della chiatta trovate il borsello dimenticato di un contrabbandiere.",
            "failText": "La fune guida si spezza a pochi metri dalla riva opposta; la chiatta sbatte violentemente contro gli scogli costringendovi a gettarvi nell'acqua gelida e a nuotare disperatamente fino a terra.",
            "stat": "str",
            "cd": 8,
            "reward": {
                "type": "coins",
                "name": "Il borsello del contrabbandiere",
                "desc": "+12 Scudi alla cassa della compagnia",
                "effects": [
                    { "effect": "coins", "val": 12 }
                ]
            },
            "punishment": "venti_sferzanti"
        },
        "statua_di_cyssan": {
            "title": "La Statua di Cyssan",
            "desc": "Nel fitto della nebbia vi trovate di fronte a un'antica statua erosa dal tempo ma ancora imponente: raffigura Cyssan, la Figlia Cacciatrice, con arco e frecce. Alla base notate un'iscrizione: \"Cyssan, sangue e forza, la tua gente guarda a te. Che il tuo occhio non cada mai su di noi. Risparmiaci il giorno che diverremo la tua preda.\"",
            "ignoreText": "Osservate la statua con cauto rispetto ma tirate dritto senza toccare nulla, non volendo attirare l'attenzione di eventuali cultisti o spiriti.",
            "successText": "Esaminate con riverenza i segni sulla base e decifrate correttamente il monito degli Atani, scorgendo tra il muschio le tracce di un sentiero secondario protetto dalle fronde.",
            "failText": "Nel tentativo di ripulire maldestramente le iscrizioni con le lame, fate scattare una vecchia trappola da caccia piazzata dai Figli del Chiarore a protezione del monumento sacro.",
            "stat": "fth",
            "cd": 8,
            "reward": "idolo_del_cacciatore",
            "punishment": {
                "type": "injury",
                "name": "La trappola dei Figli del Chiarore",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "vecchio_ponte_atani": {
            "title": "Il Vecchio Ponte degli Atani",
            "desc": "Raggiungete l'antico ponte di pietra rivestito di edera e muschio che scavalca una forra profonda. La struttura è antichissima: alcune pietre portanti sono scivolose per la pioggia incessante e sulla chiave di volta sono incisi dei simboli legati agli insegnamenti di Ceart sulla perseveranza e sull'equilibrio tra corpo e mente.",
            "ignoreText": "Non vi fidate della tenuta dell'antico ponte e decidete di calarvi faticosamente lungo le pareti scoscese della forra per risalire dal lato opposto.",
            "successText": "Seguendo la logica delle incisioni di Ceart, individuate le lastre stabili e attraversate il ponte in perfetto equilibrio, senza far cedere una sola pietra.",
            "failText": "Mettete il piede su una lastra instabile; una sezione del parapetto crolla nel vuoto e riuscite ad aggrapparvi al bordo opposto solo per miracolo, uscendone contusi e stremati.",
            "stat": "int",
            "cd": 8,
            "reward": "tomo_delle_verita",
            "punishment": "vertigine_lacerante"
        },
        "canto_corso_acqua": {
            "title": "Il Canto sul Corso d'Acqua",
            "desc": "È ormai sera quando costeggiate un torrente che confluisce verso il lago di Loch Ein. Tra la nebbia udite una tristissima ninna-nanna: inginocchiata sulla riva, una figura pallida – una Puerpera – sta lavando dei panni insanguinati nell'acqua gelida. Sapete che interrompere il suo lavoro o rivolgerle la parola scatenerà la sua furia ardente.",
            "ignoreText": "Vi allontanate immediatamente a ritroso, facendo un largo giro nel bosco fitto pur di non passare nemmeno vicino allo spettro.",
            "successText": "Trattenete il respiro e avvolgete i metalli delle armature nei mantelli per non produrre il minimo tintinnio, sfilando silenziosi dietro la Puerpera senza interrompere la sua penitenza.",
            "failText": "Un ramo spezzato sotto i vostri piedi fa voltare lo spettro; interrompendo il canto, la Puerpera vi scaglia contro uno spruzzo d'acqua maledetta che brucia sulla pelle come fuoco vivo.",
            "stat": "int",
            "cd": 8,
            "reward": "occhio_del_corvo",
            "punishment": "anima_bruciata"
        },
        "mosaici_stelleggiati": {
            "title": "I Mosaici Stelleggiati sulla Riva",
            "desc": "Avanzando lungo la sponda fangosa del lago, trovate dei blocchi di pietra affioranti decorati con antichi mosaici del cielo stellato e iscrizioni dei Firmamentisti. Sembrano indicare delle coordinate astrali legate alle correnti sotterranee del lago, ma l'acqua gelida sta già risalendo per sommergerli.",
            "ignoreText": "Lasciate che l'acqua copra i resti e proseguite lungo la riva, concentrandovi solo sul trovare l'accesso sottomarino.",
            "successText": "Riuscite a trascrivere e interpretare rapidamente i simboli della Celestica prima che l'onda li copra, ottenendo preziosi riferimenti sui flussi d'acqua che portano alla città sommersa.",
            "failText": "Vi attardate troppo sugli scogli scivolosi per copiare i glifi; un'onda improvvisa vi travolge facendovi finire nelle acque gelide e taglienti delle rocce costiere.",
            "stat": "int",
            "cd": 9,
            "reward": "frammento_di_yr_drazul",
            "punishment": "morsa_assiderante"
        },
        "scavo_guardie_del_lupo": {
            "title": "Il Vecchio Scavo delle Guardie del Lupo",
            "desc": "Raggiungete il punto sulla riva dove, durante la prima spedizione, le Guardie del Lupo avevano allargato il foro nel terreno coperto da pietre e muschio. Il passaggio è parzialmente franato a causa dei recenti temporali, ma sul fondo scorgete ancora casse di equipaggiamento e vecchie boe lasciate indietro.",
            "ignoreText": "Il foro sembra troppo instabile; preferite non rischiare di rimanere sepolti vivi prima ancora di entrare a Loch Ein.",
            "successText": "Puntellate con perizia le pareti smosse e vi calate brevemente nella cavità, recuperando le scorte intatte della prima spedizione prima di risalire.",
            "failText": "Appena spostate la prima pietra, il terreno fangoso cede di schianto; una piccola frana vi travolge gli arti inferiori, costringendovi a uno sforzo logorante per liberarvi dai detriti.",
            "stat": "str",
            "cd": 9,
            "reward": "sacca_del_contrabbandiere",
            "punishment": {
                "type": "injury",
                "name": "Travolti dalla frana",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        }
    },
    "merchants": {
        "default": "Un mercante di passaggio vi mostra la sua merce.",
        "marcheur_scortato": "Incontrate un carro corazzato appartenente alla Corporazione di Montrose. Un Marcheur Chaud, scortato da mercenari armati di balestra, ha accostato il mezzo per far riposare i cavalli. Nonostante la diffidenza iniziale, riconoscendo la vostra determinazione, il mercante apre gli sportelli del carro ed è ben disposto a fare affari prima che le vostre strade si dividano.",
        "cercatore_di_crisomantore": "Sotto un enorme faggio cavo incontrate un erborista e cacciatore di frodo solitario, avvolto in pelli impermeabili. Si trova a Brumafosca per dare la caccia alle rare Crisomantore e raccogliere reagenti alchemici. In cambio di monete sonanti, è disposto a cedervi parte delle sue preziose scorte.",
        "accampamento_di_baldrick": "Nascosto in una rientranza rocciosa ben mimetizzata, trovate un piccolo bivacco. Avete incontrato di nuovo Baldrick, l'esploratore dalla barba incolta, gli occhiali spessi e il cappello stravagante. Ha accumulato sul posto attrezzature da immersione, sacchi d'aria, corde e reperti dragati dal lago, ed è pronto a scambiare ciò che ha con voi per finanziare le sue ricerche."
    },
    "rests": {
        "default": "Trovate un riparo e accendete un piccolo fuoco per riposare.",
        "ombra_torre_mirafango": "Trovate riparo tra i ruderi di un vecchio magazzino di pietra a poca distanza dall'imponente sagoma di Torre Mirafango. La presenza della torre tiene lontane le creature più feroci del fiume, permettendovi di accendere un fuoco discreto, asciugare i mantelli e riprendere fiato.",
        "cerchio_di_pietre": "Poco distante dal sentiero scoprite un piccolo altare circondato da pietre disposte in cerchio. Al centro, protetta da una tettoia di legno, arde ancora una fiamma debole accanto a piccoli amuleti e offerte. Il luogo emana una strana pace che vi permette di riposare al riparo dalla pioggia battente.",
        "accampamento_nel_pendio": "Siete arrivati di fronte al punto del lago dove si trova l'arco di rocce sommerso che conduce alle profondità di Loch Ein. Ritrovate il leggero pendio vicino alla riva utilizzato come campo base nella prima spedizione. Le trincee per il fuoco scavate allora sono ancora visibili: montate un riparo di tela cerata contro il vento gelido del lago e accendete un fuoco caldo e rassicurante per riprendere le forze e preparare la campana subacquea.",
        "capanna_della_barca": "Siete arrivati di fronte al punto del lago dove si trova l'arco di rocce sommerso che conduce alle profondità di Loch Ein. Vi rifugiate nella vecchia capanna abbandonata vicino al sentiero sommerso dalla vegetazione, dove avevate trovato la barca durante la prima esplorazione. Le pareti di legno scricchiolano sotto la pioggia, ma offrono un tetto asciutto dove medicare le ferite, bere un elisir caldo contro il freddo e affilare le armi."
    },
    "treasures": {},
    "stories": {
        "trama_meta_percorso": { "title": "Nel cuore di Brumafosca", "text": "" }
    },
    "lootItems": null,
    "mapNodes": [
        {
            "id": 0,
            "level": 0,
            "x": 330,
            "type": "combat",
            "title": "Livello 1 - Le Vecchie Mulattiere",
            "icon": "🗡️",
            "done": false,
            "active": true,
            "next": [2, 3],
            "image": "immagini/loch_ein_parte_1/1a_agguato_dei_briganti_nella_nebbia.webp",
            "enemy": "briganti_mulattiere"
        },
        {
            "id": 1,
            "level": 0,
            "x": 550,
            "type": "combat",
            "title": "Livello 1 - I Confini della Strada della Concia",
            "icon": "🗡️",
            "done": false,
            "active": true,
            "next": [3, 4],
            "image": "immagini/loch_ein_parte_1/1b_lupi_degli_spettri_tra_le_rovine.webp",
            "enemy": "ghofuuri_strada_concia"
        },
        {
            "id": 2,
            "level": 1,
            "x": 220,
            "type": "challenge",
            "title": "Livello 2 - Il Carro Impantanato",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [5],
            "image": "immagini/loch_ein_parte_1/2a_carrozza_abbandonata_nella_palude_oscura.webp",
            "challengeId": "carro_impantanato"
        },
        {
            "id": 3,
            "level": 1,
            "x": 440,
            "type": "merchant",
            "title": "Livello 2 - Il Marcheur Scortato",
            "icon": "🪙",
            "done": false,
            "active": false,
            "next": [5, 6],
            "image": "immagini/loch_ein_parte_1/2b_carovana_mercantile_tra_le_rovine.webp",
            "merchantId": "marcheur_scortato"
        },
        {
            "id": 4,
            "level": 1,
            "x": 660,
            "type": "combat",
            "title": "Livello 2 - Le Colline Ondulate",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [6],
            "image": "immagini/loch_ein_parte_1/2c_branco_di_lupi_nella_brughiera_autunnale.webp",
            "enemy": "warg_colline_ondulate"
        },
        {
            "id": 5,
            "level": 2,
            "x": 330,
            "type": "challenge",
            "title": "Livello 3 - Le Cerusiche di Wildevar",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [7, 8],
            "image": "immagini/loch_ein_parte_1/3a_villaggio_medievale_tra_fumo_e_soccorso.webp",
            "challengeId": "cerusiche_di_wildevar"
        },
        {
            "id": 6,
            "level": 2,
            "x": 550,
            "type": "combat",
            "title": "Livello 3 - L'Avamposto sulla Pianura",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [8, 9],
            "image": "immagini/loch_ein_parte_1/3b_avamposto_medievale_tra_nebbia_e_fango.webp",
            "enemy": "disertori_avamposto_pianura"
        },
        { "id": 7, "level": 3, "x": 220, "type": "elite", "title": "Livello 4 - Il Territorio del Burofonte", "icon": "👹", "done": false, "active": false, "next": [10], "image": "", "enemy": "burofonte_tremabosco" },
        {
            "id": 8,
            "level": 3,
            "x": 440,
            "type": "rest",
            "title": "Livello 4 - L'Ombra di Torre Mirafango",
            "icon": "⛺",
            "done": false,
            "active": false,
            "next": [10, 11],
            "image": "immagini/loch_ein_parte_1/4b_accampamento_nella_nebbia_sotto_la_torre_unerquicklich.webp",
            "restId": "ombra_torre_mirafango"
        },
        {
            "id": 9,
            "level": 3,
            "x": 660,
            "type": "challenge",
            "title": "Livello 4 - Le Rive dopo la Piena",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [11],
            "image": "immagini/loch_ein_parte_1/4c_raccolta_di_radici_nella_palude_al_tramonto.webp",
            "challengeId": "rive_dopo_la_piena"
        },
        {
            "id": 10,
            "level": 4,
            "x": 330,
            "type": "combat",
            "title": "Livello 5 - I Ponti di Neferu",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [12, 13],
            "image": "immagini/loch_ein_parte_1/5a_ponte_maledetta_nella_tempesta.webp",
            "enemy": "sirenidi_ponti_neferu"
        },
        {
            "id": 11,
            "level": 4,
            "x": 550,
            "type": "challenge",
            "title": "Livello 5 - La Chiatta Abbandonata",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [13, 14],
            "image": "immagini/loch_ein_parte_1/5b_la_chiatta_delle_acque_oscure.webp",
            "challengeId": "chiatta_abbandonata"
        },
        {
            "id": 12,
            "level": 5,
            "x": 220,
            "type": "combat",
            "title": "Livello 6 - Le Ragnatele nella Nebbia",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [15],
            "image": "immagini/loch_ein_parte_1/6a_agguato_del_ragno_nella_foresta_nebbiosa.webp",
            "enemy": "ragno_nero_brumafosca"
        },
        {
            "id": 13,
            "level": 5,
            "x": 440,
            "type": "challenge",
            "title": "Livello 6 - La Statua di Cyssan",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [15, 16],
            "image": "immagini/loch_ein_parte_1/6b_cyssan_la_cacciatrice_di_pietra.webp",
            "challengeId": "statua_di_cyssan"
        },
        {
            "id": 14,
            "level": 5,
            "x": 660,
            "type": "combat",
            "title": "Livello 6 - I Battidenti nella Foschia",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [16],
            "image": "immagini/loch_ein_parte_1/6c_avventurieri_nella_palude_nebbiosa.webp",
            "enemy": "tremolischi_foschia"
        },
        {
            "id": 15,
            "level": 6,
            "x": 330,
            "type": "rest",
            "title": "Livello 7 - Il Cerchio di Pietre e la Fiamma",
            "icon": "⛺",
            "done": false,
            "active": false,
            "next": [17],
            "image": "immagini/loch_ein_parte_1/7a_santuario_nella_foresta_sotto_la_pioggia.webp",
            "restId": "cerchio_di_pietre"
        },
        { "id": 16, "level": 6, "x": 550, "type": "merchant", "title": "Livello 7 - Il Cercatore di Crisomantore", "icon": "🪙", "done": false, "active": false, "next": [17], "image": "", "merchantId": "cercatore_di_crisomantore" },
        { "id": 17, "level": 7, "x": 440, "type": "story", "title": "Livello 8 - Nel cuore di Brumafosca", "icon": "📜", "done": false, "active": false, "next": [18, 19, 20], "image": "", "storyId": "trama_meta_percorso" },
        {
            "id": 18,
            "level": 8,
            "x": 220,
            "type": "combat",
            "title": "Livello 9 - La Radura dell'Albero dell'Impiccato",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [21],
            "image": "immagini/loch_ein_parte_1/9a_guardiani_contro_l_albero_antico.webp",
            "enemy": "bestie_albero_impiccato"
        },
        {
            "id": 19,
            "level": 8,
            "x": 440,
            "type": "challenge",
            "title": "Livello 9 - Il Vecchio Ponte degli Atani",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [21, 22],
            "image": "immagini/loch_ein_parte_1/9b_viandanti_sotto_il_ponte_antico.webp",
            "challengeId": "vecchio_ponte_atani"
        },
        {
            "id": 20,
            "level": 8,
            "x": 660,
            "type": "combat",
            "title": "Livello 9 - Le Rocce Assopite",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [22],
            "image": "immagini/loch_ein_parte_1/9c_mostri_di_pietra_nel_passo_in_tempesta.webp",
            "enemy": "brachidani_rocce_assopite"
        },
        {
            "id": 21,
            "level": 9,
            "x": 330,
            "type": "elite",
            "title": "Livello 10 - L'Ombra dell'Aviano Moork",
            "icon": "👹",
            "done": false,
            "active": false,
            "next": [23, 24],
            "image": "immagini/loch_ein_parte_1/10a_raven_gigante_nella_gola_nebbiosa.webp",
            "enemy": "aviano_moork_gola"
        },
        {
            "id": 22,
            "level": 9,
            "x": 550,
            "type": "combat",
            "title": "Livello 10 - Il Tumulo Profanato",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [24, 25],
            "image": "immagini/loch_ein_parte_1/10b_cavalieri_contro_i_ghoul_nella_cripta_dimenticata.webp",
            "enemy": "ghoul_tumulo_profanato"
        },
        {
            "id": 23,
            "level": 10,
            "x": 220,
            "type": "challenge",
            "title": "Livello 11 - Il Canto sul Corso d'Acqua",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [26],
            "image": "immagini/loch_ein_parte_1/11a_la_lavandaia_spettrale_nel_bosco_nebbioso.webp",
            "challengeId": "canto_corso_acqua"
        },
        {
            "id": 24,
            "level": 10,
            "x": 440,
            "type": "merchant",
            "title": "Livello 11 - L'Accampamento di Baldrick",
            "icon": "🪙",
            "done": false,
            "active": false,
            "next": [26, 27],
            "image": "immagini/loch_ein_parte_1/11b_il_mercante_del_lago_nebbioso.webp",
            "merchantId": "accampamento_di_baldrick"
        },
        {
            "id": 25,
            "level": 10,
            "x": 660,
            "type": "combat",
            "title": "Livello 11 - Lo Sciame dell'Acquitrino",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [27],
            "image": "immagini/loch_ein_parte_1/11c_sciame_oscuro_nella_palude_nebbiosa.webp",
            "enemy": "zerbene_sanguisuga"
        },
        {
            "id": 26,
            "level": 11,
            "x": 330,
            "type": "elite",
            "title": "Livello 12 - La Pattuglia di Foscoclivo",
            "icon": "👹",
            "done": false,
            "active": false,
            "next": [28, 29],
            "image": "immagini/loch_ein_parte_1/12a_esploratori_sul_lago_nebbioso.webp",
            "enemy": "pattuglia_di_foscoclivo"
        },
        {
            "id": 27,
            "level": 11,
            "x": 550,
            "type": "challenge",
            "title": "Livello 12 - I Mosaici Stelleggiati sulla Riva",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [29, 30],
            "image": "immagini/loch_ein_parte_1/12b_rovine_astrali_sul_lago_nebbioso.webp",
            "challengeId": "mosaici_stelleggiati"
        },
        {
            "id": 28,
            "level": 12,
            "x": 220,
            "type": "combat",
            "title": "Livello 13 - I Predatori del Canneto",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [31],
            "image": "immagini/loch_ein_parte_1/13a_serpulidi_di_goli_ja_nella_palude_nebbiosa.webp",
            "enemy": "serpulidi_di_goli_ja"
        },
        { "id": 29, "level": 12, "x": 440, "type": "challenge", "title": "Livello 13 - Il Vecchio Scavo delle Guardie del Lupo", "icon": "❓", "done": false, "active": false, "next": [31, 32], "image": "", "challengeId": "scavo_guardie_del_lupo" },
        {
            "id": 30,
            "level": 12,
            "x": 660,
            "type": "combat",
            "title": "Livello 13 - Le Ombre sulla Riva",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [32],
            "image": "immagini/loch_ein_parte_1/13c_gatti_d_ombra_sul_lago_nebbioso.webp",
            "enemy": "morrkath_della_riva"
        },
        {
            "id": 31,
            "level": 13,
            "x": 330,
            "type": "rest",
            "title": "Livello 14 - L'Accampamento nel Pendio",
            "icon": "⛺",
            "done": false,
            "active": false,
            "next": [33],
            "image": "immagini/loch_ein_parte_1/14a_accampamento_al_lago_tra_le_rovine_avvolte_dalla_nebbia.webp",
            "restId": "accampamento_nel_pendio"
        },
        {
            "id": 32,
            "level": 13,
            "x": 550,
            "type": "rest",
            "title": "Livello 14 - La Capanna della Barca",
            "icon": "⛺",
            "done": false,
            "active": false,
            "next": [33],
            "image": "immagini/loch_ein_parte_1/14b_rifugio_sul_lago_sotto_la_pioggia.webp",
            "restId": "capanna_della_barca"
        },
        {
            "id": 33,
            "level": 14,
            "x": 440,
            "type": "combat",
            "title": "Livello 15 - L'Orrore dell'Arco Sommerso",
            "icon": "👑",
            "done": false,
            "active": false,
            "next": [],
            "image": "immagini/loch_ein_parte_1/15a_serpente_del_lago_in_tempesta.webp",
            "enemy": "aguglia_gigante_corrotta"
        }
    ]
};
