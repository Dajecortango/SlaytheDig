// Abilità: passive e attive degli eroi, condivise dalla libreria Eroi.
// Gli eroi le richiamano per id nel campo "abilities". Le passive agiscono con "speciali" (effetti
// "quando → fai", js/motore/speciali.js), con "effects" (o con "type": "passive_stat");
// le attive (isCombatActive) agiscono con "combat" (vedi abilityCombat in js/game.js).
// "icon" è l'icona di Warcraft III mostrata nel gioco.
// Il contenuto dopo "=" è JSON puro. Si modifica anche dall'editor delle campagne.
window.LIBRERIA = window.LIBRERIA || {};
window.LIBRERIA.abilita = {
    "runa_rinascita": {
        "id": "runa_rinascita",
        "name": "Runa della Rinascita",
        "desc": "Runa: la prima volta che andrebbe a 0 HP torna con 2 HP (una volta per campagna)",
        "isCombatActive": false,
        "speciali": [
            { "quando": "colpo_mortale", "fai": "rialza", "val": 2, "limite": "capitolo" }
        ],
        "icon": "immagini/icone/BTNAnkh.png"
    },
    "runa_guarigione": {
        "id": "runa_guarigione",
        "name": "Runa della Guarigione",
        "desc": "Runa: dopo ogni scontro vinto cura di 1 HP l'eroe vivo più ferito",
        "isCombatActive": false,
        "speciali": [
            { "quando": "fine_scontro", "fai": "cura", "val": 1, "bersaglio": "piu_ferito" }
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
        "speciali": [
            { "quando": "colpito", "se": "senza_armatura", "fai": "schiva", "val": 4 }
        ],
        "icon": "immagini/icone/BTNEvasion.png"
    },
    "bonus_forza": { "id": "bonus_forza", "name": "+1 Forza", "type": "passive_stat", "stat": "str", "val": 1, "desc": "Passiva: +1 Forza permanente" },
    "bonus_hp": { "id": "bonus_hp", "name": "+1 HP", "type": "passive_stat", "stat": "hp", "val": 1, "desc": "Passiva: +1 HP massimi permanente" },
    "bonus_intelligenza": { "id": "bonus_intelligenza", "name": "+1 Intelligenza", "type": "passive_stat", "stat": "int", "val": 1, "desc": "Passiva: +1 Intelligenza permanente" },
    "bonus_fede": { "id": "bonus_fede", "name": "+1 Fede", "type": "passive_stat", "stat": "fth", "val": 1, "desc": "Passiva: +1 Fede permanente" },
    "icaro_oro": {
        "id": "icaro_oro",
        "name": "Fammi dare un’occhiata",
        "desc": "Passiva: dopo ogni scontro la compagnia ottiene 3 Scudi in più garantiti",
        "isCombatActive": false,
        "speciali": [
            { "quando": "fine_scontro", "fai": "monete", "val": 3 }
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
        "combat": { "dice": 2, "useText": "✨ {eroe} usa Trucchi del Mestiere!" }
    },
    "astarte_veleni": {
        "id": "astarte_veleni",
        "name": "Veleni ed altri composti",
        "desc": "Passiva: cosparge le lame con composti alchemici (+1 al Danno permanente). Se supera un tiro di Aiuto, anche il prossimo eroe ottiene +1 al Danno fino alla fine del turno",
        "isCombatActive": false,
        "effects": [
            { "effect": "hero_stat", "stat": "dmg", "val": 1 },
            { "effect": "hero_set", "stat": "helpDmgBonus", "val": 1 }
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
        "combat": { "dice": 1, "damageMult": 2, "critical": true, "useText": "🗡️ {eroe} scatena Affondo Mortale!", "hitLabel": "COLPO CRITICO!", "hitText": "L'affondo trafigge il nemico infliggendo {danni} danni!" }
    },
    "ascadeo_ghiaccio": {
        "id": "ascadeo_ghiaccio",
        "name": "Abitante del Ghiacceterno",
        "desc": "Passiva: ottiene 1 punto di armatura naturale permanente",
        "isCombatActive": false,
        "effects": [
            { "effect": "hero_stat", "stat": "base_armor", "val": 1 },
            { "effect": "hero_stat", "stat": "current_armor", "val": 1 }
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
        "combat": { "dice": 1, "stun": true, "useText": "❄️ {eroe} colpisce nel nome di Hvid!", "hitLabel": "STORDITO!", "hitText": "Il nemico barcolla congelato dal gelo di Hvid: salterà il prossimo attacco!" }
    },
    "zeno_colpo_benedetto": {
        "id": "zeno_colpo_benedetto",
        "name": "Colpo benedetto",
        "desc": "Attiva (1 volta per scontro): aggiunge il valore di Fede al Danno inflitto",
        "isCombatActive": true,
        "actionName": "Colpo benedetto (+Fede al Danno)",
        "icon": "immagini/icone/BTNInnerFire.png",
        "combat": { "dice": 1, "damageStat": "fth", "useText": "✨ {eroe} infonde il colpo di fede sacra!", "hitLabel": "COLPO BENEDETTO!", "hitText": "La luce divina guida la lama: infliggi {danni} danni!" }
    },
    "zeno_addestramento": {
        "id": "zeno_addestramento",
        "name": "Addestramento marziale",
        "desc": "Passiva: ottiene permanentemente +1 a Forza",
        "isCombatActive": false,
        "effects": [
            { "effect": "hero_stat", "stat": "str", "val": 1 }
        ],
        "icon": "immagini/icone/BTNGauntletsOfOgrePower.png"
    },
    "dioforo_era_solo_una_prova": {
        "id": "dioforo_era_solo_una_prova",
        "name": "Era solo una prova!",
        "desc": "Passiva: se fallisce una prova può ripetere il tiro, con -1 al secondo tentativo",
        "isCombatActive": false,
        "effects": [
            { "effect": "hero_set", "stat": "challengeRerollMalus", "val": 1 }
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
        "combat": { "dice": 1, "attackStat": "int", "useText": "📜 {eroe} sfrutta l'intelletto!", "hitText": "Un calcolo perfetto individua il punto debole: infliggi {danni} danni!" }
    },
    "libertas_in_furor": {
        "id": "libertas_in_furor",
        "name": "Libertas in furor",
        "desc": "Passiva: se l'eroe è il primo ad agire nel round, ha +1 Forza al suo tiro (attacco, abilità, Difendi o Aiuta)",
        "isCombatActive": false,
        "effects": [
            { "effect": "hero_set", "stat": "firstActorStrBonus", "val": 1 }
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
        "combat": { "dice": 2, "sumTarget": 7, "useText": "🎲 {eroe} sfida la sorte: serve un 7!", "hitLabel": "SETTE!", "hitText": "La sorte sorride a {eroe}: {danni} danni in un colpo solo!" }
    },
    "inganno_drago_verde": {
        "id": "inganno_drago_verde",
        "name": "Inganno del drago verde",
        "desc": "Passiva: finché l'eroe è vivo, i mercanti fanno il 20% di sconto sulla merce (non sul costo di \"Rinnova la merce\")",
        "isCombatActive": false,
        "speciali": [
            { "quando": "mercante", "fai": "sconto_percento", "val": 20 }
        ],
        "icon": "immagini/icone/BTNGreenDragon.png"
    },
    "factotum": {
        "id": "factotum",
        "name": "Factotum",
        "desc": "Passiva: ogni 2 punti di Forza guadagnati oltre a quelli iniziali dà +1 Intelligenza; ogni 2 di Intelligenza guadagnata +1 Fede; ogni 2 di Fede guadagnata +1 Forza",
        "isCombatActive": false,
        "effects": [
            { "effect": "hero_set", "stat": "factotum", "val": 2 }
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
        "combat": { "dice": 1, "armorGain": 4, "useText": "🛡️ {eroe} sbuffa: \"Va bene, prendo lo scudo\"." }
    },
    "orgoglio_di_mamma": {
        "id": "orgoglio_di_mamma",
        "name": "Orgoglio di mamma",
        "desc": "Attiva (1 volta per scontro): attacca con +2 al tiro per colpire e, se colpisce, +1 al danno",
        "isCombatActive": true,
        "actionName": "Orgoglio di mamma (+2 a colpire, +1 danno)",
        "icon": "immagini/abilita/orgoglio_di_mamma.webp",
        "combat": { "dice": 1, "attackBonus": 2, "damageBonus": 1, "useText": "💪 {eroe} pensa a mamma e ci mette tutto l'orgoglio!", "hitText": "Mamma sarebbe fiera: infliggi {danni} danni!" }
    },
    "neanche_un_graffio": {
        "id": "neanche_un_graffio",
        "name": "Neanche un graffio",
        "desc": "Passiva: quando il nemico colpisce l'eroe e l'eroe non ha armatura, tira un dado: con 5 o più ignora il danno",
        "isCombatActive": false,
        "speciali": [
            { "quando": "colpito", "se": "senza_armatura", "fai": "schiva", "val": 5 }
        ],
        "icon": "immagini/icone/BTNEvasion.png"
    },
    "morte_fiammeggiante": {
        "id": "morte_fiammeggiante",
        "name": "Morte fiammeggiante",
        "desc": "Passiva: ogni volta che esce da un mercante mette nello zaino un Cristallo di Flammaurea (3 danni al nemico). Con lo zaino pieno sceglie cosa scartare",
        "isCombatActive": false,
        "speciali": [
            { "quando": "uscita_mercante", "fai": "oggetto", "item": "cristallo_flammaurea", "val": 1 }
        ],
        "icon": "immagini/icone/BTNIncinerate.png"
    },
    "pancrazio_lancio_panca": {
        "id": "pancrazio_lancio_panca",
        "name": "Lancio della panca",
        "desc": "Attiva (1 volta per scontro): lancia un oggetto dello zaino contro il nemico, con il normale tiro per colpire. Danni secondo la rarità: scarso 1, comune 2, non comune 3, raro 4, epico 5, leggendario 6. Se colpisce l'oggetto si raccoglie a fine scontro (fino ad allora niente bonus), se manca è perso; un consumabile si consuma sempre",
        "isCombatActive": true,
        "actionName": "Lancio della panca (lancia un oggetto)",
        "icon": "immagini/icone/BTNStormBolt.png",
        "combat": { "dice": 1, "lancia": true, "useText": "🪑 {eroe} afferra {oggetto} e lo scaglia con forza disumana!", "hitLabel": "CENTRATO!", "hitText": "Colpo pieno: {danni} danni!" }
    },
    "pancrazio_lista_torti": {
        "id": "pancrazio_lista_torti",
        "name": "Lista dei Rancori",
        "desc": "Passiva: non può indossare armature né scudi e non riceve mai armatura (niente Difendi), ma dopo ogni scontro vinto in cui ha perso almeno 1 HP i suoi HP massimi aumentano di 1 per sempre",
        "isCombatActive": false,
        "effects": [
            { "effect": "hero_set", "stat": "noArmor", "val": 1 }
        ],
        "speciali": [
            { "quando": "fine_scontro", "fai": "hp_massimi", "val": 1, "se": "perso_hp_scontro" }
        ],
        "icon": "immagini/icone/BTNScroll.png"
    },
    "cassio_fiala_flammaurea": {
        "id": "cassio_fiala_flammaurea",
        "name": "Fiala di Flammaurea instabile",
        "desc": "Attiva (1 volta per scontro): senza tiro per colpire, scaglia una fiala sul nemico. Dado alchemico: 2-5 = 2 danni al nemico; 6 = 3 danni; 1 = la fiala gli esplode in mano e Cassio perde 1 HP (non scende sotto 1). Usa la sua azione del turno",
        "isCombatActive": true,
        "actionName": "Fiala di Flammaurea (danni, instabile)",
        "icon": "immagini/icone/BTNEnchantedVial.png",
        "combat": {
            "senzaTiro": true,
            "instabile": true,
            "effetti": [
                { "quando": "normale", "fai": "danni", "val": 2 },
                { "quando": "capolavoro", "fai": "danni", "val": 3 },
                { "quando": "fallimento", "fai": "ferisce_se", "val": 1 }
            ],
            "useText": "🧪 {eroe} stappa una fiala di Flammaurea e la scaglia..."
        }
    },
    "cassio_tintura_corteccia": {
        "id": "cassio_tintura_corteccia",
        "name": "Tintura di Corteccia",
        "desc": "Attiva (1 volta per scontro): senza tiro, dà la tintura a un eroe a scelta (anche a sé). Dado alchemico: 2-5 = +2 Armatura; 6 = +3 Armatura; 1 = i fumi irrobustiscono il nemico, +1 CA fino a fine scontro. Usa la sua azione del turno",
        "isCombatActive": true,
        "actionName": "Tintura di Corteccia (armatura, instabile)",
        "icon": "immagini/icone/BTNPotionGreenSmall.png",
        "combat": {
            "senzaTiro": true,
            "instabile": true,
            "effetti": [
                { "quando": "normale", "fai": "armatura", "val": 2, "bersaglio": "scelto" },
                { "quando": "capolavoro", "fai": "armatura", "val": 3, "bersaglio": "scelto" },
                { "quando": "fallimento", "fai": "rafforza_nemico", "stat": "ca", "val": 1 }
            ],
            "useText": "🧪 {eroe} passa a {bersaglio} una tintura di corteccia densa e amara..."
        }
    },
    "cassio_elisir_toro": {
        "id": "cassio_elisir_toro",
        "name": "Elisir del Toro",
        "desc": "Attiva (1 volta per scontro): senza tiro, dà l'elisir a un eroe a scelta (anche a sé). Dado alchemico: 2-5 = +1 Forza e +1 Danno per 2 round; 6 = +1 Forza e +1 Danno fino a fine scontro; 1 = −1 Forza per 2 round. Usa la sua azione del turno",
        "isCombatActive": true,
        "actionName": "Elisir del Toro (Forza e Danno, instabile)",
        "icon": "immagini/icone/BTNPotionPurple.png",
        "combat": {
            "senzaTiro": true,
            "instabile": true,
            "effetti": [
                { "quando": "normale", "fai": "potenzia", "stat": "str", "val": 1, "durata": 2, "bersaglio": "scelto" },
                { "quando": "normale", "fai": "potenzia", "stat": "dmg", "val": 1, "durata": 2, "bersaglio": "scelto" },
                { "quando": "capolavoro", "fai": "potenzia", "stat": "str", "val": 1, "bersaglio": "scelto" },
                { "quando": "capolavoro", "fai": "potenzia", "stat": "dmg", "val": 1, "bersaglio": "scelto" },
                { "quando": "fallimento", "fai": "potenzia", "stat": "str", "val": -1, "durata": 2, "bersaglio": "scelto" }
            ],
            "useText": "🧪 {eroe} fa bere a {bersaglio} un elisir che sa di sangue e ferro..."
        }
    },
    "ofelia_veleno_cava": {
        "id": "ofelia_veleno_cava",
        "name": "Veleno della Cava",
        "desc": "Attiva (1 volta per scontro): attacca con il normale tiro per colpire; se colpisce, oltre al danno avvelena il nemico, che perde 1 HP a inizio di ognuno dei 2 round successivi",
        "isCombatActive": true,
        "actionName": "Veleno della Cava (avvelena per 2 round)",
        "icon": "immagini/icone/BTNShadowStrike.png",
        "combat": {
            "dice": 1,
            "effetti": [
                { "quando": "colpo", "fai": "veleno_nemico", "val": 1, "durata": 2 }
            ],
            "useText": "🗡️ {eroe} intinge la lama in un veleno della Cava di Glauco...",
            "hitText": "La lama avvelenata affonda: infliggi {danni} danni e il veleno entra in circolo!"
        }
    },
    "ofelia_infierire_debole": {
        "id": "ofelia_infierire_debole",
        "name": "Infierire sul debole",
        "desc": "Passiva: ogni colpo a segno dell'eroe infligge +1 danno se il nemico è a metà vita o meno, +2 danni se è a un quarto della vita o meno",
        "isCombatActive": false,
        "speciali": [
            { "quando": "colpo", "fai": "danni", "val": 1, "se": "nemico_meta_quarto" },
            { "quando": "colpo", "fai": "danni", "val": 2, "se": "nemico_quarto" }
        ],
        "icon": "immagini/icone/BTNFanOfKnives.png"
    },
    "pandora_scudo_mutevole": {
        "id": "pandora_scudo_mutevole",
        "name": "Scudo del Mutevole",
        "desc": "Attiva (1 volta per scontro): senza tirare il dado, +1 Armatura a tutta la compagnia e toglie a tutti stordimento, veleno, silenzio e furia. Usa la sua azione del turno",
        "isCombatActive": true,
        "actionName": "Scudo del Mutevole (+1 Armatura e purifica la compagnia)",
        "icon": "immagini/icone/BTNDivineIntervention.png",
        "combat": {
            "senzaTiro": true,
            "effetti": [
                { "quando": "uso", "fai": "armatura", "val": 1, "bersaglio": "compagnia" },
                { "quando": "uso", "fai": "purifica", "bersaglio": "compagnia" }
            ],
            "useText": "🐉 {eroe} invoca Draken il Mutevole: la sua ala si stende sulla compagnia!"
        }
    },
    "pandora_voce_asi": {
        "id": "pandora_voce_asi",
        "name": "Voce degli Asi",
        "desc": "Passiva: quando l'eroe prega a un riposo e riesce, c'è una benedizione in più fra cui scegliere",
        "isCombatActive": false,
        "effects": [
            { "effect": "hero_set", "stat": "prayerExtraChoices", "val": 1 }
        ],
        "icon": "immagini/icone/BTNPriestAdept.png"
    },
    "mano_veloce": {
        "id": "mano_veloce",
        "name": "La mano è più veloce dell'occhio",
        "desc": "Passiva: finché l'eroe è vivo, il primo oggetto preso da ogni mercante è gratis, perché lo ruba (il medico si paga)",
        "isCombatActive": false,
        "effects": [
            { "effect": "hero_set", "stat": "freeFirstMerchantItem", "val": true }
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
        "combat": { "dice": 1, "requiresHitLastTurn": true, "damageTakenBonus": true, "useText": "🩸 {eroe} restituisce il colpo: dente per dente!", "hitLabel": "DENTE PER DENTE!", "hitText": "Il dolore diventa forza: infliggi {danni} danni!" }
    },
    "tanto_ho_tenacia": {
        "id": "tanto_ho_tenacia",
        "name": "Tanto ho tenacia",
        "desc": "Passiva: la prima volta che l'eroe va a 0 HP torna in piedi con 2 HP (una volta per campagna)",
        "isCombatActive": false,
        "speciali": [
            { "quando": "colpo_mortale", "fai": "rialza", "val": 2, "limite": "capitolo" }
        ],
        "icon": "immagini/icone/BTNAnkh.png"
    },
    "cerusico_da_battaglia": {
        "id": "cerusico_da_battaglia",
        "name": "Cerusico da Battaglia",
        "desc": "Passiva: dopo ogni scontro cura 1 HP all'eroe più ferito",
        "isCombatActive": false,
        "speciali": [
            { "quando": "fine_scontro", "fai": "cura", "val": 1, "bersaglio": "piu_ferito" }
        ],
        "icon": "immagini/icone/BTNHealingSalve.png"
    },
    "enea_hammergradiano_puro": {
        "id": "enea_hammergradiano_puro",
        "name": "Hammergradiano Puro",
        "desc": "Passiva: sangue delle antiche tribù di Hammergrad. +1 Forza e +1 Fede per sempre",
        "isCombatActive": false,
        "effects": [
            { "effect": "hero_stat", "stat": "str", "val": 1 },
            { "effect": "hero_stat", "stat": "fth", "val": 1 }
        ],
        "icon": "immagini/icone/BTNHeroMountainKing.png"
    },
    "aiace_malasorte": {
        "id": "aiace_malasorte",
        "name": "Malasorte",
        "desc": "Passiva: la sfortuna gli ha insegnato tutto. Ogni 3 tiri falliti (scontro, prove e preghiera) guadagna +1 Forza per sempre, fino a 3 volte per capitolo",
        "isCombatActive": false,
        "effects": [
            { "effect": "hero_set", "stat": "malasorte", "val": 1 }
        ],
        "icon": "immagini/icone/BTNBoneChimes.png"
    },
    "aiace_inciampare_nella_storia": {
        "id": "aiace_inciampare_nella_storia",
        "name": "Inciampare nella storia",
        "desc": "Attiva (1 volta per scontro): inciampa e piomba addosso al nemico. Colpisce sempre (vale come un 6) con +2 Danno, ma nella caduta perde 1 HP (mai sotto 1)",
        "isCombatActive": true,
        "actionName": "Inciampare nella storia (colpo sicuro, +2 Danno, si ferisce)",
        "icon": "immagini/icone/BTNBash.png",
        "combat": {
            "autoHit": true,
            "damageBonus": 2,
            "effetti": [
                { "quando": "uso", "fai": "ferisce_se", "val": 1 }
            ],
            "useText": "🎲 {eroe} inciampa e piomba addosso al nemico!",
            "hitLabel": "COLPO ROVINOSO!",
            "hitText": "Cade male, ma trascina il nemico con sé: {danni} danni!"
        }
    },
    "aurelio_ira_traboccante": {
        "id": "aurelio_ira_traboccante",
        "name": "Ira Traboccante",
        "desc": "Passiva: Arvale di Draken, non sopporta che le cose vadano storte. In scontro ogni tiro fallito della compagnia (anche il suo) gli dà 1 Collera, fino a 3: ogni carica è +1 al suo tiro per colpire e +1 a Difendi. A 3 cariche va in Furia (può solo attaccare) e il suo prossimo attacco fa +2 danni, poi la Collera torna a 0. Dopo l'attacco del nemico la Collera (e la Furia) si azzera",
        "isCombatActive": false,
        "effects": [
            { "effect": "hero_set", "stat": "iraTraboccante", "val": 1 }
        ],
        "icon": "immagini/icone/BTNBloodLust.png"
    },
    "aurelio_mano_di_draken": {
        "id": "aurelio_mano_di_draken",
        "name": "Mano di Draken",
        "desc": "Attiva (1 volta per scontro): senza tiro, impone le mani nel nome del Mutevole e cura 2 HP a un eroe a scelta (anche a sé). Usa la sua azione del turno",
        "isCombatActive": true,
        "actionName": "Mano di Draken (cura 2 HP a un eroe)",
        "icon": "immagini/icone/BTNHealingWave.png",
        "combat": {
            "senzaTiro": true,
            "effetti": [
                { "quando": "uso", "fai": "cura", "val": 2, "bersaglio": "scelto" }
            ],
            "useText": "🐉 {eroe} impone le mani nel nome di Draken il Mutevole!"
        }
    },
    "enea_scudo_del_nord": {
        "id": "enea_scudo_del_nord",
        "name": "Scudo del Nord",
        "desc": "Attiva (1 volta per scontro): senza tirare il dado, +2 Armatura all'eroe e +1 Armatura agli eroi accanto a lui. Usa la sua azione del turno",
        "isCombatActive": true,
        "actionName": "Scudo del Nord (+2 Armatura, +1 agli eroi accanto)",
        "icon": "immagini/icone/BTNFrostArmor.png",
        "combat": {
            "armorGain": 2,
            "effetti": [
                { "quando": "uso", "fai": "armatura", "val": 1, "bersaglio": "vicini" }
            ],
            "useText": "🛡️ {eroe} pianta lo Scudo del Nord: chi gli sta accanto è al riparo!"
        }
    }
};
