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
        "sfxDeath": "audio/nemici/umano_morte.ogg"
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
            { "soglia": 50, "testo": "Il Tremabosco va su tutte le furie: travolgerà chiunque gli stia davanti!", "schema": "travolge" }
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
            { "soglia": 50, "testo": "Il Mastino fiuta il sangue: punta il più debole!", "schema": "predatore" }
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
            { "soglia": 50, "testo": "Il Boia va in furia: la mannaia cerca il più debole!", "schema": "predatore", "bonusDanno": 1 }
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
            { "soglia": 66, "testo": "L'Hungrabarn affonda gli artigli nel terreno: si prepara a travolgervi!", "schema": "carica" },
            {
                "soglia": 33,
                "testo": "Il ruggito primordiale scuote le rovine!",
                "schema": "furia",
                "ruggito": { "malus": 1, "fedeMin": 4 }
            }
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
        "image": "immagini/bestiario/capitano_esploratori.webp"
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
            { "soglia": 50, "testo": "Il Ragno Nero Imperiale si scaglia furioso: le sue zampe falciano chiunque gli stia accanto!", "schema": "travolge" }
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
            { "soglia": 50, "testo": "I Cenofori fiutano il sangue: puntano il più debole!", "schema": "predatore" }
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
            { "soglia": 66, "testo": "Il Tremabosco Striato raspa furiosamente il terreno: si prepara a travolgervi!", "schema": "carica" },
            {
                "soglia": 33,
                "testo": "Il ruggito primordiale scuote la foresta!",
                "schema": "furia",
                "ruggito": { "malus": 1, "fedeMin": 4 }
            }
        ],
        "sfxAttack": "",
        "sfxHit": "",
        "sfxDeath": ""
    }
};
