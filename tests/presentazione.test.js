// Effetti di presentazione: le decisioni pure dietro numeri, intenzione del nemico, aure e frasi del mercante.
// Le animazioni si guardano nel browser (tools/prova_browser.mjs).
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const eroe = (nome, hp = 10, maxHp = 10) => ({ name: nome, hp, maxHp, dmg: 2, current_armor: 0, items: [] });

    t.test('numeri di danno: crescono con il danno, il critico è più grande, c\'è un limite', () => {
        t.ok(g.fxDamageSize(1) < g.fxDamageSize(3));
        t.ok(g.fxDamageSize(3) < g.fxDamageSize(10));
        t.ok(g.fxDamageSize(5, true) > g.fxDamageSize(5));
        t.uguale(3.6, g.fxDamageSize(1000));
    });

    t.test('intenzione: carica, colpo forte, colpo normale', () => {
        stato.party = [eroe('A'), eroe('B')];
        const nemico = extra => ({ name: 'N', hp: 10, maxHp: 10, dmg: 1, ...extra });
        t.uguale('', g.enemyIntentDanger(nemico()));
        t.uguale('forte', g.enemyIntentDanger(nemico({ dmg: 4 })));
        t.uguale('', g.enemyIntentDanger(nemico({ dmg: 9, isStunned: true })));
        t.uguale('carica', g.enemyIntentDanger(nemico({ turnoAzione: { turnoPreparazione: true }, charging: false })));
        t.uguale('forte', g.enemyIntentDanger(nemico({ turnoAzione: { turnoPreparazione: true }, charging: true })));
        t.uguale('forte', g.enemyIntentDanger(nemico({ turnoAzione: { turnoBersaglio: 'tutti' } })));
    });

    t.test('aure: stati e benedizioni sulla carta, niente per i caduti', () => {
        t.ok(g.heroAuraHtml({ ...eroe('A'), stunnedRounds: 1 }).includes('aura-stordito'));
        t.ok(g.heroAuraHtml({ ...eroe('A'), poison: { rounds: 2, val: 1 } }).includes('aura-avvelenato'));
        t.ok(g.heroAuraHtml({ ...eroe('A'), tempBuffs: [{ val: 1 }] }).includes('aura-benedetto'));
        t.uguale('', g.heroAuraHtml({ ...eroe('A'), tempBuffs: [{ val: -1 }] }));
        t.uguale('', g.heroAuraHtml({ ...eroe('A', 0), stunnedRounds: 1 }));
    });

    t.test('mercante: ogni momento ha frasi e un gesto, i testi dicono Scudi con la maiuscola', () => {
        const frasi = g.eval('MERCANTE_FRASI');
        for (const [kind, voce] of Object.entries(frasi)) {
            t.ok(voce.frasi.length > 0 && ['nod', 'shake', 'laugh'].includes(voce.gesto), kind);
            t.ok(g.merchantLine(kind).length > 0, kind);
            voce.frasi.forEach(f => t.ok(!/\bscudi\b/.test(f), f));
        }
        t.uguale('', g.merchantLine('inesistente'));
    });

    t.test('terreno: terra se la campagna non lo dice, altrimenti il suo; dati validi', () => {
        stato.currentCampaign = {};
        t.uguale('terra', g.campaignTerrain());
        stato.currentCampaign = g.simCampaignData('loch_ein_parte_1').campaign;
        t.uguale('fango', g.campaignTerrain());
    });

    t.test('solo le carte rare tremano, di più se sono più rare', () => {
        const ms = g.eval('CARD_TREMBLE_MS');
        t.ok(!ms.comune && !ms.scarso);
        t.ok(ms.non_comune < ms.raro && ms.raro < ms.epico && ms.epico < ms.leggendario);
    });
};
