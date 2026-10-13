/* ==========================================================================
   REGOLE E BILANCIAMENTO
   Tutti i numeri che regolano la difficoltà e l'economia del gioco in un solo posto:
   prezzi e mercante, bottino, zaino e consumabili, ferite, Factotum, crescita delle
   campagne procedurali e pesi del simulatore. Solo dati: nessuna funzione del motore,
   nessun riferimento ad altri file, niente interfaccia.
   Caricato subito dopo js/libreria.js e prima di js/comune.js (anche nei test);
   i nomi sono quelli di sempre, quindi il codice che li usa non cambia.
   ========================================================================== */

/* ---------- Eroi ---------- */
// Un eroe è ferito (ritratto da ferito) con WOUNDED_HP o meno, ma ancora in piedi
const WOUNDED_HP = 2;

/* ---------- Zaino e consumabili ---------- */
// Capienza dello zaino di ogni eroe: oltre si deve scartare un oggetto
const BACKPACK_SIZE = 3;
// Copie di uno stesso consumabile che stanno in pila nello stesso slot (campo "qty")
const CONSUMABLE_STACK = 2;

/* ---------- Passiva "Factotum" ----------
   Ogni N punti di Forza guadagnati +1 Intelligenza, ogni N di Intelligenza +1 Fede,
   ogni N di Fede +1 Forza (vedi refreshFactotum in js/oggetti.js). */
const FACTOTUM_CYCLE = [['str', 'int'], ['int', 'fth'], ['fth', 'str']];
const FACTOTUM_EVERY = 2;  // predefinito, se il segnale è solo "true"

/* ---------- Mercante (js/shop.js) ---------- */
// Prezzo base per rarità: il mercante vende con una piccola oscillazione e compra a metà
const ITEM_BASE_PRICE = { scarso: 3, comune: 5, non_comune: 8, raro: 11, epico: 21, leggendario: 30 };
const ITEM_PRICE_SPREAD = { scarso: 1, comune: 1, non_comune: 1, raro: 2, epico: 3, leggendario: 4 };

// Più si avanza nella mappa più il mercante alza i prezzi: +40% all'ultimo livello
// (anche le monete trovate crescono con l'avanzamento, vedi scaledCoins)
const MERCHANT_PROGRESS_MARKUP = 0.4;

// Merce: 4 oggetti da equipaggiare, 2 consumabili e il medico (cura eroi feriti o caduti, si paga per HP)
const MERCHANT_EQUIPMENT_SLOTS = 4;
const MERCHANT_CONSUMABLE_SLOTS = 2;
const MEDIC_PRICE_PER_HP = 5;      // fisso: niente rincari, contrattazione o sconti
const MEDIC_MAX_HP = 4;            // HP che il medico cura in tutto a ogni mercante
const MEDIC_CONFIRM_SHARE = 0.5;   // chiede conferma se la cura costa almeno questa parte degli Scudi

// Bottino degli scontri: quanti oggetti si vedono (se ne tiene uno)
const LOOT_CHOICES = 3;

// Preghiera ai riposi (js/prove.js): un eroe per riposo tira d6 + Fede contro PRAYER_CD, con le regole di sempre
// (6 riesce, 1 fallisce, reliquie dei tiri). Con PRAYER_MAJOR_TOTAL o più, o con un 6, la benedizione è maggiore.
// Se riesce si pescano PRAYER_CHOICES benedizioni del livello e se ne sceglie una. Nessun malus se fallisce.
// Ogni benedizione è il dono di uno degli Asi del Nord (lore/riassunti/Il Nord.md, ortografia del manuale).
const PRAYER_CD = 7;
const PRAYER_MAJOR_TOTAL = 9;
const PRAYER_CHOICES = 3;
// Le benedizioni (nome, icona, effetto) sono nella libreria data/libreria/benedizioni.js (scheda Benedizioni
// dell'editor); PRAYER_BLESSINGS in js/comune.js.

// Pozioni di cura da questa rarità in su rialzano anche gli eroi caduti (0 HP)
const REVIVE_MIN_RARITY = 'raro';

// Rarità della merce: probabilità (in %) al primo livello e all'ultimo, in mezzo si passa
// dall'una all'altra in proporzione all'avanzamento nella mappa (merchantRarityWeights)
const MERCHANT_RARITY_RANGE = {
    scarso: [10, 0],
    comune: [38, 10],
    non_comune: [27, 35],
    raro: [20, 44],
    epico: [5, 8],
    leggendario: [0, 3]
};

