import test from 'node:test';
import assert from 'node:assert/strict';
import { parseJSONLoose, resolveProviderName, AiProviderError, withRetry } from '../src/services/ai/errors.js';
import { chunkText } from '../src/services/rag/chunker.js';

test('parseJSONLoose handles fences, chatter and invalid input', () => {
    assert.deepEqual(parseJSONLoose('```json\n{"a":1}\n```'), { a: 1 });
    assert.deepEqual(parseJSONLoose('Sure! Here you go: {"a":[1,2]} Hope that helps'), { a: [1, 2] });
    assert.throws(() => parseJSONLoose('no json here'), AiProviderError);
});

test('resolveProviderName enforces the allowlist', () => {
    const registry = { gemini: {}, claude: {}, mock: {} };
    const base = { active: 'gemini', registry, kind: 'text' };
    assert.equal(resolveProviderName({ ...base }), 'gemini');
    assert.equal(resolveProviderName({ ...base, requested: 'gemini' }), 'gemini');
    // default allowlist is only the active provider
    assert.throws(() => resolveProviderName({ ...base, requested: 'claude' }), /not allowed/);
    assert.equal(resolveProviderName({ ...base, requested: 'claude', allowedEnv: 'gemini, claude' }), 'claude');
    assert.throws(() => resolveProviderName({ ...base, requested: 'nope', allowedEnv: 'nope' }), /Unknown text provider/);
    try { resolveProviderName({ ...base, requested: 'claude' }); } catch (e) { assert.equal(e.status, 400); }
});

test('withRetry retries retryable errors then succeeds, and does not retry others', async () => {
    let n = 0;
    const out = await withRetry('t', async () => { n += 1; if (n < 2) throw Object.assign(new Error('boom'), { status: 503 }); return 'ok'; }, { retries: 1 });
    assert.equal(out, 'ok');
    assert.equal(n, 2);

    let m = 0;
    await assert.rejects(withRetry('t', async () => { m += 1; throw Object.assign(new Error('bad'), { status: 400 }); }, { retries: 3 }), AiProviderError);
    assert.equal(m, 1);
});

test('factories fail over only when no explicit provider was requested', async () => {
    process.env.ACTIVE_TEXT_PROVIDER = 'claude';          // no key -> fails
    delete process.env.ANTHROPIC_API_KEY;
    process.env.TEXT_FALLBACK_PROVIDERS = 'mock';
    const { TextFactory } = await import('../src/services/ai/text/text.factory.js');
    assert.match(await TextFactory.generateText({ prompt: 'hello' }), /MOCK TEXT/);
    process.env.ALLOWED_TEXT_PROVIDERS = 'claude,mock';
    await assert.rejects(TextFactory.generateText({ prompt: 'x', customProvider: 'claude' }), /ANTHROPIC_API_KEY/);
});

test('chunkText splits long text with bounded chunk size and keeps short text whole', () => {
    assert.deepEqual(chunkText('short note'), ['short note']);
    assert.deepEqual(chunkText('   '), []);
    const long = Array.from({ length: 80 }, (_, i) => `Sentence number ${i} about the annual recruitment drive.`).join(' ');
    const chunks = chunkText(long, { size: 300, overlap: 40 });
    assert.ok(chunks.length > 5);
    assert.ok(chunks.every((c) => c.length <= 450), 'no chunk is wildly over size');
    assert.ok(long.includes(chunks[0].slice(0, 30)));
});
