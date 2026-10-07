/* ==========================================================================
   MAPPA
   Mappa alla Slay the Spire: nodi, segnalino della compagnia, titolo dell'evento,
   ingresso nei nodi e avanzamento, legenda.
   Diviso da js/game.js: stesso ambito globale (usa stato, LIBRERIA, showScreen...).
   Caricato dopo js/game.js; le funzioni si chiamano tra file solo dopo il caricamento
   (l'avvio vero e proprio è in js/avvio.js, caricato per ultimo).
   ========================================================================== */

        // Mentre il giocatore guarda la mappa si caricano immagini e suoni dei nodi raggiungibili,
        // così la scena dello scontro o della sfida compare subito, senza apparire a scatti.
        const preloadedAssets = new Set();
        function preloadAvailableNodes() {
            stato.stsMapNodes.filter(n => n.active && !n.done).forEach(n => {
                const enemy = n.enemy && enemies[n.enemy];
                [n.image, enemy && enemy.image].filter(Boolean).forEach(src => {
                    if (preloadedAssets.has(src)) return;
                    preloadedAssets.add(src);
                    new Image().src = src;
                });
                if (!enemy) return;
                ['sfxAttack', 'sfxHit', 'sfxDeath'].forEach(slot => {
                    const src = enemy[slot];
                    if (!src || preloadedAssets.has(src)) return;
                    preloadedAssets.add(src);
                    const audio = new Audio();
                    audio.preload = 'auto';
                    audio.src = src;
                });
            });
        }

        function startMap() {
            showScreen('screenMap');
            renderStsMap();
            preloadAvailableNodes();
            setTimeout(() => {
                const wrapper = document.getElementById('stsMapWrapper');
                const token = document.getElementById('partyToken');
                // Centra la vista sul segnalino della compagnia (o sul fondo della mappa all'inizio)
                const maxScroll = wrapper.scrollHeight - wrapper.clientHeight;
                const target = Math.max(0, Math.min(maxScroll, token
                    ? parseFloat(token.style.top) - wrapper.clientHeight * 0.6
                    : maxScroll));
                if (!animationsEnabled()) { wrapper.scrollTop = target; return; }
                // Alla prima apertura la vista parte dalla meta in cima e scende fino alla compagnia;
                // poi scivola dal basso fino al segnalino. Alla fine i nodi raggiungibili si illuminano.
                const start = token ? Math.min(maxScroll, target + 220) : 0;
                panMapView(wrapper, start, target, token ? 700 : 1800, wakeAvailableNodes);
            }, 50);
        }

        let mapPanFrame = null;

        function panMapView(wrapper, from, to, duration, onDone) {
            cancelAnimationFrame(mapPanFrame);
            wrapper.scrollTop = from;
            const t0 = performance.now();
            // Se il giocatore scorre o clicca, lo scorrimento automatico si ferma
            const stop = () => {
                cancelAnimationFrame(mapPanFrame);
                ['wheel', 'pointerdown', 'touchstart'].forEach(ev => wrapper.removeEventListener(ev, stop));
                if (onDone) onDone();
                onDone = null;
            };
            ['wheel', 'pointerdown', 'touchstart'].forEach(ev => wrapper.addEventListener(ev, stop, { passive: true }));
            const step = now => {
                const t = Math.min(1, (now - t0) / duration);
                const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                wrapper.scrollTop = from + (to - from) * ease;
                if (t < 1) mapPanFrame = requestAnimationFrame(step);
                else stop();
            };
            mapPanFrame = requestAnimationFrame(step);
        }

        // I nodi raggiungibili si accendono uno dopo l'altro, da sinistra a destra
        function wakeAvailableNodes() {
            const nodes = Array.from(document.querySelectorAll('#stsMapNodesContainer .sts-node.available'))
                .sort((a, b) => parseFloat(a.style.left) - parseFloat(b.style.left));
            nodes.forEach((el, i) => {
                el.style.setProperty('--wake-delay', `${i * 160}ms`);
                el.classList.add('node-wake');
                el.addEventListener('animationend', e => {
                    if (e.animationName === 'node-wake') el.classList.remove('node-wake');
                });
            });
        }

        function renderStsMap() {
            const nodesContainer = document.getElementById('stsMapNodesContainer');
            const svgContainer = document.getElementById('stsMapSvg');
            Array.from(nodesContainer.children).forEach(child => { if(child.id !== 'stsMapSvg') child.remove(); });

            let maxLevel = Math.max(...stato.stsMapNodes.map(n => n.level), 1);
            const totalLevels = maxLevel + 1;
            const containerHeight = Math.max(900, totalLevels * 175);
            nodesContainer.style.height = `${containerHeight}px`;
            svgContainer.style.height = `${containerHeight}px`;
            svgContainer.setAttribute("viewBox", `0 0 800 ${containerHeight}`);

            const stepY = (containerHeight - 140) / maxLevel;

            const currentActiveNode = stato.stsMapNodes.find(n => n.active);
            const currentLevel = currentActiveNode ? currentActiveNode.level : (stato.stsMapNodes.filter(n => n.done).length > 0 ? Math.max(...stato.stsMapNodes.filter(n => n.done).map(n => n.level)) + 1 : 0);

            let svgLinesHtml = '';
            stato.stsMapNodes.forEach(node => {
                node.next.forEach(nextId => {
                    const targetNode = stato.stsMapNodes.find(n => n.id === nextId);
                    if(targetNode) {
                        const y1 = containerHeight - (node.level * stepY + 70);
                        const y2 = containerHeight - (targetNode.level * stepY + 70);

                        let pathClass = "";
                        if (targetNode.active && node.done) pathClass = "path-open";
                        else if (targetNode.active) pathClass = "path-next";
                        else if (node.done && targetNode.done) pathClass = "path-taken";
                        else if (node.done) pathClass = "path-closed";
                        else if (targetNode.level < currentLevel) pathClass = "path-closed";

                        svgLinesHtml += `<line class="${pathClass}" data-from="${node.id}" data-to="${targetNode.id}" x1="${node.x}" y1="${y1}" x2="${targetNode.x}" y2="${y2}" />`;
                    }
                });
            });
            svgContainer.innerHTML = svgLinesHtml;
            renderMapLegend();

            stato.stsMapNodes.forEach(node => {
                let statusClass = "upcoming";
                if (node.done) {
                    statusClass = "completed";
                } else if (node.active) {
                    statusClass = "available";
                } else if (node.level < currentLevel && !node.done) {
                    statusClass = "excluded";
                }

                const nodeEl = document.createElement('div');
                nodeEl.className = `sts-node node-${node.type} ${statusClass}`;
                nodeEl.dataset.nodeId = node.id;
                nodeEl.style.left = `${node.x}px`;
                nodeEl.style.top = `${containerHeight - (node.level * stepY + 70)}px`;
                const isBoss = node.level === maxLevel || node.type === 'captain';
                if (isBoss) {
                    nodeEl.setAttribute('data-boss', 'true');
                    nodeEl.classList.add('node-goal');
                }

                nodeEl.innerHTML = svgIcon(isBoss ? 'crown' : (NODE_ICON[node.type] || 'question'));
                if(node.active && !node.done) {
                    nodeEl.onclick = () => selectStsNode(node.id);
                }
                nodesContainer.appendChild(nodeEl);
            });

            renderPartyToken(nodesContainer, containerHeight, stepY);
            renderExpeditionProgress(maxLevel);
        }

        /* ---------- Segnalino della compagnia sulla mappa ---------- */
        let lastPartyTokenPos = null;

        function renderPartyToken(nodesContainer, containerHeight, stepY) {
            const doneNodes = stato.stsMapNodes.filter(n => n.done);
            if (doneNodes.length === 0) {
                // Prima del primo nodo il segnalino non si vede: entrerà dal fondo della mappa
                const firstLevel = stato.stsMapNodes.filter(n => n.level === 0);
                const avgX = firstLevel.reduce((s, n) => s + n.x, 0) / Math.max(1, firstLevel.length);
                lastPartyTokenPos = { x: avgX, y: containerHeight + 60, nodes: stato.stsMapNodes };
                return;
            }
            const last = doneNodes.reduce((a, b) => (b.level > a.level ? b : a));
            const pos = { x: last.x, y: containerHeight - (last.level * stepY + 70) };

            const token = createPartyToken();
            const from = lastPartyTokenPos && lastPartyTokenPos.nodes === stato.stsMapNodes ? lastPartyTokenPos : null;
            const moves = from && (from.x !== pos.x || from.y !== pos.y) && animationsEnabled();
            const start = moves ? from : pos;
            token.style.left = `${start.x}px`;
            token.style.top = `${start.y}px`;
            nodesContainer.appendChild(token);

            if (moves) {
                token.classList.add('moving');
                void token.offsetWidth;
                token.style.left = `${pos.x}px`;
                token.style.top = `${pos.y}px`;
                setTimeout(() => token.classList.remove('moving'), 950);
            }
            lastPartyTokenPos = { x: pos.x, y: pos.y, nodes: stato.stsMapNodes };
        }

        function createPartyToken() {
            const token = document.createElement('div');
            token.id = 'partyToken';
            token.className = 'party-token';
            token.innerHTML = `<svg viewBox="0 0 64 72" aria-hidden="true">
                <path d="M32 3 L60 12 V34 C60 52 47 64 32 69 C17 64 4 52 4 34 V12 Z" fill="url(#gradGold)" stroke="#000" stroke-width="2"/>
                <path d="M32 10 L54 17 V34 C54 48 44 58 32 62 C20 58 10 48 10 34 V17 Z" fill="url(#gradRed)" stroke="#000"/>
                <text x="32" y="46" text-anchor="middle" font-family="Cinzel, Georgia, serif" font-weight="900" font-size="28" fill="url(#gradGold)" stroke="#000" stroke-width="1">D</text>
            </svg>`;
            token.dataset.tip = 'La Compagnia||Posizione attuale della spedizione.';
            return token;
        }

        // Percorso animato: dopo il clic su un nodo il segnalino percorre il collegamento fino a lì
        // (la strada si illumina d'oro), poi parte il titolo dell'evento. Restituisce la durata in ms.
        const PARTY_TRAVEL_MS = 900;
        function travelPartyTokenTo(node) {
            const container = document.getElementById('stsMapNodesContainer');
            const nodeEl = container && container.querySelector(`.sts-node[data-node-id="${node.id}"]`);
            if (!nodeEl || !animationsEnabled()) return 0;
            const target = { x: node.x, y: parseFloat(nodeEl.style.top) };

            let token = document.getElementById('partyToken');
            if (!token) {
                // Primo nodo: il segnalino entra dal fondo della mappa
                const start = lastPartyTokenPos || { x: target.x, y: target.y + 200 };
                token = createPartyToken();
                token.style.left = `${start.x}px`;
                token.style.top = `${start.y}px`;
                container.appendChild(token);
            }

            const fromNode = stato.stsMapNodes.filter(n => n.done).reduce((a, b) => (!a || b.level > a.level ? b : a), null);
            const line = fromNode && document.querySelector(`#stsMapSvg line[data-from="${fromNode.id}"][data-to="${node.id}"]`);
            if (line) line.classList.add('path-walking');
            nodeEl.classList.add('node-arriving');

            const wrapper = document.getElementById('stsMapWrapper');
            if (wrapper && wrapper.scrollTo) wrapper.scrollTo({ top: target.y - wrapper.clientHeight * 0.6, behavior: 'smooth' });

            token.classList.add('moving');
            void token.offsetWidth;
            token.style.left = `${target.x}px`;
            token.style.top = `${target.y}px`;
            setTimeout(() => token.classList.remove('moving'), PARTY_TRAVEL_MS + 50);
            // Al ritorno sulla mappa il segnalino è già sul nodo: niente seconda animazione
            lastPartyTokenPos = { x: target.x, y: target.y, nodes: stato.stsMapNodes };
            synthSfx('flip');
            return PARTY_TRAVEL_MS;
        }

        /* ---------- Titolo dell'evento prima di entrare nel nodo ---------- */
        let nodeBannerBusy = false;

        function nodeBannerInfo(node) {
            const maxLevel = Math.max(...stato.stsMapNodes.map(n => n.level));
            const isBoss = node.level === maxLevel || node.type === 'captain';
            let kind = NODE_LABEL[node.type] || 'Evento';
            let title = kind;
            if ((node.type === 'combat' || node.type === 'elite') && enemies[node.enemy]) title = enemies[node.enemy].name;
            else if (node.type === 'challenge' && challengesData[node.challengeId]) title = challengesData[node.challengeId].title;
            if (isBoss) kind = node.type === 'challenge' ? 'Prova Finale' : 'Scontro Finale';
            // Sottotitolo come gli annunci di zona di WoW; il livello solo se il titolo del nodo non lo dice già
            const levelText = `Livello ${node.level + 1} di ${maxLevel + 1}`;
            const sub = node.title ? (/livello/i.test(node.title) ? node.title : `${node.title} — ${levelText}`) : levelText;
            return { kind, title, sub, icon: isBoss ? 'crown' : (NODE_ICON[node.type] || 'question'), isBoss };
        }

        function selectStsNode(id) {
            if (nodeBannerBusy) return;
            const node = stato.stsMapNodes.find(n => n.id === id);
            if (!node) return;
            if (!animationsEnabled()) { enterStsNode(id); return; }

            nodeBannerBusy = true;
            const travel = travelPartyTokenTo(node);
            setTimeout(() => showNodeBanner(node, id), travel);
        }

        function showNodeBanner(node, id) {
            const info = nodeBannerInfo(node);
            const banner = document.createElement('div');
            banner.className = `event-banner ${info.isBoss ? 'boss' : ''}`;
            banner.innerHTML = `
                <div class="event-banner-inner">
                    <div class="event-banner-icon">${svgIcon(info.icon)}</div>
                    <div class="event-banner-kind">${info.kind}</div>
                    <div class="event-banner-title">${info.title}</div>
                    <div class="event-banner-sub">${info.sub}</div>
                </div>`;
            document.body.appendChild(banner);

            // La schermata cambia sotto il titolo, poi il titolo sfuma
            setTimeout(() => enterStsNode(id), 1000);
            setTimeout(() => { banner.remove(); nodeBannerBusy = false; }, 1500);
        }

        function enterStsNode(id) {
            stato.currentNodeId = id;
            const node = stato.stsMapNodes.find(n => n.id === id);

            setCombatVideo(null);
            if(node.type === 'combat' || node.type === 'elite') {
                chooseCombatTheme(node);
                if(node.image) document.getElementById('combatImg').src = node.image;
                setCombatVideo(enemies[node.enemy] && enemies[node.enemy].video);
                startCombat(node.enemy);
            }
            else if(node.type === 'challenge') {
                if(node.image) document.getElementById('challengeImg').src = node.image;
                startChallenge(node.challengeId);
            }
            else if(node.type === 'rest') {
                if(node.image) document.getElementById('restImg').src = node.image;
                startRest(node.restId);
            }
            else if(node.type === 'merchant') {
                if(node.image) document.getElementById('merchantImg').src = node.image;
                startMerchant(node.merchantId);
            }
            else if(node.type === 'treasure') {
                if(node.image) document.getElementById('treasureImg').src = node.image;
                startTreasure(node.treasureId);
            }
            else if(node.type === 'story') {
                startStory(node);
            }
            else if(node.type === 'captain') {
                startCaptainFinale();
            }
        }

        function advanceNode() {
            const currentNode = stato.stsMapNodes.find(n => n.id === stato.currentNodeId);
            if(currentNode) {
                currentNode.done = true;
                currentNode.active = false;
                stato.stsMapNodes.forEach(n => { if(n.level === currentNode.level && n.active) n.active = false; });

                if(currentNode.next.length === 0) {
                    showScreen('screenVictory');
                    return;
                }

                currentNode.next.forEach(nextId => {
                    const nextNode = stato.stsMapNodes.find(n => n.id === nextId);
                    if(nextNode) nextNode.active = true;
                });
            }
            startMap();
        }

        const NODE_ICON = { combat: 'sword', elite: 'skull', challenge: 'question', rest: 'fire', merchant: 'pouch', treasure: 'chest', story: 'book', captain: 'crown' };
        const NODE_LABEL = { combat: 'Scontro', elite: 'Scontro Elite', challenge: 'Sfida', rest: 'Riposo', merchant: 'Mercante', treasure: 'Tesoro', story: 'Trama', captain: 'Meta' };

        // Video del nemico nello scontro (campo "video" del bestiario, pensato per elite e boss):
        // se c'è, prende il posto dell'immagine; se manca o non si carica resta l'immagine
        function setCombatVideo(src) {
            const video = document.getElementById('combatVideo');
            const img = document.getElementById('combatImg');
            if (!video || !img) return;
            if (!src) {
                video.pause();
                video.removeAttribute('src');
                video.classList.add('hidden');
                img.classList.remove('hidden');
                return;
            }
            video.muted = true;
            video.onerror = () => setCombatVideo(null);
            video.src = src;
            video.classList.remove('hidden');
            img.classList.add('hidden');
            video.play().catch(() => {});
        }

        function renderMapLegend() {
            // Si ricostruisce ogni volta: la campagna (e i suoi tipi di nodo) può cambiare fra una partita e l'altra
            const legend = document.getElementById('mapLegend');
            const presenti = new Set(stato.stsMapNodes.map(n => n.type));
            legend.innerHTML = ['combat', 'elite', 'challenge', 'treasure', 'merchant', 'rest', 'story'].filter(t => t !== 'story' || presenti.has(t)).map(type => `
                <span><span class="sts-node node-${type} legend-dot">${svgIcon(NODE_ICON[type])}</span>${NODE_LABEL[type]}</span>
            `).join('') + `<span><span class="sts-node node-goal legend-dot">${svgIcon('crown')}</span>Meta</span>`;
        }

        /* ---------- Segnaposto per le immagini dei nodi che mancano ----------
           Se il file dell'immagine non esiste (nodo o nemico del bestiario) si mostra
           immagini/segnaposto/<tipo>.svg: scena cupa con l'icona del tipo di nodo. */
        const EVENT_IMG_PLACEHOLDER = { combatImg: 'combat', challengeImg: 'challenge', restImg: 'rest', merchantImg: 'merchant', treasureImg: 'treasure', storyImg: 'treasure' };
        document.addEventListener('DOMContentLoaded', () => {
            Object.entries(EVENT_IMG_PLACEHOLDER).forEach(([imgId, type]) => {
                const img = document.getElementById(imgId);
                if (!img) return;
                img.addEventListener('error', () => {
                    if (img.src.includes('immagini/segnaposto/')) return;
                    const node = stato.stsMapNodes && stato.stsMapNodes.find(n => n.id === stato.currentNodeId);
                    const kind = node && node.type === 'elite' && type === 'combat' ? 'elite' : type;
                    img.src = `immagini/segnaposto/${kind}.svg`;
                });
            });
        });
