import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchWithAuth, API_ENDPOINTS } from '../../api/config';
import { toast } from '../../utils/toast';
import { FiCheckCircle, FiFileText } from 'react-icons/fi';
import { useHistory } from '../../context/HistoryContext';
import RecentActivity from '../common/RecentActivity';
import './tools.css';

import PosterOverlay, { getAccentColor } from './PosterOverlay';

const TEMPLATES = {
    academic: {
        name: 'Academic / Seminar',
        fields: [
            { id: 'eventLogo', label: 'Event Logo (Optional)', type: 'file' },
            { id: 'eventTitle', label: 'Event Title', type: 'text', required: true, placeholder: 'e.g., Research Symposium 2024' },
            { id: 'speakerName', label: 'Speaker Name', type: 'text', placeholder: 'e.g., Dr. John Smith' },
            { id: 'speakerDesignation', label: 'Speaker Designation', type: 'text', placeholder: 'e.g., Professor of Computer Science' },
            { id: 'department', label: 'Department / Organizer', type: 'text', placeholder: 'e.g., Department of Computer Science' },
            { id: 'date', label: 'Date', type: 'text', placeholder: 'e.g., January 15, 2025' },
            { id: 'time', label: 'Time', type: 'text', placeholder: 'e.g., 10:00 AM - 12:00 PM' },
            { id: 'venue', label: 'Venue', type: 'text', placeholder: 'e.g., Seminar Hall A' },
            { id: 'description', label: 'Short Description', type: 'textarea', placeholder: 'Brief description of the event...' }
        ]
    },
    recruitment: {
        name: 'Recruitment',
        fields: [
            { id: 'eventLogo', label: 'Event Logo (Optional)', type: 'file' },
            { id: 'recruitmentTitle', label: 'Recruitment Title', type: 'text', required: true, placeholder: 'e.g., Join Our Team!' },
            { id: 'teamName', label: 'Team / Organization Name', type: 'text', placeholder: 'e.g., Nimbus Tech Club' },
            { id: 'description', label: 'Description', type: 'textarea', placeholder: 'What the role entails...' },
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
            { id: 'description', label: 'Event Description', type: 'textarea', placeholder: 'What the event is about...' },
            { id: 'date', label: 'Date', type: 'text', placeholder: 'e.g., March 15-17, 2025' },
            { id: 'time', label: 'Time', type: 'text', placeholder: 'e.g., 9:00 AM onwards' },
            { id: 'venue', label: 'Venue', type: 'text', placeholder: 'e.g., Main Auditorium' },
            { id: 'organizer', label: 'Organizer / Club Name', type: 'text', placeholder: 'e.g., Society Council' },
            { id: 'highlights', label: 'Highlights', type: 'textarea', placeholder: 'e.g., Live performances, workshops, prizes' },
            { id: 'theme', label: 'Theme / Mood', type: 'select', options: ['Energetic', 'Fun', 'Cultural', 'Professional'] },
            { id: 'colorPreference', label: 'Color Preference', type: 'select', options: ['Vibrant', 'Cool Blues', 'Warm Oranges', 'Modern Purple'] }
        ]
    },
    hackathon: {
        name: 'Hackathon / Tech',
        fields: [
            { id: 'eventLogo', label: 'Event Logo (Optional)', type: 'file' },
            { id: 'eventName', label: 'Event Name', type: 'text', required: true, placeholder: 'e.g., CodeSprint 2025' },
            { id: 'hackathonTheme', label: 'Hackathon Theme', type: 'text', placeholder: 'e.g., AI for Social Good' },
            { id: 'description', label: 'Description', type: 'textarea', placeholder: 'What participants will build...' },
            { id: 'dateDuration', label: 'Date & Duration', type: 'text', placeholder: 'e.g., Feb 10-12, 48 hours' },
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
            { id: 'details', label: 'Announcement Details', type: 'textarea', placeholder: 'Full details of the announcement...' },
            { id: 'applicableTo', label: 'Applicable To', type: 'text', placeholder: 'e.g., All students and faculty' },
            { id: 'importantDates', label: 'Important Dates', type: 'text', placeholder: 'e.g., Effective from Jan 1, 2025' },
            { id: 'issuedBy', label: 'Issued By', type: 'text', placeholder: 'e.g., Office of Administration' }
        ]
    }
};

