import { AiProviderError, withRetry } from '../ai/errors.js';

export const EMBEDDING_DIM = 768;
const MODEL = () => process.env.EMBEDDING_MODEL || 'gemini-embedding-001';
const BATCH = 50;

const l2 = (v) => {
    const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
    return v.map((x) => x / n);
};

/**
 * Embed texts with Gemini (768 dims). taskType: 'RETRIEVAL_DOCUMENT' when indexing,
 * 'RETRIEVAL_QUERY' when searching.
 */
export const embedTexts = async (texts, taskType = 'RETRIEVAL_DOCUMENT') => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new AiProviderError('GEMINI_API_KEY is not set (needed for embeddings)', { provider: 'gemini', status: 500 });
    const out = [];
    for (let i = 0; i < texts.length; i += BATCH) {
        const slice = texts.slice(i, i + BATCH);
        const data = await withRetry('gemini-embedding', async (signal) => {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL()}:batchEmbedContents`, {
                method: 'POST',
                signal,
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
                body: JSON.stringify({
                    requests: slice.map((t) => ({
                        model: `models/${MODEL()}`,
                        content: { parts: [{ text: t }] },
                        taskType,
                        outputDimensionality: EMBEDDING_DIM,
                    })),
                }),
            });
            if (!res.ok) {
                const body = await res.text();
                throw new AiProviderError(`Embedding error ${res.status}: ${body.slice(0, 160)}`, {
                    provider: 'gemini-embedding', status: res.status, retryable: res.status === 429 || res.status >= 500,
                });
            }
            return res.json();
        }, { timeoutMs: 60000 });
        data.embeddings.forEach((e) => out.push(l2(e.values)));
    }
    return out;
};

export const embedQuery = async (text) => (await embedTexts([text], 'RETRIEVAL_QUERY'))[0];
