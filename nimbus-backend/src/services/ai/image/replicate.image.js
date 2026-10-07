import { AiProviderError, withRetry } from '../errors.js';

const NAME = 'replicate';

const ratioFor = (w, h) => {
    if (!w || !h) return '4:5';
    const r = w / h;
    if (r > 1.2) return '16:9';
    if (r > 0.9) return '1:1';
    if (r > 0.7) return '4:5';
    return '9:16';
};

export const replicateImage = {
    name: NAME,
    async generateImage({ prompt, width, height, modelName }) {
        const token = process.env.REPLICATE_API_TOKEN;
        if (!token) throw new AiProviderError('REPLICATE_API_TOKEN is not set', { provider: NAME, status: 500 });
        const model = modelName || process.env.REPLICATE_IMAGE_MODEL || 'black-forest-labs/flux-schnell';

        const out = await withRetry(NAME, async (signal) => {
            const res = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
                method: 'POST',
                signal,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Prefer: 'wait=60',
                },
                body: JSON.stringify({ input: { prompt, aspect_ratio: ratioFor(width, height), output_format: 'png' } }),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new AiProviderError(`Replicate error ${res.status}: ${text.slice(0, 200)}`, {
                    provider: NAME, status: res.status, retryable: res.status === 429 || res.status >= 500,
                });
            }
            return res.json();
        }, { timeoutMs: 90000 });

        if (out.status && out.status !== 'succeeded') {
            throw new AiProviderError(`Replicate prediction ${out.status}: ${out.error || ''}`, { provider: NAME, status: 502, retryable: out.status === 'processing' });
        }
        const url = Array.isArray(out.output) ? out.output[0] : out.output;
        if (!url) throw new AiProviderError('Replicate returned no image', { provider: NAME, status: 502 });
        const img = await fetch(url);
        if (!img.ok) throw new AiProviderError(`Replicate image download failed (${img.status})`, { provider: NAME, status: 502 });
        return {
            buffer: Buffer.from(await img.arrayBuffer()),
            mimeType: img.headers.get('content-type') || 'image/png',
            provider: NAME,
            model,
        };
    },
};
