/* ==========================================================================
   SIMULATORE "Test Tasso di Vittoria"
   Gioca automaticamente una campagna N volte per uno o più profili
   comportamentali, riusando le funzioni pure di risoluzione di js/combattimento.js e js/game.js
   (resolveAttack, resolveAbility, resolveDefend, resolveHelp,
   resolveMonsterAttack, resolveChallenge, resolveRest, generateMerchantStock,
   generateTreasureOffer, resolveCaptainAction, pickLootItem, scaledCoins,
   applyEffects, applyItemEffects/revertItemEffects, hasRelic/hasCurse).

   Non chiama MAI funzioni che animano o scrivono sul DOM (niente
   setInterval/showScreen/alert/logCombat/discover/updatePartyStatusBars):
   quelle userebbero timer da 500ms per tiro (troppo lente per centinaia di
   run) e discover() inquinerebbe il Compendio reale del giocatore con le
   scoperte delle run simulate. Le run girano quindi sulle stesse variabili
   dello stato di js/game.js (stato.party, stato.stsMapNodes, stato.activeEnemy, ...),
   reimpostate da zero a ogni run, così i numeri restano sempre coerenti
   con le regole vere del gioco.
   ========================================================================== */

const SIM_DEFAULT_RUNS_PER_PROFILE = 100;
const SIM_MAX_NODE_VISITS = 200;   // sicurezza anti-loop su dati di mappa malformati
const SIM_MAX_COMBAT_ROUNDS = 30;  // sicurezza anti-stallo in combattimento

/* ---------- Helper condivisi tra profili ---------- */
// Lancio della panca: lancia l'oggetto che rende di più, danni della rarità meno quanto vale tenerlo (simItemValue)
function simThrowChoice(hero) {
    let best = 0, score = -Infinity;
    hero.items.forEach((it, i) => { const v = throwDamage(it) - simItemValue(it); if (v > score) { score = v; best = i; } });
    return best;
}

// Pozione da dare a qualcuno (bersaglio "scelto"): l'armatura a chi ha meno HP + armatura (e la può ricevere),
// i potenziamenti a chi colpisce più forte (Forza + Danno)
function simPotionTarget(hero) {
    const c = abilityCombat(hero.chosenAbility) || {};
    const alive = stato.party.filter(h => h.hp > 0);
    const armatura = (c.effetti || []).some(s => s.bersaglio === 'scelto' && s.fai === 'armatura');
    const t = armatura ? simAliveMinBy(alive.filter(h => !h.noArmor), h => h.hp + (h.current_armor || 0))
        : simAliveMaxBy(alive, h => (h.str || 0) + (h.dmg || 0));
    return (t || hero).name;
}

function hasUsableAbility(hero) {
    return abilityUsable(hero).ok;  // stesse condizioni del gioco (es. Dente per dente solo dopo essere stati colpiti)
}

function simAliveMaxBy(members, fn) {
    const alive = members.filter(h => h.hp > 0);
    if (alive.length === 0) return null;
    return alive.reduce((best, h) => fn(h) > fn(best) ? h : best, alive[0]);
}

function simAliveMinBy(members, fn) {
    const alive = members.filter(h => h.hp > 0);
    if (alive.length === 0) return null;
    return alive.reduce((best, h) => fn(h) < fn(best) ? h : best, alive[0]);
}

function simBestFaithIntHero(alive) {
    return alive.reduce((best, h) => Math.max(h.fth || 0, h.int || 0) > Math.max(best.fth || 0, best.int || 0) ? h : best, alive[0]);
}

// Valore di un oggetto per il simulatore, pesato su quanto conta in combattimento: il danno vale più
// di tutto (ogni colpo a segno toglie di più), poi la Forza (si colpisce più spesso), poi l'armatura.
// Gli effetti speciali si stimano da soli (simSpecialsValue). I consumabili valgono poco ma non zero.
// Pesi in SIM_ITEM_WEIGHTS (js/regole.js).
function simItemValue(item) {
    if (item.type && item.type.startsWith('consumable')) return 0.5;
    // Bonus in scala con Fede/Intelligenza (vedi refreshScaledBonuses): stimati per un eroe con 3 punti
    const scaled = (item.scaling || []).reduce((sum, sc) => sum + (SIM_ITEM_WEIGHTS[sc.stat] || 1) *
        Math.min(sc.max != null ? sc.max : 99, Math.floor(3 / Math.max(1, sc.every || 1))), 0);
    const stats = Object.entries(SIM_ITEM_WEIGHTS).reduce((sum, [k, w]) => sum + w * (Number(item[k]) || 0), 0);
    return stats - 2 * (item.att_penalty || 0) + scaled + simSpecialsValue(itemSpecials(item));
}

/* ---------- Valore automatico degli effetti speciali ----------
   Gli effetti che agiscono in scontro si misurano giocando: una compagnia di prova (due eroi uguali) affronta
   un nemico di prova SIM_SPECIAL_DUELS volte con l'effetto e senza, con gli stessi dadi (generatore con seme),
   e la differenza si confronta con quella di +1 Danno. Così un oggetto nuovo creato dall'editor ha un valore
   senza scrivere pesi a mano. Gli effetti fuori dallo scontro (riposo, mercante, prove, bottino) usano
   SIM_SPECIAL_WEIGHTS di js/regole.js. Risultati in memoria per tutta la pagina. */
const SIM_SPECIAL_DUELS = 200;
const simSpecialCache = new Map();
const SIM_SPECIAL_IN_COMBAT = [...SPECIALI_SCONTRO, 'tiro_fallito', 'colpito', 'colpo_mortale'];
const SIM_ROLLS_IN_COMBAT = ['tiro', 'tiro_scontro', 'attacco', 'difesa', 'aiuto'];

function simSpecialsValue(list) {
    if (!list || !list.length) return 0;
    const key = JSON.stringify(list);
    if (simSpecialCache.has(key)) return simSpecialCache.get(key);
    const inCombat = list.filter(s => SIM_SPECIAL_IN_COMBAT.includes(s.quando) || (s.fai === 'bonus_tiro' && SIM_ROLLS_IN_COMBAT.includes(s.quando)));
    let value = inCombat.length ? simDuelValue(inCombat) : 0;
    list.forEach(s => {
        const n = Math.max(1, Math.abs(s.val || 0)) * (s.prob ? s.prob / 100 : 1);
        if (s.fai === 'bonus_tiro' && ['tiro', 'prova', 'contrattazione', 'preghiera', 'capitano'].includes(s.quando)) value += SIM_SPECIAL_WEIGHTS.bonus_tiro_fuori * n;
        else if (s.quando === 'fine_scontro') value += (s.fai === 'monete' ? SIM_SPECIAL_WEIGHTS.monete : SIM_SPECIAL_WEIGHTS.bonus_cura) * n;
        else if (!inCombat.includes(s)) value += (SIM_SPECIAL_WEIGHTS[s.fai] || 0.5) * n;
    });
    simSpecialCache.set(key, value);
    return value;
}

// Punteggio medio della compagnia di prova; "special" = effetti sull'oggetto del primo eroe, "extraDmg" = Danno in più
function simDuelScore(special, extraDmg) {
    const saved = { rng: getRngState(), party: stato.party, activeEnemy: stato.activeEnemy, combatRound: stato.combatRound,
        helpBonus: stato.helpBonus, helpDmgBonus: stato.helpDmgBonus, unlockedRelics: stato.unlockedRelics, activeCurses: stato.activeCurses,
        stsMapNodes: stato.stsMapNodes, currentNodeId: stato.currentNodeId, expeditionStats: stato.expeditionStats, partyCoins: stato.partyCoins };
    setRngSeed(12345);  // stessi dadi per le prove con e senza l'effetto
    let total = 0;
    try {
        Object.assign(stato, { unlockedRelics: [], activeCurses: [], expeditionStats: {}, partyCoins: 0, currentNodeId: 'a',
            stsMapNodes: [{ id: 'a', level: 0, type: 'combat', next: ['b'] }, { id: 'b', level: 2, type: 'combat', next: [] }] });
        for (let n = 0; n < SIM_SPECIAL_DUELS; n++) {
            stato.stsMapNodes[0].type = n % 4 === 0 ? 'elite' : 'combat';  // un quarto degli scontri contro un elite
            const hero = name => ({ name, hp: 6, maxHp: 6, str: 2, dmg: 2, base_armor: 1, current_armor: 1, att_bonus: 0, items: [] });
            stato.party = [hero('A'), hero('B')];
            if (special) stato.party[0].items.push({ name: 'Prova', speciali: special });
            stato.party[0].dmg += extraDmg;
            stato.activeEnemy = { name: 'Nemico', hp: 16, maxHp: 16, ca: 5, att: 5, dmg: 2 };
            stato.combatRound = 0; stato.helpBonus = 0; stato.helpDmgBonus = 0;
            startCombatSpecials();
            const enemy = stato.activeEnemy;
            let rounds = 0;
            while (enemy.hp > 0 && stato.party.some(h => h.hp > 0) && rounds++ < 20) {
                stato.combatRound++;
                expireTempBuffs();
                applyRegen();
                stato.party.forEach(h => { h.hasActed = false; });
                startRoundSpecials();
                stato.party.forEach((h, i) => {
                    if (h.hp <= 0 || enemy.hp <= 0) return;
                    // Le scelte dell'Esperto (attacca, difende chi cadrebbe, aiuta chi colpisce meglio)
                    simExecuteCombatAction(h, simExpertAction(h, enemy, { remaining: stato.party.slice(i + 1) }));
                    h.hasActed = true;
                });
                if (enemy.hp <= 0) break;
                if (enemy.isStunned) { enemy.isStunned = false; continue; }
                const alive = stato.party.filter(h => h.hp > 0);
                resolveEnemyTurn(enemy, alive[Math.floor(rng() * alive.length)]);
            }
            const hpLeft = stato.party.reduce((sum, h) => sum + Math.max(0, h.hp), 0);
            total += (enemy.hp <= 0 ? 10 + hpLeft : 4 * (1 - Math.max(0, enemy.hp) / enemy.maxHp)) - 0.1 * rounds;
            expireTempBuffs(true);
        }
    } finally {
        setRngState(saved.rng);
        delete saved.rng;
        Object.assign(stato, saved);
    }
    return total / SIM_SPECIAL_DUELS;
}

