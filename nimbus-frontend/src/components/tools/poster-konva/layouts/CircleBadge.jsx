import React from 'react';
import { Group, Rect, Circle, TextPath } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H, rem } from '../engine/constants';
import { darken, linear } from '../engine/color';
import { measureWidth, truncate } from '../engine/text';
import { Txt, textHeight, LogoBar } from '../layers/ui';
import { stackCentered } from './stack';
import { titleBlock, textBlock, footerNode } from './parts';
import { pickTitleFont, pickBodyFont, qrStrip, extraLines } from './kit';
import { Editable } from '../engine/edit';

export const FONTS = ['Cinzel'];

const PAD = 30;
const CW = W - PAD * 2;
const INK = '#ffffff';
const SOFT = 'rgba(255,255,255,0.82)';

/** SVG arc path whose text is centred on `mid` (radians), for `len` px of text on a circle of radius r. */
const arcPath = (cx, cy, r, mid, len, clockwise) => {
    const span = Math.min(len / r, Math.PI * 1.7);
    const a0 = clockwise ? mid - span / 2 : mid + span / 2;
    const a1 = clockwise ? mid + span / 2 : mid - span / 2;
    const p = (a) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
    return `M ${p(a0)} A ${r} ${r} 0 ${span > Math.PI ? 1 : 0} ${clockwise ? 1 : 0} ${p(a1)}`;
};

