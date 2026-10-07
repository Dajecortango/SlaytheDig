// Genera le immagini mancanti del gioco con Gemini 2.5 Flash Image ("nano banana", chiave a pagamento)
// oppure con Pollinations.ai (gratis, con una chiave gratuita).
// Uso (dalla cartella del progetto):
//   node tools/genera_immagini.mjs                    elenca i lavori e dice quali file mancano
//   node tools/genera_immagini.mjs --solo predoni     genera solo i lavori il cui file contiene "predoni"
//   node tools/genera_immagini.mjs --gruppo bestiario genera un gruppo (bestiario, nodi, schermate, ui)
//   node tools/genera_immagini.mjs --tutte            genera tutti i file che mancano
//   aggiungere --forza per rigenerare anche i file che esistono già
//   aggiungere --motore gemini oppure --motore pollinations per scegliere il generatore
//   aggiungere --modello <id> per cambiare il modello di Pollinations (elenco: https://gen.pollinations.ai/image/models)
// Senza --motore si usa Gemini se c'è la sua chiave, altrimenti Pollinations.
// La chiave di Gemini si legge da GEMINI_API_KEY oppure dal file tools/chiave_gemini.txt (ignorato da git).
// La chiave di Pollinations (gratuita, con un credito settimanale: https://enter.pollinations.ai) si legge
// da POLLINATIONS_KEY oppure dal file tools/chiave_pollinations.txt (ignorato da git). Senza chiave si usa
// il vecchio servizio anonimo: modello scarso, scritta "pollinations.ai" nell'angolo e spesso errore 402.
// Pollinations non riceve le immagini di riferimento: lo stile arriva solo dal testo di "stili".
// I lavori (file, prompt, immagini di riferimento per lo stile) sono in tools/immagini.json.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODEL = 'gemini-2.5-flash-image';
const args = process.argv.slice(2);
const flag = n => args.includes(n);
const value = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };

const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/immagini.json'), 'utf8'));
const exists = f => fs.existsSync(path.join(ROOT, f));

let jobs = config.lavori;
if (value('--solo')) jobs = jobs.filter(j => j.file.includes(value('--solo')));
else if (value('--gruppo')) jobs = jobs.filter(j => j.gruppo === value('--gruppo'));
else if (!flag('--tutte')) {
    for (const j of config.lavori) console.log(`${exists(j.file) ? 'c\'è   ' : 'manca '} [${j.gruppo}] ${j.file}`);
    console.log('\nAggiungi --solo <nome>, --gruppo <nome> o --tutte per generare.');
    process.exit(0);
}
if (!flag('--forza')) jobs = jobs.filter(j => !exists(j.file));
if (!jobs.length) { console.log('Niente da generare.'); process.exit(0); }

function readKey(envName, file) {
    if (process.env[envName]) return process.env[envName].trim();
    const f = path.join(ROOT, file);
    return fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim() : '';
}
const geminiKey = readKey('GEMINI_API_KEY', 'tools/chiave_gemini.txt');
const pollinationsKey = readKey('POLLINATIONS_KEY', 'tools/chiave_pollinations.txt');
const engine = value('--motore') || (geminiKey ? 'gemini' : 'pollinations');
if (!['gemini', 'pollinations'].includes(engine)) { console.error('Motore sconosciuto: ' + engine); process.exit(1); }
if (engine === 'gemini' && !geminiKey) {
    console.error('Chiave mancante: imposta GEMINI_API_KEY o scrivi la chiave in tools/chiave_gemini.txt');
    process.exit(1);
}
const POLLINATIONS_MODEL = value('--modello') || 'tongyi-mai/z-image-turbo';
if (engine === 'gemini') console.log(`Motore: ${MODEL}\n`);
else if (pollinationsKey) console.log(`Motore: pollinations (modello predefinito ${POLLINATIONS_MODEL}; i lavori con "modello" usano il loro)\n`);
else console.log('Motore: pollinations anonimo (senza chiave: qualità bassa e scritta nell\'angolo).\n' +
    'Crea una chiave gratuita su https://enter.pollinations.ai e scrivila in tools/chiave_pollinations.txt\n');

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.jfif': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
function refPart(file) {
    return { inline_data: { mime_type: MIME[path.extname(file).toLowerCase()] || 'image/jpeg', data: fs.readFileSync(path.join(ROOT, file)).toString('base64') } };
}

