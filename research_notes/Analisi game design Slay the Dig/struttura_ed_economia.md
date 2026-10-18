# Struttura della run, mappa, ricompense ed economia in Slay the Dig

Nota di metodo: i fatti sul gioco vengono dal codice del progetto (file citati per percorso). I fatti esterni hanno un URL. Molte fonti primarie chieste (il talk GDC 2019 di Giovannetti per intero, il libro di Derek Yu, interviste di Yano) non erano leggibili: GDC Vault è riservato agli abbonati e alcune pagine hanno risposto 403/402. In quei casi uso abstract, anteprime e wiki, e lo dico. Le sezioni "Inferences" sono mie valutazioni, non affermazioni delle fonti.

Fatti di base su Slay the Dig (dal codice):
- Eroi: tutti i 15 della libreria hanno `hp: 4`, `maxHp: 4` (`data/libreria/eroi.js`). Ferito con 2 HP o meno (`WOUNDED_HP`).
- Riposo: cura 1 HP a ogni eroe (o rialza un caduto a 1), più i bonus `riposo → bonus_cura` (`resolveRest` in `js/motore/prove.js`). Nello stesso riposo si fanno anche preghiera e scambio di rune: non c'è una scelta "curarsi oppure migliorare".
- Medico del mercante: 5 Scudi per HP, al massimo 4 HP per mercante (`js/regole.js`).
- Scudi dagli scontri: uno fra 3, 5, 7, 9, 12, moltiplicato per (1 + avanzamento) e per 1,5 con gli elite (`scaledCoins` in `js/loot.js`). Prezzi base: da 3 (scarso) a 30 (leggendario); rinnovo della merce 5 Scudi; contrattazione -25% se riesce, +2 Scudi per articolo se fallisce.
- Lunghezza e composizione delle mappe (conteggio dei `type` nei file): tutorial 13 livelli (11 scontri, 3 elite, 5 prove, 4 mercanti, 4 riposi, 3 tesori); Astarte cap. 1 16 livelli (15 scontri, 5 elite, 13 prove, 7 mercanti, 6 riposi, più nodi `injury`/`coins`/`penalty`); cap. 2 19 livelli (27 scontri, 7 elite, 10 prove, 8 mercanti, 8 riposi); cap. 3 13 livelli (14 scontri, 6 elite, 4 prove, 3 mercanti, 6 riposi, capitano). Drakengrad procedurale: 16 livelli, 2-4 nodi per livello; primo livello solo scontri, elite garantiti a circa 38% e 70% del percorso, mercanti garantiti al livello 3, a metà e 3 livelli prima della fine, riposo prima del boss; resto a caso: 12% elite (dal livello 4), 40% scontro, 22% prova, 10% mercante, 9% riposo, 7% tesoro (`typeFor` in `js/procedurale.js`).
- Difficoltà dichiarata: solo Astarte cap. 1 ha `difficolta: { vittoriaMin: 20, vittoriaMax: 25 }` (vittorie dell'Esperto).
- Meta-progressione: non ce n'è. L'unico dato fra le partite è il Compendio delle scoperte, oggi tutto sbloccato (`COMPENDIUM_ALL_UNLOCKED` in `js/menu.js`). Non ci sono livelli di difficoltà tipo Ascension.

## Lezioni di Slay the Spire: metriche, mappa, elite, riposi, rimozione, atti, Ascension

### Takeaway
Slay the Spire bilancia con molti dati raccolti dai playtest, ma non si fida dei soli numeri. La sua mappa funziona perché ogni nodo è uno scambio leggibile fra rischio e risorse: gli elite danno reliquie e costano HP, il riposo fa scegliere fra cura e miglioramento, e alcuni punti fissi (tesoro a metà atto, riposo prima del boss) fanno da ritmo. Ascension aggiunge 20 gradini di difficoltà, uno alla volta e cumulativi, sbloccati vincendo.

### Cited Findings
- Il talk GDC 2019 "Slay the Spire: Metrics Driven Design and Balance" (Anthony Giovannetti) racconta l'uso delle metriche dall'inizio dello sviluppo e per tutto l'Early Access, e come hanno tenuto stabili sensazione e difficoltà in un anno di aggiornamenti frequenti — [Game Developer, anteprima](https://www.gamedeveloper.com/design/learn-i-slay-the-spire-i-s-metrics-driven-approach-to-game-balancing-at-gdc-2019); [GDC Vault](https://www.gdcvault.com/browse/gdc-19/play/1025731)
- Riassunti di terzi (non il talk): uno strumento fatto in casa su Heroku registrava ogni partita dei tester, con grafici di frequenza di scelta delle carte, strategie vincenti e nemici che fanno più danni; ogni carta deve avere un ruolo invece di essere tutte ugualmente forti; le metriche possono ingannare se lette male — [GDC news](https://gdconf.com/news/learn-slay-spires-successful-metrics-driven-approach-game-balancing-gdc-2019); [Glasp, riassunto della trascrizione](https://glasp.co/youtube/7rqfbvnO_H0) (pagina non leggibile direttamente, contenuto dal risultato di ricerca)
- Casey Yano: "Whenever someone plays, their metrics from their game get submitted to the server", "we can actually drill down and get closer to what things should be", "it's really tough for two people to just say 'it's perfectly balanced'"; una build al giorno e playtester presto — [Seattle Indies Spotlight](https://seattleindies.org/seattle-indies-spotlight-mega-crit-games/)
- Riposo: un'opzione per riposo; "Rest" cura il 30% degli HP massimi, "Smith" migliora una carta. Un riposo è sempre prima del boss — [Slay the Spire Wiki, Map Locations](https://slaythespire.wiki.gg/wiki/Map_Locations)
- Tesoro garantito a metà degli atti 1-3; elite meno frequenti dei mostri normali, danno sempre una reliquia, non due di fila — [Slay the Spire Wiki](https://slaythespire.wiki.gg/wiki/Map_Locations)
- Due gruppi di incontri per atto: i primi 3 scontri dell'atto 1 (2 negli atti 2 e 3) vengono dal gruppo "facile", poi dal "difficile" — [Slay the Spire Wiki](https://slaythespire.wiki.gg/wiki/Map_Locations)
- Stanze "?": evento, mostro, negozio o tesoro; la probabilità di un tipo sale ogni volta che non esce e torna a zero quando esce — [Slay the Spire Wiki](https://slaythespire.wiki.gg/wiki/Map_Locations)
- Mercante: 5 carte del personaggio, 2 incolori, 3 reliquie, 3 pozioni e la rimozione di una carta, una volta per negozio — [Slay the Spire Wiki](https://slaythespire.wiki.gg/wiki/Map_Locations)
- Ascension: si sblocca battendo il boss dell'atto 3 con un personaggio; ogni vittoria sblocca il livello dopo; 20 livelli cumulativi, fra cui A1 più elite (~60% in più), A5 cura il 75% invece del 100% dopo il boss, A6 si parte con il 10% di vita in meno, A10 si parte con una maledizione, A11 uno slot di pozione in meno, A13 boss danno 25% di oro in meno, A15 eventi peggiori, A16 negozi +10%, A20 due boss alla fine dell'atto 3 — [Slay the Spire Wiki, Ascension](https://slaythespire.wiki.gg/wiki/Ascension)
- Le carte ricompensa: se ne sceglie una fra tre, oppure si salta — [Slay the Spire Fandom Wiki, Card Rewards](https://slay-the-spire.fandom.com/wiki/Card_Rewards) (dal risultato di ricerca)
- Opinione di giocatori: gli elite valgono la pena quando il mazzo chiude lo scontro in fretta e c'è vita per assorbire una mano cattiva; nel terzo atto ad alta Ascension molti saltano gli elite perché la reliquia casuale non vale il rischio — [sts2.untapped.gg](https://sts2.untapped.gg/guides/how-to-make-the-best-map-choices-in-slay-the-spire-2); [Kwan's Qualms](https://www.kwansqualms.com/qualms/2025/2/19/sts)
- Opinione su Steam: la difficoltà degli scontri normali cresce lungo l'atto, quella degli elite no, quindi conta quando si incontra un elite — [Steam Community](https://steamcommunity.com/app/646570/discussions/0/3160848559779551994)

### Inferences
- Il riposo di Slay the Dig fa tutto insieme (1 HP, preghiera, rune). Funziona come "momento di respiro", ma non è un bivio: manca la tensione "mi curo o mi rafforzo" che in StS è uno dei momenti decisivi. Soluzione: dare al riposo due o tre azioni alternative, una sola per riposo (per esempio: Riposare = +2 HP a tutti; Pregare = la preghiera di oggi; Affilare = migliorare un oggetto di un grado di rarità o +1 a una statistica di un oggetto). Nel simulatore servirebbe una regola di scelta per l'Esperto.
- Con eroi da 4 HP, 1 HP a riposo vale il 25% della vita: in proporzione è vicino al 30% di StS. Il problema non è la quantità ma la granularità: ogni colpo sposta molto, e 1 HP è l'unico valore possibile senza bonus.
- La mappa procedurale ha già i punti fissi giusti (elite a ~1/3 e ~2/3, mercanti garantiti, riposo prima del boss). Manca il tesoro garantito a metà, che in StS fa da premio e respiro a metà atto. Manca anche il "?" che nasconde il tipo (qui esiste solo online per i giocatori, `node-ignoto`).
- I gruppi "facile/difficile" di StS corrispondono alla scelta dei nemici "in fila per forza" del procedurale. Le campagne fatte a mano dovrebbero controllarlo nell'editor: un avviso se uno scontro dei primi livelli usa un nemico più forte della media.
- Astarte cap. 1 ha 13 prove su 16 livelli: le prove danno reliquie e maledizioni, quindi pesano molto sull'esito. Va guardato col simulatore quanto della varianza viene da lì.
- Ascension è la cosa più semplice da copiare (vedi la sezione sulla meta-progressione).

### Gaps
- Contenuto completo del talk GDC 2019 (esempi precisi di modifiche fatte dopo i dati): il video è riservato e i riassunti di terzi non erano leggibili.
- Nessuna dichiarazione dei designer di Mega Crit trovata su mappa, elite o riposo: le regole sopra vengono dalla wiki, il "perché" è mio o dei giocatori.
- Numero di piani per atto e regole precise di generazione (per esempio "niente elite prima del piano 6"): non confermati dalla pagina letta.

## Ricompense: scegline 1 fra 3, salto, ritmo delle rarità, troppi oggetti contro sinergie, zaino da 3

### Takeaway
"Scegline uno fra tre, oppure salta" è lo standard del genere perché fa decidere senza paralizzare; il salto conta quando tenere qualcosa ha un costo. Rarità e livelli servono soprattutto a dare identità alla build: Hades, Balatro e StS cercano che ogni pezzo abbia un ruolo, non che sia solo "più forte". Lo zaino da 3 di Slay the Dig crea una tensione vera, ma rischia di ridurre ogni scelta a "il numero più alto vince".

### Cited Findings
- StS: una carta fra tre, oppure salta — [Slay the Spire Fandom Wiki](https://slay-the-spire.fandom.com/wiki/Card_Rewards)
- StS: obiettivo di design dichiarato (da riassunti del talk) è che ogni carta abbia un ruolo e che gli effetti troppo forti non schiaccino le altre strategie — [Glasp, riassunto](https://glasp.co/youtube/7rqfbvnO_H0)
- Hades: rarità Comune, Rara, Epica, Eroica; la rarità dà la forza di base, il livello la cresce; alcune benedizioni hanno più varianza di altre (guide di terzi) — [PC Invasion](https://www.pcinvasion.com/hades-guide-olympian-god-boons-skills/2/); [Hades Wiki](https://hades.fandom.com/wiki/Boons?oldid=6594)
- Hades II: Kasavin dice che alcune benedizioni dell'Early Access non sono state tolte ma rifatte, "not too precious about these things" — [inkl / Hades 2 lead](https://www.inkl.com/news/hades-2-lead-says-the-best-boons-from-early-access-weren-t-killed-just-reskinned-we-think-it-s-important-not-to-be-too-precious-about-these-things)
- Balatro: la prima versione non aveva Jolly; l'unica strategia era un negozio per migliorare le carte. I Jolly (oggetti passivi) sono arrivati dopo perché quella versione "was lacking" — [Rogueliker, intervista a LocalThunk](https://rogueliker.com/balatro-interview/)
- Monster Train: Shiny Shoe guarda quante volte i giocatori scelgono una ricompensa rispetto alle altre; "the data do not paint the whole picture"; alcune carte sono state indebolite più volte dopo l'uscita perché non avevano capito quanto fossero forti — [Screen Rant, intervista a Mark Cooke](https://screenrant.com/inkbound-monster-train-mark-cooke-interview/)

### Inferences
- Bottino a 3 carte coperte, se ne tiene una (`LOOT_CHOICES = 3`): in linea con il genere. Non ho visto un'opzione esplicita per "non prendere niente" (in `js/loot.js` si lascia l'oggetto solo se nessuno può portarlo); con lo zaino da 3 si scarta comunque, quindi un salto vero conterebbe poco. Più utile: "salta e prendi Scudi" (per esempio metà del prezzo di rivendita), così il salto ha un valore e l'economia ne guadagna.
- Rarità a cascata che sale con l'avanzamento: buona per il ritmo e robusta quando si aggiungono oggetti (lo dice il codice stesso). Rischio: se gli oggetti di rarità alta sono solo "gli stessi numeri più grandi", la scelta del bottino diventa ovvia. Il simulatore lo dice già: `SIM_ITEM_WEIGHTS` riduce un oggetto a danno×3 + Forza×2 + armatura×1,5. Se l'Esperto sceglie quasi sempre l'oggetto di rarità più alta, le scelte non sono vere scelte. Misura proposta: nel simulatore, contare quante volte l'oggetto preso è quello di rarità più alta fra i tre (equivalente della "pick rate" di StS e Monster Train).
- Identità della build: gli effetti speciali "quando → fai" e le abilità degli eroi sono la leva giusta. Proposta: etichette di famiglia sugli oggetti (veleno, armatura, Fede, lancio) e una piccola spinta nel bottino verso la famiglia che l'eroe ha già, come Hades che offre le benedizioni di un dio già scelto. Così con 3 slot si può costruire qualcosa invece di accumulare numeri.
- Zaino da 3 per eroe: pro, ogni oggetto conta e lo scarto è una scelta leggibile (contro il "troppi oggetti" di Risk of Rain, dove l'accumulo è voluto); contro, con armi, armature e consumabili nello stesso zaino le pozioni competono con l'equipaggiamento e i giocatori tendono a non tenerle. Da controllare col Diario o col simulatore quante pozioni vengono scartate senza essere usate. Possibile soluzione: un posto separato per un consumabile (come gli slot di pozione di StS, che Ascension 11 riduce).
- Benedizioni della preghiera (3 fra quelle utili adesso, se ne sceglie una): buon design, simile alle benedizioni di Hades; filtrare quelle inutili adesso (`blessingUseful`) evita scelte vuote.

### Gaps
- Nessuna intervista Supergiant trovata sul perché delle tre benedizioni o sui pesi della rarità.
- Nessuna fonte primaria trovata su Risk of Rain e l'accumulo di oggetti; resta una mia osservazione.

## Economia e mercante: prezzi, rinnovi, contrattazione, scarsità

### Takeaway
Nel genere il negozio funziona quando i soldi sono pochi rispetto a ciò che si vorrebbe comprare e ogni spesa toglie un'alternativa (rimozione, cura, reliquia). Il rinnovo della merce va prezzato in modo che non diventi automatico. Slay the Dig ha già un'economia leggibile, ma il medico a 5 Scudi per HP mette in concorrenza diretta "curarsi" e "rafforzarsi", e con 4 HP la cura vince quasi sempre: è da controllare.

### Cited Findings
- StS: una sola rimozione di carta per negozio; alcune reliquie cambiano i prezzi; Ascension 16 alza tutti i prezzi del 10%; Ascension 13 toglie il 25% dell'oro dei boss — [Slay the Spire Wiki, Map Locations](https://slaythespire.wiki.gg/wiki/Map_Locations); [Slay the Spire Wiki, Ascension](https://slaythespire.wiki.gg/wiki/Ascension)
- Balatro: LocalThunk ha provato una valuta separata per i rinnovi e poi l'ha tolta — [LocalThunk, The Balatro Timeline](https://localthunk.com/blog/balatro-timeline-3aarh)
- Balatro (guide e recensioni, non lo sviluppatore): il rinnovo costa sempre di più nello stesso negozio; tenere circa 25 dollari per gli interessi; i giocatori bravi usano i rinnovi come parte della build — [jeu.video](https://jeu.video/en/guide/balatro-beginner-jokers); [nexreview](https://nexreview.com/balatro-review/)
- Monster Train: frequenza di scelta come misura di quanto un contenuto è percepito utile — [Screen Rant](https://screenrant.com/inkbound-monster-train-mark-cooke-interview/)

### Inferences
- Rinnovo fisso a 5 Scudi: dal mercante a metà mappa (Scudi per scontro 4,5-18) è economico e diventa automatico. Soluzione alla Balatro: costo che cresce nello stesso mercante (5, 8, 11...), oppure un solo rinnovo per mercante.
- Contrattazione con una sola proposta, -25% se riesce, +2 Scudi per articolo se fallisce: è un buon piccolo azzardo. Rischio: +2 su un leggendario da 30 conta poco, su uno scarso da 3 tantissimo; la penalità percentuale (per esempio +15%) sarebbe più uniforme.
- Medico: 5 Scudi per HP, massimo 4 HP per mercante, "niente rincari". Con eroi da 4 HP, 4 HP curati sono un eroe intero per 20 Scudi, meno di un epico (21). Il mercante +40% a fine mappa non tocca il medico, che quindi diventa relativamente più conveniente man mano che si avanza. Da verificare col simulatore quanta parte degli Scudi l'Esperto spende in cure: se è la maggior parte, il negozio diventa un ospedale. Possibile soluzione: anche il medico sale con l'avanzamento, o 1 HP per eroe per mercante.
- Scarsità: Scudi da scontro moltiplicati per (1 + avanzamento) e prezzi +40% all'ultimo livello si compensano in parte (monete fino a ×2, prezzi ×1,4): il potere d'acquisto sale verso la fine. In StS il negozio di fine atto è spesso il più ricco per lo stesso motivo; non è un errore, ma va voluto.
- Manca un "pozzo" di monete paragonabile alla rimozione di StS: qualcosa che si compra sempre volentieri ma toglie altro (per esempio togliere una maledizione a pagamento, che oggi passa solo da riposi o Pietra del focolare).

### Gaps
- Nessuna fonte primaria trovata sui prezzi del negozio di StS o sulla scelta di un prezzo crescente per la rimozione.
- Nessun commento di sviluppatori trovato sulla contrattazione come meccanica (esiste poco nel genere).

## Lunghezza della run, ritmo, curva di difficoltà e simulazione con bot

### Takeaway
I team citati (Mega Crit, Shiny Shoe) bilanciano con dati di partite vere più feedback umano, e tutti avvertono che i dati non bastano. Un bot simulatore come l'Esperto di Slay the Dig è uno strumento in più e raro nel genere, ma misura come gioca il bot, non come gioca una persona; il ritmo (facile all'inizio, picchi agli elite, respiro ai riposi) va controllato a parte.

### Cited Findings
- Mega Crit: metriche di ogni partita mandate al server, una build al giorno, playtester presto — [Seattle Indies](https://seattleindies.org/seattle-indies-spotlight-mega-crit-games/)
- Monster Train: playtest interni e con un gruppo privato, analisi aggregate, beta pubblica; nessuna prova trovata di bot di simulazione — [Screen Rant](https://screenrant.com/inkbound-monster-train-mark-cooke-interview/)
- StS: scontri dell'inizio dell'atto dal gruppo "facile"; riposo fisso prima del boss; tesoro a metà atto — [Slay the Spire Wiki](https://slaythespire.wiki.gg/wiki/Map_Locations)
- Into the Breach: aggiungere difficoltà riempiendo la mappa di nemici e pericoli "becomes needlessly complex and hard to parse" (Justin Ma) — [Game Developer](https://www.gamedeveloper.com/design/reimagining-failure-in-strategy-game-design-in-i-into-the-breach-i-)
- FTL (GDC 2013, "Designing Without a Pitch"): l'esperienza del giocatore era l'obiettivo, meccaniche e genere venivano dopo; cambiavano o abbandonavano spesso parti del design per ottenere una sensazione — [Game Developer, video](https://www.gamedeveloper.com/audio/video-designing-without-a-pitch---the-i-ftl-i-postmortem); [GDC Vault](https://gdcvault.com/play/1018034/Designing-Without-a-Pitch-FTL)

### Inferences
- Lunghezza: 13-19 livelli per capitolo è circa un atto lungo di StS. Con eroi da 4 HP e cura da 1, una mappa da 19 livelli (Astarte cap. 2, 27 scontri) è più esposta all'attrito che una da 13. La percentuale di vittoria per capitolo andrebbe guardata insieme alla curva "HP medi della compagnia per livello" prodotta dal simulatore, non solo al numero finale.
- Solo una campagna dichiara `difficolta` (20-25%). Per una campagna privata di famiglia (chi gioca sono persone, non streamer) il 20-25% dell'Esperto può essere basso: i giocatori veri giocano peggio del bot su alcune cose e meglio su altre. Soluzione: dare un obiettivo a ogni campagna e tenere il tutorial molto più alto (per esempio 60-80%).
- L'Esperto misura bene il bilanciamento dei numeri. Non misura frustrazione né noia. Proposta, nello spirito di StS: salvare nel Diario di ogni partita vera (in localStorage o esportabile) le scelte fatte (oggetto preso fra i tre, nodo scelto, causa della sconfitta) e confrontarle con quelle dell'Esperto. Anche poche partite di famiglia dicono molto.
- Metriche da aggiungere al simulatore, oltre alla vittoria: livello di morte più frequente, quale nemico toglie più HP (come i grafici di StS), frequenza con cui si prende l'oggetto più raro, Scudi spesi in cure rispetto a oggetti.

### Gaps
- Dicey Dungeons (Terry Cavanagh) e il suo bilanciamento: nessuna fonte trovata in questa ricerca.
- Nessuna fonte trovata su bot di simulazione usati da studi commerciali per roguelike a carte; la mancanza è un dato, non una prova che non esistano.

## Meta-progressione e rigiocabilità; mappe procedurali contro fatte a mano

### Takeaway
Il genere è diviso fra rigiocabilità solo per abilità del giocatore (roguelike puro) e sblocchi permanenti (Rogue Legacy, Hades). StS sta in mezzo: sblocchi brevi che fanno da tutorial e poi Ascension come scala di difficoltà. Sul fronte mappe, Spelunky e Into the Breach mostrano due strade: generare la struttura e mettere a mano i pezzi, oppure fare tutto a mano quando costa meno e serve controllo. Slay the Dig ha già entrambe (campagne a mano e Drakengrad procedurale) ma nessuna forma di progressione o difficoltà fra una partita e l'altra.

### Cited Findings
- Nel roguelike tradizionale l'unica cosa che resta fra le partite è l'abilità del giocatore — [Envato Tuts+](https://code.tutsplus.com/the-key-design-elements-of-roguelikes--cms-23510a)
- La distinzione roguelike (senza meta-progressione) / roguelite (con) non è entrata davvero nel linguaggio comune; secondo un commentatore la meta-progressione di StS si esaurisce presto e fa da tutorial — [lemm.ee, discussione](https://next.lemm.ee/comment/14156553) (fonte debole, opinione)
- Hades, God Mode: niente "modalità facile" classica perché morire fa avanzare la storia; parte da +20% di resistenza ai danni e aggiunge +2% a ogni morte; aggiunto nell'Early Access di dicembre 2019; Kasavin dice che le opzioni di difficoltà vanno pensate per ogni gioco — [Inverse](https://www.inverse.com/gaming/hades-god-mode-interview); [Can I Play That](https://caniplaythat.com/2021/08/11/hades-god-mode-explained-by-supergiant-games/); [Kasavin su X](https://x.com/kasavin/status/1309548183408668672)
- StS Ascension: 20 livelli cumulativi sbloccati vincendo, per personaggio — [Slay the Spire Wiki](https://slaythespire.wiki.gg/wiki/Ascension)
- Spelunky: livelli "metà generati e metà disegnati"; il generatore traccia prima un percorso garantito, poi riempie con stanze fatte a mano (con parti casuali); griglia 4×4 di 16 stanze e circa 50 schemi base per ambiente — [Game Maker's Toolkit, trascrizione](https://amara.org/subtitles/p6MHlmreohsY/en-gb/1/download/How%20and%20Why%20Spelunky%20Makes%20its%20Own%20Levels%20%20Game%20Makers%20Toolkit.en-gb.txt); [Darius Kazemi, Spelunky's Procedural Space](https://www.tinysubversions.com/2009/09/spelunkys-procedural-space/index.html)
- Derek Yu tratta generazione casuale, sfida e feedback dei giocatori nel libro *Spelunky* (Boss Fight Books, 2016) — [Game Developer](https://www.gamedeveloper.com/design/how-i-spelunky-i-got-its-procedural-hook-actually-got-finished) (libro non consultato)
- Into the Breach: Davis ha scelto mappe fatte a mano perché con 8×8 caselle era più economico disegnarne circa 100 che costruire un generatore, e per non avere mappe "che non sono divertenti"; Ma: la cosa più frustrante è una situazione senza alcuna soluzione — [Game Developer](https://www.gamedeveloper.com/design/reimagining-failure-in-strategy-game-design-in-i-into-the-breach-i-)
- FTL: settori con sistemi ed eventi generati in stile roguelike — [Wikipedia, FTL](https://en.wikipedia.org/wiki/FTL:_Faster_Than_Light)

### Inferences
- Le campagne di Slay the Dig sono capitoli di una storia (Astarte 1-3): la rigiocabilità di un capitolo a mano è bassa una volta capito il percorso. Il Drakengrad è la parte rigiocabile. Una scala di difficoltà tipo Ascension (es. "Prove degli Asi" 1-10) darebbe un motivo per ripetere sia i capitoli sia il Drakengrad, senza toccare il bilanciamento di base. È quasi tutto già nei dati: elite più frequenti (procedurale), meno cura a riposo, una maledizione all'inizio (`add_curse`), mercante più caro (`MERCHANT_PROGRESS_MARKUP`), +HP ai nemici (`PROC_SCALA`). Il simulatore può misurare la percentuale di vittoria per ogni gradino.
- Per un gruppo di famiglia con livelli di bravura diversi, un aiuto alla God Mode (piccolo e crescente dopo le sconfitte, facoltativo) è più adatto di sblocchi permanenti di potenza, che renderebbero inutile la misura dell'Esperto.
- Il procedurale riusa nemici e prove delle altre campagne: è l'approccio Spelunky (struttura generata, pezzi fatti a mano). Il rischio è quello citato da Ma: combinazioni senza via d'uscita (per esempio un elite forte al livello 4 dopo solo scontri e nessun mercante). Il generatore garantisce già alcuni nodi; si può aggiungere un controllo "ogni percorso ha almeno un riposo o un mercante ogni N livelli" e farlo verificare a un test su molti semi.
- Una meta-progressione leggera e non di potenza (Compendio con sblocchi reali, eroi nuovi sbloccati finendo un capitolo, come StS sblocca personaggi) darebbe obiettivi a lungo termine. Oggi il Compendio è tutto aperto, quindi non c'è niente da scoprire.

### Gaps
- Il libro di Derek Yu e il talk FTL non sono stati letti direttamente: le loro tesi precise su caso e sfida non sono riportate.
- Nessun articolo autorevole trovato sul dibattito Rogue Legacy contro roguelike puro (solo forum e recensioni).
- Nulla trovato su Heat / Patto della Punizione di Hades.

## Riposi, cura e "spirale della morte" con pochi HP

### Takeaway
La spirale della morte nasce quando perdere uno scambio rende più probabile perdere il successivo. Con eroi da 4 HP, cura da 1 HP a riposo e un eroe a terra che non agisce, Slay the Dig ne è molto esposto: un eroe caduto toglie un quarto o un quinto della forza della compagnia per tutti gli scontri fino al prossimo riposo o medico. StS lo attenua con cura percentuale, riposo garantito prima del boss e cura dopo il boss (che Ascension 5 riduce).

### Cited Findings
- Definizione: una spirale della morte è una meccanica in cui i primi fallimenti rendono più probabili i successivi con poche possibilità di recupero; il rimedio più semplice è che perdere uno scambio non tolga la capacità di evitare le perdite successive; esempio del gruppo che perde il guaritore — [Socratic Design, What is a Death Spiral?](http://socratesrpg.blogspot.com/2006/03/what-is-death-spiral.html)
- Anche danni non mortali contano se costringono a scegliere fra riposare e usare una pozione: l'attrito diventa una decisione — [RogueBasin, Incursion Tech Doc](https://www.roguebasin.com/index.php/Incursion_Tech_Doc)
- StS: riposo = 30% degli HP massimi, oppure miglioramento; riposo sempre prima del boss; cura dopo il boss (100%, 75% da Ascension 5); Ascension 6 parte con -10% di vita — [Slay the Spire Wiki, Map Locations](https://slaythespire.wiki.gg/wiki/Map_Locations); [Slay the Spire Wiki, Ascension](https://slaythespire.wiki.gg/wiki/Ascension)
- Hades: God Mode rende meno pesante il fallimento con un aiuto che cresce a ogni morte — [Inverse](https://www.inverse.com/gaming/hades-god-mode-interview)
- Into the Breach: evitare situazioni senza alcuna risposta — [Game Developer](https://www.gamedeveloper.com/design/reimagining-failure-in-strategy-game-design-in-i-into-the-breach-i-)

### Inferences
- Cosa funziona già: i caduti si rialzano a 1 HP al riposo (`resolveRest`), le pozioni rare in su rialzano, il medico cura anche i caduti, il bottino non va ai caduti (evita sprechi). Il bonus fisso della preghiera e le passive di cura (Cerusico da Battaglia) danno strade di recupero.
- Rischio principale: un eroe a terra = un turno in meno per round, quindi scontri più lunghi, quindi più colpi presi dagli altri. È la spirale "si perde il guaritore" della fonte. Soluzioni possibili, da misurare una alla volta col simulatore:
  1. Cura dopo gli elite o dopo ogni scontro vinto per i caduti (rialzarsi a 1 HP a fine scontro, con un costo: per esempio una ferita o una maledizione temporanea).
  2. Riposo come scelta (vedi sopra) con "Riposare" che cura di più (+2 HP o tutti al massimo dei feriti) quando si rinuncia a pregare.
  3. Recupero anti-valanga: chi è caduto nello scontro riceve un piccolo vantaggio al prossimo (per esempio +1 al primo tiro), come l'aiuto crescente di Hades.
  4. Riposo garantito a metà mappa nelle campagne a mano, non solo prima del boss: un controllo nell'editor ("più di N livelli senza riposo o mercante su un percorso").
- Con 4 HP i numeri sono a grana grossa: il nemico che fa 2 danni toglie metà vita. Se si vogliono più sfumature senza riscrivere tutto, raddoppiare HP, danni e cure (8 HP, cura 2) cambia poco i rapporti ma permette cure e danni da 1, quindi più gradini. È un cambiamento grande: da provare prima col simulatore su tutte le campagne.
- Il simulatore può dare la misura diretta della spirale: probabilità di vittoria condizionata al numero di eroi caduti al livello X. Se con un caduto a metà mappa la vittoria crolla vicino a zero, la spirale è troppo forte.

### Gaps
- Nessuna fonte di sviluppatori trovata specificamente sulla spirale della morte nei roguelike a gruppo (per esempio Darkest Dungeon, che sarebbe il paragone più vicino per i toni).
- Nessun dato misurato in questa ricerca sul simulatore di Slay the Dig: le stime sopra sono da verificare con `node tools/difficolta.mjs`.
