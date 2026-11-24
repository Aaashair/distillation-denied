# Playtest iteration v3 (local; not published)

## Player-facing changes
- Title choice 中文 / English is persisted as `dd.lang.v3`. All text uses the selected language; voices remain Chinese. English subtitles are not an English dub.
- Normal damage +40%; damaging skill hits +50%. Boss HP/attacks unchanged. Ally kit attacks inherit the existing ally multiplier.
- GPU healing is unlimited, using independent cooldowns RTX 5090 5s / H200 10s / B200 20s; heal strength remains 30% / 50% / 100%. Select with 1/2/3, press Q. Cooldown begins on initiation, including interrupted drinks. Pause freezes simulation timers; retry resets them.
- Traversable floor is 384×208px: whale travel 192px (half width), dark moon 440px (covers the 436.7px floor diagonal), Z travel96px (quarter width). Actual path/range checks are recorded by combat tests.
- Skills: DeepSeek 专家鲸群 / Mixture-of-Whales, Kimi 长上下文·暗月 / Long-Context Dark Moon, GLM 开源之盾 / Open-Source Aegis. GLM remains a defensive shield/perfect guard, not a new damage burst.
- Ending A active rescue/carry/theater imagery is recomposed locally from existing mature white-dragon Astra art; no generated-media calls. Sam silhouette retained. Dario hologram stays visible during Haiku even when not taunting.

| Damage | Before | After |
|---|---:|---:|
| DeepSeek shot/pellet |2.2|3.08|
| DeepSeek skill hit |7|10.5|
| Kimi shot |8|11.2|
| Kimi charged beam |25–100|37.5–150|
| GLM shot |6.5|9.1|
| GLM perfect guard |25|37.5|

## Controls
WASD move; arrows or held LMB aim/fire; Space roll; Shift/E/RMB skill; 1/2/3 select GPU, Q heal; Esc pause; P debug. Enter confirms/advances scenes.

## Verification
- Main-branch combat suite:60 PASS /0 FAIL. Includes real applyHit/volley collision in deterministic test contexts (not unattended human-like play); phase1→2→3 after196 volleys, old/new theoretical primary DPS46.20→64.68,24.24→33.94,27.30→38.22. No damage multiplier/god mode for these deterministic damage checks; screenshot gameplay uses ×1/time1/god off.
- GPU deterministic simulation: RTX used5times at5s, H2004times at10s, B2003times at20s; independent clocks, repeat guard, interruption, zero-dt pause and spawn/reset assertions. No quantity fields remain.
- Main-branch UI/integration:19 PASS /0 FAIL. Real title language buttons/reload, selected-language title/select/debug screenshots, Q, pause, retry, Dario resource and idle screenshot, ban/ending state smoke. Debug startFight/god/phase/death used as setup.
- Ending-language suite:9 PASS /0 FAIL, CN/EN selected subtitles for both endings; Chinese voices unchanged. Debug phase/death/25% threshold and Enter engine-skip used.
- HTTP and file:// bundle smoke:2 PASS /0 FAIL, clean browser errors/HTTP. Build has no CDN. Screens/results: `screens/v3/final/`.
- Earlier harness failures retained: pause sampled before pause processing (18/19), and captionless B3 denial-stamp sampled as dialogue (7/9). Corrected state/shot sampling; not game-rule changes.
- Final integrated story/art suite: re-run after natural-death follow-up expected **46 PASS /0 FAIL** (stationary natural probe is informational only; see below). Zero browser console/network issues. All14 alias audits, forced Opus-death engine dive+carry, actual theater A3/A4/A5/Sam, single-caption nodes, removed narration and old-art resource audit pass. Forced actual-death path is proved.
- **Natural Opus death (focused `tests/v3_natural_death.mjs`)**: **9 PASS /0 FAIL**, zero console/HTTP issues. Evidence `screens/v3/natural_followup/`. Diagnosis: flaky `v3_story.mjs` stationary probe is **position/targeting/timeout**, not player invulnerability — at default spawn, P3 smite **safe zones** and pattern windups often yield **zero boss connects** in 16s (`playerHits=0`, HP 130→130). With real WASD into hazards/boss contact, one real boss-sourced hit applies **130** (`dmg` base×`setDamageMul(boss,50)`), HP **130→0**, state **cutscene→carry→theater A4**. Assists labeled: `startFight`/`setPhase(3)`/`setGod(false)`/`setDamageMul(boss,50)` only; no `killPlayer`/synthetic damage. Carry beam: narrower/faded ribbon + Astra redrawn above beam (`cutscenes.js`). Screenshot `natural_death_engine_carry.png` from natural death at carry beat (canvas `toDataURL`).
- Legacy stationary probe in `v3_story.mjs` kept as artifact (`rescue_natural_death_cheat.png`); suite gate removed — use focused proof above.
- Deployable `game/dist/`: **40,177,862** bytes after follow-up build; warning-free build, HTTP and offline file:// fight smoke clean. Not published.
- Debug-assisted automation is NOT a substitute for the assignment's two human playtesters. Historical v2 reports remain unchanged.

