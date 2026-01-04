import React from 'react';

const Logo = ({ className, textColor = "#0F172A", size = "original", showText = true }) => {
    // Dynamic viewBox based on whether we want to show the text or just the icon
    // Full Logo: 600x200
    // Icon Only: ~180x180 (centered around the circles)
    const viewBox = showText ? "0 0 600 200" : "0 0 180 180";

    // Adjust the circles' container position based on the layout
    const groupTransform = showText ? "translate(40, 20)" : "translate(5, 10)";

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBox}
            className={className}
            style={{ height: 'auto', width: size === "original" ? (showText ? '100%' : 'auto') : size }}
        >
            <defs>
                <linearGradient id="nimbusGradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <linearGradient id="nimbusGradOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FB923C" />
                    <stop offset="100%" stopColor="#F97316" />
                </linearGradient>
                <linearGradient id="nimbusGradPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A78BFA" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
            </defs>

            <g transform={groupTransform}>
                <circle cx="60" cy="110" r="55" fill="url(#nimbusGradBlue)" opacity="0.8" />
                <circle cx="120" cy="110" r="55" fill="url(#nimbusGradOrange)" opacity="0.8" />
                <circle cx="90" cy="65" r="55" fill="url(#nimbusGradPurple)" opacity="0.8" />
                <circle cx="90" cy="95" r="20" fill="white" opacity="0.3" />
            </g>

            {showText && (
                <text
                    x="240"
                    y="135"
                    fontFamily="Inter, Arial"
                    fontSize="80"
                    fontWeight="800"
                    fill={textColor}
                    letterSpacing="-3px"
                >
                    NIMBUS
                </text>
            )}
        </svg>
    );
};

export default Logo;
