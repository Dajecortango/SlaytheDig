/* ==========================================================================
   EDITOR: MODULI GENERICI
   Percorsi con il punto (getPath / setPath), inquadratura dei ritratti trascinando
   l'anteprima, renderForm (tutti i tipi di campo, effetti, liste di riferimenti).
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

/* ---------- Moduli generici ---------- */
// I campi possono indicare un percorso con il punto (es. "combat.dice" = obj.combat.dice)
function getPath(obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function setPath(obj, path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((o, k) => (o[k] && typeof o[k] === 'object' ? o[k] : (o[k] = {})), obj);
    target[last] = value;
}
function deletePath(obj, path) {
    const keys = path.split('.');
    const last = keys.pop();
    const parents = [obj];
    for (const k of keys) {
        const next = parents[parents.length - 1][k];
        if (!next || typeof next !== 'object') return;
        parents.push(next);
    }
    delete parents[parents.length - 1][last];
    // Toglie gli oggetti rimasti vuoti (es. "combat": {})
    for (let i = keys.length - 1; i >= 0; i--) {
        if (Object.keys(parents[i + 1]).length) break;
        delete parents[i][keys[i]];
    }
}

// Valori predefiniti e zoom della cinematica: HERO_PORTRAIT_DEFAULTS e strikeZoomFor in js/comune.js
const parsePos = pos => (pos || HERO_PORTRAIT_DEFAULTS.pos).split(/\s+/).map(v => parseFloat(v)).map(v => (Number.isFinite(v) ? v : 50));
const round1 = v => Math.round(v * 10) / 10;

// Modulo "Inquadratura del ritratto": per il ritratto normale e per quello da ferito
// un'icona da trascinare, il cursore dello zoom e l'anteprima della cinematica d'attacco.
function portraitFrameEditor(hero, onChange) {
    const box = document.createElement('div');
    box.className = 'ed-portrait-frames';
    if (!hero.portrait) {
        box.innerHTML = '<p class="ed-help">Carica prima un ritratto.</p>';
        return box;
    }

    const variants = [{ label: 'Ritratto', src: 'portrait', pos: 'portraitPos', zoom: 'portraitZoom' }];
    if (hero.portraitWounded) variants.push({ label: 'Da ferito', src: 'portraitWounded', pos: 'portraitWoundedPos', zoom: 'portraitWoundedZoom', wounded: true });

    const current = v => {
        const pos = hero[v.pos] || (v.wounded && hero.portraitPos) || HERO_PORTRAIT_DEFAULTS.pos;
        const zoom = Number(hero[v.zoom]) || (v.wounded && Number(hero.portraitZoom)) || HERO_PORTRAIT_DEFAULTS.zoom;
        return { pos, zoom };
    };
    const strikeZoom = v => Number(hero.portraitStrikeZoom) || strikeZoomFor(current(v).zoom);

    const cards = variants.map(v => {
        const card = document.createElement('div');
        card.className = 'ed-portrait-card';
        card.innerHTML = `
            <strong>${esc(v.label)}</strong>
            <div class="ed-portrait-icon" title="Trascina per spostare l'inquadratura"><img alt="" draggable="false"></div>
            <label class="ed-portrait-zoom">Zoom <input type="range" min="1" max="3.5" step="0.05"><output></output></label>
            <div class="ed-portrait-strike" title="Anteprima della cinematica d'attacco"><img alt="" draggable="false"></div>
            <small class="ed-portrait-info"></small>
            <div class="ed-portrait-actions">
                ${v.wounded
                    ? '<button type="button" class="btn-small" data-act="same">Come il ritratto normale</button>'
                    : '<button type="button" class="btn-small" data-act="reset">Ripristina</button>'}
            </div>`;
        const icon = card.querySelector('.ed-portrait-icon img');
        const strike = card.querySelector('.ed-portrait-strike img');
        const range = card.querySelector('input[type=range]');
        const out = card.querySelector('output');
        const info = card.querySelector('.ed-portrait-info');
        icon.src = strike.src = assetUrl(hero[v.src]);

        const paint = () => {
            const { pos, zoom } = current(v);
            const sz = strikeZoom(v);
            Object.assign(icon.style, { objectPosition: pos, transformOrigin: pos, transform: `scale(${zoom})` });
            Object.assign(strike.style, { objectPosition: pos, transformOrigin: pos, transform: `scale(${sz})` });
            range.value = zoom;
            out.textContent = zoom.toFixed(2);
            info.textContent = `Centro ${pos} · zoom cinematica ${sz.toFixed(2)}${hero.portraitStrikeZoom ? '' : ' (automatico)'}`;
        };
        card.paint = paint;

        range.addEventListener('input', () => {
            hero[v.zoom] = Number(range.value);
            if (v.wounded && !hero[v.pos]) hero[v.pos] = current(v).pos;
            onChange(v.zoom);
            cards.forEach(c => c.paint());
        });

        // Trascinando verso destra l'immagine si sposta a destra: il centro inquadrato va a sinistra
        const frame = card.querySelector('.ed-portrait-icon');
        frame.addEventListener('pointerdown', e => {
            e.preventDefault();
            frame.setPointerCapture(e.pointerId);
            const start = { x: e.clientX, y: e.clientY, pos: parsePos(current(v).pos), zoom: current(v).zoom };
            const size = frame.getBoundingClientRect().width;
            const move = ev => {
                const x = Math.min(100, Math.max(0, start.pos[0] - (ev.clientX - start.x) / size * 100 / start.zoom));
                const y = Math.min(100, Math.max(0, start.pos[1] - (ev.clientY - start.y) / size * 100 / start.zoom));
                hero[v.pos] = `${round1(x)}% ${round1(y)}%`;
                if (v.wounded && !hero[v.zoom]) hero[v.zoom] = start.zoom;
                paint();
            };
            const up = () => {
                frame.removeEventListener('pointermove', move);
                frame.removeEventListener('pointerup', up);
                frame.removeEventListener('pointercancel', up);
                onChange(v.pos);
            };
            frame.addEventListener('pointermove', move);
            frame.addEventListener('pointerup', up);
            frame.addEventListener('pointercancel', up);
        });

        card.querySelector('.ed-portrait-actions').addEventListener('click', e => {
            const act = e.target.closest('button') && e.target.closest('button').dataset.act;
            if (!act) return;
            delete hero[v.pos];
            delete hero[v.zoom];
            if (act === 'reset' && !v.wounded) { hero.portraitPos = HERO_PORTRAIT_DEFAULTS.pos; hero.portraitZoom = HERO_PORTRAIT_DEFAULTS.zoom; }
            onChange(v.pos);
            cards.forEach(c => c.paint());
        });
        return card;
    });

    // Zoom della cinematica: automatico (calcolato dallo zoom dell'icona) oppure scelto a mano
    const strikeRow = document.createElement('label');
    strikeRow.className = 'ed-portrait-zoom ed-portrait-strike-zoom';
    strikeRow.innerHTML = `<input type="checkbox"> Zoom della cinematica scelto a mano <input type="range" min="1" max="3" step="0.05"><output></output>`;
    const [manual, strikeRange] = strikeRow.querySelectorAll('input');
    const strikeOut = strikeRow.querySelector('output');
    const paintStrike = () => {
        manual.checked = !!hero.portraitStrikeZoom;
        strikeRange.disabled = !manual.checked;
        strikeRange.value = strikeZoom(variants[0]);
        strikeOut.textContent = Number(strikeRange.value).toFixed(2);
    };
    manual.addEventListener('change', () => {
        if (manual.checked) hero.portraitStrikeZoom = strikeZoom(variants[0]);
        else delete hero.portraitStrikeZoom;
        onChange('portraitStrikeZoom');
        paintStrike();
        cards.forEach(c => c.paint());
    });
    strikeRange.addEventListener('input', () => {
        hero.portraitStrikeZoom = Number(strikeRange.value);
        onChange('portraitStrikeZoom');
        paintStrike();
        cards.forEach(c => c.paint());
    });

    box.append(...cards, strikeRow);
    cards.forEach(c => c.paint());
    paintStrike();
    return box;
}

function renderForm(container, obj, fields, onChange) {
    container.innerHTML = '';
    const form = document.createElement('div');
    form.className = 'ed-form';
    fields.forEach(f => {
        if (f.showIf && !f.showIf(obj)) return;
        const wrap = document.createElement('div');
        wrap.className = 'ed-field' + (f.wide ? ' wide' : '');
        const id = `f_${f.k.replace(/\./g, '_')}_${Math.random().toString(36).slice(2, 7)}`;
        wrap.innerHTML = `<label for="${id}">${esc(f.label)}</label>`;
        let input;
        const value = getPath(obj, f.k);

        // Riferimento a una libreria (reliquie, maledizioni) oppure elemento personalizzato scritto nella sfida
        if (f.type === 'libref') {
            input = document.createElement('select');
            const entries = Object.entries(lib[f.lib]).map(([k, v]) => [k, `${v.name} — ${v.desc || ''}`]);
            const mode = value == null ? '' : typeof value === 'string' ? value : '__custom';
            if (typeof value === 'string' && !lib[f.lib][value]) entries.push([value, `${value} (non trovato)`]);
            input.innerHTML = [['', '— Nessuna —'], ...entries, ['__custom', 'Personalizzata (scritta nella sfida)…']]
                .map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('');
            input.value = mode;
            input.id = id;
            input.addEventListener('change', () => {
                if (input.value === '') obj[f.k] = null;
                else if (input.value === '__custom') obj[f.k] = typeof value === 'object' && value ? value : f.custom();
                else obj[f.k] = input.value;
                onChange(f.k);
                render();
            });
            wrap.appendChild(input);
            if (mode === '__custom') {
                const ta = document.createElement('textarea');
                ta.className = 'ed-json';
                ta.value = JSON.stringify(value, null, 2);
                ta.addEventListener('input', () => {
                    try { obj[f.k] = JSON.parse(ta.value); ta.classList.remove('ed-invalid'); onChange(f.k); }
                    catch (err) { ta.classList.add('ed-invalid'); ta.title = err.message; }
                });
                wrap.appendChild(ta);
            } else if (mode) {
                wrap.insertAdjacentHTML('beforeend', `<a href="#" class="ed-goto" ${azione('gotoLibrary', f.lib, mode)}>Modifica in ${LIB_LABELS[f.lib]}</a>`);
            }
            if (f.help) wrap.insertAdjacentHTML('beforeend', `<span class="ed-help">${esc(f.help)}</span>`);
            form.appendChild(wrap);
            return;
        }

        // Inquadratura dei ritratti (icona e cinematica d'attacco), come le calcola js/game.js
        if (f.type === 'portraitframe') {
            wrap.appendChild(portraitFrameEditor(obj, onChange));
            if (f.help) wrap.insertAdjacentHTML('beforeend', `<span class="ed-help">${esc(f.help)}</span>`);
            form.appendChild(wrap);
            return;
        }

        // Elenco di id di una libreria (abilità di un eroe): togli, riordina, aggiungi
        if (f.type === 'reflist') {
            const list = Array.isArray(value) ? value : (obj[f.k] = []);
            const box = document.createElement('div');
            box.className = 'ed-picklist';
            box.innerHTML = list.map((ref, i) => {
                const el = typeof ref === 'string' ? lib[f.lib][ref] : ref;
                const label = typeof ref !== 'string' ? `${ref.name} (scritta nell'eroe)` : el ? el.name : `${ref} (non trovata)`;
                const sub = el ? abilitySummary(el) : '';
                return `<div class="ed-pick" data-i="${i}">
                    ${el && el.icon ? `<img class="ed-list-portrait" src="${esc(assetUrl(el.icon))}" alt="" loading="lazy" decoding="async" ${azioneSu('error', 'nascondiImmagine', '$el')}>` : ''}
                    <span>${esc(label)}<small>${esc(sub)}</small></span>
                    ${i > 0 ? '<button type="button" class="btn-small" data-act="up" title="Sposta su">▲</button>' : ''}
                    ${typeof ref === 'string' && el ? '<button type="button" class="btn-small" data-act="goto">Modifica</button>' : ''}
                    <button type="button" class="btn-small ed-danger" data-act="del">Togli</button>
                </div>`;
            }).join('') || '<p class="ed-help">Nessuna abilità.</p>';
            box.addEventListener('click', e => {
                const btn = e.target.closest('button[data-act]');
                if (!btn) return;
                const i = Number(btn.closest('.ed-pick').dataset.i);
                if (btn.dataset.act === 'goto') { gotoLibrary(f.lib, list[i]); return; }
                if (btn.dataset.act === 'del') list.splice(i, 1);
                if (btn.dataset.act === 'up') [list[i - 1], list[i]] = [list[i], list[i - 1]];
                onChange(f.k);
                render();
            });
            const available = Object.entries(lib[f.lib]).filter(([k]) => !list.includes(k));
            const row = document.createElement('div');
            row.className = 'ed-add-row';
            const select = document.createElement('select');
            select.id = id;
            select.innerHTML = available.map(([k, v]) => `<option value="${esc(k)}">${esc(v.name)} — ${v.isCombatActive ? 'Attiva' : 'Passiva'}</option>`).join('');
            const add = document.createElement('button');
            add.type = 'button';
            add.className = 'btn-small';
            add.textContent = `Aggiungi da ${LIB_LABELS[f.lib]}`;
            add.disabled = !available.length;
            add.addEventListener('click', () => { if (!select.value) return; list.push(select.value); onChange(f.k); render(); });
            row.append(select, add);
            wrap.append(box, row);
            if (f.help) wrap.insertAdjacentHTML('beforeend', `<span class="ed-help">${esc(f.help)}</span>`);
            form.appendChild(wrap);
            return;
        }

        switch (f.type) {
            case 'textarea':
                input = document.createElement('textarea');
                input.value = value ?? '';
                break;
            case 'json':
                input = document.createElement('textarea');
                input.className = 'ed-json';
                input.value = value == null ? '' : JSON.stringify(value, null, 2);
                break;
            case 'select': {
                input = document.createElement('select');
                const opts = f.options();
                if (value != null && value !== '' && !opts.some(([v]) => v === String(value))) opts.push([String(value), `${value} (non trovato)`]);
                input.innerHTML = opts.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('');
                input.value = value ?? '';
                break;
            }
            case 'checkbox':
                input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = !!value;
                break;
            case 'idlist':
                input = document.createElement('input');
                input.value = (value || []).join(', ');
                break;
            default:
                input = document.createElement('input');
                input.type = f.type === 'number' ? 'number' : 'text';
                input.value = value ?? '';
        }
        input.id = id;
        const commit = () => {
            let v;
            if (f.type === 'number') v = input.value === '' ? null : Number(input.value);
            else if (f.type === 'checkbox') v = input.checked;
            else if (f.type === 'idlist') v = input.value.split(/[,\s]+/).filter(Boolean).map(Number).filter(n => !Number.isNaN(n));
            else if (f.type === 'json') {
                if (input.value.trim() === '' && f.nullable) v = null;
                else {
                    try { v = JSON.parse(input.value); input.classList.remove('ed-invalid'); }
                    catch (err) { input.classList.add('ed-invalid'); input.title = err.message; return; }
                }
            } else v = f.numeric ? Number(input.value) : input.value;
            // Campi facoltativi: vuoto, zero o falso = campo assente, per tenere pulito il JSON
            if ((f.omitEmpty && (v === null || v === '' || v === 0 || v === false)) || (f.type === 'json' && f.nullable && v === null)) deletePath(obj, f.k);
            else setPath(obj, f.k, v);
            onChange(f.k);
        };
        input.addEventListener(f.type === 'select' || f.type === 'checkbox' ? 'change' : 'input', commit);
        wrap.appendChild(input);

        // Campo immagine o suono: percorso + pulsante di caricamento + anteprima (miniatura o ascolto)
        if (f.type === 'audio') {
            const row = document.createElement('div');
            row.className = 'ed-image-row';
            wrap.replaceChild(row, input);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-small';
            btn.textContent = 'Carica…';
            btn.addEventListener('click', () => pickFile(f.folder || 'audio', 'audio/*', path => { input.value = path; commit(); }));
            const play = document.createElement('button');
            play.type = 'button';
            play.className = 'btn-small ed-play';
            play.textContent = '▶';
            play.title = 'Ascolta';
            play.addEventListener('click', () => { if (input.value) new Audio(assetUrl(input.value)).play().catch(() => alert('Suono non trovato: ' + input.value)); });
            row.append(input, btn, play);
        }
        if (f.type === 'video') {
            const row = document.createElement('div');
            row.className = 'ed-image-row';
            wrap.replaceChild(row, input);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-small';
            btn.textContent = 'Carica…';
            const thumb = document.createElement('video');
            thumb.className = 'ed-thumb';
            thumb.muted = true;
            thumb.loop = true;
            thumb.autoplay = true;
            thumb.playsInline = true;
            thumb.onerror = () => { thumb.hidden = true; };
            const updateThumb = () => { thumb.hidden = !input.value; if (input.value) thumb.src = assetUrl(input.value); };
            btn.addEventListener('click', () => pickFile(f.folder || 'video', 'video/*', path => { input.value = path; commit(); updateThumb(); }));
            input.addEventListener('input', updateThumb);
            row.append(input, btn, thumb);
            updateThumb();
        }
        if (f.type === 'image') {
            const row = document.createElement('div');
            row.className = 'ed-image-row';
            wrap.replaceChild(row, input);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-small';
            btn.textContent = 'Carica…';
            const thumb = document.createElement('img');
            thumb.className = 'ed-thumb';
            thumb.alt = '';
            thumb.onerror = () => { thumb.hidden = true; };
            const updateThumb = () => { thumb.hidden = !input.value; if (input.value) thumb.src = assetUrl(input.value); };
            btn.addEventListener('click', () => pickFile(f.folder || 'immagini', 'image/*', path => { input.value = path; commit(); updateThumb(); }));
            input.addEventListener('input', updateThumb);
            row.append(input, btn, thumb);
            updateThumb();
        }
        if (f.k === 'enemy' && value && lib.bestiario[value]) {
            wrap.insertAdjacentHTML('beforeend', `<a href="#" class="ed-goto" ${azione('gotoLibrary', 'bestiario', value)}>Modifica nel Bestiario</a>`);
        }
        if (f.help) wrap.insertAdjacentHTML('beforeend', `<span class="ed-help">${esc(f.help)}</span>`);
        form.appendChild(wrap);
    });
    container.appendChild(form);
}
