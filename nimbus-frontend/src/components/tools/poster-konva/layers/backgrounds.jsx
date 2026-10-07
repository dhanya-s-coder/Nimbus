import React from 'react';
import { Group, Rect, Path, Circle, Line, Ellipse } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H } from '../engine/constants';
import { cssLinearGradient, linear, alpha } from '../engine/color';
import { Glow, Draw, Grain, RadialEllipse } from './primitives';

const isLight = (p) => p.isDark === false;

const baseGradient = (palette) =>
    cssLinearGradient(
        palette.gradient || `linear-gradient(145deg, ${palette.bg} 0%, ${palette.bgMid || palette.bg} 50%, ${palette.bg} 100%)`,
        W, H
    );

/** Palette gradient + primary glow + secondary counter-glow + vignette + grain. */
const GradientBase = ({ palette, glowAt = [85, 12] }) => {
    const light = isLight(palette);
    return (
        <Group listening={false}>
            <Rect width={W} height={H} {...baseGradient(palette)} />
            <Glow x={glowAt[0]} y={glowAt[1]} rw={80} rh={50} color={`${palette.primary}${light ? '25' : '30'}`} />
            <Glow x={10} y={90} rw={60} rh={45} color={`${palette.secondary}${light ? '18' : '20'}`} stop={0.65} />
            <RadialEllipse
                cx={W * 0.5} cy={H * 0.48} rx={W * 0.85} ry={H * 0.85}
                stops={light
                    ? [[0.3, alpha(palette.bgMid || palette.bg, 0)], [1, `${palette.bgMid || palette.bg}aa`]]
                    : [[0.35, alpha(palette.bg, 0)], [1, `${palette.bg}cc`]]}
            />
            <Grain opacity={light ? 0.03 : 0.05} />
        </Group>
    );
};

// 1. Studio Light
export const BgSolidGradient = ({ palette }) => (
    <Group listening={false}>
        <Group opacity={0.58}><GradientBase palette={palette} /></Group>
        <Rect
            width={W} height={H}
            {...linear(0, 0, 0, H, [[0, `${palette.bg}60`], [0.15, alpha(palette.bg, 0)], [0.8, alpha(palette.bg, 0)], [1, `${palette.bg}80`]])}
        />
    </Group>
);

// 2. Archival dot grid (dots stronger toward the edges, like the old SVG mask)
export const BgDotGrid = ({ palette }) => {
    const light = isLight(palette);
    return (
        <Group listening={false}>
            <GradientBase palette={palette} glowAt={[78, 18]} />
            <Draw
                fill={palette.primary}
                opacity={light ? 0.15 : 0.11}
                draw={(ctx) => {
                    for (let y = 1; y < H; y += 22) {
                        for (let x = 1; x < W; x += 22) {
                            ctx.moveTo(x + 0.8, y);
                            ctx.arc(x, y, 0.8, 0, Math.PI * 2);
                        }
                    }
                }}
            />
            {/* center fade (mask equivalent) */}
            <RadialEllipse
                cx={W * 0.5} cy={H * 0.42} rx={W * 0.62} ry={W * 0.62 * 1.1}
                stops={[[0, alpha(palette.bg, light ? 0.5 : 0.82)], [1, alpha(palette.bg, 0)]]}
                opacity={0.55}
            />
        </Group>
    );
};

// 3. Fine lattice
export const BgHexGrid = ({ palette }) => {
    const light = isLight(palette);
    return (
        <Group listening={false}>
            <GradientBase palette={palette} glowAt={[72, 22]} />
            <Draw
                stroke={palette.secondary}
                strokeWidth={0.7}
                opacity={light ? 0.14 : 0.09}
                draw={(ctx) => {
                    for (let ty = 0; ty < H + 48; ty += 48) {
                        for (let tx = 0; tx < W + 42; tx += 42) {
                            ctx.moveTo(tx + 21, ty + 1.5);
                            ctx.lineTo(tx + 40, ty + 12.5);
                            ctx.lineTo(tx + 40, ty + 34.5);
                            ctx.lineTo(tx + 21, ty + 45.5);
                            ctx.lineTo(tx + 2, ty + 34.5);
                            ctx.lineTo(tx + 2, ty + 12.5);
                            ctx.closePath();
                        }
                    }
                }}
            />
        </Group>
    );
};

// 4. Contour
export const BgTopography = ({ palette }) => {
    const light = isLight(palette);
    return (
        <Group listening={false}>
            <GradientBase palette={palette} glowAt={[80, 16]} />
            <Group opacity={light ? 0.18 : 0.13}>
                {[70, 120, 175, 235, 300, 370, 450].map((r, i) => (
                    <Ellipse
                        key={r} x={430} y={210} radiusX={r * 1.15} radiusY={r * 0.82}
                        stroke={i % 2 ? palette.accent : palette.secondary}
                        strokeWidth={i === 2 ? 0.9 : 0.45}
                        opacity={0.55 - i * 0.05}
                    />
                ))}
                <Path data="M40 640 C120 560, 220 600, 310 520 C400 440, 470 500, 580 430" stroke={palette.primary} strokeWidth={0.6} opacity={0.35} />
            </Group>
        </Group>
    );
};

// 5. Ruling
export const BgDiagonalStripes = ({ palette }) => (
    <Group listening={false}>
        <GradientBase palette={palette} glowAt={[70, 10]} />
        <Draw
            stroke={palette.text}
            strokeWidth={0.6}
            opacity={0.06}
            draw={(ctx) => {
                const a = (28 * Math.PI) / 180;
                const cos = Math.cos(a);
                const sin = Math.sin(a);
                const reach = Math.hypot(W, H);
                for (let o = -reach; o < reach; o += 14) {
                    // lines perpendicular to the rotated pattern axis
                    const x0 = W / 2 + o * cos;
                    const y0 = H / 2 + o * sin;
                    ctx.moveTo(x0 + reach * sin, y0 - reach * cos);
                    ctx.lineTo(x0 - reach * sin, y0 + reach * cos);
                }
            }}
        />
    </Group>
);

