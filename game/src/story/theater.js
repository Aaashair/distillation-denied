// OWNER: W5
// Full-screen DOM storyboard. Panels are painted onto an offscreen pixel canvas
// (imageSmoothingEnabled=false) then shown with image-rendering:pixelated.
// Scanline / dither frame + typewriter subtitles (selected language via bi()).
// Click / Space / Enter completes the typewriter, then advances.

import { EVENTS } from '../core/contracts.js';
import { NAMES, bi, UI } from '../data/lines.js';
import { getAsset, loadImage } from '../config/assets.js';
import { SHOTS as SHOTS_A } from './endingA.js';
import { SHOTS as SHOTS_B } from './endingB.js';

/** W1 bi() will return the title language after merge; until then it may still join both. */
function lineText(pair) {
  if (!pair) return '';
  if (typeof pair === 'string') return pair;
  return bi(pair);
}

function isCjk(text) {
  return /[\u4e00-\u9fff]/.test(String(text || ''));
}

const LISTS = { A: SHOTS_A, B: SHOTS_B };
const SAVE_KEY = 'dd.endings.v1';
const ZH_CPS = 28;
const EN_CPS = 58;
const failedArt = new Set();
const PX_W = 320;
const PX_H = 180;

const KB_CLASS = {
  up: 'kb-up',
  down: 'kb-down',
  in: 'kb-in',
  out: 'kb-out',
  left: 'kb-left',
  right: 'kb-right',
  push: 'kb-push',
};

let root;
let cropEl;
let artEl;
let pxCanvas;
let pxg;
let vidEl;
let placeholderEl;
let fxLayer;
let flashEl;
let crackEl;
let riftEl;
let rainEl;
let stampEl;
let stampImg;
let stampText;
let darkenEl;
let vignetteEl;
let scanEl;
let ditherEl;
let creditsEl;
let speakerEl;
let subZhEl;
let subEnEl;
let numEl;
let numZhEl;
let numEnEl;
let hintEl;

let shots = [];
let index = 0;
let elapsed = 0;
let lock = 0;
let endingId = null;
let distillFrom = 0;
let playing = false;
let skipType = false;
let voPending = 0;
let savedScale = 1;
let didSaveScale = false;
let canvasEl = null;
/** @type {Set<string>} */
let loops = new Set();
let shotToken = 0;
/** Ending BGM applied to first theater shot only (per-shot advance always hard-stops audio). */
let sessionBgm = null;

function fxList(shot) {
  const f = shot && shot.fx;
  if (!f) return [];
  if (Array.isArray(f)) return f;
  return String(f).split(/\s+/).filter(Boolean);
}

function speakerName(shot) {
  const key = shot && shot.speakerKey;
  if (!key) return '';
  const value = NAMES[key];
  if (!value) return '';
  if (typeof value === 'string') return value;
  return lineText(value);
}

function persistEnding(ctx, id) {
  if (ctx.endingsUnlocked) ctx.endingsUnlocked[id] = true;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[id] = true;
    localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
  } catch { /* ignore quota / private mode */ }
}

function show(el, on) {
  if (!el) return;
  el.classList.toggle('is-hidden', !on);
}

function restartAnim(el, className) {
  if (!el) return;
  el.className = el.className.split(/\s+/).filter((c) => c && !c.startsWith('kb-')).join(' ');
  if (!className) return;
  void el.offsetWidth;
  el.classList.add(className);
}

function restoreWorld(ctx) {
  if (didSaveScale && ctx.time) {
    ctx.time.setScale(savedScale);
    if (ctx.debug) ctx.debug.timeScale = ctx.time.timeScale;
  }
  didSaveScale = false;
  if (canvasEl) canvasEl.style.filter = '';
  if (ctx.camera && ctx.debug && ctx.debug.camFov) {
    ctx.camera.fov = ctx.debug.camFov;
    ctx.camera.updateProjectionMatrix();
  }
}

function stopLoops(ctx) {
  if (!ctx.audio) return;
  for (const id of loops) {
    if (ctx.audio.stopSfx) ctx.audio.stopSfx(id, { fade: 0 });
  }
  loops = new Set();
}

function theaterOwnerToken(ctx) {
  if (ctx.audio?.getTheaterOwnerToken) return ctx.audio.getTheaterOwnerToken();
  if (ctx.audio?.getTheaterShotGen) return ctx.audio.getTheaterShotGen();
  return shotToken;
}