// Valore degli effetti in scontro, nella stessa scala dei pesi delle statistiche (+1 Danno = SIM_ITEM_WEIGHTS.dmg).
// Un effetto "una volta per capitolo" vale per uno scontro su quattro, all'incirca.
function simDuelValue(list) {
    if (!simSpecialCache.has('__base')) {
        simSpecialCache.set('__base', simDuelScore(null, 0));
        simSpecialCache.set('__dmg', simDuelScore(null, 1));
    }
    const base = simSpecialCache.get('__base');
    const unit = Math.max(0.01, simSpecialCache.get('__dmg') - base);
    const perChapter = list.every(s => s.limite === 'capitolo') ? 0.25 : 1;
    // Minimo per effetto: quelli che l'Esperto usa poco nei duelli (spine di chi difende, Attacco tolto al nemico)
    // valgono poco ma non zero, sotto la soglia di "oggetto utile" del bottino (0,5)
    return Math.max(0.2 * list.length, (simDuelScore(list, 0) - base) / unit * SIM_ITEM_WEIGHTS.dmg * perChapter);
}

// Quanto migliora l'eroe con questo oggetto: valore dell'oggetto meno quello che dovrebbe scartare
// (zaino pieno). Le armi vanno di preferenza a chi colpisce meglio (più Forza).
function simItemGain(item, hero) {
    if (stackableSlot(hero, item)) return simItemValue(item);
    let gain = simItemValue(item);
    if (hero.items.length >= BACKPACK_SIZE) gain -= Math.min(...hero.items.map(simItemValue));
    if (item.dmg || item.str) gain += 0.1 * (hero.str || 0);
    return gain;
}

// L'eroe vivo che guadagna di più dall'oggetto, con il guadagno
function simBestRecipient(item) {
    let best = null, bestGain = 0;
    stato.party.filter(h => h.hp > 0 && heroCanUseItem(h, item)).forEach(h => {
        const g = simItemGain(item, h);
        if (g > bestGain) { best = h; bestGain = g; }
    });
    return { hero: best, gain: bestGain };
}

function simChooseDiscard(hero) {
    let worstIdx = 0, worstVal = Infinity;
    hero.items.forEach((it, idx) => {
        const v = simItemValue(it);
        if (v < worstVal) { worstVal = v; worstIdx = idx; }
    });
    return worstIdx;
}

// Assegna un oggetto a un eroe; se lo zaino supera 3 oggetti, scarta quello di minor valore (uguale per tutti i profili).
function simAssignItem(item, hero) {
    // Chi non può portarlo (Lista dei torti: niente armature) lo passa a un altro in piedi, se c'è
    if (hero && !heroCanUseItem(hero, item)) hero = stato.party.find(h => h.hp > 0 && heroCanUseItem(h, item));
    if (!hero) return;
    const pila = stackableSlot(hero, item);  // consumabile uguale con posto nella pila: nessuno slot in più
    if (pila) { pila.qty = (pila.qty || 1) + 1; return; }
    const newItem = JSON.parse(JSON.stringify(item));
    hero.items.push(newItem);
    applyItemEffects(newItem, hero);
    if (hero.items.length > BACKPACK_SIZE) {
        const idx = simChooseDiscard(hero);
        const removed = hero.items[idx];
        revertItemEffects(removed, hero);
        hero.items.splice(idx, 1);
    }
}

// Consumabili da combattimento, usati come nel gioco (non consumano l'azione):
// danno al nemico se è un elite o un boss o se basta a finirlo; potenziamenti nel primo round
// degli scontri con elite e boss (l'armatura immediata anche quando l'eroe è sotto metà vita).
function simUseCombatConsumables(hero) {
    const enemy = stato.activeEnemy;
    const big = currentEnemyIsEliteOrBoss();
    for (let idx = hero.items.length - 1; idx >= 0; idx--) {
        const item = hero.items[idx];
        if (!item || enemy.hp <= 0) continue;
        if (item.type === 'consumable_damage') {
            if (big || enemy.hp <= (item.dmg_val || 0)) { enemy.hp -= item.dmg_val || 0; consumeOne(hero, idx); }
        } else if (item.type === 'consumable_buff') {
            const armorNow = item.buff_stat === 'current_armor';
            const regenNow = item.buff_stat === 'regen' && hero.hp < hero.maxHp;  // rigenerazione: appena l'eroe è ferito
            if ((big && stato.combatRound === 1) || (armorNow && hero.hp / hero.maxHp < 0.5) || regenNow) { applyTempBuff(hero, item); consumeOne(hero, idx); }
        }
    }
}

function simUseConsumable(hero, itemIdx, target) {
    const item = hero.items[itemIdx];
    if (!item || !item.type || !item.type.startsWith('consumable')) return false;
    if (item.type === 'consumable_heal') healHero(target, potionHealAmount(hero, item));
    else if (item.type === 'consumable_full') healHero(target, Infinity);
    else return false;  // danno e potenziamenti: il simulatore non li usa (restano nello zaino)
    consumeOne(hero, itemIdx);
    return true;
}

/* ==========================================================================
   PROFILI COMPORTAMENTALI
   ========================================================================== */
