# Architecture — 蒸馏圣堂 DISTILLATION DENIED

Grey-box skeleton. One circular arena, one boss, three chasers, two endings. No story mode and no checkpoints.

## Run

Dev (ES modules, needs a static server — `file://` blocks modules):

```bash
npx serve .
```

Open the printed URL. `index.html` loads `src/main.js` through an import map that points `three` at `vendor/three.module.js` (r170, no CDN).

Release (one IIFE, works from `file://`):

```bash
node tools/build.mjs
```

That writes `dist/game.js`, `dist/index.html` (plain `<script>`, no `type="module"`), and copies `css/` plus `assets/`. It does **not** copy `vendor/`. Serve `dist/` over http (GitHub Pages).

The same command also writes `dist-standalone/`. Chrome blocks `file://` images in WebGL, so that folder inlines every `assets/web` image as a `data:` URI in `assets_inline.js` (`window.__INLINE_ASSETS`). `getAsset()` prefers the inline map. Double-click `dist-standalone/index.html`. Audio and video stay as files beside the page.

Art sync, when `../assets/manifest.json` exists:

```bash
node tools/sync_assets.mjs
```

Never `fetch()` at runtime. Images go through `Image` / a canvas texture. Audio goes through `HTMLAudioElement`, with a WebAudio beep when the file is missing.

Test hook: `?autostart=deepseek&phase=3&debug=1` (`deepseek`, `kimi`, or `glm`).

## Rules

- `src/core/contracts.js` and `src/core/bus.js` are frozen. New events are requested, then added by the integrator.
- `src/main.js` wiring (states, boot order, `window.__debug`) is integrator-only. Change a module's internals, not the call order, unless the integrator is doing it.
- Cross-workstream calls go through the bus, `ctx`, or a pure data import (`contracts.js`, `balance_*.js`, `lines.js`, `characters.js` catalog). Do not import another workstream's runtime module.
- Every hit goes through `applyHit(ctx, src, dst, dmg, opts)` in `src/core/combat.js`. Do not subtract hp anywhere else. Healing and the debug HP slider may write hp, then the boss `commit()` path.
- Names live on the `NAMES` object in `src/data/lines.js`. `ASSET_CONFIG.names` is that same object.
- UI strings are bilingual: `你被封号！ / ACCOUNT BANNED`.
- Placeholder billboards must keep running when image files 404. Do not log those failures.

## Module map

| Path | Owner | Role |
|---|---|---|
| `src/main.js` | Integrator | Boot, states, `__debug` |
| `src/core/contracts.js` | Integrator | `EVENTS`, `GAME_STATES`, typedefs |
| `src/core/bus.js` | Integrator | pub/sub |
| `src/core/combat.js` | Integrator | `applyHit`, `resolveActor` |
| `src/core/time.js` | Integrator | 60 Hz, `timeScale`, hit-stop |
| `src/core/input.js` | WS1 | keys + mouse |
| `src/world/camera.js` | WS1 | over-the-shoulder rig |
| `src/actors/player.js` | WS1 | move, roll, kits, flasks |
| `src/actors/characters.js` | WS1 | roster catalog (safe to import) |
| `src/config/balance_player.js` | WS1 | player / flask numbers |
| `src/boss/*` | WS2 | phase, attacks, body |
| `src/world/telegraph.js` | WS2 | ground warnings + hit test |
| `src/config/balance_boss.js` | WS2 | boss numbers and `ATTACKS` |
| `src/world/arena.js` | WS3 | platform, fog, sky, holo plate |
| `src/world/vfx.js` | WS3 | damage numbers, hurt circles |
| `src/world/sprites.js` | WS3 | camera-facing billboards |
| `src/actors/allies.js` | WS4 | two allies |
| `src/ui/dario.js` | WS4 | hologram lines |
| `src/data/lines.js` | WS4 | all copy and names |
| `src/ui/hud.js` `menus.js` `debug.js` | WS5 | HUD, flow screens, P panel |
| `css/ui.css` `index.html` `tools/build.mjs` | WS5 | shell and release build |
| `src/story/*` `css/theater.css` | WS6 | ending cards |
| `src/core/audio.js` `src/config/assets.js` | WS6 | sound + asset ids |
| `tools/sync_assets.mjs` | WS6 | copy generated art in |

Each module exports `init(ctx)`, `update(ctx, dt)`, `reset(ctx)`. Gameplay `update` receives a fixed sim step (already scaled, absent during hit-stop and pause). UI `update` receives the raw frame dt. `present(ctx, dt)` is the once-per-frame visual hook (billboards, floaters, bubbles).

`ctx` holds `scene`, `camera`, `renderer`, `bus`, `input`, `audio`, `time`, `assets`, `player`, `boss`, `allies`, `world`, `state`, `debug`. `ctx.world` has `clamp`, `setHolo`, `radius`, `sprites`, `telegraph`, `vfx`, `camera`.

