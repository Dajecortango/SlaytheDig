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

        /* ---------- Sacchetto dei dadi, uno per eroe (DICE_BAG in js/regole.js) ----------
           Ogni eroe pesca i suoi d6 da un sacchetto: in ogni blocco di DICE_BAG.size tiri escono esattamente
           DICE_BAG.ones 1 e DICE_BAG.sixes 6, gli altri sono casuali tra 2 e 5. Nel lungo periodo 1 e 6 escono
           come con un dado vero, ma niente lunghe serie senza 6 o con tanti 1.
           hero.diceBag = i prossimi valori in ordine (blocchi interi uno dopo l'altro), salvato con la partita. */
        function diceBagActive() {
            return typeof DICE_BAG !== 'undefined' && DICE_BAG.size > 0;
        }

        function newDiceBlock() {
            const { size, ones, sixes } = DICE_BAG;
            const block = [...Array(ones).fill(1), ...Array(sixes).fill(6)];
            while (block.length < size) block.push(2 + Math.floor(Math.random() * 4));
            for (let i = block.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [block[i], block[j]] = [block[j], block[i]];
            }
            return block;
        }

        // Prossimi n valori del sacchetto dell'eroe, senza pescarli: il tiro dal telefono li manda al server
        // (requestRemoteRoll in js/remote.js), che li mostra al giocatore. null se il sacchetto è spento.
        function peekHeroDice(hero, n) {
            if (!hero || !diceBagActive()) return null;
            if (!Array.isArray(hero.diceBag)) hero.diceBag = [];
            while (hero.diceBag.length < n) hero.diceBag.push(...newDiceBlock());
            return hero.diceBag.slice(0, n);
        }

        // Tiro di un d6. Se "rolls[i]" è un numero 1-6 lo usa (tiro dal telefono collegato via QR, oppure
        // valore imposto dai test): se è il prossimo del sacchetto dell'eroe, lo pesca. Altrimenti pesca dal
        // sacchetto dell'eroe ("hero"), o tira un d6 casuale se non c'è un eroe o il sacchetto è spento.
        // Tutti i resolver sotto accettano "rolls" come ultimo parametro opzionale.
        // Ogni dado degli eroi viene contato in expeditionStats.diceRolls (statistiche nel Diario).
        function rollD6(rolls, i, hero) {
            const external = rolls && rolls[i];
            let value;
            if (typeof external === 'number' && external >= 1 && external <= 6) {
                value = external;
                if (hero && Array.isArray(hero.diceBag) && hero.diceBag[0] === external) hero.diceBag.shift();
            } else if (peekHeroDice(hero, 1)) {
                value = hero.diceBag.shift();
            } else {
                value = Math.floor(Math.random() * 6) + 1;
            }
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

        // Voci di un tiro per il diario: " + Forza 3 + Aiuto 1 − 1 Mod." (le voci a 0 si saltano)
        function rollPartsText(parts) {
            return parts.filter(p => p.val).map(p => ` ${p.val > 0 ? '+' : '−'} ${p.label} ${Math.abs(p.val)}`).join('');
        }

        // Tiro di attacco: muta enemy.hp, consuma helpBonus e helpDmgBonus. Ritorna l'esito per log/DOM.
        function resolveAttack(hero, enemy, rolls) {
            const roll = rollD6(rolls, 0, hero);
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
            const roll = rollD6(rolls, 0, hero);
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
            const roll = rollD6(rolls, 0, hero);
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
                const dice = [rollD6(rolls, 0, hero), rollD6(rolls, 1, hero)];
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
            const dice = c.dice === 2 ? [rollD6(rolls, 0, hero), rollD6(rolls, 1, hero)] : [rollD6(rolls, 0, hero)];
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
                const dodgeRoll = rollD6(null, 0, target);
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
                } else if (target.hp - dmg <= 0 && hasBlessing(target, 'grazia')) {
                    // Benedizione della preghiera "Grazia": una volta, torna in piedi
                    spendBlessing(target, 'grazia');
                    target.hp = Math.min(target.maxHp, PRAYER_BLESSINGS.grazia.val || 2);
                    events.push({ type: 'grazia', text: `🙏 Grazia! ${target.name} sta per cadere, ma una luce lo rialza con ${target.hp} HP.` });
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
                : mode === 'casuale' ? alive[Math.floor(Math.random() * alive.length)] : null;
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
            const first = resolveMonsterAttack(enemy, target, opts.dmg != null ? { dmg: opts.dmg } : {});
            const events = first.events;
            let hpDamage = first.hpDamage;
            if (opts.vicini) heroesNextTo(target).forEach(n => {
                events.push({ type: 'splash', text: `Travolto anche ${n.name}!` });
                const res = resolveMonsterAttack(enemy, n, { dmg: opts.vicini, splash: true });
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
            targets.forEach(h => { if (h.hp > 0) events.push(...monsterStrike(enemy, h, { dmg: a.colpoDanno, vicini: a.colpoVicini }).events); });
            stato.party.forEach((h, i) => { [h.lastHitRound, h.lastHitDamage] = lastHits[i]; });
            return events;
        }

        // Controlla le soglie dopo un colpo dell'eroe "attacker". Applica le fasi scattate e ritorna gli eventi
        // (type 'phase' con il testo della fase, poi le informazioni e i colpi) per diario e interfaccia.
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
                const azioni = phaseActions(f);
                azioni.forEach(a => events.push(...applyEliteAction(enemy, a, attacker)));
                // Gli attacchi in risposta per ultimi: usano il danno già aumentato dalla fase
                azioni.filter(a => a.colpo).forEach(a => events.push(...eliteReaction(enemy, a, attacker)));
            });
            return events;
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
                    hpTaken += res.hpDamage;
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
                // Anche chi è a terra: se viene rianimato durante lo scontro ha l'abilità disponibile
                h.abilityUsedThisCombat = false;
                h.current_armor = h.hp > 0 ? h.base_armor : 0;
                delete h.lastHitRound;
                delete h.lastHitDamage;
                delete h.stunnedRounds;
            });
            const blessed = applyCombatBlessings();
            fxResyncHeroes();
            stato.combatRound = 0;
            impostaAzione(document.getElementById('combatNextBtn'), 'proceedCombatPhase');  // nessun 'Avanti' rimasto da uno scontro precedente
            document.getElementById('combatLootBtn').classList.remove('btn-attention');

            document.getElementById('combatLog').innerHTML = `Combatti contro ${stato.activeEnemy.name}! (Armature e Abilità ripristinate)<br>`;
            blessed.forEach(({ hero, b }) => logCombat(`🙏 ${hero.name}: ${b.name} (${b.desc.charAt(0).toLowerCase()}${b.desc.slice(1)})`));
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
                        <div class="enemy-name" data-tip="${esc(enemyPhasesTip(stato.activeEnemy))}">${stato.activeEnemy.name}${stunBadge}${stato.activeEnemy.schema ? `<span class="stun-badge phase-badge">${esc(enemyTurnRule(stato.activeEnemy).name || stato.activeEnemy.schema)}</span>` : ''}</div>
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
            if (enemy.schema) { const r = enemyTurnRule(enemy); lines.push(`<b>Ora:</b> ${r.desc || r.name || enemy.schema}`); }
            (enemy.fasi || []).forEach((f, i) => {
                const fatta = (enemy.fasiFatte || []).includes(i);
                const parti = phaseActions(f).map(a => a.name ? `<b>${esc(a.name)}</b>${a.desc ? ': ' + esc(a.desc) : ''}` : esc(a.desc || ''));
                lines.push(`${fatta ? '✓' : '◆'} Al ${f.soglia}% di vita: ${parti.join('; ') || 'cambia atteggiamento'}`);
            });
            return `${enemy.name}||${lines.length ? lines.join('<br>') : 'Nessuna fase particolare.'}`;
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

        // Intenzione del nemico: cosa farà al suo turno (secondo il suo modo di attaccare)
        function enemyIntentHtml(enemy) {
            if (!enemy || enemy.hp <= 0) return '';
            if (enemy.isStunned) {
                return `<span class="intent-icon stunned">${svgIcon('skull')}</span>
                    <span class="intent-text"><small>Intenzione</small><span>Stordito: salta il prossimo attacco</span></span>`;
            }
            const cosa = enemyIntentText(enemy);
            return `<span class="intent-icon ${enemyIsPreparing(enemy) ? 'stunned' : ''}">${svgIcon('sword')}</span>
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
            applyHeroStuns().forEach(h => logCombat(`💫 ${h.name} è stordito e salta il turno.`));
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
                revealInView('combatDiceArea');
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
            speedUpAnimations(banner);
            setTimeout(() => banner.remove(), animTime(2600));
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
            // L'attacco in risposta del nemico (reazione della fase) può averlo abbattuto: si sceglie un altro eroe
            if (currentActiveHero.hp <= 0) { showHeroSelectionPhase(); return; }
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
            // Un tiro arrivato in ritardo dal telefono dopo "Indietro" o "Cambia eroe", o a scontro finito
            if (!currentActiveHero || !chosenAction || currentActiveHero.hasActed || currentActiveHero.hp <= 0 || !stato.activeEnemy || stato.activeEnemy.hp <= 0) return;

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
                if(counter >= animTime(500)) {
                    clearInterval(interval);
                    diceBox.classList.remove('rolling');
                    diceBox2.classList.remove('rolling');

                    const hero = currentActiveHero;
                    const enemyHpBefore = stato.activeEnemy.hp;
                    const armorBefore = hero.current_armor;
                    let rollOutcome = null;  // annuncio dell'esito (showRollBanner), dopo l'eventuale cinematica

                    if(chosenAction === 'attack') {
                        const res = resolveAttack(hero, stato.activeEnemy, externalRolls);
                        logRelicNotes(res);
                        logNaturalRoll(res);
                        diceBox.textContent = res.roll;

                        logCombat(`${hero.name} attacca: Tiro ${res.roll}${rollPartsText(res.parts)} = ${res.total} (CA: ${stato.activeEnemy.ca})`);

                        rollOutcome = { ok: res.hit, title: res.hit ? `Colpito! ${res.dmg} ${res.dmg === 1 ? 'danno' : 'danni'}` : 'Mancato', detail: `${res.total} contro CA ${stato.activeEnemy.ca}` };
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

                            rollOutcome = { ok: res.hit, title: res.hit ? `${ability.name}: ${res.dmg} ${res.dmg === 1 ? 'danno' : 'danni'}` : `${ability.name}: mancato`,
                                detail: res.sumRoll ? `Somma ${res.roll}, serve esattamente ${c.sumTarget}` : res.autoHit ? 'Colpo automatico' : `${res.total} contro CA ${stato.activeEnemy.ca}` };
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
                        rollOutcome = { ok: res.success, title: res.success ? `Difesa riuscita! +${res.gained} Armatura` : 'Difesa fallita', detail: `${res.total} contro Attacco ${stato.activeEnemy.att}` };
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
                        rollOutcome = { ok: res.success, title: res.success ? 'Aiuto riuscito! +1 al prossimo' : 'Aiuto fallito', detail: `${res.total} contro Attacco ${stato.activeEnemy.att}` };
                        if(res.success) {
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">AIUTO RIUSCITO!</span> +1 al prossimo${res.dmgBonus ? `, +${res.dmgBonus} al danno fino a fine round` : ''}.`;
                        } else {
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">FALLITO.</span>`;
                        }
                    }

                    diceOutcomeSfx(twoDice ? Math.max(+diceBox.textContent, +diceBox2.textContent) : +diceBox.textContent);

                    const finishRoll = () => {
                    if (rollOutcome) showRollBanner(rollOutcome.ok, rollOutcome.title, rollOutcome.detail);
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
                        revealInView('combatLootBtn');
                        return;
                    }
                    if (handleEnemyPhasesUI(hero)) return;  // la reazione ha sconfitto la compagnia
                    document.getElementById('combatNextBtn').classList.remove('hidden');
                    revealInView('combatNextBtn');
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
            // Turno di preparazione (Carica): niente bersaglio da scegliere, si passa oltre
            if (enemyIsPreparing(enemy)) {
                const res = resolveEnemyTurn(enemy, null);
                res.events.forEach(ev => logCombat(ev.text));
                updatePartyStatusBars();
                document.getElementById('monsterTurnText').textContent = preparationText(enemy);
                updateEnemyInfoUI();
                document.getElementById('monsterTargetArea').classList.add('hidden');
                document.getElementById('combatNextBtn').classList.remove('hidden');
                impostaAzione(document.getElementById('combatNextBtn'), 'resumeHeroesTurn');
                return;
            }

            document.getElementById('monsterTargetArea').classList.remove('hidden');
            document.getElementById('monsterTurnText').textContent = `Turno di ${enemy.name}!`;
            const select = document.getElementById('monsterTargetSelect');
            // Bersaglio scelto dal nemico (più debole, più forte, a caso) o tutta la compagnia
            const mode = enemyTurnRule(enemy).turnoBersaglio || 'scelto';
            const preda = enemyChosenTarget(enemy);
            if (preda) enemy.announcedPrey = preda.name;  // resolveEnemyTurn colpisce lui
            if (mode === 'tutti') {
                select.innerHTML = '<option value="">Tutta la compagnia</option>';
                select.disabled = true;
                document.getElementById('monsterTurnText').textContent = `${enemy.name} si scaglia contro tutta la compagnia!`;
                return;
            }
            const candidati = preda ? [preda] : stato.party.filter(p => p.hp > 0);
            select.innerHTML = candidati.map(h => `<option value="${h.name}">${h.name} (HP: ${h.hp})</option>`).join('');
            select.disabled = !!preda;
            const perche = { piu_debole: 'il più debole', piu_forte: 'il più forte', casuale: 'scelto a caso' }[mode];
            if (preda) document.getElementById('monsterTurnText').textContent = `${enemy.name} punta ${preda.name}, ${perche}!`;
        }

        function executeMonsterAttack() {
            const target = stato.party.find(p => p.name === document.getElementById('monsterTargetSelect').value);
            logCombat(`--- ${stato.activeEnemy.name} attacca ${target ? target.name : 'tutta la compagnia'}! ---`);
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
