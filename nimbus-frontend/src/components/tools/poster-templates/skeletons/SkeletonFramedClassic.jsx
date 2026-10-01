import React, { useEffect } from 'react';
import { getResponsiveTitleSize, clampStyle, loadFonts, renderLogos, renderQrCodes, renderSpeakerAvatar, truncate } from '../utils';

/**
 * SkeletonFramedClassic — Formal framed layout with ornamental borders.
 * Cormorant Garamond for elegant serif typography.
 */
const SkeletonFramedClassic = ({ data, palette }) => {
    useEffect(() => {
        loadFonts([
            'Cormorant Garamond',
            'EB Garamond',
            ...(palette.titleFonts || []),
        ]);
    }, [palette]);

    const titleFont = palette.titleFonts?.[0] || 'Cormorant Garamond';
    const bodyFont = palette.bodyFont || 'EB Garamond';
    const {
        title, subtitle, organizer, description, speakerName, speakerDesignation,
        infoItems, extraItems, collegeLogo, eventBrandLogo, speakerPhoto, qr1, qr2, footer, templateType
    } = data;
    const expandedLayout = templateType !== 'academic';
    const expandedNoSpeaker = expandedLayout && !speakerName;

    return (
        <div style={{
            position: 'relative', zIndex: 10,
            width: '100%', height: '100%',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '18px',
            fontFamily: `'${bodyFont}', serif`,
            color: palette.text,
            boxSizing: 'border-box',
            opacity: 1,
        }}>
            {/* Inner Frame */}
            <div style={{
                width: '100%', height: '100%',
                padding: expandedLayout ? '34px 38px 28px' : '22px 28px 18px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                justifyContent: expandedLayout ? 'space-evenly' : 'flex-start',
                gap: expandedNoSpeaker ? '12px' : '0',
                position: 'relative',
                // Keep the framed panel translucent so the generated background remains visible.
                background: `linear-gradient(145deg, ${palette.bg}80, ${palette.bgMid}80, ${palette.bg}80)`,
                border: `1.5px solid ${palette.primary}45`,
                borderRadius: '4px',
                opacity: 1,
                boxShadow: `inset 0 0 40px ${palette.primary}08, 0 0 20px ${palette.primary}10`,
            }}>
                {/* Ornamental inner border */}
                <div style={{
                    position: 'absolute',
                    top: '7px', bottom: '7px', left: '7px', right: '7px',
                    border: `1px solid ${palette.secondary}28`,
                    borderRadius: '2px', pointerEvents: 'none',
                }} />

                {/* Corner dots */}
                {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(([v, h], i) => (
                    <div key={i} style={{
                        position: 'absolute', [v]: '3px', [h]: '3px',
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: palette.primary, opacity: 0.35,
                    }} />
                ))}

                <div style={{ marginBottom: expandedLayout ? '20px' : '12px', zIndex: 1, width: '100%' }}>
                    {renderLogos(collegeLogo, eventBrandLogo, { height: '34px', opacity: 0.88 })}
                </div>

                {organizer && (
                    <div style={{
                        fontSize: expandedLayout ? '0.8rem' : '0.56rem', letterSpacing: '2.5px', textTransform: 'uppercase',
                        fontWeight: 700, color: palette.secondary, marginBottom: '10px',
                    }}>
                        {truncate(organizer)}
                    </div>
                )}

                {/* Ornamental divider */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    marginBottom: '12px', width: '55%',
                }}>
                    <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, transparent, ${palette.primary}50)` }} />
                    <div style={{
                        width: '8px', height: '8px',
                        background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                        transform: 'rotate(45deg)', flexShrink: 0,
                        boxShadow: `0 0 6px ${palette.primary}40`,
                    }} />
                    <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${palette.primary}50, transparent)` }} />
                </div>

                {title && (
                    <h1 style={{
                        fontFamily: `'${titleFont}', serif`,
                        fontSize: expandedLayout ? `calc(${getResponsiveTitleSize(title.length)} * 1.12)` : getResponsiveTitleSize(title.length),
                        fontWeight: 700, lineHeight: 1.1, margin: '0 0 10px',
                        color: palette.text, wordBreak: 'break-word', maxWidth: '95%',
                        textShadow: `0 2px 18px ${palette.primary}30`,
                    }}>
                        {title}
                    </h1>
                )}

                {subtitle && (
                    <div style={{
                        fontSize: expandedLayout ? '1.35rem' : '1rem', fontWeight: 500, fontStyle: 'italic',
                        color: palette.secondary, marginBottom: '8px', letterSpacing: '0.3px',
                    }}>
                        {truncate(subtitle)}
                    </div>
                )}

               {/* Speaker with optional avatar */}
{/* Speaker with optional avatar */}
{speakerName && (
    <div style={{
        marginBottom: speakerPhoto ? '14px' : '8px',
        padding: '14px 24px',
        minHeight: speakerPhoto ? '170px' : '0',
        width: '88%',
        borderTop: `1px solid ${palette.divider}`,
        borderBottom: `1px solid ${palette.divider}`,
        background: `linear-gradient(90deg, transparent, ${palette.primary}08, transparent)`,
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        justifyContent: 'center',
        boxSizing: 'border-box',
        flexShrink: 0,
    }}>
        {speakerPhoto && renderSpeakerAvatar(speakerPhoto, palette, 160)}

        <div style={{
            minWidth: 0,
            textAlign: 'left',
        }}>
            <div style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: palette.text,
                lineHeight: 1.2,
            }}>
                {speakerName}
            </div>

            {speakerDesignation && (
                <div style={{
                    fontSize: '0.66rem',
                    color: palette.muted,
                    marginTop: '5px',
                    lineHeight: 1.3,
                }}>
                    {speakerDesignation}
                </div>
            )}
        </div>
    </div>
)}

                {description && (
                    <div style={{
                        fontSize: expandedLayout ? '0.86rem' : '0.66rem', fontWeight: 900, lineHeight: 1.7, color: palette.muted,
                        maxWidth: expandedLayout ? '94%' : '88%', marginBottom: '10px',
                        textAlign: 'justify', textAlignLast: 'left',
                    }}>
                        {description}
                    </div>
                )}

                {/* Extra Items */}
                {extraItems && extraItems.length > 0 && (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '10px' }}>
                        {extraItems.map((item, i) => (
                            <div key={i} style={{ textAlign: 'center', maxWidth: expandedLayout ? '48%' : '45%', flex: expandedLayout ? '1 1 45%' : '0 1 auto' }}>
                                <div style={{
                                    fontSize: expandedLayout ? '0.62rem' : '0.44rem', textTransform: 'uppercase', letterSpacing: '1.5px',
                                    fontWeight: 700, color: palette.secondary, marginBottom: '3px',
                                }}>
                                    {item.label}
                                </div>
                                {Array.isArray(item.value) ? (
                                    <ul style={{ margin: 0, paddingLeft: '14px', listStyleType: 'disc', fontSize: '0.62rem', color: palette.text, textAlign: 'left' }}>
                                        {item.value.slice(0, 4).map((bullet, idx) => (
                                            <li key={idx} style={{ marginBottom: '2px' }}>{truncate(bullet)}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div style={{ fontSize: '0.64rem', color: palette.text, fontWeight: 500 }}>
                                        {truncate(item.value)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ flex: 1 }} />

                {/* Bottom divider */}
                {infoItems.length > 0 && (
                    <>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            marginBottom: '10px', width: '40%',
                        }}>
                            <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, transparent, ${palette.secondary}40)` }} />
                            <div style={{ width: '5px', height: '5px', background: palette.secondary, transform: 'rotate(45deg)', boxShadow: `0 0 4px ${palette.secondary}40` }} />
                            <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${palette.secondary}40, transparent)` }} />
                        </div>

                        <div style={{ display: 'flex', gap: '14px', marginBottom: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {infoItems.map((item, i) => (
                                <div key={i} style={{
                                    textAlign: 'center', padding: '6px 14px',
                                    background: `linear-gradient(145deg, ${palette.primary}10, transparent)`,
                                    borderRadius: '8px',
                                }}>
                                    <div style={{
                                        fontSize: '0.46rem', fontWeight: 700, letterSpacing: '1.5px',
                                        textTransform: 'uppercase', color: palette.secondary, marginBottom: '3px',
                                    }}>
                                        {item.label}
                                    </div>
                                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: palette.text }}>
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* QR Codes */}
                {renderQrCodes(qr1, qr2, palette)}

                <div style={{ fontSize: '0.44rem', color: palette.muted, opacity: 0.6, letterSpacing: '0.3px', marginTop: (qr1 || qr2) ? '8px' : '0' }}>
                    {footer || 'For more information, visit our website or contact the coordinator.'}
                </div>
            </div>
        </div>
    );
};

export default SkeletonFramedClassic;
