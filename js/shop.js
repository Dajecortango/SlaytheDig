/* ==========================================================================
   MERCANTE
   Merce (5 oggetti + 1 consumabile, rarità in base all'avanzamento),
   carte coperte da scoprire, rinnovo della merce a pagamento, contrattazione
   (prova di Intelligenza sempre più difficile), acquisto, vendita e uscita.
   Caricato dopo js/game.js (stesso ambito globale: usa stato, gameItems, LIBRERIA...).
   ========================================================================== */

        // Prezzo base per rarità: il mercante vende con una piccola oscillazione e compra a metà
        const ITEM_BASE_PRICE = { scarso: 3, comune: 5, non_comune: 8, raro: 11, epico: 21, leggendario: 30 };
        const ITEM_PRICE_SPREAD = { scarso: 1, comune: 1, non_comune: 1, raro: 2, epico: 3, leggendario: 4 };

        // Più si avanza nella mappa più il mercante alza i prezzi: +40% all'ultimo livello
        // (anche le monete trovate crescono con l'avanzamento, vedi scaledCoins)
        const MERCHANT_PROGRESS_MARKUP = 0.4;
        function merchantProgressMultiplier() {
            return 1 + MERCHANT_PROGRESS_MARKUP * mapProgress();
        }

        function itemSellPrice(item) {
            return Math.max(1, Math.floor(ITEM_BASE_PRICE[itemRarity(item)] / 2));
        }

        let merchantItemsWithPrices = [];
        let currentMerchantItem = null;

        // Merce del mercante: 5 oggetti da equipaggiare (senza doppioni finché il bottino lo permette)
        // più 1 consumabile, tutti dal bottino della campagna. Le rarità alte diventano più probabili
        // andando avanti nella mappa (scarso/comune/non comune/raro/epico/leggendario, % dal primo all'ultimo livello).
        const MERCHANT_EQUIPMENT_SLOTS = 5;
        const isConsumableItem = item => !!(item.type && item.type.startsWith('consumable'));

        function merchantRarityWeights(progress) {
            const lerp = (a, b) => a + (b - a) * progress;
            return { scarso: lerp(10, 0), comune: lerp(38, 8), non_comune: lerp(27, 20), raro: lerp(20, 35), epico: lerp(5, 27), leggendario: lerp(0, 10) };
        }

        // Usata anche dal simulatore: niente stato dell'interfaccia (contrattazione, carte scoperte) qui dentro
        function generateMerchantStock() {
            const weights = merchantRarityWeights(mapProgress());
            const equipment = gameItems.filter(i => !isConsumableItem(i));
            // Se il bottino della campagna non ha consumabili, si prendono quelli dell'armeria condivisa
            let consumables = gameItems.filter(isConsumableItem);
            if (consumables.length === 0) consumables = Object.values(LIBRERIA.armeria).filter(isConsumableItem);

            const shopPool = [];
            for (let i = 0; i < MERCHANT_EQUIPMENT_SLOTS && equipment.length > 0; i++) {
                const notYetOffered = equipment.filter(item => !shopPool.includes(item));
                shopPool.push(pickByRarity(notYetOffered.length ? notYetOffered : equipment, weights));
            }
            shopPool.push(pickByRarity(consumables, weights));

            return shopPool.filter(Boolean).map(item => {
                const rarity = itemRarity(item);
                const spread = ITEM_PRICE_SPREAD[rarity];
                let basePrice = ITEM_BASE_PRICE[rarity] + Math.floor(Math.random() * (spread * 2 + 1)) - spread;
                basePrice = Math.round(basePrice * merchantProgressMultiplier());

                // Applica gli sconti delle reliquie
                if (hasRelic("Moneta di fredlos")) basePrice = Math.floor(basePrice * 0.5);
                if (hasRelic("Lasciapassare mercantile")) basePrice = Math.max(1, basePrice - 3);
                // Maledizione: Rancore del Mercante (+2 monete su ogni articolo)
                if (hasCurse("Rancore del Mercante")) basePrice += 2;

                return { item, price: basePrice, revealed: false };
            });
        }

        /* ---------- Contrattazione: una sola proposta per mercante ---------- */
        const MERCHANT_REROLL_COST = 5;
        const HAGGLE_DISCOUNT = 0.25;   // successo: -25% su tutta la merce
        const HAGGLE_PENALTY = 2;       // fallimento: +2 monete su ogni articolo
        let merchantHaggle = null;      // null = non ancora tentata, 'ok' = riuscita, 'fail' = fallita
        let merchantRerolled = false;   // la merce si rinnova una sola volta per mercante

        // Rinnovo possibile una sola volta e solo prima di aver comprato qualcosa (un articolo comprato diventa null)
        function merchantBoughtSomething() {
            return merchantItemsWithPrices.some(entry => !entry);
        }

        // Classe di difficoltà: 6 al primo livello, 10 all'ultimo
        function haggleCd() {
            return 6 + Math.round(4 * mapProgress());
        }

        function hagglePrice(basePrice) {
            if (merchantHaggle === 'ok') return Math.max(1, Math.floor(basePrice * (1 - HAGGLE_DISCOUNT)));
            if (merchantHaggle === 'fail') return basePrice + HAGGLE_PENALTY;
            return basePrice;
        }

        // Nuova merce coperta, con il prezzo base conservato per la contrattazione
        function stockMerchant() {
            merchantItemsWithPrices = generateMerchantStock().map(entry => ({ ...entry, basePrice: entry.price, price: hagglePrice(entry.price) }));
        }

        // Stesse regole delle prove: vantaggio di Dioforo con l'Intelligenza (Fede Inaridita qui non conta: si contratta solo con l'Intelligenza)
        function haggleRollMode(hero, stat) {
            const advantage = !!hero.hasAdvantageOnIntFth || (hero.chosenAbility && hero.chosenAbility.id === 'dioforo_era_solo_una_prova');
            const disadvantage = stat === 'fth' && hasCurse("Fede Inaridita");
            if (advantage && !disadvantage) return 'best';
            if (disadvantage && !advantage) return 'worst';
            return 'single';
        }

       function startMerchant(merchantId) {
    showScreen('screenMerchant');
    const descText = merchantsData[merchantId] || merchantsData.default || "Un mercante di passaggio offre i suoi beni.";
    const markup = Math.round((merchantProgressMultiplier() - 1) * 100);
    document.getElementById('merchantDescBox').innerHTML = `<strong>Descrizione:</strong> ${descText}`
        + (markup > 0 ? `<br><em>Così lontano dalle strade battute il mercante chiede il ${markup}% in più.</em>` : '');

    document.getElementById('merchantAssignArea').classList.add('hidden');
    document.getElementById('merchantItemsList').classList.remove('hidden');
    document.getElementById('btnExitMerchant').classList.remove('hidden');

    merchantHaggle = null;
    merchantRerolled = false;
    showMerchantTab('buy');
    stockMerchant();

    renderMerchantShop();
}

        function renderMerchantShop() {
            document.getElementById('merchantItemsList').innerHTML = merchantItemsWithPrices.map((entry, idx) => {
                if(!entry) {
                    return `<div class="armory-btn taken"><span class="tile-text"><strong>Venduto</strong></span></div>`;
                }
                if (!entry.revealed) {
                    return cardBackHtml(`revealMerchantItem(${idx})`, 'Merce coperta', 'Clicca per scoprire cosa offre il mercante', `rar-back-${itemRarity(entry.item)}`)
                        .replace('<button ', `<button data-idx="${idx}" `);
                }
                const canAfford = stato.partyCoins >= entry.price;
                const flip = idx === justRevealedMerchantIdx ? `card-flip-in reveal-${itemRarity(entry.item)}` : '';
                const oldPrice = entry.price !== entry.basePrice ? `<s class="price-old">${entry.basePrice}</s>` : '';
                return `
                    <button data-idx="${idx}" class="armory-btn rar-card-${itemRarity(entry.item)} ${canAfford ? '' : 'unaffordable'} ${flip}" onclick="tryBuyMerchantItem(${idx})" data-tip="${esc(itemTip(entry.item))}">
                        ${itemIconHtml(entry.item)}
                        <span class="tile-text">
                            <strong>${entry.item.name}</strong>
                            <span class="tile-sub">${kw(entry.item.desc)}</span>
                        </span>
                        <span class="price ${canAfford ? '' : 'too-much'}">${oldPrice}<span class="coin"></span>${entry.price}</span>
                    </button>
                `;
            }).join('');
            renderMerchantTools();
        }

        // Pulsanti "Rinnova la merce" e "Contratta" con lo stato della contrattazione
        function renderMerchantTools() {
            const reroll = document.getElementById('btnMerchantReroll');
            const rerollBlock = merchantRerolled ? 'Hai già rinnovato la merce di questo mercante.'
                : merchantBoughtSomething() ? 'Non si può più rinnovare: hai già comprato qualcosa.'
                : stato.partyCoins < MERCHANT_REROLL_COST ? 'Non hai abbastanza monete.' : '';
            reroll.disabled = !!rerollBlock;
            reroll.dataset.tip = `Rinnova la merce||Paghi ${MERCHANT_REROLL_COST} monete e il mercante mostra 6 nuove carte coperte (quelle attuali vengono rimesse via). ` +
                `Una sola volta per mercante, e solo prima di comprare.${rerollBlock ? ' ' + rerollBlock : ''}`;
            const haggle = document.getElementById('btnMerchantHaggle');
            haggle.disabled = merchantHaggle !== null || !stato.party.some(h => h.hp > 0);
            haggle.dataset.tip = `Contratta||Una prova di Intelligenza (CD ${haggleCd()}, cresce andando avanti nella spedizione). ` +
                `Successo: -${HAGGLE_DISCOUNT * 100}% su tutta la merce. Fallimento: +${HAGGLE_PENALTY} monete su ogni articolo. Una sola proposta per mercante.`;
            const note = document.getElementById('merchantHaggleNote');
            note.classList.toggle('hidden', merchantHaggle === null);
            note.className = `merchant-haggle-note ${merchantHaggle === 'ok' ? 'ok' : merchantHaggle === 'fail' ? 'fail' : 'hidden'}`;
            note.textContent = merchantHaggle === 'ok' ? `Contrattazione riuscita: -${HAGGLE_DISCOUNT * 100}% su tutta la merce.`
                : merchantHaggle === 'fail' ? `Il mercante si è offeso: +${HAGGLE_PENALTY} monete su ogni articolo.` : '';
        }

        function rerollMerchantStock() {
            if (merchantRerolled || merchantBoughtSomething() || stato.partyCoins < MERCHANT_REROLL_COST) return;
            merchantRerolled = true;
            stato.partyCoins -= MERCHANT_REROLL_COST;
            stockMerchant();
            synthSfx('flip');
            updatePartyStatusBars();
            renderMerchantShop();
            document.querySelectorAll('#merchantItemsList .card-back').forEach((card, i) => revealAsCard(card, i * 70));
        }

        function openHaggle() {
            if (merchantHaggle !== null) return;
            const cd = haggleCd();
            const rows = stato.party.filter(h => h.hp > 0).map(h => {
                const btn = (stat, label) => {
                    const mode = haggleRollMode(h, stat);
                    const info = chanceText(cd - (h[stat] || 0) - relicDiceBonus(), mode === 'best', mode === 'worst');
                    return `<button class="btn-small" onclick="haggle('${esc(h.name)}', '${stat}')">${label} ${h[stat] || 0} · ${info.short}</button>`;
                };
                return `<div class="haggle-row"><b>${esc(h.name)}</b>${btn('int', 'Intelligenza')}</div>`;
            }).join('');
            openModal('Contrattare con il mercante',
                `<p>Il mercante ascolta una sola proposta. Prova di <b>Intelligenza</b>, Classe di Difficoltà <b>${cd}</b>.</p>
                 <p>Successo: <b style="color:var(--accent-green)">-${HAGGLE_DISCOUNT * 100}%</b> su tutta la merce (anche se la rinnovi).
                    Fallimento: <b style="color:var(--curse-color)">+${HAGGLE_PENALTY}</b> monete su ogni articolo.</p>
                 <div class="haggle-rows">${rows}</div>`,
                [{ label: 'Lascia stare', className: 'btn-danger' }], { wide: true });
        }

        function haggle(heroName) {
            const stat = 'int';  // si contratta solo con l'Intelligenza
            const hero = stato.party.find(h => h.name === heroName);
            if (!hero || merchantHaggle !== null) return;
            closeModal();
            const cd = haggleCd();
            const mode = haggleRollMode(hero, stat);
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            const roll = mode === 'best' ? Math.max(d1, d2) : mode === 'worst' ? Math.min(d1, d2) : d1;
            const total = roll + (hero[stat] || 0) + relicDiceBonus();
            const success = naturalRollSuccess(roll, total, cd);
            merchantHaggle = success ? 'ok' : 'fail';
            merchantItemsWithPrices.forEach(entry => { if (entry) entry.price = hagglePrice(entry.basePrice); });

            synthSfx('dice');
            setTimeout(() => {
                diceOutcomeSfx(roll);
                const statLabel = 'Intelligenza';
                const dice = mode === 'single' ? `Dado: <b>${d1}</b>` : `Dadi [${d1}, ${d2}]: tiene <b>${roll}</b> (${mode === 'best' ? 'Era solo una prova!' : 'Fede Inaridita'})`;
                openModal(success ? 'Affare fatto!' : 'Il mercante si offende',
                    `<p>${dice} + ${statLabel} ${hero[stat] || 0} (${esc(hero.name)})${relicDiceBonus() ? ' + 1 Frammento di Yr-Drazul' : ''} = <b>${total}</b> contro CD ${cd}.</p>
                     ${naturalRollNote(roll, total, cd) ? `<p>${naturalRollNote(roll, total, cd)}</p>` : ''}
                     <p>${success ? `Tutta la merce costa il ${HAGGLE_DISCOUNT * 100}% in meno.` : `Ogni articolo costa ${HAGGLE_PENALTY} monete in più.`}</p>`);
                renderMerchantShop();
            }, 500);
        }

        function tryBuyMerchantItem(idx) {
            let entry = merchantItemsWithPrices[idx];
            if (!entry || !entry.revealed) return;
            if(stato.partyCoins < entry.price) {
                uiError("Non hai abbastanza monete");
                return;
            }

            stato.partyCoins -= entry.price;
            currentMerchantItem = entry.item;
            merchantItemsWithPrices[idx] = null;

            document.getElementById('merchantItemsList').classList.add('hidden');
            document.getElementById('merchantTabs').classList.add('hidden');
            document.getElementById('merchantTools').classList.add('hidden');
            document.getElementById('btnExitMerchant').classList.add('hidden');
            document.getElementById('merchantAssignArea').classList.remove('hidden');
            fillHeroSelectForItem('merchantHeroSelect', currentMerchantItem);

            updatePartyStatusBars();
        }

        function confirmMerchantAssignment() {
            const hero = stato.party.find(p => p.name === document.getElementById('merchantHeroSelect').value);
            document.getElementById('merchantAssignArea').classList.add('hidden');
            assignItemToHero(currentMerchantItem, hero, () => {
                document.getElementById('merchantItemsList').classList.remove('hidden');
                document.getElementById('merchantTabs').classList.remove('hidden');
                document.getElementById('merchantTools').classList.remove('hidden');
                document.getElementById('btnExitMerchant').classList.remove('hidden');
                renderMerchantShop();
            }, chosenDiscardIdx('merchantHeroSelect'));
        }

        function showMerchantTab(tab) {
            const selling = tab === 'sell';
            document.getElementById('merchantTabBuy').classList.toggle('active', !selling);
            document.getElementById('merchantTabSell').classList.toggle('active', selling);
            document.getElementById('merchantItemsList').classList.toggle('hidden', selling);
            document.getElementById('merchantSellList').classList.toggle('hidden', !selling);
            document.getElementById('merchantTools').classList.toggle('hidden', selling);
            if (selling) renderMerchantSellList(); else renderMerchantShop();
        }

        function renderMerchantSellList() {
            const entries = [];
            stato.party.forEach(hero => hero.items.forEach((item, idx) => entries.push({ hero, item, idx })));
            const list = document.getElementById('merchantSellList');
            if (entries.length === 0) {
                list.innerHTML = `<p class="panel-label">La compagnia non ha oggetti da vendere.</p>`;
                return;
            }
            list.innerHTML = entries.map(({ hero, item, idx }) => `
                <button class="armory-btn rar-card-${itemRarity(item)}" onclick="trySellItem('${esc(hero.name)}', ${idx})" data-tip="${esc(itemTip(item, hero))}">
                    ${itemIconHtml(item)}
                    <span class="tile-text">
                        <strong>${item.name}</strong>
                        <span class="tile-sub">${kw(item.desc)}</span>
                        <span class="tile-tag">${esc(hero.name)}</span>
                    </span>
                    <span class="price sell"><span class="coin"></span>+${itemSellPrice(item)}</span>
                </button>
            `).join('');
        }

        function trySellItem(heroName, idx) {
            const hero = stato.party.find(h => h.name === heroName);
            const item = hero && hero.items[idx];
            if (!item) return;
            const price = itemSellPrice(item);
            openModal('Vendere l\'oggetto?',
                `<p>Vendi <b>${item.name}</b> di ${esc(hero.name)} per <b style="color:var(--wc-yellow)">${price}</b> monete?</p>`,
                [{ label: 'Annulla', className: 'btn-proceed' }, { label: 'Vendi', className: 'btn-danger', onClick: () => {
                    revertItemEffects(item, hero);
                    hero.items.splice(idx, 1);
                    stato.partyCoins += price;
                    updatePartyStatusBars();
                    renderMerchantSellList();
                } }]);
        }

        function confirmLeaveMerchant() {
            const hidden = merchantItemsWithPrices.filter(entry => entry && !entry.revealed).length;
            const affordable = merchantItemsWithPrices.some(entry => entry && entry.revealed && stato.partyCoins >= entry.price);
            if (!affordable && !hidden) { advanceNode(); return; }
            const reasons = [];
            if (hidden) reasons.push(hidden === 1 ? 'c\'è ancora <b>1</b> carta da scoprire' : `ci sono ancora <b>${hidden}</b> carte da scoprire`);
            if (affordable) reasons.push(`hai <b style="color:var(--wc-yellow)">${stato.partyCoins}</b> monete e ci sono oggetti che puoi permetterti`);
            openModal('Lasciare il mercante?',
                `<p>${reasons.join(' e ').replace(/^./, c => c.toUpperCase())}.</p>`,
                [{ label: 'Resta nel negozio', className: 'btn-proceed' }, { label: 'Esci comunque', className: 'btn-danger', onClick: advanceNode }]);
        }
