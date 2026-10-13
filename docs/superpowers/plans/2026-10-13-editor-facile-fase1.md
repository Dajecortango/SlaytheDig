# Editor facile, fase 1 (ingresso e orientamento): piano

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** chi apre l'editor arriva su una Home con tre porte, vede le schede in due gruppi con nomi chiari, non vede i termini tecnici finché non accende "Avanzate", salva con un solo pulsante e ha una guida al primo avvio.

**Architecture:** una scheda nuova `home` disegnata da `js/editor/home.js` (caricato prima di `avvio.js`); modalità avanzata come classe `ed-advanced` sul body, con CSS che nasconde gli elementi `.ed-adv-only` e `renderForm` che salta i campi `avanzato: true`; guida come sequenza di fumetti posizionati sugli elementi (`js/editor/guida.js`). Le funzioni pure (campagna vuota, copia di una campagna, campi visibili, passi della guida) sono provate in Node; il resto in Edge headless.

**Tech Stack:** JavaScript puro, `file://`, test Node in `tests/`, verifica con Edge headless (CDP).

**Spec:** `docs/superpowers/specs/2026-10-13-editor-facile-design.md`

## Global Constraints

- Niente build; pulsanti con `data-action` (`azione(...)`), mai `onclick`. `tests/azioni.test.js` controlla che ogni azione esista.
- Nomi interni e file dei dati invariati (`bestiario`, `armeria`, `LIB_KINDS`, `data/...`); cambiano solo le etichette.
- Testi in italiano semplice; niente "id", "file", "JSON" visibili con Avanzate spente.
- Niente commit (regola del progetto: si committa solo su richiesta).

## Review Focus

- Avanzate spente e un errore dei Controlli su un campo avanzato: il campo non deve essere obbligatorio (test sulla scheda dei dati).
- Bozza presente all'avvio: non deve più comparire il `confirm`; il ripristino passa dalla Home e funziona come prima (immagini, libreria).
- Copia di una campagna: id nuovo diverso da tutti quelli esistenti, `campaignOrigin = null` (è una campagna nuova), titolo "… (copia)".
- Apertura di un file .js/.json dalla Home: stesso comportamento dell'`edFileInput` di oggi.
- Indirizzo `editor.html#bestiario`: apre ancora la scheda (anche Elite con Avanzate spente: le accende).

---

### Task 1: modalità Avanzate

**Files:** Modify `js/editor/stato.js`, `js/editor/moduli.js`, `js/editor/campi.js`, `editor.html`, `css/editor.css`, `js/editor/raccolte.js`, `js/editor/ricerca.js`, `js/editor/elite.js`. Test: `tests/editor_facile.test.js` (nuovo).

**Produces:** `isAdvanced()`, `setAdvanced(on)`, `toggleAdvanced()`, `visibleFields(fields, obj)`; classe CSS `.ed-adv-only`; proprietà `avanzato: true` dei campi.

- [ ] Test (fallisce): `visibleFields` esiste e salta i campi `avanzato` ad Avanzate spente; nessun campo obbligatorio di `DATI_SCHEMA` è `avanzato` in nessun `*_FIELDS`; `specialiField` e i campi `json` sono avanzati.
- [ ] `stato.js`: `ADVANCED_KEY = 'dignitas_editor_avanzate'`, `isAdvanced()` (localStorage in try/catch), `setAdvanced(on)` (salva, classe `ed-advanced` sul body, `render()`), `toggleAdvanced()`.
- [ ] `moduli.js`: `visibleFields(fields, obj)` = filtro di `showIf` e `avanzato`; `renderForm` la usa.
- [ ] `campi.js`: `avanzato: true` su `specialiField(...)`, campi `type: 'json'`, campi tecnici di `ABILITY_FIELDS` (`combat.damageMult`, `combat.sumTarget`, `combat.damageTakenBonus`, `combat.critical`, `combat.useText`, `combat.hitLabel`, `combat.hitText`, `combat.effetti`), `NODE_FIELDS` `id`.
- [ ] `.ed-adv-only` su: pulsanti Rinomina id e stella (raccolte, elite, ricerca), "Salva nel progetto"/"Scarica .zip"/"Cambia la cartella", schede Elite e Azioni elite, testo id nel riquadro "Usato in". CSS: `body:not(.ed-advanced) .ed-adv-only { display: none !important; }`.
- [ ] Interruttore in alto: `<label class="ed-switch"><input type="checkbox" data-change="setAdvanced" data-change-args='["$checked"]'> Avanzate</label>`.
- [ ] `node tests/run.js` verde.

### Task 2: schede in due gruppi con nomi chiari

