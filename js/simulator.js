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
// I consumabili valgono poco ma non zero.
const SIM_ITEM_WEIGHTS = { dmg: 3, str: 2, armor: 1.5, def_armor: 1, def_bonus: 0.75, help_bonus_val: 0.75, fth: 0.75, int: 0.75 };
function simItemValue(item) {
    if (item.type && item.type.startsWith('consumable')) return 0.5;
    // Bonus in scala con Fede/Intelligenza (vedi refreshScaledBonuses): stimati per un eroe con 3 punti
    const scaled = (item.scaling || []).reduce((sum, sc) => sum + (SIM_ITEM_WEIGHTS[sc.stat] || 1) *
        Math.min(sc.max != null ? sc.max : 99, Math.floor(3 / Math.max(1, sc.every || 1))), 0);
    const stats = Object.entries(SIM_ITEM_WEIGHTS).reduce((sum, [k, w]) => sum + w * (item[k] || 0), 0);
    return stats - 2 * (item.att_penalty || 0) + scaled;
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
    stato.party.filter(h => h.hp > 0).forEach(h => {
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
            if ((big && stato.combatRound === 1) || (armorNow && hero.hp / hero.maxHp < 0.5)) { applyTempBuff(hero, item); consumeOne(hero, idx); }
        }
    }
}

