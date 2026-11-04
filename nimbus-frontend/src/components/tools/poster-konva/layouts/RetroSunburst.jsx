import React from 'react';
import { Group, Rect, Line, Circle } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H, rem } from '../engine/constants';
import { darken } from '../engine/color';
import { Txt, textHeight, LogoBar } from '../layers/ui';
import { Grain } from '../layers/primitives';
import { stackCentered } from './stack';
import { titleBlock, textBlock, footerNode } from './parts';
import { pickTitleFont, pickBodyFont, qrStrip, speakerRow, extraLines, oneLine, HoleShape } from './kit';
import { Editable } from '../engine/edit';

export const FONTS = ['Abril Fatface'];

const PAPER = '#f1e7cf';
const INK = '#3a2a1a';
const SOFT = 'rgba(58,42,26,0.7)';
const PAD = 34;
const CW = W - PAD * 2;

/** Vintage poster: cream paper, double border, sunburst rays around a round photo window, a ribbon banner. */
const RetroSunburst = ({ data, palette }) => {
    const tf = pickTitleFont(palette, 'Abril Fatface');
    const bf = pickBodyFont(palette, 'Inter');
    const accent = darken(palette.primary, 0.18);
    const { title, subtitle, organizer, description, infoItems = [], extraItems = [], collegeLogo, eventBrandLogo, qr1, qr2, footer } = data;

    // geometry
    const inset = 22;
    const cx = W / 2;
    const r = Math.max(70, Math.min(150, H < 700 ? H * 0.17 : H * 0.2));
    const cy = 62 + r + 14;
    const rayR = Math.hypot(W, H);

    // ribbon under the photo
    const ribbonY = cy + r + 4;
    const ribbonH = 38;
    const ribbonW = Math.min(CW - 30, 380);
    const rx = cx - ribbonW / 2;
    const ribbonText = (organizer || subtitle || '').toUpperCase();
    const rt = ribbonText ? oneLine(ribbonText, { w: ribbonW - 44, maxSize: rem(0.72), fontFamily: bf, fontStyle: '800', letterSpacing: 3 }) : null;

    // bottom
    const foot = footerNode({ text: footer, x: PAD, w: CW * 0.7, bottom: H - 26, palette: { ...palette, divider: SOFT, muted: SOFT }, font: bf, size: rem(0.44), align: 'left', line: false });
    const qr = qrStrip({ qr1, qr2, x: 0, y: 0, size: 44, palette: { ...palette, muted: SOFT, text: INK }, labelSize: 6 });
    const n = infoItems.length || 1;
    const gap = 8;
    const stampW = ((CW - (qr.w ? qr.w + 14 : 0)) - gap * (n - 1)) / n;
    const valS = rem(0.78);
    const vH = infoItems.length ? Math.max(...infoItems.map((it) => textHeight(it.value, { width: stampW - 16, fontSize: valS, fontFamily: bf, fontStyle: '700', lineHeight: 1.12 }))) : 0;
    const stampH = infoItems.length ? 10 + rem(0.44) * 1.2 + 3 + vH + 10 : 0;
    const stampsTop = foot.top - 12 - stampH;

    const spk = speakerRow({ data, x: cx - 120, w: 240, palette, titleFont: tf, bodyFont: bf, avatar: 44, ink: INK, soft: SOFT, align: 'left' });
    const build = (size, extras = true, speaker = true) => [
        titleBlock({ text: title, x: PAD, w: CW, font: tf, weight: '400', maxSize: size, minSize: 24, maxLines: 3, align: 'center', lineHeight: 0.98, letterSpacing: 0, upper: false, fill: INK, shadow: false, palette, mb: 8 }),
        subtitle && organizer && textBlock({ text: subtitle, x: PAD, w: CW, font: tf, size: rem(0.9), italic: true, align: 'center', fill: accent, mb: 8, key: 'sub', maxLines: 2 }),
        description && textBlock({ text: description, x: PAD + 14, w: CW - 28, font: bf, size: rem(0.66), lineHeight: 1.55, align: 'center', fill: SOFT, mb: 8, key: 'desc', maxLines: 3 }),
        speaker && spk && { h: spk.h, mb: 8, key: 'spk', render: spk.render },
        extras && (() => { const e = extraLines({ items: extraItems, x: PAD, w: CW, bodyFont: bf, ink: SOFT, size: rem(0.58), max: 2, align: 'center' }); return e && { h: e.h, mb: 0, key: 'extra', render: e.render }; })(),
    ].filter(Boolean);
    const total = (bs) => bs.reduce((nn, b) => nn + b.h + (b.mb || 0), 0) - (bs.length ? bs[bs.length - 1].mb || 0 : 0);
    const top = ribbonY + ribbonH + 22;
    const bottom = stampsTop - 14;
    // squeeze: first try everything, then drop the extra lines, then the speaker, so nothing ever collides with the stamps
    const sizes = [60, 52, 46, 40, 34, 30, 26];
    let size = sizes.find((s) => total(build(s)) <= bottom - top);
    let blocks = size ? build(size) : null;
    if (!blocks) { size = sizes.find((s) => total(build(s, false)) <= bottom - top); blocks = size ? build(size, false) : null; }
    if (!blocks) { size = sizes.find((s) => total(build(s, false, false)) <= bottom - top) ?? 24; blocks = build(size, false, false); }
    const body = stackCentered(blocks, top, bottom);

    // sunburst wedges (outside the photo window), clipped to the inner frame
    const wedges = Array.from({ length: 24 }, (_, i) => {
        const a0 = (i * Math.PI * 2) / 24;
        const a1 = a0 + Math.PI / 24;
        const p = (a, rad) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
        return [...p(a0, r + 16), ...p(a0, rayR), ...p(a1, rayR), ...p(a1, r + 16)];
    }).filter((_, i) => i % 2 === 0);

    return (
        <Group listening={false}>
            {/* paper with a round window onto the artwork */}
            <HoleShape fill={PAPER} paths={[(ctx) => ctx.rect(0, 0, W, H), (ctx) => {
                const k = 0.5523;
                ctx.moveTo(cx + r, cy);
                ctx.bezierCurveTo(cx + r, cy + r * k, cx + r * k, cy + r, cx, cy + r);
                ctx.bezierCurveTo(cx - r * k, cy + r, cx - r, cy + r * k, cx - r, cy);
                ctx.bezierCurveTo(cx - r, cy - r * k, cx - r * k, cy - r, cx, cy - r);
                ctx.bezierCurveTo(cx + r * k, cy - r, cx + r, cy - r * k, cx + r, cy);
                ctx.closePath();
            }]} />
            <Group clip={{ x: inset, y: inset, width: W - inset * 2, height: H - inset * 2 }}>
                {wedges.map((pts, i) => <Line key={i} points={pts} closed fill={`${accent}2e`} />)}
            </Group>
            <Grain opacity={0.06} />

            {/* double border */}
            <Rect x={inset - 8} y={inset - 8} width={W - (inset - 8) * 2} height={H - (inset - 8) * 2} stroke={INK} strokeWidth={2.2} />
            <Rect x={inset} y={inset} width={W - inset * 2} height={H - inset * 2} stroke={INK} strokeWidth={0.8} />

            {/* ring around the photo */}
            <Circle x={cx} y={cy} radius={r + 3} stroke={INK} strokeWidth={5} />
            <Circle x={cx} y={cy} radius={r + 12} stroke={accent} strokeWidth={1.4} />

            <LogoBar x={PAD} y={inset + 8} h={22} collegeLogo={collegeLogo} eventLogo={eventBrandLogo} align="left" width={CW / 2} tint={INK} />

            {/* ribbon */}
            <Editable id="org">
                <Group>
                    <Line points={[rx - 30, ribbonY + 10, rx + 10, ribbonY + 10, rx + 10, ribbonY + ribbonH + 10, rx - 30, ribbonY + ribbonH + 10, rx - 16, ribbonY + ribbonH / 2 + 10]} closed fill={darken(accent, 0.3)} />
                    <Line points={[rx + ribbonW + 30, ribbonY + 10, rx + ribbonW - 10, ribbonY + 10, rx + ribbonW - 10, ribbonY + ribbonH + 10, rx + ribbonW + 30, ribbonY + ribbonH + 10, rx + ribbonW + 16, ribbonY + ribbonH / 2 + 10]} closed fill={darken(accent, 0.3)} />
                    <Rect x={rx} y={ribbonY} width={ribbonW} height={ribbonH} fill={accent} />
                    <Line points={[rx, ribbonY + ribbonH, rx + 10, ribbonY + ribbonH, rx + 10, ribbonY + ribbonH + 10]} closed fill={darken(accent, 0.45)} />
                    <Line points={[rx + ribbonW, ribbonY + ribbonH, rx + ribbonW - 10, ribbonY + ribbonH, rx + ribbonW - 10, ribbonY + ribbonH + 10]} closed fill={darken(accent, 0.45)} />
                    {rt && <Txt text={ribbonText} x={rx + 22} y={ribbonY + (ribbonH - rt.h) / 2} width={ribbonW - 44} align="center" wrap="none" fontSize={rt.size} fontFamily={bf} fontStyle="800" letterSpacing={3} fill="#fbf3df" />}
                </Group>
            </Editable>

            {body.nodes}

            {/* stamps */}
            {infoItems.length > 0 && (
                <Editable id="info">
                    <Group x={PAD} y={stampsTop} listening={false}>
                        {infoItems.map((it, i) => (
                            <Group key={i} x={i * (stampW + gap)}>
                                <Rect width={stampW} height={stampH} stroke={INK} strokeWidth={1.4} dash={[5, 3]} cornerRadius={4} />
                                <Txt text={String(it.label).toUpperCase()} y={10} width={stampW} align="center" fontSize={rem(0.44)} fontFamily={bf} fontStyle="800" letterSpacing={2.5} fill={accent} />
                                <Txt text={it.value} x={8} y={10 + rem(0.44) * 1.2 + 3} width={stampW - 16} align="center" fontSize={valS} fontFamily={bf} fontStyle="700" lineHeight={1.12} fill={INK} />
                            </Group>
                        ))}
                    </Group>
                </Editable>
            )}
            {qr.node && <Group x={W - PAD - qr.w} y={stampsTop + stampH - qr.h}>{qr.node}</Group>}
            {foot.node}
        </Group>
    );
};

export default RetroSunburst;
