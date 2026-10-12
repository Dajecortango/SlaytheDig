/* ==========================================================================
   COMUNE A GIOCO ED EDITOR
   Costanti e funzioni usate sia da index.html sia da editor.html, scritte una
   volta sola perché le due pagine non possano dare risultati diversi.
   Caricato dopo js/libreria.js e prima di js/game.js / js/editor/.
   ========================================================================== */

// Testo sicuro dentro l'HTML (nomi e descrizioni scritti nelle campagne)
const esc = str => String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Rarità degli oggetti come in WoW (colori in css/wc3-base.css)
const RARITY_LABELS = { scarso: 'Scarso', comune: 'Comune', non_comune: 'Non comune', raro: 'Raro', epico: 'Epico', leggendario: 'Leggendario' };
const RARITY_COLORS = { scarso: 'grigio', comune: 'bianco', non_comune: 'verde', raro: 'blu', epico: 'viola', leggendario: 'arancio' };

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
    hero_item: ['item', 'val']   // dà all'eroe "val" copie dell'oggetto con id "item" dell'armeria
};

// Segnali che le passive scrivono sull'eroe con hero_set e che il motore legge (vedi CLAUDE.md).
// Un segnale nuovo va aggiunto qui, altrimenti l'editor lo segnala come sconosciuto.
// Effetti speciali degli oggetti (campi numerici dell'armeria, sommati fra gli oggetti nello zaino con itemBonus):
// k = campo, label = etichetta nell'editor, tip = riga del tooltip (gioco e anteprima dell'editor).
// Un campo nuovo va letto anche dal motore (js/combattimento.js, js/prove.js, js/shop.js, js/loot.js, js/oggetti.js)
const ITEM_SPECIALS = [
    { k: 'war_horn', label: 'Tiro per colpire a tutti al primo round', tip: v => `Primo round di ogni scontro: +${v} al tiro per colpire a tutta la compagnia` },
    { k: 'first_hit_dmg', label: 'Danni in più al primo colpo dello scontro', tip: v => `+${v} danni al primo colpo a segno di ogni scontro` },
    { k: 'execute_dmg', label: 'Danni in più col nemico a metà vita', tip: v => `+${v} danni se il nemico ha metà vita o meno` },
    { k: 'first_hit_stun', label: 'Il primo colpo dello scontro stordisce', tip: () => 'Il primo colpo a segno di ogni scontro stordisce il nemico' },
    { k: 'thorns', label: 'Danni al nemico che colpisce chi difende', tip: v => `Se ha difeso nel round, il nemico che lo colpisce subisce ${v} ${v === 1 ? 'danno' : 'danni'}` },
    { k: 'ally_down_str', label: 'Forza in più se cade un alleato', tip: v => `Se cade un alleato: +${v} Forza fino a fine scontro` },
    { k: 'combat_reroll', label: 'Ritira un tiro fallito per scontro', tip: () => 'Una volta per scontro un tiro fallito si ritira da solo' },
    { k: 'challenge_skip', label: 'Evita la punizione di una prova (si consuma)', tip: () => 'Una prova fallita non dà punizione, poi si consuma (non vale nel finale)' },
    { k: 'haggle_bonus', label: 'Bonus al tiro per contrattare', tip: v => `+${v} al tiro per contrattare` },
    { k: 'loot_extra_once', label: 'Carte in più al primo bottino di un elite', tip: v => `Primo bottino di un elite: ${v === 1 ? 'una carta' : v + ' carte'} in più (una volta per capitolo)` },
    { k: 'rest_heal', label: 'HP in più a ogni riposo', tip: v => `+${v} HP a ogni riposo` },
    { k: 'potion_heal_bonus', label: 'HP in più alle pozioni di cura che usa', tip: v => `Le pozioni di cura che usa curano ${v} HP in più` }
];

const HERO_FLAGS = {
    bonusLootCoins: 'Scudi in più dopo ogni scontro',
    challengeRerollMalus: 'ripete una prova fallita con questo malus',
    dodgeNoArmor: 'senza armatura evita il colpo con d6 >= valore',
    factotum: 'conversione delle statistiche (true o ogni N punti)',
    firstActorStrBonus: 'Forza in più ai tiri se agisce per primo nel round',
    freeFirstMerchantItem: 'primo oggetto di ogni mercante gratis',
    helpDmgBonus: 'Aiuta riuscito: danno in più al prossimo eroe nel round',
    merchantDiscount: 'sconto dal mercante (frazione, es. 0.2)',
    postCombatHeal: 'dopo ogni scontro cura l\'eroe più ferito',
    tenacityRevive: 'la prima volta a 0 HP torna con questi HP'
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
