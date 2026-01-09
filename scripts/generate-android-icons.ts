/**
 * Generate Android launcher icons from logo.png
 * Run with: npx ts-node scripts/generate-android-icons.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const SOURCE_LOGO = path.join(__dirname, '..', 'public', 'logo.png');
const ANDROID_RES = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

// Android icon sizes for different densities
const ICON_SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const FOREGROUND_SIZES = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

async function generateAndroidIcons() {
  console.log('Generating Android launcher icons from logo.png...\n');

  if (!fs.existsSync(SOURCE_LOGO)) {
    console.error(`Error: Source logo not found at ${SOURCE_LOGO}`);
    process.exit(1);
  }

  try {
    // Generate standard launcher icons
    for (const [folder, size] of Object.entries(ICON_SIZES)) {
      const folderPath = path.join(ANDROID_RES, folder);
      
      // Ensure directory exists
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Generate ic_launcher.png
      await sharp(SOURCE_LOGO)
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toFile(path.join(folderPath, 'ic_launcher.png'));

      // Generate ic_launcher_round.png (same as regular)
      await sharp(SOURCE_LOGO)
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toFile(path.join(folderPath, 'ic_launcher_round.png'));

      console.log(`✓ Generated icons for ${folder} (${size}x${size})`);
    }

    // Generate foreground icons for adaptive icons
    for (const [folder, size] of Object.entries(FOREGROUND_SIZES)) {
      const folderPath = path.join(ANDROID_RES, folder);
      
      // Ensure directory exists
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Generate ic_launcher_foreground.png with padding for adaptive icons
      const padding = Math.floor(size * 0.25); // 25% padding
      const logoSize = size - (padding * 2);
      
      await sharp(SOURCE_LOGO)
        .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(path.join(folderPath, 'ic_launcher_foreground.png'));

      console.log(`✓ Generated foreground icon for ${folder} (${size}x${size})`);
    }

    console.log('\n✅ All Android launcher icons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run build');
    console.log('2. Run: npx cap sync android');
    console.log('3. Run: cd android && .\\gradlew assembleDebug');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateAndroidIcons();
