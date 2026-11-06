// Zen garden on a hilltop in a soft, painterly meadow: a raked gravel bed with moss islands, stone
// groups and a stone lantern; wispy grass and daisies rolling down into layered hills that fade
// into a pale gradient sky, with painted billboard trees on the far hills (a snow blanket in winter).
// You can orbit all the way around the tree.
// Everything here uses small custom shaders with soft gradients, so the palette per
// season lives in one place (PALETTES) and is blended smoothly when the season changes.
import type { Scene } from '@babylonjs/core/scene';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import type { BaseTexture } from '@babylonjs/core/Materials/Textures/baseTexture';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Matrix, Quaternion, Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer';
import '@babylonjs/core/Meshes/thinInstanceMesh';
import '@babylonjs/core/Shaders/ShadersInclude/instancesDeclaration';
import '@babylonjs/core/Shaders/ShadersInclude/instancesVertex';
import { Season } from './season';
import { getBasePath } from './config';

// ─── Layout ──────────────────────────────────────────────────────────────────
// Garden layout is described in (along, side) metres from the tree; along = VIEW is the
// direction the default desktop camera looks.
const VIEW = new Vector3(0.766, 0, -0.643);
const RIGHT = new Vector3(VIEW.z, 0, -VIEW.x); // screen-right for the default camera
const SUN = new Vector3(-0.45, 0.6, 0.66).normalize(); // direction *towards* the sun (lowish, for long soft gradients)

// Garden layout in (along, side) metres from the tree: along points away from the camera.
const GROUND_Y = -0.95;
const BED = { a: 1.5, s: 0.5, halfA: 4.0, halfS: 4.6, corner: 2.4 }; // raked gravel bed (before wobble)
const CURB = 0.5;                                                   // width of the earth bank around the gravel
const PIT = 0.2;                                                    // how far the gravel sits below the lawn
// Moss islands in the gravel: [along, side, radius, mound height]
const ISLANDS: [number, number, number, number][] = [
  [0, 0, 1.9, 0.26],       // the tree
  [3.3, 3.0, 1.15, 0.12],  // tall stone group
  [4.2, -2.4, 0.9, 0.1],   // low stone group
];
// Stones: [along, side, size, stretchX, stretchY, stretchZ]
const STONES: [number, number, number, number, number, number][] = [
  [3.5, 3.25, 0.75, 0.8, 1.7, 0.75],
  [2.8, 2.45, 0.42, 1.25, 0.9, 1.0],
  [3.95, 2.4, 0.28, 1.1, 0.8, 1.0],
  [4.25, -2.3, 0.6, 1.5, 0.7, 1.0],
  [4.85, -2.95, 0.3, 1.0, 0.8, 1.2],
];
const LANTERN = { a: 0.2, s: 4.0 };
const toWorld = (a: number, s: number) => ({ x: VIEW.x * a + RIGHT.x * s, z: VIEW.z * a + RIGHT.z * s });

// ─── Palettes ────────────────────────────────────────────────────────────────
interface Palette {
  grass: Color3;      // lit ground
  grassShade: Color3; // ground in shadow
  root: Color3;       // blade base
  tip: Color3;        // blade tip
  rock: Color3;
  rockShade: Color3;
  fog: Color3;        // horizon colour: the sky's lower band and the haze over distant hills
  skyTop: Color3;
  gravel: Color3;     // raked gravel ridges
  groove: Color3;     // rake grooves
  bladeHeight: number;
  snow: number;       // 0..1: snow blanket over gravel, moss and meadow
  bloom: number;      // 0..1: daisies in the grass (spring only)
  leafLit: Color3;    // round far-off trees: lit / shaded foliage
  leafShade: Color3;
  // Time of day: spring = dawn, summer = noon, fall = dusk, winter = night (the "sun" is the moon).
  sunDir: Vector3;    // towards the sun (or moon)
  sunCol: Color3;     // light on lit surfaces (multiplier)
  ambCol: Color3;     // light in shade (multiplier)
  glow: Color3;       // horizon glow on the sun's side
  night: number;      // 0..1: stars, moon disc, lantern light
  treeShade: number;  // strength of the canopy's shadow (0 in winter: the tree is bare)
}
// Direction towards a sun at the given compass heading (in garden terms) and elevation.
const sunAt = (along: number, side: number, elevationDeg: number) => {
  const h = new Vector3(VIEW.x * along + RIGHT.x * side, 0, VIEW.z * along + RIGHT.z * side).normalize();
  const e = (elevationDeg * Math.PI) / 180;
  return new Vector3(h.x * Math.cos(e), Math.sin(e), h.z * Math.cos(e));
};
const rgb = (r: number, g: number, b: number) => new Color3(r, g, b);
const hex = (h: string) => Color3.FromHexString(h);
const PALETTES: Record<Season, Palette> = {
  [Season.Spring]: {
    grass: hex('#b0cc66'), grassShade: hex('#4f8358'), root: hex('#2b5534'), tip: hex('#cde07a'),
    rock: hex('#a9a698'), rockShade: hex('#6c7a78'), fog: hex('#f2d9cc'), skyTop: hex('#a9bde3'),
    gravel: hex('#ece7d4'), groove: hex('#cbc3ab'), bladeHeight: 1, snow: 0, bloom: 1, leafLit: hex('#a9c96a'), leafShade: hex('#4f7e4a'),
    // Dawn: low sun on the left, peach horizon, warm light, long shadows.
    sunDir: sunAt(1, -0.9, 12), sunCol: rgb(1.12, 0.98, 0.88), ambCol: rgb(0.86, 0.84, 0.96), glow: hex('#ffbf9a'), night: 0, treeShade: 0.75,
  },
  [Season.Summer]: {
    grass: hex('#94c25a'), grassShade: hex('#3f7653'), root: hex('#204a2c'), tip: hex('#b7d968'),
    rock: hex('#a6a497'), rockShade: hex('#647677'), fog: hex('#e3ecef'), skyTop: hex('#7fb4e3'),
    gravel: hex('#ebe7d6'), groove: hex('#c6bfab'), bladeHeight: 1.15, snow: 0, bloom: 0, leafLit: hex('#8fbf5a'), leafShade: hex('#3d6e45'),
    // Noon: high sun, clear blue sky, crisp light.
    sunDir: sunAt(0.3, -0.5, 68), sunCol: rgb(1.06, 1.04, 1.0), ambCol: rgb(0.9, 0.93, 1.0), glow: hex('#fff3d6'), night: 0, treeShade: 1,
  },
  [Season.Fall]: {
    grass: hex('#d2b25e'), grassShade: hex('#8a6a4c'), root: hex('#5e4a26'), tip: hex('#e8cc74'),
    rock: hex('#b8aa98'), rockShade: hex('#7d6e70'), fog: hex('#eea488'), skyTop: hex('#5d6699'),
    gravel: hex('#ede2cd'), groove: hex('#cdb99c'), bladeHeight: 0.95, snow: 0, bloom: 0, leafLit: hex('#e8a24a'), leafShade: hex('#9a4630'),
    // Dusk (about 5 pm): sun sinking ahead of the camera, red glow along the horizon.
    sunDir: sunAt(1, -0.35, 7), sunCol: rgb(1.3, 0.82, 0.58), ambCol: rgb(0.72, 0.62, 0.78), glow: hex('#ff5a32'), night: 0, treeShade: 0.75,
  },
  [Season.Winter]: {
    grass: hex('#f1f3fa'), grassShade: hex('#9ea8cf'), root: hex('#d4dbee'), tip: hex('#ffffff'),
    rock: hex('#9a99ae'), rockShade: hex('#5d5d82'), fog: hex('#1f2850'), skyTop: hex('#070c24'),
    gravel: hex('#f3f5fb'), groove: hex('#d6dbee'), bladeHeight: 0, snow: 1, bloom: 0, leafLit: hex('#d4d7e2'), leafShade: hex('#7d8296'),
    // Night: moonlight, stars, and the lantern lit.
    sunDir: sunAt(1, -0.28, 13), sunCol: rgb(0.55, 0.63, 0.88), ambCol: rgb(0.28, 0.33, 0.55), glow: hex('#2c3a6e'), night: 1, treeShade: 0,
  },
};

