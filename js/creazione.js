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

        // escludi: altri nomi da non mostrare (la partita online toglie gli eroi con una creazione in sospeso)
        function loadHeroGridOptions(escludi = []) {
            const gridContainer = document.getElementById('heroGridButtons');
            const availableHeroes = campaignHeroes.filter(h => !stato.party.some(p => p.name === h.name) && !escludi.includes(h.name));

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

        /* ---------- Rune (Alastorta B. Dignitas) ----------
           Un eroe con "runeOptions" (id della libreria Abilità) e "runeSlots" sceglie quante rune dice
           runeSlots tra quelle offerte, al posto dell'abilità; a ogni riposo può scambiarne una equipaggiata
           con una che non ha (openRuneSwap). Equipaggiate in hero.equippedRunes. Le rune agiscono con i loro
           "effects": hero_set (segnali delle passive, tolti quando la runa si toglie) e hero_stat. */
        function runeData(id) {
            return (LIBRERIA.abilita || {})[id] || null;
        }

        // sign 1 = equipaggia, -1 = toglie
        function applyRune(hero, id, sign = 1) {
            const rune = runeData(id);
            if (!rune) return;
            (rune.effects || []).forEach(e => {
                if (e.effect === 'hero_set') {
                    if (sign > 0) hero[e.stat] = e.val; else delete hero[e.stat];
                } else if (e.effect === 'hero_stat') {
                    hero[e.stat] = (hero[e.stat] || 0) + sign * e.val;
                } else if (sign > 0) {
                    applyEffects([e], hero);
                }
            });
            refreshScaledBonuses(hero);
        }

        function heroHasRunes(hero) {
            return !!(hero && hero.runeOptions && hero.runeOptions.length && hero.runeSlots > 0);
        }

        /* ---------- Abilità fisse ("abilitaFisse" nella libreria Eroi) ----------
           L'eroe le ha sempre, oltre a quella che sceglie (es. Enea: Hammergradiano Puro + Scudo del Nord).
           I loro "effects" si applicano una volta alla creazione, come quelli delle rune; gli "speciali"
           agiscono sempre (heroAbilityRefs in js/motore/speciali.js). Usata anche dal simulatore. */
        function fixedAbilities(hero) {
            return ((hero && hero.abilitaFisse) || []).map(runeData).filter(Boolean);
        }
        function applyFixedAbilities(hero) {
            ((hero && hero.abilitaFisse) || []).forEach(id => applyRune(hero, id, 1));
        }

        function renderRuneChoice() {
            const hero = activeHeroForCreation;
            const chosen = hero.equippedRunes || [];
            const slots = Math.min(hero.runeSlots, hero.runeOptions.length);
            document.getElementById('abilityButtons').innerHTML = `
                <p class="rune-hint">Scegli <b>${slots}</b> rune (${chosen.length}/${slots}). A ogni riposo potrai scambiarne una con una di quelle che non hai.</p>
                ${hero.runeOptions.map(runeData).filter(Boolean).map(r => `
                <button class="armory-btn ${chosen.includes(r.id) ? 'selected' : ''}" ${azione('toggleCreationRune', r.id)} style="width:100%; margin:5px 0;">
                    ${abilityIconHtml(r)}
                    <span class="tile-text">
                        <strong>${esc(r.name)}</strong>
                        ${r.desc ? `<span class="tile-sub">${kw(r.desc)}</span>` : ''}
                        ${chosen.includes(r.id) ? '<span class="tile-tag">Scelta</span>' : ''}
                    </span>
                </button>`).join('')}
                <button class="btn-proceed" ${azione('confirmCreationRunes')} ${chosen.length === slots ? '' : 'disabled'}>Conferma le rune</button>`;
        }

        function toggleCreationRune(id) {
            const hero = activeHeroForCreation;
            const chosen = hero.equippedRunes = hero.equippedRunes || [];
            if (chosen.includes(id)) chosen.splice(chosen.indexOf(id), 1);
            else if (chosen.length < Math.min(hero.runeSlots, hero.runeOptions.length)) chosen.push(id);
            renderRuneChoice();
        }

        function confirmCreationRunes() {
            const hero = activeHeroForCreation;
            if ((hero.equippedRunes || []).length !== Math.min(hero.runeSlots, hero.runeOptions.length)) return;
            hero.equippedRunes.forEach(id => applyRune(hero, id, 1));
            hero.creationStep = 'armeria';
            document.getElementById('abilityArea').classList.add('hidden');
            document.getElementById('armoryArea').classList.remove('hidden');
            document.getElementById('btnProceedHero').classList.remove('hidden');
            loadArmoryOptions();
        }

        // Riposo: scambia una runa equipaggiata ("out") con una non equipaggiata ("into")
        function swapRune(heroName, out, into) {
            const hero = stato.party.find(h => h.name === heroName);
            if (!heroHasRunes(hero) || !(hero.equippedRunes || []).includes(out) || hero.equippedRunes.includes(into)
                || !hero.runeOptions.includes(into)) return false;
            applyRune(hero, out, -1);
            applyRune(hero, into, 1);
            hero.equippedRunes = hero.equippedRunes.map(id => id === out ? into : id);
            return true;
        }

        // Eroe in creazione. Il passo a cui è arrivato sta in activeHeroForCreation.creationStep: 'scelta' (abilità o
        // rune) o 'armeria' (oggetto iniziale); nextHero lo toglie. Così la partita online può mettere da parte la
        // creazione di un giocatore che si scollega (una bozza) e riprenderla dallo stesso punto (mostraPassoCreazione).
        let activeHeroForCreation = null;
        function selectHeroCard(heroName) {
            activeHeroForCreation = JSON.parse(JSON.stringify(campaignHeroes.find(h => h.name === heroName)));
            applyFixedAbilities(activeHeroForCreation);
            const conRune = heroHasRunes(activeHeroForCreation);
            if (conRune) activeHeroForCreation.equippedRunes = [];
            activeHeroForCreation.creationStep = (conRune || (campaignAbilities[heroName] || []).length > 0) ? 'scelta' : 'armeria';
            mostraPassoCreazione();
        }

        // Disegna il passo della creazione di activeHeroForCreation senza azzerare quello che ha già scelto
        function mostraPassoCreazione() {
            const hero = activeHeroForCreation;
            ['heroCreationArea', 'abilityArea', 'armoryArea', 'btnProceedHero'].forEach(id => document.getElementById(id).classList.add('hidden'));
            if (hero.creationStep === 'armeria') {
                document.getElementById('armoryArea').classList.remove('hidden');
                document.getElementById('btnProceedHero').classList.remove('hidden');
                loadArmoryOptions();
                return;
            }
            const heroAbilities = campaignAbilities[hero.name] || [];
            // Abilità fisse: si vedono sopra la scelta, già prese
            const fixedHtml = fixedAbilities(hero).map(ab => `
                <div class="armory-btn selected fixed-ability" style="width:100%; margin:5px 0;">
                    ${abilityIconHtml(ab)}
                    <span class="tile-text">
                        <strong>${ab.name}</strong>
                        ${ab.desc ? `<span class="tile-sub">${ab.desc}</span>` : ''}
                        <span class="tile-tag">Sempre attiva</span>
                    </span>
                </div>`).join('');
            document.getElementById('abilityArea').classList.remove('hidden');
            if (heroHasRunes(hero)) {
                renderRuneChoice();
            } else {
                document.getElementById('abilityButtons').innerHTML = fixedHtml + heroAbilities.map((ab, idx) => `
                    <button class="armory-btn" ${azione('selectAbility', idx)} style="width:100%; margin:5px 0;">
                        ${abilityIconHtml(ab)}
                        <span class="tile-text">
                            <strong>${ab.name}</strong>
                            ${ab.desc ? `<span class="tile-sub">${ab.desc}</span>` : ''}
                        </span>
                    </button>
                `).join('');
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
            activeHeroForCreation.creationStep = 'armeria';

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
            // Nessun oggetto che l'eroe possa prendere (armeria vuota, o solo armature per Lista dei torti): si prosegue senza
            const canPick = campaignArmory.some(item => heroCanUseItem(activeHeroForCreation, item));
            document.getElementById('inventoryCountText').textContent = hasItem ?
                `Oggetto scelto: ${picked.name} (Clicca di nuovo per deselezionare)`
                : canPick ? `Seleziona 1 oggetto iniziale (Max 1):` : 'Nessun oggetto iniziale disponibile: puoi proseguire.';

            document.getElementById('btnProceedHero').disabled = !hasItem && canPick;

            document.getElementById('armoryButtons').innerHTML = campaignArmory.map((item, idx) => {
                const isSelected = hasItem && picked.name === item.name;
                const vietato = !heroCanUseItem(activeHeroForCreation, item);
                return `
                    <button class="armory-btn ${isSelected ? 'selected' : ''}" ${vietato ? 'disabled data-tip="Non può portare armature"' : azione('togglePickItem', idx)}>
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
            if (!heroCanUseItem(hero, item)) { uiError(`${hero.name} non può portare ${item.name}: niente armature`); return; }
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
            delete activeHeroForCreation.creationStep;
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
