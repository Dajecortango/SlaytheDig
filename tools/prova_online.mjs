// Prova del server della partita online: avvia server/server.js su una porta di prova e simula
// un master (Host locale) e due giocatori. Uso: node tools/prova_online.mjs
import { spawn } from 'node:child_process';
import http from 'node:http';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 18788;
let fallite = 0;
const ok = (cond, msg) => { console.log(`${cond ? '  ✓' : '  ✗'} ${msg}`); if (!cond) fallite++; };
const wait = ms => new Promise(r => setTimeout(r, ms));

let segreto = null;  // dato da /api/online/apri: il master lo manda in ogni chiamata
function req(method, p, body, host = `localhost:${PORT}`, conSegreto = true) {
    return new Promise((resolve, reject) => {
        const headers = { 'Content-Type': 'application/json', Host: host, ...(segreto && conSegreto ? { 'X-Online-Segreto': segreto } : {}) };
        const r = http.request({ host: '127.0.0.1', port: PORT, path: p, method, headers }, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => { try { resolve({ status: res.statusCode, body: JSON.parse(d || '{}') }); } catch { resolve({ status: res.statusCode, body: d }); } });
        });
        r.on('error', reject); if (body) r.write(JSON.stringify(body)); r.end();
    });
}

// Stream SSE (gzip se offerto): raccoglie gli eventi in un array
function flusso(p, host, gzip) {
    const eventi = [];
    const r = http.get({ host: '127.0.0.1', port: PORT, path: p, headers: { Host: host, 'Accept-Encoding': gzip ? 'gzip' : 'identity' } }, res => {
        const src = res.headers['content-encoding'] === 'gzip' ? res.pipe(zlib.createGunzip()) : res;
        eventi.gzip = res.headers['content-encoding'] === 'gzip';
        let buf = '';
        src.on('data', c => { buf += c; let i; while ((i = buf.indexOf('\n\n')) >= 0) { const b = buf.slice(0, i); buf = buf.slice(i + 2);
            const ev = (b.match(/^event: (.*)$/m) || [])[1]; const data = (b.match(/^data: (.*)$/m) || [])[1];
            if (ev) eventi.push([ev, data ? JSON.parse(data) : null]); } });
    });
    eventi.chiudi = () => r.destroy();
    return eventi;
}

