import { AiProviderError, withRetry } from '../errors.js';

const NAME = 'gemini-image';

// Native Gemini image generation (generateContent with an IMAGE response modality).
export const geminiImage = {
    name: NAME,
    async generateImage({ prompt, negativePrompt, width, height, modelName }) {
        const key = process.env.GEMINI_API_KEY;
        if (!key) throw new AiProviderError('GEMINI_API_KEY is not set', { provider: NAME, status: 500 });
        const model = modelName || process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const aspect = width && height && width / height < 0.9 ? 'portrait (4:5)' : 'square';
        const text = `${prompt}\nOrientation: ${aspect}.${negativePrompt ? `\nAvoid: ${negativePrompt}` : ''}`;

        const data = await withRetry(NAME, async (signal) => {
            const res = await fetch(url, {
                method: 'POST',
                signal,
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
                body: JSON.stringify({
                    contents: [{ parts: [{ text }] }],
                    generationConfig: { responseModalities: ['IMAGE'] },
                }),
            });
            if (!res.ok) {
                const body = await res.text();
                throw new AiProviderError(`Gemini image error ${res.status}: ${body.slice(0, 200)}`, {
                    provider: NAME, status: res.status, retryable: res.status === 429 || res.status >= 500,
                });
            }
            return res.json();
        }, { timeoutMs: 120000 });

        const part = data?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
        if (!part) throw new AiProviderError('Gemini returned no image', { provider: NAME, status: 502 });
        return {
            buffer: Buffer.from(part.inlineData.data, 'base64'),
            mimeType: part.inlineData.mimeType || 'image/png',
            provider: NAME,
            model,
        };
    },
};
