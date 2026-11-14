// OWNER: WS3
// Two unpicked chasers fight beside the player. Orbit, signature kits, a 65%
// dodge, 12 s redeploy, and bilingual speech. Combined DPS stays near 6/s.

import * as THREE from 'three';
import { EVENTS, TEAMS } from '../core/contracts.js';
import { applyHit } from '../core/combat.js';
import { NAMES } from '../data/lines.js';
import { loadTexture } from '../config/assets.js';
import {
  PLAYER,
  ALLY_REVIVE,
  ALLY_P3_HP_SCALE,
  ROSTER_IDS,
  ROLL,
  HITSTUN,
  HEAVY_HITSTUN,
  HEAVY_KNOCKBACK,
} from '../config/balance_player.js';
import {
  injectStyle,
  ensureLayer,
  makeBubble,
  hideBubble,
  wireSpeech,
  tickSpeech,
  presentBubbles,
} from './ally_speech.js';

const IDEAL = { deepseek: 2, kimi: 12, glm: 3 };
const POSES = ['idle', 'run', 'attack', 'roll', 'hurt', 'down', 'heal', 'skill'];
const DODGE_CHANCE = 0.65;

const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const upY = new THREE.Vector3(0, 1, 0);

/** @type {object[]} */
const fx = [];

function poseId(charId, pose) {
  return `spr.${charId}.back_${pose}`;
}

function preloadPoses(charId, color, accent) {
  /** @type {Record<string, THREE.Texture>} */
  const map = {};
  for (const pose of POSES) {
    map[pose] = loadTexture(poseId(charId, pose), (canvas, g) => {
      g.fillStyle = color;
      g.fillRect(canvas.width * 0.28, canvas.height * 0.12, canvas.width * 0.44, canvas.height * 0.78);
      g.fillStyle = accent;
      g.fillRect(canvas.width * 0.46, canvas.height * 0.22, canvas.width * 0.08, canvas.height * 0.5);
    });
  }
  return map;
}

function setPose(ally, pose) {
  const next = ally.poses[pose] ? pose : 'idle';
  if (ally.pose === next && ally.billboard?.pose === next) return;
  ally.pose = next;
  if (ally.billboard?.setPose) ally.billboard.setPose(next);
}

function distXZ(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function toward(from, to, out) {
  out.set(to.x - from.x, 0, to.z - from.z);
  if (out.lengthSq() < 1e-8) out.set(0, 0, 1);
  else out.normalize();
  return out;
}

function clampAlly(ctx, ally) {
  ctx.world.clamp?.(ally.position, ally.radius + 0.3);
}

function separateActors(ally, ctx) {
  const boss = ctx.boss;
  if (boss) {
    const min = ally.radius + (boss.radius || 0.6) + 0.28;
    const d = distXZ(ally.position, boss.position);
    if (d < min && d > 1e-4) {
      const s = min / d;
      ally.position.x = boss.position.x + (ally.position.x - boss.position.x) * s;
      ally.position.z = boss.position.z + (ally.position.z - boss.position.z) * s;
    }
  }
  const others = [ctx.player, ...(ctx.allies || [])];
  for (let i = 0; i < others.length; i += 1) {
    const o = others[i];
    if (!o || o === ally || o.alive === false) continue;
    const min = ally.radius + (o.radius || 0.5) + 0.35;
    const d = distXZ(ally.position, o.position);
    if (d >= min || d < 1e-4) continue;
    const push = (min - d) * 0.5;
    const nx = (ally.position.x - o.position.x) / d;
    const nz = (ally.position.z - o.position.z) / d;
    ally.position.x += nx * push;
    ally.position.z += nz * push;
  }
}

function refreshInvuln(ally) {
  const rollI = ally.rolling && ally.rollT >= ROLL.iframeStart && ally.rollT <= ROLL.iframeEnd;
  ally.invulnerable = rollI || ally.lungeT > 0;
}

function makeShield(color) {
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(0.85, 22), mat);
  mesh.visible = false;
  mesh.renderOrder = 4;
  return mesh;
}

function makeDisc(color, size) {
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(size * 0.5, 14), mat);
  mesh.renderOrder = 5;
  return mesh;
}

function spawnStar(ctx, ally, target) {
  const mesh = makeDisc(0xc5dcff, 0.28);
  mesh.position.copy(ally.position);
  mesh.position.y = 1.15;
  ctx.scene.add(mesh);
  toward(ally.position, target.position, tmpA);
  fx.push({
    kind: 'star',
    mesh,
    vx: tmpA.x * 16,
    vz: tmpA.z * 16,
    life: 1.4,
    dmg: 3.5,
    src: ally,
  });
  ctx.audio?.playSfx('sfx.star');
}

