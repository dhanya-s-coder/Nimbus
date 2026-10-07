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

const run = async ({ prompt, systemPrompt, modelName, json }) => {
    const model = getClient().getGenerativeModel({
        model: modelName || defaultModel(),
        ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
        ...(json ? { generationConfig: { responseMimeType: 'application/json' } } : {}),
    });
    return withRetry(NAME, async () => (await model.generateContent(prompt)).response.text());
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
