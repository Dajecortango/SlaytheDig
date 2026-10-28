# CLAUDE.md

Guida per Claude Code (claude.ai/code) su questo repository. Idea ripresa dal branch `campaign-editor` di Valerio e aggiornata all'architettura attuale. Qui ci sono le regole che valgono sempre e l'indice; i dettagli sono in `docs/`, da leggere quando si lavora su quella parte.

## Progetto

"Slay the Dig": roguelike a turni (mappa alla *Slay the Spire*, toni alla *Darkest Dungeon*) con interfaccia ispirata ai menu di *Warcraft III: Reign of Chaos*. Campagne private della "Famiglia Dignitas". Testi di gioco, commenti e nomi in italiano.

App web statica in JavaScript puro: niente build, niente npm, niente bundler. Test automatici in `tests/` eseguiti con Node senza dipendenze. Librerie esterne solo copiate in `js/vendor/` (`qrcode.js`, `gsap.min.js`, `morphdom-umd.min.js` per la pagina dei giocatori della partita online).

## Guida per parti (`docs/`)

| File | Cosa contiene |
|---|---|
| `docs/sviluppo.md` | Avvio, test, prova nel browser (`tools/prova_browser.mjs`), hook pre-commit, immagini WebP, musica e video, leggibilità, caricamento |
| `docs/architettura.md` | File e ordine dei `<script>`, `js/azioni.js`, `js/comune.js`, `js/regole.js`, librerie e campagne, procedurali, motore (`js/motore/`), scheda dei dati, numeri casuali, formato dei dati |
| `docs/campagne.md` | Campi di una campagna, nodi, trame ed eventi, finale, immagini dei nodi e segnaposto, ritratti degli eroi |
| `docs/eroi.md` | Rune, abilità fisse, preghiera e benedizioni, segnali `hero_set` delle passive, abilità attive (`combat`) |
| `docs/regole.md` | Effetti descrittivi (`applyEffects`), regole dei tiri, bottino e mercante, effetti speciali "quando → fai", stati degli eroi, fasi ed azioni degli elite |
| `docs/simulatore.md` | Simulatore, profilo Esperto, `tools/difficolta.mjs`, `tools/scontro.mjs` |
| `docs/salvataggi.md` | `stato`, slot di salvataggio, `SAVE_VERSION` e migrazioni, fine partita |
| `docs/editor.md` | Editor: Home, moduli, mappa guidata, rete di sicurezza, immagini caricate, salvataggio e .zip |
| `docs/interfaccia.md` | Convenzioni dell'interfaccia, finestre, suoni e musica, passaggi tra schermate, stile WoW / WC3, icone |
| `docs/online.md` | Partita online (server, permessi, voti, pagina dei giocatori) e telefono |

## Comandi

- Gioco: `index.html` con doppio click (`file://`, senza server); editor: `editor.html`. Per questo le campagne sono file `.js` caricati con `<script>`: il browser blocca `fetch()` di file locali.
- Sintassi: `node --check js/<file>.js`, `node --check data/campagne/<id>.js`.
- Test: `node tests/run.js` (ogni `tests/*.test.js` esporta `(t, carica) => { t.test(nome, fn) }` con `t.ok`, `t.uguale`, `t.avviso`).
- Browser vero: `node tools/prova_browser.mjs [--seme N] [--eroi "a,b"] [--editor] [--foto <cartella>]` (opzioni in `docs/sviluppo.md`).
- Difficoltà: `node tools/difficolta.mjs [campagne] [--senza-ricerca]`; un nemico: `node tools/scontro.mjs <nemico> --eroi "a,b"`.
- Formato dei dati: `node tools/formatta_dati.mjs --applica` (lo stesso formato che scrive l'editor).
- Hook prima di ogni commit (sintassi e test): `git config core.hooksPath .githooks`, una volta per copia del progetto.

## Regole che valgono sempre

- **Dati come JSON puro.** Librerie (`data/libreria/`) e campagne (`data/campagne/<id>.js`) non hanno funzioni. Le campagne richiamano nemici, oggetti, reliquie, maledizioni, eroi e abilità **per id**. Una campagna nuova va aggiunta con un `<script>` sia in `index.html` sia in `editor.html`; l'ordine dei tag è l'ordine nel menu. Gli id sono `[a-z0-9_]`, senza spazi.
- **Motore senza DOM.** Le regole stanno in `js/motore/` (`tiri.js`, `speciali.js`, `scontro.js`, `prove.js`); diario, pulsanti e messaggi stanno nell'interfaccia (`js/combattimento.js`, `js/prove.js`). Ogni file del motore espone `window.Motore.<area>` e gli stessi nomi come globali (`Object.assign(window, api)`): una funzione chiamata da un altro file va messa nell'`api`, altrimenti nel browser è "not defined".
- **Numeri del bilanciamento** in `js/regole.js`, solo dati.
- **Cose condivise** da gioco ed editor in `js/comune.js`. Un segnale `hero_set` nuovo va in `HERO_FLAGS`; un tipo di effetto nuovo in `applyEffects()` ed `EFFECT_TYPES` / `EFFECT_LABELS`; un "quando" o un "fai" nuovo in `js/motore/speciali.js` e in `js/comune.js`; un campo nuovo del motore nella scheda dei dati (`js/schema.js`).
- **Ordine dei file.** Il codice eseguito al caricamento di un file non chiama funzioni dei file successivi: le chiamate tra file avvengono dopo, al clic o a `DOMContentLoaded`.
- **Pulsanti** con `data-action` / `data-change` / ... (`js/azioni.js`; nell'HTML generato `${azione('nome', a, b)}`), mai `onclick="..."`. Finestre con `openModal` / `closeModal`, tooltip con `data-tip="Titolo||Descrizione"`, avvisi brevi con `uiMessage` / `uiError`.
- **Numeri casuali**: tutto ciò che decide la partita usa `rng()` di `js/comune.js`; `Math.random` solo per animazioni e suoni.
- **Stato** in un solo oggetto `stato` (`stato.party`, non `party`). Cambiando il formato dei salvataggi si alza `SAVE_VERSION` e si aggiunge il passo in `SAVE_MIGRATIONS`.
- **Immagini** in WebP, lato massimo 1024 px, qualità 75; gli originali in `sorgenti/` (fuori da git). Icone solo classiche di Warcraft III (non Reforged), in `immagini/icone/`. Un'immagine mancante mostra `immagini/segnaposto/<tipo>.svg`.
- **Leggibilità**: oro in gradiente e aloni solo sui titoli grandi; testo del corpo in colore pieno, almeno 11px; uno stato spento con colore o `filter`, non con `opacity`.
- **Valuta**: si chiama **Scudi**, nei testi visibili sempre con la maiuscola; nel codice resta `partyCoins` / coins.
- **Una meccanica davvero nuova** richiede codice nel motore e un campo nell'editor (`js/editor/campi.js`), non solo dati; l'editor è pensato per chi non sa programmare, quindi elite ed effetti speciali restano visibili anche con "Avanzate" spente.
