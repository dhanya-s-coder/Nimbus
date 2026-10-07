import Anthropic from '@anthropic-ai/sdk';
import { AiProviderError, withRetry, parseJSONLoose } from '../errors.js';

const NAME = 'claude';
let client;

const getClient = () => {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new AiProviderError('ANTHROPIC_API_KEY is not set', { provider: NAME, status: 500 });
    }
    if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return client;
};

const defaultModel = () => process.env.CLAUDE_TEXT_MODEL || 'claude-sonnet-5-5';

const run = async ({ prompt, systemPrompt, modelName }) => {
    const res = await withRetry(NAME, (signal) =>
        getClient().messages.create(
            {
                model: modelName || defaultModel(),
                max_tokens: Number(process.env.CLAUDE_MAX_TOKENS) || 4096,
                ...(systemPrompt ? { system: systemPrompt } : {}),
                messages: [{ role: 'user', content: prompt }],
            },
            { signal }
        )
    );
    return res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
};

export const claudeText = {
    name: NAME,
    async generateText({ prompt, systemPrompt, modelName }) {
        return run({ prompt, systemPrompt, modelName });
    },
    // Claude has no JSON mode: instruct, parse loosely, one repair retry.
    async generateJSON({ prompt, systemPrompt, modelName }) {
        const system = `${systemPrompt ? systemPrompt + '\n\n' : ''}Respond with a single valid JSON value and nothing else (no prose, no code fences).`;
        const text = await run({ prompt, systemPrompt: system, modelName });
        try {
            return parseJSONLoose(text, NAME);
        } catch {
            const retry = await run({
                prompt: `${prompt}\n\nYour previous reply was not valid JSON. Reply again with ONLY the JSON.`,
                systemPrompt: system,
                modelName,
            });
            return parseJSONLoose(retry, NAME);
        }
    },
};
