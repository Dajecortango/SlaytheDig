// Salvataggi: migrazione dei formati vecchi al formato attuale
module.exports = (t, carica) => {
    const g = carica();

    // Salvataggio in formato 2 come lo scriveva la versione 1.1 (reliquie e maledizioni per nome)
    const v2 = () => ({
        version: 2, campaignId: 'tutorial', timestamp: 'ieri',
        stato: {
            stsMapNodes: [{ id: 0, done: true, active: false }], currentNodeId: 0, partyFlags: {}, partyCoins: 10,
            party: [
                { name: 'Icaro', hp: 4, maxHp: 4, chosenAbility: { id: 'icaro_oro', name: 'Fammi dare un’occhiata' } },
                { name: 'Dioforo', hp: 4, maxHp: 4, chosenAbility: { id: 'dioforo_era_solo_una_prova', name: 'Era solo una prova!' } }
            ],
            unlockedRelics: [{ name: 'Corno antico', desc: 'x' }, { name: 'Reliquia sparita', desc: 'y' }],
            activeCurses: ['Maledizione: -15% monete', 'Gelo nelle ossa (-1 tiri per colpire)', 'Sbornia pesante (-1 attacco)', 'Ferita profonda (testo libero)'],
            expeditionStats: {}
        }
    });

    t.test('il formato attuale è il 6', () => t.uguale(6, g.eval('SAVE_VERSION')));

    t.test('3 -> 4: la maledizione delle monete diventa quella degli Scudi', () => {
        const v3 = { version: 3, campaignId: 'tutorial', stato: { party: [], activeCurses: [
            { id: '15_ricompensa_monete', text: '-15% ricompensa monete (Monete future ridotte del 15%)' }, { id: 'sbornia_pesante', text: 'x' }] } };
        const s = g.migrateSave(v3).stato;
        t.uguale(['15_scudi_di_ricompensa', 'sbornia_pesante'], s.activeCurses.map(c => c.id));
        t.ok(s.activeCurses[0].text.includes('Scudi'));
    });

    t.test('2 -> 3: reliquie con l\'id della libreria (o ricavato dal nome se non c\'è più)', () => {
        const s = g.migrateSave(v2()).stato;
        t.uguale(['corno_antico', 'reliquia_sparita'], s.unlockedRelics.map(r => r.id));
    });

    t.test('2 -> 3: maledizioni da testo a { id, text }', () => {
        const s = g.migrateSave(v2()).stato;
        t.uguale(['15_scudi_di_ricompensa', 'gelo_nelle_ossa', 'sbornia_pesante', 'ferita_profonda'], s.activeCurses.map(c => c.id));
        t.uguale('Gelo nelle ossa (-1 tiri per colpire)', s.activeCurses[1].text);
    });

    t.test('2 -> 6: le passive agiscono ancora (Icaro +3 monete con gli effetti speciali, Dioforo con il suo segnale)', () => {
        const s = g.migrateSave(v2()).stato;
        t.uguale(undefined, s.party[0].bonusLootCoins, 'il segnale di prima è tolto');
        t.ok(g.heroSpecialSources(s.party[0]).some(e => e.s.fai === 'monete' && e.s.val === 3), 'Icaro: fine scontro +3 Scudi');
        t.uguale(1, s.party[1].challengeRerollMalus);
    });

    t.test('5 -> 6: i segni di reliquie, oggetti e passive diventano usi degli effetti speciali', () => {
        const v5 = { version: 5, campaignId: 'tutorial', stato: {
            party: [{ name: 'T', hp: 2, chosenAbility: { id: 'tanto_ho_tenacia' }, tenacityRevive: 2, tenacityUsed: true, items: [{ id: 'occhio_gazza', loot_extra_once: 1 }], firstHitUsed: true }],
            partyFlags: { atamanoUsed: true, sigilloCharges: 1, lootExtraChoices: 2, gazzaUsed: true } } };
        const s = g.migrateSave(v5).stato;
        const h = s.party[0];
        t.uguale(1, s.partyFlags.specialUses.capitolo['r:sigillo_runico#0'], 'Sigillo: una carica usata');
        t.uguale(2, s.partyFlags.lootExtraChoices);
        t.uguale(1, h.specialUses.capitolo['a:tanto_ho_tenacia#0'], 'Tanto ho tenacia già usata');
        t.uguale(1, h.specialUses.capitolo['o:occhio_gazza#0'], 'Occhio di Gazza già usato');
        t.ok(h.tenacityRevive === undefined && h.tenacityUsed === undefined && h.firstHitUsed === undefined, 'segnali tolti');
    });

    t.test('1 -> 6: un salvataggio senza versione arriva al formato attuale', () => {
        const v1 = { campaignId: 'tutorial', party: [{ name: 'A', hp: 1 }], unlockedRelics: [{ name: 'Sigillo runico' }], activeCurses: ['Presagio di Morte (+1 danno subito)'] };
        const s = g.migrateSave(v1);
        t.uguale(6, s.version);
        t.uguale('sigillo_runico', s.stato.unlockedRelics[0].id);
        t.uguale('presagio_di_morte', s.stato.activeCurses[0].id);
    });

    t.test('un salvataggio di una versione futura viene rifiutato', () => {
        t.uguale(null, g.migrateSave({ version: 99, campaignId: 'tutorial', stato: { party: [] } }));
    });

    t.test('al caricamento le passive riprendono il loro segnale anche se il salvataggio non lo ha (abilità senza id)', () => {
        const dioforo = { name: 'Dioforo', hp: 4, chosenAbility: { name: 'Era solo una prova!', desc: 'vecchia' } };
        g.restorePassiveFlags(dioforo);
        t.uguale(1, dioforo.challengeRerollMalus);
        const giaImpostato = { name: 'Dioforo', challengeRerollMalus: 2, chosenAbility: { name: 'Era solo una prova!' } };
        g.restorePassiveFlags(giaImpostato);
        t.uguale(2, giaImpostato.challengeRerollMalus, 'un valore già presente non si tocca');
        const attiva = { name: 'X', chosenAbility: { id: 'icaro_trucchi', isCombatActive: true } };
        g.restorePassiveFlags(attiva);
        t.ok(attiva.challengeRerollMalus === undefined);
        // Effetti speciali: un'abilità senza id si ritrova per nome nella libreria
        const icaro = { name: 'Icaro', hp: 4, items: [], chosenAbility: { name: 'Fammi dare un’occhiata', desc: 'vecchia' } };
        t.ok(g.heroSpecialSources(icaro).some(e => e.s.fai === 'monete'), 'Icaro: Scudi dopo lo scontro');
    });
};
