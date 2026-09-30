/* ==========================================================================
   Server locale per "Compagnia connessa via QR" (Slay the Dig).
   Solo modulo http nativo di Node: nessuna dipendenza da installare (niente
   npm install). Serve i file del gioco, tiene lo stato condiviso del party
   in memoria e lo distribuisce ai telefoni (pagina /g/<eroe>) via
   Server-Sent Events, con un endpoint REST di ripiego per il polling.

   Avvio: node server/server.js   (oppure doppio click su avvia-server.bat)
   ========================================================================== */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawn, execFile } = require('child_process');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8787;
const ROOT = path.join(__dirname, '..');
const PHONE_PAGE = path.join(__dirname, 'public', 'phone.html');

function getLanIps() {
    const nets = os.networkInterfaces();
    const lanIps = [];
    Object.values(nets).forEach(ifaces => (ifaces || []).forEach(i => {
        if (i.family === 'IPv4' && !i.internal) lanIps.push(i.address);
    }));
    return lanIps;
}

/* ==========================================================================
   Tunnel ngrok (facoltativo): scarica/installa ngrok.exe da solo, ma il
   login richiede che l'admin incolli una volta il proprio authtoken
   (gratuito su ngrok.com) — non è automatizzabile, ngrok lega ogni tunnel
   a un account. Una volta configurato, avvio/arresto sono automatici.
   ========================================================================== */
const NGROK_DOWNLOAD_URL = 'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip';
const TOOLS_DIR = path.join(ROOT, 'tools', 'ngrok');
const NGROK_EXE = path.join(TOOLS_DIR, 'ngrok.exe');
const NGROK_ZIP = path.join(TOOLS_DIR, 'ngrok.zip');

let ngrokInstall = { state: fs.existsSync(NGROK_EXE) ? 'ready' : 'idle', message: '' };
let ngrokProcess = null;
let ngrokPublicUrl = null;

function downloadFile(url, destPath, cb) {
    const doGet = (u, redirectsLeft) => {
        https.get(u, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                response.resume();
                if (redirectsLeft <= 0) { cb(new Error('Troppi redirect durante il download')); return; }
                doGet(response.headers.location, redirectsLeft - 1);
                return;
            }
            if (response.statusCode !== 200) {
                response.resume();
                cb(new Error(`Download fallito (HTTP ${response.statusCode})`));
                return;
            }
            const file = fs.createWriteStream(destPath);
            response.pipe(file);
            file.on('finish', () => file.close(() => cb(null)));
            file.on('error', cb);
        }).on('error', cb);
    };
    doGet(url, 5);
}

function startNgrokInstall() {
    if (ngrokInstall.state === 'downloading' || ngrokInstall.state === 'extracting') return;
    if (fs.existsSync(NGROK_EXE)) { ngrokInstall = { state: 'ready', message: '' }; return; }

    fs.mkdirSync(TOOLS_DIR, { recursive: true });
    ngrokInstall = { state: 'downloading', message: '' };
    console.log('[ngrok] Scaricamento da ' + NGROK_DOWNLOAD_URL);

    downloadFile(NGROK_DOWNLOAD_URL, NGROK_ZIP, (err) => {
        if (err) { ngrokInstall = { state: 'error', message: err.message }; console.log('[ngrok] Errore download: ' + err.message); return; }

        ngrokInstall = { state: 'extracting', message: '' };
        console.log('[ngrok] Estrazione in corso...');
        const psCmd = `Expand-Archive -LiteralPath "${NGROK_ZIP}" -DestinationPath "${TOOLS_DIR}" -Force`;
        execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', psCmd], (err2) => {
            try { fs.unlinkSync(NGROK_ZIP); } catch (e) {}
            if (err2 || !fs.existsSync(NGROK_EXE)) {
                const msg = (err2 && err2.message) || 'ngrok.exe non trovato dopo l\'estrazione';
                ngrokInstall = { state: 'error', message: msg };
                console.log('[ngrok] Errore installazione: ' + msg);
                return;
            }
            ngrokInstall = { state: 'ready', message: '' };
            console.log('[ngrok] Installato correttamente in ' + NGROK_EXE);
        });
    });
}

