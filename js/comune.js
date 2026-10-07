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

// Ritratti degli eroi: inquadratura predefinita (soglia del ritratto da ferito: WOUNDED_HP in js/regole.js),
// zoom della cinematica d'attacco (la banda è larga e bassa: si ingrandisce meno che nell'icona)
const HERO_PORTRAIT_DEFAULTS = { pos: '50% 38%', zoom: 1.7 };
function strikeZoomFor(zoom) {
    return Math.round((1 + (zoom - 1) * 0.45) * 100) / 100;
}
