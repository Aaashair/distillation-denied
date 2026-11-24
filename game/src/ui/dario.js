// OWNER: W1 (sidebar comms)
// Event-driven director lines in the left sidebar — header persists; body clears to standby.

import { EVENTS } from '../core/contracts.js';
import { bi, UI } from '../data/lines.js';
import { VOICE_LINES } from '../config/assets.generated.js';
import {
  buildDarioPools,
  DARIO_PORTRAIT,
  PORTRAIT_BY_TONE,
} from '../data/lines_dario.js';
import { uiImg } from './uiAssets.js';

const PRIORITY = {
  ending_b: 100,
  fight_start: 90,
  phase2: 90,
  phase3: 90,
  smite: 90,
  player_death: 60,
  b200: 55,
  h200: 50,
  rtx5090: 45,
  flask_spam: 50,
  distill_50: 48,
  boss_low: 45,
  boss_50: 50,
  low_hp: 40,
  perfect_dodge: 25,
  perfect_guard: 20,
  dodge: 12,
  ally_down: 15,
};

/** @type {Record<string, {id?: string, zh: string, en: string, tone?: string}[]>} */
const POOLS = buildDarioPools(VOICE_LINES);

let section;
let bar;
let msgEl;
let portrait;
let activeUntil = 0;
let priority = 0;
let lastGlobal = -999;
/** @type {Record<string, number>} */
const lastEvent = {};
let said50 = false;
let saidDistill50 = false;
let saidLowHp = false;
/** @type {number[]} */
const bigFlasks = [];

const PORTRAIT_FALLBACKS = [
  'v2_dario_holo',
  'px.dario',
  'spr.dario.holo',
];

function portraitId(eventKey, line) {
  const tone = line.tone || 'holo';
  if (PORTRAIT_BY_TONE[tone]) return PORTRAIT_BY_TONE[tone];
  const key = DARIO_PORTRAIT[eventKey];
  if (key) return key;
  return 'v2_dario_holo';
}

function setPortrait(ctx, assetId) {
  const ids = [assetId, ...PORTRAIT_FALLBACKS.filter((id) => id !== assetId)];
  for (const id of ids) {
    const path = ctx.assets.get(id);
    if (path) {
      portrait.classList.remove('is-missing');
      if (portrait.dataset.id !== id) {
        portrait.dataset.id = id;
        portrait.src = path;
      }
      return;
    }
  }
  portrait.classList.add('is-missing');
  portrait.removeAttribute('src');
}

function setStandby() {
  if (msgEl) msgEl.textContent = bi(UI.darioStandby);
}

function show(ctx, eventKey, line, pri) {
  if (ctx.state.current !== 'fight') return;
  const now = ctx.time.unscaled;
  msgEl.textContent = bi({ zh: line.zh, en: line.en });
  setPortrait(ctx, portraitId(eventKey, line));
  section?.classList.remove('is-hidden');
  bar.classList.remove('is-hidden');
  const dur = line.id && ctx.assets.get(line.id) ? 4.8 : 3.6;
  activeUntil = now + dur;
  priority = pri;
  lastGlobal = now;
  lastEvent[eventKey] = now;
  const holo = bi({ zh: line.zh, en: line.en });
  ctx.world.setHolo?.(holo, holo);
  if (line.id && eventKey !== 'ending_b') {
    const voKey = line.id.startsWith('vo.') ? line.id : line.id;
    ctx.audio?.playSfx(voKey);
  } else if (!line.id) {
    ctx.audio?.playSfx('sfx.busy');
  }
  ctx.bus.emit(EVENTS.DARIO_LINE, {
    event: eventKey,
    text: { zh: line.zh, en: line.en },
    priority: pri,
    vo: line.id || null,
  });
}

/** @param {import('../core/contracts.js').GameContext} ctx @param {string} eventKey */
function say(ctx, eventKey) {
  if (ctx.state.current !== 'fight') return false;
  const pool = POOLS[eventKey];
  if (!pool || pool.length === 0) return false;
  const pri = PRIORITY[eventKey] ?? 10;
  const now = ctx.time.unscaled;
  const interrupt = pri >= 90;
  if (!interrupt && now < activeUntil && pri <= priority) return false;
  if (!interrupt && now - lastGlobal < 6 && pri <= priority) return false;
  if (!interrupt && pri < 80 && now - (lastEvent[eventKey] || -999) < 20) return false;
  const line = pool[Math.floor(Math.random() * pool.length)];
  show(ctx, eventKey, line, pri);
  return true;
}

