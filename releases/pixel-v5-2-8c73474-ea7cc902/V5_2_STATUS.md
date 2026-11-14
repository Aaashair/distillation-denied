# v5.2 — player-attached Skill Ready cue (local only)

2026-11-14 07:43 MST. Actual user-relayed human feedback: players watching combat cannot continually monitor the sidebar cooldown. No tester identity/count invented. Live V5.1 is unchanged; this is NOT published.

## Narrow change
- A small diamond pulse + **技能就绪 / Skill Ready** appears directly above the CONTROLLED player's head for **1.2 simulation seconds** when a genuinely used skill cooldown completes. No initial spawn cue, ally cue, extra audio, flash or hit-stop.
- DeepSeek blue `#7ee0ff`, GLM white `#f4f1ea`, Kimi purple `#c4b5fd`.
- Constant **14 CSS px** readable text on a dark compact pill, at either integer room scale. World-to-buffer coordinates subtract the cropped gutter, then project through the current pixel viewport and shake into screen CSS pixels. Position follows the player each frame and stays within arena edges/under the boss header.
- One notification per completion; reuse cancels immediately (including Kimi charge and GLM shield start). Cue and cooldown timers freeze during pause; cue hides while paused and resumes with remaining life. Retry, reset, death, ending and non-combat exits clear synchronously. No async callbacks/audio to resurrect later. Manual debug cooldown writes disarm the completion detector. Active text follows selected-language changes.
- Existing sidebar, GPU cooldowns, damage/ranges/projectiles, story, rings and Dario remain unchanged.

## Implementation / process
Local Cursor CLI composer-2.5-fast worker branch `v5_2-ready`, commit `ab61225`, session42d596b1-c94c-4916-ae3c-1548079087d5. Prompt `/workspace/amcc5160-game/prompts/v5_2/ready_cue.md`; log `/workspace/amcc5160-game/logs/v5_2_ready.jsonl`.
Integration review replaced a too-small internal-canvas label with the fixed-size CSS pill, corrected state event payload handling (to, not next) to actually preserve paused cue timers, canceled during charge/shield start, and rejected external cooldown-write edges. This keeps the requested feature local to the new module plus player init/reset/tick and main render hooks.
A preliminary acceptance attempt used a100ms Kimi charge, too short to cast, and timed out; corrected to an actual500ms charge rather than pretending a fake cooldown was gameplay. Final tests below complete, with actual cooldowns and images reviewed.

## Final tests — 159 PASS / 0 FAIL
- `tests/v5_2_ready.mjs`: **49/0** on integrated source, all3 characters ×2 languages, no spawn/duplicate cue, cooldown/pause/reset regressions. Evidence `screens/v5_2/worker_final/`.
- `tests/v5_2_acceptance.mjs`: **76/0**, all6 character/language cases. Genuine Shift casts and natural cooldown completion WHILE moving via D; readable14px DOM cue correctly projects to player; actual active-cue pause freeze, channel-start reuse cancellation, retry and no stale pops, manual reset, expiry/once-only, title/theater/death exit. Zero console/HTTP errors. Evidence `screens/v5_2/final/acceptance.json` and `acceptance_final_run.txt`.
- `tests/v5_2_extra.mjs`: **14/0**. Identity colors, ignored ally events, selected-language change during active cue without extra trigger, actual player.reset and reset-then-artificial-CD anti-resurrection.
- Existing `tests/v5_bundle_smoke.mjs`: **13/0**. Source/bundle HTTP/file:// boot, existing HUD, direct full-Fable B, real boss-hit A with explicitly assisted setup, clean console/network.
- `tests/v5_2_bundle_ready.mjs`: **7/0**. Real cast -> real cooldown -> visible localized14px cue and clearing on CG state in source, bundled HTTP and bundled file://. Zero console/HTTP errors.

Assists: debug startFight/god, player+ally damage0 for safe lifecycle tests, timeScale8 until final0.65s then1 for natural moving-player completion. Real Shift skill activation/release and D movement; no cooldown reduction for genuine-completion assertions. Direct state changes/forced death only test cleanup. Existing ending smoke labels its boss-damage×50 natural-A setup. Bots do not replace required human testers.

## Visually reviewed evidence
`/workspace/amcc5160-game/screens/v5_2/final/`
- `ready_1024x615_deepseek_en.png` — blue Skill Ready follows blue-ring player.
- `ready_1280x720_deepseek_en.png` — same readable CSS size at2× room scale.
- `ready_1024x615_glm_zh.png` — white 技能就绪.
- `ready_1024x615_kimi_zh.png` — purple 技能就绪.
- Both languages captured for all3 characters, not only these samples.
Bundled actual-cue frames: `screens/v5_2/bundle/http_skill_ready.png`, `file_skill_ready.png`.

## Build / caveats
`game/dist/`: **344 files,49,744,913 bytes (47.44 MiB)**. No publish/push, no paid media generation, no new audio. At the very top/side edge, the pill is deliberately clamped slightly to stay inside the arena and avoid the boss HP; otherwise it tracks directly above the head. Duration uses gameplay simulation time (normal speed1.2s; debug time acceleration shortens real-time duration). Prior voice-language limitations are unchanged.