function hardStopShotAudio(ctx) {
  voPending = 0;
  stopLoops(ctx);
  if (ctx.audio?.invalidateTheaterShot) ctx.audio.invalidateTheaterShot();
  else {
    ctx.audio?.stopVo?.();
    ctx.audio?.stopBgm?.(0.02);
  }
  try {
    vidEl.pause();
    vidEl.removeAttribute('src');
  } catch { /* ignore */ }
}

function sfxId(sfx) {
  if (!sfx) return '';
  return typeof sfx === 'string' ? sfx : (sfx.id || '');
}

function sfxIsLoop(sfx) {
  if (!sfx) return false;
  if (typeof sfx === 'string') return sfx === 'sfx.rain' || sfx === 'sfx.heartbeat';
  return !!sfx.loop;
}

function eachSfx(sfx, fn) {
  if (!sfx) return;
  if (Array.isArray(sfx)) {
    for (let i = 0; i < sfx.length; i += 1) eachSfx(sfx[i], fn);
    return;
  }
  fn(sfx);
}

function playOneSfx(ctx, sfx, ownerTok) {
  if (!sfx || !ctx.audio) return;
  const scope = { scope: 'theater', theaterOwnerToken: ownerTok };
  if (typeof sfx === 'string') {
    ctx.audio.playSfx(sfx, sfxIsLoop(sfx)
      ? { ...scope, loop: true, fadeOut: 0, maxDuration: 0 }
      : scope);
    return;
  }
  ctx.audio.playSfx(sfx.id, { ...sfx, ...scope });
}

function applyAudio(ctx, shot) {
  const ownerTok = theaterOwnerToken(ctx);
  const scope = { scope: 'theater', theaterOwnerToken: ownerTok };
  const want = new Set();
  eachSfx(shot.sfx, (s) => {
    if (sfxIsLoop(s) && sfxId(s)) want.add(sfxId(s));
  });
  for (const id of loops) {
    if (!want.has(id) && ctx.audio && ctx.audio.stopSfx) ctx.audio.stopSfx(id, { fade: 0 });
  }
  eachSfx(shot.sfx, (s) => {
    const id = sfxId(s);
    if (sfxIsLoop(s) && loops.has(id)) return;
    playOneSfx(ctx, s, ownerTok);
  });
  loops = want;

  if (shot.stopBgm && ctx.audio && ctx.audio.stopBgm) {
    ctx.audio.stopBgm(shot.stopBgm === true ? 0.05 : shot.stopBgm);
  } else if (shot.bgm) {
    ctx.audio.playBgm(shot.bgm, { ...scope, fade: 0.6 });
  } else if (index === 0 && sessionBgm) {
    ctx.audio.playBgm(sessionBgm, { ...scope, fade: 0.45 });
  }
  if (shot.duck != null && ctx.audio && ctx.audio.duck) ctx.audio.duck(shot.duck);
  else if (!shot.vo && ctx.audio && ctx.audio.duck) ctx.audio.duck(1);

  voPending = 0;
  if (shot.vo && ctx.audio && ctx.audio.playVo) {
    voPending = 1;
    const token = shotToken;
    const voTokAtPlay = ownerTok;
    const handle = ctx.audio.playVo(shot.vo, scope);
    const p = handle && handle.promise;
    if (p && typeof p.then === 'function') {
      p.then(() => {
        if (shotToken !== token) return;
        if (theaterOwnerToken(ctx) !== voTokAtPlay) return;
        voPending = 0;
      });
    } else {
      voPending = 0;
    }
  }
}

function applyCamera(ctx, shot, t01) {
  const cam = ctx.camera;
  if (!cam || !shot.live || !shot.camera) return;
  const player = ctx.player;
  const boss = ctx.boss;
  const px = player && player.position ? player.position.x : 0;
  const py = player && player.position ? player.position.y : 0;
  const pz = player && player.position ? player.position.z : 0;
  const bx = boss && boss.position ? boss.position.x : 0;
  const by = boss && boss.height ? boss.height * 0.55 : 1.8;
  const bz = boss && boss.position ? boss.position.z : 0;
  const k = Math.max(0, Math.min(1, t01));
  const kind = shot.camera;

  if (kind === 'slowmo' || kind === 'hold' || kind === 'freeze') {
    cam.position.set(px + 2.8, py + 2.15, pz + 5.2);
    cam.lookAt(px, py + 1.05, pz);
    cam.fov = 52;
  } else if (kind === 'lookUp') {
    cam.position.set(px + 1.2, py + 2.4 + k * 5, pz + 5.5 - k * 1.4);
    cam.lookAt(px, py + 2 + k * 16, pz);
    cam.fov = 58 + k * 8;
  } else if (kind === 'pullBack') {
    const d = 7 + k * 16;
    cam.position.set(bx + d * 0.35, by + 2 + k * 9, bz + d);
    cam.lookAt(bx, by, bz);
    cam.fov = 55;
  }
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
}

