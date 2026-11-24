// OWNER: W1
// Offscreen 640×360 buffer; present visible 480×320 plate beside DOM sidebar.
// view bitmap = availW×h (matches CSS); blit at canvas-local (ox-SIDEBAR_W, oy).
// --game-x/y/w/h use global client coords for DOM + screenToInternal.

import {
  INTERNAL_W as W, INTERNAL_H as H, WORLD_OX, WORLD_OY, ROOM_BG,
} from './world.js';

export const INTERNAL_W = W;
export const INTERNAL_H = H;
export { WORLD_OX, WORLD_OY };

export const SIDEBAR_W = 220;

/** Blit crop — room plate in buffer space (drops empty side gutters). */
export const PRESENT_CROP = Object.freeze({
  x: ROOM_BG.x,
  y: ROOM_BG.y,
  w: ROOM_BG.w,
  h: ROOM_BG.h,
});

/** @type {HTMLCanvasElement|null} */
let view = null;
/** @type {CanvasRenderingContext2D|null} */
let vctx = null;
/** @type {HTMLCanvasElement|null} */
let buffer = null;
/** @type {CanvasRenderingContext2D|null} */
let bctx = null;

let scale = 1;
let ox = 0;
let oy = 0;
let shakeX = 0;
let shakeY = 0;
let filter = '';

function applyUiRect() {
  const dw = Math.round(PRESENT_CROP.w * scale);
  const dh = Math.round(PRESENT_CROP.h * scale);
  const root = document.documentElement;
  root.style.setProperty('--sidebar-w', `${SIDEBAR_W}px`);
  root.style.setProperty('--game-scale', String(scale));
  root.style.setProperty('--game-x', `${ox}px`);
  root.style.setProperty('--game-y', `${oy}px`);
  root.style.setProperty('--game-w', `${dw}px`);
  root.style.setProperty('--game-h', `${dh}px`);
  const ui = document.getElementById('ui-root');
  if (ui) {
    ui.style.left = `${ox}px`;
    ui.style.top = `${oy}px`;
    ui.style.width = `${dw}px`;
    ui.style.height = `${dh}px`;
  }
}

export function layout() {
  if (!view || !vctx) return;
  const w = Math.max(1, window.innerWidth || 1);
  const h = Math.max(1, window.innerHeight || 1);
  const availW = Math.max(1, w - SIDEBAR_W);
  view.width = availW;
  view.height = h;
  view.style.position = 'fixed';
  view.style.left = `${SIDEBAR_W}px`;
  view.style.top = '0';
  view.style.width = `${availW}px`;
  view.style.height = `${h}px`;
  view.style.imageRendering = 'pixelated';
  let next = Math.floor(Math.min(availW / PRESENT_CROP.w, h / PRESENT_CROP.h));
  if (next < 1) next = Math.min(availW / PRESENT_CROP.w, h / PRESENT_CROP.h);
  scale = next > 0 ? next : 1;
  const dw = PRESENT_CROP.w * scale;
  const dh = PRESENT_CROP.h * scale;
  ox = SIDEBAR_W + Math.floor((availW - dw) / 2);
  oy = Math.floor((h - dh) / 2);
  vctx.imageSmoothingEnabled = false;
  applyUiRect();
}

/** @param {HTMLCanvasElement} canvas */
export function init(canvas) {
  view = canvas;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas2D unavailable');
  vctx = ctx;
  buffer = document.createElement('canvas');
  buffer.width = INTERNAL_W;
  buffer.height = INTERNAL_H;
  const bg = buffer.getContext('2d', { alpha: false });
  if (!bg) throw new Error('Buffer Canvas2D unavailable');
  bctx = bg;
  bctx.imageSmoothingEnabled = false;
  canvas.style.imageRendering = 'pixelated';
  layout();
  window.addEventListener('resize', layout);
}

export function screenToInternal(clientX, clientY) {
  const s = scale || 1;
  return {
    x: (clientX - ox) / s,
    y: (clientY - oy) / s,
  };
}

export function screenToBuffer(clientX, clientY) {
  const s = scale || 1;
  return {
    x: (clientX - ox) / s + PRESENT_CROP.x,
    y: (clientY - oy) / s + PRESENT_CROP.y,
  };
}

export function rect() {
  return {
    x: ox,
    y: oy,
    w: PRESENT_CROP.w * scale,
    h: PRESENT_CROP.h * scale,
    scale,
    sidebar: SIDEBAR_W,
    crop: PRESENT_CROP,
  };
}

export function setShake(x, y) {
  shakeX = x | 0;
  shakeY = y | 0;
}

export function getShake() {
  return { x: shakeX, y: shakeY };
}

export function setFilter(css) {
  filter = css || '';
  if (view) view.style.filter = filter;
}

export function getBuffer() {
  return buffer;
}

/** @returns {CanvasRenderingContext2D} */
export function begin() {
  if (!bctx) throw new Error('pixel.init was not called');
  bctx.setTransform(1, 0, 0, 1, 0, 0);
  bctx.imageSmoothingEnabled = false;
  bctx.clearRect(0, 0, INTERNAL_W, INTERNAL_H);
  return bctx;
}

export function present() {
  if (!vctx || !buffer || !view) return;
  vctx.setTransform(1, 0, 0, 1, 0, 0);
  vctx.imageSmoothingEnabled = false;
  vctx.fillStyle = '#000';
  vctx.fillRect(0, 0, view.width, view.height);
  const dw = PRESENT_CROP.w * scale;
  const dh = PRESENT_CROP.h * scale;
  const localX = ox - SIDEBAR_W;
  const localY = oy;
  const sx = Math.round((shakeX | 0) * scale);
  const sy = Math.round((shakeY | 0) * scale);
  vctx.drawImage(
    buffer,
    PRESENT_CROP.x, PRESENT_CROP.y, PRESENT_CROP.w, PRESENT_CROP.h,
    localX + sx, localY + sy, dw, dh,
  );
}

export function update() {}
export function reset() {
  shakeX = 0;
  shakeY = 0;
  setFilter('');
}