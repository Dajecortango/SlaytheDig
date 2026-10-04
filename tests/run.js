// Test automatici del gioco, senza npm: node tests/run.js
// Ogni file tests/*.test.js esporta una funzione (t, carica) che registra i test con t.test().
// Ogni file riceve un gioco caricato da zero (carica() di tests/ambiente.js).
// Esce con codice 1 se un test fallisce (lo usa il controllo prima del commit, .githooks/pre-commit).
const fs = require('fs');
const path = require('path');
const { carica } = require('./ambiente');

let passati = 0, falliti = 0, avvisi = 0;

class Fallito extends Error {}

function creaT(file) {
    const tests = [];
    const t = {
        test: (nome, fn) => tests.push({ nome, fn }),
        ok: (cond, msg) => { if (!cond) throw new Fallito(msg || 'condizione falsa'); },
        uguale: (atteso, reale, msg) => {
            const a = JSON.stringify(atteso), r = JSON.stringify(reale);
            if (a !== r) throw new Fallito(`${msg ? msg + ': ' : ''}atteso ${a}, trovato ${r}`);
        },
        avviso: msg => { avvisi++; console.log(`   ⚠ ${msg}`); }
    };
    return { t, tests };
}

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js')).sort();
for (const file of files) {
    console.log(`\n${file}`);
    const { t, tests } = creaT(file);
    try {
        require(path.join(__dirname, file))(t, carica);
    } catch (err) {
        falliti++;
        console.log(`  ✗ il file non si carica: ${err.stack || err}`);
        continue;
    }
    for (const { nome, fn } of tests) {
        try {
            fn();
            passati++;
            console.log(`  ✓ ${nome}`);
        } catch (err) {
            falliti++;
            console.log(`  ✗ ${nome}\n      ${err instanceof Fallito ? err.message : (err.stack || err)}`);
        }
    }
}

console.log(`\n${passati} passati, ${falliti} falliti${avvisi ? `, ${avvisi} avvisi` : ''}`);
process.exit(falliti ? 1 : 0);
