// Prova del gioco in un browser vero (Edge o Chrome senza finestra), senza dipendenze.
// Apre index.html con un seme, spegne animazioni e audio, poi un "giocatore a caso" clicca i pulsanti visibili
// (data-action e pulsanti delle finestre) per N passi. Fallisce se la pagina lancia errori JavaScript.
// Così si controlla l'interfaccia vera, che i test in Node (DOM finto) non vedono.
// Uso: node tools/prova_browser.mjs [--passi 600] [--seme 123] [--partite 2] [--eroi "id1,id2"] [--browser <percorso>] [--mostra] [--contrasto] [--foto <cartella>]
//   --eroi: in ogni campagna solo questi eroi della libreria (per provare eroi nuovi non ancora in una campagna)
//   --mostra apre la finestra del browser (senza, gira nascosto); a fine prova uno screenshot in tools/prova_browser.png
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (nome, def) => { const i = process.argv.indexOf(`--${nome}`); return i > -1 ? process.argv[i + 1] : def; };
const PASSI = Number(arg('passi', 600));
const SEME = Number(arg('seme', 123));
const PARTITE = Number(arg('partite', 2));
const MOSTRA = process.argv.includes('--mostra');
const EROI = (arg('eroi', '') || '').split(',').map(x => x.trim()).filter(Boolean);
const EDITOR = process.argv.includes('--editor');  // prova l'editor invece del gioco
// --contrasto: misura la leggibilità del testo (tools/misura_contrasto.js) in ogni schermata e finestra vista
// e in un tooltip per schermata; elenca i problemi per elemento, non fa fallire la prova
const CONTRASTO = process.argv.includes('--contrasto');
// --foto <cartella>: uno screenshot la prima volta che si arriva in ogni schermata (per guardare l'aspetto)
const FOTO = arg('foto', '');
// --carico: quanto scarica la pagina all'avvio (prima del primo clic) e in tutta la prova, con i file più pesanti
const CARICO = process.argv.includes('--carico');
const scaricati = new Map();  // url -> byte (dalla rete del browser)
const richieste = new Map();  // requestId -> url
const perRichiesta = new Map();  // requestId -> byte
const PORTA = 19333;
const wait = ms => new Promise(r => setTimeout(r, ms));

const BROWSER = arg('browser', [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
].find(p => fs.existsSync(p)));
if (!BROWSER) { console.error('Nessun browser trovato: indica il percorso con --browser'); process.exit(2); }

// ---------- Browser e protocollo DevTools (CDP) con il WebSocket di Node ----------
const profilo = fs.mkdtempSync(path.join(os.tmpdir(), 'dignitas-prova-'));
const proc = spawn(BROWSER, [
    `--remote-debugging-port=${PORTA}`, `--user-data-dir=${profilo}`, ...(MOSTRA ? [] : ['--headless=new']),
    '--no-first-run', '--no-default-browser-check', '--autoplay-policy=no-user-gesture-required', '--mute-audio',
    '--allow-file-access-from-files', '--window-size=1600,1000', 'about:blank'
], { stdio: 'ignore' });