// ─── Noise & terrain height ─────────────────────────────────────────────────
const fract = (x: number) => x - Math.floor(x);
const hash = (x: number, z: number) => fract(Math.sin(x * 127.1 + z * 311.7) * 43758.5453);
const smooth = (t: number) => t * t * (3 - 2 * t);
const smoothstep = (a: number, b: number, x: number) => smooth(Math.min(1, Math.max(0, (x - a) / (b - a))));
function noise(x: number, z: number) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = smooth(x - ix), fz = smooth(z - iz);
  const a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1);
  return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
}
function fbm(x: number, z: number, oct = 4) {
  let v = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += amp * noise(x * f, z * f); f *= 2.03; amp *= 0.5; }
  return v / (1 - Math.pow(0.5, oct));
}

// The hill: flat garden on top, grassy slopes down to a wide rolling meadow.
const PLAIN_Y = -11;
const HILL_FOOT = 20;       // metres from the garden edge to the bottom of the slope
// Layered rolling hills: gentle near the tree's hill, bigger further out so distant ridges
// stack up towards the horizon.
function plainHeight(x: number, z: number) {
  const r = Math.hypot(x, z);
  const far = smoothstep(25, 120, r);
  return PLAIN_Y
    + (fbm(x * 0.0065 + 5.2, z * 0.0065, 3) - 0.5) * (10 + 38 * far)
    + (fbm(x * 0.022, z * 0.022, 3) - 0.5) * 5 * (1 - smoothstep(40, 110, r))
    + Math.pow(smoothstep(700, 2000, r), 2) * 20;      // far edge curves up to meet the horizon
}
// Organic edges come from a few smooth sine waves (not hash noise), so the shaders compute
// exactly the same boundaries as the grass placement here. Keep these in sync with GARDEN_GLSL.
const BED_WOBBLE = 0.55;
function wobble(a: number, s: number) {
  return 0.6 * Math.sin(a * 0.9 + 1.3) * Math.cos(s * 0.7) + 0.45 * Math.sin(s * 1.3 + a * 0.4 + 2.1)
    + 0.3 * Math.sin((a - s) * 1.9 + 0.7);
}
// Signed distance to the gravel bed's irregular outline (negative inside).
function bedDistance(along: number, side: number) {
  const qa = Math.abs(along - BED.a) - BED.halfA + BED.corner;
  const qs = Math.abs(side - BED.s) - BED.halfS + BED.corner;
  const box = Math.hypot(Math.max(qa, 0), Math.max(qs, 0)) + Math.min(Math.max(qa, qs), 0) - BED.corner;
  return box + wobble(along, side) * BED_WOBBLE;
}
// Lobed island outline: radius varies with the angle around the island's centre.
const islandRadius = (r: number, theta: number, i: number) =>
  r * (1 + 0.17 * Math.sin(3 * theta + i * 1.7) + 0.1 * Math.sin(5 * theta + i * 2.9 + 1.0) + 0.06 * Math.sin(2 * theta + i * 0.8));
// Signed distance to the nearest moss island, and that island's mound height there.
function islandAt(along: number, side: number) {
  let d = 1e9, mound = 0;
  for (let i = 0; i < ISLANDS.length; i++) {
    const [a, s, r, h] = ISLANDS[i];
    const da = along - a, ds = side - s;
    const di = Math.hypot(da, ds) - islandRadius(r, Math.atan2(ds, da), i);
    if (di < d) d = di;
    mound = Math.max(mound, h * smoothstep(0.15, -r * 0.8, di));
  }
  return { d, mound };
}
export function terrainHeight(x: number, z: number) {
  const along = x * VIEW.x + z * VIEW.z;
  const side = x * RIGHT.x + z * RIGHT.z;
  // Garden on the summit: level gravel, a raised stone curb, soft moss mounds.
  const bed = bedDistance(along, side);
  const { mound } = islandAt(along, side);
  // The gravel sits in a shallow pit; the bank rises softly to the lawn over CURB metres.
  const pit = PIT * (1 - smoothstep(0, CURB, bed));
  const garden = GROUND_Y - pit + mound;
  // A short lawn around the curb, then the slope rounds over and eases out into the meadow.
  const t = smoothstep(CURB + 0.8, HILL_FOOT, bed);
  const lumps = (fbm(x * 0.12 + 3.1, z * 0.12, 3) - 0.5) * 1.2 * 4 * t * (1 - t);
  return garden + (plainHeight(x, z) - garden) * t + lumps;
}

// Static contact shadows of stones, lantern and shrubs, baked into the shaders as blobs.
function shadowBlobs() {
  const blobs: [number, number, number, number][] = []; // x, z, radiusX, radiusZ
  const add = (a: number, s: number, height: number, radius: number) => {
    const { x, z } = toWorld(a, s);
    // A short offset away from the sun keeps the shadow attached to its object's base.
    const off = Math.min(height * 0.22 / SUN.y, radius * 0.8);
    blobs.push([x - SUN.x * off, z - SUN.z * off, radius * 1.15, radius]);
  };
  STONES.forEach(([a, s, size, sx, sy]) => add(a, s, size * sy, size * Math.max(sx, 1)));
  add(LANTERN.a, LANTERN.s, 1.6, 0.5);
  return blobs;
}
const f = (n: number) => n.toFixed(3);
const SHADOW_GLSL = `
float objShadow(vec3 w){
  float sh = 0.0;
  ${shadowBlobs().map(([x, z, rx, rz]) =>
    `sh = max(sh, 1.0 - smoothstep(0.7, 1.0, length((w.xz - vec2(${f(x)}, ${f(z)})) / vec2(${f(rx)}, ${f(rz)}))));`).join('\n  ')}
  return sh;
}`;
const GARDEN_GLSL = `
const vec2 VIEW_XZ = vec2(${f(VIEW.x)}, ${f(VIEW.z)});
const vec2 RIGHT_XZ = vec2(${f(RIGHT.x)}, ${f(RIGHT.z)});
float wobble(vec2 g){
  return 0.6 * sin(g.x * 0.9 + 1.3) * cos(g.y * 0.7) + 0.45 * sin(g.y * 1.3 + g.x * 0.4 + 2.1)
    + 0.3 * sin((g.x - g.y) * 1.9 + 0.7);
}
float bedDist(vec2 g){
  vec2 q = abs(g - vec2(${f(BED.a)}, ${f(BED.s)})) - vec2(${f(BED.halfA - BED.corner)}, ${f(BED.halfS - BED.corner)});
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - ${f(BED.corner)} + wobble(g) * ${f(BED_WOBBLE)};
}
float islandDist(vec2 g){
  float d = 1e3; vec2 q; float th;
  ${ISLANDS.map(([a, s, r], i) => `q = g - vec2(${f(a)}, ${f(s)}); th = atan(q.y, q.x);
  d = min(d, length(q) - ${f(r)} * (1.0 + 0.17 * sin(3.0 * th + ${f(i * 1.7)}) + 0.1 * sin(5.0 * th + ${f(i * 2.9 + 1.0)}) + 0.06 * sin(2.0 * th + ${f(i * 0.8)})));`).join('\n  ')}
  return d;
}`;

// ─── Shaders ─────────────────────────────────────────────────────────────────
const NOISE_GLSL = `
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }`;

// Shared fragment helpers: toon bands, tree shadow, atmospheric haze.
const COMMON_FRAG = `
uniform vec3 sunDir; uniform vec3 cameraPos; uniform vec3 fogColor; uniform float fogDensity;
uniform vec3 shadowCenter; uniform vec2 shadowRadius;
uniform vec3 sunCol; uniform vec3 ambCol; uniform float night; uniform float treeShade;
${NOISE_GLSL}
// Time-of-day light: tint lit surfaces with the sun (or moon) and shaded ones with the sky.
vec3 grade(vec3 c, float lit){ return c * mix(ambCol, sunCol, lit); }
// At night the stone lantern casts a warm pool of light around itself.
vec3 lanternPool(vec3 w){
  float d = length(w.xz - vec2(${f(toWorld(LANTERN.a, LANTERN.s).x)}, ${f(toWorld(LANTERN.a, LANTERN.s).z)}));
  return vec3(1.0, 0.6, 0.26) * night * (1.0 - smoothstep(0.2, 2.8, d)) * 0.6;
}
float treeShadow(vec3 w){
  vec2 d = (w.xz - shadowCenter.xz) / shadowRadius;
  float n = (vnoise(w.xz * 2.5) - 0.5) * 0.35;
  return (1.0 - smoothstep(0.82, 0.92, length(d) + n)) * treeShade;
}
${SHADOW_GLSL}
float allShadow(vec3 w){ return max(treeShadow(w), objShadow(w)); }
// Aerial perspective: distant hills fade into the horizon colour, low valleys a little more.
vec3 haze(vec3 col, vec3 w){
  float dist = length(w - cameraPos);
  float f = 1.0 - exp(-pow(dist * fogDensity, 1.2));
  float mist = smoothstep(-6.0, -26.0, w.y) * 0.3 * smoothstep(20.0, 80.0, dist);
  return mix(col, fogColor, clamp(f + mist, 0.0, 1.0));
}
// The post-process pipeline expects linear colour and converts to display (sRGB) itself, while
// the palette here is authored in display colours: convert on the way out.
vec4 outColor(vec3 c){ return vec4(pow(max(c, vec3(0.0)), vec3(2.2)), 1.0); }
// Soft wrap-around light: long gradients across the hills instead of hard bands.
float softLight(vec3 n){ return smoothstep(-0.25, 0.8, dot(n, sunDir)) * mix(0.82, 1.0, clamp(n.y, 0.0, 1.0)); }`;

