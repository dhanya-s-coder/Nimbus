import React from 'react';
import { Group, Rect, Circle, Line } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H, rem } from '../engine/constants';
import { clear, linear } from '../engine/color';
import { Txt, LogoBar, QrBlock, SpeakerAvatar, CoverImage, useImg } from '../layers/ui';
import { GradBar, RadialEllipse } from '../layers/primitives';
import { stackCentered } from './stack';
import { fonts, titleBlock, textBlock, kickerBlock, gradientDivider, infoStackBlock, extraRowsBlock, footerNode } from './parts';

const LEFT_W = Math.round(W * 0.46);
const PAD = 26;
const LW = LEFT_W - PAD * 2;

/** Left info panel + right photo/decor panel (UDBHAV tech-talk style). */
const SplitPanel = ({ data, palette }) => {
    const f = fonts(palette, 'Space Grotesk', 'DM Sans');
    const { title, subtitle, organizer, description, speakerName, speakerDesignation, infoItems = [], extraItems = [],
        collegeLogo, eventBrandLogo, speakerPhoto, speakerShape, qr1, qr2, footer } = data;
    const [photo] = useImg(speakerPhoto);

    const foot = footerNode({ text: footer, x: PAD, w: LW, bottom: H - 18, palette, font: f.body, size: rem(0.44), align: 'left', line: false });
    const qrH = qr1 || qr2 ? 78 : 0;
    const bottom = foot.top - 10 - (qrH ? qrH + 8 : 0);

    const blocks = [
        kickerBlock({ text: organizer, x: PAD, w: LW, palette, font: f.body, size: rem(0.52), dash: true, mb: 12, key: 'org' }),
        titleBlock({ text: title, x: PAD, w: LW, font: f.title, weight: '800', maxSize: 44, minSize: 18, maxLines: 5, palette, lineHeight: 1.02, mb: 10 }),
        textBlock({ text: subtitle, x: PAD, w: LW, font: f.body, size: rem(0.7), weight: '600', letterSpacing: 1.6, fill: palette.secondary, upper: true, mb: 10, key: 'sub' }),
        gradientDivider({ x: PAD, w: 60, h: 2, palette, mb: 12, align: 'left' }),
        textBlock({ text: description, x: PAD, w: LW, font: f.body, size: rem(0.66), lineHeight: 1.55, fill: palette.muted, mb: 12, key: 'desc', maxLines: 8 }),
        infoStackBlock({ items: infoItems, x: PAD, w: LW, palette, font: f.body, mb: 10 }),
        extraRowsBlock({ items: extraItems.slice(0, 2), x: PAD, w: LW, palette, font: f.body, align: 'left', size: rem(0.56), max: 40 }),
    ];
    const left = stackCentered(blocks, PAD + 40 + 14, bottom);

    // right panel geometry
    const RX = LEFT_W;
    const RW = W - LEFT_W;
    const photoSize = Math.min(RW - 24, 300);
    const px = RX + (RW - photoSize) / 2;
    const py = H * 0.5 - photoSize / 2 - 30;

    return (
        <Group listening={false}>
            {/* left panel */}
            <Rect x={0} y={0} width={LEFT_W} height={H}
                {...linear(0, 0, LEFT_W, H, [[0, `${palette.bg}f2`], [1, `${palette.bgMid}e6`]])} />
            <GradBar x={LEFT_W - 3} y={0} w={3} h={H} dir="v" stops={[[0, clear(palette.primary)], [0.5, palette.primary], [1, clear(palette.secondary)]]} />
            <Rect x={LEFT_W - 40} y={0} width={40} height={H} {...linear(LEFT_W - 40, 0, LEFT_W, 0, [[0, clear(palette.primary)], [1, `${palette.primary}33`]])} />

            <LogoBar x={PAD} y={PAD - 6} h={30} collegeLogo={collegeLogo} eventLogo={eventBrandLogo} tint={palette.darkContent ? "#ffffff" : palette.text} />
            {left.nodes}
            {(qr1 || qr2) && (
                <Group>
                    {qr1 && <QrBlock x={PAD} y={bottom + 8} size={60} qr={qr1} palette={palette} labelSize={6} />}
                    {qr2 && <QrBlock x={PAD + 84} y={bottom + 8} size={60} qr={qr2} palette={palette} labelSize={6} />}
                </Group>
            )}
            {foot.node}

            {/* right panel */}
            {photo ? (
                <Group>
                    <RadialEllipse cx={px + photoSize / 2} cy={py + photoSize / 2} rx={photoSize * 0.9} ry={photoSize * 0.9}
                        stops={[[0, `${palette.primary}55`], [0.6, clear(palette.primary)], [1, clear(palette.primary)]]} />
                    <SpeakerAvatar x={px} y={py} size={photoSize} shape={speakerShape || 'Hexagon'} src={speakerPhoto} palette={palette} />
                    {speakerName && (
                        <Group x={RX + 24} y={H - 150}>
                            <Rect width={RW - 48} height={speakerDesignation ? 78 : 56} cornerRadius={8} fill="rgba(4,10,24,0.74)" />
                            <Rect width={4} height={speakerDesignation ? 78 : 56} cornerRadius={2} fill={palette.primary} />
                            <Txt text={speakerName.toUpperCase()} x={16} y={12} width={RW - 80} fontSize={rem(1.05)} fontFamily={f.title} fontStyle="800" lineHeight={1.05} fill="#FFFFFF" />
                            {speakerDesignation && <Txt text={speakerDesignation} x={16} y={48} width={RW - 80} fontSize={rem(0.58)} fontFamily={f.body} fill="rgba(255,255,255,0.8)" />}
                        </Group>
                    )}
                </Group>
            ) : (
                <Group>
                    {/* decorative panel when there is no photo */}
                    <RadialEllipse cx={RX + RW * 0.55} cy={H * 0.42} rx={RW * 0.95} ry={RW * 0.95}
                        stops={[[0, `${palette.primary}40`], [0.65, clear(palette.primary)], [1, clear(palette.primary)]]} />
                    {[210, 160, 110, 60].map((r, i) => (
                        <Circle key={r} x={RX + RW * 0.55} y={H * 0.42} radius={r} stroke={i % 2 ? palette.accent : palette.secondary} strokeWidth={i === 1 ? 1.4 : 0.8} opacity={0.18 + i * 0.07} />
                    ))}
                    <Circle x={RX + RW * 0.55} y={H * 0.42} radius={26} fill={palette.primary} opacity={0.85} />
                    <Circle x={RX + RW * 0.55} y={H * 0.42} radius={40} stroke={palette.accent} strokeWidth={2} opacity={0.7} />
                    <Line points={[RX + 30, H - 110, W - 30, H - 110]} stroke={palette.secondary} strokeWidth={1} opacity={0.35} />
                    {speakerName && (
                        <Group x={RX + 24} y={H - 150}>
                            <Rect width={RW - 48} height={speakerDesignation ? 78 : 56} cornerRadius={8} fill="rgba(4,10,24,0.74)" />
                            <Rect width={4} height={speakerDesignation ? 78 : 56} cornerRadius={2} fill={palette.primary} />
                            <Txt text={speakerName.toUpperCase()} x={16} y={12} width={RW - 80} fontSize={rem(1.05)} fontFamily={f.title} fontStyle="800" lineHeight={1.05} fill="#FFFFFF" />
                            {speakerDesignation && <Txt text={speakerDesignation} x={16} y={48} width={RW - 80} fontSize={rem(0.58)} fontFamily={f.body} fill="rgba(255,255,255,0.8)" />}
                        </Group>
                    )}
                </Group>
            )}
            {/* cover helper keeps import used for future bg crop */}
            {false && <CoverImage />}
        </Group>
    );
};

export default SplitPanel;
