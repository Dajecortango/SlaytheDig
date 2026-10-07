/* ==========================================================================
   SFIDE, RIPOSO E FINALE DEL CAPITANO
   Prove di Intelligenza e Fede con premi e punizioni, riposo, finale del capitano.
   Diviso da js/game.js: stesso ambito globale (usa stato, LIBRERIA, showScreen...).
   Caricato subito dopo js/game.js; le funzioni si chiamano tra file solo dopo il caricamento.
   ========================================================================== */

        /* ==========================================================================
           GESTIONE SFIDE
           ========================================================================== */
        function startChallenge(challengeId) {
            showScreen('screenChallenge');
            stato.challengeState = challengesData[challengeId] || {
                title: "Sfida",
                desc: "descrizione da scrivere",
                ignoreText: "descrizione da scrivere",
                successText: "descrizione da scrivere",
                failText: "descrizione da scrivere",
                stat: "str",
                cd: 6
            };

            document.getElementById('challengeTitle').textContent = stato.challengeState.title;
            document.getElementById('challengeNarrativeBox').innerHTML = `<strong>Descrizione:</strong> ${kw(stato.challengeState.desc)}`;

            document.getElementById('challengeStage1').classList.remove('hidden');
            document.getElementById('challengeStage2').classList.add('hidden');
            document.getElementById('diceChallengeSection').classList.add('hidden');
            document.getElementById('closeChallengeBtn').classList.add('hidden');

            impostaAzione(document.getElementById('closeChallengeBtn'), 'advanceNode');
        }

        function challengeChoose(approach) {
            if(!approach) {
                document.getElementById('challengeNarrativeBox').innerHTML = `<strong>Descrizione:</strong> ${kw(stato.challengeState.ignoreText)}`;
                document.getElementById('challengeStage1').classList.add('hidden');
                document.getElementById('closeChallengeBtn').classList.remove('hidden');
                return;
            }
            document.getElementById('challengeNarrativeBox').innerHTML = `<strong>Descrizione:</strong> Un membro della compagnia si fa avanti per affrontare la prova.`;
            document.getElementById('challengeStage1').classList.add('hidden');
            document.getElementById('challengeStage2').classList.remove('hidden');
            document.getElementById('challengeHeroSelect').innerHTML = stato.party.filter(p => p.hp > 0).map(h => {
                const mods = challengeModifiers(h);
                return `<option value="${h.name}">${h.name} (${STAT_LABELS[stato.challengeState.stat] || 'Stat'} ${mods.statValue}) · ${challengeChanceInfo(mods).short}</option>`;
            }).join('');
        }

        let selectedChallengeHero = null;
        function confirmChallengeHero() {
            selectedChallengeHero = stato.party.filter(p => p.hp > 0).find(p => p.name === document.getElementById('challengeHeroSelect').value);
            document.getElementById('challengeStage2').classList.add('hidden');
            document.getElementById('diceChallengeSection').classList.remove('hidden');

            const statLabel = STAT_LABELS[stato.challengeState.stat] || 'Statistica';
            document.getElementById('challengeCdText').textContent = `Prova di ${statLabel} (Classe di Difficoltà: ${stato.challengeState.cd})`;

            // Probabilità di riuscita prima del tiro, con gli stessi modificatori di executeChallengeRoll
            const mods = challengeModifiers(selectedChallengeHero);
            const info = challengeChanceInfo(mods);
            const chanceEl = document.getElementById('challengeChance');
            chanceEl.textContent = info.long;
            chanceEl.dataset.chance = info.pct >= 67 ? 'high' : (info.pct >= 34 ? 'mid' : 'low');

            const log = document.getElementById('challengeLog');
            log.innerHTML = '';
            log.classList.add('hidden');
            document.getElementById('rollChallengeBtn').disabled = false;
            document.getElementById('diceChallenge').textContent = "6";

            // Con vantaggio o svantaggio si mostrano due dadi già prima del tiro
            const rollMode = challengeRollMode(selectedChallengeHero);
            const twoDice = rollMode.mode !== 'single';
            const dice2 = document.getElementById('diceChallenge2');
            dice2.textContent = "6";
            dice2.classList.toggle('hidden', !twoDice);
            document.getElementById('diceChallenge').classList.remove('discarded');
            dice2.classList.remove('discarded');
            const note = document.getElementById('diceChallengeNote');
            note.textContent = rollMode.note || '';
            note.classList.toggle('hidden', !rollMode.note);
            document.getElementById('rollChallengeBtn').textContent =
                rollMode.mode === 'best' ? "Tira (2D6, tieni il migliore)" : (rollMode.mode === 'worst' ? "Tira (2D6, tieni il peggiore)" : "Tira (D6)");
        }

        // Come si tira in una prova: 'worst' (svantaggio) o 'single'.
        // Svantaggio: maledizione "Fede Inaridita" nelle prove di Fede.
        // La passiva di Dioforo "Era solo una prova!" (hero_set challengeRerollMalus) non cambia i dadi:
        // se la prova fallisce si ripete il tiro una volta, con il malus indicato (vedi resolveChallenge).
        function challengeRollMode(hero) {
            if (!hero || !stato.challengeState) return { mode: 'single' };
            const stat = stato.challengeState.stat;
            const disadvantage = stat === 'fth' && hasCurse('fede_inaridita');
            const reroll = hero.challengeRerollMalus ? `Era solo una prova! Se fallisce, ${hero.name} ripete il tiro con −${hero.challengeRerollMalus}` : '';
            if (disadvantage) return { mode: 'worst', note: ['Fede Inaridita: si tirano due dadi e si tiene il più basso', reroll].filter(Boolean).join('. '), source: 'Fede Inaridita' };
            return { mode: 'single', note: reroll || undefined };
        }


        // Modificatori di una prova per l'eroe scelto, senza consumare le reliquie
        function challengeModifiers(hero) {
            const statValue = (hero && hero[stato.challengeState.stat]) || 0;
            const relics = relicDiceSources();
            return {
                statValue,
                relics,
                relicBonus: relics.reduce((sum, r) => sum + r.val, 0),
                rollMode: challengeRollMode(hero).mode,
                rerollMalus: (hero && hero.challengeRerollMalus) || 0,
                safetyNet: hasRelic('frammento_di_matrice')
            };
        }

        function challengeChanceInfo(mods) {
            const needed = stato.challengeState.cd - mods.statValue - mods.relicBonus;
            if (mods.safetyNet) return { short: 'Sicuro', long: `Riuscita garantita: ${relicName('frammento_di_matrice')} trasforma un fallimento in successo`, pct: 100 };
            const info = chanceText(needed, mods.rollMode === 'best', mods.rollMode === 'worst');
            if (!mods.rerollMalus) return info;
            // Era solo una prova!: un secondo tentativo con il malus se il primo fallisce
            // (stima: stesse reliquie anche al secondo tiro)
            const p1 = rollChance(needed, mods.rollMode === 'best', mods.rollMode === 'worst');
            const p2 = rollChance(needed + mods.rerollMalus, mods.rollMode === 'best', mods.rollMode === 'worst');
            const pct = Math.round((p1 + (1 - p1) * p2) * 100);
            const head = needed <= 2 ? '2+' : (needed >= 6 ? '6' : `${needed}+`);
            return { short: `${head} · ${pct}%`, long: `${info.long.replace(/: \d+% di riuscita$/, '')}; se fallisce ripete il tiro con −${mods.rerollMalus}: ${pct}% di riuscita`, pct };
        }

        function addChallengeLog(text) {
            const log = document.getElementById('challengeLog');
            log.classList.remove('hidden');
            log.innerHTML += `<div>${text}</div>`;
            log.scrollTop = log.scrollHeight;
        }

        // Risolve una prova: tiro (con svantaggio e ritiro di Dioforo), reliquie, ricompensa/punizione.
        // Muta unlockedRelics/activeCurses/expeditionStats. "events" sono le righe di log in ordine.
        function resolveChallenge(hero, challenge, rolls) {
            const events = [];
            const rollMode = challengeRollMode(hero);
            const twoDice = rollMode.mode !== 'single';
            const mods = challengeModifiers(hero);
            const statLabel = STAT_LABELS[challenge.stat] || 'Statistica';

            // Un tentativo: dadi (offset = indice del primo dado in "rolls"), statistica, reliquie, malus.
            // Le reliquie "al prossimo tiro" si consumano a ogni tentativo.
            const attempt = (offset, malus) => {
                const roll = rollD6(rolls, offset);
                let roll2 = null, kept = roll;
                if (twoDice) {
                    roll2 = rollD6(rolls, offset + 1);
                    kept = rollMode.mode === 'best' ? Math.max(roll, roll2) : Math.min(roll, roll2);
                    events.push({ type: 'roll2', text: `🎲 Dadi [${roll}, ${roll2}]: tiene <b>${kept}</b> (${rollMode.source})` });
                } else {
                    events.push({ type: 'roll', text: `🎲 Dado: <b>${roll}</b>` });
                }
                events.push({ type: 'stat', text: `+${mods.statValue} ${statLabel} (${hero ? hero.name : '—'})` });

                let relicBonus = 0;
                relicDiceSources().forEach(r => {
                    relicBonus += r.val;
                    events.push({ type: 'relic', text: `+${r.val} ${r.name}` });
                });
                spendNextRollRelics().forEach(text => events.push({ type: 'relic', text }));
                if (malus) events.push({ type: 'malus', text: `−${malus} secondo tentativo` });

                const total = kept + mods.statValue + relicBonus - malus;
                events.push({ type: 'total', text: `= <b>${total}</b> contro CD ${challenge.cd}` });
                const natural = naturalRollNote(kept, total, challenge.cd);
                if (natural) events.push({ type: 'natural', text: natural });
                return { roll, roll2, kept, relicBonus, total, success: naturalRollSuccess(kept, total, challenge.cd) };
            };

            const first = attempt(0, 0);
            let final = first, rerolled = false;
            // Era solo una prova! (Dioforo): una prova fallita si ritenta una volta, con il malus
            if (!first.success && hero && hero.challengeRerollMalus) {
                events.push({ type: 'reroll', text: `🔁 Era solo una prova! ${hero.name} ripete il tiro (−${hero.challengeRerollMalus})` });
                final = attempt(2, hero.challengeRerollMalus);
                rerolled = true;
            }
            const { roll, roll2, kept, relicBonus } = final;
            let { total, success } = final;

            if (!success && hasRelic('frammento_di_matrice')) {
                total = Math.max(total, challenge.cd);
                success = true;
                breakRelic('frammento_di_matrice');
                events.push({ type: 'relic', text: `${relicName('frammento_di_matrice')}: il fallimento diventa un successo (la reliquia si rompe)` });
            }

            events.push({ type: 'outcome', text: success ? '<b class="log-success">Successo</b>' : '<b class="log-fail">Fallimento</b>' });

            let rewardGranted = null, punishmentApplied = null;
            if (success) {
                if (challenge.reward) {
                    // Solo le reliquie restano nell'elenco: i premi immediati (es. monete) agiscono e basta
                    if (challenge.reward.type === 'relic') {
                        stato.unlockedRelics.push({ ...challenge.reward, id: challenge.reward.id || idFromName(challenge.reward.name) });
                    }
                    applyEffects(challenge.reward.effects);
                    if (challenge.reward.type === 'relic') discover('relics', challenge.reward.name);
                    rewardGranted = challenge.reward;
                }
                stato.expeditionStats.challengesPassed++;
            } else {
                if (challenge.punishment) {
                    const cursesBefore = stato.activeCurses.length;
                    applyEffects(challenge.punishment.effects);
                    if (challenge.punishment.type === 'curse') discover('curses', challenge.punishment.name);
                    const curseId = challenge.punishment.id || idFromName(challenge.punishment.name);
                    // Le maledizioni aggiunte dagli effetti prendono l'id della maledizione della libreria
                    stato.activeCurses.slice(cursesBefore).forEach(c => { c.id = curseId; });
                    if (stato.activeCurses.length === cursesBefore) {
                        stato.activeCurses.push({ id: curseId, text: `${challenge.punishment.name} (${challenge.punishment.desc})` });
                    }
                    punishmentApplied = challenge.punishment;
                }
                stato.expeditionStats.challengesFailed++;
            }

            const isFinal = challenge.stat === 'scelta_finale' || challenge.title === "Accampamento";

            return { roll, roll2, kept, twoDice, rollMode, mods, relicBonus, total, success, rerolled, firstAttempt: rerolled ? first : null, rewardGranted, punishmentApplied, isFinal, events };
        }

        // externalRolls: tiro/i già decisi da un telefono collegato via QR (vedi js/remote.js).
        function executeChallengeRoll(externalRolls) {
            const rollBtn = document.getElementById('rollChallengeBtn');
            if (rollBtn.disabled) return;

            const diceBox = document.getElementById('diceChallenge');
            const diceBox2 = document.getElementById('diceChallenge2');
            const rollMode = challengeRollMode(selectedChallengeHero);
            const twoDice = rollMode.mode !== 'single';
            rollBtn.disabled = true; diceBox.classList.add('rolling');
            if (twoDice) diceBox2.classList.add('rolling');
            synthSfx('dice');

            let counter = 0;
            const interval = setInterval(() => {
                diceBox.textContent = Math.floor(Math.random() * 6) + 1;
                if (twoDice) diceBox2.textContent = Math.floor(Math.random() * 6) + 1;
                counter += 50;
                if(counter >= 500) {
                    clearInterval(interval);

                    const res = resolveChallenge(selectedChallengeHero, stato.challengeState, externalRolls);
                    diceBox.textContent = res.roll;
                    diceBox.classList.remove('rolling');

                    if (res.twoDice) {
                        diceBox2.textContent = res.roll2;
                        diceBox2.classList.remove('rolling');
                        const secondKept = res.rollMode.mode === 'best' ? res.roll2 > res.roll : res.roll2 < res.roll;
                        (secondKept ? diceBox : diceBox2).classList.add('discarded');
                        document.getElementById('diceChallengeNote').textContent =
                            `${res.rollMode.source}: dadi [${res.roll}, ${res.roll2}], tiene ${res.kept}`;
                    }
                    if (res.rerolled) {
                        const note = document.getElementById('diceChallengeNote');
                        note.textContent = `Era solo una prova! Primo tiro ${res.firstAttempt.kept} fallito, ritentato con −${selectedChallengeHero.challengeRerollMalus}: ${res.kept}`;
                        note.classList.remove('hidden');
                    }

                    diceOutcomeSfx(res.kept);
                    res.events.forEach(ev => addChallengeLog(ev.text));

                    if(res.success) {
                        let rewardMsg = "";
                        if (res.rewardGranted) {
                            rewardMsg = `<br><strong style="color:var(--relic-color);">Reliquia ottenuta: ${res.rewardGranted.name} (${res.rewardGranted.desc})</strong>`;
                            showOutcomeOverlay('relic', res.rewardGranted);
                        }
                        document.getElementById('challengeNarrativeBox').innerHTML = `<strong>Successo! (${res.total} vs CD ${stato.challengeState.cd})</strong><br>${kw(stato.challengeState.successText || 'Prova superata!')}${rewardMsg}`;

                        if (res.isFinal) {
                            impostaAzione(document.getElementById('closeChallengeBtn'), 'showScreen', 'screenVictory');
                        } else {
                            impostaAzione(document.getElementById('closeChallengeBtn'), 'advanceNode');
                        }
                    } else {
                        let punishmentMsg = "";
                        if (res.punishmentApplied) {
                            punishmentMsg = `<br><strong style="color:var(--curse-color);">Maledizione subita: ${res.punishmentApplied.name} (${res.punishmentApplied.desc})</strong>`;
                            showOutcomeOverlay('curse', res.punishmentApplied);
                        }
                        document.getElementById('challengeNarrativeBox').innerHTML = `<strong>Fallimento! (${res.total} vs CD ${stato.challengeState.cd})</strong><br>${kw(stato.challengeState.failText || 'Prova fallita!')}${punishmentMsg}`;
                        impostaAzione(document.getElementById('closeChallengeBtn'), 'advanceNode');
                    }

                    updatePartyStatusBars();
                    document.getElementById('closeChallengeBtn').classList.remove('hidden');
                }
            }, 50);
        }

        // Risolve un riposo: cura party, rimuove Gelo nelle ossa e (a caso) 1 maledizione con Pietra del focolare.
        function resolveRest() {
            const healAmount = 1 + (hasRelic('unguento_dell_erborista') ? 1 : 0);
            const healed = [];
            stato.party.forEach(h => {
                // Un eroe caduto (0 HP) si rialza con 1 HP
                if (h.hp <= 0) {
                    h.hp = 1;
                    healed.push({ name: h.name, gained: 1, hp: h.hp, maxHp: h.maxHp, revived: true });
                    return;
                }
                const before = h.hp;
                h.hp = Math.min(h.maxHp, h.hp + healAmount);
                healed.push({ name: h.name, gained: h.hp - before, hp: h.hp, maxHp: h.maxHp });
            });

            // Favore di Valgoren: il riposo è una cura, quindi 1 HP in più a un eroe ancora ferito
            const healedSomeone = healed.some(h => h.gained > 0);
            const valgoren = healedSomeone ? valgorenEcho(null) : null;
            if (valgoren) {
                const line = healed.find(h => h.name === valgoren.name);
                if (line) { line.gained += 1; line.hp = valgoren.hp; line.valgoren = true; }
            }

            let geloRemoved = false;
            const geloIdx = stato.activeCurses.findIndex(c => c.id === 'gelo_nelle_ossa');
            if (geloIdx > -1) {
                stato.activeCurses.splice(geloIdx, 1);
                stato.party.forEach(h => { h.att_penalty = Math.max(0, (h.att_penalty || 0) - 1); });
                geloRemoved = true;
            }

            if (hasRelic('pietra_del_focolare') && stato.activeCurses.length > 0) {
                const rIdx = Math.floor(Math.random() * stato.activeCurses.length);
                stato.activeCurses.splice(rIdx, 1);
            }

            return { healAmount, healed, geloRemoved };
        }

        /* ---------- Nodo di trama ----------
           Solo racconto: titolo, immagine e testo (campagna: "stories" { chiave: { title, text } },
           il nodo li richiama con storyId), poi si prosegue sulla mappa. */
        function startStory(node) {
            const story = (stato.currentCampaign.stories || {})[node.storyId] || {};
            document.getElementById('storyTitle').textContent = story.title || node.title || 'Trama';
            // Senza immagine del nodo: la copertina della campagna
            document.getElementById('storyImg').src = node.image || stato.currentCampaign.coverImage || 'immagini/inizio_campagna.webp';
            const testo = story.text || 'Il viaggio prosegue.';
            document.getElementById('storyDescBox').innerHTML = testo.split(/\n\s*\n/).map(p => `<p>${esc(p)}</p>`).join('');
            showScreen('screenStory');
        }

        function finishStory() {
            advanceNode();
        }

        function startRest(restId) {
            showScreen('screenRest');
            const restDesc = restsData[restId] || "Trovate un luogo sicuro dove riposare e recuperare le forze.";
            document.getElementById('restDescBox').innerHTML = `<strong>Descrizione:</strong> ${kw(restDesc)}`;

            const res = resolveRest();
            const healLines = res.healed.map(h => h.revived
                ? `${esc(h.name)}: si rialza (${h.hp}/${h.maxHp})`
                : h.gained > 0
                    ? `${esc(h.name)}: +${h.gained} HP (${h.hp}/${h.maxHp})${h.valgoren ? ' · Favore di Valgoren' : ''}`
                    : `${esc(h.name)}: già in piena salute`);
            document.getElementById('restDescBox').innerHTML += `<br><br><strong>Il riposo vi ristora:</strong><br>${healLines.join('<br>')}`;
            if (res.geloRemoved) {
                document.getElementById('restDescBox').innerHTML += `<br>Il calore del fuoco scioglie il <strong>Gelo nelle ossa</strong>: la penalità ai tiri per colpire svanisce.`;
            }
            updatePartyStatusBars();
        }

        function startCaptainFinale() {
            showScreen('screenCaptain');
            // La schermata può essere già stata usata in una partita precedente della stessa pagina: torna come all'inizio
            document.getElementById('captainHeroSelect').style.display = '';
            document.getElementById('diceCaptainSection').classList.add('hidden');
            document.getElementById('rollCaptainBtn').disabled = false;
            document.getElementById('resultCaptainLog').innerHTML = '';
            document.getElementById('endGameBtn').classList.add('hidden');
            document.getElementById('captainHeroSelect').innerHTML = stato.party.filter(p => p.hp > 0).map(h => `<option value="${h.name}">${h.name}</option>`).join('');
        }

        let captainActionType = ''; let selectedCaptainHero = null;
        function captainAction(type) {
            captainActionType = type;
            selectedCaptainHero = stato.party.find(p => p.name === document.getElementById('captainHeroSelect').value);
            document.getElementById('captainHeroSelect').style.display = 'none';
            document.getElementById('diceCaptainSection').classList.remove('hidden');
        }

        // Risolve l'azione del finale "capitano": 'force' dimezza gli HP, 'faith'/'int' tirano contro CD 6.
        function resolveCaptainAction(hero, type) {
            if (type === 'force') {
                const roll = Math.floor(Math.random() * 6) + 1;  // solo scena: la forza non tira davvero
                hero.hp = Math.max(1, Math.floor(hero.hp / 2));
                return { type, roll, success: null };
            }
            const roll = rollD6(null, 0);
            const statVal = type === 'faith' ? hero.fth : hero.int;
            const relicBonus = relicDiceBonus();  // anche qui valgono le reliquie dei tiri
            spendNextRollRelics();
            const success = naturalRollSuccess(roll, roll + statVal + relicBonus, 6);
            return { type, roll, statVal, relicBonus, success };
        }

        function executeCaptainRoll() {
            const rollBtn = document.getElementById('rollCaptainBtn');
            const diceBox = document.getElementById('diceCaptain');
            rollBtn.disabled = true; diceBox.classList.add('rolling');
            synthSfx('dice');

            let counter = 0;
            const interval = setInterval(() => {
                diceBox.textContent = Math.floor(Math.random() * 6) + 1;
                counter += 50;
                if(counter >= 500) {
                    clearInterval(interval);
                    const res = resolveCaptainAction(selectedCaptainHero, captainActionType);
                    diceBox.textContent = res.roll; diceBox.classList.remove('rolling');
                    diceOutcomeSfx(res.roll);

                    if (res.type === 'force') {
                        document.getElementById('resultCaptainLog').innerHTML = `<span style="color:#ff4d4d;">RAMANZINA!</span> Perdi il 50% degli HP.`;
                    } else if (res.success) {
                        document.getElementById('resultCaptainLog').innerHTML = `<span style="color:var(--gold);">VITTORIA!</span> Meta raggiunta!${res.roll === 6 ? ' (6 naturale)' : ''}`;
                    } else {
                        document.getElementById('resultCaptainLog').innerHTML = `<span style="color:#ff4d4d;">FALLITO!</span>${res.roll === 1 ? ' (1 naturale)' : ''}`;
                    }
                    updatePartyStatusBars();

                    const endBtn = document.getElementById('endGameBtn');
                    endBtn.classList.remove('hidden');
                    endBtn.textContent = "Vedi Vittoria / Fine Campagna";
                    impostaAzione(endBtn, 'showScreen', 'screenVictory');
                }
            }, 50);
        }
