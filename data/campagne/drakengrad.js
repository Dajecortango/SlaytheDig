// Campagna "Il percorso per il Drakengrad".
// Il contenuto dopo "=" è JSON puro: niente funzioni, gli effetti sono descritti nei campi "effects"
// e interpretati da applyEffects() in js/game.js. È un file .js (e non .json) perché il gioco
// si apre con doppio click da file:// e il browser blocca fetch() di file locali.
// Nemici, oggetti, reliquie e maledizioni sono richiamati per id da data/libreria/.
window.CAMPAIGNS = window.CAMPAIGNS || {};
window.CAMPAIGNS["drakengrad"] = {
    "id": "drakengrad",
    "title": "Il percorso per il Drakengrad",
    "difficolta": { "vittoriaMin": 28, "vittoriaMax": 42 },
    "badge": "Procedurale",
    "description": "Un dungeon sempre diverso per meritare il Drakengrad: tre piani che nascono a ogni partita, un guardiano in fondo a ognuno e nemici più forti a ogni stanza. Si scende in quattro.",
    "coverImage": "immagini/sentiero_rune.webp",
    "introText": "Il Drakengrad non si raggiunge a piedi: è la sala dove i Dignitas più degni banchettano dopo la morte, dentro i rami di Yr-Drazul, in attesa della prossima Collisione. Per sedere a quelle tavole bisogna meritarlo, e la prova cambia per ognuno: sentieri che il Caos rimescola a ogni stagione, bestie e briganti sempre più feroci a ogni passo. Stringete le cinghie, compagni. Vittoria o Drakengrad.",
    "procedurale": { "piani": 3, "stanze": 4 },
    "sinergie": true,
    "eroiDopo": { "caccia_alla_bestia": ["icaro", "astarte", "dioforo", "ascadeo"], "fredlos": ["zeno", "aiace_dignitas", "aurelio_dignitas", "enea_dignitas"], "loch_ein": ["ofelia_dignitas", "pandora_dignitas", "pancrazio_dignitas", "alastorta_dignitas"] },
    "minEroi": 4,
    "maxEroi": 4,
    "heroes": ["curio_dignitas", "prometeo_dignitas", "temistocle_dignitas", "caino_dignitas", "ottavio_dignitas", "icaro", "astarte", "dioforo", "ascadeo", "zeno", "aiace_dignitas", "aurelio_dignitas", "enea_dignitas", "ofelia_dignitas", "pandora_dignitas", "pancrazio_dignitas", "alastorta_dignitas"],
    "initialArmory": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "balsamo_curativo", "stilo_da_battaglia", "turibolo_ferrato", "rosario_del_pellegrino"],
    "challenges": {},
    "merchants": {},
    "rests": {},
    "treasures": {},
    "lootItems": null,
    "mapNodes": [],
    "stories": {}
};
