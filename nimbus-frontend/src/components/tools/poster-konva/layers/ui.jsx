import React, { useMemo } from 'react';
import { Group, Rect, Text, Image as KImage, Circle, Line } from 'react-konva';
import useImage from 'use-image';
import { measureText } from '../engine/text';
import { linear } from '../engine/color';
import { Editable } from '../engine/edit';

/** Text node with canvas-friendly defaults (never listens, wraps by word). */
export const Txt = ({ text, ...props }) => (
    <Text text={String(text ?? '')} listening={false} wrap="word" lineHeight={1.2} {...props} />
);

/** Height a Txt with the same props would take (for manual vertical stacking). */
export const textHeight = (text, p) =>
    measureText(text, {
        width: p.width, fontSize: p.fontSize, fontFamily: p.fontFamily,
        fontStyle: p.fontStyle || '400', lineHeight: p.lineHeight || 1.2, letterSpacing: p.letterSpacing || 0,
    }).height;

export const useImg = (src) => {
    const [img, status] = useImage(src || '', 'anonymous');
    return [src ? img : null, status];
};

/** Silhouette of an image filled solid white (replaces CSS brightness(0) invert(1)). */
export const useWhiteImg = (src, tint = '#ffffff') => {
    const [img] = useImg(src);
    return useMemo(() => {
        if (!img) return null;
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = tint;
        ctx.fillRect(0, 0, c.width, c.height);
        return c;
    }, [img, tint]);
};

/** Draw an image to fit inside (maxW x maxH) preserving aspect ("object-fit: contain"). */
export const containSize = (img, maxW, maxH) => {
    if (!img) return { w: 0, h: 0 };
    const r = Math.min(maxW / img.width, maxH / img.height);
    return { w: img.width * r, h: img.height * r };
};

/** Image covering a (w x h) box, cropped around (px,py) (0..1; 0.5/0 = center-top). */
export const CoverImage = ({ image, x = 0, y = 0, width, height, px = 0.5, py = 0.5, ...rest }) => {
    if (!image) return null;
    const scale = Math.max(width / image.width, height / image.height);
    const cw = width / scale;
    const ch = height / scale;
    return (
        <KImage
            image={image} x={x} y={y} width={width} height={height} listening={false}
            crop={{ x: (image.width - cw) * px, y: (image.height - ch) * py, width: cw, height: ch }}
            {...rest}
        />
    );
};

/** Rounded translucent card: gradient or flat fill, optional border. */
export const Card = ({ x, y, width, height, radius = 10, fill, gradient, stroke, strokeWidth = 1, children }) => (
    <Group x={x} y={y} listening={false}>
        <Rect
            width={width} height={height} cornerRadius={radius}
            {...(gradient ? linear(gradient.x1 ?? 0, gradient.y1 ?? 0, gradient.x2 ?? width, gradient.y2 ?? height, gradient.stops) : { fill })}
            stroke={stroke} strokeWidth={stroke ? strokeWidth : 0}
        />
        {children}
    </Group>
);

/**
 * Logo row: CSES mark (white), optional college + event logos in glass pills.
 * Returns elements laid out left->right starting at (x, y), `h` tall.
 */
export const LogoBar = ({ x, y, h = 34, collegeLogo, eventLogo, cses = true, gap = 8, align = 'left', width = 0, tint = '#ffffff' }) => {
    const csesImg = useWhiteImg(cses ? '/assets/cses-logo.png' : null, tint);
    const [college] = useImg(collegeLogo);
    const [event] = useImg(eventLogo);

    const items = [];
    if (csesImg) {
        const s = containSize(csesImg, 90, h);
        items.push({ key: 'cses', img: csesImg, w: s.w, h: s.h, pill: false });
    }
    [['college', college], ['event', event]].forEach(([key, img]) => {
        if (!img) return;
        const s = containSize(img, 80, h);
        items.push({ key, img, w: s.w + 16, h: h + 8, iw: s.w, ih: s.h, pill: true });
    });
    const total = items.reduce((n, it) => n + it.w, 0) + Math.max(0, items.length - 1) * gap;
    let cx = align === 'right' ? x + width - total : align === 'center' ? x + (width - total) / 2 : x;
    return (
        <Editable id="logos">
        <Group listening={false}>
            {items.map((it) => {
                const node = it.pill ? (
                    <Group key={it.key} x={cx} y={y + (h - it.h) / 2 + 0}>
                        <Rect width={it.w} height={it.h} cornerRadius={8} fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                        <KImage image={it.img} x={8} y={(it.h - it.ih) / 2} width={it.iw} height={it.ih} />
                    </Group>
                ) : (
                    <KImage key={it.key} image={it.img} x={cx} y={y + (h - it.h) / 2} width={it.w} height={it.h} shadowColor={tint} shadowBlur={tint === '#ffffff' ? 3 : 0} shadowOpacity={0.6} />
                );
                cx += it.w + gap;
                return node;
            })}
        </Group>
        </Editable>
    );
};

