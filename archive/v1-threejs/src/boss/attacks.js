// OWNER: WS2
// Boss kit from DESIGN §4. Telegraphs are the read; fill completion is the
// swing (or the projectile release). No attack id is repeated back to back.
//
// Content-policy silence — the player (WS1) should refuse skill / guard input
// while these are set. Boss only writes them; it does not read player.js.
//   ctx.flags.skillSilence           seconds remaining (0 = free)
//   ctx.flags.skillSilenceUntil      absolute ctx.time.elapsed deadline
//   ctx.flags.contentPolicySilence   true while skillSilence > 0
//   bus 'skill_silence'              { duration, until, zh, en }

import { EVENTS } from '../core/contracts.js';
import { applyHit } from '../core/combat.js';
import {
  ATTACKS,
  AGGRO_PLAYER,
  AGGRO_SWITCH_AFTER,
  AGGRO_SWITCH_CHANCE,
  JUDGMENT_FIRST,
  JUDGMENT_INTERVAL,
  PHASE_MOVE,
  PHASE_TEMPO,
  PHASE_VISUAL,
  REFUSAL_LINE,
  SILENCE_SEC,
  windupMul,
} from '../config/balance_boss.js';
import {
  clearFx,
  spawnRingHazard,
  spawnSlash,
  spawnSpeech,
  spawnVolley,
  tickFx,
} from './fx.js';

const BY_ID = Object.create(null);
for (const atk of ATTACKS) BY_ID[atk.id] = atk;

function dur(boss, seconds) {
  return Math.max(0.05, seconds * windupMul(boss));
}

function aimVector(boss) {
  const target = boss.target;
  if (!target || target.alive === false || !target.position) {
    const x = boss.aimX || 0;
    const z = boss.aimZ == null ? 1 : boss.aimZ;
    const len = Math.hypot(x, z) || 1;
    return { x: x / len, z: z / len };
  }
  const x = target.position.x - boss.position.x;
  const z = target.position.z - boss.position.z;
  const len = Math.hypot(x, z) || 1;
  return { x: x / len, z: z / len };
}

function rot(dir, ang) {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  return { x: dir.x * c - dir.z * s, z: dir.x * s + dir.z * c };
}

function fanDirs(dir, count, spread) {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0 : (i / (count - 1) - 0.5) * 2;
    out.push(rot(dir, t * spread));
  }
  return out;
}

function nearestAlly(ctx, boss) {
  let best = null;
  let bestD = Infinity;
  for (const ally of ctx.allies || []) {
    if (!ally || ally.alive === false || !ally.position) continue;
    const d = Math.hypot(ally.position.x - boss.position.x, ally.position.z - boss.position.z);
    if (d < bestD) {
      bestD = d;
      best = ally;
    }
  }
  return best;
}

function pickTarget(ctx, boss, roll) {
  const player = ctx.player && ctx.player.alive !== false ? ctx.player : null;
  const near = nearestAlly(ctx, boss);
  if (!roll) {
    if (boss.target && boss.target.alive !== false) return boss.target;
    return player || near || null;
  }
  if (!player && !near) return null;
  if (!player) return near;
  if (!near) return player;
  if (boss.target && boss.sameCount >= AGGRO_SWITCH_AFTER && Math.random() < AGGRO_SWITCH_CHANCE) {
    return boss.target === player ? near : player;
  }
  if (boss.target && boss.sameCount >= AGGRO_SWITCH_AFTER) return boss.target;
  return Math.random() < AGGRO_PLAYER ? player : near;
}

function commitTarget(boss, target) {
  if (!target) return;
  if (boss.target && boss.target.id === target.id) boss.sameCount = (boss.sameCount || 0) + 1;
  else boss.sameCount = 1;
  boss.target = target;
}

function separate(ctx, boss) {
  const actors = [ctx.player, ...(ctx.allies || [])];
  for (const actor of actors) {
    if (!actor || actor.alive === false || !actor.position) continue;
    let dx = boss.position.x - actor.position.x;
    let dz = boss.position.z - actor.position.z;
    const min = (boss.radius || 0.5) + (actor.radius || 0.4) + 0.2;
    const dist = Math.hypot(dx, dz);
    if (dist > 1e-4 && dist < min) {
      boss.position.x = actor.position.x + (dx / dist) * min;
      boss.position.z = actor.position.z + (dz / dist) * min;
    }
  }
}

