// OWNER: WS4
// P toggles this panel. Buttons call window.__debug so tests and humans share one path.
// There is no story-mode switch and no checkpoint control.

import { bi, UI } from '../data/lines.js';

let root;
let fps = 0;
let fpsAccum = 0;
let fpsFrames = 0;
let open = false;

function row(label, node) {
  const wrap = document.createElement('label');
  wrap.className = 'dbg-row';
  const span = document.createElement('span');
  span.textContent = label;
  wrap.append(span, node);
  return wrap;
}

function slider(id, min, max, step, value) {
  const input = document.createElement('input');
  input.type = 'range';
  input.id = id;
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  return input;
}

export function setOpen(value) {
  open = !!value;
  root?.classList.toggle('is-hidden', !open);
}

export function init(ctx) {
  root = document.createElement('aside');
  root.id = 'debug-panel';
  root.className = 'panel is-hidden';

  const title = document.createElement('h2');
  title.textContent = bi(UI.debugTitle);
  const fpsEl = document.createElement('div');
  fpsEl.id = 'dbg-fps';
  fpsEl.className = 'fine';

  const god = document.createElement('input');
  god.type = 'checkbox';
  god.id = 'dbg-god';
  god.addEventListener('change', () => window.__debug.setGod(god.checked));

  const boxes = document.createElement('input');
  boxes.type = 'checkbox';
  boxes.id = 'dbg-hitboxes';
  boxes.addEventListener('change', () => { ctx.debug.showHitboxes = boxes.checked; });

  const scale = slider('dbg-timescale', 0, 2, 0.05, 1);
  scale.addEventListener('input', () => window.__debug.setTimeScale(scale.value));

  const mulP = slider('dbg-mul-player', 0, 5, 0.1, 1);
  const mulB = slider('dbg-mul-boss', 0, 5, 0.1, 1);
  const mulA = slider('dbg-mul-ally', 0, 5, 0.1, 1);
  mulP.addEventListener('input', () => window.__debug.setDamageMul('player', mulP.value));
  mulB.addEventListener('input', () => window.__debug.setDamageMul('boss', mulB.value));
  mulA.addEventListener('input', () => window.__debug.setDamageMul('ally', mulA.value));

  const hp = slider('dbg-boss-hp', 0, 100, 1, 100);
  hp.addEventListener('input', () => window.__debug.setBossHpRatio(Number(hp.value) / 100));

  const phases = document.createElement('div');
  phases.className = 'row';
  for (const n of [1, 2, 3]) {
    const b = document.createElement('button');
    b.type = 'button';
    b.id = `btn-phase-${n}`;
    b.textContent = `P${n}`;
    b.addEventListener('click', () => window.__debug.setPhase(n));
    phases.append(b);
  }
  const ends = document.createElement('div');
  ends.className = 'row';
  for (const id of ['A', 'B']) {
    const b = document.createElement('button');
    b.type = 'button';
    b.id = `btn-end-${id.toLowerCase()}`;
    b.textContent = `${UI.ending.zh} ${id} / ${UI.ending.en} ${id}`;
    b.addEventListener('click', () => window.__debug.triggerEnding(id));
    ends.append(b);
  }

  const dist = slider('dbg-cam-dist', 2, 12, 0.1, ctx.debug.camDistance);
  const height = slider('dbg-cam-height', 0.5, 8, 0.1, ctx.debug.camHeight);
  const fov = slider('dbg-cam-fov', 40, 90, 1, ctx.debug.camFov);
  dist.addEventListener('input', () => { ctx.debug.camDistance = Number(dist.value); });
  height.addEventListener('input', () => { ctx.debug.camHeight = Number(height.value); });
  fov.addEventListener('input', () => { ctx.debug.camFov = Number(fov.value); });

  root.append(
    title,
    fpsEl,
    row(bi(UI.god), god),
    row(bi(UI.hitboxes), boxes),
    row(bi(UI.timeScale), scale),
    row(bi(UI.mulPlayer), mulP),
    row(bi(UI.mulBoss), mulB),
    row(bi(UI.mulAlly), mulA),
    row(bi(UI.bossSlider), hp),
    row(bi(UI.phase), phases),
    row(bi(UI.ending), ends),
    row(`${UI.cam.zh} dist / dist`, dist),
    row(`${UI.cam.zh} height / height`, height),
    row('FOV', fov),
  );
  document.getElementById('ui-root').appendChild(root);
  root._fps = fpsEl;
  root._hp = hp;
  root._scale = scale;
  root._god = god;
}

export function update(ctx, dt) {
  if (ctx.input.pressed('p') && !ctx.input.typing()) setOpen(!open);
  fpsAccum += dt;
  fpsFrames += 1;
  if (fpsAccum >= 0.4) {
    fps = Math.round(fpsFrames / fpsAccum);
    fpsAccum = 0;
    fpsFrames = 0;
  }
  if (!open || !root) return;
  root._fps.textContent = `FPS ${fps} · t ${ctx.time.elapsed.toFixed(1)}s · ${ctx.state.current}`;
  if (document.activeElement !== root._hp && ctx.boss) {
    root._hp.value = String(Math.round((ctx.boss.hp / ctx.boss.maxHp) * 100));
  }
  if (document.activeElement !== root._scale) root._scale.value = String(ctx.time.timeScale);
  root._god.checked = !!ctx.debug.godMode;
}

export function reset() {}
