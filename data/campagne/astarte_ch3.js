// Campagna " Caccia alla Bestia - Capitolo Tre".
// Il contenuto dopo "=" è JSON puro: niente funzioni, gli effetti sono descritti nei campi "effects"
// e interpretati da applyEffects() in js/game.js. È un file .js (e non .json) perché il gioco
// si apre con doppio click da file:// e il browser blocca fetch() di file locali.
// Nemici, oggetti, reliquie e maledizioni sono richiamati per id da data/libreria/.
window.CAMPAIGNS = window.CAMPAIGNS || {};
window.CAMPAIGNS["astarte_ch3"] = {
    "id": "astarte_ch3",
    "title": " Caccia alla Bestia - Capitolo Tre",
    "badge": "Nuova Campagna",
    "description": "",
    "coverImage": "",
    "introText": "",
    "heroes": [],
    "initialArmory": [],
    "challenges": {},
    "merchants": { "default": "" },
    "rests": { "default": "" },
    "treasures": {},
    "lootItems": null,
    "mapNodes": [
        { "id": 0, "level": 0, "x": 201, "type": "combat", "enemy": "", "title": "Livello 1 - Scontro", "icon": "🗡️", "done": false, "active": true, "next": [3], "image": "" },
        { "id": 1, "level": 0, "x": 428, "type": "combat", "enemy": "", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": true, "next": [4], "image": "" },
        { "id": 2, "level": 0, "x": 646, "type": "combat", "enemy": "", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": true, "next": [5], "image": "" },
        { "id": 3, "level": 1, "x": 239, "type": "combat", "enemy": "", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [6], "image": "" },
        { "id": 4, "level": 1, "x": 428, "type": "combat", "enemy": "", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [10], "image": "" },
        { "id": 5, "level": 1, "x": 608, "type": "combat", "enemy": "", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [7], "image": "" },
        { "id": 6, "level": 2, "x": 296, "type": "challenge", "title": "Nuovo nodo", "icon": "❓", "done": false, "active": false, "next": [8, 12], "image": "", "challengeId": "" },
        { "id": 7, "level": 2, "x": 554, "type": "challenge", "title": "Nuovo nodo", "icon": "❓", "done": false, "active": false, "next": [12, 11], "image": "", "challengeId": "" },
        { "id": 8, "level": 3, "x": 299, "type": "combat", "enemy": "", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [9], "image": "" },
        { "id": 9, "level": 4, "x": 280, "type": "elite", "enemy": "", "title": "Nuovo nodo", "icon": "👹", "done": false, "active": false, "next": [16, 19], "image": "" },
        { "id": 10, "level": 2, "x": 429, "type": "combat", "enemy": "", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [12], "image": "" },
        { "id": 11, "level": 3, "x": 579, "type": "merchant", "title": "Nuovo nodo", "icon": "🪙", "done": false, "active": false, "next": [13], "image": "", "merchantId": "default" },
        { "id": 12, "level": 3, "x": 430, "type": "elite", "enemy": "", "title": "Nuovo nodo", "icon": "👹", "done": false, "active": false, "next": [15, 18], "image": "" },
        { "id": 13, "level": 4, "x": 604, "type": "combat", "enemy": "", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [17, 20], "image": "" },
        { "id": 14, "level": 6, "x": 333, "type": "challenge", "title": "Nuovo nodo", "icon": "❓", "done": false, "active": false, "next": [24], "image": "", "challengeId": "" },
        { "id": 15, "level": 4, "x": 381, "type": "rest", "title": "Nuovo nodo", "icon": "⛺", "done": false, "active": false, "next": [19], "image": "", "restId": "default" },
        { "id": 16, "level": 5, "x": 258, "type": "rest", "title": "Nuovo nodo", "icon": "⛺", "done": false, "active": false, "next": [14], "image": "", "restId": "default" },
        { "id": 17, "level": 5, "x": 623, "type": "elite", "enemy": "", "title": "Nuovo nodo", "icon": "👹", "done": false, "active": false, "next": [23], "image": "" },
        { "id": 18, "level": 4, "x": 484, "type": "merchant", "title": "Nuovo nodo", "icon": "🪙", "done": false, "active": false, "next": [20], "image": "", "merchantId": "default" },
        { "id": 19, "level": 5, "x": 359, "type": "combat", "enemy": "", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [22], "image": "" },
        { "id": 20, "level": 5, "x": 504, "type": "challenge", "title": "Nuovo nodo", "icon": "❓", "done": false, "active": false, "next": [22], "image": "", "challengeId": "" },
        { "id": 21, "level": 8, "x": 379, "type": "elite", "enemy": "", "title": "Nuovo nodo", "icon": "👹", "done": false, "active": false, "next": [25], "image": "" },
        { "id": 22, "level": 6, "x": 441, "type": "combat", "enemy": "", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [24], "image": "" },
        { "id": 23, "level": 6, "x": 555, "type": "rest", "title": "Nuovo nodo", "icon": "⛺", "done": false, "active": false, "next": [24], "image": "", "restId": "default" },
        { "id": 24, "level": 7, "x": 443, "type": "story", "title": "Nuovo nodo", "icon": "📜", "done": false, "active": false, "next": [21, 26], "image": "", "storyId": "trama_24" },
        { "id": 25, "level": 9, "x": 397, "type": "rest", "title": "Nuovo nodo", "icon": "⛺", "done": false, "active": false, "next": [28, 29], "image": "", "restId": "default" },
        { "id": 26, "level": 8, "x": 497, "type": "combat", "enemy": "", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [27], "image": "" },
        { "id": 27, "level": 9, "x": 480, "type": "merchant", "title": "Nuovo nodo", "icon": "🪙", "done": false, "active": false, "next": [29, 31], "image": "", "merchantId": "default" },
        { "id": 28, "level": 10, "x": 348, "type": "combat", "enemy": "", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [32], "image": "" },
        { "id": 29, "level": 10, "x": 443, "type": "combat", "enemy": "", "title": "Nuovo nodo", "icon": "🗡️", "done": false, "active": false, "next": [32, 33], "image": "" },
        { "id": 30, "level": 12, "x": 441, "type": "rest", "title": "Nuovo nodo", "icon": "⛺", "done": false, "active": false, "next": [34], "image": "", "restId": "default" },
        { "id": 31, "level": 10, "x": 529, "type": "rest", "title": "Nuovo nodo", "icon": "⛺", "done": false, "active": false, "next": [33], "image": "", "restId": "default" },
        { "id": 32, "level": 11, "x": 387, "type": "elite", "enemy": "", "title": "Nuovo nodo", "icon": "👹", "done": false, "active": false, "next": [30], "image": "" },
        { "id": 33, "level": 11, "x": 490, "type": "elite", "enemy": "", "title": "Nuovo nodo", "icon": "👹", "done": false, "active": false, "next": [30], "image": "" },
        { "id": 34, "level": 13, "x": 444, "type": "captain", "title": "Nuovo nodo", "icon": "👑", "done": false, "active": false, "next": [], "image": "" }
    ],
    "stories": {
        "trama_24": { "title": "Nuovo nodo", "text": "" }
    }
};
