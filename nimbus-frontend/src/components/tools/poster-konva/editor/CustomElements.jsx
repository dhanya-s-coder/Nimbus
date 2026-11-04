import React from 'react';
import { Group, Rect, Ellipse, Line, Shape, Image as KImage, Text } from 'react-konva';
import { Editable } from '../engine/edit';
import { Txt, useImg, useWhiteImg, containSize, CoverImage } from '../layers/ui';
import { linear } from '../engine/color';
import { applyStyleToProps, caseText } from '../engine/typography';
import { fieldValue, fieldLabel } from './elements';
import { maskPath, maskOf, frameBox } from './shapes';

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

const ShapeEl = ({ el, editing }) => {
    const { kind, x, y, w, h = 0 } = el;
    const common = { opacity: el.opacity ?? 1, ...shadowOf(el) };
    const bare = kind !== 'line' && !el.fill && !el.stroke; // no fill and no outline would be invisible
    const paint = bare
        ? (editing ? { stroke: '#94a3b8', strokeWidth: 1.2, dash: [6, 4] } : {}) // editor only: a faint dashed outline so it can still be found
        : {
            stroke: el.stroke, strokeWidth: el.stroke ? el.strokeWidth || 0 : 0,
            ...(el.fill2 && el.fill ? linear(0, 0, w, h, [[0, el.fill], [1, el.fill2]]) : { fill: el.fill }),
        };
    if (kind === 'line') return <Line points={[x, y, x + w, y]} stroke={el.stroke} strokeWidth={el.strokeWidth || 2} lineCap="round" dash={el.dash ? [10, 8] : undefined} hitStrokeWidth={20} {...common} />;
    if (kind === 'ellipse') return <Ellipse x={x + w / 2} y={y + h / 2} radiusX={w / 2} radiusY={h / 2} {...paint} {...common} />;
    if (kind === 'triangle') return <Line points={[x + w / 2, y, x + w, y + h, x, y + h]} closed {...paint} {...common} />;
    return <Rect x={x} y={y} width={w} height={h} cornerRadius={el.radius || 0} {...paint} {...common} />;
};

/**
 * A picture cut into a shape (rectangle, rounded, circle, arch, star ...) with an optional border style.
 * children(w, h) draws the picture for the inner box; the mask clips it and the border is drawn around the same outline.
 */
const Framed = ({ x, y, w, h, mask, radius, border = {}, opacity = 1, children }) => {
    const style = border.style || 'none';
    const color = border.color || '#ffffff';
    const bw = Math.max(1, border.width ?? 4);
    const polaroid = style === 'polaroid';
    const box = polaroid ? frameBox(w, h, bw) : { x: 0, y: 0, w, h };
    const outline = maskPath(polaroid ? 'none' : mask, w, h, radius);
    const inner = maskPath(polaroid ? 'none' : mask, box.w, box.h, radius);
    const draw = (path) => (ctx, shape) => { ctx.beginPath(); path(ctx); ctx.closePath(); ctx.fillStrokeShape(shape); };
    const clip = (ctx) => { ctx.beginPath(); inner(ctx); ctx.closePath(); };
    const gap = bw * 2.4;
    return (
        <Group x={x} y={y} opacity={opacity} listening={false}>
            {style === 'shadow' && <Shape sceneFunc={draw(outline)} fill="#000000" shadowColor="#000000" shadowBlur={26} shadowOpacity={0.55} shadowOffsetY={10} />}
            {style === 'glow' && <Shape sceneFunc={draw(outline)} fill="#000000" shadowColor={color} shadowBlur={bw * 5 + 14} shadowOpacity={0.95} />}
            {polaroid && <Rect width={w} height={h} fill={color} shadowColor="#000000" shadowBlur={18} shadowOpacity={0.35} shadowOffsetY={6} />}
            <Group x={box.x} y={box.y} clipFunc={clip}>{children(box.w, box.h)}</Group>
            {(style === 'solid' || style === 'glow') && <Shape sceneFunc={draw(outline)} stroke={color} strokeWidth={style === 'glow' ? Math.max(1.5, bw / 2) : bw} />}
            {style === 'dashed' && <Shape sceneFunc={draw(outline)} stroke={color} strokeWidth={bw} dash={[bw * 3, bw * 2]} />}
            {style === 'dotted' && <Shape sceneFunc={draw(outline)} stroke={color} strokeWidth={bw} dash={[0.1, bw * 2]} lineCap="round" />}
            {style === 'double' && (
                <>
                    <Shape sceneFunc={draw(outline)} stroke={color} strokeWidth={bw} />
                    <Shape x={gap} y={gap} sceneFunc={draw(maskPath(mask, Math.max(4, w - gap * 2), Math.max(4, h - gap * 2), Math.max(0, (radius ?? 24) - gap)))} stroke={color} strokeWidth={Math.max(1, bw * 0.55)} />
                </>
            )}
        </Group>
    );
};

const ImageEl = ({ el }) => {
    const [img] = useImg(el.src);
    return (
        <Framed x={el.x} y={el.y} w={el.w} h={el.h} mask={maskOf(el.mask)} radius={el.radius ?? 24} border={el.border} opacity={el.opacity ?? 1}>
            {(iw, ih) => {
                if (!img) return <Rect width={iw} height={ih} fill="rgba(148,163,184,0.25)" />;
                if (el.fit === 'contain') {
                    const sz = containSize(img, iw, ih);
                    return <KImage image={img} x={(iw - sz.w) / 2} y={(ih - sz.h) / 2} width={sz.w} height={sz.h} />;
                }
                return <CoverImage image={img} width={iw} height={ih} />;
            }}
        </Framed>
    );
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

const AvatarEl = ({ el, data, editing }) => {
    const photo = el.src || data.speakerPhoto;
    const [img] = useImg(photo);
    if (!photo) return editing ? <Placeholder el={el} label="Speaker photo" /> : null;
    return (
        <Framed x={el.x} y={el.y} w={el.w} h={el.h} mask={maskOf(el.shape || 'circle')} radius={el.radius ?? 24} border={el.border} opacity={el.opacity ?? 1}>
            {(iw, ih) => (
                <>
                    <Rect width={iw} height={ih} fill="#1f2937" />
                    {img && <CoverImage image={img} width={iw} height={ih} px={0.5} py={0.1} />}
                </>
            )}
        </Framed>
    );
};

const CustomElements = ({ elements = [], data, palette, editing }) => (
    <>
        {elements.map((el) => (
            <Editable key={el.id} id={el.id}>
                {el.type === 'text' || el.type === 'field' ? <TextEl el={el} data={data} palette={palette} editing={editing} />
                    : el.type === 'shape' ? <ShapeEl el={el} editing={editing} />
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
