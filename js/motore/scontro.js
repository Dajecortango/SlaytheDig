/* ==========================================================================
   MOTORE: SCONTRO
   Risoluzione pura dello scontro: attacco, difesa, aiuto, abilità attive (campo "combat"), colpo del nemico,
   fasi degli elite e loro azioni, turno del nemico, stati che saltano il turno, anteprime del danno.
   Solo regole: legge e scrive "stato" (js/game.js), niente DOM. L'interfaccia dello scontro (pulsanti, diario,
   animazioni) è in js/combattimento.js; il simulatore (js/simulator.js) usa le stesse funzioni.
   Modulo: window.Motore.scontro (i nomi restano anche globali).
   ========================================================================== */
(function () {
        // Passiva "Libertas in furor" (hero_set firstActorStrBonus): +Forza al tiro (attacco, abilità, Difendi,
        // Aiuta) se l'eroe è il primo ad agire nel round.
        // È il primo se nessun altro eroe ha già agito nel round, anche se poi è caduto
        // (usare un oggetto non conta: non consuma l'azione).
        function firstActorBonus(hero) {
            if (!hero || !hero.firstActorStrBonus) return 0;
            const first = stato.party.every(h => h === hero || !h.hasActed);
            return first ? hero.firstActorStrBonus : 0;
        }

        // Passiva "Veleni ed altri composti" (hero_set helpDmgBonus): un Aiuta riuscito dà anche +danno
        // al prossimo attacco o abilità; vale fino alla fine del round (azzerato da startHeroesTurnCycle)
        function helpDmgBonus() {
            return stato.helpDmgBonus || 0;
        }

        // Inizio scontro: azzera i limiti "per scontro" e fa scattare gli effetti di inizio scontro. Ritorna le note
        function startCombatSpecials() {
            resetCombatSpecialUses();
            stato.party.forEach(h => { delete h.defendRound; });
            return [...fireSpecialsAll('inizio_scontro').notes, ...fireEnemySpecials('inizio_scontro', stato.activeEnemy, null)];
        }

        // Colpo a segno: danni in più, stordimento, malus al nemico, cure... enemyHpBefore = vita prima del colpo
        function specialHitEffects(hero, enemy, enemyHpBefore) {
            const r = fireSpecials('colpo', hero, { enemy, enemyHpBefore });
            return { dmg: r.dmg, notes: r.notes };
        }

        // Dopo che il colpo di un eroe ha tolto vita al nemico: reazioni del nemico ("colpito", js/motore/speciali.js)
        // ed effetti "nemico_sconfitto" dell'eroe se il nemico è caduto. Ritorna le note per il diario
        function afterHeroHit(hero, enemy) {
            const notes = enemyHitReaction(hero, enemy);
            if (enemy.hp <= 0) notes.push(...fireSpecials('nemico_sconfitto', hero, { enemy }).notes);
            return notes;
        }

        // Voci di un tiro per il diario: " + Forza 3 + Aiuto 1 − 1 Mod." (le voci a 0 si saltano)
        function rollPartsText(parts) {
            return parts.filter(p => p.val).map(p => ` ${p.val > 0 ? '+' : '−'} ${p.label} ${Math.abs(p.val)}`).join('');
        }

        // Tiro di attacco: muta enemy.hp, consuma helpBonus e helpDmgBonus. Ritorna l'esito per log/DOM.
        function resolveAttack(hero, enemy, rolls) {
            const rb = relicCombatBonus(hero);
            const first = firstActorBonus(hero);
            const helpDmg = helpDmgBonus();
            const parts = [{ label: 'Forza', val: hero.str }, { label: 'Libertas', val: first }, { label: 'Aiuto', val: stato.helpBonus }, { label: 'Mod.', val: attackMod(hero) }, { label: 'Bonus', val: rb.att }];
            const firstRoll = rollD6(rolls, 0, hero);
            const rr = specialReroll(hero, firstRoll, firstRoll + hero.str + first + stato.helpBonus + attackMod(hero) + rb.att, enemy.ca, rolls);
            const { roll, total } = rr;
            const itemNotes = rr.note ? [rr.note] : [];
            stato.helpBonus = 0;
            stato.helpDmgBonus = 0;
            const spent = spendNextRollRelics('attacco', hero);

            const hit = naturalRollSuccess(roll, total, enemy.ca);
            let dmg = 0;
            if (hit) {
                const ie = specialHitEffects(hero, enemy, enemy.hp);
                itemNotes.push(...ie.notes);
                dmg = hero.dmg + helpDmg + ie.dmg;
                enemy.hp -= dmg;
                itemNotes.push(...afterHeroHit(hero, enemy));
            }
            return { roll, total, parts, hit, dmg, firstBonus: first, helpDmgBonus: helpDmg, relicAttBonus: rb.att, relicNotes: [...rb.notes, ...spent], itemNotes, naturalNote: naturalRollNote(roll, total, enemy.ca) };
        }

        // Armatura che un tiro di difesa riuscito dà all'eroe: 1, più quella degli scudi (def_armor)
        function defendArmorGain(hero) {
            return 1 + Math.max(0, hero.def_armor || 0);
        }

        // Tiro di difesa: in caso di successo aggiunge armatura corrente all'eroe (vedi defendArmorGain).
        // Gli scudi più forti danno anche def_bonus, che si somma al tiro.
        function resolveDefend(hero, enemy, rolls) {
            const firstRoll = rollD6(rolls, 0, hero);
            const sources = relicDiceSources('difesa', hero);
            const bonus = relicDiceBonus('difesa', hero);
            const first = firstActorBonus(hero);
            const parts = [{ label: 'Forza', val: hero.str }, { label: 'Libertas', val: first }, { label: 'Scudo', val: hero.def_bonus || 0 }, { label: 'Bonus', val: bonus }];
            const rr = specialReroll(hero, firstRoll, firstRoll + hero.str + first + (hero.def_bonus || 0) + bonus, enemy.att, rolls);
            const { roll, total } = rr;
            const spent = spendNextRollRelics('difesa', hero);
            const success = naturalRollSuccess(roll, total, enemy.att);
            const gained = success ? defendArmorGain(hero) : 0;
            hero.current_armor += gained;
            hero.defendRound = stato.combatRound;  // condizione "ha_difeso" degli effetti speciali (Scudo a Spina di Kranen)
            return { roll, total, parts, success, gained, naturalNote: naturalRollNote(roll, total, enemy.att), itemNotes: rr.note ? [rr.note] : [],
                relicNotes: [...sources.map(r => `${r.name} (+${r.val} al tiro)`), ...spent] };
        }

        // Tiro di aiuto: in caso di successo imposta il bonus +1 al prossimo attacco/abilità
        // (e, con la passiva helpDmgBonus, anche +danno fino alla fine del round).
        function resolveHelp(hero, enemy, rolls) {
            const firstRoll = rollD6(rolls, 0, hero);
            const sources = relicDiceSources('aiuto', hero);
            const bonus = relicDiceBonus('aiuto', hero);
            const first = firstActorBonus(hero);
            const parts = [{ label: 'Forza', val: hero.str }, { label: 'Libertas', val: first }, { label: 'Aiuto', val: hero.help_bonus_val || 0 }, { label: 'Bonus', val: bonus }];
            const rr = specialReroll(hero, firstRoll, firstRoll + hero.str + first + (hero.help_bonus_val || 0) + bonus, enemy.att, rolls);
            const { roll, total } = rr;
            const spent = spendNextRollRelics('aiuto', hero);
            const success = naturalRollSuccess(roll, total, enemy.att);
            let dmgBonus = 0;
            if (success) {
                stato.helpBonus = 1;
                dmgBonus = hero.helpDmgBonus || 0;
                if (dmgBonus) stato.helpDmgBonus = dmgBonus;
            }
            return { roll, total, parts, success, dmgBonus, naturalNote: naturalRollNote(roll, total, enemy.att), itemNotes: rr.note ? [rr.note] : [],
                relicNotes: [...sources.map(r => `${r.name} (+${r.val} al tiro)`), ...spent] };
        }

        // Comportamento in combattimento di un'abilità attiva, descritto nel campo "combat" della
        // libreria Abilità (data/libreria/abilita.js), così le attive nuove si creano dall'editor:
        //   dice: 1 o 2 (con 2 si tiene il dado migliore)
        //   attackStat / damageStat: statistica dell'eroe aggiunta al tiro per colpire / al danno
        //   attackBonus / damageBonus: bonus fisso al tiro per colpire / al danno (es. 2 e 1)
        //   damageMult: moltiplicatore del danno (es. 2 = danno raddoppiato)
        //   stun: se colpisce, il nemico salta il suo prossimo attacco
        //   critical: il colpo a segno mostra i numeri del critico
        //   autoHit: colpisce sempre, senza tiro (vale come un 6 naturale)
        //   requiresHitLastTurn: si può usare solo se il nemico ha colpito l'eroe nel suo ultimo turno
        //   damageTakenBonus: aggiunge al danno i danni subiti in quel colpo (HP e armatura persi)
        //   armorGain: niente tiro; l'eroe ottiene subito questa armatura (usa comunque la sua azione)
        //   sumTarget: tira due dadi; se la somma è esattamente questo numero il nemico è sconfitto
        //     (elite e boss scendono a metà della vita massima). Niente Forza, bonus o reliquie.
        //   useText / hitLabel / hitText: testi per il diario e il risultato ({eroe}, {danni})
        // I salvataggi vecchi possono avere l'abilità senza "combat": si prende dalla libreria.
        function abilityCombat(ability) {
            if (!ability || !ability.isCombatActive) return null;
            return ability.combat || ((LIBRERIA.abilita || {})[ability.id] || {}).combat || null;
        }

        function abilityStatBonus(hero, stat) {
            return stat ? (hero[stat] || 0) : 0;
        }

        // Danni subiti dall'eroe nell'ultimo attacco del nemico, se è avvenuto subito prima di questo round
        // (resolveMonsterAttack scrive lastHitRound e lastHitDamage; HP e armatura persi contano entrambi)
        function heroHitLastTurn(hero) {
            return hero.lastHitRound === stato.combatRound - 1 && (hero.lastHitDamage || 0) > 0 ? hero.lastHitDamage : 0;
        }

        // L'abilità attiva si può usare adesso? Ritorna { ok, reason } (reason per il tooltip del comando)
        function abilityUsable(hero) {
            const ability = hero && hero.chosenAbility;
            if (!ability || !ability.isCombatActive) return { ok: false, reason: 'Nessuna abilità attiva' };
            if (hero.abilityUsedThisCombat) return { ok: false, reason: 'Già utilizzata in questo scontro' };
            if (isSilenced(hero)) return { ok: false, reason: 'Silenziato: non può usare l\'abilità attiva' };
            if (isRaging(hero)) return { ok: false, reason: 'In furia: può solo attaccare' };
            const c = abilityCombat(ability) || {};
            if (c.requiresHitLastTurn && !heroHitLastTurn(hero)) return { ok: false, reason: 'Si può usare solo dopo essere stati colpiti dal nemico nel suo ultimo turno' };
            // Somma esatta contro elite e boss: li porta a metà vita, inutile se ci sono già
            const enemy = stato.activeEnemy;
            if (c.sumTarget && enemy && currentEnemyIsEliteOrBoss() && enemy.hp <= Math.floor(enemy.maxHp / 2)) {
                return { ok: false, reason: 'Il nemico è già a metà vita o meno: l\'abilità non avrebbe effetto' };
            }
            return { ok: true, reason: '' };
        }

        // Danno di un colpo a segno dell'abilità (stesso calcolo per il tiro vero e per le anteprime)
        function abilityHitDamage(hero, c, relicDmg) {
            const taken = c.damageTakenBonus ? heroHitLastTurn(hero) : 0;
            return (hero.dmg + abilityStatBonus(hero, c.damageStat) + (c.damageBonus || 0) + taken + helpDmgBonus() + relicDmg) * (c.damageMult || 1);
        }

        // Elite o boss: nodo elite o capitano, oppure lo scontro dell'ultimo livello della mappa
        function currentEnemyIsEliteOrBoss() {
            const node = stato.stsMapNodes.find(n => n.id === stato.currentNodeId);
            if (!node) return false;
            const maxLevel = Math.max(...stato.stsMapNodes.map(n => n.level));
            return node.type === 'elite' || node.type === 'captain' || node.level === maxLevel;
        }

        // Abilità senza tiro di dado (armorGain, senzaTiro): si risolve appena scelta, senza il pannello dei dadi
        function abilityIsInstant(hero) {
            const c = hero && abilityCombat(hero.chosenAbility);
            return !!(c && (c.armorGain || c.senzaTiro));
        }

        // Effetti di un'abilità attiva (campo "effetti" di "combat": { quando: "uso" | "colpo" | "mancato", fai, ... },
        // stesso vocabolario degli effetti speciali, js/motore/speciali.js). Ritorna i risultati di runSpecialEntries:
        // con "colpo" i danni in più (dmg) li somma chi chiama
        function abilitySpecialEffects(hero, ability, quando, ctx = {}) {
            const list = (abilityCombat(ability) || {}).effetti || [];
            const entries = list.map((s, i) => ({ s, owner: hero, kind: 'abilita', name: ability.name, icon: ability.icon || '', ref: ability,
                key: `c:${ability.id || ability.name}#${i}` })).filter(e => e.s.quando === quando);
            return runSpecialEntries(entries, quando, hero, { enemy: stato.activeEnemy, ...ctx });
        }

        // Risolve l'abilità attiva in combattimento: muta enemy.hp (e isStunned), consuma helpBonus.
        function resolveAbility(hero, enemy, rolls) {
            hero.abilityUsedThisCombat = true;
            const abId = hero.chosenAbility.id;
            const c = abilityCombat(hero.chosenAbility);
            if (!c) return { abId, hit: false, dmg: 0, noEffect: true, relicNotes: [] };
            // Effetti "quando la usa" (cure, potenziamenti, danni...): prima di tutto il resto
            const useNotes = abilitySpecialEffects(hero, hero.chosenAbility, 'uso', { enemy }).notes;

            // Senza tiro (armatura immediata e/o solo effetti): il bonus di Aiuta resta per il prossimo
            if (c.armorGain || c.senzaTiro) {
                hero.current_armor += c.armorGain || 0;
                return { abId, instant: true, gained: c.armorGain || 0, hit: false, dmg: 0, relicNotes: [], itemNotes: useNotes };
            }
            // Somma esatta (es. "7"): conta solo la somma dei due dadi, il bonus di Aiuta resta per il prossimo
            if (c.sumTarget) {
                const dice = [rollD6(rolls, 0, hero), rollD6(rolls, 1, hero)];
                const sum = dice[0] + dice[1];
                const hit = sum === c.sumTarget;
                const eliteHalf = hit && currentEnemyIsEliteOrBoss();
                const before = enemy.hp;
                // Metà vita arrotondata per difetto, come le soglie delle fasi: quella al 50% scatta
                if (hit) enemy.hp = eliteHalf ? Math.min(enemy.hp, Math.floor(enemy.maxHp / 2)) : 0;
                const after = abilitySpecialEffects(hero, hero.chosenAbility, hit ? 'colpo' : 'mancato', { enemy });
                if (after.dmg) enemy.hp -= after.dmg;
                const sumNotes = [...useNotes, ...after.notes, ...(hit ? afterHeroHit(hero, enemy) : [])];
                return { abId, sumRoll: true, dice, d1: dice[0], d2: dice[1], roll: sum, total: sum, hit, eliteHalf,
                    dmg: Math.max(0, before - enemy.hp), naturalNote: null, relicNotes: [], itemNotes: sumNotes };
            }
            const rb = relicCombatBonus(hero);
            const attStat = abilityStatBonus(hero, c.attackStat);
            const taken = c.damageTakenBonus ? heroHitLastTurn(hero) : 0;
            const firstBonus = firstActorBonus(hero);
            const helpDmg = helpDmgBonus();
            const dmg = abilityHitDamage(hero, c, rb.dmg);
            stato.helpDmgBonus = 0;
            // Colpo automatico: niente tiro, vale come un 6 naturale (il bonus di Aiuta resta per il prossimo)
            if (c.autoHit) {
                const hpBefore = enemy.hp;
                const ie = specialHitEffects(hero, enemy, hpBefore);
                const ae = abilitySpecialEffects(hero, hero.chosenAbility, 'colpo', { enemy, enemyHpBefore: hpBefore });
                const total6 = dmg + ie.dmg + ae.dmg;
                enemy.hp -= total6;
                if (c.stun) enemy.isStunned = true;
                const autoNotes = [...useNotes, ...ie.notes, ...ae.notes, ...afterHeroHit(hero, enemy)];
                return { abId, autoHit: true, dice: [6], d1: 6, roll: 6, total: 6, hit: true, dmg: total6, attStat, taken, firstBonus, helpDmgBonus: helpDmg, naturalNote: null,
                    dmgStat: abilityStatBonus(hero, c.damageStat), relicDmgBonus: rb.dmg, relicNotes: rb.notes, itemNotes: autoNotes };
            }
            // Con due dadi i dadi del ritiro (Dado d'Osso) partono dopo i due già tirati
            const dice = c.dice === 2 ? [rollD6(rolls, 0, hero), rollD6(rolls, 1, hero)] : [rollD6(rolls, 0, hero)];
            const parts = [{ label: 'Forza', val: hero.str }, { label: 'Libertas', val: firstBonus }, { label: STAT_LABELS[c.attackStat] || 'Stat.', val: attStat }, { label: hero.chosenAbility.name, val: c.attackBonus || 0 },
                { label: 'Aiuto', val: stato.helpBonus }, { label: 'Mod.', val: attackMod(hero) }, { label: 'Bonus', val: rb.att }];
            const bonus = hero.str + firstBonus + attStat + (c.attackBonus || 0) + stato.helpBonus + attackMod(hero) + rb.att;
            const kept = Math.max(...dice);
            const rr = specialReroll(hero, kept, kept + bonus, enemy.ca, c.dice === 2 ? [null, rolls && rolls[2]] : rolls);
            if (rr.note) dice[dice.indexOf(kept)] = rr.roll;
            const roll = Math.max(...dice);
            const total = roll + bonus;
            const itemNotes = [...useNotes, ...(rr.note ? [rr.note] : [])];
            stato.helpBonus = 0;
            rb.notes.push(...spendNextRollRelics('attacco', hero));
            const hit = naturalRollSuccess(roll, total, enemy.ca);
            let finalDmg = dmg;
            if (hit) {
                const hpBefore = enemy.hp;
                const ie = specialHitEffects(hero, enemy, hpBefore);
                const ae = abilitySpecialEffects(hero, hero.chosenAbility, 'colpo', { enemy, enemyHpBefore: hpBefore });
                itemNotes.push(...ie.notes, ...ae.notes);
                finalDmg += ie.dmg + ae.dmg;
                enemy.hp -= finalDmg;
                if (c.stun) enemy.isStunned = true;
                itemNotes.push(...afterHeroHit(hero, enemy));
            } else {
                itemNotes.push(...abilitySpecialEffects(hero, hero.chosenAbility, 'mancato', { enemy }).notes);
            }
            return { abId, dice, d1: dice[0], d2: dice[1], roll, total, parts, hit, dmg: finalDmg, attStat, taken, firstBonus, helpDmgBonus: helpDmg, naturalNote: naturalRollNote(roll, total, enemy.ca),
                dmgStat: abilityStatBonus(hero, c.damageStat), relicDmgBonus: rb.dmg, relicNotes: rb.notes, itemNotes };
        }

        // Attacco del mostro su un bersaglio: maledizioni, effetti speciali, armatura, poi HP.
        // "events" descrive in ordine cosa è successo, per il log di combattimento.
        // opts.dmg: danno diverso da quello del nemico; opts.splash: colpo di contorno (travolgimento agli
        // eroi accanto, aura): niente Presagio di Morte, e non vale la condizione "colpo_pieno" (Scudo dell'Atamano);
        // opts.reaction: attacco in risposta fuori dal turno del nemico (niente danni al nemico dagli effetti)
        function resolveMonsterAttack(enemy, target, opts = {}) {
            const events = [];
            const special = list => list.forEach(text => events.push({ type: 'special', text: `✨ ${text}` }));
            let dmg = opts.dmg != null ? opts.dmg : enemy.dmg;
            const armorBefore = target.current_armor;
            const hpBefore = target.hp;

            if (!opts.splash && hasCurse('presagio_di_morte')) {
                dmg += 1;
                events.push({ type: 'curse_bonus', text: '💀 Presagio di Morte: il colpo infligge 1 danno in più.' });
            }

            // Effetti "colpito": colpo assorbito (Scudo dell'Atamano), schivata (Neanche un graffio)...
            if (dmg > 0) {
                const hit = fireSpecials('colpito', target, { enemy, splash: !!opts.splash });
                special(hit.notes);
                if (hit.cancel) dmg = 0;
            }

            if (target.current_armor > 0 && dmg > 0) {
                if (target.current_armor >= dmg) {
                    target.current_armor -= dmg;
                    events.push({ type: 'armor_full', text: "L'armatura assorbe interamente il colpo!" });
                    dmg = 0;
                } else {
                    dmg -= target.current_armor;
                    target.current_armor = 0;
                    events.push({ type: 'armor_partial', remaining: dmg, text: `L'armatura si infrange. I restanti ${dmg} colpiscono gli HP!` });
                }
            }

            let hpDamage = 0;
            let targetDied = false;
            if (dmg > 0) {
                // Effetti "colpo_mortale" (Tanto ho tenacia, Marchio di Jag Àntar): resta in piedi con quegli HP
                const mortal = target.hp - dmg <= 0 ? fireSpecials('colpo_mortale', target, { enemy }) : null;
                if (mortal && mortal.revive != null) {
                    target.hp = Math.min(target.maxHp, mortal.revive);
                    special(mortal.notes);
                } else {
                    hpDamage = dmg;
                    target.hp = Math.max(0, target.hp - dmg);
                    targetDied = target.hp <= 0;
                    events.push({ type: 'hp_damage', amount: dmg, text: `${target.name} subisce ${dmg} danni agli HP!` });
                    // Effetti "alleato_caduto" di chi resta in piedi (Talismano del Corvo), poi della compagnia
                    if (targetDied) {
                        stato.party.filter(h => h !== target && h.hp > 0).forEach(h => special(fireSpecials('alleato_caduto', h, { enemy, scope: 'own' }).notes));
                        special(fireSpecials('alleato_caduto', target, { enemy, scope: 'party' }).notes);
                    }
                }
            }

            // Per "Dente per dente": quanto ha perso l'eroe in questo colpo (armatura + HP) e in quale round
            target.lastHitDamage = Math.max(0, armorBefore - target.current_armor) + Math.max(0, hpBefore - target.hp);
            target.lastHitRound = stato.combatRound;

            // Effetti "perde_hp" (vendetta: chi viene ferito colpisce il nemico...) e "dopo_colpito" (spine dello Scudo
            // a Spina, armatura da ferito dell'Ultimo Baluardo...)
            if (hpDamage > 0) special(fireSpecials('perde_hp', target, { enemy, splash: !!opts.splash, reaction: !!opts.reaction }).notes);
            special(fireSpecials('dopo_colpito', target, { enemy, splash: !!opts.splash, reaction: !!opts.reaction }).notes);
            // Effetti del nemico quando colpisce (solo il colpo principale: niente catene dai colpi di contorno)
            if (!opts.splash && !opts.reaction) special(fireEnemySpecials('colpisce', enemy, target));

            return { events, hpDamage, targetDied };
        }

        /* ---------- Fasi dei nemici (elite e boss) ----------
           Nel bestiario: "fasi": [{ soglia, testo, azioni: [id, ...] }].
           soglia: % di vita; la prima volta che il nemico scende a quel valore o sotto, la fase scatta
             (una volta sola; se un colpo ne supera più d'una scattano tutte, in ordine).
           azioni: id delle azioni speciali di data/azioni_elite/azioni_elite.js (LIBRERIA.azioni_elite), solo dati
             interpretati qui; i campi sono descritti in testa a quel file. Due parti, anche nella stessa azione:
             - subito, alla soglia (applyEliteAction, poi eliteReaction per l'attacco in risposta "colpo",
               che arriva fuori dal turno del nemico; al suo turno il nemico poi attacca come sempre);
             - "turno": true, da quel momento a ogni turno del nemico (resolveEnemyTurn): sostituisce il modo
               di attaccare precedente; enemy.schema = id dell'azione, enemy.turnoAzione = l'azione.
           Le fasi scritte nel formato di prima (schema, reazione, bonusDanno, ruggito) valgono ancora: schema e
           reazione sono id di azioni, bonusDanno e ruggito diventano azioni scritte al volo (legacyPhaseActions). */

        // Azione speciale: per id dalla libreria, oppure scritta per intero nella fase
        function eliteAction(ref) {
            if (!ref) return null;
            if (typeof ref === 'object') return ref;
            const a = ((window.LIBRERIA || {}).azioni_elite || {})[ref];
            return a ? { id: ref, ...a } : null;
        }

        function legacyPhaseActions(f) {
            const out = [];
            if (f.bonusDanno) out.push({ name: 'Furore', desc: `+${f.bonusDanno} danno`, bonusDanno: f.bonusDanno });
            if (f.schema) out.push(f.schema);
            if (f.ruggito) out.push({ name: 'Ruggito primordiale', malus: f.ruggito.malus || 1, malusRound: 1, resisteFede: f.ruggito.fedeMin || 0,
                desc: `ruggito: -${f.ruggito.malus || 1} al tiro nel turno dopo${f.ruggito.fedeMin ? ` (non per chi ha Fede ${f.ruggito.fedeMin}+)` : ''}` });
            if (f.reazione) out.push(f.reazione);
            return out;
        }

        // Azioni di una fase, già complete (quelle non trovate nella libreria vengono saltate)
        function phaseActions(f) {
            return [...(f.azioni || []), ...legacyPhaseActions(f)].map(eliteAction).filter(Boolean);
        }

        // Eroi vivi indicati da un bersaglio: "attaccante" (chi ha fatto scattare la soglia), "tutti",
        // "piu_debole" / "piu_forte" (meno o più HP + armatura), "casuale"
        function eliteTargets(mode, attacker) {
            const alive = stato.party.filter(h => h.hp > 0);
            if (mode === 'tutti') return alive;
            if (mode === 'attaccante') return attacker && attacker.hp > 0 ? [attacker] : [];
            const one = mode === 'piu_debole' ? predatorTarget()
                : mode === 'piu_forte' ? strongestTarget()
                : mode === 'casuale' ? alive[Math.floor(rng() * alive.length)] : null;
            return one ? [one] : [];
        }

        // Eroi vivi accanto al bersaglio nell'ordine della compagnia (travolgimento e colpo ad area)
        function heroesNextTo(target) {
            const idx = stato.party.indexOf(target);
            return [stato.party[idx - 1], stato.party[idx + 1]].filter(h => h && h.hp > 0);
        }

        // Bersaglio "piu_debole" (Predatore): l'eroe vivo con meno HP + armatura (a parità, il primo)
        function predatorTarget() {
            const alive = stato.party.filter(h => h.hp > 0);
            return alive.reduce((best, h) => (!best || h.hp + h.current_armor < best.hp + best.current_armor) ? h : best, null);
        }

        // Bersaglio "piu_forte": l'eroe vivo con più HP + armatura (a parità, il primo)
        function strongestTarget() {
            const alive = stato.party.filter(h => h.hp > 0);
            return alive.reduce((best, h) => (!best || h.hp + h.current_armor > best.hp + best.current_armor) ? h : best, null);
        }

        // Colpo del nemico: pieno al bersaglio (opts.dmg = danno diverso da quello del nemico) e opts.vicini
        // danni agli eroi accanto. Ritorna gli eventi e gli HP tolti in tutto (Sete di sangue).
        function monsterStrike(enemy, target, opts = {}) {
            const first = resolveMonsterAttack(enemy, target, { dmg: opts.dmg, reaction: opts.reaction });
            const events = first.events;
            let hpDamage = first.hpDamage;
            if (opts.vicini) heroesNextTo(target).forEach(n => {
                events.push({ type: 'splash', text: `Travolto anche ${n.name}!` });
                const res = resolveMonsterAttack(enemy, n, { dmg: opts.vicini, splash: true, reaction: opts.reaction });
                events.push(...res.events);
                hpDamage += res.hpDamage;
            });
            return { events, hpDamage };
        }

        // Parte "subito" di un'azione: statistiche del nemico, cura, nuovo modo di attaccare, malus, stordimento, armature
        function applyEliteAction(enemy, a, attacker) {
            const events = [];
            const info = text => events.push({ type: 'phase_info', text });
            [['bonusDanno', 'dmg', 'danno'], ['bonusAttacco', 'att', 'Attacco'], ['bonusCA', 'ca', 'CA']].forEach(([k, stat, label]) => {
                if (!a[k]) return;
                enemy[stat] = Math.max(0, enemy[stat] + a[k]);
                info(`${enemy.name}: ${a[k] > 0 ? '+' : ''}${a[k]} ${label}.`);
            });
            if (a.cura && enemy.hp < enemy.maxHp) {
                const before = enemy.hp;
                enemy.hp = Math.min(enemy.maxHp, enemy.hp + a.cura);
                info(`${enemy.name} recupera ${enemy.hp - before} HP.`);
            }
            if (a.turno) {
                enemy.schema = a.id || a.name;
                enemy.turnoAzione = a;
                enemy.charging = !!a.turnoPreparazione;  // già pronta: al primo turno dopo la soglia colpisce subito
                info(`Nuovo schema d'attacco: ${a.desc || a.name}.`);
            }
            if (a.malus) {
                const rounds = a.malusRound || 1;
                stato.party.filter(h => h.hp > 0).forEach(h => {
                    if (a.resisteFede && (h.fth || 0) >= a.resisteFede) { info(`${h.name} resiste grazie alla Fede.`); return; }
                    scheduleTempBuff(h, { stat: 'att_bonus', val: -a.malus, name: a.name || 'Malus del nemico', rounds });
                    info(`${h.name} è scosso: -${a.malus} al tiro per colpire ${rounds > 1 ? `per ${rounds} turni` : 'nel prossimo turno'}.`);
                });
            }
            if (a.spezzaArmatura) eliteTargets(a.spezzaArmatura, attacker).forEach(h => {
                if (h.current_armor > 0) { h.current_armor = 0; info(`L'armatura di ${h.name} va in pezzi!`); }
            });
            // Effetti speciali del nemico che valgono da questa soglia in poi (NEMICO_QUANDO / NEMICO_FAI)
            if (Array.isArray(a.speciali) && a.speciali.length) {
                enemy.specialiFase = [...(enemy.specialiFase || []), ...a.speciali];
                a.speciali.forEach(s => info(`${enemy.name}: ${nemicoTesto(s).charAt(0).toLowerCase()}${nemicoTesto(s).slice(1)}.`));
            }
            if (a.stordisce) eliteTargets(a.stordisce, attacker).forEach(h => {
                h.stunnedRounds = Math.max(h.stunnedRounds || 0, 1);
                info(`💫 ${h.name} è stordito: salterà il prossimo turno.`);
            });
            return events;
        }

        // Attacco in risposta di un'azione ("colpo"): subito, fuori dal turno del nemico
        function eliteReaction(enemy, a, attacker) {
            if (enemy.isStunned) return [{ type: 'phase_info', text: `${enemy.name} è stordito: non riesce a rispondere al colpo.` }];
            const targets = eliteTargets(a.colpo, attacker);
            if (!targets.length) return [];
            const events = [{ type: 'reaction', text: `⚔️ ${enemy.name} risponde al colpo e si scaglia contro ${targets.length > 1 ? 'tutta la compagnia' : targets[0].name}!` }];
            // "Dente per dente" guarda solo il turno del nemico: la reazione non cambia l'ultimo colpo subito
            const lastHits = stato.party.map(h => [h.lastHitRound, h.lastHitDamage]);
            targets.forEach(h => { if (h.hp > 0) events.push(...monsterStrike(enemy, h, { dmg: a.colpoDanno, vicini: a.colpoVicini, reaction: true }).events); });
            stato.party.forEach((h, i) => { [h.lastHitRound, h.lastHitDamage] = lastHits[i]; });
            return events;
        }

        // Controlla le soglie dopo un colpo dell'eroe "attacker". Applica le fasi scattate e ritorna gli eventi
        // (type 'phase' con il testo della fase, poi le informazioni e i colpi) per diario e interfaccia.
        function checkEnemyPhases(enemy, attacker, opts = {}) {
            const events = [];
            const fasi = enemy.fasi || [];
            if (!fasi.length || enemy.hp <= 0) return events;
            enemy.fasiFatte = enemy.fasiFatte || [];
            fasi.forEach((f, i) => {
                if (enemy.fasiFatte.includes(i) || enemy.hp <= 0) return;
                // Fasi a tempo ("round": N): scattano a inizio round, non con la vita (checkEnemyRoundPhases)
                if (f.round ? (opts.round == null || opts.round < f.round) : (opts.round != null || enemy.hp > Math.floor(enemy.maxHp * f.soglia / 100))) return;
                enemy.fasiFatte.push(i);
                events.push({ type: 'phase', text: f.testo || `${enemy.name} cambia atteggiamento!` });
                const azioni = phaseActions(f);
                azioni.forEach(a => events.push(...applyEliteAction(enemy, a, attacker)));
                // Gli attacchi in risposta per ultimi: usano il danno già aumentato dalla fase
                azioni.filter(a => a.colpo).forEach(a => events.push(...eliteReaction(enemy, a, attacker)));
                // Effetti "alla soglia" delle azioni (speciali con quando "soglia"): subito
                fireEnemySpecials('soglia', enemy, attacker && attacker.hp > 0 ? attacker : null).forEach(text => events.push({ type: 'phase_info', text }));
            });
            return events;
        }

        // Fasi a tempo: a inizio round scattano quelle con "round" arrivato (gioco e simulatore). Stessi eventi di checkEnemyPhases
        function checkEnemyRoundPhases(enemy) {
            if (!enemy || !(enemy.fasi || []).some(f => f.round)) return [];
            return checkEnemyPhases(enemy, null, { round: stato.combatRound });
        }

        // Modo di attaccare attuale del nemico (azione con "turno"), {} = attacco normale al bersaglio scelto
        function enemyTurnRule(enemy) {
            return (enemy && (enemy.turnoAzione || eliteAction(enemy.schema))) || {};
        }

        // Turno di preparazione (Carica): questo turno non attacca
        function enemyIsPreparing(enemy) {
            return !!enemyTurnRule(enemy).turnoPreparazione && !enemy.charging;
        }

        // Bersaglio che il nemico sceglie da solo al suo turno; null = lo sceglie il giocatore (o colpisce tutti)
        function enemyChosenTarget(enemy) {
            const mode = enemyTurnRule(enemy).turnoBersaglio;
            if (!mode || mode === 'scelto' || mode === 'tutti') return null;
            return eliteTargets(mode)[0] || null;
        }

        function preparationText(enemy) {
            const r = enemyTurnRule(enemy);
            return (r.turnoTestoPreparazione || '{nemico} si prepara: al prossimo turno colpirà con tutta la sua forza!').replace(/\{nemico\}/g, enemy.name);
        }

        // Turno del nemico secondo il suo modo di attaccare. chosenTarget = bersaglio scelto dal giocatore (o dal simulatore).
        // Ritorna { events, attacked, target }. "attacked" è falso nel turno in cui si prepara.
        function resolveEnemyTurn(enemy, chosenTarget) {
            const events = [];
            const r = enemyTurnRule(enemy);
            if (r.turnoCrescitaDanno) {
                enemy.dmg += r.turnoCrescitaDanno;
                events.push({ type: 'fury', text: `${enemy.name} è sempre più furioso: ora fa ${enemy.dmg} danni.` });
            }
            if (r.turnoRigenera && enemy.hp > 0 && enemy.hp < enemy.maxHp) {
                const before = enemy.hp;
                enemy.hp = Math.min(enemy.maxHp, enemy.hp + r.turnoRigenera);
                events.push({ type: 'regen', text: `${enemy.name} rigenera ${enemy.hp - before} HP.` });
            }
            if (r.turnoPreparazione && !enemy.charging) {
                enemy.charging = true;
                events.push({ type: 'charge', text: preparationText(enemy) });
                return { events, attacked: false, target: null };
            }
            enemy.charging = false;
            if (r.turnoAura) {
                events.push({ type: 'aura', text: `${enemy.name}: ${r.turnoAura} ${r.turnoAura === 1 ? 'danno' : 'danni'} a tutta la compagnia!` });
                stato.party.filter(h => h.hp > 0).forEach(h => events.push(...resolveMonsterAttack(enemy, h, { dmg: r.turnoAura, splash: true }).events));
            }
            const mode = r.turnoBersaglio || 'scelto';
            // Bersaglio scelto dal nemico: quello annunciato a inizio turno (announcedPrey), se è ancora in piedi
            const announced = enemy.announcedPrey && stato.party.find(h => h.name === enemy.announcedPrey && h.hp > 0);
            enemy.announcedPrey = null;
            let targets;
            if (mode === 'tutti') targets = stato.party.filter(h => h.hp > 0);
            else if (mode === 'scelto') targets = chosenTarget && chosenTarget.hp > 0 ? [chosenTarget] : (chosenTarget ? eliteTargets('piu_debole') : []);
            else targets = announced ? [announced] : eliteTargets(mode);
            if (!targets.length) return { events, attacked: !!r.turnoAura, target: null };

            let hpTaken = 0;
            const colpi = Math.max(1, r.turnoColpi || 1);
            for (let c = 0; c < colpi; c++) {
                const alive = targets.filter(t => t.hp > 0);
                if (!alive.length) break;
                if (c > 0) events.push({ type: 'extra_strike', text: `${enemy.name} colpisce ancora!` });
                alive.forEach(t => {
                    const res = monsterStrike(enemy, t, { dmg: r.turnoDanno, vicini: r.turnoVicini });
                    events.push(...res.events);
                    hpTaken += res.hpDamage;  // le spine (Scudo a Spina di Kranen) sono in resolveMonsterAttack: "dopo_colpito"
                });
            }
            if (r.turnoRubaVita && hpTaken > 0 && enemy.hp < enemy.maxHp) {
                const before = enemy.hp;
                enemy.hp = Math.min(enemy.maxHp, enemy.hp + hpTaken);
                events.push({ type: 'lifesteal', text: `🩸 ${enemy.name} si nutre del sangue versato: +${enemy.hp - before} HP.` });
            }
            return { events, attacked: true, target: targets[0] };
        }

        // Eroi storditi da un'azione speciale (stordisce): a inizio round saltano il turno.
        // Usata dal gioco (startHeroesTurnCycle) e dal simulatore; ritorna chi salta il turno
        function applyHeroStuns() {
            return stato.party.filter(h => {
                if (!(h.stunnedRounds > 0)) return false;
                h.stunnedRounds--;
                if (h.hp <= 0) return false;
                h.hasActed = true;
                return true;
            });
        }

        // Testo dell'intenzione, composto dal modo di attaccare attuale (enemyTurnRule)
        function enemyIntentText(enemy) {
            const r = enemyTurnRule(enemy);
            if (enemyIsPreparing(enemy)) return 'Si prepara: questo turno non attacca, il prossimo colpirà';
            const base = r.turnoDanno != null ? r.turnoDanno : enemy.dmg;
            const dmg = base + (hasCurse('presagio_di_morte') ? 1 : 0) + (r.turnoCrescitaDanno || 0);
            const danni = `<b>${dmg} ${dmg === 1 ? 'danno' : 'danni'}</b>`;
            const mode = r.turnoBersaglio || 'scelto';
            const preda = mode === 'piu_debole' || mode === 'piu_forte' ? eliteTargets(mode)[0] : null;
            const chi = mode === 'tutti' ? 'tutta la compagnia'
                : mode === 'casuale' ? 'un eroe a caso'
                : mode === 'piu_debole' ? `${preda ? `<b>${esc(preda.name)}</b>` : 'il più debole'} (meno HP + armatura)`
                : mode === 'piu_forte' ? `${preda ? `<b>${esc(preda.name)}</b>` : 'il più forte'} (più HP + armatura)`
                : 'il bersaglio';
            const parti = [];
            if (r.turnoRigenera) parti.push(`Rigenera ${r.turnoRigenera} HP`);
            if (r.turnoAura) parti.push(`fa ${r.turnoAura} ${r.turnoAura === 1 ? 'danno' : 'danni'} a tutti`);
            let colpo = `${r.turnoVicini ? 'Travolgerà' : 'Attaccherà'} ${chi} per ${danni}`;
            if ((r.turnoColpi || 1) > 1) colpo += `, ${r.turnoColpi} volte`;
            if (r.turnoVicini) colpo += ` e farà ${r.turnoVicini} ${r.turnoVicini === 1 ? 'danno' : 'danni'} agli eroi accanto`;
            parti.push(parti.length ? colpo.charAt(0).toLowerCase() + colpo.slice(1) : colpo);
            let testo = parti.join(', poi ');
            if (r.turnoCrescitaDanno) testo += ` (+${r.turnoCrescitaDanno} a ogni turno)`;
            if (r.turnoRubaVita) testo += '; si cura dei danni inflitti';
            return testo;
        }

        // 11. Passando su "Attacca" o sull'abilità, la parte di vita che il colpo toglierebbe lampeggia
        function expectedHitDamage(hero, action) {
            if (!hero || !stato.activeEnemy) return 0;
            const enemy = stato.activeEnemy;
            const itemDmg = specialHitDamagePreview(hero, enemy);  // danni in più degli effetti speciali sicuri
            let dmg = hero.dmg + helpDmgBonus() + itemDmg;
            const c = action === 'ability' ? abilityCombat(hero.chosenAbility) : null;
            if (c && c.armorGain) return 0;  // solo armatura: nessun danno al nemico
            // Somma esatta: sconfitto, o a metà vita se elite o boss
            if (c && c.sumTarget) return currentEnemyIsEliteOrBoss() ? Math.max(0, enemy.hp - Math.floor(enemy.maxHp / 2)) : Math.max(0, enemy.hp);
            if (c) dmg = abilityHitDamage(hero, c, 0) + itemDmg;
            return Math.max(0, dmg);
        }

        function combatRollUsesTwoDice(hero, action) {
            const c = action === 'ability' && hero ? abilityCombat(hero.chosenAbility) : null;
            return !!c && ((c.dice === 2 && !c.autoHit) || !!c.sumTarget);
        }

    // API del modulo: window.Motore.scontro. Gli stessi nomi restano anche globali (Object.assign su window),
    // perché interfaccia, simulatore e test li chiamano per nome. Funzioni solo interne: afterHeroHit, heroHitLastTurn, abilityHitDamage, eliteAction, heroesNextTo, strongestTarget, monsterStrike.
    const api = {
        firstActorBonus, helpDmgBonus, startCombatSpecials, specialHitEffects, rollPartsText, resolveAttack,
        defendArmorGain, resolveDefend, resolveHelp, abilityCombat, abilityStatBonus, abilityUsable,
        currentEnemyIsEliteOrBoss, abilityIsInstant, abilitySpecialEffects, resolveAbility, resolveMonsterAttack, legacyPhaseActions,
        phaseActions, eliteTargets, predatorTarget, applyEliteAction, eliteReaction, checkEnemyPhases,
        checkEnemyRoundPhases, enemyTurnRule, enemyIsPreparing, enemyChosenTarget, preparationText, resolveEnemyTurn,
        applyHeroStuns, enemyIntentText, expectedHitDamage, combatRollUsesTwoDice
    };
    window.Motore = window.Motore || {};
    window.Motore.scontro = api;
    Object.assign(window, api);
})();
