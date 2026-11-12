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

        // Grandezza del numero di danno (rem): cresce con la radice dei danni, così 1 resta piccolo e i colpi forti spiccano
        function fxDamageSize(amount, critico) {
            const size = Math.min(3.6, 0.8 + 0.7 * Math.sqrt(Math.max(1, amount)));
            return Math.round(size * (critico ? 1.25 : 1) * 100) / 100;
        }

        // amount: danni inflitti, per dare al numero la sua grandezza (fxDamageSize)
        function fxFloatOn(el, text, kind, delay = 0, amount = 0) {
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
            if (amount > 0) float.style.fontSize = `${fxDamageSize(amount, kind === 'crit')}rem`;
            fxLayer.appendChild(float);
            setTimeout(() => float.remove(), 1200 + delay);
        }

        // critico = scossone più forte e lampo dorato (.fx-hit-crit in css/style.css)
        function fxHit(el, critico) {
            if (!el || !animationsEnabled()) return;
            el.classList.remove('fx-hit', 'fx-hit-crit');
            void el.offsetWidth;
            el.classList.add('fx-hit');
            if (critico) el.classList.add('fx-hit-crit');
            setTimeout(() => el.classList.remove('fx-hit', 'fx-hit-crit'), critico ? 650 : 450);
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

        // Cura: scintille verdi che salgono dalla carta (di più con una cura grande)
        function fxHealMotes(card, amount) {
            if (!card || !animationsEnabled()) return;
            const box = document.createElement('span');
            box.className = 'fx-heal-motes';
            const n = Math.min(4 + amount * 2, 12);
            box.innerHTML = Array.from({ length: n }, () =>
                `<i style="left:${Math.round(8 + Math.random() * 84)}%; --d:${(Math.random() * 0.35).toFixed(2)}s; --h:${Math.round(45 + Math.random() * 55)}px"></i>`).join('');
            card.appendChild(box);
            setTimeout(() => box.remove(), 1400);
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
                else if (dHp > 0) { fxCardFlash(card, 'healed'); fxHealMotes(card, dHp); }
                if (dArmor < 0) synthSfx('armor');
                if (dHp < 0) setTimeout(() => synthSfx('hit'), dArmor < 0 ? 180 : 0);
                if (dArmor < 0) fxFloatOn(card, `${dArmor} Armatura`, 'armor');
                if (dArmor > 0) fxFloatOn(card, `+${dArmor} Armatura`, 'armor');
                if (dHp < 0) fxFloatOn(card, `${dHp}`, 'dmg', dArmor !== 0 ? 180 : 0, -dHp);
                if (dHp > 0) fxFloatOn(card, `+${dHp}`, 'heal');
                if (dArmor < 0 && dHp === 0 && fxParryArmed) fxParry(card);
                if (prev.hp > 0 && hero.hp <= 0) fxHeroFell(card);
            });
            fxParryArmed = false;
            fxResumeFalls();
        }

        // Parata: l'armatura ha assorbito tutto il colpo (evento "armor_full" del motore). Il segnale si accende
        // prima di aggiornare le carte, così un'armatura spezzata da una fase non sembra una parata
        let fxParryArmed = false;
        function fxArmParry(events) {
            fxParryArmed = (events || []).some(ev => ev.type === 'armor_full');
        }
        function fxParry(card) {
            synthSfx('parry');
            fxFloatOn(card, 'Parato!', 'parry', 120);
            if (!animationsEnabled() || !card) return;
            const rect = card.getBoundingClientRect();
            const spark = document.createElement('div');
            spark.className = 'fx-parry';
            spark.style.left = `${rect.left + rect.width / 2}px`;
            spark.style.top = `${rect.top + Math.min(rect.height * 0.35, 60)}px`;
            const rays = Array.from({ length: 10 }, (_, i) => `<i style="--a:${i * 36 + Math.random() * 16}deg; --d:${34 + Math.random() * 30}px"></i>`).join('');
            spark.innerHTML = `<span class="fx-parry-shield">${svgIcon('shield')}</span>${rays}`;
            fxLayer.appendChild(spark);
            speedUpAnimations(spark);
            setTimeout(() => spark.remove(), animTime(750));
        }

        // Un compagno è caduto: gli altri sobbalzano uno dopo l'altro
        function fxAlliesShock(fallen) {
            if (!animationsEnabled()) return;
            let i = 0;
            document.querySelectorAll('.hero-mini-card:not(.dead)').forEach(card => {
                if (card === fallen) return;
                const delay = 180 + i++ * 70;
                fxFloatOn(card, '!', 'shock', delay);
                card.animate([
                    { translate: '0 0' }, { translate: '0 -9px', offset: 0.18 }, { translate: '-4px 2px', offset: 0.4 },
                    { translate: '3px 0', offset: 0.6 }, { translate: '-1px 0', offset: 0.8 }, { translate: '0 0' }
                ], { duration: animTime(560), delay: animTime(delay), easing: 'ease-out' });
            });
        }

        // Eroe caduto: la carta si spegne piano nel grigio (al posto del grigio di colpo di .dead), "Caduto" e un rintocco.
        // La carta si ridisegna spesso (updatePartyStatusBars): l'animazione riprende dal punto in cui era (fxFallen)
        const FX_FALL_MS = 1400;
        const fxFallen = new Map();   // nome dell'eroe -> momento della caduta
        function fxHeroFell(card) {
            if (!card) return;
            setTimeout(() => synthSfx('fall'), 250);
            fxFloatOn(card, 'Caduto', 'fell', 300);
            fxAlliesShock(card);
            if (!animationsEnabled()) return;
            fxFallen.set(card.dataset.hero, performance.now());
        }
        function fxResumeFalls() {
            const now = performance.now();
            fxFallen.forEach((at, name) => {
                const passed = (now - at) * (gameOptions.fastAnimations ? 2 : 1);
                if (passed >= FX_FALL_MS) { fxFallen.delete(name); return; }
                const card = document.querySelector(`.hero-mini-card[data-hero="${CSS.escape(name)}"]`);
                if (!card || !card.classList.contains('dead')) return;
                card.style.animationDelay = `-${Math.round(passed)}ms`;
                card.classList.add('fx-fall');
                speedUpAnimations(card);
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
                fxHit(box, fxNextEnemyHitCritical);
                // Alla morte "sfxDeath" (o, se manca, "sfxHit"); altrimenti "sfxHit"; senza file il suono generato
                const dead = stato.activeEnemy.hp <= 0;
                if (!(dead && playEnemySfx('sfxDeath')) && !playEnemySfx('sfxHit')) synthSfx('enemy');
                fxFloatOn(box, `${dHp}`, fxNextEnemyHitCritical ? 'crit' : 'dmg', 0, -dHp);
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
                    const p = Math.max(0, Math.min(1, (Date.now() - start) / duration));
                    setCoinText(Math.round(from + (to - from) * p));
                    if (p >= 1) {
                        clearInterval(coinTickInterval);
                        if (onDone) onDone();
                    }
                }, 30);
            }, delay);
        }

        // alCentro: le monete arrivano al centro della destinazione (il mercante) invece che sul contatore
        function spawnFlyingCoins(srcEl, dstEl, count, delay, alCentro) {
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
                    coin.style.left = `${alCentro ? d.left + d.width / 2 + (Math.random() * 50 - 25) : d.left + 20}px`;
                    coin.style.top = `${d.top + d.height / 2 + (alCentro ? Math.random() * 40 - 20 : 0)}px`;
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
                // Le monete spese volano dal contatore al mercante
                const mercante = document.getElementById('merchantImg');
                if (mercante && mercante.offsetParent !== null) spawnFlyingCoins(wrap, mercante, Math.min(-diff, 8), 0, true);
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

        // Un oggetto assegnato (bottino, tesoro, mercante) vola dalla sua carta allo zaino dell'eroe che lo riceve.
        // Si cerca l'icona della carta ancora a schermo: prima quella scelta, poi una con la stessa immagine.
        function fxItemToHero(item, hero) {
            if (!item || !hero || !animationsEnabled() || typeof itemImageSrc !== 'function') return 0;
            const src = itemImageSrc(item);
            const card = heroCardEl(hero);
            if (!src || !card) return 0;
            const imgs = [...document.querySelectorAll('#gameContainer .armory-btn img')].filter(i => i.offsetParent !== null && i.getAttribute('src') === src);
            const img = imgs.find(i => i.closest('.selected')) || imgs[0];
            return img ? flyIconToCounter(img, card.querySelector('.hero-inventory') || card) : 0;
        }

        function showOutcomeOverlay(kind, data) {
            const isRelic = kind === 'relic';
            const overlay = document.createElement('div');
            overlay.className = `outcome-overlay ${isRelic ? '' : 'curse'}`;
            overlay.innerHTML = `
                <div class="outcome-card">
                    <div class="${isRelic ? 'outcome-sparkles' : 'outcome-smoke'}"></div>
                    <div class="outcome-icon"><img src="${isRelic ? 'immagini/icone/BTNEnchantedGemstone.png' : 'immagini/icone/BTNOrbOfCorruption.png'}" alt=""></div>
                    ${isRelic ? '<div class="nastro-sigillo" aria-hidden="true"></div>' : ''}
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

        /* ---------- Scena dello scontro: schivata, colpo finale, boss, fasi, stati ---------- */
        const FX_DEATH_MS = { normale: 480, elite: 950, boss: 2000 };
        let fxKillZooms = [];

        function fxStageTier(stage) {
            if (stage.classList.contains('is-boss')) return 'boss';
            return stage.classList.contains('is-elite') ? 'elite' : 'normale';
        }

        function fxStageMedia() {
            return [...document.querySelectorAll('#combatImg, #combatVideo')];
        }

        // Scontro nuovo: la scena torna pulita (esplosioni, zoom del colpo finale, musica)
        function fxResetStage() {
            document.querySelectorAll('.stage-boom').forEach(n => n.remove());
            fxKillZooms.forEach(a => a.cancel());
            fxKillZooms = [];
            resetCombatTension();
        }

        // Colpo a vuoto: il nemico si scansa di lato, con un soffio d'aria
        function fxEnemyDodge() {
            synthSfx('whoosh');
            if (!animationsEnabled()) return;
            const side = Math.random() < 0.5 ? -1 : 1;
            fxStageMedia().forEach(el => {
                el.style.setProperty('--dodge', `${side * 2.8}%`);
                el.classList.remove('fx-dodge');
                void el.offsetWidth;
                el.classList.add('fx-dodge');
                speedUpAnimations(el);
                setTimeout(() => el.classList.remove('fx-dodge'), animTime(560));
            });
        }

        // Rallenta per "ms" tutte le animazioni in corso (CSS, Web Animations e GSAP), poi le riporta alla loro velocità
        function fxSlowMotion(ms, rate = 0.3) {
            const running = document.getAnimations().filter(a => a.playState === 'running');
            running.forEach(a => { a.playbackRate *= rate; });
            if (window.gsap) window.gsap.globalTimeline.timeScale(rate);
            setTimeout(() => {
                running.forEach(a => { a.playbackRate /= rate; });
                if (window.gsap) window.gsap.globalTimeline.timeScale(1);
            }, ms);
        }

        // Esplosione sulla scena (x e y in %): anello di fuoco, scintille e tonfo
        function fxBurst(stage, x, y, grande) {
            const boom = document.createElement('div');
            boom.className = `stage-boom ${grande ? 'big' : ''}`;
            boom.style.left = `${x}%`;
            boom.style.top = `${y}%`;
            boom.innerHTML = Array.from({ length: 12 }, (_, i) => `<i style="--a:${i * 30 + Math.random() * 18}deg; --d:${(grande ? 120 : 70) + Math.random() * 70}px"></i>`).join('');
            stage.appendChild(boom);
            speedUpAnimations(boom);
            setTimeout(() => boom.remove(), animTime(800));
            synthSfx('boom');
            stage.classList.remove('stage-quake');
            void stage.offsetWidth;
            stage.classList.add('stage-quake');
            speedUpAnimations(stage);
            setTimeout(() => stage.classList.remove('stage-quake'), animTime(420));
        }

        // Colpo finale: rallentatore e zoom sul nemico; poi "done" fa partire il rogo della scena.
        // Elite con un'esplosione, boss con tre e un lampo bianco. "Depreda" resta nascosto fino alla fine.
        function fxEnemyDeath(stage, done) {
            if (!stage || !animationsEnabled()) { done(); return; }
            const enemy = stato.activeEnemy;
            const tier = fxStageTier(stage);
            const lootBtn = document.getElementById('combatLootBtn');
            lootBtn.classList.add('btn-wait');
            const total = animTime(FX_DEATH_MS[tier]);
            // Al fotogramma dopo: anche il numero del danno, che nasce subito dopo questa chiamata, rallenta
            requestAnimationFrame(() => fxSlowMotion(Math.min(total, animTime(900))));
            fxStageMedia().forEach(el => {
                const from = parseFloat(getComputedStyle(el).scale) || 1;
                const zoom = el.animate([{ scale: from }, { scale: from * 1.22 }], { duration: total, easing: 'cubic-bezier(.15, .8, .3, 1)', fill: 'forwards' });
                fxKillZooms.push(zoom);
            });
            if (tier === 'elite') setTimeout(() => fxBurst(stage, 50, 42, true), animTime(320));
            if (tier === 'boss') {
                setTimeout(() => fxBurst(stage, 34, 34, false), animTime(320));
                setTimeout(() => fxBurst(stage, 66, 50, false), animTime(800));
                setTimeout(() => {
                    fxBurst(stage, 50, 42, true);
                    const flash = document.createElement('div');
                    flash.className = 'fx-white-flash';
                    document.body.appendChild(flash);
                    speedUpAnimations(flash);
                    setTimeout(() => flash.remove(), animTime(700));
                }, animTime(1350));
            }
            setTimeout(() => {
                lootBtn.classList.remove('btn-wait');
                // Bottino già aperto (dal telefono) o scontro cambiato: niente rogo fuori tempo
                if (stato.activeEnemy === enemy && currentScreenId === 'screenCombat') done();
            }, total);
        }

        // Presentazione di boss ed elite: nome grande e barra della vita che si riempie. Non ferma il gioco.
        function fxBossIntro(enemy) {
            const stage = document.querySelector('#screenCombat .combat-stage');
            if (!stage || !enemy || !animationsEnabled()) return;
            const tier = fxStageTier(stage);
            if (tier === 'normale') return;
            setTimeout(() => {
                if (stato.activeEnemy !== enemy || currentScreenId !== 'screenCombat') return;
                const intro = document.createElement('div');
                intro.className = `boss-intro ${tier}`;
                intro.setAttribute('aria-hidden', 'true');
                intro.innerHTML = `
                    <div class="boss-intro-kind">${tier === 'boss' ? 'Scontro Finale' : 'Elite'}</div>
                    <div class="boss-intro-name">${esc(enemy.name)}</div>
                    <div class="boss-intro-bar"><i></i></div>
                    <div class="boss-intro-hp">${enemy.maxHp} HP</div>`;
                document.body.appendChild(intro);
                speedUpAnimations(intro);
                synthSfx('drum');
                setTimeout(() => synthSfx('drum'), animTime(420));
                if (tier === 'boss') setTimeout(() => synthSfx('roar'), animTime(900));
                setTimeout(() => intro.remove(), animTime(2500));
            }, animTime(750));
        }

        // Cambio di fase del nemico: boato e musica più tesa sempre; lampo rosso e scossa con le animazioni
        function fxPhaseShift() {
            if (!playEnemySfx('sfxAttack')) synthSfx('roar');
            raiseCombatTension();
            if (!animationsEnabled()) return;
            const flash = document.createElement('div');
            flash.className = 'fx-red-flash';
            document.body.appendChild(flash);
            speedUpAnimations(flash);
            setTimeout(() => flash.remove(), animTime(900));
            const stage = document.querySelector('#screenCombat .combat-stage');
            if (!stage) return;
            stage.classList.remove('stage-quake');
            void stage.offsetWidth;
            stage.classList.add('stage-quake');
            setTimeout(() => stage.classList.remove('stage-quake'), animTime(420));
        }

        // Aure degli stati: stelline che girano (stordito), bolle (avvelenato), raggi (benedizioni e potenziamenti).
        // Le carte si ridisegnano spesso: --aura-t tiene l'animazione al punto giusto invece di farla ripartire.
        const AURA_PARTI = { stordito: 3, avvelenato: 5, benedetto: 1 };
        function auraHtml(keys) {
            return keys.filter(k => AURA_PARTI[k]).map(k => `<span class="aura aura-${k}">${'<i></i>'.repeat(AURA_PARTI[k])}</span>`).join('');
        }
        function heroAuraHtml(h) {
            if (!h || h.hp <= 0) return '';
            const keys = heroStatuses(h).map(s => s.key);
            if ((h.blessings || []).length || (h.tempBuffs || []).some(b => b.val > 0)) keys.push('benedetto');
            const html = auraHtml(keys);
            return html ? `<div class="hero-aura" style="--aura-t:-${Math.round(performance.now() % 6000)}ms" aria-hidden="true">${html}</div>` : '';
        }
        function fxSyncEnemyAura(enemy) {
            const box = document.getElementById('enemyAura');
            if (!box) return;
            const key = enemyStatuses(enemy).map(s => s.key).join(',');
            if (box.dataset.key === key) return;
            box.dataset.key = key;
            box.innerHTML = auraHtml(key ? key.split(',') : []);
        }

        /* ---------- Impronte della compagnia sulla mappa ---------- */
        function campaignTerrain() {
            return (stato.currentCampaign && stato.currentCampaign.terreno) || 'terra';
        }
        // Passi lungo il tratto percorso dal segnalino, sfalsati a destra e sinistra, con il suono del terreno
        function fxFootprints(container, from, to, duration) {
            const dx = to.x - from.x, dy = to.y - from.y;
            const dist = Math.hypot(dx, dy);
            if (!dist) return;
            const count = Math.max(3, Math.min(14, Math.round(dist / 30)));
            const terrain = campaignTerrain();
            const angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
            const nx = -dy / dist, ny = dx / dist;
            for (let i = 0; i < count; i++) {
                setTimeout(() => {
                    const p = (i + 1) / (count + 1);
                    const side = i % 2 ? 5 : -5;
                    const print = document.createElement('i');
                    print.className = `map-footprint t-${terrain}`;
                    print.style.left = `${from.x + dx * p + nx * side}px`;
                    print.style.top = `${from.y + dy * p + ny * side}px`;
                    print.style.rotate = `${angle}deg`;
                    container.appendChild(print);
                    setTimeout(() => print.remove(), 2400);
                    synthSfx(`step-${terrain}`);
                }, duration * i / count);
            }
        }

        /* ---------- Rarità: la carta coperta trema prima di girarsi, poi raggi del suo colore ---------- */
        const CARD_TREMBLE_MS = { non_comune: 160, raro: 420, epico: 750, leggendario: 1100 };
        function fxRevealRays(rect, rarity) {
            if (!['raro', 'epico', 'leggendario'].includes(rarity) || !animationsEnabled()) return;
            const rays = document.createElement('div');
            rays.className = `reveal-rays rar-card-${rarity} size-${rarity}`;
            rays.style.left = `${rect.left + rect.width / 2}px`;
            rays.style.top = `${rect.top + rect.height / 2}px`;
            fxLayer.appendChild(rays);
            speedUpAnimations(rays);
            setTimeout(() => rays.remove(), animTime(1500));
        }

        /* ---------- Fine partita: i ritratti entrano uno a uno, i caduti si spengono, i numeri si contano ----------
           Lo stendardo che cade (sconfitta) e l'immagine che si accende (vittoria) sono solo CSS, su .screen-enter. */
        function fxFinePartita(box, esito) {
            if (!box || !animationsEnabled()) return;
            box.querySelectorAll('.run-summary-hero').forEach((el, i) => {
                el.style.setProperty('--i', i);
                el.classList.add('fine-entra', el.classList.contains('dead') ? 'fine-spegne' : 'fine-gloria');
            });
            box.classList.add(`fine-${esito}`);
            speedUpAnimations(box);
            // Numeri interi delle statistiche: si contano da zero (quelli "3 / 5" restano come sono)
            box.querySelectorAll('.journal-stat b').forEach((b, i) => {
                const n = /^\d+$/.test(b.textContent.trim()) ? Number(b.textContent) : 0;
                if (n < 2) return;
                b.textContent = '0';
                setTimeout(() => countText(b, 0, n, null, animTime(700 + Math.min(n, 30) * 20)), animTime(500 + i * 90));
                setTimeout(() => { b.textContent = n; }, animTime(500 + i * 90 + 700 + Math.min(n, 30) * 20) + 400);  // comunque il valore vero
            });
        }

        /* ---------- Falò del riposo: scintille che salgono ---------- */
        (function spawnRestSparks() {
            const box = document.getElementById('restSparks');
            for (let i = 0; i < 16; i++) {
                const spark = document.createElement('i');
                spark.style.left = `${30 + Math.random() * 40}%`;
                spark.style.animationDuration = `${1.8 + Math.random() * 2.2}s`;
                spark.style.animationDelay = `${-Math.random() * 4}s`;
                spark.style.setProperty('--drift', `${Math.random() * 90 - 45}px`);
                box.appendChild(spark);
            }
        })();

        /* ---------- Braci di sfondo ---------- */
        (function spawnEmbers() {
            // Poche e lente: se si notano sono troppe. BRACI braci che salgono, POLVERE granelli chiari che vagano
            const box = document.getElementById('embers');
            const BRACI = 9, POLVERE = 12;
            for (let i = 0; i < BRACI; i++) {
                const ember = document.createElement('span');
                const size = 1.5 + Math.random() * 2;
                ember.style.left = `${Math.random() * 100}%`;
                ember.style.width = ember.style.height = `${size}px`;
                ember.style.animationDuration = `${18 + Math.random() * 16}s`;
                ember.style.animationDelay = `${-Math.random() * 34}s`;
                ember.style.setProperty('--drift', `${Math.random() * 140 - 70}px`);
                box.appendChild(ember);
            }
            for (let i = 0; i < POLVERE; i++) {
                const granello = document.createElement('i');
                const size = 1 + Math.random() * 1.6;
                granello.style.left = `${Math.random() * 100}%`;
                granello.style.top = `${Math.random() * 100}%`;
                granello.style.width = granello.style.height = `${size}px`;
                granello.style.animationDuration = `${34 + Math.random() * 30}s`;
                granello.style.animationDelay = `${-Math.random() * 60}s`;
                granello.style.setProperty('--dx', `${Math.round(Math.random() * 160 - 80)}px`);
                granello.style.setProperty('--dy', `${Math.round(Math.random() * 90 - 60)}px`);
                box.appendChild(granello);
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
