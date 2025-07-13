import { Scene as BabylonScene } from '@babylonjs/core';
import { ReactNode } from 'react';
import { IPhysicsEnginePlugin } from '@babylonjs/core/Physics/IPhysicsEngine';

declare module 'reactylon' {
  export interface SceneProps {
    children?: ReactNode;
    onSceneReady?: (scene: BabylonScene) => void;
    physicsOptions?: {
      plugin: IPhysicsEnginePlugin;
    };
  }

  export const Scene: React.FC<SceneProps>;

  export function register(
    primitiveName: string,
    creator: (props: PrimitiveProps) => any
  ): void;

  export function useScene(): BabylonScene;
  export function useModel(path: string): { meshes: Mesh[] };
}
