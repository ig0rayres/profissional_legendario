const sharp = require('sharp');
const path = require('path');

async function processLogo() {
    const inputPath = path.join(process.cwd(), 'public', 'images', 'logo-rotabusiness.png');
    const outputPath = path.join(process.cwd(), 'public', 'images', 'logo-rotabusiness-transparent.png');

    try {
        const image = sharp(inputPath);
        const { width, height } = await image.metadata();

        await image
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true })
            .then(({ data, info }) => {
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // If the pixel is white or very close to it (threshold 240)
                    if (r > 240 && g > 240 && b > 240) {
                        data[i + 3] = 0; // Set alpha to 0
                    }
                }
                return sharp(data, { raw: { width, height, channels: 4 } })
                    .png()
                    .toFile(outputPath);
            });

        console.log('Logo processed successfully at:', outputPath);
    } catch (error) {
        console.error('Error processing logo:', error);
    }
}

processLogo();
