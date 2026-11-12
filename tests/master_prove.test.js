// Bonus o malus del master ai tiri delle prove (stato.gmProvaMod, Pannello di Controllo e pannello del moderatore)
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const eroe = (name, extra = {}) => ({ name, hp: 4, maxHp: 4, str: 2, int: 1, fth: 1, dmg: 1, items: [], ...extra });
    const prepara = (gm) => {
        stato.party = [eroe('A')];
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = 0;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.stsMapNodes = [{ id: 1, level: 0, type: 'challenge', next: [2] }, { id: 2, level: 1, type: 'combat', next: [] }];
        stato.currentNodeId = 1;
        stato.gmProvaMod = gm;
        stato.challengeState = { title: 'Muro', stat: 'str', cd: 7, desc: 'x', successText: 'ok', failText: 'no', ignoreText: 'x' };
        return stato.challengeState;
    };

    t.test('senza modificatore la prova è quella di sempre', () => {
        const s = prepara(0);
        const res = g.resolveChallenge(stato.party[0], s, [4]);
        t.uguale(6, res.total, '4 + 2 Forza');
        t.ok(!res.success);
    });

    t.test('il favore del master si somma al tiro e compare nel diario', () => {
        const s = prepara(1);
        const res = g.resolveChallenge(stato.party[0], s, [4]);
        t.uguale(7, res.total, '4 + 2 Forza + 1 del master');
        t.ok(res.success);
        t.ok(res.events.some(e => e.text.includes('favore del master')));
    });

    t.test('lo sfavore del master toglie dal tiro', () => {
        const s = prepara(-2);
        const res = g.resolveChallenge(stato.party[0], s, [5]);
        t.uguale(5, res.total, '5 + 2 Forza - 2 del master');
        t.ok(res.events.some(e => e.text.includes('sfavore del master')));
    });

    t.test('la probabilità mostrata tiene conto del modificatore', () => {
        prepara(0);
        const base = g.challengeChanceInfo(g.challengeModifiers(stato.party[0])).pct;
        prepara(2);
        const aiutata = g.challengeChanceInfo(g.challengeModifiers(stato.party[0])).pct;
        prepara(-2);
        const frenata = g.challengeChanceInfo(g.challengeModifiers(stato.party[0])).pct;
        t.ok(aiutata > base && base > frenata, `${frenata} < ${base} < ${aiutata}`);
    });

    t.test('il modificatore resta nei limiti di GM_PROVE_MOD_MAX', () => {
        const max = g.eval('GM_PROVE_MOD_MAX');
        stato.gmProvaMod = 99;
        t.uguale(max, g.gmProvaMod());
        stato.gmProvaMod = -99;
        t.uguale(-max, g.gmProvaMod());
        stato.gmProvaMod = 'x';
        t.uguale(0, g.gmProvaMod());
    });

    t.test('il salvataggio lo conserva e la migrazione 6 -> 7 lo mette a zero', () => {
        const v6 = { version: 6, campaignId: 'tutorial', stato: { party: [], partyFlags: {} } };
        t.uguale(0, g.migrateSave(v6).stato.gmProvaMod);
    });

    t.test('il moderatore online può cambiarlo', () => {
        const azioni = g.eval('ONLINE_AZIONI_MODERATORE');
        t.ok(azioni.includes('gmAdjustProvaMod') && azioni.includes('gmSetProvaMod'));
    });
};
