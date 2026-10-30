# Prova a mano della partita online

Preparazione: `avvia-server.bat`; master su `http://localhost:8787/index.html`; due finestre anonime (Marco, Sara). Per la prova vera: tunnel ngrok attivo dalle Opzioni e un amico da un'altra rete.

1. Opzioni → Partita online → "Apri la stanza": compare il link. Aperto da Marco e Sara: entrano senza nome (spettatori) e vedono il velo "Il master sta preparando il capitolo…" sopra il menu del master; nella loro barra niente voti né "pronti".
2. Il master sceglie la campagna: nella schermata della compagnia c'è il box "Eroi del capitolo" con lo stato di ogni eroe (da creare, in creazione, creazione in sospeso, creato), chi è collegato e quanti sono in attesa di scegliere. Online non c'è il passo "Conferma": la compagnia ha tanti eroi quanti ne ha il capitolo (`campaignHeroes.length`). Sui telefoni compare il pannello "Scegli il tuo eroe".
3. Marco tocca un eroe nel pannello "Scegli il tuo eroe": la creazione di quell'eroe parte sulla schermata condivisa (specchiata a tutti) e Marco la guida dal telefono (rune, abilità, oggetto). Se Sara tocca un altro eroe mentre Marco crea riceve "Sta creando: <eroe di Marco>" e il suo pannello resta aperto; quando Marco ha finito, Sara sceglie e crea il suo.
4. Mappa: il nodo lo sceglie solo il master; un giocatore che clicca un nodo riceve "Solo il master può farlo" e non succede niente.
5. Scontro: Marco può scegliere solo il suo eroe nel menu; azione e tiro solo lui; Sara riceve "Non è il tuo turno" se prova. Bersaglio del nemico votato (15 s).
6. Bottino: lo prende chi lo chiede per il proprio eroe; con lo zaino pieno sceglie lui cosa scartare.
7. Prova: il master decide se affrontarla e con quale eroe; poi tira solo il giocatore di quell'eroe.
8. Riposo: il master sceglie chi prega; tira e sceglie la benedizione il giocatore di quell'eroe; "Riparti" diventa "Pronti 1/2".
9. Mercante: ognuno compra per il proprio eroe; contrattazione e rinnovo votati; il medico cura solo il proprio eroe; "Lascia il mercante" con i pronti.
10. Chiudi la finestra di Sara: dopo 20 s il master vede l'avviso, i voti non la aspettano; riaprendo il link Sara rientra con il suo eroe, senza scrivere niente.
11. Il master ricarica la pagina: i giocatori vedono "Il master non è collegato"; il master riapre la stanza e "Riprendi l'ultima" rimette la partita.
12. Con ffmpeg: le immagini grandi e i video dei giocatori arrivano da `/leggero/` (cartella `server/cache-leggera/`); la musica si accende col pulsante 🔇/🔊.
13. Due telefoni toccano lo stesso eroe: il primo lo prende, il secondo riceve il rifiuto ("è già in gioco" o "Sta creando: ...") e il suo pannello resta aperto.
14. Chi sta creando chiude il browser a metà: dopo il tempo di disconnessione la bozza va in sospeso ("creazione in sospeso" nella lobby). Riaprendo il link da un altro browser (o con lo stesso token) la creazione riprende da sola, con rune, abilità e oggetti al loro posto; il master può anche premere "Riprendi <eroe>".
15. Un giocatore cade in uno scontro: il master comanda il suo eroe. Da un altro telefono (spettatore) si tocca quell'eroe: se il vecchio giocatore è scollegato, lo prende e continua lo scontro.
16. Il master crea un eroe che nessuno ha preso; un ritardatario apre il link, lo sceglie dal pannello e da quel momento lo comanda.
17. Si riprende una partita salvata ("Riprendi l'ultima") con un codice nuovo: i giocatori rientrano come spettatori, scelgono ciascuno il proprio eroe e `onlineOwners` combacia con la compagnia (anche con un salvataggio vecchio).
18. Il link del master a distanza (`?master=<chiave>`) funziona come prima: nessun nome da scrivere, compare come "Master", vede la mappa intera e il Pannello; il pulsante "Riprendi <eroe>" lo vede lui (come il master sul PC), i giocatori no. Se lo preme mentre un altro sta creando riceve "Sta creando: X".
19. Nella stessa stanza si perde e si riprova lo stesso capitolo (o si passa al capitolo successivo, anche con eroi diversi): tutti ricevono "Nuovo capitolo: scegli il tuo eroe", tornano spettatori e rivedono il pannello "Scegli il tuo eroe"; nessuno resta col nome di un eroe vecchio, la creazione riparte e voti e "pronti" contano solo chi ha scelto di nuovo.
20. Un giocatore apre un link vecchio (stanza chiusa o riaperta con un codice nuovo): resta l'avviso "Stanza non trovata: chiedi al master un link nuovo", senza tentativi a ripetizione.
