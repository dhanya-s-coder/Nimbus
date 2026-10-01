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
    // Editorial uses the form's Subheading/Description order explicitly.
    const editorialSubtitle = description;
    const editorialDescription = subtitle;

    return (
        <div style={{
            position: 'relative', zIndex: 10,
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            padding: '12px 36px 20px',
            fontFamily: `'${bodyFont}', sans-serif`,
            color: palette.text,
            boxSizing: 'border-box',
        }}>
           <div style={{
    marginBottom: '18px',
    width: 'calc(100% + 40px)',
    marginLeft: '40px',
    overflow: 'visible',
}}>
    {renderLogos(
        collegeLogo,
        eventBrandLogo,
        { height: '36px', opacity: 0.88 },
        {
            overflow: 'visible',
            transform: 'none',
            width: '100%',
            marginLeft: 0,
            marginRight: '10px',
            boxSizing: 'border-box',
        }
    )}
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

            {editorialSubtitle && (
                <div style={{
                    fontSize: '0.85rem', fontWeight: 900, color: palette.secondary,
                    fontStyle: 'italic', marginBottom: '12px', letterSpacing: '0.3px',
                }}>
                    {editorialSubtitle}
                </div>
            )}

            {/* Rich speaker card */}
            {(speakerName || speakerPhoto) && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    marginBottom: '14px', padding: '12px 16px',
                    background: `linear-gradient(135deg, ${palette.primary}15, ${palette.secondary}08)`,
                    borderRadius: '10px',
                    borderLeft: `3px solid ${palette.primary}`,
                    boxShadow: `inset 0 0 20px ${palette.primary}08`,
                }}>
                    {renderSpeakerAvatar(speakerPhoto, palette, 222)}
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 900,WebkitTextStroke: '0.4px #ffffff', color: palette.text }}>
                            {speakerName}
                        </div>
                        {speakerDesignation && (
                            <div style={{ fontSize: '1.1rem', color: 'white', marginTop: '2px', lineHeight: 1.5 }}>
                                {speakerDesignation}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {editorialDescription && (
                <div style={{
                    fontSize: '0.75rem', lineHeight: 1.75,fontWeight: 600, color: palette.muted,
                    marginBottom: '14px', width: '100%', maxWidth: '100%', color: '#FFFFFF',
                }}>
                    {editorialDescription}
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
{/* Info items */}
{infoItems.length > 0 && (
    <div style={{
        position: 'absolute',
        left: '36px',
        right: '36px',
        bottom: '92px',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        gap: '7px',
        alignItems: 'center',
    }}>
        {infoItems.map((item, i) => {
            const label = item.label?.toLowerCase();

            const icon = label.includes('date') ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="17" rx="2"
                        stroke={palette.secondary} strokeWidth="2" />
                    <path d="M16 2V6M8 2V6M3 10H21"
                        stroke={palette.secondary} strokeWidth="2"
                        strokeLinecap="round" />
                </svg>
            ) : label.includes('time') ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9"
                        stroke={palette.secondary} strokeWidth="2" />
                    <path d="M12 7V12L15 14"
                        stroke={palette.secondary} strokeWidth="2"
                        strokeLinecap="round" />
                </svg>
            ) : label.includes('venue') || label.includes('location') ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M20 10C20 15.5 12 21 12 21S4 15.5 4 10C4 5.6 7.6 3 12 3C16.4 3 20 5.6 20 10Z"
                        stroke={palette.secondary} strokeWidth="2" />
                    <circle cx="12" cy="10" r="2.5"
                        stroke={palette.secondary} strokeWidth="2" />
                </svg>
            ) : null;

            return (
                <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    height: '38px',
                    padding: '4px 8px',
                    background: `linear-gradient(135deg, ${palette.primary}28, ${palette.secondary}12)`,
                    border: `1px solid ${palette.secondary}45`,
                    borderRadius: '6px',
                    boxShadow: `0 2px 8px ${palette.primary}20`,
                    boxSizing: 'border-box',
                    flex: '0 0 auto',
                }}>
                    {icon}

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1px',
                    }}>
                        <div style={{
                            fontSize: '0.4rem',
                            fontWeight: 800,
                            letterSpacing: '0.8px',
                            textTransform: 'uppercase',
                            color: palette.secondary,
                            lineHeight: 2,
                        }}>
                            {item.label}
                        </div>

                        <div style={{
                            fontSize: '0.55rem',
                            fontWeight: 800,
                            color: '#FFFFFF',
                            lineHeight: 1.1,
                            maxWidth: '90px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {item.value}
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
)}

            {/* QR Codes */}
            {(qr1 || qr2) && (
                <div style={{
                    position: 'absolute', right: '22px', bottom: '18px',
                    width: '220px', maxWidth: '42%', zIndex: 20,
                    transform: 'scale(0.65)', transformOrigin: 'bottom right',
                    display: 'flex', justifyContent: 'flex-end',
                }}>
                    {renderQrCodes(qr1, qr2, palette)}
                </div>
            )}

            <div style={{ fontSize: '0.46rem', color: palette.muted, opacity: 0.6, letterSpacing: '0.3px', marginTop: (qr1 || qr2) ? '8px' : '0' }}>
                {footer || 'For more information, visit our website or contact the coordinator.'}
            </div>
        </div>
    );
};

export default SkeletonEditorial;
