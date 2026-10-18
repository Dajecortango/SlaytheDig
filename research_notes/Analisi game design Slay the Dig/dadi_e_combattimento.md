# Dadi, casualità e decisioni di combattimento in Slay the Dig

Fatti del gioco letti nel codice (non da fonti esterne):
- `DICE_BAG = { size: 6, ones: 1, sixes: 1 }` (`js/regole.js`): ogni blocco di 6 tiri di un eroe ha esattamente un 1, un 6 e quattro valori casuali fra 2 e 5, mescolati (`newDiceBlock` in `js/motore/tiri.js`). Il sacchetto è per eroe e salvato con la partita.
- `naturalRollSuccess`: un 6 riesce sempre e un 1 fallisce sempre, quindi ogni tiro ha fra il 17% e l'83% (`rollChance` limita il valore richiesto fra 2 e 6).
- Numeri della libreria: CA dei nemici quasi sempre 7-8 (24 nemici a 7, 35 a 8, 4 a 9), Attacco dei nemici 7 (63 su 67), danno dei nemici 1-3 (in gran parte 1-2), vita dei nemici 7-22. Eroi: 4 HP, danno 1, Forza da 1 a 5 (in gran parte 3).
- Quindi Attacca con Forza 3 contro CA 8 serve 5+ = 33%; con Forza 1 serve un 6 = 17%; con Forza 5 contro CA 7 serve 2+ = 83%. Difendi e Aiuta tirano contro l'Attacco del nemico (7): con Forza 3 serve 4+ = 50%.
- Difendi riuscito dà `1 + def_armor` armatura; Aiuta riuscito dà `stato.helpBonus = 1` (+1 al prossimo attacco o abilità, un solo uso, azzerato a ogni round).
- L'intenzione del nemico (`enemyIntentHtml` in `js/combattimento.js`) mostra sempre la stessa icona a spada (o teschio se stordito, o la classe `stunned` se si prepara); il testo con bersaglio e danni si legge solo passandoci sopra.

---

## 1. Casualità in entrata e in uscita: dove si colloca il gioco e quali rischi ha l'uscita su un d6 piatto

