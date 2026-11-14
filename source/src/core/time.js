// OWNER: INTEGRATOR
// Fixed 60 Hz sim clock. Pause drains accumulated time without advancing `elapsed`.
// hitStop burns real time and yields no steps. timeScale multiplies the sim step only.

export function createTime() {
  const time = {
    fixedHz: 60,
    fixedDt: 1 / 60,
    timeScale: 1,
    hitStop: 0,
    elapsed: 0,
    unscaled: 0,
    lastRaw: 0,
    accumulator: 0,

    /** @param {number} ms */
    requestHitStop(ms) {
      const s = Math.max(0, Number(ms) || 0) / 1000;
      if (s > this.hitStop) this.hitStop = s;
    },

    /** @param {number} scale */
    setScale(scale) {
      const n = Number(scale);
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
      /** @type {number[]} */
      const steps = [];
      let guard = 0;
      const freeze = !!opts.freeze;
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
    },
  };
  return time;
}
