// Prova di un singolo scontro: un nemico del bestiario contro una compagnia scelta, giocata
// dall'Esperto del simulatore per N partite. Serve a bilanciare elite e boss senza giocare
// un capitolo intero: vittorie, round medi e HP persi dicono se le meccaniche mordono.
// Un boss "lungo" sta sugli 8-12 round: se l'Esperto chiude in 4, le fasi non stanno mordendo.
//
// Uso (dalla cartella del progetto):
//   node tools/scontro.mjs <nemico> [altri nemici...]      id del bestiario (senza id: elenca elite e boss)
// Opzioni:
//   --eroi "enea_dignitas,curio_dignitas"   compagnia (id della libreria Eroi; senza: errore con l'elenco)
//   --abilita "enea_dignitas=enea_scudo_del_nord,curio_dignitas=dente_per_dente"
//                                           abilità scelta per eroe (id della libreria Abilità; senza: la prima)
//   --oggetti "curio_dignitas=spada_lunga+pozione_cura,tutti=pozione_cura"
//                                           oggetti nello zaino (id dell'armeria, "+" li separa; "tutti" = a ogni eroe)
//   --partite N                             partite per nemico (500)
//   --seme S                                seme di partenza (1): ogni partita usa seme S+i, la prova si ripete uguale
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { carica } = require(path.join(ROOT, 'tests', 'ambiente.js'));

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const PARTITE = parseInt(opt('--partite', '500'), 10);
const SEME = parseInt(opt('--seme', '1'), 10);
const EROI = opt('--eroi', null);
const ABILITA = opt('--abilita', '');
const OGGETTI = opt('--oggetti', '');
const valori = new Set(['--partite', '--seme', '--eroi', '--abilita', '--oggetti'].map(n => opt(n, null)).filter(Boolean));
const nemici = args.filter(a => !a.startsWith('--') && !valori.has(a));

const g = carica();
const LIB = g.LIBRERIA;
const ESPERTO = g.eval('SIM_PROFILES').esperto;
const stato = g.eval('stato');

// "a=x,b=y" -> { a: 'x', b: 'y' }
function mappa(testo) {
    const out = {};
    testo.split(',').map(s => s.trim()).filter(Boolean).forEach(coppia => {
        const [k, v] = coppia.split('=').map(s => s.trim());
        if (k && v) out[k] = v;
    });
    return out;
}

function esci(msg) { console.error(msg); process.exit(2); }

// Senza nemici: elenco di elite e boss (nemici con fasi) e dei normali, poi esce
if (!nemici.length) {
    const tutti = Object.entries(LIB.bestiario);
    const eliti = tutti.filter(([, e]) => Array.isArray(e.fasi) && e.fasi.length);
    console.log('Indica uno o più nemici del bestiario. Con fasi (elite e boss):');
    eliti.forEach(([id, e]) => console.log(`  ${id} — ${e.name} (HP ${e.maxHp} · CA ${e.ca} · Att ${e.att} · Danno ${e.dmg} · ${e.fasi.length} fasi)`));
    console.log('Normali: ' + tutti.filter(([, e]) => !e.fasi || !e.fasi.length).map(([id]) => id).join(', '));
    process.exit(0);
}

if (!EROI) esci('Indica la compagnia con --eroi "id1,id2". Eroi della libreria: ' + Object.keys(LIB.eroi).join(', '));
const idEroi = EROI.split(',').map(s => s.trim()).filter(Boolean);
const ignoti = idEroi.filter(id => !LIB.eroi[id]);
if (ignoti.length) esci('Eroi sconosciuti: ' + ignoti.join(', ') + '. Eroi della libreria: ' + Object.keys(LIB.eroi).join(', '));

const sceltaAbilita = mappa(ABILITA);
const sceltaOggetti = mappa(OGGETTI);
for (const id of Object.keys(sceltaAbilita)) if (!idEroi.includes(id)) esci(`--abilita: "${id}" non è fra gli eroi scelti`);
for (const id of Object.keys(sceltaOggetti)) if (id !== 'tutti' && !idEroi.includes(id)) esci(`--oggetti: "${id}" non è fra gli eroi scelti`);

// Dati come li prepara js/libreria.js: abilità degli eroi risolte dalla libreria per id
const abilitaDi = h => (h.abilities || []).map(id => ({ id, ...(LIB.abilita[id] || { name: id }) }));
function datiCompagnia() {
    const heroes = idEroi.map(id => {
        const { abilities, ...hero } = JSON.parse(JSON.stringify(LIB.eroi[id]));
        hero.__libId = id;
        return hero;
    });
    const abilities = {};
    idEroi.forEach(id => { abilities[LIB.eroi[id].name] = abilitaDi(LIB.eroi[id]); });
    return { heroes, abilities, armory: [] };
}

