/* ==========================================================================
   SERVER DELLA PARTITA ONLINE (richiesto da server/server.js)
   Una stanza alla volta, aperta dal master (Host locale). I giocatori entrano
   con il codice (senza nome), ricevono un token e uno stream SSE con le regioni
   della schermata del master; poi scelgono un eroe dalla lobby (/api/online/scegli) e da quel momento
   il loro nome è quello dell'eroe. I loro clic vanno al master, che decide.
   ========================================================================== */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PUBLIC = path.join(__dirname, 'public');
const DISCONNECT_MS = process.env.ONLINE_DISCONNECT_MS ? parseInt(process.env.ONLINE_DISCONNECT_MS, 10) : 20000;
const PING_MS = process.env.SSE_PING_MS ? parseInt(process.env.SSE_PING_MS, 10) : 15000;
const { esitoSceltaEroe, nomeModeratore } = require('../js/online-regole.js');

// { code, segreto, chiaveMaster, giocatori: Map(token -> { id, name (null finché non sceglie un eroe), connected, flussi: Set, timer, ruolo }), regioni: {},
//   regioniMaster: {}, stato: null }. regioniMaster = la schermata come la vede il master a distanza (mappa intera)
let stanza = null;
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

const elencoGiocatori = () => stanza ? [...stanza.giocatori.values()].map(gi => ({ id: gi.id, name: gi.name, connected: gi.connected, ruolo: gi.ruolo || 'giocatore' })) : [];
const alMaster = (evento, dati) => masters.forEach(f => f.scrivi(evento, dati));
const aiGiocatori = (evento, dati) => stanza && stanza.giocatori.forEach(gi => gi.flussi.forEach(f => f.scrivi(evento, dati)));
// Solo ai moderatori e al master a distanza (il pannello privato di server/public/online.js): mai agli altri giocatori
const aiModeratori = (evento, dati) => stanza && stanza.giocatori.forEach(gi => { if (['moderatore', 'master'].includes(gi.ruolo)) gi.flussi.forEach(f => f.scrivi(evento, dati)); });
// Regioni della schermata: compresse (deflate + base64) per i browser che sanno decomprimerle, in chiaro per gli altri
const comprimi = parti => ({ z: zlib.deflateRawSync(Buffer.from(JSON.stringify(parti), 'utf8')).toString('base64') });
function scriviParti(f, parti, compresse) { f.scrivi('parti', f.z ? (compresse || comprimi(parti)) : parti); }
// Il master a distanza riceve la sua versione (partiMaster) se il master ne manda una, altrimenti la stessa dei giocatori
function partiAiGiocatori(parti, partiMaster) {
    if (!stanza) return;
    const compresse = parti && comprimi(parti);
    const compresseMaster = partiMaster && comprimi(partiMaster);
    stanza.giocatori.forEach(gi => {
        const mie = gi.ruolo === 'master' && partiMaster ? [partiMaster, compresseMaster] : [parti, compresse];
        if (mie[0]) gi.flussi.forEach(f => scriviParti(f, mie[0], mie[1]));
    });
}
const applicaRegioni = (dove, parti) => Object.entries(parti || {}).forEach(([k, v]) => { if (v === null) delete dove[k]; else dove[k] = v; });
const avvisaStanza = () => alMaster('stanza', { giocatori: elencoGiocatori() });

