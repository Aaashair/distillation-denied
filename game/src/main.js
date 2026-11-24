// OWNER: INTEGRATOR
// Boot, state machine, fixed-step loop, window.__debug.
//
// Update order (fixed 60 Hz, only while state is `intro` or `fight`;
// dt is already scaled and is skipped during hit-stop and pause):
//   1. player.update     — move, roll, flask, skill, primary
//   2. allies.update     — fight only
//   3. boss.update       — fight only (patterns, contact)
//   4. telegraph.update  — fight only
//   5. projectiles.update
//   6. room.update       — intro door / stele quip
//   7. sprites.update    — flash timers
//   8. tickFlags         — skill silence
// boss.tickReal(raw) runs once per frame so phase beats stay on the wall clock.
//
// Render order (once per rAF, into the 640×360 buffer, then integer blit):
//   room → telegraphs → shadows → actors+bullets (y-sort) → vfx.update/render → cutscene
// DOM after the blit: hud, dario, menus, theater, debug, audio.

import { BUILD_TAG, EVENTS, GAME_STATES } from './core/contracts.js';
import { createBus } from './core/bus.js';
import { createInput } from './core/input.js';
import { createTime } from './core/time.js';
import { createAudio } from './core/audio.js';
import { applyHit } from './core/combat.js';
import { ASSET_CONFIG, getAsset, getSprite, getVoiceLine, loadImage } from './config/assets.js';
import { ENDING_B_RATIO } from './config/balance.js';
import { ROSTER } from './actors/characters.js';
import * as pixel from './render/pixel.js';
import { applyScreen, applyWorld } from './render/world.js';
import * as room from './render/room.js';
import * as sprites from './render/sprites.js';
import * as vfx from './render/vfx.js';
import * as telegraph from './boss/telegraph.js';
import * as projectiles from './actors/projectiles.js';
import * as playerMod from './actors/player.js';
import * as alliesMod from './actors/allies.js';
import * as bossMod from './boss/boss.js';
import * as hud from './ui/hud.js';
import * as menus from './ui/menus.js';
import * as debugUi from './ui/debug.js';
import * as dario from './ui/dario.js';
import * as theater from './story/theater.js';
import * as cutscenes from './story/cutscenes.js';
import * as storyCg from './story/storyCg.js';
import * as claudeCombat from './ui/claude.js';
import * as skillReadyCue from './ui/skillReadyCue.js';

const SAVE_KEY = 'dd.endings.v1';

function loadEndings() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { A: !!parsed.A, B: !!parsed.B };
  } catch {
    return { A: false, B: false };
  }
}

const canvas = document.getElementById('view');
if (!canvas) throw new Error('Missing #view canvas');

const ctx = {
  bus: createBus(),
  input: createInput(canvas),
  audio: createAudio(),
  time: createTime(),
  assets: {
    get: getAsset,
    image: loadImage,
    config: ASSET_CONFIG,
    sprite: getSprite,
    voice: getVoiceLine,
  },
  player: null,
  boss: null,
  allies: [],
  stele: null,
  world: {},
  render: { pixel, sprites, vfx, room },
  projectiles,
  state: { current: null, previous: null, set: (next) => setState(next) },
  debug: {
    godMode: false,
    showHitboxes: false,
    playerDmgMul: 1,
    bossDmgMul: 1,
    allyDmgMul: 1,
    timeScale: 1,
    camDistance: 5.5,
    camHeight: 2.2,
    camSide: 0.9,
    camFov: 60,
  },
  selectedChar: null,
  lockOn: false,
  endingActive: null,
  distill: 0,
  endingDistill: 0,
  endingsUnlocked: loadEndings(),
  flags: {
    skillSilence: 0,
    skillSilenceUntil: 0,
    contentPolicySilence: false,
    inputLocked: false,
    // Player skill geometry draws in the buffer via playerMod.render. Do not
    // also paint it onto #view from a second animation frame.
    playerFxExternal: true,
  },
  truceUntil: 0,
  pauseFrom: null,
  theaterShot: null,
  cutscene: null,
  holo: null,
  introSeen: false,
  noIntro: false,
  startFight: (id) => beginFromSelect(id),
  retry: () => retry(),
  goTitle: () => goTitle(),
  finishIntro: () => finishIntro(),
  onCutsceneDone: (which) => onCutsceneDone(which),
};

