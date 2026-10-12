// Benedizioni degli Asi del Nord: si scelgono dopo una preghiera riuscita al riposo (js/prove.js).
// livello: "minore" o "maggiore"; bersaglio: "eroe" (scelto dal giocatore) o "party" (tutti).
// effetto: "prossimo_scontro" (buffs: [{ buff_stat, buff_val }] per tutto il prossimo scontro), "cura_party" (val HP ai vivi),
// "togli_maledizione" (la più recente), "fede" (+val Fede per sempre), "bottino_extra" (val oggetti in più al prossimo
// bottino), "dono" (resta sull'eroe: agiscono i suoi "speciali", effetti "quando → fai" di js/speciali.js).
// Il contenuto dopo "=" è JSON puro. Si modifica anche dall'editor delle campagne.
window.LIBRERIA = window.LIBRERIA || {};
window.LIBRERIA.benedizioni = {
    "mano_guidata": {
        "name": "Mira di Tillvaxt",
        "livello": "minore",
        "bersaglio": "eroe",
        "icon": "immagini/icone/BTNInnerFire.png",
        "desc": "+1 al tiro per colpire per tutto il prossimo scontro",
        "effetto": "prossimo_scontro",
        "buffs": [
            { "buff_stat": "att_bonus", "buff_val": 1 }
        ]
    },
    "lama_consacrata": {
        "name": "Zanna di Hvid",
        "livello": "minore",
        "bersaglio": "eroe",
        "icon": "immagini/icone/BTNHolyBolt.png",
        "desc": "+1 danno per tutto il prossimo scontro",
        "effetto": "prossimo_scontro",
        "buffs": [
            { "buff_stat": "dmg", "buff_val": 1 }
        ]
    },
    "scudo_della_fede": {
        "name": "Pietra di Sluta",
        "livello": "minore",
        "bersaglio": "eroe",
        "icon": "immagini/icone/BTNDevotion.png",
        "desc": "+2 Armatura all'inizio del prossimo scontro",
        "effetto": "prossimo_scontro",
        "buffs": [
            { "buff_stat": "current_armor", "buff_val": 2 }
        ]
    },
    "veglia": { "name": "Mani di Valgoren", "livello": "minore", "bersaglio": "party", "icon": "immagini/icone/BTNHealingWave.png", "desc": "Tutti gli eroi in piedi recuperano 1 HP", "effetto": "cura_party", "val": 1 },
    "purificazione": { "name": "Sentenza di Rattvisa", "livello": "minore", "bersaglio": "party", "icon": "immagini/icone/BTNDispelMagic.png", "desc": "Toglie la maledizione più recente", "effetto": "togli_maledizione" },
    "fede_incrollabile": { "name": "Bisbiglio di Draken", "livello": "maggiore", "bersaglio": "eroe", "icon": "immagini/icone/BTNElunesBlessing.png", "desc": "+1 Fede per sempre", "effetto": "fede", "val": 1 },
    "furia_sacra": {
        "name": "Collera di Allmän",
        "livello": "maggiore",
        "bersaglio": "eroe",
        "icon": "immagini/icone/BTNBloodLust.png",
        "desc": "+1 al tiro per colpire e +1 danno per tutto il prossimo scontro",
        "effetto": "prossimo_scontro",
        "buffs": [
            { "buff_stat": "att_bonus", "buff_val": 1 },
            { "buff_stat": "dmg", "buff_val": 1 }
        ]
    },
    "abbondanza": { "name": "Passero di Gomd", "livello": "maggiore", "bersaglio": "party", "icon": "immagini/icone/BTNChestOfGold.png", "desc": "Al prossimo bottino di uno scontro si scopre un oggetto in più fra cui scegliere", "effetto": "bottino_extra", "val": 1 }
};
