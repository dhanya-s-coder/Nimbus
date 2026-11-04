import React from 'react';
import { Group, Rect, Line } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H, rem } from '../engine/constants';
import { darken, linear } from '../engine/color';
import { Txt, textHeight, LogoBar } from '../layers/ui';
import { stackCentered } from './stack';
import { titleBlock, textBlock } from './parts';
import { pickTitleFont, pickBodyFont, qrStrip, HoleShape, rrPath, extraLines, speakerRow } from './kit';
import { Editable } from '../engine/edit';

export const FONTS = ['Bebas Neue', 'Space Mono'];

const PAPER = '#f8f3e6';
const INK = '#14161f';

/** Ticket outline with half-circle notches cut into both edges at y = py. */
const ticketPath = (x, y, w, h, r, py, n) => (ctx) => {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
    ctx.lineTo(x + w, py - n);
    ctx.arc(x + w, py, n, -Math.PI / 2, Math.PI / 2, true);
    ctx.lineTo(x + w, y + h - r);
    ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
    ctx.lineTo(x + r, y + h);
    ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
    ctx.lineTo(x, py + n);
    ctx.arc(x, py, n, Math.PI / 2, -Math.PI / 2, true);
    ctx.lineTo(x, y + r);
    ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
    ctx.closePath();
};

const seedOf = (s) => String(s || 'nimbus').split('').reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Decorative barcode, deterministic per title. */
const Barcode = ({ x, y, w, h, seed }) => {
    const bars = [];
    let cx = 0;
    let s = seed;
    while (cx < w - 3) {
        s = (s * 1103515245 + 12345) >>> 0;
        const bw = 1 + (s % 3);
        const gap = 1 + ((s >> 3) % 3);
        bars.push(<Rect key={cx} x={cx} width={bw} height={h} fill={INK} />);
        cx += bw + gap;
    }
    return <Group x={x} y={y} listening={false}>{bars}</Group>;
};