function giocatoreDaToken(code, token) {
    if (!stanza || stanza.code !== code || !token) return null;
    return stanza.giocatori.get(token) || null;
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
    if (pathname.startsWith('/api/online/') && ['apri', 'chiudi', 'master', 'parti', 'stato', 'avviso', 'libera', 'gmstato'].includes(pathname.slice(12))) {
        const cosa = pathname.slice(12);
        if (!eLocale(req) || (cosa !== 'apri' && !haSegreto(req))) { json(res, 403, { error: 'Solo il master' }); return true; }
        if (cosa === 'apri' && req.method === 'POST') {
            if (!stanza) stanza = { code: crypto.randomBytes(5).toString('hex'), segreto: crypto.randomBytes(16).toString('hex'),
                chiaveMaster: crypto.randomBytes(12).toString('hex'), giocatori: new Map(), regioni: {}, regioniMaster: {}, stato: null, gmStato: null };
            json(res, 200, { code: stanza.code, segreto: stanza.segreto, chiaveMaster: stanza.chiaveMaster });
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
                // Senza partiMaster il master a distanza vede quello che vedono i giocatori; con "completa" la sua
                // versione sostituisce tutta quella di prima (è appena entrato)
                applicaRegioni(stanza.regioni, data.parti);
                if (data.partiMaster) {
                    if (data.completa) stanza.regioniMaster = {};
                    applicaRegioni(stanza.regioniMaster, data.partiMaster);
                } else applicaRegioni(stanza.regioniMaster, data.parti);
                partiAiGiocatori(data.parti || null, data.partiMaster || null);
            } else if (cosa === 'stato') {
                stanza.stato = data;
                aiGiocatori('stato', data);
            } else if (cosa === 'libera') {
                // L'eroe torna libero: chi lo aveva resta in lobby senza nome e deve sceglierne un altro
                const gi = [...stanza.giocatori.values()].find(g => g.id === data.id && (g.ruolo || 'giocatore') === 'giocatore');
                if (gi) {
                    gi.name = null;
                    gi.flussi.forEach(f => f.scrivi('avviso', { testo: String(data.motivo || '') }));
                    avvisaStanza();
                }
            } else if (cosa === 'avviso') {
                stanza.giocatori.forEach(gi => { if (data.giocatore && gi.name === data.giocatore) gi.flussi.forEach(f => f.scrivi('avviso', { testo: String(data.testo || '') })); });
            } else if (cosa === 'gmstato') {
                // Dati del pannello privato del moderatore (HP di squadra e nemico): mai alla mirroring
                // dei giocatori normali, solo ai flussi con ruolo 'moderatore' (aiModeratori)
                stanza.gmStato = data;
                aiModeratori('gmstato', data);
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
            if (vecchio) { json(res, 200, { token: data.token, id: vecchio.id, nome: vecchio.name, ruolo: vecchio.ruolo || 'giocatore' }); return; }
            if (data.token) { json(res, 200, { error: 'Sessione scaduta: rientra dal link' }); return; }
            // Master a distanza: solo con la chiave del link del master (onlineLinkMaster in js/online.js)
            if (data.ruolo === 'master' && data.chiave !== stanza.chiaveMaster) { json(res, 200, { error: 'Link del master non valido: chiedine uno nuovo a chi ospita' }); return; }
            // Moderatore (server/public/online.html, "Entra come Moderatore"): niente eroe, non conta per la
            // dimensione della squadra né per i voti/pronti/capo (js/online.js, onlineGiocatoriCollegati);
            // può solo usare il Pannello di Controllo (whitelist ONLINE_AZIONI_MODERATORE in js/online-regole.js)
            const ruolo = data.ruolo === 'moderatore' ? 'moderatore' : data.ruolo === 'master' ? 'master' : 'giocatore';
            // I giocatori entrano senza nome: lo prendono scegliendo un eroe (/api/online/scegli)
            const nome = ruolo === 'moderatore' ? nomeModeratore(elencoGiocatori()) : ruolo === 'master' ? 'Master' : null;
            const token = crypto.randomBytes(16).toString('hex');
            const id = crypto.randomBytes(4).toString('hex');
            stanza.giocatori.set(token, { id, name: nome, connected: false, flussi: new Set(), timer: null, ruolo });
            avvisaStanza();
            json(res, 200, { token, id, nome, ruolo });
        });
        return true;
    }
    if (pathname === '/api/online/scegli' && req.method === 'POST') {
        leggiJson(req, data => {
            const gi = data && giocatoreDaToken(data.code, data.token);
            if (!gi) { json(res, 403, { error: 'Token non valido' }); return; }
            const eroe = String(data.eroe || '');
            const chi = { id: gi.id, name: gi.name, ruolo: gi.ruolo || 'giocatore' };
            const esito = esitoSceltaEroe(eroe, chi, elencoGiocatori(), stanza.stato && stanza.stato.rosa);
            if (!esito.ok) { json(res, 200, { error: esito.motivo }); return; }
            if (esito.libera) {
                // Chi aveva quell'eroe è scollegato: perde il posto (il suo token non vale più)
                for (const [tk, vecchio] of [...stanza.giocatori]) {
                    if (vecchio.id === esito.libera) { clearTimeout(vecchio.timer); vecchio.flussi.forEach(f => f.chiudi()); stanza.giocatori.delete(tk); }
                }
            }
            gi.name = eroe;
            avvisaStanza();
            alMaster('scelta', { id: gi.id, eroe });
            json(res, 200, { ok: true, nome: eroe });
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
        scriviParti(f, gi.ruolo === 'master' ? stanza.regioniMaster : stanza.regioni);
        if (stanza.stato) f.scrivi('stato', stanza.stato);
        if (['moderatore', 'master'].includes(gi.ruolo) && stanza.gmStato) f.scrivi('gmstato', stanza.gmStato);
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
            if ((gi.ruolo || 'giocatore') === 'giocatore' && gi.name === null) { json(res, 403, { error: 'Scegli prima un eroe' }); return; }
            if (!masters.size) { json(res, 200, { error: 'Il master non è collegato' }); return; }
            alMaster('clic', { giocatore: gi.name, azione: String(data.azione || ''), tipo: data.tipo || 'click',
                regione: data.regione || null, percorso: Array.isArray(data.percorso) ? data.percorso : [],
                args: Array.isArray(data.args) ? data.args : [], valori: data.valori || {} });
            json(res, 200, { ok: true });
        });
        return true;
    }
    // Azione del pannello privato del moderatore (server/public/online.js): niente percorso/regione nel DOM
    // specchiato (non è un clic su uno schermo condiviso), solo nome dell'azione e argomenti. Il master la
    // esegue "silenziosa" (opts.silent, js/combattimento.js): mai una finestra visibile a lui o ai giocatori.
    if (pathname === '/api/online/moderatore-azione' && req.method === 'POST') {
        leggiJson(req, data => {
            const gi = data && giocatoreDaToken(data.code, data.token);
            if (!gi || !['moderatore', 'master'].includes(gi.ruolo)) { json(res, 403, { error: 'Token non valido' }); return; }
            if (!masters.size) { json(res, 200, { error: 'Il master non è collegato' }); return; }
            alMaster('clic-moderatore', { giocatore: gi.name, azione: String((data && data.azione) || ''),
                args: Array.isArray(data && data.args) ? data.args : [] });
            json(res, 200, { ok: true });
        });
        return true;
    }
    return false;
}

module.exports = { gestisci, haMaster: () => masters.size > 0 };