let deathHold = 0;
let endingBusy = false;

function setState(next) {
  const from = ctx.state.current;
  if (from === next) return;
  ctx.state.previous = from;
  ctx.state.current = next;
  if (next === GAME_STATES.PAUSED) ctx.pauseFrom = from;
  // State-scoped full-screen CG styles must apply in the triggering frame.
  document.body.dataset.state = next || '';
  ctx.flags.phaseCgFreeze = false;
  if (next !== GAME_STATES.FIGHT) claudeCombat.clear(ctx);
  ctx.bus.emit(EVENTS.STATE_CHANGE, { from, to: next });
  if (next === GAME_STATES.PAUSED) ctx.bus.emit(EVENTS.PAUSE, { from });
  if (from === GAME_STATES.PAUSED && (next === GAME_STATES.FIGHT || next === GAME_STATES.INTRO)) {
    ctx.bus.emit(EVENTS.RESUME, {});
  }
  const locked = next === GAME_STATES.THEATER
    || next === GAME_STATES.PAUSED
    || next === GAME_STATES.BANNED
    || next === GAME_STATES.CREDITS
    || next === GAME_STATES.CUTSCENE;
  ctx.flags.inputLocked = locked;
  ctx.bus.emit(EVENTS.INPUT_LOCK, { locked, state: next });
}

function normalizeChar(id) {
  const key = String(id || '').toLowerCase();
  return ROSTER.includes(key) ? key : 'deepseek';
}

function unlockEnding(id) {
  ctx.endingsUnlocked[id] = true;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(ctx.endingsUnlocked)); } catch { /* ignore */ }
}

function clearSim() {
  projectiles.reset();
  telegraph.reset();
  vfx.reset();
  cutscenes.reset();
  ctx.truceUntil = 0;
  ctx.holo = null;
}

function startIntro(charId) {
  const id = normalizeChar(charId);
  ctx.selectedChar = id;
  ctx.endingActive = null;
  ctx.cutscene = null;
  deathHold = 0;
  pixel.setFilter('');
  ctx.time.setScale(ctx.debug.timeScale || 1);
  clearSim();
  alliesMod.despawn(ctx);
  bossMod.clearFight(ctx);
  setState(GAME_STATES.INTRO);
  playerMod.spawn(ctx, id, 'intro');
  room.spawnStele(ctx);
  ctx.bus.emit(EVENTS.SELECT_CONFIRM, { charId: id });
}

function startArena(charId) {
  const id = normalizeChar(charId || ctx.selectedChar);
  ctx.selectedChar = id;
  ctx.endingActive = null;
  ctx.introSeen = true;
  ctx.cutscene = null;
  deathHold = 0;
  pixel.setFilter('');
  ctx.flags.skillSilence = 0;
  ctx.flags.contentPolicySilence = false;
  ctx.flags.skillSilenceUntil = 0;
  ctx.time.reset();
  ctx.time.setScale(ctx.debug.timeScale || 1);
  clearSim();
  room.reset(ctx);
  setState(GAME_STATES.FIGHT);
  playerMod.spawn(ctx, id, 'arena');
  alliesMod.spawn(ctx, id);
  bossMod.spawn(ctx);
  ctx.bus.emit(EVENTS.FIGHT_START, { charId: id });
  ctx.bus.emit(EVENTS.SELECT_CONFIRM, { charId: id });
  ctx.bus.emit(EVENTS.FIGHT_RESET, { charId: id });
  ctx.distill = 0;
  ctx.bus.emit(EVENTS.DISTILL_PROGRESS, { value: 0 });
}

