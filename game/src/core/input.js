// OWNER: W1
// Keys: WASD, arrows, Space, Shift, E, Q, 1/2/3, Esc, P, Enter, R, plus LMB/RMB.
// pointer.x / pointer.y are INTERNAL pixels. Call setMapper from main
// (pixel.screenToInternal) so this file does not import the renderer.
// pressed() is edge-triggered until endFrame. Later fixed steps close edges
// via setEdgesOpen(false). Blur clears held and edges.
// Arrows: last key pressed wins on each axis, then the two axes combine.

import { VIEW_H, VIEW_W } from '../config/balance.js';

const ALIAS = {
  w: ['KeyW'],
  a: ['KeyA'],
  s: ['KeyS'],
  d: ['KeyD'],
  q: ['KeyQ'],
  e: ['KeyE'],
  r: ['KeyR'],
  space: ['Space'],
  shift: ['ShiftLeft', 'ShiftRight'],
  lmb: ['Mouse0'],
  rmb: ['Mouse2'],
  mmb: ['Mouse1'],
  1: ['Digit1'],
  2: ['Digit2'],
  3: ['Digit3'],
  esc: ['Escape'],
  escape: ['Escape'],
  p: ['KeyP'],
  up: ['ArrowUp'],
  down: ['ArrowDown'],
  left: ['ArrowLeft'],
  right: ['ArrowRight'],
  enter: ['Enter'],
  tab: ['Tab'],
};

const BLOCK_DEFAULT = new Set([
  'Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
]);

function codesOf(name) {
  const key = String(name);
  if (ALIAS[key]) return ALIAS[key];
  const lower = key.toLowerCase();
  if (ALIAS[lower]) return ALIAS[lower];
  return [key];
}

const DIRS = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];

export function facingName(x, y) {
  if (!x && !y) return 's';
  const a = Math.atan2(y, x);
  const i = Math.round(a / (Math.PI / 4));
  return DIRS[((i % 8) + 8) % 8];
}

