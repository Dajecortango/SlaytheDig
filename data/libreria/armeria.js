// Armeria: tutti gli oggetti (armi, armature, consumabili...), condivisi dalle campagne.
// Le campagne li richiamano per id in "initialArmory" e "lootItems".
// Il contenuto dopo "=" è JSON puro. Si modifica anche dall'editor delle campagne.
window.LIBRERIA = window.LIBRERIA || {};
window.LIBRERIA.armeria = {
    "spada": { "id": "spada", "name": "Spada", "str": 1, "desc": "+1 Forza", "icon": "immagini/icone/BTNSteelMelee.png" },
    "ascia": { "id": "ascia", "name": "Ascia", "dmg": 1, "desc": "+1 Danno", "icon": "immagini/icone/BTNOrcMeleeUpOne.png" },
    "alabarda": { "id": "alabarda", "name": "Alabarda", "help_bonus_val": 1, "desc": "+1 Tiro Aiuto", "icon": "immagini/icone/BTNEnvenomedSpear.png" },
    "scudo": { "id": "scudo", "name": "Scudo", "def_armor": 1, "desc": "+1 Armatura con Difendi", "icon": "immagini/icone/BTNHumanArmorUpOne.png" },
    "armatura_leggera": { "id": "armatura_leggera", "name": "Armatura leggera", "armor": 1, "desc": "+1 Punti Armatura", "icon": "immagini/icone/BTNReinforcedHides.png" },
    "armatura_pesante": { "id": "armatura_pesante", "name": "Armatura pesante", "armor": 2, "desc": "+2 Punti Armatura", "icon": "immagini/icone/BTNMoonArmor.png" },
    "libro_fede": {
        "id": "libro_fede",
        "icon": "immagini/icone/BTNSpellBookBLS.png",
        "name": "Libro di fede",
        "fth": 1,
        "scaling": [
            { "stat": "armor", "per": "fth", "every": 3 }
        ],
        "desc": "+1 Fede; +1 Armatura ogni 3 Fede"
    },
    "tomo_conoscenza": {
        "id": "tomo_conoscenza",
        "icon": "immagini/icone/BTNTomeOfIntelligence.png",
        "name": "Tomo di conoscenza",
        "int": 1,
        "scaling": [
            { "stat": "help_bonus_val", "per": "int", "every": 3 }
        ],
        "desc": "+1 Intelligenza; +1 Aiuto ogni 3 Intelligenza"
    },
    "unguento": { "id": "unguento", "name": "Unguento lenitivo", "type": "consumable_heal", "heal_val": 2, "desc": "Consumabile: Cura 2 HP", "icon": "immagini/icone/BTNHealingSalve.png" },
    "spada_affilata": { "id": "spada_affilata", "name": "Spada affilata", "rarity": "non_comune", "str": 1, "dmg": 1, "desc": "+1 Forza, +1 Danno", "icon": "immagini/icone/BTNThoriumMelee.png" },
    "ascia_pesante": { "id": "ascia_pesante", "name": "Ascia pesante", "rarity": "non_comune", "dmg": 2, "desc": "+2 Danni", "icon": "immagini/icone/BTNOrcMeleeUpThree.png" },
    "armatura_leggera_loot": { "id": "armatura_leggera_loot", "name": "Armatura leggera", "rarity": "comune", "armor": 1, "desc": "+1 Armatura", "icon": "immagini/icone/BTNReinforcedHides.png" },
    "armatura_pesante_loot": { "id": "armatura_pesante_loot", "name": "Armatura pesante", "rarity": "raro", "armor": 2, "desc": "+2 Armatura", "icon": "immagini/icone/BTNMoonArmor.png" },
    "pozione": { "id": "pozione", "name": "Pozione di guarigione", "rarity": "raro", "type": "consumable_full", "desc": "Consumabile: Recupera 100% HP", "icon": "immagini/icone/BTNPotionRed.png" },
    "amuleto": { "id": "amuleto", "name": "Amuleto sacro", "rarity": "comune", "fth": 1, "desc": "+1 Fede", "icon": "immagini/icone/BTNAmulet.png" },
    "anello": { "id": "anello", "name": "Anello della concentrazione", "rarity": "comune", "int": 1, "desc": "+1 Intelligenza", "icon": "immagini/icone/BTNRingPurple.png" },
    "scudo_pesante": { "id": "scudo_pesante", "name": "Scudo pesante", "rarity": "non_comune", "def_armor": 1, "def_bonus": 1, "desc": "+1 Armatura con Difendi, +1 Tiro Difesa", "icon": "immagini/icone/BTNShieldOfHonor.png" },
    "pugnale_rapido": { "id": "pugnale_rapido", "name": "Pugnale Rapido", "rarity": "comune", "str": 1, "desc": "+1 Forza", "icon": "immagini/icone/BTNDaggerOfEscape.png" },
    "ascia_taglialegna": { "id": "ascia_taglialegna", "name": "Ascia da Taglialegna", "rarity": "scarso", "dmg": 1, "desc": "+1 Danno", "icon": "immagini/icone/BTNSturdyWarAxe.png" },
    "bastone_rinforzato": { "id": "bastone_rinforzato", "name": "Bastone Rinforzato", "rarity": "scarso", "help_bonus_val": 1, "desc": "+1 Tiro Aiuto", "icon": "immagini/icone/BTNAncestralStaff.png" },
    "scudo_legno": { "id": "scudo_legno", "name": "Scudo Tondo di Legno", "rarity": "scarso", "def_armor": 1, "desc": "+1 Armatura con Difendi", "icon": "immagini/icone/BTNSteelArmor.png" },
    "corazza_cuoio": { "id": "corazza_cuoio", "name": "Corazza di Cuoio Bollito", "rarity": "scarso", "armor": 1, "desc": "+1 Armatura", "icon": "immagini/icone/BTNLeatherUpgradeOne.png" },
    "amuleto_legno_santo": {
        "id": "amuleto_legno_santo",
        "icon": "immagini/icone/BTNPeriapt1.png",
        "name": "Amuleto di Legno Consacrato",
        "rarity": "non_comune",
        "fth": 1,
        "scaling": [
            { "stat": "armor", "per": "fth", "every": 3 }
        ],
        "desc": "+1 Fede; +1 Armatura ogni 3 Fede"
    },
    "taccuino_cartografo": {
        "id": "taccuino_cartografo",
        "icon": "immagini/icone/BTNGerardsLostLedger.png",
        "name": "Taccuino del Cartografo",
        "rarity": "non_comune",
        "int": 1,
        "scaling": [
            { "stat": "help_bonus_val", "per": "int", "every": 3 }
        ],
        "desc": "+1 Intelligenza; +1 Aiuto ogni 3 Intelligenza"
    },
    "balsamo_curativo": { "id": "balsamo_curativo", "name": "Balsamo Lenitivo", "rarity": "comune", "type": "consumable_heal", "heal_val": 2, "desc": "Consumabile: Cura 2 HP", "icon": "immagini/icone/BTNSnazzyPotion.png" },
    "spada_norgrad": { "id": "spada_norgrad", "name": "Spada in Lega di Kol", "rarity": "raro", "str": 1, "dmg": 1, "desc": "+1 Forza, +1 Danno", "icon": "immagini/icone/BTNArcaniteMelee.png" },
    "alabarda_guardia": {
        "id": "alabarda_guardia",
        "icon": "immagini/icone/BTNImpalingBolt.png",
        "name": "Alabarda da Guardia",
        "rarity": "raro",
        "help_bonus_val": 1,
        "scaling": [
            { "stat": "str", "per": "int", "every": 3 }
        ],
        "desc": "+1 Aiuto; +1 Forza ogni 3 Intelligenza"
    },
    "mannaia_pesante": { "id": "mannaia_pesante", "name": "Mannaia Pesante", "rarity": "epico", "dmg": 3, "desc": "+3 Danni", "icon": "immagini/icone/BTNOrcMeleeUpTwo.png" },
    "scudo_ferro": { "id": "scudo_ferro", "name": "Scudo Rinforzato in Ferro", "rarity": "raro", "def_armor": 2, "def_bonus": 1, "desc": "+2 Armatura con Difendi, +1 Tiro Difesa", "icon": "immagini/icone/BTNHumanArmorUpTwo.png" },
    "corazza_scaglie": { "id": "corazza_scaglie", "name": "Corazza a Scaglie", "rarity": "raro", "armor": 2, "desc": "+2 Armatura, +1 Tiro Difesa", "icon": "immagini/icone/BTNNagaArmorUp1.png", "def_bonus": 1 },
    "tomo_proibito": {
        "id": "tomo_proibito",
        "icon": "immagini/icone/BTNBookOfTheDead.png",
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
        "icon": "immagini/icone/BTNSacredRelic.png",
        "name": "Reliquiario Tascabile",
        "rarity": "raro",
        "fth": 1,
        "scaling": [
            { "stat": "armor", "per": "fth", "every": 2 }
        ],
        "desc": "+1 Fede; +1 Armatura ogni 2 Fede"
    },
    "pozione_rigenerazione": { "id": "pozione_rigenerazione", "name": "Pozione di Rigenerazione", "rarity": "raro", "type": "consumable_full", "desc": "Consumabile: Ripristina 100% HP", "icon": "immagini/icone/BTNPotionOfRestoration.png" },
    "unguento_fortificante": { "id": "unguento_fortificante", "name": "Unguento Fortificante", "rarity": "non_comune", "type": "consumable_heal", "heal_val": 3, "desc": "Consumabile: Cura 3 HP", "icon": "immagini/icone/BTNPotionGreen.png" },
    "lama_acciaio_lunare": { "id": "lama_acciaio_lunare", "name": "Lama d'Acciaio Lunare", "rarity": "epico", "str": 2, "dmg": 2, "desc": "+2 Forza, +2 Danno", "icon": "immagini/icone/BTNFrostMourne.png" },
    "martello_breccia": { "id": "martello_breccia", "name": "Martello della Breccia", "rarity": "epico", "dmg": 3, "desc": "+3 Danni, +2 Armatura", "icon": "immagini/icone/BTNHammer.png", "armor": 2 },
    "gorgiera_veterano": { "id": "gorgiera_veterano", "name": "Gorgiera del Veterano", "rarity": "epico", "armor": 3, "def_bonus": 1, "desc": "+3 Armatura, +1 Tiro Difesa", "icon": "immagini/icone/BTNImprovedMoonArmor.png" },
    "corazza_piastre_leone": { "id": "corazza_piastre_leone", "name": "Corazza a Piastre del Leone", "rarity": "epico", "armor": 2, "desc": "+2 Armatura, +1 Forza, +1 Danno", "icon": "immagini/icone/BTNBladeBaneArmor.png", "dmg": 1, "str": 1 },
    "cappa_sussurri": {
        "id": "cappa_sussurri",
        "icon": "immagini/icone/BTNCloak.png",
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
        "icon": "immagini/icone/BTNPeriapt.png",
        "name": "Simbolo Primordiale di Jag Antar",
        "rarity": "leggendario",
        "fth": 2,
        "scaling": [
            { "stat": "str", "per": "fth", "every": 2 }
        ],
        "desc": "+2 Fede; +1 Forza ogni 2 Fede"
    },
    "elisir_sangue_vivo": { "id": "elisir_sangue_vivo", "name": "Elisir di Sangue Vivo", "rarity": "epico", "type": "consumable_full", "desc": "Consumabile: Ripristina tutti gli HP", "icon": "immagini/icone/BTNPotionOfVampirism.png" },
    "olio_bollente": { "id": "olio_bollente", "name": "Fiala di Olio Bollente", "rarity": "comune", "type": "consumable_damage", "dmg_val": 1, "desc": "Consumabile: 1 danno al nemico", "icon": "immagini/icone/BTNLiquidFire.png" },
    "bomba_acido": { "id": "bomba_acido", "name": "Bomba d'Acido", "rarity": "raro", "type": "consumable_damage", "dmg_val": 2, "desc": "Consumabile: 2 danni al nemico", "icon": "immagini/icone/BTNAcidBomb.png" },
    "cristallo_flammaurea": { "id": "cristallo_flammaurea", "name": "Cristallo di Flammaurea", "rarity": "epico", "type": "consumable_damage", "dmg_val": 3, "desc": "Consumabile: 3 danni al nemico", "icon": "immagini/oggetti/cristallo_flammaurea.webp" },
    "grappa_soldato": { "id": "grappa_soldato", "name": "Grappa del Soldato", "rarity": "comune", "type": "consumable_buff", "buff_stat": "str", "buff_val": 1, "buff_rounds": 1, "desc": "Consumabile: +1 Forza per 1 round", "icon": "immagini/icone/BTNDrunkenDodge.png" },
    "infuso_corteccia": { "id": "infuso_corteccia", "name": "Infuso di Corteccia", "rarity": "non_comune", "type": "consumable_buff", "buff_stat": "current_armor", "buff_val": 2, "desc": "Consumabile: +2 Armatura subito", "icon": "immagini/icone/BTNScrollOfProtection.png" },
    "olio_da_lama": { "id": "olio_da_lama", "name": "Olio da Lama", "rarity": "non_comune", "type": "consumable_buff", "buff_stat": "dmg", "buff_val": 1, "buff_rounds": 3, "desc": "Consumabile: +1 Danno per 3 round", "icon": "immagini/icone/BTNOrbOfFire.png" },
    "pozione_pelle_pietra": {
        "id": "pozione_pelle_pietra",
        "name": "Pozione di Pelle di Pietra",
        "rarity": "raro",
        "type": "consumable_buff",
        "buff_stat": "def_armor",
        "buff_val": 1,
        "desc": "Consumabile: +1 Armatura con Difendi per tutto lo scontro",
        "icon": "immagini/icone/BTNPotionOfDivinity.png"
    },
    "elisir_berserker": { "id": "elisir_berserker", "name": "Elisir del Berserker", "rarity": "epico", "type": "consumable_buff", "buff_stat": "str", "buff_val": 2, "desc": "Consumabile: +2 Forza per tutto lo scontro", "icon": "immagini/icone/BTNBerserk.png" },
    "ankh_pellegrino": {
        "id": "ankh_pellegrino",
        "icon": "immagini/icone/BTNAnkh.png",
        "name": "Cappuccio del Pellegrino",
        "rarity": "comune",
        "scaling": [
            { "stat": "def_bonus", "per": "fth", "every": 2 }
        ],
        "desc": "+1 Difesa ogni 2 Fede"
    },
    "bastone_eremita": {
        "id": "bastone_eremita",
        "icon": "immagini/icone/BTNMindStaff.png",
        "name": "Bastone dell'Eremita",
        "rarity": "comune",
        "scaling": [
            { "stat": "help_bonus_val", "per": "int", "every": 2 }
        ],
        "desc": "+1 Aiuto ogni 2 Intelligenza"
    },
    "martello_consacrato": {
        "id": "martello_consacrato",
        "icon": "immagini/icone/BTNHolyBolt.png",
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
        "icon": "immagini/icone/BTNRunedBracers.png",
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
        "icon": "immagini/icone/BTNAssassinsBlade.png",
        "name": "Stocco del Duellante",
        "rarity": "raro",
        "scaling": [
            { "stat": "str", "per": "int", "every": 2, "max": 3 }
        ],
        "desc": "+1 Forza ogni 2 Intelligenza (max +3)"
    },
    "scettro_savio": {
        "id": "scettro_savio",
        "icon": "immagini/icone/BTNScepterOfMastery.png",
        "name": "Scettro del Savio",
        "rarity": "leggendario",
        "int": 1,
        "scaling": [
            { "stat": "dmg", "per": "int", "every": 2 }
        ],
        "desc": "+1 Intelligenza; +1 Danno ogni 2 Intelligenza"
    },
    "corona_martire": {
        "id": "corona_martire",
        "icon": "immagini/icone/BTNCirclet.png",
        "name": "Amuleto dei Cicli",
        "rarity": "leggendario",
        "fth": 1,
        "scaling": [
            { "stat": "str", "per": "fth", "every": 2 },
            { "stat": "def_bonus", "per": "fth", "every": 3 }
        ],
        "desc": "+1 Fede; +1 Forza ogni 2 Fede; +1 Difesa ogni 3 Fede"
    }
};

// Bottino delle campagne con "lootItems": null
window.LIBRERIA.lootPredefinito = ["spada_affilata", "ascia_pesante", "armatura_leggera_loot", "armatura_pesante_loot", "pozione", "amuleto", "anello", "scudo_pesante", "olio_bollente", "bomba_acido", "cristallo_flammaurea", "grappa_soldato", "infuso_corteccia", "olio_da_lama", "pozione_pelle_pietra", "elisir_berserker"];
