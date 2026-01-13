import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchWithAuth, API_ENDPOINTS } from '../../api/config';
import { toast } from '../../utils/toast';
import { FiCheckCircle, FiFileText } from 'react-icons/fi';
import { useHistory } from '../../context/HistoryContext';
import RecentActivity from '../common/RecentActivity';
import './tools.css';

const CATEGORIES = [
    'Club', 'Event', 'Startup', 'Tech', 'Academic', 'Cultural', 'Business'
];

const STYLES = [
    { id: 'minimal', name: 'Minimal', icon: '✨' },
    { id: 'modern', name: 'Modern', icon: '🚀' },
    { id: 'bold', name: 'Bold', icon: '💪' },
    { id: 'professional', name: 'Professional', icon: '💼' },
    { id: 'playful', name: 'Playful', icon: '🎈' }
];

const LogoGenerator = () => {
    const location = useLocation();
    const { refreshHistory } = useHistory();
    const [logoName, setLogoName] = useState('');
    const [formData, setFormData] = useState({
        tagline: '',
        category: 'Club',
        style: 'minimal',
        color: 'Auto',
        iconPreference: ''
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (location.state && location.state.logoData) {
            const { id, logoName: savedName, formData: savedFormData, generatedImageUrl } = location.state.logoData;
            if (savedName) setLogoName(savedName);
            if (savedFormData) setFormData(savedFormData);
            if (generatedImageUrl) setGeneratedImage(generatedImageUrl);
            toast.success("Logo loaded successfully");
        }
    }, [location.state]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStyleChange = (styleId) => {
        setFormData(prev => ({ ...prev, style: styleId }));
    };

    const handleGenerate = async () => {
        if (!logoName) {
            toast.warning("Logo/Brand name is required");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const response = await fetchWithAuth(API_ENDPOINTS.LOGO.GENERATE, {
                method: 'POST',
                body: JSON.stringify({
                    logoName,
                    ...formData
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success || !data.data?.image) {
                throw new Error(data.message || 'Failed to generate logo');
            }

            const imageUrl = data.data.image.url;
            setGeneratedImage(imageUrl);
            toast.success(data.message || "Logo generated successfully!");
        } catch (err) {
            setError(err.message);
            toast.error(err.message || "Failed to generate logo");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async (status = 'draft') => {
        if (!logoName) {
            setError(`Logo/Brand name is required to save as ${status}`);
            toast.warning(`Logo/Brand name is required to save as ${status}`);
            return;
        }

        if (status === 'final' && !generatedImage) {
            toast.info("Please generate a logo first to finalize it.");
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetchWithAuth(API_ENDPOINTS.LOGO.SAVE, {
                method: 'POST',
                body: JSON.stringify({
                    logoName,
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
            toast.success(data.message || (status === 'final' ? "Logo finalized and saved!" : "Draft saved!"));
        } catch (err) {
            setError(err.message);
            toast.error(err.message || `Failed to save ${status}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownload = () => {
        if (!generatedImage) {
            toast.info("Please generate a logo first to download it.");
            return;
        }

        // For Cloudinary, we can add fl_attachment to force download
        const downloadUrl = generatedImage.includes('cloudinary.com')
            ? generatedImage.replace('/upload/', '/upload/fl_attachment/')
            : generatedImage;

        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `Logo: ${logoName || 'Untitled'}(By Nimbus).png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Logo download started!");
    };

    return (
        <div className="tool-page">
            <div className="tool-container">
                <div className="tool-panel tool-panel-left">
                    <div className="panel-inner">
                        <header className="tool-header">
                            <h2 className="tool-title">Logo Designer</h2>
                            <p className="tool-subtitle">Define your brand details to generate a unique logo concept</p>
                        </header>

                        <div className="tool-form">
                            <section className="tool-form-section">
                                <h3>Identity</h3>
                                <div className="tool-form-group">
                                    <label>Logo / Brand Name<span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="logoName"
                                        value={logoName}
                                        onChange={(e) => setLogoName(e.target.value)}
                                        placeholder="e.g., Nimbus, Tech Club"
                                        required
                                    />
                                </div>

                                <div className="tool-form-group">
                                    <label>Tagline (Optional)</label>
                                    <input
                                        type="text"
                                        name="tagline"
                                        value={formData.tagline}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Innovation at its peak"
                                    />
                                </div>
                            </section>

                            <section className="tool-form-section">
                                <h3>Visual Language</h3>
                                <div className="tool-form-group">
                                    <label>Category</label>
                                    <select name="category" value={formData.category} onChange={handleInputChange}>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="tool-form-group">
                                    <label>Style Preference</label>
                                    <div className="tool-options-grid">
                                        {STYLES.map(style => (
                                            <div
                                                key={style.id}
                                                className={`tool-option-card ${formData.style === style.id ? 'active' : ''}`}
                                                onClick={() => handleStyleChange(style.id)}
                                            >
                                                <span className="style-icon">{style.icon}</span>
                                                <span className="style-name">{style.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="tool-form-group">
                                    <label>Color Palette</label>
                                    <select name="color" value={formData.color} onChange={handleInputChange}>
                                        <option value="Auto">Auto (AI decides)</option>
                                        <option value="Light / Pastel">Light / Pastel</option>
                                        <option value="Dark / Bold">Dark / Bold</option>
                                        <option value="Monochrome">Monochrome</option>
                                    </select>
                                </div>

                                <div className="tool-form-group">
                                    <label>Icon Concept (Optional)</label>
                                    <input
                                        type="text"
                                        name="iconPreference"
                                        value={formData.iconPreference}
                                        onChange={handleInputChange}
                                        placeholder="e.g., cloud, lightning, book"
                                    />
                                </div>
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
                                        <>✨ Generate Logo</>
                                    )}
                                </button>
                            </section>

                            <div className="tool-footer-history">
                                <RecentActivity filterType="Logos" limit={3} title="Recent Logos" />
                            </div>

                            {error && <div className="tool-status-msg tool-status-error">{error}</div>}
                        </div>
                    </div>
                </div>

                <div className="tool-panel tool-panel-right">
                    <div className="panel-inner">
                        <header className="tool-header space-between">
                            <h2 className="tool-title">Concept Preview</h2>
                            {generatedImage && <span className="premium-badge">Ready to Export</span>}
                        </header>

                        <div className="tool-preview-container">
                            {isGenerating ? (
                                <div className="tool-preview-loading">
                                    <div className="spinner"></div>
                                    <p>Generating your logo...</p>
                                    <p className="loading-hint">Dreaming up your brand identity</p>
                                </div>
                            ) : generatedImage ? (
                                <div className="preview-content">
                                    <img src={generatedImage} alt="Generated Logo" className="tool-preview-image" />
                                </div>
                            ) : (
                                <div className="tool-preview-placeholder">
                                    <div className="empty-icon-lg">🎯</div>
                                    <p>Define your brand identity on the left and hit generate to see your concept here</p>
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
                                <span>Export Logo (PNG)</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoGenerator;
