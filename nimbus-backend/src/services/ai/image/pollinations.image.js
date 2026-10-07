import { AiProviderError, withRetry } from '../errors.js';

const NAME = 'pollinations';

/**
 * Pollinations image generation. With POLLINATIONS_API_KEY the authenticated gen.pollinations.ai
 * endpoint is used (clean images, no watermark); without a key it falls back to the free legacy endpoint.
 */
export const pollinationsImage = {
    name: NAME,
    async generateImage({ prompt, width, height, modelName }) {
        const key = process.env.POLLINATIONS_API_KEY;
        const model = modelName || process.env.POLLINATIONS_MODEL || 'flux';
        const params = new URLSearchParams({
            width: String(width || 1024),
            height: String(height || 1280),
            model,
            seed: String(Math.floor(Math.random() * 1e9)),
        });
        const text = encodeURIComponent(String(prompt).slice(0, 1500));
        const url = key
            ? `https://gen.pollinations.ai/image/${text}?${params}`
            : `https://image.pollinations.ai/prompt/${text}?${params}&nologo=true`;
        const headers = key ? { Authorization: `Bearer ${key}` } : {};

        const res = await withRetry(NAME, async (signal) => {
            const r = await fetch(url, { signal, headers });
            if (!r.ok) {
                throw new AiProviderError(`Pollinations error ${r.status}`, {
                    provider: NAME, status: r.status, retryable: r.status === 429 || r.status >= 500,
                });
            }
            return r;
        }, { timeoutMs: 120000 });

        return {
            buffer: Buffer.from(await res.arrayBuffer()),
            mimeType: res.headers.get('content-type') || 'image/jpeg',
            provider: NAME,
            model,
        };
    },
};
