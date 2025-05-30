import React, { useEffect, useRef } from 'react';
import { Vector3, StandardMaterial, Texture, Color3, Mesh, InstancedMesh } from '@babylonjs/core';
import { useScene } from 'reactylon';

const NUM_LEAVES = 150;

const Content: React.FC = () => {
  const scene = useScene();
  const leafRef = useRef<Mesh>(null!);

  useEffect(() => {
    if (!scene || !leafRef.current) return;
    const leaf = leafRef.current;

    // 🍃 Make the leaf always face the camera
    leaf.billboardMode = Mesh.BILLBOARDMODE_ALL;

    // 🎨 Cel-shaded, alpha-masked material
    const leafMat = new StandardMaterial("leafMat", scene);
    leafMat.diffuseTexture = new Texture("/textures/leaf.png", scene);
    leafMat.diffuseTexture.hasAlpha = true;
    leafMat.backFaceCulling = false;
    leafMat.emissiveColor = new Color3(1, 1, 1);
    leaf.material = leafMat;

    // 🌿 Instance the leaves to form a bush
    const instances: InstancedMesh[] = [];
    for (let i = 0; i < NUM_LEAVES; i++) {
      const inst = leaf.createInstance(`leafInst_${i}`); // returns InstancedMesh

      // ← make this instance billboard too
      inst.billboardMode = Mesh.BILLBOARDMODE_ALL;

      inst.position = new Vector3(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      );
      inst.rotation = new Vector3(0, 0, 0);
      const s = 0.5 + Math.random() * 0.7;
      inst.scaling = new Vector3(s, s, s);
      instances.push(inst);
    }

    // 🌬️ Simple wind sway on all leaves
    const windObserver = scene.onBeforeRenderObservable.add(() => {
      const t = performance.now() * 0.001;
      instances.forEach((inst, idx) => {
        inst.rotation.z = Math.sin(t + idx) * 0.1;
      });
    });

    return () => {
      scene.onBeforeRenderObservable.remove(windObserver);
      instances.forEach(inst => inst.dispose());
      leafMat.dispose();
    };
  }, [scene]);

  return (
    <plane
      ref={leafRef}
      name="leafPlane"
      options={{ size: 1 }}
    />
  );
};

export default Content;
