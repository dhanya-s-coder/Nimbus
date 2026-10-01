import React from 'react';

const abs = { position: 'absolute', inset: 0, pointerEvents: 'none' };

/**
 * Gentle film grain — only applied at very low opacity.
 */
const FilmGrain = ({ id, opacity = 0.05 }) => (
    <svg style={{ ...abs, width: '100%', height: '100%', zIndex: 2 }}>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id}-grain)`} opacity={opacity} />
    </svg>
);

/**
 * Detect if a palette is light or dark and return appropriate overlay values.
 */
const isLight = (palette) => palette.isDark === false;

/**
 * Universal base — beautiful radial glow on the right gradient.
 * Works for BOTH light and dark palettes.
 */
const GradientBase = ({ palette, id, glowAt = '85% 12%' }) => {
    const light = isLight(palette);
    return (
        <>
            {/* Base fill using the palette gradient */}
            <div style={{ ...abs, background: palette.gradient || `linear-gradient(145deg, ${palette.bg} 0%, ${palette.bgMid || palette.bg} 50%, ${palette.bg} 100%)` }} />
            {/* Primary colour glow */}
            <div style={{
                ...abs,
                background: `radial-gradient(ellipse 80% 50% at ${glowAt}, ${palette.primary}${light ? '25' : '30'} 0%, transparent 60%)`,
            }} />
            {/* Secondary counter-glow at bottom-left */}
            <div style={{
                ...abs,
                background: `radial-gradient(ellipse 60% 45% at 10% 90%, ${palette.secondary}${light ? '18' : '20'} 0%, transparent 65%)`,
            }} />
            {/* Vignette: darken edges slightly for dark, lighten for light */}
            <div style={{
                ...abs,
                background: light
                    ? `radial-gradient(ellipse 85% 85% at 50% 48%, transparent 30%, ${palette.bgMid || palette.bg}aa 100%)`
                    : `radial-gradient(ellipse 80% 80% at 50% 48%, transparent 35%, ${palette.bg}cc 100%)`,
            }} />
            <FilmGrain id={id} opacity={light ? 0.03 : 0.05} />
        </>
    );
};

// ─── 1. Solid Gradient (Studio Light) ────────────────────────────────────────
export const BgSolidGradient = ({ palette }) => {
    const id = `bg-studio-${palette.id || 'p'}`;
    return (
        <div style={abs}>
            <div style={{ ...abs, opacity: 0.58 }}><GradientBase palette={palette} id={id} /></div>
            {/* Top/bottom fade */}
            <div style={{
                ...abs,
                background: `linear-gradient(180deg, ${palette.bg}60 0%, transparent 15%, transparent 80%, ${palette.bg}80 100%)`,
            }} />
        </div>
    );
};

// ─── 2. Dot Grid ─────────────────────────────────────────────────────────────
export const BgDotGrid = ({ palette }) => {
    const id = `bg-dots-${palette.id || 'p'}`;
    const light = isLight(palette);
    return (
        <div style={abs}>
            <GradientBase palette={palette} id={id} glowAt="78% 18%" />
            <svg style={{ ...abs, width: '100%', height: '100%', opacity: light ? 0.15 : 0.11 }}>
                <defs>
                    <pattern id={`${id}-pat`} width="22" height="22" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="0.8" fill={palette.primary} />
                    </pattern>
                    <radialGradient id={`${id}-fade`} cx="50%" cy="42%" r="62%">
                        <stop offset="0%" stopColor="#fff" stopOpacity={light ? "0.4" : "0.15"} />
                        <stop offset="100%" stopColor="#fff" stopOpacity="1" />
                    </radialGradient>
                    <mask id={`${id}-mask`}>
                        <rect width="100%" height="100%" fill={`url(#${id}-fade)`} />
                    </mask>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${id}-pat)`} mask={`url(#${id}-mask)`} />
            </svg>
        </div>
    );
};

