/* ==========================================================================
   AUDIO
   Musica (menu, scontri, elite) con dissolvenze incrociate tra due lettori,
   effetti sonori dei nemici, suoni generati con Web Audio, clic, silenziamento.
   Diviso da js/game.js: stesso ambito globale (usa stato, LIBRERIA, showScreen...).
   Caricato dopo js/game.js; le funzioni si chiamano tra file solo dopo il caricamento
   (l'avvio vero e proprio è in js/avvio.js, caricato per ultimo).
   ========================================================================== */

        /* ---------- Audio: musica dei menu ed effetti sonori ---------- */
        const MENU_MUSIC_SCREENS = ['screenStart', 'screenCampaigns', 'screenParty'];
        let currentAudioScreen = 'screenStart';
        // Tema dei menu (dalla schermata iniziale fino alla scelta di eroi ed equipaggiamento)
        const MENU_THEME = 'audio/temi/menu_theme.ogg';
        // Temi degli scontri normali: uno per scontro, a rotazione 1, 2, 3, 1, ...
        const COMBAT_THEMES = ['audio/temi/combat_theme_1.ogg', 'audio/temi/combat_theme_2.ogg', 'audio/temi/combat_theme_3.ogg'];
        // Tema degli scontri elite: sempre lo stesso, non fa avanzare la rotazione degli scontri normali
        const ELITE_THEME = 'audio/temi/elite_theme_1.ogg';
        // Tema dei riposi (schermata del riposo)
        const REST_THEME = 'audio/temi/rest_theme.ogg';
        // Tema delle prove (schermata della sfida)
        const CHALLENGE_THEME = 'audio/temi/challenge_theme.ogg';
        // Tema della mappa (scelta dei nodi): tornando sulla mappa riprende dal punto in cui era rimasto
        const MAP_THEME = 'audio/temi/map_theme.ogg';
        // Brani che riprendono da dove erano stati interrotti invece di ripartire da capo
        const RESUMABLE_THEMES = [MAP_THEME];
        const musicResumeAt = {};  // brano -> secondi a cui era arrivato quando è stato interrotto
        let combatThemeSrc = null; // tema dello scontro in corso, null = nessuna musica
        let soundMuted = false;
        try { soundMuted = localStorage.getItem('dignitas_muted') === '1'; } catch (e) {}

        // Durate delle dissolvenze dei temi (ms): entrata, uscita e incrocio quando il brano ricomincia
        const MUSIC_FADE_IN = 3000;
        const MUSIC_FADE_OUT = 2500;
        const MUSIC_LOOP_CROSSFADE = 4000;

        // Due lettori (#musicA e #musicB in index.html) si passano la musica: quando il brano cambia
        // (menu -> scontro, scontro -> elite...) o ricomincia da capo, uno sfuma mentre l'altro sale.
        let musicActive = null; // lettore che suona (o sta salendo con) il brano voluto
        const musicDecks = () => [document.getElementById('musicA'), document.getElementById('musicB')];

        // Dissolvenza a tempo con curva morbida: l'entrata parte piano, l'uscita cala subito e si spegne dolcemente
        function fadeMusicTo(music, target, duration, onDone) {
            clearInterval(music.fadeTimer);
            const from = music.volume;
            const start = performance.now();
            music.fadeTimer = setInterval(() => {
                const p = Math.min(1, (performance.now() - start) / duration);
                const eased = target > from ? p * p : 1 - (1 - p) * (1 - p);
                music.volume = Math.min(1, Math.max(0, from + (target - from) * eased));
                if (p >= 1) {
                    clearInterval(music.fadeTimer);
                    if (onDone) onDone();
                }
            }, 40);
        }

        // Fa partire un lettore con il brano "src" dal secondo "startAt" (0 = da capo), salendo da zero
        function startMusicDeck(deck, src, duration, startAt = 0) {
            setupMusicDeck(deck);
            clearInterval(deck.fadeTimer);
            deck.loopOutgoing = false;
            if (deck.getAttribute('src') !== src) deck.src = src;
            const seek = () => { try { deck.currentTime = startAt; } catch (e) {} };
            // Con un brano appena caricato la posizione si può impostare solo quando se ne conosce la durata
            if (startAt > 0 && deck.readyState < 1) deck.addEventListener('loadedmetadata', seek, { once: true });
            else seek();
            deck.volume = 0;
            deck.play().then(() => fadeMusicTo(deck, gameOptions.musicVolume, duration)).catch(() => {
                // Il browser blocca l'audio finché l'utente non interagisce con la pagina: riprova unlockAudioOnce
            });
        }

        function stopMusicDeck(deck, duration) {
            if (deck.paused) return;
            fadeMusicTo(deck, 0, duration, () => { deck.pause(); deck.loopOutgoing = false; });
        }

        // Al posto di "loop": negli ultimi secondi il brano sfuma mentre l'altro lettore lo fa ripartire da capo
        function setupMusicDeck(deck) {
            if (deck.musicReady) return;
            deck.musicReady = true;
            deck.addEventListener('timeupdate', () => {
                if (deck !== musicActive || deck.loopOutgoing || !isFinite(deck.duration)) return;
                if (deck.duration - deck.currentTime > MUSIC_LOOP_CROSSFADE / 1000) return;
                const next = musicDecks().find(d => d !== deck);
                deck.loopOutgoing = true;
                startMusicDeck(next, deck.getAttribute('src'), MUSIC_LOOP_CROSSFADE);
                stopMusicDeck(deck, MUSIC_LOOP_CROSSFADE);
                musicActive = next;
            });
            // Riserva: se il brano finisce senza incrocio (es. scheda in secondo piano) riparte da capo
            deck.addEventListener('ended', () => {
                if (deck === musicActive) startMusicDeck(deck, deck.getAttribute('src'), MUSIC_FADE_IN);
            });
        }

        // Porta la musica al brano "src" (null = silenzio) con una dissolvenza incrociata
        function setMusic(src) {
            const decks = musicDecks();
            // Un lettore che suona già questo brano (anche mentre sfuma) viene tenuto e riportato su
            const keep = src ? decks.find(d => !d.paused && !d.loopOutgoing && d.getAttribute('src') === src) : null;
            // Un brano che riprende (es. la mappa) ricorda dove era arrivato prima di sfumare via
            decks.forEach(d => {
                const dSrc = d.getAttribute('src');
                if (d !== keep && d === musicActive && !d.paused && RESUMABLE_THEMES.includes(dSrc)) musicResumeAt[dSrc] = d.currentTime;
            });
            decks.forEach(d => { if (d !== keep && !(d.loopOutgoing && d.getAttribute('src') === src)) stopMusicDeck(d, MUSIC_FADE_OUT); });
            if (!src) { musicActive = null; return; }
            if (keep) {
                musicActive = keep;
                fadeMusicTo(keep, gameOptions.musicVolume, MUSIC_FADE_IN);
                return;
            }
            const deck = decks.find(d => d.paused) || decks.find(d => d !== musicActive);
            musicActive = deck;
            // Ripresa dal punto lasciato, salvo che manchi così poco alla fine da ricominciare comunque da capo
            let startAt = musicResumeAt[src] || 0;
            delete musicResumeAt[src];
            const length = deck.getAttribute('src') === src && isFinite(deck.duration) ? deck.duration : Infinity;
            if (length - startAt <= MUSIC_LOOP_CROSSFADE / 1000 + 1) startAt = 0;
            startMusicDeck(deck, src, MUSIC_FADE_IN, startAt);
        }

        // Brano della schermata attiva: tema dei menu, tema dello scontro in corso, tema del riposo, tema delle prove, tema della mappa oppure silenzio
        function updateMenuMusic(screenId) {
            if (screenId) currentAudioScreen = screenId;
            if (MENU_MUSIC_SCREENS.includes(currentAudioScreen)) setMusic(MENU_THEME);
            else if (currentAudioScreen === 'screenCombat') setMusic(combatThemeSrc);
            else if (currentAudioScreen === 'screenRest') setMusic(REST_THEME);
            else if (currentAudioScreen === 'screenChallenge') setMusic(CHALLENGE_THEME);
            else if (currentAudioScreen === 'screenMap') { setMusic(MAP_THEME); preloadNextThemes(); }
            else setMusic(null);
        }

        // Sulla mappa il browser carica in anticipo i brani che possono servire al prossimo nodo
        // (prossimo tema degli scontri a rotazione, elite, riposo, prove): al cambio niente silenzio d'attesa.
        // Ogni brano si carica una volta sola; i lettori tengono il riferimento perché non venga scartato.
        const preloadedThemes = {};
        function preloadNextThemes() {
            if (soundMuted || !gameOptions.musicVolume) return;
            const nextCombat = COMBAT_THEMES[((stato.expeditionStats && stato.expeditionStats.combatThemes) || 0) % COMBAT_THEMES.length];
            [nextCombat, ELITE_THEME, REST_THEME, CHALLENGE_THEME].forEach(src => {
                if (preloadedThemes[src]) return;
                const a = new Audio();
                a.preload = 'auto';
                a.src = src;
                a.load();
                preloadedThemes[src] = a;
            });
        }

        // Sceglie il tema del prossimo scontro: elite col proprio tema, scontri normali a rotazione
        function chooseCombatTheme(node) {
            if (node.type === 'elite') { combatThemeSrc = ELITE_THEME; return; }
            if (node.type !== 'combat') { combatThemeSrc = null; return; }
            combatThemeSrc = COMBAT_THEMES[stato.expeditionStats.combatThemes % COMBAT_THEMES.length];
            stato.expeditionStats.combatThemes++;
        }

        // Riproduce un effetto sonoro rispettando il silenziamento globale
        function playSfx(src, volume = 0.7) {
            if (soundMuted) return;
            const sfx = new Audio(src);
            sfx.volume = Math.min(1, volume * gameOptions.sfxVolume);
            sfx.play().catch(() => {});
        }

        // Suoni propri del nemico in combattimento (campi sfxAttack, sfxHit, sfxDeath del bestiario).
        // Restituisce false se lo slot è vuoto, così chi chiama può usare il suono generato.
        function playEnemySfx(slot) {
            const src = stato.activeEnemy && stato.activeEnemy[slot];
            if (!src) return false;
            playSfx(src, 0.9);
            return true;
        }

        // Suoni dei colpi generati con Web Audio (nessun file audio necessario):
        // 'armor' = clangore metallico, 'hit' = colpo sordo sugli HP di un eroe, 'enemy' = colpo sul nemico
        let sfxCtx = null;
        function synthSfx(kind) {
            if (soundMuted || !gameOptions.sfxVolume) return;
            try { sfxCtx = sfxCtx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
            const ctx = sfxCtx;
            if (ctx.state === 'suspended') ctx.resume();
            const t = ctx.currentTime;
            const out = ctx.createGain();
            out.gain.value = 0.5 * gameOptions.sfxVolume;
            out.connect(ctx.destination);

            // Tono breve con inviluppo che si spegne: base per i suoni leggeri (passaggio del mouse, dadi)
            const tone = (type, from, to, start, dur, peak, target = out) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(from, t + start);
                osc.frequency.exponentialRampToValueAtTime(to, t + start + dur);
                gain.gain.setValueAtTime(0.0001, t + start);
                gain.gain.exponentialRampToValueAtTime(peak, t + start + 0.008);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + start + dur);
                osc.connect(gain).connect(target);
                osc.start(t + start);
                osc.stop(t + start + dur + 0.02);
            };
            // Colpetto di rumore filtrato (legno/osso che batte)
            const tick = (start, freq, peak) => {
                const len = Math.floor(ctx.sampleRate * 0.03);
                const buf = ctx.createBuffer(1, len, ctx.sampleRate);
                const d = buf.getChannelData(0);
                for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
                const src = ctx.createBufferSource();
                src.buffer = buf;
                const band = ctx.createBiquadFilter();
                band.type = 'bandpass';
                band.frequency.value = freq;
                band.Q.value = 2.5;
                const g = ctx.createGain();
                g.gain.value = peak;
                src.connect(band).connect(g).connect(out);
                src.start(t + start);
            };

            if (kind === 'hover') {
                // Leggero "tic" metallico al passaggio del mouse sui pulsanti
                tone('sine', 1900, 1500, 0, 0.05, 0.05);
                return;
            }
            if (kind === 'dice') {
                // Dadi che rotolano: colpetti irregolari per circa mezzo secondo
                let at = 0;
                for (let i = 0; i < 8; i++) {
                    tick(at, 1800 + Math.random() * 1600, 0.35 + Math.random() * 0.3);
                    at += 0.04 + Math.random() * 0.04;
                }
                return;
            }
            if (kind === 'flip') {
                // Carta che si gira: fruscio breve che sale di tono
                const len = Math.floor(ctx.sampleRate * 0.16);
                const buf = ctx.createBuffer(1, len, ctx.sampleRate);
                const d = buf.getChannelData(0);
                for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / len);
                const src = ctx.createBufferSource();
                src.buffer = buf;
                const band = ctx.createBiquadFilter();
                band.type = 'bandpass';
                band.Q.value = 1.2;
                band.frequency.setValueAtTime(900, t);
                band.frequency.exponentialRampToValueAtTime(3200, t + 0.16);
                const g = ctx.createGain();
                g.gain.value = 0.5;
                src.connect(band).connect(g).connect(out);
                src.start(t);
                return;
            }
            if (kind === 'dice-land') {
                tick(0, 1200, 0.6);
                return;
            }
            if (kind === 'six') {
                // 6 naturale: accordo luminoso ascendente
                tick(0, 1200, 0.6);
                [660, 880, 1320].forEach((f, i) => tone('triangle', f, f, 0.03 + i * 0.07, 0.45, 0.16));
                return;
            }
            if (kind === 'one') {
                // 1 naturale: nota grave che scende
                tick(0, 900, 0.6);
                const low = ctx.createBiquadFilter();
                low.type = 'lowpass';
                low.frequency.value = 900;
                low.connect(out);
                tone('sawtooth', 220, 95, 0.03, 0.45, 0.2, low);
                return;
            }

            if (kind === 'chain') {
                // Tintinnio di catene: colpetti metallici acuti, sempre più deboli
                [0, 0.05, 0.1, 0.17, 0.25, 0.34].forEach((s, i) => tick(s, 2600 + Math.random() * 1800, 0.35 / (1 + i * 0.5)));
                return;
            }

            if (kind === 'armor') {
                // Toni acuti non armonici che si spengono in fretta, come metallo colpito
                [880, 1370, 2120].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'square';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.18 / (i + 1), t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
                    osc.connect(gain).connect(out);
                    osc.start(t);
                    osc.stop(t + 0.4);
                });
                return;
            }

            // Colpo sordo: breve rumore filtrato più un tonfo grave che scende di tono
            const low = kind === 'enemy' ? 90 : 130;
            const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.15), ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = kind === 'enemy' ? 900 : 600;
            const noiseGain = ctx.createGain();
            noiseGain.gain.value = 0.6;
            noise.connect(filter).connect(noiseGain).connect(out);
            noise.start(t);

            const thud = ctx.createOscillator();
            const thudGain = ctx.createGain();
            thud.type = 'sine';
            thud.frequency.setValueAtTime(low, t);
            thud.frequency.exponentialRampToValueAtTime(45, t + 0.2);
            thudGain.gain.setValueAtTime(0.7, t);
            thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            thud.connect(thudGain).connect(out);
            thud.start(t);
            thud.stop(t + 0.3);
        }

        function diceOutcomeSfx(value) {
            synthSfx(value === 6 ? 'six' : value === 1 ? 'one' : 'dice-land');
        }

        // Suono leggero al passaggio del mouse su pulsanti e schede (una volta per elemento, non sui disattivati)
        let lastHoverTarget = null;
        let lastHoverTime = 0;
        document.addEventListener('mouseover', e => {
            const target = e.target.closest(CLICKABLE_SELECTOR);
            if (target === lastHoverTarget) return;
            lastHoverTarget = target;
            if (!target || target.disabled) return;
            const now = performance.now();
            if (now - lastHoverTime < 45) return;
            lastHoverTime = now;
            synthSfx('hover');
        });

        // Suono di clic su ogni pulsante e scheda cliccabile, in tutte le schermate
        const CLICK_SFX = 'audio/click.ogg';
        const CLICKABLE_SELECTOR = 'button, [role="button"], .campaign-card, .armory-btn';
        const clickSfxPreload = new Audio(CLICK_SFX);
        clickSfxPreload.preload = 'auto';

        document.addEventListener('click', e => {
            const target = e.target.closest(CLICKABLE_SELECTOR);
            if (!target || target.disabled) return;
            playSfx(CLICK_SFX, 0.8);
        }, true);

        function applySoundState() {
            // Il video dei menu resta sempre muto
            document.querySelectorAll('audio, video:not(#menuVideo)').forEach(media => { media.muted = soundMuted; });
        }

        // Il silenziamento si imposta dalla finestra Opzioni
        function setSoundMuted(muted) {
            soundMuted = muted;
            try { localStorage.setItem('dignitas_muted', soundMuted ? '1' : '0'); } catch (e) {}
            applySoundState();
            updateMenuMusic();
        }

        // I browser avviano l'audio solo dopo la prima interazione dell'utente
        function unlockAudioOnce() {
            updateMenuMusic();
            document.removeEventListener('pointerdown', unlockAudioOnce);
            document.removeEventListener('keydown', unlockAudioOnce);
        }
        document.addEventListener('pointerdown', unlockAudioOnce);
        document.addEventListener('keydown', unlockAudioOnce);

        window.addEventListener('DOMContentLoaded', () => {
            applySoundState();
            updateMenuMusic('screenStart');
        });
