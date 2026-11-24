// OWNER: WS4
// Shared DOM helpers for UI art ids (no hardcoded paths).

/** @param {import('../core/contracts.js').GameContext} ctx */
export function uiImg(ctx, id, className = '') {
  const img = document.createElement('img');
  img.className = className;
  img.alt = '';
  img.decoding = 'async';
  img.draggable = false;
  const path = ctx.assets?.get?.(id);
  if (path) img.src = path;
  img.addEventListener('error', () => img.classList.add('is-missing'), { once: true });
  return img;
}

/** @param {import('../core/contracts.js').GameContext} ctx */
export function playUiClick(ctx) {
  ctx.audio?.playSfx('sfx.ui');
}
