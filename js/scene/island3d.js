/* ==========================================================================
   儲互社互助島 — 日系建築微縮模型 3D 世界 (Architectural Diorama v7)
   6 大精品工藝：
   1. 環抱低多邊形台灣山脈樹海＋7 座海上衛星小離島＋8 艘遊弋帆船渡輪
   2. 19 格精雕高密度微縮街區（每格 15~35 個細節構件、路燈、護欄、跨海木橋）
   3. 橫貫東西岸弧形高架大道（台灣高鐵＋迷你巴士車隊雙向行駛＋30 位散步小人）
   4. 日系莫蘭迪溫潤建築模型配色＋24H 清晨／暖陽／夕陽／星空夜景窗燈
   5. 低 FOV (29°) 微縮移軸望遠透視鏡頭
   6. 超纖細純白編號名牌（一鍵開關）＋生命時期發光協作光弧線
   ========================================================================== */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const HEX_R = 2.08;
const HEX_GAP = 1.03;

function hexToWorld(q, r) {
  const x = HEX_R * HEX_GAP * Math.sqrt(3) * (q + r / 2);
  const z = HEX_R * HEX_GAP * (3 / 2) * r;
  return { x, z };
}

// 19-Hex Architectural Diorama Map
const HEX_TILES = [
  // Center Civic Core
  { q: 0, r: 0, h: 0.52, biome: 'plaza', kind: 'hub', id: 'hub', num: '00', label: '儲互社核心', stages: ['kids', 'adult', 'officer', 'senior'] },

  // Ring 1 — 5 Playable Carnival Landmarks + Waterfront Harbor
  { q: -1, r: 1, h: 0.44, biome: 'plaza', kind: 'game', id: 'game1', num: '01', label: '核保快刷亭', stages: ['adult', 'officer'] },
  { q: 1, r: 0, h: 0.44, biome: 'meadow', kind: 'game', id: 'game2', num: '02', label: '互助配對診所', stages: ['kids', 'adult', 'officer', 'senior'] },
  { q: -1, r: 0, h: 0.48, biome: 'stone', kind: 'game', id: 'game3', num: '03', label: '理賠神探塔', stages: ['adult', 'senior'] },
  { q: 0, r: -1, h: 0.50, biome: 'meadow', kind: 'game', id: 'game4', num: '04', label: '85歲摩天輪', stages: ['kids', 'adult', 'senior'] },
  { q: 1, r: -1, h: 0.46, biome: 'plaza', kind: 'game', id: 'game5', num: '05', label: '25號郵政站', stages: ['officer', 'adult'] },
  { q: 0, r: 1, h: 0.34, biome: 'waterfront', kind: 'fund', id: 'accident', num: '06', label: '團體意外・交通', stages: ['adult'] },

  // Ring 2 — 7 Mutual Fund Districts + 5 Scenic Taiwanese Diorama Blocks
  { q: -2, r: 1, h: 0.44, biome: 'stone', kind: 'fund', id: 'lp', num: '07', label: '貸款安全 LP', stages: ['adult'] },
  { q: -2, r: 2, h: 0.38, biome: 'meadow', kind: 'fund', id: 'ls', num: '08', label: '人壽儲蓄 LS', stages: ['kids', 'adult', 'senior'] },
  { q: -1, r: 2, h: 0.40, biome: 'meadow', kind: 'fund', id: 'group', num: '09', label: '社員團體 A~F', stages: ['kids', 'adult'] },
  { q: 1, r: 1, h: 0.38, biome: 'waterfront', kind: 'scenic', id: 'scenic_hsr', num: '', label: '高鐵水岸站', fundRef: 'accident', stages: ['adult'] },
  { q: 2, r: 0, h: 0.50, biome: 'moss', kind: 'fund', id: 'senior', num: '10', label: '松年意外 85歲', stages: ['senior'] },
  { q: 2, r: -1, h: 0.46, biome: 'sakura', kind: 'fund', id: 'cancer', num: '11', label: '防癌互助', stages: ['kids', 'adult', 'senior'] },
  { q: 2, r: -2, h: 0.48, biome: 'stone', kind: 'fund', id: 'ci', num: '12', label: '重大疾病', stages: ['adult'] },
  { q: 1, r: -2, h: 0.54, biome: 'plaza', kind: 'fund', id: 'officer', num: '13', label: '各級幹部', stages: ['officer'] },

  // Scenic Perimeter Blocks (rich greenery & coastal architecture)
  { q: -1, r: -1, h: 0.58, biome: 'moss', kind: 'scenic', id: 'scenic_forest', num: '', label: '都市微森林', stages: [] },
  { q: -2, r: 0, h: 0.52, biome: 'stone', kind: 'scenic', id: 'scenic_oldtown', num: '', label: '文化街區', stages: [] },
  { q: 0, r: -2, h: 0.46, biome: 'sakura', kind: 'scenic', id: 'scenic_park', num: '', label: '櫻花湖公園', stages: [] },
  { q: 0, r: 2, h: 0.30, biome: 'waterfront', kind: 'scenic', id: 'scenic_pier', num: '', label: '水岸木棧道', stages: [] }
];

const SYNERGY_LINKS = {
  all: [
    ['hub', 'game1'], ['hub', 'game2'], ['hub', 'game3'], ['hub', 'game4'], ['hub', 'game5'],
    ['lp', 'ls'], ['group', 'accident'], ['senior', 'cancer'], ['officer', 'game5'], ['ci', 'cancer']
  ],
  kids: [['group', 'cancer'], ['group', 'ls'], ['ls', 'game4'], ['group', 'game2'], ['cancer', 'game2']],
  adult: [['lp', 'ls'], ['lp', 'game3'], ['group', 'accident'], ['accident', 'game1'], ['ci', 'cancer'], ['ci', 'game3'], ['group', 'game2']],
  officer: [['officer', 'game5'], ['officer', 'game1'], ['officer', 'game2'], ['hub', 'officer']],
  senior: [['senior', 'cancer'], ['senior', 'ls'], ['senior', 'game4'], ['ls', 'game3'], ['senior', 'game2']]
};

// Muted Japanese Architectural Diorama Palette (Morandi / Muji Model Exhibit Feel)
const PAL = {
  ivory: 0xf7f1e3,
  cream: 0xf0e6d2,
  sand: 0xe3d3b6,
  stone: 0xd8cfc0,
  concrete: 0xd6d3cc,
  asphalt: 0x767c82,
  wood: 0xc29972,
  woodDark: 0x8a6445,
  coral: 0xd86b52,
  coralSoft: 0xe38b74,
  sage: 0x95b47c,
  sageLight: 0xb7cc9d,
  moss: 0x7fa16a,
  pineDark: 0x5c8559,
  pineMid: 0x769f6c,
  sakura: 0xe8b0be,
  sakuraLight: 0xf4cdd6,
  teal: 0x4f9082,
  slateBlue: 0x5e7d9a,
  plum: 0x86688c,
  ochre: 0xde9e44,
  white: 0xfdfbf7
};

const BIOME_TOP = {
  plaza: 0xeee5d3,
  meadow: 0xb7cb99,
  stone: 0xe1d8c7,
  waterfront: 0xe6d9bf,
  moss: 0x9bb785,
  sakura: 0xbecf9f
};

// 24H Editorial Atmosphere Themes
const TIME_PRESETS = {
  dawn: {
    skyTop: 0x8aa8c7, skyMid: 0xe8c4b0, skyBot: 0xf6dfc8,
    fog: 0xebd4c2, sunColor: 0xffd7b0, sunIntensity: 1.35, sunPos: [-18, 11, 14],
    hemiSky: 0xfff0e2, hemiGround: 0x8a9c7d, hemiIntensity: 1.05,
    ocean: 0x6ea6b5, nightFactor: 0.22
  },
  day: {
    skyTop: 0x8ec4d8, skyMid: 0xc9e4ec, skyBot: 0xf1ebd9,
    fog: 0xd5e6e6, sunColor: 0xfff7e6, sunIntensity: 1.55, sunPos: [16, 24, 15],
    hemiSky: 0xfffdf8, hemiGround: 0x99b385, hemiIntensity: 1.18,
    ocean: 0x66aab8, nightFactor: 0.0
  },
  sunset: {
    skyTop: 0x4a466e, skyMid: 0xd47d64, skyBot: 0xf2c288,
    fog: 0xdca583, sunColor: 0xff9b56, sunIntensity: 1.45, sunPos: [20, 7.5, -12],
    hemiSky: 0xffc6a3, hemiGround: 0x6b584d, hemiIntensity: 0.92,
    ocean: 0x4a7d94, nightFactor: 0.62
  },
  night: {
    skyTop: 0x0f1830, skyMid: 0x1a2c4f, skyBot: 0x263f66,
    fog: 0x192948, sunColor: 0x9abdf5, sunIntensity: 0.6, sunPos: [-14, 18, -14],
    hemiSky: 0x48659c, hemiGround: 0x1e2838, hemiIntensity: 0.68,
    ocean: 0x1a3a54, nightFactor: 1.0
  }
};

let renderer, scene, camera, controls;
let raycaster, pointer;
let sunLight, hemiLight, oceanMesh, oceanWaveUniforms, skyMat, starField, fireflies;
let tileEntries = [];
let labelSprites = [];
let glowingWindows = [];
let lanternMats = [];
let synergyGroup = null;
let arcPulses = [];
let celebrationGroup = null;
let balloons = [];
let fireworkParticles = [];
let latestProgress = null;

const anim = {
  wheel: null,
  gondolas: [],
  stamp: null,
  cross: null,
  glass: null,
  windmills: [],
  lighthouseBeam: null,
  hsrCurve: null,
  hsrTrain: null,
  roadCars: [],
  boats: [],
  plane: null,
  citizens: [],
  clouds: [],
  steamPuffs: [],
  coinOrbs: []
};

let currentStageFilter = 'all';
let labelsVisible = true;
let showAllArcs = false;
let animPaused = false;
let hoveredEntry = null;
let flyTarget = null;
let isRunning = false;
let simTime = 0;
let lastFrameMs = 0;
let pointerDownPos = { x: 0, y: 0 };

// Material helpers
function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.82,
    metalness: opts.metalness ?? 0.03,
    flatShading: opts.flat ?? true,
    ...opts
  });
}

