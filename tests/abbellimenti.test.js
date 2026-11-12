// Abbellimenti: le decisioni pure dietro titolo del capitolo e carte. Le animazioni si guardano nel browser.
module.exports = (t, carica) => {
    const g = carica();

    t.test('titolo del capitolo: la riga di lore sono le prime frasi intere, mai più di CHAPTER_LORE_MAX', () => {
        const max = g.eval('CHAPTER_LORE_MAX');
        t.uguale('', g.chapterLore(''));
        t.uguale('', g.chapterLore(undefined));
        t.uguale('Una frase corta.', g.chapterLore('  Una   frase corta. '));
        const due = 'Prima frase abbastanza lunga da contare. ' + 'Seconda frase che porta il testo ben oltre il limite previsto per la riga. '.repeat(3);
        // Entrano la prima e la seconda frase (117 caratteri), la terza porterebbe oltre il limite
        t.uguale('Prima frase abbastanza lunga da contare. Seconda frase che porta il testo ben oltre il limite previsto per la riga.', g.chapterLore(due));
        t.uguale('Frase uno.', g.chapterLore('Frase uno. ' + 'x'.repeat(200) + '.'), 'la seconda non entra: solo la prima');
        const lunga = g.chapterLore('parola '.repeat(80));
        t.ok(lunga.length <= max + 1 && lunga.endsWith('…'), 'una frase sola troppo lunga: tagliata a una parola');
        Object.values(g.eval('campaignsDatabase')).forEach(c => t.ok(g.chapterLore(c.description).length <= max + 1, c.id));
    });

    t.test('carta dell\'eroe: "ferito" con 2 HP o meno, non da caduto né in salute', () => {
        const eroe = hp => ({ name: 'A', hp, maxHp: 5, dmg: 1, str: 1, int: 1, fth: 1, base_armor: 0, current_armor: 0, items: [] });
        const classi = hp => (g.heroCardHtml(eroe(hp)).match(/class="hero-mini-card ([^"]*)"/) || [])[1].split(/\s+/);
        t.ok(classi(2).includes('ferito') && classi(1).includes('ferito'));
        t.ok(!classi(3).includes('ferito'));
        t.ok(!classi(0).includes('ferito') && classi(0).includes('dead'));
    });
};
