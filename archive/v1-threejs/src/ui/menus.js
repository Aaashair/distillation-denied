// OWNER: WS4
// Title, satire disclaimer, character select, pause, ban screen, credits.

import { EVENTS } from '../core/contracts.js';
import { bi, UI, CONTROLS } from '../data/lines.js';
import { listRoster } from '../actors/characters.js';
import { BANNED_DARIO } from '../data/lines_dario.js';
import { uiImg, playUiClick } from './uiAssets.js';

/** @type {Record<string, HTMLElement>} */
let nodes = {};
let prev = null;
let banLeft = 3;
let selectIdx = 0;
/** @type {HTMLElement[]} */
let cardEls = [];

function panel(id, extraClass = '') {
  const el = document.createElement('section');
  el.id = id;
  el.className = `panel is-hidden${extraClass ? ` ${extraClass}` : ''}`;
  return el;
}

function heading(pair, tag = 'h1') {
  const el = document.createElement(tag);
  el.className = 'bi';
  const zh = document.createElement('span');
  zh.className = 'zh';
  zh.textContent = pair.zh;
  const en = document.createElement('span');
  en.className = 'en';
  en.textContent = pair.en;
  el.append(zh, en);
  return el;
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

function confirmSelect(ctx) {
  const kit = listRoster()[selectIdx];
  if (!kit) return;
  playUiClick(ctx);
  ctx.startFight(kit.id);
}

export function init(ctx) {
  const host = document.getElementById('ui-root');

  const title = panel('screen-title', 'screen-title');
  title.append(
    uiImg(ctx, 'bg.title', 'title-bg'),
    uiImg(ctx, 'ui.title_logo', 'title-logo'),
  );
  const titleInner = document.createElement('div');
  titleInner.className = 'title-inner frame-gold';
  titleInner.append(heading(UI.title));
  const tag = document.createElement('p');
  tag.className = 'lede';
  tag.textContent = bi(UI.tagline);
  const fine = document.createElement('p');
  fine.className = 'fine';
  fine.textContent = bi(UI.disclaimer);
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
    li.textContent = `${row.zh} — ${row.en}`;
    ctrl.append(li);
  }
  titleInner.append(tag, fine, endings, ctrlTitle, ctrl, button('btn-start', UI.start, () => {
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
    const blurb = document.createElement('p');
    blurb.className = 'card-blurb';
    blurb.textContent = bi(kit.blurb);
    const meta = document.createElement('div');
    meta.className = 'fine';
    meta.textContent = `HP ${kit.hp} · ${bi(UI.stamina)} ${kit.stamina} · ${bi(kit.difficulty)}`;
    inner.append(portrait, name, titleLine, role, blurb, meta);
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
    li.textContent = `${row.zh} — ${row.en}`;
    controls.append(li);
  }
  const row = document.createElement('div');
  row.className = 'row';
  row.append(
    button('btn-resume', UI.resume, () => {
      playUiClick(ctx);
      ctx.state.set('fight');
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
  dario.className = 'fine dario-ban';
  dario.textContent = bi(BANNED_DARIO);
  const count = document.createElement('p');
  count.id = 'banned-count';
  count.className = 'fine';
  banInner.append(banTitle, banBody, dario, count, button('btn-retry', UI.retry, () => {
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

  host.append(title, disclaimer, select, pause, banned, credits);
  nodes = { title, disclaimer, select, pause, banned, credits, endings, count };
  for (const el of [title, disclaimer, select, pause, banned, credits]) wireClickSound(ctx, el);
  refreshSelectFocus();

  ctx.bus.on(EVENTS.STATE_CHANGE, ({ to }) => {
    if (to === 'select') {
      selectIdx = 0;
      refreshSelectFocus();
    }
  });
}

function show(name, on) {
  nodes[name].classList.toggle('is-hidden', !on);
}

export function update(ctx, dt) {
  const s = ctx.state.current;
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
    nodes.count.textContent = `${secs} ${UI.retryIn.zh} / ${secs} ${UI.retryIn.en}`;
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
    } else if (ctx.input.pressed('1')) ctx.startFight('deepseek');
    else if (ctx.input.pressed('2')) ctx.startFight('kimi');
    else if (ctx.input.pressed('3')) ctx.startFight('glm');
  } else if (s === 'paused' && (ctx.input.pressed('enter') || ctx.input.pressed('space'))) {
    playUiClick(ctx);
    ctx.state.set('fight');
  } else if (s === 'credits' && (ctx.input.pressed('enter') || ctx.input.pressed('space'))) {
    playUiClick(ctx);
    ctx.goTitle();
  }

  if (ctx.input.pressed('esc')) {
    if (s === 'fight') ctx.state.set('paused');
    else if (s === 'paused') ctx.state.set('fight');
    else if (s === 'select' || s === 'disclaimer' || s === 'credits') ctx.goTitle();
  }

  if (ctx.input.pressed('tab') || ctx.input.pressed('mmb')) {
    if (s === 'fight' || s === 'paused') {
      ctx.lockOn = !ctx.lockOn;
      ctx.bus.emit(EVENTS.LOCK_ON, { enabled: ctx.lockOn });
    }
  }

  prev = ctx.state.current;
}

export function reset() {}
