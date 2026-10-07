export class AiProviderError extends Error {
    constructor(message, { provider = 'unknown', status = 500, retryable = false, cause } = {}) {
        super(message);
        this.name = 'AiProviderError';
        this.provider = provider;
        this.status = status;
        this.retryable = retryable;
        if (cause) this.cause = cause;
    }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isRetryable = (err) => {
    if (err instanceof AiProviderError) return err.retryable;
    const status = err?.status || err?.statusCode || err?.response?.status;
    return status === 429 || (status >= 500 && status < 600) || err?.name === 'AbortError';
};

/**
 * Run fn(signal) with a timeout and up to `retries` retries on 429/5xx/timeouts.
 * Errors are normalised to AiProviderError.
 */
export const withRetry = async (provider, fn, { retries = 1, timeoutMs = 60000 } = {}) => {
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            return await fn(controller.signal);
        } catch (err) {
            lastErr = err;
            if (attempt < retries && isRetryable(err)) {
                await sleep(800 * (attempt + 1));
                continue;
            }
            break;
        } finally {
            clearTimeout(timer);
        }
    }
    if (lastErr instanceof AiProviderError) throw lastErr;
    const status = lastErr?.status || lastErr?.statusCode || lastErr?.response?.status || 502;
    throw new AiProviderError(lastErr?.message || 'AI provider request failed', {
        provider,
        status,
        retryable: isRetryable(lastErr),
        cause: lastErr,
    });
};

/** Pull a JSON object out of an LLM reply (handles ```json fences and chatter). */
export const parseJSONLoose = (text, provider = 'unknown') => {
    const cleaned = String(text || '').replace(/```json|```/gi, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        const start = cleaned.search(/[{[]/);
        const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
        if (start !== -1 && end > start) {
            try {
                return JSON.parse(cleaned.slice(start, end + 1));
            } catch { /* fall through */ }
        }
        throw new AiProviderError('Model did not return valid JSON', { provider, status: 502, retryable: true });
    }
};

/**
 * Pick a provider name. Explicit overrides must be on the allowlist
 * (default allowlist = just the active provider) so clients cannot pick paid models.
 */
export const resolveProviderName = ({ requested, active, allowedEnv, registry, kind }) => {
    const allowed = (allowedEnv || active).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    const name = String(requested || active).trim().toLowerCase();
    if (!registry[name]) {
        throw new AiProviderError(`Unknown ${kind} provider "${name}"`, { provider: name, status: 400 });
    }
    if (requested && name !== active && !allowed.includes(name)) {
        throw new AiProviderError(`${kind} provider "${name}" is not allowed`, { provider: name, status: 400 });
    }
    return name;
};
