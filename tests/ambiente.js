// Ambiente di prova: carica dati e motore del gioco in Node, senza browser.
// Il DOM è finto (ogni elemento accetta qualunque proprietà o chiamata), così si possono
// provare le funzioni pure del motore: combattimento, prove, mercante, salvataggi.
// Si carica con: const { carica } = require('./ambiente'); const g = carica();
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

// Script nell'ordine di index.html, senza avvio, telefono e animazioni (audio e ritratti servono alla barra degli eroi)
const SCRIPT_MOTORE = [
    'js/azioni.js', 'js/libreria.js', 'js/regole.js', 'js/comune.js', 'js/procedurale.js', 'js/game.js', 'js/interfaccia.js', 'js/effetti.js', 'js/menu.js', 'js/spedizione.js',
    'js/creazione.js', 'js/oggetti.js', 'js/prove.js', 'js/salvataggi.js', 'js/audio.js', 'js/mappa.js',
    'js/combattimento.js', 'js/ritratti.js', 'js/loot.js', 'js/shop.js', 'js/simulator.js'
];

// Oggetto che accetta tutto: proprietà, chiamate, catene (document.getElementById('x').classList.add(...))
function finto() {
    const fn = function () { return proxy; };
    const proxy = new Proxy(fn, {
        get(target, key) {
            if (key === Symbol.toPrimitive) return () => '';
            if (key === 'length') return 0;
            if (key === Symbol.iterator) return function* () {};
            if (key === 'then') return undefined;
            // Audio e video: play() nel browser restituisce una Promise (qui non si risolve mai: niente musica nei test)
            if (key === 'play') return () => new Promise(() => {});
            if (!(key in target)) target[key] = finto();
            return target[key];
        },
        set(target, key, value) { target[key] = value; return true; },
        apply() { return proxy; },
        construct() { return proxy; }
    });
    return proxy;
}

function storageFinto() {
    const data = {};
    return {
        getItem: k => (k in data ? data[k] : null),
        setItem: (k, v) => { data[k] = String(v); },
        removeItem: k => { delete data[k]; },
        clear: () => Object.keys(data).forEach(k => delete data[k])
    };
}

// Contesto nuovo con il DOM finto e le API del browser che i file usano al caricamento
function creaContesto() {
    const ctx = {
        console, Math, JSON, Date, Promise, setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
        document: finto(), localStorage: storageFinto(), navigator: finto(), location: { search: '', hash: '', protocol: 'file:', pathname: '/index.html', href: 'file:///index.html' },
        Audio: function () { return finto(); }, Image: function () { return finto(); },
        requestAnimationFrame: () => 0, matchMedia: () => ({ matches: false, addEventListener() {} }),
        fetch: () => Promise.reject(new Error('niente rete nei test')),
        alert() {}, confirm: () => true,
        URLSearchParams, URL, TextEncoder, Blob: function () { return finto(); }, indexedDB: finto(),
        addEventListener() {}, removeEventListener() {}, performance: { now: () => 0 }, getComputedStyle: () => finto(), CSS: { escape: s => String(s) }
    };
    // Classi del browser che il gioco crea al caricamento: tutte finte
    for (const name of ['MutationObserver', 'ResizeObserver', 'IntersectionObserver', 'AudioContext', 'webkitAudioContext',
        'CustomEvent', 'Event', 'FileReader', 'XMLHttpRequest', 'EventSource', 'WebSocket']) {
        ctx[name] = function () { return finto(); };
    }
    ctx.window = ctx;
    ctx.globalThis = ctx;
    vm.createContext(ctx);
    // Le dichiarazioni "const"/"let" di primo livello non diventano proprietà del contesto:
    // eval le rende raggiungibili ("g.eval('stato')"), le funzioni sono già proprietà
    ctx.eval = code => vm.runInContext(code, ctx);
    return ctx;
}

// Carica dati (tutte le librerie e le campagne di index.html) e motore in un contesto nuovo
function carica() {
    const ctx = creaContesto();
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const dati = [...html.matchAll(/<script src="(data\/[^"]+)"/g)].map(m => m[1]);
    for (const file of [...dati, ...SCRIPT_MOTORE]) {
        vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
    }
    return ctx;
}

// Carica TUTTI gli script di una pagina (index.html o editor.html) nell'ordine dei tag, come il browser:
// controlla che nulla si rompa al caricamento e rende raggiungibili le funzioni globali della pagina
function caricaPagina(pagina) {
    const ctx = creaContesto();
    const html = fs.readFileSync(path.join(ROOT, pagina), 'utf8');
    for (const [, file] of html.matchAll(/<script src="([^"]+)"/g)) {
        vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
    }
    return ctx;
}

module.exports = { carica, caricaPagina, ROOT, SCRIPT_MOTORE };