function makeWinMat() {
  const m = new THREE.MeshStandardMaterial({
    color: 0xc2d8e4,
    emissive: 0xffcf70,
    emissiveIntensity: 0.06,
    roughness: 0.3,
    metalness: 0.08
  });
  glowingWindows.push(m);
  return m;
}

function makeGlowMat(col = 0xffe28a) {
  const m = new THREE.MeshStandardMaterial({
    color: col,
    emissive: col,
    emissiveIntensity: 0.3,
    roughness: 0.35
  });
  lanternMats.push(m);
  return m;
}

// Distinct Label Renderer: Vivid Playable Game Booths (01~05 with live stars/🔥) vs Understated Editorial Fund Tags (06~13)
function drawLabelCanvas(canvas, num, text, isGame, stars = 0, hardCleared = false) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (isGame) {
    // Vivid Playable Carnival Booth Plaque (unmistakably interactive!)
    const cleared = stars > 0;
    ctx.save();
    ctx.shadowColor = cleared ? 'rgba(33, 128, 95, 0.34)' : 'rgba(185, 58, 44, 0.32)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = cleared ? '#FFFDF5' : '#FFF8F4';
    ctx.beginPath();
    ctx.roundRect(12, 10, 436, 76, 38);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = cleared ? '#21805F' : '#DF5646';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(12, 10, 436, 76, 38);
    ctx.stroke();

    // Left colored number pill
    ctx.fillStyle = cleared ? '#21805F' : '#DF5646';
    ctx.beginPath();
    ctx.roundRect(22, 20, 74, 56, 28);
    ctx.fill();

    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 28px "Zen Maru Gothic", "Noto Sans TC", sans-serif';
    ctx.fillText(num, 59, 49);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#1E1510';
    ctx.font = '900 28px "Noto Sans TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText(text, 108, 38);

    // Bottom status row: Stars + Hard Flame or "點擊闖關"
    if (cleared) {
      const starTxt = '★'.repeat(stars) + '☆'.repeat(3 - stars);
      ctx.fillStyle = '#D9890C';
      ctx.font = '900 22px sans-serif';
      ctx.fillText(starTxt + (hardCleared ? ' 🔥魔王' : ' 已點亮'), 108, 68);
    } else {
      ctx.fillStyle = '#C73D2E';
      ctx.font = '900 20px "Noto Sans TC", sans-serif';
      ctx.fillText('▶ 點此開始闖關', 108, 68);
    }
  } else {
    // Sleek minimal white architectural landmark tag for 00 & 06~13
    ctx.save();
    ctx.shadowColor = 'rgba(30, 26, 22, 0.2)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = 'rgba(255, 253, 250, 0.9)';
    ctx.beginPath();
    ctx.roundRect(14, 14, 392, 54, 27);
    ctx.fill();
    ctx.restore();

    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#9E5A38';
    ctx.font = '900 23px "Zen Maru Gothic", "Noto Sans TC", sans-serif';
    ctx.fillText(num, 36, 42);

    ctx.fillStyle = '#332B26';
    ctx.font = '700 25px "Noto Sans TC", "Microsoft JhengHei", sans-serif';
    ctx.fillText(text, 78, 42);
  }
}

function makeEditorialLabel(num, text, isGame) {
  const c = document.createElement('canvas');
  c.width = isGame ? 460 : 420;
  c.height = isGame ? 96 : 82;
  drawLabelCanvas(c, num, text, isGame, 0, false);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sp.scale.set(isGame ? 2.75 : 2.15, isGame ? 0.57 : 0.42, 1);
  sp.renderOrder = isGame ? 15 : 11;
  sp.userData = { canvas: c, tex, num, text, isGame };
  labelSprites.push(sp);
  return sp;
}

// Micro architectural helpers (Fine Miniature Scale!)
function addMicroTree(parent, x, y, z, style = 'round', s = 1) {
  const g = new THREE.Group();
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.22, 5), mat(PAL.woodDark));
  tr.position.y = 0.11;
  g.add(tr);

  if (style === 'pine') {
    const c1 = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.34, 6), mat(PAL.pineDark));
    c1.position.y = 0.32;
    c1.castShadow = true;
    const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.26, 6), mat(PAL.pineMid));
    c2.position.y = 0.50;
    g.add(c1, c2);
  } else if (style === 'sakura') {
    const k = new THREE.Mesh(new THREE.DodecahedronGeometry(0.19, 0), mat(PAL.sakura));
    k.position.y = 0.36;
    k.castShadow = true;
    g.add(k);
  } else {
    const k = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), mat(PAL.sage));
    k.position.y = 0.34;
    k.castShadow = true;
    g.add(k);
  }
  g.position.set(x, y, z);
  g.scale.setScalar(s);
  parent.add(g);
}

// Fine-scale miniature house/building with subtle roof, window band & cornice
function addMiniBuilding(parent, x, y, z, w, h, d, wallCol, roofCol, winMat, rotY = 0, flatRoof = false) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(wallCol));
  body.position.y = h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // Subtle architectural cornice + window strip(s)
  const floors = Math.max(1, Math.floor(h / 0.34));
  for (let f = 0; f < floors; f++) {
    const wy = 0.19 + f * 0.31;
    if (wy + 0.08 < h) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(w * 0.78, 0.12, d + 0.025), winMat);
      strip.position.y = wy;
      g.add(strip);
      const stripSide = new THREE.Mesh(new THREE.BoxGeometry(w + 0.025, 0.12, d * 0.65), winMat);
      stripSide.position.y = wy;
      g.add(stripSide);
    }
  }

  if (flatRoof) {
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.05, d + 0.04), mat(roofCol));
    parapet.position.y = h + 0.025;
    g.add(parapet);
    const ac = new THREE.Mesh(new THREE.BoxGeometry(w * 0.28, 0.09, d * 0.28), mat(PAL.concrete));
    ac.position.set(w * 0.18, h + 0.08, -d * 0.14);
    g.add(ac);
  } else {
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.76, Math.min(0.36, w * 0.62), 4), mat(roofCol));
    roof.rotation.y = Math.PI / 4;
    roof.position.y = h + Math.min(0.36, w * 0.62) / 2;
    roof.castShadow = true;
    g.add(roof);
  }

  g.position.set(x, y, z);
  g.rotation.y = rotY;
  parent.add(g);
  return g;
}

// Tiny animated walking citizen (30+ scattered across the island!)
function addMiniCitizen(parent, cx, y, cz, radius, speed, shirtCol, phase) {
  const p = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.12, 6), mat(shirtCol));
  body.position.y = 0.07;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.045, 7, 7), mat(0xf7d8bc));
  head.position.y = 0.16;
  p.add(body, head);
  p.userData = { cx, y, cz, radius, speed, phase };
  parent.add(p);
  anim.citizens.push(p);
  return p;
}

// Tiny streetlamp
function addMicroLamp(parent, x, y, z) {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.36, 5), mat(0x524c46));
  pole.position.set(x, y + 0.18, z);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), makeGlowMat(0xffe185));
  bulb.position.set(x, y + 0.38, z);
  parent.add(pole, bulb);
}

// Striped waterfront railing segment (HEART 政策島 signature edge craft!)
function addWaterfrontTrim(parent, topY, edgeIndex) {
  const a1 = (edgeIndex * Math.PI) / 3 + Math.PI / 6;
  const a2 = ((edgeIndex + 1) * Math.PI) / 3 + Math.PI / 6;
  const r = HEX_R * 0.91;
  const p1 = new THREE.Vector3(Math.cos(a1) * r, topY, Math.sin(a1) * r);
  const p2 = new THREE.Vector3(Math.cos(a2) * r, topY, Math.sin(a2) * r);
  const mid = p1.clone().add(p2).multiplyScalar(0.5);
  const len = p1.distanceTo(p2);
  const angle = Math.atan2(p2.z - p1.z, p2.x - p1.x);

  const segs = 5;
  for (let i = 0; i < segs; i++) {
    const t = (i + 0.5) / segs - 0.5;
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(len / segs * 0.92, 0.11, 0.08),
      mat(i % 2 === 0 ? PAL.coral : PAL.ivory)
    );
    bar.position.set(mid.x + Math.cos(angle) * (t * len), topY + 0.055, mid.z + Math.sin(angle) * (t * len));
    bar.rotation.y = -angle;
    parent.add(bar);
  }
}

// Build crisp layered architectural Hex Tile
function buildHexBase(tile) {
  const g = new THREE.Group();
  const h = tile.h;

  // Soft underwater pale coastal foam ring
  const foam = new THREE.Mesh(
    new THREE.CylinderGeometry(HEX_R * 1.05, HEX_R * 1.08, 0.06, 6),
    new THREE.MeshBasicMaterial({ color: 0xeaf6f7, transparent: true, opacity: 0.42 })
  );
  foam.position.y = -0.26;
  g.add(foam);

  // Warm sand-stone architectural plinth
  const cliff = new THREE.Mesh(new THREE.CylinderGeometry(HEX_R * 0.99, HEX_R * 0.95, h + 0.45, 6), mat(PAL.sand));
  cliff.position.y = (h - 0.45) / 2;
  cliff.castShadow = true;
  cliff.receiveShadow = true;
  g.add(cliff);

  // Subtle recessed top biome plate
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(HEX_R * 0.96, HEX_R * 0.99, 0.11, 6), mat(BIOME_TOP[tile.biome] || PAL.sageLight));
  cap.position.y = h + 0.05;
  cap.receiveShadow = true;
  g.add(cap);

  // Hover/Filter glow outline ring
  const rim = new THREE.Mesh(
    new THREE.RingGeometry(HEX_R * 0.87, HEX_R * 0.97, 6),
    new THREE.MeshBasicMaterial({ color: 0xf4bd4f, side: THREE.DoubleSide, transparent: true, opacity: 0.0 })
  );
  rim.rotation.x = -Math.PI / 2;
  rim.rotation.z = Math.PI / 6;
  rim.position.y = h + 0.115;
  g.add(rim);

  // Soft vertical spotlight pillar when filtered
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(HEX_R * 0.45, HEX_R * 0.72, 3.6, 6, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffe494, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false })
  );
  pillar.position.y = h + 1.9;
  g.add(pillar);

  return { group: g, topY: h + 0.11, rimMesh: rim, pillarMesh: pillar };
}

