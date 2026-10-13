/* ==========================================================================
   EDITOR: NAVIGAZIONE E AVVIO
   Schede, render() e avvio: prima campagna, scheda da indirizzo (editor.html#bestiario),
   offerta di ripristinare la bozza. Ultimo file dell'editor: qui si possono chiamare tutti gli altri.
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

/* ---------- Navigazione ---------- */
const TABS = ['home', 'general', 'map', 'heroes', 'items', 'challenges', 'other', 'elite', ...LIB_KINDS];
const ADVANCED_TABS = ['azioni_elite'];
const CAMPAIGN_TABS = ['general', 'map', 'heroes', 'items', 'challenges', 'other'];

function switchTab(tab) {
    // Elite e Azioni elite sono avanzate: aprirle (es. da editor.html#elite o dalla ricerca) accende Avanzate
    if (ADVANCED_TABS.includes(tab) && !document.body.classList.contains('ed-advanced')) setAdvanced(true);
    if (CAMPAIGN_TABS.includes(tab)) campaignChosen = true;  // es. dalla ricerca: la campagna aperta diventa quella scelta
    // Una creazione da "Crea nuovo…" vale finché si resta nella sua scheda; un collegamento in corso solo sulla mappa
    if (pendingPick && tab !== pendingPick.kind) pendingPick = null;
    if (tab !== 'map') mapLink = null;
    currentTab = tab;
    document.querySelectorAll('#edTabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    render();
    if (typeof window.scrollTo === 'function') window.scrollTo(0, 0);
}

document.getElementById('edTabs').addEventListener('click', e => {
    const btn = e.target.closest('button[data-tab]');
    if (btn) switchTab(btn.dataset.tab);
});

function render() {
    if (!camp) return;
    const home = currentTab === 'home';
    document.body.classList.toggle('ed-on-home', home);
    document.body.classList.toggle('ed-no-campaign', !campaignChosen);
    updateCampaignName();
    const preview = document.getElementById('edSidePreview');
    if (preview) preview.innerHTML = '';
    if (home) renderHomeTab();
    else if (currentTab === 'general') renderGeneralTab();
    else if (currentTab === 'map') renderMapTab();
    else if (currentTab === 'heroes') renderHeroesTab();
    else if (currentTab === 'items') renderItemsTab();
    else if (currentTab === 'other') renderOtherTab();
    else if (currentTab === 'elite') renderEliteTab();
    else renderCollection(currentTab);  // sfide e librerie
    renderIssues();
    renderQuickNav();
}

document.body.classList.toggle('ed-advanced', isAdvanced());
document.getElementById('edAdvanced').checked = isAdvanced();

// La prima campagna si carica subito (serve alla libreria: "Usato in", controlli), ma la scelta resta all'utente
const firstCampaign = Object.values(rawCampaigns())[0];
if (firstCampaign) setCampaign(deepCopy(firstCampaign)); else setCampaign(blankCampaign());

// Apre direttamente una scheda da indirizzo, es. editor.html#bestiario (la campagna è la prima del progetto)
const hashTab = location.hash.slice(1);
if (TABS.includes(hashTab) && hashTab !== 'home') {
    campaignChosen = true;
    switchTab(hashTab);
}

// Se c'è una bozza non salvata, la Home la offre ("Riprendi da dove eri rimasto")
if (window.indexedDB) readDraft().then(draft => {
    homeDraft = draft;
    if (currentTab === 'home') render();
});

// Guida al primo avvio
if (!guideSeen()) setTimeout(startGuide, 600);
