// OWNER: W4 — full-screen ban CG only (phase Haiku→Sonnet→Opus stays in-engine via boss.beat).
import { EVENTS } from '../core/contracts.js';
import { getAsset } from '../config/assets.js';
import { bi } from '../data/lines.js';

const SETTING = { zh: '548 Market Street', en: '548 Market Street' };

let root;
let artEl;
let capEl;
let mode = '';

function show(el, on) {
  if (el) el.classList.toggle('is-hidden', !on);
}

function setArt(id) {
  const path = id ? getAsset(id) : null;
  if (!path || !artEl) {
    show(artEl, false);
    return false;
  }
  artEl.src = path;
  show(artEl, true);
  return true;
}

function showRoot(on) {
  if (!root) return;
  root.classList.toggle('is-hidden', !on);
}

function muteStoryStingers(ctx) {
  ctx.audio?.stopSfx?.('sfx.phase', { fade: 0.05 });
  ctx.audio?.stopSfx?.('sfx.glass', { fade: 0.05 });
  ctx.audio?.stopSfx?.('sfx.tear', { fade: 0.05 });
  ctx.audio?.stopSfx?.('sfx.death', { fade: 0.05 });
  ctx.audio?.stopSfx?.('sfx.heartbeat', { fade: 0.1 });
  ctx.audio?.stopVo?.();
}

function showBan(ctx) {
  if (!setArt('end.ban')) return;
  mode = 'ban';
  document.body.dataset.storyCg = 'ban';
  capEl.textContent = `${bi(SETTING)} · ${bi({ zh: '封号', en: 'ACCOUNT BANNED' })}`;
  showRoot(true);
  muteStoryStingers(ctx);
  ctx.audio?.stopVo?.();
}

function hide() {
  mode = '';
  document.body.dataset.storyCg = '';
  showRoot(false);
  show(artEl, false);
}

export function activePhaseHold() {
  return false;
}

export function init(ctx) {
  root = document.createElement('div');
  root.id = 'story-cg';
  root.className = 'is-hidden';
  artEl = document.createElement('img');
  artEl.className = 'story-cg-art';
  artEl.alt = '';
  artEl.draggable = false;
  capEl = document.createElement('p');
  capEl.className = 'story-cg-cap';
  root.append(artEl, capEl);
  document.getElementById('ui-root')?.appendChild(root);

  ctx.flags.phaseCgFreeze = false;

  ctx.bus.on(EVENTS.STATE_CHANGE, ({ to, from }) => {
    if (to === 'banned') showBan(ctx);
    else if (from === 'banned' && to === 'fight') hide();
    else if (to === 'theater' || to === 'title' || to === 'credits') hide();
  });
  ctx.bus.on(EVENTS.FIGHT_RESET, () => hide());
  ctx.bus.on(EVENTS.FIGHT_START, () => hide());
}

export function update() {
  /* No phase CG hold — boss.tickReal owns transformation beats. */
}

export function reset() {
  hide();
}