function oggettiPer(idEroe) {
    const voci = [sceltaOggetti.tutti, sceltaOggetti[idEroe]].filter(Boolean).flatMap(s => s.split('+'));
    return voci.map(s => s.trim()).filter(Boolean).map(idOgg => {
        if (!LIB.armeria[idOgg]) esci(`--oggetti: "${idOgg}" non è nell'armeria. Oggetti: ${Object.keys(LIB.armeria).join(', ')}`);
        return JSON.parse(JSON.stringify(LIB.armeria[idOgg]));
    });
}

// Compagnia nuova per ogni partita: abilità scelta (o la prima), abilità fisse, oggetti indicati
function costruisciParty(dati) {
    stato.party = idEroi.map(idEroe => {
        const nome = LIB.eroi[idEroe].name;
        const lista = dati.abilities[nome] || [];
        let idx = lista.length ? 0 : null;
        if (sceltaAbilita[idEroe]) {
            idx = lista.findIndex(a => a.id === sceltaAbilita[idEroe]);
            if (idx < 0) esci(`--abilita: "${sceltaAbilita[idEroe]}" non è fra le abilità di ${nome} (${lista.map(a => a.id).join(', ') || 'nessuna'})`);
        }
        const hero = g.simBuildHero(dati, nome, idx, null);
        oggettiPer(idEroe).forEach(it => { hero.items.push(it); });
        return hero;
    });
}

const f = x => x.toFixed(1);
const dati = datiCompagnia();
console.log(`Compagnia: ${idEroi.map(id => LIB.eroi[id].name).join(', ')} — Esperto, ${PARTITE} partite per nemico, seme ${SEME}`);

for (const idNemico of nemici) {
    const nemico = LIB.bestiario[idNemico];
    if (!nemico) { console.log(`\n${idNemico}: non è nel bestiario`); continue; }
    const conFasi = Array.isArray(nemico.fasi) && nemico.fasi.length;

    let vinte = 0, caduti = 0;
    const tutte = [], soloVinte = [], vitaRimasta = [];
    for (let i = 0; i < PARTITE; i++) {
        g.eval(`setRngSeed(${SEME + i})`);
        costruisciParty(dati);
        stato.partyCoins = 0;
        stato.unlockedRelics = [];
        stato.activeCurses = [];
        stato.expeditionStats = g.eval('newExpeditionStats()');
        // Un solo nodo di scontro: niente bottino (gameItems vuoto), elite se il nemico ha fasi
        stato.stsMapNodes = [{ id: 1, level: 0, x: 400, type: conFasi ? 'elite' : 'combat', enemy: idNemico, next: [], active: true }];
        stato.currentNodeId = 1;
        g.eval('enemies = {}; gameItems = []; stato.party.forEach(refreshScaledBonuses)');
        const runCtx = { visitCounts: {}, lootRotationIdx: 0, monsterTargetRotationIdx: 0, scontri: [] };
        const esito = g.simRunCombat({ id: idNemico, ...JSON.parse(JSON.stringify(nemico)) }, ESPERTO, runCtx);
        const s = runCtx.scontri[0];
        tutte.push(s);
        if (!esito.defeat) { vinte++; soloVinte.push(s); }
        else vitaRimasta.push(Math.max(0, stato.activeEnemy.hp) / stato.activeEnemy.maxHp);
        caduti += stato.party.filter(h => h.hp <= 0).length;
    }
    g.eval('setRngSeed(null)');

    const p = vinte / PARTITE;
    const margine = Math.round(1.96 * Math.sqrt(p * (1 - p) / PARTITE) * 100);
    const roundi = tutte.map(s => s.rounds);
    const media = (list, campo) => list.length ? list.reduce((s, x) => s + x[campo], 0) / list.length : 0;
    console.log(`\n${nemico.name} (${idNemico}) — HP ${nemico.maxHp} · CA ${nemico.ca} · Att ${nemico.att} · Danno ${nemico.dmg}${conFasi ? ` · ${nemico.fasi.length} fasi` : ''}`);
    console.log(`  Vittorie: ${Math.round(p * 100)}% ± ${margine} (${vinte}/${PARTITE})`);
    console.log(`  Round: medi ${f(media(tutte, 'rounds'))} (nelle vittorie ${f(media(soloVinte, 'rounds'))}), da ${Math.min(...roundi)} a ${Math.max(...roundi)}`);
    console.log(`  HP persi a scontro: ${f(media(tutte, 'hpPersi'))} su ${stato.party.reduce((s, h) => s + h.maxHp, 0)} della compagnia`);
    console.log(`  Eroi caduti a scontro: ${f(caduti / PARTITE)} su ${idEroi.length}`);
    if (vitaRimasta.length) console.log(`  Nelle sconfitte il nemico aveva ancora in media il ${Math.round(vitaRimasta.reduce((a, b) => a + b, 0) / vitaRimasta.length * 100)}% della vita`);
    if (conFasi && soloVinte.length && media(soloVinte, 'rounds') < 8) console.log('  ⚠ Boss chiuso sotto gli 8 round: le fasi non stanno mordendo (un boss lungo sta sugli 8-12).');
}
