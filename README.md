# marcos.dev
<img width="1024" height="768" alt="marcos.dev" src="https://github.com/user-attachments/assets/03241891-e156-4b8d-945d-cce3284e2646" />

Personal portfolio of Marcos Pimienta, live at **https://MarcosPimienta.github.io/marcos.dev**.

A real-time 3D sakura garden built with **React + Reactylon + Babylon.js** sits behind the content. Each section is tied to a season, and the garden changes when you switch tabs (desktop) or scroll into a section (phones):

| Section  | Season | Scene                            |
| -------- | ------ | -------------------------------- |
| Works    | Spring | Sakura blossoms, falling petals  |
| About    | Summer | Green foliage, falling leaves    |
| Services | Fall   | Red foliage, ground leaves       |
| Contact  | Winter | Snow cover, snowfall             |

## Getting started

Requires Node 22+.

```bash
git clone https://github.com/MarcosPimienta/marcos.dev.git
cd marcos.dev
npm ci
npm start          # dev server at http://localhost:3000
```

Press `i` in the scene to toggle the Babylon.js inspector.

## Deploying

Every push to `main` builds the site and publishes it to the `gh-pages` branch through
[.github/workflows/deploy.yml](.github/workflows/deploy.yml) (Actions tab → *Deploy to GitHub Pages*).
`npm run deploy` still works for a manual deploy from your machine.

## Editing content

All text lives in `src/data/`; the desktop panels and the mobile page both render from it.

| What                         | Where                                    |
| ---------------------------- | ---------------------------------------- |
| Name, tagline, open-to-work, contact links, CV | `src/data/profile.ts`  |
| Projects (Works)             | `src/data/projects.ts`                   |
| Profile, skills, experience, education | `src/data/about.ts`            |
| Services                     | `src/data/services.ts`                   |

**Add your CV:** put the PDF in `public/cv/` and set `cvPath: "cv/<file>.pdf"` in `src/data/profile.ts`. The CV buttons appear automatically.

**Add a project:** add an entry to `src/data/projects.ts` (`featured: true` puts it under *Selected work*), then add its preview as `public/media/<media>.mp4` plus a poster `public/media/<media>.jpg`. From a screen recording or GIF:

```bash
ffmpeg -i input.gif -movflags +faststart -pix_fmt yuv420p -vf "scale=800:-2,fps=15" \
  -c:v libx264 -crf 28 -preset slow -an public/media/MyProject.mp4
ffmpeg -ss 3 -i public/media/MyProject.mp4 -frames:v 1 -q:v 4 public/media/MyProject.jpg
```

## How it loads

* The page text renders from a small bundle (~0.2 MB). Babylon and the scene are a separate chunk
  (`src/Scene3D.tsx`) that streams in behind a painted dawn backdrop drawn in CSS (no image to download),
  which fades out when the live scene is ready.
* Phones with data saver on (or on 2G) get the painted backdrop and a button to load the 3D on demand.
* Project previews are MP4s that only download and play while on screen.
* Models are compressed with meshopt (`EXT_meshopt_compression`, no quantization). The decoder is
  self-hosted in `public/libs/`. Re-run the same treatment on any new GLB before adding it.

## Project structure

```plaintext
marcos.dev/
├── .github/workflows/deploy.yml   # build + publish to gh-pages on push to main
├── public/
│   ├── index.html          # HTML template: meta/Open Graph tags, fonts, stylesheets
│   ├── css/                # Styles (panels.css holds layout, desktop + mobile)
│   ├── media/              # Project preview MP4s + posters, og-image.jpg
│   ├── meshes/             # GLB models (meshopt-compressed)
│   ├── libs/               # Self-hosted meshopt decoder
│   ├── particlesettings/   # Particle system JSON (petals, leaves, red leaves, snow)
│   └── textures/           # Textures, color ramps, skybox, particle sprites
├── src/
│   ├── index.tsx           # Entry point
│   ├── App.tsx             # Picks desktop (side panel) or mobile (scrolling page) layout
│   ├── MobileLayout.tsx    # Phone layout: hero + sections over the fixed scene
│   ├── Scene3D.tsx         # Babylon engine/scene (lazy-loaded chunk)
│   ├── Content.tsx         # Scene building: models, instanced foliage/grass, materials, particles
│   ├── AnimationCtrl.tsx   # Season-to-season transition animations
│   ├── LoadingOverlay.tsx  # Poster + loading pill while the 3D loads
│   ├── *Panel.tsx          # Works / About / Services / Contact
│   ├── sections.ts         # Section ↔ season mapping
│   └── data/               # All site content (see "Editing content")
└── scripts/copy-assets.js  # Copies public/ into dist/ after the production build
```

## Rendering notes

* Foliage, flowers and grass are billboarded planes, instanced at the face centers of emitter meshes.
  They use `CustomMaterial` shaders that shade by the original face normal through a color ramp. The
  custom vertex code runs in the `Vertex_After_WorldPosComputed` hook and uses `finalWorld`, because
  `world` is not declared for instanced meshes.
* On phones the camera uses a fixed horizontal field of view (portrait framing), turns slowly on its
  own instead of orbiting on touch, skips SSAO, halves particle counts, and renders at ≤1.5× device
  pixels (1× once text covers the scene).
