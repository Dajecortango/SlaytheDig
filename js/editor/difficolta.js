/* ==========================================================================
   EDITOR: DIFFICOLTÀ STIMATA
   "Difficoltà stimata" (scheda Generale e scheda Mappa): il simulatore del gioco (js/simulator.js,
   profilo Esperto, come tools/difficolta.mjs) gioca SIM_PARTITE partite della campagna così com'è,
   con la compagnia più numerosa che permette (i primi eroi, prima abilità e primo oggetto), e dice
   quante ne vince, con quanti HP si arriva in fondo e dove si cade più spesso; se la campagna ha
   "difficolta" { vittoriaMin, vittoriaMax } dice se ci sta dentro.
   Il motore del gioco non si carica nell'editor (nomi in comune, codice che cerca la pagina del gioco):
   gira in un <iframe> nascosto con srcdoc (stessa origine dell'editor anche da file://), con gli
   stessi script dei test (SIM_SCRIPT_MOTORE, nell'ordine di index.html). Le partite si giocano a
   blocchi di SIM_BLOCCO_MS con setTimeout, così la pagina resta viva e la barra avanza.
   difficoltaStatistiche è pura: la prova tests/editor_difficolta.test.js.
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

const SIM_PARTITE = 200;
const SIM_BLOCCO_MS = 40;
// Motore del gioco per il simulatore: come tests/ambiente.js (SCRIPT_MOTORE), senza la partita online
const SIM_SCRIPT_MOTORE = [
    'js/azioni.js', 'js/libreria.js', 'js/regole.js', 'js/online-regole.js', 'js/comune.js', 'js/schema.js', 'js/procedurale.js', 'js/game.js',
    'js/interfaccia.js', 'js/effetti.js', 'js/menu.js', 'js/spedizione.js', 'js/creazione.js', 'js/oggetti.js', 'js/motore/tiri.js',
    'js/motore/speciali.js', 'js/motore/scontro.js', 'js/motore/prove.js', 'js/prove.js', 'js/salvataggi.js', 'js/suoni-sintetici.js',
    'js/audio.js', 'js/mappa.js', 'js/combattimento.js', 'js/ritratti.js', 'js/loot.js', 'js/shop.js', 'js/simulator.js'
];

/* Riassunto delle partite simulate. risultati: { victory, deathCause, hp, hpMax } per partita.
   difficolta: il campo della campagna (facoltativo). */
function difficoltaStatistiche(risultati, difficolta) {
    const n = risultati.length;
    const vinte = risultati.filter(r => r.victory);
    const p = n ? vinte.length / n : 0;
    const media = (list, f) => list.length ? list.reduce((s, r) => s + f(r), 0) / list.length : null;
    const morti = new Map();
    risultati.filter(r => !r.victory).forEach(r => { const k = r.deathCause || 'Strada senza uscita'; morti.set(k, (morti.get(k) || 0) + 1); });
    const stat = {
        partite: n,
        vinte: vinte.length,
        pct: Math.round(p * 100),
        margine: n ? Math.round(1.96 * Math.sqrt(p * (1 - p) / n) * 100) : 0,   // al 95%, come tools/difficolta.mjs
        hpMedi: media(vinte, r => r.hp || 0),
        hpPct: media(vinte, r => (r.hpMax ? r.hp / r.hpMax : 0) * 100),
        morti: [...morti].map(([dove, volte]) => ({ dove, volte, pct: Math.round(volte / n * 100) })).sort((a, b) => b.volte - a.volte).slice(0, 5),
        obiettivo: null
    };
    if (stat.hpMedi != null) stat.hpMedi = Math.round(stat.hpMedi * 10) / 10;
    if (stat.hpPct != null) stat.hpPct = Math.round(stat.hpPct);
    if (difficolta && (difficolta.vittoriaMin != null || difficolta.vittoriaMax != null)) {
        const min = difficolta.vittoriaMin ?? 0, max = difficolta.vittoriaMax ?? 100;
        stat.obiettivo = { min, max, esito: stat.pct < min ? 'difficile' : stat.pct > max ? 'facile' : 'dentro' };
    }
    return stat;
}

