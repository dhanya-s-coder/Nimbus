import React, { useEffect } from 'react';
import { getResponsiveTitleSize, clampStyle, loadFonts, renderLogos, renderQrCodes, renderSpeakerAvatar, truncate } from '../utils';

/**
 * SkeletonEditorial — Clean editorial layout with rich visual accents.
 * Left-aligned with glowing dividers and gradient speaker cards.
 * Playfair Display title + DM Sans body for elegant academic feel.
 */
const SkeletonEditorial = ({ data, palette }) => {
    useEffect(() => {
        loadFonts([
            'Playfair Display',
            'DM Sans',
            ...(palette.titleFonts || []),
        ]);
    }, [palette]);

    const titleFont = palette.titleFonts?.[0] || 'Playfair Display';
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
            padding: '26px 36px 20px',
            fontFamily: `'${bodyFont}', sans-serif`,
            color: palette.text,
            boxSizing: 'border-box',
        }}>
            <div style={{ marginBottom: '18px' }}>
                {renderLogos(collegeLogo, eventBrandLogo, { height: '36px', opacity: 0.88 })}
            </div>

            {organizer && (
                <div style={{
                    fontSize: '0.58rem', letterSpacing: '3px', textTransform: 'uppercase',
                    fontWeight: 700, color: palette.secondary, marginBottom: '6px',
                }}>
                    {truncate(organizer, 45)}
                </div>
            )}

            {/* Glowing divider */}
            <div style={{
                width: '100%', height: '1.5px', marginBottom: '16px',
                background: `linear-gradient(90deg, ${palette.primary}60, ${palette.secondary}30, transparent 60%)`,
                boxShadow: `0 0 8px ${palette.primary}20`,
            }} />

            {title && (
                <h1 style={{
                    fontFamily: `'${titleFont}', serif`,
                    fontSize: getResponsiveTitleSize(title.length),
                    fontWeight: 700, lineHeight: 1.05,
                    margin: '0 0 12px', color: palette.text,
                    wordBreak: 'break-word', maxWidth: '95%',
                    textShadow: `0 2px 20px ${palette.primary}30`,
                }}>
                    {title}
                </h1>
            )}

            {subtitle && (
                <div style={{
                    fontSize: '0.76rem', fontWeight: 500, color: palette.secondary,
                    fontStyle: 'italic', marginBottom: '12px', letterSpacing: '0.3px',
                }}>
                    {truncate(subtitle, 60)}
                </div>
            )}

            {/* Rich speaker card */}
            {speakerName && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    marginBottom: '14px', padding: '12px 16px',
                    background: `linear-gradient(135deg, ${palette.primary}15, ${palette.secondary}08)`,
                    borderRadius: '10px',
                    borderLeft: `3px solid ${palette.primary}`,
                    boxShadow: `inset 0 0 20px ${palette.primary}08`,
                }}>
                    {renderSpeakerAvatar(speakerPhoto, palette, 58)}
                    <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: palette.text }}>
                            {speakerName}
                        </div>
                        {speakerDesignation && (
                            <div style={{ fontSize: '0.6rem', color: palette.muted, marginTop: '2px', lineHeight: 1.5 }}>
                                {speakerDesignation}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {description && (
                <div style={{
                    fontSize: '0.68rem', lineHeight: 1.75, color: palette.muted,
                    marginBottom: '14px', maxWidth: '90%', ...clampStyle(4),
                }}>
                    {description}
                </div>
            )}

            {extraItems && extraItems.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                    {extraItems.map((item, i) => (
                        <div key={i} style={{
                            fontSize: '0.6rem', color: palette.muted, marginBottom: '5px',
                            paddingLeft: '14px',
                            borderLeft: `2px solid ${palette.primary}40`,
                        }}>
                            <span style={{ fontWeight: 700, color: palette.secondary }}>{item.label}: </span>
                            {truncate(typeof item.value === 'string' ? item.value : (item.value || []).join(', '), 60)}
                        </div>
                    ))}
                </div>
            )}

            <div style={{ flex: 1 }} />

            {/* Bottom glowing divider */}
            <div style={{
                width: '100%', height: '1px', marginBottom: '12px',
                background: `linear-gradient(90deg, transparent 10%, ${palette.secondary}30, ${palette.primary}50, transparent 90%)`,
                boxShadow: `0 0 6px ${palette.primary}15`,
            }} />

            {/* Info items */}
            {infoItems.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                    {infoItems.map((item, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'baseline', gap: '12px',
                            padding: '3px 0',
                        }}>
                            <div style={{
                                fontSize: '0.5rem', fontWeight: 700, letterSpacing: '1.5px',
                                textTransform: 'uppercase', color: palette.secondary, minWidth: '42px',
                            }}>
                                {item.label}
                            </div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: palette.text }}>
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* QR Codes */}
            {renderQrCodes(qr1, qr2, palette)}

            <div style={{ fontSize: '0.46rem', color: palette.muted, opacity: 0.6, letterSpacing: '0.3px', marginTop: (qr1 || qr2) ? '8px' : '0' }}>
                {footer || 'For more information, visit our website or contact the coordinator.'}
            </div>
        </div>
    );
};

export default SkeletonEditorial;
