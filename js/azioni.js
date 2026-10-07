/* ==========================================================================
   AZIONI DEI PULSANTI (delega degli eventi)
   Niente più gestori scritti negli attributi (onclick e simili): un elemento dichiara la funzione
   globale da chiamare con un attributo, e un solo ascoltatore sul documento la
   trova e la chiama. Caricato prima di tutti gli altri js, sia da index.html
   sia da editor.html (e dai test, tests/ambiente.js).

   Attributi (nome = funzione globale, cercata in window al momento del clic,
   mai prima: wc3fx.js avvolge showScreen e openModal dopo il caricamento):
     data-action="nome"  data-args='[...]'          clic
     data-change="nome"  data-change-args='[...]'   change (select, checkbox, input)
     data-input="nome"   data-input-args='[...]'    input
     data-enter="nome"   data-enter-args='[...]'    tasto Invio (keydown)
     data-error="nome"   data-error-args='[...]'    errore di caricamento (img)
     data-stop                                      ferma la propagazione (come event.stopPropagation())

   Gli argomenti sono un array JSON. Alcuni segnaposto vengono sostituiti:
     "$value" = valore dell'elemento (this.value), "$checked" = this.checked,
     "$el" = l'elemento stesso (this), "$event" = l'evento.
   Nell'HTML generato dal codice si scrive ${azione('nome', a, b)} oppure
   ${azioneSu('change', 'nome', '$value')}: gli argomenti vengono già protetti per l'attributo.

   Come con gli onclick di prima: su un elemento disattivato non succede nulla,
   gli elementi annidati con un'azione la eseguono dal più interno al più esterno
   (salvo data-stop), un <a> con un'azione non segue il suo href.
   ========================================================================== */

(function () {
    const EVENTI = {
        click: { attr: 'action', args: 'args' },
        change: { attr: 'change', args: 'changeArgs' },
        input: { attr: 'input', args: 'inputArgs' },
        keydown: { attr: 'enter', args: 'enterArgs' },
        error: { attr: 'error', args: 'errorArgs' }
    };
    const SELETTORE = { click: '[data-action]', change: '[data-change]', input: '[data-input]', keydown: '[data-enter]', error: '[data-error]' };

    function leggiArgomenti(el, chiave, evento) {
        const testo = el.dataset[chiave];
        if (!testo) return [];
        let args;
        try { args = JSON.parse(testo); } catch (err) {
            console.error(`data-${chiave}: JSON non valido`, testo, el);
            return [];
        }
        if (!Array.isArray(args)) args = [args];
        return args.map(a => a === '$value' ? el.value
            : a === '$checked' ? el.checked
            : a === '$el' ? el
            : a === '$event' ? evento
            : a);
    }

    function disattivato(el) {
        return !!(el.disabled || (el.closest && el.closest('fieldset:disabled')));
    }

    function esegui(tipo, evento) {
        const def = EVENTI[tipo];
        if (tipo === 'keydown' && evento.key !== 'Enter') return;
        const target = evento.target;
        if (!target || !target.closest) return;
        // Come per gli onclick: dentro un pulsante disattivato il clic non arriva a nessuno
        if (tipo === 'click' && target.closest('button:disabled, input:disabled, select:disabled, textarea:disabled')) return;
        // L'errore di un'immagine non risale: vale solo per l'elemento stesso
        let el = tipo === 'error' ? (target.dataset && target.dataset.error ? target : null) : target.closest(SELETTORE[tipo]);
        while (el) {
            if (disattivato(el)) return;
            const nome = el.dataset[def.attr];
            const fn = window[nome];
            if (typeof fn === 'function') {
                if (el.tagName === 'A') evento.preventDefault();
                fn.apply(el, leggiArgomenti(el, def.args, evento));
            } else {
                console.error(`data-${def.attr}: funzione "${nome}" non trovata`);
            }
            if (el.hasAttribute('data-stop')) { evento.stopImmediatePropagation(); return; }
            if (tipo === 'error') return;
            el = el.parentElement ? el.parentElement.closest(SELETTORE[tipo]) : null;
        }
    }

    // Clic, modifiche e tasti risalgono fino al documento; gli errori delle immagini no, si prendono in cattura
    ['click', 'change', 'input', 'keydown'].forEach(tipo => document.addEventListener(tipo, e => esegui(tipo, e)));
    document.addEventListener('error', e => esegui('error', e), true);

    // Attributi per l'HTML generato: azione('selectTreasureItem', 3) -> data-action="selectTreasureItem" data-args="[3]"
    const proteggi = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    function azioneSu(tipo, nome, ...args) {
        const def = EVENTI[tipo === 'enter' ? 'keydown' : tipo];
        if (!def) throw new Error(`azioneSu: evento sconosciuto "${tipo}"`);
        const argsAttr = def.args.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
        return `data-${def.attr}="${proteggi(nome)}"${args.length ? ` data-${argsAttr}="${proteggi(JSON.stringify(args))}"` : ''}`;
    }

    window.azioneSu = azioneSu;
    window.azione = (nome, ...args) => azioneSu('click', nome, ...args);

    // Cambia l'azione di un pulsante già nella pagina (es. "Avanti" del combattimento): impostaAzione(btn, 'showScreen', 'screenVictory')
    window.impostaAzione = function (el, nome, ...args) {
        if (!el) return;
        el.dataset.action = nome;
        if (args.length) el.dataset.args = JSON.stringify(args);
        else delete el.dataset.args;
    };
})();

/* ---------- Piccole azioni che prima erano scritte dentro l'attributo ---------- */

// Immagine che non si carica: sparisce (anteprime dell'editor)
function nascondiImmagine(img) {
    img.hidden = true;
}

// Porta a un'altra pagina (es. il pulsante "Editor Campagne" del menu)
function vaiAPagina(url) {
    location.href = url;
}
