/* ==========================================================================
   BOTTINO, TESORI E CARTE COPERTE
   Bottino dopo gli scontri, scrigni del tesoro, rarità pesata in base
   all'avanzamento e carte coperte da scoprire con un clic.
   Caricato dopo js/game.js (stesso ambito globale: usa stato, gameItems, LIBRERIA...).
   ========================================================================== */

        /* ---------- Carte coperte: merce del mercante e bottino degli scontri si scoprono con un clic ---------- */
        let justRevealedMerchantIdx = null;

        // Sagome sotto il telo delle carte coperte del mercante: equipaggiamento o consumabili
        // (già noto dalla posizione: prima le armi e armature, poi i consumabili). SVG disegnati qui, colori nel CSS;
        // il telo segue le sagome e finisce in basso con le frange.
        const CARD_BACK_FRINGE = 'L86 61L80 66L72 61L64 66L56 61L48 66L40 61L32 66L24 61L16 66L10 61Z';
        const CARD_BACK_SILHOUETTES = {
            equipment: '<path class="cb-shape" d="M31 2.5a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4zM29.5 9h3v7h7.5v3h-6l-.6 34h-4.8L28 19h-6v-3h7.5z"/>'
                + '<path class="cb-shape" d="M60 10c9 0 18 3 18 3v17c0 13-9 21-18 25-9-4-18-12-18-25V13s9-3 18-3z"/>'
                + `<path class="cb-cloth" d="M2 64C4 56 8 50 14 46C20 42 26 36 31 36C36 36 38 43 42 43C47 43 52 34 60 34C68 34 76 38 82 44C88 50 92 56 94 64${CARD_BACK_FRINGE}"/>`
                + '<path class="cb-fold" d="M31 38C30 47 33 55 32 61M60 36C58 46 62 54 60 61M44 45C45 52 43 57 44 61M80 46C79 53 82 57 81 61"/>',
            consumable: '<path class="cb-shape" d="M30 6h7v3h-1v10c6 2 10 7 10 14a12.5 12.5 0 0 1-25 0c0-7 4-12 10-14V9h-1z"/>'
                + '<path class="cb-shape" d="M56 4h8v3h-1v12c4 1 6 4 6 8v25H51V27c0-4 2-7 6-8V7h-1z"/>'
                + '<path class="cb-shape" d="M75 22h6v3h-1v5c3 1 4 3 4 6v14H72V36c0-3 1-5 4-6v-5h-1z"/>'
                + `<path class="cb-cloth" d="M2 64C5 57 9 52 14 48C20 43 27 40 34 40C40 40 44 46 49 46C53 46 55 36 60 36C65 36 67 44 71 44C74 44 75 42 78 42C84 42 90 52 94 64${CARD_BACK_FRINGE}"/>`
                + '<path class="cb-fold" d="M34 42C33 50 36 56 34 61M60 38C59 47 62 54 60 61M49 48C50 54 48 58 49 61M78 44C77 51 80 56 79 61"/>'
        };

        function cardBackHtml(actionAttrs, title, sub, extraClass = '', silhouette = null) {
            const emblem = silhouette
                ? `<span class="card-back-drape" aria-hidden="true"><svg viewBox="0 0 96 64">${CARD_BACK_SILHOUETTES[silhouette]}</svg><span class="card-back-seal">?</span></span>`
                : '<span class="card-back-emblem" aria-hidden="true">?</span>';
            return `
                <button class="armory-btn card-back ${extraClass}" ${actionAttrs}>
                    ${emblem}
                    <span class="tile-text">
                        <strong>${title}</strong>
                        <span class="tile-sub">${sub}</span>
                    </span>
                </button>`;
        }

        // Gira la carta: prima si chiude di taglio, poi si riapre mostrando l'oggetto (vedi card-flip-in)
        function flipCard(el, item, onRevealed) {
            synthSfx('flip');
            if (['epico', 'leggendario'].includes(itemRarity(item))) setTimeout(() => synthSfx('six'), 200);
            if (!el || !animationsEnabled()) { onRevealed(); return; }
            el.classList.add('card-flip-out');
            setTimeout(onRevealed, 170);
        }

        function revealMerchantItem(idx) {
            const entry = merchantItemsWithPrices[idx];
            if (!entry || entry.revealed) return;
            flipCard(document.querySelector(`#merchantItemsList [data-idx="${idx}"]`), entry.item, () => {
                entry.revealed = true;
                justRevealedMerchantIdx = idx;
                renderMerchantShop();
                justRevealedMerchantIdx = null;
            });
        }

        let lootTaken = false;        // il bottino di questo scontro è già stato assegnato (dal gioco o da un telefono)
        let currentLootItem = null;   // oggetto scelto fra quelli del bottino
        let lootChoices = [];         // oggetti del bottino fra cui scegliere (LOOT_CHOICES)

        // Avanzamento nella mappa del nodo corrente: 0 al primo livello, 1 all'ultimo
        function mapProgress() {
            const node = stato.stsMapNodes.find(n => n.id === stato.currentNodeId);
            const maxLevel = Math.max(...stato.stsMapNodes.map(n => n.level), 1);
            return node ? Math.min(1, node.level / maxLevel) : 0;
        }

        /* ---------- Rarità del bottino degli scontri ----------
           Probabilità che passano da quelle del primo livello a quelle dell'ultimo secondo
           l'avanzamento nella mappa (LOOT_RARITY_RANGE in js/regole.js). Gli elite pescano come
           se fossero LOOT_ELITE_PROGRESS_BONUS più avanti, senza scarsi e comuni.
           Le rarità che il bottino della campagna non ha vengono saltate (vedi pickByRarity). */
        function lootRarityWeights(isElite, progress = mapProgress()) {
            const p = isElite ? Math.min(1, progress + LOOT_ELITE_PROGRESS_BONUS) : progress;
            const weights = {};
            for (const [rarity, [from, to]] of Object.entries(LOOT_RARITY_RANGE)) {
                if (isElite && LOOT_ELITE_EXCLUDED.includes(rarity)) continue;
                const w = from + (to - from) * p;
                if (w > 0) weights[rarity] = Math.round(w * 100) / 100;
            }
            return weights;
        }

        // Pesca un oggetto: prima la rarità secondo i pesi, poi un oggetto a caso di quella rarità
        function pickLootItem(isElite) {
            return pickByRarity(gameItems, lootRarityWeights(isElite));
        }

        // "count" oggetti del bottino, sempre diversi fra loro, con la tabella delle rarità per livello
        // (o per elite). Se la rarità estratta non ha altri oggetti si pesca fra quelli rimasti.
        function pickDistinctLoot(count, isElite) {
            const out = [];
            for (let i = 0; i < count; i++) {
                const rest = gameItems.filter(it => !out.includes(it));
                if (!rest.length) break;
                out.push(pickByRarity(rest, lootRarityWeights(isElite)));
            }
            return out;
        }

        // Oggetti del bottino di uno scontro fra cui sceglierne uno (LOOT_CHOICES)
        function pickLootChoices(isElite) {
            return pickDistinctLoot(LOOT_CHOICES, isElite);
        }

        // Pesca da "pool": prima la rarità secondo i pesi (solo fra quelle presenti), poi un oggetto a caso di quella rarità
        function pickByRarity(pool, weights) {
            if (pool.length === 0) return null;
            const available = Object.keys(weights).filter(r => weights[r] > 0 && pool.some(i => itemRarity(i) === r));
            if (available.length === 0) return pool[Math.floor(Math.random() * pool.length)];
            const total = available.reduce((sum, r) => sum + weights[r], 0);
            let pick = Math.random() * total;
            let rarity = available[available.length - 1];
            for (const r of available) {
                pick -= weights[r];
                if (pick < 0) { rarity = r; break; }
            }
            const sameRarity = pool.filter(i => itemRarity(i) === rarity);
            return sameRarity[Math.floor(Math.random() * sameRarity.length)];
        }

        // Oro base moltiplicato per l'avanzamento (fino a x2 all'ultimo livello) e +50% negli scontri elite
        function scaledCoins(amounts, isElite) {
            const base = amounts[Math.floor(Math.random() * amounts.length)];
            return Math.round(base * (1 + mapProgress()) * (isElite ? 1.5 : 1));
        }

        // Passiva "Cerusico da Battaglia" (hero_set postCombatHeal: N): dopo ogni scontro vinto, ogni eroe
        // vivo con la passiva cura N HP all'eroe vivo più ferito (più HP persi). Usata anche dal simulatore.
        function battleSurgeonHeal() {
            const out = [];
            stato.party.filter(h => h.hp > 0 && h.postCombatHeal).forEach(healer => {
                const wounded = stato.party.filter(h => h.hp > 0 && h.hp < h.maxHp);
                if (!wounded.length) return;
                const hero = wounded.reduce((a, b) => (b.maxHp - b.hp) > (a.maxHp - a.hp) ? b : a);
                const gained = healHero(hero, healer.postCombatHeal);
                if (gained > 0) out.push({ healer, hero, gained });
            });
            return out;
        }

        function triggerLoot() {
            expireTempBuffs(true);  // fine dello scontro: via tutti i potenziamenti temporanei
            showScreen('screenLoot');

            // Reliquia: Dente del grande lupo
            if (hasRelic('dente_del_grande_lupo')) {
                // Il vivo con meno HP tra i feriti (chi è già al massimo non conta)
                const wounded = stato.party.filter(h => h.hp > 0 && h.hp < h.maxHp);
                if (wounded.length) healHero(wounded.reduce((prev, curr) => prev.hp <= curr.hp ? prev : curr), 1);
            }

            battleSurgeonHeal().forEach(({ healer, hero, gained }) =>
                uiMessage(`${healer.name} (Cerusico da Battaglia) cura ${hero.name}: +${gained} HP`));

            const isEliteCombat = currentEnemyIsEliteOrBoss();  // elite, capitano e boss dell'ultimo livello
            let coins = scaledCoins([3, 5, 7, 9, 12], isEliteCombat);

            if (hasCurse('15_ricompensa_monete')) {
                coins = Math.floor(coins * 0.85);
            }

            // Abilità di Icaro "Fammi dare un'occhiata": monete extra garantite dopo ogni scontro, se è vivo.
            // L'id dell'abilità copre i salvataggi creati prima di questa versione.
            const lootBonusHeroes = stato.party.filter(h => h.hp > 0 && h.bonusLootCoins);
            const lootBonus = lootBonusHeroes.reduce((sum, h) => sum + h.bonusLootCoins, 0);
            coins += lootBonus;
            document.getElementById('lootCoinsBonus').textContent = lootBonus
                ? `(di cui +${lootBonus} da ${lootBonusHeroes.map(h => h.name).join(', ')}: Fammi dare un'occhiata)` : '';

            stato.partyCoins += coins;

            lootChoices = pickLootChoices(isEliteCombat);
            currentLootItem = null;
            lootTaken = false;
            stato.expeditionStats.itemsFound++;

            // Elite sconfitti: solo per il riepilogo della spedizione (gli elite non lasciano reliquie)
            if (isEliteCombat) stato.expeditionStats.elitesWon = (stato.expeditionStats.elitesWon || 0) + 1;

            document.getElementById('lootCoinsText').textContent = coins;
            revealAsCard(document.querySelector('#screenLoot .loot-panel'), 0);
            // Il dorso lascia intuire la rarità migliore (colori di WoW: grigio, bianco, verde, blu, viola, arancio)
            const lootBack = document.getElementById('lootCardBack');
            lootBack.classList.remove('hidden', 'card-flip-out', ...Object.keys(RARITY_LABELS).map(r => `rar-back-${r}`));
            if (lootChoices.length) lootBack.classList.add(`rar-back-${itemRarity(bestLootChoice())}`);
            document.getElementById('lootChoices').classList.add('hidden');
            document.getElementById('lootChoices').innerHTML = '';
            document.getElementById('lootAssignArea').classList.add('hidden');

            updatePartyStatusBars();
        }

        // Oggetto più raro fra quelli del bottino (colore del dorso e suono della carta)
        function bestLootChoice() {
            const order = Object.keys(RARITY_LABELS);
            return lootChoices.reduce((a, it) => order.indexOf(itemRarity(it)) > order.indexOf(itemRarity(a)) ? it : a);
        }

        // Carte del bottino scoperte: un clic sceglie quale tenere
        function renderLootChoices(flip) {
            document.getElementById('lootChoices').innerHTML = lootChoices.map((it, idx) => `
                <button class="armory-btn rar-card-${itemRarity(it)} ${it === currentLootItem ? 'selected' : ''} ${flip ? `card-flip-in reveal-${itemRarity(it)}` : ''}" ${azione('selectLootChoice', idx)} data-tip="${esc(itemTip(it))}">
                    ${itemIconHtml(it)}
                    <span class="tile-text">
                        <strong>${esc(it.name)}</strong>
                        <span class="tile-sub">${kw(it.desc || '')}</span>
                        <span class="tile-tag">${it === currentLootItem ? 'Scelto' : 'Scegli'}</span>
                    </span>
                </button>`).join('');
        }

        function revealLootItem() {
            const back = document.getElementById('lootCardBack');
            if (back.classList.contains('hidden') || !lootChoices.length) return;
            flipCard(back, bestLootChoice(), () => {
                back.classList.add('hidden');
                document.getElementById('lootChoices').classList.remove('hidden');
                renderLootChoices(true);
                // Con un solo oggetto (bottino povero) è già scelto
                if (lootChoices.length === 1) selectLootChoice(0);
                revealInView('lootChoices');
                updatePartyStatusBars();  // i telefoni vedono gli oggetti scoperti
            });
        }

        // Dal telefono: l'eroe prende per sé uno degli oggetti del bottino (discardIdx = cosa scartare se lo zaino è pieno)
        function takeLootChoice(idx, heroName, discardIdx = null) {
            const item = lootChoices[idx];
            const hero = stato.party.find(h => h.name === heroName && h.hp > 0);
            if (currentScreenId !== 'screenLoot' || lootTaken || !item || !hero) return false;
            lootTaken = true;
            currentLootItem = item;
            document.getElementById('lootCardBack').classList.add('hidden');
            document.getElementById('lootChoices').classList.remove('hidden');
            renderLootChoices(false);
            uiMessage(`${hero.name} prende ${item.name}`);
            assignItemToHero(item, hero, () => advanceNode(), Number.isInteger(discardIdx) ? discardIdx : null);
            return true;
        }

        function selectLootChoice(idx) {
            currentLootItem = lootChoices[idx];
            if (!currentLootItem) return;
            renderLootChoices(false);
            fillHeroSelectForItem('lootHeroSelect', currentLootItem);
            document.getElementById('lootAssignArea').classList.remove('hidden');
            revealInView('lootAssignArea');
        }

        function confirmLootAssignment() {
            if (!currentLootItem) { uiError('Scegli prima un oggetto'); return; }
            if (lootTaken) return;
            const hero = stato.party.find(p => p.name === document.getElementById('lootHeroSelect').value);
            if (!hero) return;
            lootTaken = true;
            assignItemToHero(currentLootItem, hero, () => {
                advanceNode();
            }, chosenDiscardIdx('lootHeroSelect'));
        }

        let currentTreasureItems = [];
        let selectedTreasureItem = null;

        function startTreasure(treasureId) {
            showScreen('screenTreasure');
            const descText = treasuresData[treasureId] || "Un antico forziere cattura la vostra attenzione.";
            document.getElementById('treasureDescBox').innerHTML = `<strong>Descrizione:</strong> ${descText}`;
        }

        // Genera l'offerta di un tesoro: monete (con eventuale sconto da maledizione) + 3 oggetti a caso.
        function generateTreasureOffer() {
            let coins = scaledCoins([5, 8, 10, 15], false);
            if (hasCurse('15_ricompensa_monete')) {
                coins = Math.floor(coins * 0.85);
            }
            // Rarità come il bottino degli scontri normali (per livello della mappa), tutti diversi
            const items = pickDistinctLoot(3, false);
            return { coins, items };
        }

        function openTreasure() {
            showScreen('screenTreasureLoot');
            const offer = generateTreasureOffer();
            const coins = offer.coins;
            stato.partyCoins += coins;
            currentTreasureItems = offer.items;

            document.getElementById('treasureCoinsText').textContent = coins;
            document.getElementById('treasureAssignArea').classList.add('hidden');
            document.getElementById('btnExitTreasure').classList.remove('hidden');

            // Monete e oggetti compaiono come carte
            renderTreasureItemsGrid();
            document.querySelectorAll('#treasureItemsList .armory-btn').forEach((card, i) => revealAsCard(card, i * 160));
            updatePartyStatusBars();
        }

        function renderTreasureItemsGrid() {
            document.getElementById('treasureItemsList').innerHTML = currentTreasureItems.map((it, idx) => {
                if(!it) {
                    return `<div class="armory-btn taken"><span class="tile-text"><strong>Prelevato</strong></span></div>`;
                }
                return `
                    <button class="armory-btn rar-card-${itemRarity(it)}" ${azione('selectTreasureItem', idx)} data-tip="${esc(itemTip(it))}">
                        ${itemIconHtml(it)}
                        <span class="tile-text">
                            <strong>${it.name}</strong>
                            <span class="tile-sub">${kw(it.desc)}</span>
                            <span class="tile-tag">Prendi</span>
                        </span>
                    </button>
                `;
            }).join('');
        }

        let selectedTreasureIndex = null;
        function selectTreasureItem(idx) {
            selectedTreasureIndex = idx;
            selectedTreasureItem = currentTreasureItems[idx];

            document.getElementById('treasureItemsList').classList.add('hidden');
            document.getElementById('btnExitTreasure').classList.add('hidden');
            document.getElementById('treasureAssignArea').classList.remove('hidden');
            revealInView('treasureAssignArea');

            document.getElementById('selectedTreasureName').textContent = selectedTreasureItem.name;
            document.getElementById('selectedTreasureDesc').innerHTML = kw(selectedTreasureItem.desc);
            fillHeroSelectForItem('treasureHeroSelect', selectedTreasureItem);
        }

        function cancelTreasureItemSelection() {
            document.getElementById('treasureAssignArea').classList.add('hidden');
            document.getElementById('treasureItemsList').classList.remove('hidden');
            document.getElementById('btnExitTreasure').classList.remove('hidden');
        }

        function confirmTreasureAssignment() {
            const hero = stato.party.find(p => p.name === document.getElementById('treasureHeroSelect').value);
            stato.expeditionStats.itemsFound++;
            assignItemToHero(selectedTreasureItem, hero, () => {
                currentTreasureItems[selectedTreasureIndex] = null;
                cancelTreasureItemSelection();
                renderTreasureItemsGrid();
            }, chosenDiscardIdx('treasureHeroSelect'));
        }