export function init(ctx) {
  section = document.createElement('section');
  section.className = 'hud-comms-block hud-comms-dario is-hidden';
  const heading = document.createElement('h3');
  heading.className = 'hud-comms-title';
  heading.id = 'hud-dario-heading';
  heading.textContent = bi(UI.darioCommsTitle);

  bar = document.createElement('div');
  bar.id = 'dario-bar';
  bar.className = 'pixel-panel dario-panel';
  portrait = uiImg(ctx, 'v2_dario_holo', 'dario-portrait');
  portrait.classList.add('holo-scanlines');
  const body = document.createElement('div');
  body.className = 'dario-body';
  msgEl = document.createElement('div');
  msgEl.className = 'dario-msg';
  body.append(msgEl);
  bar.append(portrait, body);
  section.append(heading, bar);
  setStandby();

  const scroll = document.querySelector('#hud-sidebar-scroll');
  const controls = scroll?.querySelector('.hud-side-controls');
  if (scroll && controls) scroll.insertBefore(section, controls);
  else document.getElementById('ui-root')?.appendChild(section);

  ctx.bus.on(EVENTS.FIGHT_START, () => {
    said50 = false;
    saidDistill50 = false;
    saidLowHp = false;
    bigFlasks.length = 0;
    section.classList.remove('is-hidden');
    say(ctx, 'fight_start');
  });
  ctx.bus.on(EVENTS.FIGHT_RESET, () => {
    said50 = false;
    saidDistill50 = false;
    saidLowHp = false;
    bigFlasks.length = 0;
    setStandby();
  });
  ctx.bus.on(EVENTS.PHASE_CHANGE, ({ phase }) => {
    if (phase === 2) say(ctx, 'phase2');
    if (phase === 3) say(ctx, 'phase3');
  });
  ctx.bus.on(EVENTS.FLASK_USED, ({ type }) => {
    if (type === 'rtx5090') say(ctx, 'rtx5090');
    if (type === 'h200') say(ctx, 'h200');
    if (type === 'b200') say(ctx, 'b200');
    if (type === 'h200' || type === 'b200') {
      const now = ctx.time.unscaled;
      bigFlasks.push(now);
      while (bigFlasks.length && now - bigFlasks[0] > 30) bigFlasks.shift();
      if (bigFlasks.length >= 2) say(ctx, 'flask_spam');
    }
  });
  ctx.bus.on(EVENTS.PERFECT_GUARD, () => say(ctx, 'perfect_guard'));
  ctx.bus.on(EVENTS.PLAYER_DEATH, () => say(ctx, 'player_death'));
  ctx.bus.on(EVENTS.ALLY_DOWN, () => say(ctx, 'ally_down'));
  ctx.bus.on(EVENTS.BOSS_HP, ({ ratio }) => {
    if (!said50 && ratio <= 0.5 && say(ctx, 'boss_50')) said50 = true;
    if (ratio <= 0.3) say(ctx, 'boss_low');
  });
  ctx.bus.on(EVENTS.DISTILL_PROGRESS, ({ value }) => {
    const v = typeof value === 'number' ? value : ctx.distill || 0;
    if (!saidDistill50 && v >= 50 && say(ctx, 'distill_50')) saidDistill50 = true;
  });
  ctx.bus.on(EVENTS.ROLL_START, () => {
    if (Math.random() < 0.22) say(ctx, 'dodge');
  });
  ctx.bus.on(EVENTS.TELEGRAPH_START, ({ attack }) => {
    if (attack === 'judgment' || attack === 'p3_smite') say(ctx, 'smite');
  });
  ctx.bus.on(EVENTS.BOSS_ATTACK, ({ name }) => {
    if (name === 'p3_smite') say(ctx, 'smite');
  });
  ctx.bus.on(EVENTS.ENDING_TRIGGER, ({ id }) => {
    if (id === 'B') say(ctx, 'ending_b');
  });
  ctx.bus.on(EVENTS.STATE_CHANGE, ({ to }) => {
    if (to !== 'fight') {
      activeUntil = 0;
      priority = 0;
      section?.classList.add('is-hidden');
      setStandby();
      ctx.world.setHolo?.('', '');
    }
  });
}

export function update(ctx, dt) {
  void dt;
  const state = ctx.state.current;
  if (state !== 'fight') {
    section?.classList.add('is-hidden');
    return;
  }
  section?.classList.remove('is-hidden');

  const player = ctx.player;
  if (player && player.alive && player.maxHp > 0) {
    const r = player.hp / player.maxHp;
    if (!saidLowHp && r > 0 && r <= 0.28) {
      if (say(ctx, 'low_hp')) saidLowHp = true;
    }
    if (r > 0.35) saidLowHp = false;
  }

  if (activeUntil > 0 && ctx.time.unscaled >= activeUntil) {
    activeUntil = 0;
    priority = 0;
    setStandby();
  }
}

export function reset() {
  said50 = false;
  saidDistill50 = false;
  saidLowHp = false;
  bigFlasks.length = 0;
  activeUntil = 0;
  priority = 0;
  setStandby();
  section?.classList.add('is-hidden');
}