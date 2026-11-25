// Prepara la versione del gioco da dare agli amici: una cartella con "Slay the Dig.exe" e il gioco accanto,
// e lo stesso contenuto in un file .zip da mandare.
// Uso (dalla cartella del progetto, su Windows):
//   node tools/crea_eseguibile.mjs              cartella e .zip in dist/
//   node tools/crea_eseguibile.mjs --senza-zip  solo la cartella
//   node tools/crea_eseguibile.mjs --tutte      tiene anche le campagne di prova (di norma tolte: ESCLUSE qui sotto)
// L'eseguibile (tools/eseguibile/Avvio.cs) è un piccolo programma che apre gioco/index.html in una finestra di
// Edge o Chrome senza barre: si compila con csc.exe di .NET Framework, che Windows ha già. Niente da installare,
// né qui né sul PC di chi gioca. La partita online (server/) non è compresa: serve Node.js.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOME = 'Slay the Dig';
const DIST = path.join(ROOT, 'dist');
const CARTELLA = path.join(DIST, NOME);
const GIOCO = path.join(CARTELLA, 'gioco');
// Ciò che serve al gioco e all'editor aperti da file://
const DA_COPIARE = ['index.html', 'editor.html', 'favicon.svg', 'css', 'js', 'data', 'immagini', 'audio', 'video', 'fonts'];
// Campagne di prova, da non dare ai giocatori
const ESCLUSE = process.argv.includes('--tutte') ? [] : [];

fs.rmSync(CARTELLA, { recursive: true, force: true });
fs.mkdirSync(GIOCO, { recursive: true });
for (const nome of DA_COPIARE) {
    const da = path.join(ROOT, nome);
    if (fs.existsSync(da)) fs.cpSync(da, path.join(GIOCO, nome), { recursive: true });
}

// Campagne escluse: via il file e il suo <script> dalle due pagine
for (const id of ESCLUSE) {
    fs.rmSync(path.join(GIOCO, 'data', 'campagne', `${id}.js`), { force: true });
    for (const pagina of ['index.html', 'editor.html']) {
        const file = path.join(GIOCO, pagina);
        const testo = fs.readFileSync(file, 'utf8');
        const senza = testo.split(/\r?\n/).filter(riga => !riga.includes(`data/campagne/${id}.js`)).join('\n');
        if (senza === testo.replace(/\r\n/g, '\n')) console.log(`Attenzione: ${pagina} non richiama ${id}`);
        fs.writeFileSync(file, senza);
    }
}

// Eseguibile: csc.exe di .NET Framework 4 (64 bit, altrimenti 32)
const NET = path.join(process.env.WINDIR || 'C:\\Windows', 'Microsoft.NET');
const csc = ['Framework64', 'Framework'].map(f => path.join(NET, f, 'v4.0.30319', 'csc.exe')).find(p => fs.existsSync(p));
if (!csc) { console.error('csc.exe non trovato: serve .NET Framework 4 (presente in Windows 10 e 11).'); process.exit(1); }
const exe = path.join(CARTELLA, `${NOME}.exe`);
const icona = path.join(ROOT, 'tools', 'eseguibile', 'gioco.ico');
execFileSync(csc, ['/nologo', '/target:winexe', '/optimize+', '/platform:anycpu', `/out:${exe}`,
    ...(fs.existsSync(icona) ? [`/win32icon:${icona}`] : []),
    '/reference:System.Windows.Forms.dll', path.join(ROOT, 'tools', 'eseguibile', 'Avvio.cs')], { stdio: 'inherit' });

fs.writeFileSync(path.join(CARTELLA, 'LEGGIMI.txt'), [
    'SLAY THE DIG',
    '',
    'Per giocare: doppio clic su "Slay the Dig.exe".',
    'Il gioco si apre in una finestra sua. Serve Windows 10 o 11 (usa Edge o Chrome, già presenti).',
    '',
    'Alla prima apertura Windows può mostrare l\'avviso "PC protetto da Windows":',
    'premi "Ulteriori informazioni" e poi "Esegui comunque". Succede con i programmi non firmati.',
    '',
    'Non spostare l\'eseguibile fuori da questa cartella: ha bisogno della cartella "gioco" accanto.',
    'Salvataggi e progressi restano sul PC anche se sposti la cartella o scarichi una versione nuova.',
    '',
    'Si comincia da "Un brusco risveglio" (il tutorial) e da Caccia alla Bestia.',
    'Finendo i capitoli si aprono i successivi, poi Fredlös e Loch Ein, e nuovi eroi per il Drakengrad.',
    ''
].join('\r\n'));

const mb = dir => {
    let tot = 0;
    const giro = d => fs.readdirSync(d, { withFileTypes: true }).forEach(e => { const p = path.join(d, e.name); if (e.isDirectory()) giro(p); else tot += fs.statSync(p).size; });
    giro(dir);
    return (tot / 1048576).toFixed(0);
};
console.log(`Cartella pronta: ${CARTELLA} (${mb(CARTELLA)} MB)`);

if (!process.argv.includes('--senza-zip')) {
    const zip = path.join(DIST, `${NOME}.zip`);
    fs.rmSync(zip, { force: true });
    // tar di Windows (bsdtar) scrive anche i .zip: più veloce di Compress-Archive e senza limiti di dimensione
    execFileSync(path.join(process.env.WINDIR || 'C:\\Windows', 'System32', 'tar.exe'), ['-a', '-c', '-f', zip, '-C', DIST, NOME], { stdio: 'inherit' });
    console.log(`Zip pronto: ${zip} (${(fs.statSync(zip).size / 1048576).toFixed(0)} MB)`);
}
