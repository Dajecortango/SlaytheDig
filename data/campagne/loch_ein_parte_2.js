// Campagna "Loch Ein, Parte Due: La Città Caduta".
// Il contenuto dopo "=" è JSON puro: niente funzioni, gli effetti sono descritti nei campi "effects"
// e interpretati da applyEffects() in js/game.js. È un file .js (e non .json) perché il gioco
// si apre con doppio click da file:// e il browser blocca fetch() di file locali.
// Nemici, oggetti, reliquie e maledizioni sono richiamati per id da data/libreria/.
window.CAMPAIGNS = window.CAMPAIGNS || {};
window.CAMPAIGNS["loch_ein_parte_2"] = {
    "difficolta": { "vittoriaMin": 28, "vittoriaMax": 42 },
    "maxEroi": 6,
    "id": "loch_ein_parte_2",
    "title": "Loch Ein, Parte Due: La Città Caduta",
    "avventura": "loch_ein",
    "capitolo": 2,
    "terreno": "pietra",
    "badge": "Parte Due",
    "description": "Oltre l'arco sommerso, nelle viscere della Caduta dai Cieli: la città inclinata di Loch Ein, i quartieri dei Firmamentisti, l'Anfiteatro in rovina e la Grande Piazza Circolare, fino alle porte del Palazzo dove vi attende Eldric.",
    "coverImage": "immagini/viaggio_tra_le_rovine_di_loch_hein.webp",
    "introText": "Superato l'arco sommerso grazie alla campana subacquea e ai sacchi di vino riempiti d'aria, riemergete finalmente nella grande caverna dotata di una sacca d'aria naturale.",
    "heroes": ["alastorta_dignitas", "pancrazio_dignitas", "cassio_dignitas", "ofelia_dignitas", "pandora_dignitas", "temistocle_dignitas"],
    "initialArmory": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "balsamo_curativo", "stilo_da_battaglia", "turibolo_ferrato", "rosario_del_pellegrino"],
    "challenges": {
        "correnti_passaggio_subacqueo": {
            "title": "Le Correnti del Passaggio Subacqueo",
            "desc": "Una volta immersi sotto l'arco sommerso del lago, scegliete di risalire verso la caverna con la sacca d'aria naturale attraverso un tunnel secondario semi-allagato, dove l'acqua spinge con molta più forza rispetto alla prima spedizione attraverso le fessure della roccia. Sul fondale fangoso del condotto notate alcune casse impermeabili perse qualche settimana fa dall'avanguardia di Foscoclivo durante la loro discesa, ma i mulinelli d'acqua rischiano di trascinarvi contro le pareti frastagliate.",
            "ignoreText": "Affiorate immediatamente sulla riva rocciosa della caverna senza rischiare di annegare per recuperare le casse sul fondale.",
            "successText": "Sfruttando le corde di canapa e i sacchi d'aria con zelo, vi ancorate alle rocce e recuperate il carico perso da Foscoclivo prima di riemergere nella sacca d'aria. Aprendo le casse impermeabili, però, restate interdetti: invece di forzieri foderati di piombo per racchiudere un minerale, trovate fasce di cuoio, spallacci d'argento e potenti anestetici per il corpo umano. Sul cuoio e sul metallo sono incise fitte sequenze di rune spigolose: Alastorta le esamina a lungo aggrottando la fronte, poiché non appartengono a nessun alfabeto runico del Nord o dei Dignitas che egli abbia mai studiato. Perché i Cavalcantici hanno portato bardature incise in una scrittura tanto aliena per vestire un uomo anziché una cassa?",
            "failText": "Una corrente improvvisa vi sbatte contro gli spuntoni di roccia sommersi e vi strappa di mano i sacchi d'aria, costringendovi a riemergere annaspando e con i polmoni letteralmente in fiamme.",
            "stat": "int",
            "cd": 7,
            "bonusEroi": { "temistocle_dignitas": 1, "pancrazio_dignitas": 1 },
            "reward": "bardatura_runica_foscoclivo",
            "punishment": {
                "type": "injury",
                "name": "Polmoni in fiamme",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "risonanza_pietra_di_volta": {
            "title": "La Risonanza della Pietra di Volta",
            "desc": "Avanzando nelle grotte illuminate dai riflessi dorati della pirite, raggiungete il punto esatto in cui, oltre due anni fa, la Spada Spiavento – forgiata con la rara Pietra di Volta e concessa in custodia a Cassio dalla Capofamiglia Lenora – aveva reagito con i minerali della caverna aprendo il passaggio segreto verso Loch Ein. Le venature nella parete vibrano ancora, ma con un ritmo irregolare e intermittente, come un cuore che sta faticando: la bolla di sospensione che protegge la città laggiù sta perdendo stabilità. Stimolare di nuovo quei minerali potrebbe aprirvi una scorciatoia nella roccia, o farvi crollare il soffitto addosso. Mentre la roccia vibra di quell'energia primordiale, Pandora fa istintivamente un passo indietro: laddove gli altri avvertono un timore reverenziale, lei sente sulla pelle solo un insolito senso di freddo e di fastidio, che attribuisce sul momento alla stanchezza dell'immersione.",
            "ignoreText": "Evitate di toccare le venature in risonanza e percorrete il tunnel principale già aperto.",
            "successText": "Colpite con precisione millimetrica il nodo minerale; una parete secondaria scorre rivelando una nicchia intatta dei Firmamentisti senza provocare smottamenti nella roccia. Sulle pareti interne, Alastorta e Cassio osservano una serie di bassorilievi accompagnati da incisioni: se le figure scolpite mostrano chiaramente che qualsiasi cassa inerte si polverizza a contatto con l'Yrtite e che solo un \"vaso vivente\" – un essere umano – può trasportarla oltre il sigillo, le rune incise accanto alle figure lasciano Alastorta spiazzato. Non solo sono completamente diverse dalle rune del Nord, ma non somigliano nemmeno a quelle di Foscoclivo trovate nelle casse: è un alfabeto arcaico proprio di Loch Ein che nemmeno il Primarca ha mai visto prima.",
            "failText": "La vibrazione sfugge al vostro controllo generando una violenta scossa; una pioggia di detriti e stalattiti si abbatte su di voi mentre correte verso l'uscita.",
            "stat": "int",
            "cd": 7,
            "bonusEroi": { "cassio_dignitas": 1, "alastorta_dignitas": 1, "pandora_dignitas": -1 },
            "reward": "frammento_pietra_di_volta",
            "punishment": {
                "type": "injury",
                "name": "Pioggia di stalattiti",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "scalinate_verso_il_nulla": {
            "title": "Le Scalinate Verso il Nulla",
            "desc": "Emergete dalle grotte affacciandovi sulla vertiginosa distesa inclinata di Loch Ein, con le sue torri piegate nel buio. Per scendere dal cornicione roccioso verso i primi livelli abitativi dovete percorrere delle antiche scalinate di marmo che si dipanano in spirali assurde e terminano bruscamente nel vuoto. Mentre valutate il percorso, vedete la polvere staccarsi dai gradini e rimanere sospesa a mezz'aria per un istante prima di cadere: il ciclo temporale dell'Yrtite sta chiaramente vacillando.",
            "ignoreText": "Rinunciate alle scale di marmo e vi calate lentamente lungo un pendio di macerie più lungo ma meno esposto al baratro.",
            "successText": "Usando rampini e corde, saltate con agilità da una rampa spezzata all'altra, superando il vuoto in metà del tempo.",
            "failText": "Il marmo umido vi fa perdere l'appiglio durante un salto; scivolate lungo la rampa inclinata schiantandovi contro una balaustra di pietra appena prima del precipizio.",
            "stat": "int",
            "cd": 7,
            "bonusEroi": { "temistocle_dignitas": 1, "pandora_dignitas": 1 },
            "reward": "rampino_firmamentisti",
            "punishment": "vertigine_lacerante"
        },
        "mosaico_verticale": {
            "title": "Il Mosaico Verticale",
            "desc": "Percorrendo i vicoli periferici della città, passate nel punto esatto in cui, oltre un anno fa, Pancrazio si era fermato a esaminare un antico mosaico su quello che un tempo era un pavimento e che ora si erge quasi come un muro verticale. Pandora, che tempo fa si era subito divisa dagli altri per andare a est con suo fratello Aiace, osserva per la prima volta quel mosaico che celebra gli Atani, gli 'Uomini che Furono' e la loro comunione con il firmamento: si aspetterebbe di provare un senso di rispetto davanti a una simile testimonianza ancestrale, ma con sua stessa sorpresa non sente assolutamente nulla, se non un inspiegabile fastidio che la spinge a distogliere lo sguardo. Notate intanto che nel tempo trascorso dalla vostra prima visita una nuova crepa ha spaccato le figure musive, segno che la stasi che preservava le strutture dal tempo sta svanendo. Alcune tessere preziose luccicano in alto nella fessura.",
            "ignoreText": "Non perdete tempo ad arrampicarvi su una parete inclinata e proseguite lungo il vicolo.",
            "successText": "Scalate la superficie obliqua sfruttando gli appigli tra le tessere del mosaico e recuperate gli intarsi antichi, scoprendo anche un passaggio dietro il muro. Ricomponendo i frammenti, completate l'immagine centrale: raffigura un uomo che trasporta il cristallo ardente a mani nude mentre una macchia nera come veleno risale lungo le sue vene, ma le sue braccia sono avvolte da catene di glifi luminosi tracciati nello sconosciuto alfabeto di Loch Ein. Anche senza poter leggere quei caratteri mai visti, la scena visiva parla chiaro: toccare l'Yrtite comporta un sacrificio atroce, e quei simboli servivano agli antichi per rallentarne l'effetto esattamente come le diverse rune di Foscoclivo viste sulle cinghie di cuoio.",
            "failText": "Le tessere del mosaico si staccano sotto il vostro peso facendovi precipitare rovinosamente sul selciato sottostante.",
            "stat": "fth",
            "cd": 8,
            "bonusEroi": { "pancrazio_dignitas": 1, "pandora_dignitas": -1 },
            "reward": "tessere_runiche_atani",
            "punishment": {
                "type": "injury",
                "name": "Caduta sul selciato",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "astrolabio_firmamentisti": {
            "title": "L'Astrolabio dei Firmamentisti",
            "desc": "Avanzando nel Quartiere degli Oroscopi tra carte celesti e meridiane, raggiungete una piazzetta inclinata al cui centro si trova un grande astrolabio di bronzo collegato a un meccanismo nel pavimento. I simboli rappresentano i movimenti della Celestica, ma gli anelli metallici girano a scatti avanti e indietro da soli, impazziti per l'indebolirsi della bolla temporale di Loch Ein. Forse, stabilizzando il congegno, potrete anche intuire come i Firmamentisti imbrigliassero le energie astrali e dell'Yrtite senza restarne inceneriti.",
            "ignoreText": "Evitate di maneggiare congegni astrologici che non comprendete appieno e passate oltre.",
            "successText": "Allineate gli anelli di bronzo secondo la posizione delle stelle raffigurate nei mosaici cittadini; un'illusione protettiva si dissolve svelandovi il cammino più sicuro attraverso il quartiere. Nel basamento aperto dell'astrolabio si rivela inoltre una lamina incisa con costellazioni e ideogrammi universali della Celestica che Cassio e Alastorta riescono a interpretare nonostante i caratteri ignoti ai margini: la sequenza illustra come un mortale comune verrebbe incenerito all'istante dal tocco dell'Yrtite. Per reggerla anche solo per poco tempo occorre qualcuno il cui sangue risuoni con energie ancestrali, qualcuno che porti dentro di sé una scintilla connessa alle forze degli Asi o degli Spiriti. Eppure, anche per un simile eletto, il prezzo finale resta il sacrificio.",
            "failText": "Ruotate gli anelli nel senso errato, attivando una contromisura della Celestica: un lampo accecante e un'illusione distorta dei corridoi vi disorientano profondamente.",
            "stat": "int",
            "cd": 8,
            "bonusEroi": { "cassio_dignitas": 1, "ofelia_dignitas": 1 },
            "reward": "lamina_astrale_celestica",
            "punishment": "tormento_mentale"
        },
        "stanza_divisa_dal_crollo": {
            "title": "La Stanza Divisa dal Crollo",
            "desc": "Attraversando il settore orientale, Pandora vi guida nella grande sala dove, più di un anno fa, il soffitto era crollato durante il duello, dividendo lei e Balinor da Aiace e Morwenna con una barriera di macerie alta fino alla volta. Dopo tutto questo tempo nell'umidità i detriti sono coperti di muschio pallido, ma la pila è resa ancora più precaria dai continui fremiti che scuotono Loch Ein man mano che la stasi dell'Yrtite si assottiglia. Al di là della barriera scorgete una via diretta per proseguire.",
            "ignoreText": "Non rischiate un secondo crollo e cercate un giro più lungo attraverso i palazzi adiacenti.",
            "successText": "Individuate il varco tra le travi portanti cadute e strisciate dall'altra parte della barriera senza muovere nemmeno un sasso. Sull'altro lato della sala trovate le tracce di una sosta recente della spedizione di Foscoclivo: tra i resti di pergamene bruciate leggete riferimenti a un \"Portatore\" scelto dagli Otto. Probabilmente i Cavalcantici sanno già che l'Yrtite richiede un sacrificio umano, e hanno portato con sé qualcuno incaricato di prenderla e mantenerla per il tempo necessario a portarla fuori da Loch Ein. Inoltre, sui fogli superstiti notate degli appunti frettolosi: gli studiosi di Foscoclivo hanno cercato di affiancare il proprio alfabeto runico ai glifi arcaici di Loch Ein, confermando ad Alastorta che si tratta di due tradizioni runiche totalmente distinte tra loro e sconosciute al Nord.",
            "failText": "Mentre vi arrampicate sulla barriera, un nuovo cedimento fa franare parte della pila di macerie, travolgendovi in una nube soffocante di polvere antica.",
            "stat": "int",
            "cd": 8,
            "bonusEroi": { "pandora_dignitas": 1, "ofelia_dignitas": 1 },
            "reward": "appunti_sul_portatore",
            "punishment": {
                "type": "injury",
                "name": "Nube di polvere antica",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "statua_che_indica": {
            "title": "La Statua che Indica",
            "desc": "Proseguendo oltre il luogo dei vecchi duelli nel settore est, entrate nella sala semidistrutta dove si erge la statua antica e miracolosamente intatta dell'Atani col braccio disteso. Appena la vede, Pandora si blocca col respiro corto: è la stessa statua che la indicava oltre due anni fa quando il veggente cieco Balinor la umiliò con un colpo al petto ma scelse di risparmiarle la vita. Nella mente di Pandora rimbombano le parole che il servo degli Aine le rivolse proprio qui: che la fede non è cieca obbedienza ma comprensione di forze più grandi, e che lui la lasciava andare perché lei era solo una pedina. Eppure ora, investita dall'aura sacra che emana da quel marmo, Pandora non sente alcuna guida superiore, ma solo una sensazione di freddo isolamento, come se una parete invisibile la separasse da ciò che gli altri riescono a percepire. Per la prima volta, un dubbio sottile e inquietante si insinua in lei: possibile che qualcosa dentro di lei si sia spezzato o allontanato dagli Asi senza che se ne rendesse conto? Intorno alla statua l'aria trema per il cedimento della bolla temporale, e il dito di pietra indica una precisa lastra del pavimento inclinato.",
            "ignoreText": "Vedendo il turbamento di Pandora e ricordando l'avvertimento che \"la vera conoscenza viene con un prezzo\", decidete di non indagare oltre e proseguite.",
            "successText": "Mentre Pandora resta in disparte, silenziosa e scossa da interrogativi a cui non sa dare risposta, Alastorta, Cassio e gli altri sollevano la lastra indicata dalla statua. Sotto di essa scoprite un diagramma anatomico scolpito dagli antichi costruttori: pur essendo circondato da quell'alfabeto runico di Loch Ein che Alastorta non ha mai visto in nessun testo del Nord, il disegno mostra chiaramente come disporre quei segni attorno al petto di chi possiede una scintilla ancestrale per schermarne il cuore e ritardare la consunzione mortale dell'Yrtite. Un silenzio pesante cala tra voi mentre realizzate chi, nel vostro gruppo, potrebbe possedere una simile scintilla nel sangue.",
            "failText": "Vi avvicinate con avidità alla base della statua cercando un tesoro materiale; una pesante ondata di vertigine e oppressione spirituale vi colpisce, lasciandovi scossi e indeboliti.",
            "stat": "fth",
            "cd": 8,
            "bonusEroi": { "alastorta_dignitas": 1, "pandora_dignitas": -1 },
            "reward": "diagramma_runico_cuore",
            "punishment": "ombra_sul_cuore"
        },
        "torrente_sotterraneo": {
            "title": "Il Torrente Sotterraneo",
            "desc": "Per passare dal quartiere matematico al settore occidentale imboccate un lungo corridoio di collegamento, ma scoprite che rispetto alla prima spedizione la situazione è drasticamente peggiorata: con l'indebolirsi della bolla dell'Yrtite, una fessura nella volta si è allargata trasformando il passaggio in un torrente impetuoso che trascina frammenti di pietra verso il baratro.",
            "ignoreText": "Tornate sui vostri passi e vi arrampicate sui tetti a punta delle case adiacenti per scavalcare il tratto allagato.",
            "successText": "Formate una catena umana assicurata con le corde alle colonne portanti e attraversate la corrente gelida senza lasciarvi trascinare via.",
            "failText": "La forza dell'acqua vi fa perdere l'equilibrio; venite trascinati per decine di metri lungo il pavimento inclinato, sbattendo contro i detriti prima di riuscire ad aggrapparvi a un arco di pietra.",
            "stat": "str",
            "cd": 8,
            "bonusEroi": { "temistocle_dignitas": 1, "ofelia_dignitas": 1 },
            "reward": "corda_canapa_intrecciata",
            "punishment": {
                "type": "injury",
                "name": "Trascinati dalla corrente",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "altare_albero_primordiale": {
            "title": "L'Altare dell'Albero Primordiale",
            "desc": "Scendete fino al centro dell'Anfiteatro semi-allagato nel settore occidentale, dove si erge l'imponente altare di pietra circondato dal mosaico di Yr Drazul, l'Albero Primordiale da cui proviene l'Yrtite. Sulla pietra vedete ancora le vecchie scalfitture lasciate più di un anno fa dalle spade di Adone e Lance, ma oggi l'altare emette un ronzio sordo e disarmonico: la stasi temporale sta perdendo colpi e le tessere del mosaico vibrano. Avvicinandosi alla sacralità primordiale del mosaico di Yr Drazul, Pandora avverte una fitta di vertigine quasi fisica ed è costretta a fermarsi ai margini dell'arena: si porta una mano alla fronte, incapace di spiegarsi perché ogni luogo toccato dal divino qui sotto sembri respingerla come un corpo estraneo, lasciandola con un senso di vuoto sempre più difficile da ignorare.",
            "ignoreText": "Vi tenete a distanza dall'altare pulsante e costeggiate il perimetro esterno dell'arena per proseguire.",
            "successText": "Mentre Alastorta e Cassio studiano i rilievi figurativi sull'altare – costretti a ignorare le iscrizioni runiche di Loch Ein, il cui alfabeto resta per loro indecifrabile – comprendete una verità fondamentale dalle scene scolpite sul mosaico di Yr Drazul: il ronzio disarmonico e la corruzione che serpeggiano nella città sono la risposta difensiva dell'Yrtite. Quando qualcosa o qualcuno privo della giusta scintilla ancestrale tenta di violare il cristallo, l'energia pura si trasforma in un veleno letale che infetta la carne e l'ambiente circostante.",
            "failText": "Toccate incautamente l'altare mentre le pietre luminescenti pulsavano al massimo; una scarica d'energia arcana fa tremare il pavimento instabile dell'anfiteatro e vi respinge con violenza.",
            "stat": "fth",
            "cd": 9,
            "bonusEroi": { "pancrazio_dignitas": 1, "pandora_dignitas": -1 },
            "reward": "reliquia_yr_drazul",
            "punishment": {
                "type": "injury",
                "name": "Scarica arcana",
                "desc": "Tutta la compagnia subisce 2 danni",
                "effects": [
                    { "effect": "party_damage", "val": 2 }
                ]
            }
        },
        "sotterranei_gladiatori": {
            "title": "I Sotterranei dei Gladiatori",
            "desc": "Per uscire dall'Anfiteatro imboccate le antiche celle sotterranee sotto le gradinate, dove l'acqua sta salendo sensibilmente a causa del lento cedimento della sospensione che regge il lago sopra Loch Ein. Notate una vecchia armeria dei guardiani cittadini chiusa da una grata arrugginita, al cui interno brillano metalli e attrezzi antichi, ma il soffitto sopra la grata scricchiola minacciosamente.",
            "ignoreText": "Non perdete tempo con la grata arrugginita e correte fuori dai sotterranei prima che il livello dell'acqua salga ancora.",
            "successText": "Forzate le sbarre corrose facendo leva con le armi in un unico movimento coordinato, afferrando ciò che resta nell'armeria prima che la stanza si allaghi del tutto.",
            "failText": "La grata cede di colpo ma fa crollare un blocco della volta; l'acqua gelida vi travolge in pieno chiudendovi momentaneamente la via d'uscita.",
            "stat": "int",
            "cd": 9,
            "bonusEroi": { "temistocle_dignitas": 1, "pancrazio_dignitas": 1 },
            "reward": {
                "type": "item",
                "name": "Armi dei Guardiani",
                "desc": "Chi ha forzato la grata ottiene una Spada in Lega di Kol",
                "effects": [
                    { "effect": "hero_item", "item": "spada_norgrad", "val": 1 }
                ]
            },
            "punishment": "gelo_nelle_ossa"
        },
        "torre_pendente_astrologo": {
            "title": "La Torre Pendente dell'Astrologo",
            "desc": "Risalendo dal settore occidentale entrate nel terzo grande distretto accademico di Loch Ein: il Quartiere delle Osservazioni Astronomiche, dominato da alte torri piegate come dita contorte nel buio. Una delle torri più alte poggia la sua cima contro il balcone del livello superiore, offrendo un ponte improvvisato verso il centro cittadino. All'interno vedete brillare strumenti ottici e pergamene dei Firmamentisti che forse spiegano come schermare l'energia dell'Yrtite, ma la torre geme sotto le anomalie della stasi morente.",
            "ignoreText": "Evitate di entrare in una torre che sembra sul punto di spezzarsi in due e proseguite per la strada esterna.",
            "successText": "Camminate in equilibrio sulle pareti interne della torre inclinata, recuperando i manoscritti astronomici e uscendo dal balcone superiore senza provocare scosse. Tra le pergamene salvate, Cassio e Alastorta trovano i disegni di un Firmamentista: l'alfabeto runico di Loch Ein usato nel testo è totalmente sconosciuto al Primarca, ma le illustrazioni mostrano passo dopo passo la geometria esatta dei glifi da ricopiare sulla pelle o sulle vesti. Non esiste modo di annullare il sacrificio richiesto a chi impugna l'Yrtite, ma replicando fedelmente quelle forme sconosciute – come Foscoclivo ha provato a fare con il proprio alfabeto runico – è possibile indebolire e ritardare il decorso dell'avvelenamento, concedendo al portatore il tempo di fuggire dagli abissi.",
            "failText": "Il vostro peso altera il precario equilibrio della struttura; il pavimento interno cede e siete costretti a correre a perdifiato mentre la torre sprofonda di diversi metri verso il baratro.",
            "stat": "int",
            "cd": 9,
            "bonusEroi": { "cassio_dignitas": 1, "ofelia_dignitas": 1 },
            "reward": "pergamena_rune_rallentamento",
            "punishment": {
                "type": "injury",
                "name": "La torre sprofonda",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "cristallo_infetto": {
            "title": "Il Cristallo Infetto",
            "desc": "Scendendo lungo l'arteria che porta al cuore della città, trovate al centro di un incrocio una grossa scheggia di minerale caduta dal soffitto che pulsa di una luce malata, tra l'azzurro dell'Yrtite e il viola della corruzione. L'aria intorno distorce i suoni e ripete in eco i vostri stessi passi di pochi secondi prima. Osservando la luce malata della scheggia, capite cosa è successo laggiù nel Palazzo: l'infezione di Loch Ein è nata come un avvelenamento scaturito quando qualcuno di indegno – o un'entità estranea – ha toccato l'Yrtite senza possedere la necessaria affinità ancestrale. Alastorta realizza di colpo una verità storica agghiacciante: la grande pestilenza che nel 178 d.F. dilagò da Loch Ein sterminando due terzi di Cràil e piegando il Regno di Eòghar non fu un'epidemia naturale, ma l'ondata di questo stesso avvelenamento sprigionatasi quando Eòghleb V e Mag Cuibbe violarono l'Yrtite senza poterla reggere! Vi chiedete con angoscia se quella stessa condanna velenosa divorerà anche chi tra voi si sacrificherà per prenderla.",
            "ignoreText": "Vi coprite il volto e passate il più lontano possibile dalla scheggia pulsante, proseguendo verso la piazza centrale.",
            "successText": "Studiando la risonanza del cristallo a distanza di sicurezza con gli strumenti alchemici di Cassio, riuscite a isolarne la frequenza senza farvi contaminare. Confermate la vostra teoria: l'Yrtite avvelena all'istante la carne comune, ma chi possiede una scintilla connessa alle forze degli Asi o degli Spiriti può resistere all'impatto iniziale e, se protetto da rune d'isolamento, può rallentare il veleno abbastanza a lungo da compiere la risalita.",
            "failText": "Vi avvicinate troppo per esaminare la scheggia; un'onda d'urto psichica e corrosiva vi investe, lasciandovi con la nausea e le membra intorpidite.",
            "stat": "int",
            "cd": 9,
            "bonusEroi": { "cassio_dignitas": 1, "ofelia_dignitas": 1 },
            "reward": "fiala_risonanza_purificata",
            "punishment": "terrore_riflesso"
        },
        "statua_antico_sovrano": {
            "title": "La Statua Pendente dell'Antico Sovrano",
            "desc": "Avanzate nella Grande Piazza Circolare inclinata fino a raggiungere la grande statua pendente dell'antico sovrano di Loch Ein. Alastorta, Pancrazio e Cassio riconoscono all'istante il basamento di cui avevano ricopiato i rilievi nella prima spedizione, ma mostrano a Ofelia, Pandora e Temistocle un dettaglio allarmante: a causa del progressivo cedimento della sospensione temporale, la statua si è inclinata ancora di più rispetto alla prima spedizione, aprendo una fessura nella pietra che rivela un incavo rimasto celato durante la prima spedizione.",
            "ignoreText": "Lasciate stare la statua pendente; la piazza è troppo esposta e preferite avanzare rapidamente.",
            "successText": "Utilizzando le conoscenze già acquisite sui rilievi della piazza, sbloccate l'incavo alla base della statua prima che la struttura inclinata possa assestarsi. All'interno trovate una lastra incisa dei sovrani di Loch Ein: sebbene i caratteri runici appartengano a quell'alfabeto antico che Alastorta non ha mai visto prima, lo schema geometrico inciso al centro mostra chiaramente come collegare tra loro i glifi copiati finora per frenare l'avvelenamento dell'Yrtite sul corpo di un portatore, ritardando la corruzione quel tanto che basta per compiere la missione.",
            "failText": "Il meccanismo alla base è bloccato dal calcare; forzandolo fate inclinare ulteriormente la pesante statua del sovrano, che fa staccare una pioggia di lastre di pietra sulla piazza.",
            "stat": "int",
            "cd": 9,
            "bonusEroi": { "alastorta_dignitas": 1, "cassio_dignitas": 1, "pancrazio_dignitas": 1 },
            "reward": "lastra_runica_sovrani",
            "punishment": {
                "type": "injury",
                "name": "Pioggia di lastre",
                "desc": "Tutta la compagnia subisce 2 danni",
                "effects": [
                    { "effect": "party_damage", "val": 2 }
                ]
            }
        },
        "incisioni_bordo_piazza": {
            "title": "Le Incisioni sul Bordo della Piazza",
            "desc": "Iniziate a salire gli ampi gradoni che dalla piazza portano al Palazzo dei Firmamentisti. Cassio indica ad Alastorta, Ofelia, Pandora, Pancrazio e Temistocle la serie di incisioni secondarie lungo la salita che non era riuscito a studiare a fondo oltre un anno fa a causa dell'improvviso attacco di Eldric. L'acqua che scorre veloce lungo la scalinata per il cedimento della volta le sta erodendo, ma quei glifi sembrano descrivere proprio la natura del sigillo dell'Yrtite e come contenerne la furia.",
            "ignoreText": "Salite rapidamente i gradoni ignorando le iscrizioni sotto l'acqua, concentrandovi solo sull'ingresso del Palazzo.",
            "successText": "Deviate temporaneamente il flusso d'acqua con dei detriti: confrontando i bassorilievi della scalinata con gli schemi geometrici raccolti in città, Alastorta e Cassio riescono a ricostruire il funzionamento del sigillo pur senza conoscere l'alfabeto runico di Loch Ein, così diverso sia da quello del Nord sia da quello di Foscoclivo. Il quadro è ormai drammaticamente chiaro: per portare via l'Yrtite dal Salone delle Risposte sarà inevitabile il sacrificio di uno di voi. Dovrà essere qualcuno in sintonia con le energie primordiali e dovrete usare le rune apprese lungo il cammino per indebolire e ritardare l'avvelenamento che cercherà di consumarlo passo dopo passo durante la fuga. Nessuno osa pronunciare il nome ad alta voce, ma lo sguardo di Alastorta è già fisso verso le porte del Palazzo.",
            "failText": "Mentre siete chini a esaminare il bordo della piazza, un'ondata improvvisa di fango e detriti scende dalla scalinata, travolgendovi e facendovi scivolare indietro.",
            "stat": "int",
            "cd": 9,
            "reward": "occhio_del_corvo",
            "punishment": {
                "type": "injury",
                "name": "Ondata di fango",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "muro_perimetrale_instabile": {
            "title": "Il Muro Perimetrale Instabile",
            "desc": "Per aggirare la scalinata centrale del Palazzo dei Firmamentisti ed evitare il punto in cui nella prima spedizione cadde in trappola il gruppo di Alastorta, Ofelia e Temistocle propongono di arrampicarsi lungo l'ala laterale dell'edificio. Le mura inclinate mostrano però i segni dell'agonia del ciclo temporale che ha protetto Loch Ein per anni: la pietra geme e presenta diverse crepe da cui filtra acqua ad alta pressione.",
            "ignoreText": "Desistete dalla scalata laterale e tornate verso il viale d'accesso principale.",
            "successText": "Sfruttate i cornicioni in marmo e salite fino al terrazzo d'ingresso con rapidità, evitando i getti d'acqua e le pietre smosse.",
            "failText": "Un cornicione cede sotto le vostre mani proprio mentre una fessura esplode in un getto d'acqua gelida, facendovi precipitare rovinosamente sulla base della scalinata.",
            "stat": "int",
            "cd": 9,
            "bonusEroi": { "temistocle_dignitas": 1, "ofelia_dignitas": 1 },
            "reward": "stivali_chiodati_scalata",
            "punishment": "bruciature_da_gelo"
        },
        "colonna_di_pancrazio": {
            "title": "La Colonna Crollata di Pancrazio",
            "desc": "Raggiungete il piazzale davanti alle porte massicce spalancate a metà del Palazzo dei Firmamentisti. Pancrazio si ferma di colpo fissando la scena con un brivido: sopra di voi, la crepa nella volta che si era aperta oltre due anni fa riversa ancora una cascata incessante sul pavimento allagato, mentre ai vostri piedi giace la colossale colonna di pietra che gli aveva schiacciato la gamba un istante dopo aver costretto Eldric alla resa. Le cinghie di cuoio sono marcite sotto l'acqua di questi anni, ma sotto il bordo del marmo incrostato di calcare Pancrazio scorge ancora luccicare l'acciaio del proprio scudo dei Dignitas — rimasto sepolto lì nel punto in cui lo aveva gettato via per saltare alla gola di Eldric a mani nude.",
            "ignoreText": "L'acqua scende con troppa violenza e il resto del colonnato minaccia di cedere; lasciate lo scudo sotto il masso e vi preparate ad avanzare.",
            "successText": "Facendo leva con aste di ferro e lavorando in perfetta sincronia sotto lo scroscio dell'acqua, sollevate il blocco quel tanto che basta per estrarre le reliquie di famiglia senza subire danni.",
            "failText": "Il terreno allagato cede mentre fate leva; la colonna ruota su sé stessa schiacciando le vostre aste e investendovi con un'onda d'acqua e schegge di pietra.",
            "stat": "str",
            "cd": 9,
            "bonusEroi": { "pancrazio_dignitas": 1 },
            "reward": "scudo_dei_dignitas",
            "punishment": {
                "type": "injury",
                "name": "Acqua e schegge di pietra",
                "desc": "Tutta la compagnia subisce 2 danni",
                "effects": [
                    { "effect": "party_damage", "val": 2 }
                ]
            }
        }
    },
    "merchants": {
        "default": "Un mercante di passaggio vi mostra la sua merce.",
        "contrabbandiere_di_reliquie": "Uscite dal tunnel e l'oscurità si apre davanti a voi mostrando l'impossibile panorama di Loch Ein: l'intera città giace inclinata in un angolo vertiginoso sopra un abisso senza fondo, sotto un \"cielo\" di cristalli luminescenti. Rispetto alla prima spedizione, tuttavia, notate che diversi cristalli della volta lampeggiano e si spengono a intermittenza. Appena oltre la soglia della città, dentro una torre spezzata, trovate un cacciatore di tesori solitario giunto fin qui seguendo gli appunti di Roderic, il nonno di Baldrick. L'uomo vi vende volentieri reperti e unguenti che conta di piazzare attraverso i canali del Mercato Nero di Seistad per eludere i Tabarri Verdi e la Tassa Esotica, ma vi confessa di voler risalire presto: secondo lui la stasi che tiene sospesa la città sta morendo, e non capisce se siano stati gli uomini di Foscoclivo a danneggiare il materiale laggiù o se siano venuti in fretta proprio perché sapevano dell'imminente fine del ciclo.",
        "vedetta_guardie_del_lupo": "Attraversando il Quartiere dei Calcoli Matematici, dove il gocciolio dalla volta si è fatto incessante, notate un segnale convenzionale inciso di fresco su un arco asciutto. All'interno trovate un esploratore solitario, inviato in avanscoperta segreta da Seistad settimane fa non appena la Torre Spiavento aveva rilevato i movimenti del Cenn. Ha accumulato scorte, unguenti alchemici e armi recuperate nell'ombra per supportare il vostro arrivo. Mentre vi rifornite, vi riferisce un dettaglio agghiacciante: ha visto il grosso delle forze di Foscoclivo dirigersi verso il Palazzo Centrale agli ordini degli emissari dei Cavalcantici, scortando al centro delle file un uomo incappucciato col corpo interamente inciso con quell'oscuro alfabeto runico di Foscoclivo, diverso sia dai segni di Loch Ein sia dalle rune del Nord, sorvegliato a vista come un sacrificio vivente.",
        "alchimista_disertore_anoeth": "Sbucate finalmente ai margini della Grande Piazza Circolare inclinata, il cuore monumentale di Loch Ein che Alastorta, Pancrazio e Cassio ricordano bene, circondato da edifici con mosaici celesti. Nascosto dietro un colonnato, Ofelia e Temistocle individuano uno studioso e cerusico al seguito della spedizione di Foscoclivo che, terrorizzato dalle distorsioni temporali e dall'infezione, ha disertato. Pur di aver salva la vita vi vende le sue scorte mediche e belliche, svelandovi a mezza voce tutta la verità: a comandare i Cavalcantici non sono mai stati guerrieri come Eldric o la defunta Morwenna, bensì gli Otto. Quando gli Otto hanno calcolato che il ciclo cinquantennale dell'Yrtite innescato nel 178 d.F. stava per esaurirsi, hanno inviato un Portatore sacrificale coperto di rune del loro alfabeto per estrarre il cristallo; ma il primo tentativo ha provocato una violenta reazione d'avvelenamento perché solo chi possiede una vera scintilla ancestrale può stringere il cuore di Yr Drazul senza esserne corrotto all'istante."
    },
    "rests": {
        "default": "Trovate un angolo asciutto e riposate qualche ora.",
        "casa_finestre_a_stella": "Lasciati i vicoli iniziali, entrate nel Quartiere degli Oroscopi, uno dei distretti specializzati degli antichi astrologi di Loch Ein. Trovate un'abitazione miracolosamente intatta nonostante l'inclinazione, il cui pavimento è ancora ricoperto dai pregiati tappeti in lana di pecora di Cràil, tessuti dalle donne della città prima del Disastro del 178 d.F.; tuttavia, non appena li calpestate, notate che le fibre conservate intatte per cinquant'anni iniziano a cedere e a polverizzarsi ai bordi, segno che il tempo sta riprendendo a scorrere nella città sommersa. Sbarrate la porta per riposare sotto le finestre a forma di stella, ma i pensieri vi tormentano: perché il ciclo eterno che regge Loch Ein si sta spezzando proprio ora? Foscoclivo ha già staccato un pezzo di Yrtite laggiù nel Palazzo, oppure i cosiddetti \"Otto\" che guidano i Cavalcantici avevano previsto la fine della stasi e si sono precipitati qui prima del crollo? E soprattutto: come farete voi a prendere quel cristallo senza morire?",
        "osservatorio_minore": "Uscendo dal quartiere matematico in direzione del settore occidentale della città, vi chiudete all'interno di una piccola cupola astronomica ancora asciutta. Guardando attraverso il lucernario verso il \"firmamento\" della caverna, assistete a uno spettacolo inquietante: i cristalli luminescenti del soffitto pulsano fuori tempo e la roccia intorno a essi trasuda acqua. Il ciclo che dal 178 dopo la Fondazione ha tenuto Loch Ein sospesa tra l'essere e il non-essere per oltre cinquant'anni sta giungendo al termine. Mentre riposate, vi chiedete se i Cavalcantici abbiano già intaccato l'Yrtite provocando questa fine, o se si siano sbrigati a scendere proprio perché sapevano che il tempo di Loch Ein stava scadendo.",
        "santuario_delle_stelle": "Nel cuore del Quartiere delle Osservazioni Astronomiche trovate una sala di raccoglimento rivestita di affreschi stellari e icone domestiche dedicate a Ceart e agli antichi Atani, protetta da solide arcate di pietra. L'ambiente è asciutto e sicuro, ideale per riprendere fiato mentre fuori sentite l'eco lontana di strutture che si assestano. Mentre il gruppo si interroga su come sottrarre l'Yrtite ai Cavalcantici, Pandora rimane seduta vicino all'uscita con lo sguardo cupo: ripensando al fervore con cui a Seistad l'Eparca reggente Doroteo Dignitas sta imponendo il culto degli Asi contro la memoria degli Atani, prova a mormorare tra sé una preghiera agli Asi come faceva un tempo per ritrovare la calma, ma le parole le muoiono sulle labbra come suoni vuoti, privi di qualsiasi eco interiore. Si stringe nelle spalle, tormentata da un dubbio che non riesce ancora a decifrare del tutto: cos'è cambiato dentro di lei, e perché gli Asi non le rispondono più?",
        "portico_riparato": "A pochi passi dall'ampio ingresso in marmo del Palazzo dei Firmamentisti, trovate un angolo asciutto sotto il massiccio architrave del portico, protetto dagli spruzzi della cascata grazie ai resti delle colonne rimaste in piedi. Mentre Ofelia e Cassio preparano gli unguenti e ricopiano con estrema cura sulle fasce le forme di quell'alfabeto runico di Loch Ein a loro sconosciuto, e Pancrazio e Temistocle controllano le armi, Pandora fissa in silenzio le volte del Palazzo con quel dubbio irrisolto che continua a scavarle dentro senza darle una risposta chiara. Accanto a loro, Alastorta sente il pavimento vibrare sotto il proprio bastone: là sotto il ciclo dell'Yrtite sta per spezzarsi.",
        "loggia_guardie_cittadine": "Vi rifugiate in un antico corpo di guardia adiacente alle porte del Palazzo dei Firmamentisti, dove il pavimento inclinato ha tenuto fuori l'acqua dell'allagamento. Cassio accende un piccolo fuoco per scaldarvi le membra intirizzite. Dalle voci pesanti che echeggiano oltre l'atrio, Pancrazio riconosce con un ringhio il timbro roco del colosso che affrontò qui fuori più di un anno fa, rimasto a presidiare la soglia mentre gli emissari dei Cavalcantici tentano di imbrigliare l'Yrtite prima che la sospensione di Loch Ein collassi."
    },
    "treasures": {},
    "stories": {
        "trama_meta_percorso": { "title": "Il cuore di Loch Ein", "text": "" }
    },
    "lootItems": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "ankh_pellegrino", "bastone_eremita", "balsamo_curativo", "spada_norgrad", "alabarda_guardia", "mannaia_pesante", "scudo_ferro", "corazza_scaglie", "tomo_proibito", "reliquiario_tascabile", "martello_consacrato", "brigantina_benedetta", "stocco_duellante", "pozione_rigenerazione", "unguento_fortificante", "lama_acciaio_lunare", "martello_breccia", "gorgiera_veterano", "corazza_piastre_leone", "cappa_sussurri", "simbolo_jag_antar", "scettro_savio", "corona_martire", "elisir_sangue_vivo", "olio_bollente", "bomba_acido", "cristallo_flammaurea", "grappa_soldato", "infuso_corteccia", "olio_da_lama", "pozione_pelle_pietra", "elisir_berserker", "corno_allman", "ascia_primo_sangue", "mazza_boia_seistad", "scudo_spina_kranen", "catena_ghiacceterno", "talismano_corvo", "mappa_contrabbandiere", "dado_osso_gunnar", "lingua_argento", "occhio_gazza", "coperta_rurikstad", "erbario_fonnish", "spadone_primo_sangue", "ascia_carnefice_glostok", "pugnale_succhiasangue", "lama_ghiaccio_hvid", "corazza_ultimo_baluardo", "spada_affilata", "ascia_pesante", "armatura_leggera_loot", "armatura_pesante_loot", "pozione", "amuleto", "anello", "scudo_pesante", "stilo_da_battaglia", "turibolo_ferrato", "rosario_del_pellegrino", "bastone_runico_del_dotto", "mazza_votiva", "scudo_del_sacerdote", "astrolabio_tattico", "guanti_runici_erudito", "bastone_dei_giusti"],
    "mapNodes": [
        { "id": 0, "level": 0, "x": 330, "type": "combat", "title": "Livello 1 - Le Stalattiti Viventi", "icon": "🗡️", "done": false, "active": true, "next": [2, 3], "image": "immagini/le_stalattiti_viventi.webp", "enemy": "mantombre_stalattiti" },
        {
            "id": 1,
            "level": 0,
            "x": 550,
            "type": "challenge",
            "title": "Livello 1 - Le Correnti del Passaggio Subacqueo",
            "icon": "❓",
            "done": false,
            "active": true,
            "next": [3, 4],
            "image": "immagini/le_correnti_del_passaggio_subacqueo.webp",
            "challengeId": "correnti_passaggio_subacqueo"
        },
        { "id": 2, "level": 1, "x": 220, "type": "combat", "title": "Livello 2 - I Guardiani dei Giacimenti", "icon": "🗡️", "done": false, "active": false, "next": [5], "image": "immagini/i_guardiani_dei_giacimenti.webp", "enemy": "golem_dei_giacimenti" },
        {
            "id": 3,
            "level": 1,
            "x": 440,
            "type": "challenge",
            "title": "Livello 2 - La Risonanza della Pietra di Volta",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [5, 6],
            "image": "immagini/la_risonanza_della_pietra_di_volta.webp",
            "challengeId": "risonanza_pietra_di_volta"
        },
        { "id": 4, "level": 1, "x": 660, "type": "combat", "title": "Livello 2 - Lo Stormo della Spelonca", "icon": "🗡️", "done": false, "active": false, "next": [6], "image": "immagini/lo_stormo_della_spelonca.webp", "enemy": "stormo_della_spelonca" },
        {
            "id": 5,
            "level": 2,
            "x": 330,
            "type": "merchant",
            "title": "Livello 3 - Il Contrabbandiere di Reliquie",
            "icon": "🪙",
            "done": false,
            "active": false,
            "next": [7, 8],
            "image": "immagini/il_contrabbandiere_di_reliquie.webp",
            "merchantId": "contrabbandiere_di_reliquie"
        },
        {
            "id": 6,
            "level": 2,
            "x": 550,
            "type": "challenge",
            "title": "Livello 3 - Le Scalinate Verso il Nulla",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [8, 9],
            "image": "immagini/le_scalinate_verso_il_nulla.webp",
            "challengeId": "scalinate_verso_il_nulla"
        },
        { "id": 7, "level": 3, "x": 220, "type": "combat", "title": "Livello 4 - I Becchini delle Rovine", "icon": "🗡️", "done": false, "active": false, "next": [10], "image": "immagini/i_becchini_delle_rovine.webp", "enemy": "mastini_bokgar_rovine" },
        {
            "id": 8,
            "level": 3,
            "x": 440,
            "type": "combat",
            "title": "Livello 4 - Le Sentinelle dei Cavalcantici",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [10, 11],
            "image": "immagini/le_sentinelle_dei_cavalcantici.webp",
            "enemy": "sentinelle_cavalcantici"
        },
        { "id": 9, "level": 3, "x": 660, "type": "challenge", "title": "Livello 4 - Il Mosaico Verticale", "icon": "❓", "done": false, "active": false, "next": [11], "image": "immagini/il_mosaico_verticale.webp", "challengeId": "mosaico_verticale" },
        {
            "id": 10,
            "level": 4,
            "x": 330,
            "type": "rest",
            "title": "Livello 5 - La Casa dalle Finestre a Stella",
            "icon": "⛺",
            "done": false,
            "active": false,
            "next": [12, 13],
            "image": "immagini/01_casa_dalle_finestre_a_stella.webp",
            "restId": "casa_finestre_a_stella"
        },
        {
            "id": 11,
            "level": 4,
            "x": 550,
            "type": "challenge",
            "title": "Livello 5 - L'Astrolabio dei Firmamentisti",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [13, 14],
            "image": "immagini/10_osservatorio_minore.webp",
            "challengeId": "astrolabio_firmamentisti"
        },
        { "id": 12, "level": 5, "x": 220, "type": "elite", "title": "Livello 6 - L'Agente dell'Ombra", "icon": "👹", "done": false, "active": false, "next": [15], "image": "immagini/03_agente_dell_ombra.webp", "enemy": "agente_ombra_anoeth" },
        {
            "id": 13,
            "level": 5,
            "x": 440,
            "type": "challenge",
            "title": "Livello 6 - La Stanza Divisa dal Crollo",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [15, 16],
            "image": "immagini/04_stanza_divisa_dal_crollo.webp",
            "challengeId": "stanza_divisa_dal_crollo"
        },
        { "id": 14, "level": 5, "x": 660, "type": "combat", "title": "Livello 6 - Il Banchetto sul Sangue Versato", "icon": "🗡️", "done": false, "active": false, "next": [16], "image": "immagini/05_banchetto_sul_sangue_versato.webp", "enemy": "ghoul_sangue_versato" },
        {
            "id": 15,
            "level": 6,
            "x": 330,
            "type": "challenge",
            "title": "Livello 7 - La Statua che Indica",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [17, 18],
            "image": "immagini/la_statua_e_la_lastra_celeste_di_loch_ein.webp",
            "challengeId": "statua_che_indica"
        },
        { "id": 16, "level": 6, "x": 550, "type": "combat", "title": "Livello 7 - Le Fiere degli Abissi", "icon": "🗡️", "done": false, "active": false, "next": [18, 19], "image": "immagini/07_fiere_degli_abissi.webp", "enemy": "gropiceri_degli_abissi" },
        { "id": 17, "level": 7, "x": 220, "type": "combat", "title": "Livello 8 - Gli Spettri tra le Colonne", "icon": "🗡️", "done": false, "active": false, "next": [20], "image": "immagini/09_inondazione_dei_necubri.webp", "enemy": "spettro_tra_le_colonne" },
        { "id": 18, "level": 7, "x": 440, "type": "merchant", "title": "Livello 8 - L'Informatore", "icon": "🪙", "done": false, "active": false, "next": [20, 21], "image": "immagini/avamposto_delle_guardie_del_lupo.webp", "merchantId": "vedetta_guardie_del_lupo" },
        {
            "id": 19,
            "level": 7,
            "x": 660,
            "type": "combat",
            "title": "Livello 8 - L'Inondazione dei Nècubri",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [21],
            "image": "immagini/inondazione_nella_citta_sotterranea_in_rovina.webp",
            "enemy": "necubri_inondazione"
        },
        { "id": 20, "level": 8, "x": 330, "type": "rest", "title": "Livello 9 - L'Osservatorio Minore", "icon": "⛺", "done": false, "active": false, "next": [22], "image": "immagini/01_casa_dalle_finestre_a_stella.webp", "restId": "osservatorio_minore" },
        { "id": 21, "level": 8, "x": 550, "type": "challenge", "title": "Livello 9 - Il Torrente Sotterraneo", "icon": "❓", "done": false, "active": false, "next": [22], "image": "immagini/il_torrente_sotterraneo.webp", "challengeId": "torrente_sotterraneo" },
        { "id": 22, "level": 9, "x": 440, "type": "story", "title": "Livello 10 - Il cuore di Loch Ein", "icon": "📜", "done": false, "active": false, "next": [23, 24, 25], "image": "", "storyId": "trama_meta_percorso" },
        { "id": 23, "level": 10, "x": 220, "type": "combat", "title": "Livello 11 - Le Gradinate Spezzate", "icon": "🗡️", "done": false, "active": false, "next": [26], "image": "immagini/le_gradinate_spezzate.webp", "enemy": "aracnomantropi_gradinate" },
        {
            "id": 24,
            "level": 10,
            "x": 440,
            "type": "challenge",
            "title": "Livello 11 - L'Altare dell'Albero Primordiale",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [26, 27],
            "image": "immagini/altare_dell_albero_nelle_rovine_sommers.webp",
            "challengeId": "altare_albero_primordiale"
        },
        { "id": 25, "level": 10, "x": 660, "type": "combat", "title": "Livello 11 - Le Acque dell'Arena", "icon": "🗡️", "done": false, "active": false, "next": [27], "image": "immagini/le_acque_dell_arena.webp", "enemy": "predatori_acque_arena" },
        {
            "id": 26,
            "level": 11,
            "x": 330,
            "type": "elite",
            "title": "Livello 12 - Il Campione di Foscoclivo",
            "icon": "👹",
            "done": false,
            "active": false,
            "next": [28, 29],
            "image": "immagini/guerriero_di_willwood_nella_sala_in_rovina.webp",
            "enemy": "campione_di_foscoclivo"
        },
        {
            "id": 27,
            "level": 11,
            "x": 550,
            "type": "challenge",
            "title": "Livello 12 - I Sotterranei dei Gladiatori",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [29, 30],
            "image": "immagini/i_sotterranei_dei_gladiatori.webp",
            "challengeId": "sotterranei_gladiatori"
        },
        {
            "id": 28,
            "level": 12,
            "x": 220,
            "type": "challenge",
            "title": "Livello 13 - La Torre Pendente dell'Astrologo",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [31],
            "image": "immagini/osservatorio_astrale_tra_le_rovine.webp",
            "challengeId": "torre_pendente_astrologo"
        },
        { "id": 29, "level": 12, "x": 440, "type": "combat", "title": "Livello 13 - I Tessitori del Buio", "icon": "🗡️", "done": false, "active": false, "next": [31, 32], "image": "immagini/i_tessitori_del_buio.webp", "enemy": "tessitori_del_buio" },
        { "id": 30, "level": 12, "x": 660, "type": "rest", "title": "Livello 13 - Il Santuario delle Stelle", "icon": "⛺", "done": false, "active": false, "next": [32], "image": "immagini/il_santuario_delle_stelle.webp", "restId": "santuario_delle_stelle" },
        {
            "id": 31,
            "level": 13,
            "x": 330,
            "type": "combat",
            "title": "Livello 14 - Le Fiere Corrotte dall'Abisso",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [33, 34],
            "image": "immagini/le_fiere_corrotte_dall_abisso.webp",
            "enemy": "fiere_corrotte_abisso"
        },
        { "id": 32, "level": 13, "x": 550, "type": "challenge", "title": "Livello 14 - Il Cristallo Infetto", "icon": "❓", "done": false, "active": false, "next": [34, 35], "image": "immagini/il_cristallo_infetto.webp", "challengeId": "cristallo_infetto" },
        {
            "id": 33,
            "level": 14,
            "x": 220,
            "type": "merchant",
            "title": "Livello 15 - L'Alchimista Disertore di Anoeth",
            "icon": "🪙",
            "done": false,
            "active": false,
            "next": [36],
            "image": "immagini/l_alchimista_disertore_di_anoeth.webp",
            "merchantId": "alchimista_disertore_anoeth"
        },
        {
            "id": 34,
            "level": 14,
            "x": 440,
            "type": "challenge",
            "title": "Livello 15 - La Statua Pendente dell'Antico Sovrano",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [36, 37],
            "image": "immagini/la_statua_pendente_dell_antico_sovrano.webp",
            "challengeId": "statua_antico_sovrano"
        },
        { "id": 35, "level": 14, "x": 660, "type": "combat", "title": "Livello 15 - La Ronda della Piazza", "icon": "🗡️", "done": false, "active": false, "next": [37], "image": "immagini/carica_dei_clan_del_bosco_selvaggio.webp", "enemy": "ronda_della_piazza" },
        {
            "id": 36,
            "level": 15,
            "x": 330,
            "type": "elite",
            "title": "Livello 16 - Il Golem di Cristallo e Pirite",
            "icon": "👹",
            "done": false,
            "active": false,
            "next": [38, 39],
            "image": "immagini/il_golem_di_cristallo_e_pirite.webp",
            "enemy": "golem_cristallo_pirite"
        },
        { "id": 37, "level": 15, "x": 550, "type": "combat", "title": "Livello 16 - Gli Abomini delle Acque Alte", "icon": "🗡️", "done": false, "active": false, "next": [39, 40], "image": "immagini/gli_abomini_delle_acque_alte.webp", "enemy": "esuridi_acque_alte" },
        {
            "id": 38,
            "level": 16,
            "x": 220,
            "type": "challenge",
            "title": "Livello 17 - Le Incisioni sul Bordo della Piazza",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [41],
            "image": "immagini/scalinata_incisa_verso_il_palazzo_arcano.webp",
            "challengeId": "incisioni_bordo_piazza"
        },
        { "id": 39, "level": 16, "x": 440, "type": "combat", "title": "Livello 17 - L'Imboscata sui Gradoni", "icon": "🗡️", "done": false, "active": false, "next": [41, 42], "image": "immagini/l_assalto_dei_guerrieri_willwood.webp", "enemy": "imboscata_sui_gradoni" },
        {
            "id": 40,
            "level": 16,
            "x": 660,
            "type": "challenge",
            "title": "Livello 17 - Il Muro Perimetrale Instabile",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [42],
            "image": "immagini/il_muro_perimetrale_instabile.webp",
            "challengeId": "muro_perimetrale_instabile"
        },
        {
            "id": 41,
            "level": 17,
            "x": 330,
            "type": "challenge",
            "title": "Livello 18 - La Colonna Crollata di Pancrazio",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [43],
            "image": "immagini/rovine_di_loch_ein_e_scudo_dignitas.webp",
            "challengeId": "colonna_di_pancrazio"
        },
        {
            "id": 42,
            "level": 17,
            "x": 550,
            "type": "combat",
            "title": "Livello 18 - Le Ombre della Cascata",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [44],
            "image": "immagini/predatori_d_ombra_alla_cascata_infuocata.webp",
            "enemy": "ombre_della_cascata"
        },
        { "id": 43, "level": 18, "x": 330, "type": "rest", "title": "Livello 19 - Il Portico Riparato", "icon": "⛺", "done": false, "active": false, "next": [45], "image": "immagini/accampamento_tra_rovine_e_cascate.webp", "restId": "portico_riparato" },
        {
            "id": 44,
            "level": 18,
            "x": 550,
            "type": "rest",
            "title": "Livello 19 - La Loggia delle Guardie Cittadine",
            "icon": "⛺",
            "done": false,
            "active": false,
            "next": [45],
            "image": "immagini/rifugio_alchemico_sotto_il_palazzo_bagnato.webp",
            "restId": "loggia_guardie_cittadine"
        },
        { "id": 45, "level": 19, "x": 440, "type": "combat", "title": "Livello 20 - La Furia di Eldric e il Blocco di Foscoclivo", "icon": "👑", "done": false, "active": false, "next": [], "image": "", "enemy": "eldric_dei_cavalcantici" }
    ]
};
