// Reliquie: ricompense delle sfide, condivise dalle campagne.
// Le sfide le richiamano per id nel campo "reward". Molte reliquie hanno un effetto
// scritto nel codice e riconosciuto per id (hasRelic('id')): il nome si può cambiare, la chiave no.
// Il contenuto dopo "=" è JSON puro. Si modifica anche dall'editor delle campagne.
window.LIBRERIA = window.LIBRERIA || {};
window.LIBRERIA.reliquie = {
    "anello_d_arvale": {
        "type": "relic",
        "name": "Anello d'Arvale",
        "desc": "+1 fede a tutti",
        "effects": [
            { "effect": "party_stat", "stat": "fth", "val": 1 }
        ]
    },
    "armatura_d_ordinanza": {
        "type": "relic",
        "name": "Armatura d'ordinanza",
        "desc": "+1 HP max a tutti",
        "effects": [
            { "effect": "party_max_hp", "val": 1 }
        ]
    },
    "benedetti_da_jag_antar": {
        "type": "relic",
        "name": "Benedetti da Jag Antar",
        "desc": "+1 ai tiri di attacco",
        "effects": [
            { "effect": "party_stat", "stat": "att_bonus", "val": 1 }
        ]
    },
    "mappa_della_regione": {
        "type": "relic",
        "name": "Mappa della regione",
        "desc": "+1 intelligenza al party",
        "effects": [
            { "effect": "party_stat", "stat": "int", "val": 1 }
        ]
    },
    "corno_antico": { "type": "relic", "name": "Corno dell'Esodo", "desc": "Durante il terzo turno tutti gli eroi ottengono +1 al danno" },
    "lasciapassare_mercantile": { "type": "relic", "name": "Lasciapassare mercantile", "desc": "Gli oggetti dai mercanti sono scontati di 3 monete" },
    "pietra_del_focolare": { "type": "relic", "name": "Pietra del focolare", "desc": "Durante il riposo rimuove una maledizione casuale" },
    "frammento_di_matrice": { "type": "relic", "name": "Fortuna degli Stolti", "desc": "La prossima sfida fallita diventa un successo, poi si rompe" },
    "dente_del_grande_lupo": { "type": "relic", "name": "Dente del grande lupo", "desc": "Dopo ogni scontro l'eroe con meno HP recupera 1 HP" },
    "frammento_di_yr_drazul": { "type": "relic", "name": "Bussola dell'Occhio Cieco", "desc": "+1 a tutti i tiri di dado" },
    "favore_di_valgoren": { "type": "relic", "name": "Favore di Valgoren", "desc": "Quando un eroe recupera HP, cura 1 HP ad un altro eroe casuale" },
    "idolo_del_cacciatore": { "type": "relic", "name": "Idolo del cacciatore", "desc": "+1 al danno durante gli scontri elite" },
    "occhio_del_corvo": { "type": "relic", "name": "Calma del Margine", "desc": "Diminuisce di 1 la statistica attacco dei mostri" },
    "anello_del_giuramento": { "type": "relic", "name": "Benedizione del Caos", "desc": "+3 al prossimo tiro di dado, poi la reliquia si rompe" },
    "marchio_di_jag_antar": { "type": "relic", "name": "Marchio di Jag Antar", "desc": "Se un eroe viene ridotto a 0 HP, rimane a 1 HP, poi si rompe" },
    "sigillo_runico": { "type": "relic", "name": "Sigillo runico", "desc": "+2 ai prossimi 2 tiri di dado, poi si rompe" },
    "lanterna_dei_morti": {
        "type": "relic",
        "name": "Lanterna dei morti",
        "desc": "+1 permanente alla caratteristica Fede di tutti gli eroi",
        "effects": [
            { "effect": "party_stat", "stat": "fth", "val": 1 }
        ]
    },
    "stendardo_da_battaglia": { "type": "relic", "name": "Stendardo da battaglia", "desc": "+1 al tiro per colpire nel primo round di ogni scontro" },
    "zanna_del_leone_bianco": { "type": "relic", "name": "Zanna del leone bianco", "desc": "+2 danni nel secondo round di ogni scontro" },
    "catena_di_norgrad": { "type": "relic", "name": "Catena di Norgrad", "desc": "+1 al tiro per colpire contro nemici elite e il capitano" },
    "scudo_dell_atamano": { "type": "relic", "name": "Scudo dell'Atamano", "desc": "Il primo colpo del nemico in ogni scontro viene assorbito del tutto" },
    "moneta_di_fredlos": { "type": "relic", "name": "Moneta di Fredlos", "desc": "I mercanti fanno pagare la metà" },
    "unguento_dell_erborista": { "type": "relic", "name": "Unguento dell'erborista", "desc": "Al riposo ogni eroe recupera 1 HP in più" },
    "cotta_dei_lungobarbi": {
        "type": "relic",
        "name": "Cotta dei Lungobarbi",
        "desc": "+1 HP massimi a tutti",
        "effects": [
            { "effect": "party_max_hp", "val": 1 }
        ]
    },
    "benedizione_del_primigenio": {
        "type": "relic",
        "name": "Benedizione del Primigenio",
        "desc": "+1 Fede a tutti",
        "effects": [
            { "effect": "party_stat", "stat": "fth", "val": 1 }
        ]
    },
    "sacca_del_contrabbandiere": {
        "type": "relic",
        "name": "Sacca del Contrabbandiere",
        "desc": "+20 monete alla cassa della compagnia",
        "effects": [
            { "effect": "coins", "val": 20 }
        ]
    },
    "prisma_rivelatore": {
        "type": "relic",
        "name": "Prisma Rivelatore",
        "desc": "+1 Intelligenza all'eroe che ha superato la prova, +10 monete",
        "effects": [
            { "effect": "hero_stat", "stat": "int", "val": 1 },
            { "effect": "coins", "val": 10 }
        ]
    },
    "tomo_delle_verita": {
        "type": "relic",
        "name": "Tomo delle Verità",
        "desc": "+1 Intelligenza e +1 Fede all'eroe che ha superato la prova",
        "effects": [
            { "effect": "hero_stat", "stat": "int", "val": 1 },
            { "effect": "hero_stat", "stat": "fth", "val": 1 }
        ]
    },
    "fiamma_perenne": {
        "type": "relic",
        "name": "Fiamma Perenne",
        "desc": "+1 HP massimi a tutti",
        "effects": [
            { "effect": "party_max_hp", "val": 1 }
        ]
    },
    "frammento_di_chiarezza": {
        "type": "relic",
        "name": "Frammento di Chiarezza",
        "desc": "+1 ai tiri per colpire",
        "effects": [
            { "effect": "party_stat", "stat": "att_bonus", "val": 1 }
        ]
    },
    "bussola_del_sopravvissuto": {
        "type": "relic",
        "name": "Bussola del Sopravvissuto",
        "desc": "+1 Intelligenza a tutti",
        "effects": [
            { "effect": "party_stat", "stat": "int", "val": 1 }
        ]
    },
    "reliquia_del_monolite": {
        "type": "relic",
        "name": "Reliquia del Monolite",
        "desc": "+1 Danno a tutti",
        "effects": [
            { "effect": "party_stat", "stat": "dmg", "val": 1 }
        ]
    }
};
