import { AiProviderError, withRetry } from '../errors.js';

const NAME = 'imagen';

// Imagen only supports fixed ratios; pick the closest to the requested size.
const RATIOS = { '1:1': 1, '3:4': 3 / 4, '4:3': 4 / 3, '9:16': 9 / 16, '16:9': 16 / 9 };
const closestRatio = (w, h) => {
    if (!w || !h) return '3:4';
    const target = w / h;
    return Object.entries(RATIOS).sort((a, b) => Math.abs(a[1] - target) - Math.abs(b[1] - target))[0][0];
};

export const imagenImage = {
    name: NAME,
    async generateImage({ prompt, width, height, modelName }) {
        const key = process.env.GEMINI_API_KEY;
        if (!key) throw new AiProviderError('GEMINI_API_KEY is not set', { provider: NAME, status: 500 });
        const model = modelName || process.env.IMAGEN_MODEL || 'imagen-4.0-generate-001';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict`;

        const data = await withRetry(NAME, async (signal) => {
            const res = await fetch(url, {
                method: 'POST',
                signal,
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
                body: JSON.stringify({
                    instances: [{ prompt }],
                    parameters: { sampleCount: 1, aspectRatio: closestRatio(width, height) },
                }),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new AiProviderError(`Imagen error ${res.status}: ${text.slice(0, 200)}`, {
                    provider: NAME, status: res.status, retryable: res.status === 429 || res.status >= 500,
                });
            }
            return res.json();
        }, { timeoutMs: 120000 });

        const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
        if (!b64) throw new AiProviderError('Imagen returned no image', { provider: NAME, status: 502 });
        return {
            buffer: Buffer.from(b64, 'base64'),
            mimeType: data.predictions[0].mimeType || 'image/png',
            provider: NAME,
            model,
        };
    },
};
