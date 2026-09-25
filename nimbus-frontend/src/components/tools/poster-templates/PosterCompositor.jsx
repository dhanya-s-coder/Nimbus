import React, { useState } from 'react';

import SkeletonCentered from './skeletons/SkeletonCentered';
import SkeletonBoldHero from './skeletons/SkeletonBoldHero';
import SkeletonSplitPanel from './skeletons/SkeletonSplitPanel';
import SkeletonEditorial from './skeletons/SkeletonEditorial';
import SkeletonAsymmetric from './skeletons/SkeletonAsymmetric';
import SkeletonFramedClassic from './skeletons/SkeletonFramedClassic';

import { getBackground } from './skins/backgrounds';
import { getFrame } from './skins/frames';
import { getDecoration } from './skins/decorations';
import { getPalette, isDarkPalette } from './skins/palettes';
import { SKELETON_SAFE_ZONES } from './safeZones';

const SKELETONS = {
    'centered': SkeletonCentered,
    'bold-hero': SkeletonBoldHero,
    'split-panel': SkeletonSplitPanel,
    'editorial': SkeletonEditorial,
    'asymmetric': SkeletonAsymmetric,
    'framed-classic': SkeletonFramedClassic,
};

/**
 * Layers:
 *   0 template background + AI atmosphere
 *   1 coded decorations
 *   2 Gemini graphics merged into safe zones
 *   3 skeleton text
 *   4 frame
 */
const PosterCompositor = ({
    skeletonId = 'centered',
    backgroundId = 'solid-gradient',
    frameId = 'double-line',
    decorationId = 'glow-orbs',
    paletteId = 'universityBlue',
    data = {},
    aiBackgroundImage = null,
    aiBackgroundOverlay = 0.14,
    aiElements = [],
}) => {
    const palette = getPalette(paletteId);
    const SkeletonComponent = SKELETONS[skeletonId] || SkeletonCentered;
    const Background = getBackground(backgroundId).component;
    const Frame = getFrame(frameId).component;
    const Decoration = getDecoration(decorationId).component;
    const skeletonZones = SKELETON_SAFE_ZONES[skeletonId]?.zones || [];
    const dark = isDarkPalette(palette);

    const getZonePosition = (zoneId) => {
        const zone = skeletonZones.find(z => z.id === zoneId);
        if (zone) return zone.position;
        return { top: '4%', right: '2%', width: '28%', height: '28%' };
    };

    return (
        <div
            id="poster-export-node"
            style={{
                width: '600px',
                height: '750px',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: palette.bg,
                boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)',
            }}
        >
            <Background palette={palette} />

            {aiBackgroundImage && (
                <AILoadingBackground
                    src={aiBackgroundImage}
                    palette={palette}
                    overlayOpacity={aiBackgroundOverlay}
                />
            )}

            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.08 }}>
                <filter id="poster-live-grain">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#poster-live-grain)" />
            </svg>

            <Decoration palette={palette} />

            {aiElements.map((el, i) => (
                <AIElement
                    key={`${el.zone}-${i}`}
                    src={el.imageUrl}
                    role={el.role || 'motif'}
                    position={getZonePosition(el.zone)}
                    opacity={el.opacity}
                    palette={palette}
                    dark={dark}
                />
            ))}

            <SkeletonComponent data={data} palette={palette} />
            <Frame palette={palette} />
        </div>
    );
};

const maskForRole = (role) => {
    if (role === 'panel') {
        return 'linear-gradient(90deg, transparent 0%, #000 14%, #000 100%)';
    }
    if (role === 'atmosphere') {
        return 'radial-gradient(ellipse at center, #000 28%, transparent 78%)';
    }
    return 'radial-gradient(ellipse at center, #000 42%, transparent 74%)';
};

const AIElement = ({ src, position, opacity, role, palette, dark }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    if (error) return null;

    const isPanel = role === 'panel';
    const mask = maskForRole(role);
    const resolvedOpacity = Math.max(0.35, Math.min(1, opacity || (isPanel ? 0.94 : 0.72)));

    return (
        <div style={{
            position: 'absolute',
            ...position,
            zIndex: isPanel ? 2 : 3,
            pointerEvents: 'none',
            opacity: loaded ? resolvedOpacity : 0,
            transition: 'opacity 0.9s ease-in-out',
            WebkitMaskImage: mask,
            maskImage: mask,
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            mixBlendMode: isPanel ? 'normal' : (dark ? 'screen' : 'multiply'),
        }}>
            <img
                src={src}
                alt=""
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: isPanel ? 'cover' : 'contain',
                    display: 'block',
                    filter: isPanel
                        ? `saturate(1.05) contrast(1.04)`
                        : `saturate(1.1) contrast(1.05) drop-shadow(0 12px 28px ${palette.primary}55)`,
                }}
                crossOrigin="anonymous"
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
            />
            <div style={{
                position: 'absolute',
                inset: 0,
                background: isPanel
                    ? `linear-gradient(90deg, ${palette.bg} 0%, transparent 28%), linear-gradient(180deg, ${palette.primary}22, transparent 40%, ${palette.bg}55)`
                    : `radial-gradient(circle at 40% 40%, ${palette.primary}33, transparent 70%)`,
                pointerEvents: 'none',
            }} />
        </div>
    );
};

const AILoadingBackground = ({ src, palette, overlayOpacity }) => {
    const [loaded, setLoaded] = useState(false);
    const light = palette.isDark === false;
    // For light palettes: keep brightness, no multiply darkening
    // For dark palettes: modest darkening only, not the old 0.82 brightness
    const brightnessVal = light ? 1.0 : 0.92;
    const saturationVal = light ? 1.05 : 0.85;
    const edge = Math.max(0.08, Math.min(0.25, overlayOpacity || 0.14));

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            zIndex: 1,
        }}>
            <img
                src={src}
                alt=""
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    // Removed hardcoded brightness(0.82) — was making everything dark
                    filter: `saturate(${saturationVal}) contrast(1.05) brightness(${brightnessVal})`,
                }}
                crossOrigin="anonymous"
                onLoad={() => setLoaded(true)}
                onError={() => console.error('Failed to load AI Background:', src)}
            />
            {/* Palette colour blend — only darken on dark palettes, and lightly */}
            {!light && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    mixBlendMode: 'multiply',
                    opacity: 0.30,
                    background: palette.bg,
                }} />
            )}
            
            {/* Soft radial frame to ensure edges are readable */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(ellipse 75% 70% at 50% 40%, transparent 0%, ${palette.bg}00 45%, ${palette.bg} 100%)`,
                opacity: light ? 0.7 : 0.85,
            }} />

            {/* Top/Bottom vignette — critical for title and footer readability */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(180deg, ${palette.bg}E6 0%, ${palette.bg}80 12%, transparent 28%, transparent 75%, ${palette.bg}99 88%, ${palette.bg}E6 100%)`,
            }} />
        </div>
    );
};

export default PosterCompositor;
