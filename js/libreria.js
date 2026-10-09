/* ==========================================================================
   LIBRERIA CONDIVISA: armeria, bestiario, reliquie, maledizioni, eroi, abilità
   I file data/libreria/*.js riempiono window.LIBRERIA; le campagne in
   data/campagne/*.js richiamano gli elementi per id:
     - heroes                      -> LIBRERIA.eroi  (e i loro "abilities" -> LIBRERIA.abilita)
     - mapNodes[].enemy            -> LIBRERIA.bestiario
     - initialArmory, lootItems    -> LIBRERIA.armeria  (lootItems: null = LIBRERIA.lootPredefinito)
     - challenges[].reward         -> LIBRERIA.reliquie     (se è una stringa)
     - challenges[].punishment     -> LIBRERIA.maledizioni  (se è una stringa)
   Premi e punizioni immediati (monete, ferite, pedaggi) restano oggetti dentro la sfida.

   Questo script, caricato dopo librerie e campagne e prima di js/game.js,
   sostituisce ogni campagna in window.CAMPAIGNS con la sua versione "risolta"
   (stessa forma di prima: enemies, oggetti e premi completi), così motore,
   simulatore e tiro da remoto non devono sapere nulla dei riferimenti.
   Le campagne originali con i riferimenti restano in window.CAMPAIGNS_RAW
   (le usa l'editor).
   ========================================================================== */

window.LIBRERIA = window.LIBRERIA || {};
['armeria', 'bestiario', 'reliquie', 'maledizioni', 'eroi', 'abilita', 'azioni_elite'].forEach(k => { window.LIBRERIA[k] = window.LIBRERIA[k] || {}; });
window.LIBRERIA.lootPredefinito = window.LIBRERIA.lootPredefinito || [];

// Restituisce una copia della campagna con i riferimenti sostituiti dagli elementi della libreria.
// Un elemento può anche essere scritto per intero dentro la campagna: in quel caso resta com'è.
function resolveCampaign(raw, lib = window.LIBRERIA) {
    const camp = JSON.parse(JSON.stringify(raw));
    const copy = obj => obj && JSON.parse(JSON.stringify(obj));
    const missing = (what, id) => console.warn(`Campagna "${raw.id}": ${what} "${id}" non trovato nella libreria`);

    // Eroi: dalla libreria arrivano statistiche e abilità; "abilities" della campagna, se c'è, ha la precedenza
    const abilities = {};
    camp.heroes = (camp.heroes || []).map(ref => {
        if (typeof ref !== 'string') return ref;
        const entry = lib.eroi && lib.eroi[ref];
        if (!entry) { missing('eroe', ref); return null; }
        const { abilities: list, ...hero } = copy(entry);
        // Le abilità sono id della libreria Abilità; un'abilità scritta per intero nell'eroe resta com'è
        abilities[hero.name] = (list || []).map(a => {
            if (typeof a !== 'string') return a;
            if (!lib.abilita || !lib.abilita[a]) { missing('abilità', a); return null; }
            return { id: a, ...copy(lib.abilita[a]) };
        }).filter(Boolean);
        return hero;
    }).filter(Boolean);
    camp.abilities = Object.assign(abilities, camp.abilities || {});

    const item = ref => {
        if (typeof ref !== 'string') return ref;
        if (!lib.armeria[ref]) { missing('oggetto', ref); return null; }
        return copy(lib.armeria[ref]);
    };
    camp.initialArmory = (camp.initialArmory || []).map(item).filter(Boolean);
    if (Array.isArray(camp.lootItems)) camp.lootItems = camp.lootItems.map(item).filter(Boolean);

    // Immagine di uno scontro: quella del nodo se c'è, altrimenti quella del nemico nel bestiario
    (camp.mapNodes || []).forEach(n => {
        if (n.enemy && !n.image && lib.bestiario[n.enemy] && lib.bestiario[n.enemy].image) n.image = lib.bestiario[n.enemy].image;
    });

    // Nemici: quelli richiamati dai nodi, più eventuali nemici scritti per intero nella campagna
    const enemies = {};
    (camp.mapNodes || []).forEach(n => {
        if (!n.enemy || enemies[n.enemy] || (camp.enemies && camp.enemies[n.enemy])) return;
        if (lib.bestiario[n.enemy]) enemies[n.enemy] = copy(lib.bestiario[n.enemy]);
        else {
            missing('nemico', n.enemy);
            enemies[n.enemy] = { name: `Nemico mancante (${n.enemy})`, hp: 1, maxHp: 1, att: 1, dmg: 1, ca: 1, desc: 'Questo nemico non esiste nel bestiario.' };
        }
    });
    camp.enemies = Object.assign(enemies, camp.enemies || {});

    Object.values(camp.challenges || {}).forEach(ch => {
        if (typeof ch.reward === 'string') {
            if (lib.reliquie[ch.reward]) ch.reward = { id: ch.reward, ...copy(lib.reliquie[ch.reward]) };
            else { missing('reliquia', ch.reward); ch.reward = null; }
        }
        if (typeof ch.punishment === 'string') {
            if (lib.maledizioni[ch.punishment]) ch.punishment = { id: ch.punishment, ...copy(lib.maledizioni[ch.punishment]) };
            else { missing('maledizione', ch.punishment); ch.punishment = null; }
        }
    });
    return camp;
}

// Risolve tutte le campagne caricate (anche di nuovo, dopo aver cambiato la libreria)
function resolveAllCampaigns() {
    window.CAMPAIGNS = window.CAMPAIGNS || {};
    if (!window.CAMPAIGNS_RAW) window.CAMPAIGNS_RAW = { ...window.CAMPAIGNS };
    Object.entries(window.CAMPAIGNS_RAW).forEach(([id, raw]) => { window.CAMPAIGNS[id] = resolveCampaign(raw); });
}

resolveAllCampaigns();

// Per Node (strumenti e test)
if (typeof module !== 'undefined') module.exports = { resolveCampaign };
