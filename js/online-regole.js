/* ==========================================================================
   PARTITA ONLINE: REGOLE (funzioni pure, niente DOM)
   Usate dal gioco del master (js/online.js), dalla pagina dei giocatori
   (server/public/online.js) e dai test. Chi può fare cosa, come si chiude
   un voto, chi è il capo della spedizione, quali regioni della schermata
   sono cambiate, quali percorsi diventano media leggeri.
   ========================================================================== */
const ONLINE_MASTER = '__master__';

/* Regole (spec, sezione 5):
   'tutti'            chiunque
   'creazione'        il giocatore di turno nella creazione degli eroi
   'eroeAttivo'       il proprietario dell'eroe che sta agendo in combattimento
   'menu:<id>'        il proprietario dell'eroe scelto nel menu <id>
   'argomento'        il proprietario dell'eroe passato come primo argomento
   'scarto'           il proprietario dell'eroe che deve scartare
   'prova'            il proprietario dell'eroe che affronta la prova
   'preghiera'        il proprietario dell'eroe che prega
   'capitano'         il proprietario dell'eroe scelto contro il capitano
   'voto:<tipo>'      il clic del giocatore diventa un voto
   'pronti'           il clic del giocatore vale "Ho finito"
   'finale'           showScreen solo verso vittoria o sconfitta
   'modale'           i pulsanti della finestra: chi l'ha aperta (chiunque se l'ha aperta il gioco)
   Un oggetto { screenX: regola, altrove: regola } sceglie la regola secondo la schermata. */
const ONLINE_PERMESSI = {
    // Chiunque
    startExpedition: 'tutti', finishStory: 'tutti', proceedCombatPhase: 'tutti', resumeHeroesTurn: 'tutti',
    triggerLoot: 'tutti', revealLootItem: 'tutti', selectLootChoice: 'tutti', openTreasure: 'tutti',
    selectTreasureItem: 'tutti', cancelTreasureItemSelection: 'tutti', confirmLeaveTreasure: 'tutti',
    revealMerchantItem: 'tutti', showMerchantTab: 'tutti', tryBuyMerchantItem: 'tutti', openMedic: 'tutti',
    toggleHeroCard: 'tutti', toggleDescBox: 'tutti', openJournal: 'tutti',
    finishLostFinal: 'tutti', finishWonFinal: 'tutti',
    advanceNode: { screenRest: 'pronti', altrove: 'tutti' },
    confirmLeaveMerchant: 'pronti',
    showScreen: 'finale',
    // Creazione degli eroi
    selectHeroCard: 'creazione', selectAbility: 'creazione', toggleCreationRune: 'creazione',
    confirmCreationRunes: 'creazione', togglePickItem: 'creazione', nextHero: 'creazione',
    // Combattimento
    selectCombatAction: 'eroeAttivo', executeCombatHeroRoll: 'eroeAttivo', executeCombatUseItem: 'eroeAttivo',
    backToCombatActions: 'eroeAttivo', cancelCombatItemSubmenu: 'eroeAttivo', cancelCombatHeroChoice: 'eroeAttivo',
    confirmCombatHeroChoice: 'menu:combatHeroSelect',
    executeMonsterAttack: 'voto:bersaglio',
    // Eroe scelto in un menu o passato come argomento
    confirmLootAssignment: 'menu:lootHeroSelect', confirmTreasureAssignment: 'menu:treasureHeroSelect',
    confirmMerchantAssignment: 'menu:merchantHeroSelect', confirmChallengeHero: 'menu:challengeHeroSelect',
    captainAction: 'menu:captainHeroSelect', confirmPrayerHero: 'menu:prayerHeroSelect',
    trySellItem: 'argomento', openRuneSwap: 'argomento', useConsumableFromTopbar: 'argomento',
    executeDiscard: 'scarto',
    executeChallengeRoll: 'prova',
    executePrayerRoll: 'preghiera', chooseBlessing: 'preghiera', giveBlessing: 'preghiera',
    executeCaptainRoll: 'capitano',
    // Voti
    selectStsNode: 'voto:mappa', challengeChoose: 'voto:prova', startPrayer: 'voto:preghiera', openHaggle: 'voto:contratta', haggle: 'voto:contratta', rerollMerchantStock: 'voto:rinnova',
    // Pulsanti della finestra e voto dalla barra
    __modal: 'modale', __vota: 'tutti'
};

function onlineRegola(azione, ctx) {
    const r = ONLINE_PERMESSI[azione];
    if (!r) return 'master';
    if (typeof r === 'string') return r;
    return r[ctx.screen] || r.altrove || 'master';
}

