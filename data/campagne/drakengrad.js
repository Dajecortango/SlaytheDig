// Campagna "Il percorso per il Drakengrad".
// Il contenuto dopo "=" è JSON puro: niente funzioni, gli effetti sono descritti nei campi "effects"
// e interpretati da applyEffects() in js/game.js. È un file .js (e non .json) perché il gioco
// si apre con doppio click da file:// e il browser blocca fetch() di file locali.
// Nemici, oggetti, reliquie e maledizioni sono richiamati per id da data/libreria/.
// Campagna procedurale ("procedurale"): la mappa si genera a ogni partita in js/procedurale.js
// riciclando nemici, sfide, testi e immagini delle altre campagne; qui restano vuote.
window.CAMPAIGNS = window.CAMPAIGNS || {};
window.CAMPAIGNS["drakengrad"] = {
    "id": "drakengrad",
    "title": "Il percorso per il Drakengrad",
    "badge": "Procedurale",
    "description": "Una via sempre diversa verso il Drakengrad: la mappa nasce a ogni partita e ogni passo è più duro del precedente.",
    "coverImage": "immagini/sentiero_rune.jpg",
    "introText": "Nessuna mappa conosce la strada per il Drakengrad. Chi l'ha percorsa racconta di sentieri che cambiano a ogni stagione, di bestie e briganti sempre più feroci man mano che ci si avvicina alla meta. Stringete le cinghie, compagni: ogni passo sarà più duro del precedente.",
    "procedurale": { "livelli": 16 },
    "heroes": ["icaro", "astarte", "ascadeo", "dioforo", "curio_dignitas", "prometeo_dignitas", "temistocle_dignitas", "caino_dignitas", "ottavio_dignitas"],
    "initialArmory": ["pugnale_rapido", "ascia_taglialegna", "bastone_rinforzato", "scudo_legno", "corazza_cuoio", "amuleto_legno_santo", "taccuino_cartografo", "balsamo_curativo"],
    "challenges": {},
    "merchants": {},
    "rests": {},
    "treasures": {},
    "lootItems": null,
    "mapNodes": []
};
