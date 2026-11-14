// OWNER: WS3
// Sky-cathedral dressing: sky dome, cloud sea, tiled marble, gold sigil,
// broken column ring, stele billboards, additive light shafts, drifting motes.

import * as THREE from 'three';
import { loadWorldTexture, moteMap } from './arena_tex.js';

/** @type {{ shafts: THREE.Mesh[], motes: THREE.Points, moteSpeed: Float32Array, clouds: THREE.Group, emblem: THREE.Group, vistas: THREE.Mesh[], cutouts: THREE.Mesh[] } | null} */
let fx = null;

function aniso(ctx) {
  const cap = ctx.renderer?.capabilities;
  if (!cap || typeof cap.getMaxAnisotropy !== 'function') return 1;
  return Math.min(8, cap.getMaxAnisotropy() || 1);
}

function billboardCutout(map, w, h) {
  const mat = new THREE.MeshBasicMaterial({
    map,
    color: 0xffffff,
    transparent: true,
    alphaTest: 0.12,
    depthWrite: true,
    side: THREE.DoubleSide,
    fog: true,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.frustumCulled = true;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.visible = false;
  const reveal = () => {
    mesh.visible = true;
  };
  if (map.image && map.image.naturalWidth) reveal();
  else {
    const img = map.image;
    if (img && img.addEventListener) img.addEventListener('load', reveal, { once: true });
  }
  return mesh;
}

function placeFacingCenter(mesh, x, z, y) {
  mesh.position.set(x, y, z);
  mesh.lookAt(0, y, 0);
}

/**
 * @param {import('../core/contracts.js').GameContext} ctx
 * @param {number} radius
 */
export function buildDress(ctx, radius) {
  const { scene } = ctx;
  const a = aniso(ctx);
  const root = new THREE.Group();
  root.name = 'arena-dress';
  scene.add(root);

  // Sky: keep a solid color until the equirect is actually decoded, then swap.
  scene.background = new THREE.Color(0x9cc9f0);
  scene.backgroundIntensity = 1.05;
  scene.fog = new THREE.Fog(0xc5d8ea, 26, 74);
  loadWorldTexture('bg.sky', {
    mapping: THREE.EquirectangularReflectionMapping,
    onLoad: (tex) => {
      tex.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = tex;
    },
  });

  const hemi = new THREE.HemisphereLight(0xd8ecff, 0xe8dcc4, 0.9);
  root.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff3d8, 1.28);
  sun.position.set(14, 24, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 2;
  sun.shadow.camera.far = 64;
  sun.shadow.camera.left = -24;
  sun.shadow.camera.right = 24;
  sun.shadow.camera.top = 24;
  sun.shadow.camera.bottom = -24;
  sun.shadow.bias = -0.0007;
  sun.shadow.normalBias = 0.04;
  sun.target.position.set(0, 0, 0);
  root.add(sun);
  root.add(sun.target);

  const fill = new THREE.DirectionalLight(0xa8c4ea, 0.28);
  fill.position.set(-16, 10, -12);
  root.add(fill);

  if (ctx.renderer) {
    ctx.renderer.shadowMap.enabled = true;
    ctx.renderer.shadowMap.type = THREE.PCFShadowMap;
    ctx.renderer.setClearColor(0x9cc9f0, 1);
  }

  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xf4f1ea,
    roughness: 0.52,
    metalness: 0.08,
  });
  const slabMat = new THREE.MeshStandardMaterial({
    color: 0xeae4d8,
    roughness: 0.7,
    metalness: 0.04,
  });
  const marble = loadWorldTexture('bg.marble', {
    repeat: { x: 1, y: 1 },
    anisotropy: a,
    onLoad: (tex) => {
      floorMat.map = tex;
      floorMat.color.setHex(0xffffff);
      floorMat.needsUpdate = true;
      slabMat.map = tex;
      slabMat.needsUpdate = true;
    },
  });
  void marble;

  const floorGeo = new THREE.CircleGeometry(radius, 96);
  const uv = floorGeo.attributes.uv;
  const pos = floorGeo.attributes.position;
  for (let i = 0; i < uv.count; i += 1) {
    uv.setXY(i, pos.getX(i) / 4.2, pos.getY(i) / 4.2);
  }
  uv.needsUpdate = true;
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.castShadow = false;
  root.add(floor);

  const slab = new THREE.Mesh(
    new THREE.CylinderGeometry(radius - 0.05, radius - 0.35, 0.85, 64, 1, true),
    slabMat,
  );
  slab.position.y = -0.42;
  slab.receiveShadow = true;
  root.add(slab);

  const under = new THREE.Mesh(
    new THREE.CircleGeometry(radius - 0.2, 48),
    new THREE.MeshStandardMaterial({ color: 0xd8d0c2, roughness: 0.9, metalness: 0 }),
  );
  under.rotation.x = Math.PI / 2;
  under.position.y = -0.84;
  root.add(under);

  const goldMat = new THREE.MeshBasicMaterial({
    color: 0xd8b15a,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const rim = new THREE.Mesh(new THREE.RingGeometry(radius - 0.42, radius - 0.04, 96), goldMat);
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = 0.03;
  root.add(rim);
  const inner = new THREE.Mesh(new THREE.RingGeometry(8.05, 8.28, 64), goldMat);
  inner.rotation.x = -Math.PI / 2;
  inner.position.y = 0.032;
  root.add(inner);

  const emblemMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    alphaTest: 0.04,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const emblemMap = loadWorldTexture('bg.emblem', {
    onLoad: (tex) => {
      emblemMat.map = tex;
      emblemMat.opacity = 0.92;
      emblemMat.needsUpdate = true;
    },
  });
  void emblemMap;
  const emblemMesh = new THREE.Mesh(new THREE.CircleGeometry(5.6, 64), emblemMat);
  const emblem = new THREE.Group();
  emblemMesh.rotation.x = -Math.PI / 2;
  emblem.add(emblemMesh);
  emblem.position.y = 0.045;
  root.add(emblem);

  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0xe7e1d6,
    roughness: 0.62,
    metalness: 0.12,
  });
  loadWorldTexture('bg.pillar', {
    repeat: { x: 1, y: 2.2 },
    anisotropy: a,
    onLoad: (tex) => {
      pillarMat.map = tex;
      pillarMat.color.setHex(0xffffff);
      pillarMat.needsUpdate = true;
    },
  });
  const brokenMat = pillarMat;

  for (let i = 0; i < 10; i += 1) {
    const ang = (i / 10) * Math.PI * 2 + 0.12;
    const broken = i % 3 === 0;
    const height = broken ? 2.8 : 5.8;
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.5, height, 12),
      broken ? brokenMat : pillarMat,
    );
    mesh.position.set(Math.cos(ang) * 17.55, height / 2, Math.sin(ang) * 17.55);
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    root.add(mesh);
    if (broken) {
      const stump = new THREE.Mesh(
        new THREE.CylinderGeometry(0.46, 0.5, 0.35, 10),
        brokenMat,
      );
      stump.position.set(Math.cos(ang) * 17.55, 0.18, Math.sin(ang) * 17.55);
      root.add(stump);
    }
  }

  const colMap = loadWorldTexture('bg.column', { fallback: '#ddd6c8' });
  const steleMap = loadWorldTexture('bg.stele', { fallback: '#e8e0d4' });
  const cutouts = [];

  for (let i = 0; i < 8; i += 1) {
    const ang = (i / 8) * Math.PI * 2 + 0.4;
    const h = i % 2 === 0 ? 4.8 : 3.6;
    const col = billboardCutout(colMap, h * 0.42, h);
    placeFacingCenter(col, Math.cos(ang) * 18.7, Math.sin(ang) * 18.7, h * 0.5);
    root.add(col);
    cutouts.push(col);
  }

  for (let i = 0; i < 3; i += 1) {
    const ang = 0.9 + i * 2.1;
    const fallen = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.48, 2.6, 10),
      pillarMat,
    );
    fallen.position.set(Math.cos(ang) * 18.05, 0.42, Math.sin(ang) * 18.05);
    fallen.rotation.z = Math.PI / 2;
    fallen.rotation.y = -ang;
    root.add(fallen);
  }

  for (let i = 0; i < 3; i += 1) {
    const ang = (i / 3) * Math.PI * 2 + 0.55;
    const stele = billboardCutout(steleMap, 1.55, 3.15);
    placeFacingCenter(stele, Math.cos(ang) * 14.6, Math.sin(ang) * 14.6, 1.55);
    root.add(stele);
    cutouts.push(stele);
  }

  const clouds = new THREE.Group();
  const seaMat = new THREE.MeshBasicMaterial({
    color: 0xf2ebe0,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    fog: true,
    side: THREE.DoubleSide,
  });
  const sea = new THREE.Mesh(new THREE.CircleGeometry(120, 48), seaMat);
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -12;
  clouds.add(sea);

  const vistas = [];
  for (let i = 0; i < 4; i += 1) {
    const ang = (i / 4) * Math.PI * 2 + 0.2;
    const vista = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 16),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
        fog: true,
        side: THREE.DoubleSide,
      }),
    );
    vista.position.set(Math.cos(ang) * 58, -1.8, Math.sin(ang) * 58);
    vista.lookAt(0, 0.4, 0);
    vista.visible = false;
    clouds.add(vista);
    vistas.push(vista);
  }
  loadWorldTexture('bg.clouds', {
    onLoad: (tex) => {
      seaMat.map = tex;
      seaMat.color.setHex(0xffffff);
      seaMat.needsUpdate = true;
      for (const v of vistas) {
        v.material.map = tex;
        v.material.needsUpdate = true;
        v.visible = true;
      }
    },
  });
  root.add(clouds);

  const shaftMat = new THREE.MeshBasicMaterial({
    color: 0xffefc4,
    transparent: true,
    opacity: 0.075,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false,
  });
  const shafts = [];
  const shaftSpots = [
    [6.5, 0.35],
    [-4.8, 8.2],
    [9.4, -7.1],
    [-8.6, -5.4],
  ];
  for (let i = 0; i < shaftSpots.length; i += 1) {
    const [x, z] = shaftSpots[i];
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.15, 18, 18, 1, true), shaftMat.clone());
    cone.position.set(x, 10.2, z);
    cone.rotation.x = Math.PI;
    cone.rotation.z = (i % 2 === 0 ? 0.12 : -0.1);
    cone.renderOrder = 2;
    root.add(cone);
    shafts.push(cone);
  }

  const moteCount = 220;
  const motePos = new Float32Array(moteCount * 3);
  const moteSpeed = new Float32Array(moteCount);
  for (let i = 0; i < moteCount; i += 1) {
    const ang = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * (radius - 1.2);
    motePos[i * 3] = Math.cos(ang) * r;
    motePos[i * 3 + 1] = 0.3 + Math.random() * 7.5;
    motePos[i * 3 + 2] = Math.sin(ang) * r;
    moteSpeed[i] = 0.22 + Math.random() * 0.55;
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
  const motes = new THREE.Points(
    moteGeo,
    new THREE.PointsMaterial({
      map: moteMap(),
      color: 0xffe7b0,
      size: 0.16,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: true,
    }),
  );
  motes.frustumCulled = false;
  motes.renderOrder = 3;
  root.add(motes);

  fx = { shafts, motes, moteSpeed, clouds, emblem, vistas, cutouts };
  return root;
}

