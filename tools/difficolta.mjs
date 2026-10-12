// Difficoltà vera di una campagna: quanto vince un giocatore attento e quanto un giocatore quasi ottimo.
// Uso (dalla cartella del progetto):
//   node tools/difficolta.mjs                          tutte le campagne
//   node tools/difficolta.mjs astarte_ch1 astarte_ch2  solo queste
// Opzioni:
//   --eroi "Icaro,Astarte"   compagnia da provare (altrimenti i primi eroi della campagna, fino a 5)
//   --partite N              partite del profilo con ricerca (40); quelle dell'Esperto sono 10 volte tante
//   --prove K                partite simulate per ogni scelta della ricerca (8): più alto = più forte e più lento
//   --senza-ricerca          solo l'Esperto (veloce)
// Tre misure, con il margine d'errore al 95%:
//   1. Esperto con la prima abilità e il primo oggetto iniziale di ogni eroe (come tests/difficolta.test.js)
//   2. Esperto con le scelte iniziali migliori (simBestStart: un giro per eroe su abilità e oggetto, 60 partite per prova)
//   3. Esperto con ricerca a simulazioni (simLookaheadProfile): ai bivi e davanti alle prove prova ogni
//      scelta con K partite e tiene la migliore. È il limite alto: un giocatore bravo sta fra la 2 e la 3.
// L'obiettivo della campagna (campo "difficolta") va confrontato con la 2 e la 3, non con la media dei profili.
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { carica } = require(path.join(ROOT, 'tests', 'ambiente.js'));

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const PARTITE = parseInt(opt('--partite', '40'), 10);
const PROVE = parseInt(opt('--prove', '8'), 10);
const SENZA_RICERCA = args.includes('--senza-ricerca');
const EROI = opt('--eroi', null);
const valori = new Set(['--partite', '--prove', '--eroi'].map(n => opt(n, null)).filter(Boolean));
const ids = args.filter(a => !a.startsWith('--') && !valori.has(a));

const g = carica();
const ESPERTO = g.eval('SIM_PROFILES').esperto;

// Vittorie in percentuale con il margine d'errore al 95% (approssimazione normale)
const esito = (vinte, n) => {
    const p = vinte / n;
    const margine = 1.96 * Math.sqrt(p * (1 - p) / n);
    return `${Math.round(p * 100)}% ± ${Math.round(margine * 100)} (${vinte}/${n})`;
};

function partite(campaignId, sel, profile, n) {
    const data = g.simCampaignData(campaignId);
    let vinte = 0;
    for (let i = 0; i < n; i++) if (g.simRunOne(data, sel, profile).victory) vinte++;
    return vinte;
}

for (const id of ids.length ? ids : Object.keys(g.CAMPAIGNS)) {
    if (!g.CAMPAIGNS[id]) { console.log(`${id}: campagna sconosciuta`); continue; }
    const data = g.simCampaignData(id);
    const nomi = EROI ? EROI.split(',').map(s => s.trim()) : data.heroes.slice(0, 5).map(h => h.name);
    const ignoti = nomi.filter(n => !data.heroes.some(h => h.name === n));
    if (ignoti.length) { console.log(`${id}: eroi sconosciuti ${ignoti.join(', ')}`); continue; }
    const sel = nomi.map(name => ({ name, abilityIdx: 0, itemIdx: data.armory.length ? 0 : -1 }));
    const d = g.CAMPAIGNS[id].difficolta;
    console.log(`\n${id} — ${nomi.join(', ')}${d ? ` — obiettivo ${d.vittoriaMin ?? 0}–${d.vittoriaMax ?? 100}%` : ''}`);

    const t0 = Date.now();
    const nEsperto = PARTITE * 10;
    const vinte1 = partite(id, sel, ESPERTO, nEsperto);
    console.log(`  1. Esperto, prime scelte iniziali:    ${esito(vinte1, nEsperto)}`);

    const migliori = g.simBestStart(data, sel, ESPERTO, 60);
    const scelte = migliori.map(s => {
        const ab = (data.abilities[s.name] || [])[s.abilityIdx];
        const it = data.armory[s.itemIdx];
        return `${s.name}: ${ab ? ab.name : '—'} + ${it ? it.name : '—'}`;
    }).join('; ');
    const vinte2 = partite(id, migliori, ESPERTO, nEsperto);
    console.log(`  2. Esperto, scelte iniziali migliori: ${esito(vinte2, nEsperto)}`);
    console.log(`     (${scelte})`);
    // La ricerca delle scelte iniziali ha poche partite per prova: se per caso ha peggiorato, si tengono le prime
    const iniziali = vinte2 >= vinte1 ? migliori : sel;

    if (!SENZA_RICERCA) {
        const ricerca = g.simLookaheadProfile(ESPERTO, PROVE);
        console.log(`  3. Esperto con ricerca (${PROVE} prove):  ${esito(partite(id, iniziali, ricerca, PARTITE), PARTITE)}`);
    }
    console.log(`     ${Math.round((Date.now() - t0) / 1000)} s`);
}
