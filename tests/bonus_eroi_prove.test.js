// Bonus o malus per eroe nelle prove ("bonusEroi" della sfida: { id della libreria Eroi: valore })
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const eroe = (name, extra = {}) => ({ name, hp: 4, maxHp: 4, str: 2, int: 1, fth: 1, dmg: 1, items: [], ...extra });
    const prepara = (bonusEroi) => {
        stato.party = [eroe('A', { libId: 'eroe_a' }), eroe('Pandora Dignitas')];
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = 0;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.stsMapNodes = [{ id: 1, level: 0, type: 'challenge', next: [2] }, { id: 2, level: 1, type: 'combat', next: [] }];
        stato.currentNodeId = 1;
        stato.gmProvaMod = 0;
        stato.challengeState = { title: 'Muro', stat: 'str', cd: 7, bonusEroi, successText: 'ok', failText: 'no' };
        return stato.challengeState;
    };

    t.test('il bonus dell\'eroe si somma al tiro e compare nel diario', () => {
        const s = prepara({ eroe_a: 1 });
        const res = g.resolveChallenge(stato.party[0], s, [4]);
        t.uguale(7, res.total, '4 + 2 Forza + 1 dell\'eroe');
        t.ok(res.success);
        t.ok(res.events.some(e => e.text.includes('+1 A in questa prova')));
    });

    t.test('il malus vale solo per l\'eroe indicato, trovato anche per nome', () => {
        const pandora = Object.entries(g.eval('LIBRERIA.eroi')).find(([, h]) => h.name === 'Pandora Dignitas');
        t.ok(pandora, 'Pandora nella libreria');
        const s = prepara({ [pandora[0]]: -1 });
        t.uguale(0, g.challengeHeroBonus(stato.party[0]));
        const res = g.resolveChallenge(stato.party[1], s, [4]);
        t.uguale(5, res.total, '4 + 2 Forza - 1 di Pandora');
        t.ok(res.events.some(e => e.text.includes('in questa prova')));
    });

    t.test('la probabilità mostrata tiene conto del bonus', () => {
        prepara({});
        const base = g.challengeChanceInfo(g.challengeModifiers(stato.party[0])).pct;
        prepara({ eroe_a: 2 });
        const aiutato = g.challengeChanceInfo(g.challengeModifiers(stato.party[0])).pct;
        t.ok(aiutato > base, `${base} < ${aiutato}`);
    });

    t.test('gli eroi della campagna sanno il loro id della libreria', () => {
        const camp = g.eval('CAMPAIGNS.loch_ein_parte_2');
        t.ok(camp.heroes.every(h => h.libId && g.eval('LIBRERIA.eroi')[h.libId]), 'libId su ogni eroe');
    });

    t.test('i bonus delle sfide delle campagne richiamano eroi della campagna', () => {
        Object.values(g.eval('CAMPAIGNS')).forEach(camp => {
            const ids = (camp.heroes || []).map(h => h.libId);
            Object.entries(camp.challenges || {}).forEach(([k, ch]) => Object.keys(ch.bonusEroi || {}).forEach(id => {
                t.ok(ids.includes(id), `${camp.id}, sfida ${k}: eroe ${id} non è nella campagna`);
            }));
        });
    });
};
