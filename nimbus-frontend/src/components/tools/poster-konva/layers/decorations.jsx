import React from 'react';
import { Group, Rect, Circle, Line, Path } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H } from '../engine/constants';
import { clear } from '../engine/color';
import { Editable } from '../engine/edit';
import { RadialEllipse, GradBar } from './primitives';
import { Rings, DotGrid, glow } from './ornaments';

/**
 * Decoration layer. Every piece is its own <Editable> (ids d_*, named in engine/decorLabels.js), so each can be
 * moved, resized or hidden. Big soft glows are not clickable on the poster (pick=false) so they never get in the
 * way; they are reachable from the Decorations list in the Edit tab. Strokes carry a faint glow so they stay
 * visible on photos and on flat colour alike.
 */

const orb = (cx, cy, rx, ry, color, stop) => (
    <RadialEllipse cx={cx} cy={cy} rx={rx} ry={ry} stops={[[0, color], [stop, clear(color)], [1, clear(color)]]} />
);

export const DecoGlowOrbs = ({ palette }) => (
    <>
        <Editable id="d_orb1" pick={false}><Group listening={false}>{orb(W + 30 - 140, -40 + 110, 170, 135, `${palette.primary}34`, 0.68)}</Group></Editable>
        <Editable id="d_rings1"><Rings cx={W - 64} cy={72} r={112} palette={palette} rings={4} /></Editable>
        <Editable id="d_orb2" pick={false}><Group listening={false}>{orb(-40 + 120, H + 50 - 90, 150, 112, `${palette.secondary}1f`, 0.7)}</Group></Editable>
        <Editable id="d_rings2"><Rings cx={58} cy={H - 66} r={70} palette={palette} rings={3} dot={false} /></Editable>
    </>
);

export const DecoGeometricShapes = ({ palette }) => (
    <>
        <Editable id="d_geo1">
            <Group listening={false}>
                <Rect x={W - 20 - 120} y={20} width={120} height={120} stroke={`${palette.primary}66`} strokeWidth={1.6} cornerRadius={4} offsetX={60} offsetY={60} rotation={15} {...glow(palette.primary, 10, 0.5)} />
                <Rect x={W - 45 - 70} y={45} width={70} height={70} stroke={`${palette.secondary}55`} strokeWidth={1.1} cornerRadius={2} offsetX={35} offsetY={35} rotation={30} />
            </Group>
        </Editable>
        <Editable id="d_geo2">
            <Group listening={false}>
                <Circle x={20 + 40} y={H - 50 - 40} radius={40} stroke={`${palette.secondary}66`} strokeWidth={1.6} {...glow(palette.secondary, 10, 0.5)} />
                <Circle x={35 + 25} y={H - 65 - 25} radius={25} stroke={`${palette.accent}50`} strokeWidth={1.1} />
            </Group>
        </Editable>
        <Editable id="d_geo3">
            <Rect x={W - 15 - 12} y={H / 2 + 12} width={24} height={24} stroke={`${palette.accent}66`} strokeWidth={1.6} offsetX={12} offsetY={12} rotation={45} listening={false} />
        </Editable>
        <Editable id="d_dots">
            <DotGrid x={22} y={90} cols={5} rows={2} gap={13} radius={2.3} color={palette.secondary} opacity={0.6} />
        </Editable>
        <Editable id="d_geo4">
            <Group listening={false}>
                <GradBar x={W - 25 - 60} y={H - 30} w={60} h={1.4} stops={[[0, clear(palette.primary)], [1, `${palette.primary}80`]]} />
                <GradBar x={W - 35 - 40} y={H - 38} w={40} h={1.4} stops={[[0, clear(palette.secondary)], [1, `${palette.secondary}66`]]} />
            </Group>
        </Editable>
    </>
);

const CornerArcs = ({ palette }) => (
    <>
        <Path data="M160 0 A160 160 0 0 1 0 160" stroke={palette.primary} strokeWidth={1.6} opacity={0.42} {...glow(palette.primary, 8, 0.45)} />
        <Path data="M160 0 A120 120 0 0 1 40 160" stroke={palette.secondary} strokeWidth={1.1} opacity={0.3} />
        <Path data="M160 0 A80 80 0 0 1 80 160" stroke={palette.accent} strokeWidth={0.9} opacity={0.22} />
    </>
);

export const DecoCornerAccents = ({ palette }) => (
    <>
        <Editable id="d_arcs1">
            <Group listening={false}>
                <Group x={W - 160} y={0}><CornerArcs palette={palette} /></Group>
                <Circle x={W - 19} y={19} radius={4} fill={`${palette.primary}55`} />
            </Group>
        </Editable>
        <Editable id="d_arcs2">
            <Group listening={false}>
                <Group x={160} y={H - 160} rotation={180}><CornerArcs palette={palette} /></Group>
                <Circle x={19} y={H - 19} radius={4} fill={`${palette.secondary}55`} />
            </Group>
        </Editable>
    </>
);

