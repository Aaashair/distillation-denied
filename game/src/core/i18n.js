// OWNER: W1 (v3)
// Title language — persistent localStorage, default zh.

const STORAGE_KEY = 'dd.lang.v3';
/** @type {'zh'|'en'} */
let cached = 'zh';
/** @type {Set<(lang: 'zh'|'en') => void>} */
const listeners = new Set();

function readStored() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'en' || v === 'zh') return v;
  } catch { /* ignore */ }
  return 'zh';
}

cached = readStored();

/** @returns {'zh'|'en'} */
export function getLanguage() {
  return cached;
}

/** @param {'zh'|'en'} lang */
export function setLanguage(lang) {
  const next = lang === 'en' ? 'en' : 'zh';
  if (next === cached) return;
  cached = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch { /* ignore */ }
  for (const fn of listeners) {
    try { fn(next); } catch (e) { console.error(e); }
  }
}

/** @param {(lang: 'zh'|'en') => void} fn */
export function onLanguageChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function isEnglish() {
  return cached === 'en';
}