function applyCanvasFilter(shot) {
  if (!canvasEl) return;
  const fx = fxList(shot);
  if (fx.includes('desaturate')) {
    canvasEl.style.filter = 'grayscale(0.88) contrast(1.12) brightness(0.78) saturate(0.4)';
  } else if (fx.includes('noir')) {
    canvasEl.style.filter = 'grayscale(0.35) contrast(1.05)';
  } else {
    canvasEl.style.filter = '';
  }
}

function paintPixel(img) {
  if (!pxg || !pxCanvas || !img) return;
  const srcW = img.naturalWidth || img.width || 1;
  const srcH = img.naturalHeight || img.height || 1;
  let factor = 1;
  if (srcW > 512 || srcH > 360) {
    factor = Math.max(2, Math.round(Math.min(srcW / PX_W, srcH / PX_H)));
  }
  const dw = Math.max(1, Math.round(srcW / factor));
  const dh = Math.max(1, Math.round(srcH / factor));
  if (pxCanvas.width !== dw) pxCanvas.width = dw;
  if (pxCanvas.height !== dh) pxCanvas.height = dh;
  pxg.imageSmoothingEnabled = false;
  pxg.setTransform(1, 0, 0, 1, 0, 0);
  pxg.clearRect(0, 0, dw, dh);
  pxg.drawImage(img, 0, 0, dw, dh);
}

function clearPixel() {
  if (!pxg || !pxCanvas) return;
  pxg.clearRect(0, 0, pxCanvas.width, pxCanvas.height);
}

function wantHqArt(shot) {
  if (!shot || shot.hq === false) return false;
  if (shot.hq === true) return true;
  const id = shot.bg || shot.img;
  if (!id) return false;
  const p = getAsset(id) || '';
  return p.includes('/assets/v4/') || /\.(webp|png|jpe?g)$/i.test(p);
}

function loadArt(shot) {
  show(artEl, false);
  show(pxCanvas, false);
  show(vidEl, false);
  show(placeholderEl, false);
  const videoId = shot.video;
  const videoPath = videoId ? getAsset(videoId) : null;
  if (videoPath) {
    show(placeholderEl, false);
    show(vidEl, true);
    try {
      vidEl.pause();
    } catch { /* ignore */ }
    vidEl.src = videoPath;
    vidEl.loop = false;
    vidEl.muted = false;
    vidEl.playsInline = true;
    const play = vidEl.play();
    if (play && typeof play.catch === 'function') play.catch(() => {});
    return;
  }
  try { vidEl.removeAttribute('src'); } catch { /* ignore */ }

  const id = shot.bg || shot.img;
  const path = id && !failedArt.has(id) ? getAsset(id) : null;
  if (id && path) {
    const token = shotToken;
    const img = loadImage(id) || new Image();
    const paint = () => {
      if (shotToken !== token) return;
      const kb = typeof shot.kenBurns === 'string' ? shot.kenBurns : (shot.kenBurns ? 'in' : '');
      if (wantHqArt(shot)) {
        artEl.src = path;
        show(artEl, true);
        show(pxCanvas, false);
        clearPixel();
        restartAnim(artEl, KB_CLASS[kb] || '');
        show(placeholderEl, false);
        return;
      }
      paintPixel(img);
      show(pxCanvas, true);
      show(artEl, false);
      show(placeholderEl, false);
      restartAnim(pxCanvas, KB_CLASS[kb] || '');
    };
    if (img.complete && img.naturalWidth > 0) {
      paint();
      return;
    }
    img.onload = paint;
    img.onerror = () => {
      failedArt.add(id);
      if (shotToken !== token) return;
      show(pxCanvas, false);
      placeholderEl.textContent = shot.id || '';
      show(placeholderEl, true);
    };
    if (!img.src) img.src = path;
    return;
  }
  show(pxCanvas, false);
  clearPixel();
  if (shot.live || fxList(shot).includes('black') || fxList(shot).includes('credits') || shot.stamp) {
    show(placeholderEl, false);
    placeholderEl.textContent = '';
    return;
  }
  placeholderEl.textContent = shot.id || '';
  show(placeholderEl, true);
}

