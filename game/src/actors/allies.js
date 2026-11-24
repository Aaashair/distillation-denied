// OWNER: W6
// The two unchosen chasers. Primary fire only, plus a simplified skill pulse
// on ALLY_SKILL_CD. Speech bubbles are DOM; replace the AI, keep spawn().

import { EVENTS } from '../core/contracts.js';
import { facingName } from '../core/input.js';
import { ROSTER } from './characters.js';
import { tickPrimary, tickSkill, allyPulse } from './kits.js';
import { ALLY_SPEECH, bi } from '../data/lines.js';
import {
  ALLY_HP, ALLY_BAND, ALLY_SPEED, ALLY_REVIVE, ALLY_REVIVE_HP, ALLY_P3_HP_SCALE,
  ALLY_SKILL_CD, ALLY_TALK_MIN, ALLY_TALK_MAX, ALLY_DODGE_CHANCE, HURT_R, ROLL, PLAYER,
} from '../config/balance.js';
import { rect as viewRect } from '../render/pixel.js';

function say(ctx, ally, key) {
  if (ctx.state.current !== 'fight' || !ally || ally.talkCd > 0) return;
  const pools = ALLY_SPEECH[ally.id];
  const pool = pools && pools[key];
  if (!pool || pool.length === 0) return;
  const line = pool[Math.floor(Math.random() * pool.length)];
  ally.talkCd = ALLY_TALK_MIN + Math.random() * (ALLY_TALK_MAX - ALLY_TALK_MIN);
  ctx.bus.emit(EVENTS.ALLY_SPEECH, { id: ally.id, text: { zh: line.zh, en: line.en } });
  if (line.vo) ctx.audio?.playSfx(line.vo);
  const host = document.getElementById('ui-root');
  if (!host) return;
  const el = document.createElement('div');
  el.className = 'speech-bubble';
  el.textContent = bi(line);
  const { scale } = viewRect();
  el.style.left = `${Math.round(ally.x * scale)}px`;
  el.style.top = `${Math.round((ally.y - 36) * scale)}px`;
  host.appendChild(el);
  window.setTimeout(() => { el.remove(); }, 2400);
}

function makeAlly(ctx, id, index) {
  const ally = {
    id,
    team: 'ally',
    kitId: id,
    x: index === 0 ? 168 : 312,
    y: 196,
    vx: 0,
    vy: 0,
    r: HURT_R,
    hp: ALLY_HP,
    maxHp: ALLY_HP,
    alive: true,
    invuln: 0,
    facing: 'n',
    sprite: `px.${id}`,
    rolling: false,
    rollT: 0,
    rollX: 0,
    rollY: -1,
    fireCd: 0.2 + index * 0.15,
    skillCd: 3 + index,
    aimX: 0,
    aimY: -1,
    talkCd: 1.5,
    downing: false,
    downT: 0,
    nerfed: false,
    dodgeId: '',
    flash: 0,
    pose: '',
    hurtLog: {},
    charging: false,
    shield: false,
    skillKind: '',
    flaskT: 0,
  };
  ally.onHit = () => say(ctx, ally, 'hit');
  ctx.world?.clamp?.(ally);
  return ally;
}

function dodge(ctx, ally) {
  const api = ctx.world?.telegraph;
  if (!api || ally.rolling) return;
  const teles = api.active ? api.active() : [];
  for (let i = 0; i < teles.length; i += 1) {
    const tele = teles[i];
    if (!api.contains(tele, ally.x, ally.y)) continue;
    if (ally.dodgeId === tele.id) return;
    ally.dodgeId = tele.id;
    if (Math.random() > ALLY_DODGE_CHANCE) return;
    const dx = ally.x - tele.x;
    const dy = ally.y - tele.y;
    const len = Math.hypot(dx, dy) || 1;
    ally.rolling = true;
    ally.rollT = 0;
    ally.rollX = dx / len;
    ally.rollY = dy / len;
    return;
  }
}

