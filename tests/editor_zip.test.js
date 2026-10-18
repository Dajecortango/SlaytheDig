// "Scarica .zip" dell'editor: "Tutto il progetto" prende ogni file tranne .git e quello che .gitignore esclude,
// e lo .zip scritto a mano si legge con zlib (crc giusti, nomi, contenuti)
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execFileSync } = require('child_process');
const { caricaPagina, ROOT } = require('./ambiente');

module.exports = (t) => {
    const ed = caricaPagina('editor.html');
    const regole = ed.gitignoreRules(fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8'));

    t.test('Tutto il progetto: esclude .git, chiavi, lore e archivi; tiene il gioco', () => {
        ['.git/HEAD', 'lore/riassunti/x.md', 'tools/chiave_gemini.txt', 'tools/ngrok/ngrok.exe', 'warcraft3_icons/a/b.png',
            'sorgenti/ui/catena.png', 'tools/browser-profile/Default/x', 'prova.tmp', '_tprova.html', 'tools/prova_browser.png', '.claude/settings.json']
            .forEach(p => t.ok(ed.zipIgnored(regole, p), `escluso: ${p}`));
        ['index.html', 'editor.html', 'js/game.js', 'data/campagne/drakengrad.js', 'immagini/icone/BTNFrostArmor.png', 'audio/temi/x.ogg',
            'tools/scontro.mjs', '.gitignore', 'server/server.js']
            .forEach(p => t.ok(!ed.zipIgnored(regole, p), `incluso: ${p}`));
    });

    // Il runner è sincrono e buildZip è async: lo .zip si costruisce in un processo a parte
    t.test('lo .zip si legge: nomi, crc, date e contenuti', () => {
        const script = `const { caricaPagina } = require(${JSON.stringify(path.join(__dirname, 'ambiente.js'))});
            const ed = caricaPagina('editor.html'); ed.Blob = Blob; ed.TextEncoder = TextEncoder;
            ed.buildZip([['a.txt', 'ciao'], ['cartella/è.js', 'x = 1;']])
                .then(b => b.arrayBuffer()).then(a => process.stdout.write(Buffer.from(a).toString('base64')));`;
        const buf = Buffer.from(execFileSync(process.execPath, ['-e', script], { encoding: 'utf8' }), 'base64');
        const voci = [];
        let off = 0;
        while (buf.readUInt32LE(off) === 0x04034b50) {
            const crc = buf.readUInt32LE(off + 14), size = buf.readUInt32LE(off + 18), n = buf.readUInt16LE(off + 26);
            const nome = buf.slice(off + 30, off + 30 + n).toString('utf8');
            const dati = buf.slice(off + 30 + n, off + 30 + n + size);
            if (zlib.crc32) t.uguale(zlib.crc32(dati), crc, `crc di ${nome}`);
            t.ok(buf.readUInt16LE(off + 12) > 0, 'data impostata');
            voci.push([nome, dati.toString('utf8')]);
            off += 30 + n + size;
        }
        t.uguale([['a.txt', 'ciao'], ['cartella/è.js', 'x = 1;']], voci);
        t.uguale(0x02014b50, buf.readUInt32LE(off), 'indice centrale dopo i file');
        t.uguale(2, buf.readUInt16LE(buf.length - 12), 'voci nell\'indice');
    });
};
