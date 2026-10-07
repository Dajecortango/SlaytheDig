// Riepilogo di fine partita (datiRiepilogo in js/spedizione.js) e ritorno al menu senza ricaricare (azzeraPartita)
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');

    // Come selectCampaign, senza schermate e musica (il DOM dei test è finto): copia nuova della campagna
    const avvia = () => {
        const c = g.campaignForPlay('tutorial');
        stato.currentCampaign = c;
        stato.stsMapNodes = c.mapNodes;
    };

    const preparaPartita = () => {
        avvia();
        const relicId = Object.keys(g.LIBRERIA.reliquie)[0];
        stato.party = [
            { name: 'Icaro', hp: 3, maxHp: 4, items: [] },
            { name: 'Dioforo', hp: -2, maxHp: 5, items: [] }
        ];
        stato.partyCoins = 17;
        stato.unlockedRelics = [{ id: relicId }];
        stato.activeCurses = [{ id: 'gelo_nelle_ossa', text: 'Gelo nelle ossa (-1 tiri per colpire)' }];
        Object.assign(stato.expeditionStats, { combatsWon: 4, elitesWon: 1, challengesPassed: 2, challengesFailed: 1, coinsEarned: 30, itemsFound: 5, diceRolls: [1, 2, 3, 4, 5, 6] });
        // Primi due livelli percorsi
        stato.stsMapNodes.filter(n => n.level <= 1).slice(0, 2).forEach(n => { n.done = true; });
        return relicId;
    };

    t.test('datiRiepilogo: campagna, esito, nodi, scontri, monete, reliquie, maledizioni, compagnia e dadi dallo stato', () => {
        const relicId = preparaPartita();
        const d = g.datiRiepilogo(stato, 'sconfitta');
        t.uguale('sconfitta', d.esito);
        t.uguale(stato.currentCampaign.title, d.campagna);
        t.uguale(stato.stsMapNodes.length, d.nodi.totale);
        t.uguale(2, d.nodi.completati);
        t.uguale(Math.max(...stato.stsMapNodes.map(n => n.level)) + 1, d.livelli.totale);
        t.uguale({ vinti: 4, elite: 1 }, { vinti: d.scontri.vinti, elite: d.scontri.elite });
        t.uguale({ superate: 2, fallite: 1 }, d.sfide);
        t.uguale({ finali: 17, raccolte: 30 }, d.monete);
        t.uguale(5, d.oggetti);
        t.uguale([g.relicName(relicId)], d.reliquie);
        t.uguale(['Gelo nelle ossa (-1 tiri per colpire)'], d.maledizioni);
        t.uguale([{ nome: 'Icaro', hp: 3, maxHp: 4, vivo: true }, { nome: 'Dioforo', hp: 0, maxHp: 5, vivo: false }], d.compagnia);
        t.uguale({ facce: [1, 2, 3, 4, 5, 6], totale: 21 }, d.dadi);
    });

    t.test('datiRiepilogo: boss finale sconfitto solo se il nodo di scontro dell\'ultimo livello è completato', () => {
        preparaPartita();
        const maxLevel = Math.max(...stato.stsMapNodes.map(n => n.level));
        const finali = stato.stsMapNodes.filter(n => n.level === maxLevel && (n.type === 'combat' || n.type === 'elite'));
        if (!finali.length) { t.uguale(null, g.datiRiepilogo(stato, 'vittoria').scontri.boss); return; }
        t.uguale(false, g.datiRiepilogo(stato, 'vittoria').scontri.boss);
        finali[0].done = true;
        t.uguale(true, g.datiRiepilogo(stato, 'vittoria').scontri.boss);
    });

    t.test('datiRiepilogo regge uno stato vuoto (nessuna campagna)', () => {
        const d = g.datiRiepilogo({ party: [], stsMapNodes: [], unlockedRelics: [], activeCurses: [] }, 'vittoria');
        t.uguale({ completati: 0, totale: 0 }, d.nodi);
        t.uguale(0, d.dadi.totale);
    });

    t.test('il riepilogo HTML contiene campagna, eroi e dadi', () => {
        preparaPartita();
        const html = g.riepilogoHtml(g.datiRiepilogo(stato, 'vittoria'));
        t.ok(html.includes(stato.currentCampaign.title), 'titolo della campagna');
        t.ok(html.includes('Icaro') && html.includes('Caduto'), 'eroi con il loro stato');
        t.ok(html.includes('dice-stats'), 'statistiche dei dadi');
    });

    t.test('azzeraPartita riporta lo stato a una partita nuova e se ne può iniziare un\'altra', () => {
        preparaPartita();
        stato.activeEnemy = { name: 'x' };
        stato.combatRound = 3;
        g.azzeraPartita();
        t.uguale(null, stato.currentCampaign);
        t.uguale([], stato.party);
        t.uguale([], stato.stsMapNodes);
        t.uguale(0, stato.partyCoins);
        t.uguale([], stato.unlockedRelics);
        t.uguale([], stato.activeCurses);
        t.uguale(null, stato.activeEnemy);
        t.uguale(0, stato.combatRound);
        t.uguale(0, stato.expeditionStats.combatsWon);
        t.uguale([0, 0, 0, 0, 0, 0], stato.expeditionStats.diceRolls);
        t.uguale('none', g.eval('combatPhase'));
        avvia();
        t.ok(stato.currentCampaign && stato.stsMapNodes.length > 0, 'seconda partita nella stessa pagina');
        t.ok(stato.stsMapNodes.every(n => !n.done), 'mappa nuova, nessun nodo completato');
    });
};
