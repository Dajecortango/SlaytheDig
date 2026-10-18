// Editor facile: modalità Avanzate, schede con nomi chiari, Home, guida (js/editor/)
const fs = require('fs');
const path = require('path');
const { caricaPagina, ROOT } = require('./ambiente');

const MODULI = {
    GENERAL_FIELDS: 'campagna', HERO_LIB_FIELDS: 'eroi', ABILITY_FIELDS: 'abilita', ITEM_FIELDS: 'armeria', ENEMY_FIELDS: 'bestiario',
    ELITE_ACTION_FIELDS: 'azioni_elite', RELIC_FIELDS: 'reliquie', BLESSING_FIELDS: 'benedizioni', CURSE_FIELDS: 'maledizioni',
    CHALLENGE_FIELDS: 'sfida', NODE_FIELDS: 'nodo', STORY_FIELDS: 'trama'
};

module.exports = (t) => {
    const ed = caricaPagina('editor.html');
    const S = ed.eval('DATI_SCHEMA');
    const html = fs.readFileSync(path.join(ROOT, 'editor.html'), 'utf8');

    t.test('Avanzate spente: i campi avanzati non si vedono, accese sì', () => {
        const campi = [{ k: 'name' }, { k: 'speciali', avanzato: true }, { k: 'heal_val', showIf: o => o.type === 'cura' }];
        t.uguale('name', ed.visibleFields(campi, {}, false).map(f => f.k).join(','));
        t.uguale('name,speciali', ed.visibleFields(campi, {}, true).map(f => f.k).join(','));
        t.uguale('name,heal_val', ed.visibleFields(campi, { type: 'cura' }, false).map(f => f.k).join(','));
    });

    // Un errore dei Controlli non deve mai puntare a un campo che il parente non vede
    // (salvo quelli che l'editor riempie sempre da solo, "automatico": id della campagna e dei nodi)
    t.test('nessun campo obbligatorio è avanzato', () => {
        Object.entries(MODULI).forEach(([nome, kind]) => ed.eval(nome).filter(f => f.avanzato && !f.automatico).forEach(f => {
            const c = S[kind][f.k.split('.')[0]];
            t.ok(!(c && c.obbligatorio), `${nome}: "${f.k}" è obbligatorio ma avanzato`);
        }));
    });

    t.test('i campi JSON sono avanzati; gli effetti speciali (con i menu) e la scheda Elite no', () => {
        Object.keys(MODULI).forEach(nome => ed.eval(nome).filter(f => f.type === 'json')
            .forEach(f => t.ok(f.avanzato, `${nome}: "${f.k}" dovrebbe essere avanzato`)));
        Object.keys(MODULI).forEach(nome => ed.eval(nome).filter(f => f.type === 'speciali')
            .forEach(f => t.ok(!f.avanzato, `${nome}: "${f.k}" deve restare visibile`)));
        t.ok(/data-tab="elite" class="ed-lib-tab">/.test(html), 'scheda Elite visibile senza Avanzate');
        const nota = ed.eliteSummaryHtml({ fasi: [{ soglia: 50, testo: 'Furia!', azioni: ['furore', 'predatore'] }] }, 'boia');
        t.ok(/Furore/.test(nota) && /Predatore/.test(nota) && /50%/.test(nota), nota);
    });

    t.test('schede: nessun nome ripetuto, nomi semplici per la libreria', () => {
        const nav = html.slice(html.indexOf('id="edTabs"'), html.indexOf('</nav>'));
        const etichette = [...nav.matchAll(/data-tab="[^"]+"[^>]*>([^<]+)</g)].map(m => m[1].trim());
        t.ok(etichette.length >= 15, `schede trovate: ${etichette.length}`);
        t.uguale(etichette.length, new Set(etichette).size, etichette.join(' | '));
        const L = ed.eval('LIB_LABELS');
        t.uguale('Nemici', L.bestiario);
        t.uguale('Oggetti', L.armeria);
        t.uguale('Schede degli eroi', L.eroi);
    });

    t.test('Home: una campagna nuova parte con scontro, riposo e boss collegati', () => {
        const c = ed.blankCampaign();
        t.uguale(3, c.mapNodes.length);
        const [a, b, boss] = c.mapNodes;
        t.ok(a.active && !b.active && !boss.active, 'solo il primo è la partenza');
        t.uguale('1', a.next.join(','));
        t.uguale('2', b.next.join(','));
        t.uguale(0, boss.next.length, 'il boss è il finale');
        t.ok(a.type === 'combat' && b.type === 'rest' && boss.type === 'combat' && boss.level > b.level);
        t.uguale(0, ed.controllaCampagna(c).filter(p => p.livello === 'errore').length, 'rispetta la scheda dei dati');
    });

    t.test('Home: la copia di una campagna ha un id nuovo e non tocca quella di partenza', () => {
        const orig = ed.eval('rawCampaigns()').tutorial;
        const ids = Object.keys(ed.eval('rawCampaigns()'));
        const c = ed.campaignCopy(orig, 'Un brusco risveglio');
        t.ok(!ids.includes(c.id), `id nuovo: ${c.id}`);
        t.ok(/^[a-z0-9_]+$/.test(c.id), c.id);
        t.uguale('Un brusco risveglio', c.title);
        t.uguale(orig.mapNodes.length, c.mapNodes.length);
        c.mapNodes[0].title = 'cambiato';
        t.ok(orig.mapNodes[0].title !== 'cambiato', 'oggetto separato');
        t.ok(!ids.includes(ed.campaignCopy(orig, '').id), 'senza titolo');
    });

    t.test('guida: cinque passi, ognuno su un elemento che esiste', () => {
        const passi = ed.eval('GUIDA_PASSI');
        t.uguale(5, passi.length);
        const home = fs.readFileSync(path.join(ROOT, 'js', 'editor', 'home.js'), 'utf8');
        passi.forEach(p => t.ok(html.includes(`id="${p.sel}"`) || home.includes(`id="${p.sel}"`), `manca #${p.sel}`));
    });

    // ---------- Fase 2: moduli intelligenti ----------
    t.test('moduli a gruppi: ogni campo di oggetti e nemici ha il suo gruppo', () => {
        ['ITEM_FIELDS', 'ENEMY_FIELDS', 'ABILITY_FIELDS'].forEach(nome => ed.eval(nome).forEach(f => t.ok(f.gruppo, `${nome}: "${f.k}" senza gruppo`)));
        t.ok(ed.eval('ITEM_FIELDS').filter(f => f.gruppo === 'Altri bonus').length >= 4, 'Altri bonus');
    });

    t.test('un consumabile non mostra Forza, Danno, Armatura e bonus; un\'arma non mostra la cura', () => {
        const campi = ed.eval('ITEM_FIELDS');
        const pozione = ed.visibleFields(campi, { type: 'consumable_heal' }, false).map(f => f.k);
        ['str', 'dmg', 'armor', 'att_penalty', 'fth', 'int', 'def_bonus'].forEach(k => t.ok(!pozione.includes(k), `pozione: ${k}`));
        t.ok(pozione.includes('heal_val'), 'pozione: HP curati');
        const arma = ed.visibleFields(campi, {}, false).map(f => f.k);
        t.ok(arma.includes('str') && arma.includes('dmg') && !arma.includes('heal_val'), 'arma');
    });

    t.test('effetti di reliquie, maledizioni e passive: con i menu, non in JSON, e visibili senza Avanzate', () => {
        ['RELIC_FIELDS', 'CURSE_FIELDS', 'ABILITY_FIELDS'].forEach(nome => {
            const f = ed.eval(nome).find(x => x.k === 'effects');
            t.ok(f && f.type === 'effetti' && !f.avanzato, nome);
        });
    });

    t.test('avviso sui numeri fuori dal solito, calcolato dalla libreria', () => {
        t.ok(/da \d+ a \d+/.test(ed.numberRangeWarning('bestiario', 'hp', { name: 'Gigante', hp: 500 })), 'HP 500');
        t.uguale('', ed.numberRangeWarning('bestiario', 'hp', { name: 'Lupo', hp: 10 }));
        t.ok(/da \d+ a \d+/.test(ed.numberRangeWarning('armeria', 'str', { rarity: 'comune', str: 9 })), 'Forza 9 su un comune');
        t.uguale('', ed.numberRangeWarning('armeria', 'str', { rarity: 'comune' }), 'campo vuoto');
    });

    t.test('anteprima dei nemici', () => {
        const html = ed.eval('PREVIEWS').bestiario({ name: 'Lupo', hp: 8, maxHp: 8, att: 6, ca: 6, dmg: 1 });
        t.ok(/Lupo/.test(html) && /8/.test(html), html);
    });

    t.test('"Crea nuovo…" da un nodo: il nemico creato finisce nel nodo', () => {
        const nodo = { id: 9, type: 'combat', enemy: '' };
        ed.__nodo = nodo;
        ed.eval(`pendingPick = { kind: 'bestiario', obj: __nodo, key: 'enemy', tab: 'map', label: 'nodo 9' }`);
        ed.eval(`finishPendingPick('bestiario', 'lupo_nuovo')`);
        t.uguale('lupo_nuovo', nodo.enemy);
        t.ok(ed.eval('pendingPick') === null || ed.eval('pendingPick.done'), 'scelta chiusa');
    });

    // ---------- Fase 3: mappa guidata ----------
    const mappaProva = () => {
        const c = ed.blankCampaign('Prova mappa');
        c.mapNodes[0].enemy = Object.keys(ed.eval('lib').bestiario)[0];
        c.mapNodes[2].enemy = c.mapNodes[0].enemy;
        return c;
    };
    const msgs = (node, c) => ed.nodeProblems(node, c).map(p => `${p.livello}:${p.msg}`).join(' | ');

    t.test('mappa: un nodo dice cosa gli manca', () => {
        const c = mappaProva();
        t.ok(!/errore/.test(msgs(c.mapNodes[0], c)), msgs(c.mapNodes[0], c));
        c.mapNodes[2].enemy = '';
        t.ok(/errore:Scontro senza nemico/.test(msgs(c.mapNodes[2], c)), msgs(c.mapNodes[2], c));
        c.mapNodes[1].next = [];
        t.ok(/errore:Senza uscita/.test(msgs(c.mapNodes[1], c)), 'nodo in mezzo senza uscita');
        t.ok(!/Senza uscita/.test(msgs(c.mapNodes[2], c)), 'il finale non ha uscita per forza');
        t.ok(/errore:Non si arriva qui/.test(msgs(c.mapNodes[2], c)), 'boss irraggiungibile');
        c.mapNodes.push({ id: 7, level: 1, x: 100, type: 'challenge', challengeId: '', next: [2] });
        t.ok(/errore:Prova non scelta/.test(msgs(c.mapNodes[3], c)), msgs(c.mapNodes[3], c));
        t.ok(/consiglio:Senza immagine/.test(msgs(c.mapNodes[1], c)), 'riposo senza immagine');
    });

    t.test('mappa: nodi raggiungibili dalla partenza', () => {
        const c = mappaProva();
        t.uguale('0,1,2', [...ed.reachableNodeIds(c.mapNodes)].sort().join(','));
        c.mapNodes.push({ id: 5, level: 1, x: 100, type: 'rest', next: [2] });
        t.ok(!ed.reachableNodeIds(c.mapNodes).has(5), 'nodo staccato');
    });

    t.test('mappa: "aggiungi un nodo dopo" lo crea al livello sopra, già collegato; collega e scollega', () => {
        const c = mappaProva();
        const n = ed.addNodeAfterIn(c, 1);
        t.uguale(2, n.level);
        t.ok(c.mapNodes[1].next.includes(n.id), 'collegato dal nodo 1');
        t.ok(!c.mapNodes.some((x, i) => c.mapNodes.findIndex(y => y.id === x.id) !== i), 'id unici');
        t.uguale(0, n.next.length);
        ed.toggleNodeLinkIn(c, n.id, 2);
        t.ok(n.next.includes(2), 'collegato al boss');
        ed.toggleNodeLinkIn(c, n.id, 2);
        t.ok(!n.next.includes(2), 'scollegato');
    });

    t.test('mappa: livello, posizione e id sono avanzati; "Porta a" no', () => {
        const campi = ed.eval('NODE_FIELDS');
        ['level', 'x', 'id'].forEach(k => t.ok(campi.find(f => f.k === k).avanzato, k));
        t.uguale(1, campi.filter(f => f.k === 'next').length, 'un solo campo per i collegamenti');
        const porta = campi.find(f => f.type === 'nodelinks');
        t.ok(porta && !porta.avanzato, 'Porta a');
    });

    // ---------- Fase 4: rete di sicurezza ----------
    t.test('Annulla e Ripeti: tornano indietro e avanti di un passo', () => {
        const p = caricaPagina('editor.html');
        const titolo = p.eval('camp.title');
        p.eval(`camp.title = 'Cambiato'; markDirty();`);
        t.uguale('Cambiato', p.eval('camp.title'));
        p.eval('undo()');
        t.uguale(titolo, p.eval('camp.title'), 'annullato');
        p.eval('redo()');
        t.uguale('Cambiato', p.eval('camp.title'), 'rifatto');
        p.eval(`lib.bestiario[Object.keys(lib.bestiario)[0]].hp = 999; markLibDirty('bestiario');`);
        p.eval('undo()');
        t.ok(p.eval('lib.bestiario[Object.keys(lib.bestiario)[0]].hp') !== 999, 'anche la libreria');
        t.ok(!p.eval('libDirty.has("bestiario")'), 'e il segno "da salvare"');
    });

    t.test('Annulla: le modifiche ravvicinate allo stesso elemento sono un passo solo', () => {
        const p = caricaPagina('editor.html');
        const titolo = p.eval('camp.title');
        p.eval(`camp.title = 'A'; markDirty(); camp.title = 'AB'; markDirty(); camp.title = 'ABC'; markDirty();`);
        p.eval('undo()');
        t.uguale(titolo, p.eval('camp.title'));
    });

    t.test('copia solo per questa campagna: la campagna usa la copia, le altre no', () => {
        const c = { mapNodes: [{ id: 0, enemy: 'lupo' }, { id: 1, enemy: 'orso' }], heroes: [], initialArmory: ['spada', 'ascia'], lootItems: null,
            challenges: { a: { reward: 'anello', strade: [{ reward: 'anello' }] } } };
        ed.replaceCampaignRefsIn(c, 'bestiario', 'lupo', 'lupo_2');
        t.uguale('lupo_2,orso', c.mapNodes.map(n => n.enemy).join(','));
        ed.replaceCampaignRefsIn(c, 'armeria', 'spada', 'spada_2');
        t.uguale('spada_2,ascia', c.initialArmory.join(','));
        ed.replaceCampaignRefsIn(c, 'reliquie', 'anello', 'anello_2');
        t.ok(c.challenges.a.reward === 'anello_2' && c.challenges.a.strade[0].reward === 'anello_2', 'reliquia anche nelle strade');
        const predef = ed.eval('lib.lootPredefinito || []');
        if (predef.length) {
            const c2 = { initialArmory: [], lootItems: null };
            ed.replaceCampaignRefsIn(c2, 'armeria', predef[0], 'copia_x');
            t.ok(Array.isArray(c2.lootItems) && c2.lootItems[0] === 'copia_x', 'bottino predefinito: la campagna passa a un elenco suo');
            t.ok(ed.eval('lib.lootPredefinito[0]') === predef[0], 'il bottino predefinito non cambia');
        }
    });

    // ---------- Correzioni dopo la revisione ----------
    t.test('Annulla dopo un salvataggio: torna "da salvare" se è diverso da ciò che è su disco', () => {
        const p = caricaPagina('editor.html');
        p.eval(`camp.title = 'Salvato'; markDirty(); historyMarkSaved(); dirty = false;`);
        p.eval('undo()');
        t.ok(p.eval('dirty'), 'il titolo su disco è "Salvato", qui no: da salvare');
        p.eval('redo()');
        t.ok(!p.eval('dirty'), 'di nuovo uguale al salvataggio');
    });

    t.test('"Crea nuovo…" e "Collega a…" si annullano cambiando scheda', () => {
        const p = caricaPagina('editor.html');
        p.eval(`pendingPick = { kind: 'bestiario', obj: {}, key: 'enemy', tab: 'map' }; mapLink = { from: 0, mode: 'link' }; switchTab('armeria');`);
        t.ok(p.eval('pendingPick') === null, 'pendingPick');
        t.ok(p.eval('mapLink') === null, 'mapLink');
    });

    t.test('il nodo ha un solo campo per i collegamenti', () => {
        t.uguale(1, ed.eval('NODE_FIELDS').filter(f => f.k === 'next').length);
    });

    // ---------- Ancora più semplice: menu cercabili, eroi a carte, passi guidati ----------
    t.test('menu: ordine alfabetico, "Nessuna" in cima e "Crea nuova…" in fondo', () => {
        const opts = ed.ordinaOpzioni([['__new', '+ Crea nuova…'], ['z', 'Zanna'], ['', '— Nessuna —'], ['a', 'àncora'], ['b', 'Bestia'], ['__custom', 'Personalizzata…']]);
        t.uguale(',a,b,z,__new,__custom', opts.map(o => o[0]).join(','));
    });

    t.test('menu: la ricerca ignora maiuscole e accenti e tiene le voci fisse', () => {
        const opts = [['', '—'], ['lupo', 'Lupo grigio'], ['orso', 'Orso'], ['sciamano', 'Sciamàno'], ['__new', '+ Crea nuovo…']];
        t.uguale(',lupo,__new', ed.opzioniTrovate(opts, 'LUP').map(o => o[0]).join(','));
        t.uguale(',sciamano,__new', ed.opzioniTrovate(opts, 'sciamano').map(o => o[0]).join(','));
        t.uguale(5, ed.opzioniTrovate(opts, '').length);
    });

    t.test('i menu di nemici, prove e testi del nodo sono cercabili; il tipo di nodo no (ha un ordine suo)', () => {
        const campi = ed.eval('NODE_FIELDS');
        ['enemy', 'challengeId', 'treasureId', 'merchantId', 'restId', 'storyId'].forEach(k => t.ok(campi.find(f => f.k === k).cercabile, k));
        t.ok(!campi.find(f => f.k === 'type').cercabile, 'type');
        const nemico = Object.keys(ed.eval('lib').bestiario)[0];
        const [, nome] = campi.find(f => f.k === 'enemy').miniatura({ enemy: nemico });
        t.uguale(ed.eval('lib').bestiario[nemico].name, nome);
    });

    t.test('eroi della campagna: carte in ordine alfabetico, un clic li aggiunge e li toglie', () => {
        const p = caricaPagina('editor.html');
        const nomi = p.heroCardsOrder(p.eval('lib').eroi).map(([, h]) => h.name);
        t.uguale(JSON.stringify([...nomi].sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' }))), JSON.stringify(nomi));
        const id = Object.keys(p.eval('lib').eroi).find(k => !p.eval('camp.heroes').includes(k));
        if (!id) return;
        p.toggleCampaignHero(id);
        t.ok(p.eval('camp.heroes').includes(id), 'aggiunto');
        p.toggleCampaignHero(id);
        t.ok(!p.eval('camp.heroes').includes(id), 'tolto');
    });

    t.test('oggetti della campagna: carte con icona in ordine alfabetico, un clic li aggiunge e li toglie', () => {
        const p = caricaPagina('editor.html');
        const voci = p.itemCardsOrder(p.eval('lib').armeria);
        const nomi = voci.map(([, it]) => it.name);
        t.uguale(JSON.stringify([...nomi].sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' }))), JSON.stringify(nomi));
        const [id, it] = voci[0];
        const html = p.edItemCardHtml(id, it, false, true);
        t.ok(!it.icon || html.includes(it.icon), 'icona nella carta');
        p.eval(`selection.itemList = 'initialArmory'`);
        const nuovo = voci.map(([k]) => k).find(k => !p.eval('camp.initialArmory').includes(k));
        p.toggleCampaignItem(nuovo);
        t.ok(p.eval('camp.initialArmory').includes(nuovo), 'aggiunto');
        p.toggleCampaignItem(nuovo);
        t.ok(!p.eval('camp.initialArmory').includes(nuovo), 'tolto');
        p.eval(`selection.itemList = 'lootItems'; camp.lootItems = null`);
        p.toggleCampaignItem(nuovo);
        t.ok(p.eval('camp.lootItems') === null, 'il bottino predefinito non si cambia da qui');
    });

    t.test('cosa fare adesso: eroi, mappa senza errori, prova nel gioco', () => {
        const c = mappaProva();
        c.heroes = [];
        let passi = ed.nextSteps(c, [], false);
        t.uguale('false,true,false', passi.map(p => p.fatto).join(','));
        c.heroes = ['qualcuno'];
        passi = ed.nextSteps(c, [{ level: 'error', tab: 'map' }, { level: 'warn', tab: 'map' }], false);
        t.uguale('true,false,false', passi.map(p => p.fatto).join(','));
        t.ok(/1 punto/.test(passi[1].testo), passi[1].testo);
        t.uguale('true,true,true', ed.nextSteps(c, [], true).map(p => p.fatto).join(','));
    });
};
