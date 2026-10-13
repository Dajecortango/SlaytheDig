/* ==========================================================================
   SCHEDA DEI DATI
   Un'unica descrizione dei campi di ogni tipo di dato (libreria e parti di una campagna): quali campi esistono,
   di che tipo sono, quali sono obbligatori e quali valori ammettono. La usano:
     - l'editor, per i "Controlli" (validateCampaign in js/editor/controlli.js);
     - i test (tests/schema.test.js): ogni elemento dei dati la rispetta, e ogni campo dei moduli dell'editor
       (*_FIELDS in js/editor/campi.js) esiste qui, così editor, motore e dati non si separano.
   Un campo nuovo del motore va aggiunto qui (e nel modulo dell'editor, se si modifica da lì).
   Caricato dopo js/comune.js (usa RARITY_LABELS, SPECIALI_*, NEMICO_*, EFFECT_TYPES) da gioco, editor e test.
   ========================================================================== */

// Campo: tipo ("testo", "numero", "bool", "percorso", "chiave", "scelta", "elenco", "oggetto", "speciali", "effetti"),
// valori (per "scelta": oggetto o funzione che dà le chiavi ammesse), obbligatorio, vocab (per "speciali"),
// schema (per "oggetto" o per gli elementi di un "elenco" di oggetti)
const campo = (tipo, extra = {}) => ({ tipo, ...extra });
const TESTO = campo('testo'), NUMERO = campo('numero'), BOOL = campo('bool'), PERCORSO = campo('percorso');
const CHIAVE = campo('chiave');  // chiave di un testo della campagna: testo o numero (diventa la chiave dell'oggetto)
const OBBL = c => ({ ...c, obbligatorio: true });
const STATISTICHE_PROVA = { str: 'Forza', int: 'Intelligenza', fth: 'Fede' };

const SCHEMA_SPECIALI = campo('speciali', { vocab: 'eroe' });
const SCHEMA_EFFETTI = campo('effetti');

const SCHEMA_STRADA = {
    testo: TESTO, stat: OBBL(campo('scelta', { valori: STATISTICHE_PROVA })), cd: OBBL(NUMERO), malus: NUMERO, prezzo: SCHEMA_EFFETTI,
    successText: TESTO, failText: TESTO, reward: campo('riferimento'), punishment: campo('riferimento')
};
const SCHEMA_SCELTA = {
    testo: TESTO, costo: NUMERO, stat: campo('scelta', { valori: STATISTICHE_PROVA }), cd: NUMERO, effetti: SCHEMA_EFFETTI, esito: TESTO,
    fallimento: campo('oggetto', { schema: { effetti: SCHEMA_EFFETTI, esito: TESTO } })
};
const SCHEMA_FASE = {
    soglia: NUMERO, round: NUMERO, testo: TESTO, azioni: campo('elenco'),
    // formato di prima, convertito dall'editor (legacyPhaseActions)
    schema: TESTO, reazione: TESTO, bonusDanno: NUMERO, ruggito: campo('oggetto')
};
const SCHEMA_COMBAT = {
    dice: NUMERO, attackStat: TESTO, damageStat: TESTO, attackBonus: NUMERO, damageBonus: NUMERO, damageMult: NUMERO,
    stun: BOOL, critical: BOOL, autoHit: BOOL, requiresHitLastTurn: BOOL, damageTakenBonus: BOOL, armorGain: NUMERO,
    sumTarget: NUMERO, senzaTiro: BOOL, effetti: campo('speciali', { vocab: 'abilita' }), useText: TESTO, hitLabel: TESTO, hitText: TESTO
};
const ITEM_TYPES = { consumable_heal: 'Cura', consumable_full: 'Cura tutto', consumable_damage: 'Danno', consumable_buff: 'Potenziamento' };

