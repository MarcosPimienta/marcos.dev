// Copy every static asset in public/ into dist/ after the webpack build.
// index.html is skipped: HtmlWebpackPlugin generates dist/index.html from it.
const fs = require('fs-extra');
const path = require('path');

const sourcePath = path.join(__dirname, '../public');
const targetPath = path.join(__dirname, '../dist');

async function copyAssets() {
  try {
    await fs.copy(sourcePath, targetPath, {
      filter: src => path.relative(sourcePath, src) !== 'index.html',
    });
    console.log('Assets copied successfully');
  } catch (err) {
    console.error('Error copying assets:', err);
    process.exit(1);
  }
}

copyAssets();
