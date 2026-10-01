# CLAUDE.md

Guida per Claude Code (claude.ai/code) su questo repository. Idea ripresa dal branch `campaign-editor` di Valerio e aggiornata all'architettura attuale.

## Progetto

"Slay the Dig": roguelike a turni (mappa alla *Slay the Spire*, toni alla *Darkest Dungeon*) con interfaccia ispirata ai menu di *Warcraft III: Reign of Chaos*. Campagne private della "Famiglia Dignitas". Testi di gioco, commenti e nomi in italiano.

App web statica in JavaScript puro: niente build, niente npm, niente bundler, niente test automatici nel repository. Librerie esterne solo copiate in `js/vendor/` (`qrcode.js`, `gsap.min.js`).

## Avvio e sviluppo

- Si apre `index.html` con doppio click (protocollo `file://`), senza server. Per questo le campagne sono file `.js` caricati con `<script>`: il browser blocca `fetch()` di file locali.
- `editor.html` è l'editor delle campagne, anche lui apribile con doppio click.
- Controllo rapido della sintassi: `node --check js/game.js`, `node --check js/editor.js`, `node --check data/campagne/<id>.js`.

## Architettura

- `index.html`: tutte le schermate (`div#screen*`) sono nel DOM; `showScreen(id)` mostra quella attiva togliendo la classe `.hidden`. I pulsanti chiamano funzioni globali con `onclick="..."`.
- `css/wc3-base.css`: base comune a gioco, editor e telefono (variabili di colori e caratteri, pulsanti in metallo, menu a tendina, scrollbar, componenti `.wc-panel`, `.wc-inset`, `.wc-card`, `.wc-heading`, colori delle parole chiave `.kw-*`). Va caricato prima degli altri fogli di stile; il telefono lo prende da `/css/wc3-base.css`.
- `css/style.css`: tema WC3 del gioco (cornici dorate, catene, cursore a guanto), animazioni, menu.
- `js/wc3fx.js` + `js/vendor/gsap.min.js` (GSAP in locale, niente CDN: deve funzionare con file:// e senza internet): pannelli appesi alle catene che scendono e oscillano come un pendolo, finestre che scendono appese, rimbalzo dei pulsanti al rilascio. Caricato dopo `js/game.js`, avvolge `showScreen` e `openModal`; senza GSAP o con le animazioni spente il gioco resta solo CSS.
- `js/game.js`: motore di gioco, nessun dato di campagna. `js/loot.js` (bottino, tesori, carte coperte) e `js/shop.js` (mercante: merce, rinnovo, contrattazione, vendita) sono caricati subito dopo e condividono lo stesso ambito globale. Legge `const campaignsDatabase = window.CAMPAIGNS || {}`.
- `data/libreria/`: libreria condivisa da tutte le campagne. `armeria.js` (oggetti, più `lootPredefinito`), `bestiario.js` (nemici, con l'immagine dello scontro), `reliquie.js`, `maledizioni.js`, `eroi.js` (statistiche e ritratti; `abilities` = id della libreria Abilità), `abilita.js` (passive e attive, con `icon`); popolano `window.LIBRERIA`, JSON puro.
- `data/campagne/<id>.js`: una campagna per file, JSON puro senza funzioni, che richiama gli elementi della libreria **per id**. L'ordine dei `<script>` in `index.html` è l'ordine nel menu. Vanno inclusi anche in `editor.html`.
- `js/libreria.js`: caricato dopo librerie e campagne e prima di `js/game.js`. `resolveCampaign()` sostituisce i riferimenti con gli elementi completi: `window.CAMPAIGNS` contiene le campagne risolte (stessa forma di sempre, usata da motore, simulatore e tiro da remoto), `window.CAMPAIGNS_RAW` quelle con i riferimenti (usate dall'editor).
- `editor.html` + `js/editor.js` + `css/editor.css` (che si appoggia a `css/wc3-base.css` e `css/style.css`).

### Dati di una campagna

`heroes` (id della libreria Eroi; le abilità arrivano da lì, risolte da `LIBRERIA.abilita`), `initialArmory` e `lootItems` (id dell'armeria; `lootItems: null` = `LIBRERIA.lootPredefinito`), `challenges` (`reward` = id di una reliquia, `punishment` = id di una maledizione, oppure un oggetto scritto nella sfida per premi e punizioni immediati come monete o ferite), `merchants` / `rests` / `treasures` (testi per chiave, `"default"` vale per tutti), `mapNodes` (`id`, `level`, `x`, `type`, `enemy` = id del bestiario (senza `image` il nodo usa quella del nemico), `challengeId` / `restId` / `merchantId` / `treasureId`, `next`, `active`, `image`).

I salvataggi tengono dei nodi solo lo stato (`done`, `active`): il contenuto viene dalla campagna attuale, così un id cambiato nel bestiario non rompe le partite salvate.

Gli eroi possono avere `portrait` e `portraitWounded`: valgono se `HERO_PORTRAITS` in `game.js` non ha già un ritratto per quel nome (`registerCampaignHeroPortraits`).

### Effetti descrittivi

Ricompense, punizioni e abilità passive non contengono funzioni: hanno un campo `effects` interpretato da `applyEffects()` in `game.js`. Tipi: `hero_stat`, `hero_set`, `party_stat`, `party_max_hp`, `party_damage`, `coins`, `add_curse`. Un nuovo tipo va aggiunto sia in `applyEffects()` sia in `KNOWN_EFFECTS` di `js/editor.js`.

### Meccaniche legate a nomi e id

Molte reliquie e maledizioni sono riconosciute dal nome esatto: `hasRelic("...")` e `hasCurse("...")` (le maledizioni sono testi "Nome (descrizione)"). Le abilità attive sono gestite per `id` in `executeCombatHeroRoll` (`icaro_trucchi`, `astarte_affondo`, `ascadeo_segnato`, `zeno_colpo_benedetto`, `dioforo_penna`); un'attiva nuova va aggiunta anche ad `ACTIVE_ABILITY_IDS` in `js/editor.js`. Una meccanica davvero nuova richiede codice nel motore, non solo dati.

### Stato e salvataggi

Stato globale in variabili (`party`, `partyCoins`, `unlockedRelics`, `activeCurses`, `stsMapNodes`, `currentNodeId`, ...). Tre slot di salvataggio in `localStorage` (`dignitas_save_1..3`); la sconfitta cancella lo slot in uso. Il Compendio delle scoperte è in `dignitas_compendium`. Le opzioni in `dignitas_options`.

### Editor

Bozza, cartella del progetto e "Prova nel gioco" passano per IndexedDB (database `dignitas_editor`, store `kv`). "Salva nel progetto" usa la File System Access API (Edge/Chrome) per scrivere `data/campagne/<id>.js`, i file di `data/libreria/` modificati (schede Bestiario, Armeria, Reliquie, Eroi, Abilità, Maledizioni), le immagini caricate e i tag `<script>` di una campagna nuova; altrimenti "Scarica .zip". `index.html?prova=<id>` carica la campagna di prova.

### Convenzioni dell'interfaccia

- Finestre con `openModal` / `closeModal` (`#wc3Modal`), tooltip con `data-tip="Titolo||Descrizione"`. `window.alert` è ridefinito sulla finestra WC3.
- Suoni: `click.ogg` su ogni pulsante; gli altri effetti sono generati con Web Audio in `synthSfx()` (colpi, dadi, passaggio del mouse).
- Tasti rapidi in combattimento Q/W/E/R/T, Spazio per tirare.

### Stile WoW / WC3

- Rarità degli oggetti come in WoW: `scarso` (grigio), `comune` (bianco), `non_comune` (verde), `raro` (blu), `epico` (viola), `leggendario` (arancio). Etichette in `RARITY_LABELS` (`game.js`), prezzi in `ITEM_BASE_PRICE` (`shop.js`), probabilità in `lootRarityWeights` / `merchantRarityWeights`, colori (`--rar`, `--rar-glow`) in `css/wc3-base.css`.
- Texture in `immagini/ui/` (`pietra.svg`, `cuoio.svg`, `pergamena.svg`, generate; `Human-inventory-slotfiller.png` di WC3): si sostituiscono con quelle originali cambiando `--tex-*` in `css/wc3-base.css`.
- Caratteri: `--font-title`, `--font-lore` (pergamene), `--font-numbers` (danni). Se Friz Quadrata, Morpheus o Skurri sono installati, o copiati in `fonts/` come `FrizQuadrata.ttf`, `Morpheus.ttf`, `Skurri.ttf`, si usano gli originali; altrimenti Cinzel, Metamorphous, Skranji.
- Messaggi a schermo: `uiError(testo)` (rosso) e `uiMessage(testo)` (giallo) al posto di `alert` per gli avvisi brevi.
- Cursori in `immagini/cursori/`: guanto (normale, rosso sul nemico, grigio sui disattivati), spada sui comandi d'attacco e sui nodi di scontro.

### Icone

Solo icone classiche di Warcraft III (non Reforged) in `immagini/icone/`, associate in `game.js` da `ITEM_IMAGES_BY_ID` e `ITEM_IMAGES`; le abilità hanno il campo `icon` in `data/libreria/abilita.js` (`abilityIconSrc`). L'archivio completo è in `warcraft3_icons/` (ignorato da git): i file senza `-Reforged` sono quelli classici.

### Telefono (server di Valerio)

`server/server.js` + `server/public/phone.html` + `js/remote.js`: il gioco invia lo stato del party (`/api/state`, con icone, rarità, ritratti e `inCombat`); i telefoni scelgono azioni e tiri nel proprio turno e, fuori dal combattimento, usano le pozioni dello zaino (`/api/item-use` → evento `item-use` → `useConsumable`).
