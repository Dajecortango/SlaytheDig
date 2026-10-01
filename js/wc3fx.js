/* =========================================================================
   EFFETTI "WARCRAFT III" CON GSAP (js/vendor/gsap.min.js)
   - Pannelli appesi alle catene: scendono, rimbalzano e oscillano come un
     pendolo che si smorza; poi restano in un leggero dondolio continuo.
     Passando il mouse sul pannello ricevono una piccola spinta.
   - Finestre (#wc3Modal): scendono appese alle catene con lo stesso pendolo.
   - Pulsanti: dopo la pressione tornano su con un piccolo rimbalzo elastico.
   Caricato dopo js/game.js: avvolge showScreen e openModal. Senza GSAP, o con
   le animazioni disattivate, il gioco resta quello di prima (solo CSS).
   ========================================================================= */
(function () {
    const gsap = window.gsap;
    if (!gsap) return;

    const fxOn = () => typeof animationsEnabled !== 'function' || animationsEnabled();

    /* ---------- Pannelli appesi ----------
       Struttura: .wc-hang (discesa e spinte) > .wc-sway (dondolio continuo) > catene + pannello.
       Entrambi ruotano attorno al punto in alto al centro, dove sono agganciate le catene. */
    function prepareHang(hang) {
        if (hang.querySelector(':scope > .wc-sway')) return hang.querySelector(':scope > .wc-sway');
        const sway = document.createElement('div');
        sway.className = 'wc-sway';
        while (hang.firstChild) sway.appendChild(hang.firstChild);
        hang.appendChild(sway);
        gsap.set([hang, sway], { transformOrigin: '50% 0%' });

        // Ogni catena oscilla un po' per conto suo, sfasata rispetto all'altra
        sway.querySelectorAll('.wc-chains span').forEach((chain, i) => {
            gsap.set(chain, { transformOrigin: '50% 0%' });
            gsap.to(chain, { rotation: i % 2 ? -0.9 : 0.9, duration: 2.6 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.7 });
        });

        // Spinta quando il mouse entra nel pannello: piccola rotazione che si smorza
        const panel = sway.querySelector('.wc-panel');
        if (panel) {
            panel.addEventListener('mouseenter', e => {
                if (!fxOn()) return;
                const rect = panel.getBoundingClientRect();
                const side = e.clientX < rect.left + rect.width / 2 ? 1 : -1;
                gsap.fromTo(hang, { rotation: side * 0.9 }, { rotation: 0, duration: 1.6, ease: 'elastic.out(1, 0.22)', overwrite: 'auto' });
            });
        }
        return sway;
    }

    function startIdleSway(sway, i) {
        gsap.killTweensOf(sway);
        gsap.set(sway, { rotation: -0.35 });
        gsap.to(sway, { rotation: 0.35, duration: 3.2 + i * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.3 });
    }

    // Discesa dall'alto con rimbalzo, poi pendolo smorzato e tintinnio delle catene
    function dropHangs(screen) {
        const hangs = [...screen.querySelectorAll('.wc-hang')];
        hangs.forEach((hang, i) => {
            const sway = prepareHang(hang);
            gsap.killTweensOf(hang);
            if (!fxOn()) { gsap.set(hang, { clearProps: 'transform,opacity' }); gsap.set(sway, { rotation: 0 }); return; }
            // Scende dalla propria altezza (non attraversa gli altri pannelli) e compare in dissolvenza
            const fromY = -(hang.offsetHeight * 0.6 + 60);
            gsap.timeline({ delay: 0.08 + i * 0.22 })
                .fromTo(hang, { y: fromY, rotation: 0, opacity: 0 }, { y: 0, duration: 0.75, ease: 'bounce.out' })
                .to(hang, { opacity: 1, duration: 0.25, ease: 'none' }, 0)
                .call(() => { if (typeof synthSfx === 'function') synthSfx('chain'); }, null, 0.45)
                .fromTo(hang, { rotation: (i % 2 ? -1 : 1) * 2.4 }, { rotation: 0, duration: 2.4, ease: 'elastic.out(1, 0.18)' }, 0.5);
            startIdleSway(sway, i);
        });
    }

    /* ---------- Finestre ---------- */
    function dropModal() {
        const box = document.querySelector('#wc3Modal .modal-box');
        if (!box || !fxOn()) return;
        box.classList.remove('modal-drop');  // la sostituisce l'animazione GSAP
        gsap.killTweensOf(box);
        gsap.set(box, { transformOrigin: '50% -300px' });
        gsap.timeline()
            .fromTo(box, { y: -window.innerHeight * 0.6, rotation: 0, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'back.out(1.4)' })
            .fromTo(box, { rotation: -1.8 }, { rotation: 0, duration: 1.8, ease: 'elastic.out(1, 0.2)' }, 0.3)
            .set(box, { clearProps: 'transform,opacity' });
    }

    /* ---------- Pulsanti: rimbalzo al rilascio ---------- */
    document.addEventListener('pointerup', e => {
        const btn = e.target.closest && e.target.closest('button');
        if (!btn || btn.disabled || !fxOn() || btn.matches('.armory-btn, .card-back, .loot-card-back, .carousel-dot')) return;
        gsap.fromTo(btn, { y: 3, scale: 0.985 }, { y: 0, scale: 1, duration: 0.45, ease: 'elastic.out(1.1, 0.45)', clearProps: 'transform' });
    });

    /* ---------- Aggancio alle funzioni del gioco ---------- */
    if (typeof window.showScreen === 'function') {
        const baseShowScreen = window.showScreen;
        window.showScreen = function (screenId) {
            const wasVisible = !document.getElementById(screenId)?.classList.contains('hidden');
            const result = baseShowScreen.apply(this, arguments);
            const screen = document.getElementById(screenId);
            if (screen && !wasVisible && screen.querySelector('.wc-hang')) dropHangs(screen);
            return result;
        };
    }

    if (typeof window.openModal === 'function') {
        const baseOpenModal = window.openModal;
        window.openModal = function () {
            const wasHidden = document.getElementById('wc3Modal')?.classList.contains('hidden');
            const result = baseOpenModal.apply(this, arguments);
            if (wasHidden) dropModal();
            return result;
        };
    }

    // Schermata già visibile al caricamento (menu iniziale)
    const start = document.querySelector('.wc-menu-screen:not(.hidden)');
    if (start) dropHangs(start);
})();
