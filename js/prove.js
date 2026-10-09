/* ==========================================================================
   SFIDE, RIPOSO E FINALE DEL CAPITANO
   Prove di Intelligenza e Fede con premi e punizioni, riposo, finale del capitano.
   Diviso da js/game.js: stesso ambito globale (usa stato, LIBRERIA, showScreen...).
   Caricato subito dopo js/game.js; le funzioni si chiamano tra file solo dopo il caricamento.
   ========================================================================== */

        /* ==========================================================================
           GESTIONE SFIDE
           ========================================================================== */
        // Il nodo corrente è l'ultimo della mappa (nessun collegamento dopo)?
        function isFinalNode() {
            const node = stato.stsMapNodes.find(n => n.id === stato.currentNodeId);
            return !!node && (node.next || []).length === 0;
        }

        // Finale perso (prova finale fallita o capitano non convinto): la spedizione fallisce e, come
        // per la sconfitta in combattimento, lo slot in uso si cancella. Il nodo non conta come superato.
        function finishLostFinal() {
            const node = stato.stsMapNodes.find(n => n.id === stato.currentNodeId);
            if (node) node.active = false;
            deleteCurrentSave();
            showScreen('screenDefeat');
        }

        // Finale vinto dal capitano: il nodo conta come fatto nel riepilogo
        function finishWonFinal() {
            const node = stato.stsMapNodes.find(n => n.id === stato.currentNodeId);
            if (node) { node.done = true; node.active = false; }
            showScreen('screenVictory');
        }

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
            // La prova finale non si può lasciar perdere
            const ignoreBtn = document.querySelector('#challengeStage1 [data-args=\'[false]\']');
            if (ignoreBtn) ignoreBtn.classList.toggle('hidden', isFinalNode());
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
                // Reliquie che valgono anche al ritiro di Dioforo (non quelle "al prossimo tiro")
                lastingRelicBonus: relics.filter(r => !r.nextRoll).reduce((sum, r) => sum + r.val, 0),
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
            // Era solo una prova!: un secondo tentativo con il malus se il primo fallisce,
            // senza le reliquie "al prossimo tiro" (consumate dal primo)
            const needed2 = stato.challengeState.cd - mods.statValue - (mods.lastingRelicBonus || 0) + mods.rerollMalus;
            const p1 = rollChance(needed, mods.rollMode === 'best', mods.rollMode === 'worst');
            const p2 = rollChance(needed2, mods.rollMode === 'best', mods.rollMode === 'worst');
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
            // Le reliquie "al prossimo tiro" (Anello, Sigillo) valgono e si consumano solo al primo
            // tentativo: il ritiro di Dioforo è lo stesso tiro ripetuto, non un tiro nuovo.
            const attempt = (offset, malus) => {
                const reroll = malus > 0;
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
                relicDiceSources().filter(r => !reroll || !r.nextRoll).forEach(r => {
                    relicBonus += r.val;
                    events.push({ type: 'relic', text: `+${r.val} ${r.name}` });
                });
                if (!reroll) spendNextRollRelics().forEach(text => events.push({ type: 'relic', text }));
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
                const relicId = challenge.reward && challenge.reward.type === 'relic' && (challenge.reward.id || idFromName(challenge.reward.name));
                if (relicId && hasRelic(relicId)) {
                    // Una reliquia si possiede una volta sola (la stessa sfida può tornare, es. nelle campagne procedurali)
                    events.push({ type: 'relic', text: `${challenge.reward.name}: la compagnia la possiede già` });
                } else if (challenge.reward) {
                    // Solo le reliquie restano nell'elenco: i premi immediati (es. monete) agiscono e basta
                    if (relicId) stato.unlockedRelics.push({ ...challenge.reward, id: relicId });
                    applyEffects(challenge.reward.effects, hero);
                    if (relicId) discover('relics', challenge.reward.name);
                    rewardGranted = challenge.reward;
                }
                stato.expeditionStats.challengesPassed++;
            } else {
                if (challenge.punishment) {
                    const cursesBefore = stato.activeCurses.length;
                    // Quanto cambiano davvero le statistiche (party_stat non scende sotto 0): serve per
                    // restituire il giusto quando la maledizione viene tolta (removeCurseAt)
                    const statKeys = [...new Set((challenge.punishment.effects || []).filter(e => e.effect === 'party_stat').map(e => e.stat))];
                    // Si misura senza i bonus ricalcolati (Factotum, oggetti che scalano): quelli tornano da soli
                    const own = (h, k) => (h[k] || 0) - ((h.factotumBonus || {})[k] || 0) - ((h.scaledBonus || {})[k] || 0);
                    const before = stato.party.map(h => statKeys.map(k => own(h, k)));
                    applyEffects(challenge.punishment.effects, hero);
                    const applied = {};
                    stato.party.forEach((h, i) => statKeys.forEach((k, j) => {
                        const d = own(h, k) - before[i][j];
                        if (d) (applied[h.name] = applied[h.name] || {})[k] = d;
                    }));
                    if (challenge.punishment.type === 'curse') discover('curses', challenge.punishment.name);
                    const curseId = challenge.punishment.id || idFromName(challenge.punishment.name);
                    // Le maledizioni aggiunte dagli effetti prendono l'id della maledizione della libreria
                    stato.activeCurses.slice(cursesBefore).forEach(c => { c.id = curseId; });
                    if (stato.activeCurses.length === cursesBefore) {
                        stato.activeCurses.push({ id: curseId, text: `${challenge.punishment.name} (${challenge.punishment.desc})` });
                    }
                    if (statKeys.length) stato.activeCurses[stato.activeCurses.length - 1].applied = applied;
                    punishmentApplied = challenge.punishment;
                }
                stato.expeditionStats.challengesFailed++;
            }

            // Prova sull'ultimo nodo della mappa: la riuscita è la vittoria, il fallimento la sconfitta
            const isFinal = isFinalNode();

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

                        impostaAzione(document.getElementById('closeChallengeBtn'), 'advanceNode');
                    } else {
                        let punishmentMsg = "";
                        if (res.punishmentApplied) {
                            punishmentMsg = `<br><strong style="color:var(--curse-color);">Maledizione subita: ${res.punishmentApplied.name} (${res.punishmentApplied.desc})</strong>`;
                            showOutcomeOverlay('curse', res.punishmentApplied);
                        }
                        document.getElementById('challengeNarrativeBox').innerHTML = `<strong>Fallimento! (${res.total} vs CD ${stato.challengeState.cd})</strong><br>${kw(stato.challengeState.failText || 'Prova fallita!')}${punishmentMsg}`;
                        impostaAzione(document.getElementById('closeChallengeBtn'), res.isFinal ? 'finishLostFinal' : 'advanceNode');
                    }

                    updatePartyStatusBars();
                    document.getElementById('closeChallengeBtn').classList.remove('hidden');
                }
            }, 50);
        }

        // Toglie una maledizione e ne annulla i malus fissi (party_stat: -Fede, -Int, +penalità al tiro).
        // Se la maledizione ricorda quanto ha tolto a ogni eroe ("applied", scritto da resolveChallenge)
        // si restituisce esattamente quello: chi era già a 0 non guadagna punti. Altrimenti (salvataggi
        // vecchi) gli effetti si cercano nella libreria Maledizioni, poi nelle punizioni delle sfide.
        function removeCurseAt(idx) {
            const curse = stato.activeCurses[idx];
            if (!curse) return;
            stato.activeCurses.splice(idx, 1);
            if (curse.applied) {
                stato.party.forEach(h => Object.entries(curse.applied[h.name] || {}).forEach(([k, d]) => {
                    h[k] = Math.max(0, (h[k] || 0) - d);
                }));
                stato.party.forEach(refreshScaledBonuses);
                return;
            }
            const fromLib = (LIBRERIA.maledizioni || {})[curse.id];
            const fromChallenge = Object.values(challengesData || {}).map(c => c.punishment)
                .find(p => p && typeof p === 'object' && (p.id || idFromName(p.name || '')) === curse.id);
            const effects = (fromLib || fromChallenge || {}).effects || [];
            effects.filter(e => e.effect === 'party_stat').forEach(e => {
                stato.party.forEach(h => { h[e.stat] = Math.max(0, (h[e.stat] || 0) - e.val); });
            });
            stato.party.forEach(refreshScaledBonuses);
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
                removeCurseAt(geloIdx);
                geloRemoved = true;
            }

            if (hasRelic('pietra_del_focolare') && stato.activeCurses.length > 0) {
                removeCurseAt(Math.floor(Math.random() * stato.activeCurses.length));
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
            // Come le altre schermate degli eventi: "Descrizione:" in apertura del primo paragrafo
            document.getElementById('storyDescBox').innerHTML = testo.split(/\n\s*\n/)
                .map((p, i) => `<p>${i === 0 ? '<strong>Descrizione:</strong> ' : ''}${esc(p)}</p>`).join('');
            showScreen('screenStory');
        }

        function finishStory() {
            advanceNode();
        }

        // Rune: uno scambio per eroe a ogni riposo (swapRune in js/creazione.js)
        let restRuneSwapped = [];
        function restRuneButtonsHtml() {
            return stato.party.filter(h => heroHasRunes(h) && !restRuneSwapped.includes(h.name)
                && h.runeOptions.some(id => !(h.equippedRunes || []).includes(id)))
                .map(h => `<button class="btn-proceed rune-swap-btn" ${azione('openRuneSwap', h.name)}>Scambia una runa di ${esc(h.name)}</button>`).join('');
        }

        function renderRestRuneButtons() {
            const box = document.getElementById('restRuneArea');
            if (box) box.innerHTML = restRuneButtonsHtml();
        }

        // Lo scambio del riposo, dalla finestra del gioco o dal telefono (evento rune-swap in js/remote.js)
        function restSwapRune(heroName, out, into) {
            if (currentScreenId !== 'screenRest' || restRuneSwapped.includes(heroName)) return false;
            if (!swapRune(heroName, out, into)) return false;
            restRuneSwapped.push(heroName);
            const name = id => (runeData(id) || {}).name || id;
            uiMessage(`${heroName} sostituisce la ${name(out)} con la ${name(into)}`);
            renderRestRuneButtons();
            updatePartyStatusBars();
            return true;
        }

        function openRuneSwap(heroName) {
            const hero = stato.party.find(h => h.name === heroName);
            if (!heroHasRunes(hero) || restRuneSwapped.includes(heroName)) return;
            const equipped = hero.equippedRunes || [];
            const others = hero.runeOptions.filter(id => !equipped.includes(id));
            const name = id => (runeData(id) || {}).name || id;
            const line = id => `<li><b>${esc(name(id))}</b>: ${kw((runeData(id) || {}).desc || '')}</li>`;
            const buttons = equipped.flatMap(out => others.map(into => ({
                label: `${name(out)} → ${name(into)}`,
                className: 'btn-proceed',
                onClick: () => restSwapRune(heroName, out, into)
            })));
            openModal(`Rune di ${esc(hero.name)}`,
                `<p>Equipaggiate:</p><ul>${equipped.map(line).join('')}</ul><p>Disponibili:</p><ul>${others.map(line).join('')}</ul>`,
                buttons.concat([{ label: 'Tieni le rune', className: 'btn-danger' }]));
        }

        /* ---------- Preghiera ai riposi ----------
           Un eroe per riposo prega: d6 + Fede (+ reliquie dei tiri) contro PRAYER_CD, con le regole di sempre
           (naturalRollSuccess). Con PRAYER_MAJOR_TOTAL o più, o con un 6, benedizione maggiore. Se riesce si pescano
           PRAYER_CHOICES benedizioni del livello (PRAYER_BLESSINGS in js/regole.js) e se ne sceglie una: quelle
           "eroe" vanno all'eroe scelto, quelle "party" a tutti. Le benedizioni che restano sull'eroe stanno in
           hero.blessings ([{ id, n }]) e si vedono sulla carta (heroBlessingsHtml in js/oggetti.js). */
        let restPrayer = null;   // null = nessuno ha pregato in questo riposo; poi { hero, roll, total, success, major, choices, chosen, text }

        const blessingData = id => PRAYER_BLESSINGS[id] ? { id, ...PRAYER_BLESSINGS[id] } : null;
        const hasBlessing = (hero, id) => !!(hero.blessings || []).find(x => x.id === id);

        // Benedizioni che adesso servono a qualcosa (niente Purificazione senza maledizioni, niente cure se nessuno è ferito)
        function blessingUseful(b) {
            if (b.effetto === 'togli_maledizione') return stato.activeCurses.length > 0;
            if (b.effetto === 'cura_party') return stato.party.some(h => h.hp > 0 && h.hp < h.maxHp);
            if (b.effetto === 'miracolo') return stato.party.some(h => h.hp < h.maxHp);
            return true;
        }

        function pickBlessings(major) {
            const pool = Object.keys(PRAYER_BLESSINGS).map(blessingData)
                .filter(b => b.livello === (major ? 'maggiore' : 'minore') && blessingUseful(b));
            const out = [];
            while (pool.length && out.length < PRAYER_CHOICES) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
            return out;
        }

        // Tiro della preghiera, senza interfaccia (usato anche dal simulatore)
        function prayerRoll(hero) {
            const roll = rollD6(null, 0);
            const relics = relicDiceBonus();
            const total = roll + (hero.fth || 0) + relics;
            const notes = spendNextRollRelics();
            const success = naturalRollSuccess(roll, total, PRAYER_CD);
            return { roll, total, relics, notes, success, major: success && (roll === 6 || total >= PRAYER_MAJOR_TOTAL),
                naturalNote: naturalRollNote(roll, total, PRAYER_CD) };
        }

        // Dà una benedizione: hero = chi la riceve (per quelle "eroe"). Ritorna il testo per il giocatore
        function applyBlessing(b, hero) {
            if (b.bersaglio === 'eroe') {
                if (!hero || hero.hp <= 0) return '';
                if (b.effetto === 'fede') { hero.fth = (hero.fth || 0) + (b.val || 1); refreshScaledBonuses(hero); }
                const list = hero.blessings = hero.blessings || [];
                const same = list.find(x => x.id === b.id);
                if (same) same.n = (same.n || 1) + 1; else list.push({ id: b.id, n: 1 });
                return `${hero.name} riceve ${b.name}: ${b.desc.charAt(0).toLowerCase()}${b.desc.slice(1)}.`;
            }
            let text = `${b.name}: ${b.desc.charAt(0).toLowerCase()}${b.desc.slice(1)}.`;
            if (b.effetto === 'cura_party') stato.party.filter(h => h.hp > 0).forEach(h => healHero(h, b.val || 1));
            if (b.effetto === 'miracolo') stato.party.forEach(h => healHero(h, h.maxHp));
            if (b.effetto === 'togli_maledizione' && stato.activeCurses.length) {
                text = `${b.name}: svanisce ${curseText(stato.activeCurses[stato.activeCurses.length - 1])}.`;
                removeCurseAt(stato.activeCurses.length - 1);
            }
            return text;
        }

        // Toglie una carica della benedizione (Grazia usata); le altre restano
        function spendBlessing(hero, id) {
            const list = hero.blessings || [];
            const i = list.findIndex(x => x.id === id);
            if (i < 0) return;
            if ((list[i].n || 1) > 1) list[i].n--; else list.splice(i, 1);
        }

        // Inizio di uno scontro (gioco e simulatore): le benedizioni "al prossimo scontro" diventano potenziamenti
        // fino alla fine dello scontro (con la loro icona tra i buff della carta). Ritorna [{ hero, b }] per il diario
        function applyCombatBlessings() {
            const used = [];
            stato.party.filter(h => h.hp > 0 && h.blessings && h.blessings.length).forEach(h => {
                h.blessings = h.blessings.filter(x => {
                    const b = blessingData(x.id);
                    if (!b || b.effetto !== 'prossimo_scontro') return true;
                    applyTempBuff(h, { buff_stat: b.buff_stat, buff_val: b.buff_val * (x.n || 1), buff_rounds: 0, name: b.name, icon: b.icon });
                    used.push({ hero: h, b });
                    return false;
                });
            });
            return used;
        }

        // Esito della preghiera (senza animazione: la chiama executePrayerRoll dopo il dado, e i test)
        function prayAtRest(heroName) {
            const hero = stato.party.find(h => h.name === heroName && h.hp > 0);
            if (currentScreenId !== 'screenRest' || restPrayer || !hero) return null;
            const res = prayerRoll(hero);
            restPrayer = { hero: hero.name, ...res, choices: res.success ? pickBlessings(res.major) : [], chosen: null, text: '' };
            renderRestPrayer();
            return restPrayer;
        }

        // Scelta della benedizione: quelle per un eroe chiedono poi a chi darla
        function chooseBlessing(idx) {
            if (!restPrayer || restPrayer.text) return;
            const b = restPrayer.choices[idx];
            if (!b) return;
            restPrayer.chosen = idx;
            if (b.bersaglio === 'party') { giveBlessing(null); return; }
            renderRestPrayer();
        }

        function giveBlessing(heroName) {
            if (!restPrayer || restPrayer.text || restPrayer.chosen == null) return;
            const b = restPrayer.choices[restPrayer.chosen];
            const hero = heroName ? stato.party.find(h => h.name === heroName) : null;
            const text = applyBlessing(b, hero);
            if (!text) return;
            restPrayer.text = text;
            uiMessage(text);
            renderRestPrayer();
            updatePartyStatusBars();
        }

        // Schermata del riposo all'arrivo: solo il pulsante "Uno di voi si raccoglie in preghiera"
        function resetPrayerUI() {
            restPrayer = null;
            document.getElementById('prayerStage1').classList.toggle('hidden', !stato.party.some(h => h.hp > 0));
            document.getElementById('prayerStage2').classList.add('hidden');
            document.getElementById('dicePrayerSection').classList.add('hidden');
            const log = document.getElementById('prayerLog');
            log.innerHTML = '';
            log.classList.add('hidden');
            document.getElementById('restPrayerArea').innerHTML = '';
        }

        // Come le sfide: prima si sceglie chi prega (con Fede e probabilità), poi si tira il dado
        function startPrayer() {
            if (restPrayer) return;
            document.getElementById('prayerStage1').classList.add('hidden');
            document.getElementById('prayerStage2').classList.remove('hidden');
            document.getElementById('prayerHeroSelect').innerHTML = stato.party.filter(h => h.hp > 0).map(h =>
                `<option value="${esc(h.name)}">${esc(h.name)} (Fede ${h.fth || 0}) · ${prayerChance(h).short}</option>`).join('');
        }

        const prayerChance = hero => chanceText(PRAYER_CD - (hero.fth || 0) - relicDiceBonus());

        let selectedPrayerHero = null;
        function confirmPrayerHero() {
            selectedPrayerHero = stato.party.find(h => h.hp > 0 && h.name === document.getElementById('prayerHeroSelect').value);
            if (!selectedPrayerHero) return;
            document.getElementById('prayerStage2').classList.add('hidden');
            document.getElementById('dicePrayerSection').classList.remove('hidden');
            document.getElementById('prayerCdText').textContent = `Prova di Fede (Classe di Difficoltà: ${PRAYER_CD}; con ${PRAYER_MAJOR_TOTAL} o un 6 benedizione maggiore)`;
            const info = prayerChance(selectedPrayerHero);
            const chanceEl = document.getElementById('prayerChance');
            chanceEl.textContent = `${selectedPrayerHero.name}, Fede ${selectedPrayerHero.fth || 0}. ${info.long}`;
            chanceEl.dataset.chance = info.pct >= 67 ? 'high' : (info.pct >= 34 ? 'mid' : 'low');
            document.getElementById('dicePrayer').textContent = '6';
            document.getElementById('rollPrayerBtn').disabled = false;
        }

        function addPrayerLog(text, cls = '') {
            const log = document.getElementById('prayerLog');
            log.classList.remove('hidden');
            log.innerHTML += `<div class="${cls}">${text}</div>`;
            log.scrollTop = log.scrollHeight;
        }

        function executePrayerRoll() {
            const btn = document.getElementById('rollPrayerBtn');
            if (btn.disabled || !selectedPrayerHero) return;
            btn.disabled = true;
            const diceBox = document.getElementById('dicePrayer');
            diceBox.classList.add('rolling');
            synthSfx('dice');
            let counter = 0;
            const interval = setInterval(() => {
                diceBox.textContent = Math.floor(Math.random() * 6) + 1;
                counter += 50;
                if (counter < 500) return;
                clearInterval(interval);
                const p = prayAtRest(selectedPrayerHero.name);
                diceBox.classList.remove('rolling');
                if (!p) return;
                diceBox.textContent = p.roll;
                diceOutcomeSfx(p.roll);
                const fth = p.total - p.roll - p.relics;
                addPrayerLog(`${esc(p.hero)}: dado ${p.roll} + Fede ${fth}${p.relics ? ` + reliquie ${p.relics}` : ''} = <b>${p.total}</b> (CD ${PRAYER_CD})`);
                if (p.notes.length) addPrayerLog(`💎 Reliquie: ${esc(p.notes.join(', '))}`);
                if (p.naturalNote) addPrayerLog(esc(p.naturalNote));
                addPrayerLog(p.success ? (p.major ? '✨ Gli dei rispondono con forza: benedizione maggiore!' : '🙏 La preghiera è ascoltata!')
                    : 'Gli dei tacciono. Nessuna benedizione questa volta.', p.success ? 'log-success' : 'log-fail');
                btn.classList.add('hidden');
            }, 50);
        }

        const blessingIcon = b => `<img class="prayer-icon" src="${esc(b.icon)}" alt="">`;

        // Benedizioni da scegliere dopo una preghiera riuscita, poi a chi darla (sotto il dado)
        function renderRestPrayer() {
            const box = document.getElementById('restPrayerArea');
            if (!box) return;
            const p = restPrayer;
            if (!p || !p.success) { box.innerHTML = ''; return; }
            if (!p.choices.length) { box.innerHTML = '<p class="prayer-result">Non c\'è nulla da benedire adesso.</p>'; return; }
            let html = `<p class="panel-label">${p.text ? 'Benedizione ricevuta' : 'Scegli una benedizione:'}</p>
                <div class="prayer-choices">${p.choices.map((b, i) => `
                <button class="armory-btn prayer-choice ${p.chosen === i ? 'selected' : ''} ${b.livello === 'maggiore' ? 'major' : ''}" ${azione('chooseBlessing', i)} ${p.text && p.chosen !== i ? 'disabled' : ''}>
                    ${blessingIcon(b)}
                    <span class="tile-text"><strong>${esc(b.name)}</strong><span class="tile-sub">${esc(b.desc)}</span>
                    <span class="tile-tag">${b.bersaglio === 'eroe' ? 'Su un eroe' : 'Su tutta la compagnia'}</span></span>
                </button>`).join('')}</div>`;
            const chosen = p.chosen != null ? p.choices[p.chosen] : null;
            if (p.text) html += `<p class="prayer-result done">${blessingIcon(chosen)} ${esc(p.text)}</p>`;
            else if (chosen && chosen.bersaglio === 'eroe') {
                html += `<p class="panel-label">A chi va ${esc(chosen.name)}?</p><div class="prayer-heroes">${stato.party.filter(h => h.hp > 0)
                    .map(h => `<button class="btn-proceed prayer-hero-btn" ${azione('giveBlessing', h.name)}>${esc(h.name)}</button>`).join('')}</div>`;
            }
            box.innerHTML = html;
        }

        function startRest(restId) {
            showScreen('screenRest');
            restRuneSwapped = [];
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
            document.getElementById('restDescBox').innerHTML += '<div id="restRuneArea" class="rest-rune-area"></div>';
            renderRestRuneButtons();
            resetPrayerUI();
            document.getElementById('rollPrayerBtn').classList.remove('hidden');
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
            // Anche qui valgono le reliquie dei tiri; la Catena di Norgrad vale contro il capitano
            const relicBonus = relicDiceBonus() + (hasRelic('catena_di_norgrad') ? 1 : 0);
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
                    // Il capitano non convinto (tiro fallito) è una sconfitta; la ramanzina (forza) chiude comunque la campagna
                    const lost = res.success === false;
                    endBtn.textContent = lost ? "Vedi Sconfitta / Fine Campagna" : "Vedi Vittoria / Fine Campagna";
                    impostaAzione(endBtn, lost ? 'finishLostFinal' : 'finishWonFinal');
                }
            }, 50);
        }
