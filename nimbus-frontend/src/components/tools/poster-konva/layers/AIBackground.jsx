import React, { useEffect, useState } from 'react';
import { Group, Rect, Image as KImage } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H } from '../engine/constants';
import { linear } from '../engine/color';
import { dominantHues } from '../engine/autoPalette';
import { RadialEllipse } from './primitives';

/**
 * Loads the photo (CORS-safe) and bakes the CSS-equivalent colour filter into an offscreen canvas,
 * cover-fitted to the poster. Also measures average luminance + dominant hues. Results are cached
 * (thumbnails and the main preview share one bake) and kept per (src, light, height).
 */
const cache = new Map();

const bake = (src, light, outH) =>
    new Promise((resolve) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const outW = 1080;
            const c = document.createElement('canvas');
            c.width = outW;
            c.height = outH;
            const ctx = c.getContext('2d');
            const scale = Math.max(outW / img.width, outH / img.height);
            const dw = img.width * scale;
            const dh = img.height * scale;
            ctx.imageSmoothingQuality = 'high';
            if ('filter' in ctx) ctx.filter = `saturate(${light ? 1.05 : 0.85}) contrast(1.05) brightness(${light ? 1 : 0.92})`;
            ctx.drawImage(img, (outW - dw) / 2, (outH - dh) / 2, dw, dh);
            let luma = null;
            let hues = null;
            try {
                const t = document.createElement('canvas');
                t.width = 16; t.height = 16;
                const tctx = t.getContext('2d');
                tctx.drawImage(c, 0, 0, 16, 16);
                const d = tctx.getImageData(0, 0, 16, 16).data;
                let sum = 0;
                for (let i = 0; i < d.length; i += 4) sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
                luma = sum / (d.length / 4) / 255;
                hues = dominantHues(c);
            } catch { /* tainted canvas: fall back to palette */ }
            resolve({ canvas: c, luma, hues, scale, srcW: img.width, srcH: img.height });
        };
        img.onerror = () => { console.error('Failed to load AI background:', src); resolve(null); };
        img.src = src;
    });

const getBaked = (src, light, h) => {
    const outH = Math.round((1080 * h) / 600);
    const key = `${src}|${light ? 1 : 0}|${outH}`;
    if (!cache.has(key)) cache.set(key, bake(src, light, outH));
    return cache.get(key);
};

const useBakedBackground = (src, light, h, onReady) => {
    const [baked, setBaked] = useState(null);
    useEffect(() => {
        if (!src) { setBaked(null); return undefined; }
        let cancelled = false;
        getBaked(src, light, h).then((b) => {
            if (cancelled) return;
            setBaked(b);
            onReady?.(b ? { luma: b.luma, hues: b.hues } : null);
        });
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src, light, h]);
    return baked;
};

/** `strength` (0..1.5) scales the darkening vignettes (the "photo darkness" slider). */
const AIBackground = ({ src, palette, onReady, strength = 1 }) => {
    const light = palette.isDark === false;
    const baked = useBakedBackground(src, light, H, onReady);
    if (!baked) return null;
    const s = Math.min(1.5, Math.max(0, strength));
    const a = (v) => Math.min(1, v * s);
    return (
        <Group listening={false}>
            <KImage image={baked.canvas} width={W} height={H} />
            <RadialEllipse
                cx={W * 0.5} cy={H * 0.4} rx={W * 0.75} ry={H * 0.7}
                stops={[[0.45, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${a(0.32)})`]]}
                opacity={light ? 0.16 : 0.38}
            />
            <Rect
                width={W} height={H}
                {...linear(0, 0, 0, H, light
                    ? [[0, `rgba(0,0,0,${a(0.22)})`], [0.12, `rgba(0,0,0,${a(0.08)})`], [0.28, 'rgba(0,0,0,0)'], [0.75, 'rgba(0,0,0,0)'], [0.88, `rgba(0,0,0,${a(0.12)})`], [1, `rgba(0,0,0,${a(0.22)})`]]
                    : [[0, `rgba(0,0,0,${a(0.48)})`], [0.12, `rgba(0,0,0,${a(0.20)})`], [0.28, 'rgba(0,0,0,0)'], [0.75, 'rgba(0,0,0,0)'], [0.88, `rgba(0,0,0,${a(0.28)})`], [1, `rgba(0,0,0,${a(0.48)})`]])}
            />
        </Group>
    );
};

export default AIBackground;
