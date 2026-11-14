// OWNER: WS2
// Moving hit meshes (needles, sword waves, feather bolts), the spinning
// constitution ring, refusal speech, phase shockwave, and a short slash flash.
// Damage goes through applyHit so guard, i-frames, and debug multipliers apply.

import * as THREE from 'three';
import { applyHit } from '../core/combat.js';
import { loadTexture } from '../config/assets.js';
import { REFUSAL_LINE } from '../config/balance_boss.js';

const projectiles = [];
const hazards = [];
const speeches = [];
const flashes = [];
const shocks = [];
let layer = null;
let slashTex = null;
let slashGold = null;
let waveMat = null;
let featherMat = null;
let needleMat = null;
let sfxRingAt = -999;

function tex(id) {
  try {
    return loadTexture(id);
  } catch {
    return null;
  }
}

function slashMaterials() {
  if (!slashTex) slashTex = tex('vfx.slash');
  if (!slashGold) slashGold = tex('vfx.slash_gold');
  if (!waveMat) {
    waveMat = new THREE.MeshBasicMaterial({
      map: slashGold || slashTex || null,
      color: 0xffe6b0,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
  }
  if (!featherMat) {
    featherMat = new THREE.MeshBasicMaterial({
      map: slashGold || null,
      color: 0xfff3c8,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
  }
  if (!needleMat) {
    needleMat = new THREE.MeshBasicMaterial({
      color: 0xffd27a,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      toneMapped: false,
    });
  }
}

function ensureLayer() {
  if (layer || typeof document === 'undefined') return layer;
  layer = document.createElement('div');
  layer.id = 'boss-speech';
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:5;';
  document.body.appendChild(layer);
  return layer;
}

function actorsOf(ctx) {
  return [ctx.player, ...(ctx.allies || [])].filter((a) => a && a.position);
}

function hitActors(ctx, boss, damage, heavy, test, opts = {}) {
  const amount = damage * (boss.damageMul || 1);
  const hit = [];
  for (const actor of actorsOf(ctx)) {
    if (actor.alive === false) continue;
    if (!test(actor)) continue;
    applyHit(ctx, boss, actor, amount, {
      heavy: !!heavy,
      noStun: !!opts.noStun,
      hitStopMs: heavy ? 64 : 36,
      attackId: opts.attackId || boss.attackId || null,
    });
    hit.push(actor);
  }
  return hit;
}

function addProjectile(ctx, spec) {
  slashMaterials();
  let mesh;
  if (spec.kind === 'needle') {
    const group = new THREE.Group();
    const vert = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.16), needleMat);
    vert.rotation.y = Math.PI / 2;
    vert.userData.ownGeo = true;
    const flat = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 1.15), needleMat);
    flat.rotation.x = Math.PI / 2;
    flat.userData.ownGeo = true;
    group.add(vert, flat);
    mesh = group;
  } else {
    const w = spec.kind === 'feather' ? 0.55 : 1.35;
    const h = spec.kind === 'feather' ? 0.9 : 1.55;
    const mat = spec.kind === 'feather' ? featherMat : waveMat;
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.userData.ownGeo = true;
  }
  mesh.frustumCulled = false;
  mesh.renderOrder = 4;
  ctx.scene.add(mesh);
  const speed = Math.hypot(spec.vx, spec.vz) || 1;
  projectiles.push({
    ...spec,
    mesh,
    speed,
    age: 0,
    hit: new Set(),
  });
}

export function spawnVolley(ctx, boss, kind, opts) {
  const dir = opts.dir || { x: boss.aimX || 0, z: boss.aimZ || 1 };
  const n = opts.count || 1;
  const spread = opts.spread || 0;
  const speed = opts.speed || 18;
  const y = (opts.y != null ? opts.y : (boss.height || 1.7) * 0.55) + (boss.visualLift || 0) * 0.25;
  for (let i = 0; i < n; i += 1) {
    const t = n === 1 ? 0 : (i / (n - 1) - 0.5) * 2;
    const ang = t * spread;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    const dx = dir.x * c - dir.z * s;
    const dz = dir.x * s + dir.z * c;
    addProjectile(ctx, {
      kind,
      x: boss.position.x + dx * 0.45,
      y,
      z: boss.position.z + dz * 0.45,
      vx: dx * speed,
      vz: dz * speed,
      life: (opts.range || 14) / speed,
      damage: opts.damage,
      heavy: !!opts.heavy,
      homing: opts.homing || 0,
      length: opts.length || (kind === 'needle' ? 1.15 : kind === 'feather' ? 0.7 : 1.7),
      width: opts.width || (kind === 'needle' ? 0.28 : kind === 'feather' ? 0.36 : 1.05),
      pierce: kind !== 'needle',
      attackId: `${boss.attackId || kind}#${shotSerial}`,
    });
    shotSerial += 1;
  }
  if (kind === 'feather') ctx.audio?.playSfx('sfx.feathers');
  else if (kind === 'needle') ctx.audio?.playSfx('sfx.slash');
}