// ─── 3. Hex Grid ─────────────────────────────────────────────────────────────
export const BgHexGrid = ({ palette }) => {
    const id = `bg-hex-${palette.id || 'p'}`;
    const light = isLight(palette);
    return (
        <div style={abs}>
            <GradientBase palette={palette} id={id} glowAt="72% 22%" />
            <svg style={{ ...abs, width: '100%', height: '100%', opacity: light ? 0.14 : 0.09 }}>
                <defs>
                    <pattern id={`${id}-pat`} width="42" height="48" patternUnits="userSpaceOnUse">
                        <path
                            d="M21 1.5 L40 12.5 V34.5 L21 45.5 L2 34.5 V12.5 Z"
                            fill="none"
                            stroke={palette.secondary}
                            strokeWidth="0.7"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${id}-pat)`} />
            </svg>
        </div>
    );
};

// ─── 4. Topography / Contour ──────────────────────────────────────────────────
export const BgTopography = ({ palette }) => {
    const id = `bg-topo-${palette.id || 'p'}`;
    const light = isLight(palette);
    return (
        <div style={abs}>
            <GradientBase palette={palette} id={id} glowAt="80% 16%" />
            <svg style={{ ...abs, width: '100%', height: '100%', opacity: light ? 0.18 : 0.13 }} viewBox="0 0 600 750" preserveAspectRatio="xMidYMid slice">
                {[70, 120, 175, 235, 300, 370, 450].map((r, i) => (
                    <ellipse
                        key={r}
                        cx="430" cy="210"
                        rx={r * 1.15} ry={r * 0.82}
                        fill="none"
                        stroke={i % 2 ? palette.accent : palette.secondary}
                        strokeWidth={i === 2 ? 0.9 : 0.45}
                        opacity={0.55 - i * 0.05}
                    />
                ))}
                <path d="M40 640 C120 560, 220 600, 310 520 C400 440, 470 500, 580 430"
                    fill="none" stroke={palette.primary} strokeWidth="0.6" opacity="0.35" />
            </svg>
        </div>
    );
};

// ─── 5. Diagonal Stripes ──────────────────────────────────────────────────────
export const BgDiagonalStripes = ({ palette }) => {
    const id = `bg-rule-${palette.id || 'p'}`;
    return (
        <div style={abs}>
            <GradientBase palette={palette} id={id} glowAt="70% 10%" />
            <svg style={{ ...abs, width: '100%', height: '100%', opacity: 0.06 }}>
                <defs>
                    <pattern id={`${id}-pat`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
                        <line x1="0" y1="0" x2="0" y2="14" stroke={palette.text} strokeWidth="0.6" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${id}-pat)`} />
            </svg>
        </div>
    );
};

// ─── 6. Layered Waves / Silk ──────────────────────────────────────────────────
export const BgLayeredWaves = ({ palette }) => {
    const id = `bg-silk-${palette.id || 'p'}`;
    const light = isLight(palette);
    return (
        <div style={abs}>
            <GradientBase palette={palette} id={id} glowAt="88% 8%" />
            <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '62%' }} viewBox="0 0 600 370" preserveAspectRatio="none">
                <path d="M0 210 C140 150 220 250 360 180 C480 120 540 200 600 160 L600 370 L0 370 Z"
                    fill={palette.primary} opacity={light ? "0.12" : "0.10"} />
                <path d="M0 250 C160 200 280 280 420 230 C520 190 560 240 600 220 L600 370 L0 370 Z"
                    fill={palette.secondary} opacity={light ? "0.10" : "0.07"} />
                <path d="M0 80 C180 40 260 140 420 70" fill="none" stroke={palette.accent} strokeWidth="0.9" opacity="0.22" />
            </svg>
        </div>
    );
};

// ─── 7. Gold Sparkle — for formal invitation posters (Yaadein-style) ─────────
export const BgGoldSparkle = ({ palette }) => {
    const id = `bg-gold-${palette.id || 'p'}`;
    return (
        <div style={abs}>
            {/* Deep dark base */}
            <div style={{ ...abs, background: palette.gradient || `linear-gradient(145deg, ${palette.bg} 0%, ${palette.bgMid} 60%, ${palette.bg} 100%)` }} />
            {/* Gold radial glow at top */}
            <div style={{
                ...abs,
                background: `radial-gradient(ellipse 75% 45% at 50% 5%, ${palette.primary}35 0%, transparent 65%)`,
            }} />
            {/* Gold radial at bottom-left corner */}
            <div style={{
                ...abs,
                background: `radial-gradient(ellipse 55% 40% at 0% 100%, ${palette.secondary}25 0%, transparent 60%)`,
            }} />
            {/* Gold radial at bottom-right corner */}
            <div style={{
                ...abs,
                background: `radial-gradient(ellipse 55% 40% at 100% 100%, ${palette.accent}20 0%, transparent 60%)`,
            }} />
            {/* Scattered gold sparkle dots (SVG) */}
            <svg style={{ ...abs, width: '100%', height: '100%', opacity: 0.35 }} viewBox="0 0 600 750">
                {/* Sparkle cluster bottom-left */}
                {[
                    [40, 680, 2.5], [70, 710, 1.8], [20, 720, 1.5], [55, 740, 2], [90, 700, 1.2],
                    [110, 680, 1.8], [30, 650, 1.5], [75, 660, 1.2],
                ].map(([cx, cy, r], i) => (
                    <circle key={i} cx={cx} cy={cy} r={r} fill={palette.accent} opacity={0.6 + (i % 3) * 0.1} />
                ))}
                {/* Sparkle cluster bottom-right */}
                {[
                    [540, 680, 2.2], [560, 710, 1.8], [580, 695, 1.5], [520, 720, 2],
                    [555, 740, 1.2], [570, 660, 1.8], [545, 650, 1.5],
                ].map(([cx, cy, r], i) => (
                    <circle key={`r${i}`} cx={cx} cy={cy} r={r} fill={palette.secondary} opacity={0.5 + (i % 3) * 0.1} />
                ))}
                {/* Subtle center scatter */}
                {[
                    [200, 400, 1], [380, 320, 1.2], [450, 480, 0.8], [150, 550, 1], [500, 250, 0.9],
                ].map(([cx, cy, r], i) => (
                    <circle key={`c${i}`} cx={cx} cy={cy} r={r} fill={palette.accent} opacity={0.3} />
                ))}
                {/* Gold cross/star sparkles at corners */}
                <path d="M18 18 L22 22 M22 18 L18 22 M20 14 L20 26 M14 20 L26 20" stroke={palette.accent} strokeWidth="0.8" opacity="0.5" />
                <path d="M578 18 L582 22 M582 18 L578 22 M580 14 L580 26 M574 20 L586 20" stroke={palette.accent} strokeWidth="0.8" opacity="0.5" />
                <path d="M18 730 L22 734 M22 730 L18 734 M20 726 L20 738 M14 732 L26 732" stroke={palette.accent} strokeWidth="0.8" opacity="0.5" />
                <path d="M578 730 L582 734 M582 730 L578 734 M580 726 L580 738 M574 732 L586 732" stroke={palette.accent} strokeWidth="0.8" opacity="0.5" />
            </svg>
            <FilmGrain id={id} opacity={0.04} />
        </div>
    );
};

