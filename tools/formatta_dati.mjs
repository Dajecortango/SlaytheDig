// Riscrive i file dei dati (librerie, azioni degli elite, campagne) nel formato dell'editor, così il prossimo
// "Salva nel progetto" cambia solo le righe modificate davvero (diff piccoli e leggibili).
// Usa le stesse funzioni dell'editor (formatJson, libraryFileText, campaignFileText in js/editor/progetto.js)
// e controlla che il contenuto resti identico: cambia solo l'impaginazione.
// Uso (dalla cartella del progetto):
//   node tools/formatta_dati.mjs            mostra quali file cambierebbero
//   node tools/formatta_dati.mjs --applica  li riscrive
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPLY = process.argv.includes('--applica');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// Funzioni di impaginazione dell'editor, caricate senza il resto della pagina
const ed = { console };
vm.createContext(ed);
vm.runInContext(read('js/editor/progetto.js') + '\n;this.libraryFileText = libraryFileText; this.campaignFileText = campaignFileText; this.LIB_KINDS = LIB_KINDS; this.libraryFilePath = libraryFilePath;', ed);

// Dati di un file .js (window.LIBRERIA / window.CAMPAIGNS)
function load(file) {
    const ctx = { window: {}, console };
    ctx.window.window = ctx.window;
    vm.createContext(ctx);
    vm.runInContext(read(file), ctx);
    return ctx.window;
}

let changed = 0;
function check(file, text, same) {
    const before = read(file).replace(/\r\n/g, '\n');
    if (!same) { console.log(`ATTENZIONE ${file}: il contenuto cambierebbe, saltato`); return; }
    if (before === text) return;
    changed++;
    console.log(`${APPLY ? 'riscritto' : 'da riscrivere'}  ${file}`);
    if (APPLY) fs.writeFileSync(path.join(ROOT, file), text, 'utf8');
}

// Il contenuto dopo l'impaginazione deve essere lo stesso (stessi dati, stesso ordine delle chiavi)
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

for (const kind of ed.LIB_KINDS) {
    const file = ed.libraryFilePath(kind);
    const lib = load(file).LIBRERIA;
    vm.runInContext('lib = this.__lib;', Object.assign(ed, { __lib: lib }));
    const text = ed.libraryFileText(kind);
    const after = (() => { const ctx = { window: {} }; ctx.window.window = ctx.window; vm.createContext(ctx); vm.runInContext(text, ctx); return ctx.window.LIBRERIA; })();
    check(file, text, same(lib[kind], after[kind]) && (kind !== 'armeria' || same(lib.lootPredefinito, after.lootPredefinito)));
}

for (const name of fs.readdirSync(path.join(ROOT, 'data/campagne')).filter(f => f.endsWith('.js'))) {
    const file = `data/campagne/${name}`;
    const camps = load(file).CAMPAIGNS;
    const [id] = Object.keys(camps);
    vm.runInContext('camp = this.__camp;', Object.assign(ed, { __camp: camps[id] }));
    const text = ed.campaignFileText();
    const after = (() => { const ctx = { window: {} }; ctx.window.window = ctx.window; vm.createContext(ctx); vm.runInContext(text, ctx); return ctx.window.CAMPAIGNS[id]; })();
    check(file, text, same(camps[id], after));
}

console.log(`\n${changed} file ${APPLY ? 'riscritti' : 'da riscrivere'}.${!APPLY && changed ? ' Aggiungi --applica per riscriverli.' : ''}`);