/** "Admit one" ticket floating over the artwork: photo window up top, details below, perforated QR stub. */
const TicketPass = ({ data, palette }) => {
    const tf = pickTitleFont(palette, 'Bebas Neue');
    const bf = pickBodyFont(palette, 'Space Mono');
    const { title, subtitle, organizer, description, infoItems = [], extraItems = [], collegeLogo, eventBrandLogo, qr1, qr2, footer } = data;
    const accent = darken(palette.primary, 0.28);

    const tx = 30;
    const ty = 30;
    const tw = W - 60;
    const th = H - 60;
    const r = 20;
    const n = 15;

    const qr = qrStrip({ qr1, qr2, x: 0, y: 0, size: 54, gap: 10, palette: { ...palette, muted: 'rgba(20,22,31,0.7)', text: INK }, labelSize: 6 });
    const stubH = Math.max(112, qr.h + 40);
    const py = ty + th - stubH;

    const winX = tx + 14;
    const winY = ty + 14;
    const winW = tw - 28;
    const winH = Math.max(190, Math.min(Math.round(th * (H >= 900 ? 0.56 : 0.47)), py - winY - 190));
    const winBottom = winY + winH;

    // ── details between the window and the perforation ─────────────────────────
    const cols = infoItems.length || 1;
    const colW = (tw - 40) / cols;
    const valS = rem(0.82);
    const vH = infoItems.length ? Math.max(...infoItems.map((it) => textHeight(it.value, { width: colW - 12, fontSize: valS, fontFamily: bf, fontStyle: '700', lineHeight: 1.15 }))) : 0;
    const infoH = infoItems.length ? rem(0.46) * 1.2 + 4 + vH : 0;
    const body = stackCentered([
        subtitle && textBlock({ text: subtitle, x: tx + 22, w: tw - 44, font: bf, size: rem(0.8), weight: '700', align: 'left', fill: accent, mb: 8, key: 'sub', maxLines: 2 }),
        description && textBlock({ text: description, x: tx + 22, w: tw - 44, font: bf, size: rem(0.66), lineHeight: 1.5, fill: INK, mb: 10, key: 'desc', maxLines: 3 }),
        (() => { const rr = extraLines({ items: extraItems, x: tx + 22, w: tw - 44, bodyFont: bf, ink: INK, size: rem(0.58), max: 2 }); return rr && { h: rr.h, mb: 10, key: 'extra', render: rr.render }; })(),
        infoItems.length > 0 && { h: infoH, mb: 0, key: 'info', render: (y) => (
            <Group x={tx + 20} y={y} listening={false}>
                {infoItems.map((it, i) => (
                    <Group key={i} x={i * colW}>
                        {i > 0 && <Line points={[-6, 0, -6, infoH]} stroke={INK} strokeWidth={1} opacity={0.18} />}
                        <Txt text={String(it.label).toUpperCase()} x={i ? 4 : 2} width={colW - 12} fontSize={rem(0.46)} fontFamily={bf} fontStyle="700" letterSpacing={2} fill={accent} />
                        <Txt text={it.value} x={i ? 4 : 2} y={rem(0.46) * 1.2 + 4} width={colW - 12} fontSize={valS} fontFamily={bf} fontStyle="700" lineHeight={1.15} fill={INK} />
                    </Group>
                ))}
            </Group>
        ) },
    ].filter(Boolean), winBottom + 14, py - 14);

    // ── title over the photo ───────────────────────────────────────────────────
    // the headline must fit the window under the chip/logo row, whatever the poster size
    const tryTitle = (s) => titleBlock({ text: title, x: winX + 18, w: winW - 36, font: tf, weight: palette.userTitleFont ? '800' : '400', maxSize: s, minSize: 20, maxLines: 3, align: 'left', lineHeight: 0.92, letterSpacing: 0.5, fill: '#ffffff', palette, mb: 0 });
    const tSize = [74, 64, 56, 48, 42, 36, 30, 26, 22].find((s) => (tryTitle(s)?.h ?? 0) <= winH - 100) ?? 22;
    const t = tryTitle(tSize);
    const titleY = winBottom - 16 - (t ? t.h : 0);
    const stubTop = py + 18;
    const seed = seedOf(title);

    return (
        <Group listening={false}>
            {/* dim everything outside the ticket */}
            <HoleShape fill="rgba(4,8,18,0.55)" paths={[(ctx) => ctx.rect(0, 0, W, H), ticketPath(tx, ty, tw, th, r, py, n)]} />
            {/* paper with a window onto the artwork */}
            <HoleShape fill={PAPER} shadowColor="#000000" shadowBlur={28} shadowOpacity={0.5} shadowOffsetY={8}
                paths={[ticketPath(tx, ty, tw, th, r, py, n), rrPath(winX, winY, winW, winH, 10)]} />
            {/* readability gradient inside the window */}
            <Rect x={winX} y={winY} width={winW} height={winH} cornerRadius={10} {...linear(0, 0, 0, winH, [[0, 'rgba(0,0,0,0.45)'], [0.35, 'rgba(0,0,0,0.0)'], [0.55, 'rgba(0,0,0,0.0)'], [1, 'rgba(0,0,0,0.82)']])} />

            {/* window top row */}
            <Group x={winX + 16} y={winY + 14}>
                <Rect width={86} height={20} cornerRadius={10} fill={palette.primary} />
                <Txt text="ADMIT ONE" x={0} y={5} width={86} align="center" fontSize={rem(0.5)} fontFamily={bf} fontStyle="700" letterSpacing={2} fill="#ffffff" />
            </Group>
            {infoItems[0] && (
                <Txt text={String(infoItems[0].value).toUpperCase()} x={winX + winW - 16 - 200} y={winY + 19} width={200} align="right" wrap="none" ellipsis fontSize={rem(0.55)} fontFamily={bf} fontStyle="700" letterSpacing={1.5} fill="#ffffff" />
            )}
            <LogoBar x={winX + 16} y={winY + 44} h={24} collegeLogo={collegeLogo} eventLogo={eventBrandLogo} align="left" width={winW} />
            {t && <Editable id="title">{t.render(titleY)}</Editable>}

            {body.nodes}

            {/* perforation */}
            <Line points={[tx + n + 6, py, tx + tw - n - 6, py]} stroke={INK} strokeWidth={1.5} dash={[5, 5]} opacity={0.45} />

            {/* stub */}
            {qr.node && <Group x={tx + 22} y={stubTop}>{qr.node}</Group>}
            {(() => {
                const sx = tx + 22 + (qr.w ? qr.w + 22 : 0);
                const sw = tx + tw - 22 - sx;
                const sp = speakerRow({ data, x: sx, w: sw, palette, titleFont: bf, bodyFont: bf, avatar: 40, ink: INK, soft: 'rgba(20,22,31,0.65)' });
                return (
                    <Group listening={false}>
                        {organizer && <Txt text={organizer.toUpperCase()} x={sx} y={stubTop} width={sw} wrap="none" ellipsis fontSize={rem(0.58)} fontFamily={bf} fontStyle="700" letterSpacing={2} fill={INK} />}
                        {sp ? <Group>{sp.render(stubTop + 20)}</Group> : (
                            <Txt text={footer || 'Present this pass at the entrance'} x={sx} y={stubTop + 20} width={sw} fontSize={rem(0.5)} fontFamily={bf} lineHeight={1.4} fill="rgba(20,22,31,0.6)" />
                        )}
                        {!sp && <Barcode x={sx} y={ty + th - 38} w={Math.min(sw, 230)} h={20} seed={seed} />}
                    </Group>
                );
            })()}
        </Group>
    );
};

export default TicketPass;
