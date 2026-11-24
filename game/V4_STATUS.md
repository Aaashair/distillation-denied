# v4 — human-playtest readability and cinematic iteration (local only)

Started 2026-11-14 02:25 MST from `2d6c816`; preserved tag `v3-before-v4`. No publication. Four isolated local Cursor CLI workers (composer-2.5-fast) completed; ownership/prompts in `../prompts/v4/`, transcripts in `../logs/v4_ws*.jsonl`. All merged, then integrated on main. No media generation or paid calls.

## Implemented
- Large, labeled HP and skill icon/name/key/readiness; three GPU cards show heal strength and independent cooldown. HUD uses bottom letterbox space, never walkable floor, with a 110px safe footer. Both 1280×720 and 960×600 validated. Initial localized controls briefing explicitly waits for Start Fight; H/? recalls it. One chosen language remains persistent.
- Dario hologram stays centered at the top doorway (including Haiku); taunt text occupies the left gutter. Selected Claude captions occupy right gutter, away from HP and combat.
- Only controlled player has foot ring: DeepSeek blue, Kimi purple, GLM white/dark outline; moves and rolls with sprite.
- Setting is `548 Market Street` in both languages; game title unchanged.
- Ending A and B directly enter full-screen, high-resolution illustrated CG, without legacy in-arena descent/glass-hand performance or story stingers. Fable has a complete head-to-toe establishing panel and a dedicated takes-Opus panel. Existing suitable full Fable artwork reused, not newly generated. Mature white-dragon Astra appears in every active rescue/theater frame; Sam uses new silhouette. Deleted old narration stays deleted.
- Phase CG freezes real simulation, clears enemy bullets, resumes same HP/position/GPU cooldown; no checkpoint. P1/P2 death instantly shows a language-neutral ban-lock CG plus localized retry UI (no bilingual baked stamp).
- Fictional/parodic Claude battle taunts include IP ban and KYC, plus short variants, event cooldown and no immediate repeats. English selection mutes Chinese Claude battle VO regardless game state, retaining SFX and English text. No English dub generated; other existing Chinese character VO remains.
- Combat unchanged: previous +40% normal / +50% damaging-skill tuning, GLM Open-Source Aegis, projectile maximum displacements DeepSeek192/Kimi440/GLM96 px (traversable384×208; diagonal436.72), unlimited independent RTX5090/H200/B200 cooldowns5/10/20s, hardcore retry reset, ordinary combat VFX/hitstop.

## Fresh integrated validation
Authoritative evidence: `../screens/v4/final/` (full logs retained, including failed attempts).
- Readable UI:125 PASS/0 FAIL, both languages × three kits × two viewports; readiness bounding boxes explicitly must not clip.
- Scene/rings/Dario:11 PASS/0 FAIL.
- Claude production controller/locales/audio:18 PASS/0 FAIL. Mandatory lines use real production controller, not DOM-injected caption text.
- Story:20 PASS/0 FAIL, includes actual post-CG cooldown advancement (briefing pre-acknowledged, not masking simulation).
- Existing combat tuning/range/GPU regression:60 PASS/0 FAIL.
- Source, bundled HTTP, file:// smoke:13 PASS/0 FAIL, including a real Claude hit → direct Ending A. Setup assists: P3 selected and boss damage×50, god off, real WASD pursuit; never killPlayer/HP writes for this natural-path proof. Other state tests use labeled debug starts, god mode, threshold/kill triggers as documented in report JSON.
- Total247 PASS/0 FAIL. Console/page/network error arrays empty on final runs. Automation is not a substitute for required human playtesters; this iteration logs user-relayed human feedback without inventing identity/count.

Deployable build: `dist/`,337 files,45,064,371 bytes (42.98 MiB). Source/HTTP/file smoke passes; not published. Final aggregate: `../screens/v4/final/summary.json`.

## Evidence
- `final/ui/fight_1280x720_zh_deepseek.png`, `fight_960x600_en_deepseek.png`; corresponding EN/CN/GLM/Kimi shots.
- `final/scene/dario_p1_topdoor_1280x720.png`, `ring_deepseek_move.png`, `ring_kimi_move.png`, `ring_glm_move.png`.
- `final/claude/mandatory_ip_en.png`, `mandatory_kyc_zh.png`; audio probes in v4_claude.json.
- `final/story/ending_b_fable_cg.png`, `ending_b_full_fable_takes_opus.png`, `ending_a_white_dragon_theater.png`, `ending_a_direct_cg.png`, `phase2_cg_during.png`, `ban_cg.png`.
- `final/bundle/real_enemy_hit_astra_rescue.png`, `bundle_http_fable.png`, `report.json`.

## Honest caveats / review
- Illustrated CG uses reused/composed existing art and restrained pan/fades, not new video or live in-arena rescue animation. Low-resolution room art is not used as CG background. Provenance: assets/v4/AUDIT.txt and tools/compose_v4_story.py.
- Initial playable tutorial room remains gameplay, not cinematic. Debug setPhase intentionally bypasses normal illustrated phase transition; real boss transition is tested separately. Normal combat hitstop remains.
- Failed attempts preserved: first compact HUD clipped GPU readiness; corrected by extending letterbox footer. Scene harness initially stalled because first-entry controls correctly blocked movement; setup now pre-acknowledges briefing. Claude harness initially served its isolated worktree; fixed to derive current checkout, rerun on merged main. Initial bundle HUD assertion used obsolete selector; corrected to actual numeric HP. These were not hidden as game passes.
- No new balance claim based on human tests; normal-difficulty full victory was not re-played in this v4 pass. Existing combat test suite passes. Small mobile viewports below960×600 are not validated.
