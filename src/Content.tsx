import React, { useEffect, useState } from 'react';
import {
  Vector3,
  Color3,
  PostProcess,
  Effect,
  Texture,
  Mesh,
  InstancedMesh,
  StandardMaterial,
  CubeTexture,
  MeshBuilder,
  ArcRotateCamera,
  PBRMaterial,
  Tools
} from '@babylonjs/core';
import { CustomMaterial, CellMaterial } from '@babylonjs/materials';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { useScene, useModel, register } from 'reactylon';
import { SSAO2RenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/ssao2RenderingPipeline';
import '@babylonjs/loaders';
import { getBasePath } from './config';

export enum Season {
  Spring = 'spring',
  Summer = 'summer',
  Fall   = 'fall',
  Winter = 'winter',
};
interface ContentProps {
  season: Season;
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
export const Content: React.FC<ContentProps> = ({ season }) => {
  const scene = useScene();
  const basePath = getBasePath();
  const { meshes: leafMeshes } = useModel(`${basePath}/meshes/leaf_emitter.glb`);
  const { meshes: treeMeshes } = useModel(`${basePath}/meshes/SakuraTree.glb`);
  const { meshes: hillMeshes } = useModel(`${basePath}/meshes/Hill.glb`);
  const { meshes: grassEmitter } = useModel(`${basePath}/meshes/GrassEmitter.glb`);
  const { meshes: smallWallMeshes } = useModel(`${basePath}/meshes/SmallerWalls.glb`);
  const { meshes: snowMeshes } = useModel(`${basePath}/meshes/Snow.glb`);

  useEffect(() => {
    if (
      !scene ||
      leafMeshes.length   === 0 ||
      treeMeshes.length   === 0 ||
      hillMeshes.length   === 0 ||
      grassEmitter.length === 0 ||
      smallWallMeshes.length === 0
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
    camera.lowerBetaLimit = Tools.ToRadians(45);   // Prevent going too low
    camera.upperBetaLimit = Tools.ToRadians(98);   // Prevent flipping over
    camera.lowerRadiusLimit = 3;                  // Zoom-in limit
    camera.upperRadiusLimit = 7;                // Zoom-out limit
    camera.allowUpsideDown = false;
    camera.panningSensibility = 0;                // ❌ Disable panning

    camera.attachControl(undefined, true);
    // ─── Defer SSAO until scene is fully initialized ─────────────────────────
      try {
        if (scene.activeCamera) {
          new SSAO2RenderingPipeline(
            "ssao",
            scene,
            0.5,
            [scene.activeCamera]
          );
        }
      } catch (e) {
        console.warn("SSAO pipeline failed to initialize:", e);
      }
    scene.activeCamera = camera;

    // Skybox
    const skyContainer = new TransformNode("skyContainer", scene);

    function makeSky(name: string, initialAlpha: number) {
      const sky = MeshBuilder.CreateBox(name, { size: 500 }, scene);
      sky.parent            = skyContainer;
      sky.infiniteDistance  = true;      // always behind everything
      sky.isPickable        = false;     // don’t ray‑pick it
      sky.renderingGroupId  = 0;         // render first
      const mat = new StandardMaterial(name + "Mat", scene);
      mat.backFaceCulling   = false;
      mat.disableLighting   = true;
      mat.disableDepthWrite = true;      // <-- crucial!
      mat.alpha             = initialAlpha;
      sky.material          = mat;
      return { sky, mat };
    }

    // 1) make the two skyboxes
    const { sky: skybox1, mat: skyMat1 } = makeSky("skyBox1", 1);
    const { sky: skybox2, mat: skyMat2 } = makeSky("skyBox2", 0);

    // 2) assign each its cube texture *before* you set coordinatesMode
    const faces = ["_px.png","_py.png","_pz.png","_nx.png","_ny.png","_nz.png"];

    skyMat1.reflectionTexture = new CubeTexture(
      `${basePath}/textures/skybox/sky_spring`, scene, faces
    );
    skyMat1.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

    skyMat2.reflectionTexture = new CubeTexture(
      `${basePath}/textures/skybox/sky_spring`, scene, faces
    );
    skyMat2.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

    // ─── Wall setup ─────────────────────────
    const walls = smallWallMeshes.find(m => m.name === 'LargeWalls') ?? smallWallMeshes[0];
    walls.position.set(0, -1.8, 0);
    walls.isVisible = true;

    // ─── Snow setup ─────────────────────────
    const snow = snowMeshes.find(m => m.name === 'Snow') ?? snowMeshes[0];
    snow.position.set(0, -3, 0);
    snow.isVisible = true;

    // Load ground from height map
    const ground = MeshBuilder.CreateGroundFromHeightMap(
      "sandGround",
      "./textures/sand_height_waves.png", // ✅ your heightmap image
      {
        width: 15,             // Width of ground
        height: 15,            // Height of ground
        subdivisions: 1000,     // More subdivisions = smoother
        minHeight: 0,          // Lowest height
        maxHeight: 0.15          // Highest height
      },
      scene
    );

    // Adjust position if needed
    ground.position.y = -1.5;

    // Create PBR Material for sand
    const sandPBRMat = new PBRMaterial("sandPBRMat", scene);

    // Albedo (diffuse) texture for sand color
    const albedoTex = new Texture(`${basePath}/textures/sand_diffuse.png`, scene);
    albedoTex.uScale = 10; // Tile
    albedoTex.vScale = 10;
    sandPBRMat.albedoTexture = albedoTex;

    // Macro height details
    const normalTex = new Texture(`${basePath}/textures/sand_normal.png`, scene);
    normalTex.uScale = 10;
    normalTex.vScale = 10;
    sandPBRMat.bumpTexture = normalTex;

    // PBR settings
    sandPBRMat.metallic = 0;
    sandPBRMat.roughness = 0.8;

    // Apply material
    ground.material = sandPBRMat;

    // ─── Tree setup ─────────────────────────
    const treeRoot = treeMeshes[0];
    treeRoot.parent = root;
    const cellMat = new CellMaterial('treeCell', scene);
    const origMat = treeRoot.material!;
    if (origMat instanceof PBRMaterial) {
      cellMat.diffuseTexture = origMat.albedoTexture as Texture;
      cellMat.diffuseColor = origMat.albedoColor.clone();
    } else if (origMat instanceof StandardMaterial) {
      cellMat.diffuseTexture = origMat.diffuseTexture as Texture;
      cellMat.diffuseColor = origMat.diffuseColor.clone();
    } else {
      cellMat.diffuseColor = new Color3(0.8, 0.8, 0.8);
    }
    cellMat.computeHighLevel = true;
    treeRoot.material = cellMat;

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
    flowerMat.Vertex_Before_PositionUpdated(
      `#ifdef INSTANCES
        vFaceNormal = normalize((world * vec4(faceNormal, 0.0)).xyz);
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
    leafMat.Vertex_Before_PositionUpdated(
      `#ifdef INSTANCES
        vFaceNormal = normalize((world * vec4(faceNormal, 0.0)).xyz);
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
    redLeafMat.Vertex_Before_PositionUpdated(
      `#ifdef INSTANCES
        vFaceNormal = normalize((world * vec4(faceNormal, 0.0)).xyz);
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

    //const emitter = leafMeshes.find(m => m.name === 'LeafEmitter') ?? leafMeshes[0];
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
        if (Math.random() < 0.1) {
          const n = faceNormals[idx];
          const inst = flowerPlane.createInstance(`flw_${bi}_${idx}`);
          inst.parent = bush;
          inst.position = ctr.add(n.scale(0.01));
          inst.billboardMode = Mesh.BILLBOARDMODE_ALL;
          const s = 0.3 + Math.random() * 0.5;  // smaller than leaves
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
      allFlowerInstances.forEach(i => i.scaling.setAll(1));
    } else {
      // show leaves, hide flowers
      allLeafInstances.forEach(i => i.scaling.setAll(1));
      allFlowerInstances.forEach(i => i.scaling.setAll(0));
    }

    // ─── Grass instancing ─────────────────────────────
    const grassPlane = MeshBuilder.CreatePlane("grassPlane", { size: 1 }, scene);
    const grassRoot = new TransformNode('GrassRoot', scene);
    grassRoot.position = new Vector3(0, -0.95, 0);
    grassRoot.parent = root;
    grassPlane.scaling.scaleInPlace(0.1);
    grassPlane.isVisible = false;
    grassPlane.registerInstancedBuffer('faceNormal', 3);
    grassPlane.registerInstancedBuffer('shadeOffset', 1);

    const grassMat = new CustomMaterial('grassMat', scene);
    grassMat.diffuseTexture = new Texture(`${basePath}/textures/grass_leaf.png`, scene);
    grassMat.diffuseTexture.hasAlpha = true;
    grassMat.alphaCutOff = 0.7;
    grassMat.emissiveTexture = new Texture(`${basePath}/textures/grass_ramp.png`, scene);
    grassMat.specularColor = new Color3(0.1, 0.3, 0.1);
    grassMat.specularPower = 128;

    grassMat.Vertex_Definitions(
      `#ifdef INSTANCES
        attribute vec3 faceNormal;
        attribute float shadeOffset;
        varying vec3 vFaceNormal;
        varying float vShadeOffset;
      #endif
      varying vec2 vUV;`
    );
    grassMat.Vertex_MainBegin(`vUV = uv;`);
    grassMat.Vertex_Before_PositionUpdated(
      `#ifdef INSTANCES
        vFaceNormal = normalize((world * vec4(faceNormal, 0.0)).xyz);
        vShadeOffset = shadeOffset;
      #endif`
    );
    grassMat.Fragment_Definitions(
      `varying vec3 vFaceNormal;
      varying vec2 vUV;
      varying float vShadeOffset;
      uniform sampler2D ambientSampler;`
    );
    grassMat.Fragment_Custom_Diffuse(
      `float a = texture2D(diffuseSampler, vUV).a;
      if (a < 0.5) discard;

      float ndl = max(dot(normalize(vFaceNormal), normalize(vec3(1.0,1.0,0.5))), 0.0);
      float u = clamp(ndl + vShadeOffset, 0.0, 1.0);
      vec3 rampCol = texture2D(emissiveSampler, vec2(u, 0.5)).rgb;
      float ao = texture2D(ambientSampler, vUV).r;
      rampCol *= ao;
      diffuseColor = rampCol;`
    );
    grassMat.Fragment_Custom_Alpha(`alpha = texture2D(diffuseSampler, vUV).a;`);
    grassPlane.material = grassMat;

    const hill = hillMeshes.find(m => m.name === 'Hill') ?? hillMeshes[0];
    hill.scaling = new Vector3(0.92, 0.445, 0.91);
    hill.parent = root;
    hill.isVisible = true;
    const hillMat = new StandardMaterial('hillCell', scene);
    hillMat.diffuseColor = Color3.FromHexString('#89EF00').toLinearSpace();
    hillMat.diffuseTexture = new Texture(`${basePath}/textures/HillBase.png`, scene);
    hillMat.emissiveTexture = new Texture(`${basePath}/textures/HillBase.png`, scene);
    hillMat.specularColor = new Color3(0, 0, 0);

    const baseEmitter = grassEmitter.find(m => m.name === 'GrassEmitt') ?? grassEmitter[0];
    baseEmitter.parent = root;
    baseEmitter.isVisible = false;

    const gPositions = baseEmitter.getVerticesData('position')!;
    const gIndices = baseEmitter.getIndices()!;
    const gFaceCenters: Vector3[] = [];
    const gFaceNormals: Vector3[] = [];
    for (let i = 0; i < gIndices.length; i += 3) {
      const [i0, i1, i2] = [gIndices[i], gIndices[i + 1], gIndices[i + 2]];
      const wm = baseEmitter.getWorldMatrix();
      const v0 = Vector3.TransformCoordinates(new Vector3(...gPositions.slice(i0 * 3, i0 * 3 + 3)), wm);
      const v1 = Vector3.TransformCoordinates(new Vector3(...gPositions.slice(i1 * 3, i1 * 3 + 3)), wm);
      const v2 = Vector3.TransformCoordinates(new Vector3(...gPositions.slice(i2 * 3, i2 * 3 + 3)), wm);
      const center = v0.add(v1).add(v2).scale(1 / 3);
      const normal = Vector3.Cross(v1.subtract(v0), v2.subtract(v0)).normalize();
      gFaceCenters.push(center);
      gFaceNormals.push(normal);
    }

    const grassInstances: InstancedMesh[] = [];

    gFaceCenters.forEach((center, idx) => {
      if (Math.random() > 0.4) return;
      const normal = gFaceNormals[idx];
      const inst = grassPlane.createInstance(`g_inst_${idx}`);
      inst.position = center.subtract(root.position); // compensate for root shift
      inst.parent = grassRoot;
      inst.billboardMode = Mesh.BILLBOARDMODE_ALL;
      const s = 0.15 + Math.random() * 0.15;
      inst.scaling = new Vector3(s, s, s);
      inst.rotation.z = Math.random() * Math.PI * 2;
      inst.instancedBuffers.faceNormal = [normal.x, normal.y, normal.z];
      inst.instancedBuffers.shadeOffset = [Math.random() * 0.2 - 0.1];
      grassInstances.push(inst);
    });

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
      grassInstances.forEach((g, x) => {
        g.rotation.z = Math.cos(t + x * 0.11) * 0.08;
      });
    });

    // PostProcess: Watercolor Shader
    Effect.ShadersStore["watercolorFragmentShader"] =
      `precision highp float;
      varying vec2 vUV;
      uniform sampler2D textureSampler;

      void main(void) {
        vec4 color = texture2D(textureSampler, vUV);
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        gray += (fract(sin(dot(vUV.xy, vec2(12.9898,78.233))) * 43758.5453123) - 0.5) * 0.05;
        vec3 finalColor = mix(color.rgb, vec3(gray), 0.3);
        gl_FragColor = vec4(finalColor, 1.0);
      }`
    ;
    console.log("Shader loaded?", "watercolorFragmentShader" in Effect.ShadersStore);
    const watercolorPost = new PostProcess(
      "watercolor",
      "watercolor",
      [],
      null,
      1.0,
      camera
    );

    return () => {
      scene.onBeforeRenderObservable.remove(windObs);
      allInstances.forEach(i => i.dispose());
      grassInstances.forEach(i => i.dispose());
      allBushes.forEach(b => b.dispose());
      leafMat.dispose();
      leafPlane.dispose();
      grassPlane.dispose();
      flowerInstances.forEach(i => i.dispose());
      flowerPlane.dispose();
      flowerMat.dispose();
      watercolorPost.dispose();
      camera.dispose();
      root.dispose();
    };
  }, [scene, leafMeshes, treeMeshes, hillMeshes, grassEmitter, smallWallMeshes]);

  useEffect(() => {
  if (!scene) return;

  const applySeason = (s: Season) => {
    // grab your existing scene objects
    const leafMat    = scene.getMaterialByName('leafMat')    as CustomMaterial;
    const redLeafMat = scene.getMaterialByName('redLeafMat') as CustomMaterial;
    const light   = scene.lights[0]! as any;
    const snow    = scene.getMeshByName('Snow')!;
    const grass   = scene.getTransformNodeByName('GrassRoot')!;
    // **look up the right material names**:
    const skyMat1 = scene.getMaterialByName('skyBox1Mat') as StandardMaterial;
    const skyMat2 = scene.getMaterialByName('skyBox2Mat') as StandardMaterial;

    // maps of Season → value
    const lightColorMap: Record<Season, Color3> = {
      [Season.Spring]: Color3.FromHexString('#FAFDE1').toLinearSpace(),
      [Season.Summer]: Color3.FromHexString('#FFF8E0').toLinearSpace(),
      [Season.Fall]:   Color3.FromHexString('#FFD1A3').toLinearSpace(),
      [Season.Winter]: Color3.FromHexString('#C8E8FF').toLinearSpace(),
    };
    const lightIntMap: Record<Season, number> = {
      [Season.Spring]: 1.1,
      [Season.Summer]: 1.2,
      [Season.Fall]:   0.8,
      [Season.Winter]: 0.9,
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
    light.intensity      = lightIntMap[s];
    leafMat.diffuseColor = leafColorMap[s];
    leafMat.alphaCutOff  = leafAlphaMap[s];
    snow.position.y      = s === Season.Winter ? -1.2 : -3;
    grass.position.y     = s === Season.Winter ? -2   : -1;

    // **only** snap which skybox is visible by alpha
    skyMat1.alpha = 1;
    skyMat2.alpha = 0;
  };

  // run once on mount to snap to the current season
  applySeason(season);
}, [scene]);

  return null;

};

export default Content;