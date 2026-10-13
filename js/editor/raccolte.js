/* ==========================================================================
   EDITOR: RACCOLTE CON CHIAVE
   Sfide della campagna e schede della libreria (Bestiario, Armeria, Reliquie, Eroi, Abilità,
   Maledizioni): COLLECTIONS, elenco e modulo, aggiungi, duplica, rinomina, elimina.
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

/* ---------- Raccolte con chiave: sfide (campagna) e le quattro librerie ---------- */
// Riassunto degli attacchi speciali di un elite (soglie e azioni per nome), sopra il modulo del nemico
function eliteSummaryHtml(e, key) {
    const fasi = Array.isArray(e.fasi) ? e.fasi : [];
    if (!fasi.length) return `<p class="ed-lib-note">Nemico normale, senza attacchi speciali. <a href="#" ${azione('gotoLibrary', 'elite', key)}>Rendilo elite</a> (soglie di vita con attacchi speciali).</p>`;
    const actionName = a => typeof a === 'string' ? ((lib.azioni_elite || {})[a] || {}).name || a : (a && a.name) || 'azione scritta nella soglia';
    const rows = fasi.map(f => {
        const quando = f.round != null ? `dal round ${f.round}` : `sotto il ${f.soglia}% di vita`;
        const azioni = (f.azioni || []).map(actionName);
        return `<li><b>${esc(quando)}</b>: ${esc(azioni.join(', ') || 'nessuna azione')}${f.testo ? ` <em>«${esc(f.testo)}»</em>` : ''}</li>`;
    }).join('');
    return `<div class="ed-elite-summary"><b>Elite: attacchi speciali</b><ul>${rows}</ul>
        <button type="button" class="btn-small" ${azione('gotoLibrary', 'elite', key)}>Modifica gli attacchi speciali</button></div>`;
}

