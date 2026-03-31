import React from 'react';

// ─── Helper: fallback accent color from event name ───────────────────────────
export const getAccentColor = (eventName = "", category = "") => {
    const n = (eventName + category).toLowerCase();
    if (n.includes("hack") || n.includes("code") || n.includes("tech"))
        return { primary: "#00FFD1", secondary: "#0088FF" };
    if (n.includes("recruit") || n.includes("career"))
        return { primary: "#FFD700", secondary: "#FFA500" };
    if (n.includes("cultural") || n.includes("fest") || n.includes("music"))
        return { primary: "#FF6B6B", secondary: "#FF8E53" };
    if (n.includes("sport") || n.includes("game") || n.includes("tournament"))
        return { primary: "#FF4500", secondary: "#FF8C00" };
    if (n.includes("workshop") || n.includes("seminar") || n.includes("talk"))
        return { primary: "#A78BFA", secondary: "#7C3AED" };
    return { primary: "#f7f456ff", secondary: "#9bde62ff" };
};

// ─── Helper: layout positions from Gemini style ──────────────────────────────
const getLayoutConfig = (style) => {
    if (!style) {
        return {
            titleTop: "35%", titleLeft: "50%",
            titleTransform: "translateX(-50%)",
            presentedByTop: "30%", dividerTop: "58%",
            descTop: "60%", benefitsTop: "67%", infoTop: "77%", footerBottom: "2%"
        };
    }
    const isUpper = style.titleVerticalZone === "upper";
    const configs = {
        minimal: {
            titleTop: isUpper ? "22%" : "35%",
            titleLeft: "50%",
            titleTransform: "translateX(-50%)",
            presentedByTop: isUpper ? "16%" : "30%",
            dividerTop: "58%", descTop: "60%",
            benefitsTop: "67%", infoTop: "76%", footerBottom: "2%"
        },
        bold: {
            titleTop: isUpper ? "24%" : "35%",
            titleLeft: "50%",
            titleTransform: "translateX(-50%)",
            presentedByTop: isUpper ? "18%" : "30%",
            dividerTop: "59%", descTop: "61%",
            benefitsTop: "68%", infoTop: "77%", footerBottom: "2%"
        },
        editorial: {
            titleTop: isUpper ? "22%" : "35%",
            titleLeft: "5%",
            titleTransform: "none",
            presentedByTop: isUpper ? "16%" : "30%",
            dividerTop: "58%", descTop: "60%",
            benefitsTop: "67%", infoTop: "76%", footerBottom: "2%"
        },
        dynamic: {
            titleTop: isUpper ? "25%" : "37%",
            titleLeft: "5%",
            titleTransform: "none",
            presentedByTop: isUpper ? "19%" : "32%",
            dividerTop: "61%", descTop: "63%",
            benefitsTop: "70%", infoTop: "78%", footerBottom: "2%"
        }
    };
    return configs[style.layoutPersonality] || configs.bold;
};

// ─── Helper: title font size based on key + character length ─────────────────
const getTitleSize = (sizeKey, nameLength) => {
    if (nameLength > 15) return "clamp(1.8rem, 5vw, 3.5rem)";
    if (nameLength > 10) return "clamp(2.2rem, 6vw, 4.5rem)";
    const sizes = {
        massive: "clamp(3rem, 9vw, 6.5rem)",
        large: "clamp(2.5rem, 7vw, 5rem)",
        balanced: "clamp(2rem, 6vw, 4.5rem)",
        elegant: "clamp(1.8rem, 5vw, 4rem)"
    };
    return sizes[sizeKey] || sizes.balanced;
};

