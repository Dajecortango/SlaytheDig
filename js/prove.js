/* ==========================================================================
   SFIDE, RIPOSO, EVENTI E FINALE DEL CAPITANO: INTERFACCIA
   Schermate delle prove (con i modi di affrontarle), del riposo con la preghiera, dei nodi di trama e degli
   eventi, del finale del capitano. Le regole sono in js/motore/prove.js (usate anche dal simulatore).
   Stesso ambito globale degli altri file (usa stato, LIBRERIA, showScreen...).
   Caricato subito dopo js/game.js; le funzioni si chiamano tra file solo dopo il caricamento.
   ========================================================================== */

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
            // Strade: un pulsante per ogni approccio al posto di "Uno di voi si avvicina"
            const roads = stato.challengeState.strade || [];
            const roadBox = document.getElementById('challengeRoads');
            if (roadBox) roadBox.innerHTML = roads.map((r, i) => `<button class="btn-block" ${azione('challengeChooseRoad', i)} ${roadCoinCost(r) > stato.partyCoins ? 'disabled' : ''}>${String.fromCharCode(97 + i)}) ${esc(roadLabel(r, stato.challengeState))}</button>`).join('');
            const approachBtn = document.querySelector('#challengeStage1 [data-args=\'[true]\']');
            if (approachBtn) approachBtn.classList.toggle('hidden', roads.length > 0);
            // La prova finale non si può lasciar perdere
            const ignoreBtn = document.querySelector('#challengeStage1 [data-args=\'[false]\']');
            if (ignoreBtn) ignoreBtn.classList.toggle('hidden', isFinalNode());
            // La lettera di "Lascia perdere" segue quelle dei modi di affrontarla
            if (ignoreBtn) ignoreBtn.textContent = `${String.fromCharCode(97 + Math.max(1, roads.length))}) Lascia perdere`;
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

        // Scelta di una strada: la prova prende statistica, difficoltà, testi, premio e punizione di quella strada
        function challengeChooseRoad(i) {
            const original = stato.challengeState.base || stato.challengeState;  // la sfida com'è nella campagna
            const road = (original.strade || [])[i];
            if (!road) return;
            if (roadCoinCost(road) > stato.partyCoins) { uiError('Non avete abbastanza Scudi'); return; }
            stato.challengeState = { ...challengeWithRoad(original, i), base: original };
            // Il prezzo della strada si paga subito, prima del tiro
            if ((road.prezzo || []).length) {
                applyEffects(road.prezzo);
                updatePartyStatusBars();
                uiMessage(`${road.testo || 'Strada scelta'}: ${roadPriceText(road)}`);
            }
            challengeChoose(true);
        }

        let selectedChallengeHero = null;
        let challengeRetryPending = false;   // Era solo una prova!: il primo tiro è fallito, si aspetta il secondo
        function confirmChallengeHero() {
            challengeRetryPending = false;
            selectedChallengeHero = stato.party.filter(p => p.hp > 0).find(p => p.name === document.getElementById('challengeHeroSelect').value);
            document.getElementById('challengeStage2').classList.add('hidden');
            document.getElementById('diceChallengeSection').classList.remove('hidden');
            revealInView('rollChallengeBtn');

            const statLabel = STAT_LABELS[stato.challengeState.stat] || 'Statistica';
            const malus = Number(stato.challengeState.malus) || 0;
            document.getElementById('challengeCdText').textContent = `Prova di ${statLabel} (Classe di Difficoltà: ${stato.challengeState.cd}${malus ? `, −${malus} al tiro` : ''})`;

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

        // Era solo una prova!: primo tiro fallito, il pulsante torna attivo per il secondo dado (anche dal telefono:
        // js/remote.js avvolge questa funzione e chiede un nuovo tiro)
        function askChallengeRetry(res) {
            const malus = selectedChallengeHero.challengeRerollMalus;
            challengeRetryPending = true;
            showRollBanner(false, 'Era solo una prova!', `${res.total} contro CD ${stato.challengeState.cd}: ritenta con −${malus}`);
            const note = document.getElementById('diceChallengeNote');
            note.textContent = `Primo tiro fallito (${res.kept}). Era solo una prova! ${selectedChallengeHero.name} può ritentare con −${malus}`;
            note.classList.remove('hidden');
            document.getElementById('diceChallenge').classList.remove('discarded');
            document.getElementById('diceChallenge2').classList.remove('discarded');
            const btn = document.getElementById('rollChallengeBtn');
            btn.textContent = res.twoDice ? `Ritenta (2D6, −${malus})` : `Ritenta (D6, −${malus})`;
            btn.disabled = false;
            revealInView('rollChallengeBtn');
        }

        function addChallengeLog(text) {
            const log = document.getElementById('challengeLog');
            log.classList.remove('hidden');
            log.innerHTML += `<div>${text}</div>`;
            log.scrollTop = log.scrollHeight;
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
                diceBox.textContent = Math.floor(rng() * 6) + 1;
                if (twoDice) diceBox2.textContent = Math.floor(rng() * 6) + 1;
                counter += 50;
                if(counter >= animTime(500)) {
                    clearInterval(interval);

                    const retry = challengeRetryPending;
                    challengeRetryPending = false;
                    const res = resolveChallenge(selectedChallengeHero, stato.challengeState, externalRolls, retry ? { ritiro: true } : { chiediRitiro: true });
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
                        note.textContent = `Era solo una prova! Secondo tiro con −${selectedChallengeHero.challengeRerollMalus}: ${res.kept}`;
                        note.classList.remove('hidden');
                    }

                    diceOutcomeSfx(res.kept);
                    res.events.forEach(ev => addChallengeLog(ev.text));
                    if (res.pendingReroll) { askChallengeRetry(res); return; }
                    showRollBanner(res.success, res.success ? 'Successo!' : 'Fallimento', `${res.total} contro CD ${stato.challengeState.cd}`);

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
                    revealInView('closeChallengeBtn');
                }
            }, 50);
        }

        /* ---------- Nodo di trama ed eventi con scelte ----------
           Titolo, immagine e testo (campagna: "stories" { chiave: { title, text, scelte } }, il nodo li richiama
           con storyId). Senza "scelte" è solo racconto e si prosegue sulla mappa. Con le scelte è un evento:
           [{ testo, costo, stat, cd, effetti, esito, fallimento: { effetti, esito } }]. Una scelta può costare Scudi,
           può chiedere una prova (stat + cd: tira l'eroe in piedi con la statistica più alta, con i bonus delle prove),
           poi applica "effetti" (applyEffects) e mostra "esito"; se la prova fallisce valgono quelli di "fallimento".
           Si sceglie una volta; poi "Prosegui". */
        function startStory(node) {
            const story = (stato.currentCampaign.stories || {})[node.storyId] || {};
            document.getElementById('storyTitle').textContent = story.title || node.title || 'Trama';
            // Senza immagine del nodo: la copertina della campagna
            document.getElementById('storyImg').src = node.image || stato.currentCampaign.coverImage || 'immagini/inizio_campagna.webp';
            const testo = story.text || 'Il viaggio prosegue.';
            // Come le altre schermate degli eventi: "Descrizione:" in apertura del primo paragrafo
            document.getElementById('storyDescBox').innerHTML = testo.split(/\n\s*\n/)
                .map((p, i) => `<p>${i === 0 ? '<strong>Descrizione:</strong> ' : ''}${esc(p)}</p>`).join('');
            storyChoiceMade = false;
            renderStoryChoices(story);
            showScreen('screenStory');
        }

        let storyChoiceMade = false;

        function renderStoryChoices(story) {
            const box = document.getElementById('storyChoices');
            const proceed = document.getElementById('storyProceedBtn');
            const scelte = story.scelte || [];
            if (box) box.innerHTML = storyChoiceMade ? '' : scelte.map((c, i) =>
                `<button class="btn-proceed story-choice" ${azione('chooseStoryOption', i)} ${(c.costo || 0) > stato.partyCoins ? 'disabled' : ''}>${esc(storyChoiceLabel(c))}</button>`).join('');
            if (proceed) proceed.classList.toggle('hidden', scelte.length > 0 && !storyChoiceMade);
        }

        function chooseStoryOption(i) {
            const node = stato.stsMapNodes.find(n => n.id === stato.currentNodeId);
            const story = ((stato.currentCampaign.stories || {})[node && node.storyId]) || {};
            const choice = (story.scelte || [])[i];
            if (storyChoiceMade || !choice) return;
            const res = resolveStoryChoice(choice);
            if (!res) { uiError('Non avete abbastanza Scudi'); return; }
            updatePartyStatusBars();
            storyChoiceMade = true;
            const parts = [`<p><strong>${esc(choice.testo || 'Scelta')}</strong></p>`];
            if (choice.stat) {
                parts.push(`<p>🎲 ${res.hero ? `${esc(res.hero.name)}: dado <b>${res.roll}</b>, totale <b>${res.total}</b> contro CD ${choice.cd || 0}` : 'Nessuno può tentare'}
                    — ${res.success ? '<b class="log-success">Successo</b>' : '<b class="log-fail">Fallimento</b>'}</p>`);
                if (res.hero) showRollBanner(res.success, res.success ? 'Successo' : 'Fallimento', `${res.total} contro CD ${choice.cd || 0}`);
            }
            if (res.text) parts.push(...res.text.split(/\n\s*\n/).map(p => `<p>${esc(p)}</p>`));
            document.getElementById('storyDescBox').innerHTML += `<div class="story-outcome">${parts.join('')}</div>`;
            renderStoryChoices(story);
            revealInView('storyProceedBtn');
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
            updatePartyStatusBars();
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

        // Preghiera dal telefono dell'eroe: stessa prova, con il dado che gira sullo schermo del gioco
        function remotePray(heroName) {
            // Niente se qualcuno ha già pregato o ha già scelto l'eroe sul PC (dado in vista)
            if (currentScreenId !== 'screenRest' || restPrayer || !document.getElementById('dicePrayerSection').classList.contains('hidden')) return false;
            if (!stato.party.some(h => h.hp > 0 && h.name === heroName)) return false;
            document.getElementById('prayerStage1').classList.add('hidden');
            confirmPrayerHero(heroName);
            executePrayerRoll();
            return true;
        }

        // Come le sfide: prima si sceglie chi prega (con Fede e probabilità), poi si tira il dado
        function startPrayer() {
            if (restPrayer) return;
            document.getElementById('prayerStage1').classList.add('hidden');
            document.getElementById('prayerStage2').classList.remove('hidden');
            document.getElementById('prayerHeroSelect').innerHTML = stato.party.filter(h => h.hp > 0).map(h =>
                `<option value="${esc(h.name)}">${esc(h.name)} (Fede ${h.fth || 0}) · ${prayerChance(h).short}</option>`).join('');
        }

        const prayerChance = hero => chanceText(PRAYER_CD - (hero.fth || 0) - relicDiceBonus('preghiera', hero) - itemPrayerBonus(hero));

        let selectedPrayerHero = null;
        // heroName: chi prega quando arriva dal telefono (remotePray), altrimenti la scelta nel menu
        function confirmPrayerHero(heroName) {
            const name = typeof heroName === 'string' ? heroName : document.getElementById('prayerHeroSelect').value;
            selectedPrayerHero = stato.party.find(h => h.hp > 0 && h.name === name);
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
            revealInView('rollPrayerBtn');
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
                diceBox.textContent = Math.floor(rng() * 6) + 1;
                counter += 50;
                if (counter < animTime(500)) return;
                clearInterval(interval);
                const p = prayAtRest(selectedPrayerHero.name);
                diceBox.classList.remove('rolling');
                if (!p) return;
                diceBox.textContent = p.roll;
                diceOutcomeSfx(p.roll);
                const fth = p.total - p.roll - p.relics - (p.items || 0);
                addPrayerLog(`${esc(p.hero)}: dado ${p.roll} + Fede ${fth}${p.relics ? ` + reliquie ${p.relics}` : ''}${p.items ? ` + oggetti ${p.items}` : ''} = <b>${p.total}</b> (CD ${PRAYER_CD})`);
                if (p.notes.length) addPrayerLog(`💎 Reliquie: ${esc(p.notes.join(', '))}`);
                if (p.naturalNote) addPrayerLog(esc(p.naturalNote));
                addPrayerLog(p.success ? (p.major ? '✨ Gli dei rispondono con forza: benedizione maggiore!' : '🙏 La preghiera è ascoltata!')
                    : 'Gli dei tacciono. Nessuna benedizione questa volta.', p.success ? 'log-success' : 'log-fail');
                showRollBanner(p.success, p.success ? (p.major ? 'Benedizione maggiore!' : 'Preghiera ascoltata!') : 'Gli dei tacciono', `${p.total} contro CD ${PRAYER_CD}`);
                btn.classList.add('hidden');
                revealInView(p.success ? 'restPrayerArea' : 'prayerLog');
                updatePartyStatusBars();  // il telefono vede l'esito e le benedizioni
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
            revealInView(box.lastElementChild || box);
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
            (res.notes || []).forEach(text => { document.getElementById('restDescBox').innerHTML += `<br>✨ ${esc(text)}`; });
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
            revealInView('diceCaptainSection');
        }

        function executeCaptainRoll() {
            const rollBtn = document.getElementById('rollCaptainBtn');
            const diceBox = document.getElementById('diceCaptain');
            rollBtn.disabled = true; diceBox.classList.add('rolling');
            synthSfx('dice');

            let counter = 0;
            const interval = setInterval(() => {
                diceBox.textContent = Math.floor(rng() * 6) + 1;
                counter += 50;
                if(counter >= animTime(500)) {
                    clearInterval(interval);
                    const res = resolveCaptainAction(selectedCaptainHero, captainActionType);
                    diceBox.textContent = res.roll; diceBox.classList.remove('rolling');
                    diceOutcomeSfx(res.roll);

                    showRollBanner(res.success !== false && res.type !== 'force', res.type === 'force' ? 'Ramanzina!' : res.success ? 'Vittoria!' : 'Fallito', `Dado ${res.roll}`);
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
                    revealInView(endBtn);
                }
            }, 50);
        }
