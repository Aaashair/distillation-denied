// OWNER: WS6
// HTMLAudioElement only (file://). Missing files never throw and never 404:
// unknown ids go to a short WebAudio synth patch instead of requesting a path.
// BGM crossfades. SFX are pooled and short hits fade after ~0.35–0.6 s.
// playVo ducks BGM. The AudioContext is constructed only inside unlock(),
// which runs from the first pointer / key / touch gesture.

import { EVENTS } from './contracts.js';
import { getAsset, resolveAssetId } from '../config/assets.js';

const POOL_SIZE = 4;
const SHORT_HIT = 0.42;
const SHORT_FADE = 0.14;

const LONG_SFX = new Set([
  'sfx.rain', 'sfx.heartbeat', 'sfx.busy', 'sfx.fanStop', 'sfx.glass',
  'sfx.slam', 'sfx.tear', 'sfx.stamp', 'sfx.death', 'sfx.phase', 'sfx.smite',
  'sfx.charge', 'sfx.banner', 'sfx.b200', 'sfx.heal', 'sfx.fan', 'sfx.flask',
  'sfx.heavy', 'sfx.beam', 'sfx.feathers',
]);

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
  return s.startsWith('vo.') || s.startsWith('vo_') || s.startsWith('m.dario_') || s.startsWith('m.endA_') || s.startsWith('m.endB_') || s.startsWith('m.ally_');
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

