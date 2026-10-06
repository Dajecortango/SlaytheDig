// Campagna "Caccia alla Bestia, Capitolo Uno".
// Il contenuto dopo "=" è JSON puro: niente funzioni, gli effetti sono descritti nei campi "effects"
// e interpretati da applyEffects() in js/game.js. È un file .js (e non .json) perché il gioco
// si apre con doppio click da file:// e il browser blocca fetch() di file locali.
// Nemici, oggetti, reliquie e maledizioni sono richiamati per id da data/libreria/.
window.CAMPAIGNS = window.CAMPAIGNS || {};
window.CAMPAIGNS["astarte_ch1"] = {
    "difficolta": { "vittoriaMin": 20, "vittoriaMax": 25 },
    "id": "astarte_ch1",
    "title": "Caccia alla Bestia, Capitolo Uno",
    "badge": "Nuova Campagna",
    "description": "Inizia il pellegrinaggio di Astarte attraverso terre sconosciute e rovine dimenticate.",
    "coverImage": "immagini/astarte_capitolo_uno.jpg",
    "introText": "Astarte si stringe nel mantello mentre il vento freddo delle alture spazza la pietraia. Davanti a voi si snoda una pista dimenticata, segnata dal sangue di vecchi conflitti e dal respiro pesante di creature che reclamano queste lande. La spedizione comincia.",
    "heroes": ["icaro", "astarte", "ascadeo", "dioforo"],
    "initialArmory": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "balsamo_curativo"],
    "challenges": {
        "carro_rovesciato": {
            "title": "Il carro rovesciato",
            "desc": "Lungo la Valle del Krogg, il gelido silenzio fra i campi e le coltivazioni è spezzato solo dallo scricchiolio del legno che cede. Un pesante carro mercantile giace coricato su un fianco, con il carico in bilico sul terreno ghiacciato, trattenuto a stento dalla ruota distrutta. Le corde delle casse si sono sfilacciate per la morsa del freddo: basta un niente perché la struttura rovini, seppellendo ciò che resta. Tra le assi crepate scorgi però le venature metalliche di una cassa rinforzata con serratura a combinazione, un dettaglio decisamente insolito per la Valle del Krogg, tipico dei Banchi di Pietà dei Lomor.",
            "ignoreText": "Decidete che non vale la pena rischiare o perdere tempo a frugare nella sventura altrui. Sistemate le cinghie degli zaini sulle spalle e riprendete con passo deciso la marcia lungo la Valle.",
            "successText": "Studiando la precaria stabilità del relitto, riuscite a puntellare l'asse maestro con due robusti rami d'acero. Con la struttura messa in sicurezza, disinnescate con mano ferma la trappola a scatto della cassa di metallo. All'interno trovate un piccolo gruzzolo di Scudi, ma un dubbio inquietante vi assale: cosa può aver terrorizzato i proprietari al punto da farli fuggire abbandonando i propri averi?",
            "failText": "Rimuovete il supporto sbagliato e l'equilibrio del relitto si spezza. Con uno schianto sordo, il carro crolla su se stesso, seppellendo per sempre la cassa sotto una montagna di legno e rottami. Una nube di polvere e schegge vi travolge, lasciandovi scossi e con qualche livido. La cassa ed il suo contenuto sono persi.",
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
            "desc": "Accanto a un bivio soffocato da rovi e ortiche si erge un massiccio ceppo di calcare grigio, eroso da innumerevoli piogge e incrostato di licheni giallastri. Si tratta di un'antica pietra di confine, fitta di misurazioni topografiche, rilievi e distanze. Queste incisioni risalgono ai tempi della prima colonizzazione di Collifreddi, scolpite nella roccia proprio quando i Vitghen, guidati da Miska, calarono per la prima volta da oltre la Dorsale Rocciaguzza. Sebbene il tempo e il gelo abbiano cancellato gran parte dei vecchi tracciati, chi possiede una salda memoria storica può ancora decifrare la pietra, raccordando i riferimenti superstiti ai Picchi del Tramonto che dominano l'orizzonte.",
            "ignoreText": "Decidete che non ha senso sprecare le ultime preziose ore di luce per grattare muschio e licheni da una pietra secolare. La strada principale sarà anche scomoda e molto in salita, ma almeno sapete esattamente dove mettere i piedi senza perdervi.",
            "successText": "Ripulendo con cura la pietra e calcolando la triangolazione con le vette circostanti, riuscite a decifrare il tracciato originale dei Vitghen. L'intuizione vi guida fuori sentiero, rivelando un vecchio lastricato inghiottito dalla vegetazione che vi conduce a un antico deposito lasciato al tempo della colonizzazione.",
            "failText": "L'erosione della pietra vi gioca un brutto scherzo: interpretate male un'antica incisione di Miska e scambiate una conca franosa per una scorciatoia sicura. Il gruppo finisce per marciare a vuoto per ore, sprecando energie preziose mentre arranca tra pozzanghere gelide e pietraie instabili.",
            "stat": "int",
            "cd": 8,
            "reward": "corno_antico",
            "punishment": "gelo_nelle_ossa"
        },
        "mercante_bloccato": {
            "title": "Il mercante bloccato",
            "desc": "Una serie di urla furiose e lo schiocco sordo di un frustino risuonano oltre una curva. Un mercante Lungobarbo, con le vesti lorde di fango, sta tentando inutilmente di spronare due cavalli ormai esausti. La ruota posteriore del suo massiccio carro è sprofondata in una morsa d'argilla fino al mozzo, incastrandosi irrimediabilmente contro una grossa radice sommersa. L'uomo è in preda al panico: teme che tutto quel baccano possa attirare i Banditi dei Picchi del Tramonto. Nel suo terrore, continuando a sferzare i finimenti, rischia soltanto di spezzare le zampe alle bestie.",
            "ignoreText": "Decidete che non sono affari vostri e non avete alcuna intenzione di affrontare banditi o disperati attirati da tutto quel baccano. Vi tenete a debita distanza lungo il limitare del sentiero, superando l'impantanamento senza farvi coinvolgere.",
            "successText": "Calmate il Lungobarbo con fermezza e fate allentare i finimenti ai cavalli per non sfinirli. Utilizzando due tronchi come leve contro le pietre del ciglio stradale, sollevate la ruota dalla morsa d'argilla e fate riemergere il carro senza un graffio. Grato per l'aiuto, il mercante vi consegna un documento molto utile per i vostri futuri scambi.",
            "failText": "Sottovalutate la tenuta del fango e posizionate male la leva sotto la struttura di legno. Sotto la pressione, l'asse cede e si spezza a metà con uno schiocco tremendo, rendendo il mezzo irrimediabilmente inservibile. Il Lungobarbo si dispera e vi copre di insulti rabbiosi e maledizioni in lingua Vitghen mentre vi allontanate.",
            "stat": "int",
            "cd": 8,
            "reward": "lasciapassare_mercantile",
            "punishment": "rancore_del_mercante"
        },
        "ponte_marcio": {
            "title": "Il ponte marcio",
            "desc": "Per accorciare le tempistiche e giungere più veloci al vostro obiettivo, tagliate attraverso un valico ed un terrapieno, sino a giungere ad una gola. La mulattiera che avete imboccato si arresta su una passerella di corda, sotto alla quale infuriano le rapide di un fiume montano. Il legno della passerella è annerito dall'umidità e le corde portanti sembrano essere sfilacciate per via del vento che continua a soffiare imperterrito. Questo, però, è l'unico modo di passare dall'altra parte senza tornare indietro ed allungare il viaggio.",
            "ignoreText": "Il buonsenso prevale sulla fretta. Voltate le spalle al precipizio e vi preparate a risalire la gola.",
            "successText": "Esaminate attentamente la tensione dei cavi e la consistenza delle fibre legnose, individuando con esattezza le sole assi ancora ancorate ai travetti di sostegno. Guidate i vostri compagni passo dopo passo, facendoli procedere a intervalli regolari senza generare oscillazioni pericolose. Alla fine del ponte trovate una pietra incisa di rune antiche.",
            "failText": "Un'asse all'apparenza solida si polverizza sotto il peso di uno scarpone. Nel disperato tentativo di non cadere vi aggrappate alle corde sfilacciate, ma lo strattone disorienta la compagnia.",
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
            "successText": "Con metodo e sangue freddo, analizzate l'orientamento delle striature sulle rocce levigate dall'antico passaggio dell'acqua e la direzione delle correnti d'aria fredda, ricostruendo fedelmente la direttrice originale fino a sbucare dall'altra parte della gola.",
            "failText": "Seguite un falso avvallamento che vi conduce dritti dentro un pantano ingannevole. Camminate in cerchio per ore nel gelo della nebbia, sprofondando nel fango fino alle ginocchia prima di ritrovare la riva.",
            "stat": "int",
            "cd": 8,
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
            "desc": "Una solida palizzata di tronchi appuntiti sbarra la gola nel suo punto più stretto. Da una torretta improvvisata scendono quattro individui corazzati con piastre arrugginite, recanti vesti logore con i colori del Clan Seachtuir, protettori della Valle del Krogg. In un attimo venite circondati da almeno altri dieci uomini che impugnano spade. I quattro uomini di fronte a voi esibiscono pergamene con sigilli di ceralacca consunti. Con tono perentorio e mani sulle impugnature, dichiarano di riscuotere il 'Tributo di Pace della Frontiera' per ogni viaggiatore armato, chiedendo un pedaggio in Scudi.",
            "ignoreText": "Non intendete fare accordi con briganti travestiti da guardie né rischiare frecce nella schiena; fate dietrofront cercando un valico montano impervio.",
            "successText": "Con sguardo glaciale analizzate la pergamena, notando che lo stemma impresso nella cera appartiene sì ad un Clan esistente, ma che i formulari sono pieni di errori grossolani. Esponete la truffa con tale precisione normativa e sicurezza che i malviventi, intimoriti dalle vostre conoscenze, abbassano la sbarra ed in cambio del vostro silenzio vi offrono un antico amuleto.",
            "failText": "Vi impappinate nel contestare le ordinanze e mostrate insicurezza: gli uomini dinanzi a voi diventano aggressivi e vi intimoriscono con le spade pronte all'uso, pretendendo il doppio della somma come sanzione per oltraggio.",
            "stat": "int",
            "cd": 8,
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
            "title": "Il Seachtuir morto nella neve",
            "desc": "Ai piedi di un grande abete, quasi del tutto sepolto dalla neve fresca, giace il cadavere di un guerriero del clan Seachtuir di Aebeltoff, che riconoscete dai colori azzurro e bianco del clan e dal simbolo della testa di cane. La cotta di maglia è coperta di brina e le labbra sono rilassate in un sereno sorriso. Tra i guanti d'arme congelati stringe una bussola, mentre la spada è infilata nel terreno ghiacciato, come una tomba solitaria. L'aria sembra essere assolutamente immobile. La bussola è incrostata di fango e cenere, e contiene la falange di un dito ossificato che gira in modo irregolare.",
            "ignoreText": "È un semplice soldato del clan Seachtuir, probabilmente perso durante una spedizione. Non perdete tempo ad accompagnare la sua anima nel Margine, presi dalla vostra missione.",
            "successText": "Vi inginocchiate nel fango gelato e intonate i canti sacri a Jag Antar come intercessione per l'anima del Seachtuir verso il Margine. Quando terminate la sacra litania, osservate meglio la bussola. Una bussola inservibile, che contiene al suo interno l'osso di un dito. Qualcuno, fra di voi, parla di un uomo che si cavò gli occhi per non essere costretto a seguire la strada tracciata da uno Jarl. La morale, nella storia, era che finché si ha una meta, si è schiavi del proprio viaggio. Solo chi è disperatamente perduto può dirsi del tutto libero dal destino.",
            "failText": "Tentate di prendere la bussola con impazienza, senza rendere onore al Seachtuir morto. Le dita dell'uomo sembrano serrare la presa, e un alito di vento spettrale cala sul gruppo. La bussola sembra incrinarsi ed il dito smette di girare.",
            "stat": "fth",
            "cd": 7,
            "reward": "frammento_di_yr_drazul",
            "punishment": "sacrilego"
        },
        "pellegrino": {
            "title": "Il pellegrino",
            "desc": "Seduto su una pietra liscia, sul limitare di uno strapiombo, riposa un anziano pellegrino, probabilmente un Gothi di Valgoren, dai simboli che porta sulle vesti logore. Le sue caviglie sono provate dal cammino, e la pelle è arsa dal freddo pungente che sta minacciando anche voi da quando avete iniziato la scalata. Regge una ciotola nella mano e, quando vi vede, ve la porge, richiedendovi un momento di comunione spirituale prima che le sue forze lo abbandonino.",
            "ignoreText": "Non avete provviste né tempo da sprecare per l'ennesimo Gothi che chiede la carità. Inutile sprecare risorse con qualcuno che ha scelto di venire a morire lì.",
            "successText": "Vi fermate e condividete un sorso della vostra acqua con lui, mentre recitate con lui preghiere verso l'Asi della Carità. Prima di congedarsi, il vecchio vi traccia simboli religiosi utilizzando la polvere del cammino, infondendo protezione e conforto alla vostra compagnia.",
            "failText": "La vostra preghiera è frettolosa e manca di vera fede. Indignato da tale gesto, l'uomo svuota la ciotola ai vostri piedi. Un segno che Valgoren pone a coloro che non sono caritatevoli e manchevoli di spirito. Una sensazione di profonda delusione cala su di voi.",
            "stat": "fth",
            "cd": 7,
            "reward": "favore_di_valgoren",
            "punishment": "fede_inaridita"
        },
        "cavallo_senza_cavaliere": {
            "title": "Il cavallo senza cavaliere",
            "desc": "Una maestosa giumenta da guerra nera come la pece con la sella fatta a brandelli galoppa nervosamente sul sentiero di montagna. La bestia ha le narici dilatate, la bava alla bocca e gli occhi pieni di terrore: fissa l'oscurità di un pertugio, presumibilmente una caverna, ringhiando quasi come fosse un lupo, mentre furente calpesta il terreno. Quasi come se qualcosa di empio abbia ucciso il suo cavaliere, ed ora il terrore impossessatosi di lei la porta ad attaccare qualsiasi cosa le sembri un pericolo.",
            "ignoreText": "Gli zoccoli e la muscolatura della giumenta potrebbero seriamente ferirvi. Vi muovete rasenti alle pareti di roccia, cercando di non fare rumori o movimenti improvvisi. Lasciate che la bestia si sfoghi da sola.",
            "successText": "Avanzate a mani vuote, senza imbracciare armi o scudi, e modulate la voce per far trapelare calma e serenità. Ricordate anche un canto che si tramanda a Valbruma. Tale canto, secondo la leggenda, veniva usato dai Viridei per calmare le bestie, chiedendo l'intercessione di Gor Dem. Poggiate le mani sulla fronte dell'animale: la giumenta china il capo e vi permette di setacciare le borse del cavaliere.",
            "failText": "La vostra voce tradisce un tremito di paura e di minaccia. La bestia percepisce tali emozioni, nitrisce furibonda e vi carica, travolgendovi e ferendovi prima di fuggire spaventata.",
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
            "title": "La cappella del Margine",
            "desc": "Anche in luoghi remoti come questo, lungo i sentieri che si inerpicano fra i picchi, la fede trova la strada. Vi imbattete in un'edicola votiva, un piccolo altare a cui i pellegrini, coloro che si sono persi e gli esploratori fanno riferimento durante i loro viaggi. L'icona del trono di Jag Antar, Asi di questa edicola, è stata tolta dalla nicchia e gettata fra il pietrisco e il fango del sentiero. L'atmosfera intorno all'edicola è tetra ed opprimente, intrisa del fetore della profanazione.",
            "ignoreText": "Non rientra nei vostri obiettivi ramazzare edicole abbandonate, dovrebbe essere compito dei Gothi del territorio. Accelerate il passo per recuperare il tempo perduto ad esaminare.",
            "successText": "Ripulite con devozione la nicchia, recitando formule indirizzate a Colui che Veglia. Una calda benedizione sembra rinfrancare le vostre stanche membra.",
            "failText": "Non sapete esattamente cosa fare. Rimettete l'icona al suo posto, recitate una formula raffazzonata a tutti gli Asi, sperando che vada bene. Una folata di vento rovescia l'icona, che cade andando in frantumi. Avete completato la profanazione, questo atto grava sulle vostre spalle.",
            "stat": "fth",
            "cd": 8,
            "reward": "occhio_del_corvo",
            "punishment": "presagio_di_morte"
        },
        "sentiero_rune": {
            "title": "Il sentiero delle rune",
            "desc": "Il viaggio si inerpica su per i Picchi, ma ad un certo punto vi imbattete in una strada insolitamente tranquilla. Tra le mura di pietra dei monti si snoda un sentiero lineare, privo di avvallamenti o salite, che percorrete con tranquillità. I vostri occhi vengono attratti da alcune pietre che recano al di sopra alcuni segni runici. Sembra quasi un percorso, una prova, forse creata da Gothi in cerca di espiazione o da apprendisti della Torre di Flynn in cerca di sapere. Quelle pietre, però, sembrano intrise di potere. Sta a voi decidere come affrontarle.",
            "ignoreText": "Semplicemente, decidete di aggirare il sentiero. Percorrete, scalando, una parete di pietra, evitando qualsiasi influenza esse abbiano.",
            "successText": "Non siete apprendisti della Torre di Flynn, ma alcuni insegnamenti dei Ludus vi hanno preparato ad affrontare situazioni del genere. Riconoscete in esse un'ode al Mutevole, ed abbassate il capo, camminando a piedi scalzi, fino alla fine, mentre intonate lodi a Draken. Durante il percorso, sembra quasi che il terreno irradi una sorta di calore benefico.",
            "failText": "Il Mutevole? Un altro Asi? Il dubbio vi pervade mentre camminate. Un senso di claustrofobia vi assale, lasciandovi storditi e con la mente annebbiata.",
            "stat": "fth",
            "cd": 8,
            "reward": "anello_del_giuramento",
            "punishment": "tormento_mentale"
        },
        "forca_crocevia": {
            "title": "La forca del crocevia",
            "desc": "Dove quattro sentieri si incrociano in mezzo a un terrapieno brullo, sorge un'alta forca di quercia annerita dal fuoco. Tre corpi senza nome pendono dalle corde oscillando pesantemente al vento gelido: sono stati lasciati lì come macabro monito militare e le loro bocche spalancate sembrano ancora urlare in silenzio. Attorno all'albero l'erba è morta e un ronzio inquietante di sussurri spettrali turba i sensi di chiunque si avvicini al crocevia.",
            "ignoreText": "Distogliete lo sguardo da quello scempio, vi tappate le orecchie per non ascoltare il cigolio delle corde e accelerate il passo oltre il quadrivio.",
            "successText": "Con passo solenne camminate verso i cappi ed intonate un'antica requie per la pacificazione di cadaveri non bruciati, tracciando con la cenere un cerchio di preghiere. I sussurri si placano all'istante, le corde tacciono e una sensazione di protezione avvolge le vostre lame.",
            "failText": "L'orrore della scena paralizza la compagnia e la litania si trasforma in un balbettio collettivo. L'inquietudine degli impiccati si lega alla psiche del gruppo: una cappa di angoscia opprime tutti i membri.",
            "stat": "fth",
            "cd": 8,
            "reward": "marchio_di_jag_antar",
            "punishment": "ombra_sul_cuore"
        },
        "rifugio_abbandonato": {
            "title": "Il rifugio abbandonato",
            "desc": "Un Rifugio Tirosaldo, un avamposto del Primarca Oreste, mezzo divelto dal gelo, sporge da un costone roccioso. La porta è scardinata, ma all'interno l'occhio esperto nota che le assi del pavimento nascondono un meccanismo di trappole a scatto rudimentali, montate con corde tese e falci da fieno per proteggere una botola interrata.",
            "ignoreText": "La capanna sembra troppo instabile e il rischio di far scattare una tagliola o far crollare il tetto non vale la pena; proseguite lungo la cresta.",
            "successText": "Esaminando con attenzione la tensione dei fili e i contrappesi di piombo, disarmate le trappole una dopo l'altra. Nella botola asciutta trovate provviste e un antico manufatto intagliato.",
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
            "title": "Il ceppo del giuramento",
            "desc": "Nel mezzo delle montagne, una foresta vi ospita, accogliendovi in una radura. Volete approfittare di tale radura e della sua sicurezza per accamparvi, quando vedete al centro di essa un mucchio di pietre consacrate attorno ad un'antica insegna militare oramai consunta. L'insegna, di cui oramai è impossibile riconoscere colori e stemmi, è però decorata con nastri votivi lasciati da guardie e viandanti durante il percorso.",
            "ignoreText": "Gli Asi Minori delle rotte e delle strade non fermeranno le lame né vi daranno ciò che volete, tirate dritto senza perdere tempo in preghiere da Gothi.",
            "successText": "Riannodate i nastri votivi, recitate preghiere e ponete un sasso in cima al tumulo in segno di rispetto. Un senso di incrollabile fermezza e sollievo spirituale si posa sulla compagnia.",
            "failText": "Durante la deposizione del sasso, un gesto distratto fa franare l'intero cumulo sul fango. Il silenzio che segue è cupo e accusatorio, lasciando la carovana priva di conforto.",
            "stat": "fth",
            "cd": 8,
            "reward": "lanterna_dei_morti",
            "punishment": "sacrilego"
        }
    },
    "merchants": {
        "default": "Al ciglio del sentiero scorgete un carretto coperto da teli cerati, trainato da un mulo paziente e stipato di bauli, gabbie e cianfrusaglie. Un mercante viandante, avvolto in un pastrano consumato da mille viaggi, vi accoglie con un sorriso d'intesa sollevando una mano. Gira queste lande desolate barattando arnesi, carabattole e ferri con chiunque abbia Scudi da spendere.",
        "picchi": "Sui sentieri che si inerpicano fra i Picchi del Tramonto scorgete un carretto coperto da teli cerati, trainato da un mulo paziente e stipato di bauli, gabbie e cianfrusaglie. Un mercante viandante, avvolto in un pastrano consumato da mille viaggi, vi accoglie con un sorriso d'intesa sollevando una mano. Gira queste lande desolate barattando arnesi, carabattole e ferri con chiunque abbia Scudi da spendere.",
        "mistero": "Al ciglio del sentiero scorgete un mercante viandante, avvolto in un pastrano consumato da mille viaggi, che vi accoglie con un sorriso d'intesa sollevando una mano. Gira sui Picchi del Tramonto barattando arnesi, carabattole e ferri con chiunque abbia Scudi da spendere. Come faccia a procurarseli in questi posti, è un mistero.",
        "lungobarbo": "Un allegro Lungobarbo, che non sembra per nulla stanco nonostante la sua traversata, vi osserva mentre continuate a camminare dopo le lunghe fatiche appena affrontate. Con il gran sorriso di chi si trova un'occasione davanti, vi mette a disposizione le merci presenti sul suo carretto, pronte ad essere acquistate in cambio di Scudi."
    },
    "rests": {
        "default": "Trovate un angolo di pace in mezzo alla natura selvaggia: la quiete della radura vi ricorda all'improvviso tutto il peso e la stanchezza che vi portate sulle spalle. Accendete un piccolo focolare protetto dal vento e vi fermate a riscaldare corpo e spirito, raccogliendo le forze prima di rimettervi in marcia lungo il sentiero.",
        "enisov": "Vi soffermate nel tranquillo villaggio di Enisov, ai piedi dei Picchi del Tramonto. Lì, venite accolti con reverenza ed onore. Il gestore della locanda vi offre vitto ed alloggio, ma voi rifiutate la sua bontà, e pagate la vostra sosta, dando anche le mance ai lavoratori della locanda. Durante la cena, il locandiere vi racconta che Enisov è molto legato alla Famiglia. Si dice che due fratelli, nati proprio lì, siano diventati delle figure di spicco della Famiglia. Di tanto in tanto, uno dei due – alto e minaccioso – viene nel villaggio per aiutare le persone.",
        "valichi": "Trovate un angolo di pace fra i valichi dei Picchi del Tramonto: la quiete vi ricorda all'improvviso tutto il peso e la stanchezza che vi portate sulle spalle. Accendete un piccolo focolare protetto dal vento e vi fermate a riscaldare corpo e spirito, raccogliendo le forze prima di rimettervi in marcia lungo il sentiero.",
        "vista_valle": "Siete ancora all'inizio della scalata dei Picchi del Tramonto, eppure siete fieri di esser arrivati sin qui. Vi godete la vista della Valle del Krogg da quell'altezza. Il sole sta tramontando ma non ci sono nuvole: vi sembra di poter intravedere i fumi di Aebeltoff all'orizzonte. Accendete il fuoco, pronti a darvi il cambio per i turni di guardia durante il riposo.",
        "estenuante": "L'attraversamento si è fatto estenuante. I Picchi del Tramonto sono inospitali e irti di pericoli, ma voi continuate ad andare avanti. Vi soffermate per rattoppare qualche ferita, scaldarvi, e riposare le vostre stanche membra."
    },
    "treasures": {
        "disperazione_kin": "Durante questa prima parte del vostro viaggio, non avete potuto non notare quanti Kin si sono dati al banditaggio nella Valle del Krogg. Forse, in piccola parte, condividete le preoccupazioni dei Lungobarbi e dei Vitghen in generale, riguardo le ondate migratorie dovute all'egemonia del Cenn dalle Lunghe Corna a Foscoclivo. Eppure, avete visto anche le cose positive che i Kin profughi hanno portato: voglia di lavorare, di condividere, di imparare e di vivere in pace nel Nord. Proprio mentre riflettete su ciò, incrociate una pattuglia armata del clan Seachtuir di Aebeltoff. Vi salutano, riverendovi, e vi invitano ad unirvi a loro. Stanno cercando uno dei covi dei briganti, e una mano gli farebbe comodo. Li seguite, fino ad arrivare ad una caverna. L'aspetto è strano, e pieno di statue di Asi ben diversi da quelli che conoscete. Poi notate ceste di biancheria, una cucina improvvisata. Poi, infine, li trovate. Bambini, donne e anziani Kin, all'interno della caverna. Le famiglie degli uomini che imperversano sui Picchi del Tramonto. I Seachtuir hanno ordini ben precisi: fare piazza pulita di chiunque infesti le montagne."
    },
    "lootItems": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "ankh_pellegrino", "bastone_eremita", "balsamo_curativo", "spada_norgrad", "alabarda_guardia", "mannaia_pesante", "scudo_ferro", "corazza_scaglie", "tomo_proibito", "reliquiario_tascabile", "martello_consacrato", "brigantina_benedetta", "stocco_duellante", "pozione_rigenerazione", "unguento_fortificante", "lama_acciaio_lunare", "martello_breccia", "gorgiera_veterano", "corazza_piastre_leone", "cappa_sussurri", "simbolo_jag_antar", "scettro_savio", "corona_martire", "elisir_sangue_vivo", "olio_bollente", "bomba_acido", "cristallo_flammaurea", "grappa_soldato", "infuso_corteccia", "olio_da_lama", "pozione_pelle_pietra", "elisir_berserker"],
    "mapNodes": [
        { "id": 0, "level": 0, "x": 300, "type": "combat", "enemy": "banditi_strada", "title": "Livello 1 - Scontro Ovest", "icon": "🗡️", "done": false, "active": true, "next": [2, 3] },
        { "id": 1, "level": 0, "x": 500, "type": "combat", "enemy": "cani_caccia", "title": "Livello 1 - Scontro Est", "icon": "🗡️", "done": false, "active": true, "next": [3, 8] },
        { "id": 2, "level": 1, "x": 250, "type": "challenge", "challengeId": "carro_rovesciato", "title": "Livello 2 - Il carro Rovesciato", "icon": "❓", "done": false, "active": false, "next": [5], "image": "immagini/carro_rovesciato.jpg" },
        { "id": 3, "level": 1, "x": 400, "type": "combat", "enemy": "sciacalli_cadaveri", "title": "Livello 2 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [6, 7] },
        { "id": 4, "level": 2, "x": 592, "type": "merchant", "merchantId": "default", "title": "Livello 3 - Mercante", "icon": "🪙", "done": false, "active": false, "next": [11], "image": "immagini/mercante_viaggiatore.jpg" },
        { "id": 5, "level": 2, "x": 200, "type": "combat", "enemy": "briganti_pedaggio", "title": "Livello 3 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [9, 10] },
        { "id": 6, "level": 2, "x": 330, "type": "rest", "restId": "enisov", "title": "Livello 3 - Riposo", "icon": "⛺", "done": false, "active": false, "next": [10], "image": "immagini/riposo.jpg" },
        { "id": 7, "level": 2, "x": 470, "type": "challenge", "challengeId": "guerriero_morto_neve", "title": "Livello 3 - Il Seachtuir morto nella neve", "icon": "❓", "done": false, "active": false, "next": [10, 11], "image": "immagini/guerriero_morto_neve.jpg" },
        { "id": 8, "level": 1, "x": 543, "type": "combat", "enemy": "cinghiali_pietraie", "title": "Livello 2 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [4, 7] },
        { "id": 9, "level": 3, "x": 197, "type": "merchant", "merchantId": "picchi", "title": "Livello 4 - Mercante", "icon": "🪙", "done": false, "active": false, "next": [12, 13], "image": "immagini/mercante.png" },
        { "id": 10, "level": 3, "x": 400, "type": "elite", "enemy": "capitano_predoni", "title": "Livello 4 - Capitano dei predoni Kin", "icon": "👹", "done": false, "active": false, "next": [13] },
        { "id": 11, "level": 3, "x": 589, "type": "rest", "restId": "valichi", "title": "Livello 4 - Riposo", "icon": "⛺", "done": false, "active": false, "next": [13, 14], "image": "immagini/riposo.jpg" },
        { "id": 12, "level": 4, "x": 274, "type": "challenge", "challengeId": "pietra_miliare", "title": "Livello 5 - La Pietra Miliare", "icon": "❓", "done": false, "active": false, "next": [15, 16], "image": "immagini/pietra_miliare.jpg" },
        { "id": 13, "level": 4, "x": 401, "type": "combat", "enemy": "branco_lupi", "title": "Livello 5 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [16, 17] },
        { "id": 14, "level": 4, "x": 520, "type": "challenge", "challengeId": "pellegrino", "title": "Livello 5 - Il Pellegrino", "icon": "❓", "done": false, "active": false, "next": [17, 18], "image": "immagini/pellegrino.png" },
        { "id": 15, "level": 5, "x": 200, "type": "combat", "enemy": "disertori", "title": "Livello 6 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [19] },
        { "id": 16, "level": 5, "x": 330, "type": "merchant", "merchantId": "mistero", "title": "Livello 6 - Mercante", "icon": "🪙", "done": false, "active": false, "next": [19], "image": "immagini/mercante.png" },
        { "id": 17, "level": 5, "x": 470, "type": "rest", "restId": "vista_valle", "title": "Livello 6 - Riposo", "icon": "⛺", "done": false, "active": false, "next": [19, 20], "image": "immagini/riposo.jpg" },
        { "id": 18, "level": 5, "x": 600, "type": "combat", "enemy": "esploratori_predoni", "title": "Livello 6 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [20] },
        { "id": 19, "level": 6, "x": 334, "type": "elite", "enemy": "ragno_nero_imperiale", "title": "Livello 7 - Ragno Nero Imperiale", "icon": "👹", "done": false, "active": false, "next": [46] },
        { "id": 20, "level": 6, "x": 500, "type": "elite", "enemy": "cenofori_slavine", "title": "Livello 7 - Cenofori delle Slavine", "icon": "👹", "done": false, "active": false, "next": [46] },
        { "id": 21, "level": 8, "x": 256, "type": "rest", "restId": "estenuante", "title": "Livello 9 - Riposo", "icon": "⛺", "done": false, "active": false, "next": [24], "image": "immagini/riposo.jpg" },
        { "id": 22, "level": 8, "x": 406, "type": "merchant", "merchantId": "lungobarbo", "title": "Livello 9 - Mercante", "icon": "🪙", "done": false, "active": false, "next": [25, 26], "image": "immagini/mercante.png" },
        { "id": 23, "level": 8, "x": 554, "type": "challenge", "challengeId": "cippo_giuramento", "title": "Livello 9 - Il Ceppo del Giuramento", "icon": "❓", "done": false, "active": false, "next": [27], "image": "immagini/ceppo_giuramento.jpeg" },
        { "id": 24, "level": 9, "x": 204, "type": "challenge", "challengeId": "mercante_bloccato", "title": "Livello 10 - Il Mercante Bloccato", "icon": "❓", "done": false, "active": false, "next": [28], "image": "immagini/mercante_bloccato.jpeg" },
        { "id": 25, "level": 9, "x": 335, "type": "combat", "enemy": "vitghen_rinnegati", "title": "Livello 10 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [28, 39] },
        { "id": 26, "level": 9, "x": 463, "type": "challenge", "challengeId": "cappella_viandante", "title": "Livello 10 - La Cappella del Margine", "icon": "❓", "done": false, "active": false, "next": [30], "image": "immagini/cappella.png" },
        { "id": 27, "level": 9, "x": 593, "type": "combat", "enemy": "orso_bruno", "title": "Livello 10 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [30] },
        { "id": 28, "level": 10, "x": 258, "type": "combat", "enemy": "balestrieri_disertori", "title": "Livello 11 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [31] },
        { "id": 29, "level": 13, "x": 401, "type": "merchant", "merchantId": "default", "title": "Livello 14 - Mercante", "icon": "🪙", "done": false, "active": false, "next": [41], "image": "immagini/mercante.png" },
        { "id": 30, "level": 10, "x": 538, "type": "challenge", "challengeId": "ponte_marcio", "title": "Livello 11 - Il Ponte Marcio", "icon": "❓", "done": false, "active": false, "next": [32, 33], "image": "immagini/ponte_sfida.png" },
        { "id": 31, "level": 11, "x": 259, "type": "challenge", "challengeId": "sentiero_rune", "title": "Livello 12 - Il Sentiero delle Rune", "icon": "❓", "done": false, "active": false, "next": [34, 35], "image": "immagini/sentiero_rune.png" },
        { "id": 32, "level": 11, "x": 399, "type": "combat", "enemy": "picchieri_sbandati", "title": "Livello 12 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [35, 36] },
        { "id": 33, "level": 11, "x": 538, "type": "challenge", "challengeId": "strada_scompare", "title": "Livello 12 - La Strada Scompare", "icon": "❓", "done": false, "active": false, "next": [37], "image": "immagini/strada_scompare.png" },
        { "id": 34, "level": 12, "x": 200, "type": "merchant", "merchantId": "lungobarbo", "title": "Livello 13 - Mercante", "icon": "🪙", "done": false, "active": false, "next": [38], "image": "immagini/mercante.png" },
        { "id": 35, "level": 12, "x": 331, "type": "combat", "enemy": "cantori_fiamma", "title": "Livello 13 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [29] },
        { "id": 36, "level": 12, "x": 466, "type": "challenge", "challengeId": "forca_crocevia", "title": "Livello 13 - La Forca del Crocevia", "icon": "❓", "done": false, "active": false, "next": [40], "image": "immagini/crocevia.png" },
        { "id": 37, "level": 12, "x": 609, "type": "combat", "enemy": "cani_corsi", "title": "Livello 13 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [40] },
        { "id": 38, "level": 13, "x": 263, "type": "elite", "enemy": "boia_rinnegati", "title": "Livello 14 - Boia rinnegato degli Heymaey", "icon": "👹", "done": false, "active": false, "next": [41] },
        { "id": 39, "level": 10, "x": 399, "type": "challenge", "challengeId": "pedaggio", "title": "Livello 11 - Il Pedaggio", "icon": "❓", "done": false, "active": false, "next": [32], "image": "immagini/sfida_pedaggio.jpeg" },
        { "id": 40, "level": 13, "x": 543, "type": "elite", "title": "Livello 14 - Boia rinnegato degli Heymaey", "icon": "👹", "done": false, "active": false, "next": [42], "image": "", "enemy": "boia_rinnegati" },
        { "id": 41, "level": 14, "x": 320, "type": "challenge", "challengeId": "rifugio_abbandonato", "title": "Livello 15 - Il Rifugio Abbandonato", "icon": "❓", "done": false, "active": false, "next": [43], "image": "immagini/rifugio_sfida.png" },
        { "id": 42, "level": 14, "x": 483, "type": "merchant", "title": "Livello 15 - Mercante", "icon": "🪙", "done": false, "active": false, "next": [44], "image": "immagini/mercante.png", "merchantId": "default" },
        { "id": 43, "level": 15, "x": 319, "type": "rest", "restId": "valichi", "title": "Livello 16 - Ultimo Bivacco Ovest", "icon": "⛺", "done": false, "active": false, "next": [45], "image": "immagini/riposo.jpg" },
        { "id": 44, "level": 15, "x": 484, "type": "rest", "restId": "valichi", "title": "Livello 16 - Ultimo Bivacco Est", "icon": "⛺", "done": false, "active": false, "next": [45], "image": "immagini/riposo.jpg" },
        { "id": 45, "level": 16, "x": 396, "type": "combat", "enemy": "tremabosco_striato", "title": "Livello 17 - Tremabosco Striato (Boss)", "icon": "👑", "done": false, "active": false, "next": [] },
        { "id": 46, "level": 7, "x": 410, "type": "treasure", "title": "Livello 8 - La Disperazione dei Kin", "icon": "💎", "done": false, "active": false, "next": [21, 22, 23], "image": "", "treasureId": "disperazione_kin" }
    ]
};
