import React from 'react';
import { Group, Circle } from 'react-konva';
import { clear } from '../engine/color';
import { RadialEllipse } from './primitives';

/**
 * Concentric rings with a soft glow and a centre dot: the same ornament the Split Panel uses, sized by `r`.
 * Reads well on photos and on flat colour alike (a glow behind, moderate-opacity rings in two accent colours).
 */
export const Rings = ({ cx, cy, r, palette, dot = true, rings = 4 }) => (
    <Group listening={false}>
        <RadialEllipse cx={cx} cy={cy} rx={r * 1.5} ry={r * 1.5}
            stops={[[0, `${palette.primary}38`], [0.65, clear(palette.primary)], [1, clear(palette.primary)]]} />
        {[1, 0.76, 0.52, 0.3].slice(0, rings).map((k, i) => (
            <Circle key={k} x={cx} y={cy} radius={r * k} stroke={i % 2 ? palette.accent : palette.secondary} strokeWidth={i === 1 ? 1.4 : 0.9} opacity={0.24 + i * 0.09} />
        ))}
        {dot && (
            <>
                <Circle x={cx} y={cy} radius={r * 0.12} fill={palette.primary} opacity={0.85} />
                <Circle x={cx} y={cy} radius={r * 0.19} stroke={palette.accent} strokeWidth={1.6} opacity={0.7} />
            </>
        )}
    </Group>
);

/** A small matrix of dots (cols x rows). */
export const DotGrid = ({ x, y, cols = 4, rows = 3, gap = 11, radius = 1.7, color, opacity = 0.55 }) => (
    <Group x={x} y={y} listening={false} opacity={opacity}>
        {Array.from({ length: rows * cols }, (_, i) => (
            <Circle key={i} x={(i % cols) * gap} y={Math.floor(i / cols) * gap} radius={radius} fill={color} />
        ))}
    </Group>
);

/** Soft coloured glow for strokes/shapes so thin lines stay visible on any background. */
export const glow = (color, blur = 10, opacity = 0.6) => ({ shadowColor: color, shadowBlur: blur, shadowOpacity: opacity });
