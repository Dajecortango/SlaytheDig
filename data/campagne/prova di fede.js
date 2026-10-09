// Campagna "Nuova campagna".
// Il contenuto dopo "=" è JSON puro: niente funzioni, gli effetti sono descritti nei campi "effects"
// e interpretati da applyEffects() in js/game.js. È un file .js (e non .json) perché il gioco
// si apre con doppio click da file:// e il browser blocca fetch() di file locali.
// Nemici, oggetti, reliquie e maledizioni sono richiamati per id da data/libreria/.
window.CAMPAIGNS = window.CAMPAIGNS || {};
window.CAMPAIGNS["prova di fede"] = {
    "id": "prova di fede",
    "title": "Nuova campagna",
    "badge": "Nuova Campagna",
    "description": "",
    "coverImage": "",
    "introText": "",
    "heroes": ["ascadeo", "prometeo_dignitas"],
    "initialArmory": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "balsamo_curativo"],
    "challenges": {},
    "merchants": { "default": "" },
    "rests": { "default": "" },
    "treasures": {},
    "lootItems": null,
    "mapNodes": [
        { "id": 0, "level": 0, "x": 398, "type": "rest", "title": "Livello 1 - Scontro", "icon": "⛺", "done": false, "active": true, "next": [1], "image": "", "restId": "default" },
        { "id": 1, "level": 1, "x": 400, "type": "rest", "title": "Nuovo nodo", "icon": "⛺", "done": false, "active": false, "next": [], "image": "", "restId": "default" }
    ],
    "stories": {}
};
