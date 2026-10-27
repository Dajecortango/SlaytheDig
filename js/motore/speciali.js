/* ==========================================================================
   MOTORE: EFFETTI SPECIALI "QUANDO → FAI"
   Motore degli effetti scritti nel campo "speciali" di oggetti, reliquie, maledizioni e abilità
   (vocabolario e testi in js/comune.js: SPECIALI_QUANDO, SPECIALI_FAI, specialeTesto).
   Gioco e simulatore chiamano sempre queste funzioni, così un effetto nuovo creato dall'editor
   vale ovunque senza codice:
     - fireSpecials(quando, eroe, ctx): i momenti con un'azione (inizio scontro, colpo a segno, colpito,
       riposo, prova fallita...): applica le azioni e ritorna note e risultati per chi chiama;
     - rollSpecialBonus(tiro, eroe) / spendRollSpecials(tiro, eroe): i bonus ai tiri di dado,
       letti senza consumarli (anteprime) e consumati dopo il tiro;
     - specialSum(quando, fai, eroe): i bonus da sommare (cure in più, sconti...).
   Fonti: per un eroe gli oggetti nello zaino e le sue abilità (passiva scelta, rune equipaggiate);
   per la compagnia le reliquie e le maledizioni. Reliquie, maledizioni e abilità si leggono dalla
   libreria per id, così una modifica nell'editor vale anche per le partite salvate.
   Limiti ("una volta per scontro / capitolo"): in hero.specialUses e stato.party.specialUses
   ({ scontro: { chiave: usi }, capitolo: {...} }), salvati con la partita.
   Modulo: window.Motore.speciali (i nomi restano anche globali). Le icone degli stati sulla carta
   (heroStatusesHtml) sono in js/oggetti.js.
   ========================================================================== */