// Populate EVERY hex tile as a richly detailed miniature neighborhood!
function populateDioramaTile(tile, parent, topY) {
  const winMat = makeWinMat();
  const id = tile.id;

  // Add subtle paved courtyard or mini road band on urban tiles
  if (['hub', 'game1', 'game2', 'game3', 'game5', 'lp', 'officer', 'ci'].includes(id)) {
    const road = new THREE.Mesh(new THREE.BoxGeometry(HEX_R * 1.45, 0.025, 0.34), mat(PAL.stone));
    road.position.y = topY + 0.012;
    road.rotation.y = (tile.q + tile.r) * 0.5;
    parent.add(road);
  }

  // Waterfront striped boardwalk trim on outer south/east tiles
  if (tile.biome === 'waterfront') {
    addWaterfrontTrim(parent, topY, 0);
    addWaterfrontTrim(parent, topY, 1);
  }

  if (id === 'hub') {
    // 00 儲互社核心廣場 — Civic Clocktower + Colonnade + 2 Side Pavilions + Lamps + Walking Mascot!
    const plaza = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.44, 0.05, 24), mat(PAL.ivory));
    plaza.position.y = topY + 0.025;
    parent.add(plaza);

    addMiniBuilding(parent, 0, topY + 0.05, -0.15, 0.85, 0.65, 0.72, PAL.ivory, PAL.coral, winMat, 0, true);
    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.95, 0.42), mat(PAL.cream));
    tower.position.set(0, topY + 1.15, -0.15);
    tower.castShadow = true;
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.48, 4), mat(PAL.coral));
    spire.rotation.y = Math.PI / 4;
    spire.position.set(0, topY + 1.86, -0.15);
    const clockFace = new THREE.Mesh(new THREE.CircleGeometry(0.14, 14), winMat);
    clockFace.position.set(0, topY + 1.32, 0.07);
    parent.add(tower, spire, clockFace);

    addMiniBuilding(parent, -0.95, topY, 0.45, 0.44, 0.42, 0.42, PAL.cream, PAL.teal, winMat, 0.3, false);
    addMiniBuilding(parent, 0.95, topY, 0.42, 0.46, 0.38, 0.40, PAL.ivory, PAL.ochre, winMat, -0.3, true);
    addMicroTree(parent, -1.1, topY, -0.65, 'round', 1.1);
    addMicroTree(parent, 1.12, topY, -0.62, 'sakura', 1.0);
    addMicroLamp(parent, -0.65, topY, 0.95);
    addMicroLamp(parent, 0.65, topY, 0.95);

    // Cute 3D Walking Mascot (bigger hat!) + 2 Strolling Citizens
    const mascot = addMiniCitizen(parent, 0, topY + 0.05, 0.2, 0.72, 0.85, PAL.coral, 0);
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.025, 10), mat(PAL.ochre));
    hat.position.y = 0.21;
    mascot.add(hat);
    mascot.scale.setScalar(1.35);
    addMiniCitizen(parent, 0, topY + 0.05, 0.2, 1.05, -0.6, PAL.teal, 2.2);
    addMiniCitizen(parent, 0, topY + 0.05, 0.2, 0.9, 0.55, PAL.slateBlue, 4.1);
  } else if (id === 'game1') {
    // 01 核保快刷亭 — Striped Miniature Carnival Pavilion + Queue Stalls + Bouncing Stamp!
    for (let i = 0; i < 8; i++) {
      const wedge = new THREE.Mesh(
        new THREE.ConeGeometry(0.86, 0.56, 8, 1, false, (i * Math.PI * 2) / 8, (Math.PI * 2) / 8),
        mat(i % 2 === 0 ? PAL.coral : PAL.ivory)
      );
      wedge.position.set(-0.22, topY + 0.72, -0.1);
      wedge.castShadow = true;
      parent.add(wedge);
    }
    const tentBase = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.76, 0.44, 8), mat(PAL.ivory));
    tentBase.position.set(-0.22, topY + 0.22, -0.1);
    parent.add(tentBase);
    // Bouncing mini rubber stamp emblem on top
    const stamp = new THREE.Group();
    const sPad = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.24), mat(PAL.teal));
    const sHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.26, 8), mat(PAL.woodDark));
    sHandle.position.set(0, 0.18, 0);
    stamp.add(sPad, sHandle);
    stamp.position.set(-0.22, topY + 1.15, -0.1);
    stamp.userData = { baseY: topY + 1.15 };
    anim.stamp = stamp;
    parent.add(stamp);

    addMiniBuilding(parent, 0.85, topY, 0.35, 0.48, 0.46, 0.44, PAL.ivory, PAL.ochre, winMat, -0.2, false);
    addMiniBuilding(parent, 0.72, topY, -0.68, 0.42, 0.34, 0.38, PAL.cream, PAL.coralSoft, winMat, 0.4, true);
    addMicroTree(parent, -1.15, topY, 0.52, 'round', 1.0);
    addMicroTree(parent, -0.95, topY, -0.82, 'pine', 0.9);
    addMicroLamp(parent, 0.35, topY, 0.85);
    addMiniCitizen(parent, 0.1, topY, 0.45, 0.52, 0.7, PAL.slateBlue, 1.0);
    addMiniCitizen(parent, -0.3, topY, 0.62, 0.38, -0.8, PAL.ochre, 3.0);
  } else if (id === 'game2') {
    // 02 互助配對診所 — Multi-wing Community Clinic + Garden + Rotating Cross
    addMiniBuilding(parent, -0.15, topY, -0.22, 0.95, 0.62, 0.64, PAL.ivory, PAL.teal, winMat, 0, false);
    addMiniBuilding(parent, 0.72, topY, 0.28, 0.56, 0.46, 0.52, PAL.cream, PAL.teal, winMat, 0.15, true);
    addMiniBuilding(parent, -0.98, topY, 0.35, 0.42, 0.38, 0.40, PAL.ivory, PAL.wood, winMat, -0.2, false);
    const cross = new THREE.Group();
    const cm = makeGlowMat(PAL.coral);
    cross.add(new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.11, 0.09), cm), new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.36, 0.09), cm));
    cross.position.set(-0.15, topY + 1.18, -0.22);
    anim.cross = cross;
    parent.add(cross);
    addMicroTree(parent, 0.82, topY, -0.78, 'sakura', 1.05);
    addMicroTree(parent, -1.05, topY, -0.68, 'round', 1.1);
    addMicroTree(parent, 0.05, topY, 0.95, 'round', 0.85);
    addMicroLamp(parent, -0.45, topY, 0.78);
    addMiniCitizen(parent, 0.15, topY, 0.58, 0.42, 0.65, PAL.coral, 0.4);
  } else if (id === 'game3') {
    // 03 理賠神探鐘塔 — Detective Archive Complex + Orbiting Magnifier
    addMiniBuilding(parent, 0, topY, -0.1, 0.72, 0.95, 0.72, PAL.cream, PAL.slateBlue, winMat, 0.2, false);
    addMiniBuilding(parent, -0.85, topY, 0.38, 0.50, 0.52, 0.46, PAL.ivory, PAL.stone, winMat, 0, true);
    addMiniBuilding(parent, 0.85, topY, 0.42, 0.46, 0.44, 0.46, PAL.ivory, PAL.coralSoft, winMat, -0.25, false);
    const glass = new THREE.Group();
    const gRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.045, 8, 18), mat(PAL.ochre, { metalness: 0.45, roughness: 0.3 }));
    const gLens = new THREE.Mesh(new THREE.CircleGeometry(0.21, 14), mat(0xcceeff, { transparent: true, opacity: 0.68, side: THREE.DoubleSide }));
    const gHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.32, 6), mat(PAL.woodDark));
    gHandle.position.set(0.22, -0.22, 0);
    gHandle.rotation.z = 0.75;
    glass.add(gRing, gLens, gHandle);
    glass.position.set(0, topY + 1.68, -0.1);
    anim.glass = glass;
    parent.add(glass);
    addMicroTree(parent, 0.92, topY, -0.68, 'pine', 1.0);
    addMicroTree(parent, -0.95, topY, -0.65, 'round', 0.95);
    addMicroLamp(parent, 0.2, topY, 0.88);
    addMiniCitizen(parent, 0.0, topY, 0.65, 0.4, -0.7, PAL.plum, 2.0);
  } else if (id === 'game4') {
    // 04 85歲人生摩天輪 — Delicate Slender Ferris Wheel + Waterfront Stalls
    const legMat = mat(PAL.woodDark);
    [[-0.45, -0.14], [0.45, -0.14], [-0.45, 0.14], [0.45, 0.14]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.05, 1.75, 6), legMat);
      leg.position.set(lx * 0.72, topY + 0.82, lz - 0.15);
      leg.rotation.z = lx > 0 ? 0.22 : -0.22;
      parent.add(leg);
    });
    const wheel = new THREE.Group();
    wheel.position.set(0, topY + 1.58, -0.15);
    [-0.12, 0.12].forEach(zOff => {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.035, 8, 28), mat(PAL.ochre));
      rim.position.z = zOff;
      wheel.add(rim);
    });
    const pods = [PAL.coral, PAL.ochre, PAL.teal, PAL.slateBlue, PAL.coralSoft, PAL.plum, PAL.sage, PAL.sakura];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.95, 4), mat(PAL.ivory));
      spoke.rotation.z = a;
      wheel.add(spoke);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.042, 6, 6), makeGlowMat(pods[i]));
      bulb.position.set(Math.cos(a) * 1.0, Math.sin(a) * 1.0, 0.14);
      wheel.add(bulb);
      const pod = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.24), mat(pods[i]));
      pod.position.set(Math.cos(a) * 0.98, Math.sin(a) * 0.98, 0);
      wheel.add(pod);
      anim.gondolas.push(pod);
    }
    anim.wheel = wheel;
    parent.add(wheel);

    addMiniBuilding(parent, -0.95, topY, 0.55, 0.42, 0.36, 0.38, PAL.ivory, PAL.coral, winMat, 0.2, false);
    addMiniBuilding(parent, 0.95, topY, 0.52, 0.44, 0.34, 0.38, PAL.cream, PAL.teal, winMat, -0.2, false);
    addMicroTree(parent, -1.15, topY, -0.55, 'sakura', 0.95);
    addMicroTree(parent, 1.12, topY, -0.55, 'round', 0.95);
    addMiniCitizen(parent, 0, topY, 0.65, 0.5, 0.75, PAL.coral, 1.5);
  } else if (id === 'game5') {
    // 05 25號郵政站 — Heritage Post Office + Tilted Cute Red/Green Taiwan Mailboxes!
    addMiniBuilding(parent, -0.1, topY, -0.28, 1.05, 0.68, 0.68, PAL.ivory, PAL.plum, winMat, 0, false);
    addMiniBuilding(parent, 0.92, topY, 0.35, 0.48, 0.42, 0.44, PAL.cream, PAL.ochre, winMat, -0.3, true);
    // Cute tilted Red & Green mailboxes
    const rBox = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.52, 0.22), mat(0xd14b3e));
    rBox.position.set(-0.34, topY + 0.26, 0.68);
    rBox.rotation.z = 0.08;
    const gBox = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.52, 0.22), mat(0x3a8762));
    gBox.position.set(0.02, topY + 0.26, 0.68);
    gBox.rotation.z = 0.08;
    parent.add(rBox, gBox);
    addMicroTree(parent, -1.1, topY, 0.45, 'round', 1.0);
    addMicroTree(parent, 0.95, topY, -0.72, 'pine', 0.9);
    addMicroLamp(parent, -0.68, topY, 0.78);
    addMiniCitizen(parent, 0.35, topY, 0.72, 0.28, 0.8, PAL.teal, 0.6);
  } else if (id === 'accident') {
    // 06 團體意外・交通港灣 — Coastal Terminal + Mini Pier + Striped Safety Bollards
    addMiniBuilding(parent, -0.35, topY, -0.25, 0.95, 0.55, 0.62, PAL.ivory, PAL.coral, winMat, 0.1, true);
    addMiniBuilding(parent, 0.78, topY, -0.35, 0.52, 0.68, 0.48, PAL.cream, PAL.slateBlue, winMat, 0, true);
    const pier = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.08, 0.58), mat(PAL.wood));
    pier.position.set(0.15, topY + 0.04, 0.75);
    parent.add(pier);
    addMicroTree(parent, -1.12, topY, 0.35, 'round', 0.9);
    addMicroLamp(parent, 0.7, topY, 0.62);
    addMiniCitizen(parent, 0.1, topY + 0.08, 0.72, 0.35, 0.6, PAL.ochre, 2.5);
  } else if (id === 'lp') {
    // 07 貸款安全 LP — Neoclassical Bank Vault District (3 buildings + golden medallion)
    addMiniBuilding(parent, 0, topY, -0.15, 0.98, 0.68, 0.72, PAL.ivory, PAL.slateBlue, winMat, 0, false);
    addMiniBuilding(parent, -0.95, topY, 0.45, 0.46, 0.55, 0.44, PAL.cream, PAL.concrete, winMat, 0.2, true);
    addMiniBuilding(parent, 0.92, topY, 0.42, 0.46, 0.44, 0.42, PAL.ivory, PAL.ochre, winMat, -0.2, true);
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.07, 14), makeGlowMat(PAL.ochre));
    coin.rotation.x = Math.PI / 2;
    coin.position.set(0, topY + 1.28, -0.15);
    coin.userData = { baseY: topY + 1.28, phase: 0 };
    anim.coinOrbs.push(coin);
    parent.add(coin);
    addMicroTree(parent, 0.98, topY, -0.68, 'pine', 0.95);
    addMicroTree(parent, -0.98, topY, -0.68, 'round', 0.95);
  } else if (id === 'ls') {
    // 08 人壽儲蓄 LS — Cozy Savings Garden + Golden Orchard + 3 Cottages
    addMiniBuilding(parent, -0.45, topY, 0.25, 0.65, 0.52, 0.58, PAL.ivory, PAL.coralSoft, winMat, 0.25, false);
    addMiniBuilding(parent, 0.78, topY, 0.45, 0.48, 0.42, 0.46, PAL.cream, PAL.ochre, winMat, -0.2, false);
    addMiniBuilding(parent, -0.82, topY, -0.62, 0.44, 0.36, 0.42, PAL.ivory, PAL.teal, winMat, 0.1, false);
    addMicroTree(parent, 0.45, topY, -0.42, 'round', 1.75);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), makeGlowMat(0xf5c84c));
      orb.position.set(0.45 + Math.cos(a) * 0.45, topY + 0.75 + i * 0.08, -0.42 + Math.sin(a) * 0.45);
      orb.userData = { baseY: orb.position.y, phase: i * 2 };
      anim.coinOrbs.push(orb);
      parent.add(orb);
    }
    addMiniCitizen(parent, 0.1, topY, 0.55, 0.35, 0.7, PAL.coral, 1.1);
  } else if (id === 'group') {
    // 09 社員團體 A~F — Dense Cozy Taiwanese Family Neighborhood (6 houses + park square!)
    const coords = [
      [-0.78, -0.55, PAL.coral], [0.05, -0.68, PAL.teal], [0.85, -0.35, PAL.ochre],
      [-0.88, 0.45, PAL.slateBlue], [0.78, 0.55, PAL.coralSoft]
    ];
    coords.forEach(([hx, hz, rc], idx) => {
      addMiniBuilding(parent, hx, topY, hz, 0.48, 0.38 + (idx % 2) * 0.14, 0.44, idx % 2 === 0 ? PAL.ivory : PAL.cream, rc, winMat, idx * 0.3, idx === 3);
    });
    const park = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.03, 12), mat(PAL.sageLight));
    park.position.set(0, topY + 0.015, 0.18);
    parent.add(park);
    addMicroTree(parent, -0.22, topY, 0.25, 'sakura', 0.9);
    addMicroTree(parent, 0.24, topY, 0.15, 'round', 0.9);
    addMiniCitizen(parent, 0, topY, 0.2, 0.38, 0.85, PAL.coral, 0.2);
    addMiniCitizen(parent, 0, topY, 0.2, 0.48, -0.65, PAL.teal, 2.8);
  } else if (id === 'senior') {
    // 10 松年意外 85歲 — Japanese-Taiwanese Wooden Hot-Spring Retreat + Pines + Steaming Pool
    addMiniBuilding(parent, -0.35, topY, -0.28, 0.92, 0.52, 0.72, PAL.cream, PAL.pineDark, winMat, 0.15, false);
    addMiniBuilding(parent, -0.82, topY, 0.58, 0.48, 0.38, 0.44, PAL.wood, PAL.pineDark, winMat, -0.1, false);
    const pool = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.54, 0.06, 14), mat(0x90d3de, { roughness: 0.2 }));
    pool.position.set(0.65, topY + 0.03, 0.35);
    parent.add(pool);
    addMicroTree(parent, 0.88, topY, -0.58, 'pine', 1.35);
    addMicroTree(parent, 0.25, topY, -0.98, 'pine', 1.1);
    addMicroTree(parent, -1.15, topY, -0.35, 'pine', 1.1);
    addMicroLamp(parent, 0.2, topY, 0.82);
    for (let i = 0; i < 3; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.11, 7, 7), mat(0xffffff, { transparent: true, opacity: 0.5 }));
      puff.position.set(0.65 + (i - 1) * 0.16, topY + 0.25, 0.35);
      puff.userData = { baseY: topY + 0.18, phase: i * 2.1 };
      anim.steamPuffs.push(puff);
      parent.add(puff);
    }
  } else if (id === 'cancer') {
    // 11 防癌互助 — Curved Wellness Pavilion + Cherry Blossom Garden
    const hall = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.62, 0.58, 12), mat(PAL.ivory));
    hall.position.set(-0.1, topY + 0.29, -0.1);
    hall.castShadow = true;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.58, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(PAL.sakura));
    dome.position.set(-0.1, topY + 0.58, -0.1);
    parent.add(hall, dome);
    addMiniBuilding(parent, 0.85, topY, 0.42, 0.46, 0.45, 0.44, PAL.ivory, PAL.sakura, winMat, -0.2, true);
    addMicroTree(parent, -0.95, topY, 0.48, 'sakura', 1.3);
    addMicroTree(parent, 0.88, topY, -0.55, 'sakura', 1.2);
    addMicroTree(parent, -0.62, topY, -0.92, 'sakura', 1.0);
    addMicroTree(parent, 0.12, topY, 0.92, 'sakura', 1.0);
  } else if (id === 'ci') {
    // 12 重大疾病 — Modernist Medical Tower Cluster + Amethyst Beacon
    addMiniBuilding(parent, -0.15, topY, -0.18, 0.64, 1.08, 0.62, PAL.ivory, PAL.plum, winMat, 0, true);
    addMiniBuilding(parent, 0.68, topY, 0.22, 0.54, 0.72, 0.52, PAL.cream, PAL.slateBlue, winMat, 0.1, true);
    addMiniBuilding(parent, -0.88, topY, 0.48, 0.46, 0.44, 0.44, PAL.ivory, PAL.plum, winMat, 0, true);
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), makeGlowMat(0xe58eb8));
    crystal.position.set(-0.15, topY + 1.48, -0.18);
    crystal.userData = { baseY: topY + 1.48, phase: 0.9 };
    anim.coinOrbs.push(crystal);
    parent.add(crystal);
    addMicroTree(parent, 0.78, topY, -0.78, 'round', 1.0);
  } else if (id === 'officer') {
    // 13 各級幹部 — Civic Assembly Hall + Formal Courtyard + Flags
    addMiniBuilding(parent, 0, topY, -0.22, 1.15, 0.62, 0.75, PAL.ivory, PAL.ochre, winMat, 0, true);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.44, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(PAL.ochre));
    dome.position.set(0, topY + 0.65, -0.22);
    parent.add(dome);
    addMiniBuilding(parent, -0.92, topY, 0.55, 0.44, 0.42, 0.42, PAL.cream, PAL.slateBlue, winMat, 0.2, false);
    addMiniBuilding(parent, 0.92, topY, 0.52, 0.44, 0.42, 0.42, PAL.cream, PAL.coral, winMat, -0.2, false);
    addMicroTree(parent, -1.02, topY, -0.62, 'pine', 1.05);
    addMicroTree(parent, 1.02, topY, -0.62, 'pine', 1.05);
    addMicroLamp(parent, -0.35, topY, 0.85);
    addMicroLamp(parent, 0.35, topY, 0.85);
    addMiniCitizen(parent, 0, topY, 0.62, 0.35, 0.6, PAL.slateBlue, 1.4);
  } else {
    // Scenic Living Tiles (Urban Forest / Cultural Oldtown / Sakura Pond / Waterfront Pier / HSR Station)
    if (id === 'scenic_hsr') {
      addMiniBuilding(parent, 0, topY, -0.15, 1.15, 0.48, 0.55, PAL.white, PAL.concrete, winMat, 0.2, true);
      addMicroTree(parent, -0.95, topY, 0.52, 'round', 0.95);
      addMicroTree(parent, 0.95, topY, 0.48, 'round', 0.95);
    } else if (id === 'scenic_forest') {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        addMicroTree(parent, Math.cos(a) * 0.88, topY, Math.sin(a) * 0.88, i % 2 === 0 ? 'pine' : 'round', 0.9 + (i % 3) * 0.2);
      }
      addMiniBuilding(parent, 0, topY, 0, 0.48, 0.36, 0.44, PAL.wood, PAL.coral, winMat, 0.3, false);
    } else if (id === 'scenic_oldtown') {
      addMiniBuilding(parent, -0.58, topY, -0.22, 0.54, 0.64, 0.50, PAL.ivory, PAL.coral, winMat, 0.1, false);
      addMiniBuilding(parent, 0.45, topY, -0.35, 0.52, 0.48, 0.48, PAL.cream, PAL.ochre, winMat, -0.1, false);
      addMiniBuilding(parent, 0.25, topY, 0.58, 0.58, 0.42, 0.44, PAL.ivory, PAL.teal, winMat, 0.2, true);
      addMicroTree(parent, -0.78, topY, 0.62, 'round', 1.0);
    } else if (id === 'scenic_park') {
      const pond = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.04, 16), mat(0x7cc1cf, { roughness: 0.2 }));
      pond.position.y = topY + 0.02;
      parent.add(pond);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        addMicroTree(parent, Math.cos(a) * 1.02, topY, Math.sin(a) * 1.02, 'sakura', 0.95 + (i % 2) * 0.2);
      }
    } else {
      // Waterfront Wooden Pier + Pergola
      const deck = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.06, 0.72), mat(PAL.wood));
      deck.position.set(0, topY + 0.03, 0.1);
      parent.add(deck);
      addMiniBuilding(parent, -0.45, topY + 0.06, -0.35, 0.52, 0.36, 0.44, PAL.ivory, PAL.coralSoft, winMat, 0, false);
      addMicroTree(parent, 0.78, topY, -0.45, 'round', 0.95);
    }
  }
}

