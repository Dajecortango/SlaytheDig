/* ==========================================================================
   EDITOR: RACCOLTE CON CHIAVE
   Sfide della campagna e schede della libreria (Bestiario, Armeria, Reliquie, Eroi, Abilità,
   Maledizioni): COLLECTIONS, elenco e modulo, aggiungi, duplica, rinomina, elimina.
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

/* ---------- Raccolte con chiave: sfide (campagna) e le quattro librerie ---------- */
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
        create: () => ({ name: 'Nuovo nemico', hp: 8, maxHp: 8, att: 7, dmg: 1, ca: 7, desc: '' }),
        sub: e => `HP ${e.maxHp} · CA ${e.ca} · Att ${e.att} · Danno ${e.dmg}`,
        renameRefs: (oldKey, key) => camp.mapNodes.forEach(n => { if (n.enemy === oldKey) n.enemy = key; }),
        note: (e, key) => `<p class="ed-lib-note">${Array.isArray(e.fasi) ? `${e.fasi.length} soglie di vita con azioni speciali` : 'Nessuna soglia di vita'}:
            <a href="#" ${azione('gotoLibrary', 'elite', key)}>modifica nella scheda Elite</a>.</p>`
    },
    armeria: {
        library: true, fields: ITEM_FIELDS, label: i => i.name, keyHint: 'nuovo_oggetto',
        create: key => ({ id: key, name: 'Nuovo oggetto', rarity: 'comune', desc: '' }),
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

function renderCollection(name) {
    const col = COLLECTIONS[name];
    const content = document.getElementById('edContent');
    const items = col.store();
    const keys = keysOf(items);
    if (!keys.includes(selection[name])) selection[name] = keys[0] || null;
    const sel = selection[name];
    const intro = col.library
        ? `<p class="ed-lib-note">Libreria condivisa da tutte le campagne (<code>${libraryFilePath(name)}</code>). Le modifiche valgono ovunque l'elemento è usato.</p>`
        : '';

    content.innerHTML = `${intro}
        <div class="ed-list-actions">
            <button ${azione('addKeyed', name)}>Aggiungi</button>
            <button ${azione('duplicateKeyed', name)} ${sel ? '' : 'disabled'}>Duplica</button>
            <button ${azione('renameKeyed', name)} ${sel ? '' : 'disabled'}>Rinomina id</button>
            <button class="ed-danger" ${azione('deleteKeyed', name)} ${sel ? '' : 'disabled'}>Elimina</button>
        </div>
        <div class="ed-split">
            <div class="ed-list">${keys.map(k => `
                <div class="ed-list-item ${k === sel ? 'active' : ''}" ${azione('selectKeyed', name, k)}>
                    ${items[k] && items[k].icon ? `<img class="ed-list-icon" src="${esc(assetUrl(items[k].icon))}" alt="" loading="lazy" decoding="async" ${azioneSu('error', 'nascondiImmagine', '$el')}>` : ''}
                    ${esc(col.label(items[k]) || k)}<small>${esc(k)}${col.sub ? ' · ' + esc(col.sub(items[k]) || '') : ''}</small>
                    <small class="ed-usage">${esc(usageText(col.usage(k)))}</small>
                </div>`).join('') || '<div class="ed-list-item">Nessun elemento</div>'}
            </div>
            <div class="ed-detail" id="edDetail"></div>
        </div>`;
    if (sel) {
        const uses = col.usage(sel);
        const detail = document.getElementById('edDetail');
        const preview = PREVIEWS[name];
        const updatePreview = () => {
            const box = document.getElementById('edTipPreview');
            if (box && preview) box.innerHTML = preview(items[sel]);
        };
        renderForm(detail, items[sel], col.fields, key => {
            if (col.afterChange) col.afterChange(items[sel], key);
            col.dirty();
            const active = document.querySelector('.ed-list-item.active');
            if (active && (key === 'name' || key === 'title')) active.firstChild.textContent = col.label(items[sel]) || sel;
            updatePreview();
        });
        detail.insertAdjacentHTML('afterbegin', `<p class="ed-usage-box"><b>Id:</b> <code>${esc(sel)}</code> · <b>Usato in:</b> ${esc(usageText(uses))}</p>`);
        if (col.note) detail.insertAdjacentHTML('afterbegin', col.note(items[sel], sel));
        if (preview) {
            detail.insertAdjacentHTML('beforeend', '<div class="ed-tip-preview-wrap"><span class="ed-tip-preview-label">Anteprima del tooltip nel gioco</span><div id="edTipPreview"></div></div>');
            updatePreview();
        }
    }
}

function selectKeyed(name, key) {
    selection[name] = key;
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

function addKeyed(name) {
    const col = COLLECTIONS[name];
    const key = askKey(name, col.keyHint);
    if (!key) return;
    col.store()[key] = col.create(key);
    selection[name] = key;
    col.dirty();
    render();
}

function duplicateKeyed(name) {
    const col = COLLECTIONS[name];
    const src = selection[name];
    const key = askKey(name, `${src}_copia`);
    if (!key) return;
    col.store()[key] = deepCopy(col.store()[src]);
    if (col.afterKeyChange) col.afterKeyChange(col.store()[key], key);
    selection[name] = key;
    col.dirty();
    render();
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
    const uses = col.usage(key);
    if (col.library && uses.length) {
        alert(`"${key}" è usato in: ${usageText(uses)}.\nToglilo da lì prima di eliminarlo dalla libreria.`);
        return;
    }
    if (!confirm(`Eliminare "${key}"?${uses.length ? ` È usato da ${uses[0].n} nodi della mappa.` : ''}`)) return;
    delete col.store()[key];
    selection[name] = null;
    col.dirty();
    render();
}
