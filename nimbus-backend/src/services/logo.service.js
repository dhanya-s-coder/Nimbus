import { ImageFactory } from './ai/image/image.factory.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryHelper.js';

export const generateLogo = async ({ logoName, tagline, category, style, color, iconPreference, imageProvider }) => {
    const prompt = `Generate a clean, professional, and minimal logo for a ${category || 'brand'}.
    Brand name: ${logoName}
    ${tagline ? `Tagline: ${tagline}` : ''}
    Style: ${style || 'Modern'}
    Color preference: ${color || 'AI decides'}
    Icon preference: ${iconPreference || 'geometric shape'}
    The logo should be flat design, centered, and high resolution. 
    Ensure a clean, solid background (white or neutral). 
    Avoid messy text, avoid realistic photo details, avoid mockups.
    Masterpiece, vector style, 4k, crisp edges.`;

    const image = await ImageFactory.generateImage({
        customProvider: imageProvider,
        prompt,
        negativePrompt: "blurry, distorted text, low quality, messy, complex, photo, realistic, 3d, gradient background",
    });
    const url = await uploadBufferToCloudinary(image.buffer, 'nimbus');
    return { url, mimeType: image.mimeType || 'image/png', provider: image.provider };
};
