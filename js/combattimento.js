/* ==========================================================================
   COMBATTIMENTO
   Motore puro di risoluzione (usato anche da js/simulator.js), abilità attive
   descritte dal campo "combat", turni degli eroi e del nemico.
   Diviso da js/game.js: stesso ambito globale (usa stato, LIBRERIA, showScreen...).
   Caricato dopo js/game.js; le funzioni si chiamano tra file solo dopo il caricamento
   (l'avvio vero e proprio è in js/avvio.js, caricato per ultimo).
   ========================================================================== */

        /* ==========================================================================
           LOGICA COMBATTIMENTO ED ESECUZIONE ABILITA'
           ========================================================================== */
        // Nemico, bonus di Aiuta e round dello scontro stanno in "stato" (js/game.js)
        let chosenAction = null;
        let currentActiveHero = null;

        /* ==========================================================================
           MOTORE PURO DI RISOLUZIONE (nessun accesso al DOM)
           Estratto dalle funzioni di combattimento/sfida/mercante/tesoro/riposo perché
           sia l'interfaccia (con animazioni) sia js/simulator.js (senza) usino la
           STESSA matematica: le percentuali del simulatore restano sempre vere.
           Leggono/scrivono lo stesso oggetto "stato" (stato.party, stato.activeEnemy,
           stato.helpBonus, stato.combatRound, stato.unlockedRelics, ...): chi le chiama
           in un contesto simulato deve prima impostare quei campi.
           ========================================================================== */

        // Tiro di un d6: se "rolls[i]" è un numero 1-6 lo usa (tiro deciso da un telefono collegato via QR),
        // altrimenti tira normalmente. Tutti i resolver sotto accettano "rolls" come ultimo parametro opzionale.
        // Ogni dado degli eroi viene contato in expeditionStats.diceRolls (statistiche nel Diario).
        function rollD6(rolls, i) {
            const external = rolls && rolls[i];
            const value = (typeof external === 'number' && external >= 1 && external <= 6) ? external : Math.floor(Math.random() * 6) + 1;
            const st = stato.expeditionStats;
            if (st) (st.diceRolls = st.diceRolls || [0, 0, 0, 0, 0, 0])[value - 1]++;
            return value;
        }

        // Regola del dado naturale per tutti i tiri degli eroi: un 6 sul dado (quello tenuto, con due dadi)
        // riesce sempre, un 1 fallisce sempre, qualunque siano bonus e difficoltà.
        function naturalRollSuccess(roll, total, target) {
            if (roll === 6) return true;
            if (roll === 1) return false;
            return total >= target;
        }

        // Testo per il diario quando il dado naturale ha cambiato l'esito (null se non l'ha cambiato)
        function naturalRollNote(roll, total, target) {
            if (roll === 6 && total < target) return '🎲 6 naturale: successo garantito!';
            if (roll === 1 && total >= target) return '🎲 1 naturale: fallimento garantito!';
            return null;
        }

        // Bonus delle reliquie a tutti i tiri di dado degli eroi (combattimento, prove, contrattazione, capitano):
        // frammento_di_yr_drazul +1 sempre; anello_del_giuramento +3 e sigillo_runico +2 solo al prossimo tiro
        // (si consumano con spendNextRollRelics dopo il tiro). Le anteprime lo leggono senza consumarlo.
        function relicDiceSources() {
            const out = [];
            // nextRoll: vale solo per il prossimo tiro (si consuma con spendNextRollRelics)
            if (hasRelic('frammento_di_yr_drazul')) out.push({ id: 'frammento_di_yr_drazul', name: relicName('frammento_di_yr_drazul'), val: 1 });
            if (hasRelic('anello_del_giuramento')) out.push({ id: 'anello_del_giuramento', name: relicName('anello_del_giuramento'), val: 3, nextRoll: true });
            if (hasRelic('sigillo_runico')) out.push({ id: 'sigillo_runico', name: relicName('sigillo_runico'), val: 2, nextRoll: true });
            return out;
        }

        function relicDiceBonus() {
            return relicDiceSources().reduce((sum, r) => sum + r.val, 0);
        }

        // Dopo un tiro di dado di un eroe: l'Anello si rompe, il Sigillo consuma una carica (2 in tutto).
        // Ritorna le note per il diario.
        function spendNextRollRelics() {
            const notes = [];
            if (hasRelic('anello_del_giuramento')) {
                breakRelic('anello_del_giuramento');
                notes.push(`${relicName('anello_del_giuramento')} si rompe`);
            }
            if (hasRelic('sigillo_runico')) {
                stato.party.sigilloCharges = (stato.party.sigilloCharges || 0) + 1;
                const broken = stato.party.sigilloCharges >= 2;
                if (broken) { breakRelic('sigillo_runico'); stato.party.sigilloCharges = 0; }
                notes.push(broken ? `${relicName('sigillo_runico')} si rompe` : `${relicName('sigillo_runico')}: resta 1 tiro`);
            }
            return notes;
        }

        // Bonus delle reliquie a tiro per colpire (att) e danno (dmg) in questo round di combattimento.
        // Valgono per l'attacco E per le abilità d'attacco; "notes" finisce nel log.
        function relicCombatBonus() {
            // Elite, capitano e boss dell'ultimo livello
            const isElite = currentEnemyIsEliteOrBoss();
            const b = { att: 0, dmg: 0, notes: [] };
            const add = (when, id, att, dmg) => {
                if (!when || !hasRelic(id)) return;
                b.att += att; b.dmg += dmg;
                b.notes.push(`${relicName(id)} (${att ? `+${att} al tiro` : `+${dmg} danno`})`);
            };
            add(stato.combatRound === 1, 'stendardo_da_battaglia', 1, 0);
            add(stato.combatRound === 2, 'zanna_del_leone_bianco', 0, 2);
            add(stato.combatRound === 3, 'corno_antico', 0, 1);
            add(isElite, 'idolo_del_cacciatore', 0, 1);
            add(isElite, 'catena_di_norgrad', 1, 0);
            relicDiceSources().forEach(r => { b.att += r.val; b.notes.push(`${r.name} (+${r.val} al tiro)`); });
            return b;
        }

        // Passiva "Libertas in furor" (hero_set firstActorStrBonus): +Forza al tiro (attacco, abilità, Difendi,
        // Aiuta) se l'eroe è il primo ad agire nel round.
        // È il primo se nessun altro eroe vivo ha già agito (usare un oggetto non conta: non consuma l'azione).
        function firstActorBonus(hero) {
            if (!hero || !hero.firstActorStrBonus) return 0;
            const first = stato.party.every(h => h === hero || h.hp <= 0 || !h.hasActed);
            return first ? hero.firstActorStrBonus : 0;
        }

        // Passiva "Veleni ed altri composti" (hero_set helpDmgBonus): un Aiuta riuscito dà anche +danno
        // al prossimo attacco o abilità; vale fino alla fine del round (azzerato da startHeroesTurnCycle)
        function helpDmgBonus() {
            return stato.helpDmgBonus || 0;
        }

        // Voci di un tiro per il diario: " + Forza 3 + Aiuto 1 − 1 Mod." (le voci a 0 si saltano)
        function rollPartsText(parts) {
            return parts.filter(p => p.val).map(p => ` ${p.val > 0 ? '+' : '−'} ${p.label} ${Math.abs(p.val)}`).join('');
        }

        // Tiro di attacco: muta enemy.hp, consuma helpBonus e helpDmgBonus. Ritorna l'esito per log/DOM.
        function resolveAttack(hero, enemy, rolls) {
            const roll = rollD6(rolls, 0);
            const rb = relicCombatBonus();
            const first = firstActorBonus(hero);
            const helpDmg = helpDmgBonus();
            const parts = [{ label: 'Forza', val: hero.str }, { label: 'Libertas', val: first }, { label: 'Aiuto', val: stato.helpBonus }, { label: 'Mod.', val: attackMod(hero) }, { label: 'Reliquie', val: rb.att }];
            const total = roll + hero.str + first + stato.helpBonus + attackMod(hero) + rb.att;
            stato.helpBonus = 0;
            stato.helpDmgBonus = 0;
            const spent = spendNextRollRelics();

            const hit = naturalRollSuccess(roll, total, enemy.ca);
            let dmg = 0;
            if (hit) {
                dmg = hero.dmg + rb.dmg + helpDmg;
                enemy.hp -= dmg;
            }
            return { roll, total, parts, hit, dmg, firstBonus: first, helpDmgBonus: helpDmg, relicAttBonus: rb.att, relicNotes: [...rb.notes, ...spent], naturalNote: naturalRollNote(roll, total, enemy.ca) };
        }

        // Armatura che un tiro di difesa riuscito dà all'eroe: 1, più quella degli scudi (def_armor)
        function defendArmorGain(hero) {
            return 1 + Math.max(0, hero.def_armor || 0);
        }

        // Tiro di difesa: in caso di successo aggiunge armatura corrente all'eroe (vedi defendArmorGain).
        // Gli scudi più forti danno anche def_bonus, che si somma al tiro.
        function resolveDefend(hero, enemy, rolls) {
            const roll = rollD6(rolls, 0);
            const sources = relicDiceSources();
            const first = firstActorBonus(hero);
            const parts = [{ label: 'Forza', val: hero.str }, { label: 'Libertas', val: first }, { label: 'Scudo', val: hero.def_bonus || 0 }, { label: 'Reliquie', val: relicDiceBonus() }];
            const total = roll + hero.str + first + (hero.def_bonus || 0) + relicDiceBonus();
            const spent = spendNextRollRelics();
            const success = naturalRollSuccess(roll, total, enemy.att);
            const gained = success ? defendArmorGain(hero) : 0;
            hero.current_armor += gained;
            return { roll, total, parts, success, gained, naturalNote: naturalRollNote(roll, total, enemy.att),
                relicNotes: [...sources.map(r => `${r.name} (+${r.val} al tiro)`), ...spent] };
        }

        // Tiro di aiuto: in caso di successo imposta il bonus +1 al prossimo attacco/abilità
        // (e, con la passiva helpDmgBonus, anche +danno fino alla fine del round).
        function resolveHelp(hero, enemy, rolls) {
            const roll = rollD6(rolls, 0);
            const sources = relicDiceSources();
            const first = firstActorBonus(hero);
            const parts = [{ label: 'Forza', val: hero.str }, { label: 'Libertas', val: first }, { label: 'Aiuto', val: hero.help_bonus_val || 0 }, { label: 'Reliquie', val: relicDiceBonus() }];
            const total = roll + hero.str + first + (hero.help_bonus_val || 0) + relicDiceBonus();
            const spent = spendNextRollRelics();
            const success = naturalRollSuccess(roll, total, enemy.att);
            let dmgBonus = 0;
            if (success) {
                stato.helpBonus = 1;
                dmgBonus = hero.helpDmgBonus || 0;
                if (dmgBonus) stato.helpDmgBonus = dmgBonus;
            }
            return { roll, total, parts, success, dmgBonus, naturalNote: naturalRollNote(roll, total, enemy.att),
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

        // Probabilità che due dadi diano esattamente "target" come somma (7 = 6 casi su 36)
        function exactSumChance(target) {
            let ways = 0;
            for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === target) ways++;
            return ways / 36;
        }

        // Abilità senza tiro di dado (es. armorGain): si risolve appena scelta, senza il pannello dei dadi
        function abilityIsInstant(hero) {
            const c = hero && abilityCombat(hero.chosenAbility);
            return !!(c && c.armorGain);
        }

        // Risolve l'abilità attiva in combattimento: muta enemy.hp (e isStunned), consuma helpBonus.
        function resolveAbility(hero, enemy, rolls) {
            hero.abilityUsedThisCombat = true;
            const abId = hero.chosenAbility.id;
            const c = abilityCombat(hero.chosenAbility);
            if (!c) return { abId, hit: false, dmg: 0, noEffect: true, relicNotes: [] };

            // Armatura immediata: nessun tiro, il bonus di Aiuta resta per il prossimo
            if (c.armorGain) {
                hero.current_armor += c.armorGain;
                return { abId, instant: true, gained: c.armorGain, hit: false, dmg: 0, relicNotes: [] };
            }
            // Somma esatta (es. "7"): conta solo la somma dei due dadi, il bonus di Aiuta resta per il prossimo
            if (c.sumTarget) {
                const dice = [rollD6(rolls, 0), rollD6(rolls, 1)];
                const sum = dice[0] + dice[1];
                const hit = sum === c.sumTarget;
                const eliteHalf = hit && currentEnemyIsEliteOrBoss();
                const before = enemy.hp;
                // Metà vita arrotondata per difetto, come le soglie delle fasi: quella al 50% scatta
                if (hit) enemy.hp = eliteHalf ? Math.min(enemy.hp, Math.floor(enemy.maxHp / 2)) : 0;
                return { abId, sumRoll: true, dice, d1: dice[0], d2: dice[1], roll: sum, total: sum, hit, eliteHalf,
                    dmg: Math.max(0, before - enemy.hp), naturalNote: null, relicNotes: [] };
            }
            const rb = relicCombatBonus();
            const attStat = abilityStatBonus(hero, c.attackStat);
            const taken = c.damageTakenBonus ? heroHitLastTurn(hero) : 0;
            const firstBonus = firstActorBonus(hero);
            const helpDmg = helpDmgBonus();
            const dmg = abilityHitDamage(hero, c, rb.dmg);
            stato.helpDmgBonus = 0;
            // Colpo automatico: niente tiro, vale come un 6 naturale (il bonus di Aiuta resta per il prossimo)
            if (c.autoHit) {
                enemy.hp -= dmg;
                if (c.stun) enemy.isStunned = true;
                return { abId, autoHit: true, dice: [6], d1: 6, roll: 6, total: 6, hit: true, dmg, attStat, taken, firstBonus, helpDmgBonus: helpDmg, naturalNote: null,
                    dmgStat: abilityStatBonus(hero, c.damageStat), relicDmgBonus: rb.dmg, relicNotes: rb.notes };
            }
            const dice = c.dice === 2 ? [rollD6(rolls, 0), rollD6(rolls, 1)] : [rollD6(rolls, 0)];
            const roll = Math.max(...dice);
            const parts = [{ label: 'Forza', val: hero.str }, { label: 'Libertas', val: firstBonus }, { label: STAT_LABELS[c.attackStat] || 'Stat.', val: attStat }, { label: hero.chosenAbility.name, val: c.attackBonus || 0 },
                { label: 'Aiuto', val: stato.helpBonus }, { label: 'Mod.', val: attackMod(hero) }, { label: 'Reliquie', val: rb.att }];
            const total = roll + hero.str + firstBonus + attStat + (c.attackBonus || 0) + stato.helpBonus + attackMod(hero) + rb.att;
            stato.helpBonus = 0;
            rb.notes.push(...spendNextRollRelics());
            const hit = naturalRollSuccess(roll, total, enemy.ca);
            if (hit) {
                enemy.hp -= dmg;
                if (c.stun) enemy.isStunned = true;
            }
            return { abId, dice, d1: dice[0], d2: dice[1], roll, total, parts, hit, dmg, attStat, taken, firstBonus, helpDmgBonus: helpDmg, naturalNote: naturalRollNote(roll, total, enemy.ca),
                dmgStat: abilityStatBonus(hero, c.damageStat), relicDmgBonus: rb.dmg, relicNotes: rb.notes };
        }

        // Attacco del mostro su un bersaglio: applica maledizioni/reliquie, armatura, poi HP.
        // "events" descrive in ordine cosa è successo, per il log di combattimento.
        // opts.dmg: danno diverso da quello del nemico; opts.splash: colpo di contorno (travolgimento agli
        // eroi accanto): niente Presagio di Morte né Scudo dell'Atamano, che valgono solo per il colpo vero
        function resolveMonsterAttack(enemy, target, opts = {}) {
            const events = [];
            let dmg = opts.dmg != null ? opts.dmg : enemy.dmg;
            const armorBefore = target.current_armor;
            const hpBefore = target.hp;

            if (!opts.splash && hasCurse('presagio_di_morte')) {
                dmg += 1;
                events.push({ type: 'curse_bonus', text: '💀 Presagio di Morte: il colpo infligge 1 danno in più.' });
            }

            if (!opts.splash && hasRelic('scudo_dell_atamano') && !stato.party.atamanoUsed) {
                stato.party.atamanoUsed = true;
                dmg = 0;
                events.push({ type: 'atamano', text: "🛡️ Lo Scudo dell'Atamano assorbe completamente il primo colpo del combattimento!" });
            }

            // Passiva "Neanche un graffio" (hero_set dodgeNoArmor: N): colpito senza armatura,
            // l'eroe tira un d6 e con N o più ignora del tutto il colpo
            if (dmg > 0 && target.current_armor <= 0 && target.dodgeNoArmor) {
                const dodgeRoll = rollD6(null, 0);
                if (dodgeRoll >= target.dodgeNoArmor) {
                    events.push({ type: 'dodge', roll: dodgeRoll, text: `🍃 Neanche un graffio! ${target.name} tira ${dodgeRoll} (serve ${target.dodgeNoArmor}+) ed evita il colpo.` });
                    dmg = 0;
                } else {
                    events.push({ type: 'dodge_fail', roll: dodgeRoll, text: `${target.name} prova a schivare: ${dodgeRoll} (serve ${target.dodgeNoArmor}+), non basta.` });
                }
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
                // Passiva "Tanto ho tenacia" (hero_set tenacityRevive: N): la prima volta che l'eroe
                // andrebbe a 0 HP torna in piedi con N HP; una volta per campagna (tenacityUsed resta sull'eroe)
                if (target.hp - dmg <= 0 && target.tenacityRevive && !target.tenacityUsed) {
                    target.tenacityUsed = true;
                    target.hp = Math.min(target.maxHp, target.tenacityRevive);
                    events.push({ type: 'tenacia', text: `💪 ${target.name} crolla a terra... ma si rialza con ${target.hp} HP: tanto ho tenacia!` });
                } else if (target.hp - dmg <= 0 && hasRelic('marchio_di_jag_antar')) {
                    target.hp = 1;
                    breakRelic('marchio_di_jag_antar');
                    events.push({ type: 'marchio', text: `✨ Il Marchio di Jag Antar si infrange, salvando ${target.name} da morte certa!` });
                } else {
                    hpDamage = dmg;
                    target.hp = Math.max(0, target.hp - dmg);
                    targetDied = target.hp <= 0;
                    events.push({ type: 'hp_damage', amount: dmg, text: `${target.name} subisce ${dmg} danni agli HP!` });
                }
            }

            // Per "Dente per dente": quanto ha perso l'eroe in questo colpo (armatura + HP) e in quale round
            target.lastHitDamage = Math.max(0, armorBefore - target.current_armor) + Math.max(0, hpBefore - target.hp);
            target.lastHitRound = stato.combatRound;

            return { events, hpDamage, targetDied };
        }

        /* ---------- Fasi dei nemici (elite e boss) ----------
           Nel bestiario: "fasi": [{ soglia, testo, schema, reazione, bonusDanno, ruggito }].
           soglia: % di vita; la prima volta che il nemico scende a quel valore o sotto, la fase scatta
             (una volta sola; se un colpo ne supera più d'una scattano tutte, in ordine).
           schema (da quel momento): "carica" (travolge il bersaglio e fa 1 danno agli eroi accanto:
             subito al primo turno dopo la soglia, poi un turno raspa il terreno e quello dopo travolge), "travolge" (travolge
             a ogni turno, senza pause), "predatore" (attacca da solo l'eroe con meno
             HP + armatura), "furia" (+1 danno a ogni suo turno).
           reazione (al suo turno successivo, al posto dell'attacco normale, contro l'eroe che ha fatto
             scattare la soglia): "contrattacco" (un colpo), "colpo_area" (un colpo più 1 danno agli eroi accanto).
           bonusDanno: + al danno del nemico. ruggito: { malus, fedeMin }: -malus al tiro per colpire
             nel prossimo turno degli eroi, per chi ha Fede sotto fedeMin. */
        const ENEMY_SCHEMES = {
            carica: 'Carica: un turno raspa il terreno, il successivo travolge il bersaglio e fa 1 danno agli eroi accanto',
            travolge: 'Travolge a ogni turno: colpo pieno al bersaglio e 1 danno agli eroi accanto',
            predatore: "Predatore: sceglie da solo l'eroe con meno HP + armatura",
            furia: '+1 danno a ogni suo turno'
        };
        const ENEMY_REACTIONS = {
            contrattacco: "al suo turno colpisce l'eroe che lo ha ferito",
            colpo_area: "al suo turno colpisce l'eroe che lo ha ferito e fa 1 danno agli eroi accanto"
        };

        // Eroi vivi accanto al bersaglio nell'ordine della compagnia (travolgimento e colpo ad area)
        function heroesNextTo(target) {
            const idx = stato.party.indexOf(target);
            return [stato.party[idx - 1], stato.party[idx + 1]].filter(h => h && h.hp > 0);
        }

        // Bersaglio dello schema "predatore": l'eroe vivo con meno HP + armatura (a parità, il primo)
        function predatorTarget() {
            const alive = stato.party.filter(h => h.hp > 0);
            return alive.reduce((best, h) => (!best || h.hp + h.current_armor < best.hp + best.current_armor) ? h : best, null);
        }

        // Colpo con travolgimento: il bersaglio subisce il colpo intero, gli eroi accanto 1 danno
        function monsterStrikeWithSplash(enemy, target) {
            const events = resolveMonsterAttack(enemy, target).events;
            heroesNextTo(target).forEach(n => {
                events.push({ type: 'splash', text: `Travolto anche ${n.name}!` });
                events.push(...resolveMonsterAttack(enemy, n, { dmg: 1, splash: true }).events);
            });
            return events;
        }

        // Bersaglio della reazione preparata (l'eroe che ha fatto scattare la soglia; se è caduto, nessuno)
        function reactionTarget(enemy) {
            const r = enemy.reazionePronta;
            const hero = r && stato.party.find(h => h.name === r.bersaglio && h.hp > 0);
            return hero || null;
        }

        // Controlla le soglie dopo un colpo dell'eroe "attacker". Applica le fasi scattate e ritorna gli eventi
        // (type 'phase' con il testo della fase, poi le informazioni) per diario e interfaccia.
        // La reazione non colpisce adesso: resta pronta per il turno del nemico (enemy.reazionePronta).
        function checkEnemyPhases(enemy, attacker) {
            const events = [];
            const fasi = enemy.fasi || [];
            if (!fasi.length || enemy.hp <= 0) return events;
            enemy.fasiFatte = enemy.fasiFatte || [];
            fasi.forEach((f, i) => {
                if (enemy.fasiFatte.includes(i) || enemy.hp <= 0) return;
                if (enemy.hp > Math.floor(enemy.maxHp * f.soglia / 100)) return;
                enemy.fasiFatte.push(i);
                events.push({ type: 'phase', text: f.testo || `${enemy.name} cambia atteggiamento!` });
                if (f.bonusDanno) { enemy.dmg += f.bonusDanno; events.push({ type: 'phase_info', text: `${enemy.name}: +${f.bonusDanno} danno.` }); }
                // la carica della fase è già pronta: al primo turno del nemico travolge subito, poi alterna
                if (f.schema) { enemy.schema = f.schema; enemy.charging = f.schema === 'carica'; events.push({ type: 'phase_info', text: `Nuovo schema d'attacco: ${ENEMY_SCHEMES[f.schema] || f.schema}.` }); }
                if (f.ruggito) {
                    stato.party.filter(h => h.hp > 0).forEach(h => {
                        if ((h.fth || 0) >= (f.ruggito.fedeMin || 99)) { events.push({ type: 'phase_info', text: `${h.name} resiste al ruggito grazie alla Fede.` }); return; }
                        scheduleTempBuff(h, { stat: 'att_bonus', val: -(f.ruggito.malus || 1), name: 'Ruggito primordiale', rounds: 1 });
                        events.push({ type: 'phase_info', text: `${h.name} è scosso: -${f.ruggito.malus || 1} al tiro per colpire nel prossimo turno.` });
                    });
                }
                if (f.reazione && attacker && attacker.hp > 0) {
                    enemy.reazionePronta = { tipo: f.reazione, bersaglio: attacker.name };
                    events.push({ type: 'phase_info', text: `Al suo turno ${enemy.name} si scaglierà contro ${attacker.name}!` });
                }
            });
            return events;
        }

        // Turno del nemico secondo il suo schema. chosenTarget = bersaglio scelto dal giocatore (o dal simulatore).
        // Ritorna { events, attacked, target }. "attacked" è falso nel turno in cui carica.
        function resolveEnemyTurn(enemy, chosenTarget) {
            const events = [];
            if (enemy.schema === 'furia') {
                enemy.dmg += 1;
                events.push({ type: 'fury', text: `${enemy.name} è sempre più furioso: ora fa ${enemy.dmg} danni.` });
            }
            if (enemy.schema === 'carica' && !enemy.charging) {
                enemy.charging = true;
                events.push({ type: 'charge', text: `${enemy.name} raspa il terreno: al prossimo turno travolgerà la compagnia!` });
                return { events, attacked: false, target: null };
            }
            // Reazione preparata alla soglia: al posto dell'attacco normale, contro chi l'ha fatta scattare
            const reazione = enemy.reazionePronta;
            if (reazione) {
                enemy.reazionePronta = null;
                const bersaglio = stato.party.find(h => h.name === reazione.bersaglio && h.hp > 0);
                if (bersaglio) {
                    events.push({ type: 'reaction', text: `${enemy.name} si scaglia contro ${bersaglio.name}!` });
                    events.push(...(reazione.tipo === 'colpo_area' ? monsterStrikeWithSplash(enemy, bersaglio) : resolveMonsterAttack(enemy, bersaglio).events));
                    return { events, attacked: true, target: bersaglio };
                }
            }
            // Predatore: il bersaglio annunciato a inizio turno (announcedPrey), se è ancora in piedi
            const announced = enemy.announcedPrey && stato.party.find(h => h.name === enemy.announcedPrey && h.hp > 0);
            enemy.announcedPrey = null;
            const target = enemy.schema === 'predatore' ? (announced || predatorTarget()) : chosenTarget;
            if (!target) return { events, attacked: false, target: null };
            if (enemy.schema === 'carica' || enemy.schema === 'travolge') {
                enemy.charging = false;
                events.push(...monsterStrikeWithSplash(enemy, target));
            } else {
                events.push(...resolveMonsterAttack(enemy, target).events);
            }
            return { events, attacked: true, target };
        }

        function startCombat(enemyKey) {
    showScreen('screenCombat');
    stato.activeEnemy = JSON.parse(JSON.stringify(enemies[enemyKey]));
    discover('enemies', String(enemyKey).replace(/__l\d+$/, ''));  // Drakengrad: "cinghiali__l3" -> "cinghiali"
    stato.activeEnemy.isStunned = false;
    
    // Reliquia: occhio_del_corvo
    if (hasRelic('occhio_del_corvo')) stato.activeEnemy.att = Math.max(1, stato.activeEnemy.att - 1);
    
    // Flag per Scudo dell'Atamano
    stato.party.atamanoUsed = false;

    stato.helpBonus = 0;
    stato.helpDmgBonus = 0;

            document.getElementById('combatDescBox').innerHTML = `<strong>Descrizione:</strong> ${kw(stato.activeEnemy.desc)}`;

            expireTempBuffs(true);  // per sicurezza: nessun potenziamento rimasto da uno scontro precedente
            stato.party.forEach(h => {
                if(h.hp > 0) {
                    h.current_armor = h.base_armor;
                    h.abilityUsedThisCombat = false;
                } else {
                    h.current_armor = 0;
                }
                delete h.lastHitRound;
                delete h.lastHitDamage;
            });
            fxResyncHeroes();
            stato.combatRound = 0;
            impostaAzione(document.getElementById('combatNextBtn'), 'proceedCombatPhase');  // nessun 'Avanti' rimasto da uno scontro precedente
            document.getElementById('combatLootBtn').classList.remove('btn-attention');

            document.getElementById('combatLog').innerHTML = `Combatti contro ${stato.activeEnemy.name}! (Armature e Abilità ripristinate)<br>`;
            startHeroesTurnCycle();
        }

        function logRelicNotes(res) {
            if (res && res.relicNotes && res.relicNotes.length) logCombat(`💎 Reliquie: ${res.relicNotes.join(', ')}`);
        }

        function logNaturalRoll(res) {
            if (res && res.naturalNote) logCombat(res.naturalNote);
        }

        function logCombat(text) {
            const log = document.getElementById('combatLog');
            log.innerHTML += text + "<br>";
            log.scrollTop = log.scrollHeight;
        }

        function updateEnemyInfoUI() {
            let hpPercent = clampPct(stato.activeEnemy.hp, stato.activeEnemy.maxHp);
            let stunBadge = stato.activeEnemy.isStunned ? `<span class="stun-badge">Stordito</span>` : '';

            document.getElementById('enemyInfo').innerHTML = `
                <div class="enemy-head">
                    <div class="icon-frame enemy-emblem">${svgIcon('skull')}</div>
                    <div class="enemy-main">
                        <div class="enemy-name" data-tip="${esc(enemyPhasesTip(stato.activeEnemy))}">${stato.activeEnemy.name}${stunBadge}${stato.activeEnemy.schema ? `<span class="stun-badge phase-badge">${esc({ carica: 'Carica', travolge: 'Travolge', predatore: 'Predatore', furia: 'Furia' }[stato.activeEnemy.schema] || stato.activeEnemy.schema)}</span>` : ''}</div>
                        <div class="hp-bar-container big" id="enemyHpBar">
                            ${barGhostHtml(`enemy:${stato.activeEnemy.name}`, hpPercent, Math.max(0, stato.activeEnemy.hp))}
                            <div class="hp-bar-fill ${hpClass(hpPercent)}" style="width: ${hpPercent}%;"></div>
                            <div class="hp-bar-preview hidden"></div>
                            ${enemyPhaseTicksHtml(stato.activeEnemy)}
                            <div class="hp-bar-text">${Math.max(0, stato.activeEnemy.hp)} / ${stato.activeEnemy.maxHp}</div>
                        </div>
                    </div>
                </div>
                <div class="enemy-stats">
                    <span data-tip="Classe Armatura||Il totale di Forza + d6 necessario per colpire.">${svgIcon('shield')} CA <b>${stato.activeEnemy.ca}</b></span>
                    <span data-tip="Attacco||Il totale necessario per difendersi o aiutare.">${svgIcon('sword')} Att <b>${stato.activeEnemy.att}</b></span>
                    <span data-tip="Danno||Danni inflitti a ogni attacco del nemico.">${svgIcon('drop')} Dmg <b>${stato.activeEnemy.dmg}</b></span>
                </div>
            `;
            document.getElementById('enemyIntent').innerHTML = enemyIntentHtml(stato.activeEnemy);
            fxDiffEnemy();
            animateBars(document.getElementById('enemyInfo'));
        }

        // Tacche delle soglie sulla barra della vita: piene finché la fase non è scattata
        function enemyPhaseTicksHtml(enemy) {
            return (enemy.fasi || []).map((f, i) => `<span class="hp-phase-tick ${(enemy.fasiFatte || []).includes(i) ? 'done' : ''}" style="left:${f.soglia}%"></span>`).join('');
        }

        // Tooltip del nome del nemico: schema attuale e fasi (fatte e da venire)
        function enemyPhasesTip(enemy) {
            const lines = [];
            if (enemy.schema) lines.push(`<b>Ora:</b> ${ENEMY_SCHEMES[enemy.schema] || enemy.schema}`);
            (enemy.fasi || []).forEach((f, i) => {
                const fatta = (enemy.fasiFatte || []).includes(i);
                const parti = [];
                if (f.reazione) parti.push(ENEMY_REACTIONS[f.reazione] || f.reazione);
                if (f.bonusDanno) parti.push(`+${f.bonusDanno} danno`);
                if (f.schema) parti.push(ENEMY_SCHEMES[f.schema] || f.schema);
                if (f.ruggito) parti.push(`ruggito: -${f.ruggito.malus || 1} al tiro nel turno dopo (non per chi ha Fede ${f.ruggito.fedeMin}+)`);
                lines.push(`${fatta ? '✓' : '◆'} Al ${f.soglia}% di vita: ${parti.join('; ')}`);
            });
            return `${enemy.name}||${lines.length ? lines.join('<br>') : 'Nessuna fase particolare.'}`;
        }

        // Intenzione del nemico: cosa farà al suo turno (secondo il suo schema d'attacco)
        function enemyIntentHtml(enemy) {
            if (!enemy || enemy.hp <= 0) return '';
            if (enemy.isStunned) {
                return `<span class="intent-icon stunned">${svgIcon('skull')}</span>
                    <span class="intent-text"><small>Intenzione</small><span>Stordito: salta il prossimo attacco</span></span>`;
            }
            const dmg = enemy.dmg + (hasCurse('presagio_di_morte') ? 1 : 0) + (enemy.schema === 'furia' ? 1 : 0);
            const danni = `<b>${dmg} ${dmg === 1 ? 'danno' : 'danni'}</b>`;
            let cosa = `Attaccherà per ${danni}`;
            const vendetta = reactionTarget(enemy);
            if (vendetta) cosa = `Si scaglierà contro <b>${esc(vendetta.name)}</b> per ${danni}${enemy.reazionePronta.tipo === 'colpo_area' ? ' e farà 1 danno agli eroi accanto' : ''}`;
            else if (enemy.schema === 'carica') cosa = enemy.charging
                ? `Travolgerà il bersaglio per ${danni} e farà 1 danno agli eroi accanto`
                : 'Raspa il terreno: questo turno non attacca, il prossimo travolgerà';
            else if (enemy.schema === 'travolge') cosa = `Travolgerà il bersaglio per ${danni} e farà 1 danno agli eroi accanto`;
            else if (enemy.schema === 'predatore') {
                const preda = predatorTarget();
                cosa = `Punta ${preda ? `<b>${esc(preda.name)}</b>` : 'il più debole'} (meno HP + armatura) per ${danni}`;
            } else if (enemy.schema === 'furia') cosa = `In furia: attaccherà per ${danni} (+1 a ogni turno)`;
            return `<span class="intent-icon ${enemy.schema === 'carica' && !enemy.charging ? 'stunned' : ''}">${svgIcon('sword')}</span>
                <span class="intent-text"><small>Intenzione</small><span>${cosa}</span>
                <em>Difendi e Aiuta devono arrivare a ${enemy.att}</em></span>`;
        }

        // 11. Passando su "Attacca" o sull'abilità, la parte di vita che il colpo toglierebbe lampeggia
        function expectedHitDamage(hero, action) {
            if (!hero || !stato.activeEnemy) return 0;
            const enemy = stato.activeEnemy;
            let dmg = hero.dmg + relicCombatBonus().dmg + helpDmgBonus();
            const c = action === 'ability' ? abilityCombat(hero.chosenAbility) : null;
            if (c && c.armorGain) return 0;  // solo armatura: nessun danno al nemico
            // Somma esatta: sconfitto, o a metà vita se elite o boss
            if (c && c.sumTarget) return currentEnemyIsEliteOrBoss() ? Math.max(0, enemy.hp - Math.floor(enemy.maxHp / 2)) : Math.max(0, enemy.hp);
            if (c) dmg = abilityHitDamage(hero, c, relicCombatBonus().dmg);
            return Math.max(0, dmg);
        }

        function showHitPreview(action) {
            const bar = document.getElementById('enemyHpBar');
            if (!bar || !stato.activeEnemy || stato.activeEnemy.hp <= 0 || !currentActiveHero) return;
            const dmg = Math.min(stato.activeEnemy.hp, expectedHitDamage(currentActiveHero, action));
            const preview = bar.querySelector('.hp-bar-preview');
            if (!preview || dmg <= 0) return;
            preview.style.left = `${clampPct(stato.activeEnemy.hp - dmg, stato.activeEnemy.maxHp)}%`;
            preview.style.width = `${clampPct(dmg, stato.activeEnemy.maxHp)}%`;
            preview.classList.remove('hidden');
        }

        function hideHitPreview() {
            const preview = document.querySelector('#enemyHpBar .hp-bar-preview');
            if (preview) preview.classList.add('hidden');
        }

        document.addEventListener('mouseover', e => {
            const btn = e.target.closest && e.target.closest('#cmdAttack, #btnCombatAbility');
            if (!btn || btn.disabled) return;
            showHitPreview(btn.id === 'cmdAttack' ? 'attack' : 'ability');
        });
        document.addEventListener('mouseout', e => {
            const btn = e.target.closest && e.target.closest('#cmdAttack, #btnCombatAbility');
            if (btn && !btn.contains(e.relatedTarget)) hideHitPreview();
        });

        function startHeroesTurnCycle() {
            // Anche i caduti: se una pozione li rialza in questo round possono agire
            stato.party.forEach(h => { h.hasActed = false; });
            stato.combatRound++;
            stato.helpDmgBonus = 0;  // il danno in più di un Aiuta (helpDmgBonus) vale solo nel round
            expireTempBuffs().forEach(({ hero, buff }) => logCombat(`⌛ Finisce l'effetto di ${buff.name} su ${hero.name}.`));
            applyPendingBuffs();
            updateEnemyInfoUI();
            showHeroSelectionPhase();
        }

        function showHeroSelectionPhase() {
            document.getElementById('heroTurnSection').classList.remove('hidden');
            document.getElementById('monsterTurnSection').classList.add('hidden');
            document.getElementById('combatNextBtn').classList.add('hidden');
            document.getElementById('combatLootBtn').classList.add('hidden');
            document.getElementById('heroChoiceArea').classList.remove('hidden');
            document.getElementById('heroActionControlArea').classList.add('hidden');
            document.getElementById('combatItemSubmenu').classList.add('hidden');

            const available = stato.party.filter(p => p.hp > 0 && !p.hasActed);
            if(available.length === 0) { startMonsterTurn(); return; }
            combatPhase = 'heroes';
            currentActiveHero = null;
            document.getElementById('combatHeroSelect').innerHTML = available.map(h => `<option value="${h.name}">${h.name} (HP: ${h.hp})</option>`).join('');
            updatePartyStatusBars();
        }

        function confirmCombatHeroChoice() {
            currentActiveHero = stato.party.find(p => p.name === document.getElementById('combatHeroSelect').value);
            document.getElementById('heroChoiceArea').classList.add('hidden');
            document.getElementById('heroActionControlArea').classList.remove('hidden');
            document.getElementById('combatActionButtons').classList.remove('hidden');
            document.getElementById('combatItemSubmenu').classList.add('hidden');
            document.getElementById('combatDiceArea').classList.add('hidden');

            const rollBtn = document.getElementById('rollCombatBtn');
            rollBtn.disabled = false;
            document.getElementById('combatChangeHeroBtn').classList.remove('hidden');

            document.getElementById('activeCombatantText').textContent = `Tocca a: ${currentActiveHero.name}`;
            updatePartyStatusBars();

            const btnAbility = document.getElementById('btnCombatAbility');
            if (currentActiveHero.chosenAbility) {
                btnAbility.querySelector('.cmd-ability-icon').innerHTML = abilityCmdIconHtml(currentActiveHero.chosenAbility);
            }
            const hasCombatAbility = currentActiveHero.chosenAbility && currentActiveHero.chosenAbility.isCombatActive;
            const alreadyUsed = currentActiveHero.abilityUsedThisCombat;
            const usable = abilityUsable(currentActiveHero);

            if (hasCombatAbility && !alreadyUsed && !usable.ok) {
                // Condizione non soddisfatta (es. Dente per dente senza essere stati colpiti)
                btnAbility.disabled = true;
                btnAbility.style.display = "";
                btnAbility.querySelector('.cmd-ability-label').textContent = currentActiveHero.chosenAbility.name;
                btnAbility.querySelector('.cmd-sub').textContent = 'Non ora';
                btnAbility.dataset.tip = `${currentActiveHero.chosenAbility.name}||${currentActiveHero.chosenAbility.desc}<br><span class="tip-hint">${usable.reason}</span>`;
            } else if (hasCombatAbility && !alreadyUsed) {
                btnAbility.disabled = false;
                btnAbility.style.display = "";
                btnAbility.dataset.tip = `${currentActiveHero.chosenAbility.name} [T]||${currentActiveHero.chosenAbility.desc}`;
                btnAbility.querySelector('.cmd-ability-label').textContent = currentActiveHero.chosenAbility.name;
                btnAbility.querySelector('.cmd-sub').textContent = '1 per scontro';
            } else if (hasCombatAbility && alreadyUsed) {
                btnAbility.disabled = true;
                btnAbility.style.display = "";
                btnAbility.querySelector('.cmd-ability-label').textContent = currentActiveHero.chosenAbility.name;
                btnAbility.querySelector('.cmd-sub').textContent = 'Usata';
                btnAbility.dataset.tip = `${currentActiveHero.chosenAbility.name}||Già utilizzata in questo scontro`;
            } else {
                btnAbility.disabled = true;
                btnAbility.style.display = "none";
            }
            updateActionPreviews(currentActiveHero);
        }

        /* ---------- Anteprima dell'esito sui pulsanti azione ---------- */
        // Modificatore fisso ai tiri per colpire: bonus (es. "Benedetti da Jag Antar") meno penalità (armature pesanti, maledizioni)
        function attackMod(hero) {
            return (hero.att_bonus || 0) - (hero.att_penalty || 0);
        }

        // Probabilità di ottenere almeno 'needed' con un d6, o con due d6 tenendo il migliore (twoDice) o il peggiore (worst)
        function rollChance(needed, twoDice, worst = false) {
            const fail = (Math.min(6, Math.max(2, needed)) - 1) / 6;
            if (worst) return (1 - fail) * (1 - fail);
            return twoDice ? 1 - fail * fail : 1 - fail;
        }

        function chanceText(needed, twoDice, worst = false) {
            const pct = Math.round(rollChance(needed, twoDice, worst) * 100);
            const note = worst ? ' (tieni il peggiore di due)' : (twoDice ? ' (tieni il migliore di due)' : '');
            if (needed <= 2) return { short: `2+ · ${pct}%`, long: `Basta tutto tranne un 1 (fallimento garantito)${note}: ${pct}% di riuscita`, pct };
            if (needed >= 6) return { short: `6 · ${pct}%`, long: `Serve un 6 naturale (successo garantito)${note}: ${pct}% di riuscita`, pct };
            return { short: `${needed}+ · ${pct}%`, long: `Ti serve ${needed} o più sul dado${note}: ${pct}% di riuscita`, pct };
        }

        // Stessi calcoli usati da executeCombatHeroRoll, mostrati prima del tiro
        function updateActionPreviews(hero) {
            if (!hero || !stato.activeEnemy) return;
            const rb = relicCombatBonus();
            const first = firstActorBonus(hero);  // Libertas in furor: +Forza se è il primo ad agire
            const attackNeeded = stato.activeEnemy.ca - hero.str - first - stato.helpBonus - attackMod(hero) - rb.att;
            const defendNeeded = stato.activeEnemy.att - hero.str - first - (hero.def_bonus || 0) - relicDiceBonus();
            const helpNeeded = stato.activeEnemy.att - hero.str - first - (hero.help_bonus_val || 0) - relicDiceBonus();

            const setPreview = (id, title, desc, needed, twoDice) => {
                const btn = document.getElementById(id);
                const info = chanceText(needed, twoDice);
                btn.querySelector('.cmd-sub').textContent = info.short;
                btn.querySelector('.cmd-sub').dataset.chance = info.pct >= 67 ? 'high' : (info.pct >= 34 ? 'mid' : 'low');
                btn.dataset.tip = `${title}||${desc}<br><span class="tip-hint">${info.long}</span>`;
            };

            setPreview('cmdAttack', 'Attacca [Q]', `Forza + d6 contro CA ${stato.activeEnemy.ca}. Se riesci infliggi ${expectedHitDamage(hero, 'attack')} danni.${rb.notes.length ? `<br>Reliquie: ${rb.notes.join(', ')}` : ''}`, attackNeeded, false);
            setPreview('cmdDefend', 'Difendi [W]', `Forza + d6 contro l'attacco nemico (${stato.activeEnemy.att}). Se riesci ottieni +${defendArmorGain(hero)} Armatura${hero.def_armor ? ' (scudo compreso)' : ''}.`, defendNeeded, false);
            setPreview('cmdHelp', 'Aiuta [E]', `Forza + d6 contro l'attacco nemico (${stato.activeEnemy.att}). Se riesci il prossimo attacco ottiene +1${hero.helpDmgBonus ? ` e +${hero.helpDmgBonus} al danno (fino a fine round)` : ''}.`, helpNeeded, false);

            const ability = hero.chosenAbility;
            if (ability && abilityUsable(hero).ok) {
                const c = abilityCombat(ability) || {};
                if (c.armorGain) {
                    const btn = document.getElementById('btnCombatAbility');
                    btn.querySelector('.cmd-sub').textContent = `Sicuro · +${c.armorGain} Arm.`;
                    btn.querySelector('.cmd-sub').dataset.chance = 'high';
                    btn.dataset.tip = `${ability.name} [T]||${ability.desc}<br><span class="tip-hint">Nessun tiro: +${c.armorGain} Armatura subito. Usa l'azione dell'eroe.</span>`;
                } else if (c.sumTarget) {
                    const pct = Math.round(exactSumChance(c.sumTarget) * 100);
                    const btn = document.getElementById('btnCombatAbility');
                    btn.querySelector('.cmd-sub').textContent = `Somma ${c.sumTarget} · ${pct}%`;
                    btn.querySelector('.cmd-sub').dataset.chance = pct >= 67 ? 'high' : (pct >= 34 ? 'mid' : 'low');
                    btn.dataset.tip = `${ability.name} [T]||${ability.desc}<br><span class="tip-hint">Due dadi: serve una somma esattamente ${c.sumTarget} (${pct}%). ${currentEnemyIsEliteOrBoss() ? 'Questo nemico è un elite o un boss: scende a metà vita.' : 'Questo nemico verrebbe sconfitto.'}</span>`;
                } else if (c.autoHit) {
                    const btn = document.getElementById('btnCombatAbility');
                    btn.querySelector('.cmd-sub').textContent = 'Sicuro · 100%';
                    btn.querySelector('.cmd-sub').dataset.chance = 'high';
                    btn.dataset.tip = `${ability.name} [T]||${ability.desc}<br><span class="tip-hint">Colpisce sempre: infligge ${expectedHitDamage(hero, 'ability')} danni.</span>`;
                } else {
                    const needed = attackNeeded - abilityStatBonus(hero, c.attackStat) - (c.attackBonus || 0);
                    setPreview('btnCombatAbility', `${ability.name} [T]`, ability.desc, needed, c.dice === 2);
                }
            }
      }
        function selectCombatAction(action) {
            if (action === 'ability' && !abilityUsable(currentActiveHero).ok) {
                uiError(abilityUsable(currentActiveHero).reason);
                return;
            }
            if (action === 'ability' && abilityIsInstant(currentActiveHero)) {
                useInstantAbility();
                return 'instant';
            }
            chosenAction = action;
            if (action === 'use_item') {
                let consumables = currentActiveHero.items.filter(it => it.type && it.type.startsWith('consumable'));
                if (consumables.length === 0) {
                    uiError("Questo eroe non ha oggetti consumabili nello zaino");
                    return;
                }
                document.getElementById('combatActionButtons').classList.add('hidden');
                document.getElementById('combatItemSubmenu').classList.remove('hidden');

                document.getElementById('combatConsumableSelect').innerHTML = currentActiveHero.items
                    .map((it, idx) => ({ it, idx }))
                    .filter(obj => obj.it.type && obj.it.type.startsWith('consumable'))
                    .map(obj => `<option value="${obj.idx}">${obj.it.name}${(obj.it.qty || 1) > 1 ? ` x${obj.it.qty}` : ''} (${obj.it.desc})</option>`)
                    .join('');

                const consumableSelect = document.getElementById('combatConsumableSelect');
                consumableSelect.onchange = refreshCombatItemTargets;
                refreshCombatItemTargets();
            } else {
                document.getElementById('combatActionButtons').classList.add('hidden');
                document.getElementById('combatDiceArea').classList.remove('hidden');
                document.getElementById('combatDiceBackBtn').classList.remove('hidden');
                document.getElementById('combatChangeHeroBtn').classList.add('hidden');
                document.getElementById('diceCombatResult').textContent = "Tira il dado...";
                document.getElementById('rollCombatBtn').disabled = false;

                // "Trucchi del mestiere" di Icaro: due dadi visibili, si tiene il più alto
                const twoDice = combatRollUsesTwoDice(currentActiveHero, action);
                const dice1 = document.getElementById('diceCombat');
                const dice2 = document.getElementById('diceCombat2');
                dice1.classList.remove('discarded');
                dice2.classList.remove('discarded');
                dice2.textContent = "6";
                dice2.classList.toggle('hidden', !twoDice);
                document.getElementById('rollCombatBtn').textContent = twoDice ? "Tira (2D6, tieni il migliore)" : "Tira (D6)";
            }
        }

        function combatRollUsesTwoDice(hero, action) {
            const c = action === 'ability' && hero ? abilityCombat(hero.chosenAbility) : null;
            return !!c && ((c.dice === 2 && !c.autoHit) || !!c.sumTarget);
        }

        // Prima di tirare si può tornare indietro: dal dado alla scelta dell'azione...
        function backToCombatActions() {
            if (document.getElementById('rollCombatBtn').disabled || !currentActiveHero) return;
            chosenAction = null;
            document.getElementById('combatDiceArea').classList.add('hidden');
            document.getElementById('combatItemSubmenu').classList.add('hidden');
            document.getElementById('combatActionButtons').classList.remove('hidden');
            document.getElementById('combatChangeHeroBtn').classList.remove('hidden');
        }

        // ...e dalla scelta dell'azione alla scelta dell'eroe che agisce
        function cancelCombatHeroChoice() {
            if (document.getElementById('rollCombatBtn').disabled || !currentActiveHero) return;
            chosenAction = null;
            showHeroSelectionPhase();
        }

        // Fasi del nemico dopo un colpo: diario, annuncio a schermo, barre aggiornate.
        // Ritorna true se la reazione del nemico ha sconfitto tutta la compagnia (partita persa).
        function handleEnemyPhasesUI(attacker) {
            const events = checkEnemyPhases(stato.activeEnemy, attacker);
            if (!events.length) return false;
            events.forEach(ev => logCombat(ev.type === 'phase' ? `🔥 <b>${ev.text}</b>` : ev.text));
            events.filter(ev => ev.type === 'phase').forEach(ev => showPhaseBanner(ev.text));
            if (events.some(ev => ev.type !== 'phase' && ev.type !== 'phase_info')) playEnemySfx('sfxAttack');
            updateEnemyInfoUI();
            updatePartyStatusBars();
            if (stato.party.every(p => p.hp <= 0)) {
                deleteCurrentSave();
                showScreen('screenDefeat');
                return true;
            }
            return false;
        }

        // Annuncio grande a schermo quando il nemico cambia fase
        function showPhaseBanner(text) {
            const banner = document.createElement('div');
            banner.className = 'phase-banner';
            banner.innerHTML = `<div class="phase-banner-text">${esc(text)}</div>`;
            document.body.appendChild(banner);
            setTimeout(() => banner.remove(), 2600);
        }

        // Abilità senza tiro (armorGain): effetto immediato, poi il turno dell'eroe finisce come dopo un tiro
        function useInstantAbility() {
            const hero = currentActiveHero;
            const ability = hero.chosenAbility;
            const c = abilityCombat(ability) || {};
            const res = resolveAbility(hero, stato.activeEnemy);
            const fill = text => String(text).replace(/\{eroe\}/g, hero.name);
            logCombat(`${fill(c.useText || '✨ {eroe} usa ' + ability.name + '!')} +${res.gained} Armatura.`);
            chosenAction = null;
            hero.hasActed = true;
            document.getElementById('combatActionButtons').classList.add('hidden');
            document.getElementById('combatChangeHeroBtn').classList.add('hidden');
            document.getElementById('heroActionControlArea').classList.add('hidden');
            updateEnemyInfoUI();
            updatePartyStatusBars();
            fxFloatOnHero(hero, `+${res.gained} Armatura`, 'buff');
            document.getElementById('combatNextBtn').classList.remove('hidden');
        }

        // Bersaglio del consumabile scelto: il nemico per quelli da danno, un eroe vivo per gli altri
        // (anche caduto con le pozioni che rialzano, canTargetWithItem)
        function refreshCombatItemTargets() {
            const item = currentActiveHero && currentActiveHero.items[parseInt(document.getElementById('combatConsumableSelect').value)];
            const select = document.getElementById('combatTargetSelect');
            if (item && item.type === 'consumable_damage') {
                select.innerHTML = `<option value="">${esc(stato.activeEnemy.name)} (nemico, HP: ${stato.activeEnemy.hp})</option>`;
                return;
            }
            select.innerHTML = stato.party
                .filter(p => canTargetWithItem(item, p))
                .map(p => `<option value="${p.name}">${p.name} (HP: ${p.hp}/${p.maxHp}${p.hp <= 0 ? ', caduto' : ''})</option>`)
                .join('');
        }

        // Dopo un consumabile usato in combattimento (dal menu o dal telefono). Usare un oggetto
        // NON consuma l'azione: l'eroe torna alla scelta dei comandi e può ancora attaccare,
        // difendere, aiutare o usare un altro oggetto. Se un consumabile da danno ha abbattuto
        // il nemico si passa alla vittoria.
        function finishCombatItemTurn() {
            document.getElementById('combatItemSubmenu').classList.add('hidden');
            updateEnemyInfoUI();
            updatePartyStatusBars();
            if (stato.activeEnemy.hp <= 0) {
                document.getElementById('heroActionControlArea').classList.add('hidden');
                logCombat(`Hai sconfitto ${stato.activeEnemy.name}! Vittoria!`);
                document.getElementById('combatLootBtn').classList.remove('hidden');
                return;
            }
            if (handleEnemyPhasesUI(currentActiveHero)) return;
            // Ridisegna comandi e anteprime per lo stesso eroe (e chiede di nuovo l'azione al telefono)
            confirmCombatHeroChoice();
        }

        function cancelCombatItemSubmenu() {
            document.getElementById('combatItemSubmenu').classList.add('hidden');
            document.getElementById('combatActionButtons').classList.remove('hidden');
        }

        function executeCombatUseItem() {
            let itemIdx = parseInt(document.getElementById('combatConsumableSelect').value);
            let targetName = document.getElementById('combatTargetSelect').value;

            // Se l'oggetto non viene usato il turno resta all'eroe
            if (!useConsumable(currentActiveHero.name, itemIdx, targetName)) return;
            finishCombatItemTurn();
        }

        // externalRolls: tiro/i già decisi da un telefono collegato via QR (vedi js/remote.js).
        // Se assente, si tira normalmente: il comportamento locale non cambia.
        function executeCombatHeroRoll(externalRolls) {
            const rollBtn = document.getElementById('rollCombatBtn');
            if (rollBtn.disabled) return;

            const diceBox = document.getElementById('diceCombat');
            const diceBox2 = document.getElementById('diceCombat2');
            const twoDice = combatRollUsesTwoDice(currentActiveHero, chosenAction);
            rollBtn.disabled = true;
            // Tirato il dado non si torna più indietro
            document.getElementById('combatDiceBackBtn').classList.add('hidden');
            document.getElementById('combatChangeHeroBtn').classList.add('hidden');
            diceBox.classList.add('rolling');
            if (twoDice) diceBox2.classList.add('rolling');
            synthSfx('dice');

            let counter = 0;
            const interval = setInterval(() => {
                diceBox.textContent = Math.floor(Math.random() * 6) + 1;
                if (twoDice) diceBox2.textContent = Math.floor(Math.random() * 6) + 1;
                counter += 50;
                if(counter >= 500) {
                    clearInterval(interval);
                    diceBox.classList.remove('rolling');
                    diceBox2.classList.remove('rolling');

                    const hero = currentActiveHero;
                    const enemyHpBefore = stato.activeEnemy.hp;
                    const armorBefore = hero.current_armor;

                    if(chosenAction === 'attack') {
                        const res = resolveAttack(hero, stato.activeEnemy, externalRolls);
                        logRelicNotes(res);
                        logNaturalRoll(res);
                        diceBox.textContent = res.roll;

                        logCombat(`${hero.name} attacca: Tiro ${res.roll}${rollPartsText(res.parts)} = ${res.total} (CA: ${stato.activeEnemy.ca})`);

                        if(res.hit) {
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">SUCCESSO!</span> ${res.dmg} danni.`;
                            logCombat(`Colpo riuscito! Infliggi ${res.dmg} danni.${res.helpDmgBonus ? ` (Veleni: +${res.helpDmgBonus} dall'aiuto)` : ''}`);
                        } else {
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">MANCATO!</span>`;
                        }
                    }
                    else if(chosenAction === 'ability') {
                        const ability = hero.chosenAbility;
                        const c = abilityCombat(ability) || {};
                        const res = resolveAbility(hero, stato.activeEnemy, externalRolls);
                        logRelicNotes(res);
                        logNaturalRoll(res);
                        const fill = text => String(text).replace(/\{eroe\}/g, hero.name).replace(/\{danni\}/g, res.dmg);

                        if (res.noEffect) {
                            logCombat(`${hero.name} usa ${ability.name}, ma l'abilità non ha effetti in combattimento.`);
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">NESSUN EFFETTO</span>`;
                        } else {
                            // Con due dadi si mostrano entrambi e si scurisce quello scartato (con la somma contano entrambi)
                            diceBox.textContent = res.d1;
                            if (res.dice.length === 2 && !res.sumRoll) {
                                diceBox2.textContent = res.d2;
                                (res.d2 > res.d1 ? diceBox : diceBox2).classList.add('discarded');
                            }
                            const diceText = res.dice.length === 2 ? `Tira [${res.d1}, ${res.d2}] e tiene ${res.roll}` : `Tiro ${res.roll}`;
                            const bonusText = (c.attackStat ? ` + ${STAT_LABELS[c.attackStat] || c.attackStat} ${res.attStat}` : '') + (c.attackBonus ? ` + ${c.attackBonus} ${ability.name}` : '');
                            if (res.sumRoll) {
                                diceBox2.textContent = res.d2;
                                logCombat(`${fill(c.useText || '✨ {eroe} usa ' + ability.name + '!')} Dadi [${res.d1}, ${res.d2}] = ${res.roll} (serve esattamente ${c.sumTarget})`);
                            } else if (res.autoHit) logCombat(`${fill(c.useText || '✨ {eroe} usa ' + ability.name + '!')} Colpo automatico (vale come un 6).`);
                            else logCombat(`${fill(c.useText || '✨ {eroe} usa ' + ability.name + '!')} ${diceText}${rollPartsText(res.parts)} = ${res.total} (CA: ${stato.activeEnemy.ca})`);

                            if (res.hit) {
                                if (c.critical) fxNextEnemyHitCritical = true;
                                const extra = [];
                                if (c.damageStat) extra.push(`+${res.dmgStat} ${STAT_LABELS[c.damageStat] || c.damageStat}`);
                                if (c.damageBonus) extra.push(`+${c.damageBonus} ${ability.name}`);
                                if (c.damageTakenBonus) extra.push(`+${res.taken} danni subiti`);
                                if (res.sumRoll) extra.push(res.eliteHalf ? 'elite o boss: scende a metà vita' : 'nemico sconfitto');
                                if (res.helpDmgBonus) extra.push(`+${res.helpDmgBonus} dall'aiuto`);
                                if ((c.damageMult || 1) > 1) extra.push(`x${c.damageMult}`);
                                if (c.stun) extra.push('nemico stordito per un turno');
                                document.getElementById('diceCombatResult').innerHTML =
                                    `<span style="color:${c.stun ? '#3498db' : 'var(--gold)'};">${esc(c.hitLabel || 'COLPO A SEGNO!')}</span> ${res.dmg} danni${extra.length ? ` (${extra.join(', ')})` : ''}.`;
                                logCombat(fill(c.hitText || 'Colpo riuscito! Infliggi {danni} danni.'));
                            } else {
                                document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">MANCATO!</span>`;
                            }
                        }
                    }
                    else if(chosenAction === 'defend') {
                        const res = resolveDefend(hero, stato.activeEnemy, externalRolls);
                        logRelicNotes(res);
                        logNaturalRoll(res);
                        diceBox.textContent = res.roll;
                        logCombat(`${hero.name} si difende: Tiro ${res.roll}${rollPartsText(res.parts)} = ${res.total} (Att. nemico: ${stato.activeEnemy.att})`);
                        if(res.success) {
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">DIFESA RIUSCITA!</span> +${res.gained} Armatura.`;
                            logCombat(`${hero.name} alza la guardia (+${res.gained} Armatura${res.gained > 1 ? ', scudo compreso' : ''}).`);
                        } else {
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">FALLITO.</span>`;
                        }
                    }
                    else if(chosenAction === 'help') {
                        const res = resolveHelp(hero, stato.activeEnemy, externalRolls);
                        logRelicNotes(res);
                        logNaturalRoll(res);
                        diceBox.textContent = res.roll;
                        logCombat(`${hero.name} aiuta: Tiro ${res.roll}${rollPartsText(res.parts)} = ${res.total} (Att. nemico: ${stato.activeEnemy.att})`);
                        if(res.success) {
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">AIUTO RIUSCITO!</span> +1 al prossimo${res.dmgBonus ? `, +${res.dmgBonus} al danno fino a fine round` : ''}.`;
                        } else {
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">FALLITO.</span>`;
                        }
                    }

                    diceOutcomeSfx(twoDice ? Math.max(+diceBox.textContent, +diceBox2.textContent) : +diceBox.textContent);

                    const finishRoll = () => {
                    hero.hasActed = true;
                    updateEnemyInfoUI();
                    updatePartyStatusBars();

                    // Esiti senza variazione di HP: mancato, fallito, aiuto riuscito
                    if ((chosenAction === 'attack' || chosenAction === 'ability') && stato.activeEnemy.hp === enemyHpBefore) {
                        fxFloatOn(document.getElementById('enemyInfo'), 'Mancato', 'miss');
                    } else if (chosenAction === 'defend' && hero.current_armor === armorBefore) {
                        fxFloatOnHero(hero, 'Fallito', 'miss');
                    } else if (chosenAction === 'help') {
                        const helped = document.getElementById('diceCombatResult').textContent.includes('RIUSCITO');
                        fxFloatOnHero(hero, helped ? '+1 al prossimo' : 'Fallito', helped ? 'buff' : 'miss');
                    }

                    if(stato.activeEnemy.hp <= 0) {
                        logCombat(`Hai sconfitto ${stato.activeEnemy.name}! Vittoria!`);
                        document.getElementById('combatLootBtn').classList.remove('hidden');
                        document.getElementById('heroActionControlArea').classList.add('hidden');
                        return;
                    }
                    if (handleEnemyPhasesUI(hero)) return;  // la reazione ha sconfitto la compagnia
                    document.getElementById('combatNextBtn').classList.remove('hidden');
                    };

                    // Colpo a segno (attacco o abilità): prima la cinematica col ritratto, poi danni ed effetti
                    const landed = (chosenAction === 'attack' || chosenAction === 'ability') && stato.activeEnemy.hp < enemyHpBefore;
                    if (landed) {
                        playHeroStrike(hero, chosenAction === 'ability' ? hero.chosenAbility : null, finishRoll);
                    } else {
                        finishRoll();
                    }
                }
            }, 50);
        }

        // "Avanti" dopo il turno del nemico (o dopo un turno saltato): il pulsante torna a proceedCombatPhase e riparte il giro degli eroi
        function resumeHeroesTurn() {
            const btn = document.getElementById('combatNextBtn');
            btn.classList.add('hidden');
            document.getElementById('monsterTargetArea').classList.remove('hidden');
            impostaAzione(btn, 'proceedCombatPhase');
            startHeroesTurnCycle();
        }

        function proceedCombatPhase() {
            document.getElementById('combatNextBtn').classList.add('hidden');
            showHeroSelectionPhase();
        }

        function startMonsterTurn() {
            combatPhase = 'monster';
            currentActiveHero = null;
            updatePartyStatusBars();
            document.getElementById('heroTurnSection').classList.add('hidden');
            document.getElementById('monsterTurnSection').classList.remove('hidden');

            if(stato.activeEnemy.isStunned) {
                stato.activeEnemy.isStunned = false;
                stato.activeEnemy.charging = false;  // lo stordimento interrompe anche una carica
                document.getElementById('monsterTurnText').textContent = `${stato.activeEnemy.name} è stordito e non può attaccare!`;
                logCombat(`⏳ ${stato.activeEnemy.name} si riprende dallo stordimento e salta il turno!`);
                updateEnemyInfoUI();

                document.getElementById('monsterTargetArea').classList.add('hidden');
                document.getElementById('combatNextBtn').classList.remove('hidden');
                impostaAzione(document.getElementById('combatNextBtn'), 'resumeHeroesTurn');
                return;
            }

            const enemy = stato.activeEnemy;
            // Schema "carica", turno di preparazione: niente bersaglio da scegliere, si passa oltre
            if (enemy.schema === 'carica' && !enemy.charging) {
                const res = resolveEnemyTurn(enemy, null);
                res.events.forEach(ev => logCombat(ev.text));
                document.getElementById('monsterTurnText').textContent = `${enemy.name} raspa il terreno: il prossimo turno travolgerà!`;
                updateEnemyInfoUI();
                document.getElementById('monsterTargetArea').classList.add('hidden');
                document.getElementById('combatNextBtn').classList.remove('hidden');
                impostaAzione(document.getElementById('combatNextBtn'), 'resumeHeroesTurn');
                return;
            }

            document.getElementById('monsterTargetArea').classList.remove('hidden');
            document.getElementById('monsterTurnText').textContent = `Turno di ${enemy.name}!`;
            const select = document.getElementById('monsterTargetSelect');
            // Schema "predatore": il bersaglio lo sceglie il nemico (l'eroe con meno HP + armatura)
            // Reazione della fase: il bersaglio è l'eroe che l'ha fatta scattare
            const vendetta = reactionTarget(enemy);
            const preda = vendetta || (enemy.schema === 'predatore' ? predatorTarget() : null);
            if (!vendetta && preda) enemy.announcedPrey = preda.name;  // resolveEnemyTurn colpisce lui
            const candidati = preda ? [preda] : stato.party.filter(p => p.hp > 0);
            select.innerHTML = candidati.map(h => `<option value="${h.name}">${h.name} (HP: ${h.hp})</option>`).join('');
            select.disabled = !!preda;
            if (vendetta) document.getElementById('monsterTurnText').textContent = `${enemy.name} si scaglia contro ${vendetta.name}!`;
            else if (preda) document.getElementById('monsterTurnText').textContent = `${enemy.name} punta ${preda.name}, il più debole!`;
        }

        function executeMonsterAttack() {
            const target = stato.party.find(p => p.name === document.getElementById('monsterTargetSelect').value);
            logCombat(`--- ${stato.activeEnemy.name} attacca ${target.name}! ---`);
            playEnemySfx('sfxAttack');

            const result = resolveEnemyTurn(stato.activeEnemy, target);
            result.events.forEach(ev => logCombat(ev.text));
            document.getElementById('monsterTargetSelect').disabled = false;
            updateEnemyInfoUI();

            updatePartyStatusBars();

            if(stato.party.every(p => p.hp <= 0)) {
                // La sconfitta è definitiva: il salvataggio non deve permettere di annullarla
                deleteCurrentSave();
                showScreen('screenDefeat');
                return;
            }

            document.getElementById('monsterTurnSection').classList.add('hidden');
            document.getElementById('combatNextBtn').classList.remove('hidden');
            impostaAzione(document.getElementById('combatNextBtn'), 'resumeHeroesTurn');
        }
