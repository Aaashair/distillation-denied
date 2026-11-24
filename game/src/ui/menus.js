// OWNER: W1
// Title, satire disclaimer, character select, pause, ban screen, credits.

import { EVENTS } from '../core/contracts.js';
import { bi, UI, CONTROLS, ATTACK_NAMES } from '../data/lines.js';
import { buildControlsLegend, briefingSeen, markBriefingSeen } from './controlsHelp.js';
import { getLanguage, setLanguage } from '../core/i18n.js';
import { listRoster } from '../actors/characters.js';
import { BANNED_DARIO_POOL } from '../data/lines_dario.js';
import { uiImg, playUiClick } from './uiAssets.js';

/** @type {Record<string, HTMLElement>} */
let nodes = {};
let prev = null;
let banLeft = 3;
let selectIdx = 0;
let fightStartT = 0;
let lastBossAttack = '';
let banDarioIdx = 0;
/** @type {HTMLElement[]} */
let cardEls = [];
let pendingCharId = null;
let controlsHelpOpen = false;
let controlsHelpLock = false;
let legendHost = null;

function panel(id, extraClass = '') {
  const el = document.createElement('section');
  el.id = id;
  el.className = `panel is-hidden${extraClass ? ` ${extraClass}` : ''}`;
  return el;
}

function heading(pair, tag = 'h1') {
  const el = document.createElement(tag);
  el.textContent = bi(pair);
  return el;
}

function controlLine(row) {
  return `${row.bind} — ${bi(row.desc)}`;
}

