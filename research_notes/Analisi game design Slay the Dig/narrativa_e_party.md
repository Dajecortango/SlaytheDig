# Narrativa, tono e design del party in Slay the Dig

Nota di metodo: le fonti primarie (talk GDC, video) erano spesso dietro login o non leggibili (GDC Vault, GameSpot 403, Inlander 451, Tom's Guide troncato); molte citazioni arrivano quindi da articoli che riportano i talk. Lo segnalo caso per caso. "Fonte dice" = Cited Findings; "io penso" = Inferences.

Fatti del gioco verificati nel codice (non servono fonti esterne):
- 15 eroi in `data/libreria/eroi.js`. Quelli che ho controllato (Curio, Prometeo, Temistocle, Caino, Ottavio, Icaro, Astarte) hanno tutti `maxHp: 4` e `dmg: 1`, e la somma di Forza, Intelligenza e Fede fa sempre 7 (es. Curio 4/1/2, Ottavio 5/1/1, Astarte 2/3/2). Ognuno ha 2 abilità fra cui scegliere (es. Curio: `libertas_in_furor` / `dente_per_dente`).
- I nodi di trama sono pochissimi: 1 nodo `story` in ciascun capitolo di Astarte, nessuno in `drakengrad.js`, `tutorial.js` e `prova di fede.js`. Nessun file di campagna usa `scelte`: il sistema degli eventi esiste nel motore ma oggi nessuna campagna lo usa.
- Il tono dei testi è descrittivo e "da manuale" (seconda persona plurale, lore Vitghen e Lungobarbi). Esempio da `astarte_ch1.js`: "Rimuovete il supporto sbagliato e l'equilibrio del relitto si spezza…". Successi e fallimenti delle prove hanno testi propri, quindi un po' di "storia attraverso il fallimento" c'è già.
- Un eroe caduto resta a terra per il resto della partita; lo rialzano il medico e le pozioni rare o migliori (`REVIVE_MIN_RARITY`). Ogni campagna parte dalla creazione del party. Non ho trovato una morte permanente fra una campagna e l'altra, ma non l'ho verificato a fondo (vedi Gaps).

## 1. Darkest Dungeon: stress, afflizioni, narratore, armonia ludonarrativa

### Takeaway
In Darkest Dungeon il tono non sta nei testi: sta in sistemi che tolgono controllo al giocatore. Lo stress porta alle afflizioni (o alle virtù), gli eroi parlano con le barks, il narratore commenta. Slay the Dig può prenderne tre versioni economiche, tutte fatte di dati: frasi del narratore legate a eventi del gioco, frasi degli eroi legate al loro stato, e un "punto di rottura" leggero che si attiva a 1-2 HP.

### Cited Findings
- **Il talk.** Tyler Sigman presentò "Darkest Dungeon: A Design Postmortem" alla GDC 2016; stress e afflizioni occuparono gran parte dell'ora. L'ispirazione per le afflizioni venne dalla serie *Band of Brothers* (un soldato in shock dopo aver visto morire i compagni) e da *Aliens*, non da altri giochi. Il sistema cambiò pochissimo nell'anno di Early Access. — [PC Gamer](https://www.pcgamer.com/uk/how-darkest-dungeon-got-inspiration-from-band-of-brothers-and-aliens). Il testo dell'articolo non era leggibile; questi dettagli vengono dal riassunto di ricerca e dalla [discussione su MetaFilter](https://metafilter.com/164827/Let-me-share-with-you-the-terrible-wonders-I-have-come-to-know).
- **Come funziona lo stress.** A 100 di stress c'è un controllo di Risolutezza: se riesce l'eroe ottiene una Virtù temporanea, se fallisce un'afflizione (es. paranoia, che può passare stress agli altri). — [PC Gamer](https://www.pcgamer.com/uk/how-darkest-dungeon-got-inspiration-from-band-of-brothers-and-aliens)
- **Cause e rimedi.** Lo stress sale con l'esplorazione e il combattimento, con la mancanza di cibo o di luce, vedendo alleati feriti o morti, e per le "blight" dei nemici. Se nessuno lo controlla, gli eroi si spaventano o disobbediscono agli ordini; quello estremo provoca l'infarto. Lo si cura negli edifici del villaggio, accampandosi o con oggetti. — [Wikipedia, Darkest Dungeon](https://en.wikipedia.org/wiki/Darkest_Dungeon)
- **Intento dichiarato.** Bourassa e Sigman volevano "toy with player agency" (giocare con il controllo del giocatore): ricordargli che non comanda del tutto il party, al contrario dei GdR classici, dove un personaggio con poca vita esegue gli ordini come sempre. Il "bark system" fa parlare i personaggi secondo il loro stress e le loro afflizioni, per dare l'"elemento umano" che secondo loro mancava ai vecchi GdR. Il tema è lo stress sulla psiche, non la "follia" lovecraftiana. Volevano che il giocatore si concentrasse sul sostenere i personaggi più che sul cercare l'equipaggiamento migliore. — [Wikipedia](https://en.wikipedia.org/wiki/Darkest_Dungeon) (cita interviste degli sviluppatori)
- **La vista di lato** di combattimento ed esplorazione serviva a far sentire il giocatore vicino ai personaggi e a farglieli amare. Le posizioni contano: chi sta davanti ha attacchi in mischia più forti ma prende più danni, chi sta dietro è più protetto ma ha attacchi a distanza più deboli, e i nemici possono spostare gli eroi. — [Wikipedia](https://en.wikipedia.org/wiki/Darkest_Dungeon)
- **Proteste in Early Access.** I giocatori protestarono contro gli infarti improvvisi e i cadaveri che occupavano le posizioni; Red Hook li rese facoltativi, ma tenne la propria visione. — [Wikipedia](https://en.wikipedia.org/wiki/Darkest_Dungeon)
- **Gli eroi muoiono per sempre** ("lost for good"). — [Wikipedia](https://en.wikipedia.org/wiki/Darkest_Dungeon)
- **Tono visivo.** Bourassa: "I wanted the game to feel old and worn" ("volevo che il gioco sembrasse vecchio e consumato"), ma anche "fresh and somehow modern" ("fresco e in qualche modo moderno"), con "a pinch of 'cute'" ("un pizzico di carino") per rendere i personaggi riconoscibili e dare un po' di leggerezza. Sigman sulla scelta di Wayne June come narratore: "one of the best decisions we've made" ("una delle migliori decisioni che abbiamo preso"). — [Game Developer, Road to the IGF](https://www.gamedeveloper.com/audio/road-to-the-igf-red-hook-studios-i-darkest-dungeon-i-)
- **Il narratore.** Bourassa: le battute furono scritte per la cadenza di June, che "nails the Gothic flavour, without descending into campiness" ("coglie il sapore gotico senza scadere nel kitsch"). Gran parte della narrazione passa dalla voce del narratore. — riportato da [GameSpot](https://www.gamespot.com/articles/the-gothic-sensibilities-of-darkest-dungeon/1100-6424880/) (pagina non leggibile, 403: citazioni dal riassunto di ricerca) e da [TechRaptor](https://techraptor.net/gaming/features/darkest-dungeon-narrator)
- **Dopo la morte di June** (gennaio 2025) Red Hook non userà l'IA per ricreare la sua voce. — [80.lv](https://80.lv/articles/darkest-dungeon-creator-won-t-replace-late-narrator-with-ai-despite-his-permission/)

### Inferences (mio giudizio)
- **Il punto debole di Slay the Dig rispetto a DD.** Oggi il tono "alla Darkest Dungeon" sta soprattutto nell'estetica e nei testi lunghi delle prove; i sistemi non esprimono paura né logoramento. Il ritratto da ferito (≤2 HP) è l'unico segnale "umano" che reagisce allo stato. È un'ottima base, ma è solo visivo.
- **Proposte economiche, in ordine di rapporto costo/beneficio.**
  1. **Battute del narratore legate a eventi.** Un file di dati `data/libreria/narratore.js` con elenchi di frasi per momento: inizio scontro elite, eroe ferito, eroe caduto, colpo critico, prova fallita, vittoria del boss, arrivo al riposo. Testo nel diario e in sovrimpressione con la macchina da scrivere già presente in `js/effetti.js`; niente voce. Basta la scelta di una frase con `rng()` di `js/comune.js` (attenzione: consuma la sequenza del seme, meglio Math.random perché è solo cosmetico). Costo: basso. Rende "gotico" ogni momento senza toccare il bilanciamento.
  2. **Frasi degli eroi** (`barks`) per eroe nella libreria Eroi: "quando ferito", "quando un alleato cade", "quando uccide". Nel caso di una famiglia vera è il punto più forte: le frasi possono essere battute di famiglia, soprannomi, tic. Mostrate in un fumetto sulla carta dell'eroe. Basso costo, grande attaccamento.
  3. **"Prova della risolutezza" a 1-2 HP** al posto di un vero sistema di stress. Quando un eroe scende a ferito, tira la Fede: se riesce ottiene una virtù temporanea (es. +1 Forza per lo scontro, da `HERO_STATUSES`/`tempBuffs`), se fallisce un'afflizione leggera già esistente nel motore (`furia` = solo Attacca, oppure `silenziato`). Riusa effetti speciali e stati che ci sono già (nuovo `quando`: `ferito`). È la versione minima di stress e afflizione, coerente con il fatto che Fede esiste già come statistica "spirituale". Rischio: togliere controllo frustra (vedi le proteste di Early Access). Tenerla facoltativa per campagna oppure con esiti più positivi che negativi.
  4. **Quirks (tratti).** Assegnare a ogni eroe un tratto permanente nella campagna, preso a caso al riposo o da un evento ("Paura dei ragni: -1 contro bestie"), sarebbe più costoso: servono condizioni sul tipo di nemico, che il motore non ha. Da rimandare.
- **Un vero stress come risorsa** (barra separata) è sconsigliato. Con 4 HP e statistiche piccole aggiungerebbe un secondo logoramento troppo pesante, e l'interfaccia del telefono e della partita online andrebbe estesa.

### Gaps
- Slide e video del postmortem GDC 2016 non consultati (GDC Vault con login). Non ho dati diretti su "cosa non ha funzionato" oltre alle proteste di Early Access.
- Nessuna fonte affidabile su come sono state scritte e dirette le barks. Il blog degli sviluppatori di Red Hook non è stato trovato o letto.

## 2. Narrativa nei roguelike: Hades, FTL, Slay the Spire; la morte che conta; eventi come scelte

### Takeaway
I modelli migliori legano la narrazione alla ripetizione e al fallimento: in Hades la morte fa avanzare la storia, e Slay the Spire 2 vuole eventi senza un'opzione "non faccio niente". In Slay the Dig la sconfitta cancella lo slot e mostra il riepilogo, ma non lascia niente in eredità. Gli eventi con `scelte` esistono nel motore ma non sono usati: è il guadagno narrativo più rapido.

### Cited Findings
- **Hades: niente "game over".** Supergiant voleva che non ci fosse un momento di "game over" e che le morti fossero una parte naturale della struttura. Kasavin voleva che i giocatori tornassero per storia e personaggi, non per meccanismi d'aggancio come i bonus giornalieri. — [Tom's Guide](https://www.tomsguide.com/uk/features/hades-exclusive-interview-supergiant) (pagina troncata; citazione dal riassunto di ricerca)
- **"Take the sting out of failure"** ("togliere il pungiglione al fallimento") era il motto dello sviluppo. — [Inlander](https://inlander.com/culture/hades-writer-greg-kasavin-on-how-he-made-video-game-deaths-drive-a-feel-good-story-22725237) (pagina non raggiungibile, 451: citazione dal riassunto di ricerca)
- **Il protagonista ricorda.** Kasavin: "If the player doesn't forget their deaths and learns from them, so should the protagonist" ("se il giocatore non dimentica le sue morti e ne impara, deve farlo anche il protagonista"). In Hades dialoghi, personaggi e svolte della trama emergono attraverso decine di partite fallite; Zagreus commenta le proprie morti. Molti roguelike, invece, tengono la meccanica separata dalla storia. — [First Person Scholar](https://www.firstpersonscholar.com/?p=7266), che cita Klepek 2020: fonte secondaria
- **La struttura come tema.** Kasavin: "The repeating roguelike structure slotted neatly into the idea of him running away" ("la struttura ripetuta del roguelike si incastrava bene con l'idea della sua fuga"). — [First Person Scholar](https://www.firstpersonscholar.com/?p=7266), che cita Wiltshire 2020
- **Le relazioni di famiglia.** Supergiant puntò sulle relazioni familiari degli Olimpi e di Zagreus per andare oltre la semplice ripetizione. — [But Why Tho](https://butwhytho.net/2021/08/13/interview-developing-hades-with-supergiant-games-greg-kasavin/) (dal riassunto di ricerca)
- **Slay the Spire 2: niente scelta neutra.** Mega Crit: "This time around we're trying to avoid having any options where you simply do nothing and pass through" ("questa volta cerchiamo di evitare le opzioni in cui semplicemente non fai niente e passi oltre"). Alcuni eventi obbligano a scegliere fra opzioni tutte negative; alcune opzioni portano a uno scontro; gli eventi variano con l'atto e con lo stato del giocatore. Esempi: Slippery Bridge (devi togliere una carta; puoi prendere danni per rendere casuale quale) e War Historian Repy (una chiave da usare una volta sola: liberarlo o aprire uno scrigno con due reliquie rare). Gli eventi sono la seconda parte più grande di una partita dopo gli scontri. — [PCGamesN](https://www.pcgamesn.com/slay-the-spire-2/events-redesign)
- **Più di 50 eventi** in StS2, bilanciati per dare "difficult decisions" (decisioni difficili) a ogni visita; arte e testi restano a lungo in bozza mentre si prova se l'evento è interessante. — [Mega Crit, Neowsletter giugno 2025](https://megacrit.com/news/2025-6-12-neowsletter-issue-11/)
- **FTL: prima l'esperienza.** Davis e Ma (GDC 2013, "Designing Without a Pitch") misero al primo posto la sensazione di essere il capitano di un'astronave; meccaniche e genere venivano dopo. — [GDC Vault](https://gdcvault.com/play/1018034/Designing-Without-a-Pitch-FTL); [Game Developer](https://gamedeveloper.com/audio/video-designing-without-a-pitch---the-i-ftl-i-postmortem)
- **Into the Breach: sconfitte con tensione.** La meccanica Resist fu aggiunta perché le partite perse finissero "with more tension, not a whimper" ("con più tensione, non con un lamento"). — [Cliqist](https://cliqist.com/2018/03/06/into-the-breach-building-a-better-mech-with-subset-games-justin-ma/)

### Inferences (mio giudizio)
- **Eventi (`scelte`): da usare subito.** Il motore supporta costo, prova e `fallimento`, ma nessuna campagna li usa. Regole pratiche prese da StS2:
  - ogni scelta ha un costo o un rischio, e manca l'opzione "prosegui senza niente", oppure ha anche lei un prezzo (es. "ignorate il mendicante" → maledizione minore);
  - almeno uno scambio fra risorse diverse: Scudi ↔ HP massimi, oggetto ↔ reliquia, HP ↔ statistica;
  - una scelta "rischiosa" con la prova, che sfrutta statistiche diverse da quelle del combattimento (Intelligenza e Fede, oggi usate poco fuori dalle prove);
  - un evento che cambia con lo stato (serve un campo `se` nella scelta, es. "solo se un eroe è caduto", "solo se c'è Ofelia"): richiede codice, ma è il modo più economico per ottenere la "reattività" di Hades.
- **Eventi legati all'eroe.** Una scelta disponibile solo se nel party c'è un certo eroe ("Caino riconosce il simbolo…") dà la sensazione che i membri della famiglia contino nella storia. Basta un campo `richiedeEroe` con l'id dalla libreria. Costo basso, effetto forte su una campagna privata.
- **La sconfitta che conta.** Oggi la sconfitta cancella lo slot e mostra il riepilogo (`mostraRiepilogo`). Proposte:
  1. un epitaffio del narratore nel riepilogo, scelto da chi è caduto per primo, dal nemico che ha sconfitto il party e dal nodo raggiunto;
  2. una "cronaca della famiglia" (in `localStorage`, come il Compendio): elenco delle spedizioni con caduti, nemesi e il punto più lontano raggiunto, consultabile dal menu, il "memoriale" alla Darkest Dungeon;
  3. una piccola eredità narrativa (non numerica), alla Hades: dopo una sconfitta contro un boss, la partita seguente apre con una trama diversa ("Ricordate ancora gli occhi del…"). Basta un segnale salvato e un nodo `story` alternativo.
- **Eredità meccanica** (sbloccare cose dopo una sconfitta): possibile, ma cambia il bilanciamento misurato da `tests/difficolta.test.js`. Da valutare a parte.
- **Il tono dei testi.** I testi attuali sono lunghi e informativi (lore). DD funziona con frasi brevi e taglienti, e la narrazione arriva dal narratore. Consiglio: un "titolo" di una riga, alla DD, prima del paragrafo di successo o fallimento, così chi salta il testo riceve comunque il tono.

### Gaps
- Talk di Kasavin alla GDC su Hades (es. sulla narrativa reattiva) non trovato o letto; le citazioni sono di seconda mano.
- Nessuna fonte diretta sulla scrittura degli eventi di FTL o di StS1 (Casey Yano non ne parla nelle fonti trovate).
- Inkle: non cercato per limite di tempo.

## 3. Personaggi che sono persone vere (la famiglia): attaccamento e rischi

### Takeaway
Dare ai personaggi i nomi di persone vere moltiplica l'attaccamento e il peso della perdita: in XCOM i giocatori lo fanno da soli. Ma in Slay the Dig la persona vera spesso è al tavolo e gioca "se stessa". Il rischio diventa sociale: il "mio" eroe è debole, muore per primo, ha un ritratto da ferito che non piace.

### Cited Findings
- **XCOM.** Secondo Jake Solomon i fan del gioco originale consigliavano ai nuovi giocatori di dare ai soldati i nomi degli amici, sapendo che sarebbero morti, e questo faceva parte del divertimento. — [GamingBolt](https://gamingbolt.com/aftermath-xcom-enemy-unknown-interview-with-jake-solomon) (dal riassunto di ricerca)
- **La morte deve essere irreversibile.** Solomon, in un'intervista a Wired: la morte nei giochi significa qualcosa solo se è irreversibile come quella reale, e la morte permanente dà timore e un vero senso di perdita. — riportato nei risultati di ricerca; URL di Wired non recuperato, da verificare
- **Bastano i soprannomi.** I soprannomi casuali di XCOM sono "totally meaningless" ("del tutto privi di significato"), eppure rendono i soldati più vivi e il loro destino più importante. — [New Statesman](https://www.newstatesman.com/?p=132668)
- **Il legame visivo.** Darkest Dungeon cercava il legame con i personaggi anche con la vista di lato (vedi sezione 1). — [Wikipedia](https://en.wikipedia.org/wiki/Darkest_Dungeon)

### Inferences (mio giudizio)
- **Il caso di Slay the Dig è opposto a XCOM.** Lì chi muore è un amico in un gioco che giochi tu; qui (partita online, `stato.onlineOwners`) il giocatore spesso comanda proprio il suo eroe. Il fallimento colpisce l'identità della persona, non un'"unità". Regole consigliate:
  - **Nessun eroe deve sembrare "il più debole".** Le statistiche iniziali sono equilibrate (somma 7, 4 HP, 1 Danno), bene. Ma il valore percepito sta nelle abilità: va verificato con il simulatore che ognuna delle due abilità di ogni eroe abbia un valore vicino (il simulatore stima già gli effetti, `simSpecialsValue`).
  - **Ritratti da ferito "eroici", non umilianti.** Ammaccati e determinati, non ridicoli: la persona vera li vede.
  - **Cadere non deve voler dire "non giocare".** Un eroe a terra in partita online toglie al giocatore tutto il resto della serata. Proposte: il giocatore di un eroe caduto può ancora fare qualcosa (votare, scegliere il bersaglio dell'Aiuto, un'azione "Incita" da terra che dà +1 al tiro di un alleato una volta per scontro), oppure un "colpo di grazia" più raro (il medico c'è già). È una scelta di design esplicita: meno punitivo di DD, coerente con il motto di Hades "take the sting out of failure".
  - **Battute e abilità che citano la persona** (es. "Orgoglio di mamma" di Ottavio, "Lista dei torti" di Pancrazio) sono già il punto più forte del gioco: è identità del personaggio fatta con le meccaniche. Continuare così: ogni passiva dovrebbe essere riconoscibile come "lui o lei", non un numero (es. `bonus_forza` / `bonus_hp` sono generiche e andrebbero evitate per i membri della famiglia).
  - **Lore di famiglia contro canone del gioco.** La memoria del progetto segnala fatti canonici in `lore/` che contrastano col gioco. Un errore sulla persona vera pesa più di uno sulla lore inventata: farli verificare dalla famiglia.

### Gaps
- Nessuna fonte di game design trovata specificamente su giochi con personaggi basati su persone reali presenti al tavolo (vicino al gioco di ruolo da tavolo fra amici). Le osservazioni sopra sono mie.
- Schell (*The Art of Game Design*) e Sylvester (*Designing Games*) non consultati direttamente (libri, nessun testo online letto).

## 4. Differenziare gli eroi con poche statistiche e un'abilità: ruoli, asimmetria, sinergie

### Takeaway
DD, Into the Breach e Gloomhaven differenziano con ruoli e posizioni o con squadre pensate come insieme. In Slay the Dig le statistiche quasi uguali (somma 7, 4 HP) lasciano tutta l'identità all'unica abilità e ai pochi punti di differenza. Servono ruoli espliciti e sinergie dichiarate fra eroi.

### Cited Findings
- **DD: ruoli dalla posizione.** I ruoli nascono dalla posizione: davanti mischia forte e più danni subiti, dietro attacchi più deboli ma protezione; i nemici spostano gli eroi. — [Wikipedia](https://en.wikipedia.org/wiki/Darkest_Dungeon)
- **Into the Breach: squadre da combinare.** 8 squadre sbloccabili e moltissime combinazioni; Ma ama combinazioni strane (tutti Swap Mech). Il design deterministico rende le combinazioni leggibili e pianificabili. — [Cliqist](https://cliqist.com/2018/03/06/into-the-breach-building-a-better-mech-with-subset-games-justin-ma/); [PC Gamer](https://pcgamer.com/into-the-breach-preview)

### Inferences (mio giudizio)
- **Oggi.** La differenza fra Curio (4/1/2) e Caino (3/3/1) è di un punto: in combattimento conta soprattutto la Forza. Il ruolo vero arriva dall'abilità scelta. Le meccaniche di squadra esistono già (Aiuta, Difendi, il Colpo d'Odio che attira chi difende, `helpDmgBonus` di Astarte), quindi i ruoli tank / supporto / attaccante sono possibili ma non dichiarati.
- **Proposte.**
  1. **Etichetta di ruolo** per eroe (es. "Bastione", "Lama", "Sostegno", "Astuto"): un campo `ruolo` nella libreria, mostrato in creazione del party e sulla carta. Costo minimo, aiuta chi non conosce i numeri a fare una compagnia equilibrata.
  2. **Asimmetria più forte di 1 punto**: un eroe con 5 HP e 0 Intelligenza, uno con 3 HP e 2 Danno. Più rischioso per il bilanciamento, ma lo controllano `tests/difficolta.test.js` e `tools/difficolta.mjs`.
  3. **Sinergie dichiarate**: passive del tipo "se X Aiuta questo eroe, +1 in più" o "quando un alleato Difende, +1 al tuo attacco". Con gli effetti speciali basta un `se` nuovo (es. `alleato_ha_difeso`, `aiutato_da`). Per una famiglia, i legami di parentela possono diventare sinergie ("Fratelli": +1 se entrambi nel party), creando storia senza testo.
  4. **Statistiche fuori dal combattimento.** Intelligenza e Fede contano per le prove e la preghiera: gli eventi con `scelte` devono chiederle spesso, così l'eroe "debole in combattimento" ha il suo momento (la "nicchia" di ognuno).
- **Le rune di Alastorta** sono il modello di come dare profondità a un solo eroe senza nuove statistiche; non va esteso a tutti (complessità per chi non gioca spesso).

### Gaps
- Gloomhaven (asimmetria delle classi, carte a doppio uso) non cercato per limite di chiamate.
- Nessuna fonte diretta di Into the Breach su come furono progettate le squadre come insieme; il materiale trovato è indiretto.

## 5. Feedback e "juice" al servizio del tono

### Takeaway
"Juice it or lose it" e "The art of screenshake" mostrano che piccoli effetti (scossa dello schermo, attenuazioni, squash and stretch) fanno sembrare vivo un prototipo identico nelle regole. Per un tono gotico e di logoramento il juice deve andare sul peso del colpo subito e sulla gravità della perdita, non sull'euforia.

### Cited Findings
- **"Juice it or lose it".** Jonasson e Purho (2012, Nordic Game; le fonti non concordano sull'evento esatto) mostrarono dal vivo un Breakout che "prende vita" aggiungendo effetti: colori, funzioni di attenuazione (easing), squash and stretch, scossa dello schermo per l'impatto. — [RPG Playground](https://rpgplayground.com/?p=3339)
- **"The art of screenshake".** Il talk di Jan Willem Nijman (Vlambeer) venne dopo, a INDIGO 2013 secondo una fonte; data ed evento non sono certi. — [RPG Playground](https://rpgplayground.com/?p=3339)
- **La critica.** Folmer Kelly, alla GDC Europe, sostenne che troppa rifinitura può costare immersione. — [Game Developer](https://gamedeveloper.com/design/video-is-your-game-juicy-enough-)

### Inferences (mio giudizio)
- Slay the Dig ha già molto juice: GSAP sulle catene, numeri fluttuanti, il banner dell'esito (`showRollBanner`), la cinematica d'attacco, i passaggi a tema, le animazioni rapide. Il rischio non è la mancanza ma l'**uniformità di tono**: ogni cosa rimbalza e brilla.
- **Proposte per il tono.**
  1. scossa dello schermo e un breve lampo rosso, più forte quando un eroe passa a ferito (con il cambio di ritratto) e quando cade: il momento più "DD" del gioco merita il feedback più forte, insieme alla frase dell'eroe e del narratore (sezione 1);
  2. un **silenzio** quando un eroe cade: la musica si abbassa per 1-2 secondi (il sistema della dissolvenza incrociata in `js/audio.js` lo permette);
  3. leggibilità: l'intenzione del nemico è solo un'icona (testo al passaggio del mouse); sul telefono il passaggio del mouse non c'è. Mostrare un numero di danni previsto vicino all'icona aiuta più di altri effetti (principio di Into the Breach: informazione deterministica e leggibile).
- Rispettare "Animazioni rapide" e "animazioni spente" per ogni nuovo effetto (`animTime`).

### Gaps
- Testi o trascrizioni dei due talk non letti (solo riassunti di seconda mano). Nessuna fonte su "juice" specifico per i toni horror o gotici.