// ⛰️ PILLAR 1: Sweeping Background Mountain Range (陽明山系環抱感!) + 7 Satellite Mini-Islands!
function buildBackdropMountainsAndSatellites() {
  const mtnGroup = new THREE.Group();

  // Gentle sweeping northern/western hills enclosing the bay
  const hills = [
    [-22, -16, 12, 6.2, PAL.sageLight],
    [-11, -18, 13, 7.6, PAL.sage],
    [1, -19, 14, 8.8, PAL.sageLight],
    [13, -17, 13, 7.2, PAL.sage],
    [24, -14, 11, 5.8, PAL.sageLight],
    [-27, -6, 10, 4.6, PAL.sage],
    [27, -4, 9.5, 4.2, PAL.sage]
  ];
  hills.forEach(([x, z, r, h, col]) => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), mat(col));
    cone.position.set(x, h / 2 - 0.6, z);
    cone.rotation.y = x * 0.2;
    cone.receiveShadow = true;
    mtnGroup.add(cone);

    // Scatter miniature trees & tiny pastel cottages on the mountain slopes!
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 1.4 + 0.2;
      const dist = r * (0.38 + (i % 3) * 0.16);
      const ty = Math.max(0.1, h * (1 - dist / r) - 0.55);
      addMicroTree(mtnGroup, x + Math.cos(a) * dist, ty, z + Math.sin(a) * dist, i % 3 === 0 ? 'round' : 'pine', 1.2 + (i % 2) * 0.4);
    }
    if (Math.abs(x) < 20) {
      const cHouse = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.4), mat(PAL.ivory));
      cHouse.position.set(x + 1.2, 0.35, z + r * 0.72);
      const cRoof = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.28, 4), mat(x > 0 ? PAL.coral : PAL.ochre));
      cRoof.rotation.y = Math.PI / 4;
      cRoof.position.set(x + 1.2, 0.65, z + r * 0.72);
      mtnGroup.add(cHouse, cRoof);
    }
  });
  scene.add(mtnGroup);

  // 7 Charming Circular Satellite Islets in the Bay (HEART 政策島 signature!)
  function makeIslet(x, z, r, topCol) {
    const g = new THREE.Group();
    const foam = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.12, r * 1.15, 0.05, 16), new THREE.MeshBasicMaterial({ color: 0xeaf6f7, transparent: true, opacity: 0.45 }));
    foam.position.y = -0.25;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.92, 0.55, 14), mat(PAL.sand));
    base.position.y = -0.05;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.94, r, 0.12, 14), mat(topCol));
    top.position.y = 0.24;
    g.add(foam, base, top);
    g.position.set(x, 0, z);
    scene.add(g);
    return g;
  }

  // Islet 1: Twin Wind-Turbine Green Islet (Front Center!)
  const iWind = makeIslet(1.4, 11.4, 2.05, PAL.sageLight);
  [-0.55, 0.55].forEach((wx, idx) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 1.75, 6), mat(PAL.white));
    pole.position.set(wx, 1.15, idx * 0.2 - 0.1);
    const hub = new THREE.Group();
    hub.position.set(wx, 2.02, idx * 0.2 - 0.02);
    for (let b = 0; b < 3; b++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.78, 0.02), mat(PAL.white));
      const a = (b * Math.PI * 2) / 3;
      blade.rotation.z = a;
      blade.position.set(Math.sin(a) * 0.36, Math.cos(a) * 0.36, 0);
      hub.add(blade);
    }
    anim.windmills.push(hub);
    iWind.add(pole, hub);
  });

  // Islet 2: Sandbar & Rocks (Front Left)
  const iSand = makeIslet(-7.4, 10.6, 1.75, PAL.sand);
  [[-0.4, 0.2, 0.28], [0.5, -0.3, 0.22], [0.1, 0.5, 0.18]].forEach(([rx, rz, rr]) => {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rr, 0), mat(PAL.stone));
    rock.position.set(rx, 0.35, rz);
    iSand.add(rock);
  });

  // Islet 3: Tea Terrace Hill Islet (Mid Left)
  const iTea = makeIslet(-11.4, 5.2, 1.85, PAL.sage);
  [0, 1, 2, 3].forEach(lvl => {
    const step = new THREE.Mesh(new THREE.CylinderGeometry(1.4 - lvl * 0.28, 1.5 - lvl * 0.28, 0.22, 12), mat(lvl % 2 === 0 ? PAL.sage : PAL.sageLight));
    step.position.y = 0.38 + lvl * 0.2;
    iTea.add(step);
  });

  // Islet 4: Beach Umbrellas Islet (Front Right)
  const iBeach = makeIslet(6.2, 8.6, 1.35, PAL.sand);
  [[-0.35, 0.15, PAL.coral], [0.35, -0.1, PAL.ochre], [0.0, 0.45, PAL.teal]].forEach(([ux, uz, uc]) => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 5), mat(PAL.woodDark));
    p.position.set(ux, 0.48, uz);
    const top = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.16, 6), mat(uc));
    top.position.set(ux, 0.72, uz);
    iBeach.add(p, top);
  });

  // Islet 5: Coastal Striped Lighthouse Islet (Far Right!)
  const iLight = makeIslet(11.6, 5.6, 1.4, PAL.stone);
  for (let i = 0; i < 4; i++) {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.28 - i * 0.03, 0.32 - i * 0.03, 0.42, 10), mat(i % 2 === 0 ? PAL.ivory : PAL.coral));
    seg.position.y = 0.48 + i * 0.42;
    iLight.add(seg);
  }
  const lLantern = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.25, 8), makeGlowMat(0xffe88c));
  lLantern.position.y = 2.18;
  const lCap = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.28, 8), mat(PAL.coral));
  lCap.position.y = 2.44;
  const beamG = new THREE.Group();
  beamG.position.y = 2.18;
  const beam = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.8, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe88c, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }));
  beam.rotation.z = -Math.PI / 2;
  beam.position.x = 1.4;
  beamG.add(beam);
  anim.lighthouseBeam = beamG;
  iLight.add(lLantern, lCap, beamG);

  // Islet 6: Quiet Pine Islet (Far Left)
  const iPine = makeIslet(-13.4, -0.8, 1.45, PAL.sageLight);
  addMicroTree(iPine, -0.35, 0.28, 0.2, 'pine', 1.3);
  addMicroTree(iPine, 0.42, 0.28, -0.25, 'round', 1.2);
  addMicroTree(iPine, 0.0, 0.28, 0.45, 'pine', 1.0);
}