const COLLECTIONS = {
    challenges: {
        store: () => camp.challenges, setStore: v => { camp.challenges = v; },
        fields: CHALLENGE_FIELDS, label: c => c.title, keyHint: 'nuova_sfida',
        create: () => ({ title: 'Nuova sfida', desc: '', ignoreText: '', successText: '', failText: '', stat: 'int', cd: 7, reward: null, punishment: null }),
        usage: key => { const n = camp.mapNodes.filter(nd => nd.challengeId === key).length; return n ? [{ title: camp.title, n, current: true }] : []; },
        renameRefs: (oldKey, key) => camp.mapNodes.forEach(n => { if (n.challengeId === oldKey) n.challengeId = key; }),
        dirty: () => markDirty()
    },
    bestiario: {
        library: true, fields: ENEMY_FIELDS, label: e => e.name, keyHint: 'nuovo_nemico',
        create: () => ({ name: 'Nuovo nemico', hp: 8, maxHp: 8, att: 7, dmg: 1, ca: 7, desc: '' }), wizard: true,
        sub: e => `HP ${e.maxHp} · CA ${e.ca} · Att ${e.att} · Danno ${e.dmg}`,
        renameRefs: (oldKey, key) => camp.mapNodes.forEach(n => { if (n.enemy === oldKey) n.enemy = key; }),
        note: (e, key) => eliteSummaryHtml(e, key)
    },
    armeria: {
        library: true, fields: ITEM_FIELDS, label: i => i.name, keyHint: 'nuovo_oggetto',
        create: key => ({ id: key, name: 'Nuovo oggetto', rarity: 'comune', desc: '' }), wizard: true,
        sub: i => [i.rarity, i.desc].filter(Boolean).join(' · '),
        afterKeyChange: (obj, key) => { obj.id = key; },
        renameRefs: (oldKey, key) => {
            const swap = list => list && list.forEach((r, i) => { if (r === oldKey) list[i] = key; });
            swap(camp.initialArmory); swap(camp.lootItems); swap(lib.lootPredefinito);
        }
    },
    reliquie: {
        library: true, fields: RELIC_FIELDS, label: r => r.name, keyHint: 'nuova_reliquia',
        create: () => ({ type: 'relic', name: 'Nuova reliquia', desc: '' }),
        sub: r => r.desc,
        renameRefs: (oldKey, key) => Object.values(camp.challenges).forEach(c => { if (c.reward === oldKey) c.reward = key; })
    },
    eroi: {
        library: true, fields: HERO_LIB_FIELDS, label: h => h.name, keyHint: 'nuovo_eroe',
        create: () => ({ ...newHeroTemplate('Nuovo eroe'), abilities: [] }),
        sub: h => `FOR ${h.str} · INT ${h.int} · FEDE ${h.fth} · HP ${h.maxHp} · ${(h.abilities || []).length} abilità`,
        afterChange: (h, key) => {
            if (key === 'maxHp') h.hp = h.maxHp;
            if (key === 'base_armor') h.current_armor = h.base_armor;
            // Nuovo ritratto: si ridisegna il modulo per aggiornare l'inquadratura
            if (key === 'portrait' || key === 'portraitWounded') setTimeout(render);
        },
        renameRefs: (oldKey, key) => camp.heroes.forEach((h, i) => { if (h === oldKey) camp.heroes[i] = key; })
    },
    abilita: {
        library: true, fields: ABILITY_FIELDS, label: a => a.name, keyHint: 'nuova_abilita',
        create: key => ({ id: key, name: 'Nuova abilità', desc: 'Passiva: ', isCombatActive: false, effects: [] }),
        sub: abilitySummary,
        afterKeyChange: (obj, key) => { obj.id = key; },
        afterChange: (a, key) => {
            // Attiva e passiva hanno campi diversi: si tolgono quelli che non servono più e si ridisegna il modulo
            if (key === 'isCombatActive') {
                if (a.isCombatActive) { delete a.effects; delete a.type; delete a.stat; delete a.val; a.actionName = a.actionName || a.name; a.combat = a.combat || { dice: 1 }; }
                else { delete a.actionName; delete a.combat; if (!a.effects) a.effects = []; }
            }
            if (key === 'type') {
                if (a.type === 'passive_stat') { delete a.effects; a.stat = a.stat || 'str'; a.val = a.val ?? 1; }
                else { delete a.stat; delete a.val; if (!a.effects) a.effects = []; }
            }
            if (key === 'isCombatActive' || key === 'type') setTimeout(render);
        },
        // Gli eroi che la usano stanno tutti nella libreria: si aggiornano anche loro
        renameRefs: (oldKey, key) => Object.values(lib.eroi).forEach(h => {
            const list = h.abilities || [];
            if (list.includes(oldKey)) { list[list.indexOf(oldKey)] = key; markLibDirty('eroi'); }
        })
    },
    azioni_elite: {
        library: true, fields: ELITE_ACTION_FIELDS, label: a => a.name, keyHint: 'nuova_azione',
        create: () => ({ name: 'Nuova azione', desc: '', colpo: 'attaccante' }),
        sub: a => `${a.turno ? 'A ogni turno' : 'Alla soglia'} · ${a.desc || describeEliteAction(a)}`,
        afterChange: (a, key) => {
            // Senza "turno" i campi del turno non servono più
            if (key === 'turno') {
                if (a.turno) a.turnoBersaglio = a.turnoBersaglio || 'scelto';
                else Object.keys(a).filter(k => k.startsWith('turno')).forEach(k => delete a[k]);
            }
            if (['turno', 'colpo', 'malus', 'turnoPreparazione'].includes(key)) setTimeout(render);
        },
        // Le fasi che la usano stanno tutte nel bestiario: si aggiornano anche loro
        renameRefs: (oldKey, key) => Object.values(lib.bestiario).forEach(e => (e.fasi || []).forEach(f => {
            const list = f.azioni || [];
            if (list.includes(oldKey)) { list[list.indexOf(oldKey)] = key; markLibDirty('bestiario'); }
        }))
    },
    benedizioni: {
        library: true, fields: BLESSING_FIELDS, label: b => b.name, keyHint: 'nuova_benedizione',
        create: () => ({ name: 'Nuova benedizione', livello: 'minore', bersaglio: 'eroe', icon: '', desc: '', effetto: 'prossimo_scontro', buffs: [{ buff_stat: 'att_bonus', buff_val: 1 }] }),
        sub: b => `${b.livello === 'maggiore' ? 'Maggiore' : 'Minore'} · ${b.desc || ''}`,
        // L'effetto decide i campi: si tolgono quelli che non servono più e si ridisegna il modulo
        afterChange: (b, key) => {
            if (key !== 'effetto') return;
            if (b.effetto !== 'prossimo_scontro') delete b.buffs; else b.buffs = b.buffs || [{ buff_stat: 'att_bonus', buff_val: 1 }];
            if (!['cura_party', 'fede', 'bottino_extra'].includes(b.effetto)) delete b.val; else b.val = b.val || 1;
            if (b.effetto !== 'dono') delete b.speciali;
            setTimeout(render);
        }
    },
    maledizioni: {
        library: true, fields: CURSE_FIELDS, label: c => c.name, keyHint: 'nuova_maledizione',
        create: () => ({ type: 'curse', name: 'Nuova maledizione', desc: '', effects: [{ effect: 'add_curse', text: 'Nuova maledizione' }] }),
        sub: c => c.desc,
        renameRefs: (oldKey, key) => Object.values(camp.challenges).forEach(c => { if (c.punishment === oldKey) c.punishment = key; })
    }
};
LIB_KINDS.forEach(kind => Object.assign(COLLECTIONS[kind], {
    store: () => lib[kind], setStore: v => { lib[kind] = v; },
    usage: key => libraryUsage(kind, key),
    dirty: () => markLibDirty(kind)
}));

