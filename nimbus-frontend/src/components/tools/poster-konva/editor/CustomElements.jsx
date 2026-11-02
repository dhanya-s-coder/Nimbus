import React from 'react';
import { Group, Rect, Ellipse, Line, Image as KImage, Text } from 'react-konva';
import { Editable } from '../engine/edit';
import { Txt, useImg, useWhiteImg, containSize, CoverImage } from '../layers/ui';
import { linear } from '../engine/color';
import { applyStyleToProps, caseText } from '../engine/typography';
import { fieldValue, fieldLabel } from './elements';

/** Renders custom.elements in order (last = on top). Each one is an <Editable>, so move / resize / rotate / hide / undo just work. */

const shadowOf = (e) => (e.shadow ? { shadowColor: 'rgba(0,0,0,0.5)', shadowBlur: 14, shadowOffsetY: 4, shadowOpacity: 0.7 } : {});

const TextEl = ({ el, data, palette, editing }) => {
    const isField = el.type === 'field';
    const raw = isField ? fieldValue(data, el.bind) : el.text;
    const placeholder = isField && !raw;
    if (placeholder && !editing) return null;
    const heading = !isField || el.bind === 'title' || el.bind === 'speakerName';
    const base = {
        text: placeholder ? `[${fieldLabel(el.bind)}]` : (raw || ' '),
        x: el.x, y: el.y, width: el.w, align: el.align || 'center', fontSize: el.size || 28,
        fontFamily: heading ? (palette.titleFonts?.[0] || 'Montserrat') : (palette.bodyFont || 'Inter'),
        fontStyle: heading ? '700' : '400', fill: palette.text, lineHeight: 1.2, letterSpacing: 0,
        opacity: placeholder ? 0.45 : 1,
        shadowColor: 'rgba(0,0,0,0.5)', shadowBlur: 8, shadowOpacity: 0.6,
    };
    const props = applyStyleToProps(base, el.style);
    const text = el.style?.case ? caseText(props.text, el.style.case) : props.text;
    return <Txt {...props} text={text} />;
};

const ShapeEl = ({ el }) => {
    const { kind, x, y, w, h = 0 } = el;
    const common = { opacity: el.opacity ?? 1, ...shadowOf(el) };
    const paint = {
        stroke: el.stroke, strokeWidth: el.stroke ? el.strokeWidth || 0 : 0,
        ...(el.fill2 && el.fill ? linear(0, 0, w, h, [[0, el.fill], [1, el.fill2]]) : { fill: el.fill }),
    };
    if (kind === 'line') return <Line points={[x, y, x + w, y]} stroke={el.stroke} strokeWidth={el.strokeWidth || 2} lineCap="round" dash={el.dash ? [10, 8] : undefined} hitStrokeWidth={20} {...common} />;
    if (kind === 'ellipse') return <Ellipse x={x + w / 2} y={y + h / 2} radiusX={w / 2} radiusY={h / 2} {...paint} {...common} />;
    if (kind === 'triangle') return <Line points={[x + w / 2, y, x + w, y + h, x, y + h]} closed {...paint} {...common} />;
    return <Rect x={x} y={y} width={w} height={h} cornerRadius={el.radius || 0} {...paint} {...common} />;
};

const ImageEl = ({ el }) => {
    const [img] = useImg(el.src);
    if (!img) return <Rect x={el.x} y={el.y} width={el.w} height={el.h} fill="rgba(148,163,184,0.25)" />;
    const r = el.mask === 'circle' ? Math.min(el.w, el.h) / 2 : el.radius || 0;
    if (el.fit === 'contain') {
        const s = containSize(img, el.w, el.h);
        return <KImage image={img} x={el.x + (el.w - s.w) / 2} y={el.y + (el.h - s.h) / 2} width={s.w} height={s.h} opacity={el.opacity ?? 1} listening={false} />;
    }
    return <CoverImage image={img} x={el.x} y={el.y} width={el.w} height={el.h} cornerRadius={r} opacity={el.opacity ?? 1} />;
};

