import React from 'react';

/**
 * Decorative elements — these must be VISIBLE and impactful.
 * They create atmosphere and visual richness — the difference between
 * "plain slide" and "designed poster".
 */

const decoBase = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1,
    overflow: 'hidden',
};

export const DecoGlowOrbs = ({ palette }) => (
    <div style={decoBase}>
        <div style={{
            position: 'absolute',
            top: '-40px', right: '-30px',
            width: '280px', height: '220px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${palette.primary}28 0%, transparent 68%)`,
            filter: 'blur(28px)',
        }} />
        <div style={{
            position: 'absolute',
            bottom: '-50px', left: '-40px',
            width: '240px', height: '180px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${palette.secondary}16 0%, transparent 70%)`,
            filter: 'blur(32px)',
        }} />
    </div>
);

// ─── 2. Geometric Shapes ──────────────────────────────────────────────────────
// Bold geometric elements that add modern visual interest.
export const DecoGeometricShapes = ({ palette }) => (
    <div style={decoBase}>
        {/* Top-right: Large rotated square outline */}
        <div style={{
            position: 'absolute',
            top: '20px', right: '20px',
            width: '120px', height: '120px',
            border: `1.5px solid ${palette.primary}40`,
            transform: 'rotate(15deg)',
            borderRadius: '4px',
        }} />
        {/* Top-right: Smaller nested square */}
        <div style={{
            position: 'absolute',
            top: '45px', right: '45px',
            width: '70px', height: '70px',
            border: `1px solid ${palette.secondary}30`,
            transform: 'rotate(30deg)',
            borderRadius: '2px',
        }} />
        {/* Bottom-left: Circle outline */}
        <div style={{
            position: 'absolute',
            bottom: '50px', left: '20px',
            width: '80px', height: '80px',
            borderRadius: '50%',
            border: `1.5px solid ${palette.secondary}35`,
        }} />
        {/* Bottom-left: Smaller circle */}
        <div style={{
            position: 'absolute',
            bottom: '65px', left: '35px',
            width: '50px', height: '50px',
            borderRadius: '50%',
            border: `1px solid ${palette.accent}25`,
        }} />
        {/* Mid-right: Diamond accent */}
        <div style={{
            position: 'absolute',
            top: '50%', right: '15px',
            width: '24px', height: '24px',
            border: `1.5px solid ${palette.accent}40`,
            transform: 'rotate(45deg)',
        }} />
        {/* Top-left: Dot cluster */}
        <div style={{
            position: 'absolute',
            top: '90px', left: '20px',
            display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
            <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: `${palette.primary}50` }} />
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: `${palette.secondary}40` }} />
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: `${palette.accent}35` }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', paddingLeft: '4px' }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: `${palette.primary}35` }} />
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: `${palette.secondary}30` }} />
            </div>
        </div>
        {/* Bottom-right: Thin accent lines */}
        <div style={{
            position: 'absolute',
            bottom: '30px', right: '25px',
            width: '60px', height: '1px',
            background: `linear-gradient(90deg, transparent, ${palette.primary}50)`,
        }} />
        <div style={{
            position: 'absolute',
            bottom: '38px', right: '35px',
            width: '40px', height: '1px',
            background: `linear-gradient(90deg, transparent, ${palette.secondary}40)`,
        }} />
    </div>
);

// ─── 3. Corner Accents ────────────────────────────────────────────────────────
// Elegant arc accents in corners with gradient fills.
export const DecoCornerAccents = ({ palette }) => (
    <div style={decoBase}>
        {/* Top-right corner arc */}
        <svg style={{ position: 'absolute', top: 0, right: 0, width: '160px', height: '160px' }}>
            <path d="M160 0 A160 160 0 0 1 0 160" fill="none" stroke={palette.primary} strokeWidth="1.5" opacity="0.25" />
            <path d="M160 0 A120 120 0 0 1 40 160" fill="none" stroke={palette.secondary} strokeWidth="1" opacity="0.18" />
            <path d="M160 0 A80 80 0 0 1 80 160" fill="none" stroke={palette.accent} strokeWidth="0.8" opacity="0.12" />
        </svg>
        {/* Bottom-left corner arc */}
        <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '160px', height: '160px', transform: 'rotate(180deg)' }}>
            <path d="M160 0 A160 160 0 0 1 0 160" fill="none" stroke={palette.primary} strokeWidth="1.5" opacity="0.25" />
            <path d="M160 0 A120 120 0 0 1 40 160" fill="none" stroke={palette.secondary} strokeWidth="1" opacity="0.18" />
            <path d="M160 0 A80 80 0 0 1 80 160" fill="none" stroke={palette.accent} strokeWidth="0.8" opacity="0.12" />
        </svg>
        {/* Top-left: small accent dot */}
        <div style={{
            position: 'absolute', top: '15px', left: '15px',
            width: '8px', height: '8px', borderRadius: '50%',
            background: `${palette.primary}30`,
        }} />
        {/* Bottom-right: small accent dot */}
        <div style={{
            position: 'absolute', bottom: '15px', right: '15px',
            width: '8px', height: '8px', borderRadius: '50%',
            background: `${palette.secondary}30`,
        }} />
    </div>
);

