import React, { useCallback, useEffect, useState } from 'react';
import { fetchWithAuth, API_ENDPOINTS } from '../../api/config';
import { toast } from '../../utils/toast';
import { FiTrash2, FiDatabase } from 'react-icons/fi';
import './tools.css';

const TYPES = [
    { id: 'brand_kit', label: 'Brand kit (name, colours, tone)' },
    { id: 'past_event', label: 'Past event' },
    { id: 'contact', label: 'Contacts / organisers' },
    { id: 'policy', label: 'Policy / rules' },
    { id: 'template_copy', label: 'Reusable copy' },
    { id: 'note', label: 'General note' },
];

/** Add the facts Nimbus should use when it autofills posters (and, later, reports and emails). */
const KnowledgeBase = () => {
    const [form, setForm] = useState({ title: '', type: 'brand_kit', text: '' });
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await fetchWithAuth(API_ENDPOINTS.RAG.SOURCES);
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || data.message);
            setSources(data.data);
        } catch (err) {
            toast.error(err.message || 'Could not load knowledge');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const add = async () => {
        if (!form.title.trim() || !form.text.trim()) {
            toast.warning('Give it a title and some text.');
            return;
        }
        setSaving(true);
        try {
            const res = await fetchWithAuth(API_ENDPOINTS.RAG.INGEST, { method: 'POST', body: JSON.stringify(form) });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || data.message);
            toast.success(data.data.duplicate ? 'Already in your knowledge base' : `Added (${data.data.chunks} searchable passages)`);
            setForm({ title: '', type: form.type, text: '' });
            load();
        } catch (err) {
            toast.error(err.message || 'Could not add knowledge');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id) => {
        try {
            const res = await fetchWithAuth(`${API_ENDPOINTS.RAG.SOURCES}/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || data.message);
            setSources((prev) => prev.filter((s) => s.id !== id));
        } catch (err) {
            toast.error(err.message || 'Could not delete');
        }
    };

    return (
        <div className="tool-page">
            <div className="tool-container">
                <div className="tool-panel tool-panel-left">
                    <div className="panel-inner">
                        <header className="tool-header">
                            <h2 className="tool-title">Knowledge Base</h2>
                            <p className="tool-subtitle">Facts Nimbus can use to fill your posters accurately</p>
                        </header>
                        <section className="tool-form-section">
                            <div className="tool-form-group">
                                <label htmlFor="kb-title">Title</label>
                                <input id="kb-title" type="text" value={form.title} placeholder="e.g., CSES brand guide"
                                    onChange={(e) => setForm({ ...form, title: e.target.value })} />
                            </div>
                            <div className="tool-form-group">
                                <label htmlFor="kb-type">Type</label>
                                <select id="kb-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                    {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                                </select>
                            </div>
                            <div className="tool-form-group">
                                <label htmlFor="kb-text">Content</label>
                                <textarea id="kb-text" rows={10} value={form.text}
                                    placeholder="Paste text: club description, past event details, brand colours, contact emails, venue names..."
                                    onChange={(e) => setForm({ ...form, text: e.target.value })} />
                            </div>
                        </section>
                        <section className="tool-actions">
                            <button className="tool-btn-generate" onClick={add} disabled={saving}>
                                {saving ? 'Indexing...' : 'Add to Knowledge Base'}
                            </button>
                        </section>
                    </div>
                </div>

                <div className="tool-panel tool-panel-right">
                    <div className="panel-inner">
                        <header className="tool-header space-between">
                            <h2 className="tool-title">Your Knowledge</h2>
                            <span className="premium-badge">{sources.length} item{sources.length === 1 ? '' : 's'}</span>
                        </header>
                        {loading && <p>Loading...</p>}
                        {!loading && sources.length === 0 && (
                            <div className="tool-preview-empty"><p>Nothing here yet. Add your club's details on the left.</p></div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {sources.map((s) => (
                                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: 10 }}>
                                    <FiDatabase />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.65 }}>
                                            {TYPES.find((t) => t.id === s.type)?.label || s.type}{s.scope === 'global' ? ' · shared' : ''}
                                        </div>
                                    </div>
                                    {s.scope !== 'global' && (
                                        <button className="tool-btn-secondary" onClick={() => remove(s.id)} aria-label="Delete"><FiTrash2 /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KnowledgeBase;
