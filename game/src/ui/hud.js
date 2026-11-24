// OWNER: W1
// Fight HUD — left vertical sidebar (outside canvas) + boss bar on canvas top.

import { EVENTS } from '../core/contracts.js';
import { bi, UI, NAMES, FLASK_NAMES, BANNERS, ATTACK_NAMES, CONTROLS } from '../data/lines.js';
import { getLanguage } from '../core/i18n.js';
import { FLASK_ORDER, FLASKS, ENDING_B_RATIO, ROLL, PLAYER, SILENCE_LABEL } from '../config/balance.js';
import { HUD_POLICY } from '../data/lines_dario.js';
import { KIT_TEXT } from '../actors/characters.js';
import { uiImg } from './uiAssets.js';
import { buildSidebarControls } from './controlsHelp.js';
import { onLanguageChange } from '../core/i18n.js';

let root;
let fightBlock;
let introBlock;
let playerFill;
let hpNumeric;
let skillNameEl;
let skillStatusEl;
let skillFill;
let bossFill;
let bossName;
let bossPhase;
let distillEl;
let bannerEl;
let bannerTimer = 0;
let gpuGrid;
let policyEl;
let vignette;
let hintTimer = 60;
let distillShown = 0;
let attackEl;
let attackTimer = 0;
let bossTopEl;
let bossArenaEl;
let distillLabelEl;
let claudeStandbyEl;
let sidebarScrollEl;

const ICON_DISTILL = ['v2_icon_distill', 'icon.distill'];
const FLASK_ICON = {
  rtx5090: ['v2_gpu_5090', 'icon.rtx5090'],
  h200: ['v2_gpu_h200', 'icon.h200'],
  b200: ['v2_gpu_b200', 'icon.b200'],
};

const GPU_CD_LABEL = { rtx5090: 5, h200: 10, b200: 20 };

function healPct(id) {
  const h = FLASKS[id]?.heal ?? 0;
  return `${Math.round(h * 100)}%`;
}

function emptyGpuCooldowns() {
  return { rtx5090: 0, h200: 0, b200: 0 };
}

function gpuCooldowns(player) {
  const raw = player?.gpuCooldowns;
  if (raw && typeof raw === 'object') {
    return {
      rtx5090: Math.max(0, Number(raw.rtx5090) || 0),
      h200: Math.max(0, Number(raw.h200) || 0),
      b200: Math.max(0, Number(raw.b200) || 0),
    };
  }
  return emptyGpuCooldowns();
}

function gpuStatusLabel(left) {
  if (left <= 0.05) return bi(UI.gpuReady);
  const sec = Math.ceil(left);
  return getLanguage() === 'en' ? `${sec}s` : `${sec}秒`;
}

function pct(el, ratio) {
  const n = Math.max(0, Math.min(1, ratio || 0));
  if (el) el.style.width = `${n * 100}%`;
}

function firstAsset(ctx, ids) {
  for (const id of ids) {
    if (ctx.assets.get(id)) return id;
  }
  return ids[ids.length - 1];
}

function phaseSubtitle(phase) {
  const tag = BANNERS[phase];
  if (tag) return bi(tag);
  return NAMES.boss[phase - 1] || '';
}

function skillMaxCd(player) {
  const spec = PLAYER[player?.id];
  return spec?.skill?.cd || 7;
}

function formatHp(player) {
  const hp = Math.max(0, Math.ceil(player.hp));
  const max = player.maxHp;
  return `${hp} / ${max}`;
}

function layoutBossBar() {
  if (!bossTopEl) return;
  const cs = getComputedStyle(document.documentElement);
  const gx = parseFloat(cs.getPropertyValue('--game-x')) || 0;
  const gy = parseFloat(cs.getPropertyValue('--game-y')) || 0;
  const gs = parseFloat(cs.getPropertyValue('--game-scale')) || 1;
  const gw = parseFloat(cs.getPropertyValue('--game-w')) || (640 * gs);
  const bossTop = Math.min(gy + 4, Math.max(gy + 2, gy - 2));
  bossTopEl.style.left = `${gx}px`;
  bossTopEl.style.width = `${gw}px`;
  bossTopEl.style.top = `${bossTop}px`;
  bossTopEl.style.maxHeight = `${Math.max(40 * gs, 36)}px`;
  if (vignette) {
    const floorLeft = gx + 48 * gs;
    const floorTop = gy + 56 * gs;
    vignette.style.left = `${floorLeft}px`;
    vignette.style.top = `${floorTop}px`;
    vignette.style.width = `${384 * gs}px`;
    vignette.style.height = `${208 * gs}px`;
  }
}

