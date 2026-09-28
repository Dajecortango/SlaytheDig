# Slay the Dig

Roguelike a turni in stile *Slay the Spire* con atmosfere alla *Darkest Dungeon*, dedicato alle campagne della Famiglia Dignitas. Interfaccia ispirata ai menu di *Warcraft III: Reign of Chaos*.

## Come si gioca

Apri `gemini-code 1.html` in un browser moderno. Non serve installare nulla: tutto il gioco (HTML, CSS e JavaScript) è in un unico file.

- Scegli una campagna, componi la compagnia e assegna abilità ed equipaggiamento iniziale.
- Avanza sulla mappa affrontando scontri, sfide, tesori, mercanti e aree di riposo.
- In combattimento usa i tasti rapidi **Q W E R T** per le azioni e **Spazio** per tirare il dado.
- La partita si può salvare e caricare dalla barra in alto (salvataggio nel `localStorage` del browser).

## Struttura

```
gemini-code 1.html   gioco completo (logica, dati delle campagne e interfaccia)
immagini/icone/      icone di oggetti, abilità e risorse
```

Le illustrazioni degli eventi vanno messe nella cartella `immagini/` con i nomi indicati nei dati delle campagne; se un'immagine manca, il gioco mostra un riquadro segnaposto.

## Icone personalizzate

Le icone si associano nel file del gioco tramite tre tabelle:

- `ITEM_IMAGES_BY_ID` — icona per singolo oggetto (per `id`)
- `ITEM_IMAGES` — icona per tipo di oggetto (`sword`, `axe`, `shield`, ...)
- `ABILITY_IMAGES` — icona per abilità (per `id`)

Le icone in `immagini/icone/` provengono da *Warcraft III* © Blizzard Entertainment e sono usate a scopo personale e non commerciale.