const SIM_PROFILES = {
    aggressivo: {
        key: 'aggressivo', label: 'Aggressivo',
        description: 'Cerca scontri ed élite appena può ed evita il riposo. Attacca sempre e usa l\'abilità attiva alla prima occasione. In combattimento mette in prima linea l\'eroe con più armatura e cura solo chi scende sotto il 25% HP. Dal mercante compra solo oggetti offensivi o consumabili, spendendo tutti gli Scudi disponibili.',
        nodePriority: ['elite', 'combat', 'treasure', 'challenge', 'merchant', 'rest'],
        consumableThreshold: 0.25,
        combatAction: (hero) => hasUsableAbility(hero) ? 'ability' : 'attack',
        monsterTarget: (members) => simAliveMaxBy(members, h => h.current_armor),
        attemptChallenge: () => true,
        lootRecipient: (members) => simAliveMaxBy(members, h => (h.str || 0) + (h.dmg || 0)),
        merchantFilter: item => !!(item.str || item.dmg || (item.type && item.type.startsWith('consumable'))),
        merchantReserve: 0,
        captainHero: simBestFaithIntHero,
        captainActionType: hero => {
            const useFaith = (hero.fth || 0) >= (hero.int || 0);
            const stat = useFaith ? (hero.fth || 0) : (hero.int || 0);
            return stat > 0 ? (useFaith ? 'faith' : 'int') : 'force';
        }
    },
    tesori: {
        key: 'tesori', label: 'Cercatore di Tesori',
        description: 'Ai bivi sceglie tesori e mercanti ed evita scontri quando può. Tenta una sfida solo se la probabilità di successo è almeno del 33%. Dal mercante compra tutto ciò che può permettersi, senza filtri, e distribuisce gli oggetti trovati all\'eroe con meno equipaggiamento per variare la squadra.',
        nodePriority: ['treasure', 'merchant', 'challenge', 'rest', 'combat', 'elite'],
        consumableThreshold: 0.5,
        combatAction: (hero) => hasUsableAbility(hero) ? 'ability' : 'attack',
        monsterTarget: (members) => simAliveMaxBy(members, h => h.hp),
        attemptChallenge: (chance) => chance >= 0.33,
        lootRecipient: (members) => simAliveMinBy(members, h => h.items.length),
        merchantFilter: null,
        merchantReserve: 0,
        captainHero: simBestFaithIntHero,
        captainActionType: hero => {
            const useFaith = (hero.fth || 0) >= (hero.int || 0);
            const stat = useFaith ? (hero.fth || 0) : (hero.int || 0);
            return stat > 0 ? (useFaith ? 'faith' : 'int') : 'force';
        }
    },
    prudente: {
        key: 'prudente', label: 'Prudente',
        description: 'Ai bivi predilige riposo e mercante e tenta una sfida solo con almeno il 67% di probabilità di successo. In combattimento si difende quando un eroe scende sotto il 50% HP, cura in anticipo e mette in prima linea chi ha più armatura e HP insieme. Dal mercante compra solo armature e consumabili, tenendo sempre una riserva di Scudi.',
        nodePriority: ['rest', 'merchant', 'challenge', 'treasure', 'combat', 'elite'],
        consumableThreshold: 0.5,
        combatAction: (hero) => hasUsableAbility(hero) ? 'ability' : ((hero.hp / hero.maxHp) < 0.5 ? 'defend' : 'attack'),
        monsterTarget: (members) => simAliveMaxBy(members, h => h.current_armor + h.hp),
        attemptChallenge: (chance) => chance >= 0.67,
        lootRecipient: (members) => simAliveMinBy(members, h => h.hp / h.maxHp),
        merchantFilter: item => !!(item.armor || item.def_bonus || (item.type && item.type.startsWith('consumable'))),
        merchantReserve: 5,
        captainHero: simBestFaithIntHero,
        captainActionType: hero => (hero.fth || 0) >= (hero.int || 0) ? 'faith' : 'int'
    },
    bilanciato: {
        key: 'bilanciato', label: 'Bilanciato',
        description: 'Ai bivi sceglie il tipo di nodo meno visitato finora, per esplorare un po\' di tutto, e tenta sempre le sfide. In combattimento alterna attacco e aiuto a seconda del turno e fa ruotare a rotazione tra tutti gli eroi vivi chi incassa i colpi nemici, chi riceve il bottino e chi riceve gli acquisti dal mercante.',
        nodePriority: [], // sceglie il tipo di nodo meno visitato finora (vedi simChooseNextNode)
        consumableThreshold: 0.25,
        combatAction: (hero, enemy, ctx) => hasUsableAbility(hero)
            ? 'ability'
            : (ctx.isLastActor ? 'attack' : (ctx.combatRound % 2 === 0 ? 'help' : 'attack')),
        monsterTarget: (members, runCtx) => {
            const alive = members.filter(h => h.hp > 0);
            if (alive.length === 0) return null;
            const t = alive[runCtx.monsterTargetRotationIdx % alive.length];
            runCtx.monsterTargetRotationIdx++;
            return t;
        },
        attemptChallenge: () => true,
        lootRecipient: (members, runCtx) => {
            const alive = members.filter(h => h.hp > 0);
            if (alive.length === 0) return null;
            const t = alive[runCtx.lootRotationIdx % alive.length];
            runCtx.lootRotationIdx++;
            return t;
        },
        merchantFilter: null,
        merchantReserve: 2,
        captainHero: simBestFaithIntHero,
        captainActionType: hero => (hero.fth || 0) >= (hero.int || 0) ? 'faith' : 'int'
    },
    devoto: {
        key: 'devoto', label: 'Devoto',
        description: 'Ai bivi cerca prima le sfide (per le reliquie) e poi il riposo, evitando gli scontri quando può scegliere. In combattimento un solo eroe "campione" (il più forte in Forza+Danno) attacca, mentre tutti gli altri lo assistono con Aiuta per aumentarne le probabilità di colpire; il campione viene protetto lasciando incassare i colpi a un compagno. Dal mercante compra oggetti di Fede e consumabili.',
        nodePriority: ['challenge', 'rest', 'merchant', 'treasure', 'combat', 'elite'],
        consumableThreshold: 0.5,
        turnOrder: (alive) => {
            const champion = simAliveMaxBy(alive, h => (h.str || 0) + (h.dmg || 0));
            return champion ? [...alive.filter(h => h !== champion), champion] : alive;
        },
        combatAction: (hero, enemy, ctx) => hasUsableAbility(hero) ? 'ability' : (hero === ctx.champion ? 'attack' : 'help'),
        monsterTarget: (members) => {
            const alive = members.filter(h => h.hp > 0);
            if (alive.length === 0) return null;
            const champion = simAliveMaxBy(alive, h => (h.str || 0) + (h.dmg || 0));
            const others = alive.filter(h => h !== champion);
            return others.length ? simAliveMaxBy(others, h => h.hp) : champion;
        },
        attemptChallenge: () => true,
        lootRecipient: (members) => simAliveMaxBy(members, h => (h.str || 0) + (h.dmg || 0)),
        merchantFilter: item => !!(item.fth || (item.type && item.type.startsWith('consumable'))),
        merchantReserve: 0,
        captainHero: simBestFaithIntHero,
        captainActionType: hero => (hero.fth || 0) >= (hero.int || 0) ? 'faith' : 'int'
    },
    codardo: {
        key: 'codardo', label: 'Codardo',
        description: 'Ai bivi predilige riposo e tesori ed evita scontri e sfide quando può: tenta una sfida solo con almeno l\'85% di probabilità di successo. In combattimento attacca solo se l\'eroe è a piena salute (75%+ HP), altrimenti si difende sempre, e cura ai primi segni di ferita. Mette in prima linea l\'eroe con più HP massimi e vende dal mercante ogni oggetto puramente offensivo, comprando solo armature e tenendo una grossa riserva di Scudi.',
        nodePriority: ['rest', 'treasure', 'merchant', 'challenge', 'combat', 'elite'],
        consumableThreshold: 0.75,
        combatAction: (hero) => hasUsableAbility(hero) ? 'ability' : ((hero.hp / hero.maxHp) >= 0.75 ? 'attack' : 'defend'),
        monsterTarget: (members) => simAliveMaxBy(members, h => h.maxHp),
        attemptChallenge: (chance) => chance >= 0.85,
        lootRecipient: (members) => simAliveMaxBy(members, h => h.maxHp),
        merchantFilter: item => !!(item.armor || item.def_bonus || (item.type && item.type.startsWith('consumable'))),
        merchantReserve: 8,
        sellFilter: item => !item.armor && !item.def_bonus && !(item.type && item.type.startsWith('consumable')),
        captainHero: simBestFaithIntHero,
        captainActionType: hero => (hero.fth || 0) >= (hero.int || 0) ? 'faith' : 'int'
    },
    collezionista: {
        key: 'collezionista', label: 'Collezionista',
        description: 'Ai bivi cerca prima sfide e tesori, poi mercanti, per accumulare il più possibile: tenta ogni sfida indipendentemente dalla probabilità di riuscita, anche se minima. In combattimento attacca normalmente ma mette in prima linea l\'eroe già più "carico" di equipaggiamento, per proteggere chi ne ha meno. Distribuisce bottino e acquisti sempre all\'eroe con meno oggetti, per equipaggiare l\'intera compagnia.',
        nodePriority: ['challenge', 'treasure', 'merchant', 'combat', 'elite', 'rest'],
        consumableThreshold: 0.5,
        combatAction: (hero) => hasUsableAbility(hero) ? 'ability' : 'attack',
        monsterTarget: (members) => simAliveMaxBy(members, h => h.items.length),
        attemptChallenge: () => true,
        lootRecipient: (members) => simAliveMinBy(members, h => h.items.length),
        merchantFilter: null,
        merchantReserve: 0,
        captainHero: simBestFaithIntHero,
        captainActionType: hero => (hero.fth || 0) >= (hero.int || 0) ? 'faith' : 'int'
    },
    mercenario: {
        key: 'mercenario', label: 'Mercenario',
        description: 'Ai bivi punta su scontri, élite e tesori (fonti dirette di Scudi) ed evita le sfide, che non danno oro e rischiano maledizioni. In combattimento attacca sempre senza mai curare (tiene i consumabili solo per rivenderli) e lascia incassare i colpi al membro meno utile in battaglia. Dal mercante vende subito ogni consumabile raccolto e reinveste tutto l\'oro in nuovo equipaggiamento.',
        nodePriority: ['combat', 'elite', 'treasure', 'merchant', 'rest', 'challenge'],
        consumableThreshold: 0,
        combatAction: (hero) => hasUsableAbility(hero) ? 'ability' : 'attack',
        monsterTarget: (members) => simAliveMinBy(members, h => (h.str || 0) + (h.dmg || 0)),
        attemptChallenge: (chance) => chance >= 0.5,
        lootRecipient: (members) => simAliveMaxBy(members, h => (h.str || 0) + (h.dmg || 0)),
        merchantFilter: null,
        merchantReserve: 0,
        sellFilter: item => !!(item.type && item.type.startsWith('consumable')),
        captainHero: simBestFaithIntHero,
        captainActionType: hero => {
            const useFaith = (hero.fth || 0) >= (hero.int || 0);
            const stat = useFaith ? (hero.fth || 0) : (hero.int || 0);
            return stat > 0 ? (useFaith ? 'faith' : 'int') : 'force';
        }
    }
};

/* ==========================================================================
   PROFILO ESPERTO: un giocatore attento, il metro della difficoltà
   Gli altri profili hanno uno stile (anche sbagliato apposta); l'Esperto gioca come una persona
   che conosce le regole: guarda chi colpirà il nemico, fa difendere chi rischia di cadere, fa
   aiutare chi colpisce peggio a vantaggio di chi colpisce meglio, cura chi cadrebbe al prossimo
   colpo, rialza i caduti con le pozioni che lo permettono, sceglie il bersaglio del nemico che perde
   meno, affronta le prove con l'eroe più adatto, contratta e sceglie la strada guardando un passo avanti.
   ========================================================================== */

// Forza in attacco di un eroe: probabilità di colpire per danno
function simHeroPower(hero) {
    return simAttackChance(hero) * (hero.dmg || 0);
}

// Probabilità di colpire il nemico attuale (extra = bonus in più, es. +1 di un Aiuta)
function simAttackChance(hero, extra = 0) {
    const enemy = stato.activeEnemy;
    if (!enemy) return 0;
    const bonus = (hero.str || 0) + firstActorBonus(hero) + stato.helpBonus + attackMod(hero) + relicCombatBonus(hero).att + extra;
    return rollChance(enemy.ca - bonus, false);
}

// Probabilità di riuscire a Difendere o Aiutare (stesso tiro contro l'Attacco del nemico)
function simDefendChance(hero, help = false) {
    const enemy = stato.activeEnemy;
    if (!enemy) return 0;
    const bonus = (hero.str || 0) + firstActorBonus(hero) + (help ? (hero.help_bonus_val || 0) : (hero.def_bonus || 0)) + relicDiceBonus(help ? 'aiuto' : 'difesa', hero);
    return rollChance(enemy.att - bonus, false);
}

// Bersaglio scelto dal giocatore per il colpo del nemico: chi perde meno HP senza cadere
// (a parità, chi resta con più HP); se cadrebbero tutti, il meno utile in attacco
function simExpertTarget(alive, dmg) {
    if (!alive.length) return null;
    const loss = h => Math.max(0, dmg - (h.current_armor || 0));
    const survive = alive.filter(h => h.hp > loss(h));
    if (survive.length) {
        return survive.reduce((b, h) => (loss(h) < loss(b) || (loss(h) === loss(b) && h.hp - loss(h) > b.hp - loss(b))) ? h : b);
    }
    return alive.reduce((b, h) => simHeroPower(h) < simHeroPower(b) ? h : b);
}

