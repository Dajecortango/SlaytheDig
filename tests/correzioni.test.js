// Correzioni della versione 1.5: scarto, maledizioni tolte, finale, salvataggio, combattimento, bottino
module.exports = (t, carica) => {
    const g = carica();
    const lib = g.LIBRERIA;

    const eroe = (nome, extra = {}) => ({ name: nome, hp: 4, maxHp: 4, str: 2, int: 2, fth: 2, dmg: 1, items: [], base_armor: 0, current_armor: 0, ...extra });
    const prepara = () => {
        const stato = g.eval('stato');
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = 0;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.stsMapNodes = [{ id: 0, level: 1, type: 'combat', next: [1] }, { id: 1, level: 2, type: 'combat', next: [] }];
        stato.currentNodeId = 0;
        g.eval("currentScreenId = 'screenMap'");
        return stato;
    };

    t.test('scarto: si torna alla schermata di prima e un secondo clic non scarta altro', () => {
        const stato = prepara();
        const a = eroe('A', { items: [{ id: 'x1', name: 'X1' }, { id: 'x2', name: 'X2' }, { id: 'x3', name: 'X3' }] });
        stato.party = [a];
        g.eval("currentScreenId = 'screenMerchant'");
        let chiamate = 0;
        g.assignItemToHero({ id: 'nuovo', name: 'Nuovo' }, a, () => chiamate++);
        t.uguale('screenDiscard', g.eval('currentScreenId'));
        g.executeDiscard(0);
        t.uguale('screenMerchant', g.eval('currentScreenId'), 'di nuovo dal mercante');
        g.executeDiscard(0);
        t.uguale(3, a.items.length); t.uguale(1, chiamate, 'callback una volta sola');
    });

    t.test('Pietra del focolare: togliere una maledizione toglie anche il malus', () => {
        const stato = prepara();
        const a = eroe('A');
        stato.party = [a];
        g.applyEffects(lib.maledizioni.sacrilego.effects);
        stato.activeCurses.forEach(c => { c.id = 'sacrilego'; });
        t.uguale(1, a.fth);
        g.removeCurseAt(0);
        t.uguale(2, a.fth); t.uguale(0, stato.activeCurses.length);
    });

    t.test('finale: la prova sull\'ultimo nodo è finale; fallita porta alla sconfitta', () => {
        const stato = prepara();
        stato.party = [eroe('A', { int: 0 })];
        stato.currentNodeId = 1;
        const sfida = { stat: 'int', cd: 99, reward: null, punishment: null };
        stato.challengeState = sfida;
        t.ok(g.resolveChallenge(stato.party[0], sfida, [2]).isFinal);
        g.finishLostFinal();
        t.uguale('screenDefeat', g.eval('currentScreenId'));
        t.ok(stato.stsMapNodes[1].done);
        stato.currentNodeId = 0;
        t.ok(!g.resolveChallenge(stato.party[0], sfida, [2]).isFinal, 'nodo intermedio');
    });

    t.test('salvataggio solo dalla mappa', () => {
        const stato = prepara();
        stato.currentCampaign = { id: 'tutorial' }; stato.party = [eroe('A')];
        g.eval('openModal = () => { globalThis.__aperta = true; }');
        g.eval("currentScreenId = 'screenMerchant'"); g.eval('globalThis.__aperta = false');
        g.saveGame();
        t.ok(!g.eval('globalThis.__aperta'), 'dal mercante no');
        g.eval("currentScreenId = 'screenMap'");
        g.saveGame();
        t.ok(g.eval('globalThis.__aperta'), 'dalla mappa sì');
    });

    t.test('somma esatta: il boss scende alla soglia del 50% e poi non si può più usare', () => {
        const stato = prepara();
        stato.currentNodeId = 1;   // ultimo livello: boss
        const nemico = { name: 'Boss', hp: 15, maxHp: 15, ca: 4, att: 4, dmg: 1 };
        stato.activeEnemy = nemico;
        const a = eroe('A', { chosenAbility: { id: 's', isCombatActive: true, combat: { sumTarget: 7 } } });
        stato.party = [a];
        g.resolveAbility(a, nemico, [3, 4]);
        t.uguale(7, nemico.hp, 'floor(15/2)');
        a.abilityUsedThisCombat = false;
        t.ok(!g.abilityUsable(a).ok, 'già a metà vita');
    });

    t.test('predatore: colpisce chi ha annunciato anche se nel frattempo un altro scende', () => {
        const stato = prepara();
        const a = eroe('A', { hp: 2 }), b = eroe('B', { hp: 3 });
        stato.party = [a, b];
        const nemico = { name: 'N', hp: 10, maxHp: 10, dmg: 1, att: 3, ca: 3, schema: 'predatore', announcedPrey: 'A' };
        b.hp = 1;   // una pozione o un evento cambia gli HP dopo l'annuncio
        t.uguale('A', g.resolveEnemyTurn(nemico, null).target.name);
    });

    t.test('bottino: due carte sempre diverse anche con un solo oggetto della rarità estratta', () => {
        prepara();
        g.eval("globalThis.__salvati = gameItems; gameItems = [{ id: 'r1', name: 'R', rarity: 'raro' }, { id: 'c1', name: 'C', rarity: 'comune' }]");
        for (let i = 0; i < 30; i++) {
            const s = g.pickLootChoices(true);
            t.ok(s.length === 2 && s[0] !== s[1]);
        }
        g.eval('gameItems = globalThis.__salvati');
    });

    t.test('hero_item: rispetta le pile e lo zaino pieno', () => {
        prepara();
        const id = Object.keys(lib.armeria).find(k => (lib.armeria[k].type || '').startsWith('consumable'));
        const a = eroe('A', { items: [{ id: 'x1' }, { id: 'x2' }] });
        g.giveHeroItem(a, id, 3);   // 2 in una pila nel terzo slot, la terza va persa
        t.uguale(3, a.items.length);
        t.uguale(2, a.items[2].qty);
    });

    t.test('reliquia di una sfida già posseduta: non si duplica', () => {
        const stato = prepara();
        stato.party = [eroe('A', { int: 30 })];
        const sfida = { stat: 'int', cd: 2, reward: { id: 'corno_antico', ...lib.reliquie.corno_antico } };
        stato.challengeState = sfida;
        g.resolveChallenge(stato.party[0], sfida, [6]);
        g.resolveChallenge(stato.party[0], sfida, [6]);
        t.uguale(1, stato.unlockedRelics.filter(r => r.id === 'corno_antico').length);
    });

    t.test('ogni hero_set della libreria è un segnale noto (HERO_FLAGS)', () => {
        const flags = g.eval('HERO_FLAGS');
        Object.values(lib.abilita).concat(Object.values(lib.reliquie)).forEach(x => (x.effects || [])
            .filter(e => e.effect === 'hero_set').forEach(e => t.ok(flags[e.stat], `${x.id || x.name}: ${e.stat}`)));
    });

    t.test('maledizione tolta: chi era già a 0 non guadagna punti', () => {
        const stato = prepara();
        const zero = eroe('Z', { fth: 0 }), due = eroe('D', { fth: 2 });
        stato.party = [zero, due];
        const sfida = { stat: 'int', cd: 99, punishment: { id: 'maledetti_dai_popolani', ...lib.maledizioni.maledetti_dai_popolani } };
        stato.challengeState = sfida;
        g.resolveChallenge(zero, sfida, [2]);
        t.uguale(0, zero.fth); t.uguale(1, due.fth);
        g.removeCurseAt(0);
        t.uguale(0, zero.fth, 'resta a 0'); t.uguale(2, due.fth, 'torna a 2');
    });

    t.test('capitano: la Catena di Norgrad dà +1 al tiro', () => {
        const stato = prepara();
        const a = eroe('A', { fth: 0 });
        stato.party = [a];
        stato.unlockedRelics = [{ id: 'catena_di_norgrad' }];
        t.uguale(1, g.resolveCaptainAction(a, 'faith').relicBonus);
    });

    t.test('anteprima del colpo: scudo 0 danni, somma esatta = sconfitta o metà vita', () => {
        const stato = prepara();
        stato.activeEnemy = { name: 'N', hp: 9, maxHp: 15, ca: 4, att: 4 };
        const scudo = eroe('S', { chosenAbility: { id: 'x', isCombatActive: true, combat: { armorGain: 2 } } });
        const sette = eroe('7', { chosenAbility: { id: 'y', isCombatActive: true, combat: { sumTarget: 7 } } });
        stato.party = [scudo, sette];
        t.uguale(0, g.expectedHitDamage(scudo, 'ability'));
        t.uguale(9, g.expectedHitDamage(sette, 'ability'), 'nemico normale: tutta la vita');
        stato.currentNodeId = 1;   // ultimo livello: boss
        t.uguale(2, g.expectedHitDamage(sette, 'ability'), 'boss: da 9 a 7');
    });

    t.test('diario: il tiro di attacco elenca anche il bonus di Aiuta', () => {
        const stato = prepara();
        const a = eroe('A', { str: 3 });
        stato.party = [a]; stato.helpBonus = 1; stato.combatRound = 5;
        const res = g.resolveAttack(a, { hp: 10, ca: 4 }, [3]);
        t.uguale(' + Forza 3 + Aiuto 1', g.rollPartsText(res.parts));
        t.uguale(7, res.total);
    });

    t.test('tesoro: tre oggetti diversi', () => {
        prepara();
        for (let i = 0; i < 20; i++) {
            const items = g.generateTreasureOffer().items;
            t.ok(items.length === 3 && new Set(items).size === 3);
        }
    });

    t.test('mercante: dopo una cura del medico la merce non si rinnova', () => {
        prepara();
        g.eval("merchantItemsWithPrices = [{ kind: 'item' }]; merchantMedicHealed = 0");
        t.ok(!g.merchantBoughtSomething());
        g.eval('merchantMedicHealed = 1');
        t.ok(g.merchantBoughtSomething());
    });
    t.test('ritiro di Dioforo: il Sigillo runico vale e si consuma solo al primo tentativo', () => {
        const stato = prepara();
        const d = eroe('Dioforo', { int: 0, challengeRerollMalus: 1 });
        stato.party = [d]; stato.party.sigilloCharges = 0;
        stato.unlockedRelics = [{ id: 'sigillo_runico' }];
        const sfida = { stat: 'int', cd: 99, reward: null, punishment: null };
        stato.challengeState = sfida;
        const res = g.resolveChallenge(d, sfida, [2, null, 3]);
        t.ok(res.rerolled);
        t.uguale(2, res.total, 'secondo tiro: 3 - 1, senza il +2 del Sigillo');
        t.uguale(1, stato.party.sigilloCharges, 'una carica sola');
    });

    t.test('premi e punizioni hero_*: vanno all\'eroe della prova; senza eroe a tutti quelli in piedi', () => {
        const stato = prepara();
        const a = eroe('A', { int: 30 }), b = eroe('B'), c = eroe('C', { hp: 0 });
        stato.party = [a, b, c];
        const sfida = { stat: 'int', cd: 2, reward: { type: 'premio', name: 'Forza', effects: [{ effect: 'hero_stat', stat: 'str', val: 1 }] } };
        stato.challengeState = sfida;
        g.resolveChallenge(a, sfida, [6]);
        t.uguale(3, a.str); t.uguale(2, b.str);
        g.applyEffects([{ effect: 'hero_stat', stat: 'dmg', val: 1 }]);
        t.uguale(2, a.dmg); t.uguale(2, b.dmg); t.uguale(1, c.dmg, 'il caduto no');
    });

    t.test('party_damage e party_max_hp non rialzano i caduti', () => {
        const stato = prepara();
        const vivo = eroe('V', { hp: 3 }), caduto = eroe('C', { hp: 0 });
        stato.party = [vivo, caduto];
        g.applyEffects([{ effect: 'party_damage', val: 1 }]);
        t.uguale(2, vivo.hp); t.uguale(0, caduto.hp);
        g.applyEffects([{ effect: 'party_max_hp', val: 1 }]);
        t.uguale(3, vivo.hp); t.uguale(5, caduto.maxHp); t.uguale(0, caduto.hp);
    });

    t.test('pozioni di cura: non si usano su chi ha già tutti gli HP', () => {
        const stato = prepara();
        const pieno = eroe('P'), ferito = eroe('F', { hp: 2 });
        const pozione = JSON.parse(JSON.stringify(lib.armeria.balsamo_curativo));
        pieno.items = [pozione];
        stato.party = [pieno, ferito];
        t.ok(!g.canTargetWithItem(pozione, pieno));
        t.ok(g.canTargetWithItem(pozione, ferito));
        t.ok(!g.useConsumable('P', 0, 'P'), 'rifiutata');
        t.uguale(1, pieno.items.length, 'resta nello zaino');
    });
};
