// OWNER: WS4
// Release bundle. One IIFE, no import map, no vendor file in dist.
// Copies css/ + assets/{web,audio,voice,video} only.

import esbuild from 'esbuild';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

const html = `<!DOCTYPE html>
<html lang="zh-Hans">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>蒸馏圣堂 DISTILLATION DENIED</title>
  <link rel="stylesheet" href="css/ui.css" />
  <link rel="stylesheet" href="css/theater.css" />
</head>
<body>
  <canvas id="view"></canvas>
  <div id="ui-root"></div>
  <noscript>
    <p>需要启用 JavaScript。 / JavaScript is required.</p>
  </noscript>
  <script src="game.js"></script>
</body>
</html>
`;

function copyAssetSubset() {
  const srcAssets = path.join(root, 'assets');
  if (!existsSync(srcAssets)) return;
  const dstAssets = path.join(dist, 'assets');
  mkdirSync(dstAssets, { recursive: true });
  for (const sub of ['web', 'audio', 'voice', 'video']) {
    const from = path.join(srcAssets, sub);
    if (existsSync(from)) {
      cpSync(from, path.join(dstAssets, sub), { recursive: true });
    }
  }
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

await esbuild.build({
  absWorkingDir: root,
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  outfile: 'dist/game.js',
  platform: 'browser',
  target: 'es2020',
  minify: false,
  legalComments: 'inline',
  alias: {
    three: path.join(root, 'vendor/three.module.js'),
  },
  banner: {
    js: '/* DISTILLATION DENIED — file:// bundle. Three.js r170 is vendored inside this file. */',
  },
  logLevel: 'info',
});

cpSync(path.join(root, 'css'), path.join(dist, 'css'), { recursive: true });
copyAssetSubset();
writeFileSync(path.join(dist, 'index.html'), html);
console.log('built dist/index.html + dist/game.js (vendor not copied; assets subset only)');

// ---- Standalone (double-click / file://) variant -------------------------------------------
// Chrome treats file:// images as cross-origin for WebGL, so textures fail to upload.
// dist-standalone/ inlines every image under assets/web as a data: URI in assets_inline.js
// (window.__INLINE_ASSETS[path] = dataURI), loaded before game.js; getAsset() prefers it.
const standalone = path.join(root, 'dist-standalone');
rmSync(standalone, { recursive: true, force: true });
cpSync(dist, standalone, { recursive: true });
rmSync(path.join(standalone, 'assets', 'web'), { recursive: true, force: true });
const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
const inline = {};
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const f = path.join(dir, name);
    if (statSync(f).isDirectory()) walk(f);
    else {
      const mime = MIME[path.extname(name).toLowerCase()];
      if (!mime) continue;
      const rel = path.relative(root, f).split(path.sep).join('/');
      inline[rel] = `data:${mime};base64,${readFileSync(f).toString('base64')}`;
    }
  }
}
if (existsSync(path.join(root, 'assets', 'web'))) walk(path.join(root, 'assets', 'web'));
writeFileSync(path.join(standalone, 'assets_inline.js'), `window.__INLINE_ASSETS=${JSON.stringify(inline)};\n`);
writeFileSync(path.join(standalone, 'index.html'), html.replace('<script src="game.js"></script>', '<script src="assets_inline.js"></script>\n  <script src="game.js"></script>'));
console.log(`built dist-standalone/ (${Object.keys(inline).length} images inlined) — double-click dist-standalone/index.html`);
