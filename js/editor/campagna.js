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

/* Tutti gli eroi della libreria come carte in ordine alfabetico, con una casella di ricerca:
   un clic sulla carta mette l'eroe nella campagna o lo toglie (cornice dorata e ✓ = già nella campagna).
   Gli eroi scritti dentro la campagna (formato vecchio) restano in cima, si possono solo togliere. */
function heroCardsOrder(eroi) {
    return Object.entries(eroi).sort(([, a], [, b]) => String(a.name).localeCompare(String(b.name), 'it', { sensitivity: 'base' }));
}

function edHeroCardHtml(id, h, chosen) {
    const stats = `FOR ${h.str} · INT ${h.int} · FEDE ${h.fth} · HP ${h.maxHp}`;
    return `<div class="ed-hero-card ${chosen ? 'chosen' : ''}" role="button" tabindex="0" aria-pressed="${chosen}"
            data-search="${esc(searchText(`${h.name} ${id}`))}" title="${chosen ? 'Clicca per toglierlo dalla campagna' : 'Clicca per aggiungerlo alla campagna'}"
            ${azione('toggleCampaignHero', id)} ${azioneSu('enter', 'toggleCampaignHeroKey', '$el', '$event', id)}>
        ${h.portrait ? `<img src="${esc(assetUrl(h.portrait))}" alt="" loading="lazy" decoding="async" ${azioneSu('error', 'nascondiImmagine', '$el')}>` : `<span class="ed-hero-initial">${esc(String(h.name || '?').charAt(0))}</span>`}
        <span class="ed-hero-check" aria-hidden="true">✓</span>
        <b>${esc(h.name)}</b>
        <small>${stats}</small>
        ${chosen ? `<button class="btn-small" data-stop ${azione('gotoLibrary', 'eroi', id)}>Modifica</button>` : ''}
    </div>`;
}

function renderHeroesTab() {
    const content = document.getElementById('edContent');
    const custom = camp.heroes.map((ref, i) => ({ ref, i })).filter(x => typeof x.ref !== 'string');
    const n = camp.heroes.length;
    content.innerHTML = `
        <p class="ed-lib-note">Clicca su un eroe per aggiungerlo alla campagna o toglierlo. Statistiche, ritratti e abilità
            si cambiano nelle <a href="#" ${azione('switchTab', 'eroi')}>Schede degli eroi</a>, condivise da tutte le campagne.</p>
        <p class="ed-hero-count ${n ? '' : 'empty'}">${n ? `Nella campagna: <b>${n}</b> ${n === 1 ? 'eroe' : 'eroi'}` : 'Nessun eroe nella campagna: scegline almeno uno.'}</p>
        ${custom.map(({ ref, i }) => `<div class="ed-pick"><span>${esc(heroRefLabel(ref))}</span>
            <button class="btn-small ed-danger" ${azione('removeCampaignHero', i)}>Togli</button></div>`).join('')}
        <input type="search" class="ed-list-filter" id="edHeroSearch" placeholder="Cerca un eroe…" value="${esc(listFilters.heroes || '')}" ${azioneSu('input', 'filterHeroCards', '$value')}>
        <div class="ed-hero-grid" id="edHeroGrid">${heroCardsOrder(lib.eroi).map(([id, h]) => edHeroCardHtml(id, h, camp.heroes.includes(id))).join('')}</div>
        <p class="ed-help hidden" id="edHeroNone">Nessun eroe con questo nome.</p>`;
    filterHeroCards(listFilters.heroes || '');
}

function filterHeroCards(value) {
    listFilters.heroes = value;
    const q = searchText(value);
    let visibili = 0;
    document.querySelectorAll('#edHeroGrid .ed-hero-card').forEach(el => {
        const ok = !q || el.dataset.search.includes(q);
        el.classList.toggle('hidden', !ok);
        if (ok) visibili++;
    });
    const none = document.getElementById('edHeroNone');
    if (none) none.classList.toggle('hidden', visibili > 0);
}

function toggleCampaignHero(id) {
    const i = camp.heroes.indexOf(id);
    if (i >= 0) camp.heroes.splice(i, 1); else camp.heroes.push(id);
    markDirty();
    render();
}

// Invio sulla carta (non sul suo pulsante "Modifica", che fa già il suo clic)
function toggleCampaignHeroKey(card, ev, id) {
    if (ev.target === card) toggleCampaignHero(id);
}