function tickMove(ctx, boss, dt) {
  if (!boss.act) {
    const aim = aimVector(boss);
    boss.aimX = aim.x;
    boss.aimZ = aim.z;
  }
  const hoverTarget = boss.phase === 3 ? (PHASE_VISUAL[3].hover || 0) : 0;
  const ease = 1 - Math.exp(-2.3 * Math.max(0, dt));
  boss.hover = (boss.hover || 0) + (hoverTarget - (boss.hover || 0)) * ease;
  const bob = boss.phase === 3 ? Math.sin((ctx.time?.elapsed || 0) * 1.65) * 0.12 : 0;
  if (boss.lockHpAt25 || boss._ended) {
    boss.rooted = true;
    boss.visualLift = boss.hover + bob;
    return;
  }
  let hop = 0;
  const rooted = boss.rooted || boss.act || boss.phaseInvuln > 0;
  if (!rooted) {
    if (!boss.target || boss.target.alive === false) boss.target = pickTarget(ctx, boss, false);
    const target = boss.target;
    const move = PHASE_MOVE[boss.phase] || PHASE_MOVE[1];
    if (target && target.position) {
      let dx = target.position.x - boss.position.x;
      let dz = target.position.z - boss.position.z;
      const dist = Math.hypot(dx, dz) || 0.0001;
      dx /= dist;
      dz /= dist;
      const prefer = move.prefer + (boss.jitter || 0);
      if (boss.dashT > 0) {
        boss.position.x += (boss.dashX || 0) * move.dash * dt;
        boss.position.z += (boss.dashZ || 0) * move.dash * dt;
        const u = 1 - Math.max(0, boss.dashT) / Math.max(0.05, move.dashTime);
        hop = Math.sin(Math.min(1, Math.max(0, u)) * Math.PI) * 0.36;
        boss.dashT -= dt;
      } else if (dist > prefer + move.band) {
        if (move.dash > 0 && dist > move.dashAt && (boss.dashCd || 0) <= 0) {
          boss.dashT = move.dashTime;
          boss.dashCd = move.dashCd;
          boss.dashX = dx;
          boss.dashZ = dz;
        } else {
          boss.position.x += dx * move.speed * dt;
          boss.position.z += dz * move.speed * dt;
        }
      } else if (dist < Math.max(0.4, prefer - move.band)) {
        boss.position.x -= dx * move.speed * 0.8 * dt;
        boss.position.z -= dz * move.speed * 0.8 * dt;
      } else {
        boss.strafeT = (boss.strafeT || 0) + dt;
        if (boss.strafeT > 2.2) {
          boss.strafeT = 0;
          boss.strafe = -(boss.strafe || 1);
        }
        const side = boss.strafe || 1;
        boss.position.x += -dz * side * move.strafe * dt;
        boss.position.z += dx * side * move.strafe * dt;
        if (move.hop > 0) {
          boss.hopCd = (boss.hopCd || 0) - dt;
          if (boss.hopCd <= 0) {
            boss.hopLeft = 0.28;
            boss.hopCd = 0.92;
          }
        }
      }
      if ((boss.dashCd || 0) > 0) boss.dashCd -= dt;
    }
    if ((boss.hopLeft || 0) > 0) {
      const total = 0.28;
      const u = 1 - boss.hopLeft / total;
      hop = Math.max(hop, Math.sin(Math.min(1, Math.max(0, u)) * Math.PI) * (move.hop || 0));
      boss.hopLeft -= dt;
    }
    separate(ctx, boss);
    ctx.world.clamp?.(boss.position, 1.45);
  }
  boss.visualLift = (boss.hover || 0) + bob + hop;
}

function tickSilence(ctx, dt) {
  const flags = ctx.flags;
  if (!flags) return;
  if (flags.skillSilence > 0) {
    flags.skillSilence = Math.max(0, flags.skillSilence - dt);
  }
  flags.contentPolicySilence = flags.skillSilence > 0;
}

