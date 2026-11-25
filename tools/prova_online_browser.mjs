// Prova della partita online in un browser vero (Edge o Chrome senza finestra), senza dipendenze.
// Avvia server/server.js su una porta di prova, apre il master (index.html dal server) e la stanza, poi un giocatore
// entra dal link come farebbe da un telefono: controlla il velo d'attesa, il pannello "Scegli il tuo eroe", la scelta,
// e poi gioca a caso dalle due pagine (il giocatore con i clic inoltrati). Fallisce con errori JavaScript in una delle
// due pagine, se il giocatore non riceve lo specchio del master o non sente gli effetti sonori.
// Uso: node tools/prova_online_browser.mjs [--passi 400] [--seme 7] [--campagna fredlos_parte_3] [--mostra] [--foto <cartella>]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (nome, def) => { const i = process.argv.indexOf(`--${nome}`); return i > -1 ? process.argv[i + 1] : def; };
const PASSI = Number(arg('passi', 400));
const SEME = Number(arg('seme', 7));
const CAMPAGNA = arg('campagna', 'fredlos_parte_3');
const MOSTRA = process.argv.includes('--mostra');
const FOTO = arg('foto', '');
const DIARIO = process.argv.includes('--diario');
const TELEFONO = process.argv.includes('--telefono');  // la pagina del giocatore con lo schermo e il tocco di un telefono (390×844)  // ogni clic del bot, per capire dove si ferma
const PORTA = 18791, DEBUG = 19334;
const wait = ms => new Promise(r => setTimeout(r, ms));
let fallite = 0;
const ok = (cond, msg) => { console.log(`${cond ? '  ✓' : '  ✗'} ${msg}`); if (!cond) fallite++; };

const BROWSER = arg('browser', [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
].find(p => fs.existsSync(p)));
if (!BROWSER) { console.error('Nessun browser trovato: indica il percorso con --browser'); process.exit(2); }

const server = spawn(process.execPath, [path.join(ROOT, 'server', 'server.js')],
    { env: { ...process.env, PORT: String(PORTA), SSE_PING_MS: '1000', ONLINE_DISCONNECT_MS: '4000' }, stdio: 'ignore' });
const profilo = fs.mkdtempSync(path.join(os.tmpdir(), 'dignitas-online-'));
const proc = spawn(BROWSER, [`--remote-debugging-port=${DEBUG}`, `--user-data-dir=${profilo}`, ...(MOSTRA ? [] : ['--headless=new']),
    '--no-first-run', '--no-default-browser-check', '--autoplay-policy=no-user-gesture-required', '--mute-audio',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows',
    '--window-size=1500,950', 'about:blank'], { stdio: 'ignore' });

// Una pagina = un WebSocket CDP. Errori JavaScript e console.error finiscono in pagina.errori
async function pagina(nome, ws) {
    const p = { nome, errori: [], attese: new Map(), id: 1 };
    p.ws = new WebSocket(ws);
    await new Promise((res, rej) => { p.ws.onopen = res; p.ws.onerror = rej; });
    p.ws.onmessage = ev => {
        const m = JSON.parse(ev.data);
        if (m.id && p.attese.has(m.id)) { const a = p.attese.get(m.id); p.attese.delete(m.id); m.error ? a.rej(new Error(m.error.message)) : a.res(m.result); return; }
        if (m.method === 'Runtime.exceptionThrown') p.errori.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
        if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') p.errori.push('console.error: ' + m.params.args.map(a => a.value ?? a.description).join(' '));
    };
    p.cdp = (method, params = {}) => { const id = p.id++; p.ws.send(JSON.stringify({ id, method, params })); return new Promise((res, rej) => p.attese.set(id, { res, rej })); };
    p.valuta = async espr => {
        const r = await p.cdp('Runtime.evaluate', { expression: espr, returnByValue: true, awaitPromise: true });
        if (r.exceptionDetails) throw new Error(`${nome}: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
        return r.result.value;
    };
    p.foto = async file => { if (!FOTO) return; fs.mkdirSync(FOTO, { recursive: true }); const f = await p.cdp('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(FOTO, file), Buffer.from(f.data, 'base64')); };
    await p.cdp('Runtime.enable'); await p.cdp('Page.enable');
    return p;
}
async function nuovaPagina(nome, url) {
    for (let i = 0; i < 50; i++) {
        try {
            const r = await fetch(`http://127.0.0.1:${DEBUG}/json/new?${encodeURI(url)}`, { method: 'PUT' });
            if (r.ok) { const t = await r.json(); return pagina(nome, t.webSocketDebuggerUrl); }
        } catch (e) { /* il browser parte */ }
        await wait(200);
    }
    throw new Error('il browser non risponde');
}
async function aspetta(p, espr, ms = 8000) {
    for (let t = 0; t < ms; t += 200) { if (await p.valuta(espr).catch(() => false)) return true; await wait(200); }
    return false;
}

