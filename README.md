# marcos.dev
<img width="1024" height="768" alt="marcos.dev" src="https://github.com/user-attachments/assets/03241891-e156-4b8d-945d-cce3284e2646" />

Personal portfolio of Marcos Pimienta, live at **https://MarcosPimienta.github.io/marcos.dev**.

A real-time 3D sakura garden built with **React + Reactylon + Babylon.js** sits behind a tabbed info panel. Each tab is tied to a season, and switching tabs animates the scene between seasons:

| Tab      | Season | Scene                                   |
| -------- | ------ | --------------------------------------- |
| Services | Spring | Sakura blossoms, falling petals         |
| Works    | Summer | Green foliage, falling leaves           |
| About    | Fall   | Red foliage, ground leaves              |
| Contact  | Winter | Snow cover, snowfall                    |

## Getting Started

Requires Node 22+.

```bash
git clone https://github.com/MarcosPimienta/marcos.dev.git
cd marcos.dev
npm ci
npm start          # dev server at http://localhost:3000
```

Press `i` in the scene to toggle the Babylon.js inspector.

## Scripts

| Command          | What it does                                                         |
| ---------------- | -------------------------------------------------------------------- |
| `npm start`      | Webpack dev server (serves `public/` as static assets)               |
| `npm run build`  | Production bundle into `dist/`, then copies assets from `public/`    |
| `npm run deploy` | Builds and publishes `dist/` to the `gh-pages` branch                |

## Project Structure

```plaintext
marcos.dev/
├── public/
│   ├── index.html          # HTML template (fonts + panel stylesheets)
│   ├── css/                # Panel styles (base, services, works, about, contact, panels)
│   ├── gifs/               # Project previews shown in the Works tab
│   ├── meshes/             # GLB models (tree, hill, walls, snow, emitters)
│   ├── particlesettings/   # Particle system JSON (petals, leaves, red leaves, snow)
│   └── textures/           # Textures, color ramps, skybox, particle sprites
├── src/
│   ├── index.tsx           # Entry point: loads Havok, mounts <App>
│   ├── App.tsx             # Layout (desktop panel / mobile drawer), tabs, Babylon engine + scene
│   ├── Content.tsx         # Scene building: models, instanced foliage/grass, materials, particles
│   ├── AnimationCtrl.tsx   # Season-to-season transition animations
│   ├── Section.tsx         # Shared collapsible section component
│   ├── ServicesPanel.tsx   # Services tab
│   ├── WorksPanel.tsx      # Works tab (project list lives here as data)
│   ├── AboutPanel.tsx      # About tab (skills + experience)
│   ├── ContactPanel.tsx    # Contact tab
│   └── config.ts           # Base path (/marcos.dev in production)
├── scripts/
│   └── copy-assets.js      # Copies public/ assets into dist/ after the production build
└── webpack.config.ts
```

## Rendering notes

* Foliage, flowers and grass are billboarded planes, instanced at the face centers of emitter meshes.
* They use `CustomMaterial` shaders that shade by the original face normal through a color ramp. The custom vertex code runs in the `Vertex_After_WorldPosComputed` hook and uses `finalWorld`, because `world` is not declared for instanced meshes.
* Other effects: a cel-shaded tree, PBR sand and snow, SSAO, a watercolor post-process, and cross-fading skyboxes.
