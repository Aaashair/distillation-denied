// OWNER: W5 / W4 (Claude combat VO language gate + test hooks)
// HTMLAudioElement manager (file://). Missing files never throw and never 404:
// unknown ids go to a WebAudio synth patch instead of requesting a path.
// Punchy synth bank also layers under hits/shots. Per-sound rate limiting.
// AudioContext is constructed only inside unlock() after a user gesture.
// BGM: title → p1 → p2 → p3 → endA/endB (v2 bgm8_* via ASSET_CONFIG aliases).

import { EVENTS, GAME_STATES } from './contracts.js';
import { getAsset, resolveAssetId } from '../config/assets.js';
import { getLanguage } from './i18n.js';

const POOL_SIZE = 4;
const SHORT_HIT = 0.42;
const SHORT_FADE = 0.14;

const LONG_SFX = new Set([
  'sfx.rain', 'sfx.heartbeat', 'sfx.busy', 'sfx.fanStop', 'sfx.glass',
  'sfx.slam', 'sfx.tear', 'sfx.stamp', 'sfx.death', 'sfx.phase', 'sfx.smite',
  'sfx.charge', 'sfx.banner', 'sfx.b200', 'sfx.heal', 'sfx.fan', 'sfx.flask',
  'sfx.heavy', 'sfx.beam', 'sfx.feathers',
]);

const RATE_MS = {
  shot: 55,
  hit: 70,
  bark: 8000,
  hurt: 4200,
  skill: 1600,
  default: 40,
};

function hashId(id) {
  let h = 0;
  const s = String(id);
  for (let i = 0; i < s.length; i += 1) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h;
}

