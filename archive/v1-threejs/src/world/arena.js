// OWNER: WS3
// Circular cathedral platform, pillars, fog, sky, and the hologram plate.
// Keep init/update/reset, RADIUS, clampToArena, and setHolo.

import * as THREE from 'three';
import { buildDress, tickDress } from './arena_dress.js';

export const RADIUS = 20;

const holoCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
if (holoCanvas) {
  holoCanvas.width = 1024;
  holoCanvas.height = 256;
}
let holoTex = null;
let holoReady = false;
/** @type {THREE.Mesh | null} */
let holoPlate = null;
/** @type {THREE.Mesh | null} */
let holoScan = null;
let lastTickAt = -1;
let tickerBound = false;

export function clampToArena(pos, pad = 1.15) {
  const max = RADIUS - pad;
  const d = Math.hypot(pos.x, pos.z);
  if (d > max && d > 0) {
    const s = max / d;
    pos.x *= s;
    pos.z *= s;
  }
}

function paintHolo(zh, en) {
  if (!holoCanvas) return;
  const g = holoCanvas.getContext('2d');
  if (!g) return;
  const w = holoCanvas.width;
  const h = holoCanvas.height;
  g.clearRect(0, 0, w, h);
  const bg = g.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, 'rgba(8, 28, 42, 0.78)');
  bg.addColorStop(1, 'rgba(12, 18, 28, 0.7)');
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(216, 177, 90, 0.95)';
  g.lineWidth = 5;
  g.strokeRect(10, 10, w - 20, h - 20);
  g.strokeStyle = 'rgba(156, 201, 240, 0.45)';
  g.lineWidth = 1.5;
  g.strokeRect(18, 18, w - 36, h - 36);
  g.fillStyle = 'rgba(156, 201, 240, 0.16)';
  for (let y = 28; y < h - 24; y += 7) g.fillRect(24, y, w - 48, 2);
  g.fillStyle = 'rgba(216, 177, 90, 0.85)';
  g.font = '600 18px serif';
  g.textAlign = 'left';
  g.fillText('DARIO', 32, 48);
  g.fillStyle = '#f4f1ea';
  g.textAlign = 'center';
  g.font = '600 44px serif';
  g.fillText(zh || '—', w / 2, 118);
  g.fillStyle = '#d8b15a';
  g.font = '26px serif';
  g.fillText(en || '', w / 2, 168);
  if (holoTex) holoTex.needsUpdate = true;
}

export function setHolo(zh, en) {
  paintHolo(zh, en);
}

function tickArena(ctx) {
  const t = ctx.time?.unscaled ?? 0;
  if (t === lastTickAt) return;
  const dt = lastTickAt < 0 ? 0 : Math.min(0.05, Math.max(0, t - lastTickAt));
  lastTickAt = t;
  tickDress(ctx, t, dt);
  const state = ctx.state?.current;
  const showHolo = state !== 'theater' && state !== 'credits';
  if (holoPlate) {
    holoPlate.visible = showHolo;
    if (showHolo) holoPlate.material.opacity = 0.84 + Math.sin(t * 2.1) * 0.06;
  }
  if (holoScan) {
    holoScan.position.y = Math.sin(t * 1.4) * 0.42;
    holoScan.material.opacity = 0.12 + 0.08 * (0.5 + 0.5 * Math.sin(t * 3.2));
  }
}

export function init(ctx) {
  const { scene } = ctx;
  scene.background = new THREE.Color(0x9cc9f0);
  scene.fog = new THREE.Fog(0xc5d8ea, 26, 74);

  buildDress(ctx, RADIUS);

  if (holoCanvas) {
    paintHolo('Dario', 'HOLO');
    holoTex = new THREE.CanvasTexture(holoCanvas);
    holoTex.colorSpace = THREE.SRGBColorSpace;
    holoTex.needsUpdate = true;
    holoPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(8.4, 2.1),
      new THREE.MeshBasicMaterial({
        map: holoTex,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    // Off the lock-on axis so the plate sits in the left sky instead of
    // covering Haiku at the opening distance.
    holoPlate.position.set(14.6, 5.1, -1.2);
    holoPlate.lookAt(-2, 1.4, 8);
    scene.add(holoPlate);

    holoScan = new THREE.Mesh(
      new THREE.PlaneGeometry(8.2, 0.18),
      new THREE.MeshBasicMaterial({
        color: 0x9cc9f0,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    holoPlate.add(holoScan);
    holoReady = true;
  }

  if (!tickerBound) {
    tickerBound = true;
    const ticker = new THREE.Mesh(
      new THREE.PlaneGeometry(0.01, 0.01),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
      }),
    );
    ticker.frustumCulled = false;
    ticker.position.set(0, 24, 0);
    ticker.name = 'arena-ticker';
    ticker.onBeforeRender = () => tickArena(ctx);
    scene.add(ticker);
  }

  ctx.world.radius = RADIUS;
  ctx.world.clamp = clampToArena;
  ctx.world.setHolo = holoReady ? setHolo : () => {};
}

export function update(ctx) {
  tickArena(ctx);
}

export function reset() {
  lastTickAt = -1;
  paintHolo('Dario', 'HOLO');
}
