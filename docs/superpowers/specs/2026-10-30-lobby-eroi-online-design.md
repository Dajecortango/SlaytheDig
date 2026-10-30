# Partita online: si entra scegliendo un eroe, non scrivendo un nome

Data: 2026-10-30. Stato: approvato dall'utente il 2026-10-30.

## Perché

Durante una partita online un giocatore ha perso la connessione e non è più riuscito a riprendere il suo eroe.

Causa: oggi il server riconosce un giocatore solo dal token salvato nel suo browser (`localStorage`, chiave della stanza). L'eroe è legato al **nome** del giocatore (`stato.onlineOwners`: eroe → nome). Se il token si perde (altro telefono, altro browser, navigazione privata, dati del sito cancellati), il giocatore riscrive lo stesso nome. Il server risponde "Nome già usato da un altro giocatore" (`server/online.js`, `/api/online/entra`), perché il vecchio posto resta nella stanza anche da scollegato. Con un nome diverso il giocatore entra come persona nuova e l'eroe non è più suo.

## Cosa vuole l'utente (sue decisioni)

1. Chi apre il link non scrive un nome. Sceglie un eroe dalla rosa disponibile, e quell'eroe è la sua identità nella stanza.
2. Chi si collega arriva direttamente nel capitolo dell'avventura, non nei menu del master.
3. Abilità (o rune) ed equipaggiamento iniziale si scelgono una sola volta, nella lobby di creazione, all'inizio del capitolo.
4. Creazione **uno alla volta, chi prima arriva**. Nella lobby tutti vedono la rosa. Il primo che tocca un eroe libero lo prende e lo crea sullo schermo condiviso (abilità o rune, oggetti). Gli altri vedono "Sta creando: Icaro". Quando ha finito, tocca al prossimo che sceglie un eroe.
5. Un eroe è **occupato** finché il suo giocatore è collegato: nessun altro può prenderlo. Quando il giocatore si scollega, l'eroe diventa "libero (scollegato)" e chi apre il link può sceglierlo. Così chi è caduto lo riprende da qualunque dispositivo.
6. Al rientro l'eroe ha tutto com'era: vita, inventario, rune, punti, stati. Lo stato resta nella sessione del PC che ospita (`stato.party`) e nel salvataggio `online`.
7. Il **master a distanza** resta com'è: entra con il suo link (`?master=<chiave>`), ha i suoi poteri e non ha un eroe.

## Obiettivi

- Un giocatore caduto riprende il suo eroe in pochi secondi, da qualunque browser, senza aiuto del master.
- Lo stesso browser rientra da solo sul suo eroe con il token salvato, senza scegliere niente (come oggi).
- Nessuno può prendere l'eroe di un giocatore collegato, neanche con due tocchi nello stesso istante.

## Non obiettivi

- Creazione in parallelo sui telefoni (scartata dall'utente: troppo lavoro, due versioni della creazione).
- Protezione contro chi prende apposta l'eroe di uno scollegato (niente PIN; l'utente accetta questo rischio).
- Aggiungere eroi a una compagnia già partita: chi arriva quando tutti gli eroi sono occupati guarda e basta.
- Cambiare il telefono di Valerio (`server/server.js`, `js/remote.js`).

## Anti-obiettivi (sarebbe un fallimento anche se "funziona")

- Un giocatore collegato perde il suo eroe perché un altro lo ha toccato.
- Al rientro l'eroe riparte vuoto o con i valori iniziali.
- Il master a distanza perde un potere che ha oggi, o un giocatore ottiene i suoi poteri.
- Lo stato della partita si riempie di nomi di persone che i giocatori non scrivono più (voti, capo, "Tocca a …" restano coerenti).

## Come funziona

### Identità: l'eroe è il giocatore (mia scelta)

Oggi molte parti del codice usano il nome del giocatore: `onlineOwners`, voti (`voto.voti[nome]`), pronti, capo spedizione, `attesi`, "Tocca a Luca (Icaro)", `/api/online/avviso`. La strada più corta: il `name` di un giocatore nella stanza **diventa il nome dell'eroe** quando lo sceglie. Prima della scelta il giocatore non ha nome (spettatore, `name: null`). Allora:

