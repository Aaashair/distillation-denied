// OWNER: WS1
// Keyboard + mouse. pressed() is edge-triggered for the frame (every reader sees it
// until endFrame). held() stays true while the key is down. Gameplay steps after the
// first in a frame run with edges closed so one tap cannot swing twice.
// Pointer lock is optional: click the canvas during a fight to capture the mouse.

const ALIAS = {
  w: 'KeyW',
  a: 'KeyA',
  s: 'KeyS',
  d: 'KeyD',
  space: 'Space',
  j: 'KeyJ',
  k: 'KeyK',
  lmb: 'Mouse0',
  rmb: 'Mouse2',
  mmb: 'Mouse1',
  1: 'Digit1',
  2: 'Digit2',
  3: 'Digit3',
  r: 'KeyR',
  tab: 'Tab',
  esc: 'Escape',
  escape: 'Escape',
  p: 'KeyP',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  enter: 'Enter',
};

const BLOCK_DEFAULT = new Set([
  'Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
]);

function codeOf(name) {
  const key = String(name);
  if (ALIAS[key]) return ALIAS[key];
  const lower = key.toLowerCase();
  if (ALIAS[lower]) return ALIAS[lower];
  return key;
}

export function createInput(canvas) {
  const held = new Set();
  const edge = new Set();
  const consumed = new Set();
  const pointer = { x: 0, y: 0, dx: 0, dy: 0, locked: false, onUi: false };
  let edgesOpen = true;
  /** @type {null | (() => boolean)} */
  let lockPredicate = null;
  let listening = false;

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
    if (!held.has(code)) edge.add(code);
    held.add(code);
  }

  function onKeyDown(e) {
    if (e.repeat) return;
    if (isTypingTarget(e.target)) return;
    if (BLOCK_DEFAULT.has(e.code)) e.preventDefault();
    markEdge(e.code);
  }

  function onKeyUp(e) {
    held.delete(e.code);
  }

  function onMouseDown(e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.onUi = onUiTarget(e.target);
    const code = e.button === 0 ? 'Mouse0' : e.button === 1 ? 'Mouse1' : e.button === 2 ? 'Mouse2' : '';
    if (!code) return;
    if (e.button === 1) e.preventDefault();
    markEdge(code);
  }

  function onMouseUp(e) {
    const code = e.button === 0 ? 'Mouse0' : e.button === 1 ? 'Mouse1' : e.button === 2 ? 'Mouse2' : '';
    if (code) held.delete(code);
  }

  function onMouseMove(e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    // movementX is valid with or without pointer lock. Clamp so a cursor
    // warp cannot spin the rig a full turn in one event.
    if (onUiTarget(e.target) || isTypingTarget(e.target)) return;
    const mx = e.movementX || 0;
    const my = e.movementY || 0;
    if (!mx && !my) return;
    pointer.dx += Math.max(-90, Math.min(90, mx));
    pointer.dy += Math.max(-90, Math.min(90, my));
  }

  function onContext(e) {
    if (!onUiTarget(e.target)) e.preventDefault();
  }

  function onLockChange() {
    pointer.locked = document.pointerLockElement === canvas;
  }

  function onCanvasClick() {
    if (!lockPredicate || !lockPredicate()) return;
    if (document.pointerLockElement === canvas) return;
    canvas.requestPointerLock?.();
  }

  const api = {
    pointer,
    edgesOpen: true,

    /** @param {() => boolean} fn */
    setPointerLock(fn) {
      lockPredicate = fn;
    },

    typing() {
      return isTypingTarget(document.activeElement);
    },

    /** True once per keydown. Every reader this frame sees it. Later sim steps
     *  are closed so one tap cannot swing twice. A press that lands after the
     *  step that could read it stays latched for the next frame. */
    pressed(name) {
      if (!edgesOpen) return false;
      const code = codeOf(name);
      if (!edge.has(code)) return false;
      consumed.add(code);
      return true;
    },

    held(name) {
      return held.has(codeOf(name));
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
      window.addEventListener('blur', () => {
        held.clear();
        edge.clear();
        consumed.clear();
      });
      document.addEventListener('pointerlockchange', onLockChange);
      canvas.addEventListener('click', onCanvasClick);
    },
  };

  return api;
}
