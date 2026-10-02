// Abilità: passive e attive degli eroi, condivise dalla libreria Eroi.
// Gli eroi le richiamano per id nel campo "abilities". Le passive agiscono con "effects"
// (o con "type": "passive_stat"); le attive (isCombatActive) agiscono con "combat" (vedi abilityCombat in js/game.js).
// "icon" è l'icona di Warcraft III mostrata nel gioco.
// Il contenuto dopo "=" è JSON puro. Si modifica anche dall'editor delle campagne.
window.LIBRERIA = window.LIBRERIA || {};
window.LIBRERIA.abilita = {
    "bonus_forza": {
        "id": "bonus_forza",
        "name": "+1 Forza",
        "type": "passive_stat",
        "stat": "str",
        "val": 1,
        "desc": "Passiva: +1 Forza permanente"
    },
    "bonus_hp": {
        "id": "bonus_hp",
        "name": "+1 HP",
        "type": "passive_stat",
        "stat": "hp",
        "val": 1,
        "desc": "Passiva: +1 HP massimi permanente"
    },
    "bonus_intelligenza": {
        "id": "bonus_intelligenza",
        "name": "+1 Intelligenza",
        "type": "passive_stat",
        "stat": "int",
        "val": 1,
        "desc": "Passiva: +1 Intelligenza permanente"
    },
    "bonus_fede": {
        "id": "bonus_fede",
        "name": "+1 Fede",
        "type": "passive_stat",
        "stat": "fth",
        "val": 1,
        "desc": "Passiva: +1 Fede permanente"
    },
    "icaro_oro": {
        "id": "icaro_oro",
        "name": "Fammi dare un’occhiata",
        "desc": "Passiva: dopo ogni scontro la compagnia ottiene 3 monete in più garantite",
        "isCombatActive": false,
        "effects": [
            {
                "effect": "hero_set",
                "stat": "bonusLootCoins",
                "val": 3
            }
        ],
        "icon": "immagini/icone/BTNMagicalSentry.png"
    },
    "icaro_trucchi": {
        "id": "icaro_trucchi",
        "name": "Trucchi del mestiere",
        "desc": "Attiva (1 volta per scontro): tira due dadi per attaccare e tiene il più alto",
        "isCombatActive": true,
        "actionName": "Trucchi del mestiere (2 dadi attacco)",
        "icon": "immagini/icone/BTNSilence.png",
        "combat": {
            "dice": 2,
            "useText": "✨ {eroe} usa Trucchi del Mestiere!"
        }
    },
    "astarte_veleni": {
        "id": "astarte_veleni",
        "name": "Veleni ed altri composti",
        "desc": "Passiva: cosparge le lame con composti alchemici (+1 al Danno permanente)",
        "isCombatActive": false,
        "effects": [
            {
                "effect": "hero_stat",
                "stat": "dmg",
                "val": 1
            }
        ],
        "icon": "immagini/icone/BTNCorrosiveBreath.png"
    },
    "astarte_affondo": {
        "id": "astarte_affondo",
        "name": "Affondo mortale",
        "desc": "Attiva (1 volta per scontro): attacco speciale che infligge danno raddoppiato",
        "isCombatActive": true,
        "actionName": "Affondo mortale (Doppio Danno)",
        "icon": "immagini/icone/BTNSacrifice.png",
        "combat": {
            "dice": 1,
            "damageMult": 2,
            "critical": true,
            "useText": "🗡️ {eroe} scatena Affondo Mortale!",
            "hitLabel": "COLPO CRITICO!",
            "hitText": "L'affondo trafigge il nemico infliggendo {danni} danni!"
        }
    },
    "ascadeo_ghiaccio": {
        "id": "ascadeo_ghiaccio",
        "name": "Abitante del GhiaccioEterno",
        "desc": "Passiva: ottiene 1 punto di armatura naturale permanente",
        "isCombatActive": false,
        "effects": [
            {
                "effect": "hero_stat",
                "stat": "base_armor",
                "val": 1
            },
            {
                "effect": "hero_stat",
                "stat": "current_armor",
                "val": 1
            }
        ],
        "icon": "immagini/icone/BTNFreezingBreath.png"
    },
    "ascadeo_segnato": {
        "id": "ascadeo_segnato",
        "name": "Segnato da Hvid",
        "desc": "Attiva (1 volta per scontro): colpo speciale che stordisce l'avversario per il suo turno",
        "isCombatActive": true,
        "actionName": "Segnato da Hvid (Stordisce Nemico)",
        "icon": "immagini/icone/BTNFrostWolf.png",
        "combat": {
            "dice": 1,
            "stun": true,
            "useText": "❄️ {eroe} colpisce nel nome di Hvid!",
            "hitLabel": "STORDITO!",
            "hitText": "Il nemico barcolla congelato dal gelo di Hvid: salterà il prossimo attacco!"
        }
    },
    "zeno_colpo_benedetto": {
        "id": "zeno_colpo_benedetto",
        "name": "Colpo benedetto",
        "desc": "Attiva (1 volta per scontro): aggiunge il valore di Fede al Danno inflitto",
        "isCombatActive": true,
        "actionName": "Colpo benedetto (+Fede al Danno)",
        "icon": "immagini/icone/BTNInnerFire.png",
        "combat": {
            "dice": 1,
            "damageStat": "fth",
            "useText": "✨ {eroe} infonde il colpo di fede sacra!",
            "hitLabel": "COLPO BENEDETTO!",
            "hitText": "La luce divina guida la lama: infliggi {danni} danni!"
        }
    },
    "zeno_addestramento": {
        "id": "zeno_addestramento",
        "name": "Addestramento marziale",
        "desc": "Passiva: ottiene permanentemente +1 a Forza",
        "isCombatActive": false,
        "effects": [
            {
                "effect": "hero_stat",
                "stat": "str",
                "val": 1
            }
        ],
        "icon": "immagini/icone/BTNGauntletsOfOgrePower.png"
    },
    "dioforo_era_solo_una_prova": {
        "id": "dioforo_era_solo_una_prova",
        "name": "Era solo una prova!",
        "desc": "Passiva: quando affronta una prova di Intelligenza o Fede tira 2 dadi e tiene il migliore",
        "isCombatActive": false,
        "effects": [
            {
                "effect": "hero_set",
                "stat": "hasAdvantageOnIntFth",
                "val": true
            }
        ],
        "icon": "immagini/icone/BTNSnazzyScroll.png"
    },
    "dioforo_penna": {
        "id": "dioforo_penna",
        "name": "La penna ferisce più della spada",
        "desc": "Attiva (1 volta per scontro): aggiunge il valore di Intelligenza al tiro per colpire",
        "isCombatActive": true,
        "actionName": "La penna ferisce più della spada (+Intelligenza ad Attacco)",
        "icon": "immagini/icone/BTNBrilliance.png",
        "combat": {
            "dice": 1,
            "attackStat": "int",
            "useText": "📜 {eroe} sfrutta l'intelletto!",
            "hitText": "Un calcolo perfetto individua il punto debole: infliggi {danni} danni!"
        }
    }
};
