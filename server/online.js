/* ==========================================================================
   SERVER DELLA PARTITA ONLINE (richiesto da server/server.js)
   Una stanza alla volta, aperta dal master (Host locale). I giocatori entrano
   con il codice e un nome, ricevono un token e uno stream SSE compresso con le
   regioni della schermata del master; i loro clic vanno al master, che decide.
   ========================================================================== */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PUBLIC = path.join(__dirname, 'public');
const DISCONNECT_MS = process.env.ONLINE_DISCONNECT_MS ? parseInt(process.env.ONLINE_DISCONNECT_MS, 10) : 20000;
const PING_MS = process.env.SSE_PING_MS ? parseInt(process.env.SSE_PING_MS, 10) : 15000;
const NOME_MAX = 24;
const { nomeGiocatoreValido } = require('../js/online-regole.js');

let stanza = null;        // { code, giocatori: Map(token -> { name, connected, flussi: Set, timer }), regioni: {}, stato: null }
const masters = new Set(); // stream SSE del master

// Master: chiamata dal PC stesso (loopback; anche ngrok arriva da qui, ma con l'Host pubblico) e con Host locale.
// Dopo l'apertura della stanza serve anche il segreto (intestazione X-Online-Segreto o ?segreto= per lo stream).
const LOOPBACK = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
const eLocale = req => LOOPBACK.includes(req.socket.remoteAddress) && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.host || '');
const haSegreto = req => {
    if (!stanza) return false;
    const q = new URL(req.url, 'http://x').searchParams.get('segreto');
    return (req.headers['x-online-segreto'] || q) === stanza.segreto;
};

function json(res, code, data) {
    const body = JSON.stringify(data);
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) });
    res.end(body);
}

function leggiJson(req, cb) {
    const parti = [];
    req.on('data', c => parti.push(c));
    req.on('end', () => { try { cb(JSON.parse(Buffer.concat(parti).toString('utf8') || '{}')); } catch (e) { cb(null); } });
}

// Stream SSE (gzip con flush se il browser lo accetta): scrivi(evento, dati), chiudi()
// Stream SSE sempre in chiaro: ngrok (e altri proxy) trattengono una risposta con Content-Encoding gzip
// finché non finisce, e uno stream non finisce mai (il giocatore restava collegato ma senza schermata).
// La compressione è dentro gli eventi "parti" per chi la chiede (z=1, vedi scriviParti).
function apriFlusso(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', 'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no' });
    const dest = res;
    const scrivi = (evento, dati) => { try { dest.write(`event: ${evento}\ndata: ${JSON.stringify(dati)}\n\n`); } catch (e) {} };
    dest.write('retry: 3000\n\n');
    const ping = setInterval(() => scrivi('ping', { t: Date.now() }), PING_MS);
    ping.unref();
    const flusso = { scrivi, chiudi: () => { clearInterval(ping); try { dest.end(); } catch (e) {} } };
    req.on('close', () => clearInterval(ping));
    return flusso;
}

const elencoGiocatori = () => stanza ? [...stanza.giocatori.values()].map(gi => ({ name: gi.name, connected: gi.connected })) : [];
const alMaster = (evento, dati) => masters.forEach(f => f.scrivi(evento, dati));
const aiGiocatori = (evento, dati) => stanza && stanza.giocatori.forEach(gi => gi.flussi.forEach(f => f.scrivi(evento, dati)));
// Regioni della schermata: compresse (deflate + base64) per i browser che sanno decomprimerle, in chiaro per gli altri
const comprimi = parti => ({ z: zlib.deflateRawSync(Buffer.from(JSON.stringify(parti), 'utf8')).toString('base64') });
function scriviParti(f, parti, compresse) { f.scrivi('parti', f.z ? (compresse || comprimi(parti)) : parti); }
function partiAiGiocatori(parti) {
    if (!stanza) return;
    const compresse = comprimi(parti);
    stanza.giocatori.forEach(gi => gi.flussi.forEach(f => scriviParti(f, parti, compresse)));
}
const avvisaStanza = () => alMaster('stanza', { giocatori: elencoGiocatori() });

function giocatoreDaToken(code, token) {
    if (!stanza || stanza.code !== code || !token) return null;
    return stanza.giocatori.get(token) || null;
}

