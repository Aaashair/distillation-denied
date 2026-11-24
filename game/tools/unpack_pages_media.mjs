#!/usr/bin/env node
// Unpack the published media archive into game/assets/.
// The live site does this in the browser. This script is only for a local
// source checkout. It does not change files on the gh-pages branch.
//
// The parts are on gh-pages at:
//   releases/pixel-v5-1-cb050f5-ea7cc902/part_00.b64 ... part_16.b64
//
// From the game/ directory:
//   node tools/unpack_pages_media.mjs /path/to/that/release/directory

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const EXPECTED_SHA256 = 'ea7cc90228ca3fbdd7a2c68c3488e3f882c9fde2593ea005a76662d95a6ea113';
const PARTS = 17;

const srcDir = process.argv[2];
if (!srcDir) {
  console.error('Usage: node tools/unpack_pages_media.mjs <directory-with-part-b64-files>');
  process.exit(1);
}

const gameRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let text = '';
for (let i = 0; i < PARTS; i += 1) {
  const name = path.join(srcDir, `part_${String(i).padStart(2, '0')}.b64`);
  text += readFileSync(name, 'utf8');
}
text = text.replace(/\s+/g, '');
if (text.length % 4 !== 0) {
  console.error('payload length mismatch');
  process.exit(1);
}

const gzipBytes = Buffer.from(text, 'base64');
const sha = createHash('sha256').update(gzipBytes).digest('hex');
if (sha !== EXPECTED_SHA256) {
  console.error(`SHA-256 mismatch\n expected ${EXPECTED_SHA256}\n actual   ${sha}`);
  process.exit(1);
}

const tar = gunzipSync(gzipBytes);

function field(off, start, len) {
  let end = off + start;
  const stop = off + start + len;
  while (end < stop && tar[end]) end += 1;
  return tar.subarray(off + start, end).toString('utf8');
}

let off = 0;
let files = 0;
while (off + 512 <= tar.length) {
  if (tar[off] === 0) break;
  let name = field(off, 0, 100);
  const prefix = field(off, 345, 155);
  if (prefix) name = `${prefix}/${name}`;
  const size = parseInt(field(off, 124, 12).trim() || '0', 8);
  const type = String.fromCharCode(tar[off + 156] || 48);
  const dataStart = off + 512;
  name = name.replace(/^\.\//, '');
  if (type === '0' && name.startsWith('assets/') && !name.split('/').includes('..')) {
    const dest = path.join(gameRoot, name);
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, tar.subarray(dataStart, dataStart + size));
    files += 1;
  }
  off = dataStart + Math.ceil(size / 512) * 512;
}

console.log(`Unpacked ${files} files into ${path.join(gameRoot, 'assets')}`);
