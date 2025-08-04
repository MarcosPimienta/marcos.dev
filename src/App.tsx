import React, { useState, useEffect } from 'react';
import Content, { Season } from './Content';
import { AnimationCtrl } from './AnimationCtrl';
import { Engine } from 'reactylon/web';
import { Scene } from 'reactylon';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
import '@babylonjs/loaders';
import '@babylonjs/inspector';
import { KeyboardEventTypes } from '@babylonjs/core/Events/keyboardEvents';
import type { Scene as BjsScene, ParticleSystem } from '@babylonjs/core';
import ServicesPanel from './ServicesPanel';
import WorksPanel from './WorksPanel';
import AboutPanel from './AboutPanel';
import ContactPanel from './ContactPanel';

const seasons = [Season.Spring, Season.Summer, Season.Fall, Season.Winter];
const seasonLabels: Record<Season, string> = {
  [Season.Spring]: 'Services',
  [Season.Summer]: 'Works',
  [Season.Fall]:   'About',
  [Season.Winter]: 'Contact',
};

const App: React.FC<{ havok: unknown }> = ({ havok }) => {
  const [selectedSeason, setSelectedSeason] = useState<Season>(Season.Spring);
  const [prevSeason, setPrevSeason]         = useState<Season>(Season.Spring);
  const [bjsScene, setBjsScene]             = useState<BjsScene | null>(null);
  const [petalPS,  setPetalPS]  = useState<ParticleSystem | null>(null);
  const [greenPS,  setGreenPS]  = useState<ParticleSystem | null>(null);
  const [redPS,    setRedPS]    = useState<ParticleSystem | null>(null);
  const [snowPS,   setSnowPS]   = useState<ParticleSystem | null>(null);

  function renderPanelContent() {
  switch (selectedSeason) {
    case Season.Spring:
      return <ServicesPanel />;
    case Season.Summer:
      return <WorksPanel />;
    case Season.Fall:
      return <AboutPanel />;
    case Season.Winter:
      return <ContactPanel />;
    default:
      return null;
  }
}

  // whenever the user picks a new season, prevSeason will hold
  // the one we just animated *from*, and selectedSeason is our
  // target
  useEffect(() => {
    if (bjsScene && prevSeason !== selectedSeason) {
      // once the animation is done, bump prevSeason forward
      const onComplete = () => setPrevSeason(selectedSeason)

      // kick off the animation
      // <AnimationCtrl> is rendered down in the JSX
      return;
    }
  }, [bjsScene, prevSeason, selectedSeason]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div className="panel-frame">
        <div className="season-tabs">
          <div className="name-title">Marcos Pimienta</div>
          {seasons.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSeason(s)}
              className={`season-tab ${selectedSeason === s ? 'selected' : ''}`}
              aria-pressed={selectedSeason === s}
            >
              {seasonLabels[s]}
            </button>
          ))}
        </div>
        <div className="panel-content scrollable-custom">{renderPanelContent()}</div>
      </div>

      <Engine antialias>
        <Scene
          onSceneReady={scene => {
            setBjsScene(scene as BjsScene);
            scene.createDefaultCameraOrLight(true, undefined, true);
            scene.lights.forEach(l => (l.intensity = 1.34));
            scene.onKeyboardObservable.add(kbInfo => {
              if (
                kbInfo.type === KeyboardEventTypes.KEYUP &&
                kbInfo.event.key === 'i'
              ) {
                if (scene.debugLayer.isVisible()) {
                  scene.debugLayer.hide();
                } else {
                  scene.debugLayer.show({ embedMode: true, overlay: true });
                }
              }
            });
          }}
          physicsOptions={{ plugin: new HavokPlugin(true, havok) }}
        >
          <Content
            season={selectedSeason}
            onPetalPS={setPetalPS}
            onGreenPS={setGreenPS}
            onRedPS={setRedPS}
            onSnowPS={setSnowPS}
          />

          {bjsScene && prevSeason !== selectedSeason && (
            <AnimationCtrl
              scene={bjsScene}
              from={prevSeason}
              to={selectedSeason}
              petalPS={petalPS}
              greenPS={greenPS}
              redPS={redPS}
              snowPS={snowPS}
              onComplete={() => setPrevSeason(selectedSeason)}
            />
          )}
        </Scene>
      </Engine>
    </div>
  );
};

export default App;