export function tickDress(ctx, t, dt) {
  if (!fx) return;
  fx.emblem.rotation.y = t * 0.05;
  fx.clouds.rotation.y = t * 0.012;
  const cam = ctx.camera?.position;
  if (cam && fx.cutouts) {
    for (let i = 0; i < fx.cutouts.length; i += 1) {
      const m = fx.cutouts[i];
      m.lookAt(cam.x, m.position.y, cam.z);
    }
  }
  for (let i = 0; i < fx.shafts.length; i += 1) {
    const s = fx.shafts[i];
    s.material.opacity = 0.045 + 0.04 * (0.5 + 0.5 * Math.sin(t * 0.7 + i * 1.3));
    s.rotation.z = (i % 2 === 0 ? 0.12 : -0.1) + Math.sin(t * 0.25 + i) * 0.04;
  }
  const attr = fx.motes.geometry.attributes.position;
  const arr = attr.array;
  const speeds = fx.moteSpeed;
  for (let i = 0; i < speeds.length; i += 1) {
    const i3 = i * 3;
    arr[i3 + 1] += dt * speeds[i];
    if (arr[i3 + 1] > 8.2) arr[i3 + 1] = 0.25;
    arr[i3] += Math.sin(t * 0.35 + i) * dt * 0.18;
    arr[i3 + 2] += Math.cos(t * 0.28 + i * 0.7) * dt * 0.16;
    const d = Math.hypot(arr[i3], arr[i3 + 2]);
    if (d > 19.2) {
      arr[i3] *= 18 / d;
      arr[i3 + 2] *= 18 / d;
    }
  }
  attr.needsUpdate = true;

  const actors = [ctx.player, ctx.boss, ...(ctx.allies || [])];
  for (let i = 0; i < actors.length; i += 1) {
    const mesh = actors[i]?.sprite;
    if (mesh) mesh.castShadow = true;
  }
}
