// Rune di Alastorta B. Dignitas: 2 rune su 4 alla creazione, una si scambia a ogni riposo
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const lib = g.LIBRERIA;
    const alastorta = () => JSON.parse(JSON.stringify(lib.eroi.alastorta_dignitas));

    t.test('Alastorta: 4 rune nella libreria, 2 da equipaggiare, giocabile nel Drakengrad', () => {
        const a = lib.eroi.alastorta_dignitas;
        t.uguale(4, a.runeOptions.length);
        t.uguale(2, a.runeSlots);
        a.runeOptions.forEach(id => t.ok(lib.abilita[id] && (lib.abilita[id].effects || lib.abilita[id].speciali), `runa ${id}`));
        t.ok(g.CAMPAIGNS.drakengrad.heroes.some(h => h.name === a.name));
    });

    t.test('creazione: si scelgono esattamente 2 rune e i loro effetti valgono subito', () => {
        g.eval(`campaignHeroes = [${JSON.stringify(alastorta())}]; campaignAbilities = {};`);
        stato.party = [];
        g.selectHeroCard('Alastorta B. Dignitas');
        const eroe = g.eval('activeHeroForCreation');
        g.toggleCreationRune('runa_rinascita');
        g.toggleCreationRune('runa_vento');
        g.toggleCreationRune('runa_sapere');   // la terza non entra
        t.uguale(['runa_rinascita', 'runa_vento'], eroe.equippedRunes);
        g.toggleCreationRune('runa_vento');    // si toglie e si cambia idea
        g.toggleCreationRune('runa_guarigione');
        g.confirmCreationRunes();
        // Rinascita e Guarigione agiscono con gli effetti speciali: valgono perché sono equipaggiate
        const fai = g.heroSpecialSources(eroe).map(e => e.s.fai);
        t.ok(fai.includes('rialza') && fai.includes('cura'), 'rialza e cura dalle rune');
        t.ok(!fai.includes('schiva') && eroe.challengeRerollMalus === undefined, 'niente Vento e niente Sapere');
    });

    t.test('riposo: lo scambio toglie la runa vecchia e dà la nuova, una volta per riposo', () => {
        const a = alastorta();
        a.equippedRunes = ['runa_rinascita', 'runa_guarigione'];
        a.equippedRunes.forEach(id => g.applyRune(a, id, 1));
        stato.party = [a];
        t.ok(g.swapRune(a.name, 'runa_guarigione', 'runa_sapere'));
        t.uguale(['runa_rinascita', 'runa_sapere'], a.equippedRunes);
        t.uguale(undefined, a.postCombatHeal);
        t.uguale(1, a.challengeRerollMalus);
        t.ok(!g.swapRune(a.name, 'runa_vento', 'runa_guarigione'), 'non si toglie una runa che non ha');
        t.ok(!g.swapRune(a.name, 'runa_rinascita', 'runa_sapere'), 'non si mette una runa già equipaggiata');

        g.eval("restsData = {}; openModal = (titolo, html, pulsanti) => { globalThis.__pulsanti = pulsanti; }");
        g.startRest('default');
        t.ok(g.restRuneButtonsHtml().includes('openRuneSwap'), 'pulsante al riposo');
        g.openRuneSwap(a.name);
        const pulsanti = g.eval('globalThis.__pulsanti');
        t.uguale(5, pulsanti.length, '2 equipaggiate x 2 disponibili + "Tieni le rune"');
        pulsanti[0].onClick();
        t.uguale('', g.restRuneButtonsHtml(), 'un solo scambio per riposo');
    });

    t.test('la Runa della Rinascita tolta e rimessa non salva una seconda volta', () => {
        const a = alastorta();
        a.equippedRunes = ['runa_rinascita', 'runa_guarigione']  // niente Vento: la schivata cambierebbe il colpo;
        a.equippedRunes.forEach(id => g.applyRune(a, id, 1));
        stato.party = [a];
        a.hp = 1;
        g.resolveMonsterAttack({ name: 'N', dmg: 5 }, a);
        t.uguale(2, a.hp, 'la prima volta si rialza');
        g.swapRune(a.name, 'runa_rinascita', 'runa_sapere');
        g.swapRune(a.name, 'runa_sapere', 'runa_rinascita');
        g.resolveMonsterAttack({ name: 'N', dmg: 5 }, a);
        t.uguale(0, a.hp, 'tolta e rimessa: niente seconda volta');
    });

    t.test('telefono: lo scambio (restSwapRune) vale solo durante un riposo e una volta', () => {
        const a = alastorta();
        a.equippedRunes = ['runa_rinascita', 'runa_vento'];
        a.equippedRunes.forEach(id => g.applyRune(a, id, 1));
        stato.party = [a];
        g.eval("currentScreenId = 'screenMap'");
        t.ok(!g.restSwapRune(a.name, 'runa_vento', 'runa_sapere'), 'fuori dal riposo no');
        g.eval('restsData = {}');
        g.startRest('default');
        t.ok(g.restSwapRune(a.name, 'runa_vento', 'runa_sapere'));
        t.ok(!g.restSwapRune(a.name, 'runa_rinascita', 'runa_guarigione'), 'il secondo scambio no');
        t.uguale(['runa_rinascita', 'runa_sapere'], a.equippedRunes);
    });

    t.test('simulatore: equipaggia le prime 2 rune', () => {
        const data = g.simCampaignData('drakengrad');
        const h = g.simBuildHero(data, 'Alastorta B. Dignitas', 0, -1);
        t.uguale(2, h.equippedRunes.length);
        t.ok(g.heroSpecialSources(h).some(e => e.s.fai === 'rialza' && e.s.val === 2), 'Runa della Rinascita attiva');
    });
};
