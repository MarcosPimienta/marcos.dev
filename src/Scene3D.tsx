import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Engine } from 'reactylon/web';
import { Scene } from 'reactylon';
import { KeyboardEventTypes } from '@babylonjs/core/Events/keyboardEvents';
import { MeshoptCompression } from '@babylonjs/core/Meshes/Compression/meshoptCompression';
import '@babylonjs/core/Helpers/sceneHelpers';
import '@babylonjs/core/Culling/ray';
import type { Scene as BjsScene } from '@babylonjs/core/scene';
import type { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';
import Content, { Season } from './Content';
import { AnimationCtrl } from './AnimationCtrl';
import { getBasePath } from './config';

// Models use EXT_meshopt_compression; load the decoder from our own host, not Babylon's CDN.
MeshoptCompression.Configuration = {
  decoder: { url: `${getBasePath()}/libs/meshopt_decoder.js` },
};

interface Props {
  season: Season;
  isMobile: boolean;
  // Phones: lower the render resolution once text covers the scene.
  lowRes: boolean;
  onReady: () => void;
}

// Everything Babylon lives in this module so it loads as its own chunk: the page text renders
// from a small bundle first, and the 3D streams in behind the loading poster.
const Scene3D: React.FC<Props> = ({ season, isMobile, lowRes, onReady }) => {
  const [prevSeason, setPrevSeason] = useState<Season>(season);
  const seasonRef = useRef(season);
  seasonRef.current = season;

  const [bjsScene, setBjsScene] = useState<BjsScene | null>(null);
  const [petalPS, setPetalPS] = useState<ParticleSystem | null>(null);
  const [greenPS, setGreenPS] = useState<ParticleSystem | null>(null);
  const [redPS, setRedPS] = useState<ParticleSystem | null>(null);
  const [snowPS, setSnowPS] = useState<ParticleSystem | null>(null);

  // Stable callback: AnimationCtrl restarts its tweens whenever onComplete changes identity.
  const onTransitionDone = useCallback(() => setPrevSeason(seasonRef.current), []);

  // Phones: render at most 1.5x device pixels in the hero, 1x once text covers the scene.
  useEffect(() => {
    if (!bjsScene || !isMobile) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    bjsScene.getEngine().setHardwareScalingLevel(lowRes ? 1 : 1 / dpr);
  }, [bjsScene, isMobile, lowRes]);

  return (
    <Engine antialias>
      <Scene
        onSceneReady={scene => {
          setBjsScene(scene as BjsScene);
          scene.createDefaultCameraOrLight(true, undefined, true);
          scene.lights.forEach(l => (l.intensity = 1.34));
          scene.onKeyboardObservable.add(kbInfo => {
            if (kbInfo.type === KeyboardEventTypes.KEYUP && kbInfo.event.key === 'i') {
              // Inspector is large; load it from npm only when first requested.
              // (scene.debugLayer would also fetch a CDN copy, which breaks.)
              import('@babylonjs/inspector').then(({ Inspector }) => {
                if (Inspector.IsVisible) Inspector.Hide();
                else Inspector.Show(scene, { embedMode: true, overlay: true, globalRoot: document.body });
              });
            }
          });
        }}
      >
        <Content
          season={season}
          isMobile={isMobile}
          onReady={onReady}
          onPetalPS={setPetalPS}
          onGreenPS={setGreenPS}
          onRedPS={setRedPS}
          onSnowPS={setSnowPS}
        />
        {bjsScene && prevSeason !== season && (
          <AnimationCtrl
            scene={bjsScene}
            from={prevSeason}
            to={season}
            petalPS={petalPS}
            greenPS={greenPS}
            redPS={redPS}
            snowPS={snowPS}
            onComplete={onTransitionDone}
          />
        )}
      </Scene>
    </Engine>
  );
};

export default Scene3D;
