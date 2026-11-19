// Reliquie: ricompense delle sfide, condivise dalle campagne.
// Le sfide le richiamano per id nel campo "reward". "effects" agisce quando si ottiene la reliquia,
// "speciali" sono gli effetti "quando → fai" (vocabolario in js/comune.js, motore in js/motore/speciali.js).
// Il contenuto dopo "=" è JSON puro. Si modifica anche dall'editor delle campagne.
window.LIBRERIA = window.LIBRERIA || {};
window.LIBRERIA.reliquie = {
    "anello_d_arvale": {
        "type": "relic",
        "name": "Anello d'Arvale",
        "desc": "+1 Fede a un eroe (chi supera la prova)",
        "effects": [
            { "effect": "hero_stat", "stat": "fth", "val": 1 }
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
        "desc": "+1 ai tiri di attacco a un eroe (chi supera la prova)",
        "effects": [
            { "effect": "hero_stat", "stat": "att_bonus", "val": 1 }
        ]
    },
    "mappa_della_regione": {
        "type": "relic",
        "name": "Mappa della regione",
        "desc": "+1 Intelligenza a un eroe (chi supera la prova)",
        "effects": [
            { "effect": "hero_stat", "stat": "int", "val": 1 }
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
        "desc": "+1 ai prossimi 6 tiri di dado, poi si rompe",
        "speciali": [
            { "quando": "tiro", "fai": "bonus_tiro", "val": 1, "limite": "capitolo", "volte": 6, "rompe": true }
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
        "desc": "+1 permanente alla Fede a un eroe (chi supera la prova)",
        "effects": [
            { "effect": "hero_stat", "stat": "fth", "val": 1 }
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
        "desc": "+1 Fede a un eroe (chi supera la prova)",
        "effects": [
            { "effect": "hero_stat", "stat": "fth", "val": 1 }
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
        "desc": "+1 ai tiri per colpire a un eroe (chi supera la prova)",
        "effects": [
            { "effect": "hero_stat", "stat": "att_bonus", "val": 1 }
        ]
    },
    "bussola_del_sopravvissuto": {
        "type": "relic",
        "name": "Bussola del Sopravvissuto",
        "desc": "+1 Intelligenza a un eroe (chi supera la prova)",
        "effects": [
            { "effect": "hero_stat", "stat": "int", "val": 1 }
        ]
    },
    "reliquia_del_monolite": {
        "type": "relic",
        "name": "Reliquia del Monolite",
        "desc": "+1 Danno a un eroe (chi supera la prova)",
        "effects": [
            { "effect": "hero_stat", "stat": "dmg", "val": 1 }
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
        "desc": "La prova della tenacia di un Dignitas: +1 Forza a un eroe (chi supera la prova)",
        "effects": [
            { "effect": "hero_stat", "val": 1, "stat": "str" }
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
    },
    "spirito_di_piotr": {
        "type": "relic",
        "name": "Spirito di Piotr",
        "desc": "Lo spirito indomito dell'eroe lungobarbo vi accompagna: +1 HP massimi a tutti",
        "effects": [
            { "effect": "party_max_hp", "val": 1 }
        ]
    },
    "polvere_boreale": {
        "type": "relic",
        "name": "Polvere Boreale",
        "desc": "La scia luminescente del Gheist illumina il vero sentiero: +1 al tiro delle prossime 2 prove, poi si consuma",
        "speciali": [
            { "quando": "prova", "fai": "bonus_tiro", "val": 1, "limite": "capitolo", "volte": 2, "rompe": true }
        ]
    },
    "scudo_dei_dignitas": {
        "type": "relic",
        "name": "Scudo dei Dignitas",
        "desc": "Lo scudo di famiglia recuperato sotto la colonna: a inizio di ogni scontro +1 armatura a tutta la compagnia",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "armatura", "val": 1, "bersaglio": "compagnia" }
        ]
    },
    "bardatura_runica_foscoclivo": {
        "type": "relic",
        "name": "Bardatura Runica di Foscoclivo",
        "desc": "Cuoio e spallacci d'argento incisi di rune aliene, fatti per vestire un uomo: a inizio scontro +1 armatura all'eroe con meno HP",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "armatura", "val": 1, "bersaglio": "meno_hp" }
        ]
    },
    "frammento_pietra_di_volta": {
        "type": "relic",
        "name": "Frammento di Pietra di Volta",
        "desc": "Le venature risuonano contro i nemici più forti: +1 danni ai colpi contro elite e boss",
        "speciali": [
            { "quando": "colpo", "se": "elite", "fai": "danni", "val": 1 }
        ]
    },
    "rampino_firmamentisti": {
        "type": "relic",
        "name": "Rampino dei Firmamentisti",
        "desc": "Corde e rampini per saltare le rampe spezzate: la prossima prova fallita (non la finale) non dà punizione, poi il rampino si spezza",
        "speciali": [
            { "quando": "prova_fallita", "se": "non_finale", "fai": "annulla_punizione", "rompe": true }
        ]
    },
    "tessere_runiche_atani": {
        "type": "relic",
        "name": "Tessere Runiche degli Atani",
        "desc": "Tessere preziose del mosaico degli Uomini che Furono: +6 Scudi a ogni riposo",
        "speciali": [
            { "quando": "riposo", "fai": "monete", "val": 6 }
        ]
    },
    "lamina_astrale_celestica": {
        "type": "relic",
        "name": "Lamina Astrale della Celestica",
        "desc": "Costellazioni e ideogrammi universali della Celestica: +1 al tiro delle prossime 2 prove, poi si consuma",
        "speciali": [
            { "quando": "prova", "fai": "bonus_tiro", "val": 1, "limite": "capitolo", "volte": 2, "rompe": true }
        ]
    },
    "appunti_sul_portatore": {
        "type": "relic",
        "name": "Appunti sul Portatore",
        "desc": "Le pergamene bruciate di Foscoclivo svelano come combattono i Cavalcantici: contro elite e boss, −1 CA al nemico a inizio scontro",
        "speciali": [
            { "quando": "inizio_scontro", "se": "elite", "fai": "malus_nemico", "stat": "ca", "val": 1 }
        ]
    },
    "diagramma_runico_cuore": {
        "type": "relic",
        "name": "Diagramma Runico del Cuore",
        "desc": "I segni disposti attorno al petto schermano il cuore: la prima volta che un eroe andrebbe a 0 HP resta in piedi con 1 HP, poi il diagramma si consuma",
        "speciali": [
            { "quando": "colpo_mortale", "fai": "rialza", "val": 1, "rompe": true }
        ]
    },
    "corda_canapa_intrecciata": {
        "type": "relic",
        "name": "Corda di Canapa Intrecciata",
        "desc": "Una catena umana non si spezza: +2 al tiro di Aiuta",
        "speciali": [
            { "quando": "aiuto", "fai": "bonus_tiro", "val": 2 }
        ]
    },
    "reliquia_yr_drazul": {
        "type": "relic",
        "name": "Reliquia dell'Yr-Drazul",
        "desc": "Una scheggia dell'Albero Primordiale, ancora viva, che guida la mano: +1 ai tiri per colpire",
        "speciali": [
            { "quando": "attacco", "fai": "bonus_tiro", "val": 1 }
        ]
    },
    "pergamena_rune_rallentamento": {
        "type": "relic",
        "name": "Pergamena sulle Rune di Rallentamento",
        "desc": "La geometria dei glifi che ritardano l'avvelenamento: a inizio di ogni round toglie gli stati all'eroe con meno HP",
        "speciali": [
            { "quando": "inizio_round", "fai": "purifica", "bersaglio": "meno_hp" }
        ]
    },
    "fiala_risonanza_purificata": {
        "type": "relic",
        "name": "Fiala di Risonanza Purificata",
        "desc": "La frequenza del cristallo infetto, isolata e purificata: a ogni riposo toglie una maledizione a caso",
        "speciali": [
            { "quando": "riposo", "fai": "togli_maledizione" }
        ]
    },
    "lastra_runica_sovrani": {
        "type": "relic",
        "name": "Lastra Runica dei Sovrani",
        "desc": "Lo schema dei sovrani di Loch Ein che lega i glifi fra loro: mostra dove colpire: +1 ai tiri per colpire",
        "speciali": [
            { "quando": "attacco", "fai": "bonus_tiro", "val": 1 }
        ]
    },
    "stivali_chiodati_scalata": {
        "type": "relic",
        "name": "Stivali Chiodati da Scalata",
        "desc": "Chiodi da roccia per i cornicioni bagnati: +1 al tiro di Difendi",
        "speciali": [
            { "quando": "difesa", "fai": "bonus_tiro", "val": 1 }
        ]
    },
    "sigillo_dell_equilibrio": {
        "type": "relic",
        "name": "Sigillo dell'Equilibrio",
        "desc": "Un sigillo degli Atani rimasto intatto sotto le arcate: +1 Fede a un eroe (chi supera la prova)",
        "effects": [
            { "effect": "hero_stat", "stat": "fth", "val": 1 }
        ]
    },
    "corde_d_ancoraggio": {
        "type": "relic",
        "name": "Corde d'Ancoraggio",
        "desc": "Legati in cordata: la prima volta che un eroe andrebbe a 0 HP resta in piedi con 1 HP, poi le corde si spezzano",
        "speciali": [
            { "quando": "colpo_mortale", "fai": "rialza", "val": 1, "rompe": true }
        ]
    },
    "schema_di_stasi": {
        "type": "relic",
        "name": "Schema di Stasi",
        "desc": "Una minuscola sacca di stasi attorno al corpo: quando un eroe è colpito tira un d6, con 6 il colpo è ignorato",
        "speciali": [
            { "quando": "colpito", "fai": "schiva", "val": 6 }
        ]
    },
    "stilo_argento_pigmenti": {
        "type": "relic",
        "name": "Stilo d'Argento e Pigmenti Puri",
        "desc": "Per tracciare i glifi di Loch Ein sulla pelle: +1 HP a ogni cura del riposo e delle pozioni",
        "speciali": [
            { "quando": "riposo", "fai": "bonus_cura", "val": 1 },
            { "quando": "pozione", "fai": "bonus_cura", "val": 1 }
        ]
    },
    "bagliore_incorporeo_fiumi": {
        "type": "relic",
        "name": "Bagliore Incorporeo dei Fiumi",
        "desc": "Il richiamo dei fiumi sotterranei di Yr: +1 Fede a un eroe (chi supera la prova)",
        "effects": [
            { "effect": "hero_stat", "stat": "fth", "val": 1 }
        ]
    },
    "circuito_runico_tre_sovrani": {
        "type": "relic",
        "name": "Circuito Runico dei Tre Sovrani",
        "desc": "Rune chiuse attorno a polsi e collo: a inizio scontro +1 armatura a tutta la compagnia",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "armatura", "val": 1, "bersaglio": "compagnia" }
        ]
    },
    "spiavento_potenziata": {
        "type": "relic",
        "name": "Spiavento Potenziata",
        "desc": "La Spada Spiavento risuona con la Pietra di Volta della serratura: +1 ai tiri per colpire",
        "speciali": [
            { "quando": "attacco", "fai": "bonus_tiro", "val": 1 }
        ]
    },
    "manto_luce_runica": {
        "type": "relic",
        "name": "Manto di Luce Runica",
        "desc": "Le rune allineate contro il contraccolpo del limbo: a inizio di ogni round toglie gli stati all'eroe con meno HP",
        "speciali": [
            { "quando": "inizio_round", "fai": "purifica", "bersaglio": "meno_hp" }
        ]
    },
    "passo_rapido_gallerie": {
        "type": "relic",
        "name": "Passo Rapido delle Gallerie",
        "desc": "Si colpisce prima che il nemico capisca: +2 al tiro per colpire nel primo round di ogni scontro",
        "speciali": [
            { "quando": "attacco", "round": 1, "fai": "bonus_tiro", "val": 2 }
        ]
    },
    "manoscritti_firmamentisti": {
        "type": "relic",
        "name": "Manoscritti dei Firmamentisti",
        "desc": "Gli ultimi scritti salvati dalle fiamme: +1 al tiro delle prossime 2 prove, poi si consuma",
        "speciali": [
            { "quando": "prova", "fai": "bonus_tiro", "val": 1, "limite": "capitolo", "volte": 2, "rompe": true }
        ]
    },
    "frammento_statua_sovrani": {
        "type": "relic",
        "name": "Frammento della Statua dei Sovrani",
        "desc": "Il marmo dei sovrani di Loch Ein incute timore: contro elite e boss, −1 CA al nemico a inizio scontro",
        "speciali": [
            { "quando": "inizio_scontro", "se": "elite", "fai": "malus_nemico", "stat": "ca", "val": 1 }
        ]
    },
    "balzo_dell_atani": {
        "type": "relic",
        "name": "Balzo dell'Atani",
        "desc": "Nessuno resta indietro: +2 al tiro di Aiuta",
        "speciali": [
            { "quando": "aiuto", "fai": "bonus_tiro", "val": 2 }
        ]
    },
    "imbracatura_di_salvataggio": {
        "type": "relic",
        "name": "Imbracatura di Salvataggio",
        "desc": "Corde e cinghie per non essere risucchiati: la prossima prova fallita (non la finale) non dà punizione, poi l'imbracatura si spezza",
        "speciali": [
            { "quando": "prova_fallita", "se": "non_finale", "fai": "annulla_punizione", "rompe": true }
        ]
    },
    "grazia_degli_atani": {
        "type": "relic",
        "name": "Grazia degli Atani",
        "desc": "La benedizione degli Uomini che Furono: dopo ogni scontro vinto cura 1 HP all'eroe che ha perso più HP",
        "speciali": [
            { "quando": "fine_scontro", "fai": "cura", "val": 1, "bersaglio": "piu_ferito" }
        ]
    },
    "frammenti_pirite_risonante": {
        "type": "relic",
        "name": "Frammenti di Pirite Risonante",
        "desc": "Vibrano davanti ai nemici più forti: +1 danni ai colpi contro elite e boss",
        "speciali": [
            { "quando": "colpo", "se": "elite", "fai": "danni", "val": 1 }
        ]
    },
    "campana_subacquea_rinforzata": {
        "type": "relic",
        "name": "Campana Subacquea Rinforzata",
        "desc": "Botti cerchiate di ferro per l'ultima immersione: a inizio scontro +1 armatura all'eroe con meno HP",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "armatura", "val": 1, "bersaglio": "meno_hp" }
        ]
    },
    "pece_militare_svalbard": {
        "type": "relic",
        "name": "Pece Militare di Svalbard",
        "desc": "Una fiammata di pece all'inizio della mischia: 1 danno al nemico a inizio scontro",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "danni", "val": 1 }
        ]
    },
    "rampino_pionieri_nord": {
        "type": "relic",
        "name": "Rampino dei Pionieri del Nord",
        "desc": "Corda e rampino per i passaggi impossibili: la prossima prova fallita (non la finale) non dà punizione, poi il rampino si spezza",
        "speciali": [
            { "quando": "prova_fallita", "se": "non_finale", "fai": "annulla_punizione", "rompe": true }
        ]
    },
    "mantello_foderato_collifreddi": {
        "type": "relic",
        "name": "Mantello Foderato di Collifreddi",
        "desc": "Pelliccia spessa contro il vento della Faucebigia: a inizio scontro +1 armatura all'eroe con meno HP",
        "speciali": [
            { "quando": "inizio_scontro", "fai": "armatura", "val": 1, "bersaglio": "meno_hp" }
        ]
    },
    "amuleto_scaccia_maliardi": {
        "type": "relic",
        "name": "Amuleto Scaccia Maliardi",
        "desc": "La nenia delle Cimebianche incisa nell'osso: a inizio di ogni round toglie gli stati all'eroe con meno HP",
        "speciali": [
            { "quando": "inizio_round", "fai": "purifica", "bersaglio": "meno_hp" }
        ]
    },
    "benedizione_onirica_foscogelo": {
        "type": "relic",
        "name": "Benedizione Onirica dei Foscogelo",
        "desc": "Un sogno degli Asi dalla Torre dei Sogni: +1 Fede a un eroe (chi supera la prova)",
        "effects": [
            { "effect": "hero_stat", "stat": "fth", "val": 1 }
        ]
    },
    "scheggia_del_flusside": {
        "type": "relic",
        "name": "Scheggia del Flusside",
        "desc": "Il gelo del Criogolem che spacca il metallo: +1 danni ai colpi contro elite e boss",
        "speciali": [
            { "quando": "colpo", "se": "elite", "fai": "danni", "val": 1 }
        ]
    },
    "polvere_corno_kornugan": {
        "type": "relic",
        "name": "Polvere del Corno di Kornugan",
        "desc": "Il corno sfavillante affina lo sguardo: +1 ai tiri per colpire",
        "speciali": [
            { "quando": "attacco", "fai": "bonus_tiro", "val": 1 }
        ]
    },
    "scheggia_benedetta": {
        "type": "relic",
        "name": "Scheggia Benedetta",
        "desc": "Un frammento dell'arco di ghiaccio azzurro: dopo ogni scontro vinto cura 1 HP all'eroe che ha perso più HP",
        "speciali": [
            { "quando": "fine_scontro", "fai": "cura", "val": 1, "bersaglio": "piu_ferito" }
        ]
    },
    "sigillo_del_giuramento": {
        "type": "relic",
        "name": "Sigillo del Giuramento",
        "desc": "Il giuramento di sangue dei Dignitas: la prima volta che un eroe andrebbe a 0 HP resta in piedi con 1 HP, poi il sigillo si spezza",
        "speciali": [
            { "quando": "colpo_mortale", "fai": "rialza", "val": 1, "rompe": true }
        ]
    },
    "guanti_del_ghiacceterno": {
        "type": "relic",
        "name": "Guanti del Ghiacceterno",
        "desc": "Presa salda sul ghiaccio vivo: +1 Forza a un eroe (chi supera la prova)",
        "effects": [
            { "effect": "hero_stat", "stat": "str", "val": 1 }
        ]
    }
};
