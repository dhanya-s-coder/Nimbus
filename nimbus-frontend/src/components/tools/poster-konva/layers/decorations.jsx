import React from 'react';
import { Group, Rect, Circle, Line, Path } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H } from '../engine/constants';
import { clear } from '../engine/color';
import { RadialEllipse, GradBar } from './primitives';

const orb = (cx, cy, rx, ry, color, stop) => (
    <RadialEllipse cx={cx} cy={cy} rx={rx} ry={ry} stops={[[0, color], [stop, clear(color)], [1, clear(color)]]} />
);

export const DecoGlowOrbs = ({ palette }) => (
    <Group listening={false}>
        {orb(W + 30 - 140, -40 + 110, 170, 135, `${palette.primary}28`, 0.68)}
        {orb(-40 + 120, H + 50 - 90, 150, 112, `${palette.secondary}16`, 0.7)}
    </Group>
);

export const DecoGeometricShapes = ({ palette }) => (
    <Group listening={false}>
        <Rect x={W - 20 - 120} y={20} width={120} height={120} stroke={`${palette.primary}40`} strokeWidth={1.5} cornerRadius={4}
            offsetX={60} offsetY={60} rotation={15} />
        <Rect x={W - 45 - 70} y={45} width={70} height={70} stroke={`${palette.secondary}30`} strokeWidth={1} cornerRadius={2}
            offsetX={35} offsetY={35} rotation={30} />
        <Circle x={20 + 40} y={H - 50 - 40} radius={40} stroke={`${palette.secondary}35`} strokeWidth={1.5} />
        <Circle x={35 + 25} y={H - 65 - 25} radius={25} stroke={`${palette.accent}25`} strokeWidth={1} />
        <Rect x={W - 15 - 12} y={H / 2 + 12} width={24} height={24} stroke={`${palette.accent}40`} strokeWidth={1.5}
            offsetX={12} offsetY={12} rotation={45} />
        {[[`${palette.primary}50`, 22.5, 92.5, 2.5], [`${palette.secondary}40`, 35.5, 92.5, 2.5], [`${palette.accent}35`, 48.5, 92.5, 2.5],
            [`${palette.primary}35`, 24, 105, 2], [`${palette.secondary}30`, 36, 105, 2]].map(([c, x, y, r], i) => (
            <Circle key={i} x={x} y={y} radius={r} fill={c} />
        ))}
        <GradBar x={W - 25 - 60} y={H - 30} w={60} h={1} stops={[[0, clear(palette.primary)], [1, `${palette.primary}50`]]} />
        <GradBar x={W - 35 - 40} y={H - 38} w={40} h={1} stops={[[0, clear(palette.secondary)], [1, `${palette.secondary}40`]]} />
    </Group>
);

const CornerArcs = ({ palette }) => (
    <>
        <Path data="M160 0 A160 160 0 0 1 0 160" stroke={palette.primary} strokeWidth={1.5} opacity={0.25} />
        <Path data="M160 0 A120 120 0 0 1 40 160" stroke={palette.secondary} strokeWidth={1} opacity={0.18} />
        <Path data="M160 0 A80 80 0 0 1 80 160" stroke={palette.accent} strokeWidth={0.8} opacity={0.12} />
    </>
);

export const DecoCornerAccents = ({ palette }) => (
    <Group listening={false}>
        <Group x={W - 160} y={0}><CornerArcs palette={palette} /></Group>
        <Group x={160} y={H - 160} rotation={180}><CornerArcs palette={palette} /></Group>
        <Circle x={19} y={19} radius={4} fill={`${palette.primary}30`} />
        <Circle x={W - 19} y={H - 19} radius={4} fill={`${palette.secondary}30`} />
    </Group>
);