Actors: `{ id, team, position, hp, maxHp, radius, alive, invulnerable, sprite, takeDamage(info) → applied }`. Boss adds `phase`, `lockHpAt25`, `setPhase`, `commit`, `height`, `damageMul`, `visualLift`, `pose`, `attackId`.

`sprites.present` places every billboard. Feet sit on `owner.position.y + owner.visualLift` (Opus hover lives in `visualLift`; the shadow stays on the floor). A boss billboard's height tracks `owner.height`, and its pose art follows `owner.phase` plus `owner.pose` (`hurtT` wins). P3 frames are dimmed in the material so the Opus silhouette is not a white blob. Sprites inside about 2.6 m of the camera fade out so a billboard cannot fill the lens. `setPose`, `setTint`, `setDim`, and `flash` are on the billboard and on `ctx.world.sprites`. Do not write `material.emissive` — billboards are `MeshBasicMaterial`. `boss.present` only places the mecha rig and refusal bubbles, after the billboard move. During theater and credits the mecha rig, combat VFX, HUD, Dario bar, and holo plate are hidden.

`ctx.flags.skillSilence` (seconds remaining) is the content-policy lock, with `skillSilenceUntil` and `contentPolicySilence` as mirrors. The player copies it onto `player.skillSilenced` and will not start a skill or hold guard while it is above zero. The HUD status strip reads the same flags. Boss attacks emit `skill_silence`.

`applyHit(..., { attackId })` copies `attackId` onto `DamageInfo`. The player ignores a repeat of that id for 0.6 s. Boss swings pass `` `${attackId}#${telegraphId}` ``; each projectile and ring tick gets its own id so a combo or a volley can still land.

## States

`title → disclaimer → select → fight`. Esc pauses `fight`. Death in phase 1–2 → `banned` (retry, or 3s back to the door). Death in phase 3 → ending A. Boss hp at or under 25% → hp locks and ending B. Theater then `credits` then title.

## Events

`state_change`, `fight_start`, `fight_reset`, `phase_change`, `hit`, `hit_stop`, `flask_used`, `flask_interrupted`, `perfect_guard`, `guard_start`, `guard_end`, `player_death`, `player_attack`, `skill_used`, `roll_start`, `roll_end`, `ally_down`, `ally_revive`, `ally_speech`, `boss_hp`, `boss_attack`, `telegraph_start`, `telegraph_resolve`, `ending_trigger`, `theater_shot`, `theater_done`, `distill_progress`, `dario_line`, `camera_shake`, `pause`, `resume`, `select_confirm`, `retry`, `banner`, `input_lock`, `god_mode`, `lock_on`, `skill_silence`.

Payloads are documented on `EVENTS` in `contracts.js`. `hit` is `{ src, dst, dmg, applied, heavy }`. `ending_trigger` is `{ id: 'A' | 'B' }`. Listeners receive live actor objects, not copies.

## Debug

`window.__game` is the context. `window.__debug`:

- `startFight(charId)`
- `setPhase(1|2|3)` — sets hp into that band (phase 3 sits at 35%, above the ending)
- `setBossHpRatio(r)` — `r <= 0.25` plays ending B
- `killPlayer()` — phase 3 plays ending A, otherwise the ban screen
- `triggerEnding('A'|'B')`
- `state()` — plain JSON
- `setGod(bool)`, `setTimeScale(n)`, `setDamageMul('player'|'boss'|'ally', n)`

P opens the panel (multipliers, god mode, time scale, phase jump, endings, boss hp, camera). Body `data-state` mirrors the state machine.

## Assets

Refer to files by id (`spr.deepseek.back_idle`, `spr.boss.p1.front`, `icon.rtx5090`, `bg.sky`, `end.A3`, `bgm.p1`, `sfx.slash`, `sfx.glass`, `sfx.fanStop`, `vo.dario_fight_start_1`). Dotted legacy ids such as `vo.dario.fight_start.1` resolve to those files. `getAsset(id)` returns a relative path or null. Generated paths in `src/config/assets.generated.js` win over the defaults in `assets.js`. `loadTexture(id, draw)` returns a canvas texture immediately.

Audio (`ctx.audio`): `playSfx`, `playBgm(id, fade)`, `stopBgm`, `playVo` (returns `{ duration, promise }` and ducks BGM), `stopVo`, `stopSfx`, `duck`, `setVolume({ master, music, sfx, vo })`, `unlock`. Files play through `HTMLAudioElement`. Short hits trim to about 0.42 s and fade. BGM crossfades title → p1 → p2 → p3 → endA / endB. Dario and allies call `playSfx('vo.…')` themselves; the bus `dario_line` event does not start a second take. The `AudioContext` for missing-file beeps is created only after a user gesture. During theater the 3D holo plate, HUD, Dario bar, and damage layer are hidden; endings skip by click, Space, or Enter, then `credits`, then 「再来一次 / PLAY AGAIN」 returns to the title.