let ws, nextId = 1;
const attese = new Map();
const ascoltatori = [];
function cdp(method, params = {}) {
    const id = nextId++;
    ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => attese.set(id, { resolve, reject, method }));
}
async function connetti() {
    for (let i = 0; i < 50; i++) {
        try {
            const pagine = await (await fetch(`http://127.0.0.1:${PORTA}/json/list`)).json();
            const pagina = pagine.find(p => p.type === 'page');
            if (pagina) {
                ws = new WebSocket(pagina.webSocketDebuggerUrl);
                await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
                ws.onmessage = ev => {
                    const m = JSON.parse(ev.data);
                    if (m.id && attese.has(m.id)) {
                        const a = attese.get(m.id); attese.delete(m.id);
                        if (m.error) a.reject(new Error(`${a.method}: ${m.error.message}`)); else a.resolve(m.result);
                    } else if (m.method) ascoltatori.forEach(f => f(m));
                };
                return;
            }
        } catch (e) { /* il browser non è ancora pronto */ }
        await wait(200);
    }
    throw new Error('il browser non risponde sulla porta di debug');
}
async function valuta(espressione) {
    const r = await cdp('Runtime.evaluate', { expression: espressione, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
}

// ---------- Il giocatore a caso, dentro la pagina ----------
// Clicca solo pulsanti visibili e attivi; con una finestra aperta solo quelli della finestra.
// Niente menu, opzioni, salvataggi, partita online, simulatore: non fanno parte di una partita.
const BOT = `(() => {
    let s = ${SEME} >>> 0;
    const caso = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
    const VIETATE = /^(tornaAlMenu|askMainMenu|openOptions|saveGame|loadGame|openSimTester|simStartTest|vaiAPagina|scrollCampaigns|openCompendium|openHowToPlay|openJournal)$|online|remote|qr|export|import|delete|elimina|salva|carica|slot|sim/i;
    const visibile = el => {
        if (el.disabled || el.closest('.hidden')) return false;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return false;
        const st = getComputedStyle(el);
        return st.visibility !== 'hidden' && st.display !== 'none' && st.pointerEvents !== 'none';
    };
    window.__bot = {
        passo() {
            const modal = document.getElementById('wc3Modal');
            const finestra = modal && !modal.classList.contains('hidden') && getComputedStyle(modal).display !== 'none';
            const dove = finestra ? modal : document;
            const tutti = [...dove.querySelectorAll('[data-action], button')].filter(el => {
                const a = el.dataset.action || '';
                if (a && VIETATE.test(a)) return false;
                if (!a && !finestra) return false;  // fuori dalle finestre contano solo i pulsanti con un'azione
                return visibile(el);
            });
            if (!tutti.length) return { schermata: currentScreenId, cliccato: null };
            // Pochi passi indietro ("Indietro", "Cambia eroe", annulla) e preferenza per i pulsanti che fanno
            // andare avanti, così la partita procede
            const indietro = el => /^(cancel|backTo)/.test(el.dataset.action || '');
            const validi = caso() < 0.1 ? tutti : (tutti.filter(el => !indietro(el)).length ? tutti.filter(el => !indietro(el)) : tutti);
            const avanti = validi.filter(el => /btn-proceed|btn-attention|btn-primary/.test(el.className));
            const fra = avanti.length && caso() < 0.5 ? avanti : validi;
            const scelta = fra[Math.floor(caso() * fra.length)];
            const nome = scelta.dataset.action || ('finestra: ' + scelta.textContent.trim().slice(0, 30));
            scelta.click();
            return { schermata: currentScreenId, cliccato: nome };
        }
    };
})()`;

// ---------- Prova ----------
const errori = [], risorse = [];
let fallita = false;
let controllatoScontro = false;
const MISURA = CONTRASTO ? fs.readFileSync(path.join(ROOT, 'tools', 'misura_contrasto.js'), 'utf8').replace(/^\/\/.*$/gm, '').trim() : '';
const contrasto = new Map(), misurate = new Set(), fotografate = new Set();
// Una misura per schermata (e per finestra aperta), più un tooltip della schermata
async function misuraContrasto(schermata) {
    const finestra = await valuta(`(() => { const m = document.getElementById('wc3Modal'); return m && !m.classList.contains('hidden') && getComputedStyle(m).display !== 'none' ? document.getElementById('wc3ModalTitle').textContent.trim().slice(0, 30) : ''; })()`);
    const chiave = schermata + (finestra ? ' / finestra ' + finestra : '');
    if (misurate.has(chiave)) return;
    misurate.add(chiave);
    const voci = await valuta(`${MISURA}('body')`);
    const tip = await valuta(`(() => {
        const el = [...document.querySelectorAll('[data-tip]')].find(e => e.offsetParent);
        if (!el) return [];
        const r = el.getBoundingClientRect();
        el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: r.left + 2, clientY: r.top + 2 }));
        const v = (${MISURA})('#wc3Tooltip');
        document.getElementById('wc3Tooltip').classList.remove('show');
        return v;
    })()`);
    [...voci, ...tip].forEach(v => v.problemi.forEach(p => {
        const k = v.dove + ' — ' + p.replace(/[\d.]+/g, '');
        const e = contrasto.get(k) || { n: 0, esempio: v.testo, schermate: new Set(), peggiore: p };
        const val = x => parseFloat((x.match(/contrasto ([\d.]+)/) || [])[1] || 99);
        e.n++; e.schermate.add(finestra ? 'finestra' : schermata);
        if (val(p) < val(e.peggiore)) { e.peggiore = p; e.esempio = v.testo; }
        contrasto.set(k, e);
    }));
}
const nomeFile = u => decodeURIComponent(u.replace(/^.*?slay%20the%20dig\//, '').replace(/^file:\/\/\/.*\/slay the dig\//, ''));
function stampaCarico(quando) {
    const tot = [...scaricati.values()].reduce((s, b) => s + b, 0);
    const locali = [...scaricati].filter(([u]) => u.startsWith('file:'));
    console.log(`Scaricati ${quando}: ${scaricati.size} file, ${(tot / 1e6).toFixed(2)} MB (dal progetto ${locali.length} file, ${(locali.reduce((s, [, b]) => s + b, 0) / 1e6).toFixed(2)} MB)`);
    const peso = u => /\.(webp|png|jpe?g|svg|gif)$/i.test(u) ? 'immagini' : /\.(mp4|webm)$/i.test(u) ? 'video' : /\.(ogg|mp3|wav)$/i.test(u) ? 'audio' : /\.(js)$/i.test(u) ? 'codice' : /\.css|fonts/i.test(u) ? 'stile e caratteri' : 'altro';
    const perTipo = {};
    scaricati.forEach((b, u) => { const k = peso(u.split('?')[0]); perTipo[k] = (perTipo[k] || 0) + b; });
    console.log('  per tipo: ' + Object.entries(perTipo).sort((a, b) => b[1] - a[1]).map(([k, b]) => `${k} ${(b / 1e6).toFixed(2)} MB`).join(', '));
    [...scaricati].sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([u, b]) => console.log(`  ${(b / 1e3).toFixed(0).padStart(6)} kB  ${nomeFile(u)}`));
}
function stampaContrasto() {
    const voci = [...contrasto].sort((a, b) => b[1].n - a[1].n);
    console.log(`Leggibilità: ${misurate.size} viste misurate, ${voci.length} problemi`);
    voci.forEach(([k, e]) => console.log(`  • ${k.split(' — ')[0]}: ${e.peggiore} — "${e.esempio}" (${[...e.schermate].join(', ')})`));
}
const ok = (cond, msg) => { console.log(`${cond ? '  ✓' : '  ✗'} ${msg}`); if (!cond) fallita = true; };

// Controlli mirati la prima volta che si arriva in uno scontro (sulla pagina vera, non sul DOM finto dei test)
// --editor: apre editor.html, carica ogni campagna e ne fa i Controlli ("Da sistemare"), apre ogni scheda.
// Fallisce con un errore JavaScript; gli errori dei dati delle campagne si elencano (sono da sistemare nei dati)
async function provaEditor() {
    await cdp('Page.navigate', { url: pathToFileURL(path.join(ROOT, 'editor.html')).href });
    await wait(2500);
    const r = await valuta(`(() => {
        const out = { campagne: {}, schede: [], rotte: [] };
        const schede = [...new Set([...document.querySelectorAll('[data-tab]')].map(b => b.dataset.tab))];
        Object.keys(CAMPAIGNS_RAW).forEach(id => {
            setCampaign(JSON.parse(JSON.stringify(CAMPAIGNS_RAW[id])));
            campaignChosen = true;
            out.campagne[id] = validateCampaign().filter(i => i.level === 'error').map(i => i.msg.replace(/<[^>]+>/g, ''));
            schede.forEach(tab => { try { currentTab = tab; render(); } catch (e) { out.rotte.push(id + ' / ' + tab + ': ' + e.message); } });
        });
        out.schede = schede;
        return out;
    })()`);
    console.log(`Schede aperte per ogni campagna: ${r.schede.length} (${r.schede.join(', ')})`);
    for (const [id, errs] of Object.entries(r.campagne)) console.log(`  ${errs.length ? '•' : '✓'} ${id}: ${errs.length ? `${errs.length} errori nei dati, es. ${errs.slice(0, 3).join(' | ')}` : 'nessun errore nei dati'}`);
    r.rotte.forEach(x => errori.push('scheda: ' + x));
    if (!r.schede.length) errori.push('nessuna scheda trovata nell\'editor');
    if (errori.length) { fallita = true; console.log(`  ✗ ${errori.length} errori:`); [...new Set(errori)].slice(0, 20).forEach(e => console.log('    ' + e)); }
    else console.log('  ✓ nessun errore JavaScript nell\'editor');
}

async function controlliScontro() {
    // Scontro senza nemico (nodo incompleto di una campagna in lavorazione): niente controlli mirati qui
    if (!(await valuta('!!(stato.activeEnemy && stato.activeEnemy.hp > 0)'))) { controllatoScontro = false; return; }
    // Stati del nemico: icone accanto al nome con il numero di round
    const icone = await valuta(`(() => {
        const e = stato.activeEnemy; e.isStunned = true; e.poison = { val: 1, rounds: 2, name: 'Prova' };
        updateEnemyInfoUI();
        const n = document.querySelectorAll('#enemyInfo .enemy-statuses .hero-status').length;
        const testo = document.querySelector('#enemyInfo .enemy-statuses b')?.textContent;
        e.isStunned = false; delete e.poison; updateEnemyInfoUI();
        return { n, testo, dopo: document.querySelectorAll('#enemyInfo .enemy-statuses').length };
    })()`);
    ok(icone.n === 2 && icone.dopo === 0, `stati del nemico: ${icone.n} icone accanto al nome, tolte quando finiscono`);
    // Lancio della panca: nel pannello del dado il menu degli oggetti con i danni, e l'anteprima che cambia con l'oggetto
    const lancio = await valuta(`(() => {
        const h = stato.party.find(x => x.hp > 0);
        const prima = { ab: h.chosenAbility, items: h.items, cur: currentActiveHero };
        h.chosenAbility = LIBRERIA.abilita.pancrazio_lancio_panca;
        h.items = ['cristallo_flammaurea', Object.keys(LIBRERIA.armeria).find(k => itemRarity(LIBRERIA.armeria[k]) === 'leggendario')]
            .map(k => JSON.parse(JSON.stringify(LIBRERIA.armeria[k])));
        currentActiveHero = h;
        renderThrowPick('ability');
        const sel = document.getElementById('combatThrowSelect');
        const out = { visibile: !document.getElementById('combatThrowPick').classList.contains('hidden'), opzioni: sel.options.length,
            testo1: document.getElementById('diceCombatResult').textContent };
        sel.value = '1'; sel.dispatchEvent(new Event('change', { bubbles: true }));
        out.testo2 = document.getElementById('diceCombatResult').textContent; out.idx = h.throwIdx;
        renderThrowPick('attack');
        out.nascosto = document.getElementById('combatThrowPick').classList.contains('hidden');
        h.chosenAbility = prima.ab; h.items = prima.items; currentActiveHero = prima.cur; delete h.throwIdx;
        return out;
    })()`);
    ok(lancio.visibile && lancio.opzioni === 2 && lancio.idx === 1 && lancio.nascosto && /6 danni/.test(lancio.testo2) && lancio.testo1 !== lancio.testo2,
        `Lancio della panca: menu con ${lancio.opzioni} oggetti, anteprima "${lancio.testo2}"`);
    // Pozione di Cassio da dare a un eroe: finestra con gli eroi in piedi, poi dado alchemico nel diario
    const pozione = await valuta(`(() => {
        const vivi = stato.party.filter(x => x.hp > 0);
        const h = vivi[0], dest = vivi[vivi.length - 1];
        h.chosenAbility = JSON.parse(JSON.stringify(LIBRERIA.abilita.cassio_tintura_corteccia)); h.abilityUsedThisCombat = false;
        currentActiveHero = h;
        const armaturaPrima = dest.current_armor || 0;
        chooseAbilityTarget();
        const bottoni = [...document.querySelectorAll('#wc3Modal button')];
        const scelta = bottoni.find(b => b.textContent.startsWith(dest.name));
        scelta && scelta.click();
        const diario = document.getElementById('combatLog')?.textContent || document.body.textContent;
        const riga = (diario.match(/Dado alchemico: [0-9] [A-Za-z!]+/) || [''])[0];
        return { bottoni: bottoni.length, vivi: vivi.length, diff: (dest.current_armor || 0) - armaturaPrima, dado: !!riga, riga };
    })()`);
    ok(pozione.bottoni === pozione.vivi + 1 && pozione.dado && pozione.diff >= 0,
        `Tintura di Corteccia: finestra con ${pozione.bottoni - 1} eroi, "${pozione.riga}", armatura +${pozione.diff}`);
    // Avanti automatico: il turno del nemico stordito passa da solo agli eroi
    await valuta(`(() => { stato.activeEnemy.isStunned = true; stato.party.forEach(h => { h.hasActed = true; }); showHeroSelectionPhase(); return true; })()`);
    await wait(2500);
    const avanti = await valuta(`({ fase: combatPhase, scelta: !document.getElementById('heroChoiceArea').classList.contains('hidden') })`);
    ok(avanti.fase === 'heroes' && avanti.scelta, `nemico stordito: si torna da soli alla scelta dell'eroe (fase ${avanti.fase})`);
    // Pulsante "Menu" della barra: chiede conferma (dentro uno scontro niente salvataggio), "Resta qui" non cambia niente
    const menu = await valuta(`(() => {
        document.querySelector('#partyTopBar [data-action="askMainMenu"]').click();
        const titolo = document.getElementById('wc3ModalTitle').textContent;
        const pulsanti = [...document.querySelectorAll('#wc3ModalActions button')].map(b => b.textContent);
        [...document.querySelectorAll('#wc3ModalActions button')].find(b => b.textContent === 'Resta qui').click();
        return { titolo, pulsanti, schermata: currentScreenId };
    })()`);
    ok(/menu principale/.test(menu.titolo) && menu.pulsanti.join() === 'Torna al menu,Resta qui' && menu.schermata === 'screenCombat',
        `Menu dallo scontro: "${menu.titolo}" con ${menu.pulsanti.join(' / ')}, si resta su ${menu.schermata}`);
    // Nemico ucciso dal veleno a inizio round: vittoria e pulsante del bottino
    const veleno = await valuta(`(() => {
        const e = stato.activeEnemy; e.hp = 1; e.poison = { val: 1, rounds: 3, name: 'Prova' };
        startHeroesTurnCycle();
        return { hp: e.hp, bottino: !document.getElementById('combatLootBtn').classList.contains('hidden'),
            comandi: !document.getElementById('heroChoiceArea').classList.contains('hidden') };
    })()`);
    ok(veleno.hp === 0 && veleno.bottino && !veleno.comandi, 'nemico ucciso dal veleno a inizio round: vittoria, si passa al bottino');
    // Veleno che nello stesso inizio di round uccide il nemico e tutta la compagnia: è una sconfitta.
    // (Chiude la partita: è l'ultimo controllo, il giocatore a caso riparte con quella dopo)
    const tutti = await valuta(`(() => {
        const e = stato.activeEnemy; e.hp = 1; e.poison = { val: 1, rounds: 3, name: 'Prova' };
        stato.party.forEach(h => { if (h.hp > 0) h.poison = { val: 99, rounds: 1 }; });
        startHeroesTurnCycle();
        return currentScreenId;
    })()`);
    ok(tutti === 'screenDefeat', `veleno che uccide nemico e compagnia insieme: sconfitta (${tutti})`);
}
try {
    await connetti();
    ascoltatori.push(m => {
        if (m.method === 'Runtime.exceptionThrown') {
            const d = m.params.exceptionDetails;
            errori.push(`${d.exception?.description || d.text} (${d.url || ''}:${d.lineNumber})`);
        }
        if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
            errori.push('console.error: ' + m.params.args.map(a => a.value ?? a.description ?? '').join(' '));
        }
        if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
            const e = m.params.entry;
            // Immagini o suoni mancanti: il gioco ha i segnaposto, si segnalano a parte
            if (e.source === 'network') risorse.push(e.url || e.text); else errori.push(`${e.source}: ${e.text}`);
        }
    });
    await cdp('Runtime.enable'); await cdp('Log.enable'); await cdp('Page.enable');
    if (CARICO) {
        // Senza cache: ogni partita conta come una prima apertura (come un telefono che apre la pagina online)
        await cdp('Network.enable'); await cdp('Network.setCacheDisabled', { cacheDisabled: true });
        ascoltatori.push(m => {
            if (m.method === 'Network.requestWillBeSent') richieste.set(m.params.requestId, m.params.request.url);
            // Byte per richiesta (dataReceived a pezzi, loadingFinished alla fine); per file conta la richiesta più grande,
            // così un brano rimesso da capo o un video in ciclo non si somma più volte
            const id = m.params && m.params.requestId, u = id && richieste.get(id);
            if (!u || u.startsWith('data:')) return;
            if (m.method === 'Network.dataReceived') perRichiesta.set(id, (perRichiesta.get(id) || 0) + (m.params.dataLength || 0));
            if (m.method === 'Network.loadingFinished') perRichiesta.set(id, Math.max(perRichiesta.get(id) || 0, m.params.encodedDataLength || 0));
            if (/dataReceived|loadingFinished/.test(m.method)) scaricati.set(u, Math.max(scaricati.get(u) || 0, perRichiesta.get(id)));
        });
    }

    if (EDITOR) await provaEditor();
    else {
    const url = pathToFileURL(path.join(ROOT, 'index.html')).href + `?seme=${SEME}`;
    await cdp('Page.navigate', { url });
    await wait(1500);
    // Animazioni spente, testo subito, niente audio: la prova va veloce e non dipende dai tempi
    await valuta(`localStorage.setItem('dignitas_options', JSON.stringify({ animations: false, fastAnimations: true, textSpeed: 0, musicVolume: 0, sfxVolume: 0, floatingNumbers: false })); true`);

    const schermate = new Map();
    let partite = 0, passi = 0, fermo = 0;
    for (let p = 0; p < PARTITE; p++) {
        await cdp('Page.navigate', { url });
        await wait(1500);
        // Solo gli eroi indicati in ogni campagna (le procedurali li prendono da CAMPAIGNS_RAW a ogni partita)
        if (EROI.length) await valuta(`(() => {
            const eroi = ${JSON.stringify(EROI)};
            Object.keys(CAMPAIGNS_RAW).forEach(id => {
                CAMPAIGNS_RAW[id].heroes = eroi.slice();
                const risolta = resolveCampaign(CAMPAIGNS_RAW[id]);
                if (CAMPAIGNS[id].procedurale) { CAMPAIGNS[id].heroes = risolta.heroes; CAMPAIGNS[id].abilities = risolta.abilities; }
                else CAMPAIGNS[id] = risolta;
            });
            return true;
        })()`);
        await valuta(BOT);
        if (CARICO && p === 0) { await wait(2500); stampaCarico('all\'avvio, prima del primo clic'); }
        let finita = false;
        for (let i = 0; i < PASSI && !finita; i++) {
            const r = await valuta('__bot.passo()');
            passi++;
            schermate.set(r.schermata, (schermate.get(r.schermata) || 0) + 1);
            if (!r.cliccato) { if (++fermo > 40) { errori.push(`bloccato su ${r.schermata}: nessun pulsante da cliccare`); break; } }
            else fermo = 0;
            if (['screenVictory', 'screenDefeat'].includes(r.schermata)) finita = true;
            if (CONTRASTO) await misuraContrasto(r.schermata);
            // Turno del nemico, scelta di chi affronta la prova e di chi prega hanno una foto loro
            const parte = FOTO ? await valuta(`(() => {
                const vede = id => { const el = document.getElementById(id); return !!el && !el.closest('.hidden'); };
                return vede('monsterTurnSection') ? '_nemico' : vede('challengeStage2') ? '_eroe' : vede('prayerStage2') ? '_preghiera' : '';
            })()`) : '';
            const vista = r.schermata + parte;
            if (FOTO && !fotografate.has(vista)) {
                fotografate.add(vista);
                await wait(600);
                fs.mkdirSync(FOTO, { recursive: true });
                const foto = await cdp('Page.captureScreenshot', { format: 'png' });
                fs.writeFileSync(path.join(FOTO, `${vista}.png`), Buffer.from(foto.data, 'base64'));
            }
            if (r.schermata === 'screenCombat' && !controllatoScontro) { controllatoScontro = true; await controlliScontro(); }
            await wait(r.cliccato ? 120 : 400);
        }
        partite++;
        if (errori.length) break;
    }

    const shot = await cdp('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ROOT, 'tools', 'prova_browser.png'), Buffer.from(shot.data, 'base64'));

    console.log(`Partite: ${partite}, passi: ${passi}, seme ${SEME}`);
    console.log('Schermate viste: ' + [...schermate].map(([k, v]) => `${k} (${v})`).join(', '));
    const tocca = ['screenMap', 'screenCombat'];
    tocca.filter(s => !schermate.has(s)).forEach(s => { console.log(`  ✗ mai arrivato a ${s}`); fallita = true; });
    if (CONTRASTO) stampaContrasto();
    if (CARICO) stampaCarico('in tutta la prova');
    if (risorse.length) console.log(`Risorse non caricate (${new Set(risorse).size}): ${[...new Set(risorse)].slice(0, 8).join(', ')}`);
    if (errori.length) { fallita = true; console.log(`  ✗ ${errori.length} errori:`); [...new Set(errori)].slice(0, 20).forEach(e => console.log('    ' + e)); }
    else console.log('  ✓ nessun errore JavaScript');
    }
} catch (e) {
    fallita = true;
    console.error('  ✗ ' + e.message);
} finally {
    try { ws && ws.close(); } catch (e) {}
    proc.kill();
    await wait(500);
    try { fs.rmSync(profilo, { recursive: true, force: true }); } catch (e) {}
}
process.exit(fallita ? 1 : 0);
