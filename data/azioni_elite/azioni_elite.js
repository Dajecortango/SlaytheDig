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
// turnoPreparazione + turnoTestoPreparazione ({nemico} = nome), turnoCrescitaDanno, turnoRigenera, turnoAura, turnoRubaVita,
// turnoColpoOdio (dopo il colpo normale, un secondo colpo con questi danni all'eroe con più HP + armatura fra gli altri).
// Il contenuto dopo "=" è JSON puro. Si modifica anche dall'editor delle campagne.
window.LIBRERIA = window.LIBRERIA || {};
window.LIBRERIA.azioni_elite = {
    "contrattacco": { "name": "Contrattacco", "desc": "Colpisce subito l'eroe che lo ha ferito", "colpo": "attaccante" },
    "colpo_area": { "name": "Colpo ad area", "desc": "Colpisce subito l'eroe che lo ha ferito e fa 1 danno agli eroi accanto", "colpo": "attaccante", "colpoVicini": 1 },
    "carica": {
        "name": "Carica",
        "desc": "Carica: un turno raspa il terreno, il successivo travolge il bersaglio e fa 1 danno agli eroi accanto",
        "turno": true,
        "turnoBersaglio": "scelto",
        "turnoVicini": 1,
        "turnoPreparazione": true,
        "turnoTestoPreparazione": "{nemico} raspa il terreno: al prossimo turno travolgerà la compagnia!"
    },
    "travolge": { "name": "Travolge", "desc": "Travolge a ogni turno: colpo pieno al bersaglio e 1 danno agli eroi accanto", "turno": true, "turnoBersaglio": "scelto", "turnoVicini": 1 },
    "predatore": { "name": "Predatore", "desc": "Predatore: sceglie da solo l'eroe con meno HP + armatura", "turno": true, "turnoBersaglio": "piu_debole" },
    "furia": { "name": "Furia", "desc": "+1 danno a ogni suo turno", "turno": true, "turnoBersaglio": "scelto", "turnoCrescitaDanno": 1 },
    "furore": { "name": "Furore", "desc": "+1 danno da questo momento", "bonusDanno": 1 },
    "ruggito_primordiale": { "name": "Ruggito primordiale", "desc": "-1 al tiro per colpire nel prossimo turno degli eroi (non per chi ha Fede 4+)", "malus": 1, "malusRound": 1, "resisteFede": 4 },
    "grido_di_battaglia": { "name": "Grido di battaglia", "desc": "-1 al tiro per colpire nel prossimo turno degli eroi (non per chi ha Fede 3+)", "malus": 1, "malusRound": 1, "resisteFede": 3 },
    "rigenerazione": { "name": "Rigenerazione", "desc": "Da questo momento recupera 1 HP all'inizio di ogni suo turno", "turno": true, "turnoBersaglio": "scelto", "turnoRigenera": 1 },
    "doppio_assalto": { "name": "Doppio assalto", "desc": "Da questo momento attacca due volte a ogni turno", "turno": true, "turnoBersaglio": "scelto", "turnoColpi": 2 },
    "spazzata": { "name": "Spazzata", "desc": "Da questo momento a ogni turno colpisce tutta la compagnia per 1 danno", "turno": true, "turnoBersaglio": "tutti", "turnoDanno": 1 },
    "aura_gelida": { "name": "Aura gelida", "desc": "Da questo momento, prima di ogni attacco, fa 1 danno a tutti gli eroi", "turno": true, "turnoBersaglio": "scelto", "turnoAura": 1 },
    "sete_di_sangue": { "name": "Sete di sangue", "desc": "Da questo momento recupera tanti HP quanti ne toglie agli eroi", "turno": true, "turnoBersaglio": "scelto", "turnoRubaVita": true },
    "duellante": { "name": "Duellante", "desc": "Da questo momento sfida da solo l'eroe con più HP + armatura", "turno": true, "turnoBersaglio": "piu_forte" },
    "imprevedibile": { "name": "Imprevedibile", "desc": "Da questo momento colpisce un eroe a caso, annunciato a inizio turno", "turno": true, "turnoBersaglio": "casuale", "bonusDanno": 1 },
    "corazza_di_pietra": { "name": "Corazza di pietra", "desc": "+2 CA: da questo momento è più difficile da colpire", "bonusCA": 2 },
    "secondo_vento": { "name": "Secondo vento", "desc": "Recupera subito 4 HP", "cura": 4 },
    "frantuma_scudi": { "name": "Frantuma scudi", "desc": "Tutti gli eroi perdono subito l'armatura", "spezzaArmatura": "tutti" },
    "urlo_paralizzante": { "name": "Urlo paralizzante", "desc": "L'eroe che lo ha ferito salta il suo prossimo turno", "stordisce": "attaccante" },
    "terrore": { "name": "Terrore", "desc": "-1 al tiro per colpire degli eroi per 2 turni (non per chi ha Fede 5+)", "malus": 1, "malusRound": 2, "resisteFede": 5 },
    "esplosione": { "name": "Esplosione", "desc": "Fa subito 2 danni a tutta la compagnia", "colpo": "tutti", "colpoDanno": 2 },
    "vendetta_sul_debole": { "name": "Vendetta sul debole", "desc": "Colpisce subito l'eroe con meno HP + armatura", "colpo": "piu_debole" },
    "pelle_di_brina": {
        "name": "Pelle di Brina",
        "desc": "La pelle si copre di ghiaccio: +2 CA, e chi lo colpisce si ferisce (1 danno)",
        "bonusCA": 2,
        "speciali": [
            { "quando": "colpito", "fai": "danni", "val": 1 }
        ]
    },
    "morso_velenoso": {
        "name": "Morso Velenoso",
        "desc": "Da ora ogni suo colpo avvelena: -1 HP a ogni round per 3 round, l'armatura non para",
        "speciali": [
            { "quando": "colpisce", "fai": "veleno", "val": 1, "durata": 3 }
        ]
    },
    "nube_tossica": {
        "name": "Nube Tossica",
        "desc": "Avvelena tutta la compagnia: -1 HP a ogni round per 2 round",
        "speciali": [
            { "quando": "soglia", "fai": "veleno", "val": 1, "durata": 2, "bersaglio": "tutti" }
        ]
    },
    "ladro_di_tombe": {
        "name": "Ladro di Tombe",
        "desc": "+1 Attacco; da ora ogni suo colpo ruba 5 Scudi",
        "bonusAttacco": 1,
        "speciali": [
            { "quando": "colpisce", "fai": "ruba_scudi", "val": 5 }
        ]
    },
    "ultimo_sangue": { "name": "Ultimo Sangue", "desc": "La furia del morente: recupera 4 HP e fa 1 danno in più", "cura": 4, "bonusDanno": 1 },
    "ululato_del_branco": {
        "name": "Ululato del Branco",
        "desc": "A inizio di ogni round, 30% di probabilità di stordire un eroe a caso",
        "speciali": [
            { "quando": "inizio_round", "prob": 30, "fai": "stordisci", "bersaglio": "casuale" }
        ]
    },
    "frenesia": { "name": "Frenesia", "desc": "Colpisce due volte a ogni turno, ma si scopre: -2 CA", "bonusCA": -2, "turno": true, "turnoBersaglio": "scelto", "turnoColpi": 2 },
    "maledizione_del_sangue": {
        "name": "Maledizione del Sangue",
        "desc": "Chi lo colpisce ha -1 al tiro per colpire nel round dopo",
        "speciali": [
            { "quando": "colpito", "fai": "malus", "val": 1, "durata": 1 }
        ]
    },
    "scudo_d_ossa": {
        "name": "Scudo d'Ossa",
        "desc": "+3 CA, ma lo scudo si sgretola: -1 CA a ogni round (per 3 round)",
        "bonusCA": 3,
        "speciali": [
            { "quando": "inizio_round", "fai": "potenzia", "stat": "ca", "val": -1, "limite": "scontro", "volte": 3 }
        ]
    },
    "bersaglio_marcato": { "name": "Bersaglio Marcato", "desc": "Da ora attacca sempre l'eroe più forte, con 1 danno in più", "bonusDanno": 1, "turno": true, "turnoBersaglio": "piu_forte" },
    "pioggia_di_frecce": { "name": "Pioggia di Frecce", "desc": "A ogni turno 1 danno a tutta la compagnia, ma il suo attacco fa 1 danno in meno", "bonusDanno": -1, "turno": true, "turnoBersaglio": "scelto", "turnoAura": 1 },
    "furia_ultimo_round": { "name": "Furia dell'Ultimo Round", "desc": "Da usare in una soglia a tempo (es. round 5): +2 danni e travolge anche gli eroi accanto", "bonusDanno": 2, "turno": true, "turnoBersaglio": "scelto", "turnoVicini": 1 },
    "rito_di_sangue": { "name": "Rito di Sangue", "desc": "Da usare in una soglia a tempo (es. round 3): il rito si compie e recupera 5 HP", "cura": 5 },
    "colpo_d_odio": {
        "name": "Colpo d'Odio",
        "desc": "A ogni turno, dopo il colpo al bersaglio, 2 danni all'eroe con più HP + armatura fra gli altri: chi difende lo attira su di sé",
        "turno": true,
        "turnoBersaglio": "scelto",
        "turnoColpoOdio": 2
    }
};
