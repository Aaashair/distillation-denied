// OWNER: WS2
// Procedural mecha around the billboard: Sonnet's constitution ring and cape,
// Opus's six chain-of-thought light wings, greatsword glow, and compute dust.
// Parts unfold when the phase changes. The billboard stays camera-facing;
// this rig yaws toward the target so the sword and wings read as 3D.

import * as THREE from 'three';

const GOLD = 0xffe3a1;
const GOLD_HOT = 0xfff6d2;
const IVORY = 0xf4efe4;

function additive(color, opacity) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
}

function solid(color, opacity = 1) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

function wingGeometry(length, base, tip) {
  const geo = new THREE.BufferGeometry();
  const z = 0.04;
  const positions = new Float32Array([
    0, 0, 0,
    length * 0.22, base, z,
    length, tip, z * 2,
    length * 0.94, -tip * 0.35, z,
    length * 0.18, -base * 0.72, z,
  ]);
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4]);
  geo.computeVertexNormals();
  return geo;
}

function capeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const g = canvas.getContext('2d');
  if (g) {
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, 'rgba(255, 236, 196, 0.15)');
    grad.addColorStop(0.2, 'rgba(232, 196, 120, 0.92)');
    grad.addColorStop(0.75, 'rgba(184, 132, 48, 0.88)');
    grad.addColorStop(1, 'rgba(184, 132, 48, 0.15)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 256);
    g.strokeStyle = 'rgba(255, 220, 140, 0.85)';
    g.lineWidth = 4;
    g.strokeRect(6, 20, 116, 210);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function moteTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const g = canvas.getContext('2d');
  if (g) {
    const rad = g.createRadialGradient(32, 32, 0, 32, 32, 30);
    rad.addColorStop(0, 'rgba(255, 236, 190, 1)');
    rad.addColorStop(0.35, 'rgba(232, 170, 64, 0.95)');
    rad.addColorStop(1, 'rgba(232, 170, 64, 0)');
    g.fillStyle = rad;
    g.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function makeDust(count) {
  const pos = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    pos[i * 3] = (Math.random() * 2 - 1) * 16;
    pos[i * 3 + 1] = Math.random() * 8;
    pos[i * 3 + 2] = (Math.random() * 2 - 1) * 16;
    seeds[i] = 0.55 + Math.random() * 1.4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffc14a,
    map: moteTexture(),
    size: 0.34,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    sizeAttenuation: true,
    toneMapped: false,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.visible = false;
  points.renderOrder = 1;
  return { points, seeds, count };
}

/**
 * @param {import('three').Scene} scene
 */
export function createMecha(scene) {
  const root = new THREE.Group();
  root.frustumCulled = false;
  root.renderOrder = 2;

  const halo = new THREE.Group();
  const tilt = new THREE.Group();
  tilt.rotation.x = 1.02;
  const outer = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.07, 10, 64), solid(0xe8b23c, 0.96));
  const glow = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.16, 8, 48), additive(GOLD, 0.35));
  const inner = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.028, 8, 48), solid(GOLD_HOT, 0.9));
  inner.rotation.x = 0.35;
  const runes = new THREE.Group();
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    const rune = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.1), solid(0xfff3c4, 1));
    rune.position.set(Math.cos(a) * 1.72, Math.sin(a) * 1.72, 0);
    rune.rotation.z = a;
    runes.add(rune);
  }
  tilt.add(outer, glow, runes);
  halo.add(tilt, inner);
  halo.position.set(0, 1.28, 0.28);

  const cape = new THREE.Group();
  const cloth = capeTexture();
  const ribbons = [];
  const capeSides = [-0.72, 0.72];
  for (let i = 0; i < capeSides.length; i += 1) {
    const mat = new THREE.MeshBasicMaterial({
      map: cloth,
      color: 0xc48a2a,
      transparent: true,
      opacity: 0.94,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const geo = new THREE.BufferGeometry();
    const s = capeSides[i] < 0 ? -1 : 1;
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      s * 0.04, 0.42, 0,
      s * 0.5, 0.34, 0,
      s * 0.78, -0.95, -0.08,
      s * 0.06, -1.02, -0.05,
    ]), 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
      0, 1, 1, 1, 1, 0, 0, 0,
    ]), 2));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    const rib = new THREE.Mesh(geo, mat);
    const hang = capeSides[i] * 0.22;
    rib.position.set(hang, 1.05, -0.35);
    rib.userData.side = hang;
    rib.userData.phase = i;
    cape.add(rib);
    ribbons.push(rib);
  }

  const wings = new THREE.Group();
  const wingGeo = wingGeometry(1.85, 0.22, 0.08);
  const wingMat = solid(0xf0c14a, 0.96);
  const linkMat = solid(0xfff3c8, 1);
  const wingPivots = [];
  const wingSpecs = [
    { x: -0.72, y: 1.85, z: -0.15, yaw: -0.08, pitch: 1.05 },
    { x: -0.82, y: 1.35, z: 0.05, yaw: -0.55, pitch: 0.35 },
    { x: -0.68, y: 0.95, z: -0.28, yaw: -1.05, pitch: -0.15 },
    { x: 0.72, y: 1.85, z: -0.15, yaw: 0.08, pitch: 1.05 },
    { x: 0.82, y: 1.35, z: 0.05, yaw: 0.55, pitch: 0.35 },
    { x: 0.68, y: 0.95, z: -0.28, yaw: 1.05, pitch: -0.15 },
  ];
  for (let i = 0; i < wingSpecs.length; i += 1) {
    const spec = wingSpecs[i];
    const pivot = new THREE.Group();
    const wing = new THREE.Mesh(wingGeo, wingMat);
    const dir = spec.x < 0 ? Math.PI : 0;
    wing.rotation.y = dir;
    pivot.add(wing);
    const sign = spec.x < 0 ? -1 : 1;
    for (let k = 0; k < 4; k += 1) {
      const link = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.11), linkMat);
      link.position.set(sign * (0.42 + k * 0.48), 0.03, 0.04);
      pivot.add(link);
    }
    pivot.position.set(spec.x, spec.y, spec.z);
    pivot.userData.yaw = spec.yaw;
    pivot.userData.pitch = spec.pitch;
    pivot.userData.sign = sign;
    wings.add(pivot);
    wingPivots.push(pivot);
  }

  const sword = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.85, 0.1), solid(0xf0c14a, 1));
  const guard = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.14, 0.14), solid(0xfff3c8, 1));
  guard.position.y = 0.12;
  const pommel = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.4, 0.1), solid(0xb8862f, 1));
  pommel.position.y = -0.16;
  sword.add(blade, guard, pommel);
  sword.position.set(0.62, 1.15, 0.48);
  sword.rotation.z = -0.18;
  sword.rotation.x = -0.12;

  const ground = new THREE.Mesh(
    new THREE.RingGeometry(1.15, 1.7, 48),
    solid(0xe8b23c, 0.55),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.06;
  ground.visible = false;

  halo.visible = false;
  cape.visible = false;
  wings.visible = false;
  sword.visible = false;
  ground.visible = false;
  root.add(halo, cape, wings, sword);
  scene.add(root);
  const dust = makeDust(150);
  scene.add(dust.points);
  scene.add(ground);

  return {
    root,
    halo,
    tilt,
    inner,
    runes,
    cape,
    ribbons,
    wings,
    wingPivots,
    sword,
    ground,
    dust,
    anim: 0,
  };
}

