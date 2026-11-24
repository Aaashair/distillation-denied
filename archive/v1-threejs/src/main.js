// OWNER: INTEGRATOR
// Boot, state machine, and the __debug bridge. Do not retarget states, events,
// or window.__debug from a feature branch. WS1 owns what happens inside the
// modules this file calls (player, camera, input); it does not own this wiring.
//
// Hardcore override: no story mode, no checkpoints.
// URL: ?autostart=deepseek&phase=3&debug=1

import * as THREE from 'three';
import { BUILD_TAG, EVENTS, GAME_STATES } from './core/contracts.js';
import { createBus } from './core/bus.js';
import { createInput } from './core/input.js';
import { createTime } from './core/time.js';
import { createAudio } from './core/audio.js';
import { applyHit } from './core/combat.js';
import { ASSET_CONFIG, getAsset, loadTexture } from './config/assets.js';
import { ENDING_B_RATIO } from './config/balance_boss.js';
import * as arena from './world/arena.js';
import * as cameraRig from './world/camera.js';
import * as vfx from './world/vfx.js';
import * as sprites from './world/sprites.js';
import * as telegraph from './world/telegraph.js';
import { ROSTER } from './actors/characters.js';
import * as playerMod from './actors/player.js';
import * as alliesMod from './actors/allies.js';
import * as bossMod from './boss/boss.js';
import * as hud from './ui/hud.js';
import * as menus from './ui/menus.js';
import * as debugUi from './ui/debug.js';
import * as dario from './ui/dario.js';
import * as theater from './story/theater.js';

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

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x9cc9f0, 1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 220);

const ctx = {
  scene,
  camera,
  renderer,
  bus: createBus(),
  input: createInput(canvas),
  audio: createAudio(),
  time: createTime(),
  assets: { get: getAsset, texture: loadTexture, config: ASSET_CONFIG },
  player: null,
  boss: null,
  allies: [],
  world: {},
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
  lockOn: true,
  endingActive: null,
  distill: 0,
  endingDistill: 0,
  endingsUnlocked: loadEndings(),
  startFight: (id) => startFight(id),
  retry: () => retry(),
  goTitle: () => goTitle(),
};

let enteringEnding = false;

function setState(next) {
  const from = ctx.state.current;
  if (from === next) return;
  ctx.state.previous = from;
  ctx.state.current = next;
  ctx.bus.emit(EVENTS.STATE_CHANGE, { from, to: next });
  if (next === GAME_STATES.PAUSED) ctx.bus.emit(EVENTS.PAUSE, { from });
  if (from === GAME_STATES.PAUSED && next === GAME_STATES.FIGHT) ctx.bus.emit(EVENTS.RESUME, {});
  const locked = next === GAME_STATES.THEATER
    || next === GAME_STATES.PAUSED
    || next === GAME_STATES.BANNED
    || next === GAME_STATES.CREDITS;
  ctx.bus.emit(EVENTS.INPUT_LOCK, { locked, state: next });
  if (next !== GAME_STATES.FIGHT && document.pointerLockElement === canvas) {
    document.exitPointerLock?.();
  }
}

function normalizeChar(id) {
  const key = String(id || '').toLowerCase();
  return ROSTER.includes(key) ? key : 'deepseek';
}

function unlockEnding(id) {
  ctx.endingsUnlocked[id] = true;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(ctx.endingsUnlocked)); } catch { /* ignore */ }
}

function startFight(charId) {
  const id = normalizeChar(charId || ctx.selectedChar);
  ctx.selectedChar = id;
  ctx.endingActive = null;
  ctx.lockOn = true;
  ctx.distill = 0;
  ctx.endingDistill = 0;
  ctx.time.reset();
  playerMod.spawn(ctx, id);
  alliesMod.spawn(ctx, id);
  bossMod.reset(ctx);
  telegraph.reset(ctx);
  vfx.reset(ctx);
  hud.reset(ctx);
  setState(GAME_STATES.FIGHT);
  ctx.bus.emit(EVENTS.FIGHT_START, { charId: id });
  ctx.bus.emit(EVENTS.SELECT_CONFIRM, { charId: id });
  ctx.bus.emit(EVENTS.FIGHT_RESET, { charId: id });
  ctx.bus.emit(EVENTS.DISTILL_PROGRESS, { value: 0 });
}

function retry() {
  ctx.bus.emit(EVENTS.RETRY, {});
  startFight(ctx.selectedChar || 'deepseek');
}

