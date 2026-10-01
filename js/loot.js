/* ==========================================================================
   BOTTINO, TESORI E CARTE COPERTE
   Bottino dopo gli scontri, scrigni del tesoro, rarità pesata in base
   all'avanzamento e carte coperte da scoprire con un clic.
   Caricato dopo js/game.js (stesso ambito globale: usa party, gameItems, LIBRERIA...).
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
            if (itemRarity(item) === 'epico') setTimeout(() => synthSfx('six'), 200);
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
            const node = stsMapNodes.find(n => n.id === currentNodeId);
            const maxLevel = Math.max(...stsMapNodes.map(n => n.level), 1);
            return node ? Math.min(1, node.level / maxLevel) : 0;
        }

        // Probabilità (in %) di comune/raro/epico: salgono raro ed epico andando avanti e negli scontri elite
        function lootRarityWeights(isElite, progress) {
            const lerp = (a, b) => a + (b - a) * progress;
            return isElite
                ? { comune: lerp(30, 10), raro: lerp(50, 50), epico: lerp(20, 40) }
                : { comune: lerp(70, 40), raro: lerp(25, 45), epico: lerp(5, 15) };
        }

        // Pesca un oggetto: prima la rarità secondo i pesi, poi un oggetto a caso di quella rarità
        function pickLootItem(isElite, progress) {
            return pickByRarity(gameItems, lootRarityWeights(isElite, progress));
        }

        // Pesca da "pool": prima la rarità secondo i pesi (solo fra quelle presenti), poi un oggetto a caso di quella rarità
        function pickByRarity(pool, weights) {
            if (pool.length === 0) return null;
            const available = Object.keys(weights).filter(r => pool.some(i => itemRarity(i) === r));
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
            showScreen('screenLoot');

            // Reliquia: Dente del grande lupo
            if (hasRelic("Dente del grande lupo")) {
                let lowestHero = party.filter(h => h.hp > 0).reduce((prev, curr) => prev.hp < curr.hp ? prev : curr);
                if (lowestHero && lowestHero.hp < lowestHero.maxHp) {
                    lowestHero.hp += 1;
                }
            }

            const currentNode = stsMapNodes.find(n => n.id === currentNodeId);
            const isEliteCombat = currentNode && (currentNode.type === 'elite' || currentNode.type === 'captain');
            let coins = scaledCoins([3, 5, 7, 9, 12], isEliteCombat);

            if (activeCurses.includes("Maledizione: -15% monete")) {
                coins = Math.floor(coins * 0.85);
            }

            // Abilità di Icaro "Fammi dare un'occhiata": monete extra garantite dopo ogni scontro, se è vivo.
            // L'id dell'abilità copre i salvataggi creati prima di questa versione.
            const lootBonusHeroes = party.filter(h => h.hp > 0 && (h.bonusLootCoins || (h.chosenAbility && h.chosenAbility.id === 'icaro_oro')));
            const lootBonus = lootBonusHeroes.reduce((sum, h) => sum + (h.bonusLootCoins || 3), 0);
            coins += lootBonus;
            document.getElementById('lootCoinsBonus').textContent = lootBonus
                ? `(di cui +${lootBonus} da ${lootBonusHeroes.map(h => h.name).join(', ')}: Fammi dare un'occhiata)` : '';

            partyCoins += coins;

            currentLootItem = pickLootItem(isEliteCombat, mapProgress());
            expeditionStats.itemsFound++;

            document.getElementById('lootCoinsText').textContent = coins;
            document.getElementById('lootItemIcon').innerHTML = itemIconHtml(currentLootItem);
            document.getElementById('lootItemName').textContent = currentLootItem.name;
            document.getElementById('lootItemDesc').textContent = currentLootItem.desc;
            revealAsCard(document.querySelector('#screenLoot .loot-panel'), 0);
            document.getElementById('lootHeroSelect').innerHTML = heroOptionsForItem(currentLootItem);
            // Il dorso lascia intuire la rarità (grigio, blu, viola)
            const lootBack = document.getElementById('lootCardBack');
            lootBack.classList.remove('hidden', 'card-flip-out', 'rar-back-comune', 'rar-back-raro', 'rar-back-epico');
            lootBack.classList.add(`rar-back-${itemRarity(currentLootItem)}`);
            document.getElementById('lootItemRow').classList.add('hidden');
            document.getElementById('lootItemRow').classList.remove('card-flip-in', 'reveal-comune', 'reveal-raro', 'reveal-epico');
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
            const hero = party.find(p => p.name === document.getElementById('lootHeroSelect').value);
            assignItemToHero(currentLootItem, hero, () => {
                advanceNode();
            });
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
            if (activeCurses.includes("Maledizione: -15% monete")) {
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
            partyCoins += coins;
            currentTreasureItems = offer.items;

            document.getElementById('treasureCoinsText').textContent = coins;
            document.getElementById('treasureAssignArea').classList.add('hidden');
            document.getElementById('btnExitTreasure').classList.remove('hidden');

            // Lo scrigno si apre, poi monete e oggetti compaiono come carte
            const chestDelay = playChestAnimation();
            coinFlightDelay = chestDelay;
            renderTreasureItemsGrid();
            document.querySelectorAll('#treasureItemsList .armory-btn').forEach((card, i) => revealAsCard(card, chestDelay + i * 160));
            updatePartyStatusBars();
            coinFlightDelay = 0;
        }

        function renderTreasureItemsGrid() {
            document.getElementById('treasureItemsList').innerHTML = currentTreasureItems.map((it, idx) => {
                if(!it) {
                    return `<div class="armory-btn taken"><span class="tile-text"><strong>Prelevato</strong></span></div>`;
                }
                return `
                    <button class="armory-btn" onclick="selectTreasureItem(${idx})">
                        ${itemIconHtml(it)}
                        <span class="tile-text">
                            <strong>${it.name}</strong>
                            <span class="tile-sub">${it.desc}</span>
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
            document.getElementById('selectedTreasureDesc').textContent = selectedTreasureItem.desc;
            document.getElementById('treasureHeroSelect').innerHTML = heroOptionsForItem(selectedTreasureItem);
        }

        function cancelTreasureItemSelection() {
            document.getElementById('treasureAssignArea').classList.add('hidden');
            document.getElementById('treasureItemsList').classList.remove('hidden');
            document.getElementById('btnExitTreasure').classList.remove('hidden');
        }

        function confirmTreasureAssignment() {
            const hero = party.find(p => p.name === document.getElementById('treasureHeroSelect').value);
            expeditionStats.itemsFound++;
            assignItemToHero(selectedTreasureItem, hero, () => {
                currentTreasureItems[selectedTreasureIndex] = null;
                cancelTreasureItemSelection();
                renderTreasureItemsGrid();
            });
        }

