/* ==========================================================================
   COMUNE A GIOCO ED EDITOR
   Costanti e funzioni usate sia da index.html sia da editor.html, scritte una
   volta sola perché le due pagine non possano dare risultati diversi.
   Caricato dopo js/libreria.js e prima di js/game.js / js/editor/.
   ========================================================================== */

/* ---------- Numeri casuali della partita ----------
   rng() al posto di Math.random per tutto ciò che decide la partita (dadi, bottino, mercante, effetti speciali,
   bersagli dei nemici, simulatore). Senza seme è Math.random; con setRngSeed(n) la sequenza si ripete uguale
   (test, simulatore, un bug da riprodurre: index.html?seme=123), setRngSeed(null) torna casuale.
   getRngState / setRngState salvano e rimettono il punto della sequenza (duelli di prova del simulatore).
   Animazioni, suoni e grafica usano ancora Math.random: non decidono niente. */
let rngSeedState = null;
function rng() {
    if (rngSeedState == null) return Math.random();
    // mulberry32: veloce e abbastanza buono per un gioco
    rngSeedState = (rngSeedState + 0x6D2B79F5) | 0;
    let t = Math.imul(rngSeedState ^ (rngSeedState >>> 15), 1 | rngSeedState);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function setRngSeed(seed) { rngSeedState = seed == null ? null : (Number(seed) | 0); }
function getRngState() { return rngSeedState; }
function setRngState(s) { rngSeedState = s; }

// Id ricavato da un nome, per gli elementi scritti dentro una campagna, i salvataggi vecchi e gli id automatici
// dell'editor ("Scudo dell'Atamano" -> "scudo_dell_atamano", come le chiavi della libreria)
function idFromName(name) {
    return String(name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

// Testo sicuro dentro l'HTML (nomi e descrizioni scritti nelle campagne)
const esc = str => String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Rarità degli oggetti come in WoW (colori in css/wc3-base.css)
const RARITY_LABELS = { scarso: 'Scarso', comune: 'Comune', non_comune: 'Non comune', raro: 'Raro', epico: 'Epico', leggendario: 'Leggendario' };
const RARITY_COLORS = { scarso: 'grigio', comune: 'bianco', non_comune: 'verde', raro: 'blu', epico: 'viola', leggendario: 'arancio' };

// Prezzo base di un oggetto in Scudi: il campo "prezzo" dell'armeria se c'è, altrimenti quello della rarità
// (ITEM_BASE_PRICE in js/regole.js, caricato anche dall'editor). Il mercante poi lo varia e lo alza con l'avanzamento.
function itemBasePrice(item) {
    if (item && item.prezzo > 0) return item.prezzo;
    return ITEM_BASE_PRICE[RARITY_LABELS[item && item.rarity] ? item.rarity : 'comune'];
}

// Statistiche degli eroi usate nelle prove e dalle abilità attive
const STAT_LABELS = { int: 'Intelligenza', fth: 'Fede', str: 'Forza' };

// Tipi di effetto interpretati da applyEffects() in js/game.js, con i campi che richiedono
const EFFECT_TYPES = {
    hero_stat: ['stat', 'val'],
    hero_set: ['stat', 'val'],
    party_stat: ['stat', 'val'],
    party_max_hp: ['val'],
    party_damage: ['val'],
    coins: ['val'],
    add_curse: ['text'],
    hero_item: ['item', 'val'],  // dà all'eroe "val" copie dell'oggetto con id "item" dell'armeria
    party_heal: ['val'],         // cura "val" HP a chi è in piedi
    relic: ['id'],               // dà la reliquia della libreria con questo id (se la compagnia non ce l'ha)
    curse: ['id']                // dà la maledizione della libreria con questo id (i suoi "effects")
};
// Nomi degli effetti per l'editor (elenco degli effetti di eventi e scelte)
const EFFECT_LABELS = {
    coins: 'Scudi (anche negativi)', party_heal: 'Cura tutti (HP)', party_damage: 'Danni a tutti (restano a 1 HP)',
    party_max_hp: 'HP massimi a tutti', party_stat: 'Statistica a tutti', hero_stat: 'Statistica all\'eroe',
    hero_item: 'Oggetto all\'eroe', relic: 'Reliquia', curse: 'Maledizione', add_curse: 'Maledizione scritta qui', hero_set: 'Segnale di una passiva'
};
// Statistiche che gli effetti hero_stat e party_stat possono cambiare
const EFFECT_STATS = { str: 'Forza', dmg: 'Danno', int: 'Intelligenza', fth: 'Fede', att_bonus: 'Tiro per colpire' };

/* ---------- Effetti speciali "quando → fai" ----------
   Campo "speciali" di oggetti (armeria), reliquie, maledizioni e abilità: un elenco di
   { quando, fai, val, stat, durata, bersaglio, se, round, prob, limite, volte, rompe }, interpretato da js/motore/speciali.js.
   quando = il momento (SPECIALI_QUANDO), fai = cosa succede (SPECIALI_FAI), il resto è facoltativo:
     se: una condizione (SPECIALI_SE); round: solo in quel round dello scontro; prob: probabilità in %;
     durata: round del potenziamento (vuoto = fino a fine scontro);
     limite: "scontro" o "capitolo" (al massimo "volte" volte, 1 se manca); rompe: finite le volte (o dopo
     ogni uso, senza limite) la reliquia si rompe, l'oggetto si consuma, la maledizione sparisce.
   Così un oggetto, una reliquia o una passiva nuova si crea dall'editor senza scrivere codice.
   Un "quando" o un "fai" nuovo invece va scritto in js/motore/speciali.js e aggiunto qui. */

// I tiri di dado degli eroi, per bonus_tiro (tiro = tutti, tiro_scontro = attacco, difesa e aiuto)
const SPECIALI_TIRI = ['tiro', 'tiro_scontro', 'attacco', 'difesa', 'aiuto', 'prova', 'contrattazione', 'preghiera', 'capitano'];

const SPECIALI_QUANDO = {
    inizio_scontro: 'Inizio scontro',
    inizio_round: 'Inizio di ogni round',
    colpo: 'Colpo a segno (attacco o abilità)',
    tiro_fallito: 'Tiro fallito in scontro',
    colpito: 'Colpito dal nemico (prima dell\'armatura)',
    dopo_colpito: 'Dopo essere stato colpito',
    perde_hp: 'Perde HP per un colpo del nemico',
    colpo_mortale: 'Andrebbe a 0 HP',
    nemico_sconfitto: 'Sconfigge il nemico',
    alleato_caduto: 'Cade un alleato',
    fine_scontro: 'Scontro vinto',
    cura_ricevuta: 'Un eroe recupera HP',
    riposo: 'Riposo',
    prova_fallita: 'Prova fallita',
    bottino: 'Bottino di uno scontro',
    pozione: 'Pozione di cura usata',
    mercante: 'Mercante',
    uscita_mercante: 'Uscita dal mercante',
    tiro: 'Ogni tiro di dado',
    tiro_scontro: 'Tiri in scontro (attacco, abilità, Difendi, Aiuta)',
    attacco: 'Tiro per colpire (attacco e abilità)',
    difesa: 'Tiro di Difendi',
    aiuto: 'Tiro di Aiuta',
    prova: 'Tiro delle prove',
    contrattazione: 'Tiro per contrattare',
    preghiera: 'Tiro di preghiera',
    capitano: 'Tiro contro il capitano'
};

// Momenti degli effetti delle abilità attive (campo "effetti" di "combat", abilitySpecialEffects in js/combattimento.js)
// Con "combat.instabile" (pozioni di Cassio) all'uso si tira un d6 alchemico: 1 = fallimento, 2-5 = normale, 6 = capolavoro
const SPECIALI_QUANDO_ABILITA = { uso: 'Quando la usa', colpo: 'Se colpisce', mancato: 'Se manca',
    fallimento: 'Dado alchemico 1 (fallimento)', normale: 'Dado alchemico 2-5', capolavoro: 'Dado alchemico 6 (capolavoro)' };

// Cosa succede. quando = i momenti in cui ha senso; campi = cosa si scrive (val, stat, stat_nemico, durata, bersaglio)
const SPECIALI_SCONTRO = ['inizio_scontro', 'inizio_round', 'colpo', 'dopo_colpito', 'perde_hp', 'alleato_caduto', 'uso', 'mancato',
    'fallimento', 'normale', 'capolavoro'];
const SPECIALI_FAI = {
    danni: { label: 'Danni al nemico', campi: ['val'], quando: SPECIALI_SCONTRO },
    cura: { label: 'Cura HP', campi: ['val', 'bersaglio'], quando: [...SPECIALI_SCONTRO, 'fine_scontro', 'cura_ricevuta', 'nemico_sconfitto'] },
    armatura: { label: 'Armatura subito', campi: ['val', 'bersaglio'], quando: SPECIALI_SCONTRO },
    stordisci: { label: 'Stordisce il nemico', campi: [], quando: ['inizio_scontro', 'inizio_round', 'colpo', 'dopo_colpito', 'perde_hp', 'uso'] },
    malus_nemico: { label: 'Toglie una statistica al nemico', campi: ['stat_nemico', 'val'], quando: SPECIALI_SCONTRO },
    potenzia: { label: 'Potenziamento (valore negativo = malus)', campi: ['stat', 'val', 'durata', 'bersaglio'], quando: SPECIALI_SCONTRO },
    rafforza_nemico: { label: 'Aggiunge una statistica al nemico (fino a fine scontro)', campi: ['stat_nemico', 'val'], quando: SPECIALI_SCONTRO },
    ferisce_se: { label: 'L\'eroe perde HP (non scende sotto 1)', campi: ['val'], quando: SPECIALI_SCONTRO },
    ritira: { label: 'Ritira il dado', campi: [], quando: ['tiro_fallito'] },
    annulla_colpo: { label: 'Annulla il colpo', campi: [], quando: ['colpito'] },
    schiva: { label: 'Schiva con un d6 pari o superiore a', campi: ['val'], quando: ['colpito'] },
    rialza: { label: 'Resta in piedi con HP', campi: ['val'], quando: ['colpo_mortale'] },
    annulla_punizione: { label: 'Niente punizione', campi: [], quando: ['prova_fallita'] },
    prova_riuscita: { label: 'La prova riesce lo stesso', campi: [], quando: ['prova_fallita'] },
    hp_massimi: { label: 'HP massimi in più (per sempre)', campi: ['val'], quando: ['fine_scontro'] },
    monete: { label: 'Scudi', campi: ['val'], quando: ['inizio_scontro', 'fine_scontro', 'riposo', 'nemico_sconfitto'] },
    carta_bottino: { label: 'Carte in più al bottino', campi: ['val'], quando: ['bottino'] },
    togli_maledizione: { label: 'Toglie una maledizione a caso', campi: [], quando: ['riposo', 'fine_scontro'] },
    purifica: { label: 'Toglie gli stati (stordito, avvelenato, silenziato, furia)', campi: ['bersaglio'], quando: SPECIALI_SCONTRO },
    bonus_tiro: { label: 'Bonus al tiro', campi: ['val'], quando: SPECIALI_TIRI },
    bonus_cura: { label: 'HP in più alla cura', campi: ['val'], quando: ['riposo', 'pozione'] },
    sconto: { label: 'Sconto in Scudi su ogni articolo', campi: ['val'], quando: ['mercante'] },
    sconto_percento: { label: 'Sconto in % su ogni articolo', campi: ['val'], quando: ['mercante'] },
    veleno_nemico: { label: 'Avvelena il nemico (HP persi a inizio round)', campi: ['val', 'durata'], quando: ['inizio_scontro', 'colpo', 'uso'] },
    oggetto: { label: 'Oggetto nello zaino', campi: ['item', 'val'], quando: ['uscita_mercante'] }
};

const SPECIALI_SE = {
    elite: 'contro elite e boss',
    nemico_meta: 'con il nemico a metà vita o meno',
    nemico_quarto: 'con il nemico a un quarto della vita o meno',
    nemico_meta_quarto: 'con il nemico fra metà e un quarto della vita',
    ferito: 'se l\'eroe è ferito (2 HP o meno)',
    perso_hp_scontro: 'se l\'eroe ha perso HP in questo scontro',
    senza_armatura: 'se l\'eroe è senza armatura',
    ha_difeso: 'se l\'eroe ha difeso nel round',
    primo_ad_agire: 'se l\'eroe agisce per primo nel round',
    colpo_pieno: 'solo il colpo principale, non quelli agli eroi accanto',
    non_finale: 'non nella prova finale'
};

const SPECIALI_BERSAGLI = { eroe: 'l\'eroe', compagnia: 'tutta la compagnia', meno_hp: 'l\'eroe con meno HP',
    piu_ferito: 'l\'eroe che ha perso più HP', altro_casuale: 'un altro eroe ferito a caso',
    vicini: 'gli eroi accanto a lui',  // nell'ordine della compagnia, come i colpi "agli eroi accanto" dei nemici
    scelto: 'l\'eroe scelto da chi la usa' };  // "scelto": per le abilità attive (finestra di scelta, hero.potionTarget)
const SPECIALI_STAT = { str: 'Forza', dmg: 'Danno', att_bonus: 'tiro per colpire', def_bonus: 'Difesa', help_bonus_val: 'Aiuto', regen: 'HP a inizio round' };
const SPECIALI_STAT_NEMICO = { att: 'Attacco', ca: 'CA', dmg: 'Danno' };

// Riga del tooltip di un effetto speciale (gioco e anteprima dell'editor). tipo = 'oggetto', 'reliquia', 'maledizione'
function specialeTesto(s, tipo) {
    const v = s.val || 0;
    const chi = SPECIALI_BERSAGLI[s.bersaglio || 'eroe'] || s.bersaglio;
    const fai = {
        danni: s.quando === 'colpo' ? `+${v} danni al colpo` : `${v} ${v === 1 ? 'danno' : 'danni'} al nemico`,
        cura: `cura ${v} HP a ${chi}`,
        armatura: `+${v} armatura subito a ${chi}`,
        stordisci: 'il nemico è stordito e salta il suo prossimo attacco',
        malus_nemico: `−${v} ${SPECIALI_STAT_NEMICO[s.stat] || s.stat} al nemico`,
        potenzia: `${v >= 0 ? '+' : '−'}${Math.abs(v)} ${SPECIALI_STAT[s.stat] || s.stat} a ${chi} ${s.durata ? `per ${s.durata} round` : 'fino a fine scontro'}`,
        rafforza_nemico: `+${v} ${SPECIALI_STAT_NEMICO[s.stat] || s.stat} al nemico fino a fine scontro`,
        ferisce_se: `l'eroe perde ${v} HP (resta almeno a 1)`,
        ritira: 'il dado si ritira da solo',
        annulla_colpo: 'il colpo è assorbito del tutto',
        schiva: `tira un d6: con ${v} o più il colpo è ignorato`,
        rialza: `resta in piedi con ${v} HP`,
        annulla_punizione: 'niente punizione',
        prova_riuscita: 'il fallimento diventa un successo',
        hp_massimi: `+${v} HP massimi per sempre`,
        monete: `+${v} Scudi`,
        carta_bottino: `${v === 1 ? 'una carta' : `${v} carte`} in più fra cui scegliere`,
        togli_maledizione: 'toglie una maledizione a caso',
        purifica: `toglie stordimento, veleno, silenzio e furia a ${chi}`,
        bonus_tiro: `${v >= 0 ? '+' : ''}${v} al tiro`,
        bonus_cura: `${v >= 0 ? '+' : ''}${v} HP alla cura`,
        sconto: v >= 0 ? `−${v} Scudi su ogni articolo` : `+${-v} Scudi su ogni articolo`,
        sconto_percento: `−${v}% sul prezzo di ogni articolo`,
        veleno_nemico: `avvelena il nemico: −${Math.max(1, v)} HP a inizio di ogni round per ${s.durata || 3} round`,
        oggetto: `${v > 1 ? `${v} copie di ` : ''}${(((window.LIBRERIA || {}).armeria || {})[s.item] || {}).name || 'un oggetto'} nello zaino dell'eroe`
    }[s.fai] || s.fai;
    const cond = [s.se && SPECIALI_SE[s.se], s.round && `nel round ${s.round}`, s.prob && `${s.prob}% di probabilità`].filter(Boolean);
    const volte = s.volte || 1;
    const limite = s.limite ? (volte === 1 ? `una volta per ${s.limite}` : `${volte} volte per ${s.limite}`) : '';
    const fine = s.rompe ? ({ reliquia: 'poi si rompe', oggetto: 'poi si consuma', maledizione: 'poi sparisce', benedizione: 'poi svanisce' }[tipo] || 'poi si esaurisce') : '';
    const coda = [limite, fine].filter(Boolean).join(', ');
    const testo = `${SPECIALI_QUANDO[s.quando] || SPECIALI_QUANDO_ABILITA[s.quando] || s.quando}${cond.length ? ` (${cond.join(', ')})` : ''}: ${fai}`;
    return coda ? `${testo} (${coda})` : testo;
}

/* ---------- Effetti speciali dei nemici ----------
   Campo "speciali" del bestiario (e delle azioni degli elite, che li aggiungono da quella soglia in poi):
   { quando, fai, val, stat, durata, bersaglio, se, round, prob, limite, volte }, interpretato da fireEnemySpecials
   in js/motore/speciali.js. "eroe" come bersaglio = l'eroe coinvolto: chi colpisce il nemico o chi viene colpito. */
const NEMICO_QUANDO = {
    inizio_scontro: 'Inizio scontro',
    inizio_round: 'Inizio di ogni round',
    colpito: 'Un eroe lo colpisce',
    colpisce: 'Colpisce un eroe',
    soglia: 'Alla soglia (solo nelle azioni degli elite)'
};
const NEMICO_FAI = {
    danni: { label: 'Danni agli eroi', campi: ['val', 'bersaglio'] },
    cura: { label: 'Si cura (HP)', campi: ['val'] },
    potenzia: { label: 'Aumenta una sua statistica', campi: ['stat_nemico', 'val'] },
    malus: { label: 'Malus al tiro per colpire degli eroi', campi: ['val', 'durata', 'bersaglio'] },
    stordisci: { label: 'Stordisce gli eroi (saltano il turno)', campi: ['bersaglio'] },
    veleno: { label: 'Avvelena: HP persi a ogni round, senza armatura', campi: ['val', 'durata', 'bersaglio'] },
    silenzia: { label: 'Silenzia: niente abilità attiva', campi: ['durata', 'bersaglio'] },
    infuria: { label: 'Fa infuriare: può solo attaccare', campi: ['durata', 'bersaglio'] },
    spezza_armatura: { label: 'Toglie l\'armatura agli eroi', campi: ['bersaglio'] },
    ruba_scudi: { label: 'Ruba Scudi alla compagnia', campi: ['val'] }
};
const NEMICO_SE = { sotto_meta: 'con il nemico a metà vita o meno', eroe_ferito: 'se l\'eroe coinvolto è ferito (2 HP o meno)' };
const NEMICO_BERSAGLI = { eroe: 'l\'eroe coinvolto', tutti: 'tutta la compagnia', piu_debole: 'l\'eroe con meno HP + armatura',
    piu_forte: 'l\'eroe con più HP + armatura', casuale: 'un eroe a caso' };

// Riga del tooltip di un effetto speciale di un nemico
function nemicoTesto(s) {
    const v = s.val || 0;
    const chi = NEMICO_BERSAGLI[s.bersaglio || 'eroe'] || s.bersaglio;
    const fai = {
        danni: `${v} ${v === 1 ? 'danno' : 'danni'} a ${chi}`,
        cura: `recupera ${v} HP`,
        potenzia: `${v >= 0 ? '+' : '−'}${Math.abs(v)} ${SPECIALI_STAT_NEMICO[s.stat] || s.stat}`,
        malus: `−${v} al tiro per colpire a ${chi} ${s.durata ? `per ${s.durata} round` : 'fino a fine scontro'}`,
        stordisci: `stordisce ${chi}`,
        veleno: `avvelena ${chi}: −${v} HP a ogni round per ${s.durata || 3} round`,
        silenzia: `silenzia ${chi} per ${s.durata || 2} round (niente abilità attiva)`,
        infuria: `fa infuriare ${chi} per ${s.durata || 2} round (può solo attaccare)`,
        spezza_armatura: `toglie l'armatura a ${chi}`,
        ruba_scudi: `ruba ${v} Scudi`
    }[s.fai] || s.fai;
    const cond = [s.se && NEMICO_SE[s.se], s.round && `nel round ${s.round}`, s.prob && `${s.prob}% di probabilità`].filter(Boolean);
    const volte = s.volte || 1;
    const limite = s.limite ? (volte === 1 ? ' (una volta per scontro)' : ` (${volte} volte per scontro)`) : '';
    return `${NEMICO_QUANDO[s.quando] || s.quando}${cond.length ? ` (${cond.join(', ')})` : ''}: ${fai}${limite}`;
}

// Oggetti scritti nel formato di prima (campi numerici dell'armeria, es. "thorns": 1): i salvataggi
// tengono le copie degli oggetti, così valgono ancora. itemSpecials (js/motore/speciali.js) li converte al volo.
const LEGACY_ITEM_SPECIALS = {
    war_horn: v => ({ quando: 'inizio_scontro', fai: 'potenzia', stat: 'att_bonus', val: v, durata: 1, bersaglio: 'compagnia' }),
    first_hit_dmg: v => ({ quando: 'colpo', fai: 'danni', val: v, limite: 'scontro' }),
    execute_dmg: v => ({ quando: 'colpo', se: 'nemico_meta', fai: 'danni', val: v }),
    first_hit_stun: () => ({ quando: 'colpo', fai: 'stordisci', limite: 'scontro' }),
    thorns: v => ({ quando: 'dopo_colpito', se: 'ha_difeso', fai: 'danni', val: v }),
    ally_down_str: v => ({ quando: 'alleato_caduto', fai: 'potenzia', stat: 'str', val: v }),
    combat_reroll: () => ({ quando: 'tiro_fallito', fai: 'ritira', limite: 'scontro' }),
    challenge_skip: () => ({ quando: 'prova_fallita', se: 'non_finale', fai: 'annulla_punizione', rompe: true }),
    haggle_bonus: v => ({ quando: 'contrattazione', fai: 'bonus_tiro', val: v }),
    loot_extra_once: v => ({ quando: 'bottino', se: 'elite', fai: 'carta_bottino', val: v, limite: 'capitolo' }),
    rest_heal: v => ({ quando: 'riposo', fai: 'bonus_cura', val: v }),
    potion_heal_bonus: v => ({ quando: 'pozione', fai: 'bonus_cura', val: v }),
    hit_heal_chance: v => ({ quando: 'colpo', prob: v, fai: 'cura', val: 1 }),
    hit_chill: v => ({ quando: 'colpo', fai: 'malus_nemico', stat: 'att', val: v, limite: 'scontro', volte: 2 }),
    last_stand_armor: v => ({ quando: 'dopo_colpito', se: 'ferito', fai: 'armatura', val: v, limite: 'scontro' })
};

// Benedizioni degli Asi (preghiera ai riposi, js/prove.js): libreria data/libreria/benedizioni.js, scheda
// Benedizioni dell'editor. Stesso oggetto della libreria (la campagna di prova dall'editor lo riempie di nuovo).
const PRAYER_BLESSINGS = (window.LIBRERIA && window.LIBRERIA.benedizioni) || {};

// Segnali che le passive scrivono sull'eroe con hero_set e che il motore legge (vedi docs/eroi.md).
// Un segnale nuovo va aggiunto qui, altrimenti l'editor lo segnala come sconosciuto.
// Le passive nuove si scrivono di solito con "speciali" (sopra), senza segnali.
const HERO_FLAGS = {
    challengeRerollMalus: 'ripete una prova fallita con questo malus',
    factotum: 'conversione delle statistiche (true o ogni N punti)',
    firstActorStrBonus: 'Forza in più ai tiri se agisce per primo nel round',
    freeFirstMerchantItem: 'primo oggetto di ogni mercante gratis',
    helpDmgBonus: 'Aiuta riuscito: danno in più al prossimo eroe nel round',
    malasorte: 'ogni 3 tiri falliti (scontro, prove, preghiera) +1 Forza, max 3 volte per capitolo',
    iraTraboccante: 'tiri falliti della compagnia in scontro: Collera (+1 al tiro per colpire e a Difendi, si azzera dopo il turno del nemico), al massimo va in Furia',
    prayerExtraChoices: 'benedizioni in più fra cui scegliere quando prega e riesce',
    noArmor: 'non porta armature né scudi e non riceve armatura (niente Difendi)'
};

// Bersagli delle azioni speciali degli elite (data/azioni_elite/azioni_elite.js, interpretate in js/combattimento.js):
// ELITE_TARGETS per gli effetti alla soglia (colpo, stordisce, spezzaArmatura), ELITE_TURN_TARGETS per il turno del nemico
const ELITE_TARGETS = { attaccante: "L'eroe che lo ha ferito", tutti: 'Tutta la compagnia', piu_debole: "L'eroe con meno HP + armatura",
    piu_forte: "L'eroe con più HP + armatura", casuale: 'Un eroe a caso' };
const ELITE_TURN_TARGETS = { scelto: 'Il bersaglio scelto dal giocatore', piu_debole: ELITE_TARGETS.piu_debole,
    piu_forte: ELITE_TARGETS.piu_forte, casuale: 'Un eroe a caso (annunciato a inizio turno)', tutti: ELITE_TARGETS.tutti };

// Ritratti degli eroi: inquadratura predefinita (soglia del ritratto da ferito: WOUNDED_HP in js/regole.js),
// zoom della cinematica d'attacco (la banda è larga e bassa: si ingrandisce meno che nell'icona)
const HERO_PORTRAIT_DEFAULTS = { pos: '50% 38%', zoom: 1.7 };
function strikeZoomFor(zoom) {
    return Math.round((1 + (zoom - 1) * 0.45) * 100) / 100;
}
