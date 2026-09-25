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
export const renderLogos = (collegeLogo, eventBrandLogo, logoStyle = {}, containerStyle = {}) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        ...containerStyle,
    }}>
        {/* Left group: CSES + optional college logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* CSES logo with always-visible contrast pill */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.12)',
                borderRadius: '8px',
                padding: '4px 8px',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.18)',
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
    </div>
);

/**
 * Render QR code(s) at the bottom of a poster.
 * Supports 1 or 2 QR images, each with an optional label.
 *
 * @param {object|null} qr1 - { image: base64, label: string }
 * @param {object|null} qr2 - { image: base64, label: string }
 * @param {object} palette  - Poster palette for styling
 */
export const renderQrCodes = (qr1, qr2, palette = {}) => {
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
                    style={{ width: '72px', height: '72px', objectFit: 'contain', display: 'block' }}
                    onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                />
            </div>
            {qr.label && (
                <div style={{
                    fontSize: '0.48rem',
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
            display: 'flex',
            gap: '20px',
            justifyContent: (qr1 && qr2) ? 'space-between' : 'center',
            alignItems: 'flex-end',
            marginTop: '10px',
            width: '100%',
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
export const renderSpeakerAvatar = (speakerPhoto, palette = {}, size = 70) => {
    if (!speakerPhoto) return null;
    return (
        <div style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            overflow: 'hidden',
            border: `2px solid ${palette.primary || '#fff'}60`,
            boxShadow: `0 0 16px ${palette.primary || '#fff'}40`,
            flexShrink: 0,
            lineHeight: 0,
        }}>
            <img
                src={speakerPhoto}
                alt="Speaker"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                onError={(e) => { e.target.parentElement.style.display = 'none'; }}
            />
        </div>
    );
};

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
