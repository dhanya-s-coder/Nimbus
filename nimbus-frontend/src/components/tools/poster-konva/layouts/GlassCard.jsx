import React from 'react';
import { Group, Rect } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H, rem } from '../engine/constants';
import { linear } from '../engine/color';
import { Txt, textHeight, LogoBar } from '../layers/ui';
import { Glow } from '../layers/primitives';
import { stack } from './stack';
import { titleBlock, textBlock, kickerBlock, footerNode } from './parts';
import { pickTitleFont, pickBodyFont, qrStrip, speakerRow, extraLines } from './kit';

export const FONTS = ['Bricolage Grotesque'];

const MX = 22; // card margin
const CARD_W = W - MX * 2;
const PADX = 26;
const CW = CARD_W - PADX * 2;
const INK = '#ffffff';
const SOFT = 'rgba(255,255,255,0.82)';

/** Frosted-glass card floating over the artwork, with glowing light orbs behind it. */
const GlassCard = ({ data, palette }) => {
    const tf = pickTitleFont(palette, 'Bricolage Grotesque');
    const bf = pickBodyFont(palette, 'Inter');
    const tw = '700';
    const { title, subtitle, organizer, description, infoItems = [], extraItems = [], collegeLogo, eventBrandLogo, qr1, qr2, footer } = data;

    const bottom = H - 22;
    const qr = qrStrip({ qr1, qr2, x: 0, y: 0, size: 44, gap: 8, palette, labelSize: 6 });
    const foot = footerNode({ text: footer, x: MX + PADX, w: CW - (qr.w ? qr.w + 14 : 0), bottom: bottom - 14, palette, font: bf, size: rem(0.44), align: 'left', line: false });
    const footH = bottom - 14 - foot.top;

    // chips
    const n = infoItems.length || 1;
    const gap = 8;
    const cw = (CW - gap * (n - 1)) / n;
    const valS = rem(0.78);
    const vH = infoItems.length ? Math.max(...infoItems.map((it) => textHeight(it.value, { width: cw - 20, fontSize: valS, fontFamily: bf, fontStyle: '700', lineHeight: 1.1 }))) : 0;
    const chipH = infoItems.length ? 10 + rem(0.46) * 1.2 + 3 + vH + 10 : 0;

    const spk = speakerRow({ data, x: MX + PADX, w: CW - (qr.w ? qr.w + 14 : 0), palette, titleFont: tf, bodyFont: bf, avatar: 46, ink: INK, soft: SOFT });
    const lowRowH = Math.max(spk ? spk.h : 0, qr.h);

    const build = (size) => [
        organizer && kickerBlock({ text: organizer, x: MX + PADX, w: CW, palette, font: bf, size: rem(0.58), color: palette.accent, align: 'left', dash: true, mb: 10, key: 'org' }),
        titleBlock({ text: title, x: MX + PADX, w: CW, font: tf, weight: tw, maxSize: size, minSize: 24, maxLines: 3, align: 'left', lineHeight: 0.98, letterSpacing: -1, upper: false, fill: INK, palette, mb: 8 }),
        subtitle && textBlock({ text: subtitle, x: MX + PADX, w: CW, font: bf, size: rem(0.95), weight: '600', align: 'left', fill: palette.accent, mb: 10, key: 'sub', maxLines: 2 }),
        description && textBlock({ text: description, x: MX + PADX, w: CW, font: bf, size: rem(0.7), lineHeight: 1.5, fill: SOFT, mb: 10, key: 'desc', maxLines: 3 }),
        (() => { const r = extraLines({ items: extraItems, x: MX + PADX, w: CW, bodyFont: bf, ink: SOFT, size: rem(0.58), max: 2 }); return r && { h: r.h, mb: 10, key: 'extra', render: r.render }; })(),
        infoItems.length > 0 && { h: chipH, mb: lowRowH ? 12 : 0, key: 'info', render: (y) => (
            <Group listening={false}>
                {infoItems.map((it, i) => (
                    <Group key={i} x={MX + PADX + i * (cw + gap)} y={y}>
                        <Rect width={cw} height={chipH} cornerRadius={14} fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.32)" strokeWidth={1} />
                        <Txt text={String(it.label).toUpperCase()} x={10} y={10} width={cw - 20} fontSize={rem(0.46)} fontFamily={bf} fontStyle="700" letterSpacing={2} fill={palette.accent} />
                        <Txt text={it.value} x={10} y={10 + rem(0.46) * 1.2 + 3} width={cw - 20} fontSize={valS} fontFamily={bf} fontStyle="700" lineHeight={1.1} fill={INK} />
                    </Group>
                ))}
            </Group>
        ) },
        lowRowH > 0 && { h: lowRowH, mb: 0, key: 'speaker', render: (y) => (spk ? spk.render(y + (lowRowH - spk.h) / 2) : <Group />) },
    ].filter(Boolean);
    const total = (bs) => bs.reduce((nn, b) => nn + b.h + (b.mb || 0), 0) - (bs.length ? bs[bs.length - 1].mb || 0 : 0);

    const PADY = 24;
    const minTop = 128;
    const room = bottom - minTop - PADY * 2 - footH - 12;
    const size = [66, 56, 48, 42, 36, 30, 26].find((s) => total(build(s)) <= room) ?? 26;
    const blocks = build(size);
    const contentH = total(blocks);
    const cardH = contentH + PADY * 2 + footH + 12;
    const cardTop = bottom - cardH;
    const body = stack(blocks, cardTop + PADY);

    return (
        <Group listening={false}>
            {/* light orbs behind the glass */}
            <Glow x={18} y={(cardTop / H) * 100 + 4} rw={52} rh={22} color={palette.primary} stop={0.7} opacity={0.85} />
            <Glow x={88} y={(cardTop / H) * 100 + 30} rw={48} rh={22} color={palette.secondary} stop={0.7} opacity={0.75} />
            <Rect width={W} height={H} {...linear(0, 0, 0, H, [[0, 'rgba(3,6,14,0.45)'], [0.3, 'rgba(3,6,14,0.05)'], [1, 'rgba(3,6,14,0.35)']])} />

            {/* top row */}
            <LogoBar x={MX + 4} y={26} h={26} collegeLogo={collegeLogo} eventLogo={eventBrandLogo} align="left" width={CW / 2} />
            {infoItems[0] && (
                <Group x={W - MX - 4 - 190} y={28}>
                    <Rect width={190} height={24} cornerRadius={12} fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
                    <Txt text={String(infoItems[0].value).toUpperCase()} y={7} width={190} align="center" wrap="none" ellipsis fontSize={rem(0.5)} fontFamily={bf} fontStyle="700" letterSpacing={2} fill={INK} />
                </Group>
            )}

            {/* the card */}
            <Rect x={MX} y={cardTop} width={CARD_W} height={cardH} cornerRadius={28} fill="rgba(8,12,26,0.5)" shadowColor="#000000" shadowBlur={40} shadowOpacity={0.45} shadowOffsetY={14} />
            <Rect x={MX} y={cardTop} width={CARD_W} height={cardH} cornerRadius={28} {...linear(MX, cardTop, MX + CARD_W * 0.6, cardTop + cardH, [[0, 'rgba(255,255,255,0.26)'], [0.5, 'rgba(255,255,255,0.06)'], [1, 'rgba(255,255,255,0.12)']])} stroke="rgba(255,255,255,0.5)" strokeWidth={1.2} />
            <Rect x={MX + 28} y={cardTop + 1} width={CARD_W - 56} height={1.5} fill="rgba(255,255,255,0.75)" opacity={0.7} />

            {body.nodes}
            {qr.node && <Group x={W - MX - PADX - qr.w} y={cardTop + PADY + contentH - lowRowH + (lowRowH - qr.h) / 2}>{qr.node}</Group>}
            {foot.node}
        </Group>
    );
};

export default GlassCard;
