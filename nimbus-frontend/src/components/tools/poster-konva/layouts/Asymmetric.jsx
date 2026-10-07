import React from 'react';
import { Group, Rect } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H, rem } from '../engine/constants';
import { Txt, LogoBar, QrBlock, SpeakerAvatar, Card } from '../layers/ui';
import { stackCentered } from './stack';
import { fonts, titleBlock, textBlock, kickerBlock, extraCardsBlock, footerNode } from './parts';
import { textHeight } from '../layers/ui';

const PAD = 28;
const CW = W - PAD * 2;

/** Modern offset layout: accent-bar title, staggered gradient info cards. */
const Asymmetric = ({ data, palette }) => {
    const f = fonts(palette, 'Space Grotesk', 'DM Sans');
    const { title, subtitle, organizer, description, speakerName, speakerDesignation, infoItems = [], extraItems = [],
        collegeLogo, eventBrandLogo, speakerPhoto, speakerShape, qr1, qr2, footer, templateType, duration } = data;
    const hackathon = templateType === 'hackathon';

    const foot = footerNode({ text: footer, x: PAD, w: CW, bottom: H - 20, palette, font: f.body, size: rem(0.46), align: 'right', line: false });

    // staggered info cards (each indented 28px more than the last)
    const cardH = 50;
    const stagger = 28;
    const infoH = infoItems.length ? infoItems.length * cardH + (infoItems.length - 1) * 8 : 0;
    const infoTop = foot.top - 14 - infoH;
    const infoNodes = infoItems.map((it, i) => {
        const x = PAD + i * stagger;
        const w = CW * 0.62;
        const y = infoTop + i * (cardH + 8);
        return (
            <Card key={i} x={x} y={y} width={w} height={cardH} radius={12}
                gradient={{ x1: 0, y1: 0, x2: w, y2: cardH, stops: [[0, `${palette.primary}33`], [1, `${palette.bgMid}99`]] }}
                stroke={`${palette.primary}55`}>
                <Rect width={4} height={cardH} fill={i % 2 ? palette.secondary : palette.primary} cornerRadius={[12, 0, 0, 12]} />
                <Txt text={String(it.label).toUpperCase()} x={16} y={9} width={w - 24} fontSize={rem(0.46)} fontFamily={f.body} fontStyle="700" letterSpacing={1.5} fill={palette.secondary} />
                <Txt text={it.value} x={16} y={9 + rem(0.46) * 1.2 + 3} width={w - 24} fontSize={rem(0.82)} fontFamily={f.body} fontStyle="700" fill={palette.text} ellipsis height={rem(0.82) * 1.2} />
            </Card>
        );
    });

    const tW = CW - 18;
    const titleB = titleBlock({ text: title, x: PAD + 18, w: tW, font: f.title, weight: '800', maxSize: 54, minSize: 22, maxLines: 4, lineHeight: 1.0, letterSpacing: -0.8, palette, mb: 10 });
    const titleWithBar = titleB && { ...titleB, render: (y) => (
        <Group>
            <Rect x={PAD} y={y + 4} width={5} height={titleB.h - 8} cornerRadius={3} fill={palette.primary} shadowColor={palette.primary} shadowBlur={12} shadowOpacity={0.6} />
            {titleB.render(y)}
        </Group>
    ) };

    const speakerRow = (speakerName || speakerPhoto) && (() => {
        const av = speakerPhoto ? 96 : 0;
        const nameH = rem(0.95) * 1.25 + (speakerDesignation ? 3 + rem(0.62) * 1.25 : 0);
        const h = Math.max(av, nameH);
        return { h, mb: 12, key: 'spk', render: (y) => (
            <Group listening={false}>
                {speakerPhoto && <SpeakerAvatar x={PAD + 18} y={y + (h - av) / 2} size={av} shape={speakerShape || 'Circle'} src={speakerPhoto} palette={palette} />}
                {speakerName && <Txt text={speakerName} x={PAD + 18 + av + (av ? 16 : 0)} y={y + (h - nameH) / 2} width={CW - av - 40} fontSize={rem(0.95)} fontFamily={f.body} fontStyle="700" fill={palette.text} />}
                {speakerName && speakerDesignation && <Txt text={speakerDesignation} x={PAD + 18 + av + (av ? 16 : 0)} y={y + (h - nameH) / 2 + rem(0.95) * 1.25 + 3} width={CW - av - 40} fontSize={rem(0.62)} fontFamily={f.body} fill={palette.muted} />}
            </Group>
        ) };
    })();

    const descB = description && (() => {
        const w = CW * 0.8;
        const bh = textHeight(description, { width: w, fontSize: rem(0.7), fontFamily: f.body, lineHeight: 1.6 });
        return { h: bh, mb: 12, key: 'desc', render: (y) => (
            <Txt text={description} x={PAD + 18} y={y} width={w} fontSize={rem(0.7)} fontFamily={f.body} lineHeight={1.6} fill={palette.muted} />
        ) };
    })();

    const blocks = [
        kickerBlock({ text: organizer, x: PAD + 18, w: CW, palette, font: f.body, size: rem(0.56), mb: 10, key: 'org' }),
        titleWithBar,
        textBlock({ text: subtitle, x: PAD + 18, w: CW - 18, font: f.body, size: rem(0.8), weight: '600', letterSpacing: 1.8, fill: palette.secondary, upper: true, mb: 12, key: 'sub' }),
        speakerRow,
        descB,
        extraCardsBlock({ items: extraItems, x: PAD, w: CW, palette, font: f.body, mb: 0 }),
    ];
    const body = stackCentered(blocks, PAD + 34 + 18, infoTop - 14);

    return (
        <Group listening={false}>
            <LogoBar x={PAD} y={PAD - 4} h={32} collegeLogo={collegeLogo} eventLogo={eventBrandLogo} tint={palette.darkContent ? "#ffffff" : palette.text} />
            {hackathon && (
                <Group x={W - PAD - 150} y={PAD}>
                    <Rect width={150} height={24} fill={`${palette.bg}cc`} stroke={palette.primary} strokeWidth={1} />
                    <Txt text={`REGISTER NOW${duration ? ` // ${duration}` : ''}`.toUpperCase()} y={7} width={150} align="center" fontSize={8.5} fontFamily="monospace" fontStyle="700" letterSpacing={1} fill={palette.primary} wrap="none" />
                </Group>
            )}
            {body.nodes}
            {infoNodes}
            {foot.node}
            {qr1 && <QrBlock x={W - PAD - 92} y={infoTop} size={72} qr={qr1} palette={palette} />}
            {qr2 && <QrBlock x={W - PAD - 92 - 92} y={infoTop} size={72} qr={qr2} palette={palette} />}
        </Group>
    );
};

export default Asymmetric;
