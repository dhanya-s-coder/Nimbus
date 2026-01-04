import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchWithAuth, API_ENDPOINTS } from '../../api/config';
import { toast } from '../../utils/toast';
import { FiCheckCircle, FiFileText } from 'react-icons/fi';
import { useHistory } from '../../context/HistoryContext';
import RecentActivity from '../common/RecentActivity';
import './tools.css';

const TEMPLATES = {
    academic: {
        name: 'Academic / Seminar',
        fields: [
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
            { id: 'announcementTitle', label: 'Announcement Title', type: 'text', required: true, placeholder: 'e.g., Campus Closure Notice' },
            { id: 'details', label: 'Announcement Details', type: 'textarea', placeholder: 'Full details of the announcement...' },
            { id: 'applicableTo', label: 'Applicable To', type: 'text', placeholder: 'e.g., All students and faculty' },
            { id: 'importantDates', label: 'Important Dates', type: 'text', placeholder: 'e.g., Effective from Jan 1, 2025' },
            { id: 'issuedBy', label: 'Issued By', type: 'text', placeholder: 'e.g., Office of Administration' }
        ]
    }
};

const PosterGenerator = () => {
    const location = useLocation();
    const { refreshHistory } = useHistory();
    const [selectedTemplate, setSelectedTemplate] = useState('academic');
    const [formData, setFormData] = useState({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (location.state && location.state.posterData) {
            const { id, templateType, formData: savedFormData, generatedImageUrl } = location.state.posterData;
            if (templateType) setSelectedTemplate(templateType);
            if (savedFormData) setFormData(savedFormData);
            if (generatedImageUrl) setGeneratedImage(generatedImageUrl);
        }
    }, [location.state]);

    const currentTemplate = TEMPLATES[selectedTemplate];

    const handleTemplateChange = (templateId) => {
        setSelectedTemplate(templateId);
        setFormData({});
        setGeneratedImage(null);
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

        try {
            const response = await fetchWithAuth(API_ENDPOINTS.POSTER.GENERATE, {
                method: 'POST',
                body: JSON.stringify({
                    templateType: selectedTemplate,
                    formData
                })
            });

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

            const imageUrl = data.data.image.url;
            setGeneratedImage(imageUrl);
            toast.success(data.message || "Poster generated successfully!");
        } catch (err) {
            setError(err.message);
            toast.error(err.message || "Failed to generate poster");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async (status = 'draft') => {
        if (!isFormValid()) {
            toast.warning(`Please fill in required fields to save this ${status}.`);
            return;
        }

        if (status === 'final' && !generatedImage) {
            toast.info("Please generate a poster first to finalize it.");
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
            toast.success(data.message || (status === 'final' ? "Poster finalized and saved!" : "Draft saved!"));
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

        // For Cloudinary, we can add fl_attachment to force download
        const downloadUrl = generatedImage.includes('cloudinary.com')
            ? generatedImage.replace('/upload/', '/upload/fl_attachment/')
            : generatedImage;

        const a = document.createElement('a');
        a.href = downloadUrl;
        const posterTitle = formData.eventTitle || formData.eventName || formData.announcementTitle || formData.recruitmentTitle || 'Untitled Poster';
        a.download = `Poster: ${posterTitle}(By Nimbus).png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Poster download started!");
    };

    const renderField = (field) => {
        const value = formData[field.id] || '';

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

    return (
        <div className="tool-page">
            <div className="tool-container">
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
                                    <span className="loading-dots">Generating<span>.</span><span>.</span><span>.</span></span>
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

                <div className="tool-panel tool-panel-right">
                    <div className="panel-inner">
                        <header className="tool-header space-between">
                            <h2 className="tool-title">Design Preview</h2>
                            {generatedImage && <span className="premium-badge">Ready to Export</span>}
                        </header>

                        <div className="tool-preview-container">
                            {isGenerating ? (
                                <div className="tool-preview-loading">
                                    <div className="spinner"></div>
                                    <p>Generating your poster...</p>
                                    <p className="loading-hint">This may take a moment</p>
                                </div>
                            ) : generatedImage ? (
                                <div className="preview-content">
                                    <img
                                        src={generatedImage}
                                        alt="Generated Poster"
                                        className="tool-preview-image"
                                    />
                                </div>
                            ) : (
                                <div className="tool-preview-placeholder">
                                    <div className="empty-icon-lg">🎨</div>
                                    <p>Fill in the details and click "Generate Poster" to see your design here</p>
                                </div>
                            )}

                            {error && (
                                <div className="tool-status-msg tool-status-error">
                                    <p>{error}</p>
                                    <button onClick={handleGenerate} className="btn-retry" style={{ background: 'none', border: '1px solid currentColor', padding: '4px 10px', borderRadius: '4px', marginTop: '10px', cursor: 'pointer' }}>
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="tool-preview-actions">
                            <button className="tool-btn-secondary" onClick={() => handleSave('draft')} disabled={isSaving}>
                                <FiFileText /> <span>{isSaving ? '...' : 'Save Draft'}</span>
                            </button>
                            <button className="tool-btn-secondary" onClick={() => handleSave('final')} disabled={isSaving}>
                                <FiCheckCircle /> <span>{isSaving ? '...' : 'Finalize'}</span>
                            </button>
                            <button className="tool-btn-final" onClick={handleDownload}>
                                <span>Export Design (PNG)</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PosterGenerator;