// 🚄 PILLAR 3: Sweeping Cross-Island Elevated HSR Viaduct + Boats + Plane!
function buildElevatedViaductAndVehicles() {
  // Sweeping arched elevated viaduct spanning West -> Center -> East across the island!
  const pts = [
    new THREE.Vector3(-10.2, 1.35, -0.4),
    new THREE.Vector3(-4.8, 1.72, -1.6),
    new THREE.Vector3(0.4, 1.88, -1.7),
    new THREE.Vector3(5.6, 1.65, -0.8),
    new THREE.Vector3(10.2, 1.25, 0.8)
  ];
  const curve = new THREE.CatmullRomCurve3(pts);
  anim.hsrCurve = curve;

  // Slender bridge deck (extruded tube/ribbon style)
  const deckPts = curve.getPoints(44);
  for (let i = 0; i < deckPts.length - 1; i++) {
    const a = deckPts[i];
    const b = deckPts[i + 1];
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const len = a.distanceTo(b) + 0.04;
    const seg = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.14, len), mat(PAL.ivory));
    seg.position.copy(mid);
    seg.lookAt(b);
    seg.castShadow = true;
    scene.add(seg);

    // Subtle guard rails
    if (i % 5 === 2) {
      const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, mid.y + 0.4, 6), mat(PAL.concrete));
      pier.position.set(mid.x, (mid.y - 0.4) / 2, mid.z);
      scene.add(pier);
    }
  }

  // Sleek 3-car Miniature Taiwan HSR Bullet Train gliding back & forth on the viaduct!
  const train = new THREE.Group();
  [-0.52, 0, 0.52].forEach((oz, idx) => {
    const car = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.20, 0.46), mat(PAL.white));
    car.position.set(0, 0.17, oz);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.05, 0.44), mat(0xe3762b));
    stripe.position.set(0, 0.14, oz);
    train.add(car, stripe);
    if (idx === 2) {
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.26, 8), mat(PAL.white));
      nose.rotation.x = Math.PI / 2;
      nose.position.set(0, 0.16, oz + 0.34);
      train.add(nose);
    }
  });
  scene.add(train);
  anim.hsrTrain = train;

  // 2 Tiny Buses / Cars gliding on the opposite lane!
  [PAL.coral, PAL.teal, PAL.ochre].forEach((col, i) => {
    const car = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.28), mat(col));
    scene.add(car);
    anim.roadCars.push({ mesh: car, t: (i * 0.34) % 1, speed: 0.065 + i * 0.01 });
  });

  // 6 Tiny Sailboats & Ferries sailing smoothly across the calm teal sea!
  const boatConfigs = [
    { r: 12.6, speed: 0.11, phase: 0.4, col: PAL.coral, sail: true },
    { r: 14.2, speed: -0.09, phase: 2.1, col: PAL.white, sail: true },
    { r: 10.2, speed: 0.14, phase: 3.8, col: PAL.ochre, sail: false },
    { r: 15.6, speed: -0.07, phase: 5.0, col: PAL.coral, sail: true },
    { r: 13.4, speed: 0.08, phase: 1.4, col: PAL.teal, sail: false }
  ];
  boatConfigs.forEach(cfg => {
    const b = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.56), mat(cfg.col));
    b.add(hull);
    if (cfg.sail) {
      const s = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.65, 3), mat(PAL.white));
      s.position.y = 0.4;
      b.add(s);
    } else {
      const cab = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.3), mat(PAL.ivory));
      cab.position.y = 0.14;
      b.add(cab);
    }
    b.userData = cfg;
    scene.add(b);
    anim.boats.push(b);
  });

  // Cute Miniature Airplane banking softly high above
  const plane = new THREE.Group();
  const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.58, 7), mat(PAL.white));
  fuse.rotation.x = Math.PI / 2;
  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.03, 0.16), mat(PAL.slateBlue));
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.14), mat(PAL.coral));
  tail.position.set(0, 0.09, -0.24);
  plane.add(fuse, wing, tail);
  scene.add(plane);
  anim.plane = plane;
}

