# Prova a mano della partita online

Preparazione: `avvia-server.bat`; master su `http://localhost:8787/index.html`; due finestre anonime (Marco, Sara). Per la prova vera: tunnel ngrok attivo dalle Opzioni e un amico da un'altra rete.

1. Opzioni → Partita online → "Apri la stanza": compare il link. Aperto da Marco e Sara: scrivono il nome, vedono il menu del master.
2. Il master sceglie la campagna: nella schermata della compagnia c'è l'elenco "Giocatori nella stanza" con 🟢.
3. "Conferma": il numero di eroi diventa 2. Marco sceglie eroe, abilità, oggetto; se Sara clicca riceve "Sta scegliendo un altro giocatore". Poi Sara.
4. Mappa con due strade: barra del voto in basso per tutti; Marco e Sara votano lo stesso nodo → si parte subito. Pareggio: si aspetta il tempo e decide il capo 👑. Il master forza un voto dalla sua barra.
5. Scontro: Marco può scegliere solo il suo eroe nel menu; azione e tiro solo lui; Sara riceve "Non è il tuo turno" se prova. Bersaglio del nemico votato (15 s).
6. Bottino: lo prende chi lo chiede per il proprio eroe; con lo zaino pieno sceglie lui cosa scartare.
7. Prova: voto su chi la affronta o "Lascia perdere"; tira solo quel giocatore.
8. Riposo: voto su chi prega; benedizione scelta da chi ha pregato; "Riparti" diventa "Pronti 1/2".
9. Mercante: ognuno compra per il proprio eroe; contrattazione e rinnovo votati; il medico cura solo il proprio eroe; "Lascia il mercante" con i pronti.
10. Chiudi la finestra di Sara: dopo 20 s il master vede l'avviso, i voti non la aspettano; riaprendo il link Sara rientra senza nome.
11. Il master ricarica la pagina: i giocatori vedono "Il master non è collegato"; il master riapre la stanza e "Riprendi l'ultima" rimette la partita.
12. Con ffmpeg: le immagini grandi e i video dei giocatori arrivano da `/leggero/` (cartella `server/cache-leggera/`); la musica si accende col pulsante 🔇/🔊.
