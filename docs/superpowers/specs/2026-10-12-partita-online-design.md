# Partita online — specifica

Data: 2026-10-12. Stato: approvata a voce sezione per sezione, da rileggere prima del piano.

## 1. Obiettivo

Giocare a Slay the Dig a distanza, ognuno a casa sua (in chiamata su Discord). Ogni giocatore vede la schermata completa del gioco sul proprio PC o telefono e comanda **un solo eroe**. Le decisioni comuni (strada, prove, chi prega, bersaglio del nemico, mercante) si prendono **a maggioranza con un timer**.

Criteri di riuscita:
- tre giocatori su tre case diverse completano un capitolo insieme senza ricaricare la pagina;
- ogni giocatore può agire solo con il proprio eroe e votare le scelte comuni;
- una disconnessione di un giocatore non ferma la partita, e al ritorno riprende il suo eroe;
- la banda usata da ngrok resta nel piano gratuito (1 GB al mese) per alcune serate al mese.

Fuori obiettivo (per ora): server in rete sempre acceso, chat nel gioco (c'è Discord), eroi guidati dal computer, spettatori.

## 2. Ruoli

- **Master** (l'host): avvia il server sul suo PC e gioca nel suo browser su `localhost`. **Non ha un eroe.** Sceglie la campagna, gestisce menu, Opzioni e salvataggi, preme "Inizia", può **cliccare tutto** (sblocca, corregge, forza un voto) e comanda gli eroi dei giocatori disconnessi.
- **Giocatori**: si collegano con un link. Uno per eroe. La compagnia ha tanti eroi quanti giocatori collegati (master escluso), fino al massimo della campagna (5).
- **Capo della spedizione**: un giocatore diverso a ogni livello della mappa, a rotazione nell'ordine d'ingresso, segnato con una corona. Decide i pareggi e i voti senza voti.

Il gioco in solitaria e la pagina del telefono per la stessa stanza (`/g/<eroe>`) restano come sono.

## 3. Architettura

Approccio scelto: **specchio della schermata del master**. La partita vera gira solo nel browser del master (motore attuale, quasi intatto). Il server inoltra ai giocatori le parti della pagina che cambiano; i clic dei giocatori tornano al master, che li esegue dopo aver controllato i permessi. Una sola fonte di verità: le partite non possono separarsi.

Componenti:

| Unità | Dove | Cosa fa |
|---|---|---|
| `js/online.js` | gioco del master (caricato da `index.html`, attivo solo in partita online) | stanza, tabella eroe → giocatore, permessi, voti, "Ho finito", capo, invio delle parti cambiate, esecuzione dei clic ricevuti |
| `js/online-regole.js` | gioco e test | funzioni pure: `onlineCanRun`, `resolveVote`, `nextCaptain`, `changedRegions` (nessun DOM) |
| `server/server.js` | PC del master | stanze, giocatori e token, inoltro di parti e clic, stream compresso, media leggeri |
| `server/public/online.html` + `server/public/online.js` | browser dei giocatori | ingresso col nome, inserimento delle parti, tooltip, barra del voto, "tocca a te", musica a scelta, inoltro dei clic |
| numeri in `js/regole.js` | | `VOTE_SECONDS` = 30, `VOTE_SECONDS_TARGET` = 15, `ONLINE_DISCONNECT_SECONDS` = 20, `ONLINE_FRAME_MS` = 100 |

## 4. Stanza e creazione degli eroi

- Dalle Opzioni il master accende **Partita online**: il server crea una stanza con un codice casuale e il gioco mostra il link pubblico (ngrok) `https://<tunnel>/online/<codice>` da incollare su Discord.
- Il giocatore apre il link, scrive il nome, riceve un **token** (salvato nel suo browser) e vede la schermata del master.
- Nella schermata della compagnia tutti vedono l'elenco dei giocatori (nome, collegato o no). Il master sceglie la campagna e preme **Inizia**; in partita online il menu "numero di eroi" si salta: la compagnia è grande quanto i giocatori.
- La creazione resta un eroe alla volta, **a turno nell'ordine d'ingresso**: in alto "Sta scegliendo: Marco"; solo Marco (o il master) può cliccare carta dell'eroe, abilità o rune, oggetto iniziale e "Prosegui". L'eroe scelto diventa suo.
- La tabella **eroe → giocatore** (per nome) si salva con la partita (campo `onlineOwners` dentro `stato`, versione dei salvataggi alzata con una migrazione). Ricaricando, ogni giocatore che rientra con lo stesso nome riprende il suo eroe.

## 5. Permessi

Ogni clic arriva al master come `{ giocatore, azione, argomenti, valori }`. Il master lo esegue solo se `onlineCanRun(azione, argomenti, giocatore, contesto)` è vero; altrimenti il giocatore vede "Non è il tuo turno". Il contesto contiene schermata attiva, eroe attivo, proprietari, voto aperto, chi ha pregato.

| Schermata | Chi agisce |
|---|---|
| Scontro | il giocatore sceglie il proprio eroe (il menu "eroe che agisce" accetta solo il suo), poi azione, bersaglio, oggetto, tiro; "Indietro" e "Cambia eroe" solo lui. Bersaglio del nemico scelto dalla compagnia: voto. |
| Prova | voto su chi la tenta (o "Lascia perdere"); tira solo il giocatore di quell'eroe |
| Riposo | voto su **chi prega** (una sola preghiera per riposo); chi ha pregato sceglie benedizione e destinatario; ognuno scambia le proprie rune e usa le proprie pozioni |
| Mercante | ognuno compra con gli Scudi comuni per il **proprio** eroe e vende dal **proprio** zaino; medico solo per sé; contrattazione e "Rinnova la merce": voto |
| Bottino e tesori | chi lo vuole lo prende per il proprio eroe (il primo che lo chiede); con lo zaino pieno sceglie lui cosa scartare |
| Mappa | voto del nodo; salvare e caricare: solo master |
| Trame, introduzioni, finali, "Prosegui" | chiunque |
| Menu, Opzioni, Compendio, simulatore, editor | solo master |

Regola di sicurezza: **le azioni non elencate nella tabella dei permessi sono solo del master**. Le finestre locali (tooltip, scorrimento) non passano dal master.

## 6. Voti, timer e "Ho finito"

- Un voto lo apre e lo chiude il gioco del master; il server inoltra. Struttura: `{ id, domanda, opzioni, voti: { giocatore: opzione }, scadenza, capo }`.
- Tutti vedono in alto la barra del voto: domanda, opzioni, chi ha votato, tempo rimasto. **Si vota cliccando la cosa stessa** (il nodo della mappa mostra i ritratti di chi l'ha scelto; nelle altre scelte i pulsanti diventano opzioni). Il voto si può cambiare finché è aperto.
- Chiusura: quando hanno votato tutti i giocatori collegati, o allo scadere di `VOTE_SECONDS` (30 s; 15 s per il bersaglio del nemico).
- Esito (`resolveVote`): maggioranza dei voti dati; pareggio → il capo; nessun voto → il capo; i disconnessi non contano. Il master può **forzare** un esito.

| Voto | Opzioni |
|---|---|
| Mappa | nodi aperti |
| Prova | eroi in piedi + "Lascia perdere" (non nella prova finale) |
| Chi prega al riposo | eroi in piedi + "Nessuno" |
| Bersaglio del nemico | eroi in piedi |
| Contrattare | "No" / "Sì, con X" |
| Rinnovare la merce | sì / no |

**"Ho finito"**: al riposo e dal mercante "Riparti" / "Lascia il mercante" diventano un "Ho finito" per giocatore; si parte quando l'hanno premuto tutti i collegati o quando lo decide il master. Nelle altre schermate "Prosegui" lo preme chiunque.

## 7. Specchio della schermata e clic

**Parti inviate** (regioni con id stabile): barra in alto, barre degli eroi, schermata attiva (`div#screen*` visibile), finestra `#wc3Modal` se aperta, barra del voto. Il master osserva la pagina (`MutationObserver`), al massimo ogni `ONLINE_FRAME_MS` confronta l'HTML di ogni regione con l'ultimo inviato (`changedRegions`) e manda solo quelle cambiate; se non cambia niente non manda niente. Vanno inclusi anche i valori correnti dei menu a tendina (proprietà, non attributi).

**Percorso**: master → `POST /api/online/parti` (in locale) → server → stream dei giocatori `GET /api/online/flusso/<codice>?token=` (SSE **compresso gzip** con flush, `ping` ogni 15 s come lo stream attuale). Al rientro il server manda subito tutte le regioni correnti.

**Pagina del giocatore**: carica gli stessi CSS e font del gioco, inserisce le regioni ricevute, mostra i tooltip `data-tip`, la barra del voto, l'avviso "Tocca a te" quando il suo eroe deve agire, l'avviso "Il master non è collegato". Le animazioni CSS ripartono quando arrivano elementi nuovi; quelle GSAP no (il giocatore vede lo stato finale).

**Clic**: la pagina del giocatore intercetta `data-action` / `data-change` / `data-input` / `data-enter` (stessi attributi di `js/azioni.js`), legge i valori dei menu della regione e invia `POST /api/online/clic { token, azione, argomenti, valori }`. Il server lo inoltra al master (evento `online-clic` sullo stream locale). Il master imposta i valori dei menu, controlla il permesso ed esegue con lo stesso meccanismo di `js/azioni.js` (`window[azione](...argomenti)`, segnaposto `$value` già risolti dal giocatore).

**Chi è il master per il server**: le chiamate da master (`/api/online/parti`, apertura e chiusura della stanza, esito forzato) sono accettate solo con `Host` uguale a `localhost:<porta>` o `127.0.0.1:<porta>`: le richieste che arrivano da ngrok o dalla rete locale hanno un altro `Host`.

## 8. Connessione, disconnessione, salvataggio

- Token casuale per giocatore, salvato nel suo browser: ricaricando o perdendo la rete rientra come lo stesso giocatore.
- Il link contiene il codice casuale della stanza; senza codice non si entra.
- Giocatore senza segnale per `ONLINE_DISCONNECT_SECONDS` (20 s): segnato disconnesso, i voti non lo aspettano, il master comanda il suo eroe, avviso al master. Al ritorno riprende l'eroe.
- Master che chiude la scheda: la partita si ferma; i giocatori vedono l'avviso. Il gioco **salva da solo a ogni ritorno sulla mappa** in uno slot dedicato "Online" (oltre ai tre slot normali). Al riavvio il master carica lo slot e i giocatori rientrano col token.
- Ritardo atteso con ngrok: 0,1–0,3 s a clic.

## 9. Media leggeri e banda

- **Immagini leggere per i giocatori**: la pagina del giocatore riscrive i percorsi delle immagini grandi (`immagini/` tranne `icone/`, `cursori/`, `ui/`) in `/leggero/<percorso>`. Il server crea la versione leggera con ffmpeg alla prima richiesta (lato massimo 960 px, WebP qualità 65), la tiene in una cartella cache ignorata da git (`server/cache-leggera/`) e la rimanda; senza ffmpeg manda l'originale.
- **Video leggeri**: i video dei nemici restano anche per i giocatori, in versione leggera: 480p, H.264 CRF 32, senza audio, creata e tenuta in cache come le immagini (stessa via `/leggero/`).
- **Cache del browser**: immagini, video, audio e font (originali e leggeri) con `Cache-Control: public, max-age=604800`; HTML, JS e CSS restano senza cache come oggi (dopo un aggiornamento si vedono subito).
- **Musica**: ogni giocatore la accende o la spegne con un pulsante sulla sua pagina (scelta ricordata nel suo browser); parte spenta. Il tema segue la schermata, come nel gioco.
- Stima per serata con 4 giocatori: schermate compresse qualche decina di MB, media leggeri scaricati una volta per giocatore. Richieste: uno stream per giocatore più una per clic, ben sotto le 20.000 al mese.

## 10. Test

Automatici (Node senza dipendenze, in `tests/`):
- `onlineCanRun`: un giocatore non agisce con l'eroe di un altro; il master può tutto; azioni non elencate solo del master; voto aperto blocca l'esecuzione diretta.
- `resolveVote`: maggioranza, pareggio al capo, nessun voto al capo, voto cambiato, disconnessi esclusi, esito forzato.
- `nextCaptain`: rotazione a ogni livello, salta i disconnessi.
- `changedRegions`: niente cambiato → niente da inviare; solo le regioni cambiate.
- Salvataggi: `onlineOwners` va e torna, migrazione della versione, slot "Online".

Script a parte (non nel controllo prima del commit): `tools/prova_online.mjs` avvia il server su una porta di prova e simula un master e due giocatori: ingresso, token, rientro, inoltro di parti e clic, stream compresso, `Host` del master, disconnessione, `/leggero/` con e senza ffmpeg.

A mano: master su `localhost` + giocatore in finestra anonima sullo stesso PC; poi prova vera con ngrok e un amico, con una lista di controllo.

## 11. Consegna in tre tappe

1. **Si gioca**: stanza, nomi e token; creazione a turno; specchio e clic inoltrati; permessi di scontro, prove (tiro), bottino, preghiera; voto della mappa; master che forza e sblocca.
2. **Si decide insieme**: voti di prova, chi prega, bersaglio del nemico, contrattazione, rinnovo della merce; "Ho finito" al riposo e dal mercante; capo a rotazione.
3. **Si gioca bene in rete**: disconnessioni e rientro; salvataggio automatico "Online"; immagini e video leggeri; cache; musica a scelta.

Ogni tappa termina con i test verdi e una prova a mano con due finestre.