const Placeholder = ({ el, label }) => (
    <Group x={el.x} y={el.y} listening={false}>
        <Rect width={el.w} height={el.h} stroke="#94a3b8" strokeWidth={1.2} dash={[5, 4]} cornerRadius={6} fill="rgba(148,163,184,0.12)" />
        <Text text={label} width={el.w} height={el.h} align="center" verticalAlign="middle" fontSize={Math.max(9, Math.min(13, el.w / 7))} fontFamily="Inter" fill="#94a3b8" />
    </Group>
);

const LogosEl = ({ el, data, palette, editing }) => {
    const cses = useWhiteImg('/assets/cses-logo.png', palette.darkContent === false ? '#111827' : '#ffffff');
    const [college] = useImg(data.collegeLogo);
    const [event] = useImg(data.eventBrandLogo);
    const imgs = [cses, college, event].filter(Boolean);
    if (!imgs.length) return editing ? <Placeholder el={el} label="Logos" /> : null;
    let cx = el.x;
    return (
        <Group listening={false}>
            {imgs.map((im, i) => {
                const s = containSize(im, el.w, el.h);
                const node = <KImage key={i} image={im} x={cx} y={el.y + (el.h - s.h) / 2} width={s.w} height={s.h} />;
                cx += s.w + 10;
                return node;
            })}
        </Group>
    );
};

const QrEl = ({ el, data, editing }) => {
    const qr = el.src ? { image: el.src } : (el.block === 'qr2' ? data.qr2 : data.qr1); // own upload first, else the form's QR
    const [img] = useImg(qr?.image);
    if (!qr) return editing ? <Placeholder el={el} label="QR: upload one" /> : null;
    const pad = Math.max(3, el.w * 0.06);
    return (
        <Group x={el.x} y={el.y} listening={false}>
            <Rect width={el.w} height={el.h} cornerRadius={6} fill="#ffffff" shadowColor="#000000" shadowBlur={10} shadowOpacity={0.25} shadowOffsetY={2} />
            {img && <KImage image={img} x={pad} y={pad} width={el.w - pad * 2} height={el.h - pad * 2} />}
        </Group>
    );
};

const poly = (shape, w, h) => {
    if (shape === 'Hexagon') return [[0.25, 0.06], [0.75, 0.06], [1, 0.5], [0.75, 0.94], [0.25, 0.94], [0, 0.5]].map(([a, b]) => [a * w, b * h]);
    if (shape === 'Diamond') return [[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]].map(([a, b]) => [a * w, b * h]);
    return null;
};

const AvatarEl = ({ el, data, editing }) => {
    const photo = el.src || data.speakerPhoto;
    const [img] = useImg(photo);
    if (!photo) return editing ? <Placeholder el={el} label="Speaker photo" /> : null;
    const p = poly(el.shape, el.w, el.h);
    const clip = (ctx) => {
        ctx.beginPath();
        if (p) p.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        else if (el.shape === 'Square') ctx.rect(0, 0, el.w, el.h);
        else ctx.ellipse(el.w / 2, el.h / 2, el.w / 2, el.h / 2, 0, 0, Math.PI * 2);
        ctx.closePath();
    };
    return (
        <Group x={el.x} y={el.y} clipFunc={clip} listening={false}>
            <Rect width={el.w} height={el.h} fill="#1f2937" />
            {img && <CoverImage image={img} width={el.w} height={el.h} px={0.5} py={0.1} />}
        </Group>
    );
};

const CustomElements = ({ elements = [], data, palette, editing }) => (
    <>
        {elements.map((el) => (
            <Editable key={el.id} id={el.id}>
                {el.type === 'text' || el.type === 'field' ? <TextEl el={el} data={data} palette={palette} editing={editing} />
                    : el.type === 'shape' ? <ShapeEl el={el} />
                        : el.type === 'image' ? <ImageEl el={el} />
                            : el.type === 'block' ? (
                                el.block === 'logos' ? <LogosEl el={el} data={data} palette={palette} editing={editing} />
                                    : el.block === 'avatar' ? <AvatarEl el={el} data={data} editing={editing} />
                                        : <QrEl el={el} data={data} editing={editing} />
                            ) : null}
            </Editable>
        ))}
    </>
);

export default CustomElements;
