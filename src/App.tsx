import React, { useState, useEffect, useCallback } from 'react';
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

const MOBILE_BREAKPOINT = 1000;

const seasons = [Season.Spring, Season.Summer, Season.Fall, Season.Winter];
const seasonLabels: Record<Season, string> = {
  [Season.Spring]: 'Services',
  [Season.Summer]: 'Works',
  [Season.Fall]: 'About',
  [Season.Winter]: 'Contact',
};

const useWindowWidth = () => {
  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
};

const App: React.FC<{ havok: unknown }> = ({ havok }) => {
  const [selectedSeason, setSelectedSeason] = useState<Season>(Season.Spring);
  const [prevSeason, setPrevSeason] = useState<Season>(Season.Spring);
  const [bjsScene, setBjsScene] = useState<BjsScene | null>(null);
  const [petalPS, setPetalPS] = useState<ParticleSystem | null>(null);
  const [greenPS, setGreenPS] = useState<ParticleSystem | null>(null);
  const [redPS, setRedPS] = useState<ParticleSystem | null>(null);
  const [snowPS, setSnowPS] = useState<ParticleSystem | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<boolean>(false);

  const width = useWindowWidth();
  const isMobile = width <= MOBILE_BREAKPOINT;

  const renderPanelContent = useCallback(() => {
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
  }, [selectedSeason]);

  // when season changes on mobile, auto-expand
  useEffect(() => {
    if (isMobile) {
      setMobileExpanded(true);
    }
  }, [selectedSeason, isMobile]);

  useEffect(() => {
    if (bjsScene && prevSeason !== selectedSeason) {
      const onComplete = () => setPrevSeason(selectedSeason);
      return;
    }
  }, [bjsScene, prevSeason, selectedSeason]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {isMobile ? (
        <>
          {/* Top bar for mobile */}
          <div className="mobile-topbar">
            <div className="name-title">Marcos Pimienta</div>
            <div className="season-tabs">
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
          </div>

          {/* Bottom panel drawer */}
          <div className={`mobile-bottom-panel ${mobileExpanded ? 'expanded' : ''}`}>
            <div
              className="expand-handle"
              role="button"
              aria-label={mobileExpanded ? 'Collapse panel' : 'Expand panel'}
              onClick={() => setMobileExpanded(e => !e)}
            />
            <div className="panel-content scrollable-custom">
              {renderPanelContent()}
            </div>
          </div>
        </>
      ) : (
        // Desktop/right-side panel
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
      )}

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