const TOON_VERT = `
precision highp float;
attribute vec3 position; attribute vec3 normal;
#ifdef USE_UV
attribute vec2 uv; varying vec2 vUV;
#endif
#ifdef VCOLOR
attribute vec4 color; varying vec4 vColor;
#endif
#include<instancesDeclaration>
uniform mat4 viewProjection;
varying vec3 vW; varying vec3 vN;
void main(){
  #include<instancesVertex>
  vec4 w = finalWorld * vec4(position, 1.0);
  vW = w.xyz; vN = normalize(mat3(finalWorld) * normal);
  #ifdef VCOLOR
  vColor = color;
  #endif
  #ifdef USE_UV
  vUV = uv;
  #endif
  gl_Position = viewProjection * w;
}`;

// Ground: soft-lit meadow, the zen garden on the summit, snow in winter.
const TERRAIN_FRAG = `
precision highp float;
varying vec3 vW; varying vec3 vN;
uniform vec3 grass; uniform vec3 grassShade; uniform vec3 rock; uniform vec3 rockShade;
uniform vec3 gravel; uniform vec3 groove; uniform float snow; uniform float time; uniform vec3 root; uniform vec3 tip;
${COMMON_FRAG}
${GARDEN_GLSL}
void main(){
  vec3 n = normalize(vN);
  float lit = softLight(n);
  float rocky = 1.0 - smoothstep(0.62, 0.74, n.y + (vnoise(vW.xz * 0.6) - 0.5) * 0.12);
  float strata = step(0.5, fract(vW.y * 0.22 + vnoise(vW.xz * 0.15) * 0.6));
  vec3 rk = rock * mix(0.9, 1.04, strata);
  // Meadow: mottled patches of lighter and darker grass, and bands of light rolling over it.
  float patches = vnoise(vW.xz * 0.045) * 0.65 + vnoise(vW.xz * 0.19) * 0.35;
  vec3 gr = grass * mix(0.9, 1.06, smoothstep(0.25, 0.75, patches));
  float gust = smoothstep(0.55, 1.0, sin(dot(vW.xz, vec2(0.05, -0.04)) - time * 0.9 + vnoise(vW.xz * 0.03) * 3.0));
  gr += gust * 0.05 * (1.0 - snow);
  // Painted grass: short brush strokes, combed one way by the wind, plus fine
  // flecks. It fades with distance (no shimmer) and is subdued under snow.
  float dist0 = length(vW - cameraPos);
  // One fixed stroke direction (rotating world positions by a varying angle makes swirls far
  // from the origin); a light warp across the strokes gives them a natural wave.
  const vec2 sd = vec2(0.6216, 0.7833);
  vec2 sq = vec2(dot(vW.xz, sd), dot(vW.xz, vec2(-sd.y, sd.x)));
  sq.y += (vnoise(vW.xz * 0.35) - 0.5) * 0.8;
  float strokes = vnoise(vec2(sq.x * 2.6, sq.y * 15.0)) * 0.6 + vnoise(vec2(sq.x * 6.0, sq.y * 34.0)) * 0.4;
  float flecks = vnoise(vW.xz * 11.0);
  float grassTex = strokes * 0.7 + flecks * 0.3;
  float detail = (1.0 - smoothstep(20.0, 85.0, dist0)) * (1.0 - snow * 0.8);
  // Near the hill the ground takes on the blades' own colour, so the blades blend into it.
  float underBlades = (1.0 - smoothstep(22.0, 42.0, length(vW.xz))) * (1.0 - snow);
  gr = mix(gr, mix(root, tip, 0.68), underBlades * 0.65);
  // Coarser tufts and clumps that still read from far away (down the hill, across the meadow).
  float tufts = vnoise(vec2(sq.x * 1.0, sq.y * 2.6)) * 0.55 + vnoise(vW.xz * 1.3) * 0.45;
  float detailFar = (1.0 - smoothstep(60.0, 260.0, dist0)) * (1.0 - snow * 0.8);
  gr *= mix(1.0, mix(0.84, 1.1, tufts), detailFar);
  gr *= mix(1.0, mix(0.78, 1.14, grassTex), detail);
  gr = mix(gr, root, (1.0 - grassTex) * 0.22 * detail * (1.0 - snow));
  vec3 litCol = mix(gr, rk, rocky);
  vec3 shCol  = mix(grassShade * mix(0.9, 1.05, patches) * mix(1.0, mix(0.82, 1.1, grassTex), detail), rockShade, rocky);

  // Zen garden: raked gravel, stone curb, moss islands.
  vec2 g = vec2(dot(vW.xz, VIEW_XZ), dot(vW.xz, RIGHT_XZ));
  float bed = bedDist(g);
  float isl = islandDist(g);
  float dist = length(vW - cameraPos);
  // Straight rake lines across the bed, rings around the islands.
  float coord = isl < 1.3 ? isl : g.x;
  float lines = sin(coord * 6.2831 / 0.24);
  // Under snow the rake lines only show as faint soft ridges.
  float rake = smoothstep(0.2, 0.85, lines) * smoothstep(16.0, 5.0, dist) * (1.0 - snow * 0.75);
  float speck = h21(floor(vW.xz * 45.0)) * 0.06;
  vec3 gLit = mix(gravel, groove, rake * 0.75) * (0.97 + speck);
  vec3 gSh  = mix(gravel, rockShade, 0.55) * (0.95 + speck) * mix(1.0, 0.92, rake);
  float inBed = step(bed, 0.0) * step(0.0, isl);
  litCol = mix(litCol, gLit, inBed); shCol = mix(shCol, gSh, inBed);
  // Earth bank: the gravel sits in a shallow pit, and its sloped rim is bare soil with a few
  // pebbles, blending into the lawn at the top. A little shade falls on the gravel below it.
  float bankEdge = bed + (vnoise(vW.xz * 3.0) - 0.5) * 0.12;
  float inBank = step(0.0, bed) * (1.0 - smoothstep(${f(CURB - 0.12)}, ${f(CURB + 0.05)}, bankEdge));
  float soilN = vnoise(vW.xz * 6.0) * 0.6 + vnoise(vW.xz * 17.0) * 0.4;
  vec3 soilLit = mix(vec3(0.47, 0.37, 0.27), vec3(0.6, 0.49, 0.36), soilN);
  vec3 soilSh  = mix(vec3(0.3, 0.25, 0.24), vec3(0.38, 0.31, 0.28), soilN);
  float pebble = step(0.93, h21(floor(vW.xz * 38.0)));
  soilLit = mix(soilLit, vec3(0.72, 0.69, 0.62), pebble * 0.6);
  float lip = smoothstep(${f(CURB * 0.45)}, ${f(CURB)}, bankEdge);
  soilLit = mix(soilLit, litCol, lip * 0.6); soilSh = mix(soilSh, shCol, lip * 0.6);
  litCol = mix(litCol, mix(soilLit, grass, snow * 0.85), inBank);
  shCol  = mix(shCol, mix(soilSh, grassShade, snow * 0.85), inBank);
  float underBank = inBed * smoothstep(-0.35, 0.0, bed);
  litCol *= 1.0 - underBank * 0.14; shCol *= 1.0 - underBank * 0.1;
  // Moss islands: deeper green with a soft dark rim.
  float inIsl = step(bed, 0.0) * step(isl, 0.0);
  vec3 moss = grass * mix(mix(0.78, 0.92, vnoise(vW.xz * 3.0)), 1.0, snow);
  litCol = mix(litCol, moss * mix(mix(0.8, 1.0, smoothstep(-0.02, -0.25, isl)), 1.0, snow), inIsl);
  shCol  = mix(shCol, grassShade * 0.9, inIsl);

  lit *= 1.0 - allShadow(vW) * 0.85;
  vec3 col = mix(shCol, litCol, lit);
  // Snow: soft drifts and a few glints.
  float drift = vnoise(vW.xz * 0.9);
  col *= 1.0 - snow * (1.0 - rocky) * smoothstep(0.55, 0.8, drift) * 0.06;
  col += snow * (1.0 - rocky) * step(0.993, h21(floor(vW.xz * 55.0))) * lit * 0.25;
  col = grade(col, lit) + lanternPool(vW);
  gl_FragColor = outColor(haze(col, vW));
}`;