export function spawnRingHazard(ctx, boss, origin, spec) {
  const inner = spec.innerRadius;
  const outer = spec.radius;
  const group = new THREE.Group();
  group.position.set(origin.x, 0.11, origin.z);
  const band = new THREE.Mesh(
    new THREE.RingGeometry(inner, outer, 48),
    new THREE.MeshBasicMaterial({
      color: 0xc4473a,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    }),
  );
  band.rotation.x = -Math.PI / 2;
  group.add(band);
  const blades = [];
  const mat = new THREE.MeshBasicMaterial({
    color: 0xf2c14e,
    transparent: true,
    opacity: 0.96,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const bladeGeo = new THREE.BufferGeometry();
  bladeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    0, 0.95, 0,
    0.2, 0.2, 0,
    0, -0.75, 0,
    -0.2, 0.2, 0,
  ]), 3));
  bladeGeo.setIndex([0, 1, 2, 0, 2, 3]);
  for (let i = 0; i < 3; i += 1) {
    const blade = new THREE.Mesh(i === 0 ? bladeGeo : bladeGeo.clone(), mat);
    blade.position.y = 0.85;
    group.add(blade);
    blades.push(blade);
  }
  ctx.scene.add(group);
  hazards.push({
    group,
    blades,
    band,
    inner,
    outer,
    life: spec.life || 6,
    age: 0,
    spin: Math.random() * Math.PI * 2,
    mid: (inner + outer) * 0.5,
    damage: spec.damage,
    cd: new Map(),
  });
}

export function spawnSpeech(x, z) {
  const root = ensureLayer();
  if (!root) return;
  const el = document.createElement('div');
  el.textContent = `${REFUSAL_LINE.zh} / ${REFUSAL_LINE.en}`;
  el.style.cssText = [
    'position:fixed',
    'transform:translate(-50%,-130%)',
    'max-width:240px',
    'padding:4px 8px',
    'background:rgba(16,14,12,0.82)',
    'border:1px solid rgba(216,177,90,0.85)',
    'color:#f4f1ea',
    'font:600 13px serif',
    'text-align:center',
    'pointer-events:none',
  ].join(';');
  root.appendChild(el);
  speeches.push({ el, x, z, y: 2.15, life: 1.7, max: 1.7 });
}