// Prossimo turno del nemico, senza dadi: chi colpirà e con quanto. Fermo (stordito o in preparazione) = nessuno
function simIncoming() {
    const enemy = stato.activeEnemy;
    const none = { targets: [], dmg: 0, aura: 0, odio: null, odioDmg: 0 };
    if (!enemy || enemy.hp <= 0 || enemy.isStunned) return none;
    const r = enemyTurnRule(enemy);
    if (r.turnoPreparazione && !enemy.charging) return none;
    const perHit = (r.turnoDanno != null ? r.turnoDanno : enemy.dmg) + (hasCurse('presagio_di_morte') ? 1 : 0);
    const dmg = perHit * Math.max(1, r.turnoColpi || 1);
    const mode = r.turnoBersaglio || 'scelto';
    const alive = stato.party.filter(h => h.hp > 0);
    const targets = mode === 'tutti' ? alive
        : mode === 'scelto' ? [simExpertTarget(alive, dmg)].filter(Boolean)
        : mode === 'casuale' ? [] : eliteTargets(mode);
    // Colpo d'Odio: secondo colpo al più robusto fra gli altri (con più bersagli o a caso: il più robusto di tutti)
    const odio = r.turnoColpoOdio ? hatefulTarget(targets.length === 1 ? targets[0] : null) : null;
    return { targets, dmg, aura: r.turnoAura || 0, odio, odioDmg: odio ? r.turnoColpoOdio : 0 };
}

// HP che l'eroe perderebbe al prossimo turno del nemico (stima: l'armatura assorbe una volta)
function simThreat(hero, inc) {
    const raw = (inc.targets.includes(hero) ? inc.dmg : 0) + inc.aura + (inc.odio === hero ? inc.odioDmg : 0);
    return raw > 0 ? Math.max(0, raw - (hero.current_armor || 0)) : 0;
}

function simExpertAction(hero, enemy, ctx) {
    const inc = simIncoming();
    const loss = simThreat(hero, inc);
    const hitDmg = (hero.dmg || 0) + specialHitDamagePreview(hero, enemy) + helpDmgBonus();
    const pHit = simAttackChance(hero);
    // Abilità attiva (una per scontro): l'armatura immediata solo quando serve, le altre subito
    if (hasUsableAbility(hero)) {
        const c = abilityCombat(hero.chosenAbility) || {};
        if (!c.armorGain || loss > 0) return 'ability';
    }
    // Colpo che chiude lo scontro
    if (enemy.hp <= hitDmg && pHit >= 0.5) return 'attack';
    // Chi sta per essere colpito e cadrebbe (o resterebbe a 1 HP) si difende, se il tiro ha senso
    if (loss > 0 && hero.hp - loss <= 1 && simDefendChance(hero) >= 0.34) return 'defend';
    // Aiuta se un compagno che agisce dopo, con +1, rende più del proprio attacco
    const later = (ctx.remaining || []).filter(h => h.hp > 0 && !h.hasActed);
    if (!stato.helpBonus && later.length) {
        const best = later.reduce((b, h) => simHeroPower(h) > simHeroPower(b) ? h : b);
        const pHelp = simDefendChance(hero, true);
        const gain = pHelp * ((simAttackChance(best, 1) - simAttackChance(best)) * (best.dmg || 0)
            + simAttackChance(best, 1) * (hero.helpDmgBonus || 0));
        if (gain > pHit * hitDmg) return 'help';
    }
    return 'attack';
}

// Cure in combattimento: prima i caduti (pozioni che rialzano), poi chi cadrebbe al prossimo colpo
// o è sotto un terzo della vita. Una pozione per turno dell'eroe: come nel gioco non consuma l'azione
function simExpertHeal(hero) {
    const heals = hero.items.map((it, i) => i).filter(i => hero.items[i].type === 'consumable_heal' || hero.items[i].type === 'consumable_full');
    if (!heals.length) return;
    const fallen = stato.party.filter(h => h.hp <= 0);
    const revive = heals.find(i => itemRevives(hero.items[i]));
    if (fallen.length && revive != null) {
        simUseConsumable(hero, revive, fallen.reduce((b, h) => (h.str || 0) + (h.dmg || 0) > (b.str || 0) + (b.dmg || 0) ? h : b));
        return;
    }
    const inc = simIncoming();
    const needy = stato.party.filter(h => h.hp > 0 && h.hp < h.maxHp && (h.hp <= simThreat(h, inc) || h.hp <= h.maxHp / 3))
        .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
    const plain = heals.find(i => !itemRevives(hero.items[i]));
    if (needy.length) simUseConsumable(hero, plain != null ? plain : heals[0], needy[0]);
}

// Probabilità di riuscita di una prova (stato.challengeState già impostato) per un eroe
function simChallengePct(hero) {
    return challengeChanceInfo(challengeModifiers(hero)).pct;
}

// Contrattazione: con l'eroe che ha più Intelligenza, se riesce almeno una volta su due
function simHaggle() {
    const alive = stato.party.filter(h => h.hp > 0);
    if (!alive.length || merchantHaggle !== null) return;
    const cd = haggleCd();
    const hero = alive.reduce((b, h) => (h.int || 0) > (b.int || 0) ? h : b);
    if (rollChance(cd - haggleRollTotal(hero, 0), false) < 0.5) return;
    const roll = rollD6(null, 0, hero);
    const total = haggleRollTotal(hero, roll);
    spendNextRollRelics('contrattazione', hero);
    merchantHaggle = naturalRollSuccess(roll, total, cd) ? 'ok' : 'fail';
}

// Valore di un nodo per la compagnia di adesso: riposo quando è ferita, elite solo quando è in forma,
// mercante con le monete, prove secondo la probabilità di riuscita
function simExpertNodeScore(node) {
    const party = stato.party;
    const hpRatio = party.reduce((s, h) => s + Math.max(0, h.hp), 0) / Math.max(1, party.reduce((s, h) => s + h.maxHp, 0));
    const fallen = party.some(h => h.hp <= 0);
    switch (node.type) {
        case 'rest': return fallen || hpRatio < 0.5 ? 2.5 + 3 * (1 - hpRatio) : 0.6;
        case 'merchant': return (stato.partyCoins >= 25 ? 2 : 0.5) + ((fallen || hpRatio < 0.7) && stato.partyCoins >= 10 ? 1 : 0);
        case 'treasure': return 2.2;
        case 'elite': return !fallen && hpRatio >= 0.75 ? 1.8 : (hpRatio >= 0.55 ? 0.6 : -1);
        case 'combat': return hpRatio >= 0.5 ? 2 : 0.4;   // bottino e monete: gli scontri fanno crescere la compagnia
        case 'challenge': {
            const challenge = challengesData && challengesData[node.challengeId];
            const alive = party.filter(h => h.hp > 0);
            if (!challenge || !alive.length) return 0.5;
            const best = bestChallengeRoad(challenge).pct / 100;
            return 2 * best - 0.5;
        }
        default: return 1;
    }
}

// Strada: il nodo più utile adesso, più metà del migliore che apre dopo
function simExpertChooseNode(available) {
    const score = n => simExpertNodeScore(n) + 0.5 * Math.max(0, ...(n.next || [])
        .map(id => stato.stsMapNodes.find(x => x.id === id)).filter(Boolean).map(simExpertNodeScore));
    return available.reduce((b, n) => score(n) > score(b) ? n : b);
}

SIM_PROFILES.esperto = {
    key: 'esperto', label: 'Esperto',
    description: 'Gioca come una persona attenta: sceglie la strada guardando un passo avanti (riposo quando la compagnia è ferita, elite solo quando è in forma), fa difendere chi sta per essere colpito e cadrebbe, fa aiutare chi colpisce peggio a vantaggio di chi colpisce meglio, manda il colpo del nemico su chi perde meno, cura chi cadrebbe e rialza i caduti, affronta le prove con l\'eroe più adatto se riescono almeno una volta su due, contratta col mercante e contro il capitano usa la Forza, che vince sempre.',
    nodePriority: [],
    chooseNode: simExpertChooseNode,
    consumableThreshold: 0.34,
    combatHeal: simExpertHeal,
    turnOrder: alive => [...alive].sort((a, b) => (b.firstActorStrBonus ? 1 : 0) - (a.firstActorStrBonus ? 1 : 0) || simHeroPower(a) - simHeroPower(b)),
    combatAction: simExpertAction,
    monsterTarget: members => {
        const inc = simIncoming();
        return simExpertTarget(members.filter(h => h.hp > 0), inc.dmg || (stato.activeEnemy ? stato.activeEnemy.dmg : 0));
    },
    challengeHero: alive => alive.reduce((b, h) => simChallengePct(h) > simChallengePct(b) ? h : b),
    attemptChallenge: chance => chance >= 0.5,
    lootRecipient: members => simAliveMaxBy(members, h => (h.str || 0) + (h.dmg || 0)),
    merchantFilter: null,
    merchantReserve: 0,
    haggle: true,
    captainHero: alive => simAliveMaxBy(alive, h => h.hp),
    captainActionType: () => 'force'   // la Forza contro il capitano riesce sempre (lascia a metà vita)
};

/* ==========================================================================
   COSTRUZIONE DEL PARTY DI TEST
   ========================================================================== */
function simBuildHero(campaignData, heroName, abilityIdx, itemIdx) {
    const base = campaignData.heroes.find(h => h.name === heroName);
    const hero = JSON.parse(JSON.stringify(base));
    hero.items = [];
    hero.current_armor = hero.base_armor || 0;
    hero.abilityUsedThisCombat = false;

    const abilities = campaignData.abilities[heroName] || [];
    if (abilityIdx != null && abilities[abilityIdx]) {
        const chosen = abilities[abilityIdx];
        hero.chosenAbility = chosen;
        if (chosen.type === 'passive_stat') {
            if (chosen.stat === 'str') hero.str += chosen.val;
            else if (chosen.stat === 'int') hero.int += chosen.val;
            else if (chosen.stat === 'fth') hero.fth += chosen.val;
            else if (chosen.stat === 'hp') { hero.maxHp += chosen.val; hero.hp += chosen.val; }
        } else if (chosen.effects) {
            applyEffects(chosen.effects, hero);
        }
    }

    // Rune: le prime runeSlots offerte (il simulatore non le scambia al riposo)
    if (heroHasRunes(hero)) {
        hero.equippedRunes = hero.runeOptions.slice(0, hero.runeSlots);
        hero.equippedRunes.forEach(id => applyRune(hero, id, 1));
    }

    if (itemIdx != null && itemIdx >= 0 && campaignData.armory[itemIdx]) {
        const newItem = JSON.parse(JSON.stringify(campaignData.armory[itemIdx]));
        hero.items.push(newItem);
        applyItemEffects(newItem, hero);
    }

    return hero;
}

