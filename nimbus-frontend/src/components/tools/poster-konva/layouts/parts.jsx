import React from 'react';
import { Group, Rect, Line } from 'react-konva';
import { rem } from '../engine/constants';
import { clear } from '../engine/color';
import { fitFontSize, measureWidth, truncate, titleScale } from '../engine/text';
import { Txt, textHeight, Card } from '../layers/ui';
import { GradBar } from '../layers/primitives';

/**
 * Layout building blocks. Each *Block returns { h, mb, key, render(y) } for stack().
 * All coordinates are in the 600x750 design space.
 */

export const fonts = (palette, titleDefault = 'Bebas Neue', bodyDefault = 'DM Sans') => ({
    title: palette.titleFonts?.[0] || titleDefault,
    body: palette.bodyFont || bodyDefault,
});

/** Big wrapped title that auto-shrinks to maxLines. */
export const titleBlock = ({
    text, x, w, font, weight = '800', maxSize, minSize = 16, maxLines = 3, align = 'left',
    lineHeight = 1, letterSpacing = -0.5, fill, palette, upper = true, shadow = true, mb = 10, key = 'title',
}) => {
    if (!text) return null;
    const t = upper ? text.toUpperCase() : text;
    const o = { fontFamily: font, fontStyle: weight, lineHeight, letterSpacing };
    const size = fitFontSize(t, { width: w, maxSize: maxSize * titleScale(font) * (palette.textScale || 1), minSize, maxLines, ...o });
    const h = textHeight(t, { width: w, fontSize: size, ...o });
    return {
        h, mb, key, size,
        render: (y) => (
            <Txt text={t} x={x} y={y} width={w} align={align} fontSize={size} fontFamily={font} fontStyle={weight}
                lineHeight={lineHeight} letterSpacing={letterSpacing} fill={fill || palette.text}
                {...(shadow ? { shadowColor: palette.primary, shadowBlur: 20, shadowOpacity: 0.3, shadowOffsetY: 2 } : {})} />
        ),
    };
};

/** Single styled text paragraph. */
export const textBlock = ({ text, x, w, font, size, weight = '400', lineHeight = 1.3, letterSpacing = 0, align = 'left', fill, upper = false, italic = false, mb = 8, key, opacity = 1, maxLines }) => {
    if (!text) return null;
    const t = upper ? String(text).toUpperCase() : String(text);
    const o = { width: w, fontSize: size, fontFamily: font, fontStyle: `${italic ? 'italic ' : ''}${weight}`, lineHeight, letterSpacing };
    let h = textHeight(t, o);
    if (maxLines) h = Math.min(h, size * lineHeight * maxLines);
    return {
        h, mb, key,
        render: (y) => (
            <Txt text={t} x={x} y={y} {...o} align={align} fill={fill} opacity={opacity}
                {...(maxLines ? { height: h, ellipsis: true } : {})} />
        ),
    };
};

export const gradientDivider = ({ x, w, h = 2, palette, mb = 12, key = 'divider', align = 'center', containerW }) => ({
    h, mb, key,
    render: (y) => (
        <GradBar x={align === 'center' ? x + (containerW - w) / 2 : x} y={y} w={w} h={h}
            stops={[[0, clear(palette.primary)], [0.3, palette.primary], [0.7, palette.secondary], [1, clear(palette.secondary)]]} />
    ),
});

