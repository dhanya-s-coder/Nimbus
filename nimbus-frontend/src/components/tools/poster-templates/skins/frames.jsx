import React from 'react';

/**
 * Frame/Border overlays — must be VISIBLE and add structural elegance.
 * These should be noticeable design elements, not invisible whispers.
 */

const frameBase = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 10,
};

// ─── 1. Clean Double Line ─────────────────────────────────────────────────────
export const FrameDoubleLine = ({ palette }) => (
    <div style={frameBase}>
        <div style={{
            position: 'absolute',
            top: '10px', bottom: '10px', left: '10px', right: '10px',
            border: `1.5px solid ${palette.primary}50`,
            borderRadius: '2px',
        }} />
        <div style={{
            position: 'absolute',
            top: '16px', bottom: '16px', left: '16px', right: '16px',
            border: `1px solid ${palette.secondary}35`,
            borderRadius: '1px',
        }} />
    </div>
);

// ─── 2. Corner Brackets ──────────────────────────────────────────────────────
const CornerBracket = ({ top, left, bottom, right, palette }) => {
    const cornerSize = 35;
    const style = {
        position: 'absolute',
        width: `${cornerSize}px`,
        height: `${cornerSize}px`,
    };
    if (top !== undefined) style.top = `${top}px`;
    if (bottom !== undefined) style.bottom = `${bottom}px`;
    if (left !== undefined) style.left = `${left}px`;
    if (right !== undefined) style.right = `${right}px`;

    const borders = {};
    if (top !== undefined) borders.borderTop = `2.5px solid ${palette.primary}70`;
    if (bottom !== undefined) borders.borderBottom = `2.5px solid ${palette.primary}70`;
    if (left !== undefined) borders.borderLeft = `2.5px solid ${palette.primary}70`;
    if (right !== undefined) borders.borderRight = `2.5px solid ${palette.primary}70`;

    return <div style={{ ...style, ...borders }} />;
};

export const FrameCornerBrackets = ({ palette }) => (
    <div style={frameBase}>
        <CornerBracket top={14} left={14} palette={palette} />
        <CornerBracket top={14} right={14} palette={palette} />
        <CornerBracket bottom={14} left={14} palette={palette} />
        <CornerBracket bottom={14} right={14} palette={palette} />
    </div>
);

// ─── 3. Gradient Border ──────────────────────────────────────────────────────
export const FrameGradientBorder = ({ palette }) => (
    <div style={{
        ...frameBase,
        top: '8px', bottom: '8px', left: '8px', right: '8px',
        border: '2px solid transparent',
        borderImage: `linear-gradient(135deg, ${palette.primary}90, ${palette.secondary}70, ${palette.accent}60) 1`,
    }} />
);

// ─── 4. Accent Sidebar ───────────────────────────────────────────────────────
export const FrameAccentSidebar = ({ palette }) => (
    <div style={frameBase}>
        <div style={{
            position: 'absolute',
            top: 0, bottom: 0, left: 0,
            width: '5px',
            background: `linear-gradient(180deg, ${palette.primary}, ${palette.secondary}, ${palette.accent}80)`,
        }} />
        <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '2px',
            background: `linear-gradient(90deg, ${palette.primary}, transparent 50%)`,
        }} />
        <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '1px',
            background: `linear-gradient(90deg, ${palette.secondary}60, transparent 40%)`,
        }} />
    </div>
);

// ─── 5. No Frame ─────────────────────────────────────────────────────────────
export const FrameNone = () => null;

// ─── Registry ─────────────────────────────────────────────────────────────────
export const FRAMES = {
    'double-line':      { id: 'double-line',      name: 'Double Line',      component: FrameDoubleLine },
    'corner-brackets':  { id: 'corner-brackets',  name: 'Corner Brackets',  component: FrameCornerBrackets },
    'gradient-border':  { id: 'gradient-border',  name: 'Gradient Border',  component: FrameGradientBorder },
    'accent-sidebar':   { id: 'accent-sidebar',   name: 'Accent Sidebar',   component: FrameAccentSidebar },
    'none':             { id: 'none',              name: 'No Frame',         component: FrameNone },
};

export const getFrame = (id) => FRAMES[id] || FRAMES['none'];