function hasNgrokAuthtoken() {
    // ngrok v3 salva la configurazione in %LOCALAPPDATA%\ngrok\ngrok.yml
    try {
        const cfgPath = path.join(process.env.LOCALAPPDATA || '', 'ngrok', 'ngrok.yml');
        const content = fs.readFileSync(cfgPath, 'utf8');
        return /authtoken:/.test(content);
    } catch (e) { return false; }
}

function setNgrokAuthtoken(token, cb) {
    if (!fs.existsSync(NGROK_EXE)) { cb(new Error('ngrok non è ancora installato')); return; }
    execFile(NGROK_EXE, ['config', 'add-authtoken', token], (err, stdout, stderr) => {
        if (err) { cb(new Error(stderr || err.message)); return; }
        cb(null);
    });
}

function startNgrokTunnel(cb) {
    if (ngrokProcess && ngrokPublicUrl) { cb(null, ngrokPublicUrl); return; }
    if (!fs.existsSync(NGROK_EXE)) { cb(new Error('ngrok non è installato')); return; }

    if (!ngrokProcess) {
        ngrokProcess = spawn(NGROK_EXE, ['http', String(PORT), '--log=stdout'], { stdio: 'ignore' });
        ngrokProcess.on('exit', () => { ngrokProcess = null; ngrokPublicUrl = null; });
        ngrokProcess.on('error', () => { ngrokProcess = null; ngrokPublicUrl = null; });
    }

    let attempts = 0;
    const poll = () => {
        attempts++;
        http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
            let body = '';
            res.on('data', c => { body += c; });
            res.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    const tunnels = data.tunnels || [];
                    const tunnel = tunnels.find(t => t.proto === 'https') || tunnels[0];
                    if (tunnel && tunnel.public_url) {
                        ngrokPublicUrl = tunnel.public_url;
                        cb(null, ngrokPublicUrl);
                        return;
                    }
                } catch (e) {}
                retry();
            });
        }).on('error', retry);
    };
    const retry = () => {
        if (!ngrokProcess) { cb(new Error('ngrok si è chiuso subito: controlla di aver configurato l\'authtoken.')); return; }
        if (attempts >= 20) {
            stopNgrokTunnel();
            cb(new Error('Timeout: ngrok non ha risposto. Controlla di aver configurato l\'authtoken.'));
            return;
        }
        setTimeout(poll, 750);
    };
    setTimeout(poll, 750);
}

function stopNgrokTunnel() {
    if (ngrokProcess) { try { ngrokProcess.kill(); } catch (e) {} ngrokProcess = null; }
    ngrokPublicUrl = null;
}

process.on('SIGINT', () => { stopNgrokTunnel(); process.exit(0); });
process.on('exit', stopNgrokTunnel);

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.jfif': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.mp4': 'video/mp4',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

// Stato condiviso del party, tenuto in memoria: il tab di gioco lo aggiorna
// con POST /api/state ogni volta che qualcosa cambia; i telefoni lo leggono.
let sharedState = { campaignTitle: '', coins: 0, heroes: [], updatedAt: 0 };

// Turno di dado in attesa di un telefono: al massimo uno alla volta (il gioco
// è a turni). Il server è l'arbitro che genera davvero i numeri, così nessuno
// può "aggiustare" il proprio tiro da telefono.
let pendingRoll = null; // { requestId, heroName, diceCount, label, createdAt }

// Scelta dell'azione di combattimento (attacca/difendi/aiuta/abilità/oggetto) in attesa
// da un telefono: precede l'eventuale pendingRoll, che parte solo dopo che l'azione è nota.
let pendingAction = null; // { requestId, heroName, canUseAbility, abilityLabel, consumables, livingAllies, createdAt }

const sseClients = new Set();

function broadcast(event, data) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    sseClients.forEach(res => { try { res.write(payload); } catch (e) { sseClients.delete(res); } });
}