function renderCredits(shot) {
  creditsEl.replaceChildren();
  const lines = shot.credits || [];
  show(creditsEl, lines.length > 0);
  for (const line of lines) {
    const wrap = document.createElement('div');
    wrap.className = 'line';
    const span = document.createElement('span');
    span.className = 'zh';
    span.textContent = lineText(line);
    wrap.append(span);
    creditsEl.appendChild(wrap);
  }
}

function shotSubtitle(shot) {
  return lineText(shot && shot.subtitle);
}

function typedText(shot, seconds) {
  const full = shotSubtitle(shot);
  if (skipType) return { text: full, done: true };
  const cps = isCjk(full) ? ZH_CPS : EN_CPS;
  const n = Math.min(full.length, Math.floor(seconds * cps));
  return { text: full.slice(0, n), done: n >= full.length };
}

function distillCaption(value) {
  const n = Number(value);
  const shown = Number.isFinite(n) ? n.toFixed(2) : '0.00';
  return `${bi(UI.chain)} ${shown}%`;
}

function setSub(text) {
  subZhEl.textContent = text || '';
  subEnEl.textContent = '';
}

function applyCaptions(shot, typed) {
  speakerEl.textContent = speakerName(shot);
  setSub(typed ? typed.text : '');
  hintEl.textContent = shot.hint ? lineText(shot.hint) : bi(UI.theaterNext);
}

function renderShot(ctx) {
  const shot = shots[index];
  if (!shot) return;
  shotToken += 1;
  skipType = false;
  elapsed = 0;
  voPending = 0;

  const fx = fxList(shot);
  const live = !!shot.live || fx.includes('live');
  root.classList.toggle('is-live', live);
  root.classList.toggle('is-hq', wantHqArt(shot));
  root.classList.toggle('is-black', fx.includes('black') || fx.includes('credits'));
  root.classList.toggle('is-credits', fx.includes('credits'));
  root.classList.toggle('is-wait', !!shot.waitClick);
  root.dataset.ending = endingId || '';
  root.dataset.shot = shot.id || '';
  root.style.setProperty('--shot', shot.tint || '#141210');

  const typed = typedText(shot, 0);
  applyCaptions(shot, typed);

  const showNum = !!shot.zeroDistill;
  numEl.classList.toggle('is-hidden', !showNum);
  if (showNum) {
    numZhEl.textContent = distillCaption(distillFrom);
    numEnEl.textContent = '';
  }

  show(flashEl, fx.includes('flash'));
  if (fx.includes('flash')) {
    flashEl.style.animation = 'none';
    void flashEl.offsetWidth;
    flashEl.style.animation = '';
  }
  show(crackEl, fx.includes('crack'));
  show(riftEl, fx.includes('rift'));
  show(rainEl, fx.includes('rain'));
  show(darkenEl, fx.includes('darken') || fx.includes('noir'));
  show(vignetteEl, true);
  show(scanEl, !fx.includes('credits'));
  show(ditherEl, true);

  const wantStamp = fx.includes('stamp') || shot.stamp || shot.stampText;
  if (wantStamp) {
    stampText.textContent = shot.stampText || 'DISTILLATION DENIED';
    show(stampText, true);
    const stampId = shot.stamp;
    const path = stampId ? getAsset(stampId) : null;
    if (path) {
      stampImg.onerror = () => { show(stampImg, false); };
      stampImg.src = path;
      show(stampImg, true);
    } else {
      show(stampImg, false);
    }
    stampEl.style.animation = 'none';
    void stampEl.offsetWidth;
    stampEl.style.animation = '';
    show(stampEl, true);
  } else {
    show(stampEl, false);
    show(stampImg, false);
    show(stampText, false);
  }

  renderCredits(shot);
  loadArt(shot);
  applyCanvasFilter(shot);

  if (shot.timeScale != null && ctx.time) {
    if (!didSaveScale) {
      savedScale = ctx.time.timeScale;
      didSaveScale = true;
    }
    ctx.time.setScale(shot.timeScale);
    if (ctx.debug) ctx.debug.timeScale = ctx.time.timeScale;
  } else if (didSaveScale && ctx.time) {
    ctx.time.setScale(savedScale);
    if (ctx.debug) ctx.debug.timeScale = ctx.time.timeScale;
    didSaveScale = false;
  }

  applyAudio(ctx, shot);
  applyCamera(ctx, shot, 0);
  ctx.bus.emit(EVENTS.THEATER_SHOT, { endingId, id: shot.id, index });
}

