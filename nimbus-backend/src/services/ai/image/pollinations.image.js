import { AiProviderError, withRetry } from '../errors.js';

const NAME = 'pollinations';

export const pollinationsImage = {
    name: NAME,
    async generateImage({ prompt, width, height, modelName }) {
        const model = modelName || process.env.POLLINATIONS_MODEL || 'flux';
        const params = new URLSearchParams({
            width: String(width || 1024),
            height: String(height || 1280),
            model,
            nologo: 'true',
            seed: String(Math.floor(Math.random() * 1e9)),
        });
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.slice(0, 1500))}?${params}`;
        const headers = process.env.POLLINATIONS_API_KEY ? { Authorization: `Bearer ${process.env.POLLINATIONS_API_KEY}` } : {};

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
