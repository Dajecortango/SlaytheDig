// Campagna "Un brusco risveglio".
// Il contenuto dopo "=" è JSON puro: niente funzioni, gli effetti sono descritti nei campi "effects"
// e interpretati da applyEffects() in js/game.js. È un file .js (e non .json) perché il gioco
// si apre con doppio click da file:// e il browser blocca fetch() di file locali.
// Nemici, oggetti, reliquie e maledizioni sono richiamati per id da data/libreria/.
window.CAMPAIGNS = window.CAMPAIGNS || {};
window.CAMPAIGNS["tutorial"] = {
    "id": "tutorial",
    "title": "Un brusco risveglio",
    "badge": "Tutorial",
    "description": "Dopo la grande battaglia, il vino ha avuto la meglio. Riuscirai a rientrare prima dell'ira del Capitano?",
    "coverImage": "immagini/inizio_campagna.webp",
    "introText": "Aprite gli occhi. Il soffitto è di roccia irregolare, umida e gocciolante. Una luce fioca filtra dall'esterno, accompagnata dal rumore di un martellare persistente di un fabbro dentro il tuo cranio. Hai un sapore di birra torbida in bocca. Intorno a te, sparsi sul pavimento di pietra, ci sono i tuoi familiari, chi sta abbracciando un barile vuoto urlando frasi sconnesse su chissà quale cugina, chi ha il gambesone infilato al contrario e non riesce a toglierlo... Fuori dalla grotta c'è solo nebbia e il ringhio lontano di qualcosa che speri vivamente non siano lupi affamati.",
    "heroes": ["curio_dignitas", "prometeo_dignitas", "temistocle_dignitas", "caino_dignitas", "ottavio_dignitas"],
    "initialArmory": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "balsamo_curativo"],
    "challenges": {
        "fede7": {
            "title": "Un piccolo santuario",
            "desc": "Vi lasciate alle spalle i corpi privi di vita dei cinghiali, il sentiero serpeggia tra pareti di pietra umida fino a stringersi in un anfratto angusto. Una piccola nicchia scavata nella roccia, protetta da una cortina di muschio e radici pendenti. Ospita una statuetta di legno inciso, un omaggio agli Asi o qualsiasi altro nome abbiano in queste terre.",
            "ignoreText": "Il mal di testa è troppo forte e l’urgenza di rientrare troppo importante, proseguite oltre senza fermarvi…",
            "successText": "Omaggiate gli Asi con una piccola preghiera perché vi aiutino a ritrovare la strada verso l'accampamento, alla fine della litania notate un riflesso metallico...",
            "failText": "Ancora storditi dall'alcol e reduci da uno scontro non prestate la giusta attenzione e fate cadere la statuetta.",
            "stat": "fth",
            "cd": 7,
            "reward": "anello_d_arvale",
            "punishment": "15_ricompensa_monete"
        },
        "intel7": {
            "title": "Tracce nel fango",
            "desc": "Proseguendo lungo il tracciato fangoso, il gruppo si imbatte in uno scenario a dir poco bizzarro: tracce evidenti di una lotta disperata, con zolle di terra divelte, solchi profondi scavati da stivali disperati e una strana scia di sudore.",
            "ignoreText": "Tutta la zona è piena di fango, non sono rilevanti.",
            "successText": "Riconoscete le tracce dei piegamenti fatti da ubriachi ieri notte e ritrovate materiale disperso!",
            "failText": "Non riuscite a decifrare nulla e fuggite frettolosamente.",
            "stat": "int",
            "cd": 7,
            "reward": "armatura_d_ordinanza",
            "punishment": "sbornia_pesante"
        },
        "fede7_2": {
            "title": "Lamenti nelle nebbie",
            "desc": "La nebbia mattutina si dirada lentamente, rivelando una scena di profonda malinconia. Un lungo e silenzioso gruppo di popolani in abiti lisi, con il capo coperto da cappucci scuri e volti rigati dal pianto, procede a lento passo in una solenne processione.\nReggono torce fumiganti e rami di tasso intrecciati, diretti verso una fossa comune scavata ai margini dei campi per dare l'eterno addio ai caduti della loro comunità. Il loro cammino incrocia il vostro: vi guardano con occhi svuotati dal dolore, stringendosi al petto piccoli ricordi e immagini sacre, offrendovi un momento di inaspettato raccoglimento in mezzo all'orrore della guerra.",
            "ignoreText": "Non avete tempo da perdere, affrettate il passo.",
            "successText": "Vi raccogliete in un momento di silenzio insieme ai fresi che piangono i loro morti, pensate anche ai vostri che sono stati portati via dalla guerra. Aiutate i paesani a depositare qualche corpo nella fossa comune, vi ringraziano con occhi lucidi e riconoscenti.",
            "failText": "i fumi delle torce e la litania seppelliscono le vostre buone intenzioni, anche se avreste voluto aiutare quei popolani, respirare quei fumi insieme all’alcol vi avrebbe steso sicuramente.",
            "stat": "fth",
            "cd": 7,
            "reward": "benedetti_da_jag_antar",
            "punishment": "maledetti_dai_popolani"
        },
        "intel8": {
            "title": "Ricordi della marcia",
            "desc": "Il sentiero fangoso si fa sempre più pesante, solcato da centinaia di impronte di stivali pesanti e solchi di carri pesanti che testimoniano la frenetica marcia della truppa del giorno prima. Che sia possibile capire la direzione da prendere grazie a questi segni?",
            "ignoreText": "Meglio seguire l'istinto.",
            "successText": "Vi ricordate improvvisamente di avere la mappa nel borsello!",
            "failText": "Non ricordate nulla e procedete a caso.",
            "stat": "int",
            "cd": 7,
            "reward": "mappa_della_regione",
            "punishment": "cattiva_memoria"
        },
        "fede8": {
            "title": "Degna Sepoltura",
            "desc": "Dopo aver trovato e preso ciò che era ancora utile da un vostro familiare caduto dovete decidere se seppellire il suo corpo perdendo tempo prezioso o se proseguire in fretta verso l'accampamento.",
            "ignoreText": "ormai è quasi l'alba, non avete tempo purtroppo, lasciate il corpo dove si trova.",
            "successText": "Scavate una fossa degna e placate la vostra coscienza.",
            "failText": "La paura dell'adunata vi fa desistere a metà dell'opera.",
            "stat": "fth",
            "cd": 7,
            "reward": "stendardo_da_battaglia",
            "punishment": "presagio_di_morte"
        },
        "scelta_finale": {
            "title": "Accampamento",
            "desc": "Varcate l'ingresso del campo principale. Il capitano vi starà cercando?",
            "ignoreText": "Correte a capofitto verso le vostre tende.",
            "successText": "Rientrate eludendo le guardie senza farvi notare.",
            "failText": "Nel buio inciampate contro le riserve di provviste allarmando l'intero campo.",
            "stat": "fth",
            "cd": 9
        }
    },
    "merchants": {
        "1": "Un mercante con un carretto di fortuna vi propone cianfrusaglie e armamenti di seconda mano.",
        "2": "Un carrettiere offre provviste e scambi veloci lungo il sentiero.",
        "3": "Una carovana di profughi baratta ciò che ha con un po' di denaro per cibarsi.",
        "4": "Mercanti itineranti vendono merci sottratte agli accampamenti abbandonati."
    },
    "rests": { "1": "Un focolare quasi spento tra due massi: il calore della cenere vi ristora.", "2": "Una radura riparata dalla nebbia vi concede una breve pausa.", "3": "In cima al colle vedete la sagoma della meta: un ultimo respiro prima della fine." },
    "treasures": {
        "1": "Seguendo quelle che vi sembrano le vostre orme, arrivate sulle rive di un fiumiciattolo. Sulle rocce lisce intorno a una pozza d'acqua limpida ci sono vestiti inzuppati, stivali spaiati e cumuli di oggetti abbandonati in fretta e furia: vi torna alla mente il bagno notturno prima di perdere i sensi! Ritrovate finalmente parte del vostro equipaggiamento disperso..",
        "2": "Andando avanti vi imbattete in una scena che vi gela il sangue nelle vene. Il cadavere di un membro della vostra famiglia, un commilitone caduto in battaglia, è lì davanti a voi, morto in ginocchio con il volto rivolto verso terra. Il viso è sfigurato e irriconoscibile, ma tra le dita rigide stringe un medaglione che luccica flebile alle prime luci dell'alba.",
        "3": "Il cadavere di un commilitone, recuperate ciò che potrebbe essere ancora utile."
    },
    "lootItems": null,
    "mapNodes": [
        { "id": 0, "level": 0, "x": 400, "type": "combat", "enemy": "cinghiali", "title": "Livello 1 - Scontro", "icon": "🗡️", "done": false, "active": true, "next": [23, 24] },
        { "id": 1, "level": 2, "x": 191, "type": "challenge", "challengeId": "fede7", "title": "Livello 3 - Sfida", "icon": "❓", "done": false, "active": false, "next": [25], "image": "immagini/santuario.webp" },
        { "id": 2, "level": 2, "x": 614, "type": "challenge", "challengeId": "intel7", "title": "Livello 3 - Sfida", "icon": "❓", "done": false, "active": false, "next": [27], "image": "immagini/tracce_fango.webp" },
        { "id": 3, "level": 7, "x": 326, "type": "treasure", "treasureId": 1, "title": "Livello 8 - Tesoro", "icon": "💎", "done": false, "active": false, "next": [11], "image": "immagini/tesoro_fiume.webp" },
        { "id": 4, "level": 6, "x": 401, "type": "combat", "enemy": "disertori_affamati", "title": "Livello 7 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [8] },
        { "id": 5, "level": 6, "x": 520, "type": "merchant", "merchantId": 1, "title": "Livello 7 - Mercante", "icon": "🪙", "done": false, "active": false, "next": [8, 9], "image": "immagini/mercante_viandante.webp" },
        { "id": 6, "level": 7, "x": 194, "type": "merchant", "merchantId": 2, "title": "Livello 8 - Mercante", "icon": "🪙", "done": false, "active": false, "next": [10], "image": "immagini/mercante_viandante.webp" },
        { "id": 7, "level": 6, "x": 262, "type": "combat", "enemy": "lupi", "title": "Livello 7 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [6, 3] },
        { "id": 8, "level": 7, "x": 463, "type": "rest", "restId": 1, "title": "Livello 8 - Riposo", "icon": "⛺", "done": false, "active": false, "next": [12], "image": "immagini/riposo_accampamento.webp" },
        { "id": 9, "level": 7, "x": 593, "type": "treasure", "treasureId": 1, "title": "Livello 8 - Tesoro", "icon": "💎", "done": false, "active": false, "next": [12], "image": "immagini/tesoro_fiume.webp" },
        { "id": 10, "level": 8, "x": 272, "type": "rest", "restId": 2, "title": "Livello 9 - Riposo", "icon": "⛺", "done": false, "active": false, "next": [13], "image": "immagini/riposo_accampamento.webp" },
        { "id": 11, "level": 8, "x": 396, "type": "challenge", "challengeId": "fede7_2", "title": "Livello 9 - Sfida", "icon": "❓", "done": false, "active": false, "next": [13], "image": "immagini/lamenti_nebbia.webp" },
        { "id": 12, "level": 8, "x": 536, "type": "combat", "enemy": "banditi", "title": "Livello 9 - Scontro", "icon": "⚔️", "done": false, "active": false, "next": [13] },
        { "id": 13, "level": 9, "x": 404, "type": "elite", "enemy": "sergente", "title": "Livello 10 - Scontro Elite", "icon": "👹", "done": false, "active": false, "next": [14, 15] },
        { "id": 14, "level": 10, "x": 338, "type": "treasure", "treasureId": 2, "title": "Livello 11 - Tesoro", "icon": "💎", "done": false, "active": false, "next": [17, 18, 16], "image": "immagini/dignitas_caduto.webp" },
        { "id": 15, "level": 10, "x": 465, "type": "challenge", "challengeId": "intel8", "title": "Livello 11 - Sfida", "icon": "❓", "done": false, "active": false, "next": [19, 18], "image": "immagini/ricordi_marcia.webp" },
        { "id": 16, "level": 11, "x": 274, "type": "merchant", "merchantId": 3, "title": "Livello 12 - Mercante", "icon": "🪙", "done": false, "active": false, "next": [20], "image": "immagini/mercante_viandante.webp" },
        { "id": 17, "level": 11, "x": 371, "type": "challenge", "challengeId": "fede8", "title": "Livello 12 - Sfida", "icon": "❓", "done": false, "active": false, "next": [20], "image": "immagini/sfida_dignitas_caduto.webp" },
        { "id": 18, "level": 11, "x": 509, "type": "combat", "enemy": "profanatori", "title": "Livello 12 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [20] },
        { "id": 19, "level": 11, "x": 611, "type": "merchant", "merchantId": 4, "title": "Livello 12 - Mercante", "icon": "🪙", "done": false, "active": false, "next": [20], "image": "immagini/mercante_viandante.webp" },
        { "id": 20, "level": 12, "x": 440, "type": "rest", "restId": 3, "title": "Livello 13 - Riposo", "icon": "⛺", "done": false, "active": false, "next": [21], "image": "immagini/riposo_accampamento.webp" },
        { "id": 21, "level": 13, "x": 438, "type": "elite", "title": "Livello 14 - Meta", "icon": "👹", "done": false, "active": false, "next": [], "image": "", "enemy": "capitano_esploratori" },
        { "id": 22, "level": 2, "x": 456, "type": "combat", "enemy": "cinghiali", "title": "Livello 3 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [28], "image": "" },
        { "id": 23, "level": 1, "x": 276, "type": "combat", "enemy": "cinghiali", "title": "Livello 2 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [1, 26], "image": "" },
        { "id": 24, "level": 1, "x": 531, "type": "combat", "enemy": "cinghiali", "title": "Livello 2 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [22, 2], "image": "" },
        { "id": 25, "level": 3, "x": 244, "type": "combat", "enemy": "fuorilegge_tutorial", "title": "Livello 4 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [28], "image": "" },
        { "id": 26, "level": 2, "x": 349, "type": "combat", "enemy": "cinghiali", "title": "Livello 3 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [28], "image": "" },
        { "id": 27, "level": 3, "x": 527, "type": "combat", "enemy": "fuorilegge_tutorial", "title": "Livello 4 - Scontro", "icon": "🗡️", "done": false, "active": false, "next": [28], "image": "" },
        { "id": 28, "level": 4, "x": 399, "type": "elite", "title": "Livello 5 - Scontro Elite", "icon": "👹", "done": false, "active": false, "next": [31], "image": "", "enemy": "orso_bruno_tutorial" },
        { "id": 31, "level": 5, "x": 399, "type": "rest", "title": "Livello 6 - Riposo", "icon": "⛺", "done": false, "active": false, "next": [7, 4, 5], "image": "", "restId": 1 }
    ],
    "stories": {}
};
