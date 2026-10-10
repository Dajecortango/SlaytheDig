/* ==========================================================================
   EFFETTI A SCHERMO
   Numeri fluttuanti e colpi, testo a macchina da scrivere, monete che volano verso
   il contatore, oggetti rivelati come carte, reliquia ottenuta / maledizione subita,
   braci e pioggia dei menu.
   Diviso da js/game.js: stesso ambito globale, caricato dopo js/interfaccia.js.
   ========================================================================== */

        /* ---------- Numeri fluttuanti e colpi ---------- */
        const fxLayer = document.createElement('div');
        fxLayer.className = 'fx-layer';
        document.body.appendChild(fxLayer);

        const fxHeroSeen = new WeakMap();   // eroe -> { hp, armor } dell'ultimo aggiornamento
        const fxEnemySeen = new WeakMap();  // nemico -> { hp, stunned }
        let fxNextEnemyHitCritical = false;

        // Scritte ravvicinate sullo stesso bersaglio vengono impilate per non sovrapporsi
        const fxStacks = new Map();

        function fxFloatOn(el, text, kind, delay = 0) {
            if (!gameOptions.floatingNumbers || !el || el.offsetParent === null) return;
            const rect = el.getBoundingClientRect();
            const key = el.id || el.dataset.hero || 'fx';
            const now = performance.now();
            const stack = fxStacks.get(key);
            const slot = stack && now - stack.time < 500 ? stack.slot + 1 : 0;
            fxStacks.set(key, { time: now, slot });

            const float = document.createElement('div');
            float.className = `fx-float ${kind}`;
            float.textContent = text;
            float.style.left = `${rect.left + rect.width / 2 + (Math.random() * 16 - 8)}px`;
            float.style.top = `${rect.top + Math.min(rect.height * 0.25, 40) - slot * 30}px`;
            float.style.animationDelay = `${delay}ms`;
            fxLayer.appendChild(float);
            setTimeout(() => float.remove(), 1200 + delay);
        }

        function fxHit(el) {
            if (!el || !animationsEnabled()) return;
            el.classList.remove('fx-hit');
            void el.offsetWidth;
            el.classList.add('fx-hit');
            setTimeout(() => el.classList.remove('fx-hit'), 450);
        }

        // Lampo sulla carta dell'eroe: rosso quando perde vita, verde quando la recupera.
        // Uno strato a parte (la carta ha già le sue animazioni di turno su box-shadow).
        function fxCardFlash(card, kind) {
            if (!card || !animationsEnabled()) return;
            const flash = document.createElement('span');
            flash.className = `fx-card-flash ${kind}`;
            card.appendChild(flash);
            setTimeout(() => flash.remove(), 900);
        }

        function heroCardEl(hero) {
            return document.querySelector(`.hero-mini-card[data-hero="${CSS.escape(hero.name)}"]`);
        }

        function fxFloatOnHero(hero, text, kind) {
            fxFloatOn(heroCardEl(hero), text, kind);
        }

        // Confronta HP e armatura degli eroi con l'aggiornamento precedente e mostra le variazioni
        function fxDiffHeroes() {
            stato.party.forEach(hero => {
                const prev = fxHeroSeen.get(hero);
                fxHeroSeen.set(hero, { hp: hero.hp, armor: hero.current_armor });
                if (!prev) return;
                const card = heroCardEl(hero);
                const dHp = hero.hp - prev.hp;
                const dArmor = hero.current_armor - prev.armor;
                if (dHp < 0 || dArmor < 0) fxHit(card);
                if (dHp < 0) fxCardFlash(card, 'hurt');
                else if (dHp > 0) fxCardFlash(card, 'healed');
                if (dArmor < 0) synthSfx('armor');
                if (dHp < 0) setTimeout(() => synthSfx('hit'), dArmor < 0 ? 180 : 0);
                if (dArmor < 0) fxFloatOn(card, `${dArmor} Armatura`, 'armor');
                if (dArmor > 0) fxFloatOn(card, `+${dArmor} Armatura`, 'armor');
                if (dHp < 0) fxFloatOn(card, `${dHp}`, 'dmg', dArmor !== 0 ? 180 : 0);
                if (dHp > 0) fxFloatOn(card, `+${dHp}`, 'heal');
            });
        }

        // Registra lo stato attuale senza animazioni (es. armature ripristinate a inizio scontro)
        function fxResyncHeroes() {
            stato.party.forEach(hero => fxHeroSeen.set(hero, { hp: hero.hp, armor: hero.current_armor }));
        }

        function fxDiffEnemy() {
            if (!stato.activeEnemy) return;
            const prev = fxEnemySeen.get(stato.activeEnemy);
            fxEnemySeen.set(stato.activeEnemy, { hp: stato.activeEnemy.hp, stunned: stato.activeEnemy.isStunned });
            const box = document.getElementById('enemyInfo');
            if (stato.activeEnemy.hp > 0) {
                box.classList.remove('defeated');
                const stage = box.closest('.combat-stage');
                if (stage) stage.classList.remove('enemy-slain');
            }
            if (!prev) return;
            if (stato.activeEnemy.hp <= 0 && prev.hp > 0) onEnemyDefeated(box);
            const dHp = stato.activeEnemy.hp - prev.hp;
            if (dHp < 0) {
                fxHit(box);
                // Alla morte "sfxDeath" (o, se manca, "sfxHit"); altrimenti "sfxHit"; senza file il suono generato
                const dead = stato.activeEnemy.hp <= 0;
                if (!(dead && playEnemySfx('sfxDeath')) && !playEnemySfx('sfxHit')) synthSfx('enemy');
                fxFloatOn(box, `${dHp}`, fxNextEnemyHitCritical ? 'crit' : 'dmg');
            }
            if (stato.activeEnemy.isStunned && !prev.stunned) fxFloatOn(box, 'Stordito', 'stun', 200);
            fxNextEnemyHitCritical = false;
        }

        /* ---------- Testo narrativo a macchina da scrivere ---------- */
        const TYPE_MIN_LENGTH = 40;
        const typingState = new WeakMap();

        function stopTypewriter(box, reveal) {
            const state = typingState.get(box);
            if (!state) return;
            cancelAnimationFrame(state.raf);
            if (reveal) state.parts.forEach(p => { p.node.data = p.text; });
            box.classList.remove('typing');
            box.removeAttribute('title');
            typingState.delete(box);
            updateDescOverflow(box);
        }

        function startTypewriter(box) {
            stopTypewriter(box, false);
            delete box.dataset.typePending;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || gameOptions.textSpeed <= 0) return;

            const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
            const parts = [];
            while (walker.nextNode()) parts.push({ node: walker.currentNode, text: walker.currentNode.data });
            const total = parts.reduce((sum, p) => sum + p.text.length, 0);
            if (total < TYPE_MIN_LENGTH) return;

            parts.forEach(p => { p.node.data = ''; });
            box.classList.add('typing');
            box.title = 'Clicca per mostrare tutto il testo';
            const state = { parts, raf: null, index: 0 };
            typingState.set(box, state);

            const step = () => {
                let budget = gameOptions.textSpeed * (gameOptions.fastAnimations ? 2 : 1);
                while (budget > 0 && state.index < parts.length) {
                    const p = parts[state.index];
                    const shown = p.node.data.length;
                    const take = Math.min(budget, p.text.length - shown);
                    p.node.data = p.text.slice(0, shown + take);
                    budget -= take;
                    if (p.node.data.length >= p.text.length) state.index++;
                }
                // Testo più lungo del riquadro: si segue la riga che si sta scrivendo
                if (!box.classList.contains('is-open') && box.scrollHeight > box.clientHeight) box.scrollTop = box.scrollHeight;
                if (state.index < parts.length) state.raf = requestAnimationFrame(step);
                else stopTypewriter(box, true);
            };
            state.raf = requestAnimationFrame(step);
        }

        // Ogni volta che il gioco scrive un nuovo testo nel riquadro, parte l'effetto
        const typeObserver = new MutationObserver(mutations => {
            const boxes = new Set(mutations.map(m => m.target));
            boxes.forEach(box => {
                // Testo nuovo: il riquadro torna chiuso e dall'inizio
                box.classList.remove('is-open');
                box.scrollTop = 0;
                if (box.offsetParent === null) {
                    stopTypewriter(box, false);
                    box.dataset.typePending = '1';
                } else {
                    startTypewriter(box);
                }
            });
        });
        document.querySelectorAll('.narrative-desc-box').forEach(box => typeObserver.observe(box, { childList: true }));

        /* ---------- Dadi d'osso con i punti ----------
           Il gioco scrive il valore come testo nella .dice-box (e lo rilegge da lì): qui lo si copia in
           data-face, che il CSS disegna come punti incisi. Quando il dado smette di rotolare prende
           la classe "landed" (rimbalzo; bagliore d'oro sul 6 e rosso sull'1). */
        const diceRolling = new WeakMap();
        // Cambia le classi solo se serve: anche un add/remove senza effetto riscrive l'attributo
        // e farebbe ripartire l'osservatore all'infinito
        function syncDiceFace(box) {
            const face = box.textContent.trim();
            if (box.dataset.face !== face) box.dataset.face = face;
            const rolling = box.classList.contains('rolling');
            const landed = box.classList.contains('landed');
            if (rolling && landed) box.classList.remove('landed');
            else if (!rolling && !landed && diceRolling.get(box)) box.classList.add('landed');
            diceRolling.set(box, rolling);
        }
        const diceObserver = new MutationObserver(mutations => {
            new Set(mutations.map(m => m.target.nodeType === 1 ? m.target.closest('.dice-box') : m.target.parentElement))
                .forEach(box => box && syncDiceFace(box));
        });
        document.querySelectorAll('.dice-box').forEach(box => {
            syncDiceFace(box);
            diceObserver.observe(box, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        });

        /* ---------- Testi lunghi: sfumatura e "Leggi tutto" ----------
           Sotto ogni riquadro narrativo c'è una linguetta (.desc-more), visibile solo se il testo non ci sta:
           la sfumatura dice che il testo continua finché non si arriva in fondo, il pulsante apre il riquadro
           per intero (classe is-open) e lo richiude. Sta fuori dal riquadro, che il gioco riscrive con innerHTML. */
        function updateDescOverflow(box) {
            const more = box.nextElementSibling;
            if (!more || !more.classList.contains('desc-more')) return;
            const open = box.classList.contains('is-open');
            const overflows = box.scrollHeight > box.clientHeight + 4;
            const atEnd = box.scrollTop + box.clientHeight >= box.scrollHeight - 4;
            more.classList.toggle('hidden', !open && !overflows);
            more.classList.toggle('faded', !open && overflows && !atEnd);
            more.classList.toggle('open', open);
            more.querySelector('.desc-more-label').textContent = open ? 'Riduci' : 'Leggi tutto';
        }

        function toggleDescBox(btn) {
            const box = btn.closest('.desc-more').previousElementSibling;
            stopTypewriter(box, true);
            box.classList.toggle('is-open');
            box.scrollTop = 0;
            updateDescOverflow(box);
        }

        const descResize = new ResizeObserver(entries => entries.forEach(e => updateDescOverflow(e.target)));
        document.querySelectorAll('.narrative-desc-box').forEach(box => {
            box.insertAdjacentHTML('afterend', `<div class="desc-more hidden"><button type="button" class="desc-more-btn" ${azione('toggleDescBox', '$el')}><span class="desc-more-label">Leggi tutto</span></button></div>`);
            box.addEventListener('scroll', () => updateDescOverflow(box), { passive: true });
            descResize.observe(box);
        });

        // Testi scritti mentre la schermata era nascosta: partono quando diventa visibile
        function startPendingTypewriters(screen) {
            screen.querySelectorAll('.narrative-desc-box[data-type-pending]').forEach(startTypewriter);
        }

        document.addEventListener('click', e => {
            const box = e.target.closest('.narrative-desc-box.typing');
            if (box) stopTypewriter(box, true);
        });

        /* ---------- 12. Monete che volano verso il contatore ---------- */
        let displayedCoins = 0;
        let coinFlightDelay = 0;
        let coinTickTimeout = null;
        const COIN_FLY_SCREENS = ['screenLoot', 'screenTreasureLoot', 'screenCombat', 'screenChallenge', 'screenRest'];

        function setCoinText(value) {
            document.getElementById('topBarCoins').textContent = value;
        }

        function coinSourceElement() {
            const sources = { screenLoot: 'lootCoinsText', screenTreasureLoot: 'treasureCoinsText', screenCombat: 'enemyInfo' };
            return document.getElementById(sources[currentScreenId] || 'gameContainer');
        }

        let coinTickInterval = null;

        // Timer invece di requestAnimationFrame: il valore finale arriva anche con la scheda in background
        function tickCoinCounter(from, to, delay, duration, onDone) {
            clearTimeout(coinTickTimeout);
            clearInterval(coinTickInterval);
            coinTickTimeout = setTimeout(() => {
                const start = Date.now();
                coinTickInterval = setInterval(() => {
                    const p = Math.min(1, (Date.now() - start) / duration);
                    setCoinText(Math.round(from + (to - from) * p));
                    if (p >= 1) {
                        clearInterval(coinTickInterval);
                        if (onDone) onDone();
                    }
                }, 30);
            }, delay);
        }

        function spawnFlyingCoins(srcEl, dstEl, count, delay) {
            const s = srcEl.getBoundingClientRect();
            const d = dstEl.getBoundingClientRect();
            for (let i = 0; i < count; i++) {
                const coin = document.createElement('div');
                coin.className = 'fly-coin';
                coin.innerHTML = '<span class="coin"></span>';
                coin.style.left = `${s.left + s.width / 2 + (Math.random() * 60 - 30)}px`;
                coin.style.top = `${s.top + s.height / 2 + (Math.random() * 40 - 20)}px`;
                coin.style.opacity = '0';
                document.body.appendChild(coin);
                setTimeout(() => {
                    coin.style.opacity = '1';
                    coin.style.left = `${d.left + 20}px`;
                    coin.style.top = `${d.top + d.height / 2}px`;
                }, delay + i * 70);
                setTimeout(() => { coin.style.opacity = '0'; }, delay + i * 70 + 720);
                setTimeout(() => coin.remove(), delay + i * 70 + 950);
            }
        }

        function animateCoinCounter(target) {
            const diff = target - displayedCoins;
            if (diff === 0) { setCoinText(target); return; }
            const from = displayedCoins;
            displayedCoins = target;
            const wrap = document.getElementById('topBarCoinsWrap');
            const gained = diff > 0 && COIN_FLY_SCREENS.includes(currentScreenId);
            const spent = diff < 0 && currentScreenId === 'screenMerchant';
            if (gained) stato.expeditionStats.coinsEarned += diff;

            if (!animationsEnabled() || (!gained && !spent)) { setCoinText(target); return; }

            if (gained) {
                spawnFlyingCoins(coinSourceElement(), wrap, Math.min(diff, 10), coinFlightDelay);
                tickCoinCounter(from, target, coinFlightDelay + 650, 500, () => {
                    wrap.classList.remove('coin-bump');
                    void wrap.offsetWidth;
                    wrap.classList.add('coin-bump');
                });
            } else {
                wrap.classList.add('coin-spend');
                tickCoinCounter(from, target, 0, 400, () => wrap.classList.remove('coin-spend'));
            }
        }

        /* ---------- 13. Oggetti rivelati come carte ---------- */
        function revealAsCard(el, delay) {
            if (!el || !animationsEnabled()) return;
            el.classList.remove('card-reveal');
            void el.offsetWidth;
            el.style.animationDelay = `${delay}ms`;
            el.classList.add('card-reveal');
            setTimeout(() => { el.classList.remove('card-reveal'); el.style.animationDelay = ''; }, delay + 700);
        }

        /* ---------- 14. Reliquia ottenuta / maledizione subita ---------- */
        // Copia volante di un'icona verso un contatore della barra in alto; restituisce la durata in ms
        function flyIconToCounter(img, counter) {
            if (!img || !counter || !animationsEnabled() || counter.offsetParent === null || !img.animate) return 0;
            const from = img.getBoundingClientRect();
            const target = (counter.querySelector('img') || counter).getBoundingClientRect();
            const ghost = img.cloneNode();
            ghost.className = 'fly-icon';
            Object.assign(ghost.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` });
            document.body.appendChild(ghost);
            const dx = target.left + target.width / 2 - (from.left + from.width / 2);
            const dy = target.top + target.height / 2 - (from.top + from.height / 2);
            const scale = Math.max(0.2, target.width / from.width);
            const duration = 750;
            // Traiettoria ad arco: sale un po' prima di puntare al contatore
            ghost.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 60}px) scale(${(1 + scale) / 2}) rotate(-12deg)`, opacity: 1, offset: 0.5 },
                { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.4 }
            ], { duration, easing: 'cubic-bezier(.45,.05,.55,.95)', fill: 'forwards' });
            setTimeout(() => ghost.remove(), duration + 50);
            return duration;
        }

        function showOutcomeOverlay(kind, data) {
            const isRelic = kind === 'relic';
            const overlay = document.createElement('div');
            overlay.className = `outcome-overlay ${isRelic ? '' : 'curse'}`;
            overlay.innerHTML = `
                <div class="outcome-card">
                    <div class="${isRelic ? 'outcome-sparkles' : 'outcome-smoke'}"></div>
                    <div class="outcome-icon"><img src="${isRelic ? 'immagini/icone/BTNEnchantedGemstone.png' : 'immagini/icone/BTNOrbOfCorruption.png'}" alt=""></div>
                    <div class="outcome-kind">${isRelic ? 'Reliquia ottenuta' : 'Maledizione subita'}</div>
                    <div class="outcome-name">${data.name}</div>
                    <div class="outcome-desc">${kw(data.desc || '')}</div>
                    <div class="outcome-hint">Clicca per continuare</div>
                </div>`;

            let closed = false;
            const close = () => {
                if (closed) return;
                closed = true;
                const counter = document.getElementById(isRelic ? 'topBarRelicsWrap' : 'topBarCursesWrap');
                const flash = () => {
                    counter.classList.remove('relic-flash');
                    void counter.offsetWidth;
                    counter.classList.add('relic-flash');
                    setTimeout(() => counter.classList.remove('relic-flash'), 1900);
                };
                // L'icona vola dalla finestra al contatore in alto; il contatore lampeggia all'arrivo
                const flight = flyIconToCounter(overlay.querySelector('.outcome-icon img'), counter);
                overlay.classList.add('closing');
                setTimeout(() => overlay.remove(), 300);
                setTimeout(flash, flight);
            };
            overlay.addEventListener('click', close);
            document.body.appendChild(overlay);
            setTimeout(close, 5000);
        }

        /* ---------- Braci di sfondo ---------- */
        (function spawnEmbers() {
            const box = document.getElementById('embers');
            for (let i = 0; i < 22; i++) {
                const ember = document.createElement('span');
                const size = 2 + Math.random() * 3;
                ember.style.left = `${Math.random() * 100}%`;
                ember.style.width = ember.style.height = `${size}px`;
                ember.style.animationDuration = `${9 + Math.random() * 9}s`;
                ember.style.animationDelay = `${-Math.random() * 18}s`;
                ember.style.setProperty('--drift', `${Math.random() * 140 - 70}px`);
                box.appendChild(ember);
            }
        })();

        /* ---------- Pioggia della scena dei menu ---------- */
        (function spawnRain() {
            const box = document.getElementById('menuRain');
            for (let i = 0; i < 90; i++) {
                const drop = document.createElement('span');
                drop.style.left = `${Math.random() * 110 - 5}%`;
                drop.style.height = `${40 + Math.random() * 50}px`;
                drop.style.opacity = (0.15 + Math.random() * 0.35).toFixed(2);
                drop.style.animationDuration = `${0.55 + Math.random() * 0.5}s`;
                drop.style.animationDelay = `${-Math.random() * 2}s`;
                box.appendChild(drop);
            }
        })();