const PosterOverlay = ({ generatedImage, posterStyle, formData, displayOrganizer, displayTitle, displayDescription, displayDate, displayTime, displayVenue }) => {

    // Display extra fields not previously handled
    const displayBenefits = formData.benefits || '';
    const displayEligibility = formData.eligibility || '';

    if (!posterStyle || !generatedImage) return null;

    const layout = getLayoutConfig(posterStyle);

    return (
        <div className="preview-content" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@600;700&family=Playfair+Display:wght@700;900&family=Space+Mono:wght@700&family=Montserrat:wght@700;900&family=Poppins:wght@400;600;700&family=Inter:wght@300;400;600;700&display=swap');
            `}</style>
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '600px',
                aspectRatio: '4/5',
                overflow: 'hidden',
                borderRadius: '12px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
            }}>
                {/* Background Image with requested 60% opacity */}
                <img
                    src={generatedImage}
                    alt="Generated Poster Template"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 0,
                        opacity: 0.7
                    }}
                />

                {/* Darkening overlay layer over the background */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    zIndex: 1
                }}></div>

                {/* Dynamic Overlay Elements */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'none',
                    zIndex: 2
                }}>
                    {/* Logos */}
                    <img
                        src="/assets/cses-logo.png"
                        alt="CSES Logo"
                        style={{
                            position: 'absolute',
                            top: '3%',
                            left: '3%',
                            height: '75px',
                            width: 'auto',
                            maxWidth: '150px',
                            objectFit: 'contain',
                            background: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '12px',
                            padding: '8px 12px'
                        }}
                        onError={(e) => { e.target.style.display = 'none' }}
                    />
                    {formData.eventLogo && (
                        <img
                            src={formData.eventLogo}
                            alt="Event Logo"
                            style={{
                                position: 'absolute',
                                top: '3%',
                                right: posterStyle.logoLayout === 'top-split' ? '3%' : 'auto',
                                left: posterStyle.logoLayout === 'top-left-stack' ? 'calc(3% + 160px)' : 'auto',
                                height: '75px',
                                width: 'auto',
                                maxWidth: '150px',
                                objectFit: 'contain',
                                background: 'rgba(255,255,255,0.15)',
                                border: '1px solid rgba(255,255,255,0.25)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '12px',
                                padding: '8px 12px'
                            }}
                        />
                    )}

                    {/* Presented By - Requested Poppins Bold */}
                    {(displayOrganizer || 'STUDENT COUNCIL') && (
                        <div style={{
                            position: 'absolute',
                            top: layout.presentedByTop,
                            left: layout.titleLeft,
                            transform: layout.titleTransform,
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: 700,
                            fontSize: 'clamp(0.65rem, 1.5vw, 0.85rem)',
                            color: 'rgba(255,255,255,0.85)',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                            textAlign: posterStyle.titleAlignment,
                            width: 'max-content'
                        }}>
                            Presented by: {displayOrganizer || 'STUDENT COUNCIL'}
                        </div>
                    )}

                    {/* Event Name */}
                    {displayTitle && (
                        <h1 style={{
                            position: 'absolute',
                            top: layout.titleTop,
                            left: layout.titleLeft,
                            transform: layout.titleTransform,
                            fontFamily: `"${posterStyle.titleFont}", sans-serif`,
                            fontSize: getTitleSize(posterStyle.titleSize, displayTitle.length),
                            fontWeight: 900,
                            color: posterStyle.primaryColor,
                            textTransform: posterStyle.titleStyle,
                            letterSpacing: posterStyle.letterSpacing,
                            lineHeight: 0.9,
                            margin: 0,
                            maxWidth: '90%',
                            wordBreak: 'break-word',
                            textAlign: posterStyle.titleAlignment,
                            textShadow: `0 0 40px ${posterStyle.primaryColor}90, 0 0 80px ${posterStyle.primaryColor}40, 0 4px 8px rgba(0,0,0,0.9)`
                        }}>
                            {displayTitle}
                        </h1>
                    )}

                    {/* Divider Line */}
                    {posterStyle.dividerStyle !== "none" && (
                        <div style={{
                            position: 'absolute',
                            top: layout.dividerTop,
                            left: '5%',
                            width: '90%',
                            height: '2px',
                            borderTop: posterStyle.dividerStyle === "dotted" ? `2px dotted ${posterStyle.primaryColor}80` : 'none',
                            background: posterStyle.dividerStyle === "gradient-line" ? `linear-gradient(90deg, transparent, ${posterStyle.primaryColor}, ${posterStyle.secondaryColor}, transparent)` : 'none'
                        }}></div>
                    )}

                    {/* Description */}
                    {displayDescription && (
                        <div style={{
                            position: 'absolute',
                            top: layout.descTop,
                            maxWidth: '88%',
                            fontFamily: "'Poppins', sans-serif",
                            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            ...(posterStyle.descriptionStyle === "bold-centered" ? {
                                fontWeight: 700,
                                fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
                                textAlign: 'center',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                color: 'rgba(255,255,255,0.95)'
                            } : posterStyle.descriptionStyle === "left-accent-bar" ? {
                                fontWeight: 600,
                                fontSize: 'clamp(0.8rem, 1.8vw, 1rem)',
                                textAlign: 'left',
                                left: '5%',
                                borderLeft: `3px solid ${posterStyle.primaryColor}`,
                                paddingLeft: '12px',
                                color: 'rgba(255,255,255,0.9)'
                            } : {
                                fontWeight: 400,
                                fontStyle: 'italic',
                                fontSize: 'clamp(0.85rem, 2vw, 1rem)',
                                textAlign: 'center',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                color: 'rgba(255,255,255,0.85)'
                            })
                        }}>
                            {displayDescription}
                        </div>
                    )}

                    {/* Benefits and Eligibility */}
                    {(displayBenefits || displayEligibility) && (
                        <div style={{
                            position: 'absolute',
                            top: layout.benefitsTop,
                            left: posterStyle.titleAlignment === 'center' ? '50%' : '5%',
                            transform: posterStyle.titleAlignment === 'center' ? 'translateX(-50%)' : 'none',
                            width: '90%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
                            color: 'rgba(255,255,255,0.9)',
                            textAlign: posterStyle.titleAlignment === 'center' ? 'center' : 'left',
                            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                        }}>
                            {displayBenefits && (
                                <div><span style={{ color: posterStyle.primaryColor, fontWeight: 700 }}>✨ Highlights:</span> {displayBenefits}</div>
                            )}
                            {displayEligibility && (
                                <div><span style={{ color: posterStyle.secondaryColor || posterStyle.primaryColor, fontWeight: 700 }}>👥 Eligibility:</span> {displayEligibility}</div>
                            )}
                        </div>
                    )}

                    {/* Info Element */}
                    {(displayDate || displayTime || displayVenue) && (
                        <div style={{
                            position: 'absolute',
                            top: layout.infoTop,
                            width: '90%',
                            left: '5%',
                            ...(posterStyle.infoStyle === "pills-row" ? {
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '8px'
                            } : posterStyle.infoStyle === "stacked" ? {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px'
                            } : {
                                background: 'rgba(0,0,0,0.45)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '50px',
                                padding: '10px 24px',
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                textAlign: 'center',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.2)'
                            })
                        }}>
                            {posterStyle.infoStyle === "inline" ? (
                                <>
                                    {displayDate && `📅 ${displayDate}`}
                                    {displayDate && displayTime && `  •  `}
                                    {displayTime && `🕐 ${displayTime}`}
                                    {(displayDate || displayTime) && displayVenue && `  •  `}
                                    {displayVenue && `📍 ${displayVenue}`}
                                </>
                            ) : (
                                <>
                                    {displayDate && (
                                        <div style={
                                            posterStyle.infoStyle === "pills-row" ? {
                                                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                                background: 'rgba(0,0,0,0.5)', border: `1px solid ${posterStyle.primaryColor}40`,
                                                backdropFilter: 'blur(10px)', borderRadius: '14px', padding: '10px 8px',
                                                fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)', color: '#fff'
                                            } : {
                                                display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.4)',
                                                backdropFilter: 'blur(8px)', borderLeft: `3px solid ${posterStyle.primaryColor}`, borderRadius: '0 10px 10px 0',
                                                padding: '6px 14px', fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '0.85rem', color: '#fff'
                                            }
                                        }>
                                            {posterStyle.infoStyle === "pills-row" ? <span style={{ fontSize: '1.2rem' }}>📅</span> : <span>📅</span>}
                                            {displayDate}
                                        </div>
                                    )}
                                    {displayTime && (
                                        <div style={
                                            posterStyle.infoStyle === "pills-row" ? {
                                                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                                background: 'rgba(0,0,0,0.5)', border: `1px solid ${posterStyle.primaryColor}40`,
                                                backdropFilter: 'blur(10px)', borderRadius: '14px', padding: '10px 8px',
                                                fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)', color: '#fff'
                                            } : {
                                                display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.4)',
                                                backdropFilter: 'blur(8px)', borderLeft: `3px solid ${posterStyle.primaryColor}`, borderRadius: '0 10px 10px 0',
                                                padding: '6px 14px', fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '0.85rem', color: '#fff'
                                            }
                                        }>
                                            {posterStyle.infoStyle === "pills-row" ? <span style={{ fontSize: '1.2rem' }}>🕐</span> : <span>🕐</span>}
                                            {displayTime}
                                        </div>
                                    )}
                                    {displayVenue && (
                                        <div style={
                                            posterStyle.infoStyle === "pills-row" ? {
                                                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                                background: 'rgba(0,0,0,0.5)', border: `1px solid ${posterStyle.primaryColor}40`,
                                                backdropFilter: 'blur(10px)', borderRadius: '14px', padding: '10px 8px',
                                                fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)', color: '#fff'
                                            } : {
                                                display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.4)',
                                                backdropFilter: 'blur(8px)', borderLeft: `3px solid ${posterStyle.primaryColor}`, borderRadius: '0 10px 10px 0',
                                                padding: '6px 14px', fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '0.85rem', color: '#fff'
                                            }
                                        }>
                                            {posterStyle.infoStyle === "pills-row" ? <span style={{ fontSize: '1.2rem' }}>📍</span> : <span>📍</span>}
                                            {displayVenue}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Bottom Strip */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0, left: 0, right: 0,
                        padding: '10px 16px',
                        background: 'rgba(0,0,0,0.55)',
                        backdropFilter: 'blur(12px)',
                        borderTop: `1px solid ${posterStyle.primaryColor}30`,
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 300,
                        fontSize: 'clamp(0.65rem, 1.4vw, 0.8rem)',
                        color: 'rgba(255,255,255,0.7)',
                        textAlign: 'center'
                    }}>
                        For more info, visit our website or contact the coordinator.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PosterOverlay;
