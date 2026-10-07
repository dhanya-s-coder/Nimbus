import React, { useEffect, useState } from 'react';
import { Group, Rect, Image as KImage } from 'react-konva';
import { DESIGN_W as W, DESIGN_H as H } from '../engine/constants';
import { linear, alpha } from '../engine/color';
import { RadialEllipse } from './primitives';

/**
 * Loads the AI background (CORS-safe) and bakes the CSS-equivalent colour filter
 * (saturate/contrast/brightness) into an offscreen canvas, cover-fitted to 4:5.
 * ctx.filter is unsupported on old Safari; there the image is simply drawn unfiltered.
 */
const useBakedBackground = (src, light, onReady) => {
    const [canvas, setCanvas] = useState(null);
    useEffect(() => {
        if (!src) { setCanvas(null); return undefined; }
        let cancelled = false;
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            if (cancelled) return;
            const outW = 1080;
            const outH = 1350;
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
            // average luminance (16x16 sample) drives light/dark text choice
            let luma = null;
            try {
                const t = document.createElement('canvas');
                t.width = 16; t.height = 16;
                const tctx = t.getContext('2d');
                tctx.drawImage(c, 0, 0, 16, 16);
                const d = tctx.getImageData(0, 0, 16, 16).data;
                let sum = 0;
                for (let i = 0; i < d.length; i += 4) sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
                luma = sum / (d.length / 4) / 255;
            } catch { /* tainted canvas: fall back to palette */ }
            setCanvas(c);
            onReady?.(luma);
        };
        img.onerror = () => { if (!cancelled) { console.error('Failed to load AI background:', src); setCanvas(null); onReady?.(null); } };
        img.src = src;
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src, light]);
    return canvas;
};

const AIBackground = ({ src, palette, overlayOpacity = 0.14, onReady }) => {
    const light = palette.isDark === false;
    const canvas = useBakedBackground(src, light, onReady);
    if (!canvas) return null;
    void overlayOpacity;
    return (
        <Group listening={false}>
            <KImage image={canvas} width={W} height={H} />
            {/* soft radial frame so edges stay readable */}
            <RadialEllipse
                cx={W * 0.5} cy={H * 0.4} rx={W * 0.75} ry={H * 0.7}
                stops={[[0.45, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.32)']]}
                opacity={light ? 0.16 : 0.38}
            />
            {/* top/bottom vignette — title and footer readability */}
            <Rect
                width={W} height={H}
                {...linear(0, 0, 0, H, light
                    ? [[0, 'rgba(0,0,0,0.22)'], [0.12, 'rgba(0,0,0,0.08)'], [0.28, 'rgba(0,0,0,0)'], [0.75, 'rgba(0,0,0,0)'], [0.88, 'rgba(0,0,0,0.12)'], [1, 'rgba(0,0,0,0.22)']]
                    : [[0, 'rgba(0,0,0,0.48)'], [0.12, 'rgba(0,0,0,0.20)'], [0.28, 'rgba(0,0,0,0)'], [0.75, 'rgba(0,0,0,0)'], [0.88, 'rgba(0,0,0,0.28)'], [1, 'rgba(0,0,0,0.48)']])}
            />
        </Group>
    );
};

export { alpha };
export default AIBackground;