/* ---------- Filtro per nome delle liste (bestiario, armeria, abilita, elite...) ----------
   La casella sopra la lista nasconde gli elementi il cui nome (o id) non contiene il testo cercato,
   senza ridisegnare la scheda. Il testo resta per scheda (listFilters) anche cambiando elemento. */
const listFilters = {};
const searchText = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const listFilterHtml = name => `<input type="search" class="ed-list-filter" placeholder="Cerca per nome…" value="${esc(listFilters[name] || '')}" ${azioneSu('input', 'filterList', name, '$value')}>`;
function filterList(name, value) {
    listFilters[name] = value;
    applyListFilter(name);
}
function applyListFilter(name) {
    const q = searchText(listFilters[name]);
    document.querySelectorAll('#edContent .ed-list .ed-list-item[data-search]').forEach(el => el.classList.toggle('hidden', !!q && !el.dataset.search.includes(q)));
}

function renderCollection(name) {
    const col = COLLECTIONS[name];
    const content = document.getElementById('edContent');
    const items = col.store();
    const keys = keysOf(items);
    if (!keys.includes(selection[name])) selection[name] = keys[0] || null;
    const sel = selection[name];
    const intro = col.library
        ? `<p class="ed-lib-note">Libreria condivisa da tutte le campagne<span class="ed-adv-only"> (<code>${libraryFilePath(name)}</code>)</span>. Le modifiche valgono ovunque l'elemento è usato.</p>`
        : '';

    content.innerHTML = `${intro}
        <div class="ed-list-actions">
            <button ${azione('addKeyed', name)}>Aggiungi</button>
            <button ${azione('duplicateKeyed', name)} ${sel ? '' : 'disabled'}>Duplica</button>
            <button class="ed-adv-only" ${azione('renameKeyed', name)} ${sel ? '' : 'disabled'}>Rinomina id</button>
            <button class="ed-danger" ${azione('deleteKeyed', name)} ${sel ? '' : 'disabled'}>Elimina</button>
        </div>
        <div class="ed-split">
            <div class="ed-list">${listFilterHtml(name)}${keys.map(k => `
                <div class="ed-list-item ${k === sel ? 'active' : ''}" data-search="${esc(searchText(`${col.label(items[k]) || ''} ${k}`))}" ${azione('selectKeyed', name, k)}>
                    ${items[k] && items[k].icon ? `<img class="ed-list-icon" src="${esc(assetUrl(items[k].icon))}" alt="" loading="lazy" decoding="async" ${azioneSu('error', 'nascondiImmagine', '$el')}>` : ''}
                    ${esc(col.label(items[k]) || k)}<small><span class="ed-adv-only">${esc(k)}${col.sub ? ' · ' : ''}</span>${col.sub ? esc(col.sub(items[k]) || '') : ''}</small>
                    <small class="ed-usage">${esc(usageText(col.usage(k)))}</small>
                </div>`).join('') || '<div class="ed-list-item">Nessun elemento</div>'}
            </div>
            <div class="ed-detail" id="edDetail"></div>
        </div>`;
    applyListFilter(name);
    if (wizardOpen === name) {
        document.getElementById('edDetail').innerHTML = wizardHtml(name);
        const input = document.getElementById('edWizName');
        if (input) input.focus();
        return;
    }
    if (sel) {
        const uses = col.usage(sel);
        const detail = document.getElementById('edDetail');
        const preview = PREVIEWS[name];
        const updatePreview = () => {
            const box = document.getElementById('edSidePreview');
            if (box && preview) box.innerHTML = `<span class="ed-tip-preview-label">Come appare nel gioco</span>${preview(items[sel])}`;
        };
        renderForm(detail, items[sel], col.fields, key => {
            if (col.afterChange) col.afterChange(items[sel], key);
            col.dirty();
            recordRecent(name, sel);
            const active = document.querySelector('.ed-list-item.active');
            if (active && (key === 'name' || key === 'title')) active.firstChild.textContent = col.label(items[sel]) || sel;
            updatePreview();
        });
        detail.insertAdjacentHTML('afterbegin', `<p class="ed-usage-box">${starHtml(name, sel)} <span class="ed-adv-only"><b>Id:</b> <code>${esc(sel)}</code> · </span><b>Usato in:</b> ${esc(usageText(uses))}</p>`);
        if (col.note) detail.insertAdjacentHTML('afterbegin', col.note(items[sel], sel));
        detail.querySelector('.ed-usage-box').insertAdjacentHTML('afterend', sharedBannerHtml(name, sel));
        detail.insertAdjacentHTML('afterbegin', pickBannerHtml(name, sel));
        if (preview) updatePreview();
    }
}