/** Equal-width info cards in one row (DATE / TIME / VENUE). */
export const infoRowBlock = ({ items, x, w, palette, font, mb = 0, key = 'info', gap = 8, labelSize = rem(0.48), valueSize = rem(0.76), glass = false }) => {
    if (!items?.length) return null;
    const cw = (w - gap * (items.length - 1)) / items.length;
    // value may wrap on narrow cards: size to the tallest
    const vh = Math.max(...items.map((it) => textHeight(it.value, { width: cw - 16, fontSize: valueSize, fontFamily: font, fontStyle: '700' })));
    const h = 12 + labelSize * 1.2 + 4 + vh + 12;
    return {
        h, mb, key,
        render: (y) => (
            <Group listening={false}>
                {items.map((item, i) => (
                    <Card key={i} x={x + i * (cw + gap)} y={y} width={cw} height={h} radius={10}
                        gradient={{ x1: 0, y1: 0, x2: cw, y2: h, stops: [[0, `${palette.primary}${glass ? '28' : '18'}`], [1, `${palette.bgMid}${glass ? '99' : '40'}`]] }}
                        stroke={`${palette.primary}40`}>
                        <GradBar x={cw * 0.2} y={0} w={cw * 0.6} h={1} stops={[[0, clear(palette.primary)], [0.5, `${palette.primary}60`], [1, clear(palette.primary)]]} />
                        <Txt text={String(item.label).toUpperCase()} x={8} y={12} width={cw - 16} align="center" fontSize={labelSize}
                            fontFamily={font} fontStyle="700" letterSpacing={1.5} fill={palette.secondary} />
                        <Txt text={item.value} x={8} y={12 + labelSize * 1.2 + 4} width={cw - 16} align="center" fontSize={valueSize}
                            fontFamily={font} fontStyle="700" fill={palette.text} />
                    </Card>
                ))}
            </Group>
        ),
    };
};

/** Stacked info lines with a left accent bar: "📅"-free (vector bar instead of emoji). */
export const infoStackBlock = ({ items, x, w, palette, font, mb = 0, key = 'infostack', gap = 6, labelSize = rem(0.5), valueSize = rem(0.8) }) => {
    if (!items?.length) return null;
    const rows = items.map((it) => {
        const vh = textHeight(it.value, { width: w - 22, fontSize: valueSize, fontFamily: font, fontStyle: '700' });
        return { it, h: 6 + labelSize * 1.2 + 2 + vh + 6 };
    });
    const total = rows.reduce((n, r) => n + r.h, 0) + gap * (rows.length - 1);
    return {
        h: total, mb, key,
        render: (y0) => {
            let y = y0;
            return (
                <Group listening={false}>
                    {rows.map((r, i) => {
                        const ry = y;
                        y += r.h + gap;
                        return (
                            <Group key={i} x={x} y={ry}>
                                <Rect width={w} height={r.h} cornerRadius={[0, 8, 8, 0]} fill={`${palette.bg}66`} />
                                <Rect width={3} height={r.h} fill={palette.primary} />
                                <Txt text={String(r.it.label).toUpperCase()} x={14} y={6} width={w - 22} fontSize={labelSize} fontFamily={font} fontStyle="700" letterSpacing={1.4} fill={palette.secondary} />
                                <Txt text={r.it.value} x={14} y={6 + labelSize * 1.2 + 2} width={w - 22} fontSize={valueSize} fontFamily={font} fontStyle="700" fill={palette.text} />
                            </Group>
                        );
                    })}
                </Group>
            );
        },
    };
};

const valueText = (v, max = 90) => truncate(Array.isArray(v) ? v.join(' • ') : String(v ?? ''), max);

/** "Label: value" pill rows (centered or left). */
export const extraRowsBlock = ({ items, x, w, palette, font, align = 'center', mb = 0, key = 'extra', size = rem(0.62), max = 80 }) => {
    if (!items?.length) return null;
    const rows = items.map((i) => ({ label: `${i.label}:`, value: valueText(i.value, max) }));
    const rowH = size * 1.2 + 8;
    return {
        h: rows.length * rowH + (rows.length - 1) * 5, mb, key,
        render: (y) => (
            <Group listening={false}>
                {rows.map((r, i) => {
                    const ry = y + i * (rowH + 5);
                    const lw = measureWidth(r.label, { fontSize: size, fontFamily: font, fontStyle: '700' });
                    const vw = measureWidth(r.value, { fontSize: size, fontFamily: font });
                    const sx = align === 'center' ? x + Math.max(12, (w - (lw + 6 + vw)) / 2) : x + 12;
                    return (
                        <Group key={i}>
                            <Card x={x} y={ry} width={w} height={rowH} radius={6}
                                gradient={{ x1: 0, y1: 0, x2: w, y2: rowH, stops: [[0, `${palette.primary}12`], [1, `${palette.secondary}08`]] }}
                                stroke={palette.divider} />
                            <Txt text={r.label} x={sx} y={ry + 4} fontSize={size} fontFamily={font} fontStyle="700" fill={palette.secondary} wrap="none" />
                            <Txt text={r.value} x={sx + lw + 6} y={ry + 4} fontSize={size} fontFamily={font} fill={palette.muted} wrap="none" />
                        </Group>
                    );
                })}
            </Group>
        ),
    };
};

