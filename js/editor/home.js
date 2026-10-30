/* ==========================================================================
   EDITOR: HOME
   Prima schermata (currentTab = 'home'): crea una campagna (da zero o copiandone una), apri una campagna
   del progetto o un file, vai alla libreria condivisa, riprendi la bozza salvata nel browser.
   Finché non si sceglie una campagna (campaignChosen) le schede della campagna restano nascoste.
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

let campaignChosen = false;   // l'utente ha aperto o creato una campagna (all'avvio la prima è caricata solo per la libreria)
let homeDraft = null;         // bozza trovata nel browser all'avvio (readDraft), offerta nella Home

const HOME_LIB_TABS = ['bestiario', 'armeria', 'reliquie', 'maledizioni', 'eroi', 'abilita', 'benedizioni', 'avventure'];

function renderHomeTab() {
    const content = document.getElementById('edContent');
    const campaigns = Object.values(rawCampaigns());
    const cover = c => c.coverImage
        ? `<img class="ed-home-cover" src="${esc(assetUrl(c.coverImage))}" alt="" loading="lazy" decoding="async" ${azioneSu('error', 'nascondiImmagine', '$el')}>`
        : '<span class="ed-home-cover ed-home-cover-empty">🗺️</span>';

    const resume = homeDraft ? `
        <div class="ed-home-resume" id="edHomeResume">
            <div>
                <b>Riprendi da dove eri rimasto</b>
                <span>«${esc(homeDraft.campaign.title)}», modifiche non salvate del ${esc(homeDraft.savedAt || '')}${(homeDraft.libDirty || []).length ? ', anche a nemici e oggetti' : ''}.</span>
                <small>Se apri un'altra campagna e la modifichi, questa bozza viene sostituita.</small>
            </div>
            <button class="btn-small ed-save" ${azione('homeRestoreDraft')}>Riprendi</button>
            <button class="btn-small" ${azione('homeDiscardDraft')}>Butta via</button>
        </div>` : '';

    const current = campaignChosen ? `
        <p class="ed-home-current">Stai modificando <b>${esc(camp.title)}</b>${hasUnsaved() ? ' (non salvata)' : ''}.
            <button class="btn-small" ${azione('switchTab', 'general')}>Continua</button></p>` : '';

    content.innerHTML = `
        <div class="ed-home">
            <h1 class="ed-home-title">Cosa vuoi fare?</h1>
            ${resume}${current}
            <div class="ed-home-doors">
                <section class="ed-home-door" id="edHomeCreate">
                    <h2>Crea una nuova campagna</h2>
                    <p>Dalle un nome. Puoi partire da zero (una mappa piccola già pronta da riempire) o dalla copia di una campagna che c'è già.</p>
                    <label for="edHomeTitle">Nome della campagna</label>
                    <input type="text" id="edHomeTitle" placeholder="Es. La torre del corvo" data-enter="homeCreate">
                    <label for="edHomeFrom">Come partire</label>
                    <select id="edHomeFrom">
                        <option value="">Da zero</option>
                        ${campaigns.map(c => `<option value="${esc(c.id)}">Copia di «${esc(c.title)}»</option>`).join('')}
                    </select>
                    <button class="ed-save" ${azione('homeCreate')}>Crea</button>
                </section>

                <section class="ed-home-door" id="edHomeOpen">
                    <h2>Modifica una campagna</h2>
                    <p>Scegli quella da cambiare.</p>
                    <div class="ed-home-list">${campaigns.map(c => `
                        <button type="button" class="ed-home-camp" ${azione('homeOpen', c.id)}>${cover(c)}<span>${esc(c.title)}</span></button>`).join('')}
                    </div>
                    <label class="ed-file-btn ed-home-file">Apri un file…<input type="file" accept=".js,.json" hidden ${azioneSu('change', 'homeOpenFile', '$el')}></label>
                </section>

                <section class="ed-home-door" id="edHomeLib">
                    <h2>Nemici, oggetti e altro</h2>
                    <p>La libreria condivisa: quello che crei qui si può usare in tutte le campagne.</p>
                    <div class="ed-home-libs">${HOME_LIB_TABS.map(k => `<button type="button" ${azione('switchTab', k)}>${esc(LIB_LABELS[k])}</button>`).join('')}</div>
                </section>
            </div>
            <p class="ed-home-zip">
                <button type="button" class="btn-small" ${azione('downloadZip')}>Scarica .zip…</button>
                <span>La libreria, un capitolo o tutto il progetto, da mandare a chi tiene il gioco.</span>
            </p>
            <p class="ed-home-zip">
                <button type="button" class="btn-small" ${azione('homeCheckImages')}>Controlla immagini</button>
                <span>I nodi di ogni campagna che non hanno ancora un'immagine, o ne hanno una che non si trova.</span>
            </p>
        </div>`;
}

function chooseCampaign(tab = 'general') {
    campaignChosen = true;
    switchTab(tab);
}

function goHome() { switchTab('home'); }

function homeCreate() {
    const input = document.getElementById('edHomeTitle');
    const title = input.value.trim();
    if (!title) {
        input.classList.add('ed-invalid');
        input.placeholder = 'Scrivi qui il nome, poi premi Crea';
        input.focus();
        return;
    }
    const from = document.getElementById('edHomeFrom').value;
    if (from) {
        if (!confirmDiscard()) return;
        switchCampaign(campaignCopy(rawCampaigns()[from], title), null);
    } else if (!newCampaign(title)) return;
    chooseCampaign(from ? 'general' : 'map');
}

function homeOpen(id) {
    if (openCampaign(id)) chooseCampaign();
}

function homeOpenFile(input) {
    const file = input.files[0];
    input.value = '';
    readCampaignFile(file, () => chooseCampaign());
}

function homeRestoreDraft() {
    if (!homeDraft || !confirmDiscard()) return;
    restoreDraft(homeDraft);
    homeDraft = null;
    chooseCampaign();
}

function homeDiscardDraft() {
    edConfirm({ title: 'Buttare via le modifiche non salvate?', html: '<p>Non si possono recuperare.</p>', ok: 'Butta via', danger: true }, async () => {
        await clearDraft();
        homeDraft = null;
        render();
    });
}