function inPlayerLineOfFire(ctx, ally) {
  const p = ctx.player;
  if (!p || !p.alive) return false;
  let ax = p.aimX;
  let ay = p.aimY;
  if ((!ax && !ay) && ctx.input) {
    const aim = ctx.input.aimVector?.(p);
    if (aim) { ax = aim.x; ay = aim.y; }
  }
  if (!ax && !ay) return false;
  const dx = ally.x - p.x;
  const dy = ally.y - p.y;
  const along = dx * ax + dy * ay;
  if (along < 10 || along > 220) return false;
  const perp = Math.abs(-dx * ay + dy * ax);
  return perp < 32;
}

function steer(ctx, ally, dt) {
  const boss = ctx.boss;
  if (!boss) return;
  const band = ALLY_BAND[ally.id] || [80, 120];
  const dx = ally.x - boss.x;
  const dy = ally.y - boss.y;
  const dist = Math.hypot(dx, dy) || 1;
  let tx;
  let ty;
  if (dist < band[0]) {
    tx = boss.x + (dx / dist) * band[1];
    ty = boss.y + (dy / dist) * band[1];
  } else if (dist > band[1]) {
    const mid = (band[0] + band[1]) * 0.5;
    tx = boss.x + (dx / dist) * mid;
    ty = boss.y + (dy / dist) * mid;
  } else {
    tx = ally.x + (-dy / dist) * 36;
    ty = ally.y + (dx / dist) * 36;
  }
  if (inPlayerLineOfFire(ctx, ally)) {
    const p = ctx.player;
    let ax = Number.isFinite(p.aimX) ? p.aimX : 0;
    let ay = Number.isFinite(p.aimY) ? p.aimY : -1;
    const alen = Math.hypot(ax, ay) || 1;
    ax /= alen;
    ay /= alen;
    const side = (ally.x - p.x) * (-ay) + (ally.y - p.y) * ax >= 0 ? 1 : -1;
    tx = ally.x - ay * side * 52;
    ty = ally.y + ax * side * 52;
  }
  const mx = tx - ally.x;
  const my = ty - ally.y;
  const len = Math.hypot(mx, my) || 1;
  const speed = ALLY_SPEED[ally.id] || 90;
  if (len > 4) {
    ally.vx = (mx / len) * speed;
    ally.vy = (my / len) * speed;
    ally.x += ally.vx * dt;
    ally.y += ally.vy * dt;
  } else {
    ally.vx = 0;
    ally.vy = 0;
  }
  const ax = boss.x - ally.x;
  const ay = boss.y - ally.y;
  const al = Math.hypot(ax, ay) || 1;
  ally.aimX = ax / al;
  ally.aimY = ay / al;
  ally.facing = facingName(ally.aimX, ally.aimY);
}

export function spawn(ctx, playerId) {
  const chosen = String(playerId || 'deepseek');
  const ids = ROSTER.filter((id) => id !== chosen);
  ctx.allies = ids.map((id, i) => makeAlly(ctx, id, i));
  return ctx.allies;
}

