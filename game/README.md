# Game source

This folder is the current Canvas2D game (pixel v5.2, source snapshot `8c73474`). It is a normal source tree: HTML, JavaScript modules, styles, tests, and tools.

The project overview, controls, and credits are in the repository root `README.md`.

## Run this folder

From `game/`:

```sh
python3 -m http.server 8091 --bind 127.0.0.1
```

Open http://127.0.0.1:8091/ . The page loads `src/main.js` as an ES module. `file://` will not load those modules.

Images and audio are not stored in this branch. With no `assets/` directory the game still starts and draws procedural stand-ins. To use the same media as the live site, check out the `gh-pages` branch and unpack the v5.1 release parts (v5.2 reuses them):

```sh
node tools/unpack_pages_media.mjs /path/to/gh-pages/releases/pixel-v5-1-cb050f5-ea7cc902
```

That writes `assets/`, which is gitignored.

`node tools/build.mjs` writes a single-file `dist/` build. That folder is gitignored. Serve `dist/` over http, or open `dist/index.html` directly.

## Tests

```sh
npm install
npx playwright install chromium
node tests/v5_2_ready.mjs
```

Playwright is a dev dependency. Most files in `tests/` start their own static server. `tests/playtest_bot.mjs`, `e2e/run_v2.mjs`, and the bundle and visual tests expect a server that is already running (port 8091 in those files) and, for the bundle cases, a `dist/` build on port 8093. Screenshots go to `test-output/`, which is gitignored.

Version notes from development (`V2_STATUS.md` through `V5_2_STATUS.md`, `DESIGN.md`, `ARCHITECTURE.md`) are kept in this folder. Paths in those notes are from the original development checkout. The screenshot folders they name are not in this repository.