### Takeaway
Slay the Dig è quasi tutto casualità in uscita (si sceglie l'azione, poi il d6 decide), proprio il tipo che Burgun considera dannoso nei giochi di strategia e che Subset ha tolto da Into the Breach. Con 4 HP, danno 1 e probabilità del 33-50% sulle azioni più comuni, l'uscita pesa moltissimo sull'esito; il rimedio non è eliminarla ma spostarne una parte "in entrata" (dadi visti prima di scegliere, intenzioni precise).

### Cited Findings
- Burgun: "Output randomness is noise injected between the player's decision and the outcome"; l'entrata invece "informs the player before he makes his decision" (generazione della mappa, carte scoperte). Tesi: la casualità in uscita "does not belong in a strategy game" — [Game Developer, Keith Burgun, "Randomness and Game Design"](https://gamedeveloper.com/design/randomness-and-game-design)
- Burgun: la casualità in uscita "obscure[s] the outcome" e ritarda l'apprendimento, perché il giocatore attribuisce a sé esiti che non ha causato; crea "the appearance of depth" ma "does not increase the depth of a game". Cita esplicitamente il tiro per colpire e "the random number generation combat in X-Com or FTL". Una serie di colpi mancati può decidere uno scontro su cui il giocatore non ha potuto influire — [Game Developer, Burgun](https://gamedeveloper.com/design/randomness-and-game-design)
- Burgun ammette che l'entrata troppo vicina alla decisione, senza tempo per pianificare, si comporta come l'uscita — [Game Developer, Burgun](https://gamedeveloper.com/design/randomness-and-game-design)
- Burgun tratta entrata e uscita come un continuo, non come due categorie nette; ha coniato anche l'"information horizon", la distanza tra il turno attuale e il momento in cui un'informazione diventa nota — riassunto in [Game Developer, "how randomness contributes to strategic thinking"](https://www.gamedeveloper.com/design/how-randomness-contributes-to-strategic-thinking) e nella trascrizione GMTK su [Amara](https://amara.org/videos/C3IIn1JRUBXt/en/3102783) (riassunti di ricerca, testo integrale non verificato)
- Critica a Burgun: un altro autore sostiene che il rifiuto generale dell'uscita ignora un valore reale, perché la casualità contribuisce al pensiero strategico (gestione del rischio) — [Game Developer, "how randomness contributes to strategic thinking"](https://www.gamedeveloper.com/design/how-randomness-contributes-to-strategic-thinking)
- Game Maker's Toolkit, "The Two Types of Random in Game Design" (stagione 6, ep. 1, 14 gennaio 2020): entrata = prima che il giocatore agisca, tipica dei roguelike con livelli generati; uscita = dopo la decisione, risolta con un tiro — [Kotaku](https://kotaku.com/randomness-in-video-games-is-not-all-the-same-1841049263); [Amara (trascrizione)](https://amara.org/en-gb/videos/C3IIn1JRUBXt)
- Dal video (secondo un riassunto): i giocatori capiscono meglio le probabilità con oggetti fisici, come un dado, che con una percentuale scritta — [Indieklem Substack](https://indieklem.substack.com/p/18-how-to-design-better-randomness) (fonte secondaria)
- Subset Games su Into the Breach: "We prefer games with clear rulesets, and were interested in pursuing something with less randomness than FTL"; "We wanted to make something where every death felt like your own fault", che "lead us to use of telegraphed enemy attacks as a core mechanic"; "the limited reliance on random chance ... helps make the player feel in control" — [Game Developer, Road to the IGF: Into the Breach](https://www.gamedeveloper.com/game-platforms/road-to-the-igf-subset-games-i-into-the-breach-i-)
- Matthew Davis (Subset): i tattici si appoggiano molto al caso, FTL compreso; l'obiettivo era essere più deterministici nel momento per momento — [PC Gamer, anteprima](https://pcgamer.com/into-the-breach-preview)
- Justin Ma: l'unico elemento casuale del combattimento è "Resist", con probabilità tenute molto basse perché i giocatori non ci contassero; aggiunto perché il finale non finisse "with a whimper rather than a bang" — [Cliqist](https://cliqist.com/2018/03/06/into-the-breach-building-a-better-mech-with-subset-games-justin-ma/)
- Dicey Dungeons mette i dadi "sotto i riflettori" invece di nascondere il generatore; il dado è casuale ma il giocatore decide come usarlo — [PC Gamer, recensione](https://www.pcgamer.com/au/dicey-dungeons-review); [A.V. Club](https://avclub.com/gambling-s-a-hell-of-a-lot-more-fun-with-dice-that-can-1837692384). Un autore di giochi di ruolo lo descrive come casualità in entrata: si agisce sui dadi tirati — [itch.io](https://itch.io/blog/849411/how-dicey-dungeons-inspired-my-ttrpg.amp). Una recensione contraria lo trova "hollow and random", senza vero controllo — [Janneke Parrish](https://jannekeparrish.com/game/dicey-dungeons/)

### Inferences
- (Giudizio mio) Slay the Dig sta quasi all'estremo "uscita": ogni azione di scontro (Attacca, Difendi, Aiuta, gran parte delle abilità) è un d6 tirato dopo la scelta. L'entrata c'è solo a livello di mappa (nodi, bottino, mercante) e nell'intenzione del nemico.
- (Giudizio mio) Rischio specifico: con 4 HP e danni nemici da 1-3, due colpi mettono fuori un eroe; con un 33-50% di riuscita, due o tre fallimenti di fila (normali con quelle probabilità) decidono lo scontro: è proprio il caso "una serie di colpi mancati decide il combattimento" di Burgun. Il sacchetto attenua solo gli estremi (1 e 6), non le serie di 2-4 che falliscono.
- (Giudizio mio) L'apprendimento è oscurato: un giocatore non distingue facilmente "ho scelto male" da "ho tirato male", perché Forza 3 contro CA 8 fallisce 2 volte su 3 qualunque cosa faccia.
- Soluzioni concrete (mie, ispirate alle fonti):
  1. **Spostare il dado in entrata**: il sacchetto esiste già e `peekHeroDice` legge i prossimi valori; mostrare il prossimo dado di ogni eroe (o tirare all'inizio del round e lasciare scegliere poi l'azione e chi la fa, come in Dicey Dungeons) trasforma il tiro in un'allocazione: "chi ha il 5 attacca, chi ha il 2 aiuta". È il cambiamento con più leva e usa codice esistente.
  2. **Mezza entrata**: mostrare solo il prossimo dado di un eroe con una reliquia/abilità ("Presagio"), come premio.
  3. **Intenzione più deterministica** (vedi domanda 4) per dare al giocatore qualcosa di certo su cui pianificare, come Into the Breach.

### Gaps
- Non ho la trascrizione completa del video GMTK né del GDC 2019 di Davis ("Into the Breach Design Postmortem", [GDC Vault](https://www.gdcvault.com/play/1026333/contactUs)); le loro argomentazioni oltre le definizioni non sono verificate.
- Il post di Burgun "Three types of bad randomness, and one good one" è risultato irraggiungibile (404).

---

## 2. Casualità "giusta" e percezione delle probabilità: il sacchetto dei dadi è una buona idea?

### Takeaway
Le fonti concordano che i giocatori non percepiscono le probabilità in modo matematico e che i giochi di successo correggono le serie sfortunate (Civilization, XCOM, Dota, Tetris). Il sacchetto di Slay the Dig è una versione "a blocchi" stile Tetris 7-bag: ben motivato, ma con blocchi di 6 tiri controlla solo 1 e 6, è prevedibile (contare le carte) e non tocca il problema principale, che sono i fallimenti sui 2-5.

### Cited Findings
- Sid Meier, GDC 2010 "The Psychology of Game Design (Everything You Know Is Wrong)": i giocatori di Civilization Revolution erano entusiasti di vincere a 3 contro 1, e altrettanto a 1 contro 3; perdere a 2 contro 1 spesso non dava fastidio, ma a 20 contro 10 si arrabbiavano: "It's 20-to-10! I should win! It's a big number!". Conclusione: il sistema non poteva basarsi solo sulla matematica. Meier la chiama "The Winner Paradox": "In the world of games, you almost always win" — [Game Informer](https://gameinformer.com/b/news/archive/2010/03/12/sid-meier-gamers-arent-logical)
- Stesso keynote: i giocatori "expect to win battles at rates far greater than the odds they face"; la psicologia del giocatore va prima della "reality of the simulation"; "the rules of play aren't always the same as the rules of life" — [The Strong Museum of Play](https://www.museumofplay.org/blog/gdc-2010-game-psychology-101/); gameplay come "esperienza psicologica" — [VentureBeat](https://venturebeat.com/2010/03/12/quotes-from-sid-meiers-keynote-gdc-speech)
- XCOM: Enemy Unknown: Jake Solomon disse a Rock, Paper, Shotgun che probabilmente avrebbe dovuto aggiungere un'opzione per i risultati fissi (il seme che rende il tiro uguale dopo un caricamento), confrontandolo con Civilization che lascia scegliere — [Softpedia](https://games.softpedia.com/blog/Lead-XCOM-Designer-Regrets-Fixed-Hit-Chance-Results-319573.shtml)
- XCOM: il lead designer Ananda Gupta (non Solomon) disse che su Normale e Facile c'è "a bad streak breaker", in pratica un modificatore di "fortuna" nascosto che può superare la percentuale mostrata; Enemy Within aggiunse l'opzione "Save Scum" che cambia il seme a ogni caricamento — [GameBanshee](https://www.gamebanshee.com/news/112504-xcom-enemy-within-adds-qsave-scumq-option.html). Nota: l'idea popolare che "Solomon ammise di mentire sulle percentuali" non è sostenuta da queste fonti.
- XCOM 2 (fonti di comunità, non ufficiali e in disaccordo fra loro): aiuto alla mira nascosto per i tiri dal 50% in su, con tetto al 95%, non su Leggendario; bonus dopo un colpo mancato di +10 (Recluta, Veterano) e +15 (Comandante); moltiplicatore 1,2 su Recluta e 1,1 su Veterano — [Steam, discussione](https://steamcommunity.com/app/268500/discussions/0/2944746708998250511); [Nexus Mods, Enhanced Hit Chance Display](https://www.nexusmods.com/xcom2/mods/212)
- Dota 2 (ereditato dal motore di Warcraft III): distribuzione pseudo-casuale, al tentativo N dopo l'ultimo successo P(N) = C × N; ogni fallimento alza la probabilità del successivo; vale per tutti i colpi critici; i tentativi che non possono attivarlo non fanno avanzare il contatore — [Liquipedia, Random Distribution](https://liquipedia.net/dota2/Random_Distribution); [Dota 2 Wiki, Pseudo-random distribution](https://dota2.fandom.com/wiki/Pseudo-random_distribution). Il motore di WC3 ha valori di C errati ai livelli alti — [Diplograph](https://diplograph.net/notes/games/randomness/dota-2-prd)
- Tetris, "Random Generator" (7-bag) della Guideline: ogni pezzo esce una volta ogni 7, quindi la siccità massima è di 13 pezzi; con il casuale puro non c'è limite — [Towson student page](https://wpstudents.towson.edu/bbenlo1/?p=34); [Gamertag Mythras](https://gamertagmythras.com/blog/tetris/tetris-randomizers-explained) (fonti secondarie; testo ufficiale della Guideline non trovato). Una tesi del 2019 conclude che il 7-bag riduce siccità e inondazioni rispetto al casuale puro — [Repository UNSRI](https://repository.unsri.ac.id/16293/)
- Effetto collaterale del 7-bag, discusso dalla comunità dei randomizer: diventa prevedibile e i giocatori esperti lo sfruttano contando i pezzi — [Tetris Concept, Randomizer Theory](https://tetrisconcept.net/threads/randomizer-theory.512/page-13) (forum; dettaglio non verificato riga per riga)

### Inferences
- (Giudizio mio) Il sacchetto risponde esattamente al problema di Meier (serie che sembrano "ingiuste") ed è trasparente nella media (1 e 6 escono 1/6 come un dado vero). Bene.
- (Giudizio mio) Limiti:
  1. **Controlla la cosa sbagliata.** Con CA 7-8 e Forza 3 il successo dipende da 4/5/6, non dal solo 6. I valori 2-5 restano casuali puri (`2 + floor(rng()*4)`), quindi tre fallimenti di fila restano frequenti (con 33%: circa 30% di probabilità su tre tiri). La frustrazione "20 contro 10" di Meier nasce dai fallimenti con percentuale mostrata alta, non dagli 1.
  2. **Contare i dadi.** Con blocchi di 6 e un 6 per blocco, chi ha già visto il 6 sa che non tornerà fino al blocco seguente, e dopo il 1 sa che non avrà più fallimenti garantiti; il giocatore attento può scegliere quando fare l'azione rischiosa. Non è tracciabile facilmente perché i blocchi non sono annunciati e il sacchetto è per eroe, ma un giocatore metodico (o il telefono, che riceve i prossimi valori con `peekHeroDice`/`requestRemoteRoll`) può farlo. Non è grave in un gioco cooperativo per amici, ma va deciso se è un segreto o una meccanica.
  3. **Il sacchetto attraversa gli scontri, le prove e la preghiera**: un 6 "speso" in una prova irrilevante manca nello scontro dopo. È una dipendenza invisibile.
  4. **Anteprime**: il codice dice che `rollChance` "ne tiene conto" solo nei limiti 17-83%; la percentuale mostrata non cambia con lo stato del sacchetto, quindi è onesta in media ma non condizionata. Questo è il modello "Civilization/Tetris" (onesto), non il modello XCOM (aiuto nascosto). Va bene.
- Soluzioni concrete (mie):
  1. **Contatore di sfortuna alla Dota/XCOM sulla riuscita, non sul valore**: dopo ogni fallimento di un eroe, +1 nascosto o dichiarato al prossimo tiro (azzerato al successo). Dichiararlo ("Ostinazione +1") lo rende una meccanica leggibile anziché un trucco.
  2. **Sacchetto più grande o più "pieno"**: per esempio blocchi di 12 con due 1, due 6 e i valori 2-5 bilanciati (tre di ciascuno) invece che casuali: limita anche le serie di 2-3. Rende però il conteggio più efficace.
  3. **Rendere il sacchetto una meccanica esplicita** (mostrare quanti 6/1 restano nel blocco): trasforma il conteggio in decisione, coerente con la soluzione "dado in entrata" della domanda 1.
  4. Separare il sacchetto dello scontro da quello di prove e preghiera, se si vuole che una prova non "consumi" i 6 dello scontro.

### Gaps
- Nessuna fonte primaria trovata su Hearthstone e pseudo-casualità; i valori di C di Dota non sono stati estratti.
- Le regole nascoste di XCOM 2 vengono da file di configurazione citati dalla comunità, non da Firaxis.
- Non ho trovato studi che misurino quanto i giocatori notino o sfruttino un sacchetto di dadi come quello del gioco.

---

## 3. d6 piatto con piccoli modificatori: granularità, 6/1 automatici, precisione limitata, sistemi con pochi HP

### Takeaway
Il gioco adotta di fatto una "bounded accuracy" estrema: bersagli quasi fissi (CA 7-8, Attacco 7) e bonus piccoli, con il pregio che ogni +1 conta molto (16,7%) e il difetto che non c'è spazio per gradazioni fini e che il 6/1 automatico rende ogni scontro sempre un po' aleatorio. Con 4 HP la varianza dei d6 decide più di quanto la scelta tattica possa compensare.

### Cited Findings
- Bounded accuracy (D&D Next/5e): contiene la crescita costante dei bonus ai tiri delle edizioni precedenti; il bonus di competenza arriva solo a +6 al 19° livello, così i tiri per colpire restano significativi e l'armatura non diventa inutile — [DMDavid, "Proficiency and bounded accuracy in D&D Next"](https://dmdavid.com/tag/proficiency-and-bounded-accuracy-in-dd-next/). Nasce come reazione a 3e/4e, dove i bonus enormi rendevano difficile fissare le CD ai livelli alti — [stessa fonte](https://dmdavid.com/tag/proficiency-and-bounded-accuracy-in-dd-next/). Discussione della rubrica di Mearls — [EN World](https://www.enworld.org/threads/legends-lore-a-few-rules-updates.352225/)
- Su un d20 ogni +1 vale il 5%; vantaggio (tirare due volte e tenere il migliore) dà p(2−p), svantaggio p²; vale circa +5 a metà scala (serve 11+) e solo circa +1 agli estremi; in media circa +3,3 — [EN World, "Advantage vs Disadvantage: What's the Math?"](https://www.enworld.org/goto/post?id=6958881); [RPG Stack Exchange (copia)](https://backiee.wasmer.app/https_rpg_stackexchange_com/a/148690)
- Burgun: la probabilità di un dado non offre altro da esplorare: "There is literally nothing else to know or explore" — [Game Developer, Burgun](https://gamedeveloper.com/design/randomness-and-game-design)

### Inferences (tutte mie, calcolate sui dati del gioco)
- **Granularità**: con un d6 i soli valori possibili di riuscita sono 17/33/50/67/83%. Ogni +1 di Forza vale il 16,7%, cioè più di tre punti di un d20. Conseguenze: (a) un oggetto da +1 al tiro è enorme, uno da +2 trasforma un 33% in 67%; (b) il bilanciamento ha pochi gradini, un nemico da CA 8 invece di 7 toglie un sesto di successi a tutti; (c) i bonus oltre il limite si sprecano: con Forza 5 contro CA 7 serve 2+, e +1 in più non vale nulla perché l'1 fallisce comunque. Il simulatore dovrebbe già "vederlo", ma i giocatori no.
- **6/1 automatici**: con target 7-8 e Forza 1-5 i casi agli estremi sono frequenti (Forza 1 contro CA 8 = solo il 6). Il 6 automatico tiene vivo l'eroe debole (bene per un gioco cooperativo in famiglia); l'1 automatico fa sì che un eroe al massimo non superi mai l'83%. È una scelta di tono (Darkest Dungeon), ma unita a 4 HP significa che nessuno scontro è "sicuro".
- **Pochi HP + danno fisso piccolo**: eroi a 4 HP contro danni 1-3, nemici a 10-22 HP contro danno degli eroi 1 (più bonus): lo scontro dura molti round, con molti tiri degli eroi (la legge dei grandi numeri smussa il lato eroi), ma pochi colpi nemici bastano a far cadere qualcuno (il lato nemico resta molto variabile perché ogni colpo pesa il 25-75% della vita). L'asimmetria rende la varianza concentrata proprio dove fa più male: la caduta degli eroi.
- Rischio: un'"oscillazione" eccessiva in un sistema a pochi HP fa sentire le sconfitte come sfortuna (contro l'obiettivo "ogni morte è colpa tua" di Into the Breach).
- Soluzioni concrete:
  1. **Due dadi, tieni il migliore/peggiore come moneta principale dei bonus** (il motore lo sa già fare: `dice: 2` e `rollChance(…, twoDice, worst)`). Con un d6 il "vantaggio" vale di più a metà scala (serve 4+: 50% → 75%) e quasi nulla agli estremi, quindi è un bonus che non si spreca come il +1 oltre il limite. Usarlo per Aiuta (al posto del +1) e per alcune reliquie evita lo spreco dei +N quando l'eroe è già al 2+.
  2. **Convertire l'eccesso**: se il totale supera la soglia di 3 o più, +1 danno (o un effetto). Così Forza alta non è sprecata ed esiste un "colpo pieno" vs "colpo di striscio".
  3. **2d6 al posto di 1d6** per i tiri importanti (curva a campana, 2-12): ogni +1 vale fra il 3% e il 17% a seconda del punto, più gradini, meno estremi. Costo: cambiano tutti i numeri del bilanciamento e la regola 6/1 va ripensata (doppio 6/doppio 1).
  4. Se si tiene il d6: considerare **togliere il fallimento automatico sull'1 almeno in difesa** (un eroe molto forte che difende è il caso in cui il fallimento automatico è più frustrante), oppure far valere l'1 come "fallimento con costo" (vedi domanda 6).

### Gaps
- Non ho trovato la rubrica originale "Bounded Accuracy" di Mearls; le citazioni sono di fonti secondarie.
- Non ho trovato fonti pubblicate specifiche sul d6 piatto a pochi HP nei videogiochi (Darkest Dungeon usa percentuali, non d6); le considerazioni sono mie.

---

## 4. Intenzione del nemico mostrata in anticipo: valore, e se l'icona che nasconde il testo fa danno

### Takeaway
Il segnale anticipato delle intenzioni è il fondamento di Into the Breach e la firma di Slay the Spire: dà al giocatore informazione certa da usare, cioè casualità "in entrata". In Slay the Dig l'icona è sempre la stessa spada, quindi a colpo d'occhio non comunica nulla: il valore sta tutto in un testo che va cercato col mouse (e che sul telefono o online è meno accessibile).

### Cited Findings
- Into the Breach: gli attacchi nemici segnalati in anticipo sono "a core mechanic" scelto perché "every death felt like your own fault" — [Game Developer, Road to the IGF](https://www.gamedeveloper.com/game-platforms/road-to-the-igf-subset-games-i-into-the-breach-i-)
- In Into the Breach si vedono tutte le intenzioni nemiche e, passando sopra un pulsante, l'ordine esatto in cui tutto avverrà; a parte la comparsa delle creature, l'unico elemento casuale è "Resist" — [Giant Bomb, recensione utente](https://giantbomb.com/user-reviews/uid/8831/into-the-breach-a-gem-of-constrained-design); [Cliqist](https://cliqist.com/2018/03/06/into-the-breach-building-a-better-mech-with-subset-games-justin-ma/)
- Slay the Spire 2: quando un nemico ha più intenzioni, gli indicatori sono messi uno accanto all'altro invece che sovrapposti come nel primo gioco (guida per giocatori, non fonte degli sviluppatori) — [Untapped.gg](https://sts2.untapped.gg/guides/how-to-read-enemy-intent)
- Burgun: l'"information horizon" (quanto in anticipo un'informazione è nota) misura quanto si può pianificare; un'informazione rivelata troppo vicino alla decisione funziona come casualità in uscita — [Game Developer, Burgun](https://gamedeveloper.com/design/randomness-and-game-design)

### Inferences
- (Giudizio mio, da codice) `enemyIntentHtml` usa sempre `svgIcon('sword')` per attacco, colpo ad area, preparazione, preda annunciata; solo lo stordimento cambia icona. Slay the Spire comunica tipo (attacco/difesa/buff/debuff) e numero (danno × colpi) nell'icona stessa, leggibili senza passare il mouse. Qui l'informazione esiste ma è nascosta: il giocatore occasionale (famiglia, telefono) non la userà, e la decisione Difendi/Aiuta/Attacca perde la sua base.
- (Giudizio mio) Il valore massimo dell'intenzione in questo gioco è indicare **chi** verrà colpito e **quanto**: con 4 HP la domanda "chi difende?" dipende interamente da questo. Se il bersaglio è scelto dopo (voto online, `announcedPrey` solo per alcune azioni), Difendi diventa un'ipotesi.
- Soluzioni concrete:
  1. Icona diversa per tipo (singolo, area/vicini, preparazione, cura/potenziamento, malus) e **numero del danno sempre visibile** accanto all'icona (es. "⚔ 2", "⚔ 1×3", "☄ 2 a tutti"); il testo lungo resta nel tooltip.
  2. Segnare sulla carta dell'eroe bersaglio un indicatore ("mirino") quando il bersaglio è noto, come le frecce di Into the Breach.
  3. Mostrare sempre la soglia di Difendi/Aiuta già presente nel testo ("devono arrivare a 7") come percentuale per eroe sui pulsanti (già c'è `showHitPreview`): verificare che compaia anche per Difendi e Aiuta.
  4. Fasi degli elite: rendere visibile la prossima soglia (tacche già presenti con `enemyPhaseTicksHtml`) con un'icona di cosa succederà, come il conto alla rovescia delle fasi a tempo (`nextTimedPhase`).

### Gaps
- Non ho trovato interviste di Mega Crit (Yano o Giovannetti) specifiche sul sistema delle intenzioni; il podcast "Think Like A Game Designer" #58 con Yano potrebbe parlarne ma non l'ho verificato — [Substack](https://justingarydesign.substack.com/p/casey-yano-designing-with-detail).

---

## 5. Decisioni significative in un menu di 4-5 azioni: Difendi e Aiuta sono dominati? Progetto delle fasi dei boss

### Takeaway
Una decisione è interessante se nessuna opzione domina e la scelta dipende dalla situazione (Sid Meier, ripreso ovunque). Nei numeri attuali Aiuta (+1 al prossimo tiro dopo un tiro riuscito al 50%) è quasi sempre peggiore di Attaccare, e Difendi vale solo quando l'intenzione dice che quell'eroe sta per essere colpito; il menu ha di fatto 1-2 scelte vere per round.

### Cited Findings
- Il criterio "interesting decisions" è attribuito a Sid Meier ("a game is a series of interesting decisions"), citato nei riassunti dei suoi keynote — [VentureBeat](https://venturebeat.com/2010/03/12/quotes-from-sid-meiers-keynote-gdc-speech) (la frase esatta non è nel riassunto letto; vedi Gaps)
- Burgun: la casualità in uscita può dare "the appearance of depth" senza profondità; un tiro di dado non ha niente da esplorare — [Game Developer, Burgun](https://gamedeveloper.com/design/randomness-and-game-design)
- Blades in the Dark: posizione ed effetto si possono scambiare ("trade position for effect, or vice versa"), cioè il giocatore sceglie fra rischio e risultato prima del tiro — [Roll20 BitD, Effect](https://roll20.net/compendium/BITD/Effect); [bladesinthedark.com, Effect](https://bladesinthedark.com/effect)

### Inferences (mie, con conti sui dati del gioco)
- **Aiuta**: tiro contro l'Attacco del nemico (7); con Forza 3 il 50% di riuscita dà +1 al prossimo attacco (valore atteso: +0,5 × 16,7% = circa +8% di riuscita del compagno, quindi circa +0,08 colpi con danno 1). Attaccare direttamente con Forza 3 contro CA 8 dà 33% × danno 1 = 0,33 danni attesi. Aiuta rende circa un quarto di Attacca. Diventa conveniente solo se chi aiuta ha Forza molto bassa e chi riceve è ai margini del gradino (es. dal 5+ al 4+) e ha danno alto o un'abilità forte (con Astarte, `helpDmgBonus`). Quindi in generale **dominato**, salvo combinazioni.
- **Difendi**: 50% di +1 armatura (più `def_armor`); con danni nemici 1-2 un +1 armatura annulla metà o tutto un colpo, cioè 25-50% della vita dell'eroe. È buono **solo** se quell'eroe è il bersaglio annunciato; contro bersagli casuali o "tutti" vale molto meno. Il valore di Difendi dipende quindi interamente dalla leggibilità dell'intenzione (domanda 4). Se l'armatura dura fino al colpo successivo, è comunque un'opzione reale: questo è il caso sano "dipende dalla situazione".
- **Rischio di menu finto**: se Aiuta è quasi sempre inferiore, il giocatore impara a non usarlo; se Difendi conviene solo al bersaglio, ogni round si riduce a "il bersaglio difende, gli altri attaccano". Il simulatore Esperto (`simExpertAction`) può confermarlo: contare quante volte sceglie Aiuta.
- Soluzioni concrete:
  1. **Aiuta come vantaggio** (tira 2 dadi, tieni il migliore, al prossimo tiro dell'alleato): da 50% a 75% sul 4+, cioè +25 punti invece di +16,7, e non sprecato contro bersagli bassi; oppure Aiuta automatico (senza tiro) ma meno forte, per avere una scelta "sicura".
  2. **Aiuta che si accumula o si conserva** (dura fino all'uso, non scade a fine round) per dare un piano su più turni.
  3. **Difendi che protegge un altro eroe** ("Proteggi": prendi il colpo al suo posto) invece che solo sé stesso: la decisione diventa chi sacrifica cosa, molto più interessante con 4 HP. C'è già il Colpo d'Odio che "attira" chi difende: estenderlo come meccanica dell'eroe.
  4. **Successo parziale** sulle tre azioni base (vedi domanda 6): un tiro mancato di poco non è un turno perso.
  5. **Fasi dei boss**: soglie leggibili (tacche già presenti), annunciate un turno prima ("alla prossima ferita si infurierà"), con un effetto che chiede una risposta (preparazione → Difendi; aura → finire in fretta). Le fasi a tempo con conto alla rovescia sono il modello di Into the Breach: informazione certa sul futuro. Rischio: una soglia che scatta dopo un colpo e reagisce subito ("colpo in risposta", `eliteReaction`) punisce il giocatore per aver colpito bene e non è prevedibile se la tacca non dice cosa succede.

### Gaps
- Non ho trovato una fonte primaria con la citazione esatta di Meier "a game is a series of interesting decisions" (GDC 2012, "Interesting Decisions"), né le "lenti" di Jesse Schell citabili con URL: vanno considerate da verificare.
- Nessuna fonte esterna sul dominio di "Difendi/Aiuta" in giochi analoghi; il calcolo è mio.

---

## 6. Rimedi usati da altri giochi: vantaggio/svantaggio, manipolazione dei dadi, successo con un costo

### Takeaway
Tre famiglie di rimedi sono collaudate: (1) vantaggio/svantaggio (due dadi, tieni il migliore/peggiore), che il motore supporta già; (2) dadi tirati prima e assegnati dal giocatore (Dicey Dungeons), che trasformano la casualità da uscita a entrata e che il sacchetto rende facile; (3) il successo parziale "ci riesci, ma a un costo" (Blades in the Dark/PbtA), che con 4 HP riduce i turni a vuoto.

### Cited Findings
- Vantaggio/svantaggio: p(2−p) e p²; vale circa +5 su un d20 a metà scala, circa +1 agli estremi — [EN World](https://www.enworld.org/goto/post?id=6958881); [EN World, "The math of Advantage and Disadvantage"](https://www.enworld.org/goto/post?id=7523137)
- Blades in the Dark: con 4 o 5 sul dado più alto si ottiene un successo parziale: si fa ciò che si voleva ma a un costo (guai, danni, effetto ridotto); l'effetto è deciso a parte (limitato/standard/grande) — [Roll20 BitD, The Core System](https://roll20.net/compendium/BITD/The%20Core%20System); [Roll20 BitD, Action Roll](https://roll20.net/compendium/BITD/Action%20Roll)
- Stima informale: in BitD un 4/5 esce circa un terzo delle volte, il successo pieno circa metà — [G+ archive BitD](https://bitd.gplusarchive.online/?p=165841) (forum, non ufficiale)
- Dicey Dungeons: sistema a riserva di d6 con equipaggiamento che accetta dadi; il giocatore agisce sui dadi già tirati (casualità in entrata) — [itch.io](https://itch.io/blog/849411/how-dicey-dungeons-inspired-my-ttrpg.amp); [PC Gamer](https://www.pcgamer.com/au/dicey-dungeons-review)
- XCOM: l'opzione di seme fisso/non fisso e il "bad streak breaker" sulle difficoltà basse sono un rimedio "nascosto" alla sfortuna — [Softpedia](https://games.softpedia.com/blog/Lead-XCOM-Designer-Regrets-Fixed-Hit-Chance-Results-319573.shtml); [GameBanshee](https://www.gamebanshee.com/news/112504-xcom-enemy-within-adds-qsave-scumq-option.html)
- Dota: probabilità crescente dopo ogni fallimento (PRD) — [Liquipedia](https://liquipedia.net/dota2/Random_Distribution)

### Inferences (proposte mie per Slay the Dig, in ordine di costo)
1. **Fascia di successo parziale sul d6** (basso costo, alto effetto): mancare la soglia di 1 = "di striscio". Attacca: metà danno arrotondato in su o danno 1 ma il nemico risponde; Difendi: armatura +1 ma l'eroe perde il prossimo bonus; Aiuta: +1 solo al tiro e non al danno. In pratica sposta un sesto dei risultati da "niente" a "qualcosa a un costo", come il 4/5 di BitD. Con danno degli eroi 1 serve una regola chiara per "metà danno" (es. danno 1 → 1 ma il nemico guadagna +1 al prossimo attacco).
2. **Vantaggio come bonus standard di Aiuta, reliquie e benedizioni** (basso costo: `dice: 2` esiste): evita lo spreco dei +N oltre la soglia e dà un aumento più grande nella fascia centrale.
3. **Tiro all'inizio del round, dadi visibili e assegnabili** (costo medio): tutti gli eroi pescano dal sacchetto all'inizio del round (`peekHeroDice` già esiste); il giocatore vede i valori e decide chi attacca, chi difende, chi aiuta; eventualmente scambio di un dado fra due eroi con Aiuta. È il cambio che rende il menu davvero decisionale, perché la scelta dipende dai numeri visti e non dalla fortuna dopo.
4. **Contatore di ostinazione dichiarato** (basso costo): +1 al prossimo tiro dopo ogni fallimento, azzerato al successo; risponde a Meier senza nascondere nulla, a differenza del modello XCOM.
5. **Eccesso convertito in effetto** (basso costo): superare la soglia di 3 dà +1 danno o un effetto, così le statistiche alte non si sprecano sul limite dell'83%.
- Pericoli: (a) il tiro a inizio round rende inutili alcune reliquie "ritira" (`specialReroll`) o le rende troppo forti: vanno ripensate; (b) il successo parziale allunga gli scontri se aggiunge costi per il giocatore e non progresso: tenerlo dalla parte del giocatore; (c) ogni modifica cambia i numeri di difficoltà: il simulatore (`tools/difficolta.mjs`) va rieseguito e i margini `difficolta` delle campagne rivisti.

### Gaps
- Non ho trovato scritti di Terry Cavanagh sul progetto dei dadi di Dicey Dungeons; le affermazioni vengono da recensioni.
- Non ho trovato fonti su Mark Rosewater ("Making Magic") pertinenti a varianza e dadi in questa ricerca.
- Nessuna fonte su giochi di ruolo PbtA consultata oltre a Blades in the Dark (il 10+/7-9/6- di Apocalypse World non verificato con URL).