/** White rounded plate with a QR image and optional caption. width = plate width. */
export const QrBlock = ({ x, y, size = 92, qr, palette, labelSize = 8, eid = 'qr1' }) => {
    const [img] = useImg(qr?.image);
    if (!qr) return null;
    const pad = 5;
    const plate = size + pad * 2;
    return (
        <Editable id={eid}>
        <Group x={x} y={y} listening={false}>
            <Rect width={plate} height={plate} cornerRadius={6} fill="#ffffff"
                shadowColor={`${palette.primary || '#000'}`} shadowBlur={10} shadowOpacity={0.25} shadowOffsetY={2} />
            {img && <KImage image={img} x={pad} y={pad} width={size} height={size} />}
            {qr.label && (
                <Txt text={qr.label.toUpperCase()} y={plate + 5} width={plate} align="center" fontSize={labelSize}
                    fontFamily="Inter" fontStyle="700" letterSpacing={0.5} fill={palette.muted || palette.text} />
            )}
        </Group>
        </Editable>
    );
};

const hexPoints = (s) => [[0.25, 0.06], [0.75, 0.06], [1, 0.5], [0.75, 0.94], [0.25, 0.94], [0, 0.5]].map(([a, b]) => [a * s, b * s]);
const diamondPoints = (s) => [[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]].map(([a, b]) => [a * s, b * s]);

/** Speaker photo clipped to a shape with glow + dashed guide outline. (x,y) is top-left. */
export const SpeakerAvatar = ({ x, y, size = 150, shape = 'Circle', src, palette }) => {
    const [img] = useImg(src);
    if (!src || src === 'null' || src === 'undefined') return null;
    const poly = shape === 'Hexagon' ? hexPoints(size) : shape === 'Diamond' ? diamondPoints(size) : null;
    const clipFunc = (ctx) => {
        ctx.beginPath();
        if (poly) {
            poly.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
        } else if (shape === 'Square') {
            ctx.rect(0, 0, size, size);
        } else {
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        }
        ctx.closePath();
    };
    const guide = 'rgba(255,255,255,0.95)';
    const glow = `${palette.primary || '#ffffff'}`;
    return (
        <Editable id="avatar">
        <Group x={x} y={y} listening={false}>
            {/* glow follows the clipped silhouette */}
            {poly ? (
                <Line points={poly.flat()} closed fill={glow} opacity={0.0} shadowColor={glow} shadowBlur={16} shadowOpacity={0.75} />
            ) : shape === 'Square' ? (
                <Rect width={size} height={size} fill="rgba(0,0,0,0.01)" shadowColor={glow} shadowBlur={16} shadowOpacity={0.5} />
            ) : (
                <Circle x={size / 2} y={size / 2} radius={size / 2} fill="rgba(0,0,0,0.01)" shadowColor={glow} shadowBlur={16} shadowOpacity={0.5} />
            )}
            <Group clipFunc={clipFunc}>
                <Rect width={size} height={size} fill={`${palette.bgMid || '#000000'}`} />
                {img && <CoverImage image={img} width={size} height={size} px={0.5} py={0} />}
            </Group>
            {poly ? (
                <Line points={poly.flat()} closed stroke={guide} strokeWidth={2} dash={[5, 4]} />
            ) : shape === 'Square' ? (
                <Rect x={-4} y={-4} width={size + 8} height={size + 8} stroke={guide} strokeWidth={2} dash={[5, 4]} />
            ) : (
                <Circle x={size / 2} y={size / 2} radius={size / 2 + 4} stroke={guide} strokeWidth={2} dash={[5, 4]} />
            )}
        </Group>
        </Editable>
    );
};
