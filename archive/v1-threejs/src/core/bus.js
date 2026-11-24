// OWNER: INTEGRATOR
// FROZEN. Tiny pub/sub. Payloads are passed by reference; listeners must not assume a copy.

/**
 * @typedef {Object} EventBus
 * @property {(type: string, fn: (payload: any) => void) => () => void} on
 * @property {(type: string, fn: (payload: any) => void) => () => void} once
 * @property {(type: string, fn: Function) => void} off
 * @property {(type: string, payload?: any) => void} emit
 * @property {() => void} clear
 */

export function createBus() {
  /** @type {Map<string, Set<Function>>} */
  const listeners = new Map();

  function setFor(type) {
    let set = listeners.get(type);
    if (!set) {
      set = new Set();
      listeners.set(type, set);
    }
    return set;
  }

  /** @type {EventBus} */
  const bus = {
    on(type, fn) {
      setFor(type).add(fn);
      return () => bus.off(type, fn);
    },
    once(type, fn) {
      const wrap = (payload) => {
        bus.off(type, wrap);
        fn(payload);
      };
      return bus.on(type, wrap);
    },
    off(type, fn) {
      const set = listeners.get(type);
      if (set) set.delete(fn);
    },
    emit(type, payload) {
      const set = listeners.get(type);
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
      listeners.clear();
    },
  };

  return bus;
}
