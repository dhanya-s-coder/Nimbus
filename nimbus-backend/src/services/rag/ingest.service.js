import crypto from 'crypto';
import { getSupabase } from '../../config/supabase.js';
import { chunkText } from './chunker.js';
import { embedTexts } from './embedding.service.js';

export const SOURCE_TYPES = ['brand_kit', 'past_event', 'policy', 'contact', 'template_copy', 'note', 'upload', 'poster_style'];

/** Ingest text as a knowledge source (deduped by content hash per owner/scope). */
export const ingestText = async ({ ownerId = null, scope = 'user', type = 'note', title, text, metadata = {} }) => {
    const sb = getSupabase();
    const clean = String(text || '').trim();
    if (!clean) { const e = new Error('text is required'); e.status = 400; throw e; }
    if (!SOURCE_TYPES.includes(type)) { const e = new Error(`type must be one of ${SOURCE_TYPES.join(', ')}`); e.status = 400; throw e; }

    const hash = crypto.createHash('sha256').update(clean).digest('hex');
    const owner = scope === 'global' ? null : ownerId;

    let dupQ = sb.from('knowledge_sources').select('id,title').eq('content_hash', hash).eq('scope', scope);
    dupQ = owner === null ? dupQ.is('owner_id', null) : dupQ.eq('owner_id', owner);
    const { data: existing } = await dupQ.maybeSingle();
    if (existing) return { sourceId: existing.id, chunks: 0, duplicate: true };

    const { data: source, error } = await sb.from('knowledge_sources')
        .insert({ owner_id: owner, scope, type, title: title || clean.slice(0, 60), content_hash: hash, metadata })
        .select('id').single();
    if (error) throw error;

    try {
        const chunks = chunkText(clean);
        const vectors = await embedTexts(chunks, 'RETRIEVAL_DOCUMENT');
        const rows = chunks.map((content, i) => ({
            source_id: source.id, owner_id: owner, scope, type, chunk_index: i, content,
            embedding: JSON.stringify(vectors[i]), metadata: { ...metadata, title },
        }));
        const { error: cErr } = await sb.from('knowledge_chunks').insert(rows);
        if (cErr) throw cErr;
        return { sourceId: source.id, chunks: rows.length, duplicate: false };
    } catch (err) {
        await sb.from('knowledge_sources').delete().eq('id', source.id); // no half-indexed sources
        throw err;
    }
};

export const listSources = async ({ ownerId }) => {
    const { data, error } = await getSupabase().from('knowledge_sources')
        .select('id,title,type,scope,created_at,metadata')
        .or(`scope.eq.global,owner_id.eq.${ownerId}`).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

export const deleteSource = async ({ ownerId, id, isAdmin = false }) => {
    let q = getSupabase().from('knowledge_sources').delete().eq('id', id);
    q = isAdmin ? q : q.eq('owner_id', ownerId).eq('scope', 'user');
    const { data, error } = await q.select('id');
    if (error) throw error;
    return data.length > 0;
};
