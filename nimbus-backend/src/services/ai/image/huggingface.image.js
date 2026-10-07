import { HfInference } from '@huggingface/inference';
import { AiProviderError, withRetry } from '../errors.js';

const NAME = 'huggingface';
let client;

export const hfKey = () => process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;

const getClient = () => {
    const key = hfKey();
    if (!key) throw new AiProviderError('HF_API_KEY is not set', { provider: NAME, status: 500 });
    if (!client) client = new HfInference(key);
    return client;
};

export const huggingfaceImage = {
    name: NAME,
    async generateImage({ prompt, negativePrompt, width, height, steps, guidance, modelName }) {
        const model = modelName || process.env.HF_IMAGE_MODEL || 'stabilityai/stable-diffusion-xl-base-1.0';
        const parameters = {
            ...(negativePrompt ? { negative_prompt: negativePrompt } : {}),
            ...(steps ? { num_inference_steps: steps } : {}),
            ...(guidance ? { guidance_scale: guidance } : {}),
            ...(width ? { width } : {}),
            ...(height ? { height } : {}),
        };
        const blob = await withRetry(NAME, () =>
            getClient().textToImage({ model, inputs: prompt, parameters }), { timeoutMs: 120000 });
        const buffer = Buffer.from(await blob.arrayBuffer());
        return { buffer, mimeType: blob.type || 'image/jpeg', provider: NAME, model };
    },
};
