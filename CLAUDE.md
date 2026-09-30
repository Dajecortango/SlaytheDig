# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Slay the Dig" — a turn-based roguelike (Slay the Spire-style map, Darkest Dungeon tone) with a UI styled after Warcraft III: Reign of Chaos menus. Written in Italian (all game text, variable names are mostly English/Italian mixed). Built for a specific group's private campaigns ("Famiglia Dignitas").

This is a static, no-build, vanilla JS web app — no npm, no bundler, no package.json, no test suite.

## Running / developing

Open `index.html` directly in a browser (double-click, no server needed) — playing the game stays zero-server because campaigns load via `<script>` tags (`campagne/<id>/campaign.js`), not `fetch()`. There is no build step, linter, or test command — changes to `js/game.js`, `css/style.css`, `index.html`, or any `campagne/<id>/campaign.js` are reflected on page reload.

To check for JS syntax errors quickly, a Node one-liner works since these files have no imports:
```
node --check js/game.js
node --check campagne/tutorial/campaign.js
```

To regenerate a campaign's `campaign.json` after editing its `campaign.js` (they're not auto-synced):
```
node -e "const fs=require('fs'); const c=require('./campagne/tutorial/campaign.js'); fs.writeFileSync('campagne/tutorial/campaign.json', JSON.stringify(c, null, 2));"
```

Progress saves to `localStorage` under the key `dignitas_savegame` (see `saveGame`/`loadGame` in `js/game.js`).

## Architecture

Three files carry the whole app:
- `index.html` — all screens (`div#screen*`) live in the DOM at once; navigation is done by toggling a `.hidden` class via `showScreen(screenId)`, not routing.
- `css/style.css` — visual theme, animations.
- `js/game.js` — campaign data + all game logic, in one script loaded at the bottom of `index.html`. Functions are called directly from inline `onclick="..."` handlers in the HTML.

### Data-driven campaigns, split from the engine

