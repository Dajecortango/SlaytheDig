/* ==========================================================================
   OPZIONI, COMPENDIO E GUIDA
   Opzioni di gioco (dignitas_options, applyOptions), Compendio delle scoperte
   (dignitas_compendium, discover), finestre "Come si gioca" e Opzioni.
   Diviso da js/game.js: stesso ambito globale, caricato dopo js/effetti.js.
   ========================================================================== */

        /* ---------- 19. Opzioni di gioco ---------- */
        const DEFAULT_OPTIONS = { textSpeed: 2, textSize: 1, musicVolume: 0.5, sfxVolume: 0.8, animations: true, floatingNumbers: true, fastAnimations: false };
        let gameOptions = Object.assign({}, DEFAULT_OPTIONS);
        try { Object.assign(gameOptions, JSON.parse(localStorage.getItem('dignitas_options') || '{}')); } catch (e) {}

        function saveOptions() {
            try { localStorage.setItem('dignitas_options', JSON.stringify(gameOptions)); } catch (e) {}
        }

        function animationsEnabled() {
            return gameOptions.animations && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }

        // Animazioni rapide (opzione per chi rigioca): durate dimezzate per dadi, cinematiche, annunci e testo a macchina
        function animTime(ms) {
            return gameOptions.fastAnimations ? Math.round(ms / 2) : ms;
        }

        // Le animazioni CSS dentro "el" (cinematiche, annunci) vanno al doppio della velocità con le animazioni rapide
        function speedUpAnimations(el) {
            if (!gameOptions.fastAnimations || !el || typeof el.getAnimations !== 'function') return;
            el.getAnimations({ subtree: true }).forEach(a => { a.playbackRate = 2; });
        }

        function applyOptions() {
            document.body.classList.toggle('no-anim', !gameOptions.animations);
            document.body.classList.toggle('fast-anim', !!gameOptions.fastAnimations);
            updateMenuVideo();
            document.body.style.setProperty('--text-scale', gameOptions.textSize);
            // Nuovo volume subito sul brano che suona (non su quello che sta sfumando)
            if (musicActive && !musicActive.paused && !musicActive.loopOutgoing) {
                clearInterval(musicActive.fadeTimer);
                musicActive.volume = gameOptions.musicVolume;
            }
        }

        /* ---------- Compendio: nemici, reliquie, maledizioni e oggetti scoperti in tutte le partite ---------- */
        const COMPENDIUM_KEY = 'dignitas_compendium';
        const COMPENDIUM_KINDS = ['enemies', 'relics', 'curses', 'items'];
        const compendium = (() => {
            let saved = {};
            try { saved = JSON.parse(localStorage.getItem(COMPENDIUM_KEY) || '{}'); } catch (e) {}
            // Prima i nemici erano registrati come "campagna:chiave": si passa all'id del bestiario
            const ENEMY_ALIASES = { 'tutorial:disertori': 'disertori_affamati' };
            if (saved.enemies) saved.enemies = saved.enemies.map(k => ENEMY_ALIASES[k] || (k.includes(':') ? k.split(':').pop() : k));
            return Object.fromEntries(COMPENDIUM_KINDS.map(k => [k, new Set(saved[k] || [])]));
        })();

        function discover(kind, key) {
            if (!key || compendium[kind].has(key)) return;
            compendium[kind].add(key);
            try {
                localStorage.setItem(COMPENDIUM_KEY, JSON.stringify(Object.fromEntries(COMPENDIUM_KINDS.map(k => [k, [...compendium[k]]]))));
            } catch (e) {}
        }

        // Tutte le voci possibili: la libreria condivisa (data/libreria/), con le campagne in cui compaiono
        function compendiumCatalog() {
            const usedIn = {};  // "tipo:id" -> titoli delle campagne
            const mark = (kind, id, camp) => { (usedIn[kind + ':' + id] = usedIn[kind + ':' + id] || new Set()).add(camp.title); };
            Object.entries(window.CAMPAIGNS_RAW || {}).forEach(([id, raw]) => {
                const camp = campaignsDatabase[id] || raw;
                (raw.mapNodes || []).forEach(n => { if (n.enemy) mark('enemies', n.enemy, camp); });
                Object.values(raw.challenges || {}).forEach(ch => {
                    if (typeof ch.reward === 'string') mark('relics', ch.reward, camp);
                    if (typeof ch.punishment === 'string') mark('curses', ch.punishment, camp);
                });
                [...(raw.initialArmory || []), ...(raw.lootItems || LIBRERIA.lootPredefinito || [])]
                    .forEach(ref => { if (typeof ref === 'string') mark('items', ref, camp); });
            });
            const where = (kind, id) => [...(usedIn[kind + ':' + id] || [])].join(', ');
            return {
                enemies: Object.entries(LIBRERIA.bestiario).map(([id, e]) => ({ key: id, enemy: e, campaign: where('enemies', id) })),
                relics: Object.entries(LIBRERIA.reliquie).map(([id, r]) => ({ key: r.name, entry: r, campaign: where('relics', id) })),
                curses: Object.entries(LIBRERIA.maledizioni).map(([id, c]) => ({ key: c.name, entry: c, campaign: where('curses', id) })),
                items: Object.values(LIBRERIA.armeria).map(item => ({ key: item.id, item }))
            };
        }

        const COMPENDIUM_TABS = [
            { kind: 'enemies', label: 'Nemici' },
            { kind: 'relics', label: 'Reliquie' },
            { kind: 'curses', label: 'Maledizioni' },
            { kind: 'items', label: 'Oggetti' }
        ];

        function compendiumCardHtml(kind, v) {
            const known = compendium[kind].has(v.key);
            if (!known) {
                return `<div class="codex-card unknown"><span class="icon-frame">${svgIcon('question')}</span><span class="tile-text"><strong>???</strong><span class="tile-sub">Non ancora scoperto</span></span></div>`;
            }
            if (kind === 'items') {
                return `<div class="codex-card">${itemIconHtml(v.item)}<span class="tile-text"><strong>${esc(v.item.name)}</strong><span class="tile-sub">${esc(v.item.desc)}</span><span class="tile-tag">${esc(RARITY_LABELS[itemRarity(v.item)] || '')}</span></span></div>`;
            }
            if (kind === 'enemies') {
                const e = v.enemy;
                const face = e.image ? `<span class="icon-frame has-img"><img class="item-img codex-enemy-img" src="${e.image}" alt="" ${IMG_LAZY} ${azioneSu('error', 'replaceWithSkullIcon', '$el')}></span>` : `<span class="icon-frame ic-arcane">${svgIcon('skull')}</span>`;
                return `<div class="codex-card">${face}<span class="tile-text"><strong>${esc(e.name)}</strong>
                    <span class="tile-sub">HP ${e.maxHp} · CA ${e.ca} · Attacco ${e.att} · Danno ${e.dmg}</span><span class="tile-tag">${esc(v.campaign)}</span></span></div>`;
            }
            const img = kind === 'relics' ? 'immagini/icone/BTNEnchantedGemstone.png' : 'immagini/icone/BTNOrbOfCorruption.png';
            return `<div class="codex-card"><span class="icon-frame has-img"><img class="item-img" src="${img}" alt="" ${IMG_LAZY}></span><span class="tile-text"><strong>${esc(v.entry.name)}</strong>
                <span class="tile-sub">${esc(v.entry.desc)}</span><span class="tile-tag">${esc(v.campaign)}</span></span></div>`;
        }

        // Immagine del nemico che non si carica nel Compendio: al suo posto il teschio (data-error di compendiumCardHtml)
        function replaceWithSkullIcon(img) {
            if (img.parentNode) img.parentNode.innerHTML = svgIcon('skull');
        }

        function openCompendium(kind = 'enemies') {
            const catalog = compendiumCatalog();
            const tabs = COMPENDIUM_TABS.map(t => {
                const found = catalog[t.kind].filter(v => compendium[t.kind].has(v.key)).length;
                return `<button class="btn-small codex-tab ${t.kind === kind ? 'active' : ''}" ${azione('openCompendium', t.kind)}>${t.label} <span>${found}/${catalog[t.kind].length}</span></button>`;
            }).join('');
            const cards = catalog[kind].map(v => compendiumCardHtml(kind, v)).join('') || '<p class="panel-label">Nessuna voce.</p>';
            openModal('Compendio', `<div class="codex-tabs">${tabs}</div><div class="codex-grid">${cards}</div>`,
                [{ label: 'Chiudi', className: 'btn-proceed' }], { wide: true });
        }

        function openHowToPlay() {
            openModal('Come si gioca', `
                <div class="howto">
                    <p>Scegli una campagna, componi la compagnia e assegna a ogni eroe un'abilità e un oggetto iniziale.</p>
                    <p>Sulla mappa avanza di livello in livello: <b>scontri</b>, <b>sfide</b>, <b>tesori</b>, <b>mercanti</b> e <b>riposi</b>. Il boss attende in cima.</p>
                    <p>In combattimento ogni eroe tira un d6 e aggiunge la Forza: <b>Attacca</b> contro la CA del nemico, <b>Difendi</b> e <b>Aiuta</b> contro il suo Attacco.</p>
                    <p>Nelle sfide si tira un d6 più Intelligenza o Fede contro la Classe di Difficoltà. Superarle dà reliquie, fallirle maledizioni.</p>
                    <p>Dado naturale: un <b>6</b> sul dado riesce sempre, un <b>1</b> fallisce sempre, qualunque siano bonus e difficoltà.</p>
                    <p>Tasti rapidi in combattimento: <span class="keycap">Q</span><span class="keycap">W</span><span class="keycap">E</span><span class="keycap">R</span><span class="keycap">T</span> azioni, <span class="keycap">Spazio</span> tira il dado.</p>
                </div>`, [{ label: 'Chiudi', className: 'btn-proceed' }], { wide: true });
        }

        function openOptions() {
            const speeds = [[1, 'Lenta'], [2, 'Normale'], [4, 'Veloce'], [0, 'Istantanea']];
            const sizes = [[1, 'Normale'], [1.15, 'Grande'], [1.3, 'Molto grande']];
            const pct = v => Math.round(v * 100);
            openModal('Opzioni', `
                <div class="options-grid">
                    <div class="option-row">
                        <span class="option-label">Velocità del testo<small>Descrizioni scritte a macchina</small></span>
                        <select id="optTextSpeed">${speeds.map(([v, l]) => `<option value="${v}" ${gameOptions.textSpeed === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
                    </div>
                    <div class="option-row">
                        <span class="option-label">Dimensione del testo<small>Descrizioni, registro, oggetti e finestre</small></span>
                        <select id="optTextSize">${sizes.map(([v, l]) => `<option value="${v}" ${gameOptions.textSize === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
                    </div>
                    <div class="option-row">
                        <span class="option-label">Audio<small>Musica ed effetti sonori</small></span>
                        <label class="option-toggle"><input type="checkbox" id="optMuted" ${soundMuted ? 'checked' : ''}> Silenzia tutto</label>
                    </div>
                    <div class="option-row">
                        <span class="option-label">Volume musica</span>
                        <div class="option-range"><input type="range" id="optMusic" min="0" max="100" value="${pct(gameOptions.musicVolume)}"><output id="optMusicOut">${pct(gameOptions.musicVolume)}%</output></div>
                    </div>
                    <div class="option-row">
                        <span class="option-label">Volume effetti</span>
                        <div class="option-range"><input type="range" id="optSfx" min="0" max="100" value="${pct(gameOptions.sfxVolume)}"><output id="optSfxOut">${pct(gameOptions.sfxVolume)}%</output></div>
                    </div>
                    <div class="option-row">
                        <span class="option-label">Effetti animati<small>Titoli degli eventi, scrigno, carte, tremolii</small></span>
                        <label class="option-toggle"><input type="checkbox" id="optAnim" ${gameOptions.animations ? 'checked' : ''}> Attivi</label>
                    </div>
                    <div class="option-row">
                        <span class="option-label">Animazioni rapide<small>Dadi, cinematiche, annunci e testo a macchina in metà tempo</small></span>
                        <label class="option-toggle"><input type="checkbox" id="optFast" ${gameOptions.fastAnimations ? 'checked' : ''}> Attive</label>
                    </div>
                    <div class="option-row">
                        <span class="option-label">Numeri fluttuanti<small>Danni, cure e armatura sopra i bersagli</small></span>
                        <label class="option-toggle"><input type="checkbox" id="optNumbers" ${gameOptions.floatingNumbers ? 'checked' : ''}> Attivi</label>
                    </div>
                </div>`,
                [
                    { label: 'Chiudi', className: 'btn-proceed' },
                    { label: 'Ripristina predefinite', onClick: () => { gameOptions = Object.assign({}, DEFAULT_OPTIONS); saveOptions(); applyOptions(); openOptions(); } }
                ]);

            const bind = (id, event, handler) => document.getElementById(id).addEventListener(event, e => { handler(e.target); saveOptions(); });
            bind('optTextSpeed', 'change', el => { gameOptions.textSpeed = Number(el.value); });
            bind('optTextSize', 'change', el => { gameOptions.textSize = Number(el.value); applyOptions(); });
            bind('optFast', 'change', el => { gameOptions.fastAnimations = el.checked; applyOptions(); });
            document.getElementById('optMuted').addEventListener('change', e => setSoundMuted(e.target.checked));
            bind('optMusic', 'input', el => {
                gameOptions.musicVolume = el.value / 100;
                document.getElementById('optMusicOut').textContent = `${el.value}%`;
                applyOptions();
            });
            bind('optSfx', 'input', el => {
                gameOptions.sfxVolume = el.value / 100;
                document.getElementById('optSfxOut').textContent = `${el.value}%`;
            });
            document.getElementById('optSfx').addEventListener('change', () => playSfx(CLICK_SFX, 0.8));
            bind('optAnim', 'change', el => { gameOptions.animations = el.checked; applyOptions(); });
            bind('optNumbers', 'change', el => { gameOptions.floatingNumbers = el.checked; });
        }
