// Eroi: statistiche iniziali e abilità tra cui scegliere, condivisi dalle campagne.
// Le campagne li richiamano per id nel campo "heroes". Le abilità attive (isCombatActive)
// sono gestite per id in js/game.js; il ritratto, se manca in HERO_PORTRAITS, viene da "portrait".
// Il contenuto dopo "=" è JSON puro. Si modifica anche dall'editor delle campagne.
window.LIBRERIA = window.LIBRERIA || {};
window.LIBRERIA.eroi = {
    "curio_dignitas": {
        "name": "Curio Dignitas",
        "str": 4,
        "int": 1,
        "fth": 2,
        "maxHp": 4,
        "hp": 4,
        "dmg": 1,
        "base_armor": 0,
        "current_armor": 0,
        "att_penalty": 0,
        "def_bonus": 0,
        "help_bonus_val": 0,
        "items": [],
        "abilities": [
            { "name": "+1 Forza", "type": "passive_stat", "stat": "str", "val": 1 },
            { "name": "+1 HP", "type": "passive_stat", "stat": "hp", "val": 1 }
        ]
    },
    "prometeo_dignitas": {
        "name": "Prometeo Dignitas",
        "str": 3,
        "int": 2,
        "fth": 2,
        "maxHp": 4,
        "hp": 4,
        "dmg": 1,
        "base_armor": 0,
        "current_armor": 0,
        "att_penalty": 0,
        "def_bonus": 0,
        "help_bonus_val": 0,
        "items": [],
        "abilities": [
            { "name": "+1 Intelligenza", "type": "passive_stat", "stat": "int", "val": 1 },
            { "name": "+1 Fede", "type": "passive_stat", "stat": "fth", "val": 1 }
        ]
    },
    "temistocle_dignitas": {
        "name": "Temistocle Dignitas",
        "str": 4,
        "int": 2,
        "fth": 1,
        "maxHp": 4,
        "hp": 4,
        "dmg": 1,
        "base_armor": 0,
        "current_armor": 0,
        "att_penalty": 0,
        "def_bonus": 0,
        "help_bonus_val": 0,
        "items": [],
        "abilities": [
            { "name": "+1 HP", "type": "passive_stat", "stat": "hp", "val": 1 },
            { "name": "+1 Fede", "type": "passive_stat", "stat": "fth", "val": 1 }
        ]
    },
    "caino_dignitas": {
        "name": "Caino Dignitas",
        "str": 3,
        "int": 3,
        "fth": 1,
        "maxHp": 4,
        "hp": 4,
        "dmg": 1,
        "base_armor": 0,
        "current_armor": 0,
        "att_penalty": 0,
        "def_bonus": 0,
        "help_bonus_val": 0,
        "items": [],
        "abilities": [
            { "name": "+1 Intelligenza", "type": "passive_stat", "stat": "int", "val": 1 },
            { "name": "+1 HP", "type": "passive_stat", "stat": "hp", "val": 1 }
        ]
    },
    "ottavio_dignitas": {
        "name": "Ottavio Dignitas",
        "str": 5,
        "int": 1,
        "fth": 1,
        "maxHp": 4,
        "hp": 4,
        "dmg": 1,
        "base_armor": 0,
        "current_armor": 0,
        "att_penalty": 0,
        "def_bonus": 0,
        "help_bonus_val": 0,
        "items": [],
        "abilities": [
            { "name": "+1 HP", "type": "passive_stat", "stat": "hp", "val": 1 },
            { "name": "+1 Fede", "type": "passive_stat", "stat": "fth", "val": 1 }
        ]
    },
    "icaro": {
        "name": "Icaro",
        "str": 3,
        "int": 3,
        "fth": 1,
        "maxHp": 4,
        "hp": 4,
        "dmg": 1,
        "base_armor": 0,
        "current_armor": 0,
        "att_penalty": 0,
        "def_bonus": 0,
        "help_bonus_val": 0,
        "items": [],
        "abilities": [
            {
                "id": "icaro_oro",
                "name": "Fammi dare un’occhiata",
                "desc": "Passiva: dopo ogni scontro la compagnia ottiene 3 monete in più garantite",
                "isCombatActive": false,
                "effects": [
                    { "effect": "hero_set", "stat": "bonusLootCoins", "val": 3 }
                ]
            },
            { "id": "icaro_trucchi", "name": "Trucchi del mestiere", "desc": "Attiva (1 volta per scontro): tira due dadi per attaccare e tiene il più alto", "isCombatActive": true, "actionName": "Trucchi del mestiere (2 dadi attacco)" }
        ]
    },
    "astarte": {
        "name": "Astarte",
        "str": 2,
        "int": 3,
        "fth": 2,
        "maxHp": 4,
        "hp": 4,
        "dmg": 1,
        "base_armor": 0,
        "current_armor": 0,
        "att_penalty": 0,
        "def_bonus": 0,
        "help_bonus_val": 0,
        "items": [],
        "abilities": [
            {
                "id": "astarte_veleni",
                "name": "Veleni ed altri composti",
                "desc": "Passiva: cosparge le lame con composti alchemici (+1 al Danno permanente)",
                "isCombatActive": false,
                "effects": [
                    { "effect": "hero_stat", "stat": "dmg", "val": 1 }
                ]
            },
            { "id": "astarte_affondo", "name": "Affondo mortale", "desc": "Attiva (1 volta per scontro): attacco speciale che infligge danno raddoppiato", "isCombatActive": true, "actionName": "Affondo mortale (Doppio Danno)" }
        ]
    },
    "ascadeo": {
        "name": "Ascadeo",
        "str": 3,
        "int": 1,
        "fth": 3,
        "maxHp": 4,
        "hp": 4,
        "dmg": 1,
        "base_armor": 0,
        "current_armor": 0,
        "att_penalty": 0,
        "def_bonus": 0,
        "help_bonus_val": 0,
        "items": [],
        "abilities": [
            {
                "id": "ascadeo_ghiaccio",
                "name": "Abitante del GhiaccioEterno",
                "desc": "Passiva: ottiene 1 punto di armatura naturale permanente",
                "isCombatActive": false,
                "effects": [
                    { "effect": "hero_stat", "stat": "base_armor", "val": 1 },
                    { "effect": "hero_stat", "stat": "current_armor", "val": 1 }
                ]
            },
            { "id": "ascadeo_segnato", "name": "Segnato da Hvid", "desc": "Attiva (1 volta per scontro): colpo speciale che stordisce l'avversario per il suo turno", "isCombatActive": true, "actionName": "Segnato da Hvid (Stordisce Nemico)" }
        ]
    },
    "zeno": {
        "name": "Zeno",
        "str": 3,
        "int": 2,
        "fth": 2,
        "maxHp": 4,
        "hp": 4,
        "dmg": 1,
        "base_armor": 0,
        "current_armor": 0,
        "att_penalty": 0,
        "def_bonus": 0,
        "help_bonus_val": 0,
        "items": [],
        "abilities": [
            { "id": "zeno_colpo_benedetto", "name": "Colpo benedetto", "desc": "Attiva (1 volta per scontro): aggiunge il valore di Fede al Danno inflitto", "isCombatActive": true, "actionName": "Colpo benedetto (+Fede al Danno)" },
            {
                "id": "zeno_addestramento",
                "name": "Addestramento marziale",
                "desc": "Passiva: ottiene permanentemente +1 a Forza",
                "isCombatActive": false,
                "effects": [
                    { "effect": "hero_stat", "stat": "str", "val": 1 }
                ]
            }
        ]
    },
    "dioforo": {
        "name": "Dioforo",
        "str": 2,
        "int": 4,
        "fth": 1,
        "maxHp": 4,
        "hp": 4,
        "dmg": 1,
        "base_armor": 0,
        "current_armor": 0,
        "att_penalty": 0,
        "def_bonus": 0,
        "help_bonus_val": 0,
        "items": [],
        "abilities": [
            {
                "id": "dioforo_era_solo_una_prova",
                "name": "Era solo una prova!",
                "desc": "Passiva: quando affronta una prova di Intelligenza o Fede tira 2 dadi e tiene il migliore",
                "isCombatActive": false,
                "effects": [
                    { "effect": "hero_set", "stat": "hasAdvantageOnIntFth", "val": true }
                ]
            },
            {
                "id": "dioforo_penna",
                "name": "La penna ferisce più della spada",
                "desc": "Attiva (1 volta per scontro): aggiunge il valore di Intelligenza al tiro per colpire",
                "isCombatActive": true,
                "actionName": "La penna ferisce più della spada (+Intelligenza ad Attacco)"
            }
        ]
    }
};