function spawnBeam(ctx, ally, target) {
  const mat = new THREE.MeshBasicMaterial({
    color: 0xb7e7ff,
    transparent: true,
    opacity: 0.82,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const glow = new THREE.MeshBasicMaterial({
    color: 0xd8b15a,
    transparent: true,
    opacity: 0.32,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1, 7, 1, true), mat);
  const halo = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1, 8, 1, true), glow);
  const group = new THREE.Group();
  group.add(core, halo);
  tmpA.copy(ally.position);
  tmpA.y = 1.25;
  tmpB.copy(target.position);
  tmpB.y = (target.height || 2) * 0.55;
  group.position.copy(tmpA).add(tmpB).multiplyScalar(0.5);
  tmpB.sub(tmpA);
  const L = tmpB.length() || 1;
  group.quaternion.setFromUnitVectors(upY, tmpB.normalize());
  group.scale.set(1, L, 1);
  ctx.scene.add(group);
  fx.push({ kind: 'beam', mesh: group, life: 0.38, src: ally });
  applyHit(ctx, ally, target, 10, { hitStopMs: 0 });
  ctx.audio?.playSfx('sfx.beam');
}

function spawnReviveLight(ctx, ally) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.55, 3.4, 12, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xd9f0ff,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  mesh.position.copy(ally.position);
  mesh.position.y = 1.7;
  ctx.scene.add(mesh);
  const ring = makeDisc(0xcfe8ff, 2.4);
  ring.rotation.x = -Math.PI / 2;
  ring.position.copy(ally.position);
  ring.position.y = 0.08;
  ctx.scene.add(ring);
  fx.push({ kind: 'revive', mesh, extra: ring, life: 1.15, src: ally });
  ctx.audio?.playSfx('sfx.heal');
}

function clearFx(item) {
  item.mesh?.removeFromParent();
  item.extra?.removeFromParent();
  item.mesh?.geometry?.dispose?.();
  item.extra?.geometry?.dispose?.();
  const mats = [];
  if (item.mesh?.material) mats.push(item.mesh.material);
  if (item.extra?.material) mats.push(item.extra.material);
  item.mesh?.traverse?.((c) => { if (c.material) mats.push(c.material); });
  for (const m of mats) {
    if (Array.isArray(m)) m.forEach((x) => x.dispose?.());
    else m.dispose?.();
  }
}

function tickFx(ctx, dt) {
  const boss = ctx.boss;
  for (let i = fx.length - 1; i >= 0; i -= 1) {
    const item = fx[i];
    item.life -= dt;
    if (item.kind === 'star') {
      item.mesh.position.x += item.vx * dt;
      item.mesh.position.z += item.vz * dt;
      item.mesh.position.y = 1.15 + Math.sin(item.life * 14) * 0.08;
      item.mesh.lookAt(ctx.camera.position);
      const cam = ctx.camera?.position;
      if (cam && item.mesh.position.distanceTo(cam) < 1.6) item.life = 0;
      if (boss && distXZ(item.mesh.position, boss.position) <= (boss.radius || 0.7) + 0.35) {
        applyHit(ctx, item.src, boss, item.dmg, { hitStopMs: 0 });
        item.life = 0;
      }
    } else if (item.kind === 'beam') {
      const k = Math.max(0, item.life / 0.38);
      item.mesh.children.forEach((ch, n) => {
        if (ch.material) ch.material.opacity = (n === 0 ? 0.82 : 0.32) * k;
      });
    } else if (item.kind === 'revive') {
      const k = Math.max(0, item.life / 1.15);
      if (item.mesh.material) item.mesh.material.opacity = 0.55 * k;
      if (item.extra?.material) item.extra.material.opacity = 0.7 * k;
      if (item.src) {
        item.mesh.position.x = item.src.position.x;
        item.mesh.position.z = item.src.position.z;
        item.extra.position.x = item.src.position.x;
        item.extra.position.z = item.src.position.z;
      }
    } else if (item.kind === 'charge') {
      if (item.src && boss) {
        tmpA.copy(item.src.position);
        tmpA.y = 1.25;
        tmpB.copy(boss.position);
        tmpB.y = (boss.height || 2) * 0.55;
        item.mesh.position.copy(tmpA).add(tmpB).multiplyScalar(0.5);
        tmpB.sub(tmpA);
        const L = tmpB.length() || 1;
        item.mesh.quaternion.setFromUnitVectors(upY, tmpB.normalize());
        item.mesh.scale.set(0.45 + (1 - item.life / 0.85) * 0.7, L, 0.45);
        if (item.mesh.material) {
          item.mesh.material.opacity = 0.18 + (1 - item.life / 0.85) * 0.35;
        }
      }
    }
    if (item.life <= 0) {
      clearFx(item);
      fx.splice(i, 1);
    }
  }
}

