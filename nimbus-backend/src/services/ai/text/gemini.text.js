import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiProviderError, withRetry, parseJSONLoose } from '../errors.js';

const NAME = 'gemini';
let client;

const getClient = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new AiProviderError('GEMINI_API_KEY is not set', { provider: NAME, status: 500 });
    }
    if (!client) client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return client;
};

const defaultModel = () => process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';

// Each Gemini model has its own quota, so quota/overload errors fall through to the next model.
const fallbackModels = () =>
    (process.env.GEMINI_FALLBACK_MODELS ?? 'gemini-flash-lite-latest').split(',').map((m) => m.trim()).filter(Boolean);

const runOn = async (modelId, { prompt, systemPrompt, json }) => {
    const thinking = modelId.includes('2.5') ? { thinkingConfig: { thinkingBudget: Number(process.env.GEMINI_THINKING_BUDGET ?? 0) } } : {};
    const model = getClient().getGenerativeModel({
        model: modelId,
        ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
        // Gemini 2.5 "thinking" adds many seconds to short writing/extraction tasks; budget 0 disables it (env to re-enable)
        generationConfig: { ...(json ? { responseMimeType: 'application/json' } : {}), ...thinking },
    });
    return withRetry(NAME, async () => (await model.generateContent(prompt)).response.text(), { retries: 0 });
};

const run = async ({ prompt, systemPrompt, modelName, json }) => {
    const chain = modelName ? [modelName] : [defaultModel(), ...fallbackModels().filter((m) => m !== defaultModel())];
    let lastErr;
    for (const modelId of chain) {
        try {
            return await runOn(modelId, { prompt, systemPrompt, json });
        } catch (err) {
            lastErr = err;
            const retryable = err.status === 429 || err.status === 503 || err.status === 404 || err.retryable;
            if (!retryable) throw err;
            if (chain.length > 1) console.warn(`⚠️ gemini model "${modelId}" unavailable (${err.status}); trying next`);
        }
    }
    throw lastErr;
};

export const geminiText = {
    name: NAME,
    async generateText({ prompt, systemPrompt, modelName }) {
        return run({ prompt, systemPrompt, modelName, json: false });
    },
    async generateJSON({ prompt, systemPrompt, modelName }) {
        const text = await run({ prompt, systemPrompt, modelName, json: true });
        return parseJSONLoose(text, NAME);
    },
};
