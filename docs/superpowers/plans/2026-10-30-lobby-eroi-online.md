# Lobby online per eroi — piano di lavoro

> **Per chi esegue:** sotto-skill richiesta: superpowers:subagent-driven-development (consigliata) o superpowers:executing-plans, un task alla volta. I passi usano le caselle (`- [ ]`).

**Obiettivo:** nella partita online chi apre il link non scrive un nome. Sceglie un eroe dalla rosa del capitolo, e l'eroe diventa la sua identità. Così chi perde la connessione riprende il suo eroe da qualunque dispositivo.

**Architettura:** le regole nuove sono funzioni pure in `js/online-regole.js`, usate da server, master e test. Il server assegna gli eroi con una chiamata nuova, `/api/online/scegli`. Avendo un solo filo, risolve da solo due tocchi nello stesso istante. Il master (`js/online.js`) gestisce la creazione "chi prima arriva", le bozze sospese e la rosa nello stato. La pagina del giocatore mostra il pannello di scelta e il pannello d'attesa.

**Tecnologie:** JavaScript puro senza build; server Node (`http`); test con `node tests/run.js` (vm, senza dipendenze); prova del server con `node tools/prova_online.mjs`.

**Design:** `docs/superpowers/specs/2026-10-30-lobby-eroi-online-design.md` (approvato). Leggilo prima di iniziare.

## Vincoli globali

- Regole di `CLAUDE.md`: niente npm e niente build; testi, commenti e nomi in italiano; `data-action` invece di `onclick` nel gioco (la pagina del giocatore non carica `js/azioni.js` e usa `addEventListener`, come fa già); gli stati spenti si fanno con `filter` o con il colore, non con `opacity`; testo del corpo almeno 11px.
- Ogni funzione di `js/online-regole.js` usata dal server va aggiunta a `module.exports` in fondo al file.
- Nella stanza il nome di un giocatore (`name`) è `null` finché non sceglie un eroe; dopo è il **nome dell'eroe** (`h.name`, per esempio `'Icaro'`).
- Il master a distanza si chiama `'Master'`. I moderatori si chiamano `'Moderatore'`, `'Moderatore 2'`, `'Moderatore 3'`…
- `stato.onlineOwners` = eroe → eroe per ogni eroe della compagnia. `SAVE_VERSION` non cambia, perché la forma del dato resta la stessa.
- Online la compagnia ha `campaignHeroes.length` eroi.
- Stati di un eroe nella rosa: `'da_creare'`, `'in_creazione'`, `'sospeso'`, `'creato'`.
- Testi visibili, esatti: `"Il master sta preparando il capitolo…"`, `"Scegli il tuo eroe"`, `"Sta creando: <eroe>"`, `"<eroe> è già in gioco"`, `"Hai già un eroe"`, `"Tocca a <eroe>"`.
- Niente commit automatici: l'utente fa i commit quando lo chiede. I passi "Commit" qui sotto diventano "lascia le modifiche nella copia di lavoro e lancia `node tests/run.js`".

## Punti da controllare in revisione

Casi che il design implica ma che i test dei singoli task non coprono:

1. **Un browser vecchio torna dopo che il suo eroe è stato preso da un altro.** Il token non vale più: la pagina deve tornare al pannello di scelta, non restare bloccata o in errore. (Test nel Task 2.)
2. **Due giocatori scelgono due eroi diversi da creare nello stesso istante.** Il master riceve la seconda scelta mentre la prima creazione è in corso: deve liberare il secondo giocatore con l'avviso `"Sta creando: <eroe>"`. (Test nel Task 3.)
3. **Si riprende una partita online salvata nel formato vecchio**, con gli owners eroe → nome della persona. Gli owners diventano eroe → eroe e nessuno resta bloccato fuori. (Test nel Task 3.)
4. **Un giocatore che sta creando un eroe con le rune si scollega dopo averne scelte 2 su 3.** Chi riprende la bozza ritrova le 2 rune scelte e non ancora confermate. (Test nel Task 3.)
5. **Uno spettatore (`name: null`) clicca un comando o vota.** Il clic si ignora e il voto non conta. (Test nel Task 3.)

---