function spawnChargeLine(ctx, ally) {
  const mat = new THREE.MeshBasicMaterial({
    color: 0x9cc9f0,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1, 6, 1, true), mat);
  ctx.scene.add(mesh);
  fx.push({ kind: 'charge', mesh, life: 0.85, src: ally });
}

function beginRoll(ctx, ally, dirx, dirz) {
  ally.rolling = true;
  ally.rollT = 0;
  ally.guarding = false;
  ally.charging = false;
  ally.flurryLeft = 0;
  const len = Math.hypot(dirx, dirz) || 1;
  ally.rollDir.set(dirx / len, 0, dirz / len);
  setPose(ally, 'roll');
  ctx.bus.emit(EVENTS.ROLL_START, { id: ally.id });
  ctx.audio?.playSfx('sfx.roll');
  refreshInvuln(ally);
}

function considerDodge(ctx, ally) {
  if (!ally.alive || ally.rolling || ally.lungeT > 0) return;
  const list = ctx.world.telegraph?.active?.() || [];
  const live = new Set();
  for (let i = 0; i < list.length; i += 1) {
    const tg = list[i];
    live.add(tg.id);
    if (ally.seenTg.has(tg.id)) continue;
    if (!tg.contains || !tg.contains(ally.position)) continue;
    ally.seenTg.add(tg.id);
    if (Math.random() > DODGE_CHANCE) continue;
    let dx = ally.position.x - (tg.spec?.origin?.x ?? 0);
    let dz = ally.position.z - (tg.spec?.origin?.z ?? 0);
    if (tg.spec?.shape === 'fullscreen' && tg.spec.safeZones?.length) {
      let best = tg.spec.safeZones[0];
      let bestD = Infinity;
      for (const z of tg.spec.safeZones) {
        const d = Math.hypot(ally.position.x - z.x, ally.position.z - z.z);
        if (d < bestD) {
          bestD = d;
          best = z;
        }
      }
      dx = best.x - ally.position.x;
      dz = best.z - ally.position.z;
    }
    if (Math.hypot(dx, dz) < 0.05) {
      dx = ally.position.x;
      dz = ally.position.z;
    }
    beginRoll(ctx, ally, dx, dz);
    return;
  }
  for (const id of ally.seenTg) {
    if (!live.has(id)) ally.seenTg.delete(id);
  }
}

function glmShouldShield(ctx, ally) {
  if (ally.id !== 'glm' || !ally.alive || ally.rolling) return false;
  const list = ctx.world.telegraph?.active?.() || [];
  return list.length > 0;
}

function startDeepSeekFlurry(ctx, ally, boss) {
  toward(ally.position, boss.position, ally.lungeDir);
  ally.lungeT = 0.18;
  ally.flurryLeft = 4;
  ally.flurryT = 0.05;
  ally.atkCd = 3.05;
  setPose(ally, 'skill');
  ctx.audio?.playSfx('sfx.slash');
  ctx.bus.emit(EVENTS.SKILL_USED, { id: ally.id, name: 'expert_mix' });
  refreshInvuln(ally);
}

function tickDeepSeek(ctx, ally, dt, boss) {
  if (ally.lungeT > 0) {
    const speed = 5 / 0.18;
    ally.position.x += ally.lungeDir.x * speed * dt;
    ally.position.z += ally.lungeDir.z * speed * dt;
    ally.lungeT -= dt;
    if (ally.lungeT <= 0) ally.lungeT = 0;
  }
  if (ally.flurryLeft > 0) {
    ally.flurryT -= dt;
    if (ally.flurryT <= 0) {
      ally.flurryLeft -= 1;
      ally.flurryT = 0.11;
      setPose(ally, 'attack');
      if (boss && distXZ(ally.position, boss.position) <= 2.8 + (boss.radius || 0.6)) {
        applyHit(ctx, ally, boss, 2.2, { hitStopMs: 0 });
      }
    }
  }
}

