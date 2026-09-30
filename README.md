# Slay the Dig

Roguelike a turni in stile *Slay the Spire* con atmosfere alla *Darkest Dungeon*, dedicato alle campagne della Famiglia Dignitas. Interfaccia ispirata ai menu di *Warcraft III: Reign of Chaos*.

## Come si gioca

Apri `index.html` in un browser moderno. Non serve installare nulla né avviare un server: basta il doppio click sul file.

- Scegli una campagna, componi la compagnia e assegna abilità ed equipaggiamento iniziale.
- Avanza sulla mappa affrontando scontri, sfide, tesori, mercanti e aree di riposo.
- In combattimento usa i tasti rapidi **Q W E R T** per le azioni e **Spazio** per tirare il dado.
- La partita si può salvare e caricare dalla barra in alto (salvataggio nel `localStorage` del browser).

## Struttura

```
index.html           struttura delle schermate (markup)
css/style.css        stile e animazioni dell'interfaccia
editor.html          editor delle campagne (js/editor.js, css/editor.css)
js/game.js           logica di gioco
data/campagne/       dati di ogni campagna (un file per campagna)
immagini/icone/      icone di oggetti, abilità e risorse
immagini/ritratti/   ritratti degli eroi
audio/               musica e effetti sonori
```

Le illustrazioni degli eventi vanno messe nella cartella `immagini/` con i nomi indicati nei dati delle campagne; se un'immagine manca, il gioco mostra un riquadro segnaposto.

## Campagne

Ogni campagna sta in `data/campagne/<id>.js`: eroi, abilità, nemici, sfide, mercanti, riposi e nodi della mappa. Dopo `window.CAMPAIGNS["<id>"] =` il contenuto è JSON puro. È un file `.js` e non `.json` perché il browser blocca il caricamento di file `.json` locali aperti con doppio click.

Per aggiungere una campagna, crea un nuovo file e aggiungi il suo tag `<script>` in `index.html` (prima di `js/game.js`) e in `editor.html` (prima di `js/editor.js`). L'ordine dei tag è l'ordine nel menu.

### Editor delle campagne

Apri `editor.html` con doppio click. Permette di modificare dati generali, mappa (con anteprima dei collegamenti), nemici, sfide e le altre sezioni in JSON. Il pannello **Controlli** segnala collegamenti rotti, nemici o sfide inesistenti, nodi irraggiungibili, effetti sconosciuti e immagini mancanti. Il browser non può scrivere nel progetto: usa **Scarica .js** e sostituisci il file in `data/campagne/`.

Ricompense, punizioni e abilità passive descrivono gli effetti in un campo `effects`, interpretato da `applyEffects()` in `js/game.js`:

- `hero_stat` — aggiunge `val` alla statistica `stat` dell'eroe
- `hero_set` — imposta la statistica `stat` dell'eroe a `val`
- `party_stat` — aggiunge `val` alla statistica `stat` di tutta la compagnia (minimo 0)
- `party_max_hp` — aggiunge `val` agli HP massimi e attuali di tutta la compagnia
- `party_damage` — toglie `val` HP a tutta la compagnia (minimo 1)
- `coins` — aggiunge `val` monete (negativo per toglierle, minimo 0)
- `add_curse` — aggiunge il testo `text` alle maledizioni attive

Esempio: `"effects": [{ "effect": "party_stat", "stat": "fth", "val": 1 }]`.

## Icone personalizzate

Le icone si associano in `js/game.js` tramite tre tabelle:

- `ITEM_IMAGES_BY_ID` — icona per singolo oggetto (per `id`)
- `ITEM_IMAGES` — icona per tipo di oggetto (`sword`, `axe`, `shield`, ...)
- `ABILITY_IMAGES` — icona per abilità (per `id`)

Le icone in `immagini/icone/` provengono da *Warcraft III* © Blizzard Entertainment e sono usate a scopo personale e non commerciale.
