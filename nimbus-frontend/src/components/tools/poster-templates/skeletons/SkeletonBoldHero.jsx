import React, { useEffect } from 'react';
import {
    clampStyle,
    loadFonts,
    renderLogos,
    renderQrCodes,
    renderSpeakerAvatar,
    truncate
} from '../utils';

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
        title,
        subtitle,
        organizer,
        description,
        speakerName,
        speakerDesignation,
        duration,
        infoItems,
        extraItems,
        collegeLogo,
        eventBrandLogo,
        speakerPhoto,
        qr1,
        qr2,
        footer,
        templateType
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
        <div
            style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: '26px 30px 20px',
                fontFamily: `'${bodyFont}', sans-serif`,
                color: palette.text,
                boxSizing: 'border-box',
                overflow: 'hidden',
            }}
        >
            {/* Top accent pair: absolute so the existing layout does not move. */}
            <div style={{
                position: 'absolute', top: '22%', left: 30, right: 30, height: '2px',
                background: `linear-gradient(90deg, ${palette.primary}, ${palette.secondary})`,
                boxShadow: `2px 4px 10px ${palette.primary}80`, pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', top: '22.80%', left: '50%', width: '240px', height: '2px',
                transform: 'translateX(-50%)',
                background: `linear-gradient(90deg, ${palette.primary}, ${palette.secondary})`,
                boxShadow: `2px 4px 10px ${palette.primary}80`, pointerEvents: 'none',
            }} />
            {/* Lightweight tech/HUD treatment for Bold Hero. */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.45, backgroundImage: `linear-gradient(${palette.primary}35 1px, transparent 1px), linear-gradient(90deg, ${palette.primary}35 1px, transparent 1px)`, backgroundSize: '28px 28px', maskImage: 'linear-gradient(to bottom, #000, transparent 78%)' }} />
            <div style={{ position: 'absolute', top: 14, right: 16, width: 58, height: 58, borderTop: `2px solid ${palette.primary}`, borderRight: `2px solid ${palette.primary}`, opacity: 0.8 }} />
            <div style={{ position: 'absolute', bottom: 14, left: 16, width: 58, height: 58, borderBottom: `2px solid ${palette.secondary}`, borderLeft: `2px solid ${palette.secondary}`, opacity: 0.8 }} />
            {templateType === 'hackathon' && (
                <div style={{ position: 'absolute', top: 82, right: 28, zIndex: 12, padding: '7px 10px', border: `1px solid ${palette.primary}`, color: palette.primary, background: `${palette.bg}cc`, fontSize: 9, fontWeight: 800, letterSpacing: 1.2, fontFamily: 'monospace', boxShadow: `0 0 14px ${palette.primary}55` }}>
                    REGISTER NOW{duration ? ` // ${duration}` : ''}
                </div>
            )}
            {/* ── Top Row ── */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                    flexShrink: 0,
                }}
            >
                <div style={{ flex: '1 1 auto' }}>
                    {renderLogos(
                        collegeLogo,
                        eventBrandLogo,
                        {
                            height: '34px',
                            opacity: 0.88
                        }
                    )}
                </div>
            </div>

            {/* ── Hero Title Zone ── */}
            <div
                style={{
                    flex: '1 1 auto',
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    overflow: 'visible',
                }}
                >
                {/* ── Title ── */}
                {title && (
                    <h1
                        style={{
                            fontFamily: `'${titleFont}', sans-serif`,
                            fontSize: heroTitleSize(title.length),
                            fontWeight: 900,
                            lineHeight: 0.92,
                            textTransform: 'uppercase',
                            letterSpacing: '-1.5px',
                            margin: '0 0 -80px',
                            color: palette.text,
                            textAlign: 'center',
                            transform: 'translateY(10px) scale(1.08)',
                            transformOrigin: 'center center',
                            wordBreak: 'break-word',
                            maxWidth: '100%',
                            flexShrink: 0,
                            textShadow: `
                                0 4px 30px ${palette.primary}50,
                                0 0 80px ${palette.primary}20
                            `,
                        }}
                    >
                        {title}
                    </h1>
                )}

                {/* ── Bold Accent Line ── */}
                <div style={{ width: '100%', height: '1px',maxWidth: '100%', height: '2px', flexShrink: 0, background: `linear-gradient(90deg, ${palette.primary}, ${palette.secondary})`, marginBottom: '-60px', borderRadius: 0, boxShadow: `2px 4px 10px ${palette.primary}80` }} />
                <div style={{ width: '240px', height: '1px', flexShrink: 0, background: `linear-gradient(90deg, ${palette.primary}, ${palette.secondary})`, marginBottom: '-80px', borderRadius: 0, boxShadow: `2px 4px 10px ${palette.primary}80`, transform: 'translateY(-32px)' }} />
                

                {/* ── Subtitle ── */}
                {subtitle && (
                    <div
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            color: palette.secondary,
                            letterSpacing: '1.5px',
                            textTransform: 'uppercase',
                            
                            marginBottom: '-60px',
                            flexShrink: 0,
                            transform: 'translateY(-40px)',
                        }}
                    >
                        {truncate(subtitle)}
                    </div>
                )}

                {templateType === 'hackathon' && (
                    <div style={{ color: palette.secondary, fontFamily: 'monospace', fontSize: '1rem', fontWeight: 800, letterSpacing: 1.5, marginBottom: 10, transform: 'translateY(80px)', border: '1px solid #000', background: 'rgba(0,0,0,0.35)', padding: '5px 10px', boxSizing: 'border-box', order: 10 }}>
                        {'> BUILD • SHIP • WIN_'}
                    </div>
                )}

                {/* ── Speaker Row ── */}
                {(speakerName || speakerPhoto) && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '0px',
                            flexShrink: 0,
                            transform: 'translateY(60px)',
                            order: 9,
                        }}
                    >
                        {renderSpeakerAvatar(
                            speakerPhoto,
                            palette,
                            222
                        )}

                        <div>
                            <div
                                style={{
                                    fontSize: '0.88rem',
                                    fontWeight: 700,
                                    color: palette.accent,
                                    lineHeight: 1.2,
                                }}
                            >
                                — {speakerName}
                            </div>

                            {speakerDesignation && (
                                <div
                                    style={{
                                        fontSize: '0.6rem',
                                        color: palette.muted,
                                        marginTop: '2px',
                                    }}
                                >
                                    {speakerDesignation}
                                </div>
                            )}
                        </div>
                        {infoItems.length > 0 && (
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: '12px', flexWrap: 'wrap' }}>
                                {infoItems.map((item, i) => (
                                    <div key={i} style={{ minWidth: '58px' }}>
                                        <div style={{ fontSize: '0.42rem', letterSpacing: '1px', textTransform: 'uppercase', color: palette.secondary, fontWeight: 700 }}>{item.label}</div>
                                        <div style={{ fontSize: '0.58rem', color: palette.text, fontWeight: 700, whiteSpace: 'nowrap' }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─────────────────────────────
                    DESCRIPTION BOX
                ───────────────────────────── */}
                {description && (
                    <div
                        style={{
                            width: '100%',
                            maxWidth: '100%',
                            minHeight: '70px',
                            boxSizing: 'border-box',
                            padding: '10px 12px',
                            marginTop: '2px',
                            marginBottom: '-150px',
                            transform: 'translateY(-20px)',
                            background: `
                                linear-gradient(
                                    135deg,
                                    ${palette.primary}12,
                                    ${palette.secondary}08
                                )
                            `,

                            border: `1px solid ${palette.primary}30`,
                            borderLeft: `3px solid ${palette.primary}`,
                            borderRadius: '7px',

                            color: '#FFFFFF',
                            fontSize: '0.7rem',
                            lineHeight: 1.55,
                            fontWeight: 400,
                            textAlign: 'justify',
                            textAlignLast: 'left',

                            display: 'block',
                            flexShrink: 0,

                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',

                            overflow: 'hidden',

                            boxShadow: `
                                inset 0 0 20px ${palette.primary}08,
                                0 0 15px ${palette.primary}08
                            `,
                        }}
                    >
                        <div
                            style={{
                                fontSize: '0.48rem',
                                fontWeight: 700,
                                letterSpacing: '1.3px',
                                textTransform: 'uppercase',
                                color: palette.secondary,
                                marginBottom: '5px',
                            }}
                        >
                            ABOUT THE EVENT
                        </div>

                        <div
                            style={{
                                color: '#FFFFFF',
                            }}
                        >
                            {description}
                        </div>
                    </div>
                )}

                {/* ── Extra Items ── */}
                {extraItems && extraItems.length > 0 && (
                    <div
                        style={{
                            
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'nowrap',
                            width: '100%',
                            marginBottom: '-20px',
                            transform: 'translateY(110px)',
                            flexShrink: 0,
                        }}
                    >
                        {extraItems.slice(0, 3).map((item, i) => (
                            <div
                                key={i}
                                style={{
                                    fontSize: '1rem',
                                    color: palette.text,
                                    padding: '18px 22px',
                                    background: `
                                        linear-gradient(
                                            135deg,
                                            ${palette.primary}18,
                                            ${palette.secondary}10
                                        )
                                    `,
                                    border: `1px solid ${palette.primary}35`,
                                    borderRadius: '6px',
                                    fontWeight: 600,
                                    flex: '1 1 0',
                                    minWidth: 0,
                                    minHeight: '85px',
                                }}
                            >
                                <div
                                style={{
                                        color: palette.secondary,
                                        fontSize: '1rem',
                                        fontWeight: 800,
                                        marginBottom: '3px',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    {item.label}:
                                </div>

                                {Array.isArray(item.value) ? (
                                    <ul
                                        style={{
                                            margin: 0,
                                            paddingLeft: '14px',
                                            listStyleType: 'disc',
                                            fontWeight: 400,
                                            fontSize: '0.95rem',
                                        }}
                                    >
                                        {item.value
                                            .slice(0, 4)
                                            .map((bullet, idx) => (
                                                <li
                                                    key={idx}
                                                    style={{
                                                        marginBottom: '2px',
                                                    }}
                                                >
                                                    {truncate(bullet, 60)}
                                                </li>
                                            ))}
                                    </ul>
                                ) : (
                                    <div
                                        style={{
                                            fontWeight: 400,
                                            fontSize: '0.95rem',
                                        }}
                                    >
                                        {truncate(item.value, 80)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Rich Info Bar ── */}
            {false && infoItems.length > 0 && (
                <div
                    style={{
                        display: 'flex',
                        gap: '0',
                        width: '100%',
                        marginBottom: '10px',
                        background: `
                            linear-gradient(
                                135deg,
                                ${palette.primary}20,
                                ${palette.bgMid}80
                            )
                        `,
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: `1px solid ${palette.primary}40`,
                        position: 'relative',
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: '10%',
                            right: '10%',
                            height: '1px',
                            background: `
                                linear-gradient(
                                    90deg,
                                    transparent,
                                    ${palette.primary}50,
                                    transparent
                                )
                            `,
                        }}
                    />

                    {infoItems.map((item, i) => (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                padding: '11px 8px',
                                textAlign: 'center',
                                borderRight:
                                    i < infoItems.length - 1
                                        ? `1px solid ${palette.primary}25`
                                        : 'none',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '0.46rem',
                                    fontWeight: 700,
                                    letterSpacing: '1.5px',
                                    textTransform: 'uppercase',
                                    color: palette.secondary,
                                    marginBottom: '3px',
                                }}
                            >
                                {item.label}
                            </div>

                            <div
                                style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    color: palette.text,
                                }}
                            >
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── QR Codes ── */}
            <div
                style={{
                    flexShrink: 0,
                }}
            >
                {renderQrCodes(qr1, qr2, palette)}
            </div>

            {/* ── Footer ── */}
            <div
                style={{
                    fontSize: '0.46rem',
                    color: palette.muted,
                    letterSpacing: '0.5px',
                    opacity: 0.6,
                    marginTop: qr1 || qr2 ? '8px' : '0',
                    flexShrink: 0,
                }}
            >
                {footer ||
                    'For more information, visit our website or contact the coordinator.'}
            </div>
        </div>
    );
};

export default SkeletonBoldHero;
