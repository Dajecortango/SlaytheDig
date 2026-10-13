# Editor facile: progetto

Data: 2026-10-13. Stato: approvato in chat, da pianificare.

## Scopo

L'editor (`editor.html`, `js/editor/`) deve poter essere usato da parenti **non tecnici** per fare da soli tutto:
scrivere una campagna, ritoccare il bilanciamento, creare nemici e oggetti, e anche le cose avanzate (elite, effetti
speciali, abilità attive). Il lavoro arriva al gioco vero come file mandato al proprietario del progetto.

Riuscito vuol dire: chi apre l'editor la prima volta sa da dove cominciare, non vede termini da programmatore finché
non li chiede, non può rompere per sbaglio la libreria condivisa o perdere lavoro, e sa sempre cosa manca.

## Fuori da questo lavoro

- "Manda il lavoro" / "Importa il lavoro" (pacchetto per il proprietario con anteprima delle differenze): fase 5, rimandata.
- Nessun cambio al formato dei file di dati, agli id, al motore di gioco.

## Vincoli

- JavaScript puro, niente build, apribile da `file://`; tutto in italiano, parole semplici.
- Pulsanti con `data-action` di `js/azioni.js`, mai `onclick`; finestre con lo stile WC3 dell'editor.
- Ogni campo nuovo dei moduli resta descritto in `js/schema.js` (`tests/schema.test.js`).
- Le etichette cambiano, i nomi interni no: `bestiario`, `armeria`, `LIB_KINDS`, i file in `data/` restano gli stessi.
- Si rilascia una fase per volta; ognuna deve funzionare da sola.

## Fase 1: ingresso e orientamento

**Home** (prima schermata, `currentTab = 'home'`):
- "Crea una nuova campagna": nome, poi "parti da zero" o "copia una campagna esistente" (copia con id e titolo nuovi).
- "Modifica una campagna": elenco delle campagne con copertina e titolo.
- "Nemici, oggetti e altro": apre la libreria.
- "Riprendi da dove eri rimasto" se c'è una bozza (sostituisce la domanda `confirm` di `offerDraftRestore`).
- Il menu in alto "Apri / Nuova / Apri file…" va nella Home; in alto restano il nome della campagna aperta e un pulsante "Home".

**Schede in due gruppi**, una riga ciascuno:
- La campagna: Generale · Mappa · Eroi della campagna · Oggetti iniziali · Prove · Testi.
- Libreria condivisa: Nemici · Oggetti · Reliquie · Maledizioni · Schede degli eroi · Abilità · Benedizioni;
  con Avanzate accese anche Elite e Azioni elite.
- Il doppione "Eroi" sparisce (campagna: "Eroi della campagna"; libreria: "Schede degli eroi").

**Interruttore Avanzate** (in alto, ricordato in `localStorage`, spento di default). Spento nasconde: id e "Rinomina id",
stella dei preferiti, campi JSON, effetti speciali, fasi ed elite, campi tecnici delle abilità attive, "Salva nel
progetto", "Scarica .zip", "Cambia la cartella del progetto".
- Regola unica: un campo dei moduli con `avanzato: true` non viene disegnato da `renderForm` a interruttore spento.
- Test: nessun campo obbligatorio (secondo `DATI_SCHEMA`) è avanzato, così un errore non punta mai a un campo invisibile.

**Pulsante unico "Salva"** (Avanzate spente): fa quello che fa "Salva nel progetto"; se il browser non ha la File System
Access API scarica lo .zip e dice in una frase cosa farne. Con Avanzate accese restano i tre pulsanti di oggi.

**Guida al primo avvio**: 5 fumetti in sequenza (Home, schede, Avanzate, Da sistemare, Salva), "Avanti" / "Salta",
ricordata in `localStorage`, riapribile dal pulsante "?".

## Fase 2: moduli intelligenti

- **Gruppi**: ogni elenco `*_FIELDS` riceve un campo `gruppo` per ogni voce; `renderForm` disegna un blocco con titolo
  per gruppo. Oggetto: Aspetto · Tipo e prezzo · Effetto · Altri bonus (chiuso) · Avanzate. Nemico: Aspetto · Forza in
  battaglia · Suoni e video · Avanzate. Stesso schema per sfide, reliquie, maledizioni, abilità, eroi, nodi.
