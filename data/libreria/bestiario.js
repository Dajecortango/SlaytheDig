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
        "dmg": 3,
        "ca": 8,
        "desc": "Mentre attraversate un passo, notate strani movimenti sulle pendici. Inizialmente non ci fate caso, ma quando aguzzate lo sguardo notate degli esseri simili a lucertole ma bianchi come la neve. Li riconoscete, sono Cenofori delle Slavine, delle fiere innocue, che abitano i picchi innevati. La preoccupazione sale quando tre o quattro di loro, particolarmente grossi, sembrano guardare verso di voi. Mentre camminate, sentite cedere della neve lungo le pendici. È la tattica di caccia dei Cenofori: provocare slavine per poi attaccare le proprie prede.",
        "fasi": [
            { "soglia": 50, "testo": "I Cenofori fiutano il sangue: puntano il più debole!", "azioni": ["predatore"] }
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
        "sfxDeath": "audio/nemici/umano_morte.ogg"
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
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "troll_giovani": {
        "name": "Troll giovani",
        "image": "",
        "hp": 10,
        "maxHp": 10,
        "att": 6,
        "dmg": 1,
        "ca": 6,
        "desc": "Sfiorando la base scavata di un colossale abete ormai pietrificato dal gelo, sentite il rumore di ossa frantumate. Un branco di Troll giovani sta divorando una carcassa, rannicchiato tra le enormi radici; notandovi, si avventano su di voi con gli occhi iniettati di sangue."
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
        "sfxDeath": "audio/nemici/lupo_morte.ogg"
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
        "sfxDeath": "audio/nemici/umano_morte.ogg"
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
        "sfxDeath": "audio/nemici/umano_morte.ogg"
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
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "silfidi_eterei_crepaccio": {
        "name": "Silfidi Eterei",
        "image": "",
        "hp": 9,
        "maxHp": 9,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Il fondo del crepaccio diventa infido, costituito da sottili strati di brina tesi sopra il vuoto. Silfidi Eterei, spiriti manifestati come raffiche di vento gelido e tagliente incanalate nelle pareti strette, turbinano nella gola per congelarvi il sangue e farvi precipitare di sotto."
    },
    "mastini_nevi": {
        "name": "Mastini delle Nevi",
        "image": "",
        "hp": 10,
        "maxHp": 10,
        "att": 7,
        "dmg": 1,
        "ca": 7,
        "desc": "Scalando una ripida parete di ghiaccio per risalire il crepaccio, un ululato bestiale si fonde con l'eco del vento. Branchi di feroci mastini delle nevi, sguinzagliati dai loro padroni lungo gli stretti passaggi, cercano di sbranarvi in uno spazio dove schivare è impossibile.",
        "sfxAttack": "audio/nemici/lupo_attacco.ogg",
        "sfxHit": "audio/nemici/lupo_colpito.ogg",
        "sfxDeath": "audio/nemici/lupo_morte.ogg"
    },
    "hrost": {
        "name": "Hrost",
        "image": "",
        "hp": 11,
        "maxHp": 11,
        "att": 7,
        "dmg": 1,
        "ca": 8,
        "desc": "Strisciando in una grotta nascosta nel ghiaccio millenario del crepaccio, urtate involontariamente una scultura. Si tratta di uno Hrost, un formidabile abitante mimetico delle nevi sotterranee che si anima furiosamente per difendere il suo angusto territorio."
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
        "sfxDeath": "audio/nemici/umano_morte.ogg"
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
            { "soglia": 50, "testo": "Il Kreehorn sbuffa una tempesta di cristalli: travolge chiunque gli stia accanto!", "azioni": ["travolge"] }
        ]
    },
    "kornugan": {
        "name": "Kornugan",
        "image": "",
        "hp": 13,
        "maxHp": 13,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Finalmente fuori dall'oscurità dei crepacci, vi ritrovate appesi alle pareti verticali esterne della montagna, i Dirupi del Cielo Infranto. Costretti su una strettissima cengia a strapiombo sulle nuvole, un maestoso Kornugan dalle corna imponenti vi sbarra la strada.",
        "fasi": [
            { "soglia": 50, "testo": "Il Kornugan abbassa le corna e raspa la roccia: si prepara a caricare!", "azioni": ["carica"] }
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
        "image": "",
        "hp": 14,
        "maxHp": 14,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Sulla rupe scoscesa dei Dirupi che state scalando, l'aria rarefatta vi riempie i polmoni. Siete braccati dai predatori delle vette: un branco di spaventosi Warg mutati, dal respiro pesante per l'altitudine, che si lancia in una spietata caccia coordinata per farvi scivolare giù.",
        "fasi": [
            { "soglia": 50, "testo": "Il branco fiuta il sangue: i Warg puntano il più debole!", "azioni": ["predatore"] }
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
        "sfxDeath": "audio/nemici/umano_morte.ogg"
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
        "sfxDeath": "audio/nemici/umano_morte.ogg"
    },
    "silfidi_eterei_gradinata": {
        "name": "Silfidi Eterei",
        "image": "",
        "hp": 10,
        "maxHp": 10,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Su una gelida gradinata scolpita nel fianco nudo della montagna, la temperatura precipita brutalmente. Creature del vento e Silfidi Eterei assumono forme taglienti, vorticando attorno a voi per asfissiarvi e strapparvi l'ultimo calore vitale ad alta quota."
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
            { "soglia": 50, "testo": "Il ghiaccio del Criogolem si incrina e lo rende furioso: ogni colpo è più pesante del precedente!", "azioni": ["furia"] }
        ]
    },
    "cenofori_mare_bianco": {
        "name": "Cenofori delle Slavine",
        "image": "immagini/bestiario/cenofori.webp",
        "hp": 15,
        "maxHp": 15,
        "att": 7,
        "dmg": 2,
        "ca": 8,
        "desc": "Terminata la scalata e calpestando il frastagliato ghiaccio perenne che lastrica l'inizio del Mare Bianco, venite travolti da una slavina. Vi mettete al riparo giusto in tempo, ma vi accorgete che non era una slavina naturale: è stata causata da un branco di Cenofori delle Slavine, che vuole fare di voi il suo pasto.",
        "fasi": [
            { "soglia": 50, "testo": "I Cenofori fiutano il sangue: puntano il più debole!", "azioni": ["predatore"] }
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
        "desc": "In una profonda trincea scavata dalle bufere nel ghiaccio del plateau, assistete a uno scontro brutale: orgogliosi guerrieri del Clan Seachtuir esiliati lottano per la sopravvivenza contro dei Troll corazzati di ghiaccio. Accecati dalla fame del Mare Bianco, vi attaccano tutti indistintamente."
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
        "desc": "Tra enormi dune di neve fresca modellate dai venti polari che sferzano la piana del Mare Bianco, subite l'assalto strisciante degli Spettri dei Tumuli. Si innalzano dal candore del terreno come mietitori silenziosi, attraversando la neve e il vostro equipaggiamento per drenarvi l'anima."
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
            { "soglia": 50, "testo": "Un Custode cade: il gemello si infuria e risponde subito al colpo!", "azioni": ["furore", "contrattacco"] }
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
        "sfxDeath": "audio/nemici/umano_morte.ogg"
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
        "name": "Madre dei Silfidi",
        "image": "",
        "hp": 20,
        "maxHp": 20,
        "att": 7,
        "dmg": 3,
        "ca": 8,
        "desc": "Il cupo e silenzioso plateau di roccia scura della Terrazza dell'Eclissi converge in un immenso altipiano. In questa aria totalmente immobile, inizia a spirare lentamente del vento, che però è un crescendo. Da brezza a tempesta, l'aria sembra farsi tangibile, fino a creare quella che sembra essere la figura eterea di una donna, alta almeno tre metri. Non sembra essere un semplice Silfide Flusside, ma un gradino superiore. Avete sconfinato in quello che sembra essere il suo territorio.",
        "fasi": [
            { "soglia": 66, "testo": "La Madre dei Silfidi solleva la tempesta: il vento travolge tutta la compagnia!", "azioni": ["travolge"] },
            { "soglia": 33, "testo": "L'urlo della tempesta vi gela il sangue!", "azioni": ["furia", "ruggito_primordiale"] }
        ]
    }
};