// Stones and the lantern: mottled, banded stone with fine speckles and dark veins, darker where
// it meets the ground, moss on upward faces (snow in winter), and a faint rim light.
const ROCK_FRAG = `
precision highp float;
varying vec3 vW; varying vec3 vN;
uniform vec3 grass; uniform vec3 grassShade; uniform vec3 rock; uniform vec3 rockShade; uniform float snow;
${COMMON_FRAG}
void main(){
  vec3 n = normalize(vN);
  float lit = softLight(n) * (1.0 - treeShadow(vW) * 0.8);
  float mott = vnoise(vW.xz * 3.0 + vW.y * 2.0) * 0.6 + vnoise(vW.xz * 9.0 - vW.y * 7.0) * 0.4;
  float band = vnoise(vec2(vW.y * 7.0, (vW.x + vW.z) * 0.9));
  vec3 base = rock * mix(0.84, 1.08, mott) * mix(0.93, 1.04, band);
  vec3 c = mix(rockShade * mix(0.88, 1.06, mott), base, lit);
  float vein = 1.0 - smoothstep(0.0, 0.016, abs(vnoise(vec2(vW.x * 3.1 + vW.y * 2.3, vW.z * 3.1 - vW.y * 1.4)) - 0.5));
  c *= 1.0 - vein * 0.16;
  c *= 1.0 - step(0.955, h21(floor(vW.xz * 70.0 + vW.y * 41.0))) * 0.22;   // speckles
  c *= mix(0.62, 1.0, smoothstep(${f(GROUND_Y - PIT)}, ${f(GROUND_Y - PIT + 0.45)}, vW.y)); // grounded base
  float rim = pow(1.0 - max(dot(normalize(cameraPos - vW), n), 0.0), 3.0);
  c += rim * lit * 0.07;
  // Moss grows in patches on upward faces; snow covers every top in winter.
  float patchy = mix(smoothstep(0.45, 0.62, vnoise(vW.xz * 2.6 + vW.y * 1.3)), 1.0, snow);
  float mossMask = smoothstep(0.72 - snow * 0.4, 0.88 - snow * 0.4,
    n.y + (vnoise(vW.xz * 6.0 + vW.y) - 0.5) * 0.4) * patchy;
  vec3 moss = mix(grassShade, grass * mix(0.78, 0.95, mott), lit);
  c = mix(c, moss, mossMask);
  c = grade(c, lit) + lanternPool(vW) * 0.6;
  gl_FragColor = outColor(haze(c, vW));
}`;

// Trunk: keeps its painted texture, two light bands and a cool shadow tint.
const TRUNK_FRAG = `
precision highp float;
varying vec3 vW; varying vec3 vN; varying vec2 vUV;
uniform sampler2D albedo; uniform vec3 rockShade;
${COMMON_FRAG}
void main(){
  vec3 n = normalize(vN);
  vec3 tex = pow(texture2D(albedo, vUV).rgb, vec3(1.0 / 2.2)); // glTF colour textures sample as linear
  float lit = softLight(n);
  vec3 shade = tex * mix(vec3(0.6), rockShade * 1.2, 0.35);
  vec3 c = mix(shade, tex * 1.1, lit);
  float rim = pow(1.0 - max(dot(normalize(cameraPos - vW), n), 0.0), 3.0);
  c += rim * 0.12;
  c = grade(c, lit);
  gl_FragColor = outColor(haze(c, vW));
}`;

// Grass blades: thin instances, bent by wind, root-to-tip gradient, rolling gust highlights.
const GRASS_VERT = `
precision highp float;
attribute vec3 position;
#ifdef VCOLOR
attribute vec4 color; varying vec3 vCol;
#endif
#include<instancesDeclaration>
uniform mat4 viewProjection; uniform float time; uniform float bladeHeight; uniform float bloom;
varying vec3 vW; varying float vH; varying float vVar; varying float vGust;
void main(){
  #include<instancesVertex>
  vec3 base = (finalWorld * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  float h = position.y;
  #ifdef VCOLOR
  vec3 lp = position * bloom;                 // daisies only bloom in spring
  #else
  vec3 lp = position;
  #endif
  vec4 w = finalWorld * vec4(lp.x, lp.y * bladeHeight, lp.z, 1.0);
  float gust = sin(dot(base.xz, vec2(0.16, -0.12)) - time * 1.4);
  float sway = sin(time * 2.1 + base.x * 0.8 + base.z * 0.6) * 0.35 + 0.45 + gust * 0.45;
  w.xz += vec2(0.62, -0.78) * sway * h * h * 0.22 * bladeHeight;
  w.y -= abs(sway) * h * h * 0.04 * bladeHeight;
  vW = w.xyz; vH = h;
  vVar = fract(sin(dot(base.xz, vec2(12.9898, 78.233))) * 43758.5453);
  vGust = smoothstep(0.55, 1.0, gust);
  #ifdef VCOLOR
  vCol = color.rgb;
  #endif
  gl_Position = viewProjection * w;
}`;
const GRASS_FRAG = `
precision highp float;
varying vec3 vW; varying float vH; varying float vVar; varying float vGust;
#ifdef VCOLOR
varying vec3 vCol;
#endif
uniform vec3 root; uniform vec3 tip; uniform vec3 grassShade;
${COMMON_FRAG}
void main(){
  #ifdef VCOLOR
  vec3 c = vCol * mix(0.94, 1.04, vVar);                  // daisies: painted stem and petals
  #else
  vec3 c = mix(root, tip * mix(0.9, 1.06, vVar), pow(smoothstep(0.0, 1.0, vH), 1.4));
  c += vGust * vH * 0.07;                               // light rolling over the field
  #endif
  c = mix(c, mix(grassShade, root, vH * 0.6), allShadow(vW) * 0.7);
  c = grade(c, 0.78 - allShadow(vW) * 0.5) + lanternPool(vW) * (0.4 + 0.6 * vH);
  gl_FragColor = outColor(haze(c, vW));
}`;