function beginFromSelect(charId) {
  if (!ctx.introSeen && !ctx.noIntro) startIntro(charId);
  else startArena(charId);
}

function finishIntro() {
  if (ctx.state.current !== GAME_STATES.INTRO) return;
  ctx.introSeen = true;
  startArena(ctx.selectedChar || 'deepseek');
}

function retry() {
  ctx.bus.emit(EVENTS.RETRY, {});
  startArena(ctx.selectedChar || 'deepseek');
}

function goTitle() {
  ctx.endingActive = null;
  ctx.cutscene = null;
  deathHold = 0;
  pixel.setFilter('');
  ctx.time.setScale(1);
  ctx.time.setPaused(false);
  clearSim();
  theater.reset(ctx);
  playerMod.despawn(ctx);
  alliesMod.despawn(ctx);
  bossMod.clearFight(ctx);
  room.reset(ctx);
  setState(GAME_STATES.TITLE);
}

function onCutsceneDone(which) {
  ctx.flags.inputLocked = false;
  ctx.time.setScale(ctx.debug.timeScale || 1);
  ctx.cutscene = null;
  setState(GAME_STATES.THEATER);
  theater.play(ctx, which === 'B' ? 'B' : 'A');
}

/** v4: endings route straight to full-screen theater CG (no in-engine cutscene). */
function enterEnding(which) {
  if (endingBusy) return;
  const id = which === 'B' ? 'B' : 'A';
  if (ctx.endingActive === id && ctx.state.current === GAME_STATES.THEATER) {
    return;
  }
  endingBusy = true;
  try {
    ctx.endingActive = id;
    unlockEnding(id);
    deathHold = 0;
    pixel.setFilter('');
    ctx.time.setScale(ctx.debug.timeScale || 1);
    cutscenes.reset();
    ctx.cutscene = null;
    ctx.flags.inputLocked = true;
    if (id === 'B' && ctx.boss) {
      ctx.boss.lockHpAt25 = true;
      ctx.boss._ended = true;
      ctx.boss.phase = 3;
      ctx.boss.cast = null;
      const floor = ctx.boss.maxHp * ENDING_B_RATIO;
      if (ctx.boss.hp < floor) ctx.boss.hp = floor;
      ctx.boss.r = 18;
      ctx.boss.sprite = 'px.boss.p3';
    }
    if (ctx.player) {
      ctx.player.pose = 'down';
      ctx.player.vx = 0;
      ctx.player.vy = 0;
    }
    ctx.endingDistill = ctx.distill || 0;
    projectiles.clear(ctx, null, { sparks: false });
    setState(GAME_STATES.THEATER);
    theater.play(ctx, id);
  } finally {
    endingBusy = false;
  }
}

function onPlayerDeath({ phase }) {
  if (ctx.endingActive) return;
  if (ctx.state.current !== GAME_STATES.FIGHT && ctx.state.current !== GAME_STATES.PAUSED) return;
  if (ctx.state.current === GAME_STATES.PAUSED) setState(GAME_STATES.FIGHT);
  const at = phase || ctx.boss?.phase || 1;
  if (at >= 3) ctx.bus.emit(EVENTS.ENDING_TRIGGER, { id: 'A' });
  else {
    deathHold = 0;
    pixel.setFilter('');
    ctx.time.setScale(ctx.debug.timeScale || 1);
    setState(GAME_STATES.BANNED);
  }
}

function ensureFight() {
  if (ctx.state.current === GAME_STATES.FIGHT && ctx.player && ctx.boss) return;
  if (ctx.state.current === GAME_STATES.INTRO) {
    finishIntro();
    return;
  }
  if (ctx.state.current === GAME_STATES.PAUSED) setState(GAME_STATES.FIGHT);
  if (!ctx.player || !ctx.boss || ctx.state.current !== GAME_STATES.FIGHT) {
    startArena(ctx.selectedChar || 'deepseek');
  }
}

