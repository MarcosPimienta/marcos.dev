import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Scene } from '@babylonjs/core/scene';
import type { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import type { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Season } from './season';

// Per-season lighting and atmosphere: sun, sky fill, fog and exposure.
// Content.tsx applies it when the scene is built; AnimationCtrl.tsx tweens between seasons.
export interface Mood {
  sunColor: Color3;
  sunIntensity: number;
  sunDirection: Vector3;
  hemiIntensity: number;
  hemiGround: Color3;
  fogColor: Color3;
  exposure: number;
}

const DAY_SUN = new Vector3(0.6, -1, 0.9).normalize();
// Fall: a lower, golden-hour sun from the side.
const LOW_SUN = new Vector3(0.9, -0.55, 0.6).normalize();

export const MOODS: Record<Season, Mood> = {
  [Season.Spring]: {
    sunColor: Color3.FromHexString('#FFF1E6'), sunIntensity: 2.4, sunDirection: DAY_SUN,
    hemiIntensity: 0.9, hemiGround: Color3.FromHexString('#6E5A7A'),
    fogColor: Color3.FromHexString('#F6D9E4'), exposure: 1.0,
  },
  [Season.Summer]: {
    sunColor: Color3.FromHexString('#FFF6D8'), sunIntensity: 3.0, sunDirection: DAY_SUN,
    hemiIntensity: 0.8, hemiGround: Color3.FromHexString('#4E6B4A'),
    fogColor: Color3.FromHexString('#D8ECD9'), exposure: 1.0,
  },
  [Season.Fall]: {
    sunColor: Color3.FromHexString('#FFB070'), sunIntensity: 3.2, sunDirection: LOW_SUN,
    hemiIntensity: 0.8, hemiGround: Color3.FromHexString('#6A3B2A'),
    fogColor: Color3.FromHexString('#F2C79A'), exposure: 1.0,
  },
  [Season.Winter]: {
    sunColor: Color3.FromHexString('#DDEBFF'), sunIntensity: 2.2, sunDirection: DAY_SUN,
    hemiIntensity: 0.85, hemiGround: Color3.FromHexString('#3D4A66'),
    fogColor: Color3.FromHexString('#C9DAEA'), exposure: 1.0,
  },
};

export const FOG_DENSITY = 0.022;

// Snap the scene to a season's mood (no tween).
export function applyMood(scene: Scene, season: Season) {
  const m = MOODS[season];
  const hemi = scene.getLightByName('default light') as HemisphericLight | null;
  const sun = scene.getLightByName('sun') as DirectionalLight | null;
  if (hemi) {
    hemi.intensity = m.hemiIntensity;
    hemi.groundColor = m.hemiGround.clone();
  }
  if (sun) {
    sun.diffuse = m.sunColor.clone();
    sun.intensity = m.sunIntensity;
    sun.direction = m.sunDirection.clone();
  }
  scene.fogColor = m.fogColor.clone();
  scene.imageProcessingConfiguration.exposure = m.exposure;
}