const DATI_SCHEMA = {
    armeria: {
        id: TESTO, name: OBBL(TESTO), rarity: campo('scelta', { valori: RARITY_LABELS }), type: campo('scelta', { valori: ITEM_TYPES }),
        desc: TESTO, icon: PERCORSO, str: NUMERO, dmg: NUMERO, armor: NUMERO, def_armor: NUMERO, def_bonus: NUMERO, help_bonus_val: NUMERO,
        fth: NUMERO, int: NUMERO, prayer_bonus: NUMERO, att_penalty: NUMERO, heal_val: NUMERO, dmg_val: NUMERO,
        buff_stat: TESTO, buff_val: NUMERO, buff_rounds: NUMERO, scaling: campo('elenco'), speciali: SCHEMA_SPECIALI
    },
    bestiario: {
        name: OBBL(TESTO), hp: OBBL(NUMERO), maxHp: OBBL(NUMERO), att: OBBL(NUMERO), dmg: OBBL(NUMERO), ca: OBBL(NUMERO), desc: TESTO,
        image: PERCORSO, video: PERCORSO, sfxAttack: PERCORSO, sfxHit: PERCORSO, sfxDeath: PERCORSO,
        fasi: campo('elenco', { schema: SCHEMA_FASE }), speciali: campo('speciali', { vocab: 'nemico' })
    },
    reliquie: { type: TESTO, name: OBBL(TESTO), desc: TESTO, effects: SCHEMA_EFFETTI, speciali: SCHEMA_SPECIALI },
    maledizioni: { type: TESTO, name: OBBL(TESTO), desc: TESTO, effects: SCHEMA_EFFETTI, speciali: SCHEMA_SPECIALI },
    abilita: {
        id: TESTO, name: OBBL(TESTO), desc: TESTO, icon: PERCORSO, isCombatActive: BOOL, actionName: TESTO,
        type: campo('scelta', { valori: { passive_stat: 'Bonus a una statistica' } }), stat: TESTO, val: NUMERO,
        effects: SCHEMA_EFFETTI, speciali: SCHEMA_SPECIALI, combat: campo('oggetto', { schema: SCHEMA_COMBAT })
    },
    eroi: {
        name: OBBL(TESTO), str: NUMERO, int: NUMERO, fth: NUMERO, maxHp: NUMERO, hp: NUMERO, dmg: NUMERO, base_armor: NUMERO,
        current_armor: NUMERO, att_penalty: NUMERO, def_bonus: NUMERO, help_bonus_val: NUMERO, items: campo('elenco'),
        abilities: campo('elenco'), runeOptions: campo('elenco'), runeSlots: NUMERO,
        portrait: PERCORSO, portraitWounded: PERCORSO, portraitPos: TESTO, portraitZoom: NUMERO,
        portraitWoundedPos: TESTO, portraitWoundedZoom: NUMERO, portraitStrikeZoom: NUMERO
    },
    azioni_elite: {
        name: OBBL(TESTO), desc: TESTO, icon: PERCORSO,
        colpo: campo('scelta', { valori: () => ELITE_TARGETS }), colpoDanno: NUMERO, colpoVicini: NUMERO,
        bonusDanno: NUMERO, bonusAttacco: NUMERO, bonusCA: NUMERO, cura: NUMERO, malus: NUMERO, malusRound: NUMERO, resisteFede: NUMERO,
        stordisce: campo('scelta', { valori: () => ELITE_TARGETS }), spezzaArmatura: campo('scelta', { valori: () => ELITE_TARGETS }),
        turno: BOOL, turnoBersaglio: campo('scelta', { valori: () => ELITE_TURN_TARGETS }), turnoDanno: NUMERO, turnoColpi: NUMERO,
        turnoVicini: NUMERO, turnoPreparazione: BOOL, turnoTestoPreparazione: TESTO, turnoCrescitaDanno: NUMERO, turnoRigenera: NUMERO,
        turnoAura: NUMERO, turnoRubaVita: BOOL, speciali: campo('speciali', { vocab: 'nemico' })
    },
    benedizioni: {
        name: OBBL(TESTO), livello: OBBL(campo('scelta', { valori: { minore: 'Minore', maggiore: 'Maggiore' } })),
        bersaglio: OBBL(campo('scelta', { valori: { eroe: 'Un eroe', party: 'Tutta la compagnia' } })),
        effetto: OBBL(campo('scelta', { valori: { prossimo_scontro: 1, cura_party: 1, togli_maledizione: 1, fede: 1, bottino_extra: 1, dono: 1 } })),
        icon: PERCORSO, desc: TESTO, buffs: campo('elenco'), val: NUMERO, speciali: SCHEMA_SPECIALI
    },
    // Parti di una campagna (data/campagne/<id>.js)
    campagna: {
        id: OBBL(TESTO), title: OBBL(TESTO), badge: TESTO, description: TESTO, coverImage: PERCORSO, introText: TESTO,
        heroes: campo('elenco'), initialArmory: campo('elenco'), lootItems: campo('elenco'), abilities: campo('oggetto'),
        challenges: campo('oggetto'), merchants: campo('oggetto'), rests: campo('oggetto'), treasures: campo('oggetto'),
        stories: campo('oggetto'), mapNodes: campo('elenco'), enemies: campo('oggetto'),
        difficolta: campo('oggetto', { schema: { vittoriaMin: NUMERO, vittoriaMax: NUMERO } }), procedurale: campo('oggetto')
    },
    sfida: {
        title: OBBL(TESTO), stat: OBBL(campo('scelta', { valori: STATISTICHE_PROVA })), cd: OBBL(NUMERO), malus: NUMERO,
        desc: TESTO, ignoreText: TESTO, successText: TESTO, failText: TESTO,
        reward: campo('riferimento'), punishment: campo('riferimento'), strade: campo('elenco', { schema: SCHEMA_STRADA })
    },
    trama: { title: TESTO, text: TESTO, scelte: campo('elenco', { schema: SCHEMA_SCELTA }) },
    nodo: {
        id: OBBL(NUMERO), level: OBBL(NUMERO), x: NUMERO, type: OBBL(TESTO), title: TESTO, icon: TESTO, image: PERCORSO,
        enemy: TESTO, challengeId: CHIAVE, merchantId: CHIAVE, restId: CHIAVE, treasureId: CHIAVE, storyId: CHIAVE,
        next: campo('elenco'), active: BOOL, done: BOOL
    }
};

