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
    },
    "morsa_assiderante": {
        "type": "curse",
        "name": "Morsa Assiderante",
        "desc": "-1 Forza a tutti",
        "effects": [
            { "effect": "add_curse", "text": "Morsa Assiderante (-1 Forza)" },
            { "effect": "party_stat", "stat": "str", "val": -1 }
        ]
    },
    "gelo_spirituale": {
        "type": "curse",
        "name": "Gelo Spirituale",
        "desc": "-1 Fede a tutti",
        "effects": [
            { "effect": "add_curse", "text": "Gelo Spirituale (-1 Fede)" },
            { "effect": "party_stat", "stat": "fth", "val": -1 }
        ]
    },
    "vertigine_lacerante": {
        "type": "curse",
        "name": "Vertigine Lacerante",
        "desc": "-1 ai tiri per colpire",
        "effects": [
            { "effect": "add_curse", "text": "Vertigine Lacerante (-1 tiri per colpire)" },
            { "effect": "party_stat", "stat": "att_penalty", "val": 1 }
        ]
    },
    "paranoia_dell_ombra": {
        "type": "curse",
        "name": "Paranoia dell'Ombra",
        "desc": "1 danno a tutti e -1 Intelligenza a tutti",
        "effects": [
            { "effect": "add_curse", "text": "Paranoia dell'Ombra (-1 Int)" },
            { "effect": "party_damage", "val": 1 },
            { "effect": "party_stat", "stat": "int", "val": -1 }
        ]
    },
    "maledizione_dell_ignoranza": {
        "type": "curse",
        "name": "Maledizione dell'Ignoranza",
        "desc": "-1 Intelligenza a tutti",
        "effects": [
            { "effect": "add_curse", "text": "Maledizione dell'Ignoranza (-1 Int)" },
            { "effect": "party_stat", "stat": "int", "val": -1 }
        ]
    },
    "anima_bruciata": {
        "type": "curse",
        "name": "Anima Bruciata",
        "desc": "1 danno a tutti e -1 Fede a tutti",
        "effects": [
            { "effect": "add_curse", "text": "Anima Bruciata (-1 Fede)" },
            { "effect": "party_damage", "val": 1 },
            { "effect": "party_stat", "stat": "fth", "val": -1 }
        ]
    },
    "terrore_riflesso": {
        "type": "curse",
        "name": "Terrore Riflesso",
        "desc": "-1 Fede e -1 Intelligenza a tutti",
        "effects": [
            { "effect": "add_curse", "text": "Terrore Riflesso (-1 Fede, -1 Int)" },
            { "effect": "party_stat", "stat": "fth", "val": -1 },
            { "effect": "party_stat", "stat": "int", "val": -1 }
        ]
    },
    "venti_sferzanti": {
        "type": "curse",
        "name": "Venti Sferzanti",
        "desc": "1 danno a tutti e -10 monete",
        "effects": [
            { "effect": "add_curse", "text": "Venti Sferzanti (risorse perdute)" },
            { "effect": "party_damage", "val": 1 },
            { "effect": "coins", "val": -10 }
        ]
    },
    "maledizione_congelante": {
        "type": "curse",
        "name": "Maledizione Congelante",
        "desc": "-1 Forza a tutti",
        "effects": [
            { "effect": "add_curse", "text": "Maledizione Congelante (-1 Forza)" },
            { "effect": "party_stat", "stat": "str", "val": -1 }
        ]
    }
};