export function createAudio() {
  /** @type {AudioContext|null} */
  let ac = null;
  const missing = new Set();
  /** @type {Map<string, HTMLAudioElement[]>} */
  const pools = new Map();
  /** @type {Set<{el: HTMLAudioElement, id: string, kind: string}>} */
  const live = new Set();

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

  let unlocked = false;
  let padNodes = null;

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
      pendingBgm = null;
      playBgm(job.id, job.opts);
    } else if (current && current.paused && !current.dead) {
      safePlay(current);
    }
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

  function beep(id, kind) {
    const a = context();
    if (!a || a.state !== 'running') return;
    const now = a.currentTime;
    const h = hashId(id);
    const voice = kind === 'vo' || isVoiceId(id);
    const tag = String(id);

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
    };

    if (tag.includes('heartbeat')) {
      osc('sine', 68, 0.09, 0.05, 0);
      osc('sine', 52, 0.11, 0.04, 0.22);
      return;
    }
    if (tag.includes('glass')) {
      const buf = noiseBuffer(0.22);
      if (buf) {
        const src = a.createBufferSource();
        const g = a.createGain();
        const f = a.createBiquadFilter();
        src.buffer = buf;
        f.type = 'highpass';
        f.frequency.value = 1800;
        g.gain.setValueAtTime(0.08, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
        src.connect(f);
        f.connect(g);
        g.connect(a.destination);
        src.start(now);
      }
      osc('square', 1240 + (h % 400), 0.08, 0.03, 0);
      return;
    }
    if (tag.includes('stamp') || tag.includes('slam') || tag.includes('heavy')) {
      osc('sine', 70 + (h % 30), 0.22, 0.07, 0);
      osc('triangle', 38, 0.28, 0.05, 0.02);
      return;
    }
    if (tag.includes('rain')) {
      const buf = noiseBuffer(0.5);
      if (!buf) return;
      const src = a.createBufferSource();
      const g = a.createGain();
      const f = a.createBiquadFilter();
      src.buffer = buf;
      src.loop = false;
      f.type = 'lowpass';
      f.frequency.value = 900;
      g.gain.value = 0.03;
      src.connect(f);
      f.connect(g);
      g.connect(a.destination);
      src.start(now);
      return;
    }
    if (tag.includes('slash') || tag.includes('hit') || tag.includes('roll')) {
      const buf = noiseBuffer(0.08);
      if (buf) {
        const src = a.createBufferSource();
        const g = a.createGain();
        src.buffer = buf;
        g.gain.setValueAtTime(0.04, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
        src.connect(g);
        g.connect(a.destination);
        src.start(now);
      }
      osc('square', 220 + (h % 640), 0.05, 0.02, 0);
      return;
    }
    if (voice) {
      osc('sine', 90 + (h % 40), 0.28, 0.035, 0);
      osc('sine', 140 + (h % 20), 0.18, 0.02, 0.05);
      return;
    }
    osc('square', 220 + (h % 640), 0.05, 0.02, 0);
  }

  function stopPad() {
    if (!padNodes) return;
    try { padNodes.g.gain.exponentialRampToValueAtTime(0.0001, (ac ? ac.currentTime : 0) + 0.2); } catch { /* ignore */ }
    try { padNodes.o.stop((ac ? ac.currentTime : 0) + 0.25); } catch { /* ignore */ }
    padNodes = null;
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
    // Pausing a still-loading element aborts the request (Playwright requestfailed).
    const stop = () => { if (el.dead) safePause(el); };
    if (el.readyState >= 2) stop();
    else el.addEventListener('canplay', stop, { once: true });
  }

  function playBgm(id, fadeOrOpts) {
    if (!id) return;
    if (!unlocked) {
      pendingBgm = { id, opts: fadeOrOpts };
      return;
    }
    const fadeSec = fadeFrom(fadeOrOpts, 0.8);
    if (currentId === id && current && !current.dead) return;
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
    const started = el.play();
    if (started && typeof started.catch === 'function') {
      started.catch((err) => {
        if (autoplayFail(err)) pendingBgm = { id, opts: fadeOrOpts };
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
  }

  function stopVo() {
    voCount = 0;
    voActiveId = null;
    if (voEl) {
      safePause(voEl);
      voEl = null;
    }
    voPromise = Promise.resolve(0);
    duckGoal = 1;
  }

  function playSfx(id, opts = {}) {
    if (!id || !unlocked) return;
    if (isVoiceId(id)) {
      playVo(id, opts);
      return;
    }
    const resolved = resolveAssetId(id);
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
      beep(resolved, 'sfx');
      return;
    }
    const path = getAsset(resolved);
    if (!path) {
      missing.add(resolved);
      beep(resolved, 'sfx');
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

    const entry = { el, id: resolved, kind: 'sfx' };
    live.add(entry);

    const fail = () => {
      missing.add(resolved);
      release(entry);
      beep(resolved, 'sfx');
    };
    const gen = (el._gen = (el._gen || 0) + 1);
    el.onerror = () => { if (el._gen === gen) fail(); };
    el.onended = () => { if (el._gen === gen && !el.loop) release(entry); };

    const started = el.play();
    if (started && typeof started.catch === 'function') {
      started.catch((err) => {
        if (autoplayFail(err)) return;
        if (el.error) fail();
      });
    }
  }

  function playVo(id, opts = {}) {
    if (!id || !unlocked) {
      return { duration: 0, promise: Promise.resolve(0) };
    }
    const resolved = resolveAssetId(id);
    if (voActiveId === resolved && voEl && !voEl.paused) {
      const duration = Number.isFinite(voEl.duration) ? voEl.duration : 0;
      return { duration, promise: voPromise };
    }

    const options = opts && typeof opts === 'object' ? opts : {};
    voCount += 1;
    voActiveId = resolved;
    duck(options.duck == null ? 0.24 : options.duck);

    let settle;
    const promise = new Promise((resolve) => { settle = resolve; });
    voPromise = promise;
    const handle = { duration: 0.4, promise };

    const done = (dur) => {
      handle.duration = dur;
      if (voActiveId === resolved) voActiveId = null;
      voCount = Math.max(0, voCount - 1);
      if (voCount <= 0) {
        voCount = 0;
        duckGoal = 1;
      }
      if (voEl && voEl._voId === resolved) voEl = null;
      settle(dur);
    };

    if (missing.has(resolved)) {
      beep(resolved, 'vo');
      window.setTimeout(() => done(0.35), 350);
      return handle;
    }
    const path = getAsset(resolved);
    if (!path) {
      missing.add(resolved);
      beep(resolved, 'vo');
      window.setTimeout(() => done(0.35), 350);
      return handle;
    }

    const el = new Audio(path);
    el.preload = 'auto';
    el._voId = resolved;
    setVol(el, voGain(options.volume == null ? 1 : options.volume));
    voEl = el;

    el.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(el.duration) && el.duration > 0) handle.duration = el.duration;
    });
    el.addEventListener('ended', () => done(handle.duration), { once: true });
    el.addEventListener('error', () => {
      missing.add(resolved);
      beep(resolved, 'vo');
      done(0.35);
    }, { once: true });

    const started = el.play();
    if (started && typeof started.catch === 'function') {
      started.catch((err) => {
        if (autoplayFail(err)) {
          done(handle.duration);
          return;
        }
        if (el.error) {
          missing.add(resolved);
          beep(resolved, 'vo');
          done(0.35);
        }
      });
    }
    return handle;
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
    for (const entry of Array.from(live)) release(entry);
    duckMul = 1;
    duckGoal = 1;
  }

  function init(ctx) {
    const gesture = () => unlock();
    window.addEventListener('pointerdown', gesture, { passive: true });
    window.addEventListener('keydown', gesture);
    window.addEventListener('touchstart', gesture, { passive: true });

    ctx.bus.on(EVENTS.FIGHT_START, () => playBgm('bgm.p1', { fade: 0.6 }));
    ctx.bus.on(EVENTS.PHASE_CHANGE, ({ phase }) => {
      const id = phase === 2 ? 'bgm.p2' : phase === 3 ? 'bgm.p3' : 'bgm.p1';
      playBgm(id, { fade: 0.9 });
    });
    ctx.bus.on(EVENTS.ENDING_TRIGGER, ({ id }) => {
      playBgm(id === 'B' ? 'bgm.endB' : 'bgm.endA', { fade: 0.5 });
    });
    ctx.bus.on(EVENTS.STATE_CHANGE, ({ to }) => {
      if (to === 'title' || to === 'disclaimer' || to === 'select') playBgm('bgm.title', { fade: 0.8 });
      if (to === 'banned') stopBgm(0.25);
      if (to === 'credits') stopBgm(0.8);
    });
    // Dario plays its own vo.* inside dario.js. A second listener here
    // doubled every line (and could pick a different take).
  }

  function setVolume(partial) {
    if (!partial || typeof partial !== 'object') return;
    if (partial.master != null) master = clamp01(partial.master);
    if (partial.music != null) music = clamp01(partial.music);
    if (partial.sfx != null) sfxVol = clamp01(partial.sfx);
    if (partial.vo != null) voVol = clamp01(partial.vo);
    applyBgmVolumes();
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
  };
}
