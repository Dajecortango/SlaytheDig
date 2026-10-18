// Comprime musica, suoni e video del gioco (serve ffmpeg nel PATH, con ffprobe).
// Uso (dalla cartella del progetto):
//   node tools/ottimizza_media.mjs              mostra cosa cambierebbe e quanto si risparmia, senza toccare niente
//   node tools/ottimizza_media.mjs --applica    riscrive i file
// Regole:
//   audio (.ogg in audio/): Ogg Opus stereo, 32 kbps per la musica di audio/temi/ (THEME_KBPS) e 48 kbps
//     per gli effetti (AUDIO_KBPS), se oggi è sopra; il volume non cambia (i temi sono già normalizzati
//     a -15 LUFS). Un brano nuovo si converte direttamente così:
//     ffmpeg -i brano.m4a -af loudnorm=I=-15:TP=-1.5:LRA=11 -ar 48000 -c:a libopus -b:a 32k audio/temi/x.ogg
//   video (.mp4 in video/): H.264 senza audio (i video del gioco sono muti), avvio rapido (faststart);
//     i video dei nemici (riquadro della scena) al massimo 540p con CRF 30, gli altri (sfondo dei menu,
//     a tutto schermo) 720p con CRF 28. Regola per i video nuovi dei nemici: 540p, circa 10 secondi, sotto 1 MB.
// Un file si riscrive solo se diventa almeno il 15% più leggero. Prima di riscriverlo l'originale si copia
// in sorgenti/media/ (fuori da git), così si può rifare la conversione partendo dalla qualità piena.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPLY = process.argv.includes('--applica');
const AUDIO_KBPS = 48;
const THEME_KBPS = 32;
const VIDEO_MAX_H = 720;
const VIDEO_CRF = 28;
const ENEMY_VIDEO_MAX_H = 540;
const ENEMY_VIDEO_CRF = 30;
const MIN_GAIN = 0.15;
const rel = f => path.relative(ROOT, f).replace(/\\/g, '/');

function walk(dir, ext) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
        const p = path.join(dir, d.name);
        return d.isDirectory() ? walk(p, ext) : (p.toLowerCase().endsWith(ext) ? [p] : []);
    });
}

function probe(file) {
    const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,bit_rate,height:format=bit_rate', '-of', 'json', file]);
    return JSON.parse(out.toString());
}

function convert(file, ffArgs) {
    const tmp = path.join(os.tmpdir(), `media_${process.pid}_${path.basename(file)}`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', file, ...ffArgs, tmp]);
    return tmp;
}

const jobs = [];
for (const file of walk(path.join(ROOT, 'audio'), '.ogg')) {
    const info = probe(file);
    const kbps = Number(info.format.bit_rate || 0) / 1000;
    const target = rel(file).startsWith('audio/temi/') ? THEME_KBPS : AUDIO_KBPS;
    if (kbps <= target * 1.15) continue;
    jobs.push({ file, what: `${Math.round(kbps)} kbps -> ${target} kbps`, args: ['-c:a', 'libopus', '-b:a', `${target}k`, '-ar', '48000'] });
}
for (const file of walk(path.join(ROOT, 'video'), '.mp4')) {
    const info = probe(file);
    const v = info.streams.find(s => s.codec_type === 'video') || {};
    const enemy = rel(file).startsWith('video/nemici/');
    const maxH = enemy ? ENEMY_VIDEO_MAX_H : VIDEO_MAX_H, crf = enemy ? ENEMY_VIDEO_CRF : VIDEO_CRF;
    jobs.push({ file, what: `${v.height || '?'}p -> CRF ${crf}, max ${maxH}p, senza audio`,
        args: ['-an', '-vf', `scale=-2:'min(${maxH},ih)'`, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart'] });
}

let saved = 0;
for (const job of jobs) {
    const before = fs.statSync(job.file).size;
    const tmp = convert(job.file, job.args);
    const after = fs.statSync(tmp).size;
    const gain = 1 - after / before;
    const kb = n => `${Math.round(n / 1024)} KB`;
    if (gain < MIN_GAIN) {
        fs.unlinkSync(tmp);
        console.log(`  = ${rel(job.file)}: ${kb(before)}, guadagno troppo piccolo (${Math.round(gain * 100)}%)`);
        continue;
    }
    saved += before - after;
    console.log(`  ${APPLY ? '✓' : '→'} ${rel(job.file)}: ${kb(before)} -> ${kb(after)} (-${Math.round(gain * 100)}%) ${job.what}`);
    if (APPLY) {
        // L'originale va in sorgenti/media/ (se non c'è già: la prima copia è quella di qualità piena)
        const backup = path.join(ROOT, 'sorgenti', 'media', rel(job.file));
        if (!fs.existsSync(backup)) { fs.mkdirSync(path.dirname(backup), { recursive: true }); fs.copyFileSync(job.file, backup); }
        fs.copyFileSync(tmp, job.file);
    }
    fs.unlinkSync(tmp);
}
console.log(`${APPLY ? 'Risparmiati' : 'Si risparmierebbero'} ${(saved / 1048576).toFixed(1)} MB.${APPLY ? '' : ' Per applicare: --applica'}`);