### Task 1: Regole pure della lobby

**File:**
- Modifica: `js/online-regole.js` (funzioni nuove prima del blocco `module.exports`, più l'export)
- Test: `tests/online.test.js`

**Interfacce:**
- Produce:
  - `rosaOnline(schermata, eroiCapitolo, party, bozze, creando)` → `{ fase, eroi: [{ nome, stato }], creando }`. Gli argomenti: `schermata` = `currentScreenId`; `eroiCapitolo` = array di nomi; `party` = array di nomi; `bozze` = oggetto nome → bozza; `creando` = nome o `null`. `fase`: `'creazione'` se `schermata === 'screenParty'`, `'partita'` se `party.length > 0`, altrimenti `'attesa'`. In creazione `eroi` = `eroiCapitolo` con uno stato ciascuno. Le precedenze sono: nella compagnia → `'creato'`, nelle bozze → `'sospeso'`, uguale a `creando` → `'in_creazione'`, altrimenti `'da_creare'`. In partita `eroi` = `party` con stato `'creato'`. In attesa `eroi = []`.
  - `esitoSceltaEroe(eroe, chi, giocatori, rosa)` → `{ ok: true, libera: id | null }` oppure `{ ok: false, motivo }`. Gli argomenti: `chi` = `{ id, name, ruolo }` di chi sceglie; `giocatori` = array `{ id, name, connected, ruolo }`. Le regole, nell'ordine:
    1. `ruoloSenzaEroe(chi.ruolo)` → no.
    2. `chi.name` non null → `'Hai già un eroe'`.
    3. Fase `'attesa'`, oppure eroe assente dalla rosa → `'Eroe non disponibile'`.
    4. Un altro giocatore collegato ha `name === eroe` → `'<eroe> è già in gioco'`.
    5. Stato `'da_creare'` mentre `rosa.creando` esiste ed è diverso da `eroe` → `'Sta creando: <creando>'`.
    6. Altrimenti ok, con `libera` = id del giocatore scollegato che aveva quel nome (o `null`).
  - `nomeModeratore(giocatori)` → `'Moderatore'`, se è già usato `'Moderatore 2'`, e così via.
  - `ownersIdentita(party)` → `{ [h.name]: h.name }` per ogni eroe di `party` (array di oggetti eroe).

- [ ] **Passo 1: scrivi i test che falliscono**, in `tests/online.test.js`:
  - `'rosaOnline: fasi e stati degli eroi'`: `rosaOnline('screenStart', ['A','B'], [], {}, null).fase === 'attesa'`. Con `rosaOnline('screenParty', ['A','B','C','D'], ['A'], { B: {} }, 'C')`: gli stati di A, B, C, D sono `'creato'`, `'sospeso'`, `'in_creazione'`, `'da_creare'`. Con `rosaOnline('screenMap', ['A','B'], ['A','B'], {}, null)`: `fase === 'partita'` e 2 eroi `'creato'`.
  - `'esitoSceltaEroe: eroe occupato, scollegato, creazione in corso'`: giocatori `[{ id:'1', name:'A', connected:true, ruolo:'giocatore' }, { id:'2', name:'B', connected:false, ruolo:'giocatore' }, { id:'3', name:null, connected:true, ruolo:'giocatore' }]`; chi = id `'3'`. Risultati attesi:
    - `'A'` → `motivo === 'A è già in gioco'`;
    - `'B'` → `{ ok: true, libera: '2' }`;
    - con rosa in creazione, `creando: 'C'` e `'D'` da creare: `'D'` → `motivo === 'Sta creando: C'`;
    - chi con `name: 'A'` → `'Hai già un eroe'`;
    - ruolo `'moderatore'` → non ok;
    - fase `'attesa'` → `'Eroe non disponibile'`.
  - `'nomeModeratore e ownersIdentita'`: `nomeModeratore([{ name: 'Moderatore' }]) === 'Moderatore 2'`; `ownersIdentita([{ name: 'Icaro' }])` è uguale a `{ Icaro: 'Icaro' }`.

- [ ] **Passo 2:** `node tests/run.js` → i tre test nuovi falliscono con "... is not defined".
- [ ] **Passo 3:** scrivi le quattro funzioni e aggiungile a `module.exports`.
- [ ] **Passo 4:** `node tests/run.js` → tutti verdi.
- [ ] **Passo 5:** `node --check js/online-regole.js`; lascia le modifiche nella copia di lavoro.

---

### Task 2: Server — ingresso senza nome e scelta dell'eroe

**File:**
- Modifica: `server/online.js` (`/api/online/entra`, `elencoGiocatori`, nuove `/api/online/scegli` e `/api/online/libera`; la `/api/online/stato` del master resta e porta `rosa`)
- Test: `tools/prova_online.mjs`

**Interfacce:**
- Consuma: `esitoSceltaEroe`, `nomeModeratore` (Task 1).
- Produce:
  - Ogni giocatore nella stanza: `{ id, name, connected, flussi, timer, ruolo }`, con `id` = 8 caratteri esadecimali casuali (`crypto.randomBytes(4)`). `elencoGiocatori()` include `id`.
  - `POST /api/online/entra { code, token?, ruolo?, chiave? }` → `{ token, id, nome, ruolo }`. Con un token valido rientra come oggi. Senza token: `ruolo 'giocatore'` → `name: null`; `'moderatore'` → `nomeModeratore(...)`; `'master'` (con la chiave giusta) → `'Master'`. `nome` nella richiesta si ignora.
  - `POST /api/online/scegli { code, token, eroe }` → `{ ok: true, nome }` oppure `{ error: motivo }`. Usa `esitoSceltaEroe(eroe, gi, elenco, stanza.stato && stanza.stato.rosa)`. Se è ok e `libera` è valorizzato, chiude i flussi del vecchio giocatore e toglie il suo token dalla mappa. Poi `gi.name = eroe`, `avvisaStanza()`, `alMaster('scelta', { id: gi.id, eroe })`.
  - `POST /api/online/libera { id, motivo }`, solo dal master (stesse regole di `/api/online/avviso`: Host locale e segreto). Rimette `name = null` al giocatore con quell'`id`, gli manda `avviso { testo: motivo }` e chiama `avvisaStanza()`.
  - Evento SSE al master: `scelta`.

- [ ] **Passo 1: scrivi le prove che falliscono**, in `tools/prova_online.mjs`, dopo l'apertura della stanza. Il master manda `POST /api/online/stato { rosa: { fase: 'creazione', eroi: [{ nome: 'Icaro', stato: 'da_creare' }, { nome: 'Zeno', stato: 'da_creare' }], creando: null } }`. Poi:
  - `entra` senza nome → `nome === null` e `id` di 8 caratteri;
  - il giocatore 1 sceglie `Icaro` → `ok`, e il master riceve l'evento `scelta` con `eroe: 'Icaro'`;
  - il giocatore 2 sceglie `Icaro` → `error === 'Icaro è già in gioco'`;
  - il giocatore 1 chiude il flusso; dopo `ONLINE_DISCONNECT_MS` (1500) + 300 ms un nuovo giocatore 3 sceglie `Icaro` → `ok`;
  - `entra` con il token vecchio del giocatore 1 → `error` (token non più valido), e la pagina ricomincia da capo;
  - `libera` del giocatore 3 dal master → il giocatore 3 riceve `avviso` e torna `name: null` in `stanza`;
  - `entra` con `ruolo: 'moderatore'` due volte → nomi `'Moderatore'` e `'Moderatore 2'`;
  - il link del master con la chiave giusta → nome `'Master'`; le prove già esistenti sul master a distanza passano senza cambiamenti.
- [ ] **Passo 2:** `node tools/prova_online.mjs` → le prove nuove sono segnate ✗.
- [ ] **Passo 3:** scrivi le modifiche al server descritte in "Produce". Aggiorna il commento in cima a `server/online.js` ("entrano con il codice e un nome" → con il codice, poi scelgono un eroe).
- [ ] **Passo 4:** `node tools/prova_online.mjs` → tutte ✓; `node tests/run.js` → verdi.
- [ ] **Passo 5:** `node --check server/online.js`; lascia le modifiche nella copia di lavoro.

---

### Task 3: Master — creazione "chi prima arriva", bozze, rosa e owners

**File:**
- Modifica: `js/creazione.js` (`selectHeroCard` divisa in due; passo della creazione salvato sull'eroe)
- Modifica: `js/online.js` (sezione "Stanza, creazione a turno, chi deve agire"; `onlineInviaStato`; `onlineApri` con l'evento `scelta`; `onlineRiprendi`; `onlineAvvisoConnessioni`)
- Test: `tests/online.test.js` (riscrivi `'creazione a turno…'` e `'revisione #5…'`, che descrivono il comportamento vecchio)

**Interfacce:**
- Consuma: `rosaOnline`, `esitoSceltaEroe`, `ownersIdentita` (Task 1); evento `scelta` e `POST /api/online/libera` (Task 2).
- Produce:
  - `js/creazione.js`: `mostraPassoCreazione()` disegna il passo di `activeHeroForCreation` **senza azzerarlo**. Il passo è in `activeHeroForCreation.creationStep`: `'scelta'` = abilità o rune, `'armeria'` = oggetti. `selectHeroCard(nome)` crea l'eroe con `creationStep = 'scelta'` (o `'armeria'` se non ha né rune né abilità) e chiama `mostraPassoCreazione()`. `selectAbility` e `confirmCreationRunes` mettono `'armeria'`. `nextHero` cancella `creationStep` insieme a `startingPick`. Per la partita sul PC il comportamento non cambia.
  - `js/online.js`:
    - in `onlineState`: `creando: null` (nome dell'eroe in creazione) e `bozze: {}` (nome → copia di `activeHeroForCreation`); `ordineCreazione` si toglie;
    - `onlineGiocatoriCollegati()` tiene solo i giocatori con `name` non null;
    - `onlineCapo()` = `capoSpedizione(stato.party.map(h => h.name), onlineState.giocatori)`;
    - `onlineTurnoCreazione()` → `onlineState.creando` se un giocatore collegato ha quel nome, altrimenti `null` (allora decide il master). `contestoOnline().creationTurn` usa questa funzione;
    - `onlineRosa()` → `rosaOnline(currentScreenId, campaignHeroes.map(h => h.name), stato.party.map(h => h.name), onlineState.bozze, onlineState.creando)`, mandata come `rosa` in `onlineInviaStato`;
    - `onlineSceltaEroe({ id, eroe })` (evento `scelta`): se l'eroe è nella compagnia, aggiorna solo lo stato. Se è in `bozze`, riprende la bozza: `activeHeroForCreation` = bozza, la toglie da `bozze`, `creando = eroe`, `mostraPassoCreazione()`. Se è `'da_creare'`: con `creando` nullo chiama `selectHeroCard(eroe)`; altrimenti chiama `POST /api/online/libera { id, motivo: 'Sta creando: <creando>' }`;
    - involucro di `selectHeroCard`: `onlineState.creando = nome` (vale anche quando crea il master);
    - involucro di `nextHero`: `stato.onlineOwners = ownersIdentita(stato.party)` dopo l'originale, `creando = null`;
    - involucro di `startPartyCreation` (online): azzera `bozze` e `creando`; mette in `partySizeSelect` un'opzione `campaignHeroes.length` e la seleziona; chiama `confirmPartySize()`, così il passo "quanti eroi" si salta. L'involucro vecchio di `confirmPartySize`, quello che contava i collegati, si toglie;
    - `onlineSospendiCreazione()`: viene chiamata da `onlineStanzaCambiata` quando `creando` è il nome di un giocatore che risulta scollegato, oppure che non c'è più. Fa queste cose: `bozze[creando] = copia profonda di activeHeroForCreation`, `activeHeroForCreation = null`, `creando = null`, mostra di nuovo la griglia (`heroCreationArea` visibile, `abilityArea`/`armoryArea`/`btnProceedHero` nascosti, `loadHeroGridOptions()`). Una creazione del master (nessun giocatore con quel nome) non si sospende mai;
    - `loadHeroGridOptions` online nasconde anche gli eroi in `bozze`. Il master riprende una bozza con un pulsante "Riprendi <eroe>" disegnato nella lobby (`onlineDisegnaLobby`), che chiama `onlineRiprendiBozza(eroe)` con `data-action`;
    - `onlineDisegnaLobby` elenca la rosa con lo stato e con chi è collegato, al posto dei nomi delle persone;
    - `onlineRiprendi()`: dopo `loadFromSlot('online')`, `stato.onlineOwners = ownersIdentita(stato.party)`;
    - `onlineAvvisoConnessioni`: i messaggi usano il nome dell'eroe; gli spettatori non generano avvisi.

- [ ] **Passo 1: scrivi i test che falliscono**, in `tests/online.test.js`. Usa `carica()` come nei test esistenti, con `stato.currentCampaign` e `campaignHeroes` presi da una campagna di `h.CAMPAIGNS` che ha almeno 2 eroi, e `globalThis.onlinePost = () => Promise.resolve({})`.
  - `'creazione chi prima arriva: la scelta fa partire la creazione, la seconda aspetta'`:
    - giocatori `[{ id:'1', name:'<eroe1>', connected:true }, { id:'2', name:'<eroe2>', connected:true }]`, `currentScreenId = 'screenParty'`;
    - `onlineSceltaEroe({ id:'1', eroe:'<eroe1>' })` → `onlineState.creando === '<eroe1>'` e `activeHeroForCreation.name === '<eroe1>'`;
    - `onlineSceltaEroe({ id:'2', eroe:'<eroe2>' })` → `onlinePost` chiamato con `'/api/online/libera'` e `motivo 'Sta creando: <eroe1>'`.
  - `'creazione sospesa: la bozza tiene le rune scelte e si riprende'`:
    - eroe con le rune (Alastorta, da `loch_ein_parte_1`); dopo `selectHeroCard` e un `toggleCreationRune`, il giocatore risulta scollegato e si chiama `onlineStanzaCambiata()`;
    - `onlineState.bozze['<eroe>'].equippedRunes.length === 1` e `creando === null`;
    - `onlineSceltaEroe` dello stesso eroe → `activeHeroForCreation.equippedRunes.length === 1` e `creationStep === 'scelta'`.
  - `'owners: identità dopo nextHero e dopo un salvataggio vecchio'`: dopo `nextHero`, `stato.onlineOwners` è uguale a `{ '<eroe1>': '<eroe1>' }`. Un salvataggio online con `onlineOwners: { '<eroe1>': 'Marco' }` caricato con `onlineRiprendi` dà `{ '<eroe1>': '<eroe1>' }`.
  - `'spettatori: niente voti, niente clic, niente capo'`: giocatori `[{ name:null, connected:true }, { name:'Icaro', connected:true }]` → `onlineGiocatoriCollegati()` restituisce solo `'Icaro'`. Uno `onlineEseguiClic({ giocatore: null, azione: '__vota', ... })` non registra voti.
  - Riscrivi `'creazione a turno…'` e `'revisione #5…'`: diventano `onlineTurnoCreazione()` = `creando` solo se quel giocatore è collegato.
  - Aggiorna `'capo della spedizione…'` dove serve: l'ordine viene da `stato.party`.
- [ ] **Passo 2:** `node tests/run.js` → i test nuovi falliscono.
- [ ] **Passo 3:** dividi `selectHeroCard` / `mostraPassoCreazione` in `js/creazione.js`. Lancia `node tests/run.js`: i test della creazione sul PC (`tests/*` che usano `selectHeroCard`) restano verdi.
- [ ] **Passo 4:** scrivi le modifiche a `js/online.js` descritte in "Produce". Collega `onlineMasterStream.addEventListener('scelta', e => onlineSceltaEroe(JSON.parse(e.data)))` in `onlineApri`.
- [ ] **Passo 5:** `node tests/run.js` → tutti verdi; `node --check js/online.js js/creazione.js`.
- [ ] **Passo 6:** lascia le modifiche nella copia di lavoro.

---

### Task 4: Pagina del giocatore — ingresso, scelta dell'eroe, attesa

**File:**
- Modifica: `server/public/online.html` (modulo d'ingresso senza campo nome; contenitori `#onlineScelta` e `#onlineAttesa` con i loro stili)
- Modifica: `server/public/online.js` (`onlineEntra`, `avvio`, nuovo `disegnaScelta()`, intercetta `selectHeroCard`, `segnaEroi`, `turnoAltrui`)

**Interfacce:**
- Consuma: `entra` / `scegli` (Task 2); `stato.rosa`, `stato.giocatori` con `id`/`name`/`connected` (Task 3).
- Produce: la pagina non manda mai più `nome`.

- [ ] **Passo 1:** sistema il modulo d'ingresso. Togli `#onlineNome`. Il giocatore normale **non vede** il modulo: `avvio()` senza token salvato chiama subito `entra` come `'giocatore'`. Il modulo resta solo per "Entra come Moderatore", che compare come pulsantino nell'angolo del pannello di scelta, e per il link del master ("Entra come Master", testo senza "scrivi il tuo nome"). Con un token non più valido, `avvio()` cancella la chiave e rientra come nuovo giocatore.
- [ ] **Passo 2:** scrivi `disegnaScelta()`, chiamata a ogni evento `stato`. Mostra `#onlineAttesa` con `"Il master sta preparando il capitolo…"` se `ruolo === 'giocatore'`, `nome` è null e `rosa.fase === 'attesa'`. Mostra `#onlineScelta` (`"Scegli il tuo eroe"`) se `nome` è null e la fase è `'creazione'` o `'partita'`. Ogni eroe è un pulsante con ritratto (le stesse classi di `.hero-portrait` del gioco) e nome. Un eroe è **occupato** se un giocatore collegato ha `name === eroe`: pulsante disattivato, spento con `filter: grayscale(1) brightness(0.6)`, scritta "occupato". Un eroe `'in_creazione'` di un altro mostra `"Sta creando: <eroe>"`. Il tocco chiama `post('/api/online/scegli', { code, token, eroe })`: con ok aggiorna `nome` e salva `{ token, nome, ruolo }`; con errore mostra `mostraAvviso(r.error)`. Se tutti gli eroi sono occupati, il pannello si chiude in "Stai guardando: tutti gli eroi sono in gioco". In ogni caso il giocatore continua a vedere la schermata del master sotto.
- [ ] **Passo 3:** in `inoltra()`, un clic su `data-action="selectHeroCard"` di un giocatore senza eroe diventa `scegli` con `args[0]`, invece di passare da `/api/online/clic`.
- [ ] **Passo 4:** al ricevere `stanza`/`stato`, se il proprio `id` in `stato.giocatori` ha un `name` diverso (per esempio tornato `null` dopo `libera`), aggiorna `nome` e salvalo. In `turnoAltrui` il testo diventa `'Tocca a ' + <eroi>.join(', ')`, cioè solo i nomi degli eroi. In `.hero-mini-card.online-altro` sostituisci `opacity: 0.8` con `filter: brightness(0.8)`.
- [ ] **Passo 5:** prova a mano con `node tools/prova_online.mjs` (verde) e con la lista di controllo del Task 5 su due browser. Lascia le modifiche nella copia di lavoro.

---

### Task 5: Documentazione e lista di controllo

**File:**
- Modifica: `docs/online.md` (paragrafo della partita online: ingresso, identità = eroe, rosa, bozze, numero di eroi, `scegli`/`libera`, spettatori; "Master a distanza": nome `'Master'`, nessun nome da scrivere)
- Modifica: `docs/superpowers/prova-online.md` (casi nuovi)

- [ ] **Passo 1:** aggiorna `docs/online.md` con i nomi delle funzioni e delle chiamate dei Task 1–4.
- [ ] **Passo 2:** aggiungi a `docs/superpowers/prova-online.md` questi casi:
  1. due telefoni toccano lo stesso eroe;
  2. chi crea chiude il browser a metà e lo riprende da un altro browser, con rune e oggetti al loro posto;
  3. un giocatore cade in uno scontro e rientra dal telefono di un altro;
  4. il master crea un eroe che nessuno ha preso, e poi un ritardatario lo sceglie;
  5. una partita salvata viene ripresa con un codice nuovo;
  6. il link del master a distanza funziona come prima.
- [ ] **Passo 3:** `node tests/run.js` e `node tools/prova_online.mjs` → verdi. Lascia le modifiche nella copia di lavoro.
