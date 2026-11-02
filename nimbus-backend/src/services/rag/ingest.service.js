import crypto from 'crypto';
import mongoose from 'mongoose';
import { chunkText } from './chunker.js';
import { embedTexts } from './embedding.service.js';
import { KnowledgeSource, KnowledgeChunk, dbReady } from '../../models/Knowledge.js';

export const SOURCE_TYPES = ['brand_kit', 'past_event', 'policy', 'contact', 'template_copy', 'note', 'upload', 'poster_style'];

const needDb = () => { if (!dbReady()) { const e = new Error('Database is not connected'); e.status = 503; throw e; } };

/** Ingest text as a knowledge source (deduped by content hash per owner/scope). */
export const ingestText = async ({ ownerId = null, scope = 'user', type = 'note', title, text, metadata = {} }) => {
    needDb();
    const clean = String(text || '').trim();
    if (!clean) { const e = new Error('text is required'); e.status = 400; throw e; }
    if (!SOURCE_TYPES.includes(type)) { const e = new Error(`type must be one of ${SOURCE_TYPES.join(', ')}`); e.status = 400; throw e; }

    const contentHash = crypto.createHash('sha256').update(clean).digest('hex');
    const owner = scope === 'global' ? null : String(ownerId);

    const existing = await KnowledgeSource.findOne({ contentHash, scope, ownerId: owner }).select('_id').lean();
    if (existing) return { sourceId: String(existing._id), chunks: 0, duplicate: true };

    let source;
    try {
        source = await KnowledgeSource.create({ ownerId: owner, scope, type, title: title || clean.slice(0, 60), contentHash, metadata });
    } catch (err) {
        if (err.code === 11000) { // lost a race with an identical upload
            const again = await KnowledgeSource.findOne({ contentHash, scope, ownerId: owner }).select('_id').lean();
            return { sourceId: String(again?._id), chunks: 0, duplicate: true };
        }
        throw err;
    }

    try {
        const chunks = chunkText(clean);
        const vectors = await embedTexts(chunks, 'RETRIEVAL_DOCUMENT');
        const rows = chunks.map((content, i) => ({
            sourceId: source._id, ownerId: owner, scope, type, chunkIndex: i, content,
            embedding: vectors[i], metadata: { ...metadata, title },
        }));
        await KnowledgeChunk.insertMany(rows);
        return { sourceId: String(source._id), chunks: rows.length, duplicate: false };
    } catch (err) {
        await KnowledgeSource.deleteOne({ _id: source._id }); // no half-indexed sources
        await KnowledgeChunk.deleteMany({ sourceId: source._id });
        throw err;
    }
};

/** Same shape the frontend already uses: { id, title, type, scope, created_at, metadata }. */
export const listSources = async ({ ownerId }) => {
    needDb();
    const rows = await KnowledgeSource.find({ $or: [{ scope: 'global' }, { ownerId: String(ownerId), scope: 'user' }] })
        .sort({ createdAt: -1 }).select('title type scope createdAt metadata').lean();
    return rows.map((r) => ({ id: String(r._id), title: r.title, type: r.type, scope: r.scope, created_at: r.createdAt, metadata: r.metadata || {} }));
};

export const deleteSource = async ({ ownerId, id, isAdmin = false }) => {
    needDb();
    if (!mongoose.isValidObjectId(id)) return false;
    const filter = isAdmin ? { _id: id } : { _id: id, ownerId: String(ownerId), scope: 'user' };
    const res = await KnowledgeSource.deleteOne(filter);
    if (res.deletedCount > 0) await KnowledgeChunk.deleteMany({ sourceId: id });
    return res.deletedCount > 0;
};
