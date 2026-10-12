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

let stanza = null;        // { code, giocatori: Map(token -> { name, connected, flussi: Set, timer }), regioni: {}, stato: null }
const masters = new Set(); // stream SSE del master

const eLocale = req => /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.host || '');

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
function apriFlusso(req, res) {
    const gzip = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', ...(gzip ? { 'Content-Encoding': 'gzip' } : {}) });
    const out = gzip ? zlib.createGzip({ flush: zlib.constants.Z_SYNC_FLUSH }) : null;
    if (out) out.pipe(res);
    const dest = out || res;
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

function mandaFile(res, file) {
    fs.readFile(file, (err, buf) => {
        if (err) { res.writeHead(404); res.end(); return; }
        res.writeHead(200, { 'Content-Type': TIPI[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': MEDIA_CACHE });
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
    const rel = path.normalize(decodeURIComponent(pathname.slice('/leggero/'.length)));
    if (rel.startsWith('..') || path.isAbsolute(rel) || !/^(immagini|video)[\\/]/.test(rel)) { res.writeHead(403); res.end(); return; }
    const orig = path.join(ROOT, rel);
    if (!fs.existsSync(orig)) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(rel).toLowerCase();
    if (!['.webp', '.png', '.jpg', '.jpeg', '.mp4', '.webm'].includes(ext)) { mandaFile(res, orig); return; }
    const dest = path.join(CACHE, rel.replace(/\.(png|jpe?g)$/i, '.webp').replace(/\.webm$/i, '.mp4'));
    if (fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= fs.statSync(orig).mtimeMs) { mandaFile(res, dest); return; }
    converti(orig, dest).then(fatto => mandaFile(res, fatto ? dest : orig));
}

function gestisci(req, res, pathname) {
    if (pathname.startsWith('/leggero/')) { leggero(req, res, pathname); return true; }
    // ----- Master (Host locale) -----
    if (pathname.startsWith('/api/online/') && ['apri', 'chiudi', 'master', 'parti', 'stato', 'avviso'].includes(pathname.slice(12))) {
        if (!eLocale(req)) { json(res, 403, { error: 'Solo il master' }); return true; }
        const cosa = pathname.slice(12);
        if (cosa === 'apri' && req.method === 'POST') {
            if (!stanza) stanza = { code: crypto.randomBytes(5).toString('hex'), giocatori: new Map(), regioni: {}, stato: null };
            json(res, 200, { code: stanza.code });
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
                aiGiocatori('parti', data.parti || {});
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
        gi.flussi.add(f);
        clearTimeout(gi.timer);
        if (!gi.connected) { gi.connected = true; avvisaStanza(); }
        f.scrivi('parti', stanza.regioni);
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
