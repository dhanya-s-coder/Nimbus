import React, { useEffect } from 'react';
import { getResponsiveTitleSize, clampStyle, loadFonts, renderLogos, renderQrCodes, renderSpeakerAvatar, truncate } from '../utils';

/**
 * SkeletonCentered — Classic centered poster layout.
 * Everything on the vertical center axis with rich visual treatments:
 * gradient-bordered info cards, glowing dividers, and bold typography.
 */
const SkeletonCentered = ({ data, palette }) => {
    useEffect(() => {
        loadFonts([
            'Bebas Neue',
            'DM Sans',
            ...(palette.titleFonts || []),
        ]);
    }, [palette]);

    const titleFont = palette.titleFonts?.[0] || 'Bebas Neue';
    const bodyFont = palette.bodyFont || 'DM Sans';
    const {
        title, subtitle, organizer, description, speakerName, speakerDesignation,
        infoItems, extraItems, collegeLogo, eventBrandLogo, speakerPhoto, qr1, qr2, footer
    } = data;

    return (
        <div style={{
            position: 'relative', zIndex: 10,
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '28px 32px 20px',
            fontFamily: `'${bodyFont}', sans-serif`,
            color: palette.text,
            
            boxSizing: 'border-box',
        }}>
            {/* ── Logo Row ── */}
            <div style={{ width: 'calc(100% - 30px)', marginBottom: '16px', position: 'relative',right:'-20px' }}>
                {renderLogos(collegeLogo, eventBrandLogo, { height: '38px', opacity: 0.92 })}
            </div>

            {/* ── Organizer Badge ── */}
            {organizer && (
                <div style={{
                    fontSize: '0.62rem',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    color: palette.accent,
                    marginBottom: '14px',
                    padding: '5px 16px',
                    background: `linear-gradient(135deg, ${palette.primary}25, ${palette.secondary}15)`,
                    border: `1px solid ${palette.primary}40`,
                    borderRadius: '20px',
                    width: 'fit-content',
                    alignSelf: 'flex-start',
                    marginLeft: '6%',
                    textAlign: 'left',
                }}>
                    {truncate(organizer, 50)}
                </div>
            )}

            {/* ── Spacer ── */}
            <div style={{ flex: '1 1 0' }} />

            {/* ── Speaker photo left, title + speaker details right ── */}
            {speakerPhoto && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', width: '88%', marginBottom: '14px', textAlign: 'left' }}>
                    {renderSpeakerAvatar(speakerPhoto, palette, 222)}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {title && (
                            <h1 style={{
                                fontFamily: `'${titleFont}', sans-serif`, fontSize: getResponsiveTitleSize(title.length),
                                fontWeight: 800, lineHeight: 1.0, textTransform: 'uppercase', letterSpacing: '-0.5px',
                                margin: '0 0 8px', color: palette.text, wordBreak: 'break-word',
                                textShadow: `0 2px 20px ${palette.primary}40`,
                            }}>{title}</h1>
                        )}
                        {speakerName && <div style={{ fontSize: '0.9rem', fontWeight: 700, color: palette.text }}>
                            {speakerName}
                            {speakerDesignation && <div style={{ fontSize: '0.6rem', color: palette.muted, marginTop: '3px' }}>{speakerDesignation}</div>}
                        </div>}
                    </div>
                </div>
            )}

            {/* ── Title ── */}
            {!speakerPhoto && title && (
                <h1 style={{
                    fontFamily: `'${titleFont}', sans-serif`,
                    fontSize: getResponsiveTitleSize(title.length),
                    fontWeight: 800,
                    lineHeight: 1.0,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.5px',
                    textAlign: 'justify',
                    textAlignLast: 'left',
                    margin: '0 0 10px',
                    color: palette.text,
                    wordBreak: 'break-word',
                    maxWidth: '100%',
                    textShadow: `0 2px 20px ${palette.primary}40, 0 0 60px ${palette.primary}15`,
                }}>
                    {title}
                </h1>
            )}

            {/* ── Subtitle / Tagline ── */}
            {subtitle && (
                <div style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: palette.secondary,
                    textAlign: 'center',
                    marginBottom: '10px',
                }}>
                    {truncate(subtitle)}
                </div>
            )}

            {/* ── Speaker Name (no photo) ── */}
            {!speakerPhoto && speakerName && (
                <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: palette.text,
                    textAlign: 'center',
                    marginBottom: speakerDesignation ? '2px' : '10px',
                    textShadow: `0 1px 8px ${palette.primary}30`,
                }}>
                    {speakerName}
                </div>
            )}
            {!speakerPhoto && speakerDesignation && !subtitle && (
                <div style={{
                    fontSize: '0.68rem',
                    color: palette.muted,
                    textAlign: 'center',
                    marginBottom: '10px',
                }}>
                    {speakerDesignation}
                </div>
            )}

            {/* ── Glowing Divider ── */}
            <div style={{
                width: '80px',
                height: '2px',
                background: `linear-gradient(90deg, transparent, ${palette.primary}, ${palette.secondary}, transparent)`,
                margin: '8px 0 14px',
                boxShadow: `0 0 12px ${palette.primary}40`,
            }} />

            {/* ── Description ── */}
            {description && (
                <div style={{
                    fontSize: '0.7rem',
                    lineHeight: 1.7,
                    color: palette.muted,
                    textAlign: 'justify',
                    textAlignLast: 'left',
                    maxWidth: '88%',
                    marginBottom: '12px',
                }}>
                    {description}
                </div>
            )}

            {/* ── Extra Items ── */}
            {extraItems && extraItems.length > 0 && (
                <div style={{
                    width: '88%',
                    marginBottom: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                }}>
                    {extraItems.map((item, i) => (
                        <div key={i} style={{
                            fontSize: '0.62rem',
                            color: palette.muted,
                            textAlign: 'center',
                            padding: '4px 12px',
                            background: `linear-gradient(135deg, ${palette.primary}12, ${palette.secondary}08)`,
                            border: `1px solid ${palette.divider}`,
                            borderRadius: '6px',
                        }}>
                            <span style={{ fontWeight: 700, color: palette.secondary, marginRight: '6px' }}>
                                {item.label}:
                            </span>
                            {truncate(typeof item.value === 'string' ? item.value : (item.value || []).join(', '), 80)}
                        </div>
                    ))}
                </div>
            )}

            {/* ── Spacer ── */}
            <div style={{ flex: '1 1 0' }} />

            {/* ── Info Cards Row ── */}
            {infoItems.length > 0 && (
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    width: '100%',
                    marginBottom: '12px',
                }}>
                    {infoItems.map((item, i) => (
                        <div key={i} style={{
                            flex: 1,
                            padding: '12px 8px',
                            background: `linear-gradient(145deg, ${palette.primary}18, ${palette.bgMid}40)`,
                            border: `1px solid ${palette.primary}40`,
                            borderRadius: '10px',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            
                        }}>
                            <div style={{
                                position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
                                background: `linear-gradient(90deg, transparent, ${palette.primary}60, transparent)`,
                            }} />
                            <div style={{
                                fontSize: '0.48rem',
                                fontWeight: 700,
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase',
                                color: palette.secondary,
                                marginBottom: '4px',
                            }}>
                                {item.label}
                            </div>
                            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: palette.text }}>
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── QR Codes ── */}
            {renderQrCodes(qr1, qr2, palette, {
                right: '500px',
                top: '24px',
                bottom: 'auto',
                scale: 0.7,
            })}

            {/* ── Footer ── */}
            <div style={{
                fontSize: '0.48rem',
                color: palette.muted,
                textAlign: 'center',
                letterSpacing: '0.5px',
                opacity: 0.6,
                borderTop: `1px solid ${palette.divider}`,
                paddingTop: '8px',
                width: '100%',
                marginTop: (qr1 || qr2) ? '8px' : '0',
            }}>
                {footer || 'For more information, visit our website or contact the coordinator.'}
            </div>
        </div>
    );
};

export default SkeletonCentered;