function difficoltaHtml(stat, nomi) {
    const ob = stat.obiettivo;
    const giudizio = !ob ? '' : ob.esito === 'dentro'
        ? `<p class="ed-ok">Dentro la difficoltà voluta (${ob.min}–${ob.max}%).</p>`
        : `<p class="ed-sim-out">${ob.esito === 'difficile' ? 'Più difficile' : 'Più facile'} della difficoltà voluta (${ob.min}–${ob.max}%).</p>`;
    return `<p class="ed-sim-big"><b>${stat.pct}%</b> di vittorie <small>(± ${stat.margine}, ${stat.vinte} su ${stat.partite})</small></p>
        ${giudizio}
        <ul class="ed-sim-list">
            <li>Compagnia: ${esc(nomi.join(', '))} (prima abilità e primo oggetto)</li>
            <li>HP alla fine, nelle vittorie: ${stat.hpMedi == null ? '—' : `${stat.hpMedi} in tutto (${stat.hpPct}% del massimo)`}</li>
        </ul>
        ${stat.morti.length ? `<p>Dove si cade più spesso:</p><ol class="ed-sim-list">${stat.morti.map(m => `<li>${esc(m.dove)}: ${m.pct}% delle partite</li>`).join('')}</ol>` : ''}
        <p class="ed-hint">Stima del simulatore che gioca come una persona attenta (profilo Esperto). Un giocatore bravo che sceglie bene abilità e oggetti vince un po' di più: per la misura completa c'è <code>node tools/difficolta.mjs ${esc(camp.id)}</code>.</p>`;
}