function tickFlags(dt) {
  const f = ctx.flags;
  if (f.skillSilence > 0) {
    f.skillSilence -= dt;
    if (f.skillSilence <= 0) {
      f.skillSilence = 0;
      f.contentPolicySilence = false;
    }
  }
}

const api = {
  startFight(charId) { startArena(charId); },
  setPhase(n) {
    const phase = Math.max(1, Math.min(3, n | 0));
    if (ctx.state.current === GAME_STATES.THEATER || ctx.state.current === GAME_STATES.CUTSCENE) return;
    ensureFight();
    const boss = ctx.boss;
    if (!boss) return;
    const ratio = phase === 1 ? 1 : phase === 2 ? 0.69 : 0.35;
    boss._ended = false;
    boss.lockHpAt25 = false;
    boss.invuln = 0;
    boss.transition = 0;
    boss.cast = null;
    boss.hp = boss.maxHp * ratio;
    boss.commit({ debug: true, allowEnding: false });
    projectiles.clear(ctx, null, { sparks: false });
  },
  setBossHpRatio(r) {
    if (ctx.endingActive && (ctx.state.current === GAME_STATES.THEATER || ctx.state.current === GAME_STATES.CUTSCENE)) return;
    let ratio = Number(r);
    if (!Number.isFinite(ratio)) return;
    ratio = Math.max(0, Math.min(1, ratio));
    ensureFight();
    const boss = ctx.boss;
    if (!boss) return;
    boss._ended = false;
    boss.lockHpAt25 = false;
    boss.invuln = 0;
    boss.transition = 0;
    boss.cast = null;
    boss.hp = boss.maxHp * ratio;
    boss.commit({ debug: true, allowEnding: true });
  },
  killPlayer() {
    if (ctx.endingActive && (ctx.state.current === GAME_STATES.THEATER || ctx.state.current === GAME_STATES.CUTSCENE)) return;
    ensureFight();
    const player = ctx.player;
    if (!player) return;
    player.invuln = 0;
    player.alive = true;
    player.superarmor = 0;
    if (player.hp <= 0) player.hp = 1;
    applyHit(ctx, ctx.boss || 'boss', player, player.maxHp + 500, {
      ignoreInvuln: true,
      ignoreGod: true,
      hitStopMs: 0,
      heavy: true,
    });
  },
  triggerEnding(id) {
    const which = String(id || 'A').toUpperCase() === 'B' ? 'B' : 'A';
    if (ctx.state.current === GAME_STATES.INTRO) finishIntro();
    if (ctx.state.current !== GAME_STATES.FIGHT
      && ctx.state.current !== GAME_STATES.PAUSED
      && ctx.state.current !== GAME_STATES.THEATER
      && ctx.state.current !== GAME_STATES.CUTSCENE) {
      startArena(ctx.selectedChar || 'deepseek');
    } else if (ctx.state.current === GAME_STATES.PAUSED) {
      setState(GAME_STATES.FIGHT);
    }
    const boss = ctx.boss;
    if (boss) {
      boss.invuln = 0;
      boss.transition = 0;
      boss.cast = null;
      if (which === 'B') {
        boss.hp = boss.maxHp * ENDING_B_RATIO;
        boss.lockHpAt25 = true;
        boss._ended = true;
        boss.phase = 3;
        boss.sprite = 'px.boss.p3';
        ctx.distill = Math.min(90, (1 - ENDING_B_RATIO) / (1 - ENDING_B_RATIO) * 90);
      } else if (boss.phase < 3) {
        boss.hp = boss.maxHp * 0.35;
        boss._ended = false;
        boss.lockHpAt25 = false;
        boss.phase = 3;
        boss.sprite = 'px.boss.p3';
        ctx.distill = Math.min(90, (1 - 0.35) / 0.75 * 90);
      }
    }
    ctx.endingActive = null;
    ctx.bus.emit(EVENTS.ENDING_TRIGGER, { id: which });
  },
  setGod(on) {
    ctx.debug.godMode = !!on;
    ctx.bus.emit(EVENTS.GOD_MODE, { enabled: ctx.debug.godMode });
  },
  setTimeScale(scale) {
    ctx.time.setScale(scale);
    ctx.debug.timeScale = ctx.time.timeScale;
  },
  setDamageMul(which, value) {
    const n = Math.max(0, Number(value) || 0);
    if (which === 'player') ctx.debug.playerDmgMul = n;
    else if (which === 'boss') ctx.debug.bossDmgMul = n;
    else if (which === 'ally') ctx.debug.allyDmgMul = n;
  },
  skipIntro() {
    ctx.introSeen = true;
    ctx.noIntro = true;
    if (ctx.state.current === GAME_STATES.INTRO) finishIntro();
  },
  clearBullets() {
    projectiles.clear(ctx, null, { sparks: true });
  },
  state() {
    const boss = ctx.boss;
    const player = ctx.player;
    const counts = projectiles.counts();
    return {
      state: ctx.state.current,
      phase: boss ? boss.phase : null,
      bossHp: boss ? boss.hp : null,
      bossMaxHp: boss ? boss.maxHp : null,
      bossX: boss ? boss.x : null,
      bossY: boss ? boss.y : null,
      player: player ? {
        id: player.id,
        x: player.x,
        y: player.y,
        hp: player.hp,
        maxHp: player.maxHp,
        invuln: player.invuln || 0,
        rolling: !!player.rolling,
      } : null,
      allies: (ctx.allies || []).map((a) => ({
        id: a.id,
        x: a.x,
        y: a.y,
        hp: a.hp,
        maxHp: a.maxHp,
        alive: !!a.alive,
      })),
      bulletCount: { enemy: counts.enemy, player: counts.player },
      telegraphs: telegraph.snapshot(),
      flasks: player ? { selected: player.flaskId, cooldowns: { ...(player.gpuCooldowns || { rtx5090: 0, h200: 0, b200: 0 }) } } : null,
      distill: ctx.distill,
      theaterShot: ctx.theaterShot,
      cutscene: ctx.cutscene ? { id: ctx.cutscene.id, beat: ctx.cutscene.beat, t: ctx.cutscene.t } : null,
      endingsUnlocked: { A: !!ctx.endingsUnlocked.A, B: !!ctx.endingsUnlocked.B },
      build: BUILD_TAG,
      charId: ctx.selectedChar,
      godMode: !!ctx.debug.godMode,
      ending: ctx.endingActive,
    };
  },
};

