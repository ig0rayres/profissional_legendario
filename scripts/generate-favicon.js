
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateFavicon() {
    const inputPath = path.join(process.cwd(), 'public', 'images', 'logo-rotabusiness.png');
    const outputPath = path.join(process.cwd(), 'app', 'favicon.ico');

    // Create output directory if it doesn't exist (though app/ should exist)
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    try {
        await sharp(inputPath)
            .resize(32, 32, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .toFile(outputPath);
        console.log('Favicon generated successfully at:', outputPath);
    } catch (error) {
        console.error('Error generating favicon:', error);
    }
}

generateFavicon();
