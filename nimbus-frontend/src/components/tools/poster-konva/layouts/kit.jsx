import React from 'react';
import { Group, Rect, Shape } from 'react-konva';
import { DESIGN_W as W, rem } from '../engine/constants';
import { Txt, textHeight, QrBlock, SpeakerAvatar } from '../layers/ui';
import { fitFontSize, measureWidth, truncate } from '../engine/text';

/**
 * Small building blocks shared by the newer layouts (kept apart from parts.jsx so the original
 * layouts are untouched). Everything is in the 600-wide design space.
 */

/** The font a layout wants unless the user picked one in the Text tab (then palette.userTitleFont is set). */
export const pickTitleFont = (palette, wanted) => palette.userTitleFont || wanted || palette.titleFonts?.[0] || 'Montserrat';
export const pickBodyFont = (palette, wanted) => palette.userBodyFont || wanted || palette.bodyFont || 'Inter';

/** Height of a QR plate + caption as drawn by QrBlock. */
export const qrHeight = (qr, size = 56, labelSize = 7) => (qr ? size + 10 + (qr.label ? 5 + labelSize * 1.2 : 0) : 0);

/** One or two QR codes side by side. Returns { w, h, node } for the strip anchored at (x, y) (x = left edge). */
export const qrStrip = ({ qr1, qr2, x, y, size = 56, gap = 12, palette, labelSize = 7 }) => {
    const list = [qr1 && ['qr1', qr1], qr2 && ['qr2', qr2]].filter(Boolean);
    if (!list.length) return { w: 0, h: 0, node: null };
    const plate = size + 10;
    return {
        w: list.length * plate + (list.length - 1) * gap,
        h: Math.max(...list.map(([, q]) => qrHeight(q, size, labelSize))),
        node: list.map(([id, q], i) => (
            <QrBlock key={id} x={x + i * (plate + gap)} y={y} size={size} qr={q} eid={id} palette={palette} labelSize={labelSize} />
        )),
    };
};

/** Speaker photo + name + designation as a row. Returns { h, render(y) } or null. */
export const speakerRow = ({ data, x, w, palette, titleFont, bodyFont, avatar = 64, ink, soft, align = 'left' }) => {
    const { speakerName, speakerDesignation, speakerPhoto, speakerShape } = data;
    if (!speakerName && !speakerPhoto) return null;
    const av = speakerPhoto ? avatar : 0;
    const tx = x + (av ? av + 12 : 0);
    const tw = w - (av ? av + 12 : 0);
    const nameH = speakerName ? rem(0.95) * 1.2 : 0;
    const desH = speakerDesignation ? 3 + rem(0.62) * 1.25 : 0;
    const h = Math.max(av, nameH + desH);
    return {
        h,
        render: (y) => (
            <Group listening={false}>
                {speakerPhoto && <SpeakerAvatar x={x} y={y} size={av} shape={speakerShape || 'Circle'} src={speakerPhoto} palette={palette} />}
                {speakerName && <Txt text={speakerName} x={tx} y={y + (h - nameH - desH) / 2} width={tw} align={align} fontSize={rem(0.95)} fontFamily={titleFont} fontStyle="700" fill={ink} />}
                {speakerName && speakerDesignation && <Txt text={speakerDesignation} x={tx} y={y + (h - nameH - desH) / 2 + nameH + 3} width={tw} align={align} fontSize={rem(0.62)} fontFamily={bodyFont} fontStyle="italic 400" fill={soft} />}
            </Group>
        ),
    };
};

/** Text that fits one line in `w` (shrinks, never wraps). Returns { size, h, width }. */
export const oneLine = (text, { w, maxSize, minSize = 8, fontFamily, fontStyle = '700', letterSpacing = 0 }) => {
    const size = fitFontSize(text, { width: w, maxSize, minSize, maxLines: 1, fontFamily, fontStyle, letterSpacing, lineHeight: 1 });
    return { size, h: textHeight(text, { width: w, fontSize: size, fontFamily, fontStyle, lineHeight: 1, letterSpacing }), width: Math.min(w, measureWidth(text, { fontSize: size, fontFamily, fontStyle, letterSpacing })) };
};

