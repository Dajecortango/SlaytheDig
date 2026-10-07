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
            "ignoreText": "Proseguite oltre senza fermarvi...",
            "successText": "Omaggiate gli dei e notate un riflesso prezioso tra i sassi.",
            "failText": "Storditi, fate cadere goffamente la statuetta a terra.",
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
            "cd": 8,
            "reward": "mappa_della_regione",
            "punishment": "cattiva_memoria"
        },
        "fede8": {
            "title": "Onore ai caduti",
            "desc": "Dopo aver trovato un vostro familiare caduto dovete decidere se seppellire il suo corpo perdendo tempo prezioso o se proseguire in fretta verso l'accampamento.",
            "ignoreText": "ormai è quasi l'alba, non avete tempo purtroppo, lasciate il corpo dove si trova.",
            "successText": "Scavate una fossa degna e placate la vostra coscienza.",
            "failText": "La paura dell'adunata vi fa desistere a metà dell'opera.",
            "stat": "fth",
            "cd": 8,
            "reward": "corno_antico",
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
        { "id": 0, "level": 0, "x": 400, "type": "combat", "enemy": "cinghiali", "title": "Livello 1 - Scontro 1", "icon": "🗡️", "done": false, "active": true, "next": [1, 2] },
        { "id": 1, "level": 1, "x": 300, "type": "challenge", "challengeId": "fede7", "title": "Livello 2 - Sfida 1", "icon": "❓", "done": false, "active": false, "next": [3, 4], "image": "immagini/santuario.webp" },
        { "id": 2, "level": 1, "x": 500, "type": "challenge", "challengeId": "intel7", "title": "Livello 2 - Sfida 2", "icon": "❓", "done": false, "active": false, "next": [4, 5], "image": "immagini/tracce_fango.webp" },
        { "id": 3, "level": 2, "x": 200, "type": "treasure", "treasureId": 1, "title": "Livello 3 - Tesoro 1", "icon": "💎", "done": false, "active": false, "next": [6, 7], "image": "immagini/tesoro.webp" },
        { "id": 4, "level": 2, "x": 400, "type": "combat", "enemy": "disertori_affamati", "title": "Livello 3 - Scontro 2", "icon": "🗡️", "done": false, "active": false, "next": [7, 8] },
        { "id": 5, "level": 2, "x": 600, "type": "merchant", "merchantId": 1, "title": "Livello 3 - Mercante 1", "icon": "🪙", "done": false, "active": false, "next": [8, 9], "image": "immagini/mercante_viandante.webp" },
        { "id": 6, "level": 3, "x": 180, "type": "merchant", "merchantId": 2, "title": "Livello 4 - Mercante 2", "icon": "🪙", "done": false, "active": false, "next": [10], "image": "immagini/mercante_viandante.webp" },
        { "id": 7, "level": 3, "x": 340, "type": "combat", "enemy": "lupi", "title": "Livello 4 - Scontro 3", "icon": "🗡️", "done": false, "active": false, "next": [10, 11] },
        { "id": 8, "level": 3, "x": 500, "type": "rest", "restId": 1, "title": "Livello 4 - Riposo 1", "icon": "⛺", "done": false, "active": false, "next": [11, 12], "image": "immagini/riposo_accampamento.webp" },
        { "id": 9, "level": 3, "x": 620, "type": "treasure", "treasureId": 2, "title": "Livello 4 - Tesoro 2", "icon": "💎", "done": false, "active": false, "next": [12], "image": "immagini/tesoro.webp" },
        { "id": 10, "level": 4, "x": 250, "type": "rest", "restId": 2, "title": "Livello 5 - Riposo 2", "icon": "⛺", "done": false, "active": false, "next": [13], "image": "immagini/riposo_accampamento.webp" },
        { "id": 11, "level": 4, "x": 400, "type": "challenge", "challengeId": "fede7_2", "title": "Livello 5 - Sfida 3", "icon": "❓", "done": false, "active": false, "next": [13, 14], "image": "immagini/lamenti_nebbia.webp" },
        { "id": 12, "level": 4, "x": 550, "type": "combat", "enemy": "banditi", "title": "Livello 5 - Scontro 4", "icon": "⚔️", "done": false, "active": false, "next": [14, 15] },
        { "id": 13, "level": 5, "x": 260, "type": "elite", "enemy": "sergente", "title": "Livello 6 - Scontro Elite 1", "icon": "👹", "done": false, "active": false, "next": [16] },
        { "id": 14, "level": 5, "x": 400, "type": "treasure", "treasureId": 3, "title": "Livello 6 - Tesoro 3", "icon": "💎", "done": false, "active": false, "next": [17, 18], "image": "immagini/tesoro.webp" },
        { "id": 15, "level": 5, "x": 540, "type": "challenge", "challengeId": "intel8", "title": "Livello 6 - Sfida 4", "icon": "❓", "done": false, "active": false, "next": [19, 18], "image": "immagini/ricordi_marcia.webp" },
        { "id": 16, "level": 6, "x": 180, "type": "merchant", "merchantId": 3, "title": "Livello 7 - Mercante 3", "icon": "🪙", "done": false, "active": false, "next": [20], "image": "immagini/mercante_viandante.webp" },
        { "id": 17, "level": 6, "x": 340, "type": "challenge", "challengeId": "fede8", "title": "Livello 7 - Sfida 5", "icon": "❓", "done": false, "active": false, "next": [20], "image": "immagini/sfida_dignitas_caduto.webp" },
        { "id": 18, "level": 6, "x": 500, "type": "combat", "enemy": "profanatori", "title": "Livello 7 - Scontro 5", "icon": "🗡️", "done": false, "active": false, "next": [20] },
        { "id": 19, "level": 6, "x": 620, "type": "merchant", "merchantId": 4, "title": "Livello 7 - Mercante 4", "icon": "🪙", "done": false, "active": false, "next": [20], "image": "immagini/mercante_viandante.webp" },
        { "id": 20, "level": 7, "x": 400, "type": "rest", "restId": 3, "title": "Livello 8 - Riposo 3", "icon": "⛺", "done": false, "active": false, "next": [21], "image": "immagini/riposo_accampamento.webp" },
        { "id": 21, "level": 8, "x": 400, "type": "elite", "title": "Livello 9 - Meta", "icon": "👹", "done": false, "active": false, "next": [], "image": "", "enemy": "capitano_esploratori" }
    ]
};
