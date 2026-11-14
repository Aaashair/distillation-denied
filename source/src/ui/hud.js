// OWNER: WS4
// Fight HUD: bars, flasks, boss phase, distill lie, lock reticle, policy silence, vignette.

import { EVENTS } from '../core/contracts.js';
import { bi, UI, NAMES, FLASK_NAMES, BANNERS } from '../data/lines.js';
import { FLASK_ORDER, FLASKS } from '../config/balance_player.js';
import { ENDING_B_RATIO } from '../config/balance_boss.js';
import { HUD_POLICY } from '../data/lines_dario.js';
import { uiImg } from './uiAssets.js';

let root;
let playerFill;
let stamFill;
let bossFill;
let bossName;
let bossPhase;
let distillEl;
let bannerEl;
let bannerTimer = 0;
let flaskRow;
let lockEl;
let reticle;
let controlsCard;
let policyEl;
let vignette;
let hintTimer = 60;
let distillShown = 0;

function pct(el, ratio) {
  const n = Math.max(0, Math.min(1, ratio || 0));
  if (el) el.style.width = `${n * 100}%`;
}

function phaseSubtitle(phase) {
  const tag = BANNERS[phase];
  if (tag) return `${tag.zh} / ${tag.en}`;
  return NAMES.boss[phase - 1] || '';
}

export function init(ctx) {
  root = document.createElement('div');
  root.id = 'hud';
  root.className = 'is-hidden';
  root.innerHTML = `
    <div id="hp-vignette" class="hp-vignette" aria-hidden="true"></div>
    <div class="hud-player hud-frame">
      <div class="hud-player-top">
        <div id="hud-portrait-slot"></div>
        <div class="hud-player-bars">
          <div class="hud-label" id="hud-player-name"></div>
          <div class="bar bar-hp" data-bar="hp">
            <div class="bar-fill" id="player-hp-fill"></div>
          </div>
          <div class="bar bar-stam" data-bar="stamina">
            <div class="bar-fill" id="player-stam-fill"></div>
          </div>
        </div>
      </div>
      <div id="flask-row" class="flask-row"></div>
      <div class="flask-hint fine">R · ${bi({ zh: '插卡', en: 'INSERT GPU' })}</div>
    </div>
    <div class="hud-boss hud-frame">
      <div class="hud-label" id="boss-name"></div>
      <div class="hud-label fine" id="boss-phase"></div>
      <div class="bar bar-boss">
        <div class="bar-fill" id="boss-hp-fill"></div>
        <div id="boss-hp-tick" title="${bi(UI.tick)}"></div>
      </div>
      <div id="distill-readout" class="distill-readout"></div>
    </div>
    <div id="phase-banner" class="phase-banner is-hidden"></div>
    <div id="policy-status" class="policy-status is-hidden"></div>
    <div id="lock-reticle" class="lock-reticle is-hidden"></div>
    <div id="controls-card" class="controls-card"></div>
    <div id="hud-lock" class="hud-lock"></div>
  `;
  document.getElementById('ui-root').appendChild(root);

  const portraitSlot = root.querySelector('#hud-portrait-slot');
  portraitSlot.replaceWith(uiImg(ctx, 'spr.glm.portrait', 'hud-portrait'));
  const portrait = root.querySelector('.hud-portrait');
  portrait.id = 'hud-portrait';

  const hpBar = root.querySelector('[data-bar="hp"]');
  hpBar.prepend(uiImg(ctx, 'icon.hp', 'bar-icon'));
  const stBar = root.querySelector('[data-bar="stamina"]');
  stBar.prepend(uiImg(ctx, 'icon.stamina', 'bar-icon'));

  const distillRow = root.querySelector('#distill-readout');
  const distillIcon = uiImg(ctx, 'icon.distill', 'distill-icon');
  distillRow.append(distillIcon, document.createElement('span'));
  distillRow.lastElementChild.id = 'distill-value';

  playerFill = root.querySelector('#player-hp-fill');
  stamFill = root.querySelector('#player-stam-fill');
  bossFill = root.querySelector('#boss-hp-fill');
  bossName = root.querySelector('#boss-name');
  bossPhase = root.querySelector('#boss-phase');
  distillEl = root.querySelector('#distill-value');
  bannerEl = root.querySelector('#phase-banner');
  flaskRow = root.querySelector('#flask-row');
  lockEl = root.querySelector('#hud-lock');
  reticle = root.querySelector('#lock-reticle');
  reticle.append(uiImg(ctx, 'icon.lockon', 'reticle-icon'));
  controlsCard = root.querySelector('#controls-card');
  policyEl = root.querySelector('#policy-status');
  vignette = root.querySelector('#hp-vignette');
  policyEl.textContent = bi(HUD_POLICY);

  controlsCard.innerHTML = `
    <div class="controls-card-title">${bi(UI.controlsTitle)}</div>
    <div class="controls-card-body">${bi(UI.hint)}</div>
  `;

  root.querySelector('#boss-hp-tick').style.left = `${ENDING_B_RATIO * 100}%`;

  ctx.bus.on(EVENTS.BANNER, ({ zh, en }) => {
    bannerEl.textContent = `${zh} / ${en}`;
    bannerEl.classList.remove('is-hidden');
    bannerTimer = 2.4;
    ctx.audio.playSfx('sfx.banner');
  });
  ctx.bus.on(EVENTS.ENDING_TRIGGER, ({ id }) => {
    if (id === 'B') root.querySelector('#boss-hp-tick').classList.add('is-broken');
  });
  ctx.bus.on(EVENTS.DISTILL_PROGRESS, ({ value }) => {
    if (typeof value === 'number') distillShown = value;
  });
  ctx.bus.on(EVENTS.FIGHT_START, () => {
    hintTimer = 60;
    controlsCard.classList.remove('is-faded');
    distillShown = ctx.distill || 0;
  });
  ctx.bus.on(EVENTS.FIGHT_RESET, () => {
    hintTimer = 60;
    controlsCard.classList.remove('is-faded');
    root.querySelector('#boss-hp-tick')?.classList.remove('is-broken');
  });
}