function applySilence(ctx, seconds) {
  if (!ctx.flags) ctx.flags = {};
  const duration = seconds || SILENCE_SEC;
  ctx.flags.skillSilence = duration;
  ctx.flags.skillSilenceUntil = (ctx.time?.elapsed || 0) + duration;
  ctx.flags.contentPolicySilence = true;
  ctx.bus?.emit(EVENTS.SKILL_SILENCE, {
    duration,
    until: ctx.flags.skillSilenceUntil,
    zh: REFUSAL_LINE.zh,
    en: REFUSAL_LINE.en,
  });
}

function strike(ctx, boss, tg, damage, heavy, sfxId, opts = {}) {
  const amount = damage * (boss.damageMul || 1);
  const attackId = opts.attackId
    || (boss.attackId ? `${boss.attackId}#${tg && tg.id ? tg.id : 'hit'}` : (tg && tg.id) || null);
  const targets = [ctx.player, ...(ctx.allies || [])];
  for (const actor of targets) {
    if (!actor || actor.alive === false) continue;
    if (!tg.contains(actor.position)) continue;
    applyHit(ctx, boss, actor, amount, {
      heavy: !!heavy,
      noStun: !!opts.noStun,
      hitStopMs: heavy ? 64 : 40,
      attackId,
    });
  }
  if (sfxId) ctx.audio?.playSfx(sfxId);
  if (opts.slash !== false) {
    const o = tg.spec?.origin || boss.position;
    spawnSlash(ctx, o.x, o.z, !!heavy);
  }
  boss.pose = opts.pose || 'attack';
  boss.poseHold = 0.26;
}

function spawnTg(ctx, boss, spec) {
  const api = ctx.world && ctx.world.telegraph;
  if (!api) return null;
  boss.pending = (boss.pending || 0) + 1;
  const user = spec.onResolve;
  spec.onResolve = (c, tg) => {
    boss.pending = Math.max(0, (boss.pending || 1) - 1);
    if (user) user(c, tg);
  };
  const handle = api.spawn(ctx, spec);
  if (boss.act) boss.act.holdTg = true;
  return handle;
}

function originOf(boss) {
  return { x: boss.position.x, z: boss.position.z };
}

