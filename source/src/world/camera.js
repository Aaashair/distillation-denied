// OWNER: WS1
// Elden-style over-the-shoulder lock camera.
// Defaults: 5.5 m behind, 2.2 m up, 0.9 m to the right, FOV 60.
// Locked: the rig sits on the boss→player axis so A/D orbits. Mouse and arrows
// only nudge. Unlocked: free orbit around the player. Shake listens to
// camera_shake and hit; the stronger request wins, then decays over 0.2 s.
// The rig never drops below the floor.

import * as THREE from 'three';
import { EVENTS, GAME_STATES } from '../core/contracts.js';

const smooth = new THREE.Vector3();
const smoothLook = new THREE.Vector3();
const desired = new THREE.Vector3();
const look = new THREE.Vector3();
const worldDir = new THREE.Vector3();

const FLOOR_Y = 0.42;
const LOCK_YAW = 0.42;
const LOCK_PITCH = 0.16;

let yaw = 0;
let pitch = 0;
let shakeAmp = 0;
let shakeT = 0;
let shakeDur = 0.2;
let seeded = false;
let snap = false;
let bound = false;

export function planarBasis(ctx, outForward, outRight) {
  ctx.camera.getWorldDirection(outForward);
  outForward.y = 0;
  if (outForward.lengthSq() < 1e-8) outForward.set(0, 0, -1);
  else outForward.normalize();
  outRight.set(-outForward.z, 0, outForward.x);
}

function wrap(a) {
  let x = a;
  while (x > Math.PI) x -= Math.PI * 2;
  while (x < -Math.PI) x += Math.PI * 2;
  return x;
}

function addShake(intensity, duration) {
  const amp = Math.max(0, Number(intensity) || 0);
  const dur = Math.max(0.05, Number(duration) || 0.2);
  if (amp >= shakeAmp || shakeT <= 0) {
    shakeAmp = amp;
    shakeDur = dur;
    shakeT = Math.max(shakeT, dur);
  } else {
    shakeT = Math.max(shakeT, dur * 0.35);
  }
}

function applyShake(cam, raw) {
  if (shakeT <= 0 || shakeAmp <= 0) return;
  shakeT = Math.max(0, shakeT - raw);
  const k = shakeDur > 0 ? shakeT / shakeDur : 0;
  const amp = shakeAmp * k * k;
  cam.position.x += (Math.random() - 0.5) * 2 * amp;
  cam.position.y += (Math.random() - 0.5) * 2 * amp * 0.45;
  cam.position.z += (Math.random() - 0.5) * 2 * amp * 0.65;
  if (shakeT <= 0) shakeAmp = 0;
}

function placeLockRing(ctx, mesh) {
  const show = ctx.lockOn && ctx.boss && ctx.state.current === GAME_STATES.FIGHT;
  mesh.visible = !!show;
  if (!show) return;
  const boss = ctx.boss;
  mesh.position.set(boss.position.x, 0.09, boss.position.z);
  const pulse = 1 + Math.sin((ctx.time?.unscaled || 0) * 5) * 0.04;
  mesh.scale.setScalar(pulse);
}