`js/game.js` is engine-only: it holds no campaign content. At the top it does `const campaignsDatabase = window.CAMPAIGNS || {};` — every campaign is loaded from `campagne/<id>/campaign.js`, `<script>`-included in `index.html` *before* `js/game.js`, which populates `window.CAMPAIGNS[id]`. `campagne/<id>/campaign.json` is the same data in pure JSON (no functions) for reading/diffing/future tooling — it is not itself loaded by the browser (a page opened via double-click can't `fetch()` local files), it's regenerated from `campaign.js` (see `if (typeof module !== 'undefined') module.exports = campaign;` at the bottom of each `campaign.js`, which is also what lets `node -e "require('./campaign.js')"` dump the JSON).

To add or edit campaign content, edit `campagne/<id>/campaign.js` — no engine changes needed for new heroes/enemies/events, unless the content needs genuinely new mechanics (see below). Key sub-structures per campaign:
- `heroes` — base stat blocks (`str`, `int`, `fth`, `hp`, `dmg`, `base_armor`, ...).
- `abilities` — keyed by hero name, list of pickable abilities. Simple ones use `{type: "passive_stat", stat, val}` (engine-generic). Bespoke ones (e.g. astarte_ch1's) carry an `id`, `isCombatActive`, and either an `apply(hero)` closure (passives) or nothing (actives — their behavior is hardcoded by `id` in `js/game.js`'s `executeCombatHeroRoll`, see below).
- `initialArmory` — starting equipment choices.
- `enemies` — keyed by id, used by combat nodes.
- `challenges` — keyed by id; each has a stat check (`stat`, `cd`), success/fail text, and optional `reward` (relic) / `punishment` (curse). `reward`/`punishment.apply()` (optional) is called generically by `executeChallengeRoll`; if a punishment doesn't push into `activeCurses` itself, the engine auto-pushes `"${name} (${desc})"` so it still shows in the topbar counter and Journal.
- `merchants`, `rests`, `treasures` — flavor text keyed by node number (or `"default"`).
- `lootItems` — optional campaign-specific loot pool (array of item defs); if omitted, combat loot draws from the engine's default pool.
- `mapNodes` — array of node objects with `id`, `level`, `x`, `type` (`combat` | `elite` | `challenge` | `rest` | `merchant` | `treasure` | `captain`, etc.), `enemy`/`challengeId`/`restId` reference keys, and `next` (array of node ids this node connects to) — this defines the branching path graph rendered by `renderStsMap()`.

**Relics and abilities with unique mechanics are hardcoded in the engine by exact name/id, not data-driven.** `js/game.js` has ~15 `hasRelic("Nome Esatto")` checks scattered through combat/challenge/merchant code (e.g. `"Scudo dell'Atamano"`, `"Frammento di matrice"`, `"Anello del giuramento"`) and a handful of `if (abId === 'nome_ability') { ... }` branches in `executeCombatHeroRoll` for astarte_ch1's active abilities (`icaro_trucchi`, `astarte_affondo`, `ascadeo_segnato`, `zeno_colpo_benedetto`, `dioforo_penna`). A new campaign can reuse these exact names/ids to get the same behavior; genuinely new mechanics require adding a new hook in the engine, not just campaign data.

### Runtime state

Global mutable variables declared under "STATO GLOBALE RUNTIME" (`js/game.js` ~line 618): `currentCampaign`, `party`, `partyCoins`, `unlockedRelics`, `activeCurses`, `stsMapNodes`, `currentNodeId`, `combatPhase`, `combatRound`, `expeditionStats`, etc. There's no state container/store — functions read and mutate these globals directly.

### Screen flow

`screenStart → screenCampaigns → screenParty (hero/ability/item picks) → screenCampaignIntro → screenMap` then, per node type, one of `screenCombat`, `screenChallenge`, `screenRest`, `screenMerchant`, `screenTreasure`/`screenTreasureLoot`, ending at `screenCaptain`, `screenVictory`, or `screenDefeat`. `screenLoot` and `screenDiscard` (inventory full, max 3 items/hero) are sub-flows off combat/treasure.

### Combat model

Turn-based, d6 roll-under checks against derived stats (`str`, `int`, `fth` + situational bonuses) vs a target number or enemy CA. Player actions: Attack (Q), Defend (W), Help (E), Use Item (R), Ability (T) — one ability use per encounter. See `executeCombatHeroRoll`, `startMonsterTurn`, `executeMonsterAttack` in `js/game.js`.

### Icons

Item/ability icons (from Warcraft III assets in `immagini/icone/`, personal non-commercial use) are mapped via three lookup tables in `js/game.js`:
- `ITEM_IMAGES_BY_ID` — icon per specific item `id`.
- `ITEM_IMAGES` — icon per item type (`sword`, `axe`, `shield`, ...).
- `ABILITY_IMAGES` — icon per ability `id`.

These stay in `immagini/icone/` (shared across all campaigns), same as hero portraits hardcoded in `HERO_PORTRAITS` (currently astarte_ch1's, in `campagne/astarte_ch1/assets/ritratti/`).

Event illustrations referenced by a campaign's `mapNodes[].image`/`coverImage` live under that campaign's own `campagne/<id>/assets/` — except a couple of filenames intentionally shared/reused across campaigns (e.g. `immagini/scontro_cinghiali.jpg`), which stay in the top-level `immagini/`. If an image is missing, the game shows a placeholder box (`markMissingImage`) instead of breaking — most event illustrations in both existing campaigns are currently placeholders (files were never added).

### UI conventions

- Custom modal (`openModal`/`closeModal` targeting `#wc3Modal`) and tooltip (`data-tip="Title||Description"` attribute convention, parsed and shown via `positionTooltip`) replace native `alert`/`title` for in-game dialogs — but `saveGame`/`loadGame` still use native `alert()` for status messages.
- Typewriter text effect for narrative boxes (`startTypewriter`/`stopTypewriter`), toggleable via options (`animationsEnabled`).
- Keyboard shortcuts Q/W/E/R/T for combat actions and Space to roll are wired at the document level, not per-button.
