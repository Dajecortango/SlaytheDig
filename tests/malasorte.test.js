// Aiace Dignitas: Malasorte (passiva, segnale hero_set "malasorte": ogni MALASORTE_FALLIMENTI tiri
// falliti +1 Forza permanente, al massimo MALASORTE_MAX volte per capitolo, malasorteDopoTiro in
// js/motore/speciali.js) e Inciampare nella storia (attiva: colpo automatico +2 Danno, perde 1 HP)
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const A = g.LIBRERIA.abilita;
    const OGNI = g.eval('MALASORTE_FALLIMENTI');
    const MAX = g.eval('MALASORTE_MAX');

    const eroe = (name, extra = {}) => ({ name, hp: 4, maxHp: 4, str: 2, int: 3, fth: 2, dmg: 1, items: [], base_armor: 0,
        current_armor: 0, att_bonus: 0, def_bonus: 0, help_bonus_val: 0, att_penalty: 0, ...extra });
    const prepara = (party, enemy = {}) => {
        stato.party = party;
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = 0;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.helpBonus = 0; stato.helpDmgBonus = 0; stato.combatRound = 1;
        stato.activeEnemy = { name: 'Lupo', hp: 10, maxHp: 10, ca: 6, att: 5, dmg: 1, ...enemy };
        return stato.activeEnemy;
    };
    const aiace = () => {
        const h = JSON.parse(JSON.stringify(g.LIBRERIA.eroi.aiace_dignitas));
        return h;
    };

    t.test('scheda: Aiace richiama Malasorte (passiva) e Inciampare nella storia (attiva) dalla libreria', () => {
        const h = g.LIBRERIA.eroi.aiace_dignitas;
        t.uguale('aiace_malasorte,aiace_inciampare_nella_storia', h.abilities.join(','));
        t.ok(A.aiace_malasorte && !A.aiace_malasorte.isCombatActive, 'passiva');
        t.ok(A.aiace_inciampare_nella_storia && A.aiace_inciampare_nella_storia.isCombatActive, 'attiva');
    });

    t.test(`Malasorte: dopo ${OGNI} attacchi falliti +1 Forza, con la nota nel diario`, () => {
        const h = aiace();
        g.applyEffects(A.aiace_malasorte.effects, h);
        const n = prepara([h], { ca: 99 });
        let nota = null;
        for (let i = 0; i < OGNI; i++) {
            const r = g.resolveAttack(h, n, [2]);
            t.ok(!r.hit, 'tiro fallito');
            nota = r.itemNotes.find(x => x.includes('Malasorte')) || nota;
            if (i < OGNI - 1) t.uguale(2, h.str, 'Forza invariata prima della soglia');
        }
        t.uguale(3, h.str, '+1 Forza alla soglia');
        t.ok(nota, 'nota nel diario');
    });

    t.test('Malasorte: anche difesa, aiuto, abilità, prove e preghiera contano; i successi no', () => {
        const h = aiace();
        h.malasorte = 1;
        const n = prepara([h], { ca: 99, att: 99 });
        g.resolveDefend(h, n, [2]);
        g.resolveHelp(h, n, [2]);
        t.uguale(2, h.str);
        h.chosenAbility = A.astarte_affondo;  // attiva con tiro: su CA 99 fallisce
        g.resolveAbility(h, n, [2]);
        t.uguale(3, h.str, 'terzo fallimento in scontro');
        const sfida = cd => { const s = { stat: 'int', cd, reward: null, punishment: null }; stato.challengeState = s; return s; };
        g.resolveChallenge(h, sfida(99), [2]);
        h.diceBag = [2];
        g.prayerRoll(h);  // 2 + Fede 2 < PRAYER_CD 7: fallita
        t.uguale(3, h.str, 'due fallimenti fuori dallo scontro');
        const r = g.resolveChallenge(h, sfida(99), [2]);
        t.uguale(4, h.str, 'sesto fallimento');
        t.ok(r.events.some(ev => ev.text.includes('Malasorte')), 'nota nel diario della prova');
        // Un successo non conta: il contatore resta dov'era
        const prima = h.malasorteFalliti;
        g.resolveChallenge(h, sfida(2), [6]);
        t.uguale(prima, h.malasorteFalliti);
    });

    t.test(`Malasorte: al massimo +${MAX} Forza per capitolo`, () => {
        const h = aiace();
        h.malasorte = 1;
        const n = prepara([h], { ca: 99 });
        for (let i = 0; i < OGNI * (MAX + 2); i++) g.resolveAttack(h, n, [2]);
        t.uguale(2 + MAX, h.str, 'tetto raggiunto');
        t.uguale(MAX, h.malasorteGuadagni);
    });

    t.test('senza il segnale i fallimenti non contano', () => {
        const h = aiace();
        const n = prepara([h], { ca: 99 });
        for (let i = 0; i < OGNI; i++) g.resolveAttack(h, n, [2]);
        t.uguale(2, h.str);
        t.ok(!h.malasorteFalliti, 'nessun contatore');
    });

    t.test('Inciampare nella storia: colpisce sempre, danno 1 + 2, Aiace perde 1 HP', () => {
        const h = aiace();
        h.chosenAbility = A.aiace_inciampare_nella_storia;
        const n = prepara([h]);
        const r = g.resolveAbility(h, n, []);
        t.ok(r.hit && r.autoHit, 'colpo automatico');
        t.uguale(3, r.dmg, 'Danno 1 + 2');
        t.uguale(7, n.hp);
        t.uguale(3, h.hp, 'perde 1 HP');
        t.ok(!g.abilityUsable(h).ok, 'una volta per scontro');
    });

    t.test('Inciampare nella storia: a 1 HP non scende sotto 1', () => {
        const h = aiace();
        h.hp = 1;
        h.chosenAbility = A.aiace_inciampare_nella_storia;
        const n = prepara([h]);
        const r = g.resolveAbility(h, n, []);
        t.ok(r.hit, 'colpisce comunque');
        t.uguale(1, h.hp, 'resta a 1 HP');
    });
};
