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
    "description": "Oltre la porta di bronzo del Palazzo dei Firmamentisti: la Biblioteca, il passaggio segreto, il Salone delle Risposte e l'Yrtite. Poi la fuga, mentre Loch Ein sprofonda e il lago reclama la città.",
    "coverImage": "immagini/rovine_di_loch_ein_e_scudo_dignitas.webp",
    "introText": "Sconfitto Eldric sulla soglia del Palazzo dei Firmamentisti, varcate la grande porta di bronzo. Oltre la Biblioteca e il passaggio segreto vi attende il Salone delle Risposte, dove splende l'Yrtite: chi la prenderà dovrà portarla fuori prima che Loch Ein crolli.",
    "heroes": ["alastorta_dignitas", "pancrazio_dignitas", "cassio_dignitas", "ofelia_dignitas", "pandora_dignitas", "temistocle_dignitas"],
    "initialArmory": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "balsamo_curativo", "stilo_da_battaglia", "turibolo_ferrato", "rosario_del_pellegrino"],
    "challenges": {
        "scaffali_della_biblioteca": {
            "title": "Gli Scaffali della Biblioteca",
            "desc": "Varcata la grande porta di bronzo del Palazzo, entrate nella vasta sala circolare del Consiglio e della Biblioteca, dove scaffali colmi di pergamene si innalzano fino al soffitto inclinato. Cassio indica agli altri il tavolo di pietra su cui, oltre due anni fa, lui e Alastorta avevano esaminato un libro di cuoio logoro sul cataclisma. Sugli scaffali più alti notate altri tomi illustrati sulla Celestica, ma la struttura lignea è marcia per l'umidità e sul punto di cedere per i fremiti della stasi morente.",
            "ignoreText": "Lasciate i libri sugli scaffali pericolanti e puntate direttamente verso la parete di fondo della sala.",
            "successText": "Sfilate con cautela i volumi chiave bilanciando il peso sui ripiani senza far crollare la libreria. Sebbene il testo sia vergato nell'indecifrabile alfabeto antico di Loch Ein, le tavole illustrate mostrano come i Firmamentisti usassero sequenze geometriche di glifi sul torace e sulle braccia per contenere per brevi periodi le radiazioni dei frammenti dell’Yrtite.",
            "failText": "Uno scaffale cede di schianto con un boato assordante, seppellendovi sotto una valanga di legno marcio, polvere secolare e pesanti tomi.",
            "stat": "int",
            "cd": 7,
            "bonusEroi": { "alastorta_dignitas": 1, "cassio_dignitas": 1, "ofelia_dignitas": 1 },
            "reward": "tomo_illustrato_celestica",
            "punishment": {
                "type": "injury",
                "name": "Valanga di tomi",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "trappole_dei_firmamentisti": {
            "title": "Le Trappole dei Firmamentisti",
            "desc": "Varcato il muro segreto sul fondo della Biblioteca, scendete lungo il passaggio oscuro che Alastorta e Cassio percorsero nella prima spedizione. I Firmamentisti erano noti per proteggere le loro scoperte più preziose: a causa dell'indebolirsi della bolla temporale, alcune lastre del pavimento rimaste inerti due anni fa brillano ora di incisioni astrali collegate a meccanismi difensivi riattivati.",
            "ignoreText": "Camminate lentamente aggrappandovi ai bordi rialzati del muro, impiegando molto più tempo e fatica per non calpestare il pavimento.",
            "successText": "Pur senza poter leggere i caratteri runici di Loch Ein incisi ai bordi, Alastorta e Cassio riconoscono la mappa delle costellazioni della Celestica sulle lastre e disinnescano il meccanismo a pressione. Sotto la lastra disattivata recuperate anche una placca d'argento incisa con un glifo di schermatura che andrà posto direttamente sul cuore di chi porterà l'Yrtite.",
            "failText": "Calpestate la stella sbagliata; dalle pareti scattano dardi avvelenati e una scarica d'energia arcana che vi investe in pieno corridoio.",
            "stat": "int",
            "cd": 7,
            "bonusEroi": { "cassio_dignitas": 1, "ofelia_dignitas": 1 },
            "reward": "placca_argento_runica",
            "punishment": {
                "type": "injury",
                "name": "Dardi avvelenati",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "anomalia_temporale": {
            "title": "L'Anomalia Temporale",
            "desc": "Scendendo ulteriormente, percepite che le leggi della natura iniziano a piegarsi: siete entrati nel raggio d'azione diretto della bolla di realtà alterata generata dall'Yrtite, che dal 178 d.F. tiene Loch Ein sospesa in un limbo tra il tempo e lo spazio. Attraversate una galleria dove il ciclo sta impazzendo: vedete gocce d'acqua sospese a mezz'aria come cristalli immobili, mentre a pochi passi la roccia si sgretola e si ricompone in un moto perpetuo.",
            "ignoreText": "Costeggiate la parete esterna dove l'effetto è minimo, allungando il giro in un cunicolo secondario angusto.",
            "successText": "Calcolate il ritmo del ciclo temporale e scattate attraverso la bolla nel momento esatto di stasi, uscendone con i riflessi acuiti. Osservando da vicino come il flusso temporale interagisce con la materia, Alastorta e Cassio comprendono perché i glifi di Loch Ein riescano a rallentare l'avvelenamento dell'Yrtite: quelle rune creano una minuscola sacca di stasi attorno alle vene del portatore, frenando la corsa del veleno verso il cuore.",
            "failText": "Rimanete intrappolati per alcuni istanti in una sacca di accelerazione temporale; sentite le forze prosciugarsi e i muscoli invecchiare sotto il peso di ore compresse in pochi secondi.",
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
            "desc": "Avanzando dove gli echi del passato sono più forti, l'aria davanti a voi si squarcia mostrando un'illusione vivida della notte del Disastro: il cielo rosso sopra Loch Ein, la terra che trema e la luce accecante dell'esplosione scatenata nel Salone delle Risposte. Tra i bagliori dell'illusione scorgete sul pavimento reale i resti di un messaggero caduto cinquant'anni fa mentre tentava di fuggire dalla camera del cristallo.",
            "ignoreText": "Chiudete gli occhi per non farvi sopraffare dalla visione e avanzate a tentoni lungo il muro fino a superarla.",
            "successText": "Mantenete i nervi saldi distinguendo l'illusione della Celestica dalla realtà e recuperate la borsa del messaggero senza lasciarvi atterrire dal cataclisma. All'interno trovate uno stilo d'argento e pigmenti minerali puri: lo strumento perfetto per tracciare con precisione i glifi sconosciuti di Loch Ein sulla pelle del futuro portatore dell'Yrtite.",
            "failText": "Il fragore assordante e la luce accecante della visione sopraffanno i vostri sensi, facendovi cadere in ginocchio in preda a un lancinante dolore alla testa.",
            "stat": "int",
            "cd": 8,
            "bonusEroi": { "alastorta_dignitas": 1, "ofelia_dignitas": 1 },
            "reward": "stilo_argento_pigmenti",
            "punishment": "tormento_mentale"
        },
        "fiume_d_energia_sotterraneo": {
            "title": "Il Fiume d'Energia Sotterraneo",
            "desc": "Il sentiero verso i vestiboli inferiori è tagliato da una profonda spaccatura sul cui fondo, molto in profondità, scorre uno dei leggendari fiumi sotterranei di Yr. Mentre Alastorta avverte nel sangue un richiamo potente e solenne provenire da quel fiume primordiale, Pandora si ritrae dal ciglio con un brivido di disagio: ai suoi occhi quel bagliore non ha nulla di sacro, ed è solo un'altra prova silenziosa della distanza che sente tra sé e il divino. I vapori che salgono dalla faglia alterano intanto la percezione dello spazio.",
            "ignoreText": "Cercate un cunicolo laterale scavato nella roccia viva per aggirare la spaccatura senza respirarne i fumi.",
            "successText": "Trattenete il fiato e saltate oltre la faglia con tempismo perfetto. Nell'attraversare i vapori di Yr Drazul, il sangue di Alastorta risponde con un guizzo di pura energia ancestrale che fa brillare per un istante l'aria intorno a lui: è la conferma definitiva che è la sua scintilla di Primarca l'unica nel gruppo in grado di reggere il contatto con l'Yrtite quando giungerà il momento del sacrificio.",
            "failText": "Inalate i vapori luminescenti durante il salto; una vertigine violenta vi fa atterrare malamente sul bordo opposto di pietra tagliente.",
            "stat": "fth",
            "cd": 8,
            "bonusEroi": { "alastorta_dignitas": 1, "pandora_dignitas": -1 },
            "reward": "bagliore_incorporeo_fiumi",
            "punishment": "vertigine_lacerante"
        },
        "pilastri_dei_tre_capi": {
            "title": "I Pilastri dei Tre Capi",
            "desc": "Attraversate un vestibolo monumentale sorretto da tre pilastri istoriati che commemorano il giuramento stretto dopo l'uso dell'Yrtite come arma: i rilievi richiamano le tre antiche stirpi del Nord, dei Lyanti e dei Kin che sigillarono la fonte del disastro su un'unica mappa segreta. Alla base dei pilastri sono incise formule nei diversi alfabeti antichi, tra cui quello di Loch Ein e quello arcaico di Foscoclivo, entrambi estranei alle rune del Nord note ad Alastorta.",
            "ignoreText": "Passate in mezzo ai pilastri senza toccare le incisioni dei tre sovrani.",
            "successText": "Confrontando la simmetria tra i tre pilastri, intuite il legame visivo tra gli alfabeti senza bisogno di tradurli parola per parola: comprendete così come chiudere il circuito di rune attorno ai polsi e al collo del portatore per impedire che l'avvelenamento dell'Yrtite gli bruci il sistema nervoso nel primo istante di contatto.",
            "failText": "Sfiorate i simboli nell'ordine errato, innescando un rigetto energetico dal pilastro di Cenn Nimoe che vi sbalza all'indietro contro le pareti.",
            "stat": "int",
            "cd": 8,
            "bonusEroi": { "temistocle_dignitas": 1, "pancrazio_dignitas": 1 },
            "reward": "circuito_runico_tre_sovrani",
            "punishment": {
                "type": "injury",
                "name": "Il rigetto del pilastro",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "serratura_a_forma_di_spada": {
            "title": "La Serratura a Forma di Spada",
            "desc": "Arrivate finalmente nella camera davanti alla monumentale porta di pietra che oltre due anni fa si chiuse ermeticamente dietro Emrys, intrappolando Alastorta e Cassio. Mentre Pancrazio, Pandora, Ofelia e Temistocle osservano per la prima volta i grandiosi bassorilievi illuminati dalle torce — che raffigurano la battaglia, l'esplosione dell'Yrtite e i tre eredi delle tre stirpi nell'atto di sigillare il cristallo —, Alastorta e Cassio esaminano la serratura a forma di spada. Secondo gli storici fu sigillata nel 178 d.F. dalla spada di Mag Cuibbe ereditata da Nimeth, e gli emissari degli Otto l'hanno forzata da poco lasciando però attivo un controsigillo instabile nell'alfabeto antico di Loch Ein.",
            "ignoreText": "Evitate di toccare la serratura a forma di spada sovraccarica d'energia e forzate il passaggio laterale di servizio usato oltre due anni fa da Emrys per fuggire.",
            "successText": "Unendo i lunghi studi che Alastorta e Cassio fecero proprio in questa stanza quando rimasero chiusi dentro due anni fa con la risonanza della Spada Spiavento, disinnescate il controsigillo e spalancate la porta monumentale, assorbendo anche un'ultima sequenza geometrica di rune dalla serratura stessa.",
            "failText": "Forzate la serratura a forma di spada con troppa irruenza; il sigillo oppone resistenza rilasciando un'onda d'urto che vi brucia le mani prima che il varco si apra.",
            "stat": "int",
            "cd": 8,
            "bonusEroi": { "cassio_dignitas": 1, "ofelia_dignitas": 1 },
            "reward": "spiavento_potenziata",
            "punishment": {
                "type": "injury",
                "name": "Mani bruciate dal sigillo",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "cicli_senza_fine": {
            "title": "I Cicli Senza Fine",
            "desc": "Entrate nel vasto Salone delle Risposte, oltre la porta che nemmeno Alastorta e Cassio avevano potuto varcare due anni fa. Le pareti interne e le colonne del salone sono coperte dai simboli di \"sospensione\", \"eternità\", \"soglia\" e \"limbo\" che i due studiosi avevano visto riprodotti sulla porta esterna, intrecciati a formare un ciclo senza fine attorno al centro della sala. Qui la gravità e lo spazio sono piegati al punto da farvi camminare quasi sulle pareti.",
            "ignoreText": "Avanzate tenendo lo sguardo fisso a terra e procedendo carponi per non subire il disorientamento visivo dei simboli.",
            "successText": "Seguendo la logica geometrica dei simboli di soglia e limbo studiati due anni fa da Alastorta e Cassio, vi muovete attraverso le distorsioni spaziali fino al centro del salone, comprendendo anche come allineare le rune sul corpo del portatore affinché non venga schiacciato dal contraccolpo gravitazionale quando solleverà l'Yrtite.",
            "failText": "Perdete i punti di riferimento nel ciclo senza fine; la gravità alterata vi sbatte violentemente contro i pilastri di pietra del salone.",
            "stat": "int",
            "cd": 8,
            "bonusEroi": { "pandora_dignitas": 1, "pancrazio_dignitas": 1 },
            "reward": "manto_luce_runica",
            "punishment": {
                "type": "injury",
                "name": "Contro i pilastri del salone",
                "desc": "Tutta la compagnia subisce 2 danni",
                "effects": [
                    { "effect": "party_damage", "val": 2 }
                ]
            }
        },
        "crollo_salone_delle_risposte": {
            "title": "Il Crollo del Salone delle Risposte",
            "desc": "Non appena l'Yrtite viene rimossa dal piedistallo, la bolla di realtà alterata che dal 178 d.F. — per oltre mezzo secolo — ha trattenuto il lago e mantenuto Loch Ein sospesa nel limbo svanisce di colpo. Mentre i glifi runici tracciati sulle braccia di chi porta il cristallo si incendiano di luce per arginare la prima, brutale ondata di avvelenamento nero nelle sue vene, un boato apocalittico scuote la terra: il soffitto del Salone delle Risposte si squarcia e tonnellate d'acqua gelida e massi precipitano verso il pavimento mentre correte disperatamente verso l'uscita!",
            "ignoreText": "Vi gettate in un condotto di scolo laterale molto più lungo e tortuoso pur di evitare la pioggia di massi al centro della sala.",
            "successText": "Scattate con riflessi fulminei schivando i pilastri che crollano e balzate oltre la porta monumentale un istante prima che la volta collassi dietro di voi.",
            "failText": "L'onda d'urto di un masso caduto vi scaraventa a terra nell'acqua che sale; riuscite a trascinarvi fuori dal salone solo a prezzo di dolorose contusioni e ferite.",
            "stat": "str",
            "cd": 8,
            "reward": null,
            "punishment": {
                "type": "injury",
                "name": "Contusioni nel crollo",
                "desc": "Tutta la compagnia subisce 2 danni",
                "effects": [
                    { "effect": "party_damage", "val": 2 }
                ]
            }
        },
        "onda_d_urto_nelle_gallerie": {
            "title": "L'Onda d'Urto nelle Gallerie",
            "desc": "Appena staccata l'Yrtite dal nucleo, la stasi che reggeva Loch Ein collassa e inizia una disperata corsa contro il tempo: dovete portare il cristallo in superficie prima che il lago seppellisca la città e prima che l'avvelenamento superi la barriera delle rune che proteggono il portatore! Mentre imboccate la galleria di risalita fuori dal Salone delle Risposte, la pressione dell'acqua che invade la camera genera un'onda impetuosa che risale il tunnel alle vostre spalle come un ariete liquido.",
            "ignoreText": "Vi arrampicate rapidamente in una nicchia sopraelevata attendendo che la prima furia dell'onda passi, perdendo però terreno prezioso.",
            "successText": "Correte a perdifiato sfruttando la spinta d'aria che precede l'onda e raggiungete i gradini superiori restando all'asciutto.",
            "failText": "L'onda vi raggiunge alle gambe e vi sbatte con violenza contro i bassorilievi di pietra delle pareti prima di defluire nelle crepe laterali.",
            "stat": "int",
            "cd": 8,
            "bonusEroi": { "temistocle_dignitas": 1, "pandora_dignitas": 1 },
            "reward": "passo_rapido_gallerie",
            "punishment": {
                "type": "injury",
                "name": "Contro i bassorilievi",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "biblioteca_in_fiamme": {
            "title": "La Biblioteca in Fiamme",
            "desc": "Sbucate dal passaggio segreto nuovamente nella Sala del Consiglio e della Biblioteca, ma l'edificio inclinato sta cedendo strutturalmente sotto i vostri piedi. Le lanterne alchemiche cadute durante le scosse hanno incendiato gli antichi scaffali di pergamene della Biblioteca, mentre dal soffitto squarciato precipitano torrenti d'acqua e travi di marmo. La porta di bronzo verso l'atrio si sta deformando per la pressione.",
            "ignoreText": "Evitate la porta di bronzo centrale e sfondate una finestra a forma di stella per uscire sul cornicione esterno del palazzo.",
            "successText": "Attraversate la sala tra fumo e crolli, afferrando al volo gli ultimi manoscritti salvabili sul tavolo di pietra e forzando la porta di bronzo prima che si blocchi.",
            "failText": "Una trave infuocata e un getto d'acqua bollente vi sbarrano il passo; dovete sfondare la porta a spallate riportando ustioni e contusioni.",
            "stat": "str",
            "cd": 9,
            "bonusEroi": { "temistocle_dignitas": 1, "pancrazio_dignitas": 1 },
            "reward": "manoscritti_firmamentisti",
            "punishment": {
                "type": "injury",
                "name": "Ustioni e contusioni",
                "desc": "Tutta la compagnia subisce 2 danni",
                "effects": [
                    { "effect": "party_damage", "val": 2 }
                ]
            }
        },
        "caduta_della_statua": {
            "title": "La Caduta della Statua",
            "desc": "Uscite dal Palazzo sulla Grande Piazza Circolare proprio mentre metà della spianata sprofonda nell'abisso senza fondo. Mentre correte lungo il perimetro inclinato proteggendo chi porta l'Yrtite, l'enorme statua pendente dell'antico sovrano cede definitivamente alla base e inizia a ribaltarsi, rotolando lungo il piano inclinato esattamente nella vostra direzione e spaccando il selciato.",
            "ignoreText": "Vi gettate immediatamente giù da una rampa secondaria allagata per uscire dalla traiettoria della statua, allungando la risalita.",
            "successText": "Sfruttate il solco aperto dal crollo del basamento per correre in scia dietro i detriti, usando lo slancio per balzare direttamente sul viale superiore.",
            "failText": "L'impatto della statua col suolo fa esplodere una nube di schegge di marmo che vi ferisce alle spalle e fa cedere il tratto di strada sotto i vostri piedi.",
            "stat": "int",
            "cd": 9,
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
        "ponte_di_torri": {
            "title": "Il Ponte di Torri",
            "desc": "Vi lasciate alle spalle la piazza mentre interi edifici dai tetti a punta e dai mosaici stellati si staccano dalla roccia e precipitano nell'abisso sottostante. La strada principale davanti a voi è sprofondata nel vuoto. L'unico modo per passare è correre lungo il fusto di una torre astronomica abbattuta di traverso sopra la voragine, che però sta scivolando centimetro dopo centimetro verso il baratro.",
            "ignoreText": "Cercate un passaggio attraverso le cantine allagate degli edifici ancora ancorati alla parete rocciosa.",
            "successText": "Correte a perdifiato lungo la parete obliqua della torre e spiccate un balzo disperato afferrando il bordo della strada opposta proprio mentre la torre precipita nel buio.",
            "failText": "La torre ruota su sé stessa mentre siete a metà; cadete pesantemente sul cornicione inferiore a ridosso del vuoto, dovendo risalire con le unghie e con i denti.",
            "stat": "fth",
            "cd": 9,
            "bonusEroi": { "temistocle_dignitas": 1, "pancrazio_dignitas": 1 },
            "reward": "balzo_dell_atani",
            "punishment": {
                "type": "injury",
                "name": "Sul cornicione a ridosso del vuoto",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "vortice_dell_anfiteatro": {
            "title": "Il Vortice dell'Anfiteatro",
            "desc": "Passate sul bordo superiore dell'Anfiteatro in rovina: l'intera arena sottostante è ormai un enorme bacino d'acqua vorticosa che sta risucchiando colonne e gradinate di marmo verso una voragine sul fondo. Il sentiero su cui correte sta franando dentro il gorgo.",
            "ignoreText": "Vi arrampicate lungo le arcate esterne più alte dell'anfiteatro, lontano dal bordo dell'acqua ma esposti alla caduta di stalattiti dalla volta.",
            "successText": "Sfruttate le colonne inclinate come appigli per oscillare con le corde sopra il tratto franato, superando il vortice senza rallentare la corsa.",
            "failText": "Il marmo cede sotto i vostri piedi e finite in acqua ai margini del vortice; solo nuotando con tutte le vostre forze riuscite a non essere risucchiati sul fondo dell'arena.",
            "stat": "int",
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
            "desc": "Siete in vista della fenditura rocciosa che conduce fuori da Loch Ein, ma le lunghe scalinate a spirale in marmo si stanno spezzando in tronconi mentre la città sprofonda definitivamente nel regno della non-esistenza.",
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
            "desc": "Arrivate al punto in cui avevate lasciato la campana subacquea di botti rinforzate e le scorte di sacchi di vino pieni d'aria per la risalita, ma parte della parete è franata sopra l'equipaggiamento e l'acqua sta già sommergendo la riva interna.",
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
        },
        "fontana_dell_essenza": {
            "title": "La Fontana dell'Essenza",
            "desc": "In una nicchia del salone allagato una fontana dei Firmamentisti pulsa ancora di luce azzurra: una conca d'argento coperta di glifi, che chiede \"essenza viva\" in cambio delle monete di Loch Ein custodite nel basamento. Alastorta riconosce lo schema: con questo congegno i Firmamentisti pagavano chi estraeva l'Yrtite, prendendo in cambio un po' della sua forza. Ogni goccia versata nella conca fa scivolare fuori una moneta antica, e il saccheggiatore accampato poco più avanti le accetterà di certo.",
            "ignoreText": "Lasciate la fontana alla sua luce azzurra: il sangue vi servirà tutto per uscire vivi da Loch Ein.",
            "successText": "La conca beve il vostro sangue e il basamento lascia cadere monete d'argento antiche, fredde come l'acqua del lago. Le stringete in pugno, pallidi ma più ricchi.",
            "stat": "hp"
        }
    },
    "merchants": {
        "default": "Un mercante di passaggio vi mostra la sua merce.",
        "studioso_isolato": "Scendendo lungo le rampe inferiori del passaggio segreto, individuate una nicchia laterale illuminata da lanterne alchemiche: all'interno si nasconde un anziano epigrafista di Foscoclivo, rimasto ferito e abbandonato indietro dalla spedizione de \"gli Otto\". Disgustato dal fanatismo dei suoi padroni e desideroso solo di comprarsi una via di fuga, accetta di vendervi i suoi migliori elisir e manufatti. Mentre commerciate, vi mostra i suoi appunti: vi spiega che né le rune di Foscoclivo né quelle di Loch Ein possono fermare la morte di chi tocca l'Yrtite, ma solo rallentarne il veleno nel sangue di chi è portato a trasportarla.",
        "artefice_imprigionato": "In una sala laterale del vestibolo, sospesa tra due stati dell'essere, incontrate una figura enigmatica: un cercatore di tesori avventuratosi a Loch Ein una ventina d'anni dopo il Disastro del 178 d.F. e rimasto bloccato nella stasi temporale senza invecchiare di un solo giorno. Confuso sul passare dei decenni ma desideroso di scambiare ciò che ha raccolto nelle rovine per poter finalmente fuggire, vi mostra la sua merce avvertendovi che fuori dal limbo il tempo riprenderà subito il suo normale conteggio.",
        "saccheggiatore_disperato": "Attraversata di corsa la Biblioteca che crolla, sbucate nell'atrio semidistrutto del Palazzo dei Firmamentisti, dove incontrate per l'ultima volta un mercante-esploratore carico di bottino che non riesce a correre per il troppo peso. Pur di alleggerirsi e salvare la pelle prima che Loch Ein sprofondi nel nulla, svende tutto ciò che gli resta in pochi istanti concitati."
    },
    "rests": {
        "default": "Trovate un angolo riparato e riposate qualche ora.",
        "camera_fuori_dal_tempo": "Mentre scendete nella fascia in cui la bolla dell'Yrtite piega lo spazio e il tempo, trovate una piccola stanza circolare dove il limbo mantiene ancora una quiete assoluta: la polvere è immobile a mezz'aria e il frastuono dell'acqua sopra di voi è completamente assente. Mentre il gruppo approfitta di questa bolla per riposare, Pandora osserva quella polvere sospesa da cinquant'anni sentendo un freddo interiore che non sa spiegarsi: tutti intorno a lei percepiscono il battito divino dell’Yr Drazul, mentre lei sente solo un silenzio sordo e impenetrabile.",
        "anticamera": "Raggiungete l'anticamera protetta da spesse mura di pietra incise con gli indecifrabili glifi dei Firmamentisti, poco prima della galleria in cui Alastorta e Cassio rimasero intrappolati oltre due anni fa. Qui l'acqua che filtra dal soffitto cade in un rivolo lento, permettendovi di riprendere le forze. Mentre Cassio e Ofelia ultimano i preparativi per tracciare le rune protettive, Alastorta osserva i suoi giovani familiari con un silenzioso sorriso carico di gravità, sapendo già quale sarà il suo compito oltre quella porta.",
        "altare_della_stasi": "Vi fermate su una piattaforma di pietra levigata a pochi passi dal piedistallo dove splende il cristallo di Yrtite, in un punto in cui il tempo è completamente fermo. È il momento della verità: sapete che prendere l'Yrtite condannerà chi la porta a un lento avvelenamento, e che solo chi possiede la scintilla può reggerla abbastanza a lungo da portarla fuori. Mentre Pandora resta in disparte, turbata dall'incomprensibile silenzio spirituale che sente dentro di sé di fronte a quell'energia divina, Alastorta si fa avanti. Cassio e Ofelia tracciano sulle sue braccia e sul suo petto gli schemi geometrici delle rune di Loch Ein appresi lungo il viaggio per ritardare il veleno, mentre Pancrazio e Temistocle serrano le armi per scortarlo nella fuga.",
        "cerchio_dei_firmamentisti": "A pochi passi dal piedistallo centrale dove brilla l'Yrtite, trovate riparo all'interno di un cerchio geometrico tracciato dagli antichi sapienti di Loch Ein nell'alfabeto arcaico della città. Mentre l'energia residua del cerchio rinvigorisce i vostri corpi stanchi e Pandora si interroga in silenzio sul perché lei sola non percepisca quel calore sacro sulla pelle, Alastorta prepara il proprio spirito al sacrificio imminente: Cassio e Ofelia applicano su di lui i sigilli runici ricopiati durante la discesa per frenare l'avvelenamento che inizierà a divorarlo non appena stringerà il cristallo.",
        "cupola_d_aria_residua": "Mentre attorno a voi i quartieri di Loch Ein scivolano verso l'abisso, trovate un massiccio edificio a volta costruito dagli antichi Atani che resiste ancora all'urto dei crolli. All'interno si è creata una sacca asciutta: vi fermate per pochi, preziosissimi minuti. Il respiro di chi porta l'Yrtite è ormai pesante e febbrile: il veleno violaceo del cristallo sta divorando una dopo l'altra le rune di contenimento tracciate sulla sua pelle, costringendo Cassio e Ofelia a ricalcarle d'urgenza per dargli la forza di arrivare fino al lago.",
        "sacca_d_aria_superiore": "Raggiungete la parte più alta della caverna naturale prima del passaggio sottomarino. Qui una cupola di roccia granitica regge ancora perfettamente e l'aria è respirabile: avete un ultimo istante di tregua per prepararvi allo scontro finale prima di rituffarvi nel lago. Chi porta l'Yrtite stringe i denti con il volto cinereo e imperlato di sudore freddo: le rune di Loch Ein sul suo corpo sono ormai quasi del tutto annerite dallo sforzo di trattenere l'avvelenamento, ma grazie al suo sacrificio siete a un solo passo dall'uscita.",
        "roccia_dell_immersione": "La caverna dietro di voi sta crollando definitivamente e davanti a voi resta solo il passaggio sottomarino verso la superficie del Lago di Loch Ein. Su uno sperone di roccia ancora emerso controllate i sacchi d'aria e fate bere gli ultimi elisir alchemici a chi porta l'Yrtite, le cui rune di contenimento stanno ormai cedendo al veleno del cristallo. Proprio sul varco d'acqua, però, avvertite una presenza antica, oscura e immensa che vi attende nell'ombra.",
        "arco_di_calcite": "Mentre la caverna alle vostre spalle collassa nell'abisso, vi fermate per un ultimo istante sotto un solido arco di calcite luminescente a ridosso del passaggio sottomarino che riporta al lago. Rinfrancate il portatore dell'Yrtite, ormai stremato dall'avvelenamento che preme contro gli ultimi glifi runici rimasti attivi sulla sua pelle, e impugnate le armi: dal pelo dell'acqua sentite levarsi una presenza antica e famelica venuta a reclamare il proprio banchetto."
    },
    "treasures": {},
    "stories": {
        "presa_dell_yrtite": { "title": "Il Cuore di Loch Ein", "text": "" }
    },
    "lootItems": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "ankh_pellegrino", "bastone_eremita", "balsamo_curativo", "spada_norgrad", "alabarda_guardia", "mannaia_pesante", "scudo_ferro", "corazza_scaglie", "tomo_proibito", "reliquiario_tascabile", "martello_consacrato", "brigantina_benedetta", "stocco_duellante", "pozione_rigenerazione", "unguento_fortificante", "lama_acciaio_lunare", "martello_breccia", "gorgiera_veterano", "corazza_piastre_leone", "cappa_sussurri", "simbolo_jag_antar", "scettro_savio", "corona_martire", "elisir_sangue_vivo", "olio_bollente", "bomba_acido", "cristallo_flammaurea", "grappa_soldato", "infuso_corteccia", "olio_da_lama", "pozione_pelle_pietra", "elisir_berserker", "corno_allman", "ascia_primo_sangue", "mazza_boia_seistad", "scudo_spina_kranen", "catena_ghiacceterno", "talismano_corvo", "mappa_contrabbandiere", "dado_osso_gunnar", "lingua_argento", "occhio_gazza", "coperta_rurikstad", "erbario_fonnish", "spadone_primo_sangue", "ascia_carnefice_glostok", "pugnale_succhiasangue", "lama_ghiaccio_hvid", "corazza_ultimo_baluardo", "spada_affilata", "ascia_pesante", "armatura_leggera_loot", "armatura_pesante_loot", "pozione", "amuleto", "anello", "scudo_pesante", "stilo_da_battaglia", "turibolo_ferrato", "rosario_del_pellegrino", "bastone_runico_del_dotto", "mazza_votiva", "scudo_del_sacerdote", "astrolabio_tattico", "guanti_runici_erudito", "bastone_dei_giusti"],
    "mapNodes": [
        { "id": 0, "level": 0, "x": 330, "type": "combat", "title": "Livello 1 - I Custodi della Sala Circolare", "icon": "🗡️", "done": false, "active": true, "next": [2, 3], "image": "", "enemy": "custodi_sala_circolare" },
        { "id": 1, "level": 0, "x": 550, "type": "challenge", "title": "Livello 1 - Gli Scaffali della Biblioteca", "icon": "❓", "done": false, "active": true, "next": [3, 4], "image": "", "challengeId": "scaffali_della_biblioteca" },
        { "id": 2, "level": 1, "x": 220, "type": "combat", "title": "Livello 2 - L'Agguato nelle Tenebre", "icon": "🗡️", "done": false, "active": false, "next": [5], "image": "", "enemy": "agguato_nelle_tenebre" },
        { "id": 3, "level": 1, "x": 440, "type": "challenge", "title": "Livello 2 - Le Trappole dei Firmamentisti", "icon": "❓", "done": false, "active": false, "next": [5, 6], "image": "", "challengeId": "trappole_dei_firmamentisti" },
        { "id": 4, "level": 1, "x": 660, "type": "combat", "title": "Livello 2 - I Parassiti dell'Oscurità", "icon": "🗡️", "done": false, "active": false, "next": [6], "image": "", "enemy": "parassiti_dell_oscurita" },
        { "id": 5, "level": 2, "x": 330, "type": "merchant", "title": "Livello 3 - Lo Studioso Isolato", "icon": "🪙", "done": false, "active": false, "next": [7, 8], "image": "", "merchantId": "studioso_isolato" },
        { "id": 6, "level": 2, "x": 550, "type": "combat", "title": "Livello 3 - I Divoratori di Essenze", "icon": "🗡️", "done": false, "active": false, "next": [8, 9], "image": "", "enemy": "divoratori_di_essenze" },
        { "id": 7, "level": 3, "x": 220, "type": "challenge", "title": "Livello 4 - L'Anomalia Temporale", "icon": "❓", "done": false, "active": false, "next": [10], "image": "", "challengeId": "anomalia_temporale" },
        { "id": 8, "level": 3, "x": 440, "type": "rest", "title": "Livello 4 - La Camera fuori dal Tempo", "icon": "⛺", "done": false, "active": false, "next": [10, 11], "image": "", "restId": "camera_fuori_dal_tempo" },
        { "id": 9, "level": 3, "x": 660, "type": "combat", "title": "Livello 4 - I Silfidi Eterei del Limbo", "icon": "🗡️", "done": false, "active": false, "next": [11], "image": "", "enemy": "silfidi_eterei_del_limbo" },
        { "id": 10, "level": 4, "x": 330, "type": "elite", "title": "Livello 5 - I Guerrieri Senza Tempo", "icon": "👹", "done": false, "active": false, "next": [12, 13], "image": "", "enemy": "guerrieri_senza_tempo" },
        { "id": 11, "level": 4, "x": 550, "type": "challenge", "title": "Livello 5 - La Visione del Disastro", "icon": "❓", "done": false, "active": false, "next": [13, 14], "image": "", "challengeId": "visione_del_disastro" },
        { "id": 12, "level": 5, "x": 220, "type": "combat", "title": "Livello 6 - La Progenie Corrotta delle Profondità", "icon": "🗡️", "done": false, "active": false, "next": [15], "image": "", "enemy": "progenie_corrotta_profondita" },
        { "id": 13, "level": 5, "x": 440, "type": "combat", "title": "Livello 6 - Le Ombre Affamate", "icon": "🗡️", "done": false, "active": false, "next": [15, 16], "image": "", "enemy": "ombre_affamate" },
        { "id": 14, "level": 5, "x": 660, "type": "challenge", "title": "Livello 6 - Il Fiume d'Energia Sotterraneo", "icon": "❓", "done": false, "active": false, "next": [16], "image": "", "challengeId": "fiume_d_energia_sotterraneo" },
        { "id": 15, "level": 6, "x": 330, "type": "challenge", "title": "Livello 7 - I Pilastri dei Tre Capi", "icon": "❓", "done": false, "active": false, "next": [17, 18], "image": "", "challengeId": "pilastri_dei_tre_capi" },
        { "id": 16, "level": 6, "x": 550, "type": "merchant", "title": "Livello 7 - L'Artefice Imprigionato", "icon": "🪙", "done": false, "active": false, "next": [18, 19], "image": "", "merchantId": "artefice_imprigionato" },
        { "id": 17, "level": 7, "x": 220, "type": "combat", "title": "Livello 8 - I Guardiani del Velo", "icon": "🗡️", "done": false, "active": false, "next": [20], "image": "", "enemy": "guardiani_del_velo" },
        { "id": 18, "level": 7, "x": 440, "type": "rest", "title": "Livello 8 - L'Anticamera", "icon": "⛺", "done": false, "active": false, "next": [20, 21], "image": "", "restId": "anticamera" },
        { "id": 19, "level": 7, "x": 660, "type": "elite", "title": "Livello 8 - Il Rituale di Anoeth", "icon": "👹", "done": false, "active": false, "next": [21], "image": "", "enemy": "rituale_di_anoeth" },
        { "id": 20, "level": 8, "x": 330, "type": "challenge", "title": "Livello 9 - La Serratura a Forma di Spada", "icon": "❓", "done": false, "active": false, "next": [22, 23], "image": "", "challengeId": "serratura_a_forma_di_spada" },
        { "id": 21, "level": 8, "x": 550, "type": "combat", "title": "Livello 9 - Le Sentinelle della Porta", "icon": "🗡️", "done": false, "active": false, "next": [23, 24], "image": "", "enemy": "sentinelle_della_porta" },
        { "id": 22, "level": 9, "x": 220, "type": "combat", "title": "Livello 10 - Gli Spettri del Duello", "icon": "🗡️", "done": false, "active": false, "next": [25], "image": "", "enemy": "spettri_del_duello" },
        { "id": 23, "level": 9, "x": 440, "type": "challenge", "title": "Livello 10 - I Cicli Senza Fine", "icon": "❓", "done": false, "active": false, "next": [25, 26], "image": "", "challengeId": "cicli_senza_fine" },
        { "id": 24, "level": 9, "x": 660, "type": "combat", "title": "Livello 10 - Le Creature del Cristallo", "icon": "🗡️", "done": false, "active": false, "next": [26], "image": "", "enemy": "creature_del_cristallo" },
        { "id": 25, "level": 10, "x": 330, "type": "elite", "title": "Livello 11 - Il Custode del Sigillo di Yr Drazul", "icon": "👹", "done": false, "active": false, "next": [27], "image": "", "enemy": "custode_sigillo_yr_drazul" },
        { "id": 26, "level": 10, "x": 550, "type": "elite", "title": "Livello 11 - L'Araldo dell'Infezione", "icon": "👹", "done": false, "active": false, "next": [28], "image": "", "enemy": "araldo_dell_infezione" },
        { "id": 27, "level": 11, "x": 330, "type": "rest", "title": "Livello 12 - L'Altare della Stasi", "icon": "⛺", "done": false, "active": false, "next": [29], "image": "", "restId": "altare_della_stasi" },
        { "id": 28, "level": 11, "x": 550, "type": "rest", "title": "Livello 12 - Il Cerchio dei Firmamentisti", "icon": "⛺", "done": false, "active": false, "next": [29], "image": "", "restId": "cerchio_dei_firmamentisti" },
        { "id": 29, "level": 12, "x": 440, "type": "story", "title": "Livello 13 - Il Cuore di Loch Ein", "icon": "📜", "done": false, "active": false, "next": [30, 31, 32], "image": "", "storyId": "presa_dell_yrtite" },
        { "id": 30, "level": 13, "x": 220, "type": "challenge", "title": "Livello 14 - Il Crollo del Salone delle Risposte", "icon": "❓", "done": false, "active": false, "next": [33], "image": "", "challengeId": "crollo_salone_delle_risposte" },
        { "id": 31, "level": 13, "x": 440, "type": "combat", "title": "Livello 14 - Le Ombre del Sigillo", "icon": "🗡️", "done": false, "active": false, "next": [33, 58, 34], "image": "", "enemy": "ombre_del_sigillo" },
        { "id": 32, "level": 13, "x": 660, "type": "challenge", "title": "Livello 14 - L'Onda d'Urto nelle Gallerie", "icon": "❓", "done": false, "active": false, "next": [34], "image": "", "challengeId": "onda_d_urto_nelle_gallerie" },
        { "id": 33, "level": 14, "x": 220, "type": "combat", "title": "Livello 15 - I Superstiti di Foscoclivo in Fuga", "icon": "🗡️", "done": false, "active": false, "next": [35, 36], "image": "", "enemy": "superstiti_di_foscoclivo" },
        { "id": 34, "level": 14, "x": 660, "type": "combat", "title": "Livello 15 - Le Bestie in Fuga dall'Abisso", "icon": "🗡️", "done": false, "active": false, "next": [36, 37], "image": "", "enemy": "bestie_in_fuga_dall_abisso" },
        { "id": 35, "level": 15, "x": 220, "type": "challenge", "title": "Livello 16 - La Biblioteca in Fiamme", "icon": "❓", "done": false, "active": false, "next": [38], "image": "", "challengeId": "biblioteca_in_fiamme" },
        { "id": 36, "level": 15, "x": 440, "type": "merchant", "title": "Livello 16 - Il Saccheggiatore Disperato", "icon": "🪙", "done": false, "active": false, "next": [38, 39], "image": "", "merchantId": "saccheggiatore_disperato" },
        { "id": 37, "level": 15, "x": 660, "type": "combat", "title": "Livello 16 - Il Crollo delle Colonne", "icon": "🗡️", "done": false, "active": false, "next": [39], "image": "", "enemy": "crollo_delle_colonne" },
        { "id": 38, "level": 16, "x": 330, "type": "elite", "title": "Livello 17 - Il Vendicatore", "icon": "👹", "done": false, "active": false, "next": [40, 41], "image": "", "enemy": "il_vendicatore" },
        { "id": 39, "level": 16, "x": 550, "type": "challenge", "title": "Livello 17 - La Caduta della Statua", "icon": "❓", "done": false, "active": false, "next": [41, 42], "image": "", "challengeId": "caduta_della_statua" },
        { "id": 40, "level": 17, "x": 220, "type": "challenge", "title": "Livello 18 - Il Ponte di Torri", "icon": "❓", "done": false, "active": false, "next": [43], "image": "", "challengeId": "ponte_di_torri" },
        { "id": 41, "level": 17, "x": 440, "type": "combat", "title": "Livello 18 - I Predatori delle Acque", "icon": "🗡️", "done": false, "active": false, "next": [43, 44], "image": "", "enemy": "predatori_delle_acque" },
        { "id": 42, "level": 17, "x": 660, "type": "rest", "title": "Livello 18 - La Cupola d'Aria Residua", "icon": "⛺", "done": false, "active": false, "next": [44], "image": "", "restId": "cupola_d_aria_residua" },
        { "id": 43, "level": 18, "x": 330, "type": "combat", "title": "Livello 19 - L'Orda dei Senza Pace", "icon": "🗡️", "done": false, "active": false, "next": [45, 46], "image": "", "enemy": "orda_dei_senza_pace" },
        { "id": 44, "level": 18, "x": 550, "type": "challenge", "title": "Livello 19 - Il Vortice dell'Anfiteatro", "icon": "❓", "done": false, "active": false, "next": [46, 47], "image": "", "challengeId": "vortice_dell_anfiteatro" },
        { "id": 45, "level": 19, "x": 220, "type": "combat", "title": "Livello 20 - Lo Stormo nel Panico", "icon": "🗡️", "done": false, "active": false, "next": [48], "image": "", "enemy": "stormo_nel_panico" },
        { "id": 46, "level": 19, "x": 440, "type": "challenge", "title": "Livello 20 - Le Scalinate che Sprofondano", "icon": "❓", "done": false, "active": false, "next": [48, 49], "image": "", "challengeId": "scalinate_che_sprofondano" },
        { "id": 47, "level": 19, "x": 660, "type": "elite", "title": "Livello 20 - L'Abominio della Voragine", "icon": "👹", "done": false, "active": false, "next": [49], "image": "", "enemy": "abominio_della_voragine" },
        { "id": 48, "level": 20, "x": 330, "type": "challenge", "title": "Livello 21 - La Pioggia di Stalattiti e Cristalli", "icon": "❓", "done": false, "active": false, "next": [50, 51], "image": "", "challengeId": "pioggia_di_stalattiti_e_cristalli" },
        { "id": 49, "level": 20, "x": 550, "type": "combat", "title": "Livello 21 - La Furia dei Terrigeni", "icon": "🗡️", "done": false, "active": false, "next": [51, 52], "image": "", "enemy": "furia_dei_terrigeni" },
        { "id": 50, "level": 21, "x": 220, "type": "combat", "title": "Livello 22 - Gli Spettri dell'Acqua", "icon": "🗡️", "done": false, "active": false, "next": [53], "image": "", "enemy": "spettri_dell_acqua" },
        { "id": 51, "level": 21, "x": 440, "type": "rest", "title": "Livello 22 - La Sacca d'Aria Superiore", "icon": "⛺", "done": false, "active": false, "next": [53, 54], "image": "", "restId": "sacca_d_aria_superiore" },
        { "id": 52, "level": 21, "x": 660, "type": "challenge", "title": "Livello 22 - Le Attrezzature Subacquee Sepolte", "icon": "❓", "done": false, "active": false, "next": [54], "image": "", "challengeId": "attrezzature_subacquee_sepolte" },
        { "id": 53, "level": 22, "x": 330, "type": "elite", "title": "Livello 23 - L'Ultima Guardia del Cenn", "icon": "👹", "done": false, "active": false, "next": [55], "image": "", "enemy": "ultima_guardia_del_cenn" },
        { "id": 54, "level": 22, "x": 550, "type": "combat", "title": "Livello 23 - Il Ritorno delle Mantombre", "icon": "🗡️", "done": false, "active": false, "next": [56], "image": "", "enemy": "ritorno_delle_mantombre" },
        { "id": 55, "level": 23, "x": 330, "type": "rest", "title": "Livello 24 - La Roccia dell'Immersione", "icon": "⛺", "done": false, "active": false, "next": [57], "image": "", "restId": "roccia_dell_immersione" },
        { "id": 56, "level": 23, "x": 550, "type": "rest", "title": "Livello 24 - L'Arco di Calcite", "icon": "⛺", "done": false, "active": false, "next": [57], "image": "", "restId": "arco_di_calcite" },
        { "id": 57, "level": 24, "x": 440, "type": "combat", "title": "Livello 25 - Il Banchetto dell'Ombra e il Traditore di Anoeth", "icon": "👑", "done": false, "active": false, "next": [], "image": "", "enemy": "emrys_e_l_entita_affamata" },
        { "id": 58, "level": 14, "x": 440, "type": "challenge", "title": "Livello 15 - La Fontana dell'Essenza", "icon": "❓", "done": false, "active": false, "next": [36], "image": "", "challengeId": "fontana_dell_essenza" }
    ]
};
