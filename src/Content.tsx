import React, { useEffect, useState, useRef, useMemo } from 'react';
import type { Scene } from '@babylonjs/core/scene';
import { ParticleHelper } from '@babylonjs/core/Particles/particleHelper';
import type { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';
import '@babylonjs/core/Particles/particleSystemComponent';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector2 } from '@babylonjs/core/Maths/math.vector';
import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline';
import '@babylonjs/core/PostProcesses/RenderPipeline/postProcessRenderPipelineManagerSceneComponent';
import '@babylonjs/core/Rendering/outlineRenderer';
import { ImageProcessingConfiguration } from '@babylonjs/core/Materials/imageProcessingConfiguration';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Camera } from '@babylonjs/core/Cameras/camera';
import { Tools } from '@babylonjs/core/Misc/tools';
import { CustomMaterial } from '@babylonjs/materials/custom/customMaterial';
import { useScene, useModel } from 'reactylon';
import '@babylonjs/loaders/glTF/2.0';
import { getBasePath } from './config';
import { applyMood } from './seasonMood';
import { buildGarden } from './Garden';

import { Season } from './season';
export { Season };
interface ContentProps {
  season: Season;
  // Phone layout: portrait framing, no touch orbit (swipes scroll the page), lighter effects.
  isMobile?: boolean;
  // Called once the scene is built and ready to render (used to fade out the loading poster).
  onReady?: () => void;
};