function goTitle() {
  ctx.endingActive = null;
  playerMod.despawn(ctx);
  alliesMod.despawn(ctx);
  bossMod.reset(ctx);
  telegraph.reset(ctx);
  vfx.reset(ctx);
  arena.reset(ctx);
  setState(GAME_STATES.TITLE);
}

function enterEnding(which, { emit = false } = {}) {
  if (enteringEnding) return;
  if (ctx.endingActive === which && ctx.state.current === GAME_STATES.THEATER) return;
  enteringEnding = true;
  try {
    ctx.endingActive = which;
    unlockEnding(which);
    if (which === 'B' && ctx.boss) {
      ctx.boss.lockHpAt25 = true;
      ctx.boss._ended = true;
      const floor = ctx.boss.maxHp * ENDING_B_RATIO;
      if (ctx.boss.hp < floor) ctx.boss.hp = floor;
    }
    ctx.endingDistill = ctx.distill || 0;
    if (emit) ctx.bus.emit(EVENTS.ENDING_TRIGGER, { id: which });
    setState(GAME_STATES.THEATER);
    vfx.reset(ctx);
    theater.play(ctx, which);
  } finally {
    enteringEnding = false;
  }
}

function onPlayerDeath({ phase }) {
  if (ctx.endingActive) return;
  if (ctx.state.current !== GAME_STATES.FIGHT && ctx.state.current !== GAME_STATES.PAUSED) return;
  ctx.audio.playSfx('sfx.death');
  const at = phase || ctx.boss?.phase || 1;
  if (at >= 3) enterEnding('A', { emit: true });
  else setState(GAME_STATES.BANNED);
}

function ensureFight() {
  if (ctx.state.current === GAME_STATES.FIGHT) return;
  if (ctx.state.current === GAME_STATES.PAUSED) {
    setState(GAME_STATES.FIGHT);
    return;
  }
  startFight(ctx.selectedChar || 'deepseek');
}

