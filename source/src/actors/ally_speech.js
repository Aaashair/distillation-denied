// OWNER: WS3
// Bilingual speech bubbles over ally heads. Event-driven with a 10–18 s cooldown.

import * as THREE from 'three';
import { EVENTS } from '../core/contracts.js';
import { ALLY_LINES, ALLY_SPEECH } from '../data/lines.js';

const SHOW = 2.5;
const CSS_ID = 'ally-bubble-style';
const projectTmp = new THREE.Vector3();

const CSS = `
#ally-bubbles { position: fixed; inset: 0; pointer-events: none; z-index: 3; }
.ally-bubble {
  position: fixed;
  transform: translate(-50%, -110%);
  min-width: 128px;
  max-width: 268px;
  padding: 7px 11px 8px;
  background: linear-gradient(180deg, rgba(18,16,14,0.9), rgba(10,14,20,0.84));
  border: 1px solid rgba(216, 177, 90, 0.78);
  box-shadow: 0 0 14px rgba(216, 177, 90, 0.16);
  color: #f4f1ea;
  text-align: center;
  pointer-events: none;
  border-radius: 2px;
}
.ally-bubble .ally-zh {
  font-size: 13px;
  line-height: 1.35;
  font-weight: 600;
}
.ally-bubble .ally-en {
  margin-top: 3px;
  font-size: 10px;
  letter-spacing: 0.02em;
  color: #d8b15a;
  line-height: 1.3;
  font-style: italic;
}
.ally-bubble.is-hidden { display: none; }
`;

function pickFrom(pool) {
  if (!pool || !pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function nextCooldown() {
  return 10 + Math.random() * 8;
}

export function injectStyle() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(CSS_ID)) return;
  const el = document.createElement('style');
  el.id = CSS_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
}

export function ensureLayer() {
  let layer = document.getElementById('ally-bubbles');
  if (layer) return layer;
  layer = document.createElement('div');
  layer.id = 'ally-bubbles';
  document.body.appendChild(layer);
  return layer;
}

export function makeBubble() {
  const bubble = document.createElement('div');
  bubble.className = 'ally-bubble is-hidden';
  const zh = document.createElement('div');
  zh.className = 'ally-zh';
  const en = document.createElement('div');
  en.className = 'ally-en';
  bubble.append(zh, en);
  ensureLayer().appendChild(bubble);
  return bubble;
}

export function hideBubble(actor) {
  actor.speech = null;
  actor.speechT = 0;
  actor.bubble?.classList.add('is-hidden');
}

/**
 * @param {import('../core/contracts.js').GameContext} ctx
 * @param {object} actor
 * @param {{zh:string, en:string, vo?:string}} line
 * @param {{force?: boolean}} [opts]
 */
export function say(ctx, actor, line, opts = {}) {
  if (!actor || !line) return false;
  if (!opts.force && actor.speechCd > 0) return false;
  actor.speech = line;
  actor.speechT = SHOW;
  actor.speechCd = nextCooldown();
  if (actor.bubble) {
    const zh = actor.bubble.querySelector('.ally-zh');
    const en = actor.bubble.querySelector('.ally-en');
    if (zh) zh.textContent = line.zh || '';
    if (en) en.textContent = line.en || '';
    actor.bubble.classList.remove('is-hidden');
  }
  ctx.bus.emit(EVENTS.ALLY_SPEECH, { id: actor.id, text: { zh: line.zh, en: line.en } });
  if (line.vo) ctx.audio?.playSfx(line.vo);
  return true;
}

export function pickLine(id, trigger) {
  const keyed = ALLY_SPEECH[id];
  const specific = keyed && trigger ? keyed[trigger] : null;
  const forceSpecific = trigger === 'down' || trigger === 'revive' || trigger === 'judgment';
  if (specific && specific.length && (forceSpecific || Math.random() < 0.78)) {
    return pickFrom(specific);
  }
  return pickFrom(ALLY_LINES[id] || []);
}

