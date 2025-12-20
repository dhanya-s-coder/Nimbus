import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useHistory } from '../../../context/HistoryContext';
import { toast } from '../../../utils/toast';
import Header from '../../common/Header';
import './LogoIdeas.css';

const LogoIdeas = () => {
  const { user, logout, role } = useAuth();
  const { historyItems } = useHistory();
  const navigate = useNavigate();

  // Get recent logos
  const recentLogos = historyItems.filter(item => item.type === 'logo').slice(0, 3);

  // Form State
  const [brandName, setBrandName] = useState("");
  const [style, setStyle] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#4C6FFF");
  const [iconSymbol, setIconSymbol] = useState("");
  const [notes, setNotes] = useState("");

  // Selected Concept State (for detail view)
  const [selectedConcept, setSelectedConcept] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleGenerate = () => {
    if (!brandName) {
      toast.warning("Please enter a brand name.");
      return;
    }
    toast.info(`Generating logo concepts for "${brandName}"...`);
  };

  // Dummy Concepts Data
  const concepts = [
    { id: 1, name: "Concept 1", color: "#F3F6FF" },
    { id: 2, name: "Concept 2", color: "#FFF7ED" },
    { id: 3, name: "Concept 3", color: "#F1FFF5" },
  ];

  return (
    <div className="logo-page">
      <Header title="Logo Ideas" />

      {/* MAIN AREA */}
      <main className="main">


        <div className="page-header-content">
          <h3 className="page-title">Generate Logo Concepts</h3>
          <p className="page-subtitle">Enter your project/club name and style preferences — get multiple concepts.</p>
        </div>

        {/* INPUT PANEL */}
        <div className="card form-card">
          <label>Name (Brand / Club / Project)</label>
          <input
            className="input"
            placeholder="e.g., AI Club, Tech Society"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />

          <div className="row input-row">
            <div className="col" style={{ flex: 1.5 }}>
              <label>Style</label>
              <select
                className="input"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                <option value="">Select style...</option>
                <option value="Modern">Modern</option>
                <option value="Classic">Classic</option>
                <option value="Playful">Playful</option>
                <option value="Minimalist">Minimalist</option>
              </select>
            </div>
            <div className="col" style={{ flex: 1 }}>
              <label>Primary Color</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  className="color-picker"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
                <span className="color-label">Click to pick</span>
              </div>
            </div>
            <div className="col" style={{ flex: 1.5 }}>
              <label>Icon / Symbol</label>
              <input
                className="input"
                placeholder="e.g., AI, Book, Flame"
                value={iconSymbol}
                onChange={(e) => setIconSymbol(e.target.value)}
              />
            </div>
          </div>

          <label>Additional notes (optional)</label>
          <textarea
            className="textarea small-textarea"
            placeholder="Tone, usage (web, print), must-include text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button className="generate-btn center-btn" onClick={handleGenerate}>
          Generate Logos
        </button>

        {/* OUTPUT / PREVIEWS */}
        <h3 className="section-head">Generated Concepts</h3>
        <p className="section-sub">Click a concept to view details, edit text, or download.</p>

        <div className="concepts-grid">
          {concepts.map((concept) => (
            <div key={concept.id} className="card concept-card" onClick={() => setSelectedConcept(concept)}>
              <div className="concept-preview" style={{ backgroundColor: concept.color }}>
                {/* Placeholder Shape */}
              </div>
              <div className="concept-name">{concept.name}</div>
              <div className="concept-actions">
                <span>Download • Edit</span>
              </div>
            </div>
          ))}
        </div>

        {/* SELECTED CONCEPT DETAIL */}
        <h3 className="section-head">Selected Concept</h3>
        <div className="card detail-card">
          <div className="detail-info">
            <span className="info-label">Preview (editable text & colors)</span>
            {selectedConcept ? (
              <div>Selected: {selectedConcept.name}</div>
            ) : (
              <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>Select a concept above to edit</div>
            )}
          </div>
          <div className="detail-preview-box">
            Preview Box
          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="action-row">
          <button className="btn primary">Download PNG</button>
          <button className="btn">Download SVG</button>
          <button className="btn">Save to History</button>
        </div>

      </main>

      {/* RIGHT PANEL */}
      <aside className="right-panel">
        <h3 className="rp-title">Recent Logos</h3>

        {recentLogos.length > 0 ? (
          recentLogos.map(item => (
            <div key={item.id} className="card small-card">
              <div className="item-title">{item.title}</div>
              <div className="item-sub">{item.status || 'Saved'}</div>
            </div>
          ))
        ) : (
          <div className="card small-card" style={{ cursor: 'default' }}>
            <div className="item-sub">No recent logos</div>
          </div>
        )}

        <h3 className="rp-title">Logo Templates</h3>
        <div className="card small-card">
          <div className="item-title">Minimal Mark</div>
        </div>
        <div className="card small-card">
          <div className="item-title">Badge Style</div>
        </div>
      </aside>
    </div>
  );
};

export default LogoIdeas;