const api = {
  startFight(charId) { startFight(charId); },
  setPhase(n) {
    const phase = Math.max(1, Math.min(3, n | 0));
    if (ctx.state.current === GAME_STATES.THEATER) return;
    ensureFight();
    const boss = ctx.boss;
    if (!boss) return;
    const ratio = phase === 1 ? 1 : phase === 2 ? 0.69 : 0.35;
    boss._ended = false;
    boss.lockHpAt25 = false;
    boss.invulnerable = false;
    boss.phaseInvuln = 0;
    boss.hp = boss.maxHp * ratio;
    boss.commit({ noInvuln: true, allowEnding: false });
  },
  setBossHpRatio(r) {
    if (ctx.endingActive && ctx.state.current === GAME_STATES.THEATER) return;
    let ratio = Number(r);
    if (!Number.isFinite(ratio)) return;
    ratio = Math.max(0, Math.min(1, ratio));
    ensureFight();
    const boss = ctx.boss;
    if (!boss) return;
    boss._ended = false;
    boss.lockHpAt25 = false;
    boss.invulnerable = false;
    boss.phaseInvuln = 0;
    boss.hp = boss.maxHp * ratio;
    boss.commit({ noInvuln: true, allowEnding: true });
  },
  killPlayer() {
    if (ctx.endingActive && ctx.state.current === GAME_STATES.THEATER) return;
    ensureFight();
    const player = ctx.player;
    if (!player) return;
    player.invulnerable = false;
    player.alive = true;
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
    if (ctx.state.current !== GAME_STATES.FIGHT
      && ctx.state.current !== GAME_STATES.PAUSED
      && ctx.state.current !== GAME_STATES.THEATER) {
      startFight(ctx.selectedChar || 'deepseek');
    } else if (ctx.state.current === GAME_STATES.PAUSED) {
      setState(GAME_STATES.FIGHT);
    }
    const boss = ctx.boss;
    if (boss) {
      boss.invulnerable = false;
      boss.phaseInvuln = 0;
      if (which === 'B') {
        boss.hp = boss.maxHp * ENDING_B_RATIO;
        boss.lockHpAt25 = true;
        boss._ended = true;
        if (boss.phase !== 3) boss.setPhase(3, { noInvuln: true });
        ctx.distill = Math.min(92, (1 - ENDING_B_RATIO) * 120);
      } else if (boss.phase < 3) {
        boss.hp = boss.maxHp * 0.35;
        boss._ended = false;
        boss.lockHpAt25 = false;
        boss.setPhase(3, { noInvuln: true });
        ctx.distill = Math.min(92, (1 - 0.35) * 120);
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
  state() {
    const boss = ctx.boss;
    const player = ctx.player;
    return {
      state: ctx.state.current,
      previous: ctx.state.previous,
      charId: ctx.selectedChar,
      phase: boss ? boss.phase : null,
      bossHp: boss ? boss.hp : null,
      bossMaxHp: boss ? boss.maxHp : null,
      bossRatio: boss ? boss.hp / boss.maxHp : null,
      lockHpAt25: boss ? !!boss.lockHpAt25 : false,
      playerHp: player ? player.hp : null,
      playerMaxHp: player ? player.maxHp : null,
      playerAlive: player ? !!player.alive : false,
      allies: (ctx.allies || []).map((a) => ({ id: a.id, hp: a.hp, alive: a.alive })),
      godMode: !!ctx.debug.godMode,
      timeScale: ctx.time.timeScale,
      playerDmgMul: ctx.debug.playerDmgMul,
      bossDmgMul: ctx.debug.bossDmgMul,
      allyDmgMul: ctx.debug.allyDmgMul,
      lockOn: !!ctx.lockOn,
      ending: ctx.endingActive,
      endingsUnlocked: { ...ctx.endingsUnlocked },
      distill: ctx.distill,
      elapsed: ctx.time.elapsed,
      build: BUILD_TAG,
    };
  },
};

function stepFight(dt) {
  if (ctx.state.current !== GAME_STATES.FIGHT) return;
  playerMod.update(ctx, dt);
  if (ctx.state.current !== GAME_STATES.FIGHT) return;
  alliesMod.update(ctx, dt);
  if (ctx.state.current !== GAME_STATES.FIGHT) return;
  bossMod.update(ctx, dt);
  if (ctx.state.current !== GAME_STATES.FIGHT) return;
  telegraph.update(ctx, dt);
}

function resize() {
  const w = window.innerWidth || 1;
  const h = window.innerHeight || 1;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function frame(raw) {
  const fighting = ctx.state.current === GAME_STATES.FIGHT;
  const steps = ctx.time.consume(raw, { freeze: !fighting });
  if (fighting) {
    for (let i = 0; i < steps.length; i += 1) {
      ctx.input.setEdgesOpen(i === 0);
      stepFight(steps[i]);
    }
  }
  ctx.input.setEdgesOpen(true);
  const visualDt = ctx.time.hitStop > 0 ? 0 : raw * ctx.time.timeScale;
  cameraRig.update(ctx, visualDt);
  if (typeof arena.update === 'function') arena.update(ctx, visualDt);
  sprites.present(ctx, raw);
  if (bossMod.present) bossMod.present(ctx);
  alliesMod.present(ctx);
  vfx.present(ctx, raw);
  hud.update(ctx, raw);
  dario.update(ctx, raw);
  menus.update(ctx, raw);
  theater.update(ctx, raw);
  debugUi.update(ctx, raw);
  ctx.audio.update(ctx, raw);
  document.body.dataset.state = ctx.state.current || '';
  document.body.dataset.phase = ctx.boss ? String(ctx.boss.phase) : '';
  renderer.render(scene, camera);
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
  };
}

function boot() {
  arena.init(ctx);
  cameraRig.init(ctx);
  vfx.init(ctx);
  sprites.init(ctx);
  telegraph.init(ctx);
  playerMod.init(ctx);
  alliesMod.init(ctx);
  bossMod.init(ctx);
  hud.init(ctx);
  menus.init(ctx);
  debugUi.init(ctx);
  dario.init(ctx);
  ctx.audio.init(ctx);
  theater.init(ctx);
  ctx.input.attach();
  ctx.input.setPointerLock(() => ctx.state.current === GAME_STATES.FIGHT);

  ctx.bus.on(EVENTS.PLAYER_DEATH, onPlayerDeath);
  ctx.bus.on(EVENTS.ENDING_TRIGGER, ({ id }) => enterEnding(id === 'B' ? 'B' : 'A', { emit: false }));
  ctx.bus.on(EVENTS.THEATER_DONE, () => {
    if (ctx.state.current === GAME_STATES.THEATER) setState(GAME_STATES.CREDITS);
  });

  window.__game = ctx;
  window.__debug = api;

  const query = readQuery();
  if (query.autostart) {
    startFight(query.autostart);
    if (query.phase) api.setPhase(query.phase);
  } else {
    setState(GAME_STATES.TITLE);
  }
  if (query.debug) debugUi.setOpen(true);

  resize();
  window.addEventListener('resize', resize);
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