function newHeroTemplate(name) {
    return { name, str: 3, int: 2, fth: 2, maxHp: 4, hp: 4, dmg: 1, base_armor: 0, current_armor: 0, att_penalty: 0, def_bonus: 0, help_bonus_val: 0, items: [] };
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
    const n = list.length;
    // Con il bottino predefinito l'elenco non è della campagna: si vedono solo gli oggetti, senza clic
    const onlyChosen = usesDefault || itemCardsOnlyChosen;
    const entries = itemCardsOrder(lib.armeria).filter(([id]) => !onlyChosen || list.includes(id));
    const custom = list.map((ref, i) => ({ ref, i })).filter(x => typeof x.ref !== 'string' || !lib.armeria[x.ref]);

    content.innerHTML = `
        <div class="ed-list-actions">
            ${Object.entries(ITEM_LISTS).map(([k, label]) => `<button class="ed-subtab ${k === listKey ? 'active' : ''}" ${azione('selectItemList', k)}>${label}</button>`).join('')}
        </div>
        <p class="ed-lib-note">${usesDefault ? 'Sono gli oggetti del bottino predefinito, condiviso da tutte le campagne.' : 'Clicca su un oggetto per aggiungerlo o toglierlo.'}
            Gli oggetti si creano e si cambiano in <a href="#" ${azione('switchTab', 'armeria')}>Oggetti</a>, nella libreria condivisa.</p>
        ${listKey === 'lootItems' ? `<label class="ed-check"><input type="checkbox" ${usesDefault ? 'checked' : ''} ${azioneSu('change', 'toggleDefaultLoot', '$checked')}>
            Usa il bottino predefinito (elenco nell'armeria, condiviso)</label>` : ''}
        <p class="ed-hero-count ${n ? '' : 'empty'}">${n ? `${esc(ITEM_LISTS[listKey])}: <b>${n}</b> ${n === 1 ? 'oggetto' : 'oggetti'}` : 'Nessun oggetto scelto.'}</p>
        ${custom.map(({ ref, i }) => `<div class="ed-pick"><span>${esc(itemLabel(ref))}</span>
            ${usesDefault ? '' : `<button class="btn-small ed-danger" ${azione('removeCampaignItem', i)}>Togli</button>`}</div>`).join('')}
        <div class="ed-card-tools">
            <input type="search" class="ed-list-filter" id="edItemSearch" placeholder="Cerca un oggetto…" value="${esc(listFilters.items || '')}" ${azioneSu('input', 'filterItemCards', '$value')}>
            ${usesDefault ? '' : `<label class="ed-check"><input type="checkbox" ${itemCardsOnlyChosen ? 'checked' : ''} ${azioneSu('change', 'setItemCardsOnlyChosen', '$checked')}> Solo quelli scelti</label>`}
        </div>
        <div class="ed-item-grid" id="edItemGrid">${entries.map(([id, it]) => edItemCardHtml(id, it, list.includes(id), !usesDefault)).join('')}</div>
        <p class="ed-help hidden" id="edItemNone">Nessun oggetto con questo nome.</p>`;
    filterItemCards(listFilters.items || '');
}

/* Oggetti come carte: icona, nome nel colore della rarità, descrizione; un clic li mette o li toglie dalla lista */
let itemCardsOnlyChosen = false;
function setItemCardsOnlyChosen(v) { itemCardsOnlyChosen = !!v; render(); }

function itemCardsOrder(armeria) {
    return Object.entries(armeria).sort(([, a], [, b]) => String(a.name).localeCompare(String(b.name), 'it', { sensitivity: 'base' }));
}

function edItemCardHtml(id, it, chosen, clickable) {
    const rar = RARITY_LABELS[it.rarity] ? it.rarity : 'comune';
    const act = clickable ? `role="button" tabindex="0" ${azione('toggleCampaignItem', id)} ${azioneSu('enter', 'toggleCampaignItemKey', '$el', '$event', id)}
        title="${chosen ? 'Clicca per toglierlo' : 'Clicca per aggiungerlo'}"` : '';
    return `<div class="ed-item-card rar-${rar} ${chosen ? 'chosen' : ''} ${clickable ? '' : 'static'}" aria-pressed="${chosen}"
            data-search="${esc(searchText(`${it.name} ${id} ${RARITY_LABELS[rar]}`))}" ${act}>
        ${it.icon ? `<img src="${esc(assetUrl(it.icon))}" alt="" loading="lazy" decoding="async" ${azioneSu('error', 'nascondiImmagine', '$el')}>` : '<span class="ed-item-noicon">?</span>'}
        <span class="ed-item-text"><b>${esc(it.name)}</b><small class="ed-item-rar">${esc(RARITY_LABELS[rar])}</small><small>${esc(it.desc || '')}</small></span>
        <span class="ed-hero-check" aria-hidden="true">✓</span>
        ${chosen ? `<button class="btn-small" data-stop ${azione('gotoLibrary', 'armeria', id)}>Modifica</button>` : ''}
    </div>`;
}

function filterItemCards(value) {
    listFilters.items = value;
    const q = searchText(value);
    let visibili = 0;
    document.querySelectorAll('#edItemGrid .ed-item-card').forEach(el => {
        const ok = !q || el.dataset.search.includes(q);
        el.classList.toggle('hidden', !ok);
        if (ok) visibili++;
    });
    const none = document.getElementById('edItemNone');
    if (none) none.classList.toggle('hidden', visibili > 0);
}

function toggleCampaignItem(id) {
    const list = camp[selection.itemList];
    if (!Array.isArray(list)) return;  // bottino predefinito: non si cambia da qui
    const i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1); else list.push(id);
    markDirty();
    render();
}

function toggleCampaignItemKey(card, ev, id) {
    if (ev.target === card) toggleCampaignItem(id);
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
