import { ImageFactory } from './ai/image/image.factory.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryHelper.js';
import { planArtDirection, BACKGROUND_RULES } from './artDirector.service.js';

export const buildBackgroundPrompt = (eventName = "", category = "", theme = "", colorPreference = "") => {
    const n = (eventName + " " + category + " " + theme).toLowerCase();

    let stylePrompt = "";

    if (n.includes("hack") || n.includes("code") || n.includes("tech")
        || n.includes("program") || n.includes("competitive"))
        stylePrompt = `dark cyberpunk cityscape, deep teal and electric blue 
    gradient, glowing circuit board patterns, binary code atmosphere, 
    neon light trails, futuristic tech aesthetic, dramatic lighting, 
    ultra detailed 4k`;

    else if (n.includes("recruit") || n.includes("career") || n.includes("job")
        || n.includes("hiring") || n.includes("placement"))
        stylePrompt = `modern university student recruitment campaign background,
    welcoming campus atmosphere, clean editorial composition, navy blue with
    fresh mint and white accents, subtle abstract network lines and soft
    translucent shapes, youthful academic society mood, polished Canva-style
    visual design, gentle depth and soft light, premium but approachable,
    balanced negative space with a clear text-safe area on the upper-left and
    a separate quiet panel area near the lower third, no dominant centerpiece,
    no harsh metallic geometry, no busy focal object, high quality 4k`;

    else if (n.includes("cultural") || n.includes("fest") || n.includes("music")
        || n.includes("dance") || n.includes("art") || n.includes("drama"))
        stylePrompt = `vibrant festival atmosphere, rich jewel tone gradients,
    purple magenta and gold bokeh, celebratory confetti blur, 
    dynamic colorful energy, stage lights, euphoric atmosphere, 4k`;

    else if (n.includes("sport") || n.includes("game") || n.includes("tournament")
        || n.includes("championship") || n.includes("match"))
        stylePrompt = `dramatic stadium under floodlights, bold red and orange 
    gradient, dynamic motion blur streaks, epic competitive atmosphere, 
    volumetric god rays, high energy, 4k`;

    else if (n.includes("workshop") || n.includes("seminar") || n.includes("talk")
        || n.includes("lecture") || n.includes("session") || n.includes("pitch"))
        stylePrompt = `elegant minimal abstract background, soft indigo and 
    violet gradient, geometric flowing shapes, clean professional, 
    subtle light beam rays, knowledge and growth theme, 4k`;

    else if (n.includes("social") || n.includes("networking") || n.includes("meetup")
        || n.includes("community") || n.includes("connect"))
        stylePrompt = `warm modern interior atmosphere, golden hour light, 
    soft amber and cream gradients, subtle bokeh, welcoming professional 
    networking vibe, premium lounge feel, 4k`;

    else
        stylePrompt = `beautiful abstract gradient background, deep midnight 
    blue and royal purple, smooth flowing light shapes, modern premium, 
    subtle geometric patterns, sophisticated, 4k`;

    const colorHint = colorPreference ? `, consistent ${colorPreference} color palette` : '';
    return `${stylePrompt}${colorHint}, 
    poster background template only, 
    empty clean composition with space for text overlay,
    NO text, NO letters, NO words, NO typography, NO watermarks,
    NO people, NO faces, NO hands, NO logos,
    vertical portrait orientation, 4:5 aspect ratio`;
};

export const NEGATIVE_PROMPT = `text, letters, words, typography, watermark, 
signature, title, heading, caption, numbers, fonts, alphabet, writing, 
labels, stamps, banners, people, faces, hands, bodies, portraits,
ugly, blurry, low quality, distorted, noisy, grainy, overexposed,
underexposed, bad composition, cluttered, messy`;

/**
 * Generate a poster background with the active (or allowlisted override) image provider,
 * upload it to Cloudinary and return the hosted URL.
 */
export const generatePosterBackground = async ({
    userId, eventName, category, theme, formData, templateType, imageProvider, textProvider, instruction, useBrandStyle = true,
}) => {
    const finalEventName = eventName || formData?.eventName || '';
    const finalCategory = category || formData?.eventType || formData?.category || templateType || '';
    const finalTheme = theme || formData?.theme || '';

    // 1) art director (knowledge base + style notes) -> falls back to the keyword prompt on any failure
    let art = null;
    let prompt = null;
    if (useBrandStyle !== false) {
        try {
            art = await Promise.race([
                planArtDirection({ userId, templateType, formData, instruction, textProvider }),
                new Promise((_, rej) => setTimeout(() => rej(new Error('art director timed out')), 20000)),
            ]);
            prompt = `${art.imagePrompt}, ${BACKGROUND_RULES}`;
        } catch (err) {
            console.warn(`Art director unavailable (${err.message}); using keyword prompt`);
            art = null;
        }
    }
    if (!prompt) {
        const base = buildBackgroundPrompt(finalEventName, finalCategory, finalTheme, formData?.colorPreference);
        prompt = instruction ? `${instruction}, ${base}` : base;
    }

    const image = await ImageFactory.generateImage({
        customProvider: imageProvider,
        prompt,
        negativePrompt: NEGATIVE_PROMPT,
        width: 832,
        height: 1040,
        steps: 35,
        guidance: 8.0,
    });
    const url = await uploadBufferToCloudinary(image.buffer, 'nimbus');
    return {
        url, mimeType: image.mimeType || 'image/jpeg', provider: image.provider, prompt,
        art: art ? { mood: art.mood, colors: art.colors, prompt: art.imagePrompt, sources: art.sources } : null,
    };
};
