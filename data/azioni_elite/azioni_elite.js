// Azioni speciali degli elite e dei boss: le fasi del bestiario ("fasi": [{ soglia, testo, azioni }])
// le richiamano per id e scattano quando il nemico scende sotto la soglia di vita.
// Solo dati, interpretati da js/combattimento.js (applyEliteAction, resolveEnemyTurn): un'azione nuova
// si crea dall'editor (scheda "Azioni elite") combinando i campi, senza codice.
// Subito, alla soglia: colpo (attacco in risposta: "attaccante", "tutti", "piu_debole", "piu_forte", "casuale"),
// colpoDanno (vuoto = danno del nemico), colpoVicini (danno agli eroi accanto), bonusDanno, bonusAttacco, bonusCA,
// cura (HP del nemico), malus / malusRound / resisteFede (malus al tiro per colpire degli eroi),
// stordisce e spezzaArmatura (stessi bersagli di colpo).
// Da quel momento, a ogni turno del nemico ("turno": true; sostituisce il modo di attaccare di prima):
// turnoBersaglio ("scelto", "piu_debole", "piu_forte", "casuale", "tutti"), turnoDanno, turnoColpi, turnoVicini,
// turnoPreparazione + turnoTestoPreparazione ({nemico} = nome), turnoCrescitaDanno, turnoRigenera, turnoAura, turnoRubaVita.
// Il contenuto dopo "=" è JSON puro. Si modifica anche dall'editor delle campagne.
window.LIBRERIA = window.LIBRERIA || {};
window.LIBRERIA.azioni_elite = {
    "contrattacco": {
        "name": "Contrattacco",
        "desc": "Colpisce subito l'eroe che lo ha ferito",
        "colpo": "attaccante"
    },
    "colpo_area": {
        "name": "Colpo ad area",
        "desc": "Colpisce subito l'eroe che lo ha ferito e fa 1 danno agli eroi accanto",
        "colpo": "attaccante",
        "colpoVicini": 1
    },
    "carica": {
        "name": "Carica",
        "desc": "Carica: un turno raspa il terreno, il successivo travolge il bersaglio e fa 1 danno agli eroi accanto",
        "turno": true,
        "turnoBersaglio": "scelto",
        "turnoVicini": 1,
        "turnoPreparazione": true,
        "turnoTestoPreparazione": "{nemico} raspa il terreno: al prossimo turno travolgerà la compagnia!"
    },
    "travolge": {
        "name": "Travolge",
        "desc": "Travolge a ogni turno: colpo pieno al bersaglio e 1 danno agli eroi accanto",
        "turno": true,
        "turnoBersaglio": "scelto",
        "turnoVicini": 1
    },
    "predatore": {
        "name": "Predatore",
        "desc": "Predatore: sceglie da solo l'eroe con meno HP + armatura",
        "turno": true,
        "turnoBersaglio": "piu_debole"
    },
    "furia": {
        "name": "Furia",
        "desc": "+1 danno a ogni suo turno",
        "turno": true,
        "turnoBersaglio": "scelto",
        "turnoCrescitaDanno": 1
    },
    "furore": {
        "name": "Furore",
        "desc": "+1 danno da questo momento",
        "bonusDanno": 1
    },
    "ruggito_primordiale": {
        "name": "Ruggito primordiale",
        "desc": "-1 al tiro per colpire nel prossimo turno degli eroi (non per chi ha Fede 4+)",
        "malus": 1,
        "malusRound": 1,
        "resisteFede": 4
    },
    "grido_di_battaglia": {
        "name": "Grido di battaglia",
        "desc": "-1 al tiro per colpire nel prossimo turno degli eroi (non per chi ha Fede 3+)",
        "malus": 1,
        "malusRound": 1,
        "resisteFede": 3
    },
    "rigenerazione": {
        "name": "Rigenerazione",
        "desc": "Da questo momento recupera 1 HP all'inizio di ogni suo turno",
        "turno": true,
        "turnoBersaglio": "scelto",
        "turnoRigenera": 1
    },
    "doppio_assalto": {
        "name": "Doppio assalto",
        "desc": "Da questo momento attacca due volte a ogni turno",
        "turno": true,
        "turnoBersaglio": "scelto",
        "turnoColpi": 2
    },
    "spazzata": {
        "name": "Spazzata",
        "desc": "Da questo momento a ogni turno colpisce tutta la compagnia per 1 danno",
        "turno": true,
        "turnoBersaglio": "tutti",
        "turnoDanno": 1
    },
    "aura_gelida": {
        "name": "Aura gelida",
        "desc": "Da questo momento, prima di ogni attacco, fa 1 danno a tutti gli eroi",
        "turno": true,
        "turnoBersaglio": "scelto",
        "turnoAura": 1
    },
    "sete_di_sangue": {
        "name": "Sete di sangue",
        "desc": "Da questo momento recupera tanti HP quanti ne toglie agli eroi",
        "turno": true,
        "turnoBersaglio": "scelto",
        "turnoRubaVita": true
    },
    "duellante": {
        "name": "Duellante",
        "desc": "Da questo momento sfida da solo l'eroe con più HP + armatura",
        "turno": true,
        "turnoBersaglio": "piu_forte"
    },
    "imprevedibile": {
        "name": "Imprevedibile",
        "desc": "Da questo momento colpisce un eroe a caso, annunciato a inizio turno",
        "turno": true,
        "turnoBersaglio": "casuale",
        "bonusDanno": 1
    },
    "corazza_di_pietra": {
        "name": "Corazza di pietra",
        "desc": "+2 CA: da questo momento è più difficile da colpire",
        "bonusCA": 2
    },
    "secondo_vento": {
        "name": "Secondo vento",
        "desc": "Recupera subito 4 HP",
        "cura": 4
    },
    "frantuma_scudi": {
        "name": "Frantuma scudi",
        "desc": "Tutti gli eroi perdono subito l'armatura",
        "spezzaArmatura": "tutti"
    },
    "urlo_paralizzante": {
        "name": "Urlo paralizzante",
        "desc": "L'eroe che lo ha ferito salta il suo prossimo turno",
        "stordisce": "attaccante"
    },
    "terrore": {
        "name": "Terrore",
        "desc": "-1 al tiro per colpire degli eroi per 2 turni (non per chi ha Fede 5+)",
        "malus": 1,
        "malusRound": 2,
        "resisteFede": 5
    },
    "esplosione": {
        "name": "Esplosione",
        "desc": "Fa subito 2 danni a tutta la compagnia",
        "colpo": "tutti",
        "colpoDanno": 2
    },
    "vendetta_sul_debole": {
        "name": "Vendetta sul debole",
        "desc": "Colpisce subito l'eroe con meno HP + armatura",
        "colpo": "piu_debole"
    }
};
