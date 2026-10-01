// Campagna "Viaggio di Astarte, capitolo uno".
// Il contenuto dopo "=" è JSON puro: niente funzioni, gli effetti sono descritti nei campi "effects"
// e interpretati da applyEffects() in js/game.js. È un file .js (e non .json) perché il gioco
// si apre con doppio click da file:// e il browser blocca fetch() di file locali.
// Nemici, oggetti, reliquie e maledizioni sono richiamati per id da data/libreria/.
window.CAMPAIGNS = window.CAMPAIGNS || {};
window.CAMPAIGNS["astarte_ch1"] = {
    "id": "astarte_ch1",
    "title": "Viaggio di Astarte, capitolo uno",
    "badge": "Nuova Campagna",
    "description": "Inizia il pellegrinaggio di Astarte attraverso terre sconosciute e rovine dimenticate.",
    "coverImage": "immagini/astarte_capitolo_uno.jpg",
    "introText": "Astarte si stringe nel mantello mentre il vento freddo delle alture spazza la pietraia. Davanti a voi si snoda una pista dimenticata, segnata dal sangue di vecchi conflitti e dal respiro pesante di creature che reclamano queste lande. La spedizione comincia.",
    "heroes": [
        { "name": "Icaro", "str": 3, "int": 3, "fth": 1, "maxHp": 4, "hp": 4, "dmg": 1, "base_armor": 0, "current_armor": 0, "att_penalty": 0, "def_bonus": 0, "help_bonus_val": 0, "items": [] },
        { "name": "Astarte", "str": 2, "int": 3, "fth": 2, "maxHp": 4, "hp": 4, "dmg": 1, "base_armor": 0, "current_armor": 0, "att_penalty": 0, "def_bonus": 0, "help_bonus_val": 0, "items": [] },
        { "name": "Ascadeo", "str": 3, "int": 1, "fth": 3, "maxHp": 4, "hp": 4, "dmg": 1, "base_armor": 0, "current_armor": 0, "att_penalty": 0, "def_bonus": 0, "help_bonus_val": 0, "items": [] },
        { "name": "Zeno", "str": 3, "int": 2, "fth": 2, "maxHp": 4, "hp": 4, "dmg": 1, "base_armor": 0, "current_armor": 0, "att_penalty": 0, "def_bonus": 0, "help_bonus_val": 0, "items": [] },
        { "name": "Dioforo", "str": 2, "int": 4, "fth": 1, "maxHp": 4, "hp": 4, "dmg": 1, "base_armor": 0, "current_armor": 0, "att_penalty": 0, "def_bonus": 0, "help_bonus_val": 0, "items": [] }
    ],
    "abilities": {
        "Icaro": [
            {
                "id": "icaro_oro",
                "name": "Fammi dare un’occhiata",
                "desc": "Passiva: dopo ogni scontro la compagnia ottiene 3 monete in più garantite",
                "isCombatActive": false,
                "effects": [
                    { "effect": "hero_set", "stat": "bonusLootCoins", "val": 3 }
                ]
            },
            { "id": "icaro_trucchi", "name": "Trucchi del mestiere", "desc": "Attiva (1 volta per scontro): tira due dadi per attaccare e tiene il più alto", "isCombatActive": true, "actionName": "Trucchi del mestiere (2 dadi attacco)" }
        ],
        "Astarte": [
            {
                "id": "astarte_veleni",
                "name": "Veleni ed altri composti",
                "desc": "Passiva: cosparge le lame con composti alchemici (+1 al Danno permanente)",
                "isCombatActive": false,
                "effects": [
                    { "effect": "hero_stat", "stat": "dmg", "val": 1 }
                ]
            },
            { "id": "astarte_affondo", "name": "Affondo mortale", "desc": "Attiva (1 volta per scontro): attacco speciale che infligge danno raddoppiato", "isCombatActive": true, "actionName": "Affondo mortale (Doppio Danno)" }
        ],
        "Ascadeo": [
            {
                "id": "ascadeo_ghiaccio",
                "name": "Abitante del GhiaccioEterno",
                "desc": "Passiva: ottiene 1 punto di armatura naturale permanente",
                "isCombatActive": false,
                "effects": [
                    { "effect": "hero_stat", "stat": "base_armor", "val": 1 },
                    { "effect": "hero_stat", "stat": "current_armor", "val": 1 }
                ]
            },
            { "id": "ascadeo_segnato", "name": "Segnato da Hvid", "desc": "Attiva (1 volta per scontro): colpo speciale che stordisce l'avversario per il suo turno", "isCombatActive": true, "actionName": "Segnato da Hvid (Stordisce Nemico)" }
        ],
        "Zeno": [
            { "id": "zeno_colpo_benedetto", "name": "Colpo benedetto", "desc": "Attiva (1 volta per scontro): aggiunge il valore di Fede al Danno inflitto", "isCombatActive": true, "actionName": "Colpo benedetto (+Fede al Danno)" },
            {
                "id": "zeno_addestramento",
                "name": "Addestramento marziale",
                "desc": "Passiva: ottiene permanentemente +1 a Forza",
                "isCombatActive": false,
                "effects": [
                    { "effect": "hero_stat", "stat": "str", "val": 1 }
                ]
            }
        ],
        "Dioforo": [
            {
                "id": "dioforo_era_solo_una_prova",
                "name": "Era solo una prova!",
                "desc": "Passiva: quando affronta una prova di Intelligenza o Fede tira 2 dadi e tiene il migliore",
                "isCombatActive": false,
                "effects": [
                    { "effect": "hero_set", "stat": "hasAdvantageOnIntFth", "val": true }
                ]
            },
            {
                "id": "dioforo_penna",
                "name": "La penna ferisce più della spada",
                "desc": "Attiva (1 volta per scontro): aggiunge il valore di Intelligenza al tiro per colpire",
                "isCombatActive": true,
                "actionName": "La penna ferisce più della spada (+Intelligenza ad Attacco)"
            }
        ]
    },
    "initialArmory": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "balsamo_curativo"],
    "challenges": {
        "carro_rovesciato": {
            "title": "Il carro rovesciato",
            "desc": "Il silenzio del sentiero montano è rotto solo dal cigolio sinistro di un raggio spezzato. Un pesante carro mercantile giace coricato su un fianco, il carico giace in bilico precario tra terreno ed il peso stesso del carro. Le corde che tenevano serrate le cassepanche si sono sfilacciate e il minimo sbilanciamento del peso rischia di seppellire ciò che rimane di valore sotto l'enorme peso del mezzo. Tra le assi crepate, infatti, scorgi le venature metalliche di una cassa rinforzata con serratura a combinazione, tipica delle gilde mercantili del Sud.",
            "ignoreText": "Non avete tempo da perdere per frugare tra i rottami altrui. Stringete le cinghie degli zaini e proseguite lungo il passo montano.",
            "successText": "Analizzando il centro di gravità del relitto, puntellate l'asse maestro con due robusti rami d'acero e disinnescate con calma il meccanismo a scatto della serratura della cassa in metallo. All'interno trovate qualche moneta d’oro ma vi sorge una domanda: perché fuggire abbandonando tutto?",
            "failText": "Toccate il montante sbagliato: il legno cede con uno schianto secco, il carro seppellisce la cassa e i detriti vi piombano addosso, scuotendo la squadra. La cassa ed il suo contenuto sono persi per sempre.",
            "stat": "int",
            "cd": 7,
            "reward": {
                "type": "coins",
                "name": "15 Monete d'Oro",
                "desc": "+15 monete alla cassa della compagnia",
                "effects": [
                    { "effect": "coins", "val": 15 }
                ]
            },
            "punishment": null
        },
        "pietra_miliare": {
            "title": "La pietra miliare",
            "desc": "Accanto a un bivio soffocato da rovi e ortiche sorge un cippo di calcare grigio, eroso da decenni di piogge torrenziali e coperto da una crosta di licheni giallastri. Si tratta di un'antica pietra di confine, incisa con misurazioni topografiche, rilievi vallivi e distanze in leghe risalenti a prima della frammentazione dei ducati. Molti nomi sono stati scalpellati via dal tempo, ma chi possiede memoria storica e metodo geometrico può ancora raccordare quei riferimenti alle cime innevate all'orizzonte.",
            "ignoreText": "Non ha senso perdere le ultime ore di luce a grattare muschio da sassi secolari. La strada principale è fangosa, ma almeno sapete dove poggiare i piedi.",
            "successText": "Raschiando con cura i depositi calcarei e calcolando la declinazione delle vette circostanti, identificate un vecchio tracciato lastricato che vi conduce ad un tesoro nascosto.",
            "failText": "Fraintendete un'abbreviazione cartografica e scambiate una conca franosa per una scorciatoia carrozzabile. Il gruppo marcia a vuoto per ore in mezzo a pozzanghere gelide e pietraie instabili.",
            "stat": "int",
            "cd": 7,
            "reward": "corno_antico",
            "punishment": "gelo_nelle_ossa"
        },
        "mercante_bloccato": {
            "title": "Il mercante bloccato",
            "desc": "Una serie di urla furiose e lo schiocco sordo di un frustino risuonano oltre una curva cieca. Un mercante tarchiato, con le vesti lorde di melma, sta tentando inutilmente di incitare due cavalli esausti: la ruota posteriore del suo massiccio carro coperto è sprofondata in una buca d'argilla fino al mozzo, incastrandosi contro un ceppo sommerso. L'uomo è nel panico, convinto che le grida attireranno i predoni delle colline, e rischia solo di spezzare le zampe alle bestie continuando a frustarle.",
            "ignoreText": "Non sono affari vostri e non avete alcuna intenzione di rischiare uno scontro con eventuali banditi attirati da quel baccano. Superate l'impantanamento tenendovi al limitare della macchia.",
            "successText": "Calmate il carrettiere con fermezza, fate allentare i finimenti e utilizzate due tronchi come leve fulcrate sulle pietre del ciglio stradale. Con una distribuzione ottimale della forza, il carro risale dal fango in pochi istanti senza un graffio. Grato per l'aiuto, l'uomo vi cede un cimelio prezioso.",
            "failText": "Posizionate la leva nel punto di massima tensione dell'asse di frassino: la struttura schiocca e si spezza a metà, lasciando il carro irrimediabilmente inservibile. Il mercante vi copre di insulti e maledizioni velenose.",
            "stat": "int",
            "cd": 8,
            "reward": "lasciapassare_mercantile",
            "punishment": "rancore_del_mercante"
        },
        "ponte_marcio": {
            "title": "Il ponte marcio",
            "desc": "La mulattiera si arresta di colpo sul ciglio di una gola impressionante, in fondo alla quale infuriano le rapide spumose di un fiume montano. L'unico collegamento con la sponda opposta è una passerella di corda e assi di conifera, palesemente abbandonata da anni. Il legno è annerito dall'umidità, molte traversine mancano del tutto e i canapi portanti appaiono sfilacciati dal vento implacabile che risale dal fondovalle. Attraversare alla cieca significa precipitare nel vuoto.",
            "ignoreText": "Il buon senso prevale sulla fretta. Voltate le spalle al precipizio e vi preparate a risalire la gola per ore alla ricerca di un guado sicuro a monte.",
            "successText": "Esaminate attentamente la tensione dei cavi e la consistenza delle fibre legnose, individuando con esattezza le sole assi ancora ancorate ai travetti di sostegno. Guidate i compagni passo dopo passo, facendoli procedere a intervalli regolari senza generare oscillazioni pericolose. Alla fine del ponte trovate una pietra incisa di rune antiche.",
            "failText": "Una trave all'apparenza solida si polverizza sotto il peso di uno scarpone. Nel disperato tentativo di non cadere vi aggrappate alle corde sfilacciate, ma lo strattone disorienta la squadra.",
            "stat": "int",
            "cd": 8,
            "reward": "pietra_del_focolare",
            "punishment": {
                "type": "injury",
                "name": "Marcia estenuante",
                "desc": "Tutti i membri del party subiscono 1 danno immediato agli HP",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "strada_scompare": {
            "title": "La strada scompare",
            "desc": "Il sentiero battuto entra in una vasta pianura di pietrisco e detriti alluvionali per poi svanire completamente, cancellato da una frana recente. Davanti a voi si estende una distesa informe avvolta da un banco di nebbia lattiginosa che toglie ogni punto di riferimento; l'aria fredda fa eco a rumori ingannevoli di ciottoli che rotolano, e ovunque si aprono inghiottitoi e sabbie mobili argillose pronti a inghiottire chiunque metta un piede fuori posto.",
            "ignoreText": "Senza una rotta chiara è follia avventurarsi nel grigiore. Decidete di accamparvi alla cieca sperando che il sole del pomeriggio dissipi la foschia.",
            "successText": "Con metodo e sangue freddo, analizzate la granulometria dei detriti, l'orientamento delle striature sulle rocce levigate dall'antico passaggio dell'acqua e la direzione delle correnti d'aria fredda, ricostruendo fedelmente la direttrice originale fino a sbucare dall'altra parte della gola.",
            "failText": "Seguite un falso avvallamento che vi conduce dritti dentro un pantano ingannevole. Camminate in cerchio per ore nel gelo della nebbia, sprofondando nel fango fino alle ginocchia prima di ritrovare la riva.",
            "stat": "int",
            "cd": 9,
            "reward": "frammento_di_matrice",
            "punishment": {
                "type": "injury",
                "name": "Marcia estenuante",
                "desc": "Tutti i membri del party subiscono 1 danno immediato agli HP",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "pedaggio": {
            "title": "Il pedaggio",
            "desc": "Una solida palizzata di tronchi appuntiti sbarra la gola nel suo punto più stretto. Da una torretta improvvisata scendono quattro individui corazzati con piastre arrugginite. In un attimo venite circondati da almeno altri 10 uomini che impugnano balestre cariche. I quattro uomini di fronte a voi esibiscono pergamene con sigilli di ceralacca consunti. Con tono perentorio e mani sulle impugnature, dichiarano di riscuotere il 'Tributo di Pace della Frontiera' per ogni viaggiatore armato, chiedendo un pedaggio in oro.",
            "ignoreText": "Non intendete fare accordi con briganti travestiti da guardie né rischiare frecce nella schiena; fate dietrofront cercando un valico montano impervio.",
            "successText": "Con sguardo glaciale analizzate la pergamena, notando che lo stemma feudale impresso nella cera appartiene a una casata palesemente inventata e che i formulari giuridici sono pieni di errori grossolani. Esponete la truffa con tale precisione normativa e sicurezza che i malviventi, intimoriti dalle vostre conoscenze, abbassano la sbarra ed in cambio del vostro silenzio vi offrono un antico amuleto.",
            "failText": "Vi impappinate nel contestare le ordinanze e mostrate insicurezza: i falsi gabellieri mangiano la foglia, diventano aggressivi e vi intimoriscono con le balestre spianate, pretendendo il doppio della somma come sanzione per oltraggio.",
            "stat": "int",
            "cd": 9,
            "reward": "dente_del_grande_lupo",
            "punishment": {
                "type": "penalty",
                "name": "Pedaggio forzato",
                "desc": "Perdete immediatamente 12 monete d'oro dal fondo comune",
                "effects": [
                    { "effect": "coins", "val": -12 }
                ]
            }
        },
        "guerriero_morto_neve": {
            "title": "Il guerriero morto nella neve",
            "desc": "Ai piedi di un abete monumentale, quasi del tutto sepolto da un cumulo di neve fresca e aghi di pino, siede il cadavere intatto di un cavaliere errante. La cotta di maglia è intessuta di brina e le labbra sono serrate in una smorfia serena. Tra i guanti d'arme congelati stringe al petto un reliquiario d'argento cesellato, mentre la sua spada giace piantata a terra come una croce solitaria. L'aria attorno a lui è straordinariamente immobile, priva persino del fischio del vento.",
            "ignoreText": "La terra è dura come il ferro e scavare una fossa con questo gelo spezzerebbe solo le vostre lame. Lasciate che la neve continui il suo lavoro e passate oltre.",
            "successText": "Vi inginocchiate nel fango gelato e intonate l'inno di accompagnamento per le anime dei combattenti solitari mentre preparate una pira funeraria. Quando terminate la litania, una tenue luce illumina il reliquiario e una calda pace interiore scaccia i brividi del freddo.",
            "failText": "Tentate di sfilare il reliquiario con impazienza prima ancora di aver reso omaggio al caduto. Le dita rigide del cavaliere sembrano serrare la presa, un soffio di gelo spettrale investe l'intero gruppo e la statuetta sacra si scheggia sul selciato.",
            "stat": "fth",
            "cd": 7,
            "reward": "frammento_di_yr_drazul",
            "punishment": "sacrilego"
        },
        "pellegrino": {
            "title": "Il pellegrino",
            "desc": "Seduto sopra una pietra liscia al bordo del sentiero c'è un vecchio pellegrino in abiti di lana grezza consumata. Le sue caviglie sono tumefatte dal cammino e la pelle del volto è arsa dalle intemperie, ma i suoi occhi trasmettono una calma solenne e profonda. Regge una ciotola di legno incisa con simboli liturgici e, scorgendovi, alza lo sguardo mormorando debolmente una richiesta di comunione spirituale prima che le sue forze lo abbandonino del tutto.",
            "ignoreText": "Non avete provviste né parole da sprecare per chi si è incamminato a morire su queste strade desolate. Tirate dritto distogliendo lo sguardo.",
            "successText": "Vi fermate, condividete con lui un sorso d'acqua pura e recitate insieme i versetti sacri, unendo i vostri respiri nella litania. Prima di congedarsi, il vecchio vi traccia una croce di cenere benedetta sulla fronte, infondendo protezione a tutta la compagnia.",
            "failText": "La vostra preghiera è frettolosa, meccanica e distratta dalla fretta di ripartire. Il pellegrino percepisce l'ipocrisia del gesto, scuote mestamente la testa e rovescia la ciotola nel fango: un senso di pesantezza grava sullo spirito di tutti.",
            "stat": "fth",
            "cd": 7,
            "reward": "favore_di_valgoren",
            "punishment": "fede_inaridita"
        },
        "cavallo_senza_cavaliere": {
            "title": "Il cavallo senza cavaliere",
            "desc": "Una maestosa giumenta da guerra nera come la pece, con la sella sfondata e la testiera strappata, galoppa nervosamente in una radura circondata da tronchi bruciati. La bestia ha le narici dilatate, schiuma bianca alla bocca e gli occhi iniettati di terrore: fissa l'oscurità della macchia ringhiando quasi come un cane da caccia e calpesta furente il terreno. Qualcosa di empio o demoniaco ha massacrato il suo cavaliere poco lontano e il terrore la rende pronta a sventrare chiunque provi ad avvicinarsi.",
            "ignoreText": "Gli zoccoli ferrati di quel destriero potrebbero sfondare una corazza d'acciaio. Vi muovete rasentando gli alberi dal lato opposto, lasciando che la fiera si sfoghi da sola.",
            "successText": "Avanzate a mani nude, senza toccare le armi, modulando la voce sui toni calmi e profondi degli antichi canti di pacificazione dei boschi. Con fede incrollabile poggiate il palmo sulla fronte sudata dell'animale: il terrore svanisce all'istante, la giumenta china il capo e vi consente di recuperare le sacche da sella intatte del suo precedente padrone.",
            "failText": "Il vostro canto tradisce un tremito di paura collettiva. La bestia percepisce l'esitazione come una minaccia, nitrisce furibonda e carica il gruppo, travolgendoli e ferendo i compagni prima di fuggire nella boscaglia.",
            "stat": "fth",
            "cd": 8,
            "reward": "idolo_del_cacciatore",
            "punishment": {
                "type": "injury",
                "name": "Carica violenta",
                "desc": "Tutti i membri del party subiscono 1 danno immediato agli HP",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "cappella_viandante": {
            "title": "La cappella del viandante",
            "desc": "Una minuscola edicola votiva in blocchi di tufo si affaccia sul sentiero, parzialmente sventrata dal passaggio recente di sciacalli. L'icona in legno della divinità tutelare è stata strappata dalla nicchia e gettata nel fango, l'acquasantiera è colma di foglie marce e le offerte di grano e cera sono state calpestate con disprezzo sacrilego. L'atmosfera all'interno della volta è opprimente, intrisa del fetore rancido della profanazione.",
            "ignoreText": "Non è compito vostro riconsacrare gli altari abbattuti in tempo di guerra. Vi segnate rapidamente e accelerate il passo per non attardare la marcia.",
            "successText": "Ripulite con devozione la nicchia, rimettete al suo posto l'icona ripulita dal fango e accendete un piccolo cero recitando la formula di riparazione sacra. L'aria si fa d'improvviso tersa, profumata di mirra e resina, e una calda benedizione ristora le membra stanche del gruppo.",
            "failText": "Nel rimettere mano all'altare pronunciate le formule sacre in modo confuso e disordinato. Una folata di vento putrido spegne la fiamma e frantuma l'icona in legno: la profanazione del luogo ricade negativamente sull'intera carovana.",
            "stat": "fth",
            "cd": 9,
            "reward": "occhio_del_corvo",
            "punishment": "presagio_di_morte"
        },
        "sentiero_rune": {
            "title": "Il sentiero delle rune",
            "desc": "Per una cinquantina di passi la mulattiera si trasforma in un basolato cerimoniale arcaico: lastre di basalto nero su cui sono incise profonde rune d'interdizione consacrate a spiriti antichi. Chiunque calpesti quelle pietre con animo empio o pensieri d'orgoglio viene sopraffatto da un senso vertiginoso di nausea, ronzii metallici nelle orecchie e un terrore cieco che spinge alla fuga disordinata.",
            "ignoreText": "Aggirate il tratto lastricato facendovi largo a colpi di lama tra un intrico spinoso e ripido, spendendo tempo prezioso pur di evitare il selciato.",
            "successText": "Recitate ad alta voce le antiche parole di sottomissione e riverenza alle forze del caos primordiale, muovendovi a piedi nudi e a capo chino lungo la linea mediana delle rune. Il basalto sotto di voi emana un piacevole tepore benefico e le incisioni brillano di una flebile luce azzurrina che infonde vigore alle vostre menti.",
            "failText": "La concentrazione del gruppo si spezza sotto il peso del dubbio; un senso improvviso di claustrofobia e terrore viscerale assale la carovana, lasciandovi storditi e con la mente offuscata.",
            "stat": "fth",
            "cd": 9,
            "reward": "anello_del_giuramento",
            "punishment": "tormento_mentale"
        },
        "forca_crocevia": {
            "title": "La forca al crocevia",
            "desc": "Dove quattro sentieri si incrociano in mezzo a una brughiera brulla, sorge un'alta forca di quercia annerita dal fuoco. Tre corpi senza nome pendono dalle corde oscillando pesantemente al vento gelido: sono stati lasciati lì come macabro monito militare e le loro bocche spalancate sembrano ancora urlare in silenzio. Attorno all'albero l'erba è morta e un ronzio inquietante di sussurri spettrali turba i sensi di chiunque si avvicini al crocevia.",
            "ignoreText": "Distogliete lo sguardo da quello scempio, vi tappate le orecchie per non ascoltare il cigolio delle corde e accelerate il passo oltre il quadrivio.",
            "successText": "Con passo solenne vi portate sotto i cappi, componete i corpi per quanto possibile e intonate l'antico esorcismo di liberazione dei morti insepolti, tracciando con la cenere un cerchio di requie. I sussurri si placano all'istante, le corde tacciono e una sensazione di protezione avvolge le vostre lame.",
            "failText": "L'orrore della scena paralizza la compagnia e la litania si trasforma in un balbettio collettivo. L'inquietudine degli impiccati si lega alla psiche del gruppo: una cappa di angoscia opprime tutti i membri.",
            "stat": "fth",
            "cd": 9,
            "reward": "marchio_di_jag_antar",
            "punishment": "ombra_sul_cuore"
        },
        "rifugio_abbandonato": {
            "title": "Il rifugio abbandonato",
            "desc": "Una capanna di cacciatori mezza divelta dal gelo sporge da un costone roccioso. La porta è scardinata, ma all'interno l'occhio esperto nota che le assi del pavimento nascondono un meccanismo di trappole a scatto rudimentali, montate con corde tese e falci da fieno per proteggere una botola interrata.",
            "ignoreText": "La capanna sembra troppo instabile e il rischio di far scattare una tagliola o far crollare il tetto non vale la pena; proseguite lungo la cresta.",
            "successText": "Esaminando con attenzione la tensione dei fili e i contrappesi di piombo, disarmate le trappole a forbice una dopo l'altra. Nella botola asciutta trovate provviste intatte e un antico manufatto intagliato.",
            "failText": "Tranciate la corda sbagliata: una sbarra uncinata scatta con violenza schiaffeggiando il gruppo ed emettendo un fragore metallico che disorienta la spedizione.",
            "stat": "int",
            "cd": 8,
            "reward": "sigillo_runico",
            "punishment": {
                "type": "injury",
                "name": "Marcia estenuante",
                "desc": "Tutti i membri del party subiscono 1 danno immediato agli HP",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "cippo_giuramento": {
            "title": "Il cippo del giuramento",
            "desc": "Al centro di una radura battuta dal vento sorge un mucchio di pietre consacrate attorno a una vecchia insegna militare spezzata. Su di essa sono ancora legati nastri votivi scoloriti, lasciati da guardie e viandanti prima di affrontare i passi montani per chiedere la clemenza del cielo.",
            "ignoreText": "I vecchi dei della strada non fermeranno il gelo né le lame; tirate dritto senza perdere tempo in devozioni.",
            "successText": "Riannodate i nastri votivi, recitate il giuramento del pellegrino e ponete un sasso in cima al tumulo in segno di rispetto. Un senso di incrollabile fermezza e sollievo spirituale si posa sulla compagnia.",
            "failText": "Durante la deposizione del sasso, un gesto distratto fa franare l'intero cumulo sul fango. Il silenzio che segue è cupo e accusatorio, lasciando la carovana priva di conforto.",
            "stat": "fth",
            "cd": 8,
            "reward": "lanterna_dei_morti",
            "punishment": "sacrilego"
        }
    },
    "merchants": {
        "default": "Al ciglio della strada scorgete un carretto coperto da teli cerati, trainato da un mulo paziente e stipato di bauli, gabbie e cianfrusaglie. Un mercante viandante, avvolto in un pastrano consumato da mille viaggi, vi accoglie con un sorriso d'intesa sollevando una mano. Gira queste terre desolate da anni barattando arnesi, erbe e ferri forgiati con chiunque abbia monete buone da spendere."
    },
    "rests": {
        "default": "Trovate un angolo di pace in mezzo alla natura selvaggia: la quiete della radura vi ricorda all'improvviso tutto il peso e la stanchezza che vi portate sulle spalle. Accendete un piccolo focolare protetto dal vento e vi fermate a riscaldare corpo e spirito, raccogliendo le forze prima di rimettervi in marcia lungo il sentiero."
    },
    "treasures": {},
    "lootItems": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "balsamo_curativo", "spada_norgrad", "alabarda_guardia", "mannaia_pesante", "scudo_ferro", "corazza_scaglie", "tomo_proibito", "reliquiario_tascabile", "pozione_rigenerazione", "unguento_fortificante", "lama_acciaio_lunare", "martello_breccia", "gorgiera_veterano", "corazza_piastre_leone", "cappa_sussurri", "simbolo_jag_antar", "elisir_sangue_vivo"],
    "mapNodes": [
        { "id": 0, "level": 0, "x": 300, "type": "combat", "enemy": "banditi_strada", "title": "Livello 1 - Scontro Ovest", "icon": "🗡️", "done": false, "active": true, "next": [2, 3], "image": "immagini/banditi_strada.jpg" },
        { "id": 1, "level": 0, "x": 500, "type": "combat", "enemy": "cani_caccia", "title": "Livello 1 - Scontro Est", "icon": "🗡️", "done": false, "active": true, "next": [3, 4], "image": "immagini/cani_caccia.jfif" },
        { "id": 2, "level": 1, "x": 250, "type": "challenge", "challengeId": "carro_rovesciato", "title": "Livello 2 - Sfida", "icon": "❓", "done": false, "active": false, "next": [5], "image": "immagini/sfida.jpg" },
        { "id": 3, "level": 1, "x": 400, "type": "combat", "enemy": "sciacalli_cadaveri", "title": "Livello 2 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [6, 7], "image": "immagini/sciacalli_cadaveri.jpg" },
        { "id": 4, "level": 1, "x": 550, "type": "merchant", "merchantId": "default", "title": "Livello 2 - Mercante", "icon": "🪙", "done": false, "active": false, "next": [7, 8], "image": "immagini/mercante_viaggiatore.jpg" },
        { "id": 5, "level": 2, "x": 200, "type": "combat", "enemy": "briganti_pedaggio", "title": "Livello 3 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [9], "image": "immagini/briganti_pedaggio.jpg" },
        { "id": 6, "level": 2, "x": 330, "type": "rest", "restId": "default", "title": "Livello 3 - Riposo", "icon": "⛺", "done": false, "active": false, "next": [10], "image": "immagini/riposo.jpg" },
        { "id": 7, "level": 2, "x": 470, "type": "challenge", "challengeId": "guerriero_morto_neve", "title": "Livello 3 - Sfida", "icon": "❓", "done": false, "active": false, "next": [10], "image": "immagini/guerriero_morto_neve.jpg" },
        { "id": 8, "level": 2, "x": 600, "type": "combat", "enemy": "cinghiali_pietraie", "title": "Livello 3 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [11], "image": "immagini/scontro_cinghiali.jpg" },
        { "id": 9, "level": 3, "x": 260, "type": "merchant", "merchantId": "default", "title": "Livello 4 - Mercante", "icon": "🪙", "done": false, "active": false, "next": [12, 13], "image": "immagini/mercante_viaggiatore.jpg" },
        { "id": 10, "level": 3, "x": 400, "type": "elite", "enemy": "capitano_predoni", "title": "Livello 4 - Capitano dei Predoni", "icon": "👹", "done": false, "active": false, "next": [13, 14], "image": "immagini/capitano_predoni.jpg" },
        { "id": 11, "level": 3, "x": 540, "type": "rest", "restId": "default", "title": "Livello 4 - Riposo", "icon": "⛺", "done": false, "active": false, "next": [13, 14], "image": "immagini/riposo.jpg" },
        { "id": 12, "level": 4, "x": 260, "type": "challenge", "challengeId": "pietra_miliare", "title": "Livello 5 - Sfida", "icon": "❓", "done": false, "active": false, "next": [15, 16], "image": "immagini/pietra_miliare.jpg" },
        { "id": 13, "level": 4, "x": 400, "type": "combat", "enemy": "branco_lupi", "title": "Livello 5 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [16, 17], "image": "immagini/branco_lupi.jpg" },
        { "id": 14, "level": 4, "x": 540, "type": "challenge", "challengeId": "pellegrino", "title": "Livello 5 - Sfida", "icon": "❓", "done": false, "active": false, "next": [17, 18], "image": "immagini/pellegrino.jpg" },
        { "id": 15, "level": 5, "x": 200, "type": "combat", "enemy": "disertori", "title": "Livello 6 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [19], "image": "immagini/disertori.jpg" },
        { "id": 16, "level": 5, "x": 330, "type": "merchant", "merchantId": "default", "title": "Livello 6 - Mercante", "icon": "🪙", "done": false, "active": false, "next": [19], "image": "immagini/mercante_viaggiatore.jpg" },
        { "id": 17, "level": 5, "x": 470, "type": "rest", "restId": "default", "title": "Livello 6 - Riposo", "icon": "⛺", "done": false, "active": false, "next": [20], "image": "immagini/riposo.jpg" },
        { "id": 18, "level": 5, "x": 600, "type": "combat", "enemy": "esploratori_predoni", "title": "Livello 6 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [20], "image": "immagini/esploratori_predoni.jpg" },
        { "id": 19, "level": 6, "x": 300, "type": "elite", "enemy": "tremabosco", "title": "Livello 7 - Tremabosco Striato", "icon": "👹", "done": false, "active": false, "next": [21, 22], "image": "immagini/tremabosco.jpg" },
        { "id": 20, "level": 6, "x": 500, "type": "elite", "enemy": "mastino_bokgar", "title": "Livello 7 - Mastino di Bokgar", "icon": "👹", "done": false, "active": false, "next": [22, 23], "image": "immagini/mastino_bogkar.jpg" },
        { "id": 21, "level": 7, "x": 260, "type": "rest", "restId": "default", "title": "Livello 8 - Riposo", "icon": "⛺", "done": false, "active": false, "next": [24], "image": "immagini/riposo.jpg" },
        { "id": 22, "level": 7, "x": 400, "type": "merchant", "merchantId": "default", "title": "Livello 8 - Mercante", "icon": "🪙", "done": false, "active": false, "next": [25, 26], "image": "immagini/mercante_viaggiatore.jpg" },
        { "id": 23, "level": 7, "x": 540, "type": "challenge", "challengeId": "cavallo_senza_cavaliere", "title": "Livello 8 - Sfida", "icon": "❓", "done": false, "active": false, "next": [27], "image": "immagini/cavallo_senza_cavaliere.jpg" },
        { "id": 24, "level": 8, "x": 200, "type": "challenge", "challengeId": "mercante_bloccato", "title": "Livello 9 - Sfida", "icon": "❓", "done": false, "active": false, "next": [28], "image": "immagini/mercante_bloccato.jpg" },
        { "id": 25, "level": 8, "x": 330, "type": "combat", "enemy": "predoni", "title": "Livello 9 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [28, 29], "image": "immagini/predoni.jpg" },
        { "id": 26, "level": 8, "x": 470, "type": "challenge", "challengeId": "cappella_viandante", "title": "Livello 9 - Sfida", "icon": "❓", "done": false, "active": false, "next": [29, 30], "image": "immagini/cappella_viandante.jpg" },
        { "id": 27, "level": 8, "x": 600, "type": "combat", "enemy": "orso_bruno", "title": "Livello 9 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [30], "image": "immagini/orso_bruno.jpg" },
        { "id": 28, "level": 9, "x": 260, "type": "combat", "enemy": "balestrieri_disertori", "title": "Livello 10 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [31], "image": "immagini/balestrieri_disertori.jpg" },
        { "id": 29, "level": 9, "x": 400, "type": "merchant", "merchantId": "default", "title": "Livello 10 - Mercante", "icon": "🪙", "done": false, "active": false, "next": [32], "image": "immagini/mercante_viaggiatore.jpg" },
        { "id": 30, "level": 9, "x": 540, "type": "challenge", "challengeId": "ponte_marcio", "title": "Livello 10 - Sfida", "icon": "❓", "done": false, "active": false, "next": [32, 33], "image": "immagini/ponte_marcio.jpg" },
        { "id": 31, "level": 10, "x": 260, "type": "challenge", "challengeId": "sentiero_rune", "title": "Livello 11 - Sfida", "icon": "❓", "done": false, "active": false, "next": [34, 35], "image": "immagini/sentiero_rune.jpg" },
        { "id": 32, "level": 10, "x": 400, "type": "combat", "enemy": "picchieri_sbandati", "title": "Livello 11 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [35, 36], "image": "immagini/picchieri_sbandati.jpg" },
        { "id": 33, "level": 10, "x": 540, "type": "challenge", "challengeId": "strada_scompare", "title": "Livello 11 - Sfida", "icon": "❓", "done": false, "active": false, "next": [36, 37], "image": "immagini/strada_scompare.jpg" },
        { "id": 34, "level": 11, "x": 200, "type": "merchant", "merchantId": "default", "title": "Livello 12 - Mercante", "icon": "🪙", "done": false, "active": false, "next": [38], "image": "immagini/mercante_viaggiatore.jpg" },
        { "id": 35, "level": 11, "x": 330, "type": "combat", "enemy": "fabbro_rinnegato", "title": "Livello 12 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [38, 39], "image": "immagini/fabbro_rinnegato.jpg" },
        { "id": 36, "level": 11, "x": 470, "type": "challenge", "challengeId": "forca_crocevia", "title": "Livello 12 - Sfida", "icon": "❓", "done": false, "active": false, "next": [39, 40], "image": "immagini/forca_crocevia.jpg" },
        { "id": 37, "level": 11, "x": 600, "type": "combat", "enemy": "cani_corsi", "title": "Livello 12 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [40], "image": "immagini/cani_corsi.jpg" },
        { "id": 38, "level": 12, "x": 260, "type": "elite", "enemy": "boia_rinnegati", "title": "Livello 13 - Boia dei Rinnegati", "icon": "👹", "done": false, "active": false, "next": [41], "image": "immagini/boia_rinnegati.jpg" },
        { "id": 39, "level": 12, "x": 400, "type": "challenge", "challengeId": "pedaggio", "title": "Livello 13 - Sfida", "icon": "❓", "done": false, "active": false, "next": [41, 42], "image": "immagini/pedaggio.jpg" },
        { "id": 40, "level": 12, "x": 540, "type": "rest", "restId": "default", "title": "Livello 13 - Riposo", "icon": "⛺", "done": false, "active": false, "next": [42], "image": "immagini/riposo.jpg" },
        { "id": 41, "level": 13, "x": 320, "type": "challenge", "challengeId": "rifugio_abbandonato", "title": "Livello 14 - Sfida", "icon": "❓", "done": false, "active": false, "next": [43, 44], "image": "immagini/rifugio_abbandonato.jpg" },
        { "id": 42, "level": 13, "x": 480, "type": "challenge", "challengeId": "cippo_giuramento", "title": "Livello 14 - Sfida", "icon": "❓", "done": false, "active": false, "next": [43, 44], "image": "immagini/cippo_giuramento.jpg" },
        { "id": 43, "level": 14, "x": 320, "type": "rest", "restId": "default", "title": "Livello 15 - Ultimo Bivacco Ovest", "icon": "⛺", "done": false, "active": false, "next": [45], "image": "immagini/riposo.jpg" },
        { "id": 44, "level": 14, "x": 480, "type": "rest", "restId": "default", "title": "Livello 15 - Ultimo Bivacco Est", "icon": "⛺", "done": false, "active": false, "next": [45], "image": "immagini/riposo.jpg" },
        { "id": 45, "level": 15, "x": 400, "type": "combat", "enemy": "hungrabarn", "title": "Livello 16 - Hungrabarn (Boss)", "icon": "👑", "done": false, "active": false, "next": [], "image": "immagini/hungrabarn.jpg" }
    ]
};