const server = spawn(process.execPath, [path.join(ROOT, 'server', 'server.js')], { env: { ...process.env, PORT: String(PORT), SSE_PING_MS: '500', ONLINE_DISCONNECT_MS: '1500' }, stdio: 'ignore' });
try {
    await wait(800);
    const fuori = `abc.ngrok-free.app`;
    ok((await req('POST', '/api/online/apri', {}, fuori)).status === 403, 'un ospite non può aprire la stanza');
    const aperta = (await req('POST', '/api/online/apri', {})).body;
    const code = aperta.code;
    segreto = aperta.segreto;
    ok(typeof segreto === 'string' && segreto.length >= 16, 'la stanza dà al master un segreto');
    ok((await req('POST', '/api/online/parti', { parti: {} }, `localhost:${PORT}`, false)).status === 403, 'senza segreto niente regioni (anche da localhost)');
    ok(typeof code === 'string' && code.length >= 6, 'il master apre la stanza');
    const master = flusso(`/api/online/master?segreto=${segreto}`, `localhost:${PORT}`, false);
    const intruso = flusso('/api/online/master', `localhost:${PORT}`, false);
    ok((await req('POST', '/api/online/entra', { code: 'sbagliato', nome: 'Marco' }, fuori)).body.error, 'codice sbagliato rifiutato');
    const marco = (await req('POST', '/api/online/entra', { code, nome: '  Marco  ' }, fuori)).body;
    ok(marco.token && marco.nome === 'Marco', 'Marco entra (nome pulito)');
    ok((await req('POST', '/api/online/entra', { code, nome: 'marco' }, fuori)).body.error, 'nome già usato (maiuscole a parte) rifiutato');
    ok((await req('POST', '/api/online/entra', { code, nome: '' }, fuori)).body.error, 'nome vuoto rifiutato');
    ok((await req('POST', '/api/online/entra', { code, nome: '__master__' }, fuori)).body.error, 'il nome del master è riservato');
    const sara = (await req('POST', '/api/online/entra', { code, nome: 'Sara'.repeat(20) }, fuori)).body;
    ok(sara.nome.length <= 24, 'nome lunghissimo accorciato');
    await req('POST', '/api/online/parti', { parti: { screen: '<div id="screenMap">mappa</div>' } });
    const fm = flusso(`/api/online/flusso?code=${code}&token=${marco.token}&z=1`, fuori, true);
    await wait(300);
    // ngrok trattiene le risposte con Content-Encoding gzip: lo stream va in chiaro, compresso è il contenuto degli eventi
    ok(!fm.gzip, 'stream dei giocatori in chiaro anche se il browser accetta gzip');
    const parti = fm.find(([e]) => e === 'parti');
    const decomp = parti && parti[1].z ? JSON.parse(zlib.inflateRawSync(Buffer.from(parti[1].z, 'base64')).toString('utf8')) : null;
    ok(decomp && decomp.screen && decomp.screen.includes('mappa'), "chi entra riceve subito tutte le regioni (compresse nell'evento)");
    const fs0 = flusso(`/api/online/flusso?code=${code}&token=${sara.token}`, fuori, false);
    await wait(300);
    ok(fs0.some(([e, d]) => e === 'parti' && d.screen && d.screen.includes('mappa')), 'senza z=1 le regioni arrivano in chiaro');
    fs0.chiudi();
    ok(fm.some(([e, d]) => e === 'master' && d.online), 'il giocatore sa che il master è collegato');
    await req('POST', '/api/online/clic', { code, token: marco.token, azione: 'selectStsNode', tipo: 'click', regione: 'screen', percorso: [0, 2], args: [3], valori: {} }, fuori);
    await wait(200);
    ok(master.some(([e, d]) => e === 'clic' && d.giocatore === 'Marco' && d.azione === 'selectStsNode'), 'il clic arriva al master con il nome del giocatore');
    ok((await req('POST', '/api/online/clic', { code, token: 'falso', azione: 'x' }, fuori)).status === 403, 'token falso rifiutato');
    ok((await req('POST', '/api/online/parti', { parti: {} }, fuori)).status === 403, 'un ospite non può mandare regioni');
    await req('POST', '/api/online/avviso', { giocatore: 'Marco', testo: 'Non è il tuo turno' });
    await wait(200);
    ok(fm.some(([e, d]) => e === 'avviso' && d.testo === 'Non è il tuo turno'), 'avviso al singolo giocatore');
    ok(master.some(([e, d]) => e === 'stanza' && d.giocatori.some(gi => gi.name === 'Marco' && gi.connected)), 'il master vede Marco collegato');
    fm.chiudi();
    await wait(2200);
    ok(master.some(([e, d]) => e === 'stanza' && d.giocatori.some(gi => gi.name === 'Marco' && !gi.connected)), 'Marco disconnesso dopo il tempo massimo');
    const rientro = (await req('POST', '/api/online/entra', { code, nome: 'Marco', token: marco.token }, fuori)).body;
    ok(rientro.token === marco.token, 'Marco rientra con lo stesso token');
    const pagina = await new Promise(r => http.get({ host: '127.0.0.1', port: PORT, path: `/online/${code}`, headers: { Host: fuori } }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => r({ status: res.statusCode, d })); }));
    ok(pagina.status === 200 && pagina.d.includes('online-client.js'), 'la pagina del giocatore si apre col codice giusto');
    const client = await new Promise(r => http.get({ host: '127.0.0.1', port: PORT, path: '/online-client.js', headers: { Host: fuori } }, res => { res.resume(); r(res); }));
    ok(client.statusCode === 200 && /javascript/.test(client.headers['content-type'] || ''), 'lo script della pagina del giocatore arriva');
    const sbagliata = await new Promise(r => http.get({ host: '127.0.0.1', port: PORT, path: '/online/nonesiste', headers: { Host: fuori } }, res => { res.resume(); r(res); }));
    ok(sbagliata.statusCode === 404, 'stanza inesistente: 404');
    const prendi = p => new Promise(r => http.get({ host: '127.0.0.1', port: PORT, path: p, headers: { Host: fuori } }, res => { res.resume(); r(res); }));
    const img = await prendi('/leggero/immagini/segnaposto/combat.svg');
    ok(img.statusCode === 200, "un'immagine non convertibile (SVG) arriva originale da /leggero/");
    ok(/max-age=604800/.test(img.headers['cache-control'] || ''), 'i media leggeri hanno la cache del browser');
    const statica = await prendi('/immagini/segnaposto/combat.svg');
    ok(/max-age=604800/.test(statica.headers['cache-control'] || ''), 'anche i media normali hanno la cache del browser');
    const codice = await prendi('/js/online-regole.js');
    ok(/no-store/.test(codice.headers['cache-control'] || ''), 'il codice resta senza cache');
    const fuga = await prendi('/leggero/../tools/chiave_gemini.txt');
    ok(fuga.statusCode === 403 || fuga.statusCode === 404, 'niente file fuori da immagini/ e video/');
    ok(!intruso.some(([e]) => e === 'clic'), 'lo stream del master senza segreto non riceve i clic');
    await prendi('/leggero/immagini/%25');
    await prendi('/%');
    ok((await prendi('/js/online-regole.js')).statusCode === 200, 'un percorso con codifica sbagliata non fa cadere il server');
    master.chiudi();
} finally {
    server.kill();
}
console.log(fallite ? `\n${fallite} prove fallite` : '\nTutte le prove passate');
process.exit(fallite ? 1 : 0);