const BUSH_POSITIONS: Vector3[] = [
  new Vector3(0.065, 0.85, -0.78),
  new Vector3(0.58, 1.11, -0.92),
  new Vector3(0.40, 1.39, -0.80),
  new Vector3(0.33, 1.69, -0.70),
  new Vector3(0.60, 1.28, -0.61),
  new Vector3(-0.00, 1.93, -0.62),
  new Vector3(-0.05, 1.88, -0.32),
  new Vector3(-0.18, 1.91, -0.02),
  new Vector3(0.09, 1.84, 0.23),
  new Vector3(0.33, 1.89, 0.29),
  new Vector3(0.01, 1.63, 0.48),
  new Vector3(-0.02, 1.54, 0.78),
  new Vector3(-0.45, 1.48, 0.73),
  new Vector3(-0.43, 1.25, 0.69),
  new Vector3(-0.56, 1.15, 0.41),
  new Vector3(-0.23, 1.29, 0.25),
];
export const Content: React.FC<ContentProps & {
  onPetalPS?: (ps: ParticleSystem|null) => void,
  onGreenPS?: (ps: ParticleSystem|null) => void,
  onRedPS?: (ps: ParticleSystem|null) => void,
  onSnowPS?: (ps: ParticleSystem|null) => void,
}> = ({ season, isMobile = false, onReady, onPetalPS, onGreenPS, onRedPS, onSnowPS }) => {
  const [petalPS,  setPetalPS]  = useState<ParticleSystem|null>(null);
  const [greenPS,  setGreenPS]  = useState<ParticleSystem|null>(null);
  const [redPS,    setRedPS]    = useState<ParticleSystem|null>(null);
  const [snowPS,   setSnowPS]   = useState<ParticleSystem|null>(null);
  const scene = useScene();
  const gardenRef = useRef<ReturnType<typeof buildGarden> | null>(null);
  // The meadow palette (grass, ground, rocks, haze) blends towards the new season on its own.
  useEffect(() => { gardenRef.current?.setSeason(season); }, [season]);
  const basePath = getBasePath();
  const { meshes: leafMeshes } = useModel(`${basePath}/meshes/leaf_emitter.glb`);
  const { meshes: treeMeshes } = useModel(`${basePath}/meshes/SakuraTree.glb`);
  // Invisible particle emitter boxes, created once per scene (not on every render).
  const { winterEmitter, otherEmitter } = useMemo(() => {
    const winterEmitter = MeshBuilder.CreateBox("winterEmitter", { size: 5 }, scene);
    winterEmitter.position.set(0, 4, 0);
    winterEmitter.isVisible = false;

    const otherEmitter = MeshBuilder.CreateBox("otherEmitter", { size: 4 }, scene);
    otherEmitter.position.set(0, 2, 0);
    otherEmitter.isVisible = false;

    return { winterEmitter, otherEmitter };
  }, [scene]);

  // Load a particle system from public/particlesettings/<file>.json.
  // Signature is (name, url, scene, gpu, rootUrl): rootUrl is prefixed to the
  // texture paths stored in the JSON ("/textures/particles/...").
  async function loadParticleSystem(
    scene: Scene,
    name: string,
    file: string,
    emitter: AbstractMesh,
    activeIn: Season
  ): Promise<ParticleSystem> {
    const ps = (await ParticleHelper.ParseFromFileAsync(
      name,
      `${basePath}/particlesettings/${file}.json`,
      scene,
      false,     // CPU particle system
      basePath   // rootUrl
    )) as ParticleSystem;

    ps.emitter = emitter;
    if (isMobile) ps.emitRate *= 0.5;
    if (season === activeIn) ps.start();
    else ps.stop();
    return ps;
  }

  useEffect(() => {
    if (
      !scene ||
      leafMeshes.length   === 0 ||
      treeMeshes.length   === 0
    ) {
      return;
    }

    const allLeafInstances: InstancedMesh[]   = [];
    const allFlowerInstances: InstancedMesh[] = [];
    const allRedLeafInstances: InstancedMesh[] = [];


    if (season === Season.Spring) {
      allLeafInstances.forEach(inst => inst.scaling.setAll(0));
      allFlowerInstances.forEach(inst => inst.scaling.setAll(1));
      allRedLeafInstances.forEach(inst => { if (inst.material) inst.material.alpha = 0; });
    } else {
      allLeafInstances.forEach(inst => inst.scaling.setAll(1));
      allFlowerInstances.forEach(inst => inst.scaling.setAll(0));
    }

    const GLOBAL_SCALE = 0.3;
    const root = new TransformNode('SceneRoot', scene);
    root.position.set(0, -1, 0);
    root.scaling.set(1.8, 1.8, 1.8);

    const target = scene.getMeshByName('tree')?.position ?? Vector3.Zero();

    const camera = new ArcRotateCamera(
      'mainCamera',
      Tools.ToRadians(135), // alpha (horizontal angle)
      Tools.ToRadians(65),  // beta (vertical angle)
      10,                   // radius (distance from target)
      target,
      scene
    );

    // Orbit constraints
    // Mobile auto-rotates at its own angle; desktop orbits stay near eye level so the sky stays in frame.
    camera.lowerBetaLimit = Tools.ToRadians(isMobile ? 45 : 55);
    camera.upperBetaLimit = Tools.ToRadians(95);   // About eye level
    camera.lowerRadiusLimit = 3;                  // Zoom-in limit
    camera.upperRadiusLimit = 12;               // Zoom-out limit
    camera.allowUpsideDown = false;
    camera.panningSensibility = 0;                // ❌ Disable panning

    if (isMobile) {
      // Portrait screens: fix the horizontal field of view so the whole tree fits the width,
      // and aim lower so the tree sits in the upper part of the screen above the text.
      camera.fovMode = Camera.FOVMODE_HORIZONTAL_FIXED;
      camera.fov = 1.05;
      camera.radius = 8.5;
      camera.target = new Vector3(0, 0.9, 0);
      // No touch orbit on phones: a swipe should scroll the page. Turn slowly instead.
      camera.useAutoRotationBehavior = true;
      if (camera.autoRotationBehavior) {
        camera.autoRotationBehavior.idleRotationSpeed = 0.06;
        camera.autoRotationBehavior.idleRotationWaitTime = 0;
        camera.autoRotationBehavior.idleRotationSpinupTime = 0;
      }
    } else {
      // Eye-level framing: the canopy sits against the sky and the tree takes the left half,
      // clear of the content panel on the right. Radius stays inside the courtyard walls.
      camera.target = new Vector3(0, 1.6, 0);
      camera.alpha = Tools.ToRadians(140);
      camera.beta = Tools.ToRadians(83);
      camera.radius = 9;
      camera.fov = 0.95;
      camera.targetScreenOffset = new Vector2(-1.8, 0);
      camera.attachControl(undefined, true);
    }
    scene.activeCamera = camera;

    // Sky: a gradient dome built in Garden.ts.

    // ─── Tree setup ─────────────────────────
    const treeRoot = treeMeshes[0];
    treeRoot.parent = root;

    // The tree renders with its own glTF PBR material.

    // ─── Flower instancing ───────────────────────
    const flowerPlane = MeshBuilder.CreatePlane("flowerPlane", { size: 1 }, scene);
    flowerPlane.isVisible = false;
    flowerPlane.registerInstancedBuffer("faceNormal", 3);
    flowerPlane.registerInstancedBuffer("shadeOffset", 1);

    const flowerMat = new CustomMaterial("flowerMat", scene);
    flowerMat.diffuseTexture = new Texture(
      `${basePath}/textures/sakura_flowers.png`,
      scene
    );
    flowerMat.diffuseTexture.hasAlpha = true;
    flowerMat.alphaCutOff = 0.5;
    flowerMat.emissiveTexture = new Texture(
      `${basePath}/textures/h_pinkRamp.png`, scene
    );

    // copy over your vertex/fragment blocks (minus emissiveSampler usage)
    flowerMat.Vertex_Definitions(
      `#ifdef INSTANCES
        attribute vec3 faceNormal;
        attribute float shadeOffset;
        varying vec3 vFaceNormal;
        varying float vShadeOffset;
      #endif
      varying vec2 vUV;`
    );
    flowerMat.Vertex_MainBegin(`vUV = uv;`);
    flowerMat.Vertex_After_WorldPosComputed(
      `#ifdef INSTANCES
        vFaceNormal = normalize((finalWorld * vec4(faceNormal, 0.0)).xyz);
        vShadeOffset = shadeOffset;
      #endif`
    );
    flowerMat.Fragment_Definitions(
      `varying vec3 vFaceNormal;
      varying vec2 vUV;
      varying float vShadeOffset;
      uniform sampler2D ambientSampler;`
    );
    flowerMat.Fragment_Custom_Diffuse(
      `float a = texture2D(diffuseSampler, vUV).a;
      if (a < 0.5) discard;

      float ndl = max(dot(normalize(vFaceNormal), normalize(vec3(1.0,1.0,0.5))), 0.0);
      float u = clamp(ndl + vShadeOffset, 0.0, 1.0);
      vec3 col = vec3(1.0, 0.8, 0.9); // a soft pink fallback
      col = texture2D(diffuseSampler, vUV).rgb;
      float ao = texture2D(ambientSampler, vUV).r;
      diffuseColor = col * ao;`
    );
    flowerMat.Fragment_Custom_Alpha(`alpha = texture2D(diffuseSampler, vUV).a;`);

    flowerPlane.material = flowerMat;

    // now build your instance centers & normals (same as leaves)
    const emitter = leafMeshes.find(m => m.name === 'LeafEmitter')!;
    emitter.scaling.scaleInPlace(GLOBAL_SCALE);
    emitter.isVisible = false;

    const fpos = emitter.getVerticesData("position")!;
    const find = emitter.getIndices()!;
    const centers: Vector3[] = [];
    const normals: Vector3[] = [];

    for (let i = 0; i < find.length; i += 3) {
      const [i0, i1, i2] = [find[i], find[i + 1], find[i + 2]];
      const v0 = new Vector3(...fpos.slice(i0 * 3, i0 * 3 + 3));
      const v1 = new Vector3(...fpos.slice(i1 * 3, i1 * 3 + 3));
      const v2 = new Vector3(...fpos.slice(i2 * 3, i2 * 3 + 3));
      centers.push(v0.add(v1).add(v2).scale(1 / 3));
      normals.push(Vector3.Cross(v1.subtract(v0), v2.subtract(v0)).normalize());
    }

    // create ~65% as many petals as leaves
    const flowerInstances: InstancedMesh[] = [];

    // ─── Leaf instancing ───────────────────────
    const leafPlane = MeshBuilder.CreatePlane("leafPlane", { size: 1 }, scene);
    leafPlane.isVisible = false;
    leafPlane.registerInstancedBuffer('faceNormal', 3);
    leafPlane.registerInstancedBuffer('shadeOffset', 1);

    const leafMat = new CustomMaterial('leafMat', scene);
    leafMat.diffuseTexture = new Texture(`${basePath}/textures/alphaleaf.png`, scene);
    leafMat.diffuseTexture.hasAlpha = true;
    leafMat.alphaCutOff = 0.7;
    leafMat.alpha = 1;
    leafMat.emissiveTexture = new Texture(`${basePath}/textures/grass_ramp.png`, scene);
    leafMat.specularColor = new Color3(0.1, 0.3, 0.1);
    leafMat.specularPower = 128;
    // The ramp is applied in the shader; a weaker emissive pass keeps the green from going neon.
    leafMat.emissiveTexture.level = 0.4;

    leafMat.Vertex_Definitions(
      `#ifdef INSTANCES
        attribute vec3 faceNormal;
        attribute float shadeOffset;
        varying vec3 vFaceNormal;
        varying float vShadeOffset;
      #endif
      varying vec2 vUV;`
    );
    leafMat.Vertex_MainBegin(`vUV = uv;`);
    leafMat.Vertex_After_WorldPosComputed(
      `#ifdef INSTANCES
        vFaceNormal = normalize((finalWorld * vec4(faceNormal, 0.0)).xyz);
        vShadeOffset = shadeOffset;
      #endif`
    );
    leafMat.Fragment_Definitions(
      `varying vec3 vFaceNormal;
      varying vec2 vUV;
      varying float vShadeOffset;
      uniform sampler2D ambientSampler;`
    );
    leafMat.Fragment_Custom_Diffuse(
      `float a = texture2D(diffuseSampler, vUV).a;
      if (a < 0.5) discard;

      float ndl = max(dot(normalize(vFaceNormal), normalize(vec3(1.0,1.0,0.5))), 0.0);
      float u = clamp(ndl + vShadeOffset, 0.0, 1.0);
      vec3 rampCol = texture2D(emissiveSampler, vec2(u, 0.5)).rgb;
      float ao = texture2D(ambientSampler, vUV).r;
      rampCol *= ao;
      // Pull the ramp back from neon: a little less saturation and brightness.
      rampCol = mix(vec3(dot(rampCol, vec3(0.299, 0.587, 0.114))), rampCol, 0.8) * 0.85;
      rampCol *= vec3(0.8, 0.9, 0.72); // deeper, less yellow summer green
      diffuseColor = rampCol;`
    );
    leafMat.Fragment_Custom_Alpha(`alpha = texture2D(diffuseSampler, vUV).a * alpha;`);
    leafPlane.material = leafMat;

    // ─── Red‐leaf instancing (fall tint) ────────────────────
    const redLeafPlane = leafPlane.clone("redLeafPlane")!;
    redLeafPlane.isVisible = false;

    // **CRUCIAL** register the same instancedBuffers on the clone:
    redLeafPlane.registerInstancedBuffer('faceNormal', 3);
    redLeafPlane.registerInstancedBuffer('shadeOffset', 1);

    // build a new material but *reuse* the same shader blocks:
    const redLeafMat = new CustomMaterial('redLeafMat', scene);
    redLeafMat.diffuseTexture  = leafMat.diffuseTexture;
    redLeafMat.diffuseTexture.hasAlpha = true;
    redLeafMat.alphaCutOff     = leafMat.alphaCutOff;
    redLeafMat.alpha = 0;
    redLeafMat.emissiveTexture = new Texture(`${basePath}/textures/h_redRamp.png`, scene);
    redLeafMat.specularColor   = leafMat.specularColor.clone();
    redLeafMat.specularPower   = leafMat.specularPower;

    // **copy exactly** the same overrides you did for leafMat:
    redLeafMat.Vertex_Definitions(
      `#ifdef INSTANCES
        attribute vec3 faceNormal;
        attribute float shadeOffset;
        varying vec3 vFaceNormal;
        varying float vShadeOffset;
      #endif
      varying vec2 vUV;`
    );
    redLeafMat.Vertex_MainBegin(`vUV = uv;`);
    redLeafMat.Vertex_After_WorldPosComputed(
      `#ifdef INSTANCES
        vFaceNormal = normalize((finalWorld * vec4(faceNormal, 0.0)).xyz);
        vShadeOffset = shadeOffset;
      #endif`
    );
    redLeafMat.Fragment_Definitions(
      `varying vec3 vFaceNormal;
      varying vec2 vUV;
      varying float vShadeOffset;
      uniform sampler2D ambientSampler;`
    );
    redLeafMat.Fragment_Custom_Diffuse(
      `float a = texture2D(diffuseSampler, vUV).a;
      if (a < 0.5) discard;
      float ndl = max(dot(normalize(vFaceNormal), normalize(vec3(1.0,1.0,0.5))), 0.0);
      float u = clamp(ndl + vShadeOffset, 0.0, 1.0);
      vec3 rampCol = texture2D(emissiveSampler, vec2(u, 0.5)).rgb;
      float ao = texture2D(ambientSampler, vUV).r;
      rampCol *= ao;
      diffuseColor = rampCol;`
    );
    redLeafMat.Fragment_Custom_Alpha(`alpha = texture2D(diffuseSampler, vUV).a * alpha;`);

    redLeafPlane.material = redLeafMat;

    emitter.scaling.scaleInPlace(GLOBAL_SCALE);
    emitter.isVisible = false;
    const positions = emitter.getVerticesData('position')!;
    const indices = emitter.getIndices()!;
    const faceCenters: Vector3[] = [];
    const faceNormals: Vector3[] = [];
    for (let i = 0; i < indices.length; i += 3) {
      const [i0, i1, i2] = [indices[i], indices[i + 1], indices[i + 2]];
      const v0 = new Vector3(...positions.slice(i0 * 3, i0 * 3 + 3));
      const v1 = new Vector3(...positions.slice(i1 * 3, i1 * 3 + 3));
      const v2 = new Vector3(...positions.slice(i2 * 3, i2 * 3 + 3));
      faceCenters.push(v0.add(v1).add(v2).scale(1 / 3));
      faceNormals.push(Vector3.Cross(v1.subtract(v0), v2.subtract(v0)).normalize());
    }

    const allInstances: InstancedMesh[] = [];
    const allBushes = BUSH_POSITIONS.map((pos, bi) => {
      const bush = new TransformNode(`bush${bi}`, scene);
      bush.parent = root;
      bush.position.copyFrom(pos);
      bush.scaling.scaleInPlace(GLOBAL_SCALE);

      faceCenters.forEach((ctr, idx) => {
        if (Math.random() > 0.2) return;
        const n = faceNormals[idx];
        const inst = leafPlane.createInstance(`b${bi}_l${idx}`);
        inst.parent = bush;
        inst.position = ctr.add(n.scale(0.01));
        inst.billboardMode = Mesh.BILLBOARDMODE_ALL;
        const s = 0.5 + Math.random() * 0.7;
        inst.scaling = new Vector3(s, s, s);
        inst.rotation.z = Math.random() * Math.PI * 2;
        inst.instancedBuffers.faceNormal = [n.x, n.y, n.z];
        inst.instancedBuffers.shadeOffset = [Math.random() * 0.2 - 0.1];
        allLeafInstances.push(inst);
      });

      // ─── Flower instancing (only ~65% as many as leaves) ───
      faceCenters.forEach((ctr, idx) => {
        if (Math.random() < 0.125) {
          const n = faceNormals[idx];
          const inst = flowerPlane.createInstance(`flw_${bi}_${idx}`);
          inst.parent = bush;
          inst.position = ctr.add(n.scale(0.01));
          inst.billboardMode = Mesh.BILLBOARDMODE_ALL;
          const s = 0.05 + Math.random() * 0.18;  // smaller than leaves
          inst.scaling = new Vector3(s, s, s);
          inst.rotation.z = Math.random() * Math.PI * 2;
          inst.instancedBuffers.faceNormal = [n.x, n.y, n.z];
          inst.instancedBuffers.shadeOffset = [Math.random() * 0.1 - 0.05];
          allFlowerInstances.push(inst);
        }
      });

      // ─── Red Leaf instancing (only ~65% as many as leaves) ───
      faceCenters.forEach((ctr, idx) => {
        if (Math.random() > 0.2) return;
        const n = faceNormals[idx];
        const inst = redLeafPlane.createInstance(`rb${bi}_l${idx}`);
        inst.parent = bush;
        inst.position = ctr.add(n.scale(0.01));
        inst.billboardMode = Mesh.BILLBOARDMODE_ALL;
        const s = 0.5 + Math.random() * 0.7;
        inst.scaling = new Vector3(s, s, s);
        inst.rotation.z = Math.random() * Math.PI * 2;
        inst.instancedBuffers.faceNormal = [n.x, n.y, n.z];
        inst.instancedBuffers.shadeOffset = [Math.random() * 0.2 - 0.1];
        allRedLeafInstances.push(inst);
      });

      return bush;
    });

    if (season === Season.Spring) {
      // hide leaves, show flowers
      allLeafInstances.forEach(i => i.scaling.setAll(0));
      allFlowerInstances.forEach(i => i.scaling.setAll(0.85));
    } else {
      // show leaves, hide flowers
      allLeafInstances.forEach(i => i.scaling.setAll(1));
      allFlowerInstances.forEach(i => i.scaling.setAll(0));
    }

    const windObs = scene.onBeforeRenderObservable.add(() => {
      const t = performance.now() * 0.001;
      allInstances.forEach((i, x) => {
        i.rotation.z = Math.sin(t + x * 0.15) * 0.05;
      });
      allFlowerInstances.forEach((i, x) => {
        i.rotation.z = Math.sin(t + x * 0.15) * 0.05;
      });
      allRedLeafInstances.forEach((i, x) => {
        i.rotation.z = Math.sin(t + x * 0.15) * 0.1;
      });
    });

    // ─── Cel-shaded hilltop garden, grass and meadow (Garden.ts) ───────
    const garden = buildGarden(scene, { isMobile, season, tree: treeMeshes });
    gardenRef.current = garden;

    // Post: FXAA, a soft bloom on the sky (desktop) and a gentle vignette. No filmic tone
    // mapping: the toon palette is authored in display colours.
    const pipeline = new DefaultRenderingPipeline('post', true, scene, [camera]);
    pipeline.fxaaEnabled = true;
    pipeline.bloomEnabled = false; // the soft palette needs no glow; bloom only greyed it out
    pipeline.bloomThreshold = 0.97;
    pipeline.bloomWeight = 0.08;
    pipeline.bloomKernel = 48;
    pipeline.imageProcessingEnabled = true;
    const ip = scene.imageProcessingConfiguration;
    ip.toneMappingEnabled = false;
    ip.contrast = 1.03;
    ip.vignetteEnabled = true;
    ip.vignetteWeight = 0.9;
    ip.vignetteStretch = 0.4;
    ip.vignetteColor = new Color4(0.08, 0.05, 0.12, 0);

    applyMood(scene, season);

    scene.executeWhenReady(() => onReady?.());

    return () => {
      scene.onBeforeRenderObservable.remove(windObs);
      allInstances.forEach(i => i.dispose());
      allBushes.forEach(b => b.dispose());
      leafMat.dispose();
      leafPlane.dispose();
      flowerInstances.forEach(i => i.dispose());
      flowerPlane.dispose();
      flowerMat.dispose();
      gardenRef.current = null;
      garden.dispose();
      pipeline.dispose();
      camera.dispose();
      root.dispose();
    };
  }, [scene, leafMeshes, treeMeshes]);

  useEffect(() => {
    let alive = true;

    Promise.all([
      loadParticleSystem(scene, 'petals',   'petals',   otherEmitter,  Season.Spring),
      loadParticleSystem(scene, 'leafs',    'leafs',    otherEmitter,  Season.Summer),
      loadParticleSystem(scene, 'redLeafs', 'redLeafs', otherEmitter,  Season.Fall),
      loadParticleSystem(scene, 'snow',     'snow',     winterEmitter, Season.Winter)
    ]).then(([petals, green, red, snow]) => {
      if (!alive) return;
      setPetalPS(petals);
      setGreenPS(green);
      setRedPS(red);
      setSnowPS(snow);
    });

    return () => { alive = false; };
  }, [scene, basePath]);

  useEffect(() => {

    if (!petalPS || !greenPS || !redPS || !snowPS) return;

    onPetalPS?.(petalPS);
    onGreenPS?.(greenPS);
    onRedPS?.(redPS);
    onSnowPS?.(snowPS);
  }, [petalPS, greenPS, redPS, snowPS]);

  useEffect(() => {
  if (!scene) return;

  const applySeason = (s: Season) => {
    // grab your existing scene objects
    const leafMat    = scene.getMaterialByName('leafMat')    as CustomMaterial;
    const redLeafMat = scene.getMaterialByName('redLeafMat') as CustomMaterial;
    const light   = scene.lights[0]! as any;
    // **look up the right material names**:

    // maps of Season → value
    const lightColorMap: Record<Season, Color3> = {
      [Season.Spring]: Color3.FromHexString('#FAFDE1').toLinearSpace(),
      [Season.Summer]: Color3.FromHexString('#FFF8E0').toLinearSpace(),
      [Season.Fall]:   Color3.FromHexString('#FFD1A3').toLinearSpace(),
      [Season.Winter]: Color3.FromHexString('#C8E8FF').toLinearSpace(),
    };
    const leafColorMap: Record<Season, Color3> = {
      [Season.Spring]: Color3.FromHexString('#8CCF3B').toLinearSpace(),
      [Season.Summer]: Color3.Green(),
      [Season.Fall]:   Color3.FromHexString('#A63A0D').toLinearSpace(),
      [Season.Winter]: Color3.FromHexString('#7A7A7A').toLinearSpace(),
    };
    const leafAlphaMap: Record<Season, number> = {
      [Season.Spring]: 0.7,
      [Season.Summer]: 0.7,
      [Season.Fall]:   0.6,
      [Season.Winter]: 0.8,
    };

    leafMat   .alpha = (season === Season.Fall ? 0 : 1);
    redLeafMat.alpha = (season === Season.Fall ? 1 : 0);

    // apply light, leaves, snow & grass
    light.diffuse        = lightColorMap[s];
    leafMat.diffuseColor = leafColorMap[s];
    leafMat.alphaCutOff  = leafAlphaMap[s];


    applyMood(scene, s);
  };

  // run once on mount to snap to the current season
  applySeason(season);
}, [scene]);

  return null;

};

export default Content;