import Konva from 'konva';

/** Measure wrapped text height/lines without mounting anything. */
export const measureText = (text, { width, fontSize, fontFamily, fontStyle = '400', lineHeight = 1.2, letterSpacing = 0 }) => {
    const t = new Konva.Text({
        text: String(text ?? ''), width, fontSize, fontFamily, fontStyle, lineHeight, letterSpacing, wrap: 'word',
    });
    const height = t.height();
    const lines = t.textArr.length;
    t.destroy();
    return { height, lines };
};

/**
 * Largest font size in [minSize, maxSize] such that text wraps into <= maxLines
 * lines and fits maxHeight (when given). Binary search, 0.5px resolution.
 */
export const fitFontSize = (text, { width, maxSize, minSize = 10, maxLines = Infinity, maxHeight = Infinity, ...rest }) => {
    let lo = minSize;
    let hi = maxSize;
    const words = String(text ?? '').split(/\s+/).filter(Boolean);
    const ok = (size) => {
        // never let a single word be wider than the box (Konva would break it mid-word)
        for (const w of words) {
            if (measureWidth(w, { fontSize: size, fontFamily: rest.fontFamily, fontStyle: rest.fontStyle, letterSpacing: rest.letterSpacing }) > width) return false;
        }
        const m = measureText(text, { width, fontSize: size, ...rest });
        return m.lines <= maxLines && m.height <= maxHeight;
    };
    if (ok(hi)) return hi;
    while (hi - lo > 0.5) {
        const mid = (lo + hi) / 2;
        if (ok(mid)) lo = mid; else hi = mid;
    }
    return lo;
};

export const truncate = (text, maxLen = 120) => {
    if (!text || text.length <= maxLen) return text;
    return text.substring(0, maxLen).trim() + '…';
};

export const titleSizePx = (length) => {
    if (!length) return 51.2;
    if (length > 50) return 22.4;
    if (length > 40) return 27.2;
    if (length > 30) return 32;
    if (length > 22) return 40;
    if (length > 15) return 48;
    if (length > 10) return 56;
    return 64;
};

/** Single-line natural width of a string. */
export const measureWidth = (text, { fontSize, fontFamily, fontStyle = '400', letterSpacing = 0 }) => {
    const t = new Konva.Text({ text: String(text ?? ''), fontSize, fontFamily, fontStyle, letterSpacing });
    const w = t.width();
    t.destroy();
    return w;
};

/** Condensed display faces look smaller at the same px size; compensate so titles have equal visual weight. */
const TITLE_SCALE = { 'Bebas Neue': 1.35, Oswald: 1.2, Orbitron: 0.92 };
export const titleScale = (font) => TITLE_SCALE[font] || 1;