// Sky: a vertical gradient with the sun (or moon), a horizon glow on its side, stars at night
// and stylised clouds, drawn at the far plane.
const SKY_VERT = `
precision highp float;
attribute vec3 position;
uniform mat4 world; uniform mat4 viewProjection;
varying vec3 vDir;
void main(){
  vDir = position;
  vec4 p = viewProjection * (world * vec4(position, 1.0));
  gl_Position = p.xyww;
}`;
const SKY_FRAG = `
precision highp float;
varying vec3 vDir;
uniform vec3 fogColor; uniform vec3 skyTop; uniform vec3 sunDir; uniform float time;
uniform vec3 sunCol; uniform vec3 glowColor; uniform float night;
${NOISE_GLSL}
float fbm5(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * vnoise(p); p = p * 2.03 + vec2(17.1, 9.2); a *= 0.5; } return v; }
// Big, puffy, slightly swirled shapes (domain-warped noise).
float clouds(vec2 uv){
  vec2 w = vec2(fbm5(uv * 0.4), fbm5(uv * 0.4 + 5.2));
  return fbm5(uv * 0.75 + w * 1.1);
}
void main(){
  vec3 d = normalize(vDir);
  float t = pow(smoothstep(-0.02, 0.6, d.y), 0.8);
  vec3 c = mix(fogColor, skyTop, t);
  vec3 sd = normalize(sunDir);
  // Glow along the horizon on the sun's side: peach at dawn, red at dusk (strongest when low).
  float az = max(dot(normalize(d.xz + 1e-4), normalize(sd.xz + 1e-4)), 0.0);
  float low = 1.0 - smoothstep(0.15, 0.6, sd.y);
  float band = 1.0 - smoothstep(0.0, 0.32, abs(d.y - 0.02));
  c = mix(c, glowColor, band * (0.25 + 0.75 * pow(az, 3.0)) * low * 0.85);
  // Sun / moon: soft halo plus a crisp disc.
  float cs = dot(d, sd);
  c += sunCol * pow(max(cs, 0.0), 60.0) * 0.45 * (1.0 - night * 0.5);
  c += vec3(1.0, 0.95, 0.8) * pow(max(cs, 0.0), 8.0) * 0.12 * low * (1.0 - night);
  // Stars at night.
  vec2 sp = d.xz / (d.y + 0.25) * 90.0;
  float star = step(0.9965, h21(floor(sp))) * smoothstep(0.06, 0.35, d.y);
  c += star * night * mix(0.5, 1.0, h21(floor(sp) + 3.0));

  float veil = 0.0;
  // Stylised clouds on a flat layer: puffy shapes, white lit tops, soft shaded undersides,
  // drifting slowly and fading into the haze near the horizon.
  if (d.y > 0.0) {
    vec2 uv = d.xz / (d.y + 0.12) * 1.4 + vec2(time * 0.012, time * 0.004);
    float dens = clouds(uv);
    float cover = smoothstep(0.535, 0.565, dens);
    // Shade the underside: where there is more cloud just above (towards the zenith), we are
    // looking at the bottom of the cloud.
    vec2 outward = normalize(d.xz + 1e-4) * 0.18;
    float above = clouds(uv - outward);
    float light = smoothstep(-0.03, 0.03, dens - above + 0.02);
    vec3 cLit = mix(vec3(1.0, 0.995, 0.97), skyTop, 0.06) * mix(vec3(1.0), sunCol, 0.3);
    vec3 cSh  = mix(skyTop, vec3(0.82, 0.84, 0.9), 0.55);
    cLit = mix(cLit, vec3(0.3, 0.34, 0.48), night);        // moonlit clouds
    cSh  = mix(cSh, skyTop * 1.6 + 0.04, night);
    vec3 cloudCol = mix(cSh, cLit, light);
    cloudCol = mix(cloudCol, glowColor, pow(az, 2.0) * low * 0.4 * (1.0 - night));  // lit by the low sun
    float near = smoothstep(0.02, 0.22, d.y);
    cloudCol = mix(fogColor, cloudCol, 0.35 + 0.65 * near);
    c = mix(c, cloudCol, cover * smoothstep(0.0, 0.08, d.y));
    veil = cover * 0.65;
  }
  // Sun / moon disc on top of the clouds (veiled when one passes in front). The moon is a little
  // larger, with a soft halo and a few faint darker patches.
  float discEdge = mix(0.9985, 0.998, night);
  vec3 discCol = mix(vec3(1.0, 0.97, 0.86), vec3(0.95, 0.96, 1.0), night);
  vec3 tang = normalize(cross(sd, vec3(0.0, 1.0, 0.0)) + 1e-4);
  vec2 mp = vec2(dot(d - sd, tang), dot(d - sd, normalize(cross(tang, sd)))) * 40.0;
  discCol *= 1.0 - night * 0.1 * smoothstep(0.35, 0.8, vnoise(mp * 1.3 + 3.0) * 0.7 + vnoise(mp * 2.9 + 7.0) * 0.3);
  c += vec3(0.75, 0.8, 1.0) * pow(max(cs, 0.0), 300.0) * 0.35 * night * (1.0 - veil);
  c = mix(c, discCol, smoothstep(discEdge, discEdge + 0.0005, cs) * (1.0 - veil));
  gl_FragColor = vec4(pow(c, vec3(2.2)), 1.0); // linear out, see outColor()
}`;

// Far-off trees: painted sprites (public/textures/trees_atlas.png, 4 tiles: 3 conifers and a
// round tree) on camera-facing quads. They turn around their own vertical axis only, so they stay
// upright from any angle, and are mirrored so the painted light side is always on the sun's side.
const TREE_VERT = `
precision highp float;
attribute vec3 position; attribute vec2 uv;
#include<instancesDeclaration>
uniform mat4 viewProjection; uniform vec3 cameraPos; uniform vec3 sunDir; uniform float time;
varying vec2 vUV; varying vec3 vW; varying float vVariant; varying float vTone;
void main(){
  #include<instancesVertex>
  vec3 base = (finalWorld * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  float width = length(finalWorld[0].xyz), height = length(finalWorld[1].xyz);
  vec3 toCam = cameraPos - base; toCam.y = 0.0;
  toCam = normalize(toCam + vec3(1e-4, 0.0, 0.0));
  vec3 right = vec3(-toCam.z, 0.0, toCam.x);              // screen-right for this tree
  float flip = dot(right, sunDir) > 0.0 ? -1.0 : 1.0;      // painted light is on the left of each tile
  vec3 w = base + right * (position.x * width * flip) + vec3(0.0, position.y * height, 0.0);
  w.xz += vec2(0.6, -0.8) * sin(time * 0.7 + base.x * 0.3 + base.z * 0.2) * position.y * position.y * height * 0.012;
  float variant = floor(fract(sin(dot(base.xz, vec2(12.9898, 78.233))) * 43758.5453) * 4.0);
  vUV = vec2((uv.x + variant) * 0.25, uv.y);
  vVariant = variant;
  vTone = fract(sin(dot(base.xz, vec2(39.3, 11.7))) * 9341.3);
  vW = w;
  gl_Position = viewProjection * vec4(w, 1.0);
}`;
const TREE_FRAG = `
precision highp float;
varying vec2 vUV; varying vec3 vW; varying float vVariant; varying float vTone;
uniform sampler2D atlas; uniform float snow; uniform vec3 leafLit; uniform vec3 leafShade;
${COMMON_FRAG}
void main(){
  vec4 tex = texture2D(atlas, vUV);
  if (tex.a < 0.5) discard;
  vec3 c = tex.rgb * mix(0.92, 1.06, vTone);
  float lum = dot(tex.rgb, vec3(0.3, 0.59, 0.11));
  float trunk = smoothstep(0.0, 0.06, tex.r - tex.g);       // the brown trunk
  // Round trees take the season's leaf colours (orange-red in fall); conifers stay evergreen.
  if (vVariant > 2.5) c = mix(mix(leafShade, leafLit, smoothstep(0.18, 0.55, lum)), c, trunk);
  // Winter: snow on the foliage, blue-grey where the painting is in shade.
  vec3 snowy = mix(vec3(0.4, 0.44, 0.58), vec3(0.97, 0.98, 1.0), smoothstep(0.16, 0.5, lum));
  c = mix(c, snowy, snow * (1.0 - trunk));
  c = grade(c, 0.7);
  gl_FragColor = outColor(haze(c, vW));
}`;

// ─── Builders ───────────────────────────────────────────────────────────────
const COMMON_UNIFORMS = ['world', 'viewProjection', 'sunDir', 'cameraPos', 'fogColor', 'fogDensity', 'shadowCenter', 'shadowRadius', 'sunCol', 'ambCol', 'night', 'treeShade'];

function toonMaterial(scene: Scene, name: string, frag: string, extraUniforms: string[], opts: { uv?: boolean; vcolor?: boolean; samplers?: string[] } = {}) {
  const mat = new ShaderMaterial(name, scene, { vertexSource: TOON_VERT, fragmentSource: frag }, {
    attributes: ['position', 'normal', ...(opts.uv ? ['uv'] : []), ...(opts.vcolor ? ['color'] : [])],
    uniforms: [...COMMON_UNIFORMS, ...extraUniforms],
    samplers: opts.samplers ?? [],
    defines: [...(opts.uv ? ['#define USE_UV'] : []), ...(opts.vcolor ? ['#define VCOLOR'] : [])],
  });
  return mat;
}

function heightGround(scene: Scene, name: string, size: number, subdivisions: number, fn: (x: number, z: number) => number) {
  const g = MeshBuilder.CreateGround(name, { width: size, height: size, subdivisions, updatable: true }, scene);
  const pos = g.getVerticesData(VertexBuffer.PositionKind)!;
  for (let i = 0; i < pos.length; i += 3) pos[i + 1] = fn(pos[i], pos[i + 2]);
  g.updateVerticesData(VertexBuffer.PositionKind, pos);
  const normals: number[] = [];
  VertexData.ComputeNormals(pos, g.getIndices()!, normals);
  g.updateVerticesData(VertexBuffer.NormalKind, normals);
  g.isPickable = false;
  return g;
}

