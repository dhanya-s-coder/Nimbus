import { getSupabase } from '../../config/supabase.js';
import { embedQuery } from './embedding.service.js';

// Calibrated on Gemini 768-d embeddings: related text scores ~0.63-0.75, unrelated <= ~0.60.
const minSimilarity = () => Number(process.env.RAG_MIN_SIMILARITY) || 0.6;

const parseVector = (v) => (typeof v === 'string' ? JSON.parse(v) : v);
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0); // both L2-normalised

/**
 * Hybrid (vector + full-text) search over global knowledge + the user's own, then a relevance gate:
 * vector search always returns "nearest" chunks, so weak matches are dropped by cosine similarity.
 * Returns [{ id, source_id, content, type, metadata, score, similarity }].
 */
export const searchKnowledge = async ({ ownerId, query, k = 6, types = null, minSim = minSimilarity() }) => {
    const q = String(query || '').trim();
    if (!q) return [];
    const sb = getSupabase();
    const embedding = await embedQuery(q);
    const { data, error } = await sb.rpc('match_chunks', {
        query_embedding: JSON.stringify(embedding),
        query_text: q,
        match_count: Math.min(Math.max(k, 1), 20),
        p_owner: ownerId,
        p_types: types && types.length ? types : null,
    });
    if (error) throw error;
    if (!data?.length) return [];

    const { data: rows, error: eErr } = await sb.from('knowledge_chunks').select('id,embedding').in('id', data.map((d) => d.id));
    if (eErr) throw eErr;
    const sim = new Map(rows.map((r) => [r.id, dot(embedding, parseVector(r.embedding))]));
    return data
        .map((d) => ({ ...d, similarity: sim.get(d.id) ?? 0 }))
        .filter((d) => d.similarity >= minSim);
};