## Evidence and limitations
`title_en.png`, `title_zh.png`, `select_en.png`, `select_zh.png`, `fight_en.png`, `fight_zh.png`, `haiku_dario_idle.png`, `ending_A_en.png`, `ending_A_zh.png`, `ending_B_en.png`, `ending_B_zh.png` in final/. Shot gallery: `screens/v3/w2/gallery_projectiles.png` (cartoon whale, dark moon, Z), plus actual live-shot screenshots for all3.
Composed plates/audit: `game/assets/v3/AUDIT.txt`, `astra_contact_sheet.png`; final/story captures actual engine and theater frames rather than copying source art. White-dragon Astra is existing static art composited/animated by code, not newly generated rescue animation. Existing Chinese voices retained; no English dub. Two human playtesters and a fresh human balance check remain required. No publication in this task.

### 2026-11-14 01:29 MST — Strict focused follow-up
- Latest focused run9/9 PASS: real WASD continually tracks the moving boss (not corner-seeking random movement). Claude body contact at combat t0.95s generated a real `hit` event: nominal damage600 (CONTACT_DMG12×explicit boss debug multiplier50), applied130, GLM HP130→0, EndingA cutscene windup→carry(t12.833)→actual theaterA4. God mode false, no HP writes, synthetic damage, killPlayer or triggerEnding. Strict assertions require boss-sourced damage, EndingA id, carry beat and A4 shot id.
- Stationary probe is stochastic, not universally safe: prior captured run had0hits/HP130 after16s, latest stationary run got a real heavy hit at t2.05s and died. Therefore the old timeout was a flawed position/timing-based test, not a demonstrated damage/invulnerability bug. Production combat rules unchanged. Stationary probe now logs INFO rather than counting an automatic PASS; focused real-hit test is the gate. Historical45/46 story result retained; full story suite not rerun this follow-up.
- Visually reviewed the latest `screens/v3/natural_followup/natural_death_engine_carry.png`: mature white-dragon horns/face/body are centered and unobscured; entry rift remains dramatic. Earlier corner-route screenshot clipped Astra above the viewport; preserved as `prior_corner_carry.png`, not used as clarity proof.
- This follow-up regressions: natural9/9, combat60/60, integration19/19; zero focused console/HTTP errors. Existing Chinese voices/assets unchanged; no generation/spend/publish.

### Independent normal-damage confirmation (01:30 MST)
A second browser proof used **bossDamageMul1**, god false, debugGLM/P3 setup and actual boss-tracking WASD only. Eleven real Claude body-contact hits (12damage each, last applies10) produced HP **130→118→106→94→82→70→58→46→34→22→10→0**; EndingA started at combat t8.883s. Thus natural death is also proved without a damage boost, not merely forced debug death. Evidence `screens/v3/natural_followup/normal_damage_proof.json`, zero browser errors.
Final follow-up totals: focusednatural9/9, combat60/60, integration19/19, independentnormaldamage1/1, finalHTTP+filebundle2/2 (**91PASS/0FAIL**, not a rerun of the historical fullstorysuite). Build40,177,862bytes/331files; no publish/media generation.
