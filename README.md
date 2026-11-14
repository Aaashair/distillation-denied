# 蒸馏禁令 · DISTILLATION DENIED — Pixel v4

▶ **在线游玩 / Play:** https://aaashair.github.io/distillation-denied/

AMCC5160 A3. Canvas2D 640×360 pixel-art boss fight. Build `pixel-v4-cc1bf80-c0114dc7`, local source `cc1bf80` (integration `1728495`).

## 新版界面与CG / Interface and CG update
- Larger labeled HP/skill/GPU readiness HUD; independent GPU cards below the floor; first-entry controls briefing waits for **Start Fight**, H/? recalls help. Validated at 1280×720 and 960×600; small mobile viewports not validated.
- Dario at the top doorway; controlled-player foot ring: DeepSeek blue, Kimi purple, GLM white/dark outline. Arena **548 Market Street**.
- Direct full-screen illustrated phase/ban/ending CG replaces old in-arena story stingers. Full-body Fable establishing and takes-Opus panels; mature white-dragon Astra throughout rescue/ending. Existing artwork reused/composed, not new generated video.
- Persistent 中文/English choice, selected-language text only. Fictional/parodic Claude IP-ban/KYC taunts; English mode mutes Chinese **Claude combat VO**. Other Chinese voices retained; no English dub.
- Combat unchanged: primary+40% / damaging skill+50%, unlimited GPU heals with independent RTX5090 5s / H200 10s / B200 20s cooldowns. Whales192px / moons440px / Z96px. Hardcore; no checkpoints.

## 操作 / Controls
WASD move · arrows/held LMB aim/fire · Space roll · Shift/E/RMB skill · 1/2/3 GPU · **Q heal** · Esc pause · **H/? controls help** · **P debug panel** · Enter confirm/advance. Graders: P jumps phases or triggers either ending.

## Release / 发布
`gh-pages` serves immutable `releases/pixel-v4-cc1bf80-c0114dc7/` JS/CSS/media payload. Unique service worker filename, explicit VERSION handshake, archive SHA-256 and exact build-specific cache prevent stale/mixed assets. First visit ≈**59.4 MB (56.60 MiB)** with base64 overhead; reload uses cache.

Existing tabs: **refresh**, or **Ctrl+Shift+R** if old HTML/loading persists. No custom Actions workflows; sequential GitHub connector publication. Previous v3 in `v3-pages-archive`; v1/v2 histories/archive branches and local tags retained. No force pushes/branch deletion.

## Current source / 当前源码
`releases/pixel-v4-cc1bf80-c0114dc7/source-cc1bf80.tgz.b64` contains80 current source/test/doc/tool files, no secrets, logs or raw assets:
```sh
mkdir pixel-v4-source
base64 --decode releases/pixel-v4-cc1bf80-c0114dc7/source-cc1bf80.tgz.b64 | tar -xz -C pixel-v4-source
```
Old main `source/` and `payload/` folders are historical v1, not current. Runtime assets reside on gh-pages in this release directory. Local prepublication integrated suite247/247; deployment smoke uses explicitly labeled debug setup for CG/ring checks. Automated tests do not replace the assignment's two human playtesters.

Credits: reused OpenLux AI art/music/Chinese voices/SFX, local Cursor CLI development; no media generation during this deployment. Satire/parody; names belong to their owners.
