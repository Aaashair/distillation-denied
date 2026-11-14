// OWNER: WS3
// Silent world-texture loader. Paths come from getAsset(); missing files keep
// an empty texture and never log. Image size is unknown until load, so we do
// not upload a placeholder of a different size (that overflows texSubImage).

import * as THREE from 'three';
import { getAsset } from '../config/assets.js';

/**
 * @param {string} id
 * @param {{
 *   fallback?: string,
 *   repeat?: number|{x:number, y:number},
 *   mapping?: number,
 *   anisotropy?: number,
 *   colorSpace?: string,
 *   onLoad?: (tex: THREE.Texture) => void,
 * }} [opts]
 * @returns {THREE.Texture}
 */
export function loadWorldTexture(id, opts = {}) {
  const img = new Image();
  const tex = new THREE.Texture(img);
  tex.colorSpace = opts.colorSpace || THREE.SRGBColorSpace;
  tex.wrapS = opts.repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  tex.wrapT = tex.wrapS;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.flipY = true;
  if (opts.repeat) {
    const r = opts.repeat;
    tex.repeat.set(typeof r === 'number' ? r : (r.x || 1), typeof r === 'number' ? r : (r.y || 1));
  }
  if (opts.mapping) tex.mapping = opts.mapping;
  if (opts.anisotropy) tex.anisotropy = opts.anisotropy;

  const path = getAsset(id);
  if (!path) return tex;

  img.decoding = 'async';
  img.onload = () => {
    tex.needsUpdate = true;
    if (opts.onLoad) opts.onLoad(tex);
  };
  img.onerror = () => {};
  img.src = path;
  return tex;
}

export function moteMap() {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 32;
  const g = c.getContext('2d');
  if (g) {
    const grd = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grd.addColorStop(0, 'rgba(255,248,230,1)');
    grd.addColorStop(0.35, 'rgba(232,201,120,0.55)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 32, 32);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}
