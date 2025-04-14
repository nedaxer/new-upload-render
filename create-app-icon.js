import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.join(__dirname, 'client/public/icons/icon-512x512.png');
const outputFile = path.join(__dirname, 'client/public/icons/app-icon.png');

// Create a square icon with padding for better app icon display
async function createAppIcon() {
  // Generate a background with rounded corners
  const background = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 51, b: 160, alpha: 1 } // #0033a0
    }
  })
  .png()
  .toBuffer();
  
  // Resize and add logo on top of background
  await sharp(inputFile)
    .resize(400, 400) // Slightly smaller to leave padding
    .composite([{
      input: background,
      gravity: 'center'
    }])
    .toFile(outputFile);
  
  console.log('Generated app icon with background');
}

createAppIcon().catch(console.error);