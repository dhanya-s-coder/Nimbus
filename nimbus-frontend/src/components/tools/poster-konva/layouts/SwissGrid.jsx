import React from 'react';
import { Group, Rect, Line } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H, rem } from '../engine/constants';
import { darken } from '../engine/color';
import { textHeight, Txt, LogoBar } from '../layers/ui';
import { Grain } from '../layers/primitives';
import { titleBlock, textBlock, footerNode } from './parts';
import { pickTitleFont, pickBodyFont, qrStrip, speakerRow, extraLines, oneLine, HoleShape } from './kit';
import { Editable } from '../engine/edit';

export const FONTS = ['Bricolage Grotesque'];

const PAPER = '#f3f0e8';
const INK = '#12141a';
const SOFT = 'rgba(18,20,26,0.62)';
const PAD = 32;
const CW = W - PAD * 2;

/** Swiss / International style: paper, one hard accent block, a banner photo window, a tidy numbered grid. */
const SwissGrid = ({ data, palette }) => {
    const tf = pickTitleFont(palette, 'Bricolage Grotesque');
    const bf = pickBodyFont(palette, 'Inter');
    const accent = darken(palette.primary, 0.1);
    const { title, subtitle, organizer, description, infoItems = [], extraItems = [], collegeLogo, eventBrandLogo, qr1, qr2, footer } = data;

    // header row
    const headY = 26;
    const winY = 64;
    const winH = Math.max(150, Math.min(Math.round(H * (H >= 900 ? 0.38 : 0.32)), H >= 900 ? 470 : 340));

    // bottom: footer, QR
    const foot = footerNode({ text: footer, x: PAD, w: CW * 0.7, bottom: H - 18, palette: { ...palette, divider: SOFT, muted: SOFT }, font: bf, size: rem(0.44), align: 'left', line: false });
    const qr = qrStrip({ qr1, qr2, x: 0, y: 0, size: 46, palette: { ...palette, muted: SOFT, text: INK }, labelSize: 6 });

    // numbered details (right column)
    const colGap = 22;
    const leftW = Math.round(CW * 0.5);
    const rightX = PAD + leftW + colGap;
    const rightW = CW - leftW - colGap;
    const rows = infoItems.map((it, i) => ({ it, i, vh: textHeight(it.value, { width: rightW - 30, fontSize: rem(0.82), fontFamily: bf, fontStyle: '700', lineHeight: 1.15 }) }));
    const rowsH = rows.reduce((n, r) => n + rem(0.46) * 1.2 + 3 + r.vh + 14, 0);
    const spk = speakerRow({ data, x: PAD, w: leftW, palette, titleFont: tf, bodyFont: bf, avatar: 50, ink: INK, soft: SOFT });
    const extra = extraLines({ items: extraItems, x: PAD, w: leftW, bodyFont: bf, ink: SOFT, size: rem(0.58), max: 2 });

    const bottomLimit = foot.top - 14;

    // headline between the window and the details
    const titleTop = winY + winH + 26;
    const avail = Math.max(60, bottomLimit - (titleTop + 34) - Math.max(rowsH, 90));
    const fit = (s) => titleBlock({ text: title, x: PAD, w: CW - 40, font: tf, weight: '800', maxSize: s, minSize: 22, maxLines: 3, align: 'left', lineHeight: 0.92, letterSpacing: -2, upper: false, fill: INK, shadow: false, palette, mb: 0 });
    const size = [78, 68, 60, 52, 46, 40, 34, 28, 24].find((s) => (fit(s)?.h ?? 0) <= avail) ?? 24;
    const t = fit(size);
    const titleH = t ? t.h : 0;
    const subY = titleTop + titleH + 10;
    const subB = subtitle && textBlock({ text: subtitle, x: PAD, w: CW, font: bf, size: rem(0.9), weight: '600', align: 'left', fill: accent, mb: 0, key: 'sub', maxLines: 2 });
    const gridTop = subY + (subB ? subB.h : 0) + 18;
    const descB = description && textBlock({ text: description, x: PAD, w: leftW, font: bf, size: rem(0.68), lineHeight: 1.55, fill: SOFT, mb: 0, key: 'desc', maxLines: 5 });

    return (
        <Group listening={false}>
            {/* paper with a window onto the artwork */}
            <HoleShape fill={PAPER} paths={[(ctx) => ctx.rect(0, 0, W, H), (ctx) => { ctx.moveTo(PAD, winY); ctx.lineTo(W - PAD, winY); ctx.lineTo(W - PAD, winY + winH); ctx.lineTo(PAD, winY + winH); ctx.closePath(); }]} />
            <Grain opacity={0.04} />

            {/* header */}
            <LogoBar x={PAD} y={headY - 4} h={22} collegeLogo={collegeLogo} eventLogo={eventBrandLogo} align="left" width={CW / 2} tint={INK} />
            {organizer && (
                <Editable id="org">
                    <Txt text={organizer.toUpperCase()} x={W - PAD - CW / 2} y={headY + 1} width={CW / 2} align="right" wrap="none" ellipsis fontSize={rem(0.52)} fontFamily={bf} fontStyle="700" letterSpacing={2.5} fill={INK} />
                </Editable>
            )}

            {/* the one hard accent block, overlapping the window corner */}
            {(() => {
                const label = infoItems[0] ? String(infoItems[0].value).toUpperCase() : '';
                const m = label ? oneLine(label, { w: CW * 0.55, maxSize: rem(0.56), fontFamily: bf, fontStyle: '700', letterSpacing: 1.2 }) : null;
                const bw = m ? Math.max(70, m.width + 28) : 70;
                return (
                    <>
                        <Rect x={PAD} y={winY + winH - 22} width={bw} height={44} fill={accent} />
                        {m && <Txt text={label} x={PAD + 14} y={winY + winH - 22 + 22 - m.h / 2} width={m.width + 4} wrap="none" fontSize={m.size} fontFamily={bf} fontStyle="700" letterSpacing={1.2} fill="#ffffff" />}
                    </>
                );
            })()}

            {/* headline */}
            {t && <Editable id="title"><Group listening={false}>{t.render(titleTop)}</Group></Editable>}
            {subB && <Editable id="sub"><Group listening={false}>{subB.render(subY)}</Group></Editable>}

            {/* grid */}
            <Rect x={PAD} y={gridTop - 10} width={CW} height={1.5} fill={INK} />
            {descB && <Editable id="desc"><Group listening={false}>{descB.render(gridTop)}</Group></Editable>}
            {spk && <Editable id="spk"><Group listening={false}>{spk.render(gridTop + (descB ? descB.h + 14 : 0))}</Group></Editable>}
            {extra && <Editable id="extra"><Group listening={false}>{extra.render(gridTop + (descB ? descB.h + 14 : 0) + (spk ? spk.h + 12 : 0))}</Group></Editable>}
            {rows.length > 0 && (
                <Editable id="info">
                    <Group x={rightX} y={gridTop} listening={false}>
                        {(() => {
                            let y = 0;
                            return rows.map(({ it, i, vh }) => {
                                const ry = y;
                                y += rem(0.46) * 1.2 + 3 + vh + 14;
                                return (
                                    <Group key={i} y={ry}>
                                        <Txt text={String(i + 1).padStart(2, '0')} width={24} fontSize={rem(0.6)} fontFamily={tf} fontStyle="800" fill={accent} />
                                        <Txt text={String(it.label).toUpperCase()} x={30} width={rightW - 30} fontSize={rem(0.46)} fontFamily={bf} fontStyle="700" letterSpacing={2} fill={SOFT} />
                                        <Txt text={it.value} x={30} y={rem(0.46) * 1.2 + 3} width={rightW - 30} fontSize={rem(0.82)} fontFamily={bf} fontStyle="700" lineHeight={1.15} fill={INK} />
                                        <Line points={[0, vh + rem(0.46) * 1.2 + 9, rightW, vh + rem(0.46) * 1.2 + 9]} stroke={INK} strokeWidth={0.6} opacity={0.35} />
                                    </Group>
                                );
                            });
                        })()}
                    </Group>
                </Editable>
            )}

            {qr.node && <Group x={W - PAD - qr.w} y={H - 18 - qr.h}>{qr.node}</Group>}
            {foot.node}
            <Rect x={0} y={H - 5} width={W} height={5} fill={accent} />
        </Group>
    );
};

export default SwissGrid;