// ─── 4. Accent Lines ──────────────────────────────────────────────────────────
// Bold accent lines that add structure and modern feel.
export const DecoAccentLines = ({ palette }) => (
    <div style={decoBase}>
        {/* Top accent lines */}
        <div style={{
            position: 'absolute', top: '28px', left: '28px', right: '28px',
            height: '1.5px',
            background: `linear-gradient(90deg, ${palette.primary}45, ${palette.secondary}30, transparent 70%)`,
        }} />
        <div style={{
            position: 'absolute', top: '34px', left: '28px', width: '35%',
            height: '1px',
            background: `linear-gradient(90deg, ${palette.secondary}30, transparent)`,
        }} />
        {/* Bottom accent lines */}
        <div style={{
            position: 'absolute', bottom: '28px', left: '28px', right: '28px',
            height: '1.5px',
            background: `linear-gradient(90deg, transparent 30%, ${palette.secondary}30, ${palette.primary}45)`,
        }} />
        <div style={{
            position: 'absolute', bottom: '34px', right: '28px', width: '35%',
            height: '1px',
            background: `linear-gradient(270deg, ${palette.secondary}30, transparent)`,
        }} />
        {/* Right vertical accent */}
        <div style={{
            position: 'absolute', top: '60px', right: '28px', bottom: '60px',
            width: '1px',
            background: `linear-gradient(180deg, transparent, ${palette.primary}20, transparent)`,
        }} />
    </div>
);

// ─── 5. None ──────────────────────────────────────────────────────────────────
export const DecoNone = () => null;

// ─── 6. Gold Corners — Yaadein-style formal invitation ───────────────────────
// Elegant gold ornamental corners + subtle center bokeh particles
export const DecoGoldCorners = ({ palette }) => (
    <div style={decoBase}>
        {/* Top-left corner L-bracket with ornament */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '130px', height: '130px' }}>
            <path d="M8 50 L8 8 L50 8" fill="none" stroke={palette.accent} strokeWidth="2.5" opacity="0.85" strokeLinecap="round" />
            <path d="M12 40 L12 12 L40 12" fill="none" stroke={palette.secondary} strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
            {/* Corner ornament diamond */}
            <rect x="4" y="4" width="8" height="8" fill={palette.accent} opacity="0.7" transform="rotate(45 8 8)" />
            {/* Decorative dots along top line */}
            {[20, 32, 44].map((x, i) => <circle key={i} cx={x} cy="8" r="1.2" fill={palette.secondary} opacity="0.6" />)}
            {[20, 32, 44].map((y, i) => <circle key={`y${i}`} cx="8" cy={y} r="1.2" fill={palette.secondary} opacity="0.6" />)}
        </svg>

        {/* Top-right corner */}
        <svg style={{ position: 'absolute', top: 0, right: 0, width: '130px', height: '130px', transform: 'scaleX(-1)' }}>
            <path d="M8 50 L8 8 L50 8" fill="none" stroke={palette.accent} strokeWidth="2.5" opacity="0.85" strokeLinecap="round" />
            <path d="M12 40 L12 12 L40 12" fill="none" stroke={palette.secondary} strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
            <rect x="4" y="4" width="8" height="8" fill={palette.accent} opacity="0.7" transform="rotate(45 8 8)" />
            {[20, 32, 44].map((x, i) => <circle key={i} cx={x} cy="8" r="1.2" fill={palette.secondary} opacity="0.6" />)}
            {[20, 32, 44].map((y, i) => <circle key={`y${i}`} cx="8" cy={y} r="1.2" fill={palette.secondary} opacity="0.6" />)}
        </svg>

        {/* Bottom-left corner */}
        <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '130px', height: '130px', transform: 'scaleY(-1)' }}>
            <path d="M8 50 L8 8 L50 8" fill="none" stroke={palette.accent} strokeWidth="2.5" opacity="0.85" strokeLinecap="round" />
            <path d="M12 40 L12 12 L40 12" fill="none" stroke={palette.secondary} strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
            <rect x="4" y="4" width="8" height="8" fill={palette.accent} opacity="0.7" transform="rotate(45 8 8)" />
            {[20, 32, 44].map((x, i) => <circle key={i} cx={x} cy="8" r="1.2" fill={palette.secondary} opacity="0.6" />)}
            {[20, 32, 44].map((y, i) => <circle key={`y${i}`} cx="8" cy={y} r="1.2" fill={palette.secondary} opacity="0.6" />)}
        </svg>

        {/* Bottom-right corner */}
        <svg style={{ position: 'absolute', bottom: 0, right: 0, width: '130px', height: '130px', transform: 'scale(-1,-1)' }}>
            <path d="M8 50 L8 8 L50 8" fill="none" stroke={palette.accent} strokeWidth="2.5" opacity="0.85" strokeLinecap="round" />
            <path d="M12 40 L12 12 L40 12" fill="none" stroke={palette.secondary} strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
            <rect x="4" y="4" width="8" height="8" fill={palette.accent} opacity="0.7" transform="rotate(45 8 8)" />
            {[20, 32, 44].map((x, i) => <circle key={i} cx={x} cy="8" r="1.2" fill={palette.secondary} opacity="0.6" />)}
            {[20, 32, 44].map((y, i) => <circle key={`y${i}`} cx="8" cy={y} r="1.2" fill={palette.secondary} opacity="0.6" />)}
        </svg>

        {/* Full border frame lines */}
        <div style={{
            position: 'absolute', top: '18px', bottom: '18px', left: '18px', right: '18px',
            border: `1px solid ${palette.secondary}35`,
            borderRadius: '2px', pointerEvents: 'none',
        }} />

        {/* Gold bokeh glow at bottom */}
        <div style={{
            position: 'absolute', bottom: '-30px', left: '10%', right: '10%',
            height: '120px', borderRadius: '50%',
            background: `radial-gradient(ellipse, ${palette.secondary}22 0%, transparent 70%)`,
            filter: 'blur(18px)',
        }} />
    </div>
);

