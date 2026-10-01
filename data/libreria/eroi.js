// Eroi: statistiche iniziali e abilità tra cui scegliere, condivisi dalle campagne.
// Le campagne li richiamano per id nel campo "heroes"; le abilità sono id della libreria Abilità
// (data/libreria/abilita.js). Il ritratto, se manca in HERO_PORTRAITS, viene da "portrait".
// Il contenuto dopo "=" è JSON puro. Si modifica anche dall'editor delle campagne.
window.LIBRERIA = window.LIBRERIA || {};
window.LIBRERIA.eroi = {
    "curio_dignitas": { "name": "Curio Dignitas", "str": 4, "int": 1, "fth": 2, "maxHp": 4, "hp": 4, "dmg": 1, "base_armor": 0, "current_armor": 0, "att_penalty": 0, "def_bonus": 0, "help_bonus_val": 0, "items": [], "abilities": ["bonus_forza", "bonus_hp"] },
    "prometeo_dignitas": { "name": "Prometeo Dignitas", "str": 3, "int": 2, "fth": 2, "maxHp": 4, "hp": 4, "dmg": 1, "base_armor": 0, "current_armor": 0, "att_penalty": 0, "def_bonus": 0, "help_bonus_val": 0, "items": [], "abilities": ["bonus_intelligenza", "bonus_fede"] },
    "temistocle_dignitas": { "name": "Temistocle Dignitas", "str": 4, "int": 2, "fth": 1, "maxHp": 4, "hp": 4, "dmg": 1, "base_armor": 0, "current_armor": 0, "att_penalty": 0, "def_bonus": 0, "help_bonus_val": 0, "items": [], "abilities": ["bonus_hp", "bonus_fede"] },
    "caino_dignitas": { "name": "Caino Dignitas", "str": 3, "int": 3, "fth": 1, "maxHp": 4, "hp": 4, "dmg": 1, "base_armor": 0, "current_armor": 0, "att_penalty": 0, "def_bonus": 0, "help_bonus_val": 0, "items": [], "abilities": ["bonus_intelligenza", "bonus_hp"] },
    "ottavio_dignitas": { "name": "Ottavio Dignitas", "str": 5, "int": 1, "fth": 1, "maxHp": 4, "hp": 4, "dmg": 1, "base_armor": 0, "current_armor": 0, "att_penalty": 0, "def_bonus": 0, "help_bonus_val": 0, "items": [], "abilities": ["bonus_hp", "bonus_fede"] },
    "icaro": { "name": "Icaro", "str": 3, "int": 3, "fth": 1, "maxHp": 4, "hp": 4, "dmg": 1, "base_armor": 0, "current_armor": 0, "att_penalty": 0, "def_bonus": 0, "help_bonus_val": 0, "items": [], "abilities": ["icaro_oro", "icaro_trucchi"] },
    "astarte": { "name": "Astarte", "str": 2, "int": 3, "fth": 2, "maxHp": 4, "hp": 4, "dmg": 1, "base_armor": 0, "current_armor": 0, "att_penalty": 0, "def_bonus": 0, "help_bonus_val": 0, "items": [], "abilities": ["astarte_veleni", "astarte_affondo"] },
    "ascadeo": { "name": "Ascadeo", "str": 3, "int": 1, "fth": 3, "maxHp": 4, "hp": 4, "dmg": 1, "base_armor": 0, "current_armor": 0, "att_penalty": 0, "def_bonus": 0, "help_bonus_val": 0, "items": [], "abilities": ["ascadeo_ghiaccio", "ascadeo_segnato"] },
    "zeno": { "name": "Zeno", "str": 3, "int": 2, "fth": 2, "maxHp": 4, "hp": 4, "dmg": 1, "base_armor": 0, "current_armor": 0, "att_penalty": 0, "def_bonus": 0, "help_bonus_val": 0, "items": [], "abilities": ["zeno_colpo_benedetto", "zeno_addestramento"] },
    "dioforo": { "name": "Dioforo", "str": 2, "int": 4, "fth": 1, "maxHp": 4, "hp": 4, "dmg": 1, "base_armor": 0, "current_armor": 0, "att_penalty": 0, "def_bonus": 0, "help_bonus_val": 0, "items": [], "abilities": ["dioforo_era_solo_una_prova", "dioforo_penna"] }
};
