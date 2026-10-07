import { huggingfaceImage } from './huggingface.image.js';
import { geminiImage } from './geminiimage.image.js';
import { imagenImage } from './imagen.image.js';
import { replicateImage } from './replicate.image.js';
import { pollinationsImage } from './pollinations.image.js';
import { mockImage } from './mock.image.js';
import { resolveProviderName } from '../errors.js';

const REGISTRY = {
    huggingface: huggingfaceImage,
    'gemini-image': geminiImage,
    imagen: imagenImage,
    replicate: replicateImage,
    pollinations: pollinationsImage,
    mock: mockImage,
};

/**
 * Returns an adapter exposing generateImage({prompt, negativePrompt, width, height, steps, guidance})
 * -> { buffer, mimeType, provider, model }. Always a raw Buffer.
 * `customProvider` (e.g. req.body.imageProvider) must be allowlisted via ALLOWED_IMAGE_PROVIDERS.
 */
export const getImageProvider = (customProvider) => {
    const name = resolveProviderName({
        requested: customProvider,
        active: (process.env.ACTIVE_IMAGE_PROVIDER || 'huggingface').toLowerCase(),
        allowedEnv: process.env.ALLOWED_IMAGE_PROVIDERS,
        registry: REGISTRY,
        kind: 'image',
    });
    return REGISTRY[name];
};

/**
 * Generate with the chosen provider. When no explicit provider was requested, failures
 * (depleted credits, 429/5xx, missing key) fail over to IMAGE_FALLBACK_PROVIDERS in order.
 */
const generateImage = async ({ customProvider, ...args }) => {
    const primary = getImageProvider(customProvider);
    try {
        return await primary.generateImage(args);
    } catch (err) {
        if (customProvider || err.status === 400) throw err;
        const fallbacks = (process.env.IMAGE_FALLBACK_PROVIDERS || '').split(',').map((s) => s.trim().toLowerCase())
            .filter((n) => n && n !== primary.name && REGISTRY[n]);
        let last = err;
        for (const name of fallbacks) {
            try {
                console.warn(`⚠️ image provider "${primary.name}" failed (${err.message.slice(0, 80)}); trying "${name}"`);
                return await REGISTRY[name].generateImage(args);
            } catch (e) {
                last = e;
            }
        }
        throw last;
    }
};

export const ImageFactory = { getProvider: getImageProvider, generateImage };
