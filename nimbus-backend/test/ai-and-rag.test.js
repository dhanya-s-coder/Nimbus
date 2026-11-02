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

// ---- layout-aware background prompts ----------------------------------------------------------
import { compositionFor, isKnownLayout, LAYOUT_COMPOSITION } from '../src/services/layoutComposition.js';
import { buildBackgroundPrompt } from '../src/services/poster.service.js';
import { STRICT_RULES } from '../src/services/artDirector.service.js';

test('layout composition: known ids resolve, unknown ids are ignored', () => {
    assert.ok(isKnownLayout('magazine-cover'));
    assert.match(compositionFor('arch-window'), /arch/);
    assert.equal(compositionFor('nope'), '');
    assert.equal(compositionFor(undefined), '');
    assert.equal(isKnownLayout('__proto__'), false);
    for (const [id, text] of Object.entries(LAYOUT_COMPOSITION)) assert.ok(text.length > 30, id);
});

test('keyword background prompt uses the layout composition and keeps the hard rules', () => {
    const withLayout = buildBackgroundPrompt('TechFest', 'event', '', '', 'big-type');
    assert.match(withLayout, /composition for the poster layout: a dark, smooth/);
    assert.doesNotMatch(withLayout, /space for text overlay/);
    assert.match(withLayout, /NO text/);
    // unchanged when no layout is given
    assert.match(buildBackgroundPrompt('TechFest', 'event', ''), /empty clean composition with space for text overlay/);
    assert.match(STRICT_RULES, /NO text/);
});

test('every frontend layout id has a background composition (keeps the two in sync)', async () => {
    const { readFileSync, existsSync } = await import('node:fs');
    const file = new URL('../../nimbus-frontend/src/components/tools/poster-konva/layouts/index.js', import.meta.url);
    if (!existsSync(file)) return; // frontend not checked out next to the backend
    const src = readFileSync(file, 'utf8');
    const block = src.slice(src.indexOf('export const LAYOUTS = {'), src.indexOf('};', src.indexOf('export const LAYOUTS = {')));
    const ids = [...block.matchAll(/^\s*(?:'([a-z-]+)'|([a-z]+)):\s*[A-Za-z]+,/gm)].map((m) => m[1] || m[2]);
    assert.ok(ids.length >= 15, `parsed ${ids.length} layout ids`);
    for (const id of ids) assert.ok(isKnownLayout(id), `no composition for layout "${id}"`);
});

// ---- reference posters are opt-in ------------------------------------------------------------------------------
import { isStyleRefId, ART_DIRECTOR_TYPES, getStyleReference } from '../src/services/rag/styleReference.service.js';

test('reference posters are never retrieved by similarity: only an explicitly picked one is used', async () => {
    assert.ok(!ART_DIRECTOR_TYPES.includes('poster_style'));
    assert.ok(ART_DIRECTOR_TYPES.includes('brand_kit'));          // brand knowledge keeps working
    assert.equal(isStyleRefId('65f1c2a9b8d4e7a0c3b21f09'), true);
    for (const bad of ['', 'abc', '3f2b8c1e-9d4a-4c61-8a0e-5b7d2f9a1c34', undefined, null, 42, "x' or 1=1 --", { $ne: null }]) assert.equal(isStyleRefId(bad), false);
    assert.equal(await getStyleReference({ ownerId: 'u1', id: 'not-a-uuid' }), null);
});

// ---- knowledge base now lives in MongoDB: ranking is pure and tested without a database ------------------------------
import { rankChunks } from '../src/services/rag/retrieval.service.js';

const unit = (v) => { const n = Math.hypot(...v); return v.map((x) => x / n); };

test('rankChunks: vector + keyword fusion, relevance gate, no embeddings leaked', () => {
    const q = unit([1, 0, 0]);
    const chunks = [
        { id: 'a', source_id: 's1', type: 'brand_kit', metadata: {}, content: 'Our brand colours are navy and gold', embedding: unit([0.95, 0.1, 0]) },
        { id: 'b', source_id: 's2', type: 'note', metadata: {}, content: 'Cafeteria timings and menu', embedding: unit([0, 1, 0]) },
        { id: 'c', source_id: 's3', type: 'past_event', metadata: {}, content: 'Brand guidelines mention gold accents', embedding: unit([0.6, 0.8, 0]) },
    ];
    const out = rankChunks({ queryEmbedding: q, queryText: 'brand colours gold', chunks, k: 3, minSim: 0.5 });
    assert.deepEqual(out.map((c) => c.id), ['a', 'c']);        // the unrelated chunk is gated out, best match first
    assert.ok(out[0].similarity > out[1].similarity);
    assert.ok(!('embedding' in out[0]));
    assert.equal(rankChunks({ queryEmbedding: q, queryText: '', chunks: [], k: 3 }).length, 0);
    // k limits the result; without a gate weak matches may appear but stay ordered
    assert.equal(rankChunks({ queryEmbedding: q, queryText: 'brand', chunks, k: 1, minSim: 0 }).length, 1);
});

test('knowledge schemas dedupe per owner and expose the API shape', async () => {
    const { KnowledgeSource, KnowledgeChunk, GenerationRun } = await import('../src/models/Knowledge.js');
    const idx = KnowledgeSource.schema.indexes().map(([f, o]) => ({ f, unique: !!o.unique }));
    assert.ok(idx.some((i) => i.unique && i.f.contentHash === 1 && i.f.ownerId === 1 && i.f.scope === 1));
    assert.ok(KnowledgeChunk.schema.path('embedding'));
    assert.ok(GenerationRun.schema.indexes().some(([, o]) => o.expireAfterSeconds));
});
