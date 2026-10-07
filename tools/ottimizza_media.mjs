// Comprime musica, suoni e video del gioco (serve ffmpeg nel PATH, con ffprobe).
// Uso (dalla cartella del progetto):
//   node tools/ottimizza_media.mjs              mostra cosa cambierebbe e quanto si risparmia, senza toccare niente
//   node tools/ottimizza_media.mjs --applica    riscrive i file
// Regole:
//   audio (.ogg in audio/): Ogg Opus a 64 kbps stereo (AUDIO_KBPS), se oggi è sopra; il volume non cambia
//     (i temi sono già normalizzati a -15 LUFS). Un brano nuovo si converte direttamente così:
//     ffmpeg -i brano.m4a -af loudnorm=I=-15:TP=-1.5:LRA=11 -ar 48000 -c:a libopus -b:a 64k audio/temi/x.ogg
//   video (.mp4 in video/): H.264 al massimo 720p (VIDEO_MAX_H), CRF 28, senza audio (i video del gioco
//     sono muti), avvio rapido (faststart). Regola per i video nuovi: 720p, circa 10 secondi, sotto 2 MB.
// Un file si riscrive solo se diventa almeno il 15% più leggero. Gli originali restano nella cronologia di git.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPLY = process.argv.includes('--applica');
const AUDIO_KBPS = 64;
const VIDEO_MAX_H = 720;
const VIDEO_CRF = 28;
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
    if (kbps <= AUDIO_KBPS * 1.15) continue;
    jobs.push({ file, what: `${Math.round(kbps)} kbps -> ${AUDIO_KBPS} kbps`, args: ['-c:a', 'libopus', '-b:a', `${AUDIO_KBPS}k`, '-ar', '48000'] });
}
for (const file of walk(path.join(ROOT, 'video'), '.mp4')) {
    const info = probe(file);
    const v = info.streams.find(s => s.codec_type === 'video') || {};
    jobs.push({ file, what: `${v.height || '?'}p -> CRF ${VIDEO_CRF}, max ${VIDEO_MAX_H}p, senza audio`,
        args: ['-an', '-vf', `scale=-2:'min(${VIDEO_MAX_H},ih)'`, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(VIDEO_CRF), '-pix_fmt', 'yuv420p', '-movflags', '+faststart'] });
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
    if (APPLY) fs.copyFileSync(tmp, job.file);
    fs.unlinkSync(tmp);
}
console.log(`${APPLY ? 'Risparmiati' : 'Si risparmierebbero'} ${(saved / 1048576).toFixed(1)} MB.${APPLY ? '' : ' Per applicare: --applica'}`);
