# Process appendix — Distillation Denied (AMCC5160 Assignment 3)

Concise version timeline, tools, automated test counts, and human playtesting. Facts are taken from `PROCESS_LOG.md` and `game/V*_STATUS.md`. Times are given in **Asia/Singapore (UTC+8)**, converted from America/Denver MST (UTC−7) in the process log (add 15 hours). Automated Playwright/bot runs are listed because they are in the log; they **do not** count as the assignment’s required human playtests.

Live build: https://aaashair.github.io/distillation-denied/  
Source repo: https://github.com/Aaashair/distillation-denied

---

## 1. Tools and models

| Role | Tool / model (as logged) |
|---|---|
| Orchestrator | Grok Bot — design, workstream split, merges, automated tests, publishing |
| Coding workers | Cursor CLI `cursor-agent` (print mode, `-p --force --trust --output-format stream-json`), each workstream in its own git worktree |
| Architecture, player feel, boss AI | `grok-4.7-xhigh-fast` |
| Allies, endings / audio (v1) | `cursor-grok-4.6-xhigh-fast` |
| UI / HUD / later playtest iterations (v4–v5.2) | `composer-2.5-fast` (v3 also used isolated local CLI workers; models as in those prompts) |
| Art / voice / SFX / music | OpenLux relay: `gpt-image-2.6-sunburst` / `gpt-image-2.6-flare`, MiniMax Voice Design + `speech-2.8-hd` / `speech-2.8-turbo`, Kling text-to-audio, Suno `suno_music_open` (chirp-v5). Optional clips: `grok-imagine-video`. After quota, Pillow / numpy / ffmpeg only — see `AI_ASSETS.md`. |
| Engine | v1: HTML5 + vendored Three.js r170. v2 onward: Canvas2D, 640×360 integer-scaled pixel buffer. esbuild single bundle; Playwright / headless Chromium for tests. |
| Publish | GitHub Pages `gh-pages` branch with a browser loader + service worker (GitHub Actions could not run: account locked for billing, per the process log). |

---

## 2. Version timeline

One representative screenshot per version is copied to `submission/screenshots/versions/`. Original paths are in the table.

