/* ==========================================================================
   EDITOR DELLE CAMPAGNE
   Modifica le campagne (data/campagne/<id>.js) e la libreria condivisa
   (data/libreria/: armeria, bestiario, reliquie, maledizioni, eroi, abilità) con moduli,
   anteprima della mappa e controlli automatici.
   Le campagne richiamano gli elementi della libreria per id (vedi js/libreria.js):
   nei nodi si sceglie il nemico dal bestiario, nelle sfide ricompensa e punizione
   da reliquie e maledizioni, nella campagna l'armeria iniziale e il bottino dall'armeria,
   negli eroi le abilità dalla libreria Abilità.
   Dal branch campaign-editor di Valerio (adattate al formato con "effects"):
   - "Salva nel progetto": scrive direttamente i file nella cartella del gioco
     (File System Access API di Edge/Chrome), con .zip di riserva;
   - caricamento delle immagini (copertina, nodi, ritratti);
   - bozza salvata da sola nel browser (IndexedDB);
   - "Prova nel gioco": apre il gioco con la campagna in modifica.
   ========================================================================== */

/* ==========================================================================
   EDITOR: CAMPI DEI MODULI
   Tipi di nodo e definizione dei campi di ogni modulo: generale, eroi, abilità,
   oggetti, nemici, reliquie, maledizioni, sfide, nodi della mappa, testi.
   Primo file dell'editor; dopo di lui, in quest'ordine: stato.js, progetto.js, moduli.js,
   anteprime.js, raccolte.js, campagna.js, mappa.js, elite.js, controlli.js, avvio.js (ultimo).
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

// esc, RARITY_LABELS, STAT_LABELS, EFFECT_TYPES (tipi di effetto di applyEffects) e i valori dei ritratti
// sono in js/comune.js, condiviso con il gioco.

const NODE_TYPES = {
    combat: { label: 'Scontro', color: '#c0392b', ref: 'enemy' },
    elite: { label: 'Scontro elite', color: '#8e44ad', ref: 'enemy' },
    challenge: { label: 'Sfida', color: '#2980b9', ref: 'challengeId' },
    treasure: { label: 'Tesoro', color: '#d4a017', ref: 'treasureId' },
    merchant: { label: 'Mercante', color: '#27ae60', ref: 'merchantId' },
    rest: { label: 'Riposo', color: '#e67e22', ref: 'restId' },
    story: { label: 'Trama', color: '#7f8c8d', ref: 'storyId' },
    captain: { label: 'Meta (capitano)', color: '#ecf0f1', ref: null }
};
const NODE_ICONS = { combat: '🗡️', elite: '👹', challenge: '❓', treasure: '💎', merchant: '🪙', rest: '⛺', story: '📜', captain: '👑' };

const GENERAL_FIELDS = [
    { k: 'id', label: 'Id (nome del file)', help: 'Solo lettere minuscole, numeri e _' },
    { k: 'title', label: 'Titolo' },
    { k: 'badge', label: 'Etichetta' },
    { k: 'coverImage', label: 'Immagine di copertina', type: 'image', folder: 'immagini', wide: true },
    { k: 'description', label: 'Descrizione breve', type: 'textarea', wide: true },
    { k: 'introText', label: 'Testo introduttivo', type: 'textarea', wide: true },
    { k: 'difficolta.vittoriaMin', label: 'Difficoltà voluta: vittorie minime (%)', type: 'number', omitEmpty: true,
      help: 'Percentuale di vittoria media del simulatore (tutti i profili, party di 3 eroi). I test avvisano se si scende sotto' },
    { k: 'difficolta.vittoriaMax', label: 'Difficoltà voluta: vittorie massime (%)', type: 'number', omitEmpty: true,
      help: 'I test avvisano se la campagna diventa più facile di così' }
];

const HERO_FIELDS = [
    { k: 'name', label: 'Nome', wide: true, help: 'Il nome collega l\'eroe al suo ritratto nelle card del gioco' },
    { k: 'str', label: 'Forza', type: 'number' },
    { k: 'int', label: 'Intelligenza', type: 'number' },
    { k: 'fth', label: 'Fede', type: 'number' },
    { k: 'maxHp', label: 'HP massimi', type: 'number' },
    { k: 'dmg', label: 'Danno', type: 'number' },
    { k: 'base_armor', label: 'Armatura base', type: 'number' },
    { k: 'portrait', label: 'Ritratto', type: 'image', folder: 'immagini/ritratti', wide: true },
    { k: 'portraitWounded', label: 'Ritratto da ferito', type: 'image', folder: 'immagini/ritratti', wide: true,
      help: 'Facoltativo: mostrato con 2 HP o meno' },
    { k: 'portraitFrame', label: 'Inquadratura del ritratto', type: 'portraitframe', wide: true,
      help: 'Trascina il ritratto per scegliere il punto da tenere al centro, regola lo zoom con il cursore. Sotto ogni icona c\'è l\'anteprima della cinematica d\'attacco.' }
];

// Eroe della libreria: statistiche + abilità tra cui scegliere (id della libreria Abilità)
const HERO_LIB_FIELDS = [...HERO_FIELDS, {
    k: 'abilities', label: 'Abilità tra cui scegliere', type: 'reflist', lib: 'abilita', wide: true,
    help: 'Il giocatore ne sceglie una quando recluta l\'eroe. Le abilità si creano e si modificano nella scheda Abilità.'
}, {
    k: 'runeOptions', label: 'Rune tra cui scegliere', type: 'reflist', lib: 'abilita', wide: true,
    help: 'Facoltativo, al posto delle abilità: il giocatore sceglie tante rune quante dice "Rune equipaggiate" e a ogni riposo può scambiarne una con una che non ha. Le rune sono passive della scheda Abilità (effetti hero_set o hero_stat).'
}, {
    k: 'runeSlots', label: 'Rune equipaggiate', type: 'number', omitEmpty: true
}];

// Statistiche che un'abilità attiva può aggiungere al tiro per colpire o al danno (campo "combat", vedi abilityCombat in js/game.js)
const COMBAT_STAT_OPTIONS = () => [['', 'Nessuna'], ['int', STAT_LABELS.int], ['fth', STAT_LABELS.fth], ['str', STAT_LABELS.str + ' (di nuovo)']];
const isActive = a => !!a.isCombatActive;
const isPassiveStat = a => !a.isCombatActive && a.type === 'passive_stat';
// "Passiva" o "Attiva" più la descrizione, senza ripeterlo se la descrizione comincia già così
const abilitySummary = a => /^(passiva|attiva)/i.test(a.desc || '') ? a.desc : [a.isCombatActive ? 'Attiva' : 'Passiva', a.desc].filter(Boolean).join(' · ');

// Abilità della libreria (l'id è la chiave nella libreria)
const ABILITY_FIELDS = [
    { k: 'name', label: 'Nome', wide: true },
    { k: 'desc', label: 'Descrizione mostrata al giocatore', wide: true },
    { k: 'icon', label: 'Icona', type: 'image', folder: 'immagini/icone', wide: true,
      help: 'Solo icone classiche di Warcraft III (non Reforged). Vuoto = icona generica' },
    { k: 'isCombatActive', label: 'Attiva in combattimento (1 volta per scontro)', type: 'checkbox', wide: true },
    { k: 'actionName', label: 'Nome del comando in combattimento', wide: true, showIf: isActive },
    { k: 'combat.dice', label: 'Dadi per colpire', type: 'select', showIf: isActive, numeric: true,
      options: () => [['1', 'Un dado'], ['2', 'Due dadi, tiene il migliore']] },
    { k: 'combat.attackStat', label: 'Aggiunge al tiro per colpire', type: 'select', omitEmpty: true, showIf: isActive, options: COMBAT_STAT_OPTIONS,
      help: 'Il tiro è sempre d6 + Forza: qui si aggiunge un\'altra statistica' },
    { k: 'combat.damageStat', label: 'Aggiunge al danno', type: 'select', omitEmpty: true, showIf: isActive, options: COMBAT_STAT_OPTIONS },
    { k: 'combat.attackBonus', label: 'Bonus fisso al tiro per colpire', type: 'number', omitEmpty: true, showIf: isActive, help: 'Es. 2 = +2 al tiro' },
    { k: 'combat.damageBonus', label: 'Bonus fisso al danno', type: 'number', omitEmpty: true, showIf: isActive, help: 'Es. 1 = +1 danno se colpisce' },
    { k: 'combat.damageMult', label: 'Moltiplicatore del danno', type: 'number', omitEmpty: true, showIf: isActive,
      help: 'Vuoto = normale, 2 = danno raddoppiato' },
    { k: 'combat.stun', label: 'Se colpisce, stordisce il nemico (salta il suo prossimo attacco)', type: 'checkbox', omitEmpty: true, showIf: isActive, wide: true },
    { k: 'combat.critical', label: 'Il colpo a segno mostra i numeri del critico', type: 'checkbox', omitEmpty: true, showIf: isActive, wide: true },
    { k: 'combat.autoHit', label: 'Colpisce sempre, senza tiro (vale come un 6)', type: 'checkbox', omitEmpty: true, showIf: isActive, wide: true },
    { k: 'combat.requiresHitLastTurn', label: 'Usabile solo se il nemico ha colpito l\'eroe nel suo ultimo turno', type: 'checkbox', omitEmpty: true, showIf: isActive, wide: true },
    { k: 'combat.armorGain', label: 'Senza tiro: armatura ottenuta subito', type: 'number', omitEmpty: true, showIf: isActive, wide: true,
      help: 'Vuoto = abilità normale. Es. 4: l\'eroe usa la sua azione e guadagna 4 Armatura, senza dadi' },
    { k: 'combat.sumTarget', label: 'Due dadi: se la somma è esattamente questo numero, nemico sconfitto (elite e boss a metà vita)', type: 'number', omitEmpty: true, showIf: isActive, wide: true,
      help: 'Vuoto = abilità normale. Es. 7 (17%), 2 o 12 (3%). Il tiro non usa Forza, bonus o reliquie' },
    { k: 'combat.damageTakenBonus', label: 'Aggiunge al danno i danni subiti in quel colpo (HP e armatura persi)', type: 'checkbox', omitEmpty: true, showIf: isActive, wide: true },
    { k: 'combat.useText', label: 'Diario: quando la usa', wide: true, omitEmpty: true, showIf: isActive,
      help: '{eroe} = nome dell\'eroe. Es. "✨ {eroe} infonde il colpo di fede sacra!"' },
    { k: 'combat.hitLabel', label: 'Scritta del colpo a segno', omitEmpty: true, showIf: isActive, help: 'Es. COLPO CRITICO! (vuoto = COLPO A SEGNO!)' },
    { k: 'combat.hitText', label: 'Diario: se colpisce', wide: true, omitEmpty: true, showIf: isActive,
      help: '{danni} = danni inflitti. Es. "La luce divina guida la lama: infliggi {danni} danni!"' },
    { k: 'type', label: 'Tipo di passiva', type: 'select', omitEmpty: true, showIf: a => !a.isCombatActive,
      options: () => [['', 'Con effetti (JSON)'], ['passive_stat', 'Bonus semplice a una statistica']] },
    { k: 'stat', label: 'Statistica', type: 'select', showIf: isPassiveStat,
      options: () => [['str', 'Forza'], ['int', 'Intelligenza'], ['fth', 'Fede'], ['hp', 'HP massimi']] },
    { k: 'val', label: 'Bonus', type: 'number', showIf: isPassiveStat },
    { k: 'effects', label: 'Effetti alla scelta (JSON)', type: 'json', wide: true, nullable: true,
      showIf: a => !a.isCombatActive && a.type !== 'passive_stat',
      help: 'Es. [{ "effect": "hero_stat", "stat": "dmg", "val": 1 }] = +1 Danno permanente. Tipi: ' + Object.keys(EFFECT_TYPES).join(', ') }
];

// Oggetto dell'armeria (l'id è la chiave nella libreria)
// Statistiche di un potenziamento temporaneo (le stesse di BUFF_STATS in js/game.js)
const BUFF_STATS_EDITOR = { str: 'Forza', dmg: 'Danno', att_bonus: 'Tiro per colpire', def_bonus: 'Difesa',
    def_armor: 'Armatura con Difendi', help_bonus_val: 'Aiuto', current_armor: 'Armatura (subito, non scade)' };
const ITEM_FIELDS = [
    { k: 'name', label: 'Nome' },
    { k: 'icon', label: 'Icona', type: 'image', folder: 'immagini/icone', wide: true,
      help: 'Solo icone classiche di Warcraft III (non Reforged). Vuoto = icona generica del tipo di oggetto' },
    { k: 'rarity', label: 'Rarità', type: 'select', omitEmpty: true, options: () => [['', '—'], ...Object.entries(RARITY_LABELS).map(([k, label]) => [k, `${label} (${RARITY_COLORS[k]})`])] },
    { k: 'type', label: 'Tipo', type: 'select', omitEmpty: true,
      options: () => [['', 'Equipaggiamento'], ['consumable_heal', 'Consumabile: cura'], ['consumable_full', 'Consumabile: cura completa'],
          ['consumable_damage', 'Consumabile: danno al nemico (solo in combattimento)'], ['consumable_buff', 'Consumabile: potenziamento temporaneo (solo in combattimento)']] },
    { k: 'heal_val', label: 'HP curati', type: 'number', omitEmpty: true, showIf: it => it.type === 'consumable_heal' },
    { k: 'dmg_val', label: 'Danni al nemico', type: 'number', omitEmpty: true, showIf: it => it.type === 'consumable_damage' },
    { k: 'buff_stat', label: 'Statistica potenziata', type: 'select', showIf: it => it.type === 'consumable_buff',
      options: () => Object.entries(BUFF_STATS_EDITOR) },
    { k: 'buff_val', label: 'Bonus', type: 'number', showIf: it => it.type === 'consumable_buff' },
    { k: 'buff_rounds', label: 'Durata in round', type: 'number', omitEmpty: true, showIf: it => it.type === 'consumable_buff' && it.buff_stat !== 'current_armor',
      help: 'Vuoto o 0 = per tutto lo scontro. 1 = solo il round in cui lo usi' },
    { k: 'def_armor', label: 'Armatura in più con Difendi (scudi)', type: 'number', omitEmpty: true, showIf: it => !(it.type || '').startsWith('consumable'),
      help: 'Un tiro di difesa riuscito dà 1 Armatura più questo valore' },
    { k: 'str', label: 'Forza', type: 'number', omitEmpty: true },
    { k: 'dmg', label: 'Danno', type: 'number', omitEmpty: true },
    { k: 'armor', label: 'Armatura', type: 'number', omitEmpty: true },
    { k: 'att_penalty', label: 'Penalità attacco', type: 'number', omitEmpty: true },
    { k: 'def_bonus', label: 'Bonus difesa', type: 'number', omitEmpty: true },
    { k: 'help_bonus_val', label: 'Bonus aiuto', type: 'number', omitEmpty: true },
    { k: 'fth', label: 'Fede', type: 'number', omitEmpty: true },
    { k: 'int', label: 'Intelligenza', type: 'number', omitEmpty: true },
    { k: 'scaling', label: 'Bonus in scala con Fede o Intelligenza (JSON)', type: 'json', wide: true, nullable: true,
      help: 'Es. [{ "stat": "dmg", "per": "fth", "every": 2 }] = +1 Danno ogni 2 Fede. "stat": str, dmg, armor, def_bonus, help_bonus_val; "per": fth o int; "max" facoltativo. Ricordati di scriverlo anche nella descrizione.' },
    { k: 'desc', label: 'Descrizione mostrata al giocatore', wide: true }
];

const ENEMY_FIELDS = [
    { k: 'name', label: 'Nome', wide: true },
    { k: 'image', label: 'Immagine dello scontro', type: 'image', folder: 'immagini/bestiario', wide: true,
      help: 'Usata da tutti i nodi con questo nemico, salvo quelli che indicano un\'immagine propria' },
    { k: 'hp', label: 'HP', type: 'number' },
    { k: 'maxHp', label: 'HP massimi', type: 'number' },
    { k: 'att', label: 'Attacco', type: 'number', help: 'Da superare per difendersi e aiutare' },
    { k: 'ca', label: 'Classe armatura', type: 'number', help: 'Da superare per colpire' },
    { k: 'dmg', label: 'Danno', type: 'number' },
    { k: 'desc', label: 'Descrizione', type: 'textarea', wide: true },
    { k: 'video', label: 'Video (elite e boss)', type: 'video', folder: 'video/nemici', wide: true,
      help: 'Facoltativo (.mp4 o .webm, senza audio): nello scontro si vede al posto dell\'immagine, in ciclo' },
    { k: 'sfxAttack', label: 'Suono quando attacca', type: 'audio', folder: 'audio/nemici', wide: true },
    { k: 'sfxHit', label: 'Suono quando viene colpito', type: 'audio', folder: 'audio/nemici', wide: true },
    { k: 'sfxDeath', label: 'Suono quando muore', type: 'audio', folder: 'audio/nemici', wide: true,
      help: 'Vuoti = suoni generati del gioco. Se manca quello della morte, alla morte suona quello del colpo.' }
];

// Azione speciale degli elite (data/azioni_elite/azioni_elite.js), interpretata da js/combattimento.js.
// Si combinano i campi: una parte "alla soglia" (subito) e una "a ogni turno" (da quel momento).
const eliteTargetOptions = () => [['', '—'], ...Object.entries(ELITE_TARGETS)];
const hasTurn = a => !!a.turno;
const ELITE_ACTION_FIELDS = [
    { k: 'name', label: 'Nome', wide: true, help: 'Mostrato sul nemico (tooltip e, per le azioni a ogni turno, l\'etichetta accanto al nome)' },
    { k: 'desc', label: 'Descrizione mostrata al giocatore', wide: true },
    { k: 'icon', label: 'Icona (facoltativa)', type: 'image', folder: 'immagini/icone', wide: true },
    { k: 'colpo', label: 'Alla soglia: attacco in risposta contro', type: 'select', omitEmpty: true, options: eliteTargetOptions, wide: true,
      help: 'Colpisce subito, fuori dal suo turno; al suo turno poi attacca come sempre. Uno stordito non risponde' },
    { k: 'colpoDanno', label: 'Danno dell\'attacco in risposta', type: 'number', omitEmpty: true, showIf: a => !!a.colpo, help: 'Vuoto = il danno del nemico' },
    { k: 'colpoVicini', label: 'Danno agli eroi accanto al colpito', type: 'number', omitEmpty: true, showIf: a => !!a.colpo },
    { k: 'bonusDanno', label: 'Alla soglia: danno del nemico (+/-)', type: 'number', omitEmpty: true },
    { k: 'bonusAttacco', label: 'Alla soglia: Attacco del nemico (+/-)', type: 'number', omitEmpty: true, help: 'Più alto = più difficile difendersi e aiutare' },
    { k: 'bonusCA', label: 'Alla soglia: CA del nemico (+/-)', type: 'number', omitEmpty: true, help: 'Più alta = più difficile colpirlo' },
    { k: 'cura', label: 'Alla soglia: HP che il nemico recupera', type: 'number', omitEmpty: true },
    { k: 'malus', label: 'Alla soglia: malus al tiro per colpire degli eroi', type: 'number', omitEmpty: true, help: 'Es. 1 = -1 al tiro (Ruggito)' },
    { k: 'malusRound', label: 'Durata del malus (turni)', type: 'number', omitEmpty: true, showIf: a => !!a.malus, help: 'Vuoto = 1 turno' },
    { k: 'resisteFede', label: 'Resiste al malus chi ha almeno questa Fede', type: 'number', omitEmpty: true, showIf: a => !!a.malus, help: 'Vuoto = nessuno resiste' },
    { k: 'stordisce', label: 'Alla soglia: salta il prossimo turno', type: 'select', omitEmpty: true, options: eliteTargetOptions },
    { k: 'spezzaArmatura', label: 'Alla soglia: perde tutta l\'armatura', type: 'select', omitEmpty: true, options: eliteTargetOptions },
    { k: 'turno', label: 'Cambia il modo di attaccare: a ogni suo turno, da quel momento (sostituisce quello di prima)', type: 'checkbox', omitEmpty: true, wide: true },
    { k: 'turnoBersaglio', label: 'A ogni turno: bersaglio', type: 'select', showIf: hasTurn, options: () => Object.entries(ELITE_TURN_TARGETS), wide: true },
    { k: 'turnoDanno', label: 'A ogni turno: danno di ogni colpo', type: 'number', omitEmpty: true, showIf: hasTurn, help: 'Vuoto = il danno del nemico' },
    { k: 'turnoColpi', label: 'A ogni turno: colpi', type: 'number', omitEmpty: true, showIf: hasTurn, help: 'Vuoto = 1' },
    { k: 'turnoVicini', label: 'A ogni turno: danno agli eroi accanto al colpito', type: 'number', omitEmpty: true, showIf: hasTurn, help: 'Es. 1 = Travolge' },
    { k: 'turnoPreparazione', label: 'Un turno si prepara, il successivo colpisce (il primo dopo la soglia colpisce subito)', type: 'checkbox', omitEmpty: true, showIf: hasTurn, wide: true },
    { k: 'turnoTestoPreparazione', label: 'Testo del turno di preparazione', omitEmpty: true, wide: true, showIf: a => hasTurn(a) && !!a.turnoPreparazione,
      help: '{nemico} = nome del nemico. Es. "{nemico} raspa il terreno: al prossimo turno travolgerà la compagnia!"' },
    { k: 'turnoCrescitaDanno', label: 'A ogni turno: danno in più (cumulativo)', type: 'number', omitEmpty: true, showIf: hasTurn, help: 'Es. 1 = Furia' },
    { k: 'turnoRigenera', label: 'A ogni turno: HP che recupera', type: 'number', omitEmpty: true, showIf: hasTurn },
    { k: 'turnoAura', label: 'A ogni turno: danno a tutti prima dell\'attacco', type: 'number', omitEmpty: true, showIf: hasTurn },
    { k: 'turnoRubaVita', label: 'A ogni turno: recupera gli HP che toglie agli eroi', type: 'checkbox', omitEmpty: true, showIf: hasTurn, wide: true }
];

// Descrizione in parole di cosa fa un'azione (scheda Elite e anteprima)
function describeEliteAction(a) {
    const who = k => (ELITE_TARGETS[k] || k).toLowerCase();
    const n = (v, one, many) => `${v} ${v === 1 ? one : many}`;
    const parts = [];
    if (a.colpo) parts.push(`colpisce subito ${who(a.colpo)}${a.colpoDanno != null ? ` per ${n(a.colpoDanno, 'danno', 'danni')}` : ''}${a.colpoVicini ? ` (${a.colpoVicini} agli eroi accanto)` : ''}`);
    [['bonusDanno', 'danno'], ['bonusAttacco', 'Attacco'], ['bonusCA', 'CA']].forEach(([k, l]) => { if (a[k]) parts.push(`${a[k] > 0 ? '+' : ''}${a[k]} ${l}`); });
    if (a.cura) parts.push(`recupera ${a.cura} HP`);
    if (a.malus) parts.push(`-${a.malus} al tiro per colpire degli eroi per ${n(a.malusRound || 1, 'turno', 'turni')}${a.resisteFede ? ` (non per chi ha Fede ${a.resisteFede}+)` : ''}`);
    if (a.stordisce) parts.push(`${who(a.stordisce)} salta il prossimo turno`);
    if (a.spezzaArmatura) parts.push(`${who(a.spezzaArmatura)} perde l'armatura`);
    if (a.turno) {
        const t = [];
        if (a.turnoPreparazione) t.push('un turno si prepara e quello dopo colpisce');
        if (a.turnoRigenera) t.push(`recupera ${a.turnoRigenera} HP`);
        if (a.turnoAura) t.push(`${n(a.turnoAura, 'danno', 'danni')} a tutti`);
        t.push(`attacca ${(ELITE_TURN_TARGETS[a.turnoBersaglio || 'scelto'] || '').toLowerCase()}${a.turnoDanno != null ? ` per ${n(a.turnoDanno, 'danno', 'danni')}` : ''}${(a.turnoColpi || 1) > 1 ? `, ${a.turnoColpi} volte` : ''}`);
        if (a.turnoVicini) t.push(`${a.turnoVicini} agli eroi accanto`);
        if (a.turnoCrescitaDanno) t.push(`+${a.turnoCrescitaDanno} danno ogni turno`);
        if (a.turnoRubaVita) t.push('si cura dei danni inflitti');
        parts.push(`a ogni turno: ${t.join(', ')}`);
    }
    return parts.length ? parts.join('; ') : 'nessun effetto';
}

const RELIC_FIELDS = [
    { k: 'name', label: 'Nome', wide: true, help: 'Molte reliquie hanno un effetto legato al nome esatto in js/game.js (hasRelic): rinominarle ne cambia il comportamento' },
    { k: 'desc', label: 'Descrizione mostrata al giocatore', wide: true },
    { k: 'effects', label: 'Effetti all\'ottenimento (JSON)', type: 'json', wide: true, nullable: true,
      help: 'Es. [{ "effect": "party_stat", "stat": "fth", "val": 1 }] — vuoto = nessun effetto immediato' }
];

const CURSE_FIELDS = [
    { k: 'name', label: 'Nome', wide: true },
    { k: 'desc', label: 'Descrizione mostrata al giocatore', wide: true },
    { k: 'effects', label: 'Effetti (JSON)', type: 'json', wide: true, nullable: true,
      help: 'Di solito { "effect": "add_curse", "text": "Nome (effetto)" } più eventuali penalità, es. { "effect": "party_stat", "stat": "fth", "val": -1 }' }
];

const keysOf = obj => Object.keys(obj || {});
const refOptions = collection => () => [['', '—'], ...keysOf(camp[collection]).map(k => [k, k])];
const enemyOptions = () => [['', '—'], ...Object.entries(lib.bestiario).map(([k, e]) => [k, `${e.name} (HP ${e.maxHp} · CA ${e.ca} · Att ${e.att} · Danno ${e.dmg})`])];

const CHALLENGE_FIELDS = [
    { k: 'title', label: 'Titolo', wide: true },
    { k: 'stat', label: 'Statistica', type: 'select', options: () => [['int', 'Intelligenza'], ['fth', 'Fede'], ['str', 'Forza']] },
    { k: 'cd', label: 'Classe di difficoltà', type: 'number' },
    { k: 'desc', label: 'Descrizione', type: 'textarea', wide: true },
    { k: 'ignoreText', label: 'Testo se ignorata', type: 'textarea', wide: true },
    { k: 'successText', label: 'Testo di successo', type: 'textarea', wide: true },
    { k: 'failText', label: 'Testo di fallimento', type: 'textarea', wide: true },
    { k: 'reward', label: 'Ricompensa', type: 'libref', lib: 'reliquie', wide: true,
      custom: () => ({ type: 'coins', name: '', desc: '', effects: [{ effect: 'coins', val: 10 }] }),
      help: 'Una reliquia della libreria, oppure "Personalizzata" per un premio immediato (es. monete)' },
    { k: 'punishment', label: 'Punizione', type: 'libref', lib: 'maledizioni', wide: true,
      custom: () => ({ type: 'injury', name: '', desc: '', effects: [{ effect: 'party_damage', val: 1 }] }),
      help: 'Una maledizione della libreria, oppure "Personalizzata" per un danno o una penalità immediata' }
];

const NODE_FIELDS = [
    { k: 'id', label: 'Id', type: 'number' },
    { k: 'level', label: 'Livello (0 = partenza)', type: 'number' },
    { k: 'x', label: 'Posizione orizzontale (0–800)', type: 'number' },
    { k: 'type', label: 'Tipo', type: 'select', options: () => Object.entries(NODE_TYPES).map(([k, t]) => [k, t.label]) },
    { k: 'enemy', label: 'Nemico (dal bestiario)', type: 'select', options: enemyOptions, wide: true, showIf: n => n.type === 'combat' || n.type === 'elite' },
    { k: 'challengeId', label: 'Sfida', type: 'select', options: refOptions('challenges'), showIf: n => n.type === 'challenge' },
    { k: 'treasureId', label: 'Testo del tesoro', type: 'select', options: refOptions('treasures'), showIf: n => n.type === 'treasure' },
    { k: 'merchantId', label: 'Testo del mercante', type: 'select', options: refOptions('merchants'), showIf: n => n.type === 'merchant' },
    { k: 'restId', label: 'Testo del riposo', type: 'select', options: refOptions('rests'), showIf: n => n.type === 'rest' },
    { k: 'storyId', label: 'Trama', type: 'select', options: refOptions('stories'), showIf: n => n.type === 'story',
      help: 'Titolo e descrizione si scrivono qui sotto (più nodi possono usare la stessa trama)' },
    { k: 'title', label: 'Titolo', wide: true },
    { k: 'icon', label: 'Icona' },
    { k: 'image', label: 'Immagine', type: 'image', folder: 'immagini', wide: true,
      help: 'Negli scontri, vuoto = immagine del nemico nel bestiario' },
    { k: 'next', label: 'Collegamenti (id separati da virgola)', type: 'idlist' },
    { k: 'active', label: 'Nodo di partenza', type: 'checkbox' }
];

// Trama di un nodo di tipo "story" (camp.stories[storyId]), scritta sotto il modulo del nodo
const STORY_FIELDS = [
    { k: 'title', label: 'Titolo della trama', wide: true },
    { k: 'text', label: 'Descrizione', type: 'textarea', wide: true,
      help: 'Il racconto mostrato nella schermata della trama, dopo "Descrizione:". Una riga vuota separa i paragrafi.' }
];

const OTHER_SECTIONS = [
    { k: 'merchants', label: 'Testi dei mercanti', help: 'Chiave usata da merchantId nei nodi ("default" vale per tutti).' },
    { k: 'rests', label: 'Testi dei riposi', help: 'Chiave usata da restId nei nodi.' },
    { k: 'treasures', label: 'Testi dei tesori', help: 'Chiave usata da treasureId nei nodi.' },
    { k: 'stories', label: 'Trame', help: 'Chiave usata da storyId nei nodi di trama: { "chiave": { "title": "...", "text": "..." } }. Una riga vuota nel testo separa i paragrafi.' }
];

const ITEM_LISTS = { initialArmory: 'Armeria iniziale', lootItems: 'Bottino' };
