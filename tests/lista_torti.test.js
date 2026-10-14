// Lista dei torti (Pancrazio): niente armature né armatura (segnale noArmor, niente Difendi),
// ma +1 HP massimo dopo ogni scontro vinto in cui ha perso HP (hp_massimi se perso_hp_scontro)
module.exports = (t, carica) => {
    const g = carica();
    const stato = g.eval('stato');
    const arm = g.LIBRERIA.armeria;
    const abil = g.LIBRERIA.abilita.pancrazio_lista_torti;
    const armatura = Object.keys(arm).find(k => (arm[k].armor || 0) > 0);
    const scudo = Object.keys(arm).find(k => (arm[k].def_armor || 0) > 0);
    const arma = Object.keys(arm).find(k => !(arm[k].type || '').startsWith('consumable') && !g.itemGivesArmor(arm[k]));
    const eroe = (name, extra = {}) => ({ name, hp: 4, maxHp: 4, str: 4, int: 1, fth: 1, dmg: 1, items: [], base_armor: 0, current_armor: 0,
        att_bonus: 0, def_bonus: 0, help_bonus_val: 0, att_penalty: 0, ...extra });
    const pancrazio = () => { const p = eroe('Pancrazio', { chosenAbility: abil }); g.applyEffects(abil.effects, p); return p; };
    const prepara = party => {
        stato.party = party;
        stato.unlockedRelics = []; stato.activeCurses = []; stato.partyCoins = 0;
        stato.expeditionStats = g.eval('newExpeditionStats()');
        stato.stsMapNodes = [{ id: 1, level: 0, type: 'combat', next: [2] }, { id: 2, level: 1, type: 'combat', next: [] }];
        stato.currentNodeId = 1;
        stato.helpBonus = 0; stato.helpDmgBonus = 0; stato.combatRound = 1;
        stato.activeEnemy = { name: 'Lupo', hp: 10, maxHp: 10, ca: 6, att: 5, dmg: 1 };
        return stato.activeEnemy;
    };

    t.test('niente armature né scudi; le armi sì', () => {
        const p = pancrazio();
        t.ok(p.noArmor);
        t.ok(armatura && scudo && arma, 'nella libreria ci sono armature, scudi e armi');
        t.ok(!g.heroCanUseItem(p, arm[armatura])); t.ok(!g.heroCanUseItem(p, arm[scudo]));
        t.ok(g.heroCanUseItem(p, arm[arma]));
        t.ok(g.heroCanUseItem(eroe('Altro'), arm[armatura]), 'gli altri eroi sì');
    });

    t.test('il bottino non gli propone armature; un hero_item di armatura non arriva', () => {
        const p = pancrazio(), b = eroe('Bruno');
        prepara([p, b]);
        const opzioni = g.heroOptionsForItem(arm[armatura]);
        t.ok(!/Pancrazio/.test(opzioni) && /Bruno/.test(opzioni), opzioni);
        g.giveHeroItem(p, armatura, 1);
        t.uguale(0, p.items.length);
    });

    t.test('niente armatura dagli effetti, niente Difendi, e l\'armatura non assorbe i colpi', () => {
        const p = pancrazio(), b = eroe('Bruno');
        const n = prepara([p, b]);
        g.runSpecialEntries([{ s: { quando: 'uso', fai: 'armatura', val: 2, bersaglio: 'compagnia' }, owner: b, name: 'Prova', key: 'x' }], 'uso', b);
        t.uguale(0, p.current_armor); t.uguale(2, b.current_armor);
        t.ok(!g.combatActionAllowed(p, 'defend').ok);
        t.ok(g.combatActionAllowed(p, 'attack').ok);
        p.current_armor = 3;  // armatura arrivata da una fonte qualsiasi: non conta
        g.resolveMonsterAttack(n, p);
        t.uguale(3, p.hp); t.uguale(0, p.current_armor);
    });

    t.test('+1 HP massimo dopo uno scontro vinto in cui ha perso HP, non se non è stato toccato', () => {
        const p = pancrazio();
        const n = prepara([p]);
        g.startCombatSpecials();
        g.combatVictorySpecials();
        t.uguale(4, p.maxHp, 'senza danni niente');
        g.startCombatSpecials();
        g.resolveMonsterAttack(n, p);
        t.uguale(3, p.hp);
        const note = g.combatVictorySpecials().notes;
        t.uguale(5, p.maxHp); t.uguale(4, p.hp, 'anche un HP in più');
        t.ok(note.some(x => /HP massimi/.test(x)), note.join(' | '));
        g.startCombatSpecials();
        g.combatVictorySpecials();
        t.uguale(5, p.maxHp, 'il segno si azzera a ogni scontro');
    });

    t.test('anche il veleno conta come HP persi', () => {
        const p = pancrazio();
        prepara([p]);
        g.startCombatSpecials();
        p.poison = { val: 1, rounds: 1 };
        g.startRoundSpecials();
        g.combatVictorySpecials();
        t.uguale(5, p.maxHp);
    });

    t.test('simulatore: un\'armatura destinata a lui va a un altro', () => {
        const p = pancrazio(), b = eroe('Bruno');
        prepara([p, b]);
        g.simAssignItem(JSON.parse(JSON.stringify(arm[armatura])), p);
        t.uguale(0, p.items.length); t.uguale(1, b.items.length);
        t.ok(g.simBestRecipient(arm[armatura]).hero !== p);
    });
};
