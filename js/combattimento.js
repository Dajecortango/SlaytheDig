/* ==========================================================================
   COMBATTIMENTO: INTERFACCIA
   Schermata dello scontro: comandi degli eroi, dadi, diario, intenzione e barra del nemico, turni degli eroi
   e del nemico con le animazioni. Le regole sono nel motore (js/motore/), usate anche da js/simulator.js.
   Stesso ambito globale degli altri file (usa stato, LIBRERIA, showScreen...).
   Caricato dopo js/game.js; le funzioni si chiamano tra file solo dopo il caricamento
   (l'avvio vero e proprio è in js/avvio.js, caricato per ultimo).
   ========================================================================== */

        /* ==========================================================================
           LOGICA COMBATTIMENTO ED ESECUZIONE ABILITA'
           ========================================================================== */
        // Nemico, bonus di Aiuta e round dello scontro stanno in "stato" (js/game.js)
        let chosenAction = null;
        let currentActiveHero = null;

        // Le regole dello scontro (tiri, attacco, difesa, abilità, colpo del nemico, fasi degli elite, effetti speciali)
        // sono nel motore: js/motore/tiri.js, js/motore/scontro.js, js/motore/speciali.js. Qui l'interfaccia.

        function startCombat(enemyKey) {
    showScreen('screenCombat');
    stato.activeEnemy = JSON.parse(JSON.stringify(enemies[enemyKey]));
    discover('enemies', String(enemyKey).replace(/__l\d+$/, ''));  // Drakengrad: "cinghiali__l3" -> "cinghiali"
    stato.activeEnemy.isStunned = false;

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
            stato.combatRound = 0;
            const blessed = applyCombatBlessings();
            // Effetti speciali di inizio scontro (Calma del Margine, Corno da Guerra di Allmän...)
            const itemStart = startCombatSpecials();
            fxResyncHeroes();
            impostaAzione(document.getElementById('combatNextBtn'), 'proceedCombatPhase');  // nessun 'Avanti' rimasto da uno scontro precedente
            document.getElementById('combatLootBtn').classList.remove('btn-attention');

            document.getElementById('combatLog').innerHTML = `Combatti contro ${stato.activeEnemy.name}! (Armature e Abilità ripristinate)<br>`;
            blessed.forEach(({ hero, b }) => logCombat(`🙏 ${hero.name}: ${b.name} (${b.desc.charAt(0).toLowerCase()}${b.desc.slice(1)})`));
            itemStart.forEach(text => logCombat(`✨ ${text}`));
            startHeroesTurnCycle();
        }

        function logRelicNotes(res) {
            if (res && res.relicNotes && res.relicNotes.length) logCombat(`💎 Bonus: ${res.relicNotes.join(', ')}`);
            if (res && res.itemNotes && res.itemNotes.length) logCombat(`✨ Effetti: ${res.itemNotes.join(', ')}`);
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
            return (enemy.fasi || []).map((f, i) => f.round ? '' : `<span class="hp-phase-tick ${(enemy.fasiFatte || []).includes(i) ? 'done' : ''}" style="left:${f.soglia}%"></span>`).join('');
        }

        // Tooltip del nome del nemico: schema attuale e fasi (fatte e da venire)
        function enemyPhasesTip(enemy) {
            const lines = [];
            if (enemy.schema) { const r = enemyTurnRule(enemy); lines.push(`<b>Ora:</b> ${r.desc || r.name || enemy.schema}`); }
            enemySpecialList(enemy).forEach(s => lines.push(`✦ ${esc(nemicoTesto(s))}`));
            (enemy.fasi || []).forEach((f, i) => {
                const fatta = (enemy.fasiFatte || []).includes(i);
                const parti = phaseActions(f).map(a => a.name ? `<b>${esc(a.name)}</b>${a.desc ? ': ' + esc(a.desc) : ''}` : esc(a.desc || ''));
                lines.push(`${fatta ? '✓' : '◆'} ${f.round ? `Al round ${f.round}` : `Al ${f.soglia}% di vita`}: ${parti.join('; ') || 'cambia atteggiamento'}`);
            });
            return `${enemy.name}||${lines.length ? lines.join('<br>') : 'Nessuna fase particolare.'}`;
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
            applyRegen().forEach(({ hero, gained }) => logCombat(`🌿 ${hero.name} rigenera ${gained} HP.`));
            startRoundSpecials().forEach(text => logCombat(`✨ ${text}`));
            if (handleEnemyPhasesUI(null, { round: true })) return;  // fasi a tempo degli elite
            if (stato.party.every(p => p.hp <= 0)) { deleteCurrentSave(); showScreen('screenDefeat'); return; }  // caduti per il veleno
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
            // Furia: solo Attacca (e gli oggetti); i pulsanti spiegano perché
            const rage = isRaging(currentActiveHero);
            ['cmdDefend', 'cmdHelp'].forEach(id => {
                const b = document.getElementById(id);
                b.disabled = rage;
                if (rage) b.dataset.tip = `${b.dataset.tip.split('||')[0]}||<span class="tip-hint">${esc(currentActiveHero.name)} è in furia: può solo attaccare</span>`;
            });
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
                if (c.armorGain || c.senzaTiro) {
                    const btn = document.getElementById('btnCombatAbility');
                    btn.querySelector('.cmd-sub').textContent = c.armorGain ? `Sicuro · +${c.armorGain} Arm.` : 'Sicuro';
                    btn.querySelector('.cmd-sub').dataset.chance = 'high';
                    btn.dataset.tip = `${ability.name} [T]||${ability.desc}<br><span class="tip-hint">Nessun tiro${c.armorGain ? `: +${c.armorGain} Armatura subito` : ''}. Usa l'azione dell'eroe.</span>`;
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
            const allowed = combatActionAllowed(currentActiveHero, action);
            if (!allowed.ok) { uiError(allowed.reason); return; }
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
        function handleEnemyPhasesUI(attacker, opts) {
            const events = opts && opts.round ? checkEnemyRoundPhases(stato.activeEnemy) : checkEnemyPhases(stato.activeEnemy, attacker);
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
            logCombat(`${fill(c.useText || '✨ {eroe} usa ' + ability.name + '!')}${res.gained ? ` +${res.gained} Armatura.` : ''}`);
            logRelicNotes(res);
            chosenAction = null;
            hero.hasActed = true;
            document.getElementById('combatActionButtons').classList.add('hidden');
            document.getElementById('combatChangeHeroBtn').classList.add('hidden');
            document.getElementById('heroActionControlArea').classList.add('hidden');
            updateEnemyInfoUI();
            updatePartyStatusBars();
            if (res.gained) fxFloatOnHero(hero, `+${res.gained} Armatura`, 'buff');
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
                diceBox.textContent = Math.floor(rng() * 6) + 1;
                if (twoDice) diceBox2.textContent = Math.floor(rng() * 6) + 1;
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

            // Sconfitto nel suo turno (Scudo a Spina di Kranen)
            if (stato.activeEnemy.hp <= 0) {
                logCombat(`Hai sconfitto ${stato.activeEnemy.name}! Vittoria!`);
                document.getElementById('monsterTurnSection').classList.add('hidden');
                document.getElementById('combatLootBtn').classList.remove('hidden');
                revealInView('combatLootBtn');
                return;
            }

            document.getElementById('monsterTurnSection').classList.add('hidden');
            document.getElementById('combatNextBtn').classList.remove('hidden');
            impostaAzione(document.getElementById('combatNextBtn'), 'resumeHeroesTurn');
        }
