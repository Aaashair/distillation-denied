# DISTILLATION DENIED — v2 architecture

Canvas2D top-down room fight. Internal buffer is **640×360**, blitted with integer scale. The 480×320 room plate sits at screen **(80, 20)** (`WORLD_OX` / `WORLD_OY` in `src/render/world.js`). Actor `x`/`y` are room-local. `pixel.screenToInternal` returns those world pixels. No Three.js, no `fetch()` at runtime. v1 stays at git tag `v1-3d`.

`DESIGN_v2.md` is the design spec. This file is the module map the six workers share. `src/core/contracts.js` is frozen after the skeleton: new events and ctx fields go through the integrator.

## Owners

| Path | Owner | Role |
|---|---|---|
| `src/main.js`, `src/core/contracts.js`, `src/core/bus.js`, `src/core/time.js`, `src/core/combat.js`, `src/actors/projectiles.js` | Integrator | boot, states, `__debug`, events, `applyHit`, bullet pool |
| `src/core/input.js`, `src/actors/player.js`, `src/actors/kits.js`, `src/actors/characters.js` | W1 Player | move, roll, three kits, flasks |
| `src/boss/boss.js`, `src/boss/patterns.js`, `src/boss/telegraph.js` | W2 Boss | phases, patterns, transitions, 25% lock |
| `src/render/pixel.js`, `sprites.js`, `procedural.js`, `vfx.js`, `room.js`, `font.js` | W3 Render | scaler, sheets, procedural stand-ins, juice, room, 3×5 font |
| `src/ui/*`, `css/ui.css`, `src/data/lines.js`, `src/data/lines_dario.js`, `index.html` | W4 UI | HUD, menus, banned, pause, debug, Dario |
| `src/story/*`, `css/theater.css`, `src/core/audio.js`, `src/config/assets.js`, `src/config/assets_v2*.js`, `tools/sync_assets*.mjs`, `tools/build.mjs` | W5 Story | ending beats, theater, audio, asset ids, build |
| `src/actors/allies.js`, `tests/*`, `../e2e/run_v2.mjs` | W6 Allies | orbit allies, playtest bot, e2e |
| `src/config/balance.js` | shared | all numbers. Edit only your block (W1 player/flasks, W2 boss, W6 allies, W3 `VFX`/`FEEL`) |

Do not import another workstream's runtime. Talk through the bus, `ctx`, or pure data (`contracts.js`, `balance.js`, `lines.js`, `characters.js`). Allies may import `actors/kits.js` (the shared kit API). They read telegraphs from `ctx.world.telegraph`, not from `boss/telegraph.js`.

## ctx

`window.__game` is the context. There is **no `ctx.camera`**. Theater's old three.js camera hooks no-op when it is absent; do not put a camera object back.

| Field | Meaning |
|---|---|
| `bus` | `createBus()` — `on` / `off` / `emit`. A throwing listener is a console error. |
| `input` | See input API. Mouse is mapped to internal pixels via `setMapper`. |
| `audio` | v1 `createAudio()`. BGM follows `fight_start`, `phase_change`, `ending_trigger`, menus. |
| `time` | 60 Hz clock. See below. |
| `assets` | `{ get(id), image(id), config, sprite, voice }`. `sprite` is `getSprite`, `voice` is `getVoiceLine`. `window.ASSET_CONFIG` is the same config object. |
| `player`, `boss`, `allies`, `stele` | Live actors or null / []. |
| `world` | `{ clamp(actor), setHolo(zh, en), telegraph, room }`. Room installs `clamp` and `setHolo`. |
| `state` | `{ current, previous, set(next) }`. |
| `debug` | god mode, damage multipliers, `timeScale`, `showHitboxes`. |
| `flags` | `skillSilence`, `contentPolicySilence`, `inputLocked`. |
| `truceUntil` | Unscaled timestamp. Phase transition ignores hits until then. |
| `distill`, `endingDistill` | Display 0–100. Theater snapshots then zeros the readout. |
| `endingsUnlocked` | `{ A, B }` in `localStorage` key `dd.endings.v1`. |
| `pauseFrom`, `theaterShot`, `cutscene`, `holo` | Overlay bookkeeping. |
| `startFight(id)` | Menus call this. It plays the intro once per session. `__debug.startFight` skips the intro. |
| `retry`, `goTitle`, `finishIntro` | Menu / door hooks. |

Actor shape (also in contracts): `{ id, team, x, y, vx, vy, r, hp, maxHp, alive, invuln, facing, sprite }`. `r` is the hurtbox (player `r` is 3). `facing` is an 8-way name. `invuln` is seconds left.

## Time

`time.consume(raw, { freeze })` returns 0–5 steps of `1/60`, scaled by `timeScale`. Raw dt is clamped to 0.1 s. Pause and menus pass `freeze: true`.

`time.hitStop` is a **number** (seconds of sim freeze left). Call `time.requestHitStop(ms)`. Do not add a method named `hitStop` — it overwrites the number and hit-stop never engages.

`boss.tickReal(raw)` runs once per frame on the wall clock. Phase-transition countdowns live there, not in sim dt.

