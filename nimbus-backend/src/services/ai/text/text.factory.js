import { geminiText } from './gemini.text.js';
import { claudeText } from './claude.text.js';
import { mockText } from './mock.text.js';
import { resolveProviderName } from '../errors.js';

const REGISTRY = {
    gemini: geminiText,
    claude: claudeText,
    mock: mockText,
};

/**
 * Returns an adapter exposing generateText / generateJSON.
 * `customProvider` (e.g. from req.body.textProvider) must be allowlisted via ALLOWED_TEXT_PROVIDERS.
 */
export const getTextProvider = (customProvider) => {
    const name = resolveProviderName({
        requested: customProvider,
        active: (process.env.ACTIVE_TEXT_PROVIDER || 'gemini').toLowerCase(),
        allowedEnv: process.env.ALLOWED_TEXT_PROVIDERS,
        registry: REGISTRY,
        kind: 'text',
    });
    return REGISTRY[name];
};

/** Run `method` on the chosen provider; fail over to TEXT_FALLBACK_PROVIDERS when none was requested explicitly. */
const withFailover = async (method, { customProvider, ...args }) => {
    const primary = getTextProvider(customProvider);
    try {
        return await primary[method](args);
    } catch (err) {
        if (customProvider || err.status === 400) throw err;
        const fallbacks = (process.env.TEXT_FALLBACK_PROVIDERS || '').split(',').map((s) => s.trim().toLowerCase())
            .filter((n) => n && n !== primary.name && REGISTRY[n]);
        let last = err;
        for (const name of fallbacks) {
            try {
                console.warn(`⚠️ text provider "${primary.name}" failed (${err.message.slice(0, 80)}); trying "${name}"`);
                return await REGISTRY[name][method](args);
            } catch (e) {
                last = e;
            }
        }
        throw last;
    }
};

export const TextFactory = {
    getProvider: getTextProvider,
    generateText: (opts) => withFailover('generateText', opts),
    generateJSON: (opts) => withFailover('generateJSON', opts),
};
