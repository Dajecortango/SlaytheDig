// Abilità: passive e attive degli eroi, condivise dalla libreria Eroi.
// Gli eroi le richiamano per id nel campo "abilities". Le passive agiscono con "effects"
// (o con "type": "passive_stat"); le attive (isCombatActive) agiscono con "combat" (vedi abilityCombat in js/game.js).
// "icon" è l'icona di Warcraft III mostrata nel gioco.
// Il contenuto dopo "=" è JSON puro. Si modifica anche dall'editor delle campagne.
window.LIBRERIA = window.LIBRERIA || {};
window.LIBRERIA.abilita = {
    "runa_rinascita": {
        "id": "runa_rinascita",
        "name": "Runa della Rinascita",
        "desc": "Runa: la prima volta che andrebbe a 0 HP torna con 2 HP (una volta per campagna)",
        "isCombatActive": false,
        "effects": [
            { "effect": "hero_set", "stat": "tenacityRevive", "val": 2 }
        ],
        "icon": "immagini/icone/BTNAnkh.png"
    },
    "runa_guarigione": {
        "id": "runa_guarigione",
        "name": "Runa della Guarigione",
        "desc": "Runa: dopo ogni scontro vinto cura di 1 HP l'eroe vivo più ferito",
        "isCombatActive": false,
        "effects": [
            { "effect": "hero_set", "stat": "postCombatHeal", "val": 1 }
        ],
        "icon": "immagini/icone/BTNHeal.png"
    },
    "runa_sapere": {
        "id": "runa_sapere",
        "name": "Runa del Sapere",
        "desc": "Runa: una prova fallita si ritenta una volta, con -1 al tiro",
        "isCombatActive": false,
        "effects": [
            { "effect": "hero_set", "stat": "challengeRerollMalus", "val": 1 }
        ],
        "icon": "immagini/icone/BTNTomeOfIntelligence.png"
    },
    "runa_vento": {
        "id": "runa_vento",
        "name": "Runa del Vento",
        "desc": "Runa: senza armatura, quando viene colpita tira un d6: con 4 o più il colpo è ignorato",
        "isCombatActive": false,
        "effects": [
            { "effect": "hero_set", "stat": "dodgeNoArmor", "val": 4 }
        ],
        "icon": "immagini/icone/BTNEvasion.png"
    },
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
        "desc": "Passiva: cosparge le lame con composti alchemici (+1 al Danno permanente). Se supera un tiro di Aiuto, anche il prossimo eroe ottiene +1 al Danno fino alla fine del turno",
        "isCombatActive": false,
        "effects": [
            {
                "effect": "hero_stat",
                "stat": "dmg",
                "val": 1
            },
            {
                "effect": "hero_set",
                "stat": "helpDmgBonus",
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
        "desc": "Passiva: se fallisce una prova può ripetere il tiro, con -1 al secondo tentativo",
        "isCombatActive": false,
        "effects": [
            {
                "effect": "hero_set",
                "stat": "challengeRerollMalus",
                "val": 1
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
    },
    "libertas_in_furor": {
        "id": "libertas_in_furor",
        "name": "Libertas in furor",
        "desc": "Passiva: se l'eroe è il primo ad agire nel round, ha +1 Forza al suo tiro (attacco, abilità, Difendi o Aiuta)",
        "isCombatActive": false,
        "effects": [
            {
                "effect": "hero_set",
                "stat": "firstActorStrBonus",
                "val": 1
            }
        ],
        "icon": "immagini/icone/BTNBloodLust.png"
    },
    "sette": {
        "id": "sette",
        "name": "7",
        "desc": "Attiva (1 volta per scontro): tira due dadi; se la somma è esattamente 7 il nemico è sconfitto all'istante. Un elite o il boss finale scende invece a metà dei suoi HP",
        "isCombatActive": true,
        "actionName": "7 (due dadi, somma 7)",
        "icon": "immagini/abilita/sette.png",
        "combat": {
            "dice": 2,
            "sumTarget": 7,
            "useText": "🎲 {eroe} sfida la sorte: serve un 7!",
            "hitLabel": "SETTE!",
            "hitText": "La sorte sorride a {eroe}: {danni} danni in un colpo solo!"
        }
    },
    "inganno_drago_verde": {
        "id": "inganno_drago_verde",
        "name": "Inganno del drago verde",
        "desc": "Passiva: finché l'eroe è vivo, i mercanti fanno il 20% di sconto sulla merce (non sul costo di \"Rinnova la merce\")",
        "isCombatActive": false,
        "effects": [
            {
                "effect": "hero_set",
                "stat": "merchantDiscount",
                "val": 0.2
            }
        ],
        "icon": "immagini/icone/BTNGreenDragon.png"
    },
    "factotum": {
        "id": "factotum",
        "name": "Factotum",
        "desc": "Passiva: ogni 2 punti di Forza guadagnati oltre a quelli iniziali dà +1 Intelligenza; ogni 2 di Intelligenza guadagnata +1 Fede; ogni 2 di Fede guadagnata +1 Forza",
        "isCombatActive": false,
        "effects": [
            {
                "effect": "hero_set",
                "stat": "factotum",
                "val": 2
            }
        ],
        "icon": "immagini/icone/BTNStatUp.png"
    },
    "va_bene_prendo_lo_scudo": {
        "id": "va_bene_prendo_lo_scudo",
        "name": "Va bene, prendo lo scudo",
        "desc": "Attiva (1 volta per scontro): senza tirare il dado l'eroe ottiene subito 4 punti Armatura. Usa la sua azione del turno",
        "isCombatActive": true,
        "actionName": "Va bene, prendo lo scudo (+4 Armatura)",
        "icon": "immagini/icone/BTNThoriumArmor.png",
        "combat": {
            "dice": 1,
            "armorGain": 4,
            "useText": "🛡️ {eroe} sbuffa: \"Va bene, prendo lo scudo\"."
        }
    },
    "orgoglio_di_mamma": {
        "id": "orgoglio_di_mamma",
        "name": "Orgoglio di mamma",
        "desc": "Attiva (1 volta per scontro): attacca con +2 al tiro per colpire e, se colpisce, +1 al danno",
        "isCombatActive": true,
        "actionName": "Orgoglio di mamma (+2 a colpire, +1 danno)",
        "icon": "immagini/abilita/orgoglio_di_mamma.webp",
        "combat": {
            "dice": 1,
            "attackBonus": 2,
            "damageBonus": 1,
            "useText": "💪 {eroe} pensa a mamma e ci mette tutto l'orgoglio!",
            "hitText": "Mamma sarebbe fiera: infliggi {danni} danni!"
        }
    },
    "neanche_un_graffio": {
        "id": "neanche_un_graffio",
        "name": "Neanche un graffio",
        "desc": "Passiva: quando il nemico colpisce l'eroe e l'eroe non ha armatura, tira un dado: con 5 o più ignora il danno",
        "isCombatActive": false,
        "effects": [
            {
                "effect": "hero_set",
                "stat": "dodgeNoArmor",
                "val": 5
            }
        ],
        "icon": "immagini/icone/BTNEvasion.png"
    },
    "morte_fiammeggiante": {
        "id": "morte_fiammeggiante",
        "name": "Morte fiammeggiante",
        "desc": "Passiva: scelta all'inizio dell'avventura, mette nello zaino dell'eroe 2 Cristalli di Flammaurea (3 danni al nemico ciascuno)",
        "isCombatActive": false,
        "effects": [
            {
                "effect": "hero_item",
                "item": "cristallo_flammaurea",
                "val": 2
            }
        ],
        "icon": "immagini/icone/BTNIncinerate.png"
    },
    "mano_veloce": {
        "id": "mano_veloce",
        "name": "La mano è più veloce dell'occhio",
        "desc": "Passiva: finché l'eroe è vivo, il primo oggetto preso da ogni mercante è gratis, perché lo ruba (il medico si paga)",
        "isCombatActive": false,
        "effects": [
            {
                "effect": "hero_set",
                "stat": "freeFirstMerchantItem",
                "val": true
            }
        ],
        "icon": "immagini/icone/BTNPillage.png"
    },
    "dente_per_dente": {
        "id": "dente_per_dente",
        "name": "Dente per dente",
        "desc": "Attiva (1 volta per scontro): solo se il nemico ha colpito l'eroe nel suo ultimo turno. Attacca con il normale tiro per colpire e, se colpisce, infligge il danno dell'eroe più i danni subiti in quel colpo, armatura persa compresa",
        "isCombatActive": true,
        "actionName": "Dente per dente (+ danni subiti)",
        "icon": "immagini/icone/BTNAdvancedUnholyStrength.png",
        "combat": {
            "dice": 1,
            "requiresHitLastTurn": true,
            "damageTakenBonus": true,
            "useText": "🩸 {eroe} restituisce il colpo: dente per dente!",
            "hitLabel": "DENTE PER DENTE!",
            "hitText": "Il dolore diventa forza: infliggi {danni} danni!"
        }
    },
    "tanto_ho_tenacia": {
        "id": "tanto_ho_tenacia",
        "name": "Tanto ho tenacia",
        "desc": "Passiva: la prima volta che l'eroe va a 0 HP torna in piedi con 2 HP (una volta per campagna)",
        "isCombatActive": false,
        "effects": [
            {
                "effect": "hero_set",
                "stat": "tenacityRevive",
                "val": 2
            }
        ],
        "icon": "immagini/icone/BTNAnkh.png"
    },
    "cerusico_da_battaglia": {
        "id": "cerusico_da_battaglia",
        "name": "Cerusico da Battaglia",
        "desc": "Passiva: dopo ogni scontro cura 1 HP all'eroe più ferito",
        "isCombatActive": false,
        "effects": [
            {
                "effect": "hero_set",
                "stat": "postCombatHeal",
                "val": 1
            }
        ],
        "icon": "immagini/icone/BTNHealingSalve.png"
    }
};