## Update order

Only while state is `intro` or `fight`. `dt` is one fixed step, already scaled, and is skipped during hit-stop and pause.

1. `player.update` — move, roll, flask, skill, primary
2. `allies.update` — fight only
3. `boss.update` — fight only
4. `telegraph.update` — fight only
5. `projectiles.update`
6. `room.update` — intro door
7. `sprites.update` — flash timers
8. `tickFlags` — skill silence

Then, once per frame (raw dt, even during hit-stop): `boss.tickReal` (fight), `cutscenes.update` (cutscene), `vfx.update`.

## Render order

Into the 640×360 buffer, then integer blit:

1. `room.render` — ends in the world transform (origin at 80, 20)
2. `telegraph.render`
3. shadows
4. actors and bullets, y-sorted
5. `player.render` when `flags.playerFxExternal` is set (skill juice in world space; the overlay on `#view` stays off)
6. `vfx.render` — screen-space flash and rift, then back to the world transform
7. HUD `render` in screen space if that export exists, then the world transform is restored
8. cutscene overlay (full-buffer darken, glass, and rift; actors stay room-local). Ends in the world transform
9. `pixel.present` — integer shake is applied on the blit, not in the sim

Boss bullets are drawn by `patterns.installDrawer`, which chains the sprite drawer that was already registered for player and ally shots.

DOM after the blit: `hud`, `dario`, `menus`, `theater`, `debug`, `audio`. Ally speech bubbles are placed with the world offset: `(x + 80) / 640`.

## States

`title → disclaimer → select → intro → fight`.

Intro is skippable with Enter and is skipped on retry, on `__debug.startFight`, and with `?nointro=1`. It plays once per session (`introSeen`).

Esc pauses intro or fight. Resume uses `pauseFrom`.

Death in P1 or P2: 0.6 s slow-mo, then `banned`, then retry straight into the boss room (full HP, flasks refilled, boss at P1). Death in P3: cutscene A → theater A. Boss HP clamped at exactly 25% (`ENDING_B_RATIO`, floor 750 / 3000) fires ending B once: cutscene B → theater B. Theater shots A9 and B8 are the credits plus PLAY AGAIN; `THEATER_DONE` returns to the title. The menus `credits` state is still reachable if something sets it, and Enter there also returns to the title. Ally damage cannot push the boss below `maxHp * 0.25 + 1`.

`applyHit` is the only place HP is subtracted. Flasks, heals, and debug writes set `hp` and then call `boss.commit()`. Boss phase and the 25% ending go through `commit` only.

## Events

Wire strings live in `EVENTS` and must not be renamed. v1 names are unchanged (`state_change`, `fight_start`, `phase_change`, `hit`, `player_death`, `telegraph_start`, `telegraph_resolve`, `ending_trigger`, `dario_line`, `camera_shake`, …).

v2 adds: `shot_fired`, `bullet_spawn`, `skill_charge`, `skill_release`, `shield_block`, `telegraph_end`, `phase_transition_start`, `phase_transition_end`, `safety_judgement`, `cutscene_beat`, `vfx`, `shake`, `flash`.

Payload typedefs are in `contracts.js`. Juice requests are `{ kind, x, y, ... }` on `vfx` (`num`, `spark`, `shock`, `slash`, `beam`, `muzzle`, `ring`). `shake` is `{ mag, dur }`. `flash` is `{ color, dur }`. Dario still listens for attack id `p3_smite` on `telegraph_start` / `boss_attack`. Do not also play that voice from `dario_line` — `dario.js` plays it.

## window.__debug

| Call | Effect |
|---|---|
| `startFight(charId)` | Arena immediately. Skips the intro. |
| `setPhase(1\|2\|3)` | 100% / 69% / 35% HP, instant, no ending. |
| `setBossHpRatio(r)` | `r <= 0.25` plays ending B. |
| `killPlayer()` | Lethal hit. P3 goes to ending A. |
| `triggerEnding('A'\|'B')` | Starts the ending from the current fight. |
| `state()` | Plain JSON: `state`, `phase`, `bossHp`, `bossMaxHp`, `bossX`, `bossY`, `player {id,x,y,hp,maxHp,invuln,rolling}`, `allies`, `bulletCount {enemy,player}`, `telegraphs [{kind,x,y,r,t,attack}]`, `flasks`, `distill`, `theaterShot`, `cutscene {id,beat,t}`, `endingsUnlocked`, plus `build`, `charId`, `godMode`, `ending`. |
| `forcePattern(id)` | Next boss gap starts that pattern (`p3_smite`, `p1_refusal`, …). |
| `setGod(bool)` | Player ignores damage. |
| `setTimeScale(n)` | Sim scale. Restored when a cutscene ends. |
| `setDamageMul('player'\|'boss'\|'ally', n)` | Applied inside `applyHit`. |
| `skipIntro()` | Marks the intro seen and leaves it if active. |
| `clearBullets()` | Clears both teams into sparks. |

URL: `?autostart=deepseek&phase=3&debug=1&nointro=1`.

## Assets

