import React from 'react';
import { Group, Rect, Line } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H, rem } from '../engine/constants';
import { linear } from '../engine/color';
import { Txt, textHeight, LogoBar } from '../layers/ui';
import { stack } from './stack';
import { titleBlock, textBlock, footerNode } from './parts';
import { pickTitleFont, pickBodyFont, qrStrip, speakerRow, extraLines, oneLine } from './kit';
import { Editable } from '../engine/edit';

export const FONTS = ['Abril Fatface', 'Barlow Condensed'];

const PAD = 32;
const CW = W - PAD * 2;
const INK = '#ffffff';
const SOFT = 'rgba(255,255,255,0.8)';

/** Glossy magazine cover: masthead with rules, cover lines stacked at the bottom, issue-style info bar. */
const MagazineCover = ({ data, palette }) => {
    const mast = palette.userTitleFont || 'Abril Fatface';
    const tf = pickTitleFont(palette, 'Barlow Condensed');
    const bf = pickBodyFont(palette, 'Inter');
    const { title, subtitle, organizer, description, infoItems = [], extraItems = [], collegeLogo, eventBrandLogo, qr1, qr2, footer } = data;

    // ── masthead (organiser as the magazine name) ─────────────────────────────
    const mastText = (organizer || 'The Event').toUpperCase();
    const m = oneLine(mastText, { w: CW, maxSize: 62, minSize: 22, fontFamily: mast, fontStyle: '400', letterSpacing: 1 });
    const mastY = 40;
    const ruleY = mastY + m.h + 12;
    const strip = [infoItems[0], infoItems.length > 1 ? infoItems[infoItems.length - 1] : null].filter(Boolean);

    // ── bottom: info bar + QR ─────────────────────────────────────────────────
    const foot = footerNode({ text: footer, x: PAD, w: CW, bottom: H - 16, palette, font: bf, size: rem(0.45), align: 'left', line: false });
    const qr = qrStrip({ qr1, qr2, x: 0, y: 0, size: 50, palette, labelSize: 6.5 });
    const barW = CW - (qr.w ? qr.w + 16 : 0);
    const cols = infoItems.length || 1;
    const colW = barW / cols;
    const labelS = rem(0.46);
    const valS = rem(0.78);
    const vH = infoItems.length ? Math.max(...infoItems.map((it) => textHeight(it.value, { width: colW - 16, fontSize: valS, fontFamily: bf, fontStyle: '700' }))) : 0;
    const infoH = infoItems.length ? 10 + labelS * 1.2 + 3 + vH + 8 : 0;
    const regionH = Math.max(infoH, qr.h);
    const barTop = foot.top - 10 - infoH;
    const regionTop = foot.top - 10 - regionH;

    // ── cover lines (stacked from the bottom up) ──────────────────────────────
    const topLimit = ruleY + (collegeLogo || eventBrandLogo ? 78 : 56);
    const stackBottom = regionTop - 16;
    const build = (size) => [
        subtitle && { h: 22, mb: 12, key: 'sub', render: (y) => {
            const t = subtitle.toUpperCase();
            const w = Math.min(CW, oneLine(t, { w: CW - 20, maxSize: rem(0.62), fontFamily: bf, fontStyle: '800', letterSpacing: 2 }).width + 26);
            return (
                <Group listening={false}>
                    <Rect x={PAD} y={y} width={w} height={22} fill={palette.primary} />
                    <Txt text={t} x={PAD + 13} y={y + 6} width={w - 20} wrap="none" fontSize={rem(0.62)} fontFamily={bf} fontStyle="800" letterSpacing={2} fill="#ffffff" />
                </Group>
            );
        } },
        titleBlock({ text: title, x: PAD, w: CW, font: tf, weight: '800', maxSize: size, minSize: 26, maxLines: 4, align: 'left', lineHeight: 0.9, letterSpacing: -0.5, fill: INK, palette, mb: 12 }),
        description && textBlock({ text: description, x: PAD, w: CW * 0.84, font: bf, size: rem(0.74), lineHeight: 1.45, fill: SOFT, mb: 10, key: 'desc', maxLines: 3 }),
        (() => { const r = speakerRow({ data, x: PAD, w: CW * 0.8, palette, titleFont: bf, bodyFont: bf, avatar: 50, ink: INK, soft: SOFT }); return r && { h: r.h, mb: 10, key: 'speaker', render: r.render }; })(),
        (() => { const r = extraLines({ items: extraItems, x: PAD, w: CW, bodyFont: bf, ink: INK, accent: palette.accent, size: rem(0.6), max: 2 }); return r && { h: r.h, mb: 0, key: 'extra', render: r.render }; })(),
    ].filter(Boolean);
    const total = (bs) => bs.reduce((n, b) => n + b.h + (b.mb || 0), 0) - (bs.length ? bs[bs.length - 1].mb || 0 : 0);
    const size = [96, 82, 70, 60, 50, 42, 34].find((s) => total(build(s)) <= stackBottom - topLimit) ?? 34;
    const blocks = build(size);
    const body = stack(blocks, stackBottom - total(blocks));

    return (
        <Group listening={false}>
            {/* readability: dark top + deep bottom fade */}
            <Rect width={W} height={H} {...linear(0, 0, 0, H, [[0, 'rgba(4,8,18,0.62)'], [0.22, 'rgba(4,8,18,0.12)'], [0.42, 'rgba(4,8,18,0.28)'], [1, 'rgba(4,8,18,0.92)']])} />

            {/* masthead */}
            <Rect x={PAD} y={22} width={CW} height={3} fill={INK} />
            <Editable id="org">
                <Txt text={mastText} x={PAD} y={mastY} width={CW} wrap="none" align="center" fontSize={m.size} fontFamily={mast} fontStyle="400" letterSpacing={1} fill={INK}
                    shadowColor="rgba(0,0,0,0.5)" shadowBlur={14} shadowOpacity={0.6} />
            </Editable>
            <Rect x={PAD} y={ruleY} width={CW} height={1} fill={INK} opacity={0.85} />
            {strip.length > 0 && (
                <Group>
                    <Txt text={String(strip[0].value).toUpperCase()} x={PAD} y={ruleY + 8} width={CW / 2} wrap="none" ellipsis fontSize={rem(0.5)} fontFamily={bf} fontStyle="700" letterSpacing={2.5} fill={INK} />
                    {strip[1] && <Txt text={String(strip[1].value).toUpperCase()} x={PAD + CW / 2} y={ruleY + 8} width={CW / 2} align="right" wrap="none" ellipsis fontSize={rem(0.5)} fontFamily={bf} fontStyle="700" letterSpacing={2.5} fill={INK} />}
                </Group>
            )}
            <Rect x={PAD} y={ruleY + 8 + rem(0.5) * 1.2 + 7} width={CW} height={1} fill={INK} opacity={0.35} />
            <LogoBar x={PAD} y={ruleY + 40} h={26} collegeLogo={collegeLogo} eventLogo={eventBrandLogo} align="left" width={CW} />

            {body.nodes}

            {/* issue-style info bar */}
            {infoItems.length > 0 && (
                <Editable id="info">
                    <Group x={PAD} y={barTop}>
                        <Rect width={barW} height={1} fill={INK} opacity={0.9} />
                        {infoItems.map((it, i) => (
                            <Group key={i} x={i * colW}>
                                {i > 0 && <Line points={[0, 10, 0, infoH - 8]} stroke={INK} strokeWidth={1} opacity={0.35} />}
                                <Txt text={String(it.label).toUpperCase()} x={i ? 12 : 0} y={10} width={colW - 14} fontSize={labelS} fontFamily={bf} fontStyle="800" letterSpacing={2} fill={palette.accent} />
                                <Txt text={it.value} x={i ? 12 : 0} y={10 + labelS * 1.2 + 3} width={colW - (i ? 18 : 14)} fontSize={valS} fontFamily={bf} fontStyle="700" fill={INK} />
                            </Group>
                        ))}
                    </Group>
                </Editable>
            )}
            {qr.node && <Group x={W - PAD - qr.w} y={foot.top - 10 - qr.h}>{qrStrip({ qr1, qr2, x: 0, y: 0, size: 50, palette, labelSize: 6.5 }).node}</Group>}
            {foot.node}
        </Group>
    );
};

export default MagazineCover;
