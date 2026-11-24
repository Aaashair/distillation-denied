// OWNER: W3
// Procedural PIXEL ART fallbacks. Palette-indexed tiny bitmaps → offscreen
// canvases, 4-frame anims, 1px dark outline, 2–3 tone cel shading.
// Never tainted (we own the pixels). `draw()` keeps the feet-anchor API
// cutscenes.js already calls.

const INK = '#1b1530';

const cache = new Map();

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
    hline(x, y, len, i) { this.rect(x, y, len, 1, i); },
    vline(x, y, len, i) { this.rect(x, y, 1, len, i); },
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
          const hit = (x > 0 && data[i - 1])
            || (x < bw - 1 && data[i + 1])
            || (y > 0 && data[i - bw])
            || (y < bh - 1 && data[i + bw]);
          if (hit) next[i] = ink;
        }
      }
      this.data = next;
    },
  };
}

function hexToRgb(hex) {
  const h = hex.charAt(0) === '#' ? hex.slice(1) : hex;
  const n = parseInt(h.length === 3
    ? h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2)
    : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

function blit(g, ox, oy, buf, pal) {
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
  g.putImageData(img, ox, oy);
}

function rgbPal(list) {
  const out = [null];
  for (let i = 0; i < list.length; i += 1) out.push(hexToRgb(list[i]));
  return out;
}

function bake(w, h, n, palHex, paint, extra) {
  const pal = rgbPal(palHex);
  const c = document.createElement('canvas');
  c.width = w * n;
  c.height = h;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  for (let f = 0; f < n; f += 1) {
    const b = makeBuf(w, h);
    paint(b, f);
    b.outline(1);
    blit(g, f * w, 0, b, pal);
  }
  return {
    canvas: c,
    frameW: w,
    frameH: h,
    frames: n,
    fps: extra && extra.fps ? extra.fps : 8,
    anchorX: extra && extra.ax != null ? extra.ax : (w >> 1),
    anchorY: extra && extra.ay != null ? extra.ay : h - 2,
  };
}

/* ---------- characters ---------- */
// pal index: 1 ink, then tones

function paintDeepseek(b, f) {
  const bob = f % 2;
  const step = f % 2;
  const swing = (f === 1 || f === 2) ? 1 : 0;
  // whale-tail ponytail
  b.shade(18, 2 + bob, 8, 5, 2, 3, 4);
  b.rect(22, 6 + bob, 6, 3, 4);
  b.rect(24, 8 + bob, 5, 2, 5);
  b.p(28, 9 + bob, 5);
  // hair
  b.shade(10, 4 + bob, 12, 6, 2, 3, 4);
  b.rect(12, 3 + bob, 8, 2, 4);
  // head
  b.shade(12, 8 + bob, 8, 7, 6, 7, 8);
  b.p(14, 11 + bob, 1); b.p(17, 11 + bob, 1); // eyes
  b.p(15, 13 + bob, 9); // mouth tick
  // body white/blue
  b.shade(11, 15 + bob, 10, 10, 2, 3, 5);
  b.rect(13, 16 + bob, 6, 6, 5);
  b.rect(14, 17 + bob, 4, 2, 4); // cyan knot
  // legs
  b.rect(12 + step, 25 + bob, 3, 7 - bob, 2);
  b.rect(17 - step, 25 + bob, 3, 7 - bob, 3);
  b.rect(12 + step, 31, 3, 2, 1);
  b.rect(17 - step, 31, 3, 2, 1);
  // twin cyan blades
  b.rect(6 - swing, 14 + bob, 4, 2, 10);
  b.rect(5 - swing, 16 + bob, 3, 12, 9);
  b.rect(6 - swing, 16 + bob, 1, 12, 10);
  b.rect(22 + swing, 14 + bob, 4, 2, 10);
  b.rect(24 + swing, 16 + bob, 3, 12, 9);
  b.rect(25 + swing, 16 + bob, 1, 12, 10);
}

function paintKimi(b, f) {
  const bob = f % 2;
  const step = f % 2;
  // starry navy robe
  b.shade(9, 14 + bob, 14, 16, 2, 3, 4);
  b.rect(11, 16 + bob, 10, 10, 3);
  b.p(12, 18 + bob, 8); b.p(18, 20 + bob, 8); b.p(14, 22 + bob, 5);
  b.p(20, 17 + bob, 8);
  // sash
  b.rect(10, 24 + bob, 12, 2, 5);
  // head
  b.shade(12, 6 + bob, 8, 8, 6, 7, 7);
  b.rect(13, 4 + bob, 6, 3, 2); // hair
  b.rect(11, 7 + bob, 3, 6, 2);
  b.p(14, 9 + bob, 1); b.p(17, 9 + bob, 1);
  // silver crescent staff
  const sx = 24;
  b.rect(sx, 4 + bob, 2, 28, 5);
  b.rect(sx - 1, 4 + bob, 4, 2, 8);
  b.rect(sx - 3, 6 + bob, 2, 6, 8);
  b.rect(sx + 3, 6 + bob, 2, 6, 8);
  b.p(sx - 4, 8 + bob, 8);
  b.p(sx + 5, 8 + bob, 8);
  // legs under robe
  b.rect(12 + step, 30, 3, 4, 2);
  b.rect(17 - step, 30, 3, 4, 2);
}

function paintGlm(b, f) {
  const bob = f % 2;
  const step = f % 2;
  // tower shield left
  b.shade(3, 12 + bob, 8, 16, 5, 6, 8);
  b.rect(5, 14 + bob, 4, 12, 6);
  b.rect(6, 16 + bob, 2, 8, 8);
  b.p(7, 18 + bob, 5);
  // body purple
  b.shade(11, 14 + bob, 11, 12, 2, 3, 4);
  b.rect(13, 16 + bob, 7, 8, 4);
  b.rect(14, 18 + bob, 5, 2, 5); // gold belt
  // head
  b.shade(13, 6 + bob, 8, 8, 7, 7, 7);
  b.rect(14, 4 + bob, 6, 3, 2);
  b.p(15, 9 + bob, 1); b.p(18, 9 + bob, 1);
  // hammer
  b.rect(24, 10 + bob + step, 7, 6, 5);
  b.rect(25, 11 + bob + step, 5, 4, 8);
  b.rect(26, 16 + bob + step, 3, 12, 6);
  // legs
  b.rect(13 + step, 26 + bob, 3, 8 - bob, 2);
  b.rect(18 - step, 26 + bob, 3, 8 - bob, 3);
}

function paintHaiku(b, f) {
  const bob = f % 2;
  const step = f % 2;
  // ivory body
  b.shade(10, 12 + bob, 10, 12, 2, 3, 4);
  b.rect(12, 14 + bob, 6, 6, 4);
  // coral sash / ribbon
  b.rect(10, 18 + bob, 10, 2, 6);
  b.rect(20, 8 + bob, 2, 10, 6);
  b.rect(21, 6 + bob, 4, 3, 6);
  // head
  b.shade(11, 5 + bob, 8, 7, 3, 4, 4);
  b.rect(12, 3 + bob, 6, 3, 5); // hair
  b.p(13, 8 + bob, 1); b.p(16, 8 + bob, 1);
  // rapier
  b.rect(22, 16 + bob, 8, 1, 7);
  b.rect(21, 15 + bob, 2, 3, 6);
  b.p(30, 16 + bob, 4);
  // legs
  b.rect(12 + step, 24 + bob, 3, 7 - bob, 2);
  b.rect(16 - step, 24 + bob, 3, 7 - bob, 3);
}

function paintSonnet(b, f) {
  const bob = f % 2;
  const halo = f;
  // cape
  b.shade(8, 16 + bob, 6, 18, 6, 7, 6);
  b.shade(22, 16 + bob, 6, 18, 6, 7, 6);
  // white-gold gown
  b.shade(12, 16 + bob, 12, 18, 2, 3, 4);
  b.rect(14, 18 + bob, 8, 10, 4);
  b.rect(13, 28 + bob, 10, 2, 5);
  // head
  b.shade(14, 8 + bob, 8, 8, 3, 4, 4);
  b.rect(15, 5 + bob, 6, 4, 5);
  b.rect(22, 6 + bob, 4, 8, 7); // coral hair lock
  b.p(16, 11 + bob, 1); b.p(19, 11 + bob, 1);
  // gold rune halo (spins by frame)
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
  // six gold chain-node wings (3 per side, layered)
  for (let i = 0; i < 3; i += 1) {
    const y = 14 + i * 9 + bob;
    const span = 16 - i * 2;
    // left
    b.rect(2 + i, y, span, 5, 6);
    b.rect(3 + i, y + 1, span - 2, 3, 8);
    b.rect(4 + i, y + 2, 3, 1, 5);
    b.disk(5 + i, y + 2, 2, 5);
    // right
    b.rect(46 + i, y, span, 5, 6);
    b.rect(47 + i, y + 1, span - 2, 3, 8);
    b.disk(58 - i, y + 2, 2, 5);
  }
  // gown
  b.shade(24, 24 + bob, 16, 22, 2, 3, 4);
  b.rect(26, 26 + bob, 12, 14, 4);
  b.rect(28, 28 + bob, 8, 3, 6); // gold belt
  // coral core
  b.disk(32, 36 + bob, 4, 9);
  b.disk(32, 36 + bob, 2, 4);
  b.p(32, 36 + bob, 8);
  // head + pale hair
  b.shade(26, 10 + bob, 12, 12, 3, 4, 4);
  b.rect(27, 6 + bob, 10, 6, 5);
  b.rect(24, 10 + bob, 4, 10, 5);
  b.rect(36, 10 + bob, 4, 10, 5);
  b.p(30, 15 + bob, 1); b.p(35, 15 + bob, 1);
  b.hline(31, 18 + bob, 3, 9);
  // halo ring
  b.rect(22, 4 + bob, 20, 2, 6);
  b.rect(30, 2 + bob, 4, 4, 8);
  // greatsword
  b.rect(44 + beat, 2 + bob, 5, 44, 7);
  b.rect(43 + beat, 2 + bob, 7, 8, 6);
  b.rect(45 + beat, 4 + bob, 2, 40, 8);
  // legs
  b.rect(26, 46 + bob, 5, 12 - bob, 2);
  b.rect(34, 46 + bob, 5, 12 - bob, 3);
}

function paintAstra(b, f) {
  const bob = f % 2;
  const wing = f % 2;
  // white wings
  b.shade(2, 14 + bob, 12, 10, 2, 3, 4);
  b.shade(34, 14 + bob, 12, 10, 2, 3, 4);
  b.rect(2, 16 + bob, 10, 4, 4);
  b.rect(36, 16 + bob, 10, 4, 4);
  b.rect(1 + wing, 18 + bob, 8, 6, 3);
  b.rect(39 - wing, 18 + bob, 8, 6, 3);
  // tail
  b.rect(30, 40 + bob, 10, 3, 3);
  b.rect(38, 38 + bob, 6, 3, 4);
  b.p(44, 38 + bob, 9);
  // gown white/black collar
  b.shade(16, 22 + bob, 16, 22, 2, 3, 4);
  b.rect(18, 24 + bob, 12, 14, 4);
  b.rect(16, 22 + bob, 16, 4, 6); // black collar
  b.rect(22, 24 + bob, 4, 4, 5); // hex-knot brooch
  b.p(23, 25 + bob, 8); b.p(25, 25 + bob, 8);
  b.p(24, 26 + bob, 5);
  // head + long silver hair
  b.shade(18, 10 + bob, 12, 12, 7, 7, 4);
  b.rect(16, 10 + bob, 4, 18, 3); // hair left
  b.rect(28, 10 + bob, 5, 20, 4); // hair right lavender sheen
  b.rect(29, 12 + bob, 3, 16, 9);
  b.rect(20, 6 + bob, 8, 6, 4);
  // horns back-curving
  b.rect(17, 4 + bob, 3, 5, 2);
  b.rect(16, 4 + bob, 2, 2, 6);
  b.rect(28, 4 + bob, 3, 5, 2);
  b.rect(30, 4 + bob, 2, 2, 6);
  b.p(21, 14 + bob, 1); b.p(26, 14 + bob, 1);
  // legs / hem
  b.rect(20, 44 + bob, 4, 6, 3);
  b.rect(26, 44 + bob, 4, 6, 2);
}

function paintFable(b, f) {
  const flicker = f % 2;
  // hooded void figure
  b.rect(8, 8, 20, 6, 2); // hood
  b.rect(10, 6, 16, 4, 3);
  b.shade(10, 12, 16, 22, 2, 3, 4);
  b.rect(12, 14, 12, 16, 3);
  // empty face hole
  b.rect(14, 10, 8, 6, 2);
  b.rect(16, 12, 4, 3, 1);
  // gold cracks
  b.vline(15 + flicker, 14, 16, 5);
  b.vline(20, 16, 12, 6);
  b.hline(12, 20, 12, 5);
  b.rect(18, 24, 6, 1, 6);
  b.p(13, 18, 6);
  b.p(22, 28, 5);
  // cloak hem
  b.rect(8, 32, 6, 6, 2);
  b.rect(22, 32, 6, 6, 3);
}

function paintHand(b, f) {
  const pulse = f % 2;
  // palm
  b.shade(14, 14, 36, 18, 2, 3, 4);
  b.rect(16, 16, 32, 14, 3);
  // four fingers pointing up
  for (let i = 0; i < 4; i += 1) {
    const x = 16 + i * 9;
    b.shade(x, 2, 7, 16, 2, 3, 4);
    b.rect(x + 1, 4, 5, 12, 3);
    b.rect(x + 2, 2, 3, 3, 4);
  }
  // thumb
  b.shade(4, 18, 12, 8, 2, 3, 4);
  b.rect(4, 20, 10, 5, 3);
  // gold cracks
  b.rect(28, 8, 2, 20, 5);
  b.rect(22, 18, 16, 2, 5);
  b.rect(36, 12 + pulse, 2, 14, 6);
  b.p(24, 22, 6);
  b.p(40, 16, 5);
  b.p(18, 10, 6);
}

function paintDario(b, f) {
  const scan = f;
  // shoulders / coat
  b.shade(4, 20, 24, 10, 2, 3, 3);
  b.rect(6, 22, 20, 6, 3);
  b.rect(14, 20, 4, 8, 5); // gold tie knot
  // head
  b.shade(8, 8, 16, 14, 6, 6, 6);
  b.rect(10, 10, 12, 10, 6);
  // dark hair, tidy
  b.rect(8, 6, 16, 5, 2);
  b.rect(7, 8, 4, 7, 2);
  b.rect(21, 8, 4, 6, 2);
  // gold glasses, cold
  b.rect(10, 13, 5, 4, 5);
  b.rect(17, 13, 5, 4, 5);
  b.hline(15, 14, 2, 5);
  b.p(12, 14, 1); b.p(19, 14, 1);
  // closed smug-polite mouth
  b.hline(13, 20, 6, 2);
  b.p(18, 19, 2);
  // cyan scanlines over the bust
  for (let y = 8; y < 30; y += 2) {
    if ((y + scan) % 4 === 0) b.hline(6, y, 20, 4);
  }
}

function paintStele(b, f) {
  const glow = f % 2 ? 6 : 5;
  b.shade(4, 4, 16, 26, 2, 3, 4);
  b.rect(6, 6, 12, 22, 3);
  // engraved bars
  b.hline(7, 10, 10, 1);
  b.hline(7, 14, 10, 1);
  b.hline(8, 18, 8, 1);
  // red refusal seal
  b.disk(12, 24, 3, glow);
  b.disk(12, 24, 1, 1);
}

function paintFlask(b, f, kind) {
  // green PCB card
  b.shade(2, 4, 12, 10, 2, 3, 4);
  b.rect(3, 5, 10, 8, 3);
  // fan
  const spin = f;
  b.disk(8, 9, 3, 5);
  b.p(8 + (spin % 2), 8, 4);
  b.p(8, 9, 6);
  // gold pins
  b.rect(4, 14, 2, 2, 7);
  b.rect(8, 14, 2, 2, 7);
  b.rect(12, 14, 2, 2, 7);
  if (kind === 0) { // 5090
    b.hline(4, 6, 8, 6);
  } else if (kind === 1) { // H200
    b.rect(5, 6, 2, 3, 6);
    b.rect(8, 6, 3, 1, 6);
    b.rect(8, 8, 3, 1, 6);
  } else {
    b.rect(5, 6, 6, 1, 6);
    b.rect(5, 6, 2, 3, 6);
    b.rect(5, 8, 5, 1, 6);
  }
}

/* bullets: 12×12, 2 frames */
function paintFin(b, f) {
  const t = f ? 1 : 0;
  b.rect(2, 5, 8, 3, 3);
  b.rect(3, 4, 6, 5, 4);
  b.p(1, 6, 4);
  b.rect(8, 5 + t, 3, 2, 5);
  b.p(6, 6, 5);
}
function paintOrb(b, f) {
  b.disk(6, 6, 4, 3);
  b.disk(6, 6, 3, 4);
  b.disk(6, 6, 1, 5);
  if (f) { b.p(2, 2, 5); b.p(10, 3, 5); b.p(3, 10, 4); }
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
  b.p(6, 2, 5); b.p(6, 10, 5);
  b.p(2, 6, 5); b.p(10, 6, 5);
  if (f) { b.p(3, 3, 5); b.p(9, 9, 5); }
}
function paintHammerBolt(b) {
  b.rect(3, 4, 7, 5, 3);
  b.rect(4, 5, 5, 3, 5);
  b.rect(5, 2, 3, 8, 4);
}

const PAL = {
  deepseek: ['#1b1530', '#163056', '#2f6fe4', '#7eb6ff', '#d7f4ff', '#c48a72', '#f0c8b4', '#ffe8dc', '#5ad8ff', '#9ef6ff', '#ffffff'],
  kimi: ['#1b1530', '#121a33', '#24365c', '#3a5078', '#8aa0c8', '#d8b15a', '#e8d0b0', '#f4f1ea', '#d5deea'],
  glm: ['#1b1530', '#3a1860', '#6d3fa0', '#9a6ad4', '#d4b0ff', '#8a6a20', '#d8b15a', '#f4e0a8', '#f0c8b4'],
  haiku: ['#1b1530', '#c8b8a8', '#f4f1ea', '#ffffff', '#d0c4b0', '#e07a5f', '#f0c8b4', '#f4e8a0'],
  sonnet: ['#1b1530', '#c8b8a0', '#f4f1ea', '#ffffff', '#d8b15a', '#8a3a28', '#e07a5f', '#ffe08a'],
  opus: ['#1b1530', '#c8b8a0', '#f4f1ea', '#ffffff', '#8a6a20', '#d8b15a', '#c23b3b', '#ffe08a', '#e07a5f'],
  astra: ['#1b1530', '#b8c4d0', '#e8eef4', '#ffffff', '#d8b15a', '#2a2438', '#f0c8b4', '#c8b8e0', '#c5b4e8'],
  fable: ['#1b1530', '#140818', '#2a1038', '#4a2060', '#d8b15a', '#ffe08a'],
  dario: ['#1b1530', '#0a2024', '#10343a', '#1a5058', '#7ad4c8', '#d8b15a', '#f4f1ea'],
  stele: ['#1b1530', '#6a6054', '#cfc6b8', '#efeae2', '#8a8074', '#c23b3b', '#ff6a6a'],
  flask: ['#1b1530', '#0a2818', '#1a5a32', '#3ddc84', '#9dff9a', '#ffffff', '#d8b15a'],
  fin: ['#1b1530', '#163056', '#2f6fe4', '#7ee0ff', '#ffffff'],
  orb: ['#1b1530', '#24365c', '#8aa0c8', '#f4f1ea', '#ffffff'],
  bolt: ['#1b1530', '#3a1860', '#9a6ad4', '#d8b15a', '#f4e0a8', '#ffffff'],
  petal: ['#1b1530', '#8a3a28', '#e07a5f', '#f4c4b0', '#ffffff'],
  glyph: ['#1b1530', '#8a6a20', '#d8b15a', '#ffe08a', '#ffffff'],
  quill: ['#1b1530', '#c8b8a8', '#f4f1ea', '#e07a5f', '#ffffff'],
  feather: ['#1b1530', '#c8b8a0', '#f4e8d0', '#d8b15a', '#ffffff'],
  node: ['#1b1530', '#8a6a20', '#d8b15a', '#ffe08a', '#ffffff', '#e07a5f'],
  whale: ['#1b1530', '#163056', '#2f6fe4', '#7ee0ff', '#ffffff'],
  star: ['#1b1530', '#24365c', '#d8b15a', '#f4f1ea', '#ffffff'],
  hammer: ['#1b1530', '#3a1860', '#9a6ad4', '#d8b15a', '#ffffff'],
};

const BUILDERS = {
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
  hammer: () => bake(12, 12, 2, PAL.hammer, paintHammerBolt, { ax: 6, ay: 6, fps: 10 }),
};

const FAMILY_ALIAS = [
  ['boss.p3', 'opus'], ['boss.p2', 'sonnet'], ['boss.p1', 'haiku'],
  ['boss', 'haiku'],
  ['fable.hand', 'fablehand'], ['hand', 'fablehand'],
  ['flask.rtx', 'flask_rtx'], ['rtx5090', 'flask_rtx'],
  ['flask.h200', 'flask_h200'], ['h200', 'flask_h200'],
  ['flask.b200', 'flask_b200'], ['b200', 'flask_b200'],
  ['deepseek', 'deepseek'], ['kimi', 'kimi'], ['glm', 'glm'],
  ['haiku', 'haiku'], ['sonnet', 'sonnet'], ['opus', 'opus'],
  ['astra', 'astra'], ['fable', 'fable'], ['dario', 'dario'], ['stele', 'stele'],
  ['whale', 'whale'], ['fin', 'fin'], ['orb', 'orb'], ['bolt', 'bolt'],
  ['petal', 'petal'], ['glyph', 'glyph'], ['quill', 'quill'], ['feather', 'feather'],
  ['node', 'node'], ['star', 'star'], ['hammer', 'hammer'],
];

export function familyOf(id) {
  const key = String(id || '').toLowerCase();
  for (let i = 0; i < FAMILY_ALIAS.length; i += 1) {
    if (key.indexOf(FAMILY_ALIAS[i][0]) >= 0) return FAMILY_ALIAS[i][1];
  }
  return 'deepseek';
}

export function getSheet(family) {
  const fam = BUILDERS[family] ? family : familyOf(family);
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
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const g = c.getContext('2d');
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, c.width, c.height);
  sheet._flash = c;
  return c;
}

/**
 * @param {CanvasRenderingContext2D} g
 * @param {string} id
 * @param {number} x feet x
 * @param {number} y feet y
 * @param {{flip?:boolean, flash?:boolean, frame?:number, pose?:string, alpha?:number, scale?:number, squash?:number, stretch?:number, tint?:string}} [opts]
 */
export function draw(g, id, x, y, opts = {}) {
  const fam = familyOf(id);
  const sheet = getSheet(fam);
  const frames = sheet.frames || 1;
  let frame = opts.frame | 0;
  if (opts.pose === 'hurt' || opts.flash) frame = Math.min(frames - 1, frame);
  frame = ((frame % frames) + frames) % frames;
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
  g.drawImage(img, frame * fw, 0, fw, fh, Math.round(-ax), Math.round(-ay), fw, fh);
  g.restore();
}

export function drawFamily(g, family, x, y, opts) {
  draw(g, family, x, y, opts);
}

export const PROC_IDS = Object.keys(BUILDERS);

export function warmup() {
  const keys = Object.keys(BUILDERS);
  for (let i = 0; i < keys.length; i += 1) getSheet(keys[i]);
}

export function init() { warmup(); }
export function update() {}
export function reset() {}
export { INK };