function finish(ctx) {
  if (!playing) return;
  playing = false;
  shotToken += 1;
  sessionBgm = null;
  hardStopShotAudio(ctx);
  if (ctx.audio?.endTheaterSession) ctx.audio.endTheaterSession();
  restoreWorld(ctx);
  try { vidEl.pause(); vidEl.removeAttribute('src'); } catch { /* ignore */ }
  root.classList.add('is-hidden');
  ctx.distill = 0;
  ctx.bus.emit(EVENTS.DISTILL_PROGRESS, { value: 0 });
  ctx.bus.emit(EVENTS.THEATER_DONE, { endingId });
}

function typewriterDone(shot) {
  const full = shotSubtitle(shot);
  return skipType || !full || subZhEl.textContent === full;
}

function snapDistill(ctx) {
  ctx.distill = 0;
  distillFrom = 0;
  numZhEl.textContent = distillCaption(0);
  numEnEl.textContent = '';
  ctx.bus.emit(EVENTS.DISTILL_PROGRESS, { value: 0 });
}

function advance(ctx) {
  if (!playing || lock > 0) return;
  const shot = shots[index];
  if (shot && !typewriterDone(shot)) {
    skipType = true;
    const full = typedText(shot, 99);
    setSub(full.text);
    lock = 0.12;
    return;
  }
  if (shot && shot.zeroDistill && ctx.distill > 0.05) {
    snapDistill(ctx);
    elapsed = Math.max(elapsed, shot.duration || 2);
    lock = 0.16;
    return;
  }
  if (shot && shot.zeroDistill) snapDistill(ctx);
  hardStopShotAudio(ctx);
  lock = 0.18;
  index += 1;
  elapsed = 0;
  if (index >= shots.length) {
    finish(ctx);
    return;
  }
  renderShot(ctx);
}

export function play(ctx, id) {
  endingId = id === 'B' ? 'B' : 'A';
  shots = LISTS[endingId] || [];
  index = 0;
  elapsed = 0;
  lock = 0.28;
  playing = true;
  skipType = false;
  voPending = 0;
  distillFrom = ctx.endingDistill || ctx.distill || 0;
  persistEnding(ctx, endingId);
  sessionBgm = endingId === 'B' ? 'bgm.endB' : 'bgm.endA';
  stopLoops(ctx);
  restoreWorld(ctx);
  if (ctx.audio?.beginTheaterSession) ctx.audio.beginTheaterSession();
  else if (ctx.audio) {
    ctx.audio.stopVo?.();
    ctx.audio.stopBgm?.(0.05);
  }
  canvasEl = document.getElementById('view');
  root.classList.remove('is-hidden');
  renderShot(ctx);
}

