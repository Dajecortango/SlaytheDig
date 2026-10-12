# Partita online — piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** giocatori a distanza vedono la schermata del master e comandano ognuno un eroe; le scelte comuni si votano.

**Architecture:** la partita gira solo nel browser del master (`http://localhost:8787/index.html`). `js/online.js` manda al server le regioni della pagina che cambiano e riceve i clic dei giocatori, che esegue dopo il controllo `onlineCanRun` (funzione pura in `js/online-regole.js`). Il server (`server/online.js`, richiesto da `server/server.js`) tiene stanza, giocatori e token, inoltra regioni (stream SSE gzip) e clic, e serve media leggeri. La pagina del giocatore (`server/public/online.html` + `server/public/online.js`) inserisce le regioni e inoltra i clic.

**Tech Stack:** JavaScript puro nel browser (nessuna build), Node senza dipendenze (`http`, `zlib`, `crypto`, `child_process` per ffmpeg), test con `node tests/run.js`.

**Spec:** `docs/superpowers/specs/2026-10-12-partita-online-design.md`

## Global Constraints

- Niente npm, niente bundler, niente dipendenze nuove; librerie solo in `js/vendor/` (nessuna nuova serve).
- Pulsanti solo con `data-action` / `data-change` / ... (`js/azioni.js`), mai `onclick="..."` nell'HTML o nelle stringhe HTML (`tests/azioni.test.js` lo controlla).
- Testi, commenti e nomi in italiano; valuta scritta "Scudi".
- Numeri nuovi in `js/regole.js`: `VOTE_SECONDS = 30`, `VOTE_SECONDS_TARGET = 15`, `ONLINE_DISCONNECT_SECONDS = 20`, `ONLINE_FRAME_MS = 100`.
- Le chiamate da master al server sono accettate solo con `Host` = `localhost:<porta>` o `127.0.0.1:<porta>`.
- Media leggeri: immagini lato massimo 960 px WebP qualità 65; video 480p H.264 CRF 32 senza audio; cache in `server/cache-leggera/` (ignorata da git); senza ffmpeg si manda l'originale.
- Cache del browser: immagini, video, audio, font `Cache-Control: public, max-age=604800`; HTML, JS, CSS `no-store` come oggi.
- Azioni non elencate in `ONLINE_PERMESSI`: solo master.
- Il gioco in solitaria e la pagina del telefono `/g/<eroe>` non cambiano comportamento.
- Ogni file `js/` nuovo va in `index.html` e, se è motore puro, in `SCRIPT_MOTORE` di `tests/ambiente.js`; `node --check` su ogni file toccato; `node tests/run.js` verde prima di ogni commit (il pre-commit lo fa).

## Review Focus

- Clic di un giocatore che arriva dopo che la schermata del master è cambiata: l'elemento al percorso non ha più la stessa azione → rifiutato con "La schermata è cambiata, riprova", mai eseguito su un altro pulsante (Task 6, test su `trovaElementoRemoto`).
- Giocatore che manda il valore di un menu con un eroe non suo (es. `combatHeroSelect` = eroe di un altro) e poi conferma: rifiutato (Task 1, test `eroeDelMenu`).
- Nome di ingresso già usato da un altro giocatore collegato, vuoto o lunghissimo: rifiutato o accorciato (Task 4, prova `entra`).
- Voto con un giocatore che si disconnette a metà: il voto si chiude senza aspettarlo (Task 1 `resolveVote` con disconnessi, Task 12 prova a mano).
- Più giocatori che premono "Prosegui" insieme: la seconda pressione arriva su un pulsante sparito o con altra azione → rifiutata, nessun doppio avanzamento (stesso controllo del primo punto).

---

## Mappa dei file

| File | Nuovo/Modifica | Responsabilità |
|---|---|---|
| `js/online-regole.js` | nuovo | funzioni pure: `ONLINE_PERMESSI`, `onlineRegola`, `onlineCanRun`, `resolveVote`, `nextCaptain`, `changedRegions`, `leggeroUrl`, `rendiLeggero` |
| `js/regole.js` | modifica | numeri della partita online |
| `js/azioni.js` | modifica | `window.onlineGate` prima di ogni azione; `chiamaAzione` esportata |
| `js/interfaccia.js` | modifica | pulsanti della finestra con `data-modal-btn` |
| `js/mappa.js` | modifica | nodi della mappa con `data-action="selectStsNode"` |
| `js/salvataggi.js` | modifica | `onlineOwners` nel salvataggio, versione 5, slot `online` |
| `js/online.js` | nuovo | lato master: pannello, stanza, regioni, clic remoti, permessi, voti, pronti, capo, salvataggio automatico |
| `index.html` | modifica | script `js/online-regole.js` e `js/online.js` |
| `server/online.js` | nuovo | stanza, giocatori, token, stream gzip, inoltro, media leggeri |
| `server/server.js` | modifica | delega a `server/online.js`, cache dei media |
| `server/public/online.html`, `server/public/online.js` | nuovi | pagina del giocatore |
| `tests/online.test.js` | nuovo | test delle regole e del salvataggio |
| `tools/prova_online.mjs` | nuovo | prova del server con master e due giocatori finti |
| `.gitignore`, `CLAUDE.md`, `docs/superpowers/prova-online.md` | modifica/nuovo | cache, documentazione, lista di controllo |

---

## TAPPA 1 — Si gioca

### Task 1: Regole pure della partita online

**Files:**
- Create: `js/online-regole.js`
- Modify: `js/regole.js` (in fondo), `tests/ambiente.js` (`SCRIPT_MOTORE`), `index.html` (script dopo `js/regole.js`)
- Test: `tests/online.test.js`

