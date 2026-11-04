import React from 'react';
import { Group, Rect, Circle } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H, rem } from '../engine/constants';
import { darken, linear } from '../engine/color';
import { Txt, textHeight, LogoBar } from '../layers/ui';
import { Grain } from '../layers/primitives';
import { stackCentered } from './stack';
import { titleBlock, textBlock, kickerBlock, footerNode } from './parts';
import { pickTitleFont, pickBodyFont, qrStrip, speakerRow, extraLines, rrPath, HoleShape } from './kit';
import { fitFontSize } from '../engine/text';
import { Editable } from '../engine/edit';

export const FONTS = ['Fraunces'];

const PAPER = '#f8f6f1';
const INK = '#14161f';
const SOFT = 'rgba(20,22,31,0.64)';
const PAD = 30;
const CW = W - PAD * 2;

/** Full photo on top, a paper card with rounded corners rising over it, a date sticker on the seam. */
const PhotoHero = ({ data, palette }) => {
    const tf = pickTitleFont(palette, 'Fraunces');
    const bf = pickBodyFont(palette, 'Inter');
    const accent = darken(palette.primary, 0.12);
    const { title, subtitle, organizer, description, infoItems = [], extraItems = [], collegeLogo, eventBrandLogo, qr1, qr2, footer } = data;

    const cardTop = Math.round(H * (H >= 900 ? 0.5 : 0.44));
    const R = 30;

    // bottom of the card: info chips, QR + footer
    const foot = footerNode({ text: footer, x: PAD, w: CW * 0.7, bottom: H - 16, palette: { ...palette, divider: SOFT, muted: SOFT }, font: bf, size: rem(0.44), align: 'left', line: false });
    const qr = qrStrip({ qr1, qr2, x: 0, y: 0, size: 44, palette: { ...palette, muted: SOFT, text: INK }, labelSize: 6 });
    const n = infoItems.length || 1;
    const gap = 8;
    const chipsW = CW - (qr.w ? qr.w + 14 : 0);
    const cw = (chipsW - gap * (n - 1)) / n;
    const valS = rem(0.76);
    const vH = infoItems.length ? Math.max(...infoItems.map((it) => textHeight(it.value, { width: cw - 20, fontSize: valS, fontFamily: bf, fontStyle: '700', lineHeight: 1.12 }))) : 0;
    const chipH = infoItems.length ? 10 + rem(0.44) * 1.2 + 3 + vH + 10 : 0;
    const chipsTop = foot.top - 14 - chipH;

    // body between the card top and the chips
    const spk = speakerRow({ data, x: PAD, w: CW - (qr.w ? qr.w + 14 : 0), palette, titleFont: tf, bodyFont: bf, avatar: 46, ink: INK, soft: SOFT });
    const build = (size) => [
        organizer && kickerBlock({ text: organizer, x: PAD, w: CW - 90, palette, font: bf, size: rem(0.56), color: accent, align: 'left', dash: true, mb: 10, key: 'org' }),
        titleBlock({ text: title, x: PAD, w: CW, font: tf, weight: '800', maxSize: size, minSize: 24, maxLines: 3, align: 'left', lineHeight: 0.98, letterSpacing: -1, upper: false, fill: INK, shadow: false, palette, mb: 8 }),
        subtitle && textBlock({ text: subtitle, x: PAD, w: CW, font: tf, size: rem(0.95), italic: true, align: 'left', fill: accent, mb: 8, key: 'sub', maxLines: 2 }),
        description && textBlock({ text: description, x: PAD, w: CW, font: bf, size: rem(0.68), lineHeight: 1.55, fill: SOFT, mb: 8, key: 'desc', maxLines: 3 }),
        spk && { h: spk.h, mb: 8, key: 'spk', render: spk.render },
        (() => { const r = extraLines({ items: extraItems, x: PAD, w: CW, bodyFont: bf, ink: SOFT, size: rem(0.58), max: 2 }); return r && { h: r.h, mb: 0, key: 'extra', render: r.render }; })(),
    ].filter(Boolean);
    const total = (bs) => bs.reduce((nn, b) => nn + b.h + (b.mb || 0), 0) - (bs.length ? bs[bs.length - 1].mb || 0 : 0);
    const top = cardTop + 40;
    const bottom = chipsTop - 14;
    const size = [58, 50, 44, 38, 34, 30, 26].find((s) => total(build(s)) <= bottom - top) ?? 26;
    const body = stackCentered(build(size), top, bottom);

    // sticker
    const stickerText = infoItems[0] ? String(infoItems[0].value).toUpperCase() : '';
    const stSize = stickerText ? fitFontSize(stickerText, { width: 70, maxSize: 13, minSize: 7, maxLines: 3, maxHeight: 54, fontFamily: bf, fontStyle: '800', letterSpacing: 0.5, lineHeight: 1.1 }) : 0;
    const stH = stickerText ? textHeight(stickerText, { width: 70, fontSize: stSize, fontFamily: bf, fontStyle: '800', lineHeight: 1.1, letterSpacing: 0.5 }) : 0;

    return (
        <Group listening={false}>
            {/* soft shade over the photo for the logos */}
            <Rect width={W} height={cardTop + 40} {...linear(0, 0, 0, cardTop + 40, [[0, 'rgba(4,8,18,0.55)'], [0.35, 'rgba(4,8,18,0.0)'], [1, 'rgba(4,8,18,0.25)']])} />
            <LogoBar x={PAD} y={24} h={26} collegeLogo={collegeLogo} eventLogo={eventBrandLogo} align="left" width={CW / 2} />

            {/* the card: paper with rounded top corners, lifted by a shadow */}
            <HoleShape fill={PAPER} shadowColor="#000000" shadowBlur={30} shadowOpacity={0.35} shadowOffsetY={-6}
                paths={[rrPath(0, cardTop, W, H - cardTop + R, R)]} />
            <Grain opacity={0.035} />

            {/* date sticker on the seam */}
            {stickerText && (
                <Editable id="badge">
                    <Group x={W - PAD - 46} y={cardTop - 8} rotation={-9}>
                        <Circle radius={46} fill={accent} shadowColor="#000000" shadowBlur={14} shadowOpacity={0.35} shadowOffsetY={4} />
                        <Circle radius={40} stroke="rgba(255,255,255,0.7)" strokeWidth={1} dash={[3, 3]} />
                        <Txt text={stickerText} x={-35} y={-stH / 2} width={70} align="center" fontSize={stSize} lineHeight={1.1} fontFamily={bf} fontStyle="800" letterSpacing={0.5} fill="#ffffff" />
                    </Group>
                </Editable>
            )}

            {body.nodes}

            {/* info chips */}
            {infoItems.length > 0 && (
                <Editable id="info">
                    <Group x={PAD} y={chipsTop} listening={false}>
                        {infoItems.map((it, i) => (
                            <Group key={i} x={i * (cw + gap)}>
                                <Rect width={cw} height={chipH} cornerRadius={12} fill={`${accent}18`} />
                                <Rect width={3} height={chipH - 14} y={7} cornerRadius={2} fill={accent} />
                                <Txt text={String(it.label).toUpperCase()} x={14} y={10} width={cw - 20} fontSize={rem(0.44)} fontFamily={bf} fontStyle="700" letterSpacing={2} fill={SOFT} />
                                <Txt text={it.value} x={14} y={10 + rem(0.44) * 1.2 + 3} width={cw - 20} fontSize={valS} fontFamily={bf} fontStyle="700" lineHeight={1.12} fill={INK} />
                            </Group>
                        ))}
                    </Group>
                </Editable>
            )}
            {qr.node && <Group x={W - PAD - qr.w} y={H - 14 - qr.h}>{qr.node}</Group>}
            {foot.node}
        </Group>
    );
};

export default PhotoHero;
