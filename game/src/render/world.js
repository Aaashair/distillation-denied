// OWNER: W3
// Internal buffer is 640×360. Gameplay still lives in the 480×270 world
// (balance.js ROOM / actor x,y). World pixels are drawn at (WORLD_OX, WORLD_OY)
// so the 480×320 room backgrounds sit in the centre with HUD gutters.
//
// Screen (buffer) x = world x + WORLD_OX
// Mouse mapping (pixel.screenToInternal) returns WORLD pixels.

export const INTERNAL_W = 640;
export const INTERNAL_H = 360;

/** Top-left of the 480×320 room plate / 480×270 world inside the buffer. */
export const WORLD_OX = 80;
export const WORLD_OY = 20;

export const ROOM_BG = Object.freeze({ x: 80, y: 20, w: 480, h: 320 });

/**
 * Walkable floor in SCREEN / buffer pixels, measured from room_p1/p2/p3
 * (inner marble/dc tile field inside the 32–40 px wall ring).
 * ≈ DESIGN_v2 §1b (128..512, 76..284).
 */
export const FLOOR_SCREEN = Object.freeze({ x: 128, y: 76, w: 384, h: 208 });

/** Same rect in world (actor) pixels. */
export const FLOOR_WORLD = Object.freeze({
  x: FLOOR_SCREEN.x - WORLD_OX,
  y: FLOOR_SCREEN.y - WORLD_OY,
  w: FLOOR_SCREEN.w,
  h: FLOOR_SCREEN.h,
});

/** Side columns reserved for HUD. */
export const HUD_LEFT = Object.freeze({ x: 0, y: 0, w: 80, h: INTERNAL_H });
export const HUD_RIGHT = Object.freeze({ x: 560, y: 0, w: 80, h: INTERNAL_H });
export const HUD_TOP = Object.freeze({ x: 80, y: 0, w: 480, h: 18 });

export function applyScreen(g) {
  if (!g) return;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.imageSmoothingEnabled = false;
}

export function applyWorld(g) {
  if (!g) return;
  g.setTransform(1, 0, 0, 1, WORLD_OX, WORLD_OY);
  g.imageSmoothingEnabled = false;
}

export function worldToScreen(x, y) {
  return { x: (x | 0) + WORLD_OX, y: (y | 0) + WORLD_OY };
}

export function screenToWorld(x, y) {
  return { x: x - WORLD_OX, y: y - WORLD_OY };
}

export function roundPx(n) {
  return (n + 0.0001) | 0;
}