export const DecoAccentLines = ({ palette }) => (
    <Group listening={false}>
        <GradBar x={28} y={28} w={W - 56} h={1.5} stops={[[0, `${palette.primary}45`], [0.3, `${palette.secondary}30`], [0.7, clear(palette.secondary)], [1, clear(palette.secondary)]]} />
        <GradBar x={28} y={34} w={W * 0.35} h={1} stops={[[0, `${palette.secondary}30`], [1, clear(palette.secondary)]]} />
        <GradBar x={28} y={H - 28 - 1.5} w={W - 56} h={1.5} stops={[[0, clear(palette.secondary)], [0.3, clear(palette.secondary)], [0.6, `${palette.secondary}30`], [1, `${palette.primary}45`]]} />
        <GradBar x={W - 28 - W * 0.35} y={H - 34 - 1} w={W * 0.35} h={1} stops={[[0, clear(palette.secondary)], [1, `${palette.secondary}30`]]} />
        <GradBar x={W - 28 - 1} y={60} w={1} h={H - 120} dir="v" stops={[[0, clear(palette.primary)], [0.5, `${palette.primary}20`], [1, clear(palette.primary)]]} />
    </Group>
);

const GoldCorner = ({ palette }) => (
    <>
        <Path data="M8 50 L8 8 L50 8" stroke={palette.accent} strokeWidth={2.5} opacity={0.85} lineCap="round" lineJoin="round" />
        <Path data="M12 40 L12 12 L40 12" stroke={palette.secondary} strokeWidth={1.2} opacity={0.6} lineCap="round" lineJoin="round" />
        <Rect x={8} y={8} width={8} height={8} offsetX={4} offsetY={4} rotation={45} fill={palette.accent} opacity={0.7} />
        {[20, 32, 44].map((v) => <Circle key={`x${v}`} x={v} y={8} radius={1.2} fill={palette.secondary} opacity={0.6} />)}
        {[20, 32, 44].map((v) => <Circle key={`y${v}`} x={8} y={v} radius={1.2} fill={palette.secondary} opacity={0.6} />)}
    </>
);

export const DecoGoldCorners = ({ palette }) => (
    <Group listening={false}>
        <Group x={0} y={0}><GoldCorner palette={palette} /></Group>
        <Group x={W} y={0} scaleX={-1}><GoldCorner palette={palette} /></Group>
        <Group x={0} y={H} scaleY={-1}><GoldCorner palette={palette} /></Group>
        <Group x={W} y={H} scaleX={-1} scaleY={-1}><GoldCorner palette={palette} /></Group>
        <Rect x={18} y={18} width={W - 36} height={H - 36} stroke={`${palette.secondary}35`} strokeWidth={1} cornerRadius={2} />
        <RadialEllipse cx={W / 2} cy={H + 30} rx={W * 0.4} ry={60}
            stops={[[0, `${palette.secondary}22`], [0.7, clear(palette.secondary)], [1, clear(palette.secondary)]]} />
    </Group>
);

const NET_LINES = [
    [[10, 10], [80, 30], [150, 10], [190, 60]],
    [[80, 30], [120, 80], [190, 60]],
    [[10, 10], [50, 90]],
    [[50, 90], [120, 80]],
];
const NET_NODES = [[10, 10], [80, 30], [150, 10], [190, 60], [120, 80], [50, 90]];

export const DecoNetworkLines = ({ palette }) => (
    <Group listening={false}>
        <Group x={W - 200} y={0} opacity={0.25}>
            {NET_LINES.flatMap((line, i) => line.slice(0, -1).map((pt, j) => (
                <Line key={`${i}-${j}`} points={[...pt, ...line[j + 1]]} stroke={palette.secondary} strokeWidth={0.6} />
            )))}
            {NET_NODES.map(([x, y], i) => <Circle key={i} x={x} y={y} radius={2.5} fill={palette.primary} opacity={0.8} />)}
        </Group>
        <GradBar x={22} y={H - 22 - 1.5} w={W - 44} h={1.5}
            stops={[[0, clear(palette.primary)], [0.05, clear(palette.primary)], [0.3, `${palette.primary}40`], [0.65, `${palette.secondary}30`], [0.95, clear(palette.secondary)], [1, clear(palette.secondary)]]} />
    </Group>
);

export const DecoNone = () => null;

export const DECORATIONS = {
    'glow-orbs': DecoGlowOrbs,
    'geometric-shapes': DecoGeometricShapes,
    'corner-accents': DecoCornerAccents,
    'accent-lines': DecoAccentLines,
    'gold-corners': DecoGoldCorners,
    'network-lines': DecoNetworkLines,
    none: DecoNone,
};
export const getDecoration = (id) => DECORATIONS[id] || DecoNone;
