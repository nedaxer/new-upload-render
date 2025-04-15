import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folder to save generated images
const outputFolder = path.join(__dirname, 'attached_assets/team_photos');

// Ensure output folder exists
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

// Gradient colors for team photos
const colors = [
  ['#0033a0', '#002580'], // Nedaxer blue gradient
  ['#ff5900', '#cc4700'], // Nedaxer orange gradient
  ['#0033a0', '#ff5900'], // Nedaxer blue to orange gradient
  ['#4a90e2', '#0033a0'], // Light blue to Nedaxer blue
  ['#8c52ff', '#0033a0'], // Purple to Nedaxer blue
  ['#00a5e0', '#0033a0']  // Cyan to Nedaxer blue
];

// Generate team photo placeholders
async function generateTeamPhotos() {
  // Main team photo
  await generateTeamGroupPhoto('team_main.png', 800, 400, colors[0]);
  
  // Individual team photos
  for (let i = 1; i <= 6; i++) {
    const colorIndex = (i - 1) % colors.length;
    await generateTeamGroupPhoto(`team_${i}.png`, 600, 400, colors[colorIndex]);
  }
  
  console.log('Team photos generated successfully!');
}

// Generate a team photo with text and gradient
async function generateTeamGroupPhoto(filename, width, height, colors) {
  // Create SVG with gradient background and Nedaxer text
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="100%" stop-color="${colors[1]}" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#gradient)" />
      
      <!-- Team silhouettes -->
      <g fill="#ffffff" opacity="0.3" transform="translate(${width/2 - 200}, ${height/2 - 100})">
        <circle cx="80" cy="60" r="40" />
        <rect x="40" y="100" width="80" height="120" rx="10" />
        
        <circle cx="180" cy="60" r="40" />
        <rect x="140" y="100" width="80" height="120" rx="10" />
        
        <circle cx="280" cy="60" r="40" />
        <rect x="240" y="100" width="80" height="120" rx="10" />
        
        <circle cx="130" cy="160" r="40" />
        <rect x="90" y="200" width="80" height="120" rx="10" />
        
        <circle cx="230" cy="160" r="40" />
        <rect x="190" y="200" width="80" height="120" rx="10" />
      </g>
      
      <!-- Nedaxer logo text -->
      <text x="${width/2}" y="${height-40}" font-family="Arial" font-size="24" font-weight="bold" fill="white" text-anchor="middle">Nedaxer Team</text>
    </svg>
  `;

  // Convert SVG to PNG with sharp
  await sharp(Buffer.from(svg))
    .toFile(path.join(outputFolder, filename));
}

// Generate the photos
generateTeamPhotos().catch(err => console.error('Error generating team photos:', err));