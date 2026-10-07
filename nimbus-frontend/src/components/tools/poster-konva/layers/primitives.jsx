import React, { useMemo } from 'react';
import { Group, Circle, Rect, Shape } from 'react-konva';
import { DESIGN_W, DESIGN_H } from '../engine/constants';
import { clear } from '../engine/color';

/**
 * Elliptical radial gradient centred at (cx, cy) with radii (rx, ry).
 * stops: [[0, color], [0.6, color2], [1, color3]]  (like CSS radial-gradient)
 */
export const RadialEllipse = ({ cx, cy, rx, ry, stops, opacity = 1 }) => (
    <Group x={cx} y={cy} scaleY={ry / rx} opacity={opacity} listening={false}>
        <Circle
            radius={rx}
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndRadius={rx}
            fillRadialGradientColorStops={stops.flat()}
        />
    </Group>
);

/** CSS-like "radial-gradient(ellipse A% B% at X% Y%, color 0%, transparent T%)" over the whole poster. */
export const Glow = ({ x, y, rw, rh, color, stop = 0.6, opacity = 1, w = DESIGN_W, h = DESIGN_H }) => (
    <RadialEllipse
        cx={(x / 100) * w}
        cy={(y / 100) * h}
        rx={(rw / 100) * w}
        ry={(rh / 100) * h}
        stops={[[0, color], [stop, clear(color)], [1, clear(color)]]}
        opacity={opacity}
    />
);

/** Horizontal/vertical gradient bar. dir: 'h' | 'v' */
export const GradBar = ({ x, y, w, h, stops, dir = 'h', opacity = 1 }) => (
    <Rect
        x={x}
        y={y}
        width={w}
        height={h}
        opacity={opacity}
        listening={false}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={dir === 'h' ? { x: w, y: 0 } : { x: 0, y: h }}
        fillLinearGradientColorStops={stops.flat()}
    />
);

let grainCanvas;
const getGrain = () => {
    if (grainCanvas) return grainCanvas;
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    grainCanvas = c;
    return c;
};

/** Subtle film grain (replaces the SVG feTurbulence filter). */
export const Grain = ({ opacity = 0.05 }) => {
    const img = useMemo(getGrain, []);
    return (
        <Rect
            width={DESIGN_W}
            height={DESIGN_H}
            listening={false}
            opacity={opacity}
            fillPatternImage={img}
            fillPatternScale={{ x: 0.55, y: 0.55 }}
        />
    );
};

/** Custom-drawn shape: draw(ctx2d helper, shape) must build a path; stroke/fill from props. */
export const Draw = ({ draw, ...props }) => (
    <Shape
        listening={false}
        sceneFunc={(ctx, shape) => {
            ctx.beginPath();
            draw(ctx, shape);
            ctx.fillStrokeShape(shape);
        }}
        {...props}
    />
);