function bladeMesh(scene: Scene) {
  // A tapered, slightly curved blade: 7 vertices, 5 triangles.
  const ys = [0, 0.38, 0.72, 1];
  const ws = [0.04, 0.032, 0.018, 0];
  const positions: number[] = [];
  for (let i = 0; i < 3; i++) {
    const z = ys[i] * ys[i] * 0.12;
    positions.push(-ws[i], ys[i], z, ws[i], ys[i], z);
  }
  positions.push(0, 1, 0.12);
  const indices = [0, 1, 3, 0, 3, 2, 2, 3, 5, 2, 5, 4, 4, 5, 6];
  const m = new Mesh('grassBlade', scene);
  const vd = new VertexData();
  vd.positions = positions; vd.indices = indices;
  vd.applyToMesh(m);
  m.isPickable = false;
  return m;
}

// A garden stone: a lumpy sphere cut by a few random planes, so it has the flat, chiselled
// faces and crisp edges of real rock.
function rockMesh(scene: Scene, name: string, seed: number, size: number, stretch: Vector3) {
  const rock = MeshBuilder.CreateIcoSphere(name, { radius: 1, subdivisions: 3, updatable: true }, scene);
  const p = rock.getVerticesData(VertexBuffer.PositionKind)!;
  const cuts = Array.from({ length: 6 }, (_, k) => {
    const th = hash(seed, k * 3.1) * Math.PI * 2, ph = Math.acos(hash(seed + 7, k * 1.7) * 1.6 - 0.6);
    return { n: new Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)), d: 0.72 + hash(seed + 3, k) * 0.2 };
  });
  const v = new Vector3();
  for (let i = 0; i < p.length; i += 3) {
    v.set(p[i], p[i + 1], p[i + 2]);
    const lump = 1 + 0.22 * (fbm(v.x * 1.4 + seed, v.z * 1.4 + v.y * 1.1, 3) - 0.5) + 0.06 * (fbm(v.x * 5 + seed, v.y * 5 - v.z, 2) - 0.5);
    v.scaleInPlace(lump);
    for (const c of cuts) {
      const over = Vector3.Dot(v, c.n) - c.d;
      if (over > 0) v.subtractInPlace(c.n.scale(over));
    }
    v.x *= stretch.x; v.y *= stretch.y; v.z *= stretch.z;
    if (v.y < -0.15) v.y = -0.15 - (v.y + 0.15) * 0.25; // settle into the ground
    p[i] = v.x; p[i + 1] = v.y; p[i + 2] = v.z;
  }
  rock.updateVerticesData(VertexBuffer.PositionKind, p);
  const normals: number[] = [];
  VertexData.ComputeNormals(p, rock.getIndices()!, normals);
  rock.updateVerticesData(VertexBuffer.NormalKind, normals);
  rock.scaling.setAll(size);
  return rock;
}

// Stone lantern (about 1.8 m once scaled): stepped base, ringed post, flared platform, an open
// firebox with six corner posts and a glow inside, a hexagonal roof with upturned tips, and a
// finial. Origin at ground level.
function lanternMesh(scene: Scene) {
  const parts: Mesh[] = [];
  const add = (m: Mesh, y: number, rotY = 0) => { m.position.y = y; m.rotation.y = rotY; parts.push(m); return m; };
  const hex = (name: string, h: number, dTop: number, dBottom: number, y: number) =>
    add(MeshBuilder.CreateCylinder(name, { height: h, diameterTop: dTop, diameterBottom: dBottom, tessellation: 6 }, scene), y);
  hex('lBase1', 0.08, 0.72, 0.76, 0.04);
  hex('lBase2', 0.07, 0.5, 0.62, 0.115);
  hex('lBase3', 0.04, 0.34, 0.42, 0.17);
  add(MeshBuilder.CreateCylinder('lPost', { height: 0.5, diameterTop: 0.19, diameterBottom: 0.23, tessellation: 12 }, scene), 0.44);
  add(MeshBuilder.CreateTorus('lRing1', { diameter: 0.23, thickness: 0.035, tessellation: 14 }, scene), 0.26);
  add(MeshBuilder.CreateTorus('lRing2', { diameter: 0.21, thickness: 0.03, tessellation: 14 }, scene), 0.6);
  hex('lShelf', 0.1, 0.6, 0.3, 0.74);
  hex('lShelfRim', 0.04, 0.62, 0.62, 0.81);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    const post = MeshBuilder.CreateBox(`lFirePost${k}`, { width: 0.07, height: 0.22, depth: 0.07 }, scene);
    post.position.set(Math.cos(a) * 0.19, 0.94, Math.sin(a) * 0.19);
    post.rotation.y = -a;
    parts.push(post);
  }
  hex('lFireTop', 0.045, 0.46, 0.46, 1.07);
  // Roof: 12-sided cone shaped into a hexagon whose corners curl up.
  const roof = MeshBuilder.CreateCylinder('lRoof', { height: 0.2, diameterTop: 0.1, diameterBottom: 0.9, tessellation: 12, updatable: true }, scene);
  const rp = roof.getVerticesData(VertexBuffer.PositionKind)!;
  for (let i = 0; i < rp.length; i += 3) {
    const r = Math.hypot(rp[i], rp[i + 2]);
    if (rp[i + 1] < -0.09 && r > 0.2) {
      const ang = Math.atan2(rp[i + 2], rp[i]);
      const corner = Math.round(ang / (Math.PI / 6)) % 2 === 0;
      const scale = corner ? 1.08 : 0.86;
      rp[i] *= scale; rp[i + 2] *= scale;
      if (corner) rp[i + 1] += 0.08;
    }
  }
  roof.updateVerticesData(VertexBuffer.PositionKind, rp);
  const rn: number[] = [];
  VertexData.ComputeNormals(rp, roof.getIndices()!, rn);
  roof.updateVerticesData(VertexBuffer.NormalKind, rn);
  add(roof, 1.19);
  hex('lCap', 0.05, 0.13, 0.17, 1.31);
  const jewel = MeshBuilder.CreateSphere('lJewel', { diameter: 0.13, segments: 8 }, scene);
  jewel.scaling.y = 1.25;
  add(jewel, 1.41);
  add(MeshBuilder.CreateCylinder('lTip', { height: 0.07, diameterTop: 0, diameterBottom: 0.05, tessellation: 8 }, scene), 1.5);
  const glow = MeshBuilder.CreateCylinder('lGlow', { height: 0.18, diameter: 0.3, tessellation: 6 }, scene);
  glow.position.y = 0.94;
  const body = Mesh.MergeMeshes(parts, true, true)!;
  return { body, glow };
}

// A daisy: a thin stem with a small flat flower head (vertex colours: stem, white petals, yellow eye).
function daisyMesh(scene: Scene) {
  const positions: number[] = [], colors: number[] = [], indices: number[] = [];
  const stem = [0.3, 0.48, 0.25], white = [0.98, 0.98, 0.94], yellow = [0.96, 0.78, 0.3];
  const v = (x: number, y: number, z: number, c: number[]) => { positions.push(x, y, z); colors.push(c[0], c[1], c[2], 1); return positions.length / 3 - 1; };
  // stem (two quads crossed so it reads from every side)
  for (const [dx, dz] of [[0.012, 0], [0, 0.012]]) {
    const a = v(-dx, 0, -dz, stem), b = v(dx, 0, dz, stem), c = v(dx, 1, dz + 0.04, stem), d = v(-dx, 1, -dz + 0.04, stem);
    indices.push(a, b, c, a, c, d);
  }
  // head: yellow eye, then 12 petal points alternating long and short
  const centre = v(0, 1.02, 0.04, yellow);
  const ring: number[] = [];
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2;
    ring.push(v(Math.cos(ang) * 0.045, 1.02, 0.04 + Math.sin(ang) * 0.045, yellow));
  }
  const tips: number[] = [];
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2, rr = i % 2 ? 0.1 : 0.17;
    tips.push(v(Math.cos(ang) * rr, 1.0, 0.04 + Math.sin(ang) * rr, white));
  }
  for (let i = 0; i < 12; i++) {
    const j = (i + 1) % 12;
    indices.push(centre, ring[i], ring[j], ring[i], tips[i], tips[j], ring[i], tips[j], ring[j]);
  }
  const m = new Mesh('daisy', scene);
  const vd = new VertexData();
  vd.positions = positions; vd.colors = colors; vd.indices = indices;
  vd.applyToMesh(m);
  m.isPickable = false;
  return m;
}

export interface GardenOptions {
  isMobile: boolean;
  season: Season;
  tree: AbstractMesh[];
}

