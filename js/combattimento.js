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
        function rollD6(rolls, i) {
            const external = rolls && rolls[i];
            if (typeof external === 'number' && external >= 1 && external <= 6) return external;
            return Math.floor(Math.random() * 6) + 1;
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

        // Frammento di Yr-Drazul: +1 a tutti i tiri di dado degli eroi (combattimento, prove, contrattazione)
        function relicDiceBonus() {
            return hasRelic("Frammento di Yr-Drazul") ? 1 : 0;
        }

        // Bonus delle reliquie a tiro per colpire (att) e danno (dmg) in questo round di combattimento.
        // Valgono per l'attacco E per le abilità d'attacco; "notes" finisce nel log.
        function relicCombatBonus() {
            const node = stato.stsMapNodes.find(n => n.id === stato.currentNodeId);
            const isElite = !!node && (node.type === 'elite' || node.type === 'captain');
            const b = { att: 0, dmg: 0, notes: [] };
            const add = (when, name, att, dmg) => {
                if (!when || !hasRelic(name)) return;
                b.att += att; b.dmg += dmg;
                b.notes.push(`${name} (${att ? `+${att} al tiro` : `+${dmg} danno`})`);
            };
            add(stato.combatRound === 1, "Stendardo da battaglia", 1, 0);
            add(stato.combatRound === 2, "Zanna del leone bianco", 0, 2);
            add(stato.combatRound === 3, "Corno antico", 0, 1);
            add(isElite, "Idolo del cacciatore", 0, 1);
            add(isElite, "Catena di Norgrad", 1, 0);
            const dice = relicDiceBonus();
            if (dice) { b.att += dice; b.notes.push('Frammento di Yr-Drazul (+1 al tiro)'); }
            return b;
        }

        // Passiva "Libertas in furor" (hero_set firstActorDmgBonus): +danno se l'eroe è il primo ad agire nel round.
        // È il primo se nessun altro eroe vivo ha già agito (anche usare un oggetto conta come agire).
        function firstActorBonus(hero) {
            if (!hero || !hero.firstActorDmgBonus) return 0;
            const first = stato.party.every(h => h === hero || h.hp <= 0 || !h.hasActed);
            return first ? hero.firstActorDmgBonus : 0;
        }

        // Tiro di attacco: muta enemy.hp, consuma helpBonus. Ritorna l'esito per log/DOM.
        function resolveAttack(hero, enemy, rolls) {
            const roll = rollD6(rolls, 0);
            const rb = relicCombatBonus();
            const first = firstActorBonus(hero);
            const total = roll + hero.str + stato.helpBonus + attackMod(hero) + rb.att;
            stato.helpBonus = 0;

            const hit = naturalRollSuccess(roll, total, enemy.ca);
            let dmg = 0;
            if (hit) {
                dmg = hero.dmg + rb.dmg + first;
                enemy.hp -= dmg;
            }
            return { roll, total, hit, dmg, firstBonus: first, relicAttBonus: rb.att, relicNotes: rb.notes, naturalNote: naturalRollNote(roll, total, enemy.ca) };
        }

        // Tiro di difesa: in caso di successo aggiunge 1 armatura corrente all'eroe.
        function resolveDefend(hero, enemy, rolls) {
            const roll = rollD6(rolls, 0);
            const total = roll + hero.str + (hero.def_bonus || 0) + relicDiceBonus();
            const success = naturalRollSuccess(roll, total, enemy.att);
            if (success) hero.current_armor += 1;
            return { roll, total, success, naturalNote: naturalRollNote(roll, total, enemy.att) };
        }

        // Tiro di aiuto: in caso di successo imposta il bonus +1 al prossimo attacco/abilità.
        function resolveHelp(hero, enemy, rolls) {
            const roll = rollD6(rolls, 0);
            const total = roll + hero.str + (hero.help_bonus_val || 0) + relicDiceBonus();
            const success = naturalRollSuccess(roll, total, enemy.att);
            if (success) stato.helpBonus = 1;
            return { roll, total, success, naturalNote: naturalRollNote(roll, total, enemy.att) };
        }

        // Comportamento in combattimento di un'abilità attiva, descritto nel campo "combat" della
        // libreria Abilità (data/libreria/abilita.js), così le attive nuove si creano dall'editor:
        //   dice: 1 o 2 (con 2 si tiene il dado migliore)
        //   attackStat / damageStat: statistica dell'eroe aggiunta al tiro per colpire / al danno
        //   damageMult: moltiplicatore del danno (es. 2 = danno raddoppiato)
        //   stun: se colpisce, il nemico salta il suo prossimo attacco
        //   critical: il colpo a segno mostra i numeri del critico
        //   autoHit: colpisce sempre, senza tiro (vale come un 6 naturale)
        //   requiresHitLastTurn: si può usare solo se il nemico ha colpito l'eroe nel suo ultimo turno
        //   damageTakenBonus: aggiunge al danno i danni subiti in quel colpo (HP e armatura persi)
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
            return { ok: true, reason: '' };
        }

        // Danno di un colpo a segno dell'abilità (stesso calcolo per il tiro vero e per le anteprime)
        function abilityHitDamage(hero, c, relicDmg) {
            const taken = c.damageTakenBonus ? heroHitLastTurn(hero) : 0;
            return (hero.dmg + abilityStatBonus(hero, c.damageStat) + taken + firstActorBonus(hero) + relicDmg) * (c.damageMult || 1);
        }

        // Risolve l'abilità attiva in combattimento: muta enemy.hp (e isStunned), consuma helpBonus.
        function resolveAbility(hero, enemy, rolls) {
            hero.abilityUsedThisCombat = true;
            const abId = hero.chosenAbility.id;
            const c = abilityCombat(hero.chosenAbility);
            if (!c) return { abId, hit: false, dmg: 0, noEffect: true, relicNotes: [] };

            const rb = relicCombatBonus();
            const attStat = abilityStatBonus(hero, c.attackStat);
            const taken = c.damageTakenBonus ? heroHitLastTurn(hero) : 0;
            const firstBonus = firstActorBonus(hero);
            const dmg = abilityHitDamage(hero, c, rb.dmg);
            // Colpo automatico: niente tiro, vale come un 6 naturale (il bonus di Aiuta resta per il prossimo)
            if (c.autoHit) {
                enemy.hp -= dmg;
                if (c.stun) enemy.isStunned = true;
                return { abId, autoHit: true, dice: [6], d1: 6, roll: 6, total: 6, hit: true, dmg, attStat, taken, firstBonus, naturalNote: null,
                    dmgStat: abilityStatBonus(hero, c.damageStat), relicDmgBonus: rb.dmg, relicNotes: rb.notes };
            }
            const dice = c.dice === 2 ? [rollD6(rolls, 0), rollD6(rolls, 1)] : [rollD6(rolls, 0)];
            const roll = Math.max(...dice);
            const total = roll + hero.str + attStat + stato.helpBonus + attackMod(hero) + rb.att;
            stato.helpBonus = 0;
            const hit = naturalRollSuccess(roll, total, enemy.ca);
            if (hit) {
                enemy.hp -= dmg;
                if (c.stun) enemy.isStunned = true;
            }
            return { abId, dice, d1: dice[0], d2: dice[1], roll, total, hit, dmg, attStat, taken, firstBonus, naturalNote: naturalRollNote(roll, total, enemy.ca),
                dmgStat: abilityStatBonus(hero, c.damageStat), relicDmgBonus: rb.dmg, relicNotes: rb.notes };
        }

        // Attacco del mostro su un bersaglio: applica maledizioni/reliquie, armatura, poi HP.
        // "events" descrive in ordine cosa è successo, per il log di combattimento.
        function resolveMonsterAttack(enemy, target) {
            const events = [];
            let dmg = enemy.dmg;
            const armorBefore = target.current_armor;
            const hpBefore = target.hp;

            if (hasCurse("Presagio di Morte")) {
                dmg += 1;
                events.push({ type: 'curse_bonus', text: '💀 Presagio di Morte: il colpo infligge 1 danno in più.' });
            }

            if (hasRelic("Scudo dell'Atamano") && !stato.party.atamanoUsed) {
                stato.party.atamanoUsed = true;
                dmg = 0;
                events.push({ type: 'atamano', text: "🛡️ Lo Scudo dell'Atamano assorbe completamente il primo colpo del combattimento!" });
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
                if (target.hp - dmg <= 0 && hasRelic("Marchio di Jag Antar")) {
                    target.hp = 1;
                    breakRelic("Marchio di Jag Antar");
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

        function startCombat(enemyKey) {
    showScreen('screenCombat');
    stato.activeEnemy = JSON.parse(JSON.stringify(enemies[enemyKey]));
    discover('enemies', enemyKey);
    stato.activeEnemy.isStunned = false;
    
    // Reliquia: Occhio del corvo
    if (hasRelic("Occhio del corvo")) stato.activeEnemy.att = Math.max(1, stato.activeEnemy.att - 1);
    
    // Flag per Scudo dell'Atamano
    stato.party.atamanoUsed = false;

    stato.helpBonus = 0;

            document.getElementById('combatDescBox').innerHTML = `<strong>Descrizione:</strong> ${kw(stato.activeEnemy.desc)}`;

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
                        <div class="enemy-name">${stato.activeEnemy.name}${stunBadge}</div>
                        <div class="hp-bar-container big" id="enemyHpBar">
                            ${barGhostHtml(`enemy:${stato.activeEnemy.name}`, hpPercent, Math.max(0, stato.activeEnemy.hp))}
                            <div class="hp-bar-fill ${hpClass(hpPercent)}" style="width: ${hpPercent}%;"></div>
                            <div class="hp-bar-preview hidden"></div>
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

        // Intenzione del nemico: cosa farà al suo turno (il bersaglio lo sceglie comunque il giocatore)
        function enemyIntentHtml(enemy) {
            if (!enemy || enemy.hp <= 0) return '';
            if (enemy.isStunned) {
                return `<span class="intent-icon stunned">${svgIcon('skull')}</span>
                    <span class="intent-text"><small>Intenzione</small><span>Stordito: salta il prossimo attacco</span></span>`;
            }
            const dmg = enemy.dmg + (hasCurse("Presagio di Morte") ? 1 : 0);
            return `<span class="intent-icon">${svgIcon('sword')}</span>
                <span class="intent-text"><small>Intenzione</small><span>Attaccherà per <b>${dmg} ${dmg === 1 ? 'danno' : 'danni'}</b></span>
                <em>Difendi e Aiuta devono superare ${enemy.att}</em></span>`;
        }

        // 11. Passando su "Attacca" o sull'abilità, la parte di vita che il colpo toglierebbe lampeggia
        function expectedHitDamage(hero, action) {
            if (!hero || !stato.activeEnemy) return 0;
            let dmg = hero.dmg + relicCombatBonus().dmg + firstActorBonus(hero);
            const c = action === 'ability' ? abilityCombat(hero.chosenAbility) : null;
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
            stato.party.forEach(h => { if(h.hp > 0) h.hasActed = false; });
            stato.combatRound++;
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
            const attackNeeded = stato.activeEnemy.ca - hero.str - stato.helpBonus - attackMod(hero) - rb.att;
            const defendNeeded = stato.activeEnemy.att - hero.str - (hero.def_bonus || 0) - relicDiceBonus();
            const helpNeeded = stato.activeEnemy.att - hero.str - (hero.help_bonus_val || 0) - relicDiceBonus();

            const setPreview = (id, title, desc, needed, twoDice) => {
                const btn = document.getElementById(id);
                const info = chanceText(needed, twoDice);
                btn.querySelector('.cmd-sub').textContent = info.short;
                btn.querySelector('.cmd-sub').dataset.chance = info.pct >= 67 ? 'high' : (info.pct >= 34 ? 'mid' : 'low');
                btn.dataset.tip = `${title}||${desc}<br><span class="tip-hint">${info.long}</span>`;
            };

            setPreview('cmdAttack', 'Attacca [Q]', `Forza + d6 contro CA ${stato.activeEnemy.ca}. Se riesci infliggi ${expectedHitDamage(hero, 'attack')} danni.${rb.notes.length ? `<br>Reliquie: ${rb.notes.join(', ')}` : ''}`, attackNeeded, false);
            setPreview('cmdDefend', 'Difendi [W]', `Forza + d6 contro l'attacco nemico (${stato.activeEnemy.att}). Se riesci ottieni +1 Armatura.`, defendNeeded, false);
            setPreview('cmdHelp', 'Aiuta [E]', `Forza + d6 contro l'attacco nemico (${stato.activeEnemy.att}). Se riesci il prossimo attacco ottiene +1.`, helpNeeded, false);

            const ability = hero.chosenAbility;
            if (ability && abilityUsable(hero).ok) {
                const c = abilityCombat(ability) || {};
                if (c.autoHit) {
                    const btn = document.getElementById('btnCombatAbility');
                    btn.querySelector('.cmd-sub').textContent = 'Sicuro · 100%';
                    btn.querySelector('.cmd-sub').dataset.chance = 'high';
                    btn.dataset.tip = `${ability.name} [T]||${ability.desc}<br><span class="tip-hint">Colpisce sempre: infligge ${expectedHitDamage(hero, 'ability')} danni.</span>`;
                } else {
                    const needed = attackNeeded - abilityStatBonus(hero, c.attackStat);
                    setPreview('btnCombatAbility', `${ability.name} [T]`, ability.desc, needed, c.dice === 2);
                }
            }
      }
        function selectCombatAction(action) {
            if (action === 'ability' && !abilityUsable(currentActiveHero).ok) {
                uiError(abilityUsable(currentActiveHero).reason);
                return;
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
                    .map(obj => `<option value="${obj.idx}">${obj.it.name} (${obj.it.desc})</option>`)
                    .join('');

                document.getElementById('combatTargetSelect').innerHTML = stato.party
                    .filter(p => p.hp > 0)
                    .map(p => `<option value="${p.name}">${p.name} (HP: ${p.hp}/${p.maxHp})</option>`)
                    .join('');
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
            return !!c && c.dice === 2 && !c.autoHit;
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

        function cancelCombatItemSubmenu() {
            document.getElementById('combatItemSubmenu').classList.add('hidden');
            document.getElementById('combatActionButtons').classList.remove('hidden');
        }

        function executeCombatUseItem() {
            let itemIdx = parseInt(document.getElementById('combatConsumableSelect').value);
            let targetName = document.getElementById('combatTargetSelect').value;

            // Se l'oggetto non viene usato il turno resta all'eroe
            if (!useConsumable(currentActiveHero.name, itemIdx, targetName)) return;

            currentActiveHero.hasActed = true;
            document.getElementById('combatItemSubmenu').classList.add('hidden');
            document.getElementById('heroActionControlArea').classList.add('hidden');

            const available = stato.party.filter(p => p.hp > 0 && !p.hasActed);
            if (available.length === 0) {
                startMonsterTurn();
            } else {
                showHeroSelectionPhase();
            }
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

                        logCombat(`${hero.name} attacca: Tiro ${res.roll} + Forza ${hero.str}${attackMod(hero) ? ` ${attackMod(hero) > 0 ? '+' : '−'} ${Math.abs(attackMod(hero))} Mod.` : ''}${res.relicAttBonus > 0 ? ' + Reliquia' : ''} = ${res.total} (CA: ${stato.activeEnemy.ca})`);

                        if(res.hit) {
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">SUCCESSO!</span> ${res.dmg} danni.`;
                            logCombat(`Colpo riuscito! Infliggi ${res.dmg} danni.${res.firstBonus ? ` (Libertas in furor: +${res.firstBonus}, primo ad agire)` : ''}`);
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
                            // Con due dadi si mostrano entrambi e si scurisce quello scartato
                            diceBox.textContent = res.d1;
                            if (res.dice.length === 2) {
                                diceBox2.textContent = res.d2;
                                (res.d2 > res.d1 ? diceBox : diceBox2).classList.add('discarded');
                            }
                            const diceText = res.dice.length === 2 ? `Tira [${res.d1}, ${res.d2}] e tiene ${res.roll}` : `Tiro ${res.roll}`;
                            const bonusText = c.attackStat ? ` + ${STAT_LABELS[c.attackStat] || c.attackStat} ${res.attStat}` : '';
                            if (res.autoHit) logCombat(`${fill(c.useText || '✨ {eroe} usa ' + ability.name + '!')} Colpo automatico (vale come un 6).`);
                            else logCombat(`${fill(c.useText || '✨ {eroe} usa ' + ability.name + '!')} ${diceText} + Forza ${hero.str}${bonusText} = ${res.total} (CA: ${stato.activeEnemy.ca})`);

                            if (res.hit) {
                                if (c.critical) fxNextEnemyHitCritical = true;
                                const extra = [];
                                if (c.damageStat) extra.push(`+${res.dmgStat} ${STAT_LABELS[c.damageStat] || c.damageStat}`);
                                if (c.damageTakenBonus) extra.push(`+${res.taken} danni subiti`);
                                if (res.firstBonus) extra.push(`+${res.firstBonus} primo ad agire`);
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
                        logNaturalRoll(res);
                        diceBox.textContent = res.roll;
                        logCombat(`${hero.name} si difende: Tiro ${res.roll} + Forza ${hero.str} = ${res.total}`);
                        if(res.success) {
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">DIFESA RIUSCITA!</span> +1 Armatura.`;
                            logCombat(`${hero.name} alza la guardia (+1 Armatura).`);
                        } else {
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:#ff4d4d;">FALLITO.</span>`;
                        }
                    }
                    else if(chosenAction === 'help') {
                        const res = resolveHelp(hero, stato.activeEnemy, externalRolls);
                        logNaturalRoll(res);
                        diceBox.textContent = res.roll;
                        logCombat(`${hero.name} aiuta: Tiro ${res.roll} + Forza ${hero.str} = ${res.total}`);
                        if(res.success) {
                            document.getElementById('diceCombatResult').innerHTML = `<span style="color:var(--gold);">AIUTO RIUSCITO!</span> +1 al prossimo.`;
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
                document.getElementById('monsterTurnText').textContent = `${stato.activeEnemy.name} è stordito e non può attaccare!`;
                logCombat(`⏳ ${stato.activeEnemy.name} si riprende dallo stordimento e salta il turno!`);
                updateEnemyInfoUI();

                document.getElementById('monsterTargetArea').classList.add('hidden');
                document.getElementById('combatNextBtn').classList.remove('hidden');
                document.getElementById('combatNextBtn').onclick = function() {
                    document.getElementById('combatNextBtn').classList.add('hidden');
                    document.getElementById('monsterTargetArea').classList.remove('hidden');
                    document.getElementById('combatNextBtn').onclick = proceedCombatPhase;
                    startHeroesTurnCycle();
                };
                return;
            }

            document.getElementById('monsterTargetArea').classList.remove('hidden');
            document.getElementById('monsterTurnText').textContent = `Turno di ${stato.activeEnemy.name}!`;
            document.getElementById('monsterTargetSelect').innerHTML = stato.party.filter(p => p.hp > 0).map(h => `<option value="${h.name}">${h.name} (HP: ${h.hp})</option>`).join('');
        }

        function executeMonsterAttack() {
            const target = stato.party.find(p => p.name === document.getElementById('monsterTargetSelect').value);
            logCombat(`--- ${stato.activeEnemy.name} attacca ${target.name}! ---`);
            playEnemySfx('sfxAttack');

            const result = resolveMonsterAttack(stato.activeEnemy, target);
            result.events.forEach(ev => logCombat(ev.text));

            updatePartyStatusBars();

            if(stato.party.every(p => p.hp <= 0)) {
                // La sconfitta è definitiva: il salvataggio non deve permettere di annullarla
                deleteCurrentSave();
                showScreen('screenDefeat');
                return;
            }

            document.getElementById('monsterTurnSection').classList.add('hidden');
            document.getElementById('combatNextBtn').classList.remove('hidden');
            document.getElementById('combatNextBtn').onclick = function() {
                document.getElementById('combatNextBtn').classList.add('hidden');
                document.getElementById('combatNextBtn').onclick = proceedCombatPhase;
                startHeroesTurnCycle();
            };
        }
