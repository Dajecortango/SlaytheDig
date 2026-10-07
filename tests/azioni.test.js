// Azioni dei pulsanti (js/azioni.js): niente gestori scritti negli attributi (onclick e simili),
// ogni data-action / data-change / ... deve chiamare una funzione globale che esiste davvero
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { caricaPagina, ROOT } = require('./ambiente');

function fileJs(dir) {
    const out = [];
    for (const voce of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
        const rel = `${dir}/${voce.name}`;
        if (voce.isDirectory()) { if (voce.name !== 'vendor') out.push(...fileJs(rel)); }
        else if (voce.name.endsWith('.js')) out.push(rel);
    }
    return out;
}

// Nomi delle funzioni chiamate dagli attributi e dagli aiuti azione()/azioneSu()/impostaAzione()
function nomiAzioni(testo) {
    const nomi = new Set();
    for (const m of testo.matchAll(/data-(?:action|change|input|enter|error)="(\w+)"/g)) nomi.add(m[1]);
    for (const m of testo.matchAll(/\bazione\('(\w+)'/g)) nomi.add(m[1]);
    for (const m of testo.matchAll(/\bazioneSu\('\w+',\s*'(\w+)'/g)) nomi.add(m[1]);
    for (const m of testo.matchAll(/\bimpostaAzione\([^,]+,\s*'(\w+)'/g)) nomi.add(m[1]);
    return nomi;
}

module.exports = (t) => {
    const leggi = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
    const js = fileJs('js');

    t.test('nessun gestore on...= scritto negli attributi (index.html, editor.html, js/)', () => {
        const trovati = [];
        for (const f of ['index.html', 'editor.html', ...js]) {
            leggi(f).split('\n').forEach((riga, i) => {
                // attributo HTML (" onclick=" seguito da virgolette o ${), non le proprietà come btn.onclick = ...
                if (/\son[a-z]+=(["'\\]|\$\{)/i.test(riga) && !/\.on[a-z]+\s*=/.test(riga)) trovati.push(`${f}:${i + 1}: ${riga.trim()}`);
            });
        }
        t.ok(!trovati.length, `gestori in linea rimasti:\n${trovati.join('\n')}`);
    });

    const pagine = [
        { pagina: 'index.html', sorgenti: js.filter(f => !f.startsWith('js/editor/') && f !== 'js/azioni.js') },
        { pagina: 'editor.html', sorgenti: js.filter(f => f.startsWith('js/editor/')) }
    ];
    for (const { pagina, sorgenti } of pagine) {
        t.test(`${pagina}: ogni azione chiama una funzione globale che esiste`, () => {
            const ctx = caricaPagina(pagina);
            const nomi = new Set([...nomiAzioni(leggi(pagina)), ...sorgenti.flatMap(f => [...nomiAzioni(leggi(f))])]);
            t.ok(nomi.size > 10, `trovate solo ${nomi.size} azioni`);
            const mancanti = [...nomi].filter(n => typeof ctx[n] !== 'function');
            t.ok(!mancanti.length, `funzioni mancanti: ${mancanti.join(', ')}`);
        });
    }

    t.test('azione() scrive attributi sicuri anche con apici e virgolette nei nomi', () => {
        const ctx = caricaPagina('index.html');
        const attr = ctx.azione('haggle', `D'Artagnan "il" <bello>`, 3);
        const m = attr.match(/^data-action="haggle" data-args="([^"]*)"$/);
        t.ok(m, attr);
        const decodifica = s => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        t.uguale([`D'Artagnan "il" <bello>`, 3], JSON.parse(decodifica(m[1])));
        t.uguale('data-change="simSetHeroItem" data-change-args="[&quot;Icaro&quot;,&quot;$value&quot;]"', ctx.azioneSu('change', 'simSetHeroItem', 'Icaro', '$value'));
        t.uguale('data-enter="selectCampaign" data-enter-args="[&quot;tutorial&quot;]"', ctx.azioneSu('enter', 'selectCampaign', 'tutorial'));
    });

    // Delega: un DOM minimo con gli ascoltatori del documento, per provare clic, disattivati, annidati e segnaposto
    t.test('la delega chiama la funzione con gli argomenti, salta i disattivati e rispetta data-stop', () => {
        const ascoltatori = {};
        const ctx = { console, JSON, document: { addEventListener: (tipo, fn) => { (ascoltatori[tipo] = ascoltatori[tipo] || []).push(fn); } }, location: {} };
        ctx.window = ctx;
        vm.createContext(ctx);
        vm.runInContext(leggi('js/azioni.js'), ctx);

        const el = (attrs, parent = null, extra = {}) => {
            const dataset = {};
            for (const [k, v] of Object.entries(attrs)) dataset[k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v;
            const e = {
                dataset, parentElement: parent, tagName: 'BUTTON', disabled: false, ...extra,
                hasAttribute: n => n.startsWith('data-') && n.slice(5) in attrs,
                matches(sel) {
                    if (sel.includes(':disabled')) return this.disabled;
                    return sel.split(',').some(s => { const a = s.trim().match(/^\[data-([\w-]+)\]$/); return a && a[1] in attrs; });
                },
                closest(sel) { let n = this; while (n) { if (n.matches(sel)) return n; n = n.parentElement; } return null; }
            };
            return e;
        };
        const chiamate = [];
        ctx.registra = function (...args) { chiamate.push([this === undefined ? null : 'el', ...args]); };
        const clic = target => {
            const ev = { target, stopped: false, preventDefault() {}, stopImmediatePropagation() { this.stopped = true; } };
            ascoltatori.click.forEach(fn => fn(ev));
            return ev;
        };

        const fuori = el({ action: 'registra', args: '["fuori"]' });
        const dentro = el({ action: 'registra', args: '[1, "$value"]' }, fuori, { value: 'v' });
        clic(dentro);
        t.uguale([['el', 1, 'v'], ['el', 'fuori']], chiamate, 'dal più interno al più esterno, con $value');

        chiamate.length = 0;
        const fermo = el({ action: 'registra', stop: '' }, fuori);
        t.ok(clic(fermo).stopped, 'data-stop ferma la propagazione');
        t.uguale([['el']], chiamate, 'con data-stop il genitore non riceve il clic');

        chiamate.length = 0;
        clic(el({ action: 'registra' }, null, { disabled: true }));
        t.uguale([], chiamate, 'un pulsante disattivato non fa nulla');

        // La funzione si cerca al momento del clic (wc3fx.js avvolge showScreen dopo il caricamento)
        chiamate.length = 0;
        const btn = el({ action: 'sostituita' });
        ctx.sostituita = () => chiamate.push('prima');
        ctx.sostituita = () => chiamate.push('dopo');
        clic(btn);
        t.uguale(['dopo'], chiamate);
    });
};