// Effetti speciali: momento, azione e campi conosciuti per il vocabolario ("eroe", "abilita", "nemico")
function controllaSpeciali(list, vocab, dove, out) {
    const nemico = vocab === 'nemico';
    const Q = nemico ? NEMICO_QUANDO : vocab === 'abilita' ? SPECIALI_QUANDO_ABILITA : SPECIALI_QUANDO;
    const F = nemico ? NEMICO_FAI : SPECIALI_FAI;
    const SE = nemico ? NEMICO_SE : SPECIALI_SE;
    const B = nemico ? NEMICO_BERSAGLI : SPECIALI_BERSAGLI;
    const ST = { ...SPECIALI_STAT, ...SPECIALI_STAT_NEMICO };
    list.forEach((s, i) => {
        const at = `${dove}, effetto ${i + 1}`;
        if (!s || typeof s !== 'object') { out.push({ livello: 'errore', msg: `${at}: non è un effetto` }); return; }
        if (!Q[s.quando]) out.push({ livello: 'errore', msg: `${at}: momento "${s.quando}" sconosciuto` });
        if (!F[s.fai]) out.push({ livello: 'errore', msg: `${at}: azione "${s.fai}" sconosciuta` });
        else if (!nemico && Q[s.quando] && !F[s.fai].quando.includes(s.quando)) out.push({ livello: 'errore', msg: `${at}: "${s.fai}" non ha senso con "${s.quando}"` });
        if (s.se && !SE[s.se]) out.push({ livello: 'errore', msg: `${at}: condizione "${s.se}" sconosciuta` });
        if (s.bersaglio && !B[s.bersaglio]) out.push({ livello: 'errore', msg: `${at}: bersaglio "${s.bersaglio}" sconosciuto` });
        if (s.stat && !ST[s.stat]) out.push({ livello: 'errore', msg: `${at}: statistica "${s.stat}" sconosciuta` });
        if (s.limite && !['scontro', 'capitolo'].includes(s.limite)) out.push({ livello: 'errore', msg: `${at}: limite "${s.limite}" sconosciuto` });
    });
}

