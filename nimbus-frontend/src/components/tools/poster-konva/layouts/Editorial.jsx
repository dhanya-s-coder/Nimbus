import React from 'react';
import { Group, Rect } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H, rem } from '../engine/constants';
import { clear } from '../engine/color';
import { Txt, textHeight, LogoBar, QrBlock, SpeakerAvatar } from '../layers/ui';
import { GradBar } from '../layers/primitives';
import { stackCentered } from './stack';
import { fonts, titleBlock, textBlock, kickerBlock, extraRowsBlock, footerNode } from './parts';

const PAD_L = 44; // leaves room for the accent sidebar frame
const PAD_R = 34;
const CW = W - PAD_L - PAD_R;

/** Clean editorial: left-aligned serif headline, glowing rules, speaker card. */
const Editorial = ({ data, palette }) => {
    const f = fonts(palette, 'Playfair Display', 'DM Sans');
    const { title, subtitle, organizer, description, speakerName, speakerDesignation, infoItems = [], extraItems = [],
        collegeLogo, eventBrandLogo, speakerPhoto, speakerShape, qr1, qr2, footer } = data;

    const foot = footerNode({ text: footer, x: PAD_L, w: CW, bottom: H - 20, palette, font: f.body, size: rem(0.46), align: 'left', line: false });
    const bottom = foot.top - 12;

    // info items as a 2-col grid of compact cards
    const cols = infoItems.length > 2 ? 2 : 1;
    const cw = (CW - (cols - 1) * 10) / cols;
    const rowsN = Math.ceil(infoItems.length / cols);
    const cardH = 44;
    const gridH = infoItems.length ? rowsN * cardH + (rowsN - 1) * 8 : 0;
    const gridBlock = infoItems.length ? { h: gridH, mb: 0, key: 'grid', render: (y) => (
        <Group listening={false}>
            {infoItems.map((it, i) => {
                const cx = PAD_L + (i % cols) * (cw + 10);
                const cy = y + Math.floor(i / cols) * (cardH + 8);
                return (
                    <Group key={i} x={cx} y={cy}>
                        <Rect width={cw} height={cardH} cornerRadius={8} fill={`${palette.primary}14`} stroke={`${palette.primary}33`} strokeWidth={1} />
                        <Rect width={3} height={cardH} fill={palette.primary} />
                        <Txt text={String(it.label).toUpperCase()} x={14} y={8} width={cw - 20} fontSize={rem(0.46)} fontFamily={f.body} fontStyle="700" letterSpacing={1.5} fill={palette.secondary} />
                        <Txt text={it.value} x={14} y={8 + rem(0.46) * 1.2 + 3} width={cw - 20} fontSize={rem(0.74)} fontFamily={f.body} fontStyle="700" fill={palette.text} ellipsis height={rem(0.74) * 1.25} />
                    </Group>
                );
            })}
        </Group>
    ) } : null;

    const speakerCard = (speakerName || speakerPhoto) && (() => {
        const av = speakerPhoto ? 84 : 0;
        const nameH = rem(0.95) * 1.25 + (speakerDesignation ? 3 + rem(0.62) * 1.25 : 0);
        const h = Math.max(av, nameH) + 20;
        return { h, mb: 14, key: 'speaker', render: (y) => (
            <Group listening={false}>
                <Rect x={PAD_L} y={y} width={CW} height={h} cornerRadius={12}
                    fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: CW, y: 0 }}
                    fillLinearGradientColorStops={[0, `${palette.primary}26`, 1, `${palette.secondary}0d`]} stroke={`${palette.primary}33`} />
                {speakerPhoto && <SpeakerAvatar x={PAD_L + 12} y={y + (h - av) / 2} size={av} shape={speakerShape || 'Circle'} src={speakerPhoto} palette={palette} />}
                {speakerName && <Txt text={speakerName} x={PAD_L + 12 + av + (av ? 14 : 0)} y={y + (h - nameH) / 2} width={CW - av - 40} fontSize={rem(0.95)} fontFamily={f.body} fontStyle="700" fill={palette.text} />}
                {speakerName && speakerDesignation && <Txt text={speakerDesignation} x={PAD_L + 12 + av + (av ? 14 : 0)} y={y + (h - nameH) / 2 + rem(0.95) * 1.25 + 3} width={CW - av - 40} fontSize={rem(0.62)} fontFamily={f.body} fill={palette.muted} />}
            </Group>
        ) };
    })();

    const descBlock = description && (() => {
        const bs = rem(0.72);
        const bh = textHeight(description, { width: CW - 18, fontSize: bs, fontFamily: f.body, lineHeight: 1.6 });
        return { h: bh, mb: 14, key: 'desc', render: (y) => (
            <Group listening={false}>
                <Rect x={PAD_L} y={y} width={3} height={bh} fill={palette.secondary} opacity={0.8} />
                <Txt text={description} x={PAD_L + 16} y={y} width={CW - 18} fontSize={bs} fontFamily={f.body} lineHeight={1.6} fill={palette.muted} />
            </Group>
        ) };
    })();

    const blocks = [
        kickerBlock({ text: organizer, x: PAD_L, w: CW, palette, font: f.body, size: rem(0.58), dash: true, mb: 10, key: 'org' }),
        { h: 2, mb: 14, key: 'rule', render: (y) => <GradBar x={PAD_L} y={y} w={CW} h={1.5} stops={[[0, palette.primary], [0.55, `${palette.secondary}66`], [1, clear(palette.secondary)]]} /> },
        titleBlock({ text: title, x: PAD_L, w: CW, font: f.title, weight: '800', maxSize: 58, minSize: 22, maxLines: 4, upper: false, lineHeight: 1.05, letterSpacing: -0.5, palette, mb: 10 }),
        textBlock({ text: subtitle, x: PAD_L, w: CW, font: f.body, size: rem(0.78), weight: '600', letterSpacing: 2, fill: palette.secondary, upper: true, mb: 14, key: 'sub' }),
        speakerCard,
        descBlock,
        extraRowsBlock({ items: extraItems, x: PAD_L, w: CW, palette, font: f.body, align: 'left', mb: 14 }),
        { h: 1, mb: 12, key: 'rule2', render: (y) => <GradBar x={PAD_L} y={y} w={CW} h={1} stops={[[0, clear(palette.primary)], [0.2, `${palette.primary}80`], [1, clear(palette.primary)]]} /> },
        gridBlock,
    ];
    const body = stackCentered(blocks, PAD_L ? 30 + 36 + 10 : 76, bottom);

    return (
        <Group listening={false}>
            <LogoBar x={PAD_L} y={26} h={32} collegeLogo={collegeLogo} eventLogo={eventBrandLogo} tint={palette.darkContent ? "#ffffff" : palette.text} />
            {body.nodes}
            {foot.node}
            {qr1 && <QrBlock x={W - PAD_R - 84} y={22} size={64} qr={qr1} eid="qr1" palette={palette} labelSize={6} />}
            {qr2 && <QrBlock x={W - PAD_R - 84 - 90} y={22} size={64} qr={qr2} eid="qr2" palette={palette} labelSize={6} />}
        </Group>
    );
};

export default Editorial;
