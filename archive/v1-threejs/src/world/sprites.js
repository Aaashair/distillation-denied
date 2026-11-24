// OWNER: WS1
// Camera-facing cutout billboards. Feet stay on the floor (yaw only, no pitch).
// Portrait art is 1024×1536, so every spr.* plane uses that aspect.
// Boss and allies share flash / tint / dim / setPose. P3 attack & cast frames
// are over-bright, so those ids render at material color 0.75.
// Roll calls ghost() for a short afterimage.

import * as THREE from 'three';
import { loadTexture } from '../config/assets.js';
import { poseAssetId } from '../actors/characters.js';

const ASPECT = 1024 / 1536;
const PLANE = new THREE.PlaneGeometry(1, 1);
const list = [];
const ghosts = [];
const GHOSTS = 8;

const FOOT = {
  idle: 0.955,
  run: 0.985,
  attack: 0.975,
  skill: 0.99,
  roll: 0.86,
  hurt: 0.965,
  heal: 0.97,
  down: 0.87,
  front: 0.99,
  cast: 0.99,
  windup: 0.99,
};

let shadowTex = null;
let shadowGeo = null;
let seq = 1;

function softShadowTexture() {
  if (shadowTex) return shadowTex;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const g = canvas.getContext('2d');
  if (g) {
    const grd = g.createRadialGradient(64, 64, 6, 64, 64, 62);
    grd.addColorStop(0, 'rgba(28, 22, 16, 0.55)');
    grd.addColorStop(0.55, 'rgba(28, 22, 16, 0.22)');
    grd.addColorStop(1, 'rgba(28, 22, 16, 0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
  }
  shadowTex = new THREE.CanvasTexture(canvas);
  shadowTex.colorSpace = THREE.SRGBColorSpace;
  shadowTex.needsUpdate = true;
  return shadowTex;
}

function roundRect(g, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  g.beginPath();
  g.moveTo(x + radius, y);
  g.arcTo(x + w, y, x + w, y + h, radius);
  g.arcTo(x + w, y + h, x, y + h, radius);
  g.arcTo(x, y + h, x, y, radius);
  g.arcTo(x, y, x + w, y, radius);
  g.closePath();
}

/** @param {HTMLCanvasElement} canvas @param {CanvasRenderingContext2D} g */
export function drawPlaceholder(canvas, g, opts) {
  const w = canvas.width;
  const h = canvas.height;
  const color = opts.color || '#888888';
  const accent = opts.accent || '#d8b15a';
  const facing = opts.facing || 'front';
  g.clearRect(0, 0, w, h);
  g.fillStyle = color;
  g.beginPath();
  g.arc(w * 0.5, h * 0.16, w * 0.15, 0, Math.PI * 2);
  g.fill();
  roundRect(g, w * 0.28, h * 0.28, w * 0.44, h * 0.36, 28);
  g.fill();
  roundRect(g, w * 0.30, h * 0.62, w * 0.16, h * 0.28, 10);
  g.fill();
  roundRect(g, w * 0.54, h * 0.62, w * 0.16, h * 0.28, 10);
  g.fill();
  g.fillStyle = accent;
  g.fillRect(w * 0.47, h * 0.30, w * 0.06, h * 0.38);
  g.fillStyle = 'rgba(255,255,255,0.92)';
  g.font = 'bold 42px sans-serif';
  g.textAlign = 'center';
  if (facing === 'back') {
    g.fillRect(w * 0.38, h * 0.12, w * 0.24, h * 0.035);
  } else {
    g.beginPath();
    g.arc(w * 0.42, h * 0.155, 8, 0, Math.PI * 2);
    g.arc(w * 0.58, h * 0.155, 8, 0, Math.PI * 2);
    g.fill();
  }
  const label = opts.label || '—';
  g.fillStyle = 'rgba(16, 14, 12, 0.78)';
  g.fillRect(w * 0.06, h * 0.86, w * 0.88, h * 0.1);
  g.fillStyle = '#f4f1ea';
  let size = 36;
  g.font = `600 ${size}px serif`;
  while (size > 16 && g.measureText(label).width > w * 0.8) {
    size -= 2;
    g.font = `600 ${size}px serif`;
  }
  g.fillText(label, w * 0.5, h * 0.925);
}

function familyOf(assetId) {
  if (!assetId) return null;
  const chaser = String(assetId).match(/^spr\.(deepseek|kimi|glm)\./);
  if (chaser) return { kind: 'chaser', id: chaser[1] };
  const boss = String(assetId).match(/^spr\.boss\.(p[123])\./);
  if (boss) return { kind: 'boss', phase: boss[1] };
  return null;
}

function dimForAsset(assetId) {
  const id = String(assetId || '');
  // Opus frames are authored near-white. Dim the whole silhouette, and dim
  // the strike frames harder so the attack pose stays a figure, not a blob.
  if (/^spr\.boss\.p3\.(attack|cast)$/.test(id)) return 0.36;
  if (/^spr\.boss\.p3\./.test(id)) return 0.55;
  return 1;
}

function bossPhaseToken(board) {
  const phase = board.owner && board.owner.phase;
  if (phase === 1 || phase === 2 || phase === 3) return `p${phase}`;
  return board.family?.phase || 'p1';
}

function assetFor(board, pose) {
  const family = board.family;
  if (!family) return board.baseAsset;
  if (family.kind === 'chaser') return poseAssetId(family.id, pose || 'idle');
  const phase = bossPhaseToken(board);
  if (pose === 'hurt' || pose === 'down') return `spr.boss.${phase}.hurt`;
  if (pose === 'attack') return `spr.boss.${phase}.attack`;
  if (pose === 'skill' || pose === 'cast') return `spr.boss.${phase}.cast`;
  if (pose === 'windup') return `spr.boss.${phase}.windup`;
  if (phase === 'p3') return 'spr.boss.p3.windup';
  return `spr.boss.${phase}.front`;
}

function paintColor(board) {
  const dim = (board.dim == null ? board.autoDim : board.dim) || 1;
  board.material.color.copy(board.tint);
  board.material.color.multiplyScalar(dim);
}

function applyAsset(board, assetId) {
  if (!assetId || assetId === board.assetId) {
    board.autoDim = dimForAsset(board.assetId);
    paintColor(board);
    return;
  }
  const tex = loadTexture(assetId, (canvas, g) => drawPlaceholder(canvas, g, {
    color: board.color,
    accent: board.accent,
    label: board.label,
    facing: board.facing,
  }));
  board.material.map = tex;
  board.material.needsUpdate = true;
  if (board.flashMat) {
    board.flashMat.map = tex;
    board.flashMat.needsUpdate = true;
  }
  board.assetId = assetId;
  board.autoDim = dimForAsset(assetId);
  paintColor(board);
}

function makeGhost(ctx) {
  const mat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
    alphaTest: 0.18,
    color: 0xd7ecff,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const mesh = new THREE.Mesh(PLANE, mat);
  mesh.visible = false;
  mesh.frustumCulled = false;
  mesh.renderOrder = 12;
  ctx.scene.add(mesh);
  const slot = { mesh, mat, life: 0 };
  ghosts.push(slot);
  return slot;
}

/**
 * @param {import('../core/contracts.js').BillboardOptions} opts
 */
export function createBillboard(ctx, opts) {
  const height = opts.height || 1.75;
  const width = opts.width && opts.respectWidth ? opts.width : height * ASPECT;
  const baseAsset = opts.assetId || '';
  const tex = loadTexture(baseAsset, (canvas, g) => drawPlaceholder(canvas, g, opts));
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    alphaTest: 0.18,
    depthWrite: true,
    side: THREE.DoubleSide,
    color: 0xffffff,
    toneMapped: true,
  });
  const mesh = new THREE.Mesh(PLANE, mat);
  mesh.scale.set(width, height, 1);
  mesh.frustumCulled = false;
  mesh.renderOrder = 20;

  const flashMat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    alphaTest: 0.18,
    color: 0xffffff,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const flashMesh = new THREE.Mesh(PLANE, flashMat);
  flashMesh.position.z = 0.02;
  flashMesh.scale.set(1.01, 1.01, 1);
  flashMesh.renderOrder = 21;
  flashMesh.frustumCulled = false;
  mesh.add(flashMesh);

  if (!shadowGeo) shadowGeo = new THREE.PlaneGeometry(1, 1);
  const shadow = new THREE.Mesh(
    shadowGeo,
    new THREE.MeshBasicMaterial({
      map: softShadowTexture(),
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.035;
  shadow.renderOrder = 2;
  shadow.frustumCulled = false;

  ctx.scene.add(mesh);
  ctx.scene.add(shadow);

  const board = {
    id: seq,
    mesh,
    shadow,
    material: mat,
    flashMat,
    flashMesh,
    height,
    width,
    baseWidth: width,
    baseHeight: height,
    aspect: width / Math.max(0.001, height),
    owner: opts.owner || null,
    flash: 0,
    bob: Math.random() * Math.PI * 2,
    pose: '',
    explicitPose: false,
    assetId: baseAsset,
    baseAsset,
    family: familyOf(baseAsset),
    color: opts.color || '#888888',
    accent: opts.accent || '#d8b15a',
    label: opts.label || '',
    facing: opts.facing || 'front',
    tint: new THREE.Color(1, 1, 1),
    dim: null,
    autoDim: dimForAsset(baseAsset),
    squashX: 1,
    squashY: 1,
    lean: 0,
    tilt: 0,
    bobAmp: null,
    ghost: false,
    _px: null,
    _pz: null,
    _ghostD: 0,
  };
  seq += 1;
  paintColor(board);
  list.push(board);
  if (opts.owner) opts.owner.sprite = mesh;

  board.setPose = (pose) => setPose(board, pose);
  board.setTint = (color) => setTint(board, color);
  board.setDim = (value) => setDim(board, value);
  board.flashHit = (seconds) => flash(board, seconds);
  return board;
}

export function setPose(board, pose) {
  if (!board) return;
  const next = pose || 'idle';
  board.explicitPose = true;
  board.pose = next;
  const id = assetFor(board, next);
  if (id) applyAsset(board, id);
}

export function setTint(board, color) {
  if (!board) return;
  if (color == null) board.tint.setRGB(1, 1, 1);
  else board.tint.set(color);
  paintColor(board);
}

export function setDim(board, value) {
  if (!board) return;
  board.dim = value == null ? null : Math.max(0, Number(value) || 0);
  paintColor(board);
}

export function flash(board, seconds = 0.08) {
  if (!board) return;
  board.flash = Math.max(board.flash || 0, seconds);
}

export function ghost(board) {
  if (!board || !ghosts.length) return;
  let slot = ghosts.find((g) => g.life <= 0);
  if (!slot) slot = ghosts[0];
  slot.life = 0.22;
  slot.mat.map = board.material.map;
  slot.mat.opacity = 0.45;
  slot.mat.color.set(0xd6ecff);
  slot.mesh.visible = true;
  slot.mesh.position.copy(board.mesh.position);
  slot.mesh.quaternion.copy(board.mesh.quaternion);
  slot.mesh.scale.copy(board.mesh.scale);
  slot.mesh.renderOrder = 14;
}

export function destroyBillboard(board) {
  if (!board) return;
  const i = list.indexOf(board);
  if (i >= 0) list.splice(i, 1);
  board.mesh.removeFromParent();
  board.shadow?.removeFromParent();
  board.material.dispose();
  board.flashMat?.dispose();
  board.shadow?.material?.dispose();
}

function inferPose(board, owner, moving) {
  if (owner.hurtT > 0 && owner.team === 'boss') return 'hurt';
  if (owner.alive === false && owner.team !== 'boss') return 'down';
  if (owner.pose) return owner.pose;
  if (moving) return 'run';
  return board.facing === 'front' ? 'front' : 'idle';
}

function footOf(board, pose) {
  if (board.family?.kind === 'boss') {
    if (pose === 'hurt') return 0.98;
    return 0.995;
  }
  return FOOT[pose] || 0.96;
}

export function present(ctx, dt) {
  const cam = ctx.camera;
  const unscaled = ctx.time?.unscaled || 0;
  const step = Math.max(0, dt || 0);
  for (const b of list) {
    const owner = b.owner;
    if (!owner || !owner.position) {
      b.mesh.visible = false;
      if (b.shadow) b.shadow.visible = false;
      continue;
    }
    const dx = owner.position.x - (b._px == null ? owner.position.x : b._px);
    const dz = owner.position.z - (b._pz == null ? owner.position.z : b._pz);
    b._px = owner.position.x;
    b._pz = owner.position.z;
    const moving = Math.hypot(dx, dz) > 0.01;

    if (owner.team === 'boss' && owner.height > 0.2) {
      const aspect = b.aspect || (b.baseWidth / Math.max(0.001, b.baseHeight));
      b.aspect = aspect;
      b.baseHeight = owner.height;
      b.baseWidth = owner.height * aspect;
    }

    if (!b.explicitPose) {
      const pose = inferPose(b, owner, moving);
      const id = assetFor(b, pose);
      if (id && (pose !== b.pose || id !== b.assetId)) {
        b.pose = pose;
        applyAsset(b, id);
      }
    }

    const pose = b.pose || 'idle';
    let squashX = b.squashX || 1;
    let squashY = b.squashY || 1;
    let lean = b.lean || 0;
    if (!b.explicitPose && (pose === 'run' || pose === 'idle')) {
      const freq = pose === 'run' ? 12 : 2.2;
      const amp = pose === 'run' ? 0.045 : 0.03;
      const s = Math.sin(unscaled * freq + b.bob);
      squashX = 1 + s * amp;
      squashY = 1 - s * amp * 0.8;
      lean = pose === 'run' ? s * 0.06 : 0;
    }

    const visualH = b.baseHeight * squashY;
    const visualW = b.baseWidth * squashX;
    b.height = visualH;
    b.width = visualW;
    b.mesh.scale.set(visualW, visualH, 1);
    b.mesh.position.x = owner.position.x;
    b.mesh.position.z = owner.position.z;
    const amp = b.bobAmp == null
      ? (pose === 'run' ? 0.045 : pose === 'idle' || pose === 'front' ? 0.028 : 0)
      : b.bobAmp;
    const freq = pose === 'run' ? 11 : 2.3;
    const bob = amp ? Math.sin(unscaled * freq + b.bob) * amp : 0;
    const foot = footOf(b, pose);
    const lift = Number(owner.visualLift) || 0;
    const py = Number(owner.position.y) || 0;
    b.mesh.position.y = py + lift + visualH * (foot - 0.5) + bob;

    const cdx = cam.position.x - owner.position.x;
    const cdz = cam.position.z - owner.position.z;
    const yaw = Math.atan2(cdx, cdz);
    b.mesh.rotation.set(b.tilt || 0, yaw, lean);

    if (b.shadow) {
      b.shadow.visible = owner.alive !== false || owner.team === 'boss';
      b.shadow.position.x = owner.position.x;
      b.shadow.position.z = owner.position.z;
      const spread = Math.max(0.7, visualW * 0.85);
      b.shadow.scale.set(spread, spread * 0.62, 1);
    }

    if (b.flash > 0) {
      b.flash = Math.max(0, b.flash - step);
      if (b.flashMat) b.flashMat.opacity = Math.min(0.95, b.flash / 0.08);
    } else if (b.flashMat) {
      b.flashMat.opacity = 0;
    }

    const iframe = !!owner.invulnerable && owner.alive !== false;
    let opacity = iframe ? 0.84 + Math.sin(unscaled * 36 + b.bob) * 0.16 : 1;
    const near = Math.hypot(
      cam.position.x - b.mesh.position.x,
      cam.position.y - b.mesh.position.y,
      cam.position.z - b.mesh.position.z,
    );
    if (near < 2.6) opacity *= Math.max(0, (near - 0.65) / 1.95);
    b.material.opacity = opacity;
    b.material.depthWrite = !iframe;
    b.mesh.visible = true;

    if (b.ghost && moving) {
      b._ghostD += Math.hypot(dx, dz);
      if (b._ghostD > 0.38) {
        b._ghostD = 0;
        ghost(b);
      }
    }
  }

  for (const slot of ghosts) {
    if (slot.life <= 0) {
      slot.mesh.visible = false;
      continue;
    }
    slot.life -= step;
    slot.mat.opacity = Math.max(0, slot.life / 0.22) * 0.42;
    if (slot.life <= 0) slot.mesh.visible = false;
  }
}

export function init(ctx) {
  for (let i = ghosts.length; i < GHOSTS; i += 1) makeGhost(ctx);
  ctx.world.sprites = {
    createBillboard: (opts) => createBillboard(ctx, opts),
    destroyBillboard,
    present,
    setPose,
    setTint,
    setDim,
    flash,
    ghost,
  };
}

export function update() {}

export function reset() {
  for (const slot of ghosts) {
    slot.life = 0;
    slot.mesh.visible = false;
  }
}