function pulisciNome(n) {
    return String(n || '').replace(/[<>"'&\u0000-\u001f]/g, '').trim().slice(0, NOME_MAX);
}

/* ---------- Media leggeri per i giocatori (/leggero/<percorso>) ---------- */
const { execFile } = require('child_process');
const ROOT = path.join(__dirname, '..');
const CACHE = path.join(__dirname, 'cache-leggera');
const MEDIA_CACHE = 'public, max-age=604800';
const TIPI = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm' };
const inCorso = new Map();  // file leggero -> Promise (una conversione alla volta per file)

// Con "Range" si manda solo il pezzo chiesto (206): i browser dei telefoni (Safari) riproducono i video solo così
function mandaFile(req, res, file) {
    fs.readFile(file, (err, buf) => {
        if (err) { res.writeHead(404); res.end(); return; }
        const tipo = TIPI[path.extname(file).toLowerCase()] || 'application/octet-stream';
        const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
        if (m && (m[1] || m[2])) {
            let inizio = m[1] ? parseInt(m[1], 10) : buf.length - parseInt(m[2], 10);
            let fine = m[1] && m[2] ? parseInt(m[2], 10) : buf.length - 1;
            inizio = Math.max(0, inizio); fine = Math.min(fine, buf.length - 1);
            if (inizio > fine) { res.writeHead(416, { 'Content-Range': `bytes */${buf.length}` }); res.end(); return; }
            res.writeHead(206, { 'Content-Type': tipo, 'Cache-Control': MEDIA_CACHE, 'Accept-Ranges': 'bytes',
                'Content-Range': `bytes ${inizio}-${fine}/${buf.length}`, 'Content-Length': fine - inizio + 1 });
            res.end(buf.subarray(inizio, fine + 1));
            return;
        }
        res.writeHead(200, { 'Content-Type': tipo, 'Cache-Control': MEDIA_CACHE, 'Accept-Ranges': 'bytes', 'Content-Length': buf.length });
        res.end(buf);
    });
}
function converti(orig, dest) {
    if (inCorso.has(dest)) return inCorso.get(dest);
    const video = /\.(mp4|webm)$/i.test(orig);
    const args = video
        ? ['-y', '-i', orig, '-vf', "scale=-2:'min(480,ih)'", '-c:v', 'libx264', '-crf', '32', '-preset', 'veryfast', '-an', '-movflags', '+faststart', dest]
        : ['-y', '-i', orig, '-vf', "scale='min(960,iw)':'min(960,ih)':force_original_aspect_ratio=decrease", '-c:v', 'libwebp', '-quality', '65', dest];
    const p = new Promise(resolve => {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        execFile('ffmpeg', args, { timeout: 120000 }, err => { inCorso.delete(dest); resolve(!err && fs.existsSync(dest)); });
    });
    inCorso.set(dest, p);
    return p;
}
function leggero(req, res, pathname) {
    let rel;
    try { rel = path.normalize(decodeURIComponent(pathname.slice('/leggero/'.length))); } catch (e) { res.writeHead(400); res.end(); return; }
    if (rel.startsWith('..') || path.isAbsolute(rel) || !/^(immagini|video)[\\/]/.test(rel)) { res.writeHead(403); res.end(); return; }
    const orig = path.join(ROOT, rel);
    if (!fs.existsSync(orig)) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(rel).toLowerCase();
    if (!['.webp', '.png', '.jpg', '.jpeg', '.mp4', '.webm'].includes(ext)) { mandaFile(req, res, orig); return; }
    const dest = path.join(CACHE, rel.replace(/\.(png|jpe?g)$/i, '.webp').replace(/\.webm$/i, '.mp4'));
    if (fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= fs.statSync(orig).mtimeMs) { mandaFile(req, res, dest); return; }
    converti(orig, dest).then(fatto => mandaFile(req, res, fatto ? dest : orig));
}

function gestisci(req, res, pathname) {
    if (pathname.startsWith('/leggero/')) { leggero(req, res, pathname); return true; }
    // ----- Master (Host locale) -----
    if (pathname.startsWith('/api/online/') && ['apri', 'chiudi', 'master', 'parti', 'stato', 'avviso'].includes(pathname.slice(12))) {
        const cosa = pathname.slice(12);
        if (!eLocale(req) || (cosa !== 'apri' && !haSegreto(req))) { json(res, 403, { error: 'Solo il master' }); return true; }
        if (cosa === 'apri' && req.method === 'POST') {
            if (!stanza) stanza = { code: crypto.randomBytes(5).toString('hex'), segreto: crypto.randomBytes(16).toString('hex'), giocatori: new Map(), regioni: {}, stato: null };
            json(res, 200, { code: stanza.code, segreto: stanza.segreto });
            return true;
        }
        if (cosa === 'chiudi' && req.method === 'POST') {
            aiGiocatori('master', { online: false, chiusa: true });
            if (stanza) stanza.giocatori.forEach(gi => gi.flussi.forEach(f => f.chiudi()));
            stanza = null;
            json(res, 200, { ok: true });
            return true;
        }
        if (cosa === 'master') {
            const f = apriFlusso(req, res);
            masters.add(f);
            f.scrivi('stanza', { giocatori: elencoGiocatori() });
            aiGiocatori('master', { online: true });
            req.on('close', () => { masters.delete(f); if (!masters.size) aiGiocatori('master', { online: false }); });
            return true;
        }
        leggiJson(req, data => {
            if (!data || !stanza) { json(res, 400, { error: 'Nessuna stanza' }); return; }
            if (cosa === 'parti') {
                Object.entries(data.parti || {}).forEach(([k, v]) => { if (v === null) delete stanza.regioni[k]; else stanza.regioni[k] = v; });
                partiAiGiocatori(data.parti || {});
            } else if (cosa === 'stato') {
                stanza.stato = data;
                aiGiocatori('stato', data);
            } else if (cosa === 'avviso') {
                stanza.giocatori.forEach(gi => { if (gi.name === data.giocatore) gi.flussi.forEach(f => f.scrivi('avviso', { testo: String(data.testo || '') })); });
            }
            json(res, 200, { ok: true });
        });
        return true;
    }

    // ----- Giocatori -----
    if (pathname === '/online-client.js') {
        fs.readFile(path.join(PUBLIC, 'online.js'), (err, buf) => {
            if (err) { res.writeHead(404); res.end(); return; }
            res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
            res.end(buf);
        });
        return true;
    }
    if (pathname.startsWith('/online/')) {
        const code = pathname.slice(8).split('/')[0];
        if (!stanza || stanza.code !== code) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Stanza non trovata: chiedi al master un link nuovo.'); return true; }
        fs.readFile(path.join(PUBLIC, 'online.html'), (err, buf) => {
            if (err) { res.writeHead(500); res.end('Pagina mancante'); return; }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
            res.end(buf);
        });
        return true;
    }
    if (pathname === '/api/online/entra' && req.method === 'POST') {
        leggiJson(req, data => {
            if (!data || !stanza || data.code !== stanza.code) { json(res, 200, { error: 'Stanza non trovata' }); return; }
            const vecchio = data.token && stanza.giocatori.get(data.token);
            if (vecchio) { json(res, 200, { token: data.token, nome: vecchio.name }); return; }
            const nome = pulisciNome(data.nome);
            if (!nome) { json(res, 200, { error: 'Scrivi un nome' }); return; }
            if (!nomeGiocatoreValido(nome)) { json(res, 200, { error: 'Questo nome è riservato' }); return; }
            if ([...stanza.giocatori.values()].some(gi => gi.name.toLowerCase() === nome.toLowerCase())) { json(res, 200, { error: 'Nome già usato da un altro giocatore' }); return; }
            const token = crypto.randomBytes(16).toString('hex');
            stanza.giocatori.set(token, { name: nome, connected: false, flussi: new Set(), timer: null });
            avvisaStanza();
            json(res, 200, { token, nome });
        });
        return true;
    }
    if (pathname === '/api/online/flusso') {
        const u = new URL(req.url, 'http://x');
        const gi = giocatoreDaToken(u.searchParams.get('code'), u.searchParams.get('token'));
        if (!gi) { json(res, 403, { error: 'Token non valido' }); return true; }
        const f = apriFlusso(req, res);
        f.z = u.searchParams.get('z') === '1';
        gi.flussi.add(f);
        clearTimeout(gi.timer);
        if (!gi.connected) { gi.connected = true; avvisaStanza(); }
        scriviParti(f, stanza.regioni);
        if (stanza.stato) f.scrivi('stato', stanza.stato);
        f.scrivi('master', { online: masters.size > 0 });
        req.on('close', () => {
            gi.flussi.delete(f);
            if (gi.flussi.size) return;
            clearTimeout(gi.timer);
            gi.timer = setTimeout(() => { if (!gi.flussi.size && gi.connected) { gi.connected = false; avvisaStanza(); } }, DISCONNECT_MS);
        });
        return true;
    }
    if (pathname === '/api/online/clic' && req.method === 'POST') {
        leggiJson(req, data => {
            const gi = data && giocatoreDaToken(data.code, data.token);
            if (!gi) { json(res, 403, { error: 'Token non valido' }); return; }
            if (!masters.size) { json(res, 200, { error: 'Il master non è collegato' }); return; }
            alMaster('clic', { giocatore: gi.name, azione: String(data.azione || ''), tipo: data.tipo || 'click',
                regione: data.regione || null, percorso: Array.isArray(data.percorso) ? data.percorso : [],
                args: Array.isArray(data.args) ? data.args : [], valori: data.valori || {} });
            json(res, 200, { ok: true });
        });
        return true;
    }
    return false;
}

module.exports = { gestisci, haMaster: () => masters.size > 0 };