// Effetti di applyEffects: tipo conosciuto e campi richiesti (EFFECT_TYPES)
function controllaEffetti(list, dove, out) {
    list.forEach((e, i) => {
        const need = e && EFFECT_TYPES[e.effect];
        if (!need) { out.push({ livello: 'errore', msg: `${dove}, effetto ${i + 1}: tipo "${e && e.effect}" sconosciuto` }); return; }
        need.filter(k => e[k] === undefined).forEach(k => out.push({ livello: 'errore', msg: `${dove}, effetto ${i + 1}: manca "${k}"` }));
    });
}

// Controlla un elemento con la sua scheda. Ritorna [{ livello: "errore" | "avviso", msg }]:
// errore = tipo sbagliato, campo obbligatorio mancante, valore non ammesso; avviso = campo che nessuno conosce
function controllaElemento(schema, el, dove, out = []) {
    if (!el || typeof el !== 'object' || Array.isArray(el)) { out.push({ livello: 'errore', msg: `${dove}: non è un elemento` }); return out; }
    Object.entries(schema).forEach(([k, c]) => {
        if (c.obbligatorio && (el[k] === undefined || el[k] === null || el[k] === '')) out.push({ livello: 'errore', msg: `${dove}: manca "${k}"` });
    });
    Object.entries(el).forEach(([k, v]) => {
        const c = schema[k];
        if (!c) { out.push({ livello: 'avviso', msg: `${dove}: campo "${k}" sconosciuto (il gioco non lo usa)` }); return; }
        if (v === null || v === undefined) return;
        const tipo = c.tipo;
        const sbagliato = msg => out.push({ livello: 'errore', msg: `${dove}: "${k}" ${msg}` });
        if ((tipo === 'testo' || tipo === 'percorso') && typeof v !== 'string') return sbagliato('deve essere un testo');
        if (tipo === 'numero' && (typeof v !== 'number' || !Number.isFinite(v))) return sbagliato('deve essere un numero');
        if (tipo === 'chiave' && typeof v !== 'string' && typeof v !== 'number') return sbagliato('deve essere un testo o un numero');
        if (tipo === 'bool' && typeof v !== 'boolean') return sbagliato('deve essere vero o falso');
        if (tipo === 'scelta') {
            const valori = typeof c.valori === 'function' ? c.valori() : c.valori;
            if (!Object.prototype.hasOwnProperty.call(valori || {}, v)) sbagliato(`vale "${v}", ammessi: ${Object.keys(valori || {}).join(', ')}`);
            return;
        }
        if (['elenco', 'speciali', 'effetti'].includes(tipo) && !Array.isArray(v)) return sbagliato('deve essere un elenco');
        if (tipo === 'oggetto' && (typeof v !== 'object' || Array.isArray(v))) return sbagliato('deve essere un oggetto');
        if (tipo === 'speciali') controllaSpeciali(v, c.vocab, `${dove} (${k})`, out);
        if (tipo === 'effetti') controllaEffetti(v, `${dove} (${k})`, out);
        if (tipo === 'oggetto' && c.schema) controllaElemento(c.schema, v, `${dove} (${k})`, out);
        if (tipo === 'elenco' && c.schema) v.forEach((x, i) => controllaElemento(c.schema, x, `${dove} (${k} ${i + 1})`, out));
    });
    return out;
}

// Tutti i problemi di una libreria (es. "armeria") o di una campagna con le sue parti
function controllaLibreria(kind, items) {
    const out = [];
    Object.entries(items || {}).forEach(([id, el]) => controllaElemento(DATI_SCHEMA[kind], el, `${kind} ${id}`, out));
    return out;
}
function controllaCampagna(c) {
    const out = controllaElemento(DATI_SCHEMA.campagna, c, `campagna ${c && c.id}`);
    Object.entries((c && c.challenges) || {}).forEach(([k, x]) => controllaElemento(DATI_SCHEMA.sfida, x, `sfida ${k}`, out));
    Object.entries((c && c.stories) || {}).forEach(([k, x]) => controllaElemento(DATI_SCHEMA.trama, x, `trama ${k}`, out));
    ((c && c.mapNodes) || []).forEach(n => controllaElemento(DATI_SCHEMA.nodo, n, `nodo ${n && n.id}`, out));
    return out;
}
