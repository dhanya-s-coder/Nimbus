import React, { useEffect } from 'react';
import { getResponsiveTitleSize, clampStyle, loadFonts, renderLogos, renderQrCodes, renderSpeakerAvatar, truncate } from '../utils';

/**
 * SkeletonAsymmetric — Modern offset layout with staggered gradient info cards.
 * Dynamic, energetic, contemporary — Space Grotesk title + DM Sans body.
 */
const SkeletonAsymmetric = ({ data, palette }) => {
    useEffect(() => {
        loadFonts([
            'Space Grotesk',
            'DM Sans',
            ...(palette.titleFonts || []),
        ]);
    }, [palette]);

    const titleFont = palette.titleFonts?.[0] || 'Space Grotesk';
    const bodyFont = palette.bodyFont || 'DM Sans';
    const {
        title, subtitle, organizer, description, speakerName, speakerDesignation,
        infoItems, extraItems, collegeLogo, eventBrandLogo, speakerPhoto, qr1, qr2, footer
    } = data;

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
            {/* Logo row */}
            <div style={{ marginBottom: '14px' }}>
                {renderLogos(collegeLogo, eventBrandLogo, { height: '34px', opacity: 0.88 })}
            </div>

            {organizer && (
                <div style={{
                    fontSize: '0.52rem', letterSpacing: '2.5px', textTransform: 'uppercase',
                    fontWeight: 700, color: palette.secondary, textAlign: 'right',
                    maxWidth: '100%', lineHeight: 1.4, marginBottom: '8px',
                }}>
                    {truncate(organizer, 40)}
                </div>
            )}

            <div style={{ flex: '0.5 1 0' }} />

            {/* Title with left accent bar */}
            <div style={{ marginBottom: '10px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{
                    width: '4px', flexShrink: 0,
                    background: `linear-gradient(180deg, ${palette.primary}, ${palette.secondary}, transparent)`,
                    borderRadius: '2px', alignSelf: 'stretch',
                    boxShadow: `0 0 10px ${palette.primary}30`,
                }} />
                <div>
                    {title && (
                        <h1 style={{
                            fontFamily: `'${titleFont}', sans-serif`,
                            fontSize: getResponsiveTitleSize(title.length),
                            fontWeight: 800, lineHeight: 0.98, textTransform: 'uppercase',
                            letterSpacing: '-1px', margin: 0, color: palette.text,
                            wordBreak: 'break-word', maxWidth: '100%',
                            textShadow: `0 3px 25px ${palette.primary}40`,
                        }}>
                            {title}
                        </h1>
                    )}
                </div>
            </div>

            {subtitle && (
                <div style={{
                    fontSize: '0.72rem', fontWeight: 600, color: palette.secondary,
                    letterSpacing: '1px', marginBottom: '6px', paddingLeft: '18px',
                }}>
                    {truncate(subtitle, 50)}
                </div>
            )}

            {/* Speaker row */}
            {speakerName && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    marginBottom: '8px', paddingLeft: '18px',
                }}>
                    {renderSpeakerAvatar(speakerPhoto, palette, 52)}
                    <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: palette.accent }}>
                            {speakerName}
                        </div>
                        {speakerDesignation && (
                            <div style={{ fontSize: '0.56rem', color: palette.muted, marginTop: '1px' }}>
                                {speakerDesignation}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {description && (
                <div style={{
                    fontSize: '0.64rem', lineHeight: 1.65, color: palette.muted,
                    marginBottom: '12px', maxWidth: '80%', ...clampStyle(3),
                    paddingLeft: '18px',
                }}>
                    {description}
                </div>
            )}

            {/* Extra Items */}
            {extraItems && extraItems.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px', maxWidth: '85%' }}>
                    {extraItems.slice(0, 3).map((item, i) => (
                        <div key={i} style={{
                            padding: '6px 12px', borderLeft: `2px solid ${palette.secondary}`,
                            background: `linear-gradient(90deg, ${palette.primary}15, transparent)`,
                        }}>
                            <div style={{ fontSize: '0.44rem', textTransform: 'uppercase', color: palette.secondary, fontWeight: 700, marginBottom: '2px' }}>
                                {item.label}
                            </div>
                            {Array.isArray(item.value) ? (
                                <ul style={{ margin: 0, paddingLeft: '14px', listStyleType: 'disc', fontSize: '0.6rem', color: palette.text, fontWeight: 500 }}>
                                    {item.value.slice(0, 4).map((bullet, idx) => (
                                        <li key={idx} style={{ marginBottom: '2px' }}>{truncate(bullet, 40)}</li>
                                    ))}
                                </ul>
                            ) : (
                                <div style={{ fontSize: '0.6rem', color: palette.text, fontWeight: 500 }}>
                                    {truncate(item.value, 50)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div style={{ flex: '1 1 0' }} />

            {/* Staggered gradient info cards */}
            {infoItems.length > 0 && (
                <div style={{
                    display: 'flex', flexDirection: 'column', gap: '7px',
                    marginBottom: '14px', alignItems: 'flex-start',
                }}>
                    {infoItems.map((item, i) => (
                        <div key={i} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '10px',
                            padding: '9px 16px',
                            background: `linear-gradient(135deg, ${palette.bgMid}D9, ${palette.bg}F2)`,
                            border: `1px solid ${palette.primary}40`,
                            borderRadius: '8px',
                            marginLeft: `${i * 28}px`,
                            position: 'relative', overflow: 'hidden',
                        }}>
                            <div style={{
                                position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '2px',
                                background: `linear-gradient(180deg, ${palette.primary}, ${palette.secondary})`,
                                boxShadow: `0 0 8px ${palette.primary}40`,
                            }} />
                            <div style={{
                                fontSize: '0.46rem', fontWeight: 700, letterSpacing: '1px',
                                textTransform: 'uppercase', color: palette.secondary, paddingLeft: '6px',
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

            {/* QR Codes */}
            {renderQrCodes(qr1, qr2, palette)}

            <div style={{ fontSize: '0.46rem', color: palette.muted, opacity: 0.6, textAlign: 'right', marginTop: (qr1 || qr2) ? '8px' : '0' }}>
                {footer || 'For more info, visit our website or contact the coordinator.'}
            </div>
        </div>
    );
};

export default SkeletonAsymmetric;
