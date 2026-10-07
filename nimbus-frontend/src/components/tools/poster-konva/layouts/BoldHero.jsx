import React from 'react';
import { Editable } from '../engine/edit';
import { Group, Rect, Line } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H, rem } from '../engine/constants';
import { clear } from '../engine/color';
import { Txt, textHeight, LogoBar, QrBlock, SpeakerAvatar, Card } from '../layers/ui';
import { GradBar } from '../layers/primitives';
import { stackCentered } from './stack';
import { fonts, titleBlock, textBlock, infoRowBlock, extraCardsBlock, footerNode } from './parts';

const PAD = 30;
const CW = W - PAD * 2;

const heroSize = (len) => (!len ? 72 : len > 40 ? 35 : len > 30 ? 45 : len > 20 ? 56 : len > 12 ? 67 : 80);

/** HUD grid: horizontal lines fade toward the bottom, vertical lines use a gradient stroke. */
const HudGrid = ({ palette }) => {
    const lines = [];
    const fadeEnd = H * 0.78;
    for (let y = 0; y < fadeEnd; y += 28) {
        lines.push(<Line key={`h${y}`} points={[0, y, W, y]} stroke={`${palette.primary}35`} strokeWidth={1} opacity={0.45 * (1 - y / fadeEnd)} />);
    }
    for (let x = 0; x <= W; x += 28) {
        lines.push(<Line key={`v${x}`} points={[x, 0, x, fadeEnd]} strokeWidth={1} opacity={0.45}
            strokeLinearGradientStartPoint={{ x: 0, y: 0 }} strokeLinearGradientEndPoint={{ x: 0, y: fadeEnd }}
            strokeLinearGradientColorStops={[0, `${palette.primary}35`, 1, `${palette.primary}00`]} />);
    }
    return <Group listening={false}>{lines}</Group>;
};

