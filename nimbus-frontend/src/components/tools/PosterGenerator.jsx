import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchWithAuth, API_ENDPOINTS } from '../../api/config';
import { toast } from '../../utils/toast';
import { FiCheckCircle, FiFileText, FiDownload, FiChevronDown } from 'react-icons/fi';
import { useHistory } from '../../context/HistoryContext';
import RecentActivity from '../common/RecentActivity';
import './tools.css';
import './poster-workspace.css';

import PosterStage from './poster-konva/PosterStage';
import PosterCustomizer from './poster-konva/PosterCustomizer';
import { SIZES, DEFAULT_SIZE } from './poster-konva/engine/constants';
import { exportPosterBlob, exportPosterPdf, downloadBlob, fileToPhotoDataUrl } from './poster-konva/engine/exportPoster';
import { getDesignByIndex, getDesignCount, getDesignRecipes } from './poster-konva/data/autoDesigner';
import { normalizeFormData } from './poster-konva/data/normalizeFormData';
import { applyContent, withoutElement } from './poster-konva/editor/content';
import { isElementId, foldTransform, duplicate as duplicateIn, reorder as reorderIn, alignTo, starterElements, makeImage, makeBlock } from './poster-konva/editor/elements';

const TEMPLATES = {
    academic: {
        name: 'Academic / Seminar',
        fields: [
            { id: 'eventLogo', label: 'Event Logo (Optional)', type: 'file' },
            { id: 'speakerPhoto', label: 'Speaker Photo (Optional)', type: 'file' },
            { id: 'speakerShape', label: 'Speaker Photo Shape', type: 'select', options: ['Hexagon', 'Circle', 'Diamond', 'Square'] },
            { id: 'qr1Image', label: 'Registration QR (Optional)', type: 'file' },
            { id: 'eventTitle', label: 'Event Title', type: 'text', required: true, placeholder: 'e.g., Research Symposium 2024' },
            { id: 'speakerName', label: 'Speaker Name', type: 'text', placeholder: 'e.g., Dr. John Smith' },
            { id: 'speakerDesignation', label: 'Speaker Designation', type: 'text', placeholder: 'e.g., Professor of Computer Science' },
            { id: 'department', label: 'Department / Organizer', type: 'text', placeholder: 'e.g., Department of Computer Science' },
            { id: 'date', label: 'Date', type: 'text', placeholder: 'e.g., January 15, 2025' },
            { id: 'time', label: 'Time', type: 'text', placeholder: 'e.g., 10:00 AM - 12:00 PM' },
            { id: 'venue', label: 'Venue', type: 'text', placeholder: 'e.g., Seminar Hall A' },
            { id: 'description', label: 'Subheading', type: 'textarea', placeholder: 'Short subheading...' },
            { id: 'subdescription', label: 'Description', type: 'textarea', placeholder: 'Enter the full description...' },
            { id: 'colorPreference', label: 'Color Preference', type: 'select', options: ['Vibrant', 'Cool Blues', 'Warm Oranges', 'Modern Purple'] }
        ]
    },
    recruitment: {
        name: 'Recruitment',
        fields: [
            { id: 'eventLogo', label: 'Event Logo (Optional)', type: 'file' },
            { id: 'qr1Image', label: 'Registration QR (Optional)', type: 'file' },
            { id: 'recruitmentTitle', label: 'Recruitment Title', type: 'text', required: true, placeholder: 'e.g., Join Our Team!' },
            { id: 'teamName', label: 'Team / Organization Name', type: 'text', placeholder: 'e.g., Nimbus Tech Club' },
            { id: 'description', label: 'Subheading', type: 'textarea', placeholder: 'Short subheading...' },
            { id: 'subdescription', label: 'Description', type: 'textarea', placeholder: 'Enter the full description...' },
            { id: 'eligibility', label: 'Eligibility / Who Can Apply', type: 'textarea', placeholder: 'e.g., 2nd year students and above' },
            { id: 'benefits', label: 'Benefits / Highlights', type: 'textarea', placeholder: 'e.g., Mentorship, networking, certificates' },
            { id: 'deadline', label: 'Date / Deadline', type: 'text', placeholder: 'e.g., Apply by January 20, 2025' },
            { id: 'contactInfo', label: 'Contact Info', type: 'text', placeholder: 'e.g., recruitment@nimbus.io' }
        ]
    },
    event: {
        name: 'Event / Fest',
        fields: [
            { id: 'eventLogo', label: 'Event Logo (Optional)', type: 'file' },
            { id: 'eventName', label: 'Event Name', type: 'text', required: true, placeholder: 'e.g., TechFest 2025' },
            { id: 'tagline', label: 'Tagline', type: 'text', placeholder: 'e.g., Innovate. Create. Celebrate.' },
            { id: 'description', label: 'Subheading', type: 'textarea', placeholder: 'Short subheading...' },
            { id: 'subdescription', label: 'Description', type: 'textarea', placeholder: 'Enter the full description...' },
            { id: 'date', label: 'Date', type: 'text', placeholder: 'e.g., March 15-17, 2025' },
            { id: 'time', label: 'Time', type: 'text', placeholder: 'e.g., 9:00 AM onwards' },
            { id: 'venue', label: 'Venue', type: 'text', placeholder: 'e.g., Main Auditorium' },
            { id: 'organizer', label: 'Organizer / Club Name', type: 'text', placeholder: 'e.g., Society Council' },
            { id: 'highlights', label: 'Highlights', type: 'textarea', placeholder: 'e.g., Live performances, workshops, prizes' },
            { id: 'prizes', label: 'Prizes / Awards (Optional)', type: 'textarea', placeholder: 'e.g., Winner: ₹10,000, certificates' },
            { id: 'qr1Image', label: 'Registration QR (Optional)', type: 'file' },
            { id: 'colorPreference', label: 'Color Preference', type: 'select', options: ['Vibrant', 'Cool Blues', 'Warm Oranges', 'Modern Purple'] }
        ]
    },
    hackathon: {
        name: 'Hackathon / Tech',
        fields: [
            { id: 'eventLogo', label: 'Event Logo (Optional)', type: 'file' },
            { id: 'qr1Image', label: 'Registration QR (Optional)', type: 'file' },
            { id: 'eventName', label: 'Event Name', type: 'text', required: true, placeholder: 'e.g., CodeSprint 2025' },
            { id: 'hackathonTheme', label: 'Hackathon Theme', type: 'text', placeholder: 'e.g., AI for Social Good' },
            { id: 'duration', label: 'Duration (Optional)', type: 'text', placeholder: 'e.g., 48 Hours' },
            { id: 'subdescription', label: 'Description', type: 'textarea', placeholder: 'Enter the full description...' },
            { id: 'dateDuration', label: 'Date', type: 'text', placeholder: 'e.g., Feb 10-12' },
            { id: 'venueMode', label: 'Venue / Mode', type: 'select', options: ['Online', 'Offline', 'Hybrid'] },
            { id: 'organizer', label: 'Organizer', type: 'text', placeholder: 'e.g., Nimbus Tech Club' },
            { id: 'prizes', label: 'Rewards / Prizes', type: 'textarea', placeholder: 'e.g., ₹50,000 prize pool, internships' },
            { id: 'registrationDeadline', label: 'Registration Deadline', type: 'text', placeholder: 'e.g., Feb 5, 2025' }
        ]
    },
    announcement: {
        name: 'Announcement / Notice',
        fields: [
            { id: 'eventLogo', label: 'Event Logo (Optional)', type: 'file' },
            { id: 'announcementTitle', label: 'Announcement Title', type: 'text', required: true, placeholder: 'e.g., Campus Closure Notice' },
            { id: 'details', label: 'Subheading', type: 'textarea', placeholder: 'Short subheading...' },
            { id: 'subdescription', label: 'Description', type: 'textarea', placeholder: 'Enter the full description...' },
            { id: 'applicableTo', label: 'Applicable To', type: 'text', placeholder: 'e.g., All students and faculty' },
            { id: 'importantDates', label: 'Important Dates', type: 'text', placeholder: 'e.g., Effective from Jan 1, 2025' },
            { id: 'issuedBy', label: 'Issued By', type: 'text', placeholder: 'e.g., Office of Administration' }
        ]
    }
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PosterGenerator = () => {
    const location = useLocation();
    const { refreshHistory } = useHistory();

    const [selectedTemplate, setSelectedTemplate] = useState('academic');
    const [formData, setFormData] = useState({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingStage, setLoadingStage] = useState('');
    const [generatedImage, setGeneratedImage] = useState(null);
    const [posterStyle, setPosterStyle] = useState(null);   // ← FIX: was missing
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const stageRef = useRef(null);
    const [isAutofilling, setIsAutofilling] = useState(false);
    const [isBgBusy, setIsBgBusy] = useState(false);
    // direct editing (drag / resize / hide / add text) with undo-redo
    const [editing, setEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const styleRef = useRef(null);
    const past = useRef([]);
    const future = useRef([]);
    const lastTextEdit = useRef(0);
    const [, bumpHistory] = useState(0);
    // form panel: null = automatic (open until a poster exists, then it slides away); true/false = the user chose
    const [formPref, setFormPref] = useState(null);
    const stageBodyRef = useRef(null);
    // reference posters from the Knowledge Base: used for a poster ONLY when picked here (default: none)
    const [styleRefs, setStyleRefs] = useState([]);
    const [styleRefId, setStyleRefId] = useState('');
    useEffect(() => {
        let alive = true;
        if (!localStorage.getItem('accessToken')) return undefined; // not signed in (e.g. the dev preview): nothing to offer, and no redirect
        (async () => {
            try {
                const res = await fetchWithAuth(API_ENDPOINTS.RAG.SOURCES);
                const data = await res.json();
                if (alive && res.ok && data.success) setStyleRefs((data.data || []).filter((s) => s.type === 'poster_style'));
            } catch { /* knowledge base unavailable: no references to offer */ }
        })();
        return () => { alive = false; };
    }, []);
    const [lastSaved, setLastSaved] = useState(null); // previous poster, offered on the form (not shown automatically)
    const [dlOpen, setDlOpen] = useState(false);
    const dlRef = useRef(null);
    useEffect(() => {
        if (!dlOpen) return undefined;
        const close = (e) => { if (dlRef.current && !dlRef.current.contains(e.target)) setDlOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [dlOpen]);
    const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
    // keep the whole poster (and the Customize panel under it) on screen: fit the preview to the window height
    const [viewportH, setViewportH] = useState(() => window.innerHeight);
    useEffect(() => {
        const onResize = () => setViewportH(window.innerHeight);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    useEffect(() => {
        const el = stageBodyRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return undefined;
        const ro = new ResizeObserver(([e]) => setStageSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    const [autofillSources, setAutofillSources] = useState(null);

    useEffect(() => {
        if (location.state?.posterData) {
            const { templateType, formData: savedFormData, generatedImageUrl, posterStyle: savedStyle } = location.state.posterData;
            if (templateType) setSelectedTemplate(templateType);
            if (savedFormData) setFormData(savedFormData);
            if (generatedImageUrl || savedStyle?.skeleton === 'blank') {
                setGeneratedImage(generatedImageUrl || null);
                // Saved posters may not contain the newer style metadata.
                setPosterStyle(savedStyle || getDesignByIndex(templateType || 'academic', 0, {
                    colorPreference: savedFormData?.colorPreference,
                }));
            }
            toast.success("Poster loaded successfully");
        } else {
            try {
                const saved = JSON.parse(localStorage.getItem('nimbus-last-poster') || 'null');
                if (saved?.generatedImage || saved?.posterStyle?.skeleton === 'blank') setLastSaved(saved);
            } catch { /* ignore stale local preview */ }
        }
    }, [location.state]);

    const resumeLast = () => {
        const saved = lastSaved;
        if (!saved) return;
        setSelectedTemplate(saved.selectedTemplate || 'academic');
        // Do not resurrect QR assets from an old local preview.
        const restoredForm = { ...(saved.formData || {}) };
        // Uploaded assets are local preview state. Never revive an old
        // speaker/event image when starting from the last poster.
        delete restoredForm.speakerPhoto;
        delete restoredForm.eventLogo;
        delete restoredForm.qr1Image;
        delete restoredForm.qr2Image;
        delete restoredForm.registrationUrl;
        setFormData(restoredForm);
        setGeneratedImage(saved.generatedImage || null);
        setPosterStyle(saved.posterStyle || getDesignByIndex(saved.selectedTemplate || 'academic', 0));
        setFormPref(null);
        setLastSaved(null);
    };
    // dev QA only: /dev/editor?resume=1 opens straight into the editor
    useEffect(() => { if (process.env.NODE_ENV !== 'production' && lastSaved && new URLSearchParams(window.location.search).get('resume')) resumeLast(); }, [lastSaved]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        // uploaded photos are data URLs (too big for localStorage) - only remember hosted images
        if (posterStyle && (generatedImage ? !generatedImage.startsWith('data:') : posterStyle.skeleton === 'blank')) {
            try {
                localStorage.setItem('nimbus-last-poster', JSON.stringify({ selectedTemplate, formData, generatedImage, posterStyle }));
            } catch { /* quota exceeded: ignore */ }
        }
    }, [generatedImage, posterStyle, selectedTemplate, formData]);

    styleRef.current = posterStyle;
    if (process.env.NODE_ENV !== 'production') window.__posterStyle = posterStyle; // dev/QA hook
    const currentTemplate = TEMPLATES[selectedTemplate];
    const designH = (SIZES[posterStyle?.custom?.size] || SIZES[DEFAULT_SIZE]).h;
    const baseData = normalizeFormData(selectedTemplate, formData);
    const posterData = applyContent(baseData, posterStyle?.custom?.content); // what the poster shows: the form + wording edited on the poster
    const isBlank = posterStyle?.skeleton === 'blank';
    const hasPoster = !!(posterStyle && (generatedImage || isBlank)); // a blank canvas needs no photo
    const formOpen = formPref ?? !hasPoster;
    // the poster gets its own column now: fit it to whatever room that column has
    const fit = stageSize.w && stageSize.h
        ? Math.min(stageSize.w - 48, ((stageSize.h - 48) * 600) / designH)
        : ((viewportH - 400) * 600) / designH;
    const previewWidth = Math.round(Math.max(260, Math.min(820, fit)));

    const handleTemplateChange = (templateId) => {
        setFormPref(null);
        setSelectedTemplate(templateId);
        setFormData({});
        setGeneratedImage(null);
        setPosterStyle(null);
        setError(null);
    };

    const handleInputChange = (fieldId, value) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
    };

    const isFormValid = () => {
        const requiredFields = currentTemplate.fields.filter(f => f.required);
        return requiredFields.every(f => formData[f.id]?.trim());
    };

    // RAG: fill the still-empty text fields from the knowledge base (never overwrites what the user typed).
    const handleAutofill = async () => {
        if (!isFormValid()) {
            toast.warning("Enter the required title first, then autofill the rest.");
            return;
        }
        setIsAutofilling(true);
        try {
            const response = await fetchWithAuth(API_ENDPOINTS.RAG.POSTER_CONTENT, {
                method: 'POST',
                body: JSON.stringify({ templateType: selectedTemplate, formData })
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || data.message || 'Autofill failed');
            const { fields = {}, colorPreference, sources = [], grounded } = data.data;
            const hasColorField = currentTemplate.fields.some(f => f.id === 'colorPreference');
            setFormData(prev => {
                const next = { ...prev };
                Object.entries(fields).forEach(([k, v]) => { if (!String(next[k] || '').trim()) next[k] = v; });
                if (colorPreference && hasColorField && !next.colorPreference) next.colorPreference = colorPreference;
                return next;
            });
            setAutofillSources(sources);
            const n = Object.keys(fields).length;
            toast.success(n ? `Filled ${n} field${n === 1 ? '' : 's'}${grounded === false ? ' (knowledge base unavailable)' : ''}` : "Nothing left to fill");
        } catch (err) {
            toast.error(err.message || "Autofill failed");
        } finally {
            setIsAutofilling(false);
        }
    };

    const handleGenerate = async () => {
        if (!isFormValid()) {
            toast.warning("Please fill in all required fields first.");
            return;
        }

        setFormPref(null); // after this poster is ready the form tucks away on its own
        const keepCustom = posterStyle?.custom ? { ...posterStyle.custom, overrides: undefined, content: undefined } : undefined;   // size / font / colours / own text survive regeneration; moved positions don't
        past.current = []; future.current = [];
        // Choose the layout first: the AI background is then painted for THIS layout (where its text and focal area go)
        const rotationKey = `nimbus-design-rotation-${selectedTemplate}`;
        const rotation = Number(localStorage.getItem(rotationKey) || 0);
        localStorage.setItem(rotationKey, String(rotation + 1));
        // Rotate locally on every regeneration so the visual layout changes predictably.
        const selectedIndex = rotation % getDesignCount(selectedTemplate);
        const design = getDesignByIndex(selectedTemplate, selectedIndex, {
            colorPreference: formData.colorPreference,
        });
        setIsGenerating(true);
        setError(null);
        setGeneratedImage(null);
        setPosterStyle(null);
        setLoadingStage("🎨 Designing your poster style...");

        try {
            const response = await fetchWithAuth(API_ENDPOINTS.POSTER.GENERATE, {
                method: 'POST',
                body: JSON.stringify({
                    templateType: selectedTemplate,
                    formData,
                    layout: design.skeleton,
                    styleRefId: styleRefId || undefined
                })
            });

            setLoadingStage("🖼️ Generating AI background...");
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    setError("Your session has expired. Please log in again.");
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                    setTimeout(() => window.location.href = '/login', 2000);
                } else if (response.status === 503) {
                    setError(data.message || "AI model is loading. Please wait a few seconds and try again.");
                } else {
                    setError(data.error || data.message || `Server error: ${response.statusText}`);
                }
                return;
            }

            if (!data.success || !data.data?.image) {
                throw new Error(data.message || 'Failed to generate poster');
            }

            setLoadingStage("✨ Finalising your poster...");

            const imageUrl = data.data.image.url;
            setGeneratedImage(imageUrl);

            // Default to the colours of the AI-generated background so text/panels always match the photo
            // (the curated palettes stay available in the Customize panel).
            const styled = { ...design, paletteId: 'auto' };
            setPosterStyle(keepCustom ? { ...styled, custom: keepCustom } : styled);

            toast.success(data.message || "Poster generated successfully!");
        } catch (err) {
            setError(err.message);
            toast.error(err.message || "Failed to generate poster");
        } finally {
            setIsGenerating(false);
            setLoadingStage('');
        }
    };

    // -- Customize panel actions --------------------------------------------
    const snap = () => {
        const c = styleRef.current?.custom || {};
        return { overrides: c.overrides || {}, extras: c.extras || [], typography: c.typography, elements: c.elements || [], bg: c.bg, content: c.content };
    };
    const record = () => {
        past.current.push(snap());
        if (past.current.length > 100) past.current.shift();
        future.current = [];
        bumpHistory((n) => n + 1);
    };
    const applyEdit = (patch, rec = true) => {
        if (rec) record();
        setPosterStyle((p) => (p ? { ...p, custom: { ...(p.custom || {}), ...patch } } : p));
    };
    const hasOverrides = () => Object.keys(snap().overrides).length > 0;

    const updateCustom = (patch) => {
        // positions are only meaningful for one canvas size: moving to another size starts from the layout's own positions
        if (patch.size !== undefined && patch.size !== (styleRef.current?.custom?.size) && hasOverrides()) {
            applyEdit({ ...patch, overrides: {} });
        } else {
            setPosterStyle((p) => (p ? { ...p, custom: { ...(p.custom || {}), ...patch } } : p));
        }
    };
    const updateRecipe = (recipe) => {
        const prev = styleRef.current || {};
        // a different skeleton, decoration, frame or background means different pieces: moved/hidden state would not apply
        const changedLayout = recipe.skeleton !== prev.skeleton || recipe.decoration !== prev.decoration || recipe.frame !== prev.frame || recipe.background !== prev.background;
        const leavingBlank = styleRef.current?.skeleton === 'blank' && recipe.skeleton !== 'blank';
        if (changedLayout && (hasOverrides() || leavingBlank)) record();
        setPosterStyle((p) => ({ ...recipe, custom: { ...(p?.custom || {}), ...(changedLayout ? { overrides: {} } : {}), ...(leavingBlank ? { elements: undefined, bg: undefined } : {}) } }));
    };

    const commitElement = (id, patch) => {
        const { overrides: o, elements } = snap();
        // resizing a free-form element changes its own size (w/h/font), so it stays crisp; only x/y/rotation are kept as overrides
        if (isElementId(id) && (patch.sx !== undefined || patch.sy !== undefined)) {
            const { sx, sy, ...rest } = patch;
            applyEdit({
                elements: (elements || []).map((e) => (e.id === id ? foldTransform(e, sx, sy) : e)),
                overrides: { ...o, [id]: { ...(o[id] || {}), ...rest } },
            });
            return;
        }
        applyEdit({ overrides: { ...o, [id]: { ...(o[id] || {}), ...patch } } });
    };
    const deleteElement = (id) => {
        const { overrides: o, extras, elements } = snap();
        if (isElementId(id)) {
            const { [id]: _gone, ...rest } = o;
            applyEdit({ elements: (elements || []).filter((e) => e.id !== id), overrides: rest });
        } else if (id.startsWith('x_')) {
            const { [id]: _drop, ...rest } = o;
            applyEdit({ extras: extras.filter((e) => e.id !== id), overrides: rest });
        } else {
            applyEdit({ overrides: { ...o, [id]: { ...(o[id] || {}), hidden: true } } });
        }
        setSelectedId(null);
    };
    const restoreElement = (id) => {
        const o = snap().overrides;
        const { hidden: _h, ...rest } = o[id] || {};
        const next = { ...o };
        if (Object.keys(rest).length) next[id] = rest; else delete next[id];
        applyEdit({ overrides: next });
    };
    /** Hide/show/lock many pieces in ONE undo step (the Decorations list: "Hide all"). */
    const setManyOverride = (ids, patch) => {
        const o = { ...snap().overrides };
        ids.forEach((id) => {
            const next = { ...(o[id] || {}), ...patch };
            Object.keys(next).forEach((k) => { if (next[k] === false || next[k] === undefined) delete next[k]; });
            if (Object.keys(next).length) o[id] = next; else delete o[id];
        });
        applyEdit({ overrides: o });
    };
    const resetElement = (id) => {
        const { [id]: _drop, ...rest } = snap().overrides;
        applyEdit({ overrides: rest });
    };
    const addText = () => {
        const id = `x_${Date.now().toString(36)}`;
        const h = designH;
        applyEdit({ extras: [...snap().extras, { id, text: 'Your text', x: 60, y: Math.round(h / 2 - 20), width: 480, size: 32, align: 'center' }] });
        setSelectedId(id);
    };
    const updateExtra = (id, patch) => {
        const now = Date.now();
        const rec = patch.text === undefined || now - lastTextEdit.current > 800; // coalesce typing into one undo step
        if (patch.text !== undefined) lastTextEdit.current = now;
        applyEdit({ extras: snap().extras.map((e) => (e.id === id ? { ...e, ...patch } : e)) }, rec);
    };
    // -- wording edited on the poster ---------------------------------------------------
    const updateContent = (patch) => applyEditWithType({ content: { ...(snap().content || {}), ...patch } });
    const resetContent = (id) => applyEdit({ content: withoutElement(id, snap().content) });
    const applyEditWithType = (patch) => applyEdit(patch, typeRec()); // typing = one undo step per burst

    // -- free-form elements (Design tab) ---------------------------------------------
    const addElement = (el) => { applyEdit({ elements: [...(snap().elements || []), el] }); setSelectedId(el.id); };
    const updateElement = (id, patch) => {
        const rec = typeRec();
        applyEdit({ elements: (snap().elements || []).map((e) => (e.id === id ? { ...e, ...patch } : e)) }, rec);
    };
    const styleFreeElement = (id, patch) => {
        const rec = typeRec();
        applyEdit({
            elements: (snap().elements || []).map((e) => {
                if (e.id !== id) return e;
                const style = Object.fromEntries(Object.entries({ ...(e.style || {}), ...patch }).filter(([, v]) => v !== undefined && v !== ''));
                return { ...e, style };
            }),
        }, rec);
    };
    const duplicateElement = (id) => {
        const { list, copy } = duplicateIn(snap().elements || [], id);
        if (!copy) return;
        applyEdit({ elements: list });
        setSelectedId(copy.id);
    };
    const reorderElement = (id, where) => applyEdit({ elements: reorderIn(snap().elements || [], id, where) });
    const alignElement = (id, how) => {
        const { overrides: o, elements } = snap();
        const el = (elements || []).find((e) => e.id === id);
        if (!el) return;
        applyEdit({ overrides: { ...o, [id]: alignTo(el, o[id] || {}, how, 600, designH) } });
    };
    const setBackground = (bg) => updateCustom({ bg });
    const addImageElement = async (file) => {
        try {
            const src = await fileToPhotoDataUrl(file, 1400);
            const dims = await new Promise((resolve) => { const im = new window.Image(); im.onload = () => resolve([im.width, im.height]); im.onerror = () => resolve([0, 0]); im.src = src; });
            addElement(makeImage(src, dims[0], dims[1]));
        } catch (err) {
            toast.error(err.message || 'Could not use that image');
        }
    };
    // QR codes / speaker photos dropped on the poster: kept as sharp as the upload allows (a QR must stay scannable)
    const readBlockImage = async (file) => {
        const raw = await new Promise((resolve, reject) => { const r = new FileReader(); r.onerror = reject; r.onload = () => resolve(r.result); r.readAsDataURL(file); });
        return raw.length > 1_500_000 ? fileToPhotoDataUrl(file, 1000) : raw;
    };
    const addBlockImage = async (block, file) => {
        try {
            const src = await readBlockImage(file);
            addElement(makeBlock(block, { src, ...(block === 'qr1' ? { x: 470, y: designH - 150 } : { x: 240, y: 120 }) }));
        } catch (err) { toast.error(err.message || 'Could not use that image'); }
    };
    const replaceBlockImage = async (id, file) => {
        try { updateElement(id, { src: await readBlockImage(file) }); } catch (err) { toast.error(err.message || 'Could not use that image'); }
    };
    /** "+" layout: an empty canvas that keeps the current photo/palette and starts with a few event fields. */
    const startBlank = () => {
        past.current = []; future.current = [];
        setSelectedId(null);
        setPosterStyle((p) => ({
            skeleton: 'blank', background: 'solid-gradient', frame: 'none', decoration: 'none',
            paletteId: p?.paletteId || 'midnightSlate',
            custom: { ...(p?.custom || {}), overrides: {}, elements: p?.custom?.elements?.length ? p.custom.elements : starterElements(designH) },
        }));
        setFormPref(null);
    };

    // -- typography (opt-in text styling) -----------------------------------------
    const lastTypeEdit = useRef(0);
    const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== ''));
    const typeRec = () => { const now = Date.now(); const rec = now - lastTypeEdit.current > 800; lastTypeEdit.current = now; return rec; }; // slider drags = one undo step
    /** role: 'title' | 'body' | 'accent' */
    const updateTypography = (role, patch) => {
        const cur = snap().typography || {};
        const next = clean({ ...(cur[role] || {}), ...patch });
        const typography = { ...cur, [role]: Object.keys(next).length ? next : undefined };
        applyEdit({ typography: Object.values(typography).some(Boolean) ? typography : undefined }, typeRec());
    };
    const resetTypography = () => applyEdit({ typography: undefined, titleFont: undefined });
    /** Style of one built-in element (stored in overrides[id].style next to its position). */
    const styleElement = (id, patch) => {
        const o = snap().overrides;
        const style = clean({ ...(o[id]?.style || {}), ...patch });
        const entry = { ...(o[id] || {}) };
        if (Object.keys(style).length) entry.style = style; else delete entry.style;
        const next = { ...o };
        if (Object.keys(entry).length) next[id] = entry; else delete next[id];
        applyEdit({ overrides: next }, typeRec());
    };
    const undo = () => {
        const prev = past.current.pop();
        if (!prev) return;
        future.current.push(snap());
        setPosterStyle((p) => (p ? { ...p, custom: { ...(p.custom || {}), ...prev } } : p));
        bumpHistory((n) => n + 1);
    };
    const redo = () => {
        const next = future.current.pop();
        if (!next) return;
        past.current.push(snap());
        setPosterStyle((p) => (p ? { ...p, custom: { ...(p.custom || {}), ...next } } : p));
        bumpHistory((n) => n + 1);
    };
    const resetLayoutEdits = () => applyEdit({ overrides: {} });

    const handleShuffle = () => {
        const designs = getDesignRecipes(selectedTemplate);
        const same = (d) => d.skeleton === posterStyle?.skeleton && d.background === posterStyle?.background && d.frame === posterStyle?.frame && d.decoration === posterStyle?.decoration;
        const others = designs.filter((d) => !same(d));
        const pool = others.length ? others : designs;
        const pick = pool[Math.floor(Math.random() * pool.length)];
        const palettes = pick.palettes.filter((id) => id !== posterStyle?.paletteId);
        const choices = palettes.length ? palettes : pick.palettes;
        const paletteId = posterStyle?.paletteId === 'auto' ? 'auto' : choices[Math.floor(Math.random() * choices.length)];
        const leavingBlank = posterStyle?.skeleton === 'blank';
        if (hasOverrides() || leavingBlank) record();
        setPosterStyle((p) => ({ ...pick, paletteId, custom: { ...(p?.custom || {}), overrides: {}, ...(leavingBlank ? { elements: undefined, bg: undefined } : {}) } }));
    };

    const handleNewBackground = async (instruction) => {
        setIsBgBusy(true);
        try {
            const response = await fetchWithAuth(API_ENDPOINTS.POSTER.GENERATE, {
                method: 'POST',
                body: JSON.stringify({ templateType: selectedTemplate, formData, layout: posterStyle?.skeleton, styleRefId: styleRefId || undefined, ...(typeof instruction === 'string' && instruction.trim() ? { instruction: instruction.trim().slice(0, 400) } : {}) })
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || data.message || 'Could not generate a background');
            setGeneratedImage(data.data.image.url);
            toast.success('New background ready');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsBgBusy(false);
        }
    };

    const handleUploadPhoto = async (file) => {
        try {
            setGeneratedImage(await fileToPhotoDataUrl(file));
            toast.success('Photo applied');
        } catch (err) {
            toast.error(err.message || 'Could not use that photo');
        }
    };

    const handleSave = async (status = 'draft') => {
        if (!isBlank && !isFormValid()) {
            toast.warning(`Please fill in required fields to save this ${status}.`);
            return;
        }
        if (status === 'final' && !generatedImage && !isBlank) {
            toast.info("Please generate a poster first to finalise it.");
            return;
        }

        setIsSaving(true);
        try {
            let previewImage = null;
            try {
                const blob = await exportPosterBlob(stageRef.current, { outputWidth: 420, mimeType: 'image/jpeg', quality: 0.8 });
                previewImage = await new Promise((resolve) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.readAsDataURL(blob); });
            } catch { /* preview is optional */ }
            const response = await fetchWithAuth(API_ENDPOINTS.POSTER.SAVE, {
                method: 'POST',
                body: JSON.stringify({
                    templateType: selectedTemplate,
                    formData,
                    status,
                    generatedImageUrl: generatedImage,
                    posterStyle,
                    previewImage
                })
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || `Failed to save ${status}`);
            }
            refreshHistory();
            toast.success(data.message || (status === 'final' ? "Poster finalised and saved!" : "Draft saved!"));
        } catch (err) {
            setError(err.message);
            toast.error(err.message || `Failed to save ${status}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownload = async (format = 'png') => {
        if (!generatedImage && !isBlank) {
            toast.info("Please generate a poster first to download it.");
            return;
        }
        const posterTitle = formData.eventTitle || formData.eventName ||
            formData.announcementTitle || formData.recruitmentTitle || 'Untitled Poster';
        const base = `Poster - ${posterTitle} (By Nimbus)`;
        try {
            if (format === 'pdf') {
                downloadBlob(await exportPosterPdf(stageRef.current, { sizeKey: posterStyle?.custom?.size }), `${base}.pdf`);
            } else if (format === 'jpg') {
                downloadBlob(await exportPosterBlob(stageRef.current, { outputWidth: 2160, mimeType: 'image/jpeg', quality: 0.95 }), `${base}.jpg`);
            } else {
                downloadBlob(await exportPosterBlob(stageRef.current, { outputWidth: 2160 }), `${base}.png`);
            }
            toast.success("Poster download started!");
        } catch (err) {
            toast.error(err.message || "Failed to export poster");
        }
    };

    const renderField = (field) => {
        const value = formData[field.id] || '';

        if (field.type === 'file') {
            return (
                <input
                    type="file"
                    id={field.id}
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => handleInputChange(field.id, reader.result);
                            reader.readAsDataURL(file);
                        }
                    }}
                    style={{ border: '1px dashed #ccc', padding: '0.5rem', width: '100%', borderRadius: '4px' }}
                />
            );
        }
        if (field.type === 'textarea') {
            return (
                <textarea
                    id={field.id}
                    value={value}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                />
            );
        }
        if (field.type === 'select') {
            return (
                <select
                    id={field.id}
                    value={value}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                >
                    <option value="">Select...</option>
                    {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            );
        }
        return (
            <input
                type="text"
                id={field.id}
                value={value}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={field.placeholder}
            />
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Focused workspace: [ form | customize | poster ]. Once a poster exists the form slides away
    // (re-open it with "Edit form"), leaving the customize panel and the poster side by side.
    const posterActions = (
        <div className="pw-actions">
            <button className="pw-btn" onClick={() => handleSave('draft')} disabled={isSaving} title="Save as a draft in History">
                <FiFileText /> <span>{isSaving ? 'Saving…' : 'Save draft'}</span>
            </button>
            <button className="pw-btn" onClick={() => handleSave('final')} disabled={isSaving} title="Mark as final">
                <FiCheckCircle /> <span>Finalise</span>
            </button>
            <div className="pw-menu" ref={dlRef}>
                <button className="pw-btn primary" onClick={() => setDlOpen((o) => !o)} aria-haspopup="menu" aria-expanded={dlOpen}>
                    <FiDownload /> <span>Download</span> <FiChevronDown />
                </button>
                {dlOpen && (
                    <div className="pw-menu-pop" role="menu">
                        {[['png', 'PNG', 'best quality'], ['jpg', 'JPG', 'smaller file'], ['pdf', 'PDF', 'for print']].map(([k, label, hint]) => (
                            <button key={k} role="menuitem" onClick={() => { setDlOpen(false); handleDownload(k); }}>
                                <b>{label}</b><small>{hint}</small>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="tool-page pw-page">
            <div className={`pw ${formOpen ? 'form-open' : 'form-closed'} ${hasPoster ? 'has-poster' : 'no-poster'}`}>

                {/* ── FORM (slides away after generating) ── */}
                <section className="pw-col pw-form" aria-label="Poster details" aria-hidden={!formOpen}>
                    <div className="pw-col-scroll">
                        <header className="tool-header pw-head">
                            <div>
                                <h2 className="tool-title">Poster Ideas</h2>
                                <p className="tool-subtitle">Fill the required fields to generate a poster</p>
                            </div>
                            {hasPoster && (
                                <button className="pw-icon-btn" onClick={() => setFormPref(false)} title="Hide form" aria-label="Hide form">‹</button>
                            )}
                        </header>

                        {lastSaved && !hasPoster && (
                            <button className="pw-resume-btn" onClick={resumeLast} type="button">
                                <span aria-hidden="true">↩</span> Resume your last poster
                            </button>
                        )}

                        <section className="tool-form-section">
                            <h3>Select Template</h3>
                            <div className="tool-options-grid">
                                {Object.entries(TEMPLATES).map(([id, template]) => (
                                    <div
                                        key={id}
                                        className={`tool-option-card ${selectedTemplate === id ? 'active' : ''}`}
                                        onClick={() => handleTemplateChange(id)}
                                    >
                                        <span className="template-name">{template.name}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="tool-form-section">
                            <h3>Poster Details</h3>
                            {currentTemplate.fields.map(field => (
                                <div key={field.id} className="tool-form-group">
                                    <label htmlFor={field.id}>
                                        {field.label}
                                        {field.required && <span className="required">*</span>}
                                    </label>
                                    {renderField(field)}
                                </div>
                            ))}
                        </section>

                        {styleRefs.length > 0 && (
                            <section className="tool-form-section">
                                <h3>Style reference <small style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</small></h3>
                                <select value={styleRefId} onChange={(e) => setStyleRefId(e.target.value)} aria-label="Style reference">
                                    <option value="">None: don't copy any reference</option>
                                    {styleRefs.map((r) => <option key={r.id} value={r.id}>{r.title}{r.scope === 'global' ? ' (shared)' : ''}</option>)}
                                </select>
                                <p style={{ fontSize: '0.75rem', opacity: 0.65, margin: '0.4rem 0 0' }}>Your reference posters only influence a poster's background when you pick one here.</p>
                            </section>
                        )}

                        <section className="tool-actions">
                            <button
                                className="tool-btn-secondary"
                                style={{ width: '100%', marginBottom: '0.6rem', justifyContent: 'center' }}
                                onClick={handleAutofill}
                                disabled={isAutofilling || isGenerating}
                            >
                                {isAutofilling ? 'Reading your knowledge base...' : '🧠 Autofill with Nimbus'}
                            </button>
                            {autofillSources && (
                                <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: '0 0 0.6rem' }}>
                                    {autofillSources.length
                                        ? `Used: ${autofillSources.map(s => s.title).join(', ')}`
                                        : 'No matching knowledge found — add some in Knowledge Base for better results.'}
                                </p>
                            )}
                            <button
                                className="tool-btn-generate"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <span className="loading-dots">
                                        {loadingStage || 'Generating'}<span>.</span><span>.</span><span>.</span>
                                    </span>
                                ) : (
                                    <>✨ Generate Poster</>
                                )}
                            </button>
                        </section>

                        <button className="pw-blank-btn" onClick={startBlank} disabled={isGenerating} type="button">
                            <span aria-hidden="true">＋</span> Start from a blank canvas
                        </button>

                        <div className="tool-footer-history">
                            <RecentActivity filterType="Posters" limit={3} title="Recent Posters" />
                        </div>
                    </div>
                </section>

                {/* ── CUSTOMIZE (only once there is a poster) ── */}
                {hasPoster && (
                    <section className="pw-col pw-modify" aria-label="Customize poster">
                        <div className="pw-col-scroll">
                            <PosterCustomizer
                                template={selectedTemplate}
                                recipe={posterStyle}
                                custom={posterStyle.custom || {}}
                                onRecipe={updateRecipe}
                                onCustom={updateCustom}
                                data={posterData}
                                photo={generatedImage}
                                onShuffle={handleShuffle}
                                onNewBackground={handleNewBackground}
                                onUploadPhoto={handleUploadPhoto}
                                busy={isBgBusy}
                                onEditing={(on) => { setEditing(on); if (!on) setSelectedId(null); }}
                                selectedId={selectedId}
                                onSelect={setSelectedId}
                                onUndo={undo}
                                onRedo={redo}
                                canUndo={past.current.length > 0}
                                canRedo={future.current.length > 0}
                                onResetAll={resetLayoutEdits}
                                onAddText={addText}
                                design={{
                                    isBlank, add: addElement, update: updateElement, style: styleFreeElement, duplicate: duplicateElement,
                                    reorder: reorderElement, align: alignElement, remove: deleteElement, setBg: setBackground,
                                    removePhoto: () => setGeneratedImage(null), generateBg: handleNewBackground, addImage: addImageElement, addBlockImage, replaceBlockImage,
                                    setElementOverride: commitElement, setManyOverride, startBlank, hasPhoto: !!generatedImage,
                                }}
                                onTypography={updateTypography}
                                onContent={updateContent}
                                onResetContent={resetContent}
                                onResetTypography={resetTypography}
                                onStyleElement={styleElement}
                                onUpdateExtra={updateExtra}
                                onResetElement={resetElement}
                                onDeleteElement={deleteElement}
                                onRestore={restoreElement}
                            />
                        </div>
                    </section>
                )}

                {/* ── POSTER ── */}
                <main className="pw-col pw-stage" aria-label="Poster preview">
                    <div className="pw-toolbar">
                        {hasPoster ? (
                            <button className={`pw-edit-form ${formOpen ? 'on' : ''}`} onClick={() => setFormPref(formOpen ? false : true)}>
                                ✏️ {formOpen ? 'Hide form' : 'Edit form'}
                            </button>
                        ) : (
                            <h2 className="tool-title">Design Preview</h2>
                        )}
                        {hasPoster && posterActions}
                    </div>

                    <div className="pw-stage-body" ref={stageBodyRef}>
                        {isGenerating && (
                            <div className="tool-preview-loading">
                                <div className="spinner"></div>
                                <p>{loadingStage || 'Generating your poster...'}</p>
                                <p className="loading-hint">This may take a moment</p>
                            </div>
                        )}

                        {!isGenerating && error && (
                            <div className="tool-preview-error">
                                <p>⚠️ {error}</p>
                            </div>
                        )}

                        {!isGenerating && hasPoster && (
                            <div className="pw-poster" style={{ width: `${previewWidth}px` }}>
                                <PosterStage
                                    ref={stageRef}
                                    recipe={posterStyle}
                                    data={posterData}
                                    aiBackgroundImage={generatedImage}
                                    width={previewWidth}
                                    editing={editing}
                                    selectedId={selectedId}
                                    onSelect={setSelectedId}
                                    onCommit={commitElement}
                                    onDelete={deleteElement}
                                    onUndo={undo}
                                    onRedo={redo}
                                />
                            </div>
                        )}

                        {!isGenerating && !hasPoster && !error && (
                            <div className="tool-preview-empty">
                                <p>Fill in the details and click Generate to create your poster.</p>
                            </div>
                        )}
                    </div>
                </main>

            </div>
        </div>
    );
};

export default PosterGenerator;
