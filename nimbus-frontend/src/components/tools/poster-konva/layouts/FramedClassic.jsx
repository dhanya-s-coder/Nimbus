import React from 'react';
import { Editable } from '../engine/edit';
import { Group, Rect, Circle, Line } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H, rem } from '../engine/constants';
import { clear } from '../engine/color';
import { Txt, textHeight, LogoBar, QrBlock, SpeakerAvatar } from '../layers/ui';
import { GradBar } from '../layers/primitives';
import { stackCentered } from './stack';
import { fonts, titleBlock, textBlock, kickerBlock, extraRowsBlock, footerNode } from './parts';

const FRAME = 30;
const PAD = FRAME + 24;
const CW = W - PAD * 2;

const Ornament = ({ x, y, w, palette }) => (
    <Group listening={false}>
        <GradBar x={x} y={y} w={(w - 20) / 2} h={1} stops={[[0, clear(palette.accent)], [1, palette.accent]]} />
        <GradBar x={x + (w + 20) / 2} y={y} w={(w - 20) / 2} h={1} stops={[[0, palette.accent], [1, clear(palette.accent)]]} />
        <Rect x={x + w / 2} y={y + 0.5} width={8} height={8} offsetX={4} offsetY={4} rotation={45} fill={palette.accent} />
    </Group>
);

/** Formal framed layout: ornamental border, centered serif typography. */
const FramedClassic = ({ data, palette }) => {
    const f = fonts(palette, 'Cormorant Garamond', 'EB Garamond');
    const { title, subtitle, organizer, description, speakerName, speakerDesignation, infoItems = [], extraItems = [],
        collegeLogo, eventBrandLogo, speakerPhoto, speakerShape, qr1, qr2, footer } = data;

    const foot = footerNode({ text: footer, x: PAD, w: CW, bottom: H - FRAME - 16, palette, font: f.body, size: rem(0.5), align: 'center', line: false });

    // info as columns separated by hairlines
    const infoH = infoItems.length ? 52 : 0;
    const infoTop = foot.top - 14 - infoH;
    const colW = infoItems.length ? CW / infoItems.length : CW;

    const speakerBlock = (speakerName || speakerPhoto) && (() => {
        const av = speakerPhoto ? 150 : 0;
        const nameH = speakerName ? rem(1.05) * 1.2 + (speakerDesignation ? 4 + rem(0.7) * 1.2 : 0) : 0;
        const h = av + (av && nameH ? 10 : 0) + nameH;
        return { h, mb: 12, key: 'spk', render: (y) => (
            <Group listening={false}>
                {speakerPhoto && <SpeakerAvatar x={W / 2 - av / 2} y={y} size={av} shape={speakerShape || 'Circle'} src={speakerPhoto} palette={palette} />}
                {speakerName && <Txt text={speakerName} x={PAD} y={y + av + (av ? 10 : 0)} width={CW} align="center" fontSize={rem(1.05)} fontFamily={f.title} fontStyle="700" fill={palette.text} />}
                {speakerName && speakerDesignation && <Txt text={speakerDesignation} x={PAD} y={y + av + (av ? 10 : 0) + rem(1.05) * 1.2 + 4} width={CW} align="center" fontSize={rem(0.7)} fontFamily={f.body} fontStyle="italic 400" fill={palette.muted} />}
            </Group>
        ) };
    })();

    const descB = description && (() => {
        const w = CW * 0.9;
        const h = textHeight(description, { width: w, fontSize: rem(0.78), fontFamily: f.body, lineHeight: 1.65 });
        return { h, mb: 12, key: 'desc', render: (y) => (
            <Txt text={description} x={PAD + (CW - w) / 2} y={y} width={w} fontSize={rem(0.78)} fontFamily={f.body} lineHeight={1.65} align="center" fill={palette.muted} />
        ) };
    })();

    const blocks = [
        kickerBlock({ text: organizer, x: PAD, w: CW, palette, font: f.body, size: rem(0.6), align: 'center', mb: 12, key: 'org' }),
        { h: 9, mb: 14, key: 'orn', render: (y) => <Ornament x={W / 2 - CW * 0.275} y={y + 4} w={CW * 0.55} palette={palette} /> },
        titleBlock({ text: title, x: PAD, w: CW, font: f.title, weight: '700', maxSize: 54, minSize: 22, maxLines: 4, align: 'center', lineHeight: 1.05, letterSpacing: 0.5, palette, mb: 10 }),
        textBlock({ text: subtitle, x: PAD, w: CW, font: f.body, size: rem(0.95), italic: true, align: 'center', fill: palette.secondary, mb: 14, key: 'sub' }),
        speakerBlock,
        descB,
        extraRowsBlock({ items: extraItems, x: PAD + CW * 0.05, w: CW * 0.9, palette, font: f.body, mb: 0, size: rem(0.64) }),
    ];
    const body = stackCentered(blocks, FRAME + 12 + 36 + 10, infoTop - 14);

    return (
        <Group listening={false}>
            {/* ornamental frame */}
            <Rect x={FRAME} y={FRAME} width={W - FRAME * 2} height={H - FRAME * 2} stroke={`${palette.accent}`} strokeWidth={1.5} opacity={0.85} />
            <Rect x={FRAME + 6} y={FRAME + 6} width={W - FRAME * 2 - 12} height={H - FRAME * 2 - 12} stroke={palette.secondary} strokeWidth={0.7} opacity={0.6} />
            {[[FRAME, FRAME], [W - FRAME, FRAME], [FRAME, H - FRAME], [W - FRAME, H - FRAME]].map(([x, y], i) => (
                <Rect key={i} x={x} y={y} width={9} height={9} offsetX={4.5} offsetY={4.5} rotation={45} fill={palette.accent} />
            ))}

            <Group x={0} y={FRAME + 14}>
                <LogoBar x={PAD} y={0} h={30} collegeLogo={collegeLogo} eventLogo={eventBrandLogo} align="center" width={CW} tint={palette.darkContent ? "#ffffff" : palette.text} />
            </Group>
            {body.nodes}

            {infoItems.length > 0 && (
                <Editable id="info"><Group>
                    <Line points={[PAD + 20, infoTop - 8, W - PAD - 20, infoTop - 8]} stroke={palette.accent} strokeWidth={0.8} opacity={0.5} />
                    {infoItems.map((it, i) => (
                        <Group key={i} x={PAD + i * colW} y={infoTop}>
                            {i > 0 && <Line points={[0, 4, 0, infoH - 4]} stroke={palette.accent} strokeWidth={0.8} opacity={0.5} />}
                            <Txt text={String(it.label).toUpperCase()} y={4} width={colW} align="center" fontSize={rem(0.5)} fontFamily={f.body} fontStyle="700" letterSpacing={2} fill={palette.secondary} />
                            <Txt text={it.value} x={8} y={4 + rem(0.5) * 1.2 + 5} width={colW - 16} align="center" fontSize={rem(0.88)} fontFamily={f.title} fontStyle="700" fill={palette.text} />
                        </Group>
                    ))}
                </Group></Editable>
            )}
            {foot.node}
            {qr1 && <QrBlock x={FRAME + 18} y={H - FRAME - 18 - 96} size={64} qr={qr1} eid="qr1" palette={palette} labelSize={6} />}
            {qr2 && <QrBlock x={W - FRAME - 18 - 74} y={H - FRAME - 18 - 96} size={64} qr={qr2} eid="qr2" palette={palette} labelSize={6} />}
            <Circle x={W / 2} y={H - FRAME - 6} radius={0.1} />
        </Group>
    );
};

export default FramedClassic;
