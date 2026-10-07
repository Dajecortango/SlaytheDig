/* ==========================================================================
   CREAZIONE DEL PARTY
   Numero di eroi, scelta degli eroi, abilità e oggetto iniziale.
   Diviso da js/game.js: stesso ambito globale (usa stato, LIBRERIA, showScreen...).
   Caricato subito dopo js/game.js; le funzioni si chiamano tra file solo dopo il caricamento.
   ========================================================================== */

        function startPartyCreation() {
            showScreen('screenParty');
            stato.party = [];
            stato.partyCoins = 0;
            displayedCoins = 0;
            stato.unlockedRelics = [];
            stato.activeCurses = [];
            stato.expeditionStats = newExpeditionStats();
            // Testi come all'inizio (confirmPartySize li cambia): conta per una seconda partita nella stessa pagina
            document.getElementById('partyHeaderTitle').textContent = 'Creazione del Party';
            document.getElementById('partyNarrativeBox').innerHTML = '<strong>Descrizione:</strong> Raduna i membri della spedizione e seleziona il loro equipaggiamento iniziale.';
            document.getElementById('partyConfigArea').classList.remove('hidden');
            document.getElementById('heroCreationArea').classList.add('hidden');
            document.getElementById('abilityArea').classList.add('hidden');
            document.getElementById('armoryArea').classList.remove('hidden');
            document.getElementById('armoryArea').classList.add('hidden');
            document.getElementById('btnProceedHero').classList.add('hidden');
            updatePartyStatusBars();
        }

        function confirmPartySize() {
            partySize = parseInt(document.getElementById('partySizeSelect').value);
            document.getElementById('partyConfigArea').classList.add('hidden');
            document.getElementById('heroCreationArea').classList.remove('hidden');
            document.getElementById('partyHeaderTitle').textContent = "Reclutamento Eroi";
            document.getElementById('partyNarrativeBox').innerHTML = `<strong>Descrizione:</strong> Scegli i membri che comporranno la squadra e assegna loro le abilità e l'armeria iniziale.`;
            loadHeroGridOptions();
        }

        function loadHeroGridOptions() {
            const gridContainer = document.getElementById('heroGridButtons');
            const availableHeroes = campaignHeroes.filter(h => !stato.party.some(p => p.name === h.name));

            gridContainer.innerHTML = availableHeroes.map(h => `
                <button class="armory-btn" ${azione('selectHeroCard', h.name)}>
                    <span class="hero-portrait small ${heroPortraitClass(h.name)}" style="--hue:${heroHue(h.name)}">${heroPortraitInner(h.name)}</span>
                    <span class="tile-text">
                        <strong>${h.name}</strong>
                        <span class="tile-sub stat-chips">
                            <span class="stat-chip"><i>FOR</i>${h.str}</span>
                            <span class="stat-chip"><i>INT</i>${h.int}</span>
                            <span class="stat-chip"><i>FED</i>${h.fth}</span>
                            <span class="stat-chip"><i>HP</i>${h.maxHp}</span>
                        </span>
                    </span>
                </button>
            `).join('');
        }

        let activeHeroForCreation = null;
        function selectHeroCard(heroName) {
            activeHeroForCreation = JSON.parse(JSON.stringify(campaignHeroes.find(h => h.name === heroName)));
            document.getElementById('heroCreationArea').classList.add('hidden');

            const heroAbilities = campaignAbilities[heroName] || [];
            if(heroAbilities.length > 0) {
                document.getElementById('abilityArea').classList.remove('hidden');
                document.getElementById('abilityButtons').innerHTML = heroAbilities.map((ab, idx) => `
                    <button class="armory-btn" ${azione('selectAbility', idx)} style="width:100%; margin:5px 0;">
                        ${abilityIconHtml(ab)}
                        <span class="tile-text">
                            <strong>${ab.name}</strong>
                            ${ab.desc ? `<span class="tile-sub">${ab.desc}</span>` : ''}
                        </span>
                    </button>
                `).join('');
            } else {
                document.getElementById('armoryArea').classList.remove('hidden');
                document.getElementById('btnProceedHero').classList.remove('hidden');
                loadArmoryOptions();
            }
        }

        function selectAbility(idx) {
            const chosen = campaignAbilities[activeHeroForCreation.name][idx];
            activeHeroForCreation.chosenAbility = chosen;

            if(chosen.type === 'passive_stat') {
                if(chosen.stat === 'str') activeHeroForCreation.str += chosen.val;
                else if(chosen.stat === 'int') activeHeroForCreation.int += chosen.val;
                else if(chosen.stat === 'fth') activeHeroForCreation.fth += chosen.val;
                else if(chosen.stat === 'hp') { activeHeroForCreation.maxHp += chosen.val; activeHeroForCreation.hp += chosen.val; }
            }
            else if(chosen.effects) {
                applyEffects(chosen.effects, activeHeroForCreation);
            }

            document.getElementById('abilityArea').classList.add('hidden');
            document.getElementById('armoryArea').classList.remove('hidden');
            document.getElementById('btnProceedHero').classList.remove('hidden');
            loadArmoryOptions();
        }

        // L'oggetto iniziale scelto porta il segno "startingPick" (tolto in nextHero): così lo zaino può
        // già contenere oggetti dati da un'abilità (effetto hero_item) senza confondere la scelta
        const startingPick = hero => hero.items.find(it => it.startingPick);

        function loadArmoryOptions() {
            const picked = startingPick(activeHeroForCreation);
            const hasItem = !!picked;
            document.getElementById('inventoryCountText').textContent = hasItem ?
                `Oggetto scelto: ${picked.name} (Clicca di nuovo per deselezionare)` : `Seleziona 1 oggetto iniziale (Max 1):`;

            document.getElementById('btnProceedHero').disabled = !hasItem;

            document.getElementById('armoryButtons').innerHTML = campaignArmory.map((item, idx) => {
                const isSelected = hasItem && picked.name === item.name;
                return `
                    <button class="armory-btn ${isSelected ? 'selected' : ''}" ${azione('togglePickItem', idx)}>
                        ${itemIconHtml(item)}
                        <span class="tile-text">
                            <strong>${item.name}</strong>
                            <span class="tile-sub">${item.desc}</span>
                            ${isSelected ? '<span class="tile-tag">Selezionato</span>' : ''}
                        </span>
                    </button>
                `;
            }).join('');
        }

        function togglePickItem(idx) {
            const item = campaignArmory[idx];
            const hero = activeHeroForCreation;
            const picked = startingPick(hero);
            if (picked) {
                revertItemEffects(picked, hero);
                hero.items.splice(hero.items.indexOf(picked), 1);
            }
            if (!picked || picked.name !== item.name) {
                const newItem = { ...JSON.parse(JSON.stringify(item)), startingPick: true };
                hero.items.push(newItem);
                applyItemEffects(newItem, hero);
                discover('items', newItem.id);
            }
            loadArmoryOptions();
        }

        function nextHero() {
            activeHeroForCreation.items.forEach(it => { delete it.startingPick; });
            stato.party.push(activeHeroForCreation);
            updatePartyStatusBars();
            document.getElementById('armoryArea').classList.add('hidden');
            document.getElementById('btnProceedHero').classList.add('hidden');

            if(stato.party.length < partySize) {
                document.getElementById('heroCreationArea').classList.remove('hidden');
                loadHeroGridOptions();
            } else {
                showScreen('screenCampaignIntro');
            }
        }