| Version | When (Asia/Singapore) | What changed | Why | Logged automated tests (not human playtests) | Screenshot |
|---|---|---|---|---|---|
| **v1** (tag `v1-3d`) | 13 Nov 2026, evening into 14 Nov early morning. Repo init ~13 Nov 23:35. Round 0 skeleton then five parallel workstreams; integration finished ~14 Nov 03:30; first Pages publish the same morning. | Three.js third-person soulslike: over-the-shoulder lock-on, 2.5D AI-art billboards, three player kits vs Claude Haiku → Sonnet → Opus 5.5, Dario hologram, endings A/B, bilingual UI, P debug panel. | Initial design (satirical class assignment). | Integration playtest bot **18/18 PASS**, 0 console errors (keyboard-only loop, including ban/retry and both endings; earlier runs failed “die in P3 → Ending A” and were fixed). Bundled `dist/` harness: every state reached, 0 console errors. Live smoke on Pages also 0 console errors. | `screenshots/versions/v1_3d_combat.png` ← `screens/03_phase1_haiku.png` |
| **v2** pixel | Decision logged **14 Nov 2026, 11:05** after the first full play of v1. Grey-box checkpoint ~12:00; pixel v2 published and verified **14 Nov 16:40**. | Replaced 3D camera with Binding-of-Isaac-style top-down Canvas2D room combat, integer-scaled pixel art. New Astra white-dragon portrait, more recognizable Sam silhouette, characterful MiniMax voices, Dario lines paraphrased from the public record, deleted Ending A line “你被救下了。不是因为你重要。”, stronger skill VFX. OpenLux quota ran out during asset work (~11:12 the same day); remaining SFX/chiptune/some panels were non-AI (see `AI_ASSETS.md`). | Playtest Round 1 (seven points), especially unreadable 3D camera/combat. The log had already noted the boss reading small and being covered by the player billboard. | State tour **25/25** (debug-assisted). Keyboard section A (menus → intro → combat → Q heal → natural P1 death → ban → retry, no cheats) **10/10**. Bundled HTTP+file:// smoke **10/10**. An earlier full keyboard bot was **24/25**; the failed retry row was a test-race (ban auto-retry), later corrected. | `screenshots/versions/v2_pixel_combat.png` ← `screens/v2/final/008_fight_deepseek_p1.png` |
| **v3** | Feedback recorded **14 Nov 15:49–16:04**. Integrated local result ~16:20; additional natural-death proof ~16:30; published **14 Nov 16:51**. | One persistent language (中文 / English) for *text* (voices stay Chinese; not an English dub). Damage +40% / damaging skills +50%. Unlimited GPU heals on independent 5/10/20 s cooldowns instead of a finite inventory. Themed projectile silhouettes and ranges. GLM keeps 开源之盾 / Open-Source Aegis. Dario remains visible during Haiku. Ending A rescue plates recomposed from the mature white-dragon Astra (Pillow only). | Playtest Round 2. | Final follow-up **91 PASS / 0 FAIL** (natural death 9, combat 60, UI 19, normal-damage proof 1, bundle 2). A historical full story suite was not wholesale rerun in the last follow-up. | `screenshots/versions/v3_fight_small_hud.png` ← `screens/v3/final/fight_zh.png` |
| **v4** | Feedback **14 Nov 17:25**. Local iteration then published **14 Nov 17:59**. | Larger labeled HP/skill/GPU HUD in a bottom letterbox; first-entry controls briefing; Dario at the top doorway; selected-character foot ring; setting name “548 Market Street”; direct fullscreen illustrated CGs (full-body Fable reused, not newly generated); language-selected fictional IP/KYC Claude taunts; English selection mutes Chinese Claude *combat* VO. Combat tuning from v3 kept. | Playtest Round 3 (first-entry UI too small, Fable only a hand, Dario placement, missing identity ring, blurry in-arena story, setting name, mixed-language Claude speech). | **247 PASS / 0 FAIL** (UI 125, scene 11, Claude 18, story 20, combat 60, source/bundle/file 13). | `screenshots/versions/v4_bottom_hud.png` ← `screens/v4/final/ui/fight_1280x720_zh_deepseek.png` |
| **v5** | Feedback **14 Nov 18:22**. Local only in this step (439-test checkpoint ~18:40). Published later as part of v5.1. | External left sidebar HUD (canvas no longer hosts overlapping gutters); training renamed 试炼石碑 / Trial Stele; combat captions cannot leak into the Dario phone CG; unwinnable title tagline removed; Ending A art no longer shows a contact-sheet/atlas; CG audio hard-cuts per slide; Haiku→Sonnet→Opus returns to in-engine transformations (no phase CG); move labels follow the selected language. | Playtest Round 4 (bottom HUD still overlapping/tiny, plus the other listed points). | **439 PASS / 0 FAIL** across seven suites. Visual review rejected some worker “passes” (duplicate Astra atlas, tiny Sam, compressed canvas, clipped HP) and those were fixed before the count. | `screenshots/versions/v5_sidebar.png` ← `screens/v5/final/visual/1280x720_en_kimi.png` |
| **v5.1** | Feedback **14 Nov 18:43–18:53**. Published **14 Nov 19:06** (deployment hardening “r2” for cached-tab takeover). | Persistent sidebar section labels (Claude Combat / Dario Comms / Controls), explicit “Distillation progress”, location once, boss name + phase once (duplicate “Haiku” header removed), clipped boss HP strip fixed, small-height sidebar can scroll with a visible hint. | Playtest Round 5 (unexplained lower-left boxes; Haiku repeated twice at the top). The author’s screenshot used in that round is preserved at `screens/v5_1/before_user.png`. | **361 PASS / 0 FAIL** (sidebar 313, combat-flow 30, bundle 13, intro keyboard 5). Live fresh and upgrade smokes **35/35**. | `screenshots/versions/v5_1_labeled_sidebar.png` ← `screens/v5_1/final/sidebar/labels_initial_1280x720_zh_p1.png` |
| **v5.2** (current live at the time this appendix was compiled) | Feedback **14 Nov 22:36**. Validated locally ~22:43; published **14 Nov 22:58**. | A 1.2 s selected-language 技能就绪 / Skill Ready pill + coloured diamond above the **controlled** player when a used skill cooldown completes (DeepSeek blue, GLM white, Kimi purple). Pause/reuse/reset/death/CG-safe; no new audio or art. | Playtest Round 6 (hard to watch the sidebar cooldown during combat). | Local **159 PASS / 0 FAIL**. Live publication tests (all 3 characters × 2 languages, real Shift casts, cue follows movement) passed with 0 console/HTTP errors; those runs used labeled debug assists and are not human playtests. | `screenshots/versions/v5_2_skill_ready_cue.png` ← `screens/v5_2/final/ready_1280x720_deepseek_en.png` |

---

## 3. Human playtesting

### Testers

The author identified three human playtesters. **Who said which point was not recorded**, so every round below is attributed to **the three playtesters collectively**, not to a named person.

| Name | Affiliation |
|---|---|
| Zhang Xuyang | HKUST, MAE |
| Zhang Chuhan | CUHK, CSE |
| Wang Kaiyuan | CUHK, CSE |

Playtest sessions took place **13–15 Nov 2026** (author-reported); exact per-person times were not recorded. The dates below are when the feedback was **written down** in `PROCESS_LOG.md`. Some early entries were worded as “the user’s own play” or “user-relayed human feedback”; the author later stated that this multi-round feedback came from the three testers above.

Automated bots, debug tours, and the author’s visual review of screenshots are documented in §2 and **do not** replace these playtests.

### Rounds and changes made

**Round 1 — after v1** (recorded 14 Nov 2026, 11:05 Asia/Singapore). Seven points, summarized from the process log:

