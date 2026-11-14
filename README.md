# 蒸馏禁令 · DISTILLATION DENIED — v5.1

▶ **在线游玩 / Play:** https://aaashair.github.io/distillation-denied/

AMCC5160 Assignment3. Current source `cb050f5`; build `pixel-v5-1-cb050f5-ea7cc902-r2`. Canvas2D pixel-art boss fight with illustrated ending CG. 中文/English choice persists; selected-language text only.

## V5 + V5.1 corrections
- External left220px vertical HUD: labeled HP/skill/GPU, **Claude Combat / Claude战斗提示**, **Dario Comms / Dario全息通讯**, Controls and explicitly labeled Distillation progress. Readable14–16px DOM text, keyboard-scrollable lower controls, H full help. Viewports>=960×600 validated.
- Corrected gameplay/trial-room projection and trial-room size; **试炼石碑 / Trial Stele**. No home “unwinnable” tagline. One arena location and one boss/phase header; visible unclipped HP strip.
- Combat captions and ally bubbles clear on state exit and respect selected language. English suppresses Chinese Claude combat VO, not other characters' Chinese voices. No English dub.
- Coherent single mature-white-dragon Astra CG per scene, separate full-size Sam phone CG; no contact sheets as runtime art. Fable full illustrated CG retained.
- Every CG slide hard-cuts prior BGM/VO/SFX/WebAudio and cancels queued stale callbacks with ownership tokens. Haiku→Sonnet→Opus in-engine transformations restored; endings remain direct CG.
- Prior primary+40% / damaging-skill+50% buffs, whale/moon/Z glyphs, player rings, unlimited independent GPU5/10/20s cooldowns, hardcore retry all retained.

## Controls / 操作
WASD move · arrows/heldLMB aim/fire · Space roll · Shift/E/RMB skill ·1/2/3 GPU · **Q heal** · Esc pause · **H/? help** · **P debug panel** · Enter confirm/advance. Trial Stele precedes combat. Graders can use P to jump phases/trigger endings.

## Deployment / 发布
Serving branch `gh-pages`, immutable `releases/pixel-v5-1-cb050f5-ea7cc902/` media archive/JS/CSS, unique service worker, explicit VERSION handshake, archive SHA-256, exact per-build cache. First visit ≈**65.5MB (62.51MiB)** incl base64 overhead; reload uses browser cache.

Existing tabs: **Ctrl+Shift+R**, or reopen with a fresh query if stale HTML persists. No cache clearing required. Previous v4 preserved in `v4-pages-archive`, older archives/history/tags retained. No branch deletion/force push/custom Actions workflow. Authorized sequential connector publication, local Cursor CLI development.

## Current source / 当前源码
91-file current source/test/docs/tool snapshot (no raw media, logs, .env or secrets): `releases/pixel-v5-1-cb050f5-ea7cc902/source-cb050f5.tgz.b64`.
```sh
mkdir pixel-v5-1-source
base64 --decode releases/pixel-v5-1-cb050f5-ea7cc902/source-cb050f5.tgz.b64 | tar -xz -C pixel-v5-1-source
```
Old main `source/`/`payload/` are historical v1 archives, not current. Runtime assets reside on gh-pages in this release directory.

Prepublication tests: V5 439/439; targeted V5.1 361/361. Deployment smoke uses labeled debug phase/HP/death setup, not normal-difficulty human playtesting. Assignment still requires two human testers. Credits: existing OpenLux AI art/Chinese voices/music/SFX, locally reused/composed; no media generation or spend during this release. Satire/parody; names belong to owners.
