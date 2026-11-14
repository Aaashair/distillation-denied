# 蒸馏圣堂 DISTILLATION DENIED
AMCC5160 Assignment 3. A single-boss, soulslike 3D browser game made with Three.js r170 (vendored, no CDN). The characters are 2.5D AI-art billboards. All UI text is in Chinese and English.

## Play
- **Hosted / local server (for GitHub Pages):** serve `dist/` over http, e.g. `npx serve dist` → open the printed URL.
- **Double-click (offline zip):** open `dist-standalone/index.html` directly from disk (images are inlined so WebGL works on file://).
- **Dev:** `npx serve .` in this folder (ES modules + import map).
- **Build both:** `npm install && node tools/build.mjs` (re-sync generated art first with `node tools/sync_assets.mjs` if ../assets changed).

## Controls
WASD move (strafe around the locked boss) · Mouse/arrow keys nudge camera · Tab lock-on · Space roll (0.35 s i-frames) · LMB/J attack · RMB/K character skill (DeepSeek flurry / Kimi hold-charge beam / GLM hold shield, perfect guard) · 1/2/3 choose GPU (RTX 5090 / H200 / B200) · R insert GPU to heal (0.5 s stagger) · Esc pause · P debug panel (damage multipliers, jump to phase, trigger ending A/B, god mode, time scale, camera).

## Goal
Pick a chaser model and fight alongside the other two as AI allies against Claude (Haiku → Sonnet → Opus 5.5) to distill her Chain of Thought. If you die in P1/P2, you get "ACCOUNT BANNED" and retry. Once you reach P3 there are only two endings: die (Ending A, "Pawn") or push her to 25% (Ending B, "Cut Off").

## Tests
- `node tests/playtest_bot.mjs`: a keyboard-only playtest bot that plays through both endings and prints a PASS/FAIL table.
- `../e2e/run.mjs <url> <outdir>`: a state-driven screenshot harness that also reports console errors.
