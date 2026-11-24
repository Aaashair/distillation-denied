// OWNER: W4
// Claude combat captions/toasts — event-driven, cooldown 8–12s, selected language only.

import { EVENTS, GAME_STATES } from '../core/contracts.js';
import { bi } from '../data/lines.js';
import { pickClaudeLine } from '../data/lines_claude.js';
import { onLanguageChange, getLanguage } from '../core/i18n.js';

const COOLDOWN_MIN = 8;
const COOLDOWN_MAX = 12;
const NEAR_DIST = 88;
const LOW_HP_RATIO = 0.42;
const CAPTION_LIFE = 3.4;

let root = null;
let captionEl = null;
let attackToast = null;
let styleLinked = false;

/** @type {import('../core/bus.js').Bus|null} */
let bus = null;

let cooldownUntil = 0;
/** @type {Set<string>} */
const usedLines = new Set();
let captionHideAt = 0;
let lastLineKey = '';

function linkStylesheet() {
  if (styleLinked || typeof document === 'undefined') return;
  styleLinked = true;
  const href = 'css/claude.css';
  if ([...document.styleSheets].some((s) => s.href && s.href.includes('claude.css'))) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function ensureDom() {
  if (typeof document === 'undefined') return;
  linkStylesheet();
  root = document.getElementById('ui-root');
  if (!root) return;
  if (!captionEl) {
    captionEl = document.createElement('div');
    captionEl.id = 'claude-combat-caption';
    captionEl.setAttribute('aria-live', 'polite');
    root.appendChild(captionEl);
  }
  if (!attackToast) {
    attackToast = document.createElement('div');
    attackToast.id = 'claude-attack-toast';
    attackToast.hidden = true;
    root.appendChild(attackToast);
  }
}

function now(ctx) {
  return ctx?.time?.elapsed ?? 0;
}

function rollCooldown(ctx) {
  const gap = COOLDOWN_MIN + Math.random() * (COOLDOWN_MAX - COOLDOWN_MIN);
  cooldownUntil = now(ctx) + gap;
}

function canSpeak(ctx) {
  if (ctx.state?.current !== GAME_STATES.FIGHT) return false;
  if (!ctx.boss || !ctx.boss.alive || ctx.boss._ended) return false;
  return now(ctx) >= cooldownUntil;
}

function showCaption(text) {
  if (!captionEl || !text) return;
  captionEl.textContent = text;
  captionEl.classList.add('is-visible');
  captionHideAt = performance.now() + CAPTION_LIFE * 1000;
}

function hideCaptionSoon() {
  if (!captionEl) return;
  if (performance.now() >= captionHideAt) {
    captionEl.classList.remove('is-visible');
    captionEl.textContent = '';
  }
}

function showAttackLabel(pair) {
  if (!attackToast || !pair) return;
  attackToast.hidden = false;
  attackToast.textContent = bi(pair);
}

function hideAttackLabel() {
  if (!attackToast) return;
  attackToast.hidden = true;
  attackToast.textContent = '';
}

/**
 * @param {object} ctx
 * @param {'phase'|'attack'|'near'|'lowhp'} trigger
 * @param {{force?:boolean}} [opts]
 */
export function tryCombatLine(ctx, trigger, opts = {}) {
  if (!combatUiAllowed(ctx?.state?.current)) return null;
  if (!opts.force && !canSpeak(ctx)) return null;
  const line = pickClaudeLine(trigger, usedLines);
  if (!line) return null;
  const text = bi(line);
  const key = `${trigger}:${line.zh}`;
  if (!opts.force && key === lastLineKey) return null;
  lastLineKey = key;
  showCaption(text);
  rollCooldown(ctx);
  if (ctx.claudeCombat) {
    ctx.claudeCombat.lastLine = { trigger, zh: line.zh, en: line.en, text, at: now(ctx) };
    ctx.claudeCombat.lineCount = (ctx.claudeCombat.lineCount || 0) + 1;
  }
  return line;
}

function onPhaseChange(ctx) {
  tryCombatLine(ctx, 'phase');
}

function onBossAttack(ctx, payload) {
  if (!combatUiAllowed(ctx.state?.current)) return;
  if (payload?.name) showAttackLabel(payload.name);
  tryCombatLine(ctx, 'attack');
}

function combatUiAllowed(state) {
  return state === GAME_STATES.FIGHT;
}

function onStateChange(ctx, { to }) {
  if (!combatUiAllowed(to)) clear(ctx);
}

function onFightExit(ctx) {
  clear(ctx);
}

function tickProximity(ctx) {
  const boss = ctx.boss;
  const player = ctx.player;
  if (!boss || !player || !player.alive) return;
  const d = Math.hypot(player.x - boss.x, player.y - boss.y);
  if (d <= NEAR_DIST) tryCombatLine(ctx, 'near');
}

function tickLowHp(ctx) {
  const boss = ctx.boss;
  if (!boss || boss.maxHp <= 0) return;
  if (boss.hp / boss.maxHp <= LOW_HP_RATIO) tryCombatLine(ctx, 'lowhp');
}

export function init(ctx) {
  bus = ctx.bus;
  ensureDom();
  ctx.claudeCombat = ctx.claudeCombat || {
    lastLine: null,
    lineCount: 0,
    cooldownUntil: 0,
  };

  const bind = (ev, fn) => ctx.bus.on(ev, (payload) => fn(payload));

  bind(EVENTS.PHASE_CHANGE, () => onPhaseChange(ctx));
  bind(EVENTS.PHASE_TRANSITION_END, () => onPhaseChange(ctx));
  bind(EVENTS.BOSS_ATTACK, (p) => onBossAttack(ctx, p));
  bind(EVENTS.STATE_CHANGE, (p) => onStateChange(ctx, p));
  bind(EVENTS.FIGHT_START, () => {
    usedLines.clear();
    lastLineKey = '';
    cooldownUntil = 0;
    hideAttackLabel();
    if (captionEl) {
      captionEl.classList.remove('is-visible');
      captionEl.textContent = '';
    }
    captionHideAt = 0;
  });
  bind(EVENTS.FIGHT_RESET, () => onFightExit(ctx));
  bind(EVENTS.PAUSE, () => clear(ctx));
  bind(EVENTS.ENDING_TRIGGER, () => clear(ctx));

  onLanguageChange(() => {
    if (!combatUiAllowed(ctx.state?.current)) { clear(ctx); return; }
    if (ctx.claudeCombat?.lastLine) {
      const L = ctx.claudeCombat.lastLine;
      showCaption(bi({ zh: L.zh, en: L.en }));
    }
  });
}

export function update(ctx, dt) {
  if (!ctx || !combatUiAllowed(ctx.state?.current)) {
    if (captionEl?.classList.contains('is-visible')) {
      captionEl.classList.remove('is-visible');
      captionEl.textContent = '';
    }
    hideAttackLabel();
    captionHideAt = 0;
    return;
  }
  const step = dt > 0 ? dt : 0;
  if (step > 0) {
    tickProximity(ctx, step);
    tickLowHp(ctx);
  }
  if (ctx.boss?.callout?.life <= 0) hideAttackLabel();
  if (ctx.claudeCombat) {
    ctx.claudeCombat.cooldownUntil = cooldownUntil;
  }
  hideCaptionSoon();
}

export function clear(ctx) {
  usedLines.clear();
  lastLineKey = '';
  cooldownUntil = 0;
  captionHideAt = 0;
  hideAttackLabel();
  if (captionEl) {
    captionEl.classList.remove('is-visible');
    captionEl.textContent = '';
  }
  if (ctx?.claudeCombat) {
    ctx.claudeCombat.lastLine = null;
    ctx.claudeCombat.cooldownUntil = 0;
  }
}

/** Force-roll until a mandatory zh needle appears (debug / e2e only). */
export function forceMandatoryLine(ctx, needleZh) {
  const cap = needleZh || '';
  for (let i = 0; i < 20; i += 1) {
    const line = tryCombatLine(ctx, 'attack', { force: true });
    if (line?.zh?.includes(cap)) return line;
  }
  return null;
}

export function domIds() {
  return { caption: 'claude-combat-caption', attackToast: 'claude-attack-toast' };
}