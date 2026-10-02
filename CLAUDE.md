# CLAUDE.md

Guida per Claude Code (claude.ai/code) su questo repository. Idea ripresa dal branch `campaign-editor` di Valerio e aggiornata all'architettura attuale.

## Progetto

"Slay the Dig": roguelike a turni (mappa alla *Slay the Spire*, toni alla *Darkest Dungeon*) con interfaccia ispirata ai menu di *Warcraft III: Reign of Chaos*. Campagne private della "Famiglia Dignitas". Testi di gioco, commenti e nomi in italiano.

App web statica in JavaScript puro: niente build, niente npm, niente bundler, niente test automatici nel repository. Librerie esterne solo copiate in `js/vendor/` (`qrcode.js`, `gsap.min.js`).

## Avvio e sviluppo

- Si apre `index.html` con doppio click (protocollo `file://`), senza server. Per questo le campagne sono file `.js` caricati con `<script>`: il browser blocca `fetch()` di file locali.
- `editor.html` è l'editor delle campagne, anche lui apribile con doppio click.
- Controllo rapido della sintassi: `node --check js/<file>.js` (tutti i file di `js/`), `node --check data/campagne/<id>.js`.

## Architettura

- `index.html`: tutte le schermate (`div#screen*`) sono nel DOM; `showScreen(id)` mostra quella attiva togliendo la classe `.hidden`. I pulsanti chiamano funzioni globali con `onclick="..."`.
- `css/wc3-base.css`: base comune a gioco, editor e telefono (variabili di colori e caratteri, pulsanti in metallo, menu a tendina, scrollbar, componenti `.wc-panel`, `.wc-inset`, `.wc-card`, `.wc-heading`, colori delle parole chiave `.kw-*`). Va caricato prima degli altri fogli di stile; il telefono lo prende da `/css/wc3-base.css`.
- `css/style.css`: tema WC3 del gioco (cornici dorate, catene, cursore a guanto), animazioni, menu.
- `js/wc3fx.js` + `js/vendor/gsap.min.js` (GSAP in locale, niente CDN: deve funzionare con file:// e senza internet): pannelli appesi alle catene che scendono e oscillano come un pendolo, finestre che scendono appese, rimbalzo dei pulsanti al rilascio. Caricato dopo `js/game.js`, avvolge `showScreen` e `openModal`; senza GSAP o con le animazioni spente il gioco resta solo CSS.
- `js/game.js`: motore di gioco (stato globale, campagne, creazione del party, oggetti, sfide, riposo, interfaccia), nessun dato di campagna. Legge `const campaignsDatabase = window.CAMPAIGNS || {}`. Dopo di lui, nello stesso ambito globale e in quest'ordine: `js/salvataggi.js` (slot di salvataggio), `js/audio.js` (musica ed effetti), `js/mappa.js` (mappa, nodi, `advanceNode`), `js/combattimento.js` (motore puro di risoluzione usato anche da `js/simulator.js`, turni), `js/ritratti.js` (ritratti e cinematica d'attacco), `js/loot.js` (bottino, tesori, carte coperte), `js/shop.js` (mercante), `js/avvio.js` (ultimo: `applyOptions()` e prima `updatePartyStatusBars()`). Il codice eseguito al caricamento di un file non deve chiamare funzioni dei file successivi: le chiamate tra file avvengono dopo, al clic o a `DOMContentLoaded`.
- `data/libreria/`: libreria condivisa da tutte le campagne. `armeria.js` (oggetti, più `lootPredefinito`), `bestiario.js` (nemici, con l'immagine dello scontro), `reliquie.js`, `maledizioni.js`, `eroi.js` (statistiche e ritratti; `abilities` = id della libreria Abilità), `abilita.js` (passive e attive, con `icon`); popolano `window.LIBRERIA`, JSON puro.
- `data/campagne/<id>.js`: una campagna per file, JSON puro senza funzioni, che richiama gli elementi della libreria **per id**. L'ordine dei `<script>` in `index.html` è l'ordine nel menu. Vanno inclusi anche in `editor.html`.
- `js/comune.js`: caricato subito dopo `js/libreria.js` sia da `index.html` sia da `editor.html`: `esc`, `RARITY_LABELS` / `RARITY_COLORS`, `STAT_LABELS`, `EFFECT_TYPES` (tipi di effetto di `applyEffects`), `HERO_PORTRAIT_DEFAULTS`, `WOUNDED_HP`, `strikeZoomFor`. Ciò che serve a entrambe le pagine va qui, non copiato.
- `js/libreria.js`: caricato dopo librerie e campagne e prima di `js/game.js`. `resolveCampaign()` sostituisce i riferimenti con gli elementi completi: `window.CAMPAIGNS` contiene le campagne risolte (stessa forma di sempre, usata da motore, simulatore e tiro da remoto), `window.CAMPAIGNS_RAW` quelle con i riferimenti (usate dall'editor).
- `editor.html` + `js/editor.js` + `css/editor.css` (che si appoggia a `css/wc3-base.css` e `css/style.css`).

### Dati di una campagna

`heroes` (id della libreria Eroi; le abilità arrivano da lì, risolte da `LIBRERIA.abilita`), `initialArmory` e `lootItems` (id dell'armeria; `lootItems: null` = `LIBRERIA.lootPredefinito`), `challenges` (`reward` = id di una reliquia, `punishment` = id di una maledizione, oppure un oggetto scritto nella sfida per premi e punizioni immediati come monete o ferite), `merchants` / `rests` / `treasures` (testi per chiave, `"default"` vale per tutti), `mapNodes` (`id`, `level`, `x`, `type`, `enemy` = id del bestiario (senza `image` il nodo usa quella del nemico), `challengeId` / `restId` / `merchantId` / `treasureId`, `next`, `active`, `image`).

I salvataggi tengono dei nodi solo lo stato (`done`, `active`): il contenuto viene dalla campagna attuale, così un id cambiato nel bestiario non rompe le partite salvate.

Ritratti degli eroi nei dati (`data/libreria/eroi.js`): `portrait`, `portraitWounded` (mostrato con 2 HP o meno, `isHeroWounded`), `portraitPos` (punto da tenere al centro) e `portraitZoom` per l'icona, `portraitWoundedPos` / `portraitWoundedZoom` se il ritratto da ferito va inquadrato diversamente, `portraitStrikeZoom` facoltativo per la cinematica d'attacco (altrimenti `strikeZoomFor`). `js/ritratti.js` costruisce `HERO_PORTRAITS` (per nome) dalla libreria e dagli eroi della campagna (`registerCampaignHeroPortraits`). Nell'editor (scheda Eroi) l'inquadratura si regola trascinando l'anteprima.

### Effetti descrittivi

Ricompense, punizioni e abilità passive non contengono funzioni: hanno un campo `effects` interpretato da `applyEffects()` in `game.js`. Tipi: `hero_stat`, `hero_set`, `party_stat`, `party_max_hp`, `party_damage`, `coins`, `add_curse`. Un nuovo tipo va aggiunto sia in `applyEffects()` sia in `EFFECT_TYPES` di `js/comune.js`.

### Regole dei tiri

Tutti i tiri degli eroi (combattimento, abilità, sfide, capitano, contrattazione) passano da `naturalRollSuccess(dado, totale, soglia)` in `js/combattimento.js`: un 6 sul dado (quello tenuto, con due dadi) riesce sempre, un 1 fallisce sempre; `naturalRollNote` dà il testo per il diario. Le anteprime (`rollChance`, `chanceText`) ne tengono conto (minimo 17%, massimo 83%). Zaino: `BACKPACK_SIZE = 3` in `game.js`; chi riceve un oggetto con lo zaino pieno sceglie subito cosa scartare (`fillHeroSelectForItem`, `chosenDiscardIdx`). Il mercante alza i prezzi con l'avanzamento nella mappa (`MERCHANT_PROGRESS_MARKUP` in `js/shop.js`, +40% all'ultimo livello).

### Meccaniche legate a nomi e id

Molte reliquie e maledizioni sono riconosciute dal nome esatto: `hasRelic("...")` e `hasCurse("...")` (le maledizioni sono testi "Nome (descrizione)"). Le abilità attive (`isCombatActive`) agiscono con il campo `combat` della libreria Abilità, interpretato da `resolveAbility` in `js/combattimento.js`: `dice` (1, o 2 tenendo il migliore), `attackStat` / `damageStat` (statistica aggiunta al tiro o al danno), `damageMult`, `stun`, `critical`, testi `useText` / `hitLabel` / `hitText` con `{eroe}` e `{danni}`. Si creano dall'editor senza codice; un salvataggio senza `combat` lo prende dalla libreria (`abilityCombat`). Una meccanica davvero nuova richiede codice nel motore (e un campo in `ABILITY_FIELDS` di `js/editor.js`), non solo dati.

### Stato e salvataggi

Lo stato della partita è un solo oggetto `stato` in `js/game.js`: `currentCampaign`, `stsMapNodes`, `currentNodeId`, `party`, `partyCoins`, `unlockedRelics`, `activeCurses`, `expeditionStats`, `challengeState`, `activeEnemy`, `helpBonus`, `combatRound` (si scrive `stato.party`, non `party`). Restano variabili a parte i dati derivati dalla campagna (`enemies`, `gameItems`, `campaignHeroes`...) e quelli dell'interfaccia. Tre slot di salvataggio in `localStorage` (`dignitas_save_1..3`); la sconfitta cancella lo slot in uso. I salvataggi hanno `version` (oggi `SAVE_VERSION = 2` in `js/salvataggi.js`) e i campi dello stato sotto `stato`; `readSave()` passa ogni salvataggio da `migrateSave()`. Per cambiare il formato si alza `SAVE_VERSION` e si aggiunge il passo in `SAVE_MIGRATIONS`. Dalle finestre Salva/Carica un salvataggio si esporta in un file `.json` e si importa in uno slot. Il Compendio delle scoperte è in `dignitas_compendium`. Le opzioni in `dignitas_options`.

### Editor

Bozza, cartella del progetto e "Prova nel gioco" passano per IndexedDB (database `dignitas_editor`, store `kv`). "Salva nel progetto" usa la File System Access API (Edge/Chrome) per scrivere `data/campagne/<id>.js`, i file di `data/libreria/` modificati (schede Bestiario, Armeria, Reliquie, Eroi, Abilità, Maledizioni), le immagini caricate e i tag `<script>` di una campagna nuova; altrimenti "Scarica .zip". `index.html?prova=<id>` carica la campagna di prova.

### Convenzioni dell'interfaccia

- Finestre con `openModal` / `closeModal` (`#wc3Modal`), tooltip con `data-tip="Titolo||Descrizione"`. `window.alert` è ridefinito sulla finestra WC3.
- Suoni: `click.ogg` su ogni pulsante; gli altri effetti sono generati con Web Audio in `synthSfx()` (colpi, dadi, passaggio del mouse). I nemici possono avere suoni propri (`sfxAttack`, `sfxHit`, `sfxDeath` in `audio/nemici/`, portati allo stesso volume medio, circa -18 dB).
- Musica (`js/audio.js`): temi in `audio/temi/` (Ogg Opus 96 kbps, normalizzati a -15 LUFS): menu, tre temi degli scontri normali a rotazione (`expeditionStats.combatThemes`), tema elite. Due lettori (`#musicA`, `#musicB`) si passano il brano con una dissolvenza incrociata (`setMusic`): al cambio di brano e quando il brano ricomincia da capo.
- Tasti rapidi in combattimento Q/W/E/R/T, Spazio per tirare, Esc per tornare indietro prima del tiro (pulsanti "Indietro" e "Cambia eroe").

### Stile WoW / WC3

- Rarità degli oggetti come in WoW: `scarso` (grigio), `comune` (bianco), `non_comune` (verde), `raro` (blu), `epico` (viola), `leggendario` (arancio). Etichette in `RARITY_LABELS` (`js/comune.js`), prezzi in `ITEM_BASE_PRICE` (`shop.js`), probabilità in `lootRarityWeights` / `merchantRarityWeights`, colori (`--rar`, `--rar-glow`) in `css/wc3-base.css`.
- Texture in `immagini/ui/` (`pietra.svg`, `cuoio.svg`, `pergamena.svg`, generate; `Human-inventory-slotfiller.png` di WC3): si sostituiscono con quelle originali cambiando `--tex-*` in `css/wc3-base.css`.
- Caratteri: `--font-title`, `--font-lore` (pergamene), `--font-numbers` (danni). Se Friz Quadrata, Morpheus o Skurri sono installati, o copiati in `fonts/` come `FrizQuadrata.ttf`, `Morpheus.ttf`, `Skurri.ttf`, si usano gli originali; altrimenti Cinzel, Metamorphous, Skranji.
- Messaggi a schermo: `uiError(testo)` (rosso) e `uiMessage(testo)` (giallo) al posto di `alert` per gli avvisi brevi.
- Cursori in `immagini/cursori/`: guanto (normale, rosso sul nemico, grigio sui disattivati), spada sui comandi d'attacco e sui nodi di scontro.

### Icone

Solo icone classiche di Warcraft III (non Reforged) in `immagini/icone/`, associate in `game.js` da `ITEM_IMAGES_BY_ID` e `ITEM_IMAGES`; le abilità hanno il campo `icon` in `data/libreria/abilita.js` (`abilityIconSrc`). L'archivio completo è in `warcraft3_icons/` (ignorato da git): i file senza `-Reforged` sono quelli classici.

### Telefono (server di Valerio)

`server/server.js` + `server/public/phone.html` + `js/remote.js`: il gioco invia lo stato del party (`/api/state`, con icone, rarità, ritratti e `inCombat`); i telefoni scelgono azioni e tiri nel proprio turno e, fuori dal combattimento, usano le pozioni dello zaino (`/api/item-use` → evento `item-use` → `useConsumable`).
