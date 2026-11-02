import React from 'react';
import { Group, Rect, Line } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H, rem } from '../engine/constants';
import { darken, linear } from '../engine/color';
import { Txt, textHeight, LogoBar, SpeakerAvatar } from '../layers/ui';
import { titleBlock, textBlock, footerNode } from './parts';
import { pickTitleFont, pickBodyFont, qrStrip, extraLines, oneLine } from './kit';
import { Editable } from '../engine/edit';

export const FONTS = ['Syne', 'Space Grotesk'];

const PAD = 30;
const CW = W - PAD * 2;
const INK = '#ffffff';
const SOFT = 'rgba(255,255,255,0.82)';

/** The artwork on top, a deep colour wedge below; the headline is tilted along the cut. */
const DiagonalSplit = ({ data, palette }) => {
    const tf = pickTitleFont(palette, 'Syne');
    const bf = pickBodyFont(palette, 'Space Grotesk');
    const tw = palette.userTitleFont ? '800' : '800';
    const { title, subtitle, organizer, description, speakerPhoto, speakerShape, speakerName, speakerDesignation, infoItems = [], extraItems = [], collegeLogo, eventBrandLogo, qr1, qr2, footer } = data;

    const base = darken(palette.primary, 0.5);
    const deep = darken(palette.primary, 0.72);

    // the cut: higher on the right
    const y0 = H * 0.47;
    const y1 = H * 0.35;
    const yAt = (x) => y0 + ((y1 - y0) * x) / W;
    const ang = (Math.atan2(y1 - y0, W) * 180) / Math.PI; // negative = rising to the right
    const wedge = [0, y0, W, y1, W, H, 0, H];

    // ── bottom stack (unrotated) ───────────────────────────────────────────────
    const foot = footerNode({ text: footer, x: PAD, w: CW, bottom: H - 16, palette, font: bf, size: rem(0.45), align: 'left', line: false });
    const n = infoItems.length || 1;
    const colW = CW / n;
    const valS = rem(0.82);
    const vH = infoItems.length ? Math.max(...infoItems.map((it) => textHeight(it.value, { width: colW - 14, fontSize: valS, fontFamily: bf, fontStyle: '700', lineHeight: 1.1 }))) : 0;
    const infoH = infoItems.length ? rem(0.46) * 1.2 + 4 + vH + 6 : 0;
    const qr = qrStrip({ qr1, qr2, x: 0, y: 0, size: 44, gap: 8, palette, labelSize: 6 });
    const infoTop = foot.top - 14 - infoH;
    const descW = CW - (qr.w ? qr.w + 18 : 0);
    const desc = description && textBlock({ text: description, x: PAD, w: descW, font: bf, size: rem(0.7), lineHeight: 1.5, fill: SOFT, mb: 0, key: 'desc', maxLines: 3 });
    const extra = extraLines({ items: extraItems, x: PAD, w: CW, bodyFont: bf, ink: SOFT, size: rem(0.58), max: 2 });
    const lowerH = (desc ? desc.h : 0) + (extra ? (desc ? 8 : 0) + extra.h : 0);
    const lowerTop = infoTop - 14 - Math.max(lowerH, qr.h ? qr.h : 0);

    // ── tilted headline block ─────────────────────────────────────────────────
    const originX = PAD;
    const baseY = yAt(PAD) + 26;
    const availH = lowerTop - 14 - baseY;
    const orgLine = organizer ? 22 : 0;
    const tryTitle = (size) => titleBlock({ text: title, x: 0, w: CW - 40, font: tf, weight: tw, maxSize: size, minSize: 24, maxLines: 3, align: 'left', lineHeight: 0.95, letterSpacing: -1, fill: INK, palette, mb: 0 });
    const subS = subtitle ? oneLine(subtitle, { w: CW - 40, maxSize: rem(0.9), fontFamily: bf, fontStyle: '600', letterSpacing: 0.5 }) : null;
    const subH = subS ? subS.h + 8 : 0;
    const sizes = [92, 80, 68, 58, 50, 42, 36, 30, 26];
    const size = sizes.find((s) => { const t = tryTitle(s); return t && t.h + orgLine + subH <= availH; }) ?? 26;
    const t = tryTitle(size);
    // spread the leftover room: keep the headline a little off the cut, not glued to it
    const originY = baseY + Math.max(0, (availH - ((t ? t.h : 0) + orgLine + subH)) * 0.45);

    return (
        <Group listening={false}>
            {/* photo shading */}
            <Rect width={W} height={H} {...linear(0, 0, 0, H, [[0, 'rgba(3,6,14,0.5)'], [0.3, 'rgba(3,6,14,0.08)'], [0.55, 'rgba(3,6,14,0.2)'], [1, 'rgba(3,6,14,0.5)']])} />

            {/* wedge + stripes */}
            <Line points={[0, y0 - 26, W, y1 - 26, W, y1 - 14, 0, y0 - 14]} closed fill={palette.accent} opacity={0.95} />
            <Line points={[0, y0 - 8, W, y1 - 8, W, y1 - 5, 0, y0 - 5]} closed fill={INK} opacity={0.7} />
            <Line points={wedge} closed {...linear(0, y1, W, H, [[0, base], [1, deep]])} opacity={0.97} />

            {/* top-left identity */}
            <LogoBar x={PAD} y={26} h={26} collegeLogo={collegeLogo} eventLogo={eventBrandLogo} align="left" width={CW / 2} />
            {qr.node && <Group x={W - PAD - qr.w} y={26}>{qr.node}</Group>}

            {/* speaker stands on the cut */}
            {speakerPhoto && (
                <SpeakerAvatar x={W - PAD - 96} y={yAt(W - PAD - 48) - 82} size={96} shape={speakerShape || 'Circle'} src={speakerPhoto} palette={palette} />
            )}
            {speakerName && (
                <Editable id="spk">
                    <Group x={PAD} y={yAt(PAD) - 70}>
                        <Rect width={Math.min(240, CW * 0.55)} height={speakerDesignation ? 40 : 28} cornerRadius={8} fill="rgba(4,8,18,0.62)" />
                        <Txt text={speakerName} x={12} y={speakerDesignation ? 6 : 7} width={Math.min(240, CW * 0.55) - 24} wrap="none" ellipsis fontSize={rem(0.78)} fontFamily={bf} fontStyle="700" fill="#ffffff" />
                        {speakerDesignation && <Txt text={speakerDesignation} x={12} y={23} width={Math.min(240, CW * 0.55) - 24} wrap="none" ellipsis fontSize={rem(0.5)} fontFamily={bf} fill="rgba(255,255,255,0.8)" />}
                    </Group>
                </Editable>
            )}

            {/* headline along the cut */}
            <Group x={originX} y={originY} rotation={ang}>
                {organizer && (
                    <Editable id="org">
                        <Txt text={organizer.toUpperCase()} width={CW - 40} wrap="none" ellipsis fontSize={rem(0.56)} fontFamily={bf} fontStyle="700" letterSpacing={3.5} fill={palette.accent} />
                    </Editable>
                )}
                {t && <Editable id="title"><Group y={orgLine}>{t.render(0)}</Group></Editable>}
                {subS && (
                    <Editable id="sub">
                        <Txt text={subtitle} y={orgLine + t.h + 8} width={CW - 40} wrap="none" fontSize={subS.size} fontFamily={bf} fontStyle="600" letterSpacing={0.5} fill={SOFT} />
                    </Editable>
                )}
            </Group>

            {desc && <Editable id="desc"><Group listening={false}>{desc.render(lowerTop)}</Group></Editable>}
            {extra && <Editable id="extra"><Group listening={false}>{extra.render(lowerTop + (desc ? desc.h + 8 : 0))}</Group></Editable>}

            {infoItems.length > 0 && (
                <Editable id="info">
                    <Group x={PAD} y={infoTop}>
                        <Rect width={CW} height={1} fill={INK} opacity={0.5} />
                        {infoItems.map((it, i) => (
                            <Group key={i} x={i * colW} y={8}>
                                <Txt text={String(it.label).toUpperCase()} width={colW - 14} fontSize={rem(0.46)} fontFamily={bf} fontStyle="700" letterSpacing={2} fill={palette.accent} />
                                <Txt text={it.value} y={rem(0.46) * 1.2 + 4} width={colW - 14} fontSize={valS} fontFamily={bf} fontStyle="700" lineHeight={1.1} fill={INK} />
                            </Group>
                        ))}
                    </Group>
                </Editable>
            )}
            {foot.node}
        </Group>
    );
};

export default DiagonalSplit;