/** Up to 3 side-by-side cards with a heading + bullet list (BoldHero / Asymmetric extras). */
export const extraCardsBlock = ({ items, x, w, palette, font, mb = 0, key = 'cards', gap = 8, max = 3 }) => {
    if (!items?.length) return null;
    const list = items.slice(0, max);
    const cw = (w - gap * (list.length - 1)) / list.length;
    const hs = rem(0.56);
    const bs = rem(0.6);
    const bodies = list.map((it) => {
        const lines = Array.isArray(it.value) ? it.value.slice(0, 4).map((b) => `•  ${truncate(b, 60)}`) : [valueText(it.value, 80)];
        return lines.join('\n');
    });
    const heights = bodies.map((b) => textHeight(b, { width: cw - 20, fontSize: bs, fontFamily: font, lineHeight: 1.35 }));
    const h = 10 + hs * 1.2 + 4 + Math.max(...heights) + 10;
    return {
        h, mb, key,
        render: (y) => (
            <Group listening={false}>
                {list.map((it, i) => (
                    <Card key={i} x={x + i * (cw + gap)} y={y} width={cw} height={h} radius={6}
                        gradient={{ x1: 0, y1: 0, x2: cw, y2: h, stops: [[0, `${palette.primary}18`], [1, `${palette.secondary}10`]] }}
                        stroke={`${palette.primary}35`}>
                        <Txt text={`${it.label}`.toUpperCase()} x={10} y={10} width={cw - 20} fontSize={hs} fontFamily={font} fontStyle="800" letterSpacing={0.8} fill={palette.secondary} />
                        <Txt text={bodies[i]} x={10} y={10 + hs * 1.2 + 4} width={cw - 20} fontSize={bs} fontFamily={font} lineHeight={1.35} fill={palette.text} />
                    </Card>
                ))}
            </Group>
        ),
    };
};

/** Footer text + hairline above it, anchored to `bottom`. Returns {top, node}. */
export const footerNode = ({ text, x, w, bottom, palette, font, size = rem(0.48), align = 'center', line = true }) => {
    const t = text || 'For more information, visit our website or contact the coordinator.';
    const h = textHeight(t, { width: w, fontSize: size, fontFamily: font, letterSpacing: 0.5 });
    const top = bottom - h - (line ? 9 : 0);
    return {
        top,
        node: (
            <Group listening={false}>
                {line && <Rect x={x} y={top} width={w} height={1} fill={palette.divider} opacity={0.6} />}
                <Txt text={t} x={x} y={top + (line ? 9 : 0)} width={w} align={align} fontSize={size} fontFamily={font} letterSpacing={0.5} fill={palette.muted} opacity={0.6} />
            </Group>
        ),
    };
};

/** Kicker label: small uppercase tracked text with optional accent dash. */
export const kickerBlock = ({ text, x, w, palette, font, size = rem(0.62), color, align = 'left', dash = false, mb = 8, key = 'kicker' }) => {
    if (!text) return null;
    const t = truncate(text, 60).toUpperCase();
    const h = textHeight(t, { width: w - (dash ? 22 : 0), fontSize: size, fontFamily: font, fontStyle: '700', letterSpacing: 3 });
    return {
        h, mb, key,
        render: (y) => (
            <Group listening={false}>
                {dash && <Rect x={x} y={y + h / 2 - 1} width={16} height={2} fill={palette.primary} />}
                <Txt text={t} x={x + (dash ? 22 : 0)} y={y} width={w - (dash ? 22 : 0)} align={align} fontSize={size} fontFamily={font} fontStyle="700" letterSpacing={3} fill={color || palette.accent} />
            </Group>
        ),
    };
};

export const spacer = (h, key) => ({ h, mb: 0, key, render: () => <Group /> });

/** Thin straight rule. */
export const Rule = ({ x, y, w, color, opacity = 1 }) => <Line points={[x, y, x + w, y]} stroke={color} strokeWidth={1} opacity={opacity} listening={false} />;