export function spawnShockwave(ctx, x, z) {
  const mesh = new THREE.Mesh(
    new THREE.RingGeometry(0.82, 1.08, 64),
    new THREE.MeshBasicMaterial({
      color: 0xf3d48a,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, 0.14, z);
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
  shocks.push({ mesh, age: 0, life: 0.62 });
}

export function spawnSlash(ctx, x, z, heavy) {
  slashMaterials();
  const mat = new THREE.MeshBasicMaterial({
    map: heavy ? (slashGold || slashTex) : (slashTex || slashGold),
    color: heavy ? 0xffe6b0 : 0xfff4e4,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(heavy ? 3.2 : 2.1, heavy ? 1.6 : 1.15), mat);
  mesh.position.set(x, 1.15, z);
  mesh.frustumCulled = false;
  ctx.scene.add(mesh);
  flashes.push({ mesh, mat, age: 0, life: 0.22 });
}

let shotSerial = 1;

function projectileHits(ctx, boss, p) {
  const sp = Math.hypot(p.vx, p.vz) || 1;
  const fx = p.vx / sp;
  const fz = p.vz / sp;
  for (const actor of actorsOf(ctx)) {
    if (actor.alive === false) continue;
    if (p.hit.has(actor.id)) continue;
    const dx = actor.position.x - p.x;
    const dz = actor.position.z - p.z;
    const along = dx * fx + dz * fz;
    const side = dx * -fz + dz * fx;
    const pad = (actor.radius || 0.4) * 0.45;
    if (along < -p.length * 0.5 || along > p.length * 0.55) continue;
    if (Math.abs(side) > p.width * 0.5 + pad) continue;
    p.hit.add(actor.id);
    const amount = p.damage * (boss.damageMul || 1);
    applyHit(ctx, boss, actor, amount, {
      heavy: p.heavy,
      hitStopMs: p.heavy ? 60 : 36,
      attackId: p.attackId || boss.attackId || null,
    });
    if (!p.pierce) {
      p.life = 0;
      break;
    }
  }
}

function steer(p, target, dt) {
  if (!p.homing || !target || target.alive === false) return;
  const dx = target.position.x - p.x;
  const dz = target.position.z - p.z;
  const dl = Math.hypot(dx, dz) || 1;
  const tx = dx / dl;
  const tz = dz / dl;
  const sp = Math.hypot(p.vx, p.vz) || 0.001;
  const cx = p.vx / sp;
  const cz = p.vz / sp;
  const dot = Math.max(-1, Math.min(1, cx * tx + cz * tz));
  const cross = cx * tz - cz * tx;
  const ang = Math.atan2(cross, dot);
  const step = Math.max(-p.homing * dt, Math.min(p.homing * dt, ang));
  const c = Math.cos(step);
  const s = Math.sin(step);
  p.vx = (cx * c - cz * s) * sp;
  p.vz = (cx * s + cz * c) * sp;
}

function presentProjectile(ctx, p) {
  const mesh = p.mesh;
  mesh.position.set(p.x, p.y, p.z);
  if (p.kind === 'needle') {
    mesh.rotation.y = Math.atan2(p.vx, p.vz);
  } else if (ctx.camera) {
    mesh.lookAt(ctx.camera.position.x, p.y, ctx.camera.position.z);
  }
}

function tickRing(ctx, boss, hazard, dt) {
  hazard.age += dt;
  hazard.spin += dt * (Math.PI * 2 / 2.15);
  hazard.blades.forEach((blade, i) => {
    const a = hazard.spin + (i / 3) * Math.PI * 2;
    blade.position.x = Math.cos(a) * hazard.mid;
    blade.position.z = Math.sin(a) * hazard.mid;
    blade.rotation.y = -a + Math.PI / 2;
    const pulse = 0.92 + 0.08 * Math.sin(hazard.age * 6 + i);
    blade.scale.setScalar(pulse);
  });
  if (hazard.band && hazard.band.material) {
    hazard.band.material.opacity = 0.16 + 0.08 * Math.sin(hazard.age * 5);
  }
  const half = 0.42;
  for (const actor of actorsOf(ctx)) {
    if (actor.alive === false) continue;
    const dx = actor.position.x - hazard.group.position.x;
    const dz = actor.position.z - hazard.group.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist < hazard.inner || dist > hazard.outer + (actor.radius || 0) * 0.2) continue;
    const ang = Math.atan2(dz, dx);
    let nearest = 99;
    for (let i = 0; i < 3; i += 1) {
      let d = ang - (hazard.spin + (i / 3) * Math.PI * 2);
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      nearest = Math.min(nearest, Math.abs(d));
    }
    if (nearest > half) continue;
    const ready = hazard.cd.get(actor.id) || 0;
    if (hazard.age < ready) continue;
    hazard.cd.set(actor.id, hazard.age + 0.48);
    hitActors(ctx, boss, hazard.damage, false, (a) => a === actor, {
      attackId: `${boss.attackId || 'p2_ring'}@${Math.floor(hazard.age / 0.48)}`,
    });
    if (ctx.time && ctx.time.elapsed - sfxRingAt > 0.28) {
      sfxRingAt = ctx.time.elapsed;
      ctx.audio?.playSfx('sfx.slash');
    }
  }
}

function removeMesh(mesh, disposeMat) {
  if (!mesh) return;
  mesh.removeFromParent();
  mesh.traverse((obj) => {
    if (obj.userData?.ownGeo && obj.geometry) obj.geometry.dispose();
    if (disposeMat && obj.material && obj.material.dispose) obj.material.dispose();
  });
}

export function clearFx() {
  for (const p of projectiles) removeMesh(p.mesh, false);
  projectiles.length = 0;
  for (const h of hazards) {
    h.group.removeFromParent();
    h.group.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material && obj.material.dispose && obj !== h.blades[0]) {
        /* shared blade material disposed once below */
      }
    });
    if (h.blades[0]?.material) h.blades[0].material.dispose();
    if (h.band?.material) h.band.material.dispose();
  }
  hazards.length = 0;
  for (const s of speeches) s.el.remove();
  speeches.length = 0;
  for (const f of flashes) {
    f.mesh.removeFromParent();
    f.mesh.geometry.dispose();
    f.mat.dispose();
  }
  flashes.length = 0;
  for (const s of shocks) {
    s.mesh.removeFromParent();
    s.mesh.geometry.dispose();
    s.mesh.material.dispose();
  }
  shocks.length = 0;
}

