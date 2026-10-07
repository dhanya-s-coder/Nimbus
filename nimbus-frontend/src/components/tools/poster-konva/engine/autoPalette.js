/**
 * Build a palette that matches the AI photo ("Match photo"). We take the two strongest hues in the
 * image (weighted by saturation x brightness) and derive tuned, high-contrast colours from them.
 */

const hslToHex = (h, s, l) => {
    const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
    const f = (n) => {
        const k = (n + h / 30) % 12;
        const c = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * c).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
};

/** Returns up to two dominant hues (0..360) from a canvas, or null when the image is basically grey. */
export const dominantHues = (canvas) => {
    try {
        const t = document.createElement('canvas');
        t.width = 32; t.height = 32;
        const ctx = t.getContext('2d');
        ctx.drawImage(canvas, 0, 0, 32, 32);
        const d = ctx.getImageData(0, 0, 32, 32).data;
        const bins = new Array(36).fill(0);
        for (let i = 0; i < d.length; i += 4) {
            const r = d[i] / 255; const g = d[i + 1] / 255; const b = d[i + 2] / 255;
            const max = Math.max(r, g, b); const min = Math.min(r, g, b);
            const v = max; const sat = max === 0 ? 0 : (max - min) / max;
            if (sat < 0.25 || v < 0.2) continue; // ignore greys / near-black
            let h;
            const dlt = max - min;
            if (max === r) h = ((g - b) / dlt) % 6; else if (max === g) h = (b - r) / dlt + 2; else h = (r - g) / dlt + 4;
            h = (h * 60 + 360) % 360;
            bins[Math.floor(h / 10) % 36] += sat * v;
        }
        const total = bins.reduce((n, x) => n + x, 0);
        if (total < 1) return null;
        const first = bins.indexOf(Math.max(...bins));
        // second hue: strongest bin at least 60deg away from the first
        let second = -1; let best = 0;
        bins.forEach((w, i) => {
            const dist = Math.min(Math.abs(i - first), 36 - Math.abs(i - first));
            if (dist >= 6 && w > best) { best = w; second = i; }
        });
        const h1 = first * 10 + 5;
        const h2 = second >= 0 && best > bins[first] * 0.25 ? second * 10 + 5 : (h1 + 40) % 360;
        return [h1, h2];
    } catch {
        return null; // tainted canvas
    }
};

/** Palette object compatible with skins/palettes entries. */
export const buildAutoPalette = (hues, { titleFonts = ['Montserrat', 'Outfit'], bodyFont = 'Inter' } = {}) => {
    const [h1, h2] = hues || [215, 255];
    return {
        id: 'auto',
        name: 'Match photo',
        isDark: true,
        primary: hslToHex(h1, 85, 58),
        secondary: hslToHex(h2, 80, 68),
        accent: hslToHex(h1, 70, 86),
        bg: hslToHex(h1, 45, 7),
        bgMid: hslToHex(h1, 40, 14),
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.8)',
        divider: `${hslToHex(h1, 85, 58)}66`,
        gradient: `linear-gradient(145deg, ${hslToHex(h1, 45, 7)} 0%, ${hslToHex(h1, 40, 14)} 45%, ${hslToHex(h2, 40, 22)} 100%)`,
        titleFonts,
        bodyFont,
    };
};

const hexToHsl = (hex) => {
    const n = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const max = Math.max(...n); const min = Math.min(...n);
    const l = (max + min) / 2;
    const d = max - min;
    if (!d) return [0, 0, l * 100];
    const sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    if (max === n[0]) h = ((n[1] - n[2]) / d) % 6; else if (max === n[1]) h = (n[2] - n[0]) / d + 2; else h = (n[0] - n[1]) / d + 4;
    return [(h * 60 + 360) % 360, sat * 100, l * 100];
};

/**
 * Palette from 1-3 brand/theme hex colours (from the knowledge base or the user's style notes).
 * Brand hues are kept, but lightness is tuned so text and accents stay readable on a dark poster.
 */
export const buildBrandPalette = (colors = [], { titleFonts = ['Montserrat', 'Outfit'], bodyFont = 'Inter' } = {}) => {
    const list = colors.filter((c) => /^#[0-9a-f]{6}$/i.test(c));
    const [h1, s1] = hexToHsl(list[0] || '#2563eb');
    const second = list[1] ? hexToHsl(list[1]) : [(h1 + 35) % 360, s1, 60];
    const sat1 = Math.max(55, Math.min(90, s1 || 70));
    const sat2 = Math.max(50, Math.min(90, second[1] || 70));
    const primary = hslToHex(h1, sat1, 58);
    const secondary = hslToHex(second[0], sat2, 68);
    return {
        id: 'brand',
        name: 'Brand colours',
        isDark: true,
        primary,
        secondary,
        accent: hslToHex(second[0], Math.min(70, sat2), 86),
        bg: hslToHex(h1, Math.min(55, sat1), 8),
        bgMid: hslToHex(h1, Math.min(50, sat1), 15),
        text: '#ffffff',
        muted: 'rgba(255,255,255,0.8)',
        divider: `${primary}66`,
        gradient: `linear-gradient(145deg, ${hslToHex(h1, Math.min(55, sat1), 8)} 0%, ${hslToHex(h1, Math.min(50, sat1), 15)} 45%, ${hslToHex(second[0], Math.min(50, sat2), 24)} 100%)`,
        titleFonts,
        bodyFont,
    };
};
