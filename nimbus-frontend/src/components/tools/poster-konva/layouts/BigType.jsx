import React from 'react';
import { Group, Rect } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H, rem } from '../engine/constants';
import { linear } from '../engine/color';
import { measureWidth } from '../engine/text';
import { Txt, textHeight, LogoBar } from '../layers/ui';
import { footerNode } from './parts';
import { pickTitleFont, pickBodyFont, qrStrip, infoLines, extraLines } from './kit';
import { Editable } from '../engine/edit';

export const FONTS = ['Anton', 'Space Grotesk'];

const PAD = 30;
const CW = W - PAD * 2;
const INK = '#ffffff';
const SOFT = 'rgba(255,255,255,0.78)';

/** Break the title into at most `max` lines, merging the shortest neighbours first. */
const toLines = (title, max = 4) => {
    const lines = String(title || '').toUpperCase().split(/\s+/).filter(Boolean);
    while (lines.length > max) {
        let best = 0;
        let len = Infinity;
        for (let i = 0; i < lines.length - 1; i += 1) {
            const l = lines[i].length + lines[i + 1].length;
            if (l < len) { len = l; best = i; }
        }
        lines.splice(best, 2, `${lines[best]} ${lines[best + 1]}`);
    }
    return lines;
};

/** Oversized stacked headline, alternating solid / outline / accent, every line stretched to the full width. */
const BigType = ({ data, palette }) => {
    const tf = pickTitleFont(palette, 'Anton');
    const bf = pickBodyFont(palette, 'Space Grotesk');
    const tw = palette.userTitleFont ? '800' : '400';
    const { title, subtitle, organizer, description, infoItems = [], extraItems = [], collegeLogo, eventBrandLogo, qr1, qr2, footer } = data;

    // ── top row ────────────────────────────────────────────────────────────────
    const qr = qrStrip({ qr1, qr2, x: 0, y: 0, size: 42, gap: 8, palette, labelSize: 6 });
    const topEnd = Math.max(96, qr.h ? 28 + qr.h + 14 : 0);

    // ── bottom block (anchored above the footer) ───────────────────────────────
    const foot = footerNode({ text: footer, x: PAD, w: CW, bottom: H - 16, palette, font: bf, size: rem(0.45), align: 'left', line: false });
    const colA = CW * 0.52;
    const colBx = PAD + colA + 22;
    const colB = CW - colA - 22;
    const subH = subtitle ? textHeight(subtitle.toUpperCase(), { width: colA, fontSize: rem(0.8), fontFamily: bf, fontStyle: '700', letterSpacing: 1.5 }) : 0;
    const descH = description ? Math.min(textHeight(description, { width: colA, fontSize: rem(0.68), fontFamily: bf, lineHeight: 1.5 }), rem(0.68) * 1.5 * 4) : 0;
    const info = infoLines({ items: infoItems, x: colBx, w: colB, palette, bodyFont: bf, titleFont: bf, ink: INK, soft: SOFT, accent: palette.accent, valueSize: rem(0.82), labelSize: rem(0.46), gap: 7 });
    const extra = extraLines({ items: extraItems, x: PAD, w: CW, bodyFont: bf, ink: SOFT, size: rem(0.58), max: 2 });
    const aH = (subH ? subH + 8 : 0) + descH;
    const blockH = Math.max(aH, info ? info.h : 0) + (extra ? extra.h + 10 : 0) + 14;
    const blockTop = foot.top - 12 - blockH;

    // ── headline sized to the room between ─────────────────────────────────────
    const avail = blockTop - 16 - (topEnd + 6);
    const lines = toLines(title);
    const LH = 0.9;
    let sizes = lines.map((l) => Math.min(230, (100 * CW) / Math.max(1, measureWidth(l, { fontSize: 100, fontFamily: tf, fontStyle: tw }))));
    const sum = sizes.reduce((n, s) => n + s * LH, 0);
    if (sum > avail) sizes = sizes.map((s) => (s * avail) / sum);
    const used = sizes.reduce((n, s) => n + s * LH, 0);
    const startY = topEnd + 6 + Math.max(0, (avail - used) / 2);
    let cy = startY;
    const kinds = ['solid', 'outline', 'accent', 'outline'];

    return (
        <Group listening={false}>
            <Rect width={W} height={H} {...linear(0, 0, 0, H, [[0, 'rgba(3,6,14,0.55)'], [0.4, 'rgba(3,6,14,0.35)'], [0.75, 'rgba(3,6,14,0.62)'], [1, 'rgba(3,6,14,0.88)']])} />

            <LogoBar x={PAD} y={26} h={26} collegeLogo={collegeLogo} eventLogo={eventBrandLogo} align="left" width={CW / 2} />
            {organizer && (
                <Editable id="org">
                    <Txt text={`— ${organizer.toUpperCase()}`} x={PAD} y={62} width={CW * 0.6} wrap="none" ellipsis fontSize={rem(0.58)} fontFamily={bf} fontStyle="700" letterSpacing={3} fill={palette.accent} />
                </Editable>
            )}
            {qr.node && <Group x={W - PAD - qr.w} y={24}>{qr.node}</Group>}

            {/* headline */}
            <Editable id="title">
                <Group>
                    {lines.map((l, i) => {
                        const size = sizes[i];
                        const y = cy;
                        cy += size * LH;
                        const kind = kinds[i % kinds.length];
                        return (
                            <Txt key={i} text={l} x={PAD} y={y} width={CW + 4} wrap="none" fontSize={size} fontFamily={tf} fontStyle={tw} lineHeight={LH}
                                fill={kind === 'outline' ? 'rgba(0,0,0,0)' : kind === 'accent' ? palette.accent : INK}
                                stroke={kind === 'outline' ? INK : undefined} strokeWidth={kind === 'outline' ? Math.max(1.4, size / 70) : 0}
                                shadowColor="rgba(0,0,0,0.45)" shadowBlur={kind === 'outline' ? 0 : 18} shadowOpacity={0.6} />
                        );
                    })}
                </Group>
            </Editable>

            {/* bottom block */}
            <Rect x={PAD} y={blockTop} width={CW} height={2} fill={INK} />
            {(subtitle || description) && (
                <Editable id="sub">
                    <Group x={PAD} y={blockTop + 14}>
                        {subtitle && <Txt text={subtitle.toUpperCase()} width={colA} fontSize={rem(0.8)} fontFamily={bf} fontStyle="700" letterSpacing={1.5} fill={palette.accent} />}
                        {description && <Txt text={description} y={subH ? subH + 8 : 0} width={colA} height={descH} ellipsis fontSize={rem(0.68)} fontFamily={bf} lineHeight={1.5} fill={SOFT} />}
                    </Group>
                </Editable>
            )}
            {info && <Editable id="info"><Group listening={false}>{info.render(blockTop + 14)}</Group></Editable>}
            {extra && <Editable id="extra"><Group listening={false}>{extra.render(blockTop + 14 + Math.max(aH, info ? info.h : 0) + 10)}</Group></Editable>}
            {foot.node}
        </Group>
    );
};

export default BigType;
