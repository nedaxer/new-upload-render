import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function createAppIconFromLogo() {
  const logoPath = './attached_assets/IMG-20250617-WA0042_1750203269591.jpg';
  const publicDir = './client/public';
  const iconsDir = path.join(publicDir, 'icons');

  // Ensure directories exist
  await fs.mkdir(iconsDir, { recursive: true });

  // Icon sizes for PWA and mobile apps
  const iconSizes = [
    { size: 72, name: 'icon-72x72.png' },
    { size: 96, name: 'icon-96x96.png' },
    { size: 128, name: 'icon-128x128.png' },
    { size: 144, name: 'icon-144x144.png' },
    { size: 152, name: 'icon-152x152.png' },
    { size: 192, name: 'icon-192x192.png' },
    { size: 384, name: 'icon-384x384.png' },
    { size: 512, name: 'icon-512x512.png' },
    { size: 1024, name: 'icon-1024x1024.png' },
  ];

  console.log('Creating app icons from your logo...');

  try {
    // Read the original logo
    const logoBuffer = await fs.readFile(logoPath);
    
    // Create icons for each size
    for (const { size, name } of iconSizes) {
      const iconPath = path.join(iconsDir, name);
      
      await sharp(logoBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(iconPath);
      
      console.log(`✓ Created ${name} (${size}x${size})`);
    }

    // Create favicon.ico
    const faviconPath = path.join(publicDir, 'favicon.ico');
    await sharp(logoBuffer)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(faviconPath);
    
    console.log('✓ Created favicon.ico');

    // Create apple-touch-icon (for iOS home screen)
    const appleTouchIconPath = path.join(publicDir, 'apple-touch-icon.png');
    await sharp(logoBuffer)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(appleTouchIconPath);
    
    console.log('✓ Created apple-touch-icon.png');

    console.log('\n🎉 All app icons created successfully!');
    
  } catch (error) {
    console.error('Error creating app icons:', error);
  }
}

createAppIconFromLogo();