function tickKimi(ctx, ally, dt, boss) {
  if (!boss) return;
  if (ally.charging) {
    ally.chargeT -= dt;
    setPose(ally, 'skill');
    if (ally.chargeT <= 0) {
      ally.charging = false;
      ally.skillCd = 9.2;
      spawnBeam(ctx, ally, boss);
      setPose(ally, 'attack');
    }
    return;
  }
  if (ally.atkCd > 0 || ally.rolling || ally.stun > 0) return;
  if (distXZ(ally.position, boss.position) > 18.5) return;
  ally.shotCount = (ally.shotCount || 0) + 1;
  if (ally.skillCd <= 0 && ally.shotCount % 4 === 0) {
    ally.charging = true;
    ally.chargeT = 0.85;
    spawnChargeLine(ctx, ally);
    ctx.audio?.playSfx('sfx.charge');
    ctx.bus.emit(EVENTS.SKILL_USED, { id: ally.id, name: 'beam' });
    return;
  }
  ally.atkCd = 1.45;
  setPose(ally, 'attack');
  spawnStar(ctx, ally, boss);
}

function tickGlm(ctx, ally, dt, boss) {
  const want = glmShouldShield(ctx, ally);
  if (want && !ally.guarding) {
    ally.guarding = true;
    ally.guardStart = ctx.time.elapsed;
    setPose(ally, 'skill');
    ctx.bus.emit(EVENTS.GUARD_START, { id: ally.id });
    ctx.audio?.playSfx('sfx.guard');
  } else if (!want && ally.guarding) {
    ally.guarding = false;
    ctx.bus.emit(EVENTS.GUARD_END, { id: ally.id });
  }
  if (ally.guarding) {
    setPose(ally, 'skill');
    return;
  }
  if (!boss || ally.atkCd > 0 || ally.rolling || ally.stun > 0) return;
  if (distXZ(ally.position, boss.position) > 2.9 + (boss.radius || 0.6)) return;
  ally.atkCd = 2.35;
  setPose(ally, 'attack');
  applyHit(ctx, ally, boss, 7, { hitStopMs: 0, heavy: true });
  ctx.audio?.playSfx('sfx.hammer');
}

function tickMove(ctx, ally, dt, boss) {
  if (ally.rolling) {
    ally.rollT += dt;
    const dist = ally.kit.rollDistance || 4.5;
    const speed = dist / ROLL.duration;
    ally.position.x += ally.rollDir.x * speed * dt;
    ally.position.z += ally.rollDir.z * speed * dt;
    setPose(ally, 'roll');
    refreshInvuln(ally);
    if (ally.rollT >= ROLL.duration) {
      ally.rolling = false;
      ally.invulnerable = false;
      ctx.bus.emit(EVENTS.ROLL_END, { id: ally.id });
    }
    return;
  }
  if (ally.stun > 0 || ally.lungeT > 0) return;

  const origin = boss ? boss.position : { x: 0, z: 0 };
  const ideal = IDEAL[ally.id] || 4;
  const omega = 3.1 / Math.max(2, ideal);
  ally.angle += dt * omega * (ally.id === 'kimi' ? 0.72 : 1);
  const tx = origin.x + Math.sin(ally.angle) * ideal;
  const tz = origin.z + Math.cos(ally.angle) * ideal;
  const dx = tx - ally.position.x;
  const dz = tz - ally.position.z;
  const gap = Math.hypot(dx, dz);
  const radial = boss ? Math.abs(distXZ(ally.position, boss.position) - ideal) : gap;
  const hurry = radial > 1.35;
  const speed = ally.kit.speed * (hurry ? 0.95 : 0.52);
  if (gap > 0.04) {
    const step = Math.min(gap, speed * dt);
    ally.position.x += (dx / gap) * step;
    ally.position.z += (dz / gap) * step;
    ally.moving = step > dt * 0.9;
  } else {
    ally.moving = false;
  }
}

function tickCombat(ctx, ally, dt, boss) {
  if (!boss || !boss.alive) return;
  if (ally.rolling || ally.stun > 0) return;
  if (ally.id === 'deepseek') {
    if (ally.flurryLeft > 0 || ally.lungeT > 0) {
      tickDeepSeek(ctx, ally, dt, boss);
      return;
    }
    tickDeepSeek(ctx, ally, dt, boss);
    if (ally.atkCd <= 0 && distXZ(ally.position, boss.position) <= 3.4) {
      startDeepSeekFlurry(ctx, ally, boss);
    }
  } else if (ally.id === 'kimi') {
    tickKimi(ctx, ally, dt, boss);
  } else {
    tickGlm(ctx, ally, dt, boss);
  }
}