function simBuildParty(campaignData, heroSelection) {
    stato.party = [];
    heroSelection.forEach(sel => stato.party.push(simBuildHero(campaignData, sel.name, sel.abilityIdx, sel.itemIdx)));
}

/* ==========================================================================
   RISOLUZIONE DEI NODI DI MAPPA (senza DOM)
   ========================================================================== */
function simChooseNextNode(available, profile, runCtx) {
    if (available.length === 1) return available[0];
    if (profile.chooseNode) return profile.chooseNode(available, runCtx);

    if (profile.key === 'bilanciato') {
        let bestCount = Infinity;
        available.forEach(n => { bestCount = Math.min(bestCount, runCtx.visitCounts[n.type] || 0); });
        const candidates = available.filter(n => (runCtx.visitCounts[n.type] || 0) === bestCount);
        return candidates[Math.floor(rng() * candidates.length)];
    }

    const rankOf = n => { const r = profile.nodePriority.indexOf(n.type); return r === -1 ? 999 : r; };
    const bestRank = Math.min(...available.map(rankOf));
    const candidates = available.filter(n => rankOf(n) === bestRank);
    return candidates[Math.floor(rng() * candidates.length)];
}

function simResolveChallengeNode(campaignData, node, profile) {
    const original = campaignData.challenges[node.challengeId];
    if (!original) return { defeat: false, finalVictory: false };
    // Con le strade si sceglie quella con la migliore probabilità di riuscita
    const best = bestChallengeRoad(original);
    const challenge = best.challenge;
    stato.challengeState = challenge; // richiesto da challengeModifiers/challengeRollMode (leggono la globale)

    const alive = stato.party.filter(h => h.hp > 0);
    const hero = profile.challengeHero ? profile.challengeHero(alive)
        : alive.reduce((best, h) => (h[challenge.stat] || 0) > (best[challenge.stat] || 0) ? h : best, alive[0]);
    const chance = challengeChanceInfo(challengeModifiers(hero)).pct / 100;
    const final = (node.next || []).length === 0;
    // La prova finale non si può lasciar perdere
    if (!final && !profile.attemptChallenge(chance, node)) return { defeat: false, finalVictory: false };
    // Il prezzo della strada scelta si paga come nel gioco (challengeChooseRoad), solo se la si affronta
    if (best.i != null && (original.strade[best.i].prezzo || []).length) applyEffects(original.strade[best.i].prezzo);

    // La ricerca a simulazioni (simLookaheadProfile) rimette lo stato com'era: l'eroe si riprende dalla compagnia di adesso
    const res = resolveChallenge(stato.party.find(h => h.name === hero.name) || hero, challenge);
    // Prova finale: riuscita = vittoria, fallimento = sconfitta (come nel gioco)
    if (final) return { defeat: !res.success, finalVictory: res.success };
    return { defeat: false, finalVictory: false };
}

// Vende gli oggetti che il profilo non vuole tenere (profile.sellFilter) prima di comprare.
// Meccanica presente nel gioco reale (scheda "Vendi" del mercante) ma finora usata da nessun profilo.
function simSellSurplusItems(profile) {
    if (!profile.sellFilter) return;
    stato.party.forEach(hero => {
        for (let i = hero.items.length - 1; i >= 0; i--) {
            const item = hero.items[i];
            if (profile.sellFilter(item)) {
                stato.partyCoins += itemSellPrice(item);
                revertItemEffects(item, hero);
                hero.items.splice(i, 1);
            }
        }
    });
}

function simResolveMerchantNode(campaignData, node, profile, runCtx) {
    simSellSurplusItems(profile);
    const stock = generateMerchantStock();
    merchantHaggle = null;
    if (profile.haggle) simHaggle();  // solo l'Esperto contratta
    let stolen = false;  // come nel gioco: con la passiva del ladro il primo oggetto è gratis
    // Medico: rialza i caduti e cura chi ha perso almeno 2 HP (fino a 2 HP a eroe, prima i più gravi),
    // al massimo MEDIC_MAX_HP in tutto, finché le monete bastano senza scendere sotto la riserva del profilo
    const medic = stock.find(e => e.kind === 'medic');
    if (medic) {
        const reserve = profile.merchantReserve || 0;
        let left = MEDIC_MAX_HP;
        stato.party.filter(h => h.hp <= 0 || h.maxHp - h.hp >= 2)
            .sort((a, b) => a.hp - b.hp)
            .forEach(h => {
                const hp = Math.min(2, left, h.maxHp - h.hp, Math.floor((stato.partyCoins - reserve) / medic.price));
                left -= Math.max(0, hp);
                if (hp <= 0) return;
                stato.partyCoins -= hp * medic.price;
                healHero(h, hp);
            });
    }
    // Compra come un giocatore attento: ogni volta l'acquisto che migliora di più la compagnia per moneta
    // spesa (oggetto giusto all'eroe giusto), finché le monete bastano e c'è qualcosa che serve davvero.
    // Il filtro del profilo resta (es. il Prudente guarda solo armature e consumabili).
    const restanti = stock.filter(e => e.kind === 'item' && (!profile.merchantFilter || profile.merchantFilter(e.item)));
    while (restanti.length) {
        const free = !stolen && stato.party.some(h => h.hp > 0 && h.freeFirstMerchantItem);
        let scelta = null;
        restanti.forEach(entry => {
            const price = free ? 0 : merchantPrice(entry.price);  // sconti delle passive (es. Inganno del drago verde)
            if (stato.partyCoins - price < (profile.merchantReserve || 0)) return;
            const { hero, gain } = simBestRecipient(entry.item);
            if (!hero || gain < 0.5) return;
            const resa = gain / Math.max(1, price);
            if (!scelta || resa > scelta.resa) scelta = { entry, hero, price, resa };
        });
        if (!scelta) break;
        if (free) stolen = true;
        stato.partyCoins -= scelta.price;
        simAssignItem(scelta.entry.item, scelta.hero);
        restanti.splice(restanti.indexOf(scelta.entry), 1);
    }
    // Uscita dal mercante, come leaveMerchant nel gioco (es. il Cristallo di Flammaurea di Temistocle)
    fireSpecialsAll('uscita_mercante').items.forEach(d => simAssignItem(d.item, d.hero));
}

// Bottino trovato: all'eroe che ne guadagna di più (come farebbe un giocatore attento); se a nessuno
// serve davvero va comunque a chi indica il profilo, che scarterà l'oggetto peggiore
// Bottino degli scontri: fra LOOT_CHOICES oggetti tiene quello che migliora di più la compagnia
function simPickLootChoice(choices) {
    return choices.reduce((best, item) => simBestRecipient(item).gain > simBestRecipient(best).gain ? item : best, choices[0]);
}

function simGiveLoot(item, profile, runCtx) {
    const { hero, gain } = simBestRecipient(item);
    const recipient = gain >= 0.5 ? hero : profile.lootRecipient(stato.party, runCtx);
    if (recipient) simAssignItem(item, recipient);
}

function simResolveTreasureNode(campaignData, node, profile, runCtx) {
    const offer = generateTreasureOffer();
    stato.partyCoins += offer.coins;
    offer.items.forEach(item => simGiveLoot(item, profile, runCtx));
}

function simResolveVictoryLoot(profile, runCtx) {
    const node = stato.stsMapNodes.find(n => n.id === stato.currentNodeId);
    const isElite = currentEnemyIsEliteOrBoss();  // come nel gioco: anche il boss dell'ultimo livello
    let coins = scaledCoins([3, 5, 7, 9, 12], isElite);
    if (hasCurse('15_scudi_di_ricompensa')) coins = Math.floor(coins * 0.85);
    stato.partyCoins += coins;

    combatVictorySpecials();  // come triggerLoot: cure e Scudi degli effetti "fine_scontro"

    stato.expeditionStats.combatsWon++;
    stato.expeditionStats.itemsFound++;
    const choices = pickLootChoices(isElite);
    if (choices.length) simGiveLoot(simPickLootChoice(choices), profile, runCtx);
    if (isElite) stato.expeditionStats.elitesWon = (stato.expeditionStats.elitesWon || 0) + 1;
}

function simResolveCaptainNode(profile) {
    const alive = stato.party.filter(h => h.hp > 0);
    if (alive.length === 0) return;
    const hero = profile.captainHero(alive);
    const type = profile.captainActionType(hero);
    return resolveCaptainAction(hero, type).success !== false;  // tiro fallito = sconfitta
}

function simExecuteCombatAction(hero, action) {
    if (!combatActionAllowed(hero, action).ok) action = 'attack';  // in furia si può solo attaccare
    if (action === 'ability' && hasUsableAbility(hero)) {
        if ((abilityCombat(hero.chosenAbility) || {}).lancia) hero.throwIdx = simThrowChoice(hero);
        if (abilityNeedsTarget(hero.chosenAbility)) hero.potionTarget = simPotionTarget(hero);
        resolveAbility(hero, stato.activeEnemy);
    }
    else if (action === 'defend') resolveDefend(hero, stato.activeEnemy);
    else if (action === 'help') resolveHelp(hero, stato.activeEnemy);
    else resolveAttack(hero, stato.activeEnemy);
}