// 6. Silk
export const BgLayeredWaves = ({ palette }) => {
    const light = isLight(palette);
    const top = H * 0.38; // svg sits in the bottom 62%
    return (
        <Group listening={false}>
            <GradientBase palette={palette} glowAt={[88, 8]} />
            <Group y={top} scaleY={(H * 0.62) / 370}>
                <Path data="M0 210 C140 150 220 250 360 180 C480 120 540 200 600 160 L600 370 L0 370 Z" fill={palette.primary} opacity={light ? 0.12 : 0.1} />
                <Path data="M0 250 C160 200 280 280 420 230 C520 190 560 240 600 220 L600 370 L0 370 Z" fill={palette.secondary} opacity={light ? 0.1 : 0.07} />
                <Path data="M0 80 C180 40 260 140 420 70" stroke={palette.accent} strokeWidth={0.9} opacity={0.22} />
            </Group>
        </Group>
    );
};

// 7. Gold sparkle
export const BgGoldSparkle = ({ palette }) => (
    <Group listening={false}>
        <Rect width={W} height={H} {...baseGradient(palette)} />
        <Glow x={50} y={5} rw={75} rh={45} color={`${palette.primary}35`} stop={0.65} />
        <Glow x={0} y={100} rw={55} rh={40} color={`${palette.secondary}25`} />
        <Glow x={100} y={100} rw={55} rh={40} color={`${palette.accent}20`} />
        <Group opacity={0.35}>
            {[[40, 680, 2.5], [70, 710, 1.8], [20, 720, 1.5], [55, 740, 2], [90, 700, 1.2], [110, 680, 1.8], [30, 650, 1.5], [75, 660, 1.2]].map(([x, y, r], i) => (
                <Circle key={i} x={x} y={y} radius={r} fill={palette.accent} opacity={0.6 + (i % 3) * 0.1} />
            ))}
            {[[540, 680, 2.2], [560, 710, 1.8], [580, 695, 1.5], [520, 720, 2], [555, 740, 1.2], [570, 660, 1.8], [545, 650, 1.5]].map(([x, y, r], i) => (
                <Circle key={`r${i}`} x={x} y={y} radius={r} fill={palette.secondary} opacity={0.5 + (i % 3) * 0.1} />
            ))}
            {[[200, 400, 1], [380, 320, 1.2], [450, 480, 0.8], [150, 550, 1], [500, 250, 0.9]].map(([x, y, r], i) => (
                <Circle key={`c${i}`} x={x} y={y} radius={r} fill={palette.accent} opacity={0.3} />
            ))}
            {['M18 18 L22 22 M22 18 L18 22 M20 14 L20 26 M14 20 L26 20', 'M578 18 L582 22 M582 18 L578 22 M580 14 L580 26 M574 20 L586 20',
                'M18 730 L22 734 M22 730 L18 734 M20 726 L20 738 M14 732 L26 732', 'M578 730 L582 734 M582 730 L578 734 M580 726 L580 738 M574 732 L586 732'].map((d) => (
                <Path key={d} data={d} stroke={palette.accent} strokeWidth={0.8} opacity={0.5} />
            ))}
        </Group>
        <Grain opacity={0.04} />
    </Group>
);

// 8. Mesh network
const MESH_NODES = [
    [80, 60], [200, 40], [340, 80], [480, 50], [560, 120],
    [60, 200], [180, 180], [300, 150], [440, 200], [530, 250],
    [100, 350], [250, 320], [400, 300], [520, 380],
    [50, 500], [200, 480], [380, 520], [500, 490],
    [120, 650], [280, 620], [450, 660], [560, 600],
];
const MESH_EDGES = [
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [1, 6], [2, 7], [3, 8], [4, 9],
    [5, 6], [6, 7], [7, 8], [8, 9], [5, 10], [6, 11], [7, 12], [8, 13],
    [10, 11], [11, 12], [12, 13], [10, 14], [11, 15], [12, 16], [13, 17],
    [14, 15], [15, 16], [16, 17], [14, 18], [15, 19], [16, 20], [17, 21],
];
export const BgMeshNetwork = ({ palette }) => {
    const light = isLight(palette);
    return (
        <Group listening={false}>
            <GradientBase palette={palette} glowAt={[60, 15]} />
            <Group opacity={light ? 0.18 : 0.12}>
                {MESH_EDGES.map(([a, b], i) => (
                    <Line key={i} points={[...MESH_NODES[a], ...MESH_NODES[b]]} stroke={palette.secondary} strokeWidth={0.5} />
                ))}
                {MESH_NODES.map(([x, y], i) => <Circle key={i} x={x} y={y} radius={2.5} fill={palette.primary} opacity={0.7} />)}
            </Group>
        </Group>
    );
};

export const BACKGROUNDS = {
    'solid-gradient': BgSolidGradient,
    'dot-grid': BgDotGrid,
    'hex-grid': BgHexGrid,
    topography: BgTopography,
    'diagonal-stripes': BgDiagonalStripes,
    'layered-waves': BgLayeredWaves,
    'gold-sparkle': BgGoldSparkle,
    'mesh-network': BgMeshNetwork,
    // legacy aliases kept so saved posters resolve identically
    'aurora-glow': BgLayeredWaves,
    'editorial-grid': BgDotGrid,
    'campus-mesh': BgMeshNetwork,
};
export const getBackground = (id) => BACKGROUNDS[id] || BgSolidGradient;