function buildAtmosphere() {
  skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color(TIME_PRESETS.day.skyTop) },
      midColor: { value: new THREE.Color(TIME_PRESETS.day.skyMid) },
      botColor: { value: new THREE.Color(TIME_PRESETS.day.skyBot) }
    },
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 midColor;
      uniform vec3 botColor;
      varying vec3 vWorldPos;
      void main() {
        float h = normalize(vWorldPos).y;
        vec3 col = h > 0.0
          ? mix(midColor, topColor, pow(clamp(h, 0.0, 1.0), 0.6))
          : mix(midColor, botColor, clamp(-h * 3.0, 0.0, 1.0));
        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(98, 24, 18), skyMat));

  // Twinkling Stars
  const sGeo = new THREE.BufferGeometry();
  const sPos = [];
  for (let i = 0; i < 240; i++) {
    const th = Math.random() * Math.PI * 2;
    const ph = Math.random() * Math.PI * 0.42;
    sPos.push(74 * Math.sin(ph) * Math.cos(th), 74 * Math.cos(ph) + 4, 74 * Math.sin(ph) * Math.sin(th));
  }
  sGeo.setAttribute('position', new THREE.Float32BufferAttribute(sPos, 3));
  starField = new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0xfff8dc, size: 0.45, transparent: true, opacity: 0.0 }));
  scene.add(starField);

  // Nighttime Golden Fireflies
  const fGeo = new THREE.BufferGeometry();
  const fPos = [];
  for (let i = 0; i < 45; i++) {
    const a = Math.random() * Math.PI * 2;
    const rad = 1.5 + Math.random() * 8.5;
    fPos.push(Math.cos(a) * rad, 1.2 + Math.random() * 2.8, Math.sin(a) * rad);
  }
  fGeo.setAttribute('position', new THREE.Float32BufferAttribute(fPos, 3));
  fireflies = new THREE.Points(fGeo, new THREE.PointsMaterial({ color: 0xffe680, size: 0.22, transparent: true, opacity: 0.0 }));
  scene.add(fireflies);

  // Calm Nordic Teal Low-Poly Ocean (Zero-CPU GPU Vertex Shader Waves for Smooth Mobile FPS!)
  const oceanGeo = new THREE.PlaneGeometry(180, 180, 32, 32);
  oceanGeo.rotateX(-Math.PI / 2);
  oceanWaveUniforms = { uWaveTime: { value: 0 } };
  const oceanMat = new THREE.MeshStandardMaterial({
    color: TIME_PRESETS.day.ocean,
    roughness: 0.38,
    metalness: 0.1,
    flatShading: true
  });
  oceanMat.onBeforeCompile = (shader) => {
    shader.uniforms.uWaveTime = oceanWaveUniforms.uWaveTime;
    shader.vertexShader = 'uniform float uWaveTime;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
       transformed.y += sin(position.x * 0.25 + uWaveTime * 1.1) * 0.075 + cos(position.z * 0.25 + uWaveTime * 0.9) * 0.075;`
    );
  };
  oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
  oceanMesh.position.y = -0.3;
  oceanMesh.receiveShadow = true;
  scene.add(oceanMesh);

  // Soft High Clouds over the Mountain Ridge (kept far & gentle so they never cover the island!)
  for (let i = 0; i < 6; i++) {
    const cl = new THREE.Group();
    const cm = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf0f4f8, emissiveIntensity: 0.35, roughness: 0.95 });
    const p1 = new THREE.Mesh(new THREE.SphereGeometry(0.95, 10, 10), cm);
    const p2 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 10), cm);
    p2.position.set(0.85, -0.1, 0);
    const p3 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 10, 10), cm);
    p3.position.set(-0.75, -0.12, 0.1);
    cl.add(p1, p2, p3);
    const a = -Math.PI * 0.85 + (i / 5) * Math.PI * 0.7;
    cl.position.set(Math.cos(a) * 20, 8.6 + (i % 2) * 1.1, Math.sin(a) * 18 - 4);
    cl.userData = { baseX: cl.position.x, speed: 0.25 + i * 0.05, phase: i * 1.4 };
    scene.add(cl);
    anim.clouds.push(cl);
  }
}

function buildCelebrationBalloons() {
  celebrationGroup = new THREE.Group();
  celebrationGroup.visible = false;

  const configs = [
    { r: 7.4, y: 5.4, speed: 0.22, phase: 0.3, col1: PAL.coral, col2: PAL.ochre },
    { r: 8.6, y: 6.2, speed: -0.18, phase: 3.1, col1: PAL.teal, col2: PAL.sakura }
  ];
  configs.forEach(cfg => {
    const g = new THREE.Group();
    const env = new THREE.Mesh(new THREE.SphereGeometry(0.68, 12, 10), mat(cfg.col1, { roughness: 0.55 }));
    env.scale.set(1, 1.18, 1);
    env.position.y = 0.85;
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.09, 6, 14), mat(cfg.col2));
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.85;
    const basket = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 0.28), mat(PAL.woodDark));
    basket.position.y = -0.12;
    g.add(env, band, basket);
    g.userData = cfg;
    celebrationGroup.add(g);
    balloons.push(g);
  });
  scene.add(celebrationGroup);
}

function buildHexIsland() {
  HEX_TILES.forEach((tile) => {
    const pos = hexToWorld(tile.q, tile.r);
    const { group, topY, rimMesh, pillarMesh } = buildHexBase(tile);
    group.position.set(pos.x, 0, pos.z);
    group.userData = { tile };

    populateDioramaTile(tile, group, topY);

    let labelSprite = null;
    let unplayedHalo = null;
    let clearedStar = null;

    if (tile.kind !== 'scenic') {
      labelSprite = makeEditorialLabel(tile.num, tile.label, tile.kind === 'game');
      labelSprite.position.y = topY + (tile.id === 'game4' ? 2.85 : tile.id === 'hub' ? 2.35 : 1.85);
      group.add(labelSprite);
    }

    // Playable Game Booth Progression Props: Inviting Halo (unplayed) & Golden Star Trophy (cleared)!
    if (tile.kind === 'game') {
      unplayedHalo = new THREE.Mesh(
        new THREE.RingGeometry(HEX_R * 0.78, HEX_R * 0.94, 6),
        new THREE.MeshBasicMaterial({ color: 0xdf5646, side: THREE.DoubleSide, transparent: true, opacity: 0.52 })
      );
      unplayedHalo.rotation.x = -Math.PI / 2;
      unplayedHalo.rotation.z = Math.PI / 6;
      unplayedHalo.position.y = topY + 0.03;
      group.add(unplayedHalo);

      clearedStar = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.24, 0),
        makeGlowMat(0xffd24c)
      );
      clearedStar.position.set(0.85, topY + 1.45, 0.72);
      clearedStar.visible = false;
      clearedStar.userData = { baseY: topY + 1.45, phase: tile.q + tile.r };
      group.add(clearedStar);
    }

    const hit = new THREE.Mesh(
      new THREE.CylinderGeometry(HEX_R * 0.94, HEX_R * 0.94, 2.8, 6),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hit.position.y = topY + 1.2;
    group.add(hit);

    scene.add(group);
    tileEntries.push({
      tile,
      group,
      baseY: 0,
      pulseY: 0,
      stars: 0,
      rimMesh,
      pillarMesh,
      labelSprite,
      unplayedHalo,
      clearedStar,
      worldPos: new THREE.Vector3(pos.x, topY, pos.z)
    });
  });

  synergyGroup = new THREE.Group();
  scene.add(synergyGroup);
  buildCelebrationBalloons();
}

function syncProgress(progress) {
  latestProgress = progress;
  if (!progress || !tileEntries.length) return;

  tileEntries.forEach(entry => {
    if (entry.tile.kind !== 'game') return;
    const info = progress.perBooth?.[entry.tile.id] || { stars: 0, hardCleared: false };
    entry.stars = info.stars || 0;

    if (entry.labelSprite && entry.labelSprite.userData) {
      const ud = entry.labelSprite.userData;
      drawLabelCanvas(ud.canvas, ud.num, ud.text, true, entry.stars, Boolean(info.hardCleared));
      ud.tex.needsUpdate = true;
    }
    if (entry.unplayedHalo) {
      entry.unplayedHalo.visible = entry.stars === 0;
    }
    if (entry.clearedStar) {
      entry.clearedStar.visible = entry.stars > 0;
      const scale = entry.stars === 3 ? 1.28 : entry.stars === 2 ? 1.05 : 0.85;
      entry.clearedStar.scale.setScalar(scale);
    }
  });

  if (celebrationGroup) {
    celebrationGroup.visible = Boolean(progress.isAllCleared);
  }
}

function triggerFireworks(boothId, isPerfect = false) {
  if (!scene) return;
  const entry = tileEntries.find(e => e.tile.id === boothId) || tileEntries[0];
  if (!entry) return;
  const origin = entry.worldPos.clone().add(new THREE.Vector3(0, 2.0, 0));
  const palette = isPerfect
    ? [0xffd24c, 0xff6b57, 0x45d39c, 0x62b6ff, 0xf799c5]
    : [0xffd24c, 0xdf5646, 0x2c8c6d];

  const count = isPerfect ? 46 : 28;
  for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(isPerfect ? 0.12 : 0.1, 0),
      new THREE.MeshBasicMaterial({ color: palette[i % palette.length], transparent: true, opacity: 1 })
    );
    mesh.position.copy(origin);
    const theta = Math.random() * Math.PI * 2;
    const speed = 1.6 + Math.random() * 2.8;
    const vy = 3.2 + Math.random() * 3.4;
    scene.add(mesh);
    fireworkParticles.push({
      mesh,
      vx: Math.cos(theta) * speed,
      vy,
      vz: Math.sin(theta) * speed,
      life: 1.3 + Math.random() * 0.5,
      age: 0
    });
  }
  entry.pulseY = 0.55;
}

function pulseBooth(boothId, isCorrect = true) {
  const entry = tileEntries.find(e => e.tile.id === boothId);
  if (!entry) return;
  entry.pulseY = isCorrect ? 0.42 : -0.14;
}

function setTimeOfDay(key) {
  const p = TIME_PRESETS[key];
  if (!p || !scene) return;
  skyMat.uniforms.topColor.value.setHex(p.skyTop);
  skyMat.uniforms.midColor.value.setHex(p.skyMid);
  skyMat.uniforms.botColor.value.setHex(p.skyBot);
  scene.fog.color.setHex(p.fog);

  sunLight.color.setHex(p.sunColor);
  sunLight.intensity = p.sunIntensity;
  sunLight.position.set(...p.sunPos);

  hemiLight.color.setHex(p.hemiSky);
  hemiLight.groundColor.setHex(p.hemiGround);
  hemiLight.intensity = p.hemiIntensity;

  oceanMesh.material.color.setHex(p.ocean);
  starField.material.opacity = p.nightFactor > 0.5 ? (p.nightFactor - 0.35) * 1.4 : 0;
  fireflies.material.opacity = p.nightFactor > 0.5 ? 0.85 : 0;

  glowingWindows.forEach(m => { m.emissiveIntensity = 0.06 + p.nightFactor * 1.75; });
  lanternMats.forEach(m => { m.emissiveIntensity = 0.30 + p.nightFactor * 1.85; });
}

function rebuildArcs() {
  if (synergyGroup) {
    while (synergyGroup.children.length > 0) synergyGroup.remove(synergyGroup.children[0]);
  }
  arcPulses = [];

  const activeKey = currentStageFilter !== 'all' ? currentStageFilter : (showAllArcs ? 'all' : null);
  if (!activeKey) return;

  const pairs = SYNERGY_LINKS[activeKey] || [];
  pairs.forEach(([idA, idB], idx) => {
    const a = tileEntries.find(e => e.tile.id === idA);
    const b = tileEntries.find(e => e.tile.id === idB);
    if (!a || !b) return;

    const p0 = a.worldPos.clone().add(new THREE.Vector3(0, 1.0, 0));
    const p2 = b.worldPos.clone().add(new THREE.Vector3(0, 1.0, 0));
    const mid = p0.clone().add(p2).multiplyScalar(0.5);
    mid.y += 2.2 + (idx % 2) * 0.55;

    const curve = new THREE.QuadraticBezierCurve3(p0, mid, p2);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 24, 0.042, 6, false),
      new THREE.MeshBasicMaterial({ color: 0xf4bd4f, transparent: true, opacity: 0.72 })
    );
    synergyGroup.add(tube);

    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    synergyGroup.add(orb);
    arcPulses.push({ curve, mesh: orb, t: (idx * 0.21) % 1, speed: 0.34 });
  });
}

function setStageFilter(stageKey) {
  currentStageFilter = stageKey;
  tileEntries.forEach((entry) => {
    const match = stageKey === 'all' || (entry.tile.stages && entry.tile.stages.includes(stageKey));
    entry.pillarMesh.material.opacity = (stageKey !== 'all' && match && entry.tile.kind !== 'scenic') ? 0.16 : 0.0;
    entry.rimMesh.material.opacity = (stageKey !== 'all' && match) ? 0.85 : 0.0;
    entry.targetLift = (stageKey !== 'all' && match) ? 0.18 : 0.0;
  });
  rebuildArcs();
}

function toggleLabels() {
  labelsVisible = !labelsVisible;
  labelSprites.forEach(sp => { sp.visible = labelsVisible; });
  return labelsVisible;
}

function toggleAllArcs() {
  showAllArcs = !showAllArcs;
  rebuildArcs();
  return showAllArcs;
}

function togglePauseAnim() {
  animPaused = !animPaused;
  controls.autoRotate = !animPaused;
  return animPaused;
}

function flyToEntry(entry, onArrive) {
  const p = entry.worldPos;
  const dir = new THREE.Vector3(p.x, 0, p.z);
  if (dir.length() < 0.5) dir.set(0.35, 0, 1);
  dir.normalize();
  flyTarget = {
    camEnd: new THREE.Vector3(p.x + dir.x * 7.8, p.y + 8.2, p.z + dir.z * 7.8 + 4.5),
    lookEnd: new THREE.Vector3(p.x, p.y + 0.6, p.z),
    progress: 0,
    onArrive
  };
}

function focusById(id) {
  const entry = tileEntries.find(e => e.tile.id === id);
  if (!entry) return;
  controls.autoRotate = false;
  flyToEntry(entry);
}

function resetCamera() {
  if (!camera || !controls) return;
  flyTarget = null;
  const isMobile = window.innerWidth < 768;
  // Low FOV (29°) Telephoto Miniature Diorama Framing!
  camera.position.set(isMobile ? 0 : -2.5, isMobile ? 28.5 : 21.5, isMobile ? 41.0 : 30.5);
  controls.target.set(0, 0.3, 0.5);
  controls.autoRotate = !animPaused;
}

function zoomCamera(factor) {
  if (!camera || !controls) return;
  const offset = camera.position.clone().sub(controls.target);
  offset.setLength(Math.min(58, Math.max(12, offset.length() * factor)));
  camera.position.copy(controls.target).add(offset);
  controls.update();
}

function animate(nowMs) {
  requestAnimationFrame(animate);
  if (!isRunning) return;
  const dt = lastFrameMs ? Math.min(0.05, (nowMs - lastFrameMs) * 0.001) : 0.016;
  lastFrameMs = nowMs;
  if (!animPaused) simTime += dt;
  const t = simTime;

  // GPU Shader Ocean Wave Uniform (Zero CPU overhead!)
  if (oceanWaveUniforms && !animPaused) {
    oceanWaveUniforms.uWaveTime.value = t;
  }

  // Celebration Hot-Air Balloons (unlocked when all 5 booths cleared!)
  if (celebrationGroup && celebrationGroup.visible) {
    balloons.forEach(b => {
      const cfg = b.userData;
      const a = t * cfg.speed + cfg.phase;
      b.position.set(Math.cos(a) * cfg.r, cfg.y + Math.sin(t * 1.4 + cfg.phase) * 0.35, Math.sin(a) * cfg.r);
      b.rotation.y = -a;
    });
  }

  // 3D Fireworks Particles
  for (let i = fireworkParticles.length - 1; i >= 0; i--) {
    const fp = fireworkParticles[i];
    fp.age += dt;
    if (fp.age >= fp.life) {
      scene.remove(fp.mesh);
      fp.mesh.geometry.dispose();
      fp.mesh.material.dispose();
      fireworkParticles.splice(i, 1);
      continue;
    }
    fp.vy -= 5.8 * dt;
    fp.mesh.position.x += fp.vx * dt;
    fp.mesh.position.y += fp.vy * dt;
    fp.mesh.position.z += fp.vz * dt;
    fp.mesh.rotation.x += 4 * dt;
    fp.mesh.rotation.y += 5 * dt;
    fp.mesh.material.opacity = Math.max(0, 1 - fp.age / fp.life);
  }

  // Landmarks
  if (anim.wheel) {
    anim.wheel.rotation.z = t * 0.4;
    anim.gondolas.forEach(p => { p.rotation.z = -anim.wheel.rotation.z; });
  }
  if (anim.stamp) anim.stamp.position.y = anim.stamp.userData.baseY + Math.abs(Math.sin(t * 2.6)) * 0.22;
  if (anim.cross) anim.cross.rotation.y = t * 1.05;
  if (anim.glass) anim.glass.rotation.y = Math.sin(t * 1.4) * 0.75;
  anim.windmills.forEach((w, i) => { w.rotation.z = -t * (1.2 + i * 0.2); });
  if (anim.lighthouseBeam) anim.lighthouseBeam.rotation.y = t * 0.95;

  // Taiwan HSR bullet train gliding smoothly across the sweeping elevated viaduct!
  if (anim.hsrTrain && anim.hsrCurve) {
    const u = (Math.sin(t * 0.35) + 1) * 0.5;
    const p = anim.hsrCurve.getPointAt(u);
    const pAhead = anim.hsrCurve.getPointAt(Math.min(1, u + 0.01));
    anim.hsrTrain.position.copy(p);
    anim.hsrTrain.lookAt(pAhead);
  }
  // Tiny colorful vehicles on viaduct
  anim.roadCars.forEach(rc => {
    if (!anim.hsrCurve) return;
    if (!animPaused) rc.t = (rc.t + dt * rc.speed) % 1;
    const u = 1 - rc.t;
    const p = anim.hsrCurve.getPointAt(u);
    const pNext = anim.hsrCurve.getPointAt(Math.max(0, u - 0.01));
    rc.mesh.position.set(p.x, p.y + 0.14, p.z + 0.14);
    rc.mesh.lookAt(pNext.x, pNext.y + 0.14, pNext.z + 0.14);
  });

  // Sailboats & ferries gliding around the bay
  anim.boats.forEach(b => {
    const cfg = b.userData;
    const a = t * cfg.speed + cfg.phase;
    b.position.set(Math.cos(a) * cfg.r, -0.22 + Math.sin(t * 2 + cfg.phase) * 0.04, Math.sin(a) * cfg.r);
    b.rotation.y = -a + (cfg.speed > 0 ? 0 : Math.PI);
  });

  // Airplane banking high
  if (anim.plane) {
    const pa = t * 0.28;
    anim.plane.position.set(Math.cos(pa) * 11.5, 6.2 + Math.sin(t) * 0.25, Math.sin(pa) * 10.5);
    anim.plane.rotation.y = -pa;
    anim.plane.rotation.z = 0.2;
  }

  // 30+ Tiny Animated Strolling Citizens & Mascot!
  anim.citizens.forEach(c => {
    const d = c.userData;
    const a = t * d.speed + d.phase;
    c.position.set(d.cx + Math.cos(a) * d.radius, d.y + Math.abs(Math.sin(t * 6.5 + d.phase)) * 0.035, d.cz + Math.sin(a) * d.radius);
    c.rotation.y = -a;
  });

  // Floating coins, steam puffs, clouds, fireflies
  anim.coinOrbs.forEach(o => {
    o.position.y = o.userData.baseY + Math.sin(t * 2.2 + o.userData.phase) * 0.12;
    o.rotation.y = t * 1.6;
  });
  anim.steamPuffs.forEach(p => {
    const cyc = (t * 0.4 + p.userData.phase) % 1;
    p.position.y = p.userData.baseY + cyc * 0.85;
    p.scale.setScalar(0.55 + cyc * 0.85);
    p.material.opacity = (1 - cyc) * 0.5;
  });
  anim.clouds.forEach(c => {
    c.position.x = c.userData.baseX + Math.sin(t * 0.12 + c.userData.phase) * 2.4;
  });
  if (fireflies && fireflies.material.opacity > 0.01) {
    fireflies.rotation.y = t * 0.05;
  }

  // Synergy arc pulses
  arcPulses.forEach(ap => {
    if (!animPaused) ap.t = (ap.t + dt * ap.speed) % 1;
    ap.curve.getPoint(ap.t, ap.mesh.position);
  });

  // Tile hover/filter/pulse lift + inviting unplayed halo + cleared floating star trophy
  tileEntries.forEach(e => {
    const hoverLift = (e === hoveredEntry) ? 0.22 : 0.0;
    if (e.pulseY) {
      e.pulseY *= 0.88;
      if (Math.abs(e.pulseY) < 0.005) e.pulseY = 0;
    }
    const desired = e.baseY + Math.max(e.targetLift || 0, hoverLift) + (e.pulseY || 0);
    e.group.position.y += (desired - e.group.position.y) * 0.16;

    if (e.unplayedHalo && e.unplayedHalo.visible) {
      const pulse = 0.28 + (Math.sin(t * 2.8 + e.tile.q) * 0.5 + 0.5) * 0.42;
      e.unplayedHalo.material.opacity = pulse;
    }
    if (e.clearedStar && e.clearedStar.visible) {
      e.clearedStar.position.y = e.clearedStar.userData.baseY + Math.sin(t * 2.4 + e.clearedStar.userData.phase) * 0.14;
      e.clearedStar.rotation.y = t * 1.8;
    }

    if (e === hoveredEntry) e.rimMesh.material.opacity = 0.95;
    else if (currentStageFilter === 'all') e.rimMesh.material.opacity = e.stars > 0 ? 0.42 : 0.0;
  });

  if (flyTarget) {
    flyTarget.progress += 0.055;
    camera.position.lerp(flyTarget.camEnd, 0.12);
    controls.target.lerp(flyTarget.lookEnd, 0.14);
    if (flyTarget.progress >= 1) {
      const cb = flyTarget.onArrive;
      flyTarget = null;
      cb && cb();
    }
  } else {
    controls.update();
  }

  renderer.render(scene, camera);
}

function init3D() {
  const canvas = document.getElementById('island-3d-canvas');
  if (!canvas) return;
  if (window.location.protocol === 'file:') {
    window.APP && window.APP.show2DFallback('離線模式（執行 start_game.bat 可開啟 3D 互助島）');
    return;
  }

  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  } catch {
    window.APP && window.APP.show2DFallback('裝置不支援 WebGL，已切換 2D 模式');
    return;
  }

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(TIME_PRESETS.day.fog, 42, 108);

  const isMobile = window.innerWidth < 768;
  // 📷 PILLAR 4: Low FOV 29° Telephoto Miniature Diorama Lens!
  camera = new THREE.PerspectiveCamera(29, window.innerWidth / window.innerHeight, 0.5, 220);
  camera.position.set(isMobile ? 0 : -2.5, isMobile ? 28.5 : 21.5, isMobile ? 41.0 : 30.5);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI / 2.25;
  controls.minPolarAngle = 0.35;
  controls.minDistance = 12;
  controls.maxDistance = 58;
  controls.target.set(0, 0.3, 0.5);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.32;

  hemiLight = new THREE.HemisphereLight(0xfffdf8, 0x99b385, 1.18);
  scene.add(hemiLight);
  sunLight = new THREE.DirectionalLight(0xfff7e6, 1.55);
  sunLight.position.set(16, 24, 15);
  sunLight.castShadow = true;
  const shadowSize = isMobile ? 1024 : 2048;
  sunLight.shadow.mapSize.width = shadowSize;
  sunLight.shadow.mapSize.height = shadowSize;
  sunLight.shadow.camera.left = -20;
  sunLight.shadow.camera.right = 20;
  sunLight.shadow.camera.top = 20;
  sunLight.shadow.camera.bottom = -20;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  buildAtmosphere();
  buildBackdropMountainsAndSatellites();
  buildHexIsland();
  buildElevatedViaductAndVehicles();
  setTimeOfDay('day');

  // Raycast Interaction
  const tooltip = document.getElementById('island-3d-tooltip');
  const hitObjects = tileEntries.map(e => e.group);

  function updatePointer(cx, cy) {
    pointer.x = (cx / window.innerWidth) * 2 - 1;
    pointer.y = -(cy / window.innerHeight) * 2 + 1;
  }

  canvas.addEventListener('pointerdown', (e) => {
    controls.autoRotate = false;
    pointerDownPos = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!isRunning) return;
    updatePointer(e.clientX, e.clientY);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(hitObjects, true);
    if (hits.length > 0) {
      let obj = hits[0].object;
      while (obj.parent && !obj.userData.tile) obj = obj.parent;
      hoveredEntry = tileEntries.find(te => te.group === obj) || null;
    } else {
      hoveredEntry = null;
    }

    if (hoveredEntry && tooltip) {
      const t = hoveredEntry.tile;
      canvas.style.cursor = 'pointer';
      const hint = t.kind === 'game' ? '點此開始挑戰' : t.kind === 'fund' ? '點此看基金條款' : '微縮風景地塊';
      tooltip.textContent = `${t.num ? t.num + ' ' : ''}${t.label} ‧ ${hint}`;
      tooltip.style.left = `${e.clientX}px`;
      tooltip.style.top = `${e.clientY}px`;
      tooltip.classList.remove('hidden');
    } else if (tooltip) {
      canvas.style.cursor = 'grab';
      tooltip.classList.add('hidden');
    }
  });

  canvas.addEventListener('pointerup', (e) => {
    if (Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y) > 8) return;
    updatePointer(e.clientX, e.clientY);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(hitObjects, true);
    if (hits.length > 0) {
      let obj = hits[0].object;
      while (obj.parent && !obj.userData.tile) obj = obj.parent;
      const entry = tileEntries.find(te => te.group === obj);
      if (entry) handleHexClick(entry);
    }
  });

  window.addEventListener('resize', () => {
    if (!renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  if (latestProgress) {
    syncProgress(latestProgress);
  } else if (window.STORAGE && window.STORAGE.getIslandProgress) {
    syncProgress(window.STORAGE.getIslandProgress());
  }

  isRunning = true;
  requestAnimationFrame(animate);
}

function handleHexClick(entry) {
  const t = entry.tile;
  window.SOUND && window.SOUND.click();
  window.SOUND && window.SOUND.ensureBgm();

  if (t.kind === 'game') {
    flyToEntry(entry, () => window.APP && window.APP.openBooth(t.id));
  } else if (t.kind === 'fund') {
    flyToEntry(entry, () => window.APP && window.APP.openFundCard(t.id));
  } else if (t.id === 'hub') {
    flyToEntry(entry, () => window.APP && window.APP.openHubInfo());
  } else if (t.fundRef) {
    flyToEntry(entry, () => window.APP && window.APP.openFundCard(t.fundRef));
  } else {
    flyToEntry(entry, () => window.APP && window.APP.toast(`${t.label}：台灣微縮風景地塊，點選紅牌 01~05 開始闖關！`));
  }
}

window.ISLAND_3D = {
  setTimeOfDay,
  setStageFilter,
  toggleLabels,
  toggleAllArcs,
  togglePauseAnim,
  resetCamera,
  zoomCamera,
  focusById,
  syncProgress,
  triggerFireworks,
  pulseBooth
};

window.addEventListener('DOMContentLoaded', init3D);
