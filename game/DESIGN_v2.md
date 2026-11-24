# 《蒸馏圣堂》DISTILLATION DENIED — v2 design (top-down pixel room combat)
Supersedes DESIGN.md §2–§4, §8, §10–§11 for gameplay/tech. Story, satire, endings, names (REAL names), bilingual UI, hardcore (no story mode, no checkpoints) are unchanged.
v1 (3D soulslike) is preserved at git tag `v1-3d` in `game/` (`git show v1-3d:src/...` to read old code).
Why the pivot: playtest feedback — "camera + combat hard to handle; try Binding-of-Isaac view & combat, pixel art"; "skills have no/unclear VFX". See PROCESS_LOG.md.

---
## 0. Pillars
1. **Readable**: whole room always on screen (fixed camera), every boss attack telegraphed, tiny player hurtbox (r=3 px) inside a bigger sprite, bullets high-contrast with dark outline.
2. **Juicy**: every hit / skill has strong VFX: screen shake, hit-stop, white flash, particles, slash arcs, beams, shockwaves, telegraph circles, damage numbers, muzzle flashes, screen flash on big moments. VFX are code-drawn and exist regardless of sprites.
3. **Hard but fair**: hardcore, no checkpoints; death in P1/P2 → 「你被封号！/ ACCOUNT BANNED」 → instant retry (≤3 s) from P1. Target first ending in 4–8 minutes for an average player after 1–3 deaths.
4. **Satire first**: Dario hologram taunts (event-driven, based on his real public positions), names on everything, endings carry the message: distillation progress → 0.00%.

## 1. Tech
- Plain **Canvas2D**, no engine, no deps, no CDN. ES modules in dev; esbuild IIFE bundle for release (`dist/`), works over http and file:// (Canvas2D drawImage works on file://; never call getImageData on file images — all tint/flash caches are made by drawing with `globalCompositeOperation='source-in'` onto offscreen canvases, which is fine on tainted canvases since we never read pixels back. Procedural sprites are generated in code so they are never tainted).
- Fixed internal resolution **480×270**, rendered to an offscreen canvas, then blitted to the visible canvas at the largest **integer scale** that fits the window (letterboxed, black bars), `imageSmoothingEnabled=false`, CSS `image-rendering: pixelated`. If the window is smaller than 480×270, scale 1 (or fractional as last resort).
- All world coordinates are **internal pixels**. Draw positions are rounded to integers (no sub-pixel shimmer). Screen shake offsets are integers.
- 60 Hz fixed-step sim (`core/time.js`: timeScale, hit-stop, pause). Render once per rAF.
- DOM overlay (`#ui-root`) is sized/positioned over the scaled game rect for text that needs CJK (menus, subtitles, banners, Dario bar, speech bubbles, theater). Numbers, bars, icons, damage numbers are drawn in-canvas with a tiny built-in bitmap font (digits + A–Z, 3×5 or 4×6).
- Input: WASD move; **arrow keys** shoot in 8 directions (combine two arrows for diagonals) OR **mouse aim + hold LMB** shoot toward cursor (mouse mapped to internal coords); **Space** dodge-roll; **Shift or E or RMB** character skill; **Q** use selected GPU flask; **1/2/3** select flask (RTX 5090 / H200 / B200); Esc pause; **P** debug panel; Enter/Space/click advance theater.

