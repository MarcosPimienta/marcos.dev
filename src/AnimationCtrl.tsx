import React, { useEffect, useRef } from 'react'
import { Animation } from '@babylonjs/core/Animations/animation'
import { AnimationEvent } from '@babylonjs/core/Animations/animationEvent'
import { CubicEase, EasingFunction } from '@babylonjs/core/Animations/easing'
import type { IAnimationKey } from '@babylonjs/core/Animations/animationKey'
import '@babylonjs/core/Animations/animatable'
import type { Scene } from '@babylonjs/core/scene'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh'
import type { ParticleSystem } from '@babylonjs/core/Particles/particleSystem'
import type { CustomMaterial } from '@babylonjs/materials/custom/customMaterial'
import type { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Season } from './Content'
import { MOODS } from './seasonMood'

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
      [Season.Spring]: Color3.FromHexString('#FFE6D2').toLinearSpace(),
      [Season.Summer]: Color3.FromHexString('#FFF8E0').toLinearSpace(),
      [Season.Fall]:   Color3.FromHexString('#FFB089').toLinearSpace(),
      [Season.Winter]: Color3.FromHexString('#9DB2E6').toLinearSpace(),
    }
    // sun, sky fill, fog and exposure come from seasonMood.ts
    const moodMap = <K extends keyof typeof MOODS[Season]>(key: K) =>
      Object.fromEntries(order.map(s => [s, MOODS[s][key]])) as Record<Season, typeof MOODS[Season][K]>
    const lightIntMap = moodMap('hemiIntensity')
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
    const light   = scene.getLightByName('default light')!
    const sun     = scene.getLightByName('sun')
    const leafMat = scene.getMaterialByName('leafMat') as CustomMaterial
    const redLeafMat = scene.getMaterialByName('redLeafMat') as CustomMaterial;

    // ensure correct initial alpha
    leafMat.alpha    = 1
    redLeafMat.alpha = 0


    // 9) apply all the seasonal tweens
    light.animations  = [
      buildAnim('diffuse',   Animation.ANIMATIONTYPE_COLOR3, lightColorMap),
      buildAnim('intensity', Animation.ANIMATIONTYPE_FLOAT,  lightIntMap),
      buildAnim('groundColor', Animation.ANIMATIONTYPE_COLOR3, moodMap('hemiGround')),
    ]
    // The tween ends at totalFrames: tell the parent the transition is done.
    light.animations[0].addEvent(new AnimationEvent(totalFrames, () => onComplete?.(), true))
    const sunAnims = [
      buildAnim('diffuse',   Animation.ANIMATIONTYPE_COLOR3,  moodMap('sunColor')),
      buildAnim('intensity', Animation.ANIMATIONTYPE_FLOAT,   moodMap('sunIntensity')),
      buildAnim('direction', Animation.ANIMATIONTYPE_VECTOR3, moodMap('sunDirection')),
    ]
    const exposureAnims = [ buildAnim('exposure', Animation.ANIMATIONTYPE_FLOAT, moodMap('exposure')) ]
    leafMat.animations = [
      buildAnim('diffuseColor', Animation.ANIMATIONTYPE_COLOR3, leafTintMap),
      buildAnim('alphaCutOff',  Animation.ANIMATIONTYPE_FLOAT,  leafCutoffMap),
    ]
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
      scene.beginDirectAnimation(light,   light.animations!,   0, totalFrames, false,1),
      ...(sun ? [scene.beginDirectAnimation(sun, sunAnims, 0, totalFrames, false, 1)] : []),
      scene.beginDirectAnimation(scene.imageProcessingConfiguration, exposureAnims, 0, totalFrames, false, 1),
      scene.beginDirectAnimation(leafMat, leafMat.animations!, 0, totalFrames, false,1),
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
