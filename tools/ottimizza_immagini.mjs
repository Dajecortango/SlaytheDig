// Riduce e comprime le immagini del gioco (niente librerie da installare: usa System.Drawing di Windows).
// Uso (dalla cartella del progetto):
//   node tools/ottimizza_immagini.mjs              mostra cosa cambierebbe e quanto si risparmia, senza toccare niente
//   node tools/ottimizza_immagini.mjs --applica    riscrive le immagini
//   aggiungere --max 1600 per il lato massimo (predefinito 1600 px) e --qualita 82 per i JPG (predefinito 82)
// Regole: JPG/JFIF con il lato più lungo oltre il massimo vengono rimpiccioliti e tutti i JPG vengono
// ricompressi; un file si riscrive solo se diventa almeno il 15% più leggero. I PNG (trasparenze
// dell'interfaccia) si rimpiccioliscono solo se superano il massimo, senza ricomprimerli.
// Le immagini originali restano nella cronologia di git.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const value = (n, d) => { const i = args.indexOf(n); return i >= 0 ? Number(args[i + 1]) : d; };
const APPLY = args.includes('--applica');
const MAX = value('--max', 1600);
const QUALITY = value('--qualita', 82);
const MIN_GAIN = 0.15;
// Immagini usate con border-image: il taglio (es. --frame-slice: 150) è in pixel dell'immagine,
// quindi non si rimpiccioliscono (si ricomprimono soltanto)
const NON_RIDIMENSIONARE = ['immagini/ui/console_wc3.jpg', 'immagini/ui/bottone_menu.png', 'immagini/ui/targa_barra_web.png'];
const rel = f => path.relative(ROOT, f).replace(/\\/g, '/');

function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) return e.name === 'segnaposto' ? [] : walk(p);
        return /\.(jpe?g|jfif|png)$/i.test(e.name) ? [p] : [];
    });
}

const files = walk(path.join(ROOT, 'immagini'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ottimizza-'));
const listFile = path.join(tmp, 'elenco.txt');
// Una riga per file: percorso e lato massimo, separati da una tabulazione
fs.writeFileSync(listFile, files.map(f => `${f}\t${NON_RIDIMENSIONARE.includes(rel(f)) ? 1e9 : MAX}`).join('\n'), 'utf8');

// Per ogni file: dimensioni, eventuale versione ridotta/ricompressa in tmp, dimensione nuova
const ps = `
Add-Type -AssemblyName System.Drawing
$jpg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$par = New-Object System.Drawing.Imaging.EncoderParameters 1
$par.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]${QUALITY})
$i = 0
foreach ($row in [System.IO.File]::ReadAllLines('${listFile.replace(/'/g, "''")}')) {
    $i++
    $f, $max = $row.Split([char]9)
    $img = [System.Drawing.Image]::FromFile($f)
    $w = $img.Width; $h = $img.Height
    $scale = [Math]::Min(1.0, [double]$max / [Math]::Max($w, $h))
    $isPng = $f.ToLower().EndsWith('.png')
    $out = ''
    if (-not $isPng -or $scale -lt 1) {
        $nw = [int][Math]::Round($w * $scale); $nh = [int][Math]::Round($h * $scale)
        $bmp = New-Object System.Drawing.Bitmap $nw, $nh
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = 'HighQualityBicubic'; $g.PixelOffsetMode = 'HighQuality'; $g.CompositingQuality = 'HighQuality'
        $g.DrawImage($img, 0, 0, $nw, $nh)
        $out = Join-Path '${tmp.replace(/'/g, "''")}' ("$i" + [System.IO.Path]::GetExtension($f))
        if ($isPng) { $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png) } else { $bmp.Save($out, $jpg, $par) }
        $g.Dispose(); $bmp.Dispose()
        $nw2 = $nw; $nh2 = $nh
    } else { $nw2 = $w; $nh2 = $h }
    $img.Dispose()
    $size = (Get-Item -LiteralPath $f).Length
    $newSize = if ($out) { (Get-Item -LiteralPath $out).Length } else { $size }
    $line = ("{0}|{1}|{2}|{3}|{4}|{5}|{6}|{7}" -f $f, $w, $h, $nw2, $nh2, $size, $newSize, $out)
    Write-Output $line
}
`;
const output = execFileSync('powershell', ['-NoProfile', '-Command', ps], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

let before = 0, after = 0, changed = 0;
const kb = n => `${Math.round(n / 1024)} KB`;
for (const line of output.split(/\r?\n/).filter(Boolean)) {
    const [file, w, h, nw, nh, size, newSize, out] = line.split('|');
    const s = Number(size), ns = Number(newSize);
    before += s;
    const gain = out ? 1 - ns / s : 0;
    if (!out || gain < MIN_GAIN) { after += s; continue; }
    after += ns;
    changed++;
    const resized = w !== nw ? ` ${w}×${h} → ${nw}×${nh},` : '';
    console.log(`${APPLY ? 'riscritta' : 'da ridurre'}  ${rel(file)}:${resized} ${kb(s)} → ${kb(ns)} (-${Math.round(gain * 100)}%)`);
    if (APPLY) fs.copyFileSync(out, file);
}
fs.rmSync(tmp, { recursive: true, force: true });

console.log(`\n${files.length} immagini, ${changed} ${APPLY ? 'riscritte' : 'da ridurre'}: ${kb(before)} → ${kb(after)} (-${Math.round((1 - after / before) * 100)}%)`);
if (!APPLY && changed) console.log('Aggiungi --applica per riscriverle.');