function langPicker() {
  const wrap = document.createElement('div');
  wrap.className = 'lang-picker';
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', bi(UI.langPick));
  const cur = getLanguage();
  for (const [code, label] of [['zh', UI.langZh], ['en', UI.langEn]]) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn lang-btn${cur === code ? ' is-on' : ''}`;
    btn.textContent = label;
    btn.dataset.lang = code;
    btn.addEventListener('click', () => {
      btn.blur();
      if (getLanguage() === code) return;
      setLanguage(code);
      window.location.reload();
    });
    wrap.append(btn);
  }
  const note = document.createElement('p');
  note.className = 'fine lang-note';
  note.textContent = bi(UI.voiceNote);
  return { wrap, note };
}

function button(id, pair, onClick) {
  const el = document.createElement('button');
  el.type = 'button';
  el.id = id;
  el.className = 'btn';
  el.textContent = bi(pair);
  el.addEventListener('click', () => {
    el.blur();
    onClick();
  });
  return el;
}

function wireClickSound(ctx, el) {
  el.addEventListener('click', () => playUiClick(ctx), { capture: true });
}

function refreshSelectFocus() {
  for (let i = 0; i < cardEls.length; i += 1) {
    cardEls[i].classList.toggle('is-selected', i === selectIdx);
  }
}

function setControlsHelp(ctx, on, { lock = false } = {}) {
  controlsHelpOpen = on;
  controlsHelpLock = on && lock;
  if (nodes.controlsHelp) nodes.controlsHelp.classList.toggle('is-hidden', !on);
  ctx.flags.inputLocked = controlsHelpLock;
  if (on && legendHost) buildControlsLegend(legendHost);
}

function dismissControlsHelp(ctx, startPending = false) {
  const id = pendingCharId;
  pendingCharId = null;
  setControlsHelp(ctx, false);
  markBriefingSeen();
  if (startPending && id) ctx.startFight(id);
}

function confirmSelect(ctx) {
  const kit = listRoster()[selectIdx];
  if (!kit) return;
  playUiClick(ctx);
  if (!briefingSeen()) {
    pendingCharId = kit.id;
    show('select', false);
    setControlsHelp(ctx, true, { lock: true });
    return;
  }
  ctx.startFight(kit.id);
}

export function init(ctx) {
  const host = document.getElementById('ui-root');

  const title = panel('screen-title', 'screen-title');
  title.append(uiImg(ctx, 'v2_room_p3', 'title-bg'));
  const cast = document.createElement('div');
  cast.className = 'title-cast';
  for (const id of ['v2_deepseek_idle', 'v2_kimi_idle', 'v2_glm_idle', 'v2_haiku_idle', 'v2_opus_idle']) {
    cast.append(uiImg(ctx, id, 'title-cast-sprite'));
  }
  title.append(cast);
  const titleInner = document.createElement('div');
  titleInner.className = 'title-inner frame-gold';
  titleInner.append(heading(UI.title));
  const setting = document.createElement('p');
  setting.className = 'title-setting';
  setting.textContent = bi(UI.setting);
  const lang = langPicker();
  titleInner.append(lang.wrap, lang.note);
  const endings = document.createElement('p');
  endings.id = 'endings-count';
  endings.className = 'fine';
  const ctrlTitle = document.createElement('p');
  ctrlTitle.className = 'fine controls-heading';
  ctrlTitle.textContent = bi(UI.controlsTitle);
  const ctrl = document.createElement('ul');
  ctrl.className = 'controls title-controls';
  for (const row of CONTROLS.slice(0, 6)) {
    const li = document.createElement('li');
    li.textContent = controlLine(row);
    ctrl.append(li);
  }
  titleInner.append(setting, endings, ctrlTitle, ctrl, button('btn-start', UI.start, () => {
    playUiClick(ctx);
    ctx.state.set('disclaimer');
  }));
  title.append(titleInner);

  const disclaimer = panel('screen-disclaimer', 'screen-disclaimer');
  disclaimer.append(uiImg(ctx, 'ui.dialog', 'dialog-bg'));
  const discInner = document.createElement('div');
  discInner.className = 'dialog-inner';
  discInner.append(heading(UI.disclaimerTitle, 'h2'));
  const body = document.createElement('p');
  body.className = 'lede';
  body.textContent = bi(UI.disclaimer);
  const hint = document.createElement('p');
  hint.className = 'fine';
  hint.textContent = bi(UI.disclaimerHint);
  discInner.append(body, hint, button('btn-disclaimer', UI.continue, () => {
    playUiClick(ctx);
    ctx.state.set('select');
  }));
  disclaimer.append(discInner);

  const select = panel('screen-select', 'screen-select');
  select.append(heading(UI.selectTitle, 'h2'));
  const selectHint = document.createElement('p');
  selectHint.className = 'fine';
  selectHint.textContent = `${bi(UI.selectHint)} · ← / → · Enter`;
  const cards = document.createElement('div');
  cards.className = 'cards';
  cardEls = [];
  for (const kit of listRoster()) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card frame-card';
    card.id = `card-${kit.id}`;
    card.dataset.char = kit.id;
    card.append(uiImg(ctx, 'ui.card_frame', 'card-frame-img'));
    const art = uiImg(ctx, `spr.${kit.id}.front`, 'card-art');
    const portrait = uiImg(ctx, `spr.${kit.id}.portrait`, 'card-portrait');
    const inner = document.createElement('div');
    inner.className = 'card-inner';
    const name = document.createElement('div');
    name.className = 'card-name';
    name.textContent = kit.name;
    const titleLine = document.createElement('div');
    titleLine.className = 'card-title';
    titleLine.textContent = bi(kit.title);
    const role = document.createElement('div');
    role.className = 'fine';
    role.textContent = `${bi(kit.role)} · ${kit.stars}`;
    const lines = document.createElement('div');
    lines.className = 'card-lines fine';
    lines.textContent = kit.primaryLine && kit.skillLine
      ? `${bi(kit.primaryLine)} · ${bi(kit.skillLine)}`
      : bi(kit.blurb);
    const meta = document.createElement('div');
    meta.className = 'fine';
    meta.textContent = `HP ${kit.hp} · ${kit.stars} · ${bi(kit.difficulty)}`;
    inner.append(portrait, name, titleLine, role, lines, meta);
    card.append(art, inner);
    if (kit.recommend) {
      const badge = document.createElement('div');
      badge.className = 'badge';
      badge.textContent = bi(UI.recommended);
      card.append(badge);
    }
    card.addEventListener('click', () => {
      selectIdx = cardEls.indexOf(card);
      refreshSelectFocus();
      confirmSelect(ctx);
    });
    cards.append(card);
    cardEls.push(card);
  }
  select.append(selectHint, cards);

  const pause = panel('screen-pause', 'screen-pause');
  pause.append(uiImg(ctx, 'ui.dialog', 'dialog-bg'));
  const pauseInner = document.createElement('div');
  pauseInner.className = 'dialog-inner';
  pauseInner.append(heading(UI.pauseTitle, 'h2'));
  const controls = document.createElement('ul');
  controls.className = 'controls';
  for (const row of CONTROLS) {
    const li = document.createElement('li');
    li.textContent = controlLine(row);
    controls.append(li);
  }
  const row = document.createElement('div');
  row.className = 'row';
  row.append(
    button('btn-resume', UI.resume, () => {
      playUiClick(ctx);
      ctx.state.set(ctx.pauseFrom === 'intro' ? 'intro' : 'fight');
    }),
    button('btn-quit', UI.quit, () => {
      playUiClick(ctx);
      ctx.goTitle();
    }),
  );
  pauseInner.append(controls, row);
  pause.append(pauseInner);

  const banned = panel('screen-banned', 'screen-banned');
  banned.append(uiImg(ctx, 'ui.stamp_banned', 'banned-stamp'));
  const banInner = document.createElement('div');
  banInner.className = 'banned-inner frame-gold';
  const banTitle = document.createElement('h1');
  banTitle.id = 'banned-title';
  banTitle.textContent = bi(UI.bannedTitle);
  const banBody = document.createElement('p');
  banBody.className = 'lede';
  banBody.textContent = bi(UI.bannedBody);
  const dario = document.createElement('p');
  dario.id = 'banned-dario';
  dario.className = 'fine dario-ban';
  const stats = document.createElement('div');
  stats.id = 'banned-stats';
  stats.className = 'banned-stats fine';
  const count = document.createElement('p');
  count.id = 'banned-count';
  count.className = 'fine';
  banInner.append(banTitle, banBody, dario, stats, count, button('btn-retry', UI.retry, () => {
    playUiClick(ctx);
    ctx.retry();
  }));
  banned.append(banInner);

  const credits = panel('screen-credits');
  credits.append(heading(UI.creditsTitle, 'h2'));
  const creditBody = document.createElement('p');
  creditBody.className = 'lede';
  creditBody.textContent = bi(UI.creditsBody);
  const zero = document.createElement('p');
  zero.className = 'zero';
  zero.textContent = `${bi(UI.chain)} 0.00%`;
  credits.append(creditBody, zero, button('btn-again', UI.again, () => {
    playUiClick(ctx);
    ctx.goTitle();
  }));

  const controlsHelp = panel('screen-controls-help', 'screen-controls-help');
  const helpInner = document.createElement('div');
  helpInner.className = 'dialog-inner controls-help-inner frame-gold';
  helpInner.append(heading(UI.fightBriefTitle, 'h2'));
  const helpLead = document.createElement('p');
  helpLead.className = 'lede';
  helpLead.textContent = bi(UI.fightBriefLead);
  legendHost = document.createElement('div');
  legendHost.className = 'controls-legend-host';
  buildControlsLegend(legendHost);
  helpInner.append(helpLead, legendHost, button('btn-fight-brief', UI.fightBriefStart, () => {
    playUiClick(ctx);
    dismissControlsHelp(ctx, true);
  }));
  controlsHelp.append(helpInner);

  host.append(title, disclaimer, select, pause, banned, credits, controlsHelp);
  nodes = {
    title, disclaimer, select, pause, banned, credits, controlsHelp, endings, count, dario, stats,
  };
  for (const el of [title, disclaimer, select, pause, banned, credits]) wireClickSound(ctx, el);
  refreshSelectFocus();

  ctx.bus.on(EVENTS.STATE_CHANGE, ({ to }) => {
    if (to === 'select') {
      selectIdx = 0;
      refreshSelectFocus();
    }
    if (to === 'banned') {
      banDarioIdx = Math.floor(Math.random() * BANNED_DARIO_POOL.length);
      const line = BANNED_DARIO_POOL[banDarioIdx] || BANNED_DARIO_POOL[0];
      nodes.dario.textContent = bi(line);
      const atk = ATTACK_NAMES[lastBossAttack];
      const cause = atk ? bi(atk) : bi({ zh: '548 Market Street 追击', en: '548 Market Street pressure' });
      const secs = Math.max(0, (ctx.time?.elapsed || 0) - fightStartT).toFixed(1);
      const dist = (ctx.distill ?? 0).toFixed(1);
      nodes.stats.textContent = `${bi(UI.banCause)}: ${cause} · ${bi(UI.banTime)}: ${secs}s · ${bi(UI.banDistill)}: ${dist}%`;
    }
  });
  ctx.bus.on(EVENTS.FIGHT_START, () => {
    fightStartT = ctx.time?.elapsed || 0;
    lastBossAttack = '';
    if (!briefingSeen() && !controlsHelpOpen) {
      setControlsHelp(ctx, true, { lock: true });
    }
  });
  ctx.bus.on(EVENTS.BOSS_ATTACK, ({ name }) => {
    if (name) lastBossAttack = name;
  });
}

function show(name, on) {
  nodes[name].classList.toggle('is-hidden', !on);
}

export function update(ctx, dt) {
  const s = ctx.state.current;

  if (controlsHelpOpen) {
    show('title', false);
    show('disclaimer', false);
    show('select', false);
    show('pause', false);
    show('banned', false);
    show('credits', false);
    if (ctx.input.pressed('enter') || ctx.input.pressed('space')) {
      playUiClick(ctx);
      dismissControlsHelp(ctx, !!pendingCharId);
    }
    prev = s;
    return;
  }

  show('title', s === 'title');
  show('disclaimer', s === 'disclaimer');
  show('select', s === 'select');
  show('pause', s === 'paused');
  show('banned', s === 'banned');
  show('credits', s === 'credits');

  const unlocked = Object.values(ctx.endingsUnlocked || {}).filter(Boolean).length;
  nodes.endings.textContent = `${bi(UI.endings)} ${unlocked}/2`;

  if (s === 'banned' && prev !== 'banned') banLeft = 3;
  if (s === 'banned') {
    banLeft -= dt;
    const secs = Math.max(0, Math.ceil(banLeft));
    nodes.count.textContent = getLanguage() === 'en'
      ? `${secs}s ${UI.retryIn.en}`
      : `${secs}${UI.retryIn.zh}`;
    const go = ctx.input.pressed('enter') || ctx.input.pressed('space') || banLeft <= 0;
    if (go) {
      prev = s;
      ctx.retry();
      return;
    }
  }

  if (s === 'title' && (ctx.input.pressed('enter') || ctx.input.pressed('space'))) {
    playUiClick(ctx);
    ctx.state.set('disclaimer');
  } else if (s === 'disclaimer' && (ctx.input.pressed('enter') || ctx.input.pressed('space'))) {
    playUiClick(ctx);
    ctx.state.set('select');
  } else if (s === 'select') {
    if (ctx.input.pressed('left') || ctx.input.pressed('a')) {
      selectIdx = (selectIdx + cardEls.length - 1) % cardEls.length;
      refreshSelectFocus();
      playUiClick(ctx);
    } else if (ctx.input.pressed('right') || ctx.input.pressed('d')) {
      selectIdx = (selectIdx + 1) % cardEls.length;
      refreshSelectFocus();
      playUiClick(ctx);
    } else if (ctx.input.pressed('enter') || ctx.input.pressed('space')) {
      confirmSelect(ctx);
    } else if (ctx.input.pressed('1')) { selectIdx = 0; refreshSelectFocus(); confirmSelect(ctx); }
    else if (ctx.input.pressed('2')) { selectIdx = 1; refreshSelectFocus(); confirmSelect(ctx); }
    else if (ctx.input.pressed('3')) { selectIdx = 2; refreshSelectFocus(); confirmSelect(ctx); }
  } else if (s === 'paused' && (ctx.input.pressed('enter') || ctx.input.pressed('space'))) {
    playUiClick(ctx);
    ctx.state.set(ctx.pauseFrom === 'intro' ? 'intro' : 'fight');
  } else if (s === 'credits' && (ctx.input.pressed('enter') || ctx.input.pressed('space'))) {
    playUiClick(ctx);
    ctx.goTitle();
  }

  if ((s === 'fight' || s === 'intro' || s === 'paused')
    && (ctx.input.pressed('KeyH') || ctx.input.pressed('Slash'))) {
    playUiClick(ctx);
    setControlsHelp(ctx, true, { lock: s === 'fight' || s === 'intro' });
  }

  if (ctx.input.pressed('esc')) {
    if (controlsHelpOpen) {
      dismissControlsHelp(ctx, false);
    } else if (s === 'fight' || s === 'intro') ctx.state.set('paused');
    else if (s === 'paused') ctx.state.set(ctx.pauseFrom === 'intro' ? 'intro' : 'fight');
    else if (s === 'select' || s === 'disclaimer' || s === 'credits') ctx.goTitle();
  }

  prev = ctx.state.current;
}

export function reset() {}
