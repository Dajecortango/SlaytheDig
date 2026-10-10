/* ==========================================================================
   Ponte verso il server locale (facoltativo, server/server.js).
   Se il server è in esecuzione, invia lo stato del party così i telefoni
   collegati via QR possono vederlo e (in una fase successiva) tirare i
   dadi. Se il server non c'è, ogni chiamata fallisce in silenzio: il gioco
   funziona esattamente come prima, questo file non è mai un requisito.
   ========================================================================== */
(function () {
    const REMOTE_PORT = 8787;
    const REMOTE_BASE = `http://localhost:${REMOTE_PORT}`;
    let pushTimer = null;

    function buildStatePayload() {
        return {
            campaignTitle: (typeof stato.currentCampaign !== 'undefined' && stato.currentCampaign) ? stato.currentCampaign.title : '',
            coins: (typeof stato.partyCoins !== 'undefined') ? stato.partyCoins : 0,
            // In combattimento le pozioni si usano nel proprio turno; fuori (mappa, riposo, mercante...) dal telefono
            inCombat: typeof currentScreenId !== 'undefined' && currentScreenId === 'screenCombat',
            scene: remoteScene(),
            heroes: (typeof stato.party !== 'undefined' ? stato.party : []).map(h => ({
                name: h.name,
                hp: h.hp, maxHp: h.maxHp,
                str: h.str, int: h.int, fth: h.fth, dmg: h.dmg,
                base_armor: h.base_armor, current_armor: h.current_armor,
                // Ritratto con la stessa inquadratura dell'icona del gioco (da ferito con 2 HP o meno)
                ...remotePortrait(h),
                items: (h.items || []).map(it => ({
                    name: it.name,
                    desc: it.desc,
                    rarity: typeof itemRarity === 'function' ? itemRarity(it) : null,
                    icon: typeof itemImageSrc === 'function' ? (itemImageSrc(it) || null) : null,
                    consumable: !!(it.type && it.type.startsWith('consumable')),
                    combatOnly: typeof isCombatConsumable === 'function' && isCombatConsumable(it),
                    revives: typeof itemRevives === 'function' && itemRevives(it),  // si può usare anche sui caduti
                    // Eroi su cui si può usare (stesse regole del gioco: canTargetWithItem)
                    targets: typeof canTargetWithItem === 'function' ? stato.party.filter(p => canTargetWithItem(it, p)).map(p => p.name) : null,
                    qty: it.qty || 1
                })),
                chosenAbility: h.chosenAbility ? h.chosenAbility.name : null,
                abilityDesc: h.chosenAbility ? (h.chosenAbility.desc || '') : '',
                runes: remoteRunes(h),
                blessings: (h.blessings || []).filter(x => typeof PRAYER_BLESSINGS !== 'undefined' && PRAYER_BLESSINGS[x.id])
                    .map(x => ({ name: PRAYER_BLESSINGS[x.id].name, desc: PRAYER_BLESSINGS[x.id].desc, icon: PRAYER_BLESSINGS[x.id].icon, n: x.n || 1 }))
            }))
        };
    }

    // Scena in corso che i telefoni possono usare: preghiera al riposo e bottino dopo uno scontro
    function remoteScene() {
        const screen = typeof currentScreenId !== 'undefined' ? currentScreenId : '';
        if (screen === 'screenRest' && typeof restPrayer !== 'undefined') {
            const p = restPrayer;
            return {
                kind: 'rest', cd: PRAYER_CD, major: PRAYER_MAJOR_TOTAL, canPray: !p,
                prayer: p ? { hero: p.hero, roll: p.roll, total: p.total, success: p.success, major: p.major, chosen: p.chosen, text: p.text,
                    choices: p.choices.map(b => ({ name: b.name, desc: b.desc, icon: b.icon, bersaglio: b.bersaglio, maggiore: b.livello === 'maggiore' })) } : null
            };
        }
        if (screen === 'screenLoot' && typeof lootChoices !== 'undefined') {
            const back = document.getElementById('lootCardBack');
            return {
                kind: 'loot', coins: Number((document.getElementById('lootCoinsText') || {}).textContent) || 0,
                revealed: !!back && back.classList.contains('hidden'), taken: lootTaken,
                choices: lootChoices.map(it => ({ name: it.name, desc: it.desc || '', id: it.id, type: it.type || '',
                    rarity: typeof itemRarity === 'function' ? itemRarity(it) : null,
                    icon: typeof itemImageSrc === 'function' ? (itemImageSrc(it) || null) : null }))
            };
        }
        return null;
    }

    // Rune (Alastorta): equipaggiate, disponibili e se adesso si può fare lo scambio del riposo
    function remoteRunes(h) {
        if (typeof heroHasRunes !== 'function' || !heroHasRunes(h)) return null;
        const info = id => { const r = runeData(id) || {}; return { id, name: r.name || id, desc: r.desc || '', icon: r.icon || null }; };
        const equipped = h.equippedRunes || [];
        return {
            equipped: equipped.map(info),
            others: h.runeOptions.filter(id => !equipped.includes(id)).map(info),
            canSwap: typeof currentScreenId !== 'undefined' && currentScreenId === 'screenRest'
                && typeof restRuneSwapped !== 'undefined' && !restRuneSwapped.includes(h.name)
        };
    }

    function remotePortrait(h) {
        const p = (typeof HERO_PORTRAITS !== 'undefined') ? HERO_PORTRAITS[h.name] : null;
        if (!p) return { portrait: null };
        const wounded = p.woundedSrc && typeof isHeroWounded === 'function' && isHeroWounded(h.hp);
        return {
            portrait: wounded ? p.woundedSrc : p.src,
            portraitPos: wounded ? p.woundedPos : p.pos,
            portraitZoom: wounded ? p.woundedZoom : p.zoom
        };
    }

    function pushStateNow() {
        fetch(`${REMOTE_BASE}/api/state`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildStatePayload())
        }).catch(() => {}); // server locale non attivo: si continua a giocare normalmente
    }

    // Raggruppa le chiamate ravvicinate: updatePartyStatusBars viene richiamata molto spesso
    function schedulePush() {
        if (pushTimer) return;
        pushTimer = setTimeout(() => { pushTimer = null; pushStateNow(); }, 300);
    }

    if (typeof updatePartyStatusBars === 'function') {
        const original = updatePartyStatusBars;
        updatePartyStatusBars = function (...args) {
            const result = original.apply(this, args);
            schedulePush();
            return result;
        };
    }

    /* ---------- QR code nella card eroe (Compagnia) ----------
       Il pulsante QR compare sulla card SOLO quando il tunnel ngrok è
       davvero attivo (window.__remoteTunnelUrl impostato dal pannello
       Opzioni): niente QR su indirizzi locali/LAN, come richiesto — se il
       tunnel non è attivo il pulsante non c'è proprio. Il pulsante è piccolo
       ed apre una modale con il QR grande del personaggio, invece di
       occupare spazio fisso nella card. */
    const qrCache = new Map();
    const QR_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/></svg>';

    function slugifyName(name) {
        const diacritics = new RegExp('[\\u0300-\\u036f]', 'g');
        return name.toLowerCase().normalize('NFD').replace(diacritics, '')
            .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    function remoteBaseUrl() {
        return window.__remoteTunnelUrl || null;
    }

    function remoteHeroUrl(heroName) {
        const base = remoteBaseUrl();
        return base ? `${base}/g/${slugifyName(heroName)}` : null;
    }

    function remoteQrSvgFor(heroName, cellSize) {
        const url = remoteHeroUrl(heroName);
        if (!url || typeof qrcode !== 'function') return null;
        const cacheKey = url + ':' + cellSize;
        if (qrCache.has(cacheKey)) return qrCache.get(cacheKey);
        try {
            const qr = qrcode(0, 'M');
            qr.addData(url);
            qr.make();
            const svg = qr.createSvgTag(cellSize, 4);
            qrCache.set(cacheKey, svg);
            return svg;
        } catch (e) { return null; }
    }

    window.remoteShowHeroQr = function (heroName) {
        const url = remoteHeroUrl(heroName);
        const svg = remoteQrSvgFor(heroName, 6);
        if (!url || !svg || typeof openModal !== 'function') return;
        const safeName = heroName.replace(/</g, '&lt;');
        openModal(`QR — ${safeName}`, `
            <div style="text-align:center;">
                <div style="background:#fff; display:inline-block; padding:10px; border:1px solid #000;">${svg}</div>
                <p style="margin-top:10px; font-size:0.8rem; color:var(--text-dim); word-break:break-all;">${url}</p>
            </div>`,
            [{ label: 'Chiudi', className: 'btn-proceed' }]);
    };

    if (typeof heroCardHtml === 'function') {
        const originalHeroCardHtml = heroCardHtml;
        heroCardHtml = function (h) {
            const html = originalHeroCardHtml(h);
            if (!remoteBaseUrl()) return html;

            const lastCloseIdx = html.lastIndexOf('</div>');
            if (lastCloseIdx === -1) return html;

            const safeName = h.name.replace(/'/g, "\\'");
            const btn = `<button type="button" class="hero-qr-btn" ${azione('remoteShowHeroQr', h.name)} data-stop data-tip="Scheda sul telefono||Apri il codice QR di ${h.name} per farlo scansionare">${QR_ICON}</button>`;
            return html.slice(0, lastCloseIdx) + btn + html.slice(lastCloseIdx);
        };
    }

    /* ---------- Scelta dell'azione di combattimento dal telefono ----------
       Appena un eroe deve agire in combattimento, il telefono collegato può
       scegliere lui l'azione (attacca/difendi/aiuta/abilità/oggetto), non solo
       il tiro. Per attacca/difendi/aiuta/abilità la scelta fa scattare, tramite
       selectCombatAction già agganciata sotto, la normale richiesta di tiro.
       Per "usa oggetto" (che non richiede un tiro) l'azione viene applicata
       subito con lo stesso effetto del menu locale. */
    let currentActionRequestId = null;

    function requestRemoteAction(hero) {
        const canUseAbility = typeof abilityUsable === 'function' ? abilityUsable(hero).ok : !!(hero.chosenAbility && hero.chosenAbility.isCombatActive && !hero.abilityUsedThisCombat);
        const consumables = (hero.items || [])
            .map((it, idx) => (it.type && it.type.startsWith('consumable')) ? { index: idx, name: it.name, desc: it.desc,
                // Bersagli possibili: gli eroi vivi, anche i caduti con le pozioni che rialzano
                targets: (typeof stato.party !== 'undefined' ? stato.party : []).filter(p => canTargetWithItem(it, p)).map(p => p.name) } : null)
            .filter(Boolean);
        const livingAllies = (typeof stato.party !== 'undefined' ? stato.party : []).filter(p => p.hp > 0).map(p => p.name);

        fetch(`${REMOTE_BASE}/api/action-request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                heroName: hero.name,
                canUseAbility,
                abilityLabel: hero.chosenAbility ? hero.chosenAbility.name : null,
                consumables,
                livingAllies
            })
        }).then(r => r.json()).then(data => {
            if (data && data.requestId) currentActionRequestId = data.requestId;
        }).catch(() => {}); // nessun server/telefono: restano solo i pulsanti locali
    }

    // Applica "usa oggetto" scelto dal telefono, come farebbe executeCombatUseItem() in locale.
    // Il turno dell'eroe è ancora aperto e senza azione scelta? Le risposte del telefono possono arrivare
    // dopo un'azione fatta in locale, un cambio di eroe o la fine dello scontro: allora si ignorano
    function remoteTurnOpen(heroName) {
        return currentScreenId === 'screenCombat' && !!currentActiveHero && currentActiveHero.name === heroName
            && currentActiveHero.hp > 0 && !currentActiveHero.hasActed && !chosenAction
            && !!stato.activeEnemy && stato.activeEnemy.hp > 0;
    }

    function applyRemoteItemUse(itemIdx, targetName) {
        if (!currentActiveHero || typeof useConsumable !== 'function') return;
        if (!useConsumable(currentActiveHero.name, itemIdx, targetName)) return;
        finishCombatItemTurn();
    }

    function handleRemoteActionChosen(data) {
        if (!data || !currentActionRequestId || data.requestId !== currentActionRequestId) return;
        currentActionRequestId = null;
        if (!remoteTurnOpen(data.heroName)) return; // turno già cambiato o azione già scelta in locale

        if (data.action === 'use_item') {
            applyRemoteItemUse(data.itemIndex, data.targetName);
        } else if (typeof selectCombatAction === 'function') {
            selectCombatAction(data.action); // fa scattare anche la richiesta di tiro, vedi sotto
        }
    }

    if (typeof confirmCombatHeroChoice === 'function') {
        const originalConfirmCombatHeroChoice = confirmCombatHeroChoice;
        confirmCombatHeroChoice = function (...args) {
            const result = originalConfirmCombatHeroChoice.apply(this, args);
            if (currentActiveHero) requestRemoteAction(currentActiveHero);
            return result;
        };
    }

    /* ---------- Tiro di dado remoto (combattimento + sfide) ----------
       Quando un eroe con il telefono collegato deve tirare, questo tab manda
       al server i prossimi dadi del sacchetto dell'eroe; il server li tiene
       nascosti finché il telefono non tira, poi li rimanda sia al telefono sia a questo
       tab, che risolve il turno esattamente come un click su "Tira" in
       locale. Il pulsante locale resta sempre utilizzabile come ripiego: se
       il giocatore clicca prima che il telefono risponda, il risultato
       remoto che arriva dopo viene ignorato (executeCombatHeroRoll e
       executeChallengeRoll si bloccano da soli se il tiro è già avvenuto). */
    let currentRollContext = null; // 'combat' | 'challenge' | null
    let currentRollRequestId = null;

    function requestRemoteRoll(heroName, diceCount, label, context) {
        currentRollContext = context;
        fetch(`${REMOTE_BASE}/api/roll-request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // I valori li decide il sacchetto dell'eroe (peekHeroDice in js/combattimento.js): il server li mostra
            // al telefono e li rimanda indietro, così il tiro dal telefono e quello locale pescano gli stessi dadi
            body: JSON.stringify({ heroName, diceCount, label, rolls: peekHeroDice(stato.party.find(h => h.name === heroName), diceCount) })
        }).then(r => r.json()).then(data => {
            if (data && data.requestId) currentRollRequestId = data.requestId;
        }).catch(() => {}); // nessun server/telefono: resta solo il pulsante locale
    }

    function handleRemoteRollResult(result) {
        if (!result || !currentRollRequestId || result.requestId !== currentRollRequestId) return;
        currentRollRequestId = null;
        if (currentRollContext === 'combat' && typeof executeCombatHeroRoll === 'function') {
            executeCombatHeroRoll(result.rolls);
        } else if (currentRollContext === 'challenge' && typeof executeChallengeRoll === 'function') {
            executeChallengeRoll(result.rolls);
        }
        currentRollContext = null;
    }

    if (window.EventSource) {
        try {
            const rollEvents = new EventSource(`${REMOTE_BASE}/api/events`);
            rollEvents.addEventListener('roll-result', e => {
                try { handleRemoteRollResult(JSON.parse(e.data)); } catch (err) {}
            });
            rollEvents.addEventListener('action-chosen', e => {
                try { handleRemoteActionChosen(JSON.parse(e.data)); } catch (err) {}
            });
            // Pozione usata dallo zaino del telefono fuori dal combattimento
            rollEvents.addEventListener('item-use', e => {
                try {
                    const data = JSON.parse(e.data);
                    if (typeof currentScreenId !== 'undefined' && currentScreenId === 'screenCombat') return;
                    if (typeof useConsumable === 'function') useConsumable(data.heroName, data.itemIndex, data.targetName);
                } catch (err) {}
            });
            // Preghiera e bottino dal telefono: solo le azioni elencate, il gioco controlla che si possano fare
            rollEvents.addEventListener('scene-action', e => {
                try {
                    const d = JSON.parse(e.data);
                    const prayingHere = () => typeof restPrayer !== 'undefined' && restPrayer && restPrayer.hero === d.heroName;
                    if (d.action === 'pray') remotePray(d.heroName);
                    else if (d.action === 'blessing' && prayingHere()) chooseBlessing(d.index);
                    else if (d.action === 'blessing-target' && prayingHere()) giveBlessing(d.targetName);
                    else if (d.action === 'loot-reveal') revealLootItem();
                    else if (d.action === 'loot-take') takeLootChoice(d.index, d.heroName, d.discardIndex);
                } catch (err) {}
            });
            // Scambio di una runa dal telefono durante un riposo
            rollEvents.addEventListener('rune-swap', e => {
                try {
                    const data = JSON.parse(e.data);
                    if (typeof restSwapRune === 'function') restSwapRune(data.heroName, data.out, data.into);
                } catch (err) {}
            });
            // nessun onerror gestito apposta: senza server l'EventSource ritenta da solo e non blocca nulla
        } catch (e) {}
    }

    if (typeof selectCombatAction === 'function') {
        const originalSelectCombatAction = selectCombatAction;
        selectCombatAction = function (action) {
            const result = originalSelectCombatAction.apply(this, arguments);
            if (result === 'instant') return result;  // abilità senza tiro: nessun dado da chiedere al telefono
            if (currentActiveHero && (action === 'attack' || action === 'defend' || action === 'help' || action === 'ability')) {
                const diceCount = (typeof combatRollUsesTwoDice === 'function' && combatRollUsesTwoDice(currentActiveHero, action)) ? 2 : 1;
                const labels = { attack: 'Attacca', defend: 'Difendi', help: 'Aiuta', ability: 'Abilità' };
                requestRemoteRoll(currentActiveHero.name, diceCount, labels[action] || 'Tira', 'combat');
            }
            return result;
        };
    }

    if (typeof confirmChallengeHero === 'function') {
        const originalConfirmChallengeHero = confirmChallengeHero;
        confirmChallengeHero = function (...args) {
            const result = originalConfirmChallengeHero.apply(this, args);
            if (typeof selectedChallengeHero !== 'undefined' && selectedChallengeHero) {
                const mode = (typeof challengeRollMode === 'function') ? challengeRollMode(selectedChallengeHero).mode : 'single';
                requestRemoteRoll(selectedChallengeHero.name, mode === 'single' ? 1 : 2, 'Sfida', 'challenge');
            }
            return result;
        };
    }

    /* ---------- Pannello "Compagnia connessa via QR" nelle Opzioni ----------
       Aggiunto in coda al modale di openOptions(): permette di scaricare/
       installare ngrok, salvare l'authtoken e avviare/fermare il tunnel.
       Tutto facoltativo: se il server locale non risponde, il pannello mostra
       solo un avviso e il resto del gioco non ne risente. */
    let ngrokPollTimer = null;

    window.remoteNgrokInstall = function () {
        fetch(`${REMOTE_BASE}/api/ngrok/install`, { method: 'POST' }).then(refreshNgrokStatus).catch(() => {});
    };

    window.remoteNgrokSaveToken = function () {
        const input = document.getElementById('remoteNgrokTokenInput');
        const token = input ? input.value.trim() : '';
        if (!token) return;
        fetch(`${REMOTE_BASE}/api/ngrok/authtoken`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        }).then(refreshNgrokStatus).catch(() => {});
    };

    window.remoteNgrokToggle = function () {
        fetch(`${REMOTE_BASE}/api/ngrok/status`).then(r => r.json()).then(status => {
            const action = status.running ? 'stop' : 'start';
            const btn = document.getElementById('remoteNgrokToggleBtn');
            const statusEl = document.getElementById('remoteNgrokStatus');
            if (btn) { btn.disabled = true; btn.textContent = action === 'start' ? 'Attivazione in corso...' : 'Disattivazione...'; }
            if (action === 'start' && statusEl) statusEl.textContent = 'Avvio del tunnel in corso, può richiedere qualche secondo...';
            fetch(`${REMOTE_BASE}/api/ngrok/${action}`, { method: 'POST' })
                .then(r => r.json())
                .then(result => {
                    if (result && result.error) {
                        // Errore persistente: ferma il polling automatico così non sparisce da solo.
                        // Riparte al prossimo tentativo (install/toggle) o alla riapertura del pannello.
                        clearInterval(ngrokPollTimer);
                        if (statusEl) statusEl.textContent = `Errore: ${result.error}`;
                        if (btn) { btn.disabled = false; btn.textContent = action === 'start' ? 'Attiva Tunnel' : 'Disattiva Tunnel'; }
                    } else {
                        refreshNgrokStatus();
                        pollNgrokStatusWhileOpen();
                    }
                })
                .catch(refreshNgrokStatus);
        }).catch(() => {});
    };

    function applyNgrokStatus(status) {
        const el = document.getElementById('remoteNgrokStatus');
        const installBtn = document.getElementById('remoteNgrokInstallBtn');
        const toggleBtn = document.getElementById('remoteNgrokToggleBtn');
        const tokenArea = document.getElementById('remoteNgrokTokenArea');
        if (!el || !installBtn || !toggleBtn) return;

        const wasTunnelUrl = window.__remoteTunnelUrl;

        if (status.install.state === 'downloading') el.textContent = 'Scaricamento di ngrok in corso...';
        else if (status.install.state === 'extracting') el.textContent = 'Installazione di ngrok in corso...';
        else if (status.install.state === 'error') el.textContent = `Errore: ${status.install.message}`;
        else if (!status.installed) el.textContent = 'ngrok non ancora installato su questo PC.';
        else if (status.running && status.publicUrl) {
            el.innerHTML = `Tunnel attivo: <b>${status.publicUrl}</b>`;
            window.__remoteTunnelUrl = status.publicUrl;
        } else if (status.needsAuthtoken) {
            el.textContent = 'ngrok installato: incolla il tuo authtoken (gratuito su ngrok.com) per continuare.';
            window.__remoteTunnelUrl = null;
        } else {
            el.textContent = 'ngrok pronto: puoi attivare il tunnel.';
            window.__remoteTunnelUrl = null;
        }

        // Il tunnel si è appena attivato/disattivato: ridisegna le card per mostrare/nascondere il pulsante QR
        if (wasTunnelUrl !== window.__remoteTunnelUrl && typeof updatePartyStatusBars === 'function') {
            updatePartyStatusBars();
        }

        const busy = status.install.state === 'downloading' || status.install.state === 'extracting';
        installBtn.disabled = busy;
        installBtn.textContent = status.installed ? 'Reinstalla ngrok' : 'Configura Tunnel ngrok';
        toggleBtn.disabled = !status.installed || status.needsAuthtoken;
        toggleBtn.textContent = status.running ? 'Disattiva Tunnel' : 'Attiva Tunnel';
        if (tokenArea) tokenArea.classList.toggle('hidden', !(status.installed && status.needsAuthtoken));
    }

    function refreshNgrokStatus() {
        fetch(`${REMOTE_BASE}/api/ngrok/status`).then(r => r.json()).then(applyNgrokStatus).catch(() => {
            const el = document.getElementById('remoteNgrokStatus');
            if (el) el.textContent = 'Server locale non raggiungibile: avvia avvia-server.bat per usare questa funzione.';
        });
    }

    function pollNgrokStatusWhileOpen() {
        clearInterval(ngrokPollTimer);
        const tick = () => {
            const modal = document.getElementById('wc3Modal');
            if (!modal || modal.classList.contains('hidden')) { clearInterval(ngrokPollTimer); return; }
            refreshNgrokStatus();
        };
        tick();
        ngrokPollTimer = setInterval(tick, 2500);
    }

    if (typeof openOptions === 'function') {
        const originalOpenOptions = openOptions;
        openOptions = function (...args) {
            const result = originalOpenOptions.apply(this, args);
            const body = document.getElementById('wc3ModalBody');
            if (body) {
                body.insertAdjacentHTML('beforeend', `
                    <div class="options-grid remote-ngrok-panel">
                        <div class="option-row option-row-column">
                            <span class="option-label">Compagnia connessa via QR<small>Server locale + tunnel ngrok, per far tirare i dadi dal telefono ai giocatori</small></span>
                            <div id="remoteNgrokStatus" class="remote-ngrok-status">Verifica in corso...</div>
                            <div class="remote-ngrok-buttons">
                                <button id="remoteNgrokInstallBtn" class="btn-small" data-action="remoteNgrokInstall">Configura Tunnel ngrok</button>
                                <button id="remoteNgrokToggleBtn" class="btn-small" data-action="remoteNgrokToggle" disabled>Attiva Tunnel</button>
                            </div>
                            <div id="remoteNgrokTokenArea" class="remote-ngrok-token hidden">
                                <input type="text" id="remoteNgrokTokenInput" placeholder="Incolla qui il tuo authtoken ngrok">
                                <button class="btn-small" data-action="remoteNgrokSaveToken">Salva token</button>
                            </div>
                        </div>
                    </div>`);
                pollNgrokStatusWhileOpen();
            }
            return result;
        };
    }
})();
