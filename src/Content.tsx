import React, { useEffect, useRef } from 'react';
import {
  Vector3,
  Texture,
  Mesh,
  InstancedMesh,
} from '@babylonjs/core';
import { CustomMaterial } from '@babylonjs/materials';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { useScene, useModel } from 'reactylon';
import '@babylonjs/loaders';

const BUSH_POSITIONS: Vector3[] = [
  new Vector3(0.06557762622833252, 0.8502829074859619, -0.7880341410636902),
  new Vector3(0.5868279933929443, 1.112817406654358, -0.9235029816627502),
  new Vector3(0.4051384925842285, 1.3999630212783813, -0.8013388514518738),
  new Vector3(0.33284640312194824, 1.693808674812317, -0.7062320113182068),
  new Vector3(0.6092928647994995, 1.2891498804092407, -0.6166556477546692),
  new Vector3(-0.007989168167114258, 1.9301358461380005, -0.6251512169837952),
  new Vector3(-0.05481719970703125, 1.8864179849624634, -0.3209880292415619),
  new Vector3(-0.18184804916381836, 1.916474461555481, -0.028381457552313805),
  new Vector3(0.0927971601486206, 1.8493176698684692, 0.23593021929264069),
  new Vector3(0.335801362991333, 1.8970967531204224, 0.29833364486694336),
  new Vector3(0.014950871467590332, 1.6371179819107056, 0.48418354988098145),
  new Vector3(-0.025788843631744385, 1.545284390449524, 0.7898138761520386),
  new Vector3(-0.45574045181274414, 1.4868088960647583, 0.737837553024292),
  new Vector3(-0.4328174591064453, 1.2587710618972778, 0.6959860324859619),
  new Vector3(-0.567168116569519, 1.152464509010315, 0.41463804244995117),
  new Vector3(-0.23142874240875244, 1.2981840372085571, 0.25796544551849365),
];

