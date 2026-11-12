// Campagna "Fredlös, Parte II: L'Inseguimento di Kesia".
// Il contenuto dopo "=" è JSON puro: niente funzioni, gli effetti sono descritti nei campi "effects"
// e interpretati da applyEffects() in js/game.js. È un file .js (e non .json) perché il gioco
// si apre con doppio click da file:// e il browser blocca fetch() di file locali.
// Nemici, oggetti, reliquie e maledizioni sono richiamati per id da data/libreria/.
window.CAMPAIGNS = window.CAMPAIGNS || {};
window.CAMPAIGNS["fredlos_parte_2"] = {
    "id": "fredlos_parte_2",
    "title": "Fredlös, Parte II: L'Inseguimento di Kesia",
    "avventura": "fredlos",
    "capitolo": 2,
    "difficolta": { "vittoriaMin": 15, "vittoriaMax": 35 },
    "terreno": "neve",
    "badge": "Parte II",
    "description": "Dalla sponda orientale dell'Hemsil alle porte di Svalbard: inseguite Kesia attraverso le Brughiere del Lander, la Roccia di Zamak, le terre di Ravndal, il Colle Sovrano, le Sorgenti di Fuocogelo e la Piana del Val.",
    "coverImage": "immagini/fredlos_parte_2/4b_vedetta_roccia_di_zamak.webp",
    "introText": "Travolti dalla furia del Capoguerra e precipitati nelle acque gelide del fiume, siete stati trascinati dalla corrente fino a spiaggiarvi sulla sponda orientale, nelle Brughiere del Lander. Kesia ha ormai guadagnato un forte distacco e il vostro gruppo deve rialzarsi, ferito e infreddolito, per riprendere l'inseguimento attraverso Collifreddi.",
    "heroes": ["enea_dignitas", "aiace_dignitas", "zeno", "aurelio_dignitas"],
    "initialArmory": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "balsamo_curativo"],
    "challenges": {
        "sacche_impigliate_nella_secca": {
            "title": "Le Sacche Impigliate nella Secca",
            "desc": "A pochi metri dalla riva su cui siete approdati, vedete che parte del vostro equipaggiamento perso durante la caduta dal ponte è rimasta incastrata tra un tronco spezzato e delle lastre di ghiaccio in mezzo alle rapide dell'Hemsil. Poco più avanti, sulla fanghiglia della riva, notate già le impronte delicate di Kesia che puntano dritte verso l'interno: non vi ha nemmeno aspettati per vedere se sareste annegati.",
            "ignoreText": "Siete già troppo infreddoliti per rientrare in acqua; lasciate le sacche al fiume e vi mettete subito in marcia verso l'interno.",
            "successText": "Usando un ramo lungo e assicurandovi una corda alla vita, vi sporgete sulla secca e recuperate le vostre sacche prima che la corrente le trascini via definitivamente.",
            "failText": "Il tronco cede mentre cercate di afferrare le cinghie; finite nuovamente immersi nell'acqua gelida fino al petto, uscendone intirizziti e a mani vuote.",
            "stat": "str",
            "cd": 7,
            "reward": {
                "type": "coins",
                "name": "Le sacche ritrovate",
                "desc": "+12 Scudi alla cassa della compagnia",
                "effects": [
                    { "effect": "coins", "val": 12 }
                ]
            },
            "punishment": {
                "type": "injury",
                "name": "L'acqua gelida dell'Hemsil",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "torbiera_ghiacciata": {
            "title": "La Torbiera Ghiacciata",
            "desc": "Per recuperare terreno su Kesia decidete di tagliare in linea retta attraverso una depressione della brughiera. Sotto lo strato superficiale di muschio e brina si nasconde però una profonda torbiera pronta a cedere al minimo passo falso.",
            "ignoreText": "Aggirate l'intera conca seguendo il crinale roccioso asciutto, allungando considerevolmente il vostro cammino.",
            "successText": "Individuate i ciuffi d'erba più scura che dovrebbero segnare i punti in cui la terra è più solida e attraversate la torbiera con passo leggero e veloce, dimezzando i tempi di marcia.",
            "failText": "La crosta gelata si spacca sotto i vostri piedi; sprofondate nel fango nero e gelido fino alle cosce, impiegando un'eternità e uno sforzo erculeo per tirarvi fuori da quella situazione di merda.",
            "stat": "int",
            "cd": 7,
            "reward": "sigillo_runico",
            "punishment": "gelo_nelle_ossa"
        },
        "vedetta_roccia_di_zamak": {
            "title": "La Vedetta sulla Roccia di Zamak",
            "desc": "La parete scoscesa della Roccia di Zamak offre un punto d'osservazione naturale perfetto su tutta la regione. Arrampicarsi fino alla sommità vi permetterebbe di scorgere la pista seguita da Kesia, ma la roccia è battuta da raffiche di vento molto, molto violente.",
            "ignoreText": "Rinunciate alla scalata e proseguite alla base del monolito seguendo le tracce più evidenti nel terreno.",
            "successText": "Raggiungete la cima sfidando il vento e, scrutando l'orizzonte, individuate chiaramente i segni del passaggio di Kesia in direzione delle terre di Ravndal e del Colle Sovrano.",
            "failText": "Una raffica improvvisa vi fa perdere la presa a metà della scalata; scivolate lungo la roccia viva scorticandovi le mani e cadendo pesantemente sui rovi sottostanti.",
            "stat": "str",
            "cd": 8,
            "reward": "mappa_della_regione",
            "punishment": {
                "type": "injury",
                "name": "I rovi sotto la Roccia",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "mandria_imbizzarrita": {
            "title": "La Mandria Imbizzarrita",
            "desc": "Come ennesimo dispetto lungo la sua fuga, Kesia ha spalancato i recinti di una tenuta di allevamento alle porte di Ravndal. Una mandria di venti cavalli da guerra senza sella sta galoppando all'impazzata lungo il sentiero proprio verso di voi.",
            "ignoreText": "Vi gettate immediatamente nel fosso spinoso ai lati della strada per lasciar sfilare la mandria sopra le vostre teste.",
            "successText": "Con sangue freddo riuscite a incanalare e calmare i cavalli di testa, evitando di essere travolti e sfruttando le bestie per percorrere un tratto di strada più velocemente.",
            "failText": "Non riuscite a sgomberare il sentiero in tempo; gli zoccoli dei cavalli in corsa vi urtano gettandovi a terra nel fango.",
            "stat": "fth",
            "cd": 8,
            "reward": "stendardo_da_battaglia",
            "punishment": {
                "type": "injury",
                "name": "Travolti dagli zoccoli",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "sentiero_dei_pellegrini": {
            "title": "Il Sentiero dei Pellegrini",
            "desc": "Il cammino secondario che sale al Colle Sovrano si inerpica lungo una cresta ventosa disseminata di lastre e offerte lasciate dai fedeli. Il terreno è ripido e coperto da un insidioso strato di ghiaccio trasparente. Lungo la salita, le offerte di cibo e idromele lasciate dai fedeli sulle lastre sono state appena morsicate e rovesciate: Kesia è passata di qui da pochissimi minuti.",
            "ignoreText": "Procedete lentamente piantando i pugnali e le aste nel terreno ad ogni passo, arrivando in cima molto stanchi. D'altro canto, però, avete evitato qualsivoglia pericolo.",
            "successText": "Rispettate i segni di orientamento sulle lastre votive, trovando i gradini intagliati nella roccia viva che vi permettono di salire in sicurezza fino alla vetta.",
            "failText": "Mettete un piede sul ghiaccio vivo e scivolate lungo la pietra tagliente della cresta, fermandovi solo contro una lastra di granito.",
            "stat": "fth",
            "cd": 8,
            "reward": "benedizione_del_primigenio",
            "punishment": {
                "type": "injury",
                "name": "La lastra di granito",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "costone_di_ghiaia_e_neve": {
            "title": "Il Costone di Ghiaia e Neve",
            "desc": "Per raggiungere rapidamente le falde del Massiccio Semprebrina dovete attraversare un largo canalone di detriti rocciosi e neve. A metà della traversata, sentite il manto sotto i vostri stivali assestarsi con un sinistro scricchiolio. Sul lato opposto del canalone vedete svolazzare un lembo di stoffa colorata impigliato tra le rocce: Kesia ha attraversato il pendio senza nemmeno far scivolare un sasso.",
            "ignoreText": "Tornate indietro sul bordo del canalone e scendete fino a fondovalle prima di risalire sul lato opposto.",
            "successText": "Correte in diagonale mantenendo la distanza di sicurezza tra i membri del gruppo e toccate la roccia solida un istante prima che il ghiaione scivoli a valle.",
            "failText": "Lo smottamento di pietre e neve vi trascina giù per una trentina di metri, lasciandovi pieni di lividi ed escoriazioni.",
            "stat": "str",
            "cd": 8,
            "reward": "bussola_del_sopravvissuto",
            "punishment": {
                "type": "injury",
                "name": "Lo smottamento",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "campo_di_geyser": {
            "title": "Il Campo di Geyser",
            "desc": "Scorgete la sagoma di Kesia sparire oltre la cortina di vapore sul lato opposto del pianoro, ma per non perderla dovete tagliare dritti attraverso un campo bucherellato di sfiatatoi naturali da cui eruttano a intermittenza getti d'acqua bollente e colonne di vapore denso che azzerano la visibilità.",
            "ignoreText": "Aggirate il campo di fumarole tenendovi più in alto sulla parete rocciosa gelida, dove il vento spazza via i vapori.",
            "successText": "Osservate il ritmo regolare delle eruzioni e passate tra i geyser nei momenti di quiete, superando l'ostacolo con estrema facilità e senza nemmeno aver sfiorato del vapore.",
            "failText": "Un getto di vapore bollente esplode da una fessura nascosta nella neve proprio accanto a voi, ustionandovi la pelle esposta e accecandovi temporaneamente.",
            "stat": "int",
            "cd": 9,
            "reward": "frammento_di_chiarezza",
            "punishment": "vertigine_lacerante"
        },
        "pontili_sulle_pozze_ardenti": {
            "title": "I Pontili sulle Pozze Ardenti",
            "desc": "Kesia è passata danzando in equilibrio sulle strette lingue di roccia che dividono i bacini ribollenti di Fuoco Nero. Le fiamme scure lambiscono il sentiero e il fumo nero e denso rende difficile respirare e vedere dove mettere i piedi.",
            "ignoreText": "Rifiutate di passare in mezzo alle pozze di Fuoco Nero e fate un lungo giro esterno lungo i bordi ghiacciati della conca.",
            "successText": "Coprendovi bocca e naso con panni umidi, attraversate le lingue di roccia e raccogliete persino un'ampolla sigillata di bitume ardente lasciata lungo il percorso.",
            "failText": "Scivolate sul bordo untuoso di una pozza; schizzi di Fuoco Nero si attaccano ai vostri stivali e ai mantelli, e vi costringono a strapparvi di dosso il tessuto in fiamme per non bruciare vivi.",
            "stat": "fth",
            "cd": 9,
            "reward": {
                "type": "item",
                "name": "Ampolla di bitume ardente",
                "desc": "Chi ha attraversato le pozze ottiene una Fiala di Olio Bollente",
                "effects": [
                    { "effect": "hero_item", "item": "olio_bollente", "val": 1 }
                ]
            },
            "punishment": "anima_bruciata"
        },
        "bufera_bianca_sulla_piana": {
            "title": "La Bufera Bianca sulla Piana",
            "desc": "In mezzo alla pianura priva di ripari, si innalza improvvisamente un vento furioso che solleva la neve caduta creando un muro bianco totale dinanzi al vostro sguardo: cielo e terra si fondono e le tracce di Kesia rischiano di scomparire in pochi minuti.",
            "ignoreText": "Vi fermate immediatamente, piantando gli scudi nella neve e stringendovi sotto i mantelli finché la raffica non cala, perdendo tempo ma evitando di smarrirvi.",
            "successText": "Vi legate in cordata e usate la direzione costante del vento e i pali segnavia della Piana del Val per mantenere la rotta perfetta anche nella tormenta.",
            "failText": "Avanzate disorientati nella bufera, girando in tondo per oltre un'ora nel gelo pungente prima di ritrovare la strada maestra.",
            "stat": "int",
            "cd": 9,
            "reward": "polvere_boreale",
            "punishment": "morsa_assiderante"
        },
        "slitta_rovesciata": {
            "title": "La Slitta Rovesciata",
            "desc": "A bordo strada trovate una grande slitta da carico ribaltata nella neve alta; la muta di cani da slitta è ancora legata ai finimenti e ringhia spaventata, mentre il conducente è fuggito. Sotto il pianale rovesciato si trovano diverse casse intatte. Sembra, infatti, che il conducente sia fuggito a piedi dopo che Kesia, passandogli accanto come un turbine, ha spaventato la muta con uno schiocco di scintille per ostacolare la vostra marcia.",
            "ignoreText": "Lasciate stare la slitta e i cani innervositi, proseguendo la marcia verso Svalbard.",
            "successText": "Calmate i cani da slitta offrendo loro della carne secca, tagliate i finimenti ingarbugliati per liberarli e recuperate facilmente il carico rimasto sotto il mezzo.",
            "failText": "Vi avvicinate alle casse senza prima badare alla muta; i cani da slitta, per difendere il carico del padrone, vi azzannano alle braccia e ai polpacci costringendovi ad allontanarvi.",
            "stat": "fth",
            "cd": 9,
            "reward": {
                "type": "coins",
                "name": "Il carico della slitta",
                "desc": "+18 Scudi alla cassa della compagnia",
                "effects": [
                    { "effect": "coins", "val": 18 }
                ]
            },
            "punishment": {
                "type": "injury",
                "name": "I morsi dei cani da slitta",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        }
    },
    "merchants": {
        "default": "Un mercante di passaggio vi mostra la sua merce.",
        "carovana_degli_yak": "Incontrate una piccola carovana guidata da commercianti vitghen che conducono una fila di robusti Yak del Nord carichi di merci. Hanno visto una donna dai colori sgargianti correre verso la Roccia di Zamak e, prima di ripartire, accettano di vendervi carne secca, pellicce pesanti e pregiati bendaggi intessuti con il pelo degli Yak.",
        "maniscalco_della_tenuta": "Presso una fattoria fortificata al di fuori dalle mura di Ravndal, incontrate un maniscalco che rifornisce le pattuglie locali. Non fa domande sulla vostra provenienza, avendo voi indosso i vestiti Dignitas, ed è pronto a vendervi armi, armature, provviste calde e unguenti per le contusioni. L'artigiano vi indica la strada verso il Colle Sovrano, borbottando di una ragazza dai capelli e dagli abiti sgargianti passata poco prima cantando a squarciagola una ballata su Fredlös.",
        "cerusico_delle_sorgenti": "In una capanna di pietra costruita a distanza di sicurezza dai fumi più tossici, trovate un vecchio cerusico e alchimista che raccoglie i sali termali e i fanghi curativi di Fuocogelo. In cambio di monete, vi offre balsami contro le ustioni e il gelo, elisir rinvigorenti e provviste."
    },
    "rests": {
        "default": "Trovate un riparo dal vento gelido e accendete un piccolo fuoco per riposare.",
        "capanno_della_transumanza": "Trovate un basso capanno in pietra con un tetto di paglia utilizzato dai pastori che fanno la transumanza durante i mesi più miti. All'interno c'è ancora della legna secca: potete finalmente accendere un fuoco, asciugare gli abiti dopo il bagno forzato nell'Hemsil e fasciarvi le ferite. Sulla porta di legno del capanno, Kesia ha inciso col carbone un sorriso beffardo e una freccia che punta verso est: vi sta concedendo il tempo di asciugarvi solo perché si diverte a farsi inseguire.",
        "fienile_abbandonato": "Trovate un vecchio fienile in legno situato al margine di un boschetto di betulle, lontano dalle pattuglie principali di Ravndal. Riparati dal vento tra i covoni di fieno, potete concedervi qualche ora di sonno ristoratore. Prima di chiudere gli occhi, sentite in lontananza, portata dal vento della brughiera, l'eco inconfondibile della risata cristallina di Kesia provenire dalle pendici del Colle Sovrano.",
        "caverna_riscaldata": "Individuate una grotta naturale nelle Sorgenti Fuocogelo, la cui roccia è tiepida grazie alle vene sotterranee delle vicine sorgenti. Al riparo dal vento glaciale del Semprebrina, potete riposare in un tepore quasi innaturale per queste latitudini. Sulle pareti tiepide della grotta l'umidità si è condensata disegnando figure danzanti: l'energia di Kesia impregna ancora l'aria, segno che si è fermata qui solo un istante prima di salire verso le pozze.",
        "stazione_di_posta_del_val": "A un miglio dalle mura di Svalbard vi fermate in una grande locanda di posta frequentata dai carovanieri del Nord. Davanti al grande camino centrale potete consumare una zuppa bollente, curare le ferite e preparare le armi prima di presentarvi alle porte della città. Dalle voci dei carovanieri apprendete che Kesia è già entrata a Svalbard da meno di un'ora, dirigendosi dritta verso la guarnigione cittadina.",
        "campo_trincerato_dei_mercanti": "Vi unite al bivacco notturno di una grossa carovana mercantile accampata in cerchio fuori Svalbard. Dietro il riparo dei carri e accanto ai falò accesi, recuperate le forze in vista dello scontro imminente. Dalle voci dei carovanieri apprendete che Kesia è già entrata a Svalbard da meno di un'ora, dirigendosi dritta verso la guarnigione cittadina."
    },
    "treasures": {},
    "stories": {
        "trama_colle_sovrano": { "title": "Il Colle Sovrano", "text": "" }
    },
    "lootItems": null,
    "mapNodes": [
        {
            "id": 0,
            "level": 0,
            "x": 330,
            "type": "combat",
            "title": "Livello 1 - Gli Sciacalli dell'Argine",
            "icon": "🗡️",
            "done": false,
            "active": true,
            "next": [2, 3],
            "image": "immagini/fredlos_parte_2/1a_sciacalli_dell_argine.webp",
            "enemy": "sciacalli_dell_argine"
        },
        {
            "id": 1,
            "level": 0,
            "x": 550,
            "type": "challenge",
            "title": "Livello 1 - Le Sacche Impigliate nella Secca",
            "icon": "❓",
            "done": false,
            "active": true,
            "next": [3, 4],
            "image": "immagini/fredlos_parte_2/1b_sacche_impigliate_nella_secca.webp",
            "challengeId": "sacche_impigliate_nella_secca"
        },
        {
            "id": 2,
            "level": 1,
            "x": 220,
            "type": "challenge",
            "title": "Livello 2 - La Torbiera Ghiacciata",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [5],
            "image": "immagini/fredlos_parte_2/2a_torbiera_ghiacciata.webp",
            "challengeId": "torbiera_ghiacciata"
        },
        {
            "id": 3,
            "level": 1,
            "x": 440,
            "type": "rest",
            "title": "Livello 2 - Il Capanno della Transumanza",
            "icon": "⛺",
            "done": false,
            "active": false,
            "next": [5, 6],
            "image": "immagini/fredlos_parte_2/2b_capanno_della_transumanza.webp",
            "restId": "capanno_della_transumanza"
        },
        { "id": 4, "level": 1, "x": 660, "type": "combat", "title": "Livello 2 - I Mastini delle Gregge", "icon": "🗡️", "done": false, "active": false, "next": [6], "image": "immagini/fredlos_parte_2/2c_mastini_delle_gregge.webp", "enemy": "mastini_delle_gregge" },
        {
            "id": 5,
            "level": 2,
            "x": 330,
            "type": "combat",
            "title": "Livello 3 - I Bracconieri del Lander",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [7, 8],
            "image": "immagini/fredlos_parte_2/3a_bracconieri_del_lander.webp",
            "enemy": "bracconieri_del_lander"
        },
        {
            "id": 6,
            "level": 2,
            "x": 550,
            "type": "merchant",
            "title": "Livello 3 - La Carovana degli Yak",
            "icon": "🪙",
            "done": false,
            "active": false,
            "next": [8, 9],
            "image": "immagini/fredlos_parte_2/3b_carovana_degli_yak.webp",
            "merchantId": "carovana_degli_yak"
        },
        { "id": 7, "level": 3, "x": 220, "type": "elite", "title": "Livello 4 - Il Senza Clan", "icon": "👹", "done": false, "active": false, "next": [10], "image": "immagini/fredlos_parte_2/4a_il_senza_clan.webp", "enemy": "il_senza_clan" },
        {
            "id": 8,
            "level": 3,
            "x": 440,
            "type": "challenge",
            "title": "Livello 4 - La Vedetta sulla Roccia di Zamak",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [10, 11],
            "image": "immagini/fredlos_parte_2/4b_vedetta_roccia_di_zamak.webp",
            "challengeId": "vedetta_roccia_di_zamak"
        },
        { "id": 9, "level": 3, "x": 660, "type": "combat", "title": "Livello 4 - L'Orso delle Brughiere", "icon": "🗡️", "done": false, "active": false, "next": [11], "image": "immagini/fredlos_parte_2/4c_orso_delle_brughiere.webp", "enemy": "orso_delle_brughiere" },
        {
            "id": 10,
            "level": 4,
            "x": 330,
            "type": "combat",
            "title": "Livello 5 - Le Vedette a Cavallo di Ravndal",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [12, 13],
            "image": "immagini/fredlos_parte_2/5a_vedette_a_cavallo_di_ravndal.webp",
            "enemy": "vedette_a_cavallo_di_ravndal"
        },
        {
            "id": 11,
            "level": 4,
            "x": 550,
            "type": "challenge",
            "title": "Livello 5 - La Mandria Imbizzarrita",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [13, 14],
            "image": "immagini/fredlos_parte_2/5b_mandria_imbizzarrita.webp",
            "challengeId": "mandria_imbizzarrita"
        },
        {
            "id": 12,
            "level": 5,
            "x": 220,
            "type": "merchant",
            "title": "Livello 6 - Il Maniscalco della Tenuta",
            "icon": "🪙",
            "done": false,
            "active": false,
            "next": [15],
            "image": "immagini/fredlos_parte_2/6a_maniscalco_della_tenuta.webp",
            "merchantId": "maniscalco_della_tenuta"
        },
        { "id": 13, "level": 5, "x": 440, "type": "rest", "title": "Livello 6 - Il Fienile Abbandonato", "icon": "⛺", "done": false, "active": false, "next": [15, 16], "restId": "fienile_abbandonato" },
        {
            "id": 14,
            "level": 5,
            "x": 660,
            "type": "combat",
            "title": "Livello 6 - La Battuta di Caccia",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [16],
            "image": "immagini/fredlos_parte_2/6c_battuta_di_caccia.webp",
            "enemy": "battuta_di_caccia_di_ravndal"
        },
        {
            "id": 15,
            "level": 6,
            "x": 330,
            "type": "elite",
            "title": "Livello 7 - Il Guardiano dei Gradoni",
            "icon": "👹",
            "done": false,
            "active": false,
            "next": [17],
            "image": "immagini/fredlos_parte_2/7a_guardiano_dei_gradoni.webp",
            "enemy": "guardiano_dei_gradoni"
        },
        {
            "id": 16,
            "level": 6,
            "x": 550,
            "type": "challenge",
            "title": "Livello 7 - Il Sentiero dei Pellegrini",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [17],
            "image": "immagini/fredlos_parte_2/7b_sentiero_dei_pellegrini.webp",
            "challengeId": "sentiero_dei_pellegrini"
        },
        { "id": 17, "level": 7, "x": 440, "type": "story", "title": "Livello 8 - Il Colle Sovrano", "icon": "📜", "done": false, "active": false, "next": [18, 19, 20], "storyId": "trama_colle_sovrano" },
        { "id": 18, "level": 8, "x": 220, "type": "combat", "title": "Livello 9 - Gli Zeloti del Colle", "icon": "🗡️", "done": false, "active": false, "next": [21], "image": "immagini/fredlos_parte_2/9a_zeloti_del_colle.webp", "enemy": "zeloti_del_colle" },
        {
            "id": 19,
            "level": 8,
            "x": 440,
            "type": "challenge",
            "title": "Livello 9 - Il Costone di Ghiaia e Neve",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [21, 22],
            "image": "immagini/fredlos_parte_2/9b_costone_di_ghiaia_e_neve.webp",
            "challengeId": "costone_di_ghiaia_e_neve"
        },
        {
            "id": 20,
            "level": 8,
            "x": 660,
            "type": "combat",
            "title": "Livello 9 - Il Branco di Lupi del Semprebrina",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [22],
            "image": "immagini/fredlos_parte_2/9c_lupi_del_semprebrina.webp",
            "enemy": "lupi_del_semprebrina"
        },
        { "id": 21, "level": 9, "x": 330, "type": "rest", "title": "Livello 10 - La Caverna Riscaldata", "icon": "⛺", "done": false, "active": false, "next": [23, 24], "image": "immagini/fredlos_parte_2/10a_caverna_riscaldata.webp", "restId": "caverna_riscaldata" },
        { "id": 22, "level": 9, "x": 550, "type": "challenge", "title": "Livello 10 - Il Campo di Geyser", "icon": "❓", "done": false, "active": false, "next": [24, 25], "image": "immagini/fredlos_parte_2/10b_campo_di_geyser.webp", "challengeId": "campo_di_geyser" },
        {
            "id": 23,
            "level": 10,
            "x": 220,
            "type": "combat",
            "title": "Livello 11 - I Contrabbandieri del Fuoco Nero",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [26],
            "image": "immagini/fredlos_parte_2/11a_contrabbandieri_del_fuoco_nero.webp",
            "enemy": "contrabbandieri_del_fuoco_nero"
        },
        {
            "id": 24,
            "level": 10,
            "x": 440,
            "type": "challenge",
            "title": "Livello 11 - I Pontili sulle Pozze Ardenti",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [26, 27],
            "image": "immagini/fredlos_parte_2/11b_pontili_sulle_pozze_ardenti.webp",
            "challengeId": "pontili_sulle_pozze_ardenti"
        },
        {
            "id": 25,
            "level": 10,
            "x": 660,
            "type": "merchant",
            "title": "Livello 11 - Il Cerusico delle Sorgenti",
            "icon": "🪙",
            "done": false,
            "active": false,
            "next": [27],
            "image": "immagini/fredlos_parte_2/11c_cerusico_delle_sorgenti.webp",
            "merchantId": "cerusico_delle_sorgenti"
        },
        {
            "id": 26,
            "level": 11,
            "x": 330,
            "type": "elite",
            "title": "Livello 12 - Il Branco di Tremabosco",
            "icon": "👹",
            "done": false,
            "active": false,
            "next": [28, 29],
            "image": "immagini/scontro._il_territorio_del_burofonte.webp",
            "enemy": "branco_di_tremabosco"
        },
        {
            "id": 27,
            "level": 11,
            "x": 550,
            "type": "combat",
            "title": "Livello 12 - I Cacciatori di Taglie del Val",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [29, 30],
            "image": "immagini/fredlos_parte_2/12b_cacciatori_di_taglie_del_val.webp",
            "enemy": "cacciatori_di_taglie_del_val"
        },
        {
            "id": 28,
            "level": 12,
            "x": 220,
            "type": "challenge",
            "title": "Livello 13 - La Bufera Bianca sulla Piana",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [31],
            "image": "immagini/fredlos_parte_2/13a_bufera_bianca_sulla_piana.webp",
            "challengeId": "bufera_bianca_sulla_piana"
        },
        {
            "id": 29,
            "level": 12,
            "x": 440,
            "type": "combat",
            "title": "Livello 13 - I Predoni delle Piste",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [31, 32],
            "image": "immagini/fredlos_parte_2/13b_predoni_delle_piste.webp",
            "enemy": "predoni_delle_piste"
        },
        {
            "id": 30,
            "level": 12,
            "x": 660,
            "type": "challenge",
            "title": "Livello 13 - La Slitta Rovesciata",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [32],
            "image": "immagini/fredlos_parte_2/13c_slitta_rovesciata.webp",
            "challengeId": "slitta_rovesciata"
        },
        {
            "id": 31,
            "level": 13,
            "x": 330,
            "type": "rest",
            "title": "Livello 14 - La Stazione di Posta del Val",
            "icon": "⛺",
            "done": false,
            "active": false,
            "next": [33],
            "image": "immagini/fredlos_parte_2/14a_stazione_di_posta_del_val.webp",
            "restId": "stazione_di_posta_del_val"
        },
        {
            "id": 32,
            "level": 13,
            "x": 550,
            "type": "rest",
            "title": "Livello 14 - Il Campo Trincerato dei Mercanti",
            "icon": "⛺",
            "done": false,
            "active": false,
            "next": [33],
            "image": "immagini/fredlos_parte_2/14b_campo_trincerato_dei_mercanti.webp",
            "restId": "campo_trincerato_dei_mercanti"
        },
        { "id": 33, "level": 14, "x": 440, "type": "combat", "title": "Livello 15 - Il Presidio di Svalbard", "icon": "👑", "done": false, "active": false, "next": [], "image": "immagini/fredlos_parte_2/15a_presidio_di_svalbard.webp", "enemy": "presidio_di_svalbard" }
    ]
};