- **Campi del tipo**: `showIf` dove serve (consumabili senza Forza/Danno/Armatura; armi senza cura). Il gruppo "Altri
  bonus" (Fede, Intelligenza, Preghiera, Aiuto, Bonus difesa) è chiuso finché è vuoto.
- **Spiegazioni**: un "?" accanto all'etichetta con una frase e un esempio (fumetto `data-tip`); i `help` lunghi di oggi
  diventano il fumetto. Il testo d'aiuto calcolato (es. prezzo) resta sotto il campo.
- **Avvisi sui numeri**: riga gialla sotto il campo se il valore è fuori dal margine di quanto c'è nella libreria
  (minimo e massimo per ruolo del nemico: normale / elite / boss, e per rarità degli oggetti), calcolato al momento,
  non scritto a mano. Non blocca il salvataggio.
- **Scelte al posto della scrittura**: dove si sceglie un elemento della libreria (nemico del nodo, reliquia e
  maledizione della sfida, oggetti iniziali, bottino) un menu con nome e icona e una casella di ricerca, più "Crea
  nuovo…" che apre la creazione guidata e torna con l'elemento già scelto.
- **Anteprima fissa**: l'anteprima del tooltip (`PREVIEWS`) diventa un riquadro "Come appare nel gioco" che resta visibile
  scorrendo; si aggiunge l'anteprima dei nemici.

## Fase 3: mappa guidata

- **Menu del nodo** al clic (accanto al nodo): "Aggiungi un nodo dopo questo" (livello sopra, già collegato), "Collega
  a…" (i nodi possibili si illuminano, un clic collega, Esc annulla), "Scollega da…", "Cambia tipo" (icone dei tipi con
  colore e nome), "Modifica" (porta al modulo), "Elimina" (conferma con i collegamenti persi). Shift + trascina e lo
  spostamento col trascinamento restano.
- **Segni sui nodi**: "!" rosso se manca qualcosa di obbligatorio (nemico, sfida, trama, uscita), punto giallo se manca
  solo l'immagine; il fumetto dice cosa. Sopra la mappa "N nodi da sistemare", clic sul primo.
- **Modulo del nodo**: tipo e contenuto in cima; id, livello, posizione e collegamenti come numeri sono avanzati;
  "Porta a:" elenca i nodi successivi per nome con una × per toglierli.
- **Mappa nuova**: una campagna nuova parte con 3 nodi collegati (partenza, scontro, boss finale).
- **Controlli sulla mappa**: nodi irraggiungibili dalla partenza e nodi senza uscita (tranne il finale) evidenziati.

## Fase 4: rete di sicurezza

- **Annulla / Ripeti**: Ctrl+Z / Ctrl+Y fuori dalle caselle di testo, pulsanti ↶ ↷ con la descrizione del passo.
  A ogni `markDirty` / `markLibDirty` si salva una fotografia JSON di campagna e della libreria toccata; i cambiamenti
  dello stesso campo entro 1 secondo sono un passo solo; al massimo 50 passi.
- **Eliminare**: finestra WC3 al posto di `confirm`, con l'elenco di dove l'elemento è usato (campagne e nodi). Se è
  usato altrove il pulsante principale è "Annulla" e "Elimina comunque" è rosso. Dopo: messaggio con "Annulla" per 10
  secondi.
- **Libreria condivisa**: al primo cambiamento di un elemento usato anche in altre campagne, banner sopra il modulo con
  le campagne che lo usano e due scelte: "Cambialo ovunque" o "Fanne una copia solo per questa campagna" (id nuovo con
  `uniqueKey`, i riferimenti di questa campagna passano alla copia). Una volta per elemento per sessione.
- **Da sistemare**: la colonna dei Controlli diventa due gruppi, Errori e Consigli, con frasi semplici; un clic apre
  scheda, elemento e campo, che lampeggia. Il testo fisso sul salvataggio va nel "?" del pulsante Salva.
- **Non salvato**: segno "● non salvato" accanto al nome della campagna.

## Prove

- Test Node (`tests/`): campi avanzati e obbligatori, gruppi presenti in ogni modulo, margini degli avvisi, operazioni
  della mappa (aggiungi dopo, collega, scollega, raggiungibilità), annulla/ripeti, copia di un elemento della libreria
  con i riferimenti spostati, collegamento dei Controlli al campo.
- Verifica nel browser (Edge headless) di ogni fase: schermate, nessun errore JS.
- `CLAUDE.md`, sezione Editor, aggiornato a ogni fase.
