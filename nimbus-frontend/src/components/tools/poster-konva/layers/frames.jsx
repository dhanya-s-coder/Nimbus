import React from 'react';
import { Group, Rect, Line } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H } from '../engine/constants';
import { clear, linear } from '../engine/color';
import { Editable } from '../engine/edit';
import { GradBar } from './primitives';
import { glow } from './ornaments';

/**
 * Frames sit on TOP of the layout, so the full-poster outlines are not clickable on the poster (pick=false: they
 * would cover everything); they are listed under Decorations in the Edit tab. Small pieces (corner brackets,
 * side bars) can be clicked, moved and hidden directly.
 */

export const FrameDoubleLine = ({ palette }) => (
    <Editable id="d_frame" pick={false}>
        <Group listening={false}>
            <Rect x={10} y={10} width={W - 20} height={H - 20} stroke={`${palette.primary}70`} strokeWidth={1.6} cornerRadius={2} {...glow(palette.primary, 8, 0.4)} />
            <Rect x={16} y={16} width={W - 32} height={H - 32} stroke={`${palette.secondary}50`} strokeWidth={1} cornerRadius={1} />
        </Group>
    </Editable>
);

const bracket = (id, x, y, sx, sy, color, glowColor) => (
    <Editable key={id} id={id}>
        <Line points={[x, y + sy * 35, x, y, x + sx * 35, y]} stroke={color} strokeWidth={2.5} lineJoin="miter" listening={false} {...glow(glowColor, 8, 0.5)} />
    </Editable>
);
export const FrameCornerBrackets = ({ palette }) => {
    const c = `${palette.primary}9a`;
    return (
        <>
            {bracket('d_br_tl', 14, 14, 1, 1, c, palette.primary)}
            {bracket('d_br_tr', W - 14, 14, -1, 1, c, palette.primary)}
            {bracket('d_br_bl', 14, H - 14, 1, -1, c, palette.primary)}
            {bracket('d_br_br', W - 14, H - 14, -1, -1, c, palette.primary)}
        </>
    );
};

export const FrameGradientBorder = ({ palette }) => (
    <Editable id="d_frame" pick={false}>
        <Rect
            x={8} y={8} width={W - 16} height={H - 16} strokeWidth={2} listening={false}
            strokeLinearGradientStartPoint={{ x: 8, y: 8 }}
            strokeLinearGradientEndPoint={{ x: W - 8, y: H - 8 }}
            strokeLinearGradientColorStops={[0, `${palette.primary}b0`, 0.5, `${palette.secondary}90`, 1, `${palette.accent}80`]}
        />
    </Editable>
);

export const FrameAccentSidebar = ({ palette }) => (
    <>
        <Editable id="d_side">
            <Rect x={0} y={0} width={5} height={H} listening={false}
                {...linear(0, 0, 0, H, [[0, palette.primary], [0.5, palette.secondary], [1, `${palette.accent}80`]])} />
        </Editable>
        <Editable id="d_side_top">
            <GradBar x={0} y={0} w={W} h={2} stops={[[0, palette.primary], [0.5, clear(palette.primary)], [1, clear(palette.primary)]]} />
        </Editable>
        <Editable id="d_side_bottom">
            <GradBar x={0} y={H - 1} w={W} h={1} stops={[[0, `${palette.secondary}60`], [0.4, clear(palette.secondary)], [1, clear(palette.secondary)]]} />
        </Editable>
    </>
);

export const FrameNone = () => null;

export const FRAMES = {
    'double-line': FrameDoubleLine,
    'corner-brackets': FrameCornerBrackets,
    'gradient-border': FrameGradientBorder,
    'accent-sidebar': FrameAccentSidebar,
    none: FrameNone,
};
export const getFrame = (id) => FRAMES[id] || FrameNone;
