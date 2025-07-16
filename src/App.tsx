// App.tsx
import React, { useState } from 'react';
import Content, { Season } from './Content';
import { Engine } from 'reactylon/web';
import { Scene } from 'reactylon';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
import '@babylonjs/loaders';
import '@babylonjs/inspector';
import { KeyboardEventTypes } from '@babylonjs/core/Events/keyboardEvents';

const seasons = [Season.Summer, Season.Fall, Season.Winter, Season.Spring];

const App: React.FC<{ havok: unknown }> = ({ havok }) => {
  const [selectedSeason, setSelectedSeason] = useState<Season>(Season.Summer);

  return (
    // 1) Container with relative positioning and full-viewport size
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* 2) Overlayed React buttons */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          display: 'flex',
          gap: '8px',
          zIndex: 5,
        }}
      >
        {seasons.map(s => (
          <button
            key={s}
            onClick={() => setSelectedSeason(s)}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              background: selectedSeason === s ? '#4cafef' : '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* 3) Babylon Engine + Scene (no style on Engine) */}
      <Engine antialias>
        <Scene
          // the Scene will fill its parent <div>
          onSceneReady={scene => {
            scene.createDefaultCameraOrLight(true, undefined, true);
            scene.lights.forEach(l => (l.intensity = 1.34));
            scene.onKeyboardObservable.add(kbInfo => {
              if (
                kbInfo.type === KeyboardEventTypes.KEYUP &&
                kbInfo.event.key === 'i'
              ) {
                scene.debugLayer.isVisible()
                  ? scene.debugLayer.hide()
                  : scene.debugLayer.show({ embedMode: true, overlay: true });
              }
            });
          }}
          physicsOptions={{ plugin: new HavokPlugin(true, havok) }}
        >
          {/* 4) Pass selection down to your Content */}
          <Content season={selectedSeason} />
        </Scene>
      </Engine>
    </div>
  );
};

export default App;