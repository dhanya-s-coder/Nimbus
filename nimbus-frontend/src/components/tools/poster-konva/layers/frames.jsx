import React from 'react';
import { Group, Rect, Line } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H } from '../engine/constants';
import { clear, linear } from '../engine/color';
import { GradBar } from './primitives';

export const FrameDoubleLine = ({ palette }) => (
    <Group listening={false}>
        <Rect x={10} y={10} width={W - 20} height={H - 20} stroke={`${palette.primary}50`} strokeWidth={1.5} cornerRadius={2} />
        <Rect x={16} y={16} width={W - 32} height={H - 32} stroke={`${palette.secondary}35`} strokeWidth={1} cornerRadius={1} />
    </Group>
);

const bracket = (x, y, sx, sy, color) => (
    <Line key={`${x}-${y}`} points={[x, y + sy * 35, x, y, x + sx * 35, y]} stroke={color} strokeWidth={2.5} lineJoin="miter" />
);
export const FrameCornerBrackets = ({ palette }) => {
    const c = `${palette.primary}70`;
    return (
        <Group listening={false}>
            {bracket(14, 14, 1, 1, c)}
            {bracket(W - 14, 14, -1, 1, c)}
            {bracket(14, H - 14, 1, -1, c)}
            {bracket(W - 14, H - 14, -1, -1, c)}
        </Group>
    );
};

export const FrameGradientBorder = ({ palette }) => (
    <Rect
        x={8} y={8} width={W - 16} height={H - 16} strokeWidth={2} listening={false}
        strokeLinearGradientStartPoint={{ x: 8, y: 8 }}
        strokeLinearGradientEndPoint={{ x: W - 8, y: H - 8 }}
        strokeLinearGradientColorStops={[0, `${palette.primary}90`, 0.5, `${palette.secondary}70`, 1, `${palette.accent}60`]}
    />
);

export const FrameAccentSidebar = ({ palette }) => (
    <Group listening={false}>
        <Rect x={0} y={0} width={5} height={H}
            {...linear(0, 0, 0, H, [[0, palette.primary], [0.5, palette.secondary], [1, `${palette.accent}80`]])} />
        <GradBar x={0} y={0} w={W} h={2} stops={[[0, palette.primary], [0.5, clear(palette.primary)], [1, clear(palette.primary)]]} />
        <GradBar x={0} y={H - 1} w={W} h={1} stops={[[0, `${palette.secondary}60`], [0.4, clear(palette.secondary)], [1, clear(palette.secondary)]]} />
    </Group>
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
