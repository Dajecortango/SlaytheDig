// Avventure: raggruppano le campagne in capitoli (menu "Nuova Partita" del gioco, pagina dell'avventura).
// Una campagna entra in un'avventura con "avventura" (id di qui) e "capitolo" (ordine nell'elenco).
// coverImage vuota = copertina del primo capitolo; le campagne senza avventura restano schede a sé.
// Il contenuto dopo "=" è JSON puro. Si modifica anche dall'editor delle campagne.
window.LIBRERIA = window.LIBRERIA || {};
window.LIBRERIA.avventure = {
    "caccia_alla_bestia": {
        "title": "Caccia alla Bestia",
        "badge": "Avventura",
        "description": "Il pellegrinaggio di Astarte attraverso terre sconosciute e rovine dimenticate, fino alle vette dove si nasconde la Bestia.",
        "coverImage": ""
    },
    "fredlos": {
        "dopo": "caccia_alla_bestia",
        "title": "Fredlös",
        "badge": "Avventura",
        "description": "Dall'Arce delle Storie di Aebeltoff al fiume Hemsil, alle porte di Svalbard e fino alla Bocca del Bianco: sulle tracce di Kesia, figlia di Fredlös l'Oppresso.",
        "coverImage": ""
    },
    "loch_ein": {
        "dopo": "fredlos",
        "title": "Loch Ein",
        "badge": "Avventura",
        "description": "Da Seistad alla conca di Loch Ein e giù, nelle viscere della Caduta dai Cieli, fino al Salone delle Risposte, dove splende l'Yrtite, e alla fuga dalla città che sprofonda.",
        "coverImage": ""
    }
};
