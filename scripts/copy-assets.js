const fs = require('fs-extra');
const path = require('path');

const sourcePath = path.join(__dirname, '../public');
const targetPath = path.join(__dirname, '../dist');

async function copyAssets() {
  try {
    // Ensure meshes and textures directories exist
    await fs.ensureDir(path.join(targetPath, 'meshes'));
    await fs.ensureDir(path.join(targetPath, 'textures'));
    await fs.ensureDir(path.join(targetPath, 'particlesettings'));

    // Copy meshes and textures
    await fs.copy(
      path.join(sourcePath, 'meshes'),
      path.join(targetPath, 'meshes')
    );
    await fs.copy(
      path.join(sourcePath, 'textures'),
      path.join(targetPath, 'textures')
    );
    await fs.copy(
      path.join(sourcePath, 'particlesettings'),
      path.join(targetPath, 'particlesettings')
    );

    console.log('Assets copied successfully');
  } catch (err) {
    console.error('Error copying assets:', err);
    process.exit(1);
  }
}

copyAssets();
