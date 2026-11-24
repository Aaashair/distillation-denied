// OWNER: W5
// Release bundle. One IIFE (no import map). Canvas2D works from file:// and http.
// Copies css/ and only the asset files actually referenced by source + ASSET_PATHS.

import esbuild from 'esbuild';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GENERATED_ASSETS } from '../src/config/assets.generated.js';
import { ASSET_CONFIG, ASSET_PATHS, PIXEL_SPRITES } from '../src/config/assets.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

const html = `<!DOCTYPE html>
<html lang="zh-Hans">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DISTILLATION DENIED</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect fill='%23d8b15a' width='16' height='16'/%3E%3C/svg%3E" />
  <link rel="stylesheet" href="css/ui.css" />
  <link rel="stylesheet" href="css/theater.css" />
  <link rel="stylesheet" href="css/claude.css" />
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

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist') continue;
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function collectIds(text, into) {
  const re = /['"`]((?:px|pt|end|bgm|sfx|vo|spr|ui|icon|vid|bg|vfx|ill|v2)[A-Za-z0-9_./-]*)['"`]/g;
  let m;
  while ((m = re.exec(text))) into.add(m[1]);
  const pathRe = /assets\/[A-Za-z0-9_./-]+/g;
  while ((m = pathRe.exec(text))) into.add(m[0]);
}

function leafStrings(value, into) {
  if (!value) return;
  if (typeof value === 'string') {
    into.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) leafStrings(v, into);
    return;
  }
  if (typeof value === 'object') {
    for (const v of Object.values(value)) leafStrings(v, into);
  }
}

function copyReferenced() {
  const ids = new Set();
  for (const file of walk(path.join(root, 'src'))) {
    if (!/\.(js|css|html)$/.test(file)) continue;
    if (/\.generated\.js$/.test(file)) continue;
    collectIds(readFileSync(file, 'utf8'), ids);
  }
  for (const file of walk(path.join(root, 'css'))) {
    if (/\.css$/.test(file)) collectIds(readFileSync(file, 'utf8'), ids);
  }
  leafStrings(ASSET_CONFIG, ids);
  for (const spec of Object.values(PIXEL_SPRITES || {})) {
    if (spec && spec.src) ids.add(spec.src);
    if (spec && spec.v2) ids.add(spec.v2);
  }
  // Directors pick voices and beds from the generated tables at runtime.
  for (const id of Object.keys(ASSET_PATHS || {})) {
    if (/^v2_(vo|bgm|sfx|chip)/.test(id)) ids.add(id);
  }

  const rels = new Set();
  for (const id of ids) {
    if (typeof id !== 'string') continue;
    if (id.startsWith('assets/')) {
      rels.add(id);
      continue;
    }
    const p = ASSET_PATHS[id];
    if (p && typeof p === 'string' && p.startsWith('assets/')) rels.add(p);
  }
  // v1 files are copied only when a live id still resolves to them.
  void GENERATED_ASSETS;

  let copied = 0;
  let bytes = 0;
  for (const rel of rels) {
    const from = path.join(root, rel);
    if (!existsSync(from) || !statSync(from).isFile()) continue;
    const dest = path.join(dist, rel);
    mkdirSync(path.dirname(dest), { recursive: true });
    cpSync(from, dest);
    copied += 1;
    bytes += statSync(from).size;
  }
  console.log(`copied ${copied} referenced asset files (${(bytes / 1048576).toFixed(2)} MB)`);
  return bytes;
}

function dirSize(dir) {
  let n = 0;
  for (const file of walk(dir)) n += statSync(file).size;
  return n;
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
  legalComments: 'none',
  banner: { js: '/* DISTILLATION DENIED v2 — Canvas2D, no engine. */' },
  logLevel: 'info',
});

cpSync(path.join(root, 'css'), path.join(dist, 'css'), { recursive: true });
copyReferenced();
writeFileSync(path.join(dist, 'index.html'), html);
const total = dirSize(dist);
console.log(`built dist/index.html + dist/game.js  total ${(total / 1048576).toFixed(2)} MB`);
