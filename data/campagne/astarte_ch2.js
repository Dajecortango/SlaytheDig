// Campagna "Caccia alla Bestia, Capitolo Due".
// Il contenuto dopo "=" è JSON puro: niente funzioni, gli effetti sono descritti nei campi "effects"
// e interpretati da applyEffects() in js/game.js. È un file .js (e non .json) perché il gioco
// si apre con doppio click da file:// e il browser blocca fetch() di file locali.
// Nemici, oggetti, reliquie e maledizioni sono richiamati per id da data/libreria/.
window.CAMPAIGNS = window.CAMPAIGNS || {};
window.CAMPAIGNS["astarte_ch2"] = {
    "id": "astarte_ch2",
    "title": "Caccia alla Bestia, Capitolo Due",
    "badge": "Capitolo Due",
    "description": "Dalla Linea degli Alberi Morti alla Terrazza dell'Eclissi: la compagnia risale i Picchi del Tramonto attraverso i Crepacci Ululanti, i Dirupi del Cielo Infranto e il Mare Bianco.",
    "coverImage": "",
    "introText": "La caccia continua. Lasciata la Valle del Krogg, la compagnia si spinge verso le vette dei Picchi del Tramonto, dove il gelo e il vento non perdonano.",
    "heroes": ["astarte", "icaro", "ascadeo", "dioforo"],
    "initialArmory": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "balsamo_curativo"],
    "challenges": {
        "resti_lungobarbi": {
            "title": "Resti Lungobarbi",
            "desc": "Ai piedi di un colossale pino morto nella foresta, il cui tronco è incrostato di ghiaccio, trovate un cumulo di scheletri tarchiati e zaini congelati. Sono i resti di antichi esploratori Lungobarbi. Scavare nel groviglio di ossa e radici ghiacciate farà calare la vostra temperatura corporea, ma l'equipaggiamento potrebbe salvarvi la vita.",
            "ignoreText": "Tirate dritto, lasciando i resti congelati dove si trovano senza sprecare calore vitale.",
            "successText": "Riuscite a estrarre con cura l'equipaggiamento e a ripulirlo dal ghiaccio prima che il gelo vi paralizzi le dita.",
            "failText": "Scavate maldestramente; il ghiaccio spezza gli oggetti e il gelo penetra dolorosamente nelle vostre ossa.",
            "stat": "int",
            "cd": 7,
            "reward": "cotta_dei_lungobarbi",
            "punishment": "morsa_assiderante"
        },
        "altare_rovi": {
            "title": "Altare tra i Rovi",
            "desc": "Gli ultimi abeti morti si diradano per lasciare spazio alla nuda roccia. Il confine della foresta è segnato da un gelo innaturale che fa appassire persino il muschio. Tra arbusti pietrificati trovate un antico altare scolpito. Offrirete un pegno per una benedizione, o tirerete dritto verso i crepacci?",
            "ignoreText": "Volgete lo sguardo altrove e passate oltre, ignorando l'aura gelida dell'altare.",
            "successText": "Inginocchiandovi e pregando, l'altare accetta il dazio infondendovi un innaturale calore mistico.",
            "failText": "La vostra fede vacilla; l'altare respinge l'offerta e vi punisce investendovi con un'ondata di freddo mistico.",
            "stat": "fth",
            "cd": 7,
            "reward": "benedizione_del_primigenio",
            "punishment": "gelo_spirituale"
        },
        "eremita_sospeso": {
            "title": "L'Eremita Sospeso",
            "desc": "Oltrepassato il limite della foresta, vi addentrate nell'oscurità dei Crepacci Ululanti. Su una sporgenza interna e pericolante, sentite un gemito. Un ponte di ghiaccio ha ceduto a metà e un uomo penzola sull'oscurità stringendo un artefatto. Tirarlo su vi costerà un'immane fatica.",
            "ignoreText": "Distogliete lo sguardo dal baratro e proseguite, lasciando che il vento copra i gemiti dell'uomo.",
            "successText": "Puntate i piedi sul ghiaccio e, con uno sforzo immane, issate l'uomo sulla sporgenza. L'eremita, tremante, vi affida il suo unguento in segno di gratitudine.",
            "failText": "Il ghiaccio cede sotto i vostri piedi: riuscite a salvare l'uomo, ma lo sforzo vi lascia stremati e con i muscoli strappati.",
            "stat": "str",
            "cd": 8,
            "reward": "unguento_dell_erborista",
            "punishment": {
                "type": "injury",
                "name": "Fatica immane",
                "desc": "Tutti i membri del party subiscono 1 danno immediato agli HP",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "ponte_tesori": {
            "title": "Il Ponte dei Tesori",
            "desc": "Affacciandovi sull'oscurità assoluta al centro del crepaccio, dovete attraversare un ponte. La corda logora oscilla violentemente per le correnti ascensionali. Passare carichi di equipaggiamenti è folle: abbandonerete parte del vostro oro o sacrificherete la vostra agilità rischiando un volo mortale?",
            "ignoreText": "Abbandonate cautamente il tesoro a terra per attraversare sicuri e senza alcun intralcio.",
            "successText": "Calcolate perfettamente la distribuzione dei pesi e attraversate sfidando l'oscillazione senza perdere un soldo.",
            "failText": "Un passo calcolato male fa cedere un'asse; vi salvate per miracolo, ma l'oscillazione vi causa un terrore paralizzante.",
            "stat": "int",
            "cd": 8,
            "reward": "sacca_del_contrabbandiere",
            "punishment": "vertigine_lacerante"
        },
        "riflessi_ingannevoli": {
            "title": "Riflessi Ingannevoli",
            "desc": "In un cunicolo all'interno della gola, dove il ghiaccio è liscio come uno specchio, scoprite qualcosa di anomalo. L'oscurità del crepaccio distorce tutto; un'ombra non vostra si muove sulle pareti. È un nemico mimetizzato o un'illusione letale?",
            "ignoreText": "Chiudete gli occhi e avanzate a tentoni lungo la parete opposta, ignorando completamente i riflessi.",
            "successText": "Intuite il trucco ottico causato dal ghiaccio e scovate un nascondiglio segreto protetto dall'illusione.",
            "failText": "Il panico prende il sopravvento; attaccate l'illusione ferendovi gravemente contro il ghiaccio specchiante.",
            "stat": "int",
            "cd": 8,
            "reward": "prisma_rivelatore",
            "punishment": "paranoia_dell_ombra"
        },
        "tomo_viaggiatore": {
            "title": "Tomo del Viaggiatore Perduto",
            "desc": "Presso una cascata perennemente ghiacciata sulla parete rocciosa della gola trovate uno scheletro incastrato nel ghiaccio che stringe un libro. Rompere la parete gelata a mani nude richiede uno sforzo, ma chissà che le pagine di quel libro racchiudano qualcosa di importante.",
            "ignoreText": "Lasciate lo scheletro e il libro riposare in pace sotto il ghiaccio eterno.",
            "successText": "Individuate i punti deboli del ghiaccio, frantumandolo senza sforzo e recuperando il testo intatto.",
            "failText": "Sbattete violentemente contro la roccia gelata, ferendovi le mani e strappando gran parte delle pagine.",
            "stat": "int",
            "cd": 8,
            "reward": "tomo_delle_verita",
            "punishment": "maledizione_dell_ignoranza"
        },
        "altare_sospeso": {
            "title": "L'Altare Sospeso",
            "desc": "Proteso letteralmente sul vuoto della parete c'è un altare votivo, lambito da Fuochi Fatui che rifiutano di spegnersi nonostante l'altitudine pazzesca. Questo antico monolite esige un test di puro coraggio o un tributo di sangue per concedere i favori della fiamma.",
            "ignoreText": "Non osate sporgervi sull'orlo del vuoto e tirate dritti per la vostra strada.",
            "successText": "Il sangue offerto con cieca fede placa le fiamme, che penetrano in voi infondendovi vigore e coraggio.",
            "failText": "I Fuochi Fatui percepiscono i vostri dubbi; rifiutano il tributo e scottano la vostra essenza.",
            "stat": "fth",
            "cd": 8,
            "reward": "fiamma_perenne",
            "punishment": "anima_bruciata"
        },
        "crepaccio_specchiante": {
            "title": "Il Crepaccio Specchiante",
            "desc": "Poco prima di scavalcare l'ultima cresta dei Dirupi del Cielo Infranto, vi imbattete in un crepaccio. Una lastra di ghiaccio verticale riflette un'ombra grottesca di voi stessi, distorta dalla mancanza di ossigeno. Affronterete i vostri demoni o fuggirete per preservare il fiato?",
            "ignoreText": "Distogliete bruscamente lo sguardo e proseguite faticosamente, scappando dalla visione.",
            "successText": "Accettate l'immagine distorta ed esorcizzate i vostri tormenti, raggiungendo una pace mentale assoluta.",
            "failText": "La visione dell'ombra grottesca corrompe e divora la vostra sanità mentale vacillante.",
            "stat": "fth",
            "cd": 9,
            "reward": "frammento_di_chiarezza",
            "punishment": "terrore_riflesso"
        },
        "tormenta_bianca": {
            "title": "La Tormenta Bianca",
            "desc": "Muovendo i primi passi sulla piana gelata e priva di punti di riferimento del Mare Bianco, venite investiti da una tormenta. L'orientamento si perde del tutto. Per non morire assiderati dovete scartare parte dell'equipaggiamento e correre verso una duna, oppure sfidare la furia degli elementi.",
            "ignoreText": "Gettate l'equipaggiamento di troppo senza pensare e vi rintanate nella neve aspettando che passi.",
            "successText": "Interpretate abilmente i venti, riuscendo a improvvisare un riparo perfetto che salva voi e le vostre risorse.",
            "failText": "La tormenta vi disorienta totalmente; vi smarrite nel bianco, congelandovi e gettando via risorse sbagliate.",
            "stat": "int",
            "cd": 9,
            "reward": "bussola_del_sopravvissuto",
            "punishment": "venti_sferzanti"
        },
        "monolite_ghiacciato": {
            "title": "Il Monolite Ghiacciato",
            "desc": "Nel cuore della sconfinata distesa desolata sferzata dal vento polare del Mare Bianco, torreggia un monolite. Nelle sue fondamenta un cadavere sepolto dalla neve stringe una reliquia. Prenderla significherà attirare su di sé la maledizione congelante della piana.",
            "ignoreText": "Evitate di avvicinarvi all'aura oscura del monolite, lasciando il cadavere intatto.",
            "successText": "Intonate la giusta preghiera, purificando la reliquia ed estirpandone l'energia maligna prima di toccarla.",
            "failText": "L'avidità supera la prudenza; afferrate la reliquia e il monolite scarica su di voi il suo gelo letale.",
            "stat": "fth",
            "cd": 9,
            "reward": "reliquia_del_monolite",
            "punishment": "maledizione_congelante"
        }
    },
    "merchants": {
        "default": "Un mercante di passaggio, avvolto in pellicce consunte, vi mostra la sua merce al riparo dal vento.",
        "emporio_sotterraneo": "Fuggendo dal gelo della foresta, vi infilate in una fenditura che vi conduce nei Crepacci Ululanti. Un mercante solitario, rannicchiato attorno a fumarole sulfuree, vi accoglie: \"Riposate le gambe, viandanti, qui nelle viscere della terra l'ululato del vento non vi recherà alcun disturbo\".",
        "esploratore_vitghen": "Il fondo del crepaccio si allarga formando una tetra grotta di ghiaccio blu. Un rozzo esploratore Vitghen ha allestito qui un bivacco di fortuna. Offre attrezzatura pesante recuperata dai cadaveri precipitati nelle gole, roba indispensabile per sopravvivere all'aria infida della vetta.",
        "mercante_pazzo": "Emersi dalle gole sotterranee, vi trovate sui Dirupi del Cielo Infranto. Su un esposto cornicione battuto dal sole siede un uomo, un sopravvissuto che ha perso la ragione per l'altitudine estrema. Sospeso sulle nuvole, vende carabattole ed equipaggiamenti richiedendo pagamenti assurdi.",
        "avamposto_lungobarbi": "Su una solida piattaforma incisa magistralmente sulla roccia a strapiombo da antichi Lungobarbi, un mercante ansima per l'ipossia. Scambia pozioni per dilatare i polmoni con le vostre ricchezze.",
        "megera_venti": "Nascosta in un minuscolo anfratto, letteralmente appesa alla parete verticale, \"La Megera dei Venti\" vi offre radici e decotti neri masticabili capaci di fermare le emicranie da altitudine estrema che affliggono chi scala i Dirupi.",
        "ultimo_baluardo": "Sull'ultimo bastione di roccia solida della parete, prima che la pendenza diminuisca, sorge l'ultimo baluardo commerciale. Il mercante espone prezzi esorbitanti, consapevole che l'aria qui è assente e sarete disposti a tutto pur di prepararvi all'inferno del vicino Mare Bianco.",
        "spirito_barattatore": "Su un vasto lago di ghiaccio liscio come vetro in mezzo al nulla bianco della piana fluttua uno Spirito. Sepolti nel Mare Bianco, gli ori non servono: questo essere etereo offre potenti cimeli esigendo veri pegni di longevità, in cambio della vostra vitalità.",
        "avamposto_fine": "Presso l'ultimo raro affioramento vulcanico che spezza l'infinita monotonia del Mare Bianco, trovate un Avamposto. Un mercante mezzo congelato vi fissa: \"La Terrazza Nera vi aspetta, pregate il Caos\", mormora, vendendovi fiale bollenti a cifre inimmaginabili prima che la piana finisca."
    },
    "rests": {
        "default": "Trovate un riparo dal vento gelido e accendete un piccolo fuoco per riposare le membra stanche.",
        "fuoco_roccia": "Nelle viscere ghiacciate della montagna, al riparo nel profondo dei crepacci, trovate un pertugio. L'anfratto è asciutto e protetto dalle correnti assassine della gola; il tepore di un piccolo falò vi permette di dimenticare il baratro sottostante e riposare i muscoli.",
        "sorgente_geotermale": "Esplorando una fessura in fondo al crepaccio percorso dai venti ululanti, scoprite una sorgente. L'acqua calda sgorga dalla pietra, dissipando per un attimo il freddo soffocante della gola e restituendovi vigore per la faticosa risalita.",
        "nido_vuoto": "Lasciati i crepacci alle spalle, vi arrampicate sui vertiginosi Dirupi del Cielo Infranto. L'aria si fa spietatamente rarefatta. Trovate un nido vuoto di un'Aguglia Gigante; l'ossigeno sottile alimenta a stento il vostro bivacco, ma la vista del cielo infinito vi infonde speranza.",
        "fenditura_riparata": "Strisciando in una profonda spaccatura nella parete verticale arrivate a una fenditura riparata. È un buco roccioso soffocante, claustrofobico e poco provvisto di ossigeno, ma il terrore di precipitare costantemente dai Dirupi scompare, consentendovi di ricucire le ferite.",
        "cornicione_venti": "Vi accampate su un cornicione di pietra costantemente battuto dai venti ascensionali. Ai confini superiori dei Dirupi l'aria è così sottile che le stelle brillano in pieno giorno; l'esaurimento per la scalata è totale, ma vi accampate per un breve riposo.",
        "ultimo_cornicione": "Fermandovi su un cornicione della parete rocciosa, osservate in silenzio il vuoto sotto di voi e il mare di nubi. Affilate per l'ultima volta le lame, respirando a fatica prima di issarvi sulla desolante piana che vi attende.",
        "ara_pietra_nera": "Oltrepassato il Mare Bianco e la sua tempesta eterna, raggiungete la Terrazza dell'Eclissi: un oppressivo plateau di roccia scura dove il vento cessa improvvisamente. Sotto l'imponente ara di pietra nera trovate un innaturale silenzio.",
        "ultimo_bivacco": "Lasciandovi alle spalle l'inferno bianco del Mare Bianco, calpestate il suolo liscio e nero della Terrazza dell'Eclissi. Sotto un cielo dal colore malato di un'eclissi perenne, vi accasciate in un accampamento."
    },
    "treasures": {},
    "stories": {
        "partenza": {
            "title": "La Linea degli Alberi Morti",
            "text": "Siete al limitare della Linea degli Alberi Morti. Una fitta nebbia mattutina si impiglia tra i rami scheletrici dei pini pietrificati, impedendovi di vedere la vetta. Le sagome dei Picchi si stagliano minacciose sopra la coltre grigia. Raccogliete il vostro equipaggiamento: la gelida ascesa ha inizio."
        }
    },
    "lootItems": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "ankh_pellegrino", "bastone_eremita", "balsamo_curativo", "spada_norgrad", "alabarda_guardia", "mannaia_pesante", "scudo_ferro", "corazza_scaglie", "tomo_proibito", "reliquiario_tascabile", "martello_consacrato", "brigantina_benedetta", "stocco_duellante", "pozione_rigenerazione", "unguento_fortificante", "lama_acciaio_lunare", "martello_breccia", "gorgiera_veterano", "corazza_piastre_leone", "cappa_sussurri", "simbolo_jag_antar", "scettro_savio", "corona_martire", "elisir_sangue_vivo", "olio_bollente", "bomba_acido", "cristallo_flammaurea", "grappa_soldato", "infuso_corteccia", "olio_da_lama", "pozione_pelle_pietra", "elisir_berserker"],
    "mapNodes": [
        { "id": 0, "level": 0, "x": 400, "type": "story", "storyId": "partenza", "title": "Livello 1 - Partenza", "icon": "📜", "done": false, "active": true, "next": [1, 2, 3, 4] },
        { "id": 1, "level": 1, "x": 165, "type": "combat", "enemy": "cacciatori_frodo_vitghen", "title": "Livello 2 - Cacciatori di Frodo", "icon": "🗡️", "done": false, "active": false, "next": [5], "image": "immagini/astarte_ch2/01_cacciatori_frodo_vitghen.webp" },
        { "id": 2, "level": 1, "x": 319, "type": "combat", "enemy": "banditi_kin_brachidani", "title": "Livello 2 - Banditi Kin", "icon": "🗡️", "done": false, "active": false, "next": [5, 6], "image": "immagini/astarte_ch2/02_banditi_kin_brachidani.webp" },
        { "id": 3, "level": 1, "x": 508, "type": "combat", "enemy": "predoni_nevi", "title": "Livello 2 - Predoni delle Nevi", "icon": "🗡️", "done": false, "active": false, "next": [6], "image": "immagini/astarte_ch2/03_predoni_nevi.webp" },
        { "id": 4, "level": 1, "x": 638, "type": "combat", "enemy": "troll_giovani", "title": "Livello 2 - Troll", "icon": "🗡️", "done": false, "active": false, "next": [7], "image": "immagini/astarte_ch2/04_troll_giovani.webp" },
        { "id": 5, "level": 2, "x": 259, "type": "combat", "enemy": "banditi_kin_warg", "title": "Livello 3 - Banditi Kin con Warg", "icon": "🗡️", "done": false, "active": false, "next": [8, 10], "image": "immagini/astarte_ch2/05_banditi_kin_warg.webp" },
        { "id": 6, "level": 2, "x": 412, "type": "combat", "enemy": "disertori_vitghen_radura", "title": "Livello 3 - Disertori Vitghen", "icon": "🗡️", "done": false, "active": false, "next": [8, 9], "image": "immagini/astarte_ch2/06_disertori_vitghen_radura.webp" },
        { "id": 7, "level": 2, "x": 702, "type": "challenge", "challengeId": "resti_lungobarbi", "title": "Livello 3 - Resti Lungobarbi", "icon": "❓", "done": false, "active": false, "next": [9, 13], "image": "immagini/astarte_ch2/07_resti_lungobarbi.webp" },
        { "id": 8, "level": 3, "x": 329, "type": "challenge", "challengeId": "altare_rovi", "title": "Livello 4 - Altare tra i Rovi", "icon": "❓", "done": false, "active": false, "next": [11], "image": "immagini/astarte_ch2/08_altare_rovi.webp" },
        { "id": 9, "level": 3, "x": 526, "type": "combat", "enemy": "esiliati_seachtuir_foresta", "title": "Livello 4 - Esiliati Seachtuir", "icon": "🗡️", "done": false, "active": false, "next": [12] },
        { "id": 10, "level": 4, "x": 169, "type": "combat", "enemy": "branco_ghofuuri", "title": "Livello 5 - Branco di Ghofuuri", "icon": "🗡️", "done": false, "active": false, "next": [14], "image": "immagini/astarte_ch2/10_branco_ghofuuri.webp" },
        { "id": 11, "level": 4, "x": 369, "type": "combat", "enemy": "predoni_vitghen_crepacci", "title": "Livello 5 - Predoni Vitghen", "icon": "🗡️", "done": false, "active": false, "next": [15], "image": "immagini/astarte_ch2/11_predoni_vitghen_crepacci.webp" },
        { "id": 12, "level": 4, "x": 461, "type": "challenge", "challengeId": "eremita_sospeso", "title": "Livello 5 - L'Eremita Sospeso", "icon": "❓", "done": false, "active": false, "next": [16], "image": "immagini/astarte_ch2/12_eremita_sospeso.webp" },
        { "id": 13, "level": 4, "x": 676, "type": "merchant", "merchantId": "emporio_sotterraneo", "title": "Livello 5 - L'Emporio Sotterraneo", "icon": "🪙", "done": false, "active": false, "next": [16], "image": "immagini/astarte_ch2/13_emporio_sotterraneo.webp" },
        { "id": 14, "level": 5, "x": 230, "type": "rest", "restId": "fuoco_roccia", "title": "Livello 6 - Fuoco Sotto la Roccia", "icon": "⛺", "done": false, "active": false, "next": [17], "image": "immagini/astarte_ch2/14_fuoco_roccia.webp" },
        { "id": 15, "level": 5, "x": 341, "type": "merchant", "merchantId": "esploratore_vitghen", "title": "Livello 6 - Esploratore Vitghen", "icon": "🪙", "done": false, "active": false, "next": [17], "image": "immagini/astarte_ch2/15_esploratore_vitghen.webp" },
        { "id": 16, "level": 5, "x": 571, "type": "rest", "restId": "sorgente_geotermale", "title": "Livello 6 - Sorgente Geotermale", "icon": "⛺", "done": false, "active": false, "next": [18], "image": "immagini/astarte_ch2/16_sorgente_geotermale.webp" },
        { "id": 17, "level": 6, "x": 276, "type": "combat", "enemy": "silfidi_eterei_crepaccio", "title": "Livello 7 - Silfidi Eterei", "icon": "🗡️", "done": false, "active": false, "next": [19, 20], "image": "immagini/astarte_ch2/17_silfidi_eterei_crepaccio.webp" },
        { "id": 18, "level": 6, "x": 528, "type": "combat", "enemy": "mastini_nevi", "title": "Livello 7 - Mastini delle Nevi", "icon": "🗡️", "done": false, "active": false, "next": [21, 22], "image": "immagini/astarte_ch2/18_mastini_nevi.webp" },
        { "id": 19, "level": 7, "x": 199, "type": "challenge", "challengeId": "ponte_tesori", "title": "Livello 8 - Il Ponte dei Tesori", "icon": "❓", "done": false, "active": false, "next": [23], "image": "immagini/astarte_ch2/19_ponte_tesori.webp" },
        { "id": 20, "level": 7, "x": 362, "type": "challenge", "challengeId": "riflessi_ingannevoli", "title": "Livello 8 - Riflessi Ingannevoli", "icon": "❓", "done": false, "active": false, "next": [23, 24] },
        { "id": 21, "level": 7, "x": 459, "type": "combat", "enemy": "hrost", "title": "Livello 8 - Hrost", "icon": "🗡️", "done": false, "active": false, "next": [24, 25] },
        { "id": 22, "level": 7, "x": 623, "type": "combat", "enemy": "predoni_kin_crepaccio", "title": "Livello 8 - Predoni Kin", "icon": "🗡️", "done": false, "active": false, "next": [25], "image": "immagini/astarte_ch2/22_predoni_kin_crepaccio.webp" },
        { "id": 23, "level": 8, "x": 275, "type": "combat", "enemy": "sopravvissuti_kin", "title": "Livello 9 - Sopravvissuti Kin", "icon": "🗡️", "done": false, "active": false, "next": [26, 27], "image": "immagini/astarte_ch2/23_sopravvissuti_kin.webp" },
        { "id": 24, "level": 8, "x": 409, "type": "elite", "enemy": "kreehorn", "title": "Livello 9 - Kreehorn", "icon": "👹", "done": false, "active": false, "next": [28], "image": "immagini/astarte_ch2/24_kreehorn.webp" },
        { "id": 25, "level": 8, "x": 539, "type": "challenge", "challengeId": "tomo_viaggiatore", "title": "Livello 9 - Tomo del Viaggiatore Perduto", "icon": "❓", "done": false, "active": false, "next": [28, 29], "image": "immagini/astarte_ch2/25_tomo_viaggiatore.webp" },
        { "id": 26, "level": 9, "x": 182, "type": "elite", "enemy": "kornugan", "title": "Livello 10 - Kornugan", "icon": "👹", "done": false, "active": false, "next": [33, 30], "image": "immagini/astarte_ch2/26_kornugan.webp" },
        { "id": 27, "level": 9, "x": 328, "type": "rest", "restId": "nido_vuoto", "title": "Livello 10 - Il Nido Vuoto", "icon": "⛺", "done": false, "active": false, "next": [30, 31], "image": "immagini/riposo.webp" },
        { "id": 28, "level": 9, "x": 474, "type": "merchant", "merchantId": "mercante_pazzo", "title": "Livello 10 - Il Mercante Pazzo", "icon": "🪙", "done": false, "active": false, "next": [32], "image": "immagini/astarte_ch2/28_mercante_pazzo.webp" },
        { "id": 29, "level": 9, "x": 582, "type": "combat", "enemy": "disertori_vitghen_dirupi", "title": "Livello 10 - Disertori Vitghen", "icon": "🗡️", "done": false, "active": false, "next": [32, 43], "image": "immagini/astarte_ch2/29_disertori_vitghen_dirupi.webp" },
        { "id": 30, "level": 10, "x": 263, "type": "combat", "enemy": "predoni_accecati", "title": "Livello 11 - Predoni Accecati", "icon": "🗡️", "done": false, "active": false, "next": [34], "image": "immagini/astarte_ch2/30_predoni_accecati.webp" },
        { "id": 31, "level": 10, "x": 382, "type": "challenge", "challengeId": "altare_sospeso", "title": "Livello 11 - L'Altare Sospeso", "icon": "❓", "done": false, "active": false, "next": [34], "image": "immagini/astarte_ch2/31_altare_sospeso.webp" },
        { "id": 32, "level": 10, "x": 545, "type": "rest", "restId": "fenditura_riparata", "title": "Livello 11 - Fenditura Riparata", "icon": "⛺", "done": false, "active": false, "next": [35, 36], "image": "immagini/astarte_ch2/32_fenditura_riparata.webp" },
        { "id": 33, "level": 11, "x": 186, "type": "merchant", "merchantId": "avamposto_lungobarbi", "title": "Livello 12 - Avamposto Lungobarbi", "icon": "🪙", "done": false, "active": false, "next": [37], "image": "immagini/astarte_ch2/33_avamposto_lungobarbi.webp" },
        { "id": 34, "level": 11, "x": 341, "type": "combat", "enemy": "esiliati_seachtuir_cengia", "title": "Livello 12 - Esiliati Seachtuir", "icon": "🗡️", "done": false, "active": false, "next": [37, 40], "image": "immagini/astarte_ch2/34_esiliati_seachtuir_cengia.webp" },
        { "id": 35, "level": 11, "x": 483, "type": "elite", "enemy": "avatar_tramonto", "title": "Livello 12 - Avatar del Tramonto", "icon": "👹", "done": false, "active": false, "next": [38], "image": "immagini/astarte_ch2/35_avatar_tramonto.webp" },
        { "id": 36, "level": 11, "x": 610, "type": "merchant", "merchantId": "megera_venti", "title": "Livello 12 - La Megera dei Venti", "icon": "🪙", "done": false, "active": false, "next": [38, 41], "image": "immagini/mercante.webp" },
        { "id": 37, "level": 12, "x": 278, "type": "combat", "enemy": "assassini_assiderati", "title": "Livello 13 - Assassini Assiderati", "icon": "🗡️", "done": false, "active": false, "next": [39], "image": "immagini/astarte_ch2/37_assassini_assiderati.webp" },
        { "id": 38, "level": 12, "x": 535, "type": "combat", "enemy": "silfidi_eterei_gradinata", "title": "Livello 13 - Silfidi Eterei", "icon": "🗡️", "done": false, "active": false, "next": [44], "image": "immagini/astarte_ch2/38_silfidi_eterei_gradinata.webp" },
        { "id": 39, "level": 13, "x": 352, "type": "rest", "restId": "ultimo_cornicione", "title": "Livello 14 - L'Ultimo Cornicione", "icon": "⛺", "done": false, "active": false, "next": [45, 42], "image": "immagini/astarte_ch2/39_ultimo_cornicione.webp" },
        { "id": 40, "level": 12, "x": 414, "type": "merchant", "merchantId": "ultimo_baluardo", "title": "Livello 13 - Ultimo Baluardo", "icon": "🪙", "done": false, "active": false, "next": [39], "image": "immagini/astarte_ch2/40_ultimo_baluardo.webp" },
        { "id": 41, "level": 12, "x": 668, "type": "rest", "restId": "cornicione_venti", "title": "Livello 13 - Il Cornicione dei Venti", "icon": "⛺", "done": false, "active": false, "next": [44], "image": "immagini/astarte_ch2/41_cornicione_venti.webp" },
        { "id": 42, "level": 14, "x": 462, "type": "challenge", "challengeId": "tormenta_bianca", "title": "Livello 15 - La Tormenta Bianca", "icon": "❓", "done": false, "active": false, "next": [49, 48], "image": "immagini/astarte_ch2/42_tormenta_bianca.webp" },
        { "id": 43, "level": 10, "x": 687, "type": "elite", "enemy": "warg_mutati", "title": "Livello 11 - Warg Mutati", "icon": "👹", "done": false, "active": false, "next": [36], "image": "immagini/astarte_ch2/43_warg_mutati.webp" },
        { "id": 44, "level": 13, "x": 585, "type": "challenge", "challengeId": "crepaccio_specchiante", "title": "Livello 14 - Il Crepaccio Specchiante", "icon": "❓", "done": false, "active": false, "next": [42, 46], "image": "immagini/astarte_ch2/44_crepaccio_specchiante.webp" },
        { "id": 45, "level": 14, "x": 265, "type": "elite", "enemy": "criogolem", "title": "Livello 15 - Criogolem", "icon": "👹", "done": false, "active": false, "next": [47, 49], "image": "immagini/astarte_ch2/45_criogolem.webp" },
        { "id": 46, "level": 14, "x": 659, "type": "elite", "enemy": "cenofori_mare_bianco", "title": "Livello 15 - Cenofori delle Slavine", "icon": "👹", "done": false, "active": false, "next": [48, 52], "image": "immagini/astarte_ch2/46_cenofori_mare_bianco.webp" },
        { "id": 47, "level": 15, "x": 191, "type": "challenge", "challengeId": "monolite_ghiacciato", "title": "Livello 16 - Il Monolite Ghiacciato", "icon": "❓", "done": false, "active": false, "next": [50], "image": "immagini/astarte_ch2/47_monolite_ghiacciato.webp" },
        { "id": 48, "level": 15, "x": 567, "type": "combat", "enemy": "troll_corazzati", "title": "Livello 16 - Troll Corazzati", "icon": "🗡️", "done": false, "active": false, "next": [51, 53], "image": "immagini/astarte_ch2/48_troll_corazzati.webp" },
        { "id": 49, "level": 15, "x": 356, "type": "combat", "enemy": "gheist_gelo", "title": "Livello 16 - Gheist del Gelo", "icon": "🗡️", "done": false, "active": false, "next": [50, 51], "image": "immagini/astarte_ch2/49_gheist_gelo.webp" },
        { "id": 50, "level": 16, "x": 271, "type": "combat", "enemy": "spettri_tumuli", "title": "Livello 17 - Spettri dei Tumuli", "icon": "🗡️", "done": false, "active": false, "next": [56, 57] },
        { "id": 51, "level": 16, "x": 464, "type": "elite", "enemy": "custodi_necrogemini", "title": "Livello 17 - Custodi Necrogemini", "icon": "👹", "done": false, "active": false, "next": [57, 55], "image": "immagini/astarte_ch2/51_custodi_necrogemini.webp" },
        { "id": 52, "level": 15, "x": 730, "type": "combat", "enemy": "superstiti_kin", "title": "Livello 16 - Superstiti Kin", "icon": "🗡️", "done": false, "active": false, "next": [53], "image": "immagini/astarte_ch2/52_superstiti_kin.webp" },
        { "id": 53, "level": 16, "x": 643, "type": "merchant", "merchantId": "spirito_barattatore", "title": "Livello 17 - Spirito Barattatore", "icon": "🪙", "done": false, "active": false, "next": [55, 58], "image": "immagini/astarte_ch2/53_spirito_barattatore.webp" },
        { "id": 54, "level": 18, "x": 304, "type": "rest", "restId": "ara_pietra_nera", "title": "Livello 19 - Ara di Pietra Nera", "icon": "⛺", "done": false, "active": false, "next": [60], "image": "immagini/astarte_ch2/54_ara_pietra_nera.webp" },
        { "id": 55, "level": 17, "x": 563, "type": "combat", "enemy": "fiere_selvagge", "title": "Livello 18 - Fiere Selvagge", "icon": "🗡️", "done": false, "active": false, "next": [59] },
        { "id": 56, "level": 17, "x": 197, "type": "merchant", "merchantId": "avamposto_fine", "title": "Livello 18 - L'Avamposto della Fine", "icon": "🪙", "done": false, "active": false, "next": [54], "image": "immagini/astarte_ch2/56_avamposto_fine.webp" },
        { "id": 57, "level": 17, "x": 383, "type": "combat", "enemy": "esiliati_seachtuir_confine", "title": "Livello 18 - Esiliati Seachtuir", "icon": "🗡️", "done": false, "active": false, "next": [54], "image": "immagini/astarte_ch2/57_esiliati_seachtuir_confine.webp" },
        { "id": 58, "level": 17, "x": 714, "type": "combat", "enemy": "silfidi_flussidi", "title": "Livello 18 - Silfidi Flussidi", "icon": "🗡️", "done": false, "active": false, "next": [59], "image": "immagini/astarte_ch2/58_silfidi_flussidi.webp" },
        { "id": 59, "level": 18, "x": 628, "type": "rest", "restId": "ultimo_bivacco", "title": "Livello 19 - Ultimo Bivacco", "icon": "⛺", "done": false, "active": false, "next": [60], "image": "immagini/astarte_ch2/59_ultimo_bivacco.webp" },
        { "id": 60, "level": 19, "x": 465, "type": "combat", "enemy": "madre_silfidi", "title": "Livello 20 - Madre dei Silfidi (Boss)", "icon": "👑", "done": false, "active": false, "next": [] }
    ]
};
