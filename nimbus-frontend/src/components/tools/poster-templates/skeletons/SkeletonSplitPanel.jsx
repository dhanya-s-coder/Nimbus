import React, { useEffect, useState } from 'react';
import { getResponsiveTitleSizeCompact, clampStyle, loadFonts, renderLogos, renderQrCodes, truncate } from '../utils';

/**
 * SkeletonSplitPanel — Left info panel + right decorative/photo space.
 * Inspired by the UDBHAV Tech Talk poster: bold left text, photo dominant right.
 * When speakerPhoto is provided, the right panel becomes a photo panel.
 */
const SkeletonSplitPanel = ({ data, palette }) => {
    useEffect(() => {
        loadFonts([
            'Outfit',
            'DM Sans',
            ...(palette.titleFonts || []),
        ]);
    }, [palette]);

    const titleFont = palette.titleFonts?.[0] || 'Outfit';
    const bodyFont = palette.bodyFont || 'DM Sans';
    const {
        title, subtitle, organizer, description, speakerName, speakerDesignation,
        infoItems, extraItems, collegeLogo, eventBrandLogo, speakerPhoto, speakerShape, qr1, qr2, footer
    } = data;

    const hasPhoto = Boolean(speakerPhoto);
    const [shape, setShape] = useState(speakerShape || 'Hexagon');
    const [shapeHover, setShapeHover] = useState(false);

    return (
        <div style={{
            position: 'relative', zIndex: 10,
            width: '100%', height: '100%',
            display: 'flex',
            fontFamily: `'${bodyFont}', sans-serif`,
            color: palette.text,
            boxSizing: 'border-box',
        }}>
            {/* ── Left Panel ── */}
            <div style={{
                width: '45%', height: '100%',
                padding: '24px 20px 18px',
                display: 'flex', flexDirection: 'column',
                // Let the generated HF background show through while keeping text readable.
                background: palette.isDark === false
                    ? 'linear-gradient(180deg, rgba(248,250,252,.82), rgba(226,232,240,.72), rgba(248,250,252,.84))'
                    : `linear-gradient(180deg, ${palette.bg}d9, ${palette.bgMid || palette.bg}c7, ${palette.bg}e3)`,
                backdropFilter: 'blur(8px) saturate(1.08)',
                WebkitBackdropFilter: 'blur(8px) saturate(1.08)',
                position: 'relative', zIndex: 2, boxSizing: 'border-box',
            }}>
                {/* Glowing right edge */}
                <div style={{
                    position: 'absolute', top: 0, bottom: 0, right: 0, width: '2px',
                    background: `linear-gradient(180deg, transparent, ${palette.primary}80, ${palette.secondary}60, transparent)`,
                    boxShadow: `0 0 14px ${palette.primary}30, 2px 0 20px ${palette.primary}15`,
                }} />

                {/* Logos */}
                <div style={{ marginBottom: '14px' }}>
                    {renderLogos(collegeLogo, eventBrandLogo, { height: '32px', opacity: 0.88 }, { width: '222%', marginLeft: '-20px',  transform: 'translateX(12%)' })}
                </div>

                {organizer && (
                    <div style={{
                        fontSize: '0.56rem', letterSpacing: '2.5px', textTransform: 'uppercase',
                        fontWeight: 700, color: palette.secondary, marginBottom: '16px',
                        lineHeight: 1.4,
                    }}>
                        {truncate(organizer, 40)}
                    </div>
                )}

                {title && (
                    <h1 style={{
                        fontFamily: `'${titleFont}', sans-serif`,
                        fontSize: getResponsiveTitleSizeCompact(title.length),
                        fontWeight: 800, lineHeight: 1.0, textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        margin: '0 0 10px', color: palette.text, wordBreak: 'break-word',
                        textShadow: `0 2px 15px ${palette.primary}35`,
                    }}>
                        {title}
                    </h1>
                )}

                <div style={{
                    width: '36px', height: '3px', marginBottom: '10px',
                    background: `linear-gradient(90deg, ${palette.primary}, ${palette.secondary})`,
                    boxShadow: `0 0 8px ${palette.primary}35`,
                }} />

                {description && (
                    <div style={{
        width: '100%',
        fontSize: '1rem',
        lineHeight: 1.55,
        color: '#FFFFFF',
        textAlign: 'justify',
        textAlignLast: 'left',
        marginBottom: '10px',
        fontWeight: 800,
        wordBreak: 'normal',
        overflowWrap: 'break-word',
        hyphens: 'auto',
        whiteSpace: 'normal',
    }}>
                        {description}
                    </div>
                )}

                {subtitle && (
                    <div style={{
                        fontSize: '0.75em', fontWeight: 600, color: '#FFFFFF',
                        marginBottom: '8px', lineHeight: 1.4, whiteSpace: 'pre-wrap',
                        overflow: 'visible', textAlign: 'justify', textAlignLast: 'left',
                    }}>
                        {subtitle}
                    </div>
                )}

                {extraItems && extraItems.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '8px' }}>
                        {extraItems.slice(0, 2).map((item, i) => (
                            <div key={i} style={{ fontSize: '0.55rem', color: palette.muted }}>
                                <span style={{ fontWeight: 700, color: palette.secondary, display: 'block', marginBottom: '2px' }}>{item.label}: </span>
                                {Array.isArray(item.value) ? (
                                    <ul style={{ margin: 0, paddingLeft: '14px', listStyleType: 'disc' }}>
                                        {item.value.slice(0, 3).map((bullet, idx) => (
                                            <li key={idx} style={{ marginBottom: '2px' }}>{truncate(bullet, 50)}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    truncate(item.value, 80)
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ flex: 1 }} />

                {/* Info Items */}
                {infoItems.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '10px', flexShrink: 0 }}>
                        {infoItems.map((item, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '6px 10px',
                                background: `linear-gradient(90deg, ${palette.primary}15, transparent)`,
                                borderRadius: '6px',
                            }}>
                                <div style={{
                                    width: '3px', height: '22px',
                                    background: `linear-gradient(180deg, ${palette.primary}, ${palette.secondary})`,
                                    borderRadius: '2px', flexShrink: 0,
                                    boxShadow: `0 0 6px ${palette.primary}30`,
                                }} />
                                <div>
                                    <div style={{
                                        fontSize: '0.44rem', fontWeight: 700, letterSpacing: '1.5px',
                                        textTransform: 'uppercase', color: palette.secondary,
                                    }}>
                                        {item.label}
                                    </div>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: palette.text }}>
                                        {item.value}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* QR codes in left panel when present */}
                {(qr1 || qr2) && (
                    <div style={{ marginBottom: '6px' }}>
                        <div style={{ position: 'static' }}>{renderQrCodes(qr1, qr2, palette)}</div>
                    </div>
                )}

                <div style={{ fontSize: '0.44rem', color: palette.muted, opacity: 0.6, lineHeight: 1.4 }}>
                    {footer || 'For more info, contact the coordinator.'}
                </div>
            </div>

            {/* ── Right Panel ── */}
            <div style={{ width: '55%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                {hasPhoto ? (
                    /* Photo panel — matches UDBHAV Tech Talk style */
                    <>
                        <div onMouseEnter={() => setShapeHover(true)} onMouseLeave={() => setShapeHover(false)} style={{ position: 'absolute', width: '42%', aspectRatio: '1 / 1', top: '16%', right: '14%', zIndex: 20 }}>
                        <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', width: '100%', height: '100%', inset: 0, zIndex: 6, pointerEvents: 'none', overflow: 'visible' }}>
                            {shape === 'Circle' && <circle cx="50" cy="50" r="49" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="4 3" />}
                            {shape === 'Diamond' && <polygon points="50,1 99,50 50,99 1,50" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="4 3" />}
                            {shape === 'Hexagon' && <polygon points="50,1 93,25 93,75 50,99 7,75 7,25" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="4 3" />}
                            {shape === 'Square' && <rect x="1" y="1" width="98" height="98" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="4 3" />}
                        </svg>
                        <img
                            src={speakerPhoto}
                            alt={speakerName || 'Speaker'}
                            style={{
                                width: '100%', height: '100%',
                                position: 'absolute',
                                top: 0, right: 0,
                                objectFit: 'cover',
                                objectPosition: 'top center',
                                display: 'block',
                                clipPath: shape === 'Circle' ? 'circle(50% at 50% 50%)' : shape === 'Diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : shape === 'Square' ? 'none' : 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
                                border: 'none',
                                filter: 'saturate(1.05) contrast(1.02)',
                            }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        {shapeHover && <div style={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 3, background: '#081126ee', padding: 3, borderRadius: 5 }}>{['Circle','Diamond','Square','Hexagon'].map(s => <button key={s} type="button" onClick={() => { localStorage.setItem('nimbus-speaker-shape', s); setShape(s); }} style={{ fontSize: 8, padding: '3px 5px' }}>{s}</button>)}</div>}
                        </div>
                        {/* Left blend gradient */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'transparent',
                            pointerEvents: 'none',
                        }} />
                        {/* Bottom gradient for text readability */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'transparent',
                            pointerEvents: 'none',
                        }} />
                        {/* Speaker name callout — styled like reference poster */}
                        {speakerName && (
                            <div style={{
                                position: 'absolute',
                                top: '54%',
                                bottom: 'auto',
                                left: '50%',
                                right: 'auto',
                                transform: 'translateX(-50%)',
                                textAlign: 'center',
                                pointerEvents: 'none',
                            }}>
                                {speakerName.split(' ').reduce((lines, word, i, words) => {
                                    if (i % 2 === 0) lines.push(words.slice(i, i + 2).join(' '));
                                    return lines;
                                }, []).map((line, i) => (
                                    <div key={i} style={{
                                        fontFamily: `'${titleFont}', sans-serif`,
                                        fontSize: '2.5rem',
                                        fontWeight: 800,
                                        color: palette.text,
                                        lineHeight: 1.05,
                                        whiteSpace: 'nowrap',
                                        textShadow: `0 2px 20px ${palette.bg}`,
                                        letterSpacing: '-0.5px',
                                    }}>
                                        {line}
                                    </div>
                                ))}
                                {speakerDesignation && (
                                    <div style={{
                                        marginTop: '6px',
                                        color: '#fff',
                                        fontSize: '0.82rem',
                                        fontWeight: 600,
                                        lineHeight: 1.25,
                                        whiteSpace: 'nowrap',
                                        textShadow: `0 2px 12px ${palette.bg}`,
                                    }}>
                                        {speakerDesignation}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    /* Decorative overlay when no photo */
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: `linear-gradient(160deg, ${palette.primary}15 0%, transparent 50%, ${palette.secondary}10 100%)`,
                    }} />
                )}
            </div>
        </div>
    );
};

export default SkeletonSplitPanel;