// { ok } esegue; { voto } registra un voto di quel tipo; { pronto } vale "Ho finito"; { motivo } rifiuta
function onlineCanRun(azione, args, giocatore, ctx) {
    if (giocatore === ONLINE_MASTER) return { ok: true };
    const regola = onlineRegola(azione, ctx);
    const owners = ctx.owners || {};
    const mio = eroe => !!eroe && owners[eroe] === giocatore;
    const no = motivo => ({ ok: false, motivo });
    if (regola === 'tutti') return { ok: true };
    if (regola === 'master') return no('Solo il master può farlo');
    if (regola === 'finale') return ['screenVictory', 'screenDefeat'].includes(args[0]) ? { ok: true } : no('Solo il master può farlo');
    if (regola === 'pronti') return { ok: false, pronto: true };
    if (regola.startsWith('voto:')) return { ok: false, voto: regola.slice(5) };
    if (regola === 'creazione') return ctx.creationTurn === giocatore ? { ok: true } : no('Sta scegliendo un altro giocatore');
    if (regola === 'eroeAttivo') return mio(ctx.activeHero) ? { ok: true } : no('Non è il tuo turno');
    if (regola.startsWith('menu:')) return mio((ctx.selects || {})[regola.slice(5)]) ? { ok: true } : no('Puoi scegliere solo il tuo eroe');
    if (regola === 'argomento') return mio(args[0]) ? { ok: true } : no('Puoi farlo solo per il tuo eroe');
    if (regola === 'scarto') return mio(ctx.discardHero) ? { ok: true } : no('Sta scegliendo chi deve scartare');
    if (regola === 'prova') return mio(ctx.challengeHero) ? { ok: true } : no('Tira chi affronta la prova');
    if (regola === 'preghiera') return mio(ctx.prayingHero) ? { ok: true } : no('Decide chi ha pregato');
    if (regola === 'capitano') return mio(ctx.captainHero) ? { ok: true } : no('Tira l\'eroe scelto');
    if (regola === 'modale') return !ctx.modalOwner || ctx.modalOwner === giocatore ? { ok: true } : no('Questa finestra è di un altro giocatore');
    return no('Solo il master può farlo');
}

// Azioni che decidono la stessa cosa di un voto: se le esegue il master il voto si annulla
const ONLINE_VOTO_AZIONI = {
    mappa: ['selectStsNode'], prova: ['challengeChoose', 'confirmChallengeHero'], preghiera: ['startPrayer', 'confirmPrayerHero'],
    bersaglio: ['executeMonsterAttack'], contratta: ['openHaggle', 'haggle'], rinnova: ['rerollMerchantStock']
};
function votoAnnullatoDa(azione, voto) {
    return !!voto && (ONLINE_VOTO_AZIONI[voto.tipo] || []).includes(azione);
}

// Nome di un giocatore: non vuoto e mai con il prefisso dei nomi riservati (ONLINE_MASTER)
function nomeGiocatoreValido(nome) {
    return typeof nome === 'string' && nome.trim() !== '' && !nome.trim().startsWith('__');
}

// Un clic remoto vale solo su un elemento attivo e visibile (dentro nessun .hidden o [hidden])
function elementoCliccabile(el) {
    return !!el && !el.disabled && !(el.closest && el.closest('.hidden, [hidden]'));
}

// Cosa osserva il master per sapere che la schermata è cambiata: niente "style", che le animazioni
// GSAP dei menu cambiano di continuo (si manderebbe la schermata ogni 100 ms)
const ONLINE_OSSERVA = { subtree: true, childList: true, characterData: true, attributes: true,
    attributeFilter: ['class', 'hidden', 'disabled', 'value', 'checked', 'selected', 'src', 'data-action', 'data-args', 'data-change', 'data-tip'] };

// Esito di un voto: maggioranza fra i voti dei collegati; pareggio → l'opzione votata dal capo
// (se è fra le pari), altrimenti la prima delle pari nell'ordine delle opzioni; nessun voto → la prima opzione
function resolveVote(voti, opzioni, capo, collegati) {
    const conta = {};
    Object.entries(voti || {}).forEach(([chi, op]) => {
        if (!collegati.includes(chi) || !opzioni.includes(op)) return;
        conta[op] = (conta[op] || 0) + 1;
    });
    const max = Math.max(0, ...Object.values(conta));
    if (max === 0) return opzioni[0] !== undefined ? opzioni[0] : null;
    const pari = opzioni.filter(op => conta[op] === max);
    if (pari.length === 1) return pari[0];
    const sceltaCapo = (voti || {})[capo];
    return pari.includes(sceltaCapo) ? sceltaCapo : pari[0];
}

// Capo della spedizione: a rotazione fra i collegati, nell'ordine d'ingresso, uno per livello della mappa
function nextCaptain(giocatori, livello) {
    const vivi = (giocatori || []).filter(gi => gi.connected);
    if (!vivi.length) return null;
    return vivi[((livello % vivi.length) + vivi.length) % vivi.length].name;
}

// Regioni da inviare: solo quelle cambiate; null per quelle sparite
function changedRegions(prima, dopo) {
    const out = {};
    Object.keys(dopo).forEach(k => { if (prima[k] !== dopo[k]) out[k] = dopo[k]; });
    Object.keys(prima).forEach(k => { if (!(k in dopo)) out[k] = null; });
    return out;
}

// Media leggeri per i giocatori: immagini grandi e video passano da /leggero/ (icone, cursori, interfaccia no)
const ONLINE_LEGGERO_RE = /^(immagini\/(?!icone\/|cursori\/|ui\/)|video\/)/;
function leggeroUrl(percorso) {
    return ONLINE_LEGGERO_RE.test(percorso) ? '/leggero/' + percorso : percorso;
}
function rendiLeggero(html) {
    return String(html).replace(/(src="|url\((?:&quot;|["'])?)((?:immagini|video)\/[^"'&)\s]+)/g,
        (m, prima, percorso) => prima + leggeroUrl(percorso));
}

// Node (server e test fuori da vm): stesse funzioni come modulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ONLINE_MASTER, ONLINE_PERMESSI, ONLINE_VOTO_AZIONI, onlineRegola, onlineCanRun, votoAnnullatoDa, nomeGiocatoreValido,
        elementoCliccabile, ONLINE_OSSERVA, resolveVote, nextCaptain, changedRegions, leggeroUrl, rendiLeggero };
}
