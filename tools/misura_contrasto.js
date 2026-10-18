// Misura della leggibilità del testo dentro la pagina (usata da tools/prova_browser.mjs --contrasto).
// Funzione (selettore) => [{ dove, testo, problemi, px }]: contrasto WCAG fra colore del testo e sfondo sotto
// (colori pieni composti dai genitori; sopra un'immagine o una texture si usa un marrone come quello delle
// texture di pietra e cuoio, sopra la pergamena la sua tinta media), alone colorato su testo piccolo, gradiente fuori dai titoli, testo sotto 11px.
(dove => {
    const SFONDO_IMMAGINE = [58, 44, 28];
    const SFONDO_PERGAMENA = [206, 178, 128];  // tinta media della pergamena (texture più vignettatura ai bordi)
    const lum = ([r, g, b]) => {
        const f = c => (c /= 255) <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const rapporto = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const rgba = s => {
        const m = String(s).match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1];
    };
    const mescola = (sopra, sotto) => sopra.slice(0, 3).map((c, i) => c * sopra[3] + sotto[i] * (1 - sopra[3]));
    function sfondo(el) {
        const strati = [];
        for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
            const st = getComputedStyle(n);
            // Strati di un elemento dall'alto: gradienti lineari (media dei loro colori), immagine, colore di fondo
            const bgi = st.backgroundImage || '';
            (bgi.match(/linear-gradient\((?:[^()]|\([^()]*\))*\)/g) || []).forEach(g => {
                const cols = (g.match(/rgba?\([^)]+\)/g) || []).map(rgba).filter(Boolean);
                if (cols.length) strati.push([0, 1, 2, 3].map(i => cols.reduce((s, x) => s + x[i], 0) / cols.length));
            });
            if (strati.length && strati[strati.length - 1][3] >= 0.95) break;
            // Il rumore in SVG (--noise-fine, --noise-cloud) è una velatura, non uno sfondo
            const img = /url\((?!"?data:image\/svg)/.test(bgi);
            if (img || n.tagName === 'IMG' || n.tagName === 'VIDEO') { strati.push([...(img && /pergamena/.test(bgi) ? SFONDO_PERGAMENA : SFONDO_IMMAGINE), 1]); break; }
            const c = rgba(st.backgroundColor);
            if (c && c[3] > 0) strati.push(c);
            if (c && c[3] >= 1) break;
        }
        let col = [0, 0, 0];
        for (let i = strati.length - 1; i >= 0; i--) col = mescola(strati[i], col);
        return col;
    }
    const visibile = el => {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight) return false;
        for (let n = el; n; n = n.parentElement) {
            const st = getComputedStyle(n);
            if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
        }
        return true;
    };
    const nome = el => !el ? '' : el.id ? '#' + el.id : el.tagName.toLowerCase() + [...el.classList].filter(c => !/^(show|hidden|is-|active|done)/.test(c)).slice(0, 2).map(c => '.' + c).join('');
    const titolo = el => !!el.closest('h1,h2,h3,.wc-heading,[class*="title"],[class*="banner"],.victory-stamp');
    const out = [];
    const radice = document.querySelector(dove) || document.body;
    const elementi = [...radice.querySelectorAll('*')].filter(el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1));
    for (const el of elementi) {
        if (el.closest('script,style,#screenCurtain,.hidden,option,select') || !visibile(el)) continue;
        const st = getComputedStyle(el);
        const px = parseFloat(st.fontSize);
        const grande = px >= 24 || (px >= 18.66 && Number(st.fontWeight) >= 700);
        let op = 1;
        for (let n = el; n; n = n.parentElement) op *= Number(getComputedStyle(n).opacity);
        const problemi = [];
        const clip = st.webkitBackgroundClip || st.backgroundClip || '';
        const c = rgba(st.color);
        if (/text/.test(clip) && c && c[3] === 0) {
            if (!titolo(el)) problemi.push('gradiente fuori da un titolo');
        } else if (c) {
            const bg = sfondo(el);
            const r = rapporto(mescola([...c.slice(0, 3), c[3] * op], bg), bg);
            const minimo = grande ? 3 : 4.5;
            if (r < minimo) problemi.push(`contrasto ${r.toFixed(1)} (min ${minimo})`);
        }
        // Alone colorato (sfocatura di 4px o più, colore non nero) su testo piccolo
        const ombre = (st.textShadow || '').split(/,(?![^(]*\))/);
        if (!grande && ombre.some(o => { const col = rgba(o); const nums = (o.replace(/rgba?\([^)]*\)/, '').match(/-?[\d.]+px/g) || []).map(parseFloat); return col && col[3] > 0.15 && (col[0] + col[1] + col[2]) > 90 && (nums[2] || 0) >= 4; })) problemi.push('alone colorato su testo piccolo');
        if (px < 11) problemi.push(`testo piccolo (${px.toFixed(1)}px)`);
        if (problemi.length) out.push({ dove: nome(el.parentElement) + ' > ' + nome(el), testo: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40), problemi, px: Math.round(px) });
    }
    return out;
})