function simRunCombat(enemyData, profile, runCtx) {
    stato.party.forEach(refreshScaledBonuses);  // Fede/Int possono essere cambiate da reliquie, maledizioni o scarti
    stato.activeEnemy = JSON.parse(JSON.stringify(enemyData));
    stato.activeEnemy.isStunned = false;
    stato.helpBonus = 0;
    stato.helpDmgBonus = 0;
    stato.combatRound = 0;
    expireTempBuffs(true);
    stato.party.forEach(h => {
        if (h.hp > 0) { h.current_armor = h.base_armor; h.abilityUsedThisCombat = false; }
        else h.current_armor = 0;
        delete h.lastHitRound;
        delete h.lastHitDamage;
        delete h.stunnedRounds;
    });
    applyCombatBlessings();
    startCombatSpecials();  // come startCombat: effetti speciali di inizio scontro (Calma del Margine, Corno...)

    let rounds = 0;
    while (rounds++ < SIM_MAX_COMBAT_ROUNDS) {
        stato.combatRound++;
        stato.helpDmgBonus = 0;
        expireTempBuffs();
        applyPendingBuffs();
        applyRegen();
        stato.party.forEach(h => { h.hasActed = false; });  // come startHeroesTurnCycle: anche i caduti (Libertas in furor)
        startRoundSpecials();
        checkEnemyRoundPhases(stato.activeEnemy);
        if (stato.party.every(h => h.hp <= 0)) return { defeat: true };
        applyHeroStuns();
        const alive = stato.party.filter(h => h.hp > 0);
        // Nemico ucciso dal veleno a inizio round (veleno_nemico): nessuno agisce, si passa alla vittoria
        const order = stato.activeEnemy.hp <= 0 ? [] : profile.turnOrder ? profile.turnOrder(alive) : alive;
        const champion = simAliveMaxBy(alive, h => (h.str || 0) + (h.dmg || 0));

        for (let i = 0; i < order.length; i++) {
            const hero = order[i];
            if (hero.hp <= 0 || hero.hasActed) continue;

            // Uso proattivo di un consumabile sul membro più ferito, secondo la soglia del profilo
            const consumableIdx = hero.items.findIndex(it => it.type === 'consumable_heal' || it.type === 'consumable_full');
            if (profile.combatHeal) profile.combatHeal(hero);
            else if (consumableIdx > -1) {
                const weakest = simAliveMinBy(stato.party, h => h.hp / h.maxHp);
                // Come nel gioco: usare un oggetto non consuma l'azione, l'eroe poi agisce lo stesso
                if (weakest && (weakest.hp / weakest.maxHp) <= profile.consumableThreshold) {
                    simUseConsumable(hero, consumableIdx, weakest);
                }
            }

            simUseCombatConsumables(hero);
            if (stato.activeEnemy.hp <= 0) break;
            checkEnemyPhases(stato.activeEnemy, hero);
            if (stato.party.every(h => h.hp <= 0)) return { defeat: true };

            const remaining = order.slice(i + 1).filter(h => h.hp > 0 && !h.hasActed);
            const action = profile.combatAction(hero, stato.activeEnemy, { combatRound: stato.combatRound, isLastActor: remaining.length === 0, champion, remaining });
            simExecuteCombatAction(hero, action);
            hero.hasActed = true;
            if (stato.activeEnemy.hp <= 0) break;
            checkEnemyPhases(stato.activeEnemy, hero);
            if (stato.party.every(h => h.hp <= 0)) return { defeat: true };
        }

        if (stato.activeEnemy.hp <= 0) {
            expireTempBuffs(true);
            simResolveVictoryLoot(profile, runCtx);
            return { defeat: false };
        }

        if (stato.activeEnemy.isStunned) {
            stato.activeEnemy.isStunned = false; // salta il turno, poi si riprende
            stato.activeEnemy.charging = false;
        } else {
            const target = profile.monsterTarget(stato.party, runCtx);
            resolveEnemyTurn(stato.activeEnemy, target);
            if (stato.party.every(h => h.hp <= 0)) return { defeat: true };
            if (stato.activeEnemy.hp <= 0) {  // caduto sulle spine (Scudo a Spina di Kranen)
                expireTempBuffs(true);
                simResolveVictoryLoot(profile, runCtx);
                return { defeat: false };
            }
        }
    }
    return { defeat: true }; // stallo oltre il limite di round: conta come sconfitta per non falsare il report
}

// Preghiera al riposo: prega l'eroe con più Fede; tra le benedizioni pescate tiene la prima utile in quest'ordine
const SIM_BLESSING_ORDER = ['furia_sacra', 'fede_incrollabile', 'abbondanza', 'purificazione', 'scudo_della_fede', 'lama_consacrata', 'mano_guidata', 'veglia'];
function simPray() {
    const praying = simAliveMaxBy(stato.party, h => h.fth || 0);
    if (!praying) return;
    const res = prayerRoll(praying);
    if (!res.success) return;
    const choices = pickBlessings(res.major, praying);
    // Le benedizioni nuove (create dall'editor) dopo quelle conosciute
    const b = SIM_BLESSING_ORDER.map(id => choices.find(c => c.id === id)).find(Boolean) || choices[0];
    if (!b) return;
    const alive = stato.party.filter(h => h.hp > 0);
    const offensive = (b.buffs || [b]).some(x => x.buff_stat === 'dmg' || x.buff_stat === 'att_bonus');
    const hero = b.effetto === 'fede' ? praying
        : offensive || b.effetto === 'dono' ? simAliveMaxBy(alive, h => (h.str || 0) + (h.dmg || 0))
        : simAliveMinBy(alive, h => h.hp + (h.current_armor || 0));
    applyBlessing(b, hero);
}

function simResolveNode(campaignData, node, profile, runCtx) {
    stato.currentNodeId = node.id;
    runCtx.visitCounts[node.type] = (runCtx.visitCounts[node.type] || 0) + 1;

    if (node.type === 'combat' || node.type === 'elite') {
        const outcome = simRunCombat(campaignData.enemies[node.enemy], profile, runCtx);
        return { defeat: !!outcome.defeat, finalVictory: false };
    }
    if (node.type === 'challenge') return simResolveChallengeNode(campaignData, node, profile);
    if (node.type === 'rest') { resolveRest(); simPray(); return { defeat: false, finalVictory: false }; }
    if (node.type === 'merchant') { simResolveMerchantNode(campaignData, node, profile, runCtx); return { defeat: false, finalVictory: false }; }
    if (node.type === 'treasure') { simResolveTreasureNode(campaignData, node, profile, runCtx); return { defeat: false, finalVictory: false }; }
    if (node.type === 'story') return { defeat: false, finalVictory: false };  // solo racconto
    if (node.type === 'captain') { const won = simResolveCaptainNode(profile); return { defeat: !won, finalVictory: won }; }
    return { defeat: false, finalVictory: false };
}

// Stesso avanzamento di advanceNode() in game.js: chiude il nodo, attiva i successivi. True se la mappa finisce qui.
function simAdvance(node) {
    node.done = true;
    node.active = false;
    stato.stsMapNodes.forEach(n => { n.active = false; });
    if (node.next.length === 0) return true;
    node.next.forEach(id => {
        const n = stato.stsMapNodes.find(x => x.id === id);
        if (n) n.active = true;
    });
    return false;
}

function simCollectResult(victory, lastNode, campaignData) {
    const doneLevels = stato.stsMapNodes.filter(n => n.done).map(n => n.level);
    const levelReached = doneLevels.length ? Math.max(...doneLevels) + 1 : 0;
    const totalLevels = stato.stsMapNodes.length ? Math.max(...stato.stsMapNodes.map(n => n.level)) + 1 : 0;
    let deathCause = null;
    if (!victory && lastNode) {
        deathCause = (lastNode.type === 'combat' || lastNode.type === 'elite')
            ? (campaignData.enemies[lastNode.enemy] ? campaignData.enemies[lastNode.enemy].name : lastNode.title)
            : lastNode.title;
    }
    return {
        victory,
        levelReached,
        totalLevels,
        combatsWon: stato.expeditionStats.combatsWon,
        challengesPassed: stato.expeditionStats.challengesPassed,
        challengesFailed: stato.expeditionStats.challengesFailed,
        coins: stato.partyCoins,
        relicsFound: stato.unlockedRelics.map(r => r.name),
        cursesSuffered: stato.activeCurses.length,
        survivors: stato.party.filter(h => h.hp > 0).length,
        partySize: stato.party.length,
        deathCause
    };
}

/* ==========================================================================
   UNA RUN COMPLETA
   ========================================================================== */
function simRunOne(campaignData, heroSelection, profile) {
    // Campagna procedurale: ogni partita su una mappa nuova, come nel gioco
    if (campaignData.campaign && campaignData.campaign.procedurale) campaignData = simCampaignData(campaignData.campaign.id);
    simBuildParty(campaignData, heroSelection);
    stato.partyCoins = 0;
    stato.unlockedRelics = [];
    stato.activeCurses = [];
    stato.stsMapNodes = JSON.parse(JSON.stringify(campaignData.mapNodes));
    stato.currentNodeId = null;
    enemies = campaignData.enemies;
    challengesData = campaignData.challenges;
    restsData = campaignData.rests;
    merchantsData = campaignData.merchants;
    treasuresData = campaignData.treasures;
    gameItems = campaignData.gameItems;
    stato.currentCampaign = campaignData.campaign;
    stato.combatRound = 0;
    stato.helpBonus = 0;
    stato.helpDmgBonus = 0;
    stato.expeditionStats = newExpeditionStats();

    simRunCampaign = campaignData;

    const runCtx = { visitCounts: {}, lootRotationIdx: 0, monsterTargetRotationIdx: 0 };
    return simPlayFrom(campaignData, profile, runCtx);
}