function chooseVisualPose(ally) {
  if (!ally.alive) {
    setPose(ally, 'down');
    return;
  }
  if (ally.reviveGlow > 0) setPose(ally, 'heal');
  else if (ally.hurtT > 0) setPose(ally, 'hurt');
  else if (ally.rolling) setPose(ally, 'roll');
  else if (ally.guarding || ally.charging || ally.lungeT > 0) setPose(ally, 'skill');
  else if (ally.flurryLeft > 0 || ally.atkCd > (ally.id === 'kimi' ? 1.15 : ally.id === 'glm' ? 1.9 : 2.6)) {
    setPose(ally, 'attack');
  } else if (ally.moving) setPose(ally, 'run');
  else setPose(ally, 'idle');
}

function presentMesh(ctx, ally) {
  const mesh = ally.billboard?.mesh;
  if (!mesh) return;
  const t = ctx.time?.unscaled || 0;
  let squash = 1;
  let tilt = 0;
  if (!ally.alive) {
    squash = 1;
  } else if (ally.rolling) {
    squash = 0.58;
    tilt = ally.rollT * 7.5;
  } else if (ally.hurtT > 0) {
    squash = 0.9;
    tilt = Math.sin(ally.hurtT * 42) * 0.18;
  } else if (ally.lungeT > 0 || ally.flurryLeft > 0) {
    squash = 1.06;
    tilt = Math.sin(t * 28) * 0.1;
  } else if (ally.moving) {
    squash = 0.96 + Math.sin(t * 11 + ally.angle) * 0.035;
    tilt = 0.07;
  }
  mesh.scale.x *= 2 - squash;
  mesh.scale.y *= squash;
  mesh.rotateZ(tilt);
  if (ally.shield) {
    const on = ally.alive && ally.guarding;
    ally.shield.visible = on;
    if (on) {
      ally.shield.position.copy(ally.position);
      ally.shield.position.y = 1.05;
      ally.shield.lookAt(ctx.camera.position);
      ally.shield.material.opacity = 0.28 + 0.1 * Math.sin(t * 6);
    }
  }
}

function hurt(ctx, actor, info) {
  if (!actor.alive) return 0;
  if (actor.invulnerable && !info.ignoreInvuln) return 0;
  let amount = Number(info.dmg) || 0;
  if (amount <= 0) return 0;
  if (actor.guarding) {
    amount *= 0.2;
    ctx.audio?.playSfx('sfx.guard');
  }
  const before = actor.hp;
  actor.hp = Math.max(0, actor.hp - amount);
  const applied = before - actor.hp;
  if (applied > 0) {
    actor.hurtT = 0.28;
    if (!info.noStun) actor.stun = info.heavy ? HEAVY_HITSTUN : HITSTUN;
    if (info.heavy && !info.noKnockback && info.src?.position) {
      let kx = actor.position.x - info.src.position.x;
      let kz = actor.position.z - info.src.position.z;
      const kl = Math.hypot(kx, kz) || 1;
      actor.position.x += (kx / kl) * HEAVY_KNOCKBACK;
      actor.position.z += (kz / kl) * HEAVY_KNOCKBACK;
    }
    if (actor.billboard) actor.billboard.flash = Math.max(actor.billboard.flash || 0, 0.08);
    ctx.audio?.playSfx('sfx.hurt');
  }
  if (actor.hp <= 0) {
    actor.hp = 0;
    actor.alive = false;
    actor.invulnerable = false;
    actor.rolling = false;
    actor.guarding = false;
    actor.charging = false;
    actor.flurryLeft = 0;
    actor.lungeT = 0;
    actor.downT = ALLY_REVIVE;
    actor.speechT = 0;
    setPose(actor, 'down');
    ctx.bus.emit(EVENTS.ALLY_DOWN, { id: actor.id });
  }
  return applied;
}

function applyP3(ally, ctx) {
  if (ally.p3Scaled) return;
  if ((ctx.boss?.phase || 1) < 3) return;
  ally.p3Scaled = true;
  ally.maxHp *= ALLY_P3_HP_SCALE;
  ally.hp = Math.min(ally.hp, ally.maxHp);
}