`getAsset(id)` returns a path relative to `index.html`, or null. `loadImage(id)` returns an `HTMLImageElement` or null. It never calls `fetch()`, and it does not set `img.src` unless a path exists, so a missing id does not 404.

`src/config/assets_v2.generated.js` is the v2 path and voice table. `assets.js` merges it over the v1 map. A string value is a path. An object `{ src, frameW, frameH, frames, fps, anchorX, anchorY }` fills both the path and the matching `PIXEL_SPRITES` entry. Voice lookup drops the removed Ending A narration if it ever reappears in a table.

Pixel id convention: `px.deepseek.walk` maps to that descriptor. When the file is missing, `render/sprites.js` draws the procedural sprite for the same family (`px.deepseek`, `px.boss.p1` / `p2` / `p3`, `px.astra`, `px.fable.hand`, `px.dario`, `px.stele`).

v1 audio ids in `assets/` and `VOICE_LINES` keep working through `audio.js`. Do not point an image or audio element at a path that is not in the generated maps — Chromium logs the 404 as a console error, and the e2e bar is zero console errors and warnings.

Tint and flash with `globalCompositeOperation = 'source-in'` on an offscreen canvas. Never `getImageData` a file-backed image. Procedural sprites are never tainted.

## Build

`node tools/build.mjs` writes `dist/game.js` (IIFE) plus `index.html`, `css/`, and the asset files collected in the section below. `dist/` is gitignored. Canvas2D `drawImage` works on `file://`. Dev is ES modules from `index.html` with no import map.

## What landed

W1 kits, W2 patterns, W3 pixel room and VFX, W4 DOM HUD, W5 theater and voices, and W6 allies are on main. Boss phase changes run on the wall clock (`tickReal`) and restore `timeScale` when the beat ends. The first Safety Judgement is 8 s after phase 3 starts, then at most once per 25 s. Enemy bullets are capped under 120. Opus is drawn at 0.7 so the six-wing sheet stays on the plate; the hurtbox stays `r = 18` at the feet, and phase 3 movement is clamped lower so the wings are not walked off the buffer.

`node tools/build.mjs` copies ids referenced by source, `ASSET_CONFIG`, `PIXEL_SPRITES`, and every `v2_vo` / `v2_bgm` / `v2_sfx` / `v2_chip` path. Measured bundle: **39,837,029 bytes (37.99 MB)**, 330 files, `dist/game.js` 584,599 bytes. Verified on `http://localhost:8093/` and `file://` with 0 console errors, no CDN, no WebGL, no ES module.

Screenshot tour `e2e/run_v2.mjs` against `http://localhost:8091/`: all steps OK, 0 console issues. Shots are in `screens/v2/final/`. Keyboard bot: 24/25 on that same URL, 0 console issues. The failed row sampled retry HP after the new fight had already started. Five Enter retries sampled at `fight_reset` were phase 1, player 130/130, boss 3000. Bot sections b and c set player damage ×8. Section b then set ×0.02 with god mode off before the phase-3 death. These bots are not a human playtest.

### v3 playtest contracts
`core/i18n.js` persists `dd.lang.v3`; title buttons reload after storing the choice; `bi()` returns one language. Existing Chinese voice playback is unchanged. `player.gpuCooldowns` is independent seconds remaining for rtx5090/h200/b200, no quantity fields. Damage, travel and cooldown tuning remains central in `config/balance.js`. Friendly range is Euclidean displacement from bullet spawn, exactly clamped; path length is diagnostic, walls still cull. `ASSET_CONFIG` remaps every old Ending-A Astra alias to locally composited `assets/v3` mature-dragon plates; composition sources are existing v2 art, no media generation.


## v4 UI/CG seam
`ui/controlsHelp.js` owns explicit first-fight briefing; `ui/hud.js`/`css/ui.css` anchor readable health/skills/GPU cards outside walkable floor. `ui/claude.js` and data/lines_claude.js own event-driven single-language parodic combat captions; audio.js suppresses Chinese Claude battle VO under EN. `story/storyCg.js` freezes phase simulation via phaseCgFreeze (raw CG clock only), invokes boss.completeStoryPhaseCg once; no engine story beat effects. Endings enter HQ DOM theater immediately. assets/v4 plus compose_v4_story.py provide audited full Fable, white-dragon Astra and silhouette Sam compositions. Body state CSS is updated synchronously in setState to prevent obsolete first-frame layout.


## v5 supersedes v4 presentation/phase CG
Pixel buffer remains640×360; present() crops world480×320, canvas native width equals CSS available viewport minus220px external DOM sidebar. DOM/input world projection excludes prior80/20 buffer offsets aftercrop; bubble coordinates use pixel.rect scale. Fullscreen theater is viewport-fixed, independent of combat ui-root rect. Audio uses monotonic theaterOwnerToken plus live HTML and synth-source registries; boundaries synchronously hard-cut nodes and reject stale callbacks. storyCg retains ban only; boss startTransition uses restored in-engine beat, no phase freeze. Claude bind passes actual event payload (not ctx), all-state guards prevent combat UI resurrection. See V5_STATUS.md for source/tests/evidence.
