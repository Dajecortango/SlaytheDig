// Maledizioni: punizioni delle sfide, condivise dalle campagne.
// Le sfide le richiamano per id nel campo "punishment".
// Il contenuto dopo "=" è JSON puro. Si modifica anche dall'editor delle campagne.
window.LIBRERIA = window.LIBRERIA || {};
window.LIBRERIA.maledizioni = {
    "15_ricompensa_monete": {
        "type": "curse",
        "name": "-15% ricompensa monete",
        "desc": "Monete future ridotte del 15%",
        "effects": [
            { "effect": "add_curse", "text": "Maledizione: -15% monete" }
        ]
    },
    "sbornia_pesante": {
        "type": "curse",
        "name": "Sbornia pesante",
        "desc": "-1 ai tiri attacco",
        "effects": [
            { "effect": "party_stat", "stat": "att_penalty", "val": 1 }
        ]
    },
    "maledetti_dai_popolani": {
        "type": "curse",
        "name": "Maledetti dai popolani",
        "desc": "-1 fede al party",
        "effects": [
            { "effect": "party_stat", "stat": "fth", "val": -1 }
        ]
    },
    "cattiva_memoria": {
        "type": "curse",
        "name": "Cattiva memoria",
        "desc": "-1 intelligenza al party",
        "effects": [
            { "effect": "party_stat", "stat": "int", "val": -1 }
        ]
    },
    "gelo_nelle_ossa": {
        "type": "curse",
        "name": "Gelo nelle ossa",
        "desc": "-1 a tutti i tiri per colpire del party finché non visiterete un'area di riposo",
        "effects": [
            { "effect": "add_curse", "text": "Gelo nelle ossa (-1 tiri per colpire)" },
            { "effect": "party_stat", "stat": "att_penalty", "val": 1 }
        ]
    },
    "rancore_del_mercante": {
        "type": "curse",
        "name": "Rancore del Mercante",
        "desc": "I mercanti futuri applicheranno un sovrapprezzo di 2 monete su ogni articolo",
        "effects": [
            { "effect": "add_curse", "text": "Rancore del Mercante (+2 monete prezzi)" }
        ]
    },
    "sacrilego": {
        "type": "curse",
        "name": "Sacrilego",
        "desc": "-1 Fede a tutti i membri del party",
        "effects": [
            { "effect": "add_curse", "text": "Sacrilego (-1 Fede)" },
            { "effect": "party_stat", "stat": "fth", "val": -1 }
        ]
    },
    "fede_inaridita": {
        "type": "curse",
        "name": "Fede Inaridita",
        "desc": "Durante le prove di fede tira due dadi e usa il risultato più basso",
        "effects": [
            { "effect": "add_curse", "text": "Fede Inaridita (Svantaggio prove Fede)" }
        ]
    },
    "presagio_di_morte": {
        "type": "curse",
        "name": "Presagio di Morte",
        "desc": "La Morte vi dà la caccia: aumenta tutti i danni subiti di 1",
        "effects": [
            { "effect": "add_curse", "text": "Presagio di Morte (+1 danno subito)" }
        ]
    },
    "tormento_mentale": {
        "type": "curse",
        "name": "Tormento Mentale",
        "desc": "-1 a Intelligenza a tutta la compagnia",
        "effects": [
            { "effect": "add_curse", "text": "Tormento Mentale (-1 Int)" },
            { "effect": "party_stat", "stat": "int", "val": -1 }
        ]
    },
    "ombra_sul_cuore": {
        "type": "curse",
        "name": "Ombra sul Cuore",
        "desc": "-1 a Fede a tutta la compagnia",
        "effects": [
            { "effect": "add_curse", "text": "Ombra sul Cuore (-1 Fede)" },
            { "effect": "party_stat", "stat": "fth", "val": -1 }
        ]
    }
};