function runStep(ctx, boss, act, step) {
  const dir = boss.atkDir || aimVector(boss);
  if (step.op === 'wait') {
    act.wait = step.t;
    return;
  }
  if (step.op === 'lunge') {
    act.lunge = { x: dir.x, z: dir.z, dist: step.dist, time: step.time, t: 0 };
    act.wait = step.time;
    return;
  }
  if (step.op === 'sector') {
    boss.pose = step.pose || 'windup';
    const aim = rot(dir, step.yaw || 0);
    spawnTg(ctx, boss, {
      shape: 'sector',
      origin: originOf(boss),
      direction: aim,
      radius: step.radius,
      arcDeg: step.arcDeg,
      duration: step.duration,
      attack: step.attack || act.id,
      feint: !!step.feint,
      silent: !!step.silent,
      onResolve(c, tg) {
        if (step.feint || !(step.damage > 0)) {
          boss.pose = 'windup';
          return;
        }
        strike(c, boss, tg, step.damage, step.heavy, step.sfx);
      },
    });
    return;
  }
  if (step.op === 'line') {
    boss.pose = step.pose || 'windup';
    spawnTg(ctx, boss, {
      shape: 'line',
      origin: originOf(boss),
      direction: dir,
      length: step.length,
      width: step.width,
      duration: step.duration,
      attack: act.id,
      onResolve(c, tg) {
        strike(c, boss, tg, step.damage, step.heavy, step.sfx);
      },
    });
    return;
  }
  if (step.op === 'circle') {
    boss.pose = step.pose || 'windup';
    spawnTg(ctx, boss, {
      shape: 'circle',
      origin: originOf(boss),
      radius: step.radius,
      duration: step.duration,
      attack: act.id,
      onResolve(c, tg) {
        strike(c, boss, tg, step.damage, step.heavy, step.sfx);
      },
    });
    return;
  }
  if (step.op === 'fan') {
    boss.pose = step.pose || 'cast';
    const dirs = fanDirs(dir, step.count, step.spread || 0);
    dirs.forEach((aim, index) => {
      spawnTg(ctx, boss, {
        shape: 'line',
        origin: originOf(boss),
        direction: aim,
        length: step.length,
        width: step.width,
        duration: step.duration,
        attack: act.id,
        silent: index > 0,
        onResolve() {},
      });
    });
    return;
  }
  if (step.op === 'volley') {
    boss.pose = 'cast';
    spawnVolley(ctx, boss, step.kind, {
      dir,
      count: step.count,
      spread: step.spread,
      speed: step.speed,
      damage: step.damage,
      range: step.range,
      homing: step.homing,
      width: step.width,
      length: step.length,
      heavy: !!step.heavy,
    });
    return;
  }
  if (step.op === 'runes') {
    boss.pose = 'cast';
    const spots = runeSpots(ctx);
    let voiced = false;
    for (const spot of spots) {
      spawnSpeech(spot.x, spot.z);
      spawnTg(ctx, boss, {
        shape: 'circle',
        origin: spot,
        radius: step.radius,
        duration: step.duration,
        attack: act.id,
        silent: voiced,
        onResolve(c, tg) {
          const player = c.player;
          if (player && player.alive !== false && tg.contains(player.position)) applySilence(c, step.silence);
          strike(c, boss, tg, step.damage, false, step.sfx, { slash: false, pose: 'cast' });
        },
      });
      voiced = true;
    }
    return;
  }
  if (step.op === 'ring') {
    boss.pose = 'cast';
    const at = originOf(boss);
    spawnTg(ctx, boss, {
      shape: 'ring',
      origin: at,
      innerRadius: step.inner,
      radius: step.outer,
      duration: step.duration,
      attack: act.id,
      onResolve(c) {
        spawnRingHazard(c, boss, at, {
          innerRadius: step.inner,
          radius: step.outer,
          damage: step.damage,
          life: step.life,
        });
        boss.pose = 'attack';
        boss.poseHold = 0.3;
        if (step.sfx) c.audio?.playSfx(step.sfx);
      },
    });
    return;
  }
  if (step.op === 'slam') {
    boss.pose = 'windup';
    const end = {
      x: boss.position.x + dir.x * step.length,
      z: boss.position.z + dir.z * step.length,
    };
    spawnTg(ctx, boss, {
      shape: 'line',
      origin: originOf(boss),
      direction: dir,
      length: step.length,
      width: step.width,
      duration: step.duration,
      attack: act.id,
      onResolve(c, tg) {
        strike(c, boss, tg, step.damage, true, step.sfx);
      },
    });
    spawnTg(ctx, boss, {
      shape: 'circle',
      origin: end,
      radius: step.splash,
      duration: step.duration,
      attack: act.id,
      silent: true,
      onResolve(c, tg) {
        strike(c, boss, tg, step.splashDamage, false, null, { noStun: true, slash: true });
      },
    });
    return;
  }
  if (step.op === 'smite') {
    boss.pose = 'cast';
    const zones = safeZones(ctx, step.safeCount || 3, step.safeRadius || 1.8);
    if (step.sfx) ctx.audio?.playSfx(step.sfx);
    spawnTg(ctx, boss, {
      shape: 'fullscreen',
      origin: { x: 0, z: 0 },
      duration: step.duration,
      attack: 'judgment',
      safeZones: zones,
      onResolve(c, tg) {
        strike(c, boss, tg, step.damage, true, 'sfx.heavy', { slash: false, pose: 'attack' });
        ctx.bus?.emit(EVENTS.CAMERA_SHAKE, { intensity: 0.28, duration: 0.35 });
      },
    });
  }
}

function runeSpots(ctx) {
  const bodies = [];
  if (ctx.player && ctx.player.alive !== false && ctx.player.position) bodies.push(ctx.player);
  for (const ally of ctx.allies || []) {
    if (ally && ally.alive !== false && ally.position) bodies.push(ally);
  }
  const spots = [];
  for (let i = 0; i < 3; i += 1) {
    const actor = bodies[i];
    if (actor) {
      spots.push({ x: actor.position.x, z: actor.position.z });
    } else {
      const src = bodies[0] ? bodies[0].position : { x: 0, z: 0 };
      const ang = (i / 3) * Math.PI * 2;
      spots.push({ x: src.x + Math.cos(ang) * 3.1, z: src.z + Math.sin(ang) * 3.1 });
    }
  }
  return spots;
}

