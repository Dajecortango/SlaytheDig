# Slay the Dig

Roguelike a turni in stile *Slay the Spire* con atmosfere alla *Darkest Dungeon*, dedicato alle campagne della Famiglia Dignitas. Interfaccia ispirata ai menu di *Warcraft III: Reign of Chaos*.

## Come si gioca

Apri `index.html` in un browser moderno. Non serve installare nulla né avviare un server: basta il doppio click sul file.

- Scegli una campagna, componi la compagnia e assegna abilità ed equipaggiamento iniziale.
- Avanza sulla mappa affrontando scontri, sfide, tesori, mercanti e aree di riposo.
- In combattimento usa i tasti rapidi **Q W E R T** per le azioni e **Spazio** per tirare il dado.
- La partita si può salvare e caricare dalla barra in alto, in 3 slot (salvataggi nel `localStorage` del browser). La sconfitta cancella lo slot della partita persa.
- Il **Compendio** (menu principale) raccoglie nemici, reliquie, maledizioni e oggetti scoperti in tutte le partite.

## Struttura

```
index.html           struttura delle schermate (markup)
css/style.css        stile e animazioni dell'interfaccia
editor.html          editor delle campagne (js/editor.js, css/editor.css)
js/game.js           logica di gioco
data/libreria/       armeria, bestiario, reliquie e maledizioni condivisi da tutte le campagne
data/campagne/       dati di ogni campagna (un file per campagna)
immagini/icone/      icone di oggetti, abilità e risorse
immagini/ritratti/   ritratti degli eroi
audio/               musica e effetti sonori
```

Le illustrazioni degli eventi vanno messe nella cartella `immagini/` con i nomi indicati nei dati delle campagne; se un'immagine manca, il gioco mostra un riquadro segnaposto.

## Campagne

Oggetti, nemici, reliquie e maledizioni stanno nella **libreria condivisa** (`data/libreria/`: `armeria.js`, `bestiario.js`, `reliquie.js`, `maledizioni.js`) e ogni campagna li richiama per id: un nemico o un'arma si definisce una volta sola e si usa in tutte le avventure.

Ogni campagna sta in `data/campagne/<id>.js`: eroi, abilità, sfide, mercanti, riposi, nodi della mappa e gli id degli elementi della libreria che usa. Dopo `window.CAMPAIGNS["<id>"] =` il contenuto è JSON puro. È un file `.js` e non `.json` perché il browser blocca il caricamento di file `.json` locali aperti con doppio click.

Per aggiungere una campagna, crea un nuovo file e aggiungi il suo tag `<script>` in `index.html` (prima di `js/game.js`) e in `editor.html` (prima di `js/editor.js`). L'ordine dei tag è l'ordine nel menu.

### Editor delle campagne

Apri `editor.html` con doppio click, oppure "Editor Campagne" dal menu del gioco. Schede della campagna: dati generali, mappa (anteprima con i nodi trascinabili: si spostano col mouse e Shift + trascina crea o toglie un collegamento; il nemico di ogni nodo si sceglie dal bestiario), eroi (con ritratti e abilità), oggetti (armeria iniziale e bottino scelti dall'armeria), sfide (ricompensa e punizione scelte fra reliquie e maledizioni) e testi. Schede della libreria: Bestiario, Armeria, Reliquie, Maledizioni, con l'elenco delle campagne che usano ogni elemento; un id usato da un'altra campagna non si può rinominare né eliminare. Il pannello **Controlli** segnala collegamenti rotti, nemici o sfide inesistenti, nodi irraggiungibili, effetti sconosciuti e immagini mancanti.

- **Salva nel progetto** (Edge/Chrome) scrive `data/campagne/<id>.js`, i file della libreria modificati e le immagini caricate direttamente nella cartella del gioco, scelta la prima volta; una campagna nuova viene aggiunta da sola a `index.html` ed `editor.html`. Negli altri browser usa **Scarica .zip** ed estrailo nella cartella del gioco.
- **Prova nel gioco** apre il gioco con la campagna così com'è, anche senza averla salvata.
- Le modifiche non salvate restano in una bozza nel browser e vengono proposte alla riapertura.

Salvataggio diretto, caricamento immagini, bozze e prova nel gioco riprendono le idee del branch `campaign-editor` di Valerio.

## Icone personalizzate

Le icone si associano in `js/game.js` tramite tre tabelle:

- `ITEM_IMAGES_BY_ID` — icona per singolo oggetto (per `id`)
- `ITEM_IMAGES` — icona per tipo di oggetto (`sword`, `axe`, `shield`, ...)
- `ABILITY_IMAGES` — icona per abilità (per `id`)

Le icone in `immagini/icone/` provengono da *Warcraft III* © Blizzard Entertainment e sono usate a scopo personale e non commerciale.
