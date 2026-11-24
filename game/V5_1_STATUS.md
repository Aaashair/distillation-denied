# v5.1 — sidebar clarity and duplicate-label correction

Local only, 2026-11-14 03:53 MST. This is the user's focused screenshot follow-up, not release approval. No publishing, media generation, gameplay/balance changes or new human-test claims.

## Changes
- Persistent selected-language section headers: Claude战斗提示 / Claude Combat, Dario全息通讯 / Dario Comms, 操作说明 / Controls. Removed unexplained HOLO; idle sections identify their source instead of showing an unexplained empty box.
- 蒸馏进度 / Distillation progress explicitly labels the percentage.
- Location appears once in the arena header, boss name + Phase N/3 once. Removed redundant floor location and intro hint location. Deduplicated Sonnet/Opus too, not just Haiku.
- Fixed a previously clipped boss HP strip: one heading row, one full-width HP row, measured inside header in every viewport/phase/language.
- Kept distinct health/skill/GPU blocks. Lower information panel intentionally scrolls at small sizes; a persistent localized Scroll / H full-controls hint makes this explicit. Focused panel handles Home/End/PageUp/PageDown/arrows without firing shots. All instructions can actually be reached; minimum sidebar control font is 14 CSS px.
- Reused Claude controller-owned caption/toast nodes rather than creating duplicate DOM IDs; live messages remain inside their labeled section.

## Final validation (361 PASS / 0 FAIL; automated, not human testers)
- `tests/v5_1_sidebar.mjs`: **313 PASS / 0 FAIL**. 1280×720, 1024×615, 960×600 × all 3 boss phases × CN/EN (18 cases); live Claude KYC and Dario lines, unique owned nodes, all-phase title counts, boss HP containment, keyboard End reveals the last control, selected-language headings and >=14px font.
- `tests/v5_combat_flow.mjs`: **30 PASS / 0 FAIL** on unique main-source port8174. In-engine P2/P3 transitions, every production move label in both languages, no combat text after ending/state exits, English Claude CN-voice suppression, clean console/HTTP.
- `tests/v5_bundle_smoke.mjs`: **13 PASS / 0 FAIL**. Source + bundled HTTP + bundled file://; direct full Fable B CG and real enemy hit -> direct Ending A. Debug startFight/god/phase/B-threshold setup; natural A uses boss damage ×50 and WASD pursuit, not forced player death or HP writes. Initial controls briefing acknowledged for combat setup.
- `tests/v5_1_intro_smoke.mjs`: **5 PASS / 0 FAIL**. Actual keyboard title -> disclaimer -> selection -> training in CN/EN; localized Trial Stele and no duplicate boss/location header.
- Zero final console/HTTP errors. Automated setup assists are not a difficulty/balance human playtest.

Integration investigations: an early assertion incorrectly required a non-empty Claude line before any line had fired (idle standby is legitimate); corrected it while retaining actual forced-KYC verification. A first optional flow run accidentally reached a stale worker server occupying8154 (different source hash); rerun on fresh8174 passes30/30. Keyboard End initially sampled native scrolling before completion; added deterministic focused-panel navigation and reran18/18 cases. First training attempt omitted the mandatory disclaimer Enter and was stopped; final three-step keyboard run is the5/5 result. Failed preliminary logs are not included in the final361 count.

## Evidence
Base: `screens/v5_1/final/`
- `sidebar/labels_initial_1024x615_en_p1.png` — unscrolled source labels, one Haiku header, visible HP.
- `sidebar/labels_initial_960x600_zh_p2.png` — Chinese compact sidebar and one Sonnet header.
- `sidebar/labels_initial_1280x720_en_p3.png` — one Opus header and full HP strip.
- `sidebar/controls_scrolled_1024x615_en_p1.png` — ALL control rows reachable, persistent scroll/help hint.
- `intro/intro_1024x615_en.png`, `intro/intro_1024x615_zh.png`.
- Logs: `sidebar_run.txt`, `flow_run.txt`, `bundle_run.txt`, `intro_keyboard_run.txt`, `build.txt`.
- Original user frame: `screens/v5_1/before_user.png`.
Coordinator visually opened the final initial1024EN,960CN,1280Opus and scrolled-controls screenshots, not just assertion totals.

## Build / caveats
`game/dist/`: **344 files, 49,740,269 bytes (47.44 MiB)**. Built locally; no remote push or publishing. All current media and gameplay retained. Small-height sidebar intentionally needs scrolling or H full controls; it does not shrink text to force everything on screen. Existing audio-language caveat unchanged: English Claude combat does not play Chinese Claude VO; this does not add English dubbing for other characters.
CLI prompt `prompts/v5_1/sidebar_labels.md`; log `logs/v5_1_sidebar.jsonl`; completed worker commit6e6f133, integration5f820ff plus final local commit.
