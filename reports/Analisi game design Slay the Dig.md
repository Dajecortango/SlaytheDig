# Slay the Dig: mostrare di più, tirare meno alla cieca

Slay the Dig ha basi migliori della media dei roguelike fatti per hobby. Ha un sacchetto dei dadi che corregge la sfortuna in modo onesto, il bottino "scegline uno fra tre", una mappa procedurale con punti fissi ben messi, un simulatore che misura la difficoltà (cosa rara anche fra gli studi commerciali) ed eroi la cui identità nasce dalle persone vere della famiglia. Il problema principale è uno solo, e da lì discendono quasi tutti gli altri: **quasi tutta la casualità arriva dopo la decisione**. Si sceglie un'azione, poi un d6 decide, con probabilità del 33-50% sulle azioni comuni e con eroi da 4 HP. In più l'informazione che servirebbe per decidere bene (chi verrà colpito e quanto forte) è nascosta in un tooltip. Il risultato, secondo le fonti di game design raccolte (Burgun, Subset Games, Sid Meier), è un gioco in cui le sconfitte sembrano sfortuna e non errori, e in cui il menu di 4-5 azioni si riduce di fatto a una o due scelte vere. Gli interventi con più resa sono anche fra i più economici: rendere leggibile l'intenzione del nemico, trasformare Aiuta in un "vantaggio" con `dice: 2` (che il motore sa già fare), scrivere i primi eventi con `scelte` (sistema pronto ma inutilizzato) e misurare col simulatore tre o quattro cose prima di toccare i numeri. Il cambiamento più profondo, cioè mostrare i dadi prima di scegliere grazie a `peekHeroDice`, va provato in un ramo a parte: è quello che cambia di più il gioco. Nel testo tengo separato ciò che dicono le fonti (con il link) da ciò che penso io (segnato come **Giudizio**). I conti sui numeri del gioco sono miei e non sono ancora stati verificati col simulatore.

Una nota sulle fonti: molti talk citati (GDC di Giovannetti su Slay the Spire, postmortem di Darkest Dungeon e di Into the Breach) sono dietro abbonamento. In quei casi le citazioni vengono da articoli che li riportano, e lo segnalo.

## 1. Cosa funziona, e perché

### Il sacchetto dei dadi risponde al "paradosso del vincitore"

