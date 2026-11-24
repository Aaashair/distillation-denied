# V2 status

Release candidate on local `main`. Not published. v1 is tag `v1-3d`.

## Done

- Canvas2D room at 640×360. Room plate 480×320 at screen offset (80, 20). Actors are room-local.
- Three kits (DeepSeek flurry, Kimi charge beam, GLM shield / perfect guard), keyboard twin-stick and mouse fire, roll, flasks, pause.
- Three boss phases, telegraphs, Safety Judgement 8 s into phase 3, HP lock at 750 (25%) into Ending B once. Allies stop at 751.
- Pixel room, sprites, HUD, Dario holo lines, 80 voice lines, theater endings, credits on the last theater shot, then the title.
- Mature white-dragon Astra (`px.astra.mature` / `v2_astra_portrait`) and the Sam silhouette (`v2_sam_cutscene`). The removed line 「你被救下了。不是因为你重要。」 is not played. `DESIGN.md` still lists it as the old v1 A7 row.

## Controls

WASD move. Arrows shoot. Hold LMB to shoot at the cursor. Shift, E, or RMB is the skill. Space rolls. 1/2/3 then Q is a flask. Esc pauses. P opens debug. Enter confirms and skips.

## Tests (not human playtests)

Two people still need to play it. Bots and the debug tour are below.

| Run | Result | Cheats |
|---|---|---|
| `node e2e/run_v2.mjs http://localhost:8091/ screens/v2/final` | All steps OK. 0 console errors, warnings, or 404s. | `__debug.startFight`, `setPhase`, `killPlayer`, `setBossHpRatio(0.25)`, `forcePattern('p3_smite')`, `setGod(true)` during the judgement still, `triggerEnding`. GLM perfect-guard still spawns one scripted boss bullet. Headless `window.blur()` is followed by a `blur` event if keys are still held. |
| `node tests/playtest_bot.mjs http://localhost:8091/ screens/v2/final` | 24/25, 0 console issues. Keyboard from title through intro. Shots reduced boss HP (2996.92 → 2912.5). Player took damage. Q healed 120 → 130. Phase-1 death banned. Phase 2 and 3 reached. Phase-3 death went to Ending A and then the title. Second run reached Ending B at ratio 0.25. All three skills fired. | Section a: none. Section b: player damage ×8, then ×0.02 and god mode off so the death is from the boss. Section c: player damage ×8, shots are real. Section d: `startFight` plus one Shift. |
| Retry | The full keyboard run's retry row failed. It read HP after the new fight had started (player 120, boss 2966). A separate Enter-retry probe, 5 times, recorded phase 1, player 130/130, boss 3000, flasks 3/2/1, 0 console issues (`screens/v2/final/retry_targeted.json`). `killPlayer` was used only to open the ban screen. The bot now listens for `fight_reset` before the 3 s auto-retry. | Setup only. |

## Screenshots

`screens/v2/final/`

Tour: `002_title.png`, `004_select.png`, `005_intro_deepseek.png`, `008`–`016` the three characters across three phases, `017_debug_panel_open.png`, `018_banned.png`, `019_skill_deepseek_flurry.png`, `020_skill_kimi_charge.png`, `021_skill_kimi_beam.png`, `022_skill_glm_shield_perfect.png`, `023_pause.png`, `024_resume.png`, `025_opus_safety_judgement.png`, `026_ending_a_astra.png`, `028_theater_a_sam.png`, `029_cutscene_b_glass.png`, `030_cutscene_b_hand.png`, `031_theater_b_stamp.png`, `032_theater_b_dossier.png`, `033_theater_credits.png`, `035_menu_credits_state.png`.

Bot: `bot_a_fight.png`, `bot_a_combat.png`, `bot_a_flask.png`, `bot_a_banned.png`, `bot_b_p3.png`, `bot_b_ending_a.png`, `bot_c_ending_b.png`, `bot_a_retry_recheck.png`, `bot_playtest.txt`. Harness log: `report.txt`.

## Build

`node tools/build.mjs` → `dist/` (not committed).

- 39,837,029 bytes, 37.99 MB, 330 files
- `dist/game.js` 584,599 bytes, IIFE, no top-level import/export
- Served at `http://localhost:8093/` and opened as `file://game/dist/index.html`
- Both reached the title with 0 console errors, no CDN request, no WebGL, no login

## Placeholders

- A missing sprite id falls back to the procedural body.
- Skill callouts drawn on the canvas use a Latin bitmap font.
- Dario's new lines are paraphrases of the public record in `assets/v2/dario_sources.md`.

## Known issues

- The full keyboard bot's retry row failed because it read HP after the restarted fight had already traded hits (player 120, boss 2966). The spawn itself is full.
- Small boss-pellet hits share one 16 ms hit-stop and a mild flash at most every 0.12 s. Heavier hits still stop the sim.
- Opus is scaled to 0.7. Phase 3 will not walk high enough to clip the wings. The hurtbox is still the feet.
- `esbuild` warns that `boss.render` and `hud.render` are optional and currently undefined.
- Calling `setBossHpRatio` again can replay Ending B, because that debug path clears the one-shot lock.
- Rapid `setPhase` can stack the phase banner.

## Bounded recovery verification (2026-11-13 22:45 MST)
- Worker completed and source committed as `11f1d1c`; no active competing editor remains.
- Independent full rerun (loaded before the final observer-placement fix): **24 PASS / 1 FAIL**, 0 console issues; failed retry row was `late p1` because the 3-second ban countdown could auto-retry while the screenshot was being saved, before its observer was attached. Both keyboard-progression endings passed. Original report preserved at `screens/v2/final_rerun/bot_playtest.txt`; not rewritten as a pass.
- Corrected committed bot attaches the `fight_reset` observer BEFORE waiting for death/ban (not after the screenshot). No game healing/HP-reset logic was changed for this test defect.
- Independent targeted checks: **5/5 manual Enter retries + 3/3 delayed auto-countdown retries PASS**, 0 console issues. Exact reset is P1, GLM130/130hp, boss3000/3000hp, flasks3/2/1. Debug start/kill are setup-only. Proof: `screens/v2/final/retry_targeted.json` and `retry_autocountdown.json` (paths relative to project root, outside game/).
- Runtime source build after final commit: **39,837,029 bytes**. No publish.
- Final focused regression extracted verbatim from the committed bot's section a (menus → intro walk → combat damage → Q heal → natural P1 death → ban → keyboard retry): **10/10 PASS**, **0 console issues**, **NO debug setup, no damage multipliers, no god mode**. Retry event snapshot: player130/130, boss3000. Report `screens/v2/retry_section_a/bot_playtest.txt`; reproducible runner `recovery/retry_section_a_committed.mjs`. This specifically verifies the fixed observer-placement test under real play; a new complete25-row run after this final placement fix was not performed.
- Post-commit bundled smoke: **10/10 PASS, 0 console issues** (debug-assisted phase/death/ending checks, HTTP + file://). Full state-tour report: **25/25 steps OK, 0 console issues** (debug-assisted).

## Superseded locally by playtest iteration v3
Historical v2 results above are retained, not relabeled as v3 passes. Local v3 removes finite GPU counts, selects one text language, retunes damage/range/shot art and replaces actual Astra rescue panels. See `V3_STATUS.md`; no v3 publication is authorized.
