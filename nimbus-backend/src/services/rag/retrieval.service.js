import { embedQuery } from './embedding.service.js';
import { SOURCE_TYPES } from './ingest.service.js';
import { KnowledgeChunk, dbReady } from '../../models/Knowledge.js';

// Poster style references only inform poster backgrounds (and only when picked); they must never leak into reports, emails or autofilled facts.
const DEFAULT_TYPES = SOURCE_TYPES.filter((t) => t !== 'poster_style');

// Calibrated on Gemini 768-d embeddings: related text scores ~0.63-0.75, unrelated <= ~0.60.
const minSimilarity = () => Number(process.env.RAG_MIN_SIMILARITY) || 0.6;

const dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i += 1) s += a[i] * b[i]; return s; }; // both L2-normalised
const tokens = (t) => String(t || '').toLowerCase().match(/[a-z0-9]{3,}/g) || [];

/**
 * Hybrid ranking (pure, unit-tested): reciprocal-rank fusion of vector similarity and keyword overlap,
 * then a relevance gate on cosine similarity: vector search always returns "nearest" chunks, so weak matches are dropped.
 * chunks: [{ id, source_id, content, type, metadata, embedding }]  ->  same rows without the embedding, plus { score, similarity }.
 */
export const rankChunks = ({ queryEmbedding, queryText, chunks, k = 6, minSim = 0 }) => {
    if (!chunks.length) return [];
    const q = new Set(tokens(queryText));
    const scored = chunks.map((c) => {
        const body = new Set(tokens(c.content));
        let hit = 0;
        q.forEach((w) => { if (body.has(w)) hit += 1; });
        return { c, similarity: c.embedding ? dot(queryEmbedding, c.embedding) : 0, lex: q.size ? hit / q.size : 0 };
    });
    const pool = Math.max(1, k) * 4;
    const rank = (key) => new Map([...scored].filter((s) => key(s) > 0).sort((a, b) => key(b) - key(a)).slice(0, pool).map((s, i) => [s, i + 1]));
    const vec = rank((s) => s.similarity);
    const lex = rank((s) => s.lex);
    return scored
        .filter((s) => vec.has(s) || lex.has(s))
        .map((s) => ({ s, score: (vec.has(s) ? 1 / (60 + vec.get(s)) : 0) + (lex.has(s) ? 1 / (60 + lex.get(s)) : 0) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, k)
        .filter(({ s }) => s.similarity >= minSim)
        .map(({ s, score }) => {
            const { embedding: _drop, ...rest } = s.c;
            return { ...rest, score, similarity: s.similarity };
        });
};

/**
 * Search global knowledge + the user's own. A department-sized knowledge base (hundreds to a few thousand chunks)
 * is ranked in memory, which needs no extra index or service; if it ever grows past that, swap the load + rank step
 * for Atlas Vector Search ($vectorSearch) in this one function.
 * Returns [{ id, source_id, content, type, metadata, score, similarity }].
 */
export const searchKnowledge = async ({ ownerId, query, k = 6, types = null, minSim = minSimilarity() }) => {
    const q = String(query || '').trim();
    if (!q) return [];
    if (!dbReady()) { const e = new Error('Database is not connected'); e.status = 503; throw e; }
    const embedding = await embedQuery(q);
    const visible = [{ scope: 'global' }, ...(ownerId ? [{ ownerId: String(ownerId), scope: 'user' }] : [])];
    const rows = await KnowledgeChunk.find({ $or: visible, type: { $in: types && types.length ? types : DEFAULT_TYPES } })
        .select('sourceId type content metadata embedding').lean();
    const chunks = rows.map((r) => ({ id: String(r._id), source_id: String(r.sourceId), content: r.content, type: r.type, metadata: r.metadata || {}, embedding: r.embedding }));
    return rankChunks({ queryEmbedding: embedding, queryText: q, chunks, k: Math.min(Math.max(k, 1), 20), minSim });
};