export function update(ctx, dt) {
  const allies = ctx.allies || [];
  for (let i = 0; i < allies.length; i += 1) {
    const ally = allies[i];
    if (ally.talkCd > 0) ally.talkCd -= dt;
    if (ally.invuln > 0) ally.invuln = Math.max(0, ally.invuln - dt);
    if (!ally.alive) {
      if (!ally.downing) {
        ally.downing = true;
        ally.downT = ALLY_REVIVE;
        ally.pose = 'down';
        ally.ghostPulse = 0;
        say(ctx, ally, 'down');
        ctx.bus.emit(EVENTS.VFX, { kind: 'shock', x: ally.x, y: ally.y - 8, color: '#a8c4ff', life: 0.35 });
        ctx.bus.emit(EVENTS.SHAKE, { mag: 1, dur: 0.08 });
      }
      ally.downT -= dt;
      ally.vx = 0;
      ally.vy = 0;
      ally.ghostPulse = (ally.ghostPulse || 0) + dt;
      if (ally.ghostPulse >= 0.55) {
        ally.ghostPulse = 0;
        ctx.bus.emit(EVENTS.VFX, { kind: 'spark', x: ally.x, y: ally.y - 10, color: '#d0e8ff' });
      }
      if (ally.downT <= 0) {
        ally.alive = true;
        ally.downing = false;
        ally.hp = ally.maxHp * ALLY_REVIVE_HP;
        ally.invuln = 0.8;
        ally.pose = '';
        ctx.bus.emit(EVENTS.ALLY_REVIVE, { id: ally.id });
        say(ctx, ally, 'revive');
      }
      continue;
    }
    dodge(ctx, ally);
    if (ally.rolling) {
      ally.rollT += dt;
      const sp = ROLL.distance / ROLL.duration;
      ally.x += ally.rollX * sp * dt;
      ally.y += ally.rollY * sp * dt;
      if (ally.rollT >= ROLL.iframeStart && ally.rollT <= ROLL.iframeEnd) {
        ally.invuln = Math.max(ally.invuln, ROLL.iframeEnd - ally.rollT);
      }
      if (ally.rollT >= ROLL.duration) ally.rolling = false;
    } else {
      steer(ctx, ally, dt);
    }
    ctx.world?.clamp?.(ally);
    const aim = { x: ally.aimX, y: ally.aimY };
    if ((ally.skillCd || 0) <= 0 && !ally.shield && !ally.charging && !ally.rolling) {
      allyPulse(ctx, ally, aim);
      ally.skillCd = ALLY_SKILL_CD;
    }
    tickSkill(ctx, ally, dt, {
      aim,
      skillHeld: !!(ally.shield && ally.shieldAge < 0.6),
      skillDown: false,
    });
    tickPrimary(ctx, ally, dt, { fire: !ally.rolling && !ally.shield, aim });
    const maxCd = PLAYER[ally.id]?.skill?.cd || 6;
    if (ally.shield) ally.facing = facingName(ally.aimX, ally.aimY);
    void maxCd;
  }
}

export function init(ctx) {
  ctx.allies = [];
  ctx.bus.on(EVENTS.STATE_CHANGE, ({ to }) => {
    if (to !== 'fight') {
      document.querySelectorAll('.speech-bubble, .ally-bubble').forEach((el) => el.remove());
    }
  });
  ctx.bus.on(EVENTS.PHASE_CHANGE, ({ phase }) => {
    for (let i = 0; i < ctx.allies.length; i += 1) {
      const a = ctx.allies[i];
      if (phase === 3 && !a.nerfed) {
        a.nerfed = true;
        a.maxHp = Math.round(ALLY_HP * ALLY_P3_HP_SCALE);
        a.hp = Math.min(a.hp, a.maxHp);
      } else if (phase < 3 && a.nerfed) {
        a.nerfed = false;
        a.maxHp = ALLY_HP;
      }
      say(ctx, a, 'phase');
    }
  });
  ctx.bus.on(EVENTS.FLASK_USED, () => {
    const ally = ctx.allies && ctx.allies[0];
    if (ally) say(ctx, ally, 'flask');
  });
  ctx.bus.on(EVENTS.SAFETY_JUDGEMENT, () => {
    for (let i = 0; i < ctx.allies.length; i += 1) say(ctx, ctx.allies[i], 'judgment');
  });
}

export function despawn(ctx) {
  ctx.allies = [];
}

export function reset(ctx) {
  despawn(ctx);
}

/** Simple downed-ally ghost ring; integrator can call after y-sorted actors if sprites lack ghost pose. */
export function render(ctx, g) {
  const allies = ctx.allies || [];
  for (let i = 0; i < allies.length; i += 1) {
    const a = allies[i];
    if (!a.alive && a.downing) {
      const pulse = 0.5 + 0.5 * Math.sin((ALLY_REVIVE - a.downT) * 4);
      g.globalAlpha = 0.35 + pulse * 0.25;
      g.strokeStyle = '#9cc9f0';
      g.lineWidth = 1;
      const r = 10 + Math.round(pulse * 4);
      g.strokeRect(Math.round(a.x - r), Math.round(a.y - r - 8), r * 2, r * 2);
      g.globalAlpha = 1;
    }
  }
}
