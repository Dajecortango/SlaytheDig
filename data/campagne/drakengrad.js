// Campagna "Il percorso per il Drakengrad".
// Il contenuto dopo "=" è JSON puro: niente funzioni, gli effetti sono descritti nei campi "effects"
// e interpretati da applyEffects() in js/game.js. È un file .js (e non .json) perché il gioco
// si apre con doppio click da file:// e il browser blocca fetch() di file locali.
// Nemici, oggetti, reliquie e maledizioni sono richiamati per id da data/libreria/.
window.CAMPAIGNS = window.CAMPAIGNS || {};
window.CAMPAIGNS["drakengrad"] = {
    "id": "drakengrad",
    "title": "Il percorso per il Drakengrad",
    "badge": "Procedurale",
    "description": "Una prova sempre diversa per meritare il Drakengrad: la strada nasce a ogni partita e ogni passo è più duro del precedente.",
    "coverImage": "immagini/sentiero_rune.webp",
    "introText": "Il Drakengrad non si raggiunge a piedi: è la sala dove i Dignitas più degni banchettano dopo la morte, dentro i rami di Yr-Drazul, in attesa della prossima Collisione. Per sedere a quelle tavole bisogna meritarlo, e la prova cambia per ognuno: sentieri che il Caos rimescola a ogni stagione, bestie e briganti sempre più feroci a ogni passo. Stringete le cinghie, compagni. Vittoria o Drakengrad.",
    "procedurale": { "livelli": 16 },
    "heroes": ["icaro", "astarte", "ascadeo", "dioforo", "curio_dignitas", "prometeo_dignitas", "temistocle_dignitas", "caino_dignitas", "ottavio_dignitas", "alastorta_dignitas"],
    "initialArmory": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "balsamo_curativo"],
    "challenges": {},
    "merchants": {},
    "rests": {},
    "treasures": {},
    "lootItems": null,
    "mapNodes": []
};
