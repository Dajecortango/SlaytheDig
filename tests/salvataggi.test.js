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

    t.test('il formato attuale è il 3', () => t.uguale(3, g.eval('SAVE_VERSION')));

    t.test('2 -> 3: reliquie con l\'id della libreria (o ricavato dal nome se non c\'è più)', () => {
        const s = g.migrateSave(v2()).stato;
        t.uguale(['corno_antico', 'reliquia_sparita'], s.unlockedRelics.map(r => r.id));
    });

    t.test('2 -> 3: maledizioni da testo a { id, text }', () => {
        const s = g.migrateSave(v2()).stato;
        t.uguale(['15_ricompensa_monete', 'gelo_nelle_ossa', 'sbornia_pesante', 'ferita_profonda'], s.activeCurses.map(c => c.id));
        t.uguale('Gelo nelle ossa (-1 tiri per colpire)', s.activeCurses[1].text);
    });

    t.test('2 -> 3: le passive scrivono il loro segnale sull\'eroe (Icaro +3 monete, Dioforo vantaggio)', () => {
        const s = g.migrateSave(v2()).stato;
        t.uguale(3, s.party[0].bonusLootCoins);
        t.uguale(true, s.party[1].hasAdvantageOnIntFth);
    });

    t.test('1 -> 3: un salvataggio senza versione arriva al formato attuale', () => {
        const v1 = { campaignId: 'tutorial', party: [{ name: 'A', hp: 1 }], unlockedRelics: [{ name: 'Sigillo runico' }], activeCurses: ['Presagio di Morte (+1 danno subito)'] };
        const s = g.migrateSave(v1);
        t.uguale(3, s.version);
        t.uguale('sigillo_runico', s.stato.unlockedRelics[0].id);
        t.uguale('presagio_di_morte', s.stato.activeCurses[0].id);
    });

    t.test('un salvataggio di una versione futura viene rifiutato', () => {
        t.uguale(null, g.migrateSave({ version: 99, campaignId: 'tutorial', stato: { party: [] } }));
    });
};