export function init(ctx) {
  const cam = ctx.camera;
  cam.fov = ctx.debug.camFov || 60;
  cam.position.set(6, 7, 14);
  cam.lookAt(0, 1.4, 0);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  smooth.copy(cam.position);
  smoothLook.set(0, 1.4, 0);
  seeded = true;

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.72, 0.86, 40),
    new THREE.MeshBasicMaterial({
      color: 0xd8b15a,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.visible = false;
  ring.renderOrder = 4;
  ring.frustumCulled = false;
  ctx.scene.add(ring);
  ctx.world.lockRing = ring;

  if (bound) return;
  bound = true;
  ctx.bus.on(EVENTS.CAMERA_SHAKE, (payload) => {
    addShake(payload?.intensity, payload?.duration);
  });
  ctx.bus.on(EVENTS.HIT, (event) => {
    if (!event || !event.applied) return;
    addShake(event.heavy ? 0.25 : 0.08, 0.2);
  });
  ctx.bus.on(EVENTS.FIGHT_START, () => {
    snap = true;
  });
}

export function reset() {
  yaw = 0;
  pitch = 0;
  shakeAmp = 0;
  shakeT = 0;
  shakeDur = 0.2;
  seeded = false;
  snap = true;
}

function toggleLock(ctx) {
  ctx.lockOn = !ctx.lockOn;
  if (ctx.lockOn) {
    yaw = 0;
    pitch = 0;
  } else {
    ctx.camera.getWorldDirection(worldDir);
    worldDir.y = 0;
    if (worldDir.lengthSq() > 1e-8) {
      worldDir.normalize();
      // Free orbit stores the direction FROM the player TO the camera.
      yaw = Math.atan2(-worldDir.x, -worldDir.z);
    }
  }
  ctx.bus.emit(EVENTS.LOCK_ON, { enabled: !!ctx.lockOn });
}

export function update(ctx, dt) {
  const cam = ctx.camera;
  const dbg = ctx.debug;
  const fov = dbg.camFov || 60;
  if (cam.fov !== fov) {
    cam.fov = fov;
    cam.updateProjectionMatrix();
  }
  const raw = ctx.time?.lastRaw ?? dt;
  const followDt = Math.max(0, dt);
  const menu = ctx.state.current === GAME_STATES.TITLE
    || ctx.state.current === GAME_STATES.DISCLAIMER
    || ctx.state.current === GAME_STATES.SELECT
    || ctx.state.current === GAME_STATES.CREDITS
    || ctx.state.current === GAME_STATES.BANNED;

  if (ctx.world.lockRing) placeLockRing(ctx, ctx.world.lockRing);

  if (menu || !ctx.player) {
    const t = ctx.time?.unscaled || 0;
    const r = 16;
    desired.set(Math.sin(t * 0.13) * r, 7.2, Math.cos(t * 0.13) * r);
    const k = 1 - Math.exp(-Math.max(followDt, 0.016) * 1.6);
    if (!seeded || ctx.state.current === GAME_STATES.BANNED) {
      smooth.copy(desired);
      seeded = true;
    } else {
      smooth.lerp(desired, k);
    }
    cam.position.copy(smooth);
    look.set(0, 1.5, 0);
    cam.lookAt(look);
    applyShake(cam, raw);
    if (cam.position.y < FLOOR_Y) cam.position.y = FLOOR_Y;
    cam.updateMatrixWorld();
    return;
  }

  const fighting = ctx.state.current === GAME_STATES.FIGHT;
  if (fighting && !ctx.input.typing() && (ctx.input.pressed('tab') || ctx.input.pressed('mmb'))) {
    toggleLock(ctx);
  }

  if (ctx.state.current === GAME_STATES.PAUSED) {
    applyShake(cam, raw);
    if (cam.position.y < FLOOR_Y) cam.position.y = FLOOR_Y;
    cam.updateMatrixWorld();
    return;
  }

  const locked = !!(ctx.lockOn && ctx.boss);
  const keyYaw = (ctx.input.held('right') ? 1 : 0) - (ctx.input.held('left') ? 1 : 0);
  const keyPitch = (ctx.input.held('up') ? 1 : 0) - (ctx.input.held('down') ? 1 : 0);
  const mouseX = ctx.input.pointer.dx || 0;
  const mouseY = ctx.input.pointer.dy || 0;
  const yawSpeed = locked ? 0.55 : 1.15;
  const mouseYaw = locked ? 0.0015 : 0.0034;
  const mousePitch = locked ? 0.0009 : 0.0016;
  yaw += keyYaw * followDt * yawSpeed;
  yaw += mouseX * mouseYaw;
  pitch += keyPitch * followDt * 0.45;
  pitch += -mouseY * mousePitch;
  if (locked) {
    yaw = Math.max(-LOCK_YAW, Math.min(LOCK_YAW, yaw));
    pitch = Math.max(-LOCK_PITCH, Math.min(LOCK_PITCH, pitch));
  } else {
    yaw = wrap(yaw);
    pitch = Math.max(-0.28, Math.min(0.42, pitch));
  }

  const player = ctx.player;
  const boss = ctx.boss;
  const dist = dbg.camDistance > 0 ? dbg.camDistance : 5.5;
  const height = Number.isFinite(dbg.camHeight) ? dbg.camHeight : 2.2;
  let side = Number.isFinite(dbg.camSide) ? dbg.camSide : 0.9;
  // Spec shoulder at range. In melee the rig slides wider so the boss
  // stays beside the chaser instead of hidden behind the billboard.
  if (ctx.lockOn && boss) {
    const gap = Math.hypot(player.position.x - boss.position.x, player.position.z - boss.position.z);
    side += Math.max(0, 4.8 - gap) * 0.62;
  }

  let fx;
  let fz;
  if (locked) {
    fx = player.position.x - boss.position.x;
    fz = player.position.z - boss.position.z;
    const len = Math.hypot(fx, fz) || 1;
    fx /= len;
    fz /= len;
    const c = Math.cos(yaw);
    const s = Math.sin(yaw);
    const rx = fx * c - fz * s;
    const rz = fx * s + fz * c;
    fx = rx;
    fz = rz;
  } else {
    fx = Math.sin(yaw);
    fz = Math.cos(yaw);
  }

  // fx/fz points from the look target back toward the camera (player's back).
  desired.set(
    player.position.x + fx * dist + fz * side,
    player.position.y + height + pitch * 0.45,
    player.position.z + fz * dist - fx * side,
  );
  if (desired.y < FLOOR_Y) desired.y = FLOOR_Y;

  // Look ahead of the shoulder, shifted to the camera's right, so the chaser
  // sits in the lower-left and the boss stays in the open center of the frame.
  const rx = fz;
  const rz = -fx;
  if (locked && boss) {
    const toX = boss.position.x - player.position.x;
    const toZ = boss.position.z - player.position.z;
    const toL = Math.hypot(toX, toZ) || 1;
    const ahead = Math.min(2.6, Math.max(1.35, toL * 0.48));
    const rightBias = Math.min(1.05, 0.22 + toL * 0.1);
    look.set(
      player.position.x + (toX / toL) * ahead + rx * rightBias,
      1.42 + pitch * 0.55,
      player.position.z + (toZ / toL) * ahead + rz * rightBias,
    );
  } else {
    look.set(
      player.position.x - fx * 2.2 + rx * 0.85,
      1.35 + pitch * 0.9,
      player.position.z - fz * 2.2 + rz * 0.85,
    );
  }

  const posK = 1 - Math.exp(-(followDt > 0 ? followDt : 0) * 8.5);
  const lookK = 1 - Math.exp(-(followDt > 0 ? followDt : 0) * 12);
  if (!seeded || snap) {
    smooth.copy(desired);
    smoothLook.copy(look);
    seeded = true;
    snap = false;
  } else {
    if (posK > 0) smooth.lerp(desired, posK);
    if (lookK > 0) smoothLook.lerp(look, lookK);
  }
  cam.position.copy(smooth);
  cam.lookAt(smoothLook);
  applyShake(cam, raw);
  if (cam.position.y < FLOOR_Y) cam.position.y = FLOOR_Y;
  cam.updateMatrixWorld();
}
