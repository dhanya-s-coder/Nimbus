import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { useLocation } from 'react-router-dom';
import { fetchWithAuth, API_ENDPOINTS } from '../../api/config';
import { toast } from '../../utils/toast';
import { FiCheckCircle, FiFileText } from 'react-icons/fi';
import { useHistory } from '../../context/HistoryContext';
import RecentActivity from '../common/RecentActivity';
import './tools.css';

import PosterCompositor from './poster-templates/PosterCompositor';
import { getDesignByIndex, getDesignCandidates, getDesignCount } from './poster-templates/autoDesigner';
import { normalizeFormData } from './poster-templates/normalizeFormData';

const TEMPLATES = {
    academic: {
        name: 'Academic / Seminar',
        fields: [
            { id: 'eventLogo', label: 'Event Logo (Optional)', type: 'file' },
            { id: 'speakerPhoto', label: 'Speaker Photo (Optional)', type: 'file' },
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
        if (generatedImage && posterStyle) {
            localStorage.setItem('nimbus-last-poster', JSON.stringify({ selectedTemplate, formData, generatedImage, posterStyle }));
        }
    }, [generatedImage, posterStyle, selectedTemplate, formData]);

    const currentTemplate = TEMPLATES[selectedTemplate];

    const handleTemplateChange = (templateId) => {
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

    const handleGenerate = async () => {
        if (!isFormValid()) {
            toast.warning("Please fill in all required fields first.");
            return;
        }

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
                    availableDesigns: getDesignCandidates(selectedTemplate)
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

            // Apply new poster-templates design
            const rotationKey = `nimbus-design-rotation-${selectedTemplate}`;
            const rotation = Number(localStorage.getItem(rotationKey) || 0);
            localStorage.setItem(rotationKey, String(rotation + 1));
            // Rotate locally on every regeneration so the visual layout changes predictably.
            const selectedIndex = rotation % getDesignCount(selectedTemplate);
            const design = getDesignByIndex(selectedTemplate, selectedIndex, {
                colorPreference: formData.colorPreference,
            });
            setPosterStyle(design);

            toast.success(data.message || "Poster generated successfully!");
        } catch (err) {
            setError(err.message);
            toast.error(err.message || "Failed to generate poster");
        } finally {
            setIsGenerating(false);
            setLoadingStage('');
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
            const response = await fetchWithAuth(API_ENDPOINTS.POSTER.SAVE, {
                method: 'POST',
                body: JSON.stringify({
                    templateType: selectedTemplate,
                    formData,
                    status,
                    generatedImageUrl: generatedImage
                    ,posterStyle
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

    const handleDownload = async () => {
        if (!generatedImage) {
            toast.info("Please generate a poster first to download it.");
            return;
        }
        const node = document.getElementById('poster-export-node');
        if (!node) return;
        if (document.fonts?.ready) await document.fonts.ready;
        const images = Array.from(node.querySelectorAll('img'));
        await Promise.all(images.map((img) => {
            if (img.complete) return img.decode?.().catch(() => {}) || Promise.resolve();
            return new Promise((resolve) => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
            });
        }));
        const canvas = await html2canvas(node, {
            scale: 3,
            useCORS: true,
            allowTaint: false,
            backgroundColor: null,
            logging: false,
        });
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        const posterTitle = formData.eventTitle || formData.eventName ||
            formData.announcementTitle || formData.recruitmentTitle || 'Untitled Poster';
        a.download = `Poster: ${posterTitle} (By Nimbus).png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Poster download started!");
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
    return (
        <div className="tool-page">
            <div className="tool-container">

                {/* ── LEFT PANEL ── */}
                <div className="tool-panel tool-panel-left">
                    <div className="panel-inner">
                        <header className="tool-header">
                            <h2 className="tool-title">Poster Ideas</h2>
                            <p className="tool-subtitle">Fill the required fields to generate a poster</p>
                        </header>

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

                        <section className="tool-actions">
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

                        <div className="tool-footer-history">
                            <RecentActivity filterType="Posters" limit={3} title="Recent Posters" />
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="tool-panel tool-panel-right">
                    <div className="panel-inner">
                        <header className="tool-header space-between">
                            <h2 className="tool-title">Design Preview</h2>
                            {generatedImage && <span className="premium-badge">Ready to Export</span>}
                        </header>

                        <div className="tool-preview-container">

                            {/* Loading state */}
                            {isGenerating && (
                                <div className="tool-preview-loading">
                                    <div className="spinner"></div>
                                    <p>{loadingStage || 'Generating your poster...'}</p>
                                    <p className="loading-hint">This may take a moment</p>
                                </div>
                            )}

                            {/* Error state */}
                            {!isGenerating && error && (
                                <div className="tool-preview-error">
                                    <p>⚠️ {error}</p>
                                </div>
                            )}

                            {/* ── Poster Preview ── */}
                            {!isGenerating && generatedImage && posterStyle && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', overflow: 'auto', borderRadius: '12px', paddingBottom: '10px' }}>
                                        <div style={{ flexShrink: 0, width: '600px' }}>
                                            <PosterCompositor
                                                skeletonId={posterStyle.skeleton}
                                                backgroundId={posterStyle.background}
                                                frameId={posterStyle.frame}
                                                decorationId={posterStyle.decoration}
                                                paletteId={posterStyle.paletteId}
                                                data={normalizeFormData(selectedTemplate, formData)}
                                                aiBackgroundImage={generatedImage}
                                            />
                                        </div>
                                    </div>

                                    {/* Action buttons below poster */}
                                    <div className="tool-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <button className="tool-btn-secondary" onClick={() => handleSave('draft')} disabled={isSaving}>
                                            <FiFileText /> {isSaving ? 'Saving...' : 'Save Draft'}
                                        </button>
                                        <button className="tool-btn-primary" onClick={() => handleSave('final')} disabled={isSaving}>
                                            <FiCheckCircle /> {isSaving ? 'Saving...' : 'Finalise'}
                                        </button>
                                        <button className="tool-btn-generate" onClick={handleDownload}>
                                            Download
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Empty state */}
                            {!isGenerating && !generatedImage && !error && (
                                <div className="tool-preview-empty">
                                    <p>  Fill in the details and click Generate to create your poster.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PosterGenerator;
