import React from 'react';
import { Engine } from 'reactylon/web';
import { Scene } from 'reactylon';
import Content from './Content';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
// Ensure .glb/.gltf loading works
import '@babylonjs/loaders';
// Import the Inspector (DebugLayer)
import '@babylonjs/inspector';
// Import KeyboardEventTypes so we can check kbInfo.type
import { KeyboardEventTypes } from '@babylonjs/core/Events/keyboardEvents';

type AppProps = {
  havok: unknown;
};

const App: React.FC<AppProps> = ({ havok }) => {
  return (
    <Engine antialias>
      <Scene
        onSceneReady={(scene) => {
          // Create default camera & light
          scene.createDefaultCameraOrLight(true, undefined, true);

          // Increase default light intensity
          if (scene.lights.length > 0) {
            scene.lights.forEach(light => {
              light.intensity = 1.34; // 💡 Adjust brightness
            });
          }

          // Show the Inspector immediately
          scene.debugLayer.show({
            embedMode: true,  // Inspector embedded in canvas area
            overlay: true,    // Inspector overlay on top of canvas
          });

          // Toggle Inspector on “I” key press
          scene.onKeyboardObservable.add((kbInfo) => {
            if (
              kbInfo.type === KeyboardEventTypes.KEYUP &&
              kbInfo.event.key === 'i'
            ) {
              if (scene.debugLayer.isVisible()) {
                scene.debugLayer.hide();
              } else {
                scene.debugLayer.show({ embedMode: true, overlay: true});
              }
            }
          });
        }}
        physicsOptions={{
          plugin: new HavokPlugin(true, havok),
        }}
      >
        <Content />
      </Scene>
    </Engine>
  );
};

export default App;