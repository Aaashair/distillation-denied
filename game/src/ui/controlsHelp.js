// OWNER: W1 — dismissible controls legend (pre-fight + in-fight recall).

import { bi, UI, CONTROLS } from '../data/lines.js';

export const BRIEFING_KEY = 'dd.controlsBrief.v4';

/** Compact sidebar legend (14px, scrollable) — full detail via H / ? */
export const SIDEBAR_CONTROLS = [
  { bind: 'WASD', desc: { zh: '移动', en: 'Move' } },
  { bind: '↑↓←→', desc: { zh: '八向射击', en: '8-way shoot' } },
  { bind: 'LMB', desc: { zh: '朝光标射击', en: 'Shoot at cursor' } },
  { bind: 'Space', desc: { zh: '翻滚', en: 'Roll' } },
  { bind: 'Shift/E/RMB', desc: { zh: '战技', en: 'Skill' } },
  { bind: 'Q', desc: { zh: '喝显卡', en: 'GPU heal' } },
  { bind: '1/2/3', desc: { zh: '选显卡', en: 'Pick GPU' } },
  { bind: 'H / ?', desc: { zh: '完整操作表', en: 'Full controls' } },
  { bind: 'Esc', desc: { zh: '暂停', en: 'Pause' } },
  { bind: 'P', desc: { zh: '调试', en: 'Debug' } },
];

function controlLine(row) {
  return `${row.bind} — ${bi(row.desc)}`;
}

/** @param {HTMLElement} host */
export function buildSidebarControls(host) {
  host.replaceChildren();
  for (const row of SIDEBAR_CONTROLS) {
    const li = document.createElement('li');
    li.textContent = `${row.bind} · ${bi(row.desc)}`;
    host.append(li);
  }
}

/** @param {HTMLElement} host */
export function buildControlsLegend(host) {
  host.replaceChildren();
  const heading = document.createElement('p');
  heading.className = 'controls-legend-title';
  heading.textContent = bi(UI.controlsLegendTitle);
  const ul = document.createElement('ul');
  ul.className = 'controls controls-legend';
  for (const row of CONTROLS) {
    const li = document.createElement('li');
    li.textContent = controlLine(row);
    ul.append(li);
  }
  const hint = document.createElement('p');
  hint.className = 'fine controls-recall';
  hint.textContent = bi(UI.controlsRecall);
  host.append(heading, ul, hint);
}

export function briefingSeen() {
  try {
    return localStorage.getItem(BRIEFING_KEY) === '1';
  } catch {
    return false;
  }
}

export function markBriefingSeen() {
  try {
    localStorage.setItem(BRIEFING_KEY, '1');
  } catch {
    /* ignore */
  }
}