// Scelta di un eroe con i ritratti (heroPickHtml in js/interfaccia.js) al posto dei menu a tendina:
// prova, preghiera, chi agisce e chi riceve il colpo del nemico
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const eroe = (name, extra = {}) => ({ name, hp: 4, maxHp: 4, str: 1, int: 1, fth: 1, dmg: 1, items: [], ...extra });
    const html = id => g.eval(`document.getElementById('${id}').innerHTML`);
    const prepara = () => {
        stato.party = [eroe('A', { int: 4 }), eroe('B', { fth: 3 }), eroe('C', { hp: 0 })];
        stato.unlockedRelics = []; stato.activeCurses = [];
        stato.expeditionStats = g.eval('newExpeditionStats()');
    };

    t.test('heroPickHtml: un pulsante per eroe con azione, nome e riga colorata dalla probabilità', () => {
        prepara();
        const h = g.heroPickHtml(stato.party.slice(0, 2), 'confirmPrayerHero', { chance: x => x.name === 'A' ? 80 : 20, sub: x => `riga ${x.name}` });
        t.uguale(2, (h.match(/class="hero-pick-btn/g) || []).length);
        t.ok(/data-action="confirmPrayerHero" data-args="\[(&quot;|")A(&quot;|")\]"/.test(h), h.slice(0, 300));
        t.ok(/data-chance="high">riga A/.test(h) && /data-chance="low">riga B/.test(h), 'colori della probabilità');
    });

    t.test('prova: ritratti dei soli eroi in piedi con statistica e %, il clic sceglie chi tira', () => {
        prepara();
        stato.challengeState = { title: 'x', stat: 'int', cd: 6, desc: 'x', ignoreText: 'x' };
        g.challengeChoose(true);
        const h = html('challengeHeroPick');
        t.uguale(2, (h.match(/hero-pick-btn/g) || []).length, 'C è caduto');
        t.ok(/Intelligenza 4 · \d+%/.test(h), h.slice(0, 400));
        g.eval('selectedChallengeHero = null');
        g.confirmChallengeHero('C');
        t.uguale(null, g.eval('selectedChallengeHero'), 'un caduto non si sceglie');
        g.confirmChallengeHero('A');
        t.uguale('A', g.eval('selectedChallengeHero.name'));
    });

    t.test('prova: Indietro dal dado torna agli eroi, Indietro dagli eroi torna ai modi e restituisce il prezzo', () => {
        prepara();
        stato.partyCoins = 20;
        const sfida = { title: 'x', stat: 'str', cd: 6, desc: 'x', ignoreText: 'x',
            strade: [{ testo: 'Pagate', stat: 'int', cd: 5, prezzo: [{ effect: 'coins', val: -10 }, { effect: 'party_damage', val: 1 }] }] };
        g.eval('challengesData = {}');
        g.eval('challengesData').s = sfida;
        g.startChallenge('s');
        g.challengeChooseRoad(0);
        t.uguale(10, stato.partyCoins, 'prezzo pagato');
        t.uguale([3, 3], stato.party.filter(h => h.hp > 0).map(h => h.hp));
        g.confirmChallengeHero('A');
        g.challengeBackToHeroes();
        t.uguale(null, g.eval('selectedChallengeHero'), "di nuovo la scelta dell'eroe");
        const eroeA = stato.party[0];
        g.challengeBackToStart();
        t.uguale(20, stato.partyCoins, 'Scudi restituiti');
        t.uguale([4, 4, 0], stato.party.map(h => h.hp), 'HP restituiti, il caduto resta caduto');
        t.ok(stato.party[0] === eroeA, 'gli eroi restano gli stessi oggetti');
        t.uguale('str', stato.challengeState.stat, "la sfida torna com'era");
        // Tirato il dado non si torna indietro
        g.challengeChooseRoad(0);
        g.confirmChallengeHero('A');
        g.eval(`document.getElementById('rollChallengeBtn').disabled = true`);
        g.challengeBackToHeroes();
        t.uguale('A', g.eval('selectedChallengeHero.name'));
    });

    t.test('preghiera: Indietro dal dado torna a chi prega, poi alla preghiera non ancora iniziata', () => {
        prepara();
        g.eval('restPrayer = null');
        g.startPrayer();
        g.confirmPrayerHero('B');
        g.prayerBackToHeroes();
        t.uguale(null, g.eval('selectedPrayerHero'));
        g.prayerBackToStart();
        g.confirmPrayerHero('A');
        t.uguale('A', g.eval('selectedPrayerHero.name'));
    });

    t.test('preghiera: ritratti con Fede e %, il clic sceglie chi prega', () => {
        prepara();
        g.eval('restPrayer = null');
        g.startPrayer();
        t.ok(/Fede 3 · \d+%/.test(html('prayerHeroPick')));
        g.confirmPrayerHero('B');
        t.uguale('B', g.eval('selectedPrayerHero.name'));
    });
};