export function buildGarden(scene: Scene, { isMobile, season, tree }: GardenOptions) {
  const disposables: { dispose(): void }[] = [];
  const clonePalette = (p: Palette): Palette => ({
    grass: p.grass.clone(), grassShade: p.grassShade.clone(), root: p.root.clone(), tip: p.tip.clone(),
    rock: p.rock.clone(), rockShade: p.rockShade.clone(), fog: p.fog.clone(), skyTop: p.skyTop.clone(),
    gravel: p.gravel.clone(), groove: p.groove.clone(),
    bladeHeight: p.bladeHeight, snow: p.snow, bloom: p.bloom, leafLit: p.leafLit.clone(), leafShade: p.leafShade.clone(),
    sunDir: p.sunDir.clone(), sunCol: p.sunCol.clone(), ambCol: p.ambCol.clone(), glow: p.glow.clone(), night: p.night,
    treeShade: p.treeShade,
  });
  const current = clonePalette(PALETTES[season]);
  let target = PALETTES[season];

  // Tree shadow on the ground: canopy centre projected along the sun.
  const canopy = new Vector3(0, 2.4, 0);
  const groundY = terrainHeight(0, 0);
  const shadowCenter = new Vector3();
  // A low sun (dawn, dusk) would throw the shadow far from the tree: cap how far it shifts so it
  // stays attached to the trunk.
  const placeTreeShadow = (sun: Vector3) => {
    const s = new Vector3(sun.x, Math.max(sun.y, 0.35), sun.z).normalize();
    canopy.subtractToRef(s.scale((canopy.y - groundY) / s.y), shadowCenter);
    const len = Math.hypot(shadowCenter.x, shadowCenter.z), maxLen = 1.6;
    if (len > maxLen) { shadowCenter.x *= maxLen / len; shadowCenter.z *= maxLen / len; }
  };
  placeTreeShadow(current.sunDir);
  const shadowRadius = new Vector2(2.3, 1.9);

  const mats: ShaderMaterial[] = [];
  const register = (m: ShaderMaterial) => { mats.push(m); disposables.push(m); return m; };

  // Terrain: a detailed hill (64 m square) set into a huge, coarse meadow that runs to the horizon.
  // The coarse grid is 16 m, so its lines meet the hill mesh's edges exactly; its vertices
  // under the hill are pushed far down out of sight.
  const terrainMat = register(toonMaterial(scene, 'toonTerrain', TERRAIN_FRAG, ['grass', 'grassShade', 'rock', 'rockShade', 'gravel', 'groove', 'snow', 'time', 'root', 'tip']));
  const near = heightGround(scene, 'hill', 64, isMobile ? 160 : 256, terrainHeight);
  const far = heightGround(scene, 'meadowFar', 4032, 252, (x, z) =>
    Math.abs(x) < 31 && Math.abs(z) < 31 ? PLAIN_Y - 12 : terrainHeight(x, z));
  near.material = terrainMat; far.material = terrainMat;
  disposables.push(near, far);

  // Sky dome (follows the camera, drawn at the far plane behind everything).
  const skyMat = register(new ShaderMaterial('gradientSky', scene, { vertexSource: SKY_VERT, fragmentSource: SKY_FRAG }, {
    attributes: ['position'], uniforms: ['world', 'viewProjection', 'fogColor', 'skyTop', 'sunDir', 'time', 'sunCol', 'glowColor', 'night'],
  }));
  skyMat.backFaceCulling = false;
  skyMat.disableDepthWrite = true;
  const sky = MeshBuilder.CreateSphere('skyDome', { diameter: 1000, segments: 24, sideOrientation: Mesh.BACKSIDE }, scene);
  sky.infiniteDistance = true;
  sky.isPickable = false;
  sky.material = skyMat;
  disposables.push(sky);
  scene.clearColor.set(current.fog.r, current.fog.g, current.fog.b, 1);

  // Painted billboard trees scattered over the distant hills, alone or in small groups.
  const treeMat = register(new ShaderMaterial('billboardTrees', scene, { vertexSource: TREE_VERT, fragmentSource: TREE_FRAG }, {
    attributes: ['position', 'uv'],
    uniforms: [...COMMON_UNIFORMS, 'time', 'snow', 'leafLit', 'leafShade'],
    samplers: ['atlas'],
  }));
  treeMat.backFaceCulling = false;
  const atlas = new Texture(`${getBasePath()}/textures/trees_atlas.png`, scene);
  atlas.hasAlpha = true;
  atlas.wrapU = atlas.wrapV = Texture.CLAMP_ADDRESSMODE;
  treeMat.setTexture('atlas', atlas);
  disposables.push(atlas);
  const treeQuad = new Mesh('treeQuad', scene);
  {
    const vd = new VertexData();
    vd.positions = [-0.5, 0, 0, 0.5, 0, 0, 0.5, 1, 0, -0.5, 1, 0];
    vd.uvs = [0, 0, 1, 0, 1, 1, 0, 1];
    vd.indices = [0, 1, 2, 0, 2, 3];
    vd.applyToMesh(treeQuad);
  }
  treeQuad.material = treeMat;
  treeQuad.isPickable = false;
  const treeMats: number[] = [];
  const tm = new Matrix();
  for (let i = 0; i < 26; i++) {
    const ang = hash(i, 1.3) * Math.PI * 2;
    const r = 42 + hash(i, 7.7) * 170;
    const x = Math.cos(ang) * r, z = Math.sin(ang) * r;
    const group = 1 + Math.floor(hash(i, 3.9) * 4);    // 1–4 trees together
    for (let k = 0; k < group; k++) {
      const px = x + (hash(i, k + 11) - 0.5) * 9, pz = z + (hash(i, k + 17) - 0.5) * 9;
      const h = 6 + hash(i, k + 23) * 6;
      Matrix.ComposeToRef(new Vector3(h * 0.5, h, 1), Quaternion.Identity(), new Vector3(px, terrainHeight(px, pz) - 0.3, pz), tm);
      treeMats.push(...tm.asArray());
    }
  }
  treeQuad.thinInstanceSetBuffer('matrix', new Float32Array(treeMats), 16, true);
  treeQuad.alwaysSelectAsActiveMesh = true;
  disposables.push(treeQuad);

  // Stone groups on the moss islands.
  const rockMat = register(toonMaterial(scene, 'toonRock', ROCK_FRAG, ['grass', 'grassShade', 'rock', 'rockShade', 'snow']));
  STONES.forEach(([along, side, size, sx, sy, sz], i) => {
    const rock = rockMesh(scene, `stone${i}`, i * 3.7 + 1.1, size, new Vector3(sx, sy, sz));
    const { x, z } = toWorld(along, side);
    const y = terrainHeight(x, z) - size * 0.08;
    const rot = hash(i, 4.2) * Math.PI * 2;
    rock.position.set(x, y, z); rock.rotation.y = rot; rock.isPickable = false;
    rock.material = rockMat;
    disposables.push(rock);
  });

  // Stone lantern at the edge of the gravel; its window glows brighter at night.
  const LANTERN_GLOW = hex('#ffcf7a');
  const lanternGlow = new StandardMaterial('lanternGlow', scene);
  lanternGlow.disableLighting = true;
  lanternGlow.emissiveColor = LANTERN_GLOW.clone();
  {
    const { body, glow } = lanternMesh(scene);
    const { x, z } = toWorld(LANTERN.a, LANTERN.s);
    const y = terrainHeight(x, z);
    [body, glow].forEach(mm => {
      mm.position.addInPlace(new Vector3(x, y, z));
      mm.scaling.scaleInPlace(1.25);
      mm.position.y = y + (mm.position.y - y) * 1.25;
      mm.rotation.y = Math.atan2(VIEW.x, VIEW.z) + 0.35;
      mm.isPickable = false;
    });
    body.material = rockMat;
    glow.material = lanternGlow;
    disposables.push(body, glow, lanternGlow);
  }

  // Grass blades on the hill and the meadow around it (denser near the garden).
  const grassMat = register(new ShaderMaterial('toonGrass', scene, { vertexSource: GRASS_VERT, fragmentSource: GRASS_FRAG }, {
    attributes: ['position'],
    uniforms: [...COMMON_UNIFORMS, 'time', 'bladeHeight', 'root', 'tip', 'grassShade'],
  }));
  grassMat.backFaceCulling = false;
  const blade = bladeMesh(scene);
  blade.material = grassMat;
  const target_count = isMobile ? 36000 : 130000;
  const matrices = new Float32Array(target_count * 16);
  const m = new Matrix(), q = new Quaternion(), s = new Vector3(), p = new Vector3();
  let count = 0, tries = 0;
  const place = (x: number, z: number, hgt: number, width: number) => {
    const y = terrainHeight(x, z);
    s.set(width, hgt, 1);
    Quaternion.RotationYawPitchRollToRef(Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.25, 0, q);
    p.set(x, y - 0.02, z);
    Matrix.ComposeToRef(s, q, p, m);
    m.copyToArray(matrices, count * 16);
    count++;
  };
  // Moss on the islands: short, dense, fine blades.
  const mossCount = Math.round(target_count * 0.12);
  while (count < mossCount && tries < mossCount * 10) {
    tries++;
    const [a0, s0, r0] = ISLANDS[Math.floor(Math.random() * ISLANDS.length)];
    const rr = r0 * 1.35 * Math.sqrt(Math.random()), aa = Math.random() * Math.PI * 2;
    const along = a0 + Math.cos(aa) * rr, side = s0 + Math.sin(aa) * rr;
    const { x, z } = toWorld(along, side);
    if (Math.hypot(x, z) < 0.5 || islandAt(along, side).d > -0.06) continue;
    place(x, z, 0.06 + Math.random() * 0.07, 0.9 + Math.random() * 0.5);
  }
  // Meadow grass around the garden (denser near it), skipping the bed and curb.
  tries = 0;
  while (count < target_count && tries < target_count * 4) {
    tries++;
    const r = 31 * Math.pow(Math.random(), 0.72);
    const a = Math.random() * Math.PI * 2;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const along = x * VIEW.x + z * VIEW.z, side = x * RIGHT.x + z * RIGHT.z;
    if (bedDistance(along, side) < CURB + 0.08) continue;
    const y = terrainHeight(x, z);
    const slope = Math.hypot(terrainHeight(x + 0.2, z) - y, terrainHeight(x, z + 0.2) - y) / 0.2;
    if (slope > 1.2) continue;
    const patch = fbm(x * 0.35, z * 0.35, 2);
    if (patch < 0.32 && Math.random() < 0.6) continue; // a few thinner patches break up the carpet
    // Shorter near the curb, as if trimmed along the garden edge.
    const trim = smoothstep(CURB, CURB + 1.5, bedDistance(along, side));
    const edgeFade = 1 - smoothstep(19, 31, r) * 0.9;   // blades shrink into the painted ground
    place(x, z, (0.42 + Math.random() * 0.45) * (0.7 + patch * 0.6) * (0.4 + 0.6 * trim) * edgeFade, 0.5 + Math.random() * 0.4);
  }
  blade.thinInstanceSetBuffer('matrix', matrices.subarray(0, count * 16), 16, true);
  blade.alwaysSelectAsActiveMesh = true;
  disposables.push(blade);

  // A sprinkling of daisies in the meadow grass (spring only).
  const daisyMat = register(new ShaderMaterial('daisy', scene, { vertexSource: GRASS_VERT, fragmentSource: GRASS_FRAG }, {
    attributes: ['position', 'color'],
    uniforms: [...COMMON_UNIFORMS, 'time', 'bladeHeight', 'bloom', 'root', 'tip', 'grassShade'],
    defines: ['#define VCOLOR'],
  }));
  daisyMat.backFaceCulling = false;
  const daisy = daisyMesh(scene);
  daisy.material = daisyMat;
  const daisyCount = isMobile ? 120 : 340;
  const dm = new Float32Array(daisyCount * 16);
  let dn = 0;
  for (let tries2 = 0; dn < daisyCount && tries2 < daisyCount * 6; tries2++) {
    const r = 3 + 22 * Math.pow(Math.random(), 0.8);
    const a = Math.random() * Math.PI * 2;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const along = x * VIEW.x + z * VIEW.z, side = x * RIGHT.x + z * RIGHT.z;
    if (bedDistance(along, side) < CURB + 0.6) continue;
    if (fbm(x * 0.2 + 9, z * 0.2, 2) < 0.5) continue;    // they grow in small loose drifts
    const sc = 0.5 + Math.random() * 0.35;
    s.setAll(sc);
    Quaternion.RotationYawPitchRollToRef(Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.3, 0, q);
    p.set(x, terrainHeight(x, z) - 0.02, z);
    Matrix.ComposeToRef(s, q, p, m);
    m.copyToArray(dm, dn * 16);
    dn++;
  }
  daisy.thinInstanceSetBuffer('matrix', dm.subarray(0, dn * 16), 16, true);
  daisy.alwaysSelectAsActiveMesh = true;
  disposables.push(daisy);

  // Trunk: swap the glTF PBR material for the toon one (keeps its painted texture).
  const trunk = tree.find(mm => mm.name === 'Tree');
  if (trunk) {
    const albedo = (trunk.material as any)?.albedoTexture as BaseTexture | undefined;
    const trunkMat = register(toonMaterial(scene, 'toonTrunk', TRUNK_FRAG, ['rockShade'], { uv: true, samplers: ['albedo'] }));
    if (albedo) trunkMat.setTexture('albedo', albedo);
    trunk.material = trunkMat;
  }

  const COLOR_KEYS = ['grass', 'grassShade', 'root', 'tip', 'rock', 'rockShade', 'fog', 'skyTop', 'gravel', 'groove', 'leafLit', 'leafShade', 'sunCol', 'ambCol', 'glow'] as const;
  // Per-frame: shared uniforms and a smooth blend towards the target season's palette.
  const lerp = (a: Color3, b: Color3, k: number) => Color3.LerpToRef(a, b, k, a);
  const start = performance.now();
  const obs = scene.onBeforeRenderObservable.add(() => {
    const dt = Math.min(scene.getEngine().getDeltaTime() / 1000, 0.1);
    const k = 1 - Math.exp(-dt * 1.6);
    COLOR_KEYS.forEach(key => lerp(current[key], target[key], k));
    current.bladeHeight += (target.bladeHeight - current.bladeHeight) * k;
    current.snow += (target.snow - current.snow) * k;
    current.bloom += (target.bloom - current.bloom) * k;
    current.night += (target.night - current.night) * k;
    current.treeShade += (target.treeShade - current.treeShade) * k;
    Vector3.LerpToRef(current.sunDir, target.sunDir, k, current.sunDir);
    current.sunDir.normalize();
    placeTreeShadow(current.sunDir);
    lanternGlow.emissiveColor.copyFrom(LANTERN_GLOW).scaleInPlace(1 + current.night * 0.6);
    blade.isVisible = current.bladeHeight > 0.01; // fully under snow
    daisy.isVisible = blade.isVisible && current.bloom > 0.01;
    scene.clearColor.set(Math.pow(current.fog.r, 2.2), Math.pow(current.fog.g, 2.2), Math.pow(current.fog.b, 2.2), 1);

    const cam = scene.activeCamera?.globalPosition ?? Vector3.Zero();
    const time = (performance.now() - start) / 1000;
    for (const mat of mats) {
      mat.setVector3('sunDir', current.sunDir);
      mat.setVector3('cameraPos', cam);
      mat.setColor3('fogColor', current.fog);
      mat.setColor3('skyTop', current.skyTop);
      mat.setFloat('fogDensity', 1 / 420);
      mat.setVector3('shadowCenter', shadowCenter);
      mat.setVector2('shadowRadius', shadowRadius);
      mat.setColor3('grass', current.grass);
      mat.setColor3('grassShade', current.grassShade);
      mat.setColor3('rock', current.rock);
      mat.setColor3('rockShade', current.rockShade);
      mat.setColor3('root', current.root);
      mat.setColor3('tip', current.tip);
      mat.setColor3('gravel', current.gravel);
      mat.setColor3('groove', current.groove);
      mat.setColor3('leafLit', current.leafLit);
      mat.setColor3('leafShade', current.leafShade);
      mat.setColor3('sunCol', current.sunCol);
      mat.setColor3('ambCol', current.ambCol);
      mat.setColor3('glowColor', current.glow);
      mat.setFloat('night', current.night);
      mat.setFloat('treeShade', current.treeShade);
      mat.setFloat('time', time);
      mat.setFloat('bladeHeight', current.bladeHeight);
      mat.setFloat('snow', current.snow);
      mat.setFloat('bloom', current.bloom);
    }
  });

  return {
    setSeason(s: Season) { target = PALETTES[s]; },
    snapSeason(s: Season) {
      target = PALETTES[s];
      COLOR_KEYS.forEach(key => current[key].copyFrom(target[key]));
      current.bladeHeight = target.bladeHeight;
      current.snow = target.snow;
      current.bloom = target.bloom;
      current.night = target.night;
      current.treeShade = target.treeShade;
      current.sunDir.copyFrom(target.sunDir);
    },
    dispose() {
      scene.onBeforeRenderObservable.remove(obs);
      disposables.forEach(d => d.dispose());
    },
  };
}
