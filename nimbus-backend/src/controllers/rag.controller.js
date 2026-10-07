import { ingestText, listSources, deleteSource, SOURCE_TYPES } from '../services/rag/ingest.service.js';
import { searchKnowledge } from '../services/rag/retrieval.service.js';
import { generatePosterContent } from '../services/posterContent.service.js';

const isAdmin = (req) =>
    (process.env.RAG_ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
        .includes(String(req.user?.email || '').toLowerCase());

const fail = (res, error, label) => {
    console.error(`❌ ${label}:`, error.message);
    const status = error.status && error.status < 600 ? error.status : 500;
    res.status(status).json({ success: false, message: label, error: error.message });
};

export const ingestController = async (req, res) => {
    try {
        const { title, text, type = 'note', scope = 'user', metadata } = req.body;
        if (scope === 'global' && !isAdmin(req)) return res.status(403).json({ success: false, message: 'Only admins can add global knowledge' });
        if (String(text || '').length > 200000) return res.status(413).json({ success: false, message: 'Text too large (max 200k characters)' });
        const result = await ingestText({ ownerId: req.user.userId, scope, type, title, text, metadata: metadata && typeof metadata === 'object' ? metadata : {} });
        res.status(result.duplicate ? 200 : 201).json({ success: true, data: result });
    } catch (e) { fail(res, e, 'Failed to ingest knowledge'); }
};

export const searchController = async (req, res) => {
    try {
        const { query, k, types } = req.body;
        const data = await searchKnowledge({ ownerId: req.user.userId, query, k: Number(k) || 6, types: Array.isArray(types) ? types.filter((t) => SOURCE_TYPES.includes(t)) : null });
        res.json({ success: true, data });
    } catch (e) { fail(res, e, 'Search failed'); }
};

export const listController = async (req, res) => {
    try { res.json({ success: true, data: await listSources({ ownerId: req.user.userId }) }); }
    catch (e) { fail(res, e, 'Failed to list knowledge'); }
};

export const deleteController = async (req, res) => {
    try {
        const ok = await deleteSource({ ownerId: req.user.userId, id: req.params.id, isAdmin: isAdmin(req) });
        if (!ok) return res.status(404).json({ success: false, message: 'Source not found' });
        res.json({ success: true });
    } catch (e) { fail(res, e, 'Failed to delete knowledge'); }
};

export const posterContentController = async (req, res) => {
    try {
        const { templateType, formData, instruction, textProvider } = req.body;
        const data = await generatePosterContent({ userId: req.user.userId, templateType, formData, instruction, textProvider });
        res.json({ success: true, data });
    } catch (e) { fail(res, e, 'Failed to generate poster content'); }
};