export function trySay(ctx, actor, trigger, opts = {}) {
  if (!actor) return false;
  return say(ctx, actor, pickLine(actor.id, trigger), opts);
}

export function queueSay(actor, trigger, delay) {
  actor.pendingTrigger = trigger;
  actor.pendingT = Math.max(0, delay || 0);
}

export function tickSpeech(ctx, actor, dt) {
  if (actor.speechT > 0) {
    actor.speechT -= dt;
    if (actor.speechT <= 0) hideBubble(actor);
  }
  if (actor.speechCd > 0) actor.speechCd -= dt;
  if (actor.pendingTrigger) {
    actor.pendingT -= dt;
    if (actor.pendingT <= 0) {
      const trig = actor.pendingTrigger;
      actor.pendingTrigger = null;
      const force = trig === 'down' || trig === 'revive' || trig === 'judgment' || trig === 'phase';
      trySay(ctx, actor, trig, { force });
    }
  } else if (actor.alive && actor.speechCd <= 0 && actor.speechT <= 0) {
    if (!trySay(ctx, actor, 'idle', { force: true })) actor.speechCd = nextCooldown();
  }
}

function alliesOf(ctx) {
  return ctx.allies || [];
}

let wired = false;

export function wireSpeech(ctx) {
  if (wired) return;
  wired = true;

  ctx.bus.on(EVENTS.PHASE_CHANGE, () => {
    alliesOf(ctx).forEach((ally, i) => queueSay(ally, 'phase', 0.15 + i * 0.55));
  });

  ctx.bus.on(EVENTS.HIT, (event) => {
    const dst = event?.dst;
    if (!dst || dst.team !== 'ally') return;
    if (!event.applied) return;
    if (!dst.alive) return;
    trySay(ctx, dst, 'hit');
  });

  ctx.bus.on(EVENTS.FLASK_USED, () => {
    const living = alliesOf(ctx).filter((a) => a.alive);
    if (!living.length) return;
    const who = living[Math.floor(Math.random() * living.length)];
    trySay(ctx, who, 'flask');
  });

  ctx.bus.on(EVENTS.TELEGRAPH_START, ({ attack }) => {
    const name = String(attack || '').toLowerCase();
    if (name !== 'judgment' && name !== 'p3_smite' && name !== 'smite') return;
    alliesOf(ctx).forEach((ally, i) => queueSay(ally, 'judgment', i * 0.35));
  });

  ctx.bus.on(EVENTS.ALLY_DOWN, ({ id }) => {
    const ally = alliesOf(ctx).find((a) => a.id === id);
    if (ally) trySay(ctx, ally, 'down', { force: true });
  });

  ctx.bus.on(EVENTS.ALLY_REVIVE, ({ id }) => {
    const ally = alliesOf(ctx).find((a) => a.id === id);
    if (ally) trySay(ctx, ally, 'revive', { force: true });
  });
}

export function presentBubbles(ctx) {
  const cam = ctx.camera;
  const fighting = ctx.state?.current === 'fight' || ctx.state?.current === 'paused';
  for (const ally of ctx.allies || []) {
    const bubble = ally.bubble;
    if (!bubble) continue;
    const show = fighting && ally.speech && ally.speechT > 0;
    bubble.classList.toggle('is-hidden', !show);
    if (!show) continue;
    projectTmp.copy(ally.position);
    projectTmp.y += (ally.alive ? ally.height : 0.55) + 0.4;
    projectTmp.project(cam);
    if (projectTmp.z > 1) {
      bubble.classList.add('is-hidden');
      continue;
    }
    bubble.style.left = `${(projectTmp.x * 0.5 + 0.5) * window.innerWidth}px`;
    bubble.style.top = `${(-projectTmp.y * 0.5 + 0.5) * window.innerHeight}px`;
  }
}
