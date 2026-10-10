/* ==========================================================================
   INTERFACCIA "REIGN OF CHAOS"
   Parole chiave colorate, icone (SVG, oggetti, abilità), barre della vita con scia,
   carte degli eroi, finestra modale (openModal / closeModal, alert), tooltip, tasti rapidi
   e segnaposto per le immagini mancanti.
   Diviso da js/game.js: stesso ambito globale, caricato subito dopo di lui.
   ========================================================================== */

        /* ---------- 35. Parole chiave colorate nei testi ----------
           Solo su testo semplice (descrizioni di campagne, sfide, oggetti): prima si fa l'escape,
           poi le parole chiave diventano <span class="kw kw-..."> (colori in css/wc3-base.css). */
        const KEYWORD_CLASS = {
            forza: 'str', fede: 'fth', intelligenza: 'int', hp: 'hp', armatura: 'armor', danno: 'dmg', danni: 'dmg',
            moneta: 'coin', monete: 'coin', oro: 'coin', reliquia: 'relic', reliquie: 'relic',
            maledizione: 'curse', maledizioni: 'curse', aiuto: 'help', difesa: 'armor'
        };
        const KEYWORD_RE = new RegExp(`\\b(${Object.keys(KEYWORD_CLASS).join('|')})\\b`, 'gi');
        function kw(text) {
            return esc(text == null ? '' : String(text)).replace(KEYWORD_RE, w => `<span class="kw kw-${KEYWORD_CLASS[w.toLowerCase()]}">${w}</span>`);
        }

        /* =========================================================
           INTERFACCIA "REIGN OF CHAOS": icone, tooltip, modali, tasti
           ========================================================= */
        const ICONS = {
            sword: '<path d="M19.5 4.5L9 15M19.5 4.5V8M19.5 4.5H16M6.5 12.5l5 5M8.2 15.8L4.5 19.5"/>',
            axe: '<path d="M5 20L15.5 6.5"/><path d="M12.5 4.5c3.2-1.4 6.6.6 7.5 4-2.2 0-4.2 1-5.3 3.1-1.3-2.4-2.2-4.6-2.2-7.1z"/>',
            spear: '<path d="M4.5 19.5L16 8"/><path d="M16 8l1.2-4.2L21 2.9l-.9 3.8z"/><path d="M13.5 6.5l4 4"/>',
            shield: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M12 7v10M8.5 11h7"/>',
            armor: '<path d="M8 4l4 2 4-2 4 3-2 4v9H6v-9L4 7z"/><path d="M9 12h6M12 6v14"/>',
            book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/><path d="M12 6.5v5M9.8 8.5h4.4"/>',
            potion: '<path d="M10 3h4M10.5 3v5L6 16a3 3 0 0 0 2.6 5h6.8A3 3 0 0 0 18 16l-4.5-8V3"/><path d="M8 14h8"/>',
            amulet: '<path d="M6 3l6 7.5L18 3"/><circle cx="12" cy="15" r="5"/><circle cx="12" cy="15" r="1.6"/>',
            ring: '<circle cx="12" cy="14.5" r="6"/><path d="M9.5 6.5L12 3l2.5 3.5L12 8.5z"/>',
            bag: '<path d="M9 4h6l-1.5 3h-3z"/><path d="M10.5 7C6 9 4 13 4 16a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4c0-3-2-7-6.5-9"/>',
            pouch: '<path d="M9 4h6l-1.5 3h-3z"/><path d="M10.5 7C6 9 4 13 4 16a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4c0-3-2-7-6.5-9"/><path d="M14 11.5h-3a1.3 1.3 0 0 0 0 2.6h2a1.3 1.3 0 0 1 0 2.6h-3M12 10.5v1M12 16.7v1"/>',
            skull: '<path d="M12 3a7 7 0 0 0-7 7c0 2.5 1.3 4 2.5 5v3h9v-3c1.2-1 2.5-2.5 2.5-5a7 7 0 0 0-7-7z"/><circle cx="9.3" cy="10.5" r="1.6"/><circle cx="14.7" cy="10.5" r="1.6"/><path d="M10 18v2.5M12 18v2.5M14 18v2.5"/>',
            question: '<circle cx="12" cy="12" r="9"/><path d="M9.3 9.3a2.8 2.8 0 1 1 4.2 2.4c-.9.5-1.5 1.2-1.5 2.2v.6"/><path d="M12 17.4v.2"/>',
            chest: '<rect x="3" y="10" width="18" height="10" rx="1"/><path d="M3 10c0-4 3-6 9-6s9 2 9 6M3 13.5h18"/><rect x="10.5" y="12" width="3" height="4"/>',
            fire: '<path d="M12 3c1 3 4.5 4.6 4.5 8.5a4.5 4.5 0 0 1-9 0c0-2 1-3.4 2.2-4.4 0 2 .9 3.2 2 3.2 0-3-1.1-4.3.3-7.3z"/><path d="M4 21l16-3.5M4 17.5L20 21"/>',
            crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/><path d="M5 16h14"/>',
            drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
            star: '<path d="M12 2.5l2.6 6 6.4.6-4.9 4.2 1.5 6.3L12 16.3 6.4 19.6l1.5-6.3L3 9.1l6.4-.6z"/>',
            rune: '<path d="M12 2l8 5v10l-8 5-8-5V7z"/><path d="M12 7v10M9 9.5l6 5M15 9.5l-6 5"/>'
        };

        function svgIcon(name) {
            return `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.bag}</svg>`;
        }

        function itemIconName(item) {
            const key = `${item.id || ''} ${item.name}`.toLowerCase();
            if (/pozione|unguento|balsamo/.test(key)) return 'potion';
            if (/ascia/.test(key)) return 'axe';
            if (/pugnale|stocco|martello/.test(key)) return 'sword';
            if (/corazza/.test(key)) return 'armor';
            if (/balsamo/.test(key)) return 'potion';
            if (/alabarda/.test(key)) return 'spear';
            if (/spada/.test(key)) return 'sword';
            if (/scudo/.test(key)) return 'shield';
            if (/armatura|brigantina/.test(key)) return 'armor';
            if (/libro|tomo/.test(key)) return 'book';
            if (/amuleto|ankh|corona/.test(key)) return 'amulet';
            if (/anello/.test(key)) return 'ring';
            return 'bag';
        }

        // Rarità dell'oggetto; gli oggetti senza rarità contano come comuni
        // Rarità in stile World of Warcraft, dalla più bassa alla più alta (colori in css/wc3-base.css)
        function itemRarity(item) {
            return RARITY_LABELS[item && item.rarity] ? item.rarity : 'comune';
        }

        function itemCategory(item) {
            const icon = itemIconName(item);
            if (icon === 'potion') return 'consumable';
            if (['sword', 'axe', 'spear'].includes(icon)) return 'weapon';
            if (['shield', 'armor'].includes(icon)) return 'armor';
            return 'arcane';
        }

        // Icone raster in stile WC3 per tipo di oggetto; gli altri tipi usano l'icona SVG
        const ITEM_IMAGES = {
            axe: 'immagini/icone/BTNOrcMeleeUpOne.webp'
        };

        // Icone di oggetti non più nell'armeria, tenute per i vecchi salvataggi.
        // Le icone degli oggetti stanno nel campo "icon" di data/libreria/armeria.js (si caricano dall'editor).
        const ITEM_ICONS_LEGACY = {
            amuleto_viandante: 'immagini/icone/BTNNecklace.png',
            tomo_alchemico: 'immagini/icone/BTNSorceressMaster.png',
            corazza_nordica: 'immagini/icone/BTNLeatherUpgradeOne.png'
        };

        // Icona dell'oggetto: campo "icon" (anche per gli oggetti dei salvataggi vecchi, presa dall'armeria),
        // poi le icone tenute per i vecchi salvataggi, poi quella per tipo
        function itemImageSrc(item) {
            const fromLib = LIBRERIA.armeria && LIBRERIA.armeria[item.id];
            return item.icon || (fromLib && fromLib.icon) || ITEM_ICONS_LEGACY[item.id] || ITEM_IMAGES[itemIconName(item)];
        }

        // attrs: attributi in più per l'<img> (itemIconHtml passa IMG_DECODE_ASYNC; la barra degli eroi niente, vedi sotto)
        function itemIconInner(item, attrs = '') {
            const src = itemImageSrc(item);
            return src ? `<img class="item-img" src="${src}" alt=""${attrs ? ' ' + attrs : ''}>` : svgIcon(itemIconName(item));
        }

        // Icone di carte ed elenchi (mercante, bottino, diario, creazione): decodifica fuori dal disegno della pagina.
        // Non nella barra degli eroi (itemIconInner senza attributi, ritratti): si ridisegna a ogni azione e
        // con la decodifica asincrona le icone potrebbero lampeggiare.
        const IMG_DECODE_ASYNC = 'decoding="async"';
        // Elenchi lunghi o in finestre aperte dopo (Compendio, copertine delle campagne): l'immagine si carica
        // solo quando sta per entrare nella vista. Il segnaposto delle immagini mancanti (sotto) funziona lo stesso:
        // l'errore arriva quando il caricamento parte.
        const IMG_LAZY = 'loading="lazy" decoding="async"';

        function itemIconHtml(item) {
            const hasImage = !!itemImageSrc(item);
            return `<span class="icon-frame ic-${itemCategory(item)} rar-${itemRarity(item)} ${hasImage ? 'has-img' : ''}">${itemIconInner(item, IMG_DECODE_ASYNC)}</span>`;
        }

        // Icona WC3 dell'abilità: campo "icon" della libreria Abilità (data/libreria/abilita.js).
        // Le partite salvate prima della libreria non hanno "icon": si cerca per id. Senza icona resta quella SVG.
        function abilityIconSrc(ability) {
            if (!ability) return null;
            const fromLib = window.LIBRERIA && window.LIBRERIA.abilita && window.LIBRERIA.abilita[ability.id];
            return ability.icon || (fromLib && fromLib.icon) || null;
        }

        function abilityIconHtml(ability) {
            const src = abilityIconSrc(ability);
            if (src) return `<span class="icon-frame ic-arcane has-img"><img class="item-img" src="${src}" alt="" ${IMG_DECODE_ASYNC}></span>`;
            return `<span class="icon-frame ic-arcane">${svgIcon(ability.isCombatActive ? 'star' : 'rune')}</span>`;
        }

        function abilityCmdIconHtml(ability) {
            const src = abilityIconSrc(ability);
            return src ? `<img class="cmd-img" src="${src}" alt="">` : svgIcon('star');
        }

        function abilityMarkHtml(ability) {
            const src = abilityIconSrc(ability);
            return src ? `<img class="ability-mark" src="${src}" alt="" ${IMG_DECODE_ASYNC}>` : '★';
        }

        function clampPct(value, max) {
            return max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
        }

        function hpClass(pct) {
            return pct > 60 ? '' : (pct > 30 ? 'hp-mid' : 'hp-low');
        }

        // 23. Statistica verde se più alta di quella iniziale dell'eroe, rossa se più bassa (oggetti, reliquie, maledizioni)
        function heroStatHtml(h, key, short, label, help) {
            const base = (campaignHeroes || []).find(b => b.name === h.name);
            const start = base ? base[key] : h[key];
            const cls = h[key] > start ? 'stat-up' : h[key] < start ? 'stat-down' : '';
            const note = cls ? `<br><span class="tip-hint">Iniziale ${start}, ora ${h[key]}</span>` : '';
            return `<span class="${cls}" data-tip="${esc(label + '||' + help + note)}"><i>${short}</i>${h[key]}</span>`;
        }

        /* ---------- 10. Barre della vita con scia e 27. numeri che scorrono ----------
           La scia chiara resta dov'era la vita e si accorcia con un attimo di ritardo;
           il numero scorre dal valore precedente al nuovo. barMemory ricorda l'ultimo stato. */
        const barMemory = new Map();  // chiave -> { pct, value }
        function barGhostHtml(key, pct, value) {
            return `<div class="hp-bar-ghost" data-ghost-key="${esc(key)}" data-pct="${pct}" data-value="${value}" style="width: ${pct}%;"></div>`;
        }

        function animateBars(scope) {
            (scope || document).querySelectorAll('.hp-bar-ghost[data-ghost-key]').forEach(ghost => {
                const key = ghost.dataset.ghostKey;
                const pct = Number(ghost.dataset.pct), value = Number(ghost.dataset.value);
                const prev = barMemory.get(key);
                barMemory.set(key, { pct, value });
                const text = ghost.parentNode.querySelector('[data-count-key]');
                if (!prev || !animationsEnabled()) return;
                if (prev.pct > pct) {
                    ghost.style.transition = 'none';
                    ghost.style.width = `${prev.pct}%`;
                    void ghost.offsetWidth;
                    ghost.style.transition = '';
                    ghost.style.width = `${pct}%`;
                }
                if (text && prev.value !== value) countText(text, prev.value, value, text.dataset.countMax);
            });
        }

        // Fa scorrere un numero (anche nella forma "x/max") dal valore precedente al nuovo
        function countText(el, from, to, max, duration = 450) {
            if (!animationsEnabled() || from === to) return;
            const start = performance.now();
            const suffix = max ? `/${max}` : '';
            el.classList.add(to < from ? 'count-down' : 'count-up');
            const step = now => {
                const t = Math.min(1, (now - start) / duration);
                el.textContent = `${Math.round(from + (to - from) * t)}${suffix}`;
                if (t < 1) requestAnimationFrame(step);
                else setTimeout(() => el.classList.remove('count-down', 'count-up'), 300);
            };
            requestAnimationFrame(step);
        }

        // Telefono: la fila degli eroi mostra solo ritratti e vita; toccandone uno si apre la sua carta intera
        let expandedHeroCard = null;
        function toggleHeroCard(card, ev) {
            if (!window.matchMedia('(max-width: 700px)').matches) return;
            if (ev && ev.target.closest('.inv-slot, button')) return;
            expandedHeroCard = expandedHeroCard === card.dataset.hero ? null : card.dataset.hero;
            document.querySelectorAll('.hero-mini-card').forEach(c => c.classList.toggle('expanded', c.dataset.hero === expandedHeroCard));
            document.body.classList.toggle('hero-card-open', !!expandedHeroCard);
        }

        function heroCardHtml(h) {
            const hpPct = clampPct(h.hp, h.maxHp);
            const armorMax = Math.max(h.base_armor, h.current_armor);
            const armorPct = clampPct(h.current_armor, armorMax);
            const slotCount = Math.max(BACKPACK_SIZE, h.items.length);
            let slots = '';
            for (let i = 0; i < slotCount; i++) {
                const it = h.items[i];
                if (!it) { slots += `<div class="inv-slot empty"></div>`; continue; }
                const usable = it.type && it.type.startsWith('consumable');
                const tip = itemTip(it, h) + (usable ? '<br><span class="tip-hint">Clicca per usare</span>' : '');
                const hasImage = !!itemImageSrc(it);
                slots += `<div class="inv-slot ic-${itemCategory(it)} rar-${itemRarity(it)} ${usable ? 'usable' : ''} ${hasImage ? 'has-img' : ''}" data-tip="${esc(tip)}" ${usable ? azione('useConsumableFromTopbar', h.name, i) : ''}>${itemIconInner(it)}${(it.qty || 1) > 1 ? `<span class="inv-qty">x${it.qty}</span>` : ''}</div>`;
            }

            return `
                <div class="hero-mini-card ${h.hp <= 0 ? 'dead' : ''} ${heroTurnClass(h)} ${expandedHeroCard === h.name ? 'expanded' : ''}" data-hero="${esc(h.name)}" ${azione('toggleHeroCard', '$el', '$event')}>
                    ${heroBuffsHtml(h)}
                    ${heroBlessingsHtml(h)}
                    <div class="hero-portrait ${heroPortraitClass(h.name)}" style="--hue:${heroHue(h.name)}">${heroPortraitInner(h.name, h.hp, h.maxHp)}</div>
                    <div class="hero-bars">
                        <div class="hero-card-name" title="${esc(h.name)}">${h.name}</div>
                        <div class="hp-bar-container" data-tip="Punti Vita||${h.hp} su ${h.maxHp}">
                            ${barGhostHtml(`hero:${h.name}`, hpPct, h.hp)}
                            <div class="hp-bar-fill ${hpClass(hpPct)}" style="width: ${hpPct}%;"></div>
                            <div class="hp-bar-text" data-count-key="hero:${esc(h.name)}" data-count-max="${h.maxHp}">${h.hp}/${h.maxHp}</div>
                        </div>
                        <div class="hp-bar-container armor ${h.base_armor > 0 || h.current_armor > 0 ? '' : 'is-empty'}" data-tip="Armatura||${h.current_armor} attuale su ${h.base_armor} base. Assorbe i danni prima degli HP e si rigenera a ogni scontro.">
                            <div class="hp-bar-fill" style="width: ${armorPct}%;"></div>
                            <div class="hp-bar-text">${h.current_armor}/${h.base_armor}</div>
                        </div>
                    </div>
                    <div class="hero-stats">
                        ${heroStatHtml(h, 'str', 'FOR', 'Forza', 'Si somma ai tiri di attacco, difesa e aiuto.')}
                        ${heroStatHtml(h, 'int', 'INT', 'Intelligenza', 'Usata nelle prove di intelletto e nella contrattazione.')}
                        ${heroStatHtml(h, 'fth', 'FED', 'Fede', 'Usata nelle prove di fede.')}
                        ${heroStatHtml(h, 'dmg', 'DAN', 'Danno', 'Danni inflitti con un attacco riuscito.')}
                    </div>
                    ${h.chosenAbility ? `<div class="hero-ability" data-tip="${esc(h.chosenAbility.name + "||" + (h.chosenAbility.desc || ""))}">${abilityMarkHtml(h.chosenAbility)} ${h.chosenAbility.name}</div>` : ""}
                    <div class="hero-inventory">${slots}<span class="inv-label ${h.items.length >= BACKPACK_SIZE ? 'full' : ''}">Zaino ${h.items.length}/${BACKPACK_SIZE}</span></div>
                </div>`;
        }

        /* ---------- Finestra modale ---------- */
        // Porta in vista un elemento appena comparso (dado, esito, scelte, pulsante per proseguire)
        // senza cambiare il layout: scorre quanto basta la cornice della scena. el = elemento o id.
        function revealInView(el) {
            if (typeof el === 'string') el = document.getElementById(el);
            if (!el || typeof el.scrollIntoView !== 'function') return;
            requestAnimationFrame(() => {
                if (el.offsetParent === null) return;  // nascosto
                el.scrollIntoView({ block: 'nearest', behavior: animationsEnabled() ? 'smooth' : 'auto' });
            });
        }

        // Annuncio breve dell'esito di un tiro, sopra la scena: "Successo!" / "Fallito" e il conto (es. "9 contro CD 7").
        // Non blocca i clic e sparisce da solo.
        function showRollBanner(ok, title, detail) {
            document.querySelectorAll('.roll-banner').forEach(b => b.remove());
            const banner = document.createElement('div');
            banner.className = `roll-banner ${ok ? 'ok' : 'ko'}`;
            banner.innerHTML = `<div class="roll-banner-box"><strong>${esc(title)}</strong>${detail ? `<small>${esc(detail)}</small>` : ''}</div>`;
            document.body.appendChild(banner);
            speedUpAnimations(banner);
            setTimeout(() => banner.remove(), animTime(1700));
        }

        function openModal(title, bodyHtml, actions, options = {}) {
            const box = document.querySelector('#wc3Modal .modal-box');
            box.classList.toggle('wide', !!options.wide);
            if (document.getElementById('wc3Modal').classList.contains('hidden')) {
                box.classList.remove('modal-drop');
                void box.offsetWidth;
                box.classList.add('modal-drop');
            }
            document.getElementById('wc3ModalTitle').textContent = title;
            document.getElementById('wc3ModalBody').innerHTML = bodyHtml;
            const actionsBox = document.getElementById('wc3ModalActions');
            actionsBox.innerHTML = '';
            (actions || [{ label: 'OK' }]).forEach(action => {
                const btn = document.createElement('button');
                btn.textContent = action.label;
                if (action.className) btn.className = action.className;
                if (action.disabled) btn.disabled = true;
                btn.addEventListener('click', () => {
                    closeModal();
                    if (action.onClick) action.onClick();
                });
                actionsBox.appendChild(btn);
            });
            document.getElementById('wc3Modal').classList.remove('hidden');
            const first = actionsBox.querySelector('button:not(:disabled)');
            if (first) first.focus();
        }

        function closeModal() {
            document.getElementById('wc3Modal').classList.add('hidden');
        }

        // Gli avvisi del gioco usano la finestra in stile WC3 invece di quella del browser
        window.alert = function(message) {
            openModal('Avviso', `<p>${message}</p>`, [{ label: 'OK' }]);
        };

        /* ---------- Tooltip ---------- */
        const tooltipEl = document.getElementById('wc3Tooltip');

        function positionTooltip(e) {
            const pad = 16;
            const rect = tooltipEl.getBoundingClientRect();
            let x = e.clientX + pad;
            let y = e.clientY + pad;
            if (x + rect.width > window.innerWidth - 8) x = e.clientX - rect.width - pad;
            if (y + rect.height > window.innerHeight - 8) y = e.clientY - rect.height - pad;
            tooltipEl.style.left = `${Math.max(8, x)}px`;
            tooltipEl.style.top = `${Math.max(8, y)}px`;
        }

        document.addEventListener('mouseover', e => {
            const target = e.target.closest('[data-tip]');
            if (!target) { tooltipEl.classList.remove('show'); return; }
            const [title, body] = target.dataset.tip.split('||');
            tooltipEl.innerHTML = `<div class="tip-title">${title}</div>${body ? `<div class="tip-body">${body}</div>` : ''}`;
            tooltipEl.classList.add('show');
            positionTooltip(e);
        });
        document.addEventListener('mousemove', e => {
            if (tooltipEl.classList.contains('show')) positionTooltip(e);
        });
        document.addEventListener('mousedown', () => tooltipEl.classList.remove('show'));

        /* ---------- Tasti rapidi (griglia QWER come la plancia comandi di WC3) ---------- */
        function isUsable(el) {
            return el && !el.disabled && el.offsetParent !== null;
        }

        document.addEventListener('keydown', e => {
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            const modalOpen = !document.getElementById('wc3Modal').classList.contains('hidden');
            if (modalOpen) {
                if (e.key === 'Escape') closeModal();
                return;
            }
            if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;

            const hotkeys = { q: 'cmdAttack', w: 'cmdDefend', e: 'cmdHelp', r: 'cmdItem', t: 'btnCombatAbility' };
            const cmd = document.getElementById(hotkeys[e.key.toLowerCase()]);
            if (isUsable(cmd)) { e.preventDefault(); cmd.click(); return; }

            // Esc in combattimento, prima del tiro: dal dado torna alle azioni, dalle azioni alla scelta dell'eroe
            if (e.key === 'Escape') {
                const back = ['combatDiceBackBtn', 'combatChangeHeroBtn'].map(id => document.getElementById(id)).find(isUsable);
                if (back) { e.preventDefault(); back.click(); return; }
            }

            if (e.key === ' ' && document.activeElement.tagName !== 'BUTTON') {
                const roll = ['rollCombatBtn', 'rollChallengeBtn', 'rollCaptainBtn']
                    .map(id => document.getElementById(id))
                    .find(isUsable);
                if (roll) { e.preventDefault(); roll.click(); }
            }
        });

        /* ---------- Segnaposto per immagini mancanti ---------- */
        function markMissingImage(img) {
            const box = img.parentElement;
            if (!box) return;
            box.classList.add('img-missing');
            box.setAttribute('data-alt', img.alt || '');
        }
        document.addEventListener('error', e => {
            if (e.target.tagName === 'IMG') markMissingImage(e.target);
        }, true);
        document.addEventListener('load', e => {
            if (e.target.tagName === 'IMG' && e.target.parentElement) e.target.parentElement.classList.remove('img-missing');
        }, true);
        // Le immagini con loading="lazy" non ancora caricate non vanno contate come mancanti: il loro errore arriva dopo
        document.querySelectorAll('img').forEach(img => {
            if (img.loading !== 'lazy' && img.complete && img.naturalWidth === 0) markMissingImage(img);
        });
