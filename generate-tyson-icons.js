const fs = require('fs');
const path = require('path');

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

// Icon sizes needed for PWA
const iconSizes = [16, 32, 48, 72, 96, 144, 192, 256, 384, 512];

// Generate SVG icon template with Tyson Properties design
function generateTysonSVGIcon(size) {
    const iconScale = size * 0.6;
    const textSize = size * 0.08;
    const iconHeight = iconScale * 0.6;
    const iconWidth = iconScale * 0.8;
    
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a5f5f;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2d7d7d;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#b8b8b8;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#d4d4d4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a0a0a0;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#bgGrad)"/>
  
  <!-- Architectural towers icon -->
  <g transform="translate(${(size - iconWidth) / 2}, ${size * 0.25})">
    <polygon points="0,${iconHeight} ${iconWidth * 0.2},${iconHeight} ${iconWidth * 0.35},${iconHeight * 0.2} ${iconWidth * 0.5},0 ${iconWidth * 0.65},${iconHeight * 0.2} ${iconWidth * 0.8},${iconHeight} ${iconWidth},${iconHeight}" 
             fill="url(#iconGrad)" 
             stroke="none"/>
  </g>
  
  <!-- TYSON text -->
  <text x="${size * 0.5}" y="${size * 0.75}" 
        font-family="Arial Black, Arial, sans-serif" 
        font-size="${textSize}" 
        font-weight="900" 
        text-anchor="middle" 
        fill="white"
        letter-spacing="${size * 0.005}">TYSON</text>
        
  <!-- PROPERTIES text -->
  <text x="${size * 0.5}" y="${size * 0.85}" 
        font-family="Arial Black, Arial, sans-serif" 
        font-size="${textSize * 0.7}" 
        font-weight="900" 
        text-anchor="middle" 
        fill="white"
        letter-spacing="${size * 0.002}">PROPERTIES</text>
</svg>`;
}

// Generate all icon sizes
iconSizes.forEach(size => {
    const svgContent = generateTysonSVGIcon(size);
    const filename = path.join(imagesDir, `icon-${size}.svg`);
    fs.writeFileSync(filename, svgContent);
    console.log(`Generated Tyson Properties icon-${size}.svg`);
});

// Generate shortcut icons with Tyson Properties colors
const shortcutIcons = [
    { name: 'shortcut-add-client', icon: '👤', color: '#1a5f5f' },
    { name: 'shortcut-add-property', icon: '🏠', color: '#2d7d7d' }
];

shortcutIcons.forEach(({ name, icon, color }) => {
    const svgContent = `<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0d4444;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="96" height="96" rx="14" fill="url(#grad)"/>
  <text x="48" y="60" font-family="Arial, sans-serif" font-size="40" text-anchor="middle" fill="white">${icon}</text>
</svg>`;
    
    const filename = path.join(imagesDir, `${name}.svg`);
    fs.writeFileSync(filename, svgContent);
    console.log(`Generated Tyson Properties ${name}.svg`);
});

// Generate Tyson Properties branded screenshots
const screenshotWide = `<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#1a5f5f;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2d7d7d;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="#f8f9fa"/>
  <rect x="0" y="0" width="1280" height="120" fill="url(#headerGrad)"/>
  <text x="100" y="70" font-family="Arial Black, Arial, sans-serif" font-size="28" font-weight="900" fill="white">TYSON PROPERTIES</text>
  <text x="640" y="360" font-family="Arial, sans-serif" font-size="48" text-anchor="middle" fill="#1a5f5f">
    Real Estate CRM Dashboard
  </text>
  <text x="640" y="420" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#6c757d">
    Premium Real Estate Solutions
  </text>
</svg>`;

const screenshotNarrow = `<svg width="640" height="1136" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#1a5f5f;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2d7d7d;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="640" height="1136" fill="#f8f9fa"/>
  <rect x="0" y="0" width="640" height="120" fill="url(#headerGrad)"/>
  <text x="50" y="50" font-family="Arial Black, Arial, sans-serif" font-size="16" font-weight="900" fill="white">TYSON</text>
  <text x="50" y="70" font-family="Arial Black, Arial, sans-serif" font-size="16" font-weight="900" fill="white">PROPERTIES</text>
  <text x="320" y="568" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#1a5f5f">
    Mobile CRM Interface
  </text>
  <text x="320" y="600" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#6c757d">
    Premium Real Estate Solutions
  </text>
</svg>`;

fs.writeFileSync(path.join(imagesDir, 'screenshot-wide.svg'), screenshotWide);
fs.writeFileSync(path.join(imagesDir, 'screenshot-narrow.svg'), screenshotNarrow);

console.log('Generated Tyson Properties branded screenshots');
console.log('\n✅ All Tyson Properties icons and assets generated!');
console.log('\n📝 Next steps:');
console.log('1. Convert SVG icons to PNG using ./convert-icons.sh');
console.log('2. Replace screenshot placeholders with actual app screenshots');
console.log('3. Deploy to Netlify with the new branding');
console.log('\nBranding updates:');
console.log('✓ Logo: Architectural towers design');
console.log('✓ Colors: Teal (#1a5f5f) and gray gradient');
console.log('✓ Typography: Arial Black for branding');
console.log('✓ Theme: Professional real estate aesthetic');