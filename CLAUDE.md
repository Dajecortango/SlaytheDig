# CLAUDE.md

Guida per Claude Code (claude.ai/code) su questo repository. Idea ripresa dal branch `campaign-editor` di Valerio e aggiornata all'architettura attuale.

## Progetto

"Slay the Dig": roguelike a turni (mappa alla *Slay the Spire*, toni alla *Darkest Dungeon*) con interfaccia ispirata ai menu di *Warcraft III: Reign of Chaos*. Campagne private della "Famiglia Dignitas". Testi di gioco, commenti e nomi in italiano.

App web statica in JavaScript puro: niente build, niente npm, niente bundler, niente test automatici nel repository.

## Avvio e sviluppo

- Si apre `index.html` con doppio click (protocollo `file://`), senza server. Per questo le campagne sono file `.js` caricati con `<script>`: il browser blocca `fetch()` di file locali.
- `editor.html` è l'editor delle campagne, anche lui apribile con doppio click.
- Controllo rapido della sintassi: `node --check js/game.js`, `node --check js/editor.js`, `node --check data/campagne/<id>.js`.

## Architettura

- `index.html`: tutte le schermate (`div#screen*`) sono nel DOM; `showScreen(id)` mostra quella attiva togliendo la classe `.hidden`. I pulsanti chiamano funzioni globali con `onclick="..."`.
- `css/style.css`: tema WC3 (cornici dorate, pulsanti in metallo in rilievo, catene, cursore a guanto), animazioni, menu.
- `js/game.js`: solo motore di gioco, nessun dato di campagna. Legge `const campaignsDatabase = window.CAMPAIGNS || {}`.
- `data/campagne/<id>.js`: una campagna per file. Dopo `window.CAMPAIGNS["<id>"] =` il contenuto è **JSON puro**, senza funzioni. L'ordine dei `<script>` in `index.html` (prima di `js/game.js`) è l'ordine nel menu. Vanno inclusi anche in `editor.html` (prima di `js/editor.js`).
- `editor.html` + `js/editor.js` + `css/editor.css` (che si appoggia a `css/style.css`).

### Dati di una campagna

`heroes`, `abilities` (per nome dell'eroe), `initialArmory`, `lootItems` (`null` = catalogo `DEFAULT_GAME_ITEMS` di `game.js`), `enemies`, `challenges`, `merchants` / `rests` / `treasures` (testi per chiave, `"default"` vale per tutti), `mapNodes` (`id`, `level`, `x`, `type`, riferimento `enemy` / `challengeId` / `restId` / `merchantId` / `treasureId`, `next`, `active`, `image`).

Gli eroi possono avere `portrait` e `portraitWounded`: valgono se `HERO_PORTRAITS` in `game.js` non ha già un ritratto per quel nome (`registerCampaignHeroPortraits`).

### Effetti descrittivi

Ricompense, punizioni e abilità passive non contengono funzioni: hanno un campo `effects` interpretato da `applyEffects()` in `game.js`. Tipi: `hero_stat`, `hero_set`, `party_stat`, `party_max_hp`, `party_damage`, `coins`, `add_curse`. Un nuovo tipo va aggiunto sia in `applyEffects()` sia in `KNOWN_EFFECTS` di `js/editor.js`.

### Meccaniche legate a nomi e id

Molte reliquie e maledizioni sono riconosciute dal nome esatto: `hasRelic("...")` e `hasCurse("...")` (le maledizioni sono testi "Nome (descrizione)"). Le abilità attive sono gestite per `id` in `executeCombatHeroRoll` (`icaro_trucchi`, `astarte_affondo`, `ascadeo_segnato`, `zeno_colpo_benedetto`, `dioforo_penna`). Una meccanica davvero nuova richiede codice nel motore, non solo dati.

### Stato e salvataggi

Stato globale in variabili (`party`, `partyCoins`, `unlockedRelics`, `activeCurses`, `stsMapNodes`, `currentNodeId`, ...). Tre slot di salvataggio in `localStorage` (`dignitas_save_1..3`); la sconfitta cancella lo slot in uso. Il Compendio delle scoperte è in `dignitas_compendium`. Le opzioni in `dignitas_options`.

### Editor

Bozza, cartella del progetto e "Prova nel gioco" passano per IndexedDB (database `dignitas_editor`, store `kv`). "Salva nel progetto" usa la File System Access API (Edge/Chrome) per scrivere `data/campagne/<id>.js`, le immagini caricate e i tag `<script>` di una campagna nuova; altrimenti "Scarica .zip". `index.html?prova=<id>` carica la campagna di prova.

### Convenzioni dell'interfaccia

- Finestre con `openModal` / `closeModal` (`#wc3Modal`), tooltip con `data-tip="Titolo||Descrizione"`. `window.alert` è ridefinito sulla finestra WC3.
- Suoni: `click.ogg` su ogni pulsante; gli altri effetti sono generati con Web Audio in `synthSfx()` (colpi, dadi, passaggio del mouse).
- Tasti rapidi in combattimento Q/W/E/R/T, Spazio per tirare.

### Icone

Solo icone classiche di Warcraft III (non Reforged) in `immagini/icone/`, associate in `game.js` da `ITEM_IMAGES_BY_ID`, `ITEM_IMAGES` e `ABILITY_IMAGES`. L'archivio completo è in `warcraft3_icons/` (ignorato da git): i file senza `-Reforged` sono quelli classici.