`DICE_BAG = { size: 6, ones: 1, sixes: 1 }` garantisce che ogni blocco di 6 tiri di un eroe contenga esattamente un 1 e un 6. È la stessa famiglia di soluzioni del "7-bag" di Tetris, dove ogni pezzo esce una volta ogni 7 e la siccità massima scende a 13 pezzi ([Gamertag Mythras](https://gamertagmythras.com/blog/tetris/tetris-randomizers-explained), fonte secondaria), e della distribuzione pseudo-casuale di Warcraft III e Dota 2, dove ogni fallimento alza la probabilità del tentativo dopo ([Liquipedia](https://liquipedia.net/dota2/Random_Distribution)). Il motivo di fondo l'ha spiegato Sid Meier alla GDC 2010: i giocatori di Civilization Revolution accettavano di perdere a 2 contro 1, ma si infuriavano perdendo a 20 contro 10, quindi **il sistema non poteva basarsi solo sulla matematica** ([Game Informer](https://gameinformer.com/b/news/archive/2010/03/12/sid-meier-gamers-arent-logical)). **Giudizio:** la scelta di Slay the Dig è anche onesta. La percentuale mostrata da `rollChance` è vera in media e non c'è un "aiuto nascosto" alla XCOM, dove su Normale e Facile un modificatore di fortuna segreto può superare la percentuale mostrata ([GameBanshee](https://www.gamebanshee.com/news/112504-xcom-enemy-within-adds-qsave-scumq-option.html)). È il modello giusto per un gioco di famiglia: niente trucchi da scoprire.

### Ogni +1 conta, come nella "bounded accuracy" di D&D 5e

Bersagli quasi fissi (CA dei nemici 7-8, Attacco 7) e bonus piccoli sono la versione estrema della "bounded accuracy" di D&D 5e, nata per evitare che bonus enormi rendessero inutili armature e CD ai livelli alti ([DMDavid](https://dmdavid.com/tag/proficiency-and-bounded-accuracy-in-dd-next/)). **Giudizio:** su un d6 ogni +1 vale il 16,7%, più di tre punti di un d20. Per questo ogni oggetto e ogni reliquia si sentono subito, e il bilanciamento resta leggibile per chi scrive le campagne nell'editor.

### Il bottino "uno fra tre" e le benedizioni filtrate seguono lo standard del genere

`LOOT_CHOICES = 3` riprende la regola di Slay the Spire: una carta fra tre, oppure si salta ([Slay the Spire Fandom Wiki](https://slay-the-spire.fandom.com/wiki/Card_Rewards)). La preghiera che pesca `PRAYER_CHOICES` benedizioni fra quelle utili adesso (`blessingUseful`) ricorda le benedizioni degli dèi di Hades, con rarità e livelli che danno forza e identità ([PC Invasion](https://www.pcinvasion.com/hades-guide-olympian-god-boons-skills/2/)). **Giudizio:** filtrare le benedizioni inutili evita le scelte vuote, che sono il difetto tipico di questo schema. La rarità a cascata (`LOOT_RARITY_CASCADE`), che sale con `mapProgress`, dà ritmo e ha un pregio pratico: aggiungere oggetti comuni non cambia quanti leggendari cadono.

### Il Drakengrad procedurale ha i punti fissi che servono

La mappa procedurale garantisce elite a circa il 38% e il 70% del percorso, mercanti al livello 3, a metà e tre livelli prima della fine, e un riposo prima del boss (`typeFor` in `js/procedurale.js`). Slay the Spire fa lo stesso: riposo sempre prima del boss, tesoro garantito a metà atto, primi scontri presi da un gruppo "facile" ([Slay the Spire Wiki](https://slaythespire.wiki.gg/wiki/Map_Locations)). L'idea di generare la struttura riusando pezzi fatti a mano (nemici, prove, testi delle altre campagne) è quella di Spelunky, i cui livelli sono "metà generati e metà disegnati" ([Game Maker's Toolkit, trascrizione](https://amara.org/subtitles/p6MHlmreohsY/en-gb/1/download/How%20and%20Why%20Spelunky%20Makes%20its%20Own%20Levels%20%20Game%20Makers%20Toolkit.en-gb.txt)). Anche i nemici "in fila per forza" corrispondono ai gruppi facile/difficile di Slay the Spire.

### Il simulatore Esperto è uno strumento che quasi nessuno ha

Mega Crit ha bilanciato Slay the Spire con le metriche di ogni partita dei tester mandate a un server: "it's really tough for two people to just say 'it's perfectly balanced'", dice Casey Yano ([Seattle Indies](https://seattleindies.org/seattle-indies-spotlight-mega-crit-games/)); il talk GDC 2019 di Giovannetti è dedicato proprio a questo ([Game Developer](https://www.gamedeveloper.com/design/learn-i-slay-the-spire-i-s-metrics-driven-approach-to-game-balancing-at-gdc-2019)). Shiny Shoe (Monster Train) guarda quanto spesso viene scelta ogni ricompensa, ma avverte che "the data do not paint the whole picture" ([Screen Rant](https://screenrant.com/inkbound-monster-train-mark-cooke-interview/)). **Giudizio:** una famiglia non ha centinaia di tester, quindi un bot che gioca con gli stessi motori del gioco (`simExpertAction`, `simSpecialsValue`, `tools/difficolta.mjs`) è la cosa più vicina ai dati di Mega Crit. Nella ricerca non sono emerse prove di bot simili negli studi citati (il che non vuol dire che non esistano). Il limite è che misura il bilanciamento dei numeri, non la noia o la frustrazione.

### Gli eroi sono persone, e le abilità lo dicono

Jake Solomon racconta che i fan di XCOM consigliavano di dare ai soldati i nomi degli amici, sapendo che sarebbero morti, e che questo faceva parte del divertimento ([GamingBolt](https://gamingbolt.com/aftermath-xcom-enemy-unknown-interview-with-jake-solomon)). Anche soprannomi "totally meaningless" rendono i soldati più vivi ([New Statesman](https://www.newstatesman.com/?p=132668)). **Giudizio:** Slay the Dig parte con un vantaggio enorme, perché le persone esistono già. Abilità come "Orgoglio di mamma" di Ottavio o la "Lista dei torti" di Pancrazio (`noArmor`, `pancrazio_lista_torti`) sono identità fatta con le meccaniche, il punto più forte del gioco. Le statistiche di partenza equilibrate (somma di Forza, Intelligenza e Fede sempre 7, `maxHp: 4`, `dmg: 1`) evitano che qualcuno parta "il più debole" sulla carta.

### Il recupero c'è già, e il juice è abbondante

Una spirale della morte nasce quando perdere uno scambio rende più probabile perdere i successivi; l'esempio classico è il gruppo che perde il guaritore ([Socratic Design](http://socratesrpg.blogspot.com/2006/03/what-is-death-spiral.html)). Slay the Dig ha già diverse vie d'uscita: i caduti si rialzano a 1 HP al riposo (`resolveRest`), le pozioni da `REVIVE_MIN_RARITY` in su rialzano, il medico cura anche i caduti, il bottino non va ai caduti. Sul fronte del feedback, il talk "Juice it or lose it" ha mostrato come colori, easing e scossa dello schermo facciano sembrare vivo un gioco identico nelle regole ([RPG Playground](https://rpgplayground.com/?p=3339)). Catene GSAP, numeri fluttuanti, `showRollBanner`, cinematica d'attacco e passaggi a tema sono già oltre ciò che serve.

### La partita online evita gli errori più comuni

Jackbox ha mostrato che si entra con un codice stanza dal browser, senza app, e che il telefono può mostrare informazioni private a ciascuno ([Built In](https://builtin.com/media-gaming/jackbox-games-design-party-pack)): è lo stesso modello di `/online/<codice>`. In Mansions of Madness 2ª edizione l'app ha preso il posto del Keeper umano, e secondo Kotaku il nemico umano al tavolo "put a lid on attempts to get truly collaborative" ([Kotaku](https://kotaku.com/mansions-of-madness-is-still-one-of-the-best-co-op-boar-1839116360)). **Giudizio:** in Slay the Dig il motore fa già da Keeper (nemici, fasi, intenzioni automatici), quindi il master non è un avversario. Un eroe per giocatore (`stato.onlineOwners`), voti con timer (`VOTE_SECONDS = 30`, `VOTE_SECONDS_TARGET = 15`) che contano solo i collegati, autosalvataggio nello slot `online`, token di riconnessione e ping SSE ogni 15 secondi sono le scelte giuste per una famiglia su rete mobile e ngrok.

## 2. Cosa non va, e come sistemarlo

Per ogni problema: perché conta, cosa dicono le fonti, e le soluzioni dalla più economica alla più costosa, con ciò che il motore già supporta. Ogni modifica ai numeri va riprovata con `node tools/difficolta.mjs` e con i margini `difficolta` delle campagne.

### 2.1 Il d6 dopo la scelta decide più del giocatore

**Perché conta.** Keith Burgun definisce la casualità in uscita come "noise injected between the player's decision and the outcome", che "obscure[s] the outcome", rallenta l'apprendimento e crea "the appearance of depth" senza aggiungere profondità; cita proprio il tiro per colpire di XCOM e FTL ([Game Developer, Burgun](https://gamedeveloper.com/design/randomness-and-game-design)). Subset Games ha costruito Into the Breach sul contrario: "We wanted to make something where every death felt like your own fault", e questo li ha portati agli attacchi nemici annunciati come meccanica centrale ([Game Developer, Road to the IGF](https://www.gamedeveloper.com/game-platforms/road-to-the-igf-subset-games-i-into-the-breach-i-)). Non tutti sono d'accordo: un altro autore sostiene che la casualità in uscita insegna a gestire il rischio ([Game Developer](https://www.gamedeveloper.com/design/how-randomness-contributes-to-strategic-thinking)), e Darkest Dungeon, il riferimento di tono del gioco, vive di tiri. **Giudizio:** il problema non è la casualità in sé ma la combinazione con 4 HP. Attacca con Forza 3 contro CA 8 riesce il 33% delle volte; tre fallimenti di fila capitano circa il 30% delle volte su tre tiri; due colpi nemici da 1-3 mettono fuori un eroe. Un giocatore non riesce a distinguere "ho scelto male" da "ho tirato male". Il sacchetto attenua solo gli estremi (1 e 6), non le serie di 2, 3 e 4 che falliscono.

| Costo | Proposta | Cosa c'è già |
|---|---|---|
| Basso | **Ostinazione dichiarata**: +1 al prossimo tiro dopo ogni fallimento di quell'eroe, azzerato al successo. È il principio della distribuzione di Dota ([Liquipedia](https://liquipedia.net/dota2/Random_Distribution)) ma visibile, non il "bad streak breaker" nascosto di XCOM. | Bonus ai tiri via `relicDiceSources` / `tempBuffs` |
| Basso | **Successo parziale**: mancare la soglia di 1 dà un risultato "di striscio" (Attacca: danno 1 ma il nemico ha +1 al prossimo attacco; Difendi: +1 armatura ma niente bonus dopo). In Blades in the Dark un 4-5 sul dado più alto è "ce la fai, ma a un costo" ([Roll20, BitD Core System](https://roll20.net/compendium/BITD/The%20Core%20System)). Va tenuto a favore del giocatore, altrimenti allunga gli scontri. | `naturalRollSuccess` è l'unico punto da toccare |
| Basso | **Eccesso convertito**: superare la soglia di 3 o più dà +1 danno. Così Forza alta non si spreca contro il tetto dell'83%. | Calcolo in `resolveAttack` |
| Medio | **Mezza entrata**: una reliquia o un'abilità ("Presagio") mostra il prossimo dado di un eroe. | `peekHeroDice` legge già i prossimi valori del sacchetto |
| Medio-alto | **Dadi in entrata**: a inizio round ogni eroe pesca il suo dado e lo si vede prima di scegliere ("chi ha il 5 attacca, chi ha il 2 aiuta"), come in Dicey Dungeons, dove si agisce sui dadi già tirati ([itch.io](https://itch.io/blog/849411/how-dicey-dungeons-inspired-my-ttrpg.amp); [PC Gamer](https://www.pcgamer.com/au/dicey-dungeons-review)). Una recensione contraria lo trova comunque "hollow and random" ([Janneke Parrish](https://jannekeparrish.com/game/dicey-dungeons/)). Va ripensato `specialReroll`. | `peekHeroDice`, sacchetto per eroe; il telefono riceve già i prossimi dadi (`requestRemoteRoll`) |
| Alto | **2d6 o HP raddoppiati** (8 HP, cure da 2): più gradini e meno estremi. Cambia tutti i numeri e la regola del 6/1. | Solo col simulatore su tutte le campagne |

### 2.2 Il sacchetto corregge la cosa sbagliata

**Perché conta.** **Giudizio:** con CA 7-8 il successo dipende da 4, 5 e 6, ma i valori 2-5 restano casuali puri (`2 + floor(rng()*4)`). La rabbia del "20 contro 10" di Meier ([Game Informer](https://gameinformer.com/b/news/archive/2010/03/12/sid-meier-gamers-arent-logical)) nasce dai fallimenti con percentuale alta, non dagli 1. Ci sono due effetti collaterali. Il primo è il conteggio: anche il 7-bag di Tetris diventa prevedibile per chi conta i pezzi ([Tetris Concept](https://tetrisconcept.net/threads/randomizer-theory.512/page-13), forum); chi ha visto il 6 sa che non tornerà fino al blocco dopo. Il secondo è una dipendenza invisibile: il sacchetto attraversa scontri, prove e preghiera, quindi un 6 speso in una prova irrilevante manca nello scontro dopo.

| Costo | Proposta | Cosa c'è già |
|---|---|---|
| Basso | Decidere se il conteggio è un segreto o una meccanica, e scriverlo nel "Come si gioca". | `js/menu.js` |
| Basso | Sacchetto separato per gli scontri e per prove e preghiera. | `hero.diceBag`, `newDiceBlock` |
| Medio | Blocchi di 12 con due 1, due 6 e tre di ciascun valore fra 2 e 5: limita anche le serie di 2-3 (ma rende più efficace il conteggio). | `DICE_BAG` in `js/regole.js` |
| Medio | Rendere il sacchetto esplicito (quanti 6 e 1 restano nel blocco), coerente con i dadi in entrata del punto 2.1. | `peekHeroDice` |

### 2.3 L'intenzione del nemico c'è, ma non si legge

**Perché conta.** In Into the Breach si vedono tutte le intenzioni e l'ordine esatto in cui avverranno; l'unico elemento casuale del combattimento è "Resist", con probabilità tenute basse apposta ([Cliqist](https://cliqist.com/2018/03/06/into-the-breach-building-a-better-mech-with-subset-games-justin-ma/)). Burgun chiama "information horizon" la distanza fra il momento in cui un'informazione è nota e la decisione: un'informazione che arriva troppo tardi si comporta come casualità in uscita ([Game Developer, Burgun](https://gamedeveloper.com/design/randomness-and-game-design)). Slay the Spire 2 affianca le intenzioni multiple invece di sovrapporle ([Untapped.gg](https://sts2.untapped.gg/guides/how-to-read-enemy-intent), guida di giocatori). **Giudizio:** `enemyIntentHtml` mostra sempre `svgIcon('sword')` per attacco, colpo ad area, preparazione e preda annunciata, e il testo con bersaglio e danni si legge solo passando sopra col mouse. Sul telefono il passaggio del mouse non esiste. Con 4 HP la domanda "chi difende?" dipende tutta da questo: oggi l'informazione più preziosa del combattimento è nascosta proprio a chi gioca meno.

| Costo | Proposta | Cosa c'è già |
|---|---|---|
| Basso | Icona diversa per tipo (singolo, area, preparazione, cura o potenziamento, malus) e **numero dei danni sempre visibile** ("⚔ 2", "⚔ 1×3", "☄ 2 a tutti"); il testo lungo resta nel tooltip. | `enemyIntentHtml`, `enemyIntentText` |
| Basso | Un mirino sulla carta dell'eroe bersaglio quando è noto, come le frecce di Into the Breach. | `announcedPrey`, `heroStatusesHtml` |
| Basso | Percentuali per eroe anche su Difendi e Aiuta, non solo su Attacca. | `showHitPreview`, `rollChance` |
| Medio | Tacche delle fasi con un'icona di cosa succederà, e la reazione di una soglia annunciata ("alla prossima ferita si infurierà"). Oggi `eliteReaction` punisce chi ha colpito bene senza preavviso. | `enemyPhaseTicksHtml`, `nextTimedPhase` |

### 2.4 Aiuta è quasi sempre peggio di Attacca

**Perché conta.** Una decisione è interessante se nessuna opzione domina e la scelta dipende dalla situazione. Il principio è attribuito a Sid Meier ("a game is a series of interesting decisions"), ma la citazione esatta non è stata trovata in una fonte primaria ([VentureBeat](https://venturebeat.com/2010/03/12/quotes-from-sid-meiers-keynote-gdc-speech) riassume il keynote del 2010). **Giudizio, con i miei conti:** Aiuta con Forza 3 riesce al 50% e dà +1 al prossimo tiro dell'alleato, cioè circa +8% di riuscita, circa 0,08 danni attesi. Attaccare direttamente rende 0,33. **Aiuta vale circa un quarto di Attacca**, salvo combinazioni come Astarte (`helpDmgBonus`). Difendi vale solo per il bersaglio annunciato, quindi dipende dal punto 2.3. Ogni round rischia di ridursi a "il bersaglio difende, gli altri attaccano". Il simulatore lo può confermare: basta contare quante volte `simExpertAction` sceglie Aiuta.

| Costo | Proposta | Cosa c'è già |
|---|---|---|
| Bassissimo | Misurare la frequenza di Aiuta e Difendi nel simulatore. | `simExpertAction` |
| Basso | **Aiuta come vantaggio**: il prossimo tiro dell'alleato usa due dadi e tiene il migliore. Su un 4+ passa dal 50% al 75%, quasi nulla agli estremi, quindi non si spreca ([EN World, matematica del vantaggio](https://www.enworld.org/goto/post?id=6958881)). | `dice: 2` e `rollChance(…, twoDice, worst)` |
| Basso | Aiuta che dura fino all'uso invece di scadere a fine round (oggi `stato.helpBonus` si azzera in `startHeroesTurnCycle`). | `startHeroesTurnCycle` |
| Medio | **Proteggi**: Difendi su un alleato, prendendo il colpo al posto suo. Con 4 HP la decisione diventa "chi rischia per chi". | Il Colpo d'Odio già "attira" chi difende (`hatefulTarget`) |
| Medio | Vantaggio come moneta standard anche per reliquie e benedizioni, al posto dei +N che si sprecano oltre il 2+. | `dice: 2` |

### 2.5 Il riposo non è un bivio

**Perché conta.** In Slay the Spire il fuoco obbliga a scegliere: "Rest" cura il 30% degli HP, "Smith" migliora una carta, una sola opzione per riposo ([Slay the Spire Wiki](https://slaythespire.wiki.gg/wiki/Map_Locations)). Anche i danni non mortali contano se costringono a scegliere fra curarsi e usare una risorsa ([RogueBasin](https://www.roguebasin.com/index.php/Incursion_Tech_Doc)). **Giudizio:** a Slay the Dig nello stesso riposo si cura 1 HP, si prega e si scambiano le rune. È un bel momento di respiro, ma toglie una delle decisioni più tese del genere. La quantità di cura va bene (1 HP su 4 è il 25%, vicino al 30% di Slay the Spire); manca la rinuncia.

| Costo | Proposta | Cosa c'è già |
|---|---|---|
| Medio | Un'azione per riposo, a scelta del gruppo: **Riposare** (+2 HP a tutti), **Pregare** (la preghiera di oggi), **Affilare** (+1 a una statistica di un oggetto o un grado di rarità). Lo scambio delle rune può restare libero. Serve una regola di scelta per l'Esperto. | `resolveRest`, `prayAtRest`, `simPray` |

### 2.6 Un eroe a terra pesa troppo, in gioco e al tavolo

**Perché conta.** Il rimedio più semplice alla spirale della morte è che perdere uno scambio non tolga la capacità di evitare le perdite successive ([Socratic Design](http://socratesrpg.blogspot.com/2006/03/what-is-death-spiral.html)). Hades ha scelto di "take the sting out of failure" e con la God Mode parte da +20% di resistenza ai danni e aggiunge +2% a ogni morte ([Inverse](https://www.inverse.com/gaming/hades-god-mode-interview)). Darkest Dungeon, al contrario, ha avuto proteste in Early Access contro gli infarti improvvisi, poi resi facoltativi ([Wikipedia](https://en.wikipedia.org/wiki/Darkest_Dungeon)). **Giudizio:** un eroe caduto toglie un quarto o un quinto della forza della compagnia fino al prossimo riposo o medico; gli scontri si allungano e gli altri prendono più colpi. E nella partita online c'è un costo sociale che XCOM non ha: lì muore il soldato con il nome di un amico, qui il giocatore spesso **comanda proprio sé stesso**, e un eroe a terra gli toglie il resto della serata.

| Costo | Proposta | Cosa c'è già |
|---|---|---|
| Bassissimo | Misurare la spirale: probabilità di vittoria con 0, 1 o 2 caduti al livello X. Se con un caduto a metà mappa la vittoria va vicino a zero, la spirale è troppo forte. | `tools/difficolta.mjs` |
| Basso | **Incita** da terra: chi è caduto può dare +1 al tiro di un alleato una volta per scontro. Il giocatore continua a giocare. | `relicDiceSources`, permessi in `ONLINE_PERMESSI` |
| Basso | Controllo nell'editor: "più di N livelli senza riposo o mercante su un percorso", per le campagne fatte a mano; per il Drakengrad, un test su molti semi. | `nodeProblems`, `reachableNodeIds` |
| Medio | Chi è caduto si rialza a 1 HP dopo un elite vinto, con un costo (una ferita o una maledizione leggera). | `combatVictorySpecials`, `add_curse` |
| Medio | Ritratti da ferito "ammaccati e determinati", mai umilianti: la persona vera li guarda. | `portraitWounded` |

### 2.7 L'economia spinge verso il medico e il rinnovo automatico

**Perché conta.** In Slay the Spire il negozio funziona perché ogni spesa toglie un'alternativa; c'è una sola rimozione di carta per negozio, e Ascension alza i prezzi e toglie oro ([Slay the Spire Wiki, Ascension](https://slaythespire.wiki.gg/wiki/Ascension)). In Balatro il rinnovo costa sempre di più nello stesso negozio ([jeu.video](https://jeu.video/en/guide/balatro-beginner-jokers), guida di terzi), e LocalThunk ha provato e poi tolto una valuta separata per i rinnovi ([LocalThunk, Balatro Timeline](https://localthunk.com/blog/balatro-timeline-3aarh)). **Giudizio:** con eroi da 4 HP, 4 HP dal medico sono un eroe intero per 20 Scudi, meno di un epico (21). `MERCHANT_PROGRESS_MARKUP` (+40% a fine mappa) non tocca il medico, che diventa relativamente più conveniente man mano che si avanza: il negozio rischia di diventare un ospedale. `MERCHANT_REROLL_COST` fisso a 5 è poco a metà mappa (4,5-18 Scudi per scontro) e diventa automatico. `HAGGLE_PENALTY` di +2 Scudi per articolo pesa tantissimo su uno scarso da 3 e niente su un leggendario da 30. Manca infine un "pozzo" di Scudi paragonabile alla rimozione di carte.

| Costo | Proposta | Cosa c'è già |
|---|---|---|
| Bassissimo | Misurare quanta parte degli Scudi l'Esperto spende in cure rispetto agli oggetti. | Simulatore |
| Basso | Rinnovo crescente nello stesso mercante (5, 8, 11…) o uno solo per mercante. | `MERCHANT_REROLL_COST` |
| Basso | Penalità di contrattazione in percentuale (per esempio +15%) invece di +2 fissi. | `HAGGLE_PENALTY` |
| Basso | Medico che sale con l'avanzamento, oppure 1 HP per eroe per mercante. | `MEDIC_PRICE_PER_HP`, `MEDIC_MAX_HP` |
| Medio | Togliere una maledizione a pagamento dal mercante, come pozzo di Scudi. | `removeCurseAt` |

### 2.8 Il bottino rischia di essere "vince il numero più alto"

**Perché conta.** Dai riassunti del talk di Giovannetti, l'obiettivo di Slay the Spire è che ogni carta abbia un ruolo invece di essere tutte ugualmente forti ([Glasp, riassunto](https://glasp.co/youtube/7rqfbvnO_H0), fonte secondaria). Balatro è nato senza Jolly e li ha aggiunti perché la prima versione "was lacking" ([Rogueliker](https://rogueliker.com/balatro-interview/)). Monster Train misura la frequenza di scelta delle ricompense ([Screen Rant](https://screenrant.com/inkbound-monster-train-mark-cooke-interview/)). **Giudizio:** `SIM_ITEM_WEIGHTS` riduce un oggetto a danno×3 + Forza×2 + armatura×1,5: se l'Esperto prende quasi sempre il più raro dei tre, le scelte non sono vere scelte. Lo zaino da 3 (`BACKPACK_SIZE`) crea una tensione sana, ma le pozioni competono con l'equipaggiamento e rischiano di essere scartate senza essere usate. Il bottino non ha un "salta" che valga qualcosa.

| Costo | Proposta | Cosa c'è già |
|---|---|---|
| Bassissimo | Contare nel simulatore quante volte si prende l'oggetto più raro fra i tre (la "pick rate" di Slay the Spire) e quante pozioni finiscono scartate. | `simPickLootChoice`, Diario |
| Basso | "Salta e prendi Scudi" (per esempio metà del prezzo di rivendita). | `itemSellPrice`, `selectLootChoice` |
| Medio | Famiglie di oggetti (veleno, armatura, Fede, lancio) e una piccola spinta del bottino verso la famiglia che l'eroe ha già, come Hades che ripropone gli dèi già scelti. | Effetti speciali `speciali`, `pickLootChoices` |
| Medio | Un posto separato per un consumabile, come gli slot di pozione di Slay the Spire. | `stackableSlot`, `BACKPACK_SIZE` |

### 2.9 Gli eventi con `scelte` esistono ma nessuno li usa

**Perché conta.** Per Slay the Spire 2 gli eventi sono la seconda parte più grande della partita dopo gli scontri, e Mega Crit dice: "we're trying to avoid having any options where you simply do nothing and pass through". Alcuni eventi obbligano a scegliere fra opzioni tutte negative, altri portano a uno scontro ([PCGamesN](https://www.pcgamesn.com/slay-the-spire-2/events-redesign)); ne hanno più di 50, e arte e testi restano in bozza finché l'evento non si dimostra interessante ([Mega Crit, Neowsletter](https://megacrit.com/news/2025-6-12-neowsletter-issue-11/)). **Giudizio:** oggi c'è un solo nodo `story` in ciascun capitolo di Astarte, nessuno nel Drakengrad, nel tutorial e in "prova di fede", e nessun file di campagna usa `scelte`. È il guadagno narrativo più rapido del progetto, perché il motore supporta già costo in Scudi, prova con `stat` e `cd`, `effetti` e `fallimento`, e l'editor ha `choiceListEditor`. Gli eventi sono anche il posto giusto per dare un ruolo a Intelligenza e Fede, che in scontro contano poco.

| Costo | Proposta | Cosa c'è già |
|---|---|---|
| Basso (solo dati) | Scrivere 5-10 eventi alla Slay the Spire 2: niente "prosegui gratis" (o con un prezzo), almeno uno scambio fra risorse diverse (Scudi ↔ HP massimi, oggetto ↔ reliquia), una scelta rischiosa con prova su Intelligenza o Fede. | `scelte`, `chooseStoryOption`, `resolveStoryChoice`, `choiceListEditor` |
| Basso (solo dati) | Un "titolo" di una riga, breve e tagliente alla Darkest Dungeon, prima dei testi lunghi di successo e fallimento: chi salta il testo riceve comunque il tono. | `successText`, `failText` |
| Medio | `richiedeEroe` su una scelta: disponibile solo se nel party c'è quell'eroe ("Caino riconosce il simbolo…"). Su una campagna di famiglia è l'effetto più forte con il minor costo. | Campo nuovo in `DATI_SCHEMA` e in `renderStoryChoices` |
| Medio | Condizioni `se` sulle scelte ("solo se un eroe è caduto"), la reattività alla Hades. | Vocabolario `SPECIALI_SE` come modello |
| Medio | Eventi anche nel Drakengrad, pescati dalle altre campagne come già si fa con le prove. | `js/procedurale.js` |

### 2.10 Il tono alla Darkest Dungeon sta nell'estetica, non nei sistemi

**Perché conta.** Bourassa e Sigman volevano "toy with player agency" e il "bark system" fa parlare gli eroi secondo il loro stress, per dare l'"elemento umano" che secondo loro mancava ai vecchi GdR ([Wikipedia](https://en.wikipedia.org/wiki/Darkest_Dungeon), che cita interviste). Sigman definisce la scelta del narratore Wayne June "one of the best decisions we've made" ([Game Developer, Road to the IGF](https://www.gamedeveloper.com/audio/road-to-the-igf-red-hook-studios-i-darkest-dungeon-i-)). Folmer Kelly ha avvertito che troppa rifinitura può costare immersione ([Game Developer](https://gamedeveloper.com/design/video-is-your-game-juicy-enough-)). **Giudizio:** oggi l'unico segnale "umano" che reagisce allo stato è il ritratto da ferito. Il juice c'è, ma ha un tono uniforme: tutto rimbalza e brilla, anche quando un eroe cade. Un vero sistema di stress è sconsigliato: con 4 HP aggiungerebbe un secondo logoramento troppo pesante, e andrebbero rifatti telefono e pagina online.

| Costo | Proposta | Cosa c'è già |
|---|---|---|
| Basso | **Frasi del narratore** per momento (elite, eroe ferito, eroe caduto, prova fallita, boss vinto), in un file di dati `data/libreria/narratore.js`, mostrate con la macchina da scrivere. Scelte con `Math.random`, non con `rng()`, per non spostare la sequenza del seme. | Testo a macchina in `js/effetti.js` |
| Basso | **Battute degli eroi** (`barks`: ferito, alleato caduto, uccisione) nella libreria Eroi, in un fumetto sulla carta. Possono essere battute di famiglia, soprannomi, tic: è dove l'attaccamento cresce di più. | `data/libreria/eroi.js` |
| Basso | Feedback forte e cupo quando un eroe passa a ferito e quando cade: scossa e lampo rosso, la musica che si abbassa per 1-2 secondi. Nel rispetto di `animTime` e delle animazioni spente. | Dissolvenza in `js/audio.js`, `animTime` |
| Medio | **Prova della risolutezza** quando un eroe diventa ferito: tiro di Fede, virtù temporanea se riesce, afflizione leggera se fallisce (`furia` o `silenziato`). Facoltativa per campagna, con esiti più positivi che negativi. | `HERO_STATUSES`, `tempBuffs`, `rageUntil`, `silencedUntil`; serve un nuovo `quando` (`ferito`) |

### 2.11 Perdere non lascia niente, e non c'è un motivo per rigiocare

**Perché conta.** Kasavin voleva che in Hades non ci fosse un momento di "game over": "If the player doesn't forget their deaths and learns from them, so should the protagonist" ([First Person Scholar](https://www.firstpersonscholar.com/?p=7266), fonte secondaria). Slay the Spire dà rigiocabilità con Ascension: 20 gradini cumulativi sbloccati vincendo, fra cui più elite, meno cura dopo il boss, una maledizione all'inizio, negozi più cari ([Slay the Spire Wiki, Ascension](https://slaythespire.wiki.gg/wiki/Ascension)). **Giudizio:** in Slay the Dig la sconfitta cancella lo slot e mostra `mostraRiepilogo`, poi niente. Il Compendio è tutto aperto (`COMPENDIUM_ALL_UNLOCKED`), quindi non resta niente da scoprire. Un capitolo fatto a mano, una volta capito il percorso, si rigioca poco. Per una famiglia con bravure diverse sconsiglio sblocchi permanenti di potenza: renderebbero inutile la misura dell'Esperto.

| Costo | Proposta | Cosa c'è già |
|---|---|---|
| Basso | Epitaffio del narratore nel riepilogo, scelto da chi è caduto per primo, dal nemico che ha sconfitto il party e dal nodo raggiunto. | `datiRiepilogo` (funzione pura, già provata) |
| Basso | **Cronaca della famiglia**: elenco delle spedizioni con caduti, nemesi e punto più lontano, in `localStorage` come il Compendio. È il "memoriale" alla Darkest Dungeon. | `dignitas_compendium` come modello |
| Medio | Eredità narrativa: dopo una sconfitta contro un boss, la partita seguente apre con un nodo `story` diverso. Basta un segnale salvato. | Nodi `story` |
| Medio | **Prove degli Asi** 1-10 alla Ascension, gradini cumulativi sbloccati vincendo: elite più frequenti, meno cura a riposo, una maledizione all'inizio, mercante più caro, nemici con più vita. Il simulatore misura la vittoria per gradino. | `add_curse`, `MERCHANT_PROGRESS_MARKUP`, `PROC_SCALA`, `typeFor` |
| Medio | Un aiuto facoltativo che cresce dopo le sconfitte, alla God Mode di Hades. | Bonus ai tiri |

### 2.12 Gli eroi si somigliano troppo nei numeri

**Perché conta.** In Darkest Dungeon i ruoli nascono dalla posizione: davanti mischia forte e più danni subiti, dietro attacchi più deboli ma più protezione ([Wikipedia](https://en.wikipedia.org/wiki/Darkest_Dungeon)). In Into the Breach le squadre sono pensate come insiemi e il determinismo rende le combinazioni pianificabili ([Cliqist](https://cliqist.com/2018/03/06/into-the-breach-building-a-better-mech-with-subset-games-justin-ma/)). **Giudizio:** fra Curio (4/1/2) e Caino (3/3/1) c'è un punto di differenza, e in scontro conta soprattutto la Forza. Tutta l'identità sta nell'unica abilità scelta. Il rischio vero, in famiglia, è che qualcuno scopra che il "suo" eroe è il più debole: va verificato che le due abilità di ogni eroe abbiano un valore vicino.

| Costo | Proposta | Cosa c'è già |
|---|---|---|
| Bassissimo | Confrontare col simulatore il valore delle due abilità di ogni eroe. | `simSpecialsValue`, `--eroi` di `tools/difficolta.mjs` |
| Basso | Un campo `ruolo` (Bastione, Lama, Sostegno, Astuto), mostrato in creazione del party e sulla carta. | `data/libreria/eroi.js`, `js/creazione.js` |
| Basso | Evitare passive generiche (`bonus_forza`, `bonus_hp`) per i membri della famiglia: ogni passiva deve essere riconoscibile come "lui" o "lei". | Libreria Abilità |
| Medio | Sinergie dichiarate fra eroi ("Fratelli: +1 se entrambi nel party"; "quando un alleato Difende, +1 al tuo attacco"). Servono nuove condizioni `se` (`alleato_ha_difeso`, `aiutato_da`). | `speciali`, `SPECIALI_SE` |
| Alto | Asimmetria più forte di un punto (5 HP e 0 Intelligenza; 3 HP e 2 Danno). | `tests/difficolta.test.js` |

### 2.13 Online, il master rischia di essere il "quarterback"

**Perché conta.** Justin Gary definisce il quarterbacking così: "One dominant player at the table figures out the optimal play and starts directing everyone else" ([Justin Gary](https://justingarydesign.substack.com/p/the-quarterback-problem); il resto dell'articolo è a pagamento). The Alexandrian nota che l'informazione nascosta "often doesn't work" se non c'è un motivo per comunicarla ([The Alexandrian](https://thealexandrian.net/wordpress/35063/board-games/thought-of-the-day-quarterbacking-in-co-op-games)); Spirit Island resiste perché non c'è una sola linea ottima e nessuno può gestire tutta la plancia ([Sprites and Dice](https://spritesanddice.com/posts/spirit-island-cure-quarterbacking/)). Twitch Plays Pokémon ha mostrato che chi perde un voto smette di votare invece di cambiare opinione ([BMC On Society](https://blogs.biomedcentral.com/on-society/2019/06/25/what-twitch-plays-pokemon-tells-us-about-crowd-behavior/)), e che chi perde sente il proprio suggerimento irrilevante ([FEE](https://fee.org/articles/exploring-anarchy-and-democracy-on-a-gameboy/)). Jackbox: "The games never ask players to make multiple choices in a given moment", e bisogna "make sure they always know what to do next" ([Built In](https://builtin.com/media-gaming/jackbox-games-design-party-pack)). **Giudizio:** il quarterback strutturale è il master. Sceglie la strada (`selectStsNode`), chi affronta la prova e chi prega, e può eseguire un'azione che annulla un voto (`votoAnnullatoDa`). La protezione dai clic distratti è sensata, ma toglie autonomia proprio sulle scelte che hanno un "proprietario" naturale. La nebbia (`classiNodoGiocatore`, `node-ignoto`) nasconde i nodi ai giocatori ma non al master, quindi crea un'asimmetria master/giocatori, non un motivo di discussione fra giocatori. Nei voti, "nessun voto = prima opzione" premia il distratto senza dirlo. Le azioni `'tutti'` come `selectLootChoice` e `tryBuyMerchantItem` premiano chi clicca più in fretta. Votare chi prende il colpo del nemico è delicato fra parenti.

| Costo | Proposta | Cosa c'è già |
|---|---|---|
| Basso | Mostrare durante il voto quale sarà la scelta se nessuno vota, e il conteggio dal vivo. | `onlineApriVoto`, `resolveVote` |
| Basso | Rendere visibile "Il master ha deciso" quando un voto si annulla. | `votoAnnullatoDa` |
| Basso | Una riga fissa sulla pagina del giocatore: "Tocca a te: scegli l'azione di Icaro" o "Aspetta: vota il bersaglio". | `turnoAltrui`, `segnaEroi` |
| Basso | Capo a rotazione per capitolo, con un segno "Capo" sulla carta. | `capoSpedizione` |
| Medio | **Proposta + conferma**: il giocatore si offre per la prova o la preghiera ("mi offro io"), il master conferma con un clic. Stessa protezione dagli errori, più autonomia. | `ONLINE_PERMESSI`, `onlineCanRun` |
| Medio | Voto a timer sulla strada fra i nodi aperti, con il veto del master. | Voti esistenti |
| Medio | Bottino con proposta e conferma invece del primo clic. | `takeLootChoice` ("Lo prendo io") del telefono |
| Medio | **Esploratore**: un eroe vede un passo in più solo sul proprio telefono e lo deve raccontare: informazione privata con un motivo per comunicarla. | `ONLINE_NODI_VISIBILI`, `nodiVisibiliGiocatori` |
| Medio | Al posto del voto sul bersaglio, il proprietario si "offre" come scudo, o resta la scelta del nemico (`announcedPrey`). | `announcedPrey` |

### 2.14 Online, si aspetta molto e il turno di chi è disconnesso blocca tutti

**Perché conta.** Il downtime è il tempo in cui un giocatore "cannot directly affect the outcome of the game"; si riduce dando a chi aspetta qualche azione che tocca lo stato del gioco, e il facilitatore ha il compito di accorgersene ([Design pattern "Downtime"](https://math.vu.nl/~eliens/demo/pattern-downtime.html)). Online, un buon GM chiama per nome ("Don't ask the group open, hanging questions"), dichiara la durata e chiude a un punto naturale ([Age of Ravens](https://www.ageofravensgames.com/blog/lessons-from-online-gming)). Gloomhaven risolve con la scelta simultanea delle azioni ([Board Game Oracle](https://www.boardgameoracle.com/en-CA/boardgame/price/Dcy77KGDLF/gloomhaven-second-edition)). **Giudizio:** con 4-5 eroi un giocatore agisce per circa un quinto dello scontro; prove, preghiera e capitano hanno un solo protagonista. Un giocatore disconnesso nel suo turno blocca lo scontro finché il master non interviene. Si salva solo dalla mappa, quindi se cade la connessione del master durante un boss si perde il nodo intero.

| Costo | Proposta | Cosa c'è già |
|---|---|---|
| Basso | Animazioni rapide suggerite di default in online: ogni secondo di animazione si moltiplica per 4-5 spettatori. | `fastAnimations` |
| Basso | Messaggi chiari: "Salvato: si può riprendere da qui" sulla mappa, "ultimo salvataggio: inizio di questo nodo" negli scontri. | `onlineRiprendi`, `saveGame` |
| Basso | Una piccola azione per chi aspetta durante il turno altrui (incoraggiare, "pronto ad aiutare"), senza toccare il bilanciamento; insieme all'Incita da terra del punto 2.6. | `ONLINE_PERMESSI` |
| Medio | Regola visibile per i disconnessi: dopo N secondi il master gioca per lui, e un "adotta un eroe libero" per chi arriva a metà partita. | `stato.onlineOwners` |
| Medio | Una lista per il master di chi ha già affrontato prove o pregato nel capitolo, per distribuire i riflettori. | Diario, `expeditionStats` |
| Medio | Pilota automatico per i disconnessi con l'Esperto come controfigura. Va verificato che le funzioni del simulatore si possano chiamare sullo stato vivo. | `simExpertAction` |
| Alto | **Pianificazione simultanea**: a inizio round tutti scelgono insieme l'azione del proprio eroe, poi si risolve in ordine. Si sposa bene con i dadi in entrata del punto 2.1. | `combatActionAllowed`, coda dei turni |

### 2.15 La difficoltà ha un solo obiettivo dichiarato, e forse troppo basso

**Perché conta.** I team citati bilanciano con dati più feedback umano, e tutti avvertono che i dati non bastano ([Screen Rant](https://screenrant.com/inkbound-monster-train-mark-cooke-interview/)). Justin Ma avverte che aggiungere difficoltà riempiendo la mappa di pericoli "becomes needlessly complex and hard to parse" ([Game Developer](https://www.gamedeveloper.com/design/reimagining-failure-in-strategy-game-design-in-i-into-the-breach-i-)). **Giudizio:** solo Astarte cap. 1 dichiara `difficolta: { vittoriaMin: 20, vittoriaMax: 25 }`. Per una famiglia il 20-25% dell'Esperto è basso, e il bot sbaglia in modo diverso dalle persone. Astarte cap. 2 (19 livelli, 27 scontri) è più esposto all'attrito di un capitolo da 13 livelli, e Astarte cap. 1 ha 13 prove su 16 livelli, che pesano molto sull'esito.

| Costo | Proposta | Cosa c'è già |
|---|---|---|
| Bassissimo | Dare un obiettivo `difficolta` a ogni campagna, con il tutorial molto più alto (60-80%). | `tests/difficolta.test.js` |
| Basso | Metriche in più nel simulatore: livello di morte più frequente, nemico che toglie più HP (come i grafici di Mega Crit), curva degli HP medi per livello, Scudi in cure contro oggetti. | `tools/difficolta.mjs` |
| Basso | Avviso nell'editor se uno scontro dei primi livelli usa un nemico più forte della media. | `numberRangeWarning`, `nodeProblems` |
| Medio | Salvare nel Diario delle partite vere le scelte fatte (oggetto preso, nodo scelto, causa della sconfitta), esportabili, per confrontarle con l'Esperto. Poche partite di famiglia dicono molto. | `expeditionStats`, esportazione dei salvataggi |

## 3. Da dove cominciare: dieci interventi in ordine

L'ordine mette davanti ciò che costa poco e cambia molto. Le misure vengono prima perché dicono quali problemi sono reali: i miei conti su Aiuta, medico e spirale sono stime, non dati.

| # | Intervento | Impatto | Sforzo | Perché a questo punto |
|---|---|---|---|---|
| 1 | **Misure nel simulatore**: frequenza di Aiuta e Difendi, Scudi in cure, pick rate dell'oggetto più raro, vittoria con 1 o 2 caduti | Alto (decide il resto) | Basso | Conferma o smentisce i punti 2.4, 2.6, 2.7 e 2.8 prima di cambiare numeri |
| 2 | **Intenzione leggibile**: numero dei danni sempre visibile, icona per tipo, mirino sul bersaglio | Alto | Basso | Dà base a Difendi e funziona anche sul telefono, dove il tooltip non c'è |
| 3 | **Primi 5-10 eventi con `scelte`** | Alto | Basso (solo dati, editor pronto) | Sistema già fatto e inutilizzato; dà spazio a Intelligenza e Fede |
| 4 | **Aiuta come vantaggio** (`dice: 2`) | Medio-alto | Basso | Rende vera una delle quattro scelte del menu |
| 5 | **Battute del narratore e degli eroi** | Alto per una famiglia | Basso | Attaccamento e tono gotico senza toccare il bilanciamento |
| 6 | **Ostinazione dichiarata o successo parziale** (provarne uno) | Alto | Basso-medio | Attenua le serie di fallimenti senza nascondere nulla |
| 7 | **Online: proposta + conferma, riga "Tocca a te", scelta predefinita visibile nei voti, Incita da terra** | Medio-alto | Basso-medio | Più autonomia ai giocatori, nessuno escluso dalla serata |
| 8 | **Riposo come bivio** (Riposare, Pregare, Affilare) | Medio | Medio | Torna la decisione più tesa del genere |
| 9 | **Cronaca della famiglia ed epitaffio** | Medio | Basso-medio | La sconfitta lascia una storia invece di uno slot vuoto |
| 10 | **Dadi in entrata con `peekHeroDice`**, in un ramo a parte | Molto alto | Medio-alto | Il cambiamento più profondo: trasforma ogni round in un'allocazione; da provare dopo i punti 2, 4 e 6 per vedere quanto serve ancora |

Le Prove degli Asi alla Ascension e la pianificazione simultanea online vengono dopo: valgono molto, ma conviene farle quando il combattimento base è stabile, perché ne moltiplicano gli effetti.

## Conclusione

L'analisi cambia il punto da cui guardare il gioco: Slay the Dig non ha bisogno di più contenuti né di più effetti, ma di **spostare l'informazione prima della decisione**. Quasi tutti i problemi del combattimento (sconfitte che sembrano sfortuna, Aiuta dominato, Difendi alla cieca) hanno la stessa causa, e il motore ha già i pezzi per risolverla: `peekHeroDice`, `dice: 2`, `announcedPrey`, `showHitPreview`. Lo stesso vale per la narrativa: il sistema `scelte` aspetta solo di essere riempito. Una buona parte del lavoro è quindi scrivere dati e cambiare come le cose si mostrano, non scrivere motori nuovi.

C'è poi un'implicazione che le fonti di game design non coprono, perché nessuna parla di giochi in cui il personaggio è la persona seduta al tavolo. In Slay the Dig ogni regola punitiva colpisce qualcuno di preciso: chi cade resta a guardare, chi perde il voto si sente ignorato, il ritratto da ferito è la faccia di un parente. Per questo il criterio che suggerisco per ogni scelta futura è quello di Hades più che quello di Darkest Dungeon: il gioco può essere duro con gli eroi, ma non deve mai togliere alla persona il diritto di giocare.
