// Campagne procedurali (js/procedurale.js): nemici da tutto il bestiario, ruoli, forza con le fasi, eventi dagli altri capitoli
module.exports = (t, carica) => {
    const g = carica();
    const B = g.LIBRERIA.bestiario;
    const pools = g.procPools('drakengrad');
    const ids = r => pools[r].map(x => x.id);

    t.test('ogni nemico del bestiario può uscire (tranne tutorial e segnaposto), con il ruolo giusto', () => {
        const tutti = new Set([...ids('normal'), ...ids('elite'), ...ids('boss')]);
        Object.keys(B).filter(id => !/tutorial/i.test(id)).forEach(id => t.ok(tutti.has(id), `${id} manca`));
        t.ok(!tutti.has('orso_bruno_tutorial'), 'niente nemici del tutorial');
        ids('normal').forEach(id => t.ok(!(B[id].fasi || []).length, `${id}: con fasi non è normale`));
        ids('elite').forEach(id => t.ok((B[id].fasi || []).length > 0, `${id}: elite senza fasi`));
        // Boss: usati come boss nei capitoli, o con almeno 2 fasi e 20 HP
        ['capitano_esploratori', 'madre_silfidi', 'tremabosco_striato', 'hungrabarn'].forEach(id => t.ok(ids('boss').includes(id), `${id} è boss`));
        t.ok(ids('elite').includes('arcanitradico') && ids('elite').includes('mastino_bokgar'), 'nemici fuori dalle mappe fra gli elite');
    });

    t.test('la forza conta le fasi: un elite con Danno 1 e tre fasi non è il primo della fila', () => {
        const e = { hp: 17, maxHp: 17, dmg: 1, ca: 8, att: 8 };
        t.ok(g.procEnemyPower({ ...e, fasi: [{ soglia: 50, azioni: ['a', 'b'] }] }) >= g.procEnemyPower(e) * 2);
        t.ok(ids('elite').indexOf('arcanitradico') > ids('elite').length / 3, `posto ${ids('elite').indexOf('arcanitradico')}`);
        ['normal', 'elite', 'boss'].forEach(r => pools[r].forEach((x, i) => i && t.ok(g.procEnemyPower(pools[r][i - 1].enemy) <= g.procEnemyPower(x.enemy), `${r} in fila`)));
    });

    t.test('mappa generata: ogni scontro ha un nemico esistente, immagine e statistiche cresciute', () => {
        for (const seme of [1, 2, 3, 777]) {
            const c = g.campaignForPlay('drakengrad', seme);
            c.mapNodes.filter(n => n.type === 'combat' || n.type === 'elite').forEach(n => {
                const e = c.enemies[n.enemy];
                t.ok(e && B[n.enemy.replace(/__l\d+$/, '')], `seme ${seme}, nodo ${n.id}: ${n.enemy}`);
                if (n.type === 'elite') t.ok((e.fasi || []).length > 0, `elite ${n.enemy} con fasi`);
            });
            const boss = c.mapNodes.find(n => !n.next.length);
            t.ok(ids('boss').includes(boss.enemy.replace(/__l\d+$/, '')), `boss: ${boss.enemy}`);
        }
        // Tutti i boss escono, non solo i più forti
        const usciti = new Set();
        for (let seme = 1; seme <= 60; seme++) usciti.add(g.campaignForPlay('drakengrad', seme).mapNodes.find(n => !n.next.length).enemy.replace(/__l\d+$/, ''));
        ids('boss').forEach(id => t.ok(usciti.has(id), `boss ${id} mai uscito in 60 mappe`));
    });

    t.test('eventi degli altri capitoli: prendono il posto di alcune sfide, la forma della mappa non cambia', () => {
        const forma = c => c.mapNodes.map(n => `${n.id}:${n.level}:${n.next.join(',')}`).join(' ');
        const prima = g.campaignForPlay('drakengrad', 777);
        t.ok(!prima.mapNodes.some(n => n.type === 'story'), 'senza eventi nessuna trama');
        const tut = g.CAMPAIGNS.tutorial, nodi = tut.mapNodes, storie = tut.stories;
        tut.stories = { ...(storie || {}), __evento: { title: 'Il carro rovesciato', text: 'Un carro.', scelte: [{ testo: 'Aiutate', effetti: [{ type: 'coins', val: 5 }] }] } };
        tut.mapNodes = [...nodi, { id: 999, level: 1, type: 'story', storyId: '__evento', next: [] }];
        let eventi = 0, sfide = 0;
        for (const seme of [777, 778, 779, 780]) {
            const c = g.campaignForPlay('drakengrad', seme);
            const st = c.mapNodes.filter(n => n.type === 'story');
            eventi += st.length;
            sfide += c.mapNodes.filter(n => n.type === 'challenge').length;
            st.forEach(n => t.ok(c.stories[n.storyId] && c.stories[n.storyId].scelte.length === 1, `evento ${n.storyId}`));
            if (seme === 777) {
                t.uguale(forma(prima), forma(c), 'stessa forma');
                // solo sfide diventano eventi
                c.mapNodes.forEach((n, i) => { if (n.type !== prima.mapNodes[i].type) t.uguale(['challenge', 'story'], [prima.mapNodes[i].type, n.type]); });
            }
        }
        tut.mapNodes = nodi; tut.stories = storie;
        t.ok(eventi > 0 && sfide > 0, `eventi ${eventi}, sfide ${sfide}`);
    });
};
