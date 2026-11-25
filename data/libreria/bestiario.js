// Bestiario: tutti i nemici, condivisi dalle campagne.
// I nodi della mappa li richiamano per id nel campo "enemy".
// Il contenuto dopo "=" è JSON puro. Si modifica anche dall'editor delle campagne.
window.LIBRERIA = window.LIBRERIA || {};
window.LIBRERIA.bestiario = {
    "cinghiali": {
        "name": "Cinghiali",
        "image": "immagini/bestiario/cinghiali.webp",
        "hp": 7,
        "maxHp": 7,
        "att": 6,
        "dmg": 1,
        "ca": 6,
        "desc": "Un fruscio improvviso squarcia il silenzio della nebbia mattutina. Sagome scure e massicce emergono dal grigiore: cinghiali con zanne ricurve terrificanti.",
        "sfxAttack": "audio/nemici/cinghiale_attacco.ogg",
        "sfxHit": "audio/nemici/cinghiale_colpito.ogg",
        "sfxDeath": "audio/nemici/cinghiale_morte.ogg"
    },
    "disertori_affamati": {
        "name": "Disertori",
        "image": "immagini/bestiario/disertori.webp",
        "hp": 8,
        "maxHp": 8,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Dalla cortina di nebbia spuntano soldati: disertori affamati e disperati, armati di lance e spade. Vi squadrano con odio.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "lupi": {
        "name": "Lupi",
        "image": "immagini/bestiario/lupi_inverno.webp",
        "hp": 7,
        "maxHp": 7,
        "att": 6,
        "dmg": 2,
        "ca": 7,
        "desc": "Dalle carcasse emergono fauci sbavate: un branco di lupi affamati si aggira tra i cadaveri in cerca di prede.",
        "sfxAttack": "audio/nemici/lupo_attacco.ogg",
        "sfxHit": "audio/nemici/lupo_colpito.ogg",
        "sfxDeath": "audio/nemici/lupo_morte.ogg"
    },
    "banditi": {
        "name": "Banditi",
        "image": "immagini/bestiario/banditi.webp",
        "hp": 10,
        "maxHp": 10,
        "att": 7,
        "dmg": 2,
        "ca": 7,
        "desc": "Banditi spietati che approfittano del caos della guerra vi sbarrano la strada, attratti dal fumo del falò.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "profanatori": {
        "name": "Profanatori",
        "image": "immagini/bestiario/profanatori.webp",
        "hp": 12,
        "maxHp": 12,
        "att": 7,
        "dmg": 2,
        "ca": 7,
        "desc": "Uomini armati di ascia e pala cercano tombe da depredare. Nessuno può profanare un caduto del Leone.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "sergente": {
        "name": "Sergente",
        "image": "immagini/bestiario/scontro_sergente.webp",
        "hp": 12,
        "maxHp": 12,
        "att": 7,
        "dmg": 3,
        "ca": 8,
        "desc": "Una truppa regolare sopravvissuta, guidata da un sergente con corazza insanguinata. Si sfoderano le armi.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg",
        "fasi": [
            { "soglia": 50, "testo": "Il Sergente serra i ranghi e si volta contro chi l'ha ferito!", "azioni": ["contrattacco"] }
        ],
        "video": "video/nemici/sergente_tutorial.mp4"
    },
    "banditi_strada": {
        "name": "Banditi Kin dei campi",
        "image": "immagini/bestiario/banditi_kin.webp",
        "hp": 8,
        "maxHp": 8,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Avete abbandonato da qualche ora il Cammino di Piotr, la lunga strada che congiunge Aebeltoff a Kallekot, e vi siete avventurati per i campi della Valle del Krogg, in direzione di Enisov, villaggio alle pendici dei Picchi del Tramonto. Dalle ombre delle magre coltivazioni invernali, emerge un gruppo di figure sporche e lacere, che parlano una lingua che non conoscete. Probabilmente sono immigrati Kin che si sono dati al banditaggio. Le loro intenzioni, però, sono chiare: fare di voi la loro preda.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "briganti_pedaggio": {
        "name": "Briganti del pedaggio",
        "image": "immagini/bestiario/pedaggio_scontro.webp",
        "hp": 10,
        "maxHp": 10,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Alle porte di Enisov, il piccolo villaggio di contadini ai piedi dei Picchi del Tramonto, un gruppo di guardie presidia uno dei sentieri principali. Ad uno sguardo più attento, gli uomini sembrano indossare le tuniche azzurre e bianche, con il simbolo della testa di un cane, del Clan Seachtuir di Aebeltoff. Sembrerebbero normali guardie, ma il loro aspetto logoro e l'arroganza con cui vi chiedono degli Scudi per passare vi fa capire che sono dei semplici briganti che piagano la tranquilla vita degli abitanti di Enisov.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "branco_lupi": {
        "name": "Branco di lupi",
        "image": "immagini/bestiario/lupi.webp",
        "hp": 10,
        "maxHp": 10,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Fra le rocce dei Picchi del Tramonto, si ode un ringhio profondo e gutturale. Intenti a salire su un sentiero particolarmente franoso, la strada vi viene sbarrata da un branco di lupi grossi e spietati, spinti alla caccia dal freddo e dalla fame. Vi circondano in una situazione che per loro è vantaggiosa, ed ancora una volta siete di fronte ad una seria minaccia per la vostra vita.",
        "sfxAttack": "audio/nemici/lupo_attacco.ogg",
        "sfxHit": "audio/nemici/lupo_colpito.ogg",
        "sfxDeath": "audio/nemici/lupo_morte.ogg"
    },
    "disertori": {
        "name": "Banda di disertori Kin",
        "image": "immagini/bestiario/disertori_kin.webp",
        "hp": 12,
        "maxHp": 12,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Soldati sbandati ed emigrati dell'esercito di resistenza di Foscoclivo, questi uomini si danno al brigantaggio nella Valle del Krogg. Alcuni abitano le caverne sui Picchi del Tramonto, ed è proprio nei pressi di uno di questi rifugi che venite sorpresi da questi Kin. Armati di lance e coltelli, hanno uno sguardo vuoto e segnato dalla paranoia più totale. Non hanno più nulla da perdere.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "predoni": {
        "name": "Predoni",
        "image": "immagini/bestiario/predoni_kin.webp",
        "hp": 12,
        "maxHp": 12,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Guerrieri nomadi e spietati delle lande di confine, agili e letali, specializzati negli agguati lungo i valichi montani. Indossano corazze leggere di pelle e pellicce, armati di scimitarre ricurve e coltelli da lancio che luccicano debolmente nella penombra. Si muovono rapidamente tra i massi, sfruttando ogni copertura per colpire i punti deboli della compagnia con tattiche mordi e fuggi.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "cani_caccia": {
        "name": "Cani da caccia rinselvatichiti",
        "image": "immagini/bestiario/cani_scontro.webp",
        "hp": 7,
        "maxHp": 7,
        "att": 7,
        "dmg": 1,
        "ca": 6,
        "desc": "Dai campi emerge una muta famelica di cani da caccia, che non sembrano rispondere a nessun comando. Probabilmente si tratta di cani da caccia abbandonati dal loro padrone, magari un Lungobarbo partito per la Guerra di Primavera e mai più tornato. Ora, però, per sopravvivenza, puntano a voi come nuovo pasto della giornata.",
        "sfxAttack": "",
        "sfxHit": "",
        "sfxDeath": ""
    },
    "sciacalli_cadaveri": {
        "name": "Sciacalli di cadaveri",
        "image": "immagini/bestiario/sciacalli_cadaveri_2.webp",
        "hp": 8,
        "maxHp": 8,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Un gruppo mal assortito di banditi e disperati, armati alla buona, viene sorpreso da voi mentre sta spogliando alcuni cadaveri, presumibilmente di mercanti allontanatisi dal Cammino. Minacciati dalla vostra presenza, vi puntano contro i coltelli, pronti a dare battaglia.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "orso_bruno": {
        "name": "Orso bruno selvaggio",
        "image": "immagini/bestiario/orso.webp",
        "hp": 14,
        "maxHp": 14,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Un orso, un solitario esemplare maschio, vi si para dinanzi non appena prendete una svolta che vi fa evitare un passo franato. La fiera, pronta al suo letargo, è particolarmente nervosa. Si alza sulle zampe posteriori, facendo sfoggio della sua grandezza mentre è in procinto di attaccarvi.",
        "sfxAttack": "",
        "sfxHit": "",
        "sfxDeath": ""
    },
    "balestrieri_disertori": {
        "name": "Arcieri disertori",
        "image": "immagini/bestiario/arcieri.webp",
        "hp": 11,
        "maxHp": 11,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Un gruppo di banditi muniti di archi, con indosso le tuniche logore con i colori del Clan Heymaey di Svalbard, vi punta da sopra un crinale, sfruttando il terreno elevato. Imbracciate le armi: non sembrano proprio dell'idea di parlamentare.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "cinghiali_pietraie": {
        "name": "Cinghiali delle pendici",
        "image": "immagini/bestiario/cinghiali.webp",
        "hp": 10,
        "maxHp": 10,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Una coppia di cinghiali, nascosti fra gli alberi alle pendici dei Picchi del Tramonto, vi sbuca davanti. Minacciosi, abbassano le zanne e iniziano a caricarvi a testa bassa.",
        "sfxAttack": "audio/nemici/cinghiale_attacco.ogg",
        "sfxHit": "audio/nemici/cinghiale_colpito.ogg",
        "sfxDeath": "audio/nemici/cinghiale_morte.ogg"
    },
    "picchieri_sbandati": {
        "name": "Picchieri disertori",
        "image": "immagini/bestiario/picchieri.webp",
        "hp": 12,
        "maxHp": 12,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Picchieri del Clan Heymaey, a lungo disertori dopo la Guerra dei Quaranta Giorni, vi sbarrano la strada. La vista dei colori che voi indossate sembra far dilatare loro le pupille, come se riconoscessero in voi un nemico atavico.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "esploratori_predoni": {
        "name": "Esploratori Kin",
        "image": "immagini/bestiario/esploratori.webp",
        "hp": 8,
        "maxHp": 8,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "L'avanguardia agile delle bande Kin che infestano le grotte dei Picchi del Tramonto. Si muovono silenziosi fra i valichi e le rupi, osservando le proprie prede e saggiandone le resistenze con attacchi repentini e fughe tattiche.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "fabbro_rinnegato": {
        "name": "Fabbro rinnegato e sgherri",
        "image": "immagini/bestiario/fabbro_rinnegato.webp",
        "hp": 12,
        "maxHp": 12,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Un artigiano delle armate campali datosi al brigantaggio insieme a due manovali. Impugna una mazza da forgia pesante e pinze incandescenti, protetto da un grembiale chiodato capace di deflettere i colpi di striscio.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "cani_corsi": {
        "name": "Branco di cani feroci",
        "image": "immagini/bestiario/cani_corsi.webp",
        "hp": 12,
        "maxHp": 12,
        "att": 7,
        "dmg": 2,
        "ca": 7,
        "desc": "Cani da presa sfuggiti alle tenute saccheggiate a valle. Grossi, silenziosi e privi di collare, sbarrano il sentiero ringhiando a denti stretti, pronti ad azzannare le braccia armate per trascinare a terra chiunque avanzi.",
        "sfxAttack": "",
        "sfxHit": "",
        "sfxDeath": ""
    },
    "capitano_predoni": {
        "name": "Capitano dei predoni Kin",
        "image": "immagini/bestiario/capitano_predoni_2.webp",
        "hp": 10,
        "maxHp": 10,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Lungo i sentieri dei Picchi del Tramonto, vi si para dinanzi una figura imponente. Avvolto in una corazza di cuoio bollito e di metallo scuro, l'uomo parla una lingua a voi sconosciuta, che reputate essere la lingua Kin. Vi fissa con ghigno sprezzante: probabilmente l'uomo è un disertore di Foscoclivo, che utilizza le sue capacità belliche per scopi molto meno nobili, e la sua autorità per radunare attorno a sé altri Kin o furfanti che non vogliono integrarsi con il Nord. Con i colori che portate addosso, avete attirato la sua attenzione da qualche giorno: non vi farà semplicemente passare.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "tremabosco": {
        "name": "Tremabosco Infuriato",
        "image": "immagini/bestiario/tremabosco.webp",
        "hp": 15,
        "maxHp": 15,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Un possente fruscio tra i rami spezzati anticipa l'arrivo di una mole mastodontica: un colosso ricoperto di fitto pelo bruno, con la corporatura massiccia di un toro e la testa armata di zanne ricurve simili a spade. Il Tremabosco Striato fiuta l'aria con il muso ricurvo, raspando furioso il terreno con zampe possenti mentre si raccoglie per una carica devastante. La foresta ammutolisce al suo cospetto.",
        "fasi": [
            { "soglia": 50, "testo": "Il Tremabosco va su tutte le furie: travolgerà chiunque gli stia davanti!", "azioni": ["travolge"] }
        ],
        "sfxAttack": "",
        "sfxHit": "",
        "sfxDeath": ""
    },
    "mastino_bokgar": {
        "name": "Mastino di Bokgar",
        "image": "immagini/bestiario/mastino_bokgar.webp",
        "hp": 14,
        "maxHp": 14,
        "att": 7,
        "dmg": 3,
        "ca": 8,
        "desc": "Dall'oscurità delle rovine emergono sagome scure e fameliche, avvolte da un silenzio innaturale. I Mastini di Bokgar, antichi parassiti notturni sopravvissuti per secoli in cavità dimenticate, avanzano con movimenti furtivi e uno sguardo vitreo privo di paura. Le loro fauci digrignano in attesa di spolpare la carne viva, mentre il loro corpo tradisce il terrore viscerale per la luce, che li rende ancora più aggressivi e disperati.",
        "fasi": [
            { "soglia": 50, "testo": "Il Mastino fiuta il sangue: punta il più debole!", "azioni": ["predatore"] }
        ],
        "sfxAttack": "",
        "sfxHit": "",
        "sfxDeath": ""
    },
    "boia_rinnegati": {
        "name": "Boia rinnegato degli Heymaey",
        "image": "immagini/bestiario/boia.webp",
        "hp": 16,
        "maxHp": 16,
        "att": 7,
        "dmg": 3,
        "ca": 8,
        "desc": "Un colosso umano avvolto in un grembiule di cuoio annerito e macchiato, con il volto celato da un cappuccio di canapa grezza, reca i colori dello scomparso Clan Heymaey. Poggia sulle spalle una pesante mannaia d'acciaio grezzo, usata tanto per tagliare legna quanto per punire sventurati viandanti. Attorno a lui regna un silenzio sinistro: è la retroguardia spietata delle bande montane, abituato a finire i feriti con fredda brutalità.",
        "fasi": [
            { "soglia": 50, "testo": "Il Boia va in furia: la mannaia cerca il più debole!", "azioni": ["furore", "predatore"] }
        ],
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "hungrabarn": {
        "name": "Hungrabarn",
        "image": "immagini/bestiario/hungrabarn.webp",
        "hp": 22,
        "maxHp": 22,
        "att": 7,
        "dmg": 3,
        "ca": 9,
        "desc": "Dall'ombra più profonda della sala emerge una sagoma colossale, un relitto vivente di una razza che il mondo credeva estinta. L'Hungrabarn si erge in tutta la sua spaventosa imponenza, raggiungendo altezze titaniche, con membra possenti e uno sguardo affamato che brama carne umana. Tra le sue mani artigliate e ai suoi piedi si calpestano teschi e ossa accumulate nei secoli, mentre un ruggito primordiale e sordo scuote le rovine. La fine della spedizione si misura adesso contro questo incubo di carne e pietra.",
        "fasi": [
            { "soglia": 66, "testo": "L'Hungrabarn affonda gli artigli nel terreno: si prepara a travolgervi!", "azioni": ["carica"] },
            { "soglia": 33, "testo": "Il ruggito primordiale scuote le rovine!", "azioni": ["furia", "ruggito_primordiale"] }
        ],
        "sfxAttack": "",
        "sfxHit": "",
        "sfxDeath": ""
    },
    "capitano_esploratori": {
        "name": "Capitano degli Esploratori",
        "hp": 16,
        "maxHp": 16,
        "att": 8,
        "dmg": 3,
        "ca": 8,
        "desc": "Mentre vi avvicinate all'accampamento della famiglia sentite dei rumori provenire dalla piccola boscaglia che si sviluppa su un lato della collina, ad uno sguardo più attento notate il riflesso dei raggi di sole che colpiscono il metallo di una lama. Un gruppo di esploratori guidati da un Noviano in armatura è appostato spiando i nostri movimenti, Non possono tornare indietro dal Signore del Ponte.",
        "image": "immagini/bestiario/capitano_esploratori.webp",
        "fasi": [
            { "soglia": 66, "testo": "Il Capitano chiama a raccolta gli esploratori: punta il più debole!", "azioni": ["predatore", "grido_di_battaglia"] },
            { "soglia": 33, "testo": "Messo alle strette, il Capitano mena fendenti a tutta la compagnia!", "azioni": ["colpo_area"] }
        ],
        "video": "video/nemici/boss_tutorial.mp4"
    },
    "ragno_nero_imperiale": {
        "name": "Ragno Nero Imperiale",
        "image": "immagini/bestiario/ragno_imperiale.webp",
        "hp": 15,
        "maxHp": 15,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Vi infilate in un pertugio fra le pareti di roccia, in cui riuscite a passare soltanto spalla a spalla. Man mano che avanzate, sentite qualcosa di appiccicoso sui vestiti. Quando realizzate che si tratta di una ragnatela fine come la seta e dura come l'acciaio, è troppo tardi per tornare indietro: sopra di voi si staglia l'irsuta figura di un Ragno Nero Imperiale, della grandezza di un cerbiatto. La fiera fa scattare i cheliceri, pronta ad attaccarvi.",
        "fasi": [
            { "soglia": 50, "testo": "Il Ragno Nero Imperiale si scaglia furioso: le sue zampe falciano chiunque gli stia accanto!", "azioni": ["travolge"] }
        ],
        "sfxAttack": "",
        "sfxHit": "",
        "sfxDeath": ""
    },
    "cenofori_slavine": {
        "name": "Cenofori delle Slavine",
        "image": "immagini/bestiario/cenofori.webp",
        "hp": 14,
        "maxHp": 14,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Mentre attraversate un passo, notate strani movimenti sulle pendici. Inizialmente non ci fate caso, ma quando aguzzate lo sguardo notate degli esseri simili a lucertole ma bianchi come la neve. Li riconoscete, sono Cenofori delle Slavine, delle fiere innocue, che abitano i picchi innevati. La preoccupazione sale quando tre o quattro di loro, particolarmente grossi, sembrano guardare verso di voi. Mentre camminate, sentite cedere della neve lungo le pendici. È la tattica di caccia dei Cenofori: provocare slavine per poi attaccare le proprie prede.",
        "fasi": [
            { "soglia": 99, "testo": "I Cenofori fiutano il sangue: puntano il più debole!", "azioni": ["predatore"] },
            { "soglia": 55, "testo": "", "azioni": ["furia"] }
        ],
        "sfxAttack": "",
        "sfxHit": "",
        "sfxDeath": ""
    },
    "vitghen_rinnegati": {
        "name": "Vitghen rinnegati",
        "image": "immagini/bestiario/vitgen.webp",
        "hp": 12,
        "maxHp": 12,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Dai massi dei sentieri dei Picchi del Tramonto, emergono dei Vitghen armati di tutto punto. Agili e letali, portano con onore il marchio che li contrassegna come ripudiati dai propri clan di appartenenza. Rukvar, Seachtuir, Drummond ed altri clan figurano fra questi. Si muovono rapidamente fra le insenature, i massi e le pareti di roccia, pronti a difendere il loro covo. Portano addosso segni di battaglia, probabilmente sono in lotta per il territorio con i briganti Kin.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "cantori_fiamma": {
        "name": "Cantore della Fiamma rinnegato",
        "image": "immagini/bestiario/cantori_fiamma.webp",
        "hp": 12,
        "maxHp": 12,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Dinanzi a voi si presenta un membro dei Cantori della Fiamma, gli artigiani sacri di Aebeltoff, munito di vesti logore e che inneggia a movimenti del cielo e a forge impossibili. Assieme a lui, due manovali lo spalleggiano, come cultisti di quel culto privo di senno. Sono pronti alla battaglia, nel nome di non si sa quale Asi a cui facciano riferimento.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "tremabosco_striato": {
        "name": "Tremabosco Striato",
        "image": "immagini/bestiario/tremabosco_2.webp",
        "hp": 22,
        "maxHp": 22,
        "att": 7,
        "dmg": 3,
        "ca": 9,
        "desc": "Vi sembra di essere partiti da anni, ma siete soltanto all'inizio della vostra scalata dei Picchi del Tramonto. Vi sembra quasi impossibile essere riusciti a trovare una piccola foresta fra i valichi. Eppure, eccola dinanzi a voi. La attraversate, per continuare il vostro cammino, quando un possente fruscio tra i rami spezzati anticipa l'arrivo di una mole mastodontica: un colosso ricoperto di fitto pelo bruno, con la corporatura massiccia e la testa dotata di zanne ricurve taglienti come lame. Il Tremabosco Striato fiuta l'aria con il muso ricurvo, raspando furiosamente il terreno. La foresta ammutolisce al suo cospetto.",
        "fasi": [
            { "soglia": 66, "testo": "Il Tremabosco Striato raspa furiosamente il terreno: si prepara a travolgervi!", "azioni": ["carica"] },
            { "soglia": 33, "testo": "Il ruggito primordiale scuote la foresta!", "azioni": ["furia", "ruggito_primordiale"] }
        ],
        "sfxAttack": "",
        "sfxHit": "",
        "sfxDeath": ""
    },
    "fuorilegge_tutorial": {
        "name": "Fuorilegge",
        "hp": 10,
        "maxHp": 10,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Un gruppo di fuorilegge, disertori, non ne avete idea, sicuramente non hanno buone intenzioni, dovrete farvi strada combattendo",
        "image": "immagini/bestiario/fuorilegge_tutorial.webp"
    },
    "orso_bruno_tutorial": {
        "name": "Orso bruno",
        "image": "immagini/bestiario/orso_tutorial.webp",
        "hp": 14,
        "maxHp": 14,
        "att": 7,
        "dmg": 2,
        "ca": 7,
        "desc": "Un orso, un solitario esemplare maschio, vi si para dinanzi non appena prendete una svolta illuminata dalla luce dell'alba. La fiera è particolarmente nervosa. Si alza sulle zampe posteriori, facendo sfoggio della sua grandezza mentre è in procinto di attaccarvi. Dovrete sconfiggerla per raggiungere l'uscita della grotta.",
        "sfxAttack": "",
        "sfxHit": "",
        "sfxDeath": "",
        "fasi": [
            { "soglia": 50, "testo": "L'Orso Bruno si scaglia furioso: le sue zampe falciano chiunque gli stia accanto!", "azioni": ["travolge"] }
        ],
        "video": "video/nemici/orso_tutorial.mp4"
    },
    "cacciatori_frodo_vitghen": {
        "name": "Cacciatori di frodo Vitghen",
        "image": "immagini/bestiario/vitgen.webp",
        "hp": 16,
        "maxHp": 16,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Oltrepassata la prima linea di abeti neri della foresta morta, il sentiero di fango ghiacciato si fa subito ripido. Da dietro i resti di un albero caduto vi tende un agguato un gruppo di cacciatori di frodo Vitghen, avvolti in pellicce consunte, disperati e pronti a uccidere per rubarvi le provviste.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg",
        "speciali": [
            { "quando": "colpisce", "fai": "ruba_scudi", "val": 5 }
        ]
    },
    "banditi_kin_brachidani": {
        "name": "Banditi Kin e Brachidani",
        "image": "",
        "hp": 18,
        "maxHp": 18,
        "att": 7,
        "dmg": 1,
        "ca": 6,
        "desc": "L'aria gelida fischia tra i rami pietrificati della foresta morta. Vi imbattete in una banda di disperati rifugiati Kin, fuggiti dalla guerra a Foscoclivo e ormai datisi al banditismo. Frustano due Brachidani, spingendoli contro i tronchi per usarli come bestie da sfondamento contro di voi. Le creature caricano a testa bassa."
    },
    "predoni_nevi": {
        "name": "Predoni delle Nevi",
        "image": "",
        "hp": 16,
        "maxHp": 16,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Il terreno nella fitta nebbia della foresta si fa irregolare, irto di radici nere coperte di brina. Dei predoni delle nevi, armati di asce arrugginite, emergono da dietro gli alberi morti esigendo un pedaggio di sangue per attraversare quelli che sono, a detta loro, i loro boschi.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "stordisci", "bersaglio": "casuale" }
        ]
    },
    "troll_giovani": {
        "name": "Troll giovani",
        "image": "",
        "hp": 20,
        "maxHp": 20,
        "att": 6,
        "dmg": 1,
        "ca": 6,
        "desc": "Sfiorando la base scavata di un colossale abete ormai pietrificato dal gelo, sentite il rumore di ossa frantumate. Un branco di Troll giovani sta divorando una carcassa, rannicchiato tra le enormi radici; notandovi, si avventano su di voi con gli occhi iniettati di sangue.",
        "speciali": [
            { "quando": "inizio_round", "fai": "cura", "val": 1 }
        ]
    },
    "banditi_kin_warg": {
        "name": "Banditi Kin con Warg",
        "image": "",
        "hp": 18,
        "maxHp": 18,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "L'aria si fa più tagliente mentre la nebbia si dirada leggermente tra i rami morti della foresta. Sotto un cielo grigio piombo, incrociate dei banditi Kin che utilizzano feroci Warg al guinzaglio, annusando il fango ghiacciato per braccare i viaggiatori. Vi hanno appena fiutato.",
        "sfxAttack": "audio/nemici/lupo_attacco.ogg",
        "sfxHit": "audio/nemici/lupo_colpito.ogg",
        "sfxDeath": "audio/nemici/lupo_morte.ogg",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "stordisci", "bersaglio": "casuale" }
        ]
    },
    "disertori_vitghen_radura": {
        "name": "Disertori Vitghen",
        "image": "immagini/bestiario/vitgen.webp",
        "hp": 18,
        "maxHp": 18,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Attraversando una radura dove gli alberi pietrificati sono stati abbattuti dal vento, affrontate dei disertori Vitghen impazziti. Hanno perso la ragione a causa del freddo e del sussurro costante dei Picchi del Tramonto, attaccando senza curarsi dei graffi inferti dai rovi ghiacciati.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg",
        "speciali": [
            { "quando": "colpisce", "fai": "ruba_scudi", "val": 5 }
        ]
    },
    "esiliati_seachtuir_foresta": {
        "name": "Esiliati Seachtuir",
        "image": "",
        "hp": 18,
        "maxHp": 18,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Siete al confine esatto in cui la foresta muore del tutto e la pietra prende il sopravvento. Guerrieri esiliati del Clan Seachtuir, coperti di pelli pesanti, sfruttano gli ultimi tronchi spezzati come copertura per braccarvi e saccheggiare i vostri corpi prima che possiate addentrarvi nelle viscere della montagna.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg",
        "speciali": [
            { "quando": "inizio_round", "fai": "potenzia", "stat": "dmg", "val": 1, "se": "sotto_meta", "limite": "scontro", "volte": 2 }
        ]
    },
    "branco_ghofuuri": {
        "name": "Branco di Ghofuuri",
        "image": "",
        "hp": 20,
        "maxHp": 20,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Abbandonata la foresta morta in superficie, scendete nelle profondità dei Crepacci Ululanti. Siete circondati da vertiginosi abissi e pareti di solido ghiaccio azzurro. Entrando nella Gola del Lamento, un feroce branco di Ghofuuri, bestie cacciatrici abituate all'oscurità dei crepacci, vi sbarra il passaggio.",
        "sfxAttack": "audio/nemici/lupo_attacco.ogg",
        "sfxHit": "audio/nemici/lupo_colpito.ogg",
        "sfxDeath": "audio/nemici/lupo_morte.ogg"
    },
    "predoni_vitghen_crepacci": {
        "name": "Predoni Vitghen",
        "image": "immagini/bestiario/vitgen.webp",
        "hp": 20,
        "maxHp": 20,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Lasciandovi gli alberi morti alle spalle, vi calate nell'abisso dei Crepacci Ululanti su instabili passerelle naturali. L'ululato del vento vi assorda. Predoni Vitghen, attrezzati con funi e ramponi, calano dall'alto della faglia cercando di spingervi nel vuoto infinito.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg",
        "speciali": [
            { "quando": "colpisce", "fai": "ruba_scudi", "val": 5 }
        ]
    },
    "silfidi_eterei_crepaccio": {
        "name": "Silfidi Eterei",
        "image": "",
        "hp": 18,
        "maxHp": 18,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Il fondo del crepaccio diventa infido, costituito da sottili strati di brina tesi sopra il vuoto. Silfidi Eterei, spiriti manifestati come raffiche di vento gelido e tagliente incanalate nelle pareti strette, turbinano nella gola per congelarvi il sangue e farvi precipitare di sotto.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "tutti" }
        ]
    },
    "mastini_nevi": {
        "name": "Mastini delle Nevi",
        "image": "",
        "hp": 20,
        "maxHp": 20,
        "att": 7,
        "dmg": 0,
        "ca": 7,
        "desc": "Scalando una ripida parete di ghiaccio per risalire il crepaccio, un ululato bestiale si fonde con l'eco del vento. Branchi di feroci mastini delle nevi, sguinzagliati dai loro padroni lungo gli stretti passaggi, cercano di sbranarvi in uno spazio dove schivare è impossibile.",
        "sfxAttack": "audio/nemici/lupo_attacco.ogg",
        "sfxHit": "audio/nemici/lupo_colpito.ogg",
        "sfxDeath": "audio/nemici/lupo_morte.ogg",
        "speciali": [
            { "quando": "colpisce", "fai": "danni", "val": 1, "bersaglio": "piu_debole" }
        ]
    },
    "hrost": {
        "name": "Hrost",
        "image": "",
        "hp": 22,
        "maxHp": 22,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Strisciando in una grotta nascosta nel ghiaccio millenario del crepaccio, urtate involontariamente una scultura. Si tratta di uno Hrost, un formidabile abitante mimetico delle nevi sotterranee che si anima furiosamente per difendere il suo angusto territorio.",
        "speciali": [
            { "quando": "colpisce", "fai": "infuria" }
        ]
    },
    "predoni_kin_crepaccio": {
        "name": "Predoni Kin",
        "image": "",
        "hp": 20,
        "maxHp": 20,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Risalendo i fianchi della gola, uscite brevemente allo scoperto per aggirare una faglia. Dall'alto dei bordi del crepaccio, predoni Kin fanno rotolare enormi massi per schiacciarvi, prima di calarsi con le funi a finirvi nell'oscurità.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg",
        "speciali": [
            { "quando": "colpito", "se": "sotto_meta", "fai": "potenzia", "stat": "dmg", "val": 1, "limite": "scontro" }
        ]
    },
    "sopravvissuti_kin": {
        "name": "Sopravvissuti Kin",
        "image": "",
        "hp": 20,
        "maxHp": 20,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Rintanati in una buia alcova vicino all'uscita del crepaccio, trovate un gruppo di Kin disperati che lottano per mantenere acceso un piccolo fuoco al riparo dal vento. L'eco dei vostri passi li allerta: destinati a morire di freddo, decidono che le pelli che voi indossate sono l'unica salvezza.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "kreehorn": {
        "name": "Kreehorn, il Signore del Crepaccio",
        "image": "",
        "hp": 25,
        "maxHp": 25,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Sull'unica grande via d'uscita che vi riporterà all'aperto, incombe il Signore del Crepaccio. A guardia del passaggio si erge un Kreehorn, un imponente Silfide del Gelo dalle corna gargantuesche che sbuffa cristalli ghiacciati e taglienti. È intrappolato qui quanto voi, e sarà uno scontro senza pietà.",
        "fasi": [
            { "soglia": 61, "testo": "Il Kreehorn sbuffa una tempesta di cristalli: travolge chiunque gli stia accanto!", "azioni": ["travolge", "contrattacco"] },
            { "soglia": 31, "testo": "", "azioni": ["frantuma_scudi"] }
        ]
    },
    "kornugan": {
        "name": "Kornugan",
        "image": "immagini/bestiario/25_scontroelite_kornugan_1_.webp",
        "hp": 13,
        "maxHp": 13,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Finalmente fuori dall'oscurità dei crepacci, vi ritrovate appesi alle pareti verticali esterne della montagna, i Dirupi del Cielo Infranto. Costretti su una strettissima cengia a strapiombo sulle nuvole, un maestoso Kornugan dalle corna imponenti vi sbarra la strada.",
        "fasi": [
            { "soglia": 80, "testo": "Il Kornugan abbassa le corna e raspa la roccia: si prepara a caricare!", "azioni": ["travolge"] },
            { "soglia": 50, "testo": "", "azioni": ["frantuma_scudi"] }
        ]
    },
    "disertori_vitghen_dirupi": {
        "name": "Disertori Vitghen",
        "image": "immagini/bestiario/vitgen.webp",
        "hp": 20,
        "maxHp": 20,
        "att": 7,
        "dmg": 2,
        "ca": 7,
        "desc": "Usciti dai crepacci per affrontare le pareti verticali dei Dirupi, venite intercettati lungo un canale ascensionale. Disertori Vitghen, esperti di arrampicata libera e assuefatti all'aria rarefatta, sfruttano l'agilità sulla parete nuda per tendervi agguati in pendenza.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "predoni_accecati": {
        "name": "Predoni Accecati",
        "image": "",
        "hp": 20,
        "maxHp": 20,
        "att": 7,
        "dmg": 2,
        "ca": 7,
        "desc": "Appesi al luminoso versante roccioso dei Dirupi, combattete contro una banda di predoni le cui menti e i cui occhi sono stati bruciati dal riverbero del sole d'alta quota. Usano lame affilate per recidere le vostre funi e sbilanciarvi nel vuoto.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "warg_mutati": {
        "name": "Warg Mutati",
        "image": "immagini/bestiario/43_scontroelite_warg_mutati_1_.webp",
        "hp": 14,
        "maxHp": 14,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Sulla rupe scoscesa dei Dirupi che state scalando, l'aria rarefatta vi riempie i polmoni. Siete braccati dai predatori delle vette: un branco di spaventosi Warg mutati, dal respiro pesante per l'altitudine, che si lancia in una spietata caccia coordinata per farvi scivolare giù.",
        "fasi": [
            { "soglia": 75, "testo": "Il branco fiuta il sangue: i Warg puntano il più debole!", "azioni": ["secondo_vento"] },
            { "soglia": 50, "testo": "", "azioni": ["imprevedibile"] },
            { "soglia": 25, "testo": "", "azioni": ["vendetta_sul_debole"] }
        ],
        "sfxAttack": "audio/nemici/lupo_attacco.ogg",
        "sfxHit": "audio/nemici/lupo_colpito.ogg",
        "sfxDeath": "audio/nemici/lupo_morte.ogg"
    },
    "esiliati_seachtuir_cengia": {
        "name": "Esiliati Seachtuir",
        "image": "",
        "hp": 20,
        "maxHp": 20,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Una vertiginosa lingua di roccia larga due spanne, sospesa nel vuoto della parete esterna, vi costringe ad affrontare in fila indiana un gruppo di letali guerrieri del Clan Seachtuir esiliati. Un solo capogiro dovuto all'altitudine significa morte certa.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg",
        "speciali": [
            { "quando": "inizio_round", "fai": "potenzia", "val": 1, "stat": "dmg", "limite": "scontro", "volte": 2 }
        ]
    },
    "avatar_tramonto": {
        "name": "Avatar del Tramonto",
        "image": "",
        "hp": 29,
        "maxHp": 29,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Incastrato tra due pinnacoli di roccia aerea riposa quello che secondo le leggende è il Braccio della Montagna, un Golem di roccia incandescente e ghiaccio, fusi in un'improbabile alchimia. Il Golem si desta sferrando colpi tellurici per distruggere i cornicioni dei Dirupi su cui state camminando.",
        "fasi": [
            { "soglia": 50, "testo": "L'Avatar del Tramonto colpisce la roccia: il cornicione trema sotto tutta la compagnia!", "azioni": ["travolge", "colpo_area"] }
        ]
    },
    "assassini_assiderati": {
        "name": "Assassini Assiderati",
        "image": "",
        "hp": 22,
        "maxHp": 22,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Sulla parete della montagna, resa viscida dal ghiaccio sciolto dal sole e poi ricongelato, vi attaccano assassini ricoperti di cicatrici da assideramento. Utilizzano dardi paralizzanti, sperando che i vostri muscoli cedano all'ipossia e vi facciano precipitare dai Dirupi.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg",
        "speciali": [
            { "quando": "colpito", "se": "sotto_meta", "fai": "potenzia", "stat": "dmg", "val": 1, "limite": "scontro" }
        ]
    },
    "silfidi_eterei_gradinata": {
        "name": "Silfidi Eterei",
        "image": "",
        "hp": 18,
        "maxHp": 18,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Su una gelida gradinata scolpita nel fianco nudo della montagna, la temperatura precipita brutalmente. Creature del vento e Silfidi Eterei assumono forme taglienti, vorticando attorno a voi per asfissiarvi e strapparvi l'ultimo calore vitale ad alta quota.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "tutti" }
        ]
    },
    "criogolem": {
        "name": "Criogolem",
        "image": "",
        "hp": 31,
        "maxHp": 31,
        "att": 7,
        "dmg": 2,
        "ca": 9,
        "desc": "Scavalcato il cornicione, la verticalità finisce e vi immettete nel Mare Bianco. In questa landa glaciale piana e sconfinata, avanzando a fatica nella neve alta, emerge una figura titanica: un letale Criogolem.",
        "fasi": [
            { "soglia": 50, "testo": "Il ghiaccio del Criogolem si incrina e lo rende furioso: ogni colpo è più pesante del precedente!", "azioni": ["furia"] },
            { "soglia": 25, "testo": "", "azioni": ["pelle_di_brina"] }
        ]
    },
    "cenofori_mare_bianco": {
        "name": "Cenofori delle Slavine",
        "image": "immagini/bestiario/cenofori.webp",
        "hp": 29,
        "maxHp": 29,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Terminata la scalata e calpestando il frastagliato ghiaccio perenne che lastrica l'inizio del Mare Bianco, venite travolti da una slavina. Vi mettete al riparo giusto in tempo, ma vi accorgete che non era una slavina naturale: è stata causata da un branco di Cenofori delle Slavine, che vuole fare di voi il suo pasto.",
        "fasi": [
            { "soglia": 71, "testo": "I Cenofori fiutano il sangue: puntano il più debole!", "azioni": ["predatore"] },
            { "soglia": 35, "testo": "", "azioni": ["furore"] }
        ]
    },
    "cenofori_mare_bianco_finale": {
        "name": "Cenofori delle Slavine",
        "image": "immagini/bestiario/cenofori.webp",
        "hp": 14,
        "maxHp": 14,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Terminata la scalata e calpestando il frastagliato ghiaccio perenne che lastrica l'inizio del Mare Bianco, venite travolti da una slavina. Vi mettete al riparo giusto in tempo, ma vi accorgete che non era una slavina naturale: è stata causata da un branco di Cenofori delle Slavine, che vuole fare di voi il suo pasto.",
        "fasi": [
            { "soglia": 71, "testo": "I Cenofori fiutano il sangue: puntano il più debole!", "azioni": ["predatore"] },
            { "soglia": 35, "testo": "", "azioni": ["furore"] }
        ]
    },
    "gheist_gelo": {
        "name": "Gheist del Gelo",
        "image": "",
        "hp": 22,
        "maxHp": 22,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Nel vortice incessante di neve che spazza la landa piatta del Mare Bianco, scorgete dei Gheist del Gelo, viandanti morti assiderati in questa stessa piana secoli fa, che barcollano verso di voi spinti dall'odio per il calore della vita."
    },
    "troll_corazzati": {
        "name": "Troll Corazzati",
        "image": "",
        "hp": 24,
        "maxHp": 24,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "In una profonda trincea scavata dalle bufere nel ghiaccio del plateau, assistete a uno scontro brutale: orgogliosi guerrieri del Clan Seachtuir esiliati lottano per la sopravvivenza contro dei Troll corazzati di ghiaccio. Accecati dalla fame del Mare Bianco, vi attaccano tutti indistintamente.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "stordisci", "bersaglio": "casuale" },
            { "quando": "inizio_round", "fai": "cura", "val": 1 }
        ]
    },
    "superstiti_kin": {
        "name": "Superstiti Kin",
        "image": "",
        "hp": 22,
        "maxHp": 22,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Vagando alla cieca nella tormenta implacabile che riduce la visibilità a zero, venite assaliti da un disperato gruppo di Kin, superstiti di una spedizione perduta nella piana del Mare Bianco. Folli per l'isolamento e rosi dal cannibalismo, brandiscono ossa appuntite per strapparvi i vestiti.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "spettri_tumuli": {
        "name": "Spettri dei Tumuli",
        "image": "",
        "hp": 22,
        "maxHp": 22,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Tra enormi dune di neve fresca modellate dai venti polari che sferzano la piana del Mare Bianco, subite l'assalto strisciante degli Spettri dei Tumuli. Si innalzano dal candore del terreno come mietitori silenziosi, attraversando la neve e il vostro equipaggiamento per drenarvi l'anima.",
        "speciali": [
            { "quando": "colpito", "fai": "danni", "val": 1 },
            { "quando": "colpito", "fai": "silenzia", "durata": 1 },
            { "quando": "colpisce", "fai": "spezza_armatura" }
        ]
    },
    "custodi_necrogemini": {
        "name": "Custodi Necrogemini",
        "image": "",
        "hp": 33,
        "maxHp": 33,
        "att": 7,
        "dmg": 2,
        "ca": 9,
        "desc": "Tra le rare rovine di pietra sepolte dalla tormenta infinita del Mare Bianco dimorano due Custodi Necrogemini. Due enormi campioni defunti, che indossano armature pesanti forgiate dai Cultori della Fiamma, affrontano la bufera lottando in perfetta simbiosi. Abbatterne uno farà infuriare l'altro.",
        "fasi": [
            { "soglia": 70, "testo": "Un Custode cade: il gemello si infuria e risponde subito al colpo!", "azioni": ["furore", "contrattacco"] },
            { "soglia": 40, "testo": "", "azioni": ["terrore"] }
        ]
    },
    "esiliati_seachtuir_confine": {
        "name": "Esiliati Seachtuir",
        "image": "",
        "hp": 22,
        "maxHp": 22,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Ai piedi della grande gradinata di ghiaccio nerastro che segna il confine finale del Mare Bianco, incrociate degli Esiliati Seachtuir. Colossi Lungobarbi con pesanti spallacci ricoperti di neve perenne, incatenati qui.",
        "sfxAttack": "audio/nemici/umano_attacco.ogg",
        "sfxHit": "audio/nemici/umano_colpito.ogg",
        "sfxDeath": "audio/nemici/umano_morte.ogg",
        "speciali": [
            { "quando": "inizio_round", "fai": "potenzia", "val": 1, "stat": "dmg", "limite": "scontro", "volte": 2 }
        ]
    },
    "fiere_selvagge": {
        "name": "Fiere Selvagge",
        "image": "",
        "hp": 24,
        "maxHp": 24,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "In un accampamento circolare scavato nel ghiaccio e macchiato di sangue nella neve profonda, domatori Vitghen scagliano contro di voi ondate di fiere selvagge assiderate.",
        "sfxAttack": "audio/nemici/lupo_attacco.ogg",
        "sfxHit": "audio/nemici/lupo_colpito.ogg",
        "sfxDeath": "audio/nemici/lupo_morte.ogg"
    },
    "silfidi_flussidi": {
        "name": "Silfidi Flussidi",
        "image": "",
        "hp": 24,
        "maxHp": 24,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Alla fine del plateau di ghiaccio del Mare Bianco, l'ululato della tormenta raggiunge il suo apice assoluto. Enormi Silfidi Flussidi, spiriti elementali fatti di neve tagliente, ghiaccio nero e raffiche spietate, si scagliano contro di voi."
    },
    "madre_silfidi": {
        "name": "Aracnomantropo",
        "image": "",
        "hp": 39,
        "maxHp": 39,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Dall’imboccatura della caverna emerge lentamente un Aracnomantropo, piegato in avanti per attraversare il basso arco di roccia. La parte superiore del corpo conserva qualcosa di vagamente umano: un torso scarno, pelle grigiastra e braccia troppo lunghe, terminate da dita sottili e uncinate. Dal bacino, però, si diramano sei zampe aracnidi, nere e nodose, che tastano la pietra una dopo l’altra con movimenti rapidi e innaturalmente precisi. La creatura rimane immobile per qualche istante, osservando il sentiero, poi inclina lentamente la testa e comincia ad avanzare con quel movimento spezzato e silenzioso tipico dei ragni.",
        "fasi": [
            { "soglia": 80, "testo": "Il volto è quasi privo di espressione, deformato da più piccoli occhi scuri.", "azioni": [] },
            { "soglia": 51, "testo": "", "azioni": ["furia"] },
            { "soglia": 10, "testo": "L'urlo della tempesta vi gela il sangue!", "azioni": ["ruggito_primordiale"] }
        ],
        "speciali": [
            { "quando": "colpisce", "fai": "veleno", "val": 1, "durata": 1 }
        ]
    },
    "arcanitradico": {
        "name": "Arcanitradico, l'Albero dell'Impiccato",
        "hp": 17,
        "maxHp": 17,
        "att": 8,
        "dmg": 1,
        "ca": 8,
        "desc": "Al centro di una radura senza un filo d'erba si leva un sempreverde contorto, più alto di qualunque abete. A mezz'altezza un nodulo della corteccia ghigna come un volto. La candela che portate brucia blu. Gli antichi del Nord lo chiamano Angarde Traad, l'Albero dell'Impiccato: lento alla rabbia, ma dalla vendetta letale. Chi ne ferisce la corteccia viene investito dall'energia arcana che ha bevuto dal sottosuolo.",
        "speciali": [
            { "quando": "colpito", "prob": 35, "fai": "danni", "val": 1, "bersaglio": "eroe" }
        ],
        "fasi": [
            { "soglia": 70, "testo": "Il nodulo ghignante si spalanca: le radici dell'Impiccato si muovono sotto i vostri piedi!", "azioni": ["radici_dell_impiccato"] },
            { "soglia": 40, "testo": "La foresta ruggisce con lui! L'albero beve dalla radura e richiude le ferite.", "azioni": ["la_foresta_ruggisce"] },
            { "round": 12, "testo": "Lento alla rabbia, letale nella vendetta: la radura muore e vi prosciuga con lei!", "azioni": ["radura_morta"] }
        ]
    },
    "branco_di_warg_d_altura": {
        "name": "Branco di Warg d'Altura",
        "hp": 8,
        "maxHp": 8,
        "att": 6,
        "dmg": 1,
        "ca": 7,
        "desc": "Oltrepassata l'ultima fascia di roccia nuda, l'aria si fa così sottile da bruciare la gola a ogni respiro. Tra le creste spazzate dal vento gelido vi sbarra il passo un branco di Warg adattati alle quote estreme, spinti fin quassù dalla totale assenza di prede più a valle. Hanno il pelo ispido incrostato di brina e le gengive nere scoperte per la fame: non ringhiano per non sprecare fiato nell'aria rarefatta, ma si aprono a ventaglio sulla neve dura, pronti ad azzannarvi ai tendini per trascinarvi nel precipizio."
    },
    "brachidanio_delle_vette": {
        "name": "Brachidanio delle Vette",
        "hp": 10,
        "maxHp": 10,
        "att": 6,
        "dmg": 1,
        "ca": 7,
        "desc": "Risalendo un canalone di scisto spaccato dal gelo perenne, uno dei massi grigiastri lungo la cengia si solleva di scatto con un raschio sordo. È un Brachidanio che riposava acciambellato al riparo dal vento, indistinguibile dalla pietra circostante. Infastidito dal vostro passaggio in uno spazio così angusto, inarca il carapace osseo irto di aculei e carica a testa bassa lungo il pendio, facendo franare il pietrisco sul baratro e menando colpi pesanti con la coda corazzata.",
        "speciali": [
            { "quando": "inizio_round", "fai": "stordisci", "bersaglio": "casuale", "prob": 50 }
        ]
    },
    "warg_solengo": {
        "name": "Warg Solengo",
        "hp": 10,
        "maxHp": 10,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Un ringhio profondo si confonde con il muggito del vento tra i pinnacoli di pietra. Davanti a voi non c'è una muta, ma un singolo Warg di taglia mostruosa, con il muso segnato da vecchie cicatrici bianche e un canino spezzato. È un vecchio maschio dominante, un solengo salito a vivere sulle creste più alte dopo aver abbandonato il branco. Molto più astuto, massiccio e prudente dei suoi simili più giovani, sfrutta gli spuntoni di roccia per coprirsi dai tiri a distanza e vi studia in silenzio, pronto a caricare il primo che mostra un segno di debolezza.",
        "speciali": [
            { "quando": "colpito", "fai": "danni", "val": 1, "prob": 50 }
        ]
    },
    "vespertilio_magno": {
        "name": "Vespertilio Magno",
        "hp": 12,
        "maxHp": 12,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Per aggirare un torrione di roccia verticale impossibile da scalare con il vento traverso, siete costretti a infilarvi in un inghiottitoio naturale che taglia la cresta della montagna. Nel buio gelido della caverna, l'aria è satura di un odore acre di ammoniaca e sangue vecchio. Dal soffitto di pietra si stacca improvvisamente una sagoma membranosa grande quanto un vitello: è un Vespertilio Magno, il mostruoso dominante di una colonia di pipistrelli delle vette. Emette uno stridio acutissimo che rimbomba nelle pareti strette per stordirvi, lanciandosi in picchiata nel buio per squarciarvi le gole.",
        "fasi": [
            { "soglia": 66, "testo": "", "azioni": ["contrattacco"] },
            { "soglia": 33, "testo": "", "azioni": ["imprevedibile"] }
        ],
        "speciali": [
            { "quando": "inizio_round", "fai": "stordisci", "bersaglio": "piu_forte", "prob": 35 }
        ]
    },
    "tremolisco_nella_foschia": {
        "name": "Tremolisco nella Foschia",
        "hp": 13,
        "maxHp": 13,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Proprio mentre percorrete una sella stretta tra due picchi, un banco di nuvole basse e densissime sale dal baratro avvolgendovi in un biancore cieco che muove controvento. Nel silenzio ovattato della nebbia, dove non riuscite nemmeno a vedere la punta della vostra spada, esplode un suono agghiacciante: un frenetico e metallico sbattere di denti che sembra provenire da ogni direzione. Un Tremolisco sta vorticando nella foschia per isolarvi e farvi precipitare nel vuoto; dovrete tenere la formazione serrata e usare il ferro per respingere i suoi assalti invisibili."
    },
    "aviano_moork": {
        "name": "Aviano Moork",
        "hp": 10,
        "maxHp": 10,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "L'ululato del vento cessa di colpo dietro un bastione di roccia nera, sostituito da un silenzio innaturale che porta con sé un'ondata improvvisa di angoscia, rimorso e disperazione. Appollaiato su un dente di pietra sopra le vostre teste c'è un Aviano Moork, uno degli ultimi esemplari degenerati di una razza antica che abita le gole più fredde e inaccessibili delle vette. Vi fissa dall'alto con occhi vitrei, aspettando che la sua aura opprimente vi pieghi le ginocchia o vi spinga a gettarvi nel vuoto, prima di calare in picchiata con gli artigli protesi per strapparvi la carne."
    },
    "esiliati_braggart_superstiti": {
        "name": "Esiliati Braggart Superstiti",
        "hp": 13,
        "maxHp": 13,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Su una cresta affilata dove passa a malapena un uomo alla volta, due colossi avvolti in pelli di cinghiale irrigidite dal ghiaccio vi sbarrano il cammino. Sono guerrieri esiliati del Clan Braggart, quasi sterminato dalla Famiglia durante la Guerra dei Quaranta Giorni, saliti su queste vette impossibili in cerca di una bestia leggendaria da abbattere per riscattare il proprio onore con un'impresa folle. Riconoscendo su di voi i simboli di Dignitas, gli occhi iniettati di sangue si illuminano di furia: per loro, morire uccidendo dei Dignitas sulla cima del mondo vale quanto abbattere un mostro."
    },
    "kreehorn_territoriale": {
        "name": "Kreehorn Territoriale",
        "hp": 16,
        "maxHp": 16,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Attraversando un nevaio incassato tra due pareti verticali di ghiaccio azzurro, vi ritrovate faccia a faccia con un imponente Kreehorn. La bestia supera i tre metri d'altezza al palco delle corna, il corpo massiccio coperto da una folta lanugine di filamenti gelati e il dorso irto di speroni di ghiaccio durissimo. Sebbene i Kreehorn siano solitamente schivi, la gola stretta non gli lascia alcuna via di fuga: sbuffa vapore bianco dalle narici, abbassa la testa coronata di lance glaciali e carica con una forza capace di sfondare uno scudo di ferro.",
        "speciali": [
            { "quando": "inizio_round", "fai": "danni", "val": 1, "bersaglio": "tutti", "prob": 35 }
        ]
    },
    "golem_terrigeno_delle_vette": {
        "name": "Golem Terrigeno delle Vette",
        "hp": 18,
        "maxHp": 18,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Proprio nel punto in cui il sentiero taglia una ricca vena superficiale di quarzo e Pietre dell'Aquila, una porzione della parete rocciosa si stacca con uno schianto secco, sollevandosi su due arti tozzi e massicci. È un Golem Terrigeno d'alta quota, composto di granito scuro e ghiaccio compatto, attratto istintivamente dai minerali preziosi della vetta che difende con furia cieca. In uno spazio così angusto schivare i suoi colpi pesanti come frane richiede riflessi perfetti, e il freddo estremo rende la sua scorza di pietra ancora più dura da scalfire.",
        "fasi": [
            { "soglia": 75, "testo": "", "azioni": ["travolge"] },
            { "soglia": 50, "testo": "", "azioni": ["bersaglio_marcato"] },
            { "soglia": 25, "testo": "", "azioni": ["pelle_di_brina"] }
        ],
        "speciali": [
            { "quando": "inizio_round", "fai": "danni", "val": 1, "bersaglio": "casuale" }
        ]
    },
    "kranh_grodd_delle_vette": {
        "name": "Kranh-Grodd delle Vette",
        "hp": 13,
        "maxHp": 13,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Un ringhio gorgogliante e innaturale spezza il silenzio del passo. Da dietro un ammasso di rocce nere avanza barcollando un grosso Warg, ma il suo aspetto è ributtante: il corpo è scarno fino alle ossa, il pelo cade a chiazze rivelando ferite infette che colano un umore denso prima di congelarsi, e nelle sue iridi brilla un bagliore violaceo. È un Kranh-Grodd, una fiera corrotta dal morbo e fuggita fin sulle vette più isolate in preda a un tormento incessante. La malattia lo sta uccidendo lentamente, ma ha cancellato in lui ogni percezione del dolore o istinto di conservazione, rendendolo una furia cieca.",
        "speciali": [
            { "quando": "colpito", "fai": "veleno", "val": 1, "durata": 2, "prob": 35 },
            { "quando": "colpisce", "fai": "cura", "val": 1, "prob": 50 }
        ]
    },
    "muta_di_ghofuuri": {
        "name": "Muta di Ghofuuri",
        "hp": 15,
        "maxHp": 15,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Il sole sta ormai calando dietro le vette occidentali dei Picchi del Tramonto, gettando i canaloni in una penombra livida e gelida. Con il ritirarsi della luce, da una spaccatura profonda nella montagna esce allo scoperto un branco di Ghofuuri, grossi canidi neri dalle pupille rosse con il muso incrostato di sangue secco e ghiacciato. Queste bestie notturne aspettavano il buio per risalire verso l'altopiano sommitale a divorare gli scarti lasciati dal predatore della vetta; trovandovi sulla loro strada, vi circondano emettendo latrati gutturali e coordinati, pronti a sbranarvi nell'oscurità.",
        "speciali": [
            { "quando": "colpisce", "fai": "cura", "val": 1 },
            { "quando": "inizio_round", "fai": "malus", "val": 1, "bersaglio": "casuale", "durata": 2, "prob": 50 }
        ]
    },
    "spettro_dei_tumuli": {
        "name": "Spettro dei Tumuli",
        "hp": 14,
        "maxHp": 14,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Su una sella ventosa che precede l'altopiano finale sorgono i resti crollati di un antico tumulo di pietre a secco, eretto secoli fa da qualche spedizione perduta per seppellire un proprio campione. I massi della tomba sono stati recentemente ribaltati e sparsi nella neve da qualcuno che ha scavato fino alle ossa per divorarle. Dal fondo della camera funeraria profanata si innalza una densa manifestazione d'ombra: uno Spettro dei Tumuli, uno spirito antico e instancabile legato al proprio simulacro violato, che si scaglia contro di voi con tutta la furia del Margine.",
        "speciali": [
            { "quando": "colpito", "fai": "veleno", "val": 1, "durata": 2, "prob": 50 },
            { "quando": "colpisce", "fai": "cura", "val": 1, "se": "eroe_ferito" }
        ]
    },
    "mantombra_delle_spelonche": {
        "name": "Mantombra delle Spelonche",
        "hp": 23,
        "maxHp": 23,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Per superare uno sbarramento di ghiaccio vivo siete costretti a strisciare dentro una galleria di roccia nera che buca il fianco della cima. Appena entrati, la luce delle vostre lanterne sembra rimpicciolirsi e soffocare, come se il buio stesso della caverna la stesse assorbendo. Alzando lo sguardo verso le stalattiti di ghiaccio del soffitto, scorgete una massa nera e membranosa pronta a lasciarsi cadere sulle vostre teste: è una Mantombra, un Silfide Nècubro delle spelonche che punta ad avvinghiarvi il volto e il torace per soffocarvi e prosciugarvi nel buio assoluto.",
        "speciali": [
            { "quando": "colpito", "fai": "danni", "val": 1 },
            { "quando": "inizio_round", "fai": "infuria", "bersaglio": "casuale", "durata": 1 }
        ]
    },
    "coppia_di_ghoul_dell_ossario": {
        "name": "Coppia di Ghoul dell'Ossario",
        "hp": 15,
        "maxHp": 15,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Attirati dall'abbondanza di carcasse e ossa spaccate che il grande predatore della vetta lascia dietro di sé, alcuni Mangiaufi sono saliti fin su questo altopiano per banchettare con gli avanzi. Da dietro un cumulo di crani d'orso e costole di bue sbucano due Ghoul dalla pelle grigiastra e coriacea, con i denti marci incrostati di carne congelata. Più astuti delle normali bestie, hanno atteso che superaste il loro nascondiglio per tagliarvi la via di fuga e attaccarvi alle spalle con morsi feroci.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "cura", "val": 2 }
        ]
    },
    "aracnomantropo_delle_rovine": {
        "name": "Aracnomantropo delle Rovine",
        "hp": 20,
        "maxHp": 20,
        "att": 8,
        "dmg": 2,
        "ca": 8,
        "desc": "Il sentiero passa in mezzo ai ruderi crollati di una fortezza d'avvistamento antichissima, risalente ai tempi in cui i primi clan Vitghen tentarono invano di presidiare queste vette. Tra le mura di pietra nera mezze sepolte dal ghiaccio notate spessi fili biancastri misti a ossa ripulite. Dall'ombra di una torre sventrata balza giù con agilità spaventosa un Aracnomantropo: un abominio ibrido dotato di torso e intelletto umano su un corpo chitinoso da ragno, con una coda uncinata che stilla veleno paralizzante. Rifugge la luce diretta, ma sfrutta gli angoli ciechi delle macerie per saltare da un muro all'altro e colpirvi dall'alto con fredda astuzia.",
        "fasi": [
            { "soglia": 75, "testo": "", "azioni": ["contrattacco"] },
            { "soglia": 40, "testo": "", "azioni": ["sete_di_sangue"] }
        ],
        "speciali": [
            { "quando": "inizio_round", "fai": "spezza_armatura", "bersaglio": "casuale", "se": "sotto_meta", "prob": 25 }
        ]
    },
    "hungrabarn_dei_picchi": {
        "name": "Hungrabarn dei Picchi",
        "hp": 18,
        "maxHp": 18,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Scavalcate l'ultimo crinale di roccia e vi affacciate nella conca sommitale mentre gli ultimi raggi rossi del sole spariscono dietro le montagne. Il fetore di macello, grasso rancido e sangue vecchio è quasi insopportabile anche nel gelo estremo. Il fondo della depressione è un immenso ossario a cielo aperto: carcasse di cavalli, buoi interi trascinati fin quassù dalla valle, gabbie toraciche di orsi e decine di crani umani spaccati a metà tappezzano la neve calpestata. Dal fondo di una caverna bassa e larga sotto la vetta principale emerge chinandosi una figura che toglie il respiro. Non è un lupo, né uno spirito del vento: è un Hungrabarn, un esemplare relitto di una razza di giganti carnivori ritenuta estinta da generazioni, fuggito fin su queste vette inaccessibili dalle forre dell'Ugin.\n\nQuando si raddrizza in tutta la sua statura raggiunge i quindici piedi d'altezza, pesante e massiccio quanto un intero gregge di pecore. È avvolto in pelli di bue cucite rozzamente con tendini e filo di ferro rubato, la pelle grigiastra e callosa segnata da vecchie cicatrici di lance che non sono bastate a fermarlo; il volto umanoide è largo e brutale, con una mascella sproporzionata fatta per frantumare ossa e piccoli occhi infossati che vi fissano con una fame lucida e spietata. Nella mano destra stringe come una clava l'intero asse ferrato di un carro mercantile strappato ai viandanti del Krogg. Annusa l'aria gelida della sera, emette un grugnito profondo che fa vibrare la ghiaia sotto i vostri stivali e avanza per divorarvi. Ecco il vostro materiale da leggenda: riportate il suo teschio ad Aebeltoff e ogni Lungobarbo dovrà chinare il capo davanti al nome dei Dignitas.",
        "fasi": [
            { "soglia": 66, "testo": "", "azioni": ["contrattacco"] },
            { "soglia": 33, "testo": "", "azioni": ["contrattacco"] },
            { "soglia": 20, "testo": "", "azioni": ["ultimo_sangue"] }
        ],
        "speciali": [
            { "quando": "inizio_scontro", "fai": "malus", "val": 1, "durata": 2, "bersaglio": "tutti", "limite": "scontro", "volte": 1, "round": 1 }
        ]
    },
    "coppia_di_garriatori": {
        "name": "Coppia di Garriatori",
        "hp": 10,
        "maxHp": 10,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "L'aria rarefatta della quota estrema e la fatica della salita vi provocano un torpore improvviso, appesantendo le palpebre mentre attraversate una stretta gola d'ombra. Dalle fessure nella roccia sgusciano fuori due Garriatori, esseri scarni e rachitici grandi quanto bambini, abituati a vivere sulle vette più inaccessibili. Speravano che il mal di montagna vi facesse assopire nella neve per immobilizzarvi nel sonno e sgozzarvi; vedendo che siete ancora vigili, stridono furiosi nel vento e vi saltano addosso insieme, brandendo schegge di pietra affilata.",
        "speciali": [
            { "quando": "colpito", "fai": "veleno", "val": 1, "durata": 2, "bersaglio": "casuale" }
        ]
    },
    "rissa_ruga_cantinieri": {
        "name": "Rissaioli della Ruga dei Cantinieri",
        "image": "",
        "hp": 10,
        "maxHp": 10,
        "att": 6,
        "dmg": 1,
        "ca": 6,
        "desc": "Seguite la scia di Kesia fino al Barro Frescada, lungo la Ruga dei Cantinieri gremita di locande con le frasche esposte per il Kvass fresco. L'influsso della figlia di Fredlös ha trasformato i brindisi in una gigantesca rissa senza controllo: un gruppo di avventori e mercenari ubriachi di Kvass, galvanizzati dalla sua magia, vi sbarra la strada verso le porte cittadine brandendo sgabelli, boccali e lame.",
        "speciali": [
            { "quando": "colpito", "fai": "cura", "val": 1, "prob": 40 }
        ]
    },
    "marinai_barro_molare": {
        "name": "Marinai del Barro Molare",
        "image": "",
        "hp": 11,
        "maxHp": 11,
        "att": 6,
        "dmg": 1,
        "ca": 6,
        "desc": "L'inseguimento vi porta verso nord sulla Ruga Gelida del Barro Molare, affacciata sulle acque piene d'iceberg del Sund di Strela. Davanti al fondaco del Mandraccio, una ciurma di rudi marinai e scaricatori del porto, aizzati dal passaggio beffardo di Kesia, vi attacca sul selciato completamente ghiacciato.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "malus", "val": 1, "durata": 2, "bersaglio": "tutti" }
        ]
    },
    "warg_del_sira": {
        "name": "Warg del Sira",
        "image": "",
        "hp": 11,
        "maxHp": 11,
        "att": 8,
        "dmg": 1,
        "ca": 7,
        "desc": "Costeggiando le sponde del fiume Sira, teatro di innumerevoli conflitti passati, il silenzio della valle viene spezzato da ringhi feroci: un branco di Warg affamati, scesi dai pendii in cerca di bestiame negli allevamenti del Krogg, vi accerchia tra la brina.",
        "speciali": [
            { "quando": "inizio_round", "fai": "danni", "val": 1, "bersaglio": "piu_debole", "prob": 25 }
        ]
    },
    "razziatori_picchi_tramonto": {
        "name": "Razziatori dei Picchi del Tramonto",
        "image": "",
        "hp": 11,
        "maxHp": 11,
        "att": 8,
        "dmg": 1,
        "ca": 7,
        "desc": "Passando vicino a Enisov Alta, edificata sul dorso roccioso dei Picchi del Tramonto, incappate in una banda di predoni e sbandati che ha superato i valichi meridionali per saccheggiare i granai della valle.",
        "speciali": [
            { "quando": "colpisce", "fai": "ruba_scudi", "val": 3 }
        ]
    },
    "coppia_di_kreehorn": {
        "name": "Coppia di Kreehorn",
        "image": "",
        "hp": 14,
        "maxHp": 14,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Lungo un tratto sopraelevato e spazzato dal gelo, la magia caotica di Kesia ha innervosito una coppia di imponenti Kreehorn alti oltre tre metri. Di solito circospetti e incruenti, i Silfidi del Gelo abbassano i loro enormi palchi di corna di ghiaccio durissimo e vi caricano per difendere il sentiero.",
        "fasi": [
            { "soglia": 70, "testo": "Il maschio raspa la neve e abbassa le corna.", "azioni": ["carica"] },
            { "soglia": 35, "testo": "La femmina si unisce alla carica, furiosa.", "azioni": ["furore"] }
        ]
    },
    "fuorilegge_ponte_piotr": {
        "name": "Fuorilegge del Ponte di Piotr",
        "image": "",
        "hp": 12,
        "maxHp": 12,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Sulle arcate di pietra del Ponte di Piotr, avvolte dalla foschia del fiume, un gruppo di disertori e fuorilegge Vitghen presidia il passaggio per imporre pedaggi abusivi ai mercanti delle Trecittà. Appena tentate di attraversare, calano le picche e vi assalgono.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "casuale" }
        ]
    },
    "cenofori_slavine_krogg": {
        "name": "Cenofori delle Slavine del Krogg",
        "image": "immagini/bestiario/cenofori.webp",
        "hp": 12,
        "maxHp": 12,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Lasciata la valle pianeggiante, il sentiero costeggia dei pendii innevati precari. Dei grossi Cenofori delle Slavine hanno scavato il manto nevoso sopra di voi: al vostro passaggio fanno precipitare una coltre di neve per immobilizzarvi e mordervi nella tormenta.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "stordisci", "bersaglio": "casuale" }
        ]
    },
    "minatori_di_gerslev": {
        "name": "Minatori di Gerslev",
        "image": "",
        "hp": 12,
        "maxHp": 12,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "A Gerslev l'aria è sempre tesa, ma il passaggio di Kesia ha fatto traboccare il vaso: una fazione di minatori fedeli ai Traich di Ravndal e una fedele ai Seachtuir di Aebeltoff si stanno affrontando a colpi di piccone e ascia tra le strade del borgo, e vi trascinano a forza nella mischia.",
        "speciali": [
            { "quando": "colpisce", "fai": "spezza_armatura", "bersaglio": "eroe", "prob": 30 }
        ]
    },
    "golem_monti_scintillanti": {
        "name": "Golem dei Monti Scintillanti",
        "image": "",
        "hp": 12,
        "maxHp": 12,
        "att": 7,
        "dmg": 2,
        "ca": 9,
        "desc": "L'abbondanza di giacimenti d'oro, rame e gemme nei Monti Scintillanti ha attirato una coppia di massicci Golem Terrigeni. Svegliati dal frastuono provocato da Kesia, i colossi di roccia e minerale si ergono sul sentiero per schiacciarvi."
    },
    "predatore_dei_picchi": {
        "name": "Il Predatore dei Picchi",
        "image": "",
        "hp": 16,
        "maxHp": 16,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Tra le forre rocciose sotto la Faucebigia, una banda di feroci banditi a cavallo di enormi Warg sta scendendo dai crinali per razziare i sentieri isolati. Vedendovi soli nella neve, lanciano un urlo di guerra e caricano lungo il pendio.",
        "fasi": [
            { "soglia": 66, "testo": "Il capo della banda lancia l'urlo di guerra.", "azioni": ["grido_di_battaglia"] },
            { "soglia": 33, "testo": "I Warg fiutano il sangue del più debole.", "azioni": ["predatore"] }
        ]
    },
    "sentinelle_forte_antico": {
        "name": "Sentinelle del Forte Antico",
        "image": "",
        "hp": 12,
        "maxHp": 12,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Tra i bastioni semidiroccati e battuti dal vento di Granbarricata, delle ombre antiche si muovono tra le pietre: Spettri dei Tumuli e Ghoul del gelo, annidati nelle cripte dei vecchi difensori di Bohka, emergono dalle mura per sbarrarvi il passo.",
        "speciali": [
            { "quando": "colpito", "fai": "veleno", "val": 1, "durata": 2 }
        ]
    },
    "gropiceri_dei_crinali": {
        "name": "Gropiceri dei Crinali",
        "image": "",
        "hp": 12,
        "maxHp": 12,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Scendendo lungo i sentieri pietrosi verso il letto dell'Hemsil, il vento gelido porta un rumore fastidioso e acuto: un gruppo di Gropiceri (Rettiladre) visibili nel pieno della loro attività viene spaventato dal vostro arrivo e, affiancato da feroci Brachidani svegliati dal frastuono, vi attacca tra le rocce.",
        "speciali": [
            { "quando": "colpisce", "fai": "ruba_scudi", "val": 4 }
        ]
    },
    "troll_del_guado": {
        "name": "Il Troll del Guado",
        "image": "",
        "hp": 20,
        "maxHp": 20,
        "att": 8,
        "dmg": 3,
        "ca": 8,
        "desc": "Sotto una parete rocciosa che sovrasta una strettoia dell'Hemsil, un enorme e infido Troll delle nevi ha stabilito la propria tana colma di cianfrusaglie, ossa e ricchezze accumulate depredando i viandanti. Stuzzicato dal passaggio di Kesia, il mostro balza fuori dalla grotta pronto a rigenerare le proprie ferite e a vomitare bile acida su di voi.",
        "fasi": [
            { "soglia": 60, "testo": "Il Troll vomita un fiotto di bile acida.", "azioni": ["nube_tossica"] },
            { "soglia": 25, "testo": "Ferito a morte, il Troll ruggisce e si rialza.", "azioni": ["ultimo_sangue"] }
        ],
        "speciali": [
            { "quando": "inizio_round", "fai": "cura", "val": 1 }
        ]
    },
    "pattuglia_crinocorno": {
        "name": "Pattuglia di confine dei Crinocorno",
        "image": "",
        "hp": 13,
        "maxHp": 13,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Avvicinandovi al guado che porta verso le Brughiere del Lander, incrociate una pattuglia a cavallo del clan Traich di Ravndal. Visto il pessimo sangue che scorre tra Ravndal e chi proviene da Aebeltoff, i guerrieri Crinocorno non credono alla vostra storia su Kesia e vi caricano lance in resta.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "casuale" }
        ]
    },
    "campione_folle_di_kesia": {
        "name": "Il Campione Folle di Kesia",
        "image": "",
        "hp": 25,
        "maxHp": 25,
        "att": 8,
        "dmg": 3,
        "ca": 9,
        "desc": "Raggiungete il grande ponte fortificato che attraversa le acque gelide del fiume Hemsil, confine ultimo della Valle del Krogg. Sulla sponda opposta vedete Kesia, avvolta in un mantello dai colori sgargianti, che ride divertita seduta su un cippo di confine. Prima di correre via verso le sconfinate Brughiere del Lander e il Massiccio Semprebrina, la figlia di Fredlös schiocca le dita, sprigionando al massimo la sua magia galvanizzante sulla guarnigione del ponte e sulla natura circostante. A sbarrarvi il passo si erge un leggendario Capoguerra Vitghen posseduto dal Furore di Kesia, un colosso armato di un'enorme ascia in Ferro Stellare rubata e scortato dai suoi guerrieri e da feroci bestie da guerra, tutti resi totalmente immuni al dolore e accecati da un'euforia bellica incontrollabile che ha trasformato il presidio in un'arena mortale.\n\n\"Vediamo se sapete combattere bene quanto sapete raccontare storie, Dignitas!\" vi grida Kesia da lontano mentre sparisce nella steppa: per continuare l'inseguimento oltre l'Hemsil, dovrete sopravvivere alla sua festa di sangue.",
        "fasi": [
            { "soglia": 75, "testo": "Il Capoguerra solleva l'ascia in Ferro Stellare e la guarnigione urla con lui.", "azioni": ["grido_di_battaglia"] },
            { "soglia": 50, "testo": "L'ascia descrive archi enormi: nessuno è al sicuro accanto a lui.", "azioni": ["colpo_area"] },
            { "soglia": 25, "testo": "Il Furore di Kesia lo divora: ogni colpo è più forte del precedente.", "azioni": ["furia"] }
        ],
        "speciali": [
            { "quando": "colpisce", "fai": "danni", "val": 1, "bersaglio": "piu_debole", "prob": 30 }
        ]
    },
    "briganti_mulattiere": {
        "name": "Briganti delle Mulattiere",
        "image": "",
        "hp": 10,
        "maxHp": 10,
        "att": 6,
        "dmg": 1,
        "ca": 6,
        "desc": "Decidete di evitare la via principale per non dare nell'occhio, imboccando una vecchia mulattiera. Come vi aveva avvertito l'Eparca Marzio, le campagne sono ormai terra di nessuno: un gruppo di briganti e tagliagole emerge dalla boscaglia, armi in pugno, convinto che siate dei semplici mercanti da depredare. Non potete permettervi di mostrare i vostri sigilli per intimorirli né di lasciare superstiti che corrano a denunciare la presenza di guerrieri Dignitas sul suolo della Lega: dovete eliminarli rapidamente e in silenzio.\n",
        "speciali": [
            { "quando": "colpisce", "fai": "ruba_scudi", "val": 2 }
        ]
    },
    "ghofuuri_strada_concia": {
        "name": "Ghofuuri della Strada della Concia",
        "image": "",
        "hp": 10,
        "maxHp": 10,
        "att": 6,
        "dmg": 1,
        "ca": 6,
        "desc": "Usciti da Seistad verso nord-ovest, costeggiate il primo tratto della Strada della Concia prima del bivio fluviale, tenendovi ai margini della Selva Brezzaserena. L'odore acre delle pelli lavorate viene presto coperto dal fetore di carogna: un branco di Ghofuuri, enormi segugi neri dalle pupille rosse e dal muso incrostato di sangue secco, sta banchettando sui resti di un carro abbandonato e si volta ringhiando nella vostra direzione. \n",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "casuale" }
        ]
    },
    "warg_colline_ondulate": {
        "name": "Warg delle Colline Ondulate",
        "image": "",
        "hp": 11,
        "maxHp": 11,
        "att": 6,
        "dmg": 1,
        "ca": 7,
        "desc": "Vi addentrate tra le colline erbose lontano dalle rotte battute. Degli ululati agghiaccianti squarciano il cielo grigio: un branco di Warg, guidato da un massiccio maschio dominante dal pelo ispido, vi ha fiutati e scende in carica lungo il pendio per sbranarvi.",
        "speciali": [
            { "quando": "colpisce", "fai": "danni", "val": 1, "bersaglio": "piu_debole", "prob": 25 }
        ]
    },
    "disertori_avamposto_pianura": {
        "name": "Disertori dell'Avamposto",
        "image": "",
        "hp": 14,
        "maxHp": 14,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "La struttura era un piccolo Presidio delle Tratte nella pianura agricola tra Strahnbrad e l'ansa del Nederjin, ma invece delle guardie della Lega trovate una banda di disertori e mercenari che ha occupato il posto per riscuotere pedaggi abusivi. È una fortuna nella sfortuna: contro dei fuorilegge potete sguainare le lame senza causare un incidente diplomatico con Finngalk. \n",
        "speciali": [
            { "quando": "colpisce", "fai": "ruba_scudi", "val": 3 }
        ]
    },
    "burofonte_tremabosco": {
        "name": "Il Burofonte Tremabosco",
        "image": "",
        "hp": 29,
        "maxHp": 29,
        "att": 7,
        "dmg": 2,
        "ca": 7,
        "desc": "Tagliando per una fitta boscaglia che costeggia il fiume, commettete l'errore di sconfinare in un territorio marcato da alberi sradicati. Un enorme Tremabosco, massiccio come un orso e dotato di zanne ricurve grandi quanto spade, emette un grugnito furioso e vi carica a testa bassa per difendere il proprio branco. ",
        "fasi": [
            { "soglia": 60, "testo": "Il Tremabosco raspa il terreno e abbassa le zanne.", "azioni": ["carica"] },
            { "soglia": 30, "testo": "Ferito, il Burofonte diventa una furia.", "azioni": ["furore"] }
        ]
    },
    "sirenidi_ponti_neferu": {
        "name": "Sirenidi dei Ponti di Neferu",
        "image": "",
        "hp": 16,
        "maxHp": 16,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Avvicinandovi alla conca di Finngalk, la capitale della Lega protetta dall'imponente Cinta di Belor, decidete di fare una deviazione verso nord-est lungo il Nederjin per evitare le pattuglie della Gensarmia che sorvegliano le porte cittadine. Arrivate davanti a un ramo secondario dei Ponti di Neferu, i ponti sospesi in betulla bianca: attendete il calar della sera e imboccate una passerella laterale immersa nella foschia. Mentre siete a metà dell'attraversamento, dalle acque sottostanti e dalle travi superiori calano delle creature viscide: dei Sirenidi cercano di ammaliarvi e trascinarvi nel fiume, mentre una Mantombra di fiume tenta di avvilupparsi ai vostri stivali. \n",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "stordisci", "bersaglio": "casuale" },
            { "quando": "colpito", "fai": "infuria", "limite": "scontro", "volte": 3, "durata": 1 }
        ]
    },
    "ragno_nero_brumafosca": {
        "name": "Ragno Nero Imperiale di Brumafosca",
        "image": "",
        "hp": 17,
        "maxHp": 17,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": " Lasciata alle spalle Finngalk ed evitando la Via dell'Edera a nord, imboccate il Sentiero di Brumafosca, una pista nebbiosa che si addentra nel fitto del Bosco Zannantica. Il sentiero si stringe tra alberi contorti coperti da una sostanza biancastra e vischiosa. Sopra le vostre teste udite un sinistro ticchettio: un mastodontico Ragno Nero Imperiale, grande quanto un cerbiatto, si cala dalle fronde per intrappolarvi nella sua tela. \n",
        "speciali": [
            { "quando": "colpisce", "fai": "veleno", "val": 1, "durata": 2 }
        ]
    },
    "tremolischi_foschia": {
        "name": "Tremolischi nella Foschia",
        "image": "",
        "hp": 16,
        "maxHp": 16,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "La nebbia intorno a voi inizia a vorticare in modo innaturale, muovendosi persino controvento. Dal cuore del banco di foschia proviene un suono agghiacciante di denti che sbattono freneticamente: dei Tremolischi vi hanno circondati e si preparano ad assalirvi dal buio. ",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "malus", "val": 1, "durata": 2, "bersaglio": "tutti" }
        ]
    },
    "bestie_albero_impiccato": {
        "name": "Bestie dell'Albero dell'Impiccato",
        "image": "",
        "hp": 19,
        "maxHp": 19,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Nel cuore del Bosco Zannantica la vegetazione si apre improvvisamente nel punto in cui, secondo le leggende lyanti, cadde il sangue contaminato dell'ultimo drago: al centro del pianoro brumoso e desolato svetta un colossale sempreverde dal tronco contorto che ricorda un volto rugoso e ghignante. È un Arcanitradico: avvertendo la vostra intrusione, l'albero sprigiona la sua collera, aizzando contro di voi le bestie del sottobosco impazzite. \n",
        "speciali": [
            { "quando": "inizio_round", "fai": "danni", "val": 1, "bersaglio": "tutti", "prob": 20 }
        ]
    },
    "brachidani_rocce_assopite": {
        "name": "Brachidani delle Rocce Assopite",
        "image": "",
        "hp": 19,
        "maxHp": 19,
        "att": 7,
        "dmg": 1,
        "ca": 9,
        "desc": "Avanzate lungo un pendio roccioso dove grandi massi sembrano placidamente riposare al di sotto della pioggia. Quando vi passate accanto, le \"rocce\" si muovono, rivelando improvvisamente carapaci irti di aculei e code ossee: avete svegliato una coppia di Brachidani, che iniziano a rotolare verso di voi per travolgervi. ",
        "speciali": [
            { "quando": "colpito", "fai": "danni", "val": 1, "bersaglio": "eroe", "prob": 40 }
        ]
    },
    "aviano_moork_gola": {
        "name": "L'Aviano Moork della Gola",
        "image": "",
        "hp": 31,
        "maxHp": 31,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": " Il sentiero attraversa una gola fredda e cupa dove gli alberi formano una volta inaccessibile. Un senso di colpa opprimente e innaturale vi assale la mente, facendovi tremare le mani sulle armi: dalle fronde più alte plana con uno stridio acuto un Aviano Oscuro, pronto a dilaniarvi mentre la sua aura negativa tenta di spezzare la vostra volontà. L'aura nera della bestia scava proprio nelle vostre insicurezze più profonde, insinuando nella vostra mente la visione dei vostri corpi inceneriti nel tentativo disperato di afferrare l'Yrtite a mani nude, mentre Foscoclivo trionfa sulle vostre ceneri. ",
        "fasi": [
            { "soglia": 66, "testo": "L'aura del Moork si fa soffocante.", "azioni": ["terrore"] },
            { "soglia": 33, "testo": "L'Aviano punta chi vacilla di più.", "azioni": ["predatore"] }
        ],
        "speciali": [
            { "quando": "inizio_scontro", "fai": "malus", "val": 1, "durata": 2, "bersaglio": "tutti" }
        ]
    },
    "ghoul_tumulo_profanato": {
        "name": "Ghoul del Tumulo Profanato",
        "image": "",
        "hp": 19,
        "maxHp": 19,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Passando vicino al margine meridionale del Bosco Zannantica, non lontano dalle antiche rovine megalitiche di Surwich, costeggiate i resti di un luogo di sepoltura risalente alle guerre tra il Regno di Eòghar e i Kin di Foscoclivo. Dalle cripte mezze crollate emergono dei Ghoul, creature semi-senzienti dai denti marci, che avevano preparato delle trappole rudimentali lungo il sentiero per procurarsi carne fresca. ",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "casuale" }
        ]
    },
    "zerbene_sanguisuga": {
        "name": "Sciame di Zerbene Sanguisuga",
        "image": "",
        "hp": 19,
        "maxHp": 19,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Il terreno degrada in una palude arboricola piena di alberi secchi e carcasse d'animali. Un ronzio assordante preannuncia l'attacco di uno sciame di Zerbene Sanguisuga, insetti grandi e voraci che agiscono come un'unica mente per dissanguare ogni essere vivente nel loro territorio.",
        "speciali": [
            { "quando": "colpisce", "fai": "cura", "val": 1 },
            { "quando": "colpito", "fai": "veleno", "val": 1, "prob": 50, "limite": "scontro", "volte": 3, "durata": 0 }
        ]
    },
    "pattuglia_di_foscoclivo": {
        "name": "La Pattuglia di Foscoclivo",
        "image": "",
        "hp": 35,
        "maxHp": 35,
        "att": 8,
        "dmg": 2,
        "ca": 8,
        "desc": "Le visioni della Torre Spiavento non mentivano: non siete gli unici ad essere tornati a Loch Ein, e i vostri nemici sono qui da molto prima di voi. Lungo il crinale nebbioso che domina la riva, vi scontrate con un'avanguardia ben trincerata di Foscoclivo lasciata a presidiare il perimetro esterno. Tra il loro equipaggiamento notate resti di intelaiature metalliche e sigilli runici usati per scortare verso il lago un carico speciale: la conferma definitiva che gli uomini del Cenn dalle Lunghe Corna sono scesi negli abissi con un piano preciso per estrarre l'Yrtite. Qui, lontano dagli insediamenti della Lega, potete finalmente gettare via i mantelli di copertura e combattere da veri Dignitas. ",
        "fasi": [
            { "soglia": 66, "testo": "Il capo pattuglia chiama a raccolta i suoi.", "azioni": ["grido_di_battaglia"] },
            { "soglia": 33, "testo": "Gli esploratori attaccano insieme, da due lati.", "azioni": ["doppio_assalto"] }
        ]
    },
    "serpulidi_di_goli_ja": {
        "name": "Serpulidi di Goli'ja",
        "image": "",
        "hp": 25,
        "maxHp": 25,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Costeggiate una zona di acque basse e stagnanti dove la vegetazione acquatica cresce in modo anomalo. Dal fango emergono con agilità letale dei Serpulidi di Goli'ja, creature gregarie e sadiche dotate di code poderose e lunghi artigli capaci di lacerare le carni e causare profonde emorragie. \n",
        "speciali": [
            { "quando": "colpisce", "fai": "veleno", "val": 1, "durata": 2 }
        ]
    },
    "morrkath_della_riva": {
        "name": "Morrkath della Riva",
        "image": "",
        "hp": 22,
        "maxHp": 22,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Mentre cala l'oscurità sul lago, una coppia di Morrkath – esseri simili a grossi gatti corvini fatti di pura tenebra e dotati di tre paia di occhi luminosi come stelle – vi sbarra il passo sopra un masso muschioso, emettendo miagolii sinistri che insinuano il panico e la follia nelle vostre menti.\n",
        "speciali": [
            { "quando": "inizio_round", "fai": "malus", "val": 1, "durata": 1, "bersaglio": "tutti", "prob": 35 }
        ]
    },
    "aguglia_gigante_corrotta": {
        "name": "L'Aguglia Gigante Corrotta",
        "image": "",
        "hp": 52,
        "maxHp": 52,
        "att": 8,
        "dmg": 3,
        "ca": 9,
        "desc": "Prendete il largo sulle acque nere e silenziose di Loch Ein fino a raggiungere il punto esatto sopra l'arco di roccia sommerso, la porta d'accesso ai tunnel sotterranei e alla caverna con la sacca d'aria. Proprio mentre vi preparate a calare la campana subacquea rinforzata, le acque del lago iniziano a ribollire violentemente. L'energia infetta che si sta propagando dalle profondità di Loch Ein ha attirato e mutato il predatore alfa del lago: una colossale Aguglia Gigante Corrotta (lunga più di venti cubiti, con scaglie iridescenti dure come acciaio, zanne simili a coltelli e gli occhi iniettati del bagliore violaceo tipico delle creature corrotte) emerge con uno schianto dalle acque scure, avvinghiandosi attorno al varco sommerso. Per scendere nelle viscere della Caduta dai Cieli, dovrete prima tingere le acque del lago con il suo sangue. ",
        "fasi": [
            { "soglia": 70, "testo": "L'Aguglia sferza la barca con la coda.", "azioni": ["contrattacco"] },
            { "soglia": 45, "testo": "Il corpo immenso si avvolge attorno a voi.", "azioni": ["colpo_area"] },
            { "soglia": 20, "testo": "La corruzione la rende frenetica: morde due volte, ma si scopre.", "azioni": ["frenesia"] }
        ],
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "casuale" }
        ]
    },
    "mantombre_stalattiti": {
        "name": "Mantombre delle Stalattiti",
        "image": "",
        "hp": 8,
        "maxHp": 8,
        "att": 6,
        "dmg": 1,
        "ca": 6,
        "desc": "Superato il varco sommerso sul fondo del lago grazie alla campana subacquea e ai sacchi d'aria, riemergete nella grande caverna naturale che oltre un anno fa accolse la vostra prima spedizione. Avanzando tra le antiche mura sgretolate e le colonne spezzate, accendete le torce, ma la luce viene come risucchiata dal buio mentre un'ondata innaturale di nausea e panico vi stringe lo stomaco. Alzando lo sguardo verso la volta incrostata di stalattiti, scorgete delle Mantombre: i Silfidi Nècubri si lasciano cadere in silenzio sopra di voi, mirando ad avvinghiarvi la testa e metà del torso per soffocarvi e prosciugarvi dei fluidi vitali.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "stordisci", "bersaglio": "casuale" }
        ]
    },
    "golem_dei_giacimenti": {
        "name": "Golem dei Giacimenti",
        "image": "",
        "hp": 10,
        "maxHp": 10,
        "att": 6,
        "dmg": 1,
        "ca": 8,
        "desc": "Lasciata la riva interna, vi addentrate nel sistema di grotte che precede la città vera e propria, dove le pareti brillano debolmente di calcite, aragonite e depositi dorati di pirite. Notate subito che un tremore di fondo, lento ma costante, percorre la roccia viva. Il luccichio dei minerali non ha attirato solo il vostro sguardo: dal suolo si sollevano dei Golem Terrigeni dalla massa mista di argilla lacustre e roccia calcarea, nei cui torsi intravedete brillare Pietre dell'Aquila e cristalli grezzi. Resi irrequieti dalle vibrazioni anomale del sottosuolo, avanzano per schiacciare chiunque si avvicini ai filoni minerari che preservano irrazionalmente."
    },
    "stormo_della_spelonca": {
        "name": "Lo Stormo della Spelonca",
        "image": "",
        "hp": 9,
        "maxHp": 9,
        "att": 6,
        "dmg": 1,
        "ca": 7,
        "desc": "Percorrete una galleria laterale incrostata di calcite e aragonite che scende verso l'abisso di Loch Ein. Un improvviso fremito della terra fa staccare una cascata di polvere e detriti dal soffitto che soffoca la luce e il calore delle vostre torce — l'unica difesa naturale contro i Mangiaufi. Privati del bagliore protettivo, udite subito versi striduli e vibrazioni: uno stormo di pipistrelli vi piomba addosso dal buio, guidato da un Vespertilio Magno grande quanto un vitello, pronto a prosciugarvi della vostra matrice liquida prima di lasciare le carcasse al resto dello stormo.",
        "speciali": [
            { "quando": "colpisce", "fai": "cura", "val": 1 }
        ]
    },
    "mastini_bokgar_rovine": {
        "name": "Mastini di Bokgar delle Rovine",
        "image": "",
        "hp": 10,
        "maxHp": 10,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Vi addentrate nei primi vicoli lastricati che serpeggiano in pendenza tra case basse dai tetti a punta e dalle finestre a forma di stella. L'odore di ferro e putrefazione preannuncia un pericolo imminente: dalle abitazioni inclinate sbucano degli Huund mutati, identici per ferocia e deformità ai Mastini di Bokgar del Nord. Proprio come i Ghofuuri rimasti murati vivi nelle sale franate del Maniero di Bokgar, anche i Ghofuuri che infestavano le foreste attorno a Loch Ein e al vicino Frutteto delle Ossa sono rimasti intrappolati sottoterra durante il cataclisma del 178 d.F., mutando nell'oscurità delle rovine. Stavano divorando le carcasse fino all'osso di alcune creature abbattute pochi giorni fa dal passaggio di Foscoclivo e, vedendovi, si lanciano su di voi.",
        "speciali": [
            { "quando": "colpisce", "fai": "danni", "val": 1, "bersaglio": "piu_debole", "prob": 25 }
        ]
    },
    "sentinelle_cavalcantici": {
        "name": "Sentinelle dei Cavalcantici",
        "image": "",
        "hp": 11,
        "maxHp": 11,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Scendete con cautela lungo una strada obliqua fiancheggiata da case con finestre a forma di stella, quando il tintinnio di armature e il fruscio di mantelli contro la pietra vi fa immobilizzare. È una pattuglia di guerrieri semplici dei Cavalcantici, lasciata a sorvegliare le vie d'accesso. Prima di sguainare le lame, li sentite borbottare tra loro con timore reverenziale: dicono che \"gli Otto\" hanno ordinato di sbrigarsi prima che la sospensione di Loch Ein ceda del tutto. È il primo indizio che figure come Eldric o la defunta Morwenna non erano affatto i capi dell'ordine, ma semplici pedine di una gerarchia più alta. Appena vi scorgono, i soldati vi attaccano senza esitare."
    },
    "agente_ombra_anoeth": {
        "name": "L'Agente dell'Ombra",
        "image": "",
        "hp": 16,
        "maxHp": 16,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Dal Quartiere degli Oroscopi virate verso il settore orientale della città: Pandora rallenta il passo riconoscendo le sale in rovina e le statue di antiche figure dagli occhi vuoti dove, oltre due anni fa, lei e Aiace affrontarono con le loro alabarde Balinor e Morwenna. Passando sotto quegli sguardi di pietra, avverte una fitta di inquietudine e un senso di rigetto che non ricorda di aver mai provato in passato, chiedendosi turbata cosa le stia succedendo. Dalle ombre tra le colonne inclinate scatta in agguato un sicario di Foscoclivo. Sul suo mantello spicca una spilla d'argento a otto punte: prima di colpire, intima la vostra morte 'nel nome degli Aine e per volere degli Otto'. A quelle parole, i pezzi del mosaico si uniscono: ripensate a ciò che Morwenna disse ad Aiace prima di spirare — che persino il Cenn dalle Lunghe Corna era all'oscuro dei veri segreti di Loch Ein e non era che 'un burattino che danza nell'ombra'. Ora capite chi tira davvero i fili dietro i Cavalcantici: questo consiglio segreto di otto maestri.",
        "fasi": [
            { "soglia": 66, "testo": "L'assassino sparisce nell'ombra e sceglie la preda.", "azioni": ["predatore"] },
            { "soglia": 33, "testo": "Ferito, colpisce chi è già allo stremo.", "azioni": ["vendetta_sul_debole"] }
        ],
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "piu_debole" }
        ]
    },
    "ghoul_sangue_versato": {
        "name": "Ghoul del Sangue Versato",
        "image": "",
        "hp": 11,
        "maxHp": 11,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Avanzate nelle sale umide del settore est fino al punto in cui, oltre un anno fa, Aiace uccise la Cavalcantica Morwenna prima che Emrys ne trafugasse il cadavere portandolo ad Anoeth. Di quell'antico scontro restano solo tacche sulle pietre, ma l'acqua stagnante che oggi invade la stanza a causa del cedimento della volta ha attirato un gruppo di Ghoul famelici: stavano divorando i resti di un esploratore Kin rimasto ucciso da un crollo recente e, vedendovi, si scagliano contro di voi con le fauci spalancate.",
        "speciali": [
            { "quando": "colpisce", "fai": "cura", "val": 1 }
        ]
    },
    "gropiceri_degli_abissi": {
        "name": "Gropiceri degli Abissi",
        "image": "",
        "hp": 13,
        "maxHp": 13,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Lasciate le sale orientali percorrendo un viale lastricato in forte pendenza, dove l'acqua che filtra dal soffitto ha allagato le crepe del pavimento. All'improvviso, un tremolio nell'aria rivela due Gropiceri, grosse lucertole dal dorso iridescente e due paia di occhi color brace: spinte dalla loro avidità di Maliardi per gli oggetti scintillanti, tentano di strappare le fibbie d'argento e i gingilli dalle vostre cinture prima di svanire nuovamente nell'invisibilità. Quando reagite ferendone una, la bestia emette gli acutissimi stridii di allarme tipici della sua specie prima di volatilizzarsi lasciando cadere gemme grezze: quel richiamo assordante risveglia dalle crepe allagate un branco di feroci predatori delle caverne e Serpulidi che si gettano su di voi.",
        "speciali": [
            { "quando": "colpisce", "fai": "ruba_scudi", "val": 3 }
        ]
    },
    "spettro_tra_le_colonne": {
        "name": "Spettro tra le Colonne",
        "image": "",
        "hp": 13,
        "maxHp": 13,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Il vostro cammino vi conduce nel secondo grande distretto accademico di Loch Ein: il Quartiere dei Calcoli Matematici, dove gli antichi studiosi calcolavano le maree e le rotte navali. Qui l'acqua che cade dalla volta è ormai un ruscello costante e i contorni stessi degli edifici crollati sembrano sfocarsi per brevi istanti a causa dell'instabilità del limbo. Tra le colonne spezzate le ombre si animano: vi trovate faccia a faccia con uno Spettro dei Tumuli, una manifestazione d'ombra antica e instancabile legata alle rovine del Disastro. Ricordando l'impresa del Primarca Enea ad Hurnas Val, sapete che uno Spettro dei Tumuli non ha debolezze comuni e non può essere sconfitto se non individuando e distruggendo l'oggetto che funge da sua ancora terrena — in questo caso un antico astrolabio funebre incastrato tra le macerie alle sue spalle!",
        "speciali": [
            { "quando": "colpito", "fai": "veleno", "val": 1, "durata": 2 }
        ]
    },
    "necubri_inondazione": {
        "name": "Nècubri dell'Inondazione",
        "image": "",
        "hp": 13,
        "maxHp": 13,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Mentre marciate lungo la via principale del Quartiere dei Calcoli Matematici, un boato sordo risuona sopra le vostre teste: una sacca d'acqua trattenuta per oltre cinquant'anni dalla stasi temporale cede di colpo, riversando un'onda fredda lungo la strada inclinata. Trascinate dal flusso, delle Mantombre di lago nuotano sul fondale cercando di avviluppare i vostri piedi per trascinarvi giù, mentre a mezz'aria svolazzano dei Morrkath — gatti corvini fatti di tenebra concreta che sfuma verso le code, i cui sei occhi luminosi come stelle fissano le vostre menti per spingervi alla pazzia nel caos.",
        "speciali": [
            { "quando": "inizio_round", "fai": "malus", "val": 1, "durata": 1, "bersaglio": "tutti", "prob": 30 }
        ]
    },
    "aracnomantropi_gradinate": {
        "name": "Aracnomantropi delle Gradinate",
        "image": "",
        "hp": 13,
        "maxHp": 13,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Superato lo snodo centrale, attraversate un passaggio stretto nel settore ovest e vi trovate per la prima volta di fronte al vasto Anfiteatro in rovina di Loch Ein, descritto nei rapporti di Adone dopo il suo duello di oltre due anni fa con Lance. Dal soffitto semi-crollato filtra il caratteristico bagliore bluastro che fa brillare i frammenti di vetro colorato nelle mura, mentre le file di sedili in marmo scendono come una scala spezzata verso il fondo allagato. Mentre scendete lungo le gradinate in ombra, delle creature dall'intelletto umano e dal corpo di ragno – gli Aracnomantropi – calano silenziosamente dalle colonne inclinate: rifuggendo la luce diretta delle vostre torce che ne offusca la vista abituata al buio assoluto, cercano di aggirarvi nei coni d'ombra per paralizzarvi con il veleno delle loro code uncinate.",
        "speciali": [
            { "quando": "colpisce", "fai": "stordisci", "bersaglio": "eroe", "prob": 25 }
        ]
    },
    "predatori_acque_arena": {
        "name": "Predatori delle Acque dell'Arena",
        "image": "",
        "hp": 13,
        "maxHp": 13,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Per attraversare il grande Anfiteatro nel settore ovest di Loch Ein passate nella parte più bassa dell'arena, dove l'acqua che nella prima spedizione iniziava appena a filtrare dalle crepe ha ormai formato un bacino profondo e stagnante. Qui si annidano dei Serpulidi di Goli'ja — goffi sul marmo asciutto ma letali e rapidissimi nell'acqua ferma, capaci di infliggere ferite che sanguinano per giorni — insieme a mostruosi pesci corazzati d'aculei identici agli Acreozomi di Glostok, mutati dopo essersi nutriti dei cadaveri rimasti sommersi nel 178 d.F.",
        "speciali": [
            { "quando": "colpito", "fai": "danni", "val": 1, "bersaglio": "eroe", "prob": 35 }
        ]
    },
    "campione_di_foscoclivo": {
        "name": "Il Campione di Foscoclivo",
        "image": "",
        "hp": 24,
        "maxHp": 24,
        "att": 8,
        "dmg": 2,
        "ca": 9,
        "desc": "Lasciandovi alle spalle la conca dell'Anfiteatro per risalire verso il centro della città, vi sbarra la strada un veterano corazzato dei Cavalcantici, lasciato qui a presidiare il fianco occidentale dalla nuova spedizione di Foscoclivo. Piantato saldamente sul pavimento inclinato, batte la spada pesante sullo scudo: vi grida che né i Dignitas né il collasso stesso del limbo impediranno agli emissari de \"gli Otto\" di portare l'Yrtite ad Anoeth, confermandovi ancora una volta che i guerrieri come Lance ed Eldric non sono che il braccio armato di questi otto misteriosi maestri dell'ordine. Riconoscendo i vostri colori, aggiunge con disprezzo che non commetterà la debolezza di Lance, il quale due anni fa proprio in quest'arena risparmiò la vita a vostro cugino Adone ferito, cadendo in disgrazia agli occhi de gli Otto per il suo sciocco senso dell'onore.",
        "fasi": [
            { "soglia": 66, "testo": "Il Campione punta la spada contro il più forte di voi.", "azioni": ["duellante"] },
            { "soglia": 33, "testo": "Ferito nell'orgoglio, il veterano colpisce con rabbia.", "azioni": ["furore"] }
        ]
    },
    "tessitori_del_buio": {
        "name": "I Tessitori del Buio",
        "image": "",
        "hp": 18,
        "maxHp": 18,
        "att": 8,
        "dmg": 2,
        "ca": 8,
        "desc": "Risalite attraverso le vie strette del Quartiere delle Osservazioni Astronomiche mentre le torri piegate si spezzano una dopo l'altra. Stanati dal crollo dei propri nidi sulle guglie, dei Ragni Neri Imperiali e degli Aracnomantropi calano in massa dall'alto sbarrandovi il cammino.",
        "speciali": [
            { "quando": "colpisce", "fai": "ruba_scudi", "val": 3 }
        ]
    },
    "fiere_corrotte_abisso": {
        "name": "Fiere Corrotte dall'Abisso",
        "image": "",
        "hp": 18,
        "maxHp": 18,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Lasciato il quartiere astronomico, imboccate il grande viale in pendenza che converge verso la piazza centrale di Loch Ein. Qui percepite con orrore che qualcosa è profondamente cambiato rispetto alla vostra prima discesa: un'energia infetta si sta propagando dal cuore della città. Dal buio emergono creature cavernicole che mostrano gli stessi orribili sintomi dei Kranen generati dall'Exitium sulla Cicatrice – corpi scarni, ferite percolanti e iridi violacee – ma con una spaventosa differenza: mentre i Kranen del Nord vengono placati dal contatto con l'acqua, queste bestie avvelenate dalle radiazioni dell'Yrtite sguazzano nei rivoli delle rovine con furia inarrestabile e vi caricano senza alcun istinto di conservazione.",
        "speciali": [
            { "quando": "colpisce", "fai": "danni", "val": 1, "bersaglio": "eroe", "prob": 25 }
        ]
    },
    "ronda_della_piazza": {
        "name": "La Ronda della Piazza",
        "image": "",
        "hp": 16,
        "maxHp": 16,
        "att": 7,
        "dmg": 3,
        "ca": 8,
        "desc": "Entrate nella Grande Piazza Circolare inclinata, circondata da antichi palazzi decorati con mosaici del cielo stellato. La spianata che nella prima spedizione Alastorta, Pancrazio e Cassio avevano trovato deserta è ora presidiata da una ronda di Cavalcantici minori e segugi da guerra: portano sugli spallacci il simbolo a otto punte e parlano a voce alta del fatto che gli emissari dei Cavalcantici sono già scesi sotto il Palazzo, mentre a Eldric è stato lasciato il comando della retroguardia. Appena vi individuano, sfruttano la pendenza della piazza per caricarvi.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "casuale" }
        ]
    },
    "golem_cristallo_pirite": {
        "name": "Il Golem di Cristallo e Pirite",
        "image": "",
        "hp": 30,
        "maxHp": 30,
        "att": 8,
        "dmg": 4,
        "ca": 9,
        "desc": "Attraversata la piazza circolare, raggiungete il bordo monumentale superiore dove più di un anno fa Cassio si era fermato a esaminare le incisioni cittadine prima di salire al Palazzo. Qui le pulsazioni dell'Yrtite, ormai prossima a spezzare il proprio ciclo di sospensione, hanno fuso insieme i minerali della caverna e i mosaici crollati dando vita a un colossale Golem Terrigeno incrostato di pirite e cristalli luminescenti, che si erge a presidio della scalinata del Palazzo.",
        "fasi": [
            { "soglia": 60, "testo": "I cristalli si saldano sul corpo del Golem come una corazza.", "azioni": ["scudo_d_ossa"] },
            { "soglia": 30, "testo": "Il Golem abbatte i pugni sulla scalinata: le schegge volano ovunque.", "azioni": ["colpo_area"] }
        ]
    },
    "esuridi_acque_alte": {
        "name": "Esùridi delle Acque Alte",
        "image": "",
        "hp": 17,
        "maxHp": 17,
        "att": 7,
        "dmg": 3,
        "ca": 8,
        "desc": "Costeggiate il margine inferiore della Grande Piazza Circolare per aggirare le difese verso il Palazzo. Alastorta e Pancrazio notano subito la differenza rispetto alla prima spedizione: l'indebolirsi della bolla temporale ha lasciato entrare così tanta acqua dalla volta da sommergere completamente la parte bassa della piazza. Dalle acque torbide emergono degli Esùridi, antichi abitanti e guerrieri di Loch Ein risvegliati nelle rovine dall'energia infetta che permea la città.",
        "speciali": [
            { "quando": "inizio_round", "fai": "cura", "val": 1 }
        ]
    },
    "imboscata_sui_gradoni": {
        "name": "L'Imboscata sui Gradoni",
        "image": "",
        "hp": 17,
        "maxHp": 17,
        "att": 8,
        "dmg": 3,
        "ca": 8,
        "desc": "Salite lungo la scalinata monumentale che conduce al Palazzo dei Firmamentisti, proprio nel punto in cui oltre un anno fa Pancrazio salvò la vita ad Alastorta e a Cassio parando con lo scudo un masso scagliato dall'alto. La storia si ripete: dalle ombre sopra i gradoni vengono fatti rotolare pesanti blocchi di pietra per schiacciarvi, seguiti dall'assalto frontale di una squadra di Cavalcantici minori che combattono gridando che nessuno disturberà l'opera dei Cavalcantici nelle sale sottostanti.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "tutti" }
        ]
    },
    "ombre_della_cascata": {
        "name": "Le Ombre della Cascata",
        "image": "",
        "hp": 17,
        "maxHp": 17,
        "att": 8,
        "dmg": 3,
        "ca": 8,
        "desc": "Siete sul piazzale d'ingresso del Palazzo dei Firmamentisti, dove oltre un anno fa Pancrazio rimase indietro a combattere per permettere ad Alastorta e Cassio di entrare nell'edificio. Tra il fragore assordante della cascata che scende dalla volta incrinata e il bagliore dorato della pirite sulle pareti, l'assottigliarsi del ciclo temporale ha richiamato dal buio un branco di predatori d'ombra e Nefasti Esùridi, che emergono dal velo d'acqua per impedirvi di raggiungere il portico.",
        "speciali": [
            { "quando": "inizio_round", "fai": "malus", "val": 1, "durata": 1, "bersaglio": "tutti", "prob": 30 }
        ]
    },
    "eldric_dei_cavalcantici": {
        "name": "Eldric dei Cavalcantici",
        "nemesi": "pancrazio_dignitas",
        "sfxNemesi": "audio/nemici/eldric_nemesi_pancrazio.ogg",
        "image": "",
        "hp": 37,
        "maxHp": 37,
        "att": 8,
        "dmg": 3,
        "ca": 9,
        "desc": "Varcate il colonnato allagato per entrare nell'atrio di marmo del Palazzo dei Firmamentisti, puntando verso la grande porta di bronzo che Alastorta e Cassio attraversarono oltre un anno fa. Ma ad attendervi sulla soglia, illuminato dal bagliore dorato della pirite e circondato da una guardia scelta di Cavalcantici, si erge una figura imponente quanto una montagna: Eldric dei Cavalcantici. Sopravvissuto alla prima spedizione solo perché il crollo della colonna aveva intrappolato la gamba di Pancrazio un istante dopo la sua resa, il gigante corazzato porta sul volto una spessa cicatrice biancastra e mal saldata che gli deforma il naso e la mascella – il marchio indelebile del colpo di scudo inflittogli proprio da Pancrazio. Quando gli occhi di Eldric si posano su Pancrazio, su Alastorta e su Cassio, il suo volto si contorce in un ghigno feroce: \"Sapevo che avreste avuto la faccia tosta di tornare nella tua tomba, moccioso Dignitas!\" tuona Eldric puntando la lama dritta verso Pancrazio sopra il fragore della cascata e i fremiti della città morente. \"Laggiù gli altri stanno già aprendo la via per prendersi l'Yrtite prima che il ciclo eterno di questa città vada in frantumi, ma a me hanno concesso l'unico premio che ho chiesto per oltre un anno: restituirti il favore e spezzarti le ossa uno ad uno! Forza Roma\". Brandendo la sua colossale spada a due mani, Eldric, insieme alla sua guardia personale, si lancia alla carica con la sua squadra per regolare i conti col passato e sbarrarvi l'accesso alle profondità del Palazzo.",
        "fasi": [
            { "soglia": 75, "testo": "Eldric ruggisce e la guardia di Foscoclivo serra i ranghi.", "azioni": ["grido_di_battaglia"] },
            { "soglia": 50, "testo": "Eldric riconosce il più forte di voi e lo marca come preda.", "azioni": ["bersaglio_marcato"] },
            { "soglia": 25, "testo": "Sanguinante, Eldric si rialza con la furia di chi non ha più niente da perdere.", "azioni": ["ultimo_sangue"] }
        ],
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "piu_forte" }
        ]
    },
    "sciacalli_dell_argine": {
        "name": "Gli Sciacalli dell'Argine",
        "image": "",
        "hp": 12,
        "maxHp": 12,
        "att": 6,
        "dmg": 1,
        "ca": 6,
        "desc": "Non avete nemmeno il tempo di strizzare i mantelli zuppi d'acqua gelida che delle figure armate di coltelli e mazze compaiono dalla foschia fluviale. Sono disertori ed ex-soldati vitghen ridotti alla fame dopo la Guerra dei Quaranta Giorni, che battono le rive dell'Hemsil per sopravvivere; riconoscendo i colori della Famiglia Dignitas su guerrieri feriti, isolati e lontani da ogni avamposto, vedono l'occasione irripetibile di vendicare col sangue la sottomissione di Collifreddi e spogliare gli invasori dei loro averi.",
        "speciali": [
            { "quando": "colpisce", "fai": "ruba_scudi", "val": 2 }
        ]
    },
    "mastini_delle_gregge": {
        "name": "I Mastini delle Gregge",
        "image": "",
        "hp": 13,
        "maxHp": 13,
        "att": 7,
        "dmg": 1,
        "ca": 6,
        "desc": "Passando accanto a un'antica tenuta di confine, vi accorgete che Kesia ha spezzato i lucchetti dei serragli: una muta di feroci mastini da guerra, resi schiumanti di rabbia dal tocco della figlia di Fredlös, si lancia sulla vostra scia per sbranarvi.",
        "speciali": [
            { "quando": "inizio_round", "fai": "danni", "val": 1, "bersaglio": "piu_debole", "prob": 25 }
        ]
    },
    "bracconieri_del_lander": {
        "name": "I Bracconieri del Lander",
        "image": "",
        "hp": 13,
        "maxHp": 13,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Tra le pieghe ondulate della brughiera incappate nel bivacco nascosto di alcuni collaboratori esterni di una banda che si fa chiamare Banda della Lanterna, contrabbandieri e ribelli che trafficano armi per i clan ostili alla Famiglia. Riconoscendo immediatamente le vostre insegne, capiscono che se tornaste vivi a Rocca Tempesta fareste calare la spada sulle loro teste: imbracciano gli archi e vi attaccano per non lasciare testimoni.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "casuale" }
        ]
    },
    "il_senza_clan": {
        "name": "Il Senza Clan",
        "image": "",
        "hp": 15,
        "maxHp": 15,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Ai piedi della Roccia di Zamak, un gruppo ben armato di irriducibili veterani vitghen – divenuti volontariamente 'Senza Clan' dopo aver rifiutato di piegarsi ai Dignitas alla fine della guerra – ha allestito un presidio ribelle. Devoti a Fredlös l'Oppresso, hanno visto sua figlia Kesia fuggire davanti a voi: guidati da un comandante coperto di cicatrici, serrano i ranghi, pronti a morire pur di fermare la vostra caccia.",
        "fasi": [
            { "soglia": 66, "testo": "Il comandante coperto di cicatrici leva il grido di Fredlös e i veterani serrano i ranghi.", "azioni": ["grido_di_battaglia"] },
            { "soglia": 30, "testo": "Non hanno più niente da perdere: i Senza Clan si rialzano per un ultimo assalto.", "azioni": ["furore"] }
        ]
    },
    "orso_delle_brughiere": {
        "name": "L'Orso delle Brughiere",
        "image": "",
        "hp": 17,
        "maxHp": 17,
        "att": 7,
        "dmg": 2,
        "ca": 7,
        "desc": "Seguite una scia di bacche invernali lasciata da Kesia lungo il lato in ombra della Roccia di Zamak, ma la figlia di Fredlös vi ha guidati dritti in una trappola: costeggiando il lato in ombra della Roccia di Zamak, infatti, disturbate involontariamente un enorme orso bruno del Nord che stava divorando la carcassa di una renna tra i massi; l'animale si solleva sulle zampe posteriori con un ruggito e vi carica.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "malus", "val": 1, "durata": 1, "bersaglio": "tutti" }
        ]
    },
    "vedette_a_cavallo_di_ravndal": {
        "name": "Le Vedette a Cavallo di Ravndal",
        "image": "",
        "hp": 15,
        "maxHp": 15,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Una pattuglia di cavalieri Crinocorno del clan Traich vi intercetta mentre attraversate i loro pascoli di confine. Pochi minuti prima, passando a tutta velocità, Kesia ha dato l'allarme alle vedette raccontando che una banda di disertori e tagliagole aveva appena teso un'imboscata a una delegazione Dignitas sull'Hemsil, massacrandola e rubandone le vesti per infiltrarsi nelle terre di Ravndal. Vedendovi sbucare dalla brughiera coperti di fango, feriti e privi di scorta ufficiale, i cavalieri Traich vi scambiano per gli assassini dei loro alleati: prima che possiate mostrare i vostri sigilli o spiegare l'equivoco, abbassano le lance e vi caricano al galoppo per vendicare l'onore della Famiglia.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "piu_forte" }
        ]
    },
    "battuta_di_caccia_di_ravndal": {
        "name": "La Battuta di Caccia",
        "image": "",
        "hp": 15,
        "maxHp": 15,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Vi imbattete in un gruppo di giovani cacciatori dell'élite di Ravndal, accompagnati da coppie di lupi addestrati e falconi da preda. Vedendo dei guerrieri Dignitas allo stremo delle forze, e carichi di ardore giovanile, decidono di misurarsi con voi per dimostrare la superiorità dei Traich.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "stordisci", "bersaglio": "casuale" }
        ]
    },
    "guardiano_dei_gradoni": {
        "name": "Il Guardiano dei Gradoni",
        "image": "",
        "hp": 19,
        "maxHp": 19,
        "att": 8,
        "dmg": 2,
        "ca": 8,
        "desc": "A metà della salita verso il Colle Sovrano, un Campione dei clan vitghen e la sua guardia scelta presidiano l'antico sentiero lastricato. Per legge sacra di Vittenbergen, a nessuno è concesso salire in armi sul Colle Sovrano: vedendo dei Dignitas correre verso la cima con l'acciaio al fianco, e aizzati da Kesia che vi ha accusati di voler profanare il santuario, i guardiani sbarrano il passo pronti a far rispettare l'antico tabù con la propria vita.",
        "fasi": [
            { "soglia": 65, "testo": "La guardia scelta alza gli scudi: il sentiero lastricato diventa un muro.", "azioni": ["scudo_d_ossa"] },
            { "soglia": 35, "testo": "Il Campione sceglie il più forte di voi: il tabù si lava con il suo sangue.", "azioni": ["bersaglio_marcato"] }
        ]
    },
    "zeloti_del_colle": {
        "name": "Gli Zeloti del Colle",
        "image": "",
        "hp": 16,
        "maxHp": 16,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Scendendo lungo il versante settentrionale del Colle Sovrano, un gruppo di Vitghen tradizionalisti che ha assistito da lontano al vostro passaggio vi tende un'imboscata tra i pini, convinto che stiate inseguendo la figlia di Fredlös per scopi empi.",
        "speciali": [
            { "quando": "colpito", "fai": "cura", "val": 1, "prob": 35 }
        ]
    },
    "lupi_del_semprebrina": {
        "name": "Il Branco di Lupi del Semprebrina",
        "image": "",
        "hp": 16,
        "maxHp": 16,
        "att": 8,
        "dmg": 2,
        "ca": 7,
        "desc": "Nelle foreste silenziose che abbracciano la base del Massiccio Semprebrina, l'ululato di un grande branco di lupi grigi del Nord preannuncia l'attacco: spinti dalla fame, i predatori vi chiudono in una tenaglia tra gli alberi innevati.",
        "speciali": [
            { "quando": "inizio_round", "fai": "danni", "val": 1, "bersaglio": "piu_debole", "prob": 30 }
        ]
    },
    "contrabbandieri_del_fuoco_nero": {
        "name": "I Contrabbandieri del Fuoco Nero",
        "image": "",
        "hp": 16,
        "maxHp": 16,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Attorno alle pozze esterne di Fuocogelo, una banda di spietati contrabbandieri e fuorilegge sta raccogliendo la pece ardente in otri di terracotta per rivenderla come arma d'assedio. Appena vedono le insegne dei Dignitas, ed accorgendosi che sono impossibilitati a fuggire, vi scagliano addosso vasi di terracotta, per evitare di lasciare testimoni.",
        "speciali": [
            { "quando": "colpisce", "fai": "veleno", "val": 1, "durata": 2, "bersaglio": "eroe", "prob": 40 }
        ]
    },
    "branco_di_tremabosco": {
        "name": "Il Branco di Tremabosco",
        "image": "",
        "hp": 22,
        "maxHp": 22,
        "att": 8,
        "dmg": 2,
        "ca": 8,
        "desc": "Vi lanciate a capofitto giù per il pendio boscoso seguendo il suono di un corno da caccia suonato da Kesia per schernirvi; nella fretta di raggiungerla, non notate i segni territoriali lasciati sugli alberi e sconfinate nella tana di un branco di Tremabosco. Il maschio dominante e la matriarca, massicci come orsi bruni e armati di zanne ricurve, vi caricano a testa bassa con furia per difendere la cucciolata.",
        "fasi": [
            { "soglia": 65, "testo": "Il maschio dominante raspa il terreno e abbassa le zanne.", "azioni": ["carica"] },
            { "soglia": 30, "testo": "La matriarca si getta nella mischia per difendere la cucciolata.", "azioni": ["furore"] }
        ]
    },
    "cacciatori_di_taglie_del_val": {
        "name": "I Cacciatori di Taglie del Val",
        "image": "",
        "hp": 17,
        "maxHp": 17,
        "att": 8,
        "dmg": 2,
        "ca": 8,
        "desc": "All'imbocco delle piste pianeggianti, una compagnia di mercenari e cacciatori di taglie informata – probabilmente raggirati da Kesia stessa – dei disordini avvenuti tra Aebeltoff e Ravndal vi attende in agguato dietro una barricata di tronchi per catturarvi e riscuotere la leggendaria ricompensa che pende sulle vostre teste.",
        "speciali": [
            { "quando": "colpisce", "fai": "spezza_armatura", "bersaglio": "eroe", "prob": 30 }
        ]
    },
    "predoni_delle_piste": {
        "name": "I Predoni delle Piste",
        "image": "",
        "hp": 17,
        "maxHp": 17,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Lungo la via carovaniera che taglia la Piana del Val, una banda di guerrieri ribelli e disertori su slitte leggere e cavalli dal pelo folto vi accerchia in campo aperto. Kesia ha sparso tra i bivacchi della piana la voce che il vostro piccolo gruppo stia trasportando una reliquia dal valore inestimabile destinata a salvare la vita del Capofamiglia Dignitas: un bersaglio troppo ghiotto per lasciarvi arrivare vivi a Svalbard.",
        "speciali": [
            { "quando": "colpisce", "fai": "ruba_scudi", "val": 4 }
        ]
    },
    "presidio_di_svalbard": {
        "name": "Il Presidio di Svalbard",
        "image": "",
        "hp": 31,
        "maxHp": 31,
        "att": 8,
        "dmg": 2,
        "ca": 9,
        "desc": "Raggiungete la spianata davanti alle porte di Svalbard, certi di trovare un approdo sicuro presso gli Skallgrim, l'unico clan che ha affiancato la Famiglia Dignitas durante la Guerra dei Quaranta Giorni per puro disprezzo verso il volere degli Asi. Ma invece di vedervi aprire il passo, le pesanti grate calano con uno schianto e i corni d'allarme risuonano sui bastioni. In cima a una torretta esterna scorgete Kesia: la figlia di Fredlös ha fatto leva sull'unica, disperata ossessione che tormenta ogni singolo membro degli Skallgrim, ovvero la maledizione degli Asi che preclude alle loro anime l'accesso ai Giardini di Jag Àntar. Kesia ha rivelato alla guarnigione di guardia che voi Dignitas le state dando la caccia per apprendere come spezzare un antico patto, promettendo agli Skallgrim che, se le copriranno la fuga fermandovi alle porte, lei userà quello stesso segreto per spezzare la maledizione del loro clan e spalancare loro l'aldilà, accusandovi al contempo di voler stringere un nuovo accordo con gli Asi alle loro spalle. Prima che la notizia possa giungere alle orecchie dell'Aldermanno Egill della Sera o di Gun Cacciaserpi, sicuramente più diplomatici e legati alla Famiglia, il Campione della Guardia Skallgrim cede alla tentazione di salvare l'anima della propria gente. Scortato dai suoi veterani più fedeli, da balestrieri scelti e da feroci mastini da guerra corazzati, esce dal portale laterale per sbarrarvi il passo. Mentre Kesia vi saluta con un inchino beffardo e scivola via verso il fiume Driva e il Deserto del Kalle, siete costretti ad incrociare le armi e forzare il blocco del Campione Skallgrim per non finire massacrati sotto le mura di Svalbard.",
        "fasi": [
            { "soglia": 85, "testo": "I balestrieri scelti si schierano sui bastioni e il Campione leva il grido di guerra degli Skallgrim.", "azioni": ["grido_di_battaglia"] },
            { "soglia": 72, "testo": "Il Campione scioglie i mastini da guerra corazzati.", "azioni": ["furore"] },
            { "soglia": 25, "testo": "Per l'anima della sua gente: il Campione Skallgrim non arretra più di un passo.", "azioni": ["duellante"] }
        ],
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "casuale" }
        ]
    },
    "custodi_sala_circolare": {
        "name": "I Custodi della Biblioteca",
        "image": "",
        "hp": 14,
        "maxHp": 14,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Riemergete dal passaggio segreto nella Sala del Consiglio avvolta dal fumo e dall'acqua che scroscia dal soffitto. Tra gli scaffali che crollano, degli Spettri dei Tumuli e dei Morrkath dai sei occhi luminosi si avventano su di voi, cercando di seminarvi il panico nella mente proprio mentre dovete scortare Alastorta fuori dall'edificio.",
        "speciali": [
            { "quando": "colpito", "fai": "danni", "val": 1, "bersaglio": "eroe", "prob": 30 }
        ]
    },
    "divoratori_di_essenze": {
        "name": "I Divoratori di Essenze",
        "image": "",
        "hp": 11,
        "maxHp": 11,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Avanzando nei vestiboli gelidi che precedono la fascia del limbo, l'energia che trasuda dal corpo consumato di Alastorta attira come un faro dei Mangiaufi Essèderi e degli spettri affamati. Le creature cercano di spegnere le vostre torce per avventarsi sul Primarca privo di sensi e prosciugarne l'ultima scintilla vitale.",
        "speciali": [
            { "quando": "colpisce", "fai": "cura", "val": 1 }
        ]
    },
    "silfidi_eterei_del_limbo": {
        "name": "I Silfidi Eterei del Limbo",
        "image": "",
        "hp": 11,
        "maxHp": 11,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Risalendo la zona in cui il limbo si squarcia, la bruma sotterranea inizia a vorticare controcorrente. Dei Silfidi Eterei, spettri incorporei resi frenetici dalla morte della bolla temporale, vi avvolgono cercando di spezzare la lucidità dei cinque rimasti in piedi e farvi abbandonare Alastorta nel buio.",
        "speciali": [
            { "quando": "inizio_round", "fai": "malus", "val": 1, "durata": 1, "bersaglio": "tutti", "prob": 30 }
        ]
    },
    "guerrieri_senza_tempo": {
        "name": "I Guerrieri Senza Tempo",
        "image": "",
        "hp": 20,
        "maxHp": 20,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "La fine del ciclo del 178 d.F. scaraventa fuori dalle nebbie temporali gli antichi campioni Kin e Lyanti caduti mezzo secolo fa nel Salone delle Risposte. Intrappolati per l'ultima volta nella loro guerra, avanzano verso Temistocle e Cassio che sorreggono Alastorta privo di sensi: Pancrazio, ormai fuori di sé dalla rabbia per ogni istante perso laggiù, carica per primo urlando come una belva per travolgerli.",
        "fasi": [
            { "soglia": 66, "testo": "Gli echi della battaglia del 178 d.F. si fanno assordanti: i campioni senza tempo levano il loro grido di guerra.", "azioni": ["grido_di_battaglia"] },
            { "soglia": 33, "testo": "Bloccati nel loro ciclo eterno, i guerrieri combattono con la furia dell'ultimo giorno di Loch Ein.", "azioni": ["furore"] }
        ]
    },
    "progenie_corrotta_profondita": {
        "name": "La Progenie Corrotta delle Profondità",
        "image": "",
        "hp": 13,
        "maxHp": 13,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Mentre le acque scure invadono le camere dietro di voi, dalle fenditure della roccia scaturiscono in massa abomini Nefasti Sinèspesi ed Esùridi, deformati dal morbo violaceo e impazziti dal terrore dell'allagamento. Dovete falciarli prima che raggiungano la barella improvvisata su cui giace Alastorta.",
        "speciali": [
            { "quando": "colpisce", "fai": "veleno", "val": 1, "durata": 2, "bersaglio": "eroe", "prob": 35 }
        ]
    },
    "ombre_affamate": {
        "name": "Le Ombre Affamate",
        "image": "",
        "hp": 13,
        "maxHp": 13,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Lungo il corridoio saturato dall'infezione, l'oscurità converge con una volontà famelica dritta verso il frammento di Yrtite stretto sul petto di Alastorta incosciente. Creature di tenebra e Silfidi Nècubri risucchiano il calore delle torce inducendo nausea e panico mentre dovete fare quadrato attorno al Primarca.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "malus", "val": 1, "durata": 1, "bersaglio": "tutti" }
        ]
    },
    "rituale_di_anoeth": {
        "name": "Gli Ultimi Emissari degli Otto",
        "image": "",
        "hp": 21,
        "maxHp": 21,
        "att": 8,
        "dmg": 2,
        "ca": 8,
        "desc": "Proprio davanti al meccanismo d'uscita del passaggio segreto vi sbarra la strada una squadra scelta di emissari de \"gli Otto\", rimasta tagliata fuori dal crollo del Palazzo. Vedendo Alastorta privo di sensi ma ancora vivo con l'Yrtite addosso, decidono di sterminare voi cinque per impossessarsi del corpo del Primarca e usarlo come contenitore vivente fino alla superficie!",
        "fasi": [
            { "soglia": 66, "testo": "Gli emissari degli Otto puntano il più debole di voi: vogliono il corpo del Primarca come vaso vivente.", "azioni": ["predatore"] },
            { "soglia": 33, "testo": "Il rito di Anoeth si nutre del vostro sangue.", "azioni": ["sete_di_sangue"] }
        ],
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "piu_debole" }
        ]
    },
    "sentinelle_della_porta": {
        "name": "Le Sentinelle dei Bassorilievi",
        "image": "",
        "hp": 11,
        "maxHp": 11,
        "att": 6,
        "dmg": 1,
        "ca": 7,
        "desc": "Sbucate dal Salone delle Risposte nella camera davanti alla porta di pietra scolpita con le figure di Miska, Eòghar e Cenn Nimoe. Le scosse e l'energia dell'Yrtite che brucia sul petto di Alastorta svenuto hanno animato le statue di guardia dei Firmamentisti e attirato dei Nefasti Auracàri. Pancrazio ringhia serrando l'elsa fino a farsi sbiancare le nocche, pronto a fare a pezzi qualsiasi cosa rallenti la fuga di suo padre.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "casuale" }
        ]
    },
    "creature_del_cristallo": {
        "name": "Le Creature del Cristallo",
        "image": "",
        "hp": 11,
        "maxHp": 11,
        "att": 6,
        "dmg": 1,
        "ca": 6,
        "desc": "Appena oltre la porta dei bassorilievi, la perdita del nucleo di Yrtite fa impazzire le vene minerali delle pareti: frammenti di roccia cristallizzata e schegge d'energia prendono vita sotto forma di Silfidi erratici e costrutti luminosi che vi minacciano nel tratto più stretto della galleria.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "stordisci", "bersaglio": "casuale" }
        ]
    },
    "ombre_del_sigillo": {
        "name": "Le Ombre del Sigillo",
        "image": "",
        "hp": 10,
        "maxHp": 10,
        "att": 6,
        "dmg": 1,
        "ca": 7,
        "desc": "Appena il frammento di Yrtite è stato strappato al nucleo, Alastorta è crollato privo di sensi tra le braccia di Pancrazio, e la bolla di realtà alterata che dal 178 d.F. teneva sospesa Loch Ein si è spaccata con un boato apocalittico. Mentre Temistocle e Cassio si caricano sulle spalle il corpo inerme del Primarca — sul cui avambraccio le vene iniziano già a pulsare di un viola malato sotto le rune —, la rottura del sigillo libera gli Spettri dei Tumuli e le ombre rimaste prigioniere nel Salone delle Risposte. Vedendo suo padre svenuto e braccato, Pancrazio esplode in un ruggito di furia cieca e si getta in prima linea per aprirvi la strada verso la porta.",
        "speciali": [
            { "quando": "inizio_round", "fai": "malus", "val": 1, "durata": 1, "bersaglio": "tutti", "prob": 25 }
        ]
    },
    "superstiti_di_foscoclivo": {
        "name": "I Superstiti di Foscoclivo in Fuga",
        "image": "",
        "hp": 14,
        "maxHp": 14,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Sulle ultime rampe del passaggio segreto che riportano alla Biblioteca vi scontrate con un drappello di Cavalcantici superstiti in preda al panico per il crollo della città. Vedendo che state trascinando Alastorta svenuto con l'Yrtite, vi attaccano per aprirsi la fuga e rubarvi il cristallo. Alla vista delle loro insegne, la rabbia di Pancrazio esplode: urla contro i nemici che hanno ridotto così suo padre e si abbatte sui loro scudi."
    },
    "bestie_in_fuga_dall_abisso": {
        "name": "Le Bestie in Fuga",
        "image": "",
        "hp": 14,
        "maxHp": 14,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Uscendo dall'atrio semidistrutto del Palazzo dei Firmamentisti, venite travolti dalla fuga cieca delle bestie stanate dai sotterranei allagati: un branco di Aracnomantropi e Huund mutati (simili ai Mastini di Bokgar) vi assale tra le colonne per farsi strada verso i livelli superiori.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "tutti" }
        ]
    },
    "crollo_delle_colonne": {
        "name": "Il Crollo delle Colonne d'Ingresso",
        "image": "",
        "hp": 14,
        "maxHp": 14,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Attraversate l'atrio di marmo che si sgretola fino alla soglia esterna del Palazzo dei Firmamentisti, dove la cascata dalla volta è ormai diventata un diluvio assordante. Dalle macerie del colonnato emergono dei Golem Terrigeni impazziti per lo sconvolgimento tellurico che cercano di schiacciarvi.",
        "speciali": [
            { "quando": "colpito", "fai": "veleno", "val": 1, "durata": 2 }
        ]
    },
    "il_vendicatore": {
        "name": "Il Vendicatore della Retroguardia",
        "image": "",
        "hp": 24,
        "maxHp": 24,
        "att": 8,
        "dmg": 2,
        "ca": 9,
        "desc": "Sui gradoni sconvolti davanti al Palazzo, un comandante d'élite dei Cavalcantici di Foscoclivo ha radunato gli ultimi guerrieri rimasti vivi. Vedendo Alastorta privo di sensi con il bagliore dell'Yrtite che filtra dalle sue vesti, l'ufficiale ghigna con fanatismo: vuole farvi precipitare dalla scalinata nella piazza che sprofonda. A quella provocazione, Pancrazio perde ogni freno e si avventa sul comandante con una ferocia mai vista prima.",
        "fasi": [
            { "soglia": 66, "testo": "Il comandante urla ai suoi di non lasciarvi scampo: il suo fanatismo vi gela le mani.", "azioni": ["terrore"] },
            { "soglia": 33, "testo": "Ferito, il Vendicatore si avventa sul sangue che bagna i gradoni.", "azioni": ["sete_di_sangue"] }
        ],
        "speciali": [
            { "quando": "colpisce", "fai": "veleno", "val": 1, "durata": 2, "bersaglio": "eroe" }
        ]
    },
    "predatori_delle_acque": {
        "name": "I Predatori delle Acque",
        "image": "",
        "hp": 17,
        "maxHp": 17,
        "att": 7,
        "dmg": 2,
        "ca": 9,
        "desc": "Fuggendo attraverso i quartieri accademici che scivolano verso il baratro, vi ritrovate nei vicoli inclinati già invasi dalle acque del lago soprastante: Serpulidi di Goli'ja e Sirenidi nuotano tra le case sommerse a metà, cercando di afferrarvi le gambe e trascinarvi sul fondo."
    },
    "orda_dei_senza_pace": {
        "name": "L'Orda dei Senza Pace",
        "image": "",
        "hp": 17,
        "maxHp": 17,
        "att": 8,
        "dmg": 3,
        "ca": 8,
        "desc": "Il collasso di Loch Ein ha squarciato tutte le antiche cripte e le rovine sepolte dal 178 d.F.: un'orda di Ghoul e Spettri dei Tumuli emerge dalle macerie dei vicoli in un ultimo, folle assalto contro i vivi.",
        "speciali": [
            { "quando": "colpito", "fai": "danni", "val": 1, "bersaglio": "eroe", "prob": 35 }
        ]
    },
    "stormo_nel_panico": {
        "name": "Lo Stormo nel Panico",
        "image": "",
        "hp": 17,
        "maxHp": 17,
        "att": 8,
        "dmg": 3,
        "ca": 8,
        "desc": "Vedete finalmente in alto la fenditura rocciosa che riporta verso le grotte minerali e l'uscita della città, ma sulle ultime scalinate di marmo migliaia di pipistrelli e diversi Vespertili Magni assieme a Mantombre stanno fuggendo contemporaneamente verso il varco d'uscita delle caverne: nella strettoia delle scale si scagliano contro di voi in una nube cieca di ali, artigli e zanne.",
        "speciali": [
            { "quando": "inizio_round", "fai": "danni", "val": 1, "bersaglio": "casuale", "prob": 30 }
        ]
    },
    "abominio_della_voragine": {
        "name": "L'Abominio della Voragine",
        "image": "",
        "hp": 32,
        "maxHp": 32,
        "att": 8,
        "dmg": 4,
        "ca": 9,
        "desc": "Proprio mentre raggiungete la fenditura rocciosa in cima alle scalinate per lasciare la città caduta, dall'abisso in cui sta sprofondando Loch Ein si protende un gigantesco orrore tentacolare e corrotto – una fusione mostruosa di Nefasti e roccia animata dall'infezione residua – che tenta di sbarrarvi il passaggio sulla soglia d'uscita della città. Mentre i tentacoli cercano di strappare Alastorta incosciente dalle braccia di Cassio e Ofelia, Pancrazio scatena tutta la propria furia spezzandoli a colpi d'acciaio per aprirvi il varco verso le grotte.",
        "fasi": [
            { "soglia": 66, "testo": "I tentacoli dell'Abominio spazzano la soglia d'uscita.", "azioni": ["travolge"] },
            { "soglia": 33, "testo": "L'infezione residua rimargina la roccia viva dell'Abominio.", "azioni": ["rigenerazione"] }
        ]
    },
    "furia_dei_terrigeni": {
        "name": "La Furia dei Terrigeni",
        "image": "",
        "hp": 19,
        "maxHp": 19,
        "att": 8,
        "dmg": 4,
        "ca": 9,
        "desc": "Rientrati a fatica nelle grotte naturali di calcite e pirite che precedono il bacino d'immersione, scoprite che il collasso dei giacimenti minerari ha reso furiosi gli ultimi Golem Terrigeni e Brachidani della grotta, che rotolano e colpiscono all'impazzata nel tunnel in rovina. Dovete tenere Golem Terrigeni e Brachidani lontani da Alastorta mentre si avvertono i primi lamenti febbrili del Primarca che riprende conoscenza solo per un attimo tra le scosse."
    },
    "spettri_dell_acqua": {
        "name": "Gli Spettri dell'Acqua",
        "image": "",
        "hp": 18,
        "maxHp": 18,
        "att": 8,
        "dmg": 4,
        "ca": 8,
        "desc": "L'acqua gelida del lago sta invadendo i tunnel di collegamento a velocità impressionante: insieme ai flussi d'acqua arrivano delle ombre fameliche e dei predatori subacquei che vi assalgono nell'acqua alta fino alla cintola.",
        "speciali": [
            { "quando": "inizio_round", "fai": "malus", "val": 1, "durata": 1, "bersaglio": "tutti", "prob": 30 }
        ]
    },
    "ultima_guardia_del_cenn": {
        "name": "L'Ultima Guardia del Cenn",
        "image": "",
        "hp": 32,
        "maxHp": 32,
        "att": 8,
        "dmg": 4,
        "ca": 9,
        "desc": "Raggiungete la riva interna della caverna naturale proprio davanti al bacino d'acqua che conduce al tunnel sottomarino verso la superficie. Qui gli ultimi superstiti d'élite dei Cavalcantici di Foscoclivo vi attendono in formazione disperata per strapparvi l'Yrtite all'ultimo metro prima dell'immersione. Vedendo i nemici puntare dritti verso Alastorta inerme adagiato sulla roccia, Pancrazio si piazza davanti a suo padre con la furia di un leone, affiancato da Temistocle, Pandora, Cassio e Ofelia.",
        "fasi": [
            { "soglia": 70, "testo": "Gli ultimi Cavalcantici serrano la formazione con un grido disperato.", "azioni": ["grido_di_battaglia"] },
            { "soglia": 40, "testo": "Tutte le lame cercano il vostro portatore.", "azioni": ["bersaglio_marcato"] }
        ]
    },
    "ritorno_delle_mantombre": {
        "name": "Il Ritorno delle Mantombre",
        "image": "",
        "hp": 18,
        "maxHp": 18,
        "att": 8,
        "dmg": 4,
        "ca": 8,
        "desc": "Mentre vi avvicinate al pelo dell'acqua nella caverna che sta per allagarsi completamente, un gruppo di Mantombre di lago e Serpulidi emerge dal passaggio subacqueo per avviluppare i vostri piedi e trascinarvi sul fondale.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "stordisci", "bersaglio": "casuale" }
        ]
    },
    "emrys_e_l_entita_affamata": {
        "name": "Il Banchetto dell'Ombra e il Traditore di Anoeth",
        "image": "",
        "hp": 42,
        "maxHp": 42,
        "att": 8,
        "dmg": 5,
        "ca": 9,
        "desc": "State per immergervi nel passaggio sottomarino finale con Alastorta svenuto quando le acque e le ombre della caverna esplodono davanti a voi. A sbarrarvi l'unica via di salvezza mentre Loch Ein muore alle vostre spalle c'è Emrys dei Cavalcantici — il traditore che oltre due anni fa chiuse Alastorta e Cassio nella camera del sigillo — affiancato dal corpo rianimato e posseduto di Morwenna, avvolta da flussi di tenebra vivente e con gli occhi vitrei spalancati. Dalle labbra esangui della Cavalcantica caduta risuona quella voce profonda, rauca e antica che si era risvegliata ad Anoeth: \"Dignitas... portatori inconsapevoli... l'energia si propaga e il banchetto è finalmente pronto!\". Alla vista di Emrys che sorride fissando il corpo inerme e avvelenato di suo padre, Pancrazio esplode di una furia glaciale e incontenibile, piantandosi davanti ad Alastorta, mentre Ofelia, Cassio e Temistocle serrano i ranghi attorno al Primarca. Accanto a loro, Pandora fa un passo avanti stringendo l'alabarda con la lucida, amara certezza di chi ha appena compreso la propria nudità spirituale: non può più nascondersi dietro il nome di Arvale né sperare nella grazia di Asi che non le rispondono più per colpa delle sue stesse mancanze, proprio come Balinor le aveva fatto intuire tra queste stesse rovine. Senza alcuna voce divina alle proprie spalle, ma forte soltanto del proprio ferro e del legame con i propri cugini, si prepara a combattere al fianco di Pancrazio, Cassio, Ofelia e Temistocle contro Emrys e l'Incarnazione dell'Entità Affamata, in un ultimo scontro mortale per portare in salvo Alastorta e il segreto di Loch Ein fino alla superficie!",
        "fasi": [
            { "soglia": 75, "testo": "La voce antica dell'Entità risuona dalle labbra di Morwenna: il terrore vi stringe il cuore.", "azioni": ["terrore"] },
            { "soglia": 50, "testo": "L'Entità Affamata si nutre: il banchetto è cominciato.", "azioni": ["sete_di_sangue"] },
            { "soglia": 25, "testo": "Emrys e il corpo posseduto di Morwenna si gettano su di voi con l'ultima furia mentre la caverna crolla.", "azioni": ["ultimo_sangue"] }
        ],
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "tutti" }
        ]
    },
    "inseguitori_di_sangue_skallgrim": {
        "name": "Gli Inseguitori di Sangue Skallgrim",
        "image": "",
        "hp": 9,
        "maxHp": 9,
        "att": 6,
        "dmg": 1,
        "ca": 7,
        "desc": "Mentre seguite le impronte fresche lasciate da Kesia nella neve a nord di Svalbard, costeggiando la Selva delle Bianche Betulle verso il fiume Vorma, il galoppo di cavalli leggeri risuona alle vostre spalle. È una pattuglia del clan Skallgrim, l'unico clan che collaborò con i Dignitas nella presa di Svalbard durante la Guerra dei Quaranta Giorni per fare uno smacco agli Asi, i quali negano alle loro anime l'ingresso nei Giardini di Jag Àntar. Prima di fuggire, Kesia ha soffiato una polvere illusoria sugli occhi di questi soldati: accecati dalla malia, vi scambiano per spiriti maligni degli Asi venuti a rubare le anime dei loro caduti e vi caricano in preda al delirio. Aiace, nella sua visione pragmatica da Arconte garante della Virtù della Lealtà verso gli alleati, ed Enea pensano che la linea di condotta più giusta sia contenerne la furia e metterli fuori combattimento senza sterminarli, mentre Aurelio, da fervente Arvale di Draken, sente ribollire il proprio disprezzo verso chi rinnega gli Asi.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "casuale" }
        ]
    },
    "linci_scintillanti_del_vorma": {
        "name": "Le Linci Scintillanti del Vorma",
        "image": "",
        "hp": 10,
        "maxHp": 10,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Seguendo una scia di nastri colorati lasciati da Kesia tra le rocce innevate che costeggiano il Vorma, sconfinate nella tana selvatica di una coppia di Skimrad Gvista (Linci Scintillanti), gli enormi e magnifici felini bianchi come la neve tanto ambiti dalla nobiltà del Nord e celebrati nella fiaba di Zanna Bianca. Aizzate e rese furiose dal passaggio caotico della figlia di Fredlös vicino ai loro cuccioli, le due fiere balzano giù dagli speroni di roccia per difendere la nidiata.",
        "speciali": [
            { "quando": "colpisce", "fai": "danni", "val": 1, "bersaglio": "piu_debole", "prob": 25 }
        ]
    },
    "cacciatori_skalatt": {
        "name": "La Preda dei Cacciatori Skalatt",
        "image": "",
        "hp": 10,
        "maxHp": 10,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Superato il Vorma e piegando a est dove la pista si immette sul grande Cammino di Piotr, incrociate una spedizione di Cacciatori Skalatt, i discendenti delle antiche stirpi del Nord celebri per dare la caccia ai Gropiceri – le rare lucertole magiche dal dorso iridescente che ingoiano oro e gioielli e svaniscono in un tremolio se spaventate. Passando in corsa pochi istanti prima di voi, Kesia ha fatto esplodere una scintilla accanto a un Gropicero che gli Skalatt stavano tallonando da giorni, facendolo volatilizzare nel nulla, e ha poi infuso nei cacciatori la sua magia dell'ira. Accecati da una furia innaturale e convinti che siate stati voi a far scappare la loro preda inestimabile, gli Skalatt vi attaccano. Aiace ed Enea pensano che, trattandosi di sudditi del Nord sotto l'effetto di una malia, sia doveroso piegarli con la forza senza però infierire mortalmente su di loro.",
        "speciali": [
            { "quando": "colpisce", "fai": "ruba_scudi", "val": 2 }
        ]
    },
    "esuli_krati": {
        "name": "La Vendetta degli Esuli Kràti",
        "image": "",
        "hp": 12,
        "maxHp": 12,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Procedendo verso est lungo il Cammino di Piotr, nella distesa ventosa a sud del villaggio di Milkavala — noto per non aver mai subito un'incursione grazie alla fiamma perennemente accesa dedicata ad Allmän — e sotto la mole della Faucebigia, dalla nebbia emergono figure che vi lasciano interdetti: guerrieri silenziosi avvolti in armature arcaiche che recano gli antichi simboli dei Kràti. Eppure i Kràti superstiti furono assimilati generazioni fa dai Vitghen di Kallekot, dopo che il loro campione Ekil dei Kràti si recise da solo la testa e fu sepolto dagli Hammergradiani nel tumulo di Hurnas Val. Enea, che anni fa scese proprio ad Hurnas Val per distruggere il simulacro dello Spettro dei Tumuli, ed Aurelio pensano che queste figure dagli occhi vitrei che non respirano nel gelo non possano essere semplici mortali, ma spiriti rimasti bloccati nel Margine o echi di guerra strappati al passato da Kesia per mettere alla prova proprio il conquistatore di Hurnas Val.",
        "fasi": [
            { "soglia": 66, "testo": "I guerrieri dagli occhi vitrei battono le asce arcaiche in un grido senza fiato.", "azioni": ["grido_di_battaglia"] },
            { "soglia": 30, "testo": "Gli echi dei Kràti combattono come se la guerra non fosse mai finita.", "azioni": ["furore"] }
        ]
    },
    "mastini_di_bokgar_fenditure": {
        "name": "I Mastini di Bokgar delle Fenditure",
        "image": "",
        "hp": 10,
        "maxHp": 10,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Lungo una spaccatura rocciosa che costeggia il Cammino di Piotr a est di Milkavala, le scosse telluriche del Nord hanno spinto fin quassù un branco di Mastini di Bokgar, gli Huund mutati nell'oscurità e avvistati sempre più a nord dopo i terremoti di Frostgard. Attirate in superficie dalla scia di potere lasciata da Kesia e affamate di carne, le mostruose bestie alte quasi due metri vi assalgono balzando fuori dalle fenditure della roccia."
    },
    "aviano_moork_della_forra": {
        "name": "L'Ombra dell'Aviano Moork",
        "image": "",
        "hp": 11,
        "maxHp": 11,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "La traccia di Kesia vi porta in una forra gelida e cupa che digrada verso il fiume Driva, dove il vento sibila come nei versi de Il Riposo della Signora delle Ali, la tragica ballata di Collifreddi che narra della donna tradita che mescolò il proprio sangue a quello dei suoi uccelli per far sbranare l'amato prima di gettarsi dalle montagne. Dall'alto delle pareti rocciose plana su di voi un Aviano Moork, ultimo superstite di una razza antica ormai decaduta a Mangiaufo Essèdero: mentre la bestia vi attacca, la sua aura negativa schiaccia il cuore di Zeno, Aurelio ed Enea con un opprimente senso di colpa, sussurrando nelle vostre menti che fallirete e che la rovina di Lenora sarà solo colpa vostra.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "malus", "val": 1, "durata": 1, "bersaglio": "tutti" }
        ]
    },
    "milizia_fluviale_urszebya": {
        "name": "La Milizia Fluviale di Urszebya",
        "image": "",
        "hp": 11,
        "maxHp": 11,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Passando lungo gli argini occidentali del Driva, incrociate un posto di guardia salito dal vicino villaggio di Urszebya, l'insediamento devoto a Hvid il Bianco celebre per le alte rocce aguzze che la leggenda afferma essere gli artigli del Bianco rimasti conficcati nella terra prima di sprofondare nel Ghiacceterno. I soldati sono sudditi fedeli all'ordine del Nord, ma a terra notate l'otre vuoto del vino speziato che Kesia aveva acquistato sul Vorma: drogati dalla magia caotica della figlia di Fredlös, gli arcieri e i lancieri vedono al vostro posto dei mostri usciti dal fiume e vi attaccano in preda al panico. Aiace, conscio dei propri doveri di Arconte verso i cittadini del Nord, e Zeno pensano che la linea di condotta più giusta sia disarmarli e stordirli col piatto delle lame senza macchiarsi del sangue di guardie innocenti.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "piu_forte" }
        ]
    },
    "erchito_risvegliato": {
        "name": "L'Erchito Risvegliato",
        "image": "",
        "hp": 14,
        "maxHp": 14,
        "att": 8,
        "dmg": 2,
        "ca": 8,
        "desc": "Lungo l'ultimo tratto che conduce all'imbocco del Ponte di Porunn sul fiume Driva, la terra trema sotto gli zoccoli di un Nefasto Auracàro uscito dalle fiabe più oscure di Vittenbergen: un Erchito, un uomo condannato dalla giustizia ultraterrena per grevi colpe impunite e trasformato in uno yak mastodontico privo di pelo, sulle cui enormi corna ardono due fiammelle maledette. Svegliato dal suo vagabondaggio solitario dallo schiocco di dita di Kesia, il colosso muggisce tre volte – presagio di morte imminente – e vi carica davanti all'accesso del ponte: sapete che per spezzare il suo anatema dovrete tranciare di netto le sue corna o spegnere le due fiammelle ardenti.",
        "fasi": [
            { "soglia": 65, "testo": "L'Erchito muggisce tre volte: le fiammelle sulle corna ardono più alte.", "azioni": ["corazza_di_pietra"] },
            { "soglia": 30, "testo": "Il colosso carica a testa bassa, accecato dall'anatema.", "azioni": ["furore"] }
        ]
    },
    "predoni_delle_lande_del_kalle": {
        "name": "I Predoni delle Lande del Kalle",
        "image": "",
        "hp": 11,
        "maxHp": 11,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Appena lasciate la sponda orientale del fiume Driva — che divide geograficamente e politicamente le Brughiere del Lander dal Deserto del Kalle, la distesa che non conosce mai l'estate —, una banda di predoni ed esuli sbandati del deserto di neve vi piomba addosso. Aizzati da Kesia, che ha promesso i vostri Scudi d'oro e le vostre armi forgiate a Zefiro a chiunque riesca a fermarvi oltre il Ponte di Porunn, brandiscono le lame tra le dune bianche per sbarrarvi la strada.",
        "speciali": [
            { "quando": "colpisce", "fai": "ruba_scudi", "val": 3 }
        ]
    },
    "cercatori_di_saghe": {
        "name": "I Cercatori di Saghe di Fredlös l'Oppresso",
        "image": "",
        "hp": 11,
        "maxHp": 11,
        "att": 7,
        "dmg": 2,
        "ca": 7,
        "desc": "Lungo la salita glaciale vi attende un drappello di guerrieri e scaldi erranti votati al culto di Fredlös l'Oppresso, il padre di Kesia. Non vi sbarrano la strada per ribellarsi all'autorità della Famiglia Dignitas, né intendono uccidervi — poiché il credo di Fredlös abiura l'omicidio —, ma vogliono onorare il dogma del Campione Ridente secondo cui nulla vale la pena di essere ottenuto se non viene conquistato con stile e audacia in un'impresa degna delle saghe. Battono le armi sugli scudi ridendo nel vento del Kalle e vi sfidano a un duello d'onore per testare se siete davvero all'altezza del favore di Kesia.",
        "speciali": [
            { "quando": "colpito", "fai": "danni", "val": 1, "bersaglio": "eroe", "prob": 30 }
        ]
    },
    "orme_impossibili_dei_krati": {
        "name": "Le Orme Impossibili dei Kràti",
        "image": "",
        "hp": 12,
        "maxHp": 12,
        "att": 8,
        "dmg": 2,
        "ca": 8,
        "desc": "Là dove il Cammino di Piotr piega verso nord-est costeggiando il Ghiacceterno prima di Kallekot, venite assaliti da una seconda pattuglia armata di arpioni d'osso e asce arcaiche dei Kràti. Più vi avvicinate alla Bocca del Bianco, più la domanda si fa inquietante nelle menti di Enea e Aiace: i veri discendenti dei Kràti che fondarono Kallekot sono stati assimilati da secoli dai Vitghen e dal clan Drummond; perché allora continuate a imbattervi in guerrieri vestiti come ai tempi dello Jarl Ekil lungo la scia di Kesia? Quando le vostre lame colpiscono le loro armature, il suono sembra ovattato e irreale, come se il velo tra il Margine e il mondo terreno si stesse assottigliando.",
        "speciali": [
            { "quando": "inizio_round", "fai": "malus", "val": 1, "durata": 1, "bersaglio": "tutti", "prob": 30 }
        ]
    },
    "campione_della_stirpe_di_ekil": {
        "name": "Il Campione della Stirpe di Ekil",
        "image": "",
        "hp": 17,
        "maxHp": 17,
        "att": 8,
        "dmg": 2,
        "ca": 8,
        "desc": "Alle porte di Kallekot — la misteriosa città che sopravvive al limitare del Ghiacceterno grazie ai caldi e prorompenti geyser che eruttano dal terreno, rimasta formalmente indipendente sotto lo Jarl Jorulf il Bue del clan Drummond ma legata da protettorato alla Famiglia Dignitas — termina finalmente il Cammino di Piotr. Per non violare la sovranità dei Drummond evitate di entrare in armi nel centro cittadino, ma sul passo esterno che porta al Ghiacceterno vi sbarra la strada un imponente signore della guerra coperto di pelli bianche che brandisce un'arma identica a quelle dello Jarl Ekil, l'antico re dei Kràti sepolto ad Hurnas Val. L'uomo fissa dritto negli occhi Enea, il profanatore del tumulo di Hurnas Val, pronunciando parole in una lingua morta da generazioni: che sia un custode ancestrale rimasto nell'ombra o una proiezione generata da Kesia per mettere alla prova il Primarca del Nord, i suoi colpi sono letali e molto, molto reali.",
        "fasi": [
            { "soglia": 66, "testo": "Il signore della guerra punta l'arma di Ekil contro il più forte di voi.", "azioni": ["duellante"] },
            { "soglia": 33, "testo": "I colpi del campione si fanno ancora più pesanti.", "azioni": ["furore"] }
        ]
    },
    "fiere_del_gelo_e_fuochi_di_kesia": {
        "name": "Le Fiere del Gelo e i Fuochi di Kesia",
        "image": "",
        "hp": 12,
        "maxHp": 12,
        "att": 8,
        "dmg": 2,
        "ca": 8,
        "desc": "Mentre superate il perimetro esterno di Kallekot per lanciarvi sulle distese del Ghiacceterno verso la Bocca del Bianco, Kesia evoca a distanza uno sciame di Fuochi Fatui che danzano ad intermittenza nel vento per confondere le vostre coordinate, attirando al contempo su di voi un branco affamato di predatori delle nevi che vi assale sfruttando il bagliore accecante.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "malus", "val": 1, "durata": 1, "bersaglio": "tutti" }
        ]
    },
    "guardia_d_onore_di_kesia": {
        "name": "La Guardia d'Onore della Figlia di Fredlös",
        "image": "",
        "hp": 13,
        "maxHp": 13,
        "att": 8,
        "dmg": 2,
        "ca": 8,
        "desc": "Sull'ultima spianata prima della Bocca del Bianco, una schiera di formidabili guerrieri provenienti da Aebeltoff, Ravndal e Svalbard vi attende schierata davanti al baratro. Non si tratta di ribelli contro il dominio del Leone, ma dei più ardenti campioni e cercatori di gloria di Collifreddi che Kesia ha richiamato a sé lungo tutto il suo viaggio, promettendo loro l'immortalità nei canti dei bardi e nei Misteri di Fredlös se fossero riusciti a incrociare le lame con il Primarca Enea e i figli di Lenora sulla soglia del Ghiacceterno. Galvanizzati dal potere diretto della figlia di Fredlös, sollevano le armi per contendervi la gloria dell'ultimo passo.",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1, "bersaglio": "casuale" }
        ]
    },
    "kesia_ultima_prova": {
        "name": "L'Ultima Prova di Kesia",
        "image": "",
        "hp": 24,
        "maxHp": 24,
        "att": 8,
        "dmg": 2,
        "ca": 9,
        "desc": "Raggiungete finalmente il ciglio vertiginoso della Bocca del Bianco, l'immensa voragine ancestrale spalancata nel cuore del Ghiacceterno da cui salgono le urla dell’Asi ferito da Yr. Qui non c'è più alcuna terra verso cui fuggire: Kesia, la figlia di Fredlös l'Oppresso, vi attende in piedi sull'orlo dell'abisso, con il mantello sgargiante che schiocca nel vento gelido e gli occhi accesi di un'euforia selvaggia. Il suo sguardo scorre su Zeno e Aurelio, i figli giunti fin qui per salvare la propria madre, su Aiace, garante della legge del Leone, e infine su Enea, il Primarca e fratello stesso di Lenora. \"Siete arrivati fino alla fine del mondo per il vostro Capofamiglia, Dignitas!\" esclama Kesia con una risata che sovrasta l'ululato della voragine. \"Ad Aebeltoff mi avete dato una storia a parole, ma qui sulla Bocca del Bianco, dove ogni giuramento pesa quanto il sangue, un patto antico non si spezza con le chiacchiere: si spezza dimostrando che il vostro cuore brucia più forte del destino e del gelo!\". Decisa a verificare di persona se siete davvero degni della rivelazione che cercate, Kesia scatena l'intera potenza del furore di Fredlös: affiancata dai suoi ultimi e più letali Campioni del Nord e avvolta da un turbine di scintille ardenti e venti glaciali, scende in campo in prima persona sull'orlo dell'abisso. Per strapparle il segreto che libererà Lenora Dignitas dal patto, dovrete piegare la figlia di Fredlös nel duello più epico che le saghe del Nord abbiano mai cantato.",
        "fasi": [
            { "soglia": 80, "testo": "Kesia ride nel vento e i suoi Campioni del Nord levano le armi.", "azioni": ["grido_di_battaglia"] },
            { "soglia": 55, "testo": "Un turbine di scintille e venti glaciali: nessuno sa dove colpirà Kesia.", "azioni": ["imprevedibile"] },
            { "soglia": 25, "testo": "Sull'orlo dell'abisso Kesia scatena tutto il furore di Fredlös.", "azioni": ["ultimo_sangue"] }
        ],
        "speciali": [
            { "quando": "inizio_round", "fai": "danni", "val": 1, "bersaglio": "casuale", "prob": 30 }
        ]
    },
    "colosso_di_macerie": {
        "name": "Il Colosso di Macerie",
        "image": "",
        "hp": 26,
        "maxHp": 26,
        "att": 8,
        "dmg": 2,
        "ca": 9,
        "desc": "Scendendo la scalinata monumentale che collega il Palazzo alla Grande Piazza Circolare, le ultime ondate d'energia liberate dall'Yrtite fondono i detriti della scalinata e i cristalli della volta in un gigantesco guardiano di pietra viva e luce malata, deciso a impedirvi di portare il cuore di Loch Ein oltre i confini del Palazzo.",
        "fasi": [
            { "soglia": 60, "testo": "Le macerie si saldano attorno al colosso come una corazza di pietra viva.", "azioni": ["corazza_di_pietra"] },
            { "soglia": 30, "testo": "Il colosso si spacca e scaglia schegge di pietra e luce malata tutto intorno.", "azioni": ["colpo_area"] }
        ]
    },
    "abomini_della_piazza": {
        "name": "Gli Abomini della Piazza",
        "image": "",
        "hp": 16,
        "maxHp": 16,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "La metà inferiore della Grande Piazza è ormai un lago ribollente di detriti e schiuma. Dalle crepe allagate emergono Esùridi e creature d'ombra scatenate dal collasso di Loch Ein, che si avventano su di voi mentre cercate di raggiungere i viali verso i quartieri alti.",
        "speciali": [
            { "quando": "inizio_round", "fai": "danni", "val": 1, "bersaglio": "piu_debole", "prob": 30 }
        ]
    },
    "cavalcantici_intrappolati": {
        "name": "I Cavalcantici Intrappolati",
        "image": "",
        "hp": 16,
        "maxHp": 16,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Tra i frammenti delle torri astronomiche incrociate una pattuglia di Cavalcantici rimasta tagliata fuori dalla ritirata: disperati e furiosi, tentano di abbattervi per rubare le vostre attrezzature di risalita e il frammento di Yrtite. Pancrazio, col volto contratto in una smorfia di rabbia incontenibile, non lascia loro nemmeno il tempo di finire la frase prima di caricarli.",
        "speciali": [
            { "quando": "colpisce", "fai": "danni", "val": 1, "bersaglio": "piu_debole", "prob": 25 }
        ]
    },
    "campione_corrotto": {
        "name": "Il Campione Corrotto",
        "image": "",
        "hp": 29,
        "maxHp": 29,
        "att": 8,
        "dmg": 4,
        "ca": 9,
        "desc": "Lungo il viale principale del Quartiere dei Calcoli Matematici ormai mezzo sommerso, un veterano corazzato di Foscoclivo — con gli occhi iniettati del bagliore violaceo dell'infezione che ha respirato laggiù — guida i suoi ultimi uomini in un assalto suicida pur di non farvi uscire vivi con l'Yrtite.",
        "fasi": [
            { "soglia": 70, "testo": "Il veterano punta il più forte di voi e lo sfida da solo.", "azioni": ["duellante"] },
            { "soglia": 35, "testo": "Con il viale che sprofonda, il Campione colpisce senza più badare a difendersi.", "azioni": ["frenesia"] }
        ]
    },
    "acque_nere": {
        "name": "Le Acque Nere",
        "image": "",
        "hp": 18,
        "maxHp": 18,
        "att": 8,
        "dmg": 3,
        "ca": 8,
        "desc": "Risalendo lungo il fianco occidentale verso l'uscita della città, costeggiate il margine allagato del grande Anfiteatro in rovina. Dalle pozze nere che hanno sommerso l'antico mosaico di Yr Drazul balzano fuori predatori acquatici mutati e Mantombre di lago, che tentano di trascinare nell'arena voi e il Primarca svenuto.",
        "speciali": [
            { "quando": "colpisce", "fai": "cura", "val": 1 }
        ]
    }
};
