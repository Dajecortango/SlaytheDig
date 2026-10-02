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
    "coverImage": "immagini/inizio_campagna.jpg",
    "introText": "Aprite gli occhi. Il soffitto è di roccia irregolare, umida e gocciolante. Una luce fioca filtra dall'esterno, accompagnata dal rumore di un martellare persistente di un fabbro dentro il tuo cranio. Hai un sapore di birra torbida in bocca. Intorno a te, sparsi sul pavimento di pietra, ci sono i tuoi familiari, chi sta abbracciando un barile vuoto urlando frasi sconnesse su chissà quale cugina, chi ha il gambesone infilato al contrario e non riesce a toglierlo... Fuori dalla grotta c'è solo nebbia e il ringhio lontano di qualcosa che speri vivamente non siano lupi affamati.",
    "heroes": ["curio_dignitas", "prometeo_dignitas", "temistocle_dignitas", "caino_dignitas", "ottavio_dignitas"],
    "initialArmory": ["spada", "ascia", "alabarda", "scudo", "armatura_leggera", "armatura_pesante", "libro_fede", "tomo_conoscenza", "unguento"],
    "challenges": {
        "fede7": {
            "title": "Un piccolo santuario",
            "desc": "Una nicchia nella roccia ospita una statuetta sacra.",
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
            "desc": "Strane impronte indicano una lotta o qualcos'altro...",
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
            "desc": "Popolani in processione piangono i caduti verso una fossa comune.",
            "ignoreText": "Non avete tempo da perdere, affrettate il passo.",
            "successText": "Vi raccogliete in silenzio e aiutate a posare un caduto. Ricevete la loro benedizione.",
            "failText": "I fumi e l'odore nauseabondo vi respingono.",
            "stat": "fth",
            "cd": 7,
            "reward": "benedetti_da_jag_antar",
            "punishment": "maledetti_dai_popolani"
        },
        "intel8": {
            "title": "Ricordi della marcia",
            "desc": "Solchi di carri pesanti. Saprete capire quale direzione hanno preso?",
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
            "desc": "Trovate il corpo di un commilitone abbandonato.",
            "ignoreText": "Troppo tardi, lasciate il corpo dove si trova.",
            "successText": "Scavate una fossa degna e placate la vostra coscienza.",
            "failText": "La paura dell'adunata vi fa desistere a metà dell'opera.",
            "stat": "fth",
            "cd": 8
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
    "treasures": { "1": "Sulle rive del torrente ritrovate i vostri fagotti abbandonati.", "2": "Un forziere abbandonato dai fuggiaschi sulle sponde del fiume.", "3": "Il cadavere di un commilitone stringe tra le mani un manufatto prezioso." },
    "lootItems": null,
    "mapNodes": [
        { "id": 0, "level": 0, "x": 400, "type": "combat", "enemy": "cinghiali", "title": "Livello 1 - Scontro 1", "icon": "🗡️", "done": false, "active": true, "next": [1, 2] },
        { "id": 1, "level": 1, "x": 300, "type": "challenge", "challengeId": "fede7", "title": "Livello 2 - Sfida 1", "icon": "❓", "done": false, "active": false, "next": [3, 4], "image": "immagini/santuario.jpg" },
        { "id": 2, "level": 1, "x": 500, "type": "challenge", "challengeId": "intel7", "title": "Livello 2 - Sfida 2", "icon": "❓", "done": false, "active": false, "next": [4, 5], "image": "immagini/tracce_fango.jpg" },
        { "id": 3, "level": 2, "x": 200, "type": "treasure", "treasureId": 1, "title": "Livello 3 - Tesoro 1", "icon": "💎", "done": false, "active": false, "next": [6, 7], "image": "immagini/tesoro_fiume.jpg" },
        { "id": 4, "level": 2, "x": 400, "type": "combat", "enemy": "disertori_affamati", "title": "Livello 3 - Scontro 2", "icon": "🗡️", "done": false, "active": false, "next": [7, 8] },
        { "id": 5, "level": 2, "x": 600, "type": "merchant", "merchantId": 1, "title": "Livello 3 - Mercante 1", "icon": "🪙", "done": false, "active": false, "next": [8, 9], "image": "immagini/mercante_viandante.jpg" },
        { "id": 6, "level": 3, "x": 180, "type": "merchant", "merchantId": 2, "title": "Livello 4 - Mercante 2", "icon": "🪙", "done": false, "active": false, "next": [10], "image": "immagini/mercante_viandante.jpg" },
        { "id": 7, "level": 3, "x": 340, "type": "combat", "enemy": "lupi", "title": "Livello 4 - Scontro 3", "icon": "🗡️", "done": false, "active": false, "next": [10, 11] },
        { "id": 8, "level": 3, "x": 500, "type": "rest", "restId": 1, "title": "Livello 4 - Riposo 1", "icon": "⛺", "done": false, "active": false, "next": [11, 12], "image": "immagini/riposo_accampamento.jpg" },
        { "id": 9, "level": 3, "x": 620, "type": "treasure", "treasureId": 2, "title": "Livello 4 - Tesoro 2", "icon": "💎", "done": false, "active": false, "next": [12], "image": "immagini/tesoro_fiume.jpg" },
        { "id": 10, "level": 4, "x": 250, "type": "rest", "restId": 2, "title": "Livello 5 - Riposo 2", "icon": "⛺", "done": false, "active": false, "next": [13], "image": "immagini/riposo_accampamento.jpg" },
        { "id": 11, "level": 4, "x": 400, "type": "challenge", "challengeId": "fede7_2", "title": "Livello 5 - Sfida 3", "icon": "❓", "done": false, "active": false, "next": [13, 14], "image": "immagini/lamenti_nebbia.jpg" },
        { "id": 12, "level": 4, "x": 550, "type": "combat", "enemy": "banditi", "title": "Livello 5 - Scontro 4", "icon": "⚔️", "done": false, "active": false, "next": [14, 15] },
        { "id": 13, "level": 5, "x": 260, "type": "elite", "enemy": "sergente", "title": "Livello 6 - Scontro Elite 1", "icon": "👹", "done": false, "active": false, "next": [16] },
        { "id": 14, "level": 5, "x": 400, "type": "treasure", "treasureId": 3, "title": "Livello 6 - Tesoro 3", "icon": "💎", "done": false, "active": false, "next": [17, 18], "image": "immagini/tesoro_cadavere.jpg" },
        { "id": 15, "level": 5, "x": 540, "type": "challenge", "challengeId": "intel8", "title": "Livello 6 - Sfida 4", "icon": "❓", "done": false, "active": false, "next": [19, 18], "image": "immagini/ricordi_marcia.jpg" },
        { "id": 16, "level": 6, "x": 180, "type": "merchant", "merchantId": 3, "title": "Livello 7 - Mercante 3", "icon": "🪙", "done": false, "active": false, "next": [20], "image": "immagini/mercante_viandante.jpg" },
        { "id": 17, "level": 6, "x": 340, "type": "challenge", "challengeId": "fede8", "title": "Livello 7 - Sfida 5", "icon": "❓", "done": false, "active": false, "next": [20], "image": "immagini/onore_caduti.jpg" },
        { "id": 18, "level": 6, "x": 500, "type": "combat", "enemy": "profanatori", "title": "Livello 7 - Scontro 5", "icon": "🗡️", "done": false, "active": false, "next": [20] },
        { "id": 19, "level": 6, "x": 620, "type": "merchant", "merchantId": 4, "title": "Livello 7 - Mercante 4", "icon": "🪙", "done": false, "active": false, "next": [20], "image": "immagini/mercante_viandante.jpg" },
        { "id": 20, "level": 7, "x": 400, "type": "rest", "restId": 3, "title": "Livello 8 - Riposo 3", "icon": "⛺", "done": false, "active": false, "next": [21], "image": "immagini/riposo_accampamento.jpg" },
        { "id": 21, "level": 8, "x": 400, "type": "challenge", "challengeId": "scelta_finale", "title": "Livello 9 - Meta", "icon": "👑", "done": false, "active": false, "next": [], "image": "immagini/accampamento_arrivo.jpg" }
    ]
};
