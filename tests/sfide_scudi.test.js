// Sfide che danno Scudi: sempre prima di un mercante. Sfida del sacrificio di HP (stat "hp"): regole, schermata, simulatore
module.exports = (t, carica) => {
    t.test('nessuna sfida dà Scudi dopo l\'ultimo mercante', () => {
        const g = carica();
        Object.entries(g.CAMPAIGNS_RAW).forEach(([id, c]) => {
            const nodi = g.sfideScudiSenzaMercante(c, g.LIBRERIA.reliquie);
            t.uguale([], nodi.map(n => `${id} nodo ${n.id} (${n.challengeId})`));
        });
    });

    t.test('il controllo trova Scudi senza mercante dopo, anche da una reliquia e dal sacrificio', () => {
        const g = carica();
        const camp = (sfida, conMercante) => ({
            challenges: { s: sfida },
            mapNodes: [{ id: 1, level: 0, type: 'challenge', challengeId: 's', next: [2] },
                { id: 2, level: 1, type: conMercante ? 'merchant' : 'rest', next: [3] }, { id: 3, level: 2, type: 'combat', next: [] }]
        });
        const monete = { stat: 'int', cd: 7, reward: { type: 'coins', effects: [{ effect: 'coins', val: 10 }] } };
        t.uguale(1, g.sfideScudiSenzaMercante(camp(monete, false)).length);
        t.uguale(0, g.sfideScudiSenzaMercante(camp(monete, true)).length);
        t.uguale(1, g.sfideScudiSenzaMercante(camp({ stat: 'int', cd: 7, reward: 'sacca_del_contrabbandiere' }, false), g.LIBRERIA.reliquie).length);
        t.uguale(1, g.sfideScudiSenzaMercante(camp({ stat: 'hp' }, false)).length);
        t.uguale(0, g.sfideScudiSenzaMercante(camp({ stat: 'int', cd: 7, reward: 'frammento_di_chiarezza' }, false), g.LIBRERIA.reliquie).length);
    });

    t.test('sacrificio: 1 HP alla volta per Scudi, mai sotto 1 HP, fino al massimo', () => {
        const g = carica();
        const stato = g.eval('stato');
        stato.partyCoins = 0;
        const a = { name: 'A', hp: 3, maxHp: 6 }, b = { name: 'B', hp: 1, maxHp: 6 };
        stato.party = [a, b];
        const c = { stat: 'hp', scudiPerHp: 5, massimo: 3 };
        t.ok(g.isSacrifice(c));
        t.ok(!g.canSacrifice(b, c), 'a 1 HP non può');
        t.uguale(null, g.resolveSacrifice(b, c));
        t.uguale({ hero: 'A', scudi: 5, fatti: 1, restano: 2 }, g.resolveSacrifice(a, c));
        g.resolveSacrifice(a, c);
        t.uguale(1, a.hp); t.uguale(10, stato.partyCoins);
        t.ok(!g.canSacrifice(a, c), 'A è a 1 HP');
        a.hp = 5;
        g.resolveSacrifice(a, c);
        t.uguale(0, g.sacrificesLeft(c));
        t.ok(!g.canSacrifice(a, c), 'massimo raggiunto');
        t.uguale(15, stato.partyCoins); t.uguale(15, c.scudiSacrificio);
        // Senza valori nella sfida valgono quelli di js/regole.js
        t.uguale({ scudi: g.eval('SACRIFICIO_SCUDI'), massimo: g.eval('SACRIFICIO_MASSIMO') }, g.sacrificeRules({ stat: 'hp' }));
        t.ok(g.eval('SACRIFICIO_SCUDI < MEDIC_PRICE_PER_HP'), 'sacrificare e farsi curare dal medico non rende');
    });

    t.test('schermata del sacrificio: si offre sangue, "Basta così" chiude con il riepilogo, i dati della campagna restano com\'erano', () => {
        const g = carica();
        g.eval(`stato.party = [{ name: 'A', hp: 4, maxHp: 6, items: [] }, { name: 'B', hp: 1, maxHp: 6, items: [] }];
            stato.partyCoins = 0; stato.stsMapNodes = [{ id: 1, next: [2] }]; stato.currentNodeId = 1;
            challengesData = { s: { title: 'Altare', stat: 'hp', scudiPerHp: 4, massimo: 2, desc: 'd', successText: 'ok', ignoreText: 'via' } };
            updatePartyStatusBars = () => {};`);
        g.startChallenge('s');
        t.ok(g.eval(`document.getElementById('challengeRoads').innerHTML`) === '');
        g.challengeChoose(true);
        // Il DOM finto dei test non tiene le classi: si controllano i contenuti
        const scelta = g.eval(`document.getElementById('challengeHeroPick').innerHTML`);
        t.ok(scelta.includes('data-hero="A"') && !scelta.includes('data-hero="B"'), 'solo chi ha più di 1 HP');
        g.confirmChallengeHero('A');
        g.confirmChallengeHero('A');
        t.uguale(2, g.eval('stato.party[0].hp')); t.uguale(8, g.eval('stato.partyCoins'));
        t.ok(!g.eval(`document.getElementById('challengeHeroPick').innerHTML`).includes('data-hero'), 'massimo raggiunto: nessuno può più');
        g.challengeSacrificeDone();
        t.ok(g.eval(`document.getElementById('challengeNarrativeBox').innerHTML`).includes('8 Scudi'));
        t.uguale(undefined, g.eval('challengesData.s.sacrifici'), 'la sfida della campagna non conta i sacrifici');
    });

    t.test('simulatore: sacrifica solo da chi resta sopra il 60% della vita', () => {
        const g = carica();
        g.eval(`stato.party = [{ name: 'A', hp: 10, maxHp: 10 }, { name: 'B', hp: 6, maxHp: 10 }]; stato.partyCoins = 0;`);
        const fatti = g.simSacrifice({ stat: 'hp', scudiPerHp: 4, massimo: 6 });
        t.uguale(4, fatti);
        t.uguale([6, 6], g.eval('stato.party.map(h => h.hp)'));
        t.uguale(16, g.eval('stato.partyCoins'));
    });
};