**Interfaces:**
- Produces:
  - `ONLINE_MASTER` (stringa `'__master__'`)
  - `onlineRegola(azione, ctx) -> string` (regola effettiva, risolve le regole per schermata)
  - `onlineCanRun(azione, args, giocatore, ctx) -> { ok: boolean, voto?: string, pronto?: boolean, motivo?: string }`
  - `ctx` = `{ screen, owners: {eroe: giocatore}, activeHero, selects: {idSelect: valore}, creationTurn, discardHero, challengeHero, prayingHero, captainHero, modalOwner, voto: {tipo}|null }`
  - `resolveVote(voti, opzioni, capo, collegati) -> idOpzione|null` (`voti` = `{giocatore: idOpzione}`)
  - `nextCaptain(giocatori, livello) -> nome|null` (`giocatori` = `[{name, connected}]` in ordine d'ingresso)
  - `changedRegions(prima, dopo) -> {regione: html|null}` (solo le cambiate; `null` = regione sparita)
  - `leggeroUrl(percorso) -> string` e `rendiLeggero(html) -> string`

- [ ] **Step 1: Numeri in `js/regole.js`** (in fondo al file)

```js
/* ---------- Partita online (js/online.js, server/online.js) ---------- */
const VOTE_SECONDS = 30;               // durata di un voto
const VOTE_SECONDS_TARGET = 15;        // voto sul bersaglio del nemico, più corto per non spezzare lo scontro
const ONLINE_DISCONNECT_SECONDS = 20;  // senza segnale per tanto, il giocatore è disconnesso
const ONLINE_FRAME_MS = 100;           // intervallo minimo fra due invii della schermata
```

- [ ] **Step 2: Scrivi il test che fallisce** — `tests/online.test.js`

```js
// Partita online: permessi, voti, capo della spedizione, regioni cambiate, media leggeri (js/online-regole.js)
module.exports = (t, carica) => {
    const g = carica();
    const M = g.eval('ONLINE_MASTER');
    const base = (extra = {}) => ({ screen: 'screenCombat', owners: { Icaro: 'Marco', Astarte: 'Sara' }, activeHero: null,
        selects: {}, creationTurn: null, discardHero: null, challengeHero: null, prayingHero: null, captainHero: null,
        modalOwner: null, voto: null, ...extra });

    t.test('il master può tutto, le azioni non elencate sono solo sue', () => {
        t.ok(g.onlineCanRun('saveGame', [], M, base()).ok);
        t.ok(!g.onlineCanRun('saveGame', [], 'Marco', base()).ok);
        t.ok(!g.onlineCanRun('azioneInventata', [], 'Marco', base()).ok);
    });

    t.test('scontro: si agisce solo con il proprio eroe', () => {
        t.ok(g.onlineCanRun('selectCombatAction', ['attack'], 'Marco', base({ activeHero: 'Icaro' })).ok);
        t.ok(!g.onlineCanRun('selectCombatAction', ['attack'], 'Sara', base({ activeHero: 'Icaro' })).ok);
        t.ok(g.onlineCanRun('confirmCombatHeroChoice', [], 'Sara', base({ selects: { combatHeroSelect: 'Astarte' } })).ok);
        t.ok(!g.onlineCanRun('confirmCombatHeroChoice', [], 'Sara', base({ selects: { combatHeroSelect: 'Icaro' } })).ok, 'menu con l\'eroe di un altro');
    });

    t.test('argomento con il nome dell\'eroe, scarto, creazione, finestre', () => {
        t.ok(g.onlineCanRun('trySellItem', ['Icaro', 0], 'Marco', base({ screen: 'screenMerchant' })).ok);
        t.ok(!g.onlineCanRun('trySellItem', ['Icaro', 0], 'Sara', base({ screen: 'screenMerchant' })).ok);
        t.ok(g.onlineCanRun('executeDiscard', [1], 'Sara', base({ discardHero: 'Astarte' })).ok);
        t.ok(g.onlineCanRun('selectHeroCard', ['Icaro'], 'Marco', base({ screen: 'screenParty', creationTurn: 'Marco' })).ok);
        t.ok(!g.onlineCanRun('selectHeroCard', ['Icaro'], 'Sara', base({ screen: 'screenParty', creationTurn: 'Marco' })).ok);
        t.ok(g.onlineCanRun('__modal', [0], 'Sara', base({ modalOwner: null })).ok, 'finestra del gioco: chiunque');
        t.ok(!g.onlineCanRun('__modal', [0], 'Sara', base({ modalOwner: 'Marco' })).ok, 'finestra aperta da Marco');
    });

    t.test('mappa: il clic di un giocatore è un voto; showScreen solo per vittoria e sconfitta', () => {
        t.uguale('mappa', g.onlineCanRun('selectStsNode', [3], 'Marco', base({ screen: 'screenMap' })).voto);
        t.ok(g.onlineCanRun('showScreen', ['screenVictory'], 'Marco', base()).ok);
        t.ok(!g.onlineCanRun('showScreen', ['screenStart'], 'Marco', base()).ok);
    });

    t.test('resolveVote: maggioranza, pareggio e silenzio al capo, disconnessi esclusi', () => {
        const op = ['a', 'b', 'c'];
        t.uguale('b', g.resolveVote({ Marco: 'b', Sara: 'b', Luca: 'a' }, op, 'Luca', ['Marco', 'Sara', 'Luca']));
        t.uguale('a', g.resolveVote({ Marco: 'b', Luca: 'a' }, op, 'Luca', ['Marco', 'Luca']), 'pareggio: vince il voto del capo');
        t.uguale('a', g.resolveVote({}, op, 'Luca', ['Luca']), 'nessun voto: la prima opzione');
        t.uguale('b', g.resolveVote({ Marco: 'b', Sara: 'a' }, op, 'Luca', ['Marco']), 'Sara disconnessa non conta');
        t.uguale(null, g.resolveVote({ Marco: 'x' }, op, 'Luca', ['Marco']) === 'x' ? 'x' : null, 'opzione inesistente ignorata');
    });

    t.test('nextCaptain: un capo diverso a ogni livello, salta i disconnessi', () => {
        const gi = [{ name: 'Marco', connected: true }, { name: 'Sara', connected: false }, { name: 'Luca', connected: true }];
        t.uguale('Marco', g.nextCaptain(gi, 0));
        t.uguale('Luca', g.nextCaptain(gi, 1));
        t.uguale('Marco', g.nextCaptain(gi, 2));
        t.uguale(null, g.nextCaptain([], 0));
    });

    t.test('changedRegions e media leggeri', () => {
        t.uguale({}, g.changedRegions({ a: '1', b: '2' }, { a: '1', b: '2' }));
        t.uguale({ b: '3', c: null }, g.changedRegions({ a: '1', b: '2', c: 'x' }, { a: '1', b: '3' }));
        t.uguale('/leggero/immagini/scene/x.webp', g.leggeroUrl('immagini/scene/x.webp'));
        t.uguale('immagini/icone/BTNA.png', g.leggeroUrl('immagini/icone/BTNA.png'), 'le icone restano');
        t.uguale('<img src="/leggero/immagini/a.webp"><video src="/leggero/video/nemici/b.mp4">',
            g.rendiLeggero('<img src="immagini/a.webp"><video src="video/nemici/b.mp4">'));
        t.uguale('url(&quot;/leggero/immagini/c.webp&quot;)', g.rendiLeggero('url(&quot;immagini/c.webp&quot;)'));
    });
};
```

- [ ] **Step 3: Aggiungi lo script all'ambiente e alla pagina, poi verifica che il test fallisca**

In `tests/ambiente.js` metti `'js/online-regole.js'` subito dopo `'js/regole.js'` in `SCRIPT_MOTORE`. In `index.html` aggiungi `<script src="js/online-regole.js"></script>` subito dopo `<script src="js/regole.js"></script>`.

Run: `node tests/run.js`
Expected: `online.test.js` fallisce (il file `js/online-regole.js` non esiste: "il file non si carica").

- [ ] **Step 4: Implementa `js/online-regole.js`**

```js
/* ==========================================================================
   PARTITA ONLINE: REGOLE (funzioni pure, niente DOM)
   Usate dal gioco del master (js/online.js), dalla pagina dei giocatori
   (server/public/online.js) e dai test. Chi può fare cosa, come si chiude
   un voto, chi è il capo della spedizione, quali regioni della schermata
   sono cambiate, quali percorsi diventano media leggeri.
   ========================================================================== */
const ONLINE_MASTER = '__master__';

/* Regole (spec, sezione 5):
   'tutti'            chiunque
   'creazione'        il giocatore di turno nella creazione degli eroi
   'eroeAttivo'       il proprietario dell'eroe che sta agendo in combattimento
   'menu:<id>'        il proprietario dell'eroe scelto nel menu <id>
   'argomento'        il proprietario dell'eroe passato come primo argomento
   'scarto'           il proprietario dell'eroe che deve scartare
   'prova'            il proprietario dell'eroe che affronta la prova
   'preghiera'        il proprietario dell'eroe che prega
   'capitano'         il proprietario dell'eroe scelto contro il capitano
   'voto:<tipo>'      il clic del giocatore diventa un voto
   'pronti'           il clic del giocatore vale "Ho finito"
   'finale'           showScreen solo verso vittoria o sconfitta
   'modale'           i pulsanti della finestra: chi l'ha aperta (chiunque se l'ha aperta il gioco)
   Un oggetto { screenX: regola, altrove: regola } sceglie la regola secondo la schermata. */
const ONLINE_PERMESSI = {
    // Chiunque
    startExpedition: 'tutti', finishStory: 'tutti', proceedCombatPhase: 'tutti', resumeHeroesTurn: 'tutti',
    triggerLoot: 'tutti', revealLootItem: 'tutti', selectLootChoice: 'tutti', openTreasure: 'tutti',
    selectTreasureItem: 'tutti', cancelTreasureItemSelection: 'tutti', confirmLeaveTreasure: 'tutti',
    revealMerchantItem: 'tutti', showMerchantTab: 'tutti', tryBuyMerchantItem: 'tutti', openMedic: 'tutti',
    startPrayer: 'tutti', toggleHeroCard: 'tutti', toggleDescBox: 'tutti', openJournal: 'tutti',
    finishLostFinal: 'tutti', finishWonFinal: 'tutti', challengeChoose: 'tutti',
    advanceNode: { screenRest: 'pronti', altrove: 'tutti' },
    confirmLeaveMerchant: 'pronti',
    showScreen: 'finale',
    // Creazione degli eroi
    selectHeroCard: 'creazione', selectAbility: 'creazione', toggleCreationRune: 'creazione',
    confirmCreationRunes: 'creazione', togglePickItem: 'creazione', nextHero: 'creazione',
    // Combattimento
    selectCombatAction: 'eroeAttivo', executeCombatHeroRoll: 'eroeAttivo', executeCombatUseItem: 'eroeAttivo',
    backToCombatActions: 'eroeAttivo', cancelCombatItemSubmenu: 'eroeAttivo', cancelCombatHeroChoice: 'eroeAttivo',
    confirmCombatHeroChoice: 'menu:combatHeroSelect',
    executeMonsterAttack: 'voto:bersaglio',
    // Eroe scelto in un menu o passato come argomento
    confirmLootAssignment: 'menu:lootHeroSelect', confirmTreasureAssignment: 'menu:treasureHeroSelect',
    confirmMerchantAssignment: 'menu:merchantHeroSelect', confirmChallengeHero: 'menu:challengeHeroSelect',
    captainAction: 'menu:captainHeroSelect', confirmPrayerHero: 'menu:prayerHeroSelect',
    trySellItem: 'argomento', openRuneSwap: 'argomento', useConsumableFromTopbar: 'argomento',
    executeDiscard: 'scarto',
    executeChallengeRoll: 'prova',
    executePrayerRoll: 'preghiera', chooseBlessing: 'preghiera', giveBlessing: 'preghiera',
    executeCaptainRoll: 'capitano',
    // Voti
    selectStsNode: 'voto:mappa', openHaggle: 'voto:contratta', haggle: 'voto:contratta', rerollMerchantStock: 'voto:rinnova',
    // Pulsanti della finestra e voto dalla barra
    __modal: 'modale', __vota: 'tutti'
};

function onlineRegola(azione, ctx) {
    const r = ONLINE_PERMESSI[azione];
    if (!r) return 'master';
    if (typeof r === 'string') return r;
    return r[ctx.screen] || r.altrove || 'master';
}

// { ok } esegue; { voto } registra un voto di quel tipo; { pronto } vale "Ho finito"; { motivo } rifiuta
function onlineCanRun(azione, args, giocatore, ctx) {
    if (giocatore === ONLINE_MASTER) return { ok: true };
    const regola = onlineRegola(azione, ctx);
    const owners = ctx.owners || {};
    const mio = eroe => !!eroe && owners[eroe] === giocatore;
    const no = motivo => ({ ok: false, motivo });
    if (regola === 'tutti') return { ok: true };
    if (regola === 'master') return no('Solo il master può farlo');
    if (regola === 'finale') return ['screenVictory', 'screenDefeat'].includes(args[0]) ? { ok: true } : no('Solo il master può farlo');
    if (regola === 'pronti') return { ok: false, pronto: true };
    if (regola.startsWith('voto:')) return { ok: false, voto: regola.slice(5) };
    if (regola === 'creazione') return ctx.creationTurn === giocatore ? { ok: true } : no('Sta scegliendo un altro giocatore');
    if (regola === 'eroeAttivo') return mio(ctx.activeHero) ? { ok: true } : no('Non è il tuo turno');
    if (regola.startsWith('menu:')) return mio((ctx.selects || {})[regola.slice(5)]) ? { ok: true } : no('Puoi scegliere solo il tuo eroe');
    if (regola === 'argomento') return mio(args[0]) ? { ok: true } : no('Puoi farlo solo per il tuo eroe');
    if (regola === 'scarto') return mio(ctx.discardHero) ? { ok: true } : no('Sta scegliendo chi deve scartare');
    if (regola === 'prova') return mio(ctx.challengeHero) ? { ok: true } : no('Tira chi affronta la prova');
    if (regola === 'preghiera') return mio(ctx.prayingHero) ? { ok: true } : no('Decide chi ha pregato');
    if (regola === 'capitano') return mio(ctx.captainHero) ? { ok: true } : no('Tira l\'eroe scelto');
    if (regola === 'modale') return !ctx.modalOwner || ctx.modalOwner === giocatore ? { ok: true } : no('Questa finestra è di un altro giocatore');
    return no('Solo il master può farlo');
}

// Esito di un voto: maggioranza fra i voti dei collegati; pareggio → l'opzione votata dal capo
// (se è fra le pari), altrimenti la prima delle pari nell'ordine delle opzioni; nessun voto → la prima opzione
function resolveVote(voti, opzioni, capo, collegati) {
    const conta = {};
    Object.entries(voti || {}).forEach(([chi, op]) => {
        if (!collegati.includes(chi) || !opzioni.includes(op)) return;
        conta[op] = (conta[op] || 0) + 1;
    });
    const max = Math.max(0, ...Object.values(conta));
    if (max === 0) return opzioni[0] !== undefined ? opzioni[0] : null;
    const pari = opzioni.filter(op => conta[op] === max);
    if (pari.length === 1) return pari[0];
    const sceltaCapo = (voti || {})[capo];
    return pari.includes(sceltaCapo) ? sceltaCapo : pari[0];
}

// Capo della spedizione: a rotazione fra i collegati, nell'ordine d'ingresso, uno per livello della mappa
function nextCaptain(giocatori, livello) {
    const vivi = (giocatori || []).filter(gi => gi.connected);
    if (!vivi.length) return null;
    return vivi[((livello % vivi.length) + vivi.length) % vivi.length].name;
}

// Regioni da inviare: solo quelle cambiate; null per quelle sparite
function changedRegions(prima, dopo) {
    const out = {};
    Object.keys(dopo).forEach(k => { if (prima[k] !== dopo[k]) out[k] = dopo[k]; });
    Object.keys(prima).forEach(k => { if (!(k in dopo)) out[k] = null; });
    return out;
}

// Media leggeri per i giocatori: immagini grandi e video passano da /leggero/ (icone, cursori, interfaccia no)
const ONLINE_LEGGERO_RE = /^(immagini\/(?!icone\/|cursori\/|ui\/)|video\/)/;
function leggeroUrl(percorso) {
    return ONLINE_LEGGERO_RE.test(percorso) ? '/leggero/' + percorso : percorso;
}
function rendiLeggero(html) {
    return String(html).replace(/(src="|url\((?:&quot;|["'])?)((?:immagini|video)\/[^"'&)\s]+)/g,
        (m, prima, percorso) => prima + leggeroUrl(percorso));
}

// Node (server e test fuori da vm): stesse funzioni come modulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ONLINE_MASTER, ONLINE_PERMESSI, onlineRegola, onlineCanRun, resolveVote, nextCaptain, changedRegions, leggeroUrl, rendiLeggero };
}
```

Nota sul test di `resolveVote` "opzione inesistente ignorata": con l'unico voto su `'x'` (non fra le opzioni) il risultato è `'a'` (prima opzione), quindi l'espressione del test dà `null`: corretto.

- [ ] **Step 5: Esegui i test**

Run: `node --check js/online-regole.js && node tests/run.js`
Expected: tutti verdi, `online.test.js` con 7 test passati.

- [ ] **Step 6: Commit**

```bash
git add js/online-regole.js js/regole.js tests/ambiente.js tests/online.test.js index.html
git commit -m "Partita online: regole pure (permessi, voti, capo, regioni, media leggeri)"
```

---

### Task 2: Cancello delle azioni, pulsanti delle finestre, nodi della mappa

**Files:**
- Modify: `js/azioni.js` (funzione `esegui`), `js/interfaccia.js:294-304` (`openModal`), `js/mappa.js:175`
- Test: `tests/online.test.js` (aggiunta)

**Interfaces:**
- Produces:
  - `window.onlineGate(nome, args, el, tipo) -> boolean` (facoltativo: lo imposta `js/online.js`; se manca o ritorna true l'azione parte)
  - `window.chiamaAzione(nome, args, el) -> boolean` (passa dal cancello e chiama `window[nome]`; true se eseguita)
  - pulsanti della finestra: attributo `data-modal-btn="<indice>"`
  - nodi della mappa: `data-action="selectStsNode"` con `data-args="[id]"`

- [ ] **Step 1: Test che fallisce** (in fondo a `tests/online.test.js`, dentro `module.exports`)

```js
    t.test('cancello delle azioni: se onlineGate dice no, la funzione non parte', () => {
        const h = carica();
        h.eval('globalThis.__chiamate = 0; globalThis.provaAzione = () => { globalThis.__chiamate++; }');
        t.ok(h.chiamaAzione('provaAzione', [], null));
        h.eval('window.onlineGate = () => false');
        t.ok(!h.chiamaAzione('provaAzione', [], null));
        t.uguale(1, h.eval('globalThis.__chiamate'));
    });
```

Run: `node tests/run.js` — Expected: FAIL "chiamaAzione is not a function".

- [ ] **Step 2: Implementa in `js/azioni.js`**

Sostituisci nel ciclo di `esegui` il blocco:

```js
            const nome = el.dataset[def.attr];
            const fn = window[nome];
            if (typeof fn === 'function') {
                if (el.tagName === 'A') evento.preventDefault();
                fn.apply(el, leggiArgomenti(el, def.args, evento));
            } else {
                console.error(`data-${def.attr}: funzione "${nome}" non trovata`);
            }
```

con:

```js
            const nome = el.dataset[def.attr];
            if (typeof window[nome] === 'function') {
                if (el.tagName === 'A') evento.preventDefault();
                chiamaAzione(nome, leggiArgomenti(el, def.args, evento), el, tipo);
            } else {
                console.error(`data-${def.attr}: funzione "${nome}" non trovata`);
            }
```

e aggiungi, prima di `function esegui`:

```js
    // Partita online (js/online.js): window.onlineGate decide se l'azione può partire
    // (permessi dei giocatori, voti). Senza partita online parte sempre.
    function chiamaAzione(nome, args, el, tipo = 'click') {
        if (typeof window.onlineGate === 'function' && !window.onlineGate(nome, args, el, tipo)) return false;
        window[nome].apply(el, args);
        return true;
    }
```

e dopo `window.azione = ...`:

```js
    window.chiamaAzione = chiamaAzione;
```

- [ ] **Step 3: Pulsanti della finestra con indice** — in `js/interfaccia.js`, dentro `openModal`, cambia `(actions || [{ label: 'OK' }]).forEach(action => {` in `(actions || [{ label: 'OK' }]).forEach((action, i) => {` e subito dopo `btn.textContent = action.label;` aggiungi:

```js
                btn.dataset.modalBtn = String(i);  // partita online: il giocatore indica il pulsante per indice
```

- [ ] **Step 4: Nodi della mappa con `data-action`** — in `js/mappa.js` sostituisci `nodeEl.onclick = () => selectStsNode(node.id);` con:

```js
                    impostaAzione(nodeEl, 'selectStsNode', node.id);  // passa dal cancello della partita online
```

- [ ] **Step 5: Verifica**

Run: `node --check js/azioni.js js/interfaccia.js js/mappa.js && node tests/run.js`
Expected: tutti verdi (anche `azioni.test.js`: `selectStsNode` esiste come funzione globale).

- [ ] **Step 6: Commit**

```bash
git add js/azioni.js js/interfaccia.js js/mappa.js tests/online.test.js
git commit -m "Azioni: cancello per la partita online, pulsanti delle finestre e nodi della mappa indicizzati"
```

---

### Task 3: Salvataggio con i proprietari degli eroi e slot "Online"

**Files:**
- Modify: `js/salvataggi.js` (`SAVE_VERSION`, `SAVE_MIGRATIONS`, `buildSaveData`, `applySaveData`)
- Modify: `js/spedizione.js` (`azzeraPartita`: `onlineOwners: {}`)
- Test: `tests/online.test.js`, `tests/salvataggi.test.js` (versione 5)

**Interfaces:**
- Produces: `stato.onlineOwners` (`{ nomeEroe: nomeGiocatore }`, `{}` fuori dalla partita online); slot `'online'` usabile con `readSave('online')`, `writeSave('online', data)`, `loadFromSlot('online')`.

- [ ] **Step 1: Test che falliscono**

In `tests/salvataggi.test.js` cambia `'il formato attuale è il 4'` / `t.uguale(4, ...)` in 5 (stesso test), e i due `t.uguale(4, s.version)` in `t.uguale(5, s.version)` (test "1 -> 4"); rinomina i titoli "-> 4" in "-> 5".

In `tests/online.test.js`:

```js
    t.test('salvataggio: i proprietari degli eroi vanno e tornano, i vecchi salvataggi hanno {}', () => {
        const h = carica();
        const stato = h.eval('stato');
        stato.currentCampaign = h.CAMPAIGNS.tutorial;
        stato.stsMapNodes = []; stato.party = [{ name: 'Curio Dignitas', hp: 4, maxHp: 4, items: [] }];
        stato.unlockedRelics = []; stato.activeCurses = []; stato.expeditionStats = h.eval('newExpeditionStats()');
        stato.onlineOwners = { 'Curio Dignitas': 'Marco' };
        const data = h.buildSaveData();
        t.uguale({ 'Curio Dignitas': 'Marco' }, data.stato.onlineOwners);
        stato.onlineOwners = {};
        t.ok(h.applySaveData(JSON.parse(JSON.stringify(data))));
        t.uguale({ 'Curio Dignitas': 'Marco' }, stato.onlineOwners);
        const vecchio = h.migrateSave({ version: 4, campaignId: 'tutorial', stato: { party: [], activeCurses: [] } });
        t.uguale(5, vecchio.version);
        t.uguale({}, vecchio.stato.onlineOwners);
    });
```

Run: `node tests/run.js` — Expected: FAIL (versione 4, `onlineOwners` undefined).

- [ ] **Step 2: Implementa**

In `js/salvataggi.js`:
- commento del formato: `Versione 5 (come la 4, con stato.onlineOwners: eroe → giocatore della partita online)`;
- `const SAVE_VERSION = 5;`
- in `SAVE_MIGRATIONS`, dopo il passo `3:` aggiungi:

```js
            // Versione 4 -> 5: proprietari degli eroi nella partita online (vuoti per le partite di prima)
            4: old => ({ ...old, version: 5, stato: { ...old.stato, onlineOwners: old.stato.onlineOwners || {} } })
```

- in `buildSaveData`, dopo `expeditionStats: stato.expeditionStats`: `, onlineOwners: stato.onlineOwners || {}`
- in `applySaveData`, dopo `stato.activeCurses = s.activeCurses || [];`: `stato.onlineOwners = s.onlineOwners || {};`

In `js/spedizione.js`, `azzeraPartita`: aggiungi `onlineOwners: {}` nell'`Object.assign(stato, {...})`. In `js/game.js` aggiungi `onlineOwners: {}` all'oggetto iniziale `stato` (cerca `const stato = {`).

- [ ] **Step 3: Verifica** — Run: `node tests/run.js` — Expected: tutti verdi.

- [ ] **Step 4: Commit**

```bash
git add js/salvataggi.js js/spedizione.js js/game.js tests/online.test.js tests/salvataggi.test.js
git commit -m "Salvataggi versione 5: proprietari degli eroi della partita online"
```

---

### Task 4: Server della partita online

**Files:**
- Create: `server/online.js`
- Modify: `server/server.js` (delega e cache dei media), `.gitignore` (`server/cache-leggera/`)
- Create: `tools/prova_online.mjs`

**Interfaces:**
- Consumes: `js/online-regole.js` via `require('../js/online-regole.js')` (`leggeroUrl` non serve qui; serve `ONLINE_MASTER`).
- Produces (HTTP):
  - Master (solo `Host` locale): `POST /api/online/apri` → `{ code }`; `POST /api/online/chiudi`; `GET /api/online/master` (SSE: `stanza` `{ giocatori: [{name, connected}] }`, `clic` `{ giocatore, azione, tipo, percorso, regione, args, valori }`); `POST /api/online/parti` `{ parti: {regione: html|null} }`; `POST /api/online/stato` `{ ... }` (inoltrato tale e quale ai giocatori come evento `stato`); `POST /api/online/avviso` `{ giocatore, testo }`.
  - Giocatori: `GET /online/<code>` (pagina); `POST /api/online/entra` `{ code, nome, token? }` → `{ token, nome }` o `{ error }`; `GET /api/online/flusso?code=&token=` (SSE gzip: `parti`, `stato`, `master` `{online}`, `avviso` `{testo}`, `ping`); `POST /api/online/clic` `{ code, token, azione, tipo, regione, percorso, args, valori }`.
  - `GET /leggero/<percorso>` (media leggeri, Task 13; in questo task risponde con l'originale).
  - `module.exports = { gestisci(req, res, pathname) -> boolean, haMaster() }` (true se ha risposto).

- [ ] **Step 1: Scrivi lo script di prova (fallisce: endpoint inesistenti)** — `tools/prova_online.mjs`

```js
// Prova del server della partita online: avvia server/server.js su una porta di prova e simula
// un master (Host locale) e due giocatori. Uso: node tools/prova_online.mjs
import { spawn } from 'node:child_process';
import http from 'node:http';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 18788;
let fallite = 0;
const ok = (cond, msg) => { console.log(`${cond ? '  ✓' : '  ✗'} ${msg}`); if (!cond) fallite++; };
const wait = ms => new Promise(r => setTimeout(r, ms));

function req(method, p, body, host = `localhost:${PORT}`) {
    return new Promise((resolve, reject) => {
        const r = http.request({ host: '127.0.0.1', port: PORT, path: p, method, headers: { 'Content-Type': 'application/json', Host: host } }, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d || '{}') }); } catch { resolve({ status: res.statusCode, body: d }); } });
        });
        r.on('error', reject); if (body) r.write(JSON.stringify(body)); r.end();
    });
}

// Stream SSE (gzip se offerto): raccoglie gli eventi in un array
function flusso(p, host, gzip) {
    const eventi = [];
    const r = http.get({ host: '127.0.0.1', port: PORT, path: p, headers: { Host: host, 'Accept-Encoding': gzip ? 'gzip' : 'identity' } }, res => {
        const src = res.headers['content-encoding'] === 'gzip' ? res.pipe(zlib.createGunzip()) : res;
        eventi.gzip = res.headers['content-encoding'] === 'gzip';
        let buf = '';
        src.on('data', c => { buf += c; let i; while ((i = buf.indexOf('\n\n')) >= 0) { const b = buf.slice(0, i); buf = buf.slice(i + 2);
            const ev = (b.match(/^event: (.*)$/m) || [])[1]; const data = (b.match(/^data: (.*)$/m) || [])[1];
            if (ev) eventi.push([ev, data ? JSON.parse(data) : null]); } });
    });
    eventi.chiudi = () => r.destroy();
    return eventi;
}

const server = spawn(process.execPath, [path.join(ROOT, 'server', 'server.js')], { env: { ...process.env, PORT: String(PORT), SSE_PING_MS: '500', ONLINE_DISCONNECT_MS: '1500' }, stdio: 'ignore' });
try {
    await wait(800);
    const fuori = `abc.ngrok-free.app`;
    ok((await req('POST', '/api/online/apri', {}, fuori)).status === 403, 'un ospite non può aprire la stanza');
    const { code } = (await req('POST', '/api/online/apri', {})).body;
    ok(typeof code === 'string' && code.length >= 6, 'il master apre la stanza');
    const master = flusso('/api/online/master', `localhost:${PORT}`, false);
    ok((await req('POST', '/api/online/entra', { code: 'sbagliato', nome: 'Marco' }, fuori)).body.error, 'codice sbagliato rifiutato');
    const marco = (await req('POST', '/api/online/entra', { code, nome: '  Marco  ' }, fuori)).body;
    ok(marco.token && marco.nome === 'Marco', 'Marco entra (nome pulito)');
    ok((await req('POST', '/api/online/entra', { code, nome: 'marco' }, fuori)).body.error, 'nome già usato (maiuscole a parte) rifiutato');
    ok((await req('POST', '/api/online/entra', { code, nome: '' }, fuori)).body.error, 'nome vuoto rifiutato');
    const sara = (await req('POST', '/api/online/entra', { code, nome: 'Sara'.repeat(20) }, fuori)).body;
    ok(sara.nome.length <= 24, 'nome lunghissimo accorciato');
    await req('POST', '/api/online/parti', { parti: { screen: '<div id="screenMap">mappa</div>' } });
    const fm = flusso(`/api/online/flusso?code=${code}&token=${marco.token}`, fuori, true);
    await wait(300);
    ok(fm.gzip, 'stream dei giocatori compresso');
    ok(fm.some(([e, d]) => e === 'parti' && d.screen && d.screen.includes('mappa')), 'chi entra riceve subito tutte le regioni');
    ok(fm.some(([e, d]) => e === 'master' && d.online), 'il giocatore sa che il master è collegato');
    await req('POST', '/api/online/clic', { code, token: marco.token, azione: 'selectStsNode', tipo: 'click', regione: 'screen', percorso: [0, 2], args: [3], valori: {} }, fuori);
    await wait(200);
    ok(master.some(([e, d]) => e === 'clic' && d.giocatore === 'Marco' && d.azione === 'selectStsNode'), 'il clic arriva al master con il nome del giocatore');
    ok((await req('POST', '/api/online/clic', { code, token: 'falso', azione: 'x' }, fuori)).status === 403, 'token falso rifiutato');
    ok((await req('POST', '/api/online/parti', { parti: {} }, fuori)).status === 403, 'un ospite non può mandare regioni');
    await req('POST', '/api/online/avviso', { giocatore: 'Marco', testo: 'Non è il tuo turno' });
    await wait(200);
    ok(fm.some(([e, d]) => e === 'avviso' && d.testo === 'Non è il tuo turno'), 'avviso al singolo giocatore');
    ok(master.some(([e, d]) => e === 'stanza' && d.giocatori.some(gi => gi.name === 'Marco' && gi.connected)), 'il master vede Marco collegato');
    fm.chiudi();
    await wait(2200);
    ok(master.some(([e, d]) => e === 'stanza' && d.giocatori.some(gi => gi.name === 'Marco' && !gi.connected)), 'Marco disconnesso dopo il tempo massimo');
    const rientro = (await req('POST', '/api/online/entra', { code, nome: 'Marco', token: marco.token }, fuori)).body;
    ok(rientro.token === marco.token, 'Marco rientra con lo stesso token');
    master.chiudi();
} finally {
    server.kill();
}
console.log(fallite ? `\n${fallite} prove fallite` : '\nTutte le prove passate');
process.exit(fallite ? 1 : 0);
```

Run: `node tools/prova_online.mjs` — Expected: prove fallite (403/404 sugli endpoint nuovi).

- [ ] **Step 2: Implementa `server/online.js`**

```js
/* ==========================================================================
   SERVER DELLA PARTITA ONLINE (richiesto da server/server.js)
   Una stanza alla volta, aperta dal master (Host locale). I giocatori entrano
   con il codice e un nome, ricevono un token e uno stream SSE compresso con le
   regioni della schermata del master; i loro clic vanno al master, che decide.
   ========================================================================== */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PUBLIC = path.join(__dirname, 'public');
const DISCONNECT_MS = process.env.ONLINE_DISCONNECT_MS ? parseInt(process.env.ONLINE_DISCONNECT_MS, 10) : 20000;
const PING_MS = process.env.SSE_PING_MS ? parseInt(process.env.SSE_PING_MS, 10) : 15000;
const NOME_MAX = 24;

let stanza = null;        // { code, giocatori: Map(token -> { name, connected, flussi: Set, timer }), regioni: {}, stato: null }
const masters = new Set(); // stream SSE del master

const eLocale = req => /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.host || '');

function json(res, code, data) {
    const body = JSON.stringify(data);
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) });
    res.end(body);
}

function leggiJson(req, cb) {
    const parti = [];
    req.on('data', c => parti.push(c));
    req.on('end', () => { try { cb(JSON.parse(Buffer.concat(parti).toString('utf8') || '{}')); } catch (e) { cb(null); } });
}

// Stream SSE (gzip con flush se il browser lo accetta): scrivi(evento, dati), chiudi()
function apriFlusso(req, res) {
    const gzip = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', ...(gzip ? { 'Content-Encoding': 'gzip' } : {}) });
    const out = gzip ? zlib.createGzip({ flush: zlib.constants.Z_SYNC_FLUSH }) : null;
    if (out) out.pipe(res);
    const dest = out || res;
    const scrivi = (evento, dati) => { try { dest.write(`event: ${evento}\ndata: ${JSON.stringify(dati)}\n\n`); } catch (e) {} };
    dest.write('retry: 3000\n\n');
    const ping = setInterval(() => scrivi('ping', { t: Date.now() }), PING_MS);
    ping.unref();
    const flusso = { scrivi, chiudi: () => { clearInterval(ping); try { dest.end(); } catch (e) {} } };
    req.on('close', () => clearInterval(ping));
    return flusso;
}

const elencoGiocatori = () => stanza ? [...stanza.giocatori.values()].map(gi => ({ name: gi.name, connected: gi.connected })) : [];
const alMaster = (evento, dati) => masters.forEach(f => f.scrivi(evento, dati));
const aiGiocatori = (evento, dati) => stanza && stanza.giocatori.forEach(gi => gi.flussi.forEach(f => f.scrivi(evento, dati)));
const avvisaStanza = () => alMaster('stanza', { giocatori: elencoGiocatori() });

function giocatoreDaToken(code, token) {
    if (!stanza || stanza.code !== code || !token) return null;
    return stanza.giocatori.get(token) || null;
}

function pulisciNome(n) {
    return String(n || '').replace(/[<>"'&\u0000-\u001f]/g, '').trim().slice(0, NOME_MAX);
}

function gestisci(req, res, pathname) {
    // ----- Master (Host locale) -----
    if (pathname.startsWith('/api/online/') && ['apri', 'chiudi', 'master', 'parti', 'stato', 'avviso'].includes(pathname.slice(12))) {
        if (!eLocale(req)) { json(res, 403, { error: 'Solo il master' }); return true; }
        const cosa = pathname.slice(12);
        if (cosa === 'apri' && req.method === 'POST') {
            if (!stanza) stanza = { code: crypto.randomBytes(5).toString('hex'), giocatori: new Map(), regioni: {}, stato: null };
            json(res, 200, { code: stanza.code });
            return true;
        }
        if (cosa === 'chiudi' && req.method === 'POST') {
            aiGiocatori('master', { online: false, chiusa: true });
            if (stanza) stanza.giocatori.forEach(gi => gi.flussi.forEach(f => f.chiudi()));
            stanza = null;
            json(res, 200, { ok: true });
            return true;
        }
        if (cosa === 'master') {
            const f = apriFlusso(req, res);
            masters.add(f);
            f.scrivi('stanza', { giocatori: elencoGiocatori() });
            aiGiocatori('master', { online: true });
            req.on('close', () => { masters.delete(f); if (!masters.size) aiGiocatori('master', { online: false }); });
            return true;
        }
        leggiJson(req, data => {
            if (!data || !stanza) { json(res, 400, { error: 'Nessuna stanza' }); return; }
            if (cosa === 'parti') {
                Object.entries(data.parti || {}).forEach(([k, v]) => { if (v === null) delete stanza.regioni[k]; else stanza.regioni[k] = v; });
                aiGiocatori('parti', data.parti || {});
            } else if (cosa === 'stato') {
                stanza.stato = data;
                aiGiocatori('stato', data);
            } else if (cosa === 'avviso') {
                stanza.giocatori.forEach(gi => { if (gi.name === data.giocatore) gi.flussi.forEach(f => f.scrivi('avviso', { testo: String(data.testo || '') })); });
            }
            json(res, 200, { ok: true });
        });
        return true;
    }

    // ----- Giocatori -----
    if (pathname.startsWith('/online/')) {
        const code = pathname.slice(8).split('/')[0];
        if (!stanza || stanza.code !== code) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Stanza non trovata: chiedi al master un link nuovo.'); return true; }
        fs.readFile(path.join(PUBLIC, 'online.html'), (err, buf) => {
            if (err) { res.writeHead(500); res.end('Pagina mancante'); return; }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
            res.end(buf);
        });
        return true;
    }
    if (pathname === '/api/online/entra' && req.method === 'POST') {
        leggiJson(req, data => {
            if (!data || !stanza || data.code !== stanza.code) { json(res, 200, { error: 'Stanza non trovata' }); return; }
            const vecchio = data.token && stanza.giocatori.get(data.token);
            if (vecchio) { json(res, 200, { token: data.token, nome: vecchio.name }); return; }
            const nome = pulisciNome(data.nome);
            if (!nome) { json(res, 200, { error: 'Scrivi un nome' }); return; }
            if ([...stanza.giocatori.values()].some(gi => gi.name.toLowerCase() === nome.toLowerCase())) { json(res, 200, { error: 'Nome già usato da un altro giocatore' }); return; }
            const token = crypto.randomBytes(16).toString('hex');
            stanza.giocatori.set(token, { name: nome, connected: false, flussi: new Set(), timer: null });
            avvisaStanza();
            json(res, 200, { token, nome });
        });
        return true;
    }
    if (pathname === '/api/online/flusso') {
        const u = new URL(req.url, 'http://x');
        const gi = giocatoreDaToken(u.searchParams.get('code'), u.searchParams.get('token'));
        if (!gi) { json(res, 403, { error: 'Token non valido' }); return true; }
        const f = apriFlusso(req, res);
        gi.flussi.add(f);
        clearTimeout(gi.timer);
        if (!gi.connected) { gi.connected = true; avvisaStanza(); }
        f.scrivi('parti', stanza.regioni);
        if (stanza.stato) f.scrivi('stato', stanza.stato);
        f.scrivi('master', { online: masters.size > 0 });
        req.on('close', () => {
            gi.flussi.delete(f);
            if (gi.flussi.size) return;
            clearTimeout(gi.timer);
            gi.timer = setTimeout(() => { if (!gi.flussi.size && gi.connected) { gi.connected = false; avvisaStanza(); } }, DISCONNECT_MS);
        });
        return true;
    }
    if (pathname === '/api/online/clic' && req.method === 'POST') {
        leggiJson(req, data => {
            const gi = data && giocatoreDaToken(data.code, data.token);
            if (!gi) { json(res, 403, { error: 'Token non valido' }); return; }
            if (!masters.size) { json(res, 200, { error: 'Il master non è collegato' }); return; }
            alMaster('clic', { giocatore: gi.name, azione: String(data.azione || ''), tipo: data.tipo || 'click',
                regione: data.regione || null, percorso: Array.isArray(data.percorso) ? data.percorso : [],
                args: Array.isArray(data.args) ? data.args : [], valori: data.valori || {} });
            json(res, 200, { ok: true });
        });
        return true;
    }
    return false;
}

module.exports = { gestisci, haMaster: () => masters.size > 0 };
```

- [ ] **Step 3: Delega da `server/server.js`**

All'inizio, dopo i `require`: `const online = require('./online');`. Nel gestore `http.createServer((req, res) => {`, subito dopo il calcolo di `pathname` (e dopo il blocco `OPTIONS`), aggiungi:

```js
    // Partita online (server/online.js): stanza, giocatori, stream, clic
    if (pathname.startsWith('/online/') || pathname.startsWith('/api/online/')) {
        if (online.gestisci(req, res, pathname)) return;
    }
```

In `.gitignore` aggiungi:

```
# Media leggeri per i giocatori della partita online (creati da server/online.js con ffmpeg)
server/cache-leggera/
```

- [ ] **Step 4: Prova**

Run: `node --check server/online.js server/server.js && node tools/prova_online.mjs`
Expected: "Tutte le prove passate" (la prova "Marco disconnesso" usa `ONLINE_DISCONNECT_MS=1500`).

- [ ] **Step 5: Commit**

```bash
git add server/online.js server/server.js .gitignore tools/prova_online.mjs
git commit -m "Server: stanza della partita online, giocatori con token, stream compresso, inoltro dei clic"
```

---

### Task 5: Pagina del giocatore

**Files:**
- Create: `server/public/online.html`, `server/public/online.js`

**Interfaces:**
- Consumes: endpoint del Task 4; `rendiLeggero` da `/js/online-regole.js`; regioni `topbar`, `console`, `screen`, `modal`, `overlays`, `body` (classi del body, testo semplice); evento `stato` `{ voto, pronti, capo, owners, attesi, musica, giocatori }` (Task 6–11).
- Produces: `POST /api/online/clic` con `{ azione, tipo, regione, percorso, args, valori }`; `azione` speciali `__modal` (args `[indice]`) e `__vota` (args `[idVoto, idOpzione]`).

- [ ] **Step 1: `server/public/online.html`**

```html
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base href="/">
    <title>Slay the Dig — Partita online</title>
    <link rel="stylesheet" href="css/wc3-base.css">
    <link rel="stylesheet" href="css/style.css">
    <style>
        #onlineJoin { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 50; background: rgba(0,0,0,.85); }
        #onlineJoin .wc-panel { padding: 24px; max-width: 360px; width: calc(100% - 32px); }
        #onlineJoin input { width: 100%; margin: 12px 0; padding: 8px; font-size: 1.1em; }
        #onlineBar { position: fixed; left: 50%; transform: translateX(-50%); bottom: 12px; z-index: 40; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; justify-content: center; max-width: calc(100% - 32px); }
        #onlineBar .wc-panel { padding: 8px 14px; }
        #onlineBar button.mio { outline: 2px solid var(--wc-yellow, gold); }
        #onlineAvviso { position: fixed; top: 70px; left: 50%; transform: translateX(-50%); z-index: 45; }
        #onlineTurno { color: var(--wc-yellow, gold); font-weight: bold; }
        .online-hidden { display: none !important; }
    </style>
</head>
<body class="online-guest">
    <div id="onlineJoin" class="online-hidden">
        <div class="wc-panel">
            <h2 class="wc-heading">Unisciti alla spedizione</h2>
            <p>Scrivi il tuo nome: il master ti assegnerà un eroe.</p>
            <input id="onlineNome" maxlength="24" autocomplete="nickname">
            <button class="btn-proceed" id="onlineEntraBtn">Entra</button>
            <p id="onlineJoinErrore" class="kw-curse"></p>
        </div>
    </div>
    <div id="partyTopBar" class="party-topbar"></div>
    <div id="partyConsole" class="party-console"></div>
    <div class="container" id="gameContainer"></div>
    <div id="wc3Modal" class="modal-overlay hidden"></div>
    <div id="onlineOverlays"></div>
    <div id="onlineAvviso" class="online-hidden wc-panel"></div>
    <div id="onlineBar"></div>
    <div id="wc3Tooltip" class="wc3-tooltip" role="tooltip"></div>
    <audio id="onlineMusica" loop preload="none"></audio>
    <script src="js/online-regole.js"></script>
    <script src="online-client.js"></script>
</body>
</html>
```

`server/public/online.js` non sta in una cartella statica permessa: il server lo serve come `/online-client.js`. In `server/online.js`, dentro `gestisci`, aggiungi prima del blocco `/online/`:

```js
    if (pathname === '/online-client.js') {
        fs.readFile(path.join(PUBLIC, 'online.js'), (err, buf) => {
            if (err) { res.writeHead(404); res.end(); return; }
            res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
            res.end(buf);
        });
        return true;
    }
```

e in `server/server.js` estendi la condizione di delega con `|| pathname === '/online-client.js'`.

- [ ] **Step 2: `server/public/online.js`**

```js
/* ==========================================================================
   PAGINA DEL GIOCATORE (partita online)
   Inserisce le regioni della schermata del master, mostra tooltip, voto,
   turno e avvisi, inoltra i clic al master (che decide se eseguirli).
   ========================================================================== */
(function () {
    const code = location.pathname.split('/')[2] || '';
    const CHIAVE = `dignitas_online_${code}`;
    const NGROK = { 'ngrok-skip-browser-warning': 'true' };
    let token = null, nome = null, stato = {}, flusso = null, ultimoSegnale = 0;
    const $ = id => document.getElementById(id);

    const salvato = () => { try { return JSON.parse(localStorage.getItem(CHIAVE) || 'null'); } catch (e) { return null; } };
    const salva = v => { try { localStorage.setItem(CHIAVE, JSON.stringify(v)); } catch (e) {} };

    function post(url, body) {
        const ctrl = window.AbortController ? new AbortController() : null;
        if (ctrl) setTimeout(() => ctrl.abort(), 8000);
        return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...NGROK }, body: JSON.stringify(body), signal: ctrl && ctrl.signal })
            .then(r => r.json());
    }

    /* ---------- Ingresso ---------- */
    window.onlineEntra = function () {
        const n = $('onlineNome').value;
        post('/api/online/entra', { code, nome: n }).then(r => {
            if (r.error) { $('onlineJoinErrore').textContent = r.error; return; }
            token = r.token; nome = r.nome; salva({ token, nome });
            $('onlineJoin').classList.add('online-hidden');
            collega();
        }).catch(() => { $('onlineJoinErrore').textContent = 'Connessione non riuscita, riprova'; });
    };

    // La pagina del giocatore non carica js/azioni.js: il modulo d'ingresso ha i suoi ascoltatori
    document.getElementById('onlineEntraBtn').addEventListener('click', () => window.onlineEntra());
    document.getElementById('onlineNome').addEventListener('keydown', e => { if (e.key === 'Enter') window.onlineEntra(); });

    function avvio() {
        const s = salvato();
        if (!s) { $('onlineJoin').classList.remove('online-hidden'); $('onlineNome').focus(); return; }
        post('/api/online/entra', { code, nome: s.nome, token: s.token }).then(r => {
            if (r.error) { localStorage.removeItem(CHIAVE); $('onlineJoin').classList.remove('online-hidden'); return; }
            token = r.token; nome = r.nome; salva({ token, nome }); collega();
        }).catch(() => setTimeout(avvio, 3000));
    }

    /* ---------- Stream ---------- */
    function collega() {
        if (flusso) flusso.close();
        flusso = new EventSource(`/api/online/flusso?code=${encodeURIComponent(code)}&token=${encodeURIComponent(token)}&ngrok-skip-browser-warning=true`);
        ultimoSegnale = Date.now();
        const on = (ev, fn) => flusso.addEventListener(ev, e => { ultimoSegnale = Date.now(); try { fn(JSON.parse(e.data)); } catch (err) { console.error(err); } });
        on('parti', applicaParti);
        on('stato', s => { stato = s || {}; disegnaBarra(); musica(); });
        on('master', m => mostraAvviso(m.online ? '' : (m.chiusa ? 'Il master ha chiuso la partita' : 'Il master non è collegato'), !m.online));
        on('avviso', a => mostraAvviso(a.testo));
        on('ping', () => {});
        flusso.onerror = () => { if (flusso.readyState === 2) setTimeout(collega, 3000); };
    }
    setInterval(() => { if (token && Date.now() - ultimoSegnale > 35000) collega(); }, 10000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && token && Date.now() - ultimoSegnale > 20000) collega(); });

    /* ---------- Regioni ---------- */
    const DOVE = { topbar: 'partyTopBar', console: 'partyConsole', modal: 'wc3Modal' };
    function applicaParti(parti) {
        Object.entries(parti || {}).forEach(([k, html]) => {
            if (k === 'body') { document.body.className = 'online-guest ' + (html || ''); return; }
            if (k === 'screen') { $('gameContainer').innerHTML = html ? rendiLeggero(html) : ''; return; }
            if (k === 'overlays') { $('onlineOverlays').innerHTML = html ? rendiLeggero(html) : ''; return; }
            const id = DOVE[k];
            if (!id) return;
            const vecchio = $(id);
            if (!html) { vecchio.innerHTML = ''; if (k === 'modal') vecchio.classList.add('hidden'); return; }
            const t = document.createElement('template');
            t.innerHTML = rendiLeggero(html);
            const nuovo = t.content.firstElementChild;
            if (nuovo) vecchio.replaceWith(nuovo);
        });
    }

    // Regione e percorso di un elemento (indici fra i figli, senza SCRIPT e AUDIO): il master trova lo stesso elemento
    const RADICI = { partyTopBar: 'topbar', partyConsole: 'console', wc3Modal: 'modal' };
    function radiceDi(el) {
        const scr = $('gameContainer');
        if (scr.contains(el)) return { regione: 'screen', root: scr.firstElementChild };
        const ov = $('onlineOverlays');
        if (ov.contains(el)) return { regione: 'overlays', root: ov };
        for (const [id, reg] of Object.entries(RADICI)) { const r = $(id); if (r && r.contains(el)) return { regione: reg, root: r }; }
        return null;
    }
    const figli = n => [...n.children].filter(c => c.tagName !== 'SCRIPT' && c.tagName !== 'AUDIO');
    function percorso(root, el) {
        const p = [];
        for (let n = el; n && n !== root; n = n.parentElement) p.unshift(figli(n.parentElement).indexOf(n));
        return p;
    }
    // Valori dei menu e dei campi della regione (proprietà, non attributi), per percorso
    function valori(root) {
        const out = {};
        root.querySelectorAll('select, input, textarea').forEach(c => { out[percorso(root, c).join('.')] = c.type === 'checkbox' ? c.checked : c.value; });
        return out;
    }

    /* ---------- Clic ---------- */
    const SEL = { click: '[data-action], [data-modal-btn]', change: '[data-change]', input: '[data-input]', keydown: '[data-enter]' };
    function inoltra(tipo, e) {
        if (!token || $('onlineJoin').contains(e.target)) return;
        if (tipo === 'keydown' && e.key !== 'Enter') return;
        if (e.target.closest && e.target.closest('#onlineBar')) return;  // la barra ha le sue azioni
        const el = e.target.closest && e.target.closest(SEL[tipo]);
        if (!el || el.disabled) return;
        const r = radiceDi(el);
        if (!r) return;
        e.preventDefault(); e.stopPropagation();
        const modale = el.dataset.modalBtn !== undefined;
        const attr = { click: 'action', change: 'change', input: 'input', keydown: 'enter' }[tipo];
        let args = [];
        try { args = JSON.parse(el.dataset[{ click: 'args', change: 'changeArgs', input: 'inputArgs', keydown: 'enterArgs' }[tipo]] || '[]'); } catch (err) {}
        args = (Array.isArray(args) ? args : [args]).map(a => a === '$value' ? el.value : a === '$checked' ? el.checked : a);
        post('/api/online/clic', { code, token, tipo, regione: r.regione, percorso: percorso(r.root, el),
            azione: modale ? '__modal' : el.dataset[attr], args: modale ? [Number(el.dataset.modalBtn)] : args, valori: valori(r.root) })
            .then(x => { if (x && x.error) mostraAvviso(x.error); }).catch(() => mostraAvviso('Connessione persa, riprova'));
    }
    ['click', 'change', 'input', 'keydown'].forEach(tipo => document.addEventListener(tipo, e => inoltra(tipo, e), true));

    /* ---------- Barra: turno, voto, pronti, musica ---------- */
    window.onlineVota = (id, op) => post('/api/online/clic', { code, token, tipo: 'click', regione: null, percorso: [], azione: '__vota', args: [id, op], valori: {} });
    function disegnaBarra() {
        const v = stato.voto;
        const attesoIo = (stato.attesi || []).includes(nome);
        const parti = [];
        parti.push(`<div class="wc-panel">${esc(nome || '')}${stato.capo === nome ? ' 👑' : ''}${attesoIo ? ' · <span id="onlineTurno">Tocca a te</span>' : ''}</div>`);
        if (v) {
            const mio = (v.voti || {})[nome];
            const secondi = Math.max(0, Math.ceil((v.scadenza - Date.now() + (stato.orologio ? Date.now() - stato.orologio : 0)) / 1000));
            parti.push(`<div class="wc-panel"><b>${esc(v.domanda)}</b> (${secondi}s) ${v.opzioni.map(o =>
                `<button class="btn-small ${mio === o.id ? 'mio' : ''}" data-action="onlineVota" data-args='${esc(JSON.stringify([v.id, o.id]))}'>${esc(o.label)} ${conta(v, o.id)}</button>`).join(' ')}</div>`);
        }
        if (stato.pronti) parti.push(`<div class="wc-panel">Pronti: ${stato.pronti.fatti.length}/${stato.pronti.totale}${stato.pronti.fatti.includes(nome) ? ' ✓' : ''}</div>`);
        parti.push(`<div class="wc-panel"><button class="btn-small" data-action="onlineMusica">${musicaAccesa() ? '🔊' : '🔇'} Musica</button></div>`);
        $('onlineBar').innerHTML = parti.join('');
    }
    const conta = (v, id) => { const n = Object.values(v.voti || {}).filter(x => x === id).length; return n ? `· ${n}` : ''; };
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    // Clic della barra: non passano dall'inoltro (vedi inoltra), li gestisce questo ascoltatore
    $('onlineBar').addEventListener('click', e => {
        const b = e.target.closest('[data-action]');
        if (!b) return;
        let a = []; try { a = JSON.parse(b.dataset.args || '[]'); } catch (err) {}
        if (typeof window[b.dataset.action] === 'function') window[b.dataset.action](...a);
    });
    setInterval(() => { if (stato.voto) disegnaBarra(); }, 1000);

    const musicaAccesa = () => { try { return localStorage.getItem('dignitas_online_musica') === '1'; } catch (e) { return false; } };
    window.onlineMusica = () => { try { localStorage.setItem('dignitas_online_musica', musicaAccesa() ? '0' : '1'); } catch (e) {} musica(); disegnaBarra(); };
    function musica() {
        const a = $('onlineMusica');
        const src = musicaAccesa() && stato.musica ? stato.musica : '';
        if (!src) { a.pause(); return; }
        if (a.getAttribute('src') !== src) { a.setAttribute('src', src); a.volume = 0.5; }
        a.play().catch(() => {});
    }

    /* ---------- Avvisi e tooltip ---------- */
    let avvisoTimer = null;
    function mostraAvviso(testo, fisso) {
        const box = $('onlineAvviso');
        clearTimeout(avvisoTimer);
        if (!testo) { box.classList.add('online-hidden'); return; }
        box.textContent = testo; box.classList.remove('online-hidden');
        if (!fisso) avvisoTimer = setTimeout(() => box.classList.add('online-hidden'), 3000);
    }
    document.addEventListener('mouseover', e => {
        const el = e.target.closest && e.target.closest('[data-tip]');
        const tip = $('wc3Tooltip');
        if (!el) { tip.classList.remove('show'); return; }
        const [titolo, desc] = String(el.dataset.tip).split('||');
        tip.innerHTML = `<div class="tip-title">${titolo}</div>${desc ? `<div class="tip-desc">${desc}</div>` : ''}`;
        tip.classList.add('show');
    });
    document.addEventListener('mousemove', e => {
        const tip = $('wc3Tooltip');
        if (!tip.classList.contains('show')) return;
        tip.style.left = Math.min(e.clientX + 16, innerWidth - tip.offsetWidth - 8) + 'px';
        tip.style.top = Math.min(e.clientY + 16, innerHeight - tip.offsetHeight - 8) + 'px';
    });

    avvio();
})();
```

Nota per l'implementatore: controlla in `css/style.css` come `#wc3Tooltip` diventa visibile (classe o stile) e le classi interne del tooltip (`grep -n "wc3-tooltip" css/style.css`); usa le stesse, sostituendo `show` / `tip-title` / `tip-desc` se diversi.

- [ ] **Step 3: Verifica di sintassi** — Run: `node --check server/public/online.js server/online.js && node tools/prova_online.mjs` — Expected: verdi.

- [ ] **Step 4: Commit**

```bash
git add server/public/online.html server/public/online.js server/online.js server/server.js
git commit -m "Pagina del giocatore della partita online: ingresso, regioni, clic inoltrati, barra, tooltip, musica"
```

---

### Task 6: Gioco del master — attivazione, regioni, clic remoti, permessi

**Files:**
- Create: `js/online.js`
- Modify: `index.html` (`<script src="js/online.js"></script>` dopo `js/remote.js`, prima di `js/wc3fx.js`)
- Test: `tests/online.test.js` (funzioni pure esportate da `js/online.js`: `trovaElementoRemoto`, `contestoOnline`)

**Interfaces:**
- Consumes: `onlineCanRun`, `changedRegions`, `ONLINE_MASTER`, `ONLINE_FRAME_MS` (Task 1); `window.onlineGate`, `chiamaAzione`, `data-modal-btn` (Task 2); `stato.onlineOwners` (Task 3); endpoint del master (Task 4).
- Produces (globali, usate dai Task 7–12):
  - `onlineState` = `{ attivo, code, giocatori: [{name, connected}], voto, pronti, modalOwner, attore }`
  - `onlineAttivo() -> boolean`
  - `onlineGiocatoriCollegati() -> string[]`
  - `onlineInviaStato()` (manda `stato` ai giocatori)
  - `onlineAvvisa(giocatore, testo)`
  - `contestoOnline() -> ctx` (per `onlineCanRun`)
  - `trovaElementoRemoto(root, percorso) -> Element|null`
  - `onlineAttesi() -> string[]` (Task 7 la completa)
  - aggancio `onlineDopoClic` (array di funzioni chiamate dopo ogni clic eseguito, per voti e pronti)

- [ ] **Step 1: Test che fallisce**

```js
    t.test('trovaElementoRemoto: segue il percorso saltando SCRIPT e AUDIO', () => {
        const h = carica();
        const nodo = (tag, figli = []) => ({ tagName: tag, children: figli });
        const bersaglio = nodo('BUTTON');
        const root = nodo('DIV', [nodo('AUDIO'), nodo('DIV', [nodo('SPAN'), bersaglio])]);
        t.ok(h.trovaElementoRemoto(root, [0, 1]) === bersaglio);
        t.uguale(null, h.trovaElementoRemoto(root, [5]));
    });
```

e aggiungi `'js/online.js'` in fondo a `SCRIPT_MOTORE` di `tests/ambiente.js` (dopo `'js/simulator.js'`).

Run: `node tests/run.js` — Expected: FAIL (file mancante).

- [ ] **Step 2: Implementa `js/online.js` (parte 1: stato, pannello, stream, regioni, clic)**

```js
/* ==========================================================================
   PARTITA ONLINE — LATO MASTER
   Attiva solo quando il master apre la partita online dalle Opzioni (pagina
   servita da http://localhost:8787). Manda ai giocatori le regioni cambiate
   della pagina, riceve i loro clic, li esegue se onlineCanRun lo permette
   (js/online-regole.js), gestisce voti, "Ho finito", capo e proprietari.
   ========================================================================== */
const ONLINE_BASE = 'http://localhost:8787';
const onlineState = { attivo: false, code: null, giocatori: [], voto: null, pronti: null, modalOwner: null, attore: null };
const onlineDopoClic = [];
let onlineMasterStream = null;

const onlineAttivo = () => onlineState.attivo;
const onlineGiocatoriCollegati = () => onlineState.giocatori.filter(gi => gi.connected).map(gi => gi.name);

function onlinePost(url, body) {
    return fetch(ONLINE_BASE + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) })
        .then(r => r.json()).catch(() => ({ error: 'Server non raggiungibile' }));
}
const onlineAvvisa = (giocatore, testo) => onlinePost('/api/online/avviso', { giocatore, testo });

// Elemento al percorso (indici fra i figli senza SCRIPT e AUDIO), come lo calcola la pagina del giocatore
function trovaElementoRemoto(root, percorso) {
    let n = root;
    for (const i of percorso || []) {
        const figli = n ? [...n.children].filter(c => c.tagName !== 'SCRIPT' && c.tagName !== 'AUDIO') : [];
        n = figli[i];
        if (!n) return null;
    }
    return n || null;
}

/* ---------- Regioni della pagina ---------- */
// Copia di un elemento con i valori correnti dei campi scritti negli attributi (i giocatori vedono le stesse scelte)
function onlineSerializza(el) {
    if (!el) return null;
    const copia = el.cloneNode(true);
    const orig = el.querySelectorAll('select, input, textarea');
    copia.querySelectorAll('select, input, textarea').forEach((c, i) => {
        const o = orig[i];
        if (c.tagName === 'SELECT') [...c.options].forEach(op => op.toggleAttribute('selected', op.value === o.value));
        else if (o.type === 'checkbox') c.toggleAttribute('checked', o.checked);
        else c.setAttribute('value', o.value);
    });
    copia.querySelectorAll('script, audio').forEach(n => n.remove());
    return copia.outerHTML;
}
const ONLINE_OVERLAY_ESCLUSI = ['gameContainer', 'partyTopBar', 'partyConsole', 'wc3Modal', 'wc3Tooltip', 'embers', 'onlineMasterBar'];
function onlineRegioni() {
    const screen = document.querySelector('#gameContainer > div:not(.hidden)');
    const modal = document.getElementById('wc3Modal');
    const overlays = [...document.body.children].filter(c => !ONLINE_OVERLAY_ESCLUSI.includes(c.id)
        && !['SCRIPT', 'AUDIO', 'VIDEO'].includes(c.tagName) && !c.classList.contains('menu-scene') && !c.classList.contains('hidden'));
    return {
        body: document.body.className,
        topbar: onlineSerializza(document.getElementById('partyTopBar')),
        console: onlineSerializza(document.getElementById('partyConsole')),
        screen: onlineSerializza(screen),
        modal: modal.classList.contains('hidden') ? null : onlineSerializza(modal),
        overlays: overlays.map(onlineSerializza).join('') || null
    };
}
let onlineUltimeRegioni = {}, onlineInvioTimer = null;
function onlinePianificaInvio() {
    if (!onlineState.attivo || onlineInvioTimer) return;
    onlineInvioTimer = setTimeout(() => {
        onlineInvioTimer = null;
        const ora = onlineRegioni();
        Object.keys(ora).forEach(k => { if (ora[k] === null) delete ora[k]; });
        const diff = changedRegions(onlineUltimeRegioni, ora);
        onlineUltimeRegioni = ora;
        if (Object.keys(diff).length) onlinePost('/api/online/parti', { parti: diff });
    }, ONLINE_FRAME_MS);
}
const onlineOsservatore = typeof MutationObserver === 'function' ? new MutationObserver(onlinePianificaInvio) : null;

/* ---------- Stato per i giocatori ---------- */
function onlineInviaStato() {
    if (!onlineState.attivo) return;
    onlinePost('/api/online/stato', {
        voto: onlineState.voto && { id: onlineState.voto.id, domanda: onlineState.voto.domanda, opzioni: onlineState.voto.opzioni,
            voti: onlineState.voto.voti, scadenza: onlineState.voto.scadenza },
        orologio: Date.now(),
        pronti: onlineState.pronti && { fatti: [...onlineState.pronti], totale: onlineGiocatoriCollegati().length },
        capo: onlineCapo(), owners: stato.onlineOwners || {}, attesi: onlineAttesi(),
        musica: (typeof musicActive !== 'undefined' && musicActive && musicActive.getAttribute('src')) || null,
        giocatori: onlineState.giocatori
    });
    onlineDisegnaBarraMaster();
}

/* ---------- Contesto e permessi ---------- */
function onlineValoreMenu(id) {
    const el = document.getElementById(id);
    return el && el.value ? el.value : null;
}
function contestoOnline() {
    return {
        screen: currentScreenId,
        owners: stato.onlineOwners || {},
        activeHero: currentActiveHero ? currentActiveHero.name : null,
        selects: Object.fromEntries(['combatHeroSelect', 'lootHeroSelect', 'treasureHeroSelect', 'merchantHeroSelect',
            'challengeHeroSelect', 'captainHeroSelect', 'prayerHeroSelect'].map(id => [id, onlineValoreMenu(id)])),
        creationTurn: onlineTurnoCreazione(),
        discardHero: heroNeedingDiscard ? heroNeedingDiscard.name : null,
        challengeHero: selectedChallengeHero ? selectedChallengeHero.name : null,
        prayingHero: selectedPrayerHero ? selectedPrayerHero.name : null,
        captainHero: selectedCaptainHero ? selectedCaptainHero.name : null,
        modalOwner: onlineState.modalOwner,
        voto: onlineState.voto
    };
}

// Cancello di js/azioni.js: il master locale passa sempre; i clic dei giocatori passano da onlineCanRun
window.onlineGate = function (nome, args) {
    if (!onlineState.attivo || !onlineState.attore) return true;
    const giocatore = onlineState.attore;
    const r = onlineCanRun(nome, args, giocatore, contestoOnline());
    if (r.ok) return true;
    if (r.voto) { onlineVotoDaClic(r.voto, nome, args, giocatore); return false; }
    if (r.pronto) { onlinePronto(giocatore, nome, args); return false; }
    onlineAvvisa(giocatore, r.motivo || 'Non è il tuo turno');
    return false;
};

/* ---------- Clic dei giocatori ---------- */
const ONLINE_RADICI = {
    screen: () => document.querySelector('#gameContainer > div:not(.hidden)'),
    topbar: () => document.getElementById('partyTopBar'),
    console: () => document.getElementById('partyConsole'),
    modal: () => document.getElementById('wc3Modal')
};
function onlineEseguiClic(c) {
    if (c.azione === '__vota') { onlineVota(c.giocatore, c.args[0], c.args[1]); return; }
    const root = c.regione === 'overlays' ? null : (ONLINE_RADICI[c.regione] || (() => null))();
    const el = root && trovaElementoRemoto(root, c.percorso);
    const attr = { click: 'action', change: 'change', input: 'input', keydown: 'enter' }[c.tipo] || 'action';
    const atteso = c.azione === '__modal' ? (el && el.dataset.modalBtn === String(c.args[0])) : (el && el.dataset[attr] === c.azione);
    if (!atteso) { onlineAvvisa(c.giocatore, 'La schermata è cambiata, riprova'); return; }
    if (c.azione === '__modal') {
        const r = onlineCanRun('__modal', c.args, c.giocatore, contestoOnline());
        if (!r.ok) { onlineAvvisa(c.giocatore, r.motivo); return; }
    }
    // Valori dei campi della regione, come li vede il giocatore
    Object.entries(c.valori || {}).forEach(([p, v]) => {
        const campo = trovaElementoRemoto(root, p.split('.').map(Number));
        if (!campo || !('value' in campo)) return;
        if (campo.type === 'checkbox') campo.checked = !!v; else campo.value = v;
    });
    onlineState.attore = c.giocatore;
    try {
        if (c.tipo === 'change' || c.tipo === 'input') el.dispatchEvent(new Event(c.tipo, { bubbles: true }));
        else if (c.tipo === 'keydown') el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        else el.click();
    } finally {
        onlineState.attore = null;
    }
    onlineDopoClic.forEach(fn => fn(c));
    onlineInviaStato();
}

/* ---------- Finestre aperte da un giocatore ---------- */
if (typeof openModal === 'function') {
    const apriOrig = openModal;
    openModal = function (...a) { onlineState.modalOwner = onlineState.attore || null; return apriOrig.apply(this, a); };
}
// Medico: cura solo il proprio eroe (spec, sezione 5)
if (typeof openMedicHeal === 'function') {
    const curaOrig = openMedicHeal;
    openMedicHeal = function (idx, hero) {
        if (onlineState.attivo && onlineState.attore && (stato.onlineOwners || {})[hero && hero.name] !== onlineState.attore) {
            onlineAvvisa(onlineState.attore, 'Il medico cura solo il tuo eroe'); return;
        }
        return curaOrig.apply(this, arguments);
    };
}

/* ---------- Attivazione ---------- */
function onlineApri() {
    if (location.protocol === 'file:') { uiError('La partita online funziona solo dal server: avvia avvia-server.bat'); return; }
    onlinePost('/api/online/apri').then(r => {
        if (r.error || !r.code) { uiError(r.error || 'Server non raggiungibile'); return; }
        onlineState.attivo = true; onlineState.code = r.code;
        if (onlineMasterStream) onlineMasterStream.close();
        onlineMasterStream = new EventSource(`${ONLINE_BASE}/api/online/master`);
        onlineMasterStream.addEventListener('stanza', e => { onlineState.giocatori = JSON.parse(e.data).giocatori; onlineStanzaCambiata(); });
        onlineMasterStream.addEventListener('clic', e => onlineEseguiClic(JSON.parse(e.data)));
        if (onlineOsservatore) onlineOsservatore.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
        onlineUltimeRegioni = {};
        onlinePianificaInvio();
        onlineInviaStato();
        onlineMostraLink();
    });
}
function onlineChiudi() {
    onlinePost('/api/online/chiudi');
    onlineState.attivo = false; onlineState.code = null; onlineState.giocatori = []; onlineState.voto = null; onlineState.pronti = null;
    if (onlineMasterStream) onlineMasterStream.close();
    if (onlineOsservatore) onlineOsservatore.disconnect();
    onlineDisegnaBarraMaster();
}
function onlineLink() {
    const base = (typeof remoteBaseUrl === 'function' && remoteBaseUrl()) || ONLINE_BASE;
    return `${base}/online/${onlineState.code}`;
}
function onlineMostraLink() {
    openModal('Partita online', `<p>Manda questo link ai giocatori (su Discord):</p>
        <p><input id="onlineLinkBox" readonly value="${esc(onlineLink())}" style="width:100%"></p>
        <p>Per giocare fuori casa attiva prima il <b>tunnel ngrok</b> dalle Opzioni (Compagnia connessa via QR): il link userà il suo indirizzo.</p>`,
        [{ label: 'OK', className: 'btn-proceed' }], { wide: true });
}
```

Nota: `remoteBaseUrl` in `js/remote.js` è dentro una IIFE: esponila con `window.remoteBaseUrl = remoteBaseUrl;` subito dopo la sua definizione (controlla con `grep -n "function remoteBaseUrl" js/remote.js` che restituisca l'indirizzo pubblico ngrok se attivo, altrimenti l'indirizzo locale).

- [ ] **Step 3: Implementa `js/online.js` (parte 2: segnaposto usati sopra, completati nei Task 7–12)**

```js
/* ---------- Funzioni completate nei passi successivi (creazione, voti, pronti, capo, barra) ---------- */
function onlineTurnoCreazione() { return null; }
function onlineCapo() { return null; }
function onlineAttesi() { return []; }
function onlineVotoDaClic(tipo, nome, args, giocatore) { onlineAvvisa(giocatore, 'Voto non ancora disponibile'); }
function onlineVota(giocatore, id, op) {}
function onlinePronto(giocatore, nome, args) { onlineState.attore = null; chiamaAzione(nome, args, null); }
function onlineStanzaCambiata() { onlineInviaStato(); }
function onlineDisegnaBarraMaster() {}
```

(Queste sei funzioni vengono **sostituite** nei Task 7, 8, 9, 11: ogni task indica il corpo completo.)

- [ ] **Step 4: Pulsante nelle Opzioni**

In `js/menu.js`, dentro `openOptions`, trova dove `js/remote.js` aggiunge il pannello "Compagnia connessa via QR" (`grep -n "remote-ngrok-panel" js/remote.js`) e, nello stesso modo (avvolgendo `openOptions` in `js/online.js`), aggiungi in coda al corpo della finestra:

```js
if (typeof openOptions === 'function') {
    const opzioniOrig = openOptions;
    openOptions = function (...a) {
        opzioniOrig.apply(this, a);
        const body = document.getElementById('wc3ModalBody');
        if (!body) return;
        const box = document.createElement('div');
        box.className = 'options-grid';
        box.innerHTML = onlineState.attivo
            ? `<span class="option-label">Partita online attiva<small>${esc(onlineGiocatoriCollegati().join(', ') || 'Nessun giocatore collegato')}</small></span>
               <span><button class="btn-small" ${azione('onlineMostraLink')}>Link</button> <button class="btn-small btn-danger" ${azione('onlineChiudi')}>Chiudi</button></span>`
            : `<span class="option-label">Partita online<small>Tu sei il master: i giocatori si collegano con un link e comandano un eroe ciascuno</small></span>
               <span><button class="btn-small btn-proceed" ${azione('onlineApri')}>Apri la stanza</button></span>`;
        body.appendChild(box);
    };
}
```

- [ ] **Step 5: Verifica**

Run: `node --check js/online.js && node tests/run.js`
Expected: verdi (anche `azioni.test.js`: le azioni `onlineApri`, `onlineChiudi`, `onlineMostraLink` esistono come globali; `caricaPagina('index.html')` non si rompe).

Prova a mano: `avvia-server.bat`, apri `http://localhost:8787/index.html`, Opzioni → "Apri la stanza", copia il link, aprilo in una finestra anonima, entra come "Prova". La finestra anonima mostra la schermata del master; cambiando schermata sul master cambia anche lì.

- [ ] **Step 6: Commit**

```bash
git add js/online.js js/remote.js js/menu.js index.html tests/ambiente.js tests/online.test.js
git commit -m "Partita online lato master: stanza dalle Opzioni, regioni inviate, clic dei giocatori eseguiti con i permessi"
```

---

### Task 7: Stanza, creazione a turno, proprietari, "tocca a te"

**Files:**
- Modify: `js/online.js` (sostituisci `onlineTurnoCreazione`, `onlineAttesi`, `onlineStanzaCambiata`; avvolgi `confirmPartySize`, `nextHero`, `startPartyCreation`)
- Test: `tests/online.test.js`

**Interfaces:**
- Produces: `onlineOrdine()` (nomi dei giocatori in ordine d'ingresso), `onlineTurnoCreazione() -> nome|null`, `onlineAttesi() -> string[]`; `stato.onlineOwners` riempito alla creazione.

- [ ] **Step 1: Test che fallisce**

```js
    t.test('creazione a turno: tocca al giocatore successivo, l\'eroe diventa suo', () => {
        const h = carica();
        h.eval(`onlineState.attivo = true; onlineState.giocatori = [{ name: 'Marco', connected: true }, { name: 'Sara', connected: true }];
            stato.party = []; stato.onlineOwners = {}; currentScreenId = 'screenParty';`);
        t.uguale('Marco', h.onlineTurnoCreazione());
        h.eval(`stato.party.push({ name: 'Icaro' }); stato.onlineOwners.Icaro = 'Marco';`);
        t.uguale('Sara', h.onlineTurnoCreazione());
        h.eval(`currentScreenId = 'screenMap';`);
        t.uguale(null, h.onlineTurnoCreazione());
    });
```

Run: `node tests/run.js` — Expected: FAIL (`onlineTurnoCreazione` ritorna sempre null).

- [ ] **Step 2: Implementa** (sostituisci i segnaposto in `js/online.js`)

```js
// Giocatori in ordine d'ingresso (anche i disconnessi: il loro posto resta)
const onlineOrdine = () => onlineState.giocatori.map(gi => gi.name);

// Creazione degli eroi: a turno, il primo giocatore senza eroe nell'ordine d'ingresso
function onlineTurnoCreazione() {
    if (!onlineState.attivo || currentScreenId !== 'screenParty') return null;
    const conEroe = Object.values(stato.onlineOwners || {});
    return onlineOrdine().find(n => !conEroe.includes(n)) || null;
}

// Chi deve agire adesso (per l'avviso "Tocca a te" dei giocatori)
function onlineAttesi() {
    if (!onlineState.attivo) return [];
    const owners = stato.onlineOwners || {};
    if (onlineState.voto) return onlineGiocatoriCollegati().filter(n => !(n in onlineState.voto.voti));
    if (onlineState.pronti) return onlineGiocatoriCollegati().filter(n => !onlineState.pronti.has(n));
    if (currentScreenId === 'screenParty') return [onlineTurnoCreazione()].filter(Boolean);
    if (heroNeedingDiscard) return [owners[heroNeedingDiscard.name]].filter(Boolean);
    if (currentScreenId === 'screenCombat' && combatPhase === 'heroes') {
        if (currentActiveHero) return [owners[currentActiveHero.name]].filter(Boolean);
        return [...new Set(stato.party.filter(h => h.hp > 0 && !h.hasActed).map(h => owners[h.name]).filter(Boolean))];
    }
    if (currentScreenId === 'screenChallenge' && selectedChallengeHero) return [owners[selectedChallengeHero.name]].filter(Boolean);
    if (currentScreenId === 'screenRest' && selectedPrayerHero) return [owners[selectedPrayerHero.name]].filter(Boolean);
    return [];
}

// Stanza cambiata (ingresso, uscita): la lista dei giocatori nella schermata della compagnia e lo stato
function onlineStanzaCambiata() {
    onlineDisegnaLobby();
    onlineInviaStato();
}
function onlineDisegnaLobby() {
    const area = document.getElementById('partyConfigArea');
    if (!area) return;
    let box = document.getElementById('onlineLobby');
    if (!onlineState.attivo) { if (box) box.remove(); return; }
    if (!box) { box = document.createElement('div'); box.id = 'onlineLobby'; box.className = 'wc-inset'; area.prepend(box); }
    const righe = onlineState.giocatori.map(gi => `<li>${esc(gi.name)} ${gi.connected ? '🟢' : '⚪'}</li>`).join('') || '<li>Nessun giocatore: manda il link</li>';
    box.innerHTML = `<p><b>Giocatori nella stanza</b> (un eroe a testa)</p><ul>${righe}</ul>`;
}

// Numero di eroi = giocatori collegati (il master non gioca), entro il massimo della campagna
if (typeof confirmPartySize === 'function') {
    const confermaOrig = confirmPartySize;
    confirmPartySize = function () {
        if (onlineState.attivo) {
            const n = onlineGiocatoriCollegati().length;
            const sel = document.getElementById('partySizeSelect');
            const max = Math.max(...[...sel.options].map(o => Number(o.value)));
            if (n < 1) { uiError('Nessun giocatore collegato'); return; }
            if (n > max) { uiError(`Troppi giocatori: questa campagna ne permette al massimo ${max}`); return; }
            if (![...sel.options].some(o => Number(o.value) === n)) sel.insertAdjacentHTML('beforeend', `<option value="${n}">${n} Eroi</option>`);
            sel.value = String(n);
            stato.onlineOwners = {};
        }
        return confermaOrig.apply(this, arguments);
    };
}
// L'eroe appena creato diventa del giocatore di turno
if (typeof nextHero === 'function') {
    const prossimoOrig = nextHero;
    nextHero = function () {
        const chi = onlineTurnoCreazione();
        if (onlineState.attivo && chi && activeHeroForCreation) stato.onlineOwners = { ...(stato.onlineOwners || {}), [activeHeroForCreation.name]: chi };
        return prossimoOrig.apply(this, arguments);
    };
}
if (typeof startPartyCreation === 'function') {
    const creaOrig = startPartyCreation;
    startPartyCreation = function () { const r = creaOrig.apply(this, arguments); stato.onlineOwners = {}; onlineDisegnaLobby(); return r; };
}
```

Nota: `activeHeroForCreation` è un `let` di `js/creazione.js` (stesso ambito globale degli script): è raggiungibile da `js/online.js`. Lo stesso vale per `currentActiveHero`, `combatPhase`, `heroNeedingDiscard`, `selectedChallengeHero`, `selectedPrayerHero`, `selectedCaptainHero`.

- [ ] **Step 3: Verifica** — Run: `node tests/run.js` — Expected: verdi.

Prova a mano con due finestre anonime ("Marco", "Sara"): il master sceglie la campagna, preme "Conferma" del numero di eroi (diventa 2), Marco sceglie il suo eroe (Sara riceve "Sta scegliendo un altro giocatore" se clicca), poi Sara.

- [ ] **Step 4: Commit**

```bash
git add js/online.js tests/online.test.js
git commit -m "Partita online: stanza nella schermata della compagnia, creazione degli eroi a turno, proprietari"
```

---

### Task 8: Voti (motore) e voto della mappa, capo della spedizione, barra del master

**Files:**
- Modify: `js/online.js` (sostituisci `onlineCapo`, `onlineVotoDaClic`, `onlineVota`, `onlineDisegnaBarraMaster`; aggiungi `onlineApriVoto`, `onlineChiudiVoto`, `onlineForzaVoto`; avvolgi `startMap`/`showScreen` per aprire il voto della mappa)
- Test: `tests/online.test.js`

**Interfaces:**
- Consumes: `resolveVote`, `nextCaptain`, `VOTE_SECONDS`.
- Produces:
  - `onlineApriVoto({ tipo, domanda, opzioni: [{id, label}], secondi, esegui: id => void })`
  - `onlineVota(giocatore, idVoto, idOpzione)`
  - `onlineChiudiVoto(forzato?: idOpzione)`
  - `onlineCapo() -> nome|null`
  - voto `mappa`: si apre sulla schermata della mappa con più nodi aperti; il clic di un giocatore su un nodo vota.

- [ ] **Step 1: Test che fallisce**

```js
    t.test('voto: si chiude quando votano tutti, esegue l\'opzione vincente', () => {
        const h = carica();
        h.eval(`onlineState.attivo = true; onlineState.giocatori = [{ name: 'Marco', connected: true }, { name: 'Sara', connected: true }];
            globalThis.__scelto = null;
            onlineApriVoto({ tipo: 'prova', domanda: 'Dove?', opzioni: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], secondi: 30, esegui: id => { globalThis.__scelto = id; } });`);
        const id = h.eval('onlineState.voto.id');
        h.onlineVota('Marco', id, 'b');
        t.uguale(null, h.eval('globalThis.__scelto'), 'manca Sara');
        h.onlineVota('Sara', id, 'b');
        t.uguale('b', h.eval('globalThis.__scelto'));
        t.uguale(null, h.eval('onlineState.voto'));
    });
```

Run: `node tests/run.js` — Expected: FAIL (`onlineApriVoto` non definita).

- [ ] **Step 2: Implementa** (sostituisci i segnaposto)

```js
/* ---------- Capo della spedizione: uno per livello della mappa ---------- */
function onlineCapo() {
    if (!onlineState.attivo) return null;
    const nodo = stato.stsMapNodes.find(n => n.id === stato.currentNodeId);
    return nextCaptain(onlineState.giocatori, nodo ? nodo.level + 1 : 0);
}

/* ---------- Voti ---------- */
let onlineVotoTimer = null, onlineVotoSeq = 0;
function onlineApriVoto({ tipo, domanda, opzioni, secondi = VOTE_SECONDS, esegui }) {
    if (!onlineState.attivo || !onlineGiocatoriCollegati().length) { esegui(opzioni[0].id); return; }
    clearTimeout(onlineVotoTimer);
    onlineState.voto = { id: `v${++onlineVotoSeq}`, tipo, domanda, opzioni, voti: {}, scadenza: Date.now() + secondi * 1000, esegui };
    onlineVotoTimer = setTimeout(() => onlineChiudiVoto(), secondi * 1000);
    onlineInviaStato();
}
function onlineVota(giocatore, id, op) {
    const v = onlineState.voto;
    if (!v || v.id !== id || !v.opzioni.some(o => o.id === op)) return;
    v.voti[giocatore] = op;
    if (onlineGiocatoriCollegati().every(n => n in v.voti)) onlineChiudiVoto();
    else onlineInviaStato();
}
function onlineChiudiVoto(forzato) {
    const v = onlineState.voto;
    if (!v) return;
    clearTimeout(onlineVotoTimer);
    onlineState.voto = null;
    const vincente = forzato !== undefined ? forzato
        : resolveVote(v.voti, v.opzioni.map(o => o.id), onlineCapo(), onlineGiocatoriCollegati());
    onlineInviaStato();
    onlineState.attore = null;
    v.esegui(vincente);
    onlineInviaStato();
}
function onlineForzaVoto(op) { onlineChiudiVoto(op); }

// Clic di un giocatore che diventa un voto (regole 'voto:<tipo>' di js/online-regole.js)
function onlineVotoDaClic(tipo, nome, args, giocatore) {
    const v = onlineState.voto;
    if (tipo === 'mappa') {
        if (!v || v.tipo !== 'mappa') onlineApriVotoMappa();
        if (onlineState.voto) onlineVota(giocatore, onlineState.voto.id, String(args[0]));
        return;
    }
    onlineVotoSpeciale(tipo, nome, args, giocatore);  // Task 9
}

/* ---------- Voto della mappa ---------- */
function onlineApriVotoMappa() {
    const aperti = stato.stsMapNodes.filter(n => n.active && !n.done);
    if (!aperti.length) return;
    const nome = n => (typeof nodeBannerInfo === 'function' ? `${nodeBannerInfo(n).kind}: ${nodeBannerInfo(n).title}` : n.type);
    onlineApriVoto({ tipo: 'mappa', domanda: 'Dove andiamo?', opzioni: aperti.map(n => ({ id: String(n.id), label: nome(n) })),
        esegui: id => selectStsNode(Number(id)) });
}
// Arrivati sulla mappa con più strade: il voto parte da solo
if (typeof showScreen === 'function') {
    const mostraOrig = showScreen;
    showScreen = function (id) {
        const r = mostraOrig.apply(this, arguments);
        if (onlineState.attivo) {
            if (onlineState.voto && id !== 'screenMap' && onlineState.voto.tipo === 'mappa') { clearTimeout(onlineVotoTimer); onlineState.voto = null; }
            if (id === 'screenMap' && stato.stsMapNodes.filter(n => n.active && !n.done).length > 1) setTimeout(onlineApriVotoMappa, 600);
            onlineInviaStato();
        }
        return r;
    };
}

/* ---------- Barra del master (non inviata ai giocatori) ---------- */
function onlineDisegnaBarraMaster() {
    let bar = document.getElementById('onlineMasterBar');
    if (!onlineState.attivo) { if (bar) bar.remove(); return; }
    if (!bar) { bar = document.createElement('div'); bar.id = 'onlineMasterBar'; bar.className = 'wc-panel';
        bar.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:12px;z-index:40;padding:8px 14px;max-width:calc(100% - 32px)';
        document.body.appendChild(bar); }
    const v = onlineState.voto;
    const giocatori = onlineState.giocatori.map(gi => `${esc(gi.name)}${gi.connected ? '' : ' (disconnesso)'}${onlineCapo() === gi.name ? ' 👑' : ''}`).join(', ');
    bar.innerHTML = `<b>Master</b> · ${giocatori || 'nessun giocatore'}`
        + (v ? `<br>${esc(v.domanda)} ${v.opzioni.map(o => `<button class="btn-small" ${azione('onlineForzaVoto', o.id)}>${esc(o.label)} · ${Object.values(v.voti).filter(x => x === o.id).length}</button>`).join(' ')}` : '')
        + (onlineState.pronti ? `<br>Pronti ${onlineState.pronti.size}/${onlineGiocatoriCollegati().length} <button class="btn-small" ${azione('onlineForzaPronti')}>Si parte</button>` : '');
}
```

Aggiungi `onlineVotoSpeciale` e `onlineForzaPronti` come segnaposto (completati nei Task 9 e 10):

```js
function onlineVotoSpeciale(tipo, nome, args, giocatore) { onlineAvvisa(giocatore, 'Voto non ancora disponibile'); }
function onlineForzaPronti() {}
```

Il clic del master su un nodo esegue subito (il master può tutto): in `onlineGate` il master non ha `attore`, quindi passa. Se c'è un voto della mappa aperto, `showScreen` lo chiude all'uscita dalla mappa.

- [ ] **Step 3: Verifica** — Run: `node --check js/online.js && node tests/run.js` — Expected: verdi.

Prova a mano: sulla mappa con due nodi aperti compare il voto (barra in basso) per i giocatori e il master; due voti uguali portano subito al nodo; un pareggio aspetta il tempo e poi vince la scelta del capo (👑); il master può premere un'opzione nella sua barra per forzare.

- [ ] **Step 4: Commit**

```bash
git add js/online.js tests/online.test.js
git commit -m "Partita online: voti con timer e pareggio al capo, voto della mappa, barra del master"
```

**Fine della tappa 1.** Prova a mano completa con due finestre anonime: creazione, mappa votata, uno scontro (ognuno agisce col suo eroe; bersaglio del nemico ancora scelto dal master, oppure dal giocatore: regola `voto:bersaglio` senza voto restituisce "Voto non ancora disponibile" e il master sceglie), bottino preso da un giocatore.

---

## TAPPA 2 — Si decide insieme

### Task 9: Voti di prova, preghiera, bersaglio del nemico, contrattazione, rinnovo

**Files:**
- Modify: `js/online.js` (sostituisci `onlineVotoSpeciale`; avvolgi `startChallenge`, `startRest`, `startMonsterTurn`)
- Test: `tests/online.test.js`

**Interfaces:**
- Consumes: `onlineApriVoto`, `VOTE_SECONDS_TARGET`, `isFinalNode`, `restPrayer`, `challengeChoose`, `confirmChallengeHero`, `startPrayer`, `confirmPrayerHero`, `executeMonsterAttack`, `haggle`, `rerollMerchantStock`.
- Produces: voti `prova` (all'ingresso nella prova), `preghiera` (all'ingresso nel riposo), `bersaglio` (al turno del nemico con bersaglio scelto dalla compagnia), `contratta` e `rinnova` (dal clic di un giocatore).

- [ ] **Step 1: Test che fallisce**

```js
    t.test('voto della prova: "Lascia perdere" chiude la prova, un eroe la affronta', () => {
        const h = carica();
        h.eval(`onlineState.attivo = true; onlineState.giocatori = [{ name: 'Marco', connected: true }];
            stato.party = [{ name: 'Icaro', hp: 3, maxHp: 4 }, { name: 'Astarte', hp: 0, maxHp: 4 }];
            globalThis.__fatto = []; challengeChoose = a => __fatto.push('scelta:' + a); confirmChallengeHero = () => __fatto.push('eroe');
            isFinalNode = () => false; onlineApriVotoProva();`);
        const op = h.eval('onlineState.voto.opzioni.map(o => o.id)');
        t.uguale(['Icaro', '__lascia'], op, 'solo gli eroi in piedi, più Lascia perdere');
        h.onlineVota('Marco', h.eval('onlineState.voto.id'), 'Icaro');
        t.uguale(['scelta:true', 'eroe'], h.eval('__fatto'));
    });
```

Run: `node tests/run.js` — Expected: FAIL (`onlineApriVotoProva` non definita).

- [ ] **Step 2: Implementa**

```js
const onlineEroiInPiedi = () => stato.party.filter(h => h.hp > 0).map(h => ({ id: h.name, label: h.name }));

function onlineApriVotoProva() {
    const opzioni = onlineEroiInPiedi();
    if (!isFinalNode()) opzioni.push({ id: '__lascia', label: 'Lascia perdere' });
    onlineApriVoto({ tipo: 'prova', domanda: 'Chi affronta la prova?', opzioni, esegui: id => {
        if (id === '__lascia') { challengeChoose(false); return; }
        challengeChoose(true);
        const sel = document.getElementById('challengeHeroSelect');
        if (sel) sel.value = id;
        confirmChallengeHero();
    } });
}
function onlineApriVotoPreghiera() {
    if (restPrayer) return;
    onlineApriVoto({ tipo: 'preghiera', domanda: 'Chi prega?', opzioni: [...onlineEroiInPiedi(), { id: '__nessuno', label: 'Nessuno' }],
        esegui: id => { if (id === '__nessuno') return; startPrayer(); confirmPrayerHero(id); } });
}
function onlineApriVotoBersaglio() {
    onlineApriVoto({ tipo: 'bersaglio', domanda: 'Chi riceve il colpo del nemico?', opzioni: onlineEroiInPiedi(), secondi: VOTE_SECONDS_TARGET,
        esegui: id => { const sel = document.getElementById('monsterTargetSelect'); if (sel) sel.value = id; executeMonsterAttack(); } });
}

function onlineVotoSpeciale(tipo, nome, args, giocatore) {
    if (onlineState.voto && onlineState.voto.tipo === tipo) return;
    if (tipo === 'bersaglio') { onlineApriVotoBersaglio(); return; }
    if (tipo === 'contratta') {
        if (merchantHaggle !== null) return;
        onlineApriVoto({ tipo, domanda: 'Contrattiamo con il mercante?', opzioni: [{ id: '__no', label: 'No' },
            ...stato.party.filter(h => h.hp > 0).map(h => ({ id: h.name, label: `Sì, con ${h.name}` }))],
            esegui: id => { if (id !== '__no') haggle(id); } });
        return;
    }
    if (tipo === 'rinnova') {
        onlineApriVoto({ tipo, domanda: `Rinnoviamo la merce (${MERCHANT_REROLL_COST} Scudi)?`, opzioni: [{ id: 'no', label: 'No' }, { id: 'si', label: 'Sì' }],
            esegui: id => { if (id === 'si') rerollMerchantStock(); } });
    }
}

// I voti si aprono da soli entrando nella prova, nel riposo, al turno del nemico
[['startChallenge', () => setTimeout(onlineApriVotoProva, 800)],
 ['startRest', () => setTimeout(onlineApriVotoPreghiera, 800)],
 ['startMonsterTurn', () => {
     const sel = document.getElementById('monsterTargetSelect');
     const area = document.getElementById('monsterTargetArea');
     if (sel && !sel.disabled && area && !area.classList.contains('hidden')) onlineApriVotoBersaglio();
 }]].forEach(([nome, dopo]) => {
    if (typeof window[nome] !== 'function') return;
    const orig = window[nome];
    window[nome] = function () { const r = orig.apply(this, arguments); if (onlineState.attivo) dopo(); return r; };
});
```

Nota: `startChallenge`, `startRest`, `startMonsterTurn` sono dichiarate con `function` in script classici: riassegnare `window[nome]` cambia anche le chiamate interne (stesso meccanismo già usato da `js/remote.js`).

- [ ] **Step 3: Verifica** — Run: `node tests/run.js` — Expected: verdi. Prova a mano: prova, riposo, turno del nemico, contrattazione e rinnovo votati.

- [ ] **Step 4: Commit**

```bash
git add js/online.js tests/online.test.js
git commit -m "Partita online: voti di prova, preghiera, bersaglio del nemico, contrattazione e rinnovo della merce"
```

---

### Task 10: "Ho finito" al riposo e dal mercante

**Files:**
- Modify: `js/online.js` (sostituisci `onlinePronto`, `onlineForzaPronti`; chiudi i pronti in `showScreen`)
- Test: `tests/online.test.js`

**Interfaces:**
- Produces: `onlineState.pronti` (`Set` di nomi o `null`), `onlinePronto(giocatore, nome, args)`, `onlineForzaPronti()`.

- [ ] **Step 1: Test che fallisce**

```js
    t.test('Ho finito: si parte quando l\'hanno premuto tutti i collegati', () => {
        const h = carica();
        h.eval(`onlineState.attivo = true; onlineState.giocatori = [{ name: 'Marco', connected: true }, { name: 'Sara', connected: true }, { name: 'Luca', connected: false }];
            globalThis.__partito = 0; globalThis.advanceNode = () => { __partito++; };`);
        h.onlinePronto('Marco', 'advanceNode', []);
        t.uguale(0, h.eval('__partito'));
        h.onlinePronto('Sara', 'advanceNode', []);
        t.uguale(1, h.eval('__partito'), 'Luca è disconnesso: non si aspetta');
        t.uguale(null, h.eval('onlineState.pronti'));
    });
```

Run: `node tests/run.js` — Expected: FAIL.

- [ ] **Step 2: Implementa**

```js
let onlineProntiAzione = null;
function onlinePronto(giocatore, nome, args) {
    if (!onlineState.pronti) { onlineState.pronti = new Set(); onlineProntiAzione = { nome, args }; }
    onlineState.pronti.add(giocatore);
    if (onlineGiocatoriCollegati().every(n => onlineState.pronti.has(n))) onlineForzaPronti();
    else onlineInviaStato();
}
function onlineForzaPronti() {
    const a = onlineProntiAzione;
    onlineState.pronti = null; onlineProntiAzione = null;
    onlineState.attore = null;
    if (a) chiamaAzione(a.nome, a.args, null);
    onlineInviaStato();
}
```

In `showScreen` avvolta (Task 8), dentro `if (onlineState.attivo) {`, aggiungi `onlineState.pronti = null; onlineProntiAzione = null;` quando `id` cambia schermata.

- [ ] **Step 3: Verifica** — Run: `node tests/run.js` — Expected: verdi. Prova a mano: al riposo "Riparti" premuto da un giocatore mostra "Pronti 1/2"; col secondo si parte; il master può forzare.

- [ ] **Step 4: Commit**

```bash
git add js/online.js tests/online.test.js
git commit -m "Partita online: Ho finito al riposo e dal mercante"
```

**Fine della tappa 2.**

---

## TAPPA 3 — Si gioca bene in rete

### Task 11: Disconnessioni, rientro e salvataggio automatico "Online"

**Files:**
- Modify: `js/online.js` (avviso al master, salvataggio automatico, "Riprendi partita online"), `js/salvataggi.js` (lo slot `'online'` non entra nella lista degli slot normali: controlla `saveSlotHtml`/`SAVE_SLOTS`, nessuna modifica se il ciclo va da 1 a `SAVE_SLOTS`)
- Test: `tests/online.test.js`

**Interfaces:**
- Produces: `onlineSalvaAutomatico()` (scrive lo slot `'online'` con `writeSave('online', buildSaveData())`), azione `onlineRiprendi()` (carica lo slot `'online'` con `loadFromSlot('online')`).

- [ ] **Step 1: Test che fallisce**

```js
    t.test('salvataggio automatico online: lo slot "online" si scrive e si rilegge', () => {
        const h = carica();
        h.eval(`onlineState.attivo = true; stato.currentCampaign = CAMPAIGNS.tutorial; stato.stsMapNodes = []; stato.party = [];
            stato.unlockedRelics = []; stato.activeCurses = []; stato.expeditionStats = newExpeditionStats(); stato.onlineOwners = { A: 'Marco' };`);
        h.onlineSalvaAutomatico();
        t.uguale({ A: 'Marco' }, h.readSave('online').stato.onlineOwners);
    });
```

Run: `node tests/run.js` — Expected: FAIL.

- [ ] **Step 2: Implementa** (in `js/online.js`)

```js
/* ---------- Salvataggio automatico e ripresa ---------- */
function onlineSalvaAutomatico() {
    if (!onlineState.attivo || !stato.currentCampaign) return;
    try { writeSave('online', buildSaveData()); } catch (e) { console.error('Salvataggio online non riuscito', e); }
}
function onlineRiprendi() {
    if (!readSave('online')) { uiError('Nessuna partita online salvata'); return; }
    loadFromSlot('online');
}

// Avviso al master quando un giocatore si disconnette o rientra
let onlineCollegatiPrima = [];
function onlineAvvisoConnessioni() {
    const ora = onlineGiocatoriCollegati();
    onlineCollegatiPrima.filter(n => !ora.includes(n)).forEach(n => uiError(`${n} si è disconnesso: comandi tu il suo eroe finché non torna`));
    ora.filter(n => !onlineCollegatiPrima.includes(n)).forEach(n => uiMessage(`${n} è nella stanza`));
    onlineCollegatiPrima = ora;
    if (onlineState.voto && ora.length && ora.every(n => n in onlineState.voto.voti)) onlineChiudiVoto();
    if (onlineState.pronti && ora.length && ora.every(n => onlineState.pronti.has(n))) onlineForzaPronti();
}
```

Cambia `onlineStanzaCambiata` (Task 7) in:

```js
function onlineStanzaCambiata() {
    onlineAvvisoConnessioni();
    onlineDisegnaLobby();
    onlineInviaStato();
}
```

Nella `showScreen` avvolta (Task 8), dentro `if (onlineState.attivo)`, aggiungi `if (id === 'screenMap') onlineSalvaAutomatico();`.

Nel pannello delle Opzioni (Task 6, Step 4), quando la stanza è aperta aggiungi il pulsante `<button class="btn-small" ${azione('onlineRiprendi')}>Riprendi l'ultima</button>` se `readSave('online')` esiste.

- [ ] **Step 3: Verifica** — Run: `node tests/run.js && node tools/prova_online.mjs` — Expected: verdi. Prova a mano: chiudi la finestra di un giocatore → dopo 20 s il master vede l'avviso e il voto non lo aspetta; riaprendo il link il giocatore rientra senza riscrivere il nome; il master ricarica la pagina, riapre la stanza e "Riprendi l'ultima" rimette la partita dall'ultima mappa con gli stessi proprietari.

- [ ] **Step 4: Commit**

```bash
git add js/online.js tests/online.test.js
git commit -m "Partita online: disconnessioni, rientro, salvataggio automatico e ripresa"
```

---

### Task 12: Media leggeri e cache

**Files:**
- Modify: `server/online.js` (`/leggero/`), `server/server.js` (`serveStaticFile`: cache per i media)
- Modify: `tools/prova_online.mjs` (prove dei media)

**Interfaces:**
- Consumes: ffmpeg nel PATH (facoltativo).
- Produces: `GET /leggero/<percorso>` → file leggero (WebP 960 px qualità 65 / MP4 480p CRF 32 senza audio) dalla cache `server/cache-leggera/`, creato alla prima richiesta; senza ffmpeg o in caso d'errore → l'originale.

- [ ] **Step 1: Prove che falliscono** (in `tools/prova_online.mjs`, prima di `master.chiudi()`)

```js
    const img = await new Promise(r => http.get({ host: '127.0.0.1', port: PORT, path: '/leggero/immagini/segnaposto/combat.svg', headers: { Host: fuori } }, res => { res.resume(); r(res); }));
    ok(img.statusCode === 200, 'un\'immagine non convertibile (SVG) arriva originale da /leggero/');
    ok(/max-age=604800/.test(img.headers['cache-control'] || ''), 'i media hanno la cache del browser');
    const fuga = await new Promise(r => http.get({ host: '127.0.0.1', port: PORT, path: '/leggero/../tools/chiave_gemini.txt', headers: { Host: fuori } }, res => { res.resume(); r(res); }));
    ok(fuga.statusCode === 403 || fuga.statusCode === 404, 'niente file fuori da immagini/ e video/');
```

(Controlla con `ls immagini/segnaposto/` il nome di un SVG esistente e usalo.)

Run: `node tools/prova_online.mjs` — Expected: FAIL sulle nuove prove.

- [ ] **Step 2: Implementa `/leggero/` in `server/online.js`**

```js
const { execFile } = require('child_process');
const ROOT = path.join(__dirname, '..');
const CACHE = path.join(__dirname, 'cache-leggera');
const MEDIA_CACHE = 'public, max-age=604800';
const TIPI = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm' };
const inCorso = new Map();  // file leggero -> Promise (una conversione alla volta per file)

function mandaFile(res, file) {
    fs.readFile(file, (err, buf) => {
        if (err) { res.writeHead(404); res.end(); return; }
        res.writeHead(200, { 'Content-Type': TIPI[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': MEDIA_CACHE });
        res.end(buf);
    });
}
function converti(orig, dest) {
    if (inCorso.has(dest)) return inCorso.get(dest);
    const video = /\.(mp4|webm)$/i.test(orig);
    const args = video
        ? ['-y', '-i', orig, '-vf', "scale=-2:'min(480,ih)'", '-c:v', 'libx264', '-crf', '32', '-preset', 'veryfast', '-an', '-movflags', '+faststart', dest]
        : ['-y', '-i', orig, '-vf', "scale='min(960,iw)':'min(960,ih)':force_original_aspect_ratio=decrease", '-c:v', 'libwebp', '-quality', '65', dest];
    const p = new Promise(resolve => {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        execFile('ffmpeg', args, { timeout: 120000 }, err => { inCorso.delete(dest); resolve(!err && fs.existsSync(dest)); });
    });
    inCorso.set(dest, p);
    return p;
}
function leggero(req, res, pathname) {
    const rel = path.normalize(decodeURIComponent(pathname.slice('/leggero/'.length)));
    if (rel.startsWith('..') || path.isAbsolute(rel) || !/^(immagini|video)[\\/]/.test(rel)) { res.writeHead(403); res.end(); return; }
    const orig = path.join(ROOT, rel);
    if (!fs.existsSync(orig)) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(rel).toLowerCase();
    if (!['.webp', '.png', '.jpg', '.jpeg', '.mp4', '.webm'].includes(ext)) { mandaFile(res, orig); return; }
    const dest = path.join(CACHE, rel.replace(/\.(png|jpe?g)$/i, '.webp').replace(/\.webm$/i, '.mp4'));
    if (fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= fs.statSync(orig).mtimeMs) { mandaFile(res, dest); return; }
    converti(orig, dest).then(fatto => mandaFile(res, fatto ? dest : orig));
}
```

e in `gestisci`, all'inizio: `if (pathname.startsWith('/leggero/')) { leggero(req, res, pathname); return true; }`. In `server/server.js` estendi la condizione di delega con `|| pathname.startsWith('/leggero/')`.

- [ ] **Step 3: Cache dei media in `server/server.js`** — in `serveStaticFile`, al posto delle intestazioni fisse:

```js
        const media = /^\.(webp|png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|ttf|otf|woff2?)$/.test(ext);
        res.writeHead(200, {
            'Content-Type': MIME[ext] || 'application/octet-stream',
            // Media: in cache una settimana (meno banda per i giocatori online); pagine e codice sempre freschi
            'Cache-Control': media ? 'public, max-age=604800' : 'no-store, must-revalidate',
            ...(media ? {} : { 'Pragma': 'no-cache' })
        });
```

- [ ] **Step 4: Verifica** — Run: `node --check server/online.js server/server.js && node tools/prova_online.mjs` — Expected: verdi. Prova a mano con ffmpeg: apri come giocatore uno scontro con un'immagine grande e controlla che `server/cache-leggera/immagini/...` si riempia e che la richiesta (strumenti del browser, scheda Rete) pesi meno dell'originale; un elite con video mostra il video leggero.

- [ ] **Step 5: Commit**

```bash
git add server/online.js server/server.js tools/prova_online.mjs
git commit -m "Partita online: immagini e video leggeri per i giocatori, cache dei media"
```

---

### Task 13: Documentazione e lista di controllo

**Files:**
- Modify: `CLAUDE.md` (sezione nuova "Partita online" dopo "Telefono", riga in "Architettura" per `js/online-regole.js` e `js/online.js`)
- Create: `docs/superpowers/prova-online.md`

- [ ] **Step 1: `CLAUDE.md`** — aggiungi dopo la sezione "Telefono (server di Valerio)":

```markdown
### Partita online (a distanza)

Il master (host) avvia il server e apre la stanza dalle Opzioni ("Partita online"): i giocatori aprono `https://<tunnel>/online/<codice>`, scrivono il nome (token salvato nel loro browser) e vedono la schermata del master. Il master non ha un eroe e può cliccare tutto; ogni giocatore comanda un eroe (`stato.onlineOwners`, salvato, versione 5). Architettura "a specchio": `js/online.js` manda al server le regioni cambiate (`topbar`, `console`, `screen`, `modal`, `overlays`, `body`; `onlineRegioni`, `changedRegions`) e riceve i clic dei giocatori (`onlineEseguiClic`: elemento per percorso, valori dei menu, poi il clic vero passa da `js/azioni.js` con `window.onlineGate`). Permessi in `ONLINE_PERMESSI` / `onlineCanRun` di `js/online-regole.js` (azioni non elencate: solo master). Voti con timer (`VOTE_SECONDS`, `VOTE_SECONDS_TARGET` in `js/regole.js`; `onlineApriVoto`, `resolveVote`, pareggio al capo `nextCaptain`, uno per livello): mappa, prova, chi prega, bersaglio del nemico, contrattazione, rinnovo. "Ho finito" al riposo e dal mercante (`onlinePronto`). Salvataggio automatico nello slot `online` a ogni ritorno sulla mappa (`onlineRiprendi`). Server: `server/online.js` (stanza, `/api/online/*`, stream SSE gzip, `/leggero/` con media leggeri via ffmpeg in `server/cache-leggera/`, ignorata da git); le chiamate da master solo con `Host` locale. Pagina del giocatore: `server/public/online.html` + `server/public/online.js` (servito come `/online-client.js`). Prova del server: `node tools/prova_online.mjs`; lista di controllo a mano: `docs/superpowers/prova-online.md`.
```

- [ ] **Step 2: `docs/superpowers/prova-online.md`**

```markdown
# Prova a mano della partita online

Preparazione: `avvia-server.bat`; master su `http://localhost:8787/index.html`; due finestre anonime (Marco, Sara). Per la prova vera: tunnel ngrok attivo dalle Opzioni e un amico da un'altra rete.

1. Opzioni → Partita online → "Apri la stanza": compare il link. Aperto da Marco e Sara: scrivono il nome, vedono il menu del master.
2. Il master sceglie la campagna: nella schermata della compagnia c'è l'elenco "Giocatori nella stanza" con 🟢.
3. "Conferma": il numero di eroi diventa 2. Marco sceglie eroe, abilità, oggetto; se Sara clicca riceve "Sta scegliendo un altro giocatore". Poi Sara.
4. Mappa con due strade: barra del voto in basso per tutti; Marco e Sara votano lo stesso nodo → si parte subito. Pareggio: si aspetta il tempo e decide il capo 👑. Il master forza un voto dalla sua barra.
5. Scontro: Marco può scegliere solo il suo eroe nel menu; azione e tiro solo lui; Sara riceve "Non è il tuo turno" se prova. Bersaglio del nemico votato (15 s).
6. Bottino: lo prende chi lo chiede per il proprio eroe; con lo zaino pieno sceglie lui cosa scartare.
7. Prova: voto su chi la affronta o "Lascia perdere"; tira solo quel giocatore.
8. Riposo: voto su chi prega; benedizione scelta da chi ha pregato; "Riparti" diventa "Pronti 1/2".
9. Mercante: ognuno compra per il proprio eroe; contrattazione e rinnovo votati; il medico cura solo il proprio eroe; "Lascia il mercante" con i pronti.
10. Chiudi la finestra di Sara: dopo 20 s il master vede l'avviso, i voti non la aspettano; riaprendo il link Sara rientra senza nome.
11. Il master ricarica la pagina: i giocatori vedono "Il master non è collegato"; il master riapre la stanza e "Riprendi l'ultima" rimette la partita.
12. Con ffmpeg: le immagini grandi e i video dei giocatori arrivano da `/leggero/` (cartella `server/cache-leggera/`); la musica si accende col pulsante 🔇/🔊.
```

- [ ] **Step 3: Verifica e commit**

```bash
node tests/run.js
git add CLAUDE.md docs/superpowers/prova-online.md
git commit -m "Documentazione della partita online e lista di controllo"
```

**Fine della tappa 3.**