export function init(ctx) {
  canvasEl = document.getElementById('view');
  root = document.createElement('div');
  root.id = 'theater';
  root.className = 'is-hidden';

  const barTop = document.createElement('div');
  barTop.className = 'theater-bar top';
  const barBot = document.createElement('div');
  barBot.className = 'theater-bar bot';

  cropEl = document.createElement('div');
  cropEl.className = 'theater-crop';
  artEl = document.createElement('img');
  artEl.className = 'theater-art is-hidden';
  artEl.alt = '';
  artEl.draggable = false;
  pxCanvas = document.createElement('canvas');
  pxCanvas.className = 'theater-art theater-px is-hidden';
  pxCanvas.width = PX_W;
  pxCanvas.height = PX_H;
  pxg = pxCanvas.getContext('2d');
  if (pxg) pxg.imageSmoothingEnabled = false;
  vidEl = document.createElement('video');
  vidEl.className = 'theater-vid is-hidden';
  vidEl.setAttribute('playsinline', '');
  vidEl.preload = 'auto';
  placeholderEl = document.createElement('div');
  placeholderEl.className = 'theater-placeholder is-hidden';

  fxLayer = document.createElement('div');
  fxLayer.className = 'theater-fx';
  flashEl = document.createElement('div');
  flashEl.className = 'theater-flash is-hidden';
  crackEl = document.createElement('div');
  crackEl.className = 'theater-crack is-hidden';
  riftEl = document.createElement('div');
  riftEl.className = 'theater-rift is-hidden';
  rainEl = document.createElement('div');
  rainEl.className = 'theater-rain is-hidden';
  darkenEl = document.createElement('div');
  darkenEl.className = 'theater-darken is-hidden';
  vignetteEl = document.createElement('div');
  vignetteEl.className = 'theater-vignette is-hidden';
  scanEl = document.createElement('div');
  scanEl.className = 'theater-scan';
  ditherEl = document.createElement('div');
  ditherEl.className = 'theater-dither';
  stampEl = document.createElement('div');
  stampEl.className = 'theater-stamp is-hidden';
  stampImg = document.createElement('img');
  stampImg.alt = 'DISTILLATION DENIED';
  stampImg.draggable = false;
  stampImg.className = 'theater-stamp-img is-hidden';
  stampText = document.createElement('div');
  stampText.className = 'theater-stamp-text is-hidden';
  stampText.textContent = 'DISTILLATION DENIED';
  stampEl.append(stampImg, stampText);
  fxLayer.append(flashEl, crackEl, riftEl, rainEl, darkenEl, vignetteEl, scanEl, ditherEl, stampEl);

  cropEl.append(artEl, pxCanvas, vidEl, placeholderEl, fxLayer);

  creditsEl = document.createElement('div');
  creditsEl.className = 'theater-credits is-hidden';

  const captions = document.createElement('div');
  captions.className = 'theater-captions';
  speakerEl = document.createElement('div');
  speakerEl.id = 'theater-speaker';
  const subEl = document.createElement('p');
  subEl.id = 'theater-sub';
  subZhEl = document.createElement('span');
  subZhEl.className = 'zh';
  subEnEl = document.createElement('span');
  subEnEl.className = 'en';
  subEl.append(subZhEl, subEnEl);
  numEl = document.createElement('p');
  numEl.id = 'theater-num';
  numEl.className = 'is-hidden';
  numZhEl = document.createElement('span');
  numZhEl.className = 'zh';
  numEnEl = document.createElement('span');
  numEnEl.className = 'en';
  numEl.append(numZhEl, numEnEl);
  hintEl = document.createElement('p');
  hintEl.id = 'theater-advance';
  hintEl.className = 'fine';
  captions.append(speakerEl, subEl, numEl, hintEl);

  root.append(barTop, barBot, cropEl, creditsEl, captions);
  document.getElementById('ui-root').appendChild(root);

  root.addEventListener('mousedown', (event) => {
    if (ctx.state.current !== 'theater') return;
    if (event.target.closest && event.target.closest('#debug-panel')) return;
    advance(ctx);
  });
}

export function update(ctx, dt) {
  if (ctx.state.current !== 'theater') {
    if (playing) {
      playing = false;
      sessionBgm = null;
      hardStopShotAudio(ctx);
      if (ctx.audio?.endTheaterSession) ctx.audio.endTheaterSession();
      restoreWorld(ctx);
      root.classList.add('is-hidden');
    }
    return;
  }
  if (!playing) return;
  const step = Math.min(0.08, Math.max(0, dt || 0));
  if (lock > 0) lock -= step;
  const shot = shots[index];
  if (!shot) return;
  elapsed += step;

  const typed = typedText(shot, elapsed);
  setSub(typed.text);

  if (shot.zeroDistill) {
    const t = Math.min(1, elapsed / Math.max(0.6, (shot.duration || 2) * 0.85));
    const eased = 1 - (1 - t) * (1 - t);
    const value = distillFrom * (1 - eased);
    const shown = value <= 0.05 ? 0 : value;
    numZhEl.textContent = distillCaption(shown);
    numEnEl.textContent = '';
    ctx.distill = shown;
    if (t >= 1) {
      ctx.distill = 0;
      ctx.bus.emit(EVENTS.DISTILL_PROGRESS, { value: 0 });
    }
  }

  const dur = shot.duration || 0;
  const t01 = dur > 0 ? Math.min(1, elapsed / dur) : 1;
  applyCamera(ctx, shot, t01);

  const key = ctx.input.pressed('space') || ctx.input.pressed('enter');
  if (key) {
    advance(ctx);
    return;
  }
  const voiceBlocking = voPending > 0 && elapsed < dur + 1.15;
  if (!shot.waitClick && dur && elapsed >= dur && !voiceBlocking && typed.done) {
    advance(ctx);
  }
}

export function reset(ctx) {
  playing = false;
  shotToken += 1;
  sessionBgm = null;
  const c = ctx || { audio: null };
  hardStopShotAudio(c);
  if (c.audio?.endTheaterSession) c.audio.endTheaterSession();
  restoreWorld(c);
  root?.classList.add('is-hidden');
}
