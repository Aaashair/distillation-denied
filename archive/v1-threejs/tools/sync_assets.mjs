// OWNER: integrator (asset wiring)
// Reads ../assets/manifest.json (sibling of this repo), copies ONLY web-ready files
// (web/ WebP images, audio/ mp3 used by the game, voice/ mp3) into ./assets/, and writes
// src/config/assets.generated.js with:
//   - GENERATED_ASSETS: id -> relative path. Contains every raw manifest id as `m.<id>`
//     plus aliases for the stable ASSET_CONFIG ids used by the code (spr.*, icon.*, bg.*, end.*, bgm.*, sfx.*, vo.*).
//   - VOICE_LINES: voice/lines.json lines (id, speaker, event, zh, en, path).
// Run: node tools/sync_assets.mjs   (idempotent; safe if manifest missing)
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = path.resolve(root, '../assets');
const manifestPath = path.join(srcRoot, 'manifest.json');
const outRoot = path.join(root, 'assets');
const generatedPath = path.join(root, 'src/config/assets.generated.js');
const INCLUDE_VIDEO = process.argv.includes('--video');

if (!existsSync(manifestPath)) { console.log('no ../assets/manifest.json — unchanged'); process.exit(0); }
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const entries = manifest.assets || [];

// BGM actually used (keep the build small).
const BGM = { title: 'bgm_title_0', p1: 'bgm_boss_0', p2: 'bgm_boss_1', p3: 'bgm_boss_final_0', endA: 'bgm_ending_0', endB: 'bgm_ending_1' };
const usedBgm = new Set(Object.values(BGM));