// Clic a caso fra i pulsanti visibili (come tools/prova_browser.mjs). Sulla pagina del giocatore solo dentro le regioni
// specchiate: il clic passa dall'inoltro (inoltra in server/public/online.js), non dalla barra
const BOT = (seme, giocatore) => `(() => {
    let s = ${seme} >>> 0;
    const caso = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
    const VIETATE = /^(tornaAlMenu|askMainMenu|openOptions|saveGame|loadGame|openSimTester|simStartTest|vaiAPagina|scrollCampaigns|openCompendium|openHowToPlay|openJournal|onlineChiudi|onlineApri|azzeraPartita|onlineMusica|onlineEffetti|toggleHeroCard|useConsumableFromTopbar)$|^gm|remote|qr|export|import|delete|elimina|salva|carica|slot|sim/i;
    const visibile = el => {
        if (el.disabled || el.closest('.hidden') || el.closest('.online-hidden')) return false;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return false;
        const st = getComputedStyle(el);
        return st.visibility !== 'hidden' && st.display !== 'none' && st.pointerEvents !== 'none';
    };
    window.__bot = () => {
        const modal = document.getElementById('wc3Modal');
        const finestra = modal && !modal.classList.contains('hidden') && getComputedStyle(modal).display !== 'none';
        const dove = finestra ? modal : document;
        let tutti = [...dove.querySelectorAll('[data-action], button')].filter(el => {
            const a = el.dataset.action || '';
            if (a && VIETATE.test(a)) return false;
            if (${giocatore} && el.closest('#onlineBar, #onlineModPanel, #onlineJoin')) return false;
            if (!a && !finestra && !el.dataset.modalBtn) return false;
            return visibile(el);
        });
        if (!tutti.length) return null;
        const indietro = el => /^(cancel|backTo|challengeBack|prayerBack)/.test(el.dataset.action || '');
        const avanti = tutti.filter(el => !indietro(el));
        if (avanti.length && caso() > 0.1) tutti = avanti;
        const forti = tutti.filter(el => /btn-proceed|btn-attention|btn-primary/.test(el.className));
        const fra = forti.length && caso() < 0.5 ? forti : tutti;
        const el = fra[Math.floor(caso() * fra.length)];
        el.click();
        return el.dataset.action || el.textContent.trim().slice(0, 24);
    };
})()`;

