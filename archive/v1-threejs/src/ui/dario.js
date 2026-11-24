// OWNER: WS4
// Event-driven hologram lines. VOICE_LINES + lines_dario extras; vo.* via playSfx.

import { EVENTS } from '../core/contracts.js';
import { NAMES } from '../data/lines.js';
import { VOICE_LINES } from '../config/assets.generated.js';
import {
  DARIO_EVENT_MAP,
  DARIO_EXTRA,
  DARIO_PORTRAIT,
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
  flask_spam: 50,
  boss_50: 50,
  perfect_guard: 20,
  ally_down: 15,
};

const PORTRAIT_TONE = {
  angry: 'spr.dario.angry',
  smug: 'spr.dario.smug',
  holo: 'spr.dario.holo',
};

/** @type {Record<string, {id?: string, zh: string, en: string, tone?: string}[]>} */
const POOLS = {};

for (const row of VOICE_LINES) {
  if (row.speaker !== 'director') continue;
  const key = DARIO_EVENT_MAP[row.event] || row.event;
  if (!POOLS[key]) POOLS[key] = [];
  POOLS[key].push({ id: row.id, zh: row.zh, en: row.en, tone: 'holo' });
}
for (const [key, extras] of Object.entries(DARIO_EXTRA)) {
  if (!POOLS[key]) POOLS[key] = [];
  for (const line of extras) POOLS[key].push(line);
}

let bar;
let zhEl;
let enEl;
let portrait;
let activeUntil = 0;
let priority = 0;
let lastGlobal = -999;
/** @type {Record<string, number>} */
const lastEvent = {};
let said50 = false;
/** @type {number[]} */
const bigFlasks = [];

function portraitId(eventKey, line) {
  const tone = line.tone || 'holo';
  if (tone && PORTRAIT_TONE[tone]) return PORTRAIT_TONE[tone];
  return DARIO_PORTRAIT[eventKey] || 'spr.dario.holo';
}

function setPortrait(ctx, assetId) {
  const path = ctx.assets.get(assetId);
  if (!path) {
    portrait.classList.add('is-missing');
    portrait.removeAttribute('src');
    return;
  }
  portrait.classList.remove('is-missing');
  if (portrait.dataset.id !== assetId) {
    portrait.dataset.id = assetId;
    portrait.src = path;
  }
}

/**
 * @param {import('../core/contracts.js').GameContext} ctx
 * @param {string} eventKey
 * @param {{id?: string, zh: string, en: string, tone?: string}} line
 * @param {number} pri
 */
function show(ctx, eventKey, line, pri) {
  const now = ctx.time.unscaled;
  zhEl.textContent = line.zh;
  enEl.textContent = line.en;
  setPortrait(ctx, portraitId(eventKey, line));
  bar.classList.remove('is-hidden');
  activeUntil = now + 3.6;
  priority = pri;
  lastGlobal = now;
  lastEvent[eventKey] = now;
  ctx.world.setHolo?.(line.zh, line.en);
  // Ending B's shot list plays vo.dario_ending_b_trigger itself.
  if (line.id && eventKey !== 'ending_b') ctx.audio?.playSfx(`vo.${line.id}`);
  ctx.bus.emit(EVENTS.DARIO_LINE, {
    event: eventKey,
    text: { zh: line.zh, en: line.en },
    priority: pri,
    vo: line.id ? `vo.${line.id}` : null,
  });
}

/** @param {import('../core/contracts.js').GameContext} ctx @param {string} eventKey */
function say(ctx, eventKey) {
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
  bar = document.createElement('div');
  bar.id = 'dario-bar';
  bar.className = 'is-hidden';
  portrait = uiImg(ctx, 'spr.dario.holo', 'dario-portrait');
  const body = document.createElement('div');
  body.className = 'dario-body';
  const who = document.createElement('div');
  who.className = 'dario-who';
  who.textContent = NAMES.director || 'Dario';
  zhEl = document.createElement('div');
  zhEl.className = 'dario-zh';
  enEl = document.createElement('div');
  enEl.className = 'dario-en';
  body.append(who, zhEl, enEl);
  bar.append(portrait, body);
  document.getElementById('ui-root').appendChild(bar);

  ctx.bus.on(EVENTS.FIGHT_START, () => {
    said50 = false;
    bigFlasks.length = 0;
    say(ctx, 'fight_start');
  });
  ctx.bus.on(EVENTS.PHASE_CHANGE, ({ phase }) => {
    if (phase === 2) say(ctx, 'phase2');
    if (phase === 3) say(ctx, 'phase3');
  });
  ctx.bus.on(EVENTS.FLASK_USED, ({ type }) => {
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
    if (to === 'title') {
      bar.classList.add('is-hidden');
      ctx.world.setHolo?.(NAMES.director, 'HOLO');
    }
  });
}

export function update(ctx, dt) {
  void dt;
  const state = ctx.state.current;
  if (state === 'theater' || state === 'credits') {
    bar.classList.add('is-hidden');
    return;
  }
  if (activeUntil > 0 && ctx.time.unscaled >= activeUntil) {
    activeUntil = 0;
    priority = 0;
    bar.classList.add('is-hidden');
  }
}

export function reset() {
  said50 = false;
  bigFlasks.length = 0;
  activeUntil = 0;
  priority = 0;
  bar?.classList.add('is-hidden');
}
