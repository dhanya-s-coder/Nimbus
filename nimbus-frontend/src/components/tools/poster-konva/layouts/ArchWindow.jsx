import React from 'react';
import { Group, Rect, Line, Circle } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H, rem } from '../engine/constants';
import { darken, inkOn, isLight } from '../engine/color';
import { Txt, textHeight, LogoBar, SpeakerAvatar } from '../layers/ui';
import { Grain } from '../layers/primitives';
import { stackCentered } from './stack';
import { titleBlock, textBlock, footerNode } from './parts';
import { pickTitleFont, pickBodyFont, qrStrip, HoleShape, archPath, extraLines } from './kit';
import { Editable } from '../engine/edit';

export const FONTS = ['Fraunces'];

const PAD = 34;
const CW = W - PAD * 2;

/** Arch-shaped photo window on a solid paper sheet: editorial, calm, very "wedding-invite / boutique brand". */
const ArchWindow = ({ data, palette }) => {
    const tf = pickTitleFont(palette, 'Fraunces');
    const bf = pickBodyFont(palette, 'Inter');
    const { title, subtitle, organizer, description, speakerName, speakerDesignation, speakerPhoto, speakerShape, infoItems = [], extraItems = [], collegeLogo, eventBrandLogo, qr1, qr2, footer } = data;

    // the sheet is a solid colour, so text colours follow IT (not the photo)
    const sheet = palette.bg;
    const light = isLight(sheet);
    const ink = inkOn(sheet);
    const soft = light ? 'rgba(17,24,39,0.7)' : 'rgba(255,255,255,0.74)';
    const accent = light ? darken(palette.primary, 0.12) : palette.accent;

    const topRow = 26;
    const archTop = 74;
    const archH = Math.max(210, Math.min(560, Math.min(H * 0.46, H - archTop - 300)));
    const archW = Math.min(CW - 40, archH * 0.86);
    const archX = (W - archW) / 2;
    const archBottom = archTop + archH;

    // info bar + footer anchored to the bottom
    const foot = footerNode({ text: footer, x: PAD, w: CW, bottom: H - 18, palette: { ...palette, divider: soft, muted: soft }, font: bf, size: rem(0.45), align: 'center', line: false });
    const cols = infoItems.length || 1;
    const colW = CW / cols;
    const valS = rem(0.8);
    const vH = infoItems.length ? Math.max(...infoItems.map((it) => textHeight(it.value, { width: colW - 18, fontSize: valS, fontFamily: tf, fontStyle: '600', lineHeight: 1.15 }))) : 0;
    const infoH = infoItems.length ? 8 + rem(0.46) * 1.2 + 4 + vH + 8 : 0;
    const infoTop = foot.top - 12 - infoH;

    const body = stackCentered([
        organizer && textBlock({ text: organizer.toUpperCase(), x: PAD, w: CW, font: bf, size: rem(0.6), weight: '700', letterSpacing: 4, align: 'center', fill: accent, mb: 8, key: 'kicker' }),
        titleBlock({ text: title, x: PAD, w: CW, font: tf, weight: '700', maxSize: 54, minSize: 24, maxLines: 3, align: 'center', lineHeight: 1.02, letterSpacing: -0.5, upper: false, fill: ink, shadow: false, palette, mb: 8 }),
        subtitle && textBlock({ text: subtitle, x: PAD + 20, w: CW - 40, font: tf, size: rem(0.95), italic: true, align: 'center', fill: accent, mb: 8, key: 'sub' }),
        description && textBlock({ text: description, x: PAD + 24, w: CW - 48, font: bf, size: rem(0.7), lineHeight: 1.55, align: 'center', fill: soft, mb: 6, key: 'desc', maxLines: 3 }),
        (() => { const r = extraLines({ items: extraItems, x: PAD, w: CW, bodyFont: bf, ink: soft, size: rem(0.58), max: 2, align: 'center' }); return r && { h: r.h, mb: 0, key: 'extra', render: (y) => <Group x={0} listening={false}>{r.render(y)}</Group> }; })(),
    ], archBottom + 18, infoTop - 12);

    const qr = qrStrip({ qr1, qr2, x: 0, y: 0, size: 46, palette, labelSize: 6 });

    return (
        <Group listening={false}>
            {/* paper sheet with the arch cut out */}
            <HoleShape fill={sheet} paths={[(ctx) => { ctx.rect(0, 0, W, H); }, archPath(archX, archTop, archW, archH)]} />
            <Grain opacity={0.05} />
            {/* offset outline */}
            <HoleShape stroke={accent} strokeWidth={1.2} opacity={0.9} paths={[archPath(archX - 9, archTop - 9, archW + 18, archH + 9)]} />
            <Circle x={W / 2} y={archTop - 22} radius={3} fill={accent} />

            {/* top row */}
            <LogoBar x={PAD} y={topRow - 2} h={26} collegeLogo={collegeLogo} eventLogo={eventBrandLogo} align="left" width={CW / 2} tint={ink} />
            {infoItems[0] && (
                <Txt text={String(infoItems[0].value).toUpperCase()} x={W - PAD - CW / 2} y={topRow + 6} width={CW / 2} align="right" wrap="none" ellipsis fontSize={rem(0.5)} fontFamily={bf} fontStyle="700" letterSpacing={2.5} fill={ink} />
            )}

            {/* the speaker: a big portrait centred in the window (name below it); name-only becomes a small chip */}
            {speakerPhoto ? (() => {
                const chipH = speakerName ? (speakerDesignation ? 42 : 30) : 0;
                const top = 26;
                const bottomPad = chipH ? chipH + 26 : 18;
                const availH = archH - top - bottomPad;
                const size = Math.max(90, Math.min(archW * 0.8, availH));
                const cx = archX + archW / 2;
                const avY = archTop + top + Math.max(0, (availH - size) / 2);
                const shape = speakerShape === 'Square' || speakerShape === 'Diamond' ? speakerShape : 'Circle';
                const chipW = Math.min(250, archW - (qr.w ? 2 * (qr.w + 20) : 40));
                return (
                    <>
                        {/* soft halo so the portrait lifts off any background */}
                        <Circle x={cx} y={avY + size / 2} radius={size / 2 + 16} fill="rgba(0,0,0,0.001)" shadowColor={palette.primary} shadowBlur={34} shadowOpacity={0.55} listening={false} />
                        <SpeakerAvatar x={cx - size / 2} y={avY} size={size} shape={shape} src={speakerPhoto} palette={palette} />
                        {speakerName && (
                            <Editable id="speaker">
                                <Group x={cx - chipW / 2} y={archBottom - 14 - chipH}>
                                    <Rect width={chipW} height={chipH} cornerRadius={chipH / 2} fill="rgba(8,12,24,0.7)" />
                                    <Txt text={speakerName} width={chipW} y={speakerDesignation ? 7 : 8} align="center" wrap="none" ellipsis fontSize={rem(0.78)} fontFamily={bf} fontStyle="700" fill="#ffffff" />
                                    {speakerDesignation && <Txt text={speakerDesignation} width={chipW} y={25} align="center" wrap="none" ellipsis fontSize={rem(0.54)} fontFamily={bf} fill="rgba(255,255,255,0.8)" />}
                                </Group>
                            </Editable>
                        )}
                    </>
                );
            })() : speakerName && (
                <Editable id="speaker">
                    <Group x={archX + 14} y={archBottom - 14 - 36}>
                        <Rect width={Math.min(archW * 0.62, 210)} height={36} cornerRadius={18} fill="rgba(8,12,24,0.62)" />
                        <Txt text={speakerName} x={14} y={speakerDesignation ? 7 : 11} width={Math.min(archW * 0.62, 210) - 24} wrap="none" ellipsis fontSize={rem(0.72)} fontFamily={bf} fontStyle="700" fill="#ffffff" />
                        {speakerDesignation && <Txt text={speakerDesignation} x={14} y={22} width={Math.min(archW * 0.62, 210) - 24} wrap="none" ellipsis fontSize={rem(0.52)} fontFamily={bf} fill="rgba(255,255,255,0.8)" />}
                    </Group>
                </Editable>
            )}
            {qr.node && <Group x={archX + archW - 14 - qr.w} y={archBottom - 14 - qr.h}>{qr.node}</Group>}

            {body.nodes}

            {infoItems.length > 0 && (
                <Editable id="info">
                    <Group x={PAD} y={infoTop}>
                        <Rect width={CW} height={1} fill={accent} opacity={0.7} />
                        {infoItems.map((it, i) => (
                            <Group key={i} x={i * colW}>
                                {i > 0 && <Line points={[0, 10, 0, infoH - 6]} stroke={accent} strokeWidth={1} opacity={0.5} />}
                                <Txt text={String(it.label).toUpperCase()} y={9} x={4} width={colW - 8} align="center" fontSize={rem(0.46)} fontFamily={bf} fontStyle="700" letterSpacing={2.5} fill={accent} />
                                <Txt text={it.value} y={9 + rem(0.46) * 1.2 + 4} x={9} width={colW - 18} align="center" fontSize={valS} fontFamily={tf} fontStyle="600" lineHeight={1.15} fill={ink} />
                            </Group>
                        ))}
                    </Group>
                </Editable>
            )}
            {foot.node}
        </Group>
    );
};

export default ArchWindow;
