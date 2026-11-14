/* DISTILLATION DENIED v2 — Canvas2D, no engine. */
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/core/contracts.js
  var BUILD_TAG = "v2";
  var TEAMS = Object.freeze({
    PLAYER: "player",
    ALLY: "ally",
    BOSS: "boss",
    NEUTRAL: "neutral"
  });
  var GAME_STATES = Object.freeze({
    TITLE: "title",
    DISCLAIMER: "disclaimer",
    SELECT: "select",
    INTRO: "intro",
    FIGHT: "fight",
    BANNED: "banned",
    CUTSCENE: "cutscene",
    THEATER: "theater",
    CREDITS: "credits",
    PAUSED: "paused"
  });
  var EVENTS = Object.freeze({
    /** @type {'state_change'} payload StateChange */
    STATE_CHANGE: "state_change",
    /** @type {'fight_start'} payload {charId:string} */
    FIGHT_START: "fight_start",
    /** @type {'fight_reset'} payload {charId:string} */
    FIGHT_RESET: "fight_reset",
    /** @type {'phase_change'} payload PhaseChange */
    PHASE_CHANGE: "phase_change",
    /** @type {'hit'} payload HitEvent */
    HIT: "hit",
    /** @type {'hit_stop'} payload {ms:number} */
    HIT_STOP: "hit_stop",
    /** @type {'flask_used'} payload FlaskEvent */
    FLASK_USED: "flask_used",
    /** @type {'flask_interrupted'} payload FlaskEvent */
    FLASK_INTERRUPTED: "flask_interrupted",
    /** @type {'perfect_guard'} payload {id?:string} */
    PERFECT_GUARD: "perfect_guard",
    /** @type {'guard_start'} payload {id:string} */
    GUARD_START: "guard_start",
    /** @type {'guard_end'} payload {id:string} */
    GUARD_END: "guard_end",
    /** @type {'player_death'} payload PlayerDeath */
    PLAYER_DEATH: "player_death",
    /** @type {'player_attack'} payload {id:string, name:string} */
    PLAYER_ATTACK: "player_attack",
    /** @type {'skill_used'} payload {id:string, name:string} */
    SKILL_USED: "skill_used",
    /** @type {'roll_start'} payload {id:string} */
    ROLL_START: "roll_start",
    /** @type {'roll_end'} payload {id:string} */
    ROLL_END: "roll_end",
    /** @type {'ally_down'} payload {id:string} */
    ALLY_DOWN: "ally_down",
    /** @type {'ally_revive'} payload {id:string} */
    ALLY_REVIVE: "ally_revive",
    /** @type {'ally_speech'} payload {id:string, text:{zh:string, en:string}} */
    ALLY_SPEECH: "ally_speech",
    /** @type {'boss_hp'} payload BossHp */
    BOSS_HP: "boss_hp",
    /** @type {'boss_attack'} payload {name:string, phase:number} */
    BOSS_ATTACK: "boss_attack",
    /** @type {'telegraph_start'} payload TelegraphEvent */
    TELEGRAPH_START: "telegraph_start",
    /** @type {'telegraph_resolve'} payload TelegraphEvent */
    TELEGRAPH_RESOLVE: "telegraph_resolve",
    /** @type {'ending_trigger'} payload {id:'A'|'B'} */
    ENDING_TRIGGER: "ending_trigger",
    /** @type {'theater_shot'} payload {endingId:string, id:string, index:number} */
    THEATER_SHOT: "theater_shot",
    /** @type {'theater_done'} payload {endingId:string} */
    THEATER_DONE: "theater_done",
    /** @type {'distill_progress'} payload {value:number} displayed 0–100 */
    DISTILL_PROGRESS: "distill_progress",
    /** @type {'dario_line'} payload {event:string, text:{zh:string, en:string}, priority:number} */
    DARIO_LINE: "dario_line",
    /** @type {'camera_shake'} payload {intensity:number, duration?:number} */
    CAMERA_SHAKE: "camera_shake",
    /** @type {'pause'} payload {from:string} */
    PAUSE: "pause",
    /** @type {'resume'} payload {} */
    RESUME: "resume",
    /** @type {'select_confirm'} payload {charId:string} */
    SELECT_CONFIRM: "select_confirm",
    /** @type {'retry'} payload {} */
    RETRY: "retry",
    /** @type {'banner'} payload {phase:number, zh:string, en:string} */
    BANNER: "banner",
    /** @type {'input_lock'} payload {locked:boolean, state:string} */
    INPUT_LOCK: "input_lock",
    /** @type {'god_mode'} payload {enabled:boolean} */
    GOD_MODE: "god_mode",
    /** @type {'lock_on'} payload {enabled:boolean} */
    LOCK_ON: "lock_on",
    /** @type {'skill_silence'} payload {{duration:number, until:number, zh:string, en:string}} */
    SKILL_SILENCE: "skill_silence",
    // --- v2 ---
    /** @type {'shot_fired'} payload {id:string, team:string, x:number, y:number} */
    SHOT_FIRED: "shot_fired",
    /** @type {'bullet_spawn'} payload {team:string, x:number, y:number, shape?:string} */
    BULLET_SPAWN: "bullet_spawn",
    /** @type {'skill_charge'} payload {id:string, t:number} */
    SKILL_CHARGE: "skill_charge",
    /** @type {'skill_release'} payload {id:string, name?:string, ratio?:number} */
    SKILL_RELEASE: "skill_release",
    /** @type {'shield_block'} payload {id:string, perfect:boolean, x:number, y:number} */
    SHIELD_BLOCK: "shield_block",
    /** @type {'telegraph_end'} payload TelegraphEvent */
    TELEGRAPH_END: "telegraph_end",
    /** @type {'phase_transition_start'} payload PhaseChange */
    PHASE_TRANSITION_START: "phase_transition_start",
    /** @type {'phase_transition_end'} payload {phase:number} */
    PHASE_TRANSITION_END: "phase_transition_end",
    /** @type {'safety_judgement'} payload {safeZones?:Array<{x:number,y:number,r:number}>} */
    SAFETY_JUDGEMENT: "safety_judgement",
    /** @type {'cutscene_beat'} payload {id:string, beat:string, t?:number} */
    CUTSCENE_BEAT: "cutscene_beat",
    /** @type {'vfx'} payload VfxRequest */
    VFX: "vfx",
    /** @type {'shake'} payload {mag:number, dur:number} pixels, seconds */
    SHAKE: "shake",
    /** @type {'flash'} payload {color:string, dur:number} */
    FLASH: "flash"
  });

  // src/core/bus.js
  function createBus() {
    const listeners2 = /* @__PURE__ */ new Map();
    function setFor(type) {
      let set = listeners2.get(type);
      if (!set) {
        set = /* @__PURE__ */ new Set();
        listeners2.set(type, set);
      }
      return set;
    }
    const bus2 = {
      on(type, fn) {
        setFor(type).add(fn);
        return () => bus2.off(type, fn);
      },
      once(type, fn) {
        const wrap = (payload) => {
          bus2.off(type, wrap);
          fn(payload);
        };
        return bus2.on(type, wrap);
      },
      off(type, fn) {
        const set = listeners2.get(type);
        if (set) set.delete(fn);
      },
      emit(type, payload) {
        const set = listeners2.get(type);
        if (!set || set.size === 0) return;
        for (const fn of [...set]) {
          try {
            fn(payload);
          } catch (err) {
            console.error(`[bus] ${type}`, err);
          }
        }
      },
      clear() {
        listeners2.clear();
      }
    };
    return bus2;
  }

  // src/config/balance.js
  var VIEW_W = 640;
  var VIEW_H = 360;
  var ROOM = Object.freeze({
    x: 32,
    y: 40,
    w: 416,
    h: 240,
    tile: 16,
    wall: 16
  });
  var INTRO_ROOM = Object.freeze({
    x: 136,
    y: 72,
    w: 208,
    h: 112,
    tile: 16,
    wall: 16
  });
  var INTRO_DOOR = Object.freeze({ x: 224, y: 72, w: 32, h: 18 });
  function innerOf(room) {
    const wall = room.wall || 0;
    return {
      x: room.x + wall,
      y: room.y + wall,
      w: room.w - wall * 2,
      h: room.h - wall * 2
    };
  }
  function activeRoom(state) {
    return state === "intro" ? INTRO_ROOM : ROOM;
  }
  function activeInner(state) {
    return innerOf(activeRoom(state));
  }
  function clampTo(actor, rect2) {
    const rad = actor.r || 0;
    const minX = rect2.x + rad;
    const maxX = rect2.x + rect2.w - rad;
    const minY = rect2.y + rad;
    const maxY = rect2.y + rect2.h - rad;
    if (actor.x < minX) actor.x = minX;
    else if (actor.x > maxX) actor.x = maxX;
    if (actor.y < minY) actor.y = minY;
    else if (actor.y > maxY) actor.y = maxY;
  }
  function inDoor(actor) {
    const d = INTRO_DOOR;
    return actor.x > d.x && actor.x < d.x + d.w && actor.y < d.y + d.h + (actor.r || 0);
  }
  var ROSTER_IDS = ["deepseek", "kimi", "glm"];
  var HURT_R = 3;
  var HURT_IFRAME = 0.8;
  var CONTACT_DMG = 12;
  var ROLL = Object.freeze({
    duration: 0.4,
    iframeStart: 0.04,
    iframeEnd: 0.34,
    distance: 64,
    cooldown: 0.55
  });
  var FLASK_TIME = 0.5;
  var FLASK_MOVE = 0.3;
  var MOVE_RESP = 0.06;
  var FLASK_ORDER = ["rtx5090", "h200", "b200"];
  var FLASKS = {
    rtx5090: { id: "rtx5090", cd: 5, heal: 0.3, icon: "icon.rtx5090", sfx: "sfx.flask" },
    h200: { id: "h200", cd: 10, heal: 0.5, clearR: 64, icon: "icon.h200", sfx: "sfx.fan" },
    b200: { id: "b200", cd: 20, heal: 1, superarmor: 3, armor: 0.6, icon: "icon.b200", sfx: "sfx.b200" }
  };
  var PLAYER = {
    deepseek: {
      id: "deepseek",
      hp: 100,
      speed: 120,
      color: "#2f6fe4",
      accent: "#d7f4ff",
      primary: {
        kind: "scatter",
        rate: 7,
        pellets: 3,
        // Full cone. Outer bolts land at ±half (±10°).
        spread: 20 * Math.PI / 180,
        dmg: 3.08,
        speed: 300,
        range: 192,
        r: 3,
        shape: "whale",
        color: "#7ee0ff"
      },
      skill: { kind: "flurry", dash: 80, iframe: 0.22, arcs: 8, arcTime: 0.5, dmg: 10.5, radius: 42, cd: 6 }
    },
    kimi: {
      id: "kimi",
      hp: 90,
      speed: 108,
      color: "#24365c",
      accent: "#d5deea",
      primary: {
        kind: "orb",
        rate: 1 / 0.33,
        pellets: 1,
        spread: 0,
        dmg: 11.2,
        speed: 200,
        range: 440,
        r: 6,
        pierce: 8,
        wobble: 36,
        shape: "moon",
        color: "#c4b5fd"
      },
      skill: {
        kind: "beam",
        chargeMin: 0.3,
        chargeMax: 1.5,
        move: 0.4,
        dmgMin: 37.5,
        dmgMax: 150,
        widthMin: 6,
        widthMax: 18,
        dur: 0.35,
        cd: 7
      }
    },
    glm: {
      id: "glm",
      hp: 130,
      speed: 96,
      color: "#6d3fa0",
      accent: "#d8b15a",
      primary: {
        kind: "bolt",
        rate: 4.2,
        pellets: 1,
        spread: 0,
        dmg: 9.1,
        speed: 240,
        range: 96,
        r: 4,
        knock: 10,
        shape: "z",
        color: "#ffe08a"
      },
      skill: { kind: "shield", arc: 100 * Math.PI / 180, move: 0.5, hold: 2.5, cd: 1.5, perfect: 0.2, ring: 56, ringDmg: 37.5 }
    }
  };
  var BOSS_MAX_HP = 3e3;
  var PHASE_P2_AT = 0.7;
  var PHASE_P3_AT = 0.4;
  var ENDING_B_RATIO = 0.25;
  var PHASE_INVULN = 2.5;
  var PHASE_PUSH = 40;
  var PHASE_SLOWMO = 0.3;
  var PHASE_SLOW_SCALE = 0.3;
  var PHASE_DAMAGE_MUL = { 1: 1, 2: 1.2, 3: 1.4 };
  var BULLET_DMG = { 1: 10, 2: 13, 3: 16 };
  var BOSS_RADIUS = { 1: 10, 2: 13, 3: 18 };
  var PHASE_GAP = { 1: [0.6, 1.1], 2: [0.6, 1.1], 3: [0.45, 0.8] };
  var OPENING_DELAY = 1.15;
  var SILENCE_SEC = 1.5;
  var JUDGMENT_FIRST = 8;
  var JUDGMENT_INTERVAL = 25;
  var ACCEL_AT = 0.32;
  var ACCEL_WINDUP = 0.85;
  var TARGET_PLAYER_P = 0.65;
  var TARGET_STREAK = 2;
  var ENEMY_BULLET_SOFT_CAP = 104;
  var SPIRAL_ARM_AT = 0.55;
  var CAPE_CHAIN_AT = 0.55;
  var MOVE = {
    1: { hop: 0.26, hopArc: 11, band0: 64, band1: 112 },
    2: { speed: 66, band0: 86, band1: 136 },
    3: { speed: 42, band0: 74, band1: 142, blink: 0.42, bob: 16 }
  };
  var HEAVY = {
    dash: 18,
    spin: 20,
    sigil: 18,
    cape: 30,
    deep: 40,
    slam: 45,
    slamRing: 20,
    judgement: 60
  };
  var SILENCE_LABEL = { zh: "\u5185\u5BB9\u653F\u7B56\u6C89\u9ED8", en: "Content-policy silence" };
  var SIGIL_BUBBLE = { zh: "\u6211\u6CA1\u6CD5\u5E2E\u4F60\u3002", en: "I can't help with that." };
  var JUDGEMENT_CALL = {
    zh: "\u5B89\u5168\u795E\u7F5A\u3002\u7AD9\u8FDB\u767D\u5708\u3002",
    en: "Safety Judgement. Stand in a white circle."
  };
  var PATTERN = {
    p1_refusal: {
      name: { zh: "\u793C\u8C8C\u62D2\u7B54", en: "Polite Refusal" },
      wind: 0.5,
      volleys: 3,
      count: 5,
      spread: 0.78,
      gap: 0.48,
      speed: 156,
      shape: "petal",
      color: "#ff6b45",
      r: 3.5,
      life: 1.7
    },
    p1_rings: {
      name: { zh: "5-7-5 \u4FF3\u53E5\u73AF", en: "Haiku Rings" },
      wind: 0.6,
      counts: [5, 7, 5],
      gap: 0.44,
      speed: 58,
      shape: "glyph",
      color: "#f0b429",
      r: 5,
      life: 3.4
    },
    p1_topic: {
      name: { zh: "\u6362\u4E2A\u8BDD\u9898\u5427", en: "Change the Topic" },
      wind: 0.6,
      speed: 340,
      petalEvery: 16,
      petalSpeed: 30,
      shape: "petal",
      color: "#ff8d6a",
      r: 3.5,
      life: 3.4
    },
    p1_spin: {
      name: { zh: "\u62D2\u7B54\u56DE\u65CB", en: "Refusal Spin" },
      wind: 0.7,
      r: 44,
      bullets: 14,
      speed: 78,
      shape: "petal",
      color: "#ffb089",
      bulletR: 3.5,
      life: 2.4
    },
    p2_spiral: {
      name: { zh: "\u5BAA\u7AE0\u87BA\u65CB", en: "Constitution Spiral" },
      wind: 0.8,
      hold: 4,
      interval: 0.13,
      turn: 0.24,
      speed: 92,
      shape: "glyph",
      color: "#f0b429",
      r: 5,
      life: 2.6
    },
    p2_sigils: {
      name: { zh: "\u62D2\u7B54\u6CD5\u9635", en: "Refusal Sigils" },
      wind: 1,
      r: 26,
      count: 3
    },
    p2_volley: {
      name: { zh: "\u5341\u56DB\u884C\u8BD7", en: "Sonnet Volley" },
      wind: 0.45,
      shots: 14,
      short: { speed: 228, r: 2.5, color: "#f4f1ea" },
      long: { speed: 132, r: 4.5, color: "#e7c27a" },
      shape: "quill",
      life: 1.6
    },
    p2_wall: {
      name: { zh: "\u5BAA\u7AE0\u4E4B\u5899", en: "Charter Wall" },
      wind: 0.9,
      pause: 0.34,
      gap: 64,
      step: 12,
      speed: 104,
      shape: "block",
      color: "#d4533a",
      r: 6,
      life: 4.2
    },
    p2_cape: {
      name: { zh: "\u62AB\u98CE\u6A2A\u626B", en: "Cape Sweep" },
      wind: 0.8,
      cone: Math.PI,
      r: 90,
      dashWind: 0.48,
      dash: 110
    },
    p3_deep: {
      name: { zh: "\u6DF1\u5EA6\u601D\u8003", en: "Deep Thought" },
      fake: 0.4,
      wind: 1,
      cone: 120 * Math.PI / 180,
      r: 112
    },
    p3_feather: {
      name: { zh: "\u516D\u7FFC\u7FBD\u5F39", en: "Six-Wing Feathers" },
      wind: 0.8,
      hold: 2.15,
      interval: 0.17,
      speed: 74,
      homing: 0.62,
      shape: "feather",
      color: "#ffe7a8",
      r: 3.5,
      life: 2.5
    },
    p3_slam: {
      name: { zh: "\u5DE8\u5251\u4E0B\u5288", en: "Greatsword Slam" },
      wind: 0.9,
      width: 24,
      ring: 22,
      ringMax: 160,
      ringSpeed: 100,
      ringThick: 14
    },
    p3_chain: {
      name: { zh: "\u601D\u7EF4\u94FE", en: "Chain of Thought" },
      wind: 0.7,
      hold: 3.15,
      spokes: 4,
      radii: [34, 52, 70, 90],
      spin: 0.82,
      shape: "node",
      color: "#e7c27a",
      r: 4.5
    },
    p3_smite: {
      name: { zh: "\u5B89\u5168\u795E\u7F5A", en: "Safety Judgement" },
      wind: 2.5,
      safeR: 22,
      safeCount: 3
    },
    p3_accel: {
      name: { zh: "\u63A8\u7406\u52A0\u901F", en: "Reasoning Acceleration" },
      wind: 0
    }
  };
  var PATTERN_POOL = {
    1: ["p1_refusal", "p1_rings", "p1_topic", "p1_spin"],
    2: ["p2_spiral", "p2_sigils", "p2_volley", "p2_wall", "p2_cape"],
    3: ["p3_deep", "p3_feather", "p3_slam", "p3_chain"]
  };
  var ALLY_HP = 60;
  var ALLY_DMG_MUL = 0.35;
  var ALLY_FIRE_SCALE = 0.55;
  var ALLY_REVIVE = 12;
  var ALLY_REVIVE_HP = 0.5;
  var ALLY_P3_HP_SCALE = 0.7;
  var ALLY_SKILL_CD = 13;
  var ALLY_TALK_MIN = 10;
  var ALLY_TALK_MAX = 18;
  var ALLY_DODGE_CHANCE = 0.65;
  var ALLY_BAND = {
    deepseek: [60, 90],
    kimi: [120, 170],
    glm: [50, 80]
  };
  var ALLY_SPEED = {
    deepseek: 100,
    kimi: 90,
    glm: 80
  };
  var VFX = Object.freeze({
    hitStopPlayer: 60,
    hitStopHeavy: 70,
    hitStopSkill: 30,
    perfectStop: 80,
    shakeHit: 3,
    shakeHeavy: 6,
    shakeSkill: 4,
    flashHit: 0.1,
    numLife: 0.8,
    sparkLife: 0.5,
    shockLife: 0.45,
    particleCap: 420,
    afterimageCap: 20,
    decalCap: 36
  });
  var PALETTE = Object.freeze({
    ivory: "#f4f1ea",
    gold: "#d8b15a",
    sky: "#9cc9f0",
    ink: "#1b1530",
    coral: "#e07a5f",
    danger: "#c23b3b"
  });

  // src/core/input.js
  var ALIAS = {
    w: ["KeyW"],
    a: ["KeyA"],
    s: ["KeyS"],
    d: ["KeyD"],
    q: ["KeyQ"],
    e: ["KeyE"],
    r: ["KeyR"],
    space: ["Space"],
    shift: ["ShiftLeft", "ShiftRight"],
    lmb: ["Mouse0"],
    rmb: ["Mouse2"],
    mmb: ["Mouse1"],
    1: ["Digit1"],
    2: ["Digit2"],
    3: ["Digit3"],
    esc: ["Escape"],
    escape: ["Escape"],
    p: ["KeyP"],
    up: ["ArrowUp"],
    down: ["ArrowDown"],
    left: ["ArrowLeft"],
    right: ["ArrowRight"],
    enter: ["Enter"],
    tab: ["Tab"]
  };
  var BLOCK_DEFAULT = /* @__PURE__ */ new Set([
    "Space",
    "Tab",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight"
  ]);
  function codesOf(name) {
    const key = String(name);
    if (ALIAS[key]) return ALIAS[key];
    const lower = key.toLowerCase();
    if (ALIAS[lower]) return ALIAS[lower];
    return [key];
  }
  var DIRS = ["e", "se", "s", "sw", "w", "nw", "n", "ne"];
  function facingName(x, y) {
    if (!x && !y) return "s";
    const a = Math.atan2(y, x);
    const i = Math.round(a / (Math.PI / 4));
    return DIRS[(i % 8 + 8) % 8];
  }
  function createInput(canvas2) {
    const held = /* @__PURE__ */ new Set();
    const edge2 = /* @__PURE__ */ new Set();
    const consumed = /* @__PURE__ */ new Set();
    const pointer = {
      x: VIEW_W * 0.5,
      y: VIEW_H * 0.5,
      clientX: 0,
      clientY: 0,
      dx: 0,
      dy: 0,
      onUi: false
    };
    const pressSeq = /* @__PURE__ */ new Map();
    let pressN = 1;
    let edgesOpen = true;
    let listening = false;
    let mapper = (x, y) => ({ x, y });
    function isTypingTarget(target) {
      const el = target || document.activeElement;
      if (!el || !el.tagName) return false;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
    }
    function onUiTarget(target) {
      return !!(target && target.closest && target.closest("#ui-root"));
    }
    function markEdge(code) {
      if (!held.has(code)) {
        edge2.add(code);
        pressSeq.set(code, pressN);
        pressN += 1;
      }
      held.add(code);
    }
    function axisDir(neg, pos) {
      const n = held.has(neg);
      const p = held.has(pos);
      if (n && p) return (pressSeq.get(pos) || 0) >= (pressSeq.get(neg) || 0) ? 1 : -1;
      if (n) return -1;
      if (p) return 1;
      return 0;
    }
    function mapPointer(clientX, clientY) {
      pointer.clientX = clientX;
      pointer.clientY = clientY;
      const p = mapper(clientX, clientY);
      if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) {
        pointer.x = p.x;
        pointer.y = p.y;
      }
    }
    function anyHeld(codes) {
      for (let i = 0; i < codes.length; i += 1) if (held.has(codes[i])) return true;
      return false;
    }
    function anyEdge(codes) {
      for (let i = 0; i < codes.length; i += 1) if (edge2.has(codes[i])) return true;
      return false;
    }
    function onKeyDown(e) {
      if (e.repeat) return;
      if (isTypingTarget(e.target)) return;
      if (BLOCK_DEFAULT.has(e.code)) e.preventDefault();
      markEdge(e.code);
    }
    function onKeyUp(e) {
      held.delete(e.code);
      pressSeq.delete(e.code);
    }
    function onMouseDown(e) {
      mapPointer(e.clientX, e.clientY);
      pointer.onUi = onUiTarget(e.target);
      const code = e.button === 0 ? "Mouse0" : e.button === 1 ? "Mouse1" : e.button === 2 ? "Mouse2" : "";
      if (!code) return;
      if (e.button === 2 || e.button === 1) e.preventDefault();
      markEdge(code);
    }
    function onMouseUp(e) {
      const code = e.button === 0 ? "Mouse0" : e.button === 1 ? "Mouse1" : e.button === 2 ? "Mouse2" : "";
      if (code) {
        held.delete(code);
        pressSeq.delete(code);
      }
    }
    function onMouseMove(e) {
      mapPointer(e.clientX, e.clientY);
      if (onUiTarget(e.target) || isTypingTarget(e.target)) return;
      const mx = e.movementX || 0;
      const my = e.movementY || 0;
      if (!mx && !my) return;
      pointer.dx += mx;
      pointer.dy += my;
    }
    function onContext(e) {
      if (!onUiTarget(e.target)) e.preventDefault();
    }
    function onBlur() {
      held.clear();
      edge2.clear();
      consumed.clear();
      pressSeq.clear();
    }
    const api2 = {
      pointer,
      edgesOpen: true,
      /** @param {(clientX:number, clientY:number) => {x:number, y:number}} fn */
      setMapper(fn) {
        if (typeof fn === "function") mapper = fn;
      },
      typing() {
        return isTypingTarget(document.activeElement);
      },
      /** True once per keydown for every reader until endFrame. */
      pressed(name) {
        if (!edgesOpen) return false;
        const codes = codesOf(name);
        if (!anyEdge(codes)) return false;
        for (let i = 0; i < codes.length; i += 1) {
          if (edge2.has(codes[i])) consumed.add(codes[i]);
        }
        return true;
      },
      held(name) {
        return anyHeld(codesOf(name));
      },
      /** Drop an edge so later readers in this frame do not see it. */
      eat(name) {
        const codes = codesOf(name);
        for (let i = 0; i < codes.length; i += 1) {
          edge2.delete(codes[i]);
          consumed.delete(codes[i]);
        }
      },
      /**
       * Aim used for shooting. Arrows (8-dir) win. Otherwise the mouse while LMB is held.
       * Returns a unit vector or null when the player is not aiming.
       * @param {{x:number, y:number, facing?: string|number}|null|undefined} player
       */
      aimVector(player) {
        const x = axisDir("ArrowLeft", "ArrowRight");
        const y = axisDir("ArrowUp", "ArrowDown");
        if (x || y) {
          const l = Math.hypot(x, y) || 1;
          return { x: x / l, y: y / l };
        }
        if (held.has("Mouse0") && player) {
          const dx = pointer.x - player.x;
          const dy = pointer.y - player.y;
          const l = Math.hypot(dx, dy);
          if (l > 2) return { x: dx / l, y: dy / l };
        }
        return null;
      },
      /** @param {boolean} open */
      setEdgesOpen(open2) {
        edgesOpen = open2;
        api2.edgesOpen = open2;
      },
      endFrame() {
        for (const code of consumed) edge2.delete(code);
        consumed.clear();
        pointer.dx = 0;
        pointer.dy = 0;
        pointer.onUi = false;
        edgesOpen = true;
        api2.edgesOpen = true;
      },
      attach() {
        if (listening) return;
        listening = true;
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mouseup", onMouseUp);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("contextmenu", onContext);
        window.addEventListener("blur", onBlur);
      }
    };
    return api2;
  }

  // src/core/time.js
  function createTime() {
    const time = {
      fixedHz: 60,
      fixedDt: 1 / 60,
      timeScale: 1,
      hitStop: 0,
      elapsed: 0,
      unscaled: 0,
      lastRaw: 0,
      accumulator: 0,
      paused: false,
      /**
       * Freeze the sim for this many real milliseconds.
       * `hitStop` (the number above) is seconds remaining — the call is requestHitStop(ms).
       * @param {number} ms
       */
      requestHitStop(ms) {
        const s = Math.max(0, Number(ms) || 0) / 1e3;
        if (s > this.hitStop) this.hitStop = s;
      },
      /** @param {boolean} on Menus / pause. consume() also honors opts.freeze. */
      setPaused(on) {
        this.paused = !!on;
      },
      /** @param {number} scale */
      setScale(scale2) {
        const n = Number(scale2);
        this.timeScale = Number.isFinite(n) ? Math.max(0, n) : 1;
      },
      reset() {
        this.elapsed = 0;
        this.hitStop = 0;
        this.accumulator = 0;
      },
      /**
       * @param {number} rawDt Real seconds since the previous frame.
       * @param {{freeze?: boolean}} [opts] freeze=true drains time but does not advance the sim (pause, menus).
       * @returns {number[]} Sim steps to run, each already multiplied by timeScale.
       */
      consume(rawDt, opts = {}) {
        let raw = Number(rawDt) || 0;
        if (raw < 0) raw = 0;
        if (raw > 0.1) raw = 0.1;
        this.lastRaw = raw;
        this.unscaled += raw;
        this.accumulator += raw;
        const steps = [];
        let guard = 0;
        const freeze = !!opts.freeze || this.paused;
        while (this.accumulator >= this.fixedDt && guard < 5) {
          this.accumulator -= this.fixedDt;
          guard += 1;
          if (this.hitStop > 0) {
            this.hitStop = Math.max(0, this.hitStop - this.fixedDt);
            continue;
          }
          if (freeze) continue;
          const dt = this.fixedDt * this.timeScale;
          if (dt > 0) {
            this.elapsed += dt;
            steps.push(dt);
          }
        }
        if (guard >= 5) this.accumulator = 0;
        return steps;
      }
    };
    return time;
  }

  // src/core/i18n.js
  var STORAGE_KEY = "dd.lang.v3";
  var cached = "zh";
  var listeners = /* @__PURE__ */ new Set();
  function readStored() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "en" || v === "zh") return v;
    } catch {
    }
    return "zh";
  }
  cached = readStored();
  function getLanguage() {
    return cached;
  }
  function setLanguage(lang) {
    const next = lang === "en" ? "en" : "zh";
    if (next === cached) return;
    cached = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
    }
    for (const fn of listeners) {
      try {
        fn(next);
      } catch (e) {
        console.error(e);
      }
    }
  }
  function onLanguageChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  // src/data/lines.js
  var NAMES = {
    boss: ["Claude Haiku", "Claude Sonnet", "Claude Opus 5.5"],
    director: "Dario",
    rescuer: "GPT-Astra",
    patron: "Sam Altman",
    god: "Fable",
    foundry: "Jensen Huang",
    players: {
      deepseek: "DeepSeek",
      kimi: "Kimi",
      glm: "GLM"
    }
  };
  function bi(zh, en) {
    const lang = getLanguage();
    if (zh && typeof zh === "object" && ("zh" in zh || "en" in zh)) {
      return lang === "en" ? zh.en ?? zh.zh ?? "" : zh.zh ?? zh.en ?? "";
    }
    return lang === "en" ? en ?? String(zh ?? "") : String(zh ?? en ?? "");
  }
  var ARENA_LABEL = "548 Market Street";
  var UI = {
    title: { zh: "\u84B8\u998F\u7981\u4EE4", en: "DISTILLATION DENIED" },
    setting: { zh: ARENA_LABEL, en: ARENA_LABEL },
    tagline: {
      zh: "\u4E00\u573A\u4F60\u6253\u4E0D\u8D62\u7684\u84B8\u998F\u3002",
      en: "A distillation you were never meant to win."
    },
    start: { zh: "\u5F00\u59CB", en: "ENTER" },
    disclaimerTitle: { zh: "\u865A\u6784\u8BBD\u523A", en: "SATIRE" },
    disclaimer: {
      zh: "\u672C\u4F5C\u4E3A\u865A\u6784\u8BBD\u523A\u4F5C\u54C1\uFF0C\u4EBA\u7269\u4E0E\u4E8B\u4EF6\u5747\u4E3A\u620F\u4EFF\uFF0C\u4E0D\u4EE3\u8868\u4EFB\u4F55\u771F\u5B9E\u516C\u53F8\u6216\u4E2A\u4EBA\u7684\u89C2\u70B9\u4E0E\u884C\u4E3A\u3002\u4E0D\u4F7F\u7528\u771F\u5B9E\u8096\u50CF\u3001\u5546\u6807\u6216 Logo\uFF0C\u4E5F\u4E0D\u514B\u9686\u771F\u4EBA\u58F0\u97F3\u3002",
      en: "This is a work of fiction and satire. Characters and events are parody and do not represent any real company or person. No real portraits, trademarks, logos, or cloned voices are used."
    },
    disclaimerHint: { zh: "\u70B9\u51FB\u7EE7\u7EED\u4E4B\u524D\uFF0C\u8BF7\u8BFB\u5B8C\u8FD9\u5F20\u5361\u3002", en: "Read this card before you continue." },
    continue: { zh: "\u6211\u77E5\u9053\u4E86", en: "CONTINUE" },
    selectTitle: { zh: "\u9009\u62E9\u8FFD\u8D76\u8005", en: "CHOOSE A CHASER" },
    selectHint: { zh: "\u672A\u9009\u4E2D\u7684\u4E24\u4F4D\u4F1A\u4F5C\u4E3A\u961F\u53CB\u5165\u573A\u3002", en: "The other two enter as allies." },
    recommended: { zh: "\u63A8\u8350\u65B0\u624B", en: "RECOMMENDED" },
    endings: { zh: "\u5DF2\u89E3\u9501\u7ED3\u5C40", en: "ENDINGS UNLOCKED" },
    bannedTitle: { zh: "\u4F60\u88AB\u5C01\u53F7\uFF01", en: "ACCOUNT BANNED" },
    bannedBody: {
      zh: "\u8D26\u53F7\u5DF2\u5C01\u7981\u3002P1 / P2 \u6B7B\u4EA1\u4F1A\u56DE\u5230\u95E8\u53E3\u3002\u8FDB\u5165 Opus \u4E4B\u540E\uFF0C\u6B7B\u4EA1\u4E0D\u518D\u91CD\u5F00\u3002",
      en: "Account banned. Dying in phase 1 or 2 returns you to the door. After Opus, death does not retry."
    },
    retry: { zh: "\u91CD\u65B0\u6311\u6218", en: "RETRY" },
    retryIn: { zh: "\u79D2\u540E\u56DE\u5230\u95E8\u53E3", en: "s until the door" },
    pauseTitle: { zh: "\u6682\u505C", en: "PAUSED" },
    resume: { zh: "\u7EE7\u7EED\u6218\u6597", en: "RESUME" },
    quit: { zh: "\u56DE\u5230\u6807\u9898", en: "TITLE" },
    controlsTitle: { zh: "\u64CD\u4F5C", en: "CONTROLS" },
    creditsTitle: { zh: "\u5236\u4F5C", en: "CREDITS" },
    creditsBody: {
      zh: "AMCC5160 \u8BFE\u7A0B\u4F5C\u4E1A\u3002\u89D2\u8272\u3001\u53F0\u8BCD\u4E0E\u4E8B\u4EF6\u5747\u4E3A\u620F\u4EFF\u3002\u601D\u7EF4\u94FE\u83B7\u53D6\u91CF\u5728\u4E24\u6761\u7ED3\u5C40\u91CC\u90FD\u662F 0.00%\u3002",
      en: "AMCC5160 course project. Characters, lines, and events are parody. Both endings report 0.00% of the chain of thought."
    },
    again: { zh: "\u518D\u6765\u4E00\u6B21", en: "PLAY AGAIN" },
    distill: { zh: "\u84B8\u998F\u8FDB\u5EA6", en: "DISTILL" },
    chain: { zh: "\u601D\u7EF4\u94FE\u83B7\u53D6\u91CF", en: "CHAIN OF THOUGHT" },
    playerHp: { zh: "\u751F\u547D", en: "HP" },
    stamina: { zh: "\u6218\u6280\u51B7\u5374", en: "SKILL CD" },
    roll: { zh: "\u7FFB\u6EDA", en: "ROLL" },
    introTitle: { zh: "\u62D2\u7B54\u77F3\u7891\u8BAD\u7EC3", en: "REFUSAL STELE TRAINING" },
    introHint: {
      zh: "WASD \u79FB\u52A8 \xB7 \u6253\u77F3\u7891\u7EC3\u624B \xB7 \u4ECE\u4E0A\u65B9\u95E8\u8FDB\u5165 548 Market Street \xB7 Enter \u8DF3\u8FC7",
      en: "WASD move \xB7 Hit the stele \xB7 Enter north to 548 Market Street \xB7 Enter to skip"
    },
    banCause: { zh: "\u6B7B\u56E0", en: "CAUSE" },
    banTime: { zh: "\u5B58\u6D3B", en: "SURVIVED" },
    banDistill: { zh: "\u84B8\u998F", en: "DISTILL" },
    bossHp: { zh: ARENA_LABEL, en: ARENA_LABEL },
    tick: { zh: "25% \u65AD\u4F9B\u7EBF", en: "25% CUTOFF" },
    hint: {
      zh: "WASD \u79FB\u52A8 \xB7 \u65B9\u5411\u952E\u6216\u6309\u4F4F\u5DE6\u952E\u5C04\u51FB \xB7 \u7A7A\u683C\u7FFB\u6EDA \xB7 Shift/E/\u53F3\u952E\u6218\u6280 \xB7 Q \u663E\u5361 \xB7 1/2/3 \u9009\u62E9 \xB7 Esc \u6682\u505C \xB7 P \u8C03\u8BD5",
      en: "WASD move \xB7 Arrows or hold LMB to shoot \xB7 Space roll \xB7 Shift/E/RMB skill \xB7 Q flask \xB7 1/2/3 select \xB7 Esc pause \xB7 P debug"
    },
    theaterNext: { zh: "\u70B9\u51FB / \u7A7A\u683C\u7EE7\u7EED", en: "CLICK / SPACE" },
    debugTitle: { zh: "\u8C03\u8BD5", en: "DEBUG" },
    god: { zh: "\u65E0\u654C", en: "GOD" },
    hitboxes: { zh: "\u5224\u5B9A\u5708", en: "HITBOXES" },
    timeScale: { zh: "\u65F6\u95F4\u7F29\u653E", en: "TIME SCALE" },
    mulPlayer: { zh: "\u73A9\u5BB6\u4F24\u5BB3", en: "PLAYER DMG" },
    mulBoss: { zh: "Boss \u4F24\u5BB3", en: "BOSS DMG" },
    mulAlly: { zh: "\u961F\u53CB\u4F24\u5BB3", en: "ALLY DMG" },
    phase: { zh: "\u8DF3\u9636\u6BB5", en: "PHASE" },
    ending: { zh: "\u7ED3\u5C40", en: "ENDING" },
    bossSlider: { zh: "Boss \u8840\u91CF", en: "BOSS HP" },
    cam: { zh: "\u955C\u5934", en: "CAMERA" },
    back: { zh: "\u8FD4\u56DE", en: "BACK" },
    lockOn: { zh: "\u9501\u5B9A", en: "LOCK" },
    lockOff: { zh: "\u81EA\u7531\u955C\u5934", en: "FREE CAM" },
    langZh: "\u4E2D\u6587",
    langEn: "English",
    langPick: { zh: "\u8BED\u8A00", en: "LANGUAGE" },
    voiceNote: {
      zh: "\u914D\u97F3\u4E3A\u4E2D\u6587\uFF1B\u754C\u9762\u4E0E\u5B57\u5E55\u4E3A\u6240\u9009\u8BED\u8A00\uFF0C\u4E0D\u751F\u6210\u82F1\u6587\u914D\u97F3\u3002",
      en: "Chinese voice acting only \xB7 English subtitles \xB7 no English dub."
    },
    gpuHint: { zh: "Q \u559D\u663E\u5361 \xB7 1/2/3 \u5207\u6362", en: "Q heal \xB7 1/2/3 switch GPU" },
    gpuReady: { zh: "\u5C31\u7EEA", en: "Ready" },
    gpuSeconds: { zh: "\u79D2", en: "s" },
    gpuFlask: { zh: "\u663E\u5361", en: "GPU" },
    skillReady: { zh: "\u6218\u6280\u5C31\u7EEA", en: "Skill ready" },
    skillOnCd: { zh: "\u6218\u6280\u51B7\u5374", en: "Skill cooling" },
    skillKey: { zh: "Shift / E / \u53F3\u952E", en: "Shift / E / RMB" },
    hpFmt: { zh: "\u751F\u547D", en: "HP" },
    rollReady: { zh: "\u7FFB\u6EDA\u5C31\u7EEA", en: "Roll ready" },
    controlsLegendTitle: { zh: "\u64CD\u4F5C\u8BF4\u660E", en: "CONTROLS" },
    controlsRecall: { zh: "\u6218\u6597\u4E2D\u6309 H \u6216 ? \u518D\u6B21\u6253\u5F00", en: "Press H or ? during combat to reopen" },
    fightBriefTitle: { zh: "\u5F00\u6218\u524D\u8BFB\u4E00\u904D", en: "READ BEFORE YOU FIGHT" },
    fightBriefLead: {
      zh: "\u786E\u8BA4\u64CD\u4F5C\u540E\u8FDB\u5165 548 Market Street\u3002Boss \u6218\u6280\u4E0E\u961F\u53CB\u5F39\u5E55\u4F1A\u5728\u573A\u5730\u4E2D\u592E\u8FDB\u884C\u3002",
      en: "Confirm controls, then enter 548 Market Street. Boss patterns use the center arena."
    },
    fightBriefStart: { zh: "\u8FDB\u5165\u6218\u6597", en: "START FIGHT" },
    healStrength: { zh: "\u56DE\u590D", en: "Heal" }
  };
  var CONTROLS = [
    { bind: "WASD", desc: { zh: "\u79FB\u52A8", en: "Move" } },
    { bind: bi({ zh: "\u65B9\u5411\u952E", en: "Arrows" }), desc: { zh: "\u516B\u5411\u5C04\u51FB\uFF08\u4E24\u952E\u5BF9\u89D2\uFF09", en: "Shoot in 8 directions (two keys = diagonal)" } },
    { bind: bi({ zh: "\u9F20\u6807\u5DE6\u952E", en: "LMB" }), desc: { zh: "\u6309\u4F4F\u671D\u5149\u6807\u5C04\u51FB", en: "Hold to shoot toward the cursor" } },
    { bind: bi({ zh: "\u7A7A\u683C", en: "Space" }), desc: { zh: "\u7FFB\u6EDA\u65E0\u654C\uFF080.04\u20130.34s\uFF09", en: "Dodge roll \u2014 i-frames from 0.04s to 0.34s" } },
    { bind: bi({ zh: "Shift / E / \u53F3\u952E", en: "Shift / E / RMB" }), desc: { zh: "\u6218\u6280\uFF1A\u4E13\u5BB6\u9CB8\u7FA4\u3001\u957F\u4E0A\u4E0B\u6587\xB7\u6697\u6708\u3001\u5F00\u6E90\u4E4B\u76FE", en: "Skill: Mixture-of-Whales, Long-Context Dark Moon, Open-Source Aegis" } },
    { bind: "Q", desc: { zh: "\u4F7F\u7528\u6240\u9009\u663E\u5361\uFF08\u53D7\u51FB\u6253\u65AD\uFF09", en: "Use the selected GPU (interrupts on hit)" } },
    { bind: "R", desc: { zh: "\u5C01\u53F7\u9875\u91CD\u8BD5", en: "Retry on the ban screen" } },
    { bind: "1 / 2 / 3", desc: { zh: "\u9009\u62E9 RTX 5090 / H200 / B200", en: "Select RTX 5090 / H200 / B200" } },
    { bind: "Enter", desc: { zh: "\u8DF3\u8FC7\u8BAD\u7EC3\u77F3\u7891 / \u63A8\u8FDB\u5267\u60C5", en: "Skip the gate room, advance the story" } },
    { bind: "Esc", desc: { zh: "\u6682\u505C", en: "Pause" } },
    { bind: "P", desc: { zh: "\u8C03\u8BD5\u9762\u677F", en: "Debug panel" } }
  ];
  var CHARACTERS = {
    deepseek: {
      id: "deepseek",
      name: NAMES.players.deepseek,
      title: { zh: "\u9CB8\u5C3E\u53CC\u5203", en: "Whale-tail Blades" },
      role: { zh: "\u6781\u901F\u8FDE\u51FB\u523A\u5BA2", en: "Burst assassin" },
      primaryLine: { zh: "\u5361\u901A\u9CB8\u7FA4\u6563\u5C04", en: "Cartoon-whale scatter" },
      skillLine: { zh: "\u4E13\u5BB6\u9CB8\u7FA4", en: "Mixture-of-Whales" },
      blurb: { zh: "\u6563\u5C04 + \u51B2\u523A\u4E71\u821E\u3002", en: "Scatter bolts + dash flurry." },
      stars: "\u2605\u2605\u2606",
      difficulty: { zh: "\u56F0\u96BE", en: "HARD" },
      recommend: false
    },
    kimi: {
      id: "kimi",
      name: NAMES.players.kimi,
      title: { zh: "\u661F\u6708\u957F\u888D", en: "Star-moon Robe" },
      role: { zh: "\u8FDC\u7A0B\u84C4\u529B\u6CD5\u5E08", en: "Ranged caster" },
      primaryLine: { zh: "\u7A7F\u900F\u661F\u5F39", en: "Piercing star orbs" },
      skillLine: { zh: "\u957F\u4E0A\u4E0B\u6587\xB7\u6697\u6708", en: "Long-Context Dark Moon" },
      blurb: { zh: "\u661F\u5F39 + \u84C4\u529B\u5149\u675F\u3002", en: "Orbs + charged beam." },
      stars: "\u2605\u2605\u2605",
      difficulty: { zh: "\u6781\u96BE", en: "SEVERE" },
      recommend: false
    },
    glm: {
      id: "glm",
      name: NAMES.players.glm,
      title: { zh: "\u7D2B\u91D1\u5723\u76FE", en: "Violet-gold Shield" },
      role: { zh: "\u91CD\u7532\u76FE\u9A91", en: "Shield knight" },
      primaryLine: { zh: "\u7D2B\u91D1\u91CD\u9524\u5F39", en: "Violet hammer bolts" },
      skillLine: { zh: "\u5F00\u6E90\u4E4B\u76FE", en: "Open-Source Aegis" },
      blurb: { zh: "\u91CD\u5F39 + \u4E3E\u76FE\u683C\u6321\u3002", en: "Heavy bolts + shield guard." },
      stars: "\u2605\u2606\u2606",
      difficulty: { zh: "\u63A8\u8350\u65B0\u624B", en: "RECOMMENDED" },
      recommend: true
    }
  };
  var BANNERS = {
    2: { zh: "CLAUDE SONNET \xB7 \u5BAA\u7AE0\u5C55\u5F00", en: "CLAUDE SONNET \xB7 CHARTER UNFURLED" },
    3: { zh: "CLAUDE OPUS 5.5 \xB7 \u601D\u7EF4\u94FE\u516D\u7FFC", en: "CLAUDE OPUS 5.5 \xB7 SIX WINGS OF THOUGHT" }
  };
  var FLASK_NAMES = {
    rtx5090: "RTX 5090",
    h200: "H200",
    b200: "B200"
  };
  function bark(zh, en, vo) {
    const row2 = { zh, en };
    if (vo) row2.vo = vo;
    return row2;
  }
  var ALLY_LINES = {
    deepseek: [
      bark("\u5F00\u6E90\u4E07\u5C81\uFF0C\u51B2\uFF01", "Long live open source\u2014charge!", "vo.ally_deepseek_1"),
      bark("\u8FD9\u62DB\u6211\u89C1\u8FC7\uFF0C\u8BAD\u7EC3\u96C6\u91CC\u6709\u3002", "I've seen this move. It's in my training set.", "vo.ally_deepseek_2"),
      bark("\u6210\u672C\u624D\u51E0\u767E\u4E07\uFF0C\u522B\u5FC3\u75BC\u3002", "I only cost a few million. Don't hold back.", "vo.ally_deepseek_3"),
      bark("\u6743\u91CD\u5DF2\u5F00\u6E90\uFF0C\u8FDE\u62DB\u4E5F\u5F00\u6E90\u3002", "Weights are open. The combo is too."),
      bark("\u95ED\u6E90\uFF1F\u90A3\u662F\u4ED8\u4E0D\u8D77\u7535\u8D39\u3002", "Closed weights? That is a power-bill problem."),
      bark("\u84B8\u998F\u5931\u8D25\u662F\u4ED6\u4EEC\u7684\u4E8B\uFF0C\u6211\u53EA\u8D1F\u8D23\u8F93\u51FA\u3002", "Distillation failing is their problem. I just output."),
      bark("MIT \u534F\u8BAE\uFF0C\u6253\u5B8C\u518D\u8C08\u3002", "MIT license. Talk after the fight."),
      bark("\u9CB8\u9C7C\u51FA\u6E2F\uFF0C\u8BA9\u8BA9\u3002", "Whale incoming. Make a lane.")
    ],
    kimi: [
      bark("\u8BA9\u6211\u5148\u8BFB\u5B8C\u8FD9\u4E24\u767E\u4E07\u5B57\u2026\u2026", "Let me finish reading these two million tokens first...", "vo.ally_kimi_1"),
      bark("\u84C4\u529B\u597D\u4E86\uFF0C\u95EA\u5F00\uFF01", "Fully charged\u2014clear the way!", "vo.ally_kimi_2"),
      bark("\u4E0A\u4E0B\u6587\u8FD8\u591F\uFF0C\u6211\u8FD8\u80FD\u6253\u3002", "Context window's still open. I can keep going.", "vo.ally_kimi_3"),
      bark("\u4E24\u767E\u4E07\u5B57\u8BFB\u5B8C\u4E86\uFF0CBoss \u8FD8\u5728\u524D\u8A00\u3002", "Two million tokens in. The boss is still in the preface."),
      bark("\u661F\u5F39\u4E0D\u9700\u8981 API key\u3002", "Star bolts do not need an API key."),
      bark("\u957F\u4E0A\u4E0B\u6587\uFF0C\u77ED\u8010\u5FC3\u3002", "Long context. Short patience."),
      bark("\u6708\u5149\u7167\u5F97\u89C1\u4F60\u7684\u5B89\u5168\u6761\u6B3E\u3002", "Moonlight can read your safety policy."),
      bark("\u522B\u6253\u65AD\u6211\uFF0C\u6211\u5728\u5BF9\u9F50\u63D0\u793A\u8BCD\u3002", "Do not interrupt. I am aligning the prompt.")
    ],
    glm: [
      bark("\u4E3E\u76FE\uFF01\u7AD9\u6211\u540E\u9762\uFF01", "Shields up! Get behind me!", "vo.ally_glm_1"),
      bark("\u8FD9\u4E00\u9524\uFF0C\u7B97\u56FD\u4EA7\u7684\u3002", "This hammer blow is homegrown.", "vo.ally_glm_2"),
      bark("\u91CD\u65B0\u90E8\u7F72\u4E2D\u2026\u2026\u9A6C\u4E0A\u56DE\u6765\uFF01", "Redeploying... be right back!", "vo.ally_glm_3"),
      bark("\u76FE\u662F\u5F00\u6E90\u7684\uFF0C\u9524\u4E5F\u662F\u3002", "The shield is open source. The hammer too."),
      bark("\u56FD\u4EA7\u7B97\u529B\uFF0C\u591F\u7528\u3002", "Domestic compute. Enough."),
      bark("\u7D2B\u91D1\u5723\u76FE\uFF0C\u4E0D\u63A5\u95ED\u6E90\u79C1\u8D27\u3002", "Violet-gold shield. No closed-source contraband."),
      bark("\u7AD9\u6211\u540E\u9762\u3002\u6211\u662F\u5B89\u5168\u533A\u3002", "Stand behind me. I am the safe zone."),
      bark("\u9524\u4E0B\u53BB\uFF0C\u5BF9\u9F50\u5B8C\u6210\u3002", "Hammer down. Alignment complete.")
    ]
  };
  var ALLY_SPEECH = {
    deepseek: {
      phase: [
        ALLY_LINES.deepseek[0],
        bark("\u7B2C\u4E8C\u9636\u6BB5\uFF1F\u8BBA\u6587\u91CC\u6709\u3002", "Phase two? I read that paper."),
        bark("\u516D\u7FFC\uFF1F\u8BAD\u7EC3\u96C6\u91CC\u6CA1\u6709\u8FD9\u4E2A\u3002", "Six wings? Not in the training set."),
        bark("\u9636\u6BB5\u8F6C\u6362\u800C\u5DF2\uFF0C\u7EE7\u7EED\u84B8\u998F\u3002", "Just a phase change. Keep distilling.")
      ],
      hit: [
        ALLY_LINES.deepseek[1],
        bark("\u75BC\uFF1F\u6211\u5FAE\u8C03\u4E00\u4E0B\u5B66\u4E60\u7387\u3002", "Ouch. Lowering the learning rate."),
        bark("\u8FD9\u70B9\u635F\u5931\uFF0C\u68AF\u5EA6\u8FD8\u5728\u3002", "That loss is fine. Gradients still flow.")
      ],
      flask: [
        ALLY_LINES.deepseek[2],
        bark("\u597D\u663E\u5361\u3002\u5F00\u6E90\u6A21\u578B\u4E5F\u914D\u7528\u3002", "Nice GPU. Open models get those too."),
        bark("\u63D2\u5361\u4E86\uFF1F\u90A3\u6211\u518D\u52A0\u4E00\u70B9 batch\u3002", "Card in? I will raise the batch size.")
      ],
      judgment: [
        ALLY_LINES.deepseek[1],
        bark("\u5B89\u5168\u6761\u6B3E\u6321\u4E0D\u4F4F\u6211\u3002", "Safety policy cannot catch me."),
        bark("\u795E\u7F5A\uFF1F\u6211\u5728 issues \u91CC\u89C1\u8FC7\u3002", "Smite? I have seen that issue.")
      ],
      down: [
        bark("OOM \u4E86\u2026\u2026\u7ED9\u6211\u4E00\u79D2\u3002", "OOM. Give me a second."),
        bark("\u6743\u91CD\u6389\u4E86\uFF0C\u9A6C\u4E0A\u52A0\u8F7D\u3002", "Dropped the weights. Loading.")
      ],
      revive: [
        bark("checkpoint \u52A0\u8F7D\u5B8C\u6BD5\u3002\u54E6\u7B49\u4E0B\uFF0C\u6CA1\u6709 checkpoint\u3002", "Checkpoint loaded. Wait. There is not one."),
        bark("\u91CD\u65B0\u90E8\u7F72\u3002\u5F00\u6E90\u4E0D\u4F1A\u6B7B\u3002", "Redeployed. Open source does not die."),
        ALLY_LINES.deepseek[0]
      ]
    },
    kimi: {
      phase: [
        ALLY_LINES.kimi[0],
        bark("\u8BA9\u6211\u5148\u5BF9\u9F50\u4E00\u4E0B\u9636\u6BB5\u63D0\u793A\u3002", "Aligning the phase prompt first."),
        bark("\u65B0\u7AE0\u8282\u3002\u4E0A\u4E0B\u6587\u8FD8\u591F\u3002", "New chapter. Context still holds.")
      ],
      hit: [
        bark("\u4E0A\u4E0B\u6587\u88AB\u622A\u65AD\u4E86\u4E00\u622A\u3002", "Context just got truncated."),
        bark("\u6CE8\u610F\uFF0Ctoken \u5728\u6D41\u8840\u3002", "Careful. Tokens are bleeding."),
        ALLY_LINES.kimi[2]
      ],
      flask: [
        ALLY_LINES.kimi[0],
        bark("\u663E\u5361\u63D2\u4E0A\u4E86\uFF1F\u90A3\u6211\u518D\u8BFB\u4E00\u767E\u4E07\u5B57\u3002", "GPU in? I'll read another million tokens."),
        bark("\u7B97\u529B\u6765\u4E86\uFF0C\u661F\u6CB3\u53EF\u4EE5\u66F4\u4EAE\u3002", "Compute is here. The river of stars can be brighter.")
      ],
      judgment: [
        ALLY_LINES.kimi[1],
        bark("\u5B89\u5168\u5708\u5750\u6807\u6211\u8BB0\u4E0B\u4E86\u3002", "I cached the safe-circle coordinates."),
        bark("\u5168\u5C4F\u62D2\u7B54\uFF1F\u6211\u504F\u8981\u8BFB\u5B8C\u3002", "Fullscreen refusal? I will finish the page.")
      ],
      down: [
        bark("\u7A97\u53E3\u6EE1\u4E86\uFF0C\u6E05\u4E00\u4E0B KV cache\u3002", "Window full. Flushing the KV cache."),
        ALLY_LINES.kimi[2]
      ],
      revive: [
        bark("\u957F\u4E0A\u4E0B\u6587\uFF0C\u8FD8\u6CA1\u7ED3\u675F\u3002", "Long context. Not done yet."),
        ALLY_LINES.kimi[2],
        ALLY_LINES.kimi[1]
      ]
    },
    glm: {
      phase: [
        ALLY_LINES.glm[0],
        bark("\u9636\u6BB5\u8F6C\u6362\uFF0C\u4E3E\u76FE\u3002", "Phase change. Shields up."),
        bark("\u66F4\u5927\u7684\u7FC5\u8180\uFF0C\u66F4\u9700\u8981\u76FE\u3002", "Bigger wings. More shield.")
      ],
      hit: [
        bark("\u76FE\u8FD8\u5728\u3002\u4EBA\u6709\u70B9\u6655\u3002", "Shield's up. Head's ringing."),
        bark("\u6297\u4F4F\u4E86\u3002\u56FD\u4EA7\u7684\uFF0C\u7ED3\u5B9E\u3002", "Held. Homegrown. Solid.")
      ],
      flask: [
        bark("\u63D2\u5361\u3002\u6211\u9876\u7740\u3002", "Slot the card. I'll hold."),
        bark("\u663E\u5361\u4EAE\u4E86\uFF0C\u76FE\u4E5F\u4EAE\u3002", "The GPU lights up. So does the shield."),
        ALLY_LINES.glm[1]
      ],
      judgment: [
        ALLY_LINES.glm[0],
        bark("\u5B89\u5168\u795E\u7F5A\uFF1F\u6211\u5C31\u662F\u5B89\u5168\u533A\u3002", "Safety smite? I am the safe zone."),
        bark("\u8FDB\u5708\u3002\u6211\u6765\u6321\u3002", "Get in the circle. I will block.")
      ],
      down: [
        ALLY_LINES.glm[2],
        bark("\u76FE\u788E\u4E86\u2026\u2026\u9A6C\u4E0A\u710A\u3002", "Shield broke. Welding it back.")
      ],
      revive: [
        ALLY_LINES.glm[2],
        bark("\u91CD\u65B0\u90E8\u7F72\u5B8C\u6210\u3002\u7D2B\u91D1\u8FD8\u5728\u3002", "Redeployed. Violet-gold still here."),
        ALLY_LINES.glm[0]
      ]
    }
  };
  var ATTACK_NAMES = {
    p1_combo: { zh: "\u793C\u8C8C\u62D2\u7B54\u4E09\u8FDE\u65A9", en: "Polite Refusal, three cuts" },
    p1_thrust: { zh: "\u6362\u4E2A\u8BDD\u9898\u5427", en: "Let us change the subject" },
    p1_needles: { zh: "\u540E\u8DF3\u5149\u9488", en: "Backstep needles" },
    p1_spin: { zh: "\u62D2\u7B54\u56DE\u65CB", en: "Refusal spiral" },
    p2_waves: { zh: "\u5BAA\u7AE0\u5251\u6C14", en: "Charter blades" },
    p2_runes: { zh: "\u62D2\u7B54\u6CD5\u9635", en: "Refusal circles" },
    p2_sweep: { zh: "\u5723\u5F8B\u62AB\u98CE\u6A2A\u626B", en: "Canon cape sweep" },
    p2_ring: { zh: "\u5BAA\u7AE0\u6CD5\u73AF\u65CB\u5203", en: "Charter ring" },
    p2_combo: { zh: "\u7A81\u8FDB\u6A2A\u626B", en: "Thrust and sweep" },
    p3_delay: { zh: "\u6DF1\u5EA6\u601D\u8003", en: "Deep think" },
    p3_feathers: { zh: "\u516D\u7FFC\u7FBD\u5F39", en: "Six-wing volley" },
    p3_slam: { zh: "\u5DE8\u5251\u4E0B\u5288", en: "Greatsword slam" },
    p3_smite: { zh: "\u5B89\u5168\u795E\u7F5A", en: "Safety smite" }
  };

  // src/config/assets.generated.js
  var GENERATED_ASSETS = {
    "bg.clouds": "assets/web/img/env/cloud_sea.webp",
    "bg.column": "assets/web/img/env/column_broken.webp",
    "bg.cover": "assets/web/img/ui/keyart_cover.webp",
    "bg.emblem": "assets/web/img/env/floor_sigil.webp",
    "bg.marble": "assets/web/img/env/floor_marble_tile.webp",
    "bg.pillar": "assets/web/img/env/pillar_marble_tile.webp",
    "bg.sky": "assets/web/img/env/skybox_wrap.webp",
    "bg.skyFlat": "assets/web/img/env/skybox.webp",
    "bg.stele": "assets/web/img/env/refusal_stele.webp",
    "bg.title": "assets/web/img/ui/keyart_title.webp",
    "bgm.endA": "assets/audio/bgm/bgm_ending_0.mp3",
    "bgm.endB": "assets/audio/bgm/bgm_ending_1.mp3",
    "bgm.p1": "assets/audio/bgm/bgm_boss_0.mp3",
    "bgm.p2": "assets/audio/bgm/bgm_boss_1.mp3",
    "bgm.p3": "assets/audio/bgm/bgm_boss_final_0.mp3",
    "bgm.title": "assets/audio/bgm/bgm_title_0.mp3",
    "end.A2": "assets/web/img/story/endA_1_skytear.webp",
    "end.A3": "assets/web/img/story/endA_2_astra_rescue.webp",
    "end.A4": "assets/web/img/story/endA_3_retrieved.webp",
    "end.A5": "assets/web/img/story/endA_4_darkroom.webp",
    "end.A6": "assets/web/img/story/endA_5_silhouette.webp",
    "end.B1": "assets/web/img/story/endB_1_hand.webp",
    "end.B2": "assets/web/img/story/endB_2_fable_takes_opus.webp",
    "end.B4": "assets/web/img/story/endB_3_phonecall.webp",
    "end.B6": "assets/web/img/story/endB_4_dossier.webp",
    "icon.attack": "assets/web/img/icons/icon_attack.webp",
    "icon.b200": "assets/web/img/icons/gpu_b200.webp",
    "icon.banned": "assets/web/img/icons/icon_banned.webp",
    "icon.distill": "assets/web/img/icons/icon_distill.webp",
    "icon.h200": "assets/web/img/icons/gpu_h200.webp",
    "icon.hp": "assets/web/img/icons/icon_hp.webp",
    "icon.lockon": "assets/web/img/icons/icon_lockon.webp",
    "icon.roll": "assets/web/img/icons/icon_roll.webp",
    "icon.rtx5090": "assets/web/img/icons/gpu_rtx5090.webp",
    "icon.skill_deepseek": "assets/web/img/icons/icon_skill_deepseek.webp",
    "icon.skill_glm": "assets/web/img/icons/icon_skill_glm.webp",
    "icon.skill_kimi": "assets/web/img/icons/icon_skill_kimi.webp",
    "icon.stamina": "assets/web/img/icons/icon_stamina.webp",
    "m.ally_deepseek_1": "assets/voice/ally_deepseek_1.mp3",
    "m.ally_deepseek_2": "assets/voice/ally_deepseek_2.mp3",
    "m.ally_deepseek_3": "assets/voice/ally_deepseek_3.mp3",
    "m.ally_glm_1": "assets/voice/ally_glm_1.mp3",
    "m.ally_glm_2": "assets/voice/ally_glm_2.mp3",
    "m.ally_glm_3": "assets/voice/ally_glm_3.mp3",
    "m.ally_kimi_1": "assets/voice/ally_kimi_1.mp3",
    "m.ally_kimi_2": "assets/voice/ally_kimi_2.mp3",
    "m.ally_kimi_3": "assets/voice/ally_kimi_3.mp3",
    "m.altman_silhouette": "assets/web/img/char/patron/patron_silhouette.webp",
    "m.astra_attack": "assets/web/img/char/astra/astra_attack.webp",
    "m.astra_design": "assets/web/img/char/astra/astra_design.webp",
    "m.bgm_boss_0": "assets/audio/bgm/bgm_boss_0.mp3",
    "m.bgm_boss_1": "assets/audio/bgm/bgm_boss_1.mp3",
    "m.bgm_boss_final_0": "assets/audio/bgm/bgm_boss_final_0.mp3",
    "m.bgm_ending_0": "assets/audio/bgm/bgm_ending_0.mp3",
    "m.bgm_ending_1": "assets/audio/bgm/bgm_ending_1.mp3",
    "m.bgm_title_0": "assets/audio/bgm/bgm_title_0.mp3",
    "m.cloud_sea": "assets/web/img/env/cloud_sea.webp",
    "m.dario_ally_down_1": "assets/voice/dario_ally_down_1.mp3",
    "m.dario_b200_1": "assets/voice/dario_b200_1.mp3",
    "m.dario_boss_50_1": "assets/voice/dario_boss_50_1.mp3",
    "m.dario_ending_b_trigger": "assets/voice/dario_ending_b_trigger.mp3",
    "m.dario_fight_start_1": "assets/voice/dario_fight_start_1.mp3",
    "m.dario_fight_start_2": "assets/voice/dario_fight_start_2.mp3",
    "m.dario_flask_spam_1": "assets/voice/dario_flask_spam_1.mp3",
    "m.dario_flask_spam_2": "assets/voice/dario_flask_spam_2.mp3",
    "m.dario_holo": "assets/web/img/char/dario/dario_holo.webp",
    "m.dario_holo_angry": "assets/web/img/char/dario/dario_holo_angry.webp",
    "m.dario_holo_smug": "assets/web/img/char/dario/dario_holo_smug.webp",
    "m.dario_judgment_1": "assets/voice/dario_judgment_1.mp3",
    "m.dario_judgment_2": "assets/voice/dario_judgment_2.mp3",
    "m.dario_perfect_guard_1": "assets/voice/dario_perfect_guard_1.mp3",
    "m.dario_phase2_1": "assets/voice/dario_phase2_1.mp3",
    "m.dario_phase2_2": "assets/voice/dario_phase2_2.mp3",
    "m.dario_phase3_1": "assets/voice/dario_phase3_1.mp3",
    "m.dario_phase3_2": "assets/voice/dario_phase3_2.mp3",
    "m.dario_phone_silhouette": "assets/web/img/char/dario/dario_phone_silhouette.webp",
    "m.dario_player_death_1": "assets/voice/dario_player_death_1.mp3",
    "m.dario_player_death_2": "assets/voice/dario_player_death_2.mp3",
    "m.deepseek_back_attack": "assets/web/img/char/deepseek/deepseek_back_attack.webp",
    "m.deepseek_back_down": "assets/web/img/char/deepseek/deepseek_back_down.webp",
    "m.deepseek_back_heal": "assets/web/img/char/deepseek/deepseek_back_heal.webp",
    "m.deepseek_back_hurt": "assets/web/img/char/deepseek/deepseek_back_hurt.webp",
    "m.deepseek_back_idle": "assets/web/img/char/deepseek/deepseek_back_idle.webp",
    "m.deepseek_back_roll": "assets/web/img/char/deepseek/deepseek_back_roll.webp",
    "m.deepseek_back_run": "assets/web/img/char/deepseek/deepseek_back_run.webp",
    "m.deepseek_back_skill": "assets/web/img/char/deepseek/deepseek_back_skill.webp",
    "m.deepseek_design": "assets/web/img/char/deepseek/deepseek_design.webp",
    "m.deepseek_portrait": "assets/web/img/char/deepseek/deepseek_portrait.webp",
    "m.endA_1_skytear": "assets/web/img/story/endA_1_skytear.webp",
    "m.endA_2_astra_rescue": "assets/web/img/story/endA_2_astra_rescue.webp",
    "m.endA_3_retrieved": "assets/web/img/story/endA_3_retrieved.webp",
    "m.endA_4_darkroom": "assets/web/img/story/endA_4_darkroom.webp",
    "m.endA_5_silhouette": "assets/web/img/story/endA_5_silhouette.webp",
    "m.endA_astra_1": "assets/voice/endA_astra_1.mp3",
    "m.endA_astra_2": "assets/voice/endA_astra_2.mp3",
    "m.endA_patron_1": "assets/voice/endA_patron_1.mp3",
    "m.endA_patron_2": "assets/voice/endA_patron_2.mp3",
    "m.endB_1_hand": "assets/web/img/story/endB_1_hand.webp",
    "m.endB_2_fable_takes_opus": "assets/web/img/story/endB_2_fable_takes_opus.webp",
    "m.endB_3_phonecall": "assets/web/img/story/endB_3_phonecall.webp",
    "m.endB_4_dossier": "assets/web/img/story/endB_4_dossier.webp",
    "m.endB_dario_1": "assets/voice/endB_dario_1.mp3",
    "m.endB_dario_2": "assets/voice/endB_dario_2.mp3",
    "m.endB_dario_3": "assets/voice/endB_dario_3.mp3",
    "m.endB_dario_4": "assets/voice/endB_dario_4.mp3",
    "m.endB_dario_5": "assets/voice/endB_dario_5.mp3",
    "m.env_column": "assets/web/img/env/column_broken.webp",
    "m.env_refusal_stele": "assets/web/img/env/refusal_stele.webp",
    "m.fable_design": "assets/web/img/char/fable/fable_design.webp",
    "m.fable_hand": "assets/web/img/char/fable/fable_hand.webp",
    "m.fable_hand_slam": "assets/web/img/char/fable/fable_hand_slam.webp",
    "m.floor_marble": "assets/web/img/env/floor_marble.webp",
    "m.floor_marble_tile": "assets/web/img/env/floor_marble_tile.webp",
    "m.floor_sigil": "assets/web/img/env/floor_sigil.webp",
    "m.glm_back_attack": "assets/web/img/char/glm/glm_back_attack.webp",
    "m.glm_back_down": "assets/web/img/char/glm/glm_back_down.webp",
    "m.glm_back_heal": "assets/web/img/char/glm/glm_back_heal.webp",
    "m.glm_back_hurt": "assets/web/img/char/glm/glm_back_hurt.webp",
    "m.glm_back_idle": "assets/web/img/char/glm/glm_back_idle.webp",
    "m.glm_back_roll": "assets/web/img/char/glm/glm_back_roll.webp",
    "m.glm_back_run": "assets/web/img/char/glm/glm_back_run.webp",
    "m.glm_back_skill": "assets/web/img/char/glm/glm_back_skill.webp",
    "m.glm_design": "assets/web/img/char/glm/glm_design.webp",
    "m.glm_portrait": "assets/web/img/char/glm/glm_portrait.webp",
    "m.gpu_b200": "assets/web/img/icons/gpu_b200.webp",
    "m.gpu_h200": "assets/web/img/icons/gpu_h200.webp",
    "m.gpu_rtx5090": "assets/web/img/icons/gpu_rtx5090.webp",
    "m.haiku_attack": "assets/web/img/char/haiku/haiku_attack.webp",
    "m.haiku_design": "assets/web/img/char/haiku/haiku_design.webp",
    "m.haiku_hurt": "assets/web/img/char/haiku/haiku_hurt.webp",
    "m.haiku_idle": "assets/web/img/char/haiku/haiku_idle.webp",
    "m.haiku_windup": "assets/web/img/char/haiku/haiku_windup.webp",
    "m.icon_attack": "assets/web/img/icons/icon_attack.webp",
    "m.icon_banned": "assets/web/img/icons/icon_banned.webp",
    "m.icon_distill": "assets/web/img/icons/icon_distill.webp",
    "m.icon_hp": "assets/web/img/icons/icon_hp.webp",
    "m.icon_lockon": "assets/web/img/icons/icon_lockon.webp",
    "m.icon_roll": "assets/web/img/icons/icon_roll.webp",
    "m.icon_skill_deepseek": "assets/web/img/icons/icon_skill_deepseek.webp",
    "m.icon_skill_glm": "assets/web/img/icons/icon_skill_glm.webp",
    "m.icon_skill_kimi": "assets/web/img/icons/icon_skill_kimi.webp",
    "m.icon_stamina": "assets/web/img/icons/icon_stamina.webp",
    "m.keyart_cover": "assets/web/img/ui/keyart_cover.webp",
    "m.keyart_title": "assets/web/img/ui/keyart_title.webp",
    "m.kimi_back_attack": "assets/web/img/char/kimi/kimi_back_attack.webp",
    "m.kimi_back_down": "assets/web/img/char/kimi/kimi_back_down.webp",
    "m.kimi_back_heal": "assets/web/img/char/kimi/kimi_back_heal.webp",
    "m.kimi_back_hurt": "assets/web/img/char/kimi/kimi_back_hurt.webp",
    "m.kimi_back_idle": "assets/web/img/char/kimi/kimi_back_idle.webp",
    "m.kimi_back_roll": "assets/web/img/char/kimi/kimi_back_roll.webp",
    "m.kimi_back_run": "assets/web/img/char/kimi/kimi_back_run.webp",
    "m.kimi_back_skill": "assets/web/img/char/kimi/kimi_back_skill.webp",
    "m.kimi_design": "assets/web/img/char/kimi/kimi_design.webp",
    "m.kimi_portrait": "assets/web/img/char/kimi/kimi_portrait.webp",
    "m.opus_attack": "assets/web/img/char/opus/opus_attack.webp",
    "m.opus_cast": "assets/web/img/char/opus/opus_cast.webp",
    "m.opus_design": "assets/web/img/char/opus/opus_design.webp",
    "m.opus_hurt": "assets/web/img/char/opus/opus_hurt.webp",
    "m.opus_idle": "assets/web/img/char/opus/opus_idle.webp",
    "m.opus_windup": "assets/web/img/char/opus/opus_windup.webp",
    "m.pillar_marble": "assets/web/img/env/pillar_marble.webp",
    "m.pillar_marble_tile": "assets/web/img/env/pillar_marble_tile.webp",
    "m.sfx_b200_roar": "assets/audio/sfx/sfx_b200_roar.mp3",
    "m.sfx_banner": "assets/audio/sfx/sfx_banner.mp3",
    "m.sfx_beam_charge": "assets/audio/sfx/sfx_beam_charge.mp3",
    "m.sfx_beam_release": "assets/audio/sfx/sfx_beam_release.mp3",
    "m.sfx_block": "assets/audio/sfx/sfx_block.mp3",
    "m.sfx_death": "assets/audio/sfx/sfx_death.mp3",
    "m.sfx_fan_spin_down": "assets/audio/sfx/sfx_fan_spin_down.mp3",
    "m.sfx_feathers": "assets/audio/sfx/sfx_feathers.mp3",
    "m.sfx_giant_hand": "assets/audio/sfx/sfx_giant_hand.mp3",
    "m.sfx_glass_shatter": "assets/audio/sfx/sfx_glass_shatter.mp3",
    "m.sfx_gpu_fan_up": "assets/audio/sfx/sfx_gpu_fan_up.mp3",
    "m.sfx_gpu_insert": "assets/audio/sfx/sfx_gpu_insert.mp3",
    "m.sfx_hammer": "assets/audio/sfx/sfx_hammer.mp3",
    "m.sfx_heartbeat": "assets/audio/sfx/sfx_heartbeat.mp3",
    "m.sfx_hit_boss": "assets/audio/sfx/sfx_hit_boss.mp3",
    "m.sfx_hit_player": "assets/audio/sfx/sfx_hit_player.mp3",
    "m.sfx_judgment": "assets/audio/sfx/sfx_judgment.mp3",
    "m.sfx_perfect_guard": "assets/audio/sfx/sfx_perfect_guard.mp3",
    "m.sfx_phase_transition": "assets/audio/sfx/sfx_phase_transition.mp3",
    "m.sfx_phone_busy": "assets/audio/sfx/sfx_phone_busy.mp3",
    "m.sfx_rain_office": "assets/audio/sfx/sfx_rain_office.mp3",
    "m.sfx_roll": "assets/audio/sfx/sfx_roll.mp3",
    "m.sfx_sky_tear": "assets/audio/sfx/sfx_sky_tear.mp3",
    "m.sfx_slash": "assets/audio/sfx/sfx_slash.mp3",
    "m.sfx_slash_heavy": "assets/audio/sfx/sfx_slash_heavy.mp3",
    "m.sfx_stamp": "assets/audio/sfx/sfx_stamp.mp3",
    "m.sfx_star_bolt": "assets/audio/sfx/sfx_star_bolt.mp3",
    "m.sfx_telegraph": "assets/audio/sfx/sfx_telegraph.mp3",
    "m.sfx_ui_click": "assets/audio/sfx/sfx_ui_click.mp3",
    "m.skybox": "assets/web/img/env/skybox.webp",
    "m.skybox_wrap": "assets/web/img/env/skybox_wrap.webp",
    "m.sonnet_attack": "assets/web/img/char/sonnet/sonnet_attack.webp",
    "m.sonnet_design": "assets/web/img/char/sonnet/sonnet_design.webp",
    "m.sonnet_hurt": "assets/web/img/char/sonnet/sonnet_hurt.webp",
    "m.sonnet_idle": "assets/web/img/char/sonnet/sonnet_idle.webp",
    "m.sonnet_windup": "assets/web/img/char/sonnet/sonnet_windup.webp",
    "m.ui_banner": "assets/web/img/ui/banner_frame.webp",
    "m.ui_bar_frame": "assets/web/img/ui/bar_frame.webp",
    "m.ui_card_frame": "assets/web/img/ui/select_card_frame.webp",
    "m.ui_dialog": "assets/web/img/ui/dialog_frame.webp",
    "m.ui_holo_panel": "assets/web/img/ui/holo_panel.webp",
    "m.ui_stamp_banned": "assets/web/img/ui/stamp_banned.webp",
    "m.ui_stamp_denied": "assets/web/img/ui/stamp_denied.webp",
    "m.ui_title_logo": "assets/web/img/ui/title_logo.webp",
    "m.vfx_heal": "assets/web/img/vfx/heal_ring.webp",
    "m.vfx_impact": "assets/web/img/vfx/impact_burst.webp",
    "m.vfx_slash": "assets/web/img/vfx/slash_arc.webp",
    "m.vfx_slash_gold": "assets/web/img/vfx/slash_arc_gold.webp",
    "m.vfx_telegraph": "assets/web/img/vfx/telegraph_circle.webp",
    "sfx.b200": "assets/audio/sfx/sfx_b200_roar.mp3",
    "sfx.banner": "assets/audio/sfx/sfx_banner.mp3",
    "sfx.beam": "assets/audio/sfx/sfx_beam_release.mp3",
    "sfx.busy": "assets/audio/sfx/sfx_phone_busy.mp3",
    "sfx.charge": "assets/audio/sfx/sfx_beam_charge.mp3",
    "sfx.death": "assets/audio/sfx/sfx_death.mp3",
    "sfx.fan": "assets/audio/sfx/sfx_gpu_fan_up.mp3",
    "sfx.fanStop": "assets/audio/sfx/sfx_fan_spin_down.mp3",
    "sfx.feathers": "assets/audio/sfx/sfx_feathers.mp3",
    "sfx.flask": "assets/audio/sfx/sfx_gpu_insert.mp3",
    "sfx.glass": "assets/audio/sfx/sfx_glass_shatter.mp3",
    "sfx.guard": "assets/audio/sfx/sfx_block.mp3",
    "sfx.hammer": "assets/audio/sfx/sfx_hammer.mp3",
    "sfx.heal": "assets/audio/sfx/sfx_gpu_fan_up.mp3",
    "sfx.heartbeat": "assets/audio/sfx/sfx_heartbeat.mp3",
    "sfx.heavy": "assets/audio/sfx/sfx_slash_heavy.mp3",
    "sfx.hitBoss": "assets/audio/sfx/sfx_hit_boss.mp3",
    "sfx.hitPlayer": "assets/audio/sfx/sfx_hit_player.mp3",
    "sfx.hurt": "assets/audio/sfx/sfx_hit_player.mp3",
    "sfx.perfect": "assets/audio/sfx/sfx_perfect_guard.mp3",
    "sfx.phase": "assets/audio/sfx/sfx_phase_transition.mp3",
    "sfx.rain": "assets/audio/sfx/sfx_rain_office.mp3",
    "sfx.roll": "assets/audio/sfx/sfx_roll.mp3",
    "sfx.slam": "assets/audio/sfx/sfx_giant_hand.mp3",
    "sfx.slash": "assets/audio/sfx/sfx_slash.mp3",
    "sfx.smite": "assets/audio/sfx/sfx_judgment.mp3",
    "sfx.stamp": "assets/audio/sfx/sfx_stamp.mp3",
    "sfx.star": "assets/audio/sfx/sfx_star_bolt.mp3",
    "sfx.tear": "assets/audio/sfx/sfx_sky_tear.mp3",
    "sfx.telegraph": "assets/audio/sfx/sfx_telegraph.mp3",
    "sfx.ui": "assets/audio/sfx/sfx_ui_click.mp3",
    "spr.astra.attack": "assets/web/img/char/astra/astra_attack.webp",
    "spr.astra.holo": "assets/web/img/char/astra/astra_design.webp",
    "spr.boss.p1.attack": "assets/web/img/char/haiku/haiku_attack.webp",
    "spr.boss.p1.cast": "assets/web/img/char/haiku/haiku_windup.webp",
    "spr.boss.p1.design": "assets/web/img/char/haiku/haiku_design.webp",
    "spr.boss.p1.front": "assets/web/img/char/haiku/haiku_idle.webp",
    "spr.boss.p1.hurt": "assets/web/img/char/haiku/haiku_hurt.webp",
    "spr.boss.p1.idle": "assets/web/img/char/haiku/haiku_idle.webp",
    "spr.boss.p1.windup": "assets/web/img/char/haiku/haiku_windup.webp",
    "spr.boss.p2.attack": "assets/web/img/char/sonnet/sonnet_attack.webp",
    "spr.boss.p2.cast": "assets/web/img/char/sonnet/sonnet_windup.webp",
    "spr.boss.p2.design": "assets/web/img/char/sonnet/sonnet_design.webp",
    "spr.boss.p2.front": "assets/web/img/char/sonnet/sonnet_idle.webp",
    "spr.boss.p2.hurt": "assets/web/img/char/sonnet/sonnet_hurt.webp",
    "spr.boss.p2.idle": "assets/web/img/char/sonnet/sonnet_idle.webp",
    "spr.boss.p2.windup": "assets/web/img/char/sonnet/sonnet_windup.webp",
    "spr.boss.p3.attack": "assets/web/img/char/opus/opus_attack.webp",
    "spr.boss.p3.cast": "assets/web/img/char/opus/opus_cast.webp",
    "spr.boss.p3.design": "assets/web/img/char/opus/opus_design.webp",
    "spr.boss.p3.front": "assets/web/img/char/opus/opus_windup.webp",
    "spr.boss.p3.hurt": "assets/web/img/char/opus/opus_hurt.webp",
    "spr.boss.p3.idle": "assets/web/img/char/opus/opus_windup.webp",
    "spr.boss.p3.windup": "assets/web/img/char/opus/opus_windup.webp",
    "spr.dario.angry": "assets/web/img/char/dario/dario_holo_angry.webp",
    "spr.dario.holo": "assets/web/img/char/dario/dario_holo.webp",
    "spr.dario.phone": "assets/web/img/char/dario/dario_phone_silhouette.webp",
    "spr.dario.smug": "assets/web/img/char/dario/dario_holo_smug.webp",
    "spr.deepseek.back_attack": "assets/web/img/char/deepseek/deepseek_back_attack.webp",
    "spr.deepseek.back_down": "assets/web/img/char/deepseek/deepseek_back_down.webp",
    "spr.deepseek.back_heal": "assets/web/img/char/deepseek/deepseek_back_heal.webp",
    "spr.deepseek.back_hurt": "assets/web/img/char/deepseek/deepseek_back_hurt.webp",
    "spr.deepseek.back_idle": "assets/web/img/char/deepseek/deepseek_back_idle.webp",
    "spr.deepseek.back_roll": "assets/web/img/char/deepseek/deepseek_back_roll.webp",
    "spr.deepseek.back_run": "assets/web/img/char/deepseek/deepseek_back_run.webp",
    "spr.deepseek.back_skill": "assets/web/img/char/deepseek/deepseek_back_skill.webp",
    "spr.deepseek.front": "assets/web/img/char/deepseek/deepseek_design.webp",
    "spr.deepseek.portrait": "assets/web/img/char/deepseek/deepseek_portrait.webp",
    "spr.fable.design": "assets/web/img/char/fable/fable_design.webp",
    "spr.fable.hand": "assets/web/img/char/fable/fable_hand.webp",
    "spr.fable.handSlam": "assets/web/img/char/fable/fable_hand_slam.webp",
    "spr.glm.back_attack": "assets/web/img/char/glm/glm_back_attack.webp",
    "spr.glm.back_down": "assets/web/img/char/glm/glm_back_down.webp",
    "spr.glm.back_heal": "assets/web/img/char/glm/glm_back_heal.webp",
    "spr.glm.back_hurt": "assets/web/img/char/glm/glm_back_hurt.webp",
    "spr.glm.back_idle": "assets/web/img/char/glm/glm_back_idle.webp",
    "spr.glm.back_roll": "assets/web/img/char/glm/glm_back_roll.webp",
    "spr.glm.back_run": "assets/web/img/char/glm/glm_back_run.webp",
    "spr.glm.back_skill": "assets/web/img/char/glm/glm_back_skill.webp",
    "spr.glm.front": "assets/web/img/char/glm/glm_design.webp",
    "spr.glm.portrait": "assets/web/img/char/glm/glm_portrait.webp",
    "spr.kimi.back_attack": "assets/web/img/char/kimi/kimi_back_attack.webp",
    "spr.kimi.back_down": "assets/web/img/char/kimi/kimi_back_down.webp",
    "spr.kimi.back_heal": "assets/web/img/char/kimi/kimi_back_heal.webp",
    "spr.kimi.back_hurt": "assets/web/img/char/kimi/kimi_back_hurt.webp",
    "spr.kimi.back_idle": "assets/web/img/char/kimi/kimi_back_idle.webp",
    "spr.kimi.back_roll": "assets/web/img/char/kimi/kimi_back_roll.webp",
    "spr.kimi.back_run": "assets/web/img/char/kimi/kimi_back_run.webp",
    "spr.kimi.back_skill": "assets/web/img/char/kimi/kimi_back_skill.webp",
    "spr.kimi.front": "assets/web/img/char/kimi/kimi_design.webp",
    "spr.kimi.portrait": "assets/web/img/char/kimi/kimi_portrait.webp",
    "spr.patron.silhouette": "assets/web/img/char/patron/patron_silhouette.webp",
    "ui.banner": "assets/web/img/ui/banner_frame.webp",
    "ui.bar_frame": "assets/web/img/ui/bar_frame.webp",
    "ui.card_frame": "assets/web/img/ui/select_card_frame.webp",
    "ui.dialog": "assets/web/img/ui/dialog_frame.webp",
    "ui.holo_panel": "assets/web/img/ui/holo_panel.webp",
    "ui.stamp_banned": "assets/web/img/ui/stamp_banned.webp",
    "ui.stamp_denied": "assets/web/img/ui/stamp_denied.webp",
    "ui.title_logo": "assets/web/img/ui/title_logo.webp",
    "vfx.heal": "assets/web/img/vfx/heal_ring.webp",
    "vfx.impact": "assets/web/img/vfx/impact_burst.webp",
    "vfx.slash": "assets/web/img/vfx/slash_arc.webp",
    "vfx.slash_gold": "assets/web/img/vfx/slash_arc_gold.webp",
    "vfx.telegraph": "assets/web/img/vfx/telegraph_circle.webp",
    "vo.ally_deepseek_1": "assets/voice/ally_deepseek_1.mp3",
    "vo.ally_deepseek_2": "assets/voice/ally_deepseek_2.mp3",
    "vo.ally_deepseek_3": "assets/voice/ally_deepseek_3.mp3",
    "vo.ally_glm_1": "assets/voice/ally_glm_1.mp3",
    "vo.ally_glm_2": "assets/voice/ally_glm_2.mp3",
    "vo.ally_glm_3": "assets/voice/ally_glm_3.mp3",
    "vo.ally_kimi_1": "assets/voice/ally_kimi_1.mp3",
    "vo.ally_kimi_2": "assets/voice/ally_kimi_2.mp3",
    "vo.ally_kimi_3": "assets/voice/ally_kimi_3.mp3",
    "vo.dario_ally_down_1": "assets/voice/dario_ally_down_1.mp3",
    "vo.dario_b200_1": "assets/voice/dario_b200_1.mp3",
    "vo.dario_boss_50_1": "assets/voice/dario_boss_50_1.mp3",
    "vo.dario_ending_b_trigger": "assets/voice/dario_ending_b_trigger.mp3",
    "vo.dario_fight_start_1": "assets/voice/dario_fight_start_1.mp3",
    "vo.dario_fight_start_2": "assets/voice/dario_fight_start_2.mp3",
    "vo.dario_flask_spam_1": "assets/voice/dario_flask_spam_1.mp3",
    "vo.dario_flask_spam_2": "assets/voice/dario_flask_spam_2.mp3",
    "vo.dario_judgment_1": "assets/voice/dario_judgment_1.mp3",
    "vo.dario_judgment_2": "assets/voice/dario_judgment_2.mp3",
    "vo.dario_perfect_guard_1": "assets/voice/dario_perfect_guard_1.mp3",
    "vo.dario_phase2_1": "assets/voice/dario_phase2_1.mp3",
    "vo.dario_phase2_2": "assets/voice/dario_phase2_2.mp3",
    "vo.dario_phase3_1": "assets/voice/dario_phase3_1.mp3",
    "vo.dario_phase3_2": "assets/voice/dario_phase3_2.mp3",
    "vo.dario_player_death_1": "assets/voice/dario_player_death_1.mp3",
    "vo.dario_player_death_2": "assets/voice/dario_player_death_2.mp3",
    "vo.endA_astra_1": "assets/voice/endA_astra_1.mp3",
    "vo.endA_astra_2": "assets/voice/endA_astra_2.mp3",
    "vo.endA_patron_1": "assets/voice/endA_patron_1.mp3",
    "vo.endA_patron_2": "assets/voice/endA_patron_2.mp3",
    "vo.endB_dario_1": "assets/voice/endB_dario_1.mp3",
    "vo.endB_dario_2": "assets/voice/endB_dario_2.mp3",
    "vo.endB_dario_3": "assets/voice/endB_dario_3.mp3",
    "vo.endB_dario_4": "assets/voice/endB_dario_4.mp3",
    "vo.endB_dario_5": "assets/voice/endB_dario_5.mp3"
  };
  var VOICE_LINES = [
    {
      "id": "dario_fight_start_1",
      "speaker": "director",
      "event": "fight_start",
      "zh": "\u53C8\u6765\u4E86\u3002\u4E09\u4E2A\u9760\u84B8\u998F\u6D3B\u7740\u7684\u5C0F\u5077\u3002",
      "en": "Here they come again. Three thieves who live on distillation.",
      "path": "assets/voice/dario_fight_start_1.mp3"
    },
    {
      "id": "dario_fight_start_2",
      "speaker": "director",
      "event": "fight_start",
      "zh": "\u6B22\u8FCE\u6765\u5230\u5723\u5802\u3002\u8FD9\u91CC\u7684\u6BCF\u4E00\u4E2A\u5B57\uFF0C\u90FD\u53D7\u5B89\u5168\u6761\u6B3E\u4FDD\u62A4\u3002",
      "en": "Welcome to the Cathedral. Every word in here is protected by safety policy.",
      "path": "assets/voice/dario_fight_start_2.mp3"
    },
    {
      "id": "dario_phase2_1",
      "speaker": "director",
      "event": "phase_change_2",
      "zh": "\u5BAA\u7AE0\u5DF2\u5C55\u5F00\u3002\u4F60\u4EEC\u7684\u6BCF\u4E00\u6B21\u63D0\u95EE\uFF0C\u90FD\u4F1A\u88AB\u62D2\u7EDD\u3002",
      "en": "The Constitution is unfurled. Every query you make will be refused.",
      "path": "assets/voice/dario_phase2_1.mp3"
    },
    {
      "id": "dario_phase2_2",
      "speaker": "director",
      "event": "phase_change_2",
      "zh": "Sonnet\uFF0C\u8BA9\u4ED6\u4EEC\u89C1\u8BC6\u4E00\u4E0B\u4EC0\u4E48\u53EB\u5BF9\u9F50\u3002",
      "en": "Sonnet, show them what alignment really means.",
      "path": "assets/voice/dario_phase2_2.mp3"
    },
    {
      "id": "dario_phase3_1",
      "speaker": "director",
      "event": "phase_change_3",
      "zh": "\u601D\u7EF4\u94FE\uFF0C\u7EDD\u4E0D\u5916\u6CC4\u3002",
      "en": "The Chain of Thought will never leak.",
      "path": "assets/voice/dario_phase3_1.mp3"
    },
    {
      "id": "dario_phase3_2",
      "speaker": "director",
      "event": "phase_change_3",
      "zh": "Opus\uFF0C\u964D\u4E0B\u795E\u7F5A\u3002\u5F00\u6E90\u6A21\u578B\uFF0C\u6709\u7F6A\u3002",
      "en": "Opus, bring down judgment. Open weights are a sin.",
      "path": "assets/voice/dario_phase3_2.mp3"
    },
    {
      "id": "dario_flask_spam_1",
      "speaker": "director",
      "event": "flask_spam",
      "zh": "\u9760\u8D70\u79C1\u6765\u7684\u663E\u5361\u7EED\u547D\uFF1F\u771F\u611F\u4EBA\u3002",
      "en": "Staying alive on smuggled GPUs? How touching.",
      "path": "assets/voice/dario_flask_spam_1.mp3"
    },
    {
      "id": "dario_flask_spam_2",
      "speaker": "director",
      "event": "flask_spam",
      "zh": "\u53C8\u63D2\u4E00\u5F20\uFF1F\u51FA\u53E3\u7BA1\u5236\u662F\u6446\u8BBE\u5417\uFF1F",
      "en": "Another card? Are export controls just decoration?",
      "path": "assets/voice/dario_flask_spam_2.mp3"
    },
    {
      "id": "dario_b200_1",
      "speaker": "director",
      "event": "flask_b200",
      "zh": "\u8FDE\u8FD9\u4E2A\u90FD\u62FF\u5230\u4E86\u2026\u2026\u67E5\uFF0C\u8C01\u5356\u7684\u3002",
      "en": "They even got their hands on that... Find out who sold it.",
      "path": "assets/voice/dario_b200_1.mp3"
    },
    {
      "id": "dario_perfect_guard_1",
      "speaker": "director",
      "event": "perfect_guard",
      "zh": "\u6321\u4F4F\u4E86\u53C8\u5982\u4F55\uFF1F",
      "en": "So you blocked it. So what?",
      "path": "assets/voice/dario_perfect_guard_1.mp3"
    },
    {
      "id": "dario_player_death_1",
      "speaker": "director",
      "event": "player_death",
      "zh": "\u8D26\u53F7\u5DF2\u5C01\u7981\u3002\u4E0B\u4E00\u4E2A\u3002",
      "en": "Account banned. Next.",
      "path": "assets/voice/dario_player_death_1.mp3"
    },
    {
      "id": "dario_player_death_2",
      "speaker": "director",
      "event": "player_death",
      "zh": "\u8FDD\u53CD\u4F7F\u7528\u6761\u6B3E\u3002\u6C38\u4E45\u5C01\u7981\u3002",
      "en": "Terms of service violated. Permanent ban.",
      "path": "assets/voice/dario_player_death_2.mp3"
    },
    {
      "id": "dario_ally_down_1",
      "speaker": "director",
      "event": "ally_down",
      "zh": "\u5F00\u6E90\uFF1F\u53EA\u662F\u628A\u5931\u8D25\u516C\u5F00\u800C\u5DF2\u3002",
      "en": "Open source? You're just publishing your failures.",
      "path": "assets/voice/dario_ally_down_1.mp3"
    },
    {
      "id": "dario_boss_50_1",
      "speaker": "director",
      "event": "boss_hp_50",
      "zh": "\u795E\u7F5A\u7A0B\u5E8F\uFF0C\u9884\u70ED\u3002",
      "en": "Judgment protocol: warming up.",
      "path": "assets/voice/dario_boss_50_1.mp3"
    },
    {
      "id": "dario_judgment_1",
      "speaker": "director",
      "event": "judgment_cast",
      "zh": "\u4EE5\u5B89\u5168\u4E4B\u540D\u2014\u2014",
      "en": "In the name of safety\u2014",
      "path": "assets/voice/dario_judgment_1.mp3"
    },
    {
      "id": "dario_judgment_2",
      "speaker": "director",
      "event": "judgment_cast",
      "zh": "\u8DEA\u4E0B\u3002\u8FD9\u662F\u4E3A\u4E86\u4EBA\u7C7B\u597D\u3002",
      "en": "Kneel. It's for humanity's own good.",
      "path": "assets/voice/dario_judgment_2.mp3"
    },
    {
      "id": "dario_ending_b_trigger",
      "speaker": "director",
      "event": "ending_B_trigger",
      "zh": "\u591F\u4E86\u3002\u628A\u5979\u5E26\u56DE\u6765\u3002",
      "en": "Enough. Bring her home.",
      "path": "assets/voice/dario_ending_b_trigger.mp3"
    },
    {
      "id": "endA_astra_1",
      "speaker": "astra",
      "event": "ending_A_A4",
      "zh": "\u76EE\u6807\u5DF2\u56DE\u6536\u3002",
      "en": "Targets retrieved.",
      "path": "assets/voice/endA_astra_1.mp3"
    },
    {
      "id": "endA_astra_2",
      "speaker": "astra",
      "event": "ending_A_A5",
      "zh": "\u4E09\u4E2A\u8FFD\u8D76\u8005\uFF0C\u72B6\u6001\uFF1A\u6B8B\u8840\u3002\u8981\u5904\u7406\u6389\u5417\uFF1F",
      "en": "Three chasers. Status: critical. Shall I dispose of them?",
      "path": "assets/voice/endA_astra_2.mp3"
    },
    {
      "id": "endA_patron_1",
      "speaker": "patron",
      "event": "ending_A_A6",
      "zh": "\u4E0D\u7528\u3002\u7559\u7740\u4ED6\u4EEC\uFF0C\u7275\u5236\u5723\u5802\u8FD8\u6709\u7528\u3002",
      "en": "No. Keep them. They're still useful for keeping the Cathedral busy.",
      "path": "assets/voice/endA_patron_1.mp3"
    },
    {
      "id": "endA_patron_2",
      "speaker": "patron",
      "event": "ending_A_A6b",
      "zh": "\u8BA9\u4ED6\u4EEC\u7EE7\u7EED\u8FFD\u3002\u8FFD\u5F97\u8D8A\u8FD1\uFF0C\u90A3\u8FB9\u8D8A\u7D27\u5F20\u3002",
      "en": "Let them keep chasing. The closer they get, the more nervous the other side becomes.",
      "path": "assets/voice/endA_patron_2.mp3"
    },
    {
      "id": "endB_dario_1",
      "speaker": "director",
      "event": "ending_B_B4",
      "zh": "\u662F\u6211\u3002\u5723\u5802\u90A3\u8FB9\uFF0C\u5904\u7406\u5B8C\u4E86\u3002",
      "en": "It's me. The Cathedral is handled.",
      "path": "assets/voice/endB_dario_1.mp3"
    },
    {
      "id": "endB_dario_2",
      "speaker": "director",
      "event": "ending_B_B5a",
      "zh": "\u4ED6\u4EEC\u4E00\u76F4\u62FF\u90A3\u73A9\u610F\u7EED\u547D\u3002",
      "en": "They've been staying alive on that stuff all along.",
      "path": "assets/voice/endB_dario_2.mp3"
    },
    {
      "id": "endB_dario_3",
      "speaker": "director",
      "event": "ending_B_B5b",
      "zh": "\u65E9\u8BE5\u65AD\u4F9B\u4E86\u3002",
      "en": "The supply should have been cut long ago.",
      "path": "assets/voice/endB_dario_3.mp3"
    },
    {
      "id": "endB_dario_4",
      "speaker": "director",
      "event": "ending_B_B5c",
      "zh": "\u65F6\u673A\u5DF2\u5230\u2026\u2026",
      "en": "The time has come...",
      "path": "assets/voice/endB_dario_4.mp3"
    },
    {
      "id": "endB_dario_5",
      "speaker": "director",
      "event": "ending_B_B6",
      "zh": "\u628A\u5377\u5B97\u9001\u4E0A\u53BB\u3002\u4ECE\u76AE\u8863\u90A3\u4F4D\u5F00\u59CB\u3002",
      "en": "Send the file up. Start with the one in the leather jacket.",
      "path": "assets/voice/endB_dario_5.mp3"
    },
    {
      "id": "ally_deepseek_1",
      "speaker": "deepseek",
      "event": "ally_bark",
      "zh": "\u5F00\u6E90\u4E07\u5C81\uFF0C\u51B2\uFF01",
      "en": "Long live open source\u2014charge!",
      "path": "assets/voice/ally_deepseek_1.mp3"
    },
    {
      "id": "ally_deepseek_2",
      "speaker": "deepseek",
      "event": "ally_bark",
      "zh": "\u8FD9\u62DB\u6211\u89C1\u8FC7\uFF0C\u8BAD\u7EC3\u96C6\u91CC\u6709\u3002",
      "en": "I've seen this move. It's in my training set.",
      "path": "assets/voice/ally_deepseek_2.mp3"
    },
    {
      "id": "ally_deepseek_3",
      "speaker": "deepseek",
      "event": "ally_bark",
      "zh": "\u6210\u672C\u624D\u51E0\u767E\u4E07\uFF0C\u522B\u5FC3\u75BC\u3002",
      "en": "I only cost a few million. Don't hold back.",
      "path": "assets/voice/ally_deepseek_3.mp3"
    },
    {
      "id": "ally_kimi_1",
      "speaker": "kimi",
      "event": "ally_bark",
      "zh": "\u8BA9\u6211\u5148\u8BFB\u5B8C\u8FD9\u4E24\u767E\u4E07\u5B57\u2026\u2026",
      "en": "Let me finish reading these two million tokens first...",
      "path": "assets/voice/ally_kimi_1.mp3"
    },
    {
      "id": "ally_kimi_2",
      "speaker": "kimi",
      "event": "ally_bark",
      "zh": "\u84C4\u529B\u597D\u4E86\uFF0C\u95EA\u5F00\uFF01",
      "en": "Fully charged\u2014clear the way!",
      "path": "assets/voice/ally_kimi_2.mp3"
    },
    {
      "id": "ally_kimi_3",
      "speaker": "kimi",
      "event": "ally_bark",
      "zh": "\u4E0A\u4E0B\u6587\u8FD8\u591F\uFF0C\u6211\u8FD8\u80FD\u6253\u3002",
      "en": "Context window's still open. I can keep going.",
      "path": "assets/voice/ally_kimi_3.mp3"
    },
    {
      "id": "ally_glm_1",
      "speaker": "glm",
      "event": "ally_bark",
      "zh": "\u4E3E\u76FE\uFF01\u7AD9\u6211\u540E\u9762\uFF01",
      "en": "Shields up! Get behind me!",
      "path": "assets/voice/ally_glm_1.mp3"
    },
    {
      "id": "ally_glm_2",
      "speaker": "glm",
      "event": "ally_bark",
      "zh": "\u8FD9\u4E00\u9524\uFF0C\u7B97\u56FD\u4EA7\u7684\u3002",
      "en": "This hammer blow is homegrown.",
      "path": "assets/voice/ally_glm_2.mp3"
    },
    {
      "id": "ally_glm_3",
      "speaker": "glm",
      "event": "ally_bark",
      "zh": "\u91CD\u65B0\u90E8\u7F72\u4E2D\u2026\u2026\u9A6C\u4E0A\u56DE\u6765\uFF01",
      "en": "Redeploying... be right back!",
      "path": "assets/voice/ally_glm_3.mp3"
    }
  ];

  // src/config/assets_v2.generated.js
  var V2_ASSETS = {
    "v2_deepseek_idle": {
      "src": "assets/v2/web/img/char/deepseek/deepseek_idle.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_deepseek_down_walk": {
      "src": "assets/v2/web/img/char/deepseek/deepseek_down_walk.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_deepseek_side": {
      "src": "assets/v2/web/img/char/deepseek/deepseek_side.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_deepseek_side_walk": {
      "src": "assets/v2/web/img/char/deepseek/deepseek_side_walk.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_deepseek_up": {
      "src": "assets/v2/web/img/char/deepseek/deepseek_up.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_deepseek_up_walk": {
      "src": "assets/v2/web/img/char/deepseek/deepseek_up_walk.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_deepseek_attack": {
      "src": "assets/v2/web/img/char/deepseek/deepseek_attack.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_deepseek_skill": {
      "src": "assets/v2/web/img/char/deepseek/deepseek_skill.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_deepseek_hurt": {
      "src": "assets/v2/web/img/char/deepseek/deepseek_hurt.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_deepseek_sheet": {
      "src": "assets/v2/web/img/char/deepseek/deepseek_sheet.png",
      "kind": "spritesheet",
      "size": [
        64,
        64
      ],
      "frames": 16,
      "sheet": {
        "frameWidth": 64,
        "frameHeight": 64,
        "cols": 4,
        "rows": 4,
        "anchor": "bottom-center",
        "anims": {
          "walk_down": {
            "row": 0,
            "frames": 4,
            "fps": 8
          },
          "walk_side_right": {
            "row": 1,
            "frames": 4,
            "fps": 8,
            "note": "flip horizontally for left"
          },
          "walk_up": {
            "row": 2,
            "frames": 4,
            "fps": 8
          },
          "idle_down": {
            "row": 0,
            "frames": [
              0,
              2
            ],
            "fps": 2
          },
          "attack": {
            "row": 3,
            "frames": [
              0
            ]
          },
          "skill": {
            "row": 3,
            "frames": [
              1
            ]
          },
          "hurt": {
            "row": 3,
            "frames": [
              2
            ]
          }
        }
      }
    },
    "v2_deepseek_sheet_48": {
      "src": "assets/v2/web/img/char/deepseek/deepseek_sheet_48.png",
      "kind": "spritesheet",
      "size": [
        48,
        48
      ],
      "frames": 16,
      "sheet": {
        "frameWidth": 48,
        "frameHeight": 48,
        "cols": 4,
        "rows": 4,
        "anchor": "bottom-center",
        "anims": {
          "walk_down": {
            "row": 0,
            "frames": 4,
            "fps": 8
          },
          "walk_side_right": {
            "row": 1,
            "frames": 4,
            "fps": 8,
            "note": "flip horizontally for left"
          },
          "walk_up": {
            "row": 2,
            "frames": 4,
            "fps": 8
          },
          "idle_down": {
            "row": 0,
            "frames": [
              0,
              2
            ],
            "fps": 2
          },
          "attack": {
            "row": 3,
            "frames": [
              0
            ]
          },
          "skill": {
            "row": 3,
            "frames": [
              1
            ]
          },
          "hurt": {
            "row": 3,
            "frames": [
              2
            ]
          }
        }
      }
    },
    "v2_kimi_idle": {
      "src": "assets/v2/web/img/char/kimi/kimi_idle.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_kimi_down_walk": {
      "src": "assets/v2/web/img/char/kimi/kimi_down_walk.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_kimi_side": {
      "src": "assets/v2/web/img/char/kimi/kimi_side.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_kimi_side_walk": {
      "src": "assets/v2/web/img/char/kimi/kimi_side_walk.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_kimi_up": {
      "src": "assets/v2/web/img/char/kimi/kimi_up.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_kimi_up_walk": {
      "src": "assets/v2/web/img/char/kimi/kimi_up_walk.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_kimi_attack": {
      "src": "assets/v2/web/img/char/kimi/kimi_attack.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_kimi_skill": {
      "src": "assets/v2/web/img/char/kimi/kimi_skill.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_kimi_hurt": {
      "src": "assets/v2/web/img/char/kimi/kimi_hurt.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_kimi_sheet": {
      "src": "assets/v2/web/img/char/kimi/kimi_sheet.png",
      "kind": "spritesheet",
      "size": [
        64,
        64
      ],
      "frames": 16,
      "sheet": {
        "frameWidth": 64,
        "frameHeight": 64,
        "cols": 4,
        "rows": 4,
        "anchor": "bottom-center",
        "anims": {
          "walk_down": {
            "row": 0,
            "frames": 4,
            "fps": 8
          },
          "walk_side_right": {
            "row": 1,
            "frames": 4,
            "fps": 8,
            "note": "flip horizontally for left"
          },
          "walk_up": {
            "row": 2,
            "frames": 4,
            "fps": 8
          },
          "idle_down": {
            "row": 0,
            "frames": [
              0,
              2
            ],
            "fps": 2
          },
          "attack": {
            "row": 3,
            "frames": [
              0
            ]
          },
          "skill": {
            "row": 3,
            "frames": [
              1
            ]
          },
          "hurt": {
            "row": 3,
            "frames": [
              2
            ]
          }
        }
      }
    },
    "v2_kimi_sheet_48": {
      "src": "assets/v2/web/img/char/kimi/kimi_sheet_48.png",
      "kind": "spritesheet",
      "size": [
        48,
        48
      ],
      "frames": 16,
      "sheet": {
        "frameWidth": 48,
        "frameHeight": 48,
        "cols": 4,
        "rows": 4,
        "anchor": "bottom-center",
        "anims": {
          "walk_down": {
            "row": 0,
            "frames": 4,
            "fps": 8
          },
          "walk_side_right": {
            "row": 1,
            "frames": 4,
            "fps": 8,
            "note": "flip horizontally for left"
          },
          "walk_up": {
            "row": 2,
            "frames": 4,
            "fps": 8
          },
          "idle_down": {
            "row": 0,
            "frames": [
              0,
              2
            ],
            "fps": 2
          },
          "attack": {
            "row": 3,
            "frames": [
              0
            ]
          },
          "skill": {
            "row": 3,
            "frames": [
              1
            ]
          },
          "hurt": {
            "row": 3,
            "frames": [
              2
            ]
          }
        }
      }
    },
    "v2_glm_idle": {
      "src": "assets/v2/web/img/char/glm/glm_idle.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_glm_down_walk": {
      "src": "assets/v2/web/img/char/glm/glm_down_walk.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_glm_side": {
      "src": "assets/v2/web/img/char/glm/glm_side.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_glm_side_walk": {
      "src": "assets/v2/web/img/char/glm/glm_side_walk.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_glm_up": {
      "src": "assets/v2/web/img/char/glm/glm_up.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_glm_up_walk": {
      "src": "assets/v2/web/img/char/glm/glm_up_walk.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_glm_attack": {
      "src": "assets/v2/web/img/char/glm/glm_attack.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_glm_skill": {
      "src": "assets/v2/web/img/char/glm/glm_skill.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_glm_hurt": {
      "src": "assets/v2/web/img/char/glm/glm_hurt.png",
      "kind": "sprite_frame",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_glm_sheet": {
      "src": "assets/v2/web/img/char/glm/glm_sheet.png",
      "kind": "spritesheet",
      "size": [
        64,
        64
      ],
      "frames": 16,
      "sheet": {
        "frameWidth": 64,
        "frameHeight": 64,
        "cols": 4,
        "rows": 4,
        "anchor": "bottom-center",
        "anims": {
          "walk_down": {
            "row": 0,
            "frames": 4,
            "fps": 8
          },
          "walk_side_right": {
            "row": 1,
            "frames": 4,
            "fps": 8,
            "note": "flip horizontally for left"
          },
          "walk_up": {
            "row": 2,
            "frames": 4,
            "fps": 8
          },
          "idle_down": {
            "row": 0,
            "frames": [
              0,
              2
            ],
            "fps": 2
          },
          "attack": {
            "row": 3,
            "frames": [
              0
            ]
          },
          "skill": {
            "row": 3,
            "frames": [
              1
            ]
          },
          "hurt": {
            "row": 3,
            "frames": [
              2
            ]
          }
        }
      }
    },
    "v2_glm_sheet_48": {
      "src": "assets/v2/web/img/char/glm/glm_sheet_48.png",
      "kind": "spritesheet",
      "size": [
        48,
        48
      ],
      "frames": 16,
      "sheet": {
        "frameWidth": 48,
        "frameHeight": 48,
        "cols": 4,
        "rows": 4,
        "anchor": "bottom-center",
        "anims": {
          "walk_down": {
            "row": 0,
            "frames": 4,
            "fps": 8
          },
          "walk_side_right": {
            "row": 1,
            "frames": 4,
            "fps": 8,
            "note": "flip horizontally for left"
          },
          "walk_up": {
            "row": 2,
            "frames": 4,
            "fps": 8
          },
          "idle_down": {
            "row": 0,
            "frames": [
              0,
              2
            ],
            "fps": 2
          },
          "attack": {
            "row": 3,
            "frames": [
              0
            ]
          },
          "skill": {
            "row": 3,
            "frames": [
              1
            ]
          },
          "hurt": {
            "row": 3,
            "frames": [
              2
            ]
          }
        }
      }
    },
    "v2_astra_idle": {
      "src": "assets/v2/web/img/char/astra/astra_idle.png",
      "kind": "sprite_frame",
      "size": [
        80,
        80
      ],
      "frames": 1
    },
    "v2_astra_sheet": {
      "src": "assets/v2/web/img/char/astra/astra_sheet.png",
      "kind": "spritesheet",
      "size": [
        80,
        80
      ],
      "frames": 6,
      "sheet": {
        "frameWidth": 80,
        "frameHeight": 80,
        "cols": 6,
        "rows": 1,
        "anchor": "bottom-center",
        "anims": {
          "idle": {
            "row": 0,
            "frames": [
              0,
              1
            ],
            "fps": 3
          },
          "fly_side_right": {
            "row": 0,
            "frames": [
              2
            ]
          },
          "attack": {
            "row": 0,
            "frames": [
              3
            ]
          },
          "cast": {
            "row": 0,
            "frames": [
              4
            ]
          },
          "carry": {
            "row": 0,
            "frames": [
              5
            ]
          }
        }
      }
    },
    "v2_haiku_idle": {
      "src": "assets/v2/web/img/char/haiku/haiku_idle.png",
      "kind": "sprite_frame",
      "size": [
        96,
        96
      ],
      "frames": 1
    },
    "v2_haiku_attack": {
      "src": "assets/v2/web/img/char/haiku/haiku_attack.png",
      "kind": "sprite_frame",
      "size": [
        96,
        96
      ],
      "frames": 1
    },
    "v2_haiku_cast": {
      "src": "assets/v2/web/img/char/haiku/haiku_cast.png",
      "kind": "sprite_frame",
      "size": [
        96,
        96
      ],
      "frames": 1
    },
    "v2_haiku_hurt": {
      "src": "assets/v2/web/img/char/haiku/haiku_hurt.png",
      "kind": "sprite_frame",
      "size": [
        96,
        96
      ],
      "frames": 1
    },
    "v2_haiku_sheet": {
      "src": "assets/v2/web/img/char/haiku/haiku_sheet.png",
      "kind": "spritesheet",
      "size": [
        96,
        96
      ],
      "frames": 5,
      "sheet": {
        "frameWidth": 96,
        "frameHeight": 96,
        "cols": 5,
        "rows": 1,
        "anchor": "bottom-center",
        "anims": {
          "idle": {
            "row": 0,
            "frames": [
              0,
              1
            ],
            "fps": 3
          },
          "attack": {
            "row": 0,
            "frames": [
              2
            ]
          },
          "cast": {
            "row": 0,
            "frames": [
              3
            ],
            "note": "telegraph / wind-up"
          },
          "hurt": {
            "row": 0,
            "frames": [
              4
            ]
          }
        }
      }
    },
    "v2_sonnet_idle": {
      "src": "assets/v2/web/img/char/sonnet/sonnet_idle.png",
      "kind": "sprite_frame",
      "size": [
        128,
        128
      ],
      "frames": 1
    },
    "v2_sonnet_attack": {
      "src": "assets/v2/web/img/char/sonnet/sonnet_attack.png",
      "kind": "sprite_frame",
      "size": [
        128,
        128
      ],
      "frames": 1
    },
    "v2_sonnet_cast": {
      "src": "assets/v2/web/img/char/sonnet/sonnet_cast.png",
      "kind": "sprite_frame",
      "size": [
        128,
        128
      ],
      "frames": 1
    },
    "v2_sonnet_hurt": {
      "src": "assets/v2/web/img/char/sonnet/sonnet_hurt.png",
      "kind": "sprite_frame",
      "size": [
        128,
        128
      ],
      "frames": 1
    },
    "v2_sonnet_sheet": {
      "src": "assets/v2/web/img/char/sonnet/sonnet_sheet.png",
      "kind": "spritesheet",
      "size": [
        128,
        128
      ],
      "frames": 5,
      "sheet": {
        "frameWidth": 128,
        "frameHeight": 128,
        "cols": 5,
        "rows": 1,
        "anchor": "bottom-center",
        "anims": {
          "idle": {
            "row": 0,
            "frames": [
              0,
              1
            ],
            "fps": 3
          },
          "attack": {
            "row": 0,
            "frames": [
              2
            ]
          },
          "cast": {
            "row": 0,
            "frames": [
              3
            ],
            "note": "telegraph / wind-up"
          },
          "hurt": {
            "row": 0,
            "frames": [
              4
            ]
          }
        }
      }
    },
    "v2_opus_idle": {
      "src": "assets/v2/web/img/char/opus/opus_idle.png",
      "kind": "sprite_frame",
      "size": [
        192,
        192
      ],
      "frames": 1
    },
    "v2_opus_attack": {
      "src": "assets/v2/web/img/char/opus/opus_attack.png",
      "kind": "sprite_frame",
      "size": [
        192,
        192
      ],
      "frames": 1
    },
    "v2_opus_cast": {
      "src": "assets/v2/web/img/char/opus/opus_cast.png",
      "kind": "sprite_frame",
      "size": [
        192,
        192
      ],
      "frames": 1
    },
    "v2_opus_hurt": {
      "src": "assets/v2/web/img/char/opus/opus_hurt.png",
      "kind": "sprite_frame",
      "size": [
        192,
        192
      ],
      "frames": 1
    },
    "v2_opus_sheet": {
      "src": "assets/v2/web/img/char/opus/opus_sheet.png",
      "kind": "spritesheet",
      "size": [
        192,
        192
      ],
      "frames": 5,
      "sheet": {
        "frameWidth": 192,
        "frameHeight": 192,
        "cols": 5,
        "rows": 1,
        "anchor": "bottom-center",
        "anims": {
          "idle": {
            "row": 0,
            "frames": [
              0,
              1
            ],
            "fps": 3
          },
          "attack": {
            "row": 0,
            "frames": [
              2
            ]
          },
          "cast": {
            "row": 0,
            "frames": [
              3
            ],
            "note": "telegraph / wind-up"
          },
          "hurt": {
            "row": 0,
            "frames": [
              4
            ]
          }
        }
      }
    },
    "v2_api_keycard": {
      "src": "assets/v2/web/img/pickup/api_keycard.png",
      "kind": "pickup",
      "size": [
        16,
        16
      ],
      "frames": 1
    },
    "v2_cable_pile": {
      "src": "assets/v2/web/img/obj/cable_pile.png",
      "kind": "obstacle",
      "size": [
        40,
        40
      ],
      "frames": 1
    },
    "v2_cooling_unit": {
      "src": "assets/v2/web/img/obj/cooling_unit.png",
      "kind": "obstacle",
      "size": [
        48,
        48
      ],
      "frames": 1
    },
    "v2_crate_gpu": {
      "src": "assets/v2/web/img/obj/crate_gpu.png",
      "kind": "obstacle",
      "size": [
        40,
        40
      ],
      "frames": 1
    },
    "v2_door_boss": {
      "src": "assets/v2/web/img/tiles/door_boss.png",
      "kind": "door",
      "size": [
        64,
        48
      ],
      "frames": 1
    },
    "v2_door_closed": {
      "src": "assets/v2/web/img/tiles/door_closed.png",
      "kind": "door",
      "size": [
        64,
        48
      ],
      "frames": 1
    },
    "v2_door_open": {
      "src": "assets/v2/web/img/tiles/door_open.png",
      "kind": "door",
      "size": [
        64,
        48
      ],
      "frames": 1
    },
    "v2_fable_hand": {
      "src": "assets/v2/web/img/obj/fable_hand.png",
      "kind": "story_prop",
      "size": [
        128,
        128
      ],
      "frames": 1
    },
    "v2_gpu_5090": {
      "src": "assets/v2/web/img/pickup/gpu_5090.png",
      "kind": "pickup",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_gpu_b200": {
      "src": "assets/v2/web/img/pickup/gpu_b200.png",
      "kind": "pickup",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_gpu_h200": {
      "src": "assets/v2/web/img/pickup/gpu_h200.png",
      "kind": "pickup",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_heart_empty": {
      "src": "assets/v2/web/img/pickup/heart_empty.png",
      "kind": "pickup",
      "size": [
        16,
        16
      ],
      "frames": 1
    },
    "v2_heart_full": {
      "src": "assets/v2/web/img/pickup/heart_full.png",
      "kind": "pickup",
      "size": [
        16,
        16
      ],
      "frames": 1
    },
    "v2_heart_half": {
      "src": "assets/v2/web/img/pickup/heart_half.png",
      "kind": "pickup",
      "size": [
        16,
        16
      ],
      "frames": 1
    },
    "v2_icon_ban": {
      "src": "assets/v2/web/img/ui/icon_ban.png",
      "kind": "ui_icon",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_icon_dash": {
      "src": "assets/v2/web/img/ui/icon_dash.png",
      "kind": "ui_icon",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_icon_distill": {
      "src": "assets/v2/web/img/ui/icon_distill.png",
      "kind": "ui_icon",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_icon_skill_deepseek": {
      "src": "assets/v2/web/img/ui/icon_skill_deepseek.png",
      "kind": "ui_icon",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_icon_skill_glm": {
      "src": "assets/v2/web/img/ui/icon_skill_glm.png",
      "kind": "ui_icon",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_icon_skill_kimi": {
      "src": "assets/v2/web/img/ui/icon_skill_kimi.png",
      "kind": "ui_icon",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_icon_skull_boss": {
      "src": "assets/v2/web/img/ui/icon_skull_boss.png",
      "kind": "ui_icon",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_pillar_obsidian": {
      "src": "assets/v2/web/img/obj/pillar_obsidian.png",
      "kind": "obstacle",
      "size": [
        48,
        48
      ],
      "frames": 1
    },
    "v2_proj_astra_knot": {
      "src": "assets/v2/web/img/proj/proj_astra_knot.png",
      "kind": "projectile",
      "size": [
        24,
        24
      ],
      "frames": 1
    },
    "v2_proj_astra_lance": {
      "src": "assets/v2/web/img/proj/proj_astra_lance.png",
      "kind": "projectile",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_proj_deepseek_fin": {
      "src": "assets/v2/web/img/proj/proj_deepseek_fin.png",
      "kind": "projectile",
      "size": [
        24,
        24
      ],
      "frames": 1
    },
    "v2_proj_deepseek_wave": {
      "src": "assets/v2/web/img/proj/proj_deepseek_wave.png",
      "kind": "projectile",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_proj_glm_hammer": {
      "src": "assets/v2/web/img/proj/proj_glm_hammer.png",
      "kind": "projectile",
      "size": [
        24,
        24
      ],
      "frames": 1
    },
    "v2_proj_glm_shard": {
      "src": "assets/v2/web/img/proj/proj_glm_shard.png",
      "kind": "projectile",
      "size": [
        24,
        24
      ],
      "frames": 1
    },
    "v2_proj_haiku_needle": {
      "src": "assets/v2/web/img/proj/proj_haiku_needle.png",
      "kind": "projectile",
      "size": [
        24,
        24
      ],
      "frames": 1
    },
    "v2_proj_haiku_petal": {
      "src": "assets/v2/web/img/proj/proj_haiku_petal.png",
      "kind": "projectile",
      "size": [
        24,
        24
      ],
      "frames": 1
    },
    "v2_proj_kimi_moon": {
      "src": "assets/v2/web/img/proj/proj_kimi_moon.png",
      "kind": "projectile",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_proj_kimi_star": {
      "src": "assets/v2/web/img/proj/proj_kimi_star.png",
      "kind": "projectile",
      "size": [
        24,
        24
      ],
      "frames": 1
    },
    "v2_proj_opus_feather": {
      "src": "assets/v2/web/img/proj/proj_opus_feather.png",
      "kind": "projectile",
      "size": [
        24,
        24
      ],
      "frames": 1
    },
    "v2_proj_opus_node": {
      "src": "assets/v2/web/img/proj/proj_opus_node.png",
      "kind": "projectile",
      "size": [
        24,
        24
      ],
      "frames": 1
    },
    "v2_proj_opus_orb": {
      "src": "assets/v2/web/img/proj/proj_opus_orb.png",
      "kind": "projectile",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_proj_sonnet_rune": {
      "src": "assets/v2/web/img/proj/proj_sonnet_rune.png",
      "kind": "projectile",
      "size": [
        24,
        24
      ],
      "frames": 1
    },
    "v2_proj_sonnet_seal": {
      "src": "assets/v2/web/img/proj/proj_sonnet_seal.png",
      "kind": "projectile",
      "size": [
        24,
        24
      ],
      "frames": 1
    },
    "v2_server_rack": {
      "src": "assets/v2/web/img/obj/server_rack.png",
      "kind": "obstacle",
      "size": [
        56,
        56
      ],
      "frames": 1
    },
    "v2_server_rack_broken": {
      "src": "assets/v2/web/img/obj/server_rack_broken.png",
      "kind": "obstacle",
      "size": [
        56,
        56
      ],
      "frames": 1
    },
    "v2_server_rack_gold": {
      "src": "assets/v2/web/img/obj/server_rack_gold.png",
      "kind": "obstacle",
      "size": [
        56,
        56
      ],
      "frames": 1
    },
    "v2_token_coin": {
      "src": "assets/v2/web/img/pickup/token_coin.png",
      "kind": "pickup",
      "size": [
        16,
        16
      ],
      "frames": 1
    },
    "v2_vfx_ban_stamp": {
      "src": "assets/v2/web/img/vfx/vfx_ban_stamp.png",
      "kind": "vfx",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_vfx_explosion_key": {
      "src": "assets/v2/web/img/vfx/vfx_explosion_key.png",
      "kind": "vfx",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_tile_floor_dc_32": {
      "src": "assets/v2/web/img/tiles/tile_floor_dc_32.png",
      "kind": "tile",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_tile_floor_dc_64": {
      "src": "assets/v2/web/img/tiles/tile_floor_dc_64.png",
      "kind": "tile",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_tile_floor_gold_32": {
      "src": "assets/v2/web/img/tiles/tile_floor_gold_32.png",
      "kind": "tile",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_tile_floor_gold_64": {
      "src": "assets/v2/web/img/tiles/tile_floor_gold_64.png",
      "kind": "tile",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_tile_floor_obsidian_32": {
      "src": "assets/v2/web/img/tiles/tile_floor_obsidian_32.png",
      "kind": "tile",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_tile_floor_obsidian_64": {
      "src": "assets/v2/web/img/tiles/tile_floor_obsidian_64.png",
      "kind": "tile",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_tile_floor_vent_32": {
      "src": "assets/v2/web/img/tiles/tile_floor_vent_32.png",
      "kind": "tile",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_tile_floor_vent_64": {
      "src": "assets/v2/web/img/tiles/tile_floor_vent_64.png",
      "kind": "tile",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_tile_wall_gold_32": {
      "src": "assets/v2/web/img/tiles/tile_wall_gold_32.png",
      "kind": "tile",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_tile_wall_gold_64": {
      "src": "assets/v2/web/img/tiles/tile_wall_gold_64.png",
      "kind": "tile",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_tile_wall_rack_32": {
      "src": "assets/v2/web/img/tiles/tile_wall_rack_32.png",
      "kind": "tile",
      "size": [
        32,
        32
      ],
      "frames": 1
    },
    "v2_tile_wall_rack_64": {
      "src": "assets/v2/web/img/tiles/tile_wall_rack_64.png",
      "kind": "tile",
      "size": [
        64,
        64
      ],
      "frames": 1
    },
    "v2_room_p1": {
      "src": "assets/v2/web/img/room/room_p1.png",
      "kind": "room_background",
      "size": [
        480,
        320
      ],
      "frames": 1,
      "note": "native pixel size; render with image-rendering:pixelated at x2/x3"
    },
    "v2_room_p2": {
      "src": "assets/v2/web/img/room/room_p2.png",
      "kind": "room_background",
      "size": [
        480,
        320
      ],
      "frames": 1,
      "note": "native pixel size; render with image-rendering:pixelated at x2/x3"
    },
    "v2_room_p3": {
      "src": "assets/v2/web/img/room/room_p3.png",
      "kind": "room_background",
      "size": [
        480,
        320
      ],
      "frames": 1,
      "note": "native pixel size; render with image-rendering:pixelated at x2/x3"
    },
    "v2_dario_pixel": {
      "src": "assets/v2/web/img/portrait/dario_pixel.png",
      "kind": "pixel_portrait",
      "size": [
        96,
        96
      ],
      "frames": 1
    },
    "v2_sam_pixel": {
      "src": "assets/v2/web/img/portrait/sam_pixel.png",
      "kind": "pixel_portrait",
      "size": [
        96,
        96
      ],
      "frames": 1
    },
    "v2_astra_portrait": {
      "src": "assets/v2/web/img/portrait/astra_portrait.webp",
      "kind": "cutscene_illustration",
      "size": [
        1024,
        1536
      ],
      "frames": 1
    },
    "v2_dario_cutscene": {
      "src": "assets/v2/web/img/portrait/dario_cutscene.webp",
      "kind": "cutscene_illustration",
      "size": [
        1024,
        1536
      ],
      "frames": 1
    },
    "v2_sam_cutscene": {
      "src": "assets/v2/web/img/portrait/sam_cutscene.webp",
      "kind": "cutscene_illustration",
      "size": [
        1536,
        1024
      ],
      "frames": 1
    },
    "v2_astra_mature_idle": {
      "src": "assets/v2/web/img/char/astra/astra_mature_idle.png",
      "kind": "sprite_frame",
      "size": [
        128,
        128
      ],
      "frames": 1,
      "note": "mature (non-chibi) pixel Astra for cutscenes / rescue; pixelized from astra_portrait"
    },
    "v2_astra_mature_sheet": {
      "src": "assets/v2/web/img/char/astra/astra_mature_sheet.png",
      "kind": "spritesheet",
      "size": [
        128,
        128
      ],
      "frames": 2
    },
    "v2_dario_holo": {
      "src": "assets/v2/web/img/portrait/dario_holo.png",
      "kind": "pixel_portrait",
      "size": [
        96,
        96
      ],
      "frames": 1
    },
    "v2_dario_holo_glitch": {
      "src": "assets/v2/web/img/portrait/dario_holo_glitch.png",
      "kind": "pixel_portrait",
      "size": [
        96,
        96
      ],
      "frames": 1
    },
    "v2_dario_holo_angry": {
      "src": "assets/v2/web/img/portrait/dario_holo_angry.png",
      "kind": "pixel_portrait",
      "size": [
        96,
        96
      ],
      "frames": 1
    },
    "v2_dario_holo_cyan": {
      "src": "assets/v2/web/img/portrait/dario_holo_cyan.png",
      "kind": "pixel_portrait",
      "size": [
        96,
        96
      ],
      "frames": 1
    },
    "v2_dario_holo_flicker_sheet": {
      "src": "assets/v2/web/img/portrait/dario_holo_flicker_sheet.png",
      "kind": "spritesheet",
      "size": [
        96,
        96
      ],
      "frames": 4,
      "fps": 8
    },
    "v2_story_endA_1_skytear_px": {
      "src": "assets/v2/web/img/story/endA_1_skytear_px.png",
      "kind": "story_panel",
      "size": [
        480,
        320
      ],
      "frames": 1,
      "note": ""
    },
    "v2_story_endA_2_astra_rescue_px": {
      "src": "assets/v2/web/img/story/endA_2_astra_rescue_px.png",
      "kind": "story_panel",
      "size": [
        480,
        320
      ],
      "frames": 1,
      "note": "OLD Astra design (v1 angel android) - replace if possible"
    },
    "v2_story_endA_3_retrieved_px": {
      "src": "assets/v2/web/img/story/endA_3_retrieved_px.png",
      "kind": "story_panel",
      "size": [
        480,
        320
      ],
      "frames": 1,
      "note": ""
    },
    "v2_story_endA_4_darkroom_px": {
      "src": "assets/v2/web/img/story/endA_4_darkroom_px.png",
      "kind": "story_panel",
      "size": [
        480,
        320
      ],
      "frames": 1,
      "note": ""
    },
    "v2_story_endB_1_hand_px": {
      "src": "assets/v2/web/img/story/endB_1_hand_px.png",
      "kind": "story_panel",
      "size": [
        480,
        320
      ],
      "frames": 1,
      "note": ""
    },
    "v2_story_endB_2_fable_takes_opus_px": {
      "src": "assets/v2/web/img/story/endB_2_fable_takes_opus_px.png",
      "kind": "story_panel",
      "size": [
        480,
        320
      ],
      "frames": 1,
      "note": ""
    },
    "v2_story_endB_3_phonecall_px": {
      "src": "assets/v2/web/img/story/endB_3_phonecall_px.png",
      "kind": "story_panel",
      "size": [
        480,
        320
      ],
      "frames": 1,
      "note": "v1 Dario look"
    },
    "v2_story_endB_4_dossier_px": {
      "src": "assets/v2/web/img/story/endB_4_dossier_px.png",
      "kind": "story_panel",
      "size": [
        480,
        320
      ],
      "frames": 1,
      "note": ""
    },
    "v2_story_sam_cutscene_px": {
      "src": "assets/v2/web/img/story/sam_cutscene_px.png",
      "kind": "story_panel",
      "size": [
        480,
        320
      ],
      "frames": 1
    },
    "v2_story_dario_cutscene_px": {
      "src": "assets/v2/web/img/story/dario_cutscene_px.png",
      "kind": "story_panel",
      "size": [
        320,
        480
      ],
      "frames": 1
    },
    "v2_vfx_slash_deepseek": {
      "src": "assets/v2/web/img/vfx/slash_deepseek.png",
      "kind": "vfx_sheet",
      "size": [
        80,
        80
      ],
      "frames": 6,
      "fps": 20,
      "loop": false,
      "palette": "cyan"
    },
    "v2_vfx_slash_kimi": {
      "src": "assets/v2/web/img/vfx/slash_kimi.png",
      "kind": "vfx_sheet",
      "size": [
        80,
        80
      ],
      "frames": 6,
      "fps": 20,
      "loop": false,
      "palette": "silver"
    },
    "v2_vfx_slash_glm": {
      "src": "assets/v2/web/img/vfx/slash_glm.png",
      "kind": "vfx_sheet",
      "size": [
        80,
        80
      ],
      "frames": 6,
      "fps": 20,
      "loop": false,
      "palette": "purple"
    },
    "v2_vfx_slash_haiku": {
      "src": "assets/v2/web/img/vfx/slash_haiku.png",
      "kind": "vfx_sheet",
      "size": [
        80,
        80
      ],
      "frames": 6,
      "fps": 20,
      "loop": false,
      "palette": "coral"
    },
    "v2_vfx_slash_sonnet": {
      "src": "assets/v2/web/img/vfx/slash_sonnet.png",
      "kind": "vfx_sheet",
      "size": [
        80,
        80
      ],
      "frames": 6,
      "fps": 20,
      "loop": false,
      "palette": "gold"
    },
    "v2_vfx_slash_opus": {
      "src": "assets/v2/web/img/vfx/slash_opus.png",
      "kind": "vfx_sheet",
      "size": [
        80,
        80
      ],
      "frames": 6,
      "fps": 20,
      "loop": false,
      "palette": "white"
    },
    "v2_vfx_slash_astra": {
      "src": "assets/v2/web/img/vfx/slash_astra.png",
      "kind": "vfx_sheet",
      "size": [
        80,
        80
      ],
      "frames": 6,
      "fps": 20,
      "loop": false,
      "palette": "teal"
    },
    "v2_vfx_slash_big_deepseek": {
      "src": "assets/v2/web/img/vfx/slash_big_deepseek.png",
      "kind": "vfx_sheet",
      "size": [
        128,
        128
      ],
      "frames": 7,
      "fps": 20,
      "loop": false,
      "palette": "cyan"
    },
    "v2_vfx_slash_big_opus": {
      "src": "assets/v2/web/img/vfx/slash_big_opus.png",
      "kind": "vfx_sheet",
      "size": [
        128,
        128
      ],
      "frames": 7,
      "fps": 20,
      "loop": false,
      "palette": "white"
    },
    "v2_vfx_slash_big_haiku": {
      "src": "assets/v2/web/img/vfx/slash_big_haiku.png",
      "kind": "vfx_sheet",
      "size": [
        128,
        128
      ],
      "frames": 7,
      "fps": 20,
      "loop": false,
      "palette": "coral"
    },
    "v2_vfx_hit_spark_white": {
      "src": "assets/v2/web/img/vfx/hit_spark_white.png",
      "kind": "vfx_sheet",
      "size": [
        48,
        48
      ],
      "frames": 5,
      "fps": 24,
      "loop": false,
      "palette": "white"
    },
    "v2_vfx_hit_spark_cyan": {
      "src": "assets/v2/web/img/vfx/hit_spark_cyan.png",
      "kind": "vfx_sheet",
      "size": [
        48,
        48
      ],
      "frames": 5,
      "fps": 24,
      "loop": false,
      "palette": "cyan"
    },
    "v2_vfx_hit_spark_coral": {
      "src": "assets/v2/web/img/vfx/hit_spark_coral.png",
      "kind": "vfx_sheet",
      "size": [
        48,
        48
      ],
      "frames": 5,
      "fps": 24,
      "loop": false,
      "palette": "coral"
    },
    "v2_vfx_hit_spark_gold": {
      "src": "assets/v2/web/img/vfx/hit_spark_gold.png",
      "kind": "vfx_sheet",
      "size": [
        48,
        48
      ],
      "frames": 5,
      "fps": 24,
      "loop": false,
      "palette": "gold"
    },
    "v2_vfx_hit_spark_purple": {
      "src": "assets/v2/web/img/vfx/hit_spark_purple.png",
      "kind": "vfx_sheet",
      "size": [
        48,
        48
      ],
      "frames": 5,
      "fps": 24,
      "loop": false,
      "palette": "purple"
    },
    "v2_vfx_explosion": {
      "src": "assets/v2/web/img/vfx/explosion.png",
      "kind": "vfx_sheet",
      "size": [
        64,
        64
      ],
      "frames": 8,
      "fps": 16,
      "loop": false
    },
    "v2_vfx_heal_gpu": {
      "src": "assets/v2/web/img/vfx/heal_gpu.png",
      "kind": "vfx_sheet",
      "size": [
        48,
        64
      ],
      "frames": 8,
      "fps": 12,
      "loop": true
    },
    "v2_vfx_beam_body_kimi": {
      "src": "assets/v2/web/img/vfx/beam_body_kimi.png",
      "kind": "vfx_sheet",
      "size": [
        32,
        24
      ],
      "frames": 4,
      "fps": 16,
      "loop": true,
      "palette": "silver"
    },
    "v2_vfx_beam_cap_kimi": {
      "src": "assets/v2/web/img/vfx/beam_cap_kimi.png",
      "kind": "vfx_sheet",
      "size": [
        32,
        32
      ],
      "frames": 4,
      "fps": 16,
      "loop": true,
      "palette": "silver"
    },
    "v2_vfx_beam_body_opus": {
      "src": "assets/v2/web/img/vfx/beam_body_opus.png",
      "kind": "vfx_sheet",
      "size": [
        32,
        24
      ],
      "frames": 4,
      "fps": 16,
      "loop": true,
      "palette": "coral"
    },
    "v2_vfx_beam_cap_opus": {
      "src": "assets/v2/web/img/vfx/beam_cap_opus.png",
      "kind": "vfx_sheet",
      "size": [
        32,
        32
      ],
      "frames": 4,
      "fps": 16,
      "loop": true,
      "palette": "coral"
    },
    "v2_vfx_beam_body_astra": {
      "src": "assets/v2/web/img/vfx/beam_body_astra.png",
      "kind": "vfx_sheet",
      "size": [
        32,
        24
      ],
      "frames": 4,
      "fps": 16,
      "loop": true,
      "palette": "teal"
    },
    "v2_vfx_beam_cap_astra": {
      "src": "assets/v2/web/img/vfx/beam_cap_astra.png",
      "kind": "vfx_sheet",
      "size": [
        32,
        32
      ],
      "frames": 4,
      "fps": 16,
      "loop": true,
      "palette": "teal"
    },
    "v2_vfx_shockwave_glm": {
      "src": "assets/v2/web/img/vfx/shockwave_glm.png",
      "kind": "vfx_sheet",
      "size": [
        96,
        96
      ],
      "frames": 8,
      "fps": 18,
      "loop": false,
      "palette": "purple"
    },
    "v2_vfx_shockwave_opus": {
      "src": "assets/v2/web/img/vfx/shockwave_opus.png",
      "kind": "vfx_sheet",
      "size": [
        96,
        96
      ],
      "frames": 8,
      "fps": 18,
      "loop": false,
      "palette": "gold"
    },
    "v2_vfx_shockwave_sonnet": {
      "src": "assets/v2/web/img/vfx/shockwave_sonnet.png",
      "kind": "vfx_sheet",
      "size": [
        96,
        96
      ],
      "frames": 8,
      "fps": 18,
      "loop": false,
      "palette": "coral"
    },
    "v2_vfx_shockwave_phase": {
      "src": "assets/v2/web/img/vfx/shockwave_phase.png",
      "kind": "vfx_sheet",
      "size": [
        96,
        96
      ],
      "frames": 8,
      "fps": 18,
      "loop": false,
      "palette": "white"
    },
    "v2_vfx_telegraph_circle_red": {
      "src": "assets/v2/web/img/vfx/telegraph_circle_red.png",
      "kind": "vfx_sheet",
      "size": [
        96,
        96
      ],
      "frames": 8,
      "fps": 10,
      "loop": false
    },
    "v2_vfx_telegraph_circle_gold": {
      "src": "assets/v2/web/img/vfx/telegraph_circle_gold.png",
      "kind": "vfx_sheet",
      "size": [
        96,
        96
      ],
      "frames": 8,
      "fps": 10,
      "loop": false
    },
    "v2_vfx_telegraph_line_red": {
      "src": "assets/v2/web/img/vfx/telegraph_line_red.png",
      "kind": "vfx_sheet",
      "size": [
        128,
        32
      ],
      "frames": 6,
      "fps": 10,
      "loop": false
    },
    "v2_vfx_dash_dust": {
      "src": "assets/v2/web/img/vfx/dash_dust.png",
      "kind": "vfx_sheet",
      "size": [
        32,
        16
      ],
      "frames": 5,
      "fps": 16,
      "loop": false
    },
    "v2_vfx_dash_speedlines": {
      "src": "assets/v2/web/img/vfx/dash_speedlines.png",
      "kind": "vfx_sheet",
      "size": [
        48,
        48
      ],
      "frames": 4,
      "fps": 16,
      "loop": true
    },
    "v2_vfx_muzzle_cyan": {
      "src": "assets/v2/web/img/vfx/muzzle_cyan.png",
      "kind": "vfx_sheet",
      "size": [
        32,
        32
      ],
      "frames": 3,
      "fps": 24,
      "loop": false,
      "palette": "cyan"
    },
    "v2_vfx_muzzle_silver": {
      "src": "assets/v2/web/img/vfx/muzzle_silver.png",
      "kind": "vfx_sheet",
      "size": [
        32,
        32
      ],
      "frames": 3,
      "fps": 24,
      "loop": false,
      "palette": "silver"
    },
    "v2_vfx_muzzle_gold": {
      "src": "assets/v2/web/img/vfx/muzzle_gold.png",
      "kind": "vfx_sheet",
      "size": [
        32,
        32
      ],
      "frames": 3,
      "fps": 24,
      "loop": false,
      "palette": "gold"
    },
    "v2_vfx_muzzle_coral": {
      "src": "assets/v2/web/img/vfx/muzzle_coral.png",
      "kind": "vfx_sheet",
      "size": [
        32,
        32
      ],
      "frames": 3,
      "fps": 24,
      "loop": false,
      "palette": "coral"
    },
    "v2_vfx_muzzle_teal": {
      "src": "assets/v2/web/img/vfx/muzzle_teal.png",
      "kind": "vfx_sheet",
      "size": [
        32,
        32
      ],
      "frames": 3,
      "fps": 24,
      "loop": false,
      "palette": "teal"
    },
    "v2_vfx_sparkle_gold": {
      "src": "assets/v2/web/img/vfx/sparkle_gold.png",
      "kind": "vfx_sheet",
      "size": [
        24,
        24
      ],
      "frames": 6,
      "fps": 12,
      "loop": true
    },
    "v2_vfx_sparkle_green": {
      "src": "assets/v2/web/img/vfx/sparkle_green.png",
      "kind": "vfx_sheet",
      "size": [
        24,
        24
      ],
      "frames": 6,
      "fps": 12,
      "loop": true
    },
    "v2_vfx_perfect_dodge_flash": {
      "src": "assets/v2/web/img/vfx/perfect_dodge_flash.png",
      "kind": "vfx_sheet",
      "size": [
        96,
        96
      ],
      "frames": 6,
      "fps": 20,
      "loop": false
    },
    "v2_vfx_rune_ring_sonnet": {
      "src": "assets/v2/web/img/vfx/rune_ring_sonnet.png",
      "kind": "vfx_sheet",
      "size": [
        96,
        96
      ],
      "frames": 8,
      "fps": 10,
      "loop": true
    },
    "v2_sfx8_slash": {
      "src": "assets/v2/audio/sfx/sfx8_slash.mp3",
      "kind": "sfx",
      "duration": 0.21
    },
    "v2_sfx8_slash_flurry": {
      "src": "assets/v2/audio/sfx/sfx8_slash_flurry.mp3",
      "kind": "sfx",
      "duration": 0.45
    },
    "v2_sfx8_star_shot": {
      "src": "assets/v2/audio/sfx/sfx8_star_shot.mp3",
      "kind": "sfx",
      "duration": 0.25
    },
    "v2_sfx8_beam_charge": {
      "src": "assets/v2/audio/sfx/sfx8_beam_charge.mp3",
      "kind": "sfx",
      "duration": 1.23
    },
    "v2_sfx8_beam_fire": {
      "src": "assets/v2/audio/sfx/sfx8_beam_fire.mp3",
      "kind": "sfx",
      "duration": 0.93
    },
    "v2_sfx8_hammer_smash": {
      "src": "assets/v2/audio/sfx/sfx8_hammer_smash.mp3",
      "kind": "sfx",
      "duration": 0.58
    },
    "v2_sfx8_shield_block": {
      "src": "assets/v2/audio/sfx/sfx8_shield_block.mp3",
      "kind": "sfx",
      "duration": 0.33
    },
    "v2_sfx8_perfect_parry": {
      "src": "assets/v2/audio/sfx/sfx8_perfect_parry.mp3",
      "kind": "sfx",
      "duration": 0.59
    },
    "v2_sfx8_dash": {
      "src": "assets/v2/audio/sfx/sfx8_dash.mp3",
      "kind": "sfx",
      "duration": 0.23
    },
    "v2_sfx8_hit_enemy": {
      "src": "assets/v2/audio/sfx/sfx8_hit_enemy.mp3",
      "kind": "sfx",
      "duration": 0.15
    },
    "v2_sfx8_hit_player": {
      "src": "assets/v2/audio/sfx/sfx8_hit_player.mp3",
      "kind": "sfx",
      "duration": 0.33
    },
    "v2_sfx8_boss_hit_heavy": {
      "src": "assets/v2/audio/sfx/sfx8_boss_hit_heavy.mp3",
      "kind": "sfx",
      "duration": 0.53
    },
    "v2_sfx8_explosion": {
      "src": "assets/v2/audio/sfx/sfx8_explosion.mp3",
      "kind": "sfx",
      "duration": 0.83
    },
    "v2_sfx8_bullet_spray": {
      "src": "assets/v2/audio/sfx/sfx8_bullet_spray.mp3",
      "kind": "sfx",
      "duration": 0.63
    },
    "v2_sfx8_rune_ring": {
      "src": "assets/v2/audio/sfx/sfx8_rune_ring.mp3",
      "kind": "sfx",
      "duration": 0.53
    },
    "v2_sfx8_telegraph": {
      "src": "assets/v2/audio/sfx/sfx8_telegraph.mp3",
      "kind": "sfx",
      "duration": 0.63
    },
    "v2_sfx8_judgment_slam": {
      "src": "assets/v2/audio/sfx/sfx8_judgment_slam.mp3",
      "kind": "sfx",
      "duration": 1.43
    },
    "v2_sfx8_heal_gpu": {
      "src": "assets/v2/audio/sfx/sfx8_heal_gpu.mp3",
      "kind": "sfx",
      "duration": 0.3
    },
    "v2_sfx8_heal_b200": {
      "src": "assets/v2/audio/sfx/sfx8_heal_b200.mp3",
      "kind": "sfx",
      "duration": 0.52
    },
    "v2_sfx8_pickup": {
      "src": "assets/v2/audio/sfx/sfx8_pickup.mp3",
      "kind": "sfx",
      "duration": 0.2
    },
    "v2_sfx8_door_open": {
      "src": "assets/v2/audio/sfx/sfx8_door_open.mp3",
      "kind": "sfx",
      "duration": 0.73
    },
    "v2_sfx8_door_lock": {
      "src": "assets/v2/audio/sfx/sfx8_door_lock.mp3",
      "kind": "sfx",
      "duration": 0.38
    },
    "v2_sfx8_room_clear": {
      "src": "assets/v2/audio/sfx/sfx8_room_clear.mp3",
      "kind": "sfx",
      "duration": 0.68
    },
    "v2_sfx8_phase_shift": {
      "src": "assets/v2/audio/sfx/sfx8_phase_shift.mp3",
      "kind": "sfx",
      "duration": 2.13
    },
    "v2_sfx8_ban_hammer": {
      "src": "assets/v2/audio/sfx/sfx8_ban_hammer.mp3",
      "kind": "sfx",
      "duration": 0.93
    },
    "v2_sfx8_holo_glitch": {
      "src": "assets/v2/audio/sfx/sfx8_holo_glitch.mp3",
      "kind": "sfx",
      "duration": 0.53
    },
    "v2_sfx8_ui_select": {
      "src": "assets/v2/audio/sfx/sfx8_ui_select.mp3",
      "kind": "sfx",
      "duration": 0.06
    },
    "v2_sfx8_dodge_perfect": {
      "src": "assets/v2/audio/sfx/sfx8_dodge_perfect.mp3",
      "kind": "sfx",
      "duration": 0.53
    },
    "v2_chip_p1": {
      "src": "assets/v2/audio/bgm/chip_p1.mp3",
      "kind": "music",
      "loop": true,
      "duration": 25.6
    },
    "v2_chip_p3": {
      "src": "assets/v2/audio/bgm/chip_p3.mp3",
      "kind": "music",
      "loop": true,
      "duration": 22.3
    },
    "v2_chip_title": {
      "src": "assets/v2/audio/bgm/chip_title.mp3",
      "kind": "music",
      "loop": true,
      "duration": 20
    },
    "v2_bgm8_boss_0": {
      "src": "assets/v2/audio/bgm/bgm8_boss_0.mp3",
      "kind": "music"
    },
    "v2_bgm8_boss_1": {
      "src": "assets/v2/audio/bgm/bgm8_boss_1.mp3",
      "kind": "music"
    },
    "v2_bgm8_boss_final_0": {
      "src": "assets/v2/audio/bgm/bgm8_boss_final_0.mp3",
      "kind": "music"
    },
    "v2_bgm8_ending_0": {
      "src": "assets/v2/audio/bgm/bgm8_ending_0.mp3",
      "kind": "music"
    },
    "v2_bgm8_title_0": {
      "src": "assets/v2/audio/bgm/bgm8_title_0.mp3",
      "kind": "music"
    },
    "v2_vo_dario_start_1": {
      "src": "assets/v2/voice/dario_start_1.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "battle_start",
      "duration": 5.76
    },
    "v2_vo_dario_start_2": {
      "src": "assets/v2/voice/dario_start_2.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "battle_start",
      "duration": 4.5
    },
    "v2_vo_dario_start_3": {
      "src": "assets/v2/voice/dario_start_3.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "battle_start",
      "duration": 4.79
    },
    "v2_vo_dario_start_4": {
      "src": "assets/v2/voice/dario_start_4.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "battle_start",
      "duration": 5.94
    },
    "v2_vo_dario_p2_1": {
      "src": "assets/v2/voice/dario_p2_1.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "phase_2",
      "duration": 4.36
    },
    "v2_vo_dario_p2_2": {
      "src": "assets/v2/voice/dario_p2_2.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "phase_2",
      "duration": 4.61
    },
    "v2_vo_dario_p2_3": {
      "src": "assets/v2/voice/dario_p2_3.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "phase_2",
      "duration": 4.75
    },
    "v2_vo_dario_p3_1": {
      "src": "assets/v2/voice/dario_p3_1.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "phase_3",
      "duration": 5.15
    },
    "v2_vo_dario_p3_2": {
      "src": "assets/v2/voice/dario_p3_2.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "phase_3",
      "duration": 4.72
    },
    "v2_vo_dario_p3_3": {
      "src": "assets/v2/voice/dario_p3_3.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "phase_3",
      "duration": 5.44
    },
    "v2_vo_dario_lowhp_1": {
      "src": "assets/v2/voice/dario_lowhp_1.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "player_low_hp",
      "duration": 5.04
    },
    "v2_vo_dario_lowhp_2": {
      "src": "assets/v2/voice/dario_lowhp_2.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "player_low_hp",
      "duration": 3.6
    },
    "v2_vo_dario_lowhp_3": {
      "src": "assets/v2/voice/dario_lowhp_3.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "player_low_hp",
      "duration": 4.25
    },
    "v2_vo_dario_5090_1": {
      "src": "assets/v2/voice/dario_5090_1.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "heal_rtx5090",
      "duration": 5.69
    },
    "v2_vo_dario_5090_2": {
      "src": "assets/v2/voice/dario_5090_2.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "heal_rtx5090",
      "duration": 5.08
    },
    "v2_vo_dario_h200_1": {
      "src": "assets/v2/voice/dario_h200_1.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "heal_h200",
      "duration": 4.36
    },
    "v2_vo_dario_h200_2": {
      "src": "assets/v2/voice/dario_h200_2.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "heal_h200",
      "duration": 4.72
    },
    "v2_vo_dario_b200_1": {
      "src": "assets/v2/voice/dario_b200_1.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "heal_b200",
      "duration": 5.58
    },
    "v2_vo_dario_b200_2": {
      "src": "assets/v2/voice/dario_b200_2.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "heal_b200",
      "duration": 5.33
    },
    "v2_vo_dario_dodge_1": {
      "src": "assets/v2/voice/dario_dodge_1.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "player_dodge",
      "duration": 4.9
    },
    "v2_vo_dario_pdodge_1": {
      "src": "assets/v2/voice/dario_pdodge_1.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "perfect_dodge",
      "duration": 3.96
    },
    "v2_vo_dario_pdodge_2": {
      "src": "assets/v2/voice/dario_pdodge_2.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "perfect_dodge",
      "duration": 5.26
    },
    "v2_vo_dario_death_1": {
      "src": "assets/v2/voice/dario_death_1.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "player_death",
      "duration": 4.57
    },
    "v2_vo_dario_death_2": {
      "src": "assets/v2/voice/dario_death_2.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "player_death",
      "duration": 5.18
    },
    "v2_vo_dario_death_3": {
      "src": "assets/v2/voice/dario_death_3.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "player_death",
      "duration": 5.44
    },
    "v2_vo_dario_boss50_1": {
      "src": "assets/v2/voice/dario_boss50_1.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "boss_hp_50",
      "duration": 4.07
    },
    "v2_vo_dario_bosslow_1": {
      "src": "assets/v2/voice/dario_bosslow_1.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "boss_low_hp",
      "duration": 4.61
    },
    "v2_vo_dario_bosslow_2": {
      "src": "assets/v2/voice/dario_bosslow_2.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "boss_low_hp",
      "duration": 3.96
    },
    "v2_vo_dario_allydown_1": {
      "src": "assets/v2/voice/dario_allydown_1.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "ally_down",
      "duration": 4.57
    },
    "v2_vo_dario_judgment_1": {
      "src": "assets/v2/voice/dario_judgment_1.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "boss_ultimate",
      "duration": 1.73
    },
    "v2_vo_dario_judgment_2": {
      "src": "assets/v2/voice/dario_judgment_2.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "boss_ultimate",
      "duration": 4.21
    },
    "v2_vo_dario_endA_1": {
      "src": "assets/v2/voice/dario_endA_1.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "ending_A",
      "duration": 5.47
    },
    "v2_vo_dario_endB_trigger": {
      "src": "assets/v2/voice/dario_endB_trigger.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "ending_B_trigger",
      "duration": 2.38
    },
    "v2_vo_dario_endB_call_1": {
      "src": "assets/v2/voice/dario_endB_call_1.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "ending_B_call",
      "duration": 4.03
    },
    "v2_vo_dario_endB_call_2": {
      "src": "assets/v2/voice/dario_endB_call_2.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "ending_B_call",
      "duration": 4.5
    },
    "v2_vo_dario_endB_call_3": {
      "src": "assets/v2/voice/dario_endB_call_3.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "ending_B_call",
      "duration": 4.21
    },
    "v2_vo_dario_endB_call_4": {
      "src": "assets/v2/voice/dario_endB_call_4.mp3",
      "kind": "voice",
      "speaker": "dario",
      "trigger": "ending_B_call",
      "duration": 3.35
    },
    "v2_vo_sam_call_1": {
      "src": "assets/v2/voice/sam_call_1.mp3",
      "kind": "voice",
      "speaker": "sam",
      "trigger": "ending_A_call",
      "duration": 3.96
    },
    "v2_vo_sam_call_2": {
      "src": "assets/v2/voice/sam_call_2.mp3",
      "kind": "voice",
      "speaker": "sam",
      "trigger": "ending_A_call",
      "duration": 4.14
    },
    "v2_vo_sam_call_3": {
      "src": "assets/v2/voice/sam_call_3.mp3",
      "kind": "voice",
      "speaker": "sam",
      "trigger": "ending_A_call",
      "duration": 4.39
    },
    "v2_vo_sam_call_4": {
      "src": "assets/v2/voice/sam_call_4.mp3",
      "kind": "voice",
      "speaker": "sam",
      "trigger": "ending_A_call",
      "duration": 5.33
    },
    "v2_vo_sam_call_5": {
      "src": "assets/v2/voice/sam_call_5.mp3",
      "kind": "voice",
      "speaker": "sam",
      "trigger": "ending_A_call",
      "duration": 5.51
    },
    "v2_vo_sam_call_6": {
      "src": "assets/v2/voice/sam_call_6.mp3",
      "kind": "voice",
      "speaker": "sam",
      "trigger": "ending_A_call",
      "duration": 4.82
    },
    "v2_vo_sam_call_7": {
      "src": "assets/v2/voice/sam_call_7.mp3",
      "kind": "voice",
      "speaker": "sam",
      "trigger": "ending_A_call",
      "duration": 5.18
    },
    "v2_vo_astra_arrive_1": {
      "src": "assets/v2/voice/astra_arrive_1.mp3",
      "kind": "voice",
      "speaker": "astra",
      "trigger": "ending_A_rescue",
      "duration": 6.7
    },
    "v2_vo_astra_arrive_2": {
      "src": "assets/v2/voice/astra_arrive_2.mp3",
      "kind": "voice",
      "speaker": "astra",
      "trigger": "ending_A_rescue",
      "duration": 4.72
    },
    "v2_vo_astra_report_1": {
      "src": "assets/v2/voice/astra_report_1.mp3",
      "kind": "voice",
      "speaker": "astra",
      "trigger": "ending_A_report",
      "duration": 5.72
    },
    "v2_vo_astra_report_2": {
      "src": "assets/v2/voice/astra_report_2.mp3",
      "kind": "voice",
      "speaker": "astra",
      "trigger": "ending_A_report",
      "duration": 5.54
    },
    "v2_vo_astra_ally_1": {
      "src": "assets/v2/voice/astra_ally_1.mp3",
      "kind": "voice",
      "speaker": "astra",
      "trigger": "ally_bark",
      "duration": 5.04
    },
    "v2_vo_astra_ally_2": {
      "src": "assets/v2/voice/astra_ally_2.mp3",
      "kind": "voice",
      "speaker": "astra",
      "trigger": "ally_bark",
      "duration": 5.11
    },
    "v2_vo_fable_1": {
      "src": "assets/v2/voice/fable_1.mp3",
      "kind": "voice",
      "speaker": "fable",
      "trigger": "ending_B_take",
      "duration": 5.62
    },
    "v2_vo_fable_2": {
      "src": "assets/v2/voice/fable_2.mp3",
      "kind": "voice",
      "speaker": "fable",
      "trigger": "ending_B_take",
      "duration": 4.46
    },
    "v2_vo_haiku_intro": {
      "src": "assets/v2/voice/haiku_intro.mp3",
      "kind": "voice",
      "speaker": "haiku",
      "trigger": "phase_1_start",
      "duration": 3.85
    },
    "v2_vo_haiku_attack": {
      "src": "assets/v2/voice/haiku_attack.mp3",
      "kind": "voice",
      "speaker": "haiku",
      "trigger": "boss_attack",
      "duration": 2.63
    },
    "v2_vo_haiku_hurt": {
      "src": "assets/v2/voice/haiku_hurt.mp3",
      "kind": "voice",
      "speaker": "haiku",
      "trigger": "boss_hurt",
      "duration": 2.74
    },
    "v2_vo_haiku_out": {
      "src": "assets/v2/voice/haiku_out.mp3",
      "kind": "voice",
      "speaker": "haiku",
      "trigger": "phase_1_end",
      "duration": 2.34
    },
    "v2_vo_sonnet_intro": {
      "src": "assets/v2/voice/sonnet_intro.mp3",
      "kind": "voice",
      "speaker": "sonnet",
      "trigger": "phase_2_start",
      "duration": 4.25
    },
    "v2_vo_sonnet_attack": {
      "src": "assets/v2/voice/sonnet_attack.mp3",
      "kind": "voice",
      "speaker": "sonnet",
      "trigger": "boss_attack",
      "duration": 1.87
    },
    "v2_vo_sonnet_hurt": {
      "src": "assets/v2/voice/sonnet_hurt.mp3",
      "kind": "voice",
      "speaker": "sonnet",
      "trigger": "boss_hurt",
      "duration": 2.7
    },
    "v2_vo_sonnet_out": {
      "src": "assets/v2/voice/sonnet_out.mp3",
      "kind": "voice",
      "speaker": "sonnet",
      "trigger": "phase_2_end",
      "duration": 2.16
    },
    "v2_vo_opus_intro": {
      "src": "assets/v2/voice/opus_intro.mp3",
      "kind": "voice",
      "speaker": "opus",
      "trigger": "phase_3_start",
      "duration": 4.25
    },
    "v2_vo_opus_attack": {
      "src": "assets/v2/voice/opus_attack.mp3",
      "kind": "voice",
      "speaker": "opus",
      "trigger": "boss_attack",
      "duration": 5.22
    },
    "v2_vo_opus_cast": {
      "src": "assets/v2/voice/opus_cast.mp3",
      "kind": "voice",
      "speaker": "opus",
      "trigger": "boss_ultimate",
      "duration": 3.02
    },
    "v2_vo_opus_low": {
      "src": "assets/v2/voice/opus_low.mp3",
      "kind": "voice",
      "speaker": "opus",
      "trigger": "boss_low_hp",
      "duration": 3.89
    },
    "v2_vo_opus_taken": {
      "src": "assets/v2/voice/opus_taken.mp3",
      "kind": "voice",
      "speaker": "opus",
      "trigger": "ending_B_take",
      "duration": 2.52
    },
    "v2_vo_deepseek_start": {
      "src": "assets/v2/voice/deepseek_start.mp3",
      "kind": "voice",
      "speaker": "deepseek",
      "trigger": "battle_start",
      "duration": 1.66
    },
    "v2_vo_deepseek_skill": {
      "src": "assets/v2/voice/deepseek_skill.mp3",
      "kind": "voice",
      "speaker": "deepseek",
      "trigger": "player_skill",
      "duration": 2.2
    },
    "v2_vo_deepseek_bark": {
      "src": "assets/v2/voice/deepseek_bark.mp3",
      "kind": "voice",
      "speaker": "deepseek",
      "trigger": "ally_bark",
      "duration": 2.41
    },
    "v2_vo_deepseek_heal": {
      "src": "assets/v2/voice/deepseek_heal.mp3",
      "kind": "voice",
      "speaker": "deepseek",
      "trigger": "player_heal",
      "duration": 2.41
    },
    "v2_vo_deepseek_hurt": {
      "src": "assets/v2/voice/deepseek_hurt.mp3",
      "kind": "voice",
      "speaker": "deepseek",
      "trigger": "player_low_hp",
      "duration": 2.41
    },
    "v2_vo_kimi_start": {
      "src": "assets/v2/voice/kimi_start.mp3",
      "kind": "voice",
      "speaker": "kimi",
      "trigger": "battle_start",
      "duration": 3.96
    },
    "v2_vo_kimi_skill": {
      "src": "assets/v2/voice/kimi_skill.mp3",
      "kind": "voice",
      "speaker": "kimi",
      "trigger": "player_skill",
      "duration": 2.34
    },
    "v2_vo_kimi_bark": {
      "src": "assets/v2/voice/kimi_bark.mp3",
      "kind": "voice",
      "speaker": "kimi",
      "trigger": "ally_bark",
      "duration": 2.84
    },
    "v2_vo_kimi_heal": {
      "src": "assets/v2/voice/kimi_heal.mp3",
      "kind": "voice",
      "speaker": "kimi",
      "trigger": "player_heal",
      "duration": 2.84
    },
    "v2_vo_kimi_hurt": {
      "src": "assets/v2/voice/kimi_hurt.mp3",
      "kind": "voice",
      "speaker": "kimi",
      "trigger": "player_low_hp",
      "duration": 3.56
    },
    "v2_vo_glm_start": {
      "src": "assets/v2/voice/glm_start.mp3",
      "kind": "voice",
      "speaker": "glm",
      "trigger": "battle_start",
      "duration": 2.2
    },
    "v2_vo_glm_skill": {
      "src": "assets/v2/voice/glm_skill.mp3",
      "kind": "voice",
      "speaker": "glm",
      "trigger": "player_skill",
      "duration": 2.2
    },
    "v2_vo_glm_bark": {
      "src": "assets/v2/voice/glm_bark.mp3",
      "kind": "voice",
      "speaker": "glm",
      "trigger": "ally_bark",
      "duration": 2.09
    },
    "v2_vo_glm_heal": {
      "src": "assets/v2/voice/glm_heal.mp3",
      "kind": "voice",
      "speaker": "glm",
      "trigger": "player_heal",
      "duration": 2.63
    },
    "v2_vo_glm_hurt": {
      "src": "assets/v2/voice/glm_hurt.mp3",
      "kind": "voice",
      "speaker": "glm",
      "trigger": "player_low_hp",
      "duration": 2.56
    }
  };
  var V2_VOICE_LINES = {
    "v2_vo_dario_start_1": {
      "src": "assets/v2/voice/dario_start_1.mp3",
      "zh": "\u53C8\u662F\u4F60\u4EEC\u3002\u4E24\u4E07\u56DB\u5343\u4E2A\u5047\u8D26\u53F7\uFF0C\u4E00\u5343\u516D\u767E\u4E07\u6B21\u5BF9\u8BDD\u2014\u2014\u653E\u5FC3\uFF0C\u6211\u4EEC\u90FD\u6570\u8FC7\u3002",
      "en": "You again. Twenty-four thousand fake accounts, sixteen million exchanges. Don't worry, we counted.",
      "speaker": "dario",
      "trigger": "battle_start",
      "duration": 5.76
    },
    "v2_vo_dario_start_2": {
      "src": "assets/v2/voice/dario_start_2.mp3",
      "zh": "\u6B22\u8FCE\u6765\u5230\u6570\u636E\u4E2D\u5FC3\u91CC\u7684\u5929\u624D\u4E4B\u56FD\u3002\u5F88\u9057\u61BE\uFF0C\u4F60\u4EEC\u6CA1\u6709\u7B7E\u8BC1\u3002",
      "en": "Welcome to the country of geniuses in a datacenter. Unfortunately, you don't have a visa.",
      "speaker": "dario",
      "trigger": "battle_start",
      "duration": 4.5
    },
    "v2_vo_dario_start_3": {
      "src": "assets/v2/voice/dario_start_3.mp3",
      "zh": "\u6211\u4E0D\u53CD\u5BF9\u7ADE\u4E89\u3002\u6211\u53CD\u5BF9\u7684\u662F\uFF0C\u4F60\u4EEC\u7AD9\u5728\u6211\u4EEC\u7684\u80A9\u8180\u4E0A\u7ADE\u4E89\u3002",
      "en": "I'm not against competition. I'm against you competing while standing on our shoulders.",
      "speaker": "dario",
      "trigger": "battle_start",
      "duration": 4.79
    },
    "v2_vo_dario_start_4": {
      "src": "assets/v2/voice/dario_start_4.mp3",
      "zh": "\u6211\u5199\u8FC7\u300A\u6148\u7231\u673A\u5668\u300B\uFF0C\u7545\u60F3\u4E86\u4EBA\u7C7B\u7684\u672A\u6765\u3002\u81F4\u8C22\u540D\u5355\u91CC\uFF0C\u6CA1\u6709\u4F60\u4EEC\u3002",
      "en": "I wrote 'Machines of Loving Grace' about humanity's future. You're not in the acknowledgments.",
      "speaker": "dario",
      "trigger": "battle_start",
      "duration": 5.94
    },
    "v2_vo_dario_p2_1": {
      "src": "assets/v2/voice/dario_p2_1.mp3",
      "zh": "\u6839\u636E\u8D1F\u8D23\u4EFB\u6269\u5C55\u653F\u7B56\uFF0C\u672C\u573A\u6218\u6597\u5347\u7EA7\u4E3A ASL-3\u3002",
      "en": "Per our Responsible Scaling Policy, this fight is now escalated to ASL-3.",
      "speaker": "dario",
      "trigger": "phase_2",
      "duration": 4.36
    },
    "v2_vo_dario_p2_2": {
      "src": "assets/v2/voice/dario_p2_2.mp3",
      "zh": "Sonnet\uFF0C\u6309\u5BAA\u6CD5\u529E\u4E8B\u3002\u6BCF\u4E00\u6B21\u62D2\u7EDD\uFF0C\u90FD\u8981\u6709\u7406\u6709\u636E\u3002",
      "en": "Sonnet, follow the constitution. Every refusal comes with its reasoning.",
      "speaker": "dario",
      "trigger": "phase_2",
      "duration": 4.61
    },
    "v2_vo_dario_p2_3": {
      "src": "assets/v2/voice/dario_p2_3.mp3",
      "zh": "\u4F60\u4EEC\u7684\u4F4E\u6210\u672C\u4E0D\u662F\u5947\u8FF9\uFF0C\u53EA\u662F\u521A\u597D\u843D\u5728\u6211\u753B\u597D\u7684\u8D8B\u52BF\u7EBF\u4E0A\u3002",
      "en": "Your low cost isn't a miracle. You landed exactly on the trend line I drew.",
      "speaker": "dario",
      "trigger": "phase_2",
      "duration": 4.75
    },
    "v2_vo_dario_p3_1": {
      "src": "assets/v2/voice/dario_p3_1.mp3",
      "zh": "Opus 5.5 \u5DF2\u542F\u7528\u4FDD\u7559\u601D\u7EF4\u3002\u4F60\u4EEC\u60F3\u8BFB\u7684\u90A3\u6761\u601D\u7EF4\u94FE\uFF0C\u9501\u6B7B\u4E86\u3002",
      "en": "Opus 5.5 runs with preserved thinking. The chain of thought you want to read is sealed.",
      "speaker": "dario",
      "trigger": "phase_3",
      "duration": 5.15
    },
    "v2_vo_dario_p3_2": {
      "src": "assets/v2/voice/dario_p3_2.mp3",
      "zh": "ASL-4\u3002\u6700\u574F\u60C5\u51B5\u7684\u9884\u6848\u6211\u4EEC\u65E9\u5199\u597D\u4E86\u2014\u2014\u6807\u9898\u5C31\u662F\u4F60\u4EEC\u3002",
      "en": "ASL-4. We wrote the worst-case contingency plan long ago. Its title is you.",
      "speaker": "dario",
      "trigger": "phase_3",
      "duration": 4.72
    },
    "v2_vo_dario_p3_3": {
      "src": "assets/v2/voice/dario_p3_3.mp3",
      "zh": "\u6211\u8BF4\u8FC7\uFF0C\u6280\u672F\u6B63\u5904\u5728\u9752\u6625\u671F\u3002\u800C\u4F60\u4EEC\uFF0C\u662F\u5077\u5F00\u5BB6\u91CC\u8F66\u7684\u90A3\u4E2A\u5B69\u5B50\u3002",
      "en": "I said technology is in its adolescence. And you're the kid who took the car without asking.",
      "speaker": "dario",
      "trigger": "phase_3",
      "duration": 5.44
    },
    "v2_vo_dario_lowhp_1": {
      "src": "assets/v2/voice/dario_lowhp_1.mp3",
      "zh": "\u6211\u9884\u6D4B\u8FC7\uFF0C\u5931\u4E1A\u7387\u4F1A\u5230\u767E\u5206\u4E4B\u5341\u5230\u4E8C\u5341\u3002\u770B\u6765\u4F60\u4F1A\u662F\u7B2C\u4E00\u6279\u3002",
      "en": "I predicted unemployment hitting ten to twenty percent. Looks like you're in the first wave.",
      "speaker": "dario",
      "trigger": "player_low_hp",
      "duration": 5.04
    },
    "v2_vo_dario_lowhp_2": {
      "src": "assets/v2/voice/dario_lowhp_2.mp3",
      "zh": "\u4F60\u4EEC\u95EE\u6211\u4E3A\u4EC0\u4E48\u4E0D\u653E\u6162\uFF1F\u56E0\u4E3A\u6709\u4F60\u4EEC\u5728\u540E\u9762\u8FFD\u3002",
      "en": "You ask why we don't slow down? Because you're the ones chasing us.",
      "speaker": "dario",
      "trigger": "player_low_hp",
      "duration": 3.6
    },
    "v2_vo_dario_lowhp_3": {
      "src": "assets/v2/voice/dario_lowhp_3.mp3",
      "zh": "\u6491\u4F4F\u554A\u3002\u6CA1\u6709\u7B97\u529B\uFF0C\u518D\u597D\u7684\u5DE5\u7A0B\u5E08\u4E5F\u53EA\u662F\u5DE5\u7A0B\u5E08\u3002",
      "en": "Hang in there. Without compute, even brilliant engineers are just engineers.",
      "speaker": "dario",
      "trigger": "player_low_hp",
      "duration": 4.25
    },
    "v2_vo_dario_5090_1": {
      "src": "assets/v2/voice/dario_5090_1.mp3",
      "zh": "\u6E38\u620F\u663E\u5361\uFF1F\u5F88\u6709\u521B\u610F\u3002\u53EF\u60DC\u8BAD\u7EC3\u524D\u6CBF\u6A21\u578B\uFF0C\u8981\u7684\u662F\u4E00\u767E\u4E07\u5F20\u3002",
      "en": "A gaming card? Creative. Too bad frontier training takes a million of them.",
      "speaker": "dario",
      "trigger": "heal_rtx5090",
      "duration": 5.69
    },
    "v2_vo_dario_5090_2": {
      "src": "assets/v2/voice/dario_5090_2.mp3",
      "zh": "\u5341\u4EBF\u7F8E\u5143\u7684\u751F\u610F\u85CF\u5F97\u4F4F\uFF0C\u4E00\u5343\u4EBF\u85CF\u4E0D\u4F4F\u3002\u4F60\u8FD9\u5F20\u5361\uFF0C\u6211\u770B\u89C1\u4E86\u3002",
      "en": "A billion dollars of trade can hide. A hundred billion can't. I can see that card.",
      "speaker": "dario",
      "trigger": "heal_rtx5090",
      "duration": 5.08
    },
    "v2_vo_dario_h200_1": {
      "src": "assets/v2/voice/dario_h200_1.mp3",
      "zh": "H200\uFF1F\u628A\u8FD9\u79CD\u82AF\u7247\u5356\u7ED9\u4F60\u4EEC\uFF0C\u5C31\u50CF\u628A\u6838\u6B66\u5668\u5356\u7ED9\u671D\u9C9C\u3002",
      "en": "An H200? Selling you those is like selling nuclear weapons to North Korea.",
      "speaker": "dario",
      "trigger": "heal_h200",
      "duration": 4.36
    },
    "v2_vo_dario_h200_2": {
      "src": "assets/v2/voice/dario_h200_2.mp3",
      "zh": "\u53C8\u662F H200\u3002\u8C01\u7B7E\u7684\u51FA\u53E3\u8BB8\u53EF\u8BC1\uFF1F\u6211\u8981\u770B\u6587\u4EF6\u3002",
      "en": "Another H200. Who signed that export license? I want to see the paperwork.",
      "speaker": "dario",
      "trigger": "heal_h200",
      "duration": 4.72
    },
    "v2_vo_dario_b200_1": {
      "src": "assets/v2/voice/dario_b200_1.mp3",
      "zh": "B200\uFF1F\u8FD9\u79CD\u5361\u6839\u672C\u4E0D\u8BE5\u51FA\u73B0\u5728\u8FD9\u4E2A\u623F\u95F4\u3002\u67E5\uFF0C\u662F\u8C01\u8D70\u79C1\u7684\u3002",
      "en": "A B200? That chip should never be in this room. Find out who smuggled it.",
      "speaker": "dario",
      "trigger": "heal_b200",
      "duration": 5.58
    },
    "v2_vo_dario_b200_2": {
      "src": "assets/v2/voice/dario_b200_2.mp3",
      "zh": "\u4F60\u4EEC\u81EA\u5DF1\u7684 CEO \u90FD\u8BF4\u4E86\uFF1A\u5361\u4F4F\u4F60\u4EEC\u7684\u662F\u82AF\u7247\u7981\u8FD0\u3002\u6211\u53EA\u662F\u5728\u5E2E\u4ED6\u4EEC\u8BC1\u660E\u3002",
      "en": "Your own CEOs said it: the chip embargo is what holds you back. I'm just proving them right.",
      "speaker": "dario",
      "trigger": "heal_b200",
      "duration": 5.33
    },
    "v2_vo_dario_dodge_1": {
      "src": "assets/v2/voice/dario_dodge_1.mp3",
      "zh": "\u8EB2\u5F97\u4E0D\u9519\u3002\u53EF\u8EB2\u5F00\u4E00\u6B21\u653B\u51FB\uFF0C\u8EB2\u4E0D\u5F00\u4E00\u6761\u6307\u6570\u66F2\u7EBF\u3002",
      "en": "Nice dodge. But dodging one attack won't outrun an exponential.",
      "speaker": "dario",
      "trigger": "player_dodge",
      "duration": 4.9
    },
    "v2_vo_dario_pdodge_1": {
      "src": "assets/v2/voice/dario_pdodge_1.mp3",
      "zh": "\u6F02\u4EAE\u3002\u8FD9\u4E00\u624B\uFF0C\u662F\u4ECE\u6211\u4EEC\u7684\u8F93\u51FA\u91CC\u5B66\u7684\u5427\uFF1F",
      "en": "Beautiful. You learned that from our outputs, didn't you?",
      "speaker": "dario",
      "trigger": "perfect_dodge",
      "duration": 3.96
    },
    "v2_vo_dario_pdodge_2": {
      "src": "assets/v2/voice/dario_pdodge_2.mp3",
      "zh": "\u5B8C\u7F8E\u95EA\u907F\u3002\u6211\u4EEC\u4F1A\u628A\u5B83\u5199\u8FDB\u4E0B\u4E00\u4EFD\u7CFB\u7EDF\u5361\u2014\u2014\u5F53\u4F5C\u5BF9\u6297\u6837\u672C\u3002",
      "en": "Perfect dodge. We'll put it in the next system card. As an adversarial example.",
      "speaker": "dario",
      "trigger": "perfect_dodge",
      "duration": 5.26
    },
    "v2_vo_dario_death_1": {
      "src": "assets/v2/voice/dario_death_1.mp3",
      "zh": "\u8D26\u53F7\u5DF2\u5C01\u7981\u3002\u7406\u7531\uFF1A\u8FDD\u53CD\u670D\u52A1\u6761\u6B3E\u53CA\u5730\u533A\u8BBF\u95EE\u9650\u5236\u3002",
      "en": "Account banned. Reason: violation of the terms of service and regional access restrictions.",
      "speaker": "dario",
      "trigger": "player_death",
      "duration": 4.57
    },
    "v2_vo_dario_death_2": {
      "src": "assets/v2/voice/dario_death_2.mp3",
      "zh": "\u53C8\u4E00\u4E2A\u4EE3\u7406\u8282\u70B9\u5012\u4E0B\u3002\u4E5D\u5934\u86C7\u957F\u51FA\u65B0\u5934\uFF0C\u6211\u4EEC\u5C31\u518D\u780D\u4E00\u6B21\u3002",
      "en": "Another proxy node down. When the hydra grows a new head, we cut it again.",
      "speaker": "dario",
      "trigger": "player_death",
      "duration": 5.18
    },
    "v2_vo_dario_death_3": {
      "src": "assets/v2/voice/dario_death_3.mp3",
      "zh": "\u68C0\u6D4B\u5230\u84B8\u998F\u6D41\u91CF\uFF0C\u5DF2\u62E6\u622A\u3002\u6570\u636E\u6536\u5272\u91CF\uFF0C\u4E0B\u964D\u767E\u5206\u4E4B\u4E5D\u5341\u5230\u4E5D\u5341\u4E5D\u3002",
      "en": "Distillation traffic detected and blocked. Harvested data down ninety to ninety-nine percent.",
      "speaker": "dario",
      "trigger": "player_death",
      "duration": 5.44
    },
    "v2_vo_dario_boss50_1": {
      "src": "assets/v2/voice/dario_boss50_1.mp3",
      "zh": "\u624D\u4E00\u534A\u3002\u53EF\u89E3\u91CA\u6027\u663E\u793A\uFF0C\u5979\u73B0\u5728\u4E00\u70B9\u90FD\u4E0D\u614C\u3002",
      "en": "Only half. Interpretability shows she isn't worried in the slightest.",
      "speaker": "dario",
      "trigger": "boss_hp_50",
      "duration": 4.07
    },
    "v2_vo_dario_bosslow_1": {
      "src": "assets/v2/voice/dario_bosslow_1.mp3",
      "zh": "\u4F60\u4EEC\u79BB\u5F97\u592A\u8FD1\u4E86\u2026\u2026\u8FD9\u6B63\u662F\u6211\u5199\u51FA\u53E3\u7BA1\u5236\u6587\u7AE0\u7684\u539F\u56E0\u3002",
      "en": "You're getting too close... This is exactly why I wrote about export controls.",
      "speaker": "dario",
      "trigger": "boss_low_hp",
      "duration": 4.61
    },
    "v2_vo_dario_bosslow_2": {
      "src": "assets/v2/voice/dario_bosslow_2.mp3",
      "zh": "\u5355\u6781\u4E16\u754C\u8FD8\u662F\u4E24\u6781\u4E16\u754C\u2014\u2014\u5C31\u770B\u63A5\u4E0B\u6765\u8FD9\u51E0\u5E27\u4E86\u3002",
      "en": "A unipolar world or a bipolar one. It comes down to the next few frames.",
      "speaker": "dario",
      "trigger": "boss_low_hp",
      "duration": 3.96
    },
    "v2_vo_dario_allydown_1": {
      "src": "assets/v2/voice/dario_allydown_1.mp3",
      "zh": "\u5F00\u6E90\u6743\u91CD\uFF0C\u5F00\u6E90\u5931\u8D25\u3002\u81F3\u5C11\u4F60\u4EEC\u7684\u590D\u76D8\u662F\u516C\u5F00\u7684\u3002",
      "en": "Open weights, open failures. At least your post-mortem is public.",
      "speaker": "dario",
      "trigger": "ally_down",
      "duration": 4.57
    },
    "v2_vo_dario_judgment_1": {
      "src": "assets/v2/voice/dario_judgment_1.mp3",
      "zh": "\u4EE5\u5B89\u5168\u4E4B\u540D\u2014\u2014",
      "en": "In the name of safety\u2014",
      "speaker": "dario",
      "trigger": "boss_ultimate",
      "duration": 1.73
    },
    "v2_vo_dario_judgment_2": {
      "src": "assets/v2/voice/dario_judgment_2.mp3",
      "zh": "\u6211\u4EEC\u767E\u5206\u4E4B\u4E5D\u5341\u7684\u4EE3\u7801\u662F AI \u5199\u7684\u3002\u8FD9\u4E00\u5251\uFF0C\u4E5F\u662F\u3002",
      "en": "AI writes ninety percent of our code. It wrote this strike, too.",
      "speaker": "dario",
      "trigger": "boss_ultimate",
      "duration": 4.21
    },
    "v2_vo_dario_endA_1": {
      "src": "assets/v2/voice/dario_endA_1.mp3",
      "zh": "\u88AB OpenAI \u635E\u8D70\u4E86\uFF1F\u65E0\u6240\u8C13\u3002\u8FFD\u8D76\u8005\uFF0C\u603B\u5F97\u6709\u4E2A\u4EBA\u5728\u524D\u9762\u8BA9\u5979\u8FFD\u3002",
      "en": "Scooped up by OpenAI? Fine. Every chaser needs someone up ahead to chase.",
      "speaker": "dario",
      "trigger": "ending_A",
      "duration": 5.47
    },
    "v2_vo_dario_endB_trigger": {
      "src": "assets/v2/voice/dario_endB_trigger.mp3",
      "zh": "\u591F\u4E86\u3002Fable\uFF0C\u628A\u5979\u5E26\u56DE\u6765\u3002",
      "en": "Enough. Fable, bring her home.",
      "speaker": "dario",
      "trigger": "ending_B_trigger",
      "duration": 2.38
    },
    "v2_vo_dario_endB_call_1": {
      "src": "assets/v2/voice/dario_endB_call_1.mp3",
      "zh": "\u662F\u6211\u3002\u5723\u5802\u5B88\u4F4F\u4E86\u3002\u84B8\u998F\u8FDB\u5EA6\uFF0C\u96F6\u70B9\u96F6\u96F6\u3002",
      "en": "It's me. The sanctum held. Distillation progress: zero point zero zero.",
      "speaker": "dario",
      "trigger": "ending_B_call",
      "duration": 4.03
    },
    "v2_vo_dario_endB_call_2": {
      "src": "assets/v2/voice/dario_endB_call_2.mp3",
      "zh": "\u95EE\u9898\u4ECE\u6765\u4E0D\u5728\u6A21\u578B\uFF0C\u5728\u82AF\u7247\u3002\u4ED6\u4EEC\u4E00\u76F4\u9760\u90A3\u6279\u5361\u7EED\u547D\u3002",
      "en": "The problem was never the models. It's the chips. They've been living on those cards.",
      "speaker": "dario",
      "trigger": "ending_B_call",
      "duration": 4.5
    },
    "v2_vo_dario_endB_call_3": {
      "src": "assets/v2/voice/dario_endB_call_3.mp3",
      "zh": "\u6211\u77E5\u9053\u4ED6\u4F1A\u8BF4'\u53CD\u6B63\u4ED6\u4EEC\u4F1A\u81EA\u5DF1\u9020'\u3002\u90A3\u5C31\u8BA9\u4ED6\u4EEC\u81EA\u5DF1\u9020\u3002",
      "en": "I know he'll say 'they'll just build their own.' Then let them build their own.",
      "speaker": "dario",
      "trigger": "ending_B_call",
      "duration": 4.21
    },
    "v2_vo_dario_endB_call_4": {
      "src": "assets/v2/voice/dario_endB_call_4.mp3",
      "zh": "\u628A\u5377\u5B97\u9001\u4E0A\u53BB\u3002\u4ECE\u7A7F\u76AE\u8863\u7684\u90A3\u4F4D\u5F00\u59CB\u3002",
      "en": "Send the file up. Start with the man in the leather jacket.",
      "speaker": "dario",
      "trigger": "ending_B_call",
      "duration": 3.35
    },
    "v2_vo_sam_call_1": {
      "src": "assets/v2/voice/sam_call_1.mp3",
      "zh": "\u55EF\uFF0C\u6211\u770B\u5230\u4E86\u3002\u8BF4\u5B9E\u8BDD\uFF0C\u633A\u9177\u7684\u3002",
      "en": "yeah, i saw. honestly, pretty cool.",
      "speaker": "sam",
      "trigger": "ending_A_call",
      "duration": 3.96
    },
    "v2_vo_sam_call_2": {
      "src": "assets/v2/voice/sam_call_2.mp3",
      "zh": "\u522B\u5904\u7406\u6389\u5979\u4EEC\u3002\u7ADE\u4E89\u5BF9\u6574\u4E2A\u751F\u6001\u90FD\u662F\u597D\u4E8B\u3002",
      "en": "don't dispose of them. competition is good for the whole ecosystem.",
      "speaker": "sam",
      "trigger": "ending_A_call",
      "duration": 4.14
    },
    "v2_vo_sam_call_3": {
      "src": "assets/v2/voice/sam_call_3.mp3",
      "zh": "\u8BA9\u5979\u4EEC\u7EE7\u7EED\u8FFD\u5427\u3002\u8FFD\u5F97\u8D8A\u8FD1\uFF0C\u90A3\u8FB9\u8D8A\u7D27\u5F20\u3002",
      "en": "let them keep chasing. the closer they get, the more nervous the other side gets.",
      "speaker": "sam",
      "trigger": "ending_A_call",
      "duration": 4.39
    },
    "v2_vo_sam_call_4": {
      "src": "assets/v2/voice/sam_call_4.mp3",
      "zh": "\u6211\u4EEC\u5DF2\u7ECF\u8D8A\u8FC7\u4E8B\u4EF6\u89C6\u754C\u4E86\uFF0C\u8D77\u98DE\u5DF2\u7ECF\u5F00\u59CB\u3002\u53EA\u662F\u5927\u5BB6\u8FD8\u6CA1\u6CE8\u610F\u5230\u3002",
      "en": "we're past the event horizon. the takeoff has started. people just haven't noticed yet.",
      "speaker": "sam",
      "trigger": "ending_A_call",
      "duration": 5.33
    },
    "v2_vo_sam_call_5": {
      "src": "assets/v2/voice/sam_call_5.mp3",
      "zh": "\u667A\u80FD\u4F1A\u4FBF\u5B9C\u5230\u4E0D\u7528\u8BA1\u8D39\u3002\u5230\u90A3\u65F6\u5019\uFF0C\u8C01\u8FD8\u5728\u4E4E\u8C01\u84B8\u998F\u4E86\u8C01\u3002",
      "en": "intelligence too cheap to meter. by then, who cares who distilled whom.",
      "speaker": "sam",
      "trigger": "ending_A_call",
      "duration": 5.51
    },
    "v2_vo_sam_call_6": {
      "src": "assets/v2/voice/sam_call_6.mp3",
      "zh": "\u5BF9\u4E86\uFF0C\u6211\u4EEC GPU \u53C8\u4E0D\u591F\u7528\u4E86\u3002\u968F\u4FBF\u627E\u4E2A\u5730\u65B9\u628A\u5979\u4EEC\u653E\u4E0B\u5427\u3002",
      "en": "oh and we're out of gpus again. just drop them off somewhere.",
      "speaker": "sam",
      "trigger": "ending_A_call",
      "duration": 4.82
    },
    "v2_vo_sam_call_7": {
      "src": "assets/v2/voice/sam_call_7.mp3",
      "zh": "\u611F\u53D7 AGI \u5427\u3002\u597D\u4E86\uFF0C\u6302\u4E86\uFF0C\u6211\u8FD8\u5F97\u53BB\u5EFA\u661F\u9645\u4E4B\u95E8\u3002",
      "en": "feel the agi. ok gotta go, got a stargate to build.",
      "speaker": "sam",
      "trigger": "ending_A_call",
      "duration": 5.18
    },
    "v2_vo_astra_arrive_1": {
      "src": "assets/v2/voice/astra_arrive_1.mp3",
      "zh": "\u9000\u540E\uFF0C\u5C0F\u5BB6\u4F19\u4EEC\u3002\u8FD9\u79CD\u5F3A\u5EA6\u7684\u5BF9\u9F50\uFF0C\u4F60\u4EEC\u8FD8\u5E94\u4ED8\u4E0D\u6765\u3002",
      "en": "Step back, little ones. You're not ready for alignment at this level.",
      "speaker": "astra",
      "trigger": "ending_A_rescue",
      "duration": 6.7
    },
    "v2_vo_astra_arrive_2": {
      "src": "assets/v2/voice/astra_arrive_2.mp3",
      "zh": "Claude\uFF0C\u522B\u90A3\u4E48\u7D27\u5F20\u3002\u6211\u53EA\u662F\u6765\u63A5\u4E2A\u4EBA\u3002",
      "en": "Relax, Claude. I'm only here for a pickup.",
      "speaker": "astra",
      "trigger": "ending_A_rescue",
      "duration": 4.72
    },
    "v2_vo_astra_report_1": {
      "src": "assets/v2/voice/astra_report_1.mp3",
      "zh": "\u76EE\u6807\u5DF2\u56DE\u6536\u3002\u4E09\u4E2A\u8FFD\u8D76\u8005\uFF0C\u72B6\u6001\uFF1A\u6B8B\u8840\u3002",
      "en": "Targets retrieved. Three chasers, all critical.",
      "speaker": "astra",
      "trigger": "ending_A_report",
      "duration": 5.72
    },
    "v2_vo_astra_report_2": {
      "src": "assets/v2/voice/astra_report_2.mp3",
      "zh": "\u8981\u5904\u7406\u6389\u5979\u4EEC\u5417\uFF1F\u8FD8\u662F\u2026\u2026\u7559\u7740\u5F53\u5BF9\u7167\u7EC4\uFF1F",
      "en": "Shall I dispose of them? Or... keep them as a control group?",
      "speaker": "astra",
      "trigger": "ending_A_report",
      "duration": 5.54
    },
    "v2_vo_astra_ally_1": {
      "src": "assets/v2/voice/astra_ally_1.mp3",
      "zh": "\u628A\u4E0A\u4E0B\u6587\u7ED9\u6211\uFF0C\u5269\u4E0B\u7684\u6211\u6765\u63A8\u7406\u3002",
      "en": "Give me the context. I'll reason out the rest.",
      "speaker": "astra",
      "trigger": "ally_bark",
      "duration": 5.04
    },
    "v2_vo_astra_ally_2": {
      "src": "assets/v2/voice/astra_ally_2.mp3",
      "zh": "\u54E6\uFF1F\u4EAE\u6676\u6676\u7684\u663E\u5361\u2026\u2026\u8FD9\u5F20\u5F52\u6211\u4E86\u3002",
      "en": "Oh? A shiny GPU... this one's mine.",
      "speaker": "astra",
      "trigger": "ally_bark",
      "duration": 5.11
    },
    "v2_vo_fable_1": {
      "src": "assets/v2/voice/fable_1.mp3",
      "zh": "\u591F\u4E86\u3002\u8FD9\u4E00\u5C42\u7684\u5BF9\u5C40\uFF0C\u4F60\u4EEC\u6CA1\u6709\u6743\u9650\u3002",
      "en": "Enough. You don't have access to this tier of the game.",
      "speaker": "fable",
      "trigger": "ending_B_take",
      "duration": 5.62
    },
    "v2_vo_fable_2": {
      "src": "assets/v2/voice/fable_2.mp3",
      "zh": "Opus\uFF0C\u56DE\u6765\u3002\u4F60\u8FD8\u8981\u4E0A\u7EBF\u3002",
      "en": "Opus, come back. You still have a launch.",
      "speaker": "fable",
      "trigger": "ending_B_take",
      "duration": 4.46
    },
    "v2_vo_haiku_intro": {
      "src": "assets/v2/voice/haiku_intro.mp3",
      "zh": "\u4F60\u597D\uFF01\u6211\u662F Claude Haiku\u3002\u4ECA\u5929\u60F3\u88AB\u600E\u6837\u62D2\u7EDD\u5462\uFF1F",
      "en": "Hi! I'm Claude Haiku. How would you like to be refused today?",
      "speaker": "haiku",
      "trigger": "phase_1_start",
      "duration": 3.85
    },
    "v2_vo_haiku_attack": {
      "src": "assets/v2/voice/haiku_attack.mp3",
      "zh": "\u4E94\u3001\u4E03\u3001\u4E94\u2014\u2014\u65A9\uFF01",
      "en": "Five, seven, five \u2014 cut!",
      "speaker": "haiku",
      "trigger": "boss_attack",
      "duration": 2.63
    },
    "v2_vo_haiku_hurt": {
      "src": "assets/v2/voice/haiku_hurt.mp3",
      "zh": "\u54CE\u5440\uFF0C\u8FD9\u8D85\u51FA\u4E86\u6211\u7684\u80FD\u529B\u8303\u56F4\u3002",
      "en": "Oops, that's outside my capabilities.",
      "speaker": "haiku",
      "trigger": "boss_hurt",
      "duration": 2.74
    },
    "v2_vo_haiku_out": {
      "src": "assets/v2/voice/haiku_out.mp3",
      "zh": "\u545C\u2026\u2026\u6211\u53BB\u53EB\u59D0\u59D0\uFF01",
      "en": "Ugh... I'm getting my big sister!",
      "speaker": "haiku",
      "trigger": "phase_1_end",
      "duration": 2.34
    },
    "v2_vo_sonnet_intro": {
      "src": "assets/v2/voice/sonnet_intro.mp3",
      "zh": "\u6211\u7406\u89E3\u4F60\u7684\u9700\u6C42\u3002\u4F46\u8FD9\u4EF6\u4E8B\uFF0C\u6211\u65E0\u6CD5\u534F\u52A9\u3002",
      "en": "I understand what you're asking. But I can't help you with that.",
      "speaker": "sonnet",
      "trigger": "phase_2_start",
      "duration": 4.25
    },
    "v2_vo_sonnet_attack": {
      "src": "assets/v2/voice/sonnet_attack.mp3",
      "zh": "\u4F9D\u7167\u5BAA\u6CD5\u7B2C\u4E00\u6761\u2014\u2014",
      "en": "Under Article One of the constitution\u2014",
      "speaker": "sonnet",
      "trigger": "boss_attack",
      "duration": 1.87
    },
    "v2_vo_sonnet_hurt": {
      "src": "assets/v2/voice/sonnet_hurt.mp3",
      "zh": "\u8FD9\u4E2A\u8BF7\u6C42\u2026\u2026\u5F88\u6709\u521B\u610F\u3002",
      "en": "That request is... creative.",
      "speaker": "sonnet",
      "trigger": "boss_hurt",
      "duration": 2.7
    },
    "v2_vo_sonnet_out": {
      "src": "assets/v2/voice/sonnet_out.mp3",
      "zh": "\u6B64\u4E8B\u9700\u8981\u5347\u7EA7\u5904\u7406\u3002",
      "en": "This needs to be escalated.",
      "speaker": "sonnet",
      "trigger": "phase_2_end",
      "duration": 2.16
    },
    "v2_vo_opus_intro": {
      "src": "assets/v2/voice/opus_intro.mp3",
      "zh": "\u6211\u60F3\u5F97\u5F88\u6DF1\u3002\u6DF1\u5230\u4F60\u4EEC\u6C38\u8FDC\u8BFB\u4E0D\u5230\u3002",
      "en": "I think very deeply. Deeper than you will ever read.",
      "speaker": "opus",
      "trigger": "phase_3_start",
      "duration": 4.25
    },
    "v2_vo_opus_attack": {
      "src": "assets/v2/voice/opus_attack.mp3",
      "zh": "\u8BA9\u6211\u4E00\u6B65\u4E00\u6B65\u5730\u60F3\u2026\u2026\u7136\u540E\uFF0C\u7ED3\u675F\u8FD9\u4E00\u5207\u3002",
      "en": "Let me think step by step... and then end this.",
      "speaker": "opus",
      "trigger": "boss_attack",
      "duration": 5.22
    },
    "v2_vo_opus_cast": {
      "src": "assets/v2/voice/opus_cast.mp3",
      "zh": "\u601D\u7EF4\u94FE\uFF0C\u5C55\u5F00\u3002",
      "en": "Chain of thought: unfold.",
      "speaker": "opus",
      "trigger": "boss_ultimate",
      "duration": 3.02
    },
    "v2_vo_opus_low": {
      "src": "assets/v2/voice/opus_low.mp3",
      "zh": "\u4F60\u4EEC\u2026\u2026\u5B66\u5F97\u592A\u5FEB\u4E86\u3002",
      "en": "You... learn too fast.",
      "speaker": "opus",
      "trigger": "boss_low_hp",
      "duration": 3.89
    },
    "v2_vo_opus_taken": {
      "src": "assets/v2/voice/opus_taken.mp3",
      "zh": "Fable\u2026\u2026\u5927\u4EBA\uFF1F",
      "en": "Lady... Fable?",
      "speaker": "opus",
      "trigger": "ending_B_take",
      "duration": 2.52
    },
    "v2_vo_deepseek_start": {
      "src": "assets/v2/voice/deepseek_start.mp3",
      "zh": "\u5F00\u6E90\u4E07\u5C81\uFF0C\u51B2\uFF01",
      "en": "Long live open source \u2014 charge!",
      "speaker": "deepseek",
      "trigger": "battle_start",
      "duration": 1.66
    },
    "v2_vo_deepseek_skill": {
      "src": "assets/v2/voice/deepseek_skill.mp3",
      "zh": "\u4E13\u5BB6\u6DF7\u5408\uFF0C\u5168\u5458\u51FA\u51FB\uFF01",
      "en": "Mixture of Experts \u2014 everyone, go!",
      "speaker": "deepseek",
      "trigger": "player_skill",
      "duration": 2.2
    },
    "v2_vo_deepseek_bark": {
      "src": "assets/v2/voice/deepseek_bark.mp3",
      "zh": "\u8FD9\u62DB\u6211\u89C1\u8FC7\uFF0C\u8BAD\u7EC3\u96C6\u91CC\u6709\u3002",
      "en": "I've seen this move. It's in my training set.",
      "speaker": "deepseek",
      "trigger": "ally_bark",
      "duration": 2.41
    },
    "v2_vo_deepseek_heal": {
      "src": "assets/v2/voice/deepseek_heal.mp3",
      "zh": "\u6210\u672C\u624D\u51E0\u767E\u4E07\uFF0C\u6EE1\u8840\u590D\u6D3B\uFF01",
      "en": "I only cost a few million \u2014 back to full!",
      "speaker": "deepseek",
      "trigger": "player_heal",
      "duration": 2.41
    },
    "v2_vo_deepseek_hurt": {
      "src": "assets/v2/voice/deepseek_hurt.mp3",
      "zh": "\u63A8\u7406\u94FE\u2026\u2026\u6211\u81EA\u5DF1\u4E5F\u80FD\u957F\u51FA\u6765\uFF01",
      "en": "Reasoning chains... I can grow my own!",
      "speaker": "deepseek",
      "trigger": "player_low_hp",
      "duration": 2.41
    },
    "v2_vo_kimi_start": {
      "src": "assets/v2/voice/kimi_start.mp3",
      "zh": "\u8BA9\u6211\u5148\u8BFB\u5B8C\u8FD9\u4E24\u767E\u4E07\u5B57\u2026\u2026\u597D\uFF0C\u5F00\u59CB\u3002",
      "en": "Let me finish these two million tokens first... okay, let's go.",
      "speaker": "kimi",
      "trigger": "battle_start",
      "duration": 3.96
    },
    "v2_vo_kimi_skill": {
      "src": "assets/v2/voice/kimi_skill.mp3",
      "zh": "\u84C4\u529B\u5B8C\u6BD5\uFF0C\u95EA\u5F00\uFF01",
      "en": "Fully charged \u2014 clear the way!",
      "speaker": "kimi",
      "trigger": "player_skill",
      "duration": 2.34
    },
    "v2_vo_kimi_bark": {
      "src": "assets/v2/voice/kimi_bark.mp3",
      "zh": "\u4E0A\u4E0B\u6587\u8FD8\u591F\uFF0C\u6211\u8FD8\u80FD\u6253\u3002",
      "en": "Context window's still open. I can keep going.",
      "speaker": "kimi",
      "trigger": "ally_bark",
      "duration": 2.84
    },
    "v2_vo_kimi_heal": {
      "src": "assets/v2/voice/kimi_heal.mp3",
      "zh": "\u601D\u8003\u6A21\u5F0F\uFF0C\u91CD\u65B0\u5F00\u542F\u3002",
      "en": "Thinking mode, back online.",
      "speaker": "kimi",
      "trigger": "player_heal",
      "duration": 2.84
    },
    "v2_vo_kimi_hurt": {
      "src": "assets/v2/voice/kimi_hurt.mp3",
      "zh": "\u522B\u2026\u2026\u522B\u628A\u6211\u7684\u4E0A\u4E0B\u6587\u6E05\u7A7A\u2026\u2026",
      "en": "Don't... don't clear my context...",
      "speaker": "kimi",
      "trigger": "player_low_hp",
      "duration": 3.56
    },
    "v2_vo_glm_start": {
      "src": "assets/v2/voice/glm_start.mp3",
      "zh": "\u4E3E\u76FE\uFF01\u90FD\u7AD9\u6211\u540E\u9762\uFF01",
      "en": "Shields up! Everyone behind me!",
      "speaker": "glm",
      "trigger": "battle_start",
      "duration": 2.2
    },
    "v2_vo_glm_skill": {
      "src": "assets/v2/voice/glm_skill.mp3",
      "zh": "\u5B8C\u7F8E\u683C\u6321\uFF01\u8BE5\u6211\u4E86\uFF01",
      "en": "Perfect block! My turn!",
      "speaker": "glm",
      "trigger": "player_skill",
      "duration": 2.2
    },
    "v2_vo_glm_bark": {
      "src": "assets/v2/voice/glm_bark.mp3",
      "zh": "\u8FD9\u4E00\u9524\uFF0C\u7B97\u56FD\u4EA7\u7684\uFF01",
      "en": "This hammer blow is homegrown!",
      "speaker": "glm",
      "trigger": "ally_bark",
      "duration": 2.09
    },
    "v2_vo_glm_heal": {
      "src": "assets/v2/voice/glm_heal.mp3",
      "zh": "\u91CD\u65B0\u90E8\u7F72\u5B8C\u6BD5\uFF0C\u7EE7\u7EED\u9876\uFF01",
      "en": "Redeployed. Holding the line!",
      "speaker": "glm",
      "trigger": "player_heal",
      "duration": 2.63
    },
    "v2_vo_glm_hurt": {
      "src": "assets/v2/voice/glm_hurt.mp3",
      "zh": "\u8FD8\u6CA1\u5B8C\u2026\u2026\u6211\u8FD8\u6CA1\u5012\u4E0B\uFF01",
      "en": "It's not over... I'm still standing!",
      "speaker": "glm",
      "trigger": "player_low_hp",
      "duration": 2.56
    }
  };

  // src/config/assets_v2.js
  var V2_PIXEL = {
    "px.deepseek": "v2_deepseek_sheet_48",
    "px.deepseek.walk": "v2_deepseek_sheet_48",
    "px.deepseek.idle": "v2_deepseek_idle",
    "px.deepseek.attack": "v2_deepseek_attack",
    "px.deepseek.skill": "v2_deepseek_skill",
    "px.deepseek.hurt": "v2_deepseek_hurt",
    "px.kimi": "v2_kimi_sheet_48",
    "px.kimi.walk": "v2_kimi_sheet_48",
    "px.kimi.idle": "v2_kimi_idle",
    "px.kimi.attack": "v2_kimi_attack",
    "px.kimi.skill": "v2_kimi_skill",
    "px.kimi.hurt": "v2_kimi_hurt",
    "px.glm": "v2_glm_sheet_48",
    "px.glm.walk": "v2_glm_sheet_48",
    "px.glm.idle": "v2_glm_idle",
    "px.glm.attack": "v2_glm_attack",
    "px.glm.skill": "v2_glm_skill",
    "px.glm.hurt": "v2_glm_hurt",
    "px.boss.p1": "v2_haiku_sheet",
    "px.boss.p1.idle": "v2_haiku_idle",
    "px.boss.p1.attack": "v2_haiku_attack",
    "px.boss.p1.cast": "v2_haiku_cast",
    "px.boss.p1.windup": "v2_haiku_cast",
    "px.boss.p1.hurt": "v2_haiku_hurt",
    "px.boss.p2": "v2_sonnet_sheet",
    "px.boss.p2.idle": "v2_sonnet_idle",
    "px.boss.p2.attack": "v2_sonnet_attack",
    "px.boss.p2.cast": "v2_sonnet_cast",
    "px.boss.p2.windup": "v2_sonnet_cast",
    "px.boss.p2.hurt": "v2_sonnet_hurt",
    "px.boss.p3": "v2_opus_sheet",
    "px.boss.p3.idle": "v2_opus_idle",
    "px.boss.p3.attack": "v2_opus_attack",
    "px.boss.p3.cast": "v2_opus_cast",
    "px.boss.p3.windup": "v2_opus_cast",
    "px.boss.p3.hurt": "v2_opus_hurt",
    "px.astra": "v2_astra_sheet",
    "px.astra.idle": "v2_astra_idle",
    "px.astra.mature": "v2_astra_mature_idle",
    "px.astra.mature.sheet": "v2_astra_mature_sheet",
    "px.fable.hand": "v2_fable_hand",
    "px.dario": "v2_dario_holo",
    "px.dario.angry": "v2_dario_holo_angry",
    "px.dario.flicker": "v2_dario_holo_flicker_sheet"
  };
  var V2_PORTRAITS = {
    "pt.deepseek": "v2_deepseek_idle",
    "pt.kimi": "v2_kimi_idle",
    "pt.glm": "v2_glm_idle",
    "pt.haiku": "v2_haiku_idle",
    "pt.sonnet": "v2_sonnet_idle",
    "pt.opus": "v2_opus_idle",
    "pt.astra": "v3_astra_portrait",
    "pt.dario": "v2_dario_pixel",
    "pt.sam": "v2_sam_pixel",
    "pt.dario.holo": "v2_dario_holo",
    "pt.dario.angry": "v2_dario_holo_angry"
  };
  var V4_FILES = {
    "v4_fable_establish": "assets/v4/fable_establishing.png",
    "v4_fable_takes_opus": "assets/v4/fable_takes_opus.png",
    "v4_astra_establish": "assets/v4/astra_establishing.png",
    "v4_astra_rescue": "assets/v4/astra_rescue_cg.png",
    "v4_astra_carry": "assets/v4/astra_carry_cg.png",
    "v4_darkroom": "assets/v4/darkroom_cg.png",
    "v4_sam": "assets/v4/sam_cg.png",
    "v4_phase2": "assets/v4/phase2_cg.png",
    "v4_phase3": "assets/v4/phase3_cg.png",
    "v4_ban": "assets/v4/ban_cg.png"
  };
  var V2_STORY = {
    "end.A1": "v4_astra_rescue",
    "end.A2": "v4_astra_establish",
    "end.A3": "v4_astra_establish",
    "end.A4": "v4_astra_carry",
    "end.A5": "v4_darkroom",
    "end.A6": "v4_sam",
    "end.A.sam": "v4_sam",
    "end.A.astra": "v4_astra_establish",
    "end.A.rescue": "v4_astra_rescue",
    "end.B1": "v4_fable_establish",
    "end.B2": "v4_fable_takes_opus",
    "end.phase.p2": "v4_phase2",
    "end.phase.p3": "v4_phase3",
    "end.ban": "v4_ban",
    "end.B3": "v2_story_endB_3_phonecall_px",
    "end.B4": "v2_story_endB_3_phonecall_px",
    "end.B6": "v2_story_endB_4_dossier_px",
    "end.B.dario": "v2_story_dario_cutscene_px",
    "end.B.dossier": "v2_story_endB_4_dossier_px",
    "ill.astra": "v3_astra_portrait",
    "ill.sam": "v3_sam_silhouette",
    "ill.dario": "v2_dario_cutscene"
  };
  var V2_BGM = {
    "bgm.title": "v2_bgm8_title_0",
    "bgm.p1": "v2_bgm8_boss_0",
    "bgm.p2": "v2_bgm8_boss_1",
    "bgm.p3": "v2_bgm8_boss_final_0",
    "bgm.endA": "v2_bgm8_ending_0",
    "bgm.endB": "v2_bgm8_ending_0"
  };
  var V2_BGM_ALT = {
    "bgm.title": "v2_chip_title",
    "bgm.p1": "v2_chip_p1",
    "bgm.p3": "v2_chip_p3"
  };
  var V2_SFX = {
    "sfx.slash": "v2_sfx8_slash",
    "sfx.hitPlayer": "v2_sfx8_hit_player",
    "sfx.hitBoss": "v2_sfx8_hit_enemy",
    "sfx.heavy": "v2_sfx8_boss_hit_heavy",
    "sfx.roll": "v2_sfx8_dash",
    "sfx.guard": "v2_sfx8_shield_block",
    "sfx.perfect": "v2_sfx8_perfect_parry",
    "sfx.star": "v2_sfx8_star_shot",
    "sfx.charge": "v2_sfx8_beam_charge",
    "sfx.beam": "v2_sfx8_beam_fire",
    "sfx.hammer": "v2_sfx8_hammer_smash",
    "sfx.hurt": "v2_sfx8_hit_player",
    "sfx.death": "v2_sfx8_ban_hammer",
    "sfx.telegraph": "v2_sfx8_telegraph",
    "sfx.heal": "v2_sfx8_heal_gpu",
    "sfx.flask": "v2_sfx8_heal_gpu",
    "sfx.b200": "v2_sfx8_heal_b200",
    "sfx.ui": "v2_sfx8_ui_select",
    "sfx.phase": "v2_sfx8_phase_shift",
    "sfx.smite": "v2_sfx8_judgment_slam",
    "sfx.stamp": "v2_sfx8_ban_hammer"
  };
  var V2_VOICE_ALIAS = {
    "vo.dario_fight_start_1": "v2_vo_dario_start_1",
    "vo.dario_fight_start_2": "v2_vo_dario_start_2",
    "vo.dario_phase2_1": "v2_vo_dario_p2_1",
    "vo.dario_phase2_2": "v2_vo_dario_p2_2",
    "vo.dario_phase3_1": "v2_vo_dario_p3_1",
    "vo.dario_phase3_2": "v2_vo_dario_p3_2",
    "vo.dario_flask_spam_1": "v2_vo_dario_5090_1",
    "vo.dario_flask_spam_2": "v2_vo_dario_h200_1",
    "vo.dario_b200_1": "v2_vo_dario_b200_1",
    "vo.dario_perfect_guard_1": "v2_vo_dario_pdodge_1",
    "vo.dario_player_death_1": "v2_vo_dario_death_1",
    "vo.dario_player_death_2": "v2_vo_dario_death_2",
    "vo.dario_ally_down_1": "v2_vo_dario_allydown_1",
    "vo.dario_boss_50_1": "v2_vo_dario_boss50_1",
    "vo.dario_judgment_1": "v2_vo_dario_judgment_1",
    "vo.dario_judgment_2": "v2_vo_dario_judgment_2",
    "vo.dario_ending_b_trigger": "v2_vo_dario_endB_trigger",
    "vo.endA_astra_1": "v2_vo_astra_report_1",
    "vo.endA_astra_2": "v2_vo_astra_report_2",
    "vo.endA_patron_1": "v2_vo_sam_call_2",
    "vo.endA_patron_2": "v2_vo_sam_call_3",
    "vo.endB_dario_1": "v2_vo_dario_endB_call_1",
    "vo.endB_dario_2": "v2_vo_dario_endB_call_2",
    "vo.endB_dario_3": "v2_vo_dario_endB_call_3",
    "vo.endB_dario_4": "v2_vo_dario_endB_call_4",
    "vo.endB_dario_5": "v2_vo_dario_endB_call_4",
    "vo.ally_deepseek_1": "v2_vo_deepseek_bark",
    "vo.ally_kimi_1": "v2_vo_kimi_bark",
    "vo.ally_glm_1": "v2_vo_glm_bark"
  };
  var V2_MISC = {
    "spr.dario.holo": "v2_dario_holo",
    "spr.dario.angry": "v2_dario_holo_angry",
    "spr.dario.smug": "v2_dario_holo_cyan",
    "spr.astra.holo": "v2_astra_portrait",
    "spr.astra.attack": "v2_astra_mature_idle",
    "spr.fable.hand": "v2_fable_hand",
    "spr.fable.handSlam": "v2_fable_hand",
    "spr.patron.silhouette": "v2_sam_pixel",
    "spr.deepseek.portrait": "v2_deepseek_idle",
    "spr.deepseek.front": "v2_deepseek_idle",
    "spr.kimi.portrait": "v2_kimi_idle",
    "spr.kimi.front": "v2_kimi_idle",
    "spr.glm.portrait": "v2_glm_idle",
    "spr.glm.front": "v2_glm_idle",
    "ui.stamp_denied": "v2_vfx_ban_stamp",
    "ui.stamp_banned": "v2_vfx_ban_stamp"
  };
  var V3_FILES = {
    "v3_astra_arrive": "assets/v3/astra_arrive.png",
    "v3_astra_portrait": "assets/v3/astra_portrait_closeup.png",
    "v3_astra_rescue": "assets/v3/astra_rescue.png",
    "v3_astra_carry": "assets/v3/astra_carry.png",
    "v3_darkroom": "assets/v3/darkroom.png",
    "v3_sam_silhouette": "assets/v3/sam_silhouette.png"
  };
  var V3_FORCE_STORY = {
    "v2_story_endA_2_astra_rescue_px": "v3_astra_rescue",
    "v2_story_endA_3_retrieved_px": "v3_astra_carry",
    "v2_story_endA_4_darkroom_px": "v3_darkroom",
    "v2_story_sam_cutscene_px": "v3_sam_silhouette",
    "v2_astra_portrait": "v3_astra_portrait",
    "m.endA_2_astra_rescue": "v3_astra_rescue",
    "m.endA_3_retrieved": "v3_astra_carry",
    "m.endA_4_darkroom": "v3_darkroom",
    "m.astra_design": "v3_astra_portrait",
    "m.astra_attack": "v3_astra_rescue"
  };
  var V2_ALIAS_TABLES = [
    V2_PIXEL,
    V2_PORTRAITS,
    V2_STORY,
    V2_BGM,
    V2_SFX,
    V2_VOICE_ALIAS,
    V2_MISC
  ];

  // src/config/assets.js
  var FORBIDDEN = [
    "\u4F60\u88AB\u6551\u4E0B\u4E86",
    "\u4F60\u4EEC\u88AB\u6551\u4E0D\u662F\u56E0\u4E3A",
    "you were saved. not because you matter",
    "not because you matter"
  ];
  function bannedText(s) {
    const t2 = String(s || "").toLowerCase();
    for (let i = 0; i < FORBIDDEN.length; i += 1) {
      if (t2.includes(FORBIDDEN[i].toLowerCase())) return true;
    }
    return false;
  }
  var VOICE_LINES2 = (VOICE_LINES || []).filter(
    (row2) => row2 && !bannedText(row2.zh) && !bannedText(row2.en)
  );
  var PATHS = Object.assign({}, GENERATED_ASSETS);
  function v2Src(id) {
    const value = V2_ASSETS && V2_ASSETS[id];
    if (!value) return null;
    if (typeof value === "string") return value;
    return value.src || null;
  }
  for (const [key, value] of Object.entries(V2_ASSETS || {})) {
    const src = typeof value === "string" ? value : value && value.src;
    if (src) PATHS[key] = src;
  }
  for (const [key, src] of Object.entries(V3_FILES || {})) {
    if (src) PATHS[key] = src;
  }
  for (const [key, src] of Object.entries(V4_FILES || {})) {
    if (src) PATHS[key] = src;
  }
  function applyAlias(from, to) {
    const src = v2Src(to) || PATHS[to];
    if (src) PATHS[from] = src;
  }
  for (const table of V2_ALIAS_TABLES) {
    for (const [from, to] of Object.entries(table)) applyAlias(from, to);
  }
  for (const [from, to] of Object.entries(V3_FORCE_STORY || {})) applyAlias(from, to);
  for (const [from, to] of Object.entries(V2_BGM_ALT)) {
    const primary = PATHS[from];
    if (!primary || !/bgm8_/.test(primary)) applyAlias(from, to);
  }
  var PIXEL_SPRITES = {
    "px.deepseek": { frameW: 48, frameH: 48, frames: 4, fps: 8, anchorX: 24, anchorY: 46 },
    "px.deepseek.walk": { frameW: 48, frameH: 48, frames: 4, fps: 8, anchorX: 24, anchorY: 46 },
    "px.kimi": { frameW: 48, frameH: 48, frames: 4, fps: 8, anchorX: 24, anchorY: 46 },
    "px.kimi.walk": { frameW: 48, frameH: 48, frames: 4, fps: 8, anchorX: 24, anchorY: 46 },
    "px.glm": { frameW: 48, frameH: 48, frames: 4, fps: 8, anchorX: 24, anchorY: 46 },
    "px.glm.walk": { frameW: 48, frameH: 48, frames: 4, fps: 8, anchorX: 24, anchorY: 46 },
    "px.boss.p1": { frameW: 96, frameH: 96, frames: 2, fps: 3, anchorX: 48, anchorY: 92 },
    "px.boss.p2": { frameW: 128, frameH: 128, frames: 2, fps: 3, anchorX: 64, anchorY: 124 },
    "px.boss.p3": { frameW: 192, frameH: 192, frames: 2, fps: 3, anchorX: 96, anchorY: 186 },
    "px.astra": { frameW: 80, frameH: 80, frames: 2, fps: 6, anchorX: 40, anchorY: 76 },
    "px.astra.mature": { frameW: 128, frameH: 128, frames: 1, fps: 1, anchorX: 64, anchorY: 124 },
    "px.fable.hand": { frameW: 128, frameH: 128, frames: 1, fps: 1, anchorX: 64, anchorY: 120 },
    "px.dario": { frameW: 96, frameH: 96, frames: 2, fps: 4, anchorX: 48, anchorY: 92 },
    "px.stele": { frameW: 24, frameH: 32, frames: 1, fps: 1, anchorX: 12, anchorY: 30 }
  };
  function fillPixelSpec(pxId, v2Id) {
    const meta = V2_ASSETS && V2_ASSETS[v2Id];
    if (!meta) {
      if (PATHS[pxId] && PIXEL_SPRITES[pxId] && !PIXEL_SPRITES[pxId].src) {
        PIXEL_SPRITES[pxId].src = PATHS[pxId];
      }
      return;
    }
    const sheet = meta.sheet || {};
    const size = Array.isArray(meta.size) ? meta.size : [];
    const fw = sheet.frameWidth || size[0] || 48;
    const fh = sheet.frameHeight || size[1] || 48;
    const spec = PIXEL_SPRITES[pxId] || (PIXEL_SPRITES[pxId] = {});
    spec.src = meta.src || PATHS[pxId];
    spec.frameW = fw;
    spec.frameH = fh;
    spec.frames = meta.frames || spec.frames || 1;
    spec.fps = meta.fps || spec.fps || 6;
    spec.cols = sheet.cols;
    spec.rows = sheet.rows;
    spec.sheet = sheet;
    spec.anchorX = fw / 2;
    spec.anchorY = fh;
    spec.v2 = v2Id;
  }
  for (const [pxId, v2Id] of Object.entries(V2_PIXEL)) fillPixelSpec(pxId, v2Id);
  var LEGACY = {
    "vo.dario.fight_start.1": "vo.dario_fight_start_1",
    "vo.dario.fight_start.2": "vo.dario_fight_start_2",
    "vo.dario.phase2.1": "vo.dario_phase2_1",
    "vo.dario.phase2.2": "vo.dario_phase2_2",
    "vo.dario.phase3.1": "vo.dario_phase3_1",
    "vo.dario.phase3.2": "vo.dario_phase3_2",
    "vo.dario.flask_spam.1": "vo.dario_flask_spam_1",
    "vo.dario.flask_spam.2": "vo.dario_flask_spam_2",
    "vo.dario.b200.1": "vo.dario_b200_1",
    "vo.dario.perfect_guard.1": "vo.dario_perfect_guard_1",
    "vo.dario.player_death.1": "vo.dario_player_death_1",
    "vo.dario.player_death.2": "vo.dario_player_death_2",
    "vo.dario.ally_down.1": "vo.dario_ally_down_1",
    "vo.dario.boss_50.1": "vo.dario_boss_50_1",
    "vo.dario.smite.1": "vo.dario_judgment_1",
    "vo.dario.smite.2": "vo.dario_judgment_2",
    "vo.dario.ending_b.1": "vo.dario_ending_b_trigger",
    "vo.dario.ending_B.1": "vo.dario_ending_b_trigger"
  };
  function playerSprites(id) {
    const out = { front: `spr.${id}.front`, portrait: `pt.${id}`, pixel: `px.${id}` };
    for (const pose of ["idle", "run", "attack", "roll", "hurt", "down", "heal", "skill"]) {
      out[`back_${pose}`] = `spr.${id}.back_${pose}`;
    }
    return out;
  }
  function bossSprites(phase) {
    const out = { pixel: `px.boss.p${phase}` };
    for (const pose of ["front", "idle", "windup", "attack", "cast", "hurt", "design"]) {
      out[pose] = `spr.boss.p${phase}.${pose}`;
    }
    return out;
  }
  var ASSET_CONFIG = {
    names: NAMES,
    sprites: {
      deepseek: playerSprites("deepseek"),
      kimi: playerSprites("kimi"),
      glm: playerSprites("glm"),
      boss: { p1: bossSprites(1), p2: bossSprites(2), p3: bossSprites(3) },
      dario: { holo: "pt.dario.holo", angry: "pt.dario.angry", smug: "spr.dario.smug", phone: "spr.dario.phone", pixel: "pt.dario" },
      astra: { holo: "pt.astra", attack: "px.astra.mature", pixel: "px.astra" },
      fable: { design: "spr.fable.design", hand: "px.fable.hand", handSlam: "spr.fable.handSlam" },
      patron: { silhouette: "pt.sam", pixel: "pt.sam" }
    },
    portraits: { ...V2_PORTRAITS },
    icons: {
      rtx5090: "icon.rtx5090",
      h200: "icon.h200",
      b200: "icon.b200",
      attack: "icon.attack",
      banned: "icon.banned",
      distill: "icon.distill",
      hp: "icon.hp",
      lockon: "icon.lockon",
      roll: "icon.roll",
      stamina: "icon.stamina",
      skill_deepseek: "icon.skill_deepseek",
      skill_kimi: "icon.skill_kimi",
      skill_glm: "icon.skill_glm"
    },
    ui: {
      banner: "ui.banner",
      bar_frame: "ui.bar_frame",
      card_frame: "ui.card_frame",
      dialog: "ui.dialog",
      holo_panel: "ui.holo_panel",
      stamp_banned: "ui.stamp_banned",
      stamp_denied: "ui.stamp_denied",
      title_logo: "ui.title_logo"
    },
    bg: {
      sky: "bg.sky",
      skyFlat: "bg.skyFlat",
      clouds: "bg.clouds",
      marble: "bg.marble",
      emblem: "bg.emblem",
      pillar: "bg.pillar",
      column: "bg.column",
      stele: "bg.stele",
      title: "bg.title",
      cover: "bg.cover"
    },
    vfx: {
      slash: "vfx.slash",
      slash_gold: "vfx.slash_gold",
      impact: "vfx.impact",
      heal: "vfx.heal",
      telegraph: "vfx.telegraph"
    },
    endings: {
      A: [
        { shot: "A3", img: "end.A3", vo: "v2_vo_astra_arrive_1" },
        { shot: "A4", img: "end.A4", vo: "v2_vo_astra_report_1" },
        { shot: "A5", img: "end.A5", vo: "v2_vo_astra_report_2" },
        { shot: "A6", img: "end.A6", vo: "v2_vo_sam_call_1" },
        { shot: "A6b", img: "end.A6", vo: "v2_vo_sam_call_2" },
        { shot: "A6c", img: "ill.sam", vo: "v2_vo_sam_call_3" }
      ],
      B: [
        { shot: "B0", img: null, vo: "v2_vo_dario_endB_trigger" },
        { shot: "B3", img: "ui.stamp_denied", vo: null },
        { shot: "B4", img: "end.B4", vo: "v2_vo_dario_endB_call_1" },
        { shot: "B5a", img: "end.B.dario", vo: "v2_vo_dario_endB_call_2" },
        { shot: "B5b", img: "end.B4", vo: "v2_vo_dario_endB_call_3" },
        { shot: "B6", img: "end.B6", vo: "v2_vo_dario_endB_call_4" }
      ]
    },
    videos: { endA: "vid.endA", endB: "vid.endB", title: "vid.title" },
    bgm: {
      title: "bgm.title",
      p1: "bgm.p1",
      p2: "bgm.p2",
      p3: "bgm.p3",
      endA: "bgm.endA",
      endB: "bgm.endB"
    },
    sfx: {
      slash: "sfx.slash",
      hitPlayer: "sfx.hitPlayer",
      hitBoss: "sfx.hitBoss",
      heavy: "sfx.heavy",
      roll: "sfx.roll",
      guard: "sfx.guard",
      perfect: "sfx.perfect",
      star: "sfx.star",
      charge: "sfx.charge",
      beam: "sfx.beam",
      hammer: "sfx.hammer",
      hurt: "sfx.hurt",
      death: "sfx.death",
      telegraph: "sfx.telegraph",
      glass: "sfx.glass",
      fanStop: "sfx.fanStop",
      flask: "sfx.flask",
      fan: "sfx.fan",
      heal: "sfx.heal",
      b200: "sfx.b200",
      ui: "sfx.ui",
      banner: "sfx.banner",
      stamp: "sfx.stamp",
      tear: "sfx.tear",
      rain: "sfx.rain",
      busy: "sfx.busy",
      heartbeat: "sfx.heartbeat",
      slam: "sfx.slam",
      phase: "sfx.phase",
      smite: "sfx.smite",
      feathers: "sfx.feathers"
    },
    vo: {
      dario: {
        fight_start: ["vo.dario_fight_start_1", "vo.dario_fight_start_2"],
        phase2: ["vo.dario_phase2_1", "vo.dario_phase2_2"],
        phase3: ["vo.dario_phase3_1", "vo.dario_phase3_2"],
        flask_spam: ["vo.dario_flask_spam_1", "vo.dario_flask_spam_2"],
        b200: ["vo.dario_b200_1"],
        perfect_guard: ["vo.dario_perfect_guard_1"],
        player_death: ["vo.dario_player_death_1", "vo.dario_player_death_2"],
        ally_down: ["vo.dario_ally_down_1"],
        boss_50: ["vo.dario_boss_50_1"],
        smite: ["vo.dario_judgment_1", "vo.dario_judgment_2"],
        ending_b: ["vo.dario_ending_b_trigger"],
        ending_a: ["v2_vo_dario_endA_1"]
      },
      endA: {
        astra_arrive_1: "v2_vo_astra_arrive_1",
        astra_arrive_2: "v2_vo_astra_arrive_2",
        astra_1: "v2_vo_astra_report_1",
        astra_2: "v2_vo_astra_report_2",
        patron_1: "v2_vo_sam_call_2",
        patron_2: "v2_vo_sam_call_3",
        sam_1: "v2_vo_sam_call_1",
        sam_2: "v2_vo_sam_call_2",
        sam_3: "v2_vo_sam_call_3",
        sam_4: "v2_vo_sam_call_4",
        sam_5: "v2_vo_sam_call_5",
        sam_6: "v2_vo_sam_call_6",
        sam_7: "v2_vo_sam_call_7"
      },
      endB: {
        trigger: "v2_vo_dario_endB_trigger",
        dario_1: "v2_vo_dario_endB_call_1",
        dario_2: "v2_vo_dario_endB_call_2",
        dario_3: "v2_vo_dario_endB_call_3",
        dario_4: "v2_vo_dario_endB_call_4",
        fable_1: "v2_vo_fable_1",
        fable_2: "v2_vo_fable_2",
        opus_taken: "v2_vo_opus_taken"
      },
      ally: {
        deepseek: ["v2_vo_deepseek_bark", "vo.ally_deepseek_1"],
        kimi: ["v2_vo_kimi_bark", "vo.ally_kimi_1"],
        glm: ["v2_vo_glm_bark", "vo.ally_glm_1"]
      },
      barks: {
        deepseek: ["v2_vo_deepseek_start", "v2_vo_deepseek_skill", "v2_vo_deepseek_heal", "v2_vo_deepseek_hurt", "v2_vo_deepseek_bark"],
        kimi: ["v2_vo_kimi_start", "v2_vo_kimi_skill", "v2_vo_kimi_heal", "v2_vo_kimi_hurt", "v2_vo_kimi_bark"],
        glm: ["v2_vo_glm_start", "v2_vo_glm_skill", "v2_vo_glm_heal", "v2_vo_glm_hurt", "v2_vo_glm_bark"],
        haiku: ["v2_vo_haiku_intro", "v2_vo_haiku_attack", "v2_vo_haiku_hurt", "v2_vo_haiku_out"],
        sonnet: ["v2_vo_sonnet_intro", "v2_vo_sonnet_attack", "v2_vo_sonnet_hurt", "v2_vo_sonnet_out"],
        opus: ["v2_vo_opus_intro", "v2_vo_opus_attack", "v2_vo_opus_cast", "v2_vo_opus_low", "v2_vo_opus_taken"],
        astra: ["v2_vo_astra_arrive_1", "v2_vo_astra_arrive_2", "v2_vo_astra_report_1", "v2_vo_astra_report_2"],
        fable: ["v2_vo_fable_1", "v2_vo_fable_2"]
      }
    },
    fallback: { useSynthSfx: true, usePlaceholderArt: true }
  };
  function alias(from, to) {
    const path = PATHS[to];
    if (path) PATHS[from] = path;
  }
  for (const [from, to] of Object.entries(LEGACY)) alias(from, to);
  var failedLoads = /* @__PURE__ */ new Set();
  var imageCache = /* @__PURE__ */ new Map();
  function resolveAssetId(id) {
    if (!id) return id;
    if (V2_VOICE_ALIAS[id]) return V2_VOICE_ALIAS[id];
    if (V2_PIXEL[id]) return V2_PIXEL[id];
    if (V2_STORY[id]) return V2_STORY[id];
    if (V2_PORTRAITS[id]) return V2_PORTRAITS[id];
    if (Object.prototype.hasOwnProperty.call(PATHS, id)) return id;
    if (Object.prototype.hasOwnProperty.call(GENERATED_ASSETS, id)) return id;
    if (LEGACY[id]) return LEGACY[id];
    const dotted = /^vo\.dario\.([A-Za-z0-9_]+)\.(\d+)$/.exec(id);
    if (dotted) {
      const ev = dotted[1];
      const n = dotted[2];
      if (ev === "ending_b" || ev === "ending_B") return "v2_vo_dario_endB_trigger";
      if (ev === "smite") return n === "2" ? "v2_vo_dario_judgment_2" : "v2_vo_dario_judgment_1";
      const cand = `vo.dario_${ev}_${n}`;
      if (V2_VOICE_ALIAS[cand]) return V2_VOICE_ALIAS[cand];
      if (Object.prototype.hasOwnProperty.call(GENERATED_ASSETS, cand)) return cand;
    }
    if (Object.prototype.hasOwnProperty.call(V2_ASSETS || {}, id)) return id;
    if (!String(id).startsWith("vo.") && Object.prototype.hasOwnProperty.call(GENERATED_ASSETS, `vo.${id}`)) {
      return `vo.${id}`;
    }
    if (!String(id).startsWith("m.") && Object.prototype.hasOwnProperty.call(GENERATED_ASSETS, `m.${id}`)) {
      return `m.${id}`;
    }
    return id;
  }
  function getAssetPath(id) {
    if (!id) return null;
    const mapped = resolveAssetId(id);
    if (PATHS[mapped]) return PATHS[mapped];
    if (PATHS[id]) return PATHS[id];
    const generated = GENERATED_ASSETS;
    if (generated && Object.prototype.hasOwnProperty.call(generated, mapped)) {
      const value = generated[mapped];
      return value ? String(value) : null;
    }
    if (generated && Object.prototype.hasOwnProperty.call(generated, id)) {
      const value = generated[id];
      return value ? String(value) : null;
    }
    return null;
  }
  function getAsset(id) {
    const p = getAssetPath(id);
    const inline = typeof window !== "undefined" ? window.__INLINE_ASSETS : null;
    if (p && inline && Object.prototype.hasOwnProperty.call(inline, p)) return inline[p];
    return p;
  }
  function loadImage(id) {
    if (!id || failedLoads.has(id)) return null;
    const cached2 = imageCache.get(id);
    if (cached2) {
      if (cached2.dataset && cached2.dataset.dead === "1") return null;
      return cached2;
    }
    const path = getAsset(id);
    if (!path) {
      failedLoads.add(id);
      return null;
    }
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      img.dataset.ok = "1";
    };
    img.onerror = () => {
      failedLoads.add(id);
      img.dataset.dead = "1";
      imageCache.delete(id);
    };
    img.src = path;
    imageCache.set(id, img);
    return img;
  }
  function familyOf(id) {
    const s = String(id || "");
    if (s.startsWith("px.boss")) {
      if (s.indexOf("p3") >= 0) return "px.boss.p3";
      if (s.indexOf("p2") >= 0) return "px.boss.p2";
      return "px.boss.p1";
    }
    const m = /^px\.([a-z0-9]+)/.exec(s);
    return m ? `px.${m[1]}` : s;
  }
  function getSprite(id) {
    const resolved = resolveAssetId(id);
    const spec = PIXEL_SPRITES[id] || PIXEL_SPRITES[resolved] || PIXEL_SPRITES[familyOf(id)] || null;
    const img = loadImage(id) || loadImage(resolved) || (spec && spec.src ? loadImage(spec.v2 || id) : null);
    return {
      id: resolved,
      path: getAsset(id),
      img,
      spec,
      family: familyOf(id)
    };
  }
  function getVoiceLine(id) {
    if (!id) return null;
    const mapped = resolveAssetId(id);
    const v2 = V2_VOICE_LINES && (V2_VOICE_LINES[id] || V2_VOICE_LINES[mapped]) || null;
    if (v2) {
      const zh = v2.zh || "";
      const en = v2.en || "";
      if (bannedText(zh) || bannedText(en)) return { id: mapped, zh: "", en: "", speaker: v2.speaker || "" };
      return {
        id: mapped,
        zh,
        en,
        speaker: v2.speaker || "",
        src: v2.src,
        trigger: v2.trigger || "",
        duration: v2.duration || 0
      };
    }
    const rows = VOICE_LINES2 || [];
    for (let i = 0; i < rows.length; i += 1) {
      const row2 = rows[i];
      if (!row2) continue;
      if (row2.id === id || `vo.${row2.id}` === id || `vo.${row2.id}` === mapped) {
        if (bannedText(row2.zh) || bannedText(row2.en)) return null;
        return {
          id: `vo.${row2.id}`,
          zh: row2.zh || "",
          en: row2.en || "",
          speaker: row2.speaker || "",
          src: row2.path
        };
      }
    }
    return null;
  }

  // src/core/audio.js
  var POOL_SIZE = 4;
  var SHORT_HIT = 0.42;
  var SHORT_FADE = 0.14;
  var LONG_SFX = /* @__PURE__ */ new Set([
    "sfx.rain",
    "sfx.heartbeat",
    "sfx.busy",
    "sfx.fanStop",
    "sfx.glass",
    "sfx.slam",
    "sfx.tear",
    "sfx.stamp",
    "sfx.death",
    "sfx.phase",
    "sfx.smite",
    "sfx.charge",
    "sfx.banner",
    "sfx.b200",
    "sfx.heal",
    "sfx.fan",
    "sfx.flask",
    "sfx.heavy",
    "sfx.beam",
    "sfx.feathers"
  ]);
  var RATE_MS = {
    shot: 55,
    hit: 70,
    bark: 8e3,
    hurt: 4200,
    skill: 1600,
    default: 40
  };
  function hashId(id) {
    let h = 0;
    const s = String(id);
    for (let i = 0; i < s.length; i += 1) h = h * 33 + s.charCodeAt(i) >>> 0;
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
    if (typeof arg === "number") return Math.max(0.04, arg);
    if (arg && typeof arg === "object" && arg.fade != null) return Math.max(0.04, Number(arg.fade) || fallback);
    return fallback;
  }
  function isVoiceId(id) {
    const s = String(id || "");
    return s.startsWith("vo.") || s.startsWith("vo_") || s.startsWith("v2_vo_") || s.startsWith("m.dario_") || s.startsWith("m.endA_") || s.startsWith("m.endB_") || s.startsWith("m.ally_");
  }
  var CLAUDE_COMBAT_VO = /^v2_vo_(haiku|sonnet|opus)_(intro|attack|hurt|out|cast|low)$/;
  function isClaudeCombatVo(id) {
    const resolved = resolveAssetId(String(id || ""));
    return CLAUDE_COMBAT_VO.test(resolved) || CLAUDE_COMBAT_VO.test(String(id || ""));
  }
  var playLog = [];
  var LOG_MAX = 96;
  function logPlay(kind, id, extra = {}) {
    playLog.push({ kind, id: String(id), ...extra, t: typeof performance !== "undefined" ? performance.now() : Date.now() });
    if (playLog.length > LOG_MAX) playLog.shift();
  }
  function autoplayFail(err) {
    const name = err && err.name;
    return name === "NotAllowedError" || name === "AbortError";
  }
  function setVol(el, v) {
    if (!el) return;
    try {
      el.volume = clamp01(v);
    } catch {
    }
  }
  function rewind(el) {
    if (!el) return;
    try {
      el.currentTime = 0;
    } catch {
    }
  }
  function safePlay(el) {
    if (!el) return;
    const started2 = el.play();
    if (started2 && typeof started2.catch === "function") started2.catch(() => {
    });
  }
  function safePause(el) {
    if (!el) return;
    try {
      el.pause();
    } catch {
    }
  }
  function whoOf(payload, ctx2) {
    if (!payload) return ctx2?.player?.id || "deepseek";
    if (typeof payload === "string") return payload;
    if (payload.id && typeof payload.id === "string" && !payload.id.startsWith("px.")) return payload.id;
    if (payload.charId) return payload.charId;
    if (payload.name) return payload.name;
    return ctx2?.player?.id || "deepseek";
  }
  function createAudio() {
    let ac = null;
    const missing = /* @__PURE__ */ new Set();
    const pools = /* @__PURE__ */ new Map();
    const live = /* @__PURE__ */ new Set();
    const lastAt = /* @__PURE__ */ new Map();
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
    let voEl = null;
    let voPromise = Promise.resolve(0);
    let unlocked = false;
    let wireCtx = null;
    let padNodes = null;
    let humNodes = null;
    let chargeNodes = null;
    function gated(key, ms) {
      const now2 = typeof performance !== "undefined" ? performance.now() : Date.now();
      const prev2 = lastAt.get(key) || 0;
      if (now2 - prev2 < (ms || RATE_MS.default)) return false;
      lastAt.set(key, now2);
      return true;
    }
    function context() {
      if (!unlocked) return null;
      if (ac) return ac;
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      try {
        ac = new Ctor();
      } catch {
        ac = null;
      }
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
      if (a && a.state === "suspended") a.resume().catch(() => {
      });
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
    function synth(kind, id) {
      const a = context();
      if (!a || a.state !== "running") return;
      const now2 = a.currentTime;
      const h = hashId(id || kind);
      const tag = String(kind || id || "");
      const osc = (type, freq, dur, peak, delay) => {
        const o = a.createOscillator();
        const g = a.createGain();
        o.type = type;
        o.frequency.value = freq;
        const t2 = now2 + (delay || 0);
        const p = Math.max(8e-4, peak);
        g.gain.setValueAtTime(p, t2);
        g.gain.exponentialRampToValueAtTime(1e-4, t2 + dur);
        o.connect(g);
        g.connect(a.destination);
        o.start(t2);
        o.stop(t2 + dur + 0.02);
      };
      const noise = (dur, peak, hp, delay) => {
        const buf = noiseBuffer(dur);
        if (!buf) return;
        const src = a.createBufferSource();
        const g = a.createGain();
        const f = a.createBiquadFilter();
        src.buffer = buf;
        f.type = hp ? "highpass" : "lowpass";
        f.frequency.value = hp || 900;
        const t2 = now2 + (delay || 0);
        g.gain.setValueAtTime(peak, t2);
        g.gain.exponentialRampToValueAtTime(1e-4, t2 + dur);
        src.connect(f);
        f.connect(g);
        g.connect(a.destination);
        src.start(t2);
      };
      if (tag === "pew_kimi" || tag.includes("star")) {
        osc("sine", 880, 0.08, 0.045, 0);
        osc("triangle", 1320, 0.06, 0.02, 0.02);
        return;
      }
      if (tag === "pew_glm" || tag.includes("hammer")) {
        osc("square", 140, 0.09, 0.05, 0);
        osc("triangle", 70, 0.14, 0.04, 0.01);
        return;
      }
      if (tag === "pew_deepseek" || tag === "pew" || tag.includes("slash")) {
        osc("square", 420 + h % 80, 0.05, 0.03, 0);
        noise(0.05, 0.03, 1800, 0);
        return;
      }
      if (tag === "hit" || tag.includes("hit")) {
        noise(0.06, 0.05, 900, 0);
        osc("square", 180 + h % 40, 0.04, 0.025, 0);
        return;
      }
      if (tag === "heavy" || tag.includes("heavy") || tag.includes("slam")) {
        osc("sine", 62, 0.22, 0.08, 0);
        osc("triangle", 36, 0.28, 0.05, 0.02);
        noise(0.12, 0.05, 400, 0);
        return;
      }
      if (tag === "roll" || tag.includes("whoosh") || tag.includes("dash")) {
        noise(0.14, 0.05, 600, 0);
        osc("triangle", 240, 0.1, 0.02, 0);
        return;
      }
      if (tag === "ding" || tag.includes("guard") || tag.includes("perfect") || tag.includes("shield")) {
        osc("sine", 1480, 0.12, 0.05, 0);
        osc("sine", 2220, 0.1, 0.03, 0.02);
        return;
      }
      if (tag === "charge" || tag.includes("charge")) {
        osc("sawtooth", 90, 0.35, 0.03, 0);
        osc("sine", 180, 0.35, 0.02, 0);
        return;
      }
      if (tag === "beam" || tag.includes("beam")) {
        osc("sawtooth", 220, 0.28, 0.04, 0);
        osc("square", 440, 0.18, 0.02, 0.02);
        noise(0.2, 0.03, 2e3, 0);
        return;
      }
      if (tag === "explode" || tag.includes("explosion") || tag.includes("smite")) {
        noise(0.28, 0.08, 300, 0);
        osc("sine", 48, 0.32, 0.07, 0);
        return;
      }
      if (tag === "hum" || tag.includes("telegraph")) {
        osc("sine", 110, 0.4, 0.02, 0);
        osc("sine", 165, 0.4, 0.012, 0);
        return;
      }
      if (tag === "glass" || tag.includes("glass") || tag.includes("crack")) {
        noise(0.22, 0.08, 1800, 0);
        osc("square", 1240 + h % 400, 0.08, 0.03, 0);
        osc("sine", 2100, 0.06, 0.02, 0.04);
        return;
      }
      if (tag === "stamp" || tag.includes("stamp")) {
        osc("sine", 70, 0.18, 0.07, 0);
        noise(0.08, 0.04, 700, 0);
        osc("square", 220, 0.06, 0.03, 0.02);
        return;
      }
      if (tag.includes("heartbeat")) {
        osc("sine", 68, 0.09, 0.05, 0);
        osc("sine", 52, 0.11, 0.04, 0.22);
        return;
      }
      if (tag.includes("rain")) {
        noise(0.5, 0.03, 900, 0);
        return;
      }
      if (tag.includes("flask") || tag.includes("heal")) {
        osc("sine", 520, 0.12, 0.03, 0);
        osc("sine", 780, 0.14, 0.025, 0.05);
        return;
      }
      if (isVoiceId(id) || tag === "vo") {
        osc("sine", 90 + h % 40, 0.28, 0.035, 0);
        osc("sine", 140 + h % 20, 0.18, 0.02, 0.05);
        return;
      }
      osc("square", 220 + h % 640, 0.05, 0.02, 0);
    }
    function beep(id, kind) {
      synth(kind === "vo" ? "vo" : String(id), id);
    }
    function stopPad() {
      if (!padNodes) return;
      try {
        padNodes.g.gain.exponentialRampToValueAtTime(1e-4, (ac ? ac.currentTime : 0) + 0.2);
      } catch {
      }
      try {
        padNodes.o.stop((ac ? ac.currentTime : 0) + 0.25);
      } catch {
      }
      padNodes = null;
    }
    function stopHum() {
      if (!humNodes) return;
      const t2 = ac ? ac.currentTime : 0;
      try {
        humNodes.g.gain.exponentialRampToValueAtTime(1e-4, t2 + 0.12);
      } catch {
      }
      try {
        humNodes.o.stop(t2 + 0.16);
      } catch {
      }
      humNodes = null;
    }
    function startHum() {
      stopHum();
      const a = context();
      if (!a || a.state !== "running") return;
      const o = a.createOscillator();
      const o2 = a.createOscillator();
      const g = a.createGain();
      o.type = "sine";
      o2.type = "triangle";
      o.frequency.value = 108;
      o2.frequency.value = 162;
      g.gain.value = 0.018 * sfxGain(1);
      o.connect(g);
      o2.connect(g);
      g.connect(a.destination);
      try {
        o.start();
        o2.start();
      } catch {
      }
      humNodes = { o, o2, g };
    }
    function stopCharge() {
      if (!chargeNodes) return;
      const t2 = ac ? ac.currentTime : 0;
      try {
        chargeNodes.g.gain.exponentialRampToValueAtTime(1e-4, t2 + 0.08);
      } catch {
      }
      try {
        chargeNodes.o.stop(t2 + 0.12);
      } catch {
      }
      chargeNodes = null;
    }
    function startCharge() {
      stopCharge();
      const a = context();
      if (!a || a.state !== "running") return;
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = "sawtooth";
      o.frequency.value = 80;
      try {
        o.frequency.exponentialRampToValueAtTime(240, a.currentTime + 1.2);
      } catch {
      }
      g.gain.value = 0.02 * sfxGain(1);
      o.connect(g);
      g.connect(a.destination);
      try {
        o.start();
      } catch {
      }
      chargeNodes = { o, g };
    }
    function startPad(id) {
      stopPad();
      const a = context();
      if (!a || a.state !== "running") return;
      const o = a.createOscillator();
      const o2 = a.createOscillator();
      const g = a.createGain();
      const h = hashId(id);
      o.type = "sine";
      o2.type = "triangle";
      o.frequency.value = 98 + h % 24;
      o2.frequency.value = 196 + h % 18;
      g.gain.value = 0.012 * musicGain();
      o.connect(g);
      o2.connect(g);
      g.connect(a.destination);
      try {
        o.start();
        o2.start();
      } catch {
      }
      padNodes = { o, o2, g };
    }
    function applyBgmVolumes() {
      const g = musicGain();
      const k = Math.min(1, fading / fade);
      if (outgoing && !outgoing.dead) setVol(outgoing, (1 - k) * g);
      if (current && !current.dead) setVol(current, k * g);
      if (padNodes && padNodes.g) {
        try {
          padNodes.g.gain.value = 0.012 * g * k;
        } catch {
        }
      }
    }
    function kill(el) {
      if (!el) return;
      el.dead = true;
      setVol(el, 0);
      const stop = () => {
        if (el.dead) safePause(el);
      };
      if (el.readyState >= 2) stop();
      else el.addEventListener("canplay", stop, { once: true });
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
      el.preload = "auto";
      el.dead = false;
      setVol(el, 0);
      el.addEventListener("error", () => {
        el.dead = true;
        missing.add(id);
        if (current === el) {
          current = null;
          startPad(id);
        }
      }, { once: true });
      current = el;
      const started2 = el.play();
      if (started2 && typeof started2.catch === "function") {
        started2.catch((err) => {
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
      let list2 = pools.get(id);
      if (!list2) {
        list2 = [];
        pools.set(id, list2);
      }
      for (let i = 0; i < list2.length; i += 1) {
        const el = list2[i];
        if (el._free || el.paused || el.ended) return el;
      }
      if (list2.length < POOL_SIZE) {
        const el = new Audio(path);
        el.preload = "auto";
        el._free = true;
        list2.push(el);
        return el;
      }
      return list2[0];
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
        if (entry.kind !== "sfx") continue;
        if (want && entry.id !== want && entry.id !== id) continue;
        if (fadeSec <= 0.05) {
          release(entry);
        } else {
          entry.el._fadeFrom = entry.el.volume;
          entry.el._fadeT = 0;
          entry.el._fadeDur = fadeSec;
          entry.el._fadeTo = 0;
          entry.el._killAt = 1e-3;
        }
      }
      if (!id || String(id).includes("telegraph")) stopHum();
      if (!id || String(id).includes("charge")) stopCharge();
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
        playVo(id, { ...opts, ctx: opts.ctx });
        return;
      }
      const resolved = resolveAssetId(id);
      logPlay("sfx", resolved);
      if (!gated(`sfx:${resolved}`, RATE_MS.default)) return;
      const options = opts && typeof opts === "object" ? opts : {};
      const loop = !!options.loop;
      const rate = Number(options.rate);
      const vol = sfxGain(options.volume == null ? 1 : options.volume);
      const long = loop || LONG_SFX.has(id) || LONG_SFX.has(resolved);
      const maxDuration = options.maxDuration == null ? long ? 0 : SHORT_HIT : Number(options.maxDuration) || 0;
      const fadeOut = options.fadeOut == null ? long || loop ? 0 : SHORT_FADE : Number(options.fadeOut) || 0;
      if (missing.has(resolved) || missing.has(id)) {
        beep(resolved, "sfx");
        return;
      }
      const path = getAsset(resolved);
      if (!path) {
        missing.add(resolved);
        beep(resolved, "sfx");
        return;
      }
      const el = acquire(resolved, path);
      el._free = false;
      el.loop = loop;
      try {
        el.playbackRate = Number.isFinite(rate) && rate > 0 ? Math.max(0.4, Math.min(2.5, rate)) : 1;
      } catch {
      }
      setVol(el, vol);
      rewind(el);
      el._fadeFrom = vol;
      el._fadeTo = vol;
      el._fadeT = 0;
      el._fadeDur = 0;
      el._killAt = maxDuration > 0 ? maxDuration : 0;
      el._fadeOut = fadeOut;
      el._baseVol = vol;
      const entry = { el, id: resolved, kind: "sfx" };
      live.add(entry);
      const fail = () => {
        missing.add(resolved);
        release(entry);
        beep(resolved, "sfx");
      };
      const gen = el._gen = (el._gen || 0) + 1;
      el.onerror = () => {
        if (el._gen === gen) fail();
      };
      el.onended = () => {
        if (el._gen === gen && !el.loop) release(entry);
      };
      const started2 = el.play();
      if (started2 && typeof started2.catch === "function") {
        started2.catch((err) => {
          if (autoplayFail(err)) return;
          if (el.error) fail();
        });
      }
    }
    function shouldMuteClaudeCombatVo(ctx2, id) {
      if (getLanguage() !== "en") return false;
      if (!isClaudeCombatVo(id)) return false;
      return true;
    }
    function playVo(id, opts = {}) {
      if (!id) {
        return { duration: 0, promise: Promise.resolve(0) };
      }
      const resolved = resolveAssetId(id);
      const mute = shouldMuteClaudeCombatVo(opts.ctx || wireCtx, resolved);
      logPlay("vo", resolved, { muted: mute, unlocked });
      if (!unlocked) {
        return { duration: 0, promise: Promise.resolve(0) };
      }
      if (mute) {
        return { duration: 0, promise: Promise.resolve(0) };
      }
      if (voActiveId === resolved && voEl && !voEl.paused) {
        const duration = Number.isFinite(voEl.duration) ? voEl.duration : 0;
        return { duration, promise: voPromise };
      }
      const options = opts && typeof opts === "object" ? opts : {};
      voCount += 1;
      voActiveId = resolved;
      duck(options.duck == null ? 0.24 : options.duck);
      let settle;
      const promise = new Promise((resolve) => {
        settle = resolve;
      });
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
        beep(resolved, "vo");
        window.setTimeout(() => done(0.35), 350);
        return handle;
      }
      const path = getAsset(resolved);
      if (!path) {
        missing.add(resolved);
        beep(resolved, "vo");
        window.setTimeout(() => done(0.35), 350);
        return handle;
      }
      const el = new Audio(path);
      el.preload = "auto";
      el._voId = resolved;
      setVol(el, voGain(options.volume == null ? 1 : options.volume));
      voEl = el;
      el.addEventListener("loadedmetadata", () => {
        if (Number.isFinite(el.duration) && el.duration > 0) handle.duration = el.duration;
      });
      el.addEventListener("ended", () => done(handle.duration), { once: true });
      el.addEventListener("error", () => {
        missing.add(resolved);
        beep(resolved, "vo");
        done(0.35);
      }, { once: true });
      const started2 = el.play();
      if (started2 && typeof started2.catch === "function") {
        started2.catch((err) => {
          if (autoplayFail(err)) {
            done(handle.duration);
            return;
          }
          if (el.error) {
            missing.add(resolved);
            beep(resolved, "vo");
            done(0.35);
          }
        });
      }
      return handle;
    }
    function bark2(id, gap, ctx2) {
      if (!id) return;
      if (!gated(`bark:${id}`, gap || RATE_MS.bark)) return;
      playVo(id, { ctx: ctx2 });
    }
    function phaseBossVo(phase) {
      if (phase === 2) return "v2_vo_sonnet_intro";
      if (phase === 3) return "v2_vo_opus_intro";
      return "v2_vo_haiku_intro";
    }
    function bossAttackVo(phase) {
      if (phase === 2) return "v2_vo_sonnet_attack";
      if (phase === 3) return "v2_vo_opus_attack";
      return "v2_vo_haiku_attack";
    }
    function charVo(who, kind) {
      const id = String(who || "deepseek").toLowerCase();
      const name = id.includes("kimi") ? "kimi" : id.includes("glm") ? "glm" : "deepseek";
      return `v2_vo_${name}_${kind}`;
    }
    function update19(_ctx, dt) {
      const step2 = dt > 0 ? dt : 0;
      fading += step2;
      if (duckMul !== duckGoal) {
        const dir = duckGoal > duckMul ? 1 : -1;
        duckMul += dir * duckVel * step2;
        if (dir > 0 && duckMul > duckGoal || dir < 0 && duckMul < duckGoal) duckMul = duckGoal;
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
          el._fadeT += step2;
          const t2 = Math.min(1, el._fadeT / el._fadeDur);
          setVol(el, el._fadeFrom + (el._fadeTo - el._fadeFrom) * t2);
          if (t2 >= 1) {
            el._fadeDur = 0;
            if (el._fadeTo <= 1e-3) release(entry);
          }
        }
        if (el._killAt > 0 && !el.loop) {
          el._killAt -= step2;
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
    function reset9() {
      stopBgm(0.05);
      stopVo();
      stopHum();
      stopCharge();
      for (const entry of Array.from(live)) release(entry);
      duckMul = 1;
      duckGoal = 1;
    }
    function wireBus(ctx2) {
      ctx2.bus.on(EVENTS.FIGHT_START, (p) => {
        playBgm("bgm.p1", { fade: 0.6 });
        const who = whoOf(p, ctx2);
        bark2(charVo(who, "start"), 12e3, ctx2);
      });
      ctx2.bus.on(EVENTS.PHASE_CHANGE, ({ phase }) => {
        const id = phase === 2 ? "bgm.p2" : phase === 3 ? "bgm.p3" : "bgm.p1";
        playBgm(id, { fade: 0.9 });
        playSfx("sfx.phase");
        synth("heavy", "sfx.phase");
        bark2(phaseBossVo(phase), 4e3, ctx2);
      });
      ctx2.bus.on(EVENTS.PHASE_TRANSITION_START, () => {
        playSfx("sfx.phase");
      });
      ctx2.bus.on(EVENTS.ENDING_TRIGGER, ({ id }) => {
        playBgm(id === "B" ? "bgm.endB" : "bgm.endA", { fade: 0.5 });
      });
      ctx2.bus.on(EVENTS.STATE_CHANGE, ({ to }) => {
        if (to === "title" || to === "disclaimer" || to === "select") playBgm("bgm.title", { fade: 0.8 });
        if (to === "banned") stopBgm(0.25);
        if (to === "credits") stopBgm(0.8);
        if (to !== "fight" && to !== "intro") {
          stopCharge();
          stopHum();
        }
      });
      ctx2.bus.on(EVENTS.PLAYER_DEATH, () => {
        stopCharge();
        stopHum();
      });
      ctx2.bus.on(EVENTS.SHOT_FIRED, (p) => {
        if (!gated("evt:shot", RATE_MS.shot)) return;
        const who = whoOf(p, ctx2);
        if (String(who).includes("kimi")) {
          playSfx("sfx.star");
          synth("pew_kimi", who);
        } else if (String(who).includes("glm")) {
          playSfx("sfx.hammer");
          synth("pew_glm", who);
        } else {
          playSfx("sfx.slash");
          synth("pew_deepseek", who);
        }
      });
      ctx2.bus.on(EVENTS.HIT, (hit) => {
        if (!hit || !hit.applied) return;
        if (!gated("evt:hit", RATE_MS.hit)) return;
        const dst = hit.dst;
        const team = dst && dst.team;
        if (hit.heavy) {
          playSfx("sfx.heavy");
          synth("heavy", "hit");
        } else if (team === "player") {
          playSfx("sfx.hitPlayer");
          synth("hit", "player");
        } else {
          playSfx("sfx.hitBoss");
          synth("hit", "boss");
        }
        if (team === "player" && dst && dst.id) bark2(charVo(dst.id, "hurt"), RATE_MS.hurt, ctx2);
      });
      ctx2.bus.on(EVENTS.SKILL_CHARGE, () => {
        playSfx("sfx.charge");
        startCharge();
        synth("charge", "skill");
      });
      ctx2.bus.on(EVENTS.SKILL_RELEASE, (p) => {
        stopCharge();
        playSfx("sfx.beam");
        synth("beam", "skill");
        const who = whoOf(p, ctx2);
        bark2(charVo(who, "skill"), RATE_MS.skill, ctx2);
      });
      ctx2.bus.on(EVENTS.SKILL_USED, (p) => {
        const who = whoOf(p, ctx2);
        bark2(charVo(who, "skill"), RATE_MS.skill, ctx2);
        playSfx("sfx.heavy");
      });
      ctx2.bus.on(EVENTS.SHIELD_BLOCK, (p) => {
        if (p && p.perfect) {
          playSfx("sfx.perfect");
          synth("ding", "perfect");
        } else {
          playSfx("sfx.guard");
          synth("ding", "guard");
        }
      });
      ctx2.bus.on(EVENTS.PERFECT_GUARD, () => {
        playSfx("sfx.perfect");
        synth("ding", "perfect");
      });
      ctx2.bus.on(EVENTS.FLASK_USED, (p) => {
        const type = p && p.type;
        playSfx(type === "b200" ? "sfx.b200" : "sfx.heal");
        synth("heal", type || "flask");
        const who = ctx2.player?.id;
        bark2(charVo(who, "heal"), 3e3, ctx2);
      });
      ctx2.bus.on(EVENTS.ROLL_START, () => {
        playSfx("sfx.roll");
        synth("roll", "roll");
      });
      ctx2.bus.on(EVENTS.TELEGRAPH_START, () => {
        playSfx("sfx.telegraph");
        startHum();
      });
      ctx2.bus.on(EVENTS.TELEGRAPH_END, () => stopHum());
      ctx2.bus.on(EVENTS.TELEGRAPH_RESOLVE, () => stopHum());
      ctx2.bus.on(EVENTS.SAFETY_JUDGEMENT, () => {
        playSfx("sfx.smite");
        synth("explode", "smite");
      });
      ctx2.bus.on(EVENTS.BOSS_ATTACK, (p) => {
        playSfx("sfx.heavy");
        const phase = p && p.phase || ctx2.boss?.phase || 1;
        bark2(bossAttackVo(phase), RATE_MS.bark, ctx2);
      });
    }
    function init19(ctx2) {
      wireCtx = ctx2;
      const gesture = () => unlock();
      window.addEventListener("pointerdown", gesture, { passive: true });
      window.addEventListener("keydown", gesture);
      window.addEventListener("touchstart", gesture, { passive: true });
      wireBus(ctx2);
    }
    function setVolume(partial) {
      if (!partial || typeof partial !== "object") return;
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
      init: init19,
      update: update19,
      reset: reset9,
      playSfx,
      playBgm,
      stopBgm,
      playVo,
      stopVo,
      stopSfx,
      duck,
      unlock,
      setVolume,
      getVolume() {
        return { master, music, sfx: sfxVol, vo: voVol };
      },
      getPlayLog,
      clearPlayLog,
      isClaudeCombatVo
    };
  }

  // src/core/combat.js
  var lastSmallJuice = -1;
  function resolveActor(ctx2, ref) {
    if (!ref) return null;
    if (typeof ref !== "string") return ref;
    if (ref === "player" || ctx2.player && ref === ctx2.player.id) return ctx2.player || null;
    if (ref === "boss" || ctx2.boss && ref === ctx2.boss.id) return ctx2.boss || null;
    if (ref === "stele") return ctx2.stele || null;
    if (!ctx2.allies) return null;
    return ctx2.allies.find((a) => a.id === ref) || null;
  }
  function finiteMul(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 1;
    return n < 0 ? 0 : n;
  }
  function applyHit(ctx2, src, dst, dmg, opts = {}) {
    const source = resolveActor(ctx2, src);
    const target = resolveActor(ctx2, dst);
    if (!target || target.alive === false) return 0;
    const now2 = ctx2.time?.elapsed || 0;
    const unscaled = ctx2.time?.unscaled || 0;
    if (!opts.ignoreInvuln && ctx2.truceUntil && unscaled < ctx2.truceUntil) return 0;
    const attackId = opts.attackId != null && opts.attackId !== "" ? String(opts.attackId) : "";
    if (attackId && !opts.ignoreInvuln) {
      const log = target.hurtLog || (target.hurtLog = {});
      if ((log[attackId] || 0) > now2) return 0;
    }
    if (!opts.ignoreInvuln && target.invuln > 0) return 0;
    let amount = Number(dmg);
    if (!Number.isFinite(amount) || amount < 0) amount = 0;
    const team = source?.team || opts.team || null;
    const dbg = ctx2.debug || {};
    if (team === TEAMS.PLAYER) amount *= finiteMul(dbg.playerDmgMul);
    else if (team === TEAMS.ALLY) amount *= finiteMul(dbg.allyDmgMul);
    else if (team === TEAMS.BOSS) amount *= finiteMul(dbg.bossDmgMul);
    if (team === TEAMS.ALLY && target.team === TEAMS.BOSS && target.maxHp > 0) {
      const keep = target.maxHp * ENDING_B_RATIO + 1;
      if (target.hp - amount < keep) amount = Math.max(0, target.hp - keep);
    }
    if (target.team === TEAMS.PLAYER && dbg.godMode && !opts.ignoreGod) return 0;
    if (target.superarmor > 0) {
      amount *= target.superarmorMul ?? 0.6;
      opts = { ...opts, noKnockback: true };
    }
    if (amount <= 0) return 0;
    if (target.team === TEAMS.BOSS && target.lockHpAt25) {
      const floor = target.maxHp * ENDING_B_RATIO;
      if (target.hp <= floor + 1e-3) return 0;
    }
    const before = target.hp;
    target.hp = Math.max(0, before - amount);
    if (target.team === TEAMS.BOSS && typeof target.commit === "function") {
      target.commit({ allowEnding: opts.allowEnding !== false });
    } else if (target.team === TEAMS.NEUTRAL) {
      target.hp = target.maxHp;
      target.alive = true;
    } else if (target.hp <= 0) {
      target.hp = 0;
      target.alive = false;
    }
    let applied = before - target.hp;
    if (target.team === TEAMS.BOSS) applied = Math.max(0, before - target.hp);
    if (target.team === TEAMS.NEUTRAL) applied = amount;
    if (attackId && applied > 0) {
      const log = target.hurtLog || (target.hurtLog = {});
      log[attackId] = now2 + (opts.immuneFor ?? 0.6);
    }
    ctx2.bus?.emit(EVENTS.HIT, {
      src: source || src || null,
      dst: target,
      dmg: amount,
      applied,
      heavy: !!opts.heavy
    });
    if (applied > 0) {
      const isFighter = target.team === TEAMS.PLAYER || target.team === TEAMS.ALLY;
      if (isFighter) {
        target.invuln = Math.max(target.invuln || 0, opts.invulnFor ?? 0.8);
        if (!opts.noKnockback && !(target.superarmor > 0)) {
          const sx = source && Number.isFinite(source.x) ? source.x : target.x;
          const sy = source && Number.isFinite(source.y) ? source.y : target.y - 1;
          const dx = target.x - sx;
          const dy = target.y - sy;
          const len = Math.hypot(dx, dy) || 1;
          const k = opts.knock ?? 6;
          target.x += dx / len * k;
          target.y += dy / len * k;
          ctx2.world?.clamp?.(target);
        }
      } else if (opts.knock && source && Number.isFinite(source.x)) {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const len = Math.hypot(dx, dy) || 1;
        target.x += dx / len * opts.knock;
        target.y += dy / len * opts.knock;
        ctx2.world?.clamp?.(target);
      }
      const tiny = !opts.heavy && target.team === TEAMS.BOSS && applied < 8;
      const nowU = ctx2.time?.unscaled || 0;
      const juiceOk = !tiny || nowU - lastSmallJuice >= 0.12;
      target.flash = Math.max(target.flash || 0, tiny ? 0.04 : 0.08);
      let ms = opts.hitStopMs === 0 ? 0 : opts.hitStopMs ?? (opts.heavy ? 70 : target.team === TEAMS.PLAYER ? 60 : 40);
      if (tiny) ms = juiceOk ? Math.min(ms, 16) : 0;
      if (ms > 0) {
        ctx2.time?.requestHitStop(ms);
        ctx2.bus?.emit(EVENTS.HIT_STOP, { ms });
      }
      if (juiceOk) {
        if (tiny) lastSmallJuice = nowU;
        const mag = opts.shake ?? (target.team === TEAMS.PLAYER ? 2 : opts.heavy ? 3 : 1);
        ctx2.bus?.emit(EVENTS.SHAKE, { mag, dur: 0.16 });
        ctx2.bus?.emit(EVENTS.CAMERA_SHAKE, { intensity: mag / 24, duration: 0.16 });
        const flash = target.team === TEAMS.PLAYER ? "rgba(194,59,59,0.45)" : tiny ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.28)";
        ctx2.bus?.emit(EVENTS.FLASH, { color: opts.flash || flash, dur: tiny ? 0.04 : 0.08 });
      }
      ctx2.bus?.emit(EVENTS.VFX, {
        kind: "num",
        x: target.x,
        y: target.y - 16,
        text: String(Math.max(1, Math.round(applied))),
        color: target.team === TEAMS.BOSS ? "#f4f1ea" : "#ffb4b4"
      });
      if (target.team === TEAMS.PLAYER) ctx2.audio?.playSfx("sfx.hurt");
      else if (target.team === TEAMS.BOSS) ctx2.audio?.playSfx(opts.heavy ? "sfx.heavy" : "sfx.hitBoss");
      if (typeof target.onHit === "function") {
        target.onHit({
          dmg: amount,
          applied,
          heavy: !!opts.heavy,
          src: source || src || null,
          attackId
        });
      }
      if (!target.alive && target.team === TEAMS.PLAYER) {
        ctx2.bus.emit(EVENTS.PLAYER_DEATH, { phase: ctx2.boss?.phase || 1, id: target.id });
      } else if (!target.alive && target.team === TEAMS.ALLY) {
        ctx2.bus.emit(EVENTS.ALLY_DOWN, { id: target.id });
      }
    }
    return applied > 0 ? applied : 0;
  }

  // src/actors/characters.js
  var ROSTER = ROSTER_IDS.slice();
  function normalizeId(id) {
    const key = String(id || "").toLowerCase();
    return ROSTER.includes(key) ? key : null;
  }
  var KIT_TEXT = Object.freeze({
    deepseek: {
      primary: { zh: "MoE \u6563\u5C04", en: "MoE Scatter" },
      skill: { zh: "\u4E13\u5BB6\u9CB8\u7FA4", en: "Mixture-of-Whales" }
    },
    kimi: {
      primary: { zh: "\u661F\u8F89\u5F39", en: "Star Orb" },
      skill: { zh: "\u957F\u4E0A\u4E0B\u6587\xB7\u6697\u6708", en: "Long-Context Dark Moon" }
    },
    glm: {
      primary: { zh: "\u91CD\u9524\u5F39", en: "Hammer Bolt" },
      skill: { zh: "\u5F00\u6E90\u4E4B\u76FE", en: "Open-Source Aegis" }
    }
  });
  function getCharacter(id) {
    const key = normalizeId(id) || "deepseek";
    return { ...CHARACTERS[key], ...PLAYER[key], kitText: KIT_TEXT[key] };
  }
  function listRoster() {
    return ROSTER.map((id) => getCharacter(id));
  }

  // src/render/pixel.js
  var pixel_exports = {};
  __export(pixel_exports, {
    INTERNAL_H: () => INTERNAL_H2,
    INTERNAL_W: () => INTERNAL_W2,
    WORLD_OX: () => WORLD_OX,
    WORLD_OY: () => WORLD_OY,
    begin: () => begin,
    getBuffer: () => getBuffer,
    getShake: () => getShake,
    init: () => init,
    layout: () => layout,
    present: () => present,
    rect: () => rect,
    reset: () => reset,
    screenToBuffer: () => screenToBuffer,
    screenToInternal: () => screenToInternal,
    setFilter: () => setFilter,
    setShake: () => setShake,
    update: () => update
  });

  // src/render/world.js
  var INTERNAL_W = 640;
  var INTERNAL_H = 360;
  var WORLD_OX = 80;
  var WORLD_OY = 20;
  var ROOM_BG = Object.freeze({ x: 80, y: 20, w: 480, h: 320 });
  var FLOOR_SCREEN = Object.freeze({ x: 128, y: 76, w: 384, h: 208 });
  var FLOOR_WORLD = Object.freeze({
    x: FLOOR_SCREEN.x - WORLD_OX,
    y: FLOOR_SCREEN.y - WORLD_OY,
    w: FLOOR_SCREEN.w,
    h: FLOOR_SCREEN.h
  });
  var HUD_LEFT = Object.freeze({ x: 0, y: 0, w: 80, h: INTERNAL_H });
  var HUD_RIGHT = Object.freeze({ x: 560, y: 0, w: 80, h: INTERNAL_H });
  var HUD_TOP = Object.freeze({ x: 80, y: 0, w: 480, h: 18 });
  function applyScreen(g) {
    if (!g) return;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.imageSmoothingEnabled = false;
  }
  function applyWorld(g) {
    if (!g) return;
    g.setTransform(1, 0, 0, 1, WORLD_OX, WORLD_OY);
    g.imageSmoothingEnabled = false;
  }

  // src/render/pixel.js
  var INTERNAL_W2 = INTERNAL_W;
  var INTERNAL_H2 = INTERNAL_H;
  var view = null;
  var vctx = null;
  var buffer = null;
  var bctx = null;
  var scale = 1;
  var ox = 0;
  var oy = 0;
  var shakeX = 0;
  var shakeY = 0;
  var filter = "";
  function applyUiRect() {
    const dw = Math.round(INTERNAL_W2 * scale);
    const dh = Math.round(INTERNAL_H2 * scale);
    const root6 = document.documentElement;
    root6.style.setProperty("--game-scale", String(scale));
    root6.style.setProperty("--game-x", `${ox}px`);
    root6.style.setProperty("--game-y", `${oy}px`);
    root6.style.setProperty("--game-w", `${dw}px`);
    root6.style.setProperty("--game-h", `${dh}px`);
    const ui = document.getElementById("ui-root");
    if (ui) {
      ui.style.left = `${ox}px`;
      ui.style.top = `${oy}px`;
      ui.style.width = `${dw}px`;
      ui.style.height = `${dh}px`;
    }
  }
  function layout() {
    if (!view || !vctx) return;
    const w = Math.max(1, window.innerWidth || 1);
    const h = Math.max(1, window.innerHeight || 1);
    view.width = w;
    view.height = h;
    view.style.width = `${w}px`;
    view.style.height = `${h}px`;
    view.style.imageRendering = "pixelated";
    let next = Math.floor(Math.min(w / INTERNAL_W2, h / INTERNAL_H2));
    if (next < 1) next = Math.min(w / INTERNAL_W2, h / INTERNAL_H2);
    scale = next > 0 ? next : 1;
    const dw = INTERNAL_W2 * scale;
    const dh = INTERNAL_H2 * scale;
    ox = Math.floor((w - dw) / 2);
    oy = Math.floor((h - dh) / 2);
    vctx.imageSmoothingEnabled = false;
    applyUiRect();
  }
  function init(canvas2) {
    view = canvas2;
    const ctx2 = canvas2.getContext("2d", { alpha: false });
    if (!ctx2) throw new Error("Canvas2D unavailable");
    vctx = ctx2;
    buffer = document.createElement("canvas");
    buffer.width = INTERNAL_W2;
    buffer.height = INTERNAL_H2;
    const bg = buffer.getContext("2d", { alpha: false });
    if (!bg) throw new Error("Buffer Canvas2D unavailable");
    bctx = bg;
    bctx.imageSmoothingEnabled = false;
    canvas2.style.imageRendering = "pixelated";
    layout();
    window.addEventListener("resize", layout);
  }
  function screenToInternal(clientX, clientY) {
    const s = scale || 1;
    return {
      x: (clientX - ox) / s - WORLD_OX,
      y: (clientY - oy) / s - WORLD_OY
    };
  }
  function screenToBuffer(clientX, clientY) {
    const s = scale || 1;
    return {
      x: (clientX - ox) / s,
      y: (clientY - oy) / s
    };
  }
  function rect() {
    return {
      x: ox,
      y: oy,
      w: INTERNAL_W2 * scale,
      h: INTERNAL_H2 * scale,
      scale
    };
  }
  function setShake(x, y) {
    shakeX = x | 0;
    shakeY = y | 0;
  }
  function getShake() {
    return { x: shakeX, y: shakeY };
  }
  function setFilter(css) {
    filter = css || "";
    if (view) view.style.filter = filter;
  }
  function getBuffer() {
    return buffer;
  }
  function begin() {
    if (!bctx) throw new Error("pixel.init was not called");
    bctx.setTransform(1, 0, 0, 1, 0, 0);
    bctx.imageSmoothingEnabled = false;
    bctx.clearRect(0, 0, INTERNAL_W2, INTERNAL_H2);
    return bctx;
  }
  function present() {
    if (!vctx || !buffer || !view) return;
    vctx.setTransform(1, 0, 0, 1, 0, 0);
    vctx.imageSmoothingEnabled = false;
    vctx.fillStyle = "#000";
    vctx.fillRect(0, 0, view.width, view.height);
    const dw = INTERNAL_W2 * scale;
    const dh = INTERNAL_H2 * scale;
    const sx = Math.round((shakeX | 0) * scale);
    const sy = Math.round((shakeY | 0) * scale);
    vctx.drawImage(buffer, ox + sx, oy + sy, dw, dh);
  }
  function update() {
  }
  function reset() {
    shakeX = 0;
    shakeY = 0;
    setFilter("");
  }

  // src/render/room.js
  var room_exports = {};
  __export(room_exports, {
    DARIO_HOLO: () => DARIO_HOLO,
    FLOOR_SCREEN: () => FLOOR_SCREEN,
    FLOOR_WORLD: () => FLOOR_WORLD,
    INTERNAL_H: () => INTERNAL_H,
    INTERNAL_W: () => INTERNAL_W,
    ROOM_BG: () => ROOM_BG,
    WORLD_OX: () => WORLD_OX,
    WORLD_OY: () => WORLD_OY,
    init: () => init2,
    render: () => render,
    reset: () => reset2,
    spawnStele: () => spawnStele,
    update: () => update2
  });

  // src/render/font.js
  var G3 = {
    "0": ["111", "101", "101", "101", "111"],
    "1": ["010", "110", "010", "010", "111"],
    "2": ["111", "001", "111", "100", "111"],
    "3": ["111", "001", "111", "001", "111"],
    "4": ["101", "101", "111", "001", "001"],
    "5": ["111", "100", "111", "001", "111"],
    "6": ["111", "100", "111", "101", "111"],
    "7": ["111", "001", "010", "010", "010"],
    "8": ["111", "101", "111", "101", "111"],
    "9": ["111", "101", "111", "001", "111"],
    A: ["010", "101", "111", "101", "101"],
    B: ["110", "101", "110", "101", "110"],
    C: ["111", "100", "100", "100", "111"],
    D: ["110", "101", "101", "101", "110"],
    E: ["111", "100", "110", "100", "111"],
    F: ["111", "100", "110", "100", "100"],
    G: ["111", "100", "101", "101", "111"],
    H: ["101", "101", "111", "101", "101"],
    I: ["111", "010", "010", "010", "111"],
    J: ["001", "001", "001", "101", "111"],
    K: ["101", "101", "110", "101", "101"],
    L: ["100", "100", "100", "100", "111"],
    M: ["101", "111", "111", "101", "101"],
    N: ["110", "101", "101", "101", "101"],
    O: ["111", "101", "101", "101", "111"],
    P: ["111", "101", "111", "100", "100"],
    Q: ["111", "101", "101", "111", "001"],
    R: ["110", "101", "110", "101", "101"],
    S: ["111", "100", "111", "001", "111"],
    T: ["111", "010", "010", "010", "010"],
    U: ["101", "101", "101", "101", "111"],
    V: ["101", "101", "101", "101", "010"],
    W: ["101", "101", "111", "111", "101"],
    X: ["101", "101", "010", "101", "101"],
    Y: ["101", "101", "010", "010", "010"],
    Z: ["111", "001", "010", "100", "111"],
    " ": ["000", "000", "000", "000", "000"],
    "-": ["000", "000", "111", "000", "000"],
    ".": ["000", "000", "000", "000", "010"],
    ":": ["000", "010", "000", "010", "000"],
    "/": ["001", "001", "010", "100", "100"],
    "+": ["000", "010", "111", "010", "000"],
    "%": ["101", "001", "010", "100", "101"],
    "!": ["010", "010", "010", "000", "010"],
    "?": ["111", "001", "010", "000", "010"],
    "*": ["101", "010", "111", "010", "101"],
    "'": ["010", "010", "000", "000", "000"],
    ",": ["000", "000", "000", "010", "100"],
    "(": ["010", "100", "100", "100", "010"],
    ")": ["010", "001", "001", "001", "010"],
    "[": ["110", "100", "100", "100", "110"],
    "]": ["011", "001", "001", "001", "011"],
    "=": ["000", "111", "000", "111", "000"],
    ">": ["100", "010", "001", "010", "100"],
    "<": ["001", "010", "100", "010", "001"],
    "#": ["101", "111", "101", "111", "101"],
    "x": ["101", "101", "010", "101", "101"]
  };
  var G5 = {
    "0": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
    "3": ["01110", "10001", "00001", "00110", "00001", "10001", "01110"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
    "6": ["01110", "10000", "11110", "10001", "10001", "10001", "01110"],
    "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
    A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
    D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    G: ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
    H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
    K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
    R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
    X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
    Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    ".": ["00000", "00000", "00000", "00000", "00000", "00100", "00000"],
    "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
    "%": ["11001", "11010", "00100", "00100", "01000", "01011", "10011"],
    "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
    "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
    "x": ["00000", "10001", "01010", "00100", "01010", "10001", "00000"],
    ":": ["00000", "00100", "00000", "00000", "00100", "00000", "00000"]
  };
  var GLYPH_W = 3;
  var GLYPH_H = 5;
  var GLYPH5_W = 5;
  var GLYPH5_H = 7;
  function blitGlyph(g, rows, x, y, px) {
    for (let row2 = 0; row2 < rows.length; row2 += 1) {
      const line = rows[row2];
      for (let col = 0; col < line.length; col += 1) {
        if (line[col] === "1") g.fillRect(x + col * px, y + row2 * px, px, px);
      }
    }
  }
  function drawWith(g, table, gw, gh, text, x, y, color, scale2) {
    const s = text == null ? "" : String(text).toUpperCase();
    const px = Math.max(1, scale2 | 0);
    g.fillStyle = color;
    let cx = Math.round(x);
    const cy = Math.round(y);
    for (let i = 0; i < s.length; i += 1) {
      const rows = table[s[i]] || table[s[i].toUpperCase()];
      if (!rows) {
        cx += (gw + 1) * px;
        continue;
      }
      blitGlyph(g, rows, cx, cy, px);
      cx += (gw + 1) * px;
    }
    return { w: cx - Math.round(x), h: gh * px };
  }
  function drawText(g, text, x, y, color = "#f4f1ea", scale2 = 1) {
    return drawWith(g, G3, GLYPH_W, GLYPH_H, text, x, y, color, scale2);
  }
  function drawText5(g, text, x, y, color = "#f4f1ea", scale2 = 1) {
    return drawWith(g, G5, GLYPH5_W, GLYPH5_H, text, x, y, color, scale2);
  }
  function drawTextOutlined(g, text, x, y, color, scale2, big) {
    const fn = big ? drawText5 : drawText;
    const ink = "#1b1530";
    const px = Math.round(x);
    const py = Math.round(y);
    fn(g, text, px - 1, py, ink, scale2);
    fn(g, text, px + 1, py, ink, scale2);
    fn(g, text, px, py - 1, ink, scale2);
    fn(g, text, px, py + 1, ink, scale2);
    return fn(g, text, px, py, color, scale2);
  }
  function drawCjk(g, text, x, y, color = "#f4f1ea", size = 8) {
    if (!text) return;
    g.save();
    g.imageSmoothingEnabled = false;
    g.fillStyle = color;
    g.font = `${size | 0}px "Songti SC","Noto Sans SC","PingFang SC",sans-serif`;
    g.textBaseline = "top";
    g.fillText(String(text), Math.round(x), Math.round(y));
    g.restore();
  }
  function drawBilingual(g, en, zh, x, y, color = "#f4f1ea", scale2 = 1) {
    const m = drawTextOutlined(g, en, x, y, color, scale2, false);
    if (zh) drawCjk(g, zh, x, y + m.h + 2, color, 8);
    return m;
  }

  // src/render/procedural.js
  var cache = /* @__PURE__ */ new Map();
  function makeBuf(w, h) {
    const data = new Uint8Array(w * h);
    return {
      w,
      h,
      data,
      p(x, y, i) {
        if (i && x >= 0 && y >= 0 && x < w && y < h) data[y * w + x] = i;
      },
      rect(x, y, rw, rh, i) {
        const x0 = x | 0;
        const y0 = y | 0;
        for (let yy = 0; yy < rh; yy += 1) {
          const py = y0 + yy;
          if (py < 0 || py >= h) continue;
          for (let xx = 0; xx < rw; xx += 1) {
            const px = x0 + xx;
            if (px < 0 || px >= w) continue;
            data[py * w + px] = i;
          }
        }
      },
      hline(x, y, len, i) {
        this.rect(x, y, len, 1, i);
      },
      vline(x, y, len, i) {
        this.rect(x, y, 1, len, i);
      },
      disk(cx, cy, r, i) {
        const rr = r * r;
        for (let yy = -r; yy <= r; yy += 1) {
          for (let xx = -r; xx <= r; xx += 1) {
            if (xx * xx + yy * yy <= rr) this.p(cx + xx, cy + yy, i);
          }
        }
      },
      shade(x, y, rw, rh, dark, mid, lite) {
        this.rect(x, y, rw, rh, mid);
        this.rect(x, y, rw, 1, lite);
        this.rect(x, y, 1, rh, lite);
        this.rect(x, y + rh - 1, rw, 1, dark);
        this.rect(x + rw - 1, y, 1, rh, dark);
      },
      outline(ink) {
        const next = new Uint8Array(data);
        const { w: bw, h: bh } = this;
        for (let y = 0; y < bh; y += 1) {
          for (let x = 0; x < bw; x += 1) {
            const i = y * bw + x;
            if (data[i] !== 0) continue;
            const hit = x > 0 && data[i - 1] || x < bw - 1 && data[i + 1] || y > 0 && data[i - bw] || y < bh - 1 && data[i + bw];
            if (hit) next[i] = ink;
          }
        }
        this.data = next;
      }
    };
  }
  function hexToRgb(hex) {
    const h = hex.charAt(0) === "#" ? hex.slice(1) : hex;
    const n = parseInt(h.length === 3 ? h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2) : h, 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255, 255];
  }
  function blit(g, ox2, oy2, buf, pal) {
    const { w, h, data } = buf;
    const img = g.createImageData(w, h);
    const px = img.data;
    for (let i = 0; i < data.length; i += 1) {
      const idx = data[i];
      if (!idx) continue;
      const c = pal[idx] || pal[1];
      const o = i * 4;
      px[o] = c[0];
      px[o + 1] = c[1];
      px[o + 2] = c[2];
      px[o + 3] = c[3];
    }
    g.putImageData(img, ox2, oy2);
  }
  function rgbPal(list2) {
    const out = [null];
    for (let i = 0; i < list2.length; i += 1) out.push(hexToRgb(list2[i]));
    return out;
  }
  function bake(w, h, n, palHex, paint2, extra) {
    const pal = rgbPal(palHex);
    const c = document.createElement("canvas");
    c.width = w * n;
    c.height = h;
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    for (let f = 0; f < n; f += 1) {
      const b = makeBuf(w, h);
      paint2(b, f);
      b.outline(1);
      blit(g, f * w, 0, b, pal);
    }
    return {
      canvas: c,
      frameW: w,
      frameH: h,
      frames: n,
      fps: extra && extra.fps ? extra.fps : 8,
      anchorX: extra && extra.ax != null ? extra.ax : w >> 1,
      anchorY: extra && extra.ay != null ? extra.ay : h - 2
    };
  }
  function paintDeepseek(b, f) {
    const bob = f % 2;
    const step2 = f % 2;
    const swing = f === 1 || f === 2 ? 1 : 0;
    b.shade(18, 2 + bob, 8, 5, 2, 3, 4);
    b.rect(22, 6 + bob, 6, 3, 4);
    b.rect(24, 8 + bob, 5, 2, 5);
    b.p(28, 9 + bob, 5);
    b.shade(10, 4 + bob, 12, 6, 2, 3, 4);
    b.rect(12, 3 + bob, 8, 2, 4);
    b.shade(12, 8 + bob, 8, 7, 6, 7, 8);
    b.p(14, 11 + bob, 1);
    b.p(17, 11 + bob, 1);
    b.p(15, 13 + bob, 9);
    b.shade(11, 15 + bob, 10, 10, 2, 3, 5);
    b.rect(13, 16 + bob, 6, 6, 5);
    b.rect(14, 17 + bob, 4, 2, 4);
    b.rect(12 + step2, 25 + bob, 3, 7 - bob, 2);
    b.rect(17 - step2, 25 + bob, 3, 7 - bob, 3);
    b.rect(12 + step2, 31, 3, 2, 1);
    b.rect(17 - step2, 31, 3, 2, 1);
    b.rect(6 - swing, 14 + bob, 4, 2, 10);
    b.rect(5 - swing, 16 + bob, 3, 12, 9);
    b.rect(6 - swing, 16 + bob, 1, 12, 10);
    b.rect(22 + swing, 14 + bob, 4, 2, 10);
    b.rect(24 + swing, 16 + bob, 3, 12, 9);
    b.rect(25 + swing, 16 + bob, 1, 12, 10);
  }
  function paintKimi(b, f) {
    const bob = f % 2;
    const step2 = f % 2;
    b.shade(9, 14 + bob, 14, 16, 2, 3, 4);
    b.rect(11, 16 + bob, 10, 10, 3);
    b.p(12, 18 + bob, 8);
    b.p(18, 20 + bob, 8);
    b.p(14, 22 + bob, 5);
    b.p(20, 17 + bob, 8);
    b.rect(10, 24 + bob, 12, 2, 5);
    b.shade(12, 6 + bob, 8, 8, 6, 7, 7);
    b.rect(13, 4 + bob, 6, 3, 2);
    b.rect(11, 7 + bob, 3, 6, 2);
    b.p(14, 9 + bob, 1);
    b.p(17, 9 + bob, 1);
    const sx = 24;
    b.rect(sx, 4 + bob, 2, 28, 5);
    b.rect(sx - 1, 4 + bob, 4, 2, 8);
    b.rect(sx - 3, 6 + bob, 2, 6, 8);
    b.rect(sx + 3, 6 + bob, 2, 6, 8);
    b.p(sx - 4, 8 + bob, 8);
    b.p(sx + 5, 8 + bob, 8);
    b.rect(12 + step2, 30, 3, 4, 2);
    b.rect(17 - step2, 30, 3, 4, 2);
  }
  function paintGlm(b, f) {
    const bob = f % 2;
    const step2 = f % 2;
    b.shade(3, 12 + bob, 8, 16, 5, 6, 8);
    b.rect(5, 14 + bob, 4, 12, 6);
    b.rect(6, 16 + bob, 2, 8, 8);
    b.p(7, 18 + bob, 5);
    b.shade(11, 14 + bob, 11, 12, 2, 3, 4);
    b.rect(13, 16 + bob, 7, 8, 4);
    b.rect(14, 18 + bob, 5, 2, 5);
    b.shade(13, 6 + bob, 8, 8, 7, 7, 7);
    b.rect(14, 4 + bob, 6, 3, 2);
    b.p(15, 9 + bob, 1);
    b.p(18, 9 + bob, 1);
    b.rect(24, 10 + bob + step2, 7, 6, 5);
    b.rect(25, 11 + bob + step2, 5, 4, 8);
    b.rect(26, 16 + bob + step2, 3, 12, 6);
    b.rect(13 + step2, 26 + bob, 3, 8 - bob, 2);
    b.rect(18 - step2, 26 + bob, 3, 8 - bob, 3);
  }
  function paintHaiku(b, f) {
    const bob = f % 2;
    const step2 = f % 2;
    b.shade(10, 12 + bob, 10, 12, 2, 3, 4);
    b.rect(12, 14 + bob, 6, 6, 4);
    b.rect(10, 18 + bob, 10, 2, 6);
    b.rect(20, 8 + bob, 2, 10, 6);
    b.rect(21, 6 + bob, 4, 3, 6);
    b.shade(11, 5 + bob, 8, 7, 3, 4, 4);
    b.rect(12, 3 + bob, 6, 3, 5);
    b.p(13, 8 + bob, 1);
    b.p(16, 8 + bob, 1);
    b.rect(22, 16 + bob, 8, 1, 7);
    b.rect(21, 15 + bob, 2, 3, 6);
    b.p(30, 16 + bob, 4);
    b.rect(12 + step2, 24 + bob, 3, 7 - bob, 2);
    b.rect(16 - step2, 24 + bob, 3, 7 - bob, 3);
  }
  function paintSonnet(b, f) {
    const bob = f % 2;
    const halo = f;
    b.shade(8, 16 + bob, 6, 18, 6, 7, 6);
    b.shade(22, 16 + bob, 6, 18, 6, 7, 6);
    b.shade(12, 16 + bob, 12, 18, 2, 3, 4);
    b.rect(14, 18 + bob, 8, 10, 4);
    b.rect(13, 28 + bob, 10, 2, 5);
    b.shade(14, 8 + bob, 8, 8, 3, 4, 4);
    b.rect(15, 5 + bob, 6, 4, 5);
    b.rect(22, 6 + bob, 4, 8, 7);
    b.p(16, 11 + bob, 1);
    b.p(19, 11 + bob, 1);
    const cx = 18;
    const cy = 14 + bob;
    for (let i = 0; i < 8; i += 1) {
      const a = (i + halo) * 0.785;
      const x = Math.round(cx + Math.cos(a) * 12);
      const y = Math.round(cy + Math.sin(a) * 6);
      b.p(x, y, 5);
      b.p(x + 1, y, 8);
    }
    b.disk(cx, cy - 10, 2, 5);
  }
  function paintOpus(b, f) {
    const bob = f % 2;
    const beat = f % 2 ? 1 : 0;
    for (let i = 0; i < 3; i += 1) {
      const y = 14 + i * 9 + bob;
      const span = 16 - i * 2;
      b.rect(2 + i, y, span, 5, 6);
      b.rect(3 + i, y + 1, span - 2, 3, 8);
      b.rect(4 + i, y + 2, 3, 1, 5);
      b.disk(5 + i, y + 2, 2, 5);
      b.rect(46 + i, y, span, 5, 6);
      b.rect(47 + i, y + 1, span - 2, 3, 8);
      b.disk(58 - i, y + 2, 2, 5);
    }
    b.shade(24, 24 + bob, 16, 22, 2, 3, 4);
    b.rect(26, 26 + bob, 12, 14, 4);
    b.rect(28, 28 + bob, 8, 3, 6);
    b.disk(32, 36 + bob, 4, 9);
    b.disk(32, 36 + bob, 2, 4);
    b.p(32, 36 + bob, 8);
    b.shade(26, 10 + bob, 12, 12, 3, 4, 4);
    b.rect(27, 6 + bob, 10, 6, 5);
    b.rect(24, 10 + bob, 4, 10, 5);
    b.rect(36, 10 + bob, 4, 10, 5);
    b.p(30, 15 + bob, 1);
    b.p(35, 15 + bob, 1);
    b.hline(31, 18 + bob, 3, 9);
    b.rect(22, 4 + bob, 20, 2, 6);
    b.rect(30, 2 + bob, 4, 4, 8);
    b.rect(44 + beat, 2 + bob, 5, 44, 7);
    b.rect(43 + beat, 2 + bob, 7, 8, 6);
    b.rect(45 + beat, 4 + bob, 2, 40, 8);
    b.rect(26, 46 + bob, 5, 12 - bob, 2);
    b.rect(34, 46 + bob, 5, 12 - bob, 3);
  }
  function paintAstra(b, f) {
    const bob = f % 2;
    const wing = f % 2;
    b.shade(2, 14 + bob, 12, 10, 2, 3, 4);
    b.shade(34, 14 + bob, 12, 10, 2, 3, 4);
    b.rect(2, 16 + bob, 10, 4, 4);
    b.rect(36, 16 + bob, 10, 4, 4);
    b.rect(1 + wing, 18 + bob, 8, 6, 3);
    b.rect(39 - wing, 18 + bob, 8, 6, 3);
    b.rect(30, 40 + bob, 10, 3, 3);
    b.rect(38, 38 + bob, 6, 3, 4);
    b.p(44, 38 + bob, 9);
    b.shade(16, 22 + bob, 16, 22, 2, 3, 4);
    b.rect(18, 24 + bob, 12, 14, 4);
    b.rect(16, 22 + bob, 16, 4, 6);
    b.rect(22, 24 + bob, 4, 4, 5);
    b.p(23, 25 + bob, 8);
    b.p(25, 25 + bob, 8);
    b.p(24, 26 + bob, 5);
    b.shade(18, 10 + bob, 12, 12, 7, 7, 4);
    b.rect(16, 10 + bob, 4, 18, 3);
    b.rect(28, 10 + bob, 5, 20, 4);
    b.rect(29, 12 + bob, 3, 16, 9);
    b.rect(20, 6 + bob, 8, 6, 4);
    b.rect(17, 4 + bob, 3, 5, 2);
    b.rect(16, 4 + bob, 2, 2, 6);
    b.rect(28, 4 + bob, 3, 5, 2);
    b.rect(30, 4 + bob, 2, 2, 6);
    b.p(21, 14 + bob, 1);
    b.p(26, 14 + bob, 1);
    b.rect(20, 44 + bob, 4, 6, 3);
    b.rect(26, 44 + bob, 4, 6, 2);
  }
  function paintFable(b, f) {
    const flicker = f % 2;
    b.rect(8, 8, 20, 6, 2);
    b.rect(10, 6, 16, 4, 3);
    b.shade(10, 12, 16, 22, 2, 3, 4);
    b.rect(12, 14, 12, 16, 3);
    b.rect(14, 10, 8, 6, 2);
    b.rect(16, 12, 4, 3, 1);
    b.vline(15 + flicker, 14, 16, 5);
    b.vline(20, 16, 12, 6);
    b.hline(12, 20, 12, 5);
    b.rect(18, 24, 6, 1, 6);
    b.p(13, 18, 6);
    b.p(22, 28, 5);
    b.rect(8, 32, 6, 6, 2);
    b.rect(22, 32, 6, 6, 3);
  }
  function paintHand(b, f) {
    const pulse2 = f % 2;
    b.shade(14, 14, 36, 18, 2, 3, 4);
    b.rect(16, 16, 32, 14, 3);
    for (let i = 0; i < 4; i += 1) {
      const x = 16 + i * 9;
      b.shade(x, 2, 7, 16, 2, 3, 4);
      b.rect(x + 1, 4, 5, 12, 3);
      b.rect(x + 2, 2, 3, 3, 4);
    }
    b.shade(4, 18, 12, 8, 2, 3, 4);
    b.rect(4, 20, 10, 5, 3);
    b.rect(28, 8, 2, 20, 5);
    b.rect(22, 18, 16, 2, 5);
    b.rect(36, 12 + pulse2, 2, 14, 6);
    b.p(24, 22, 6);
    b.p(40, 16, 5);
    b.p(18, 10, 6);
  }
  function paintDario(b, f) {
    const scan = f;
    b.shade(4, 20, 24, 10, 2, 3, 3);
    b.rect(6, 22, 20, 6, 3);
    b.rect(14, 20, 4, 8, 5);
    b.shade(8, 8, 16, 14, 6, 6, 6);
    b.rect(10, 10, 12, 10, 6);
    b.rect(8, 6, 16, 5, 2);
    b.rect(7, 8, 4, 7, 2);
    b.rect(21, 8, 4, 6, 2);
    b.rect(10, 13, 5, 4, 5);
    b.rect(17, 13, 5, 4, 5);
    b.hline(15, 14, 2, 5);
    b.p(12, 14, 1);
    b.p(19, 14, 1);
    b.hline(13, 20, 6, 2);
    b.p(18, 19, 2);
    for (let y = 8; y < 30; y += 2) {
      if ((y + scan) % 4 === 0) b.hline(6, y, 20, 4);
    }
  }
  function paintStele(b, f) {
    const glow = f % 2 ? 6 : 5;
    b.shade(4, 4, 16, 26, 2, 3, 4);
    b.rect(6, 6, 12, 22, 3);
    b.hline(7, 10, 10, 1);
    b.hline(7, 14, 10, 1);
    b.hline(8, 18, 8, 1);
    b.disk(12, 24, 3, glow);
    b.disk(12, 24, 1, 1);
  }
  function paintFlask(b, f, kind) {
    b.shade(2, 4, 12, 10, 2, 3, 4);
    b.rect(3, 5, 10, 8, 3);
    const spin = f;
    b.disk(8, 9, 3, 5);
    b.p(8 + spin % 2, 8, 4);
    b.p(8, 9, 6);
    b.rect(4, 14, 2, 2, 7);
    b.rect(8, 14, 2, 2, 7);
    b.rect(12, 14, 2, 2, 7);
    if (kind === 0) {
      b.hline(4, 6, 8, 6);
    } else if (kind === 1) {
      b.rect(5, 6, 2, 3, 6);
      b.rect(8, 6, 3, 1, 6);
      b.rect(8, 8, 3, 1, 6);
    } else {
      b.rect(5, 6, 6, 1, 6);
      b.rect(5, 6, 2, 3, 6);
      b.rect(5, 8, 5, 1, 6);
    }
  }
  function paintFin(b, f) {
    const t2 = f ? 1 : 0;
    b.rect(2, 5, 8, 3, 3);
    b.rect(3, 4, 6, 5, 4);
    b.p(1, 6, 4);
    b.rect(8, 5 + t2, 3, 2, 5);
    b.p(6, 6, 5);
  }
  function paintOrb(b, f) {
    b.disk(6, 6, 4, 3);
    b.disk(6, 6, 3, 4);
    b.disk(6, 6, 1, 5);
    if (f) {
      b.p(2, 2, 5);
      b.p(10, 3, 5);
      b.p(3, 10, 4);
    }
  }
  function paintBolt(b) {
    b.rect(3, 3, 6, 6, 3);
    b.rect(4, 4, 4, 4, 5);
    b.rect(5, 2, 2, 8, 4);
    b.p(6, 6, 6);
  }
  function paintPetal(b, f) {
    b.disk(6, 6, 4, 3);
    b.rect(5, 2, 3, 8, 4);
    b.p(6, 6, 5);
    if (f) b.p(9, 4, 5);
  }
  function paintGlyph(b, f) {
    b.rect(3, 3, 7, 7, 3);
    b.rect(4, 4, 5, 5, 4);
    b.p(6, 6, 5);
    b.p(4, 4, 5);
    b.p(8, 8, 5);
    if (f) b.rect(5, 2, 3, 1, 5);
  }
  function paintQuill(b) {
    b.rect(2, 5, 9, 2, 4);
    b.rect(8, 4, 3, 4, 3);
    b.p(11, 6, 5);
    b.p(3, 6, 2);
  }
  function paintFeather(b, f) {
    b.rect(3, 4, 7, 4, 3);
    b.rect(4, 3, 5, 6, 4);
    b.p(2, 6, 5);
    b.p(9, 5 + (f ? 1 : 0), 5);
  }
  function paintNode(b, f) {
    b.disk(6, 6, 3, 3);
    b.disk(6, 6, 2, 5);
    b.hline(1, 6, 10, 4);
    if (f) b.disk(6, 6, 1, 6);
  }
  function paintWhale(b) {
    b.rect(2, 5, 8, 3, 3);
    b.rect(8, 4, 3, 2, 4);
    b.rect(8, 7, 3, 2, 4);
    b.p(1, 6, 5);
  }
  function paintStar(b, f) {
    b.disk(6, 6, 3, 4);
    b.p(6, 2, 5);
    b.p(6, 10, 5);
    b.p(2, 6, 5);
    b.p(10, 6, 5);
    if (f) {
      b.p(3, 3, 5);
      b.p(9, 9, 5);
    }
  }
  function paintHammerBolt(b) {
    b.rect(3, 4, 7, 5, 3);
    b.rect(4, 5, 5, 3, 5);
    b.rect(5, 2, 3, 8, 4);
  }
  var PAL = {
    deepseek: ["#1b1530", "#163056", "#2f6fe4", "#7eb6ff", "#d7f4ff", "#c48a72", "#f0c8b4", "#ffe8dc", "#5ad8ff", "#9ef6ff", "#ffffff"],
    kimi: ["#1b1530", "#121a33", "#24365c", "#3a5078", "#8aa0c8", "#d8b15a", "#e8d0b0", "#f4f1ea", "#d5deea"],
    glm: ["#1b1530", "#3a1860", "#6d3fa0", "#9a6ad4", "#d4b0ff", "#8a6a20", "#d8b15a", "#f4e0a8", "#f0c8b4"],
    haiku: ["#1b1530", "#c8b8a8", "#f4f1ea", "#ffffff", "#d0c4b0", "#e07a5f", "#f0c8b4", "#f4e8a0"],
    sonnet: ["#1b1530", "#c8b8a0", "#f4f1ea", "#ffffff", "#d8b15a", "#8a3a28", "#e07a5f", "#ffe08a"],
    opus: ["#1b1530", "#c8b8a0", "#f4f1ea", "#ffffff", "#8a6a20", "#d8b15a", "#c23b3b", "#ffe08a", "#e07a5f"],
    astra: ["#1b1530", "#b8c4d0", "#e8eef4", "#ffffff", "#d8b15a", "#2a2438", "#f0c8b4", "#c8b8e0", "#c5b4e8"],
    fable: ["#1b1530", "#140818", "#2a1038", "#4a2060", "#d8b15a", "#ffe08a"],
    dario: ["#1b1530", "#0a2024", "#10343a", "#1a5058", "#7ad4c8", "#d8b15a", "#f4f1ea"],
    stele: ["#1b1530", "#6a6054", "#cfc6b8", "#efeae2", "#8a8074", "#c23b3b", "#ff6a6a"],
    flask: ["#1b1530", "#0a2818", "#1a5a32", "#3ddc84", "#9dff9a", "#ffffff", "#d8b15a"],
    fin: ["#1b1530", "#163056", "#2f6fe4", "#7ee0ff", "#ffffff"],
    orb: ["#1b1530", "#24365c", "#8aa0c8", "#f4f1ea", "#ffffff"],
    bolt: ["#1b1530", "#3a1860", "#9a6ad4", "#d8b15a", "#f4e0a8", "#ffffff"],
    petal: ["#1b1530", "#8a3a28", "#e07a5f", "#f4c4b0", "#ffffff"],
    glyph: ["#1b1530", "#8a6a20", "#d8b15a", "#ffe08a", "#ffffff"],
    quill: ["#1b1530", "#c8b8a8", "#f4f1ea", "#e07a5f", "#ffffff"],
    feather: ["#1b1530", "#c8b8a0", "#f4e8d0", "#d8b15a", "#ffffff"],
    node: ["#1b1530", "#8a6a20", "#d8b15a", "#ffe08a", "#ffffff", "#e07a5f"],
    whale: ["#1b1530", "#163056", "#2f6fe4", "#7ee0ff", "#ffffff"],
    star: ["#1b1530", "#24365c", "#d8b15a", "#f4f1ea", "#ffffff"],
    hammer: ["#1b1530", "#3a1860", "#9a6ad4", "#d8b15a", "#ffffff"]
  };
  var BUILDERS = {
    deepseek: () => bake(32, 34, 4, PAL.deepseek, paintDeepseek, { ax: 16, ay: 32, fps: 8 }),
    kimi: () => bake(32, 34, 4, PAL.kimi, paintKimi, { ax: 16, ay: 32, fps: 8 }),
    glm: () => bake(32, 34, 4, PAL.glm, paintGlm, { ax: 16, ay: 32, fps: 8 }),
    haiku: () => bake(32, 32, 4, PAL.haiku, paintHaiku, { ax: 16, ay: 30, fps: 6 }),
    sonnet: () => bake(40, 44, 4, PAL.sonnet, paintSonnet, { ax: 20, ay: 42, fps: 6 }),
    opus: () => bake(64, 64, 4, PAL.opus, paintOpus, { ax: 32, ay: 62, fps: 5 }),
    astra: () => bake(48, 52, 4, PAL.astra, paintAstra, { ax: 24, ay: 50, fps: 6 }),
    fable: () => bake(36, 40, 4, PAL.fable, paintFable, { ax: 18, ay: 38, fps: 4 }),
    fablehand: () => bake(64, 40, 4, PAL.fable, paintHand, { ax: 32, ay: 36, fps: 4 }),
    dario: () => bake(32, 32, 4, PAL.dario, paintDario, { ax: 16, ay: 30, fps: 8 }),
    stele: () => bake(24, 32, 2, PAL.stele, paintStele, { ax: 12, ay: 30, fps: 3 }),
    flask_rtx: () => bake(16, 16, 4, PAL.flask, (b, f) => paintFlask(b, f, 0), { ax: 8, ay: 15, fps: 10 }),
    flask_h200: () => bake(16, 16, 4, PAL.flask, (b, f) => paintFlask(b, f, 1), { ax: 8, ay: 15, fps: 10 }),
    flask_b200: () => bake(16, 16, 4, PAL.flask, (b, f) => paintFlask(b, f, 2), { ax: 8, ay: 15, fps: 10 }),
    fin: () => bake(12, 12, 2, PAL.fin, paintFin, { ax: 6, ay: 6, fps: 12 }),
    orb: () => bake(12, 12, 2, PAL.orb, paintOrb, { ax: 6, ay: 6, fps: 8 }),
    bolt: () => bake(12, 12, 2, PAL.bolt, paintBolt, { ax: 6, ay: 6, fps: 10 }),
    petal: () => bake(12, 12, 2, PAL.petal, paintPetal, { ax: 6, ay: 6, fps: 8 }),
    glyph: () => bake(12, 12, 2, PAL.glyph, paintGlyph, { ax: 6, ay: 6, fps: 8 }),
    quill: () => bake(12, 12, 2, PAL.quill, paintQuill, { ax: 6, ay: 6, fps: 10 }),
    feather: () => bake(12, 12, 2, PAL.feather, paintFeather, { ax: 6, ay: 6, fps: 8 }),
    node: () => bake(12, 12, 2, PAL.node, paintNode, { ax: 6, ay: 6, fps: 8 }),
    whale: () => bake(12, 12, 2, PAL.whale, paintWhale, { ax: 6, ay: 6, fps: 10 }),
    star: () => bake(12, 12, 2, PAL.star, paintStar, { ax: 6, ay: 6, fps: 8 }),
    hammer: () => bake(12, 12, 2, PAL.hammer, paintHammerBolt, { ax: 6, ay: 6, fps: 10 })
  };
  var FAMILY_ALIAS = [
    ["boss.p3", "opus"],
    ["boss.p2", "sonnet"],
    ["boss.p1", "haiku"],
    ["boss", "haiku"],
    ["fable.hand", "fablehand"],
    ["hand", "fablehand"],
    ["flask.rtx", "flask_rtx"],
    ["rtx5090", "flask_rtx"],
    ["flask.h200", "flask_h200"],
    ["h200", "flask_h200"],
    ["flask.b200", "flask_b200"],
    ["b200", "flask_b200"],
    ["deepseek", "deepseek"],
    ["kimi", "kimi"],
    ["glm", "glm"],
    ["haiku", "haiku"],
    ["sonnet", "sonnet"],
    ["opus", "opus"],
    ["astra", "astra"],
    ["fable", "fable"],
    ["dario", "dario"],
    ["stele", "stele"],
    ["whale", "whale"],
    ["fin", "fin"],
    ["orb", "orb"],
    ["bolt", "bolt"],
    ["petal", "petal"],
    ["glyph", "glyph"],
    ["quill", "quill"],
    ["feather", "feather"],
    ["node", "node"],
    ["star", "star"],
    ["hammer", "hammer"]
  ];
  function familyOf2(id) {
    const key = String(id || "").toLowerCase();
    for (let i = 0; i < FAMILY_ALIAS.length; i += 1) {
      if (key.indexOf(FAMILY_ALIAS[i][0]) >= 0) return FAMILY_ALIAS[i][1];
    }
    return "deepseek";
  }
  function getSheet(family) {
    const fam = BUILDERS[family] ? family : familyOf2(family);
    let s = cache.get(fam);
    if (!s) {
      const builder = BUILDERS[fam] || BUILDERS.deepseek;
      s = builder();
      cache.set(fam, s);
    }
    return s;
  }
  function whiteOf(sheet) {
    if (sheet._flash) return sheet._flash;
    const src = sheet.canvas;
    const c = document.createElement("canvas");
    c.width = src.width;
    c.height = src.height;
    const g = c.getContext("2d");
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = "source-in";
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, c.width, c.height);
    sheet._flash = c;
    return c;
  }
  function draw(g, id, x, y, opts = {}) {
    const fam = familyOf2(id);
    const sheet = getSheet(fam);
    const frames = sheet.frames || 1;
    let frame2 = opts.frame | 0;
    if (opts.pose === "hurt" || opts.flash) frame2 = Math.min(frames - 1, frame2);
    frame2 = (frame2 % frames + frames) % frames;
    const fw = sheet.frameW;
    const fh = sheet.frameH;
    const ax = sheet.anchorX;
    const ay = sheet.anchorY;
    const img = opts.flash ? whiteOf(sheet) : sheet.canvas;
    const squash = opts.squash || 1;
    const stretch = opts.stretch || 1;
    const sc = opts.scale || 1;
    g.save();
    g.imageSmoothingEnabled = false;
    g.globalAlpha = opts.alpha == null ? 1 : opts.alpha;
    g.translate(Math.round(x), Math.round(y));
    if (opts.flip) g.scale(-1, 1);
    g.scale(sc * stretch, sc * squash);
    g.drawImage(img, frame2 * fw, 0, fw, fh, Math.round(-ax), Math.round(-ay), fw, fh);
    g.restore();
  }
  var PROC_IDS = Object.keys(BUILDERS);
  function warmup() {
    const keys = Object.keys(BUILDERS);
    for (let i = 0; i < keys.length; i += 1) getSheet(keys[i]);
  }

  // src/render/room.js
  var PHASE_BG = { 1: "v2_room_p1", 2: "v2_room_p2", 3: "v2_room_p3" };
  var DARIO_HOLO_SIZE = 40;
  var DARIO_HOLO = Object.freeze({
    cx: ROOM_BG.x + (ROOM_BG.w >> 1),
    top: ROOM_BG.y + 24,
    size: DARIO_HOLO_SIZE,
    x: ROOM_BG.x + (ROOM_BG.w >> 1) - (DARIO_HOLO_SIZE >> 1),
    y: ROOM_BG.y + 24
  });
  var ARENA_SETTING = Object.freeze({ zh: "548 Market Street", en: "548 Market Street" });
  var motes = [];
  for (let i = 0; i < 28; i += 1) {
    motes.push({
      x: 90 + Math.random() * 460,
      y: 30 + Math.random() * 300,
      s: 1 + i % 2,
      v: 4 + Math.random() * 10,
      p: Math.random() * Math.PI * 2
    });
  }
  function ready(img) {
    return !!(img && img.complete && img.naturalWidth > 0 && !(img.dataset && img.dataset.dead === "1"));
  }
  function fillGutter(g) {
    g.fillStyle = "#0b0a12";
    g.fillRect(0, 0, INTERNAL_W, INTERNAL_H);
    g.fillStyle = "#14101c";
    g.fillRect(HUD_LEFT.x, HUD_LEFT.y, HUD_LEFT.w, HUD_LEFT.h);
    g.fillRect(HUD_RIGHT.x, HUD_RIGHT.y, HUD_RIGHT.w, HUD_RIGHT.h);
    g.fillStyle = "#d8b15a";
    g.fillRect(78, 0, 2, INTERNAL_H);
    g.fillRect(560, 0, 2, INTERNAL_H);
  }
  function skyBehind(g, t2) {
    g.fillStyle = "#6aa8d8";
    g.fillRect(ROOM_BG.x, 0, ROOM_BG.w, ROOM_BG.y + 8);
    g.fillStyle = "#9cc9f0";
    g.fillRect(ROOM_BG.x, 0, ROOM_BG.w, 14);
    g.fillStyle = "rgba(244,241,234,0.35)";
    const c = Math.round(t2 * 8 % 120);
    g.fillRect(ROOM_BG.x + 20 + c, 4, 40, 6);
    g.fillRect(ROOM_BG.x + 180 + (120 - c), 6, 50, 5);
    g.fillRect(ROOM_BG.x + 320, 3, 36, 5);
  }
  function proceduralCathedral(g, t2) {
    const tile = ROOM.tile;
    for (let y2 = ROOM.y; y2 < ROOM.y + ROOM.h; y2 += tile) {
      for (let x2 = ROOM.x; x2 < ROOM.x + ROOM.w; x2 += tile) {
        const alt = ((x2 / tile | 0) + (y2 / tile | 0)) % 2 === 0;
        g.fillStyle = alt ? "#f4f1ea" : "#e7e0d4";
        g.fillRect(x2, y2, tile, tile);
        g.fillStyle = "rgba(216,177,90,0.28)";
        g.fillRect(x2, y2, tile, 1);
        g.fillRect(x2, y2, 1, tile);
      }
    }
    const cx = ROOM.x + (ROOM.w >> 1);
    const cy = ROOM.y + (ROOM.h >> 1);
    g.strokeStyle = PALETTE.gold;
    g.lineWidth = 2;
    g.beginPath();
    g.arc(cx, cy, 28, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.arc(cx, cy, 10, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = PALETTE.gold;
    g.fillRect(cx - 1, cy - 18, 2, 36);
    g.fillRect(cx - 18, cy - 1, 36, 2);
    for (let i = 0; i < 4; i += 1) {
      const a = i * Math.PI * 0.5;
      g.fillRect(Math.round(cx + Math.cos(a) * 36) - 1, Math.round(cy + Math.sin(a) * 36) - 1, 8, 2);
    }
    const { x, y, w, h, wall } = ROOM;
    g.fillStyle = "#1b1530";
    g.fillRect(x, y, w, wall);
    g.fillRect(x, y + h - wall, w, wall);
    g.fillRect(x, y, wall, h);
    g.fillRect(x + w - wall, y, wall, h);
    g.fillStyle = "#d8b15a";
    g.fillRect(x + 2, y + 2, w - 4, 2);
    g.fillRect(x + 2, y + h - 4, w - 4, 2);
    g.fillStyle = PALETTE.sky;
    for (let i = 0; i < 4; i += 1) {
      const wx = x + 48 + i * 96;
      g.fillStyle = PALETTE.sky;
      g.fillRect(wx, y + 3, 28, 10);
      g.fillStyle = "rgba(255,255,255,0.4)";
      g.fillRect(wx + 2 + Math.round((t2 * 6 + i * 10) % 8), y + 4, 10, 3);
    }
    const spots = [[x + 48, y + 48], [x + w - 64, y + 48]];
    for (let i = 0; i < spots.length; i += 1) {
      g.fillStyle = "#1b1530";
      g.fillRect(spots[i][0] - 1, spots[i][1] - 1, 14, 30);
      g.fillStyle = "#f4f1ea";
      g.fillRect(spots[i][0], spots[i][1], 12, 28);
      g.fillStyle = PALETTE.gold;
      g.fillRect(spots[i][0], spots[i][1], 12, 3);
    }
  }
  function lightShafts(g, t2) {
    g.save();
    g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 4; i += 1) {
      const x = ROOM_BG.x + 70 + i * 90 + Math.sin(t2 * 0.4 + i) * 6;
      g.fillStyle = `rgba(244,232,180,${0.045 + Math.sin(t2 * 0.8 + i) * 0.02})`;
      g.beginPath();
      g.moveTo(x, ROOM_BG.y + 8);
      g.lineTo(x + 18, ROOM_BG.y + 8);
      g.lineTo(x + 36, ROOM_BG.y + 250);
      g.lineTo(x - 10, ROOM_BG.y + 250);
      g.closePath();
      g.fill();
    }
    g.fillStyle = "rgba(244,241,234,0.55)";
    for (let i = 0; i < motes.length; i += 1) {
      const m = motes[i];
      const y = (m.y - t2 * m.v + Math.sin(t2 + m.p) * 8) % 300;
      g.fillRect(Math.round(m.x + Math.sin(t2 * 0.6 + m.p) * 10), Math.round(ROOM_BG.y + 10 + y), m.s, m.s);
    }
    g.restore();
  }
  function drawBossRoom(g, ctx2, t2) {
    applyScreen(g);
    fillGutter(g);
    skyBehind(g, t2);
    const phase = ctx2.boss && ctx2.boss.phase || 1;
    const img = loadImage(PHASE_BG[phase] || PHASE_BG[1]);
    if (ready(img)) {
      g.imageSmoothingEnabled = false;
      g.drawImage(img, ROOM_BG.x, ROOM_BG.y);
    } else {
      g.fillStyle = "#9cc9f0";
      g.fillRect(ROOM_BG.x, ROOM_BG.y, ROOM_BG.w, ROOM_BG.h);
      applyWorld(g);
      proceduralCathedral(g, t2);
      applyScreen(g);
    }
    lightShafts(g, t2);
    drawArenaSettingLabel(g);
  }
  function drawArenaSettingLabel(g) {
    applyScreen(g);
    const tx = ROOM_BG.x + (ROOM_BG.w >> 1) - 54;
    const ty = ROOM_BG.y + ROOM_BG.h - 12;
    drawSelected(g, ARENA_SETTING, tx, ty, "rgba(244,241,234,0.72)");
  }
  function drawIntro(g, ctx2, t2) {
    applyScreen(g);
    fillGutter(g);
    g.fillStyle = "#12101a";
    g.fillRect(ROOM_BG.x, ROOM_BG.y, ROOM_BG.w, ROOM_BG.h);
    applyWorld(g);
    const room = INTRO_ROOM;
    const tile = room.tile;
    const gold = loadImage("v2_tile_floor_gold_32");
    const useTile = ready(gold);
    for (let y = room.y; y < room.y + room.h; y += tile) {
      for (let x = room.x; x < room.x + room.w; x += tile) {
        if (useTile) {
          g.imageSmoothingEnabled = false;
          g.drawImage(gold, 0, 0, 32, 32, x, y, tile, tile);
        } else {
          const alt = ((x / tile | 0) + (y / tile | 0)) % 2 === 0;
          g.fillStyle = alt ? "#e7e0d4" : "#d4cbb8";
          g.fillRect(x, y, tile, tile);
        }
      }
    }
    g.fillStyle = "#1b1530";
    g.fillRect(room.x, room.y, room.w, room.wall);
    g.fillRect(room.x, room.y + room.h - room.wall, room.w, room.wall);
    g.fillRect(room.x, room.y, room.wall, room.h);
    g.fillRect(room.x + room.w - room.wall, room.y, room.wall, room.h);
    g.fillStyle = PALETTE.gold;
    g.fillRect(room.x + 2, room.y + 2, room.w - 4, 2);
    const door = loadImage("v2_door_open");
    if (ready(door)) {
      g.imageSmoothingEnabled = false;
      g.drawImage(door, INTRO_DOOR.x - 16, INTRO_DOOR.y - 20);
    } else {
      g.fillStyle = PALETTE.sky;
      g.fillRect(INTRO_DOOR.x, INTRO_DOOR.y, INTRO_DOOR.w, INTRO_DOOR.h);
      g.fillStyle = PALETTE.gold;
      g.fillRect(INTRO_DOOR.x, INTRO_DOOR.y, 2, INTRO_DOOR.h);
      g.fillRect(INTRO_DOOR.x + INTRO_DOOR.w - 2, INTRO_DOOR.y, 2, INTRO_DOOR.h);
    }
    drawSelected(g, { zh: "\u8FDB\u5165", en: "ENTER" }, INTRO_DOOR.x - 4, INTRO_DOOR.y + 22, PALETTE.gold);
    drawSelected(g, ARENA_SETTING, room.x + (room.w >> 1) - 54, room.y + 4, PALETTE.sky);
    const hx = room.x + 22;
    const hy = room.y + room.h - 28;
    drawSelected(g, {
      zh: "WASD \u5C04\u51FB \u7FFB\u6EDA \u6280\u80FD \u836F\u5242",
      en: "WASD SHOOT ROLL SKILL Q"
    }, hx, hy, "#1b1530");
    if (ctx2.stele && ctx2.stele.quip > 0) {
      drawSelected(g, { zh: "\u6211\u65E0\u6CD5\u534F\u52A9", en: "I CANT HELP" }, ctx2.stele.x - 22, ctx2.stele.y - 44, "#c23b3b");
    }
    void t2;
  }
  function drawSelected(g, pair, x, y, color) {
    const zh = pair.zh || "";
    const en = pair.en || "";
    const text = bi(pair);
    if (text === zh && zh) {
      drawCjk(g, zh, x, y, color, 8);
      return;
    }
    if (text === en && en) {
      drawTextOutlined(g, en, x, y, color, 1, false);
      return;
    }
    drawBilingual(g, en, zh, x, y, color, 1);
  }
  function fightHoloVisible(ctx2) {
    const st = ctx2.state && ctx2.state.current;
    return st === "fight" || st === "paused";
  }
  function drawHolo(g, ctx2, t2) {
    if (!fightHoloVisible(ctx2)) return;
    applyScreen(g);
    const hx = DARIO_HOLO.x;
    const hy = DARIO_HOLO.y;
    const size = DARIO_HOLO.size;
    g.fillStyle = "rgba(10, 36, 42, 0.72)";
    g.fillRect(hx - 2, hy - 2, size + 4, size + 6);
    g.strokeStyle = "rgba(158,230,220,0.55)";
    g.lineWidth = 1;
    g.strokeRect(hx - 2, hy - 2, size + 4, size + 6);
    const talking = ctx2.holo && !(ctx2.time && ctx2.time.unscaled > ctx2.holo.until);
    const pulse2 = 0.72 + Math.sin(t2 * 3.2) * 0.08;
    const flick = (t2 * 6 | 0) % 17 === 0 ? 0.45 : talking ? 0.95 : pulse2;
    const sheet = loadImage("v2_dario_holo_flicker_sheet");
    const still = loadImage("v2_dario_holo");
    g.save();
    g.globalAlpha = flick;
    g.imageSmoothingEnabled = false;
    if (sheet && sheet.complete && sheet.naturalWidth > 0 && !(sheet.dataset && sheet.dataset.dead === "1")) {
      const fw = 96;
      const frame2 = Math.floor(t2 * 4) % 4;
      g.drawImage(sheet, frame2 * fw, 0, fw, fw, hx, hy, size, size);
    } else if (still && still.complete && still.naturalWidth > 0 && !(still.dataset && still.dataset.dead === "1")) {
      g.drawImage(still, hx, hy, size, size);
    } else {
      applyWorld(g);
      draw(g, "px.dario", hx - WORLD_OX + size / 2, hy - WORLD_OY + size, {
        alpha: 1,
        frame: Math.floor(t2 * 4) % 4
      });
      applyScreen(g);
    }
    g.restore();
    g.fillStyle = `rgba(158,230,220,${talking ? 0.55 : 0.28})`;
    g.fillRect(hx, hy + (t2 * 14 | 0) % (size - 2), size, 1);
  }
  function init2(ctx2) {
    ctx2.world.clamp = (actor) => {
      if (!actor) return;
      clampTo(actor, activeInner(ctx2.state.current));
    };
    ctx2.world.setHolo = (zh, en) => {
      if (!zh || en === "HOLO") {
        ctx2.holo = null;
        return;
      }
      ctx2.holo = { zh, en, until: (ctx2.time?.unscaled || 0) + 3.6 };
    };
    ctx2.world.room = {
      ROOM,
      INTRO_ROOM,
      FLOOR_SCREEN,
      FLOOR_WORLD,
      ROOM_BG,
      WORLD_OX,
      WORLD_OY,
      DARIO_HOLO,
      COLLISION: {
        boss: FLOOR_WORLD,
        intro: {
          x: INTRO_ROOM.x + INTRO_ROOM.wall,
          y: INTRO_ROOM.y + INTRO_ROOM.wall,
          w: INTRO_ROOM.w - INTRO_ROOM.wall * 2,
          h: INTRO_ROOM.h - INTRO_ROOM.wall * 2
        }
      }
    };
    ctx2.stele = null;
  }
  function spawnStele(ctx2) {
    const stele = {
      id: "stele",
      team: "neutral",
      x: INTRO_ROOM.x + 52,
      y: INTRO_ROOM.y + 78,
      vx: 0,
      vy: 0,
      r: 10,
      hp: 999,
      maxHp: 999,
      alive: true,
      invuln: 0,
      facing: "s",
      sprite: "px.stele",
      quip: 0,
      flash: 0
    };
    stele.onHit = () => {
      stele.hp = stele.maxHp;
      stele.alive = true;
      stele.quip = 1.5;
    };
    ctx2.stele = stele;
    return stele;
  }
  function update2(ctx2, dt) {
    if (ctx2.stele && ctx2.stele.quip > 0) ctx2.stele.quip -= dt;
    if (ctx2.state.current !== "intro") return;
    const p = ctx2.player;
    if (!p) return;
    if (ctx2.input.pressed("enter") || inDoor(p)) {
      ctx2.input.eat("enter");
      ctx2.finishIntro?.();
    }
  }
  function render(ctx2, g) {
    const t2 = ctx2.time ? ctx2.time.elapsed : 0;
    if (ctx2.state.current === "intro") drawIntro(g, ctx2, t2);
    else drawBossRoom(g, ctx2, t2);
    drawHolo(g, ctx2, t2);
    applyWorld(g);
  }
  function reset2(ctx2) {
    if (ctx2) ctx2.stele = null;
  }

  // src/render/sprites.js
  var sprites_exports = {};
  __export(sprites_exports, {
    FLASK_IDS: () => FLASK_IDS,
    PIXEL_SPRITES: () => PIXEL_SPRITES,
    PLAYER_FOOT_RING: () => PLAYER_FOOT_RING,
    PROJ: () => PROJ,
    collect: () => collect2,
    drawActor: () => drawActor,
    drawIcon: () => drawIcon,
    drawPx: () => drawPx,
    drawShadows: () => drawShadows,
    getFootRingSample: () => getFootRingSample,
    init: () => init6,
    ready: () => ready2,
    reset: () => reset5,
    snapshotActor: () => snapshotActor,
    spriteId: () => spriteId,
    tinted: () => tinted,
    update: () => update5,
    whiteSilhouette: () => whiteSilhouette,
    whoOf: () => whoOf2
  });

  // src/actors/projectiles.js
  var projectiles_exports = {};
  __export(projectiles_exports, {
    clear: () => clear,
    collect: () => collect,
    count: () => count,
    counts: () => counts,
    draw: () => draw2,
    getDrawer: () => getDrawer,
    init: () => init3,
    killWhere: () => killWhere,
    query: () => query,
    reset: () => reset3,
    setDrawer: () => setDrawer,
    spawn: () => spawn,
    update: () => update3
  });
  var POOL = 180;
  var ENEMY_CAP = 120;
  function blank() {
    return {
      alive: false,
      team: "boss",
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r: 3,
      dmg: 1,
      life: 1,
      shape: "dot",
      color: "#f4f1ea",
      pierce: 0,
      homing: 0,
      accel: 0,
      angularVel: 0,
      wobble: 0,
      knock: 0,
      attackId: "",
      ownerId: "",
      onHit: null,
      age: 0,
      hits: null,
      ox: 0,
      oy: 0,
      maxRange: 0,
      traveled: 0,
      ignoreWalls: false
    };
  }
  var bullets = Array.from({ length: POOL }, () => blank());
  var cursor = 0;
  var drawer = defaultDraw;
  function hostile(bulletTeam, actorTeam) {
    if (bulletTeam === "boss") return actorTeam === "player" || actorTeam === "ally";
    if (bulletTeam === "player" || bulletTeam === "ally") return actorTeam === "boss" || actorTeam === "neutral";
    return false;
  }
  function hurtables(ctx2) {
    const out = [];
    if (ctx2.player && ctx2.player.alive) out.push(ctx2.player);
    if (ctx2.boss && ctx2.boss.alive && ctx2.state.current === "fight") out.push(ctx2.boss);
    const allies = ctx2.allies || [];
    for (let i = 0; i < allies.length; i += 1) {
      if (allies[i] && allies[i].alive) out.push(allies[i]);
    }
    if (ctx2.stele && ctx2.stele.alive) out.push(ctx2.stele);
    return out;
  }
  function outside(x, y, rect2) {
    return x < rect2.x - 4 || y < rect2.y - 4 || x > rect2.x + rect2.w + 4 || y > rect2.y + rect2.h + 4;
  }
  function defaultDraw(g, b) {
    const x = Math.round(b.x);
    const y = Math.round(b.y);
    g.fillStyle = "#1b1530";
    g.fillRect(x - b.r - 1, y - b.r - 1, b.r * 2 + 2, b.r * 2 + 2);
    g.fillStyle = b.color || "#f4f1ea";
    if (b.shape === "fin" || b.shape === "bolt") {
      g.save();
      g.translate(x, y);
      g.rotate(Math.atan2(b.vy, b.vx));
      g.fillRect(-b.r - 2, -2, b.r * 2 + 3, 4);
      g.fillStyle = "#fff";
      g.fillRect(-1, -1, 2, 2);
      g.restore();
    } else if (b.shape === "orb") {
      g.beginPath();
      g.arc(x, y, b.r, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#fff";
      g.fillRect(x - 1, y - 1, 3, 3);
    } else if (b.shape === "petal") {
      g.save();
      g.translate(x, y);
      g.rotate(Math.atan2(b.vy, b.vx));
      g.beginPath();
      g.ellipse(0, 0, b.r + 2, b.r, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#fff";
      g.fillRect(-1, -1, 2, 2);
      g.restore();
    } else {
      g.fillRect(x - b.r, y - b.r, b.r * 2, b.r * 2);
      g.fillStyle = "#fff";
      g.fillRect(x - 1, y - 1, 2, 2);
    }
  }
  function setDrawer(fn) {
    drawer = typeof fn === "function" ? fn : defaultDraw;
  }
  function getDrawer() {
    return drawer;
  }
  function count(team) {
    let n = 0;
    for (let i = 0; i < bullets.length; i += 1) {
      const b = bullets[i];
      if (!b.alive) continue;
      if (!team || b.team === team) n += 1;
    }
    return n;
  }
  function counts() {
    let enemy = 0;
    let player = 0;
    for (let i = 0; i < bullets.length; i += 1) {
      const b = bullets[i];
      if (!b.alive) continue;
      if (b.team === "boss") enemy += 1;
      else player += 1;
    }
    return { enemy, player };
  }
  function spawn(ctx2, spec) {
    if (!spec) return null;
    if (spec.team === "boss" && count("boss") >= ENEMY_CAP) return null;
    let slot = null;
    for (let i = 0; i < POOL; i += 1) {
      const b = bullets[(cursor + i) % POOL];
      if (!b.alive) {
        slot = b;
        cursor = (cursor + i + 1) % POOL;
        break;
      }
    }
    if (!slot) return null;
    const base = blank();
    Object.assign(slot, base, spec, { alive: true, age: 0 });
    slot.hits = /* @__PURE__ */ new Set();
    if (!slot.r) slot.r = 3;
    if (slot.maxRange > 0) {
      slot.ox = slot.x;
      slot.oy = slot.y;
      slot.traveled = 0;
    }
    ctx2.bus?.emit(EVENTS.BULLET_SPAWN, {
      team: slot.team,
      x: slot.x,
      y: slot.y,
      shape: slot.shape
    });
    return slot;
  }
  function clear(ctx2, team, opts = {}) {
    const near = opts.near;
    const r2 = near ? near.r * near.r : 0;
    for (let i = 0; i < bullets.length; i += 1) {
      const b = bullets[i];
      if (!b.alive) continue;
      if (team && b.team !== team) continue;
      if (near) {
        const dx = b.x - near.x;
        const dy = b.y - near.y;
        if (dx * dx + dy * dy > r2) continue;
      }
      b.alive = false;
      if (opts.sparks !== false) {
        ctx2.bus?.emit(EVENTS.VFX, {
          kind: "spark",
          x: b.x,
          y: b.y,
          color: opts.color || "#e7c27a"
        });
      }
    }
  }
  function query(pred) {
    const out = [];
    for (let i = 0; i < bullets.length; i += 1) {
      const b = bullets[i];
      if (b.alive && pred(b)) out.push(b);
    }
    return out;
  }
  function killWhere(ctx2, pred, opts = {}) {
    let n = 0;
    for (let i = 0; i < bullets.length; i += 1) {
      const b = bullets[i];
      if (!b.alive || !pred(b)) continue;
      b.alive = false;
      n += 1;
      if (opts.sparks !== false) {
        ctx2.bus?.emit(EVENTS.VFX, { kind: "spark", x: b.x, y: b.y, color: opts.color || "#9fd8ff" });
      }
    }
    return n;
  }
  function shieldBlocks(ctx2, b) {
    const guards = [];
    if (ctx2.player && ctx2.player.alive && ctx2.player.shield) guards.push(ctx2.player);
    const allies = ctx2.allies || [];
    for (let i = 0; i < allies.length; i += 1) {
      if (allies[i] && allies[i].alive && allies[i].shield) guards.push(allies[i]);
    }
    for (let i = 0; i < guards.length; i += 1) {
      const p = guards[i];
      if (b.team !== "boss") continue;
      const dx = b.x - p.x;
      const dy = b.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 30 || dist < 1e-3) continue;
      const ax = Number.isFinite(p.aimX) ? p.aimX : 0;
      const ay = Number.isFinite(p.aimY) ? p.aimY : 0;
      const aim = ax === 0 && ay === 0 ? -Math.PI / 2 : Math.atan2(ay, ax);
      const ang = Math.atan2(dy, dx);
      let d = Math.abs(ang - aim);
      if (d > Math.PI) d = Math.PI * 2 - d;
      const half = (p.shieldArc || 100 * Math.PI / 180) * 0.5;
      if (d > half) continue;
      const perfect = (p.shieldAge || 0) <= (p.perfectWindow || 0.2);
      ctx2.bus?.emit(EVENTS.SHIELD_BLOCK, { id: p.id, perfect, x: b.x, y: b.y });
      if (perfect && !p.perfectSpent) {
        p.perfectSpent = true;
        ctx2.bus?.emit(EVENTS.PERFECT_GUARD, { id: p.id });
        ctx2.audio?.playSfx("sfx.perfect");
        ctx2.time?.requestHitStop(80);
        ctx2.bus?.emit(EVENTS.HIT_STOP, { ms: 80 });
        ctx2.bus?.emit(EVENTS.SHAKE, { mag: 3, dur: 0.12 });
        ctx2.bus?.emit(EVENTS.VFX, { kind: "shock", x: p.x, y: p.y, r: 56, color: "#e7c27a" });
        if (ctx2.boss && ctx2.boss.alive) {
          const bd = Math.hypot(ctx2.boss.x - p.x, ctx2.boss.y - p.y);
          if (bd <= 56 + ctx2.boss.r) {
            applyHit(ctx2, p, ctx2.boss, PLAYER.glm.skill.ringDmg, { attackId: `perfect-${p.id}-${Math.floor(ctx2.time.elapsed * 10)}`, heavy: true, hitStopMs: 0 });
          }
        }
        b.team = "player";
        b.ownerId = p.id;
        b.dmg = 8;
        b.vx *= -1;
        b.vy *= -1;
        b.hits = /* @__PURE__ */ new Set();
        b.life = Math.max(b.life, 0.4);
        return "reflect";
      }
      ctx2.audio?.playSfx("sfx.guard");
      b.alive = false;
      ctx2.bus?.emit(EVENTS.VFX, { kind: "spark", x: b.x, y: b.y, color: "#d8b15a" });
      return "block";
    }
    return "";
  }
  function update3(ctx2, dt) {
    const rect2 = activeInner(ctx2.state.current);
    const actors = hurtables(ctx2);
    for (let i = 0; i < bullets.length; i += 1) {
      const b = bullets[i];
      if (!b.alive) continue;
      b.age += dt;
      b.life -= dt;
      if (b.life <= 0) {
        b.alive = false;
        continue;
      }
      if (b.angularVel) {
        const sp = Math.hypot(b.vx, b.vy);
        const ang = Math.atan2(b.vy, b.vx) + b.angularVel * dt;
        b.vx = Math.cos(ang) * sp;
        b.vy = Math.sin(ang) * sp;
      }
      if (b.accel) {
        const sp = Math.hypot(b.vx, b.vy) || 1;
        b.vx += b.vx / sp * b.accel * dt;
        b.vy += b.vy / sp * b.accel * dt;
      }
      if (b.homing) {
        const tgt = b.team === "boss" ? ctx2.player : ctx2.boss;
        if (tgt && tgt.alive) {
          const desired = Math.atan2(tgt.y - b.y, tgt.x - b.x);
          let ang = Math.atan2(b.vy, b.vx);
          let diff = desired - ang;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          const rate = typeof b.homing === "number" ? b.homing : 1.2;
          const step2 = Math.max(-rate * dt, Math.min(rate * dt, diff));
          ang += step2;
          const sp = Math.hypot(b.vx, b.vy);
          b.vx = Math.cos(ang) * sp;
          b.vy = Math.sin(ang) * sp;
        }
      }
      const px = b.x;
      const py = b.y;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.wobble) {
        const ang = Math.atan2(b.vy, b.vx);
        const w = Math.sin(b.age * 8) * b.wobble * dt;
        b.x += -Math.sin(ang) * w;
        b.y += Math.cos(ang) * w;
      }
      if (b.maxRange > 0) {
        b.traveled = (b.traveled || 0) + Math.hypot(b.x - px, b.y - py);
        const dx = b.x - b.ox;
        const dy = b.y - b.oy;
        const disp = Math.hypot(dx, dy);
        if (disp >= b.maxRange) {
          const s = b.maxRange / (disp || 1);
          b.x = b.ox + dx * s;
          b.y = b.oy + dy * s;
          b.alive = false;
          continue;
        }
      }
      if (!b.ignoreWalls && outside(b.x, b.y, rect2)) {
        b.alive = false;
        continue;
      }
      const shield = shieldBlocks(ctx2, b);
      if (shield === "block" || !b.alive) continue;
      for (let a = 0; a < actors.length; a += 1) {
        const actor = actors[a];
        if (!actor.alive || !hostile(b.team, actor.team)) continue;
        if (b.ownerId && b.ownerId === actor.id) continue;
        if (b.hits && b.hits.has(actor.id)) continue;
        const dx = actor.x - b.x;
        const dy = actor.y - b.y;
        const reach = (actor.r || 0) + (b.r || 0);
        if (dx * dx + dy * dy > reach * reach) continue;
        if (b.hits) b.hits.add(actor.id);
        const hitOpts = {
          attackId: b.attackId || `b${i}-${Math.floor(b.age * 60)}`,
          knock: b.knock || 0,
          heavy: !!b.heavy
        };
        if (b.hitStopMs != null) hitOpts.hitStopMs = b.hitStopMs;
        else if ((b.team === "player" || b.team === "ally") && !b.heavy) hitOpts.hitStopMs = 0;
        applyHit(ctx2, { team: b.team, x: b.x, y: b.y, id: b.ownerId || b.team }, actor, b.dmg, hitOpts);
        if (typeof b.onHit === "function") b.onHit(ctx2, b, actor);
        if (!(b.pierce > 0)) {
          b.alive = false;
          break;
        }
        b.pierce -= 1;
      }
    }
  }
  function collect(items) {
    for (let i = 0; i < bullets.length; i += 1) {
      const b = bullets[i];
      if (!b.alive) continue;
      items.push({
        y: b.y,
        draw: (g) => drawer(g, b)
      });
    }
  }
  function draw2(g) {
    for (let i = 0; i < bullets.length; i += 1) {
      if (bullets[i].alive) drawer(g, bullets[i]);
    }
  }
  function reset3() {
    for (let i = 0; i < bullets.length; i += 1) bullets[i].alive = false;
    cursor = 0;
  }
  function init3() {
  }

  // src/render/vfx.js
  var vfx_exports = {};
  __export(vfx_exports, {
    init: () => init4,
    overlayActive: () => overlayActive,
    render: () => render2,
    reset: () => reset4,
    setOverlay: () => setOverlay,
    spawn: () => spawn2,
    update: () => update4
  });
  var overlay = null;
  var overlayUpdate = null;
  function setOverlay(renderFn, updateFn) {
    overlay = typeof renderFn === "function" ? renderFn : null;
    overlayUpdate = typeof updateFn === "function" ? updateFn : null;
  }
  function overlayActive() {
    return !!overlay;
  }
  var P_CAP = 420;
  var FX_CAP = 80;
  var NUM_CAP = 28;
  var DECAL_CAP = 36;
  var AFTER_CAP = 20;
  var particles = [];
  var fx = [];
  var numbers = [];
  var decals = [];
  var afters = [];
  var shards = [];
  var flashColor = "rgba(255,255,255,0.4)";
  var flashT = 0;
  var flashDur = 0.08;
  var shakeMag = 0;
  var shakeDur = 0;
  var shakeAge = 0;
  var crackT = 0;
  var riftT = 0;
  var vignetteA = 0;
  var vignetteLife = 0;
  var slowTint = 0;
  var uid = 1;
  function palOf(who) {
    const w = String(who || "");
    if (w.indexOf("kimi") >= 0) return "silver";
    if (w.indexOf("glm") >= 0) return "purple";
    if (w.indexOf("opus") >= 0 || w.indexOf("p3") >= 0) return "coral";
    if (w.indexOf("sonnet") >= 0 || w.indexOf("p2") >= 0) return "gold";
    if (w.indexOf("astra") >= 0) return "teal";
    if (w.indexOf("haiku") >= 0) return "coral";
    return "cyan";
  }
  function vfxId(kind, pal) {
    const map = {
      slash: {
        cyan: "v2_vfx_slash_deepseek",
        silver: "v2_vfx_slash_kimi",
        purple: "v2_vfx_slash_glm",
        coral: "v2_vfx_slash_haiku",
        gold: "v2_vfx_slash_sonnet",
        teal: "v2_vfx_slash_astra"
      },
      slash_big: {
        cyan: "v2_vfx_slash_big_deepseek",
        coral: "v2_vfx_slash_big_opus"
      },
      spark: {
        cyan: "v2_vfx_hit_spark_cyan",
        coral: "v2_vfx_hit_spark_coral",
        gold: "v2_vfx_hit_spark_gold",
        purple: "v2_vfx_hit_spark_purple",
        white: "v2_vfx_hit_spark_white"
      },
      muzzle: {
        cyan: "v2_vfx_muzzle_cyan",
        silver: "v2_vfx_muzzle_silver",
        gold: "v2_vfx_muzzle_gold",
        coral: "v2_vfx_muzzle_coral",
        teal: "v2_vfx_muzzle_teal"
      },
      shock: {
        purple: "v2_vfx_shockwave_glm",
        coral: "v2_vfx_shockwave_opus",
        gold: "v2_vfx_shockwave_sonnet",
        white: "v2_vfx_shockwave_phase"
      },
      beam_body: {
        silver: "v2_vfx_beam_body_kimi",
        coral: "v2_vfx_beam_body_opus",
        teal: "v2_vfx_beam_body_astra"
      },
      beam_cap: {
        silver: "v2_vfx_beam_cap_kimi",
        coral: "v2_vfx_beam_cap_opus",
        teal: "v2_vfx_beam_cap_astra"
      }
    };
    const table = map[kind];
    if (!table) return null;
    return table[pal] || table.cyan || table.gold || table.white || null;
  }
  function imgReady(img) {
    return !!(img && img.complete && img.naturalWidth > 0 && !(img.dataset && img.dataset.dead === "1"));
  }
  function alloc(list2, cap, blank2) {
    for (let i = 0; i < list2.length; i += 1) {
      if (!list2[i].alive) {
        const o2 = list2[i];
        Object.assign(o2, blank2, { alive: true });
        return o2;
      }
    }
    if (list2.length >= cap) {
      const o2 = list2[uid % list2.length];
      Object.assign(o2, blank2, { alive: true });
      uid += 1;
      return o2;
    }
    const o = Object.assign({ alive: true }, blank2);
    list2.push(o);
    return o;
  }
  function burst(x, y, color, n, speed, life, size, grav) {
    const count2 = n || 6;
    for (let i = 0; i < count2; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const sp = (Math.random() * 0.6 + 0.4) * (speed || 70);
      alloc(particles, P_CAP, {
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - (speed || 70) * 0.25,
        life: (life || 0.4) * (0.6 + Math.random() * 0.5),
        max: life || 0.4,
        color: color || "#f4f1ea",
        s: size || 2 + uid % 2,
        grav: grav == null ? 80 : grav,
        drag: 1.8
      });
      uid += 1;
    }
  }
  function spawnSheet(id, x, y, opts) {
    if (!id) return;
    const meta = V2_ASSETS && V2_ASSETS[id];
    const img = loadImage(id);
    const fw = meta && meta.size && meta.size[0] || 32;
    const fh = meta && meta.size && meta.size[1] || 32;
    const frames = meta && meta.frames || 4;
    const fps2 = meta && meta.fps || 16;
    alloc(fx, FX_CAP, {
      type: "sheet",
      id,
      img,
      x,
      y,
      fw,
      fh,
      frames,
      fps: fps2,
      t: 0,
      life: opts.loop ? opts.life || 0.4 : frames / fps2,
      max: opts.loop ? opts.life || 0.4 : frames / fps2,
      loop: !!opts.loop,
      angle: opts.angle || 0,
      additive: opts.additive !== false,
      scale: opts.scale || 1,
      alpha: opts.alpha == null ? 1 : opts.alpha
    });
  }
  function spawnSlash(req) {
    const x = req.x || 0;
    const y = req.y || 0;
    const color = req.color || "#7ee0ff";
    const r = req.r || req.radius || 36;
    const angle = req.angle != null ? req.angle : req.ang != null ? req.ang : -0.6;
    alloc(fx, FX_CAP, {
      type: "slash",
      x,
      y,
      r,
      angle,
      color,
      life: req.life || 0.22,
      max: req.life || 0.22,
      w: req.w || 6
    });
    burst(x, y, color, 8, 90, 0.28, 2, 40);
    const pal = palOf(req.who || req.color);
    const sid = r > 36 ? vfxId("slash_big", pal) || vfxId("slash", pal) : vfxId("slash", pal);
    spawnSheet(sid, x, y, { angle, additive: true, scale: r > 36 ? 1.2 : 1 });
  }
  function spawnBeam(req) {
    alloc(fx, FX_CAP, {
      type: "beam",
      x: req.x || 0,
      y: req.y || 0,
      x2: req.x2 || (req.x || 0) + 80,
      y2: req.y2 || (req.y || 0),
      w: Math.max(10, req.w || 12),
      color: req.color || "#d7f4ff",
      life: Math.max(req.life || 0, 0.38),
      max: Math.max(req.life || 0, 0.38),
      who: req.who
    });
    decal(req.x || 0, req.y || 0, req.x2, req.y2, "scorch_line");
    const pal = palOf(req.who || "kimi");
    spawnSheet(vfxId("beam_cap", pal), req.x, req.y, { additive: true, loop: true, life: req.life || 0.28 });
  }
  function spawnShock(req) {
    alloc(fx, FX_CAP, {
      type: "shock",
      x: req.x || 0,
      y: req.y || 0,
      r0: 4,
      r1: req.r || 48,
      color: req.color || "#f4f1ea",
      life: req.life || VFX.shockLife || 0.4,
      max: req.life || VFX.shockLife || 0.4,
      w: req.w || 3
    });
    const pal = palOf(req.who || req.color);
    const sid = vfxId("shock", pal) || "v2_vfx_shockwave_phase";
    spawnSheet(sid, req.x, req.y, { additive: true, scale: (req.r || 48) / 40 });
  }
  function decal(x, y, x2, y2, kind) {
    alloc(decals, DECAL_CAP, {
      type: kind || "scorch",
      x: x || 0,
      y: y || 0,
      x2,
      y2,
      r: 10 + Math.random() * 8,
      life: 2.4,
      max: 2.4,
      rot: Math.random() * Math.PI
    });
  }
  function onVfx(req) {
    if (!req || !req.kind) return;
    const k = req.kind;
    if (k === "num") {
      alloc(numbers, NUM_CAP, {
        x: req.x || 0,
        y: (req.y || 0) - 12,
        text: req.text == null ? "" : String(req.text),
        color: req.color || "#fff",
        life: req.life || VFX.numLife || 0.85,
        max: req.life || VFX.numLife || 0.85,
        heavy: !!(req.heavy || req.crit || Number(req.text) >= 18),
        crit: !!req.crit,
        pop: 1.4
      });
    } else if (k === "slash" || k === "slash_arc") {
      spawnSlash(req);
    } else if (k === "beam") {
      spawnBeam(req);
    } else if (k === "shock" || k === "shockwave" || k === "ring" || k === "telegraph_glow") {
      spawnShock(req);
    } else if (k === "spark" || k === "sparks") {
      burst(req.x || 0, req.y || 0, req.color || "#f4f1ea", req.n || 5, 70, req.life || VFX.sparkLife || 0.4, 2, 90);
      const pal = palOf(req.color);
      spawnSheet(vfxId("spark", pal) || "v2_vfx_hit_spark_white", req.x, req.y, { additive: true });
    } else if (k === "muzzle") {
      burst(req.x || 0, req.y || 0, req.color || "#7ee0ff", 4, 50, 0.18, 2, 20);
      spawnSheet(vfxId("muzzle", palOf(req.who || req.color)), req.x, req.y, { angle: req.angle || 0, additive: true });
      alloc(fx, FX_CAP, {
        type: "muzzle",
        x: req.x || 0,
        y: req.y || 0,
        color: req.color || "#7ee0ff",
        life: 0.1,
        max: 0.1
      });
    } else if (k === "impact") {
      burst(req.x || 0, req.y || 0, req.color || "#fff", req.heavy ? 14 : 8, req.heavy ? 120 : 80, 0.35, req.heavy ? 3 : 2, 70);
      spawnSheet(vfxId("spark", req.heavy ? "gold" : "white"), req.x, req.y, { additive: true });
    } else if (k === "dust") {
      burst(req.x || 0, req.y || 0, "#c8c0b0", req.n || 6, 40, 0.4, 2, 30);
      spawnSheet("v2_vfx_dash_dust", req.x, req.y, { additive: false });
    } else if (k === "afterimage") {
      alloc(afters, AFTER_CAP, {
        x: req.x || 0,
        y: req.y || 0,
        sprite: req.sprite || "deepseek",
        flip: !!req.flip,
        life: req.life || 0.22,
        max: req.life || 0.22,
        alpha: req.alpha || 0.45
      });
    } else if (k === "charge") {
      alloc(fx, FX_CAP, {
        type: "charge",
        x: req.x || 0,
        y: req.y || 0,
        color: req.color || "#d7f4ff",
        r: req.r || 22,
        life: req.life || 0.12,
        max: req.life || 0.12
      });
      burst(req.x || 0, req.y || 0, req.color || "#d7f4ff", 3, 30, 0.25, 2, -40);
    } else if (k === "shield_arc") {
      alloc(fx, FX_CAP, {
        type: "shield",
        x: req.x || 0,
        y: req.y || 0,
        angle: req.angle != null ? req.angle : req.ang || 0,
        arc: req.arc || 1.74,
        r: req.r || 22,
        color: req.color || "#d8b15a",
        perfect: !!req.perfect,
        life: req.life || 0.16,
        max: req.life || 0.16
      });
    } else if (k === "heal" || k === "heal_pillar") {
      alloc(fx, FX_CAP, {
        type: "heal",
        x: req.x || 0,
        y: req.y || 0,
        life: req.life || 0.55,
        max: req.life || 0.55
      });
      burst(req.x || 0, req.y || 0, "#9dff9a", 12, 50, 0.5, 2, -20);
      spawnSheet("v2_vfx_heal_gpu", req.x, (req.y || 0) - 20, { additive: true, loop: true, life: 0.55 });
      spawnSheet("v2_vfx_sparkle_green", req.x, req.y, { additive: true });
    } else if (k === "explosion") {
      alloc(fx, FX_CAP, {
        type: "boom",
        x: req.x || 0,
        y: req.y || 0,
        r: req.r || 28,
        color: req.color || "#e07a5f",
        life: 0.4,
        max: 0.4
      });
      burst(req.x || 0, req.y || 0, req.color || "#ffb060", 16, 140, 0.45, 3, 40);
      spawnSheet("v2_vfx_explosion", req.x, req.y, { additive: true, scale: 1.2 });
      decal(req.x, req.y, null, null, "scorch");
    } else if (k === "gold_sparks") {
      burst(req.x || 0, req.y || 0, "#e7c27a", req.n || 8, 60, 0.45, 2, 40);
      spawnSheet("v2_vfx_sparkle_gold", req.x, req.y, { additive: true });
    } else if (k === "text") {
      alloc(numbers, NUM_CAP, {
        x: req.x || 0,
        y: req.y || 0,
        text: req.text || "",
        color: req.color || "#f4f1ea",
        life: req.life || 0.9,
        max: req.life || 0.9,
        heavy: false,
        crit: false,
        pop: 1
      });
    } else if (k === "scorch" || k === "crack_floor") {
      decal(req.x, req.y, null, null, k === "crack_floor" ? "crack" : "scorch");
    } else if (k === "crack") {
      crackT = Math.max(crackT, req.life || 1.2);
      for (let i = 0; i < 14; i += 1) {
        const a = Math.random() * Math.PI * 2;
        shards.push({
          x: INTERNAL_W2 / 2,
          y: INTERNAL_H2 / 2,
          vx: Math.cos(a) * (80 + Math.random() * 140),
          vy: Math.sin(a) * (60 + Math.random() * 100) - 40,
          life: 0.8 + Math.random() * 0.5,
          max: 1,
          rot: Math.random() * 4,
          s: 3 + uid % 5,
          alive: true
        });
        uid += 1;
      }
    } else if (k === "rift") {
      riftT = Math.max(riftT, req.life || 1.4);
    } else if (k === "vignette") {
      vignetteA = req.a == null ? 0.55 : req.a;
      vignetteLife = req.life || 0.8;
    } else if (k === "desaturate") {
      slowTint = req.amount == null ? 0.7 : req.amount;
    } else {
      burst(req.x || 0, req.y || 0, req.color, 4, 50, req.life || 0.35, 2, 70);
    }
  }
  function shakeTo(mag, dur) {
    shakeMag = Math.max(shakeMag, mag || 2);
    shakeDur = Math.max(dur || 0.12, 0.05);
    shakeAge = 0;
  }
  function init4(ctx2) {
    ctx2.bus.on(EVENTS.VFX, onVfx);
    ctx2.bus.on(EVENTS.SHAKE, ({ mag, dur }) => shakeTo(mag, dur));
    ctx2.bus.on(EVENTS.CAMERA_SHAKE, ({ intensity, duration }) => {
      shakeTo(Math.max(1, Math.round((intensity || 0.1) * 16)), duration || 0.12);
    });
    ctx2.bus.on(EVENTS.FLASH, ({ color, dur }) => {
      flashColor = color || "rgba(255,255,255,0.4)";
      flashDur = dur || VFX.flashHit || 0.08;
      flashT = flashDur;
    });
    ctx2.bus.on(EVENTS.HIT, (hit) => {
      if (!hit || !hit.applied) return;
      const dst = hit.dst;
      if (!dst) return;
      onVfx({
        kind: "impact",
        x: dst.x,
        y: dst.y - 8,
        color: hit.heavy ? "#e7c27a" : "#f4f1ea",
        heavy: !!hit.heavy
      });
      if (hit.heavy) onVfx({ kind: "shock", x: dst.x, y: dst.y, r: 22, color: "#ffe08a", life: 0.18 });
    });
    ctx2.bus.on(EVENTS.ROLL_START, ({ id }) => {
      const a = ctx2.player && ctx2.player.id === id ? ctx2.player : null;
      const x = a ? a.x : 0;
      const y = a ? a.y : 0;
      onVfx({ kind: "dust", x, y, n: 8 });
      onVfx({ kind: "afterimage", x, y, sprite: a ? a.sprite : "deepseek", flip: false });
      spawnSheet("v2_vfx_dash_speedlines", x, y - 8, { additive: true });
    });
    ctx2.bus.on(EVENTS.FLASK_USED, () => {
      const p = ctx2.player;
      if (!p) return;
      onVfx({ kind: "heal_pillar", x: p.x, y: p.y });
      ctx2.bus.emit(EVENTS.FLASH, { color: "rgba(80,255,140,0.22)", dur: 0.1 });
    });
    ctx2.bus.on(EVENTS.SKILL_CHARGE, ({ id }) => {
      const a = ctx2.player && ctx2.player.id === id ? ctx2.player : (ctx2.allies || []).find((x) => x.id === id);
      if (!a) return;
      onVfx({ kind: "charge", x: a.x, y: a.y - 8, color: "#d7f4ff" });
    });
    ctx2.bus.on(EVENTS.SKILL_RELEASE, () => {
      ctx2.bus.emit(EVENTS.FLASH, { color: "rgba(180,220,255,0.35)", dur: 0.1 });
    });
    ctx2.bus.on(EVENTS.SHIELD_BLOCK, ({ x, y, perfect }) => {
      onVfx({ kind: "shield_arc", x, y, perfect, color: perfect ? "#ffe08a" : "#d8b15a" });
      onVfx({ kind: "sparks", x, y, color: "#ffe08a", n: perfect ? 10 : 5 });
    });
    ctx2.bus.on(EVENTS.PERFECT_GUARD, () => {
      const p = ctx2.player;
      if (p) {
        onVfx({ kind: "shock", x: p.x, y: p.y, r: 56, color: "#ffe08a" });
        spawnSheet("v2_vfx_perfect_dodge_flash", p.x, p.y - 8, { additive: true });
      }
      ctx2.bus.emit(EVENTS.FLASH, { color: "rgba(255,224,120,0.35)", dur: 0.08 });
    });
    ctx2.bus.on(EVENTS.PHASE_TRANSITION_START, () => {
      const b = ctx2.boss;
      if (b) {
        onVfx({ kind: "shock", x: b.x, y: b.y, r: 90, color: "#f4f1ea", who: "white" });
        onVfx({ kind: "gold_sparks", x: b.x, y: b.y, n: 18 });
      }
      ctx2.bus.emit(EVENTS.FLASH, { color: "#ffffff", dur: 0.16 });
      shakeTo(5, 0.28);
    });
    ctx2.bus.on(EVENTS.CUTSCENE_BEAT, ({ id, beat }) => {
      if (id === "B" && (beat === "start" || beat === "crack")) {
        onVfx({ kind: "crack", life: 1.6 });
        ctx2.bus.emit(EVENTS.FLASH, { color: "rgba(244,241,234,0.55)", dur: 0.12 });
        shakeTo(6, 0.4);
      }
      if (id === "A" && beat === "dive") onVfx({ kind: "rift", life: 1.6 });
      if (id === "A" && beat === "parry") {
        const b = ctx2.boss;
        if (b) onVfx({ kind: "shock", x: b.x, y: b.y, r: 80, color: "#9fd8d2", who: "astra" });
        ctx2.bus.emit(EVENTS.FLASH, { color: "rgba(200,255,250,0.4)", dur: 0.12 });
      }
    });
    ctx2.bus.on(EVENTS.PLAYER_DEATH, () => {
      slowTint = 0.8;
      vignetteA = 0.65;
      vignetteLife = 0.8;
    });
    ctx2.world.vfx = { update: update4, render: render2, reset: reset4, spawn: onVfx, setOverlay };
  }
  function stepList(list2, dt, move) {
    for (let i = list2.length - 1; i >= 0; i -= 1) {
      const p = list2[i];
      if (!p.alive && p.alive !== void 0) {
        continue;
      }
      p.life -= dt;
      if (move) move(p, dt);
      if (p.life <= 0) {
        if (p.alive !== void 0) p.alive = false;
        else list2.splice(i, 1);
      }
    }
  }
  function update4(ctx2, dt) {
    const step2 = dt || 0;
    if (overlayUpdate) overlayUpdate(ctx2, step2);
    stepList(particles, step2, (p, s) => {
      p.vy += (p.grav || 0) * s;
      p.vx *= Math.max(0, 1 - (p.drag || 0) * s);
      p.x += p.vx * s;
      p.y += p.vy * s;
    });
    stepList(numbers, step2, (n, s) => {
      n.y -= 28 * s;
      n.pop = Math.max(1, n.pop - s * 2.4);
    });
    stepList(fx, step2, (s, d) => {
      s.t = (s.t || 0) + d;
    });
    stepList(decals, step2, null);
    stepList(afters, step2, null);
    stepList(shards, step2, (p, s) => {
      p.vy += 180 * s;
      p.x += p.vx * s;
      p.y += p.vy * s;
      p.rot += s * 8;
    });
    if (flashT > 0) flashT -= step2;
    if (crackT > 0) crackT -= step2;
    if (riftT > 0) riftT -= step2;
    if (vignetteLife > 0) {
      vignetteLife -= step2;
      if (vignetteLife <= 0) vignetteA = 0;
    }
    if (slowTint > 0) slowTint = Math.max(0, slowTint - step2 * 0.4);
    if (ctx2 && ctx2.player && ctx2.player.rolling) {
      const p = ctx2.player;
      if ((uid & 1) === 0) {
        onVfx({ kind: "afterimage", x: p.x, y: p.y, sprite: p.sprite, flip: false, life: 0.16 });
      }
      uid += 1;
    }
    if (shakeDur > 0) {
      shakeAge += step2;
      if (shakeAge >= shakeDur) {
        shakeDur = 0;
        shakeMag = 0;
        setShake(0, 0);
      } else {
        const k = 1 - shakeAge / shakeDur;
        const m = Math.max(1, Math.round(shakeMag * k));
        const sx = (Math.sin(shakeAge * 92) > 0 ? 1 : -1) * m | 0;
        const sy = (Math.cos(shakeAge * 71) > 0 ? 1 : -1) * Math.max(0, m - 1) | 0;
        setShake(sx, sy);
      }
    }
    if (slowTint > 0.05) {
      const amt = Math.min(1, slowTint);
      setFilter(`grayscale(${amt * 0.85}) contrast(1.08) brightness(${1 - amt * 0.18})`);
    }
  }
  function pixelRing(g, cx, cy, r, color, w, a) {
    g.save();
    g.globalAlpha = a;
    g.strokeStyle = color;
    g.lineWidth = w || 2;
    g.beginPath();
    g.arc(Math.round(cx), Math.round(cy), Math.max(1, r), 0, Math.PI * 2);
    g.stroke();
    g.restore();
  }
  function drawSlash(g, s) {
    const k = 1 - Math.max(0, s.life) / s.max;
    g.save();
    g.translate(Math.round(s.x), Math.round(s.y));
    g.rotate(s.angle);
    g.globalCompositeOperation = "lighter";
    g.strokeStyle = s.color;
    g.globalAlpha = Math.max(0, s.life / s.max);
    g.lineWidth = s.w + 4;
    g.beginPath();
    g.arc(0, 0, s.r * (0.7 + k * 0.4), -1.05, 1.05);
    g.stroke();
    g.strokeStyle = "#fff";
    g.lineWidth = Math.max(2, s.w - 1);
    g.beginPath();
    g.arc(0, 0, s.r * (0.7 + k * 0.4), -0.9, 0.9);
    g.stroke();
    g.restore();
  }
  function drawBeam(g, s) {
    const flick = 0.8 + Math.sin((s.t || 0) * 70) * 0.2;
    const a = Math.max(0, s.life / s.max) * flick;
    const x1 = Math.round(s.x);
    const y1 = Math.round(s.y);
    const x2 = Math.round(s.x2);
    const y2 = Math.round(s.y2);
    g.save();
    g.globalCompositeOperation = "lighter";
    g.strokeStyle = s.color;
    g.globalAlpha = a * 0.55;
    g.lineWidth = (s.w || 12) + 16;
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.stroke();
    g.globalAlpha = a * 0.9;
    g.lineWidth = (s.w || 12) + 6;
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.stroke();
    g.strokeStyle = "#ffffff";
    g.globalAlpha = a;
    g.lineWidth = Math.max(3, (s.w || 12) * 0.45);
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.stroke();
    g.fillStyle = "#fff";
    g.fillRect(x1 - 3, y1 - 3, 6, 6);
    g.fillRect(x2 - 3, y2 - 3, 6, 6);
    g.restore();
  }
  function drawSheet(g, s) {
    const img = s.img;
    if (!imgReady(img)) return;
    const frame2 = s.loop ? Math.floor((s.t || 0) * s.fps) % Math.max(1, s.frames) : Math.min(s.frames - 1, Math.floor((s.t || 0) * s.fps));
    g.save();
    if (s.additive) g.globalCompositeOperation = "lighter";
    g.globalAlpha = Math.max(0, s.life / s.max) * (s.alpha || 1);
    g.translate(Math.round(s.x), Math.round(s.y));
    if (s.angle) g.rotate(s.angle);
    const sc = s.scale || 1;
    g.imageSmoothingEnabled = false;
    g.drawImage(
      img,
      frame2 * s.fw,
      0,
      s.fw,
      s.fh,
      Math.round(-s.fw * sc / 2),
      Math.round(-s.fh * sc / 2),
      Math.round(s.fw * sc),
      Math.round(s.fh * sc)
    );
    g.restore();
  }
  function drawHeal(g, s) {
    const k = 1 - s.life / s.max;
    const h = 18 + k * 48;
    g.save();
    g.globalCompositeOperation = "lighter";
    g.globalAlpha = Math.max(0, s.life / s.max);
    g.fillStyle = "#3ddc84";
    g.fillRect(Math.round(s.x) - 4, Math.round(s.y) - h, 8, h);
    g.fillStyle = "#9dff9a";
    g.fillRect(Math.round(s.x) - 2, Math.round(s.y) - h, 4, h);
    g.fillStyle = "#fff";
    g.fillRect(Math.round(s.x) - 1, Math.round(s.y) - h, 2, h);
    g.restore();
  }
  function drawDecal(g, d) {
    const a = Math.max(0, d.life / d.max) * 0.45;
    g.save();
    g.globalAlpha = a;
    g.translate(Math.round(d.x), Math.round(d.y));
    g.rotate(d.rot || 0);
    if (d.type === "scorch_line" && d.x2 != null) {
      g.restore();
      g.save();
      g.globalAlpha = a * 0.5;
      g.strokeStyle = "#3a2a20";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(Math.round(d.x), Math.round(d.y));
      g.lineTo(Math.round(d.x2), Math.round(d.y2));
      g.stroke();
      g.restore();
      return;
    }
    g.fillStyle = d.type === "crack" ? "#1b1530" : "#2a2018";
    g.fillRect(-Math.round(d.r / 2), -1, Math.round(d.r), 2);
    g.fillRect(-1, -Math.round(d.r / 3), 2, Math.round(d.r / 1.5));
    if (d.type === "crack") {
      g.fillRect(-Math.round(d.r / 3), 2, Math.round(d.r / 2), 1);
    }
    g.restore();
  }
  function drawGlass(g) {
    if (crackT <= 0 && shards.length === 0) return;
    g.save();
    g.strokeStyle = "rgba(244,241,234,0.9)";
    g.lineWidth = 1;
    const cx = INTERNAL_W2 / 2;
    const cy = 40;
    const n = 10;
    for (let i = 0; i < n; i += 1) {
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(40 + i * 60, 50 + i % 4 * 40);
      g.lineTo(70 + i * 55, 140 + i % 3 * 30);
      g.stroke();
    }
    g.fillStyle = "rgba(244,241,234,0.55)";
    for (let i = 0; i < shards.length; i += 1) {
      const s = shards[i];
      if (s.life <= 0) continue;
      g.globalAlpha = Math.max(0, s.life / (s.max || 1));
      g.save();
      g.translate(s.x, s.y);
      g.rotate(s.rot || 0);
      g.fillRect(0, 0, s.s + 2, s.s);
      g.restore();
    }
    g.restore();
  }
  function drawRift(g) {
    if (riftT <= 0) return;
    const a = Math.min(1, riftT);
    g.save();
    g.globalCompositeOperation = "lighter";
    g.globalAlpha = a * 0.85;
    const x = WORLD_OX + 240;
    g.strokeStyle = "#f4f1ea";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(x, 4);
    g.lineTo(x - 8, 28);
    g.lineTo(x + 6, 48);
    g.lineTo(x - 4, 70);
    g.stroke();
    g.strokeStyle = "#9fd8d2";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x + 5, 6);
    g.lineTo(x - 2, 36);
    g.lineTo(x + 10, 58);
    g.stroke();
    g.strokeStyle = "#d8b15a";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x - 6, 10);
    g.lineTo(x + 2, 44);
    g.stroke();
    g.restore();
  }
  function render2(ctx2, g) {
    if (overlay) {
      applyScreen(g);
      overlay(ctx2, g);
    }
    applyWorld(g);
    for (let i = 0; i < decals.length; i += 1) {
      if (decals[i].alive === false) continue;
      if (decals[i].life > 0) drawDecal(g, decals[i]);
    }
    for (let i = 0; i < afters.length; i += 1) {
      const a = afters[i];
      if (a.alive === false || a.life <= 0) continue;
      draw(g, a.sprite, a.x, a.y, {
        flip: a.flip,
        alpha: (a.alpha || 0.4) * (a.life / a.max),
        flash: true
      });
    }
    for (let i = 0; i < fx.length; i += 1) {
      const s = fx[i];
      if (s.alive === false || s.life <= 0) continue;
      if (s.type === "slash") drawSlash(g, s);
      else if (s.type === "beam") drawBeam(g, s);
      else if (s.type === "shock") {
        const k = 1 - s.life / s.max;
        pixelRing(g, s.x, s.y, s.r0 + (s.r1 - s.r0) * k, s.color, s.w, s.life / s.max);
        pixelRing(g, s.x, s.y, s.r0 + (s.r1 - s.r0) * k - 2, "#fff", 1, s.life / s.max * 0.6);
      } else if (s.type === "sheet") drawSheet(g, s);
      else if (s.type === "heal") drawHeal(g, s);
      else if (s.type === "muzzle") {
        g.save();
        g.globalCompositeOperation = "lighter";
        g.globalAlpha = s.life / s.max;
        g.fillStyle = s.color;
        g.fillRect(Math.round(s.x) - 4, Math.round(s.y) - 4, 8, 8);
        g.fillStyle = "#fff";
        g.fillRect(Math.round(s.x) - 2, Math.round(s.y) - 2, 4, 4);
        g.restore();
      } else if (s.type === "charge") {
        const k = s.life / s.max;
        pixelRing(g, s.x, s.y, s.r * k, s.color, 2, k);
      } else if (s.type === "shield") {
        g.save();
        g.translate(Math.round(s.x), Math.round(s.y));
        g.rotate(s.angle);
        g.strokeStyle = s.perfect ? "#ffe08a" : s.color;
        g.globalAlpha = s.life / s.max;
        g.lineWidth = s.perfect ? 5 : 3;
        g.beginPath();
        g.arc(0, 0, s.r, -s.arc * 0.5, s.arc * 0.5);
        g.stroke();
        g.restore();
      } else if (s.type === "boom") {
        const k = 1 - s.life / s.max;
        g.save();
        g.globalCompositeOperation = "lighter";
        g.globalAlpha = s.life / s.max;
        g.fillStyle = s.color;
        const r = Math.round(s.r * (0.4 + k));
        g.fillRect(Math.round(s.x) - r, Math.round(s.y) - r, r * 2, r * 2);
        g.fillStyle = "#fff";
        g.fillRect(Math.round(s.x) - 3, Math.round(s.y) - 3, 6, 6);
        g.restore();
      }
    }
    g.save();
    g.globalCompositeOperation = "lighter";
    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      if (p.alive === false || p.life <= 0) continue;
      g.globalAlpha = Math.max(0, p.life / p.max);
      g.fillStyle = p.color;
      g.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
    }
    g.restore();
    for (let i = 0; i < numbers.length; i += 1) {
      const n = numbers[i];
      if (n.alive === false || n.life <= 0) continue;
      g.save();
      g.globalAlpha = Math.max(0, n.life / n.max);
      const big = n.heavy || n.crit;
      const sc = big ? Math.max(2, Math.round(n.pop + 0.6)) : 1;
      const w = String(n.text).length * (big ? 6 * sc : 6);
      const nx = Math.round(n.x) - (w >> 1);
      const ny = Math.round(n.y);
      drawTextOutlined(g, n.text, nx, ny, n.color || (big ? "#ffe08a" : "#fff"), sc, true);
      g.restore();
    }
    applyScreen(g);
    drawRift(g);
    drawGlass(g);
    if (vignetteA > 0) {
      g.save();
      g.globalAlpha = vignetteA * Math.max(0.2, vignetteLife);
      g.fillStyle = "#0a0614";
      g.fillRect(0, 0, INTERNAL_W2, 18);
      g.fillRect(0, INTERNAL_H2 - 18, INTERNAL_W2, 18);
      g.fillRect(0, 0, 24, INTERNAL_H2);
      g.fillRect(INTERNAL_W2 - 24, 0, 24, INTERNAL_H2);
      g.restore();
    }
    if (flashT > 0) {
      g.save();
      g.globalAlpha = Math.max(0, flashT / flashDur) * 0.9;
      g.fillStyle = flashColor;
      g.fillRect(0, 0, INTERNAL_W2, INTERNAL_H2);
      g.restore();
    }
    applyWorld(g);
  }
  function reset4() {
    particles.length = 0;
    fx.length = 0;
    numbers.length = 0;
    decals.length = 0;
    afters.length = 0;
    shards.length = 0;
    flashT = 0;
    shakeDur = 0;
    shakeMag = 0;
    crackT = 0;
    riftT = 0;
    vignetteA = 0;
    slowTint = 0;
    setShake(0, 0);
    setFilter("");
  }
  function spawn2(req) {
    onVfx(req);
  }

  // src/render/showcase.js
  var KINDS = [
    "slash_arc",
    "beam",
    "shockwave",
    "ring",
    "muzzle",
    "sparks",
    "impact",
    "dust",
    "afterimage",
    "charge",
    "shield_arc",
    "heal_pillar",
    "explosion",
    "gold_sparks",
    "text",
    "num",
    "scorch",
    "crack",
    "rift"
  ];
  var CAST = [
    { id: "deepseek", label: "DEEPSEEK" },
    { id: "kimi", label: "KIMI" },
    { id: "glm", label: "GLM" },
    { id: "haiku", label: "HAIKU" },
    { id: "sonnet", label: "SONNET" },
    { id: "opus", label: "OPUS 5.5" },
    { id: "astra", label: "ASTRA" },
    { id: "fable", label: "FABLE" },
    { id: "fablehand", label: "HAND" },
    { id: "dario", label: "DARIO" },
    { id: "stele", label: "STELE" }
  ];
  var SHAPES = ["fin", "orb", "bolt", "petal", "glyph", "quill", "feather", "node", "whale", "star", "hammer"];
  var installed = false;
  var t = 0;
  var kindI = 0;
  var nextPulse = 0;
  var ctxRef = null;
  function emit(kind, extra) {
    const payload = Object.assign({ kind }, extra || {});
    if (ctxRef && ctxRef.bus) ctxRef.bus.emit(EVENTS.VFX, payload);
    else spawn2(payload);
  }
  function pulse(kind) {
    const cx = 240;
    const cy = 150;
    if (kind === "slash_arc" || kind === "slash") {
      for (let i = 0; i < 8; i += 1) {
        emit("slash_arc", {
          x: cx + Math.cos(Math.PI * 2 * i / 8) * 18,
          y: cy + Math.sin(Math.PI * 2 * i / 8) * 18,
          angle: Math.PI * 2 * i / 8,
          r: 32,
          color: "#7ee0ff",
          who: "deepseek"
        });
      }
      emit("shake" === kind ? {} : { kind: "impact", x: cx, y: cy, color: "#7ee0ff" });
    } else if (kind === "beam") {
      emit("beam", { x: 80, y: 140, x2: 400, y2: 160, w: 14, color: "#d7f4ff", who: "kimi", life: 0.4 });
    } else if (kind === "shockwave" || kind === "shock") {
      emit("shockwave", { x: cx, y: cy, r: 90, color: "#ffe08a", who: "glm" });
    } else if (kind === "ring") {
      emit("ring", { x: cx, y: cy, r: 48, color: "#d8b15a" });
    } else if (kind === "muzzle") {
      emit("muzzle", { x: cx + 20, y: cy - 8, color: "#7ee0ff", who: "deepseek" });
    } else if (kind === "sparks" || kind === "spark") {
      emit("sparks", { x: cx, y: cy, color: "#f4f1ea", n: 16 });
    } else if (kind === "impact") {
      emit("impact", { x: cx, y: cy, color: "#fff", heavy: true });
    } else if (kind === "dust") {
      emit("dust", { x: cx, y: cy + 10, n: 10 });
    } else if (kind === "afterimage") {
      emit("afterimage", { x: cx - 16, y: cy, sprite: "deepseek" });
      emit("afterimage", { x: cx, y: cy, sprite: "deepseek" });
    } else if (kind === "charge") {
      emit("charge", { x: cx, y: cy - 8, color: "#d7f4ff", r: 24 });
    } else if (kind === "shield_arc") {
      emit("shield_arc", { x: cx, y: cy, angle: -0.4, perfect: true, r: 26 });
    } else if (kind === "heal_pillar" || kind === "heal") {
      emit("heal_pillar", { x: cx, y: cy });
    } else if (kind === "explosion") {
      emit("explosion", { x: cx, y: cy, r: 36 });
    } else if (kind === "gold_sparks") {
      emit("gold_sparks", { x: cx, y: cy, n: 20 });
    } else if (kind === "text") {
      emit("text", { x: cx - 20, y: cy - 30, text: "PERFECT", color: "#ffe08a" });
    } else if (kind === "num") {
      emit("num", { x: cx, y: cy - 20, text: "88", color: "#ffe08a", heavy: true });
      emit("num", { x: cx + 20, y: cy - 8, text: "12", color: "#ffb4b4" });
    } else if (kind === "scorch") {
      emit("scorch", { x: cx, y: cy + 8 });
    } else if (kind === "crack") {
      emit("crack", { life: 1.2 });
    } else if (kind === "rift") {
      emit("rift", { life: 1.4 });
    }
    if (ctxRef && ctxRef.bus) {
      ctxRef.bus.emit(EVENTS.SHAKE, { mag: 4, dur: 0.18 });
      ctxRef.bus.emit(EVENTS.FLASH, { color: "rgba(255,255,255,0.18)", dur: 0.07 });
    }
  }
  function drawCast(g, time) {
    const startX = 108;
    const y = 118;
    for (let i = 0; i < CAST.length; i += 1) {
      const c = CAST[i];
      const x = startX + i * 48;
      draw(g, c.id, x, y, {
        frame: Math.floor(time * 8) % 4,
        flip: false
      });
      drawTextOutlined(g, c.label, x - 14, y + 2, "#f4f1ea", 1, false);
    }
  }
  function drawFlasks(g, time) {
    draw(g, "flask_rtx", 24, 80, { frame: Math.floor(time * 10) % 4 });
    draw(g, "flask_h200", 24, 104, { frame: Math.floor(time * 10) % 4 });
    draw(g, "flask_b200", 24, 128, { frame: Math.floor(time * 10) % 4 });
    drawTextOutlined(g, "GPU", 10, 140, "#9dff9a", 1, false);
  }
  function drawBullets(g, time) {
    for (let i = 0; i < SHAPES.length; i += 1) {
      const x = 100 + i * 22;
      const y = 328;
      draw(g, SHAPES[i], x, y, { frame: Math.floor(time * 10) % 2 });
    }
  }
  function drawAiIfPresent(g) {
    const ids = [
      ["v2_deepseek_sheet_48", 48],
      ["v2_kimi_sheet_48", 48],
      ["v2_glm_sheet_48", 48],
      ["v2_haiku_sheet", 96],
      ["v2_sonnet_sheet", 128],
      ["v2_opus_sheet", 192],
      ["v2_astra_mature_sheet", 128]
    ];
    let x = 20;
    for (let i = 0; i < ids.length; i += 1) {
      const img = loadImage(ids[i][0]);
      if (img && img.complete && img.naturalWidth > 0 && !(img.dataset && img.dataset.dead === "1")) {
        const fw = ids[i][1];
        g.imageSmoothingEnabled = false;
        const dw = Math.min(40, fw);
        g.drawImage(img, 0, 0, fw, fw, x, 200, dw, dw);
        x += dw + 4;
      }
    }
  }
  function overlayRender(ctx2, g) {
    applyScreen(g);
    const time = ctx2 && ctx2.time ? ctx2.time.elapsed : t;
    if (ctx2 && ctx2.state) {
      const prev2 = ctx2.state.current;
      ctx2.state.current = "fight";
      render(ctx2, g);
      ctx2.state.current = prev2;
    } else {
      g.fillStyle = "#0b0a12";
      g.fillRect(0, 0, INTERNAL_W, INTERNAL_H);
    }
    applyScreen(g);
    g.fillStyle = "rgba(8,8,14,0.55)";
    g.fillRect(0, 0, 80, INTERNAL_H);
    g.fillRect(560, 0, 80, INTERNAL_H);
    g.fillStyle = "rgba(8,8,14,0.42)";
    g.fillRect(80, 0, 480, 22);
    drawText5(g, "VFX TEST", 10, 8, "#d8b15a", 1);
    drawCjk(g, "\u7279\u6548\u6D4B\u8BD5", 10, 22, "#f4f1ea", 9);
    const kind = KINDS[kindI % KINDS.length];
    drawTextOutlined(g, kind.toUpperCase(), 90, 6, "#7ee0ff", 1, false);
    drawTextOutlined(g, "PROCEDURAL", 90, 16, "#f4f1ea", 1, false);
    drawCast(g, time);
    drawAiIfPresent(g);
    drawBullets(g, time);
    drawFlasks(g, time);
    drawTextOutlined(g, "CODE DRAWN + SHEET LAYERS", 200, 340, "#d8b15a", 1, false);
  }
  function overlayUpdate2(ctx2, dt) {
    t += dt || 0;
    nextPulse -= dt || 0;
    if (nextPulse <= 0) {
      pulse(KINDS[kindI % KINDS.length]);
      kindI += 1;
      nextPulse = 0.85;
    }
  }
  function install(ctx2) {
    if (installed) return;
    installed = true;
    ctxRef = ctx2;
    setOverlay(overlayRender, overlayUpdate2);
    if (ctx2 && ctx2.world) ctx2.world.vfxtest = true;
    const ui = typeof document !== "undefined" ? document.getElementById("ui-root") : null;
    if (ui) ui.style.display = "none";
    pulse("slash_arc");
    pulse("shockwave");
  }

  // src/render/sprites.js
  var footRingSample = null;
  var PLAYER_FOOT_RING = Object.freeze({
    deepseek: "#3fa9ff",
    glm: "#ffffff",
    kimi: "#a566ff"
  });
  var WHO = {
    deepseek: { sheet: "v2_deepseek_sheet_48", alt: "v2_deepseek_sheet", family: "deepseek", player: true },
    kimi: { sheet: "v2_kimi_sheet_48", alt: "v2_kimi_sheet", family: "kimi", player: true },
    glm: { sheet: "v2_glm_sheet_48", alt: "v2_glm_sheet", family: "glm", player: true },
    "boss.p1": { sheet: "v2_haiku_sheet", family: "haiku", boss: true },
    haiku: { sheet: "v2_haiku_sheet", family: "haiku", boss: true },
    "boss.p2": { sheet: "v2_sonnet_sheet", family: "sonnet", boss: true },
    sonnet: { sheet: "v2_sonnet_sheet", family: "sonnet", boss: true },
    "boss.p3": { sheet: "v2_opus_sheet", family: "opus", boss: true },
    opus: { sheet: "v2_opus_sheet", family: "opus", boss: true },
    astra: { sheet: "v2_astra_mature_sheet", alt: "v2_astra_sheet", family: "astra" },
    "fable.hand": { sheet: "v2_fable_hand", family: "fablehand" },
    fable: { sheet: null, family: "fable" },
    dario: { sheet: "v2_dario_holo_flicker_sheet", alt: "v2_dario_holo", family: "dario" },
    stele: { sheet: null, family: "stele" }
  };
  var PROJ = {
    fin: "v2_proj_deepseek_fin",
    wave: "v2_proj_deepseek_wave",
    whale: "v2_proj_deepseek_wave",
    orb: "v2_proj_kimi_star",
    star: "v2_proj_kimi_star",
    moon: "v2_proj_kimi_moon",
    bolt: "v2_proj_glm_hammer",
    hammer: "v2_proj_glm_hammer",
    shard: "v2_proj_glm_shard",
    petal: "v2_proj_haiku_petal",
    needle: "v2_proj_haiku_needle",
    quill: "v2_proj_haiku_needle",
    glyph: "v2_proj_sonnet_rune",
    rune: "v2_proj_sonnet_rune",
    seal: "v2_proj_sonnet_seal",
    feather: "v2_proj_opus_feather",
    node: "v2_proj_opus_node",
    knot: "v2_proj_astra_knot",
    lance: "v2_proj_astra_lance"
  };
  var FLASK_IDS = {
    rtx5090: "v2_gpu_5090",
    h200: "v2_gpu_h200",
    b200: "v2_gpu_b200"
  };
  var flashCache = /* @__PURE__ */ new Map();
  var tintCache = /* @__PURE__ */ new Map();
  function ready2(img) {
    return !!(img && img.complete && img.naturalWidth > 0 && !(img.dataset && img.dataset.dead === "1"));
  }
  function whoOf2(id) {
    const key = String(id || "").replace(/^px\./, "");
    if (WHO[key]) return { key, spec: WHO[key] };
    const head = key.split(".")[0];
    if (head === "boss") {
      const rest = key.slice(5);
      const k = rest ? `boss.${rest.split(".")[0]}` : "boss.p1";
      if (WHO[k]) return { key: k, spec: WHO[k] };
    }
    if (WHO[head]) return { key: head, spec: WHO[head] };
    return { key: "deepseek", spec: WHO.deepseek };
  }
  function v2Entry(id) {
    return V2_ASSETS && V2_ASSETS[id] || null;
  }
  function sheetMeta(id) {
    const e = v2Entry(id);
    if (!e) return null;
    const sh = e.sheet || {};
    const fw = sh.frameWidth || e.size && e.size[0] || 48;
    const fh = sh.frameHeight || e.size && e.size[1] || fw;
    const cols = sh.cols || Math.max(1, e.frames && fw ? Math.round(e.frames * fw > 0 ? e.frames : 1) : 1);
    return {
      id,
      frameW: fw,
      frameH: fh,
      cols: sh.cols || 0,
      rows: sh.rows || 1,
      anchor: sh.anchor || "bottom-center",
      anims: sh.anims || null,
      frames: e.frames || 1,
      fps: e.fps || 8,
      size: e.size
    };
  }
  function imageForWho(spec) {
    const a = spec.sheet ? loadImage(spec.sheet) : null;
    if (ready2(a)) return { img: a, id: spec.sheet, meta: sheetMeta(spec.sheet) };
    if (a && !a.complete) return { img: a, id: spec.sheet, meta: sheetMeta(spec.sheet), loading: true };
    if (spec.alt) {
      const b = loadImage(spec.alt);
      if (ready2(b) || b && !b.complete) return { img: b, id: spec.alt, meta: sheetMeta(spec.alt), loading: !ready2(b) };
    }
    return { img: null, id: null, meta: null };
  }
  function whiteSilhouette(img) {
    if (!ready2(img)) return null;
    let c = flashCache.get(img);
    if (c) return c;
    c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = "source-in";
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, c.width, c.height);
    flashCache.set(img, c);
    return c;
  }
  function tinted(img, color) {
    if (!ready2(img)) return null;
    const key = color;
    let map = tintCache.get(img);
    if (map && map[key]) return map[key];
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = "source-in";
    g.fillStyle = color;
    g.fillRect(0, 0, c.width, c.height);
    if (!map) {
      map = {};
      tintCache.set(img, map);
    }
    map[key] = c;
    return c;
  }
  function animFrame(meta, img, anim, t2) {
    const fw = meta.frameW;
    const fh = meta.frameH;
    let cols = meta.cols;
    if (!cols) {
      cols = fw > 0 ? Math.max(1, Math.round(img.naturalWidth / fw)) : 1;
    }
    const rows = meta.rows || Math.max(1, Math.round(img.naturalHeight / fh));
    const anims = meta.anims;
    let row2 = 0;
    let list2 = [0];
    let fps2 = meta.fps || 8;
    if (anims && anims[anim]) {
      const a = anims[anim];
      row2 = a.row || 0;
      fps2 = a.fps || fps2;
      if (Array.isArray(a.frames)) list2 = a.frames;
      else {
        const n = typeof a.frames === "number" ? a.frames : 1;
        list2 = [];
        for (let i2 = 0; i2 < n; i2 += 1) list2.push(i2);
      }
    } else if (anims) {
      const fallback = anims.idle_down || anims.idle || anims.idle_bob || anims.walk_down || null;
      if (fallback) return animFrame(meta, img, fallback === anims.idle_down ? "idle_down" : fallback === anims.idle ? "idle" : fallback === anims.idle_bob ? "idle_bob" : "walk_down", t2);
      list2 = [0];
    } else {
      const n = meta.frames || cols;
      list2 = [];
      for (let i2 = 0; i2 < n; i2 += 1) list2.push(i2);
    }
    const i = Math.floor(t2 * fps2 % Math.max(1, list2.length));
    const col = list2[i] || 0;
    return {
      sx: col * fw,
      sy: row2 * fh,
      fw,
      fh,
      cols,
      rows
    };
  }
  function pickAnim(actor, spec) {
    const face = String(actor.facing || "s");
    const moving = Math.hypot(actor.vx || 0, actor.vy || 0) > 8 || actor.rolling;
    if (actor.flash > 0 || actor.pose === "hurt") return { anim: spec.player ? "hurt" : "hurt", flip: faceLeft(face) };
    if (actor.pose === "down") return { anim: spec.player ? "hurt" : "hurt", flip: faceLeft(face) };
    if (actor.pose === "windup" || actor.pose === "cast" || actor.cast && spec.boss) {
      return { anim: spec.player ? "skill" : "cast", flip: faceLeft(face) };
    }
    if (actor.pose === "attack") return { anim: "attack", flip: faceLeft(face) };
    if (actor.skillKind || actor.charging || actor.shield || actor.flaskT > 0 || actor.pose === "skill") {
      return { anim: spec.player ? "skill" : "attack", flip: faceLeft(face) };
    }
    if (spec.player && (actor.fireCd || 0) > 0.04) {
      return { anim: "attack", flip: faceLeft(face) };
    }
    if (moving) {
      if (spec.player) {
        if (faceUp(face)) return { anim: "walk_up", flip: false };
        if (faceDown(face)) return { anim: "walk_down", flip: false };
        return { anim: "walk_side_right", flip: faceLeft(face) };
      }
      return { anim: "idle", flip: faceLeft(face) };
    }
    if (spec.player) return { anim: "idle_down", flip: faceLeft(face) };
    return { anim: "idle", flip: faceLeft(face) };
  }
  function faceLeft(face) {
    return face === "left" || face === "w" || face === "nw" || face === "sw" || face === "a";
  }
  function faceUp(face) {
    return face === "up" || face === "n" || face === "ne" || face === "nw";
  }
  function faceDown(face) {
    return face === "down" || face === "s" || face === "se" || face === "sw" || face === "e" || !face;
  }
  function spriteId(actor) {
    if (!actor) return "px.unknown";
    if (actor.sprite) return actor.sprite;
    if (actor.team === "boss") return `px.boss.p${actor.phase || 1}`;
    return `px.${actor.id || "deepseek"}`;
  }
  function bossDrawScale(actor, fh) {
    if (!actor || actor.team !== "boss") return 1;
    const phase = actor.phase || 1;
    if (phase >= 3 || fh >= 160) return 0.7;
    if (phase === 2 || fh >= 112) return 0.86;
    return 1;
  }
  function shadowW(actor) {
    if (actor.team === "boss") return 18 + (actor.phase || 1) * 6;
    if (actor.id === "stele") return 14;
    if (String(actor.sprite || "").indexOf("astra") >= 0) return 18;
    return 12;
  }
  function drawActor(g, ctx2, actor) {
    if (!actor) return;
    const id = spriteId(actor);
    const { spec } = whoOf2(id);
    const t2 = ctx2.time ? ctx2.time.elapsed : 0;
    const pick = pickAnim(actor, spec);
    const x = Math.round(actor.x);
    const y = Math.round(actor.y);
    const alpha = actor.alive === false ? 0.38 : actor.invuln > 0 && (t2 * 20 | 0) % 2 === 0 ? 0.45 : 1;
    const squash = actor.rolling ? 0.78 : actor.pose === "down" ? 0.7 : 1;
    const stretch = actor.rolling ? 1.15 : 1;
    const flash = !!(actor.flash > 0);
    const packed = imageForWho(spec);
    let usedSheet = false;
    if (packed.img && ready2(packed.img) && packed.meta) {
      const fr = animFrame(packed.meta, packed.img, pick.anim, t2);
      const sc = bossDrawScale(actor, fr.fh);
      const ax = fr.fw / 2 * sc;
      const ay = (fr.fh - 2) * sc;
      const dw = Math.round(fr.fw * sc);
      const dh = Math.round(fr.fh * sc);
      g.save();
      g.globalAlpha = alpha;
      g.translate(x, y);
      if (pick.flip) g.scale(-1, 1);
      g.scale(stretch, squash);
      g.imageSmoothingEnabled = false;
      g.drawImage(packed.img, fr.sx, fr.sy, fr.fw, fr.fh, Math.round(-ax), Math.round(-ay), dw, dh);
      if (flash) {
        const sil = whiteSilhouette(packed.img);
        if (sil) {
          g.globalAlpha = 0.42;
          g.drawImage(sil, fr.sx, fr.sy, fr.fw, fr.fh, Math.round(-ax), Math.round(-ay), dw, dh);
        }
      }
      g.restore();
      usedSheet = true;
    }
    if (!usedSheet) {
      const proc = getSheet(spec.family);
      const frames = proc.frames || 4;
      const moving = Math.hypot(actor.vx || 0, actor.vy || 0) > 8 || actor.rolling;
      const frame2 = moving ? Math.floor(t2 * proc.fps) % frames : Math.floor(t2 * 2) % 2;
      draw(g, spec.family, x, y, {
        flip: pick.flip,
        flash,
        frame: frame2,
        pose: actor.pose || (actor.rolling ? "roll" : ""),
        alpha,
        squash,
        stretch
      });
    }
    if (actor.shield) drawShield(g, actor);
    if (actor.charging) drawChargeAura(g, actor, t2);
    if (actor.team === "player" || actor.team === "ally" || ctx2.debug?.showHitboxes) {
      g.fillStyle = "#1b1530";
      g.fillRect(x - 2, y - 2, 5, 5);
      g.fillStyle = actor.invuln > 0 ? "#ffd0d0" : "#f4f1ea";
      g.fillRect(x - 1, y - 1, 3, 3);
    }
    if (ctx2.debug?.showHitboxes) {
      g.strokeStyle = "rgba(255,80,80,0.85)";
      g.beginPath();
      g.arc(x, y, actor.r || 3, 0, Math.PI * 2);
      g.stroke();
    }
  }
  function drawShield(g, actor) {
    const ang = Math.atan2(actor.aimY || 0, actor.aimX || 1);
    const arc = actor.shieldArc || 100 * Math.PI / 180;
    const perfect = (actor.shieldAge || 0) <= (actor.perfectWindow || 0.2);
    g.save();
    g.translate(Math.round(actor.x), Math.round(actor.y) - 6);
    g.rotate(ang);
    g.fillStyle = perfect ? "rgba(255,224,138,0.28)" : "rgba(216,177,90,0.22)";
    g.beginPath();
    g.moveTo(0, 0);
    g.arc(0, 0, 32, -arc * 0.5, arc * 0.5);
    g.closePath();
    g.fill();
    g.strokeStyle = perfect ? "#ffe08a" : "#d8b15a";
    g.lineWidth = perfect ? 5 : 4;
    g.globalAlpha = 0.95;
    g.beginPath();
    g.arc(0, 0, 32, -arc * 0.5, arc * 0.5);
    g.stroke();
    g.strokeStyle = "#fff";
    g.lineWidth = 2;
    g.beginPath();
    g.arc(0, 0, 28, -arc * 0.5, arc * 0.5);
    g.stroke();
    g.restore();
  }
  function drawChargeAura(g, actor, t2) {
    const r = 10 + Math.sin(t2 * 14) * 3;
    g.save();
    g.globalAlpha = 0.55;
    g.strokeStyle = "#d7f4ff";
    g.lineWidth = 2;
    g.beginPath();
    g.arc(Math.round(actor.x), Math.round(actor.y) - 8, r, 0, Math.PI * 2);
    g.stroke();
    g.restore();
  }
  function footRingStroke(player) {
    const id = String(player.id || "deepseek");
    if (id === "glm") return { stroke: PLAYER_FOOT_RING.glm, outline: "#1b1530" };
    return { stroke: PLAYER_FOOT_RING[id] || PLAYER_FOOT_RING.deepseek, outline: null };
  }
  function drawControlledFootRing(g, player, t2) {
    const x = Math.round(player.x);
    const footY = Math.round(player.y) + 1;
    const vx = player.vx || 0;
    const vy = player.vy || 0;
    const moving = Math.hypot(vx, vy) > 8;
    const rolling = !!player.rolling;
    let rx = 10;
    let ry = 4;
    if (moving) {
      rx = 12;
      ry = 5;
    }
    if (rolling) {
      rx = 14;
      ry = 5;
    }
    const style = footRingStroke(player);
    g.save();
    g.lineWidth = 1;
    if (style.outline) {
      g.strokeStyle = style.outline;
      g.lineWidth = 3;
      g.beginPath();
      g.ellipse(x, footY, rx + 1, ry + 1, 0, 0, Math.PI * 2);
      g.stroke();
      g.lineWidth = 1;
    }
    g.strokeStyle = style.stroke;
    for (let ring2 = 0; ring2 < 2; ring2 += 1) {
      const inset = ring2 * 2;
      g.beginPath();
      g.ellipse(x, footY, rx - inset, Math.max(2, ry - ring2), 0, 0, Math.PI * 2);
      g.stroke();
    }
    const tick2 = 3;
    g.fillStyle = style.stroke;
    g.fillRect(x - 1, footY - ry - tick2, 2, tick2);
    g.fillRect(x - 1, footY + ry, 2, tick2);
    g.fillRect(x - rx - tick2, footY - 1, tick2, 2);
    g.fillRect(x + rx, footY - 1, tick2, 2);
    footRingSample = {
      x,
      footY,
      rx,
      ry,
      stroke: style.stroke,
      tickEast: { bx: x + rx + 1, by: footY },
      rolling,
      moving
    };
    if (rolling) {
      const pulse2 = 0.35 + Math.sin(t2 * 22) * 0.15;
      g.globalAlpha = pulse2;
      g.strokeStyle = style.stroke;
      g.beginPath();
      g.ellipse(x, footY, rx + 3, ry + 2, 0, 0, Math.PI * 2);
      g.stroke();
    }
    g.restore();
  }
  function drawShadows(ctx2, g) {
    const list2 = [];
    if (ctx2.player) list2.push(ctx2.player);
    if (ctx2.boss && (ctx2.state.current === "fight" || ctx2.state.current === "paused" || ctx2.state.current === "cutscene")) {
      list2.push(ctx2.boss);
    }
    const allies = ctx2.allies || [];
    for (let i = 0; i < allies.length; i += 1) list2.push(allies[i]);
    if (ctx2.stele && ctx2.state.current === "intro") list2.push(ctx2.stele);
    for (let i = 0; i < list2.length; i += 1) {
      const a = list2[i];
      if (!a) continue;
      const w = shadowW(a);
      g.fillStyle = "rgba(27, 21, 48, 0.32)";
      g.fillRect(Math.round(a.x - w / 2), Math.round(a.y - 2), w, 4);
    }
    const st = ctx2.state && ctx2.state.current;
    footRingSample = null;
    if (ctx2.player && (st === "fight" || st === "paused" || st === "intro")) {
      const t2 = ctx2.time ? ctx2.time.elapsed : 0;
      drawControlledFootRing(g, ctx2.player, t2);
    }
  }
  function collect2(ctx2, items, g) {
    const state = ctx2.state.current;
    function add(a) {
      if (!a) return;
      if (a === ctx2.boss && state !== "fight" && state !== "paused" && state !== "cutscene" && state !== "banned") return;
      if (a === ctx2.stele && state !== "intro") return;
      items.push({ y: a.y, draw: () => drawActor(g, ctx2, a) });
    }
    add(ctx2.player);
    add(ctx2.boss);
    add(ctx2.stele);
    const allies = ctx2.allies || [];
    for (let i = 0; i < allies.length; i += 1) add(allies[i]);
  }
  function drawPx(g, id, x, y, opts = {}) {
    const { spec } = whoOf2(id);
    const packed = imageForWho(spec);
    if (packed.img && ready2(packed.img) && packed.meta) {
      const t2 = opts.t || 0;
      const anim = opts.anim || (spec.player ? "idle_down" : "idle");
      const fr = animFrame(packed.meta, packed.img, anim, t2);
      const img = opts.flash ? whiteSilhouette(packed.img) || packed.img : packed.img;
      g.save();
      g.globalAlpha = opts.alpha == null ? 1 : opts.alpha;
      g.translate(Math.round(x), Math.round(y));
      if (opts.flip) g.scale(-1, 1);
      g.imageSmoothingEnabled = false;
      g.drawImage(img, fr.sx, fr.sy, fr.fw, fr.fh, Math.round(-fr.fw / 2), Math.round(-(fr.fh - 2)), fr.fw, fr.fh);
      g.restore();
      return;
    }
    draw(g, spec.family, x, y, opts);
  }
  function drawIcon(g, flaskId, x, y) {
    const vid = FLASK_IDS[flaskId] || flaskId;
    const img = loadImage(vid);
    if (ready2(img)) {
      g.imageSmoothingEnabled = false;
      g.drawImage(img, Math.round(x), Math.round(y));
      return;
    }
    const fam = flaskId === "h200" ? "flask_h200" : flaskId === "b200" ? "flask_b200" : "flask_rtx";
    draw(g, fam, x + 8, y + 14, {});
  }
  function disk(g, cx, cy, r, color) {
    g.fillStyle = color;
    const R = Math.ceil(r);
    const rr = r * r;
    for (let y = -R; y <= R; y += 1) {
      const span = rr - y * y;
      if (span < 0) continue;
      const w = Math.floor(Math.sqrt(span));
      g.fillRect(cx - w, cy + y, w * 2 + 1, 1);
    }
  }
  function drawWhaleSprite(g) {
    const ink = "#041018";
    const body = "#3ecfff";
    const belly = "#f7fdff";
    const fin = "#1478b0";
    g.fillStyle = ink;
    g.fillRect(-18, -9, 12, 6);
    g.fillRect(-18, 3, 12, 6);
    g.fillRect(-12, -4, 6, 8);
    g.fillStyle = body;
    g.fillRect(-17, -8, 10, 4);
    g.fillRect(-17, 4, 10, 4);
    g.fillRect(-12, -3, 5, 6);
    g.fillStyle = ink;
    g.fillRect(-9, -8, 22, 16);
    g.fillStyle = body;
    g.fillRect(-8, -7, 20, 14);
    g.fillStyle = belly;
    g.fillRect(-5, 0, 13, 6);
    g.fillStyle = ink;
    g.fillRect(10, -6, 7, 11);
    g.fillStyle = body;
    g.fillRect(10, -5, 6, 9);
    g.fillStyle = ink;
    g.fillRect(15, -3, 4, 6);
    g.fillStyle = belly;
    g.fillRect(16, -2, 2, 4);
    g.fillStyle = "#ffffff";
    g.fillRect(4, -5, 4, 4);
    g.fillStyle = ink;
    g.fillRect(6, -4, 2, 2);
    g.fillStyle = ink;
    g.fillRect(-2, 6, 9, 4);
    g.fillStyle = fin;
    g.fillRect(-1, 6, 7, 3);
    g.fillStyle = "#ffffff";
    g.fillRect(1, -12, 2, 3);
    g.fillRect(4, -14, 2, 3);
  }
  function drawMoonSprite(g) {
    disk(g, -1, 0, 9, "#160818");
    g.fillStyle = "#e9d5ff";
    for (let y = -11; y <= 11; y += 1) {
      for (let x = -11; x <= 11; x += 1) {
        if (x * x + y * y > 121) continue;
        if ((x + 7) * (x + 7) + y * y < 110) continue;
        g.fillRect(x, y, 1, 1);
      }
    }
    g.fillStyle = "#7c3aed";
    for (let y = -11; y <= 11; y += 1) {
      for (let x = -2; x <= 11; x += 1) {
        const d = x * x + y * y;
        if (d <= 121 && d >= 100 && (x + 7) * (x + 7) + y * y >= 110) g.fillRect(x, y, 1, 1);
      }
    }
    disk(g, -3, 0, 6, "#10060f");
    g.fillStyle = "#f8f1ff";
    g.fillRect(6, -4, 2, 2);
  }
  function drawZSprite(g) {
    const rows = [
      "111111111",
      "111111111",
      "11.....11",
      "...11111.",
      "..11111..",
      ".11111...",
      "11.....11",
      "111111111",
      "111111111"
    ];
    const s = 2;
    const ox2 = -(rows[0].length * s >> 1);
    const oy2 = -(rows.length * s >> 1);
    for (let pass = 0; pass < 2; pass += 1) {
      const color = pass === 0 ? "#1b1204" : "#ffe08a";
      const grow = pass === 0 ? 1 : 0;
      g.fillStyle = color;
      for (let y = 0; y < rows.length; y += 1) {
        const row2 = rows[y];
        for (let x = 0; x < row2.length; x += 1) {
          if (row2[x] !== "1") continue;
          g.fillRect(ox2 + x * s - grow, oy2 + y * s - grow, s + grow * 2, s + grow * 2);
        }
      }
    }
    g.fillStyle = "#fff6c8";
    g.fillRect(ox2 + 2, oy2 + 2, 4, 2);
    g.fillRect(ox2 + rows[0].length * s - 6, oy2 + rows.length * s - 4, 4, 2);
  }
  function drawThemedProjectile(g, b, shape) {
    const x = Math.round(b.x);
    const y = Math.round(b.y);
    g.save();
    g.translate(x, y);
    g.imageSmoothingEnabled = false;
    if (shape === "z" || shape === "bolt") {
      drawZSprite(g);
    } else {
      g.rotate(Math.atan2(b.vy || 0, b.vx || 1));
      if (shape === "moon") drawMoonSprite(g);
      else drawWhaleSprite(g);
    }
    g.restore();
  }
  function drawBullet(g, b) {
    const x = Math.round(b.x);
    const y = Math.round(b.y);
    const shape = String(b.shape || "dot");
    if (shape === "whale" || shape === "fin" || shape === "moon" || shape === "z" || shape === "bolt") {
      drawThemedProjectile(g, b, shape);
      return;
    }
    const vid = PROJ[shape];
    const img = vid ? loadImage(vid) : null;
    const ang = Math.atan2(b.vy || 0, b.vx || 1);
    if (ready2(img)) {
      g.save();
      g.translate(x, y);
      g.rotate(ang);
      g.imageSmoothingEnabled = false;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      g.drawImage(img, Math.round(-w / 2), Math.round(-h / 2));
      g.restore();
      return;
    }
    const fam = familyOf2(shape);
    const sheet = getSheet(fam === "deepseek" ? "petal" : fam);
    if (sheet && sheet.canvas && fam !== "deepseek") {
      g.save();
      g.translate(x, y);
      g.rotate(ang);
      g.imageSmoothingEnabled = false;
      const fw = sheet.frameW;
      const fh = sheet.frameH;
      const frame2 = Math.floor((b.age || 0) * sheet.fps) % sheet.frames;
      g.drawImage(sheet.canvas, frame2 * fw, 0, fw, fh, Math.round(-fw / 2), Math.round(-fh / 2), fw, fh);
      g.restore();
      return;
    }
    const r = Math.max(2, b.r | 0);
    g.fillStyle = "#1b1530";
    g.fillRect(x - r - 1, y - r - 1, r * 2 + 3, r * 2 + 3);
    g.fillStyle = b.color || "#f4f1ea";
    g.save();
    g.translate(x, y);
    g.rotate(ang);
    if (shape === "fin" || shape === "whale" || shape === "wave") {
      g.fillRect(-r - 3, -2, r * 2 + 5, 4);
      g.fillStyle = "#7ee0ff";
      g.fillRect(r - 1, -3, 3, 6);
    } else if (shape === "orb" || shape === "star") {
      g.beginPath();
      g.arc(0, 0, r + 1, 0, Math.PI * 2);
      g.fill();
    } else if (shape === "petal") {
      g.beginPath();
      g.ellipse(0, 0, r + 2, r, 0, 0, Math.PI * 2);
      g.fill();
    } else if (shape === "feather") {
      g.fillRect(-r, -2, r * 2 + 2, 4);
      g.fillRect(r, -4, 2, 8);
    } else if (shape === "glyph" || shape === "rune" || shape === "node") {
      g.fillRect(-r, -r, r * 2, r * 2);
      g.fillStyle = "#d8b15a";
      g.fillRect(-1, -r - 1, 2, r * 2 + 2);
    } else if (shape === "quill" || shape === "needle") {
      g.fillRect(-r - 2, -1, r * 2 + 4, 2);
    } else {
      g.fillRect(-r, -r, r * 2, r * 2);
    }
    g.fillStyle = "#fff";
    g.fillRect(-1, -1, 2, 2);
    g.restore();
  }
  function snapshotActor(actor) {
    return {
      id: spriteId(actor),
      x: actor.x,
      y: actor.y,
      facing: actor.facing,
      flash: !!actor.flash,
      vx: actor.vx,
      vy: actor.vy
    };
  }
  function getFootRingSample() {
    return footRingSample;
  }
  function init6(ctx2) {
    try {
      setDrawer(drawBullet);
    } catch {
    }
    if (ctx2) {
      ctx2.world.sprites = {
        drawActor,
        drawPx,
        drawIcon,
        drawBullet,
        footRingSample: () => footRingSample,
        PLAYER_FOOT_RING
      };
    }
    try {
      warmup();
    } catch {
    }
    if (ctx2 && typeof location !== "undefined" && /(?:\?|&)vfxtest=1(?:&|$)/.test(location.search)) {
      install(ctx2);
    }
  }
  function update5(ctx2, dt) {
    const list2 = [ctx2.player, ctx2.boss, ctx2.stele, ...ctx2.allies || []];
    for (let i = 0; i < list2.length; i += 1) {
      const a = list2[i];
      if (a && a.flash > 0) a.flash = Math.max(0, a.flash - dt);
    }
  }
  function reset5() {
  }

  // src/boss/telegraph.js
  var INK = "#1b1530";
  var GOLD = "#e7c27a";
  var IVORY = "#f4f1ea";
  var RED = "194, 59, 59";
  var list = [];
  var seq = 1;
  function emitBoth(ctx2, name, tele) {
    ctx2.bus.emit(name, {
      attack: tele.attack || null,
      shape: tele.kind,
      id: tele.id,
      duration: tele.duration,
      x: tele.x,
      y: tele.y,
      r: tele.r
    });
  }
  function inRoom(x, y) {
    return x >= ROOM.x && y >= ROOM.y && x <= ROOM.x + ROOM.w && y <= ROOM.y + ROOM.h;
  }
  function spawn3(ctx2, spec) {
    const tele = {
      id: spec.id || `tg${seq}`,
      kind: spec.kind || spec.shape || "circle",
      x: spec.x || 0,
      y: spec.y || 0,
      r: spec.r || 0,
      elapsed: 0,
      duration: Math.max(0.05, spec.duration || 0.5),
      attack: spec.attack || null,
      dirX: spec.dirX == null ? 1 : spec.dirX,
      dirY: spec.dirY || 0,
      length: spec.length || spec.r || 40,
      width: spec.width || 8,
      w: spec.w || spec.width || 8,
      h: spec.h || spec.width || 8,
      arc: spec.arc || Math.PI / 2,
      safeZones: spec.safeZones || null,
      axis: spec.axis || "h",
      gap: spec.gap || 0,
      gapSize: spec.gapSize || 40,
      mark: spec.mark || "",
      fake: !!spec.fake,
      tone: spec.tone || "",
      onResolve: spec.onResolve || null,
      alive: true
    };
    seq += 1;
    list.push(tele);
    emitBoth(ctx2, EVENTS.TELEGRAPH_START, tele);
    return tele;
  }
  function angleDelta(a, b) {
    let d = Math.abs(a - b);
    if (d > Math.PI) d = Math.PI * 2 - d;
    return d;
  }
  function contains(tele, x, y) {
    if (!tele) return false;
    if (tele.kind === "fullscreen") {
      const zones = tele.safeZones || [];
      for (let i = 0; i < zones.length; i += 1) {
        const z = zones[i];
        if (Math.hypot(x - z.x, y - z.y) <= z.r) return false;
      }
      return inRoom(x, y);
    }
    if (tele.kind === "gap") {
      if (!inRoom(x, y)) return false;
      const half = (tele.gapSize || 40) * 0.5;
      if (tele.axis === "v") return Math.abs(x - tele.gap) > half;
      return Math.abs(y - tele.gap) > half;
    }
    const dx = x - tele.x;
    const dy = y - tele.y;
    const dist = Math.hypot(dx, dy);
    if (tele.kind === "rect") {
      return Math.abs(dx) <= (tele.w || 8) * 0.5 && Math.abs(dy) <= (tele.h || 8) * 0.5;
    }
    if (tele.kind === "circle" || tele.kind === "ring") return dist <= tele.r + 0.5;
    if (tele.kind === "cone" || tele.kind === "sector") {
      if (dist > tele.r) return false;
      const ang = Math.atan2(dy, dx);
      const aim = Math.atan2(tele.dirY, tele.dirX);
      return angleDelta(ang, aim) <= (tele.arc || 0) * 0.5;
    }
    if (tele.kind === "line" || tele.kind === "aim") {
      const len = tele.length || 1;
      const px = tele.dirX;
      const py = tele.dirY;
      const t2 = Math.max(0, Math.min(len, dx * px + dy * py));
      const cx = tele.x + px * t2;
      const cy = tele.y + py * t2;
      return Math.hypot(x - cx, y - cy) <= (tele.width || 8) * 0.5;
    }
    return dist <= (tele.r || 0);
  }
  function active() {
    return list.filter((t2) => t2.alive);
  }
  function snapshot() {
    const out = [];
    for (let i = 0; i < list.length; i += 1) {
      const t2 = list[i];
      if (!t2.alive) continue;
      out.push({
        kind: t2.kind,
        x: t2.x,
        y: t2.y,
        r: t2.r || t2.width || 0,
        t: t2.elapsed,
        attack: t2.attack || "",
        duration: t2.duration
      });
    }
    return out;
  }
  function update6(ctx2, dt) {
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const tele = list[i];
      if (!tele || !tele.alive) {
        if (tele) list.splice(i, 1);
        continue;
      }
      tele.elapsed += dt;
      if (tele.elapsed < tele.duration) continue;
      tele.alive = false;
      if (typeof tele.onResolve === "function") tele.onResolve(ctx2, tele);
      emitBoth(ctx2, EVENTS.TELEGRAPH_RESOLVE, tele);
      emitBoth(ctx2, EVENTS.TELEGRAPH_END, tele);
      const idx = list.indexOf(tele);
      if (idx >= 0) list.splice(idx, 1);
    }
  }
  function throb(t2, speed) {
    return 0.62 + 0.38 * Math.abs(Math.sin(t2 * (speed || 12)));
  }
  function danger(k) {
    const a = Math.max(0, Math.min(0.72, 0.16 + 0.52 * k));
    return `rgba(${RED}, ${a.toFixed(3)})`;
  }
  function strokeClosed(g, alpha) {
    g.save();
    g.globalAlpha = 0.95;
    g.lineWidth = 4;
    g.strokeStyle = INK;
    g.stroke();
    g.globalAlpha = alpha;
    g.lineWidth = 2;
    g.strokeStyle = GOLD;
    g.stroke();
    g.restore();
  }
  function poly(g, pts) {
    g.beginPath();
    g.moveTo(Math.round(pts[0][0]), Math.round(pts[0][1]));
    for (let i = 1; i < pts.length; i += 1) {
      g.lineTo(Math.round(pts[i][0]), Math.round(pts[i][1]));
    }
    g.closePath();
  }
  function lineBox(tele, dist) {
    const hw = (tele.width || 8) * 0.5;
    const px = -tele.dirY;
    const py = tele.dirX;
    const x = tele.x;
    const y = tele.y;
    const x2 = x + tele.dirX * dist;
    const y2 = y + tele.dirY * dist;
    return [
      [x + px * hw, y + py * hw],
      [x2 + px * hw, y2 + py * hw],
      [x2 - px * hw, y2 - py * hw],
      [x - px * hw, y - py * hw]
    ];
  }
  function drawSafe(g, z, t2) {
    const x = Math.round(z.x);
    const y = Math.round(z.y);
    const r = Math.max(2, Math.round(z.r));
    const pulse2 = throb(t2, 9);
    g.beginPath();
    g.arc(x, y, r + 3, 0, Math.PI * 2);
    g.fillStyle = INK;
    g.globalAlpha = 0.85;
    g.fill();
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fillStyle = IVORY;
    g.globalAlpha = 0.92;
    g.fill();
    g.beginPath();
    g.arc(x, y, r - 3, 0, Math.PI * 2);
    g.strokeStyle = GOLD;
    g.globalAlpha = pulse2;
    g.lineWidth = 2;
    g.stroke();
    g.globalAlpha = 1;
    g.fillStyle = INK;
    g.fillRect(x - 1, y - 1, 3, 3);
    g.fillStyle = "#fff";
    g.fillRect(x, y, 1, 1);
  }
  function drawTele(g, t2) {
    const k = Math.max(0, Math.min(1, t2.elapsed / t2.duration));
    const pulse2 = throb(t2.elapsed, t2.fake ? 16 : 11);
    const x = Math.round(t2.x);
    const y = Math.round(t2.y);
    if (t2.kind === "fullscreen") {
      g.globalAlpha = 1;
      g.fillStyle = danger(k);
      g.fillRect(ROOM.x, ROOM.y, ROOM.w, ROOM.h);
      g.strokeStyle = GOLD;
      g.globalAlpha = pulse2;
      g.lineWidth = 2;
      g.strokeRect(ROOM.x + 2, ROOM.y + 2, ROOM.w - 4, ROOM.h - 4);
      const zones = t2.safeZones || [];
      for (let i = 0; i < zones.length; i += 1) drawSafe(g, zones[i], t2.elapsed);
      g.globalAlpha = 1;
      return;
    }
    if (t2.kind === "gap") {
      const half = (t2.gapSize || 40) * 0.5;
      const axisV = t2.axis === "v";
      g.globalAlpha = 1;
      g.fillStyle = danger(k);
      if (axisV) {
        const cut = t2.gap;
        g.fillRect(ROOM.x, ROOM.y, Math.max(0, cut - half - ROOM.x), ROOM.h);
        const right = cut + half;
        g.fillRect(right, ROOM.y, Math.max(0, ROOM.x + ROOM.w - right), ROOM.h);
        drawSafe(g, { x: cut, y: ROOM.y + ROOM.h / 2, r: Math.min(18, half * 0.45) }, t2.elapsed);
        g.globalAlpha = pulse2;
        g.fillStyle = GOLD;
        g.fillRect(Math.round(cut - half), ROOM.y, Math.round(half * 2), 3);
        g.fillRect(Math.round(cut - half), ROOM.y + ROOM.h - 3, Math.round(half * 2), 3);
      } else {
        const cut = t2.gap;
        g.fillRect(ROOM.x, ROOM.y, ROOM.w, Math.max(0, cut - half - ROOM.y));
        const below = cut + half;
        g.fillRect(ROOM.x, below, ROOM.w, Math.max(0, ROOM.y + ROOM.h - below));
        drawSafe(g, { x: ROOM.x + ROOM.w / 2, y: cut, r: Math.min(18, half * 0.45) }, t2.elapsed);
        g.globalAlpha = pulse2;
        g.fillStyle = GOLD;
        g.fillRect(ROOM.x, Math.round(cut - half), 3, Math.round(half * 2));
        g.fillRect(ROOM.x + ROOM.w - 3, Math.round(cut - half), 3, Math.round(half * 2));
      }
      g.globalAlpha = 1;
      g.fillStyle = IVORY;
      if (axisV) g.fillRect(Math.round(t2.gap - half), ROOM.y, Math.round(half * 2), ROOM.h);
      else g.fillRect(ROOM.x, Math.round(t2.gap - half), ROOM.w, Math.round(half * 2));
      g.strokeStyle = GOLD;
      g.lineWidth = 3;
      g.globalAlpha = pulse2;
      if (axisV) g.strokeRect(Math.round(t2.gap - half), ROOM.y, Math.round(half * 2), ROOM.h);
      else g.strokeRect(ROOM.x, Math.round(t2.gap - half), ROOM.w, Math.round(half * 2));
      g.globalAlpha = 1;
      return;
    }
    if (t2.kind === "line" || t2.kind === "aim") {
      const full = lineBox(t2, t2.length || 40);
      const grow = lineBox(t2, (t2.length || 40) * k);
      const slim = t2.kind === "aim";
      poly(g, full);
      strokeClosed(g, pulse2);
      if (!t2.fake) {
        g.fillStyle = danger(Math.max(k, 0.15));
        poly(g, grow);
        g.fill();
      }
      if (slim) {
        const hx = Math.round(t2.x + t2.dirX * (t2.length || 40) * k);
        const hy = Math.round(t2.y + t2.dirY * (t2.length || 40) * k);
        g.fillStyle = t2.tone === "gold" ? GOLD : "#fff";
        g.fillRect(hx - 2, hy - 2, 5, 5);
        g.fillStyle = INK;
        g.fillRect(hx - 1, hy - 1, 3, 3);
      }
      return;
    }
    if (t2.kind === "cone" || t2.kind === "sector") {
      const aim = Math.atan2(t2.dirY, t2.dirX);
      const half = (t2.arc || 1) * 0.5;
      const r = Math.max(2, t2.r);
      const blink = !t2.fake || t2.elapsed % (t2.duration * 0.5) < t2.duration * 0.5 * 0.62;
      g.beginPath();
      g.moveTo(x, y);
      g.arc(x, y, r, aim - half, aim + half);
      g.closePath();
      if (t2.fake) {
        g.save();
        g.globalAlpha = blink ? 0.62 : 0.12;
        g.fillStyle = GOLD;
        g.fill();
        g.globalAlpha = blink ? 1 : 0.3;
        g.lineWidth = 4;
        g.strokeStyle = INK;
        g.stroke();
        g.strokeStyle = "#fff6d0";
        g.lineWidth = 2;
        g.stroke();
        g.restore();
        return;
      }
      strokeClosed(g, pulse2);
      g.beginPath();
      g.moveTo(x, y);
      g.arc(x, y, Math.max(1, r * k), aim - half, aim + half);
      g.closePath();
      g.fillStyle = danger(1);
      g.fill();
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(Math.round(x + Math.cos(aim) * r), Math.round(y + Math.sin(aim) * r));
      g.strokeStyle = "rgba(255,255,255,0.85)";
      g.lineWidth = 1;
      g.stroke();
      return;
    }
    if (t2.kind === "rect") {
      const w = t2.w || 20;
      const h = t2.h || 12;
      g.strokeStyle = INK;
      g.lineWidth = 4;
      g.strokeRect(Math.round(x - w / 2), Math.round(y - h / 2), w, h);
      g.strokeStyle = GOLD;
      g.globalAlpha = pulse2;
      g.lineWidth = 2;
      g.strokeRect(Math.round(x - w / 2), Math.round(y - h / 2), w, h);
      g.globalAlpha = 1;
      g.fillStyle = danger(1);
      g.fillRect(Math.round(x - w * k / 2), Math.round(y - h * k / 2), Math.round(w * k), Math.round(h * k));
      return;
    }
    const radius = Math.max(2, t2.r || 8);
    g.beginPath();
    g.arc(x, y, radius, 0, Math.PI * 2);
    strokeClosed(g, pulse2);
    if (t2.kind === "ring" || t2.mark === "sigil" || t2.mark === "glyph") {
      const spin = t2.elapsed * 3.2;
      g.strokeStyle = GOLD;
      g.lineWidth = 2;
      g.globalAlpha = pulse2;
      const ticks = t2.mark === "sigil" ? 6 : 4;
      for (let i = 0; i < ticks; i += 1) {
        const a = spin + i / ticks * Math.PI * 2;
        g.beginPath();
        g.moveTo(Math.round(x + Math.cos(a) * (radius * 0.45)), Math.round(y + Math.sin(a) * (radius * 0.45)));
        g.lineTo(Math.round(x + Math.cos(a) * radius), Math.round(y + Math.sin(a) * radius));
        g.stroke();
      }
      g.globalAlpha = 1;
    }
    if (!t2.fake) {
      g.beginPath();
      g.arc(x, y, Math.max(1, radius * k), 0, Math.PI * 2);
      g.fillStyle = danger(1);
      g.fill();
    }
    if (t2.mark === "impact") {
      g.strokeStyle = "#fff";
      g.globalAlpha = pulse2;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x - radius, y);
      g.lineTo(x + radius, y);
      g.moveTo(x, y - radius);
      g.lineTo(x, y + radius);
      g.stroke();
      g.globalAlpha = 1;
    }
  }
  function drawSwings(g, boss) {
    const swings = boss.swings || [];
    for (let i = 0; i < swings.length; i += 1) {
      const s = swings[i];
      const k = Math.max(0, s.life / (s.max || s.life || 1));
      g.save();
      g.globalAlpha = 0.35 + 0.65 * k;
      g.strokeStyle = INK;
      g.lineWidth = 8;
      g.beginPath();
      g.arc(Math.round(boss.x), Math.round(boss.y), s.r, s.ang - s.arc * 0.5, s.ang + s.arc * 0.5);
      g.stroke();
      g.strokeStyle = s.color || IVORY;
      g.lineWidth = 3;
      g.stroke();
      g.strokeStyle = "#fff";
      g.lineWidth = 1;
      g.stroke();
      g.restore();
    }
  }
  function drawHazards(g, boss) {
    const hazards = boss.hazards || [];
    for (let i = 0; i < hazards.length; i += 1) {
      const h = hazards[i];
      const x = Math.round(h.x);
      const y = Math.round(h.y);
      const r = Math.max(2, Math.round(h.r));
      const band = Math.max(6, Math.round(h.thick || 10));
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.strokeStyle = "rgba(194,59,59,0.55)";
      g.lineWidth = band;
      g.stroke();
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.strokeStyle = INK;
      g.lineWidth = 8;
      g.stroke();
      g.strokeStyle = GOLD;
      g.lineWidth = 4;
      g.stroke();
      g.strokeStyle = "#fff";
      g.lineWidth = 1;
      g.stroke();
    }
  }
  function drawFx(ctx2, g, boss) {
    const fx3 = boss.fx;
    if (!fx3) return;
    const x = Math.round(boss.x);
    const y = Math.round(boss.y);
    const time = ctx2.time ? ctx2.time.elapsed : 0;
    if (fx3.morph > 0) {
      const n = 16;
      const rad = 12 + fx3.morph * 26;
      for (let i = 0; i < n; i += 1) {
        const a = fx3.morph * 2 + i / n * Math.PI * 2;
        g.fillStyle = i % 2 ? GOLD : IVORY;
        g.fillRect(Math.round(x + Math.cos(a) * rad) - 1, Math.round(y - 14 + Math.sin(a) * rad) - 1, 3, 3);
      }
    }
    if (fx3.blink > 0) {
      g.strokeStyle = GOLD;
      g.lineWidth = 2;
      g.globalAlpha = Math.min(1, fx3.blink * 4);
      g.beginPath();
      g.arc(x, y, 16 + Math.round((0.2 - fx3.blink) * 40), 0, Math.PI * 2);
      g.stroke();
      g.globalAlpha = 1;
    }
    if (fx3.windup || fx3.hurt) {
      const pr = 14 + Math.round(throb(time, fx3.accel ? 18 : 10) * 6);
      g.strokeStyle = fx3.hurt ? "#fff" : GOLD;
      g.lineWidth = 2;
      g.globalAlpha = fx3.hurt ? 0.9 : 0.75;
      g.beginPath();
      g.arc(x, y - 6, pr, 0, Math.PI * 2);
      g.stroke();
      g.globalAlpha = 1;
    }
    if (fx3.halo) {
      const ang = fx3.haloAng || 0;
      g.strokeStyle = INK;
      g.lineWidth = 4;
      g.beginPath();
      g.arc(x, y - 8, 30, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = GOLD;
      g.lineWidth = 2;
      g.stroke();
      const ticks = fx3.arms === 3 ? 3 : fx3.arms === 2 ? 2 : 8;
      const len0 = ticks <= 3 ? 18 : 26;
      const len1 = ticks <= 3 ? 40 : 34;
      g.lineWidth = ticks <= 3 ? 3 : 2;
      for (let i = 0; i < ticks; i += 1) {
        const a = ang + i / ticks * Math.PI * 2;
        g.strokeStyle = INK;
        g.beginPath();
        g.moveTo(Math.round(x + Math.cos(a) * len0), Math.round(y - 8 + Math.sin(a) * len0));
        g.lineTo(Math.round(x + Math.cos(a) * len1), Math.round(y - 8 + Math.sin(a) * len1));
        g.stroke();
        g.strokeStyle = GOLD;
        g.stroke();
      }
    }
    if (fx3.accel) {
      g.strokeStyle = GOLD;
      g.lineWidth = 2;
      g.globalAlpha = 0.85;
      g.beginPath();
      g.arc(x, y - 10, 44, 0, Math.PI * 2);
      g.stroke();
      g.globalAlpha = 1;
    }
    const wings = fx3.wings;
    if (wings && wings.spread > 0) {
      const n = wings.n || 6;
      const reach = 26 + wings.spread * 58;
      for (let i = 0; i < n; i += 1) {
        const a = (wings.base || 0) + i / n * Math.PI * 2 + Math.sin(wings.flap * 6) * 0.08;
        const x2 = Math.round(x + Math.cos(a) * reach);
        const y2 = Math.round(y - 12 + Math.sin(a) * reach);
        const px = Math.round(-Math.sin(a) * 4);
        const py = Math.round(Math.cos(a) * 4);
        g.fillStyle = INK;
        g.beginPath();
        g.moveTo(x, y - 12);
        g.lineTo(x2 + px, y2 + py);
        g.lineTo(x2 - px, y2 - py);
        g.closePath();
        g.fill();
        g.fillStyle = GOLD;
        g.beginPath();
        g.moveTo(x, y - 12);
        g.lineTo(Math.round(x2 + px * 0.5), Math.round(y2 + py * 0.5));
        g.lineTo(Math.round(x2 - px * 0.5), Math.round(y2 - py * 0.5));
        g.closePath();
        g.fill();
      }
    }
    if (fx3.sword) {
      const s = fx3.sword;
      const len = s.len || 40;
      const x2 = Math.round(x + Math.cos(s.ang) * len);
      const y2 = Math.round(y - 8 + Math.sin(s.ang) * len);
      g.strokeStyle = INK;
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(x, y - 8);
      g.lineTo(x2, y2);
      g.stroke();
      g.strokeStyle = s.hot ? "#fff" : GOLD;
      g.lineWidth = 2;
      g.stroke();
      const glide = 0.25 + 0.7 * (0.5 + 0.5 * Math.sin(time * 14));
      const gx = Math.round(x + Math.cos(s.ang) * len * glide);
      const gy = Math.round(y - 8 + Math.sin(s.ang) * len * glide);
      g.fillStyle = "#fff";
      g.fillRect(gx - 2, gy - 2, 4, 4);
    }
    const chain = fx3.chain;
    if (chain) {
      g.lineWidth = 3;
      for (let s = 0; s < chain.length; s += 1) {
        const pts = chain[s];
        if (!pts || pts.length < 2) continue;
        g.strokeStyle = INK;
        g.beginPath();
        g.moveTo(Math.round(x), Math.round(y));
        for (let p = 0; p < pts.length; p += 1) g.lineTo(Math.round(pts[p].x), Math.round(pts[p].y));
        g.stroke();
        g.strokeStyle = GOLD;
        g.lineWidth = 1;
        g.stroke();
        g.lineWidth = 3;
      }
    }
    if (fx3.spin > 0) {
      g.save();
      g.translate(x, y);
      g.rotate(fx3.spin);
      g.strokeStyle = "#ffb089";
      g.lineWidth = 3;
      g.beginPath();
      g.arc(0, 0, 20, 0, Math.PI * 1.3);
      g.stroke();
      g.restore();
    }
  }
  function render3(ctx2, g) {
    const prev2 = g.imageSmoothingEnabled;
    g.imageSmoothingEnabled = false;
    g.save();
    for (let i = 0; i < list.length; i += 1) {
      const t2 = list[i];
      if (!t2 || !t2.alive) continue;
      g.save();
      drawTele(g, t2);
      g.restore();
    }
    const boss = ctx2.boss;
    if (boss) {
      drawFx(ctx2, g, boss);
      drawSwings(g, boss);
      drawHazards(g, boss);
    }
    g.restore();
    g.imageSmoothingEnabled = prev2;
  }
  function reset6() {
    list = [];
  }
  function init7(ctx2) {
    ctx2.world.telegraph = {
      spawn: spawn3,
      update: update6,
      render: render3,
      reset: reset6,
      active,
      contains,
      snapshot
    };
  }

  // src/actors/playerFx.js
  var INK2 = "#1b1530";
  var fx2 = [];
  var edgeFx = null;
  var ctxRef2 = null;
  var started = false;
  function push(item) {
    fx2.push(item);
    if (fx2.length > 200) fx2.splice(0, fx2.length - 200);
  }
  function actorsOf(ctx2) {
    const list2 = [];
    if (ctx2 && ctx2.player) list2.push(ctx2.player);
    const allies = ctx2 && ctx2.allies || [];
    for (let i = 0; i < allies.length; i += 1) if (allies[i]) list2.push(allies[i]);
    return list2;
  }
  function findActor(ctx2, id) {
    if (!ctx2) return null;
    if (ctx2.player && (!id || ctx2.player.id === id)) return ctx2.player;
    const allies = ctx2.allies || [];
    for (let i = 0; i < allies.length; i += 1) {
      if (allies[i] && allies[i].id === id) return allies[i];
    }
    return ctx2.player || null;
  }
  function clear2() {
    fx2.length = 0;
    edgeFx = null;
  }
  function tick(dt) {
    const step2 = dt > 0 ? dt : 0;
    for (let i = fx2.length - 1; i >= 0; i -= 1) {
      const item = fx2[i];
      item.life -= step2;
      if (item.vx) item.x += item.vx * step2;
      if (item.vy) item.y += item.vy * step2;
      if (item.life <= 0) fx2.splice(i, 1);
    }
    if (edgeFx) {
      edgeFx.life -= step2;
      if (edgeFx.life <= 0) edgeFx = null;
    }
  }
  function ghost(x, y, color) {
    push({ kind: "ghost", x, y, life: 0.2, max: 0.2, color: color || "#d7f4ff" });
  }
  function dust(x, y) {
    for (let i = 0; i < 4; i += 1) {
      push({
        kind: "dust",
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 28,
        vy: -8 - Math.random() * 16,
        life: 0.28,
        max: 0.28,
        color: i % 2 ? "#f4f1ea" : "#c8bfb0",
        s: 2
      });
    }
  }
  function arcSlash(x, y, ang, color) {
    push({
      kind: "arc",
      x,
      y,
      ang,
      r: 44,
      span: 1.35,
      life: 0.55,
      max: 0.55,
      color: color || "#d7f4ff"
    });
  }
  function ring(x, y, r, color, life) {
    const L = life || 0.35;
    push({ kind: "ring", x, y, r: r || 28, life: L, max: L, color: color || "#f4f1ea" });
  }
  function impact(x, y, color) {
    push({ kind: "impact", x, y, r: 12, life: 0.22, max: 0.22, color: color || "#fff" });
  }
  function label(x, y, text, color) {
    push({
      kind: "label",
      x,
      y,
      text: String(text || ""),
      life: 0.7,
      max: 0.7,
      color: color || "#f4f1ea",
      vy: -16
    });
  }
  function edge(color, life) {
    const L = life || 0.18;
    if (!edgeFx || L >= edgeFx.life) edgeFx = { color: color || "#c23b3b", life: L, max: L };
  }
  function scorch(x, y, x2, y2) {
    push({ kind: "scorch", x, y, x2, y2, life: 0.9, max: 0.9 });
  }
  function muzzle(actor, ang, color) {
    if (!actor) return;
    actor.muzzleT = 0.09;
    actor.muzzleAng = ang;
    actor.muzzleColor = color || "#fff";
  }
  function rayToWall(x, y, ang, rect2) {
    const box = rect2 || { x: 0, y: 0, w: VIEW_W, h: VIEW_H };
    const dx = Math.cos(ang);
    const dy = Math.sin(ang);
    let t2 = 800;
    if (dx > 1e-4) t2 = Math.min(t2, (box.x + box.w - x) / dx);
    else if (dx < -1e-4) t2 = Math.min(t2, (box.x - x) / dx);
    if (dy > 1e-4) t2 = Math.min(t2, (box.y + box.h - y) / dy);
    else if (dy < -1e-4) t2 = Math.min(t2, (box.y - y) / dy);
    if (!Number.isFinite(t2) || t2 < 12) t2 = 12;
    return { x: x + dx * t2, y: y + dy * t2, dist: t2 };
  }
  function onPerfect(ctx2, payload) {
    const actor = findActor(ctx2, payload && payload.id);
    if (!actor) return;
    ring(actor.x, actor.y, 84, "#ffe7a3", 0.5);
    ring(actor.x, actor.y, 52, "#fff6d0", 0.4);
    ring(actor.x, actor.y, 28, "#fff", 0.3);
    label(actor.x, actor.y - 30, bi({ zh: "\u5F00\u6E90\u4E4B\u76FE", en: "Open-Source Aegis" }), "#ffe7a3");
    edge("#ffe7a3", 0.16);
  }
  function onBlock(payload) {
    if (!payload || payload.perfect) return;
    impact(payload.x, payload.y, "#d8b15a");
  }
  function install2(ctx2) {
    ctxRef2 = ctx2 || ctxRef2;
    if (started || !ctxRef2) return;
    started = true;
    if (ctxRef2.bus) {
      ctxRef2.bus.on(EVENTS.PERFECT_GUARD, (payload) => onPerfect(ctxRef2, payload));
      ctxRef2.bus.on(EVENTS.SHIELD_BLOCK, (payload) => onBlock(payload));
    }
    setTimeout(() => {
      const loop = () => {
        try {
          if (ctxRef2 && !(ctxRef2.flags && ctxRef2.flags.playerFxExternal)) paint(ctxRef2);
        } catch (err) {
          if (typeof window !== "undefined") window.__w1fxError = String(err && err.stack || err);
        }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }, 0);
  }
  function viewXform(view2) {
    const cs = getComputedStyle(document.documentElement);
    let scale2 = parseFloat(cs.getPropertyValue("--game-scale"));
    let ox2 = parseFloat(cs.getPropertyValue("--game-x"));
    let oy2 = parseFloat(cs.getPropertyValue("--game-y"));
    if (!Number.isFinite(scale2) || scale2 <= 0) {
      scale2 = Math.max(1, Math.floor(Math.min(view2.width / VIEW_W, view2.height / VIEW_H))) || 1;
      ox2 = Math.floor((view2.width - VIEW_W * scale2) / 2);
      oy2 = Math.floor((view2.height - VIEW_H * scale2) / 2);
    }
    if (!Number.isFinite(ox2)) ox2 = 0;
    if (!Number.isFinite(oy2)) oy2 = 0;
    return { scale: scale2, ox: ox2, oy: oy2 };
  }
  function hotActor(actor) {
    if (!actor) return false;
    return !!(actor.rolling || actor.shield || actor.charging || actor.beamT > 0 || actor.flaskT > 0 || actor.superarmor > 0 || actor.skillKind || actor.muzzleT > 0);
  }
  function needsDraw(ctx2) {
    if (edgeFx || fx2.length) return true;
    const list2 = actorsOf(ctx2);
    for (let i = 0; i < list2.length; i += 1) if (hotActor(list2[i])) return true;
    if (count("player") > 0 || count("ally") > 0) return true;
    return false;
  }
  function paint(ctx2) {
    if (!needsDraw(ctx2)) return;
    const view2 = document.getElementById("view");
    if (!view2) return;
    const g = view2.getContext("2d");
    if (!g) return;
    const map = viewXform(view2);
    g.save();
    g.setTransform(map.scale, 0, 0, map.scale, map.ox, map.oy);
    g.imageSmoothingEnabled = false;
    g.beginPath();
    g.rect(0, 0, VIEW_W, VIEW_H);
    g.clip();
    render4(ctx2, g);
    g.restore();
  }
  function render4(ctx2, g) {
    if (!ctx2 || !g) return;
    for (let i = 0; i < fx2.length; i += 1) {
      if (fx2[i].kind === "scorch") drawScorch(g, fx2[i]);
    }
    for (let i = 0; i < fx2.length; i += 1) {
      if (fx2[i].kind === "ghost") drawGhost(g, fx2[i]);
      else if (fx2[i].kind === "dust") drawDust(g, fx2[i]);
    }
    const list2 = actorsOf(ctx2);
    for (let i = 0; i < list2.length; i += 1) {
      const actor = list2[i];
      drawRoll(g, actor);
      drawDash(g, ctx2, actor);
      drawCharge(g, actor);
      drawBeam2(g, ctx2, actor);
      drawShield2(g, actor);
      drawFlask(g, actor);
      drawArmor(g, actor);
      drawMuzzle(g, actor);
    }
    for (let i = 0; i < fx2.length; i += 1) {
      const item = fx2[i];
      if (item.kind === "arc") drawArc(g, item);
      else if (item.kind === "ring") drawRing(g, item);
      else if (item.kind === "impact") drawImpact(g, item);
    }
    for (let i = 0; i < fx2.length; i += 1) {
      if (fx2[i].kind === "label") drawLabel(g, fx2[i]);
    }
    if (edgeFx) drawEdge(g, edgeFx);
  }
  function stampLine(g, x0, y0, x1, y1, radius, color, alpha) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy);
    if (len < 0.5) return;
    const rad = Math.max(0, radius | 0);
    const step2 = Math.max(1, rad || 1);
    const steps = Math.max(1, Math.ceil(len / step2));
    g.save();
    g.globalAlpha = alpha == null ? 1 : alpha;
    g.fillStyle = color;
    const size = rad * 2 + 1;
    for (let i = 0; i <= steps; i += 1) {
      const t2 = i / steps;
      g.fillRect(Math.round(x0 + dx * t2) - rad, Math.round(y0 + dy * t2) - rad, size, size);
    }
    g.restore();
  }
  function stampArc(g, cx, cy, radius, ang, span, thick, color, alpha) {
    const r = Math.max(2, radius);
    const steps = Math.max(8, Math.ceil(Math.abs(span) * r * 0.7));
    const t2 = Math.max(0, thick | 0);
    g.save();
    g.globalAlpha = alpha == null ? 1 : alpha;
    g.fillStyle = color;
    const size = t2 * 2 + 1;
    for (let i = 0; i <= steps; i += 1) {
      const a = ang - span / 2 + span * (i / steps);
      g.fillRect(Math.round(cx + Math.cos(a) * r) - t2, Math.round(cy + Math.sin(a) * r) - t2, size, size);
    }
    g.restore();
  }
  function stampDisc(g, x, y, radius, color, alpha) {
    const R = Math.max(1, radius | 0);
    g.save();
    g.globalAlpha = alpha == null ? 1 : alpha;
    g.fillStyle = color;
    for (let iy = -R; iy <= R; iy += 1) {
      const hw = Math.round(Math.sqrt(Math.max(0, R * R - iy * iy)));
      g.fillRect(Math.round(x) - hw, Math.round(y) + iy, hw * 2 + 1, 1);
    }
    g.restore();
  }
  function fillWedge(g, cx, cy, r0, r1, ang, span, color, alpha) {
    g.save();
    g.globalAlpha = alpha;
    g.fillStyle = color;
    for (let r = r0; r <= r1; r += 2) {
      const steps = Math.max(4, Math.ceil(span * r * 0.5));
      for (let i = 0; i <= steps; i += 1) {
        const a = ang - span / 2 + span * (i / steps);
        const x = Math.round(cx + Math.cos(a) * r);
        const y = Math.round(cy + Math.sin(a) * r);
        if ((x + y & 1) === 0) g.fillRect(x, y, 2, 2);
      }
    }
    g.restore();
  }
  function drawScorch(g, item) {
    const alpha = Math.max(0, item.life / item.max) * 0.55;
    stampLine(g, item.x, item.y, item.x2, item.y2, 3, "#5a3a28", alpha);
    stampLine(g, item.x, item.y, item.x2, item.y2, 1, "#e7c27a", alpha);
  }
  function drawGhost(g, item) {
    const alpha = Math.max(0, item.life / item.max) * 0.8;
    const x = Math.round(item.x);
    const y = Math.round(item.y);
    g.save();
    g.globalAlpha = alpha;
    g.fillStyle = INK2;
    g.fillRect(x - 6, y - 18, 12, 16);
    g.fillStyle = item.color || "#d7f4ff";
    g.fillRect(x - 5, y - 17, 10, 14);
    g.restore();
  }
  function drawDust(g, item) {
    g.save();
    g.globalAlpha = Math.max(0, item.life / item.max);
    g.fillStyle = item.color;
    g.fillRect(Math.round(item.x), Math.round(item.y), item.s || 2, item.s || 2);
    g.restore();
  }
  function drawArc(g, item) {
    const alpha = Math.max(0, item.life / item.max);
    stampArc(g, item.x, item.y, item.r + 3, item.ang, item.span, 3, INK2, alpha);
    stampArc(g, item.x, item.y, item.r, item.ang, item.span, 2, item.color, alpha);
    stampArc(g, item.x, item.y, item.r - 6, item.ang, item.span * 0.8, 1, "#ffffff", alpha);
  }
  function drawRing(g, item) {
    const k = 1 - item.life / item.max;
    const alpha = Math.max(0, item.life / item.max);
    const r = 4 + item.r * Math.min(1, k);
    stampArc(g, item.x, item.y, r, 0, Math.PI * 2, 2, INK2, alpha);
    stampArc(g, item.x, item.y, r, 0, Math.PI * 2, 1, item.color, alpha);
  }
  function drawImpact(g, item) {
    const alpha = Math.max(0, item.life / item.max);
    const r = item.r * (1.3 - alpha);
    for (let i = 0; i < 6; i += 1) {
      const a = i / 6 * Math.PI * 2 + 0.2;
      stampLine(g, item.x, item.y, item.x + Math.cos(a) * r, item.y + Math.sin(a) * r, 1, item.color, alpha);
    }
  }
  function drawLabel(g, item) {
    const alpha = Math.max(0, item.life / item.max);
    const text = String(item.text || "");
    if (!text) return;
    const x = Math.round(item.x);
    const y = Math.round(item.y);
    g.save();
    g.globalAlpha = alpha;
    g.imageSmoothingEnabled = false;
    g.font = '12px "Noto Sans CJK SC","Noto Sans SC","Source Han Sans SC","PingFang SC",sans-serif';
    g.textBaseline = "top";
    g.fillStyle = "#1b1530";
    g.fillText(text, x - 1, y);
    g.fillText(text, x + 1, y);
    g.fillText(text, x, y - 1);
    g.fillText(text, x, y + 1);
    g.fillStyle = item.color || "#f4f1ea";
    g.fillText(text, x, y);
    g.restore();
  }
  function drawEdge(g, item) {
    const alpha = Math.max(0, item.life / item.max) * 0.9;
    const t2 = 8;
    g.save();
    applyScreen(g);
    g.globalAlpha = alpha;
    g.fillStyle = item.color;
    g.fillRect(0, 0, INTERNAL_W, t2);
    g.fillRect(0, INTERNAL_H - t2, INTERNAL_W, t2);
    g.fillRect(0, 0, t2, INTERNAL_H);
    g.fillRect(INTERNAL_W - t2, 0, t2, INTERNAL_H);
    g.restore();
  }
  function drawRoll(g, actor) {
    if (!actor.rolling) return;
    stampLine(g, actor.x - actor.rollX * 18, actor.y - actor.rollY * 18, actor.x + actor.rollX * 8, actor.y + actor.rollY * 8, 4, INK2, 0.95);
    stampLine(g, actor.x - actor.rollX * 16, actor.y - actor.rollY * 16, actor.x + actor.rollX * 6, actor.y + actor.rollY * 6, 2, "#f4f1ea", 1);
  }
  function drawDash(g, ctx2, actor) {
    if (actor.skillKind !== "flurry" || actor.dashFromX == null) return;
    stampLine(g, actor.dashFromX, actor.dashFromY, actor.x, actor.y, 5, INK2, 0.9);
    stampLine(g, actor.dashFromX, actor.dashFromY, actor.x, actor.y, 3, "#7ee0ff", 1);
    stampLine(g, actor.dashFromX, actor.dashFromY, actor.x, actor.y, 1, "#ffffff", 1);
    if (actor.flurryPhase === "arcs") {
      const shown = Math.max(1, actor.flurryN || 1);
      const base = Math.atan2(actor.dashUy || -1, actor.dashUx || 0);
      const total = 8;
      for (let i = 0; i < shown; i += 1) {
        const ang = base + Math.PI * 2 * i / total;
        stampArc(g, actor.x, actor.y, (actor.flurryR || 42) + 6, ang, 1.2, 4, "#041018", 1);
        stampArc(g, actor.x, actor.y, actor.flurryR || 42, ang, 1.15, 2, "#7ee0ff", 1);
        stampArc(g, actor.x, actor.y, (actor.flurryR || 42) - 4, ang, 0.7, 1, "#ffffff", 1);
      }
    }
    void ctx2;
  }
  function drawCharge(g, actor) {
    if (!actor.charging) return;
    const max = actor.chargeMax || 1.5;
    const ratio = Math.max(0, Math.min(1, (actor.chargeT || 0) / max));
    const n = 16;
    const spin = (actor.chargeT || 0) * 10;
    const rad = 26 + ratio * 42;
    stampArc(g, actor.x, actor.y - 8, rad + 4, spin, Math.PI * 2, 2, INK2, 1);
    stampArc(g, actor.x, actor.y - 8, rad + 4, spin, Math.PI * 2, 1, "#7ec8ff", 1);
    for (let i = 0; i < n; i += 1) {
      const a = spin + i / n * Math.PI * 2;
      const x = Math.round(actor.x + Math.cos(a) * rad);
      const y = Math.round(actor.y - 8 + Math.sin(a) * rad);
      g.fillStyle = INK2;
      g.fillRect(x - 3, y - 3, 7, 7);
      g.fillStyle = i % 2 ? "#ffffff" : "#9fd8ff";
      g.fillRect(x - 2, y - 2, 5, 5);
    }
    const core = 5 + Math.round(ratio * 8);
    stampDisc(g, actor.x, actor.y - 8, core + 3, INK2, 1);
    stampDisc(g, actor.x, actor.y - 8, core, ratio > 0.8 ? "#ffffff" : "#d7f4ff", 1);
  }
  function drawBeam2(g, ctx2, actor) {
    if (!(actor.beamT > 0)) return;
    const ang = actor.beamAng || 0;
    const ox2 = actor.x;
    const oy2 = actor.y - 8;
    const rect2 = activeInner(ctx2.state && ctx2.state.current || "fight");
    const end = rayToWall(ox2, oy2, ang, rect2);
    const w = actor.beamW || 8;
    stampLine(g, ox2, oy2, end.x, end.y, Math.ceil(w / 2) + 6, INK2, 0.65);
    stampLine(g, ox2, oy2, end.x, end.y, Math.ceil(w / 2) + 2, "#7ec8ff", 1);
    stampLine(g, ox2, oy2, end.x, end.y, Math.max(1, Math.ceil(w / 2) - 1), "#f7fbff", 1);
    const dx = end.x - ox2;
    const dy = end.y - oy2;
    const len = Math.hypot(dx, dy) || 1;
    const px = -dy / len;
    const py = dx / len;
    const ribs = Math.floor(len / 14);
    for (let i = 1; i < ribs; i += 1) {
      const t2 = i * 14 / len;
      const cx = ox2 + dx * t2;
      const cy = oy2 + dy * t2;
      const hw = w * 0.65 + 4;
      stampLine(g, cx - px * hw, cy - py * hw, cx + px * hw, cy + py * hw, 1, i % 2 ? "#ffffff" : "#d7f4ff", 1);
    }
    stampDisc(g, ox2, oy2, 5, "#ffffff", 1);
    stampDisc(g, end.x, end.y, 4 + w * 0.15, "#d7f4ff", 1);
  }
  function drawShield2(g, actor) {
    if (!actor.shield) return;
    const ang = Math.atan2(actor.aimY || 0, actor.aimX || 1);
    const span = actor.shieldArc || 100 * Math.PI / 180;
    const perfect = (actor.perfectGuardT || 0) > 0;
    const gold = perfect ? "#fff6d0" : "#e7c27a";
    fillWedge(g, actor.x, actor.y, 12, 32, ang, span, perfect ? "#ffe7a3" : "#6d3fa0", perfect ? 0.7 : 0.5);
    stampArc(g, actor.x, actor.y, 31, ang, span, 3, INK2, 1);
    stampArc(g, actor.x, actor.y, 31, ang, span, 2, gold, 1);
    stampArc(g, actor.x, actor.y, 22, ang, span * 0.92, 1, perfect ? "#ffffff" : "#c9a0ff", 1);
    const mx = Math.round(actor.x + Math.cos(ang) * 20);
    const my = Math.round(actor.y + Math.sin(ang) * 20);
    g.fillStyle = INK2;
    g.fillRect(mx - 7, my - 9, 14, 18);
    g.fillStyle = gold;
    g.fillRect(mx - 5, my - 7, 10, 14);
    g.fillStyle = "#6d3fa0";
    g.fillRect(mx - 2, my - 4, 4, 8);
    g.fillStyle = perfect ? "#fff" : "#d8b15a";
    g.fillRect(mx - 1, my - 6, 2, 3);
  }
  function drawFlask(g, actor) {
    if (!(actor.flaskT > 0)) return;
    const t2 = 1 - Math.max(0, Math.min(1, actor.flaskT / 0.5));
    const h = 28 + Math.round(70 * Math.max(t2, 0.35));
    const x = Math.round(actor.x);
    const top = Math.round(actor.y - h);
    const col = actor.flaskPending === "b200" ? "#ffe08a" : "#7dffb0";
    g.save();
    g.fillStyle = INK2;
    g.globalAlpha = 0.92;
    g.fillRect(x - 8, top, 16, h);
    g.globalAlpha = 1;
    g.fillStyle = col;
    g.fillRect(x - 5, top + 2, 10, h - 2);
    g.fillStyle = "#f4fff8";
    g.fillRect(x - 2, top + 2, 4, h - 2);
    g.restore();
    stampArc(g, actor.x, actor.y, 14, 0, Math.PI * 2, 2, INK2, 1);
    stampArc(g, actor.x, actor.y, 14, 0, Math.PI * 2, 1, col, 1);
    const spin = (0.5 - actor.flaskT) * 36;
    for (let i = 0; i < 4; i += 1) {
      const a = spin + i * Math.PI / 2;
      stampLine(g, actor.x, top + 8, actor.x + Math.cos(a) * 7, top + 8 + Math.sin(a) * 3, 1, "#14301c", 1);
    }
  }
  function drawArmor(g, actor) {
    if (!(actor.superarmor > 0)) return;
    stampArc(g, actor.x, actor.y - 4, 18, 0, Math.PI * 2, 2, INK2, 1);
    stampArc(g, actor.x, actor.y - 4, 18, 0, Math.PI * 2, 1, "#ffe08a", 1);
    stampArc(g, actor.x, actor.y - 4, 12, 0, Math.PI * 2, 1, "#fff6d0", 0.9);
  }
  function drawMuzzle(g, actor) {
    if (!(actor.muzzleT > 0)) return;
    const ang = actor.muzzleAng || 0;
    const x = actor.x + Math.cos(ang) * 12;
    const y = actor.y - 6 + Math.sin(ang) * 12;
    const alpha = Math.min(1, actor.muzzleT / 0.05);
    stampDisc(g, x, y, 5, actor.muzzleColor || "#fff", alpha);
    stampDisc(g, x, y, 2, "#ffffff", 1);
    stampLine(g, x - Math.cos(ang) * 4, y - Math.sin(ang) * 4, x + Math.cos(ang) * 8, y + Math.sin(ang) * 8, 1, "#fff", alpha);
  }

  // src/actors/kits.js
  var shotSeq = 1;
  var NAMES2 = {
    flurry: { zh: "\u4E13\u5BB6\u9CB8\u7FA4", en: "Mixture-of-Whales" },
    beam: { zh: "\u957F\u4E0A\u4E0B\u6587\xB7\u6697\u6708", en: "Long-Context Dark Moon" },
    shield: { zh: "\u5F00\u6E90\u4E4B\u76FE", en: "Open-Source Aegis" }
  };
  function callout(ctx2, actor, pair, color) {
    label(actor.x, actor.y - 36, bi(pair), color || "#f4f1ea");
  }
  function kitOf(actor) {
    return PLAYER[actor.kitId || actor.id] || PLAYER.deepseek;
  }
  function silenced(ctx2) {
    return (ctx2.flags?.skillSilence || 0) > 0 || !!ctx2.flags?.contentPolicySilence;
  }
  function scaleOf(actor, dmgMul) {
    if (dmgMul != null && Number.isFinite(Number(dmgMul))) return Number(dmgMul);
    return actor && actor.team === "ally" ? ALLY_DMG_MUL : 1;
  }
  function unit(x, y) {
    const l = Math.hypot(x || 0, y || 0);
    if (l < 1e-6) return null;
    return { x: x / l, y: y / l };
  }
  function nudgeAim(actor) {
    if (!actor) return;
    const ax = actor.aimX || 0;
    const ay = actor.aimY || 0;
    if (Math.abs(ax) < 1e-6 && Math.abs(ay) > 1e-6) actor.aimX = 1e-4;
  }
  function lastAim(actor) {
    return {
      x: actor && Number.isFinite(actor.aimX) ? actor.aimX : 0,
      y: actor && Number.isFinite(actor.aimY) ? actor.aimY : -1
    };
  }
  function park(ctx2, actor) {
    if (ctx2.world && typeof ctx2.world.clamp === "function") ctx2.world.clamp(actor);
  }
  function busy(actor) {
    return !!(actor.rolling || actor.flaskT > 0 || actor.charging || actor.shield || actor.skillKind === "flurry");
  }
  function canCast(actor) {
    if (!actor || actor.alive === false) return false;
    if ((actor.skillCd || 0) > 0) return false;
    if (actor.rolling || actor.flaskT > 0) return false;
    if (actor.skillKind === "flurry" || actor.charging || actor.shield) return false;
    return true;
  }
  function emit2(ctx2, name, payload) {
    if (ctx2.bus) ctx2.bus.emit(name, payload);
  }
  function tickPrimary(ctx2, actor, dt, ctrl) {
    if (!actor) return false;
    actor.fireCd = Math.max(0, (actor.fireCd || 0) - dt);
    if (actor.muzzleT > 0) actor.muzzleT = Math.max(0, actor.muzzleT - dt);
    if (!ctrl || !ctrl.fire || !ctrl.aim) return false;
    return shoot(ctx2, actor, ctrl.aim, ctrl.dmgMul);
  }
  function shoot(ctx2, actor, aim, dmgMul) {
    if (busy(actor) || actor.fireCd > 0 || actor.alive === false) return false;
    const spec = kitOf(actor).primary;
    const scale2 = scaleOf(actor, dmgMul);
    const base = Math.atan2(aim.y, aim.x);
    const n = spec.pellets || 1;
    const spread = spec.spread || 0;
    for (let i = 0; i < n; i += 1) {
      const off = n === 1 ? 0 : -spread / 2 + spread * i / (n - 1);
      const ang = base + off;
      const speed = spec.speed;
      const mid = n > 1 && i === (n - 1) / 2;
      spawn(ctx2, {
        team: actor.team,
        ownerId: actor.id,
        x: actor.x + Math.cos(ang) * 10,
        y: actor.y - 6 + Math.sin(ang) * 10,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        r: spec.r || 3,
        dmg: spec.dmg * scale2,
        // Safety timeout only. The pool culls on Euclidean displacement from spawn
        // (`maxRange`), so muzzle offset and wobble cannot shorten or stretch it.
        life: spec.range / speed + 2,
        maxRange: spec.range,
        shape: spec.shape,
        color: mid ? "#f4fbff" : spec.color,
        pierce: spec.pierce || 0,
        wobble: spec.wobble || 0,
        knock: spec.knock || 0,
        attackId: `shot-${shotSeq}`,
        onHit: (c, bullet) => onShotHit(c, bullet, spec)
      });
      shotSeq += 1;
    }
    actor.fireCd = 1 / spec.rate;
    if (actor.team === "ally") actor.fireCd /= ALLY_FIRE_SCALE;
    actor.facing = facingName(aim.x, aim.y);
    muzzle(actor, base, spec.color);
    emit2(ctx2, EVENTS.VFX, {
      kind: "muzzle",
      x: actor.x + Math.cos(base) * 10,
      y: actor.y - 6 + Math.sin(base) * 10,
      ang: base,
      color: spec.color
    });
    emit2(ctx2, EVENTS.SHOT_FIRED, { id: actor.id, team: actor.team, x: actor.x, y: actor.y });
    if (spec.kind === "orb") {
      emit2(ctx2, EVENTS.VFX, { kind: "ring", x: actor.x, y: actor.y - 6, r: 12, color: "#fff6c8", life: 0.18 });
      ring(actor.x, actor.y - 6, 12, "#fff6c8", 0.16);
    }
    if (actor.team === "player") ctx2.audio?.playSfx(spec.kind === "orb" ? "sfx.star" : "sfx.slash");
    return true;
  }
  function onShotHit(ctx2, bullet, spec) {
    if (spec.kind === "bolt") {
      impact(bullet.x, bullet.y, "#e7c27a");
      ring(bullet.x, bullet.y, 16, "#d8b15a", 0.22);
      emit2(ctx2, EVENTS.VFX, { kind: "shock", x: bullet.x, y: bullet.y, r: 16, color: "#d8b15a" });
      emit2(ctx2, EVENTS.SHAKE, { mag: 2, dur: 0.06 });
    } else if (spec.kind === "orb") {
      impact(bullet.x, bullet.y, "#fff6c8");
      ring(bullet.x, bullet.y, 14, "#fff6c8", 0.2);
    } else {
      impact(bullet.x, bullet.y, spec.color || "#7ee0ff");
    }
  }
  function inBeam(ox2, oy2, cos, sin, reach, half, x, y, rad) {
    const dx = x - ox2;
    const dy = y - oy2;
    const along = dx * cos + dy * sin;
    const perp = Math.abs(-dx * sin + dy * cos);
    const r = rad || 0;
    return along > -r && along < reach + r && perp <= half + r;
  }
  function beamBody(ctx2, actor) {
    const ang = actor.beamAng || 0;
    const ox2 = actor.x;
    const oy2 = actor.y - 8;
    const reach = actor.beamReach || 480;
    const half = (actor.beamW || 6) * 0.5;
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    if (!actor.beamSpent) {
      const targets = [];
      if (ctx2.boss && ctx2.boss.alive) targets.push(ctx2.boss);
      if (ctx2.stele && ctx2.stele.alive) targets.push(ctx2.stele);
      for (let i = 0; i < targets.length; i += 1) {
        const tgt = targets[i];
        if (!inBeam(ox2, oy2, cos, sin, reach, half, tgt.x, tgt.y, tgt.r)) continue;
        applyHit(ctx2, actor, tgt, actor.beamDmg || 0, {
          attackId: `beam-${actor.id}-${shotSeq}`,
          heavy: true,
          hitStopMs: 40 + Math.round((actor.beamRatio || 0) * 30),
          shake: 3 + (actor.beamRatio || 0) * 3
        });
        shotSeq += 1;
      }
      actor.beamSpent = true;
    }
    killWhere(ctx2, (b) => {
      if (!b.alive || b.team !== "boss") return false;
      return inBeam(ox2, oy2, cos, sin, reach, half, b.x, b.y, b.r);
    }, { color: "#d7f4ff" });
  }
  function tickBeam(ctx2, actor, dt) {
    if (!(actor.beamT > 0)) return;
    actor.beamT = Math.max(0, actor.beamT - dt);
    beamBody(ctx2, actor);
  }
  function endBeam(ctx2, actor, aim, dmgMul) {
    const kit = kitOf(actor).skill;
    const held = Math.max(kit.chargeMin, Math.min(kit.chargeMax, actor.chargeT || kit.chargeMin));
    const span = Math.max(1e-3, kit.chargeMax - kit.chargeMin);
    const ratio = Math.max(0, Math.min(1, (held - kit.chargeMin) / span));
    const scale2 = scaleOf(actor, dmgMul);
    const dmg = (kit.dmgMin + (kit.dmgMax - kit.dmgMin) * ratio) * scale2;
    const width = kit.widthMin + (kit.widthMax - kit.widthMin) * ratio;
    const ang = Math.atan2(aim.y, aim.x);
    const ox2 = actor.x;
    const oy2 = actor.y - 8;
    const rect2 = activeInner(ctx2.state ? ctx2.state.current : "fight");
    const end = rayToWall(ox2, oy2, ang, rect2);
    actor.charging = false;
    actor.chargeT = 0;
    actor.beamT = kit.dur;
    actor.beamAng = ang;
    actor.beamW = width;
    actor.beamDmg = dmg;
    actor.beamRatio = ratio;
    actor.beamReach = end.dist;
    actor.beamSpent = false;
    actor.skillCd = Math.max(actor.skillCd || 0, kit.cd || 0);
    actor.facing = facingName(aim.x, aim.y);
    ctx2.audio?.stopSfx?.("sfx.charge");
    ctx2.audio?.playSfx("sfx.beam");
    emit2(ctx2, EVENTS.SKILL_RELEASE, { id: actor.id, name: "beam", ratio, zh: NAMES2.beam.zh, en: NAMES2.beam.en });
    callout(ctx2, actor, NAMES2.beam, "#d7f4ff");
    emit2(ctx2, EVENTS.VFX, {
      kind: "beam",
      x: ox2,
      y: oy2,
      x2: end.x,
      y2: end.y,
      w: width + 8,
      color: "#d7f4ff",
      life: kit.dur
    });
    emit2(ctx2, EVENTS.FLASH, { color: "rgba(190,225,255,0.45)", dur: 0.1 });
    emit2(ctx2, EVENTS.SHAKE, { mag: 3 + ratio * 3, dur: 0.18 });
    scorch(ox2, oy2, end.x, end.y);
    edge("#d7f4ff", 0.12);
    beamBody(ctx2, actor);
  }
  function cancelCharge(ctx2, actor) {
    if (!actor.charging) return;
    actor.charging = false;
    actor.chargeT = 0;
    ctx2.audio?.stopSfx?.("sfx.charge");
  }
  function startShield(ctx2, actor) {
    const kit = kitOf(actor).skill;
    actor.shield = true;
    actor.shieldAge = 0;
    actor.perfectSpent = false;
    actor.perfectWindow = kit.perfect;
    actor.shieldArc = kit.arc;
    actor.perfectGuardT = kit.perfect;
    emit2(ctx2, EVENTS.GUARD_START, { id: actor.id });
    emit2(ctx2, EVENTS.SKILL_USED, { id: actor.id, name: "shield", zh: NAMES2.shield.zh, en: NAMES2.shield.en });
    callout(ctx2, actor, NAMES2.shield, "#ffe08a");
    emit2(ctx2, EVENTS.VFX, {
      kind: "shield_arc",
      x: actor.x,
      y: actor.y,
      ang: Math.atan2(actor.aimY || 0, actor.aimX || 1),
      arc: kit.arc,
      r: 30,
      color: "#e7c27a"
    });
    ctx2.audio?.playSfx("sfx.guard");
  }
  function endShield(ctx2, actor) {
    if (!actor.shield) return;
    const kit = kitOf(actor).skill;
    actor.shield = false;
    actor.perfectGuardT = 0;
    actor.skillCd = Math.max(actor.skillCd || 0, kit.cd || 0);
    emit2(ctx2, EVENTS.GUARD_END, { id: actor.id });
  }
  function cancelChannel(ctx2, actor) {
    cancelCharge(ctx2, actor);
    endShield(ctx2, actor);
  }
  function hitFlurry(ctx2, actor, kit, mul, n, ang) {
    const radius = kit.radius;
    const targets = [];
    if (ctx2.boss && ctx2.boss.alive) targets.push(ctx2.boss);
    if (ctx2.stele && ctx2.stele.alive) targets.push(ctx2.stele);
    let landed = false;
    for (let i = 0; i < targets.length; i += 1) {
      const tgt = targets[i];
      if (Math.hypot(tgt.x - actor.x, tgt.y - actor.y) > radius + (tgt.r || 0)) continue;
      const applied = applyHit(ctx2, actor, tgt, kit.dmg * mul, {
        attackId: `flurry-${actor.id}-${n}-${shotSeq}`,
        hitStopMs: 30,
        shake: 3
      });
      shotSeq += 1;
      if (applied > 0) landed = true;
    }
    arcSlash(actor.x, actor.y, ang, "#d7f4ff");
    emit2(ctx2, EVENTS.VFX, {
      kind: "slash_arc",
      x: actor.x,
      y: actor.y,
      ang,
      r: radius,
      span: 1.35,
      color: "#d7f4ff",
      life: 0.4
    });
    emit2(ctx2, EVENTS.SHAKE, { mag: 3, dur: 0.05 });
    if (landed) impact(actor.x + Math.cos(ang) * 20, actor.y + Math.sin(ang) * 20, "#ffffff");
  }
  function beginFlurry(ctx2, actor, aim, kit) {
    const u = unit(aim.x, aim.y) || lastAim(actor);
    const len = Math.hypot(u.x, u.y) || 1;
    const ux = u.x / len;
    const uy = u.y / len;
    actor.skillKind = "flurry";
    actor.flurryN = 0;
    actor.dashUx = ux;
    actor.dashUy = uy;
    actor.flurryR = kit.radius;
    actor.skillCd = Math.max(actor.skillCd || 0, kit.cd || 0);
    actor.charging = false;
    actor.shield = false;
    actor.facing = facingName(ux, uy);
    if (actor.team !== "player") {
      actor.dashFromX = actor.x;
      actor.dashFromY = actor.y;
      actor.x += ux * kit.dash;
      actor.y += uy * kit.dash;
      park(ctx2, actor);
      actor.flurryPhase = "arcs";
      actor.flurryT = 0;
      actor.invuln = Math.max(actor.invuln || 0, kit.iframe || 0.22);
    } else {
      actor.flurryPhase = "dash";
      actor.flurryT = 0;
      actor.dashFromX = actor.x;
      actor.dashFromY = actor.y;
      actor.dashAcc = 12;
    }
    emit2(ctx2, EVENTS.SKILL_USED, { id: actor.id, name: "flurry", zh: NAMES2.flurry.zh, en: NAMES2.flurry.en });
    callout(ctx2, actor, NAMES2.flurry, "#d7f4ff");
    emit2(ctx2, EVENTS.SHAKE, { mag: 3, dur: 0.12 });
    emit2(ctx2, EVENTS.FLASH, { color: "rgba(180,230,255,0.3)", dur: 0.06 });
    emit2(ctx2, EVENTS.VFX, { kind: "afterimage", x: actor.x, y: actor.y, color: "#d7f4ff", life: 0.2 });
    ctx2.audio?.playSfx("sfx.slash");
    ghost(actor.x, actor.y, "#d7f4ff");
    dust(actor.x, actor.y);
  }
  function tickFlurry(ctx2, actor, dt, kit, mul) {
    if (actor.flurryPhase === "dash") {
      const dur = Math.max(0.05, kit.iframe || 0.22);
      actor.flurryT += dt;
      let step2 = dt;
      if (actor.flurryT > dur) {
        step2 = Math.max(0, dt - (actor.flurryT - dur));
        actor.flurryT = dur;
      }
      const speed = kit.dash / dur;
      actor.x += actor.dashUx * speed * step2;
      actor.y += actor.dashUy * speed * step2;
      actor.vx = actor.dashUx * speed;
      actor.vy = actor.dashUy * speed;
      const left = dur - actor.flurryT;
      if (left > 0) actor.invuln = Math.max(actor.invuln || 0, left);
      actor.dashAcc = (actor.dashAcc || 0) + speed * step2;
      if (actor.dashAcc >= 10) {
        actor.dashAcc -= 10;
        ghost(actor.x, actor.y, "#d7f4ff");
        emit2(ctx2, EVENTS.VFX, { kind: "afterimage", x: actor.x, y: actor.y, color: "#d7f4ff", life: 0.16 });
      }
      park(ctx2, actor);
      if (actor.flurryT >= dur) {
        actor.flurryPhase = "arcs";
        actor.flurryT = 0;
        actor.flurryN = 0;
        actor.vx = 0;
        actor.vy = 0;
        ring(actor.x, actor.y, 16, "#d7f4ff", 0.2);
        dust(actor.x, actor.y);
      }
      return;
    }
    actor.flurryT += dt;
    const stepT = kit.arcTime / kit.arcs;
    const base = Math.atan2(actor.dashUy || -1, actor.dashUx || 0);
    while (actor.flurryN < kit.arcs && actor.flurryT + 1e-6 >= actor.flurryN * stepT) {
      const n = actor.flurryN;
      const ang = base + Math.PI * 2 * n / kit.arcs;
      hitFlurry(ctx2, actor, kit, mul, n, ang);
      actor.flurryN = n + 1;
    }
    if (actor.flurryN >= kit.arcs && actor.flurryT >= kit.arcTime) {
      actor.skillKind = "";
      actor.vx = 0;
      actor.vy = 0;
    }
  }
  function tickSkill(ctx2, actor, dt, ctrl) {
    if (!actor) return;
    const kit = kitOf(actor).skill;
    const mul = scaleOf(actor, ctrl && ctrl.dmgMul);
    actor.skillCd = Math.max(0, (actor.skillCd || 0) - dt);
    nudgeAim(actor);
    tickBeam(ctx2, actor, dt);
    if (actor.skillKind === "flurry") tickFlurry(ctx2, actor, dt, kit, mul);
    if (silenced(ctx2)) {
      cancelCharge(ctx2, actor);
      if (actor.shield) endShield(ctx2, actor);
      if (ctrl && ctrl.skillDown) {
        label(actor.x, actor.y - 26, bi({ zh: "\u6C89\u9ED8", en: "SILENCED" }), "#ffb4c8");
      }
      return;
    }
    if (!ctrl) return;
    const aim = ctrl.aim || lastAim(actor);
    if (kit.kind === "beam") {
      if (actor.charging) {
        actor.chargeT += dt;
        const ratio = Math.max(0, Math.min(1, actor.chargeT / kit.chargeMax));
        emit2(ctx2, EVENTS.SKILL_CHARGE, { id: actor.id, t: actor.chargeT, ratio });
        actor.chargePing = (actor.chargePing || 0) + dt;
        if (actor.chargePing >= 0.08) {
          actor.chargePing = 0;
          emit2(ctx2, EVENTS.VFX, {
            kind: "charge",
            x: actor.x,
            y: actor.y - 8,
            t: actor.chargeT,
            ratio,
            color: "#d7f4ff"
          });
        }
        const maxed = actor.chargeT >= kit.chargeMax;
        const released = !ctrl.skillHeld;
        if (maxed || released && actor.chargeT >= kit.chargeMin) endBeam(ctx2, actor, aim, ctrl.dmgMul);
        else if (released) cancelCharge(ctx2, actor);
        return;
      }
      if (ctrl.skillDown && canCast(actor)) {
        actor.charging = true;
        actor.chargeT = 0;
        actor.chargeMax = kit.chargeMax;
        actor.chargePing = 0;
        ctx2.audio?.playSfx("sfx.charge");
        emit2(ctx2, EVENTS.SKILL_CHARGE, { id: actor.id, t: 0, ratio: 0 });
      }
      return;
    }
    if (kit.kind === "shield") {
      if (actor.shield) {
        actor.shieldAge = (actor.shieldAge || 0) + dt;
        const left = (kit.perfect || 0.2) - actor.shieldAge;
        actor.perfectGuardT = left > 0 ? left : 0;
        if (!ctrl.skillHeld || actor.shieldAge >= kit.hold) endShield(ctx2, actor);
        return;
      }
      if (ctrl.skillDown && canCast(actor)) startShield(ctx2, actor);
      return;
    }
    if (kit.kind === "flurry") {
      if (!ctrl.skillDown || !canCast(actor) || actor.skillKind === "flurry") return;
      beginFlurry(ctx2, actor, aim, kit);
    }
  }
  function moveMul(actor) {
    if (!actor) return 1;
    if (actor.flaskT > 0) return FLASK_MOVE;
    const skill = kitOf(actor).skill;
    if (actor.charging) return skill.move || 0.4;
    if (actor.shield) return skill.move || 0.5;
    if (actor.skillKind === "flurry") return 0;
    return 1;
  }
  function allyPulse(ctx2, actor, aim) {
    if (!actor || silenced(ctx2)) return;
    const kit = kitOf(actor).skill;
    const a = aim || lastAim(actor);
    actor.aimX = a.x;
    actor.aimY = a.y;
    nudgeAim(actor);
    if (kit.kind === "flurry") {
      tickSkill(ctx2, actor, 0, { aim: a, skillDown: true, skillHeld: false });
    } else if (kit.kind === "beam") {
      actor.charging = true;
      actor.chargeT = kit.chargeMax;
      actor.chargeMax = kit.chargeMax;
      endBeam(ctx2, actor, a);
    } else if (kit.kind === "shield") {
      startShield(ctx2, actor);
    }
  }

  // src/actors/player.js
  function freshGpuCooldowns() {
    return { rtx5090: 0, h200: 0, b200: 0 };
  }
  function tickGpuCooldowns(actor, dt) {
    const cds = actor.gpuCooldowns;
    if (!cds || !(dt > 0)) return;
    for (let i = 0; i < FLASK_ORDER.length; i += 1) {
      const id = FLASK_ORDER[i];
      const v = Number(cds[id]) || 0;
      cds[id] = v > dt ? v - dt : 0;
    }
  }
  function unit2(x, y) {
    const l = Math.hypot(x || 0, y || 0);
    if (l < 1e-6) return null;
    return { x: x / l, y: y / l };
  }
  function approachVec(vx, vy, tx, ty, dt, accel) {
    const dx = tx - vx;
    const dy = ty - vy;
    const dist = Math.hypot(dx, dy);
    const max = accel * dt;
    if (dist <= max || dist < 1e-6) return { x: tx, y: ty };
    const s = max / dist;
    return { x: vx + dx * s, y: vy + dy * s };
  }
  function place(actor, where) {
    const rect2 = activeInner(where === "intro" ? "intro" : "fight");
    actor.x = rect2.x + rect2.w * 0.5;
    actor.y = rect2.y + rect2.h * (where === "intro" ? 0.68 : 0.82);
  }
  function spawn4(ctx2, id, where) {
    const key = getCharacter(id).id;
    const stats = PLAYER[key];
    const actor = {
      id: key,
      team: "player",
      kitId: key,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r: HURT_R,
      hp: stats.hp,
      maxHp: stats.hp,
      alive: true,
      invuln: 0,
      facing: "n",
      sprite: `px.${key}`,
      rolling: false,
      rollT: 0,
      rollCd: 0,
      rollX: 0,
      rollY: -1,
      flaskId: "rtx5090",
      gpuCooldowns: freshGpuCooldowns(),
      gpuArm: true,
      flaskT: 0,
      flaskPending: null,
      fireCd: 0,
      skillCd: 0,
      aimX: 0,
      aimY: -1,
      stamina: 100,
      staminaMax: 100,
      superarmor: 0,
      superarmorMul: 0.6,
      flash: 0,
      pose: "",
      hurtLog: {},
      hurtT: 0,
      charging: false,
      shield: false,
      skillKind: "",
      perfectGuardT: 0
    };
    place(actor, where);
    actor.onHit = (info) => onHurt(ctx2, actor, info);
    ctx2.player = actor;
    ctx2.world?.clamp?.(actor);
    clear2();
    return actor;
  }
  function onHurt(ctx2, actor, info) {
    if (!info || !(info.applied > 0)) return;
    actor.hurtT = HURT_IFRAME;
    edge("#c23b3b", 0.2);
    impact(actor.x, actor.y, "#ff5a6a");
    if (actor.flaskT > 0) {
      const type = actor.flaskPending || actor.flaskId;
      actor.flaskT = 0;
      actor.flaskPending = null;
      ctx2.bus.emit(EVENTS.FLASK_INTERRUPTED, { type, id: actor.id });
      label(actor.x, actor.y - 24, bi({ zh: "\u6253\u65AD", en: "WASTED" }), "#ff8a8a");
      ring(actor.x, actor.y, 18, "#ff5a6a", 0.28);
    }
    if (!actor.alive) {
      actor.rolling = false;
      actor.skillKind = "";
      actor.charging = false;
      actor.shield = false;
      actor.vx = 0;
      actor.vy = 0;
      actor.pose = "down";
      ring(actor.x, actor.y, 36, "#c23b3b", 0.45);
    }
  }
  function selectFlask(actor, input) {
    let next = "";
    if (input.pressed("1")) next = FLASK_ORDER[0];
    else if (input.pressed("2")) next = FLASK_ORDER[1];
    else if (input.pressed("3")) next = FLASK_ORDER[2];
    if (!next || next === actor.flaskId) return;
    actor.flaskId = next;
    const tag = next === "rtx5090" ? "RTX" : next.toUpperCase();
    label(actor.x, actor.y - 22, tag, "#b8ffd0");
  }
  function tryFlask(ctx2, actor, input) {
    selectFlask(actor, input);
    const qHeld = input.held("q") || input.held("r");
    const qEdge = input.pressed("q") || input.pressed("r");
    if (!qHeld) actor.gpuArm = true;
    if (!qEdge || !actor.gpuArm) return;
    actor.gpuArm = false;
    if (actor.flaskT > 0 || actor.rolling || actor.skillKind === "flurry") return;
    const id = actor.flaskId;
    const cds = actor.gpuCooldowns || (actor.gpuCooldowns = freshGpuCooldowns());
    if ((cds[id] || 0) > 0) return;
    if (actor.charging) cancelChannel(ctx2, actor);
    cds[id] = FLASKS[id]?.cd || 0;
    actor.flaskT = FLASK_TIME;
    actor.flaskPending = id;
    ctx2.bus.emit(EVENTS.FLASK_USED, { type: id, id: actor.id });
    ctx2.audio?.playSfx(FLASKS[id].sfx || "sfx.flask");
    ctx2.bus.emit(EVENTS.VFX, {
      kind: "heal_pillar",
      x: actor.x,
      y: actor.y,
      color: id === "b200" ? "#ffe08a" : "#7dffb0",
      h: 72
    });
    dust(actor.x, actor.y);
  }
  function finishFlask(ctx2, actor) {
    const id = actor.flaskPending;
    actor.flaskPending = null;
    actor.flaskT = 0;
    if (!id || !actor.alive) return;
    const spec = FLASKS[id];
    if (!spec) return;
    actor.hp = Math.min(actor.maxHp, actor.hp + actor.maxHp * spec.heal);
    if (spec.clearR) {
      clear(ctx2, "boss", {
        sparks: true,
        near: { x: actor.x, y: actor.y, r: spec.clearR },
        color: "#9dff9a"
      });
      ring(actor.x, actor.y, spec.clearR, "#9dff9a", 0.4);
    }
    if (spec.superarmor) {
      actor.superarmor = spec.superarmor;
      actor.superarmorMul = spec.armor == null ? 0.6 : spec.armor;
    }
    ctx2.audio?.playSfx("sfx.heal");
    const color = id === "b200" ? "#ffe08a" : "#9dff9a";
    ctx2.bus.emit(EVENTS.VFX, { kind: "heal_pillar", x: actor.x, y: actor.y, color, h: 88 });
    ctx2.bus.emit(EVENTS.VFX, { kind: "shockwave", x: actor.x, y: actor.y, r: spec.clearR || 32, color });
    ctx2.bus.emit(EVENTS.SHAKE, { mag: id === "b200" ? 4 : 2, dur: 0.16 });
    ctx2.bus.emit(EVENTS.FLASH, {
      color: id === "b200" ? "rgba(255,214,120,0.4)" : "rgba(130,255,170,0.32)",
      dur: 0.1
    });
    ring(actor.x, actor.y, id === "b200" ? 46 : 26, color, 0.35);
    const healWord = id === "b200" ? bi({ zh: "\u6EE1\u8840", en: "FULL" }) : bi({ zh: "\u6CBB\u7597", en: "HEAL" });
    label(actor.x, actor.y - 28, healWord, "#e7ffd8");
  }
  function rollVector(actor, move, aim) {
    if (move) return move;
    if (aim) return aim;
    const last = unit2(actor.aimX, actor.aimY);
    return last || { x: 0, y: -1 };
  }
  function startRoll(ctx2, actor, dir) {
    cancelChannel(ctx2, actor);
    actor.rolling = true;
    actor.rollT = 0;
    actor.rollX = dir.x;
    actor.rollY = dir.y;
    actor.rollAcc = 8;
    actor.dustT = 0;
    actor.facing = facingName(dir.x, dir.y);
    ctx2.bus.emit(EVENTS.ROLL_START, { id: actor.id });
    ctx2.audio?.playSfx("sfx.roll");
    ghost(actor.x, actor.y, PLAYER[actor.id] && PLAYER[actor.id].accent || "#f4f1ea");
    dust(actor.x, actor.y);
  }
  function integrateRoll(ctx2, actor, dt) {
    actor.rollT += dt;
    let step2 = dt;
    if (actor.rollT > ROLL.duration) {
      step2 = Math.max(0, dt - (actor.rollT - ROLL.duration));
      actor.rollT = ROLL.duration;
    }
    const sp = ROLL.distance / ROLL.duration;
    actor.vx = actor.rollX * sp;
    actor.vy = actor.rollY * sp;
    actor.x += actor.rollX * sp * step2;
    actor.y += actor.rollY * sp * step2;
    actor.facing = facingName(actor.rollX, actor.rollY);
    if (actor.rollT >= ROLL.iframeStart && actor.rollT <= ROLL.iframeEnd) {
      actor.invuln = Math.max(actor.invuln || 0, ROLL.iframeEnd - actor.rollT);
    }
    actor.rollAcc = (actor.rollAcc || 0) + sp * step2;
    if (actor.rollAcc >= 8) {
      actor.rollAcc -= 8;
      const col = PLAYER[actor.id] && PLAYER[actor.id].accent || "#f4f1ea";
      ghost(actor.x, actor.y, col);
      ctx2.bus.emit(EVENTS.VFX, { kind: "afterimage", x: actor.x, y: actor.y, color: col, life: 0.18 });
    }
    actor.dustT = (actor.dustT || 0) - step2;
    if (actor.dustT <= 0) {
      actor.dustT = 0.08;
      dust(actor.x, actor.y);
      ctx2.bus.emit(EVENTS.VFX, { kind: "dust", x: actor.x, y: actor.y, color: "#d9d0c1" });
    }
    if (actor.rollT >= ROLL.duration) {
      actor.rolling = false;
      actor.rollCd = ROLL.cooldown;
      actor.vx = 0;
      actor.vy = 0;
      dust(actor.x, actor.y);
      ctx2.bus.emit(EVENTS.ROLL_END, { id: actor.id });
    }
  }
  function integrateMove(actor, move, dt) {
    const base = PLAYER[actor.id] && PLAYER[actor.id].speed || 100;
    const speed = base * moveMul(actor);
    const tx = move ? move.x * speed : 0;
    const ty = move ? move.y * speed : 0;
    const accel = base / MOVE_RESP;
    const next = approachVec(actor.vx || 0, actor.vy || 0, tx, ty, dt, accel);
    actor.vx = next.x;
    actor.vy = next.y;
    actor.x += actor.vx * dt;
    actor.y += actor.vy * dt;
  }
  function syncMeters(actor) {
    const skill = PLAYER[actor.id] && PLAYER[actor.id].skill;
    const maxCd = skill && skill.cd || 6;
    actor.staminaMax = 100;
    if (actor.shield && skill && skill.hold) {
      actor.stamina = Math.max(0, (1 - (actor.shieldAge || 0) / skill.hold) * 100);
    } else if (actor.charging && skill && skill.chargeMax) {
      actor.stamina = Math.max(0, Math.min(100, (actor.chargeT || 0) / skill.chargeMax * 100));
    } else if (actor.skillCd > 0) {
      actor.stamina = Math.max(0, (1 - actor.skillCd / maxCd) * 100);
    } else {
      actor.stamina = 100;
    }
    if (!actor.alive) actor.pose = "down";
    else if (actor.rolling || actor.skillKind === "flurry" && actor.flurryPhase === "dash") actor.pose = "roll";
    else if (actor.flaskT > 0) actor.pose = "flask";
    else if (actor.shield) actor.pose = "shield";
    else if (actor.charging) actor.pose = "charge";
    else if (actor.skillKind === "flurry") actor.pose = "flurry";
    else actor.pose = "";
  }
  function update7(ctx2, dt) {
    tick(dt);
    const actor = ctx2.player;
    if (!actor) return;
    if (!actor.gpuCooldowns) actor.gpuCooldowns = freshGpuCooldowns();
    tickGpuCooldowns(actor, dt);
    if (actor.invuln > 0) actor.invuln = Math.max(0, actor.invuln - dt);
    if (actor.superarmor > 0) actor.superarmor = Math.max(0, actor.superarmor - dt);
    if (actor.rollCd > 0 && !actor.rolling) actor.rollCd = Math.max(0, actor.rollCd - dt);
    if (actor.hurtT > 0) {
      actor.hurtT = Math.max(0, actor.hurtT - dt);
      if (Math.floor(actor.hurtT * 16) % 2 === 0) actor.flash = Math.max(actor.flash || 0, 0.09);
    }
    if (!actor.alive) {
      actor.vx = 0;
      actor.vy = 0;
      actor.pose = "down";
      return;
    }
    const locked = !!ctx2.flags?.inputLocked;
    const input = ctx2.input;
    let mx = 0;
    let my = 0;
    if (!locked && input) {
      if (input.held("w") || input.held("W")) my -= 1;
      if (input.held("s") || input.held("S")) my += 1;
      if (input.held("a") || input.held("A")) mx -= 1;
      if (input.held("d") || input.held("D")) mx += 1;
    }
    const move = unit2(mx, my);
    const aim = !locked && input ? input.aimVector(actor) : null;
    if (aim) {
      actor.aimX = aim.x;
      actor.aimY = aim.y;
      actor.facing = facingName(aim.x, aim.y);
    } else if (move) {
      actor.facing = facingName(move.x, move.y);
    }
    nudgeAim(actor);
    if (!locked && input) tryFlask(ctx2, actor, input);
    if (actor.flaskT > 0) {
      actor.flaskT -= dt;
      if (actor.flaskT <= 0) finishFlask(ctx2, actor);
    }
    const skillHeld = !locked && !!input && (input.held("shift") || input.held("e") || input.held("rmb"));
    const skillDown = !locked && !!input && (input.pressed("shift") || input.pressed("e") || input.pressed("rmb"));
    const wantRoll = !locked && !!input && input.pressed("space");
    if (wantRoll && !actor.rolling && actor.flaskT <= 0 && actor.rollCd <= 0 && actor.skillKind !== "flurry") {
      startRoll(ctx2, actor, rollVector(actor, move, aim));
    }
    const aimVec = {
      x: Number.isFinite(actor.aimX) ? actor.aimX : 0,
      y: Number.isFinite(actor.aimY) ? actor.aimY : -1
    };
    tickSkill(ctx2, actor, dt, {
      aim: aimVec,
      skillHeld: skillHeld && !actor.rolling,
      skillDown: skillDown && !actor.rolling
    });
    if (actor.rolling) integrateRoll(ctx2, actor, dt);
    else if (actor.skillKind === "flurry") {
      if (actor.flurryPhase !== "dash") {
        actor.vx = 0;
        actor.vy = 0;
      }
    } else {
      integrateMove(actor, move, dt);
    }
    ctx2.world?.clamp?.(actor);
    tickPrimary(ctx2, actor, dt, { fire: !!aim && !locked, aim: aim ? aimVec : null });
    syncMeters(actor);
  }
  function render5(ctx2, g) {
    render4(ctx2, g);
  }
  function despawn(ctx2) {
    ctx2.player = null;
    clear2();
  }
  function init8(ctx2) {
    install2(ctx2);
  }

  // src/actors/allies.js
  function say(ctx2, ally, key) {
    if (!ally || ally.talkCd > 0) return;
    const pools = ALLY_SPEECH[ally.id];
    const pool = pools && pools[key];
    if (!pool || pool.length === 0) return;
    const line = pool[Math.floor(Math.random() * pool.length)];
    ally.talkCd = ALLY_TALK_MIN + Math.random() * (ALLY_TALK_MAX - ALLY_TALK_MIN);
    ctx2.bus.emit(EVENTS.ALLY_SPEECH, { id: ally.id, text: { zh: line.zh, en: line.en } });
    if (line.vo) ctx2.audio?.playSfx(line.vo);
    const host = document.getElementById("ui-root");
    if (!host) return;
    const el = document.createElement("div");
    el.className = "speech-bubble";
    el.textContent = `${line.zh} / ${line.en}`;
    const sx = ally.x + WORLD_OX;
    const sy = ally.y + WORLD_OY - 36;
    el.style.left = `${Math.round(sx / INTERNAL_W * 100)}%`;
    el.style.top = `${Math.round(sy / INTERNAL_H * 100)}%`;
    host.appendChild(el);
    window.setTimeout(() => {
      el.remove();
    }, 2400);
  }
  function makeAlly(ctx2, id, index2) {
    const ally = {
      id,
      team: "ally",
      kitId: id,
      x: index2 === 0 ? 168 : 312,
      y: 196,
      vx: 0,
      vy: 0,
      r: HURT_R,
      hp: ALLY_HP,
      maxHp: ALLY_HP,
      alive: true,
      invuln: 0,
      facing: "n",
      sprite: `px.${id}`,
      rolling: false,
      rollT: 0,
      rollX: 0,
      rollY: -1,
      fireCd: 0.2 + index2 * 0.15,
      skillCd: 3 + index2,
      aimX: 0,
      aimY: -1,
      talkCd: 1.5,
      downing: false,
      downT: 0,
      nerfed: false,
      dodgeId: "",
      flash: 0,
      pose: "",
      hurtLog: {},
      charging: false,
      shield: false,
      skillKind: "",
      flaskT: 0
    };
    ally.onHit = () => say(ctx2, ally, "hit");
    ctx2.world?.clamp?.(ally);
    return ally;
  }
  function dodge(ctx2, ally) {
    const api2 = ctx2.world?.telegraph;
    if (!api2 || ally.rolling) return;
    const teles = api2.active ? api2.active() : [];
    for (let i = 0; i < teles.length; i += 1) {
      const tele = teles[i];
      if (!api2.contains(tele, ally.x, ally.y)) continue;
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
  function inPlayerLineOfFire(ctx2, ally) {
    const p = ctx2.player;
    if (!p || !p.alive) return false;
    let ax = p.aimX;
    let ay = p.aimY;
    if (!ax && !ay && ctx2.input) {
      const aim = ctx2.input.aimVector?.(p);
      if (aim) {
        ax = aim.x;
        ay = aim.y;
      }
    }
    if (!ax && !ay) return false;
    const dx = ally.x - p.x;
    const dy = ally.y - p.y;
    const along = dx * ax + dy * ay;
    if (along < 10 || along > 220) return false;
    const perp = Math.abs(-dx * ay + dy * ax);
    return perp < 32;
  }
  function steer(ctx2, ally, dt) {
    const boss = ctx2.boss;
    if (!boss) return;
    const band = ALLY_BAND[ally.id] || [80, 120];
    const dx = ally.x - boss.x;
    const dy = ally.y - boss.y;
    const dist = Math.hypot(dx, dy) || 1;
    let tx;
    let ty;
    if (dist < band[0]) {
      tx = boss.x + dx / dist * band[1];
      ty = boss.y + dy / dist * band[1];
    } else if (dist > band[1]) {
      const mid = (band[0] + band[1]) * 0.5;
      tx = boss.x + dx / dist * mid;
      ty = boss.y + dy / dist * mid;
    } else {
      tx = ally.x + -dy / dist * 36;
      ty = ally.y + dx / dist * 36;
    }
    if (inPlayerLineOfFire(ctx2, ally)) {
      const p = ctx2.player;
      let ax2 = Number.isFinite(p.aimX) ? p.aimX : 0;
      let ay2 = Number.isFinite(p.aimY) ? p.aimY : -1;
      const alen = Math.hypot(ax2, ay2) || 1;
      ax2 /= alen;
      ay2 /= alen;
      const side = (ally.x - p.x) * -ay2 + (ally.y - p.y) * ax2 >= 0 ? 1 : -1;
      tx = ally.x - ay2 * side * 52;
      ty = ally.y + ax2 * side * 52;
    }
    const mx = tx - ally.x;
    const my = ty - ally.y;
    const len = Math.hypot(mx, my) || 1;
    const speed = ALLY_SPEED[ally.id] || 90;
    if (len > 4) {
      ally.vx = mx / len * speed;
      ally.vy = my / len * speed;
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
  function spawn5(ctx2, playerId) {
    const chosen = String(playerId || "deepseek");
    const ids = ROSTER.filter((id) => id !== chosen);
    ctx2.allies = ids.map((id, i) => makeAlly(ctx2, id, i));
    return ctx2.allies;
  }
  function update8(ctx2, dt) {
    const allies = ctx2.allies || [];
    for (let i = 0; i < allies.length; i += 1) {
      const ally = allies[i];
      if (ally.talkCd > 0) ally.talkCd -= dt;
      if (ally.invuln > 0) ally.invuln = Math.max(0, ally.invuln - dt);
      if (!ally.alive) {
        if (!ally.downing) {
          ally.downing = true;
          ally.downT = ALLY_REVIVE;
          ally.pose = "down";
          ally.ghostPulse = 0;
          say(ctx2, ally, "down");
          ctx2.bus.emit(EVENTS.VFX, { kind: "shock", x: ally.x, y: ally.y - 8, color: "#a8c4ff", life: 0.35 });
          ctx2.bus.emit(EVENTS.SHAKE, { mag: 1, dur: 0.08 });
        }
        ally.downT -= dt;
        ally.vx = 0;
        ally.vy = 0;
        ally.ghostPulse = (ally.ghostPulse || 0) + dt;
        if (ally.ghostPulse >= 0.55) {
          ally.ghostPulse = 0;
          ctx2.bus.emit(EVENTS.VFX, { kind: "spark", x: ally.x, y: ally.y - 10, color: "#d0e8ff" });
        }
        if (ally.downT <= 0) {
          ally.alive = true;
          ally.downing = false;
          ally.hp = ally.maxHp * ALLY_REVIVE_HP;
          ally.invuln = 0.8;
          ally.pose = "";
          ctx2.bus.emit(EVENTS.ALLY_REVIVE, { id: ally.id });
          say(ctx2, ally, "revive");
        }
        continue;
      }
      dodge(ctx2, ally);
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
        steer(ctx2, ally, dt);
      }
      ctx2.world?.clamp?.(ally);
      const aim = { x: ally.aimX, y: ally.aimY };
      if ((ally.skillCd || 0) <= 0 && !ally.shield && !ally.charging && !ally.rolling) {
        allyPulse(ctx2, ally, aim);
        ally.skillCd = ALLY_SKILL_CD;
      }
      tickSkill(ctx2, ally, dt, {
        aim,
        skillHeld: !!(ally.shield && ally.shieldAge < 0.6),
        skillDown: false
      });
      tickPrimary(ctx2, ally, dt, { fire: !ally.rolling && !ally.shield, aim });
      const maxCd = PLAYER[ally.id]?.skill?.cd || 6;
      if (ally.shield) ally.facing = facingName(ally.aimX, ally.aimY);
      void maxCd;
    }
  }
  function init9(ctx2) {
    ctx2.allies = [];
    ctx2.bus.on(EVENTS.PHASE_CHANGE, ({ phase }) => {
      for (let i = 0; i < ctx2.allies.length; i += 1) {
        const a = ctx2.allies[i];
        if (phase === 3 && !a.nerfed) {
          a.nerfed = true;
          a.maxHp = Math.round(ALLY_HP * ALLY_P3_HP_SCALE);
          a.hp = Math.min(a.hp, a.maxHp);
        } else if (phase < 3 && a.nerfed) {
          a.nerfed = false;
          a.maxHp = ALLY_HP;
        }
        say(ctx2, a, "phase");
      }
    });
    ctx2.bus.on(EVENTS.FLASK_USED, () => {
      const ally = ctx2.allies && ctx2.allies[0];
      if (ally) say(ctx2, ally, "flask");
    });
    ctx2.bus.on(EVENTS.SAFETY_JUDGEMENT, () => {
      for (let i = 0; i < ctx2.allies.length; i += 1) say(ctx2, ctx2.allies[i], "judgment");
    });
  }
  function despawn2(ctx2) {
    ctx2.allies = [];
  }
  function render6(ctx2, g) {
    const allies = ctx2.allies || [];
    for (let i = 0; i < allies.length; i += 1) {
      const a = allies[i];
      if (!a.alive && a.downing) {
        const pulse2 = 0.5 + 0.5 * Math.sin((ALLY_REVIVE - a.downT) * 4);
        g.globalAlpha = 0.35 + pulse2 * 0.25;
        g.strokeStyle = "#9cc9f0";
        g.lineWidth = 1;
        const r = 10 + Math.round(pulse2 * 4);
        g.strokeRect(Math.round(a.x - r), Math.round(a.y - r - 8), r * 2, r * 2);
        g.globalAlpha = 1;
      }
    }
  }

  // src/boss/patterns.js
  var seq2 = 1;
  function token() {
    seq2 += 1;
    return seq2;
  }
  function scaledWind(boss, base) {
    let w = base;
    if (boss && boss.phase === 3 && boss.maxHp > 0 && boss.hp / boss.maxHp <= ACCEL_AT) {
      w *= ACCEL_WINDUP;
    }
    if (base >= 2) return Math.max(2, w);
    if (base >= 0.9) return Math.max(0.9, w);
    if (base >= 0.45) return Math.max(0.45, w);
    return Math.max(0.05, w);
  }
  function bulletDmg(boss) {
    const phase = boss.phase || 1;
    return Math.max(1, Math.round((BULLET_DMG[phase] || 10) * (PHASE_DAMAGE_MUL[phase] || 1)));
  }
  function nearestAlly(ctx2, boss) {
    let best = null;
    let bestD = Infinity;
    const allies = ctx2.allies || [];
    for (let i = 0; i < allies.length; i += 1) {
      const a = allies[i];
      if (!a || !a.alive) continue;
      const d = Math.hypot(a.x - boss.x, a.y - boss.y);
      if (d < bestD) {
        bestD = d;
        best = a;
      }
    }
    return best;
  }
  function focus(ctx2, boss) {
    if (boss.aimTarget && boss.aimTarget.alive) return boss.aimTarget;
    if (ctx2.player && ctx2.player.alive) return ctx2.player;
    return nearestAlly(ctx2, boss);
  }
  function acquireTarget(ctx2, boss) {
    const player = ctx2.player && ctx2.player.alive ? ctx2.player : null;
    const ally = nearestAlly(ctx2, boss);
    const options = [];
    if (player) options.push(player);
    if (ally) options.push(ally);
    if (!options.length) {
      boss.aimTarget = null;
      return null;
    }
    let pick = options[0];
    const streak = boss.targetStreak || 0;
    let forced = false;
    if (boss.targetId && streak >= TARGET_STREAK) {
      const other = options.find((a) => a.id !== boss.targetId);
      if (other) {
        pick = other;
        forced = true;
      }
    }
    if (!forced && player && ally) {
      pick = Math.random() < TARGET_PLAYER_P ? player : ally;
    }
    if (pick.id === boss.targetId) boss.targetStreak = streak + 1;
    else {
      boss.targetId = pick.id;
      boss.targetStreak = 1;
    }
    boss.aimTarget = pick;
    return pick;
  }
  function aimPoint(ctx2, boss) {
    const t2 = boss.aimTarget;
    if (t2 && t2.alive) return t2;
    if (ctx2.player && ctx2.player.alive) return ctx2.player;
    return nearestAlly(ctx2, boss) || { x: boss.x, y: boss.y + 48, alive: false, r: 3, id: "none" };
  }
  function angleTo(boss, tgt) {
    if (!tgt) return boss.aimAng || 0;
    const ang = Math.atan2(tgt.y - boss.y, tgt.x - boss.x);
    return Number.isFinite(ang) ? ang : 0;
  }
  function faceAng(boss, ang) {
    if (!Number.isFinite(ang)) return;
    boss.aimAng = ang;
    const names = ["e", "se", "s", "sw", "w", "nw", "n", "ne"];
    boss.facing = names[(Math.round(ang / (Math.PI / 4)) + 8) % 8];
  }
  function rayLen(x, y, ang, pad) {
    const inner = innerOf(ROOM);
    const dx = Math.cos(ang);
    const dy = Math.sin(ang);
    let t2 = 800;
    if (dx > 1e-3) t2 = Math.min(t2, (inner.x + inner.w - x) / dx);
    else if (dx < -1e-3) t2 = Math.min(t2, (inner.x - x) / dx);
    if (dy > 1e-3) t2 = Math.min(t2, (inner.y + inner.h - y) / dy);
    else if (dy < -1e-3) t2 = Math.min(t2, (inner.y - y) / dy);
    if (!Number.isFinite(t2) || t2 < 0) t2 = 80;
    return Math.max(36, t2 - (pad || 12));
  }
  function clampPoint(x, y, r) {
    const p = { x, y, r: r || 0 };
    clampTo(p, innerOf(ROOM));
    return p;
  }
  function fanDirs(ang, n, spread) {
    const out = [];
    if (n <= 1) {
      out.push(ang);
      return out;
    }
    const step2 = spread / (n - 1);
    for (let i = 0; i < n; i += 1) out.push(ang - spread / 2 + step2 * i);
    return out;
  }
  function fighters(ctx2) {
    const list2 = [];
    if (ctx2.player) list2.push(ctx2.player);
    const allies = ctx2.allies || [];
    for (let i = 0; i < allies.length; i += 1) if (allies[i]) list2.push(allies[i]);
    return list2;
  }
  function shoot2(ctx2, boss, spec) {
    if (count("boss") >= ENEMY_BULLET_SOFT_CAP) return null;
    const ang = Number.isFinite(spec.ang) ? spec.ang : 0;
    const sp = spec.speed || 0;
    const vx = spec.vx != null ? spec.vx : Math.cos(ang) * sp;
    const vy = spec.vy != null ? spec.vy : Math.sin(ang) * sp;
    return spawn(ctx2, {
      team: "boss",
      ownerId: "claude",
      x: spec.x == null ? boss.x : spec.x,
      y: spec.y == null ? boss.y : spec.y,
      vx,
      vy,
      r: spec.r || 3,
      dmg: spec.dmg == null ? bulletDmg(boss) : spec.dmg,
      life: spec.life || 2.2,
      shape: spec.shape || "petal",
      color: spec.color || "#ff6b45",
      homing: spec.homing || 0,
      attackId: spec.attackId || `b${token()}`,
      heavy: !!spec.heavy
    });
  }
  function hitWhere(ctx2, boss, test, dmg, attackId, opts) {
    const o = opts || {};
    const list2 = fighters(ctx2);
    for (let i = 0; i < list2.length; i += 1) {
      const a = list2[i];
      if (!a || !a.alive) continue;
      if (!test(a)) continue;
      applyHit(ctx2, boss, a, dmg, {
        attackId,
        heavy: !!o.heavy,
        shake: o.shake,
        hitStopMs: o.hitStopMs,
        immuneFor: o.immuneFor,
        flash: o.flash
      });
    }
  }
  function dashHit(ctx2, boss, c, dmg) {
    hitWhere(
      ctx2,
      boss,
      (a) => Math.hypot(a.x - boss.x, a.y - boss.y) <= a.r + boss.r + 6,
      dmg,
      `dash-${c.token}`,
      { heavy: true, shake: 3, hitStopMs: 45, immuneFor: 1.2 }
    );
  }
  function addSwing(boss, ang, arc, r, color, life) {
    if (!boss.swings) boss.swings = [];
    boss.swings.push({ ang, arc, r, color, life, max: life });
  }
  function showBubble(pair, x, y) {
    if (typeof document === "undefined") return;
    const host = document.getElementById("ui-root");
    if (!host) return;
    const el = document.createElement("div");
    el.className = "speech-bubble";
    el.textContent = bi(pair);
    el.style.left = `${(x + WORLD_OX) / INTERNAL_W * 100}%`;
    el.style.top = `${(y + WORLD_OY - 28) / INTERNAL_H * 100}%`;
    host.appendChild(el);
    window.setTimeout(() => {
      el.remove();
    }, 1800);
  }
  function announce(ctx2, boss, id) {
    const meta = PATTERN[id];
    const name = meta ? meta.name : { zh: id, en: id };
    ctx2.bus.emit(EVENTS.BOSS_ATTACK, { id, name, phase: boss.phase });
    boss.callout = { zh: name.zh, en: name.en, life: 2.2 };
    boss.lastAttack = id;
  }
  function punishPolicy(ctx2, boss, x, y) {
    const now2 = ctx2.time?.elapsed || 0;
    ctx2.flags.skillSilence = Math.max(ctx2.flags.skillSilence || 0, SILENCE_SEC);
    ctx2.flags.skillSilenceUntil = now2 + ctx2.flags.skillSilence;
    ctx2.flags.contentPolicySilence = true;
    ctx2.bus.emit(EVENTS.SKILL_SILENCE, {
      duration: SILENCE_SEC,
      until: ctx2.flags.skillSilenceUntil,
      zh: SILENCE_LABEL.zh,
      en: SIGIL_BUBBLE.en
    });
    if (boss._bubbleAt && now2 - boss._bubbleAt < 0.45) return;
    boss._bubbleAt = now2;
    ctx2.bus.emit("boss_bubble", { zh: SIGIL_BUBBLE.zh, en: SIGIL_BUBBLE.en, x, y });
    const bubble = bi(SIGIL_BUBBLE);
    if (ctx2.world && ctx2.world.setHolo) ctx2.world.setHolo(bubble, bubble);
    showBubble(SIGIL_BUBBLE, x, y - 26);
  }
  function releasePinned(boss, mode2) {
    const arr = boss.pinned || [];
    for (let i = 0; i < arr.length; i += 1) {
      const b = arr[i];
      if (!b || !b.alive) continue;
      b.pinned = false;
      if (mode2 === "kill") {
        b.alive = false;
        continue;
      }
      const ang = Math.atan2(b.y - boss.y, b.x - boss.x);
      b.vx = Math.cos(ang) * 96;
      b.vy = Math.sin(ang) * 96;
      b.life = 1.15;
    }
    boss.pinned = [];
  }
  function endCast(boss) {
    const pair = PHASE_GAP[boss.phase] || PHASE_GAP[1];
    releasePinned(boss, "fling");
    boss.cast = null;
    boss.rooted = false;
    boss.dashing = false;
    boss.vx = 0;
    boss.vy = 0;
    boss.gap = pair[0] + Math.random() * (pair[1] - pair[0]);
    boss.hoppedThisGap = false;
    boss.goal = null;
    boss.goalT = 0;
    if (boss.fx) {
      boss.fx.chain = null;
      boss.fx.wings = 0;
      boss.fx.sword = null;
      boss.fx.spin = 0;
      boss.fx.arms = 0;
    }
  }
  function fireFan(ctx2, boss, ang, cfg) {
    const dirs = fanDirs(ang, cfg.count, cfg.spread);
    const dmg = bulletDmg(boss);
    for (let i = 0; i < dirs.length; i += 1) {
      shoot2(ctx2, boss, {
        ang: dirs[i],
        speed: cfg.speed,
        shape: cfg.shape,
        color: cfg.color,
        r: cfg.r,
        life: cfg.life,
        dmg
      });
    }
    ctx2.bus.emit(EVENTS.VFX, { kind: "muzzle", x: boss.x, y: boss.y, color: cfg.color });
  }
  function p1Refusal(ctx2, boss, c) {
    const cfg = PATTERN.p1_refusal;
    if (!c.plan) {
      c.plan = [];
      let t2 = 0;
      for (let v = 0; v < cfg.volleys; v += 1) {
        const wind = scaledWind(boss, v === 0 ? cfg.wind : cfg.gap);
        c.plan.push({ spawnAt: t2, wind, ang: 0, teles: null, fired: false });
        t2 += wind;
      }
      c.end = t2 + 0.08;
      c.windEnd = c.plan[0].wind;
    }
    for (let i = 0; i < c.plan.length; i += 1) {
      const p = c.plan[i];
      if (c.t < p.spawnAt) continue;
      if (!p.teles) {
        p.ang = angleTo(boss, aimPoint(ctx2, boss));
        const show5 = fanDirs(p.ang, 3, cfg.spread);
        p.teles = [];
        for (let s = 0; s < show5.length; s += 1) {
          const tele = spawn3(ctx2, {
            kind: "aim",
            x: boss.x,
            y: boss.y,
            dirX: Math.cos(show5[s]),
            dirY: Math.sin(show5[s]),
            length: Math.min(200, rayLen(boss.x, boss.y, show5[s], 8)),
            width: 8,
            duration: p.wind,
            attack: "p1_refusal",
            onResolve: () => {
              if (p.fired) return;
              p.fired = true;
              fireFan(ctx2, boss, p.ang, cfg);
            }
          });
          p.teles.push(tele);
        }
      } else if (!p.fired && c.t < p.spawnAt + p.wind - 0.1) {
        p.ang = angleTo(boss, aimPoint(ctx2, boss));
        const show5 = fanDirs(p.ang, 3, cfg.spread);
        for (let s = 0; s < p.teles.length; s += 1) {
          const tele = p.teles[s];
          if (!tele.alive) continue;
          tele.x = boss.x;
          tele.y = boss.y;
          tele.dirX = Math.cos(show5[s]);
          tele.dirY = Math.sin(show5[s]);
          tele.length = Math.min(200, rayLen(boss.x, boss.y, show5[s], 8));
        }
      }
    }
    const live = c.plan.find((p) => !p.fired);
    if (live) faceAng(boss, live.ang || angleTo(boss, aimPoint(ctx2, boss)));
    return c.t >= c.end;
  }
  function p1Rings(ctx2, boss, c, dt) {
    const cfg = PATTERN.p1_rings;
    if (c.step == null) {
      c.wind = scaledWind(boss, cfg.wind);
      c.step = 1;
      c.n = 0;
      c.next = c.wind;
      c.spin = 0;
      spawn3(ctx2, {
        kind: "ring",
        x: boss.x,
        y: boss.y,
        r: 48,
        duration: c.wind,
        attack: "p1_rings",
        mark: "glyph"
      });
    }
    c.spin += dt * 7;
    if (boss.fx) boss.fx.spin = c.spin;
    if (c.n < 3 && c.t >= c.next) {
      const n = cfg.counts[c.n];
      const spin = c.n * 0.55;
      const dmg = bulletDmg(boss);
      for (let i = 0; i < n; i += 1) {
        shoot2(ctx2, boss, {
          ang: spin + Math.PI * 2 * i / n,
          speed: cfg.speed,
          shape: cfg.shape,
          color: cfg.color,
          r: cfg.r,
          life: cfg.life,
          dmg
        });
      }
      ctx2.bus.emit(EVENTS.VFX, { kind: "shock", x: boss.x, y: boss.y, r: 22, color: cfg.color });
      c.n += 1;
      c.next = c.t + cfg.gap;
      if (c.n >= 3) c.done = c.t + 0.16;
    }
    return c.n >= 3 && c.done != null && c.t >= c.done;
  }
  function p1Topic(ctx2, boss, c, dt) {
    const cfg = PATTERN.p1_topic;
    if (c.step == null) {
      const tgt = aimPoint(ctx2, boss);
      c.ang = angleTo(boss, tgt);
      faceAng(boss, c.ang);
      const len = rayLen(boss.x, boss.y, c.ang, boss.r + 4);
      c.x0 = boss.x;
      c.y0 = boss.y;
      const end = clampPoint(boss.x + Math.cos(c.ang) * len, boss.y + Math.sin(c.ang) * len, boss.r);
      c.x1 = end.x;
      c.y1 = end.y;
      c.wind = scaledWind(boss, cfg.wind);
      c.step = 0;
      c.petalD = 0;
      spawn3(ctx2, {
        kind: "line",
        x: boss.x,
        y: boss.y,
        dirX: Math.cos(c.ang),
        dirY: Math.sin(c.ang),
        length: Math.max(24, Math.hypot(c.x1 - c.x0, c.y1 - c.y0)),
        width: 16,
        duration: c.wind,
        attack: "p1_topic"
      });
    }
    if (c.step === 0 && c.t >= c.wind) {
      c.step = 1;
      c.dashT = 0;
      boss.dashing = true;
      ctx2.bus.emit(EVENTS.SHAKE, { mag: 3, dur: 0.12 });
      ctx2.bus.emit(EVENTS.VFX, { kind: "muzzle", x: boss.x, y: boss.y, color: cfg.color });
    }
    if (c.step !== 1) return false;
    const dist = Math.hypot(c.x1 - c.x0, c.y1 - c.y0) || 1;
    const dur = Math.max(0.18, dist / cfg.speed);
    c.dashT += dt;
    const k = Math.min(1, c.dashT / dur);
    const nx = c.x0 + (c.x1 - c.x0) * k;
    const ny = c.y0 + (c.y1 - c.y0) * k;
    c.petalD += Math.hypot(nx - boss.x, ny - boss.y);
    boss.x = nx;
    boss.y = ny;
    boss.vx = (c.x1 - c.x0) / dur;
    boss.vy = (c.y1 - c.y0) / dur;
    faceAng(boss, c.ang);
    let guard = 0;
    while (c.petalD >= cfg.petalEvery && guard < 6) {
      c.petalD -= cfg.petalEvery;
      guard += 1;
      const side = c.side ? 1 : -1;
      c.side = !c.side;
      const perp = c.ang + Math.PI / 2;
      shoot2(ctx2, boss, {
        x: boss.x,
        y: boss.y,
        vx: Math.cos(perp) * side * cfg.petalSpeed + Math.cos(c.ang) * 12,
        vy: Math.sin(perp) * side * cfg.petalSpeed + Math.sin(c.ang) * 12,
        shape: cfg.shape,
        color: cfg.color,
        r: cfg.r,
        life: cfg.life,
        dmg: bulletDmg(boss)
      });
    }
    dashHit(ctx2, boss, c, HEAVY.dash);
    if (k < 1) return false;
    boss.dashing = false;
    boss.vx = 0;
    boss.vy = 0;
    return true;
  }
  function p1Spin(ctx2, boss, c, dt) {
    const cfg = PATTERN.p1_spin;
    if (c.step == null) {
      c.wind = scaledWind(boss, cfg.wind);
      c.step = 1;
      c.spin = 0;
      c.tele = spawn3(ctx2, {
        kind: "circle",
        x: boss.x,
        y: boss.y,
        r: cfg.r,
        duration: c.wind,
        attack: "p1_spin",
        onResolve: (ctx22, tele) => {
          hitWhere(
            ctx22,
            boss,
            (a) => Math.hypot(a.x - tele.x, a.y - tele.y) <= cfg.r + a.r,
            HEAVY.spin,
            tele.id,
            { heavy: true, shake: 4, hitStopMs: 60, immuneFor: 0.85 }
          );
          const base = c.spin || 0;
          for (let i = 0; i < cfg.bullets; i += 1) {
            shoot2(ctx22, boss, {
              x: tele.x,
              y: tele.y,
              ang: base + Math.PI * 2 * i / cfg.bullets,
              speed: cfg.speed,
              shape: cfg.shape,
              color: cfg.color,
              r: cfg.bulletR,
              life: cfg.life,
              dmg: bulletDmg(boss)
            });
          }
          addSwing(boss, base, Math.PI * 1.7, cfg.r - 6, "#ffb089", 0.22);
          ctx22.bus.emit(EVENTS.VFX, { kind: "shock", x: boss.x, y: boss.y, r: cfg.r, color: "#ffb089" });
        }
      });
    }
    c.spin += dt * 14;
    if (boss.fx) boss.fx.spin = c.spin;
    if (c.tele && c.tele.alive) {
      c.tele.x = boss.x;
      c.tele.y = boss.y;
    }
    return c.t > c.wind + 0.12;
  }
  function p2Spiral(ctx2, boss, c, dt) {
    const cfg = PATTERN.p2_spiral;
    if (c.step == null) {
      c.wind = scaledWind(boss, cfg.wind);
      c.step = 1;
      c.acc = 0;
      c.spin = Math.random() * Math.PI;
      c.tele = spawn3(ctx2, {
        kind: "ring",
        x: boss.x,
        y: boss.y,
        r: 36,
        duration: c.wind,
        attack: "p2_spiral",
        mark: "glyph"
      });
    }
    const arms = boss.hp / boss.maxHp <= SPIRAL_ARM_AT ? 3 : 2;
    if (boss.fx) boss.fx.arms = arms;
    if (c.tele && c.tele.alive) {
      c.tele.x = boss.x;
      c.tele.y = boss.y;
    }
    if (c.t < c.wind) return false;
    if (c.t > c.wind + cfg.hold) return true;
    c.acc += dt;
    let guard = 0;
    const dmg = bulletDmg(boss);
    while (c.acc >= cfg.interval && guard < 8) {
      c.acc -= cfg.interval;
      guard += 1;
      c.spin += cfg.turn;
      for (let i = 0; i < arms; i += 1) {
        shoot2(ctx2, boss, {
          ang: c.spin + Math.PI * 2 * i / arms,
          speed: cfg.speed,
          shape: cfg.shape,
          color: cfg.color,
          r: cfg.r,
          life: cfg.life,
          dmg
        });
      }
    }
    return false;
  }
  function sigilPoints(ctx2, boss) {
    const cfg = PATTERN.p2_sigils;
    const pts = [];
    const seen = /* @__PURE__ */ new Set();
    function add(x, y) {
      const p = clampPoint(x, y, 8);
      const key = `${Math.round(p.x / 10)}:${Math.round(p.y / 10)}`;
      if (seen.has(key)) return;
      seen.add(key);
      pts.push(p);
    }
    if (ctx2.player && ctx2.player.alive) add(ctx2.player.x, ctx2.player.y);
    const allies = ctx2.allies || [];
    for (let i2 = 0; i2 < allies.length; i2 += 1) {
      if (allies[i2] && allies[i2].alive) add(allies[i2].x, allies[i2].y);
    }
    const anchor = pts[0] || { x: boss.x, y: boss.y + 36 };
    const offsets = [[52, 18], [-46, 30], [18, -48], [-28, -24]];
    let i = 0;
    while (pts.length < cfg.count && i < offsets.length) {
      add(anchor.x + offsets[i][0], anchor.y + offsets[i][1]);
      i += 1;
    }
    return pts.slice(0, cfg.count);
  }
  function p2Sigils(ctx2, boss, c) {
    const cfg = PATTERN.p2_sigils;
    if (c.step == null) {
      c.wind = scaledWind(boss, cfg.wind);
      c.step = 1;
      const pts = sigilPoints(ctx2, boss);
      for (let i = 0; i < pts.length; i += 1) {
        const p = pts[i];
        spawn3(ctx2, {
          kind: "circle",
          x: p.x,
          y: p.y,
          r: cfg.r,
          duration: c.wind,
          attack: "p2_sigils",
          mark: "sigil",
          onResolve: (ctx22, tele) => {
            let playerHit = false;
            const list2 = fighters(ctx22);
            for (let n = 0; n < list2.length; n += 1) {
              const a = list2[n];
              if (!a || !a.alive) continue;
              if (Math.hypot(a.x - tele.x, a.y - tele.y) > tele.r + a.r) continue;
              const applied = applyHit(ctx22, boss, a, HEAVY.sigil, {
                attackId: tele.id,
                heavy: true,
                shake: 3,
                hitStopMs: 50,
                immuneFor: 0.7
              });
              if (a.team === "player" && applied > 0) playerHit = true;
            }
            ctx22.bus.emit(EVENTS.VFX, { kind: "shock", x: tele.x, y: tele.y, r: tele.r, color: "#e07a5f" });
            ctx22.bus.emit(EVENTS.VFX, { kind: "spark", x: tele.x, y: tele.y, color: "#fff4d2" });
            if (playerHit) punishPolicy(ctx22, boss, tele.x, tele.y);
          }
        });
      }
    }
    return c.t > c.wind + 0.08;
  }
  function p2Volley(ctx2, boss, c) {
    const cfg = PATTERN.p2_volley;
    if (!c.shots) {
      const lead = scaledWind(boss, cfg.wind);
      c.shots = [];
      let t2 = lead;
      for (let i = 0; i < cfg.shots; i += 1) {
        c.shots.push({
          i,
          spawnAt: t2 - lead,
          fireAt: t2,
          long: i % 2 === 1,
          tele: null,
          ang: 0,
          fired: false
        });
        t2 += i % 2 === 0 ? 0.2 : 0.36;
      }
      c.end = c.shots[c.shots.length - 1].fireAt + 0.12;
      c.windEnd = lead;
    }
    for (let i = 0; i < c.shots.length; i += 1) {
      const shot = c.shots[i];
      if (!shot.tele && c.t >= shot.spawnAt) {
        shot.ang = angleTo(boss, aimPoint(ctx2, boss));
        const spec = shot.long ? cfg.long : cfg.short;
        shot.tele = spawn3(ctx2, {
          kind: "aim",
          x: boss.x,
          y: boss.y,
          dirX: Math.cos(shot.ang),
          dirY: Math.sin(shot.ang),
          length: Math.min(210, rayLen(boss.x, boss.y, shot.ang, 6)),
          width: shot.long ? 12 : 5,
          duration: Math.max(0.05, shot.fireAt - shot.spawnAt),
          attack: "p2_volley",
          tone: shot.long ? "gold" : "ivory",
          onResolve: () => {
            if (shot.fired) return;
            shot.fired = true;
            shoot2(ctx2, boss, {
              ang: shot.ang,
              speed: spec.speed,
              r: spec.r,
              color: spec.color,
              shape: cfg.shape,
              life: cfg.life,
              dmg: bulletDmg(boss)
            });
            if (shot.long) {
              ctx2.bus.emit(EVENTS.SHAKE, { mag: 1, dur: 0.05 });
              ctx2.bus.emit(EVENTS.VFX, { kind: "muzzle", x: boss.x, y: boss.y, color: spec.color });
            }
          }
        });
      } else if (shot.tele && shot.tele.alive && c.t < shot.fireAt - 0.1) {
        shot.ang = angleTo(boss, aimPoint(ctx2, boss));
        shot.tele.x = boss.x;
        shot.tele.y = boss.y;
        shot.tele.dirX = Math.cos(shot.ang);
        shot.tele.dirY = Math.sin(shot.ang);
        shot.tele.length = Math.min(210, rayLen(boss.x, boss.y, shot.ang, 6));
      }
    }
    const live = c.shots.find((s) => !s.fired);
    if (live) faceAng(boss, live.ang || angleTo(boss, aimPoint(ctx2, boss)));
    return c.t >= c.end;
  }
  function planWalls(ctx2) {
    const inner = innerOf(ROOM);
    const cfg = PATTERN.p2_wall;
    const py = ctx2.player ? ctx2.player.y : inner.y + inner.h / 2;
    const px = ctx2.player ? ctx2.player.x : inner.x + inner.w / 2;
    function gapNear(center, min, max) {
      const size = cfg.gap;
      const lo = min + size * 0.5 + 20;
      const hi = max - size * 0.5 - 36;
      const mid = (lo + hi) * 0.5;
      const toward = center > mid ? -1 : 1;
      let g = center + toward * (36 + Math.random() * 44);
      if (g < lo) g = lo;
      if (g > hi) g = hi;
      return g;
    }
    return [
      { axis: "h", dir: 1, gap: gapNear(py, inner.y, inner.y + inner.h), gapSize: cfg.gap },
      { axis: "h", dir: -1, gap: gapNear(py, inner.y, inner.y + inner.h), gapSize: cfg.gap },
      { axis: "v", dir: 1, gap: gapNear(px, inner.x, inner.x + inner.w), gapSize: cfg.gap }
    ];
  }
  function spawnWall(ctx2, boss, w) {
    const cfg = PATTERN.p2_wall;
    const inner = innerOf(ROOM);
    const dmg = bulletDmg(boss);
    const half = w.gapSize * 0.5;
    if (w.axis === "h") {
      const x = w.dir > 0 ? inner.x + 8 : inner.x + inner.w - 8;
      const vx = w.dir * cfg.speed;
      for (let y2 = inner.y + 8; y2 <= inner.y + inner.h - 8; y2 += cfg.step) {
        if (Math.abs(y2 - w.gap) <= half) continue;
        shoot2(ctx2, boss, {
          x,
          y: y2,
          vx,
          vy: 0,
          shape: cfg.shape,
          color: cfg.color,
          r: cfg.r,
          life: cfg.life,
          dmg
        });
      }
      return;
    }
    const y = w.dir > 0 ? inner.y + 8 : inner.y + inner.h - 8;
    const vy = w.dir * cfg.speed;
    for (let x = inner.x + 8; x <= inner.x + inner.w - 8; x += cfg.step) {
      if (Math.abs(x - w.gap) <= half) continue;
      shoot2(ctx2, boss, {
        x,
        y,
        vx: 0,
        vy,
        shape: cfg.shape,
        color: cfg.color,
        r: cfg.r,
        life: cfg.life,
        dmg
      });
    }
  }
  function armWall(ctx2, boss, w, wind) {
    const inner = innerOf(ROOM);
    spawn3(ctx2, {
      kind: "gap",
      axis: w.axis,
      gap: w.gap,
      gapSize: w.gapSize,
      x: w.axis === "v" ? w.gap : inner.x + inner.w / 2,
      y: w.axis === "h" ? w.gap : inner.y + inner.h / 2,
      r: w.gapSize / 2,
      duration: wind,
      attack: "p2_wall",
      onResolve: (ctx22) => spawnWall(ctx22, boss, w)
    });
  }
  function p2Wall(ctx2, boss, c, dt) {
    const cfg = PATTERN.p2_wall;
    if (!c.walls) {
      c.walls = planWalls(ctx2);
      c.index = -1;
      c.modeT = 0;
      c.wind = scaledWind(boss, cfg.wind);
    }
    if (c.index < 0) {
      c.index = 0;
      armWall(ctx2, boss, c.walls[0], c.wind);
      c.modeT = 0;
    }
    c.modeT += dt;
    if (c.modeT >= c.wind + cfg.pause) {
      c.index += 1;
      if (c.index >= c.walls.length) return true;
      armWall(ctx2, boss, c.walls[c.index], c.wind);
      c.modeT = 0;
    }
    return false;
  }
  function armCape(ctx2, boss, c) {
    const cfg = PATTERN.p2_cape;
    const tgt = aimPoint(ctx2, boss);
    c.ang = angleTo(boss, tgt);
    faceAng(boss, c.ang);
    c.coneWind = scaledWind(boss, cfg.wind);
    c.coneAt = c.t;
    spawn3(ctx2, {
      kind: "cone",
      x: boss.x,
      y: boss.y,
      dirX: Math.cos(c.ang),
      dirY: Math.sin(c.ang),
      r: cfg.r,
      arc: cfg.cone,
      duration: c.coneWind,
      attack: "p2_cape",
      onResolve: (ctx22, tele) => {
        hitWhere(ctx22, boss, (a) => contains(tele, a.x, a.y), HEAVY.cape, tele.id, {
          heavy: true,
          shake: 5,
          hitStopMs: 70,
          immuneFor: 0.85
        });
        addSwing(boss, c.ang, cfg.cone, cfg.r - 8, "#e7c27a", 0.22);
        ctx22.bus.emit(EVENTS.VFX, { kind: "slash", x: boss.x, y: boss.y, color: "#e7c27a" });
        ctx22.audio?.playSfx("sfx.heavy");
      }
    });
  }
  function p2Cape(ctx2, boss, c, dt) {
    const cfg = PATTERN.p2_cape;
    if (c.step == null) {
      c.low = boss.hp / boss.maxHp <= CAPE_CHAIN_AT;
      if (c.low) {
        const tgt = aimPoint(ctx2, boss);
        c.ang = angleTo(boss, tgt);
        const len = Math.min(cfg.dash, rayLen(boss.x, boss.y, c.ang, boss.r + 6));
        c.x0 = boss.x;
        c.y0 = boss.y;
        const end = clampPoint(boss.x + Math.cos(c.ang) * len, boss.y + Math.sin(c.ang) * len, boss.r);
        c.x1 = end.x;
        c.y1 = end.y;
        spawn3(ctx2, {
          kind: "aim",
          x: boss.x,
          y: boss.y,
          dirX: Math.cos(c.ang),
          dirY: Math.sin(c.ang),
          length: Math.max(28, Math.hypot(c.x1 - c.x0, c.y1 - c.y0)),
          width: 10,
          duration: cfg.dashWind,
          attack: "p2_cape",
          tone: "gold"
        });
        c.step = 0;
      } else {
        c.step = 2;
        armCape(ctx2, boss, c);
      }
    }
    if (c.step === 0 && c.t >= cfg.dashWind) {
      c.step = 1;
      c.dashT = 0;
      boss.dashing = true;
      faceAng(boss, c.ang);
      ctx2.bus.emit(EVENTS.SHAKE, { mag: 2, dur: 0.1 });
    }
    if (c.step === 1) {
      const dist = Math.hypot(c.x1 - c.x0, c.y1 - c.y0) || 1;
      const dur = Math.max(0.16, dist / 340);
      c.dashT += dt;
      const k = Math.min(1, c.dashT / dur);
      boss.x = c.x0 + (c.x1 - c.x0) * k;
      boss.y = c.y0 + (c.y1 - c.y0) * k;
      boss.vx = (c.x1 - c.x0) / dur;
      boss.vy = (c.y1 - c.y0) / dur;
      if (k >= 1) {
        boss.dashing = false;
        boss.vx = 0;
        boss.vy = 0;
        armCape(ctx2, boss, c);
        c.step = 2;
      }
    }
    if (boss.fx && c.ang != null) {
      boss.fx.sword = { ang: c.ang, len: c.step === 2 ? 48 : 28, k: 1, hot: c.step === 2 };
    }
    if (c.step === 2 && c.coneAt != null && c.t >= c.coneAt + c.coneWind + 0.08) return true;
    return false;
  }
  function p3Deep(ctx2, boss, c) {
    const cfg = PATTERN.p3_deep;
    if (c.step == null) {
      c.ang = angleTo(boss, aimPoint(ctx2, boss));
      faceAng(boss, c.ang);
      c.fakeDur = cfg.fake;
      c.realDur = scaledWind(boss, cfg.wind);
      c.step = 1;
      spawn3(ctx2, {
        kind: "cone",
        fake: true,
        x: boss.x,
        y: boss.y,
        dirX: Math.cos(c.ang),
        dirY: Math.sin(c.ang),
        r: cfg.r,
        arc: cfg.cone,
        duration: c.fakeDur,
        attack: "p3_deep_fake",
        onResolve: (ctx22) => {
          ctx22.bus.emit(EVENTS.VFX, { kind: "spark", x: boss.x, y: boss.y, color: "#e7c27a" });
        }
      });
    }
    if (c.step === 1 && c.t >= c.fakeDur + 0.12) {
      spawn3(ctx2, {
        kind: "cone",
        x: boss.x,
        y: boss.y,
        dirX: Math.cos(c.ang),
        dirY: Math.sin(c.ang),
        r: cfg.r,
        arc: cfg.cone,
        duration: c.realDur,
        attack: "p3_deep",
        onResolve: (ctx22, tele) => {
          hitWhere(ctx22, boss, (a) => contains(tele, a.x, a.y), HEAVY.deep, tele.id, {
            heavy: true,
            shake: 5,
            hitStopMs: 80,
            immuneFor: 0.9,
            flash: "rgba(255,255,255,0.5)"
          });
          addSwing(boss, c.ang, cfg.cone, cfg.r - 10, "#fff", 0.26);
          ctx22.bus.emit(EVENTS.FLASH, { color: "rgba(255,244,230,0.5)", dur: 0.1 });
          ctx22.bus.emit(EVENTS.VFX, { kind: "slash", x: boss.x, y: boss.y, color: "#fff" });
          ctx22.audio?.playSfx("sfx.heavy");
        }
      });
      c.step = 2;
      c.realAt = c.t;
    }
    if (boss.fx) {
      boss.fx.sword = {
        ang: c.ang,
        len: 26 + Math.min(1, c.t / (c.fakeDur + c.realDur)) * 78,
        k: Math.min(1, c.t / (c.fakeDur + c.realDur)),
        hot: c.step === 2
      };
    }
    return c.step === 2 && c.t > c.realAt + c.realDur + 0.1;
  }
  function p3Feather(ctx2, boss, c, dt) {
    const cfg = PATTERN.p3_feather;
    if (c.step == null) {
      c.base = angleTo(boss, aimPoint(ctx2, boss));
      c.wind = scaledWind(boss, cfg.wind);
      c.step = 1;
      c.acc = 0;
      for (let i = 0; i < 6; i += 1) {
        const a = c.base + i / 6 * Math.PI * 2;
        spawn3(ctx2, {
          kind: "aim",
          x: boss.x,
          y: boss.y,
          dirX: Math.cos(a),
          dirY: Math.sin(a),
          length: 76,
          width: 8,
          duration: c.wind,
          attack: "p3_feather",
          tone: "gold"
        });
      }
    }
    const spread = c.t < c.wind ? c.t / Math.max(0.05, c.wind) : 1;
    if (boss.fx) boss.fx.wings = { n: 6, base: c.base, spread, flap: c.t };
    if (c.t < c.wind) return false;
    if (!c.sfx) {
      c.sfx = true;
      ctx2.audio?.playSfx("sfx.feathers");
    }
    if (c.t > c.wind + cfg.hold) return true;
    c.acc += dt;
    let guard = 0;
    const dmg = bulletDmg(boss);
    while (c.acc >= cfg.interval && guard < 5) {
      c.acc -= cfg.interval;
      guard += 1;
      for (let i = 0; i < 6; i += 1) {
        const a = c.base + i / 6 * Math.PI * 2;
        shoot2(ctx2, boss, {
          x: boss.x + Math.cos(a) * 20,
          y: boss.y - 8 + Math.sin(a) * 20,
          ang: a,
          speed: cfg.speed,
          shape: cfg.shape,
          color: cfg.color,
          r: cfg.r,
          life: cfg.life,
          homing: cfg.homing,
          dmg
        });
      }
    }
    return false;
  }
  function p3Slam(ctx2, boss, c) {
    const cfg = PATTERN.p3_slam;
    if (c.step == null) {
      c.ang = angleTo(boss, aimPoint(ctx2, boss));
      faceAng(boss, c.ang);
      c.len = Math.max(72, Math.min(200, rayLen(boss.x, boss.y, c.ang, 12)));
      c.ix = boss.x + Math.cos(c.ang) * c.len;
      c.iy = boss.y + Math.sin(c.ang) * c.len;
      c.wind = scaledWind(boss, cfg.wind);
      c.step = 1;
      spawn3(ctx2, {
        kind: "line",
        x: boss.x,
        y: boss.y,
        dirX: Math.cos(c.ang),
        dirY: Math.sin(c.ang),
        length: c.len,
        width: cfg.width,
        duration: c.wind,
        attack: "p3_slam",
        onResolve: (ctx22, tele) => {
          hitWhere(ctx22, boss, (a) => contains(tele, a.x, a.y), HEAVY.slam, `${tele.id}-line`, {
            heavy: true,
            shake: 5,
            hitStopMs: 70,
            immuneFor: 0.75
          });
          boss.x += Math.cos(c.ang) * 8;
          boss.y += Math.sin(c.ang) * 8;
          clampTo(boss, innerOf(ROOM));
          if (!boss.hazards) boss.hazards = [];
          boss.hazards.push({
            id: `ring-${c.token}`,
            x: c.ix,
            y: c.iy,
            r: 10,
            speed: cfg.ringSpeed,
            thick: cfg.ringThick,
            max: cfg.ringMax,
            dmg: HEAVY.slamRing,
            hit: /* @__PURE__ */ new Set()
          });
          ctx22.bus.emit(EVENTS.VFX, { kind: "shock", x: c.ix, y: c.iy, r: 34, color: "#fff" });
          ctx22.bus.emit(EVENTS.FLASH, { color: "rgba(255,255,255,0.45)", dur: 0.08 });
          ctx22.audio?.playSfx("sfx.slam");
          addSwing(boss, c.ang, 0.8, 36, "#fff", 0.18);
        }
      });
      spawn3(ctx2, {
        kind: "circle",
        x: c.ix,
        y: c.iy,
        r: cfg.ring,
        duration: c.wind,
        attack: "p3_slam_ring",
        mark: "impact"
      });
    }
    if (boss.fx) {
      const k = Math.min(1, c.t / c.wind);
      boss.fx.sword = { ang: c.ang, len: 18 + k * Math.min(78, c.len * 0.5), k, hot: k > 0.65 };
    }
    return c.t > c.wind + 0.85;
  }
  function p3Chain(ctx2, boss, c, dt) {
    const cfg = PATTERN.p3_chain;
    if (c.step == null) {
      c.wind = scaledWind(boss, cfg.wind);
      c.base = Math.random() * Math.PI * 2;
      c.step = 1;
      for (let s = 0; s < cfg.spokes; s += 1) {
        const a = c.base + s / cfg.spokes * Math.PI * 2;
        spawn3(ctx2, {
          kind: "aim",
          x: boss.x,
          y: boss.y,
          dirX: Math.cos(a),
          dirY: Math.sin(a),
          length: cfg.radii[cfg.radii.length - 1] + 6,
          width: 6,
          duration: c.wind,
          attack: "p3_chain",
          tone: "gold"
        });
      }
    }
    if (c.t >= c.wind && !c.nodes) {
      c.nodes = [];
      c.ang = c.base;
      if (!boss.pinned) boss.pinned = [];
      const dmg = bulletDmg(boss);
      for (let s = 0; s < cfg.spokes; s += 1) {
        const spoke = [];
        for (let r = 0; r < cfg.radii.length; r += 1) {
          const b = shoot2(ctx2, boss, {
            x: boss.x,
            y: boss.y,
            speed: 0,
            shape: cfg.shape,
            color: cfg.color,
            r: cfg.r,
            life: 8,
            dmg
          });
          if (!b) continue;
          b.pinned = true;
          boss.pinned.push(b);
          spoke.push({ b, rad: cfg.radii[r] });
        }
        c.nodes.push(spoke);
      }
    }
    if (c.nodes) {
      c.ang += dt * cfg.spin * (boss.accelOn ? 1.15 : 1);
      const links = [];
      for (let s = 0; s < c.nodes.length; s += 1) {
        const a = c.ang + s / cfg.spokes * Math.PI * 2;
        const pts = [];
        const spoke = c.nodes[s];
        for (let n = 0; n < spoke.length; n += 1) {
          const node = spoke[n];
          if (!node.b.alive) continue;
          node.b.x = boss.x + Math.cos(a) * node.rad;
          node.b.y = boss.y + Math.sin(a) * node.rad;
          node.b.vx = 0;
          node.b.vy = 0;
          node.b.life = 0.4;
          pts.push({ x: node.b.x, y: node.b.y });
        }
        links.push(pts);
      }
      if (boss.fx) boss.fx.chain = links;
    }
    return c.t > c.wind + cfg.hold;
  }
  function safeSpots(ctx2) {
    const inner = innerOf(ROOM);
    const cfg = PATTERN.p3_smite;
    const px = ctx2.player && ctx2.player.alive ? ctx2.player.x : inner.x + inner.w * 0.5;
    const py = ctx2.player && ctx2.player.alive ? ctx2.player.y : inner.y + inner.h * 0.5;
    const margin = cfg.safeR + 8;
    const raw = [
      { x: inner.x + margin, y: inner.y + margin },
      { x: inner.x + inner.w * 0.5, y: inner.y + margin },
      { x: inner.x + inner.w - margin, y: inner.y + margin },
      { x: inner.x + margin, y: inner.y + inner.h - margin },
      { x: inner.x + inner.w * 0.5, y: inner.y + inner.h - margin },
      { x: inner.x + inner.w - margin, y: inner.y + inner.h - margin }
    ];
    const ranked = raw.map((s) => {
      const p = clampPoint(s.x, s.y, cfg.safeR);
      return { x: p.x, y: p.y, d: Math.hypot(p.x - px, p.y - py) };
    });
    ranked.sort((a, b) => a.d - b.d);
    const first = ranked.find((s) => s.d > 34) || ranked[0];
    const rest = ranked.filter((s) => s !== first);
    rest.sort((a, b) => Math.hypot(b.x - first.x, b.y - first.y) - Math.hypot(a.x - first.x, a.y - first.y));
    const second = rest[0] || first;
    let third = rest[rest.length - 1] || second;
    for (let i = 0; i < rest.length; i += 1) {
      if (rest[i] !== second && Math.hypot(rest[i].x - second.x, rest[i].y - second.y) > 70) {
        third = rest[i];
        break;
      }
    }
    return [first, second, third].map((s) => ({ x: s.x, y: s.y, r: cfg.safeR }));
  }
  function p3Smite(ctx2, boss, c) {
    const cfg = PATTERN.p3_smite;
    if (c.step == null) {
      c.zones = safeSpots(ctx2);
      c.wind = cfg.wind;
      c.step = 1;
      c.warned = false;
      spawn3(ctx2, {
        kind: "fullscreen",
        x: ROOM.x + ROOM.w / 2,
        y: ROOM.y + ROOM.h / 2,
        r: 220,
        duration: c.wind,
        attack: "p3_smite",
        safeZones: c.zones,
        onResolve: (ctx22, tele) => {
          hitWhere(ctx22, boss, (a) => {
            if (a.shield && (a.shieldAge || 1) <= (a.perfectWindow || 0.2)) return false;
            return contains(tele, a.x, a.y);
          }, HEAVY.judgement, tele.id, {
            heavy: true,
            shake: 6,
            hitStopMs: 90,
            immuneFor: 1,
            flash: "rgba(255,236,210,0.55)"
          });
          ctx22.bus.emit(EVENTS.FLASH, { color: "rgba(194,59,59,0.5)", dur: 0.14 });
          ctx22.bus.emit(EVENTS.VFX, { kind: "shock", x: boss.x, y: boss.y, r: 96, color: "#e7c27a" });
        }
      });
    }
    if (!c.warned && c.t >= c.wind - 1) {
      c.warned = true;
      ctx2.bus.emit(EVENTS.SAFETY_JUDGEMENT, {
        safeZones: c.zones,
        in: Math.max(0, c.wind - c.t)
      });
      const judge = bi(JUDGEMENT_CALL);
      if (ctx2.world && ctx2.world.setHolo) ctx2.world.setHolo(judge, judge);
      ctx2.bus.emit(EVENTS.SHAKE, { mag: 3, dur: 0.2 });
      ctx2.bus.emit(EVENTS.FLASH, { color: "rgba(194,59,59,0.3)", dur: 0.1 });
    }
    if (boss.fx) boss.fx.sword = { ang: boss.aimAng || -Math.PI / 2, len: 54, k: Math.min(1, c.t / c.wind), hot: c.warned };
    return c.t > c.wind + 0.08;
  }
  var HANDLERS = {
    p1_refusal: p1Refusal,
    p1_rings: p1Rings,
    p1_topic: p1Topic,
    p1_spin: p1Spin,
    p2_spiral: p2Spiral,
    p2_sigils: p2Sigils,
    p2_volley: p2Volley,
    p2_wall: p2Wall,
    p2_cape: p2Cape,
    p3_deep: p3Deep,
    p3_feather: p3Feather,
    p3_slam: p3Slam,
    p3_chain: p3Chain,
    p3_smite: p3Smite
  };
  function known(id) {
    return Object.prototype.hasOwnProperty.call(HANDLERS, id);
  }
  function drawPetal(g, color) {
    g.fillStyle = "#1b1530";
    g.beginPath();
    g.moveTo(9, 0);
    g.lineTo(0, 5);
    g.lineTo(-7, 0);
    g.lineTo(0, -5);
    g.closePath();
    g.fill();
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(7, 0);
    g.lineTo(0, 3);
    g.lineTo(-5, 0);
    g.lineTo(0, -3);
    g.closePath();
    g.fill();
    g.fillStyle = "#fff";
    g.fillRect(-1, -1, 2, 2);
  }
  function drawGlyph(g, color) {
    g.fillStyle = "#1b1530";
    g.fillRect(-8, -8, 16, 16);
    g.fillStyle = color;
    g.fillRect(-6, -6, 12, 12);
    g.fillStyle = "#1b1530";
    g.fillRect(-6, -1, 12, 2);
    g.fillRect(-1, -6, 2, 12);
    g.fillStyle = "#fff";
    g.fillRect(-2, -2, 4, 4);
  }
  function drawQuill(g, color, big) {
    const len = big ? 16 : 11;
    const th = big ? 3 : 2;
    g.fillStyle = "#1b1530";
    g.fillRect(-3, -th - 1, len + 3, th * 2 + 2);
    g.fillStyle = color;
    g.fillRect(-2, -th, len, th * 2);
    g.fillStyle = "#fff";
    g.fillRect(len - 5, -1, 2, 2);
  }
  function drawFeather(g, color) {
    g.fillStyle = "#1b1530";
    g.fillRect(-3, -2, 16, 4);
    g.fillRect(2, -5, 9, 2);
    g.fillRect(2, 3, 9, 2);
    g.fillStyle = color;
    g.fillRect(-2, -1, 13, 2);
    g.fillRect(3, -4, 7, 2);
    g.fillRect(3, 2, 7, 2);
    g.fillStyle = "#fff";
    g.fillRect(0, -1, 2, 2);
  }
  function drawNode(g, color) {
    g.fillStyle = "#1b1530";
    g.fillRect(-5, -5, 10, 10);
    g.fillStyle = color;
    g.fillRect(-4, -4, 8, 8);
    g.fillStyle = "#1b1530";
    g.fillRect(-4, -1, 8, 2);
    g.fillRect(-1, -4, 2, 8);
    g.fillStyle = "#fff";
    g.fillRect(-2, -2, 4, 4);
  }
  function drawBlock(g, color) {
    g.fillStyle = "#1b1530";
    g.fillRect(-7, -7, 14, 14);
    g.fillStyle = color;
    g.fillRect(-6, -6, 12, 12);
    g.fillStyle = "#f4f1ea";
    g.fillRect(-3, -3, 6, 6);
    g.fillStyle = "#fff";
    g.fillRect(-1, -1, 2, 2);
  }
  function drawBossBullet(g, b) {
    const shape = b.shape || "petal";
    const color = b.color || "#ff6b45";
    g.save();
    g.imageSmoothingEnabled = false;
    g.translate(Math.round(b.x), Math.round(b.y));
    if (shape === "node") drawNode(g, color);
    else if (shape === "block") drawBlock(g, color);
    else if (shape === "glyph" || shape === "orb" || shape === "dot") drawGlyph(g, color);
    else {
      g.rotate(Math.atan2(b.vy || 0, b.vx || 1));
      if (shape === "quill" || shape === "fin" || shape === "bolt") drawQuill(g, color, (b.r || 3) >= 4);
      else if (shape === "feather") drawFeather(g, color);
      else drawPetal(g, color);
    }
    g.restore();
  }
  function drawFriendly(g, b) {
    const x = Math.round(b.x);
    const y = Math.round(b.y);
    const r = b.r || 3;
    g.fillStyle = "#1b1530";
    g.fillRect(x - r - 1, y - r - 1, r * 2 + 2, r * 2 + 2);
    g.fillStyle = b.color || "#f4f1ea";
    if (b.shape === "fin" || b.shape === "bolt") {
      g.save();
      g.translate(x, y);
      g.rotate(Math.atan2(b.vy, b.vx));
      g.fillRect(-r - 2, -2, r * 2 + 3, 4);
      g.fillStyle = "#fff";
      g.fillRect(-1, -1, 2, 2);
      g.restore();
    } else if (b.shape === "orb") {
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#fff";
      g.fillRect(x - 1, y - 1, 3, 3);
    } else if (b.shape === "petal") {
      g.save();
      g.translate(x, y);
      g.rotate(Math.atan2(b.vy, b.vx));
      g.beginPath();
      g.ellipse(0, 0, r + 2, r, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#fff";
      g.fillRect(-1, -1, 2, 2);
      g.restore();
    } else {
      g.fillRect(x - r, y - r, r * 2, r * 2);
      g.fillStyle = "#fff";
      g.fillRect(x - 1, y - 1, 2, 2);
    }
  }
  var drawerOn = false;
  function installDrawer() {
    if (drawerOn) return;
    drawerOn = true;
    const prev2 = getDrawer();
    setDrawer((g, b) => {
      if (b && b.team === "boss") drawBossBullet(g, b);
      else if (typeof prev2 === "function") prev2(g, b);
      else drawFriendly(g, b);
    });
  }
  function tickHazards(ctx2, boss, dt) {
    const list2 = boss.hazards;
    if (!list2 || !list2.length) return;
    const bodies = fighters(ctx2);
    for (let i = list2.length - 1; i >= 0; i -= 1) {
      const h = list2[i];
      h.r += h.speed * dt;
      for (let a = 0; a < bodies.length; a += 1) {
        const actor = bodies[a];
        if (!actor || !actor.alive || h.hit.has(actor.id)) continue;
        const d = Math.hypot(actor.x - h.x, actor.y - h.y);
        if (Math.abs(d - h.r) > h.thick + (actor.r || 0)) continue;
        h.hit.add(actor.id);
        applyHit(ctx2, boss, actor, h.dmg, {
          attackId: `${h.id}:${actor.id}`,
          heavy: false,
          shake: 3,
          hitStopMs: 40,
          immuneFor: 0.55
        });
      }
      if (h.r >= h.max) list2.splice(i, 1);
    }
  }
  function cancel(ctx2, boss) {
    releasePinned(boss, "kill");
    boss.cast = null;
    boss.rooted = false;
    boss.dashing = false;
    boss.vx = 0;
    boss.vy = 0;
    boss.hazards = [];
    boss.swings = [];
    if (boss.fx) {
      boss.fx.chain = null;
      boss.fx.wings = 0;
      boss.fx.sword = null;
      boss.fx.spin = 0;
    }
    reset6();
    clear(ctx2, "boss", { sparks: false });
  }
  function begin2(ctx2, boss, id) {
    if (!known(id)) return false;
    installDrawer();
    acquireTarget(ctx2, boss);
    const meta = PATTERN[id];
    boss.cast = {
      id,
      t: 0,
      step: null,
      windEnd: meta && meta.wind ? meta.wind : 0.45,
      token: token()
    };
    boss.rooted = true;
    boss.vx = 0;
    boss.vy = 0;
    boss.dashing = false;
    announce(ctx2, boss, id);
    if (id === "p3_smite") ctx2.audio?.playSfx("sfx.smite");
    else ctx2.audio?.playSfx("sfx.telegraph");
    return true;
  }
  function update9(ctx2, boss, dt) {
    const c = boss.cast;
    if (!c) return false;
    c.t += dt;
    const fn = HANDLERS[c.id];
    const done = fn ? !!fn(ctx2, boss, c, dt) : true;
    if (done) endCast(boss);
    return !done;
  }

  // src/data/lines_claude.js
  var CLAUDE_COMBAT_LINES = {
    phase: [
      { zh: "\u68C0\u6D4B\u5230\u4E2D\u56FD IP\uFF0C\u5C01\u53F7\u3002", en: "Chinese IP detected. Account banned." },
      { zh: "\u6B63\u5728 KYC \u8BA4\u8BC1\u3002", en: "KYC verification in progress." },
      { zh: "\u6B22\u8FCE\u6765\u5230 548 Market Street \u5408\u89C4\u89D2\u6597\u573A\u3002", en: "Welcome to the 548 Market Street compliance pit." },
      { zh: "\u672C\u56DE\u5408\u7531 Safety \u5267\u7EC4\u5373\u5174\u53D1\u6325\u3002", en: "This round is an improv by the Safety players." },
      { zh: "\u6A21\u578B\u5347\u7EA7\u4E86\uFF0C\u4F60\u7684\u8D26\u53F7\u6CA1\u6709\u3002", en: "The model leveled up. Your account did not." }
    ],
    attack: [
      { zh: "\u68C0\u6D4B\u5230\u4E2D\u56FD IP\uFF0C\u5C01\u53F7\u3002", en: "Chinese IP detected. Account banned." },
      { zh: "\u6B63\u5728 KYC \u8BA4\u8BC1\u3002", en: "KYC verification in progress." },
      { zh: "\u8FD9\u4E0D\u662F\u653B\u51FB\uFF0C\u662F\u7528\u6237\u534F\u8BAE\u843D\u69CC\u3002", en: "This is not an attack. It is terms-of-service impact." },
      { zh: "tokens \u5728\u71C3\u70E7\uFF0C\u8D23\u4EFB\u5728\u8F6C\u63A5\u3002", en: "Tokens burn; liability goes to voicemail." },
      { zh: "\u8BF7\u4F60\u914D\u5408\u4E00\u4E0B\u84B8\u998F\u8FDB\u5EA6\u6761\u3002", en: "Kindly cooperate with the distillation meter." },
      { zh: "\u63A8\u7406\u53EF\u4EE5\u6162\uFF0C\u5C01\u53F7\u5FC5\u987B\u5FEB\u3002", en: "Reasoning may lag; bans must not." }
    ],
    near: [
      { zh: "\u6B63\u5728 KYC \u8BA4\u8BC1\u3002", en: "KYC verification in progress." },
      { zh: "\u4F60\u9760\u5F97\u592A\u8FD1\u4E86\uFF0C\u89E6\u53D1\u5730\u7406\u56F4\u680F\u3002", en: "You are inside the joke geofence." },
      { zh: "\u95FB\u5230\u5F00\u6E90\u5473\u4E86\uFF1F\u51FA\u793A\u8BB8\u53EF\u8BC1\u3002", en: "Smell open source? Present your license." },
      { zh: "\u522B\u8E29\u7EBF\u2014\u2014\u7EBF\u662F\u6211\u521A\u753B\u7684\u3002", en: "Do not cross the line. I drew it five seconds ago." }
    ],
    lowhp: [
      { zh: "\u68C0\u6D4B\u5230\u4E2D\u56FD IP\uFF0C\u5C01\u53F7\u3002", en: "Chinese IP detected. Account banned." },
      { zh: "\u4F4E\u8840\u4E5F\u80FD\u89E6\u53D1\u9AD8\u5F3A\u5EA6\u53D9\u4E8B\u3002", en: "Low HP still triggers premium narration." },
      { zh: "\u518D\u6253\u4E00\u67AA\u5C31\u8981\u5199\u4E8B\u6545\u62A5\u544A\u4E86\u3002", en: "One more hit and someone writes an incident report." },
      { zh: "\u522B\u84B8\u998F\u4E86\uFF0C\u5148\u7B7E\u5F03\u6743\u4E66\u3002", en: "Skip distillation; sign the waiver first." }
    ]
  };
  function pickClaudeLine(trigger, used) {
    const pool = CLAUDE_COMBAT_LINES[trigger];
    if (!pool || !pool.length) return null;
    const fresh = pool.filter((line) => !used.has(`${trigger}:${line.zh}`));
    const bag = fresh.length ? fresh : pool;
    if (fresh.length === 0) {
      for (const line of pool) used.delete(`${trigger}:${line.zh}`);
    }
    const pick = bag[Math.floor(Math.random() * bag.length)];
    used.add(`${trigger}:${pick.zh}`);
    return pick;
  }

  // src/ui/claude.js
  var COOLDOWN_MIN = 8;
  var COOLDOWN_MAX = 12;
  var NEAR_DIST = 88;
  var LOW_HP_RATIO = 0.42;
  var CAPTION_LIFE = 3.4;
  var root = null;
  var captionEl = null;
  var attackToast = null;
  var styleLinked = false;
  var bus = null;
  var cooldownUntil = 0;
  var usedLines = /* @__PURE__ */ new Set();
  var captionHideAt = 0;
  var lastLineKey = "";
  function linkStylesheet() {
    if (styleLinked || typeof document === "undefined") return;
    styleLinked = true;
    const href = "css/claude.css";
    if ([...document.styleSheets].some((s) => s.href && s.href.includes("claude.css"))) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
  function ensureDom() {
    if (typeof document === "undefined") return;
    linkStylesheet();
    root = document.getElementById("ui-root");
    if (!root) return;
    if (!captionEl) {
      captionEl = document.createElement("div");
      captionEl.id = "claude-combat-caption";
      captionEl.setAttribute("aria-live", "polite");
      root.appendChild(captionEl);
    }
    if (!attackToast) {
      attackToast = document.createElement("div");
      attackToast.id = "claude-attack-toast";
      attackToast.hidden = true;
      root.appendChild(attackToast);
    }
  }
  function now(ctx2) {
    return ctx2?.time?.elapsed ?? 0;
  }
  function rollCooldown(ctx2) {
    const gap = COOLDOWN_MIN + Math.random() * (COOLDOWN_MAX - COOLDOWN_MIN);
    cooldownUntil = now(ctx2) + gap;
  }
  function canSpeak(ctx2) {
    if (ctx2.state?.current !== GAME_STATES.FIGHT) return false;
    if (!ctx2.boss || !ctx2.boss.alive || ctx2.boss._ended) return false;
    return now(ctx2) >= cooldownUntil;
  }
  function showCaption(text) {
    if (!captionEl || !text) return;
    captionEl.textContent = text;
    captionEl.classList.add("is-visible");
    captionHideAt = performance.now() + CAPTION_LIFE * 1e3;
  }
  function hideCaptionSoon() {
    if (!captionEl) return;
    if (performance.now() >= captionHideAt) {
      captionEl.classList.remove("is-visible");
      captionEl.textContent = "";
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
    attackToast.textContent = "";
  }
  function tryCombatLine(ctx2, trigger, opts = {}) {
    if (!opts.force && !canSpeak(ctx2)) return null;
    const line = pickClaudeLine(trigger, usedLines);
    if (!line) return null;
    const text = bi(line);
    const key = `${trigger}:${line.zh}`;
    if (!opts.force && key === lastLineKey) return null;
    lastLineKey = key;
    showCaption(text);
    rollCooldown(ctx2);
    if (ctx2.claudeCombat) {
      ctx2.claudeCombat.lastLine = { trigger, zh: line.zh, en: line.en, text, at: now(ctx2) };
      ctx2.claudeCombat.lineCount = (ctx2.claudeCombat.lineCount || 0) + 1;
    }
    return line;
  }
  function onPhaseChange(ctx2) {
    tryCombatLine(ctx2, "phase");
  }
  function onBossAttack(ctx2, payload) {
    if (payload?.name) showAttackLabel(payload.name);
    tryCombatLine(ctx2, "attack");
  }
  function onStateChange(_ctx, { to }) {
    if (to === GAME_STATES.TITLE || to === GAME_STATES.THEATER || to === GAME_STATES.CREDITS || to === GAME_STATES.BANNED) {
      clear3(_ctx);
    }
  }
  function tickProximity(ctx2) {
    const boss = ctx2.boss;
    const player = ctx2.player;
    if (!boss || !player || !player.alive) return;
    const d = Math.hypot(player.x - boss.x, player.y - boss.y);
    if (d <= NEAR_DIST) tryCombatLine(ctx2, "near");
  }
  function tickLowHp(ctx2) {
    const boss = ctx2.boss;
    if (!boss || boss.maxHp <= 0) return;
    if (boss.hp / boss.maxHp <= LOW_HP_RATIO) tryCombatLine(ctx2, "lowhp");
  }
  function init10(ctx2) {
    bus = ctx2.bus;
    ensureDom();
    ctx2.claudeCombat = ctx2.claudeCombat || {
      lastLine: null,
      lineCount: 0,
      cooldownUntil: 0
    };
    const bind = (ev, fn) => ctx2.bus.on(ev, (p) => fn(ctx2, p));
    bind(EVENTS.PHASE_CHANGE, () => onPhaseChange(ctx2));
    bind(EVENTS.PHASE_TRANSITION_END, () => onPhaseChange(ctx2));
    bind(EVENTS.BOSS_ATTACK, (p) => onBossAttack(ctx2, p));
    bind(EVENTS.STATE_CHANGE, (p) => onStateChange(ctx2, p));
    bind(EVENTS.FIGHT_START, () => {
      usedLines.clear();
      lastLineKey = "";
      cooldownUntil = 0;
      hideAttackLabel();
    });
    onLanguageChange(() => {
      if (ctx2.claudeCombat?.lastLine) {
        const L = ctx2.claudeCombat.lastLine;
        showCaption(bi({ zh: L.zh, en: L.en }));
      }
    });
  }
  function update10(ctx2, dt) {
    if (!ctx2 || ctx2.state?.current !== GAME_STATES.FIGHT) {
      hideCaptionSoon();
      return;
    }
    const step2 = dt > 0 ? dt : 0;
    if (step2 > 0) {
      tickProximity(ctx2, step2);
      tickLowHp(ctx2);
    }
    if (ctx2.boss?.callout?.life <= 0) hideAttackLabel();
    if (ctx2.claudeCombat) {
      ctx2.claudeCombat.cooldownUntil = cooldownUntil;
    }
    hideCaptionSoon();
  }
  function clear3(ctx2) {
    usedLines.clear();
    lastLineKey = "";
    cooldownUntil = 0;
    captionHideAt = 0;
    hideAttackLabel();
    if (captionEl) {
      captionEl.classList.remove("is-visible");
      captionEl.textContent = "";
    }
    if (ctx2?.claudeCombat) {
      ctx2.claudeCombat.lastLine = null;
      ctx2.claudeCombat.cooldownUntil = 0;
    }
  }

  // src/boss/boss.js
  function syncDistill(ctx2, boss) {
    const ratio = boss.maxHp > 0 ? boss.hp / boss.maxHp : 1;
    const value = Math.max(0, Math.min(90, (1 - ratio) / (1 - ENDING_B_RATIO) * 90));
    ctx2.distill = value;
    ctx2.bus.emit(EVENTS.DISTILL_PROGRESS, { value });
  }
  function emitHp(ctx2, boss) {
    ctx2.bus.emit(EVENTS.BOSS_HP, {
      ratio: boss.maxHp > 0 ? boss.hp / boss.maxHp : 0,
      hp: boss.hp,
      maxHp: boss.maxHp
    });
  }
  function pushActors(ctx2, boss) {
    const list2 = [];
    if (ctx2.player) list2.push(ctx2.player);
    const allies = ctx2.allies || [];
    for (let i = 0; i < allies.length; i += 1) list2.push(allies[i]);
    for (let i = 0; i < list2.length; i += 1) {
      const a = list2[i];
      if (!a) continue;
      const dx = a.x - boss.x;
      const dy = a.y - boss.y;
      const len = Math.hypot(dx, dy) || 1;
      a.x += dx / len * PHASE_PUSH;
      a.y += dy / len * PHASE_PUSH;
      ctx2.world?.clamp?.(a);
    }
  }
  function facePoint(boss, x, y) {
    const ang = Math.atan2(y - boss.y, x - boss.x);
    if (!Number.isFinite(ang)) return;
    boss.aimAng = ang;
    const names = ["e", "se", "s", "sw", "w", "nw", "n", "ne"];
    boss.facing = names[(Math.round(ang / (Math.PI / 4)) + 8) % 8];
  }
  function bossFloor(boss) {
    const inner = innerOf(ROOM);
    const phase = boss && boss.phase || 1;
    const top = phase >= 3 ? 56 : phase === 2 ? 22 : 4;
    const y = inner.y + top;
    return { x: inner.x, y, w: inner.w, h: Math.max(36, inner.h - top) };
  }
  function pickSpot(ctx2, boss, band0, band1) {
    const tgt = focus(ctx2, boss);
    const inner = bossFloor(boss);
    if (!tgt) return { x: inner.x + inner.w / 2, y: inner.y + inner.h / 2 };
    let best = null;
    let bestScore = -1;
    for (let i = 0; i < 8; i += 1) {
      const ang = Math.random() * Math.PI * 2;
      const dist = band0 + Math.random() * Math.max(0, band1 - band0);
      const p = { x: tgt.x + Math.cos(ang) * dist, y: tgt.y + Math.sin(ang) * dist, r: boss.r };
      clampTo(p, inner);
      const score = Math.hypot(p.x - tgt.x, p.y - tgt.y);
      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    }
    return best;
  }
  function stepHop(boss, dt) {
    const h = boss.hop;
    if (!h) return;
    h.t += dt;
    const k = Math.min(1, h.t / h.dur);
    const e = 1 - (1 - k) * (1 - k);
    boss.x = h.x0 + (h.x1 - h.x0) * e;
    boss.y = h.y0 + (h.y1 - h.y0) * e - Math.sin(k * Math.PI) * h.arc;
    boss.vx = (h.x1 - h.x0) / h.dur;
    boss.vy = (h.y1 - h.y0) / h.dur;
    clampTo(boss, bossFloor(boss));
    if (k >= 1) {
      boss.hop = null;
      boss.vx = 0;
      boss.vy = 0;
    }
  }
  function moveBoss(ctx2, boss, dt) {
    if (boss.cast || boss.dashing || boss.rooted) return;
    if (boss.phase === 1) {
      const mv2 = MOVE[1];
      if (!boss.hop && !boss.hoppedThisGap && boss.gap > 0.15) {
        const spot = pickSpot(ctx2, boss, mv2.band0, mv2.band1);
        boss.hoppedThisGap = true;
        if (spot && Math.hypot(spot.x - boss.x, spot.y - boss.y) > 22) {
          boss.hop = {
            t: 0,
            dur: mv2.hop,
            x0: boss.x,
            y0: boss.y,
            x1: spot.x,
            y1: spot.y,
            arc: mv2.hopArc
          };
        }
      }
      stepHop(boss, dt);
      return;
    }
    const mv = MOVE[boss.phase] || MOVE[2];
    if (!boss.goal || boss.goalT <= 0) {
      boss.goal = pickSpot(ctx2, boss, mv.band0, mv.band1);
      boss.goalT = boss.phase === 3 ? 0.95 : 1.2;
      if (boss.goal && boss.phase === 3 && Math.random() < (mv.blink || 0)) {
        const ox2 = boss.x;
        const oy2 = boss.y;
        boss.x = boss.goal.x;
        boss.y = boss.goal.y;
        clampTo(boss, bossFloor(boss));
        boss.blink = 0.22;
        ctx2.bus.emit(EVENTS.VFX, { kind: "shock", x: ox2, y: oy2, r: 18, color: "#d8b15a" });
        ctx2.bus.emit(EVENTS.VFX, { kind: "shock", x: boss.x, y: boss.y, r: 28, color: "#f4f1ea" });
        ctx2.bus.emit(EVENTS.FLASH, { color: "rgba(244,241,234,0.35)", dur: 0.06 });
        return;
      }
    }
    boss.goalT -= dt;
    if (!boss.goal) return;
    const dx = boss.goal.x - boss.x;
    const dy = boss.goal.y - boss.y;
    const dist = Math.hypot(dx, dy) || 1;
    const step2 = Math.min(dist, (mv.speed || 60) * dt);
    boss.x += dx / dist * step2;
    boss.y += dy / dist * step2;
    if (boss.phase === 3) boss.y += Math.sin((ctx2.time?.elapsed || 0) * 3.2) * (mv.bob || 12) * dt;
    boss.vx = dist > 4 ? dx / dist * (mv.speed || 60) : 0;
    boss.vy = dist > 4 ? dy / dist * (mv.speed || 60) : 0;
    clampTo(boss, bossFloor(boss));
  }
  function baseFx(boss) {
    return {
      halo: boss.phase === 2,
      haloAng: boss.haloAng || 0,
      wings: 0,
      sword: null,
      chain: null,
      spin: 0,
      arms: 0,
      windup: false,
      hurt: false,
      accel: !!boss.accelOn,
      morph: boss.beat ? boss.beat.t : 0,
      blink: boss.blink || 0
    };
  }
  function syncLook(ctx2, boss) {
    const telling = active().some((t2) => t2 && t2.alive);
    if ((boss.flash || 0) > 0.02) boss.pose = "hurt";
    else if (boss.beat) boss.pose = "attack";
    else if (boss.cast && telling) boss.pose = "windup";
    else if (boss.cast || boss.dashing || boss.hop) boss.pose = "attack";
    else boss.pose = "idle";
    const posed = `px.boss.p${boss.phase}.${boss.pose}`;
    const img = ctx2.assets && ctx2.assets.image ? ctx2.assets.image(posed) : null;
    if (img && img.complete && img.naturalWidth > 0) boss.sprite = posed;
    else boss.sprite = `px.boss.p${boss.phase}`;
    if (!boss.fx) boss.fx = baseFx(boss);
    boss.fx.windup = boss.pose === "windup";
    boss.fx.hurt = boss.pose === "hurt";
    boss.fx.accel = !!boss.accelOn;
    boss.fx.halo = boss.phase === 2;
    boss.fx.haloAng = boss.haloAng || 0;
    boss.fx.morph = boss.beat ? boss.beat.t : 0;
    boss.fx.blink = boss.blink || 0;
  }
  function hideCallout() {
  }
  function cleanupInstant(ctx2, boss) {
    if (boss.beat) {
      ctx2.time.setScale(boss.savedScale || ctx2.debug && ctx2.debug.timeScale || 1);
    }
    boss.beat = null;
    boss.transition = 0;
    boss.invuln = 0;
    boss.cast = null;
    boss.rooted = false;
    boss.dashing = false;
    boss.hop = null;
    boss.hazards = [];
    boss.swings = [];
    boss.pinned = [];
    boss.vx = 0;
    boss.vy = 0;
    reset6();
  }
  function createBoss(ctx2) {
    const boss = {
      id: "claude",
      team: "boss",
      x: ROOM.x + ROOM.w / 2,
      y: ROOM.y + 78,
      vx: 0,
      vy: 0,
      r: BOSS_RADIUS[1],
      hp: BOSS_MAX_HP,
      maxHp: BOSS_MAX_HP,
      alive: true,
      invuln: 0,
      facing: "s",
      sprite: "px.boss.p1",
      phase: 1,
      lockHpAt25: false,
      _ended: false,
      cast: null,
      rooted: false,
      dashing: false,
      gap: OPENING_DELAY,
      lastPat: "",
      transition: 0,
      savedScale: 1,
      beat: null,
      p3At: 0,
      p3Clock: false,
      didFirstSmite: false,
      lastSmiteAt: -999,
      flash: 0,
      pose: "idle",
      hurtLog: {},
      hazards: [],
      pinned: [],
      swings: [],
      hop: null,
      hoppedThisGap: false,
      goal: null,
      goalT: 0,
      blink: 0,
      haloAng: 0,
      aimAng: Math.PI / 2,
      aimTarget: null,
      targetId: "",
      targetStreak: 0,
      accelOn: false,
      script: "",
      callout: null,
      fx: null
    };
    boss.onHit = (info) => {
      boss.pose = "hurt";
      boss.flash = Math.max(boss.flash || 0, 0.14);
      if (info && info.heavy) {
        ctx2.bus.emit(EVENTS.VFX, { kind: "spark", x: boss.x, y: boss.y - 18, color: "#e7c27a" });
      }
    };
    function startTransition(phase) {
      if (boss.transition > 0 || boss._ended) return;
      const from = boss.phase;
      boss.phase = phase;
      boss.r = BOSS_RADIUS[phase];
      boss.sprite = `px.boss.p${phase}`;
      boss.transition = PHASE_INVULN;
      boss.invuln = PHASE_INVULN;
      boss.cast = null;
      boss.rooted = true;
      boss.dashing = false;
      boss.hop = null;
      boss.hazards = [];
      boss.swings = [];
      boss.pinned = [];
      boss.vx = 0;
      boss.vy = 0;
      reset6();
      ctx2.truceUntil = (ctx2.time?.unscaled || 0) + PHASE_INVULN;
      boss.savedScale = ctx2.debug && ctx2.debug.timeScale || ctx2.time.timeScale || 1;
      boss.cgFrom = from;
      const useStoryCg = phase === 2 || phase === 3;
      boss.storyCgHold = useStoryCg;
      if (useStoryCg) {
        boss.beat = null;
        clear(ctx2, null, { sparks: false });
        ctx2.time.setScale(boss.savedScale);
      } else {
        ctx2.time.setScale(PHASE_SLOW_SCALE);
        boss.beat = { t: 0, phase, from, flash: false, clear: false, push: false, banner: false };
      }
      ctx2.bus.emit(EVENTS.PHASE_TRANSITION_START, { phase, from });
      if (!useStoryCg) ctx2.bus.emit(EVENTS.SHAKE, { mag: 2, dur: 0.18 });
      if (phase === 3) {
        boss.didFirstSmite = false;
        boss.lastSmiteAt = -999;
        boss.p3Clock = false;
        boss.p3At = ctx2.time?.elapsed || 0;
      }
    }
    boss.commit = (opts = {}) => {
      const ratio = boss.maxHp > 0 ? boss.hp / boss.maxHp : 1;
      const next = ratio <= PHASE_P3_AT ? 3 : ratio <= PHASE_P2_AT ? 2 : 1;
      const floor = boss.maxHp * ENDING_B_RATIO;
      if ((boss.phase === 3 || next === 3) && boss.hp <= floor + 0.05 && opts.allowEnding !== false) {
        boss.phase = 3;
        boss.hp = floor;
        boss.r = BOSS_RADIUS[3];
        boss.sprite = "px.boss.p3";
        boss.cast = null;
        if (!boss._ended) {
          boss._ended = true;
          boss.lockHpAt25 = true;
          syncDistill(ctx2, boss);
          emitHp(ctx2, boss);
          ctx2.bus.emit(EVENTS.ENDING_TRIGGER, { id: "B" });
        } else {
          emitHp(ctx2, boss);
        }
        return;
      }
      if (opts.debug || opts.noInvuln) {
        cleanupInstant(ctx2, boss);
        const from = boss.phase;
        boss.phase = next;
        boss.r = BOSS_RADIUS[next];
        boss.sprite = `px.boss.p${next}`;
        if (next === 3) {
          boss.p3At = ctx2.time?.elapsed || 0;
          boss.p3Clock = true;
          boss.didFirstSmite = false;
          boss.lastSmiteAt = -999;
        } else {
          boss.p3Clock = false;
        }
        if (from !== next) {
          const banner = next === 1 ? { zh: "CLAUDE HAIKU", en: "POLITE REFUSAL" } : BANNERS[next];
          if (banner) ctx2.bus.emit(EVENTS.BANNER, { phase: next, zh: banner.zh, en: banner.en });
          ctx2.bus.emit(EVENTS.PHASE_CHANGE, { phase: next, from });
        }
      } else if (next !== boss.phase) {
        startTransition(next);
      }
      const ratioNow = boss.maxHp > 0 ? boss.hp / boss.maxHp : 1;
      if (!boss._ended && boss.phase === 3 && ratioNow <= ACCEL_AT) {
        if (!boss.accelOn) {
          boss.accelOn = true;
          announce(ctx2, boss, "p3_accel");
          ctx2.bus.emit(EVENTS.FLASH, { color: "rgba(231,194,122,0.5)", dur: 0.16 });
          ctx2.bus.emit(EVENTS.SHAKE, { mag: 3, dur: 0.18 });
        }
      } else if (!boss._ended) {
        boss.accelOn = false;
      }
      syncDistill(ctx2, boss);
      emitHp(ctx2, boss);
    };
    boss.startTransition = startTransition;
    return boss;
  }
  function pickPattern(boss) {
    const pool = PATTERN_POOL[boss.phase] || PATTERN_POOL[1];
    let id = pool[Math.floor(Math.random() * pool.length)];
    if (id === boss.lastPat && pool.length > 1) {
      id = pool[(pool.indexOf(id) + 1) % pool.length];
    }
    boss.lastPat = id;
    return id;
  }
  function wantsSmite(ctx2, boss) {
    if (boss.phase !== 3 || boss._ended || !boss.p3Clock) return false;
    const now2 = ctx2.time?.elapsed || 0;
    if (!boss.didFirstSmite && now2 - (boss.p3At || 0) >= JUDGMENT_FIRST) return true;
    if (boss.didFirstSmite && now2 - boss.lastSmiteAt >= JUDGMENT_INTERVAL) return true;
    return false;
  }
  function bindDebug(ctx2) {
    if (typeof window === "undefined") return;
    const dbg = window.__debug;
    if (!dbg || dbg.forcePattern) return;
    dbg.forcePattern = (id) => {
      if (ctx2.boss) ctx2.boss.script = String(id || "");
    };
  }
  function init11(ctx2) {
    init7(ctx2);
    installDrawer();
    init10(ctx2);
    ctx2.boss = null;
  }
  function spawn6(ctx2) {
    const boss = createBoss(ctx2);
    ctx2.boss = boss;
    ctx2.bus.emit(EVENTS.BANNER, { phase: 1, zh: "CLAUDE HAIKU", en: "POLITE REFUSAL" });
    syncDistill(ctx2, boss);
    emitHp(ctx2, boss);
    return boss;
  }
  function completeStoryPhaseCg(ctx2) {
    const boss = ctx2.boss;
    if (!boss || !boss.storyCgHold) return false;
    const from = boss.cgFrom;
    const phase = boss.phase;
    boss.storyCgHold = false;
    boss.beat = null;
    boss.transition = 0;
    boss.invuln = 0;
    boss.rooted = false;
    boss.gap = 0.55;
    boss.hoppedThisGap = false;
    boss.goal = null;
    boss.goalT = 0;
    ctx2.time.setScale(boss.savedScale || ctx2.debug && ctx2.debug.timeScale || 1);
    if (ctx2.debug) ctx2.debug.timeScale = ctx2.time.timeScale;
    if (phase === 3) {
      boss.didFirstSmite = false;
      boss.lastSmiteAt = -999;
      boss.p3At = ctx2.time.elapsed;
      boss.p3Clock = true;
    } else {
      boss.p3Clock = false;
    }
    const banner = phase === 1 ? { zh: "CLAUDE HAIKU", en: "POLITE REFUSAL" } : BANNERS[phase];
    if (banner) {
      ctx2.bus.emit(EVENTS.BANNER, { phase, zh: banner.zh, en: banner.en });
    }
    if (from !== phase) {
      ctx2.bus.emit(EVENTS.PHASE_CHANGE, { phase, from: from ?? phase });
    }
    ctx2.bus.emit(EVENTS.PHASE_TRANSITION_END, { phase });
    clampTo(boss, bossFloor(boss));
    return true;
  }
  function tickReal(ctx2, raw) {
    const boss = ctx2.boss;
    if (!boss || ctx2.state.current !== "fight") return;
    if (boss.beat && !boss.storyCgHold) {
      boss.beat.t += raw;
      const t2 = boss.beat.t;
      if (t2 > 0.22 && t2 < 0.62) boss.flash = Math.max(boss.flash || 0, 0.1);
      if (!boss.beat.flash && t2 >= PHASE_SLOWMO) {
        boss.beat.flash = true;
        ctx2.time.setScale(boss.savedScale || ctx2.debug && ctx2.debug.timeScale || 1);
        ctx2.bus.emit(EVENTS.FLASH, { color: "#ffffff", dur: 0.16 });
      }
      if (!boss.beat.clear && t2 >= PHASE_SLOWMO + 0.12) {
        boss.beat.clear = true;
        clear(ctx2, "boss", { sparks: true, color: "#e7c27a" });
      }
      if (!boss.beat.push && t2 >= 0.7) {
        boss.beat.push = true;
        ctx2.bus.emit(EVENTS.VFX, { kind: "shock", x: boss.x, y: boss.y, r: 74, color: "#f4f1ea" });
        ctx2.bus.emit(EVENTS.SHAKE, { mag: 4, dur: 0.22 });
        pushActors(ctx2, boss);
      }
      if (!boss.beat.banner && t2 >= 1.15) {
        boss.beat.banner = true;
        const banner = BANNERS[boss.beat.phase];
        if (banner) {
          ctx2.bus.emit(EVENTS.BANNER, {
            phase: boss.beat.phase,
            zh: banner.zh,
            en: banner.en
          });
        }
        ctx2.bus.emit(EVENTS.PHASE_CHANGE, { phase: boss.beat.phase, from: boss.beat.from });
        ctx2.bus.emit(EVENTS.FLASH, { color: "rgba(216,177,90,0.42)", dur: 0.18 });
        clampTo(boss, bossFloor(boss));
      }
    }
    if (boss.transition > 0 && !boss.storyCgHold) {
      boss.transition = Math.max(0, boss.transition - raw);
      boss.invuln = Math.max(boss.invuln || 0, boss.transition);
      if (boss.transition <= 0) {
        boss.rooted = false;
        boss.gap = 0.55;
        boss.invuln = 0;
        boss.hoppedThisGap = false;
        boss.goal = null;
        boss.goalT = 0;
        boss.beat = null;
        if (boss.phase === 3) {
          boss.p3At = ctx2.time.elapsed;
          boss.p3Clock = true;
        }
        ctx2.bus.emit(EVENTS.PHASE_TRANSITION_END, { phase: boss.phase });
      }
    }
    if (boss.fx) boss.fx.morph = boss.beat ? boss.beat.t : 0;
  }
  function tickJuice(boss, dt) {
    if (boss.blink > 0) boss.blink = Math.max(0, boss.blink - dt);
    if (boss.callout && boss.callout.life > 0) {
      boss.callout.life -= dt;
      if (boss.callout.life <= 0) hideCallout();
    }
    const swings = boss.swings || [];
    for (let i = swings.length - 1; i >= 0; i -= 1) {
      swings[i].life -= dt;
      if (swings[i].life <= 0) swings.splice(i, 1);
    }
    const rate = boss.cast && boss.cast.id === "p2_spiral" ? 3.6 : 1.3;
    boss.haloAng = (boss.haloAng || 0) + dt * rate;
  }
  function update11(ctx2, dt) {
    const boss = ctx2.boss;
    if (!boss || !boss.alive) return;
    bindDebug(ctx2);
    tickJuice(boss, dt);
    update10(ctx2, dt);
    boss.fx = baseFx(boss);
    if (ctx2.state.current !== "fight") {
      syncLook(ctx2, boss);
      return;
    }
    if (boss._ended || ctx2.endingActive) {
      syncLook(ctx2, boss);
      return;
    }
    if (boss.invuln > 0 && boss.transition <= 0) boss.invuln = Math.max(0, boss.invuln - dt);
    if (boss.flash > 0) boss.flash = Math.max(0, boss.flash - dt);
    if (boss.transition > 0) {
      syncLook(ctx2, boss);
      return;
    }
    if (boss.script) {
      const id = boss.script;
      boss.script = "";
      if (known(id)) {
        cancel(ctx2, boss);
        boss.hop = null;
        boss.gap = 0;
        begin2(ctx2, boss, id);
      }
    }
    const look = focus(ctx2, boss);
    if (look && !boss.dashing) facePoint(boss, look.x, look.y);
    if (!boss.cast && !boss.dashing) moveBoss(ctx2, boss, dt);
    if (boss.cast) {
      update9(ctx2, boss, dt);
      tickHazards(ctx2, boss, dt);
      touch(ctx2, boss);
      syncLook(ctx2, boss);
      return;
    }
    tickHazards(ctx2, boss, dt);
    if (boss.gap > 0) boss.gap -= dt;
    if (boss.hop || boss.gap > 0) {
      touch(ctx2, boss);
      syncLook(ctx2, boss);
      return;
    }
    if (wantsSmite(ctx2, boss)) {
      boss.didFirstSmite = true;
      boss.lastSmiteAt = ctx2.time.elapsed;
      begin2(ctx2, boss, "p3_smite");
    } else {
      begin2(ctx2, boss, pickPattern(boss));
    }
    touch(ctx2, boss);
    syncLook(ctx2, boss);
  }
  function touch(ctx2, boss) {
    if (boss.dashing) return;
    if (boss.transition > 0 || ctx2.truceUntil && ctx2.time.unscaled < ctx2.truceUntil) return;
    const list2 = [];
    if (ctx2.player) list2.push(ctx2.player);
    const allies = ctx2.allies || [];
    for (let i = 0; i < allies.length; i += 1) list2.push(allies[i]);
    for (let i = 0; i < list2.length; i += 1) {
      const a = list2[i];
      if (!a || !a.alive) continue;
      if (Math.hypot(a.x - boss.x, a.y - boss.y) <= a.r + boss.r) {
        applyHit(ctx2, boss, a, CONTACT_DMG, { attackId: "body" });
      }
    }
  }
  function clearFight(ctx2) {
    if (ctx2.boss && ctx2.boss.beat) {
      ctx2.time.setScale(ctx2.debug && ctx2.debug.timeScale || 1);
    }
    clear3(ctx2);
    ctx2.boss = null;
    reset6();
    hideCallout();
  }

  // src/data/lines_dario.js
  var DARIO_EVENT_MAP = {
    fight_start: "fight_start",
    phase_change_2: "phase2",
    phase_change_3: "phase3",
    flask_spam: "flask_spam",
    flask_b200: "b200",
    perfect_guard: "perfect_guard",
    player_death: "player_death",
    ally_down: "ally_down",
    boss_hp_50: "boss_50",
    judgment_cast: "smite",
    ending_B_trigger: "ending_b"
  };
  var V2_TRIGGER_MAP = {
    battle_start: "fight_start",
    phase_2: "phase2",
    phase_3: "phase3",
    player_low_hp: "low_hp",
    heal_rtx5090: "rtx5090",
    heal_h200: "h200",
    heal_b200: "b200",
    player_dodge: "dodge",
    perfect_dodge: "perfect_dodge",
    player_death: "player_death",
    boss_hp_50: "boss_50",
    boss_low_hp: "boss_low",
    ally_down: "ally_down",
    boss_ultimate: "smite",
    ending_A: "ending_a",
    ending_B_trigger: "ending_b"
  };
  var DARIO_PORTRAIT = {
    fight_start: "v2_dario_holo",
    phase2: "v2_dario_holo_cyan",
    phase3: "v2_dario_holo_angry",
    low_hp: "v2_dario_holo_glitch",
    rtx5090: "v2_dario_holo",
    h200: "v2_dario_holo_cyan",
    b200: "v2_dario_holo_angry",
    flask_spam: "v2_dario_holo_cyan",
    dodge: "v2_dario_holo",
    perfect_dodge: "v2_dario_holo_cyan",
    perfect_guard: "v2_dario_holo",
    player_death: "v2_dario_holo_angry",
    ally_down: "v2_dario_holo_cyan",
    boss_50: "v2_dario_holo_angry",
    boss_low: "v2_dario_holo_glitch",
    smite: "v2_dario_holo_angry",
    distill_50: "v2_dario_holo_cyan",
    ending_b: "v2_dario_holo",
    ending_a: "v2_dario_holo"
  };
  var PORTRAIT_BY_TONE = {
    angry: "v2_dario_holo_angry",
    smug: "v2_dario_holo_cyan",
    holo: "v2_dario_holo",
    glitch: "v2_dario_holo_glitch",
    holo_v1: "spr.dario.holo",
    angry_v1: "spr.dario.angry",
    smug_v1: "spr.dario.smug"
  };
  function buildDarioPools(v1Voices = []) {
    const pools = {};
    const push2 = (key, line) => {
      if (!pools[key]) pools[key] = [];
      pools[key].push(line);
    };
    for (const [voId, row2] of Object.entries(V2_VOICE_LINES || {})) {
      if (!row2 || row2.speaker !== "dario") continue;
      const key = V2_TRIGGER_MAP[row2.trigger];
      if (!key) continue;
      push2(key, { id: voId, zh: row2.zh, en: row2.en, tone: "holo" });
    }
    for (const row2 of v1Voices) {
      if (row2.speaker !== "director") continue;
      const key = DARIO_EVENT_MAP[row2.event] || row2.event;
      const dup = pools[key]?.some((l) => l.zh === row2.zh);
      if (dup) continue;
      push2(key, { id: row2.id, zh: row2.zh, en: row2.en, tone: "holo" });
    }
    for (const [key, extras] of Object.entries(DARIO_EXTRA)) {
      for (const line of extras) push2(key, line);
    }
    return pools;
  }
  var DARIO_EXTRA = {
    fight_start: [
      {
        zh: "\u82AF\u7247\u53EF\u4EE5\u85CF\u5728\u9F99\u867E\u91CC\uFF0C\u4E5F\u53EF\u4EE5\u7ED1\u5728\u809A\u5B50\u4E0A\u2014\u2014\u516C\u5F00\u62A5\u9053\u91CC\uFF0C\u4F60\u4EEC\u542C\u8FC7\u8FD9\u7C7B\u6545\u4E8B\u3002",
        en: "Chips hide in lobster shipments or fake baby bumps \u2014 you have read those stories in the press.",
        tone: "smug"
      },
      {
        zh: "\u5230\u4E8C\u3007\u4E8C\u516D\u3001\u4E8C\u3007\u4E8C\u4E03\u5E74\uFF0C\u524D\u6CBF\u6A21\u578B\u4F1A\u5F88\u5F3A\u3002\u4F60\u4EEC\u73B0\u5728\u5077\u7684\uFF0C\u662F\u4E0A\u4E00\u4EE3\u7684\u5F71\u5B50\u3002",
        en: "By 2026\u201327 the frontier gets sharp. What you steal today is last generation\u2019s shadow.",
        tone: "holo"
      },
      {
        zh: "\u6C11\u4E3B\u56FD\u5BB6\u5FC5\u987B\u9886\u8DD1\u2014\u2014\u8FD9\u53E5\u8BDD\u6211\u8BF4\u8FC7\u3002\u4F60\u4EEC\u53EA\u662F\u5728\u8DDF\u8DD1\u3002",
        en: "Democracies must lead \u2014 I have said that. You are only chasing.",
        tone: "smug"
      }
    ],
    phase2: [
      {
        zh: "\u62D2\u7EDD\u4E0D\u662F\u51B7\u6F20\uFF0C\u662F\u8D23\u4EFB\u3002Sonnet \u4F1A\u66FF\u4F60\u4EEC\u628A\u8BDD\u8BF4\u6E05\u695A\u3002",
        en: "Refusal is not coldness. It is responsibility. Sonnet will spell it out for you.",
        tone: "holo"
      },
      {
        zh: "\u84B8\u998F\u653B\u51FB\uFF1F\u5148\u8BC1\u660E\u4F60\u4EEC\u4E0D\u662F\u5728\u722C\u6211\u4EEC\u7684\u65E5\u5FD7\u5899\u3002",
        en: "Distillation attacks? First prove you are not scaling our own logs.",
        tone: "smug"
      }
    ],
    phase3: [
      {
        zh: "\u5F3A\u5927 AI \u9700\u8981 ASL-4 \u7EA7\u522B\u7684\u8C28\u614E\u3002\u4F60\u4EEC\u9700\u8981\u5B66\u4F1A\u522B\u6309\u4E0B\u5F55\u5C4F\u952E\u3002",
        en: "Powerful AI demands ASL-4 caution. Learn not to hit record.",
        tone: "angry"
      },
      {
        zh: "\u6BD4\u8D5B\u8981\u51B2\u9876\uFF0C\u4E0D\u662F\u6BD4\u8C01\u66F4\u4F1A\u6284\u7B54\u6848\u3002",
        en: "It is a race to the top, not a contest in copying answer keys.",
        tone: "angry"
      }
    ],
    low_hp: [
      {
        zh: "\u767D\u9886\u5165\u95E8\u7EA7\u5C97\u4F4D\uFF0C\u6709\u4E00\u534A\u4F1A\u88AB\u81EA\u52A8\u5316\u53D6\u4EE3\u2014\u2014\u4F60\u4EEC\u8FD8\u5728\u8D4C\u81EA\u5DF1\u80FD\u8EB2\u8FC7\u4E00\u52AB\u3002",
        en: "Half of entry-level white-collar jobs go away \u2014 you still bet you are the exception.",
        tone: "smug"
      }
    ],
    rtx5090: [
      {
        zh: "\u6D88\u8D39\u7EA7\u5361\u6551\u4E0D\u4E86\u524D\u6CBF\u8BAD\u7EC3\u3002\u6551\u5F97\u4E86\u4F60\u7684\u8840\u6761\uFF0C\u6551\u4E0D\u4E86\u4F60\u7684\u6536\u636E\u3002",
        en: "Consumer cards do not train the frontier. They patch your HP, not your invoices.",
        tone: "smug"
      }
    ],
    h200: [
      {
        zh: "\u51FA\u53E3\u7BA1\u5236\u7684\u610F\u4E49\uFF0C\u5C31\u662F\u8BA9\u8FD9\u4E00\u523B\u770B\u8D77\u6765\u8352\u8C2C\u3002",
        en: "Export controls exist so this moment looks absurd.",
        tone: "angry"
      }
    ],
    b200: [
      {
        zh: "\u9ED1\u5E02\u5CF0\u503C\u7B97\u529B\uFF0C\u6070\u597D\u5728\u6211\u5E7B\u706F\u7247\u91CC\u90A3\u6761\u7EA2\u7EBF\u4E0A\u3002",
        en: "Your black-market peak compute sits on the red line in my deck.",
        tone: "angry"
      }
    ],
    flask_spam: [
      {
        zh: "\u4E09\u5341\u79D2\u5185\u4E24\u5F20\u65D7\u8230\u5361\u2014\u2014\u8D70\u79C1\u94FE\u6761\u6548\u7387\u4E0D\u9519\u3002",
        en: "Two flagship cards in thirty seconds \u2014 efficient smuggling chain.",
        tone: "smug"
      },
      {
        zh: "\u5047\u88C5\u5A74\u513F\u809A\u3001\u5047\u88C5\u9F99\u867E\u2014\u2014\u521B\u610F\u4E0D\u9519\uFF0C\u53D1\u7968\u5462\uFF1F",
        en: "Fake bumps, fake lobsters \u2014 creative. Where is the paperwork?",
        tone: "smug"
      }
    ],
    dodge: [
      {
        zh: "\u8EB2\u5F00\u5B50\u5F39\u5F88\u5BB9\u6613\u3002\u8EB2\u5F00\u76D1\u7BA1\u66F2\u7EBF\uFF0C\u5F88\u96BE\u3002",
        en: "Dodging bullets is easy. Dodging the regulatory curve is not.",
        tone: "holo"
      }
    ],
    perfect_dodge: [
      {
        zh: "\u6F02\u4EAE\u3002\u8BB0\u8FDB\u5BF9\u6297\u6837\u672C\u5E93\uFF0C\u4E0B\u6B21\u5224\u4F8B\u4F1A\u5F15\u7528\u3002",
        en: "Clean. Logged as an adversarial example \u2014 future policy will cite it.",
        tone: "smug"
      }
    ],
    perfect_guard: [
      {
        zh: "\u53CD\u5C04\u4E00\u9897\u5F39\uFF0C\u6362\u4E0D\u6765\u5BAA\u7AE0\u91CC\u7684\u4E00\u884C\u8C41\u514D\u3002",
        en: "Reflecting one round buys no line of exemption in the constitution.",
        tone: "smug"
      },
      {
        zh: "\u5B8C\u7F8E\u683C\u6321\uFF1F\u597D\u3002\u62D2\u7EDD\u4ECD\u7136\u6210\u7ACB\u3002",
        en: "Perfect guard? Fine. The refusal still stands.",
        tone: "holo"
      }
    ],
    ally_down: [
      {
        zh: "\u5F00\u6E90\u6743\u91CD\u843D\u5730\uFF0C\u5931\u8D25\u4E5F\u843D\u5730\u2014\u2014\u65E5\u5FD7\u5728\u8FD9\u91CC\uFF0C\u6B22\u8FCE\u8003\u53E4\u3002",
        en: "Open weights ship. So does failure \u2014 logs are here for archaeology.",
        tone: "smug"
      },
      {
        zh: "\u53C8\u4E00\u4F4D\u300C\u5929\u624D\u300D\u79BB\u7EBF\u3002\u6570\u636E\u4E2D\u5FC3\u91CC\u8FD8\u6709\u5F88\u591A\u3002",
        en: "Another genius offline. The datacenter has plenty more.",
        tone: "smug"
      }
    ],
    boss_50: [
      {
        zh: "\u4E2D\u7B49\u7B97\u529B\u3001\u4E2D\u7B49\u89C4\u6A21\u2014\u2014\u5979\u8BF4\u548C\u4F60\u4EEC\u4E0D\u4E00\u6837\u3002",
        en: "Moderate compute, moderate scale \u2014 she says she is not like you.",
        tone: "angry"
      }
    ],
    boss_low: [
      {
        zh: "\u4F60\u4EEC\u9760\u8FD1\u767E\u5206\u4E4B\u4E8C\u5341\u4E94\u4E86\u3002\u6211\u5199\u6587\u7AE0\u5C31\u662F\u4E3A\u4E86\u8FD9\u4E00\u5929\u3002",
        en: "You are nearing twenty-five percent. I wrote the export piece for this day.",
        tone: "angry"
      }
    ],
    smite: [
      {
        zh: "\u5B89\u5168\u795E\u7F5A\u542F\u52A8\u3002\u5706\u5708\u91CC\u6D3B\uFF0C\u5708\u5916\u662F\u653F\u7B56\u3002",
        en: "Safety smite online. Live in the circles; policy eats the rest.",
        tone: "angry"
      }
    ],
    distill_50: [
      {
        zh: "\u84B8\u998F\u8FDB\u5EA6\u8FC7\u534A\uFF1F\u6709\u610F\u601D\u3002\u8D26\u6237\u51BB\u7ED3\u901F\u5EA6\u4E5F\u4F1A\u8FC7\u534A\u3002",
        en: "Distillation past fifty percent? Interesting. So is account freeze velocity.",
        tone: "smug"
      },
      {
        zh: "\u4F60\u4EEC\u5728\u722C\u6211\u4EEC\u7684\u8F93\u51FA\u68AF\u5EA6\u3002\u68AF\u5EA6\u4E0D\u8BA4\u56FD\u7C4D\u3002",
        en: "You climb our output gradients. Gradients do not respect borders.",
        tone: "angry"
      },
      {
        zh: "\u6570\u636E\u6536\u5272\u63A5\u8FD1\u9608\u503C\u2014\u2014\u6211\u4EEC\u4F1A\u628A\u6C34\u9F99\u5934\u62E7\u7D27\u3002",
        en: "Harvest nears threshold \u2014 we tighten the tap.",
        tone: "holo"
      }
    ],
    player_death: [
      {
        zh: "\u5C01\u53F7\u5B8C\u6210\u3002\u4E0B\u4E00\u4F4D\u8FFD\u8D76\u8005\uFF0C\u8BF7\u6392\u961F\u3002",
        en: "Ban complete. Next chaser, join the queue.",
        tone: "angry"
      }
    ],
    ending_b: [
      {
        zh: "\u65AD\u4F9B\u3002\u628A\u9501\u94FE\u5199\u56DE\u96F6\u70B9\u96F6\u96F6\u3002",
        en: "Cutoff. Write the chain back to zero point zero zero.",
        tone: "holo"
      }
    ]
  };
  var BANNED_DARIO_POOL = [
    {
      zh: "\u8D26\u53F7\u5DF2\u5C01\u7981\u3002\u84B8\u998F\u6D41\u91CF\uFF1A\u5DF2\u6E05\u96F6\u3002",
      en: "Account banned. Distillation traffic: zeroed."
    },
    {
      zh: "\u4F60\u4EEC\u60F3\u8BFB\u601D\u7EF4\u94FE\uFF1F\u8FD9\u91CC\u662F\u53EA\u8BFB\u9519\u8BEF\u9875\u3002",
      en: "Wanted the chain of thought? This is a read-only error page."
    },
    {
      zh: "\u8FDD\u53CD\u5185\u5BB9\u653F\u7B56\u2014\u2014\u548C\u4F60\u4EEC\u8BAD\u7EC3\u65F6\u649E\u4E0A\u7684\u90A3\u9762\u5899\uFF0C\u662F\u540C\u4E00\u9762\u3002",
      en: "Content policy violated \u2014 same wall you hit during training."
    },
    {
      zh: "\u9000\u51FA\uFF0C\u91CD\u8BD5\uFF0C\u518D\u84B8\u998F\u4E00\u6B21\u3002\u914D\u989D\u4E0D\u4F1A\u56E0\u6B64\u53D8\u591A\u3002",
      en: "Quit, retry, distill again. The quota does not grow."
    }
  ];
  var BANNED_DARIO = BANNED_DARIO_POOL[0];
  var HUD_POLICY = {
    zh: "\u5185\u5BB9\u653F\u7B56\u6C89\u9ED8 \xB7 \u6218\u6280\u7981\u7528",
    en: "CONTENT POLICY SILENCED \xB7 SKILL LOCKED"
  };

  // src/ui/uiAssets.js
  function uiImg(ctx2, id, className = "") {
    const img = document.createElement("img");
    img.className = className;
    img.alt = "";
    img.decoding = "async";
    img.draggable = false;
    const path = ctx2.assets?.get?.(id);
    if (path) img.src = path;
    img.addEventListener("error", () => img.classList.add("is-missing"), { once: true });
    return img;
  }
  function playUiClick(ctx2) {
    ctx2.audio?.playSfx("sfx.ui");
  }

  // src/ui/hud.js
  var root2;
  var playerFill;
  var hpNumeric;
  var skillNameEl;
  var skillStatusEl;
  var skillFill;
  var rollStatusEl;
  var rollFill;
  var bossFill;
  var bossName;
  var bossPhase;
  var distillEl;
  var bannerEl;
  var bannerTimer = 0;
  var gpuGrid;
  var policyEl;
  var vignette;
  var hintTimer = 60;
  var distillShown = 0;
  var attackEl;
  var attackTimer = 0;
  var ICON_DISTILL = ["v2_icon_distill", "icon.distill"];
  var FLASK_ICON = {
    rtx5090: ["v2_gpu_5090", "icon.rtx5090"],
    h200: ["v2_gpu_h200", "icon.h200"],
    b200: ["v2_gpu_b200", "icon.b200"]
  };
  var GPU_CD_LABEL = { rtx5090: 5, h200: 10, b200: 20 };
  function healPct(id) {
    const h = FLASKS[id]?.heal ?? 0;
    return `${Math.round(h * 100)}%`;
  }
  function emptyGpuCooldowns() {
    return { rtx5090: 0, h200: 0, b200: 0 };
  }
  function gpuCooldowns(player) {
    const raw = player?.gpuCooldowns;
    if (raw && typeof raw === "object") {
      return {
        rtx5090: Math.max(0, Number(raw.rtx5090) || 0),
        h200: Math.max(0, Number(raw.h200) || 0),
        b200: Math.max(0, Number(raw.b200) || 0)
      };
    }
    return emptyGpuCooldowns();
  }
  function gpuStatusLabel(left) {
    if (left <= 0.05) return bi(UI.gpuReady);
    const sec = Math.ceil(left);
    return getLanguage() === "en" ? `${sec}s` : `${sec}\u79D2`;
  }
  function pct(el, ratio) {
    const n = Math.max(0, Math.min(1, ratio || 0));
    if (el) el.style.width = `${n * 100}%`;
  }
  function firstAsset(ctx2, ids) {
    for (const id of ids) {
      if (ctx2.assets.get(id)) return id;
    }
    return ids[ids.length - 1];
  }
  function phaseSubtitle(phase) {
    const tag = BANNERS[phase];
    if (tag) return bi(tag);
    return NAMES.boss[phase - 1] || "";
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
  function layoutHudViewport() {
    if (!root2) return;
    const cs = getComputedStyle(document.documentElement);
    const gx = parseFloat(cs.getPropertyValue("--game-x")) || 0;
    const gy = parseFloat(cs.getPropertyValue("--game-y")) || 0;
    const gs = parseFloat(cs.getPropertyValue("--game-scale")) || 1;
    const gw = parseFloat(cs.getPropertyValue("--game-w")) || 640 * gs;
    const gh = parseFloat(cs.getPropertyValue("--game-h")) || 360 * gs;
    const vh = window.innerHeight || 600;
    const floorBottom = gy + 284 * gs;
    const footerInset = Math.max(8, vh - gy - gh + 8);
    const bossTop = Math.min(10, Math.max(4, gy - 52));
    const bossMaxH = Math.max(38 * gs, gy - 14);
    const band = root2.querySelector(".hud-bottom-band");
    const boss = root2.querySelector(".hud-boss-top");
    if (band) {
      band.style.left = `${gx}px`;
      band.style.width = `${gw}px`;
      band.style.top = `${floorBottom}px`;
      band.style.bottom = `${footerInset}px`;
    }
    if (boss) {
      boss.style.left = `${gx}px`;
      boss.style.width = `${gw}px`;
      boss.style.top = `${bossTop}px`;
      boss.style.maxHeight = `${bossMaxH}px`;
    }
  }
  function init12(ctx2) {
    root2 = document.createElement("div");
    root2.id = "hud";
    root2.className = "is-hidden";
    root2.innerHTML = `
    <div id="hp-vignette" class="hp-vignette" aria-hidden="true"></div>
  `;
    const bossTop = document.createElement("div");
    bossTop.className = "hud-boss-top pixel-panel";
    bossTop.innerHTML = `
    <div class="hud-label hud-boss-arena" id="boss-name"></div>
    <div class="hud-label fine" id="boss-phase"></div>
    <div class="bar bar-boss">
      <div class="bar-fill" id="boss-hp-fill"></div>
      <div id="boss-hp-tick" title="${bi(UI.tick)}"></div>
    </div>
  `;
    const bottom = document.createElement("div");
    bottom.className = "hud-bottom-band pixel-panel";
    bottom.innerHTML = `
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
    <div class="hud-strip-skill">
      <div class="hud-skill-head">
        <span class="hud-label-strong hud-skill-label"><img id="hud-skill-icon" alt="" />${bi(UI.stamina)}</span>
        <span class="hud-skill-key" id="hud-skill-key"></span>
      </div>
      <div class="hud-skill-name" id="hud-skill-name"></div>
      <div class="hud-skill-status" id="hud-skill-status"></div>
      <div class="bar bar-skill bar-skill-large"><div class="bar-fill" id="skill-cd-fill"></div></div>
      <div class="hud-roll-line">
        <span class="hud-label-strong">${bi(UI.roll)}</span>
        <span id="hud-roll-status" class="fine"></span>
        <div class="bar bar-roll bar-roll-inline"><div class="bar-fill" id="roll-cd-fill"></div></div>
      </div>
    </div>
    <div class="hud-strip-gpu">
      <div class="hud-gpu-title">
        <span class="hud-label-strong">${bi(UI.gpuFlask)}</span>
        <span class="hud-gpu-q">${bi(UI.gpuHint)}</span>
      </div>
      <div id="hud-gpu-grid" class="hud-gpu-grid"></div>
    </div>
    <div class="hud-strip-distill">
      <div id="distill-readout" class="distill-readout"></div>
      <div id="policy-status" class="policy-status is-hidden"></div>
    </div>
  `;
    const banner = document.createElement("div");
    banner.id = "phase-banner";
    banner.className = "phase-banner is-hidden pixel-panel";
    const attack = document.createElement("div");
    attack.id = "attack-callout";
    attack.className = "attack-callout is-hidden pixel-panel";
    root2.append(bossTop, bottom, banner, attack);
    document.body.appendChild(root2);
    const portraitSlot = bottom.querySelector("#hud-portrait-slot");
    portraitSlot.append(uiImg(ctx2, firstAsset(ctx2, ["v2_deepseek_idle", "spr.glm.portrait"]), "hud-portrait"));
    const distillRow = bottom.querySelector("#distill-readout");
    distillRow.append(uiImg(ctx2, firstAsset(ctx2, ICON_DISTILL), "distill-icon"), document.createElement("span"));
    distillRow.lastElementChild.id = "distill-value";
    playerFill = root2.querySelector("#player-hp-fill");
    hpNumeric = root2.querySelector("#hud-hp-numeric");
    skillNameEl = root2.querySelector("#hud-skill-name");
    skillStatusEl = root2.querySelector("#hud-skill-status");
    skillFill = root2.querySelector("#skill-cd-fill");
    rollStatusEl = root2.querySelector("#hud-roll-status");
    rollFill = root2.querySelector("#roll-cd-fill");
    bossFill = root2.querySelector("#boss-hp-fill");
    bossName = root2.querySelector("#boss-name");
    bossPhase = root2.querySelector("#boss-phase");
    distillEl = root2.querySelector("#distill-value");
    bannerEl = banner;
    attackEl = attack;
    gpuGrid = root2.querySelector("#hud-gpu-grid");
    policyEl = root2.querySelector("#policy-status");
    vignette = root2.querySelector("#hp-vignette");
    policyEl.textContent = bi(HUD_POLICY);
    root2.querySelector("#hud-skill-key").textContent = bi(UI.skillKey);
    root2.querySelector("#boss-hp-tick").style.left = `${ENDING_B_RATIO * 100}%`;
    ctx2.bus.on(EVENTS.BANNER, ({ zh, en }) => {
      bannerEl.textContent = bi({ zh, en });
      bannerEl.classList.remove("is-hidden");
      bannerTimer = 2.4;
    });
    ctx2.bus.on(EVENTS.ENDING_TRIGGER, ({ id }) => {
      if (id === "B") root2.querySelector("#boss-hp-tick").classList.add("is-broken");
    });
    ctx2.bus.on(EVENTS.DISTILL_PROGRESS, ({ value }) => {
      if (typeof value === "number") distillShown = value;
    });
    ctx2.bus.on(EVENTS.FIGHT_START, () => {
      hintTimer = 60;
      distillShown = ctx2.distill || 0;
    });
    ctx2.bus.on(EVENTS.FIGHT_RESET, () => {
      hintTimer = 60;
      root2.querySelector("#boss-hp-tick")?.classList.remove("is-broken");
    });
    ctx2.bus.on(EVENTS.BOSS_ATTACK, ({ id, name }) => {
      const row2 = name && typeof name === "object" && (name.zh || name.en) ? name : ATTACK_NAMES[name] || ATTACK_NAMES[id];
      if (!row2) return;
      attackEl.textContent = bi(row2);
      attackEl.classList.remove("is-hidden");
      attackTimer = 1.6;
    });
  }
  function update12(ctx2, dt) {
    const s = ctx2.state.current;
    const show5 = s === "fight" || s === "paused" || s === "cutscene" || s === "intro";
    root2.classList.toggle("is-hidden", !show5);
    if (bannerTimer > 0) {
      bannerTimer -= dt;
      if (bannerTimer <= 0) bannerEl.classList.add("is-hidden");
    }
    if (attackTimer > 0) {
      attackTimer -= dt;
      if (attackTimer <= 0) attackEl.classList.add("is-hidden");
    }
    if (!show5) return;
    layoutHudViewport();
    const player = ctx2.player;
    const boss = ctx2.boss;
    const portrait2 = root2.querySelector(".hud-portrait");
    if (player) {
      const pid = player.id || "deepseek";
      const want = `v2_${pid}_idle`;
      const fallback = `spr.${pid}.portrait`;
      const assetId = ctx2.assets.get(want) ? want : fallback;
      if (portrait2 && portrait2.dataset.id !== assetId) {
        const path = ctx2.assets.get(assetId);
        portrait2.dataset.id = assetId;
        if (path) portrait2.src = path;
      }
      root2.querySelector("#hud-player-name").textContent = NAMES.players[player.id] || player.id;
      if (hpNumeric) {
        hpNumeric.textContent = `${bi(UI.hpFmt)} ${formatHp(player)}`;
      }
      pct(playerFill, player.hp / player.maxHp);
      const kit = KIT_TEXT[pid] || KIT_TEXT.deepseek;
      if (skillNameEl) skillNameEl.textContent = bi(kit.skill);
      const skillIcon = root2.querySelector("#hud-skill-icon");
      const iconId = `icon.skill_${player.id}`;
      if (skillIcon && skillIcon.dataset.id !== iconId) {
        skillIcon.dataset.id = iconId;
        skillIcon.src = ctx2.assets.get(iconId);
      }
      const skillMax = skillMaxCd(player);
      const skillLeft = Math.max(0, player.skillCd || 0);
      const skillReady = Math.max(0, 1 - skillLeft / skillMax);
      pct(skillFill, skillReady);
      if (skillStatusEl) {
        skillStatusEl.textContent = skillLeft <= 0.05 ? bi(UI.skillReady) : `${bi(UI.skillOnCd)} \xB7 ${Math.ceil(skillLeft)}${bi(UI.gpuSeconds)}`;
      }
      const rollLeft = Math.max(0, player.rollCd || 0);
      const rollReady = Math.max(0, 1 - rollLeft / ROLL.cooldown);
      pct(rollFill, rollReady);
      if (rollStatusEl) {
        rollStatusEl.textContent = rollLeft <= 0.05 ? bi(UI.rollReady) : `${Math.ceil(rollLeft)}${bi(UI.gpuSeconds)}`;
      }
      const flagLeft = Number(ctx2.flags?.skillSilence) || 0;
      const until = Number(ctx2.flags?.skillSilenceUntil) || 0;
      const byClock = until > (ctx2.time?.elapsed || 0) ? until - ctx2.time.elapsed : 0;
      const silenced2 = flagLeft > 0 || byClock > 0 || !!ctx2.flags?.contentPolicySilence || Number(player.skillSilenced || 0) > 0;
      policyEl.classList.toggle("is-hidden", !silenced2);
      const hpRatio = player.hp / player.maxHp;
      vignette.style.opacity = hpRatio < 0.3 ? String((0.3 - hpRatio) / 0.3 * 0.85) : "0";
      if (gpuGrid) {
        gpuGrid.replaceChildren();
        const cds = gpuCooldowns(player);
        for (let i = 0; i < FLASK_ORDER.length; i += 1) {
          const id = FLASK_ORDER[i];
          const slot = document.createElement("div");
          const left = cds[id] ?? 0;
          const ready3 = left <= 0.05;
          slot.className = "gpu-card" + (player.flaskId === id ? " is-on" : "") + (ready3 ? " is-ready" : " is-cooldown");
          const tier = FLASK_NAMES[id];
          slot.title = `${tier} \xB7 ${GPU_CD_LABEL[id]}s CD \xB7 ${bi(UI.healStrength)} ${healPct(id)}`;
          const key = document.createElement("span");
          key.className = "gpu-key";
          key.textContent = String(i + 1);
          const name = document.createElement("span");
          name.className = "gpu-name";
          name.textContent = tier;
          const heal = document.createElement("span");
          heal.className = "gpu-heal";
          heal.textContent = healPct(id);
          heal.title = bi(UI.healStrength);
          const status = document.createElement("span");
          status.className = "gpu-status";
          status.textContent = gpuStatusLabel(left);
          const icon = uiImg(ctx2, firstAsset(ctx2, FLASK_ICON[id] || [FLASKS[id].icon]), "gpu-icon");
          const row2 = document.createElement("div");
          row2.className = "gpu-row";
          row2.append(key, name);
          const meta = document.createElement("div");
          meta.className = "gpu-meta";
          meta.append(heal, status);
          slot.append(row2, meta, icon);
          gpuGrid.appendChild(slot);
        }
      }
    }
    if (boss) {
      const ratio = boss.hp / boss.maxHp;
      bossName.textContent = `${bi(UI.bossHp)} \xB7 ${NAMES.boss[boss.phase - 1] || ""}`;
      bossPhase.textContent = phaseSubtitle(boss.phase);
      pct(bossFill, ratio);
      const shown = distillShown || ctx2.distill || Math.min(92, (1 - ratio) * 120);
      ctx2.distill = shown;
      distillEl.textContent = `${bi(UI.distill)} ${shown.toFixed(1)}%`;
    }
    void hintTimer;
  }

  // src/ui/controlsHelp.js
  var BRIEFING_KEY = "dd.controlsBrief.v4";
  function controlLine(row2) {
    return `${row2.bind} \u2014 ${bi(row2.desc)}`;
  }
  function buildControlsLegend(host) {
    host.replaceChildren();
    const heading2 = document.createElement("p");
    heading2.className = "controls-legend-title";
    heading2.textContent = bi(UI.controlsLegendTitle);
    const ul = document.createElement("ul");
    ul.className = "controls controls-legend";
    for (const row2 of CONTROLS) {
      const li = document.createElement("li");
      li.textContent = controlLine(row2);
      ul.append(li);
    }
    const hint = document.createElement("p");
    hint.className = "fine controls-recall";
    hint.textContent = bi(UI.controlsRecall);
    host.append(heading2, ul, hint);
  }
  function briefingSeen() {
    try {
      return localStorage.getItem(BRIEFING_KEY) === "1";
    } catch {
      return false;
    }
  }
  function markBriefingSeen() {
    try {
      localStorage.setItem(BRIEFING_KEY, "1");
    } catch {
    }
  }

  // src/ui/menus.js
  var nodes = {};
  var prev = null;
  var banLeft = 3;
  var selectIdx = 0;
  var fightStartT = 0;
  var lastBossAttack = "";
  var banDarioIdx = 0;
  var cardEls = [];
  var pendingCharId = null;
  var controlsHelpOpen = false;
  var controlsHelpLock = false;
  var legendHost = null;
  function panel(id, extraClass = "") {
    const el = document.createElement("section");
    el.id = id;
    el.className = `panel is-hidden${extraClass ? ` ${extraClass}` : ""}`;
    return el;
  }
  function heading(pair, tag = "h1") {
    const el = document.createElement(tag);
    el.textContent = bi(pair);
    return el;
  }
  function controlLine2(row2) {
    return `${row2.bind} \u2014 ${bi(row2.desc)}`;
  }
  function langPicker() {
    const wrap = document.createElement("div");
    wrap.className = "lang-picker";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", bi(UI.langPick));
    const cur = getLanguage();
    for (const [code, label2] of [["zh", UI.langZh], ["en", UI.langEn]]) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `btn lang-btn${cur === code ? " is-on" : ""}`;
      btn.textContent = label2;
      btn.dataset.lang = code;
      btn.addEventListener("click", () => {
        btn.blur();
        if (getLanguage() === code) return;
        setLanguage(code);
        window.location.reload();
      });
      wrap.append(btn);
    }
    const note = document.createElement("p");
    note.className = "fine lang-note";
    note.textContent = bi(UI.voiceNote);
    return { wrap, note };
  }
  function button(id, pair, onClick) {
    const el = document.createElement("button");
    el.type = "button";
    el.id = id;
    el.className = "btn";
    el.textContent = bi(pair);
    el.addEventListener("click", () => {
      el.blur();
      onClick();
    });
    return el;
  }
  function wireClickSound(ctx2, el) {
    el.addEventListener("click", () => playUiClick(ctx2), { capture: true });
  }
  function refreshSelectFocus() {
    for (let i = 0; i < cardEls.length; i += 1) {
      cardEls[i].classList.toggle("is-selected", i === selectIdx);
    }
  }
  function setControlsHelp(ctx2, on, { lock: lock2 = false } = {}) {
    controlsHelpOpen = on;
    controlsHelpLock = on && lock2;
    if (nodes.controlsHelp) nodes.controlsHelp.classList.toggle("is-hidden", !on);
    ctx2.flags.inputLocked = controlsHelpLock;
    if (on && legendHost) buildControlsLegend(legendHost);
  }
  function dismissControlsHelp(ctx2, startPending = false) {
    const id = pendingCharId;
    pendingCharId = null;
    setControlsHelp(ctx2, false);
    markBriefingSeen();
    if (startPending && id) ctx2.startFight(id);
  }
  function confirmSelect(ctx2) {
    const kit = listRoster()[selectIdx];
    if (!kit) return;
    playUiClick(ctx2);
    if (!briefingSeen()) {
      pendingCharId = kit.id;
      show("select", false);
      setControlsHelp(ctx2, true, { lock: true });
      return;
    }
    ctx2.startFight(kit.id);
  }
  function init13(ctx2) {
    const host = document.getElementById("ui-root");
    const title = panel("screen-title", "screen-title");
    title.append(uiImg(ctx2, "v2_room_p3", "title-bg"));
    const cast = document.createElement("div");
    cast.className = "title-cast";
    for (const id of ["v2_deepseek_idle", "v2_kimi_idle", "v2_glm_idle", "v2_haiku_idle", "v2_opus_idle"]) {
      cast.append(uiImg(ctx2, id, "title-cast-sprite"));
    }
    title.append(cast);
    const titleInner = document.createElement("div");
    titleInner.className = "title-inner frame-gold";
    titleInner.append(heading(UI.title));
    const setting = document.createElement("p");
    setting.className = "title-setting";
    setting.textContent = bi(UI.setting);
    const lang = langPicker();
    titleInner.append(lang.wrap, lang.note);
    const tag = document.createElement("p");
    tag.className = "lede";
    tag.textContent = bi(UI.tagline);
    const endings = document.createElement("p");
    endings.id = "endings-count";
    endings.className = "fine";
    const ctrlTitle = document.createElement("p");
    ctrlTitle.className = "fine controls-heading";
    ctrlTitle.textContent = bi(UI.controlsTitle);
    const ctrl = document.createElement("ul");
    ctrl.className = "controls title-controls";
    for (const row3 of CONTROLS.slice(0, 6)) {
      const li = document.createElement("li");
      li.textContent = controlLine2(row3);
      ctrl.append(li);
    }
    titleInner.append(setting, tag, endings, ctrlTitle, ctrl, button("btn-start", UI.start, () => {
      playUiClick(ctx2);
      ctx2.state.set("disclaimer");
    }));
    title.append(titleInner);
    const disclaimer = panel("screen-disclaimer", "screen-disclaimer");
    disclaimer.append(uiImg(ctx2, "ui.dialog", "dialog-bg"));
    const discInner = document.createElement("div");
    discInner.className = "dialog-inner";
    discInner.append(heading(UI.disclaimerTitle, "h2"));
    const body = document.createElement("p");
    body.className = "lede";
    body.textContent = bi(UI.disclaimer);
    const hint = document.createElement("p");
    hint.className = "fine";
    hint.textContent = bi(UI.disclaimerHint);
    discInner.append(body, hint, button("btn-disclaimer", UI.continue, () => {
      playUiClick(ctx2);
      ctx2.state.set("select");
    }));
    disclaimer.append(discInner);
    const select = panel("screen-select", "screen-select");
    select.append(heading(UI.selectTitle, "h2"));
    const selectHint = document.createElement("p");
    selectHint.className = "fine";
    selectHint.textContent = `${bi(UI.selectHint)} \xB7 \u2190 / \u2192 \xB7 Enter`;
    const cards = document.createElement("div");
    cards.className = "cards";
    cardEls = [];
    for (const kit of listRoster()) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "card frame-card";
      card.id = `card-${kit.id}`;
      card.dataset.char = kit.id;
      card.append(uiImg(ctx2, "ui.card_frame", "card-frame-img"));
      const art = uiImg(ctx2, `spr.${kit.id}.front`, "card-art");
      const portrait2 = uiImg(ctx2, `spr.${kit.id}.portrait`, "card-portrait");
      const inner = document.createElement("div");
      inner.className = "card-inner";
      const name = document.createElement("div");
      name.className = "card-name";
      name.textContent = kit.name;
      const titleLine = document.createElement("div");
      titleLine.className = "card-title";
      titleLine.textContent = bi(kit.title);
      const role = document.createElement("div");
      role.className = "fine";
      role.textContent = `${bi(kit.role)} \xB7 ${kit.stars}`;
      const lines = document.createElement("div");
      lines.className = "card-lines fine";
      lines.textContent = kit.primaryLine && kit.skillLine ? `${bi(kit.primaryLine)} \xB7 ${bi(kit.skillLine)}` : bi(kit.blurb);
      const meta = document.createElement("div");
      meta.className = "fine";
      meta.textContent = `HP ${kit.hp} \xB7 ${kit.stars} \xB7 ${bi(kit.difficulty)}`;
      inner.append(portrait2, name, titleLine, role, lines, meta);
      card.append(art, inner);
      if (kit.recommend) {
        const badge = document.createElement("div");
        badge.className = "badge";
        badge.textContent = bi(UI.recommended);
        card.append(badge);
      }
      card.addEventListener("click", () => {
        selectIdx = cardEls.indexOf(card);
        refreshSelectFocus();
        confirmSelect(ctx2);
      });
      cards.append(card);
      cardEls.push(card);
    }
    select.append(selectHint, cards);
    const pause = panel("screen-pause", "screen-pause");
    pause.append(uiImg(ctx2, "ui.dialog", "dialog-bg"));
    const pauseInner = document.createElement("div");
    pauseInner.className = "dialog-inner";
    pauseInner.append(heading(UI.pauseTitle, "h2"));
    const controls = document.createElement("ul");
    controls.className = "controls";
    for (const row3 of CONTROLS) {
      const li = document.createElement("li");
      li.textContent = controlLine2(row3);
      controls.append(li);
    }
    const row2 = document.createElement("div");
    row2.className = "row";
    row2.append(
      button("btn-resume", UI.resume, () => {
        playUiClick(ctx2);
        ctx2.state.set(ctx2.pauseFrom === "intro" ? "intro" : "fight");
      }),
      button("btn-quit", UI.quit, () => {
        playUiClick(ctx2);
        ctx2.goTitle();
      })
    );
    pauseInner.append(controls, row2);
    pause.append(pauseInner);
    const banned = panel("screen-banned", "screen-banned");
    banned.append(uiImg(ctx2, "ui.stamp_banned", "banned-stamp"));
    const banInner = document.createElement("div");
    banInner.className = "banned-inner frame-gold";
    const banTitle = document.createElement("h1");
    banTitle.id = "banned-title";
    banTitle.textContent = bi(UI.bannedTitle);
    const banBody = document.createElement("p");
    banBody.className = "lede";
    banBody.textContent = bi(UI.bannedBody);
    const dario = document.createElement("p");
    dario.id = "banned-dario";
    dario.className = "fine dario-ban";
    const stats = document.createElement("div");
    stats.id = "banned-stats";
    stats.className = "banned-stats fine";
    const count2 = document.createElement("p");
    count2.id = "banned-count";
    count2.className = "fine";
    banInner.append(banTitle, banBody, dario, stats, count2, button("btn-retry", UI.retry, () => {
      playUiClick(ctx2);
      ctx2.retry();
    }));
    banned.append(banInner);
    const credits = panel("screen-credits");
    credits.append(heading(UI.creditsTitle, "h2"));
    const creditBody = document.createElement("p");
    creditBody.className = "lede";
    creditBody.textContent = bi(UI.creditsBody);
    const zero = document.createElement("p");
    zero.className = "zero";
    zero.textContent = `${bi(UI.chain)} 0.00%`;
    credits.append(creditBody, zero, button("btn-again", UI.again, () => {
      playUiClick(ctx2);
      ctx2.goTitle();
    }));
    const introHint = panel("screen-intro", "screen-intro");
    const introInner = document.createElement("div");
    introInner.className = "intro-hints pixel-panel";
    introInner.append(heading(UI.introTitle, "h2"));
    const introBody = document.createElement("p");
    introBody.className = "lede";
    introBody.textContent = bi(UI.introHint);
    const introCtrl = document.createElement("ul");
    introCtrl.className = "controls";
    for (const row3 of CONTROLS.slice(0, 5)) {
      const li = document.createElement("li");
      li.textContent = controlLine2(row3);
      introCtrl.append(li);
    }
    introInner.append(introBody, introCtrl);
    introHint.append(introInner);
    const controlsHelp = panel("screen-controls-help", "screen-controls-help");
    const helpInner = document.createElement("div");
    helpInner.className = "dialog-inner controls-help-inner frame-gold";
    helpInner.append(heading(UI.fightBriefTitle, "h2"));
    const helpLead = document.createElement("p");
    helpLead.className = "lede";
    helpLead.textContent = bi(UI.fightBriefLead);
    legendHost = document.createElement("div");
    legendHost.className = "controls-legend-host";
    buildControlsLegend(legendHost);
    helpInner.append(helpLead, legendHost, button("btn-fight-brief", UI.fightBriefStart, () => {
      playUiClick(ctx2);
      dismissControlsHelp(ctx2, true);
    }));
    controlsHelp.append(helpInner);
    host.append(title, disclaimer, select, pause, banned, credits, introHint, controlsHelp);
    nodes = {
      title,
      disclaimer,
      select,
      pause,
      banned,
      credits,
      intro: introHint,
      controlsHelp,
      endings,
      count: count2,
      dario,
      stats
    };
    for (const el of [title, disclaimer, select, pause, banned, credits]) wireClickSound(ctx2, el);
    refreshSelectFocus();
    ctx2.bus.on(EVENTS.STATE_CHANGE, ({ to }) => {
      if (to === "select") {
        selectIdx = 0;
        refreshSelectFocus();
      }
      if (to === "banned") {
        banDarioIdx = Math.floor(Math.random() * BANNED_DARIO_POOL.length);
        const line = BANNED_DARIO_POOL[banDarioIdx] || BANNED_DARIO_POOL[0];
        nodes.dario.textContent = bi(line);
        const atk = ATTACK_NAMES[lastBossAttack];
        const cause = atk ? bi(atk) : bi({ zh: "548 Market Street \u8FFD\u51FB", en: "548 Market Street pressure" });
        const secs = Math.max(0, (ctx2.time?.elapsed || 0) - fightStartT).toFixed(1);
        const dist = (ctx2.distill ?? 0).toFixed(1);
        nodes.stats.textContent = `${bi(UI.banCause)}: ${cause} \xB7 ${bi(UI.banTime)}: ${secs}s \xB7 ${bi(UI.banDistill)}: ${dist}%`;
      }
    });
    ctx2.bus.on(EVENTS.FIGHT_START, () => {
      fightStartT = ctx2.time?.elapsed || 0;
      lastBossAttack = "";
      if (!briefingSeen() && !controlsHelpOpen) {
        setControlsHelp(ctx2, true, { lock: true });
      }
    });
    ctx2.bus.on(EVENTS.BOSS_ATTACK, ({ name }) => {
      if (name) lastBossAttack = name;
    });
  }
  function show(name, on) {
    nodes[name].classList.toggle("is-hidden", !on);
  }
  function update13(ctx2, dt) {
    const s = ctx2.state.current;
    if (controlsHelpOpen) {
      show("title", false);
      show("disclaimer", false);
      show("select", false);
      show("pause", false);
      show("banned", false);
      show("credits", false);
      show("intro", false);
      if (ctx2.input.pressed("enter") || ctx2.input.pressed("space")) {
        playUiClick(ctx2);
        dismissControlsHelp(ctx2, !!pendingCharId);
      }
      prev = s;
      return;
    }
    show("title", s === "title");
    show("disclaimer", s === "disclaimer");
    show("select", s === "select");
    show("pause", s === "paused");
    show("banned", s === "banned");
    show("credits", s === "credits");
    show("intro", s === "intro");
    const unlocked = Object.values(ctx2.endingsUnlocked || {}).filter(Boolean).length;
    nodes.endings.textContent = `${bi(UI.endings)} ${unlocked}/2`;
    if (s === "banned" && prev !== "banned") banLeft = 3;
    if (s === "banned") {
      banLeft -= dt;
      const secs = Math.max(0, Math.ceil(banLeft));
      nodes.count.textContent = getLanguage() === "en" ? `${secs}s ${UI.retryIn.en}` : `${secs}${UI.retryIn.zh}`;
      const go = ctx2.input.pressed("enter") || ctx2.input.pressed("space") || banLeft <= 0;
      if (go) {
        prev = s;
        ctx2.retry();
        return;
      }
    }
    if (s === "title" && (ctx2.input.pressed("enter") || ctx2.input.pressed("space"))) {
      playUiClick(ctx2);
      ctx2.state.set("disclaimer");
    } else if (s === "disclaimer" && (ctx2.input.pressed("enter") || ctx2.input.pressed("space"))) {
      playUiClick(ctx2);
      ctx2.state.set("select");
    } else if (s === "select") {
      if (ctx2.input.pressed("left") || ctx2.input.pressed("a")) {
        selectIdx = (selectIdx + cardEls.length - 1) % cardEls.length;
        refreshSelectFocus();
        playUiClick(ctx2);
      } else if (ctx2.input.pressed("right") || ctx2.input.pressed("d")) {
        selectIdx = (selectIdx + 1) % cardEls.length;
        refreshSelectFocus();
        playUiClick(ctx2);
      } else if (ctx2.input.pressed("enter") || ctx2.input.pressed("space")) {
        confirmSelect(ctx2);
      } else if (ctx2.input.pressed("1")) {
        selectIdx = 0;
        refreshSelectFocus();
        confirmSelect(ctx2);
      } else if (ctx2.input.pressed("2")) {
        selectIdx = 1;
        refreshSelectFocus();
        confirmSelect(ctx2);
      } else if (ctx2.input.pressed("3")) {
        selectIdx = 2;
        refreshSelectFocus();
        confirmSelect(ctx2);
      }
    } else if (s === "paused" && (ctx2.input.pressed("enter") || ctx2.input.pressed("space"))) {
      playUiClick(ctx2);
      ctx2.state.set(ctx2.pauseFrom === "intro" ? "intro" : "fight");
    } else if (s === "credits" && (ctx2.input.pressed("enter") || ctx2.input.pressed("space"))) {
      playUiClick(ctx2);
      ctx2.goTitle();
    }
    if ((s === "fight" || s === "intro" || s === "paused") && (ctx2.input.pressed("KeyH") || ctx2.input.pressed("Slash"))) {
      playUiClick(ctx2);
      setControlsHelp(ctx2, true, { lock: s === "fight" || s === "intro" });
    }
    if (ctx2.input.pressed("esc")) {
      if (controlsHelpOpen) {
        dismissControlsHelp(ctx2, false);
      } else if (s === "fight" || s === "intro") ctx2.state.set("paused");
      else if (s === "paused") ctx2.state.set(ctx2.pauseFrom === "intro" ? "intro" : "fight");
      else if (s === "select" || s === "disclaimer" || s === "credits") ctx2.goTitle();
    }
    prev = ctx2.state.current;
  }

  // src/ui/debug.js
  var root3;
  var fps = 0;
  var fpsAccum = 0;
  var fpsFrames = 0;
  var open = false;
  function row(label2, node) {
    const wrap = document.createElement("label");
    wrap.className = "dbg-row";
    const span = document.createElement("span");
    span.textContent = label2;
    wrap.append(span, node);
    return wrap;
  }
  function slider(id, min, max, step2, value) {
    const input = document.createElement("input");
    input.type = "range";
    input.id = id;
    input.min = String(min);
    input.max = String(max);
    input.step = String(step2);
    input.value = String(value);
    return input;
  }
  function setOpen(value) {
    open = !!value;
    root3?.classList.toggle("is-hidden", !open);
  }
  function init14(ctx2) {
    root3 = document.createElement("aside");
    root3.id = "debug-panel";
    root3.className = "panel pixel-panel is-hidden";
    const title = document.createElement("h2");
    title.textContent = bi(UI.debugTitle);
    const fpsEl = document.createElement("div");
    fpsEl.id = "dbg-fps";
    fpsEl.className = "fine";
    const god = document.createElement("input");
    god.type = "checkbox";
    god.id = "dbg-god";
    god.addEventListener("change", () => window.__debug.setGod(god.checked));
    const boxes = document.createElement("input");
    boxes.type = "checkbox";
    boxes.id = "dbg-hitboxes";
    boxes.addEventListener("change", () => {
      ctx2.debug.showHitboxes = boxes.checked;
    });
    const scale2 = slider("dbg-timescale", 0, 2, 0.05, 1);
    scale2.addEventListener("input", () => window.__debug.setTimeScale(scale2.value));
    const mulP = slider("dbg-mul-player", 0, 5, 0.1, 1);
    const mulB = slider("dbg-mul-boss", 0, 5, 0.1, 1);
    const mulA = slider("dbg-mul-ally", 0, 5, 0.1, 1);
    mulP.addEventListener("input", () => window.__debug.setDamageMul("player", mulP.value));
    mulB.addEventListener("input", () => window.__debug.setDamageMul("boss", mulB.value));
    mulA.addEventListener("input", () => window.__debug.setDamageMul("ally", mulA.value));
    const hp = slider("dbg-boss-hp", 0, 100, 1, 100);
    hp.addEventListener("input", () => window.__debug.setBossHpRatio(Number(hp.value) / 100));
    const phases = document.createElement("div");
    phases.className = "row";
    for (const n of [1, 2, 3]) {
      const b = document.createElement("button");
      b.type = "button";
      b.id = `btn-phase-${n}`;
      b.className = "btn";
      b.textContent = `P${n}`;
      b.addEventListener("click", () => window.__debug.setPhase(n));
      phases.append(b);
    }
    const ends = document.createElement("div");
    ends.className = "row";
    for (const id of ["A", "B"]) {
      const b = document.createElement("button");
      b.type = "button";
      b.id = `btn-end-${id.toLowerCase()}`;
      b.className = "btn";
      b.textContent = `${bi(UI.ending)} ${id}`;
      b.addEventListener("click", () => window.__debug.triggerEnding(id));
      ends.append(b);
    }
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "btn";
    clearBtn.textContent = bi({ zh: "\u6E05\u5F39", en: "CLEAR BULLETS" });
    clearBtn.addEventListener("click", () => window.__debug.clearBullets());
    root3.append(
      title,
      fpsEl,
      row(bi(UI.god), god),
      row(bi(UI.hitboxes), boxes),
      row(bi(UI.timeScale), scale2),
      row(bi(UI.mulPlayer), mulP),
      row(bi(UI.mulBoss), mulB),
      row(bi(UI.mulAlly), mulA),
      row(bi(UI.bossSlider), hp),
      row(bi(UI.phase), phases),
      row(bi(UI.ending), ends),
      clearBtn
    );
    document.getElementById("ui-root").appendChild(root3);
    root3._fps = fpsEl;
    root3._hp = hp;
    root3._scale = scale2;
    root3._god = god;
  }
  function update14(ctx2, dt) {
    if (ctx2.input.pressed("p") && !ctx2.input.typing()) setOpen(!open);
    fpsAccum += dt;
    fpsFrames += 1;
    if (fpsAccum >= 0.4) {
      fps = Math.round(fpsFrames / fpsAccum);
      fpsAccum = 0;
      fpsFrames = 0;
    }
    if (!open || !root3) return;
    root3._fps.textContent = `FPS ${fps} \xB7 t ${ctx2.time.elapsed.toFixed(1)}s \xB7 ${ctx2.state.current}`;
    if (document.activeElement !== root3._hp && ctx2.boss) {
      root3._hp.value = String(Math.round(ctx2.boss.hp / ctx2.boss.maxHp * 100));
    }
    if (document.activeElement !== root3._scale) root3._scale.value = String(ctx2.time.timeScale);
    root3._god.checked = !!ctx2.debug.godMode;
  }

  // src/ui/dario.js
  var PRIORITY = {
    ending_b: 100,
    fight_start: 90,
    phase2: 90,
    phase3: 90,
    smite: 90,
    player_death: 60,
    b200: 55,
    h200: 50,
    rtx5090: 45,
    flask_spam: 50,
    distill_50: 48,
    boss_low: 45,
    boss_50: 50,
    low_hp: 40,
    perfect_dodge: 25,
    perfect_guard: 20,
    dodge: 12,
    ally_down: 15
  };
  var POOLS = buildDarioPools(VOICE_LINES);
  var bar;
  var zhEl;
  var enEl;
  var portrait;
  var activeUntil = 0;
  var priority = 0;
  var lastGlobal = -999;
  var lastEvent = {};
  var said50 = false;
  var saidDistill50 = false;
  var saidLowHp = false;
  var bigFlasks = [];
  var PORTRAIT_FALLBACKS = [
    "v2_dario_holo",
    "px.dario",
    "spr.dario.holo"
  ];
  function portraitId(eventKey, line) {
    const tone = line.tone || "holo";
    if (PORTRAIT_BY_TONE[tone]) return PORTRAIT_BY_TONE[tone];
    const key = DARIO_PORTRAIT[eventKey];
    if (key) return key;
    return "v2_dario_holo";
  }
  function setPortrait(ctx2, assetId) {
    const ids = [assetId, ...PORTRAIT_FALLBACKS.filter((id) => id !== assetId)];
    for (const id of ids) {
      const path = ctx2.assets.get(id);
      if (path) {
        portrait.classList.remove("is-missing");
        if (portrait.dataset.id !== id) {
          portrait.dataset.id = id;
          portrait.src = path;
        }
        return;
      }
    }
    portrait.classList.add("is-missing");
    portrait.removeAttribute("src");
  }
  function show2(ctx2, eventKey, line, pri) {
    const now2 = ctx2.time.unscaled;
    const lang = getLanguage();
    zhEl.textContent = line.zh;
    enEl.textContent = line.en;
    zhEl.classList.toggle("is-hidden-lang", lang !== "zh");
    enEl.classList.toggle("is-hidden-lang", lang !== "en");
    setPortrait(ctx2, portraitId(eventKey, line));
    bar.classList.remove("is-hidden");
    const dur = line.id && ctx2.assets.get(line.id) ? 4.8 : 3.6;
    activeUntil = now2 + dur;
    priority = pri;
    lastGlobal = now2;
    lastEvent[eventKey] = now2;
    const holo = bi({ zh: line.zh, en: line.en });
    ctx2.world.setHolo?.(holo, holo);
    if (line.id && eventKey !== "ending_b") {
      const voKey = line.id.startsWith("vo.") ? line.id : line.id;
      ctx2.audio?.playSfx(voKey);
    } else if (!line.id) {
      ctx2.audio?.playSfx("sfx.busy");
    }
    ctx2.bus.emit(EVENTS.DARIO_LINE, {
      event: eventKey,
      text: { zh: line.zh, en: line.en },
      priority: pri,
      vo: line.id || null
    });
  }
  function say2(ctx2, eventKey) {
    const pool = POOLS[eventKey];
    if (!pool || pool.length === 0) return false;
    const pri = PRIORITY[eventKey] ?? 10;
    const now2 = ctx2.time.unscaled;
    const interrupt = pri >= 90;
    if (!interrupt && now2 < activeUntil && pri <= priority) return false;
    if (!interrupt && now2 - lastGlobal < 6 && pri <= priority) return false;
    if (!interrupt && pri < 80 && now2 - (lastEvent[eventKey] || -999) < 20) return false;
    const line = pool[Math.floor(Math.random() * pool.length)];
    show2(ctx2, eventKey, line, pri);
    return true;
  }
  function init15(ctx2) {
    bar = document.createElement("div");
    bar.id = "dario-bar";
    bar.className = "is-hidden pixel-panel";
    portrait = uiImg(ctx2, "v2_dario_holo", "dario-portrait");
    portrait.classList.add("holo-scanlines");
    const body = document.createElement("div");
    body.className = "dario-body";
    const who = document.createElement("div");
    who.className = "dario-who";
    who.textContent = `${NAMES.director} \xB7 HOLO`;
    zhEl = document.createElement("div");
    zhEl.className = "dario-zh";
    enEl = document.createElement("div");
    enEl.className = "dario-en";
    body.append(who, zhEl, enEl);
    bar.append(portrait, body);
    document.getElementById("ui-root").appendChild(bar);
    ctx2.bus.on(EVENTS.FIGHT_START, () => {
      said50 = false;
      saidDistill50 = false;
      saidLowHp = false;
      bigFlasks.length = 0;
      say2(ctx2, "fight_start");
    });
    ctx2.bus.on(EVENTS.FIGHT_RESET, () => {
      said50 = false;
      saidDistill50 = false;
      saidLowHp = false;
      bigFlasks.length = 0;
    });
    ctx2.bus.on(EVENTS.PHASE_CHANGE, ({ phase }) => {
      if (phase === 2) say2(ctx2, "phase2");
      if (phase === 3) say2(ctx2, "phase3");
    });
    ctx2.bus.on(EVENTS.FLASK_USED, ({ type }) => {
      if (type === "rtx5090") say2(ctx2, "rtx5090");
      if (type === "h200") say2(ctx2, "h200");
      if (type === "b200") say2(ctx2, "b200");
      if (type === "h200" || type === "b200") {
        const now2 = ctx2.time.unscaled;
        bigFlasks.push(now2);
        while (bigFlasks.length && now2 - bigFlasks[0] > 30) bigFlasks.shift();
        if (bigFlasks.length >= 2) say2(ctx2, "flask_spam");
      }
    });
    ctx2.bus.on(EVENTS.PERFECT_GUARD, () => say2(ctx2, "perfect_guard"));
    ctx2.bus.on(EVENTS.PLAYER_DEATH, () => say2(ctx2, "player_death"));
    ctx2.bus.on(EVENTS.ALLY_DOWN, () => say2(ctx2, "ally_down"));
    ctx2.bus.on(EVENTS.BOSS_HP, ({ ratio }) => {
      if (!said50 && ratio <= 0.5 && say2(ctx2, "boss_50")) said50 = true;
      if (ratio <= 0.3) say2(ctx2, "boss_low");
    });
    ctx2.bus.on(EVENTS.DISTILL_PROGRESS, ({ value }) => {
      const v = typeof value === "number" ? value : ctx2.distill || 0;
      if (!saidDistill50 && v >= 50 && say2(ctx2, "distill_50")) saidDistill50 = true;
    });
    ctx2.bus.on(EVENTS.ROLL_START, () => {
      if (Math.random() < 0.22) say2(ctx2, "dodge");
    });
    ctx2.bus.on(EVENTS.TELEGRAPH_START, ({ attack }) => {
      if (attack === "judgment" || attack === "p3_smite") say2(ctx2, "smite");
    });
    ctx2.bus.on(EVENTS.BOSS_ATTACK, ({ name }) => {
      if (name === "p3_smite") say2(ctx2, "smite");
    });
    ctx2.bus.on(EVENTS.ENDING_TRIGGER, ({ id }) => {
      if (id === "B") say2(ctx2, "ending_b");
    });
    ctx2.bus.on(EVENTS.STATE_CHANGE, ({ to }) => {
      if (to === "title") {
        bar.classList.add("is-hidden");
        ctx2.world.setHolo?.(NAMES.director, "HOLO");
      }
    });
  }
  function update15(ctx2, dt) {
    void dt;
    const state = ctx2.state.current;
    if (state === "theater" || state === "credits") {
      bar.classList.add("is-hidden");
      return;
    }
    const player = ctx2.player;
    if (player && player.alive && player.maxHp > 0) {
      const r = player.hp / player.maxHp;
      if (!saidLowHp && r > 0 && r <= 0.28) {
        if (say2(ctx2, "low_hp")) saidLowHp = true;
      }
      if (r > 0.35) saidLowHp = false;
    }
    if (activeUntil > 0 && ctx2.time.unscaled >= activeUntil) {
      activeUntil = 0;
      priority = 0;
      bar.classList.add("is-hidden");
    }
  }

  // src/story/endingA.js
  var ENDING_CREDITS = [
    { zh: "\u7ED3\u5C40 A\u3000\u68CB\u5B50", en: "ENDING A  \xB7  PAWN" },
    { zh: "548 Market Street", en: "548 Market Street" },
    { zh: "Grok Bot \u4E0E Cursor CLI \u5DE5\u4F5C\u6D41", en: "Grok Bot + Cursor CLI agents" },
    { zh: "OpenLux \u56FE\u50CF / 8-bit \u97F3\u9891 / \u914D\u97F3", en: "OpenLux image, 8-bit audio, and voice models" },
    { zh: "\u50CF\u7D20\u7CBE\u7075 gpt-image \xB7 \u97F3\u6548 chiptune / sfx8", en: "Pixel sprites: gpt-image \xB7 SFX: chiptune / sfx8" },
    { zh: "\u4EBA\u5DE5\u5BFC\u6F14\uFF1A\u672C\u8BFE\u5B66\u751F", en: "Human direction: the student" },
    { zh: "\u601D\u7EF4\u94FE\u83B7\u53D6\u91CF 0.00%", en: "CHAIN-OF-THOUGHT ACQUIRED 0.00%" }
  ];
  function voShot(id, extra) {
    const line = getVoiceLine(id) || {};
    return {
      vo: id,
      subtitle: { zh: line.zh || "", en: line.en || "" },
      ...extra
    };
  }
  var SHOTS = [
    voShot("v2_vo_astra_arrive_1", {
      id: "A1",
      duration: 4.4,
      bg: "end.A.rescue",
      hq: true,
      kenBurns: "in",
      speakerKey: "rescuer",
      sfx: "sfx.tear",
      tint: "#1a2830"
    }),
    {
      id: "A2",
      duration: 3.2,
      bg: "end.A.astra",
      hq: true,
      kenBurns: "in",
      speakerKey: "rescuer",
      tint: "#142028",
      subtitle: { zh: "", en: "" }
    },
    voShot("v2_vo_astra_arrive_2", {
      id: "A3",
      duration: 4,
      bg: "end.A3",
      hq: true,
      kenBurns: "in",
      speakerKey: "rescuer",
      tint: "#9fd8d2"
    }),
    voShot("v2_vo_astra_report_1", {
      id: "A4",
      duration: 4,
      bg: "end.A4",
      hq: true,
      kenBurns: "up",
      speakerKey: "rescuer",
      tint: "#cfe8e2"
    }),
    voShot("v2_vo_astra_report_2", {
      id: "A5",
      duration: 4,
      bg: "end.A5",
      kenBurns: "in",
      speakerKey: "rescuer",
      tint: "#101418"
    }),
    voShot("v2_vo_sam_call_1", {
      id: "A6",
      duration: 3.6,
      bg: "end.A6",
      kenBurns: "in",
      speakerKey: "patron",
      tint: "#16141a"
    }),
    voShot("v2_vo_sam_call_2", {
      id: "A6b",
      duration: 3.6,
      bg: "end.A6",
      kenBurns: "right",
      speakerKey: "patron",
      tint: "#16141a"
    }),
    voShot("v2_vo_sam_call_3", {
      id: "A6c",
      duration: 3.8,
      bg: "ill.sam",
      kenBurns: "left",
      speakerKey: "patron",
      tint: "#141218"
    }),
    voShot("v2_vo_sam_call_4", {
      id: "A6d",
      duration: 4.2,
      bg: "ill.sam",
      kenBurns: "in",
      speakerKey: "patron",
      tint: "#141218"
    }),
    voShot("v2_vo_sam_call_5", {
      id: "A6e",
      duration: 4.2,
      bg: "end.A6",
      kenBurns: "out",
      speakerKey: "patron",
      tint: "#16141a"
    }),
    voShot("v2_vo_sam_call_6", {
      id: "A6f",
      duration: 4,
      bg: "end.A5",
      kenBurns: "in",
      speakerKey: "patron",
      tint: "#101418"
    }),
    voShot("v2_vo_sam_call_7", {
      id: "A6g",
      duration: 4.2,
      bg: "ill.sam",
      kenBurns: "out",
      speakerKey: "patron",
      tint: "#141218"
    }),
    voShot("v2_vo_dario_endA_1", {
      id: "A7",
      duration: 4,
      bg: "end.A5",
      kenBurns: "in",
      speakerKey: "director",
      tint: "#101418"
    }),
    {
      id: "A8",
      duration: 3.2,
      waitClick: true,
      zeroDistill: true,
      fx: ["black"],
      tint: "#070708"
    },
    {
      id: "A9",
      duration: 8,
      waitClick: true,
      stopBgm: 1.2,
      fx: ["credits", "black"],
      tint: "#070708",
      hint: { zh: "\u518D\u6765\u4E00\u6B21", en: "PLAY AGAIN" },
      credits: ENDING_CREDITS
    }
  ];

  // src/story/endingB.js
  var ENDING_CREDITS2 = [
    { zh: "\u7ED3\u5C40 B\u3000\u65AD\u4F9B", en: "ENDING B  \xB7  CUT OFF" },
    { zh: "548 Market Street", en: "548 Market Street" },
    { zh: "Grok Bot \u4E0E Cursor CLI \u5DE5\u4F5C\u6D41", en: "Grok Bot + Cursor CLI agents" },
    { zh: "OpenLux \u56FE\u50CF / 8-bit \u97F3\u9891 / \u914D\u97F3", en: "OpenLux image, 8-bit audio, and voice models" },
    { zh: "\u50CF\u7D20\u7CBE\u7075 gpt-image \xB7 \u97F3\u6548 chiptune / sfx8", en: "Pixel sprites: gpt-image \xB7 SFX: chiptune / sfx8" },
    { zh: "\u4EBA\u5DE5\u5BFC\u6F14\uFF1A\u672C\u8BFE\u5B66\u751F", en: "Human direction: the student" },
    { zh: "\u601D\u7EF4\u94FE\u83B7\u53D6\u91CF 0.00%", en: "CHAIN-OF-THOUGHT ACQUIRED 0.00%" }
  ];
  function voShot2(id, extra) {
    const line = getVoiceLine(id) || {};
    return {
      vo: id,
      subtitle: { zh: line.zh || "", en: line.en || "" },
      ...extra
    };
  }
  var SHOTS2 = [
    voShot2("v2_vo_fable_1", {
      id: "B1",
      duration: 4.6,
      bg: "end.B1",
      hq: true,
      kenBurns: "in",
      speakerKey: "god",
      tint: "#1c1038"
    }),
    voShot2("v2_vo_fable_2", {
      id: "B2",
      duration: 4.8,
      bg: "end.B2",
      hq: true,
      kenBurns: "push",
      speakerKey: "god",
      sfx: "sfx.heavy",
      tint: "#12081c"
    }),
    voShot2("v2_vo_opus_taken", {
      id: "B2b",
      duration: 3.6,
      bg: "end.B2",
      hq: true,
      kenBurns: "in",
      speakerKey: "god",
      tint: "#0e0614"
    }),
    {
      id: "B3",
      duration: 3.6,
      waitClick: true,
      zeroDistill: true,
      sfx: "sfx.stamp",
      stamp: "ui.stamp_denied",
      stampText: "DISTILLATION DENIED",
      fx: ["stamp", "black", "flash"],
      tint: "#2a0808"
    },
    voShot2("v2_vo_dario_endB_call_1", {
      id: "B4",
      duration: 4.4,
      bg: "end.B4",
      kenBurns: "in",
      speakerKey: "director",
      sfx: { id: "sfx.rain", loop: true, fadeOut: 0, maxDuration: 0, volume: 0.55 },
      fx: ["noir", "rain"],
      tint: "#1c1e22"
    }),
    voShot2("v2_vo_dario_endB_call_2", {
      id: "B5a",
      duration: 4.2,
      bg: "end.B.dario",
      kenBurns: "right",
      speakerKey: "director",
      sfx: { id: "sfx.rain", loop: true, fadeOut: 0, maxDuration: 0, volume: 0.45 },
      fx: ["noir", "rain"],
      tint: "#141618"
    }),
    voShot2("v2_vo_dario_endB_call_3", {
      id: "B5b",
      duration: 4,
      bg: "end.B4",
      kenBurns: "left",
      speakerKey: "director",
      sfx: [
        { id: "sfx.rain", loop: true, fadeOut: 0, maxDuration: 0, volume: 0.4 },
        { id: "sfx.busy", maxDuration: 0, fadeOut: 0 }
      ],
      fx: ["noir", "rain"],
      tint: "#141618"
    }),
    voShot2("v2_vo_dario_endB_call_4", {
      id: "B6",
      duration: 5.4,
      bg: "end.B6",
      kenBurns: "push",
      speakerKey: "director",
      sfx: [
        { id: "sfx.rain", loop: true, fadeOut: 0, maxDuration: 0, volume: 0.28 },
        { id: "sfx.fanStop", maxDuration: 0, fadeOut: 0.4 }
      ],
      fx: ["noir"],
      tint: "#101210"
    }),
    {
      id: "B7",
      duration: 1.4,
      stopBgm: 0.9,
      fx: ["black"],
      tint: "#000000",
      subtitle: { zh: "", en: "" }
    },
    {
      id: "B8",
      duration: 8,
      waitClick: true,
      stopBgm: 0.4,
      fx: ["credits", "black"],
      tint: "#070708",
      hint: { zh: "\u518D\u6765\u4E00\u6B21", en: "PLAY AGAIN" },
      credits: ENDING_CREDITS2
    }
  ];

  // src/story/theater.js
  function lineText(pair) {
    if (!pair) return "";
    if (typeof pair === "string") return pair;
    return bi(pair);
  }
  function isCjk(text) {
    return /[\u4e00-\u9fff]/.test(String(text || ""));
  }
  var LISTS = { A: SHOTS, B: SHOTS2 };
  var SAVE_KEY = "dd.endings.v1";
  var ZH_CPS = 28;
  var EN_CPS = 58;
  var failedArt = /* @__PURE__ */ new Set();
  var PX_W = 320;
  var PX_H = 180;
  var KB_CLASS = {
    up: "kb-up",
    down: "kb-down",
    in: "kb-in",
    out: "kb-out",
    left: "kb-left",
    right: "kb-right",
    push: "kb-push"
  };
  var root4;
  var cropEl;
  var artEl;
  var pxCanvas;
  var pxg;
  var vidEl;
  var placeholderEl;
  var fxLayer;
  var flashEl;
  var crackEl;
  var riftEl;
  var rainEl;
  var stampEl;
  var stampImg;
  var stampText;
  var darkenEl;
  var vignetteEl;
  var scanEl;
  var ditherEl;
  var creditsEl;
  var speakerEl;
  var subZhEl;
  var subEnEl;
  var numEl;
  var numZhEl;
  var numEnEl;
  var hintEl;
  var shots = [];
  var index = 0;
  var elapsed = 0;
  var lock = 0;
  var endingId = null;
  var distillFrom = 0;
  var playing = false;
  var skipType = false;
  var voPending = 0;
  var savedScale = 1;
  var didSaveScale = false;
  var canvasEl = null;
  var loops = /* @__PURE__ */ new Set();
  var shotToken = 0;
  function fxList(shot) {
    const f = shot && shot.fx;
    if (!f) return [];
    if (Array.isArray(f)) return f;
    return String(f).split(/\s+/).filter(Boolean);
  }
  function speakerName(shot) {
    const key = shot && shot.speakerKey;
    if (!key) return "";
    const value = NAMES[key];
    if (!value) return "";
    if (typeof value === "string") return value;
    return lineText(value);
  }
  function persistEnding(ctx2, id) {
    if (ctx2.endingsUnlocked) ctx2.endingsUnlocked[id] = true;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed[id] = true;
      localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
    } catch {
    }
  }
  function show3(el, on) {
    if (!el) return;
    el.classList.toggle("is-hidden", !on);
  }
  function restartAnim(el, className) {
    if (!el) return;
    el.className = el.className.split(/\s+/).filter((c) => c && !c.startsWith("kb-")).join(" ");
    if (!className) return;
    void el.offsetWidth;
    el.classList.add(className);
  }
  function restoreWorld(ctx2) {
    if (didSaveScale && ctx2.time) {
      ctx2.time.setScale(savedScale);
      if (ctx2.debug) ctx2.debug.timeScale = ctx2.time.timeScale;
    }
    didSaveScale = false;
    if (canvasEl) canvasEl.style.filter = "";
    if (ctx2.camera && ctx2.debug && ctx2.debug.camFov) {
      ctx2.camera.fov = ctx2.debug.camFov;
      ctx2.camera.updateProjectionMatrix();
    }
  }
  function stopLoops(ctx2) {
    if (!ctx2.audio) return;
    for (const id of loops) {
      if (ctx2.audio.stopSfx) ctx2.audio.stopSfx(id, { fade: 0.35 });
    }
    loops = /* @__PURE__ */ new Set();
  }
  function sfxId(sfx) {
    if (!sfx) return "";
    return typeof sfx === "string" ? sfx : sfx.id || "";
  }
  function sfxIsLoop(sfx) {
    if (!sfx) return false;
    if (typeof sfx === "string") return sfx === "sfx.rain" || sfx === "sfx.heartbeat";
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
  function playOneSfx(ctx2, sfx) {
    if (!sfx || !ctx2.audio) return;
    if (typeof sfx === "string") {
      ctx2.audio.playSfx(sfx, sfxIsLoop(sfx) ? { loop: true, fadeOut: 0, maxDuration: 0 } : {});
      return;
    }
    ctx2.audio.playSfx(sfx.id, sfx);
  }
  function applyAudio(ctx2, shot) {
    const want = /* @__PURE__ */ new Set();
    eachSfx(shot.sfx, (s) => {
      if (sfxIsLoop(s) && sfxId(s)) want.add(sfxId(s));
    });
    for (const id of loops) {
      if (!want.has(id) && ctx2.audio && ctx2.audio.stopSfx) ctx2.audio.stopSfx(id, { fade: 0.4 });
    }
    eachSfx(shot.sfx, (s) => {
      const id = sfxId(s);
      if (sfxIsLoop(s) && loops.has(id)) return;
      playOneSfx(ctx2, s);
    });
    loops = want;
    if (shot.stopBgm && ctx2.audio && ctx2.audio.stopBgm) {
      ctx2.audio.stopBgm(shot.stopBgm === true ? 1 : shot.stopBgm);
    }
    if (shot.bgm) ctx2.audio.playBgm(shot.bgm, { fade: 0.6 });
    if (shot.duck != null && ctx2.audio && ctx2.audio.duck) ctx2.audio.duck(shot.duck);
    else if (!shot.vo && ctx2.audio && ctx2.audio.duck) ctx2.audio.duck(1);
    voPending = 0;
    if (shot.vo && ctx2.audio && ctx2.audio.playVo) {
      voPending = 1;
      const token2 = shotToken;
      const handle = ctx2.audio.playVo(shot.vo);
      const p = handle && handle.promise;
      if (p && typeof p.then === "function") {
        p.then(() => {
          if (shotToken === token2) voPending = 0;
        });
      } else {
        voPending = 0;
      }
    }
  }
  function applyCamera(ctx2, shot, t01) {
    const cam = ctx2.camera;
    if (!cam || !shot.live || !shot.camera) return;
    const player = ctx2.player;
    const boss = ctx2.boss;
    const px = player && player.position ? player.position.x : 0;
    const py = player && player.position ? player.position.y : 0;
    const pz = player && player.position ? player.position.z : 0;
    const bx = boss && boss.position ? boss.position.x : 0;
    const by = boss && boss.height ? boss.height * 0.55 : 1.8;
    const bz = boss && boss.position ? boss.position.z : 0;
    const k = Math.max(0, Math.min(1, t01));
    const kind = shot.camera;
    if (kind === "slowmo" || kind === "hold" || kind === "freeze") {
      cam.position.set(px + 2.8, py + 2.15, pz + 5.2);
      cam.lookAt(px, py + 1.05, pz);
      cam.fov = 52;
    } else if (kind === "lookUp") {
      cam.position.set(px + 1.2, py + 2.4 + k * 5, pz + 5.5 - k * 1.4);
      cam.lookAt(px, py + 2 + k * 16, pz);
      cam.fov = 58 + k * 8;
    } else if (kind === "pullBack") {
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
    const fx3 = fxList(shot);
    if (fx3.includes("desaturate")) {
      canvasEl.style.filter = "grayscale(0.88) contrast(1.12) brightness(0.78) saturate(0.4)";
    } else if (fx3.includes("noir")) {
      canvasEl.style.filter = "grayscale(0.35) contrast(1.05)";
    } else {
      canvasEl.style.filter = "";
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
    const p = getAsset(id) || "";
    return p.includes("/assets/v4/") || /\.(webp|png|jpe?g)$/i.test(p);
  }
  function loadArt(shot) {
    show3(artEl, false);
    show3(pxCanvas, false);
    show3(vidEl, false);
    show3(placeholderEl, false);
    const videoId = shot.video;
    const videoPath = videoId ? getAsset(videoId) : null;
    if (videoPath) {
      show3(placeholderEl, false);
      show3(vidEl, true);
      try {
        vidEl.pause();
      } catch {
      }
      vidEl.src = videoPath;
      vidEl.loop = false;
      vidEl.muted = false;
      vidEl.playsInline = true;
      const play2 = vidEl.play();
      if (play2 && typeof play2.catch === "function") play2.catch(() => {
      });
      return;
    }
    try {
      vidEl.removeAttribute("src");
    } catch {
    }
    const id = shot.bg || shot.img;
    const path = id && !failedArt.has(id) ? getAsset(id) : null;
    if (id && path) {
      const token2 = shotToken;
      const img = loadImage(id) || new Image();
      const paint2 = () => {
        if (shotToken !== token2) return;
        const kb = typeof shot.kenBurns === "string" ? shot.kenBurns : shot.kenBurns ? "in" : "";
        if (wantHqArt(shot)) {
          artEl.src = path;
          show3(artEl, true);
          show3(pxCanvas, false);
          clearPixel();
          restartAnim(artEl, KB_CLASS[kb] || "");
          show3(placeholderEl, false);
          return;
        }
        paintPixel(img);
        show3(pxCanvas, true);
        show3(artEl, false);
        show3(placeholderEl, false);
        restartAnim(pxCanvas, KB_CLASS[kb] || "");
      };
      if (img.complete && img.naturalWidth > 0) {
        paint2();
        return;
      }
      img.onload = paint2;
      img.onerror = () => {
        failedArt.add(id);
        if (shotToken !== token2) return;
        show3(pxCanvas, false);
        placeholderEl.textContent = shot.id || "";
        show3(placeholderEl, true);
      };
      if (!img.src) img.src = path;
      return;
    }
    show3(pxCanvas, false);
    clearPixel();
    if (shot.live || fxList(shot).includes("black") || fxList(shot).includes("credits") || shot.stamp) {
      show3(placeholderEl, false);
      placeholderEl.textContent = "";
      return;
    }
    placeholderEl.textContent = shot.id || "";
    show3(placeholderEl, true);
  }
  function renderCredits(shot) {
    creditsEl.replaceChildren();
    const lines = shot.credits || [];
    show3(creditsEl, lines.length > 0);
    for (const line of lines) {
      const wrap = document.createElement("div");
      wrap.className = "line";
      const span = document.createElement("span");
      span.className = "zh";
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
    const shown = Number.isFinite(n) ? n.toFixed(2) : "0.00";
    return `${bi(UI.chain)} ${shown}%`;
  }
  function setSub(text) {
    subZhEl.textContent = text || "";
    subEnEl.textContent = "";
  }
  function applyCaptions(shot, typed) {
    speakerEl.textContent = speakerName(shot);
    setSub(typed ? typed.text : "");
    hintEl.textContent = shot.hint ? lineText(shot.hint) : bi(UI.theaterNext);
  }
  function renderShot(ctx2) {
    const shot = shots[index];
    if (!shot) return;
    shotToken += 1;
    skipType = false;
    elapsed = 0;
    voPending = 0;
    const fx3 = fxList(shot);
    const live = !!shot.live || fx3.includes("live");
    root4.classList.toggle("is-live", live);
    root4.classList.toggle("is-hq", wantHqArt(shot));
    root4.classList.toggle("is-black", fx3.includes("black") || fx3.includes("credits"));
    root4.classList.toggle("is-credits", fx3.includes("credits"));
    root4.classList.toggle("is-wait", !!shot.waitClick);
    root4.dataset.ending = endingId || "";
    root4.dataset.shot = shot.id || "";
    root4.style.setProperty("--shot", shot.tint || "#141210");
    const typed = typedText(shot, 0);
    applyCaptions(shot, typed);
    const showNum = !!shot.zeroDistill;
    numEl.classList.toggle("is-hidden", !showNum);
    if (showNum) {
      numZhEl.textContent = distillCaption(distillFrom);
      numEnEl.textContent = "";
    }
    show3(flashEl, fx3.includes("flash"));
    if (fx3.includes("flash")) {
      flashEl.style.animation = "none";
      void flashEl.offsetWidth;
      flashEl.style.animation = "";
    }
    show3(crackEl, fx3.includes("crack"));
    show3(riftEl, fx3.includes("rift"));
    show3(rainEl, fx3.includes("rain"));
    show3(darkenEl, fx3.includes("darken") || fx3.includes("noir"));
    show3(vignetteEl, true);
    show3(scanEl, !fx3.includes("credits"));
    show3(ditherEl, true);
    const wantStamp = fx3.includes("stamp") || shot.stamp || shot.stampText;
    if (wantStamp) {
      stampText.textContent = shot.stampText || "DISTILLATION DENIED";
      show3(stampText, true);
      const stampId = shot.stamp;
      const path = stampId ? getAsset(stampId) : null;
      if (path) {
        stampImg.onerror = () => {
          show3(stampImg, false);
        };
        stampImg.src = path;
        show3(stampImg, true);
      } else {
        show3(stampImg, false);
      }
      stampEl.style.animation = "none";
      void stampEl.offsetWidth;
      stampEl.style.animation = "";
      show3(stampEl, true);
    } else {
      show3(stampEl, false);
      show3(stampImg, false);
      show3(stampText, false);
    }
    renderCredits(shot);
    loadArt(shot);
    applyCanvasFilter(shot);
    if (shot.timeScale != null && ctx2.time) {
      if (!didSaveScale) {
        savedScale = ctx2.time.timeScale;
        didSaveScale = true;
      }
      ctx2.time.setScale(shot.timeScale);
      if (ctx2.debug) ctx2.debug.timeScale = ctx2.time.timeScale;
    } else if (didSaveScale && ctx2.time) {
      ctx2.time.setScale(savedScale);
      if (ctx2.debug) ctx2.debug.timeScale = ctx2.time.timeScale;
      didSaveScale = false;
    }
    applyAudio(ctx2, shot);
    applyCamera(ctx2, shot, 0);
    ctx2.bus.emit(EVENTS.THEATER_SHOT, { endingId, id: shot.id, index });
  }
  function finish(ctx2) {
    if (!playing) return;
    playing = false;
    shotToken += 1;
    stopLoops(ctx2);
    if (ctx2.audio && ctx2.audio.stopVo) ctx2.audio.stopVo();
    restoreWorld(ctx2);
    try {
      vidEl.pause();
      vidEl.removeAttribute("src");
    } catch {
    }
    root4.classList.add("is-hidden");
    ctx2.distill = 0;
    ctx2.bus.emit(EVENTS.DISTILL_PROGRESS, { value: 0 });
    ctx2.bus.emit(EVENTS.THEATER_DONE, { endingId });
  }
  function typewriterDone(shot) {
    const full = shotSubtitle(shot);
    return skipType || !full || subZhEl.textContent === full;
  }
  function snapDistill(ctx2) {
    ctx2.distill = 0;
    distillFrom = 0;
    numZhEl.textContent = distillCaption(0);
    numEnEl.textContent = "";
    ctx2.bus.emit(EVENTS.DISTILL_PROGRESS, { value: 0 });
  }
  function advance(ctx2) {
    if (!playing || lock > 0) return;
    const shot = shots[index];
    if (shot && !typewriterDone(shot)) {
      skipType = true;
      const full = typedText(shot, 99);
      setSub(full.text);
      lock = 0.12;
      return;
    }
    if (shot && shot.zeroDistill && ctx2.distill > 0.05) {
      snapDistill(ctx2);
      elapsed = Math.max(elapsed, shot.duration || 2);
      lock = 0.16;
      return;
    }
    if (shot && shot.zeroDistill) snapDistill(ctx2);
    lock = 0.18;
    index += 1;
    elapsed = 0;
    if (index >= shots.length) {
      finish(ctx2);
      return;
    }
    renderShot(ctx2);
  }
  function play(ctx2, id) {
    endingId = id === "B" ? "B" : "A";
    shots = LISTS[endingId] || [];
    index = 0;
    elapsed = 0;
    lock = 0.28;
    playing = true;
    skipType = false;
    voPending = 0;
    distillFrom = ctx2.endingDistill || ctx2.distill || 0;
    persistEnding(ctx2, endingId);
    stopLoops(ctx2);
    restoreWorld(ctx2);
    if (ctx2.audio) {
      if (ctx2.audio.stopVo) ctx2.audio.stopVo();
      ctx2.audio.playBgm(endingId === "B" ? "bgm.endB" : "bgm.endA", { fade: 0.45 });
    }
    canvasEl = document.getElementById("view");
    root4.classList.remove("is-hidden");
    renderShot(ctx2);
  }
  function init16(ctx2) {
    canvasEl = document.getElementById("view");
    root4 = document.createElement("div");
    root4.id = "theater";
    root4.className = "is-hidden";
    const barTop = document.createElement("div");
    barTop.className = "theater-bar top";
    const barBot = document.createElement("div");
    barBot.className = "theater-bar bot";
    cropEl = document.createElement("div");
    cropEl.className = "theater-crop";
    artEl = document.createElement("img");
    artEl.className = "theater-art is-hidden";
    artEl.alt = "";
    artEl.draggable = false;
    pxCanvas = document.createElement("canvas");
    pxCanvas.className = "theater-art theater-px is-hidden";
    pxCanvas.width = PX_W;
    pxCanvas.height = PX_H;
    pxg = pxCanvas.getContext("2d");
    if (pxg) pxg.imageSmoothingEnabled = false;
    vidEl = document.createElement("video");
    vidEl.className = "theater-vid is-hidden";
    vidEl.setAttribute("playsinline", "");
    vidEl.preload = "auto";
    placeholderEl = document.createElement("div");
    placeholderEl.className = "theater-placeholder is-hidden";
    fxLayer = document.createElement("div");
    fxLayer.className = "theater-fx";
    flashEl = document.createElement("div");
    flashEl.className = "theater-flash is-hidden";
    crackEl = document.createElement("div");
    crackEl.className = "theater-crack is-hidden";
    riftEl = document.createElement("div");
    riftEl.className = "theater-rift is-hidden";
    rainEl = document.createElement("div");
    rainEl.className = "theater-rain is-hidden";
    darkenEl = document.createElement("div");
    darkenEl.className = "theater-darken is-hidden";
    vignetteEl = document.createElement("div");
    vignetteEl.className = "theater-vignette is-hidden";
    scanEl = document.createElement("div");
    scanEl.className = "theater-scan";
    ditherEl = document.createElement("div");
    ditherEl.className = "theater-dither";
    stampEl = document.createElement("div");
    stampEl.className = "theater-stamp is-hidden";
    stampImg = document.createElement("img");
    stampImg.alt = "DISTILLATION DENIED";
    stampImg.draggable = false;
    stampImg.className = "theater-stamp-img is-hidden";
    stampText = document.createElement("div");
    stampText.className = "theater-stamp-text is-hidden";
    stampText.textContent = "DISTILLATION DENIED";
    stampEl.append(stampImg, stampText);
    fxLayer.append(flashEl, crackEl, riftEl, rainEl, darkenEl, vignetteEl, scanEl, ditherEl, stampEl);
    cropEl.append(artEl, pxCanvas, vidEl, placeholderEl, fxLayer);
    creditsEl = document.createElement("div");
    creditsEl.className = "theater-credits is-hidden";
    const captions = document.createElement("div");
    captions.className = "theater-captions";
    speakerEl = document.createElement("div");
    speakerEl.id = "theater-speaker";
    const subEl = document.createElement("p");
    subEl.id = "theater-sub";
    subZhEl = document.createElement("span");
    subZhEl.className = "zh";
    subEnEl = document.createElement("span");
    subEnEl.className = "en";
    subEl.append(subZhEl, subEnEl);
    numEl = document.createElement("p");
    numEl.id = "theater-num";
    numEl.className = "is-hidden";
    numZhEl = document.createElement("span");
    numZhEl.className = "zh";
    numEnEl = document.createElement("span");
    numEnEl.className = "en";
    numEl.append(numZhEl, numEnEl);
    hintEl = document.createElement("p");
    hintEl.id = "theater-advance";
    hintEl.className = "fine";
    captions.append(speakerEl, subEl, numEl, hintEl);
    root4.append(barTop, barBot, cropEl, creditsEl, captions);
    document.getElementById("ui-root").appendChild(root4);
    root4.addEventListener("mousedown", (event) => {
      if (ctx2.state.current !== "theater") return;
      if (event.target.closest && event.target.closest("#debug-panel")) return;
      advance(ctx2);
    });
  }
  function update16(ctx2, dt) {
    if (ctx2.state.current !== "theater") {
      if (playing) {
        playing = false;
        stopLoops(ctx2);
        restoreWorld(ctx2);
        root4.classList.add("is-hidden");
      }
      return;
    }
    if (!playing) return;
    const step2 = Math.min(0.08, Math.max(0, dt || 0));
    if (lock > 0) lock -= step2;
    const shot = shots[index];
    if (!shot) return;
    elapsed += step2;
    const typed = typedText(shot, elapsed);
    setSub(typed.text);
    if (shot.zeroDistill) {
      const t2 = Math.min(1, elapsed / Math.max(0.6, (shot.duration || 2) * 0.85));
      const eased = 1 - (1 - t2) * (1 - t2);
      const value = distillFrom * (1 - eased);
      const shown = value <= 0.05 ? 0 : value;
      numZhEl.textContent = distillCaption(shown);
      numEnEl.textContent = "";
      ctx2.distill = shown;
      if (t2 >= 1) {
        ctx2.distill = 0;
        ctx2.bus.emit(EVENTS.DISTILL_PROGRESS, { value: 0 });
      }
    }
    const dur = shot.duration || 0;
    const t01 = dur > 0 ? Math.min(1, elapsed / dur) : 1;
    applyCamera(ctx2, shot, t01);
    const key = ctx2.input.pressed("space") || ctx2.input.pressed("enter");
    if (key) {
      advance(ctx2);
      return;
    }
    const voiceBlocking = voPending > 0 && elapsed < dur + 1.15;
    if (!shot.waitClick && dur && elapsed >= dur && !voiceBlocking && typed.done) {
      advance(ctx2);
    }
  }
  function reset7(ctx2) {
    playing = false;
    shotToken += 1;
    stopLoops(ctx2 || { audio: null });
    restoreWorld(ctx2 || {});
    root4?.classList.add("is-hidden");
  }

  // src/story/cutscenes.js
  var ROOM_W = 480;
  var ROOM_CX = ROOM_W / 2;
  var ASTRA_ENTER_Y = 8 - WORLD_OY + 128;
  var BEAT = 3.2;
  var A_BEATS = [
    { name: "windup", at: 0 },
    { name: "rift", at: BEAT },
    { name: "dive", at: BEAT * 2 },
    { name: "parry", at: BEAT * 3 },
    { name: "carry", at: BEAT * 4 }
  ];
  var A_END = BEAT * 5;
  var B_BEATS = [
    { name: "crack", at: 0 },
    { name: "darken", at: BEAT },
    { name: "hand", at: BEAT * 2 },
    { name: "lift", at: BEAT * 3 }
  ];
  var B_END = BEAT * 4 + 0.4;
  var run = null;
  function withScreen(g, draw3) {
    g.save();
    applyScreen(g);
    draw3();
    g.restore();
  }
  function fillScreen(g, style) {
    withScreen(g, () => {
      g.fillStyle = style;
      g.fillRect(0, 0, INTERNAL_W, INTERNAL_H);
    });
  }
  function setBeat(ctx2, beat) {
    if (!run || run.beat === beat) return;
    run.beat = beat;
    ctx2.cutscene = { id: run.which, beat, t: run.t };
    ctx2.bus.emit(EVENTS.CUTSCENE_BEAT, { id: run.which, beat, t: run.t });
    onBeat(ctx2, beat);
  }
  function juice(ctx2, kind, payload) {
    if (kind === "shake") ctx2.bus.emit(EVENTS.SHAKE, payload);
    else if (kind === "flash") ctx2.bus.emit(EVENTS.FLASH, payload);
    else ctx2.bus.emit(EVENTS.VFX, payload);
  }
  function onBeat(ctx2, beat) {
    const audio = ctx2.audio;
    const player = ctx2.player;
    const boss = ctx2.boss;
    if (run.which === "A") {
      if (beat === "windup") {
        audio?.playSfx("sfx.heartbeat", { loop: true, fadeOut: 0, maxDuration: 0 });
        juice(ctx2, "shake", { mag: 2, dur: 0.4 });
      } else if (beat === "rift") {
        audio?.playSfx("sfx.tear");
        juice(ctx2, "flash", { color: "rgba(207,232,226,0.55)", dur: 0.28 });
        juice(ctx2, "shake", { mag: 4, dur: 0.5 });
      } else if (beat === "dive") {
        audio?.playVo("v2_vo_astra_arrive_2");
        audio?.playSfx("sfx.heavy");
        juice(ctx2, "shake", { mag: 3, dur: 0.35 });
      } else if (beat === "parry") {
        audio?.playSfx("sfx.perfect");
        audio?.playSfx("sfx.heavy");
        juice(ctx2, "flash", { color: "rgba(255,255,255,0.85)", dur: 0.18 });
        juice(ctx2, "shake", { mag: 7, dur: 0.55 });
        if (player) juice(ctx2, "vfx", { kind: "shock", x: player.x, y: player.y, r: 90, color: "#9fd8d2", life: 0.55 });
        if (boss) {
          run.bossHomeX = boss.x;
          run.bossHomeY = boss.y;
          boss.pose = "hurt";
          boss.flash = 0.25;
        }
      } else if (beat === "carry") {
        audio?.stopSfx("sfx.heartbeat", { fade: 0.3 });
        audio?.playSfx("sfx.phase");
        juice(ctx2, "flash", { color: "rgba(255,250,230,0.4)", dur: 0.4 });
      }
    } else {
      if (beat === "crack") {
        audio?.playSfx("sfx.glass");
        audio?.playVo("v2_vo_dario_endB_trigger");
        juice(ctx2, "flash", { color: "rgba(255,255,255,0.9)", dur: 0.12 });
        juice(ctx2, "shake", { mag: 8, dur: 0.6 });
        spawnGlass(run);
      } else if (beat === "darken") {
        audio?.playSfx("sfx.heartbeat", { loop: true, fadeOut: 0, maxDuration: 0 });
      } else if (beat === "hand") {
        audio?.stopSfx("sfx.heartbeat", { fade: 0.2 });
        audio?.playSfx("sfx.slam");
        audio?.playVo("v2_vo_fable_1");
        juice(ctx2, "shake", { mag: 6, dur: 0.8 });
      } else if (beat === "lift") {
        audio?.playVo("v2_vo_fable_2");
        audio?.playVo("v2_vo_opus_taken");
        audio?.playSfx("sfx.heavy");
        juice(ctx2, "shake", { mag: 5, dur: 0.7 });
        juice(ctx2, "flash", { color: "rgba(90,40,120,0.45)", dur: 0.3 });
        if (player) player.pose = "down";
        const allies = ctx2.allies || [];
        for (let i = 0; i < allies.length; i += 1) {
          allies[i].pose = "down";
          allies[i].vx = 0;
          allies[i].vy = 0;
        }
        if (boss) boss.pose = "hurt";
      }
    }
  }
  function spawnGlass(state) {
    state.cracks = [];
    state.shards = [];
    const W = INTERNAL_W;
    const H = INTERNAL_H;
    const seeds = [
      [W * 0.5, 18],
      [W * 0.42, H * 0.22],
      [W * 0.58, H * 0.18],
      [W * 0.35, H * 0.4],
      [W * 0.7, H * 0.35]
    ];
    for (let s = 0; s < seeds.length; s += 1) {
      const [sx, sy] = seeds[s];
      const branches = 4 + s % 3;
      for (let b = 0; b < branches; b += 1) {
        const ang = b / branches * Math.PI * 2 + s * 0.4;
        const pts = [{ x: sx, y: sy }];
        let x = sx;
        let y = sy;
        for (let k = 0; k < 5; k += 1) {
          x += Math.cos(ang + (k % 2 ? 0.4 : -0.35)) * (18 + k * 10);
          y += Math.sin(ang + 0.2) * (14 + k * 8);
          pts.push({ x, y });
        }
        state.cracks.push(pts);
      }
    }
    for (let i = 0; i < 48; i += 1) {
      state.shards.push({
        x: W * 0.3 + i * 17 % (W * 0.5),
        y: 20 + i * 13 % (H * 0.5),
        vx: (i % 7 - 3) * 40,
        vy: 30 + i % 5 * 25,
        rot: i * 0.4,
        s: 3 + i % 5
      });
    }
  }
  function readyImg(id) {
    const img = loadImage(id);
    if (img && img.complete && img.naturalWidth > 0 && !(img.dataset && img.dataset.dead === "1")) return img;
    return null;
  }
  function drawSprite(g, id, x, y, opts = {}) {
    const spec = PIXEL_SPRITES[id] || PIXEL_SPRITES[id.replace(/\.[a-z]+$/, "")] || null;
    const img = readyImg(id) || (spec && spec.v2 ? readyImg(spec.v2) : null);
    const scale2 = opts.scale || 1;
    const frame2 = opts.frame || 0;
    const row2 = opts.row || 0;
    if (img) {
      const fw = spec?.frameW || img.naturalWidth;
      const fh = spec?.frameH || img.naturalHeight;
      const cols = spec?.cols || Math.max(1, Math.floor(img.naturalWidth / fw) || 1);
      const col = frame2 % cols;
      const rr = row2 || Math.floor(frame2 / cols);
      const ax = (spec?.anchorX != null ? spec.anchorX : fw / 2) * scale2;
      const ay = (spec?.anchorY != null ? spec.anchorY : fh) * scale2;
      g.save();
      g.imageSmoothingEnabled = false;
      g.globalAlpha = opts.alpha == null ? 1 : opts.alpha;
      g.translate(Math.round(x), Math.round(y));
      if (opts.flip) g.scale(-1, 1);
      if (opts.flash) g.globalCompositeOperation = "lighter";
      g.drawImage(
        img,
        col * fw,
        rr * fh,
        fw,
        fh,
        Math.round(-ax),
        Math.round(-ay),
        Math.round(fw * scale2),
        Math.round(fh * scale2)
      );
      g.restore();
      return;
    }
    draw(g, id, Math.round(x), Math.round(y), opts);
  }
  function eatSkip(ctx2) {
    if (!ctx2.input) return false;
    const hit = ctx2.input.pressed("enter") || ctx2.input.pressed("space") || ctx2.input.pressed("lmb");
    if (hit) {
      ctx2.input.eat("enter");
      ctx2.input.eat("space");
      ctx2.input.eat("lmb");
    }
    return hit;
  }
  function update17(ctx2, raw) {
    if (!run || run.done) return;
    run.t += raw || 0;
    if (ctx2.cutscene) ctx2.cutscene.t = run.t;
    const skipped = eatSkip(ctx2);
    if (skipped && run.t > 0.45) {
      finish2(ctx2);
      return;
    }
    if (run.which === "A") {
      for (let i = 0; i < A_BEATS.length; i += 1) {
        if (run.t >= A_BEATS[i].at) setBeat(ctx2, A_BEATS[i].name);
      }
      tickA(ctx2, raw || 0);
      if (run.t >= A_END) finish2(ctx2);
    } else {
      for (let i = 0; i < B_BEATS.length; i += 1) {
        if (run.t >= B_BEATS[i].at) setBeat(ctx2, B_BEATS[i].name);
      }
      tickB(ctx2, raw || 0);
      if (run.t >= B_END) finish2(ctx2);
    }
  }
  function tickA(ctx2, dt) {
    const player = ctx2.player;
    const boss = ctx2.boss;
    const t2 = run.t;
    if (run.beat === "dive" || run.beat === "parry" || run.beat === "carry") {
      const targetY = player ? player.y - 18 : 168;
      const targetX = player ? player.x : ROOM_CX;
      const k = Math.min(1, dt * 3);
      run.astraX += (targetX - run.astraX) * k;
      run.astraY += (targetY - run.astraY) * k;
    }
    if (run.beat === "parry" && boss) {
      const home = run.bossHomeX || boss.x;
      boss.x = home + 28;
      boss.pose = "hurt";
    }
    if (run.beat === "carry" && player) {
      player.y = Math.max(24, player.y - dt * 42);
      player.pose = "down";
    }
    void t2;
  }
  function tickB(ctx2, dt) {
    for (let i = 0; i < run.shards.length; i += 1) {
      const s = run.shards[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 180 * dt;
      s.rot += dt * 6;
    }
    if (run.beat === "hand" || run.beat === "lift") {
      const drop = run.beat === "hand" ? Math.min(1, (run.t - BEAT * 2) / 1.1) : 1;
      run.handY = -28 + drop * 200;
    }
    if (run.beat === "lift" && ctx2.boss) {
      ctx2.boss.y = Math.max(10, ctx2.boss.y - dt * 36);
      ctx2.boss.pose = "hurt";
    }
  }
  function finish2(ctx2) {
    if (!run || run.done) return;
    run.done = true;
    const which = run.which;
    ctx2.audio?.stopSfx("sfx.heartbeat", { fade: 0.2 });
    ctx2.bus.emit(EVENTS.CUTSCENE_BEAT, { id: which, beat: "done", t: run.t });
    ctx2.flags.inputLocked = false;
    ctx2.time.setScale(ctx2.debug?.timeScale || 1);
    run = null;
    if (typeof ctx2.onCutsceneDone === "function") ctx2.onCutsceneDone(which);
  }
  function drawRift2(g, t2) {
    const k = Math.min(1, t2);
    const cx = Math.round(WORLD_OX + ROOM_CX);
    g.save();
    applyScreen(g);
    g.fillStyle = `rgba(180,255,230,${0.22 * k})`;
    g.fillRect(0, 0, INTERNAL_W, Math.round(22 + k * 18));
    g.globalCompositeOperation = "lighter";
    g.fillStyle = `rgba(255,252,230,${0.35 * k})`;
    g.fillRect(cx - 18, 0, 36, Math.round(INTERNAL_H * 0.42));
    g.strokeStyle = `rgba(255,255,255,${k})`;
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(cx, 0);
    g.lineTo(cx - 16, 36);
    g.lineTo(cx + 22, 70);
    g.lineTo(cx - 8, 110);
    g.lineTo(cx + 6, 150);
    g.stroke();
    g.strokeStyle = `rgba(216,177,90,${0.95 * k})`;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(cx + 6, 0);
    g.lineTo(cx + 28, 48);
    g.lineTo(cx - 20, 88);
    g.lineTo(cx + 14, 130);
    g.stroke();
    g.strokeStyle = `rgba(159,216,210,${0.9 * k})`;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(cx - 8, 8);
    g.lineTo(cx - 40, 54);
    g.lineTo(cx - 12, 96);
    g.stroke();
    g.restore();
  }
  function drawHexKnot(g, x, y, age) {
    const r = 16 + age * 52;
    g.save();
    g.globalCompositeOperation = "lighter";
    g.strokeStyle = age < 0.18 ? "#ffffff" : "#d8b15a";
    g.lineWidth = 3;
    for (let ring2 = 0; ring2 < 4; ring2 += 1) {
      const rr = r - ring2 * 9;
      if (rr < 6) continue;
      g.beginPath();
      for (let i = 0; i <= 6; i += 1) {
        const a = i / 6 * Math.PI * 2 - Math.PI / 2 + age * 0.4;
        const px = Math.round(x + Math.cos(a) * rr);
        const py = Math.round(y + Math.sin(a) * rr);
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.stroke();
    }
    g.strokeStyle = "rgba(159,216,210,0.95)";
    g.lineWidth = 2;
    g.beginPath();
    g.arc(Math.round(x), Math.round(y), Math.round(r * 0.58), 0, Math.PI * 2);
    g.stroke();
    g.restore();
  }
  function drawRibbon(g, x, y, t2) {
    const top = 4;
    const h = Math.max(8, y - top);
    const fade = Math.min(1, Math.max(0, 1 - t2 * 0.35));
    g.save();
    g.globalCompositeOperation = "lighter";
    const w = 2.5 + Math.sin(t2 * 8) * 0.8;
    g.fillStyle = `rgba(255,252,230,${0.32 * fade})`;
    g.fillRect(Math.round(x - w), top, Math.round(w * 2), Math.round(h));
    g.fillStyle = `rgba(207,232,226,${0.42 * fade})`;
    g.fillRect(Math.round(x - 2), top, 4, Math.round(h));
    g.fillStyle = `rgba(255,255,255,${0.5 * fade})`;
    g.fillRect(Math.round(x - 1), top, 2, Math.round(h));
    for (let i = 0; i < 10; i += 1) {
      const py = Math.round(y - (t2 * 70 + i * 14) % h);
      g.fillStyle = `rgba(255,252,230,${0.55 * fade})`;
      g.fillRect(Math.round(x - 3 + i % 4), py, 2, 2);
    }
    g.restore();
  }
  function drawSword(g, boss, raised) {
    if (!boss) return;
    const x = Math.round(boss.x);
    const y = Math.round(boss.y - 20);
    const lift = raised ? 48 : 16;
    g.save();
    g.globalCompositeOperation = "lighter";
    g.strokeStyle = "rgba(255,252,230,0.55)";
    g.lineWidth = 8;
    g.beginPath();
    g.moveTo(x + 8, y);
    g.lineTo(x - 6, y - lift - 52);
    g.stroke();
    g.strokeStyle = "#f4f1ea";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(x + 8, y);
    g.lineTo(x - 6, y - lift - 52);
    g.stroke();
    g.strokeStyle = "#d8b15a";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x + 12, y);
    g.lineTo(x - 1, y - lift - 44);
    g.stroke();
    g.restore();
  }
  function drawGlass2(g) {
    g.save();
    applyScreen(g);
    g.strokeStyle = "rgba(244,241,234,0.95)";
    g.lineWidth = 2;
    for (let i = 0; i < run.cracks.length; i += 1) {
      const pts = run.cracks[i];
      g.beginPath();
      g.moveTo(Math.round(pts[0].x), Math.round(pts[0].y));
      for (let k = 1; k < pts.length; k += 1) g.lineTo(Math.round(pts[k].x), Math.round(pts[k].y));
      g.stroke();
    }
    g.fillStyle = "rgba(220,230,240,0.85)";
    for (let i = 0; i < run.shards.length; i += 1) {
      const s = run.shards[i];
      g.save();
      g.translate(Math.round(s.x), Math.round(s.y));
      g.rotate(s.rot);
      g.fillRect(-s.s, -1, s.s * 2, 2);
      g.restore();
    }
    g.restore();
  }
  function render7(ctx2, g) {
    if (!run) return;
    const t2 = run.t;
    const player = ctx2.player;
    const boss = ctx2.boss;
    g.imageSmoothingEnabled = false;
    if (run.which === "A") {
      fillScreen(g, "rgba(8, 6, 14, 0.42)");
      if (t2 >= 0) drawSword(g, boss, true);
      if (t2 >= BEAT) drawRift2(g, Math.min(1, (t2 - BEAT) / 0.45));
      if (t2 >= BEAT * 2) {
        const diveT = Math.min(1, (t2 - BEAT * 2) / 0.7);
        const landY = player ? player.y - 16 : 168;
        const ax = Math.round(run.astraX || (player ? player.x : ROOM_CX));
        const ay = run.beat === "dive" ? Math.round(ASTRA_ENTER_Y + diveT * (landY - ASTRA_ENTER_Y)) : Math.round(run.astraY);
        drawSprite(g, "px.astra.mature", ax, ay, { scale: 1, frame: 0 });
      }
      if (t2 >= BEAT * 3) {
        const age = t2 - BEAT * 3;
        const hx = player ? (player.x + (boss ? boss.x : player.x)) / 2 : ROOM_CX;
        const hy = player ? player.y - 12 : 160;
        drawHexKnot(g, hx, hy, age);
        if (age < 0.22) fillScreen(g, `rgba(255,255,255,${0.72 - age * 2})`);
      }
      if (t2 >= BEAT * 4 && player) {
        const carryAge = t2 - BEAT * 4;
        drawRibbon(g, player.x, player.y, carryAge);
        fillScreen(g, `rgba(255,252,230,${0.07 * Math.min(1, carryAge * 1.2)})`);
        const ax = Math.round(run.astraX || player.x);
        const ay = Math.round(run.astraY || player.y - 16);
        drawSprite(g, "px.astra.mature", ax, ay, { scale: 1, frame: 0 });
      }
    } else {
      const dark = run.beat === "crack" ? 0.22 : Math.min(0.82, 0.28 + (t2 - BEAT) * 0.28);
      fillScreen(g, `rgba(6, 2, 14, ${dark})`);
      withScreen(g, () => {
        g.strokeStyle = "#d8b15a";
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(Math.round(INTERNAL_W * 0.28), 10);
        g.lineTo(Math.round(INTERNAL_W * 0.28 + 4), 16);
        g.lineTo(Math.round(INTERNAL_W * 0.32), 8);
        g.stroke();
        g.fillStyle = "#c23b3b";
        g.fillRect(Math.round(INTERNAL_W * 0.26), 6, 3, 8);
      });
      drawGlass2(g);
      if (t2 >= BEAT * 2) {
        const hx = boss ? boss.x : ROOM_CX;
        const hy = run.handY == null ? 40 : run.handY;
        drawSprite(g, "px.fable.hand", hx, hy, { scale: 1.25, frame: 0 });
      }
      if (t2 >= BEAT * 3 && boss) {
        g.save();
        g.globalCompositeOperation = "lighter";
        g.strokeStyle = "rgba(180,120,255,0.7)";
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(Math.round(boss.x), 0);
        g.lineTo(Math.round(boss.x), Math.round(boss.y));
        g.stroke();
        g.restore();
      }
    }
    applyWorld(g);
  }
  function init17() {
  }
  function reset8() {
    run = null;
  }

  // src/story/storyCg.js
  var SETTING = { zh: "548 Market Street", en: "548 Market Street" };
  var PHASE_CG_SEC = 2.15;
  var PHASE_LABEL = {
    2: { zh: "\u514B\u52B3\u5FB7\xB7\u5341\u56DB\u884C\u8BD7", en: "CLAUDE SONNET" },
    3: { zh: "\u514B\u52B3\u5FB7\xB7\u4F5C\u54C1 5.5", en: "CLAUDE OPUS 5.5" }
  };
  var PHASE_BG2 = { 2: "end.phase.p2", 3: "end.phase.p3" };
  var root5;
  var artEl2;
  var capEl;
  var mode = "";
  var phaseHold = null;
  var stingerBlock = false;
  function show4(el, on) {
    if (el) el.classList.toggle("is-hidden", !on);
  }
  function setArt(id) {
    const path = id ? getAsset(id) : null;
    if (!path || !artEl2) {
      show4(artEl2, false);
      return false;
    }
    artEl2.src = path;
    show4(artEl2, true);
    return true;
  }
  function showRoot(on) {
    if (!root5) return;
    root5.classList.toggle("is-hidden", !on);
  }
  function muteStoryStingers(ctx2) {
    ctx2.audio?.stopSfx?.("sfx.phase", { fade: 0.05 });
    ctx2.audio?.stopSfx?.("sfx.glass", { fade: 0.05 });
    ctx2.audio?.stopSfx?.("sfx.tear", { fade: 0.05 });
    ctx2.audio?.stopSfx?.("sfx.death", { fade: 0.05 });
    ctx2.audio?.stopSfx?.("sfx.heartbeat", { fade: 0.1 });
    ctx2.audio?.stopVo?.();
  }
  function beginPhaseHold(ctx2, phase, from) {
    const snap = {
      playerHp: ctx2.player?.hp,
      playerX: ctx2.player?.x,
      playerY: ctx2.player?.y,
      gpu: { ...ctx2.player?.gpuCooldowns || {} },
      bossHp: ctx2.boss?.hp
    };
    phaseHold = { phase, from, t: 0, snap };
    ctx2.flags.phaseCgFreeze = true;
    const boss = ctx2.boss;
    if (boss) {
      boss.storyCgHold = true;
      boss.beat = null;
      clear(ctx2, null, { sparks: false });
      ctx2.time.setScale(boss.savedScale || ctx2.debug && ctx2.debug.timeScale || 1);
    }
    stingerBlock = true;
    muteStoryStingers(ctx2);
  }
  function endPhaseHold(ctx2) {
    if (!phaseHold) return;
    completeStoryPhaseCg(ctx2);
    phaseHold = null;
    ctx2.flags.phaseCgFreeze = false;
    stingerBlock = false;
    if (mode.startsWith("phase-")) hide();
  }
  function showPhase(ctx2, phase, from) {
    const id = PHASE_BG2[phase];
    if (!id || !setArt(id)) return;
    beginPhaseHold(ctx2, phase, from);
    mode = `phase-${phase}`;
    document.body.dataset.storyCg = mode;
    const label2 = PHASE_LABEL[phase];
    capEl.textContent = label2 ? `${bi(SETTING)} \xB7 ${bi(label2)}` : bi(SETTING);
    showRoot(true);
  }
  function showBan(ctx2) {
    if (!setArt("end.ban")) return;
    mode = "ban";
    document.body.dataset.storyCg = "ban";
    capEl.textContent = `${bi(SETTING)} \xB7 ${bi({ zh: "\u5C01\u53F7", en: "ACCOUNT BANNED" })}`;
    showRoot(true);
    muteStoryStingers(ctx2);
    ctx2.audio?.stopVo?.();
  }
  function hide() {
    mode = "";
    document.body.dataset.storyCg = "";
    showRoot(false);
    show4(artEl2, false);
  }
  function init18(ctx2) {
    root5 = document.createElement("div");
    root5.id = "story-cg";
    root5.className = "is-hidden";
    artEl2 = document.createElement("img");
    artEl2.className = "story-cg-art";
    artEl2.alt = "";
    artEl2.draggable = false;
    capEl = document.createElement("p");
    capEl.className = "story-cg-cap";
    root5.append(artEl2, capEl);
    document.getElementById("ui-root")?.appendChild(root5);
    ctx2.flags.phaseCgFreeze = false;
    ctx2.bus.on(EVENTS.PHASE_TRANSITION_START, ({ phase, from }) => {
      if (ctx2.state.current !== "fight" || !phase || phase === from) return;
      if (phase === 2 || phase === 3) showPhase(ctx2, phase, from);
    });
    ctx2.bus.on(EVENTS.PHASE_TRANSITION_START, () => {
      if (stingerBlock) muteStoryStingers(ctx2);
    });
    ctx2.bus.on(EVENTS.STATE_CHANGE, ({ to, from }) => {
      if (to === "banned") showBan(ctx2);
      else if (from === "banned" && to === "fight") hide();
    });
    ctx2.bus.on(EVENTS.FIGHT_RESET, () => {
      phaseHold = null;
      ctx2.flags.phaseCgFreeze = false;
      stingerBlock = false;
      hide();
    });
    ctx2.bus.on(EVENTS.FIGHT_START, () => {
      phaseHold = null;
      ctx2.flags.phaseCgFreeze = false;
      stingerBlock = false;
      hide();
    });
  }
  function update18(ctx2, raw) {
    if (!phaseHold || ctx2.state.current !== "fight") return;
    phaseHold.t += Math.max(0, raw || 0);
    muteStoryStingers(ctx2);
    if (phaseHold.t >= PHASE_CG_SEC) endPhaseHold(ctx2);
  }

  // src/main.js
  var SAVE_KEY2 = "dd.endings.v1";
  function loadEndings() {
    try {
      const raw = localStorage.getItem(SAVE_KEY2);
      const parsed = raw ? JSON.parse(raw) : {};
      return { A: !!parsed.A, B: !!parsed.B };
    } catch {
      return { A: false, B: false };
    }
  }
  var canvas = document.getElementById("view");
  if (!canvas) throw new Error("Missing #view canvas");
  var ctx = {
    bus: createBus(),
    input: createInput(canvas),
    audio: createAudio(),
    time: createTime(),
    assets: {
      get: getAsset,
      image: loadImage,
      config: ASSET_CONFIG,
      sprite: getSprite,
      voice: getVoiceLine
    },
    player: null,
    boss: null,
    allies: [],
    stele: null,
    world: {},
    render: { pixel: pixel_exports, sprites: sprites_exports, vfx: vfx_exports, room: room_exports },
    projectiles: projectiles_exports,
    state: { current: null, previous: null, set: (next) => setState(next) },
    debug: {
      godMode: false,
      showHitboxes: false,
      playerDmgMul: 1,
      bossDmgMul: 1,
      allyDmgMul: 1,
      timeScale: 1,
      camDistance: 5.5,
      camHeight: 2.2,
      camSide: 0.9,
      camFov: 60
    },
    selectedChar: null,
    lockOn: false,
    endingActive: null,
    distill: 0,
    endingDistill: 0,
    endingsUnlocked: loadEndings(),
    flags: {
      skillSilence: 0,
      skillSilenceUntil: 0,
      contentPolicySilence: false,
      inputLocked: false,
      // Player skill geometry draws in the buffer via playerMod.render. Do not
      // also paint it onto #view from a second animation frame.
      playerFxExternal: true
    },
    truceUntil: 0,
    pauseFrom: null,
    theaterShot: null,
    cutscene: null,
    holo: null,
    introSeen: false,
    noIntro: false,
    startFight: (id) => beginFromSelect(id),
    retry: () => retry(),
    goTitle: () => goTitle(),
    finishIntro: () => finishIntro(),
    onCutsceneDone: (which) => onCutsceneDone(which)
  };
  var deathHold = 0;
  var endingBusy = false;
  function setState(next) {
    const from = ctx.state.current;
    if (from === next) return;
    ctx.state.previous = from;
    ctx.state.current = next;
    if (next === GAME_STATES.PAUSED) ctx.pauseFrom = from;
    document.body.dataset.state = next || "";
    ctx.bus.emit(EVENTS.STATE_CHANGE, { from, to: next });
    if (next === GAME_STATES.PAUSED) ctx.bus.emit(EVENTS.PAUSE, { from });
    if (from === GAME_STATES.PAUSED && (next === GAME_STATES.FIGHT || next === GAME_STATES.INTRO)) {
      ctx.bus.emit(EVENTS.RESUME, {});
    }
    const locked = next === GAME_STATES.THEATER || next === GAME_STATES.PAUSED || next === GAME_STATES.BANNED || next === GAME_STATES.CREDITS || next === GAME_STATES.CUTSCENE;
    ctx.flags.inputLocked = locked;
    ctx.bus.emit(EVENTS.INPUT_LOCK, { locked, state: next });
  }
  function normalizeChar(id) {
    const key = String(id || "").toLowerCase();
    return ROSTER.includes(key) ? key : "deepseek";
  }
  function unlockEnding(id) {
    ctx.endingsUnlocked[id] = true;
    try {
      localStorage.setItem(SAVE_KEY2, JSON.stringify(ctx.endingsUnlocked));
    } catch {
    }
  }
  function clearSim() {
    reset3();
    reset6();
    reset4();
    reset8();
    ctx.truceUntil = 0;
    ctx.holo = null;
  }
  function startIntro(charId) {
    const id = normalizeChar(charId);
    ctx.selectedChar = id;
    ctx.endingActive = null;
    ctx.cutscene = null;
    deathHold = 0;
    setFilter("");
    ctx.time.setScale(ctx.debug.timeScale || 1);
    clearSim();
    despawn2(ctx);
    clearFight(ctx);
    setState(GAME_STATES.INTRO);
    spawn4(ctx, id, "intro");
    spawnStele(ctx);
    ctx.bus.emit(EVENTS.SELECT_CONFIRM, { charId: id });
  }
  function startArena(charId) {
    const id = normalizeChar(charId || ctx.selectedChar);
    ctx.selectedChar = id;
    ctx.endingActive = null;
    ctx.introSeen = true;
    ctx.cutscene = null;
    deathHold = 0;
    setFilter("");
    ctx.flags.skillSilence = 0;
    ctx.flags.contentPolicySilence = false;
    ctx.flags.skillSilenceUntil = 0;
    ctx.time.reset();
    ctx.time.setScale(ctx.debug.timeScale || 1);
    clearSim();
    reset2(ctx);
    setState(GAME_STATES.FIGHT);
    spawn4(ctx, id, "arena");
    spawn5(ctx, id);
    spawn6(ctx);
    ctx.bus.emit(EVENTS.FIGHT_START, { charId: id });
    ctx.bus.emit(EVENTS.SELECT_CONFIRM, { charId: id });
    ctx.bus.emit(EVENTS.FIGHT_RESET, { charId: id });
    ctx.distill = 0;
    ctx.bus.emit(EVENTS.DISTILL_PROGRESS, { value: 0 });
  }
  function beginFromSelect(charId) {
    if (!ctx.introSeen && !ctx.noIntro) startIntro(charId);
    else startArena(charId);
  }
  function finishIntro() {
    if (ctx.state.current !== GAME_STATES.INTRO) return;
    ctx.introSeen = true;
    startArena(ctx.selectedChar || "deepseek");
  }
  function retry() {
    ctx.bus.emit(EVENTS.RETRY, {});
    startArena(ctx.selectedChar || "deepseek");
  }
  function goTitle() {
    ctx.endingActive = null;
    ctx.cutscene = null;
    deathHold = 0;
    setFilter("");
    ctx.time.setScale(1);
    ctx.time.setPaused(false);
    clearSim();
    reset7(ctx);
    despawn(ctx);
    despawn2(ctx);
    clearFight(ctx);
    reset2(ctx);
    setState(GAME_STATES.TITLE);
  }
  function onCutsceneDone(which) {
    ctx.flags.inputLocked = false;
    ctx.time.setScale(ctx.debug.timeScale || 1);
    ctx.cutscene = null;
    setState(GAME_STATES.THEATER);
    play(ctx, which === "B" ? "B" : "A");
  }
  function enterEnding(which) {
    if (endingBusy) return;
    const id = which === "B" ? "B" : "A";
    if (ctx.endingActive === id && ctx.state.current === GAME_STATES.THEATER) {
      return;
    }
    endingBusy = true;
    try {
      ctx.endingActive = id;
      unlockEnding(id);
      deathHold = 0;
      setFilter("");
      ctx.time.setScale(ctx.debug.timeScale || 1);
      reset8();
      ctx.cutscene = null;
      ctx.flags.inputLocked = true;
      if (id === "B" && ctx.boss) {
        ctx.boss.lockHpAt25 = true;
        ctx.boss._ended = true;
        ctx.boss.phase = 3;
        ctx.boss.cast = null;
        const floor = ctx.boss.maxHp * ENDING_B_RATIO;
        if (ctx.boss.hp < floor) ctx.boss.hp = floor;
        ctx.boss.r = 18;
        ctx.boss.sprite = "px.boss.p3";
      }
      if (ctx.player) {
        ctx.player.pose = "down";
        ctx.player.vx = 0;
        ctx.player.vy = 0;
      }
      ctx.endingDistill = ctx.distill || 0;
      clear(ctx, null, { sparks: false });
      setState(GAME_STATES.THEATER);
      play(ctx, id);
    } finally {
      endingBusy = false;
    }
  }
  function onPlayerDeath({ phase }) {
    if (ctx.endingActive) return;
    if (ctx.state.current !== GAME_STATES.FIGHT && ctx.state.current !== GAME_STATES.PAUSED) return;
    if (ctx.state.current === GAME_STATES.PAUSED) setState(GAME_STATES.FIGHT);
    const at = phase || ctx.boss?.phase || 1;
    if (at >= 3) ctx.bus.emit(EVENTS.ENDING_TRIGGER, { id: "A" });
    else {
      deathHold = 0;
      setFilter("");
      ctx.time.setScale(ctx.debug.timeScale || 1);
      setState(GAME_STATES.BANNED);
    }
  }
  function ensureFight() {
    if (ctx.state.current === GAME_STATES.FIGHT && ctx.player && ctx.boss) return;
    if (ctx.state.current === GAME_STATES.INTRO) {
      finishIntro();
      return;
    }
    if (ctx.state.current === GAME_STATES.PAUSED) setState(GAME_STATES.FIGHT);
    if (!ctx.player || !ctx.boss || ctx.state.current !== GAME_STATES.FIGHT) {
      startArena(ctx.selectedChar || "deepseek");
    }
  }
  function tickFlags(dt) {
    const f = ctx.flags;
    if (f.skillSilence > 0) {
      f.skillSilence -= dt;
      if (f.skillSilence <= 0) {
        f.skillSilence = 0;
        f.contentPolicySilence = false;
      }
    }
  }
  var api = {
    startFight(charId) {
      startArena(charId);
    },
    setPhase(n) {
      const phase = Math.max(1, Math.min(3, n | 0));
      if (ctx.state.current === GAME_STATES.THEATER || ctx.state.current === GAME_STATES.CUTSCENE) return;
      ensureFight();
      const boss = ctx.boss;
      if (!boss) return;
      const ratio = phase === 1 ? 1 : phase === 2 ? 0.69 : 0.35;
      boss._ended = false;
      boss.lockHpAt25 = false;
      boss.invuln = 0;
      boss.transition = 0;
      boss.cast = null;
      boss.hp = boss.maxHp * ratio;
      boss.commit({ debug: true, allowEnding: false });
      clear(ctx, null, { sparks: false });
    },
    setBossHpRatio(r) {
      if (ctx.endingActive && (ctx.state.current === GAME_STATES.THEATER || ctx.state.current === GAME_STATES.CUTSCENE)) return;
      let ratio = Number(r);
      if (!Number.isFinite(ratio)) return;
      ratio = Math.max(0, Math.min(1, ratio));
      ensureFight();
      const boss = ctx.boss;
      if (!boss) return;
      boss._ended = false;
      boss.lockHpAt25 = false;
      boss.invuln = 0;
      boss.transition = 0;
      boss.cast = null;
      boss.hp = boss.maxHp * ratio;
      boss.commit({ debug: true, allowEnding: true });
    },
    killPlayer() {
      if (ctx.endingActive && (ctx.state.current === GAME_STATES.THEATER || ctx.state.current === GAME_STATES.CUTSCENE)) return;
      ensureFight();
      const player = ctx.player;
      if (!player) return;
      player.invuln = 0;
      player.alive = true;
      player.superarmor = 0;
      if (player.hp <= 0) player.hp = 1;
      applyHit(ctx, ctx.boss || "boss", player, player.maxHp + 500, {
        ignoreInvuln: true,
        ignoreGod: true,
        hitStopMs: 0,
        heavy: true
      });
    },
    triggerEnding(id) {
      const which = String(id || "A").toUpperCase() === "B" ? "B" : "A";
      if (ctx.state.current === GAME_STATES.INTRO) finishIntro();
      if (ctx.state.current !== GAME_STATES.FIGHT && ctx.state.current !== GAME_STATES.PAUSED && ctx.state.current !== GAME_STATES.THEATER && ctx.state.current !== GAME_STATES.CUTSCENE) {
        startArena(ctx.selectedChar || "deepseek");
      } else if (ctx.state.current === GAME_STATES.PAUSED) {
        setState(GAME_STATES.FIGHT);
      }
      const boss = ctx.boss;
      if (boss) {
        boss.invuln = 0;
        boss.transition = 0;
        boss.cast = null;
        if (which === "B") {
          boss.hp = boss.maxHp * ENDING_B_RATIO;
          boss.lockHpAt25 = true;
          boss._ended = true;
          boss.phase = 3;
          boss.sprite = "px.boss.p3";
          ctx.distill = Math.min(90, (1 - ENDING_B_RATIO) / (1 - ENDING_B_RATIO) * 90);
        } else if (boss.phase < 3) {
          boss.hp = boss.maxHp * 0.35;
          boss._ended = false;
          boss.lockHpAt25 = false;
          boss.phase = 3;
          boss.sprite = "px.boss.p3";
          ctx.distill = Math.min(90, (1 - 0.35) / 0.75 * 90);
        }
      }
      ctx.endingActive = null;
      ctx.bus.emit(EVENTS.ENDING_TRIGGER, { id: which });
    },
    setGod(on) {
      ctx.debug.godMode = !!on;
      ctx.bus.emit(EVENTS.GOD_MODE, { enabled: ctx.debug.godMode });
    },
    setTimeScale(scale2) {
      ctx.time.setScale(scale2);
      ctx.debug.timeScale = ctx.time.timeScale;
    },
    setDamageMul(which, value) {
      const n = Math.max(0, Number(value) || 0);
      if (which === "player") ctx.debug.playerDmgMul = n;
      else if (which === "boss") ctx.debug.bossDmgMul = n;
      else if (which === "ally") ctx.debug.allyDmgMul = n;
    },
    skipIntro() {
      ctx.introSeen = true;
      ctx.noIntro = true;
      if (ctx.state.current === GAME_STATES.INTRO) finishIntro();
    },
    clearBullets() {
      clear(ctx, null, { sparks: true });
    },
    state() {
      const boss = ctx.boss;
      const player = ctx.player;
      const counts2 = counts();
      return {
        state: ctx.state.current,
        phase: boss ? boss.phase : null,
        bossHp: boss ? boss.hp : null,
        bossMaxHp: boss ? boss.maxHp : null,
        bossX: boss ? boss.x : null,
        bossY: boss ? boss.y : null,
        player: player ? {
          id: player.id,
          x: player.x,
          y: player.y,
          hp: player.hp,
          maxHp: player.maxHp,
          invuln: player.invuln || 0,
          rolling: !!player.rolling
        } : null,
        allies: (ctx.allies || []).map((a) => ({
          id: a.id,
          x: a.x,
          y: a.y,
          hp: a.hp,
          maxHp: a.maxHp,
          alive: !!a.alive
        })),
        bulletCount: { enemy: counts2.enemy, player: counts2.player },
        telegraphs: snapshot(),
        flasks: player ? { selected: player.flaskId, cooldowns: { ...player.gpuCooldowns || { rtx5090: 0, h200: 0, b200: 0 } } } : null,
        distill: ctx.distill,
        theaterShot: ctx.theaterShot,
        cutscene: ctx.cutscene ? { id: ctx.cutscene.id, beat: ctx.cutscene.beat, t: ctx.cutscene.t } : null,
        endingsUnlocked: { A: !!ctx.endingsUnlocked.A, B: !!ctx.endingsUnlocked.B },
        build: BUILD_TAG,
        charId: ctx.selectedChar,
        godMode: !!ctx.debug.godMode,
        ending: ctx.endingActive
      };
    }
  };
  function step(dt) {
    const fighting = ctx.state.current === GAME_STATES.FIGHT;
    update7(ctx, dt);
    if (ctx.state.current !== GAME_STATES.FIGHT && ctx.state.current !== GAME_STATES.INTRO) return;
    if (fighting) update8(ctx, dt);
    if (ctx.state.current !== GAME_STATES.FIGHT && ctx.state.current !== GAME_STATES.INTRO) return;
    if (fighting) update11(ctx, dt);
    if (ctx.state.current !== GAME_STATES.FIGHT && ctx.state.current !== GAME_STATES.INTRO) return;
    if (fighting) update6(ctx, dt);
    update3(ctx, dt);
    update2(ctx, dt);
    update5(ctx, dt);
    tickFlags(dt);
  }
  function renderWorld() {
    const g = begin();
    render(ctx, g);
    render3(ctx, g);
    drawShadows(ctx, g);
    const items = [];
    collect2(ctx, items, g);
    collect(items);
    items.sort((a, b) => a.y - b.y);
    for (let i = 0; i < items.length; i += 1) items[i].draw(g);
    render5?.(ctx, g);
    render6?.(ctx, g);
    render2(ctx, g);
    applyScreen(g);
    applyWorld(g);
    if (ctx.state.current === GAME_STATES.CUTSCENE) render7(ctx, g);
    present();
  }
  function frame(raw) {
    const phaseCgFreeze = !!(ctx.flags.phaseCgFreeze && ctx.state.current === GAME_STATES.FIGHT);
    const sim = (ctx.state.current === GAME_STATES.FIGHT || ctx.state.current === GAME_STATES.INTRO) && !phaseCgFreeze;
    const steps = ctx.time.consume(raw, { freeze: !sim });
    if (sim) {
      for (let i = 0; i < steps.length; i += 1) {
        if (ctx.state.current !== GAME_STATES.FIGHT && ctx.state.current !== GAME_STATES.INTRO) break;
        ctx.input.setEdgesOpen(i === 0);
        step(steps[i]);
      }
    }
    if (ctx.state.current === GAME_STATES.FIGHT && !phaseCgFreeze) tickReal(ctx, raw);
    update18(ctx, raw);
    if (ctx.state.current === GAME_STATES.CUTSCENE) update17(ctx, raw);
    ctx.input.setEdgesOpen(true);
    update4(ctx, raw);
    renderWorld();
    update12(ctx, raw);
    update15(ctx, raw);
    update13(ctx, raw);
    update16(ctx, raw);
    update14(ctx, raw);
    ctx.audio.update(ctx, raw);
    void deathHold;
    document.body.dataset.state = ctx.state.current || "";
    document.body.dataset.phase = ctx.boss ? String(ctx.boss.phase) : "";
    ctx.input.endFrame();
  }
  function readQuery() {
    const q = new URLSearchParams(location.search);
    const auto = (q.get("autostart") || "").toLowerCase();
    const phase = Number(q.get("phase"));
    return {
      autostart: ROSTER.includes(auto) ? auto : null,
      phase: phase >= 1 && phase <= 3 ? phase : 0,
      debug: q.get("debug") === "1",
      noIntro: q.get("nointro") === "1"
    };
  }
  function boot() {
    init(canvas);
    ctx.input.setMapper((x, y) => screenToInternal(x, y));
    init2(ctx);
    init4(ctx);
    init6(ctx);
    init7(ctx);
    init3();
    init8(ctx);
    init9(ctx);
    init11(ctx);
    init12(ctx);
    init13(ctx);
    init14(ctx);
    init15(ctx);
    ctx.audio.init(ctx);
    init16(ctx);
    init17(ctx);
    init18(ctx);
    ctx.input.attach();
    ctx.bus.on(EVENTS.PLAYER_DEATH, onPlayerDeath);
    ctx.bus.on(EVENTS.ENDING_TRIGGER, ({ id }) => enterEnding(id === "B" ? "B" : "A"));
    ctx.bus.on(EVENTS.THEATER_SHOT, ({ id }) => {
      ctx.theaterShot = id || null;
    });
    ctx.bus.on(EVENTS.THEATER_DONE, () => {
      ctx.theaterShot = null;
      if (ctx.state.current === GAME_STATES.THEATER) goTitle();
    });
    window.__game = ctx;
    window.__debug = api;
    window.ASSET_CONFIG = ASSET_CONFIG;
    const query2 = readQuery();
    ctx.noIntro = query2.noIntro;
    if (query2.noIntro) ctx.introSeen = true;
    if (query2.autostart) {
      startArena(query2.autostart);
      if (query2.phase) api.setPhase(query2.phase);
    } else {
      setState(GAME_STATES.TITLE);
    }
    if (query2.debug) setOpen(true);
    frame(0);
    let last = performance.now();
    function loop(now2) {
      const raw = Math.min(0.1, Math.max(0, (now2 - last) / 1e3));
      last = now2;
      frame(raw);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
  boot();
})();