/** Compact "LABEL / value" lines, one per item, hairline-separated. Returns { h, render(y) }. */
export const infoLines = ({ items, x, w, bodyFont, titleFont, ink, soft, accent, rule, valueSize = rem(0.9), labelSize = rem(0.5), gap = 10 }) => {
    if (!items?.length) return null;
    const rows = items.map((it) => {
        const vh = textHeight(it.value, { width: w, fontSize: valueSize, fontFamily: titleFont, fontStyle: '700', lineHeight: 1.15 });
        return { it, vh, h: labelSize * 1.2 + 3 + vh };
    });
    const h = rows.reduce((n, r) => n + r.h, 0) + gap * (rows.length - 1) + (rows.length - 1);
    return {
        h,
        render: (y0) => {
            let y = y0;
            return (
                <Group listening={false}>
                    {rows.map((r, i) => {
                        const ry = y;
                        y += r.h + gap + 1;
                        return (
                            <Group key={i} x={x} y={ry}>
                                <Txt text={String(r.it.label).toUpperCase()} width={w} fontSize={labelSize} fontFamily={bodyFont} fontStyle="700" letterSpacing={2} fill={accent} />
                                <Txt text={r.it.value} y={labelSize * 1.2 + 3} width={w} fontSize={valueSize} fontFamily={titleFont} fontStyle="700" lineHeight={1.15} fill={ink} />
                                {i < rows.length - 1 && <Rect y={r.h + gap / 2} width={w} height={1} fill={rule || soft} opacity={0.35} />}
                            </Group>
                        );
                    })}
                </Group>
            );
        },
    };
};

/** Highlights/prizes etc. as short "Label — value" lines (values truncated). Returns { h, render(y) } or null. */
export const extraLines = ({ items, x, w, bodyFont, ink, size = rem(0.62), max = 3, valueMax = 70, align = 'left' }) => {
    if (!items?.length) return null;
    const rows = items.slice(0, max).map((i) => ({
        label: `${i.label}`.toUpperCase(),
        value: truncate(Array.isArray(i.value) ? i.value.join(' • ') : String(i.value ?? ''), valueMax),
    }));
    const lh = size * 1.3;
    return {
        h: rows.length * (lh + 4),
        render: (y) => (
            <Group listening={false}>
                {rows.map((r, i) => (
                    <Txt key={i} x={x} y={y + i * (lh + 4)} width={w} align={align} wrap="none" ellipsis fontSize={size} fontFamily={bodyFont} fill={ink}
                        text={`${r.label}  ·  ${r.value}`} fontStyle="600" />
                ))}
            </Group>
        ),
    };
};

/** A filled path with holes (even-odd): `paths` are functions(ctx) that each add one closed sub-path. */
export const HoleShape = ({ paths, fill, opacity = 1, shadow, ...rest }) => (
    <Shape
        listening={false}
        fill={fill}
        opacity={opacity}
        fillRule="evenodd"
        {...(shadow || {})}
        {...rest}
        sceneFunc={(ctx, shape) => {
            ctx.beginPath();
            paths.forEach((p) => p(ctx));
            ctx.fillStrokeShape(shape);
        }}
    />
);

/** Rounded-rect sub-path helper. */
export const rrPath = (x, y, w, h, r) => (ctx) => {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.arc(x + w - rr, y + rr, rr, -Math.PI / 2, 0);
    ctx.lineTo(x + w, y + h - rr);
    ctx.arc(x + w - rr, y + h - rr, rr, 0, Math.PI / 2);
    ctx.lineTo(x + rr, y + h);
    ctx.arc(x + rr, y + h - rr, rr, Math.PI / 2, Math.PI);
    ctx.lineTo(x, y + rr);
    ctx.arc(x + rr, y + rr, rr, Math.PI, Math.PI * 1.5);
    ctx.closePath();
};

/** Arch (rounded top) sub-path: x,y = top-left of the bounding box. */
export const archPath = (x, y, w, h) => (ctx) => {
    const r = w / 2;
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.arc(x + r, y + r, r, Math.PI, 0);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
};

export const PAGE_W = W;
