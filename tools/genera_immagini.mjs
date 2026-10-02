// Genera le immagini mancanti del gioco con Gemini 2.5 Flash Image ("nano banana").
// Uso (dalla cartella del progetto):
//   node tools/genera_immagini.mjs                    elenca i lavori e dice quali file mancano
//   node tools/genera_immagini.mjs --solo predoni     genera solo i lavori il cui file contiene "predoni"
//   node tools/genera_immagini.mjs --gruppo bestiario genera un gruppo (bestiario, nodi, schermate, ui)
//   node tools/genera_immagini.mjs --tutte            genera tutti i file che mancano
//   aggiungere --forza per rigenerare anche i file che esistono già
// La chiave API si legge da GEMINI_API_KEY oppure dal file tools/chiave_gemini.txt (ignorato da git).
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

function apiKey() {
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
    const f = path.join(ROOT, 'tools/chiave_gemini.txt');
    if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8').trim();
    console.error('Chiave mancante: imposta GEMINI_API_KEY o scrivi la chiave in tools/chiave_gemini.txt');
    process.exit(1);
}
const key = apiKey();

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.jfif': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
function refPart(file) {
    return { inline_data: { mime_type: MIME[path.extname(file).toLowerCase()] || 'image/jpeg', data: fs.readFileSync(path.join(ROOT, file)).toString('base64') } };
}

// Salva nel formato chiesto dall'estensione del file: Gemini risponde in PNG, la conversione
// in JPG passa da System.Drawing di Windows (niente librerie da installare).
function save(file, mime, b64) {
    const out = path.join(ROOT, file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const ext = path.extname(file).toLowerCase();
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

async function generate(job) {
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
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
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
