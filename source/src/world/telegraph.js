// OWNER: WS2
// Ground telegraphs. The fill reaching 1 is the hit. contains() is the hit test;
// the mesh is only the read. Shapes: circle, sector, line, ring, fullscreen.
// Fill grows from the origin outward (a ring grows from its inner edge).
// vfx.telegraph is an optional overlay on radial shapes; the gold rim is procedural.

import * as THREE from 'three';
import { EVENTS } from '../core/contracts.js';
import { loadTexture } from '../config/assets.js';

const active = [];
let seq = 1;
let updating = false;
let wipeAfter = false;
let clock = 0;
let overlayTex = null;

const VERT = `
varying vec2 vUv;
varying vec3 vPos;
void main() {
  vUv = uv;
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = `
uniform float uProgress;
uniform float uShape;
uniform float uFeint;
uniform float uTime;
uniform float uHasMap;
uniform float uEdge;
uniform sampler2D uMap;
varying vec2 vUv;
varying vec3 vPos;

void main() {
  float along = vUv.y;
  float across = abs(vUv.x - 0.5) * 2.0;
  float radial = length(vUv - vec2(0.5)) * 2.0;
  float coord = uShape < 0.5 ? radial : along;
  float border = 0.0;
  float fill = 0.0;
  float edge = max(uEdge, 0.012);
  if (uShape < 0.5) {
    border = smoothstep(1.0 - edge * 2.2, 1.0 - edge * 0.55, radial)
      * (1.0 - smoothstep(1.0, 1.0 + edge * 0.35, radial));
    fill = (1.0 - smoothstep(uProgress - 0.004, uProgress + 0.016, radial))
      * (1.0 - smoothstep(0.995, 1.02, radial));
    if (radial > 1.045) discard;
  } else if (uShape < 1.5) {
    float side = smoothstep(0.78, 0.93, across);
    float cap = max(
      smoothstep(0.0, 0.012, along) * (1.0 - smoothstep(0.012, 0.04, along)),
      smoothstep(0.965, 0.99, along)
    );
    border = max(side, cap);
    fill = (1.0 - smoothstep(uProgress - 0.004, uProgress + 0.018, along))
      * (1.0 - smoothstep(0.96, 1.04, across));
    if (across > 1.06 || along < -0.03 || along > 1.04) discard;
  } else {
    border = max(
      smoothstep(0.0, 0.05, along) * (1.0 - smoothstep(0.05, 0.12, along)),
      smoothstep(0.9, 0.97, along)
    );
    fill = (1.0 - smoothstep(uProgress - 0.004, uProgress + 0.02, along))
      * (1.0 - step(1.02, along));
  }
  float frontier = 1.0 - smoothstep(0.0, 0.04, abs(coord - uProgress));
  float pulse = 1.0;
  if (uFeint > 0.5) pulse = 0.28 + 0.72 * abs(sin(uTime * 22.0));
  vec3 red = vec3(0.78, 0.09, 0.07);
  vec3 hot = vec3(0.96, 0.30, 0.12);
  vec3 gold = vec3(1.0, 0.84, 0.42);
  vec3 base = mix(red, hot, clamp(coord, 0.0, 1.0));
  if (uHasMap > 0.5) {
    vec3 tex = texture2D(uMap, clamp(vUv, 0.0, 1.0)).rgb;
    float l = max(tex.r, max(tex.g, tex.b));
    base = mix(base, tex, 0.4 * smoothstep(0.18, 0.62, l));
  }
  float edgeMix = clamp(border + frontier * 0.85, 0.0, 1.0);
  vec3 col = mix(base, gold, edgeMix);
  col += gold * frontier * 0.65;
  float alpha = fill * 0.64 + border * 0.95 + frontier * 0.9;
  alpha *= pulse;
  alpha *= 1.0 + vPos.y * 0.0001;
  if (alpha < 0.035) discard;
  gl_FragColor = vec4(col * alpha, alpha);
}
`;

function overlay() {
  if (overlayTex) return overlayTex;
  try {
    overlayTex = loadTexture('vfx.telegraph');
  } catch {
    overlayTex = null;
  }
  return overlayTex;
}

function originOf(spec) {
  const o = spec.origin;
  if (!o) return { x: 0, z: 0 };
  return { x: o.x || 0, z: o.z || 0 };
}

function directionOf(spec) {
  const d = spec.direction;
  if (!d) return { x: 0, z: 1 };
  const x = d.x || 0;
  const z = d.z || 0;
  const len = Math.hypot(x, z) || 1;
  return { x: x / len, z: z / len };
}

function normalize(spec) {
  const arc = spec.arc != null ? spec.arc : ((spec.arcDeg || 90) * Math.PI) / 180;
  return {
    attack: spec.attack || null,
    shape: spec.shape || 'circle',
    duration: Math.max(0.05, spec.duration || 0.5),
    origin: originOf(spec),
    direction: directionOf(spec),
    radius: spec.radius ?? 2,
    innerRadius: spec.innerRadius ?? 0,
    arc,
    length: spec.length ?? 8,
    width: spec.width ?? 1.2,
    safeZones: (spec.safeZones || []).map((z) => ({ x: z.x, z: z.z, radius: z.radius })),
    onResolve: spec.onResolve || null,
    silent: !!spec.silent,
    feint: !!spec.feint,
  };
}

/**
 * Pure hit test. `spec` is a normalized telegraph spec.
 * @param {number} x
 * @param {number} z
 * @param {import('../core/contracts.js').TelegraphSpec} spec
 */
export function containsPoint(x, z, spec) {
  const dx = x - spec.origin.x;
  const dz = z - spec.origin.z;
  const dist = Math.hypot(dx, dz);
  switch (spec.shape) {
    case 'circle':
      return dist <= spec.radius + 1e-4;
    case 'ring':
      return dist + 1e-4 >= spec.innerRadius && dist <= spec.radius + 1e-4;
    case 'sector': {
      if (dist > spec.radius) return false;
      if (dist < 1e-4) return true;
      const ang = Math.atan2(dz, dx);
      const dir = Math.atan2(spec.direction.z, spec.direction.x);
      let delta = ang - dir;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      return Math.abs(delta) <= spec.arc / 2;
    }
    case 'line': {
      const along = dx * spec.direction.x + dz * spec.direction.z;
      const side = dx * -spec.direction.z + dz * spec.direction.x;
      return along >= -0.05 && along <= spec.length && Math.abs(side) <= spec.width / 2;
    }
    case 'fullscreen': {
      for (const zone of spec.safeZones) {
        if (Math.hypot(x - zone.x, z - zone.z) <= zone.radius) return false;
      }
      return true;
    }
    default:
      return false;
  }
}

function geo(positions, uvs, indices) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

function discGeometry(radius, segments, arcStart, arcLength) {
  const full = arcLength == null;
  const start = full ? 0 : arcStart;
  const sweep = full ? Math.PI * 2 : arcLength;
  const seg = Math.max(3, segments);
  const pos = [0, 0, 0];
  const uv = [0.5, 0.5];
  const idx = [];
  for (let i = 0; i <= seg; i += 1) {
    const a = start + (sweep * i) / seg;
    const c = Math.cos(a);
    const s = Math.sin(a);
    pos.push(c * radius, 0, s * radius);
    uv.push(0.5 + c * 0.5, 0.5 + s * 0.5);
    if (i > 0) idx.push(0, i, i + 1);
  }
  return geo(pos, uv, idx);
}

function lineGeometry(dir, length, width) {
  const px = -dir.z;
  const pz = dir.x;
  const hw = width / 2;
  const corners = [
    [0, -hw, 0, 0],
    [0, hw, 1, 0],
    [length, -hw, 0, 1],
    [length, hw, 1, 1],
  ];
  const pos = [];
  const uv = [];
  for (const [along, side, u, v] of corners) {
    pos.push(dir.x * along + px * side, 0, dir.z * along + pz * side);
    uv.push(u, v);
  }
  return geo(pos, uv, [0, 2, 1, 1, 2, 3]);
}

function ringGeometry(inner, outer, segments) {
  const pos = [];
  const uv = [];
  const idx = [];
  const seg = Math.max(12, segments);
  for (let i = 0; i <= seg; i += 1) {
    const a = (i / seg) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    pos.push(c * inner, 0, s * inner, c * outer, 0, s * outer);
    const u = i / seg;
    uv.push(u, 0, u, 1);
    if (i < seg) {
      const b = i * 2;
      idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
    }
  }
  return geo(pos, uv, idx);
}

function ribbon(x0, z0, x1, z1, width) {
  const dx = x1 - x0;
  const dz = z1 - z0;
  const len = Math.hypot(dx, dz) || 1;
  const px = (-dz / len) * width * 0.5;
  const pz = (dx / len) * width * 0.5;
  const pos = [
    x0 + px, 0.02, z0 + pz,
    x0 - px, 0.02, z0 - pz,
    x1 + px, 0.02, z1 + pz,
    x1 - px, 0.02, z1 - pz,
  ];
  const uv = [0, 0, 1, 0, 0, 1, 1, 1];
  return geo(pos, uv, [0, 2, 1, 1, 2, 3]);
}

const goldMat = new THREE.MeshBasicMaterial({
  color: 0xffe09a,
  transparent: true,
  opacity: 0.95,
  depthWrite: false,
  side: THREE.DoubleSide,
  toneMapped: false,
});

function makeMaterial(shape, feint, edge) {
  const tex = overlay();
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uProgress: { value: 0.02 },
      uShape: { value: shape },
      uFeint: { value: feint ? 1 : 0 },
      uTime: { value: 0 },
      uHasMap: { value: tex && shape < 0.5 ? 1 : 0 },
      uEdge: { value: edge },
      uMap: { value: tex || new THREE.Texture() },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor,
    blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
  });
  mat.polygonOffset = true;
  mat.polygonOffsetFactor = -2;
  mat.polygonOffsetUnits = -2;
  return mat;
}

function addMesh(group, geometry, material) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.userData.ownGeo = true;
  mesh.userData.ownMat = material !== goldMat;
  mesh.renderOrder = 3;
  group.add(mesh);
  return mesh;
}

function buildVisual(spec) {
  const group = new THREE.Group();
  group.position.set(spec.origin.x, 0.1 + (seq % 5) * 0.004, spec.origin.z);
  group.frustumCulled = false;
  let shapeId = 0;
  let edge = 0.045;
  let geometry = null;

  if (spec.shape === 'circle' || spec.shape === 'fullscreen') {
    const radius = spec.shape === 'fullscreen' ? spec.radius : spec.radius;
    shapeId = 0;
    edge = (spec.shape === 'fullscreen' ? 0.42 : 0.16) / Math.max(0.4, radius);
    geometry = discGeometry(radius, spec.shape === 'fullscreen' ? 72 : 48);
  } else if (spec.shape === 'sector') {
    shapeId = 0;
    edge = 0.16 / Math.max(0.4, spec.radius);
    const mid = Math.atan2(spec.direction.z, spec.direction.x);
    geometry = discGeometry(spec.radius, Math.max(10, Math.ceil(spec.arc / 0.12)), mid - spec.arc / 2, spec.arc);
    const a0 = mid - spec.arc / 2;
    const a1 = mid + spec.arc / 2;
    addMesh(group, ribbon(0, 0, Math.cos(a0) * spec.radius, Math.sin(a0) * spec.radius, 0.09), goldMat);
    addMesh(group, ribbon(0, 0, Math.cos(a1) * spec.radius, Math.sin(a1) * spec.radius, 0.09), goldMat);
  } else if (spec.shape === 'line') {
    shapeId = 1;
    edge = 0.08;
    geometry = lineGeometry(spec.direction, spec.length, spec.width);
  } else if (spec.shape === 'ring') {
    shapeId = 2;
    edge = 0.08;
    geometry = ringGeometry(spec.innerRadius, spec.radius, 64);
  } else {
    geometry = discGeometry(2, 16);
  }

  const material = makeMaterial(shapeId, spec.feint, edge);
  const fill = addMesh(group, geometry, material);

  for (const zone of spec.safeZones) {
    const safe = new THREE.Mesh(
      new THREE.CircleGeometry(zone.radius, 32),
      new THREE.MeshBasicMaterial({
        color: 0xdff6ff,
        transparent: true,
        opacity: 0.96,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    );
    safe.rotation.x = -Math.PI / 2;
    safe.position.set(zone.x - spec.origin.x, 0.045, zone.z - spec.origin.z);
    safe.renderOrder = 6;
    safe.frustumCulled = false;
    safe.userData.ownGeo = true;
    safe.userData.ownMat = true;
    const rim = new THREE.Mesh(
      new THREE.RingGeometry(Math.max(0.12, zone.radius - 0.22), zone.radius, 32),
      new THREE.MeshBasicMaterial({
        color: 0xf0c14a,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    );
    rim.rotation.x = -Math.PI / 2;
    rim.position.copy(safe.position);
    rim.position.y += 0.01;
    rim.renderOrder = 7;
    rim.frustumCulled = false;
    rim.userData.ownGeo = true;
    rim.userData.ownMat = true;
    group.add(safe, rim);
  }

  return { group, fill, material };
}

function removeHandle(handle) {
  if (!handle || handle._gone) return;
  handle._gone = true;
  handle.group.removeFromParent();
  handle.group.traverse((obj) => {
    if (obj.userData?.ownGeo && obj.geometry) obj.geometry.dispose();
    if (obj.userData?.ownMat && obj.material && obj.material.dispose) obj.material.dispose();
  });
}

function wipe() {
  for (const handle of active) removeHandle(handle);
  active.length = 0;
}

/**
 * @param {import('../core/contracts.js').GameContext} ctx
 * @param {import('../core/contracts.js').TelegraphSpec} spec
 */
export function spawn(ctx, spec) {
  const norm = normalize(spec);
  if (norm.shape === 'fullscreen') {
    norm.radius = spec.radius > 0 ? spec.radius : (ctx.world?.radius || 20) + 1.6;
  }
  const id = spec.id || `tg-${seq}`;
  seq += 1;
  const visual = buildVisual(norm);
  const handle = {
    id,
    spec: norm,
    elapsed: 0,
    duration: norm.duration,
    group: visual.group,
    fill: visual.fill,
    material: visual.material,
    cancel() {
      handle._drop = true;
      if (handle.spec) handle.spec.onResolve = null;
      handle.elapsed = handle.duration + 1;
    },
    contains(point) {
      return containsPoint(point.x || 0, point.z || 0, norm);
    },
  };
  ctx.scene.add(handle.group);
  active.push(handle);
  ctx.bus.emit(EVENTS.TELEGRAPH_START, {
    attack: norm.attack,
    shape: norm.shape,
    id,
    duration: norm.duration,
  });
  if (!norm.silent) ctx.audio?.playSfx('sfx.telegraph');
  return handle;
}

export function update(ctx, dt) {
  clock += dt > 0 ? dt : 0;
  updating = true;
  try {
    for (let i = active.length - 1; i >= 0; i -= 1) {
      const handle = active[i];
      if (handle._drop || handle._gone) {
        removeHandle(handle);
        active.splice(i, 1);
        continue;
      }
      handle.elapsed += dt;
      const p = Math.min(1, handle.elapsed / handle.duration);
      const uniforms = handle.material && handle.material.uniforms;
      if (uniforms) {
        uniforms.uProgress.value = Math.max(0.015, p);
        uniforms.uTime.value = clock;
      }
      if (handle.elapsed + 1e-4 >= handle.duration) {
        ctx.bus.emit(EVENTS.TELEGRAPH_RESOLVE, {
          attack: handle.spec.attack,
          shape: handle.spec.shape,
          id: handle.id,
          duration: handle.duration,
        });
        const fn = handle.spec.onResolve;
        handle.spec.onResolve = null;
        if (fn) {
          try {
            fn(ctx, handle);
          } catch {
            if (ctx.boss) ctx.boss._silentErrors = (ctx.boss._silentErrors || 0) + 1;
          }
        }
        removeHandle(handle);
        active.splice(i, 1);
      }
    }
  } finally {
    updating = false;
    if (wipeAfter) {
      wipeAfter = false;
      wipe();
    }
  }
}

export function reset(ctx) {
  void ctx;
  if (updating) {
    wipeAfter = true;
    for (const handle of active) {
      handle._drop = true;
      if (handle.spec) handle.spec.onResolve = null;
    }
    return;
  }
  wipe();
}

export function activeList() {
  return active.slice();
}

export function init(ctx) {
  ctx.world.telegraph = {
    spawn: (c, spec) => spawn(c || ctx, spec),
    update,
    reset: () => reset(ctx),
    active: activeList,
  };
}