// Pagina nascosta con il motore del gioco: dati e script come index.html, senza avvio né interfaccia.
// Gli elementi della pagina del gioco che il codice cerca al caricamento non ci sono: si creano vuoti.
function simFrameHtml() {
    const dati = [...document.querySelectorAll('script[src^="data/"]')].map(s => s.getAttribute('src'));
    const tag = src => `<script src="${esc(src)}"><\/script>`;
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><script>
        (function () {
            var d = document, trova = d.getElementById.bind(d), uno = d.querySelector.bind(d);
            d.getElementById = function (id) {
                var el = trova(id);
                if (!el) { el = d.createElement('div'); el.id = id; (d.body || d.documentElement).appendChild(el); }
                return el;
            };
            d.querySelector = function (s) { return uno(s) || d.createElement('div'); };
            window.alert = function () {}; window.confirm = function () { return true; };
            // Niente musica né suoni: i lettori della musica (js/audio.js) ci sono, ma non suonano
            HTMLMediaElement.prototype.play = function () { return Promise.reject(new Error('muto')); };
            window.edSimErrori = [];
            window.addEventListener('error', function (e) { window.edSimErrori.push(e.message); });
        })();
    <\/script></head><body>
    <audio id="musicA" muted></audio><audio id="musicB" muted></audio>
    ${[...dati, ...SIM_SCRIPT_MOTORE].map(tag).join('\n')}
    <script>
        // Libreria e campagna dell'editor (in JSON: oggetti di questa pagina), come "Prova nel gioco" in js/game.js
        function edSimPrepara(libJson, campJson) {
            var lib = JSON.parse(libJson);
            Object.assign(LIBRERIA, lib);
            if (lib.benedizioni) { Object.keys(PRAYER_BLESSINGS).forEach(function (k) { delete PRAYER_BLESSINGS[k]; }); Object.assign(PRAYER_BLESSINGS, lib.benedizioni); }
            DEFAULT_GAME_ITEMS.splice(0, DEFAULT_GAME_ITEMS.length, ...(LIBRERIA.lootPredefinito || []).map(function (i) { return LIBRERIA.armeria[i]; }).filter(Boolean));
            var raw = JSON.parse(campJson);
            window.CAMPAIGNS_RAW = window.CAMPAIGNS_RAW || {};
            CAMPAIGNS_RAW[raw.id] = raw;
            CAMPAIGNS[raw.id] = resolveCampaign(raw, LIBRERIA);
            var data = simCampaignData(raw.id);
            var sel = data.heroes.slice(0, partyMaxSize(data.campaign)).map(function (h) { return { name: h.name, abilityIdx: 0, itemIdx: data.armory.length ? 0 : -1 }; });
            return { data: data, sel: sel, nomi: sel.map(function (s) { return s.name; }) };
        }
        function edSimUna(prep) {
            var r = simRunOne(prep.data, prep.sel, SIM_PROFILES.esperto);
            var hp = 0, hpMax = 0;
            stato.party.forEach(function (h) { hp += Math.max(0, h.hp || 0); hpMax += h.maxHp || 0; });
            return { victory: !!r.victory, deathCause: r.deathCause, hp: hp, hpMax: hpMax };
        }
    <\/script></body></html>`;
}

let simEditorRun = null;   // { frame, cancel } della stima in corso

function simStop() {
    if (!simEditorRun) return;
    simEditorRun.frame.remove();
    simEditorRun = null;
}

function difficultyEstimate() {
    if (!camp) return;
    simStop();
    if (!(camp.heroes || []).length) { edToast('Prima scegli gli eroi della campagna'); return; }
    if (!camp.procedurale && !(camp.mapNodes || []).some(n => n.active)) { edToast('La mappa non ha un punto di partenza'); return; }
    edConfirm({ title: 'Difficoltà stimata', ok: null,
        html: `<div id="edSimBox"><p>Il simulatore gioca ${SIM_PARTITE} partite della campagna così com'è…</p>
            <div class="ed-sim-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${SIM_PARTITE}"><i id="edSimBarFill"></i></div>
            <p class="ed-hint" id="edSimCount">Preparo il motore del gioco…</p></div>` });
    const frame = document.createElement('iframe');
    frame.className = 'ed-sim-frame';
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    const run = { frame };
    simEditorRun = run;
    const viva = () => simEditorRun === run && document.getElementById('edSimBox');
    const fallita = msg => {
        if (viva()) document.getElementById('edSimBox').innerHTML = `<p class="ed-sim-out">${esc(msg)}</p>`;
        simStop();
    };
    frame.addEventListener('load', () => {
        if (!viva()) { if (simEditorRun === run) simStop(); return; }
        const w = frame.contentWindow;
        let prep;
        try {
            if (typeof w.edSimPrepara !== 'function' || typeof w.simRunOne !== 'function') throw new Error((w.edSimErrori || [])[0] || 'motore del gioco non caricato');
            prep = w.edSimPrepara(JSON.stringify(lib), JSON.stringify(camp));
            if (!prep.sel.length) throw new Error('nessun eroe da mettere nella compagnia');
        } catch (e) {
            fallita(`Non riesco a simulare la campagna: ${e.message}`);
            return;
        }
        const risultati = [];
        const fill = document.getElementById('edSimBarFill');
        const count = document.getElementById('edSimCount');
        const blocco = () => {
            if (!viva()) { if (simEditorRun === run) simStop(); return; }
            const t0 = performance.now();
            try {
                while (risultati.length < SIM_PARTITE && performance.now() - t0 < SIM_BLOCCO_MS) risultati.push(w.edSimUna(prep));
            } catch (e) {
                fallita(`La simulazione si è fermata: ${e.message}`);
                return;
            }
            fill.style.width = `${risultati.length / SIM_PARTITE * 100}%`;
            fill.parentElement.setAttribute('aria-valuenow', risultati.length);
            count.textContent = `${risultati.length} partite su ${SIM_PARTITE}`;
            if (risultati.length < SIM_PARTITE) { setTimeout(blocco, 0); return; }
            document.getElementById('edSimBox').innerHTML = difficoltaHtml(difficoltaStatistiche(risultati, camp.difficolta), prep.nomi);
            simStop();
        };
        setTimeout(blocco, 0);
    });
    frame.srcdoc = simFrameHtml();
    document.body.appendChild(frame);
}
