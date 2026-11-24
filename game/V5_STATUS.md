# v5 corrective playtest iteration — LOCAL, not published

2026-11-14 03:22–03:41 MST. Starting source `cc1bf80`, preserved tag `v4-before-v5`. Actual user screenshot/playtest feedback is logged in root PROCESS_LOG.md; no tester identity/count inferred. Authorized local Cursor CLI workflow: four isolated composer-2.5-fast workers, prompts `../prompts/v5/`, logs `../logs/v5_ws*.jsonl`, safe follow-ups after workers finished. No cloud agents, image generation or media spending.

## Eight requested corrections
1. A real external upper-left vertical220px sidebar owns player name, full16px HP numeric/bar, skill icon/name/key/status, vertically stacked unlimitedGPU readiness, controls and readable battle captions. Canvas DOM begins to its right. Cropped presentation480×320 removes obsolete internal HUD gutters, retains pixel buffer640×360 and world geometry; integer2× at1280×720,1× at1024×615/960×600. Trial room expanded from208×112 to416×240, matching combat world scale; input/raster/DOM bubble projections share the same origin. Duplicate intro overlays removed.
2. Training is 试炼石碑 / Trial Stele.
3. Claude/Dario/ally combat DOM clears immediately on EVERY noncombat state exit. Event payload binding bug fixed; queued/forced/localization callbacks cannot resurrect Claude text outside fight. Actual Dario phone shot B4 checked after IP taunt.
4. Unwinnable title tagline removed in both languages.
5. Every illustrated EndingA shot now uses one mature white-dragon Astra or a dedicated full-size Sam phone scene; A7 has recognizable Dario. No sprite atlas/duplicated Astra/contact grid/empty monitor boxes. New coherent highres compositions reuse existing art; each actual slide captured and visually reviewed. Preserved deleted-narration blacklist. Fable full establishing/takes-Opus CG untouched. Theater is genuinely viewport-wide rather than constrained to sidebar/game rectangle.
6. Every CG slide boundary hard-cuts previous HTML BGM/VO/SFX and all scheduled/transient WebAudio sources, music pad/hum/charge. Monotonic ownership tokens cancel pending unlock/load/error/fallback/promise work. Next slide only starts audio it explicitly owns; global ending music does not carry. Combat fades/VFX remain normal.
7. Haiku→Sonnet→Opus uses restored in-engine slow transformation/flash/shockwave beats, NOT phase CG. Natural HP-threshold paths for both transitions remain fight state; no checkpoints. Endings stay direct CG.
8. All15 production boss move labels match exactly one selected-language string, plus parodic IP/KYC taunts. Allied bilingual bubble leak also fixed. English-selected Chinese Claude combat VO muted; no English dub claimed. Other characters' existing Chinese voices remain.

## Fresh final evidence
Authoritative aggregate: `../screens/v5/final/summary.json`.
439 PASS / 0 FAIL: layout229, audio18, EndingA64, combat-flow30, preserved-balance60, source/bundledHTTP/file13, visual25. Runtime/console/HTTP errors empty. Two intentional net::ERR_ABORTED music requests at hard-cut boundaries are separately recorded as expected audio cancellations, not hidden as missing assets.

Debug/capture aids: god/debug starts for screenshot/flow tests; both phase paths exercise production commit with HP-threshold setup; all15 move titles via production announce; forced production IP/KYC bypass cooldown only. EndingA exhaustive PNG capture sets waitClick=true in that browser only to prevent automatic timing skipping a slide while PNG encoding; actual mouse advances and unchanged assets. Rapid-audio timing tested separately without that capture assist. Bundle natural EndingA proof uses P3 + bossdamage×50, god off and real WASD: actual Claude hit130HP→0, no killPlayer/HP write for that test. Other ending state tests use debug triggers. Automation does not replace required human playtesters.

## Representative screenshots (relative to screens/v5/final)
- `visual/1024x615_en_deepseek.png`, `visual/960x600_zh_glm.png`, `visual/1280x720_en_kimi.png`: full sidebar HP, KYC, all ring identities, Dario doorway.
- `layout/intro_1024x615_en.png`, `layout/intro_1280x720_zh.png`: proper-scale trial room and single controls column.
- `combat_flow/opus_transformation_zh.png`, `combat_flow/dario_phone_no_combat_en.png`: engine transformation and clean phone CG.
- `endingA/endingA_A1.png` through `endingA_A7.png` including A6 variants; `endingA_A4.png` is one dragon, `endingA_A6.png` is full Sam. REVIEW_contact_sheet.jpg is QA-only, NEVER loaded as game art.
- `bundle/real_enemy_hit_astra_rescue.png`, `bundle/bundle_http_fable.png`, `audio/summary.json`.

## Build / provenance / caveats
Deployable `dist/`: 344 files, 49,733,789 bytes (47.43MiB), source/HTTP/file smoke tested. No publication performed. Art provenance and alias mapping: assets/v5/AUDIT.txt, alias_map.json; portable references kept in assets/v5/source; reproduce via tools/compose_v5_story.py. CG is composed existing illustration with restrained effects, not newly painted unique animation; A3 is a single bust crop and the office background is a restrained Pillow composition. At smaller viewports pixel gameplay is1×; DOM UI remains14–16px, external sidebar can scroll. Below960×600 not validated. No new normal-difficulty full human victory claim.

Real issues caught beyond worker counts: first sidebar version compressed/double-shifted canvas despite166passes; raster projection corrected. First art pass still duplicated atlas-cropped Astra and tiny framed Sam despite62passes; rejected visually and recomposed. Audio first pass missed short/delayed synth and stale-fallback paths; registry/owner-token hard cuts added. Integrated fullHP clipping/narrow right-caption gutter corrected by moving captions into sidebar. Stronger all-pattern test exposed real Claude event-argument bug; fixed. Initial automatic CG screenshot sampling and two-Enter test helper skipped slides; capture-only manual timing and exact-one-advance helper fixed, not presented as gameplay fixes. Initial image readiness and intentional canceled-media requests distinguished in bundle harness. Failed logs retained beside final logs.