export function createInput(canvas) {
  const held = new Set();
  const edge = new Set();
  const consumed = new Set();
  const pointer = {
    x: VIEW_W * 0.5,
    y: VIEW_H * 0.5,
    clientX: 0,
    clientY: 0,
    dx: 0,
    dy: 0,
    onUi: false,
  };
  /** @type {Map<string, number>} code → press order. Last press wins per axis. */
  const pressSeq = new Map();
  let pressN = 1;
  let edgesOpen = true;
  let listening = false;
  /** @type {(clientX:number, clientY:number) => {x:number, y:number}} */
  let mapper = (x, y) => ({ x, y });

  function isTypingTarget(target) {
    const el = target || document.activeElement;
    if (!el || !el.tagName) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }

  function onUiTarget(target) {
    return !!(target && target.closest && target.closest('#ui-root'));
  }

  function markEdge(code) {
    if (!held.has(code)) {
      edge.add(code);
      pressSeq.set(code, pressN);
      pressN += 1;
    }
    held.add(code);
  }

  /** -1 if neg won, +1 if pos won, 0 if neither is held. */
  function axisDir(neg, pos) {
    const n = held.has(neg);
    const p = held.has(pos);
    if (n && p) return (pressSeq.get(pos) || 0) >= (pressSeq.get(neg) || 0) ? 1 : -1;
    if (n) return -1;
    if (p) return 1;
    return 0;
  }

  function mapPointer(clientX, clientY) {
    pointer.clientX = clientX;
    pointer.clientY = clientY;
    const p = mapper(clientX, clientY);
    if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) {
      pointer.x = p.x;
      pointer.y = p.y;
    }
  }

  function anyHeld(codes) {
    for (let i = 0; i < codes.length; i += 1) if (held.has(codes[i])) return true;
    return false;
  }

  function anyEdge(codes) {
    for (let i = 0; i < codes.length; i += 1) if (edge.has(codes[i])) return true;
    return false;
  }

  function onKeyDown(e) {
    if (e.repeat) return;
    if (isTypingTarget(e.target)) return;
    if (BLOCK_DEFAULT.has(e.code)) e.preventDefault();
    markEdge(e.code);
  }

  function onKeyUp(e) {
    held.delete(e.code);
    pressSeq.delete(e.code);
  }

  function onMouseDown(e) {
    mapPointer(e.clientX, e.clientY);
    pointer.onUi = onUiTarget(e.target);
    const code = e.button === 0 ? 'Mouse0' : e.button === 1 ? 'Mouse1' : e.button === 2 ? 'Mouse2' : '';
    if (!code) return;
    if (e.button === 2 || e.button === 1) e.preventDefault();
    markEdge(code);
  }

  function onMouseUp(e) {
    const code = e.button === 0 ? 'Mouse0' : e.button === 1 ? 'Mouse1' : e.button === 2 ? 'Mouse2' : '';
    if (code) {
      held.delete(code);
      pressSeq.delete(code);
    }
  }

  function onMouseMove(e) {
    mapPointer(e.clientX, e.clientY);
    if (onUiTarget(e.target) || isTypingTarget(e.target)) return;
    const mx = e.movementX || 0;
    const my = e.movementY || 0;
    if (!mx && !my) return;
    pointer.dx += mx;
    pointer.dy += my;
  }

  function onContext(e) {
    if (!onUiTarget(e.target)) e.preventDefault();
  }

  function onBlur() {
    held.clear();
    edge.clear();
    consumed.clear();
    pressSeq.clear();
  }

  const api = {
    pointer,
    edgesOpen: true,

    /** @param {(clientX:number, clientY:number) => {x:number, y:number}} fn */
    setMapper(fn) {
      if (typeof fn === 'function') mapper = fn;
    },

    typing() {
      return isTypingTarget(document.activeElement);
    },

    /** True once per keydown for every reader until endFrame. */
    pressed(name) {
      if (!edgesOpen) return false;
      const codes = codesOf(name);
      if (!anyEdge(codes)) return false;
      for (let i = 0; i < codes.length; i += 1) {
        if (edge.has(codes[i])) consumed.add(codes[i]);
      }
      return true;
    },

    held(name) {
      return anyHeld(codesOf(name));
    },

    /** Drop an edge so later readers in this frame do not see it. */
    eat(name) {
      const codes = codesOf(name);
      for (let i = 0; i < codes.length; i += 1) {
        edge.delete(codes[i]);
        consumed.delete(codes[i]);
      }
    },

    /**
     * Aim used for shooting. Arrows (8-dir) win. Otherwise the mouse while LMB is held.
     * Returns a unit vector or null when the player is not aiming.
     * @param {{x:number, y:number, facing?: string|number}|null|undefined} player
     */
    aimVector(player) {
      const x = axisDir('ArrowLeft', 'ArrowRight');
      const y = axisDir('ArrowUp', 'ArrowDown');
      if (x || y) {
        const l = Math.hypot(x, y) || 1;
        return { x: x / l, y: y / l };
      }
      if (held.has('Mouse0') && player) {
        const dx = pointer.x - player.x;
        const dy = pointer.y - player.y;
        const l = Math.hypot(dx, dy);
        if (l > 2) return { x: dx / l, y: dy / l };
      }
      return null;
    },

    /** @param {boolean} open */
    setEdgesOpen(open) {
      edgesOpen = open;
      api.edgesOpen = open;
    },

    endFrame() {
      for (const code of consumed) edge.delete(code);
      consumed.clear();
      pointer.dx = 0;
      pointer.dy = 0;
      pointer.onUi = false;
      edgesOpen = true;
      api.edgesOpen = true;
    },

    attach() {
      if (listening) return;
      listening = true;
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('contextmenu', onContext);
      window.addEventListener('blur', onBlur);
    },
  };

  return api;
}
