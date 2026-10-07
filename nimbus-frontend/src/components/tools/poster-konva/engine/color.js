/** '#rrggbb' + alpha(0..1) -> '#rrggbbaa'. Non-hex colours are returned unchanged. */
export const alpha = (color, a) => {
    if (typeof color === 'string' && /^#[0-9a-f]{6}/i.test(color)) {
        const v = Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');
        return color.slice(0, 7) + v;
    }
    return color;
};

/** Same colour, fully transparent (avoids dark fringes when fading to "transparent"). */
export const clear = (color) => {
    if (typeof color === 'string' && /^#[0-9a-f]{6}/i.test(color)) return color.slice(0, 7) + '00';
    const m = /^rgba?\(([^)]+)\)/.exec(color || '');
    if (m) {
        const [r, g, b] = m[1].split(',').map((s) => s.trim());
        return `rgba(${r},${g},${b},0)`;
    }
    return 'rgba(0,0,0,0)';
};

/** Convert a CSS linear-gradient string into Konva props for a w x h box. */
export const cssLinearGradient = (css, w, h) => {
    const m = /linear-gradient\(\s*([\d.]+)deg\s*,\s*(.+)\)\s*$/i.exec(css || '');
    if (!m) return null;
    const angle = (parseFloat(m[1]) * Math.PI) / 180;
    const stops = m[2].split(/,(?![^(]*\))/).map((s) => s.trim());
    const colorStops = [];
    stops.forEach((s, i) => {
        const sm = /^(.*?)(?:\s+([\d.]+)%)?$/.exec(s);
        const pos = sm[2] !== undefined ? parseFloat(sm[2]) / 100 : i / Math.max(1, stops.length - 1);
        colorStops.push(pos, sm[1]);
    });
    const dx = Math.sin(angle);
    const dy = -Math.cos(angle);
    const len = Math.abs(w * dx) + Math.abs(h * dy);
    const cx = w / 2;
    const cy = h / 2;
    return {
        fillLinearGradientStartPoint: { x: cx - (dx * len) / 2, y: cy - (dy * len) / 2 },
        fillLinearGradientEndPoint: { x: cx + (dx * len) / 2, y: cy + (dy * len) / 2 },
        fillLinearGradientColorStops: colorStops,
    };
};

/** Linear gradient props from two points + stops [[pos,color],...]. */
export const linear = (x1, y1, x2, y2, stops) => ({
    fillLinearGradientStartPoint: { x: x1, y: y1 },
    fillLinearGradientEndPoint: { x: x2, y: y2 },
    fillLinearGradientColorStops: stops.flat(),
});

/** Mix a #rrggbb colour toward white by `amt` (0..1). */
export const lighten = (color, amt) => {
    if (!/^#[0-9a-f]{6}/i.test(color || '')) return color;
    const n = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
    const m = n.map((v) => Math.round(v + (255 - v) * amt));
    return `#${m.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

/** Mix a #rrggbb colour toward black by `amt` (0..1). */
export const darken = (color, amt) => {
    if (!/^#[0-9a-f]{6}/i.test(color || '')) return color;
    const n = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
    return `#${n.map((v) => Math.round(v * (1 - amt)).toString(16).padStart(2, '0')).join('')}`;
};

/**
 * Palette adapted for drawing text/lines. Text is white on dark backgrounds, near-black on light ones.
 * `forceDark` (from the AI photo's luminance) overrides the palette's own background; a light palette
 * flipped to dark gets lightened accents so they stay readable.
 */
export const contentPaletteFor = (palette, forceDark) => {
    const hex = String(palette.bg || '#111827').replace('#', '').slice(0, 6);
    const rgb = hex.length === 6 ? [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) : [17, 24, 39];
    const luma = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
    const paletteDark = luma < 0.65;
    const dark = typeof forceDark === 'boolean' ? forceDark : paletteDark;
    const flipped = dark && !paletteDark;
    return {
        ...palette,
        text: dark ? '#FFFFFF' : '#111827',
        muted: dark ? 'rgba(255,255,255,0.86)' : 'rgba(17,24,39,0.78)',
        accent: flipped ? lighten(palette.accent || '#ffffff', 0.7) : (!dark ? darken(palette.primary, 0.1) : (palette.accent || '#FFFFFF')),
        secondary: flipped ? lighten(palette.secondary, 0.55) : (!dark ? darken(palette.secondary, 0.3) : palette.secondary),
        primary: flipped ? lighten(palette.primary, 0.3) : palette.primary,
        darkContent: dark,
    };
};
