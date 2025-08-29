const sharp = require('sharp');

// Simple SVG for testing
const svgContent = `
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="blue" />
  <text x="10" y="50" font-family="Arial" font-size="20" fill="white">Test</text>
</svg>
`;

console.log('Sharp version:', sharp.versions);

// Convert SVG to PNG using sharp - mimicking the functionality in share.$slug.opengraph.tsx
sharp(Buffer.from(svgContent))
  .toFormat('png')
  .toBuffer()
  .then(pngBuffer => {
    console.log('Successfully converted SVG to PNG buffer of size:', pngBuffer.length);
    console.log('Sharp SVG to PNG conversion is working correctly!');
  })
  .catch(err => {
    console.error('Error converting SVG to PNG with Sharp:', err);
  });