// Salva nel formato chiesto dall'estensione del file: Gemini risponde in PNG, Pollinations di solito
// in JPG. Le immagini del gioco sono in WebP: la conversione passa da ffmpeg (deve essere nel PATH,
// build con libwebp), qualità 82 come tools/ottimizza_immagini.mjs. La conversione in JPG (vecchi
// lavori) passa da System.Drawing di Windows.
const WEBP_QUALITY = 82;
function save(file, mime, b64) {
    const out = path.join(ROOT, file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const ext = path.extname(file).toLowerCase();
    if (ext === '.webp') {
        if (mime === 'image/webp') { fs.writeFileSync(out, Buffer.from(b64, 'base64')); return; }
        const tmp = out + '.tmp' + (mime === 'image/jpeg' ? '.jpg' : '.png');
        fs.writeFileSync(tmp, Buffer.from(b64, 'base64'));
        try {
            execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-c:v', 'libwebp', '-quality', String(WEBP_QUALITY),
                '-compression_level', '6', '-frames:v', '1', out]);
        } finally { fs.rmSync(tmp, { force: true }); }
        return;
    }
    const wantJpg = ['.jpg', '.jpeg', '.jfif'].includes(ext);
    if (!wantJpg || mime === 'image/jpeg') { fs.writeFileSync(out, Buffer.from(b64, 'base64')); return; }
    const tmp = out + '.tmp.png';
    fs.writeFileSync(tmp, Buffer.from(b64, 'base64'));
    const ps = `Add-Type -AssemblyName System.Drawing; $i=[System.Drawing.Image]::FromFile('${tmp}'); ` +
        `$c=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()|?{$_.MimeType -eq 'image/jpeg'}; ` +
        `$p=New-Object System.Drawing.Imaging.EncoderParameters 1; $p.Param[0]=New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality,[long]88); ` +
        `$i.Save('${out}',$c,$p); $i.Dispose()`;
    execFileSync('powershell', ['-NoProfile', '-Command', ps]);
    fs.unlinkSync(tmp);
}

// Dimensioni in pixel per Pollinations (Gemini sceglie da solo dal formato).
// Un lavoro può chiedere un modello suo ("modello") e lo sfondo trasparente ("trasparente": true,
// solo con i modelli gptimage e gptimage-large, file .png): serve per catene, bottoni e cornici.
const SIZES = { '16:9': [1536, 864], '21:9': [1792, 768], '1:1': [1024, 1024], '3:2': [1536, 1024], '2:3': [1024, 1536] };

async function generatePollinations(job) {
    const [width, height] = SIZES[job.formato || '16:9'] || SIZES['16:9'];
    // Soggetto prima dello stile: con lo stile in testa i modelli veloci perdono il soggetto.
    const prompt = encodeURIComponent([job.prompt, config.stili[job.stile] || ''].filter(Boolean).join(' '));
    const params = new URLSearchParams({ width, height });
    if (job.trasparente) {
        if (!pollinationsKey) throw new Error('lo sfondo trasparente richiede la chiave di Pollinations');
        params.set('transparent', 'true');
    }
    if (job.seed != null) params.set('seed', job.seed);
    let res;
    if (pollinationsKey) {
        params.set('model', value('--modello') || job.modello || POLLINATIONS_MODEL);
        res = await fetch(`https://gen.pollinations.ai/image/${prompt}?${params}`, { headers: { Authorization: 'Bearer ' + pollinationsKey } });
    } else {
        res = await fetch(`https://image.pollinations.ai/prompt/${prompt}?${params}`);
    }
    const type = res.headers.get('content-type') || '';
    if (!res.ok || !type.startsWith('image/')) {
        const hint = res.status === 401 ? ' (chiave non valida)'
            : res.status === 402 ? (pollinationsKey ? ' (credito della settimana finito)' : ' (servizio anonimo esaurito: serve la chiave gratuita)') : '';
        throw new Error(`${res.status}${hint} ${(await res.text()).slice(0, 300)}`);
    }
    save(job.file, type.split(';')[0], Buffer.from(await res.arrayBuffer()).toString('base64'));
}

async function generate(job) {
    if (engine === 'pollinations') return generatePollinations(job);
    const style = config.stili[job.stile] || '';
    const refs = job.riferimenti || config.riferimenti[job.stile] || [];
    const text = [
        refs.length ? 'Match the painting style, palette, lighting and level of detail of the reference images exactly. Do not copy their composition or characters.' : '',
        style, job.prompt,
    ].filter(Boolean).join('\n\n');
    const body = {
        contents: [{ parts: [...refs.map(refPart), { text }] }],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: job.formato || '16:9' } },
    };
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiKey },
        body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(`${res.status} ${json.error?.message || JSON.stringify(json).slice(0, 300)}`);
    const part = json.candidates?.[0]?.content?.parts?.find(p => p.inlineData || p.inline_data);
    if (!part) throw new Error('nessuna immagine nella risposta: ' + JSON.stringify(json.candidates?.[0] || json.promptFeedback).slice(0, 300));
    const img = part.inlineData || part.inline_data;
    save(job.file, img.mimeType || img.mime_type, img.data);
}

let ok = 0;
for (const job of jobs) {
    process.stdout.write(`${job.file} ... `);
    try { await generate(job); ok++; console.log('fatto'); }
    catch (e) { console.log('ERRORE ' + e.message); }
}
console.log(`\n${ok}/${jobs.length} immagini generate.`);