// Rinnovo della merce e contrattazione (una sola proposta per mercante)
const MERCHANT_REROLL_COST = 5;
const HAGGLE_DISCOUNT = 0.25;   // successo: -25% su tutta la merce
const HAGGLE_PENALTY = 2;       // fallimento: +2 Scudi su ogni articolo

/* ---------- Rarità del bottino degli scontri e dei tesori (js/loot.js) ----------
   Probabilità (in %) al primo livello della mappa e all'ultimo: in mezzo si passa dall'una
   all'altra in proporzione all'avanzamento (come il mercante), così mappe lunghe e corte
   seguono la stessa curva. Le rarità che il bottino della campagna non ha vengono saltate
   (vedi pickByRarity). */
const LOOT_RARITY_RANGE = {
    scarso: [20, 0],
    comune: [55, 10],
    non_comune: [20, 35],
    raro: [5, 44],
    epico: [0, 8],
    leggendario: [0, 3]
};
// Elite (e boss): la stessa tabella, come se fossero più avanti nella mappa, senza scarsi e comuni
const LOOT_ELITE_PROGRESS_BONUS = 0.4;
const LOOT_ELITE_EXCLUDED = ['scarso', 'comune'];
// Probabilità massima (in %) di ogni oggetto pescato, per bottino, tesori e mercante (pickByRarity):
// vale anche per gli elite e quando la campagna non ha alcune rarità; il resto va alle altre
const RARITY_MAX_SHARE = { epico: 8, leggendario: 3 };

/* ---------- Dadi degli eroi: sacchetto (rollD6 in js/combattimento.js) ----------
   Ogni eroe pesca i suoi d6 da un sacchetto di "size" tiri con esattamente "ones" 1 e "sixes" 6;
   gli altri sono casuali tra 2 e 5. Finito il sacchetto se ne mescola uno nuovo.
   size: 12, ones: 2, sixes: 2 = stesse probabilità, più difficile da contare. size: 0 = dado casuale puro. */
const DICE_BAG = { size: 6, ones: 1, sixes: 1 };

/* ---------- Campagne procedurali (js/procedurale.js) ----------
   Crescita della difficoltà (p = avanzamento da 0 al primo livello a 1 al boss) */
const PROC_SCALA = {
    hp: p => 0.8 + 0.5 * p,          // vita dei nemici: dall'80% al 130% di quella originale
    att: p => (p >= 0.5 ? 1 : 0),     // +1 Attacco dalla metà del percorso
    ca: p => (p >= 0.8 ? 1 : 0),      // +1 CA nell'ultimo tratto
    cd: p => (p >= 0.6 ? 1 : 0)       // +1 CD alle sfide dell'ultimo tratto
};

/* ---------- Simulatore (js/simulator.js) ----------
   Valore di un oggetto, pesato su quanto conta in combattimento: il danno vale più di tutto
   (ogni colpo a segno toglie di più), poi la Forza (si colpisce più spesso), poi l'armatura. */
const SIM_ITEM_WEIGHTS = { dmg: 3, str: 2, armor: 1.5, def_armor: 1, def_bonus: 0.75, help_bonus_val: 0.75, fth: 0.75, int: 0.75 };
// Effetti speciali "quando → fai" (js/motore/speciali.js) fuori dallo scontro, che la prova di scontro del simulatore
// (simSpecialValue) non può misurare: valore per ogni punto di "val" (o per l'effetto, se non ha un valore)
const SIM_SPECIAL_WEIGHTS = { annulla_punizione: 1.5, prova_riuscita: 2, monete: 0.05, carta_bottino: 1, togli_maledizione: 1,
    bonus_cura: 1.25, sconto: 0.3, sconto_percento: 0.03, bonus_tiro_fuori: 0.75 };

/* ---------- Partita online (js/online.js, server/online.js) ---------- */
const VOTE_SECONDS = 30;               // durata di un voto
const VOTE_SECONDS_TARGET = 15;        // voto sul bersaglio del nemico, più corto per non spezzare lo scontro
const ONLINE_DISCONNECT_SECONDS = 20;  // senza segnale per tanto, il giocatore è disconnesso
const ONLINE_FRAME_MS = 100;           // intervallo minimo fra due invii della schermata
