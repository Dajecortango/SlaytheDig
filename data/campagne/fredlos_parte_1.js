// Campagna "Fredlös, Parte I: La Danza di Kesia".
// Il contenuto dopo "=" è JSON puro: niente funzioni, gli effetti sono descritti nei campi "effects"
// e interpretati da applyEffects() in js/game.js. È un file .js (e non .json) perché il gioco
// si apre con doppio click da file:// e il browser blocca fetch() di file locali.
// Nemici, oggetti, reliquie e maledizioni sono richiamati per id da data/libreria/.
window.CAMPAIGNS = window.CAMPAIGNS || {};
window.CAMPAIGNS["fredlos_parte_1"] = {
    "id": "fredlos_parte_1",
    "title": "Fredlös, Parte I: La Danza di Kesia",
    "avventura": "fredlos",
    "capitolo": 1,
    "badge": "Parte I",
    "description": "Dall'Arce delle Storie di Aebeltoff al fiume Hemsil: inseguite Kesia, figlia di Fredlös l'Oppresso, attraverso i Barri dei Lungobarbi, la Valle del Krogg, il Cammino di Piotr, le miniere di Gerslev e il forte di Granbarricata.",
    "coverImage": "immagini/fredlos_parte_1/copertina_fredlos.webp",
    "introText": "Kesia, figlia diretta di Fredlös l'Oppresso, incarna lo spirito caotico, beffardo e festaiolo delle saghe vitghen: la sua magia galvanizza gli animi, trasforma i banchetti in risse furibonde e mette alla prova chi la insegue attraverso imprese degne di essere raccontate.",
    "heroes": ["enea_dignitas", "aiace_dignitas", "zeno", "aurelio_dignitas"],
    "initialArmory": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "balsamo_curativo"],
    "challenges": {
        "dedalo_barro_lucerna": {
            "title": "Il Dedalo del Barro Lucerna",
            "desc": "Kesia taglia attraverso il Barro Lucerna, un groviglio di strade strette e contorte che si avviluppano come serpi tra le piccole case. Nello Slargo della Lanterna la grande luce è stata spenta da una folata di vento magico, lasciando al buio la mappa incisa nella pietra sulle mura interne.",
            "ignoreText": "Evitate di perdere tempo a decifrare la mappa al buio e seguite l'istinto lungo i vicoli esterni, allungando il percorso.",
            "successText": "Riaccendete una torcia contro il vento e leggete rapidamente i rilievi della mappa di pietra nello Slargo, imboccando la scorciatoia esatta prima che la traccia di Kesia svanisca.",
            "failText": "Vi affidate a una lettura frettolosa delle incisioni e finite in un vicolo cieco ingombro di carri e ghiaccio, dovendo scavalcare a fatica i tetti bassi per ritrovare la via.",
            "stat": "int",
            "cd": 7,
            "reward": "mappa_della_regione",
            "punishment": {
                "type": "injury",
                "name": "Tetti di Aebeltoff",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "passaggi_mura_liliali": {
            "title": "I Passaggi Sotto le Mura Liliali",
            "desc": "Per guadagnare terreno su Kesia, individuate l'imbocco di uno dei leggendari passaggi segreti sotterranei che corrono sotto le Mura Liliali in direzione dell'esterno. Il tunnel è buio, stretto per chi non ha la statura di un Lungobarbo e protetto da vecchie trappole meccaniche.",
            "ignoreText": "Rinunciate al cunicolo segreto e uscite dalle porte principali lungo la strada battuta, seppur più lenta.",
            "successText": "Avanzate chini individuando i fili di tensione nella penombra e sbucate direttamente nella Valle del Krogg con netto vantaggio.",
            "failText": "Urtate una piastra nascosta nel pavimento; una grata di ferro vi cade addosso di striscio, ferendovi alle spalle prima che riusciate a strisciare fuori.",
            "stat": "int",
            "cd": 7,
            "reward": "stendardo_da_battaglia",
            "punishment": {
                "type": "injury",
                "name": "La grata di ferro",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "contadini_enisov": {
            "title": "I Contadini Orgogliosi di Enisov",
            "desc": "Attraversate Enisov Bassa, il borgo adagiato nella piana ai piedi dei Picchi del Tramonto. Gli abitanti, notoriamente fieri del fatto che la sopravvivenza stessa di Aebeltoff dipenda dai loro raccolti, hanno bloccato la strada con dei carri dopo che Kesia ha fatto fuggire il loro bestiame per scherzo, e vi guardano con estrema ostilità.",
            "ignoreText": "Aggirate l'intero abitato passando per i campi fangosi pur di non discutere con i contadini infuriati.",
            "successText": "Riconoscete pubblicamente il valore vitale di Enisov per tutto il Krogg e li aiutate a radunare una mandria imbizzarrita, ottenendo il libero passaggio e le loro indicazioni.",
            "failText": "Rispondete con arroganza alle loro rimostranze; i contadini aizzano i loro mastini da guardia e vi scagliano pietre dai tetti, costringendovi a forzare il blocco a caro prezzo.",
            "stat": "fth",
            "cd": 7,
            "reward": "bussola_del_sopravvissuto",
            "punishment": "maledetti_dai_popolani"
        },
        "cippo_amante_lungobarbo": {
            "title": "Il Cippo dell'Amante Lungobarbo",
            "desc": "Accanto al Ponte di Piotr sorge un cippo commemorativo che ricorda l'incredibile marcia a piedi compiuta dall'eroe lungobarbo per avvertire l'amata Porunn della tempesta dal Ghiacceterno. Kesia ha lasciato un indizio inciso col fuoco sulla pietra, ma per raggiungerlo dovete sporgervi oltre la balaustra ghiacciata sopra le rapide.",
            "ignoreText": "Attraversate il ponte senza sporgervi sul precipizio gelido, proseguendo alla cieca lungo il Cammino.",
            "successText": "Vi assicurate l'uno all'altro con una fune e decifrate il messaggio ardente di Kesia sul cippo, sentendo lo spirito indomito di Piotr rinvigorire il vostro passo.",
            "failText": "Il ghiaccio sulla balaustra cede sotto i vostri guanti; rischiate di precipitare nelle acque gelide sottostanti e vi tirate su con i muscoli strappati dal freddo.",
            "stat": "str",
            "cd": 8,
            "reward": "spirito_di_piotr",
            "punishment": "morsa_assiderante"
        },
        "galleria_oro_rame": {
            "title": "La Galleria d'Oro e Rame",
            "desc": "Kesia è passata attraverso una delle miniere d'oro e rame di Gerslev che taglia il fianco della montagna. I puntelli di legno della galleria vibrano pericolosamente e nel buio luccicano vene di metallo prezioso ancora incastrate nella roccia viva.",
            "ignoreText": "Non entrate nella miniera instabile e scavalcate il passo montano all'esterno, sotto il vento gelido.",
            "successText": "Attraversate il tunnel minerario leggendo con occhio esperto la tenuta delle travi, uscendo sul versante opposto in tempi rapidissimi, con qualche pepita staccata dalla roccia in tasca.",
            "failText": "Una scossa fa cedere una trave portante della miniera; venite investiti da una nube di polvere di rame e detriti rocciosi mentre correte verso l'uscita.",
            "stat": "int",
            "cd": 8,
            "reward": {
                "type": "coins",
                "name": "Pepite di Gerslev",
                "desc": "+15 Scudi alla cassa della compagnia",
                "effects": [
                    { "effect": "coins", "val": 15 }
                ]
            },
            "punishment": {
                "type": "injury",
                "name": "Polvere di rame e detriti",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "inganno_gheist_gelo": {
            "title": "L'Inganno del Gheist del Gelo",
            "desc": "Mentre una tormenta improvvisa cala dai fianchi della Faucebigia riducendo la visibilità a pochi passi, scorgete nella neve la figura di un vecchio viandante infreddolito che vi chiama per nome, dicendo di aver visto Kesia dirigersi verso un crepaccio laterale. Sapete però che in queste lande ventose si aggirano i Gheist del Gelo, spiriti bugiardi che conducono gli sprovveduti alla morte per assideramento.",
            "ignoreText": "Stringete i denti, ignorate completamente le suppliche della figura e marciate dritti controvento senza mai voltare lo sguardo.",
            "successText": "Con una volontà di ferro smascherate la malia dello spirito e avanzate contro la tormenta; il Gheist si dissolve tra le correnti lasciando a terra una scia di Polvere Boreale luminescente che vi illumina il vero sentiero.",
            "failText": "Esitate e fate qualche passo nella direzione indicata dal vecchio prima di capire l'inganno; finite in una sacca di vento gelido che vi congela gli arti e vi fa perdere l'orientamento.",
            "stat": "fth",
            "cd": 8,
            "reward": "polvere_boreale",
            "punishment": "gelo_nelle_ossa"
        },
        "sguardo_dello_hrost": {
            "title": "Lo Sguardo dello Hrost",
            "desc": "Sugli spalti innevati di Granbarricata, quasi invisibile contro il candore del ghiaccio, incrociate due grandi occhi scuri: è uno Hrost, il raro Silfide mimetico delle distese gelate. Incontrare il suo sguardo genera un'ondata di pace e calma interiore così profonda da rischiare di farvi dimenticare la fretta del vostro inseguimento.",
            "ignoreText": "Abbassate immediatamente gli occhi sulla neve per non incrociare il suo sguardo e passate oltre a passo di marcia.",
            "successText": "Sostenete lo sguardo dello Hrost per un solo istante controllato: la pace interiore placa la vostra fatica e schiarisce la vostra mente senza bloccarvi sul posto.",
            "failText": "Rimanete incantati dalla quiete assoluta degli occhi del Silfide, restando immobili sotto il vento del Ghiacceterno finché il gelo non vi morde dolorosamente le carni.",
            "stat": "fth",
            "cd": 8,
            "reward": "frammento_di_chiarezza",
            "punishment": "bruciature_da_gelo"
        },
        "relitti_battaglie_hemsil": {
            "title": "I Relitti delle Battaglie sull'Hemsil",
            "desc": "Le sponde del fiume Hemsil sono state per secoli teatro di grandi e sanguinose battaglie fra i clan di Collifreddi. Dal fango ghiacciato dell'argine affiorano antiche casse militari, scudi spezzati e armi vitghen, ma il ghiaccio sottile sopra l'acqua profonda scricchiola sotto i vostri stivali.",
            "ignoreText": "Restate sul sentiero alto e asciutto, lasciando i resti delle antiche battaglie sepolti nel ghiaccio del fiume.",
            "successText": "Sondate lo spessore della lastra glaciale con le aste delle armi e recuperate i cimeli bellici meglio conservati senza rompere la crosta.",
            "failText": "La lastra di ghiaccio si spezza di colpo sotto il vostro peso, facendovi sprofondare fino alla cintola nelle acque gelide dell'Hemsil.",
            "stat": "int",
            "cd": 8,
            "reward": "armatura_d_ordinanza",
            "punishment": "maledizione_congelante"
        },
        "banchetto_illusorio_kesia": {
            "title": "Il Banchetto Illusorio di Kesia",
            "desc": "In una radura innevata vicino al fiume trovate una lunga tavola imbandita fumante di carne d'agnello, caraffe di Kvass e idromele, illuminata da Fuochi Fatui danzanti. È uno dei celebri scherzi di Kesia per rallentarvi: il profumo è inebriante, ma la magia della figlia di Fredlös nasconde sempre un'insidia per chi cede all'ingordigia.",
            "ignoreText": "Rifiutate di toccare il banchetto magico e tirate dritto verso il fiume mantenendo la concentrazione.",
            "successText": "Brindate ad alta voce in onore di Fredlös e di Kesia raccontando un breve aneddoto divertente senza toccare il cibo incantato; i Fuochi Fatui danzano compiaciuti lasciandovi passare rinvigoriti nello spirito.",
            "failText": "Cedete alla tentazione di bere dai calici sulla tavola; il liquore stregato vi annebbia la vista e vi scatena un'ira improvvisa che vi porta quasi a colpirvi tra di voi.",
            "stat": "fth",
            "cd": 9,
            "reward": "anello_del_giuramento",
            "punishment": "sbornia_pesante"
        }
    },
    "merchants": {
        "default": "Un mercante di passaggio vi mostra la sua merce.",
        "cantore_barro_vampatore": "Proprio sotto i bastioni delle Mura Liliali, non lontano dalle quattro torri d'osservazione sul Krogg, incontrate un mastro artigiano legato ai Cantori della Fiamma che sta allestendo una carovana commerciale. Intrigato dal fatto che stiate inseguendo la leggendaria Kesia, accetta di vendervi armi temprate, provviste e rari manufatti dei Lungobarbi.",
        "carovana_delle_miniere": "Incontrate un convoglio corazzato di cercatori e commercianti che scende dai versanti occidentali dei Monti Scintillanti. Trasportano metalli grezzi, attrezzi da scavo, Pietre dell'Aquila calorifere e pellicce pesanti: un'ottima occasione per fare acquisti prima di salire in quota.",
        "cacciatore_ghiacceterno": "Riparato dietro il portale interno di Granbarricata trovate un cacciatore solitario reduce da una spedizione ai margini del Ghiacceterno. Porta sulla slitta pellicce di Yak, Lana di Ghiaccio e veri frammenti di corno di Kreehorn, ed è disposto a commerciare con voi prima di rientrare a valle."
    },
    "rests": {
        "default": "Trovate un riparo dal vento gelido e accendete un piccolo fuoco per riposare.",
        "presidio_sul_valico": "Trovate riparo in una delle antiche postazioni difensive erette dagli Jarl sotto i valichi dei Picchi del Tramonto a guardia del Krogg. Tra le spesse mura di pietra potete accendere un fuoco al riparo dal vento gelido e riprendere fiato.",
        "rifugio_dei_cavatori": "Vi fermate in una solida baracca di pietra e legname usata dai minatori vitghen per ripararsi dalle bufere improvvise dei Monti Scintillanti. Una stufa ancora tiepida vi permette di riposare e scaldarvi le ossa.",
        "torre_guardia_fiume": "Scorgete finalmente Kesia sull'altra sponda del fiume Hemsil, ma il ponte è presidiato da una minaccia colossale risvegliata dalla sua magia. Vi barricate all'interno dei resti di una torre di vedetta vitghen affacciata sull'Hemsil. Accendete un fuoco protetto dalle mura di pietra per asciugare le vesti, curare le ferite e affilare le lame in vista della battaglia sul ponte.",
        "bivacco_tra_i_larici": "Scorgete finalmente Kesia sull'altra sponda del fiume Hemsil, ma il ponte è presidiato da una minaccia colossale risvegliata dalla sua magia. Trovate una conca riparata dal vento tra un tenace gruppo di larici e betulle a ridosso dell'argine. Qui potete distribuire razioni calde e riposare le membra prima di forzare il passaggio verso le Brughiere del Lander."
    },
    "treasures": {},
    "stories": {
        "racconto_figlia_fredlos": {
            "title": "Il Racconto per la Figlia di Fredlös",
            "text": "Siete sul punto più alto del Barro Loggiato, l'esclusivo quartiere dei Cantori della Fiamma dai tetti a punta e dai colori sgargianti, davanti alle mura istoriate dell'Arce delle Storie di Aebeltoff.\n\nAll'interno dell'Arce raccontate una grande storia per evocare Kesia. La figlia di Fredlös compare e ascolta soddisfatta ma, fedele alla sua natura beffarda e inafferrabile, decide di mettervi alla prova: fugge tra una risata cristallina e un turbine di scintille, trascinandovi in un folle inseguimento fuori dall'Arce."
        },
        "trama_meta_percorso": { "title": "Ai piedi dei Monti Scintillanti", "text": "" }
    },
    "lootItems": null,
    "mapNodes": [
        {
            "id": 0,
            "level": 0,
            "x": 440,
            "type": "story",
            "title": "Livello 1 - L'Arce delle Storie",
            "icon": "📜",
            "done": false,
            "active": true,
            "next": [1, 2, 3],
            "image": "immagini/fredlos_parte_1/1a_racconto_figlia_fredlos.webp",
            "storyId": "racconto_figlia_fredlos"
        },
        {
            "id": 1,
            "level": 1,
            "x": 220,
            "type": "combat",
            "title": "Livello 2 - La Rissa sulla Ruga dei Cantinieri",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [4],
            "image": "immagini/fredlos_parte_1/2a_rissa_ruga_cantinieri.webp",
            "enemy": "rissa_ruga_cantinieri"
        },
        {
            "id": 2,
            "level": 1,
            "x": 440,
            "type": "challenge",
            "title": "Livello 2 - Il Dedalo del Barro Lucerna",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [4, 5],
            "image": "immagini/fredlos_parte_1/2b_dedalo_barro_lucerna.webp",
            "challengeId": "dedalo_barro_lucerna"
        },
        {
            "id": 3,
            "level": 1,
            "x": 660,
            "type": "combat",
            "title": "Livello 2 - Il Ghiaccio del Barro Molare",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [5],
            "image": "immagini/fredlos_parte_1/2c_ghiaccio_barro_molare.webp",
            "enemy": "marinai_barro_molare"
        },
        {
            "id": 4,
            "level": 2,
            "x": 330,
            "type": "merchant",
            "title": "Livello 3 - Il Cantore del Barro Vampatore",
            "icon": "🪙",
            "done": false,
            "active": false,
            "next": [6, 7],
            "image": "immagini/fredlos_parte_1/3a_cantore_barro_vampatore.webp",
            "merchantId": "cantore_barro_vampatore"
        },
        {
            "id": 5,
            "level": 2,
            "x": 550,
            "type": "challenge",
            "title": "Livello 3 - I Passaggi Sotto le Mura Liliali",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [7, 8],
            "image": "immagini/fredlos_parte_1/3b_passaggi_mura_liliali.webp",
            "challengeId": "passaggi_mura_liliali"
        },
        { "id": 6, "level": 3, "x": 220, "type": "combat", "title": "Livello 4 - I Predatori del Sira", "icon": "🗡️", "done": false, "active": false, "next": [9], "image": "immagini/fredlos_parte_1/4a_predatori_del_sira.webp", "enemy": "warg_del_sira" },
        {
            "id": 7,
            "level": 3,
            "x": 440,
            "type": "challenge",
            "title": "Livello 4 - I Contadini Orgogliosi di Enisov",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [9, 10],
            "image": "immagini/fredlos_parte_1/4b_contadini_enisov.webp",
            "challengeId": "contadini_enisov"
        },
        {
            "id": 8,
            "level": 3,
            "x": 660,
            "type": "combat",
            "title": "Livello 4 - I Razziatori dei Picchi del Tramonto",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [10],
            "image": "immagini/fredlos_parte_1/4c_razziatori_picchi_tramonto.webp",
            "enemy": "razziatori_picchi_tramonto"
        },
        { "id": 9, "level": 4, "x": 330, "type": "rest", "title": "Livello 5 - Il Presidio sul Valico", "icon": "⛺", "done": false, "active": false, "next": [11, 12], "image": "immagini/fredlos_parte_1/5a_presidio_sul_valico.webp", "restId": "presidio_sul_valico" },
        { "id": 10, "level": 4, "x": 550, "type": "elite", "title": "Livello 5 - Il Branco di Kreehorn", "icon": "👹", "done": false, "active": false, "next": [12, 13], "image": "immagini/bestia_glaciale_nel_canyon_innevato.webp", "enemy": "coppia_di_kreehorn" },
        {
            "id": 11,
            "level": 5,
            "x": 220,
            "type": "combat",
            "title": "Livello 6 - L'Imboscata al Ponte di Piotr",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [14],
            "image": "immagini/fredlos_parte_1/6a_imboscata_ponte_piotr.webp",
            "enemy": "fuorilegge_ponte_piotr"
        },
        {
            "id": 12,
            "level": 5,
            "x": 440,
            "type": "challenge",
            "title": "Livello 6 - Il Cippo dell'Amante Lungobarbo",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [14, 15],
            "image": "immagini/fredlos_parte_1/6b_cippo_amante_lungobarbo.webp",
            "challengeId": "cippo_amante_lungobarbo"
        },
        { "id": 13, "level": 5, "x": 660, "type": "combat", "title": "Livello 6 - I Cenofori delle Slavine", "icon": "🗡️", "done": false, "active": false, "next": [15], "image": "", "enemy": "cenofori_slavine_krogg" },
        {
            "id": 14,
            "level": 6,
            "x": 330,
            "type": "merchant",
            "title": "Livello 7 - La Carovana delle Miniere",
            "icon": "🪙",
            "done": false,
            "active": false,
            "next": [16],
            "image": "immagini/fredlos_parte_1/7a_carovana_delle_miniere.webp",
            "merchantId": "carovana_delle_miniere"
        },
        { "id": 15, "level": 6, "x": 550, "type": "rest", "title": "Livello 7 - Il Rifugio dei Cavatori", "icon": "⛺", "done": false, "active": false, "next": [16], "image": "immagini/fredlos_parte_1/7b_rifugio_dei_cavatori.webp", "restId": "rifugio_dei_cavatori" },
        {
            "id": 16,
            "level": 7,
            "x": 440,
            "type": "story",
            "title": "Livello 8 - Ai piedi dei Monti Scintillanti",
            "icon": "📜",
            "done": false,
            "active": false,
            "next": [17, 18, 19],
            "image": "immagini/fredlos_parte_1/8a_ai_piedi_monti_scintillanti.webp",
            "storyId": "trama_meta_percorso"
        },
        { "id": 17, "level": 8, "x": 220, "type": "combat", "title": "Livello 9 - La Contesa tra Minatori", "icon": "🗡️", "done": false, "active": false, "next": [20], "image": "immagini/fredlos_parte_1/9a_contesa_tra_minatori.webp", "enemy": "minatori_di_gerslev" },
        {
            "id": 18,
            "level": 8,
            "x": 440,
            "type": "challenge",
            "title": "Livello 9 - La Galleria d'Oro e Rame",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [20, 21],
            "image": "immagini/fredlos_parte_1/9b_galleria_oro_rame.webp",
            "challengeId": "galleria_oro_rame"
        },
        {
            "id": 19,
            "level": 8,
            "x": 660,
            "type": "combat",
            "title": "Livello 9 - I Golem dei Monti Scintillanti",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [21],
            "image": "immagini/fredlos_parte_1/9c_golem_monti_scintillanti.webp",
            "enemy": "golem_monti_scintillanti"
        },
        {
            "id": 20,
            "level": 9,
            "x": 330,
            "type": "challenge",
            "title": "Livello 10 - L'Inganno del Gheist del Gelo",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [22, 23],
            "image": "immagini/fredlos_parte_1/10a_inganno_gheist_gelo.webp",
            "challengeId": "inganno_gheist_gelo"
        },
        {
            "id": 21,
            "level": 9,
            "x": 550,
            "type": "elite",
            "title": "Livello 10 - Il Predatore dei Picchi",
            "icon": "👹",
            "done": false,
            "active": false,
            "next": [23, 24],
            "image": "immagini/fredlos_parte_1/10b_predatore_dei_picchi.webp",
            "enemy": "predatore_dei_picchi"
        },
        {
            "id": 22,
            "level": 10,
            "x": 220,
            "type": "combat",
            "title": "Livello 11 - Le Sentinelle del Forte Antico",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [25],
            "image": "immagini/fredlos_parte_1/11a_sentinelle_forte_antico.webp",
            "enemy": "sentinelle_forte_antico"
        },
        {
            "id": 23,
            "level": 10,
            "x": 440,
            "type": "challenge",
            "title": "Livello 11 - Lo Sguardo dello Hrost",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [25, 26],
            "image": "immagini/hrost_nella_caverna_di_ghiaccio.webp",
            "challengeId": "sguardo_dello_hrost"
        },
        {
            "id": 24,
            "level": 10,
            "x": 660,
            "type": "merchant",
            "title": "Livello 11 - Il Cacciatore del Ghiacceterno",
            "icon": "🪙",
            "done": false,
            "active": false,
            "next": [26],
            "image": "immagini/fredlos_parte_1/11c_cacciatore_ghiacceterno.webp",
            "merchantId": "cacciatore_ghiacceterno"
        },
        {
            "id": 25,
            "level": 11,
            "x": 330,
            "type": "combat",
            "title": "Livello 12 - I Gropiceri dei Crinali",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [27, 28],
            "image": "immagini/fredlos_parte_1/12a_gropiceri_dei_crinali.webp",
            "enemy": "gropiceri_dei_crinali"
        },
        {
            "id": 26,
            "level": 11,
            "x": 550,
            "type": "challenge",
            "title": "Livello 12 - I Relitti delle Battaglie sull'Hemsil",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [28, 29],
            "image": "immagini/fredlos_parte_1/12b_relitti_battaglie_hemsil.webp",
            "challengeId": "relitti_battaglie_hemsil"
        },
        { "id": 27, "level": 12, "x": 220, "type": "elite", "title": "Livello 13 - Il Troll del Guado", "icon": "👹", "done": false, "active": false, "next": [30], "image": "immagini/fredlos_parte_1/13a_troll_del_guado.webp", "enemy": "troll_del_guado" },
        {
            "id": 28,
            "level": 12,
            "x": 440,
            "type": "challenge",
            "title": "Livello 13 - Il Banchetto Illusorio di Kesia",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [30, 31],
            "image": "immagini/fredlos_parte_1/13b_banchetto_illusorio_kesia.webp",
            "challengeId": "banchetto_illusorio_kesia"
        },
        {
            "id": 29,
            "level": 12,
            "x": 660,
            "type": "combat",
            "title": "Livello 13 - La Pattuglia di Confine dei Crinocorno",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [31],
            "image": "immagini/fredlos_parte_1/13c_pattuglia_crinocorno.webp",
            "enemy": "pattuglia_crinocorno"
        },
        {
            "id": 30,
            "level": 13,
            "x": 330,
            "type": "rest",
            "title": "Livello 14 - La Vecchia Torre di Guardia sul Fiume",
            "icon": "⛺",
            "done": false,
            "active": false,
            "next": [32],
            "image": "immagini/fredlos_parte_1/14a_torre_guardia_fiume.webp",
            "restId": "torre_guardia_fiume"
        },
        { "id": 31, "level": 13, "x": 550, "type": "rest", "title": "Livello 14 - Il Bivacco tra i Larici", "icon": "⛺", "done": false, "active": false, "next": [32], "image": "immagini/fredlos_parte_1/14b_bivacco_tra_i_larici.webp", "restId": "bivacco_tra_i_larici" },
        {
            "id": 32,
            "level": 14,
            "x": 440,
            "type": "combat",
            "title": "Livello 15 - Il Campione Folle di Kesia e il Furore dell'Hemsil",
            "icon": "👑",
            "done": false,
            "active": false,
            "next": [],
            "image": "immagini/fredlos_parte_1/15a_campione_folle_di_kesia.webp",
            "enemy": "campione_folle_di_kesia"
        }
    ]
};