function selectKeyed(name, key) {
    selection[name] = key;
    wizardOpen = null;
    render();
}

function gotoLibrary(kind, key) {
    selection[kind] = key;
    switchTab(kind);
}

function askKey(name, suggestion) {
    const key = prompt('Id (solo lettere minuscole, numeri e _):', suggestion);
    if (key == null) return null;
    if (!/^[a-z0-9_]+$/.test(key)) { alert('Id non valido.'); return null; }
    if (COLLECTIONS[name].store()[key]) { alert('Esiste già un elemento con questo id.'); return null; }
    return key;
}

/* ---------- Id automatici dal nome ----------
   "Aggiungi" e "Duplica" non chiedono l'id: lo ricavano dal nome ("Spada di Fuoco" -> spada_di_fuoco),
   con _2, _3... se esiste già. "Rinomina id" resta per cambiarlo a mano. */
const nameField = name => name === 'challenges' ? 'title' : 'name';
function uniqueKey(name, base) {
    const store = COLLECTIONS[name].store();
    const root = idFromName(base) || COLLECTIONS[name].keyHint || 'elemento';
    let key = root;
    for (let i = 2; store[key]; i++) key = `${root}_${i}`;
    return key;
}

// Aggiunge l'elemento con il nome dato (id automatico) e lo seleziona
function insertKeyed(name, obj) {
    const col = COLLECTIONS[name];
    const key = uniqueKey(name, obj[nameField(name)]);
    if ('id' in obj) obj.id = key;
    col.store()[key] = obj;
    if (col.afterKeyChange) col.afterKeyChange(obj, key);
    selection[name] = key;
    col.dirty();
    recordRecent(name, key);
    finishPendingPick(name, key);   // creato da "Crea nuovo…" di un menu: è già scelto lì
    render();
}

function addKeyed(name) {
    const col = COLLECTIONS[name];
    // Armeria e Bestiario: creazione guidata (tipo e rarità, ruolo e momento) nel riquadro a destra
    if (col.wizard) { wizardOpen = name; render(); return; }
    const label = prompt('Nome:', col.create('x')[nameField(name)] || '');
    if (!label) return;
    const obj = col.create(idFromName(label));
    obj[nameField(name)] = label;
    insertKeyed(name, obj);
}

function duplicateKeyed(name) {
    const col = COLLECTIONS[name];
    const src = col.store()[selection[name]];
    if (!src) return;
    const copy = deepCopy(src);
    copy[nameField(name)] = `${src[nameField(name)] || selection[name]} (copia)`;
    insertKeyed(name, copy);
}

/* ---------- Creazione guidata (ITEM_TEMPLATES / ENEMY_TEMPLATES in campi.js) ---------- */
let wizardOpen = null;   // nome della raccolta con la creazione guidata aperta

function wizardHtml(name) {
    const opt = map => Object.entries(map).map(([k, v]) => `<option value="${esc(k)}">${esc(typeof v === 'string' ? v : v.label)}</option>`).join('');
    const scelte = name === 'armeria'
        ? `<label>Tipo<select id="edWizKind">${opt(ITEM_TEMPLATES)}</select></label>
           <label>Rarità<select id="edWizLevel">${opt(RARITY_LABELS).replace('value="comune"', 'value="comune" selected')}</select></label>`
        : `<label>Ruolo<select id="edWizKind">${opt(ENEMY_TEMPLATES)}</select></label>
           <label>Momento<select id="edWizLevel">${opt(ENEMY_MOMENTS).replace('value="meta"', 'value="meta" selected')}</select></label>`;
    return `<div class="ed-wizard">
        <h3>${name === 'armeria' ? 'Nuovo oggetto' : 'Nuovo nemico'}</h3>
        <p class="ed-help">Scegli e crea: i valori di partenza sono la media degli elementi di oggi, poi li ritocchi. L'id si ricava dal nome.</p>
        <div class="ed-special-row">
            <label class="ed-grow">Nome<input type="text" id="edWizName" ${azioneSu('enter', 'createFromWizard', name)} placeholder="${name === 'armeria' ? 'Es. Spada di Fuoco' : 'Es. Lupo delle Nevi'}"></label>
            ${scelte}
        </div>
        <div class="ed-special-row">
            <button type="button" ${azione('createFromWizard', name)}>Crea</button>
            <button type="button" class="btn-small" ${azione('closeWizard')}>Annulla</button>
        </div>
    </div>`;
}

