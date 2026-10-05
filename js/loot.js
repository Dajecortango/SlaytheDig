/* ==========================================================================
   BOTTINO, TESORI E CARTE COPERTE
   Bottino dopo gli scontri, scrigni del tesoro, rarità pesata in base
   all'avanzamento e carte coperte da scoprire con un clic.
   Caricato dopo js/game.js (stesso ambito globale: usa stato, gameItems, LIBRERIA...).
   ========================================================================== */

        /* ---------- Carte coperte: merce del mercante e bottino degli scontri si scoprono con un clic ---------- */
        let justRevealedMerchantIdx = null;

        function cardBackHtml(onclick, title, sub, extraClass = '') {
            return `
                <button class="armory-btn card-back ${extraClass}" onclick="${onclick}">
                    <span class="card-back-emblem" aria-hidden="true">?</span>
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

        let currentLootItem = null;

        // Avanzamento nella mappa del nodo corrente: 0 al primo livello, 1 all'ultimo
        function mapProgress() {
            const node = stato.stsMapNodes.find(n => n.id === stato.currentNodeId);
            const maxLevel = Math.max(...stato.stsMapNodes.map(n => n.level), 1);
            return node ? Math.min(1, node.level / maxLevel) : 0;
        }

        /* ---------- Rarità del bottino degli scontri ----------
           Scontri normali: probabilità (in %) secondo il livello della mappa (1 = primo livello).
           Scontri elite: secondo quanti elite il party ha già sconfitto in questa spedizione.
           Le rarità che il bottino della campagna non ha vengono saltate (vedi pickByRarity). */
        const LOOT_BY_LEVEL = [
            { upTo: 2, weights: { comune: 70, non_comune: 30 } },
            { upTo: 5, weights: { comune: 35, non_comune: 50, raro: 15 } },
            { upTo: 8, weights: { comune: 20, non_comune: 45, raro: 30, epico: 5 } },
            { upTo: 11, weights: { raro: 45, epico: 50, leggendario: 5 } },
            { upTo: Infinity, weights: { raro: 40, epico: 50, leggendario: 10 } }
        ];
        const LOOT_BY_ELITE = [
            { raro: 80, epico: 20 },                      // primo elite sconfitto
            { raro: 70, epico: 30 },                      // secondo
            { raro: 30, epico: 50, leggendario: 20 }      // dal terzo in poi
        ];

        // Livello del nodo corrente come lo vede il giocatore (1 = primo livello della mappa)
        function currentMapLevel() {
            const node = stato.stsMapNodes.find(n => n.id === stato.currentNodeId);
            return node ? node.level + 1 : 1;
        }

        function lootRarityWeights(isElite) {
            if (isElite) {
                const done = (stato.expeditionStats && stato.expeditionStats.elitesWon) || 0;
                return LOOT_BY_ELITE[Math.min(done, LOOT_BY_ELITE.length - 1)];
            }
            const level = currentMapLevel();
            return LOOT_BY_LEVEL.find(row => level <= row.upTo).weights;
        }

        // Pesca un oggetto: prima la rarità secondo i pesi, poi un oggetto a caso di quella rarità
        function pickLootItem(isElite) {
            return pickByRarity(gameItems, lootRarityWeights(isElite));
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

        function triggerLoot() {
            expireTempBuffs(true);  // fine dello scontro: via tutti i potenziamenti temporanei
            showScreen('screenLoot');

            // Reliquia: Dente del grande lupo
            if (hasRelic('dente_del_grande_lupo')) {
                let lowestHero = stato.party.filter(h => h.hp > 0).reduce((prev, curr) => prev.hp < curr.hp ? prev : curr);
                if (lowestHero && lowestHero.hp < lowestHero.maxHp) {
                    healHero(lowestHero, 1);
                }
            }

            const currentNode = stato.stsMapNodes.find(n => n.id === stato.currentNodeId);
            const isEliteCombat = currentNode && (currentNode.type === 'elite' || currentNode.type === 'captain');
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

            currentLootItem = pickLootItem(isEliteCombat);
            stato.expeditionStats.itemsFound++;

            // Gli elite lasciano anche una reliquia che il party non ha ancora
            let eliteRelic = null;
            if (isEliteCombat) {
                stato.expeditionStats.elitesWon = (stato.expeditionStats.elitesWon || 0) + 1;
                const relicId = pickUnownedRelicId();
                if (relicId) eliteRelic = grantRelic(relicId);
            }
            if (eliteRelic) {
                document.getElementById('lootCoinsBonus').textContent += ` · Reliquia: ${eliteRelic.name}`;
                setTimeout(() => showOutcomeOverlay('relic', eliteRelic), 400);
            }

            document.getElementById('lootCoinsText').textContent = coins;
            document.getElementById('lootItemIcon').innerHTML = itemIconHtml(currentLootItem);
            document.getElementById('lootItemName').textContent = currentLootItem.name;
            document.getElementById('lootItemDesc').innerHTML = kw(currentLootItem.desc);
            const lootRow = document.getElementById('lootItemRow');
            lootRow.classList.remove(...Object.keys(RARITY_LABELS).map(r => `rar-card-${r}`));
            lootRow.classList.add(`rar-card-${itemRarity(currentLootItem)}`);
            lootRow.dataset.tip = itemTip(currentLootItem);
            revealAsCard(document.querySelector('#screenLoot .loot-panel'), 0);
            fillHeroSelectForItem('lootHeroSelect', currentLootItem);
            // Il dorso lascia intuire la rarità (colori di WoW: grigio, bianco, verde, blu, viola, arancio)
            const lootBack = document.getElementById('lootCardBack');
            lootBack.classList.remove('hidden', 'card-flip-out', ...Object.keys(RARITY_LABELS).map(r => `rar-back-${r}`));
            lootBack.classList.add(`rar-back-${itemRarity(currentLootItem)}`);
            document.getElementById('lootItemRow').classList.add('hidden');
            document.getElementById('lootItemRow').classList.remove('card-flip-in', ...Object.keys(RARITY_LABELS).map(r => `reveal-${r}`));
            document.getElementById('lootAssignArea').classList.add('hidden');

            updatePartyStatusBars();
        }

        function revealLootItem() {
            const back = document.getElementById('lootCardBack');
            if (back.classList.contains('hidden')) return;
            flipCard(back, currentLootItem, () => {
                back.classList.add('hidden');
                const row = document.getElementById('lootItemRow');
                row.classList.remove('hidden');
                row.classList.add('card-flip-in', `reveal-${itemRarity(currentLootItem)}`);
                document.getElementById('lootAssignArea').classList.remove('hidden');
            });
        }

        function confirmLootAssignment() {
            const hero = stato.party.find(p => p.name === document.getElementById('lootHeroSelect').value);
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
            const items = [];
            for (let i = 0; i < 3; i++) {
                items.push(gameItems[Math.floor(Math.random() * gameItems.length)]);
            }
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
                    <button class="armory-btn rar-card-${itemRarity(it)}" onclick="selectTreasureItem(${idx})" data-tip="${esc(itemTip(it))}">
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