export function tickFx(ctx, boss, dt) {
  const step = dt > 0 ? dt : 0;
  const target = boss && boss.target;
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const p = projectiles[i];
    p.age += step;
    steer(p, target, step);
    p.x += p.vx * step;
    p.z += p.vz * step;
    if (boss) projectileHits(ctx, boss, p);
    presentProjectile(ctx, p);
    const maxR = (ctx.world?.radius || 20) + 2;
    if (p.age >= p.life || Math.hypot(p.x, p.z) > maxR) {
      removeMesh(p.mesh, false);
      projectiles.splice(i, 1);
    }
  }
  for (let i = hazards.length - 1; i >= 0; i -= 1) {
    const h = hazards[i];
    if (boss) tickRing(ctx, boss, h, step);
    if (h.age >= h.life) {
      h.group.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
      });
      if (h.blades[0]?.material) h.blades[0].material.dispose();
      if (h.band?.material) h.band.material.dispose();
      h.group.removeFromParent();
      hazards.splice(i, 1);
    }
  }
  for (let i = speeches.length - 1; i >= 0; i -= 1) {
    const s = speeches[i];
    s.life -= step;
    if (s.life <= 0) {
      s.el.remove();
      speeches.splice(i, 1);
    }
  }
  for (let i = flashes.length - 1; i >= 0; i -= 1) {
    const f = flashes[i];
    f.age += step;
    const k = 1 - f.age / f.life;
    f.mat.opacity = Math.max(0, k);
    f.mesh.scale.setScalar(1 + (1 - k) * 0.35);
    if (ctx.camera) f.mesh.lookAt(ctx.camera.position.x, f.mesh.position.y, ctx.camera.position.z);
    if (f.age >= f.life) {
      f.mesh.removeFromParent();
      f.mesh.geometry.dispose();
      f.mat.dispose();
      flashes.splice(i, 1);
    }
  }
  for (let i = shocks.length - 1; i >= 0; i -= 1) {
    const s = shocks[i];
    s.age += step;
    const k = s.age / s.life;
    const scale = 1 + k * 16;
    s.mesh.scale.set(scale, scale, scale);
    s.mesh.material.opacity = 0.85 * (1 - k);
    if (s.age >= s.life) {
      s.mesh.removeFromParent();
      s.mesh.geometry.dispose();
      s.mesh.material.dispose();
      shocks.splice(i, 1);
    }
  }
  if (boss) boss.fxCount = projectiles.length + hazards.length;
}

export function presentSpeech(ctx) {
  const show = ctx.state?.current === 'fight' || ctx.state?.current === 'paused';
  if (layer) layer.style.visibility = show ? 'visible' : 'hidden';
  if (!show || !ctx.camera || speeches.length === 0) return;
  const cam = ctx.camera;
  const v = presentSpeech._v || (presentSpeech._v = new THREE.Vector3());
  const w = window.innerWidth || 1;
  const h = window.innerHeight || 1;
  for (const s of speeches) {
    v.set(s.x, s.y, s.z);
    v.project(cam);
    if (v.z > 1) {
      s.el.style.opacity = '0';
      continue;
    }
    s.el.style.opacity = String(Math.max(0, Math.min(1, s.life / 0.35)));
    s.el.style.left = `${(v.x * 0.5 + 0.5) * w}px`;
    s.el.style.top = `${(-v.y * 0.5 + 0.5) * h}px`;
  }
}

export function fxActive() {
  return { projectiles: projectiles.length, hazards: hazards.length, speeches: speeches.length };
}