- `stato.onlineOwners` diventa eroe → eroe. Resta nel salvataggio per compatibilità, ma la fonte vera è "quale giocatore collegato ha `name` = eroe".
- Voti, pronti, capo e avvisi continuano a funzionare con le stesse chiavi; nei testi compare il nome dell'eroe ("Tocca a Icaro").
- Rientrare = dare a un token nuovo il `name` di un eroe scollegato. Il nome non cambia, quindi voti, capo e owners non cambiano.

Ogni giocatore nella stanza ha anche un `id` pubblico breve (non il token, che è segreto), così il master sa chi ha cliccato anche prima che abbia un nome.

### Chi decide l'assegnazione: il server (mia scelta)

La scelta di un eroe passa dal server, che è a un solo filo e quindi risolve da solo due tocchi nello stesso istante. Nuova chiamata, per esempio `/api/online/scegli { code, token, eroe }`:

- rifiuta se un altro giocatore **collegato** ha già `name` = eroe ("Icaro è già in gioco");
- se un giocatore **scollegato** ha quel nome, gli toglie il posto (chiude i suoi stream, toglie il suo token) e dà il nome al nuovo token;
- accetta solo eroi della rosa che il master ha mandato nello stato (vedi sotto) e, durante la creazione, solo se nessun altro sta creando;
- avvisa il master (evento `stanza`) che aggiorna lobby e owners.

Il master manda nello stato per i giocatori (`onlineInviaStato`) la rosa: in creazione gli eroi del capitolo (`campaignHeroes`) con, per ognuno, "da creare", "creato" o "in creazione", e chi sta creando; a partita avviata gli eroi della compagnia (`stato.party`). In creazione si può scegliere un eroe "da creare" (parte la sua creazione) o un eroe "creato" senza giocatore collegato (lo si riprende e basta). Il server la tiene in `stanza.stato` e la usa per validare.

Fine della creazione di un eroe (`nextHero`): il master libera il "sta creando" e lo dice nello stato.

Se il giocatore che sta creando si scollega a metà, l'eroe **non si scarta** (decisione dell'utente): tiene tutto quello che ha scelto fino a quel momento, cioè abilità, rune, oggetti già presi e statistiche. Il master mette da parte la bozza (copia di `activeHeroForCreation` e del punto della creazione in cui era). La schermata condivisa torna alla rosa, così gli altri possono creare i loro eroi. Nella rosa quell'eroe compare come "creazione in sospeso", senza giocatore. Chi lo sceglie, lo stesso giocatore al rientro o un altro, riprende la creazione dal punto in cui era rimasta. Anche il master può riprenderla. La partenza aspetta che non ci siano bozze in sospeso.

### Le tre situazioni di chi apre il link

1. **Il master non è ancora nella creazione del capitolo** (menu, scelta della campagna): il giocatore vede un pannello d'attesa "Il master sta preparando il capitolo…", non i menu del master. La stanza si apre ancora dalle Opzioni quando si vuole (mia scelta: non lego l'apertura della stanza a un capitolo).
2. **Creazione della compagnia** (`screenParty`): il giocatore vede la schermata condivisa con la rosa. Se nessuno sta creando e lui non ha un eroe, tocca un eroe libero e la creazione parte per lui. Gli altri vedono "Sta creando: Icaro" e i comandi spenti. La creazione resta quella di oggi (`selectHeroCard`, abilità, rune, oggetti, `nextHero`), con il permesso `creazione` che vale per chi sta creando.
3. **Partita avviata** (mappa, scontro, riposo… o partita ripresa dal salvataggio `online`): un giocatore senza eroe vede sulla sua pagina un pannello "Scegli il tuo eroe" con gli eroi della compagnia: ritratto, nome, "occupato" (collegato) o "libero". Tocca un eroe libero ed entra. Se sono tutti occupati guarda come spettatore.

