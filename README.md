# Distillation Denied

AMCC5160 Assignment 3. A top-down pixel-art boss fight in the browser, in the style of The Binding of Isaac. The game is a satire of the LLM industry. On screen the title is also shown in Chinese as 蒸馏禁令.

The current build is the Canvas2D game. You pick one of three fighters. The other two join as allies. One boss changes form across three phases.

## Play

The live game is at https://aaashair.github.io/distillation-denied/

GitHub Pages serves the **`gh-pages`** branch, from the **root** of that branch (`/`). This `main` branch holds the source and older files. A merge into `main` does not change the live site.

The published page is build `pixel-v5-2-8c73474-ea7cc902`. It loads:

- `sw-pixel-v5-2-8c73474-ea7cc902.js` (service worker, scope `./`)
- `releases/pixel-v5-1-cb050f5-ea7cc902/` for CSS and the media parts
- `releases/pixel-v5-2-8c73474-ea7cc902/game.js`

The browser unpacks the media, checks its SHA-256, and stores it in the cache `dd-media-ea7cc90228ca3fbd`. The first visit downloads the images and audio. Later visits reuse that cache. Use a current desktop version of Chrome or another Chromium browser. The page needs service workers, Cache Storage, and `DecompressionStream`.

The title screen asks you to pick 中文 or English. That choice is the language of the interface and the subtitles. The recorded voices stay Chinese. There is no English dub.

## Controls

| Key | Action |
| --- | --- |
| WASD | Move |
| Arrow keys | Shoot in eight directions (two keys at once shoot on a diagonal) |
| Mouse, left button held | Shoot toward the cursor |
| Space | Roll (brief invincibility) |
| Shift, E, or right mouse button | Skill. DeepSeek: Mixture-of-Whales. Kimi: Long-Context Dark Moon (hold to charge). GLM: Open-Source Aegis (hold a shield) |
| 1 / 2 / 3 | Choose a GPU flask: RTX 5090, H200, or B200 |
| Q | Use the selected GPU to heal |
| Enter | Confirm, skip the trial room, or advance a scene |
| R | Retry on the ban screen |
| Esc | Pause |
| H or ? | Open the control list again |
| P | Debug panel (phase, endings, damage, god mode). Useful for grading |

## Story

You play an open-weight model: DeepSeek, Kimi, or GLM. The fight is at the fictional address 548 Market Street. A trial stele comes before the boss door. The boss is Claude, and changes from Haiku to Sonnet to Opus 5.5. The meter on screen is how much of her chain of thought you have distilled. Dario talks over a hologram during the fight.

Die in phase 1 or 2 and the run ends with "ACCOUNT BANNED", then the fight starts over. After Opus begins, death does not retry. Die in phase 3 for Ending A, "Pawn": GPT-Astra intervenes. Push the boss down to the 25% line for Ending B, "Cut Off": the fight is stopped. Both endings report that 0.00% of the chain of thought was acquired.

## Run it locally

**Same files as the live site.** Check out the `gh-pages` branch and serve that directory:

```sh
git clone --branch gh-pages --single-branch https://github.com/Aaashair/distillation-denied.git dd-pages
cd dd-pages
python3 -m http.server 8080 --bind 127.0.0.1
```

Open http://127.0.0.1:8080/ . Paths are relative, so this matches the GitHub Pages site. Leave the file names on that branch as they are.

**Source, without the published bundle.** From this repository:

```sh
cd game
python3 -m http.server 8091 --bind 127.0.0.1
```

Open http://127.0.0.1:8091/ . Details, including how to unpack the live media next to the source, are in `game/README.md`.

## Tests

Tests use Playwright. From `game/`:

```sh
npm install
npx playwright install chromium
node tests/v5_2_ready.mjs
node tests/v5_2_acceptance.mjs
node tests/v5_2_extra.mjs
```

Those three start their own local server. Other files in `game/tests/` do the same, each on its own port. These ones expect a server you already started on port 8091, and the bundle ones also expect `dist/` served on port 8093:

```sh
python3 -m http.server 8091 --bind 127.0.0.1
node tests/playtest_bot.mjs http://127.0.0.1:8091/ test-output/playtest
node e2e/run_v2.mjs http://127.0.0.1:8091/ test-output/e2e
```

`tests/playtest_bot.mjs` plays with the keyboard. `e2e/run_v2.mjs` walks states through the debug hook and records console errors. Screenshot output goes to `game/test-output/` and is not committed.

## Project structure

```
README.md                 this file
game/                     current Canvas2D source, tests, and tools
archive/v1-threejs/       v1, the Three.js prototype
archive/v1-site/          v1 page loader and its base64 payload
archive/page-shells/      older pixel page loaders kept from main
archive/deployment-snapshots/v5_2/   copy of the live v5.2 loader and service worker
archive/releases/         base64 source snapshots and release notes
```

`archive/README.md` says what each folder is, and what not to move on `gh-pages`. Older published trees are also kept as branches: `v1-pages-archive`, `v2-pages-archive`, `v3-pages-archive`, `v4-pages-archive`, and `v5-1-pages-archive`.

## How it was made

v1 was a 3D prototype written with Three.js. That code is in `archive/v1-threejs/`. From v2 onward the game is the Canvas2D pixel version in `game/`. The current source does not use Three.js, WebGL, or a CDN, and it does not `fetch` during play. The published page does download its media archive once; that download lives in the page loader, not in the game modules.

The work was AI-assisted. Ending cards credit Grok Bot and Cursor CLI agents for the code workflow. They credit OpenLux for images, 8-bit audio, and voice models; gpt-image for pixel sprites; and chiptune / sfx8 for sound effects. Art, voices, sound effects, and music were generated with AI tools. The cards also credit human direction to the student who made the course project.

## Credits

Playtesters: Zhang Xuyang, Zhang Chuhan, and Wang Kaiyuan.

GPT-Astra is inspired by the fan art "GPT娘·白龙" by ZipZipPipe.

## Parody

Real companies and real people appear only as parody. Their appearance is not an endorsement. The game does not use cloned voices. The title screen says the same thing: this is fiction and satire, and it does not use real portraits, trademarks, logos, or cloned voices.
