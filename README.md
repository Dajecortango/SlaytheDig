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
index.html                     struttura delle schermate (markup)
css/style.css                  stile e animazioni dell'interfaccia
js/game.js                     motore di gioco (nessun dato di campagna hardcoded)
campagne/<id>/campaign.js      dati e meccaniche della campagna, caricati da index.html
campagne/<id>/campaign.json    stessa campagna in JSON puro, per lettura/editing
campagne/<id>/assets/          illustrazioni esclusive di quella campagna
immagini/icone/                icone di oggetti, abilità e risorse (condivise fra le campagne)
audio/                         musica e effetti sonori
```

`js/game.js` è solo il motore: legge le campagne da `window.CAMPAIGNS`, popolato dagli script in `campagne/<id>/campaign.js` (inclusi in `index.html` prima di `js/game.js`). Ogni campagna vive nella propria cartella: `campaign.json` contiene i dati puri (eroi, nemici, sfide, mercanti, mappa...), mentre `campaign.js` è lo stesso contenuto più le eventuali funzioni (es. effetti di reliquie/maledizioni) — è quello che il gioco carica davvero, perché un browser aperto a doppio click non può leggere `.json` esterni (serve `campaign.js`, un semplice `<script>`).

Per aggiungere una campagna: crea `campagne/<nuovo_id>/campaign.js` seguendo lo schema di uno di quelli esistenti, aggiungi `campagne/<nuovo_id>/assets/` con le immagini, e includi `<script src="campagne/<nuovo_id>/campaign.js"></script>` in `index.html` prima di `js/game.js`. Le illustrazioni mancanti mostrano un riquadro segnaposto invece di rompere il gioco.

## Icone personalizzate

Le icone si associano in `js/game.js` tramite tre tabelle (condivise da tutte le campagne):

- `ITEM_IMAGES_BY_ID` — icona per singolo oggetto (per `id`)
- `ITEM_IMAGES` — icona per tipo di oggetto (`sword`, `axe`, `shield`, ...)
- `ABILITY_IMAGES` — icona per abilità (per `id`)

Le icone in `immagini/icone/` provengono da *Warcraft III* © Blizzard Entertainment e sono usate a scopo personale e non commerciale.
