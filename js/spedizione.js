/* ==========================================================================
   SPEDIZIONE
   Schermata del capitolo prima della mappa, eroe di turno e barra dei turni, nemico
   sconfitto, avanzamento della spedizione, diario della compagnia (con le statistiche
   dei dadi), conferma prima di lasciare il tesoro, riepilogo di fine partita e ritorno al menu
   senza ricaricare la pagina (tornaAlMenu).
   Diviso da js/game.js: stesso ambito globale, caricato dopo js/menu.js.
   ========================================================================== */

        /* ---------- Schermata del capitolo prima della mappa ---------- */
        function startExpedition() {
            if (!animationsEnabled() || !stato.currentCampaign) { startMap(); return; }

            const overlay = document.createElement('div');
            overlay.className = 'chapter-overlay';
            overlay.innerHTML = `
                <div class="chapter-content">
                    <div class="chapter-kicker">La spedizione ha inizio</div>
                    <div class="chapter-title">${stato.currentCampaign.title}</div>
                    <div class="chapter-rule"></div>
                    <div class="chapter-sub">${stato.currentCampaign.badge || ''}</div>
                    <div class="chapter-skip">Clicca per continuare</div>
                </div>`;
            document.body.appendChild(overlay);
            void overlay.offsetWidth;
            overlay.classList.add('show');

            // La mappa viene preparata sotto lo schermo nero, poi il titolo sfuma
            let finished = false;
            const finish = () => {
                if (finished) return;
                finished = true;
                clearTimeout(autoTimer);
                startMap();
                overlay.classList.remove('show');
                setTimeout(() => overlay.remove(), 850);
            };
            const autoTimer = setTimeout(finish, 3200);
            setTimeout(() => overlay.addEventListener('click', finish), 400);
        }

        /* ---------- 1 e 6. Eroe di turno e barra dei turni ---------- */
        function heroTurnClass(h) {
            if (currentScreenId !== 'screenCombat' || h.hp <= 0) return '';
            if (combatPhase === 'heroes') {
                if (h === currentActiveHero && !h.hasActed) return 'is-turn';
                if (h.hasActed) return 'has-acted';
                return currentActiveHero ? 'is-waiting' : '';
            }
            if (combatPhase === 'monster') return 'is-waiting';
            return '';
        }

        function renderTurnBar() {
            const bar = document.getElementById('turnOrderBar');
            if (!bar) return;
            if (currentScreenId !== 'screenCombat' || !stato.activeEnemy || combatPhase === 'none') { bar.innerHTML = ''; return; }

            const heroChips = stato.party.filter(h => h.hp > 0).map(h => {
                const state = combatPhase === 'won' || h.hasActed ? 'done' : (h === currentActiveHero ? 'current' : '');
                const note = state === 'done' ? 'Ha già agito in questo round' : (state === 'current' ? 'Sta agendo' : 'Deve ancora agire');
                const inner = HERO_PORTRAITS[h.name] ? heroPortraitInner(h.name, h.hp, h.maxHp) : h.name.charAt(0);
                return `<span class="turn-chip ${state}" style="--hue:${heroHue(h.name)}" data-tip="${esc(h.name)}||${note}">${inner}</span>`;
            }).join('');
            const enemyState = combatPhase === 'monster' ? 'current' : (combatPhase === 'won' ? 'done' : '');
            const enemyNote = combatPhase === 'monster' ? 'Sta attaccando' : (combatPhase === 'won' ? 'Sconfitto' : 'Attacca dopo la compagnia');
            bar.innerHTML = `
                <span class="turn-round">Round ${stato.combatRound}</span>
                ${heroChips}
                <span class="turn-sep">▶</span>
                <span class="turn-chip enemy ${enemyState}" data-tip="${esc(stato.activeEnemy.name)}||${enemyNote}">${svgIcon('skull')}</span>`;
        }

        /* ---------- 7. Nemico sconfitto ---------- */
        function onEnemyDefeated(box) {
            combatPhase = 'won';
            stato.expeditionStats.combatsWon++;
            box.classList.add('defeated');
            const stamp = document.createElement('div');
            stamp.className = 'victory-stamp';
            stamp.textContent = 'Vittoria!';
            box.appendChild(stamp);
            document.getElementById('combatLootBtn').classList.add('btn-attention');
        }

        /* ---------- 10. Avanzamento della spedizione ---------- */
        function renderExpeditionProgress(maxLevel) {
            const el = document.getElementById('expeditionProgress');
            const doneLevels = stato.stsMapNodes.filter(n => n.done).map(n => n.level);
            const completed = doneLevels.length ? Math.max(...doneLevels) + 1 : 0;
            const total = maxLevel + 1;
            let segments = '';
            for (let level = 0; level < total; level++) {
                const cls = level < completed ? 'done' : (level === completed ? 'current' : '');
                segments += `<span class="progress-seg ${cls}"></span>`;
            }
            el.innerHTML = `
                <span class="progress-label">Livello ${Math.min(completed + 1, total)} / ${total}</span>
                <div class="progress-track">${segments}</div>
                <span class="progress-boss ${completed >= total ? 'reached' : ''}" data-tip="Meta finale||Livello ${total}">${svgIcon('crown')}</span>`;
            // Contatore del livello nella barra delle risorse in alto a destra
            document.getElementById('topBarLevel').textContent = `${Math.min(completed + 1, total)}/${total}`;
        }

        /* ---------- 16. Diario della compagnia ---------- */
        function openJournal() {
            if (stato.party.length === 0) {
                uiError('Nessuna spedizione in corso: recluta prima la compagnia');
                return;
            }

            const heroesHtml = stato.party.map(h => {
                const bonuses = [];
                if (h.att_bonus) bonuses.push(`<span class="stat-chip"><i>ATT</i>+${h.att_bonus}</span>`);
                if (h.att_penalty) bonuses.push(`<span class="stat-chip"><i>ATT</i>-${h.att_penalty}</span>`);
                if (h.def_bonus) bonuses.push(`<span class="stat-chip"><i>DIF</i>+${h.def_bonus}</span>`);
                if (h.def_armor) bonuses.push(`<span class="stat-chip"><i>SCUDO</i>+${h.def_armor}</span>`);
                if (h.help_bonus_val) bonuses.push(`<span class="stat-chip"><i>AIUTO</i>+${h.help_bonus_val}</span>`);
                const items = h.items.length
                    ? h.items.map(it => `<div class="journal-item">${itemIconHtml(it)}<span><b>${it.name}</b>${(it.qty || 1) > 1 ? ` x${it.qty}` : ''} — ${it.desc}</span></div>`).join('')
                    : '<span class="journal-empty">Zaino vuoto</span>';
                return `
                    <div class="journal-hero ${h.hp <= 0 ? 'dead' : ''}">
                        <div class="hero-portrait ${heroPortraitClass(h.name)}" style="--hue:${heroHue(h.name)}">${heroPortraitInner(h.name, h.hp, h.maxHp)}</div>
                        <div>
                            <div class="journal-hero-name">${h.name}</div>
                            <div class="journal-hero-hp">HP ${h.hp}/${h.maxHp} · Armatura ${h.current_armor}/${h.base_armor}${h.hp <= 0 ? ' · Caduto' : ''}</div>
                        </div>
                        <span class="stat-chips">
                            <span class="stat-chip"><i>FOR</i>${h.str}</span>
                            <span class="stat-chip"><i>INT</i>${h.int}</span>
                            <span class="stat-chip"><i>FED</i>${h.fth}</span>
                            <span class="stat-chip"><i>DAN</i>${h.dmg}</span>
                            ${bonuses.join('')}
                        </span>
                        ${h.chosenAbility ? `<div class="journal-line">${abilityMarkHtml(h.chosenAbility)} <b>${h.chosenAbility.name}</b>${h.chosenAbility.desc ? ` — ${h.chosenAbility.desc}` : ''}</div>` : ''}
                        ${(h.equippedRunes || []).map(runeData).filter(Boolean).map(r => `<div class="journal-line">${abilityMarkHtml(r)} <b>${r.name}</b>${r.desc ? ` — ${r.desc}` : ''}</div>`).join('')}
                        <div class="journal-items">${items}</div>
                    </div>`;
            }).join('');

            const relics = stato.unlockedRelics.length
                ? stato.unlockedRelics.map(r => `<div class="relic"><b>${r.name}</b> — ${r.desc}</div>`).join('')
                : '<span class="journal-empty">Nessuna reliquia ottenuta</span>';
            const curses = stato.activeCurses.length
                ? stato.activeCurses.map(c => `<div class="curse">${curseText(c)}</div>`).join('')
                : '<span class="journal-empty">Nessuna maledizione attiva</span>';

            const doneLevels = stato.stsMapNodes.filter(n => n.done).map(n => n.level);
            const totalLevels = stato.stsMapNodes.length ? Math.max(...stato.stsMapNodes.map(n => n.level)) + 1 : 0;
            const stat = (value, label) => `<div class="journal-stat"><b>${value}</b><span>${label}</span></div>`;

            openModal(`Diario — ${stato.currentCampaign ? stato.currentCampaign.title : 'Spedizione'}`, `
                <div class="journal-section"><h4>La Compagnia</h4><div class="journal-heroes">${heroesHtml}</div></div>
                <div class="journal-section"><h4>Reliquie</h4><div class="journal-list">${relics}</div></div>
                <div class="journal-section"><h4>Maledizioni</h4><div class="journal-list">${curses}</div></div>
                <div class="journal-section"><h4>La Spedizione</h4>
                    <div class="journal-stats">
                        ${stat(`${doneLevels.length ? Math.max(...doneLevels) + 1 : 0} / ${totalLevels}`, 'Livelli superati')}
                        ${stat(stato.expeditionStats.combatsWon, 'Scontri vinti')}
                        ${stat(stato.expeditionStats.challengesPassed, 'Sfide superate')}
                        ${stat(stato.expeditionStats.challengesFailed, 'Sfide fallite')}
                        ${stat(stato.expeditionStats.coinsEarned, 'Monete raccolte')}
                        ${stat(stato.expeditionStats.itemsFound, 'Oggetti trovati')}
                        ${stat(`${stato.party.filter(h => h.hp > 0).length} / ${stato.party.length}`, 'Eroi in piedi')}
                    </div>
                </div>
                ${diceStatsHtml()}`,
                [{ label: 'Chiudi', className: 'btn-proceed' }],
                { wide: true });
        }

        // Quante volte è uscita ogni faccia nei dadi degli eroi in questa spedizione (vedi rollD6):
        // barre in proporzione, percentuale accanto al 16,7% atteso e media accanto a 3,5
        function diceStatsHtml() {
            const counts = (stato.expeditionStats && stato.expeditionStats.diceRolls) || [0, 0, 0, 0, 0, 0];
            const total = counts.reduce((a, b) => a + b, 0);
            if (!total) return '<div class="journal-section"><h4>I dadi</h4><span class="journal-empty">Nessun dado tirato finora</span></div>';
            const max = Math.max(...counts);
            const mean = counts.reduce((sum, n, i) => sum + n * (i + 1), 0) / total;
            const bars = counts.map((n, i) => `
                <div class="dice-bar" data-tip="Faccia ${i + 1}||Uscita ${n} volte su ${total} (${(n / total * 100).toFixed(1)}%). Con un dado onesto ci si aspetta il 16,7%.">
                    <span class="dice-bar-fill" style="height:${max ? Math.round(n / max * 100) : 0}%"></span>
                    <b>${i + 1}</b><small>${Math.round(n / total * 100)}%</small>
                </div>`).join('');
            return `<div class="journal-section"><h4>I dadi</h4>
                <div class="dice-stats">${bars}</div>
                <div class="dice-stats-note">${total} dadi tirati dagli eroi · media ${mean.toFixed(2)} (attesa 3,50)${total < 60 ? ' · con pochi tiri le differenze sono normali' : ''}</div>
            </div>`;
        }

        /* ---------- 17. Conferma prima di lasciare mercante e tesoro ---------- */
        function confirmLeaveTreasure() {
            const left = currentTreasureItems.filter(Boolean).length;
            if (left === 0) { advanceNode(); return; }
            openModal('Lasciare il tesoro?',
                `<p>Nello scrigno ${left === 1 ? 'resta ancora <b>1</b> oggetto' : `restano ancora <b>${left}</b> oggetti`} da prelevare.</p>`,
                [{ label: 'Torna allo scrigno', className: 'btn-proceed' }, { label: 'Prosegui comunque', className: 'btn-danger', onClick: advanceNode }]);
        }

        /* ---------- 18. Riepilogo di fine partita (schermate di sconfitta e vittoria) ----------
           datiRiepilogo legge solo lo stato (funzione pura, provata in tests/riepilogo.test.js);
           mostraRiepilogo lo scrive nel pannello quando showScreen apre screenDefeat o screenVictory. */
        function datiRiepilogo(st, esito) {
            const nodi = st.stsMapNodes || [];
            const maxLevel = nodi.length ? Math.max(...nodi.map(n => n.level)) : -1;
            const fatti = nodi.filter(n => n.done);
            // Boss = scontro all'ultimo livello della mappa (come l'icona a corona in js/mappa.js)
            const nodiBoss = nodi.filter(n => n.level === maxLevel && (n.type === 'combat' || n.type === 'elite'));
            const es = Object.assign(newExpeditionStats(), st.expeditionStats || {});
            const dadi = Array.isArray(es.diceRolls) ? es.diceRolls.slice() : [0, 0, 0, 0, 0, 0];
            return {
                esito,
                campagna: st.currentCampaign ? st.currentCampaign.title : 'Spedizione',
                livelli: { superati: fatti.length ? Math.max(...fatti.map(n => n.level)) + 1 : 0, totale: maxLevel + 1 },
                nodi: { completati: fatti.length, totale: nodi.length },
                scontri: { vinti: es.combatsWon, elite: es.elitesWon || 0, boss: nodiBoss.length ? nodiBoss.some(n => n.done) : null },
                sfide: { superate: es.challengesPassed, fallite: es.challengesFailed },
                monete: { finali: st.partyCoins || 0, raccolte: es.coinsEarned },
                oggetti: es.itemsFound,
                reliquie: (st.unlockedRelics || []).map(r => (r.id && LIBRERIA.reliquie && LIBRERIA.reliquie[r.id] ? relicName(r.id) : (r.name || r.id))),
                maledizioni: (st.activeCurses || []).map(curseText),
                compagnia: (st.party || []).map(h => ({ nome: h.name, hp: Math.max(0, h.hp), maxHp: h.maxHp, vivo: h.hp > 0 })),
                dadi: { facce: dadi, totale: dadi.reduce((a, b) => a + b, 0) }
            };
        }

        function riepilogoHtml(d) {
            const stat = (value, label) => `<div class="journal-stat"><b>${value}</b><span>${label}</span></div>`;
            const vivi = d.compagnia.filter(h => h.vivo).length;
            const eroi = d.compagnia.map(h => `
                <div class="run-summary-hero ${h.vivo ? '' : 'dead'}">
                    <div class="hero-portrait ${heroPortraitClass(h.nome)}" style="--hue:${heroHue(h.nome)}">${heroPortraitInner(h.nome, h.hp, h.maxHp)}</div>
                    <div>
                        <div class="journal-hero-name">${esc(h.nome)}</div>
                        <div class="journal-hero-hp">${h.vivo ? `In piedi · HP ${h.hp}/${h.maxHp}` : `Caduto · HP 0/${h.maxHp}`}</div>
                    </div>
                </div>`).join('');
            const elenco = (voci, cls, vuoto) => voci.length
                ? voci.map(v => `<div class="${cls}">${esc(v)}</div>`).join('')
                : `<span class="journal-empty">${vuoto}</span>`;
            const boss = d.scontri.boss === null ? '' : stat(d.scontri.boss ? 'Sì' : 'No', 'Boss finale sconfitto');
            return `
                <div class="run-summary-head">
                    <span class="run-summary-campaign">${esc(d.campagna)}</span>
                    <span class="run-summary-outcome ${d.esito}">${d.esito === 'vittoria' ? 'Vittoria' : 'Sconfitta'}</span>
                </div>
                <div class="journal-section"><h4>La Spedizione</h4>
                    <div class="journal-stats">
                        ${stat(`${d.livelli.superati} / ${d.livelli.totale}`, 'Livelli superati')}
                        ${stat(`${d.nodi.completati} / ${d.nodi.totale}`, 'Nodi completati')}
                        ${stat(d.scontri.vinti, d.scontri.elite ? `Scontri vinti (${d.scontri.elite} elite)` : 'Scontri vinti')}
                        ${boss}
                        ${stat(`${d.sfide.superate} / ${d.sfide.superate + d.sfide.fallite}`, 'Sfide superate')}
                        ${stat(d.monete.finali, `Monete (${d.monete.raccolte} raccolte)`)}
                        ${stat(d.oggetti, 'Oggetti trovati')}
                    </div>
                </div>
                <div class="journal-section"><h4>La Compagnia · ${vivi} / ${d.compagnia.length} in piedi</h4><div class="run-summary-heroes">${eroi}</div></div>
                <div class="journal-section"><h4>Reliquie</h4><div class="journal-list">${elenco(d.reliquie, 'relic', 'Nessuna reliquia ottenuta')}</div></div>
                <div class="journal-section"><h4>Maledizioni</h4><div class="journal-list">${elenco(d.maledizioni, 'curse', 'Nessuna maledizione subita')}</div></div>
                ${diceStatsHtml()}`;
        }

        function mostraRiepilogo(esito) {
            const box = document.getElementById(esito === 'vittoria' ? 'victorySummary' : 'defeatSummary');
            if (box) box.innerHTML = riepilogoHtml(datiRiepilogo(stato, esito));
        }

        // "Torna al menu" delle schermate di fine partita: niente ricarica della pagina, si azzera la partita
        // (stato, scontro, segnalino sulla mappa, musica) e si torna al menu iniziale. Il salvataggio della
        // sconfitta è già stato cancellato (deleteCurrentSave); quello della vittoria resta com'è.
        function azzeraPartita() {
            Object.assign(stato, {
                currentCampaign: null, stsMapNodes: [], currentNodeId: null, party: [], partyCoins: 0,
                unlockedRelics: [], activeCurses: [], expeditionStats: newExpeditionStats(),
                challengeState: null, activeEnemy: null, helpBonus: 0, helpDmgBonus: 0, combatRound: 0, procSeed: null
            });
            displayedCoins = 0;
            currentSaveSlot = null;
            combatPhase = 'none';
            currentActiveHero = null;
            chosenAction = null;
            combatThemeSrc = null;
            lastPartyTokenPos = null;
            delete musicResumeAt[MAP_THEME];  // la mappa della prossima spedizione riparte da capo
            setCombatVideo(null);
            impostaAzione(document.getElementById('combatNextBtn'), 'proceedCombatPhase');
            ['victorySummary', 'defeatSummary'].forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ''; });
        }

        function tornaAlMenu() {
            azzeraPartita();
            closeModal();
            showScreen('screenStart');
            checkSavedGame();  // "Carica Partita" visibile solo se resta un salvataggio
        }