function broadcastState() { broadcast('state', sharedState); }

function sendJson(res, statusCode, data) {
    const body = JSON.stringify(data);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Content-Length': Buffer.byteLength(body)
    });
    res.end(body);
}

function serveStaticFile(res, filePath) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Non trovato');
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
            'Content-Type': MIME[ext] || 'application/octet-stream',
            // Niente cache: dopo un aggiornamento (git pull) il browser deve sempre
            // ricaricare i file veri, non una copia vecchia salvata in precedenza.
            'Cache-Control': 'no-store, must-revalidate',
            'Pragma': 'no-cache'
        });
        res.end(data);
    });
}

function readJsonBody(req, callback) {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
        try { callback(null, JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
        catch (e) { callback(e); }
    });
}

const server = http.createServer((req, res) => {
    const parsed = new URL(req.url, `http://${req.headers.host}`);
    const pathname = decodeURIComponent(parsed.pathname);

    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    if (pathname === '/api/state' && req.method === 'GET') {
        sendJson(res, 200, Object.assign({}, sharedState, { pendingRoll, pendingAction }));
        return;
    }

    if (pathname === '/api/state' && req.method === 'POST') {
        readJsonBody(req, (err, data) => {
            if (err) { sendJson(res, 400, { error: 'JSON non valido' }); return; }
            sharedState = Object.assign({ campaignTitle: '', coins: 0, heroes: [] }, data, { updatedAt: Date.now() });
            broadcastState();
            sendJson(res, 200, { ok: true });
        });
        return;
    }

    // Il tab di gioco annuncia che un eroe deve scegliere l'azione di combattimento
    // (attacca/difendi/aiuta/abilità/oggetto), prima ancora di sapere se serve un tiro.
    if (pathname === '/api/action-request' && req.method === 'POST') {
        readJsonBody(req, (err, data) => {
            if (err || !data.heroName) { sendJson(res, 400, { error: 'Richiesta non valida' }); return; }
            pendingAction = {
                requestId: crypto.randomUUID(),
                heroName: data.heroName,
                canUseAbility: !!data.canUseAbility,
                abilityLabel: data.abilityLabel || null,
                consumables: Array.isArray(data.consumables) ? data.consumables : [],
                livingAllies: Array.isArray(data.livingAllies) ? data.livingAllies : [],
                createdAt: Date.now()
            };
            broadcast('pending-action', pendingAction);
            sendJson(res, 200, { ok: true, requestId: pendingAction.requestId });
        });
        return;
    }

    // Un telefono sceglie l'azione per l'eroe in attesa (e, per "use_item", anche oggetto e bersaglio).
    if (pathname === '/api/action' && req.method === 'POST') {
        readJsonBody(req, (err, data) => {
            if (err || !data.requestId || !data.action) { sendJson(res, 400, { error: 'Richiesta non valida' }); return; }
            if (!pendingAction || pendingAction.requestId !== data.requestId) {
                sendJson(res, 409, { error: 'Nessuna scelta in attesa con questo id (forse già decisa altrove).' });
                return;
            }
            const resolved = pendingAction;
            const result = {
                requestId: resolved.requestId,
                heroName: resolved.heroName,
                action: data.action,
                itemIndex: typeof data.itemIndex === 'number' ? data.itemIndex : null,
                targetName: data.targetName || null
            };
            pendingAction = null;
            broadcast('pending-action', null);
            broadcast('action-chosen', result);
            sendJson(res, 200, result);
        });
        return;
    }

    // Il tab di gioco annuncia che un eroe deve tirare (combattimento o sfida).
    if (pathname === '/api/roll-request' && req.method === 'POST') {
        readJsonBody(req, (err, data) => {
            if (err || !data.heroName) { sendJson(res, 400, { error: 'Richiesta non valida' }); return; }
            pendingRoll = {
                requestId: crypto.randomUUID(),
                heroName: data.heroName,
                diceCount: data.diceCount === 2 ? 2 : 1,
                label: data.label || 'Tira',
                createdAt: Date.now()
            };
            broadcast('pending-roll', pendingRoll);
            sendJson(res, 200, { ok: true, requestId: pendingRoll.requestId });
        });
        return;
    }

    // Un telefono tira per l'eroe in attesa: il server genera lui i numeri (è l'arbitro).
    if (pathname === '/api/roll' && req.method === 'POST') {
        readJsonBody(req, (err, data) => {
            if (err || !data.requestId) { sendJson(res, 400, { error: 'Richiesta non valida' }); return; }
            if (!pendingRoll || pendingRoll.requestId !== data.requestId) {
                sendJson(res, 409, { error: 'Nessun turno in attesa con questo id (forse già tirato altrove).' });
                return;
            }
            const resolved = pendingRoll;
            const rolls = Array.from({ length: resolved.diceCount }, () => 1 + Math.floor(Math.random() * 6));
            const result = { requestId: resolved.requestId, heroName: resolved.heroName, rolls };
            pendingRoll = null;
            broadcast('pending-roll', null);
            broadcast('roll-result', result);
            sendJson(res, 200, result);
        });
        return;
    }

    if (pathname === '/api/ngrok/status' && req.method === 'GET') {
        const installed = fs.existsSync(NGROK_EXE);
        sendJson(res, 200, {
            installed,
            install: ngrokInstall,
            needsAuthtoken: installed && !hasNgrokAuthtoken(),
            running: !!(ngrokProcess && ngrokPublicUrl),
            publicUrl: ngrokPublicUrl
        });
        return;
    }

    if (pathname === '/api/ngrok/install' && req.method === 'POST') {
        startNgrokInstall();
        sendJson(res, 200, { ok: true });
        return;
    }

    if (pathname === '/api/ngrok/authtoken' && req.method === 'POST') {
        readJsonBody(req, (err, data) => {
            if (err || !data.token) { sendJson(res, 400, { error: 'Token mancante' }); return; }
            setNgrokAuthtoken(String(data.token).trim(), (err2) => {
                if (err2) { sendJson(res, 500, { error: err2.message }); return; }
                sendJson(res, 200, { ok: true });
            });
        });
        return;
    }

    if (pathname === '/api/ngrok/start' && req.method === 'POST') {
        startNgrokTunnel((err, url) => {
            if (err) { sendJson(res, 500, { error: err.message }); return; }
            sendJson(res, 200, { ok: true, publicUrl: url });
        });
        return;
    }

    if (pathname === '/api/ngrok/stop' && req.method === 'POST') {
        stopNgrokTunnel();
        sendJson(res, 200, { ok: true });
        return;
    }

    if (pathname === '/api/events') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });
        res.write(`event: state\ndata: ${JSON.stringify(sharedState)}\n\n`);
        res.write(`event: pending-roll\ndata: ${JSON.stringify(pendingRoll)}\n\n`);
        res.write(`event: pending-action\ndata: ${JSON.stringify(pendingAction)}\n\n`);
        sseClients.add(res);
        req.on('close', () => sseClients.delete(res));
        return;
    }

    if (pathname.startsWith('/g/')) {
        serveStaticFile(res, PHONE_PAGE);
        return;
    }

    // File statici del gioco (index.html, css/, js/, data/, immagini/, audio/, ...)
    const relPath = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.normalize(path.join(ROOT, relPath));
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403); res.end('Vietato');
        return;
    }
    serveStaticFile(res, filePath);
});

server.listen(PORT, () => {
    const lanIps = getLanIps();

    console.log(`\nServer del gioco avviato sulla porta ${PORT}.`);
    console.log(`Gioco (su questo PC):    http://localhost:${PORT}/index.html`);
    if (lanIps.length === 0) {
        console.log('Nessun indirizzo di rete locale trovato: i telefoni dovranno usare il tunnel ngrok.');
    } else {
        lanIps.forEach(ip => console.log(`Telefoni (stessa rete):   http://${ip}:${PORT}/g/<nome-eroe>`));
    }
    console.log('\nLascia questa finestra aperta finché giochi. Chiudila per fermare il server.\n');
});
