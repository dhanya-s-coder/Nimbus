import React from 'react';
import { Group, Rect } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H, rem } from '../engine/constants';
import { clear } from '../engine/color';
import { fitFontSize, measureWidth, titleSizePx, truncate, titleScale } from '../engine/text';
import { Txt, textHeight, LogoBar, QrBlock, SpeakerAvatar, Card } from '../layers/ui';
import { GradBar } from '../layers/primitives';
import { stack } from './stack';

const PAD_X = 32;
const PAD_TOP = 28;
const PAD_BOTTOM = 20;
const CW = W - PAD_X * 2; // 536

/** Classic centered layout (ported from SkeletonCentered). Design space 600x750. */
const Centered = ({ data, palette }) => {
    const titleFont = palette.titleFonts?.[0] || 'Bebas Neue';
    const bodyFont = palette.bodyFont || 'DM Sans';
    const {
        title, subtitle, organizer, description, speakerName, speakerDesignation,
        infoItems = [], extraItems = [], collegeLogo, eventBrandLogo, speakerPhoto, speakerShape, qr1, qr2, footer,
    } = data;

    // ── top block: logos + organizer badge ──
    const logoH = 34;
    let topEnd = PAD_TOP + logoH + 8 + 16;
    let organizerNode = null;
    if (organizer) {
        const o = { fontSize: rem(0.62), fontFamily: bodyFont, fontStyle: '700', letterSpacing: 3 };
        const label = truncate(organizer, 50).toUpperCase();
        const tw = measureWidth(label, o);
        const pw = tw + 32;
        const ph = rem(0.62) * 1.2 + 10;
        organizerNode = (
            <Group x={PAD_X + CW * 0.06} y={PAD_TOP + logoH + 8 + 16} listening={false}>
                <Rect
                    width={pw} height={ph} cornerRadius={20}
                    fillLinearGradientStartPoint={{ x: 0, y: 0 }} fillLinearGradientEndPoint={{ x: pw, y: ph }}
                    fillLinearGradientColorStops={[0, `${palette.primary}25`, 1, `${palette.secondary}15`]}
                    stroke={`${palette.primary}40`} strokeWidth={1}
                />
                <Txt text={label} x={16} y={5} fontSize={o.fontSize} fontFamily={bodyFont} fontStyle="700" letterSpacing={3} fill={palette.accent} wrap="none" />
            </Group>
        );
        topEnd += ph + 14;
    }

    // ── bottom block (anchored): info cards + footer ──
    const footerStyle = { fontSize: rem(0.48), fontFamily: bodyFont, letterSpacing: 0.5, lineHeight: 1.2 };
    const footerText = footer || 'For more information, visit our website or contact the coordinator.';
    const footerH = textHeight(footerText, { ...footerStyle, width: CW });
    const footerBlockH = 1 + 8 + footerH;
    const footerTop = H - PAD_BOTTOM - footerBlockH;

    let cardsH = 0;
    let cardsNode = null;
    if (infoItems.length) {
        const lab = rem(0.48);
        const val = rem(0.76);
        cardsH = 12 + lab * 1.2 + 4 + val * 1.2 + 12;
        const gap = 8;
        const cw = (CW - gap * (infoItems.length - 1)) / infoItems.length;
        const cardsY = footerTop - 12 - cardsH;
        cardsNode = (
            <Group listening={false}>
                {infoItems.map((item, i) => {
                    const cx = PAD_X + i * (cw + gap);
                    return (
                        <Card key={i} x={cx} y={cardsY} width={cw} height={cardsH} radius={10}
                            gradient={{ x1: 0, y1: 0, x2: cw, y2: cardsH, stops: [[0, `${palette.primary}18`], [1, `${palette.bgMid}40`]] }}
                            stroke={`${palette.primary}40`}>
                            <GradBar x={cw * 0.2} y={0} w={cw * 0.6} h={1}
                                stops={[[0, clear(palette.primary)], [0.5, `${palette.primary}60`], [1, clear(palette.primary)]]} />
                            <Txt text={String(item.label).toUpperCase()} x={8} y={12} width={cw - 16} align="center"
                                fontSize={lab} fontFamily={bodyFont} fontStyle="700" letterSpacing={1.5} fill={palette.secondary} />
                            <Txt text={item.value} x={8} y={12 + lab * 1.2 + 4} width={cw - 16} align="center"
                                fontSize={val} fontFamily={bodyFont} fontStyle="700" fill={palette.text} />
                        </Card>
                    );
                })}
            </Group>
        );
    }
    const bottomTop = cardsNode ? footerTop - 12 - cardsH : footerTop;

    // ── middle block: centered between top and bottom ──
    const dividerBlock = { h: 2, key: 'div', mb: 14, render: (y) => (
        <GradBar x={W / 2 - 40} y={y} w={80} h={2} stops={[[0, clear(palette.primary)], [0.35, palette.primary], [0.65, palette.secondary], [1, clear(palette.secondary)]]} />
    ) };
    const blocks = [];

    if (speakerPhoto) {
        const av = 222;
        const rowW = CW * 0.88;
        const tx = PAD_X + (CW - rowW) / 2 + av + 18;
        const tw = rowW - av - 18;
        const tSize = fitFontSize((title || '').toUpperCase(), { width: tw, maxSize: titleSizePx((title || '').length) * 0.8 * (palette.textScale || 1), minSize: 14, maxLines: 5, fontFamily: titleFont, fontStyle: '800', lineHeight: 1, letterSpacing: -0.5 });
        const tH = title ? textHeight((title || '').toUpperCase(), { width: tw, fontSize: tSize, fontFamily: titleFont, fontStyle: '800', lineHeight: 1, letterSpacing: -0.5 }) : 0;
        const nameH = speakerName ? rem(0.9) * 1.2 + (speakerDesignation ? 3 + rem(0.6) * 1.2 : 0) : 0;
        const colH = tH + (title && speakerName ? 8 : 0) + nameH;
        const rowH = Math.max(av, colH);
        blocks.push({ h: rowH, mb: 14, key: 'speaker', render: (y) => (
            <Group>
                <SpeakerAvatar x={PAD_X + (CW - rowW) / 2} y={y + (rowH - av) / 2} size={av} shape={speakerShape || 'Circle'} src={speakerPhoto} palette={palette} />
                {title && <Txt text={title.toUpperCase()} x={tx} y={y + (rowH - colH) / 2} width={tw} fontSize={tSize} fontFamily={titleFont} fontStyle="800" lineHeight={1} letterSpacing={-0.5}
                    fill={palette.text} shadowColor={palette.primary} shadowBlur={20} shadowOpacity={0.25} shadowOffsetY={2} />}
                {speakerName && <Txt text={speakerName} x={tx} y={y + (rowH - colH) / 2 + tH + (title ? 8 : 0)} width={tw} fontSize={rem(0.9)} fontFamily={bodyFont} fontStyle="700" fill={palette.text} />}
                {speakerName && speakerDesignation && <Txt text={speakerDesignation} x={tx} y={y + (rowH - colH) / 2 + tH + (title ? 8 : 0) + rem(0.9) * 1.2 + 3} width={tw} fontSize={rem(0.6)} fontFamily={bodyFont} fill={palette.muted} />}
            </Group>
        ) });
    } else if (title) {
        const up = title.toUpperCase();
        const size = fitFontSize(up, { width: CW, maxSize: titleSizePx(title.length) * titleScale(titleFont) * (palette.textScale || 1), minSize: 16, maxLines: 3, fontFamily: titleFont, fontStyle: '800', lineHeight: 1, letterSpacing: -0.5 });
        const h = textHeight(up, { width: CW, fontSize: size, fontFamily: titleFont, fontStyle: '800', lineHeight: 1, letterSpacing: -0.5 });
        blocks.push({ h, mb: 10, key: 'title', render: (y) => (
            <Txt text={up} x={PAD_X} y={y} width={CW} align="center" fontSize={size} fontFamily={titleFont} fontStyle="800" lineHeight={1} letterSpacing={-0.5}
                fill={palette.text} shadowColor={palette.primary} shadowBlur={20} shadowOpacity={0.3} shadowOffsetY={2} />
        ) });
    }

    if (subtitle) {
        const t = truncate(subtitle).toUpperCase();
        const st = { width: CW, fontSize: rem(0.78), fontFamily: bodyFont, fontStyle: '600', letterSpacing: 2 };
        blocks.push({ h: textHeight(t, st), mb: 10, key: 'sub', render: (y) => (
            <Txt text={t} x={PAD_X} y={y} {...st} align="center" fill={palette.secondary} />
        ) });
    }
    if (!speakerPhoto && speakerName) {
        const mb = speakerDesignation ? 2 : 10;
        blocks.push({ h: rem(0.9) * 1.2, mb, key: 'spk', render: (y) => (
            <Txt text={speakerName} x={PAD_X} y={y} width={CW} align="center" fontSize={rem(0.9)} fontFamily={bodyFont} fontStyle="700" fill={palette.text} />
        ) });
    }
    if (!speakerPhoto && speakerDesignation && !subtitle) {
        const st = { width: CW, fontSize: rem(0.68), fontFamily: bodyFont };
        blocks.push({ h: textHeight(speakerDesignation, st), mb: 10, key: 'des', render: (y) => (
            <Txt text={speakerDesignation} x={PAD_X} y={y} {...st} align="center" fill={palette.muted} />
        ) });
    }
    blocks.push(dividerBlock);
    blocks[blocks.length - 1].mb = 14;

    if (description) {
        const dw = CW * 0.88;
        const st = { width: dw, fontSize: rem(0.7), fontFamily: bodyFont, lineHeight: 1.7 };
        blocks.push({ h: textHeight(description, st), mb: 12, key: 'desc', render: (y) => (
            <Txt text={description} x={PAD_X + (CW - dw) / 2} y={y} {...st} align="justify" fill={palette.muted} />
        ) });
    }
    if (extraItems.length) {
        const ew = CW * 0.88;
        const fs = rem(0.62);
        const rows = extraItems.map((item) => {
            const value = truncate(typeof item.value === 'string' ? item.value : (item.value || []).join(', '), 80);
            return { label: `${item.label}:`, value };
        });
        const rowH = fs * 1.2 + 8;
        const totalH = rows.length * rowH + (rows.length - 1) * 5;
        blocks.push({ h: totalH, mb: 12, key: 'extra', render: (y) => (
            <Group>
                {rows.map((r, i) => {
                    const ry = y + i * (rowH + 5);
                    const lw = measureWidth(r.label, { fontSize: fs, fontFamily: bodyFont, fontStyle: '700' });
                    const vw = measureWidth(r.value, { fontSize: fs, fontFamily: bodyFont });
                    const startX = PAD_X + (CW - ew) / 2 + Math.max(12, (ew - (lw + 6 + vw)) / 2);
                    return (
                        <Group key={i}>
                            <Card x={PAD_X + (CW - ew) / 2} y={ry} width={ew} height={rowH} radius={6}
                                gradient={{ x1: 0, y1: 0, x2: ew, y2: rowH, stops: [[0, `${palette.primary}12`], [1, `${palette.secondary}08`]] }}
                                stroke={palette.divider} />
                            <Txt text={r.label} x={startX} y={ry + 4} fontSize={fs} fontFamily={bodyFont} fontStyle="700" fill={palette.secondary} wrap="none" />
                            <Txt text={r.value} x={startX + lw + 6} y={ry + 4} fontSize={fs} fontFamily={bodyFont} fill={palette.muted} wrap="none" />
                        </Group>
                    );
                })}
            </Group>
        ) });
    }

    const midH = blocks.reduce((n, b) => n + b.h + (b.mb || 0), 0) - (blocks[blocks.length - 1]?.mb || 0);
    const avail = bottomTop - topEnd;
    const midY = topEnd + Math.max(0, (avail - midH) / 2);
    const mid = stack(blocks, midY);

    return (
        <Group listening={false}>
            <LogoBar x={PAD_X} y={PAD_TOP} h={logoH} collegeLogo={collegeLogo} eventLogo={eventBrandLogo} tint={palette.darkContent ? "#ffffff" : palette.text} />
            {organizerNode}
            {mid.nodes}
            {cardsNode}
            {/* footer */}
            <Rect x={PAD_X} y={footerTop} width={CW} height={1} fill={palette.divider} opacity={0.6} />
            <Txt text={footerText} x={PAD_X} y={footerTop + 9} width={CW} align="center" opacity={0.6} fill={palette.muted} {...footerStyle} />
            {qr1 && <QrBlock x={W - PAD_X - 100} y={PAD_TOP} size={80} qr={qr1} palette={palette} />}
            {qr2 && <QrBlock x={W - PAD_X - 100 - 100} y={PAD_TOP} size={80} qr={qr2} palette={palette} />}
        </Group>
    );
};

export default Centered;