try {
    await wait(900);
    // ---------- Master ----------
    const master = await nuovaPagina('master', `http://localhost:${PORTA}/index.html?seme=${SEME}`);
    await aspetta(master, `typeof onlineApri === 'function' && document.readyState === 'complete'`);
    await master.valuta(`localStorage.setItem('dignitas_options', JSON.stringify({ animations: false, fastAnimations: true, textSpeed: 0, musicVolume: 0.3, sfxVolume: 0.8, floatingNumbers: false })); true`);
    await master.cdp('Page.reload'); await wait(1500);
    await aspetta(master, `typeof onlineApri === 'function' && document.readyState === 'complete'`);
    await master.valuta('onlineApri(); true');
    ok(await aspetta(master, 'onlineState.attivo && !!onlineState.code'), 'il master apre la stanza');
    const code = await master.valuta('onlineState.code');

    // ---------- Giocatore che entra dal link ----------
    const gioc = await nuovaPagina('giocatore', 'about:blank');
    if (TELEFONO) {
        await gioc.cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
        await gioc.cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    }
    await gioc.cdp('Page.navigate', { url: `http://127.0.0.1:${PORTA}/online/${code}` });
    ok(await aspetta(gioc, `/Spettatore/.test(document.getElementById('onlineBar').textContent)`, 10000), 'il giocatore entra senza scrivere niente (Spettatore)');
    ok(await aspetta(gioc, `!document.getElementById('onlineAttesa').classList.contains('online-hidden')`), 'spettatore: velo "Il master sta preparando il capitolo…"');
    ok(await aspetta(master, 'onlineState.giocatori.some(g => g.connected)'), 'il master vede il giocatore collegato');
    await gioc.foto('1_attesa.png');
    // Strumenti sulla pagina del giocatore: quanti effetti sonori parte davvero
    await gioc.valuta(`(() => { window.__au = { file: 0, synth: 0, ko: [] };
        const op = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function () { const el = this; const pr = op.call(el);
            if (el.id !== 'onlineMusica') pr.then(() => __au.file++, e => __au.ko.push((el.src || '').split('/').pop() + ' ' + e.name)); return pr; };
        const os = window.suonoSintetico; window.suonoSintetico = function () { __au.synth++; return os.apply(this, arguments); };
        return true; })()`);

    // ---------- Il master sceglie il capitolo: compare "Scegli il tuo eroe" ----------
    await master.valuta(`selectCampaign(${JSON.stringify(CAMPAGNA)}); true`);
    await wait(800);
    // Dall'introduzione del capitolo alla creazione (pulsante che porta avanti), come farebbe il master
    for (let i = 0; i < 6 && await master.valuta(`currentScreenId !== 'screenParty'`); i++) {
        await master.valuta(`(() => { const b = [...document.querySelectorAll('#gameContainer > div:not(.hidden) [data-action]')].find(b => !b.disabled && b.offsetParent && !/tornaAlMenu|askMainMenu|backTo/.test(b.dataset.action)); if (b) b.click(); return true; })()`);
        await wait(600);
    }
    ok(await master.valuta(`currentScreenId === 'screenParty'`), 'il master arriva alla creazione della compagnia');
    ok(await aspetta(gioc, `!document.getElementById('onlineScelta').classList.contains('online-hidden') && document.querySelectorAll('#onlineScelta button[data-eroe]:not([disabled])').length > 0`),
        'il giocatore vede il pannello "Scegli il tuo eroe" con eroi liberi');
    ok(await gioc.valuta(`document.getElementById('onlineAttesa').classList.contains('online-hidden')`), 'il velo d\'attesa sparisce');
    await gioc.foto('2_scelta.png');
    // La finestra del master con i link (onlineMostraLink) è privata: la chiave del master a distanza non arriva ai giocatori
    ok(await gioc.valuta(`!document.body.innerHTML.includes('master=') && !document.getElementById('onlineLinkMasterBox')`), 'il giocatore non vede il link (e la chiave) del master a distanza');
    // Tocco vero (come il dito su un telefono): sblocca l'audio della pagina, come succede davvero
    const pos = await gioc.valuta(`(() => { const r = document.querySelector('#onlineScelta button[data-eroe]:not([disabled])').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
    for (const type of ['mousePressed', 'mouseReleased']) await gioc.cdp('Input.dispatchMouseEvent', { type, x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
    await wait(600);
    await aspetta(master, 'onlineState.giocatori.some(g => g.name)');
    const eroe = await master.valuta('(onlineState.giocatori.find(g => g.name) || {}).name || null');
    ok(!!eroe, `il giocatore sceglie un eroe col tocco (${eroe})`);
    ok(await aspetta(gioc, `document.getElementById('onlineScelta').classList.contains('online-hidden')`), 'il pannello di scelta si chiude');
    ok(await aspetta(master, `onlineState.creando === ${JSON.stringify(eroe)}`), 'parte la creazione del suo eroe');
    await gioc.foto('3_creazione.png');

    // ---------- Gioco a caso dalle due pagine ----------
    await master.valuta(BOT(SEME, false)); await gioc.valuta(BOT(SEME + 1, true));
    const schermate = new Map();
    let ultima = '', fermo = 0, vistaGioc = 0, diverse = 0;
    for (let i = 0; i < PASSI; i++) {
        const scr = await master.valuta('currentScreenId');
        schermate.set(scr, (schermate.get(scr) || 0) + 1);
        if (['screenVictory', 'screenDefeat'].includes(scr)) break;
        // Tocca al giocatore: il suo eroe in creazione, il suo turno, o le schermate dove ognuno fa per sé
        const suo = await master.valuta(`(() => { const e = ${JSON.stringify(eroe)};
            const h = x => x && (x.name || x) === e;
            return onlineState.creando === e || h(currentActiveHero) || h(selectedChallengeHero) || h(typeof selectedPrayerHero !== 'undefined' && selectedPrayerHero)
                || onlineAttesi().includes(e); })()`);
        const chi = suo && i % 4 !== 3 ? gioc : master;
        const r = await chi.valuta('__bot()');
        if (DIARIO) console.log(`    ${i} ${scr} ${chi.nome}: ${r}`);
        if (DIARIO && !r && chi === master) console.log('      ' + await master.valuta(`JSON.stringify({ voto: onlineState.voto && { tipo: onlineState.voto.tipo, dm: onlineState.voto.decideMaster }, attesi: onlineAttesi(), attivo: currentActiveHero && currentActiveHero.name, modal: !document.getElementById('wc3Modal').classList.contains('hidden'), bar: (document.getElementById('onlineMasterBar') || {}).innerHTML, btn: [...document.querySelectorAll('#gameContainer > div:not(.hidden) [data-action]')].filter(b => b.offsetParent).map(b => b.dataset.action + (b.disabled ? '(off)' : '')).slice(0, 12) })`));
        if (!r) { if (++fermo > 40) { ok(false, `bloccato su ${scr}`); break; } } else fermo = 0;
        if (FOTO && scr !== ultima) { ultima = scr; await wait(400); await gioc.foto(`g_${scr}.png`); }
        // Lo specchio arriva: la schermata del giocatore è la stessa del master
        if (i % 10 === 0) {
            await wait(300);
            const gid = await gioc.valuta(`(document.querySelector('#gameContainer > div') || {}).id || ''`);
            vistaGioc++; if (gid !== scr) diverse++;
        }
        await wait(r ? 150 : 400);
    }
    await wait(800);
    console.log('  Schermate del master: ' + [...schermate].map(([k, v]) => `${k} (${v})`).join(', '));
    ok(diverse <= Math.ceil(vistaGioc * 0.2), `il giocatore vede la schermata del master (${vistaGioc - diverse}/${vistaGioc} controlli uguali)`);
    const au = await gioc.valuta('window.__au');
    const inviati = await master.valuta('onlineSuoniN');
    console.log(`  Effetti: il master ne ha mandati ${inviati}; il giocatore ha suonato ${au.file} file e ${au.synth} suoni generati${au.ko.length ? ', rifiutati: ' + [...new Set(au.ko)].slice(0, 4).join(', ') : ''}`);
    ok(inviati === 0 || au.file + au.synth > 0, 'il giocatore sente gli effetti sonori del master');
    ok(!au.ko.length, 'nessun effetto rifiutato dal browser del giocatore');

    // ---------- Reazioni: dal pannello del giocatore al fumetto sullo schermo del master ----------
    await gioc.valuta(`document.getElementById('onlineReazioniApri').click(); true`);
    await wait(200);
    await gioc.valuta(`document.querySelector('#onlineReazioniVoci button[data-reazione="famiglia"]').click(); true`);
    ok(await aspetta(master, `[...document.querySelectorAll('#onlineReazioniStrato .online-reazione')].some(f => f.textContent.includes(${JSON.stringify(eroe)}) && f.textContent.includes('Per la Famiglia!'))`, 4000),
        'la reazione del giocatore compare sullo schermo del master col nome del suo eroe');
    ok(await master.valuta(`getComputedStyle(document.getElementById('onlineReazioniStrato')).pointerEvents === 'none'`), 'il fumetto non ruba i clic');
    await gioc.foto('4_reazione.png');

    // ---------- Riconnessione del master: chiude la pagina, i giocatori aspettano, riapre e riprende ----------
    const salvataIn = await master.valuta(`(onlineMemoria() || {}).salvataggio || null`);
    const erroriPrima = [...master.errori];
    await master.cdp('Page.close').catch(() => {});  // la finestra del master si chiude (browser chiuso, pagina persa)
    ok(await aspetta(gioc, `/Il master si è disconnesso, attendere/.test(document.getElementById('onlineAvviso').textContent) && !document.getElementById('onlineAvviso').classList.contains('online-hidden')`, 6000),
        'master andato via: il giocatore vede "Il master si è disconnesso, attendere…"');
    await gioc.foto('5_attesa_master.png');
    const master2 = await nuovaPagina('master riaperto', `http://localhost:${PORTA}/index.html?seme=${SEME}`);
    master2.errori.push(...erroriPrima);
    ok(await aspetta(master2, `document.getElementById('wc3ModalTitle').textContent === 'Partita online in corso' && !document.getElementById('wc3Modal').classList.contains('hidden')`, 10000),
        'il master che riapre il gioco trova l\'offerta di riprendere la stanza');
    await master2.foto('6_offerta.png');
    await master2.valuta(`document.querySelector('#wc3ModalActions [data-modal-btn="0"]').click(); true`);
    ok(await aspetta(master2, `onlineState.attivo && onlineState.code === ${JSON.stringify(code)}`), 'stessa stanza, stesso codice');
    ok(await aspetta(master2, `onlineState.giocatori.some(g => g.name === ${JSON.stringify(eroe)} && g.connected)`), 'il giocatore è ancora collegato col suo eroe');
    if (salvataIn === code) {
        ok(await aspetta(master2, `currentScreenId === 'screenMap' && stato.party.some(h => h.name === ${JSON.stringify(eroe)}) && stato.onlineOwners[${JSON.stringify(eroe)}] === ${JSON.stringify(eroe)}`),
            'la partita riparte dall\'ultima mappa con gli stessi eroi');
        ok(await aspetta(gioc, `(document.querySelector('#gameContainer > div') || {}).id === 'screenMap'`), 'il giocatore vede di nuovo la mappa del master');
    } else console.log('  (nessun ritorno sulla mappa durante la prova: niente partita da riprendere)');
    ok(await aspetta(gioc, `document.getElementById('onlineAvviso').classList.contains('online-hidden') || !/disconnesso/.test(document.getElementById('onlineAvviso').textContent)`), 'l\'avviso del giocatore sparisce');
    for (const p of [master2, gioc]) {
        const e = [...new Set(p.errori)];
        ok(!e.length, `${p.nome}: nessun errore JavaScript${e.length ? ':\n      ' + e.slice(0, 8).join('\n      ') : ''}`);
    }
} catch (e) {
    fallite++;
    console.error('  ✗ ' + e.message);
} finally {
    proc.kill(); server.kill();
    await wait(500);
    try { fs.rmSync(profilo, { recursive: true, force: true }); } catch (e) {}
}
console.log(fallite ? `\n${fallite} prove fallite` : '\nTutte le prove passate');
process.exit(fallite ? 1 : 0);
