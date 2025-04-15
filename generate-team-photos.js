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

// Brand colors
const brandColors = {
  blue: '#0033a0',
  orange: '#ff5900',
  lightBlue: '#4a90e2',
  purple: '#8c52ff',
  cyan: '#00a5e0'
};

// Office environments for backgrounds
const officeBackgrounds = [
  { name: 'modern', colors: [brandColors.blue, '#002580'] },
  { name: 'collaboration', colors: [brandColors.orange, '#cc4700'] },
  { name: 'tech', colors: [brandColors.blue, brandColors.orange] },
  { name: 'meeting', colors: [brandColors.lightBlue, brandColors.blue] },
  { name: 'workshop', colors: [brandColors.purple, brandColors.blue] },
  { name: 'celebration', colors: [brandColors.cyan, brandColors.blue] }
];

// Team descriptions for each image
const teamScenes = [
  { 
    name: 'Full Team', 
    description: 'The Nedaxer team at our annual company retreat',
    peopleCount: 10,
    arrangement: 'group'
  },
  { 
    name: 'Engineering', 
    description: 'Engineering team collaborating on platform improvements',
    peopleCount: 4,
    arrangement: 'grouped'
  },
  { 
    name: 'Product', 
    description: 'Product team discussing new trading features',
    peopleCount: 3,
    arrangement: 'meeting'
  },
  { 
    name: 'Marketing', 
    description: 'Marketing team planning campaign strategy',
    peopleCount: 3,
    arrangement: 'casual'
  },
  { 
    name: 'Customer Support', 
    description: 'Customer support team enhancing trader experience',
    peopleCount: 3,
    arrangement: 'desks'
  },
  { 
    name: 'Leadership', 
    description: 'Leadership team charting our strategic direction',
    peopleCount: 4,
    arrangement: 'boardroom'
  },
  { 
    name: 'Company Culture', 
    description: 'Team-building activities at Nedaxer headquarters',
    peopleCount: 6,
    arrangement: 'social'
  }
];

// Generate team photo placeholders with more realistic appearance
async function generateTeamPhotos() {
  // Main team photo
  await generateTeamGroupPhoto('team_main.png', 1200, 600, officeBackgrounds[0].colors, teamScenes[0]);
  
  // Individual team photos
  for (let i = 1; i <= 6; i++) {
    const backgroundIndex = (i - 1) % officeBackgrounds.length;
    const sceneIndex = i % teamScenes.length;
    await generateTeamGroupPhoto(
      `team_${i}.png`, 
      800, 
      500, 
      officeBackgrounds[backgroundIndex].colors, 
      teamScenes[sceneIndex]
    );
  }
  
  console.log('Enhanced team photos generated successfully!');
}

