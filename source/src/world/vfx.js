// OWNER: WS1
// Hit feedback for every applied hit: floating numbers, pooled sparks,
// an impact card, a slash arc, and the matching sfx. Also heals, star bolts,
// and the Kimi beam. Gameplay motion runs in sim() (fixed step, frozen in
// hit-stop). present() faces the cards to the camera and ticks DOM numbers.

import * as THREE from 'three';
import { EVENTS, TEAMS } from '../core/contracts.js';
import { applyHit } from '../core/combat.js';
import { loadTexture } from '../config/assets.js';

const floaters = [];
const slashes = [];
const impacts = [];
const heals = [];
const bolts = [];
const beams = [];
const particles = [];
const rings = [];

const MAX_PARTICLES = 80;
const PARTICLE_POS = new Float32Array(MAX_PARTICLES * 3);
const PARTICLE_COL = new Float32Array(MAX_PARTICLES * 3);

let layer = null;
let pointMesh = null;
let pointGeo = null;
let softTex = null;
let starTex = null;
let beamTex = null;
let chargeMesh = null;
let chargeState = { on: false, x: 0, z: 0, ratio: 0 };
let wired = false;

function ensureLayer() {
  if (layer) return layer;
  layer = document.createElement('div');
  layer.id = 'dmg-layer';
  document.body.appendChild(layer);
  return layer;
}

function canvasTex(draw) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const g = canvas.getContext('2d');
  if (g) draw(g, canvas);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function softCircle() {
  if (softTex) return softTex;
  softTex = canvasTex((g) => {
    const grd = g.createRadialGradient(64, 64, 4, 64, 64, 60);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.35, 'rgba(255,255,255,0.75)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
  });
  return softTex;
}

function starCanvas() {
  if (starTex) return starTex;
  starTex = canvasTex((g) => {
    g.translate(64, 64);
    g.fillStyle = '#ffffff';
    g.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const r = i % 2 === 0 ? 58 : 16;
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.fill();
  });
  return starTex;
}

