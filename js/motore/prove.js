/* ==========================================================================
   MOTORE: PROVE, RIPOSO, EVENTI, PREGHIERA, CAPITANO
   Risoluzione pura di sfide (con le strade), punizioni e maledizioni, riposo, scelte degli eventi,
   preghiera e benedizioni, tiro contro il capitano. Solo regole: niente DOM.
   Le schermate sono in js/prove.js; il simulatore usa le stesse funzioni.
   Modulo: window.Motore.prove (i nomi restano anche globali).
   ========================================================================== */
(function () {
        /* ==========================================================================
           GESTIONE SFIDE
           ========================================================================== */
        // Il nodo corrente è l'ultimo della mappa (nessun collegamento dopo)?
        function isFinalNode() {
            const node = stato.stsMapNodes.find(n => n.id === stato.currentNodeId);
            return !!node && (node.next || []).length === 0;
        }

        /* Strade di una sfida ("strade": [{ testo, stat, cd, malus, prezzo, successText, failText, reward, punishment }]):
           approcci diversi alla stessa prova, scelti prima del tiro, ognuno con la sua statistica (Forza, Intelligenza,
           Fede) e difficoltà; malus = da togliere al tiro, prezzo = effetti pagati subito scegliendo la strada (es. -1 HP
           a tutti, -10 Scudi). Premio, punizione, testi e malus che mancano sono quelli della sfida. Senza strade la
           sfida ha un approccio solo ("Uno di voi si avvicina"). */
        function challengeWithRoad(challenge, i) {
            const road = (challenge.strade || [])[i];
            if (!road) return challenge;
            const out = { ...challenge, roadIndex: i };
            ['stat', 'cd', 'malus', 'successText', 'failText', 'reward', 'punishment'].forEach(k => { if (road[k] != null && road[k] !== '') out[k] = road[k]; });
            return out;
        }

        // La strada con la migliore probabilità di riuscita per l'eroe più adatto (simulatore). Ritorna { i, challenge, pct }
        function bestChallengeRoad(challenge) {
            const alive = stato.party.filter(h => h.hp > 0);
            const prev = stato.challengeState;
            const roads = (challenge.strade || []).length ? challenge.strade.map((_, i) => i) : [null];
            const best = roads.map(i => {
                const ch = i == null ? challenge : challengeWithRoad(challenge, i);
                stato.challengeState = ch;
                const pct = alive.length ? Math.max(...alive.map(h => challengeChanceInfo(challengeModifiers(h)).pct)) : 0;
                return { i, challenge: ch, pct };
            }).reduce((b, r) => (r.pct > b.pct ? r : b));
            stato.challengeState = prev;
            return best;
        }

        // Scudi che il prezzo di una strada chiede (effetti "coins" negativi): senza abbastanza Scudi non si sceglie
        const roadCoinCost = road => -(road.prezzo || []).filter(e => e.effect === 'coins' && e.val < 0).reduce((s, e) => s + e.val, 0);

        // Testo del prezzo per il pulsante (es. "-1 HP a tutti, -10 Scudi")
        function roadPriceText(road) {
            return (road.prezzo || []).map(e => {
                if (e.effect === 'coins') return e.val < 0 ? `${-e.val} Scudi` : `+${e.val} Scudi`;
                if (e.effect === 'party_damage') return `${e.val} HP a tutti`;
                if (e.effect === 'party_heal') return `+${e.val} HP a tutti`;
                if (e.effect === 'party_stat' || e.effect === 'hero_stat') return `${e.val > 0 ? '+' : ''}${e.val} ${EFFECT_STATS[e.stat] || e.stat}`;
                if (e.effect === 'curse' || e.effect === 'add_curse') return 'una maledizione';
                return EFFECT_LABELS[e.effect] || e.effect;
            }).join(', ');
        }

        function roadLabel(road, base = {}) {
            const malus = road.malus != null && road.malus !== '' ? road.malus : base.malus;
            const parts = [STAT_LABELS[road.stat] || road.stat || '', `CD ${road.cd || '?'}`];
            if (malus) parts.push(`−${malus} al tiro`);
            const prezzo = roadPriceText(road);
            if (prezzo) parts.push(`costa ${prezzo}`);
            return `${road.testo || 'Un altro modo'} (${parts.join(', ')})`;
        }

        // Come si tira in una prova: 'worst' (svantaggio) o 'single'.
        // Svantaggio: maledizione "Fede Inaridita" nelle prove di Fede.
        // La passiva di Dioforo "Era solo una prova!" (hero_set challengeRerollMalus) non cambia i dadi:
        // se la prova fallisce si ripete il tiro una volta, con il malus indicato (vedi resolveChallenge).
        function challengeRollMode(hero) {
            if (!hero || !stato.challengeState) return { mode: 'single' };
            const stat = stato.challengeState.stat;
            const disadvantage = stat === 'fth' && hasCurse('fede_inaridita');
            const reroll = hero.challengeRerollMalus ? `Era solo una prova! Se fallisce, ${hero.name} ripete il tiro con −${hero.challengeRerollMalus}` : '';
            if (disadvantage) return { mode: 'worst', note: ['Fede Inaridita: si tirano due dadi e si tiene il più basso', reroll].filter(Boolean).join('. '), source: 'Fede Inaridita' };
            return { mode: 'single', note: reroll || undefined };
        }

        // Modificatori di una prova per l'eroe scelto, senza consumare le reliquie
        function challengeModifiers(hero) {
            const statValue = (hero && hero[stato.challengeState.stat]) || 0;
            const relics = relicDiceSources('prova', hero);
            return {
                statValue,
                relics,
                relicBonus: relics.reduce((sum, r) => sum + r.val, 0),
                // Reliquie che valgono anche al ritiro di Dioforo (non quelle "al prossimo tiro")
                lastingRelicBonus: relics.filter(r => !r.nextRoll).reduce((sum, r) => sum + r.val, 0),
                rollMode: challengeRollMode(hero).mode,
                rerollMalus: (hero && hero.challengeRerollMalus) || 0,
                malus: Number(stato.challengeState.malus) || 0,   // malus della sfida o della strada scelta
                safetyNet: hasSpecial('prova_fallita', 'prova_riuscita', hero)
            };
        }

        function challengeChanceInfo(mods) {
            const needed = stato.challengeState.cd - mods.statValue - mods.relicBonus + (mods.malus || 0);
            if (mods.safetyNet) return { short: 'Sicuro', long: 'Riuscita garantita: un effetto speciale trasforma un fallimento in successo', pct: 100 };
            const info = chanceText(needed, mods.rollMode === 'best', mods.rollMode === 'worst');
            if (!mods.rerollMalus) return info;
            // Era solo una prova!: un secondo tentativo con il malus se il primo fallisce,
            // senza le reliquie "al prossimo tiro" (consumate dal primo)
            const needed2 = stato.challengeState.cd - mods.statValue - (mods.lastingRelicBonus || 0) + mods.rerollMalus + (mods.malus || 0);
            const p1 = rollChance(needed, mods.rollMode === 'best', mods.rollMode === 'worst');
            const p2 = rollChance(needed2, mods.rollMode === 'best', mods.rollMode === 'worst');
            const pct = Math.round((p1 + (1 - p1) * p2) * 100);
            const head = needed <= 2 ? '2+' : (needed >= 6 ? '6' : `${needed}+`);
            return { short: `${head} · ${pct}%`, long: `${info.long.replace(/: \d+% di riuscita$/, '')}; se fallisce ripete il tiro con −${mods.rerollMalus}: ${pct}% di riuscita`, pct };
        }

        // Risolve una prova: tiro (con svantaggio e ritiro di Dioforo), reliquie, ricompensa/punizione.
        // Muta unlockedRelics/activeCurses/expeditionStats. "events" sono le righe di log in ordine.
        function resolveChallenge(hero, challenge, rolls) {
            const events = [];
            const rollMode = challengeRollMode(hero);
            const twoDice = rollMode.mode !== 'single';
            const mods = challengeModifiers(hero);
            const statLabel = STAT_LABELS[challenge.stat] || 'Statistica';

            // Un tentativo: dadi (offset = indice del primo dado in "rolls"), statistica, reliquie, malus.
            // Le reliquie "al prossimo tiro" (Anello, Sigillo) valgono e si consumano solo al primo
            // tentativo: il ritiro di Dioforo è lo stesso tiro ripetuto, non un tiro nuovo.
            const attempt = (offset, malus) => {
                const reroll = malus > 0;
                const roll = rollD6(rolls, offset, hero);
                let roll2 = null, kept = roll;
                if (twoDice) {
                    roll2 = rollD6(rolls, offset + 1, hero);
                    kept = rollMode.mode === 'best' ? Math.max(roll, roll2) : Math.min(roll, roll2);
                    events.push({ type: 'roll2', text: `🎲 Dadi [${roll}, ${roll2}]: tiene <b>${kept}</b> (${rollMode.source})` });
                } else {
                    events.push({ type: 'roll', text: `🎲 Dado: <b>${roll}</b>` });
                }
                events.push({ type: 'stat', text: `+${mods.statValue} ${statLabel} (${hero ? hero.name : '—'})` });

                let relicBonus = 0;
                relicDiceSources('prova', hero).filter(r => !reroll || !r.nextRoll).forEach(r => {
                    relicBonus += r.val;
                    events.push({ type: 'relic', text: `+${r.val} ${r.name}` });
                });
                if (!reroll) spendNextRollRelics('prova', hero).forEach(text => events.push({ type: 'relic', text }));
                if (malus) events.push({ type: 'malus', text: `−${malus} secondo tentativo` });
                if (mods.malus) events.push({ type: 'malus', text: `−${mods.malus} malus della prova` });

                const total = kept + mods.statValue + relicBonus - malus - mods.malus;
                events.push({ type: 'total', text: `= <b>${total}</b> contro CD ${challenge.cd}` });
                const natural = naturalRollNote(kept, total, challenge.cd);
                if (natural) events.push({ type: 'natural', text: natural });
                return { roll, roll2, kept, relicBonus, total, success: naturalRollSuccess(kept, total, challenge.cd) };
            };

            const first = attempt(0, 0);
            let final = first, rerolled = false;
            // Era solo una prova! (Dioforo): una prova fallita si ritenta una volta, con il malus
            if (!first.success && hero && hero.challengeRerollMalus) {
                events.push({ type: 'reroll', text: `🔁 Era solo una prova! ${hero.name} ripete il tiro (−${hero.challengeRerollMalus})` });
                final = attempt(2, hero.challengeRerollMalus);
                rerolled = true;
            }
            const { roll, roll2, kept, relicBonus } = final;
            let { total, success } = final;

            // Effetti "prova_fallita → prova_riuscita" (Fortuna degli Stolti): il fallimento diventa un successo
            if (!success) {
                const saved = fireSpecials('prova_fallita', hero, { fai: ['prova_riuscita'] });
                if (saved.success) {
                    total = Math.max(total, challenge.cd);
                    success = true;
                    saved.notes.forEach(text => events.push({ type: 'relic', text }));
                }
            }

            events.push({ type: 'outcome', text: success ? '<b class="log-success">Successo</b>' : '<b class="log-fail">Fallimento</b>' });

            let rewardGranted = null, punishmentApplied = null;
            if (success) {
                const relicId = challenge.reward && challenge.reward.type === 'relic' && (challenge.reward.id || idFromName(challenge.reward.name));
                if (relicId && hasRelic(relicId)) {
                    // Una reliquia si possiede una volta sola (la stessa sfida può tornare, es. nelle campagne procedurali)
                    events.push({ type: 'relic', text: `${challenge.reward.name}: la compagnia la possiede già` });
                } else if (challenge.reward) {
                    // Solo le reliquie restano nell'elenco: i premi immediati (es. monete) agiscono e basta
                    if (relicId) stato.unlockedRelics.push({ ...challenge.reward, id: relicId });
                    applyEffects(challenge.reward.effects, hero);
                    if (relicId) discover('relics', challenge.reward.name);
                    rewardGranted = challenge.reward;
                }
                stato.expeditionStats.challengesPassed++;
            } else {
                // Effetti "prova_fallita → annulla_punizione" (Mappa del Contrabbandiere: non nel finale, poi si consuma)
                const escape = challenge.punishment ? fireSpecials('prova_fallita', hero, { fai: ['annulla_punizione'] }) : null;
                if (escape && escape.skipPunishment) {
                    escape.notes.forEach(text => events.push({ type: 'item', text: `🗺️ ${text}` }));
                } else if (challenge.punishment) {
                    applyPunishment(challenge.punishment, hero);
                    punishmentApplied = challenge.punishment;
                }
                stato.expeditionStats.challengesFailed++;
            }

            // Prova sull'ultimo nodo della mappa: la riuscita è la vittoria, il fallimento la sconfitta
            const isFinal = isFinalNode();

            return { roll, roll2, kept, twoDice, rollMode, mods, relicBonus, total, success, rerolled, firstAttempt: rerolled ? first : null, rewardGranted, punishmentApplied, isFinal, events };
        }

        // Punizione di una prova o maledizione data da un evento (effetto "curse"): applica gli effetti e la registra
        // fra le maledizioni attive con l'id della libreria, ricordando quanto hanno tolto i party_stat
        // (removeCurseAt lo restituisce quando la maledizione viene tolta)
        function applyPunishment(p, hero) {
            const cursesBefore = stato.activeCurses.length;
            // Quanto cambiano davvero le statistiche (party_stat non scende sotto 0)
            const statKeys = [...new Set((p.effects || []).filter(e => e.effect === 'party_stat').map(e => e.stat))];
            // Si misura senza i bonus ricalcolati (Factotum, oggetti che scalano): quelli tornano da soli
            const own = (h, k) => (h[k] || 0) - ((h.factotumBonus || {})[k] || 0) - ((h.scaledBonus || {})[k] || 0);
            const before = stato.party.map(h => statKeys.map(k => own(h, k)));
            applyEffects(p.effects, hero);
            const applied = {};
            stato.party.forEach((h, i) => statKeys.forEach((k, j) => {
                const d = own(h, k) - before[i][j];
                if (d) (applied[h.name] = applied[h.name] || {})[k] = d;
            }));
            if (p.type === 'curse') discover('curses', p.name);
            const curseId = p.id || idFromName(p.name);
            // Le maledizioni aggiunte dagli effetti prendono l'id della maledizione della libreria
            stato.activeCurses.slice(cursesBefore).forEach(c => { c.id = curseId; });
            if (stato.activeCurses.length === cursesBefore) {
                stato.activeCurses.push({ id: curseId, text: `${p.name} (${p.desc})` });
            }
            if (statKeys.length) stato.activeCurses[stato.activeCurses.length - 1].applied = applied;
        }

        // Toglie una maledizione e ne annulla i malus fissi (party_stat: -Fede, -Int, +penalità al tiro).
        // Se la maledizione ricorda quanto ha tolto a ogni eroe ("applied", scritto da resolveChallenge)
        // si restituisce esattamente quello: chi era già a 0 non guadagna punti. Altrimenti (salvataggi
        // vecchi) gli effetti si cercano nella libreria Maledizioni, poi nelle punizioni delle sfide.
        function removeCurseAt(idx) {
            const curse = stato.activeCurses[idx];
            if (!curse) return;
            stato.activeCurses.splice(idx, 1);
            if (curse.applied) {
                stato.party.forEach(h => Object.entries(curse.applied[h.name] || {}).forEach(([k, d]) => {
                    h[k] = Math.max(0, (h[k] || 0) - d);
                }));
                stato.party.forEach(refreshScaledBonuses);
                return;
            }
            const fromLib = (LIBRERIA.maledizioni || {})[curse.id];
            const fromChallenge = Object.values(challengesData || {}).map(c => c.punishment)
                .find(p => p && typeof p === 'object' && (p.id || idFromName(p.name || '')) === curse.id);
            const effects = (fromLib || fromChallenge || {}).effects || [];
            effects.filter(e => e.effect === 'party_stat').forEach(e => {
                stato.party.forEach(h => { h[e.stat] = Math.max(0, (h[e.stat] || 0) - e.val); });
            });
            stato.party.forEach(refreshScaledBonuses);
        }

        // Risolve un riposo: cura party (1 HP più gli effetti "riposo → bonus_cura": Unguento dell'erborista,
        // Coperta di Lana), rimuove Gelo nelle ossa, poi gli effetti del riposo (Pietra del focolare...).
        function resolveRest() {
            const healAmount = 1 + specialSum('riposo', 'bonus_cura', null);  // uguale per tutti (reliquie)
            const healed = [];
            const before = new Map(stato.party.map(h => [h, h.hp]));
            stato.party.forEach(h => {
                // Un eroe caduto (0 HP) si rialza con 1 HP
                if (h.hp <= 0) {
                    h.hp = 1;
                    healed.push({ hero: h, name: h.name, gained: 1, hp: h.hp, maxHp: h.maxHp, revived: true });
                    return;
                }
                h.hp = Math.min(h.maxHp, h.hp + 1 + specialSum('riposo', 'bonus_cura', h));
                healed.push({ hero: h, name: h.name, gained: h.hp - before.get(h), hp: h.hp, maxHp: h.maxHp });
            });

            // Il riposo è una cura: effetti "cura_ricevuta" (Favore di Valgoren: 1 HP in più a un eroe ancora ferito)
            if (healed.some(h => h.gained > 0 && !h.revived)) {
                const echo = fireSpecials('cura_ricevuta', null);
                if (echo.fired.length) healed.forEach(line => {
                    if (line.revived || line.hero.hp === line.hp) return;
                    line.gained = line.hero.hp - before.get(line.hero);
                    line.hp = line.hero.hp;
                    line.valgoren = true;
                });
            }
            healed.forEach(line => { delete line.hero; });

            let geloRemoved = false;
            const geloIdx = stato.activeCurses.findIndex(c => c.id === 'gelo_nelle_ossa');
            if (geloIdx > -1) {
                removeCurseAt(geloIdx);
                geloRemoved = true;
            }

            const notes = fireSpecialsAll('riposo').notes;  // Pietra del focolare: toglie una maledizione a caso

            return { healAmount, healed, geloRemoved, notes };
        }

        // Testo del pulsante di una scelta: costo e prova
        function storyChoiceLabel(c) {
            const extra = [c.costo ? `${c.costo} Scudi` : '', c.stat ? `prova di ${STAT_LABELS[c.stat] || c.stat}, CD ${c.cd || 0}` : ''].filter(Boolean);
            return `${c.testo || 'Scegli'}${extra.length ? ` (${extra.join(', ')})` : ''}`;
        }

        // Risolve una scelta senza interfaccia (gioco e test). Ritorna null se non si può (Scudi insufficienti)
        // o { hero, roll, total, success, text, effetti }
        function resolveStoryChoice(choice, rolls) {
            if (!choice || (choice.costo || 0) > stato.partyCoins) return null;
            stato.partyCoins -= choice.costo || 0;
            let hero = null, roll = null, total = null, success = true;
            if (choice.stat) {
                const alive = stato.party.filter(h => h.hp > 0);
                hero = alive.reduce((b, h) => (h[choice.stat] || 0) > (b[choice.stat] || 0) ? h : b, alive[0]) || null;
                if (hero) {
                    roll = rollD6(rolls, 0, hero);
                    total = roll + (hero[choice.stat] || 0) + relicDiceBonus('prova', hero);
                    spendNextRollRelics('prova', hero);
                    success = naturalRollSuccess(roll, total, choice.cd || 0);
                } else success = false;
            }
            const outcome = success ? choice : (choice.fallimento || {});
            applyEffects(outcome.effetti || [], hero);
            return { hero, roll, total, success, text: outcome.esito || '', effetti: outcome.effetti || [] };
        }

        const blessingData = id => PRAYER_BLESSINGS[id] ? { id, ...PRAYER_BLESSINGS[id] } : null;

        const hasBlessing = (hero, id) => !!(hero.blessings || []).find(x => x.id === id);

        // Benedizioni che adesso servono a qualcosa (niente Sentenza di Rattvisa senza maledizioni, niente cure se nessuno è ferito)
        function blessingUseful(b) {
            if (b.effetto === 'togli_maledizione') return stato.activeCurses.length > 0;
            if (b.effetto === 'cura_party') return stato.party.some(h => h.hp > 0 && h.hp < h.maxHp);
            return true;
        }

        function pickBlessings(major) {
            const pool = Object.keys(PRAYER_BLESSINGS).map(blessingData)
                .filter(b => b.livello === (major ? 'maggiore' : 'minore') && blessingUseful(b));
            const out = [];
            while (pool.length && out.length < PRAYER_CHOICES) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
            return out;
        }

        // Tiro della preghiera, senza interfaccia (usato anche dal simulatore)
        function prayerRoll(hero) {
            const roll = rollD6(null, 0, hero);
            const relics = relicDiceBonus('preghiera', hero);
            const items = itemPrayerBonus(hero);  // oggetti con prayer_bonus (Reliquiario Tascabile)
            const total = roll + (hero.fth || 0) + relics + items;
            const notes = spendNextRollRelics('preghiera', hero);
            const success = naturalRollSuccess(roll, total, PRAYER_CD);
            return { roll, total, relics, items, notes, success, major: success && (roll === 6 || total >= PRAYER_MAJOR_TOTAL),
                naturalNote: naturalRollNote(roll, total, PRAYER_CD) };
        }

        // Dà una benedizione: hero = chi la riceve (per quelle "eroe"). Ritorna il testo per il giocatore
        function applyBlessing(b, hero) {
            if (b.bersaglio === 'eroe') {
                if (!hero || hero.hp <= 0) return '';
                if (b.effetto === 'fede') { hero.fth = (hero.fth || 0) + (b.val || 1); refreshScaledBonuses(hero); }
                const list = hero.blessings = hero.blessings || [];
                const same = list.find(x => x.id === b.id);
                if (same) same.n = (same.n || 1) + 1; else list.push({ id: b.id, n: 1 });
                return `${hero.name} riceve ${b.name}: ${b.desc.charAt(0).toLowerCase()}${b.desc.slice(1)}.`;
            }
            let text = `${b.name}: ${b.desc.charAt(0).toLowerCase()}${b.desc.slice(1)}.`;
            if (b.effetto === 'cura_party') stato.party.filter(h => h.hp > 0).forEach(h => healHero(h, b.val || 1));
            if (b.effetto === 'bottino_extra') stato.party.lootExtraChoices = (stato.party.lootExtraChoices || 0) + (b.val || 1);
            if (b.effetto === 'togli_maledizione' && stato.activeCurses.length) {
                text = `${b.name}: svanisce ${curseText(stato.activeCurses[stato.activeCurses.length - 1])}.`;
                removeCurseAt(stato.activeCurses.length - 1);
            }
            return text;
        }

        // Inizio di uno scontro (gioco e simulatore): le benedizioni "al prossimo scontro" diventano potenziamenti
        // fino alla fine dello scontro (con la loro icona tra i buff della carta). Ritorna [{ hero, b }] per il diario
        function applyCombatBlessings() {
            const used = [];
            stato.party.filter(h => h.hp > 0 && h.blessings && h.blessings.length).forEach(h => {
                h.blessings = h.blessings.filter(x => {
                    const b = blessingData(x.id);
                    if (!b || b.effetto !== 'prossimo_scontro') return true;
                    (b.buffs || [b]).forEach(buff =>
                        applyTempBuff(h, { buff_stat: buff.buff_stat, buff_val: buff.buff_val * (x.n || 1), buff_rounds: 0, name: b.name, icon: b.icon }));
                    used.push({ hero: h, b });
                    return false;
                });
            });
            return used;
        }

        // Risolve l'azione del finale "capitano": 'force' dimezza gli HP, 'faith'/'int' tirano contro CD 6.
        function resolveCaptainAction(hero, type) {
            if (type === 'force') {
                const roll = Math.floor(rng() * 6) + 1;  // solo scena: la forza non tira davvero
                hero.hp = Math.max(1, Math.floor(hero.hp / 2));
                return { type, roll, success: null };
            }
            const roll = rollD6(null, 0, hero);
            const statVal = type === 'faith' ? hero.fth : hero.int;
            // Anche qui valgono le reliquie dei tiri; la Catena di Norgrad vale contro il capitano
            const relicBonus = relicDiceBonus('capitano', hero);  // anche la Catena di Norgrad: "capitano → bonus_tiro"
            spendNextRollRelics('capitano', hero);
            const success = naturalRollSuccess(roll, roll + statVal + relicBonus, 6);
            return { type, roll, statVal, relicBonus, success };
        }

    // API del modulo: window.Motore.prove. Gli stessi nomi restano anche globali (Object.assign su window),
    // perché interfaccia, simulatore e test li chiamano per nome. Funzioni solo interne: blessingUseful.
    const api = {
        isFinalNode, challengeWithRoad, bestChallengeRoad, roadCoinCost, roadPriceText, roadLabel,
        challengeRollMode, challengeModifiers, challengeChanceInfo, resolveChallenge, applyPunishment, removeCurseAt,
        resolveRest, storyChoiceLabel, resolveStoryChoice, blessingData, hasBlessing, pickBlessings,
        prayerRoll, applyBlessing, applyCombatBlessings, resolveCaptainAction
    };
    window.Motore = window.Motore || {};
    window.Motore.prove = api;
    Object.assign(window, api);
})();