function damp(current, target, dt, rate) {
  const k = 1 - Math.exp(-rate * Math.max(0, dt));
  return current + (target - current) * k;
}

/**
 * Sim-side animation. Positioning happens in present(), after the billboard moves.
 * @param {import('../core/contracts.js').BossActor & {haloOpen?: number, wingOpen?: number, snapOpen?: boolean}} boss
 */
export function animateMecha(boss, dt) {
  const rig = boss.mecha;
  if (!rig) return;
  const step = dt > 0 ? dt : 0;
  rig.anim += step;
  const wantHalo = boss.phase >= 2 ? 1 : 0;
  const wantWing = boss.phase >= 3 ? 1 : 0;
  if (boss.snapOpen) {
    boss.haloOpen = wantHalo;
    boss.wingOpen = wantWing;
    boss.snapOpen = false;
  } else {
    boss.haloOpen = damp(boss.haloOpen || 0, wantHalo, step, boss.phaseInvuln > 0 ? 1.6 : 2.6);
    boss.wingOpen = damp(boss.wingOpen || 0, wantWing, step, boss.phaseInvuln > 0 ? 1.35 : 2.3);
  }
  const halo = boss.haloOpen || 0;
  const wing = boss.wingOpen || 0;
  rig.halo.visible = halo > 0.02;
  rig.cape.visible = halo > 0.02;
  rig.wings.visible = wing > 0.02;
  rig.sword.visible = wing > 0.02;
  rig.ground.visible = wing > 0.2;
  rig.halo.scale.setScalar(0.08 + 0.92 * halo);
  rig.cape.scale.setScalar(0.2 + 0.8 * halo);
  rig.tilt.rotation.z = rig.anim * 0.65;
  rig.inner.rotation.z = -rig.anim * 0.95;
  rig.runes.rotation.z = rig.anim * 0.65;
  const t = rig.anim;
  for (const rib of rig.ribbons) {
    const sway = Math.sin(t * 1.7 + rib.userData.phase) * 0.18;
    rib.position.x = rib.userData.side + sway * 0.25;
    rib.rotation.z = sway;
    rib.rotation.x = 0.12 + Math.sin(t * 1.3 + rib.userData.phase) * 0.06;
  }
  for (const pivot of rig.wingPivots) {
    const sign = pivot.userData.sign;
    const yaw = pivot.userData.yaw;
    const pitch = pivot.userData.pitch;
    const open = wing;
    pivot.rotation.y = yaw * open + sign * 0.25 * (1 - open);
    pivot.rotation.z = sign * pitch * open + sign * 1.05 * (1 - open);
    pivot.rotation.x = Math.sin(t * 1.5 + yaw) * 0.05 * open;
    pivot.scale.setScalar(0.12 + 0.88 * open);
  }
  const swordScale = 0.05 + 0.95 * wing;
  rig.sword.scale.set(swordScale, swordScale, swordScale);
  rig.sword.rotation.z = Math.sin(t * 1.2) * 0.05 * wing;
  rig.ground.scale.setScalar(0.7 + 0.3 * wing);

  const dust = rig.dust;
  const showDust = boss.phase >= 3 && wing > 0.25;
  dust.points.visible = showDust;
  if (showDust && step > 0) {
    const arr = dust.points.geometry.attributes.position.array;
    for (let i = 0; i < dust.count; i += 1) {
      const fall = dust.seeds[i] * step;
      arr[i * 3 + 1] -= fall;
      arr[i * 3] += Math.sin(t + i) * step * 0.15;
      if (arr[i * 3 + 1] < 0.05) {
        arr[i * 3 + 1] = 5.5 + (i % 7) * 0.45;
        arr[i * 3] = ((i * 17) % 100) / 100 * 32 - 16;
        arr[i * 3 + 2] = ((i * 29) % 100) / 100 * 32 - 16;
      }
    }
    dust.points.geometry.attributes.position.needsUpdate = true;
  }
}

/** @param {import('../core/contracts.js').BossActor} boss */
export function presentMecha(boss) {
  const rig = boss.mecha;
  if (!rig) return;
  const lift = boss.visualLift || 0;
  const s = Math.max(0.55, (boss.height || 1.7) / 2.4);
  rig.root.position.set(boss.position.x, lift, boss.position.z);
  rig.root.rotation.y = Math.atan2(boss.aimX || 0, boss.aimZ || 1);
  rig.root.scale.setScalar(s);
  rig.ground.position.set(boss.position.x, 0.06, boss.position.z);
  const pulse = 0.85 + Math.sin(rig.anim * 3.2) * 0.15;
  if (rig.ground.material) rig.ground.material.opacity = 0.28 + 0.22 * pulse * (boss.wingOpen || 0);
}