// Gioca dalla situazione attuale fino alla fine. first = { nodeId, profile }: il primo nodo è già deciso
// (e si risolve con quel profilo); serve alla ricerca a simulazioni per provare una scelta
function simPlayFrom(campaignData, profile, runCtx, first = null) {
    let visits = 0;
    while (visits++ < SIM_MAX_NODE_VISITS) {
        let node, nodeProfile = profile;
        if (first) {
            node = stato.stsMapNodes.find(n => n.id === first.nodeId);
            nodeProfile = first.profile || profile;
            first = null;
        } else {
            const available = stato.stsMapNodes.filter(n => n.active && !n.done);
            if (available.length === 0) return simCollectResult(false, null, campaignData);
            node = simChooseNextNode(available, profile, runCtx);
        }
        const outcome = simResolveNode(campaignData, node, nodeProfile, runCtx);
        if (outcome.defeat) return simCollectResult(false, node, campaignData);
        if (outcome.finalVictory) return simCollectResult(true, node, campaignData);

        const isEnd = simAdvance(node);
        if (isEnd) return simCollectResult(true, node, campaignData);
    }
    return simCollectResult(false, null, campaignData); // difesa: non dovrebbe accadere con dati di mappa validi
}

/* ==========================================================================
   RICERCA A SIMULAZIONI (Monte Carlo): un giocatore quasi ottimo
   A ogni scelta importante (strada ai bivi, prova sì o no) prova ogni possibilità giocando
   "rollouts" partite fino alla fine con il profilo di base, poi tiene quella che vince più spesso.
   È lenta (ogni partita ne contiene centinaia): si usa da tools/difficolta.mjs, non nei test.
   Dà un limite alto onesto: se anche lei vince poco, la campagna è davvero difficile.
   ========================================================================== */
let simRunCampaign = null;  // dati della campagna della partita in corso (le prove giocano sulla stessa mappa)

// Fotografia della partita (stato e contatori del profilo), da rimettere dopo ogni prova
function simSnapshot(runCtx) {
    const p = stato.party;
    return JSON.stringify({
        party: p, partyFlags: { lootExtraChoices: p.lootExtraChoices, specialUses: p.specialUses },
        partyCoins: stato.partyCoins, unlockedRelics: stato.unlockedRelics, activeCurses: stato.activeCurses,
        stsMapNodes: stato.stsMapNodes, currentNodeId: stato.currentNodeId, expeditionStats: stato.expeditionStats,
        challengeState: stato.challengeState || null, activeEnemy: stato.activeEnemy || null,
        helpBonus: stato.helpBonus, helpDmgBonus: stato.helpDmgBonus, combatRound: stato.combatRound, runCtx
    });
}

// Rimette la partita della fotografia; ritorna una copia dei contatori del profilo
function simRestore(snap) {
    const s = JSON.parse(snap);
    stato.party = s.party;
    Object.entries(s.partyFlags).forEach(([k, v]) => { if (v !== undefined) stato.party[k] = v; });
    Object.assign(stato, {
        partyCoins: s.partyCoins, unlockedRelics: s.unlockedRelics, activeCurses: s.activeCurses,
        stsMapNodes: s.stsMapNodes, currentNodeId: s.currentNodeId, expeditionStats: s.expeditionStats,
        challengeState: s.challengeState, activeEnemy: s.activeEnemy,
        helpBonus: s.helpBonus, helpDmgBonus: s.helpDmgBonus, combatRound: s.combatRound
    });
    return s.runCtx;
}

// Profilo che decide strada e prove con le simulazioni; per tutto il resto gioca come "base"
function simLookaheadProfile(base, rollouts = 8) {
    // Vittorie su "rollouts" partite giocate da qui con la prima scelta già fatta; poi la partita torna com'era
    const wins = (runCtx, first) => {
        const snap = simSnapshot(runCtx);
        let n = 0;
        for (let i = 0; i < rollouts; i++) {
            const ctx = simRestore(snap);
            if (simPlayFrom(simRunCampaign, base, ctx, first).victory) n++;
        }
        simRestore(snap);
        return n;
    };
    return {
        ...base,
        key: base.key + '_ricerca', label: base.label + ' con ricerca',
        description: `${base.description} Ai bivi e davanti alle prove prova ogni scelta con ${rollouts} partite simulate e tiene la migliore.`,
        chooseNode: (available, runCtx) => {
            let best = available[0].id, bestWins = -1;
            available.map(n => n.id).forEach(id => {
                const w = wins(runCtx, { nodeId: id });
                if (w > bestWins) { best = id; bestWins = w; }
            });
            return stato.stsMapNodes.find(n => n.id === best);
        },
        attemptChallenge: (chance, node) => {
            if (!node || chance >= 0.95) return true;
            const runCtx = { visitCounts: {}, lootRotationIdx: 0, monsterTargetRotationIdx: 0 };  // contatori nuovi: servono solo ai profili a rotazione
            const yes = wins(runCtx, { nodeId: node.id, profile: { ...base, attemptChallenge: () => true } });
            const no = wins(runCtx, { nodeId: node.id, profile: { ...base, attemptChallenge: () => false } });
            return yes >= no;
        }
    };
}

// Scelte iniziali migliori (abilità e oggetto di ogni eroe) per un profilo: un giro per eroe, provando
// ogni abilità e ogni oggetto con gli altri eroi fermi, e tenendo quello che vince di più su "runs" partite
function simBestStart(campaignData, heroSelection, profile, runs = 30) {
    const sel = heroSelection.map(s => ({ ...s }));
    const rate = () => {
        let w = 0;
        for (let i = 0; i < runs; i++) if (simRunOne(campaignData, sel, profile).victory) w++;
        return w;
    };
    let current = rate();
    sel.forEach(s => {
        const abilities = (campaignData.abilities[s.name] || []).length;
        const items = campaignData.armory.length;
        [['abilityIdx', abilities], ['itemIdx', items]].forEach(([field, count]) => {
            for (let i = 0; i < count; i++) {
                if (i === s[field]) continue;
                const prev = s[field];
                s[field] = i;
                const r = rate();
                if (r > current) current = r; else s[field] = prev;
            }
        });
    });
    return sel;
}

/* ==========================================================================
   BATCH DI RUN + AGGREGAZIONE PER IL REPORT
   ========================================================================== */
function simAggregateProfile(profile, runs) {
    const wins = runs.filter(r => r.victory);
    const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const deathCauses = {};
    runs.filter(r => !r.victory && r.deathCause).forEach(r => { deathCauses[r.deathCause] = (deathCauses[r.deathCause] || 0) + 1; });

    const relicCounts = {};
    runs.forEach(r => r.relicsFound.forEach(name => { relicCounts[name] = (relicCounts[name] || 0) + 1; }));

    return {
        key: profile.key,
        label: profile.label,
        runs,
        wins: wins.length,
        losses: runs.length - wins.length,
        winRate: runs.length ? Math.round((wins.length / runs.length) * 100) : 0,
        avgLevel: Math.round(avg(runs.map(r => r.levelReached)) * 10) / 10,
        totalLevels: runs[0] ? runs[0].totalLevels : 0,
        avgCoins: Math.round(avg(runs.map(r => r.coins))),
        avgSurvivors: Math.round(avg(runs.map(r => r.survivors)) * 10) / 10,
        partySize: runs[0] ? runs[0].partySize : 0,
        deathCauses,
        relicCounts
    };
}

function simRunAll(campaignData, heroSelection, profileKeys, runsPerProfile) {
    const results = {};
    profileKeys.forEach(key => {
        const profile = SIM_PROFILES[key];
        const runs = [];
        for (let i = 0; i < runsPerProfile; i++) runs.push(simRunOne(campaignData, heroSelection, profile));
        results[key] = simAggregateProfile(profile, runs);
    });

    // Pulizia: non lasciare in giro uno stato di gioco "fantasma" dopo il test
    stato.party = []; stato.partyCoins = 0; stato.unlockedRelics = []; stato.activeCurses = [];
    stato.stsMapNodes = []; stato.currentNodeId = null; stato.currentCampaign = null; stato.challengeState = null;

    return results;
}

/* ==========================================================================
   INTERFACCIA DEL WIZARD (screenSimSetup / screenSimReport)
   ========================================================================== */
let simState = { campaignId: null, campaignData: null, selection: {}, profiles: {}, runsPerProfile: SIM_DEFAULT_RUNS_PER_PROFILE, lastResults: null, lastHeroSelection: null };

function openSimTester() {
    simState = {
        campaignId: null,
        campaignData: null,
        selection: {},
        profiles: Object.fromEntries(Object.keys(SIM_PROFILES).map(k => [k, true])),
        runsPerProfile: SIM_DEFAULT_RUNS_PER_PROFILE,
        lastResults: null,
        lastHeroSelection: null
    };
    showScreen('screenSimSetup');
    renderSimCampaignPicker();
    document.getElementById('simHeroesArea').classList.add('hidden');
    document.getElementById('simStartBtn').classList.add('hidden');
    document.getElementById('simStartHint').textContent = '';
    document.getElementById('simRunsInput').value = SIM_DEFAULT_RUNS_PER_PROFILE;
}

function simSetRunsPerProfile(val) {
    let n = parseInt(val, 10);
    if (!Number.isFinite(n) || n < 1) n = 1;
    if (n > 500) n = 500;
    simState.runsPerProfile = n;
    document.getElementById('simRunsInput').value = n;
    updateSimStartButton();
}

function renderSimCampaignPicker() {
    const campaigns = Object.values(campaignsDatabase);
    document.getElementById('simCampaignSelect').innerHTML =
        `<option value="">— Scegli una campagna —</option>` +
        campaigns.map(c => `<option value="${esc(c.id)}">${esc(c.title)}</option>`).join('');
}

// Dati di una campagna nel formato del simulatore (copia: il simulatore non tocca l'originale)
function simCampaignData(campaignId, seed) {
    if (!campaignsDatabase[campaignId]) return null;
    const camp = campaignForPlay(campaignId, seed);  // campagne procedurali: una mappa nuova (o quella del seme)
    return {
        campaign: camp,
        mapNodes: camp.mapNodes,
        enemies: camp.enemies,
        challenges: camp.challenges,
        rests: camp.rests,
        merchants: camp.merchants,
        treasures: camp.treasures,
        heroes: camp.heroes || [],
        abilities: camp.abilities || {},
        armory: camp.initialArmory || [],
        gameItems: camp.lootItems && camp.lootItems.length > 0 ? camp.lootItems : DEFAULT_GAME_ITEMS
    };
}