export function update(ctx, dt) {
  const s = ctx.state.current;
  const show = s === 'fight' || s === 'paused';
  root.classList.toggle('is-hidden', !show);
  if (bannerTimer > 0) {
    bannerTimer -= dt;
    if (bannerTimer <= 0) bannerEl.classList.add('is-hidden');
  }
  if (show && hintTimer > 0) {
    hintTimer -= dt;
    if (hintTimer <= 0) controlsCard.classList.add('is-faded');
  }
  if (!show) return;

  const player = ctx.player;
  const boss = ctx.boss;
  const portrait = root.querySelector('#hud-portrait');

  if (player) {
    const pid = player.id || 'deepseek';
    const want = `spr.${pid}.portrait`;
    if (portrait && portrait.dataset.id !== want) {
      const path = ctx.assets.get(want);
      portrait.dataset.id = want;
      if (path) portrait.src = path;
    }
    root.querySelector('#hud-player-name').textContent = `${NAMES.players[player.id] || player.id} · ${bi(UI.playerHp)} ${Math.ceil(player.hp)} · ${bi(UI.stamina)} ${Math.ceil(player.stamina)}`;
    pct(playerFill, player.hp / player.maxHp);
    pct(stamFill, player.stamina / player.staminaMax);

    const flagLeft = Number(ctx.flags?.skillSilence) || 0;
    const until = Number(ctx.flags?.skillSilenceUntil) || 0;
    const byClock = until > (ctx.time?.elapsed || 0) ? until - ctx.time.elapsed : 0;
    const silenced = flagLeft > 0 || byClock > 0 || !!ctx.flags?.contentPolicySilence
      || Number(player.skillSilenced || 0) > 0;
    policyEl.classList.toggle('is-hidden', !silenced);

    const hpRatio = player.hp / player.maxHp;
    vignette.style.opacity = hpRatio < 0.3 ? String((0.3 - hpRatio) / 0.3 * 0.85) : '0';

    flaskRow.replaceChildren();
    for (let i = 0; i < FLASK_ORDER.length; i += 1) {
      const id = FLASK_ORDER[i];
      const spec = FLASKS[id];
      const slot = document.createElement('div');
      slot.className = 'flask' + (player.flaskId === id ? ' is-on' : '');
      slot.title = FLASK_NAMES[id];
      const icon = uiImg(ctx, spec.icon || `icon.${id}`, 'flask-icon');
      const count = document.createElement('span');
      count.className = 'flask-count';
      count.textContent = String(player.charges[id] ?? 0);
      const key = document.createElement('span');
      key.className = 'flask-key';
      key.textContent = String(i + 1);
      slot.append(icon, count, key);
      flaskRow.appendChild(slot);
    }
  }

  if (boss) {
    const ratio = boss.hp / boss.maxHp;
    bossName.textContent = `${bi(UI.bossHp)} · ${NAMES.boss[boss.phase - 1] || ''}`;
    bossPhase.textContent = phaseSubtitle(boss.phase);
    pct(bossFill, ratio);
    const shown = distillShown || ctx.distill || Math.min(92, (1 - ratio) * 120);
    ctx.distill = shown;
    distillEl.textContent = `${bi(UI.distill)} ${shown.toFixed(1)}%`;
  }

  const locked = !!ctx.lockOn;
  lockEl.textContent = locked ? bi(UI.lockOn) : bi(UI.lockOff);
  reticle.classList.toggle('is-hidden', !locked || s !== 'fight');
}

export function reset(ctx) {
  bannerTimer = 0;
  hintTimer = 60;
  distillShown = 0;
  bannerEl?.classList.add('is-hidden');
  controlsCard?.classList.remove('is-faded');
  root?.querySelector('#boss-hp-tick')?.classList.remove('is-broken');
  void ctx;
}
