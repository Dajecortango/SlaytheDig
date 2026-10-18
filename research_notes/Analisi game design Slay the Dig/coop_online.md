# Cooperazione e partita online guidata da un master: Slay the Dig

Fatti del gioco ricavati dal codice (non da fonti esterne): `CLAUDE.md` (sezioni "Partita online (a distanza)" e "Telefono"), `js/online-regole.js` e `js/regole.js`. Il master non ha un eroe e può fare tutto. Ogni giocatore comanda un eroe (`stato.onlineOwners`). Le azioni che non compaiono in `ONLINE_PERMESSI` restano al solo master: tra queste `selectStsNode` (la strada sulla mappa), `challengeChoose` / `confirmChallengeHero` (chi affronta la prova) e `startPrayer` / `confirmPrayerHero` (chi prega). Sono invece permesse a chiunque (`'tutti'`) molte azioni condivise: `selectLootChoice`, `tryBuyMerchantItem`, `selectTreasureItem`, `proceedCombatPhase` e `advanceNode` fuori dal riposo. I voti hanno un timer: `VOTE_SECONDS = 30`, mentre `VOTE_SECONDS_TARGET = 15` vale per il bersaglio del nemico. Si vota su bersaglio, contrattazione e rinnovo della merce. In `resolveVote` vince la maggioranza dei collegati. Con un pareggio vince la scelta del capo, se è tra le pari, altrimenti la prima opzione. Se non vota nessuno vince la prima opzione. Se il master esegue l'azione, il voto si annulla (`votoAnnullatoDa`). Il capo della spedizione è il primo giocatore collegato nell'ordine. "Ho finito" (`'pronti'`) vale al riposo e dal mercante. La nebbia sulla mappa copre i nodi oltre 2 passi (`ONLINE_NODI_VISIBILI = 2`), ma il boss resta visibile.

Nota di metodo: ho trovato fonti primarie solide per quarterbacking, downtime, Jackbox e Twitch Plays Pokémon. Per Gloomhaven digitale, per Descent e per la mod "Together in Spire" non ho trovato fonti di design affidabili (vedi Gaps). Nelle Inferenze il giudizio è mio, non delle fonti.

## 1. Il problema dell'"alpha player" (quarterbacking): il modello "master + un eroe per giocatore" lo evita o lo peggiora?

### Takeaway
Le fonti concordano su un punto: il quarterbacking nasce quando la cooperazione ha informazione perfetta e una sola mossa ovviamente migliore. Un eroe per giocatore aiuta solo se le scelte di ogni eroe sono abbastanza ricche e personali. In Slay the Dig il rischio principale non è un giocatore alfa. È il master stesso, che per regola decide le scelte strategiche e può eseguire qualunque azione annullando i voti.

