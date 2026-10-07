import React from 'react';
import { Group, Rect } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H, rem } from '../engine/constants';
import { Txt, LogoBar, QrBlock } from '../layers/ui';
import { stackCentered } from './stack';
import { fonts, titleBlock, textBlock, infoRowBlock, footerNode } from './parts';

const PAD = 28;
const CW = W - PAD * 2;

/** Big headline, accent bar, three event cards along the bottom. */
const EventCards = ({ data, palette }) => {
    const f = fonts(palette, 'Montserrat', 'Inter');
    const { title, subtitle, organizer, description, infoItems = [], extraItems = [], collegeLogo, eventBrandLogo, qr1, qr2, footer } = data;
    const titleFont = 'Montserrat';

    const foot = footerNode({ text: footer, x: PAD, w: CW, bottom: H - 18, palette, font: f.body, size: rem(0.46), line: false });
    const cards = infoRowBlock({ items: infoItems.slice(0, 3), x: PAD, w: CW, palette, font: f.body, glass: true, labelSize: rem(0.56), valueSize: rem(0.72) });
    const cardsTop = foot.top - 12 - (cards?.h || 0);

    const blocks = [
        textBlock({ text: subtitle || 'SPECIAL EVENT', x: PAD, w: CW, font: f.body, size: rem(0.75), weight: '800', letterSpacing: 3, fill: palette.secondary, upper: true, mb: 10, key: 'sub' }),
        titleBlock({ text: title || 'EVENT TITLE', x: PAD, w: CW * 0.92, font: titleFont, weight: '800', maxSize: (title || '').length > 22 ? 43 : 58, minSize: 24, maxLines: 4, lineHeight: 0.98, letterSpacing: -2, palette, mb: 12 }),
        { h: 4, mb: 14, key: 'bar', render: (y) => <Rect x={PAD} y={y} width={76} height={4} cornerRadius={3} fill={palette.primary} /> },
        textBlock({ text: description, x: PAD, w: 410, font: f.body, size: rem(0.82), lineHeight: 1.5, fill: palette.muted, mb: 12, key: 'desc', maxLines: 7 }),
    ];
    const body = stackCentered(blocks, PAD + 38 + 40, cardsTop - 40);

    return (
        <Group listening={false}>
            <LogoBar x={PAD} y={PAD - 2} h={38} collegeLogo={collegeLogo} eventLogo={eventBrandLogo} tint={palette.darkContent ? "#ffffff" : palette.text} />
            <Txt text={(organizer || 'PRESENTS').toUpperCase()} x={W - PAD - 260} y={PAD + 12} width={260} align="right" fontSize={10} fontFamily={f.body} fontStyle="800" letterSpacing={2} fill={palette.secondary} wrap="none" />
            {body.nodes}
            {extraItems.length > 0 && (
                <Group x={W - PAD - 160} y={cardsTop - 36}>
                    <Rect width={160} height={26} cornerRadius={13} fill={palette.primary} />
                    <Txt text={String(extraItems[0].label).toUpperCase()} y={8} width={160} align="center" fontSize={10} fontFamily={f.body} fontStyle="800" letterSpacing={1} fill="#fff" wrap="none" />
                </Group>
            )}
            {cards && cards.render(cardsTop)}
            {foot.node}
            {qr1 && <QrBlock x={W - PAD - 92} y={PAD + 40} size={72} qr={qr1} palette={palette} />}
            {qr2 && <QrBlock x={W - PAD - 92 - 92} y={PAD + 40} size={72} qr={qr2} palette={palette} />}
        </Group>
    );
};

export default EventCards;