// ─── 8. Mesh / Network — for tech/recruitment (CSETimes-style) ───────────────
export const BgMeshNetwork = ({ palette }) => {
    const id = `bg-mesh-${palette.id || 'p'}`;
    const light = isLight(palette);
    const nodes = [
        [80, 60], [200, 40], [340, 80], [480, 50], [560, 120],
        [60, 200], [180, 180], [300, 150], [440, 200], [530, 250],
        [100, 350], [250, 320], [400, 300], [520, 380],
        [50, 500], [200, 480], [380, 520], [500, 490],
        [120, 650], [280, 620], [450, 660], [560, 600],
    ];
    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [1, 6], [2, 7], [3, 8], [4, 9],
        [5, 6], [6, 7], [7, 8], [8, 9], [5, 10], [6, 11], [7, 12], [8, 13],
        [10, 11], [11, 12], [12, 13], [10, 14], [11, 15], [12, 16], [13, 17],
        [14, 15], [15, 16], [16, 17], [14, 18], [15, 19], [16, 20], [17, 21],
    ];
    return (
        <div style={abs}>
            <GradientBase palette={palette} id={id} glowAt="60% 15%" />
            <svg style={{ ...abs, width: '100%', height: '100%', opacity: light ? 0.18 : 0.12 }} viewBox="0 0 600 750" preserveAspectRatio="xMidYMid slice">
                {edges.map(([a, b], i) => (
                    <line key={i}
                        x1={nodes[a][0]} y1={nodes[a][1]}
                        x2={nodes[b][0]} y2={nodes[b][1]}
                        stroke={palette.secondary} strokeWidth="0.5"
                    />
                ))}
                {nodes.map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="2.5" fill={palette.primary} opacity="0.7" />
                ))}
            </svg>
        </div>
    );
};

// ─── Registry ──────────────────────────────────────────────────────────────────
export const BACKGROUNDS = {
    'solid-gradient':    { id: 'solid-gradient',    name: 'Studio Light',    component: BgSolidGradient },
    'dot-grid':          { id: 'dot-grid',           name: 'Archival Grid',   component: BgDotGrid },
    'hex-grid':          { id: 'hex-grid',           name: 'Fine Lattice',    component: BgHexGrid },
    'topography':        { id: 'topography',         name: 'Contour',         component: BgTopography },
    'diagonal-stripes':  { id: 'diagonal-stripes',   name: 'Ruling',          component: BgDiagonalStripes },
    'layered-waves':     { id: 'layered-waves',      name: 'Silk',            component: BgLayeredWaves },
    'gold-sparkle':      { id: 'gold-sparkle',       name: 'Gold Sparkle',    component: BgGoldSparkle },
    'mesh-network':      { id: 'mesh-network',       name: 'Mesh Network',    component: BgMeshNetwork },
    'aurora-glow':       { id: 'aurora-glow',         name: 'Aurora Glow',     component: BgLayeredWaves },
    'editorial-grid':    { id: 'editorial-grid',      name: 'Editorial Grid',  component: BgDotGrid },
    'campus-mesh':       { id: 'campus-mesh',         name: 'Campus Mesh',     component: BgMeshNetwork },
};

export const getBackground = (id) => BACKGROUNDS[id] || BACKGROUNDS['solid-gradient'];
