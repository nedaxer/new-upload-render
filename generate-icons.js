import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, 'client/public/icons/icon-512x512.png');
const outputDir = path.join(__dirname, 'client/public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate icons for each size
async function generateIcons() {
  for (const size of sizes) {
    await sharp(inputFile)
      .resize(size, size)
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    console.log(`Generated icon: ${size}x${size}`);
  }
  
  // Create a square icon with padding for better app icon display
  // This creates a version with a background and padding for better visibility
  await sharp(inputFile)
    .resize(512, 512)
    .composite([{
      input: Buffer.from(
        '<svg><rect x="0" y="0" width="512" height="512" rx="50" ry="50" fill="#0033a0"/></svg>'
      ),
      blend: 'destination-over'
    }])
    .toFile(path.join(outputDir, 'app-icon.png'));
  console.log('Generated app icon with background');
}

generateIcons().catch(console.error);