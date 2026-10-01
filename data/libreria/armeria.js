// Armeria: tutti gli oggetti (armi, armature, consumabili...), condivisi dalle campagne.
// Le campagne li richiamano per id in "initialArmory" e "lootItems".
// Il contenuto dopo "=" è JSON puro. Si modifica anche dall'editor delle campagne.
window.LIBRERIA = window.LIBRERIA || {};
window.LIBRERIA.armeria = {
    "spada": { "id": "spada", "name": "Spada", "str": 1, "desc": "+1 Forza" },
    "ascia": { "id": "ascia", "name": "Ascia", "dmg": 1, "desc": "+1 Danno" },
    "alabarda": { "id": "alabarda", "name": "Alabarda", "help_bonus_val": 1, "desc": "+1 Tiro Aiuto" },
    "scudo": { "id": "scudo", "name": "Scudo", "def_bonus": 1, "desc": "+1 Tiro Difesa" },
    "armatura_leggera": { "id": "armatura_leggera", "name": "Armatura leggera", "armor": 1, "desc": "+1 Punti Armatura" },
    "armatura_pesante": { "id": "armatura_pesante", "name": "Armatura pesante", "armor": 2, "att_penalty": 1, "desc": "+2 Punti Armatura, -1 Attacco" },
    "libro_fede": {
        "id": "libro_fede",
        "name": "Libro di fede",
        "fth": 1,
        "scaling": [
            { "stat": "armor", "per": "fth", "every": 3 }
        ],
        "desc": "+1 Fede; +1 Armatura ogni 3 Fede"
    },
    "tomo_conoscenza": {
        "id": "tomo_conoscenza",
        "name": "Tomo di conoscenza",
        "int": 1,
        "scaling": [
            { "stat": "help_bonus_val", "per": "int", "every": 3 }
        ],
        "desc": "+1 Intelligenza; +1 Aiuto ogni 3 Intelligenza"
    },
    "unguento": { "id": "unguento", "name": "Unguento lenitivo", "type": "consumable_heal", "heal_val": 2, "desc": "Consumabile: Cura 2 HP" },
    "spada_affilata": { "id": "spada_affilata", "name": "Spada affilata", "rarity": "raro", "str": 1, "dmg": 1, "desc": "+1 Forza, +1 Danno" },
    "ascia_pesante": { "id": "ascia_pesante", "name": "Ascia pesante", "rarity": "raro", "dmg": 2, "desc": "+2 Danni" },
    "armatura_leggera_loot": { "id": "armatura_leggera_loot", "name": "Armatura leggera", "rarity": "comune", "armor": 1, "desc": "+1 Armatura" },
    "armatura_pesante_loot": { "id": "armatura_pesante_loot", "name": "Armatura pesante", "rarity": "raro", "armor": 2, "att_penalty": 1, "desc": "+2 Armatura, -1 Tiro Attacco" },
    "pozione": { "id": "pozione", "name": "Pozione di guarigione", "rarity": "raro", "type": "consumable_full", "desc": "Consumabile: Recupera 100% HP" },
    "amuleto": { "id": "amuleto", "name": "Amuleto sacro", "rarity": "comune", "fth": 1, "desc": "+1 Fede" },
    "anello": { "id": "anello", "name": "Anello della concentrazione", "rarity": "comune", "int": 1, "desc": "+1 Intelligenza" },
    "scudo_pesante": { "id": "scudo_pesante", "name": "Scudo pesante", "rarity": "raro", "armor": 1, "def_bonus": 1, "desc": "+1 Armatura, +1 Tiro Difesa" },
    "pugnale_rapido": { "id": "pugnale_rapido", "name": "Pugnale Rapido", "rarity": "comune", "str": 1, "desc": "+1 Forza" },
    "ascia_taglialegna": { "id": "ascia_taglialegna", "name": "Ascia da Taglialegna", "rarity": "comune", "dmg": 1, "desc": "+1 Danno" },
    "bastone_rinforzato": { "id": "bastone_rinforzato", "name": "Bastone Rinforzato", "rarity": "comune", "help_bonus_val": 1, "desc": "+1 Tiro Aiuto" },
    "scudo_legno": { "id": "scudo_legno", "name": "Scudo Tondo di Legno", "rarity": "comune", "def_bonus": 1, "desc": "+1 Tiro Difesa" },
    "corazza_cuoio": { "id": "corazza_cuoio", "name": "Corazza di Cuoio Bollito", "rarity": "comune", "armor": 1, "desc": "+1 Armatura" },
    "amuleto_legno_santo": {
        "id": "amuleto_legno_santo",
        "name": "Amuleto di Legno Santo",
        "rarity": "comune",
        "fth": 1,
        "scaling": [
            { "stat": "armor", "per": "fth", "every": 3 }
        ],
        "desc": "+1 Fede; +1 Armatura ogni 3 Fede"
    },
    "taccuino_cartografo": {
        "id": "taccuino_cartografo",
        "name": "Taccuino del Cartografo",
        "rarity": "comune",
        "int": 1,
        "scaling": [
            { "stat": "help_bonus_val", "per": "int", "every": 3 }
        ],
        "desc": "+1 Intelligenza; +1 Aiuto ogni 3 Intelligenza"
    },
    "balsamo_curativo": { "id": "balsamo_curativo", "name": "Balsamo Lenitivo", "rarity": "comune", "type": "consumable_heal", "heal_val": 2, "desc": "Consumabile: Cura 2 HP" },
    "spada_norgrad": { "id": "spada_norgrad", "name": "Spada di Norgrad", "rarity": "raro", "str": 1, "dmg": 1, "desc": "+1 Forza, +1 Danno" },
    "alabarda_guardia": {
        "id": "alabarda_guardia",
        "name": "Alabarda da Guardia",
        "rarity": "raro",
        "help_bonus_val": 1,
        "scaling": [
            { "stat": "str", "per": "int", "every": 3 }
        ],
        "desc": "+1 Aiuto; +1 Forza ogni 3 Intelligenza"
    },
    "mannaia_pesante": { "id": "mannaia_pesante", "name": "Mannaia Pesante", "rarity": "raro", "dmg": 2, "att_penalty": 1, "desc": "+2 Danni, -1 al tiro per Colpire" },
    "scudo_ferro": { "id": "scudo_ferro", "name": "Scudo Rinforzato in Ferro", "rarity": "raro", "armor": 1, "def_bonus": 1, "desc": "+1 Armatura, +1 Tiro Difesa" },
    "corazza_scaglie": { "id": "corazza_scaglie", "name": "Corazza a Scaglie", "rarity": "raro", "armor": 2, "att_penalty": 1, "desc": "+2 Armatura, -1 al tiro per Colpire" },
    "tomo_proibito": {
        "id": "tomo_proibito",
        "name": "Tomo della Conoscenza Proibita",
        "rarity": "raro",
        "int": 1,
        "scaling": [
            { "stat": "dmg", "per": "int", "every": 2 }
        ],
        "desc": "+1 Intelligenza; +1 Danno ogni 2 Intelligenza"
    },
    "reliquiario_tascabile": {
        "id": "reliquiario_tascabile",
        "name": "Reliquiario Tascabile",
        "rarity": "raro",
        "fth": 1,
        "scaling": [
            { "stat": "armor", "per": "fth", "every": 2 }
        ],
        "desc": "+1 Fede; +1 Armatura ogni 2 Fede"
    },
    "pozione_rigenerazione": { "id": "pozione_rigenerazione", "name": "Pozione di Rigenerazione", "rarity": "raro", "type": "consumable_full", "desc": "Consumabile: Ripristina 100% HP" },
    "unguento_fortificante": { "id": "unguento_fortificante", "name": "Unguento Fortificante", "rarity": "raro", "type": "consumable_heal", "heal_val": 3, "desc": "Consumabile: Cura 3 HP" },
    "lama_acciaio_lunare": { "id": "lama_acciaio_lunare", "name": "Lama d'Acciaio Lunare", "rarity": "epico", "str": 2, "dmg": 1, "desc": "+2 Forza, +1 Danno" },
    "martello_breccia": { "id": "martello_breccia", "name": "Martello della Breccia", "rarity": "epico", "dmg": 3, "att_penalty": 1, "desc": "+3 Danni, -1 al tiro per Colpire" },
    "gorgiera_veterano": { "id": "gorgiera_veterano", "name": "Gorgiera del Veterano", "rarity": "epico", "armor": 2, "def_bonus": 1, "desc": "+2 Armatura, +1 Tiro Difesa" },
    "corazza_piastre_leone": { "id": "corazza_piastre_leone", "name": "Corazza a Piastre del Leone", "rarity": "epico", "armor": 3, "att_penalty": 1, "desc": "+3 Armatura, -1 al tiro per Colpire" },
    "cappa_sussurri": {
        "id": "cappa_sussurri",
        "name": "Cappa dei Sussurri Antichi",
        "rarity": "epico",
        "fth": 1,
        "int": 1,
        "scaling": [
            { "stat": "def_bonus", "per": "fth", "every": 2 },
            { "stat": "help_bonus_val", "per": "int", "every": 2 }
        ],
        "desc": "+1 Fede, +1 Intelligenza; +1 Difesa ogni 2 Fede; +1 Aiuto ogni 2 Intelligenza"
    },
    "simbolo_jag_antar": {
        "id": "simbolo_jag_antar",
        "name": "Simbolo Primordiale di Jag Antar",
        "rarity": "epico",
        "fth": 2,
        "scaling": [
            { "stat": "str", "per": "fth", "every": 2 }
        ],
        "desc": "+2 Fede; +1 Forza ogni 2 Fede"
    },
    "elisir_sangue_vivo": { "id": "elisir_sangue_vivo", "name": "Elisir di Sangue Vivo", "rarity": "epico", "type": "consumable_full", "desc": "Consumabile: Ripristina tutti gli HP" },
    "ankh_pellegrino": {
        "id": "ankh_pellegrino",
        "name": "Ankh del Pellegrino",
        "rarity": "comune",
        "scaling": [
            { "stat": "def_bonus", "per": "fth", "every": 2 }
        ],
        "desc": "+1 Difesa ogni 2 Fede"
    },
    "bastone_eremita": {
        "id": "bastone_eremita",
        "name": "Bastone dell'Eremita",
        "rarity": "comune",
        "scaling": [
            { "stat": "help_bonus_val", "per": "int", "every": 2 }
        ],
        "desc": "+1 Aiuto ogni 2 Intelligenza"
    },
    "martello_consacrato": {
        "id": "martello_consacrato",
        "name": "Martello Consacrato",
        "rarity": "raro",
        "dmg": 1,
        "scaling": [
            { "stat": "dmg", "per": "fth", "every": 3 }
        ],
        "desc": "+1 Danno; +1 Danno ogni 3 Fede"
    },
    "brigantina_benedetta": {
        "id": "brigantina_benedetta",
        "name": "Brigantina Benedetta",
        "rarity": "raro",
        "armor": 1,
        "scaling": [
            { "stat": "armor", "per": "fth", "every": 3 }
        ],
        "desc": "+1 Armatura; +1 Armatura ogni 3 Fede"
    },
    "stocco_duellante": {
        "id": "stocco_duellante",
        "name": "Stocco del Duellante",
        "rarity": "raro",
        "scaling": [
            { "stat": "str", "per": "int", "every": 2, "max": 3 }
        ],
        "desc": "+1 Forza ogni 2 Intelligenza (max +3)"
    },
    "scettro_savio": {
        "id": "scettro_savio",
        "name": "Scettro del Savio",
        "rarity": "epico",
        "int": 1,
        "scaling": [
            { "stat": "dmg", "per": "int", "every": 2 }
        ],
        "desc": "+1 Intelligenza; +1 Danno ogni 2 Intelligenza"
    },
    "corona_martire": {
        "id": "corona_martire",
        "name": "Corona del Martire",
        "rarity": "epico",
        "fth": 1,
        "scaling": [
            { "stat": "str", "per": "fth", "every": 2 },
            { "stat": "def_bonus", "per": "fth", "every": 3 }
        ],
        "desc": "+1 Fede; +1 Forza ogni 2 Fede; +1 Difesa ogni 3 Fede"
    }
};

// Bottino delle campagne con "lootItems": null
window.LIBRERIA.lootPredefinito = ["spada_affilata", "ascia_pesante", "armatura_leggera_loot", "armatura_pesante_loot", "pozione", "amuleto", "anello", "scudo_pesante"];
