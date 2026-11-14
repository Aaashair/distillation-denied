# 蒸馏圣堂 · DISTILLATION DENIED — Pixel v3

▶ **在线游玩 / Play:** https://aaashair.github.io/distillation-denied/

AMCC5160 Assignment 3. Canvas2D pixel-art boss room, 640×360 internal buffer. Source `2d6c816` (includes `46ad891` and `394d37d`), build `pixel-v3-2d6c816-cdf9afdf`.

## 本轮更新 / This release
- Persistent **中文 / English** title selector. Only selected-language text is shown. Voices remain Chinese; no English dub.
- Primary damage +40%; damaging skills +50%. GLM skill: **开源之盾 / Open-Source Aegis**.
- Unlimited GPU heals with independent cooldowns: **RTX 5090 5s, H200 10s, B200 20s**. No quantity limit; interruptions consume cooldown. Pause freezes cooldowns; retry resets them.
- Projectile glyphs: whales 192px, dark moons 440px, Z bolts 96px.
- Persistent Haiku Dario hologram even between taunts.
- Ending A engine rescue/carry and theater now use mature white-dragon Astra compositions. Carry beam reduced so her face stays visible. Existing art recomposed locally, not new generated video.

## 操作 / Controls
WASD move · arrows or held LMB aim/fire · Space roll · Shift/E/RMB skill · 1/2/3 choose GPU · **Q heal** · Esc pause · **P debug panel** · Enter confirm/advance.

Hardcore: no checkpoint/story mode. Claude: Haiku → Sonnet → Opus 5.5. P1/P2 death = account banned/retry; P3 death = Ending A; personally push Opus to 25% = Ending B. Graders can use **P** to jump phases/trigger endings.

## Deployment / 发布
`gh-pages` serves the site. Immutable `releases/pixel-v3-2d6c816-cdf9afdf/` runtime/CSS/payload, unique service worker filename, version handshake, SHA-256 archive verification and exact build-specific cache prevent mixed old/new assets.

First download approximately **52.9 MB (50.45 MiB)** including base64 overhead. Reload reuses browser cache. Existing tabs: **refresh**; if old HTML remains, **Ctrl+Shift+R**. Modern desktop Chrome/Edge recommended.

No custom Actions workflow. Sequential authorized GitHub connector commits only. v1 history/local `v1-3d` tag and remote `v1-pages-archive` preserved; previous v2 in `v2-pages-archive`. No branches deleted/force-pushed.

## Source / 源码
Current text-uploaded source snapshot: `releases/pixel-v3-2d6c816-cdf9afdf/source-2d6c816.tgz.b64` (65 source/test/doc files; no runtime/raw assets, credentials or logs).

```sh
mkdir pixel-v3-source
base64 --decode releases/pixel-v3-2d6c816-cdf9afdf/source-2d6c816.tgz.b64 | tar -xz -C pixel-v3-source
```

Old main `source/` and `payload/` directories are v1 archives, not the current release. Runtime assets are on the serving branch under the release directory.

Local prepublication follow-up: 91/91 PASS, including real enemy-damage death→Ending A at normal damage. Debug-assisted deployment smoke checks are not human playtests; the assignment still requires two people. Credits: existing OpenLux AI art/Chinese voice/music/SFX, local Cursor CLI development. Satire/parody; names belong to their owners.