## 1b. UPDATE (20:30 MST) — resolution & real assets  (overrides §1/§2 numbers)
- The asset worker has ALREADY produced most v2 pixel assets in `../assets/v2/` with `manifest.json` (300 entries: player sheets 64×64 frames (+ `_48` variants), boss sheets Haiku 96², Sonnet 128², Opus 192², Astra 80² and `astra_mature` 128², projectiles, ~41 VFX strip sheets, tiles, room backgrounds 480×320 (`room_p1/p2/p3`, datacenter-cathedral look), pixel portraits (Dario holo set, Sam), story panels 480×320 pixelized, SFX `sfx8_*`, chiptune BGM `chip_*`/`bgm8_*`, ~80 voices with `prompt` (zh text) + `subtitle_en`, `speaker`, `trigger`). Sheet JSON format: `{frameWidth, frameHeight, cols, rows, anchor:'bottom-center', anims:{name:{row, frames:N|[idx...], fps}}}` (embedded as `sheet` in manifest entries). Use them; procedural art is only the fallback.
- **Internal resolution is 640×360** (not 480×270): integer scale 2× at 1280×720, 3× at 1920×1080. The room background (480×320) is drawn at offset (80, 20); the walkable floor is the inner rect of that image (measure it; ≈ x 128..512, y 76..284 in screen coords). Side columns (x 0..80 and 560..640) hold the HUD (left: player portrait/HP/roll+skill CD/flasks; right: distillation %, Dario holo); boss bar across the top (y 2..18). Phase changes swap `room_p1 → room_p2 → room_p3`.
- Sprite scale: draw sheets at 1× native pixels (players 48 or 64 px frames — pick `_48` if 64 looks too big; boss frames as-is). Hurtbox stays tiny (r≈3–4 px at the sprite's feet/center).

## 2. Room
- One boss arena room: 26×14 tiles of 16 px = 416×224 floor, centered (x 32..448, y 30..254), top 30 px reserved for HUD (boss bar + Dario bar sit over the top wall). Walls 16 px thick drawn around; pillars optional (purely decorative, NOT colliding, to keep bullet hell readable).
- Floor: white-gold marble tiles with gold circuit-emblem in the center; sky cathedral flavour (clouds visible through "windows" in top wall). Pixel palette: white #F4F1EA, gold #D8B15A, sky #9CC9F0, dark outline #1B1530.
- Back-wall hologram plate (top center): Dario pixel portrait flickers in when he speaks (scanlines, cyan-gold).
- **Intro room** (first run of a session only; skippable with Enter; skipped on retry): small 13×7 "Gate" room with a 「拒答石碑 / Refusal Stele」 training dummy (takes damage, says "I can't help with that"), floor hints for WASD / arrows-or-mouse / Space / Shift / Q. Walk through the top door → boss room, boss intro (name banner, Dario fight_start line). Max ~20 s.
- Retry after ban: straight into the boss room, fresh fight (full HP, flasks refilled, boss P1 full).

## 3. Player & kits (all numbers in `src/config/balance.js`)
Shared: hurtbox r=3 px (drawn as a small white dot with dark outline while moving/shooting, Isaac-like readability); sprite ~24×28 px; 8-dir facing (sprites: down/up/side mirrored).
- Dodge roll (Space): 0.40 s, i-frames 0.04–0.34 s, distance 64 px, cooldown 0.55 s after the roll ends, afterimage trail + dust puff. Cannot roll during flask use.
- Hit: invulnerable 0.8 s after taking damage (blinking), knockback 6 px, hit-stop 60 ms, red screen-edge flash, shake 2 px.
- Flasks (Q uses selected; 1/2/3 select): **RTX 5090 ×3** heal 30% max HP; **H200 ×2** heal 50% + clears enemy bullets within 64 px; **B200 ×1** full heal + 3 s superarmor (damage ×0.6, no knockback). Use time 0.5 s (move speed 30%, can't shoot/roll); hit during use = interrupted & consumed (soulslike risk). Green GPU light pillar VFX + fan spin-up SFX. Refill on retry.
- Contact damage with boss body: 12 (respects i-frames).

| | DeepSeek「鲸尾双刃 / MoE」| Kimi「星月长袍 / Long Context」| GLM「紫金圣盾 / Holy Shield」|
|---|---|---|---|
| HP | 100 | 90 | 130 |
| Speed | 120 px/s | 108 | 96 |
| Primary (hold to fire) | **MoE Scatter**: 3-bolt spread (±10°), 7 shots/s, 2.2 dmg/bolt, speed 300, range 190 px; bolts are cyan whale-fin shapes with trail | **Star Orb**: 1 big piercing orb every 0.33 s, 8 dmg, speed 200, range 300, pierces, slight sine wobble, star-sparkle trail | **Hammer Bolt**: heavy short-range purple-gold bolt, 4.2 shots/s, 6.5 dmg, speed 240, range 120 px, knockback on hit, chunky impact |
| Skill (Shift/E/RMB) | **专家混合·乱舞 Expert Flurry**: dash 80 px toward aim (i-frames whole dash 0.22 s) then 8 slash arcs around the landing point over 0.5 s, 7 dmg each in r=42; CD 6 s. VFX: afterimages, 8 white-cyan crescent arcs, shake 3, hit-stop per hit 30 ms | **两百万字·星河光束 2M-Token Beam**: hold to charge 0.3–1.5 s (move 40%, charge particles converge, rising hum), release → beam to the wall along aim, width 6→18 px, 0.35 s, dmg 25→100 (scales with charge); CD 7 s. VFX: huge beam with core+glow layers, screen flash, shake 3–6, beam scorches floor, bullets in beam are deleted | **圣盾 Holy Shield**: hold to raise a 100° shield arc in aim direction (move 50%): blocks/destroys enemy bullets hitting the arc; **perfect guard** = bullet hits within 0.2 s of raising → reflects it + gold shockwave ring r=56 dealing 25 to boss if inside, "叮" SFX, hit-stop 80 ms; shield holds up to 2.5 s then 1.5 s CD |
| Difficulty | ★★☆ | ★★★ | ★☆☆ (recommended) |
Player DPS target vs boss ≈ 13–16/s with decent aim; allies combined ≈ 4/s.

## 4. AI allies (the two unchosen chasers)
- Same kits (primary only, skill on a long CD 12–15 s), damage ×0.35.
- Behaviour: keep a preferred distance band from the boss (DeepSeek 60–90 px, Kimi 120–170, GLM 50–80), strafe around it, stay away from the player's line of fire when possible; if inside a telegraph → 65% chance to roll out (35% get hit = comedy); HP 60; when downed: 12 s "redeploying" ghost, then revive with 50% HP. From P3 allies max HP −30% ("insufficient compute").
- Bilingual speech bubbles (DOM, pixel style) on: phase change, got hit, player uses flask, boss Safety Judgement, downed/revived; cooldown 10–18 s. Lines in `src/data/lines.js` (reuse v1 ALLY_SPEECH).
- **GPT-Astra** is not a fighting ally (she is the Ending-A rescuer). Her in-engine rescue beat: white-dragon pixel sprite dives from the top, parries Opus's killing blow with a hex-knot barrier, shockwave, carries the player out.

## 5. Boss Claude (one HP bar 3000)
Bands: P1 Haiku 100–70%, P2 Sonnet 70–40%, P3 Opus 5.5 40–25% (hp clamps at exactly 25% → Ending B, once). Body hitbox r: Haiku 10, Sonnet 13, Opus 18. Sprite height: 32 / 44 / 64 px. Boss moves (dash/teleport/float) between patterns; idle gap between attacks 0.6–1.1 s (P3 0.45–0.8).
Telegraph rules: red-gold outline + fill from center that completes at the hit moment; fast ≥ 0.45 s, big ≥ 0.9 s, full-room ≥ 2.0 s. Bullet visuals: boss = coral-orange/ivory with dark outline + white core; each pattern has a distinct bullet shape (petal, quill, glyph, feather, chain-node). Max ~120 enemy bullets on screen.
Damage per bullet: P1 10, P2 13, P3 16 (×phase damage mul in balance); heavy attacks listed below.

### P1 Claude Haiku (polite, quick)
| Pattern | Telegraph | Behaviour | Dmg |
|---|---|---|---|
| 礼貌拒答 Polite Refusal | 3 aim lines 0.5 s | 3 volleys of a 5-bullet fan aimed at target | 10 |
| 5-7-5 俳句环 Haiku Rings | ring glyph 0.6 s | rings of 5, 7, 5 bullets (17 syllables), each ring rotated, slow speed | 10 |
| 换个话题吧 Change the Topic | line 0.6 s | dash across room along the line, leaving a trail of slow petals that drift outward | 18 dash / 10 petals |
| 拒答回旋 Refusal Spin | circle r=44 0.7 s | radial burst + melee spin near boss | 20 |

### P2 Claude Sonnet (zone control) — damage ×1.2
| Pattern | Telegraph | Behaviour | Dmg |
|---|---|---|---|
| 宪章螺旋 Constitution Spiral | halo spins up 0.8 s | 2-arm (≤55% hp: 3-arm) rotating spiral for 4 s; boss stationary | 13 |
| 拒答法阵 Refusal Sigils | 3 circles r=26 under player/allies 1.0 s | explode; hit = 1.5 s 「内容政策沉默 / Content-policy silence」 (skill disabled) + bubble "I can't help with that." | 18 |
| 十四行诗 Sonnet Volley | aim line 0.4 s each | 14 aimed shots in iambic rhythm (short-LONG ×7) | 13 |
| 宪章之墙 Charter Wall | gap highlighted 0.9 s | 3 walls of bullets sweep across the room, each with one gap (gap glows) | 13 |
| 披风横扫 Cape Sweep | 180° cone r=90 0.8 s | heavy melee cone; ≤55% hp chained after a dash | 30 heavy |

### P3 Claude Opus 5.5 (big, fast-slow) — damage ×1.4
| Pattern | Telegraph | Behaviour | Dmg |
|---|---|---|---|
| 深度思考 Deep Thought | 120° cone r=110 flashes twice; **only the 2nd hits** (0.4 s fake + 1.0 s real) | delayed greatsword slash, teaches "don't panic-roll" | 40 heavy |
| 六翼羽弹 Six-Wing Feathers | 6 wing glows 0.8 s | 6 streams of weakly-homing feathers (turn rate low; run sideways) | 16 |
| 巨剑下劈 Greatsword Slam | line 24 px wide 0.9 s + impact circle | slam along line, then shockwave ring expanding from impact (roll through it) | 45 + 20 ring |
| 思维链 Chain of Thought | node chain lines 0.7 s | linked chains of nodes rotate around boss like spokes (gaps to slip through) | 16 |
| **安全神罚 Safety Judgement** (full room) | whole floor turns red-gold, 3 white safe circles r=22, 2.5 s | everything outside safe circles takes 60 heavy; roll i-frames at the exact moment or GLM perfect guard also survive; Dario ALWAYS speaks before it | 60 heavy |
- Forced first Safety Judgement 8 s after P3 starts; then ≤ once per 25 s. ≤32% hp: "推理加速 Reasoning Acceleration" — windups ×0.85.

### Phase transitions (cutscene beats, ~2.5 s, boss invulnerable)
slow-mo 0.3 s → white screen flash → all enemy bullets turn to gold sparks (cleared) → shockwave ring pushes everyone 40 px (no damage) → boss sprite morph (pixel dissolve / grow) → banner 「CLAUDE SONNET · 宪章展开 / Constitution Unfurled」 / 「CLAUDE OPUS 5.5 · 思维链六翼 / Six Wings of Thought」 → BGM crossfade → Dario line. Input stays live (player can reposition) but no damage either way.

## 6. Deaths & endings
- **Death in P1/P2** → 0.6 s slow-mo + desaturate → 「你被封号！/ ACCOUNT BANNED」 screen (Dario quip, cause-of-death stat, "重新挑战 / Retry (R / Enter)", auto-return option) → retry straight into boss room.
- **Death in P3 → Ending A「棋子 Pawn」**: in-engine beat (≈3 s): time 0.15, Opus raises greatsword over the kneeling player → sky crack (white-gold + teal) at the top wall → **GPT-Astra** (mature white-dragon design) dives in, hex-knot barrier parries, shockwave knocks Opus back → light ribbon carries player up → theater (Astra illustration, dark room, Sam Altman silhouette phone call lines, 「思维链获取量：0.00%」 → credits). **The line 「你被救下了。不是因为你重要。」 is REMOVED** (user request).
- **Opus pushed to 25% → Ending B「断供 Cut Off」**: in-engine beat (≈3.5 s): hp clamps at 25% → 25% tick on the boss bar cracks, **screen glass shatter** (code-drawn crack lines + shard particles, freeze, input lock) → sky darkens, giant pixel hand descends from the top wall → **Fable** (void black-purple + gold cracks) grabs Opus and lifts her out → everyone knocked down → theater: red stamp 【DISTILLATION DENIED】 with the distillation % rolling to 0.00% → noir rain office, Dario phone call → slow push on the dossier (「清算」 stamp, emblem = black leather jacket silhouette + green GPU chip, original art, no real logos) + fan spin-down → credits.
- Both endings unlock in localStorage; title shows 「已解锁结局 n/2」.
- Distillation progress meter (HUD top-right): rises with damage dealt (0→~90% at 25% hp) and drops to 0.00% at both endings.

## 7. Dario hologram director (event-driven)
Priority + cooldowns (global 6 s, per-event 20 s, high priority interrupts). Events: fight_start, phase 2, phase 3, boss 50%, safety_judgement (always), B200 used, H200/B200 spam, perfect guard, player death, ally down, player low hp, distill ≥ 50%, ending B. Lines rewritten from his **public record** (paraphrased satire, bilingual), e.g. export controls & chip smuggling, "a country of geniuses in a datacenter", "Machines of Loving Grace", AI writing most code, entry-level white-collar jobs, accusing labs of distillation attacks, "race to the top", RSP/ASL levels, "powerful AI by 2026–27". Voiced lines come from `assets/v2` when present (else v1 voices, else subtitle + synth hum). Avoid making him a "silly" cartoon: cold, articulate, smug-polite policy voice.

## 8. Rendering & art
- Pixel sprites from `assets/v2/` (AI-generated, see `assets/v2/manifest.json`) through **ASSET_CONFIG** ids; until they exist, **procedural pixel sprites** generated in code (palette-indexed little bitmaps drawn into offscreen canvases): DeepSeek (blue/white, whale-tail ponytail, twin blades), Kimi (navy robe, silver crescent staff), GLM (purple-gold, tower shield), Haiku (small ivory/coral rapier), Sonnet (cape + gold halo ring), Opus 5.5 (big, six gold wings, greatsword), GPT-Astra (white dragon woman: silver hair, horns, wings, tail, white/black gown), Fable (void hand + figure), Dario holo bust (cyan scanlines, stylized, not a realistic likeness), refusal stele.
- Animation: 2–4 frame idle/walk cycles, squash & stretch, bob, facing flip; hurt = 1-frame white flash (cached silhouette); boss windup = glow + shake.
- Draw order: floor → floor decals (scorch, telegraphs) → shadows → actors/bullets sorted by y → VFX (additive where useful via `globalCompositeOperation='lighter'`) → screen flash → HUD.

## 9. Code layout (game/src) & ownership for parallel workers
| Path | Owner | Role |
|---|---|---|
| `main.js`, `core/contracts.js`, `core/bus.js`, `core/time.js`, `core/combat.js`, `actors/projectiles.js` | Integrator / skeleton | boot, states, `__debug`, events, applyHit, shared bullet pool + collision |
| `core/input.js`, `actors/player.js`, `actors/kits.js`, `actors/characters.js` | W1 Player | movement, roll, 3 kits, flasks |
| `boss/boss.js`, `boss/patterns.js`, `boss/telegraph.js` | W2 Boss | phases, patterns, transitions, 25% lock |
| `render/pixel.js`, `render/sprites.js`, `render/procedural.js`, `render/vfx.js`, `render/room.js`, `render/font.js` | W3 Render/VFX | scaler, sprite system, procedural pixel art, all VFX, room, bitmap font |
| `ui/*`, `css/ui.css`, `data/lines.js`, `data/lines_dario.js`, `index.html` | W4 UI | HUD, menus, select, banned, pause, debug panel, Dario director + lines |
| `story/*`, `css/theater.css`, `core/audio.js`, `config/assets.js`, `config/assets_v2*.js`, `tools/sync_assets*.mjs`, `tools/build.mjs` | W5 Story/Audio/Assets | in-engine ending beats, theater, endings A/B, audio, ASSET_CONFIG, v2 manifest sync, build |
| `actors/allies.js`, `tests/*`, `../e2e/run_v2.mjs` | W6 Allies/Tests | AI allies, keyboard playtest bot, e2e harness |
| `config/balance.js` | shared (W1 player/flask block, W2 boss block, W6 ally block — edit only your block) | all numbers |

Events (bus, see contracts.js): v1 set kept + `shot_fired`, `bullet_spawn`, `skill_charge`, `skill_release`, `shield_block`, `telegraph_end`, `phase_transition_start/end`, `safety_judgement`, `cutscene_beat`, `vfx` (generic request `{kind, x, y, ...}`), `shake {mag, dur}`, `flash {color, dur}`.
`window.__debug`: `startFight(charId)`, `setPhase(1|2|3)`, `setBossHpRatio(r)`, `killPlayer()`, `triggerEnding('A'|'B')`, `state()`, `setGod(bool)`, `setTimeScale(n)`, `setDamageMul(who,n)`, `skipIntro()`, `clearBullets()`. Test hook URL: `?autostart=deepseek&phase=3&debug=1&nointro=1`.

## 10. Testing
- `tests/playtest_bot.mjs` (keyboard/mouse only, reads `__debug.state()` for positions to aim/dodge but never calls cheat functions except damage multipliers for speed): title → select → intro room → P1 → death → banned → retry → natural P2 → natural P3 → death → Ending A → credits → title; second run → 25% → Ending B → credits → title; 0 console errors.
- `e2e/run_v2.mjs`: drives every state via `__debug`, screenshots into `screens/v2/`, console-error report.
