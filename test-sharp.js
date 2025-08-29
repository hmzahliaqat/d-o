const sharp = require('sharp');

console.log('Sharp version:', sharp.versions);

// Create a simple test image
sharp({
  create: {
    width: 100,
    height: 100,
    channels: 4,
    background: { r: 255, g: 0, b: 0, alpha: 0.5 }
  }
})
.png()
.toBuffer()
.then(data => {
  console.log('Successfully created a test image buffer of size:', data.length);
  console.log('Sharp is working correctly!');
})
.catch(err => {
  console.error('Error using Sharp:', err);
});
