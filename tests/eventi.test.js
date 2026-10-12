// Eventi con scelte nei nodi di trama (stories[chiave].scelte, js/prove.js) e i tipi di effetto che usano
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const eroe = (name, extra = {}) => ({ name, hp: 2, maxHp: 4, str: 1, int: 3, fth: 1, dmg: 1, items: [], ...extra });
    const prepara = (coins = 20) => {
        stato.party = [eroe('A'), eroe('B', { str: 4 })];
        stato.partyCoins = coins;
        stato.unlockedRelics = []; stato.activeCurses = [];
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.stsMapNodes = [{ id: 1, level: 0, type: 'story', storyId: 'mercante_ferito', next: [2] }, { id: 2, level: 1, type: 'combat', next: [] }];
        stato.currentNodeId = 1;
    };
    // Evento d'esempio: aiutare il mercante (costa Scudi, dà una reliquia) o derubarlo (prova di Forza)
    const evento = {
        title: 'Il mercante ferito', text: 'Un mercante giace sul ciglio della strada.',
        scelte: [
            { testo: 'Lo curate', costo: 10, effetti: [{ effect: 'relic', id: 'frammento_di_yr_drazul' }], esito: 'Vi ringrazia con un dono.' },
            { testo: 'Lo derubate', stat: 'str', cd: 7, effetti: [{ effect: 'coins', val: 30 }], esito: 'Bottino facile.',
                fallimento: { effetti: [{ effect: 'curse', id: 'rancore_del_mercante' }], esito: 'Vi maledice.' } },
            { testo: 'Riposate con lui', effetti: [{ effect: 'party_heal', val: 1 }] }
        ]
    };

    t.test('scelta con un costo: si paga, poi gli effetti (una reliquia della libreria)', () => {
        prepara(20);
        const res = g.resolveStoryChoice(evento.scelte[0]);
        t.uguale(10, stato.partyCoins);
        t.ok(res.success && g.hasRelic('frammento_di_yr_drazul'), 'reliquia ottenuta');
        t.uguale('Vi ringrazia con un dono.', res.text);
        prepara(5);
        t.uguale(null, g.resolveStoryChoice(evento.scelte[0]), 'Scudi insufficienti: niente');
        t.uguale(5, stato.partyCoins);
    });

    t.test('scelta con una prova: tira l\'eroe con la statistica più alta; riuscita e fallimento hanno effetti diversi', () => {
        prepara();
        const ok = g.resolveStoryChoice(evento.scelte[1], [3]);
        t.uguale('B', ok.hero.name, 'la Forza più alta');
        t.ok(ok.success, '3 + 4 = 7 contro CD 7');
        t.uguale(50, stato.partyCoins);
        prepara();
        const ko = g.resolveStoryChoice(evento.scelte[1], [1]);
        t.ok(!ko.success, 'un 1 fallisce sempre');
        t.uguale(20, stato.partyCoins);
        t.ok(g.hasCurse('rancore_del_mercante'), 'la maledizione della libreria');
        t.uguale('Vi maledice.', ko.text);
    });

    t.test('effetto party_heal: cura chi è in piedi, non i caduti', () => {
        prepara();
        stato.party[1].hp = 0;
        g.resolveStoryChoice(evento.scelte[2]);
        t.uguale(3, stato.party[0].hp);
        t.uguale(0, stato.party[1].hp);
    });

    t.test('schermata: si sceglie una volta sola, poi compare "Prosegui"', () => {
        prepara(20);
        stato.currentCampaign = { ...stato.currentCampaign, stories: { mercante_ferito: evento } };
        g.startStory(stato.stsMapNodes[0]);
        t.ok(!g.eval('storyChoiceMade'));
        g.chooseStoryOption(2);
        t.ok(g.eval('storyChoiceMade'));
        g.chooseStoryOption(0);
        t.uguale(20, stato.partyCoins, 'la seconda scelta non vale');
    });

    t.test('i tipi di effetto nuovi sono noti all\'editor (EFFECT_TYPES ed EFFECT_LABELS)', () => {
        const tipi = g.eval('EFFECT_TYPES'), nomi = g.eval('EFFECT_LABELS');
        ['party_heal', 'relic', 'curse'].forEach(k => t.ok(tipi[k] && nomi[k], k));
        Object.keys(tipi).forEach(k => t.ok(nomi[k], `nome per ${k}`));
    });
};
