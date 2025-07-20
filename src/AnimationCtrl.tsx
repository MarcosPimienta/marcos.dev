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

    // figure out how many legs (always forward through the cycle)
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

    // common ease
    const ease = new CubicEase() as unknown as EasingFunction
    ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT)

    // value getters per‑season
    const lightColor = (s: Season) => {
      switch (s) {
        case Season.Spring: return Color3.FromHexString('#FAFDE1').toLinearSpace()
        case Season.Summer: return Color3.FromHexString('#FFF8E0').toLinearSpace()
        case Season.Fall:   return Color3.FromHexString('#FFD1A3').toLinearSpace()
        case Season.Winter: return Color3.FromHexString('#C8E8FF').toLinearSpace()
      }
    }
    const lightInt = (s: Season) => ({
      [Season.Spring]: 1.1,
      [Season.Summer]: 1.2,
      [Season.Fall]:   0.8,
      [Season.Winter]: 0.9,
    }[s]!)
    const leafTint = (s: Season) => {
      switch (s) {
        case Season.Spring: return Color3.FromHexString('#8CCF3B').toLinearSpace()
        case Season.Summer: return Color3.Green()
        case Season.Fall:   return Color3.FromHexString('#A63A0D').toLinearSpace()
        case Season.Winter: return Color3.FromHexString('#7A7A7A').toLinearSpace()
      }
    }
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

    // helper to build a single property‐animation
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

      // each “leg” through the seasons
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

    // grab everything
    const light   = scene.lights[0]!
    const leafMat = scene.getMaterialByName('leafMat') as CustomMaterial
    const snow    = scene.getMeshByName('Snow')!
    const grass   = scene.getTransformNodeByName('GrassRoot')!
    const skyMat  = (scene.getMeshByName('skyBox')!.material!) as any

    // assign keyframes
    light.animations  = [
      buildAnim('diffuse',   Animation.ANIMATIONTYPE_COLOR3, lightColor),
      buildAnim('intensity', Animation.ANIMATIONTYPE_FLOAT,  lightInt)
    ]
    leafMat.animations = [
      buildAnim('diffuseColor', Animation.ANIMATIONTYPE_COLOR3, leafTint),
      buildAnim('alphaCutOff',  Animation.ANIMATIONTYPE_FLOAT,  leafCutoff)
    ]
    snow.animations   = [ buildAnim('position', Animation.ANIMATIONTYPE_VECTOR3, snowPos) ]
    grass.animations  = [ buildAnim('position', Animation.ANIMATIONTYPE_VECTOR3, grassPos) ]

    // schedule our sky‐swap at the very end
    const swapEvent = new AnimationEvent(
      totalFrames,
      () => {
        const url = `${getBasePath()}/textures/skybox/sky_${to}`
        skyMat.reflectionTexture = new CubeTexture(url, scene,
          ['_px.png','_py.png','_pz.png','_nx.png','_ny.png','_nz.png']
        )
        skyMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
        onComplete?.()
      },
      true  // onlyOnce
    )
    leafMat.animations![1].addEvent(swapEvent)

    // kick them all off (speedRatio=1)
    disposables.current = [
      scene.beginDirectAnimation(light,   light.animations!,   0, totalFrames, false, 1.0),
      scene.beginDirectAnimation(leafMat, leafMat.animations!, 0, totalFrames, false, 1.0),
      scene.beginDirectAnimation(snow,    snow.animations!,    0, totalFrames, false, 1.0),
      scene.beginDirectAnimation(grass,   grass.animations!,   0, totalFrames, false, 1.0),
    ]

    return () => {
      // clean up
      disposables.current.forEach(a => a.stop())
      disposables.current = []
    }
  }, [scene, from, to, onComplete])

  return null
}
