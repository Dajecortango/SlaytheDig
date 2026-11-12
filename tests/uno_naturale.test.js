// 1 sul dado di un eroe con immaginiUno / suoniUno (Aiace): a rotazione un'immagine in dissolvenza e un suono
module.exports = (t, carica) => {
    t.test('1 sul dado di Aiace: immagine e suono a rotazione, niente con altri valori o altri eroi', () => {
        const g = carica();
        const aiace = g.eval("LIBRERIA.eroi.aiace_dignitas");
        t.ok(aiace.immaginiUno.length >= 2 && aiace.suoniUno.length >= 2, 'Aiace ha immagini e suoni');
        g.eval(`globalThis.__suoni = []; globalThis.__img = []; playSfx = src => __suoni.push(src);
            const app = document.body.appendChild.bind(document.body);
            document.body.appendChild = el => { if (el && el.className === 'uno-apparizione') { __img.push(el.innerHTML); globalThis.__ultimo = el; } return app(el); };`);
        const giri = aiace.immaginiUno.length * aiace.suoniUno.length;
        for (let i = 0; i < giri + 1; i++) g.mostraImmagineUno(1, { name: 'Aiace Dignitas' });
        g.mostraImmagineUno(2, { name: 'Aiace Dignitas' });
        g.mostraImmagineUno(1, { name: 'Enea Dignitas' });
        const img = g.eval('__img'), suoni = g.eval('__suoni');
        t.uguale(giri + 1, img.length, 'solo i 1 di Aiace');
        t.uguale(giri + 1, suoni.length);
        aiace.immaginiUno.forEach((p, i) => t.ok(img[i].includes(p), `immagine ${i + 1} a turno`));
        t.ok(img[giri].includes(aiace.immaginiUno[giri % aiace.immaginiUno.length]), 'poi ricomincia');
        aiace.suoniUno.forEach((p, i) => t.uguale(p, suoni[i]));
        // Online il suono viaggia nell'elemento: la pagina del giocatore lo suona una volta per comparsa (data-uno)
        t.uguale(suoni[giri], g.eval('__ultimo.dataset.suono'));
        t.ok(g.eval('__ultimo.dataset.uno') !== undefined);
        g.mostraImmagineUno(1, 'Aiace Dignitas');  // anche col solo nome (preghiera)
        t.uguale(giri + 2, g.eval('__suoni').length);
    });
};
