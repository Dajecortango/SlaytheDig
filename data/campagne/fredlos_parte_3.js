// Campagna "Fredlös, Parte III: La Caccia a Kesia".
// Il contenuto dopo "=" è JSON puro: niente funzioni, gli effetti sono descritti nei campi "effects"
// e interpretati da applyEffects() in js/game.js. È un file .js (e non .json) perché il gioco
// si apre con doppio click da file:// e il browser blocca fetch() di file locali.
// Nemici, oggetti, reliquie e maledizioni sono richiamati per id da data/libreria/.
window.CAMPAIGNS = window.CAMPAIGNS || {};
window.CAMPAIGNS["fredlos_parte_3"] = {
    "id": "fredlos_parte_3",
    "title": "Fredlös, Parte III: La Caccia a Kesia",
    "avventura": "fredlos",
    "capitolo": 3,
    "difficolta": { "vittoriaMin": 15, "vittoriaMax": 35 },
    "terreno": "neve",
    "badge": "Parte III",
    "description": "Da Svalbard alla Bocca del Bianco: il fiume Vorma, il Cammino di Piotr, il Ponte di Porunn sul Driva, il Deserto del Kalle e Kallekot, fino all'orlo del Ghiacceterno dove Kesia vi attende per l'ultima prova.",
    "coverImage": "immagini/fredlos_parte_2/13a_bufera_bianca_sulla_piana.webp",
    "introText": "Spezzato il blocco del Campione degli Skallgrim davanti ai cancelli di Svalbard, vi lasciate alle spalle le mura della città per proseguire il vostro inseguimento. Kesia corre verso nord-est: oltrepassato il fiume Vorma dovrete imboccare il Cammino di Piotr, attraversare il fiume Driva sul Ponte di Porunn, tagliare le lande del Kalle fino a Kallekot e affrontare infine i venti letali della Bocca del Bianco, sul limitare del Ghiacceterno.",
    "heroes": ["enea_dignitas", "aiace_dignitas", "zeno", "aurelio_dignitas"],
    "initialArmory": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "balsamo_curativo", "stilo_da_battaglia", "turibolo_ferrato", "rosario_del_pellegrino"],
    "challenges": {
        "bracieri_d_allarme": {
            "title": "I Bracieri d'Allarme della Via Nord",
            "desc": "Lungo la via che sale da Svalbard verso il ponte sul fiume Vorma, al limitare della Selva delle Bianche Betulle, Kesia ha dato fuoco con una scintilla della sua magia alle cataste di legna secca e pece di tre torrette di segnalazione risalenti alla Guerra dei Quaranta Giorni. Se il fumo nero dovesse alzarsi nel cielo limpido, l'intero presidio di Svalbard e i superstiti sbandati del bellicoso clan Braggart che un tempo abitava la selva convergerebbero sulla vostra posizione, trasformando l'inseguimento in un incidente diplomatico e militare. Zeno ed Aiace pensano subito che occorra un intervento rapido e coordinato per soffocare le cataste prima che la colonna di fumo superi le cime degli alberi.",
            "ignoreText": "Non perdete tempo a salire sulle torrette e correte a perdifiato verso la valle del fiume Vorma prima che qualcuno possa mettersi in marcia.",
            "successText": "Vi arrampicate rapidamente sulle impalcature di legno e spegnete le fiamme nascenti rovesciandovi sopra cumuli di neve fresca, riprendendo subito la traccia di Kesia.",
            "failText": "Nel tentativo di abbattere il braciere centrale a spallate, la pece bollente vi schizza sulle braccia e sulle vesti, ustionandovi prima che riusciate a spegnere il segnale.",
            "stat": "int",
            "cd": 7,
            "bonusEroi": { "aiace_dignitas": 1, "zeno": 1 },
            "reward": "pece_militare_svalbard",
            "punishment": {
                "type": "injury",
                "name": "Ustioni da Pece Ardente",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "travi_incrinate_del_vorma": {
            "title": "Le Travi Incrinate del Ponte sul Vorma",
            "desc": "Raggiungete il ponte di legno e pietra che scavalca le acque gelide del fiume Vorma, il corso d'acqua che nasce dalla Dorsale Rocciaguzza e sembra inabissarsi sotto il Massiccio Semprebrina. Passando pochi minuti prima di voi, Kesia ha fatto esplodere una carica di calore magico sui piloni centrali: il ghiaccio che teneva salde le travi portanti si sta sciogliendo e spaccando, e l'arcata centrale minaccia di cedere sotto il vostro peso. Enea ed Aiace osservano la struttura valutando che l'unico modo per non finire nelle rapide sia distribuire il peso lungo i tiranti laterali ancorati alla roccia viva.",
            "ignoreText": "Rinunciate al ponte pericolante e cercate un guado secondario più a valle lungo il Vorma, avanzando lentamente nell'acqua gelida fino alle ginocchia.",
            "successText": "Correte in fila indiana lungo le travi laterali ancora ancorate alla pietra, superando il fiume Vorma con slancio prima che la parte centrale del ponte sprofondi nelle rapide.",
            "failText": "Una trave cede sotto i vostri stivali a metà dell'attraversamento; cadete pesantemente contro il parapetto scheggiato del ponte, ferendovi e perdendo minuti preziosi per issarvi sulla sponda nord.",
            "stat": "int",
            "cd": 7,
            "bonusEroi": { "aiace_dignitas": 1, "enea_dignitas": 1 },
            "reward": "rampino_pionieri_nord",
            "punishment": {
                "type": "injury",
                "name": "Contusioni da Crollo",
                "desc": "Tutta la compagnia subisce 1 danno",
                "effects": [
                    { "effect": "party_damage", "val": 1 }
                ]
            }
        },
        "vortici_di_neve_e_cristalli": {
            "title": "I Vortici di Neve e Cristalli",
            "desc": "Sulle alture ventose a sud di Milkavala scorgete in lontananza il mantello sgargiante di Kesia sventolare lungo il Cammino di Piotr, ma tra voi e lei si estende una depressione di neve fresca mista a polvere di ghiaccio soffiata giù dalla Faucebigia — il primo baluardo contro i venti del Ghiacceterno —, spazzata da mulinelli carichi di schegge minerali che accecano la vista e tagliano la pelle. Enea e Zeno, abituati a leggere il terreno di marcia durante le campagne militari del Nord, pensano che seguire la linea d'ombra delle rocce affioranti dove il vento ha compattato il manto sia l'unica via per tagliare il bacino senza sprofondare.",
            "ignoreText": "Rinunciate a tagliare per la neve fresca e seguite la lunga dorsale rocciosa esterna, perdendo di vista la sagoma di Kesia ma camminando su un terreno quantomeno solido.",
            "successText": "Avvolgete il vostro volto nei mantelli e correte seguendo esattamente la linea d'ombra delle rocce affioranti dove il vento ha compattato il fondo, superando il bacino in pochi minuti.",
            "failText": "Il vento vi strappa i ripari dal viso accecandovi con la neve ghiacciata e facendovi finire in una sacca cedevole, da cui uscite parecchio indolenziti.",
            "stat": "int",
            "cd": 8,
            "bonusEroi": { "enea_dignitas": 1, "zeno": 1 },
            "reward": "mantello_foderato_collifreddi",
            "punishment": "assideramento_lieve"
        },
        "sonno_dei_garriatori": {
            "title": "Il Sonno dei Garriatori",
            "desc": "Mentre il Cammino di Piotr scende attraverso una stretta gola in ombra verso il corso del fiume Driva, una innaturale e improvvisa sonnolenza cala sulle vostre palpebre, mentre tra le rocce scorgete due esserini ghignanti alti quanto un bambino di cinque inverni: sono Garriatori, Maliardi che operano in coppia per bloccare nel sonno le vittime salendo sul loro petto mentre il compagno scanna le prede. Kesia li ha svegliati passandovi accanto per rallentarvi. Aurelio, forte della sua istruzione religiosa da Arvale, e Zeno, che sta iniziando ad avvicinarsi con rispetto alle antiche credenze del Nord, pensano subito alla precisa nenia rituale tramandata dai Gothi e dagli anziani delle Cimebianche come unico rimedio per spezzare la malia nel sogno.",
            "ignoreText": "Vi ferite volontariamente il palmo della mano con la punta dei pugnali usando il dolore per non addormentarvi e correte fuori dalla gola senza fermarvi.",
            "successText": "Prima che il torpore vi immobilizzi, declamate a gran voce l'antica nenia montana (\"Dritta come un filo, cada la scure su chi gli dà asilo...\"), spezzando all'istante la malia e mettendo in fuga la coppia di Garriatori.",
            "failText": "Crollate in ginocchio vinti dal sonno magico per diversi istanti mentre i Garriatori vi saltano sul petto opprimendovi il respiro, prima che l'ultimo rimasto sveglio tra voi riesca a scacciarli con le armi.",
            "stat": "fth",
            "cd": 8,
            "bonusEroi": { "aurelio_dignitas": 1, "zeno": 1 },
            "reward": "amuleto_scaccia_maliardi",
            "punishment": "torpore_residuo"
        },
        "miraggi_della_torre_dei_sogni": {
            "title": "I Miraggi della Torre dei Sogni",
            "desc": "Raggiungete finalmente il Ponte di Porunn, che attraversa il fiume gelato Driva là dove l'eroe lungobarbo Piotr morì di fatica tra le braccia dell'amata Porunn del clan Drummond. Guardando a sud lungo la sorgente del fiume, scorgete ai piedi dei monti il profilo solitario della Torre dei Sogni, il santuario custodito dal Clan Foscogelo della Jarl Ylva Occhi Runici, unico luogo del Nord in cui i Gothi riescono a comunicare direttamente con gli Asi attraverso i sogni. Kesia ha deviato i flussi onirici della Torre verso il ponte per colpire le vostre paure più intime: davanti agli occhi di Zeno, Aurelio ed Enea si alzano visioni vivide di Rocca Tempesta in fiamme e di vostra madre e sorella Lenora ormai divorata dal patto, mentre il lamento illusorio di Porunn vi invita a gettarvi nel Driva. Aurelio, forte del suo zelo di Arvale nei Destafato, ed Enea pensano che intonare il sacro motto della Famiglia sia l'unico scudo spirituale per squarciare l'inganno.",
            "ignoreText": "Vi tappate le orecchie con delle pezze e rifiutate di guardare le visioni verso la Torre dei Sogni, attraversando il Ponte di Porunn con sguardo basso e incedendo contro le raffiche sempre più gelide.",
            "successText": "Riconoscete nei miraggi il tocco beffardo di Kesia e intonate a gran voce il motto della Famiglia, varcando il Ponte di Porunn senza alcuna esitazione e con lo spirito più saldo che mai.",
            "failText": "La malia vi annebbia la mente a metà del ponte; correte verso l'immagine illusoria di Lenora e vi schiantate violentemente contro i merli ghiacciati del Ponte di Porunn, restando feriti e profondamente scossi nella vostra anima.",
            "stat": "fth",
            "cd": 8,
            "bonusEroi": { "aurelio_dignitas": 1, "enea_dignitas": 1 },
            "reward": "benedizione_onirica_foscogelo",
            "punishment": "trauma_dello_spirito"
        },
        "cammino_del_criogolem": {
            "title": "Il Cammino del Criogolem",
            "desc": "Avanzando lungo il Cammino di Piotr dove la pista lambisce i contrafforti gelidi dei Monti Scintillanti Orientali a sud di Zavstra, una bufera improvvisa preannuncia la comparsa del più temuto tra i Silfidi Flussidi del Gelo: un Criogolem sta attraversando lentamente il passo davanti a voi. Sapete dal Bestiario di Oreste che nessun uomo è mai sopravvissuto allo scontro con un Criogolem e che il gelo emanato dalla sua mole riduce in polvere qualsiasi arma di metallo, ma Kesia è appena sgusciata oltre il colosso. Enea ed Aiace pensano che l'unica condotta sensata sia riporre ogni metallo nel cuoio e sfruttare con disciplina i punti ciechi sopravento della tormenta.",
            "ignoreText": "Vi appiattite dietro un costone di roccia lontani dal passo e attendete immobili nella bufera che il Criogolem si allontani del tutto, soffrendo il gelo per non rischiare il contatto.",
            "successText": "Riponete ogni metallo in vostro possesso nei foderi di cuoio e scattate silenziosi lungo il crinale sopravento sfruttando i punti ciechi della tempesta, superando il Criogolem senza che la sua mole vi sfiori.",
            "failText": "Il passo pesante del Criogolem innesca un crollo di ghiaccio sul pendio sopra di voi; l'onda d'urto gelida vi investe di striscio, incrinando il metallo delle vostre armature e congelandovi il respiro per la paura.",
            "stat": "int",
            "cd": 8,
            "bonusEroi": { "aiace_dignitas": 1, "enea_dignitas": 1 },
            "reward": "scheggia_del_flusside",
            "punishment": {
                "type": "injury",
                "name": "Armature Incrinate dal Gelo",
                "desc": "Tutta la compagnia subisce 2 danni",
                "effects": [
                    { "effect": "party_damage", "val": 2 }
                ]
            }
        },
        "sonno_del_kornugan": {
            "title": "Il Sonno del Kornugan",
            "desc": "Tagliando per una conca rocciosa ai piedi della Dorsale Rocciaguzza, poco a nord del misterioso villaggio-forte di Leblya — l'avamposto dei Drummond dove persino i mercanti sono obbligati a lasciare le merci fuori dalle porte e allontanarsi subito —, vi trovate davanti l'imboccatura di una spelonca abissale davanti a cui riposa una bestia colossale alta sei metri al garrese e sormontata da un corno biforcuto che sfavilla in controluce: è un Kornugan, il più raro dei Silfidi Terrigeni, avvistato in precedenza solo due volte dai ceppi di Dario Silvano e di Efialte. La creatura ha una vista debolissima ma un udito prodigioso, e Kesia ha disseminato il passaggio di stalattiti di ghiaccio fragili come vetro. Aiace ed Aurelio pensano che fasciare gli stivali e sincronizzare ogni passo col sibilo del vento sia l'unico modo per non destare il colosso.",
            "ignoreText": "Scalate la parete esterna della conca a mani nude nel vento artico pur di tenervi a centinaia di passi dalle orecchie del Kornugan.",
            "successText": "Avvolgete gli stivali nelle pelli e avanzate in sincronia perfetta sfruttando il sibilo del vento per coprire ogni respiro, sfilando a pochi metri dal corno sfavillante del Kornugan senza svegliarlo.",
            "failText": "Uno stivale spezza una lastra di ghiaccio; il Kornugan scatta in piedi con un vigore smisurato e fa tremare l'intera conca con una carica furiosa che vi sbalza contro le rocce prima che riusciate a seminarlo del tutto.",
            "stat": "int",
            "cd": 9,
            "bonusEroi": { "aiace_dignitas": 1, "aurelio_dignitas": 1 },
            "reward": "polvere_corno_kornugan",
            "punishment": {
                "type": "injury",
                "name": "Fratture al Costato",
                "desc": "Tutta la compagnia subisce 2 danni",
                "effects": [
                    { "effect": "party_damage", "val": 2 }
                ]
            }
        },
        "arco_di_ghiaccio_azzurro": {
            "title": "L'Arco di Ghiaccio Azzurro",
            "desc": "Davanti a voi si apre un crepaccio profondo centinaia di metri, attraversato soltanto da uno stretto ponte naturale di ghiaccio azzurro. Appena Kesia è passata sull'altra sponda, si è voltata facendo risuonare una nota acutissima che ha aperto una rete di crepe lungo tutta l'arcata, gridandovi che solo chi confida davvero nel proprio destino può correre sul vuoto senza cadere. Zeno, che sente crescere dentro di sé una nuova fiducia nelle vie del Caos, e Aurelio, saldo nella dottrina di Draken, pensano che esitare a calcolare i passi significhi precipitare, e che ci si debba lanciare oltre l'arco con fede assoluta nel disegno del Groviglio.",
            "ignoreText": "Rinunciate all'arco di ghiaccio e scendete lungo il bordo del crepaccio in cerca di un passaggio più sicuro, lasciando a Kesia altro vantaggio.",
            "successText": "Vi lanciate di corsa uno alla volta distribuendo il peso in scivolata sul ghiaccio azzurro e toccate il ciglio opposto un istante prima che la chiave di volta del ponte precipiti nell'abisso.",
            "failText": "Una sezione laterale dell'arco cede sotto i vostri piedi; rimanete appesi con le piccozze sul vuoto glaciale e dovete issarvi a fatica con i muscoli lacerati dallo sforzo.",
            "stat": "fth",
            "cd": 9,
            "bonusEroi": { "zeno": 1, "aurelio_dignitas": 1 },
            "reward": "scheggia_benedetta",
            "punishment": "stiramento_muscolare"
        },
        "sussurri_dei_giuramenti_infranti": {
            "title": "I Sussurri dei Giuramenti Infranti",
            "desc": "Giungete a ridosso dell'immensa voragine circolare della Bocca del Bianco, il foro nel Ghiacceterno in cui durante l'ultima Collisione il Padre di Tutto, Yr, scagliò una lancia in volto a suo figlio Hvid il Bianco, facendolo precipitare ma donandogli la parola. Dal fondo oscuro — dove Coloro che scendono nella tenebra pescano sulla banchina sotterranea i mostri parlanti che trasmettono i desideri del Bianco — risalgono strida di vento che portano le voci di tutti i patti pronunciati nel Nord, poiché Hvid disprezza sopra ogni cosa l'inganno e chi rompe la parola data. Kesia amplifica quei sussurri contro di voi per insinuare il dubbio sul prezzo che pagherete per liberare Lenora. Aiace, come Arconte custode delle Virtù della Famiglia (tra cui la Verità: \"Mai giurare il falso: grande e grave è la ricompensa per la rottura della parola data\"), e Aurelio pensano che rinnovare ad alta voce il vostro giuramento di sangue davanti all'abisso sia l'unico modo per mostrare i denti e spezzare la malia.",
            "ignoreText": "Avanzate in silenzio assoluto rifiutandovi di ascoltare o parlare finché non siete fuori dal cono di vento della voragine.",
            "successText": "Rinnovate ad alta voce il vostro giuramento di fedeltà reciproca e al sangue di Dignitas contro l'ululato dell'abisso, spezzando l'incantesimo di Kesia e percependo scorrere nelle vostre vene una rara determinazione incrollabile.",
            "failText": "I sussurri velenosi scavano nelle vostre paure più profonde, lasciandovi scossi, diffidenti e con la mente annebbiata dal peso della missione.",
            "stat": "fth",
            "cd": 9,
            "bonusEroi": { "aiace_dignitas": 1, "aurelio_dignitas": 1 },
            "reward": "sigillo_del_giuramento",
            "punishment": "dubbio_del_bianco"
        },
        "scalinata_di_ghiaccio": {
            "title": "La Scalinata di Ghiaccio",
            "desc": "L'unico accesso diretto alla terrazza glaciale superiore dove vi attende Kesia è una ripida scalinata scolpita nella parete verticale di ghiaccio eterno, costantemente spazzata dalle raffiche ascendenti che urlano fuori dalla Bocca del Bianco e minacciano di strapparvi via dalla parete. Qui né l'astuzia né le preghiere possono bastare: Enea e Zeno pensano che l'unica via per non essere spazzati via dal vento del Bianco sia affidarsi alla pura potenza fisica delle braccia, piantando l'acciaio dei pugnali nel ghiaccio vivo ad ogni singolo gradino.",
            "ignoreText": "Percorrete un tortuoso cunicolo scavato nella crosta del ghiacciaio, arrivando in cima sfiniti e intirizziti ma al riparo dalle raffiche.",
            "successText": "Piantate i pugnali e le punte delle armi nel ghiaccio scalando la parete, sotto lo sguardo stupito di Kesia stessa.",
            "failText": "Una raffica violenta dal fondo dell'abisso vi stacca i piedi dai gradini; sbattete pesantemente contro gli spuntoni di ghiaccio della parete prima di riuscire a riaggrapparvi.",
            "stat": "str",
            "cd": 9,
            "reward": "guanti_del_ghiacceterno",
            "punishment": {
                "type": "injury",
                "name": "Lacerazioni Profonde",
                "desc": "Tutta la compagnia subisce 2 danni",
                "effects": [
                    { "effect": "party_damage", "val": 2 }
                ]
            }
        },
        "pozzo_dei_voti_di_sangue": {
            "title": "Il Pozzo dei Voti di Sangue",
            "desc": "Ai piedi di un menhir annerito dal fuoco si apre un pozzo di pietra colmo di monete d'argento ossidate e di anelli spezzati: è un antico pozzo votivo, dove i viandanti del Nord versavano il proprio sangue in cambio della protezione degli Asi. Sul bordo una fila di rune detta l'unica regola del luogo: chi offre sangue può prendere tanto argento quanto vale la sua offerta. Le gocce ancora fresche sulla pietra dicono che Kesia è passata di qui, e che non ha pagato nulla.",
            "ignoreText": "Nessuno di voi vuole versare sangue per un pugno d'argento: lasciate il pozzo ai morti e riprendete la caccia.",
            "successText": "Il sangue scivola lungo le rune del bordo e l'acqua nera del pozzo sembra accettarlo. Raccogliete l'argento che vi spetta, con le mani ancora tremanti, e proseguite verso il campo del gothi.",
            "stat": "hp"
        }
    },
    "merchants": {
        "default": "Un mercante di passaggio vi mostra la sua merce.",
        "mercante_della_selva": "Sulla sponda settentrionale del fiume Vorma incrociate il carro di un commerciante autorizzato dai Tabarri Verdi del Consesso dei Gabellieri a raccogliere il preziosissimo legno ferro dai margini della vicina Selva delle Bianche Betulle. Vi racconta ridendo che una giovane donna dai colori vivaci ha appena scambiato con lui una manciata di monete per un otre di vino speziato, dicendogli che \"dei nobili Dignitas molto generosi e molto di fretta\" sarebbero passati di lì a poco: il mercante si inchina rispettosamente davanti al vostro rango e vi mostra il suo campionario di armi, unguenti e provviste in cambio di Scudi con l'effigie del Leone e della Corona di Lenora.",
        "mercante_pellicce_rundeberg": "Giunti nella valle del fiume Driva, all'incrocio con la pista meridionale che sale dal villaggio di Urszebya e da Rundeberg — la Città dei Massi oggi amministrata dall'Eparca Vittoria Dignitas e dall'Aldermanno Ekvin Tusk — verso il Ponte di Porunn, incrociate il carro di un ricco mercante di pellicce di zibellino e martora. Vi racconta che Kesia è sfrecciata verso il ponte pochi minuti prima lasciando dietro di sé una scia di risate, ed è ben lieto di vendervi provviste, armi e rari composti in cambio dei vostri Scudi d'argento e Lenora d'oro.",
        "gothi_mutilato": "In una caverna riscaldata da uno sfiatatoio termale poco prima di Kallekot incontrate un vecchio Gothi del Bianco appartenente a \"Coloro che scendono nella tenebra\", riconoscibile dalle dita e dalle orecchie mutilate dal gelo perenne della Bocca del Bianco. Riconoscendo in Enea uno dei Tre Fratelli e in Aurelio un Arvale consacrato, vi confida che Kesia ha appena attraversato Kallekot diretta verso la voragine sacra cantando una ballata sul vostro conto e, in cambio dei vostri ultimi Scudi, vi cede i suoi elisir più potenti contro il gelo e la fatica."
    },
    "rests": {
        "default": "Trovate un angolo riparato e riposate qualche ora.",
        "antico_sepolcro": "Nel punto in cui il sentiero dal Vorma si unisce al Cammino di Piotr trovate una camera di pietra semi-sepolta dai cumuli di neve, risalente ai primi insediamenti vitghen eretti ai tempi della Jarl Shoika. Sull'architrave interno Kesia ha disegnato col dito nella brina una clessidra che si svuota per beffarsi della vostra fretta, ma il riparo è solido e vi permette di riposare al coperto dai venti taglienti della steppa.",
        "cortile_di_pietra_sul_driva": "A poca distanza dal corso gelato del Driva e dal bivio per Urszebya trovate riparo in un solido cortile murato usato dai carovanieri e dai mercanti di cavalli di Sepuzsky per difendersi dalle bufere fluviali. Su una botte rovesciata Kesia ha lasciato per voi un calice di Idromele Vitghen speziato ancora tiepido: riposate qualche ora sapendo di aver ormai dimezzato il suo vantaggio.",
        "rifugio_tra_zavstra_e_leblya": "Percorrete il tratto del Cammino di Piotr che passa a sud del villaggio murato di Zavstra — il grande insediamento isolazionista del Kalle dove tutte le case sono perennemente barricate, le strade deserte e a nessun forestiero è concesso entrare. A debita distanza dalle sue mura silenziose trovate un basso rifugio costruito con lastre di ardesia e costole di antichi mostri marini pescati sotto il Ghiacceterno. All'interno Kesia ha lasciato un tizzone ancora ardente che emana un calore magico: potete finalmente scaldarvi le mani intirizzite e riprendere le forze prima dell'ultimo balzo verso Kallekot.",
        "grotta_di_cristallo_sul_ciglio": "A poche centinaia di passi dall'orlo della Bocca del Bianco trovate una cavità naturale nel ghiaccio puro che vi scherma dal ruggito del vento e dalle strida di agonia del Bianco. Oltre la cortina di brina vedete già brillare la figura di Kesia che finalmente si è fermata ad attendervi: medicate le ferite e preparate le armi per l'ultima prova.",
        "cerchio_dei_monoliti_neri": "Vi fermate all'interno di un antico cerchio di pietre nere conficcate nel ghiaccio eterno a ridosso della voragine, lasciate in epoche remote dai primi seguaci di Hvid e di Miska. Qui il vento sembra placarsi per rispetto a tempi immemori, concedendovi un ultimo momento per riprendere fiato prima di affrontare la figlia di Fredlös."
    },
    "treasures": {},
    "stories": {
        "oltre_il_ponte_di_porunn": { "title": "Oltre il Ponte di Porunn", "text": "" }
    },
    "lootItems": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "ankh_pellegrino", "bastone_eremita", "balsamo_curativo", "spada_norgrad", "alabarda_guardia", "mannaia_pesante", "scudo_ferro", "corazza_scaglie", "tomo_proibito", "reliquiario_tascabile", "martello_consacrato", "brigantina_benedetta", "stocco_duellante", "pozione_rigenerazione", "unguento_fortificante", "lama_acciaio_lunare", "martello_breccia", "gorgiera_veterano", "corazza_piastre_leone", "cappa_sussurri", "simbolo_jag_antar", "scettro_savio", "corona_martire", "elisir_sangue_vivo", "olio_bollente", "bomba_acido", "cristallo_flammaurea", "grappa_soldato", "infuso_corteccia", "olio_da_lama", "pozione_pelle_pietra", "elisir_berserker", "corno_allman", "ascia_primo_sangue", "mazza_boia_seistad", "scudo_spina_kranen", "catena_ghiacceterno", "talismano_corvo", "mappa_contrabbandiere", "dado_osso_gunnar", "lingua_argento", "occhio_gazza", "coperta_rurikstad", "erbario_fonnish", "spadone_primo_sangue", "ascia_carnefice_glostok", "pugnale_succhiasangue", "lama_ghiaccio_hvid", "corazza_ultimo_baluardo", "spada_affilata", "ascia_pesante", "armatura_leggera_loot", "armatura_pesante_loot", "pozione", "amuleto", "anello", "scudo_pesante", "stilo_da_battaglia", "turibolo_ferrato", "rosario_del_pellegrino", "bastone_runico_del_dotto", "mazza_votiva", "scudo_del_sacerdote", "astrolabio_tattico", "guanti_runici_erudito", "bastone_dei_giusti"],
    "mapNodes": [
        {
            "id": 0,
            "level": 0,
            "x": 330,
            "type": "combat",
            "title": "Livello 1 - Gli Inseguitori di Sangue Skallgrim",
            "icon": "🗡️",
            "done": false,
            "active": true,
            "next": [2, 3],
            "image": "immagini/fredlos_parte_3/1a_inseguitori_di_sangue_skallgrim.webp",
            "enemy": "inseguitori_di_sangue_skallgrim"
        },
        {
            "id": 1,
            "level": 0,
            "x": 550,
            "type": "challenge",
            "title": "Livello 1 - I Bracieri d'Allarme della Via Nord",
            "icon": "❓",
            "done": false,
            "active": true,
            "next": [3, 4],
            "image": "immagini/fredlos_parte_3/1b_bracieri_d_allarme_della_via_nord.webp",
            "challengeId": "bracieri_d_allarme"
        },
        {
            "id": 2,
            "level": 1,
            "x": 220,
            "type": "challenge",
            "title": "Livello 2 - Le Travi Incrinate del Ponte sul Vorma",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [5],
            "image": "immagini/fredlos_parte_3/2a_travi_incrinate_del_ponte_sul_vorma.webp",
            "challengeId": "travi_incrinate_del_vorma"
        },
        {
            "id": 3,
            "level": 1,
            "x": 440,
            "type": "merchant",
            "title": "Livello 2 - Il Mercante della Selva",
            "icon": "🪙",
            "done": false,
            "active": false,
            "next": [5, 6],
            "image": "immagini/fredlos_parte_3/2b_mercante_della_selva.webp",
            "merchantId": "mercante_della_selva"
        },
        {
            "id": 4,
            "level": 1,
            "x": 660,
            "type": "combat",
            "title": "Livello 2 - Le Linci Scintillanti del Vorma",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [6],
            "image": "immagini/fredlos_parte_3/2c_linci_scintillanti_del_vorma.webp",
            "enemy": "linci_scintillanti_del_vorma"
        },
        {
            "id": 5,
            "level": 2,
            "x": 330,
            "type": "combat",
            "title": "Livello 3 - La Preda dei Cacciatori Skalatt",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [7, 8],
            "image": "immagini/fredlos_parte_3/3a_preda_dei_cacciatori_skalatt.webp",
            "enemy": "cacciatori_skalatt"
        },
        { "id": 6, "level": 2, "x": 550, "type": "rest", "title": "Livello 3 - L'Antico Sepolcro", "icon": "⛺", "done": false, "active": false, "next": [8, 9], "image": "immagini/fredlos_parte_3/3b_antico_sepolcro.webp", "restId": "antico_sepolcro" },
        { "id": 7, "level": 3, "x": 220, "type": "elite", "title": "Livello 4 - La Vendetta degli Esuli Kràti", "icon": "👹", "done": false, "active": false, "next": [10], "image": "immagini/fredlos_parte_3/4a_vendetta_degli_esuli_krati.webp", "enemy": "esuli_krati" },
        {
            "id": 8,
            "level": 3,
            "x": 440,
            "type": "challenge",
            "title": "Livello 4 - I Vortici di Neve e Cristalli",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [10, 11],
            "image": "immagini/fredlos_parte_3/4b_vortici_di_neve_e_cristalli.webp",
            "challengeId": "vortici_di_neve_e_cristalli"
        },
        {
            "id": 9,
            "level": 3,
            "x": 660,
            "type": "combat",
            "title": "Livello 4 - I Mastini di Bokgar delle Fenditure",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [11],
            "image": "immagini/fredlos_parte_3/4c_mastini_di_bokgar_delle_fenditure.webp",
            "enemy": "mastini_di_bokgar_fenditure"
        },
        {
            "id": 10,
            "level": 4,
            "x": 330,
            "type": "challenge",
            "title": "Livello 5 - Il Sonno dei Garriatori",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [12, 13],
            "image": "immagini/fredlos_parte_3/5a_sonno_dei_garriatori.webp",
            "challengeId": "sonno_dei_garriatori"
        },
        {
            "id": 11,
            "level": 4,
            "x": 550,
            "type": "combat",
            "title": "Livello 5 - L'Ombra dell'Aviano Moork",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [13, 14],
            "image": "immagini/fredlos_parte_3/5b_ombra_dell_aviano_moork.webp",
            "enemy": "aviano_moork_della_forra"
        },
        {
            "id": 12,
            "level": 5,
            "x": 220,
            "type": "merchant",
            "title": "Livello 6 - Il Mercante di Pellicce di Rundeberg",
            "icon": "🪙",
            "done": false,
            "active": false,
            "next": [15],
            "image": "immagini/fredlos_parte_3/6a_mercante_di_pellicce_di_rundeberg.webp",
            "merchantId": "mercante_pellicce_rundeberg"
        },
        {
            "id": 13,
            "level": 5,
            "x": 440,
            "type": "rest",
            "title": "Livello 6 - Il Cortile di Pietra sul Fiume Driva",
            "icon": "⛺",
            "done": false,
            "active": false,
            "next": [15, 16],
            "image": "immagini/fredlos_parte_3/6b_cortile_di_pietra_sul_fiume_driva.webp",
            "restId": "cortile_di_pietra_sul_driva"
        },
        {
            "id": 14,
            "level": 5,
            "x": 660,
            "type": "combat",
            "title": "Livello 6 - La Milizia Fluviale di Urszebya",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [16],
            "image": "immagini/fredlos_parte_3/6c_milizia_fluviale_di_urszebya.webp",
            "enemy": "milizia_fluviale_urszebya"
        },
        { "id": 15, "level": 6, "x": 330, "type": "elite", "title": "Livello 7 - L'Erchito Risvegliato", "icon": "👹", "done": false, "active": false, "next": [17], "image": "immagini/fredlos_parte_3/7a_erchito_risvegliato.webp", "enemy": "erchito_risvegliato" },
        {
            "id": 16,
            "level": 6,
            "x": 550,
            "type": "challenge",
            "title": "Livello 7 - I Miraggi della Torre dei Sogni",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [17],
            "image": "immagini/fredlos_parte_3/7b_miraggi_della_torre_dei_sogni.webp",
            "challengeId": "miraggi_della_torre_dei_sogni"
        },
        { "id": 17, "level": 7, "x": 440, "type": "story", "title": "Livello 8 - Oltre il Ponte di Porunn", "icon": "📜", "done": false, "active": false, "next": [18, 19, 20], "image": "", "storyId": "oltre_il_ponte_di_porunn" },
        {
            "id": 18,
            "level": 8,
            "x": 220,
            "type": "combat",
            "title": "Livello 9 - I Predoni delle Lande del Kalle",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [21],
            "image": "immagini/fredlos_parte_3/9a_predoni_delle_lande_del_kalle.webp",
            "enemy": "predoni_delle_lande_del_kalle"
        },
        {
            "id": 19,
            "level": 8,
            "x": 440,
            "type": "challenge",
            "title": "Livello 9 - Il Cammino del Criogolem",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [21, 22],
            "image": "immagini/fredlos_parte_3/9b_cammino_del_criogolem.webp",
            "challengeId": "cammino_del_criogolem"
        },
        {
            "id": 20,
            "level": 8,
            "x": 660,
            "type": "combat",
            "title": "Livello 9 - I Cercatori di Saghe di Fredlös l'Oppresso",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [22, 34],
            "image": "immagini/fredlos_parte_3/9c_cercatori_di_saghe_di_fredlos_l_oppresso.webp",
            "enemy": "cercatori_di_saghe"
        },
        {
            "id": 21,
            "level": 9,
            "x": 220,
            "type": "rest",
            "title": "Livello 10 - L'Antico Rifugio tra Zavstra e Leblya",
            "icon": "⛺",
            "done": false,
            "active": false,
            "next": [23, 24],
            "image": "immagini/fredlos_parte_3/10a_antico_rifugio_tra_zavstra_e_leblya.webp",
            "restId": "rifugio_tra_zavstra_e_leblya"
        },
        {
            "id": 22,
            "level": 9,
            "x": 440,
            "type": "challenge",
            "title": "Livello 10 - Il Sonno del Kornugan",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [24, 25],
            "image": "immagini/fredlos_parte_3/10b_sonno_del_kornugan.webp",
            "challengeId": "sonno_del_kornugan"
        },
        {
            "id": 23,
            "level": 10,
            "x": 220,
            "type": "combat",
            "title": "Livello 11 - Le Orme Impossibili dei Kràti",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [26],
            "image": "immagini/fredlos_parte_3/11a_orme_impossibili_dei_krati.webp",
            "enemy": "orme_impossibili_dei_krati"
        },
        {
            "id": 24,
            "level": 10,
            "x": 440,
            "type": "challenge",
            "title": "Livello 11 - L'Arco di Ghiaccio Azzurro",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [26, 27],
            "image": "immagini/fredlos_parte_3/11b_arco_di_ghiaccio_azzurro.webp",
            "challengeId": "arco_di_ghiaccio_azzurro"
        },
        { "id": 25, "level": 10, "x": 660, "type": "merchant", "title": "Livello 11 - Il Gothi Mutilato", "icon": "🪙", "done": false, "active": false, "next": [27], "image": "immagini/fredlos_parte_3/11c_gothi_mutilato.webp", "merchantId": "gothi_mutilato" },
        {
            "id": 26,
            "level": 11,
            "x": 330,
            "type": "elite",
            "title": "Livello 12 - Il Campione della Stirpe di Ekil",
            "icon": "👹",
            "done": false,
            "active": false,
            "next": [28, 29],
            "image": "immagini/fredlos_parte_3/12a_campione_della_stirpe_di_ekil.webp",
            "enemy": "campione_della_stirpe_di_ekil"
        },
        {
            "id": 27,
            "level": 11,
            "x": 550,
            "type": "combat",
            "title": "Livello 12 - Le Fiere del Gelo e i Fuochi di Kesia",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [29, 30],
            "image": "immagini/fredlos_parte_3/12b_fiere_del_gelo_e_i_fuochi_di_kesia.webp",
            "enemy": "fiere_del_gelo_e_fuochi_di_kesia"
        },
        {
            "id": 28,
            "level": 12,
            "x": 220,
            "type": "challenge",
            "title": "Livello 13 - I Sussurri dei Giuramenti Infranti",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [31],
            "image": "immagini/fredlos_parte_3/13a_sussurri_dei_giuramenti_infranti.webp",
            "challengeId": "sussurri_dei_giuramenti_infranti"
        },
        {
            "id": 29,
            "level": 12,
            "x": 440,
            "type": "combat",
            "title": "Livello 13 - La Guardia d'Onore della Figlia di Fredlös",
            "icon": "🗡️",
            "done": false,
            "active": false,
            "next": [31, 32],
            "image": "immagini/fredlos_parte_3/13b_guardia_d_onore_della_figlia_di_fredlos.webp",
            "enemy": "guardia_d_onore_di_kesia"
        },
        {
            "id": 30,
            "level": 12,
            "x": 660,
            "type": "challenge",
            "title": "Livello 13 - La Scalinata di Ghiaccio",
            "icon": "❓",
            "done": false,
            "active": false,
            "next": [32],
            "image": "immagini/fredlos_parte_3/13c_scalinata_di_ghiaccio.webp",
            "challengeId": "scalinata_di_ghiaccio"
        },
        {
            "id": 31,
            "level": 13,
            "x": 330,
            "type": "rest",
            "title": "Livello 14 - La Grotta di Cristallo sul Ciglio",
            "icon": "⛺",
            "done": false,
            "active": false,
            "next": [33],
            "image": "immagini/fredlos_parte_3/14a_grotta_di_cristallo_sul_ciglio.webp",
            "restId": "grotta_di_cristallo_sul_ciglio"
        },
        {
            "id": 32,
            "level": 13,
            "x": 550,
            "type": "rest",
            "title": "Livello 14 - Il Cerchio dei Monoliti Neri",
            "icon": "⛺",
            "done": false,
            "active": false,
            "next": [33],
            "image": "immagini/fredlos_parte_3/14b_cerchio_dei_monoliti_neri.webp",
            "restId": "cerchio_dei_monoliti_neri"
        },
        { "id": 33, "level": 14, "x": 440, "type": "combat", "title": "Livello 15 - L'Ultima Prova di Kesia", "icon": "👑", "done": false, "active": false, "next": [], "image": "immagini/fredlos_parte_3/15a_ultima_prova_di_kesia.webp", "enemy": "kesia_ultima_prova" },
        { "id": 34, "level": 9, "x": 660, "type": "challenge", "title": "Livello 10 - Il Pozzo dei Voti di Sangue", "icon": "❓", "done": false, "active": false, "next": [25], "image": "", "challengeId": "pozzo_dei_voti_di_sangue" }
    ]
};