Il pannello del punto 3 è disegnato dalla pagina del giocatore (`server/public/online.js`) dai dati dello stato, non è una schermata specchiata del master.

### Numero di eroi (decisione dell'utente)

Online la compagnia ha **tutti gli eroi della rosa del capitolo**: il numero è `campaignHeroes.length` (Fredlös parte 1: 4; Loch Ein parte 1 e 2: 6). Il passo "quanti eroi" (`partySizeSelect`, `confirmPartySize`) online si salta, anche oltre il limite di 5 di `setupPartySizeSelector`, che resta per la partita sul PC. L'ordine fisso `ordineCreazione` sparisce: crea il primo che tocca un eroe. Quando tutti gli eroi della rosa sono creati si parte come oggi (`screenCampaignIntro`).

Se i giocatori sono meno degli eroi, il master (sul PC o a distanza) tocca un eroe libero e lo crea lui. L'eroe nasce senza giocatore, quindi "libero", e chi arriva dopo può sceglierlo (mia scelta: la lobby non resta mai ferma). Durante la partita il master agisce per gli eroi senza giocatore, come oggi per qualunque eroe. Chi arriva quando tutti gli eroi sono occupati resta spettatore finché un eroe non si libera.

"Giocatori collegati" per voti, pronti e capo = solo chi ha un eroe ed è collegato. Gli spettatori non votano e non contano.

Anche durante la creazione vale la regola 5: un eroe già creato il cui giocatore si è scollegato è libero e si può riprendere, senza rifarlo.

Il capo della spedizione oggi segue l'ordine d'ingresso. Senza ordine d'ingresso segue l'ordine della compagnia (`stato.party`), saltando gli eroi scollegati (mia scelta).

### Master a distanza e moderatore

- Master a distanza: invariato. Il suo link mostra solo "Entra come Master"; il server lo accetta solo con la chiave. Non scrive più un nome: nella stanza si chiama "Master" (mia scelta). Riaprendo il link rientra da solo come oggi (`dignitas_online_<codice>_master`).
- Moderatore: resta ("Entra come Moderatore"), senza nome da scrivere; si chiama "Moderatore", "Moderatore 2"… (mia scelta). L'utente non ne ha parlato; lo tengo com'è.

### Salvataggi

`stato.onlineOwners` resta nel salvataggio. Riprendendo una partita `online` salvata con il formato vecchio (valori = nomi di persone), gli owners si rifanno eroe → eroe al caricamento e tutti gli eroi partono "liberi". Se il formato salvato non cambia non serve alzare `SAVE_VERSION`; se cambia, si alza e si aggiunge il passo in `SAVE_MIGRATIONS` (scelta del costruttore).

## Vincoli

- Regole di `CLAUDE.md`: niente build, JavaScript puro, testi in italiano, `data-action` invece di `onclick`, `rng()` solo per la partita, leggibilità (niente `opacity` per gli stati spenti: oggi `.hero-mini-card.online-altro` usa `opacity`, da non copiare nei nuovi pannelli).
- Regole pure in `js/online-regole.js` (usate da gioco, pagina dei giocatori e test); server in `server/online.js`; pagina in `server/public/online.html` + `online.js`; master in `js/online.js`.
- Aggiornare `docs/online.md` e la lista di controllo `docs/superpowers/prova-online.md`.
- Test: `tests/online.test.js` (regole e server), `node tools/prova_online.mjs` (server vero). Casi minimi: due tocchi sullo stesso eroe, rientro da token nuovo su eroe scollegato, rifiuto su eroe collegato, rientro automatico con il token vecchio, master a distanza invariato.

## Lasciato al costruttore

- Nomi delle nuove chiamate, eventi e campi.
- Aspetto del pannello "Scegli il tuo eroe" e del pannello d'attesa (stile WC3 come il resto della pagina, `docs/interfaccia.md`).
- Quanto attendere prima di considerare scollegato un giocatore (oggi `DISCONNECT_MS`).
- Se tenere `onlineOwners` come mappa eroe → eroe o ricavarlo dalla stanza.