/** Title-dominant layout: huge centered headline, HUD frame, description panel, rich info bar. */
const BoldHero = ({ data, palette }) => {
    const f = fonts(palette, 'Bebas Neue', 'Outfit');
    const { title, subtitle, organizer, description, speakerName, speakerDesignation, duration, infoItems = [], extraItems = [],
        collegeLogo, eventBrandLogo, speakerPhoto, speakerShape, qr1, qr2, footer, templateType } = data;
    const hackathon = templateType === 'hackathon';

    const foot = footerNode({ text: footer, x: PAD, w: CW, bottom: H - 18, palette, font: f.body, size: rem(0.46), line: false });
    const infoBar = infoRowBlock({ items: infoItems, x: PAD, w: CW, palette, font: f.body, glass: true });
    const barTop = foot.top - 12 - (infoBar?.h || 0);
    const topEnd = PAD + 34 + 14;

    const heroBlocks = [
        organizer && textBlock({ text: `Presented by ${organizer}`, x: PAD, w: CW, font: f.body, size: rem(0.62), weight: '700', letterSpacing: 2.5, align: 'center', fill: palette.accent, upper: true, mb: 8, key: 'org' }),
        titleBlock({ text: title, x: PAD, w: CW, font: f.title, weight: '900', maxSize: heroSize((title || '').length), minSize: 28, maxLines: 3, align: 'center', lineHeight: 0.95, letterSpacing: -1.5, palette, mb: 12 }),
        { h: 8, mb: 10, key: 'rule', render: (y) => (
            <Group>
                <GradBar x={PAD} y={y} w={CW} h={2} stops={[[0, palette.primary], [1, palette.secondary]]} />
                <GradBar x={W / 2 - 120} y={y + 6} w={240} h={1} stops={[[0, clear(palette.primary)], [0.5, palette.secondary], [1, clear(palette.primary)]]} />
            </Group>
        ) },
        subtitle && textBlock({ text: subtitle, x: PAD, w: CW, font: f.body, size: rem(1.0), weight: '600', letterSpacing: 1.5, align: 'center', fill: palette.secondary, upper: true, mb: 12, key: 'sub' }),
        hackathon && { h: rem(0.9) * 1.2 + 10, mb: 12, key: 'tag', render: (y) => (
            <Group>
                <Rect x={W / 2 - 100} y={y} width={200} height={rem(0.9) * 1.2 + 10} fill="rgba(0,0,0,0.35)" stroke={`${palette.primary}80`} strokeWidth={1} />
                <Txt text="> BUILD • SHIP • WIN_" x={W / 2 - 100} y={y + 5} width={200} align="center" fontSize={rem(0.9)} fontFamily="monospace" fontStyle="700" letterSpacing={1.5} fill={palette.secondary} wrap="none" />
            </Group>
        ) },
        (speakerName || speakerPhoto) && (() => {
            const av = speakerPhoto ? 120 : 0;
            const nameH = speakerName ? rem(0.9) * 1.25 + (speakerDesignation ? 4 + rem(0.62) * 1.2 : 0) : 0;
            const h = Math.max(av, nameH);
            const nameW = speakerName ? Math.min(CW - av - 20, 360) : 0;
            const totalW = av + (av && nameW ? 14 : 0) + nameW;
            return { h, mb: 12, key: 'speaker', render: (y) => {
                const sx = PAD + (CW - totalW) / 2;
                return (
                    <Group>
                        {speakerPhoto && <SpeakerAvatar x={sx} y={y + (h - av) / 2} size={av} shape={speakerShape || 'Circle'} src={speakerPhoto} palette={palette} />}
                        {speakerName && <Txt text={`— ${speakerName}`} x={sx + av + (av ? 14 : 0)} y={y + (h - nameH) / 2} width={nameW} fontSize={rem(0.9)} fontFamily={f.body} fontStyle="700" fill={palette.accent} />}
                        {speakerName && speakerDesignation && <Txt text={speakerDesignation} x={sx + av + (av ? 14 : 0)} y={y + (h - nameH) / 2 + rem(0.9) * 1.25 + 4} width={nameW} fontSize={rem(0.62)} fontFamily={f.body} fill={palette.muted} />}
                    </Group>
                );
            } };
        })(),
        description && (() => {
            const lab = rem(0.5);
            const bs = rem(0.72);
            const bh = textHeight(description, { width: CW - 30, fontSize: bs, fontFamily: f.body, lineHeight: 1.5 });
            const h = 12 + lab * 1.2 + 6 + bh + 12;
            return { h, mb: 12, key: 'desc', render: (y) => (
                <Card x={PAD} y={y} width={CW} height={h} radius={7}
                    gradient={{ x1: 0, y1: 0, x2: CW, y2: h, stops: [[0, `${palette.primary}18`], [1, `${palette.secondary}0c`]] }}
                    stroke={`${palette.primary}30`}>
                    <Rect width={3} height={h} fill={palette.primary} />
                    <Txt text="ABOUT THE EVENT" x={16} y={12} width={CW - 30} fontSize={lab} fontFamily={f.body} fontStyle="700" letterSpacing={1.3} fill={palette.secondary} />
                    <Txt text={description} x={16} y={12 + lab * 1.2 + 6} width={CW - 30} fontSize={bs} fontFamily={f.body} lineHeight={1.5} align="justify" fill="#FFFFFF" />
                </Card>
            ) };
        })(),
        extraCardsBlock({ items: extraItems, x: PAD, w: CW, palette, font: f.body, mb: 0 }),
    ];

    const hero = stackCentered(heroBlocks, topEnd, barTop - 12);

    return (
        <Group listening={false}>
            <HudGrid palette={palette} />
            <Line points={[W - 16 - 58, 14, W - 16, 14, W - 16, 14 + 58]} stroke={palette.primary} strokeWidth={2} opacity={0.8} />
            <Line points={[16, H - 14 - 58, 16, H - 14, 16 + 58, H - 14]} stroke={palette.secondary} strokeWidth={2} opacity={0.8} />
            <LogoBar x={PAD} y={PAD - 4} h={34} collegeLogo={collegeLogo} eventLogo={eventBrandLogo} tint={palette.darkContent ? "#ffffff" : palette.text} />
            {hackathon && (
                <Group x={W - PAD - 190} y={34}>
                    <Rect width={190} height={26} fill={`${palette.bg}cc`} stroke={palette.primary} strokeWidth={1} shadowColor={palette.primary} shadowBlur={14} shadowOpacity={0.5} />
                    <Txt text={`REGISTER NOW${duration ? ` // ${duration}` : ''}`.toUpperCase()} x={0} y={8} width={190} align="center" fontSize={9} fontFamily="monospace" fontStyle="700" letterSpacing={1.2} fill={palette.primary} wrap="none" />
                </Group>
            )}
            {hero.nodes}
            {infoBar && <Editable id="info">{infoBar.render(barTop)}</Editable>}
            {foot.node}
            {qr1 && <QrBlock x={W - PAD - 92} y={80} size={72} qr={qr1} eid="qr1" palette={palette} />}
            {qr2 && <QrBlock x={W - PAD - 92 - 92} y={80} size={72} qr={qr2} eid="qr2" palette={palette} />}
        </Group>
    );
};

export default BoldHero;
