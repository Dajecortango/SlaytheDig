/* ==========================================================================
   RITRATTI DEGLI EROI
   Ritratti dai dati (data/libreria/eroi.js e campagne), ritratto da ferito con 2 HP
   o meno, cinematica d'attacco con il volto in primo piano.
   Diviso da js/game.js: stesso ambito globale (usa stato, LIBRERIA, showScreen...).
   Caricato dopo js/game.js; le funzioni si chiamano tra file solo dopo il caricamento
   (l'avvio vero e proprio è in js/avvio.js, caricato per ultimo).
   ========================================================================== */

        // Ritratti degli eroi per nome, presi dai dati (data/libreria/eroi.js e dagli eroi delle campagne):
        // src / woundedSrc = immagini normale e da ferito; pos = punto dell'immagine da tenere al centro,
        // zoom = ingrandimento sul volto nell'icona (woundedPos / woundedZoom per il ritratto da ferito);
        // strikeZoom = ingrandimento nella cinematica d'attacco. Senza ritratto si usa l'iniziale.
        // Valori predefiniti, soglia del ferito e strikeZoomFor sono in js/comune.js (li usa anche l'editor).
        const HERO_PORTRAITS = {};

        function heroPortraitFromData(h) {
            const pos = h.portraitPos || HERO_PORTRAIT_DEFAULTS.pos;
            const zoom = Number(h.portraitZoom) || HERO_PORTRAIT_DEFAULTS.zoom;
            const p = { src: h.portrait, pos, zoom, strikeZoom: Number(h.portraitStrikeZoom) || strikeZoomFor(zoom) };
            if (h.portraitWounded) {
                p.woundedSrc = h.portraitWounded;
                p.woundedPos = h.portraitWoundedPos || pos;
                p.woundedZoom = Number(h.portraitWoundedZoom) || zoom;
                new Image().src = h.portraitWounded; // precaricato per evitare lo sfarfallio al cambio
            }
            return p;
        }

        // Registra i ritratti di un elenco di eroi (con override = false non tocca quelli già noti)
        function registerHeroPortraits(heroes, override = true) {
            (heroes || []).forEach(h => {
                if (!h || !h.name || !h.portrait) return;
                if (!override && HERO_PORTRAITS[h.name]) return;
                HERO_PORTRAITS[h.name] = heroPortraitFromData(h);
            });
        }
        registerHeroPortraits(Object.values(LIBRERIA.eroi || {}));

        // Gli eroi della campagna (risolti dalla libreria, o scritti nella campagna, o in prova dall'editor
        // con le immagini non ancora salvate) aggiornano i ritratti della libreria.
        function registerCampaignHeroPortraits(heroes) {
            registerHeroPortraits(heroes);
        }

        // Un eroe è ferito quando ha WOUNDED_HP (2) o meno, ma è ancora in piedi
        function isHeroWounded(hp) {
            return typeof hp === 'number' && hp > 0 && hp <= WOUNDED_HP;
        }

        // Ritratto ferito: usa woundedSrc se presente, altrimenti applica l'effetto grafico "ferito"
        function heroPortraitInner(name, hp, maxHp) {
            const p = HERO_PORTRAITS[name];
            const wounded = isHeroWounded(hp);
            const woundFx = '<span class="wound-fx" aria-hidden="true"></span>';
            if (!p) return `<span>${name.charAt(0)}</span>${wounded ? woundFx : ''}`;
            // Con un ritratto ferito dedicato basta l'immagine; senza, si usa l'effetto grafico
            if (wounded && p.woundedSrc) {
                const pos = p.woundedPos || p.pos;
                const zoom = p.woundedZoom || p.zoom;
                return `<img class="portrait-img" src="${p.woundedSrc}" alt="${name}" style="object-position:${pos}; transform:scale(${zoom}); transform-origin:${pos};">`;
            }
            const imgClass = wounded ? 'portrait-img is-wounded' : 'portrait-img';
            return `<img class="${imgClass}" src="${p.src}" alt="${name}" style="object-position:${p.pos}; transform:scale(${p.zoom}); transform-origin:${p.pos};">${wounded ? woundFx : ''}`;
        }

        // Cinematica d'attacco, solo per i colpi a segno: il ritratto dell'eroe attraversa
        // una banda diagonale e colpisce. Con un'abilità (ability non nullo) la cinematica
        // è più lunga e marcata: raggi, doppio taglio a X, scintille e nome dell'abilità.
        // Senza ritratto o con animazioni disattivate si passa subito al risultato.
        // Un click sulla cinematica la salta.
        function playHeroStrike(hero, ability, onDone) {
            const p = HERO_PORTRAITS[hero.name];
            if (!p || !animationsEnabled()) { onDone(); return; }
            const wounded = p.woundedSrc && isHeroWounded(hero.hp);
            const src = wounded ? p.woundedSrc : p.src;
            const pos = wounded ? (p.woundedPos || p.pos) : p.pos;
            // Volto ingrandito come nell'icona (ma meno): la banda è larga e bassa
            const zoom = Number(p.strikeZoom) || strikeZoomFor(wounded ? (p.woundedZoom || p.zoom) : p.zoom);

            const sparks = ability
                ? Array.from({ length: 14 }, (_, i) => `<span style="--a:${i * (360 / 14)}deg; --d:${140 + (i % 3) * 70}px;"></span>`).join('')
                : '';
            const overlay = document.createElement('div');
            overlay.className = `strike-cine${ability ? ' ability' : ''}`;
            overlay.setAttribute('aria-hidden', 'true');
            overlay.innerHTML = `
                ${ability ? '<div class="strike-rays"></div>' : ''}
                <div class="strike-band">
                    <div class="strike-lines"></div>
                    <div class="strike-hero"><img src="${src}" alt="" style="object-position:${pos}; transform-origin:${pos}; transform:scale(${zoom});"></div>
                    <div class="strike-name">${esc(hero.name)}</div>
                    ${ability ? `<div class="strike-ability"><span>Abilità</span>${esc(ability.name)}</div>` : ''}
                </div>
                <div class="strike-slash"></div>
                ${ability ? '<div class="strike-slash second"></div><div class="strike-sparks">' + sparks + '</div>' : ''}
                <div class="strike-flash"></div>`;
            document.body.appendChild(overlay);

            let finished = false;
            const finish = () => {
                if (finished) return;
                finished = true;
                clearTimeout(timer);
                overlay.remove();
                onDone();
            };
            const timer = setTimeout(finish, ability ? 1700 : 1150);
            overlay.addEventListener('click', finish);
        }

        function heroPortraitClass(name) {
            return HERO_PORTRAITS[name] ? 'has-portrait' : '';
        }

        const HERO_HUES = [4, 212, 38, 285, 130];
        function heroHue(name) {
            const idx = campaignHeroes.findIndex(b => b.name === name);
            if (idx >= 0) return HERO_HUES[idx % HERO_HUES.length];
            let hash = 0;
            for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
            return hash;
        }
