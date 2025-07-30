import React, { useEffect, useRef } from 'react'
import {
  Animation,
  AnimationEvent,
  Color3,
  CubicEase,
  EasingFunction,
  IAnimationKey,
  Scene,
  Texture,
  Vector3
} from '@babylonjs/core'
import type { InstancedMesh, ParticleSystem } from '@babylonjs/core'
import { CustomMaterial } from '@babylonjs/materials'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { CubeTexture } from '@babylonjs/core'
import { Season } from './Content'
import { getBasePath } from './config'

interface AnimationCtrlProps {
  scene: Scene;
  from: Season;
  to: Season;
  petalPS: ParticleSystem | null;
  greenPS: ParticleSystem | null;
  redPS: ParticleSystem | null;
  snowPS: ParticleSystem | null;
  onComplete: () => void;
}

const order: Season[] = [
  Season.Spring,
  Season.Summer,
  Season.Fall,
  Season.Winter
]

export const AnimationCtrl: React.FC<AnimationCtrlProps> = ({
  scene, from, to,
  petalPS, greenPS, redPS, snowPS,
  onComplete
}) => {
  const disposables = useRef<ReturnType<Scene['beginDirectAnimation']>[]>([])

  useEffect(() => {
    if (!scene) return

    // 1) stop any that might still be running
    [petalPS, greenPS, redPS, snowPS].forEach(ps => ps?.stop());

    // 2) fire off exactly the one for the new season
    switch (to) {
      case Season.Spring: petalPS?.start(); break;
      case Season.Summer: greenPS?.start(); break;
      case Season.Fall:   redPS?.start();   break;
      case Season.Winter: snowPS?.start();  break;
    }

    // 3) grab leaf & flower instances by naming convention
    const allLeafInstances = scene.meshes
      .filter(m => /^b\d+_l/.test(m.name)) as InstancedMesh[]
    const allFlowerInstances = scene.meshes
      .filter(m => m.name.startsWith('flw_')) as InstancedMesh[]
      const allRedLeafInstances = scene.meshes
      .filter(m => m.name.startsWith('rb_')) as InstancedMesh[]

    // 4) compute how many frames our transition spans
    const startIdx = order.indexOf(from)
    let steps = 0, idx = startIdx
    while (order[idx] !== to) {
      idx = (idx + 1) % order.length
      steps++
      if (steps > order.length) break
    }
    const framesPerLeg = 120
    const totalFrames = steps * framesPerLeg + 60

    // 5) easing
    const ease = new CubicEase() as unknown as EasingFunction
    ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT)

    // 6) season → value maps
    const lightColorMap: Record<Season, Color3> = {
      [Season.Spring]: Color3.FromHexString('#FAFDE1').toLinearSpace(),
      [Season.Summer]: Color3.FromHexString('#FFF8E0').toLinearSpace(),
      [Season.Fall]:   Color3.FromHexString('#FFD1A3').toLinearSpace(),
      [Season.Winter]: Color3.FromHexString('#C8E8FF').toLinearSpace(),
    }
    const lightIntMap: Record<Season, number> = {
      [Season.Spring]: 1.1,
      [Season.Summer]: 1.2,
      [Season.Fall]:   0.8,
      [Season.Winter]: 0.9,
    }
    const leafTintMap: Record<Season, Color3> = {
      [Season.Spring]: Color3.FromHexString('#8CCF3B').toLinearSpace(),
      [Season.Summer]: Color3.Green(),
      [Season.Fall]:   Color3.FromHexString('#A63A0D').toLinearSpace(),
      [Season.Winter]: Color3.FromHexString('#7A7A7A').toLinearSpace(),
    }
    const leafCutoffMap: Record<Season, number> = {
      [Season.Spring]: 0.7,
      [Season.Summer]: 0.7,
      [Season.Fall]:   0.6,
      [Season.Winter]: 0.8,
    }
    const snowPosMap: Record<Season, Vector3> = {
      [Season.Spring]: new Vector3(0, -3,   0),
      [Season.Summer]: new Vector3(0, -3,   0),
      [Season.Fall]:   new Vector3(0, -3,   0),
      [Season.Winter]: new Vector3(0, -1.2, 0),
    }
    const grassPosMap: Record<Season, Vector3> = {
      [Season.Spring]: new Vector3(0, -1, 0),
      [Season.Summer]: new Vector3(0, -1, 0),
      [Season.Fall]:   new Vector3(0, -1.08, 0),
      [Season.Winter]: new Vector3(0, -2, 0),
    }
    const greenAlphaMap: Record<Season, number> = {
      [Season.Spring]: 1,
      [Season.Summer]: 1,
      [Season.Fall]:   0,
      [Season.Winter]: 0,
    }
    const redAlphaMap: Record<Season, number> = {
      [Season.Spring]: 0,
      [Season.Summer]: 0,
      [Season.Fall]:   1,
      [Season.Winter]: 0,
    }
    const groundLeafAlphaMap: Record<Season, number> = {
      [Season.Spring]: 0,
      [Season.Summer]: 0,
      [Season.Fall]:   1,
      [Season.Winter]: 0,
    };
    // 7) helper to build key‑frame animations
    function buildAnim<T>(
      property: string,
      dataType: number,
      map: Record<Season, T>
    ) {
      const keys: IAnimationKey[] = []
      let cursor = 0, cidx = startIdx
      keys.push({ frame: 0, value: map[order[cidx]]! })
      for (let i = 0; i < steps; i++) {
        const next = (cidx + 1) % order.length
        keys.push({ frame: cursor + 60,           value: map[order[cidx]]! })
        keys.push({ frame: cursor + framesPerLeg, value: map[order[next]]! })
        cursor += framesPerLeg
        cidx = next
      }
      keys.push({ frame: cursor + 60, value: map[to]! })

      const anim = new Animation(
        `anim_${property}`,
        property,
        60,
        dataType,
        Animation.ANIMATIONLOOPMODE_CONSTANT
      )
      anim.setKeys(keys)
      anim.setEasingFunction(ease)
      return anim
    }

    // 8) grab scene targets
    const light   = scene.lights[0]!
    const leafMat = scene.getMaterialByName('leafMat') as CustomMaterial
    const redLeafMat = scene.getMaterialByName('redLeafMat') as CustomMaterial;
    const snow    = scene.getMeshByName('Snow')!
    const grass   = scene.getTransformNodeByName('GrassRoot')!
    const skyMat1 = scene.getMaterialByName('skyBox1Mat') as StandardMaterial
    const skyMat2 = scene.getMaterialByName('skyBox2Mat') as StandardMaterial
    const groundLeafMat = scene.getMaterialByName('groundLeafCell') as StandardMaterial;

    // ensure correct initial alpha
    leafMat.alpha    = 1
    redLeafMat.alpha = 0

    // preload & assign skyboxes
    const urlFrom = `${getBasePath()}/textures/skybox/sky_${from}`
    const urlTo   = `${getBasePath()}/textures/skybox/sky_${to}`
    const faces   = ['_px.png','_py.png','_pz.png','_nx.png','_ny.png','_nz.png']
    skyMat1.reflectionTexture = new CubeTexture(urlFrom, scene, faces)
    skyMat1.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    skyMat1.alpha = 1
    skyMat2.reflectionTexture = new CubeTexture(urlTo, scene, faces)
    skyMat2.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    skyMat2.alpha = 0

    // sky fade animations
    const fadeOut = new Animation('fadeOutSky1','alpha',60,Animation.ANIMATIONTYPE_FLOAT,Animation.ANIMATIONLOOPMODE_CONSTANT)
    fadeOut.setKeys([ { frame:0, value:1 }, { frame:totalFrames, value:0 } ])
    fadeOut.setEasingFunction(ease)
    const fadeIn  = new Animation('fadeInSky2','alpha',60,Animation.ANIMATIONTYPE_FLOAT,Animation.ANIMATIONLOOPMODE_CONSTANT)
    fadeIn.setKeys([ { frame:0, value:0 }, { frame:totalFrames, value:1 } ])
    fadeIn.setEasingFunction(ease)
    skyMat1.animations = [fadeOut]
    skyMat2.animations = [fadeIn]
    fadeIn.addEvent(new AnimationEvent(totalFrames, () => onComplete?.(), true))

    // 9) apply all the seasonal tweens
    light.animations  = [
      buildAnim('diffuse',   Animation.ANIMATIONTYPE_COLOR3, lightColorMap),
      buildAnim('intensity', Animation.ANIMATIONTYPE_FLOAT,  lightIntMap),
    ]
    leafMat.animations = [
      buildAnim('diffuseColor', Animation.ANIMATIONTYPE_COLOR3, leafTintMap),
      buildAnim('alphaCutOff',  Animation.ANIMATIONTYPE_FLOAT,  leafCutoffMap),
    ]
    snow.animations  = [ buildAnim('position', Animation.ANIMATIONTYPE_VECTOR3, snowPosMap) ]
    grass.animations = [ buildAnim('position', Animation.ANIMATIONTYPE_VECTOR3, grassPosMap) ]
    groundLeafMat.animations = [
      buildAnim('alpha', Animation.ANIMATIONTYPE_FLOAT, groundLeafAlphaMap)
    ];
    // start them
    disposables.current.forEach(d => d.stop())
    disposables.current = [
      scene.beginDirectAnimation(
        leafMat,
        [ buildAnim('alpha', Animation.ANIMATIONTYPE_FLOAT, greenAlphaMap) ],
        0, totalFrames, false, 1
      ),
      scene.beginDirectAnimation(
        redLeafMat,
        [ buildAnim('alpha', Animation.ANIMATIONTYPE_FLOAT, redAlphaMap) ],
        0, totalFrames, false, 1
      ),
      scene.beginDirectAnimation(groundLeafMat, groundLeafMat.animations!, 0, totalFrames, false, 1),
      scene.beginDirectAnimation(skyMat1, skyMat1.animations!, 0, totalFrames, false,1),
      scene.beginDirectAnimation(skyMat2, skyMat2.animations!, 0, totalFrames, false,1),
      scene.beginDirectAnimation(light,   light.animations!,   0, totalFrames, false,1),
      scene.beginDirectAnimation(leafMat, leafMat.animations!, 0, totalFrames, false,1),
      scene.beginDirectAnimation(snow,    snow.animations!,    0, totalFrames, false,1),
      scene.beginDirectAnimation(grass,   grass.animations!,   0, totalFrames, false,1),
    ]

    // 10) petals vs leaves scaling only on Spring transitions
    const fadeInSpring  = from !== Season.Spring && to === Season.Spring
    const fadeOutSpring = from === Season.Spring && to !== Season.Spring

    const fadeInWinter  = from !== Season.Winter && to === Season.Winter
    const fadeOutWinter = from === Season.Winter && to !== Season.Winter

    const fadeInFall  = from !== Season.Fall && to === Season.Fall
    const fadeOutFall = from === Season.Fall && to !== Season.Fall

    function animateGroup(
      instances: InstancedMesh[],
      fromScale: number,
      toScale: number
    ) {
      for (const inst of instances) {
        const anim = new Animation(
          `${inst.name}_scale`,
          'scaling',
          60,
          Animation.ANIMATIONTYPE_VECTOR3,
          Animation.ANIMATIONLOOPMODE_CONSTANT
        )
        anim.setEasingFunction(ease)
        anim.setKeys([
          { frame:0,           value: new Vector3(fromScale, fromScale, fromScale) },
          { frame:totalFrames, value: new Vector3(toScale,   toScale,   toScale) }
        ])
        disposables.current.push(
          scene.beginDirectAnimation(inst, [anim], 0, totalFrames, false, 1)
        )
      }
    }

  if (fadeOutSpring) {
    // leaving Spring: hide petals, show leaves
    animateGroup(allFlowerInstances, 1, 0);
    animateGroup(allLeafInstances,   0, 1);
  }
  else if (fadeInSpring) {
    // arriving at Spring: show petals, hide leaves
    animateGroup(allFlowerInstances, 0, 1);
    animateGroup(allLeafInstances,   1, 0);
  }
  else if (fadeInFall) {
    animateGroup(allLeafInstances,    1, 0);
    animateGroup(allRedLeafInstances, 0, 1);
  }
  else if (fadeOutFall) {
    animateGroup(allRedLeafInstances, 1, 0);
    animateGroup(allLeafInstances,    0, 1);
  }
  else if (fadeInWinter) {
    animateGroup(allLeafInstances, 1, 0);
  }
  else if (fadeOutWinter) {
    animateGroup(allLeafInstances, 0, 1);
  }
    return () => {
      disposables.current.forEach(d => d.stop())
      disposables.current = []
    }
  }, [scene, from, to, onComplete])

  return null
}
