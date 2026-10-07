/* ==========================================================================
   OGGETTI, CONSUMABILI E ZAINO
   Statistiche degli oggetti (anche in scala e Factotum), consumabili e potenziamenti temporanei,
   tooltip degli oggetti, zaino (pile, scarto) e consegna di un oggetto a un eroe.
   Diviso da js/game.js: stesso ambito globale (usa stato, LIBRERIA, showScreen...).
   Caricato subito dopo js/game.js; le funzioni si chiamano tra file solo dopo il caricamento.
   ========================================================================== */

        // Le pozioni di cura da REVIVE_MIN_RARITY in su (js/regole.js) rialzano anche gli eroi caduti
        function itemRevives(item) {
            if (!item || (item.type !== 'consumable_heal' && item.type !== 'consumable_full')) return false;
            const order = Object.keys(RARITY_LABELS);
            return order.indexOf(itemRarity(item)) >= order.indexOf(REVIVE_MIN_RARITY);
        }

        // Eroe su cui si può usare il consumabile: vivo, oppure caduto se la pozione rialza.
        // Le pozioni di cura solo su chi ha perso HP (non si sprecano su chi è al massimo).
        function canTargetWithItem(item, target) {
            if (!target || (target.hp <= 0 && !itemRevives(item))) return false;
            const heals = item && (item.type === 'consumable_heal' || item.type === 'consumable_full');
            return !heals || target.hp < target.maxHp;
        }

        window.useConsumableFromTopbar = function(heroName, itemIdx) {
            let hero = stato.party.find(p => p.name === heroName);
            if(!hero) return;
            let item = hero.items[itemIdx];
            if(!item || !item.type || !item.type.startsWith('consumable')) return;
            if (isCombatConsumable(item)) {
                uiError(currentScreenId === 'screenCombat'
                    ? `${item.name} si usa con il comando Oggetto, nel turno dell'eroe`
                    : `${item.name} si usa solo in combattimento`);
                return;
            }

            openModal(
                item.name,
                `<p>${item.desc}</p><p>A quale membro della spedizione vuoi applicarlo?</p>`,
                stato.party.map(p => ({
                    label: `${p.name} (HP ${p.hp}/${p.maxHp})`,
                    disabled: !canTargetWithItem(item, p),
                    onClick: () => useConsumable(hero.name, itemIdx, p.name)
                })).concat([{ label: 'Annulla', className: 'btn-danger' }])
            );
        };

        /* ---------- Oggetti che scalano con Fede o Intelligenza ----------
           Campo "scaling" dell'oggetto: [{ "stat": "dmg", "per": "fth", "every": 2, "max": 3 }]
           = +1 Danno ogni 2 punti di Fede dell'eroe (al massimo +3). "stat" può essere str, dmg,
           armor, def_bonus o help_bonus_val; "per" è fth o int (mai le stesse: niente circoli).
           Il bonus si ricalcola quando cambiano Fede o Intelligenza (oggetti, reliquie, maledizioni):
           hero.scaledBonus ricorda quanto è già stato aggiunto, così si applica solo la differenza. */
        const SCALING_TARGETS = ['str', 'dmg', 'armor', 'def_bonus', 'def_armor', 'help_bonus_val'];

        function scaledItemBonuses(hero) {
            const out = {};
            (hero.items || []).forEach(it => (it.scaling || []).forEach(sc => {
                if (!SCALING_TARGETS.includes(sc.stat) || !['fth', 'int'].includes(sc.per)) return;
                let bonus = Math.floor(Math.max(0, hero[sc.per] || 0) / Math.max(1, sc.every || 1));
                if (sc.max != null) bonus = Math.min(sc.max, bonus);
                out[sc.stat] = (out[sc.stat] || 0) + bonus;
            }));
            return out;
        }

        /* ---------- Passiva "Factotum" (hero_set factotum: N, ogni quanti punti; true = 2) ----------
           Ogni N punti di Forza guadagnati (oltre a quella di partenza dell'eroe) +1 Intelligenza,
           ogni N di Intelligenza guadagnata +1 Fede, ogni N di Fede guadagnata +1 Forza.
           I punti dati da Factotum non contano per le altre conversioni (niente catena infinita):
           hero.factotumBonus ricorda quanto è già stato aggiunto, così si applica solo la differenza. */
        // FACTOTUM_CYCLE e FACTOTUM_EVERY in js/regole.js

        // Statistiche di partenza dell'eroe (come in heroStatHtml): dalla campagna, poi dalla libreria
        function heroStartStats(hero) {
            return (campaignHeroes || []).find(b => b.name === hero.name)
                || Object.values(LIBRERIA.eroi || {}).find(b => b.name === hero.name) || null;
        }

        function refreshFactotum(hero) {
            const prev = hero.factotumBonus || {};
            const start = heroStartStats(hero);
            const now = {};
            if (hero.factotum && start) {
                const every = typeof hero.factotum === 'number' && hero.factotum >= 1 ? hero.factotum : FACTOTUM_EVERY;
                FACTOTUM_CYCLE.forEach(([from, to]) => {
                    const gained = (hero[from] || 0) - (prev[from] || 0) - (start[from] || 0);
                    const bonus = Math.floor(Math.max(0, gained) / every);
                    if (bonus) now[to] = (now[to] || 0) + bonus;
                });
            }
            ['str', 'int', 'fth'].forEach(k => {
                const diff = (now[k] || 0) - (prev[k] || 0);
                if (diff) hero[k] = (hero[k] || 0) + diff;
            });
            hero.factotumBonus = now;
        }

        function refreshScaledBonuses(hero) {
            if (!hero) return;
            if (hero.factotum || hero.factotumBonus) refreshFactotum(hero);
            const now = scaledItemBonuses(hero);
            const prev = hero.scaledBonus || {};
            SCALING_TARGETS.forEach(k => {
                const diff = (now[k] || 0) - (prev[k] || 0);
                if (!diff) return;
                if (k === 'armor') {
                    hero.base_armor += diff;
                    if (hero.hp > 0) hero.current_armor = Math.max(0, hero.current_armor + diff);
                } else {
                    hero[k] = (hero[k] || 0) + diff;
                }
            });
            hero.scaledBonus = now;
        }

        // Testo per l'interfaccia, es. "+1 Danno ogni 2 Fede"
        const SCALING_LABELS = { str: 'Forza', dmg: 'Danno', armor: 'Armatura', def_bonus: 'Difesa', def_armor: 'Armatura con Difendi', help_bonus_val: 'Aiuto', fth: 'Fede', int: 'Intelligenza' };
        function scalingText(item) {
            return (item.scaling || []).map(sc => `+1 ${SCALING_LABELS[sc.stat]} ogni ${sc.every} ${SCALING_LABELS[sc.per]}${sc.max != null ? ` (max +${sc.max})` : ''}`).join(', ');
        }

        function applyItemEffects(item, hero) {
            if(item.str) hero.str += item.str;
            if(item.dmg) hero.dmg += item.dmg;
            if(item.armor) {
                hero.base_armor += item.armor;
                if (hero.hp > 0) hero.current_armor += item.armor;
            }
            if(item.att_penalty) hero.att_penalty += item.att_penalty;
            if(item.def_bonus) hero.def_bonus += item.def_bonus;
            if(item.def_armor) hero.def_armor = (hero.def_armor || 0) + item.def_armor;
            if(item.help_bonus_val) hero.help_bonus_val += item.help_bonus_val;
            if(item.fth) hero.fth += item.fth;
            if(item.int) hero.int += item.int;
            // L'oggetto è già nello zaino: ricalcola i bonus in scala (anche degli altri oggetti, se cambia Fede o Int)
            refreshScaledBonuses(hero);
        }

        function revertItemEffects(item, hero) {
            if(item.str) hero.str -= item.str;
            if(item.dmg) hero.dmg -= item.dmg;
            if(item.armor) {
                hero.base_armor -= item.armor;
                hero.current_armor = Math.max(0, hero.current_armor - item.armor);
            }
            if(item.att_penalty) hero.att_penalty -= item.att_penalty;
            if(item.def_bonus) hero.def_bonus -= item.def_bonus;
            if(item.def_armor) hero.def_armor = (hero.def_armor || 0) - item.def_armor;
            if(item.help_bonus_val) hero.help_bonus_val -= item.help_bonus_val;
            if(item.fth) hero.fth -= item.fth;
            if(item.int) hero.int -= item.int;
            // Ricalcola i bonus in scala come se l'oggetto fosse già fuori dallo zaino
            const idx = (hero.items || []).indexOf(item);
            if (idx >= 0) { hero.items.splice(idx, 1); refreshScaledBonuses(hero); hero.items.splice(idx, 0, item); }
            else refreshScaledBonuses(hero);
        }

        /* ---------- Consumabili ----------
           consumable_heal (heal_val) e consumable_full curano un eroe, anche fuori dal combattimento.
           consumable_damage (dmg_val) colpisce il nemico; consumable_buff (buff_stat, buff_val,
           buff_rounds) potenzia un eroe per alcuni round (0 o vuoto = tutto lo scontro): questi due
           si usano solo in combattimento, con il comando Oggetto. Nello zaino un consumabile può
           stare in pila con un altro uguale (campo "qty", al massimo CONSUMABLE_STACK copie). */
        const isCombatConsumable = item => item && (item.type === 'consumable_damage' || item.type === 'consumable_buff');
        // Statistiche che un potenziamento può alzare (etichette per tooltip, editor e diario)
        const BUFF_STATS = { str: 'Forza', dmg: 'Danno', att_bonus: 'Tiro per colpire', def_bonus: 'Difesa',
            def_armor: 'Armatura con Difendi', help_bonus_val: 'Aiuto', current_armor: 'Armatura (subito)' };

        // Toglie una copia del consumabile: la pila scende di uno, l'ultima copia libera lo slot
        function consumeOne(hero, itemIdx) {
            const item = hero.items[itemIdx];
            if ((item.qty || 1) > 1) item.qty -= 1;
            else hero.items.splice(itemIdx, 1);
        }

        // Pila dello stesso consumabile con posto libero nello zaino dell'eroe (o undefined)
        function stackableSlot(hero, item) {
            if (!item.type || !item.type.startsWith('consumable')) return undefined;
            return hero.items.find(it => it.id === item.id && it.type === item.type && (it.qty || 1) < CONSUMABLE_STACK);
        }

        // Potenziamento temporaneo: alza subito la statistica e la riporta indietro alla scadenza
        // (expiresAfterRound; Infinity = fine dello scontro). L'armatura data subito non si toglie.
        function applyTempBuff(hero, item) {
            const val = item.buff_val || 0;
            hero[item.buff_stat] = (hero[item.buff_stat] || 0) + val;
            if (item.buff_stat === 'current_armor') return;
            const rounds = item.buff_rounds || 0;
            (hero.tempBuffs = hero.tempBuffs || []).push({ stat: item.buff_stat, val, name: item.name, icon: item.icon || '',
                expiresAfterRound: rounds > 0 ? stato.combatRound + rounds - 1 : Infinity });
        }

        // Potenziamento (o malus, val negativo) che parte dal prossimo turno degli eroi: si applica in
        // applyPendingBuffs, chiamata a inizio round (es. il ruggito di un boss: -1 al tiro per 1 round)
        function scheduleTempBuff(hero, buff) {
            (hero.pendingBuffs = hero.pendingBuffs || []).push(buff);
        }

        function applyPendingBuffs() {
            stato.party.forEach(h => {
                if (!h.pendingBuffs || !h.pendingBuffs.length) return;
                if (h.hp > 0) h.pendingBuffs.forEach(b => {
                    h[b.stat] = (h[b.stat] || 0) + b.val;
                    (h.tempBuffs = h.tempBuffs || []).push({ stat: b.stat, val: b.val, name: b.name, icon: b.icon || '',
                        expiresAfterRound: stato.combatRound + (b.rounds || 1) - 1 });
                });
                h.pendingBuffs = [];
            });
        }

        // Toglie i potenziamenti scaduti (all = true: tutti, a fine scontro o caricando una partita)
        function expireTempBuffs(all = false) {
            const expired = [];
            stato.party.forEach(h => {
                if (all) h.pendingBuffs = [];
                if (!h.tempBuffs || !h.tempBuffs.length) return;
                h.tempBuffs = h.tempBuffs.filter(b => {
                    if (!all && b.expiresAfterRound >= stato.combatRound) return true;
                    h[b.stat] = (h[b.stat] || 0) - b.val;
                    expired.push({ hero: h, buff: b });
                    return false;
                });
            });
            return expired;
        }

        // Icone dei potenziamenti attivi sulla carta dell'eroe, come i buff sopra le unità di WC3:
        // il numero è quanti round restano (compreso quello in corso), ∞ = fino a fine scontro
        function heroBuffsHtml(h) {
            if (!h.tempBuffs || !h.tempBuffs.length || h.hp <= 0) return '';
            return `<div class="hero-buffs">${h.tempBuffs.map(b => {
                const left = b.expiresAfterRound === Infinity ? '∞' : Math.max(1, b.expiresAfterRound - stato.combatRound + 1);
                const when = left === '∞' ? 'fino alla fine dello scontro' : (left === 1 ? 'ultimo round' : `ancora ${left} round`);
                const tip = `${b.name}||${b.val > 0 ? '+' : ''}${b.val} ${BUFF_STATS[b.stat] || b.stat}, ${when}`;
                const img = b.icon ? `<img src="${esc(b.icon)}" alt="">` : '';
                return `<span class="hero-buff ${b.val < 0 ? 'debuff' : ''}" data-tip="${esc(tip)}">${img}<b>${left}</b></span>`;
            }).join('')}</div>`;
        }

        // Testo della durata di un potenziamento (per tooltip e diario)
        function buffDurationText(item) {
            const r = item.buff_rounds || 0;
            return r > 0 ? (r === 1 ? 'per 1 round' : `per ${r} round`) : 'per tutto lo scontro';
        }

        window.useConsumable = function(heroName, itemIdx, targetName = null) {
            let hero = stato.party.find(p => p.name === heroName);
            if(!hero) return false;
            let item = hero.items[itemIdx];
            if(!item || !item.type || !item.type.startsWith('consumable')) return false;

            if (isCombatConsumable(item)) {
                const enemy = stato.activeEnemy;
                if (currentScreenId !== 'screenCombat' || !enemy || enemy.hp <= 0) {
                    uiError(`${item.name} si usa solo in combattimento`);
                    return false;
                }
                if (item.type === 'consumable_damage') {
                    const dmg = item.dmg_val || 0;
                    enemy.hp -= dmg;
                    consumeOne(hero, itemIdx);
                    updatePartyStatusBars();
                    logCombat(`💥 ${hero.name} usa ${item.name}: ${dmg} ${dmg === 1 ? 'danno' : 'danni'} a ${enemy.name}!`);
                    return true;
                }
            }

            let target = targetName ? stato.party.find(p => p.name === targetName) : hero;
            if(!canTargetWithItem(item, target)) {
                uiError(target && target.hp >= target.maxHp ? `${target.name} ha già tutti gli HP` : "Bersaglio non valido o non disponibile");
                return false;
            }

            if(item.type === 'consumable_heal') {
                healHero(target, item.heal_val);
            } else if(item.type === 'consumable_full') {
                healHero(target, Infinity);
            } else if(item.type === 'consumable_buff') {
                applyTempBuff(target, item);
            } else {
                return false;  // tipo sconosciuto: l'oggetto resta nello zaino
            }
            consumeOne(hero, itemIdx);
            updatePartyStatusBars();
            triggerConsumableFeedback(hero, target, item);
            return true;
        };

        // Cura un eroe di "amount" HP (Infinity = tutti) e restituisce quanti ne ha recuperati.
        // Con il Favore di Valgoren ogni cura riuscita fa recuperare 1 HP a un altro eroe a caso.
        function healHero(target, amount) {
            const before = target.hp;
            target.hp = Math.min(target.maxHp, target.hp + amount);
            const gained = target.hp - before;
            if (gained > 0) valgorenEcho(target);
            return gained;
        }

        // Favore di Valgoren: 1 HP a un altro eroe vivo e ferito, scelto a caso. Restituisce l'eroe curato.
        function valgorenEcho(source) {
            if (!hasRelic('favore_di_valgoren')) return null;
            const others = stato.party.filter(h => h !== source && h.hp > 0 && h.hp < h.maxHp);
            if (!others.length) return null;
            const lucky = others[Math.floor(Math.random() * others.length)];
            lucky.hp += 1;
            return lucky;
        }

        /* ---------- 22. Tooltip ricco degli oggetti ---------- */
        const ITEM_TIP_LINES = [['str', 'Forza'], ['dmg', 'Danno'], ['armor', 'Armatura'], ['def_armor', 'Armatura con Difendi'], ['def_bonus', 'Difesa'], ['help_bonus_val', 'Aiuto'], ['fth', 'Fede'], ['int', 'Intelligenza']];
        function itemTip(item, hero) {
            const rarity = itemRarity(item);
            const title = `<span class="tip-rar tip-rar-${rarity}">${esc(item.name)}</span>`;
            const lines = [`<span class="tip-rar-label tip-rar-${rarity}">${RARITY_LABELS[rarity] || ''}${item.type && item.type.startsWith('consumable') ? ' · consumabile' : ''}</span>`];
            ITEM_TIP_LINES.forEach(([k, label]) => { if (item[k]) lines.push(kw(`${item[k] > 0 ? '+' : ''}${item[k]} ${label}`)); });
            if (item.att_penalty) lines.push(`<span class="kw kw-curse">-${item.att_penalty} al tiro per colpire</span>`);
            if (item.type === 'consumable_heal') lines.push(kw(`Cura ${item.heal_val} HP`));
            if (item.type === 'consumable_full') lines.push(kw('Cura tutti gli HP'));
            if (itemRevives(item)) lines.push(kw('Rialza anche un eroe caduto'));
            if (item.type === 'consumable_damage') lines.push(kw(`Infligge ${item.dmg_val || 0} danni al nemico`));
            if (item.type === 'consumable_buff') lines.push(kw(`+${item.buff_val || 0} ${BUFF_STATS[item.buff_stat] || item.buff_stat}${item.buff_stat === 'current_armor' ? '' : ' ' + buffDurationText(item)}`));
            if (isCombatConsumable(item)) lines.push('<span class="tip-hint">Solo in combattimento, con il comando Oggetto</span>');
            if ((item.qty || 1) > 1) lines.push(`<span class="tip-hint">${item.qty} copie in questo slot</span>`);
            (item.scaling || []).forEach(sc => {
                const who = (hero ? [hero] : stato.party.filter(h => h.hp > 0)).map(h => {
                    let b = Math.floor(Math.max(0, h[sc.per] || 0) / Math.max(1, sc.every || 1));
                    if (sc.max != null) b = Math.min(sc.max, b);
                    return `${esc(h.name)} +${b}`;
                }).join(', ');
                lines.push(kw(`+1 ${SCALING_LABELS[sc.stat]} ogni ${sc.every} ${SCALING_LABELS[sc.per]}${sc.max != null ? ` (max +${sc.max})` : ''}`) + (who ? `<br><span class="tip-hint">ora: ${who}</span>` : ''));
            });
            if (item.desc) lines.push(`<span class="tip-desc">${kw(item.desc)}</span>`);
            return `${title}||${lines.join('<br>')}`;
        }

        // Statistiche che un oggetto modifica, con l'etichetta mostrata nell'anteprima
        const ITEM_STAT_PREVIEW = [
            { key: 'str', label: 'Forza', get: h => h.str },
            { key: 'dmg', label: 'Danno', get: h => h.dmg },
            { key: 'armor', label: 'Armatura', get: h => h.base_armor },
            { key: 'fth', label: 'Fede', get: h => h.fth },
            { key: 'int', label: 'Intelligenza', get: h => h.int },
            { key: 'def_bonus', label: 'Difesa', get: h => h.def_bonus || 0 },
            { key: 'def_armor', label: 'Armatura con Difendi', get: h => 1 + (h.def_armor || 0) },
            { key: 'help_bonus_val', label: 'Aiuto', get: h => h.help_bonus_val || 0 },
            { key: 'att_penalty', label: 'Attacco', get: h => attackMod(h), sign: -1 }
        ];

        // Es. "Forza 3→4, Danno 1→2": come cambierebbe l'eroe equipaggiando l'oggetto
        function itemDeltaText(item, hero) {
            if (item.type && item.type.startsWith('consumable')) {
                const pila = stackableSlot(hero, item);
                return pila ? `si aggiunge alla pila (${(pila.qty || 1) + 1}/${CONSUMABLE_STACK})` : 'consumabile nello zaino';
            }
            const after = JSON.parse(JSON.stringify(hero));
            const copy = JSON.parse(JSON.stringify(item));
            after.items.push(copy);
            applyItemEffects(copy, after);
            const parts = ITEM_STAT_PREVIEW.filter(st => st.get(after) !== st.get(hero))
                .map(st => `${st.label} ${st.get(hero)}→${st.get(after)}`);
            return parts.join(', ') || 'nessun effetto sulle statistiche (per ora)';
        }

        // Capienza dello zaino di ogni eroe: BACKPACK_SIZE in js/regole.js

        function heroOptionsForItem(item) {
            return stato.party.filter(p => p.hp > 0).map(h => {
                const full = h.items.length >= BACKPACK_SIZE && !stackableSlot(h, item) ? ' · zaino pieno' : '';
                return `<option value="${h.name}">${h.name} (zaino ${h.items.length}/${BACKPACK_SIZE}) — ${itemDeltaText(item, h)}${full}</option>`;
            }).join('');
        }

        // Riempie la scelta dell'eroe che riceve un oggetto e, sotto, la scelta di cosa scartare
        // se il suo zaino è pieno: così lo scarto si decide subito, senza la schermata a parte.
        function fillHeroSelectForItem(selectId, item) {
            const select = document.getElementById(selectId);
            select.innerHTML = heroOptionsForItem(item);
            let picker = document.getElementById(selectId + 'Discard');
            if (!picker) {
                picker = document.createElement('div');
                picker.id = selectId + 'Discard';
                picker.className = 'discard-picker';
                select.insertAdjacentElement('afterend', picker);
                select.addEventListener('change', () => renderDiscardPicker(selectId));
            }
            picker.dataset.itemId = item.id || '';
            picker.dataset.itemType = item.type || '';
            renderDiscardPicker(selectId);
        }

        function renderDiscardPicker(selectId) {
            const picker = document.getElementById(selectId + 'Discard');
            const hero = stato.party.find(p => p.name === document.getElementById(selectId).value);
            const incoming = { id: picker.dataset.itemId, type: picker.dataset.itemType };
            const full = hero && hero.items.length >= BACKPACK_SIZE && !stackableSlot(hero, incoming);
            picker.classList.toggle('hidden', !full);
            if (!full) { picker.innerHTML = ''; return; }
            picker.innerHTML = `<label>Zaino pieno (${hero.items.length}/${BACKPACK_SIZE}): scarta
                <select>${hero.items.map((it, idx) => `<option value="${idx}">${esc(it.name)}</option>`).join('')}
                    <option value="">Decido dopo</option></select></label>`;
        }

        // Indice dell'oggetto da scartare scelto sotto la scelta dell'eroe (null = si sceglie dopo)
        function chosenDiscardIdx(selectId) {
            const picker = document.getElementById(selectId + 'Discard');
            const select = picker && !picker.classList.contains('hidden') ? picker.querySelector('select') : null;
            return select && select.value !== '' ? Number(select.value) : null;
        }

        let discardCallback = null;
        let heroNeedingDiscard = null;
        let discardReturnScreen = null;  // schermata da cui si è arrivati allo scarto

        // discardIdx: oggetto dello zaino da scartare subito per fare posto (vedi fillHeroSelectForItem)
        function assignItemToHero(item, hero, callback, discardIdx = null) {
            discover('items', item.id);
            // Consumabile uguale a uno già nello zaino con posto nella pila: nessuno slot in più
            const pila = stackableSlot(hero, item);
            if (pila) {
                pila.qty = (pila.qty || 1) + 1;
                updatePartyStatusBars();
                callback();
                return;
            }
            if (discardIdx !== null && hero.items.length >= BACKPACK_SIZE && hero.items[discardIdx]) {
                revertItemEffects(hero.items[discardIdx], hero);
                hero.items.splice(discardIdx, 1);
            }
            let newItem = JSON.parse(JSON.stringify(item));
            hero.items.push(newItem);
            applyItemEffects(newItem, hero);
            updatePartyStatusBars();

            if (hero.items.length > BACKPACK_SIZE) {
                heroNeedingDiscard = hero;
                discardCallback = callback;
                discardReturnScreen = currentScreenId;  // dopo lo scarto si torna qui (mercante, tesoro...)
                showScreen('screenDiscard');
                renderDiscardScreen();
            } else {
                callback();
            }
        }

        function renderDiscardScreen() {
            document.getElementById('discardHeroName').textContent = heroNeedingDiscard.name;
            document.getElementById('discardItemsList').innerHTML = heroNeedingDiscard.items.map((it, idx) => `
                <button class="armory-btn" ${azione('executeDiscard', idx)}>
                    ${itemIconHtml(it)}
                    <span class="tile-text">
                        <strong>${it.name}</strong>
                        <span class="tile-sub">${it.desc}</span>
                        <span class="tile-tag danger">Scarta</span>
                    </span>
                </button>
            `).join('');
        }

        // Un solo scarto: poi si torna alla schermata di prima e si prosegue con la callback
        // (che può anche cambiare schermata, es. advanceNode dal bottino)
        function executeDiscard(idx) {
            const hero = heroNeedingDiscard, callback = discardCallback, back = discardReturnScreen;
            if (!hero || !hero.items[idx]) return;
            heroNeedingDiscard = null; discardCallback = null; discardReturnScreen = null;
            // (dopo la rimozione updatePartyStatusBars ricalcola i bonus in scala)
            revertItemEffects(hero.items[idx], hero);
            hero.items.splice(idx, 1);
            updatePartyStatusBars();
            if (back && back !== 'screenDiscard') showScreen(back);
            if (callback) callback();
        }