function safeZones(ctx, count, radius) {
  const zones = [];
  const base = Math.random() * Math.PI * 2;
  const ring = 6.5;
  for (let i = 0; i < count; i += 1) {
    const a = base + (i / count) * Math.PI * 2;
    zones.push({ x: Math.cos(a) * ring, z: Math.sin(a) * ring, radius });
  }
  const player = ctx.player;
  if (player && player.position && zones.length) {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < zones.length; i += 1) {
      const d = Math.hypot(zones[i].x - player.position.x, zones[i].z - player.position.z);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    const px = player.position.x;
    const pz = player.position.z;
    const len = Math.hypot(px, pz) || 1;
    let x = px + (-pz / len) * 4.6;
    let z = pz + (px / len) * 4.6;
    const limit = (ctx.world?.radius || 20) - 3.1;
    const m = Math.hypot(x, z);
    if (m > limit && m > 0) {
      x *= limit / m;
      z *= limit / m;
    }
    zones[best] = { x, z, radius };
  }
  return zones;
}

function buildSteps(boss, atk) {
  const d = (t) => dur(boss, t);
  switch (atk.id) {
    case 'p1_combo': {
      const steps = [];
      const yaws = [-0.28, 0, 0.28];
      const hits = atk.hits || 3;
      for (let i = 0; i < hits; i += 1) {
        if (i) steps.push({ op: 'wait', t: atk.gap || 0.1 });
        steps.push({
          op: 'sector',
          arcDeg: atk.arcDeg,
          radius: atk.radius,
          duration: d(atk.duration),
          damage: atk.damage,
          heavy: false,
          sfx: atk.sfx,
          yaw: yaws[i] || 0,
          pose: 'windup',
        });
      }
      return steps;
    }
    case 'p1_thrust':
      return [
        {
          op: 'line', length: atk.length, width: atk.width, duration: d(atk.duration),
          damage: atk.damage, heavy: false, sfx: atk.sfx, pose: 'windup',
        },
        { op: 'lunge', dist: atk.lunge || 3.2, time: 0.16 },
      ];
    case 'p1_needles':
      return [
        {
          op: 'fan', count: atk.hits || 3, spread: atk.spread, length: atk.length,
          width: atk.width, duration: d(atk.duration), pose: 'cast',
        },
        {
          op: 'volley', kind: 'needle', count: atk.hits || 3, spread: atk.spread,
          speed: 30, damage: atk.damage, range: atk.length, width: 0.32, length: 1.15,
        },
      ];
    case 'p1_spin':
      return [{
        op: 'circle', radius: atk.radius, duration: d(atk.duration),
        damage: atk.damage, heavy: false, sfx: atk.sfx, pose: 'windup',
      }];
    case 'p2_waves':
      return [
        {
          op: 'fan', count: atk.hits || 3, spread: atk.spread, length: atk.length,
          width: atk.width, duration: d(atk.duration), pose: 'windup',
        },
        {
          op: 'volley', kind: 'wave', count: atk.hits || 3, spread: atk.spread,
          speed: 22, damage: atk.damage, range: atk.length, width: atk.width, length: 1.65,
        },
      ];
    case 'p2_runes':
      return [{
        op: 'runes', radius: atk.radius, duration: d(atk.duration),
        damage: atk.damage, silence: atk.silence, sfx: atk.sfx,
      }];
    case 'p2_sweep':
      return [{
        op: 'sector', arcDeg: atk.arcDeg, radius: atk.radius, duration: d(atk.duration),
        damage: atk.damage, heavy: true, sfx: atk.sfx, pose: 'windup',
      }];
    case 'p2_ring':
      return [{
        op: 'ring', inner: atk.innerRadius, outer: atk.radius, duration: d(atk.duration),
        damage: atk.damage, life: atk.life, sfx: atk.sfx,
      }];
    case 'p2_combo':
      return [
        {
          op: 'line', length: atk.length, width: atk.width, duration: d(atk.duration),
          damage: atk.damage, heavy: false, sfx: 'sfx.slash', pose: 'windup',
        },
        { op: 'lunge', dist: atk.lunge || 2.6, time: 0.14 },
        {
          op: 'sector', arcDeg: atk.arcDeg, radius: atk.radius, duration: d(atk.followDuration),
          damage: atk.followDamage, heavy: true, sfx: 'sfx.heavy', pose: 'windup',
        },
      ];
    case 'p3_delay':
      return [
        {
          op: 'sector', arcDeg: atk.arcDeg, radius: atk.radius, duration: d(atk.fake || 0.4),
          feint: true, damage: 0, pose: 'windup', attack: atk.id,
        },
        { op: 'wait', t: 0.14 },
        {
          op: 'sector', arcDeg: atk.arcDeg, radius: atk.radius, duration: d(atk.duration),
          damage: atk.damage, heavy: true, sfx: atk.sfx, pose: 'windup', attack: atk.id,
        },
      ];
    case 'p3_feathers':
      return [
        {
          op: 'fan', count: 6, spread: atk.spread, length: atk.length, width: atk.width,
          duration: d(atk.duration), pose: 'cast',
        },
        {
          op: 'volley', kind: 'feather', count: 6, spread: atk.spread, speed: 11.5,
          damage: atk.damage, range: atk.length, homing: 0.85, width: 0.4, length: 0.75,
        },
        { op: 'wait', t: 0.42 },
        {
          op: 'volley', kind: 'feather', count: 6, spread: atk.spread * 0.8, speed: 12.4,
          damage: atk.damage, range: atk.length, homing: 1.05, width: 0.4, length: 0.75,
        },
      ];
    case 'p3_slam':
      return [{
        op: 'slam', length: atk.length, width: atk.width, duration: d(atk.duration),
        damage: atk.damage, splash: atk.splash, splashDamage: atk.splashDamage, sfx: atk.sfx,
      }];
    case 'p3_smite':
      return [{
        op: 'smite', duration: d(atk.duration), damage: atk.damage,
        safeRadius: atk.safeRadius, safeCount: atk.safeCount, sfx: atk.sfx,
      }];
    default:
      return [];
  }
}