function clamp01(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function fadeFrom(arg, fallback) {
  if (typeof arg === 'number') return Math.max(0.04, arg);
  if (arg && typeof arg === 'object' && arg.fade != null) return Math.max(0.04, Number(arg.fade) || fallback);
  return fallback;
}

function isVoiceId(id) {
  const s = String(id || '');
  return s.startsWith('vo.') || s.startsWith('vo_') || s.startsWith('v2_vo_')
    || s.startsWith('m.dario_') || s.startsWith('m.endA_') || s.startsWith('m.endB_') || s.startsWith('m.ally_');
}

const CLAUDE_COMBAT_VO = /^v2_vo_(haiku|sonnet|opus)_(intro|attack|hurt|out|cast|low)$/;

function isClaudeCombatVo(id) {
  const resolved = resolveAssetId(String(id || ''));
  return CLAUDE_COMBAT_VO.test(resolved) || CLAUDE_COMBAT_VO.test(String(id || ''));
}

/** @type {Array<{kind:'vo'|'sfx', id:string, muted?:boolean, t:number}>} */
const playLog = [];
const LOG_MAX = 96;

function logPlay(kind, id, extra = {}) {
  playLog.push({ kind, id: String(id), ...extra, t: (typeof performance !== 'undefined' ? performance.now() : Date.now()) });
  if (playLog.length > LOG_MAX) playLog.shift();
}

function autoplayFail(err) {
  const name = err && err.name;
  return name === 'NotAllowedError' || name === 'AbortError';
}

function setVol(el, v) {
  if (!el) return;
  try { el.volume = clamp01(v); } catch { /* some browsers reject before load */ }
}

function rewind(el) {
  if (!el) return;
  try { el.currentTime = 0; } catch { /* ignore */ }
}

function safePlay(el) {
  if (!el) return;
  const started = el.play();
  if (started && typeof started.catch === 'function') started.catch(() => {});
}

function safePause(el) {
  if (!el) return;
  try { el.pause(); } catch { /* already gone */ }
}

function whoOf(payload, ctx) {
  if (!payload) return ctx?.player?.id || 'deepseek';
  if (typeof payload === 'string') return payload;
  if (payload.id && typeof payload.id === 'string' && !payload.id.startsWith('px.')) return payload.id;
  if (payload.charId) return payload.charId;
  if (payload.name) return payload.name;
  return ctx?.player?.id || 'deepseek';
}

export function createAudio() {
  /** @type {AudioContext|null} */
  let ac = null;
  const missing = new Set();
  /** @type {Map<string, HTMLAudioElement[]>} */
  const pools = new Map();
  /** @type {Set<{el: HTMLAudioElement, id: string, kind: string}>} */
  const live = new Set();
  /** @type {Map<string, number>} */
  const lastAt = new Map();

  let current = null;
  let currentId = null;
  let outgoing = null;
  let fade = 0.6;
  let fading = 1;
  let pendingBgm = null;

  let master = 0.62;
  let music = 0.82;
  let sfxVol = 0.9;
  let voVol = 1;

  let duckMul = 1;
  let duckGoal = 1;
  let duckVel = 2.5;
  let voCount = 0;
  let voActiveId = null;
  /** @type {HTMLAudioElement|null} */
  let voEl = null;
  let voPromise = Promise.resolve(0);
  let voGen = 0;
  /** @type {((n: number) => void)|null} */
  let voSettle = null;
  let voTimer = 0;
  let voPlayGen = 0;

  let theaterSessionGen = 0;
  let theaterShotGen = 0;
  /** Monotonic theater ownership; never reset — stale gen-0 cannot match a new session. */
  let theaterOwnerToken = 0;
  let theaterSessionActive = false;

  /** @type {Set<{nodes: AudioNode[], extra: AudioNode[], scope: string, ownerToken: number, endAt: number}>} */
  const synthRegistry = new Set();

  let unlocked = false;
  /** @type {object|null} */
  let wireCtx = null;
  let padNodes = null;
  let humNodes = null;
  let chargeNodes = null;

  function gated(key, ms) {
    const now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    const prev = lastAt.get(key) || 0;
    if (now - prev < (ms || RATE_MS.default)) return false;
    lastAt.set(key, now);
    return true;
  }

  function context() {
    if (!unlocked) return null;
    if (ac) return ac;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try { ac = new Ctor(); } catch { ac = null; }
    return ac;
  }

  function musicGain() {
    return clamp01(master * music * duckMul);
  }

  function sfxGain(extra) {
    return clamp01(master * sfxVol * (extra == null ? 1 : extra));
  }

  function voGain(extra) {
    return clamp01(master * voVol * (extra == null ? 1 : extra));
  }

  function unlock() {
    unlocked = true;
    const a = context();
    if (a && a.state === 'suspended') a.resume().catch(() => {});
    if (pendingBgm) {
      const job = pendingBgm;
      const staleTheater = job.theaterOwnerToken != null && job.theaterOwnerToken !== theaterOwnerToken;
      pendingBgm = null;
      if (!staleTheater) playBgm(job.id, job.opts);
    } else if (current && current.paused && !current.dead) {
      safePlay(current);
    }
  }

  function killNow(el) {
    if (!el) return;
    el.dead = true;
    setVol(el, 0);
    rewind(el);
    safePause(el);
  }

  function hardStopBgmNow() {
    pendingBgm = null;
    if (outgoing) killNow(outgoing);
    if (current) killNow(current);
    outgoing = null;
    current = null;
    currentId = null;
    fading = fade;
    stopPad(theaterSessionActive);
  }

  function dropSynthBundle(bundle) {
    for (const n of bundle.nodes) {
      try {
        if (n instanceof OscillatorNode || n instanceof AudioBufferSourceNode) n.stop(0);
      } catch {
        try { n.stop(); } catch { /* already stopped */ }
      }
      try { n.disconnect(); } catch { /* ignore */ }
    }
    for (const n of bundle.extra) {
      try { n.disconnect(); } catch { /* ignore */ }
    }
    synthRegistry.delete(bundle);
  }

  function registerSynthNodes(nodes, extra, scope, ownerToken, endAt) {
    const bundle = {
      nodes,
      extra: extra || [],
      scope: String(scope || 'transient'),
      ownerToken: Number(ownerToken) || 0,
      endAt: Number(endAt) || 0,
    };
    synthRegistry.add(bundle);
    const drop = () => { if (synthRegistry.has(bundle)) dropSynthBundle(bundle); };
    for (const n of nodes) {
      if (n instanceof OscillatorNode || n instanceof AudioBufferSourceNode) {
        n.onended = drop;
      }
    }
    return bundle;
  }

  function hardCutSynth(pred) {
    for (const b of Array.from(synthRegistry)) {
      if (pred && !pred(b)) continue;
      dropSynthBundle(b);
    }
  }

  function releaseHard(entry) {
    if (!entry) return;
    live.delete(entry);
    const el = entry.el;
    el._free = true;
    el._fadeT = 0;
    el._fadeDur = 0;
    el._killAt = 0;
    el.loop = false;
    el.onerror = null;
    el.onended = null;
    setVol(el, 0);
    rewind(el);
    safePause(el);
    entry.theaterOwnerToken = null;
  }

  function releaseTheaterLive() {
    for (const entry of Array.from(live)) {
      if (entry.theaterOwnerToken != null) releaseHard(entry);
    }
  }

  function releaseAllLiveHard() {
    for (const entry of Array.from(live)) releaseHard(entry);
  }

  function bumpTheaterOwner() {
    theaterOwnerToken += 1;
    return theaterOwnerToken;
  }

  function invalidateTheaterShot() {
    theaterShotGen += 1;
    bumpTheaterOwner();
    voGen += 1;
    if (voTimer) {
      window.clearTimeout(voTimer);
      voTimer = 0;
    }
    if (voSettle) {
      voSettle(0);
      voSettle = null;
    }
    voCount = 0;
    voActiveId = null;
    if (voEl) {
      rewind(voEl);
      safePause(voEl);
      voEl = null;
    }
    voPromise = Promise.resolve(0);
    duckGoal = 1;
    if (pendingBgm && pendingBgm.theaterOwnerToken != null) pendingBgm = null;
    if (theaterSessionActive) hardStopBgmNow();
    releaseTheaterLive();
    hardCutSynth((b) => b.scope === 'theater');
    stopPad(true);
    stopHum(true);
    stopCharge(true);
  }

  function beginTheaterSession() {
    theaterSessionGen += 1;
    theaterSessionActive = true;
    theaterShotGen += 1;
    bumpTheaterOwner();
    hardStopBgmNow();
    stopVo();
    releaseAllLiveHard();
    stopHum(true);
    stopCharge(true);
    stopPad(true);
    hardCutSynth((b) => b.scope === 'theater' || b.scope === 'transient');
  }

  function endTheaterSession() {
    theaterSessionActive = false;
    theaterSessionGen += 1;
    theaterShotGen += 1;
    bumpTheaterOwner();
    voGen += 1;
    if (voTimer) window.clearTimeout(voTimer);
    voTimer = 0;
    if (voSettle) { voSettle(0); voSettle = null; }
    voCount = 0;
    voActiveId = null;
    if (voEl) {
      rewind(voEl);
      safePause(voEl);
      voEl = null;
    }
    voPromise = Promise.resolve(0);
    pendingBgm = null;
    hardStopBgmNow();
    releaseTheaterLive();
    hardCutSynth((b) => b.scope === 'theater');
    stopHum(true);
    stopCharge(true);
    stopPad(true);
  }

  function getTheaterShotGen() {
    return theaterShotGen;
  }

  function getTheaterOwnerToken() {
    return theaterOwnerToken;
  }

  function getTelemetry() {
    let bgmPaused = true;
    let bgmTime = 0;
    if (current) {
      bgmPaused = !!current.paused;
      bgmTime = Number.isFinite(current.currentTime) ? current.currentTime : 0;
    }
    let voPaused = true;
    let voTime = 0;
    if (voEl) {
      voPaused = !!voEl.paused;
      voTime = Number.isFinite(voEl.currentTime) ? voEl.currentTime : 0;
    }
    let theaterSfx = 0;
    for (const entry of live) {
      if (entry.theaterOwnerToken != null) theaterSfx += 1;
    }
    let synthActive = 0;
    let synthScheduled = 0;
    let theaterSynth = 0;
    const actNow = ac ? ac.currentTime : 0;
    for (const b of synthRegistry) {
      synthActive += 1;
      if (b.scope === 'theater') theaterSynth += 1;
      if (b.endAt > actNow + 0.001) synthScheduled += 1;
    }
    return {
      theaterSessionGen,
      theaterShotGen,
      theaterOwnerToken,
      theaterSessionActive,
      bgmId: currentId,
      bgmPaused,
      bgmCurrentTime: bgmTime,
      voId: voActiveId,
      voPaused,
      voCurrentTime: voTime,
      voPending: voCount,
      sfxLive: live.size,
      theaterSfxLive: theaterSfx,
      pendingBgm: pendingBgm ? pendingBgm.id : null,
      padActive: !!padNodes,
      humActive: !!humNodes,
      chargeActive: !!chargeNodes,
      synthActive,
      synthScheduled,
      theaterSynthActive: theaterSynth,
      unlocked,
    };
  }

  function synthOptsForPlay(theaterScoped) {
    return theaterScoped
      ? { scope: 'theater', ownerToken: theaterOwnerToken }
      : { scope: 'transient', ownerToken: 0 };
  }

  function noiseBuffer(seconds) {
    const a = context();
    if (!a) return null;
    const n = Math.max(1, Math.floor(a.sampleRate * seconds));
    const buf = a.createBuffer(1, n, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i += 1) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function synth(kind, id, synthOpts = {}) {
    const a = context();
    if (!a || a.state !== 'running') return;
    const scope = synthOpts.scope === 'theater' ? 'theater' : 'transient';
    const ownerToken = synthOpts.ownerToken != null ? Number(synthOpts.ownerToken) : 0;
    const now = a.currentTime;
    const h = hashId(id || kind);
    const tag = String(kind || id || '');

    const osc = (type, freq, dur, peak, delay) => {
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = type;
      o.frequency.value = freq;
      const t = now + (delay || 0);
      const p = Math.max(0.0008, peak);
      g.gain.setValueAtTime(p, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(a.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
      registerSynthNodes([o], [g], scope, ownerToken, t + dur + 0.05);
    };

    const noise = (dur, peak, hp, delay) => {
      const buf = noiseBuffer(dur);
      if (!buf) return;
      const src = a.createBufferSource();
      const g = a.createGain();
      const f = a.createBiquadFilter();
      src.buffer = buf;
      f.type = hp ? 'highpass' : 'lowpass';
      f.frequency.value = hp || 900;
      const t = now + (delay || 0);
      g.gain.setValueAtTime(peak, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f);
      f.connect(g);
      g.connect(a.destination);
      src.start(t);
      src.stop(t + dur + 0.02);
      registerSynthNodes([src], [f, g], scope, ownerToken, t + dur + 0.05);
    };

    if (tag === 'pew_kimi' || tag.includes('star')) {
      osc('sine', 880, 0.08, 0.045, 0);
      osc('triangle', 1320, 0.06, 0.02, 0.02);
      return;
    }
    if (tag === 'pew_glm' || tag.includes('hammer')) {
      osc('square', 140, 0.09, 0.05, 0);
      osc('triangle', 70, 0.14, 0.04, 0.01);
      return;
    }
    if (tag === 'pew_deepseek' || tag === 'pew' || tag.includes('slash')) {
      osc('square', 420 + (h % 80), 0.05, 0.03, 0);
      noise(0.05, 0.03, 1800, 0);
      return;
    }
    if (tag === 'hit' || tag.includes('hit')) {
      noise(0.06, 0.05, 900, 0);
      osc('square', 180 + (h % 40), 0.04, 0.025, 0);
      return;
    }
    if (tag === 'heavy' || tag.includes('heavy') || tag.includes('slam')) {
      osc('sine', 62, 0.22, 0.08, 0);
      osc('triangle', 36, 0.28, 0.05, 0.02);
      noise(0.12, 0.05, 400, 0);
      return;
    }
    if (tag === 'roll' || tag.includes('whoosh') || tag.includes('dash')) {
      noise(0.14, 0.05, 600, 0);
      osc('triangle', 240, 0.1, 0.02, 0);
      return;
    }
    if (tag === 'ding' || tag.includes('guard') || tag.includes('perfect') || tag.includes('shield')) {
      osc('sine', 1480, 0.12, 0.05, 0);
      osc('sine', 2220, 0.1, 0.03, 0.02);
      return;
    }
    if (tag === 'charge' || tag.includes('charge')) {
      osc('sawtooth', 90, 0.35, 0.03, 0);
      osc('sine', 180, 0.35, 0.02, 0);
      return;
    }
    if (tag === 'beam' || tag.includes('beam')) {
      osc('sawtooth', 220, 0.28, 0.04, 0);
      osc('square', 440, 0.18, 0.02, 0.02);
      noise(0.2, 0.03, 2000, 0);
      return;
    }
    if (tag === 'explode' || tag.includes('explosion') || tag.includes('smite')) {
      noise(0.28, 0.08, 300, 0);
      osc('sine', 48, 0.32, 0.07, 0);
      return;
    }
    if (tag === 'hum' || tag.includes('telegraph')) {
      osc('sine', 110, 0.4, 0.02, 0);
      osc('sine', 165, 0.4, 0.012, 0);
      return;
    }
    if (tag === 'glass' || tag.includes('glass') || tag.includes('crack')) {
      noise(0.22, 0.08, 1800, 0);
      osc('square', 1240 + (h % 400), 0.08, 0.03, 0);
      osc('sine', 2100, 0.06, 0.02, 0.04);
      return;
    }
    if (tag === 'stamp' || tag.includes('stamp')) {
      osc('sine', 70, 0.18, 0.07, 0);
      noise(0.08, 0.04, 700, 0);
      osc('square', 220, 0.06, 0.03, 0.02);
      return;
    }
    if (tag.includes('heartbeat')) {
      osc('sine', 68, 0.09, 0.05, 0);
      osc('sine', 52, 0.11, 0.04, 0.22);
      return;
    }
    if (tag.includes('rain')) {
      noise(0.5, 0.03, 900, 0);
      return;
    }
    if (tag.includes('flask') || tag.includes('heal')) {
      osc('sine', 520, 0.12, 0.03, 0);
      osc('sine', 780, 0.14, 0.025, 0.05);
      return;
    }
    if (isVoiceId(id) || tag === 'vo') {
      osc('sine', 90 + (h % 40), 0.28, 0.035, 0);
      osc('sine', 140 + (h % 20), 0.18, 0.02, 0.05);
      return;
    }
    osc('square', 220 + (h % 640), 0.05, 0.02, 0);
  }

  function beep(id, kind, synthOpts) {
    synth(kind === 'vo' ? 'vo' : String(id), id, synthOpts || { scope: 'transient', ownerToken: 0 });
  }

  function stopPad(immediate = false) {
    if (!padNodes) return;
    if (immediate) {
      try { padNodes.o.stop(0); } catch { /* ignore */ }
      try { padNodes.o2?.stop(0); } catch { /* ignore */ }
      try { padNodes.o.disconnect(); } catch { /* ignore */ }
      try { padNodes.o2?.disconnect(); } catch { /* ignore */ }
      try { padNodes.g.disconnect(); } catch { /* ignore */ }
      padNodes = null;
      return;
    }
    try { padNodes.g.gain.exponentialRampToValueAtTime(0.0001, (ac ? ac.currentTime : 0) + 0.2); } catch { /* ignore */ }
    try { padNodes.o.stop((ac ? ac.currentTime : 0) + 0.25); } catch { /* ignore */ }
    padNodes = null;
  }

  function stopHum(immediate = false) {
    if (!humNodes) return;
    const t = ac ? ac.currentTime : 0;
    if (immediate) {
      try { humNodes.o.stop(0); } catch { /* ignore */ }
      try { humNodes.o2?.stop(0); } catch { /* ignore */ }
      try { humNodes.o.disconnect(); } catch { /* ignore */ }
      try { humNodes.o2?.disconnect(); } catch { /* ignore */ }
      try { humNodes.g.disconnect(); } catch { /* ignore */ }
      humNodes = null;
      return;
    }
    try { humNodes.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); } catch { /* ignore */ }
    try { humNodes.o.stop(t + 0.16); } catch { /* ignore */ }
    humNodes = null;
  }

  function startHum() {
    stopHum();
    const a = context();
    if (!a || a.state !== 'running') return;
    const o = a.createOscillator();
    const o2 = a.createOscillator();
    const g = a.createGain();
    o.type = 'sine';
    o2.type = 'triangle';
    o.frequency.value = 108;
    o2.frequency.value = 162;
    g.gain.value = 0.018 * sfxGain(1);
    o.connect(g);
    o2.connect(g);
    g.connect(a.destination);
    try { o.start(); o2.start(); } catch { /* already started */ }
    humNodes = { o, o2, g };
  }

  function stopCharge(immediate = false) {
    if (!chargeNodes) return;
    const t = ac ? ac.currentTime : 0;
    if (immediate) {
      try { chargeNodes.o.stop(0); } catch { /* ignore */ }
      try { chargeNodes.o.disconnect(); } catch { /* ignore */ }
      try { chargeNodes.g.disconnect(); } catch { /* ignore */ }
      chargeNodes = null;
      return;
    }
    try { chargeNodes.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08); } catch { /* ignore */ }
    try { chargeNodes.o.stop(t + 0.12); } catch { /* ignore */ }
    chargeNodes = null;
  }

  function startCharge() {
    stopCharge();
    const a = context();
    if (!a || a.state !== 'running') return;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = 'sawtooth';
    o.frequency.value = 80;
    try { o.frequency.exponentialRampToValueAtTime(240, a.currentTime + 1.2); } catch { /* ignore */ }
    g.gain.value = 0.02 * sfxGain(1);
    o.connect(g);
    g.connect(a.destination);
    try { o.start(); } catch { /* ignore */ }
    chargeNodes = { o, g };
  }

  function startPad(id) {
    stopPad();
    const a = context();
    if (!a || a.state !== 'running') return;
    const o = a.createOscillator();
    const o2 = a.createOscillator();
    const g = a.createGain();
    const h = hashId(id);
    o.type = 'sine';
    o2.type = 'triangle';
    o.frequency.value = 98 + (h % 24);
    o2.frequency.value = 196 + (h % 18);
    g.gain.value = 0.012 * musicGain();
    o.connect(g);
    o2.connect(g);
    g.connect(a.destination);
    try {
      o.start();
      o2.start();
    } catch { /* already started */ }
    padNodes = { o, o2, g };
  }

  function applyBgmVolumes() {
    const g = musicGain();
    const k = Math.min(1, fading / fade);
    if (outgoing && !outgoing.dead) setVol(outgoing, (1 - k) * g);
    if (current && !current.dead) setVol(current, k * g);
    if (padNodes && padNodes.g) {
      try { padNodes.g.gain.value = 0.012 * g * k; } catch { /* ignore */ }
    }
  }

  function kill(el) {
    if (!el) return;
    el.dead = true;
    setVol(el, 0);
    const stop = () => { if (el.dead) safePause(el); };
    if (el.readyState >= 2) stop();
    else el.addEventListener('canplay', stop, { once: true });
  }

  function playBgm(id, fadeOrOpts) {
    if (!id) return;
    const opts = fadeOrOpts && typeof fadeOrOpts === 'object' ? fadeOrOpts : {};
    const theaterScoped = opts.scope === 'theater';
    const wantTok = theaterScoped && opts.theaterOwnerToken != null
      ? Number(opts.theaterOwnerToken)
      : (theaterScoped && opts.theaterShotGen != null ? Number(opts.theaterShotGen) : null);
    if (theaterScoped && wantTok != null && wantTok !== theaterOwnerToken) return;
    if (!unlocked) {
      pendingBgm = {
        id,
        opts: fadeOrOpts,
        theaterOwnerToken: theaterScoped ? theaterOwnerToken : null,
      };
      return;
    }
    const fadeSec = fadeFrom(fadeOrOpts, 0.8);
    if (currentId === id && current && !current.dead && !theaterScoped) return;
    outgoing = current;
    current = null;
    currentId = id;
    fade = fadeSec;
    fading = 0;
    stopPad();

    if (missing.has(id)) {
      startPad(id);
      return;
    }
    const path = getAsset(id);
    if (!path) {
      missing.add(id);
      startPad(id);
      return;
    }
    const el = new Audio(path);
    el.loop = true;
    el.preload = 'auto';
    el.dead = false;
    setVol(el, 0);
    el.addEventListener('error', () => {
      el.dead = true;
      missing.add(id);
      if (current === el) {
        current = null;
        startPad(id);
      }
    }, { once: true });
    current = el;
    const playTok = theaterOwnerToken;
    const started = el.play();
    if (started && typeof started.catch === 'function') {
      started.catch((err) => {
        if (autoplayFail(err)) {
          pendingBgm = {
            id,
            opts: fadeOrOpts,
            theaterOwnerToken: theaterScoped ? playTok : null,
          };
        }
      });
    }
  }

  function stopBgm(fadeOrOpts) {
    pendingBgm = null;
    outgoing = current || outgoing;
    current = null;
    currentId = null;
    fade = fadeFrom(fadeOrOpts, 0.4);
    fading = 0;
    stopPad();
  }

  function duck(amount) {
    if (amount == null || amount === true) duckGoal = 0.28;
    else if (amount === false) duckGoal = 1;
    else duckGoal = clamp01(amount);
    duckVel = 3.2;
  }

  function acquire(id, path) {
    let list = pools.get(id);
    if (!list) {
      list = [];
      pools.set(id, list);
    }
    for (let i = 0; i < list.length; i += 1) {
      const el = list[i];
      if (el._free || el.paused || el.ended) return el;
    }
    if (list.length < POOL_SIZE) {
      const el = new Audio(path);
      el.preload = 'auto';
      el._free = true;
      list.push(el);
      return el;
    }
    return list[0];
  }

  function release(entry) {
    if (!entry) return;
    live.delete(entry);
    const el = entry.el;
    el._free = true;
    el._fadeT = 0;
    el._fadeDur = 0;
    el._killAt = 0;
    el.loop = false;
    safePause(el);
  }

  function stopSfx(id, fadeOrOpts) {
    const fadeSec = fadeFrom(fadeOrOpts, 0.18);
    const want = id ? resolveAssetId(id) : null;
    for (const entry of Array.from(live)) {
      if (entry.kind !== 'sfx') continue;
      if (want && entry.id !== want && entry.id !== id) continue;
      if (fadeSec <= 0.05) {
        release(entry);
      } else {
        entry.el._fadeFrom = entry.el.volume;
        entry.el._fadeT = 0;
        entry.el._fadeDur = fadeSec;
        entry.el._fadeTo = 0;
        entry.el._killAt = 0.001;
      }
    }
    if (!id || String(id).includes('telegraph')) stopHum();
    if (!id || String(id).includes('charge')) stopCharge();
  }

  function stopVo() {
    voGen += 1;
    if (voTimer) {
      window.clearTimeout(voTimer);
      voTimer = 0;
    }
    if (voSettle) {
      voSettle(0);
      voSettle = null;
    }
    voCount = 0;
    voActiveId = null;
    if (voEl) {
      rewind(voEl);
      safePause(voEl);
      voEl = null;
    }
    voPromise = Promise.resolve(0);
    duckGoal = 1;
  }

  function playSfx(id, opts = {}) {
    if (!id || !unlocked) return;
    const theaterScoped = opts.scope === 'theater';
    const wantTok = theaterScoped && opts.theaterOwnerToken != null
      ? Number(opts.theaterOwnerToken)
      : (theaterScoped && opts.theaterShotGen != null ? Number(opts.theaterShotGen) : null);
    if (theaterScoped && wantTok != null && wantTok !== theaterOwnerToken) return;
    const capturedOwner = theaterScoped ? theaterOwnerToken : 0;
    const synthOpt = synthOptsForPlay(theaterScoped);
    if (isVoiceId(id)) {
      playVo(id, { ...opts, ctx: opts.ctx });
      return;
    }
    const resolved = resolveAssetId(id);
    logPlay('sfx', resolved);
    if (!gated(`sfx:${resolved}`, RATE_MS.default)) return;
    const options = opts && typeof opts === 'object' ? opts : {};
    const loop = !!options.loop;
    const rate = Number(options.rate);
    const vol = sfxGain(options.volume == null ? 1 : options.volume);
    const long = loop || LONG_SFX.has(id) || LONG_SFX.has(resolved);
    const maxDuration = options.maxDuration == null
      ? (long ? 0 : SHORT_HIT)
      : Number(options.maxDuration) || 0;
    const fadeOut = options.fadeOut == null
      ? (long || loop ? 0 : SHORT_FADE)
      : Number(options.fadeOut) || 0;

    if (missing.has(resolved) || missing.has(id)) {
      beep(resolved, 'sfx', synthOpt);
      return;
    }
    const path = getAsset(resolved);
    if (!path) {
      missing.add(resolved);
      beep(resolved, 'sfx', synthOpt);
      return;
    }

    const el = acquire(resolved, path);
    el._free = false;
    el.loop = loop;
    try { el.playbackRate = Number.isFinite(rate) && rate > 0 ? Math.max(0.4, Math.min(2.5, rate)) : 1; } catch { /* ignore */ }
    setVol(el, vol);
    rewind(el);
    el._fadeFrom = vol;
    el._fadeTo = vol;
    el._fadeT = 0;
    el._fadeDur = 0;
    el._killAt = maxDuration > 0 ? maxDuration : 0;
    el._fadeOut = fadeOut;
    el._baseVol = vol;

    const entry = {
      el,
      id: resolved,
      kind: 'sfx',
      theaterOwnerToken: theaterScoped ? capturedOwner : null,
    };
    live.add(entry);

    const fail = () => {
      if (theaterScoped && capturedOwner !== theaterOwnerToken) return;
      missing.add(resolved);
      releaseHard(entry);
      beep(resolved, 'sfx', synthOpt);
    };
    const gen = (el._gen = (el._gen || 0) + 1);
    el.onerror = () => {
      if (el._gen !== gen) return;
      if (theaterScoped && capturedOwner !== theaterOwnerToken) return;
      fail();
    };
    el.onended = () => {
      if (el._gen !== gen || el.loop) return;
      if (theaterScoped && capturedOwner !== theaterOwnerToken) return;
      release(entry);
    };

    const started = el.play();
    if (started && typeof started.catch === 'function') {
      started.catch((err) => {
        if (autoplayFail(err)) return;
        if (theaterScoped && capturedOwner !== theaterOwnerToken) return;
        if (el._gen !== gen) return;
        if (el.error) fail();
      });
    }
  }

  function shouldMuteClaudeCombatVo(ctx, id) {
    if (getLanguage() !== 'en') return false;
    if (!isClaudeCombatVo(id)) return false;
    // Phase CG can begin synchronously before a phase VO callback. Never let
    // a selected-English Claude combat line leak Chinese across that boundary.
    return true;
  }

  function playVo(id, opts = {}) {
    if (!id) {
      return { duration: 0, promise: Promise.resolve(0) };
    }
    const resolved = resolveAssetId(id);
    const mute = shouldMuteClaudeCombatVo(opts.ctx || wireCtx, resolved);
    logPlay('vo', resolved, { muted: mute, unlocked });
    if (!unlocked) {
      return { duration: 0, promise: Promise.resolve(0) };
    }
    const theaterScoped = opts.scope === 'theater';
    const wantTok = theaterScoped && opts.theaterOwnerToken != null
      ? Number(opts.theaterOwnerToken)
      : (theaterScoped && opts.theaterShotGen != null ? Number(opts.theaterShotGen) : null);
    if (theaterScoped && wantTok != null && wantTok !== theaterOwnerToken) {
      return { duration: 0, promise: Promise.resolve(0) };
    }
    const synthOpt = synthOptsForPlay(theaterScoped);
    if (mute) {
      return { duration: 0, promise: Promise.resolve(0) };
    }
    if (voActiveId === resolved && voEl && !voEl.paused) {
      const duration = Number.isFinite(voEl.duration) ? voEl.duration : 0;
      return { duration, promise: voPromise };
    }

    const options = opts && typeof opts === 'object' ? opts : {};
    voCount += 1;
    voActiveId = resolved;
    duck(options.duck == null ? 0.24 : options.duck);

    const myVoGen = voGen;
    const capturedOwner = theaterScoped ? theaterOwnerToken : 0;
    voPlayGen = theaterScoped ? capturedOwner : -1;
    let settle;
    const promise = new Promise((resolve) => { settle = resolve; voSettle = resolve; });
    voPromise = promise;
    const handle = { duration: 0.4, promise };

    const done = (dur) => {
      if (myVoGen !== voGen) return;
      if (theaterScoped && capturedOwner !== theaterOwnerToken) return;
      handle.duration = dur;
      if (voActiveId === resolved) voActiveId = null;
      voCount = Math.max(0, voCount - 1);
      if (voCount <= 0) {
        voCount = 0;
        duckGoal = 1;
      }
      if (voEl && voEl._voId === resolved) voEl = null;
      if (voSettle === settle) voSettle = null;
      settle(dur);
    };

    if (missing.has(resolved)) {
      beep(resolved, 'vo', synthOpt);
      voTimer = window.setTimeout(() => {
        voTimer = 0;
        done(0.35);
      }, 350);
      return handle;
    }
    const path = getAsset(resolved);
    if (!path) {
      missing.add(resolved);
      beep(resolved, 'vo', synthOpt);
      voTimer = window.setTimeout(() => {
        voTimer = 0;
        done(0.35);
      }, 350);
      return handle;
    }

    const el = new Audio(path);
    el.preload = 'auto';
    el._voId = resolved;
    setVol(el, voGain(options.volume == null ? 1 : options.volume));
    voEl = el;

    el.addEventListener('loadedmetadata', () => {
      if (myVoGen !== voGen) return;
      if (theaterScoped && capturedOwner !== theaterOwnerToken) return;
      if (Number.isFinite(el.duration) && el.duration > 0) handle.duration = el.duration;
    });
    el.addEventListener('ended', () => done(handle.duration), { once: true });
    el.addEventListener('error', () => {
      if (myVoGen !== voGen) return;
      if (theaterScoped && capturedOwner !== theaterOwnerToken) return;
      missing.add(resolved);
      beep(resolved, 'vo', synthOpt);
      done(0.35);
    }, { once: true });

    const started = el.play();
    if (started && typeof started.catch === 'function') {
      started.catch((err) => {
        if (autoplayFail(err)) {
          done(handle.duration);
          return;
        }
        if (theaterScoped && capturedOwner !== theaterOwnerToken) return;
        if (el.error) {
          missing.add(resolved);
          beep(resolved, 'vo', synthOpt);
          done(0.35);
        }
      });
    }
    return handle;
  }

  function bark(id, gap, ctx) {
    if (!id) return;
    if (!gated(`bark:${id}`, gap || RATE_MS.bark)) return;
    playVo(id, { ctx });
  }

  function phaseBossVo(phase) {
    if (phase === 2) return 'v2_vo_sonnet_intro';
    if (phase === 3) return 'v2_vo_opus_intro';
    return 'v2_vo_haiku_intro';
  }

  function bossAttackVo(phase) {
    if (phase === 2) return 'v2_vo_sonnet_attack';
    if (phase === 3) return 'v2_vo_opus_attack';
    return 'v2_vo_haiku_attack';
  }

  function charVo(who, kind) {
    const id = String(who || 'deepseek').toLowerCase();
    const name = id.includes('kimi') ? 'kimi' : id.includes('glm') ? 'glm' : 'deepseek';
    return `v2_vo_${name}_${kind}`;
  }

  function update(_ctx, dt) {
    const step = dt > 0 ? dt : 0;
    fading += step;
    if (duckMul !== duckGoal) {
      const dir = duckGoal > duckMul ? 1 : -1;
      duckMul += dir * duckVel * step;
      if ((dir > 0 && duckMul > duckGoal) || (dir < 0 && duckMul < duckGoal)) duckMul = duckGoal;
    }
    applyBgmVolumes();
    if (outgoing && !outgoing.dead) {
      const k = Math.min(1, fading / fade);
      if (k >= 1) {
        kill(outgoing);
        outgoing = null;
      }
    }

    for (const entry of Array.from(live)) {
      const el = entry.el;
      if (el._fadeDur > 0) {
        el._fadeT += step;
        const t = Math.min(1, el._fadeT / el._fadeDur);
        setVol(el, el._fadeFrom + (el._fadeTo - el._fadeFrom) * t);
        if (t >= 1) {
          el._fadeDur = 0;
          if (el._fadeTo <= 0.001) release(entry);
        }
      }
      if (el._killAt > 0 && !el.loop) {
        el._killAt -= step;
        if (el._killAt <= 0) {
          if (el._fadeOut > 0) {
            el._fadeFrom = el.volume;
            el._fadeTo = 0;
            el._fadeT = 0;
            el._fadeDur = el._fadeOut;
            el._killAt = 0;
          } else {
            release(entry);
          }
        }
      }
    }
  }

  function reset() {
    stopBgm(0.05);
    stopVo();
    stopHum();
    stopCharge();
    for (const entry of Array.from(live)) release(entry);
    duckMul = 1;
    duckGoal = 1;
  }

  function wireBus(ctx) {
    ctx.bus.on(EVENTS.FIGHT_START, (p) => {
      playBgm('bgm.p1', { fade: 0.6 });
      const who = whoOf(p, ctx);
      bark(charVo(who, 'start'), 12000, ctx);
    });
    ctx.bus.on(EVENTS.PHASE_CHANGE, ({ phase }) => {
      const id = phase === 2 ? 'bgm.p2' : phase === 3 ? 'bgm.p3' : 'bgm.p1';
      playBgm(id, { fade: 0.9 });
      playSfx('sfx.phase');
      synth('heavy', 'sfx.phase');
      bark(phaseBossVo(phase), 4000, ctx);
    });
    ctx.bus.on(EVENTS.PHASE_TRANSITION_START, () => {
      playSfx('sfx.phase');
    });
    ctx.bus.on(EVENTS.ENDING_TRIGGER, ({ id }) => {
      playBgm(id === 'B' ? 'bgm.endB' : 'bgm.endA', { fade: 0.5 });
    });
    ctx.bus.on(EVENTS.STATE_CHANGE, ({ to }) => {
      if (to === 'title' || to === 'disclaimer' || to === 'select') playBgm('bgm.title', { fade: 0.8 });
      if (to === 'banned') stopBgm(0.25);
      if (to === 'credits') stopBgm(0.8);
      if (to !== 'fight' && to !== 'intro') {
        stopCharge();
        stopHum();
      }
    });
    ctx.bus.on(EVENTS.PLAYER_DEATH, () => {
      stopCharge();
      stopHum();
    });

    ctx.bus.on(EVENTS.SHOT_FIRED, (p) => {
      if (!gated('evt:shot', RATE_MS.shot)) return;
      const who = whoOf(p, ctx);
      if (String(who).includes('kimi')) {
        playSfx('sfx.star');
        synth('pew_kimi', who);
      } else if (String(who).includes('glm')) {
        playSfx('sfx.hammer');
        synth('pew_glm', who);
      } else {
        playSfx('sfx.slash');
        synth('pew_deepseek', who);
      }
    });
    ctx.bus.on(EVENTS.HIT, (hit) => {
      if (!hit || !hit.applied) return;
      if (!gated('evt:hit', RATE_MS.hit)) return;
      const dst = hit.dst;
      const team = dst && dst.team;
      if (hit.heavy) {
        playSfx('sfx.heavy');
        synth('heavy', 'hit');
      } else if (team === 'player') {
        playSfx('sfx.hitPlayer');
        synth('hit', 'player');
      } else {
        playSfx('sfx.hitBoss');
        synth('hit', 'boss');
      }
      if (team === 'player' && dst && dst.id) bark(charVo(dst.id, 'hurt'), RATE_MS.hurt, ctx);
    });
    ctx.bus.on(EVENTS.SKILL_CHARGE, () => {
      playSfx('sfx.charge');
      startCharge();
      synth('charge', 'skill');
    });
    ctx.bus.on(EVENTS.SKILL_RELEASE, (p) => {
      stopCharge();
      playSfx('sfx.beam');
      synth('beam', 'skill');
      const who = whoOf(p, ctx);
      bark(charVo(who, 'skill'), RATE_MS.skill, ctx);
    });
    ctx.bus.on(EVENTS.SKILL_USED, (p) => {
      const who = whoOf(p, ctx);
      bark(charVo(who, 'skill'), RATE_MS.skill, ctx);
      playSfx('sfx.heavy');
    });
    ctx.bus.on(EVENTS.SHIELD_BLOCK, (p) => {
      if (p && p.perfect) {
        playSfx('sfx.perfect');
        synth('ding', 'perfect');
      } else {
        playSfx('sfx.guard');
        synth('ding', 'guard');
      }
    });
    ctx.bus.on(EVENTS.PERFECT_GUARD, () => {
      playSfx('sfx.perfect');
      synth('ding', 'perfect');
    });
    ctx.bus.on(EVENTS.FLASK_USED, (p) => {
      const type = p && p.type;
      playSfx(type === 'b200' ? 'sfx.b200' : 'sfx.heal');
      synth('heal', type || 'flask');
      const who = ctx.player?.id;
      bark(charVo(who, 'heal'), 3000, ctx);
    });
    ctx.bus.on(EVENTS.ROLL_START, () => {
      playSfx('sfx.roll');
      synth('roll', 'roll');
    });
    ctx.bus.on(EVENTS.TELEGRAPH_START, () => {
      playSfx('sfx.telegraph');
      startHum();
    });
    ctx.bus.on(EVENTS.TELEGRAPH_END, () => stopHum());
    ctx.bus.on(EVENTS.TELEGRAPH_RESOLVE, () => stopHum());
    ctx.bus.on(EVENTS.SAFETY_JUDGEMENT, () => {
      playSfx('sfx.smite');
      synth('explode', 'smite');
    });
    ctx.bus.on(EVENTS.BOSS_ATTACK, (p) => {
      playSfx('sfx.heavy');
      const phase = (p && p.phase) || ctx.boss?.phase || 1;
      bark(bossAttackVo(phase), RATE_MS.bark, ctx);
    });
  }

  function init(ctx) {
    wireCtx = ctx;
    const gesture = () => unlock();
    window.addEventListener('pointerdown', gesture, { passive: true });
    window.addEventListener('keydown', gesture);
    window.addEventListener('touchstart', gesture, { passive: true });
    wireBus(ctx);
  }

  function setVolume(partial) {
    if (!partial || typeof partial !== 'object') return;
    if (partial.master != null) master = clamp01(partial.master);
    if (partial.music != null) music = clamp01(partial.music);
    if (partial.sfx != null) sfxVol = clamp01(partial.sfx);
    if (partial.vo != null) voVol = clamp01(partial.vo);
    applyBgmVolumes();
  }

  function getPlayLog() {
    return playLog.slice();
  }

  function clearPlayLog() {
    playLog.length = 0;
  }

  return {
    init,
    update,
    reset,
    playSfx,
    playBgm,
    stopBgm,
    playVo,
    stopVo,
    stopSfx,
    duck,
    unlock,
    setVolume,
    getVolume() { return { master, music, sfx: sfxVol, vo: voVol }; },
    getPlayLog,
    clearPlayLog,
    isClaudeCombatVo,
    beginTheaterSession,
    endTheaterSession,
    invalidateTheaterShot,
    cancelTheaterShot: invalidateTheaterShot,
    getTheaterShotGen,
    getTheaterOwnerToken,
    getTelemetry,
  };
}
