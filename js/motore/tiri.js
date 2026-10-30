/* ==========================================================================
   MOTORE: TIRI DI DADO
   Sacchetto dei dadi degli eroi, regola del dado naturale, bonus ai tiri (effetti speciali "bonus_tiro"),
   probabilità mostrate prima del tiro. Solo regole: niente DOM. Usato da gioco, simulatore e test.
   Modulo: window.Motore.tiri (i nomi restano anche globali). Caricato dopo js/comune.js.
   ========================================================================== */
(function () {
        /* ---------- Sacchetto dei dadi, uno per eroe (DICE_BAG in js/regole.js) ----------
           Ogni eroe pesca i suoi d6 da un sacchetto: in ogni blocco di DICE_BAG.size tiri escono esattamente
           DICE_BAG.ones 1 e DICE_BAG.sixes 6, gli altri sono casuali tra 2 e 5. Nel lungo periodo 1 e 6 escono
           come con un dado vero, ma niente lunghe serie senza 6 o con tanti 1.
           hero.diceBag = i prossimi valori in ordine (blocchi interi uno dopo l'altro), salvato con la partita. */
        function diceBagActive() {
            return typeof DICE_BAG !== 'undefined' && DICE_BAG.size > 0;
        }

        function newDiceBlock() {
            const { size, ones, sixes } = DICE_BAG;
            const block = [...Array(ones).fill(1), ...Array(sixes).fill(6)];
            while (block.length < size) block.push(2 + Math.floor(rng() * 4));
            for (let i = block.length - 1; i > 0; i--) {
                const j = Math.floor(rng() * (i + 1));
                [block[i], block[j]] = [block[j], block[i]];
            }
            return block;
        }

        // Prossimi n valori del sacchetto dell'eroe, senza pescarli: il tiro dal telefono li manda al server
        // (requestRemoteRoll in js/remote.js), che li mostra al giocatore. null se il sacchetto è spento.
        function peekHeroDice(hero, n) {
            if (!hero || !diceBagActive()) return null;
            if (!Array.isArray(hero.diceBag)) hero.diceBag = [];
            while (hero.diceBag.length < n) hero.diceBag.push(...newDiceBlock());
            return hero.diceBag.slice(0, n);
        }

        // Tiro di un d6. Se "rolls[i]" è un numero 1-6 lo usa (tiro dal telefono collegato via QR, oppure
        // valore imposto dai test): se è il prossimo del sacchetto dell'eroe, lo pesca. Altrimenti pesca dal
        // sacchetto dell'eroe ("hero"), o tira un d6 casuale se non c'è un eroe o il sacchetto è spento.
        // Tutti i resolver sotto accettano "rolls" come ultimo parametro opzionale.
        // Ogni dado degli eroi viene contato in expeditionStats.diceRolls (statistiche nel Diario).
        function rollD6(rolls, i, hero) {
            const external = rolls && rolls[i];
            let value;
            if (typeof external === 'number' && external >= 1 && external <= 6) {
                value = external;
                if (hero && Array.isArray(hero.diceBag) && hero.diceBag[0] === external) hero.diceBag.shift();
            } else if (peekHeroDice(hero, 1)) {
                value = hero.diceBag.shift();
            } else {
                value = Math.floor(rng() * 6) + 1;
            }
            const st = stato.expeditionStats;
            if (st) (st.diceRolls = st.diceRolls || [0, 0, 0, 0, 0, 0])[value - 1]++;
            return value;
        }

        // Regola del dado naturale per tutti i tiri degli eroi: un 6 sul dado (quello tenuto, con due dadi)
        // riesce sempre, un 1 fallisce sempre, qualunque siano bonus e difficoltà.
        function naturalRollSuccess(roll, total, target) {
            if (roll === 6) return true;
            if (roll === 1) return false;
            return total >= target;
        }

        // Testo per il diario quando il dado naturale ha cambiato l'esito (null se non l'ha cambiato)
        function naturalRollNote(roll, total, target) {
            if (roll === 6 && total < target) return '🎲 6 naturale: successo garantito!';
            if (roll === 1 && total >= target) return '🎲 1 naturale: fallimento garantito!';
            return null;
        }

        // Bonus ai tiri di dado degli eroi (combattimento, prove, contrattazione, preghiera, capitano): effetti
        // speciali "bonus_tiro" di reliquie, oggetti e abilità (js/motore/speciali.js). kind = il tiro ("attacco", "difesa",
        // "aiuto", "prova", "contrattazione", "preghiera", "capitano"); con "tiro" e senza eroe solo quelli della
        // compagnia validi per ogni tiro. Le anteprime li leggono senza consumarli; quelli con un limite (Benedizione
        // del Caos, Sigillo runico) si consumano con spendNextRollRelics dopo il tiro.
        function relicDiceSources(kind = 'tiro', hero = null) {
            const sources = rollSpecialSources(kind, hero).map(r => ({ name: r.name, val: r.val, nextRoll: r.nextRoll }));
            if (kind === 'difesa') sources.push(...colleraSources(hero));  // Ira Traboccante (Aurelio): anche a Difendi
            return sources;
        }

        function relicDiceBonus(kind = 'tiro', hero = null) {
            return relicDiceSources(kind, hero).reduce((sum, r) => sum + r.val, 0);
        }

        // Ira Traboccante (Aurelio): ogni carica di Collera è +1 al tiro per colpire e a Difendi
        function colleraSources(hero) {
            return hero && hero.iraTraboccante && hero.collera > 0 ? [{ name: 'Collera', val: hero.collera, nextRoll: false }] : [];
        }

        // Dopo un tiro di dado di un eroe: consuma i bonus "al prossimo tiro". Ritorna le note per il diario.
        function spendNextRollRelics(kind = 'tiro', hero = null) {
            return spendRollSpecials(kind, hero);
        }

        // Bonus al tiro per colpire (attacco e abilità) in questo round; "notes" finisce nel log.
        // I danni in più (Zanna del leone bianco, oggetti...) arrivano col colpo a segno (fireSpecials 'colpo').
        function relicCombatBonus(hero = null) {
            const sources = [...rollSpecialSources('attacco', hero), ...colleraSources(hero)];
            return { att: sources.reduce((sum, r) => sum + r.val, 0), dmg: 0, notes: sources.map(r => `${r.name} (+${r.val} al tiro)`) };
        }

        // Probabilità che due dadi diano esattamente "target" come somma (7 = 6 casi su 36)
        function exactSumChance(target) {
            let ways = 0;
            for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === target) ways++;
            return ways / 36;
        }

        /* ---------- Anteprima dell'esito sui pulsanti azione ---------- */
        // Modificatore fisso ai tiri per colpire: bonus (es. "Benedetti da Jag Àntar") meno penalità (armature pesanti, maledizioni)
        function attackMod(hero) {
            return (hero.att_bonus || 0) - (hero.att_penalty || 0);
        }

        // Probabilità di ottenere almeno 'needed' con un d6, o con due d6 tenendo il migliore (twoDice) o il peggiore (worst)
        function rollChance(needed, twoDice, worst = false) {
            const fail = (Math.min(6, Math.max(2, needed)) - 1) / 6;
            if (worst) return (1 - fail) * (1 - fail);
            return twoDice ? 1 - fail * fail : 1 - fail;
        }

        function chanceText(needed, twoDice, worst = false) {
            const pct = Math.round(rollChance(needed, twoDice, worst) * 100);
            const note = worst ? ' (tieni il peggiore di due)' : (twoDice ? ' (tieni il migliore di due)' : '');
            if (needed <= 2) return { short: `2+ · ${pct}%`, long: `Basta tutto tranne un 1 (fallimento garantito)${note}: ${pct}% di riuscita`, pct };
            if (needed >= 6) return { short: `6 · ${pct}%`, long: `Serve un 6 naturale (successo garantito)${note}: ${pct}% di riuscita`, pct };
            return { short: `${needed}+ · ${pct}%`, long: `Ti serve ${needed} o più sul dado${note}: ${pct}% di riuscita`, pct };
        }

    // API del modulo: window.Motore.tiri. Gli stessi nomi restano anche globali (Object.assign su window),
    // perché interfaccia, simulatore e test li chiamano per nome. Funzioni solo interne: diceBagActive, newDiceBlock, colleraSources.
    const api = {
        peekHeroDice, rollD6, naturalRollSuccess, naturalRollNote, relicDiceSources, relicDiceBonus,
        spendNextRollRelics, relicCombatBonus, exactSumChance, attackMod, rollChance, chanceText
    };
    window.Motore = window.Motore || {};
    window.Motore.tiri = api;
    Object.assign(window, api);
})();
