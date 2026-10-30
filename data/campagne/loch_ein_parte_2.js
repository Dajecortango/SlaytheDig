// Campagna "Loch Ein, Parte Due: La Città Caduta".
// Il contenuto dopo "=" è JSON puro: niente funzioni, gli effetti sono descritti nei campi "effects"
// e interpretati da applyEffects() in js/game.js. È un file .js (e non .json) perché il gioco
// si apre con doppio click da file:// e il browser blocca fetch() di file locali.
// Nemici, oggetti, reliquie e maledizioni sono richiamati per id da data/libreria/.
window.CAMPAIGNS = window.CAMPAIGNS || {};
window.CAMPAIGNS["loch_ein_parte_2"] = {
    "id": "loch_ein_parte_2",
    "title": "Loch Ein, Parte Due: La Città Caduta",
    "avventura": "loch_ein",
    "capitolo": 2,
    "badge": "Parte Due",
    "description": "Oltre l'arco sommerso, nelle viscere della Caduta dai Cieli: la città inclinata di Loch Ein, i quartieri dei Firmamentisti, l'Anfiteatro in rovina e la Grande Piazza Circolare, fino alle porte del Palazzo dove vi attende Eldric.",
    "coverImage": "",
    "introText": "Superato l'arco sommerso grazie alla campana subacquea e ai sacchi di vino riempiti d'aria, riemergete finalmente nella grande caverna dotata di una sacca d'aria naturale.",
    "heroes": ["alastorta_dignitas", "pancrazio_dignitas", "cassio_dignitas", "ofelia_dignitas", "pandora_dignitas", "enea_dignitas", "aiace_dignitas"],
    "initialArmory": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "balsamo_curativo"],
    "challenges": {
        "correnti_passaggio_subacqueo": {
            "title": "Le Correnti del Passaggio Subacqueo",
            "desc": "Scegliete di risalire attraverso un tunnel secondario semi-allagato, dove l'acqua del lago spinge con forza attraverso le fessure della roccia. Sul fondale fangoso notate delle casse di rifornimenti perse durante le precedenti immersioni, ma i mulinelli d'acqua rischiano di trascinarvi contro le pareti frastagliate.",
            "ignoreText": "Emergete subito sulla riva rocciosa della caverna senza rischiare di annegare per recuperare le casse sul fondale.",
            "successText": "Sfruttando le corde di canapa e i sacchi d'aria con estrema perizia, vi ancorate alle rocce e recuperate il carico prima di riemergere nella sacca d'aria.",
            "failText": "Una corrente improvvisa vi sbatte contro gli spuntoni di roccia sommersi e vi strappa di mano i sacchi d'aria, costringendovi a riemergere annaspando e con i polmoni in fiamme.",
            "stat": "str",
            "cd": 7,
            "reward": {
                "type": "coins",
                "name": "Le casse dei rifornimenti",
                "desc": "+15 Scudi alla cassa della compagnia",
                "effects": [
                    { "effect": "coins", "val": 15 }
                ]
            },
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
            "desc": "Vi trovate nel punto in cui la Spada Spiavento, forgiata con la rara Pietra di Volta, aveva reagito con i minerali della caverna facendo tremare il terreno. Le venature minerali nella parete vibrano ancora: stimolarle potrebbe aprire una scorciatoia, o farvi crollare il soffitto addosso.",
            "ignoreText": "Evitate di toccare le venature vibranti e percorrete il tunnel principale già aperto.",
            "successText": "Colpite con precisione millimetrica il nodo minerale; una parete secondaria scorre rivelando una nicchia intatta dei Firmamentisti senza provocare smottamenti.",
            "failText": "La vibrazione sfugge al vostro controllo generando una violenta scossa; una pioggia di detriti e stalattiti si abbatte su di voi mentre correte verso l'uscita.",
            "stat": "int",
            "cd": 7,
            "reward": "sigillo_runico",
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
            "desc": "Per scendere verso i livelli abitativi dovete percorrere delle antiche scalinate di marmo che si torcono in spirali assurde e terminano bruscamente nel vuoto. L'inclinazione è vertiginosa e la pietra è resa scivolosa dall'umidità.",
            "ignoreText": "Rinunciate alle scale di marmo e vi calate lentamente lungo un pendio di macerie più lungo ma meno esposto al baratro.",
            "successText": "Usando rampini e corde, saltate con agilità da una rampa spezzata all'altra, superando il vuoto in metà del tempo.",
            "failText": "Il marmo umido vi fa perdere l'appiglio durante un salto; scivolate lungo la rampa inclinata schiantandovi contro una balaustra di pietra appena prima del precipizio.",
            "stat": "str",
            "cd": 7,
            "reward": "stendardo_da_battaglia",
            "punishment": "vertigine_lacerante"
        },
        "mosaico_verticale": {
            "title": "Il Mosaico Verticale",
            "desc": "Su quello che un tempo era un pavimento e che ora si erge quasi come un muro verticale, notate l'antico mosaico incompleto che Pancrazio aveva esaminato durante la prima spedizione. Alcune tessere preziose luccicano in alto, incastrate in una fessura del muro.",
            "ignoreText": "Non perdete tempo ad arrampicarvi su una parete inclinata e proseguite lungo il vicolo.",
            "successText": "Scalate la superficie obliqua sfruttando gli appigli tra le tessere del mosaico e recuperate gli intarsi antichi, scoprendo anche un passaggio asciutto dietro il muro.",
            "failText": "Le tessere del mosaico si staccano sotto il vostro peso facendovi precipitare rovinosamente sul selciato sottostante.",
            "stat": "str",
            "cd": 8,
            "reward": {
                "type": "coins",
                "name": "Intarsi antichi",
                "desc": "+20 Scudi alla cassa della compagnia",
                "effects": [
                    { "effect": "coins", "val": 20 }
                ]
            },
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
            "desc": "Al centro di una piazzetta inclinata si trova un grande astrolabio di bronzo collegato a un meccanismo nel pavimento. I simboli rappresentano le fasi lunari e i movimenti celesti della Celestica, la sapienza dei Firmamentisti.",
            "ignoreText": "Evitate di maneggiare congegni astrologici che non comprendete appieno e passate oltre.",
            "successText": "Allineate gli anelli di bronzo secondo la posizione delle stelle raffigurate nei mosaici cittadini; un'illusione protettiva si dissolve, svelandovi il cammino più sicuro attraverso il quartiere.",
            "failText": "Ruotate gli anelli nel senso errato, attivando una contromisura della Celestica: un lampo accecante e un'illusione distorta dei corridoi vi disorientano profondamente.",
            "stat": "int",
            "cd": 8,
            "reward": "mappa_della_regione",
            "punishment": "tormento_mentale"
        },
        "stanza_divisa_dal_crollo": {
            "title": "La Stanza Divisa dal Crollo",
            "desc": "Raggiungete la sala dove il soffitto era crollato durante il duello, dividendo la stanza in due con una barriera di macerie alta fino alla volta. Al di là dei detriti sentite il rumore di un passaggio utile, ma la pila di rocce è estremamente precaria e il terreno trema ancora leggermente.",
            "ignoreText": "Non rischiate un secondo crollo e cercate un giro più lungo attraverso i palazzi adiacenti.",
            "successText": "Individuate il varco tra le travi portanti cadute e strisciate dall'altra parte della barriera senza muovere un solo sasso. Dall'altra parte trovate un angolo asciutto dove riprendere fiato.",
            "failText": "Mentre vi arrampicate sulla barriera, un nuovo cedimento fa franare parte della pila di macerie, travolgendovi in una nube soffocante di polvere antica.",
            "stat": "int",
            "cd": 8,
            "reward": {
                "type": "heal",
                "name": "Un angolo asciutto",
                "desc": "Chi è in piedi recupera 1 HP",
                "effects": [
                    { "effect": "party_heal", "val": 1 }
                ]
            },
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
            "desc": "In una sala semidistrutta ritrovate la statua antica e miracolosamente intatta che Pandora aveva visto durante il suo scontro con il veggente cieco Balinor. Raffigura un imponente Atani col braccio teso che sembra indicare una precisa lastra del pavimento inclinato.",
            "ignoreText": "Ricordando le parole di Balinor sul fatto che \"la vera conoscenza viene con un prezzo\", decidete di non indagare oltre e proseguite.",
            "successText": "Seguite la direzione indicata dal dito di pietra con mente lucida e spirito saldo, comprendendo il messaggio nascosto degli antichi costruttori e trovando un passaggio celato.",
            "failText": "Vi avvicinate con avidità alla base della statua cercando un tesoro materiale; una pesante ondata di vertigine e oppressione spirituale vi colpisce, lasciandovi scossi e indeboliti.",
            "stat": "fth",
            "cd": 8,
            "reward": "benedizione_del_primigenio",
            "punishment": "ombra_sul_cuore"
        },
        "torrente_sotterraneo": {
            "title": "Il Torrente Sotterraneo",
            "desc": "Una delle fessure nella volta sopra di voi si è allargata a dismisura, trasformando il corridoio di collegamento in un vero e proprio torrente impetuoso che trascina con sé frammenti di pietra verso il baratro.",
            "ignoreText": "Tornate sui vostri passi e vi arrampicate sui tetti a punta delle case adiacenti per scavalcare il tratto allagato.",
            "successText": "Formate una catena umana assicurata con le corde alle colonne portanti e attraversate la corrente gelida senza lasciarvi trascinare via.",
            "failText": "La forza dell'acqua vi fa perdere l'equilibrio; venite trascinati per decine di metri lungo il pavimento inclinato, sbattendo contro i detriti prima di riuscire ad aggrapparvi a un arco di pietra.",
            "stat": "str",
            "cd": 8,
            "reward": "catena_di_norgrad",
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
            "desc": "Raggiungete il centro dell'arena semi-allagata, dove si erge l'imponente altare di pietra coperto di incisioni e circondato dal mosaico del grande albero dalle radici profonde. Le pietre luminescenti intorno all'altare pulsano ancora dell'energia scaturita durante il duello tra Adone e Lance.",
            "ignoreText": "Vi tenete a distanza dall'altare pulsante e costeggiate il perimetro esterno dell'arena per proseguire.",
            "successText": "Esaminate le incisioni sull'altare e il mosaico dell'albero, riuscendo a incanalare e comprendere il legame tra l'energia del luogo e la storia antica della città.",
            "failText": "Toccate incautamente l'altare mentre le pietre luminescenti pulsavano al massimo; una scarica d'energia arcana fa tremare il pavimento instabile dell'anfiteatro e vi respinge con violenza.",
            "stat": "fth",
            "cd": 9,
            "reward": "benedetti_da_jag_antar",
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
            "desc": "Passate per le antiche celle sotto le gradinate dell'anfiteatro, dove l'acqua sta salendo rapidamente. Notate una vecchia armeria dei guardiani di Loch Ein chiusa da una grata arrugginita, ma il soffitto sopra la grata scricchiola minacciosamente sotto il peso del lago soprastante.",
            "ignoreText": "Non perdete tempo con la grata arrugginita e correte fuori dai sotterranei prima che il livello dell'acqua salga ancora.",
            "successText": "Forzate le sbarre corrose facendo leva con le armi in un unico movimento coordinato, afferrando ciò che resta nell'armeria prima che la stanza si allaghi del tutto.",
            "failText": "La grata cede di colpo ma fa crollare un blocco della volta; l'acqua gelida vi travolge in pieno chiudendovi momentaneamente la via d'uscita.",
            "stat": "str",
            "cd": 9,
            "reward": {
                "type": "item",
                "name": "L'armeria dei guardiani",
                "desc": "Chi ha forzato la grata ottiene una Spada in Lega di Kol",
                "effects": [
                    { "effect": "hero_item", "item": "spada_norgrad", "val": 1 }
                ]
            },
            "punishment": "gelo_nelle_ossa"
        },
        "torre_pendente_astrologo": {
            "title": "La Torre Pendente dell'Astrologo",
            "desc": "Una delle torri d'osservazione più alte è piegata a un angolo impossibile ma poggia la sua cima contro il balcone del livello superiore, offrendo un ponte improvvisato. All'interno della torre vedete brillare antichi strumenti ottici e pergamene.",
            "ignoreText": "Evitate di entrare in una torre che sembra sul punto di spezzarsi in due e proseguite per la strada esterna.",
            "successText": "Camminate in equilibrio sulle pareti interne della torre inclinata, recuperando i manoscritti astronomici e uscendo dal balcone superiore senza provocare scosse.",
            "failText": "Il vostro peso altera il precario equilibrio della struttura; il pavimento interno cede e siete costretti a correre a perdifiato mentre la torre sprofonda di diversi metri verso il baratro.",
            "stat": "int",
            "cd": 9,
            "reward": "tomo_delle_verita",
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
            "desc": "Al centro di un incrocio stradale, una grossa scheggia di minerale luminescente caduta dal soffitto pulsa di una luce malata, tra l'azzurro dell'Yrtite e il viola della corruzione. L'aria intorno al cristallo distorce i suoni e sembra sussurrare frammenti di frasi antiche.",
            "ignoreText": "Vi coprite il volto e passate il più lontano possibile dalla scheggia pulsante, proseguendo verso la piazza centrale.",
            "successText": "Studiando la risonanza del cristallo a distanza di sicurezza con gli strumenti alchemici, riuscite a isolarne la frequenza senza farvi contaminare, comprendendo meglio la natura dell'anomalia che vi attende.",
            "failText": "Vi avvicinate troppo per esaminare la scheggia; un'onda d'urto psichica e corrosiva vi investe, lasciandovi con la nausea e le membra intorpidite.",
            "stat": "int",
            "cd": 9,
            "reward": "prisma_rivelatore",
            "punishment": "terrore_riflesso"
        },
        "statua_antico_sovrano": {
            "title": "La Statua Pendente dell'Antico Sovrano",
            "desc": "Al centro della piazza inclinata svetta la grande statua pendente dell'antico sovrano di Loch Ein, la cui base è decorata con i rilievi complessi che Alastorta e Cassio avevano documentato. Notate che una parte del basamento presenta un incavo che non era stato aperto nella prima spedizione.",
            "ignoreText": "Lasciate stare la statua pendente; la piazza è troppo esposta e preferite avanzare rapidamente.",
            "successText": "Utilizzando le conoscenze già acquisite sui rilievi della piazza, sbloccate l'incavo alla base della statua prima che la struttura inclinata possa assestarsi.",
            "failText": "Il meccanismo alla base è bloccato dal calcare; forzandolo fate inclinare ulteriormente la pesante statua del sovrano, che fa staccare una pioggia di lastre di pietra sulla piazza.",
            "stat": "int",
            "cd": 9,
            "reward": "frammento_di_chiarezza",
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
            "desc": "Lungo i gradoni che salgono verso il palazzo trovate la serie di incisioni secondarie che Cassio aveva notato poco prima dell'imboscata di Eldric. L'acqua che scorre veloce lungo i gradini le sta erodendo, ma sembrano contenere schemi difensivi del Palazzo stesso.",
            "ignoreText": "Salite rapidamente i gradoni ignorando le iscrizioni sotto l'acqua, concentrandovi solo sull'ingresso del Palazzo.",
            "successText": "Deviate temporaneamente il flusso d'acqua con dei detriti e decifrate la sequenza di simboli, individuando i punti ciechi delle difese strutturali del Palazzo.",
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
            "desc": "Per aggirare la scalinata centrale tentate di arrampicarvi lungo l'ala laterale del Palazzo, dove le mura sono inclinate ma presentano diverse crepe da cui filtra acqua ad alta pressione.",
            "ignoreText": "Desistete dalla scalata laterale e tornate verso il viale d'accesso principale.",
            "successText": "Sfruttate i cornicioni in marmo e salite fino al terrazzo d'ingresso con rapidità, evitando i getti d'acqua e le pietre smosse.",
            "failText": "Un cornicione cede sotto le vostre mani proprio mentre una fessura esplode in un getto d'acqua gelida, facendovi precipitare rovinosamente sulla base della scalinata.",
            "stat": "str",
            "cd": 9,
            "reward": "marchio_di_jag_antar",
            "punishment": "bruciature_da_gelo"
        },
        "colonna_di_pancrazio": {
            "title": "La Colonna Crollata di Pancrazio",
            "desc": "Davanti all'ingresso giace la colossale colonna di pietra che si era schiantata al suolo intrappolando la gamba di Pancrazio dopo il suo scontro con Eldric. Sotto il blocco di marmo, battuto dall'acqua della cascata, scorgete ancora lo scudo dei Dignitas e parte dell'equipaggiamento abbandonato nella concitazione del salvataggio.",
            "ignoreText": "L'acqua scende con troppa violenza e il resto del colonnato minaccia di cedere; lasciate lo scudo sotto il masso e vi preparate ad avanzare.",
            "successText": "Facendo leva con aste di ferro e lavorando in perfetta sincronia sotto lo scroscio dell'acqua, sollevate il blocco quel tanto che basta per estrarre le reliquie di famiglia senza subire danni.",
            "failText": "Il terreno allagato cede mentre fate leva; la colonna ruota su sé stessa schiacciando le vostre aste e investendovi con un'onda d'acqua e schegge di pietra.",
            "stat": "str",
            "cd": 9,
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
        "contrabbandiere_di_reliquie": "L'oscurità si apre come una ferita davanti a voi: ecco Loch Ein, precipitata in un abisso senza fondo e inclinata in un angolo vertiginoso, sotto un \"cielo\" di cristalli luminescenti. Appena oltre la soglia della città inclinata, dentro una torre spezzata che funge da avamposto, trovate un cacciatore di tesori solitario giunto fin qui seguendo le vecchie mappe di Roderic, il nonno di Baldrick. Ha allestito un banco di fortuna con reperti, unguenti e attrezzature sottratte alle rovine, ben felice di commerciare con chi ha l'oro per pagare.",
        "vedetta_guardie_del_lupo": "In una sala rialzata e asciutta trovate due veterani delle Guardie del Lupo di Sigge, rimasti di presidio in un avamposto avanzato per garantire una via di fuga e custodire le scorte pesanti della spedizione. Qui potete rifornirvi di armi, unguenti alchemici e provviste prima di scendere più a fondo.",
        "alchimista_disertore_anoeth": "Nascosto dietro il colonnato di un edificio mercantile della Grande Piazza Circolare, incontrate un cerusico e studioso al seguito della spedizione di Foscoclivo che, terrorizzato dai crolli e dall'oscurità della città, si è separato dai Cavalcantici. Pur di avere salva la vita, vi offre in vendita tutto il materiale bellico e medico sottratto alle scorte di Anoeth."
    },
    "rests": {
        "default": "Trovate un angolo asciutto e riposate qualche ora.",
        "casa_finestre_a_stella": "Entrate nel Quartiere degli Oroscopi, pieno di carte celesti scolpite e meridiane spezzate. Trovate un'abitazione miracolosamente intatta nonostante l'inclinazione, il cui pavimento è ancora ricoperto da spessi benché impolverati tappeti di lana di Cràil. Sbarrate la porta e approfittate del riparo silenzioso per riposare sotto le finestre a forma di stella che guardano verso la volta di cristalli.",
        "osservatorio_minore": "Vi chiudete all'interno di una piccola cupola astronomica inclinata ma asciutta, illuminata dal tenue bagliore bluastro dei cristalli del soffitto. Il rumore dell'acqua qui arriva solo come un eco lontano, concedendovi qualche ora di tregua per riposare.",
        "santuario_delle_stelle": "Trovate una cappella interna dedicata a Ceart, la Maestra dei Maestri, protetta da solide arcate di pietra. Le candele votive sono spente da secoli, ma l'ambiente è asciutto e sicuro, ideale per riprendere fiato e riordinare le idee.",
        "portico_riparato": "Siete a pochi passi dall'ampio ingresso in marmo del Palazzo. Trovate un angolo asciutto sotto il massiccio architrave dell'ingresso, protetto dagli spruzzi della cascata grazie ai resti delle colonne rimaste in piedi. Qui potete medicare le ferite, controllare le armi e riprendere fiato prima dello scontro decisivo.",
        "loggia_guardie_cittadine": "Siete a pochi passi dall'ampio ingresso in marmo del Palazzo. Vi rifugiate in un antico corpo di guardia adiacente alle porte, dove il pavimento inclinato ha tenuto fuori l'acqua dell'allagamento. Accendete un piccolo fuoco alchemico per scaldarvi le membra intirizzite e prepararvi alla battaglia."
    },
    "treasures": {},
    "stories": {
        "trama_meta_percorso": { "title": "Il cuore di Loch Ein", "text": "" }
    },
    "lootItems": null,
    "mapNodes": [
        { "id": 0, "level": 0, "x": 330, "type": "combat", "title": "Livello 1 - Le Stalattiti Viventi", "icon": "🗡️", "done": false, "active": true, "next": [2, 3], "image": "", "enemy": "mantombre_stalattiti" },
        { "id": 1, "level": 0, "x": 550, "type": "challenge", "title": "Livello 1 - Le Correnti del Passaggio Subacqueo", "icon": "❓", "done": false, "active": true, "next": [3, 4], "image": "", "challengeId": "correnti_passaggio_subacqueo" },
        { "id": 2, "level": 1, "x": 220, "type": "combat", "title": "Livello 2 - I Guardiani dei Giacimenti", "icon": "🗡️", "done": false, "active": false, "next": [5], "image": "", "enemy": "golem_dei_giacimenti" },
        { "id": 3, "level": 1, "x": 440, "type": "challenge", "title": "Livello 2 - La Risonanza della Pietra di Volta", "icon": "❓", "done": false, "active": false, "next": [5, 6], "image": "", "challengeId": "risonanza_pietra_di_volta" },
        { "id": 4, "level": 1, "x": 660, "type": "combat", "title": "Livello 2 - Lo Stormo della Spelonca", "icon": "🗡️", "done": false, "active": false, "next": [6], "image": "", "enemy": "stormo_della_spelonca" },
        { "id": 5, "level": 2, "x": 330, "type": "merchant", "title": "Livello 3 - Il Contrabbandiere di Reliquie", "icon": "🪙", "done": false, "active": false, "next": [7, 8], "image": "", "merchantId": "contrabbandiere_di_reliquie" },
        { "id": 6, "level": 2, "x": 550, "type": "challenge", "title": "Livello 3 - Le Scalinate Verso il Nulla", "icon": "❓", "done": false, "active": false, "next": [8, 9], "image": "", "challengeId": "scalinate_verso_il_nulla" },
        { "id": 7, "level": 3, "x": 220, "type": "combat", "title": "Livello 4 - I Becchini delle Rovine", "icon": "🗡️", "done": false, "active": false, "next": [10], "image": "", "enemy": "mastini_bokgar_rovine" },
        { "id": 8, "level": 3, "x": 440, "type": "combat", "title": "Livello 4 - Le Sentinelle dei Cavalcantici", "icon": "🗡️", "done": false, "active": false, "next": [10, 11], "image": "", "enemy": "sentinelle_cavalcantici" },
        { "id": 9, "level": 3, "x": 660, "type": "challenge", "title": "Livello 4 - Il Mosaico Verticale", "icon": "❓", "done": false, "active": false, "next": [11], "image": "", "challengeId": "mosaico_verticale" },
        { "id": 10, "level": 4, "x": 330, "type": "rest", "title": "Livello 5 - La Casa dalle Finestre a Stella", "icon": "⛺", "done": false, "active": false, "next": [12, 13], "image": "", "restId": "casa_finestre_a_stella" },
        { "id": 11, "level": 4, "x": 550, "type": "challenge", "title": "Livello 5 - L'Astrolabio dei Firmamentisti", "icon": "❓", "done": false, "active": false, "next": [13, 14], "image": "", "challengeId": "astrolabio_firmamentisti" },
        { "id": 12, "level": 5, "x": 220, "type": "elite", "title": "Livello 6 - L'Agente dell'Ombra", "icon": "👹", "done": false, "active": false, "next": [15], "image": "", "enemy": "agente_ombra_anoeth" },
        { "id": 13, "level": 5, "x": 440, "type": "challenge", "title": "Livello 6 - La Stanza Divisa dal Crollo", "icon": "❓", "done": false, "active": false, "next": [15, 16], "image": "", "challengeId": "stanza_divisa_dal_crollo" },
        { "id": 14, "level": 5, "x": 660, "type": "combat", "title": "Livello 6 - Il Banchetto sul Sangue Versato", "icon": "🗡️", "done": false, "active": false, "next": [16], "image": "", "enemy": "ghoul_sangue_versato" },
        { "id": 15, "level": 6, "x": 330, "type": "challenge", "title": "Livello 7 - La Statua che Indica", "icon": "❓", "done": false, "active": false, "next": [17, 18], "image": "", "challengeId": "statua_che_indica" },
        { "id": 16, "level": 6, "x": 550, "type": "combat", "title": "Livello 7 - Le Fiere degli Abissi", "icon": "🗡️", "done": false, "active": false, "next": [18, 19], "image": "", "enemy": "gropiceri_degli_abissi" },
        { "id": 17, "level": 7, "x": 220, "type": "combat", "title": "Livello 8 - Gli Spettri tra le Colonne", "icon": "🗡️", "done": false, "active": false, "next": [20], "image": "", "enemy": "spettro_tra_le_colonne" },
        { "id": 18, "level": 7, "x": 440, "type": "merchant", "title": "Livello 8 - La Vedetta delle Guardie del Lupo", "icon": "🪙", "done": false, "active": false, "next": [20, 21], "image": "", "merchantId": "vedetta_guardie_del_lupo" },
        { "id": 19, "level": 7, "x": 660, "type": "combat", "title": "Livello 8 - L'Inondazione dei Nècubri", "icon": "🗡️", "done": false, "active": false, "next": [21], "image": "", "enemy": "necubri_inondazione" },
        { "id": 20, "level": 8, "x": 330, "type": "rest", "title": "Livello 9 - L'Osservatorio Minore", "icon": "⛺", "done": false, "active": false, "next": [22], "image": "", "restId": "osservatorio_minore" },
        { "id": 21, "level": 8, "x": 550, "type": "challenge", "title": "Livello 9 - Il Torrente Sotterraneo", "icon": "❓", "done": false, "active": false, "next": [22], "image": "", "challengeId": "torrente_sotterraneo" },
        { "id": 22, "level": 9, "x": 440, "type": "story", "title": "Livello 10 - Il cuore di Loch Ein", "icon": "📜", "done": false, "active": false, "next": [23, 24, 25], "image": "", "storyId": "trama_meta_percorso" },
        { "id": 23, "level": 10, "x": 220, "type": "combat", "title": "Livello 11 - Le Gradinate Spezzate", "icon": "🗡️", "done": false, "active": false, "next": [26], "image": "", "enemy": "aracnomantropi_gradinate" },
        { "id": 24, "level": 10, "x": 440, "type": "challenge", "title": "Livello 11 - L'Altare dell'Albero Primordiale", "icon": "❓", "done": false, "active": false, "next": [26, 27], "image": "", "challengeId": "altare_albero_primordiale" },
        { "id": 25, "level": 10, "x": 660, "type": "combat", "title": "Livello 11 - Le Acque dell'Arena", "icon": "🗡️", "done": false, "active": false, "next": [27], "image": "", "enemy": "predatori_acque_arena" },
        { "id": 26, "level": 11, "x": 330, "type": "elite", "title": "Livello 12 - Il Campione di Foscoclivo", "icon": "👹", "done": false, "active": false, "next": [28, 29], "image": "", "enemy": "campione_di_foscoclivo" },
        { "id": 27, "level": 11, "x": 550, "type": "challenge", "title": "Livello 12 - I Sotterranei dei Gladiatori", "icon": "❓", "done": false, "active": false, "next": [29, 30], "image": "", "challengeId": "sotterranei_gladiatori" },
        { "id": 28, "level": 12, "x": 220, "type": "challenge", "title": "Livello 13 - La Torre Pendente dell'Astrologo", "icon": "❓", "done": false, "active": false, "next": [31], "image": "", "challengeId": "torre_pendente_astrologo" },
        { "id": 29, "level": 12, "x": 440, "type": "combat", "title": "Livello 13 - I Tessitori del Buio", "icon": "🗡️", "done": false, "active": false, "next": [31, 32], "image": "", "enemy": "tessitori_del_buio" },
        { "id": 30, "level": 12, "x": 660, "type": "rest", "title": "Livello 13 - Il Santuario delle Stelle", "icon": "⛺", "done": false, "active": false, "next": [32], "image": "", "restId": "santuario_delle_stelle" },
        { "id": 31, "level": 13, "x": 330, "type": "combat", "title": "Livello 14 - Le Fiere Corrotte dall'Abisso", "icon": "🗡️", "done": false, "active": false, "next": [33, 34], "image": "", "enemy": "fiere_corrotte_abisso" },
        { "id": 32, "level": 13, "x": 550, "type": "challenge", "title": "Livello 14 - Il Cristallo Infetto", "icon": "❓", "done": false, "active": false, "next": [34, 35], "image": "", "challengeId": "cristallo_infetto" },
        { "id": 33, "level": 14, "x": 220, "type": "merchant", "title": "Livello 15 - L'Alchimista Disertore di Anoeth", "icon": "🪙", "done": false, "active": false, "next": [36], "image": "", "merchantId": "alchimista_disertore_anoeth" },
        { "id": 34, "level": 14, "x": 440, "type": "challenge", "title": "Livello 15 - La Statua Pendente dell'Antico Sovrano", "icon": "❓", "done": false, "active": false, "next": [36, 37], "image": "", "challengeId": "statua_antico_sovrano" },
        { "id": 35, "level": 14, "x": 660, "type": "combat", "title": "Livello 15 - La Ronda della Piazza", "icon": "🗡️", "done": false, "active": false, "next": [37], "image": "", "enemy": "ronda_della_piazza" },
        { "id": 36, "level": 15, "x": 330, "type": "elite", "title": "Livello 16 - Il Golem di Cristallo e Pirite", "icon": "👹", "done": false, "active": false, "next": [38, 39], "image": "", "enemy": "golem_cristallo_pirite" },
        { "id": 37, "level": 15, "x": 550, "type": "combat", "title": "Livello 16 - Gli Abomini delle Acque Alte", "icon": "🗡️", "done": false, "active": false, "next": [39, 40], "image": "", "enemy": "esuridi_acque_alte" },
        { "id": 38, "level": 16, "x": 220, "type": "challenge", "title": "Livello 17 - Le Incisioni sul Bordo della Piazza", "icon": "❓", "done": false, "active": false, "next": [41], "image": "", "challengeId": "incisioni_bordo_piazza" },
        { "id": 39, "level": 16, "x": 440, "type": "combat", "title": "Livello 17 - L'Imboscata sui Gradoni", "icon": "🗡️", "done": false, "active": false, "next": [41, 42], "image": "", "enemy": "imboscata_sui_gradoni" },
        { "id": 40, "level": 16, "x": 660, "type": "challenge", "title": "Livello 17 - Il Muro Perimetrale Instabile", "icon": "❓", "done": false, "active": false, "next": [42], "image": "", "challengeId": "muro_perimetrale_instabile" },
        { "id": 41, "level": 17, "x": 330, "type": "challenge", "title": "Livello 18 - La Colonna Crollata di Pancrazio", "icon": "❓", "done": false, "active": false, "next": [43], "image": "", "challengeId": "colonna_di_pancrazio" },
        { "id": 42, "level": 17, "x": 550, "type": "combat", "title": "Livello 18 - Le Ombre della Cascata", "icon": "🗡️", "done": false, "active": false, "next": [44], "image": "", "enemy": "ombre_della_cascata" },
        { "id": 43, "level": 18, "x": 330, "type": "rest", "title": "Livello 19 - Il Portico Riparato", "icon": "⛺", "done": false, "active": false, "next": [45], "image": "", "restId": "portico_riparato" },
        { "id": 44, "level": 18, "x": 550, "type": "rest", "title": "Livello 19 - La Loggia delle Guardie Cittadine", "icon": "⛺", "done": false, "active": false, "next": [45], "image": "", "restId": "loggia_guardie_cittadine" },
        { "id": 45, "level": 19, "x": 440, "type": "combat", "title": "Livello 20 - La Furia di Eldric e il Blocco di Foscoclivo", "icon": "👑", "done": false, "active": false, "next": [], "image": "", "enemy": "eldric_dei_cavalcantici" }
    ]
};
