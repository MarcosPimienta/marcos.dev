import React, { useEffect, useRef } from 'react'; // registers shaders in Effect.ShadersStore
import {
  Vector3,
  Color3,
  Texture,
  Mesh,
  InstancedMesh,
} from '@babylonjs/core';
import { CustomMaterial } from '@babylonjs/materials';
import { TransformNode } from '@babylonjs/core/Meshes';
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

    // ─── Register per-instance buffers ─────────────────────────────────────
    leafPlane.registerInstancedBuffer('faceNormal', 3);
    leafPlane.registerInstancedBuffer('shadeOffset', 1); // new

    // ─── Setup CustomMaterial ───────────────────────────────────────────────
    const leafMat = new CustomMaterial('leafMat', scene);

    // ─── 1) Diffuse = your leaf mask ─────────────────────────────────────────
    leafMat.diffuseTexture        = new Texture('textures/alphaleaf.png', scene);
    leafMat.diffuseTexture.hasAlpha = true;
    leafMat.backFaceCulling       = true;

    // ─── 2) Emissive = your green ramp ──────────────────────────────────────
    //     (we'll sample this as emissiveSampler in the fragment)
    leafMat.emissiveTexture       = new Texture('textures/greenRamp.png', scene);
    leafMat.emissiveTexture.hasAlpha = false;

    // ─── 3) VERTEX STAGE ─────────────────────────────────────────────────────
    // 3a) Declare your instanced normals and varyings
    leafMat.Vertex_Definitions(`
    #ifdef INSTANCES
      attribute vec3 faceNormal;
      varying   vec3 vFaceNormal;
    #endif
    varying vec2 vUV;
    `);

    // 3b) Copy your UV immediately
    leafMat.Vertex_MainBegin(`
      vUV = uv;
    `);

    // 3c) BEFORE the engine applies billboards/instances, bake world‐space normals
    leafMat.Vertex_Before_PositionUpdated(`
    #ifdef INSTANCES
      vFaceNormal = normalize((world * vec4(faceNormal, 0.0)).xyz);
    #endif
    `);

    // ─── 4) FRAGMENT STAGE ────────────────────────────────────────────────────
    // 4a) Declare the varyings (no need to re‐declare samplers)
    leafMat.Fragment_Definitions(`
    varying vec3  vFaceNormal;
    varying vec2  vUV;
    `);

    // 4b) CustomDiffuse: mask, compute ndl, then lookup your green ramp
    leafMat.Fragment_Custom_Diffuse(`
      // 1) leaf shape mask
      float alphaMask = texture2D(diffuseSampler, vUV).a;
      if (alphaMask < 0.5) { discard; }

      // 2) compute your own N·L
      float ndl = max(dot(normalize(vFaceNormal), normalize(vec3(1.0,1.0,0.5))), 0.0);

      // 3) sample the 1D green ramp
      vec3 foliageColor = texture2D(emissiveSampler, vec2(ndl, 0.5)).rgb;

      // 4) output that green
      diffuseColor = foliageColor;
    `);

    // 4c) Pass the alpha through so you keep the leaf silhouette
    leafMat.Fragment_Custom_Alpha(`
      alpha = texture2D(diffuseSampler, vUV).a;'
    `);

    // texture + alpha settings
    leafMat.diffuseTexture      = new Texture('textures/alphaleaf.png', scene);
    leafMat.diffuseTexture.hasAlpha = true;
    leafMat.backFaceCulling     = true;

    leafPlane.material = leafMat;

    // ─── Extract emitter geometry ────────────────────────────────────────────
    const emitter =
      loadedMeshes.find((m) => m.name === 'LeafEmitter') ?? loadedMeshes[0];
    emitter.isVisible = false;
    const positions = emitter.getVerticesData('position')!;
    const indices   = emitter.getIndices()!;

    // Compute face centers & normals
    const faceCenters: Vector3[] = [];
    const faceNormals: Vector3[] = [];
    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i]     * 3;
      const i1 = indices[i + 1] * 3;
      const i2 = indices[i + 2] * 3;
      const v0 = new Vector3(positions[i0], positions[i0 + 1], positions[i0 + 2]);
      const v1 = new Vector3(positions[i1], positions[i1 + 1], positions[i1 + 2]);
      const v2 = new Vector3(positions[i2], positions[i2 + 1], positions[i2 + 2]);
      faceCenters.push(v0.add(v1).add(v2).scale(1 / 3));
      faceNormals.push(Vector3.Cross(v1.subtract(v0), v2.subtract(v0)).normalize());
    }

    // Instantiate leaves, now also fill shadeOffset
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
      inst.instancedBuffers.faceNormal  = [normal.x, normal.y, normal.z];
      // give each leaf a random brightness offset in [-0.1 .. +0.1]
      inst.instancedBuffers.shadeOffset = [Math.random() * 0.2 - 0.1];
      instances.push(inst);
    });

    const bush00 = new TransformNode('bush00', scene);
    instances.forEach(inst => inst.parent = bush00);

    // Now you can _clone_ the entire hierarchy (bush + all its children)
    // with a normal deep clone:
    const bush01 = bush00.clone('bush01', null /* newParent */, true /* cloneChildren */)!;
    bush01.position.set(5, 2, 1);

    // Wind sway
    const windObserver = scene.onBeforeRenderObservable.add(() => {
      const t = performance.now() * 0.001;
      instances.forEach((inst, i) => {
        inst.rotation.z = Math.sin(t + i * 0.1) * 0.05;
      });
    });

    // Cleanup
    return () => {
      scene.onBeforeRenderObservable.remove(windObserver);
      instances.forEach(i => i.dispose());
      bush00.dispose();   // this also disposes all children
      bush01.dispose();   // if you created instances
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