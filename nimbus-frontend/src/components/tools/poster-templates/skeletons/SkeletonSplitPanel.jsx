import React, { useEffect } from 'react';
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
        infoItems, extraItems, collegeLogo, eventBrandLogo, speakerPhoto, qr1, qr2, footer
    } = data;

    const hasPhoto = Boolean(speakerPhoto);

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
                background: `linear-gradient(180deg, ${palette.bg}, ${palette.bgMid || palette.bg}, ${palette.bg})`,
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
                    {renderLogos(collegeLogo, eventBrandLogo, { height: '32px', opacity: 0.88 })}
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
                        letterSpacing: '-0.5px',
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

                {subtitle && (
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: palette.secondary, marginBottom: '8px', lineHeight: 1.4 }}>
                        {truncate(subtitle, 50)}
                    </div>
                )}

                {speakerName && (
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: palette.accent, marginBottom: speakerDesignation ? '2px' : '8px' }}>
                        {speakerName}
                    </div>
                )}
                {speakerDesignation && (
                    <div style={{ fontSize: '0.58rem', color: palette.muted, marginBottom: '10px', lineHeight: 1.5 }}>
                        {speakerDesignation}
                    </div>
                )}

                {description && (
                    <div style={{
                        fontSize: '0.62rem', lineHeight: 1.65, color: palette.muted,
                        marginBottom: '10px', ...clampStyle(4),
                    }}>
                        {description}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '10px' }}>
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
                        {renderQrCodes(qr1, qr2, palette)}
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
                        <img
                            src={speakerPhoto}
                            alt={speakerName || 'Speaker'}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'top center',
                                display: 'block',
                                filter: 'saturate(1.05) contrast(1.02)',
                            }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        {/* Left blend gradient */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: `linear-gradient(90deg, ${palette.bg} 0%, ${palette.bg}80 12%, transparent 38%)`,
                            pointerEvents: 'none',
                        }} />
                        {/* Bottom gradient for text readability */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: `linear-gradient(180deg, transparent 55%, ${palette.bg}cc 100%)`,
                            pointerEvents: 'none',
                        }} />
                        {/* Speaker name callout — styled like reference poster */}
                        {speakerName && (
                            <div style={{
                                position: 'absolute',
                                bottom: '14%',
                                right: '8%',
                                textAlign: 'right',
                                pointerEvents: 'none',
                            }}>
                                {speakerName.split(' ').map((word, i) => (
                                    <div key={i} style={{
                                        fontFamily: `'${titleFont}', sans-serif`,
                                        fontSize: '1.6rem',
                                        fontWeight: 800,
                                        color: palette.text,
                                        lineHeight: 1.05,
                                        textShadow: `0 2px 20px ${palette.bg}`,
                                        letterSpacing: '-0.5px',
                                    }}>
                                        {word}
                                    </div>
                                ))}
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