1. GPT-Astra’s anime design did not match the community “GPT娘·白龙” (white dragon, more mature).
2. The Sam Altman silhouette was not recognizable enough.
3. Voices for the models, Sam and Dario felt flat / had no character.
4. Dario’s taunts were thin; rewrite from his actual public statements and positions.
5. Delete the last line of Ending A (“你被救下了。不是因为你重要。” / “You were saved. Not because you matter.”).
6. Skills had no VFX, or the VFX were not noticeable.
7. The camera and combat were hard to handle; consider a Binding-of-Isaac-style view and pixel art.

**Changes:** the v2 pivot in §2 (top-down pixel combat, new Astra/Sam/Dario/voices, deleted line, stronger VFX).

**Round 2 — after v2** (recorded 14 Nov 2026, 15:49 Asia/Singapore):

- Stop simultaneous bilingual on-screen text; add a language choice.
- Increase damage.
- Replace the finite GPU inventory with independent cooldowns.
- Replace the old Astra rescue art (not merely the idle sprite).
- Keep Dario visible during Haiku.
- Give the three characters themed shot silhouettes with distinct ranges.
- Later correction in the same round: GLM keeps a defensive 开源之盾 / Open-Source Aegis.

**Changes:** v3, as in §2.

**Round 3 — after v3** (recorded 14 Nov 2026, 17:25 Asia/Singapore):

- First-entry UI / HP / skill text too small and unobvious.
- Fable’s intervention showed only a hand.
- Dario should occupy the top entrance.
- Selected model should have a coloured foot ring.
- Wanted direct high-quality CG instead of blurry or stuttering in-arena story animation/audio.
- Arena setting should be named 548 Market Street.
- Selected-language Claude combat speech, including fictional IP/KYC lines.

**Changes:** v4, as in §2. Full-body Fable art already existed and was reused (no new image spend).

**Round 4 — after v4** (recorded 14 Nov 2026, 18:22 Asia/Singapore):

- Bottom HUD still overlapping / tiny.
- Training-room projection / double labels; rename to Trial Stele.
- Combat IP toast leaking into the Dario phone scene.
- Remove the unwinnable tagline.
- Malformed Astra rescue contact-sheet / duplicate art.
- CG audio carrying across slides.
- Remove phase CG and restore in-engine transformations.
- Mixed-language Claude battle UI.

**Changes:** v5, as in §2.

**Round 5 — after a v5 screenshot** (recorded 14 Nov 2026, 18:43–18:53 Asia/Singapore):

- Unclear lower-left boxes.
- “Haiku” repeated twice at the top.

**Changes:** v5.1 labeled sidebar, single boss/phase heading, explicit Distillation progress, scrollable controls.

**Round 6 — after v5.1** (recorded 14 Nov 2026, 22:36 Asia/Singapore):

- Watching the fight makes it hard to monitor the sidebar skill cooldown; request a small readiness notification attached to the controlled character.

**Changes:** v5.2 skill-ready cue.

---

## 4. Before / after pairs (for the process report)

Copies (unchanged pixels) live in `submission/screenshots/`. Mapping: `submission/screenshots/SOURCES.md`.

| Pair | Before | After |
|---|---|---|
| (a) v1 3D vs v2+ pixel | `screenshots/a_before_v1_3d_combat.png` | `screenshots/a_after_v2_pixel_combat.png` |
| (b) V3 small/overlapping HUD vs later sidebar | `screenshots/b_before_v3_small_hud.png` | `screenshots/b_after_v5_1_sidebar_hud.png` |
| (c) Skill-ready cue | `screenshots/c_before_v5_1_no_skill_cue.png` | `screenshots/c_after_v5_2_skill_ready_cue.png` |
| (d) Old Ending A in-arena collage vs illustrated Astra CG | `screenshots/d_before_v2_endingA_inarena_collage.png` | `screenshots/d_after_v3_endingA_astra_cg.png` |

Notes, so the pairs are not over-claimed:

- **(b).** V4 first tried a larger *bottom* HUD (`screenshots/versions/v4_bottom_hud.png`). Playtesters still found it overlapping/tiny, so V5 moved the HUD to a left sidebar and V5.1 labeled that sidebar. The “after” frame is V5.1, which is the readable sidebar the report needs — not V4.
- **(d).** The V3 frame is the first logged complete white-dragon CG with a full caption. V4/V5 kept this art as a direct fullscreen theater; many later automated captures were taken mid-typewriter and look truncated, so they were not used as the “after” image.

---

## 5. Gaps / unknowns

- Individual playtest comments were not tagged to a person; do not assign them.
- Playtest sessions ran 13–15 Nov 2026 (author-reported); exact per-person times not recorded.
- A complete 25-row keyboard bot after the v2 retry-observer fix was **not** claimed in the log (section A was rerun 10/10 instead).
- v5 itself was validated locally (439 tests) and shipped to players as part of the approved v5.1 release; there is no separate “v5-only” public URL still on Pages.
- Total OpenLux API spend: **US$34.82** (author-reported).
- The 60–90 s play-video for the assignment is still to be recorded by the author (not part of this appendix).