function simUseConsumable(hero, itemIdx, target) {
    const item = hero.items[itemIdx];
    if (!item || !item.type || !item.type.startsWith('consumable')) return false;
    if (item.type === 'consumable_heal') healHero(target, item.heal_val);
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
        description: 'Cerca scontri ed élite appena può ed evita il riposo. Attacca sempre e usa l\'abilità attiva alla prima occasione. In combattimento mette in prima linea l\'eroe con più armatura e cura solo chi scende sotto il 25% HP. Dal mercante compra solo oggetti offensivi o consumabili, spendendo tutte le monete disponibili.',
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
        description: 'Ai bivi predilige riposo e mercante e tenta una sfida solo con almeno il 67% di probabilità di successo. In combattimento si difende quando un eroe scende sotto il 50% HP, cura in anticipo e mette in prima linea chi ha più armatura e HP insieme. Dal mercante compra solo armature e consumabili, tenendo sempre una riserva di monete.',
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
        description: 'Ai bivi predilige riposo e tesori ed evita scontri e sfide quando può: tenta una sfida solo con almeno l\'85% di probabilità di successo. In combattimento attacca solo se l\'eroe è a piena salute (75%+ HP), altrimenti si difende sempre, e cura ai primi segni di ferita. Mette in prima linea l\'eroe con più HP massimi e vende dal mercante ogni oggetto puramente offensivo, comprando solo armature e tenendo una grossa riserva di monete.',
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
        description: 'Ai bivi punta su scontri, élite e tesori (fonti dirette di monete) ed evita le sfide, che non danno oro e rischiano maledizioni. In combattimento attacca sempre senza mai curare (tiene i consumabili solo per rivenderli) e lascia incassare i colpi al membro meno utile in battaglia. Dal mercante vende subito ogni consumabile raccolto e reinveste tutto l\'oro in nuovo equipaggiamento.',
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

    if (profile.key === 'bilanciato') {
        let bestCount = Infinity;
        available.forEach(n => { bestCount = Math.min(bestCount, runCtx.visitCounts[n.type] || 0); });
        const candidates = available.filter(n => (runCtx.visitCounts[n.type] || 0) === bestCount);
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    const rankOf = n => { const r = profile.nodePriority.indexOf(n.type); return r === -1 ? 999 : r; };
    const bestRank = Math.min(...available.map(rankOf));
    const candidates = available.filter(n => rankOf(n) === bestRank);
    return candidates[Math.floor(Math.random() * candidates.length)];
}

function simResolveChallengeNode(campaignData, node, profile) {
    const challenge = campaignData.challenges[node.challengeId];
    if (!challenge) return { defeat: false, finalVictory: false };
    stato.challengeState = challenge; // richiesto da challengeModifiers/challengeRollMode (leggono la globale)

    const alive = stato.party.filter(h => h.hp > 0);
    const hero = alive.reduce((best, h) => (h[challenge.stat] || 0) > (best[challenge.stat] || 0) ? h : best, alive[0]);
    const chance = challengeChanceInfo(challengeModifiers(hero)).pct / 100;
    if (!profile.attemptChallenge(chance)) return { defeat: false, finalVictory: false };

    const res = resolveChallenge(hero, challenge);
    return { defeat: false, finalVictory: !!res.isFinal };
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
    merchantHaggle = null;  // il simulatore non contratta
    let stolen = false;  // come nel gioco: con la passiva del ladro il primo oggetto è gratis
    // Medico: cura l'eroe più ferito se ha perso almeno 2 HP e le monete bastano
    const medic = stock.find(e => e.kind === 'medic');
    const wounded = simAliveMinBy(stato.party, h => h.hp - h.maxHp);
    if (medic && wounded && wounded.maxHp - wounded.hp >= MEDIC_HEAL && stato.partyCoins - medic.price >= (profile.merchantReserve || 0)) {
        stato.partyCoins -= medic.price;
        healHero(wounded, MEDIC_HEAL);
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
}

// Bottino trovato: all'eroe che ne guadagna di più (come farebbe un giocatore attento); se a nessuno
// serve davvero va comunque a chi indica il profilo, che scarterà l'oggetto peggiore
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
    const isElite = !!(node && (node.type === 'elite' || node.type === 'captain'));
    let coins = scaledCoins([3, 5, 7, 9, 12], isElite);
    if (hasCurse('15_ricompensa_monete')) coins = Math.floor(coins * 0.85);

    const lootBonusHeroes = stato.party.filter(h => h.hp > 0 && h.bonusLootCoins);
    coins += lootBonusHeroes.reduce((sum, h) => sum + h.bonusLootCoins, 0);
    stato.partyCoins += coins;

    if (hasRelic('dente_del_grande_lupo')) {
        const lowest = simAliveMinBy(stato.party, h => h.hp);
        if (lowest && lowest.hp < lowest.maxHp) healHero(lowest, 1);
    }

    stato.expeditionStats.combatsWon++;
    stato.expeditionStats.itemsFound++;
    simGiveLoot(pickLootItem(isElite), profile, runCtx);
    // Come nel gioco: gli elite lasciano anche una reliquia non ancora posseduta
    if (isElite) {
        stato.expeditionStats.elitesWon = (stato.expeditionStats.elitesWon || 0) + 1;
        const relicId = pickUnownedRelicId();
        if (relicId) grantRelic(relicId);
    }
}

function simResolveCaptainNode(profile) {
    const alive = stato.party.filter(h => h.hp > 0);
    if (alive.length === 0) return;
    const hero = profile.captainHero(alive);
    const type = profile.captainActionType(hero);
    resolveCaptainAction(hero, type);
}

function simExecuteCombatAction(hero, action) {
    if (action === 'ability' && hasUsableAbility(hero)) resolveAbility(hero, stato.activeEnemy);
    else if (action === 'defend') resolveDefend(hero, stato.activeEnemy);
    else if (action === 'help') resolveHelp(hero, stato.activeEnemy);
    else resolveAttack(hero, stato.activeEnemy);
}

function simRunCombat(enemyData, profile, runCtx) {
    stato.party.forEach(refreshScaledBonuses);  // Fede/Int possono essere cambiate da reliquie, maledizioni o scarti
    stato.activeEnemy = JSON.parse(JSON.stringify(enemyData));
    stato.activeEnemy.isStunned = false;
    stato.party.atamanoUsed = false;
    stato.helpBonus = 0;
    stato.combatRound = 0;
    expireTempBuffs(true);
    stato.party.forEach(h => {
        if (h.hp > 0) { h.current_armor = h.base_armor; h.abilityUsedThisCombat = false; }
        else h.current_armor = 0;
        delete h.lastHitRound;
        delete h.lastHitDamage;
    });

    let rounds = 0;
    while (rounds++ < SIM_MAX_COMBAT_ROUNDS) {
        stato.combatRound++;
        expireTempBuffs();
        applyPendingBuffs();
        stato.party.forEach(h => { if (h.hp > 0) h.hasActed = false; });
        const alive = stato.party.filter(h => h.hp > 0);
        const order = profile.turnOrder ? profile.turnOrder(alive) : alive;
        const champion = simAliveMaxBy(alive, h => (h.str || 0) + (h.dmg || 0));

        for (let i = 0; i < order.length; i++) {
            const hero = order[i];
            if (hero.hp <= 0 || hero.hasActed) continue;

            // Uso proattivo di un consumabile sul membro più ferito, secondo la soglia del profilo
            const consumableIdx = hero.items.findIndex(it => it.type === 'consumable_heal' || it.type === 'consumable_full');
            if (consumableIdx > -1) {
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
            const action = profile.combatAction(hero, stato.activeEnemy, { combatRound: stato.combatRound, isLastActor: remaining.length === 0, champion });
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
        }
    }
    return { defeat: true }; // stallo oltre il limite di round: conta come sconfitta per non falsare il report
}

function simResolveNode(campaignData, node, profile, runCtx) {
    stato.currentNodeId = node.id;
    runCtx.visitCounts[node.type] = (runCtx.visitCounts[node.type] || 0) + 1;

    if (node.type === 'combat' || node.type === 'elite') {
        const outcome = simRunCombat(campaignData.enemies[node.enemy], profile, runCtx);
        return { defeat: !!outcome.defeat, finalVictory: false };
    }
    if (node.type === 'challenge') return simResolveChallengeNode(campaignData, node, profile);
    if (node.type === 'rest') { resolveRest(); return { defeat: false, finalVictory: false }; }
    if (node.type === 'merchant') { simResolveMerchantNode(campaignData, node, profile, runCtx); return { defeat: false, finalVictory: false }; }
    if (node.type === 'treasure') { simResolveTreasureNode(campaignData, node, profile, runCtx); return { defeat: false, finalVictory: false }; }
    if (node.type === 'captain') { simResolveCaptainNode(profile); return { defeat: false, finalVictory: true }; }
    return { defeat: false, finalVictory: false };
}

// Stesso avanzamento di advanceNode() in game.js: chiude il nodo, attiva i successivi. True se la mappa finisce qui.
function simAdvance(node) {
    node.done = true;
    node.active = false;
    stato.stsMapNodes.forEach(n => { if (n.level === node.level && n.active) n.active = false; });
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
    stato.expeditionStats = newExpeditionStats();

    const runCtx = { visitCounts: {}, lootRotationIdx: 0, monsterTargetRotationIdx: 0 };

    let visits = 0;
    while (visits++ < SIM_MAX_NODE_VISITS) {
        const available = stato.stsMapNodes.filter(n => n.active && !n.done);
        if (available.length === 0) return simCollectResult(false, null, campaignData);

        const node = simChooseNextNode(available, profile, runCtx);
        const outcome = simResolveNode(campaignData, node, profile, runCtx);
        if (outcome.defeat) return simCollectResult(false, node, campaignData);
        if (outcome.finalVictory) return simCollectResult(true, node, campaignData);

        const isEnd = simAdvance(node);
        if (isEnd) return simCollectResult(true, node, campaignData);
    }
    return simCollectResult(false, null, campaignData); // difesa: non dovrebbe accadere con dati di mappa validi
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
function simCampaignData(campaignId) {
    const raw = campaignsDatabase[campaignId];
    if (!raw) return null;
    const camp = JSON.parse(JSON.stringify(raw));
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
                    <input type="checkbox" ${sel.included ? 'checked' : ''} onchange="simToggleHero('${esc(h.name)}')">
                    <span class="hero-portrait small ${heroPortraitClass(h.name)}" style="--hue:${heroHue(h.name)}">${heroPortraitInner(h.name)}</span>
                    <strong>${esc(h.name)}</strong>
                </label>
                <div class="sim-hero-config ${sel.included ? '' : 'hidden'}">
                    ${heroAbilities.length ? `<label>Abilità<select onchange="simSetHeroAbility('${esc(h.name)}', this.value)">${abilityOptions}</select></label>` : ''}
                    <label>Oggetto iniziale<select onchange="simSetHeroItem('${esc(h.name)}', this.value)">${itemOptions}</select></label>
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
                <input type="checkbox" ${simState.profiles[p.key] ? 'checked' : ''} onchange="simToggleProfile('${p.key}')">
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
                <div class="sim-report-card-head" onclick="simToggleRunDetail('${r.key}')">
                    <h3>${esc(r.label)}</h3>
                    <button type="button" class="sim-detail-toggle" id="simDetailArrow-${r.key}" aria-label="Mostra dettaglio di tutte le run">▾</button>
                </div>
                <div class="hp-bar-container big">
                    <div class="hp-bar-fill ${hpClass(r.winRate)}" style="width:${r.winRate}%;"></div>
                    <div class="hp-bar-text">${r.wins} / ${r.wins + r.losses} vittorie (${r.winRate}%)</div>
                </div>
                <div class="journal-stats">
                    <div class="journal-stat"><b>${r.avgLevel} / ${r.totalLevels}</b><span>Livello medio raggiunto</span></div>
                    <div class="journal-stat"><b>${r.avgCoins}</b><span>Monete medie</span></div>
                    <div class="journal-stat"><b>${r.avgSurvivors} / ${r.partySize}</b><span>Eroi sopravvissuti (media)</span></div>
                </div>
                <div class="journal-section"><h4>Cause di sconfitta</h4>${deathList}</div>
                <div class="journal-section"><h4>Reliquie ottenute</h4>${relicList}</div>
                <div class="sim-run-detail hidden" id="simDetail-${r.key}">
                    <h4>Dettaglio di tutte le run</h4>
                    <table class="sim-run-table">
                        <thead><tr><th>#</th><th>Esito</th><th>Livello</th><th>Monete</th><th>Sopravvissuti</th><th>Causa sconfitta</th></tr></thead>
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