**Files:** Modify `editor.html`, `css/editor.css`, `js/editor/progetto.js` (`LIB_LABELS`), `js/editor/avvio.js`. Test: `tests/editor_facile.test.js`.

- [ ] Test (fallisce): nelle schede di `editor.html` nessuna etichetta ripetuta; `LIB_LABELS.bestiario === 'Nemici'`, `LIB_LABELS.armeria === 'Oggetti'`, `LIB_LABELS.eroi === 'Schede degli eroi'`.
- [ ] Barra: riga "La campagna" (Generale · Mappa · Eroi della campagna · Oggetti iniziali · Prove · Testi) e riga "Libreria condivisa" (Nemici · Oggetti · Reliquie · Maledizioni · Schede degli eroi · Abilità · Benedizioni · Elite · Azioni elite, le ultime due `.ed-adv-only`). Pulsante "Home" e nome della campagna aperta nella barra in alto (`#edCampaignName`, aggiornato in `render`).
- [ ] `LIB_LABELS` con i nomi nuovi (si usano già in "Modifica in …" e nella ricerca).
- [ ] `switchTab('elite'|'azioni_elite')` con Avanzate spente: le accende.
- [ ] Verde.

### Task 3: Home

**Files:** Create `js/editor/home.js`; Modify `editor.html` (script, togli select/Apri/Nuova/Apri file dall'alto), `js/editor/stato.js`, `js/editor/avvio.js`, `css/editor.css`. Test: `tests/editor_facile.test.js`.

**Produces:** `blankCampaign()`, `campaignCopy(src, title)`, `readDraft()`, `restoreDraft(draft)`, `renderHomeTab()`, azioni `homeNew`, `homeCopy`, `homeOpen(id)`, `homeOpenFile(el)`, `homeRestoreDraft`, `homeDiscardDraft`, `goHome`.

- [ ] Test (fallisce): `blankCampaign()` ha 3 nodi collegati (partenza → scontro → boss finale, il primo `active`); `campaignCopy(rawCampaigns().tutorial, 'Prova')` ha id nuovo diverso da tutti, titolo dato, stessi nodi, oggetto separato dall'originale.
- [ ] `stato.js`: `blankCampaign()` usata da `newCampaign`; `campaignCopy`; `offerDraftRestore` diviso in `readDraft()` e `restoreDraft(draft)` (stesso corpo di oggi); `fillCampaignSelect` e il listener di `edFileInput` tolti, lettura del file in `readCampaignFile(file)`.
- [ ] `home.js`: tre riquadri (Crea: nome + "Parti da zero" / "Copia da" con menu; Modifica: griglia con copertina e titolo; Libreria: pulsanti delle schede), riquadro "Riprendi da dove eri rimasto" se c'è una bozza, "Apri un file…" con `<input type="file" data-change="homeOpenFile" data-change-args='["$el"]'>`.
- [ ] `avvio.js`: `TABS` con `home`; all'avvio campagna prima aperta in silenzio, poi `switchTab('home')` salvo indirizzo con scheda; la bozza si legge e la Home la mostra. Sulla Home la colonna destra è nascosta.
- [ ] Verde.

### Task 4: pulsante unico "Salva"

**Files:** Modify `editor.html`, `css/editor.css`.

- [ ] Pulsante "Salva" (`saveToProject`, già con il ripiego sullo .zip) visibile solo con Avanzate spente (`.ed-simple-only`), con un "?" che spiega in parole semplici dove finiscono i file. Con Avanzate i tre pulsanti di oggi. I paragrafi fissi della colonna destra diventano `.ed-adv-only`.
- [ ] Verde.

### Task 5: guida al primo avvio

**Files:** Create `js/editor/guida.js`; Modify `editor.html`, `css/editor.css`, `js/editor/avvio.js`. Test: `tests/editor_facile.test.js`.

**Produces:** `GUIDA_PASSI` (`[{ sel, titolo, testo }]`), `startGuide()`, `guideNext()`, `guideSkip()`.

- [ ] Test (fallisce): 5 passi; ogni `sel` è un id presente in `editor.html` o nell'HTML della Home.
- [ ] Fumetto `#edGuide` posizionato sotto l'elemento (`getBoundingClientRect`), elemento evidenziato, "Avanti" / "Salta", fine al quinto. `localStorage` `dignitas_editor_guida`; parte da sola la prima volta; pulsante "?" in alto la riapre.
- [ ] Verde.

### Task 6: verifica e documenti

- [ ] Edge headless: Home, schede con Avanzate spente e accese, modulo di un oggetto (niente effetti speciali da spenta), guida, nessun errore JS.
- [ ] `CLAUDE.md`, sezione Editor: Home, Avanzate, Salva, guida, file nuovi.
