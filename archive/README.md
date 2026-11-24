# Archive

These folders used to sit at the repository root. They are history. The game that is live on GitHub Pages is the `gh-pages` branch, served from the root of that branch. Nothing in this archive is what Pages serves today. Do not move or rename files on `gh-pages`; the page, service worker, and media parts use those paths.

## v1-threejs/

The first version of the game: a Three.js boss fight. The current game does not import it. `vendor/three` is not in this folder, so this copy does not run by itself.

## v1-site/

The old v1 page loader (`index.html`), its service worker (`sw.js`), and the base64 media parts it downloads (`payload/`). On `main` those files used to live in `pages/` and `payload/`. The same payload is also on `gh-pages`. The loader expects `css/` and `game.js` next to it. Those built files are on `gh-pages` and on the `v1-pages-archive` branch, not in this folder.

## page-shells/

Older pixel-version loaders and one service worker that used to live in `pages/` on `main`. They were written to be copied to the site root, next to a `releases/` directory. They are not the files Pages is serving now.

## deployment-snapshots/v5_2/

A copy of the v5.2 `index.html` and service worker that are published at the root of `gh-pages`. The live copies are the ones on that branch. This snapshot is here so the loader can be read without checking out `gh-pages`.

## releases/

Source snapshots for pixel v2 through v5.2, stored as base64 gzip tarballs, plus short release notes. The readable current source is `game/` at the repository root. It was extracted from `releases/pixel-v5-2-8c73474-ea7cc902/source-8c73474.tgz.b64`. The tarballs were left as stored. They still contain old development-machine paths inside the archive. Those paths are not used by the game.

The image and audio parts for each release are not in these folders. They are on the `gh-pages` branch, under `releases/<build>/part_XX.b64`. v5.2 reuses the v5.1 media directory.