/** A round emblem with text running around the rim; everything else hangs below it. */
const CircleBadge = ({ data, palette }) => {
    const tf = pickTitleFont(palette, 'Cinzel');
    const bf = pickBodyFont(palette, 'Inter');
    const { title, subtitle, organizer, description, infoItems = [], extraItems = [], collegeLogo, eventBrandLogo, qr1, qr2, footer } = data;
    const disc = darken(palette.primary, 0.72);
    const ring = palette.accent;

    // bottom
    const qr = qrStrip({ qr1, qr2, x: 0, y: 0, size: 44, gap: 8, palette, labelSize: 6 });
    const foot = footerNode({ text: footer, x: PAD, w: CW - (qr.w ? qr.w + 14 : 0), bottom: H - 16, palette, font: bf, size: rem(0.44), align: 'left', line: false });
    const n = infoItems.length || 1;
    const colW = CW / n;
    const valS = rem(0.8);
    const vH = infoItems.length ? Math.max(...infoItems.map((it) => textHeight(it.value, { width: colW - 14, fontSize: valS, fontFamily: bf, fontStyle: '700', lineHeight: 1.1 }))) : 0;
    const infoH = infoItems.length ? rem(0.46) * 1.2 + 4 + vH : 0;
    const infoTop = foot.top - 24 - infoH;

    const descB = description && textBlock({ text: description, x: PAD + 14, w: CW - 28, font: bf, size: rem(0.7), lineHeight: 1.5, align: 'center', fill: SOFT, mb: 0, key: 'desc', maxLines: 3 });
    const extra = extraLines({ items: extraItems, x: PAD, w: CW, bodyFont: bf, ink: SOFT, size: rem(0.58), max: 2, align: 'center' });

    // circle: sized to the room available, then the emblem + caption group is centred vertically
    const belowH = (descB ? descB.h + 8 : 0) + (extra ? extra.h + 8 : 0);
    const areaTop = 84;
    const areaBottom = infoTop - 16;
    const R = Math.max(120, Math.min(232, (H - 300) / 2, (areaBottom - areaTop - belowH - 24) / 2));
    const cx = W / 2;
    const cy = areaTop + Math.max(0, (areaBottom - areaTop - (2 * R + 18 + belowH)) / 2) + R;
    const rIn = R - 54;

    // ring text
    const topText = (organizer || '').toUpperCase();
    const ringFont = { fontSize: rem(0.62), fontFamily: tf, fontStyle: '700', letterSpacing: 5 };
    const rText = R - 30;
    const topLen = measureWidth(topText, ringFont);
    const botRaw = infoItems.map((i) => i.value).filter(Boolean).slice(0, 2).join('  •  ');
    const botText = truncate(botRaw.toUpperCase(), 40);
    const botLen = measureWidth(botText, ringFont);
    const rBot = R - 18;

    // inner content
    const innerW = rIn * 1.62;
    const body = stackCentered([
        titleBlock({ text: title, x: cx - innerW / 2, w: innerW, font: tf, weight: '700', maxSize: 50, minSize: 20, maxLines: 3, align: 'center', lineHeight: 1.0, letterSpacing: 0.5, fill: INK, shadow: false, palette, mb: 8 }),
        subtitle && textBlock({ text: subtitle, x: cx - innerW / 2, w: innerW, font: bf, size: rem(0.78), italic: true, align: 'center', fill: ring, mb: 0, key: 'sub', maxLines: 2 }),
    ].filter(Boolean), cy - rIn * 0.62, cy + rIn * 0.62);

    // below the circle
    const belowTop = cy + R + 18;

    return (
        <Group listening={false}>
            <Rect width={W} height={H} {...linear(0, 0, 0, H, [[0, 'rgba(3,6,14,0.5)'], [0.45, 'rgba(3,6,14,0.25)'], [1, 'rgba(3,6,14,0.82)']])} />

            <LogoBar x={PAD} y={24} h={26} collegeLogo={collegeLogo} eventLogo={eventBrandLogo} align="left" width={CW / 2} />
            {qr.node && <Group x={W - PAD - qr.w} y={22}>{qr.node}</Group>}

            {/* emblem */}
            <Circle x={cx} y={cy} radius={R} fill={disc} opacity={0.9} shadowColor="#000000" shadowBlur={36} shadowOpacity={0.5} shadowOffsetY={10} />
            <Circle x={cx} y={cy} radius={R} stroke={ring} strokeWidth={3} />
            <Circle x={cx} y={cy} radius={R - 8} stroke={ring} strokeWidth={1} opacity={0.7} />
            <Circle x={cx} y={cy} radius={rIn + 6} stroke={INK} strokeWidth={1} dash={[2, 5]} opacity={0.55} />
            {[Math.PI, 0].map((a) => (
                <Rect key={a} x={cx + (R - 26) * Math.cos(a)} y={cy + (R - 26) * Math.sin(a)} width={8} height={8} offsetX={4} offsetY={4} rotation={45} fill={ring} />
            ))}
            {topText && (
                <Editable id="org">
                    <TextPath data={arcPath(cx, cy, rText, -Math.PI / 2, topLen, true)} text={topText} {...ringFont} fill={ring} />
                </Editable>
            )}
            {botText && (
                <Editable id="info">
                    <TextPath data={arcPath(cx, cy, rBot, Math.PI / 2, botLen, false)} text={botText} {...ringFont} fill={INK} />
                </Editable>
            )}
            {body.nodes}

            {/* hanging details */}
            {descB && <Editable id="desc"><Group listening={false}>{descB.render(belowTop)}</Group></Editable>}
            {extra && <Editable id="extra"><Group listening={false}>{extra.render(belowTop + (descB ? descB.h + 8 : 0))}</Group></Editable>}
            {infoItems.length > 0 && (
                <Editable id="grid">
                    <Group x={PAD} y={infoTop}>
                        <Rect width={CW} height={1} fill={ring} opacity={0.6} />
                        {infoItems.map((it, i) => (
                            <Group key={i} x={i * colW} y={9}>
                                <Txt text={String(it.label).toUpperCase()} width={colW} align="center" fontSize={rem(0.46)} fontFamily={bf} fontStyle="700" letterSpacing={2} fill={ring} />
                                <Txt text={it.value} x={7} y={rem(0.46) * 1.2 + 4} width={colW - 14} align="center" fontSize={valS} fontFamily={bf} fontStyle="700" lineHeight={1.1} fill={INK} />
                            </Group>
                        ))}
                    </Group>
                </Editable>
            )}
            {foot.node}
        </Group>
    );
};

export default CircleBadge;