export function init(ctx) {
  injectStyle();
  ensureLayer();
  wireSpeech(ctx);
}

export function despawn(ctx) {
  for (const ally of ctx.allies || []) {
    if (ally.billboard) ctx.world.sprites?.destroyBillboard(ally.billboard);
    ally.bubble?.remove();
    ally.shield?.removeFromParent();
  }
  while (fx.length) clearFx(fx.pop());
  ctx.allies = [];
}

export function spawn(ctx, playerId) {
  despawn(ctx);
  const chosen = String(playerId || '').toLowerCase();
  const ids = ROSTER_IDS.filter((id) => id !== chosen);
  const allies = ids.map((id, index) => {
    const kit = PLAYER[id];
    const ideal = IDEAL[id] || 4;
    const angle = index === 0 ? 2.35 : -2.15;
    const actor = {
      id,
      team: TEAMS.ALLY,
      kit,
      position: new THREE.Vector3(Math.sin(angle) * Math.max(ideal, 4), 0, Math.cos(angle) * Math.max(ideal, 4)),
      hp: kit.hp,
      maxHp: kit.hp,
      radius: kit.radius,
      height: kit.height,
      alive: true,
      invulnerable: false,
      sprite: null,
      billboard: null,
      angle,
      pose: 'idle',
      poses: preloadPoses(id, kit.color, kit.accent),
      atkCd: 0.7 + index * 0.35,
      skillCd: 2 + index,
      speechCd: 4 + index * 2.5,
      speechT: 0,
      speech: null,
      pendingTrigger: null,
      pendingT: 0,
      downT: 0,
      p3Scaled: false,
      bubble: null,
      rolling: false,
      rollT: 0,
      rollDir: new THREE.Vector3(0, 0, 1),
      lungeT: 0,
      lungeDir: new THREE.Vector3(0, 0, -1),
      flurryLeft: 0,
      flurryT: 0,
      charging: false,
      chargeT: 0,
      guarding: false,
      guardStart: 0,
      stun: 0,
      hurtT: 0,
      moving: false,
      seenTg: new Set(),
      shotCount: 0,
      reviveGlow: 0,
      shield: null,
      squash: 1,
      takeDamage(info) {
        return hurt(ctx, actor, info);
      },
    };
    actor.billboard = ctx.world.sprites.createBillboard({
      assetId: poseId(id, 'idle'),
      label: NAMES.players[id],
      color: kit.color,
      accent: kit.accent,
      height: kit.height,
      facing: 'back',
      owner: actor,
    });
    actor.bubble = makeBubble();
    if (id === 'glm') {
      actor.shield = makeShield(0xb48cff);
      ctx.scene.add(actor.shield);
    }
    applyP3(actor, ctx);
    return actor;
  });
  ctx.allies = allies;
}

function revive(ctx, ally) {
  ally.alive = true;
  ally.hp = ally.maxHp;
  ally.downT = 0;
  ally.stun = 0;
  ally.invulnerable = false;
  ally.reviveGlow = 0.7;
  setPose(ally, 'heal');
  spawnReviveLight(ctx, ally);
  ctx.bus.emit(EVENTS.ALLY_REVIVE, { id: ally.id });
}

export function update(ctx, dt) {
  const boss = ctx.boss;
  tickFx(ctx, dt);
  for (const ally of ctx.allies || []) {
    applyP3(ally, ctx);
    tickSpeech(ctx, ally, dt);
    if (ally.atkCd > 0) ally.atkCd -= dt;
    if (ally.skillCd > 0) ally.skillCd -= dt;
    if (ally.stun > 0) ally.stun -= dt;
    if (ally.hurtT > 0) ally.hurtT -= dt;
    if (ally.reviveGlow > 0) ally.reviveGlow -= dt;

    if (!ally.alive) {
      ally.downT -= dt;
      setPose(ally, 'down');
      if (ally.downT <= 0) revive(ctx, ally);
      continue;
    }

    considerDodge(ctx, ally);
    tickMove(ctx, ally, dt, boss);
    tickCombat(ctx, ally, dt, boss);
    refreshInvuln(ally);
    separateActors(ally, ctx);
    clampAlly(ctx, ally);
    chooseVisualPose(ally);
  }
}

export function present(ctx) {
  presentBubbles(ctx);
  for (const ally of ctx.allies || []) presentMesh(ctx, ally);
}

export function reset(ctx) {
  if (ctx.selectedChar) spawn(ctx, ctx.selectedChar);
  else despawn(ctx);
}