function begin(ctx, boss, atk) {
  const target = pickTarget(ctx, boss, true);
  commitTarget(boss, target);
  const aim = aimVector(boss);
  boss.aimX = aim.x;
  boss.aimZ = aim.z;
  boss.atkDir = aim;
  boss.attackId = atk.id;
  boss.lastAttack = atk.id;
  boss.rooted = true;
  boss.pending = 0;
  boss.act = {
    id: atk.id,
    recover: atk.recover ?? 0.5,
    steps: buildSteps(boss, atk),
    i: 0,
    wait: 0,
    holdTg: false,
    lunge: null,
  };
  ctx.bus.emit(EVENTS.BOSS_ATTACK, { name: atk.id, phase: boss.phase });
}

function finishAct(boss, act) {
  boss.act = null;
  boss.recover = act.recover;
  boss.rooted = true;
  if (boss.pose !== 'hurt') boss.pose = 'idle';
}

function tickAct(ctx, boss, dt) {
  const act = boss.act;
  if (!act) return;
  if (act.lunge && dt > 0) {
    const speed = act.lunge.dist / Math.max(0.05, act.lunge.time);
    boss.position.x += act.lunge.x * speed * dt;
    boss.position.z += act.lunge.z * speed * dt;
    const u = Math.min(1, act.lunge.t / act.lunge.time);
    boss.visualLift = (boss.hover || 0) + Math.sin(u * Math.PI) * 0.22;
    act.lunge.t += dt;
    ctx.world.clamp?.(boss.position, 1.45);
    if (act.lunge.t >= act.lunge.time) act.lunge = null;
  }
  if (act.wait > 0) {
    act.wait -= dt;
    return;
  }
  if (act.holdTg) {
    if ((boss.pending || 0) <= 0) act.holdTg = false;
    else return;
  }
  let guard = 0;
  while (boss.act === act && guard < 8) {
    guard += 1;
    if (act.wait > 0 || act.holdTg) return;
    const step = act.steps[act.i];
    if (!step) {
      finishAct(boss, act);
      return;
    }
    act.i += 1;
    runStep(ctx, boss, act, step);
  }
}

