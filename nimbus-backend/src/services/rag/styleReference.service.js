import mongoose from 'mongoose';
import { KnowledgeSource, KnowledgeChunk, dbReady } from '../../models/Knowledge.js';

/**
 * Reference posters (type poster_style) are NOT picked up by similarity search: a poster is only
 * influenced by one when the user explicitly picks it for that poster (styleRefId). Everything else in the
 * knowledge base (brand kit, past events ...) keeps working as before.
 */

export const isStyleRefId = (v) => typeof v === 'string' && /^[0-9a-f]{24}$/i.test(v) && mongoose.isValidObjectId(v);

/** Knowledge types the art director may retrieve by similarity: reference posters are deliberately absent. */
export const ART_DIRECTOR_TYPES = ['brand_kit', 'past_event', 'template_copy', 'note'];

/** The style card of one reference poster the user may use (their own, or a shared one). null when not found / not allowed. */
export const getStyleReference = async ({ ownerId, id }) => {
    if (!isStyleRefId(id) || !dbReady()) return null;
    try {
        const src = await KnowledgeSource.findById(id).select('title type scope ownerId').lean();
        if (!src || src.type !== 'poster_style') return null;
        if (src.scope !== 'global' && src.ownerId !== String(ownerId)) return null; // never someone else's private reference
        const chunks = await KnowledgeChunk.find({ sourceId: id }).sort({ chunkIndex: 1 }).select('content').lean();
        if (!chunks.length) return null;
        return { id: String(src._id), title: src.title, text: chunks.map((c) => c.content).join('\n').slice(0, 2500) };
    } catch (err) {
        console.warn(`style reference unavailable (${err.message}); continuing without it`);
        return null;
    }
};
