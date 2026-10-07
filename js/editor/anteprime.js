/* ==========================================================================
   EDITOR: ANTEPRIMA DEI TOOLTIP
   PREVIEWS: anteprima del tooltip di oggetti, abilità, reliquie e maledizioni,
   da tenere allineata a itemTip (js/oggetti.js) e ai tooltip delle abilità.
   Parte dell'editor (js/editor/): stesso ambito globale, <script> classici in editor.html.
   ========================================================================== */

/* ---------- Anteprima del tooltip ----------
   Sotto il modulo di oggetti, abilità, reliquie e maledizioni: come il giocatore vedrà il tooltip
   (stessa grafica di #wc3Tooltip del gioco). Si aggiorna a ogni modifica. Rispecchia itemTip di
   js/oggetti.js e i tooltip delle abilità di js/combattimento.js: se cambiano, va aggiornata anche qui. */
const PREVIEW_ITEM_LINES = [['str', 'Forza'], ['dmg', 'Danno'], ['armor', 'Armatura'], ['def_armor', 'Armatura con Difendi'],
    ['def_bonus', 'Difesa'], ['help_bonus_val', 'Aiuto'], ['fth', 'Fede'], ['int', 'Intelligenza']];
const PREVIEW_STAT = { str: 'Forza', dmg: 'Danno', armor: 'Armatura', def_bonus: 'Difesa', def_armor: 'Armatura con Difendi',
    help_bonus_val: 'Aiuto', fth: 'Fede', int: 'Intelligenza', att_bonus: 'Tiro per colpire', current_armor: 'Armatura (subito)' };

function previewTipHtml(title, lines) {
    return `<div class="wc3-tooltip show ed-tip-preview"><div class="tip-title">${title}</div>${lines.length ? `<div class="tip-body">${lines.join('<br>')}</div>` : ''}</div>`;
}

function previewItem(it) {
    const r = it.rarity || 'comune';
    const consumable = (it.type || '').startsWith('consumable');
    const lines = [`<span class="tip-rar-label tip-rar-${r}">${esc(RARITY_LABELS[r] || '')}${consumable ? ' · consumabile' : ''}</span>`];
    PREVIEW_ITEM_LINES.forEach(([k, label]) => { if (it[k]) lines.push(esc(`${it[k] > 0 ? '+' : ''}${it[k]} ${label}`)); });
    if (it.att_penalty) lines.push(`<span class="kw kw-curse">-${esc(it.att_penalty)} al tiro per colpire</span>`);
    if (it.type === 'consumable_heal') lines.push(esc(`Cura ${it.heal_val || 0} HP`));
    if (it.type === 'consumable_full') lines.push('Cura tutti gli HP');
    if (it.type === 'consumable_damage') lines.push(esc(`Infligge ${it.dmg_val || 0} danni al nemico`));
    if (it.type === 'consumable_buff') {
        const rounds = it.buff_rounds || 0;
        const durata = it.buff_stat === 'current_armor' ? '' : rounds > 0 ? (rounds === 1 ? ' per 1 round' : ` per ${rounds} round`) : ' per tutto lo scontro';
        lines.push(esc(`+${it.buff_val || 0} ${PREVIEW_STAT[it.buff_stat] || it.buff_stat || '?'}${durata}`));
    }
    if (['consumable_damage', 'consumable_buff'].includes(it.type)) lines.push('<span class="tip-hint">Solo in combattimento, con il comando Oggetto</span>');
    (Array.isArray(it.scaling) ? it.scaling : []).forEach(sc => lines.push(esc(`+1 ${PREVIEW_STAT[sc.stat] || sc.stat} ogni ${sc.every} ${PREVIEW_STAT[sc.per] || sc.per}${sc.max != null ? ` (max +${sc.max})` : ''}`)));
    if (it.desc) lines.push(`<span class="tip-desc">${esc(it.desc)}</span>`);
    return previewTipHtml(`<span class="tip-rar tip-rar-${r}">${esc(it.name || '(senza nome)')}</span>`, lines);
}

// Riassunto delle regole di un'abilità attiva, per controllare che i campi dicano quello che dice la descrizione
function previewAbility(a) {
    const lines = [esc(a.desc || '')];
    if (a.isCombatActive) {
        const c = a.combat || {};
        const regole = [];
        if (c.armorGain) regole.push(`nessun tiro: +${c.armorGain} Armatura subito`);
        else if (c.sumTarget) regole.push(`due dadi: con somma esattamente ${c.sumTarget} nemico sconfitto (elite e boss a metà vita)`);
        else {
            regole.push(c.autoHit ? 'colpisce sempre (come un 6)' : (c.dice === 2 ? 'tiro per colpire con 2 dadi, tiene il migliore' : 'tiro per colpire con 1 dado'));
            if (c.attackStat) regole.push(`+${PREVIEW_STAT[c.attackStat] || c.attackStat} al tiro`);
            if (c.attackBonus) regole.push(`+${c.attackBonus} al tiro`);
            if (c.damageStat) regole.push(`+${PREVIEW_STAT[c.damageStat] || c.damageStat} al danno`);
            if (c.damageBonus) regole.push(`+${c.damageBonus} al danno`);
            if (c.damageTakenBonus) regole.push('+ danni subiti nell\'ultimo colpo');
            if (c.damageMult > 1) regole.push(`danno x${c.damageMult}`);
            if (c.stun) regole.push('stordisce il nemico');
        }
        if (c.requiresHitLastTurn) regole.push('solo dopo essere stati colpiti nell\'ultimo turno del nemico');
        lines.push(`<span class="tip-hint">Attiva, 1 volta per scontro: ${esc(regole.join('; '))}</span>`);
    } else {
        lines.push('<span class="tip-hint">Passiva</span>');
    }
    return previewTipHtml(esc(a.name || '(senza nome)'), lines);
}

const previewSimple = o => previewTipHtml(esc(o.name || '(senza nome)'), o.desc ? [esc(o.desc)] : []);
const PREVIEWS = { armeria: previewItem, abilita: previewAbility, reliquie: previewSimple, maledizioni: previewSimple };
