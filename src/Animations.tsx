import React, { useEffect } from 'react';
import {
  Scene,
  ArcRotateCamera,
  Color3,
  Mesh,
  TransformNode,
  Animation,
  CubicEase,
  EasingFunction,
  BaseTexture,
} from '@babylonjs/core';
import { CubeTexture } from '@babylonjs/core/Materials/Textures/cubeTexture';
import { CustomMaterial } from '@babylonjs/materials';
import { Season } from './Content';
import { seasonTargets } from './Content';

interface AnimationProps {
  season: Season;
  scene: Scene;
  camera: ArcRotateCamera;
  leafMat: CustomMaterial;
  snowMesh: Mesh;
  grassRoot: TransformNode;
  skyboxMaterial: { reflectionTexture: BaseTexture | null };
  basePath: string; // to resolve skybox paths
}

const Animations: React.FC<AnimationProps> = ({
  season,
  scene,
  camera,
  leafMat,
  snowMesh,
  grassRoot,
  skyboxMaterial,
  basePath,
}) => {
  useEffect(() => {
    const targets = seasonTargets[season];
    const easing = new CubicEase();
    easing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    const frameRate = 60;
    const duration = 2 * frameRate; // 2 seconds

    // Helper to create and start animation
    const animateProperty = <T,>(
      obj: any,
      property: string,
      animationName: string,
      from: T,
      to: T,
      type: number
    ) => {
      const anim = new Animation(
        animationName,
        property,
        frameRate,
        type,
        Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      anim.setEasingFunction(easing);
      anim.setKeys([
        { frame: 0, value: from },
        { frame: duration, value: to },
      ]);
      obj.animations = obj.animations || [];
      obj.animations.push(anim);
      scene.beginAnimation(obj, 0, duration, false);
    };

    // 1. Light color & intensity
    scene.lights.forEach((light, idx) => {
      animateProperty(
        light,
        'diffuse',
        `lightColor${idx}`,
        light.diffuse.clone(),
        targets.light.color,
        Animation.ANIMATIONTYPE_COLOR3
      );
      animateProperty(
        light,
        'intensity',
        `lightIntensity${idx}`,
        light.intensity,
        targets.light.intensity,
        Animation.ANIMATIONTYPE_FLOAT
      );
    });

    // 2. Camera orientation
    animateProperty(
      camera,
      'alpha',
      'cameraAlpha',
      camera.alpha,
      targets.light.alpha,
      Animation.ANIMATIONTYPE_FLOAT
    );
    animateProperty(
      camera,
      'beta',
      'cameraBeta',
      camera.beta,
      targets.light.beta,
      Animation.ANIMATIONTYPE_FLOAT
    );

    // 3. Leaf material
    animateProperty(
      leafMat,
      'diffuseColor',
      'leafTint',
      leafMat.diffuseColor.clone(),
      targets.leaf.tint,
      Animation.ANIMATIONTYPE_COLOR3
    );
    animateProperty(
      leafMat,
      'alphaCutOff',
      'leafAlpha',
      leafMat.alphaCutOff,
      targets.leaf.alphaCutOff,
      Animation.ANIMATIONTYPE_FLOAT
    );

    // 4. Snow mesh and grass
    if (targets.snow.visible) {
      snowMesh.isVisible = true;
      animateProperty(
        snowMesh,
        'position.y',
        'snowY',
        targets.snow.fromY,
        targets.snow.toY,
        Animation.ANIMATIONTYPE_FLOAT
      );
      animateProperty(
        grassRoot,
        'position.y',
        'grassY',
        targets.grass.fromY,
        targets.grass.toY,
        Animation.ANIMATIONTYPE_FLOAT
      );
    } else {
      snowMesh.isVisible = false;
      grassRoot.position.y = targets.grass.toY;
    }

    // 5. Skybox swap (instant)
    if (skyboxMaterial.reflectionTexture) {
      skyboxMaterial.reflectionTexture.dispose();
    }
    const newSky = new CubeTexture(
      `${basePath}/textures/skybox/${targets.skybox}`,
      scene,
      ['_px.png', '_py.png', '_pz.png', '_nx.png', '_ny.png', '_nz.png']
    );
    skyboxMaterial.reflectionTexture = newSky;

  }, [season]);

  return null;
};


export default Animations;
