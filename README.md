# Anime Foliage
<img width="1024" height="768" alt="anime-foliage" src="https://github.com/user-attachments/assets/03241891-e156-4b8d-945d-cce3284e2646" />


A real-time 3D “anime foliage” demo built with **Reactylon** + **Babylon.js**, inspired by Trung Duy Nguyen’s Blender pipeline. Watch brush-stroke-style leaves always face the camera and sway in the wind!

## Project Structure

```plaintext
anime-foliage/
├── public/
│   └── textures/
│       └── leaf.png        # Stylized alpha-masked brush-stroke texture
├── src/
│   ├── App.tsx             # Reactylon engine + scene setup
│   ├── Content.tsx         # Foliage generation, instancing & wind logic
│   └── index.tsx           # React entry point
├── scripts/
│   ├── coppy-assets.js     # Manages the deployment in production
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

```bash
git clone https://github.com/MarcosPimienta/anime-foliage.git
cd anime-foliage
npm install
npm start
```

## Features

* 🎋 Billboarded Leaves: Planes always face the camera for perfect brush-stroke alignment
* 🌿 Instanced Meshes: Hundreds of leaves rendered efficiently
* 🎨 Cel-Shaded Material: Alpha-masked leaf texture with flat color look
* 🌬️ Wind Mechanics: Simple sine-wave sway now; swap in noise-driven shaders later
* ⚙️ Extensible: Ready for Node Material Editor (NME) & Node Geometry Editor (NGE) enhancements
