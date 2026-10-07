import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchWithAuth, API_ENDPOINTS } from '../../api/config';
import { toast } from '../../utils/toast';
import { FiCheckCircle, FiFileText } from 'react-icons/fi';
import { useHistory } from '../../context/HistoryContext';
import RecentActivity from '../common/RecentActivity';
import './tools.css';

import PosterStage from './poster-konva/PosterStage';
import PosterCustomizer from './poster-konva/PosterCustomizer';
import { TemplateCards, Stepper, Inspiration, QuickTweaks, STYLE_CHIPS } from './poster-konva/ui/StudioParts';
import { TITLE_FIELD, MOOD_LAYOUTS } from './poster-konva/data/samples';
import { PALETTES } from './poster-konva/data/palettes';
import { SIZES, DEFAULT_SIZE } from './poster-konva/engine/constants';
import { exportPosterBlob, exportPosterPdf, downloadBlob, fileToPhotoDataUrl } from './poster-konva/engine/exportPoster';
import { getDesignByIndex, getDesignRecipes, paletteFor } from './poster-konva/data/autoDesigner';
import { normalizeFormData } from './poster-konva/data/normalizeFormData';

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
    // keep the whole poster (and the Customize panel under it) on screen: fit the preview to the window height
    const [viewportH, setViewportH] = useState(() => window.innerHeight);
    useEffect(() => {
        const onResize = () => setViewportH(window.innerHeight);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    const [autofillSources, setAutofillSources] = useState(null);
    // "Studio" inputs: everything optional except a title (or a description to take it from)
    const [brief, setBrief] = useState('');
    const [instruction, setInstruction] = useState('');
    const [useBrand, setUseBrand] = useState(true);
    const [autoFill, setAutoFill] = useState(true);
    const [pickedLook, setPickedLook] = useState(null);
    const [art, setArt] = useState(null);
    const [stepIndex, setStepIndex] = useState(0);

    // arriving from the Dashboard's one-line box: prefill and start straight away
    const [pendingCreate, setPendingCreate] = useState(false);
    useEffect(() => {
        const q = location.state?.quickStart;
        if (!q) return;
        setSelectedTemplate(q.template || 'event');
        setFormData({});
        setBrief(q.brief || '');
        setGeneratedImage(null);
        setPosterStyle(null);
        if (q.autoCreate) setPendingCreate(true);
        window.history.replaceState({}, document.title); // don't re-run on refresh
    }, [location.state]);

    useEffect(() => {
        if (location.state?.posterData) {
            const { templateType, formData: savedFormData, generatedImageUrl, posterStyle: savedStyle } = location.state.posterData;
            if (templateType) setSelectedTemplate(templateType);
            if (savedFormData) setFormData(savedFormData);
            if (generatedImageUrl) {
                setGeneratedImage(generatedImageUrl);
                // Saved posters may not contain the newer style metadata.
                setPosterStyle(savedStyle || getDesignByIndex(templateType || 'academic', 0, {
                    colorPreference: savedFormData?.colorPreference,
                }));
            }
            toast.success("Poster loaded successfully");
        } else {
            try {
                const saved = JSON.parse(localStorage.getItem('nimbus-last-poster') || 'null');
                if (saved?.generatedImage) {
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
                    setGeneratedImage(saved.generatedImage);
                    setPosterStyle(saved.posterStyle || getDesignByIndex(saved.selectedTemplate || 'academic', 0));
                }
            } catch { /* ignore stale local preview */ }
        }
    }, [location.state]);

    useEffect(() => {
        // uploaded photos are data URLs (too big for localStorage) - only remember hosted images
        if (generatedImage && posterStyle && !generatedImage.startsWith('data:')) {
            try {
                localStorage.setItem('nimbus-last-poster', JSON.stringify({ selectedTemplate, formData, generatedImage, posterStyle }));
            } catch { /* quota exceeded: ignore */ }
        }
    }, [generatedImage, posterStyle, selectedTemplate, formData]);

    styleRef.current = posterStyle;
    if (process.env.NODE_ENV !== 'production') window.__posterStyle = posterStyle; // dev/QA hook
    const currentTemplate = TEMPLATES[selectedTemplate];
    const designH = (SIZES[posterStyle?.custom?.size] || SIZES[DEFAULT_SIZE]).h;
    const previewWidth = Math.round(Math.max(300, Math.min(600, ((viewportH - 400) * 600) / designH)));

    const handleTemplateChange = (templateId) => {
        setSelectedTemplate(templateId);
        setFormData({});
        setGeneratedImage(null);
        setPosterStyle(null);
        setError(null);
        setBrief('');
        setArt(null);
        setPickedLook(null);
    };

    const handleInputChange = (fieldId, value) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
    };

    const isFormValid = () => {
        const requiredFields = currentTemplate.fields.filter(f => f.required);
        return requiredFields.every(f => formData[f.id]?.trim());
    };

    const titleField = TITLE_FIELD[selectedTemplate];
    const titleValue = String(formData[titleField] || '').trim();
    const titleLabel = currentTemplate.fields.find((f) => f.id === titleField)?.label || 'Title';

    // RAG: ask the server for the empty fields (from the description + knowledge base). Never overwrites typed values.
    const fetchAutofill = async (form) => {
        const response = await fetchWithAuth(API_ENDPOINTS.RAG.POSTER_CONTENT, {
            method: 'POST',
            body: JSON.stringify({ templateType: selectedTemplate, formData: form, brief, instruction })
        });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || data.message || 'Autofill failed');
        return data.data;
    };
    const mergeFields = (form, fields = {}, colorPreference) => {
        const next = { ...form };
        Object.entries(fields).forEach(([k, v]) => { if (!String(next[k] || '').trim()) next[k] = v; });
        if (colorPreference && currentTemplate.fields.some((f) => f.id === 'colorPreference') && !next.colorPreference) next.colorPreference = colorPreference;
        return next;
    };

    const handleAutofill = async () => {
        if (!titleValue && !brief.trim()) {
            toast.warning('Enter a title or describe your event first.');
            return;
        }
        setIsAutofilling(true);
        try {
            const { fields = {}, colorPreference, sources = [], grounded } = await fetchAutofill(formData);
            setFormData((prev) => mergeFields(prev, fields, colorPreference));
            setAutofillSources(sources);
            const n = Object.keys(fields).length;
            toast.success(n ? `Filled ${n} field${n === 1 ? '' : 's'}${grounded === false ? ' (knowledge base unavailable)' : ''}` : 'Nothing left to fill');
        } catch (err) {
            toast.error(err.message || 'Autofill failed');
        } finally {
            setIsAutofilling(false);
        }
    };

    // Choose layout + palette: the user's pick, else something matching the art director's mood, rotating for variety.
    const chooseStyle = (artPlan, form) => {
        let design;
        if (pickedLook) {
            design = { ...pickedLook, paletteId: pickedLook.paletteId || pickedLook.palettes?.[0] };
        } else {
            const pool = getDesignRecipes(selectedTemplate);
            const wanted = artPlan?.mood && MOOD_LAYOUTS[artPlan.mood];
            let candidates = wanted ? pool.filter((d) => wanted.includes(d.skeleton)) : pool;
            if (!candidates.length) candidates = pool;
            const key = `nimbus-design-rotation-${selectedTemplate}`;
            const rot = Number(localStorage.getItem(key) || 0);
            localStorage.setItem(key, String(rot + 1));
            const d = candidates[rot % candidates.length];
            design = { ...d, paletteId: paletteFor(d, form.colorPreference) };
        }
        const { index: _i, palettes: _p, ...recipe } = design;
        return recipe;
    };

    const requestBackground = async (form, extra = {}) => {
        const response = await fetchWithAuth(API_ENDPOINTS.POSTER.GENERATE, {
            method: 'POST',
            body: JSON.stringify({ templateType: selectedTemplate, formData: form, instruction, useBrandStyle: useBrand, ...extra })
        });
        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                setTimeout(() => { window.location.href = '/login'; }, 2000);
                throw new Error('Your session has expired. Please log in again.');
            }
            throw new Error(data.error || data.message || `Server error: ${response.statusText}`);
        }
        if (!data.success || !data.data?.image) throw new Error(data.message || 'Failed to generate poster');
        return data.data;
    };

    // One click: understand the details -> design the background -> compose the poster.
    const handleCreate = async () => {
        if (!titleValue && !brief.trim()) {
            toast.warning('Type a title, or describe your event, to get started.');
            return;
        }
        const keepCustom = posterStyle?.custom ? { ...posterStyle.custom, overrides: undefined } : undefined; // size/font/own text survive; moved positions don't
        past.current = []; future.current = [];
        setIsGenerating(true);
        setError(null);
        setGeneratedImage(null);
        setPosterStyle(null);
        setArt(null);
        setStepIndex(0);

        try {
            let form = formData;
            if (autoFill || brief.trim()) {
                try {
                    const { fields = {}, colorPreference, sources = [] } = await fetchAutofill(form);
                    form = mergeFields(form, fields, colorPreference);
                    setFormData(form);
                    setAutofillSources(sources);
                } catch (err) {
                    toast.info('Could not read your details automatically; continuing with what you typed.');
                }
            }
            if (!String(form[titleField] || '').trim()) throw new Error('Please add a title for your poster.');

            setStepIndex(1);
            const result = await requestBackground(form);
            setGeneratedImage(result.image.url);
            setArt(result.art || null);

            setStepIndex(2);
            const recipe = chooseStyle(result.art, form);
            const custom = { ...(keepCustom || {}) };
            if (result.art?.colors?.length) {
                recipe.paletteId = 'brand';          // colours came from the user's brand notes / style wishes
                custom.brandColors = result.art.colors;
            }
            setPosterStyle(Object.keys(custom).length ? { ...recipe, custom } : recipe);
            toast.success('Your poster is ready');
        } catch (err) {
            setError(err.message);
            toast.error(err.message || 'Failed to create poster');
        } finally {
            setIsGenerating(false);
            setStepIndex(0);
        }
    };

    // -- Customize panel actions --------------------------------------------
    const snap = () => {
        const c = styleRef.current?.custom || {};
        return { overrides: c.overrides || {}, extras: c.extras || [] };
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
        const changedLayout = recipe.skeleton !== styleRef.current?.skeleton;
        if (changedLayout && hasOverrides()) record();
        setPosterStyle((p) => ({ ...recipe, custom: { ...(p?.custom || {}), ...(changedLayout ? { overrides: {} } : {}) } }));
    };

    const commitElement = (id, patch) => {
        const o = snap().overrides;
        applyEdit({ overrides: { ...o, [id]: { ...(o[id] || {}), ...patch } } });
    };
    const deleteElement = (id) => {
        const { overrides: o, extras } = snap();
        if (id.startsWith('x_')) {
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
        const paletteId = choices[Math.floor(Math.random() * choices.length)];
        if (hasOverrides()) record();
        setPosterStyle((p) => ({ ...pick, paletteId, custom: { ...(p?.custom || {}), overrides: {} } }));
    };

    const handleNewBackground = async () => {
        setIsBgBusy(true);
        try {
            const result = await requestBackground(formData);
            setGeneratedImage(result.image.url);
            if (result.art) {
                setArt(result.art);
                if (result.art.colors?.length && styleRef.current?.paletteId === 'brand') updateCustom({ brandColors: result.art.colors });
            }
            toast.success('New background ready');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsBgBusy(false);
        }
    };

    // quick tweaks
    const tweakColors = () => {
        const ids = Object.keys(PALETTES).filter((id) => id !== styleRef.current?.paletteId);
        setPosterStyle((p) => (p ? { ...p, paletteId: ids[Math.floor(Math.random() * ids.length)] } : p));
    };
    const tweakPhoto = (delta) => updateCustom({ photoStrength: Math.max(0, Math.min(1.5, (styleRef.current?.custom?.photoStrength ?? 1) + delta)) });
    const tweakTitle = (delta) => updateCustom({ textScale: Math.max(0.6, Math.min(1.4, (styleRef.current?.custom?.textScale || 1) + delta)) });

    const handleUploadPhoto = async (file) => {
        try {
            setGeneratedImage(await fileToPhotoDataUrl(file));
            toast.success('Photo applied');
        } catch (err) {
            toast.error(err.message || 'Could not use that photo');
        }
    };

    const handleSave = async (status = 'draft') => {
        if (!isFormValid()) {
            toast.warning(`Please fill in required fields to save this ${status}.`);
            return;
        }
        if (status === 'final' && !generatedImage) {
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
        if (!generatedImage) {
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
    useEffect(() => {
        if (pendingCreate) {
            setPendingCreate(false);
            handleCreate();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingCreate]);

    const titlePlaceholder = currentTemplate.fields.find((f) => f.id === titleField)?.placeholder || '';
    const briefPlaceholder = {
        academic: 'e.g. Guest lecture by Dr. Rao on AI in healthcare, 15 Jan 10 AM at Seminar Hall A. Open to all departments.',
        recruitment: 'e.g. Recruiting design and web dev members, 2nd year and above. Apply by 20 Jan. Mentorship + certificates.',
        event: 'e.g. Annual cultural fest on 15-17 March at the Main Auditorium with live music, dance and food stalls.',
        hackathon: 'e.g. 36 hour hackathon on 14-15 Feb at the Main Auditorium, Rs 40,000 prize pool, register by 10 Feb.',
        announcement: 'e.g. Library will remain closed on Friday for maintenance. Applicable to all students.',
    }[selectedTemplate];
    const filledMore = currentTemplate.fields.filter((f) => f.id !== titleField && String(formData[f.id] || '').trim()).length;
    const toggleChip = (chip) => {
        setInstruction((cur) => {
            const parts = cur.split(',').map((x) => x.trim()).filter(Boolean);
            const has = parts.some((x) => x.toLowerCase() === chip.toLowerCase());
            return (has ? parts.filter((x) => x.toLowerCase() !== chip.toLowerCase()) : [...parts, chip]).join(', ');
        });
    };
    const chipOn = (chip) => instruction.toLowerCase().split(',').map((x) => x.trim()).includes(chip.toLowerCase());

    return (
        <div className="tool-page">
            <div className="tool-container">

                {/* ── LEFT PANEL ── */}
                <div className="tool-panel tool-panel-left">
                    <div className="panel-inner">
                        <header className="tool-header">
                            <h2 className="tool-title">Create a poster</h2>
                        </header>
                        <p className="ps-lead">A title is enough. Or paste a few details and Nimbus will fill in the rest, design the background and lay it all out.</p>

                        <div className="ps-section-label">What are you making?</div>
                        <TemplateCards templates={TEMPLATES} selected={selectedTemplate} onSelect={handleTemplateChange} />

                        <div className="ps-section-label">{titleLabel.replace(/\*$/, '')} <small>required</small></div>
                        <div className="ps-field">
                            <input
                                type="text"
                                id={titleField}
                                className="ps-title-input"
                                value={formData[titleField] || ''}
                                onChange={(e) => handleInputChange(titleField, e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !isGenerating) handleCreate(); }}
                                placeholder={titlePlaceholder}
                                autoComplete="off"
                            />
                        </div>

                        <div className="ps-section-label">Tell us more <small>optional — dates, venue, who it's for…</small></div>
                        <div className="ps-field">
                            <textarea id="ps-brief" value={brief} onChange={(e) => setBrief(e.target.value)} placeholder={briefPlaceholder} rows={4} />
                        </div>

                        <div className="ps-section-label">Style wishes <small>optional</small></div>
                        <div className="ps-field">
                            <input type="text" id="ps-style" value={instruction} onChange={(e) => setInstruction(e.target.value)}
                                placeholder="e.g. elegant dark blue with golden accents, graduation theme" autoComplete="off" />
                            <div className="ps-chips">
                                {STYLE_CHIPS.map((c) => (
                                    <button key={c} type="button" className={`ps-chip ${chipOn(c) ? 'on' : ''}`} onClick={() => toggleChip(c)}>{c}</button>
                                ))}
                            </div>
                        </div>

                        <div className="ps-toggles">
                            <label className="ps-toggle">
                                <input type="checkbox" checked={autoFill} onChange={(e) => setAutoFill(e.target.checked)} />
                                <span>Let Nimbus write the rest<small>Fills empty fields from your details and Knowledge Base</small></span>
                            </label>
                            <label className="ps-toggle">
                                <input type="checkbox" checked={useBrand} onChange={(e) => setUseBrand(e.target.checked)} />
                                <span>Use my brand style<small>Backgrounds and colours follow your Knowledge Base</small></span>
                            </label>
                        </div>

                        <section className="tool-actions">
                            <button className="ps-create tool-btn-generate" onClick={handleCreate} disabled={isGenerating}>
                                {isGenerating ? 'Creating your poster…' : (posterStyle ? '✨ Create a fresh poster' : '✨ Create poster')}
                            </button>
                        </section>

                        <details className="ps-more">
                            <summary>More details <span>{filledMore ? `${filledMore} filled` : 'speaker, date, venue, logos, QR…'}</span></summary>
                            <div className="ps-more-body">
                                {currentTemplate.fields.filter((f) => f.id !== titleField).map((field) => (
                                    <div key={field.id} className="tool-form-group">
                                        <label htmlFor={field.id}>{field.label}</label>
                                        {renderField(field)}
                                    </div>
                                ))}
                                <button className="tool-btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAutofill} disabled={isAutofilling || isGenerating}>
                                    {isAutofilling ? 'Reading your knowledge base…' : '🧠 Fill empty fields with Nimbus'}
                                </button>
                                {autofillSources && (
                                    <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: '0.6rem 0 0' }}>
                                        {autofillSources.length ? `Used: ${autofillSources.map((x) => x.title).join(', ')}` : 'No matching knowledge found — add some in Knowledge Base for better results.'}
                                    </p>
                                )}
                            </div>
                        </details>

                        <div className="tool-footer-history">
                            <RecentActivity filterType="Posters" limit={3} title="Recent Posters" />
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="tool-panel tool-panel-right">
                    <div className="panel-inner">
                        <header className="tool-header space-between">
                            <h2 className="tool-title">{generatedImage && posterStyle ? 'Your poster' : 'Design Preview'}</h2>
                            {generatedImage && posterStyle && <span className="premium-badge">Ready to Export</span>}
                        </header>

                        <div className="tool-preview-container">

                            {isGenerating && (
                                <Stepper steps={['Reading your details', 'Designing the background', 'Composing your poster']} active={stepIndex} />
                            )}

                            {!isGenerating && error && <div className="ps-error">⚠️ {error}</div>}

                            {!isGenerating && generatedImage && posterStyle && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', overflow: 'auto', borderRadius: '12px', paddingBottom: '10px' }}>
                                        <div style={{ flexShrink: 0, width: `${previewWidth}px`, boxShadow: '0 18px 50px rgba(15,23,42,.28)', borderRadius: 6, overflow: 'hidden' }}>
                                            <PosterStage
                                                ref={stageRef}
                                                recipe={posterStyle}
                                                data={normalizeFormData(selectedTemplate, formData)}
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
                                    </div>

                                    <QuickTweaks onColors={tweakColors} onLayout={handleShuffle} onBackground={handleNewBackground}
                                        onPhoto={tweakPhoto} onTitleSize={tweakTitle} busy={isBgBusy} />

                                    {art?.prompt && (
                                        <details className="ps-idea">
                                            <summary>🎨 Background idea{art.mood ? ` · ${art.mood}` : ''}</summary>
                                            <p style={{ margin: '6px 0 0' }}>{art.prompt}</p>
                                            <p style={{ margin: '6px 0 0', opacity: .8 }}>Want it different? Change <b>Style wishes</b> on the left, then click <b>🖼 Background</b>.</p>
                                        </details>
                                    )}

                                    <PosterCustomizer
                                        template={selectedTemplate}
                                        recipe={posterStyle}
                                        custom={posterStyle.custom || {}}
                                        onRecipe={updateRecipe}
                                        onCustom={updateCustom}
                                        data={normalizeFormData(selectedTemplate, formData)}
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
                                        onUpdateExtra={updateExtra}
                                        onResetElement={resetElement}
                                        onDeleteElement={deleteElement}
                                        onRestore={restoreElement}
                                    />

                                    <div className="ps-actions">
                                        <button className="tool-btn-generate" style={{ width: 'auto', padding: '0.7rem 1.4rem' }} onClick={() => handleDownload('png')}>⬇ Download PNG</button>
                                        <button className="tool-btn-secondary" onClick={() => handleDownload('jpg')}>JPG</button>
                                        <button className="tool-btn-secondary" onClick={() => handleDownload('pdf')}>PDF</button>
                                        <button className="tool-btn-secondary" onClick={() => handleSave('draft')} disabled={isSaving}><FiFileText /> {isSaving ? 'Saving...' : 'Save Draft'}</button>
                                        <button className="tool-btn-primary" onClick={() => handleSave('final')} disabled={isSaving}><FiCheckCircle /> {isSaving ? 'Saving...' : 'Finalise'}</button>
                                    </div>
                                </>
                            )}

                            {!isGenerating && !(generatedImage && posterStyle) && (
                                <Inspiration template={selectedTemplate} title={formData[titleField]} picked={pickedLook} onPick={setPickedLook} />
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PosterGenerator;