function simSelectCampaign(campaignId) {
    if (!campaignId) {
        document.getElementById('simHeroesArea').classList.add('hidden');
        document.getElementById('simStartBtn').classList.add('hidden');
        return;
    }
    const data = simCampaignData(campaignId);
    if (!data) return;

    simState.campaignId = campaignId;
    simState.campaignData = data;

    simState.selection = {};
    simState.campaignData.heroes.forEach(h => { simState.selection[h.name] = { included: false, abilityIdx: 0, itemIdx: -1 }; });

    document.getElementById('simHeroesArea').classList.remove('hidden');
    document.getElementById('simStartBtn').classList.remove('hidden');
    renderSimHeroList();
    renderSimProfileChecklist();
    updateSimStartButton();
}

function renderSimHeroList() {
    const heroes = simState.campaignData.heroes;
    const abilitiesMap = simState.campaignData.abilities;
    const armory = simState.campaignData.armory;

    document.getElementById('simHeroList').innerHTML = heroes.map(h => {
        const sel = simState.selection[h.name];
        const heroAbilities = abilitiesMap[h.name] || [];
        const abilityOptions = heroAbilities.map((a, idx) =>
            `<option value="${idx}" ${sel.abilityIdx === idx ? 'selected' : ''}>${esc(a.name)}</option>`).join('');
        const itemOptions = `<option value="-1" ${sel.itemIdx === -1 ? 'selected' : ''}>Nessuno</option>` +
            armory.map((it, idx) => `<option value="${idx}" ${sel.itemIdx === idx ? 'selected' : ''}>${esc(it.name)}</option>`).join('');

        return `
            <div class="sim-hero-row ${sel.included ? 'included' : ''}">
                <label class="sim-hero-toggle">
                    <input type="checkbox" ${sel.included ? 'checked' : ''} ${azioneSu('change', 'simToggleHero', h.name)}>
                    <span class="hero-portrait small ${heroPortraitClass(h.name)}" style="--hue:${heroHue(h.name)}">${heroPortraitInner(h.name)}</span>
                    <strong>${esc(h.name)}</strong>
                </label>
                <div class="sim-hero-config ${sel.included ? '' : 'hidden'}">
                    ${heroAbilities.length ? `<label>Abilità<select ${azioneSu('change', 'simSetHeroAbility', h.name, '$value')}>${abilityOptions}</select></label>` : ''}
                    <label>Oggetto iniziale<select ${azioneSu('change', 'simSetHeroItem', h.name, '$value')}>${itemOptions}</select></label>
                </div>
            </div>`;
    }).join('');
}

function simToggleHero(name) {
    simState.selection[name].included = !simState.selection[name].included;
    renderSimHeroList();
    updateSimStartButton();
}

function simSetHeroAbility(name, val) { simState.selection[name].abilityIdx = parseInt(val, 10); }
function simSetHeroItem(name, val) { simState.selection[name].itemIdx = parseInt(val, 10); }

function renderSimProfileChecklist() {
    document.getElementById('simProfileList').innerHTML = Object.values(SIM_PROFILES).map(p => `
        <div class="sim-profile-row">
            <label class="sim-profile-toggle">
                <input type="checkbox" ${simState.profiles[p.key] ? 'checked' : ''} ${azioneSu('change', 'simToggleProfile', p.key)}>
                ${esc(p.label)}
            </label>
            <p class="sim-profile-desc">${esc(p.description)}</p>
        </div>`).join('');
}

function simToggleProfile(key) {
    simState.profiles[key] = !simState.profiles[key];
    updateSimStartButton();
}

function updateSimStartButton() {
    const includedCount = Object.values(simState.selection).filter(s => s.included).length;
    const profileCount = Object.values(simState.profiles).filter(Boolean).length;
    const ready = includedCount > 0 && profileCount > 0;
    const btn = document.getElementById('simStartBtn');
    btn.disabled = !ready;
    btn.textContent = `Avvia Test (${simState.runsPerProfile} run per profilo)`;
    document.getElementById('simStartHint').textContent = ready ? '' : 'Seleziona almeno un eroe e un profilo.';
}

function simStartTest() {
    const heroSelection = Object.keys(simState.selection)
        .filter(name => simState.selection[name].included)
        .map(name => {
            const s = simState.selection[name];
            return { name, abilityIdx: s.abilityIdx, itemIdx: s.itemIdx >= 0 ? s.itemIdx : null };
        });
    const profileKeys = Object.keys(simState.profiles).filter(k => simState.profiles[k]);
    if (heroSelection.length === 0 || profileKeys.length === 0) return;

    const runsPerProfile = simState.runsPerProfile || SIM_DEFAULT_RUNS_PER_PROFILE;
    const btn = document.getElementById('simStartBtn');
    btn.disabled = true;
    btn.textContent = 'Simulazione in corso...';

    // Le run sono calcoli sincroni puri (nessuna animazione): un breve timeout lascia respirare la UI prima del calcolo
    setTimeout(() => {
        const results = simRunAll(simState.campaignData, heroSelection, profileKeys, runsPerProfile);
        simState.lastResults = results;
        simState.lastHeroSelection = heroSelection;
        simState.lastRunsPerProfile = runsPerProfile;
        btn.disabled = false;
        showScreen('screenSimReport');
        renderSimReport(results);
        updateSimStartButton();
    }, 30);
}

// Vittoria media di tutti i profili confrontata con la difficoltà voluta della campagna (campo "difficolta")
function simDifficultyNote(results) {
    const rates = Object.values(results).map(r => r.winRate);
    if (!rates.length) return '';
    const mean = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
    const d = simState.campaignData.campaign.difficolta || {};
    const hasTarget = d.vittoriaMin != null || d.vittoriaMax != null;
    const target = hasTarget ? ` · obiettivo della campagna ${d.vittoriaMin ?? 0}–${d.vittoriaMax ?? 100}%` : '';
    const off = hasTarget && (mean < (d.vittoriaMin ?? 0) || mean > (d.vittoriaMax ?? 100));
    return `<p class="panel-label" style="color:${off ? 'var(--curse-color)' : 'inherit'}">Vittoria media di tutti i profili: <b>${mean}%</b>${target}${off ? ' (fuori obiettivo)' : ''}</p>`;
}

function renderSimReport(results) {
    const campName = simState.campaignData.campaign.title;
    const heroNames = simState.lastHeroSelection.map(h => h.name).join(', ');
    const runsPerProfile = simState.lastRunsPerProfile || SIM_DEFAULT_RUNS_PER_PROFILE;

    document.getElementById('simReportHeader').innerHTML = `
        <h2>Report — ${esc(campName)}</h2>
        <p class="panel-label">Party testato: ${esc(heroNames)} · ${runsPerProfile} run per profilo</p>
        ${simDifficultyNote(results)}`;

    document.getElementById('simReportBody').innerHTML = Object.values(results).map(r => {
        const deathList = Object.entries(r.deathCauses).sort((a, b) => b[1] - a[1])
            .map(([name, n]) => `<div class="journal-line">${esc(name)}: ${n}</div>`).join('')
            || '<span class="journal-empty">Nessuna sconfitta</span>';
        const relicList = Object.entries(r.relicCounts).sort((a, b) => b[1] - a[1])
            .map(([name, n]) => `<div class="journal-line">${esc(name)} ×${n}</div>`).join('')
            || '<span class="journal-empty">Nessuna reliquia ottenuta</span>';
        const runRows = r.runs.map((run, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td class="${run.victory ? 'log-success' : 'log-fail'}">${run.victory ? 'Vittoria' : 'Sconfitta'}</td>
                <td>${run.levelReached} / ${run.totalLevels}</td>
                <td>${run.coins}</td>
                <td>${run.survivors} / ${run.partySize}</td>
                <td>${run.deathCause ? esc(run.deathCause) : '—'}</td>
            </tr>`).join('');

        return `
            <div class="sim-report-card">
                <div class="sim-report-card-head" ${azione('simToggleRunDetail', r.key)}>
                    <h3>${esc(r.label)}</h3>
                    <button type="button" class="sim-detail-toggle" id="simDetailArrow-${r.key}" aria-label="Mostra dettaglio di tutte le run">▾</button>
                </div>
                <div class="hp-bar-container big">
                    <div class="hp-bar-fill ${hpClass(r.winRate)}" style="width:${r.winRate}%;"></div>
                    <div class="hp-bar-text">${r.wins} / ${r.wins + r.losses} vittorie (${r.winRate}%)</div>
                </div>
                <div class="journal-stats">
                    <div class="journal-stat"><b>${r.avgLevel} / ${r.totalLevels}</b><span>Livello medio raggiunto</span></div>
                    <div class="journal-stat"><b>${r.avgCoins}</b><span>Scudi medi</span></div>
                    <div class="journal-stat"><b>${r.avgSurvivors} / ${r.partySize}</b><span>Eroi sopravvissuti (media)</span></div>
                </div>
                <div class="journal-section"><h4>Cause di sconfitta</h4>${deathList}</div>
                <div class="journal-section"><h4>Reliquie ottenute</h4>${relicList}</div>
                <div class="sim-run-detail hidden" id="simDetail-${r.key}">
                    <h4>Dettaglio di tutte le run</h4>
                    <table class="sim-run-table">
                        <thead><tr><th>#</th><th>Esito</th><th>Livello</th><th>Scudi</th><th>Sopravvissuti</th><th>Causa sconfitta</th></tr></thead>
                        <tbody>${runRows}</tbody>
                    </table>
                </div>
            </div>`;
    }).join('');
}

function simToggleRunDetail(key) {
    const detail = document.getElementById('simDetail-' + key);
    const arrow = document.getElementById('simDetailArrow-' + key);
    detail.classList.toggle('hidden');
    arrow.classList.toggle('open', !detail.classList.contains('hidden'));
}