export function init(ctx) {
  root = document.createElement('aside');
  root.id = 'hud';
  root.className = 'hud-sidebar is-hidden';
  root.setAttribute('aria-label', 'Combat HUD');

  vignette = document.createElement('div');
  vignette.id = 'hp-vignette';
  vignette.className = 'hp-vignette';
  vignette.setAttribute('aria-hidden', 'true');
  document.body.append(vignette);

  introBlock = document.createElement('div');
  introBlock.className = 'hud-intro-block pixel-panel';
  introBlock.innerHTML = `
    <h2 class="hud-side-title" id="hud-intro-title"></h2>
    <p class="hud-intro-lede" id="hud-intro-lede"></p>
    <ul class="controls hud-intro-controls" id="hud-intro-controls"></ul>
  `;

  fightBlock = document.createElement('div');
  fightBlock.className = 'hud-fight-block';
  fightBlock.innerHTML = `
    <div class="hud-stats-stack">
    <div class="hud-strip-player">
      <div id="hud-portrait-slot" class="hud-portrait-wrap"></div>
      <div class="hud-player-block">
        <div class="hud-row-labels">
          <span class="hud-label-strong" id="hud-player-name"></span>
          <span class="hud-hp-numeric" id="hud-hp-numeric"></span>
        </div>
        <div class="bar bar-hp bar-hp-large" data-bar="hp">
          <div class="bar-fill" id="player-hp-fill"></div>
        </div>
      </div>
    </div>
    <section class="hud-strip-skill" aria-label="Skill">
      <div class="hud-skill-head">
        <span class="hud-label-strong hud-skill-label"><img id="hud-skill-icon" alt="" />${bi(UI.stamina)}</span>
        <span class="hud-skill-key" id="hud-skill-key"></span>
      </div>
      <div class="hud-skill-name" id="hud-skill-name"></div>
      <div class="hud-skill-status" id="hud-skill-status"></div>
      <div class="bar bar-skill bar-skill-large"><div class="bar-fill" id="skill-cd-fill"></div></div>
    </section>
    <section class="hud-strip-gpu" aria-label="GPU">
      <div class="hud-gpu-title">
        <span class="hud-label-strong">${bi(UI.gpuFlask)}</span>
        <span class="hud-gpu-q">${bi(UI.gpuHint)}</span>
      </div>
      <div id="hud-gpu-grid" class="hud-gpu-grid hud-gpu-stack"></div>
    </section>
    <div id="distill-readout" class="distill-readout">
      <span class="distill-label" id="distill-label"></span>
      <span class="distill-value" id="distill-value"></span>
    </div>
    <div id="policy-status" class="policy-status is-hidden"></div>
    </div>
    <div class="hud-sidebar-scroll" id="hud-sidebar-scroll" tabindex="0"
      role="region" aria-labelledby="hud-ctrl-heading"></div>
  `;

  root.append(introBlock, fightBlock);
  document.body.appendChild(root);

  const scroll = fightBlock.querySelector('#hud-sidebar-scroll');
  sidebarScrollEl = scroll;
  scroll.addEventListener('keydown', (event) => {
    const steps = { ArrowDown: 36, ArrowUp: -36, PageDown: scroll.clientHeight * 0.8, PageUp: -scroll.clientHeight * 0.8 };
    if (!['End', 'Home', ...Object.keys(steps)].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation(); // Reading controls must not also fire player shots.
    scroll.scrollTop = event.key === 'End' ? scroll.scrollHeight : event.key === 'Home' ? 0 : scroll.scrollTop + steps[event.key];
  });
  const claudeBlock = document.createElement('section');
  claudeBlock.className = 'hud-comms-block hud-comms-claude';
  const claudeHead = document.createElement('h3');
  claudeHead.className = 'hud-comms-title';
  claudeHead.id = 'hud-claude-heading';
  claudeHead.textContent = bi(UI.claudeCommsTitle);
  const attackToast = document.getElementById('claude-attack-toast') || document.createElement('div');
  attackToast.id = 'claude-attack-toast';
  attackToast.hidden = true;
  const caption = document.getElementById('claude-combat-caption') || document.createElement('div');
  caption.id = 'claude-combat-caption';
  claudeStandbyEl = document.createElement('p');
  claudeStandbyEl.className = 'hud-comms-standby';
  claudeStandbyEl.id = 'claude-standby';
  claudeStandbyEl.textContent = bi(UI.claudeStandby);
  claudeBlock.append(claudeHead, attackToast, caption, claudeStandbyEl);

  const controls = document.createElement('section');
  controls.className = 'hud-side-controls';
  controls.setAttribute('aria-labelledby', 'hud-ctrl-heading');
  const ctrlHead = document.createElement('h3');
  ctrlHead.className = 'hud-comms-title hud-side-ctrl-title';
  ctrlHead.id = 'hud-ctrl-heading';
  ctrlHead.textContent = bi(UI.controlsLegendTitle);
  const quickList = document.createElement('ul');
  quickList.className = 'controls hud-side-ctrl-list';
  quickList.id = 'hud-quick-controls';
  const recall = document.createElement('p');
  recall.className = 'fine hud-side-recall';
  recall.textContent = bi(UI.controlsRecall);
  controls.append(ctrlHead, quickList, recall);
  scroll.append(claudeBlock, controls);
  const scrollHint = document.createElement('div');
  scrollHint.className = 'hud-scroll-hint';
  scrollHint.textContent = bi({zh:'↕ 滚动查看 · H 完整操作',en:'↕ Scroll · H: full controls'});
  fightBlock.append(scrollHint);

  bossTopEl = document.createElement('div');
  bossTopEl.className = 'hud-boss-top pixel-panel';
  bossTopEl.innerHTML = `
    <div class="hud-label hud-boss-arena" id="boss-arena"></div>
    <div class="hud-label hud-boss-name" id="boss-name"></div>
    <div class="hud-label fine hud-boss-phase" id="boss-phase"></div>
    <div class="bar bar-boss">
      <div class="bar-fill" id="boss-hp-fill"></div>
      <div id="boss-hp-tick" title="${bi(UI.tick)}"></div>
    </div>
  `;
  document.body.append(bossTopEl);

  const banner = document.createElement('div');
  banner.id = 'phase-banner';
  banner.className = 'phase-banner is-hidden pixel-panel';
  const attack = document.createElement('div');
  attack.id = 'attack-callout';
  attack.className = 'attack-callout is-hidden pixel-panel';

  const portraitSlot = fightBlock.querySelector('#hud-portrait-slot');
  portraitSlot.append(uiImg(ctx, firstAsset(ctx, ['v2_deepseek_idle', 'spr.glm.portrait']), 'hud-portrait'));

  distillLabelEl = fightBlock.querySelector('#distill-label');
  distillLabelEl.textContent = bi(UI.distill);
  fightBlock.querySelector('#distill-readout').prepend(
    uiImg(ctx, firstAsset(ctx, ICON_DISTILL), 'distill-icon'),
  );

  const introTitle = introBlock.querySelector('#hud-intro-title');
  introTitle.textContent = bi(UI.introTitle);
  introBlock.querySelector('#hud-intro-lede').textContent = bi(UI.introHint);
  const introList = introBlock.querySelector('#hud-intro-controls');
  for (const row of CONTROLS.slice(0, 6)) {
    const li = document.createElement('li');
    li.textContent = `${row.bind} — ${bi(row.desc)}`;
    introList.append(li);
  }

  buildSidebarControls(fightBlock.querySelector('#hud-quick-controls'));

  playerFill = root.querySelector('#player-hp-fill');
  hpNumeric = root.querySelector('#hud-hp-numeric');
  skillNameEl = root.querySelector('#hud-skill-name');
  skillStatusEl = root.querySelector('#hud-skill-status');
  skillFill = root.querySelector('#skill-cd-fill');
  bossFill = bossTopEl.querySelector('#boss-hp-fill');
  bossArenaEl = bossTopEl.querySelector('#boss-arena');
  bossName = bossTopEl.querySelector('#boss-name');
  bossPhase = bossTopEl.querySelector('#boss-phase');
  distillEl = root.querySelector('#distill-value');
  bannerEl = banner;
  attackEl = attack;
  gpuGrid = root.querySelector('#hud-gpu-grid');
  policyEl = root.querySelector('#policy-status');
  policyEl.textContent = bi(HUD_POLICY);
  root.querySelector('#hud-skill-key').textContent = bi(UI.skillKey);

  bossTopEl.querySelector('#boss-hp-tick').style.left = `${ENDING_B_RATIO * 100}%`;

  ctx.bus.on(EVENTS.BANNER, ({ zh, en }) => {
    bannerEl.textContent = bi({ zh, en });
    bannerEl.classList.remove('is-hidden');
    bannerTimer = 2.4;
  });
  ctx.bus.on(EVENTS.ENDING_TRIGGER, ({ id }) => {
    if (id === 'B') bossTopEl.querySelector('#boss-hp-tick').classList.add('is-broken');
  });
  ctx.bus.on(EVENTS.DISTILL_PROGRESS, ({ value }) => {
    if (typeof value === 'number') distillShown = value;
  });
  ctx.bus.on(EVENTS.FIGHT_START, () => {
    hintTimer = 60;
    distillShown = ctx.distill || 0;
  });
  ctx.bus.on(EVENTS.FIGHT_RESET, () => {
    hintTimer = 60;
    bossTopEl.querySelector('#boss-hp-tick')?.classList.remove('is-broken');
  });
  ctx.bus.on(EVENTS.SKILL_SILENCE, () => {
    policyEl.textContent = bi(SILENCE_LABEL);
  });
  onLanguageChange(() => {
    if (distillLabelEl) distillLabelEl.textContent = bi(UI.distill);
    if (claudeStandbyEl) claudeStandbyEl.textContent = bi(UI.claudeStandby);
    const h = document.getElementById('hud-claude-heading');
    if (h) h.textContent = bi(UI.claudeCommsTitle);
    const d = document.getElementById('hud-dario-heading');
    if (d) d.textContent = bi(UI.darioCommsTitle);
    const c = document.getElementById('hud-ctrl-heading');
    if (c) c.textContent = bi(UI.controlsLegendTitle);
    buildSidebarControls(fightBlock.querySelector('#hud-quick-controls'));
  });

  ctx.bus.on(EVENTS.BOSS_ATTACK, ({ id, name }) => {
    const row = (name && typeof name === 'object' && (name.zh || name.en))
      ? name
      : (ATTACK_NAMES[name] || ATTACK_NAMES[id]);
    if (!row) return;
    attackEl.textContent = bi(row);
    attackEl.classList.remove('is-hidden');
    attackTimer = 1.6;
  });
}

export function update(ctx, dt) {
  const s = ctx.state.current;
  const arena = s === 'fight' || s === 'paused' || s === 'intro';
  const hideAll = !arena;
  root.classList.toggle('is-hidden', hideAll);
  bossTopEl.classList.toggle('is-hidden', hideAll || s === 'intro');
  vignette?.classList.toggle('is-hidden', hideAll);
  introBlock.classList.toggle('is-hidden', s !== 'intro');
  fightBlock.classList.toggle('is-hidden', s === 'intro');

  if (bannerTimer > 0) {
    bannerTimer -= dt;
    if (bannerTimer <= 0) bannerEl.classList.add('is-hidden');
  }
  if (attackTimer > 0) {
    attackTimer -= dt;
    if (attackTimer <= 0) attackEl.classList.add('is-hidden');
  }
  if (!arena) return;

  layoutBossBar();

  const player = ctx.player;
  const boss = ctx.boss;
  const portrait = root.querySelector('.hud-portrait');

  if (player && s !== 'intro') {
    const pid = player.id || 'deepseek';
    const want = `v2_${pid}_idle`;
    const fallback = `spr.${pid}.portrait`;
    const assetId = ctx.assets.get(want) ? want : fallback;
    if (portrait && portrait.dataset.id !== assetId) {
      const path = ctx.assets.get(assetId);
      portrait.dataset.id = assetId;
      if (path) portrait.src = path;
    }
    root.querySelector('#hud-player-name').textContent = NAMES.players[player.id] || player.id;
    if (hpNumeric) {
      hpNumeric.textContent = `${bi(UI.hpFmt)} ${formatHp(player)}`;
    }
    pct(playerFill, player.hp / player.maxHp);

    const kit = KIT_TEXT[pid] || KIT_TEXT.deepseek;
    if (skillNameEl) skillNameEl.textContent = bi(kit.skill);
    const skillIcon = root.querySelector('#hud-skill-icon');
    const iconId = `icon.skill_${player.id}`;
    if (skillIcon && skillIcon.dataset.id !== iconId) {
      skillIcon.dataset.id = iconId;
      skillIcon.src = ctx.assets.get(iconId);
    }

    const skillMax = skillMaxCd(player);
    const skillLeft = Math.max(0, player.skillCd || 0);
    const skillReady = Math.max(0, 1 - skillLeft / skillMax);
    pct(skillFill, skillReady);
    if (skillStatusEl) {
      skillStatusEl.textContent = skillLeft <= 0.05
        ? bi(UI.skillReady)
        : `${bi(UI.skillOnCd)} · ${Math.ceil(skillLeft)}${bi(UI.gpuSeconds)}`;
    }

    const flagLeft = Number(ctx.flags?.skillSilence) || 0;
    const until = Number(ctx.flags?.skillSilenceUntil) || 0;
    const byClock = until > (ctx.time?.elapsed || 0) ? until - ctx.time.elapsed : 0;
    const silenced = flagLeft > 0 || byClock > 0 || !!ctx.flags?.contentPolicySilence
      || Number(player.skillSilenced || 0) > 0;
    if (silenced) policyEl.textContent = bi(SILENCE_LABEL);
    policyEl.classList.toggle('is-hidden', !silenced);

    const hpRatio = player.hp / player.maxHp;
    vignette.style.opacity = hpRatio < 0.3 ? String((0.3 - hpRatio) / 0.3 * 0.85) : '0';

    if (gpuGrid) {
      gpuGrid.replaceChildren();
      const cds = gpuCooldowns(player);
      for (let i = 0; i < FLASK_ORDER.length; i += 1) {
        const id = FLASK_ORDER[i];
        const slot = document.createElement('div');
        const left = cds[id] ?? 0;
        const ready = left <= 0.05;
        slot.className = 'gpu-card'
          + (player.flaskId === id ? ' is-on' : '')
          + (ready ? ' is-ready' : ' is-cooldown');
        const tier = FLASK_NAMES[id];
        slot.title = `${tier} · ${GPU_CD_LABEL[id]}s CD · ${bi(UI.healStrength)} ${healPct(id)}`;
        const key = document.createElement('span');
        key.className = 'gpu-key';
        key.textContent = String(i + 1);
        const name = document.createElement('span');
        name.className = 'gpu-name';
        name.textContent = tier;
        const heal = document.createElement('span');
        heal.className = 'gpu-heal';
        heal.textContent = healPct(id);
        heal.title = bi(UI.healStrength);
        const status = document.createElement('span');
        status.className = 'gpu-status';
        status.textContent = gpuStatusLabel(left);
        const icon = uiImg(ctx, firstAsset(ctx, FLASK_ICON[id] || [FLASKS[id].icon]), 'gpu-icon');
        const row = document.createElement('div');
        row.className = 'gpu-row';
        row.append(key, name);
        const meta = document.createElement('div');
        meta.className = 'gpu-meta';
        meta.append(heal, status);
        slot.append(row, meta, icon);
        gpuGrid.appendChild(slot);
      }
    }
  }

  if (boss && s !== 'intro') {
    const ratio = boss.hp / boss.maxHp;
    bossArenaEl.textContent = bi(UI.arenaLocation);
    bossName.textContent = `${NAMES.boss[boss.phase - 1] || ''} · ${bi({ zh: '阶段', en: 'Phase' })} ${boss.phase}/3`;
    bossPhase.textContent = '';
    bossPhase.classList.add('is-hidden');
    pct(bossFill, ratio);
    const shown = distillShown || ctx.distill || Math.min(92, (1 - ratio) * 120);
    ctx.distill = shown;
    distillEl.textContent = `${shown.toFixed(1)}%`;
  }

  const cap = document.getElementById('claude-combat-caption');
  const toast = document.getElementById('claude-attack-toast');
  const hasClaude = !!(cap?.classList.contains('is-visible') && cap.textContent?.trim())
    || !!(toast && !toast.hidden && toast.textContent?.trim());
  if (claudeStandbyEl) claudeStandbyEl.classList.toggle('is-hidden', hasClaude);

  void hintTimer;
}

export function reset(ctx) {
  bannerTimer = 0;
  attackTimer = 0;
  distillShown = 0;
  bannerEl?.classList.add('is-hidden');
  attackEl?.classList.add('is-hidden');
  bossTopEl?.querySelector('#boss-hp-tick')?.classList.remove('is-broken');
  void ctx;
}