function closeWizard() {
    wizardOpen = null;
    if (pendingPick && !pendingPick.done) returnFromPick();
    render();
}

function createFromWizard(name) {
    const label = (document.getElementById('edWizName').value || '').trim();
    if (!label) { alert('Scrivi il nome.'); return; }
    const kind = document.getElementById('edWizKind').value;
    const level = document.getElementById('edWizLevel').value;
    let obj;
    if (name === 'armeria') {
        const base = deepCopy(ITEM_TEMPLATES[kind].rarita[level] || {});
        obj = { id: '', name: label, rarity: level, ...base };
        obj.desc = templateItemDesc(obj);
    } else {
        const st = ENEMY_TEMPLATES[kind].momenti[level];
        obj = { name: label, hp: st.hp, maxHp: st.hp, att: st.att, dmg: st.dmg, ca: st.ca, desc: '' };
        if (kind !== 'normale') obj.fasi = [{ soglia: 50, testo: '', azioni: [] }];
    }
    wizardOpen = null;
    insertKeyed(name, obj);
}

// Uso in campagne diverse da quella aperta: lì l'editor non può aggiornare i riferimenti
const usedElsewhere = uses => uses.filter(u => !u.current);

function renameKeyed(name) {
    const col = COLLECTIONS[name];
    const oldKey = selection[name];
    const elsewhere = col.library ? usedElsewhere(col.usage(oldKey)) : [];
    if (elsewhere.length) {
        alert(`"${oldKey}" è usato anche in: ${usageText(elsewhere)}.\nApri quelle campagne e sostituiscilo prima di cambiare l'id, altrimenti smetterebbero di trovarlo.`);
        return;
    }
    const key = askKey(name, oldKey);
    if (!key) return;
    // Ricostruisce l'oggetto per mantenere l'ordine delle chiavi
    col.setStore(Object.fromEntries(Object.entries(col.store()).map(([k, v]) => [k === oldKey ? key : k, v])));
    if (col.afterKeyChange) col.afterKeyChange(col.store()[key], key);
    col.renameRefs(oldKey, key);
    selection[name] = key;
    col.dirty();
    if (col.library) markDirty();  // i riferimenti nella campagna aperta sono cambiati
    render();
}

function deleteKeyed(name) {
    const col = COLLECTIONS[name];
    const key = selection[name];
    const el = col.store()[key];
    if (!el) return;
    const label = col.label(el) || key;
    const uses = col.usage(key);
    const useText = u => `${u.title}${u.n > 1 ? ` (${u.n} volte)` : ''}`;
    // Altre campagne e bottino predefinito: lì l'editor non vede i buchi, quindi prima si toglie da lì
    const blocking = col.library ? uses.filter(u => !u.current || (name === 'armeria' && u.title === 'bottino predefinito')) : [];
    if (blocking.length) {
        edConfirm({
            title: `«${label}» non si può eliminare adesso`,
            html: `<p>È usato anche in:</p><ul>${blocking.map(u => `<li>${esc(useText(u))}</li>`).join('')}</ul>
                <p>Toglilo prima da lì (o, se vuoi cambiarlo solo qui, usa "Fanne una copia solo per questa campagna").</p>`,
            ok: null
        });
        return;
    }
    const where = name === 'challenges'
        ? camp.mapNodes.filter(n => n.challengeId === key).map(n => n.title || `nodo ${n.id}`)
        : uses.filter(u => name !== 'benedizioni').map(useText);
    edConfirm({
        title: `Eliminare «${label}»?`,
        html: where.length
            ? `<p>È usato in:</p><ul>${where.map(w => `<li>${esc(w)}</li>`).join('')}</ul><p>Lì resterà un buco da sistemare (lo vedrai in "Da sistemare").</p>`
            : '<p>Non è usato da nessuna parte.</p>',
        ok: where.length ? 'Elimina comunque' : 'Elimina',
        danger: where.length > 0
    }, () => {
        delete col.store()[key];
        selection[name] = null;
        col.dirty();
        render();
        edToast(`Eliminato «${label}»`, true);
    });
}