(function () {
        // Effetti di un oggetto: il campo "speciali", o i campi del formato di prima (LEGACY_ITEM_SPECIALS)
        function itemSpecials(item) {
            if (!item) return [];
            if (Array.isArray(item.speciali)) return item.speciali;
            return Object.keys(LEGACY_ITEM_SPECIALS).filter(k => Number(item[k])).map(k => LEGACY_ITEM_SPECIALS[k](Number(item[k])));
        }

        // Effetti di un'abilità: dalla libreria per id (le modifiche dell'editor valgono anche per i salvataggi;
        // i salvataggi più vecchi hanno l'abilità senza id: si cerca per nome), altrimenti quelli scritti
        // nell'abilità (abilità scritte dentro un eroe)
        function abilitySpecials(ability) {
            if (!ability) return [];
            const lib = LIBRERIA.abilita || {};
            const full = (ability.id && lib[ability.id]) || (!ability.id && Object.values(lib).find(a => a.name === ability.name)) || {};
            return full.speciali || ability.speciali || [];
        }

        function relicSpecials(relic) {
            const fromLib = relic && relic.id && ((LIBRERIA.reliquie || {})[relic.id] || {}).speciali;
            return fromLib || (relic && relic.speciali) || [];
        }

        function curseSpecials(curse) {
            const fromLib = curse && curse.id && ((LIBRERIA.maledizioni || {})[curse.id] || {}).speciali;
            return fromLib || (curse && curse.speciali) || [];
        }

        // Abilità che agiscono sempre: quella scelta, le rune equipaggiate e le abilità fisse dell'eroe
        // ("abilitaFisse" nella libreria Eroi: le ha sempre, oltre a quella scelta; es. Hammergradiano Puro di Enea)
        function heroAbilityRefs(hero) {
            const out = [];
            if (hero.chosenAbility) out.push(hero.chosenAbility);
            (hero.equippedRunes || []).forEach(id => out.push({ id, ...((LIBRERIA.abilita || {})[id] || {}) }));
            (hero.abilitaFisse || []).forEach(id => out.push({ id, ...((LIBRERIA.abilita || {})[id] || {}) }));
            return out;
        }

        // Voce di una fonte: { s: effetto, owner: eroe (null per la compagnia), kind, name, icon, key, ref }
        function heroSpecialSources(hero) {
            if (!hero) return [];
            const out = [];
            (hero.items || []).forEach(it => itemSpecials(it).forEach((s, i) =>
                out.push({ s, owner: hero, kind: 'oggetto', name: it.name, icon: it.icon || '', ref: it, key: `o:${it.id || it.name}#${i}` })));
            heroAbilityRefs(hero).forEach(ab => abilitySpecials(ab).forEach((s, i) =>
                out.push({ s, owner: hero, kind: 'abilita', name: ab.name, icon: ab.icon || '', ref: ab, key: `a:${ab.id || ab.name}#${i}` })));
            // Doni delle benedizioni (effetto "dono"): restano sull'eroe e agiscono come una passiva
            (hero.blessings || []).forEach(x => {
                const b = PRAYER_BLESSINGS[x.id];
                ((b && b.speciali) || []).forEach((s, i) =>
                    out.push({ s, owner: hero, kind: 'benedizione', name: b.name, icon: b.icon || '', ref: x, key: `b:${x.id}#${i}` }));
            });
            return out;
        }

        function partySpecialSources() {
            const out = [];
            (stato.unlockedRelics || []).forEach(r => relicSpecials(r).forEach((s, i) =>
                out.push({ s, owner: null, kind: 'reliquia', name: relicName(r.id), icon: '', ref: r, key: `r:${r.id}#${i}` })));
            (stato.activeCurses || []).forEach(c => curseSpecials(c).forEach((s, i) => {
                const lib = (LIBRERIA.maledizioni || {})[c.id] || {};
                out.push({ s, owner: null, kind: 'maledizione', name: lib.name || c.id, icon: '', ref: c, key: `m:${c.id}#${i}` });
            }));
            return out;
        }

        // Momenti che riguardano tutta la compagnia: valgono gli oggetti e le abilità di ogni eroe in piedi
        const SPECIALI_DI_COMPAGNIA = ['prova_fallita', 'bottino', 'mercante', 'cura_ricevuta'];

        // Fonti valide per un momento: quelle dell'eroe (o di tutti gli eroi in piedi), poi quelle della compagnia.
        // scope: 'own' = solo quelle dell'eroe, 'party' = solo reliquie e maledizioni (vedi fireSpecialsAll)
        function specialSources(quando, hero, scope) {
            const own = scope === 'party' ? []
                : SPECIALI_DI_COMPAGNIA.includes(quando) ? stato.party.filter(h => h.hp > 0).flatMap(heroSpecialSources)
                : heroSpecialSources(hero);
            return scope === 'own' ? own : [...own, ...partySpecialSources()];
        }

        // Il momento dell'effetto corrisponde? I bonus ai tiri valgono anche per "tiro" (tutti) e "tiro_scontro"
        function specialWhenMatches(sq, quando) {
            if (sq === quando) return true;
            if (!SPECIALI_TIRI.includes(quando)) return false;
            return sq === 'tiro' || (sq === 'tiro_scontro' && ['attacco', 'difesa', 'aiuto'].includes(quando));
        }

        function specialUsesStore(entry) {
            const holder = entry.owner || stato.party;
            const store = holder.specialUses = holder.specialUses || {};
            store.scontro = store.scontro || {};
            store.capitolo = store.capitolo || {};
            return store;
        }

        // Ancora utilizzabile secondo il limite?
        function specialAvailable(entry) {
            const s = entry.s;
            if (!s.limite) return true;
            const used = (specialUsesStore(entry)[s.limite] || {})[entry.key] || 0;
            return used < (s.volte || 1);
        }

        function specialUsesLeft(entry) {
            const s = entry.s;
            if (!s.limite) return Infinity;
            return (s.volte || 1) - ((specialUsesStore(entry)[s.limite] || {})[entry.key] || 0);
        }

        // Condizioni dell'effetto (senza la probabilità, che si tira solo quando scatta davvero).
        // ctx: { enemy, enemyHpBefore, splash }
        function specialConditionsMet(entry, hero, ctx = {}) {
            const s = entry.s;
            const who = entry.owner || hero;
            if (s.round && stato.combatRound !== s.round) return false;
            const enemy = ctx.enemy || stato.activeEnemy;
            switch (s.se) {
                case undefined: case null: case '': return true;
                case 'elite': return ctx.isElite != null ? !!ctx.isElite : currentEnemyIsEliteOrBoss();
                case 'nemico_meta': {
                    if (!enemy) return false;
                    const hp = ctx.enemyHpBefore != null ? ctx.enemyHpBefore : enemy.hp;
                    return hp <= enemy.maxHp / 2;
                }
                case 'nemico_quarto': {
                    if (!enemy) return false;
                    const hp = ctx.enemyHpBefore != null ? ctx.enemyHpBefore : enemy.hp;
                    return hp <= enemy.maxHp / 4;
                }
                case 'nemico_meta_quarto': {
                    if (!enemy) return false;
                    const hp = ctx.enemyHpBefore != null ? ctx.enemyHpBefore : enemy.hp;
                    return hp <= enemy.maxHp / 2 && hp > enemy.maxHp / 4;
                }
                case 'perso_hp_scontro': return !!who && !!who.hpLostInCombat;
                case 'ferito': return !!who && who.hp > 0 && who.hp <= WOUNDED_HP;
                case 'senza_armatura': return !!who && (who.current_armor || 0) <= 0;
                case 'ha_difeso': return !!who && who.defendRound === stato.combatRound;
                case 'primo_ad_agire': return !!who && stato.party.every(h => h === who || !h.hasActed);
                case 'colpo_pieno': return !ctx.splash;
                case 'non_finale': return !isFinalNode();
                default: return false;
            }
        }

        // Effetti di un momento che possono scattare adesso (filtro facoltativo su "fai")
        function specialEntries(quando, hero, ctx = {}, faiList = null) {
            return specialSources(quando, hero).filter(e => specialWhenMatches(e.s.quando, quando)
                && (!faiList || faiList.includes(e.s.fai)) && specialAvailable(e) && specialConditionsMet(e, hero, ctx));
        }

        // Segna un uso; con "rompe", finite le volte (o subito, senza limite) la fonte si esaurisce.
        // Ritorna la nota per il diario se si è esaurita.
        function markSpecialUsed(entry) {
            const s = entry.s;
            if (s.limite) {
                const store = specialUsesStore(entry)[s.limite];
                store[entry.key] = (store[entry.key] || 0) + 1;
            }
            if (s.rompe && specialUsesLeft(entry) <= 0 || (s.rompe && !s.limite)) return exhaustSpecialSource(entry);
            return null;
        }

        // La reliquia si rompe, l'oggetto si consuma (una copia), la maledizione sparisce
        function exhaustSpecialSource(entry) {
            if (entry.kind === 'reliquia') { breakRelic(entry.ref.id); return `${entry.name} si rompe`; }
            if (entry.kind === 'maledizione') {
                const idx = stato.activeCurses.indexOf(entry.ref);
                if (idx > -1) removeCurseAt(idx);
                return `${entry.name} svanisce`;
            }
            if (entry.kind === 'benedizione' && entry.owner) {
                entry.owner.blessings = (entry.owner.blessings || []).filter(x => x !== entry.ref);
                return `${entry.name} svanisce`;
            }
            if (entry.kind === 'oggetto' && entry.owner) {
                const idx = entry.owner.items.indexOf(entry.ref);
                if (idx > -1) {
                    if ((entry.ref.qty || 1) <= 1) revertItemEffects(entry.ref, entry.owner);
                    consumeOne(entry.owner, idx);
                }
                return `${entry.name} si consuma`;
            }
            return null;
        }

        // Azzera i limiti "una volta per scontro" (inizio di ogni scontro: gioco e simulatore)
        function resetCombatSpecialUses() {
            [...stato.party, stato.party].forEach(holder => { if (holder.specialUses) holder.specialUses.scontro = {}; });
        }

        /* ---------- Bonus ai tiri di dado ---------- */

        // Fonti del bonus a un tiro ("attacco", "difesa", "prova", ...; vedi SPECIALI_TIRI), senza consumarle.
        // [{ name, val, nextRoll }]: nextRoll = ha un limite, si consuma con spendRollSpecials dopo il tiro
        function rollSpecialSources(kind, hero) {
            return specialEntries(kind, hero, {}, ['bonus_tiro'])
                .map(e => ({ entry: e, name: e.name, val: e.s.val || 0, nextRoll: !!e.s.limite || !!e.s.rompe }));
        }

        function rollSpecialBonus(kind, hero) {
            return rollSpecialSources(kind, hero).reduce((sum, r) => sum + r.val, 0);
        }

        // Dopo il tiro: consuma i bonus con un limite. Ritorna le note per il diario
        function spendRollSpecials(kind, hero) {
            const notes = [];
            rollSpecialSources(kind, hero).filter(r => r.nextRoll).forEach(r => {
                const broken = markSpecialUsed(r.entry);
                if (broken) notes.push(broken);
                else if (specialUsesLeft(r.entry) !== Infinity) {
                    const left = specialUsesLeft(r.entry);
                    notes.push(`${r.name}: ${left === 1 ? 'resta 1 tiro' : `restano ${left} tiri`}`);
                }
            });
            return notes;
        }

        // Somma dei bonus "da aggiungere" di un momento (bonus_cura al riposo, sconti dal mercante...)
        function specialSum(quando, fai, hero, ctx = {}) {
            return specialEntries(quando, hero, ctx, [fai]).reduce((sum, e) => sum + (e.s.val || 0), 0);
        }

        // Sconto percentuale del mercante: le fonti si moltiplicano (50% e 20% = il 60% del prezzo... di sconto: 0.5 × 0.8);
        // la stessa abilità su più eroi conta una volta
        function specialPriceFactor() {
            const seen = new Set();
            return specialEntries('mercante', null, {}, ['sconto_percento']).reduce((f, e) => {
                if (seen.has(e.key)) return f;
                seen.add(e.key);
                return f * Math.max(0, 1 - (e.s.val || 0) / 100);
            }, 1);
        }

        /* ---------- Azioni dei momenti ---------- */

        function specialTargets(entry, hero, ctx = {}) {
            const who = entry.owner || hero;
            const alive = stato.party.filter(h => h.hp > 0);
            switch (entry.s.bersaglio || (who ? 'eroe' : 'compagnia')) {
                case 'compagnia': return alive;
                // Scelto da chi usa l'abilità (ctx.target, dalla finestra di scelta); senza scelta l'eroe stesso
                case 'scelto': {
                    const t = ctx.target && ctx.target.hp > 0 ? ctx.target : who;
                    return t && t.hp > 0 ? [t] : [];
                }
                case 'meno_hp': {
                    const wounded = alive.filter(h => h.hp < h.maxHp);
                    return wounded.length ? [wounded.reduce((a, b) => b.hp < a.hp ? b : a)] : [];
                }
                case 'piu_ferito': {
                    const wounded = alive.filter(h => h.hp < h.maxHp);
                    return wounded.length ? [wounded.reduce((a, b) => (b.maxHp - b.hp) > (a.maxHp - a.hp) ? b : a)] : [];
                }
                case 'altro_casuale': {
                    const others = alive.filter(h => h !== who && h.hp < h.maxHp);
                    return others.length ? [others[Math.floor(rng() * others.length)]] : [];
                }
                // Gli eroi in piedi subito prima e subito dopo di lui nell'ordine della compagnia (Scudo del Nord)
                case 'vicini': {
                    const idx = stato.party.indexOf(who);
                    if (idx < 0) return [];
                    return [stato.party[idx - 1], stato.party[idx + 1]].filter(h => h && h.hp > 0);
                }
                default: return who && who.hp > 0 ? [who] : [];
            }
        }

        // Potenziamento temporaneo (come le pozioni): durata in round, 0 o vuoto = fino a fine scontro
        function addSpecialBuff(h, entry) {
            const s = entry.s;
            h[s.stat] = (h[s.stat] || 0) + (s.val || 0);
            (h.tempBuffs = h.tempBuffs || []).push({ stat: s.stat, val: s.val || 0, name: entry.name, icon: entry.icon || '',
                expiresAfterRound: s.durata ? Math.max(1, stato.combatRound) + s.durata - 1 : Infinity });
        }

        // Momento "quando" per l'eroe "hero" (null = la compagnia). ctx: { enemy, enemyHpBefore, splash, attacker }.
        // Applica le azioni e ritorna { notes, dmg, cancel, revive, skipPunishment, success, coins, cards }:
        // dmg = danni in più del colpo (quando "colpo", li aggiunge chi chiama), cancel = colpo annullato,
        // revive = HP con cui restare in piedi (colpo_mortale). I bonus (bonus_tiro, bonus_cura, sconti) non scattano qui.
        const SPECIALI_BONUS = ['bonus_tiro', 'bonus_cura', 'sconto', 'sconto_percento', 'ritira'];
        function fireSpecials(quando, hero, ctx = {}) {
            const entries = specialSources(quando, hero, ctx.scope).filter(e => e.s.quando === quando && !SPECIALI_BONUS.includes(e.s.fai)
                && (!ctx.fai || ctx.fai.includes(e.s.fai)));
            return runSpecialEntries(entries, quando, hero, ctx);
        }

        // Applica le azioni di un elenco di voci (fonti già scelte): usata da fireSpecials e dagli effetti
        // delle abilità attive (abilitySpecialEffects). Stessi risultati di fireSpecials
        function runSpecialEntries(entries, quando, hero, ctx = {}) {
            const res = { notes: [], dmg: 0, cancel: false, revive: null, skipPunishment: false, success: false, coins: 0, cards: 0, items: [], fired: [] };
            const enemy = ctx.enemy || stato.activeEnemy;
            for (const e of entries) {
                if (res.cancel || res.revive != null) break;  // colpo già annullato o eroe già salvato
                const s = e.s;
                if (!specialAvailable(e) || !specialConditionsMet(e, hero, ctx)) continue;
                if (s.prob && rng() * 100 >= s.prob) continue;
                const v = s.val || 0;
                const who = e.owner || hero;
                let note = null;
                switch (s.fai) {
                    case 'danni':
                        if (quando === 'colpo') { res.dmg += v; note = `+${v} danni`; break; }
                        // Niente danni al nemico dai colpi agli eroi accanto e dagli attacchi in risposta (fuori dal suo turno)
                        if (!enemy || enemy.hp <= 0 || ctx.splash || ctx.reaction) continue;
                        enemy.hp -= v;
                        note = `${v} ${v === 1 ? 'danno' : 'danni'} a ${enemy.name}`;
                        break;
                    case 'cura': {
                        const healed = specialTargets(e, hero, ctx).map(t => {
                            // Un'eco di cura non fa scattare altre cure (Favore di Valgoren)
                            const g = quando === 'cura_ricevuta' ? Math.min(v, t.maxHp - t.hp) : healHero(t, v);
                            if (quando === 'cura_ricevuta') t.hp += g;
                            return g > 0 ? `${t.name} +${g} HP` : null;
                        }).filter(Boolean);
                        if (!healed.length) continue;
                        note = healed.join(', ');
                        break;
                    }
                    case 'armatura': {
                        const ts = specialTargets(e, hero, ctx);
                        if (!ts.length) continue;
                        ts.forEach(t => { if (!t.noArmor) t.current_armor = (t.current_armor || 0) + v; });  // Lista dei torti: niente armatura
                        note = `+${v} armatura a ${ts.map(t => t.name).join(', ')}`;
                        break;
                    }
                    case 'stordisci':
                        if (!enemy || enemy.hp <= 0) continue;
                        enemy.isStunned = true;
                        note = `${enemy.name} è stordito`;
                        break;
                    case 'malus_nemico': {
                        if (!enemy) continue;
                        const floor = s.stat === 'ca' ? 0 : 1;
                        const tolto = Math.min(v, Math.max(0, (enemy[s.stat] || 0) - floor));
                        if (tolto <= 0) continue;
                        enemy[s.stat] -= tolto;
                        if (s.stat === 'att') enemy.chilled = (enemy.chilled || 0) + tolto;
                        note = `${SPECIALI_STAT_NEMICO[s.stat] || s.stat} del nemico −${tolto}`;
                        break;
                    }
                    // Il nemico si rafforza fino a fine scontro (es. Tintura di Corteccia fallita: +1 CA)
                    case 'rafforza_nemico': {
                        if (!enemy || enemy.hp <= 0 || v <= 0) continue;
                        enemy[s.stat] = (enemy[s.stat] || 0) + v;
                        note = `${SPECIALI_STAT_NEMICO[s.stat] || s.stat} del nemico +${v}`;
                        break;
                    }
                    // L'eroe si ferisce da solo (es. Fiala di Flammaurea fallita): mai sotto 1 HP
                    case 'ferisce_se': {
                        if (!who || who.hp <= 1 || v <= 0) continue;
                        const lost = Math.min(v, who.hp - 1);
                        who.hp -= lost;
                        who.hpLostInCombat = true;
                        note = `${who.name} perde ${lost} HP`;
                        break;
                    }
                    case 'potenzia': {
                        const ts = specialTargets(e, hero, ctx);
                        if (!ts.length) continue;
                        ts.forEach(t => addSpecialBuff(t, e));
                        note = `${v >= 0 ? '+' : '−'}${Math.abs(v)} ${SPECIALI_STAT[s.stat] || s.stat} a ${ts.length > 1 ? 'tutta la compagnia' : ts[0].name}${s.durata ? ` per ${s.durata} round` : ' fino a fine scontro'}`;
                        break;
                    }
                    case 'annulla_colpo':
                        res.cancel = true;
                        note = 'il colpo è assorbito del tutto';
                        break;
                    case 'schiva': {
                        if (!who) continue;
                        const d = rollD6(null, 0, who);
                        if (d >= v) { res.cancel = true; note = `${who.name} tira ${d} (serve ${v}+) ed evita il colpo`; }
                        else { res.notes.push(`${e.name}: ${who.name} prova a schivare, ${d} (serve ${v}+), non basta`); continue; }
                        break;
                    }
                    case 'rialza':
                        res.revive = Math.max(1, v);
                        note = `${who ? who.name : 'l\'eroe'} resta in piedi con ${res.revive} HP`;
                        break;
                    case 'annulla_punizione':
                        res.skipPunishment = true;
                        note = 'niente punizione';
                        break;
                    case 'prova_riuscita':
                        res.success = true;
                        note = 'il fallimento diventa un successo';
                        break;
                    case 'monete':
                        stato.partyCoins += v;
                        res.coins += v;
                        note = `+${v} Scudi`;
                        break;
                    case 'carta_bottino':
                        res.cards += v;
                        note = `${v === 1 ? 'una carta' : `${v} carte`} in più`;
                        break;
                    case 'purifica': {
                        const ts = specialTargets(e, hero, ctx).filter(t => heroStatuses(t).length);
                        if (!ts.length) continue;
                        ts.forEach(clearHeroStatuses);
                        note = `${ts.map(t => t.name).join(', ')} ${ts.length > 1 ? 'sono liberi' : 'è libero'} da ogni stato`;
                        break;
                    }
                    // HP massimi in più per sempre (e altrettanti HP): Lista dei torti di Pancrazio
                    case 'hp_massimi': {
                        if (!who || who.hp <= 0 || v <= 0) continue;
                        who.maxHp += v; who.hp += v;
                        note = `${who.name} +${v} HP massimi (ora ${who.maxHp})`;
                        break;
                    }
                    case 'togli_maledizione':
                        if (!stato.activeCurses.length) continue;
                        removeCurseAt(Math.floor(rng() * stato.activeCurses.length));
                        note = 'una maledizione svanisce';
                        break;
                    // Veleno sul nemico: perde HP a inizio di ogni round per "durata" round (3 se manca), senza CA.
                    // Un nuovo veleno sostituisce quello di prima
                    case 'veleno_nemico': {
                        if (!enemy || enemy.hp <= 0 || ctx.splash || ctx.reaction) continue;
                        enemy.poison = { val: Math.max(1, v), rounds: s.durata || 3, name: e.name };
                        note = `${enemy.name} è avvelenato (−${enemy.poison.val} HP per ${enemy.poison.rounds} round)`;
                        break;
                    }
                    // Oggetti da mettere nello zaino: li consegna chi chiama (con lo scarto se lo zaino è pieno)
                    case 'oggetto': {
                        const item = (LIBRERIA.armeria || {})[s.item];
                        if (!item || !who || who.hp <= 0) continue;
                        const n = Math.max(1, v);
                        for (let k = 0; k < n; k++) res.items.push({ hero: who, item });
                        note = `${n > 1 ? `${n} ${item.name}` : item.name} a ${who.name}`;
                        break;
                    }
                    default:
                        continue;
                }
                res.fired.push(e);
                res.notes.push(`${e.name}: ${note}`);
                const broken = markSpecialUsed(e);
                if (broken) res.notes.push(broken);
            }
            return res;
        }

        // Momento della compagnia una volta sola (inizio scontro, inizio round, fine scontro, riposo): gli effetti
        // di ogni eroe in piedi valgono per lui, quelli di reliquie e maledizioni una volta per tutti. Risultati sommati
        function fireSpecialsAll(quando, ctx = {}) {
            const tot = { notes: [], dmg: 0, coins: 0, cards: 0, items: [], fired: [] };
            const add = r => { tot.notes.push(...r.notes); tot.dmg += r.dmg; tot.coins += r.coins; tot.cards += r.cards; tot.items.push(...r.items); tot.fired.push(...r.fired); };
            stato.party.filter(h => h.hp > 0).forEach(h => add(fireSpecials(quando, h, { ...ctx, scope: 'own' })));
            add(fireSpecials(quando, null, { ...ctx, scope: 'party' }));
            return tot;
        }

        // Ritiro del dado (fai "ritira", quando "tiro_fallito"): il primo effetto disponibile ritira il dado
        // fallito e tiene il nuovo risultato. rolls[1] = dado già deciso per il ritiro (test). Ritorna { roll, total, note }
        function specialReroll(hero, roll, total, target, rolls) {
            if (naturalRollSuccess(roll, total, target)) return { roll, total, note: null };
            const e = specialEntries('tiro_fallito', hero, {}, ['ritira'])[0];
            if (!e) return { roll, total, note: null };
            const nuovo = rollD6(rolls, 1, hero);
            const broken = markSpecialUsed(e);
            return { roll: nuovo, total: total - roll + nuovo, note: `${e.name}: ${hero.name} ritira il ${roll} e fa ${nuovo}${broken ? ` (${broken})` : ''}` };
        }

        // Malasorte (segnale hero_set "malasorte", passiva di Aiace): conta i tiri falliti dell'eroe
        // in hero.malasorteFalliti; ogni MALASORTE_FALLIMENTI fallimenti +1 Forza permanente, al massimo
        // MALASORTE_MAX volte per capitolo (hero.malasorteGuadagni). Chiamata dai resolver di scontro
        // (attacco, difesa, aiuto, abilità), prove e preghiera dopo l'esito del tiro; i contatori stanno
        // sull'eroe e si salvano con la partita. Ritorna la nota per il diario, o null.
        function malasorteDopoTiro(hero, success) {
            if (!hero || !hero.malasorte || success) return null;
            hero.malasorteFalliti = (hero.malasorteFalliti || 0) + 1;
            if (hero.malasorteFalliti % MALASORTE_FALLIMENTI !== 0) return null;
            if ((hero.malasorteGuadagni || 0) >= MALASORTE_MAX) return null;
            hero.malasorteGuadagni = (hero.malasorteGuadagni || 0) + 1;
            hero.str = (hero.str || 0) + 1;
            if (typeof refreshScaledBonuses === 'function') refreshScaledBonuses(hero);
            return `🖤 Malasorte: ${hero.name} impara dal fallimento (+1 Forza, ${hero.malasorteGuadagni}/${MALASORTE_MAX})`;
        }

        // Ira Traboccante (segnale hero_set "iraTraboccante", passiva di Aurelio): ogni tiro fallito della compagnia in
        // scontro (anche il suo) dà +1 Collera (hero.collera, al massimo IRA_MAX). Ogni carica è +1 al suo tiro per colpire
        // (relicCombatBonus in js/motore/tiri.js). Al massimo va in Furia (rageUntil fino al round dopo) e il suo
        // prossimo attacco è lo sfogo (hero.iraSfogo: +IRA_DANNI_SFOGO danni, poi Collera a 0, iraSfogoConsumato).
        // Chiamata dai resolver di scontro dopo l'esito. Ritorna le note per il diario
        function iraDopoTiro(roller, success) {
            if (success) return [];
            return stato.party.filter(h => h.iraTraboccante && h.hp > 0 && !h.iraSfogo).map(h => {
                h.collera = Math.min(IRA_MAX, (h.collera || 0) + 1);
                if (h.collera < IRA_MAX) return `💢 ${h.name} ribolle per l'errore${roller && roller !== h ? ` di ${roller.name}` : ''}: Collera ${h.collera}/${IRA_MAX}`;
                h.iraSfogo = true;
                h.rageUntil = Math.max(h.rageUntil || 0, (stato.combatRound || 0) + 1);
                return `💢 ${h.name} non ne può più: Furia! Il suo prossimo attacco fa +${IRA_DANNI_SFOGO} danni`;
            });
        }

        // Dopo l'attacco di sfogo: la Collera si azzera e la Furia finisce
        function iraSfogoConsumato(hero) {
            hero.collera = 0;
            hero.iraSfogo = false;
            delete hero.rageUntil;
        }

        function iraAzzera(h) {
            delete h.collera;
            delete h.iraSfogo;
        }

        // Danni in più che un colpo a segno farebbe adesso (anteprime e simulatore): solo gli effetti sicuri,
        // senza probabilità, senza consumarli
        function specialHitDamagePreview(hero, enemy) {
            return specialSources('colpo', hero).filter(e => e.s.quando === 'colpo' && e.s.fai === 'danni' && !e.s.prob
                && specialAvailable(e) && specialConditionsMet(e, hero, { enemy, enemyHpBefore: enemy && enemy.hp }))
                .reduce((sum, e) => sum + (e.s.val || 0), 0);
        }

        // C'è un effetto di questo tipo pronto? (es. la prova che riesce comunque, per l'anteprima delle prove)
        function hasSpecial(quando, fai, hero, ctx = {}) {
            return specialSources(quando, hero).some(e => e.s.quando === quando && e.s.fai === fai && !e.s.prob
                && specialAvailable(e) && specialConditionsMet(e, hero, ctx));
        }

        /* ---------- Stati degli eroi ----------
           stordito (hero.stunnedRounds: salta il turno, applyHeroStuns), avvelenato (hero.poison: HP persi a inizio round,
           applyPoison), silenziato (hero.silencedUntil: niente abilità attiva, abilityUsable), furia (hero.rageUntil: può
           solo attaccare, combatActionAllowed). Silenzio e furia valgono fino al round indicato compreso: dati durante il
           turno del nemico contano dal round dopo, dati a inizio round contano già da quello (statusUntil).
           Si vedono come icone sulla carta (heroStatusesHtml) e finiscono con lo scontro (expireTempBuffs(true)). */
        const HERO_STATUSES = {
            stordito: { name: 'Stordito', icon: 'immagini/icone/BTNStun.png', desc: 'Salta il prossimo turno' },
            avvelenato: { name: 'Avvelenato', icon: 'immagini/icone/BTNPoisonSting.png', desc: 'Perde HP a inizio di ogni round, l\'armatura non para' },
            silenziato: { name: 'Silenziato', icon: 'immagini/icone/BTNSilence.png', desc: 'Non può usare l\'abilità attiva' },
            furia: { name: 'Furia', icon: 'immagini/icone/BTNBerserk.png', desc: 'Può solo attaccare: niente Difendi, Aiuta né abilità' },
            collera: { name: 'Collera', icon: 'immagini/icone/BTNBloodLust.png', buff: true,
                desc: 'Ira Traboccante: +1 al tiro per colpire per carica. Al massimo va in Furia e il prossimo attacco fa danni in più' }
        };

        function statusUntil(rounds) {
            const acted = stato.party.some(h => h.hasActed);
            return (stato.combatRound || 0) + Math.max(1, rounds || 1) - (acted ? 0 : 1);
        }
        function isSilenced(h) { return !!h && (h.silencedUntil || 0) > 0 && h.silencedUntil >= (stato.combatRound || 0); }
        function isRaging(h) { return !!h && (h.rageUntil || 0) > 0 && h.rageUntil >= (stato.combatRound || 0); }

        // Stati attivi di un eroe: [{ key, name, icon, desc, rounds }] (rounds = round che restano, se si sa)
        function heroStatuses(h) {
            if (!h || h.hp <= 0) return [];
            const left = until => until - (stato.combatRound || 0) + (stato.party.some(x => x.hasActed) ? 0 : 1);
            const out = [];
            if (h.stunnedRounds > 0) out.push({ key: 'stordito', rounds: h.stunnedRounds });
            if (h.poison) out.push({ key: 'avvelenato', rounds: h.poison.rounds, val: h.poison.val });
            if (isSilenced(h)) out.push({ key: 'silenziato', rounds: left(h.silencedUntil) });
            if (isRaging(h)) out.push({ key: 'furia', rounds: left(h.rageUntil) });
            if (h.iraTraboccante && h.collera > 0) out.push({ key: 'collera', count: h.collera });
            return out.map(s => ({ ...HERO_STATUSES[s.key], ...s }));
        }

        // Stati attivi del nemico, nella stessa forma di heroStatuses: stordito (salta il prossimo attacco)
        // e avvelenato dagli eroi (veleno_nemico, rounds = inizi di round che restano)
        function enemyStatuses(enemy) {
            if (!enemy || enemy.hp <= 0) return [];
            const out = [];
            if (enemy.isStunned) out.push({ ...HERO_STATUSES.stordito, key: 'stordito', desc: 'Salta il suo prossimo attacco' });
            if (enemy.poison) out.push({ ...HERO_STATUSES.avvelenato, key: 'avvelenato', rounds: enemy.poison.rounds, val: enemy.poison.val,
                desc: `Perde HP a inizio di ogni round, la CA non para${enemy.poison.name ? ` (${enemy.poison.name})` : ''}` });
            return out;
        }

        // Toglie tutti gli stati (effetto "purifica", fine scontro)
        function clearHeroStatuses(h) {
            delete h.poison; delete h.silencedUntil; delete h.rageUntil;
            h.stunnedRounds = 0;
        }

        // In furia l'eroe può solo attaccare (e usare oggetti, che non consumano l'azione)
        function combatActionAllowed(hero, action) {
            if (isRaging(hero) && ['defend', 'help', 'ability'].includes(action)) return { ok: false, reason: `${hero.name} è in furia: può solo attaccare` };
            // Lista dei torti (noArmor): Difendi darebbe solo armatura, che non può ricevere
            if (hero && hero.noArmor && action === 'defend') return { ok: false, reason: `${hero.name} non può ricevere armatura: niente Difendi` };
            return { ok: true, reason: '' };
        }

        /* ---------- Effetti speciali dei nemici (NEMICO_QUANDO / NEMICO_FAI in js/comune.js) ----------
           Fonti: "speciali" del nemico (bestiario) e "specialiFase" (aggiunti dalle azioni degli elite alla soglia).
           Usi "una volta per scontro" in enemy.specialUses: il nemico è una copia nuova a ogni scontro. */
        function enemySpecialList(enemy) {
            return [...((enemy && enemy.speciali) || []), ...((enemy && enemy.specialiFase) || [])];
        }

        // Momento "quando" del nemico; hero = l'eroe coinvolto (chi lo colpisce o chi viene colpito). Ritorna le note
        function fireEnemySpecials(quando, enemy, hero, ctx = {}) {
            const notes = [];
            if (!enemy || enemy.hp <= 0) return notes;
            enemy.specialUses = enemy.specialUses || {};
            enemySpecialList(enemy).forEach((s, i) => {
                if (s.quando !== quando || enemy.hp <= 0) return;
                const key = `${s.quando}#${i}`;
                // "soglia" scatta una volta sola, quando l'azione dell'elite viene aggiunta
                const limit = s.quando === 'soglia' ? 1 : (s.limite ? (s.volte || 1) : Infinity);
                if ((enemy.specialUses[key] || 0) >= limit) return;
                if (s.round && stato.combatRound !== s.round) return;
                if (s.se === 'sotto_meta' && enemy.hp > enemy.maxHp / 2) return;
                if (s.se === 'eroe_ferito' && !(hero && hero.hp > 0 && hero.hp <= WOUNDED_HP)) return;
                if (s.prob && rng() * 100 >= s.prob) return;
                const v = s.val || 0;
                const mode = s.bersaglio || 'eroe';
                const targets = mode === 'eroe' ? (hero && hero.hp > 0 ? [hero] : []) : eliteTargets(mode, hero);
                let note = null;
                switch (s.fai) {
                    case 'danni': {
                        if (!targets.length) return;
                        // Come un colpo di contorno: l'armatura conta, niente reazioni a catena (spine, altri effetti del nemico)
                        const ev = targets.flatMap(t => resolveMonsterAttack(enemy, t, { dmg: v, splash: true, reaction: true }).events.map(e => e.text));
                        note = `${v} ${v === 1 ? 'danno' : 'danni'} a ${targets.map(t => t.name).join(', ')}. ${ev.join(' ')}`;
                        break;
                    }
                    case 'cura': {
                        const before = enemy.hp;
                        enemy.hp = Math.min(enemy.maxHp, enemy.hp + v);
                        if (enemy.hp === before) return;
                        note = `recupera ${enemy.hp - before} HP`;
                        break;
                    }
                    case 'potenzia':
                        enemy[s.stat] = (enemy[s.stat] || 0) + v;
                        note = `${v >= 0 ? '+' : '−'}${Math.abs(v)} ${SPECIALI_STAT_NEMICO[s.stat] || s.stat}`;
                        break;
                    case 'malus':
                        if (!targets.length) return;
                        targets.forEach(t => addSpecialBuff(t, { s: { stat: 'att_bonus', val: -v, durata: s.durata }, name: enemy.name, icon: '' }));
                        note = `−${v} al tiro per colpire a ${targets.map(t => t.name).join(', ')}`;
                        break;
                    case 'stordisci':
                        if (!targets.length) return;
                        targets.forEach(t => { t.stunnedRounds = Math.max(t.stunnedRounds || 0, 1); });
                        note = `${targets.map(t => t.name).join(', ')} ${targets.length > 1 ? 'sono storditi' : 'è stordito'}: salta il prossimo turno`;
                        break;
                    case 'veleno':
                        if (!targets.length) return;
                        targets.forEach(t => { t.poison = { val: Math.max(t.poison && t.poison.val || 0, v), rounds: Math.max(t.poison && t.poison.rounds || 0, s.durata || 3), from: enemy.name }; });
                        note = `${targets.map(t => t.name).join(', ')} ${targets.length > 1 ? 'sono avvelenati' : 'è avvelenato'} (−${v} HP a ogni round per ${s.durata || 3} round)`;
                        break;
                    case 'silenzia':
                    case 'infuria': {
                        if (!targets.length) return;
                        const until = statusUntil(s.durata || 2);
                        const field = s.fai === 'silenzia' ? 'silencedUntil' : 'rageUntil';
                        targets.forEach(t => { t[field] = Math.max(t[field] || 0, until); });
                        note = `${targets.map(t => t.name).join(', ')} ${s.fai === 'silenzia' ? (targets.length > 1 ? 'sono silenziati' : 'è silenziato') : (targets.length > 1 ? 'vanno in furia' : 'va in furia')} per ${s.durata || 2} round`;
                        break;
                    }
                    case 'spezza_armatura':
                        if (!targets.some(t => t.current_armor > 0)) return;
                        targets.forEach(t => { t.current_armor = 0; });
                        note = `l'armatura di ${targets.map(t => t.name).join(', ')} va in pezzi`;
                        break;
                    case 'ruba_scudi': {
                        const tolti = Math.min(v, stato.partyCoins || 0);
                        if (!tolti) return;
                        stato.partyCoins -= tolti;
                        note = `ruba ${tolti} Scudi`;
                        break;
                    }
                    default: return;
                }
                if (limit !== Infinity) enemy.specialUses[key] = (enemy.specialUses[key] || 0) + 1;
                notes.push(`${enemy.name}: ${note}`);
            });
            return notes;
        }

        // Il nemico è stato colpito da un eroe (dopo il danno): effetti "colpito" del nemico
        function enemyHitReaction(hero, enemy) {
            return fireEnemySpecials('colpito', enemy, hero, {});
        }

        // Veleno (effetto "veleno" dei nemici): a inizio round gli eroi avvelenati perdono HP, senza armatura.
        // Anche il nemico, se un eroe l'ha avvelenato (veleno_nemico, es. Veleno della Cava di Ofelia)
        function applyPoison() {
            const notes = [];
            const enemy = stato.activeEnemy;
            if (enemy && enemy.poison && enemy.hp > 0) {
                const lost = Math.min(enemy.hp, enemy.poison.val);
                enemy.hp -= lost;
                notes.push(`☠️ ${enemy.name} perde ${lost} HP per il veleno${enemy.hp <= 0 ? ' e muore' : ''}`);
                if (--enemy.poison.rounds <= 0 || enemy.hp <= 0) delete enemy.poison;
            }
            stato.party.forEach(h => {
                if (!h.poison || h.hp <= 0) return;
                const lost = Math.min(h.hp, h.poison.val);
                h.hp -= lost;
                if (lost > 0) h.hpLostInCombat = true;
                notes.push(`☠️ ${h.name} perde ${lost} HP per il veleno${h.hp <= 0 ? ' e cade' : ''}`);
                if (--h.poison.rounds <= 0) delete h.poison;
            });
            return notes;
        }

        // Inizio di un round (gioco, simulatore, duelli di prova): veleno, effetti degli eroi, delle reliquie e del nemico
        function startRoundSpecials() {
            return [...applyPoison(), ...fireSpecialsAll('inizio_round').notes, ...fireEnemySpecials('inizio_round', stato.activeEnemy, null)];
        }

        // Righe dei tooltip: un testo per ogni effetto speciale
        function specialTipLines(list, tipo) {
            return (list || []).map(s => specialeTesto(s, tipo));
        }

    // API del modulo: window.Motore.speciali. Gli stessi nomi restano anche globali (Object.assign su window),
    // perché interfaccia, simulatore e test li chiamano per nome. Funzioni solo interne: abilitySpecials, relicSpecials, curseSpecials, heroAbilityRefs, partySpecialSources, SPECIALI_DI_COMPAGNIA, specialSources, specialWhenMatches, specialUsesStore, specialAvailable, specialUsesLeft, specialConditionsMet, specialEntries, markSpecialUsed, exhaustSpecialSource, specialTargets, addSpecialBuff, SPECIALI_BONUS, HERO_STATUSES, statusUntil, applyPoison.
    const api = {
        itemSpecials, heroSpecialSources, resetCombatSpecialUses, rollSpecialSources, rollSpecialBonus, spendRollSpecials,
        specialSum, specialPriceFactor, fireSpecials, runSpecialEntries, fireSpecialsAll, specialReroll, malasorteDopoTiro,
        iraDopoTiro, iraSfogoConsumato, iraAzzera, clearHeroStatuses,
        specialHitDamagePreview, hasSpecial, isSilenced, isRaging, heroStatuses, enemyStatuses, combatActionAllowed,
        enemySpecialList, fireEnemySpecials, enemyHitReaction, startRoundSpecials, specialTipLines
    };
    window.Motore = window.Motore || {};
    window.Motore.speciali = api;
    Object.assign(window, api);
})();
