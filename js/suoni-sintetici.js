/* ==========================================================================
   SUONI GENERATI
   Effetti generati con Web Audio, senza file: li usa il gioco (synthSfx in js/audio.js)
   e la pagina dei giocatori della partita online (server/public/online.js), che li
   riceve dal master. Niente dipendenze dal resto del gioco.
   ========================================================================== */
// Suoni dei colpi generati con Web Audio (nessun file audio necessario):
// 'armor' = clangore metallico, 'hit' = colpo sordo sugli HP di un eroe, 'enemy' = colpo sul nemico
// 'whoosh' = colpo a vuoto, 'parry' = parata, 'drum' = tamburo del boss, 'roar' = boato, 'boom' = esplosione,
// 'swell' = crescendo (durata in secondi nel secondo argomento), 'step-<terreno>' = passo sulla mappa
// volume = 0..1 (il volume degli effetti delle Opzioni)
let sfxCtx = null;
function suonoSintetico(kind, durata = 0.6, volume = 1) {
    try { sfxCtx = sfxCtx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    const ctx = sfxCtx;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.value = 0.5 * volume;
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

    // Rumore che passa da un filtro che si sposta da "from" a "to" (aria, boati, passi sulla neve)
    const sweep = (filterType, from, to, start, dur, peak, q = 1) => {
        const len = Math.floor(ctx.sampleRate * dur);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / len);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const filter = ctx.createBiquadFilter();
        filter.type = filterType;
        filter.Q.value = q;
        filter.frequency.setValueAtTime(from, t + start);
        filter.frequency.exponentialRampToValueAtTime(to, t + start + dur);
        const g = ctx.createGain();
        g.gain.value = peak;
        src.connect(filter).connect(g).connect(out);
        src.start(t + start);
    };

    if (kind === 'whoosh') {
        sweep('bandpass', 500, 2400, 0, 0.26, 0.9, 1.4);
        return;
    }
    if (kind === 'parry') {
        [1250, 1890, 3120].forEach((f, i) => tone('triangle', f, f * 0.97, i * 0.012, 0.4, 0.2 / (i + 1)));
        tick(0, 2600, 0.7);
        return;
    }
    if (kind === 'drum') {
        tone('sine', 120, 42, 0, 0.5, 0.9);
        sweep('lowpass', 500, 120, 0, 0.14, 0.7);
        return;
    }
    if (kind === 'roar') {
        sweep('lowpass', 320, 900, 0, 0.5, 1);
        sweep('lowpass', 900, 160, 0.45, 0.8, 1);
        tone('sawtooth', 92, 58, 0, 1.2, 0.26);
        return;
    }
    if (kind === 'boom') {
        sweep('lowpass', 1800, 90, 0, 0.7, 1);
        tone('sine', 110, 32, 0, 0.75, 0.9);
        return;
    }
    if (kind === 'swell') {
        sweep('bandpass', 300, 3200, 0, Math.max(0.1, durata), 0.5, 2);
        tone('sine', 220, 660, 0, Math.max(0.1, durata), 0.08);
        return;
    }
    if (kind.startsWith('step-')) {
        const pitch = 0.9 + Math.random() * 0.2;
        if (kind === 'step-neve') sweep('highpass', 2400 * pitch, 4200 * pitch, 0, 0.13, 0.32);
        else if (kind === 'step-fango') { sweep('lowpass', 500 * pitch, 180, 0, 0.17, 0.75); tone('sine', 180 * pitch, 80, 0.03, 0.12, 0.14); }
        else if (kind === 'step-pietra') { tick(0, 1700 * pitch, 0.5); tick(0.02, 950 * pitch, 0.25); }
        else { tick(0, 620 * pitch, 0.55); sweep('lowpass', 900 * pitch, 300, 0, 0.07, 0.28); }
        return;
    }

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

    if (kind === 'fall') {
        // Eroe caduto: rintocco grave che si spegne piano, con una quinta sotto
        tick(0, 500, 0.5);
        const low = ctx.createBiquadFilter();
        low.type = 'lowpass';
        low.frequency.value = 700;
        low.connect(out);
        tone('triangle', 147, 140, 0.02, 1.6, 0.3, low);
        tone('sine', 98, 94, 0.02, 1.9, 0.22, low);
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