function beamCanvas() {
  if (beamTex) return beamTex;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 256;
  const g = canvas.getContext('2d');
  if (g) {
    const grd = g.createLinearGradient(0, 0, 64, 0);
    grd.addColorStop(0, 'rgba(180,220,255,0)');
    grd.addColorStop(0.5, 'rgba(255,255,255,0.95)');
    grd.addColorStop(1, 'rgba(180,220,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 256);
  }
  beamTex = new THREE.CanvasTexture(canvas);
  beamTex.colorSpace = THREE.SRGBColorSpace;
  beamTex.needsUpdate = true;
  return beamTex;
}

function addPlane(ctx, map, pool, blending) {
  const mat = new THREE.MeshBasicMaterial({
    map,
    transparent: true,
    depthWrite: false,
    blending: blending || THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
    opacity: 0,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  mesh.visible = false;
  mesh.frustumCulled = false;
  mesh.renderOrder = 28;
  ctx.scene.add(mesh);
  const slot = { mesh, mat, life: 0, max: 0.2, spin: 0, gold: false, scale: 1, y: 1, flat: false };
  pool.push(slot);
  return slot;
}

function take(pool) {
  for (const slot of pool) if (slot.life <= 0) return slot;
  return pool[0] || null;
}

function orientCard(mesh, cam, spin) {
  const dx = cam.position.x - mesh.position.x;
  const dz = cam.position.z - mesh.position.z;
  mesh.rotation.set(0, Math.atan2(dx, dz), spin || 0);
}

function project(ctx, position, lift) {
  const v = position.clone();
  v.y += lift;
  v.project(ctx.camera);
  if (v.z > 1) return null;
  const w = ctx.renderer?.domElement?.clientWidth || window.innerWidth;
  const h = ctx.renderer?.domElement?.clientHeight || window.innerHeight;
  return {
    x: (v.x * 0.5 + 0.5) * w,
    y: (-v.y * 0.5 + 0.5) * h,
  };
}

function spawnFloater(ctx, event) {
  if (!event || !event.applied || !event.dst?.position) return;
  const at = project(ctx, event.dst.position, 1.7);
  if (!at) return;
  const el = document.createElement('div');
  el.className = 'dmg-float';
  const srcTeam = event.src && event.src.team;
  el.classList.add(srcTeam === TEAMS.BOSS ? 'is-boss' : 'is-player');
  if (event.heavy) el.classList.add('is-heavy');
  el.textContent = String(Math.round(event.applied));
  const jx = (Math.random() - 0.5) * 28;
  el.style.left = `${at.x + jx}px`;
  el.style.top = `${at.y}px`;
  ensureLayer().appendChild(el);
  floaters.push({ el, life: 0.72 });
  if (floaters.length > 18) {
    const old = floaters.shift();
    old?.el.remove();
  }
}

function spawnParry(ctx, actor) {
  if (!actor?.position) return;
  const at = project(ctx, actor.position, 2.05);
  if (!at) return;
  const el = document.createElement('div');
  el.className = 'dmg-float is-boss is-heavy';
  el.textContent = '完美 / PARRY';
  el.style.left = `${at.x}px`;
  el.style.top = `${at.y}px`;
  ensureLayer().appendChild(el);
  floaters.push({ el, life: 0.8 });
}

function teamOf(src) {
  return src && src.team === TEAMS.BOSS ? 'boss' : 'player';
}

export function burst(ctx, spec) {
  const n = Math.min(spec.n || 12, 16);
  const bossSide = spec.team === 'boss';
  for (let k = 0; k < n; k += 1) {
    let slot = particles.find((p) => p.life <= 0);
    if (!slot) {
      if (particles.length >= MAX_PARTICLES) slot = particles[k % MAX_PARTICLES];
      else {
        slot = { i: particles.length, life: 0, max: 0.35, vx: 0, vy: 0, vz: 0 };
        particles.push(slot);
      }
    }
    const ang = Math.random() * Math.PI * 2;
    const spd = (1.6 + Math.random() * 3.4) * (spec.scale || 1);
    slot.life = 0.28 + Math.random() * 0.18;
    slot.max = slot.life;
    slot.x = spec.x + (Math.random() - 0.5) * 0.3;
    slot.y = (spec.y == null ? 1.05 : spec.y) + Math.random() * 0.4;
    slot.z = spec.z + (Math.random() - 0.5) * 0.3;
    slot.vx = Math.cos(ang) * spd;
    slot.vz = Math.sin(ang) * spd;
    slot.vy = 1.2 + Math.random() * 2.2;
    slot.hold = false;
    if (bossSide) {
      slot.r = 1;
      slot.g = 0.78 + Math.random() * 0.2;
      slot.b = 0.35;
    } else {
      slot.r = 0.75 + Math.random() * 0.25;
      slot.g = 0.88 + Math.random() * 0.12;
      slot.b = 1;
    }
  }
  writeParticles();
}

function writeParticles() {
  for (let i = 0; i < MAX_PARTICLES; i += 1) {
    const p = particles[i];
    const o = i * 3;
    if (!p || p.life <= 0) {
      PARTICLE_POS[o + 1] = -40;
      PARTICLE_COL[o] = 0;
      PARTICLE_COL[o + 1] = 0;
      PARTICLE_COL[o + 2] = 0;
      continue;
    }
    PARTICLE_POS[o] = p.x;
    PARTICLE_POS[o + 1] = p.y;
    PARTICLE_POS[o + 2] = p.z;
    const fade = Math.max(0, p.life / p.max);
    PARTICLE_COL[o] = p.r * fade;
    PARTICLE_COL[o + 1] = p.g * fade;
    PARTICLE_COL[o + 2] = p.b * fade;
  }
  if (pointGeo) {
    pointGeo.attributes.position.needsUpdate = true;
    pointGeo.attributes.color.needsUpdate = true;
  }
}

export function slash(ctx, spec) {
  const slot = take(slashes);
  if (!slot) return;
  const texId = spec.gold ? 'vfx.slash_gold' : 'vfx.slash';
  slot.mat.map = loadTexture(texId);
  slot.mat.color.set(spec.gold ? 0xffe2a8 : 0xffffff);
  slot.life = 0.18;
  slot.max = 0.18;
  slot.spin = spec.spin || 0;
  slot.scale = spec.scale || 1.7;
  slot.flat = false;
  slot.mesh.visible = true;
  slot.mesh.position.set(
    spec.x || 0,
    spec.y == null ? 1.05 : spec.y,
    spec.z || 0,
  );
  slot.mat.opacity = 1;
  slot.baseSpin = spec.spin || 0;
}

export function impact(ctx, spec) {
  const slot = take(impacts);
  if (!slot) return;
  slot.life = 0.22;
  slot.max = 0.22;
  slot.scale = spec.scale || 1.35;
  slot.flat = false;
  slot.mesh.visible = true;
  slot.mesh.position.set(spec.x || 0, spec.y == null ? 1.15 : spec.y, spec.z || 0);
  slot.mat.opacity = 1;
  slot.mat.color.set(spec.gold ? 0xffd98a : 0xe7f4ff);
}

export function heal(ctx, spec) {
  const slot = take(heals);
  if (!slot) return;
  slot.life = spec.life || 0.7;
  slot.max = slot.life;
  slot.scale = spec.scale || 1.6;
  slot.flat = true;
  slot.mesh.visible = true;
  slot.mesh.position.set(spec.x || 0, 0.08, spec.z || 0);
  slot.mesh.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI);
  slot.mat.opacity = 0.95;
}

export function bolt(ctx, spec) {
  const slot = take(bolts);
  if (!slot) return;
  const len = Math.hypot(spec.dirX || 0, spec.dirZ || 0) || 1;
  slot.life = 1.2;
  slot.max = 1.2;
  slot.x = spec.x || 0;
  slot.z = spec.z || 0;
  slot.y = spec.y == null ? 1.15 : spec.y;
  slot.vx = (spec.dirX / len) * (spec.speed || 26);
  slot.vz = (spec.dirZ / len) * (spec.speed || 26);
  slot.range = spec.range || 20;
  slot.traveled = 0;
  slot.damage = spec.damage || 18;
  slot.src = spec.src || null;
  slot.hit = false;
  slot.flat = false;
  slot.scale = 0.48;
  slot.mesh.visible = true;
  slot.mesh.scale.set(0.48, 0.48, 1);
  slot.mesh.position.set(slot.x, slot.y, slot.z);
  slot.mat.opacity = 1;
}

const beamAlong = new THREE.Vector3();
const beamSide = new THREE.Vector3();
const beamNormal = new THREE.Vector3();
const beamUp = new THREE.Vector3(0, 1, 0);
const beamBasis = new THREE.Matrix4();

export function beam(ctx, spec) {
  const len = Math.max(1.2, spec.length || 8);
  const dirX = spec.dirX || 0;
  const dirZ = spec.dirZ || 1;
  beamAlong.set(dirX, 0, dirZ);
  if (beamAlong.lengthSq() < 1e-6) beamAlong.set(0, 0, -1);
  beamAlong.normalize();
  // side × along = up, so the floor strip is a proper rotation.
  // The upright sheet flips that normal; otherwise its basis mirrors
  // and the quad stands up as a column.
  beamSide.crossVectors(beamAlong, beamUp);
  if (beamSide.lengthSq() < 1e-8) beamSide.set(1, 0, 0);
  beamSide.normalize();
  beamNormal.copy(beamSide).negate();
  const mx = (spec.x || 0) + beamAlong.x * len * 0.5;
  const mz = (spec.z || 0) + beamAlong.z * len * 0.5;
  const layouts = [
    { y: 0.16, sx: 1.9, basisX: beamSide, basisZ: beamUp },
    { y: 0.95, sx: 1.35, basisX: beamUp, basisZ: beamNormal },
  ];
  for (const lay of layouts) {
    const slot = take(beams);
    if (!slot) break;
    slot.life = 0.42;
    slot.max = 0.42;
    slot.flat = true;
    slot.mesh.visible = true;
    slot.mesh.position.set(mx, lay.y, mz);
    slot.mesh.scale.set(lay.sx, len, 1);
    beamBasis.makeBasis(lay.basisX, beamAlong, lay.basisZ);
    slot.mesh.quaternion.setFromRotationMatrix(beamBasis);
    slot.mat.opacity = 1;
    slot.scale = 1;
  }
  const dots = 12;
  for (let i = 0; i < dots; i += 1) {
    let slot = particles.find((p) => p.life <= 0);
    if (!slot) {
      if (particles.length >= MAX_PARTICLES) break;
      slot = { i: particles.length, life: 0, max: 0.4, vx: 0, vy: 0, vz: 0 };
      particles.push(slot);
    }
    const t = (i + 0.5) / dots;
    slot.life = 0.4;
    slot.max = 0.4;
    slot.hold = true;
    slot.x = (spec.x || 0) + dirX * len * t;
    slot.y = 0.55 + Math.sin(t * Math.PI) * 0.7;
    slot.z = (spec.z || 0) + dirZ * len * t;
    slot.vx = 0;
    slot.vy = 0;
    slot.vz = 0;
    slot.r = 0.82;
    slot.g = 0.92;
    slot.b = 1;
  }
  writeParticles();
  impact(ctx, {
    x: (spec.x || 0) + (spec.dirX || 0) * Math.min(len, spec.hitDist || len),
    z: (spec.z || 0) + (spec.dirZ || 0) * Math.min(len, spec.hitDist || len),
    y: 1.2,
    scale: 1.8,
    gold: false,
  });
}

export function charge(ctx, spec) {
  void ctx;
  if (!spec) {
    chargeState.on = false;
    return;
  }
  chargeState.on = true;
  chargeState.x = spec.x;
  chargeState.z = spec.z;
  chargeState.ratio = Math.max(0, Math.min(1, spec.ratio || 0));
}

function onHit(ctx, event) {
  if (!event || !event.applied || !event.dst?.position) return;
  const dst = event.dst;
  const src = event.src;
  const bossHit = src && src.team === TEAMS.BOSS;
  const gold = !!bossHit;
  spawnFloater(ctx, event);
  const x = src?.position ? (src.position.x + dst.position.x) * 0.5 : dst.position.x;
  const z = src?.position ? (src.position.z + dst.position.z) * 0.5 : dst.position.z;
  const y = bossHit ? 1.15 : Math.min(dst.height || 1.6, 1.7) * 0.7;
  impact(ctx, { x, y, z, scale: event.heavy ? 1.85 : 1.25, gold });
  burst(ctx, {
    x, y, z,
    team: teamOf(src),
    n: event.heavy ? 16 : 11,
    scale: event.heavy ? 1.25 : 1,
  });
  if (bossHit) {
    slash(ctx, {
      x: dst.position.x,
      y: 1.1,
      z: dst.position.z,
      gold: true,
      scale: event.heavy ? 2.3 : 1.7,
      spin: (Math.random() - 0.5) * 0.8,
    });
  }
  const audio = ctx.audio;
  if (!audio) return;
  if (dst.team === TEAMS.BOSS) {
    if (event.heavy) audio.playSfx('sfx.heavy');
  } else {
    audio.playSfx('sfx.hitPlayer');
    if (event.heavy) audio.playSfx('sfx.heavy');
  }
}

function stepBolts(ctx, dt) {
  const boss = ctx.boss;
  for (const boltSlot of bolts) {
    if (boltSlot.life <= 0) continue;
    const x0 = boltSlot.x;
    const z0 = boltSlot.z;
    boltSlot.x += boltSlot.vx * dt;
    boltSlot.z += boltSlot.vz * dt;
    boltSlot.traveled += Math.hypot(boltSlot.vx * dt, boltSlot.vz * dt);
    boltSlot.life -= dt;
    boltSlot.mesh.position.set(boltSlot.x, boltSlot.y, boltSlot.z);
    if (!boltSlot.hit && boss && boss.alive !== false) {
      const rad = (boss.radius || 0.5) + 0.4;
      if (segmentNear(x0, z0, boltSlot.x, boltSlot.z, boss.position.x, boss.position.z, rad)) {
        boltSlot.hit = true;
        boltSlot.life = 0;
        applyHit(ctx, boltSlot.src, boss, boltSlot.damage, { heavy: false, hitStopMs: 42 });
      }
    }
    if (boltSlot.traveled >= boltSlot.range || boltSlot.life <= 0) {
      boltSlot.life = 0;
      boltSlot.mesh.visible = false;
    }
  }
}

function segmentNear(x0, z0, x1, z1, px, pz, rad) {
  const vx = x1 - x0;
  const vz = z1 - z0;
  const len2 = vx * vx + vz * vz;
  let t = 0;
  if (len2 > 1e-8) t = ((px - x0) * vx + (pz - z0) * vz) / len2;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  const qx = x0 + vx * t;
  const qz = z0 + vz * t;
  return Math.hypot(px - qx, pz - qz) <= rad;
}

function decayPool(pool, dt, grow) {
  for (const slot of pool) {
    if (slot.life <= 0) continue;
    slot.life -= dt;
    const u = slot.max > 0 ? 1 - slot.life / slot.max : 0;
    const fade = Math.max(0, slot.life / slot.max);
    slot.mat.opacity = fade;
    if (!slot.flat) {
      const s = slot.scale * (grow ? 0.75 + u * 0.7 : 1);
      slot.mesh.scale.set(s, s, 1);
    } else if (slot !== undefined && slot.scale) {
      const s = slot.scale * (0.7 + u * 0.8);
      if (slot.mesh.scale.y < slot.mesh.scale.x * 2) {
        slot.mesh.scale.set(s, s, 1);
      }
    }
    if (slot.life <= 0) {
      slot.mesh.visible = false;
      slot.mat.opacity = 0;
    }
  }
}

function stepParticles(dt) {
  for (const p of particles) {
    if (p.life <= 0) continue;
    p.life -= dt;
    p.x += p.vx * dt;
    p.z += p.vz * dt;
    if (!p.hold) {
      p.y += p.vy * dt;
      p.vy -= 6 * dt;
    }
  }
  writeParticles();
}

export function sim(ctx, dt) {
  const step = Math.max(0, dt || 0);
  if (step <= 0) return;
  stepBolts(ctx, step);
  for (const slot of beams) {
    if (slot.life <= 0) continue;
    slot.life -= step;
    slot.mat.opacity = Math.max(0, slot.life / slot.max);
    if (slot.life <= 0) slot.mesh.visible = false;
  }
  decayPool(slashes, step, true);
  decayPool(impacts, step, true);
  for (const slot of heals) {
    if (slot.life <= 0) continue;
    slot.life -= step;
    const u = 1 - slot.life / slot.max;
    const s = slot.scale * (0.55 + u * 0.9);
    slot.mesh.scale.set(s, s, 1);
    slot.mat.opacity = Math.max(0, slot.life / slot.max) * 0.9;
    if (slot.life <= 0) slot.mesh.visible = false;
  }
  stepParticles(step);
}

function syncRings(ctx) {
  const want = !!ctx.debug?.showHitboxes;
  if (!want) {
    for (const r of rings) r.visible = false;
    return;
  }
  const actors = [ctx.player, ctx.boss, ...(ctx.allies || [])].filter(Boolean);
  while (rings.length < actors.length) {
    const geo = new THREE.BufferGeometry();
    const pts = [];
    const seg = 28;
    for (let i = 0; i <= seg; i += 1) {
      const a = (i / seg) * Math.PI * 2;
      pts.push(Math.cos(a), 0, Math.sin(a));
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const line = new THREE.LineLoop(geo, new THREE.LineBasicMaterial({ color: 0xd8b15a }));
    line.frustumCulled = false;
    ctx.scene.add(line);
    rings.push(line);
  }
  for (let i = 0; i < rings.length; i += 1) {
    const actor = actors[i];
    const ring = rings[i];
    if (!actor) {
      ring.visible = false;
      continue;
    }
    ring.visible = true;
    ring.position.set(actor.position.x, 0.08, actor.position.z);
    const rad = actor.radius || 0.5;
    ring.scale.set(rad, 1, rad);
  }
}

function presentPools(ctx) {
  const cam = ctx.camera;
  const pools = [slashes, impacts, bolts];
  for (const pool of pools) {
    for (const slot of pool) {
      if (slot.life <= 0 || !slot.mesh.visible) continue;
      if (slot.flat) continue;
      const twist = (slot.baseSpin || 0) + (slot.max ? (1 - slot.life / slot.max) * 0.25 : 0);
      orientCard(slot.mesh, cam, pool === bolts ? 0 : twist);
      if (pool === bolts) slot.mesh.scale.set(0.48, 0.48, 1);
    }
  }
  for (const slot of heals) {
    if (slot.life <= 0 || !slot.mesh.visible) continue;
    slot.mesh.rotation.x = -Math.PI / 2;
  }
  if (chargeMesh) {
    chargeMesh.visible = !!chargeState.on;
    if (chargeState.on) {
      const s = 0.7 + chargeState.ratio * 1.5;
      chargeMesh.position.set(chargeState.x, 0.09, chargeState.z);
      chargeMesh.scale.set(s, s, 1);
      chargeMesh.rotation.x = -Math.PI / 2;
      chargeMesh.material.opacity = 0.35 + chargeState.ratio * 0.55;
    }
  }
}

export function init(ctx) {
  ensureLayer();
  const slashMap = loadTexture('vfx.slash');
  const impactMap = loadTexture('vfx.impact');
  const healMap = loadTexture('vfx.heal');
  for (let i = 0; i < 8; i += 1) addPlane(ctx, slashMap, slashes);
  for (let i = 0; i < 8; i += 1) addPlane(ctx, impactMap, impacts);
  for (let i = 0; i < 4; i += 1) addPlane(ctx, healMap, heals);
  for (let i = 0; i < 6; i += 1) addPlane(ctx, starCanvas(), bolts);
  for (let i = 0; i < 2; i += 1) addPlane(ctx, beamCanvas(), beams);

  pointGeo = new THREE.BufferGeometry();
  pointGeo.setAttribute('position', new THREE.BufferAttribute(PARTICLE_POS, 3));
  pointGeo.setAttribute('color', new THREE.BufferAttribute(PARTICLE_COL, 3));
  const pointMat = new THREE.PointsMaterial({
    size: 0.18,
    map: softCircle(),
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    opacity: 0.95,
  });
  pointMesh = new THREE.Points(pointGeo, pointMat);
  pointMesh.frustumCulled = false;
  pointMesh.renderOrder = 26;
  ctx.scene.add(pointMesh);
  writeParticles();

  chargeMesh = new THREE.Mesh(
    new THREE.RingGeometry(0.45, 0.7, 32),
    new THREE.MeshBasicMaterial({
      color: 0xb9dcff,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    }),
  );
  chargeMesh.visible = false;
  chargeMesh.renderOrder = 6;
  ctx.scene.add(chargeMesh);

  const api = {
    update,
    present,
    reset,
    sim,
    slash: (c, spec) => slash(c || ctx, spec),
    burst: (c, spec) => burst(c || ctx, spec),
    impact: (c, spec) => impact(c || ctx, spec),
    heal: (c, spec) => heal(c || ctx, spec),
    bolt: (c, spec) => bolt(c || ctx, spec),
    beam: (c, spec) => beam(c || ctx, spec),
    charge: (c, spec) => charge(c || ctx, spec),
  };
  ctx.world.vfx = api;

  if (wired) return;
  wired = true;
  ctx.bus.on(EVENTS.HIT, (event) => onHit(ctx, event));
  ctx.bus.on(EVENTS.PERFECT_GUARD, () => {
    if (ctx.player) spawnParry(ctx, ctx.player);
  });
}

export function update() {}

export function present(ctx, dt) {
  const cinematic = ctx.state?.current === 'theater' || ctx.state?.current === 'credits';
  if (cinematic) {
    for (const pool of [slashes, impacts, heals, bolts, beams]) {
      for (const slot of pool) {
        slot.life = 0;
        if (slot.mesh) slot.mesh.visible = false;
        if (slot.mat) slot.mat.opacity = 0;
      }
    }
    for (const p of particles) p.life = 0;
    writeParticles();
    chargeState.on = false;
    if (chargeMesh) chargeMesh.visible = false;
  }
  for (let i = floaters.length - 1; i >= 0; i -= 1) {
    floaters[i].life -= dt;
    if (floaters[i].life <= 0) {
      floaters[i].el.remove();
      floaters.splice(i, 1);
    }
  }
  presentPools(ctx);
  syncRings(ctx);
}

export function reset() {
  for (const f of floaters) f.el.remove();
  floaters.length = 0;
  for (const pool of [slashes, impacts, heals, bolts, beams]) {
    for (const slot of pool) {
      slot.life = 0;
      slot.mesh.visible = false;
      if (slot.mat) slot.mat.opacity = 0;
    }
  }
  for (const p of particles) p.life = 0;
  chargeState.on = false;
  if (chargeMesh) chargeMesh.visible = false;
  writeParticles();
}
