import React, { useState } from 'react';

/**
 * Shared utilities for the poster template engine.
 *
 * Handles: responsive text sizing, font loading, logo rendering,
 * QR code rendering, speaker photo rendering, and text utilities.
 */

// ─── Responsive Title Sizing ──────────────────────────────────────────────────
export const getResponsiveTitleSize = (length) => {
    if (!length) return '3.2rem';
    if (length > 50) return '1.4rem';
    if (length > 40) return '1.7rem';
    if (length > 30) return '2rem';
    if (length > 22) return '2.5rem';
    if (length > 15) return '3rem';
    if (length > 10) return '3.5rem';
    return '4rem';
};

// Same but for split layouts where title area is narrower
export const getResponsiveTitleSizeCompact = (length) => {
    if (!length) return '2.4rem';
    if (length > 50) return '1.1rem';
    if (length > 40) return '1.3rem';
    if (length > 30) return '1.55rem';
    if (length > 22) return '1.8rem';
    if (length > 15) return '2.2rem';
    if (length > 10) return '2.6rem';
    return '3rem';
};

// ─── Smart Description Clamping ───────────────────────────────────────────────
export const clampStyle = (maxLines = 4) => ({
    display: '-webkit-box',
    WebkitLineClamp: maxLines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
});

// ─── Font Loading ─────────────────────────────────────────────────────────────
const loadedFonts = new Set();
export const loadGoogleFont = (fontName, weights = '400;600;700;800;900') => {
    if (!fontName || loadedFonts.has(fontName)) return;
    loadedFonts.add(fontName);

    const encoded = fontName.replace(/\s+/g, '+');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@${weights}&display=swap`;
    document.head.appendChild(link);
};

export const loadFonts = (fontNames = []) => {
    fontNames.forEach(f => loadGoogleFont(f));
};

// ─── Logo Rendering ───────────────────────────────────────────────────────────
const logoImgStyle = (h = '40px', extra = {}) => ({
    height: h,
    width: 'auto',
    maxWidth: '110px',
    objectFit: 'contain',
    ...extra,
});

/**
 * Render the logo bar:
 *   Left group: CSES logo + optional collegeLogo (side by side)
 *   Right:      optional eventBrandLogo (e.g. society branding / event identity)
 *
 * IMPORTANT: CSES logo is white-on-transparent PNG, so we give it a subtle dark
 * pill background to ensure visibility on ANY poster palette (light or dark).
 *
 * @param {string|null} collegeLogo  - Additional org logo for top-left
 * @param {string|null} eventBrandLogo - Event/society brand logo for top-right
 * @param {object} logoStyle - Extra styles applied to each img
 * @param {object} containerStyle - Extra styles for the container div
 */
const RenderLogos = ({ collegeLogo, eventBrandLogo, logoStyle = {}, containerStyle = {} }) => {
    const [position, setPosition] = useState(() => localStorage.getItem('nimbus-logo-position') || 'left');
    const [hover, setHover] = useState(false);
    return <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
        display: 'flex',
        justifyContent: position === 'right' ? 'flex-end' : 'flex-start',
        alignItems: 'center',
        width: '100%',
        ...containerStyle,
        transition: 'all .2s ease',
        '--logo-position': position,
        zIndex: 9999,
    }}>
        <div className="logo-position-picker" onMouseEnter={() => setHover(true)} style={{ position: 'absolute', top: '2px', left: '50%', transform: 'translateX(-50%)', display: hover ? 'flex' : 'none', gap: 4, zIndex: 30, padding: 3, borderRadius: 6, background: 'rgba(8,15,35,.92)', boxShadow: '0 3px 12px #0007' }}>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { localStorage.setItem('nimbus-logo-position', 'left'); setPosition('left'); }} style={{ cursor: 'pointer', fontSize: 9, fontWeight: 700, padding: '3px 7px', border: 0, borderRadius: 4, background: position === 'left' ? '#fff' : '#334155', color: position === 'left' ? '#111827' : '#fff' }}>← Left</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { localStorage.setItem('nimbus-logo-position', 'right'); setPosition('right'); }} style={{ cursor: 'pointer', fontSize: 9, fontWeight: 700, padding: '3px 7px', border: 0, borderRadius: 4, background: position === 'right' ? '#fff' : '#334155', color: position === 'right' ? '#111827' : '#fff' }}>Right →</button>
        </div>
        {/* Left group: CSES + optional college logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* CSES logo with always-visible contrast pill */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent',
                borderRadius: '0',
                padding: '0',
                marginRight: '-30px',
                marginLeft: '-50px',
                backdropFilter: 'blur(4px)',
                border: '0',
            }}>
                <img
                    src="/assets/cses-logo.png"
                    alt="CSES"
                    style={{
                        height: '34px', width: 'auto', maxWidth: '90px',
                        objectFit: 'contain',
                        filter: 'brightness(0) invert(1) drop-shadow(0 0 3px rgba(255,255,255,0.6))',
                        ...logoStyle,
                    }}
                    onError={(e) => {
                        // Fallback: show text badge if image fails
                        e.target.replaceWith(Object.assign(document.createElement('span'), {
                            textContent: 'CSES',
                            style: 'font-size:0.65rem;font-weight:800;color:#fff;letter-spacing:1px;',
                        }));
                    }}
                />
            </div>
            {collegeLogo && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.10)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                }}>
                    <img
                        src={collegeLogo}
                        alt="Logo"
                        style={{ height: '34px', width: 'auto', maxWidth: '80px', objectFit: 'contain', ...logoStyle }}
                        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                    />
                </div>
            )}
        </div>

        {/* Right: Event brand / society logo */}
        {eventBrandLogo && (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.10)',
                borderRadius: '8px',
                padding: '4px 8px',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.15)',
            }}>
                <img
                    src={eventBrandLogo}
                    alt="Event"
                    style={{ height: '34px', width: 'auto', maxWidth: '80px', objectFit: 'contain', ...logoStyle }}
                    onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                />
            </div>
        )}
    </div>;
};

export const renderLogos = (collegeLogo, eventBrandLogo, logoStyle = {}, containerStyle = {}) => (
    <RenderLogos collegeLogo={collegeLogo} eventBrandLogo={eventBrandLogo} logoStyle={logoStyle} containerStyle={containerStyle} />
);

/**
 * Render QR code(s) at the bottom of a poster.
 * Supports 1 or 2 QR images, each with an optional label.
 *
 * @param {object|null} qr1 - { image: base64, label: string }
 * @param {object|null} qr2 - { image: base64, label: string }
 * @param {object} palette  - Poster palette for styling
 */
export const renderQrCodes = (qr1, qr2, palette = {}, placement = {}) => {
    if (!qr1 && !qr2) return null;

    const QrBlock = ({ qr }) => (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
        }}>
            <div style={{
                padding: '6px',
                background: '#ffffff',
                borderRadius: '6px',
                boxShadow: `0 2px 10px ${palette.primary || '#000'}30`,
                lineHeight: 0,
            }}>
                <img
                    src={qr.image}
                    alt="QR"
                    style={{ width: '144px', height: '144px', objectFit: 'contain', display: 'block' }}
                    onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                />
            </div>
            {qr.label && (
                <div style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: palette.muted || palette.text || '#ccc',
                    textAlign: 'center',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                }}>
                    {qr.label}
                </div>
            )}
        </div>
    );

    return (
        <div style={{
            position: 'absolute',
            right: '18px',
            bottom: '16px',
            zIndex: 50,
            display: 'flex',
            gap: '20px',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            transform: 'scale(0.5)',
            transformOrigin: 'bottom right',
            width: 'max-content',
            ...placement,
            ...(placement.scale ? {
                transform: `scale(${placement.scale})`,
                transformOrigin: placement.transformOrigin || 'bottom right',
            } : {}),
        }}>
            {qr1 && <QrBlock qr={qr1} />}
            {qr2 && <QrBlock qr={qr2} />}
        </div>
    );
};

/**
 * Render speaker photo as a circle avatar.
 * Used in non-split-panel layouts.
 *
 * @param {string|null} speakerPhoto - base64 image
 * @param {object} palette - Poster palette
 * @param {number} size - Avatar size in px (default 70)
 */
const SpeakerAvatar = ({ speakerPhoto, palette = {}, size = 222 }) => {
    const [shape, setShape] = useState(() => localStorage.getItem('nimbus-speaker-shape') || 'Circle');
    const [hover, setHover] = useState(false);
     if (!speakerPhoto || speakerPhoto === 'null' || speakerPhoto === 'undefined' || speakerPhoto === '') {
        return null;
    }
    const clipPath = shape === 'Diamond' ? 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)' : shape === 'Square' ? 'none' : shape === 'Hexagon' ? 'polygon(25% 6%,75% 6%,100% 50%,75% 94%,25% 94%,0% 50%)' : 'circle(50% at 50% 50%)';
    return (
        <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
            position: 'relative',
            zIndex: 20,
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: shape === 'Circle' ? '50%' : shape === 'Diamond' ? '0' : shape === 'Hexagon' ? '12%' : '0',
            overflow: 'visible',
            // A rectangular border/glow leaks behind Diamond/Hexagon. Their
            // SVG guide below is the actual boundary, so only Circle/Square
            // use the wrapper border and glow.
            border: (shape === 'Circle' || shape === 'Square')
                ? `2px solid ${palette.primary || '#fff'}60`
                : '2px solid transparent',
            boxShadow: (shape === 'Circle' || shape === 'Square')
                ? `0 0 16px ${palette.primary || '#fff'}40`
                : 'none',
            flexShrink: 0,
            lineHeight: 0,
        }}>
            <div
    aria-hidden="true"
    style={{
        position: 'absolute',
                // Keep the guide exactly on the same bounds as the clipped photo.
                inset: '-4px',
        pointerEvents: 'none',
        zIndex: 1,
    }}
>
    {shape === 'Circle' ? (
        <div
            style={{
                width: '100%',
                height: '100%',
                border: '2px dashed rgba(255,255,255,0.95)',
                borderRadius: '50%',
                boxSizing: 'border-box',
            }}
        />
    ) : shape === 'Square' ? (
        <div
            style={{
                width: '100%',
                height: '100%',
                border: '2px dashed rgba(255,255,255,0.95)',
                boxSizing: 'border-box',
            }}
        />
    ) : shape === 'Diamond' ? (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            style={{
                display: 'block',
                overflow: 'visible',
                filter: `drop-shadow(0 0 16px ${palette.primary || '#fff'}40)`,
            }}
        >
            <polygon
                points="50,0 100,50 50,100 0,50"
                fill="none"
                stroke="rgba(255,255,255,0.95)"
                strokeWidth="2"
                strokeDasharray="5 4"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    ) : (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            style={{
                display: 'block',
                overflow: 'visible',
                filter: `drop-shadow(0 0 16px ${palette.primary || '#fff'}40)`,
            }}
        >
            <polygon
                points="25,6 75,6 100,50 75,94 25,94 0,50"
                fill="none"
                stroke="rgba(255,255,255,0.95)"
                strokeWidth="2"
                strokeDasharray="5 4"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    )}
</div>
            {hover && <div style={{ position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)', zIndex: 99999, display: 'flex', gap: 2, background: '#081126ee', padding: 3, borderRadius: 5 }}>{['Circle','Diamond','Square','Hexagon'].map(s => <button key={s} type="button" onClick={() => { localStorage.setItem('nimbus-speaker-shape', s); setShape(s); }} style={{ fontSize: 8, padding: '3px 5px' }}>{s}</button>)}</div>}
            <img
                src={speakerPhoto}
                alt="Speaker"
                style={{
                    width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center',
                    clipPath, borderRadius: shape === 'Circle' ? '50%' : 0,
                    // For non-rectangular shapes the glow follows the clipped
                    // pixels instead of producing a rectangular shadow.
                    filter: (shape === 'Diamond' || shape === 'Hexagon')
                        ? `drop-shadow(0 0 16px ${palette.primary || '#fff'}c0)`
                        : 'none',
                    position: 'relative',
                    zIndex: 2,
                }}
                onError={(e) => { e.target.parentElement.style.display = 'none'; }}
            />
        </div>
    );
};

export const renderSpeakerAvatar = (speakerPhoto, palette = {}, size = 222) => (
    <SpeakerAvatar speakerPhoto={speakerPhoto} palette={palette} size={size} />
);

// ─── Text Utilities ───────────────────────────────────────────────────────────
export const truncate = (text, maxLen = 120) => {
    if (!text || text.length <= maxLen) return text;
    return text.substring(0, maxLen).trim() + '…';
};

export const splitToBullets = (text) => {
    if (!text) return [];
    return text
        .split(/[,;\n]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
};


