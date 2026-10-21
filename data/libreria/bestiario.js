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
        "hp": 8,
        "maxHp": 8,
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
        "hp": 9,
        "maxHp": 9,
        "att": 7,
        "dmg": 1,
        "ca": 6,
        "desc": "L'aria gelida fischia tra i rami pietrificati della foresta morta. Vi imbattete in una banda di disperati rifugiati Kin, fuggiti dalla guerra a Foscoclivo e ormai datisi al banditismo. Frustano due Brachidani, spingendoli contro i tronchi per usarli come bestie da sfondamento contro di voi. Le creature caricano a testa bassa."
    },
    "predoni_nevi": {
        "name": "Predoni delle Nevi",
        "image": "",
        "hp": 8,
        "maxHp": 8,
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
        "hp": 10,
        "maxHp": 10,
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
        "hp": 9,
        "maxHp": 9,
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
        "hp": 9,
        "maxHp": 9,
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
        "hp": 9,
        "maxHp": 9,
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
        "hp": 10,
        "maxHp": 10,
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
        "hp": 10,
        "maxHp": 10,
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
        "hp": 9,
        "maxHp": 9,
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
        "hp": 10,
        "maxHp": 10,
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
        "hp": 11,
        "maxHp": 11,
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
        "hp": 10,
        "maxHp": 10,
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
        "hp": 10,
        "maxHp": 10,
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
        "hp": 13,
        "maxHp": 13,
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
        "hp": 10,
        "maxHp": 10,
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
        "hp": 10,
        "maxHp": 10,
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
        "hp": 10,
        "maxHp": 10,
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
        "hp": 15,
        "maxHp": 15,
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
        "hp": 11,
        "maxHp": 11,
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
        "hp": 9,
        "maxHp": 9,
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
        "hp": 16,
        "maxHp": 16,
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
        "hp": 15,
        "maxHp": 15,
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
        "hp": 11,
        "maxHp": 11,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Nel vortice incessante di neve che spazza la landa piatta del Mare Bianco, scorgete dei Gheist del Gelo, viandanti morti assiderati in questa stessa piana secoli fa, che barcollano verso di voi spinti dall'odio per il calore della vita."
    },
    "troll_corazzati": {
        "name": "Troll Corazzati",
        "image": "",
        "hp": 12,
        "maxHp": 12,
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
        "hp": 11,
        "maxHp": 11,
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
        "hp": 11,
        "maxHp": 11,
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
        "hp": 17,
        "maxHp": 17,
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
        "hp": 11,
        "maxHp": 11,
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
        "hp": 12,
        "maxHp": 12,
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
        "hp": 12,
        "maxHp": 12,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Alla fine del plateau di ghiaccio del Mare Bianco, l'ululato della tormenta raggiunge il suo apice assoluto. Enormi Silfidi Flussidi, spiriti elementali fatti di neve tagliente, ghiaccio nero e raffiche spietate, si scagliano contro di voi."
    },
    "madre_silfidi": {
        "name": "Aracnomantropo",
        "image": "",
        "hp": 20,
        "maxHp": 20,
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
        "hp": 15,
        "maxHp": 15,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Un ringhio profondo si confonde con il muggito del vento tra i pinnacoli di pietra. Davanti a voi non c'è una muta, ma un singolo Warg di taglia mostruosa, con il muso segnato da vecchie cicatrici bianche e un canino spezzato. È un vecchio maschio dominante, un solengo salito a vivere sulle creste più alte dopo aver abbandonato il branco. Molto più astuto, massiccio e prudente dei suoi simili più giovani, sfrutta gli spuntoni di roccia per coprirsi dai tiri a distanza e vi studia in silenzio, pronto a caricare il primo che mostra un segno di debolezza.",
        "speciali": [
            { "quando": "colpito", "fai": "danni", "val": 1 }
        ]
    },
    "vespertilio_magno": {
        "name": "Vespertilio Magno",
        "hp": 15,
        "maxHp": 15,
        "att": 7,
        "dmg": 2,
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
        "hp": 10,
        "maxHp": 10,
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
        "hp": 10,
        "maxHp": 10,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Su una cresta affilata dove passa a malapena un uomo alla volta, due colossi avvolti in pelli di cinghiale irrigidite dal ghiaccio vi sbarrano il cammino. Sono guerrieri esiliati del Clan Braggart, quasi sterminato dalla Famiglia durante la Guerra dei Quaranta Giorni, saliti su queste vette impossibili in cerca di una bestia leggendaria da abbattere per riscattare il proprio onore con un'impresa folle. Riconoscendo su di voi i simboli di Dignitas, gli occhi iniettati di sangue si illuminano di furia: per loro, morire uccidendo dei Dignitas sulla cima del mondo vale quanto abbattere un mostro."
    },
    "kreehorn_territoriale": {
        "name": "Kreehorn Territoriale",
        "hp": 24,
        "maxHp": 24,
        "att": 7,
        "dmg": 2,
        "ca": 7,
        "desc": "Attraversando un nevaio incassato tra due pareti verticali di ghiaccio azzurro, vi ritrovate faccia a faccia con un imponente Kreehorn. La bestia supera i tre metri d'altezza al palco delle corna, il corpo massiccio coperto da una folta lanugine di filamenti gelati e il dorso irto di speroni di ghiaccio durissimo. Sebbene i Kreehorn siano solitamente schivi, la gola stretta non gli lascia alcuna via di fuga: sbuffa vapore bianco dalle narici, abbassa la testa coronata di lance glaciali e carica con una forza capace di sfondare uno scudo di ferro.",
        "speciali": [
            { "quando": "inizio_round", "fai": "danni", "val": 1, "bersaglio": "tutti" }
        ]
    },
    "golem_terrigeno_delle_vette": {
        "name": "Golem Terrigeno delle Vette",
        "hp": 24,
        "maxHp": 24,
        "att": 7,
        "dmg": 2,
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
        "hp": 18,
        "maxHp": 25,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Un ringhio gorgogliante e innaturale spezza il silenzio del passo. Da dietro un ammasso di rocce nere avanza barcollando un grosso Warg, ma il suo aspetto è ributtante: il corpo è scarno fino alle ossa, il pelo cade a chiazze rivelando ferite infette che colano un umore denso prima di congelarsi, e nelle sue iridi brilla un bagliore violaceo. È un Kranh-Grodd, una fiera corrotta dal morbo e fuggita fin sulle vette più isolate in preda a un tormento incessante. La malattia lo sta uccidendo lentamente, ma ha cancellato in lui ogni percezione del dolore o istinto di conservazione, rendendolo una furia cieca.",
        "speciali": [
            { "quando": "colpito", "fai": "veleno", "val": 1, "durata": 2, "prob": 50 },
            { "quando": "colpisce", "fai": "cura", "val": 4, "prob": 50 }
        ]
    },
    "muta_di_ghofuuri": {
        "name": "Muta di Ghofuuri",
        "hp": 15,
        "maxHp": 25,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Il sole sta ormai calando dietro le vette occidentali dei Picchi del Tramonto, gettando i canaloni in una penombra livida e gelida. Con il ritirarsi della luce, da una spaccatura profonda nella montagna esce allo scoperto un branco di Ghofuuri, grossi canidi neri dalle pupille rosse con il muso incrostato di sangue secco e ghiacciato. Queste bestie notturne aspettavano il buio per risalire verso l'altopiano sommitale a divorare gli scarti lasciati dal predatore della vetta; trovandovi sulla loro strada, vi circondano emettendo latrati gutturali e coordinati, pronti a sbranarvi nell'oscurità.",
        "speciali": [
            { "quando": "colpisce", "fai": "cura", "val": 3 },
            { "quando": "inizio_round", "fai": "malus", "val": 1, "bersaglio": "casuale", "durata": 2, "prob": 50 }
        ]
    },
    "spettro_dei_tumuli": {
        "name": "Spettro dei Tumuli",
        "hp": 15,
        "maxHp": 15,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Su una sella ventosa che precede l'altopiano finale sorgono i resti crollati di un antico tumulo di pietre a secco, eretto secoli fa da qualche spedizione perduta per seppellire un proprio campione. I massi della tomba sono stati recentemente ribaltati e sparsi nella neve da qualcuno che ha scavato fino alle ossa per divorarle. Dal fondo della camera funeraria profanata si innalza una densa manifestazione d'ombra: uno Spettro dei Tumuli, uno spirito antico e instancabile legato al proprio simulacro violato, che si scaglia contro di voi con tutta la furia del Margine.",
        "speciali": [
            { "quando": "colpito", "fai": "veleno", "val": 1, "durata": 2 },
            { "quando": "colpisce", "fai": "cura", "val": 2, "se": "eroe_ferito" }
        ]
    },
    "mantombra_delle_spelonche": {
        "name": "Mantombra delle Spelonche",
        "hp": 30,
        "maxHp": 30,
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
        "hp": 25,
        "maxHp": 25,
        "att": 8,
        "dmg": 3,
        "ca": 8,
        "desc": "Il sentiero passa in mezzo ai ruderi crollati di una fortezza d'avvistamento antichissima, risalente ai tempi in cui i primi clan Vitghen tentarono invano di presidiare queste vette. Tra le mura di pietra nera mezze sepolte dal ghiaccio notate spessi fili biancastri misti a ossa ripulite. Dall'ombra di una torre sventrata balza giù con agilità spaventosa un Aracnomantropo: un abominio ibrido dotato di torso e intelletto umano su un corpo chitinoso da ragno, con una coda uncinata che stilla veleno paralizzante. Rifugge la luce diretta, ma sfrutta gli angoli ciechi delle macerie per saltare da un muro all'altro e colpirvi dall'alto con fredda astuzia.",
        "fasi": [
            { "soglia": 75, "testo": "", "azioni": ["contrattacco"] },
            { "soglia": 50, "testo": "", "azioni": ["imprevedibile"] },
            { "soglia": 25, "testo": "", "azioni": ["sete_di_sangue"] }
        ],
        "speciali": [
            { "quando": "inizio_round", "fai": "spezza_armatura", "bersaglio": "casuale", "se": "sotto_meta", "prob": 25 }
        ]
    },
    "hungrabarn_dei_picchi": {
        "name": "Hungrabarn dei Picchi",
        "hp": 30,
        "maxHp": 30,
        "att": 8,
        "dmg": 3,
        "ca": 8,
        "desc": "Scavalcate l'ultimo crinale di roccia e vi affacciate nella conca sommitale mentre gli ultimi raggi rossi del sole spariscono dietro le montagne. Il fetore di macello, grasso rancido e sangue vecchio è quasi insopportabile anche nel gelo estremo. Il fondo della depressione è un immenso ossario a cielo aperto: carcasse di cavalli, buoi interi trascinati fin quassù dalla valle, gabbie toraciche di orsi e decine di crani umani spaccati a metà tappezzano la neve calpestata. Dal fondo di una caverna bassa e larga sotto la vetta principale emerge chinandosi una figura che toglie il respiro. Non è un lupo, né uno spirito del vento: è un Hungrabarn, un esemplare relitto di una razza di giganti carnivori ritenuta estinta da generazioni, fuggito fin su queste vette inaccessibili dalle forre dell'Ugin.\n\nQuando si raddrizza in tutta la sua statura raggiunge i quindici piedi d'altezza, pesante e massiccio quanto un intero gregge di pecore. È avvolto in pelli di bue cucite rozzamente con tendini e filo di ferro rubato, la pelle grigiastra e callosa segnata da vecchie cicatrici di lance che non sono bastate a fermarlo; il volto umanoide è largo e brutale, con una mascella sproporzionata fatta per frantumare ossa e piccoli occhi infossati che vi fissano con una fame lucida e spietata. Nella mano destra stringe come una clava l'intero asse ferrato di un carro mercantile strappato ai viandanti del Krogg. Annusa l'aria gelida della sera, emette un grugnito profondo che fa vibrare la ghiaia sotto i vostri stivali e avanza per divorarvi. Ecco il vostro materiale da leggenda: riportate il suo teschio ad Aebeltoff e ogni Lungobarbo dovrà chinare il capo davanti al nome dei Dignitas.",
        "fasi": [
            { "soglia": 80, "testo": "", "azioni": ["contrattacco"] },
            { "soglia": 60, "testo": "", "azioni": ["contrattacco"] },
            { "soglia": 40, "testo": "", "azioni": ["contrattacco"] },
            { "soglia": 20, "testo": "", "azioni": ["ultimo_sangue"] }
        ],
        "speciali": [
            { "quando": "inizio_scontro", "fai": "malus", "val": 1, "durata": 2, "bersaglio": "tutti", "limite": "scontro", "volte": 1, "round": 1 },
            { "quando": "inizio_round", "fai": "cura", "val": 2 }
        ]
    },
    "coppia_di_garriatori": {
        "name": "Coppia di Garriatori",
        "hp": 12,
        "maxHp": 12,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "L'aria rarefatta della quota estrema e la fatica della salita vi provocano un torpore improvviso, appesantendo le palpebre mentre attraversate una stretta gola d'ombra. Dalle fessure nella roccia sgusciano fuori due Garriatori, esseri scarni e rachitici grandi quanto bambini, abituati a vivere sulle vette più inaccessibili. Speravano che il mal di montagna vi facesse assopire nella neve per immobilizzarvi nel sonno e sgozzarvi; vedendo che siete ancora vigili, stridono furiosi nel vento e vi saltano addosso insieme, brandendo schegge di pietra affilata.",
        "speciali": [
            { "quando": "colpito", "fai": "veleno", "val": 1, "durata": 2, "bersaglio": "casuale" }
        ]
    }
};
