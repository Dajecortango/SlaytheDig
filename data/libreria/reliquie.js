// Reliquie: ricompense delle sfide, condivise dalle campagne.
// Le sfide le richiamano per id nel campo "reward". "effects" agisce quando si ottiene la reliquia,
// "speciali" sono gli effetti "quando → fai" (vocabolario in js/comune.js, motore in js/motore/speciali.js).
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
        "name": "Benedetti da Jag Àntar",
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
    "corno_antico": {
        "type": "relic",
        "name": "Corno dell'Esodo",
        "desc": "Durante il terzo turno tutti gli eroi ottengono +1 al danno",
        "speciali": [
            { "quando": "colpo", "round": 3, "fai": "danni", "val": 1 }
        ]
    },
    "lasciapassare_mercantile": {
        "type": "relic",
        "name": "Lasciapassare mercantile",
        "desc": "Gli oggetti dai mercanti sono scontati di 3 Scudi",
        "speciali": [
            { "quando": "mercante", "fai": "sconto", "val": 3 }
        ]
    },
    "pietra_del_focolare": {
        "type": "relic",
        "name": "Pietra del focolare",
        "desc": "Durante il riposo rimuove una maledizione casuale",
        "speciali": [
            { "quando": "riposo", "fai": "togli_maledizione" }
        ]
    },
    "frammento_di_matrice": {
        "type": "relic",
        "name": "Fortuna degli Stolti",
        "desc": "La prossima sfida fallita diventa un successo, poi si rompe",
        "speciali": [
            { "quando": "prova_fallita", "fai": "prova_riuscita", "rompe": true }
        ]
    },
    "dente_del_grande_lupo": {
        "type": "relic",
        "name": "Dente del grande lupo",
        "desc": "Dopo ogni scontro l'eroe con meno HP recupera 1 HP",
        "speciali": [
            { "quando": "fine_scontro", "fai": "cura", "val": 1, "bersaglio": "meno_hp" }
        ]
    },
    "frammento_di_yr_drazul": {
        "type": "relic",
        "name": "Bussola dell'Occhio Cieco",
        "desc": "+1 a tutti i tiri di dado",
        "speciali": [
            { "quando": "tiro", "fai": "bonus_tiro", "val": 1 }
        ]
    },
    "favore_di_valgoren": {
        "type": "relic",
        "name": "Favore di Valgoren",
        "desc": "Quando un eroe recupera HP, cura 1 HP ad un altro eroe casuale",
        "speciali": [
            { "quando": "cura_ricevuta", "fai": "cura", "val": 1, "bersaglio": "altro_casuale" }
        ]
    },
    "idolo_del_cacciatore": {
        "type": "relic",
        "name": "Idolo del cacciatore",
        "desc": "+1 al danno durante gli scontri elite",
        "speciali": [
            { "quando": "colpo", "se": "elite", "fai": "danni", "val": 1 }
        ]
    },
    "occhio_del_corvo": {
        "type": "relic",
        "name": "Calma del Margine",
        "desc": "Diminuisce di 1 la statistica attacco dei mostri",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "malus_nemico", "stat": "att", "val": 1 }
        ]
    },
    "anello_del_giuramento": {
        "type": "relic",
        "name": "Benedizione del Caos",
        "desc": "+3 al prossimo tiro di dado, poi la reliquia si rompe",
        "speciali": [
            { "quando": "tiro", "fai": "bonus_tiro", "val": 3, "limite": "capitolo", "rompe": true }
        ]
    },
    "marchio_di_jag_antar": {
        "type": "relic",
        "name": "Marchio di Jag Àntar",
        "desc": "Se un eroe viene ridotto a 0 HP, rimane a 1 HP, poi si rompe",
        "speciali": [
            { "quando": "colpo_mortale", "fai": "rialza", "val": 1, "rompe": true }
        ]
    },
    "sigillo_runico": {
        "type": "relic",
        "name": "Sigillo runico",
        "desc": "+2 ai prossimi 2 tiri di dado, poi si rompe",
        "speciali": [
            { "quando": "tiro", "fai": "bonus_tiro", "val": 2, "limite": "capitolo", "volte": 2, "rompe": true }
        ]
    },
    "lanterna_dei_morti": {
        "type": "relic",
        "name": "Lanterna dei morti",
        "desc": "+1 permanente alla caratteristica Fede di tutti gli eroi",
        "effects": [
            { "effect": "party_stat", "stat": "fth", "val": 1 }
        ]
    },
    "stendardo_da_battaglia": {
        "type": "relic",
        "name": "Stendardo da battaglia",
        "desc": "+1 al tiro per colpire nel primo round di ogni scontro",
        "speciali": [
            { "quando": "attacco", "round": 1, "fai": "bonus_tiro", "val": 1 }
        ]
    },
    "zanna_del_leone_bianco": {
        "type": "relic",
        "name": "Zanna del leone bianco",
        "desc": "+2 danni nel secondo round di ogni scontro",
        "speciali": [
            { "quando": "colpo", "round": 2, "fai": "danni", "val": 2 }
        ]
    },
    "catena_di_norgrad": {
        "type": "relic",
        "name": "Catena di Norgrad",
        "desc": "+1 al tiro per colpire contro nemici elite e il capitano",
        "speciali": [
            { "quando": "attacco", "se": "elite", "fai": "bonus_tiro", "val": 1 },
            { "quando": "capitano", "fai": "bonus_tiro", "val": 1 }
        ]
    },
    "scudo_dell_atamano": {
        "type": "relic",
        "name": "Scudo dell'Atamano",
        "desc": "Il primo colpo del nemico in ogni scontro viene assorbito del tutto",
        "speciali": [
            { "quando": "colpito", "se": "colpo_pieno", "fai": "annulla_colpo", "limite": "scontro" }
        ]
    },
    "moneta_di_fredlos": {
        "type": "relic",
        "name": "Moneta di Fredlös",
        "desc": "I mercanti fanno pagare la metà",
        "speciali": [
            { "quando": "mercante", "fai": "sconto_percento", "val": 50 }
        ]
    },
    "unguento_dell_erborista": {
        "type": "relic",
        "name": "Unguento dell'erborista",
        "desc": "Al riposo ogni eroe recupera 1 HP in più",
        "speciali": [
            { "quando": "riposo", "fai": "bonus_cura", "val": 1 }
        ]
    },
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
        "desc": "+20 Scudi alla cassa della compagnia",
        "effects": [
            { "effect": "coins", "val": 20 }
        ]
    },
    "prisma_rivelatore": {
        "type": "relic",
        "name": "Prisma Rivelatore",
        "desc": "+1 Intelligenza all'eroe che ha superato la prova, +10 Scudi",
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
    },
    "erbe_di_montagna": {
        "type": "relic",
        "name": "Provviste di Giuditta",
        "desc": "Cibo per ristorare mente e corpo.",
        "effects": [
            { "effect": "party_max_hp", "val": 2 }
        ]
    },
    "lascito_del_caduto": {
        "type": "relic",
        "name": "Lascito del Caduto",
        "desc": "La prova della tenacia di un Dignitas",
        "effects": [
            { "effect": "party_stat", "val": 1, "stat": "str" }
        ]
    },
    "radice_delle_montagne": {
        "type": "relic",
        "name": "Radice delle Montagne",
        "desc": "Un tè per fortificare i vostri cuori stanchi",
        "speciali": [
            { "quando": "inizio_round", "fai": "purifica", "bersaglio": "meno_hp" }
        ]
    },
    "nuova_reliquia": {
        "type": "relic",
        "name": "Spada Spezzata ",
        "desc": "50% di possibilità di ottenere Armatura ad ogni turno",
        "speciali": [
            { "quando": "inizio_round", "fai": "armatura", "se": "elite", "prob": 50, "val": 2, "bersaglio": "meno_hp" }
        ]
    }
};
