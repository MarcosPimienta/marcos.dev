import React, { useEffect, useRef } from 'react';// registers shaders in Effect.ShadersStore
import {
  Vector3,
  Color3,
  Texture,
  Mesh,
  InstancedMesh,
  MeshBuilder
} from '@babylonjs/core';
import { CustomMaterial } from '@babylonjs/materials';
import { useScene, useModel } from 'reactylon';
import '@babylonjs/loaders';

const Content: React.FC = () => {
  const scene = useScene();
  const { meshes: loadedMeshes } = useModel('meshes/leaf_emitter.glb');
  const leafPlaneRef = useRef<Mesh>(null!);

  useEffect(() => {
    if (!scene || !leafPlaneRef.current || loadedMeshes.length === 0) {
      return;
    }
    const leafPlane = leafPlaneRef.current;
    leafPlane.isVisible = false;

    // ─── Register per-instance faceNormal buffer ───────────────────────────────
    leafPlane.registerInstancedBuffer("faceNormal", 3);

    // 1) Create your CustomMaterial
    const leafMat = new CustomMaterial('leafMat', scene);

    // 1) In the VERTEX stage: declare our instanced attribute + varying
    leafMat.Vertex_Definitions(`
    #ifdef INSTANCES
    attribute vec3 faceNormal;
    varying vec3 vFaceNormal;
    #endif
    `);

    // 2) At the top of main(): copy faceNormal into vFaceNormal
    leafMat.Vertex_MainBegin(`
    #ifdef INSTANCES
        vFaceNormal = faceNormal;
    #endif
    `);

    // 3) In the FRAGMENT stage: declare the varying
    leafMat.Fragment_Definitions(`
    varying vec3 vFaceNormal;
    `);

    // 4) Override the diffuse term to use vFaceNormal
    leafMat.Fragment_Custom_Diffuse(`
        vec3 N = normalize(vFaceNormal);
        vec3 L = normalize(vec3(1.0, 1.0, 0.5));
        float ndl = max(dot(N, L), 0.0);
        diffuseColor.rgb *= ndl;
    `);

    // 5) Usual texture + alpha
    leafMat.diffuseTexture = new Texture('textures/alphaleaf.png', scene);
    leafMat.diffuseTexture.hasAlpha = true;
    leafMat.emissiveColor = new Color3(0.1, 0.1, 0.1);
    leafMat.backFaceCulling = true;

    // Finally assign it
    leafPlane.material = leafMat;

    // ─── Hide emitter and extract geometry ────────────────────────────────────
    const emitter = loadedMeshes.find(m => m.name === 'LeafEmitter') ?? loadedMeshes[0];
    emitter.isVisible = false;
    const positions = emitter.getVerticesData('position')!;
    const indices   = emitter.getIndices()!;

    // ─── Compute face centers & normals ────────────────────────────────────────
    const faceCenters: Vector3[] = [];
    const faceNormals: Vector3[] = [];
    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i] * 3;
      const i1 = indices[i + 1] * 3;
      const i2 = indices[i + 2] * 3;
      const v0 = new Vector3(positions[i0],     positions[i0 + 1],     positions[i0 + 2]);
      const v1 = new Vector3(positions[i1],     positions[i1 + 1],     positions[i1 + 2]);
      const v2 = new Vector3(positions[i2],     positions[i2 + 1],     positions[i2 + 2]);
      faceCenters.push(v0.add(v1).add(v2).scale(1 / 3));
      faceNormals.push(Vector3.Cross(v1.subtract(v0), v2.subtract(v0)).normalize());
    }

    // ─── Instantiate leaves (random 20% sampling) ──────────────────────────────
    const density = 0.2;
    const instances: InstancedMesh[] = [];
    faceCenters.forEach((center, idx) => {
      if (Math.random() > density) return;
      const normal = faceNormals[idx];
      const inst = leafPlane.createInstance(`leafInst_${idx}`);
      inst.position        = center.add(normal.scale(0.01));
      inst.billboardMode   = Mesh.BILLBOARDMODE_ALL;
      const s              = 0.5 + Math.random() * 0.7;
      inst.scaling         = new Vector3(s, s, s);
      inst.rotation.z      = Math.random() * Math.PI * 2;
      inst.instancedBuffers.faceNormal = [normal.x, normal.y, normal.z];
      instances.push(inst);
    });

    // ─── Simple wind sway ──────────────────────────────────────────────────────
    const windObserver = scene.onBeforeRenderObservable.add(() => {
      const t = performance.now() * 0.001;
      instances.forEach((inst, i) => {
        inst.rotation.z = Math.sin(t + i * 0.1) * 0.05;
      });
    });

    // ─── Cleanup on unmount ────────────────────────────────────────────────────
    return () => {
      scene.onBeforeRenderObservable.remove(windObserver);
      instances.forEach(i => i.dispose());
      leafMat.dispose();
      leafPlane.dispose();
    };
  }, [scene, loadedMeshes]);

  return (
    <plane
      ref={leafPlaneRef}
      name="leafPlane"
      options={{ size: 1 }}
    />
  );
};

export default Content;