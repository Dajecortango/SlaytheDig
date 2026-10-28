// Immagini caricate nell'editor (js/editor/stato.js): nome pulito, nome dell'elemento al posto di uno generico,
// cartelle che restano nel formato originale (icone, interfaccia, cursori)
const { caricaPagina } = require('./ambiente');

module.exports = (t) => {
    const ed = caricaPagina('editor.html');

    t.test('nome dell\'elemento: eroe, ferito, nodo senza "Livello N -", copertina', () => {
        t.uguale('zeno', ed.imageNameHint({ name: 'Zeno' }, 'portrait'));
        t.uguale('aurelio_dignitas_ferito', ed.imageNameHint({ name: 'Aurelio Dignitas' }, 'portraitWounded'));
        t.uguale('i_gropiceri_dei_crinali', ed.imageNameHint({ title: 'Livello 12 - I Gropiceri dei Crinali' }, 'image'));
        t.uguale('copertina_fredlos', ed.imageNameHint({ title: 'Fredlös' }, 'coverImage'));
        t.uguale('', ed.imageNameHint({}, 'image'));
    });

    t.test('un nome generico prende quello dell\'elemento, uno parlante resta', () => {
        ['Screenshot 2026-10-27 153151.png', 'screenshot_2026-10-27_153151.png', 'file_000000002d2c8210abc.png', 'IMG_2041.JPG',
            'Gemini_Generated_Image_x1y2.png', 'ChatGPT Image 27 ott 2026.png', '20261027_153151.jpg', 'image.png']
            .forEach(n => t.uguale('zeno', ed.imageBaseName(n, 'zeno'), n));
        t.uguale('i_contadini_orgogliosi_di_esinov', ed.imageBaseName('i contadini orgogliosi di esinov.png', 'contadini'));
        t.uguale('screenshot_1', ed.imageBaseName('Screenshot 1.png', ''), 'senza elemento resta il nome del file');
    });

    t.test('icone, interfaccia e cursori non si convertono; il resto sì', () => {
        ['immagini/icone', 'immagini/ui', 'immagini/cursori'].forEach(c => t.ok(ed.eval('IMAGE_KEEP_FOLDER').test(c), c));
        ['immagini', 'immagini/ritratti', 'immagini/bestiario', 'immagini/fredlos_parte_1'].forEach(c => t.ok(!ed.eval('IMAGE_KEEP_FOLDER').test(c), c));
        t.uguale(1024, ed.eval('IMAGE_MAX_SIDE'));
    });

    t.test('due immagini con lo stesso nome non si coprono', () => {
        t.uguale('immagini/ritratti/zeno.webp', ed.freeAssetPath('immagini/ritratti', 'zeno', '.webp'));
        ed.eval('pendingAssets').set('immagini/ritratti/zeno.webp', {});
        t.uguale('immagini/ritratti/zeno_2.webp', ed.freeAssetPath('immagini/ritratti', 'zeno', '.webp'));
        ed.eval('pendingAssets').clear();
    });
};