// ─── Default fallback style when Gemini is unavailable ───────────────────────
const buildFallbackStyle = (displayTitle, displayCategory) => {
    const accent = getAccentColor(displayTitle, displayCategory);
    return {
        primaryColor: accent.primary,
        secondaryColor: accent.secondary,
        gradientStart: "#0A0A2E",
        gradientEnd: "#1A1A4E",
        accentColor: "#A78BFA",
        textColor: "#FFFFFF",
        titleFont: "Bebas Neue",
        titleAlignment: "center",
        titleVerticalZone: "middle",
        titleSize: "massive",
        letterSpacing: "4px",
        titleStyle: "uppercase",
        layoutPersonality: "bold",
        infoStyle: "pills-row",
        dividerStyle: "gradient-line",
        descriptionStyle: "bold-centered",
        logoLayout: "top-split"
    };
};

// ─── Info pill shared styles ──────────────────────────────────────────────────
const pillStyle = (primaryColor) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    background: 'rgba(0,0,0,0.5)',
    border: `1px solid ${primaryColor}40`,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '14px',
    padding: '10px 8px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
    color: '#fff'
});

const stackedItemStyle = (primaryColor) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    borderLeft: `3px solid ${primaryColor}`,
    borderRadius: '0 10px 10px 0',
    padding: '6px 14px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: '0.85rem',
    color: '#fff'
});

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
            const { templateType, formData: savedFormData, generatedImageUrl } = location.state.posterData;
            if (templateType) setSelectedTemplate(templateType);
            if (savedFormData) setFormData(savedFormData);
            if (generatedImageUrl) setGeneratedImage(generatedImageUrl);
            toast.success("Poster loaded successfully");
        }
    }, [location.state]);

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
                    formData
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

            // ── FIX: set posterStyle from Gemini response or fall back ──
            if (data.data?.style) {
                setPosterStyle(data.data.style);
            } else {
                const title = formData.eventTitle || formData.eventName ||
                    formData.announcementTitle || formData.recruitmentTitle || '';
                setPosterStyle(buildFallbackStyle(title, selectedTemplate));
            }

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

    const handleDownload = () => {
        if (!generatedImage) {
            toast.info("Please generate a poster first to download it.");
            return;
        }
        const downloadUrl = generatedImage.includes('cloudinary.com')
            ? generatedImage.replace('/upload/', '/upload/fl_attachment/')
            : generatedImage;
        const a = document.createElement('a');
        a.href = downloadUrl;
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

    // ── Derived display values ────────────────────────────────────────────────
    const displayCategory = selectedTemplate || '';
    const displayTitle = formData.eventTitle || formData.eventName || formData.announcementTitle || formData.recruitmentTitle || '';
    const displayDate = formData.date || formData.dateDuration || formData.deadline || formData.importantDates || '';
    const displayTime = formData.time || '';
    const displayVenue = formData.venue || formData.venueMode || '';
    const displayDescription = formData.description || formData.details || formData.highlights || formData.tagline || '';
    const displayOrganizer = formData.department || formData.teamName || formData.organizer || formData.issuedBy || '';



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
                                    <PosterOverlay
                                        generatedImage={generatedImage}
                                        posterStyle={posterStyle}
                                        formData={formData}
                                        displayOrganizer={displayOrganizer}
                                        displayTitle={displayTitle}
                                        displayDescription={displayDescription}
                                        displayDate={displayDate}
                                        displayTime={displayTime}
                                        displayVenue={displayVenue}
                                    />

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
