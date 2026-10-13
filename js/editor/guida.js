/* ==========================================================================
   EDITOR: GUIDA AL PRIMO AVVIO
   Cinque fumetti in sequenza sulle parti principali dell'editor. Parte da sola la prima volta
   (dignitas_editor_guida nel browser), si riapre con il pulsante "?" in alto. I passi su elementi
   non visibili adesso (es. "Da sistemare" nella Home) si saltano.
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

const GUIDE_KEY = 'dignitas_editor_guida';
const GUIDA_PASSI = [
    { sel: 'edHomeCreate', titolo: 'Benvenuto nell\'editor',
      testo: 'Da qui crei una campagna nuova, apri una di quelle che ci sono già o vai a nemici e oggetti. Il pulsante Home in alto ti riporta sempre qui.' },
    { sel: 'edTabs', titolo: 'Le schede',
      testo: 'Sopra le schede della campagna aperta (mappa, eroi, prove, testi); sotto la libreria condivisa: nemici, oggetti, reliquie... valgono per tutte le campagne.' },
    { sel: 'edAdvancedSwitch', titolo: 'Avanzate',
      testo: 'Spente, l\'editor mostra solo le cose di tutti i giorni. Accendile per gli effetti speciali, gli elite e i dettagli tecnici: puoi spegnerle quando vuoi.' },
    { sel: 'edIssuesHeading', titolo: 'Da sistemare',
      testo: 'Qui l\'editor elenca cosa manca o non va (un nodo senza nemico, un\'immagine mancante). Clicca una riga per andare al punto giusto.' },
    { sel: 'edSaveBtn', titolo: 'Salva',
      testo: 'Quando hai finito premi Salva. Intanto non perdi niente: le modifiche restano nel browser e le ritrovi nella Home. "Prova nel gioco" ti fa giocare la campagna com\'è adesso.' }
];

let guideStep = -1;

function guideSeen() {
    try { return localStorage.getItem(GUIDE_KEY) === '1'; } catch (e) { return true; }  // senza memoria non la ripropone a ogni avvio
}

function guideTarget(i) {
    const el = document.getElementById(GUIDA_PASSI[i].sel);
    return el && el.getClientRects().length ? el : null;
}

function startGuide() {
    guideStep = -1;
    guideNext();
}

function guideNext() {
    document.querySelectorAll('.ed-guide-target').forEach(el => el.classList.remove('ed-guide-target'));
    do guideStep++; while (guideStep < GUIDA_PASSI.length && !guideTarget(guideStep));
    if (guideStep >= GUIDA_PASSI.length) return guideSkip();

    const passo = GUIDA_PASSI[guideStep];
    const target = guideTarget(guideStep);
    const last = !GUIDA_PASSI.slice(guideStep + 1).some((p, j) => guideTarget(guideStep + 1 + j));
    let box = document.getElementById('edGuide');
    if (!box) {
        box = document.createElement('div');
        box.id = 'edGuide';
        box.className = 'ed-guide';
        box.setAttribute('role', 'dialog');
        document.body.appendChild(box);
    }
    box.innerHTML = `
        <b class="ed-guide-title">${esc(passo.titolo)}</b>
        <p>${esc(passo.testo)}</p>
        <div class="ed-guide-actions">
            <small>${guideStep + 1} di ${GUIDA_PASSI.length}</small>
            <button class="btn-small" ${azione('guideSkip')}>${last ? 'Chiudi' : 'Salta'}</button>
            ${last ? '' : `<button class="btn-small ed-save" ${azione('guideNext')}>Avanti</button>`}
        </div>`;
    target.classList.add('ed-guide-target');
    target.scrollIntoView({ block: 'nearest' });

    // Sotto l'elemento, dentro la finestra; sopra se sotto non c'è posto
    const r = target.getBoundingClientRect();
    const w = Math.min(340, window.innerWidth - 24);
    box.style.width = `${w}px`;
    box.style.left = `${Math.max(12, Math.min(window.innerWidth - w - 12, r.left + r.width / 2 - w / 2))}px`;
    const below = r.bottom + 12;
    box.style.top = below + box.offsetHeight < window.innerHeight ? `${below}px` : `${Math.max(12, r.top - box.offsetHeight - 12)}px`;
}

function guideSkip() {
    document.querySelectorAll('.ed-guide-target').forEach(el => el.classList.remove('ed-guide-target'));
    const box = document.getElementById('edGuide');
    if (box) box.remove();
    guideStep = -1;
    try { localStorage.setItem(GUIDE_KEY, '1'); } catch (e) { /* non ricordata: ricomparirà */ }
}
