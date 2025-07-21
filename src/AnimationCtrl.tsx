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
import { CustomMaterial } from '@babylonjs/materials'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { CubeTexture } from '@babylonjs/core'
import { Season } from './Content'
import { getBasePath } from './config'

interface AnimationCtrlProps {
  scene: Scene
  from: Season
  to: Season
  onComplete?: () => void
}

const order: Season[] = [
  Season.Spring,
  Season.Summer,
  Season.Fall,
  Season.Winter
]

export const AnimationCtrl: React.FC<AnimationCtrlProps> = ({
  scene,
  from,
  to,
  onComplete
}) => {
  const disposables = useRef<ReturnType<Scene['beginDirectAnimation']>[]>([])

  useEffect(() => {
    if (!scene) return

    // — determine how many steps going forward from “from” to “to” —
    const startIdx = order.indexOf(from)
    let steps = 0
    let idx = startIdx
    while (order[idx] !== to) {
      idx = (idx + 1) % order.length
      steps++
      if (steps > order.length) break
    }

    const framesPerLeg = 120
    const totalFrames  = steps * framesPerLeg + 60

    // — ease for all animations —
    const ease = new CubicEase() as unknown as EasingFunction
    ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT)

    // — per‐season value getters —
    const lightColor = (s: Season) => ({
      [Season.Spring]: Color3.FromHexString('#FAFDE1').toLinearSpace(),
      [Season.Summer]: Color3.FromHexString('#FFF8E0').toLinearSpace(),
      [Season.Fall]:   Color3.FromHexString('#FFD1A3').toLinearSpace(),
      [Season.Winter]: Color3.FromHexString('#C8E8FF').toLinearSpace(),
    }[s]!)

    const lightInt = (s: Season) => ({
      [Season.Spring]: 1.1,
      [Season.Summer]: 1.2,
      [Season.Fall]:   0.8,
      [Season.Winter]: 0.9,
    }[s]!)

    const leafTint = (s: Season) => ({
      [Season.Spring]: Color3.FromHexString('#8CCF3B').toLinearSpace(),
      [Season.Summer]: Color3.Green(),
      [Season.Fall]:   Color3.FromHexString('#A63A0D').toLinearSpace(),
      [Season.Winter]: Color3.FromHexString('#7A7A7A').toLinearSpace(),
    }[s]!)

    const leafCutoff = (s: Season) => ({
      [Season.Spring]: 0.7,
      [Season.Summer]: 0.7,
      [Season.Fall]:   0.6,
      [Season.Winter]: 0.8,
    }[s]!)

    const snowPos = (s: Season) =>
      new Vector3(0, s === Season.Winter ? 1.4 : -1, 0)

    const grassPos = (s: Season) =>
      new Vector3(0, s === Season.Winter ? -2 : -1, 0)

    // — helper to build a Babylon Animation from keys —
    function buildAnim<T>(
      property: string,
      dataType: number,
      getter: (s: Season) => T
    ) {
      const keys: IAnimationKey[] = []
      let cursor = 0
      let cidx = startIdx

      // initial
      keys.push({ frame: 0, value: getter(order[cidx]) })

      // each “leg” through the sequence
      for (let i = 0; i < steps; i++) {
        const next = (cidx + 1) % order.length
        keys.push({ frame: cursor + 60,           value: getter(order[cidx]) })
        keys.push({ frame: cursor + framesPerLeg, value: getter(order[next]) })
        cursor += framesPerLeg
        cidx = next
      }

      // final settle
      keys.push({ frame: cursor + 60, value: getter(to) })

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

    // — grab all targets —
    const light   = scene.lights[0]!
    const leafMat = scene.getMaterialByName('leafMat') as CustomMaterial
    const snow    = scene.getMeshByName('Snow')!
    const grass   = scene.getTransformNodeByName('GrassRoot')!
    const skyMat1 = scene.getMaterialByName('skyBox1Mat') as StandardMaterial;
    const skyMat2 = scene.getMaterialByName('skyBox2Mat') as StandardMaterial;

    // — preload both skybox textures —
    const urlFrom = `${getBasePath()}/textures/skybox/sky_${from}`
    const urlTo   = `${getBasePath()}/textures/skybox/sky_${to}`
    const faces   = ['_px.png','_py.png','_pz.png','_nx.png','_ny.png','_nz.png']

    skyMat1.reflectionTexture = new CubeTexture(urlFrom, scene, faces)
    skyMat1.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    skyMat1.alpha = 1

    skyMat2.reflectionTexture = new CubeTexture(urlTo, scene, faces)
    skyMat2.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    skyMat2.alpha = 0

    // — build fade animations for sky —
    const fadeOut = new Animation('fadeOutSky1', 'alpha', 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT)
    fadeOut.setKeys([
      { frame: 0,           value: 1 },
      { frame: totalFrames, value: 0 }
    ])
    fadeOut.setEasingFunction(ease)

    const fadeIn = new Animation('fadeInSky2', 'alpha', 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT)
    fadeIn.setKeys([
      { frame: 0,           value: 0 },
      { frame: totalFrames, value: 1 }
    ])
    fadeIn.setEasingFunction(ease)

    skyMat1.animations = [fadeOut]
    skyMat2.animations = [fadeIn]

    // — optional: trigger onComplete at very end —
    const evt = new AnimationEvent(
      totalFrames,
      () => onComplete?.(),
      true
    )
    fadeIn.addEvent(evt)

    // — assign your four other seasonal anims —
    light.animations  = [
      buildAnim('diffuse',   Animation.ANIMATIONTYPE_COLOR3, lightColor),
      buildAnim('intensity', Animation.ANIMATIONTYPE_FLOAT,  lightInt),
    ]
    leafMat.animations = [
      buildAnim('diffuseColor', Animation.ANIMATIONTYPE_COLOR3, leafTint),
      buildAnim('alphaCutOff',  Animation.ANIMATIONTYPE_FLOAT,  leafCutoff),
    ]
    snow.animations   = [ buildAnim('position', Animation.ANIMATIONTYPE_VECTOR3, snowPos) ]
    grass.animations  = [ buildAnim('position', Animation.ANIMATIONTYPE_VECTOR3, grassPos) ]

    // — start *all six* anims and collect disposables —
    disposables.current.forEach(a => a.stop())
    disposables.current = [
      scene.beginDirectAnimation(skyMat1, skyMat1.animations!, 0, totalFrames, false, 1),
      scene.beginDirectAnimation(skyMat2, skyMat2.animations!, 0, totalFrames, false, 1),
      scene.beginDirectAnimation(light,   light.animations!,   0, totalFrames, false, 1),
      scene.beginDirectAnimation(leafMat, leafMat.animations!, 0, totalFrames, false, 1),
      scene.beginDirectAnimation(snow,    snow.animations!,    0, totalFrames, false, 1),
      scene.beginDirectAnimation(grass,   grass.animations!,   0, totalFrames, false, 1),
    ]

    return () => {
      disposables.current.forEach(a => a.stop())
      disposables.current = []
    }
  }, [scene, from, to, onComplete])

  return null
}