function step(dt) {
  const fighting = ctx.state.current === GAME_STATES.FIGHT;
  playerMod.update(ctx, dt);
  if (ctx.state.current !== GAME_STATES.FIGHT && ctx.state.current !== GAME_STATES.INTRO) return;
  if (fighting) alliesMod.update(ctx, dt);
  if (ctx.state.current !== GAME_STATES.FIGHT && ctx.state.current !== GAME_STATES.INTRO) return;
  if (fighting) bossMod.update(ctx, dt);
  if (ctx.state.current !== GAME_STATES.FIGHT && ctx.state.current !== GAME_STATES.INTRO) return;
  if (fighting) telegraph.update(ctx, dt);
  projectiles.update(ctx, dt);
  room.update(ctx, dt);
  sprites.update(ctx, dt);
  tickFlags(dt);
}

function renderWorld() {
  const g = pixel.begin();
  room.render(ctx, g);
  telegraph.render(ctx, g);
  sprites.drawShadows(ctx, g);
  const items = [];
  sprites.collect(ctx, items, g);
  projectiles.collect(items);
  items.sort((a, b) => a.y - b.y);
  for (let i = 0; i < items.length; i += 1) items[i].draw(g);
  playerMod.render?.(ctx, g);
  alliesMod.render?.(ctx, g);
  vfx.render(ctx, g);
  // HUD (if it paints) is in buffer pixels. Cutscenes go back to room-local.
  applyScreen(g);
  skillReadyCue.render(ctx, g);
  applyWorld(g);
  if (ctx.state.current === GAME_STATES.CUTSCENE) cutscenes.render(ctx, g);
  pixel.present();
}

