import React from 'react';
import { Group, Rect, Star } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H, rem } from '../engine/constants';
import { inkOn } from '../engine/color';
import { Txt, textHeight, LogoBar } from '../layers/ui';
import { stackCentered } from './stack';
import { titleBlock, footerNode } from './parts';
import { pickTitleFont, pickBodyFont, qrStrip, speakerRow, extraLines, oneLine } from './kit';
import { Editable } from '../engine/edit';

export const FONTS = ['Archivo Black', 'Space Grotesk'];

const PAD = 28;
const CW = W - PAD * 2;
const INK = '#0b0b0b';
const PAPER = '#fff8e6';
const SH = 6; // hard shadow offset

/** A block with a thick outline and a hard offset shadow (the neo-brutalist signature). */
const Slab = ({ w, h, fill, sh = SH, children, ...rest }) => (
    <Group {...rest}>
        <Rect x={sh} y={sh} width={w} height={h} fill={INK} />
        <Rect width={w} height={h} fill={fill} stroke={INK} strokeWidth={3} />
        {children}
    </Group>
);

/** Loud, flat, outlined: sticker-sheet energy with a starburst date and a marquee strip. */
const NeoBrutal = ({ data, palette }) => {
    const tf = pickTitleFont(palette, 'Archivo Black');
    const bf = pickBodyFont(palette, 'Space Grotesk');
    const tw = palette.userTitleFont ? '800' : '400';
    const { title, subtitle, organizer, description, infoItems = [], extraItems = [], collegeLogo, eventBrandLogo, qr1, qr2, footer } = data;
    const c1 = palette.accent;
    const c2 = palette.primary;
    const c3 = palette.secondary;

    // marquee strip
    const bandText = `★ ${(organizer || title || 'EVENT').toUpperCase()} `;
    const marquee = bandText.repeat(8);

    // bottom: info chips + QR + footer band
    const foot = footerNode({ text: footer, x: PAD, w: CW, bottom: H - 8, palette: { ...palette, divider: PAPER, muted: PAPER }, font: bf, size: rem(0.44), align: 'center', line: false });
    const bandH = 28;
    const qr = qrStrip({ qr1, qr2, x: 0, y: 0, size: 46, gap: 10, palette, labelSize: 6 });
    const chipsW = CW - (qr.w ? qr.w + 20 : 0);
    const n = infoItems.length || 1;
    const gap = 12;
    const cw = (chipsW - SH - gap * (n - 1)) / n;
    const valS = rem(0.82);
    const vH = infoItems.length ? Math.max(...infoItems.map((it) => textHeight(it.value, { width: cw - 20, fontSize: valS, fontFamily: bf, fontStyle: '700', lineHeight: 1.1 }))) : 0;
    const chipH = infoItems.length ? 12 + rem(0.5) * 1.2 + 3 + vH + 12 : 0;
    const regionH = Math.max(chipH + SH, qr.h);
    const regionTop = H - bandH - 18 - regionH;
    const chipFills = [c3, PAPER, c1];

    // title slab
    const slabW = CW - SH - 4;
    const t = titleBlock({ text: title, x: 18, w: slabW - 36, font: tf, weight: tw, maxSize: 70, minSize: 26, maxLines: 3, align: 'left', lineHeight: 0.98, letterSpacing: -1, fill: INK, palette: { ...palette, type: palette.type }, shadow: false, mb: 0 });
    const slabH = (t ? t.h : 0) + 34;
    const sticker = subtitle && oneLine(subtitle.toUpperCase(), { w: CW - 80, maxSize: rem(0.8), fontFamily: bf, fontStyle: '700', letterSpacing: 1 });
    const dateStr = infoItems[0]?.value;

    const blocks = [
        t && { h: slabH + SH, mb: sticker ? -12 : 20, key: 'title', render: (y) => (
            <Group x={PAD} y={y} rotation={-1.4}>
                <Slab w={slabW} h={slabH} fill={c1}>
                    {t.render(17)}
                </Slab>
                {dateStr && (
                    <Group x={slabW - 14} y={-8} rotation={12}>
                        <Star x={SH / 2} y={SH / 2} numPoints={14} innerRadius={50} outerRadius={64} fill={INK} />
                        <Star numPoints={14} innerRadius={50} outerRadius={64} fill={c3} stroke={INK} strokeWidth={3} />
                        <Txt text={String(dateStr).toUpperCase()} x={-44} y={-26} width={88} height={52} align="center" verticalAlign="middle" fontSize={dateStr.length > 14 ? 12 : 15} fontFamily={bf} fontStyle="700" lineHeight={1.05} fill={inkOn(c3, INK)} />
                    </Group>
                )}
            </Group>
        ) },
        sticker && { h: 34 + SH, mb: 24, key: 'sub', render: (y) => (
            <Group x={PAD + 22} y={y} rotation={1.6}>
                <Slab w={sticker.width + 36} h={34} sh={4} fill={c2}>
                    <Txt text={subtitle.toUpperCase()} x={18} y={9} width={sticker.width + 4} wrap="none" fontSize={sticker.size} fontFamily={bf} fontStyle="700" letterSpacing={1} fill={inkOn(c2, INK)} />
                </Slab>
            </Group>
        ) },
        description && (() => {
            const dw = CW - 40;
            const dh = textHeight(description, { width: dw - 28, fontSize: rem(0.74), fontFamily: bf, lineHeight: 1.4 });
            const h = Math.min(dh, rem(0.74) * 1.4 * 4) + 26;
            return { h: h + SH, mb: 18, key: 'desc', render: (y) => (
                <Group x={PAD + 6} y={y} rotation={-0.6}>
                    <Slab w={dw} h={h} fill={PAPER} sh={5}>
                        <Txt text={description} x={14} y={13} width={dw - 28} height={h - 26} ellipsis fontSize={rem(0.74)} fontFamily={bf} fontStyle="500" lineHeight={1.4} fill={INK} />
                    </Slab>
                </Group>
            ) };
        })(),
        (() => { const r = speakerRow({ data, x: PAD + 6, w: CW - 40, palette, titleFont: bf, bodyFont: bf, avatar: 50, ink: '#ffffff', soft: 'rgba(255,255,255,0.85)' }); return r && { h: r.h, mb: 12, key: 'speaker', render: r.render }; })(),
        (() => { const r = extraLines({ items: extraItems, x: PAD + 6, w: CW - 20, bodyFont: bf, ink: '#ffffff', size: rem(0.62), max: 2 }); return r && { h: r.h, mb: 0, key: 'extra', render: r.render }; })(),
    ].filter(Boolean);

    const body = stackCentered(blocks, bandH + 52, regionTop - 14);

    return (
        <Group listening={false}>
            <Rect width={W} height={H} fill="rgba(0,0,0,0.30)" />

            {/* marquee strip + logos */}
            <Group>
                <Rect width={W} height={bandH} fill={INK} />
                <Group clip={{ x: 0, y: 0, width: W, height: bandH }}>
                    <Txt text={marquee} x={-14} y={7} wrap="none" fontSize={rem(0.72)} fontFamily={bf} fontStyle="700" letterSpacing={3} fill={c1} />
                </Group>
            </Group>
            <LogoBar x={PAD} y={bandH + 10} h={24} collegeLogo={collegeLogo} eventLogo={eventBrandLogo} align="left" width={CW} />

            {body.nodes}

            {/* info chips */}
            {infoItems.length > 0 && (
                <Editable id="info">
                    <Group x={PAD} y={regionTop + (regionH - chipH - SH) }>
                        {infoItems.map((it, i) => {
                            const fill = chipFills[i % chipFills.length];
                            const ink = inkOn(fill, INK);
                            return (
                                <Slab key={i} x={i * (cw + gap)} y={0} w={cw} h={chipH} fill={fill} rotation={[-1, 0.8, -0.5][i % 3]} sh={4}>
                                    <Txt text={String(it.label).toUpperCase()} x={10} y={11} width={cw - 20} fontSize={rem(0.5)} fontFamily={bf} fontStyle="700" letterSpacing={2} fill={ink} opacity={0.75} />
                                    <Txt text={it.value} x={10} y={11 + rem(0.5) * 1.2 + 3} width={cw - 20} fontSize={valS} fontFamily={bf} fontStyle="700" lineHeight={1.1} fill={ink} />
                                </Slab>
                            );
                        })}
                    </Group>
                </Editable>
            )}
            {qr.node && <Group x={W - PAD - qr.w} y={regionTop + regionH - qr.h}>{qr.node}</Group>}

            <Rect y={H - bandH} width={W} height={bandH} fill={INK} />
            {foot.node}
        </Group>
    );
};

export default NeoBrutal;
