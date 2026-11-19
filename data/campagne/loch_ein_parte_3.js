// Campagna "Loch Ein, Parte Tre: Il Cuore di Loch Ein".
// Il contenuto dopo "=" è JSON puro: niente funzioni, gli effetti sono descritti nei campi "effects"
// e interpretati da applyEffects() in js/game.js. È un file .js (e non .json) perché il gioco
// si apre con doppio click da file:// e il browser blocca fetch() di file locali.
// Nemici, oggetti, reliquie e maledizioni sono richiamati per id da data/libreria/.
window.CAMPAIGNS = window.CAMPAIGNS || {};
window.CAMPAIGNS["loch_ein_parte_3"] = {
    "difficolta": { "vittoriaMin": 28, "vittoriaMax": 42 },
    "maxEroi": 6,
    "id": "loch_ein_parte_3",
    "title": "Loch Ein, Parte Tre: Il Cuore di Loch Ein",
    "avventura": "loch_ein",
    "capitolo": 3,
    "terreno": "pietra",
    "badge": "Parte Tre",
    "description": "Strappata l'Yrtite al cuore di Loch Ein, Alastorta crolla privo di sensi. Inizia la fuga: dal Salone delle Risposte alla Biblioteca in fiamme, dalla Grande Piazza che sprofonda alle grotte di pirite, fino al passaggio sottomarino, mentre il lago reclama la città.",
    "coverImage": "immagini/rovine_di_loch_ein_e_scudo_dignitas.webp",
    "introText": "Sconfitto Eldric sulla soglia del Palazzo dei Firmamentisti, avete varcato la porta di bronzo e attraversato la Biblioteca e il passaggio segreto fino al Salone delle Risposte. Lì Alastorta ha strappato il frammento di Yrtite al nucleo ed è crollato privo di sensi, con le vene che pulsano di viola sotto le rune. Ora dovete portarlo fuori, mentre Loch Ein sprofonda e il lago reclama la città.",
    "heroes": ["alastorta_dignitas", "pancrazio_dignitas", "cassio_dignitas", "ofelia_dignitas", "pandora_dignitas", "temistocle_dignitas"],
    "initialArmory": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "balsamo_curativo", "stilo_da_battaglia", "turibolo_ferrato", "rosario_del_pellegrino"],
    "challenges": {
        "crollo_salone_delle_risposte": {
            "title": "Il Crollo del Salone delle Risposte",
            "desc": "La volta del Salone delle Risposte si squarcia sopra le vostre teste appena Alastorta sviene stringendo l'Yrtite al petto; enormi blocchi di marmo e tonnellate d'acqua gelida precipitano mentre dovete guidare una corsa disperata portando con voi un uomo privo di sensi.",
            "ignoreText": "Vi gettate in un condotto di scolo laterale molto più stretto e tortuoso, faticando a trascinare Alastorta ma evitando la pioggia di massi al centro della sala.",
            "successText": "Seguendo gli ordini secchi di Temistocle, scattate in sincronia schivando i pilastri che crollano e balzate oltre la porta monumentale un istante prima che il soffitto si chiuda alle vostre spalle.",
            "failText": "L'onda d'urto di un masso caduto vi scaraventa nell'acqua gelida che sale; proteggete col vostro corpo Alastorta incosciente ma uscite dal salone pieni di dolorose contusioni.",
            "stat": "int",
            "cd": 7,
            "bonusEroi": { "ofelia_dignitas": 1, "pandora_dignitas": 1 },
            "reward": "passo_rapido_gallerie",
            "punishment": {
                "type": "injury",
                "name": "Contusioni nel crollo",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "porta_monumentale": {
            "title": "La Porta Monumentale",
            "desc": "Mentre attraversate la camera dei bassorilievi con Alastorta svenuto, le scosse che accompagnano il crollo del Salone delle Risposte fanno scattare il contrappeso dell'enorme porta di pietra che oltre due anni fa aveva intrappolato il Primarca e Cassio. Il lastrone massiccio scende con un fragore assordante minacciando di sigillare la galleria. Temistocle si getta per primo sotto la fessura puntando le spalle contro la pietra viva mentre Pancrazio, con gli occhi iniettati di rabbia, gli si affianca per reggere il peso; intanto Ofelia e Cassio cercano di infilare la Spada Spiavento nell'incavo per bloccare il meccanismo e far passare il Primarca.",
            "ignoreText": "Rinunciate a trattenere il lastrone principale e deviate di corsa nello stretto cunicolo di servizio usato da Emrys due anni fa, faticando a far passare Alastorta e perdendo terreno sull'acqua che sale.",
            "successText": "Con uno sforzo brutale che fa scricchiolare le armature, bloccate la discesa del lastrone abbastanza a lungo perché Ofelia, Cassio e Pandora trascinino Alastorta al sicuro oltre la soglia; la Spiavento assorbe l'ultima scarica residua del sigillo prima che la pietra crolli alle vostre spalle.",
            "failText": "Il peso colossale della porta vi schiaccia le spalle costringendovi a rotolare via all'ultimo secondo tra schegge di roccia e contusioni profonde, mentre riuscite a stento a tirare fuori Alastorta prima che il varco si richiuda.",
            "stat": "str",
            "cd": 7,
            "bonusEroi": { "temistocle_dignitas": 1, "pancrazio_dignitas": 1 },
            "reward": "spiavento_potenziata",
            "punishment": {
                "type": "injury",
                "name": "Schiacciati dalla porta",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "anomalia_temporale": {
            "title": "Le Sacche Temporali Impazzite",
            "desc": "Risalite la galleria in cui la bolla del limbo si sta disgregando in frammenti impazziti: gocce d'acqua gelano a mezz'aria per poi esplodere in getti bollenti, mentre la roccia si sgretola e si ricompone a scatti. Proprio mentre valutate come far passare Alastorta, il Primarca rinviene per pochi secondi: con voce roca e occhi febbrili sussurra a Cassio la cadenza esatta delle sacche di stasi prima che una fitta di dolore gli faccia perdere nuovamente conoscenza.",
            "ignoreText": "Costeggiate la parete esterna dove l'effetto è minimo, allungando il giro in un cunicolo secondario angusto.",
            "successText": "Seguendo il ritmo mormorato da Alastorta prima di svenire, Cassio e Ofelia calcolano la finestra di stasi e guidano il gruppo attraverso la galleria senza subire il contraccolpo temporale, comprendendo anche come rafforzare la tenuta delle rune sul petto del Primarca.",
            "failText": "Rimanete intrappolati per alcuni istanti in una sacca di accelerazione; sentite i muscoli svuotarsi sotto il peso di ore compresse in pochi secondi mentre proteggete Alastorta.",
            "stat": "int",
            "cd": 7,
            "bonusEroi": { "cassio_dignitas": 1, "ofelia_dignitas": 1 },
            "reward": "schema_di_stasi",
            "punishment": {
                "type": "injury",
                "name": "Ore compresse in pochi secondi",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "visione_del_disastro": {
            "title": "La Visione del Disastro",
            "desc": "L'aria davanti a voi si squarcia in un'ultima, violenta illusione della notte del 178 d.F.: il cielo rosso, il tremore e la luce accecante dell'esplosione. Mentre gli altri arretrano d'istinto sopraffatti da quell'eco quasi divina invocando Draken, Pandora socchiude appena gli occhi con fastidio, come se si trattasse solo di una torcia agitata troppo vicino al viso, indicando freddamente tra i bagliori la borsa di un messaggero caduto cinquant'anni fa.",
            "ignoreText": "Abbassate lo sguardo e tirate dritto lungo il muro proteggendo Alastorta svenuto.",
            "successText": "Guidati dal sangue freddo di Ofelia, distinguete l'illusione della Celestica dalla realtà e recuperate la borsa, trovando uno stilo d'argento e pigmenti puri preziosissimi per ricalcare le rune che si stanno consumando sulle braccia di Alastorta.",
            "failText": "Il fragore e il bagliore della visione vi investono in pieno, facendovi cadere in ginocchio con le orecchie che fischiano mentre vi aggrappate ad Alastorta per non farlo battere sulle pietre.",
            "stat": "int",
            "cd": 8,
            "bonusEroi": { "pancrazio_dignitas": 1, "ofelia_dignitas": 1 },
            "reward": "stilo_argento_pigmenti",
            "punishment": "tormento_mentale"
        },
        "fiume_d_energia_sotterraneo": {
            "title": "Il Fiume d'Energia",
            "desc": "La spaccatura sul cui fondo scorre uno dei fiumi sotterranei di Yr si sta allargando per le scosse, eruttando vapori luminescenti che piegano lo spazio. Avvicinandosi al ciglio, Cassio e Ofelia avvertono un ronzio che fa vibrare l'aria, e persino Alastorta, pur privo di sensi, ha un sussulto febbrile aprendo gli occhi per un istante. Pandora, invece, fissa quel bagliore primordiale senza sentire il minimo richiamo. Di colpo le tornano alla mente gli occhi ciechi di Balinor, oltre due anni fa, quando il servitore degli Aine la atterrò risparmiandola davanti alla statua dell'Atani: ripensa al tono di amara pietà con cui le disse che la fede non è cieca obbedienza né un vessillo da ostentare. Quell'uomo cieco aveva visto ciò che lei aveva nascosto persino a sé stessa: pur fregiandosi del titolo di Arvale, custode e officiante del culto, da quanto tempo si limitava a portarne il nome senza compiere i gesti e i doveri che quella consacrazione esige?",
            "ignoreText": "Cercate un cunicolo laterale nella roccia viva per aggirare la spaccatura, perdendo minuti preziosi mentre il respiro di Alastorta si fa più corto.",
            "successText": "Trattenete il fiato e vi lanciate oltre la faglia con tempismo perfetto: nell'attraversare i vapori primordiali, un guizzo luminoso sfiora Alastorta facendogli riprendere un soffio di colorito per alcuni istanti.",
            "failText": "Inalate i vapori luminescenti durante il salto; una vertigine violenta vi fa atterrare malamente sulle pietre taglienti del bordo opposto.",
            "stat": "fth",
            "cd": 8,
            "bonusEroi": { "cassio_dignitas": 1, "pancrazio_dignitas": 1, "pandora_dignitas": -1 },
            "reward": "bagliore_incorporeo_fiumi",
            "punishment": "vertigine_lacerante"
        },
        "trappole_dei_firmamentisti": {
            "title": "Le Trappole Riattivate",
            "desc": "Imboccate la lunga scalinata segreta che risale verso il muro della Biblioteca, ma lo sconvolgimento tellurico ha fatto scattare gli antichi meccanismi difensivi dei Firmamentisti rimasti bloccati per decenni: dardi e lastre a pressione sbarrano la salita mentre l'acqua preme dal basso.",
            "ignoreText": "Procedete schiacciati contro il cornicione esterno del muro, impiegando il doppio della fatica per tenere sollevato Alastorta senza calpestare i gradini.",
            "successText": "Temistocle individua la sequenza sicura dei gradini e Pancrazio blocca con lo scudo il meccanismo di scatto, facendovi risalire spediti e recuperando un antico medaglione di schermatura incastrato nella parete.",
            "failText": "Uno stivale scivola sulla pietra umida attivando la trappola; una scarica d'energia e schegge di pietra vi investono in pieno mentre fate scudo al Primarca.",
            "stat": "int",
            "cd": 8,
            "bonusEroi": { "temistocle_dignitas": 1, "pancrazio_dignitas": 1 },
            "reward": "circuito_runico_tre_sovrani",
            "punishment": {
                "type": "injury",
                "name": "Dardi avvelenati",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "biblioteca_in_fiamme": {
            "title": "La Biblioteca in Fiamme",
            "desc": "Sbucate dal muro segreto nuovamente nella Sala del Consiglio e della Biblioteca, ma l'edificio inclinato sta cedendo. Le lanterne alchemiche rovesciate hanno incendiato gli alti scaffali di pergamene mentre torrenti d'acqua e travi di marmo precipitano dal soffitto verso il tavolo di pietra, e la porta di bronzo si sta deformando.",
            "ignoreText": "Evitate la porta di bronzo centrale e sfondate una finestra a forma di stella per far passare Alastorta lungo il cornicione esterno del palazzo.",
            "successText": "Attraversate la sala tra fumo e crolli, afferrando al volo gli ultimi manoscritti salvabili sul tavolo di pietra e aprendo un varco dalla porta di bronzo prima che si blocchi del tutto.",
            "failText": "Una trave infuocata e un getto d'acqua bollente vi sbarrano il passo; dovete sfondare la porta a spallate riportando ustioni e contusioni pur di proteggere Alastorta dal fuoco.",
            "stat": "int",
            "cd": 8,
            "bonusEroi": { "cassio_dignitas": 1, "ofelia_dignitas": 1 },
            "reward": "manoscritti_firmamentisti",
            "punishment": {
                "type": "injury",
                "name": "Ustioni e contusioni",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "caduta_dell_architrave": {
            "title": "La Caduta dell'Architrave",
            "desc": "Mentre attraversate l'atrio del Palazzo con Alastorta svenuto, l'enorme architrave sopra l'uscita principale si spezza di netto e inizia a calare come una ghigliottina di marmo. Pancrazio, con le vene del collo gonfie di rabbia e tensione, si piazza sotto il blocco insieme a Temistocle per reggere l'urto mentre gli altri trascinano il Primarca al sicuro.",
            "ignoreText": "Rinunciate al portale centrale e strisciate faticosamente sotto le macerie laterali del colonnato, perdendo tempo prezioso nell'acqua gelida.",
            "successText": "Con uno sforzo sovrumano puntellate l'architrave con un'asta spezzata e passate tutti oltre la soglia un istante prima che il portico si richiuda dietro di voi, strappando al volo uno stendardo intessuto di fili protettivi dall'atrio.",
            "failText": "Il marmo vi sfugge di mano facendovi crollare a terra contusi e sfiniti, costringendovi a trascinarvi fuori a fatica sotto una grandine di calcinacci.",
            "stat": "str",
            "cd": 8,
            "bonusEroi": { "temistocle_dignitas": 1, "pancrazio_dignitas": 1 },
            "reward": "manto_luce_runica",
            "punishment": {
                "type": "injury",
                "name": "Sotto il marmo dell'architrave",
                "desc": "Tutta la compagnia subisce 2 danni",
                "effects": [
                    { "effect": "party_damage", "val": 2 }
                ]
            }
        },
        "caduta_della_statua": {
            "title": "La Statua del Sovrano",
            "desc": "Mentre correte lungo il perimetro della Grande Piazza Circolare reggendo Alastorta privo di sensi, metà della spianata sprofonda nell'abisso e l'enorme statua pendente dell'antico sovrano cede alla base, rotolando sul piano inclinato dritta verso di voi.",
            "ignoreText": "Vi gettate immediatamente giù da una rampa secondaria allagata per uscire dalla traiettoria della statua, allungando la risalita.",
            "successText": "Sfruttate il solco aperto dal crollo del basamento per correre in scia dietro i detriti, usando lo slancio per balzare con Alastorta direttamente sul viale superiore.",
            "failText": "L'impatto della statua fa esplodere una nube di schegge di marmo che vi ferisce alle spalle mentre vi curvate a proteggere il Primarca.",
            "stat": "int",
            "cd": 8,
            "bonusEroi": { "temistocle_dignitas": 1, "pandora_dignitas": 1 },
            "reward": "frammento_statua_sovrani",
            "punishment": {
                "type": "injury",
                "name": "Schegge di marmo",
                "desc": "Tutta la compagnia subisce 2 danni",
                "effects": [
                    { "effect": "party_damage", "val": 2 }
                ]
            }
        },
        "fenditura_del_tesoro": {
            "title": "La Fenditura del Tesoro",
            "desc": "Il collasso della Grande Piazza Circolare ha squarciato il basamento di un antico palazzo dei Firmamentisti, aprendo una fenditura profonda sul cui fondo luccicano pile di Scudi, sigilli d'argento e gioielli antichi e rarissimi rimasti intatti dal giorno della caduta di Loch Ein. Alla vista di quelle gemme preziose, negli occhi di Ofelia scatta un lampo di determinazione: sono esattamente le rarità che suo padre Glauco ha preteso come prezzo per autorizzarla a partire, l'occasione irripetibile per adempiere al proprio dovere verso il Ceppo e dimostrare una volta per tutte la propria superiorità sugli altri cugini. Temistocle valuta subito il valore di quel bottino per gli ultimi scambi prima della superficie, ma la crepa è invasa da acqua resa bollente dalle radiazioni dell'Yrtite e irta di schegge di cristallo infetto: Cassio vi mette in guardia sulle ustioni inevitabili, Pancrazio ringhia impaziente sorreggendo Alastorta svenuto e Pandora scruta la volta che trema. Uno solo di voi può sporgersi nella fenditura, pagando col proprio sangue ogni manciata strappata al baratro.",
            "ignoreText": "Le ferite e il tempo perso non valgono quell'oro: vi allontanate dalla fenditura fumante per continuare la corsa verso i quartieri superiori.",
            "stat": "hp",
            "massimo": 3,
            "unSoloEroe": true,
            "testiSacrificio": [
                "Il prescelto si inginocchia sul bordo scivoloso e affonda il braccio nello strato superiore dell'acqua ustionante. I cristalli taglienti mordono subito l'avambraccio lasciando una scia scarlatta nella schiuma, ma le dita si chiudono attorno a un primo sacchetto gonfio di monete e medaglioni preziosi, strappato alla crepa prima che una scossa faccia scricchiolare la pietra.",
                "Stringendo i denti sul dolore che brucia lungo la ferita aperta, lo stesso compagno si sporge più a fondo nella fenditura mentre gli altri lo reggono per la cintura e gli urlano di sbrigarsi. Il vapore bollente e i bordi seghettati della roccia scarnificano le nocche e il polso, ma la mano riesce ad agganciare uno scrigno semi-aperto carico di Scudi, tirandolo fuori tra gli schizzi roventi proprio mentre Alastorta geme nel delirio alle vostre spalle.",
                "Nonostante il braccio sanguini copiosamente e il vapore annebbi la vista, il prescelto tenta un ultimo, disperato affondo fino alla spalla mentre le pareti della crepa iniziano a richiudersi con un boato. Gli altri lo afferrano per le spalle pronti a tirarlo via: tra fitte atroci di calore e schegge conficcate nella pelle, riesce a strappare dal fondo un ultimo, ricchissimo mucchio d'oro e Scudi un istante prima che la fenditura si chiuda di schianto, troncando ogni altra possibilità di recupero."
            ]
        },
        "ponte_di_torri": {
            "title": "Il Ponte di Torri",
            "desc": "La strada principale davanti a voi è sprofondata nel vuoto. L'unico modo per passare portando con voi Alastorta — che proprio in quel momento rinviene brevemente, fissando con orrore il baratro sotto la spalla di Pancrazio prima di svenire di nuovo — è correre lungo il fusto di una torre astronomica abbattuta di traverso sopra la voragine, che sta scivolando centimetro dopo centimetro.",
            "ignoreText": "Rinunciate alla torre abbattuta e cercate un passaggio tra le case pericolanti del quartiere, perdendo minuti preziosi sul ciglio del baratro.",
            "successText": "Pancrazio e Temistocle spingono al massimo con la forza delle gambe correndo lungo la parete obliqua della torre e balzando sul bordo opposto un istante prima che la torre precipiti nel buio.",
            "failText": "La torre ruota su sé stessa a metà corsa; cadete pesantemente sul cornicione inferiore a ridosso del vuoto dovendo issare Alastorta e voi stessi con le unghie e con i denti.",
            "stat": "str",
            "cd": 9,
            "bonusEroi": { "temistocle_dignitas": 1, "pancrazio_dignitas": 1 },
            "reward": "balzo_dell_atani",
            "punishment": {
                "type": "injury",
                "name": "Sul cornicione a ridosso del vuoto",
                "desc": "Tutta la compagnia subisce 2 danni",
                "effects": [
                    { "effect": "party_damage", "val": 2 }
                ]
            }
        },
        "il_torrente": {
            "title": "Il Torrente",
            "desc": "Un'intera sezione della volta sopra il quartiere matematico cede trasformando il viale in un torrente impetuoso che trascina lastre di marmo verso il baratro. Dovete studiare rapidamente un sistema di funi e paranchi tra le colonne rimaste in piedi per traghettare Alastorta incosciente senza che l'acqua gelida gli strappi via le fasce runiche.",
            "ignoreText": "Risalite lentamente sui tetti a punta delle case laterali per scavalcare il torrente, allungando il giro.",
            "successText": "Temistocle tende una fune aerea tra due colonne mentre Ofelia assicura Alastorta: scivolate tutti sulla sponda asciutta senza che il Primarca tocchi l'acqua.",
            "failText": "Una colonna cede sotto la tensione della corda facendovi finire nella corrente gelida e sbattendovi contro i detriti prima che riusciate a rialzarvi.",
            "stat": "int",
            "cd": 9,
            "bonusEroi": { "temistocle_dignitas": 1, "ofelia_dignitas": 1 },
            "reward": "corde_d_ancoraggio",
            "punishment": {
                "type": "injury",
                "name": "Nella corrente gelida",
                "desc": "Tutta la compagnia subisce 2 danni",
                "effects": [
                    { "effect": "party_damage", "val": 2 }
                ]
            }
        },
        "arcate_pericolanti": {
            "title": "Le Arcate Pericolanti",
            "desc": "Per tagliare verso il settore dell'Anfiteatro passate attraverso la sala a volta consacrata agli antichi Atani che avevate incrociato all'andata: le arcate scricchiolano sotto il peso del lago e le icone si frantumano al suolo. Pancrazio, con la rabbia che si mescola alla disperazione per la sorte di suo padre, invoca a denti stretti gli Asi prima di correre sotto i massi, e Cassio e Ofelia trovano una sorta di pace nella solennità del luogo. Pandora apre la bocca per pronunciare una formula rituale propria degli Arvali, ma la voce le si spezza in gola senza alcun eco: in quell'istante la consapevolezza la colpisce come una lama. Gli Asi si sono voltati dall'altra parte molto tempo fa, stanchi di una custode della fede che portava il proprio titolo come un semplice fregio sull'armatura senza mai compierne davvero le opere; e Balinor, senza nemmeno avere la vista, lo aveva capito al primo incrocio delle loro lame.",
            "ignoreText": "Aggirate l'intero isolato passando tra le macerie esterne, sotto una pioggia incessante di schegge.",
            "successText": "Avanzate con passo fermo e lucido sotto le arcate che cedono appena alle vostre spalle, uscendo indenni sul viale verso l'Anfiteatro.",
            "failText": "Un'arcata crolla davanti a voi costringendovi a un balzo disperato tra la polvere e le schegge di pietra.",
            "stat": "fth",
            "cd": 9,
            "bonusEroi": { "cassio_dignitas": 1, "pancrazio_dignitas": 1, "pandora_dignitas": -1 },
            "reward": "sigillo_dell_equilibrio",
            "punishment": {
                "type": "injury",
                "name": "Tra polvere e schegge",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "vortice_dell_anfiteatro": {
            "title": "Il Vortice dell'Anfiteatro",
            "desc": "Passate sul bordo superiore dell'Anfiteatro in rovina: l'intera arena sottostante è ormai un enorme bacino d'acqua vorticosa che risucchia colonne e gradinate di marmo verso una voragine sul fondo, e il sentiero su cui correte sta franando dentro il gorgo. Ofelia assicura in fretta una fune attorno al petto di Alastorta svenuto mentre Cassio e Pandora cercano un appiglio solido, ma la corrente che straripa sul camminamento è così violenta che solo la pura forza delle braccia di Temistocle e Pancrazio può tenere tese le corde contro il risucchio dell'abisso.",
            "ignoreText": "Vi arrampicate lungo le arcate esterne più alte dell'anfiteatro, lontano dal bordo dell'acqua ma esposti alla caduta di stalattiti dalla volta.",
            "successText": "Piantando gli stivali nelle crepe del marmo, tendete le funi con forza inarrestabile contro il vortice: mentre Alastorta ha un breve sussulto febbrile appeso sopra la schiuma, riuscite a farlo scorrere oltre il tratto franato e a balzare tutti al sicuro sul lato opposto senza rallentare.",
            "failText": "La forza del gorgo vi strappa la presa sulle funi e finite in acqua ai margini della voragine; con i muscoli in fiamme dovete lottare contro la corrente tenendo la testa di Alastorta fuori dall'acqua fino a riguadagnare la riva.",
            "stat": "str",
            "cd": 9,
            "bonusEroi": { "temistocle_dignitas": 1, "pancrazio_dignitas": 1, "ofelia_dignitas": 1 },
            "reward": "imbracatura_di_salvataggio",
            "punishment": {
                "type": "injury",
                "name": "Ai margini del gorgo",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "scalinate_che_sprofondano": {
            "title": "Le Scalinate che Sprofondano",
            "desc": "Siete in vista della fenditura rocciosa che conduce fuori da Loch Ein, ma le lunghe scalinate a spirale in marmo si stanno spezzando in tronconi mentre la città sprofonda definitivamente nel vuoto. Pancrazio stringe suo padre al petto e invoca gli Asi prima del balzo; Pandora guarda invece il salto con semplice razionalità, stringendo i denti senza che nessun nome sacro le attraversi il pensiero.",
            "ignoreText": "Abbandonate le scale e scalate direttamente la parete rocciosa grezza della caverna a mani nude.",
            "successText": "Saltate da un gradino crollante all'altro in una corsa mozzafiato contro la gravità, raggiungendo il cornicione di roccia della caverna superiore all'ultimo secondo.",
            "failText": "L'ultimo gradino si polverizza sotto la vostra spinta; battete violentemente il petto contro il bordo di roccia dell'uscita, dovendo issarvi a fatica mentre sotto di voi tutto scompare nel buio.",
            "stat": "fth",
            "cd": 9,
            "bonusEroi": { "temistocle_dignitas": 1, "alastorta_dignitas": 1 },
            "reward": "grazia_degli_atani",
            "punishment": {
                "type": "injury",
                "name": "Il petto contro la roccia",
                "desc": "Tutta la compagnia subisce 2 danni",
                "effects": [
                    { "effect": "party_damage", "val": 2 }
                ]
            }
        },
        "pioggia_di_stalattiti_e_cristalli": {
            "title": "La Pioggia di Stalattiti e Cristalli",
            "desc": "Lasciate alle spalle la visione di Loch Ein che si inabissa per sempre e rientrate nelle grotte naturali di calcite, aragonite e pirite, anch'esse scosse da continui terremoti. Le scosse telluriche stanno facendo staccare dal soffitto della caverna le pesanti stalattiti e i blocchi di pirite dorata. Il tunnel che porta verso la caverna con la sacca d'aria è un campo minato di rocce cadenti.",
            "ignoreText": "Procedete a sbalzi fermandovi sotto ogni arco naturale di roccia solida, impiegando molto più tempo mentre l'acqua sale alle caviglie.",
            "successText": "Leggete le vibrazioni della roccia grazie alla risonanza della Pietra di Volta e correte a zig-zag evitando ogni singolo crollo.",
            "failText": "Una stalattite si schianta a un passo da voi, investendovi con una pioggia di schegge minerali taglienti come rasoi.",
            "stat": "int",
            "cd": 9,
            "bonusEroi": { "temistocle_dignitas": 1, "ofelia_dignitas": 1, "cassio_dignitas": 1 },
            "reward": "frammenti_pirite_risonante",
            "punishment": {
                "type": "injury",
                "name": "Schegge minerali",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "attrezzature_subacquee_sepolte": {
            "title": "Le Attrezzature Subacquee Sepolte",
            "desc": "Arrivate al punto in cui avevate lasciato la campana subacquea di botti rinforzate e le scorte di sacchi di vino pieni d'aria per la risalita, ma parte della parete è franata sopra l'equipaggiamento e l'acqua sta già sommergendo la riva interna. Recuperare la campana rinforzata è vitale soprattutto per trasportare in superficie Alastorta privo di sensi, incapace di nuotare da solo con i sacchi d'aria.",
            "ignoreText": "Rinunciate a diseppellire la campana pesante e afferrate solo i pochi sacchi d'aria rimasti in superficie per tentare la risalita a nuoto.",
            "successText": "Liberate rapidamente i sacchi d'aria e rimettete in asse la botte rinforzata prima che l'acqua sommerga la banchina di roccia.",
            "failText": "Nel tentativo di spostare i massi sotto l'acqua che sale, alcuni sacchi d'aria si squarciano e rimanete feriti alle mani dalle pietre taglienti.",
            "stat": "str",
            "cd": 9,
            "bonusEroi": { "temistocle_dignitas": 1, "pancrazio_dignitas": 1 },
            "reward": "campana_subacquea_rinforzata",
            "punishment": {
                "type": "injury",
                "name": "Mani tagliate dalle pietre",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        }
    },
    "merchants": {
        "default": "Un mercante di passaggio vi mostra la sua merce.",
        "studioso_isolato": "Risalendo oltre i vestiboli inferiori, individuate una nicchia laterale dove si è rifugiato un anziano epigrafista di Foscoclivo, ferito e abbandonato indietro dalla spedizione de \"gli Otto\" mentre il soffitto iniziava a tremare. Vedendo Alastorta livido e scosso da brividi febbrili tra le braccia di Pancrazio — che gli punta la lama alla gola con furia a stento trattenuta — l'uomo svende immediatamente i suoi elisir e le sue erbe rare: Ofelia e Cassio ne approfittano subito per mescolare un primo unguento freddo da spalmare sui polsi anneriti del Primarca.",
        "artefice_imprigionato": "In una sala laterale del passaggio incontrate di nuovo il cercatore rimasto intrappolato nella stasi da una ventina d'anni dopo il Disastro del 178 d.F.: ora che la bolla è morta, l'uomo guarda con orrore i propri capelli incanutire e le mani raggrinzirsi a vista d'occhio. Disperato e deciso solo a risalire prima di finire schiacciato, rovescia a terra il proprio sacco per svendervi le sue ultime fiale e reliquie. Tra i suoi averi rotola una spilla d'oro bianco incastonata di gemme astrali intatte: quel bagliore richiama subito alla mente di Ofelia il colloquio avuto con suo padre Glauco prima di lasciare la Malacorte. L'Autarca le aveva concesso l'autorizzazione a unirsi a questa spedizione a due condizioni inderogabili: non tornare a mani vuote — riportando gioielli preziosi e rari degni del tesoro di Iperione e della Famiglia — e dimostrare senza ombra di dubbio la propria superiorità rispetto agli altri cugini, perché nel Ramo di Iperione non c'è spazio per la mediocrità.",
        "saccheggiatore_disperato": "Sotto un portico inclinato dei quartieri accademici incontrate per l'ultima volta il contrabbandiere-esploratore carico di bottino che non riesce a correre per il troppo peso. Pur di alleggerirsi e salvare la pelle prima che Loch Ein sprofondi nel nulla, svende tutto ciò che gli resta in pochi istanti concitati — compresi balsami e fiale che Ofelia afferra subito per alleviare la febbre del Primarca."
    },
    "rests": {
        "default": "Trovate un angolo riparato e riposate qualche ora.",
        "camera_fuori_dal_tempo": "Trovate una piccola stanza in cui un residuo della bolla temporale regge ancora in una quiete che sembra irreale: la polvere resta sospesa a mezz'aria e il boato dell'acqua che invade i livelli inferiori arriva appena attutito. Ne approfittate per posare Alastorta a terra: Ofelia e Cassio pestano erbe alchemiche e olio minerale per preparare un unguento e placare gli spasmi che scuotono il Primarca, mentre Pancrazio stringe i denti, furioso per la propria impotenza dinanzi al veleno. Mentre Temistocle veglia sulla soglia, Pandora resta in disparte, sfiorando distrattamente il segno del proprio ruolo di Arvale. Sulle prime tenta di attribuire quel silenzio gelido dentro di sé alla vicinanza dell'Yrtite o al crollo del limbo; ma un pensiero scomodo si fa strada: quel vuoto non è nato oggi. È lo stesso silenzio opaco che la circonda da molto prima che rimetteste piede a Loch Ein.",
        "la_nicchia": "Prima di sfondare l'uscita verso la Sala del Consiglio, vi concedete pochi minuti di respiro in una nicchia scavata nella roccia. Alastorta rinviene tossendo con le labbra cineree, la fronte bollente e il braccio solcato da venature scure che salgono verso la spalla: Ofelia e Cassio gli applicano un unguento lenitivo di erbe e sali alchemici sulle bruciature delle rune per placare il dolore, mentre Temistocle piazza delle esche all'imbocco del tunnel per prevenire imboscate e Pancrazio stringe l'elsa col volto deformato dalla rabbia. Quando Cassio traccia un breve segno rituale per invocare la protezione degli Asi sul Primarca che ricade nel torpore, Pandora abbassa lo sguardo sulle proprie mani. Non è l'Yrtite ad averle reso la lingua pesante: la verità inizia a delinearsi con chiarezza spietata. Che li si chiami Asi al Nord, Atani nella Lega o Aine a Foscoclivo, sono sempre le stesse potenze — e lei, che dovrebbe far della fede la propria missione di vita come Arvale, si è accontentata dell'onore e del peso politico di quel titolo lasciando inaridire ogni devozione.",
        "portico_crollato": "Ai piedi della scalinata del Palazzo, sul bordo della Grande Piazza Circolare che scricchiola, trovate un angolo sotto un arco di marmo crollato di traverso. Alastorta ha un breve sussulto e apre gli occhi, mormorando a fatica prima di ricadere nell'incoscienza. Attorno a lui la tensione incrina la freddezza del gruppo: Pancrazio stringe l'elsa divorato dalla rabbia, le mani di Cassio tremano per l'ansia mentre porge le fiale, Pandora resta chiusa nel proprio silenzio e Temistocle fissa teso le crepe della piazza. È solo Ofelia a mantenere le dita ferme mentre stende l'unguento alchemico sulle bruciature del Primarca. Osservando le reazioni dei propri cugini, le risuona in testa il motto del suo ceppo, insieme al patto stretto con suo padre Glauco: dovrà uscire da questo abisso con gioielli rari da posare sul tavolo della Malacorte, certo, ma soprattutto facendo pesare su ogni cugino l'evidenza di chi abbia tenuto la mente più lucida e superiore nel momento del collasso.",
        "loggia_delle_guardie": "Vi rifugiate per pochi minuti nell'antico corpo di guardia sul margine della scalinata, al riparo dalla pioggia di detriti. Mentre Ofelia e Cassio fasciano le braccia di Alastorta con un nuovo impacco e Temistocle studia il crollo della Grande Piazza oltre il varco, Pancrazio cammina avanti e indietro furibondo, pronto ad avventarsi sul primo ostacolo. In un angolo, Pandora fissa un vecchio bassorilievo degli Atani spaccato a metà e finalmente smette di mentire a sé stessa. L'indifferenza che prova davanti al sacro non è un maleficio di Loch Ein né un riflesso del cristallo: gli Asi l'hanno già lasciata da tempo. Quando Balinor la risparmiò due anni fa, non fu per una qualche sorta di clemenza, ma per costringerla a guardarsi dentro: le aveva fatto capire che invocare il nome degli Atani o degli Asi con la bocca di un'Arvale che non vive più secondo il proprio voto è soltanto una farsa indegna.",
        "cupola_d_aria": "Mentre attorno a voi i quartieri di Loch Ein scivolano verso l'abisso, trovate un massiccio edificio a volta costruito dagli antichi Atani che resiste ancora all'urto dei crolli. All'interno si è creata una sacca asciutta: Alastorta ha uno spasmo violento e rinviene per un breve, straziante istante, il respiro febbrile e corto, mentre il veleno violaceo dell'Yrtite divora le rune sulla sua pelle. Ofelia e Cassio si affrettano a spalmare un unguento lenitivo sulle bruciature e a ricalcare i glifi prima che il Primarca perda di nuovo i sensi, sotto lo sguardo teso e colmo d'ira di Pancrazio.",
        "sacca_d_aria_superiore": "Raggiungete la parte più alta della caverna naturale prima del passaggio sottomarino, dove una cupola granitica regge ancora perfettamente. Alastorta rinviene per qualche minuto con il volto cinereo e imperlato di sudore freddo, stringendo i denti mentre le rune di Loch Ein sul suo corpo sono ormai quasi del tutto annerite dal veleno dell'Yrtite. Ofelia e Cassio spalmano rapidamente l'ultimo unguento rinfrescante sulle sue ferite per placarne il dolore lancinante finché il Primarca non ricade in un sonno pesante; accanto a loro, Pancrazio affila la lama con uno sguardo carico d'ira.",
        "roccia_dell_immersione": "La caverna dietro di voi sta crollando definitivamente e davanti resta solo il passaggio sottomarino verso il Lago di Loch Ein. Su uno sperone di roccia ancora emerso controllate i sacchi d'aria, mentre Ofelia e Cassio fanno scivolare le ultime gocce di un elisir lenitivo tra le labbra di Alastorta — che si agita nel torpore mentre le rune cedono una dopo l'altra al veleno del cristallo. Proprio sul varco d'acqua, però, avvertite una presenza antica, oscura e immensa che vi attende nell'ombra.",
        "arco_di_calcite": "Sotto un solido arco di calcite a ridosso del passaggio sottomarino, Alastorta apre gli occhi per un ultimo istante lucido prima di svenire di nuovo, sussurrando a Pancrazio di non voltarsi indietro qualsiasi cosa accada. Ofelia e Cassio stendono l'ultimo strato di unguento sulle bruciature ormai estese fino alla spalla del Primarca, mentre Temistocle e Pancrazio controllano i sacchi d'aria. Quando i vostri cugini chinano per un solo secondo il capo invocando Draken e gli Asi prima dell'immersione, Pandora non ci prova nemmeno più. Tiene lo sguardo fisso sull'acqua nera e stringe l'asta dell'alabarda: sa ormai senza più ombre di dubbio di non essere degna di chiamare a testimone né gli Asi né gli Atani, e che la lezione lasciatale da Balinor due anni fa era una sentenza già scritta molto prima che l'Yrtite venisse toccata. Proprio in quel momento, dal pelo dell'acqua si leva una presenza antica e famelica."
    },
    "treasures": {},
    "stories": {
        "grande_piazza_circolare": {
            "title": "La Grande Piazza Circolare",
            "text": "Mentre attraversate il cuore della Grande Piazza Circolare, l'intera città inclinata cede definitivamente e inizia a scivolare nell'abisso."
        }
    },
    "lootItems": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "ankh_pellegrino", "bastone_eremita", "balsamo_curativo", "spada_norgrad", "alabarda_guardia", "mannaia_pesante", "scudo_ferro", "corazza_scaglie", "tomo_proibito", "reliquiario_tascabile", "martello_consacrato", "brigantina_benedetta", "stocco_duellante", "pozione_rigenerazione", "unguento_fortificante", "lama_acciaio_lunare", "martello_breccia", "gorgiera_veterano", "corazza_piastre_leone", "cappa_sussurri", "simbolo_jag_antar", "scettro_savio", "corona_martire", "elisir_sangue_vivo", "olio_bollente", "bomba_acido", "cristallo_flammaurea", "grappa_soldato", "infuso_corteccia", "olio_da_lama", "pozione_pelle_pietra", "elisir_berserker", "corno_allman", "ascia_primo_sangue", "mazza_boia_seistad", "scudo_spina_kranen", "catena_ghiacceterno", "talismano_corvo", "mappa_contrabbandiere", "dado_osso_gunnar", "lingua_argento", "occhio_gazza", "coperta_rurikstad", "erbario_fonnish", "spadone_primo_sangue", "ascia_carnefice_glostok", "pugnale_succhiasangue", "lama_ghiaccio_hvid", "corazza_ultimo_baluardo", "spada_affilata", "ascia_pesante", "armatura_leggera_loot", "armatura_pesante_loot", "pozione", "amuleto", "anello", "scudo_pesante", "stilo_da_battaglia", "turibolo_ferrato", "rosario_del_pellegrino", "bastone_runico_del_dotto", "mazza_votiva", "scudo_del_sacerdote", "astrolabio_tattico", "guanti_runici_erudito", "bastone_dei_giusti"],
    "mapNodes": [
        { "id": 0, "level": 0, "x": 330, "type": "combat", "title": "Livello 1 - Le Ombre del Sigillo", "icon": "🗡️", "done": false, "active": true, "next": [2, 3], "image": "immagini/loch_ein_parte_3/1a_le_ombre_del_sigillo.webp", "enemy": "ombre_del_sigillo" },
        {
            "id": 1,
            "level": 0,
            "x": 550,
            "type": "challenge",
            "title": "Livello 1 - Il Crollo del Salone delle Risposte",
            "icon": "❓",
            "done": false,
            "active": true,
            "next": [3, 4],
            "image": "immagini/loch_ein_parte_3/1b_il_crollo_del_salone_delle_risposte.webp",
            "challengeId": "crollo_salone_delle_risposte"
        },
        {
            "id": 2,
            "level": 1,
            "x": 220,
            "type": "combat",
            "title": "Livello 2 - Le Sentinelle dei Bassorilievi",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [5],
            "image": "immagini/loch_ein_parte_3/2a_le_sentinelle_dei_bassorilievi.webp",
            "enemy": "sentinelle_della_porta"
        },
        {
            "id": 3,
            "level": 1,
            "x": 440,
            "type": "challenge",
            "title": "Livello 2 - La Porta Monumentale",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [5, 6],
            "image": "immagini/loch_ein_parte_3/2b_la_porta_monumentale.webp",
            "challengeId": "porta_monumentale"
        },
        { "id": 4, "level": 1, "x": 660, "type": "combat", "title": "Livello 2 - Le Creature del Cristallo", "icon": "🗡️", "done": false, "active": false, "next": [6], "image": "", "enemy": "creature_del_cristallo" },
        { "id": 5, "level": 2, "x": 330, "type": "merchant", "title": "Livello 3 - Lo Studioso Isolato", "icon": "🪙", "done": false, "active": false, "next": [7, 8], "image": "immagini/loch_ein_parte_3/3a_lo_studioso_isolato.webp", "merchantId": "studioso_isolato" },
        {
            "id": 6,
            "level": 2,
            "x": 550,
            "type": "combat",
            "title": "Livello 3 - I Divoratori di Essenze",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [8, 9],
            "image": "immagini/loch_ein_parte_3/3b_i_divoratori_di_essenze.webp",
            "enemy": "divoratori_di_essenze"
        },
        {
            "id": 7,
            "level": 3,
            "x": 220,
            "type": "challenge",
            "title": "Livello 4 - Le Sacche Temporali Impazzite",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [10],
            "image": "immagini/loch_ein_parte_3/4a_le_sacche_temporali_impazzite.webp",
            "challengeId": "anomalia_temporale"
        },
        {
            "id": 8,
            "level": 3,
            "x": 440,
            "type": "rest",
            "title": "Livello 4 - La Camera fuori dal Tempo",
            "icon": "⛺",
            "done": false,
            "active": false,
            "next": [10, 11],
            "image": "immagini/loch_ein_parte_3/4b_la_camera_fuori_dal_tempo.webp",
            "restId": "camera_fuori_dal_tempo"
        },
        {
            "id": 9,
            "level": 3,
            "x": 660,
            "type": "combat",
            "title": "Livello 4 - I Silfidi Eterei del Limbo",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [11],
            "image": "immagini/loch_ein_parte_3/4c_i_silfidi_eterei_del_limbo.webp",
            "enemy": "silfidi_eterei_del_limbo"
        },
        {
            "id": 10,
            "level": 4,
            "x": 330,
            "type": "elite",
            "title": "Livello 5 - I Guerrieri Senza Tempo",
            "icon": "👹",
            "done": false,
            "active": false,
            "next": [12, 13],
            "image": "immagini/loch_ein_parte_3/5a_i_guerrieri_senza_tempo.webp",
            "enemy": "guerrieri_senza_tempo"
        },
        {
            "id": 11,
            "level": 4,
            "x": 550,
            "type": "challenge",
            "title": "Livello 5 - La Visione del Disastro",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [13, 14],
            "image": "immagini/loch_ein_parte_3/5b_la_visione_del_disastro.webp",
            "challengeId": "visione_del_disastro"
        },
        {
            "id": 12,
            "level": 5,
            "x": 220,
            "type": "combat",
            "title": "Livello 6 - La Progenie Corrotta delle Profondità",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [15],
            "image": "immagini/loch_ein_parte_3/6a_la_progenie_corrotta_delle_profondita.webp",
            "enemy": "progenie_corrotta_profondita"
        },
        { "id": 13, "level": 5, "x": 440, "type": "combat", "title": "Livello 6 - Le Ombre Affamate", "icon": "🗡️", "done": false, "active": false, "next": [15, 16], "image": "immagini/loch_ein_parte_3/6b_le_ombre_affamate.webp", "enemy": "ombre_affamate" },
        {
            "id": 14,
            "level": 5,
            "x": 660,
            "type": "challenge",
            "title": "Livello 6 - Il Fiume d'Energia",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [16],
            "image": "immagini/loch_ein_parte_3/6c_il_fiume_d_energia.webp",
            "challengeId": "fiume_d_energia_sotterraneo"
        },
        {
            "id": 15,
            "level": 6,
            "x": 330,
            "type": "challenge",
            "title": "Livello 7 - Le Trappole Riattivate",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [17, 18],
            "image": "immagini/loch_ein_parte_3/7a_le_trappole_riattivate.webp",
            "challengeId": "trappole_dei_firmamentisti"
        },
        {
            "id": 16,
            "level": 6,
            "x": 550,
            "type": "merchant",
            "title": "Livello 7 - L'Artefice Imprigionato",
            "icon": "🪙",
            "done": false,
            "active": false,
            "next": [18, 19],
            "image": "immagini/loch_ein_parte_3/7b_l_artefice_imprigionato.webp",
            "merchantId": "artefice_imprigionato"
        },
        { "id": 17, "level": 7, "x": 220, "type": "combat", "title": "Livello 8 - I Superstiti di Foscoclivo in Fuga", "icon": "🗡️", "done": false, "active": false, "next": [20], "image": "", "enemy": "superstiti_di_foscoclivo" },
        { "id": 18, "level": 7, "x": 440, "type": "rest", "title": "Livello 8 - La Nicchia", "icon": "⛺", "done": false, "active": false, "next": [20, 21], "image": "immagini/loch_ein_parte_3/8b_la_nicchia.webp", "restId": "la_nicchia" },
        {
            "id": 19,
            "level": 7,
            "x": 660,
            "type": "elite",
            "title": "Livello 8 - Gli Ultimi Emissari degli Otto",
            "icon": "👹",
            "done": false,
            "active": false,
            "next": [21],
            "image": "immagini/loch_ein_parte_3/8c_gli_ultimi_emissari_degli_otto.webp",
            "enemy": "rituale_di_anoeth"
        },
        {
            "id": 20,
            "level": 8,
            "x": 330,
            "type": "challenge",
            "title": "Livello 9 - La Biblioteca in Fiamme",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [22, 23],
            "image": "immagini/loch_ein_parte_3/9a_la_biblioteca_in_fiamme.webp",
            "challengeId": "biblioteca_in_fiamme"
        },
        {
            "id": 21,
            "level": 8,
            "x": 550,
            "type": "combat",
            "title": "Livello 9 - I Custodi della Biblioteca",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [23, 24],
            "image": "immagini/loch_ein_parte_3/9b_i_custodi_della_biblioteca.webp",
            "enemy": "custodi_sala_circolare"
        },
        {
            "id": 22,
            "level": 9,
            "x": 220,
            "type": "combat",
            "title": "Livello 10 - Il Crollo delle Colonne d'Ingresso",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [25],
            "image": "immagini/loch_ein_parte_3/10a_il_crollo_delle_colonne_d_ingresso.webp",
            "enemy": "crollo_delle_colonne"
        },
        {
            "id": 23,
            "level": 9,
            "x": 440,
            "type": "challenge",
            "title": "Livello 10 - La Caduta dell'Architrave",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [25, 26],
            "image": "immagini/loch_ein_parte_3/10b_la_caduta_dell_architrave.webp",
            "challengeId": "caduta_dell_architrave"
        },
        { "id": 24, "level": 9, "x": 660, "type": "combat", "title": "Livello 10 - Le Bestie in Fuga", "icon": "🗡️", "done": false, "active": false, "next": [26], "image": "immagini/loch_ein_parte_3/10c_le_bestie_in_fuga.webp", "enemy": "bestie_in_fuga_dall_abisso" },
        { "id": 25, "level": 10, "x": 330, "type": "elite", "title": "Livello 11 - Il Colosso di Macerie", "icon": "👹", "done": false, "active": false, "next": [27], "image": "immagini/loch_ein_parte_3/11a_il_colosso_di_macerie.webp", "enemy": "colosso_di_macerie" },
        {
            "id": 26,
            "level": 10,
            "x": 550,
            "type": "elite",
            "title": "Livello 11 - Il Vendicatore della Retroguardia",
            "icon": "👹",
            "done": false,
            "active": false,
            "next": [28],
            "image": "immagini/loch_ein_parte_3/11b_il_vendicatore_della_retroguardia.webp",
            "enemy": "il_vendicatore"
        },
        { "id": 27, "level": 11, "x": 330, "type": "rest", "title": "Livello 12 - Il Portico Crollato", "icon": "⛺", "done": false, "active": false, "next": [29], "image": "immagini/loch_ein_parte_3/12a_il_portico_crollato.webp", "restId": "portico_crollato" },
        {
            "id": 28,
            "level": 11,
            "x": 550,
            "type": "rest",
            "title": "Livello 12 - La Loggia delle Guardie",
            "icon": "⛺",
            "done": false,
            "active": false,
            "next": [29],
            "image": "immagini/loch_ein_parte_3/12b_la_loggia_delle_guardie.webp",
            "restId": "loggia_delle_guardie"
        },
        {
            "id": 29,
            "level": 12,
            "x": 440,
            "type": "story",
            "title": "Livello 13 - La Grande Piazza Circolare",
            "icon": "📜",
            "done": false,
            "active": false,
            "next": [30, 31, 32],
            "image": "immagini/loch_ein_parte_3/13a_la_grande_piazza_circolare.webp",
            "storyId": "grande_piazza_circolare"
        },
        {
            "id": 30,
            "level": 13,
            "x": 220,
            "type": "challenge",
            "title": "Livello 14 - La Statua del Sovrano",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [33],
            "image": "immagini/loch_ein_parte_3/14a_la_statua_del_sovrano.webp",
            "challengeId": "caduta_della_statua"
        },
        {
            "id": 31,
            "level": 13,
            "x": 440,
            "type": "combat",
            "title": "Livello 14 - Gli Abomini della Piazza",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [33, 34],
            "image": "immagini/loch_ein_parte_3/14b_gli_abomini_della_piazza.webp",
            "enemy": "abomini_della_piazza"
        },
        { "id": 32, "level": 13, "x": 660, "type": "challenge", "title": "Livello 14 - La Fenditura del Tesoro", "icon": "❓", "done": false, "active": false, "next": [34], "image": "", "challengeId": "fenditura_del_tesoro" },
        {
            "id": 33,
            "level": 14,
            "x": 330,
            "type": "combat",
            "title": "Livello 15 - I Tessitori del Buio",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [35, 36],
            "image": "immagini/loch_ein_parte_3/15a_i_tessitori_del_buio.webp",
            "enemy": "tessitori_del_buio"
        },
        {
            "id": 34,
            "level": 14,
            "x": 550,
            "type": "combat",
            "title": "Livello 15 - I Cavalcantici Intrappolati",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [36, 37],
            "image": "immagini/loch_ein_parte_3/15b_i_cavalcantici_intrappolati.webp",
            "enemy": "cavalcantici_intrappolati"
        },
        { "id": 35, "level": 15, "x": 220, "type": "challenge", "title": "Livello 16 - Il Ponte di Torri", "icon": "❓", "done": false, "active": false, "next": [38], "image": "immagini/loch_ein_parte_3/16a_il_ponte_di_torri.webp", "challengeId": "ponte_di_torri" },
        {
            "id": 36,
            "level": 15,
            "x": 440,
            "type": "merchant",
            "title": "Livello 16 - Il Saccheggiatore Disperato",
            "icon": "🪙",
            "done": false,
            "active": false,
            "next": [38, 39],
            "image": "immagini/loch_ein_parte_3/16b_il_saccheggiatore_disperato.webp",
            "merchantId": "saccheggiatore_disperato"
        },
        { "id": 37, "level": 15, "x": 660, "type": "combat", "title": "Livello 16 - I Predatori delle Acque", "icon": "🗡️", "done": false, "active": false, "next": [39], "image": "", "enemy": "predatori_delle_acque" },
        { "id": 38, "level": 16, "x": 330, "type": "elite", "title": "Livello 17 - Il Campione Corrotto", "icon": "👹", "done": false, "active": false, "next": [40, 41], "image": "immagini/loch_ein_parte_3/17a_il_campione_corrotto.webp", "enemy": "campione_corrotto" },
        { "id": 39, "level": 16, "x": 550, "type": "challenge", "title": "Livello 17 - Il Torrente", "icon": "❓", "done": false, "active": false, "next": [41, 42], "image": "immagini/loch_ein_parte_3/17b_il_torrente.webp", "challengeId": "il_torrente" },
        {
            "id": 40,
            "level": 17,
            "x": 220,
            "type": "challenge",
            "title": "Livello 18 - Le Arcate Pericolanti",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [43],
            "image": "immagini/loch_ein_parte_3/18a_le_arcate_pericolanti.webp",
            "challengeId": "arcate_pericolanti"
        },
        {
            "id": 41,
            "level": 17,
            "x": 440,
            "type": "combat",
            "title": "Livello 18 - L'Orda dei Senza Pace",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [43, 44],
            "image": "immagini/loch_ein_parte_3/18b_l_orda_dei_senza_pace.webp",
            "enemy": "orda_dei_senza_pace"
        },
        { "id": 42, "level": 17, "x": 660, "type": "rest", "title": "Livello 18 - La Cupola d'Aria", "icon": "⛺", "done": false, "active": false, "next": [44], "image": "immagini/loch_ein_parte_3/18c_la_cupola_d_aria.webp", "restId": "cupola_d_aria" },
        { "id": 43, "level": 18, "x": 330, "type": "combat", "title": "Livello 19 - Le Acque Nere", "icon": "🗡️", "done": false, "active": false, "next": [45, 46], "image": "immagini/loch_ein_parte_3/19a_le_acque_nere.webp", "enemy": "acque_nere" },
        {
            "id": 44,
            "level": 18,
            "x": 550,
            "type": "challenge",
            "title": "Livello 19 - Il Vortice dell'Anfiteatro",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [46, 47],
            "image": "immagini/loch_ein_parte_3/19b_il_vortice_dell_anfiteatro.webp",
            "challengeId": "vortice_dell_anfiteatro"
        },
        { "id": 45, "level": 19, "x": 220, "type": "combat", "title": "Livello 20 - Lo Stormo nel Panico", "icon": "🗡️", "done": false, "active": false, "next": [48], "image": "immagini/loch_ein_parte_3/20a_lo_stormo_nel_panico.webp", "enemy": "stormo_nel_panico" },
        {
            "id": 46,
            "level": 19,
            "x": 440,
            "type": "challenge",
            "title": "Livello 20 - Le Scalinate che Sprofondano",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [48, 49],
            "image": "immagini/loch_ein_parte_3/20b_le_scalinate_che_sprofondano.webp",
            "challengeId": "scalinate_che_sprofondano"
        },
        {
            "id": 47,
            "level": 19,
            "x": 660,
            "type": "elite",
            "title": "Livello 20 - L'Abominio della Voragine",
            "icon": "👹",
            "done": false,
            "active": false,
            "next": [49],
            "image": "immagini/loch_ein_parte_3/20c_l_abominio_della_voragine.webp",
            "enemy": "abominio_della_voragine"
        },
        {
            "id": 48,
            "level": 20,
            "x": 330,
            "type": "challenge",
            "title": "Livello 21 - La Pioggia di Stalattiti e Cristalli",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [50, 51],
            "image": "immagini/loch_ein_parte_3/21a_la_pioggia_di_stalattiti_e_cristalli.webp",
            "challengeId": "pioggia_di_stalattiti_e_cristalli"
        },
        {
            "id": 49,
            "level": 20,
            "x": 550,
            "type": "combat",
            "title": "Livello 21 - La Furia dei Terrigeni",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [51, 52],
            "image": "immagini/loch_ein_parte_3/21b_la_furia_dei_terrigeni.webp",
            "enemy": "furia_dei_terrigeni"
        },
        {
            "id": 50,
            "level": 21,
            "x": 220,
            "type": "combat",
            "title": "Livello 22 - Gli Spettri dell'Acqua",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [53],
            "image": "immagini/loch_ein_parte_3/22a_gli_spettri_dell_acqua.webp",
            "enemy": "spettri_dell_acqua"
        },
        {
            "id": 51,
            "level": 21,
            "x": 440,
            "type": "rest",
            "title": "Livello 22 - La Sacca d'Aria Superiore",
            "icon": "⛺",
            "done": false,
            "active": false,
            "next": [53, 54],
            "image": "immagini/loch_ein_parte_3/22b_la_sacca_d_aria_superiore.webp",
            "restId": "sacca_d_aria_superiore"
        },
        {
            "id": 52,
            "level": 21,
            "x": 660,
            "type": "challenge",
            "title": "Livello 22 - Le Attrezzature Subacquee Sepolte",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [54],
            "image": "immagini/loch_ein_parte_3/22c_le_attrezzature_subacquee_sepolte.webp",
            "challengeId": "attrezzature_subacquee_sepolte"
        },
        {
            "id": 53,
            "level": 22,
            "x": 330,
            "type": "elite",
            "title": "Livello 23 - L'Ultima Guardia del Cenn",
            "icon": "👹",
            "done": false,
            "active": false,
            "next": [55],
            "image": "immagini/loch_ein_parte_3/23a_l_ultima_guardia_del_cenn.webp",
            "enemy": "ultima_guardia_del_cenn"
        },
        {
            "id": 54,
            "level": 22,
            "x": 550,
            "type": "combat",
            "title": "Livello 23 - Il Ritorno delle Mantombre",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [56],
            "image": "immagini/loch_ein_parte_3/23b_il_ritorno_delle_mantombre.webp",
            "enemy": "ritorno_delle_mantombre"
        },
        { "id": 55, "level": 23, "x": 330, "type": "rest", "title": "Livello 24 - La Roccia dell'Immersione", "icon": "⛺", "done": false, "active": false, "next": [57], "image": "", "restId": "roccia_dell_immersione" },
        { "id": 56, "level": 23, "x": 550, "type": "rest", "title": "Livello 24 - L'Arco di Calcite", "icon": "⛺", "done": false, "active": false, "next": [57], "image": "immagini/loch_ein_parte_3/24b_l_arco_di_calcite.webp", "restId": "arco_di_calcite" },
        {
            "id": 57,
            "level": 24,
            "x": 440,
            "type": "combat",
            "title": "Livello 25 - Il Banchetto dell'Ombra e il Traditore di Anoeth",
            "icon": "👑",
            "done": false,
            "active": false,
            "next": [],
            "image": "immagini/loch_ein_parte_3/25a_il_banchetto_dell_ombra_e_il_traditore_di_anoeth.webp",
            "enemy": "emrys_e_l_entita_affamata"
        }
    ]
};