### Cited Findings
- Justin Gary definisce il quarterbacking così: "One dominant player at the table figures out the optimal play and starts directing everyone else". Un tester gli chiese che cosa cambiasse la sua presenza "compared to just one person manually running an extra position" (il resto dell'articolo è a pagamento). — [Justin Gary, The Quarterback Problem](https://justingarydesign.substack.com/p/the-quarterback-problem)
- Secondo la sintesi della ricerca, Gary sostiene che dare poteri unici o nascondere informazioni curi solo il sintomo. La causa sarebbe l'informazione perfetta con una mossa ottima ovvia, e la proposta è creare situazioni in cui il meglio per il tavolo differisce dal meglio per il singolo. Non l'ho verificato nel testo intero, che è a pagamento. — [Justin Gary](https://justingarydesign.substack.com/p/the-quarterback-problem)
- The Alexandrian elenca cinque rimedi: informazione nascosta ("often doesn't work" se non c'è motivo di tacerla; funziona in Hanabi), profondità tattica (in Arkham Horror "individual players are still responsible for playing through their encounters"), informazione incompleta per tutti, traditore ("a game with a traitor isn't actually co-op") e tempo reale. Considera il tempo reale "the only surefire solution". — [The Alexandrian](https://thealexandrian.net/wordpress/35063/board-games/thought-of-the-day-quarterbacking-in-co-op-games)
- Spirit Island resiste al quarterbacking per tre motivi: non esiste una sola linea ottima, ogni spirito ha regole e ritmo propri, e nessuno riesce a gestire tutta la plancia da solo. I giocatori negoziano ("I can cancel this ravage here if you can defend that coast"). — [Sprites and Dice](https://spritesanddice.com/posts/spirit-island-cure-quarterbacking/)
- In Spirit Island si agisce in contemporanea dentro ogni fase e si può parlare liberamente. — [Dized rules FAQ](https://rules.dized.com/game/_7rPptSyRn6_unBi4-2eVg/zf5Wz6k_Ru-ON43tzlUU2Q/do-players-take-turns-to-play)
- Northstar Games: limitare la comunicazione (alla Hanabi) rende i giochi meno sociali, e molti giocatori faticano a rispettare il limite. — [Northstar Games](https://www.northstargames.com/blogs/secret-fun/quarterbacking-in-coop-games)
- Keith Burgun la vede in un altro modo: il quarterbacking è un sintomo di poca profondità, e la cura è rendere il gioco più profondo, così c'è più spazio per non essere d'accordo. — [Keith Burgun](https://keithburgun.net/why-quarterbacking-isnt-a-problem-in-cooperative-games/)
- Josh Aaron Miller propone il gioco di ruolo come rimedio: ognuno parla per il proprio personaggio. — [UXP](https://www.universityxp.com/news/2021/8/12/roleplaying-as-a-solution-to-the-quarterbacking-problem-problem-of-cooperative-and-educational-games)
- In Mansions of Madness 2a edizione l'app ha preso il posto del Keeper umano. Kotaku sostiene che il nemico umano al tavolo frenava la vera collaborazione. Un'altra recensione nota che il Keeper umano spesso non osava usare tutto il suo arsenale. — [Kotaku](https://kotaku.com/mansions-of-madness-is-still-one-of-the-best-co-op-boar-1839116360); [Tampere PlayLab](https://blogs.tuni.fi/playlab/game-reviews/mansions-of-madness-2nd-edition-review/)

### Inferences
- In Slay the Dig la proprietà dell'eroe aiuta già: in combattimento c'è `'eroeAttivo'`, tira solo il proprietario e sul telefono compare "Tocca a Luca (Icaro)". Però l'informazione resta perfetta, perché tutti vedono la stessa schermata a specchio. Un parente esperto può quindi dettare ogni mossa a voce (a chiamata o in salotto). Per il simulatore, poi, l'Esperto ha regole quasi deterministiche (difende chi cadrebbe, aiuta chi colpisce meglio): segno che spesso esiste una "mossa ovvia".
- Il quarterback strutturale è il master. Sceglie la strada, chi affronta la prova e chi prega, e può eseguire un'azione che annulla il voto (`votoAnnullatoDa`). In una partita di famiglia è utile (fa da animatore). Diventa un rischio se il master è anche il giocatore più esperto: i giocatori finiscono a lanciare dadi. Questo ricorda il problema "che cosa cambia la mia presenza" descritto da Gary.
- Rimedi adatti al codice esistente:
  1. **Informazione privata per eroe** (la pagina del giocatore la mostra già in parte): per esempio, il dado del sacchetto (`peekHeroDice`) o una carta del bottino visibile solo a chi la scopre. Così si crea il motivo di comunicare che secondo The Alexandrian manca all'informazione nascosta.
  2. **Delegare alcune scelte strategiche** ai giocatori con un voto (strada) o al proprietario dell'eroe (prova o preghiera: "mi offro volontario"). Il master conferma o forza.
  3. **Scelte personali ricche**, come rune, benedizioni e lancio (`lancia`), dove il meglio per l'eroe e il meglio per il gruppo divergono (la proposta attribuita a Gary). Il bottino conteso (tre carte, ne prende uno solo) è già una situazione di questo tipo.

### Gaps
- Non ho trovato un'intervista di Matt Leacock dedicata esplicitamente al quarterbacking. La ricerca ha dato solo interviste generiche su Pandemic Legacy ([Tabletop Gaming](https://tabletopgaming.co.uk/features/the-making-of-pandemic-legacy)). Le affermazioni su Leacock e il quarterbacking non sono verificate qui.
- Ho letto solo l'apertura dell'articolo di Gary: le soluzioni proposte non sono verificate parola per parola.

## 2. Downtime e riflettori nei multigiocatore a turni

### Takeaway
Il downtime è il tempo in cui un giocatore non può influire sull'esito. Si riduce con turni brevi, azioni simultanee, azioni di chi aspetta e turni altrui interessanti da guardare. Il facilitatore (il GM) ha il compito esplicito di accorgersene. In Slay the Dig il downtime è alto: con 4-5 eroi a turno, un giocatore agisce per circa un quinto del combattimento e quasi mai nelle prove di un altro.

### Cited Findings
- Definizione: "The player cannot directly affect the outcome of the game for a period of time". Pianificare le mosse future non conta come downtime. — [Design pattern "Downtime"](https://math.vu.nl/~eliens/demo/pattern-downtime.html)
- Come ridurlo: difficoltà giusta, pianificazione limitata contro la paralisi da analisi, e facilitatori ("Game Masters") che notano il downtime e spingono a giocare. Un po' di downtime crea attesa; troppo rovina l'immersione. Le cut scene sono un downtime voluto che scarica la tensione. — [stesso](https://math.vu.nl/~eliens/demo/pattern-downtime.html)
- Lo stesso catalogo suggerisce di rendere le azioni del giocatore attivo interessanti per chi guarda, o di permettere a chi aspetta qualche azione che tocca lo stato del gioco. — [pattern Downtime](https://math.vu.nl/~eliens/demo/pattern-downtime.html)
- Turni spezzati in fasi o in singole azioni fanno passare la mano più spesso. Esempi di giochi con un'azione per tutti: Puerto Rico e Race for the Galaxy. Un timer deve servire alla tensione, non solo a tagliare l'attesa. — [BGDF, Understanding downtime](https://bgdf.com/forum/game-design/topics-game-design/understanding-downtime); [BGDF blog](https://www.bgdf.com/blog/boardgame-downtime); [Gnome Stew](https://gnomestew.com/a-look-at-downtime-in-rpgs-and-board-games/)
- Gloomhaven è classificato tra i giochi a "Simultaneous Action Selection", con una coda di azioni. Lì il vincolo di tempo è la mano di carte che si consuma, non un timer imposto. — [Board Game Oracle](https://www.boardgameoracle.com/en-CA/boardgame/price/Dcy77KGDLF/gloomhaven-second-edition); [Quarter to Three forum](https://forum.quartertothree.com/t/boardgaming-in-2017/127711/476)
- Riflettori online: rivolgere le domande a un giocatore preciso ("Don't ask the group open, hanging questions") perché online "You don't have the visual cues that f2f groups use", e scegliere chi non ha parlato da un po'. — [Age of Ravens, Lessons from Online GMing](https://www.ageofravensgames.com/blog/lessons-from-online-gming)
- Online anche il microfono aperto conta come "tenere i riflettori". Una lista di spunta aiuta a verificare che tutti abbiano agito. — [Mediums and Messages](https://mediumsandmessages.bearblog.dev/the-spotlight/); [Burn After Running](https://burnafterrunningrpg.com/2023/03/)
- Slay the Spire 2 in co-op: mappa condivisa, mazzi indipendenti, scontri come in solo con più vita ai nemici. Secondo una guida basata sui trailer, al fuoco ognuno decide per sé. — [PCGamesN](https://www.pcgamesn.com/slay-the-spire-2/review); [slaythespire2.gg](https://slaythespire2.gg/guides/sts2-coop-multiplayer) (fonte secondaria)

### Inferences
- Punti a rischio in Slay the Dig:
  - le prove: tira solo chi la affronta e gli altri guardano;
  - la preghiera: un eroe per riposo;
  - il capitano;
  - il turno del nemico.
  Sono momenti di "un solo protagonista", e la lista delle azioni `'tutti'` non dà a chi aspetta un ruolo significativo durante il turno altrui.
- Soluzioni coerenti con il motore:
  1. **Pianificazione simultanea in combattimento**: all'inizio del round ogni giocatore sceglie insieme agli altri l'azione del proprio eroe (attacca, difendi, aiuta, abilità), che poi si risolve in ordine. È lo spirito di Gloomhaven e Spirit Island e taglia l'attesa a una sola finestra. Va controllato se `combatActionAllowed` e la coda dei turni lo permettono senza cambiare le regole: è una modifica grande.
  2. **Reazioni di chi aspetta**: "Aiuta" esiste già. Un'interazione leggera come un "incoraggiamento" sul tiro altrui, una spunta "pronto ad aiutare" o un'ipotesi sul dado darebbe a chi non agisce qualcosa da fare senza toccare il bilanciamento. Il catalogo dei pattern lo indica tra i rimedi.
  3. **Animazioni rapide** (`fastAnimations`) suggerite di default in online: con 4-5 spettatori ogni secondo di animazione si moltiplica.
  4. **La pagina del giocatore come "lista di spunta"** per il master: chi ha già fatto qualcosa nel capitolo (prove affrontate, preghiere). Così il master distribuisce i riflettori come un buon GM.

### Gaps
- Non ho trovato fonti dirette su Frozen Synapse (turni simultanei con WEGO), sulle mod co-op di Into the Breach o su Gloomhaven Digital (scelta delle carte in rete). Mancano dati quantitativi sull'attesa tollerata in una partita online a turni.

## 3. Voti e decisioni di gruppo (Jackbox, Twitch Plays, co-op di Slay the Spire)

### Takeaway
Jackbox mostra che con il telefono come controller servono un solo compito alla volta, istruzioni chiare su cosa fare dopo e informazioni private sullo schermo personale. Twitch Plays Pokémon mostra che i voti a maggioranza annoiano, che chi perde smette di votare e che le minoranze possono contare più del previsto. In Slay the Dig i voti sono pochi e brevi, e questo va bene. Il rischio è che chi resta in minoranza si senta ignorato e che il voto del master annulli tutto.

### Cited Findings
- Jackbox: si entra con un codice stanza dal browser, senza app ("no additional app for each player to download"). Il telefono può dare a ogni giocatore informazioni private ("unique information that only they can see"), usate per i ruoli nascosti in Push the Button. — [Built In, Jackbox design principles](https://builtin.com/media-gaming/jackbox-games-design-party-pack)
- Jackbox: "The games never ask players to make multiple choices in a given moment". Bisogna "make sure they always know what to do next", calibrare il tempo concesso per rispondere e non escludere chi ha telefoni vecchi. Lo scopo è "to get the group to laugh". — [Built In](https://builtin.com/media-gaming/jackbox-games-design-party-pack)
- Jackbox accetta come controller qualsiasi browser con websocket e HTML5. Il gioco è pensato per il locale, ma si può giocare a distanza tramite stream; il pubblico arriva fino a 10.000 spettatori. — [Nintendo AU](https://www.nintendo.com/au/games/nintendo-switch/the-jackbox-party-pack-2/); [Steam](https://store.steampowered.com/app/397460)
- Twitch Plays Pokémon: la modalità "democracy" (voti contati, il più votato ogni ~5 secondi) è stata introdotta dopo circa 24 ore bloccati su un enigma. Le soglie di cambio modalità erano asimmetriche (80% per passare ad anarchy→democracy, 50% per tornare indietro, secondo una fonte; 75% secondo un'altra). — [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Twitch_Plays_Pok%C3%A9mon/Season_1); [PS Mag](https://psmag.com/environment/chaos-democracy-religion-world-twitch-plays-pokemon-75839) (le fonti sono in conflitto sulle soglie)
- Twitch Plays Pokémon: i "democratici" erano più numerosi, ma si è giocato soprattutto in anarchia. Gli utenti "stop voting rather than publicly changing their opinion". Una piccola minoranza può essere "fundamental for its success". — [BMC On Society](https://blogs.biomedcentral.com/on-society/2019/06/25/what-twitch-plays-pokemon-tells-us-about-crowd-behavior/); analisi accademica [arXiv 1408.4925](https://arxiv.org/pdf/1408.4925.pdf)
- Twitch Plays Pokémon: l'anarchia era veloce e divertente ma con pochi progressi; la democrazia "dull and predictable". Chi perde il voto sente il proprio suggerimento irrilevante, e votare non costa niente. — [FEE](https://fee.org/articles/exploring-anarchy-and-democracy-on-a-gameboy/)
- Slay the Spire 2 co-op (Mega Crit): carte multigiocatore e sinergie "designed to reward coordination". Nella mod Together in Spire i giocatori hanno proposto di rubare la ricompensa di un compagno rinunciando alla propria, ma come proposta, non come funzione verificata. — [GosuGamers](https://www.gosugamers.net/entertainment/news/78018-slay-the-spire-ii-launches-in-early-access-next-month-with-four-player-co-op-confirmed); [Steam Workshop discussion](https://steamcommunity.com/workshop/filedetails/discussion/2384072973/603027846150005764)

### Inferences
- Cosa funziona già: i voti hanno un timer (30 s, 15 s per il bersaglio per non spezzare lo scontro), contano solo i collegati e il pareggio va al capo. Chi non vota non blocca la partita, nello spirito di Jackbox: non c'è un'attesa infinita.
- Rischi:
  1. **Nessun voto = prima opzione**: è un'impostazione predefinita invisibile che premia chi è distratto. Meglio mostrare in anticipo quale sarà la scelta se nessuno vota.
  2. **Minoranza ignorata**: con 3 contro 1 il perdente non riceve niente. Twitch Plays Pokémon indica che chi perde smette di votare. Si potrebbe mostrare il conteggio dal vivo, dare al perdente un piccolo "segno" (per esempio la volta dopo il pareggio va a lui e non al capo) o ruotare il capo a ogni capitolo.
  3. **Il voto del bersaglio decide chi soffre**: votare chi prende il colpo è un tema delicato in famiglia. In alternativa il proprietario può "offrirsi" (fare da scudo), oppure si mantiene la scelta del nemico (`announcedPrey`) come regola.
  4. **Il master che annulla il voto** va reso visibile ("Il master ha deciso") per non dare l'idea di un voto finto.
- Alcune azioni `'tutti'` (come `selectLootChoice` e `tryBuyMerchantItem`) permettono a chiunque di decidere per il gruppo con un clic. È la versione digitale del "prende chi è più veloce", e premia il giocatore alfa più rapido. Sarebbe meglio una proposta seguita da una conferma, oppure un voto breve per il bottino (vedi anche `takeLootChoice` del telefono, che ha già "Lo prendo io" per un solo oggetto).
- Coerente con Jackbox: sul telefono una sola domanda per volta e sempre "che cosa devo fare adesso". La pagina del giocatore oggi è uno specchio dell'intera schermata del master, quindi ricca ma non guidata. Una riga fissa con "Tocca a te: scegli l'azione di Icaro" o "Aspetta: vota il bersaglio" applicherebbe il principio di Jackbox.

### Gaps
- Non ho trovato documenti ufficiali su come Together in Spire o Downfall gestiscano decisioni condivise e voti. Non ho trovato post di sviluppo di Jackbox con numeri sui timer.

## 4. Ibrido digitale con GM: che cosa decide il GM e che cosa i giocatori (VTT, app-director)

### Takeaway
Nei giochi "guidati da app" (Mansions of Madness 2a edizione) la macchina fa da Keeper: si toglie il conflitto d'interesse e rimane la cooperazione. Il GM umano di Slay the Dig ha un ruolo diverso, da regista e animatore: deve gestire ritmo, riflettori e logistica. Le scelte di gioco con un "proprietario" naturale (il proprio eroe) dovrebbero andare ai giocatori.

### Cited Findings
- Mansions of Madness 2a ed.: l'app genera mostri ed eventi e rende casuale la plancia, quindi non serve un Keeper (si gioca anche da soli). Il gioco passa da asimmetrico a cooperativo. — [Miniature Market](https://miniaturemarket.com/reviewcorner/mansions-of-madness-2nd-edition-review); [Tampere PlayLab](https://blogs.tuni.fi/playlab/game-reviews/mansions-of-madness-2nd-edition-review/)
- Kotaku: la presenza fisica del nemico umano "put a lid on attempts to get truly collaborative". — [Kotaku](https://kotaku.com/mansions-of-madness-is-still-one-of-the-best-co-op-boar-1839116360)
- Miniature Market, critico: senza il peso delle regole di gestione "there really isn't much that is compelling", e si hanno solo gli scenari dell'app. — [Miniature Market](https://miniaturemarket.com/reviewcorner/mansions-of-madness-2nd-edition-review)
- Il GM facilita spingendo chi tarda (pattern Downtime). Online deve chiamare per nome e annunciare durata e pause. — [pattern Downtime](https://math.vu.nl/~eliens/demo/pattern-downtime.html); [Age of Ravens](https://www.ageofravensgames.com/blog/lessons-from-online-gming)
- Open table (The Alexandrian): con posti limitati e liste d'attesa si evita che i giocatori più attivi prendano tutti i posti. — [The Alexandrian, Open Table Manifesto pt. 3](https://thealexandrian.net/wordpress/38669/roleplaying-games/open-table-manifesto-part-3-organizing-your-open-table)

### Inferences
- In Slay the Dig il motore fa già il "Keeper": nemici, fasi degli elite e intenzioni sono automatici. Il master quindi non è un avversario, e questo è buono (si evita il problema descritto da Kotaku). Serve però definire il suo ruolo. Proposta di divisione:
  - **Al master** (regia e logistica): avviare e chiudere la sessione, salvare, sbloccare un giocatore disconnesso (giocare il suo eroe), forzare quando un voto si blocca, leggere i testi di trama ad alta voce (sono i "cut scene" che il catalogo dei pattern considera downtime utile).
  - **Ai giocatori** (scelte con un proprietario naturale): chi affronta una prova e chi prega, cioè chi si offre volontario con conferma del master; la strada sulla mappa con un voto a timer, dove il master tiene il veto; la ripartizione del bottino.
- Oggi le tre scelte strategiche (strada, prova, preghiera) sono solo del master "così un clic distratto non fa danni". La ragione è valida (protezione dagli errori), ma è una soluzione d'interfaccia che toglie autonomia. Un'alternativa che protegge allo stesso modo: proposta del giocatore seguita da una conferma del master in un clic.
- Il master senza eroe rischia di annoiarsi, ma è anche quello che "fa la voce del narratore" (alla Jackbox, il presentatore che "pull you along"). Si potrebbero dare al master piccoli strumenti da narratore (un annuncio, un'emoticon sulla schermata dei giocatori) invece di un eroe.

### Gaps
- Non ho trovato fonti di design su Descent: Legends of the Dark, su Gloomhaven Digital o su "Hidden in the Dark" riguardo alla divisione delle decisioni tra app e giocatori. Non ho trovato fonti sui VTT (Roll20/Foundry) relative ai permessi dei giocatori: il modello "permessi per azione" di `ONLINE_PERMESSI` ricorda i permessi di proprietà dei token dei VTT, ma è una mia osservazione senza fonte.

## 5. Informazione asimmetrica (nebbia sui nodi) e ruolo del capo della spedizione

### Takeaway
Le fonti dicono che l'informazione nascosta funziona contro il quarterbacking solo se dà un motivo per comunicare. Se è nascosta a tutti, invece, trasforma le scelte in scommesse. La nebbia dei nodi in Slay the Dig nasconde informazioni ai giocatori ma non al master. Crea così un'asimmetria master/giocatori, non tra giocatori, e rafforza il master come quarterback naturale della strada.

### Cited Findings
- L'informazione nascosta "often doesn't work" se non c'è motivo di tacerla. L'informazione incompleta per tutti rende le decisioni scommesse: se è del tutto casuale non conta niente, se è prevedibile torna il quarterbacking. — [The Alexandrian](https://thealexandrian.net/wordpress/35063/board-games/thought-of-the-day-quarterbacking-in-co-op-games)
- Jackbox usa lo schermo privato del telefono proprio per dare a ogni giocatore informazioni diverse (ruoli nascosti). — [Built In](https://builtin.com/media-gaming/jackbox-games-design-party-pack)
- Il pattern Downtime nota che il downtime unito a "visible inaccessible areas" può creare tensione. — [pattern Downtime](https://math.vu.nl/~eliens/demo/pattern-downtime.html)
- In Spirit Island la plancia degli invasori aiuta tutti a vedere le minacce principali, così ognuno sceglie i propri poteri. — [Zatu review](https://zatu.com/blogs/reviews/spirit-island-review)

### Inferences
- La nebbia (`classiNodoGiocatore`, `ONLINE_NODI_VISIBILI = 2`) crea mistero ed è economica. Però il master vede tutto e sceglie la strada da solo, quindi l'asimmetria non genera discussione: i giocatori non hanno una ragione per parlare della strada. Possibili soluzioni:
  1. **Esploratori**: un eroe (per esempio con una passiva o una runa, o il capo) "vede" un passo più lontano solo sul proprio telefono e lo deve raccontare agli altri. È informazione privata con un motivo per comunicarla, come raccomanda The Alexandrian.
  2. **Voto sulla strada** tra i nodi aperti, con i giocatori che vedono gli stessi passi e il master che conferma.
  3. **Master nella nebbia** come opzione, così il master gioca "alla cieca" come gli altri e diventa un narratore che scopre.
- Il capo della spedizione oggi serve solo a rompere i pareggi ed è il primo giocatore dell'ordine, quindi sempre lo stesso. Proposte:
  - ruotare il capo a ogni capitolo o livello di mappa, per distribuire il potere;
  - dargli un ruolo leggibile e piccolo, come la strada in caso di pareggio, la proposta di chi affronta la prova o la scelta della musica o del ritmo;
  - mostrare un segno "Capo" sulla sua carta.
  Le fonti sui riflettori (Age of Ravens) suggeriscono di dare voce a chi non l'ha avuta: la rotazione lo fa in modo meccanico.

### Gaps
- Non ho trovato studi specifici sulla nebbia di mappa nei co-op guidati da GM o sui ruoli di "leader" a rotazione in giochi digitali co-op.

## 6. Durata della sessione, entrare e uscire, riconnessione e salvataggi per la famiglia

### Takeaway
Per il gioco online le fonti di GM consigliano di dichiarare la durata, prevedere pause e chiudere a un punto naturale. Jackbox punta a entrare subito dal browser e a supportare telefoni vecchi. Slay the Dig fa già molto: il gioco si salva in automatico sulla mappa, i giocatori si riconnettono con un token e ci sono SSE con ping e media leggeri. Manca soprattutto una gestione esplicita di chi arriva o se ne va a metà.

### Cited Findings
- Age of Ravens: "Establish how long you plan to run for". Fermarsi a un punto naturale o 15 minuti prima della fine, "whichever comes first", avvisare negli ultimi 30 minuti e annunciare le pause ("If players know they'll get a breather it offsets nervousness"). — [Age of Ravens](https://www.ageofravensgames.com/blog/lessons-from-online-gming)
- Sessioni tipiche dei giochi di ruolo: circa 4 ore (Paizo), con sessioni da 2 ore comuni. Online, nei report dei GM, 4-5 ore con ritardi iniziali. — [Paizo, GM Screen](https://2e.aonprd.com/Rules.aspx?ID=501); [Paizo forums](https://paizo.com/threads/rzs2qvrg)
- Jackbox: si entra con un codice stanza dal browser, senza app né hardware, e non si vogliono escludere i telefoni vecchi. — [Built In](https://builtin.com/media-gaming/jackbox-games-design-party-pack); [Jackbox how to play](https://www.jackboxgames.com/how-to-play)
- In un gioco online di Jackbox serve una connessione internet durante tutta la partita. — [Nintendo AU](https://www.nintendo.com/au/games/nintendo-switch/the-jackbox-party-pack-2/)

### Inferences
- Cosa funziona già (dal codice): salvataggio automatico nello slot `online` a ogni ritorno sulla mappa (`onlineRiprendi`), token del nome salvato nel browser del giocatore, proprietari salvati con la partita (versione 5), capo sostituito se si disconnette, voti contati solo tra i collegati, ping SSE ogni 15 s e risincronizzazione sul telefono. Sono le cose giuste per la rete mobile e ngrok.
- Rischi:
  1. **Giocatore disconnesso durante il suo turno**: il suo eroe blocca lo scontro finché il master non interviene. Serve una regola visibile, per esempio "dopo N secondi il master può giocare per lui" o un pilota automatico che usi l'Esperto del simulatore (`simExpertAction`) come controfigura. Il pilota automatico è una mia proposta: va verificato che le funzioni del simulatore si possano chiamare sullo stato vivo.
  2. **Entrata a metà partita**: come si assegna un eroe senza proprietario a chi arriva? Serve un "adotta un eroe libero" dal master.
  3. **Durata**: un capitolo procedurale (Drakengrad) può superare la serata. Utile sarebbe una stima della durata nella schermata del capitolo e un punto di "fine serata" naturale sulla mappa (dopo il riposo), dove l'autosalvataggio c'è già. Si può aggiungere un messaggio "Salvato: si può riprendere da qui".
  4. **Si salva solo dalla mappa** (`saveGame` rifiuta le altre schermate): se la connessione del master cade durante un boss, si perde lo scontro intero. È una scelta tecnica sensata ma va comunicata ("ultimo salvataggio: inizio di questo nodo").

### Gaps
- Non ho trovato dati pubblicati sulla durata ideale di una sessione co-op digitale in famiglia, né studi sulle aspettative di riconnessione nei giochi da festa. Le indicazioni sopra vengono da GM di giochi di ruolo e da Jackbox, per analogia.
