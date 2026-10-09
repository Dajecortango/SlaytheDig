/* ==========================================================================
   EDITOR: NAVIGAZIONE E AVVIO
   Schede, render() e avvio: prima campagna, scheda da indirizzo (editor.html#bestiario),
   offerta di ripristinare la bozza. Ultimo file dell'editor: qui si possono chiamare tutti gli altri.
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

/* ---------- Navigazione ---------- */
const TABS = ['general', 'map', 'heroes', 'items', 'challenges', 'other', 'elite', ...LIB_KINDS];

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('#edTabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    render();
}

document.getElementById('edTabs').addEventListener('click', e => {
    const btn = e.target.closest('button[data-tab]');
    if (btn) switchTab(btn.dataset.tab);
});

function render() {
    if (!camp) return;
    if (currentTab === 'general') renderGeneralTab();
    else if (currentTab === 'map') renderMapTab();
    else if (currentTab === 'heroes') renderHeroesTab();
    else if (currentTab === 'items') renderItemsTab();
    else if (currentTab === 'other') renderOtherTab();
    else if (currentTab === 'elite') renderEliteTab();
    else renderCollection(currentTab);  // sfide e librerie
    renderIssues();
}

fillCampaignSelect();
const firstCampaign = Object.values(rawCampaigns())[0];
if (firstCampaign) setCampaign(deepCopy(firstCampaign)); else newCampaign();

// Apre direttamente una scheda da indirizzo, es. editor.html#bestiario
if (TABS.includes(location.hash.slice(1))) switchTab(location.hash.slice(1));

// Se c'è una bozza non salvata, propone di ripristinarla
if (window.indexedDB) offerDraftRestore();
