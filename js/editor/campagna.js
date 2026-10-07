/* ==========================================================================
   EDITOR: SCHEDE DELLA CAMPAGNA
   Eroi della campagna (scelti dalla libreria), armeria iniziale e bottino (dall'armeria),
   testi in JSON e dati generali.
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

/* ---------- Eroi della campagna: scelti dalla libreria ---------- */
function heroRefLabel(ref) {
    if (typeof ref !== 'string') return `${ref.name} (scritto nella campagna)`;
    const h = lib.eroi[ref];
    return h ? h.name : `${ref} (non trovato fra gli eroi)`;
}

function renderHeroesTab() {
    const content = document.getElementById('edContent');
    const available = Object.entries(lib.eroi).filter(([id]) => !camp.heroes.includes(id));
    content.innerHTML = `
        <p class="ed-lib-note">Gli eroi stanno nella libreria <a href="#" ${azione('switchTab', 'eroi')}>Eroi</a>, condivisa da tutte le campagne:
            qui si sceglie quali può reclutare questa campagna. Statistiche, ritratti e abilità si modificano lì.</p>
        <div class="ed-detail">
            <div class="ed-picklist">${camp.heroes.map((ref, i) => {
                const h = typeof ref === 'string' ? lib.eroi[ref] : ref;
                return `
                <div class="ed-pick">
                    ${h && h.portrait ? `<img class="ed-list-portrait" src="${esc(assetUrl(h.portrait))}" alt="" loading="lazy" decoding="async" ${azioneSu('error', 'nascondiImmagine', '$el')}>` : ''}
                    <span>${esc(heroRefLabel(ref))}<small>${h ? `FOR ${h.str} · INT ${h.int} · FEDE ${h.fth} · HP ${h.maxHp} · ${(h.abilities || []).length} abilità` : ''}</small></span>
                    ${typeof ref === 'string' && lib.eroi[ref] ? `<button class="btn-small" ${azione('gotoLibrary', 'eroi', ref)}>Modifica</button>` : ''}
                    <button class="btn-small ed-danger" ${azione('removeCampaignHero', i)}>Togli</button>
                </div>`;
            }).join('') || '<p class="ed-help">Nessun eroe: aggiungine almeno uno.</p>'}
            </div>
            <div class="ed-add-row">
                <select id="edAddHero">${available.map(([id, h]) => `<option value="${esc(id)}">${esc(h.name)} — FOR ${h.str} · INT ${h.int} · FEDE ${h.fth} · HP ${h.maxHp}</option>`).join('')}</select>
                <button class="btn-small" data-action="addCampaignHero" ${available.length ? '' : 'disabled'}>Aggiungi dalla libreria</button>
            </div>
        </div>`;
}

function newHeroTemplate(name) {
    return { name, str: 3, int: 2, fth: 2, maxHp: 4, hp: 4, dmg: 1, base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, items: [] };
}

function addCampaignHero() {
    const id = document.getElementById('edAddHero').value;
    if (!id) return;
    camp.heroes.push(id);
    markDirty();
    render();
}

function removeCampaignHero(i) {
    camp.heroes.splice(i, 1);
    markDirty();
    render();
}

/* ---------- Oggetti della campagna: scelti dall'armeria ---------- */
function itemLabel(ref) {
    if (typeof ref !== 'string') return `${ref.name} (scritto nella campagna)`;
    const it = lib.armeria[ref];
    return it ? `${it.name}${it.rarity ? ' · ' + it.rarity : ''}` : `${ref} (non trovato nell'armeria)`;
}

function renderItemsTab() {
    const content = document.getElementById('edContent');
    const listKey = selection.itemList;
    const usesDefault = listKey === 'lootItems' && camp.lootItems === null;
    const list = usesDefault ? (lib.lootPredefinito || []) : camp[listKey];
    const available = Object.entries(lib.armeria).filter(([id]) => usesDefault || !list.includes(id));

    content.innerHTML = `
        <div class="ed-list-actions">
            ${Object.entries(ITEM_LISTS).map(([k, label]) => `<button class="ed-subtab ${k === listKey ? 'active' : ''}" ${azione('selectItemList', k)}>${label}</button>`).join('')}
        </div>
        <p class="ed-lib-note">Gli oggetti stanno nell'<a href="#" ${azione('switchTab', 'armeria')}>Armeria</a>, condivisa da tutte le campagne: qui si sceglie quali usa questa campagna.</p>
        ${listKey === 'lootItems' ? `<label class="ed-check"><input type="checkbox" ${usesDefault ? 'checked' : ''} ${azioneSu('change', 'toggleDefaultLoot', '$checked')}>
            Usa il bottino predefinito (elenco nell'armeria, condiviso)</label>` : ''}
        <div class="ed-detail">
            <div class="ed-picklist">${list.map((ref, i) => `
                <div class="ed-pick">
                    <span>${esc(itemLabel(ref))}<small>${esc(typeof ref === 'string' ? ref : ref.id)}${typeof ref === 'string' && lib.armeria[ref] ? ' · ' + esc(lib.armeria[ref].desc || '') : ''}</small></span>
                    ${typeof ref === 'string' && lib.armeria[ref] ? `<button class="btn-small" ${azione('gotoLibrary', 'armeria', ref)}>Modifica</button>` : ''}
                    ${usesDefault ? '' : `<button class="btn-small ed-danger" ${azione('removeCampaignItem', i)}>Togli</button>`}
                </div>`).join('') || '<p class="ed-help">Nessun oggetto.</p>'}
            </div>
            ${usesDefault ? '' : `
            <div class="ed-add-row">
                <select id="edAddItem">${available.map(([id, it]) => `<option value="${esc(id)}">${esc(it.name)}${it.rarity ? ' · ' + esc(it.rarity) : ''} — ${esc(it.desc || '')}</option>`).join('')}</select>
                <button class="btn-small" data-action="addCampaignItem" ${available.length ? '' : 'disabled'}>Aggiungi dall'armeria</button>
            </div>`}
        </div>`;
}

function selectItemList(k) { selection.itemList = k; render(); }

function toggleDefaultLoot(useDefault) {
    if (useDefault) {
        if (camp.lootItems && camp.lootItems.length && !confirm('Sostituire il bottino della campagna con quello predefinito?')) return render();
        camp.lootItems = null;
    } else {
        camp.lootItems = [...(lib.lootPredefinito || [])];
    }
    markDirty();
    render();
}

function addCampaignItem() {
    const id = document.getElementById('edAddItem').value;
    if (!id) return;
    camp[selection.itemList].push(id);
    markDirty();
    render();
}

function removeCampaignItem(i) {
    camp[selection.itemList].splice(i, 1);
    markDirty();
    render();
}

/* ---------- Testi (JSON) ---------- */
function renderOtherTab() {
    const content = document.getElementById('edContent');
    content.innerHTML = OTHER_SECTIONS.map(s => `<h3>${esc(s.label)}</h3><div id="edOther_${s.k}"></div>`).join('');
    OTHER_SECTIONS.forEach(s => renderForm(document.getElementById(`edOther_${s.k}`), camp,
        [{ k: s.k, label: 'JSON', type: 'json', wide: true, help: s.help }], markDirty));
}

/* ---------- Generale ---------- */
function renderGeneralTab() {
    const content = document.getElementById('edContent');
    content.innerHTML = `<div class="ed-detail" id="edDetail"></div>`;
    renderForm(document.getElementById('edDetail'), camp, GENERAL_FIELDS, markDirty);
}