function frame(raw) {
  const sim = ctx.state.current === GAME_STATES.FIGHT || ctx.state.current === GAME_STATES.INTRO;
  const steps = ctx.time.consume(raw, { freeze: !sim });
  if (sim) {
    for (let i = 0; i < steps.length; i += 1) {
      if (ctx.state.current !== GAME_STATES.FIGHT && ctx.state.current !== GAME_STATES.INTRO) break;
      ctx.input.setEdgesOpen(i === 0);
      step(steps[i]);
    }
  }
  if (ctx.state.current === GAME_STATES.FIGHT) bossMod.tickReal(ctx, raw);
  storyCg.update(ctx, raw);
  if (ctx.state.current === GAME_STATES.CUTSCENE) cutscenes.update(ctx, raw);
  ctx.input.setEdgesOpen(true);
  vfx.update(ctx, raw);
  renderWorld();
  hud.update(ctx, raw);
  dario.update(ctx, raw);
  menus.update(ctx, raw);
  theater.update(ctx, raw);
  debugUi.update(ctx, raw);
  ctx.audio.update(ctx, raw);
  void deathHold;
  document.body.dataset.state = ctx.state.current || '';
  document.body.dataset.phase = ctx.boss ? String(ctx.boss.phase) : '';
  ctx.input.endFrame();
}

function readQuery() {
  const q = new URLSearchParams(location.search);
  const auto = (q.get('autostart') || '').toLowerCase();
  const phase = Number(q.get('phase'));
  return {
    autostart: ROSTER.includes(auto) ? auto : null,
    phase: phase >= 1 && phase <= 3 ? phase : 0,
    debug: q.get('debug') === '1',
    noIntro: q.get('nointro') === '1',
  };
}

function boot() {
  pixel.init(canvas);
  ctx.input.setMapper((x, y) => pixel.screenToInternal(x, y));
  room.init(ctx);
  vfx.init(ctx);
  sprites.init(ctx);
  telegraph.init(ctx);
  projectiles.init();
  playerMod.init(ctx);
  alliesMod.init(ctx);
  bossMod.init(ctx);
  hud.init(ctx);
  menus.init(ctx);
  debugUi.init(ctx);
  dario.init(ctx);
  ctx.audio.init(ctx);
  theater.init(ctx);
  cutscenes.init(ctx);
  storyCg.init(ctx);
  skillReadyCue.init(ctx);
  ctx.input.attach();

  ctx.bus.on(EVENTS.PLAYER_DEATH, onPlayerDeath);
  ctx.bus.on(EVENTS.ENDING_TRIGGER, ({ id }) => enterEnding(id === 'B' ? 'B' : 'A'));
  ctx.bus.on(EVENTS.THEATER_SHOT, ({ id }) => { ctx.theaterShot = id || null; });
  ctx.bus.on(EVENTS.THEATER_DONE, () => {
    ctx.theaterShot = null;
    // Theater shots A9 / B8 already roll credits and wait on PLAY AGAIN.
    // A second menus credits screen would repeat that. `credits` stays a
    // real state: menus still show it when something sets state to credits.
    if (ctx.state.current === GAME_STATES.THEATER) goTitle();
  });

  window.__game = ctx;
  window.__debug = api;
  window.ASSET_CONFIG = ASSET_CONFIG;

  const query = readQuery();
  ctx.noIntro = query.noIntro;
  if (query.noIntro) ctx.introSeen = true;
  if (query.autostart) {
    startArena(query.autostart);
    if (query.phase) api.setPhase(query.phase);
  } else {
    setState(GAME_STATES.TITLE);
  }
  if (query.debug) debugUi.setOpen(true);

  frame(0);
  let last = performance.now();
  function loop(now) {
    const raw = Math.min(0.1, Math.max(0, (now - last) / 1000));
    last = now;
    frame(raw);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

boot();