export const DecoAccentLines = ({ palette }) => (
    <>
        <Editable id="d_line_top">
            <Group listening={false}>
                <GradBar x={28} y={28} w={W - 56} h={1.6} stops={[[0, `${palette.primary}70`], [0.3, `${palette.secondary}50`], [0.7, clear(palette.secondary)], [1, clear(palette.secondary)]]} />
                <GradBar x={28} y={34} w={W * 0.35} h={1.1} stops={[[0, `${palette.secondary}50`], [1, clear(palette.secondary)]]} />
            </Group>
        </Editable>
        <Editable id="d_line_bottom">
            <Group listening={false}>
                <GradBar x={28} y={H - 28 - 1.6} w={W - 56} h={1.6} stops={[[0, clear(palette.secondary)], [0.3, clear(palette.secondary)], [0.6, `${palette.secondary}50`], [1, `${palette.primary}70`]]} />
                <GradBar x={W - 28 - W * 0.35} y={H - 34 - 1} w={W * 0.35} h={1.1} stops={[[0, clear(palette.secondary)], [1, `${palette.secondary}50`]]} />
            </Group>
        </Editable>
        <Editable id="d_line_side">
            <GradBar x={W - 28 - 1} y={60} w={1.2} h={H - 120} dir="v" stops={[[0, clear(palette.primary)], [0.5, `${palette.primary}45`], [1, clear(palette.primary)]]} />
        </Editable>
    </>
);

const GoldCorner = ({ palette }) => (
    <>
        <Path data="M8 50 L8 8 L50 8" stroke={palette.accent} strokeWidth={2.5} opacity={0.9} lineCap="round" lineJoin="round" {...glow(palette.accent, 8, 0.5)} />
        <Path data="M12 40 L12 12 L40 12" stroke={palette.secondary} strokeWidth={1.2} opacity={0.65} lineCap="round" lineJoin="round" />
        <Rect x={8} y={8} width={8} height={8} offsetX={4} offsetY={4} rotation={45} fill={palette.accent} opacity={0.8} />
        {[20, 32, 44].map((v) => <Circle key={`x${v}`} x={v} y={8} radius={1.3} fill={palette.secondary} opacity={0.7} />)}
        {[20, 32, 44].map((v) => <Circle key={`y${v}`} x={8} y={v} radius={1.3} fill={palette.secondary} opacity={0.7} />)}
    </>
);

export const DecoGoldCorners = ({ palette }) => (
    <>
        <Editable id="d_gold_tl"><Group x={0} y={0} listening={false}><GoldCorner palette={palette} /></Group></Editable>
        <Editable id="d_gold_tr"><Group x={W} y={0} scaleX={-1} listening={false}><GoldCorner palette={palette} /></Group></Editable>
        <Editable id="d_gold_bl"><Group x={0} y={H} scaleY={-1} listening={false}><GoldCorner palette={palette} /></Group></Editable>
        <Editable id="d_gold_br"><Group x={W} y={H} scaleX={-1} scaleY={-1} listening={false}><GoldCorner palette={palette} /></Group></Editable>
        <Editable id="d_gold_border" pick={false}><Rect x={18} y={18} width={W - 36} height={H - 36} stroke={`${palette.secondary}50`} strokeWidth={1} cornerRadius={2} listening={false} /></Editable>
        <Editable id="d_gold_glow" pick={false}>
            <Group listening={false}>
                <RadialEllipse cx={W / 2} cy={H + 30} rx={W * 0.4} ry={60} stops={[[0, `${palette.secondary}30`], [0.7, clear(palette.secondary)], [1, clear(palette.secondary)]]} />
            </Group>
        </Editable>
    </>
);

const NET_LINES = [
    [[10, 10], [80, 30], [150, 10], [190, 60]],
    [[80, 30], [120, 80], [190, 60]],
    [[10, 10], [50, 90]],
    [[50, 90], [120, 80]],
];
const NET_NODES = [[10, 10], [80, 30], [150, 10], [190, 60], [120, 80], [50, 90]];

export const DecoNetworkLines = ({ palette }) => (
    <>
        <Editable id="d_network">
            <Group x={W - 200} y={0} opacity={0.42} listening={false}>
                {NET_LINES.flatMap((line, i) => line.slice(0, -1).map((pt, j) => (
                    <Line key={`${i}-${j}`} points={[...pt, ...line[j + 1]]} stroke={palette.secondary} strokeWidth={0.8} />
                )))}
                {NET_NODES.map(([x, y], i) => <Circle key={i} x={x} y={y} radius={2.8} fill={palette.primary} opacity={0.9} {...glow(palette.primary, 8, 0.7)} />)}
            </Group>
        </Editable>
        <Editable id="d_net_line">
            <GradBar x={22} y={H - 22 - 1.5} w={W - 44} h={1.6}
                stops={[[0, clear(palette.primary)], [0.05, clear(palette.primary)], [0.3, `${palette.primary}60`], [0.65, `${palette.secondary}48`], [0.95, clear(palette.secondary)], [1, clear(palette.secondary)]]} />
        </Editable>
    </>
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
