// Shapes an image / speaker photo can be cut into, and the border styles drawn around them.
// Pure path builders: each takes a canvas-like context (moveTo / lineTo / arc / bezierCurveTo / closePath),
// so they work for Konva clip functions, border strokes and tests alike. Coordinates are 0..w, 0..h.

export const MASKS = [
    ['none', 'Rectangle'], ['rounded', 'Rounded'], ['pill', 'Pill'], ['circle', 'Circle'], ['arch', 'Arch'],
    ['hexagon', 'Hexagon'], ['diamond', 'Diamond'], ['triangle', 'Triangle'], ['star', 'Star'], ['heart', 'Heart'],
];

export const BORDERS = [
    ['none', 'None'], ['solid', 'Solid'], ['dashed', 'Dashed'], ['dotted', 'Dotted'], ['double', 'Double'],
    ['glow', 'Glow'], ['shadow', 'Shadow'], ['polaroid', 'Photo frame'],
];

// speaker photos used capitalised names before masks existed
const LEGACY = { Circle: 'circle', Square: 'none', Hexagon: 'hexagon', Diamond: 'diamond' };
export const maskOf = (shape) => LEGACY[shape] || shape || 'none';

const K = 0.5523; // bezier circle constant

const polygon = (pts, w, h) => (ctx) => {
    pts.forEach(([a, b], i) => (i ? ctx.lineTo(a * w, b * h) : ctx.moveTo(a * w, b * h)));
    ctx.closePath();
};

const rounded = (w, h, r) => (ctx) => {
    const rr = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.moveTo(rr, 0);
    ctx.lineTo(w - rr, 0);
    ctx.arc(w - rr, rr, rr, -Math.PI / 2, 0);
    ctx.lineTo(w, h - rr);
    ctx.arc(w - rr, h - rr, rr, 0, Math.PI / 2);
    ctx.lineTo(rr, h);
    ctx.arc(rr, h - rr, rr, Math.PI / 2, Math.PI);
    ctx.lineTo(0, rr);
    ctx.arc(rr, rr, rr, Math.PI, Math.PI * 1.5);
    ctx.closePath();
};

/** Path for a mask shape filling the w x h box. `radius` is only used by "rounded". */
export const maskPath = (mask, w, h, radius = 24) => (ctx) => {
    switch (mask) {
        case 'rounded': return rounded(w, h, radius)(ctx);
        case 'pill': return rounded(w, h, Math.min(w, h) / 2)(ctx);
        case 'circle': {
            const rx = w / 2; const ry = h / 2;
            ctx.moveTo(w, ry);
            ctx.bezierCurveTo(w, ry + ry * K, rx + rx * K, h, rx, h);
            ctx.bezierCurveTo(rx - rx * K, h, 0, ry + ry * K, 0, ry);
            ctx.bezierCurveTo(0, ry - ry * K, rx - rx * K, 0, rx, 0);
            ctx.bezierCurveTo(rx + rx * K, 0, w, ry - ry * K, w, ry);
            return ctx.closePath();
        }
        case 'arch': {
            const r = Math.min(w / 2, h);
            ctx.moveTo(0, h);
            ctx.lineTo(0, r);
            ctx.arc(w / 2, r, w / 2 > h ? h : w / 2, Math.PI, 0);
            ctx.lineTo(w, h);
            return ctx.closePath();
        }
        case 'hexagon': return polygon([[0.25, 0], [0.75, 0], [1, 0.5], [0.75, 1], [0.25, 1], [0, 0.5]], w, h)(ctx);
        case 'diamond': return polygon([[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]], w, h)(ctx);
        case 'triangle': return polygon([[0.5, 0], [1, 1], [0, 1]], w, h)(ctx);
        case 'star': {
            const pts = Array.from({ length: 10 }, (_, i) => {
                const a = -Math.PI / 2 + (i * Math.PI) / 5;
                const rad = i % 2 ? 0.45 : 1;
                return [0.5 + 0.5 * rad * Math.cos(a), 0.5 + 0.5 * rad * Math.sin(a)];
            });
            return polygon(pts, w, h)(ctx);
        }
        case 'heart':
            ctx.moveTo(w / 2, h * 0.95);
            ctx.bezierCurveTo(-0.02 * w, h * 0.6, 0.02 * w, 0, w / 2, h * 0.25);
            ctx.bezierCurveTo(0.98 * w, 0, 1.02 * w, h * 0.6, w / 2, h * 0.95);
            return ctx.closePath();
        default: // 'none' | 'rect'
            ctx.moveTo(0, 0);
            ctx.lineTo(w, 0);
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            return ctx.closePath();
    }
};

/** Inner picture box of the "photo frame" border: even padding with a thicker bottom, like an instant photo. */
export const frameBox = (w, h, thickness = 4) => {
    const pad = Math.max(6, Math.min(w, h) * 0.05 + thickness);
    return { x: pad, y: pad, w: Math.max(4, w - pad * 2), h: Math.max(4, h - pad * 2 - pad * 1.6) };
};
