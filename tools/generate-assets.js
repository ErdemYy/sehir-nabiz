const fs = require('fs');
const path = require('path');
const sharp = require('../apps/api/node_modules/sharp');

async function generateAssets() {
  const assetsDir = path.join(__dirname, '../apps/mobile/assets');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  const svgContent = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="220" fill="#14B8A6"/>
  <circle cx="512" cy="512" r="320" fill="#0F766E" opacity="0.4"/>
  <path d="M256 512 L384 512 L448 320 L576 704 L640 512 L768 512" fill="none" stroke="#FFFFFF" stroke-width="64" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="512" cy="220" r="48" fill="#FFFFFF"/>
</svg>`;

  const svgBuffer = Buffer.from(svgContent);

  await sharp(svgBuffer).png().toFile(path.join(assetsDir, 'icon.png'));
  await sharp(svgBuffer).png().toFile(path.join(assetsDir, 'adaptive-icon.png'));
  await sharp(svgBuffer)
    .resize(1284, 2778, { fit: 'contain', background: '#14B8A6' })
    .png()
    .toFile(path.join(assetsDir, 'splash.png'));

  console.log('Mobile assets successfully generated in apps/mobile/assets.');
}

generateAssets().catch((err) => {
  console.error('Asset generation error:', err);
  process.exit(1);
});