const Content: React.FC = () => {
  const scene = useScene();
  const { meshes: loadedMeshes } = useModel('meshes/leaf_emitter.glb');
  const { meshes: treeMeshes } = useModel('/meshes/SakuraTree.glb');
  const leafPlaneRef = useRef<Mesh>(null!);
  const GLOBAL_SCALE = 0.3;

  useEffect(() => {
    if (!scene || !leafPlaneRef.current || loadedMeshes.length === 0) {
      return;
    }
    const leafPlane = leafPlaneRef.current;
    leafPlane.scaling.scaleInPlace(GLOBAL_SCALE);
    leafPlane.isVisible = false;

    const root = new TransformNode('Tree_W_Leaves', scene);
    root.position = new Vector3(0, -1, 0);

    const treeRoot = treeMeshes[0];
    treeRoot.parent = root;
    treeRoot.isVisible = true;
    treeRoot.position    = new Vector3(0, 0, 0);
    treeRoot.checkCollisions = false;

    // 1) Per-instance buffers
    leafPlane.registerInstancedBuffer('faceNormal', 3);
    leafPlane.registerInstancedBuffer('shadeOffset', 1);

    // 2) Shared CustomMaterial
    const leafMat = new CustomMaterial('leafMat', scene);
    leafMat.diffuseTexture         = new Texture('textures/alphaleaf.png', scene);
    leafMat.diffuseTexture.hasAlpha= true;
    leafMat.backFaceCulling        = true;
    leafMat.emissiveTexture        = new Texture('textures/greenRamp.png', scene);
    leafMat.emissiveTexture.hasAlpha = false;

    // 3) Shader injections
    leafMat.Vertex_Definitions(`
#ifdef INSTANCES
  attribute vec3 faceNormal;
  attribute float shadeOffset;
  varying   vec3 vFaceNormal;
  varying   float vShadeOffset;
#endif
varying vec2 vUV;
`);
    leafMat.Vertex_MainBegin(` vUV = uv; `);
    leafMat.Vertex_Before_PositionUpdated(`
#ifdef INSTANCES
  vFaceNormal  = normalize((world * vec4(faceNormal, 0.0)).xyz);
  vShadeOffset = shadeOffset;
#endif
`);
    leafMat.Fragment_Definitions(`
varying vec3  vFaceNormal;
varying vec2  vUV;
varying float vShadeOffset;
`);
    leafMat.Fragment_Custom_Diffuse(`
  float a = texture2D(diffuseSampler, vUV).a;
  if (a < 0.5) discard;

  float ndl = max(dot(normalize(vFaceNormal), normalize(vec3(1.,1.,0.5))), 0.0);

  // ramp lookup, with optional per-leaf offset
  float u = clamp(ndl + vShadeOffset, 0.0, 1.0);
  vec3 col = texture2D(emissiveSampler, vec2(u, 0.5)).rgb;

  diffuseColor = col;
`);
    leafMat.Fragment_Custom_Alpha( `alpha = texture2D(diffuseSampler, vUV).a;` );

    leafPlane.material = leafMat;

    // 4) Extract emitter geometry
    const emitter = loadedMeshes.find(m => m.name === 'LeafEmitter') ?? loadedMeshes[0];
    emitter.scaling.scaleInPlace(GLOBAL_SCALE);
    emitter.isVisible = false;
    const positions = emitter.getVerticesData('position')!;
    const indices   = emitter.getIndices()!;

    // 5) Precompute face centers & normals
    const faceCenters: Vector3[] = [];
    const faceNormals: Vector3[] = [];
    for (let i = 0; i < indices.length; i += 3) {
      const [i0,i1,i2] = [indices[i],indices[i+1],indices[i+2]];
      const v0 = new Vector3(...positions.slice(i0*3, i0*3+3));
      const v1 = new Vector3(...positions.slice(i1*3, i1*3+3));
      const v2 = new Vector3(...positions.slice(i2*3, i2*3+3));
      faceCenters.push(v0.add(v1).add(v2).scale(1/3));
      faceNormals.push(Vector3.Cross(v1.subtract(v0), v2.subtract(v0)).normalize());
    }

    // 6) For each bush position, create a TransformNode + leaf instances
    const allInstances: InstancedMesh[] = [];
    const allBushes = BUSH_POSITIONS.map((pos, bi) => {
      const bushNode = new TransformNode(`bush${bi}, scene`);
      bushNode.parent   = root;
      bushNode.position.copyFrom(pos);
      bushNode.scaling.scaleInPlace(GLOBAL_SCALE);

      faceCenters.forEach((center, idx) => {
        if (Math.random() > 0.2) return; // density 0.2
        const normal = faceNormals[idx];
        const inst = leafPlane.createInstance(`b${bi}_l${idx}`);
        inst.parent        = bushNode;
        inst.position      = center.add(normal.scale(0.01));
        inst.billboardMode = Mesh.BILLBOARDMODE_ALL;
        const s = 0.5 + Math.random()*0.7;
        inst.scaling       = new Vector3(s,s,s);
        inst.rotation.z    = Math.random()*Math.PI*2;
        inst.instancedBuffers.faceNormal  = [normal.x, normal.y, normal.z];
        inst.instancedBuffers.shadeOffset = [Math.random()*0.4 - 0.2];
        allInstances.push(inst);
      });

      return bushNode;
    });

    // 7) Wind sway on all leaves
    const windObserver = scene.onBeforeRenderObservable.add(() => {
      const t = performance.now()*0.001;
      allInstances.forEach((inst,i) => {
        inst.rotation.z = Math.sin(t + i*0.13)*0.05;
      });
    });

    // Cleanup
    return () => {
      scene.onBeforeRenderObservable.remove(windObserver);
      allInstances.forEach(i => i.dispose());
      allBushes.forEach(b => b.dispose());
      leafMat.dispose();
      leafPlane.dispose();
      root.dispose();
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