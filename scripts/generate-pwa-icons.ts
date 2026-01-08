/**
 * PWA Icon Generator Script
 * 
 * This script generates PWA icons from a source image.
 * Run with: npx ts-node scripts/generate-pwa-icons.ts
 * 
 * Prerequisites: npm install -D sharp @types/sharp
 */

import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SOURCE_IMAGE = 'public/logo.png';
const OUTPUT_DIR = 'public/icons';

async function generateIcons() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Check if source image exists
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error(`Source image not found: ${SOURCE_IMAGE}`);
    console.log('Creating placeholder icons with warehouse symbol...');
    await createPlaceholderIcons();
    return;
  }

  console.log(`Generating icons from ${SOURCE_IMAGE}...`);

  for (const size of ICON_SIZES) {
    // Regular icon
    await sharp(SOURCE_IMAGE)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, `icon-${size}x${size}.png`));
    
    console.log(`✓ Generated icon-${size}x${size}.png`);
  }

  // Maskable icons (with padding for safe zone)
  for (const size of [192, 512]) {
    const padding = Math.floor(size * 0.1); // 10% padding
    const innerSize = size - (padding * 2);
    
    await sharp(SOURCE_IMAGE)
      .resize(innerSize, innerSize, {
        fit: 'contain',
        background: { r: 15, g: 23, b: 42, alpha: 1 } // slate-900
      })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 15, g: 23, b: 42, alpha: 1 }
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, `icon-maskable-${size}x${size}.png`));
    
    console.log(`✓ Generated icon-maskable-${size}x${size}.png`);
  }

  // Apple touch icon (180x180)
  await sharp(SOURCE_IMAGE)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'apple-touch-icon.png'));
  
  console.log('✓ Generated apple-touch-icon.png');
  console.log('\nAll icons generated successfully!');
}

async function createPlaceholderIcons() {
  // Create simple SVG-based placeholder icons
  const createSvg = (size: number, isMaskable = false) => {
    const bgColor = isMaskable ? '#0f172a' : '#ffffff';
    const fgColor = isMaskable ? '#ffffff' : '#0f172a';
    const iconScale = isMaskable ? 0.6 : 0.7;
    const iconSize = Math.floor(size * iconScale);
    const offset = Math.floor((size - iconSize) / 2);
    
    return `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${bgColor}"/>
        <g transform="translate(${offset}, ${offset})">
          <rect x="${iconSize * 0.1}" y="${iconSize * 0.3}" 
                width="${iconSize * 0.8}" height="${iconSize * 0.6}" 
                fill="none" stroke="${fgColor}" stroke-width="${Math.max(2, size / 50)}"/>
          <line x1="${iconSize * 0.1}" y1="${iconSize * 0.3}" 
                x2="${iconSize * 0.5}" y2="${iconSize * 0.1}" 
                stroke="${fgColor}" stroke-width="${Math.max(2, size / 50)}"/>
          <line x1="${iconSize * 0.9}" y1="${iconSize * 0.3}" 
                x2="${iconSize * 0.5}" y2="${iconSize * 0.1}" 
                stroke="${fgColor}" stroke-width="${Math.max(2, size / 50)}"/>
          <line x1="${iconSize * 0.35}" y1="${iconSize * 0.5}" 
                x2="${iconSize * 0.35}" y2="${iconSize * 0.9}" 
                stroke="${fgColor}" stroke-width="${Math.max(2, size / 50)}"/>
          <line x1="${iconSize * 0.65}" y1="${iconSize * 0.5}" 
                x2="${iconSize * 0.65}" y2="${iconSize * 0.9}" 
                stroke="${fgColor}" stroke-width="${Math.max(2, size / 50)}"/>
        </g>
      </svg>
    `;
  };

  for (const size of ICON_SIZES) {
    const svg = createSvg(size, false);
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(OUTPUT_DIR, `icon-${size}x${size}.png`));
    console.log(`✓ Generated placeholder icon-${size}x${size}.png`);
  }

  for (const size of [192, 512]) {
    const svg = createSvg(size, true);
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(OUTPUT_DIR, `icon-maskable-${size}x${size}.png`));
    console.log(`✓ Generated placeholder icon-maskable-${size}x${size}.png`);
  }

  // Apple touch icon
  const appleSvg = createSvg(180, false);
  await sharp(Buffer.from(appleSvg))
    .png()
    .toFile(path.join(OUTPUT_DIR, 'apple-touch-icon.png'));
  console.log('✓ Generated placeholder apple-touch-icon.png');
}

generateIcons().catch(console.error);