// ─── 7. Network Lines — tech/CSE style ───────────────────────────────────────
export const DecoNetworkLines = ({ palette }) => (
    <div style={decoBase}>
        <svg style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '180px', opacity: 0.25 }} viewBox="0 0 200 180">
            {[
                [[10, 10], [80, 30], [150, 10], [190, 60]],
                [[80, 30], [120, 80], [190, 60]],
                [[10, 10], [50, 90]], [[50, 90], [120, 80]],
            ].map((line, i) =>
                line.slice(0, -1).map((pt, j) => (
                    <line key={`${i}-${j}`} x1={pt[0]} y1={pt[1]} x2={line[j + 1][0]} y2={line[j + 1][1]}
                        stroke={palette.secondary} strokeWidth="0.6" />
                ))
            )}
            {[[10, 10], [80, 30], [150, 10], [190, 60], [120, 80], [50, 90]].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="2.5" fill={palette.primary} opacity="0.8" />
            ))}
        </svg>
        {/* Bottom accent bar */}
        <div style={{
            position: 'absolute', bottom: '22px', left: '22px', right: '22px',
            height: '1.5px',
            background: `linear-gradient(90deg, transparent 5%, ${palette.primary}40, ${palette.secondary}30, transparent 95%)`,
        }} />
    </div>
);

// ─── Registry ─────────────────────────────────────────────────────────────────
export const DECORATIONS = {
    'glow-orbs':         { id: 'glow-orbs',         name: 'Glow Orbs',        component: DecoGlowOrbs },
    'geometric-shapes':  { id: 'geometric-shapes',  name: 'Geometric Shapes', component: DecoGeometricShapes },
    'corner-accents':    { id: 'corner-accents',    name: 'Corner Accents',   component: DecoCornerAccents },
    'accent-lines':      { id: 'accent-lines',      name: 'Accent Lines',     component: DecoAccentLines },
    'gold-corners':      { id: 'gold-corners',      name: 'Gold Corners',     component: DecoGoldCorners },
    'network-lines':     { id: 'network-lines',     name: 'Network Lines',    component: DecoNetworkLines },
    'none':              { id: 'none',               name: 'None',             component: DecoNone },
};

export const getDecoration = (id) => DECORATIONS[id] || DECORATIONS['none'];

