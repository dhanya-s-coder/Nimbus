import React, { useEffect } from 'react';
import { clampStyle, loadFonts, renderLogos, renderQrCodes, renderSpeakerAvatar, truncate } from '../utils';

/**
 * SkeletonBoldHero — Title-dominant layout with massive visual impact.
 * Rich gradient info bar, glowing accent lines, dramatic Bebas Neue typography.
 */
const SkeletonBoldHero = ({ data, palette }) => {
    useEffect(() => {
        loadFonts([
            'Bebas Neue',
            'Outfit',
            ...(palette.titleFonts || []),
        ]);
    }, [palette]);

    const titleFont = palette.titleFonts?.[0] || 'Bebas Neue';
    const bodyFont = palette.bodyFont || 'Outfit';
    const {
        title, subtitle, organizer, description, speakerName, speakerDesignation,
        infoItems, extraItems, collegeLogo, eventBrandLogo, speakerPhoto, qr1, qr2, footer
    } = data;

    const heroTitleSize = (len) => {
        if (!len) return '4.5rem';
        if (len > 40) return '2.2rem';
        if (len > 30) return '2.8rem';
        if (len > 20) return '3.5rem';
        if (len > 12) return '4.2rem';
        return '5rem';
    };

    return (
        <div style={{
            position: 'relative', zIndex: 10,
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            padding: '26px 30px 20px',
            fontFamily: `'${bodyFont}', sans-serif`,
            color: palette.text,
            boxSizing: 'border-box',
        }}>
            {/* ── Top Row ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: '1 1 auto' }}>
                    {renderLogos(collegeLogo, eventBrandLogo, { height: '34px', opacity: 0.88 })}
                </div>
            </div>

            {/* ── Hero Title Zone ── */}
            <div style={{
                flex: '1 1 0', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'flex-start',
            }}>
                {title && (
                    <h1 style={{
                        fontFamily: `'${titleFont}', sans-serif`,
                        fontSize: heroTitleSize(title.length),
                        fontWeight: 900, lineHeight: 0.92, textTransform: 'uppercase',
                        letterSpacing: '-1.5px', margin: '0 0 12px',
                        color: palette.text, wordBreak: 'break-word', maxWidth: '100%',
                        textShadow: `0 4px 30px ${palette.primary}50, 0 0 80px ${palette.primary}20`,
                    }}>
                        {title}
                    </h1>
                )}

                {/* Bold accent line */}
                <div style={{
                    width: '60px', height: '3px',
                    background: `linear-gradient(90deg, ${palette.primary}, ${palette.secondary})`,
                    marginBottom: '12px', borderRadius: '2px',
                    boxShadow: `0 0 10px ${palette.primary}50`,
                }} />

                {subtitle && (
                    <div style={{
                        fontSize: '0.82rem', fontWeight: 600, color: palette.secondary,
                        letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px',
                    }}>
                        {truncate(subtitle, 50)}
                    </div>
                )}

                {/* Speaker row with optional avatar */}
                {speakerName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        {renderSpeakerAvatar(speakerPhoto, palette, 56)}
                        <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: palette.accent, lineHeight: 1.2 }}>
                                — {speakerName}
                            </div>
                            {speakerDesignation && (
                                <div style={{ fontSize: '0.6rem', color: palette.muted, marginTop: '2px' }}>
                                    {speakerDesignation}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {organizer && (
                    <div style={{
                        fontSize: '0.56rem', letterSpacing: '2.5px', textTransform: 'uppercase',
                        fontWeight: 700, color: palette.muted, marginBottom: '8px',
                    }}>
                        {truncate(organizer, 50)}
                    </div>
                )}

                {description && (
                    <div style={{
                        fontSize: '0.7rem', lineHeight: 1.65, color: palette.muted,
                        maxWidth: '85%', ...clampStyle(3),
                    }}>
                        {description}
                    </div>
                )}
            </div>

            {/* ── Extra Items ── */}
            {extraItems && extraItems.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {extraItems.slice(0, 3).map((item, i) => (
                        <div key={i} style={{
                            fontSize: '0.6rem', color: palette.text, padding: '7px 12px',
                            background: `linear-gradient(135deg, ${palette.primary}18, ${palette.secondary}10)`,
                            border: `1px solid ${palette.primary}35`,
                            borderRadius: '6px', fontWeight: 600,
                            minWidth: '40%',
                        }}>
                            <div style={{ color: palette.secondary, marginBottom: '3px', letterSpacing: '0.5px' }}>{item.label}:</div>
                            {Array.isArray(item.value) ? (
                                <ul style={{ margin: 0, paddingLeft: '14px', listStyleType: 'disc', fontWeight: 400 }}>
                                    {item.value.slice(0, 4).map((bullet, idx) => (
                                        <li key={idx} style={{ marginBottom: '2px' }}>{truncate(bullet, 60)}</li>
                                    ))}
                                </ul>
                            ) : (
                                <div style={{ fontWeight: 400 }}>{truncate(item.value, 80)}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ── Rich Info Bar ── */}
            {infoItems.length > 0 && (
                <div style={{
                    display: 'flex', gap: '0', width: '100%', marginBottom: '10px',
                    background: `linear-gradient(135deg, ${palette.primary}20, ${palette.bgMid}80)`,
                    borderRadius: '10px', overflow: 'hidden',
                    border: `1px solid ${palette.primary}40`,
                    position: 'relative',
                }}>
                    <div style={{
                        position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
                        background: `linear-gradient(90deg, transparent, ${palette.primary}50, transparent)`,
                    }} />
                    {infoItems.map((item, i) => (
                        <div key={i} style={{
                            flex: 1, padding: '11px 8px', textAlign: 'center',
                            borderRight: i < infoItems.length - 1 ? `1px solid ${palette.primary}25` : 'none',
                        }}>
                            <div style={{
                                fontSize: '0.46rem', fontWeight: 700, letterSpacing: '1.5px',
                                textTransform: 'uppercase', color: palette.secondary, marginBottom: '3px',
                            }}>
                                {item.label}
                            </div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: palette.text }}>
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── QR Codes ── */}
            {renderQrCodes(qr1, qr2, palette)}

            {/* ── Footer ── */}
            <div style={{ fontSize: '0.46rem', color: palette.muted, letterSpacing: '0.5px', opacity: 0.6, marginTop: (qr1 || qr2) ? '8px' : '0' }}>
                {footer || 'For more information, visit our website or contact the coordinator.'}
            </div>
        </div>
    );
};

export default SkeletonBoldHero;