const map = {};
let copied = 0;
function copy(rel) {
  const src = path.join(srcRoot, rel);
  if (!existsSync(src)) return null;
  const dest = path.join(outRoot, rel);
  mkdirSync(path.dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  copied++;
  return `assets/${rel}`;
}
for (const e of entries) {
  if (e.type === 'voice_design') continue;
  if (e.type === 'music' && !usedBgm.has(e.id)) continue;
  if (e.type === 'video' && !INCLUDE_VIDEO) continue;
  const rel = e.web || e.path;
  if (/\.png$/i.test(rel)) continue; // never ship raw PNGs
  const p = copy(rel);
  if (p) map[`m.${e.id}`] = p;
}
const M = (id) => map[`m.${id}`] || null;
const alias = (to, from) => { const p = M(from); if (p) map[to] = p; };

// Players (back 3/4 view) — design/portrait used on select cards.
for (const c of ['deepseek', 'kimi', 'glm']) {
  alias(`spr.${c}.front`, `${c}_design`);
  alias(`spr.${c}.portrait`, `${c}_portrait`);
  for (const pose of ['idle', 'run', 'attack', 'roll', 'hurt', 'down', 'heal', 'skill']) alias(`spr.${c}.back_${pose}`, `${c}_back_${pose}`);
}
// Boss (front view). Opus attack/cast frames are over-glowed: base silhouette = windup.
const BOSS = { 1: 'haiku', 2: 'sonnet', 3: 'opus' };
for (const [n, b] of Object.entries(BOSS)) {
  alias(`spr.boss.p${n}.front`, n === '3' ? 'opus_windup' : `${b}_idle`);
  alias(`spr.boss.p${n}.idle`, n === '3' ? 'opus_windup' : `${b}_idle`);
  alias(`spr.boss.p${n}.windup`, `${b}_windup`);
  alias(`spr.boss.p${n}.attack`, `${b}_attack`);
  alias(`spr.boss.p${n}.cast`, n === '3' ? 'opus_cast' : `${b}_windup`);
  alias(`spr.boss.p${n}.hurt`, `${b}_hurt`);
  alias(`spr.boss.p${n}.design`, `${b}_design`);
}
alias('spr.dario.holo', 'dario_holo'); alias('spr.dario.angry', 'dario_holo_angry'); alias('spr.dario.smug', 'dario_holo_smug');
alias('spr.dario.phone', 'dario_phone_silhouette');
alias('spr.astra.holo', 'astra_design'); alias('spr.astra.attack', 'astra_attack');
alias('spr.fable.design', 'fable_design'); alias('spr.fable.hand', 'fable_hand'); alias('spr.fable.handSlam', 'fable_hand_slam');
alias('spr.patron.silhouette', 'altman_silhouette');
alias('icon.rtx5090', 'gpu_rtx5090'); alias('icon.h200', 'gpu_h200'); alias('icon.b200', 'gpu_b200');
for (const i of ['attack', 'banned', 'distill', 'hp', 'lockon', 'roll', 'stamina', 'skill_deepseek', 'skill_glm', 'skill_kimi']) alias(`icon.${i}`, `icon_${i}`);
for (const u of ['banner', 'bar_frame', 'dialog', 'holo_panel', 'card_frame', 'stamp_banned', 'stamp_denied', 'title_logo']) alias(`ui.${u}`, `ui_${u}`);
alias('bg.title', 'keyart_title'); alias('bg.cover', 'keyart_cover');
alias('bg.sky', 'skybox_wrap'); alias('bg.skyFlat', 'skybox'); alias('bg.clouds', 'cloud_sea');
alias('bg.marble', 'floor_marble_tile'); alias('bg.emblem', 'floor_sigil'); alias('bg.pillar', 'pillar_marble_tile');
alias('bg.column', 'env_column'); alias('bg.stele', 'env_refusal_stele');
for (const v of ['heal', 'impact', 'slash', 'slash_gold', 'telegraph']) alias(`vfx.${v}`, `vfx_${v}`);
// Ending storyboards (3:2 — letterbox/crop to 16:9 in the theater).
alias('end.A2', 'endA_1_skytear'); alias('end.A3', 'endA_2_astra_rescue'); alias('end.A4', 'endA_3_retrieved');
alias('end.A5', 'endA_4_darkroom'); alias('end.A6', 'endA_5_silhouette');
alias('end.B1', 'endB_1_hand'); alias('end.B2', 'endB_2_fable_takes_opus'); alias('end.B4', 'endB_3_phonecall'); alias('end.B6', 'endB_4_dossier');
alias('vid.endA', 'vid_endA_rescue'); alias('vid.endB', 'vid_endB_hand'); alias('vid.title', 'vid_title_flythrough');
for (const [k, id] of Object.entries(BGM)) alias(`bgm.${k}`, id);
// SFX (files are >=0.8s; trim/fade in code via audio.playSfx options)
const SFX = { slash: 'slash', hitPlayer: 'hit_player', hitBoss: 'hit_boss', heavy: 'slash_heavy', roll: 'roll', guard: 'block',
  perfect: 'perfect_guard', star: 'star_bolt', charge: 'beam_charge', beam: 'beam_release', hammer: 'hammer', hurt: 'hit_player',
  death: 'death', telegraph: 'telegraph', glass: 'glass_shatter', fanStop: 'fan_spin_down', flask: 'gpu_insert', fan: 'gpu_fan_up',
  heal: 'gpu_fan_up', b200: 'b200_roar', ui: 'ui_click', banner: 'banner', stamp: 'stamp', tear: 'sky_tear', rain: 'rain_office',
  busy: 'phone_busy', heartbeat: 'heartbeat', slam: 'giant_hand', phase: 'phase_transition', smite: 'judgment', feathers: 'feathers' };
for (const [k, f] of Object.entries(SFX)) alias(`sfx.${k}`, `sfx_${f}`);
// Voice
let VOICE_LINES = [];
const linesPath = path.join(srcRoot, 'voice/lines.json');
if (existsSync(linesPath)) {
  const L = JSON.parse(readFileSync(linesPath, 'utf8'));
  VOICE_LINES = (L.lines || []).map((l) => ({ id: l.id, speaker: l.speaker, event: l.event, zh: l.zh, en: l.en, path: M(l.id) }));
  for (const l of VOICE_LINES) if (l.path) map[`vo.${l.id}`] = l.path;
}
const sorted = Object.fromEntries(Object.keys(map).sort().map((k) => [k, map[k]]));
writeFileSync(generatedPath,
  `/** Generated by tools/sync_assets.mjs from ../assets/manifest.json — do not hand-edit. */\n` +
  `export const GENERATED_ASSETS = ${JSON.stringify(sorted, null, 2)};\n\n` +
  `/** Voice lines (CN audio + EN subtitle). Look up by id or event. */\n` +
  `export const VOICE_LINES = ${JSON.stringify(VOICE_LINES, null, 2)};\n`);
console.log(`copied ${copied} files, ${Object.keys(sorted).length} ids, ${VOICE_LINES.length} voice lines`);