// Generate a team photo with more realistic and varied elements
async function generateTeamGroupPhoto(filename, width, height, colors, scene) {
  // Create more detailed SVG with office environment and varied team members
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="background" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="100%" stop-color="${colors[1]}" />
        </linearGradient>
        
        <!-- Office environment patterns -->
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/>
        </pattern>
        
        <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1" fill="white" opacity="0.1"/>
        </pattern>
        
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
      </defs>
      
      <!-- Base background with gradient -->
      <rect width="${width}" height="${height}" fill="url(#background)" />
      
      <!-- Office environment elements -->
      <rect width="${width}" height="${height/2}" y="${height/2}" fill="url(#grid)" opacity="0.3" />
      <rect width="${width}" height="${height}" fill="url(#dots)" />
      
      <!-- Office furniture and elements based on scene type -->
      ${generateOfficeElements(width, height, scene.arrangement)}
      
      <!-- Team members with diverse characteristics -->
      ${generateTeamMembers(width, height, scene.peopleCount, scene.arrangement)}
      
      <!-- Scene information -->
      <rect x="0" y="${height-80}" width="${width}" height="80" fill="rgba(0,0,0,0.7)" />
      <text x="30" y="${height-45}" font-family="Arial" font-size="${width > 1000 ? 28 : 24}" font-weight="bold" fill="white">${scene.name}</text>
      <text x="30" y="${height-20}" font-family="Arial" font-size="${width > 1000 ? 18 : 16}" fill="white">${scene.description}</text>
      
      <!-- Nedaxer branding -->
      <text x="${width-30}" y="${height-25}" font-family="Arial" font-size="${width > 1000 ? 24 : 20}" font-weight="bold" fill="white" text-anchor="end">Nedaxer</text>
    </svg>
  `;

  // Convert SVG to PNG with sharp
  await sharp(Buffer.from(svg))
    .toFile(path.join(outputFolder, filename));
}

// Generate appropriate office elements based on arrangement type
function generateOfficeElements(width, height, arrangement) {
  // Position variables
  const centerX = width / 2;
  const centerY = height / 2;
  
  switch(arrangement) {
    case 'group':
      // Large open office space with backdrop
      return `
        <rect x="${width*0.1}" y="${height*0.15}" width="${width*0.8}" height="${height*0.7}" 
              rx="5" fill="white" opacity="0.1" />
        <rect x="${width*0.05}" y="${height*0.75}" width="${width*0.9}" height="${height*0.1}" 
              fill="white" opacity="0.15" />
      `;
    
    case 'meeting':
      // Conference table setup
      return `
        <rect x="${centerX - width*0.3}" y="${centerY - height*0.15}" width="${width*0.6}" height="${height*0.3}" 
              rx="10" fill="white" opacity="0.2" />
        <ellipse cx="${centerX}" cy="${centerY}" rx="${width*0.25}" ry="${height*0.1}" 
                fill="white" opacity="0.3" />
      `;
    
    case 'boardroom':
      // Executive boardroom
      return `
        <rect x="${width*0.15}" y="${height*0.2}" width="${width*0.7}" height="${height*0.5}" 
              rx="5" fill="white" opacity="0.15" />
        <rect x="${width*0.25}" y="${height*0.3}" width="${width*0.5}" height="${height*0.25}" 
              rx="10" fill="white" opacity="0.25" />
        <rect x="${width*0.1}" y="${height*0.7}" width="${width*0.8}" height="${height*0.05}" 
              fill="white" opacity="0.1" />
      `;
    
    case 'desks':
      // Workstation setup
      return `
        <rect x="${width*0.1}" y="${height*0.3}" width="${width*0.25}" height="${height*0.15}" 
              rx="3" fill="white" opacity="0.2" />
        <rect x="${width*0.4}" y="${height*0.3}" width="${width*0.25}" height="${height*0.15}" 
              rx="3" fill="white" opacity="0.2" />
        <rect x="${width*0.7}" y="${height*0.3}" width="${width*0.2}" height="${height*0.15}" 
              rx="3" fill="white" opacity="0.2" />
        <rect x="${width*0.1}" y="${height*0.5}" width="${width*0.8}" height="${height*0.05}" 
              fill="white" opacity="0.1" />
      `;
    
    case 'casual':
      // Casual seating area
      return `
        <rect x="${width*0.2}" y="${height*0.35}" width="${width*0.6}" height="${height*0.25}" 
              rx="20" fill="white" opacity="0.15" />
        <circle cx="${centerX-width*0.15}" cy="${centerY+height*0.05}" r="${width*0.08}" 
                fill="white" opacity="0.2" />
        <circle cx="${centerX+width*0.15}" cy="${centerY+height*0.05}" r="${width*0.08}" 
                fill="white" opacity="0.2" />
      `;
    
    case 'social':
      // Social gathering space
      return `
        <rect x="${width*0.05}" y="${height*0.25}" width="${width*0.9}" height="${height*0.5}" 
              rx="10" fill="white" opacity="0.1" />
        <circle cx="${centerX}" cy="${centerY}" r="${width*0.2}" 
                fill="white" opacity="0.15" />
      `;
    
    case 'grouped':
    default:
      // Default office environment
      return `
        <rect x="${width*0.1}" y="${height*0.2}" width="${width*0.8}" height="${height*0.6}" 
              rx="5" fill="white" opacity="0.1" />
        <rect x="${width*0.2}" y="${height*0.5}" width="${width*0.6}" height="${height*0.1}" 
              fill="white" opacity="0.15" />
      `;
  }
}

// Generate varied team members
function generateTeamMembers(width, height, count, arrangement) {
  // Position variables
  const centerX = width / 2;
  const centerY = height / 2;
  let teamSvg = '';
  
  // Determine positioning based on arrangement
  let positions = [];
  
  switch(arrangement) {
    case 'group':
      // Clustered group formation
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.25;
        positions.push({
          x: centerX + Math.cos(angle) * radius * (0.7 + Math.random() * 0.3),
          y: centerY + Math.sin(angle) * radius * 0.5,
          size: 0.8 + Math.random() * 0.4
        });
      }
      break;
      
    case 'meeting':
      // Around a conference table
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.2;
        positions.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius * 0.5,
          size: 0.7 + Math.random() * 0.3
        });
      }
      break;
      
    case 'boardroom':
      // Executive boardroom seating
      const tableWidth = width * 0.5;
      const tableHeight = height * 0.25;
      for (let i = 0; i < count; i++) {
        if (i < count / 2) {
          // One side of the table
          positions.push({
            x: centerX - tableWidth * 0.4 + (i * tableWidth) / (count/2 - 1),
            y: centerY - tableHeight * 0.7,
            size: 0.7 + Math.random() * 0.3
          });
        } else {
          // Other side of the table
          const j = i - Math.floor(count/2);
          positions.push({
            x: centerX - tableWidth * 0.4 + (j * tableWidth) / (count/2 - 1),
            y: centerY + tableHeight * 0.7,
            size: 0.7 + Math.random() * 0.3
          });
        }
      }
      break;
      
    case 'desks':
      // At workstations
      for (let i = 0; i < count; i++) {
        positions.push({
          x: width * 0.2 + (i * width * 0.6) / Math.max(1, count - 1),
          y: height * 0.35,
          size: 0.7 + Math.random() * 0.3
        });
      }
      break;
      
    case 'casual':
      // Casual seating arrangement
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI + Math.PI/4;
        const radius = Math.min(width, height) * 0.18;
        positions.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          size: 0.7 + Math.random() * 0.3
        });
      }
      break;
      
    case 'social':
      // Social gathering
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.2 * (0.7 + Math.random() * 0.5);
        positions.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          size: 0.65 + Math.random() * 0.35
        });
      }
      break;
      
    case 'grouped':
    default:
      // Small clusters
      for (let i = 0; i < count; i++) {
        if (i < count / 2) {
          positions.push({
            x: width * (0.3 + (i * 0.1)),
            y: height * 0.35,
            size: 0.7 + Math.random() * 0.3
          });
        } else {
          positions.push({
            x: width * (0.35 + ((i - Math.floor(count/2)) * 0.1)),
            y: height * 0.55,
            size: 0.7 + Math.random() * 0.3
          });
        }
      }
      break;
  }
  
  // Create diverse team members
  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    const personSize = Math.min(width, height) * 0.13 * pos.size;
    
    // Generate person with random variations
    teamSvg += `
      <g transform="translate(${pos.x - personSize/2}, ${pos.y - personSize/2})">
        <!-- Person ${i+1} -->
        <circle cx="${personSize/2}" cy="${personSize/2 - personSize*0.2}" r="${personSize*0.3}" 
                fill="white" opacity="${0.7 + Math.random() * 0.3}" />
        
        <!-- Body variation based on index -->
        ${i % 3 === 0 ? 
          // Standing person
          `<rect x="${personSize*0.3}" y="${personSize*0.3}" width="${personSize*0.4}" height="${personSize*0.7}" 
                rx="${personSize*0.1}" fill="white" opacity="${0.6 + Math.random() * 0.4}" />` 
          : i % 3 === 1 ? 
          // Different posture
          `<path d="M${personSize*0.3},${personSize*0.3} 
                   Q${personSize*0.5},${personSize*0.4} ${personSize*0.7},${personSize*0.3} 
                   L${personSize*0.7},${personSize*0.9} 
                   Q${personSize*0.5},${personSize} ${personSize*0.3},${personSize*0.9} Z" 
                fill="white" opacity="${0.6 + Math.random() * 0.4}" />` 
          : 
          // Seated position
          `<path d="M${personSize*0.3},${personSize*0.3} 
                   L${personSize*0.7},${personSize*0.3} 
                   L${personSize*0.8},${personSize*0.9} 
                   L${personSize*0.2},${personSize*0.9} Z" 
                fill="white" opacity="${0.6 + Math.random() * 0.4}" />`
        }
        
        <!-- Add gesture or action based on the scene -->
        ${arrangement === 'meeting' || arrangement === 'boardroom' ?
          `<line x1="${personSize*0.7}" y1="${personSize*0.4}" x2="${personSize*0.9}" y2="${personSize*0.3}" 
                stroke="white" stroke-width="${personSize*0.05}" opacity="0.7" />` : 
          arrangement === 'social' ?
          `<circle cx="${personSize*0.8}" cy="${personSize*0.5}" r="${personSize*0.1}" 
                  fill="white" opacity="0.6" />` :
          ''}
      </g>
    `;
  }
  
  return teamSvg;
}

// Generate the photos
generateTeamPhotos().catch(err => console.error('Error generating team photos:', err));