function pickAttack(boss) {
  const ratio = boss.maxHp > 0 ? boss.hp / boss.maxHp : 1;
  const eligible = (atk, ignoreLast) => {
    if (atk.phase !== boss.phase || atk.id === 'p3_smite') return false;
    if (!(atk.weight > 0)) return false;
    if (atk.unlock != null && ratio >= atk.unlock) return false;
    if (!ignoreLast && atk.id === boss.lastAttack) return false;
    return true;
  };
  let pool = ATTACKS.filter((atk) => eligible(atk, false));
  if (!pool.length) pool = ATTACKS.filter((atk) => eligible(atk, true));
  if (!pool.length) return null;
  let sum = 0;
  for (const atk of pool) sum += atk.weight;
  let roll = Math.random() * sum;
  for (const atk of pool) {
    roll -= atk.weight;
    if (roll <= 0) return atk;
  }
  return pool[pool.length - 1];
}

function maybeJudgment(ctx, boss) {
  if (boss.phase !== 3 || boss.lockHpAt25 || boss._ended || boss.phaseInvuln > 0) return false;
  const first = !boss.smiteCasts && boss.p3Clock >= JUDGMENT_FIRST;
  const later = boss.smiteCasts > 0 && boss.p3Clock >= (boss.nextSmite ?? Infinity);
  if (!first && !later) return false;
  const atk = BY_ID.p3_smite;
  if (!atk) return false;
  interrupt(ctx, boss);
  begin(ctx, boss, atk);
  boss.smiteCasts = (boss.smiteCasts || 0) + 1;
  boss.nextSmite = boss.p3Clock + JUDGMENT_INTERVAL;
  return true;
}

export function interrupt(ctx, boss) {
  clearFx();
  if (ctx.world?.telegraph) ctx.world.telegraph.reset(ctx);
  if (!boss) return;
  boss.act = null;
  boss.pending = 0;
  boss.rooted = false;
  boss.dashT = 0;
}

export function forceAttack(ctx, boss, id) {
  const atk = BY_ID[id];
  if (!boss || !atk || boss._ended || boss.lockHpAt25) return false;
  interrupt(ctx, boss);
  boss.phaseInvuln = 0;
  boss.invulnerable = false;
  boss.recover = 0;
  boss.tempo = 0;
  begin(ctx, boss, atk);
  return true;
}

export function tick(ctx, boss, dt) {
  if (boss.poseHold > 0) {
    boss.poseHold -= dt;
    if (boss.poseHold <= 0 && (boss.pose === 'attack' || boss.pose === 'cast')) {
      boss.pose = boss.act ? 'windup' : 'idle';
    }
  }
  if (boss.hurtT > 0) boss.hurtT = Math.max(0, boss.hurtT - dt);
  tickSilence(ctx, dt);
  tickMove(ctx, boss, dt);
  tickFx(ctx, boss, dt);
  if (boss.phase === 3 && !boss.lockHpAt25 && !boss._ended) {
    boss.p3Clock = (boss.p3Clock || 0) + dt;
  }
  if (boss.lockHpAt25 || boss._ended) {
    boss.pose = boss.hurtT > 0 ? 'hurt' : 'idle';
    boss.rooted = true;
    return;
  }
  if (boss.phaseInvuln > 0) {
    boss.pose = 'cast';
    boss.rooted = true;
    return;
  }
  if (maybeJudgment(ctx, boss)) {
    tickAct(ctx, boss, dt);
    return;
  }
  if (boss.act) {
    tickAct(ctx, boss, dt);
    return;
  }
  if (boss.recover > 0) {
    boss.recover -= dt;
    boss.rooted = true;
    if (boss.hurtT <= 0) boss.pose = 'idle';
    if (boss.recover <= 0) {
      boss.recover = 0;
      boss.tempo = PHASE_TEMPO[boss.phase] ?? 0.45;
      boss.rooted = false;
      boss.jitter = (Math.random() - 0.5) * 0.7;
    }
    return;
  }
  if (boss.tempo > 0) {
    boss.tempo -= dt;
    boss.rooted = false;
    if (boss.hurtT <= 0 && boss.pose !== 'windup') boss.pose = 'idle';
    return;
  }
  const atk = pickAttack(boss);
  if (!atk) return;
  begin(ctx, boss, atk);
  tickAct(ctx, boss, dt);
}

export function init() {}
export function update() {}
export function reset() {}
