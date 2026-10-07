import React from 'react';

/**
 * Minimal vertical stacking (replaces CSS flex columns).
 * blocks: [{ h, mb?, render: (y) => element }]  ->  { nodes, height }
 */
export const stack = (blocks, startY = 0) => {
    let y = startY;
    const nodes = [];
    blocks.filter(Boolean).forEach((b, i) => {
        nodes.push(React.cloneElement(b.render(y), { key: b.key ?? i }));
        y += b.h + (b.mb || 0);
    });
    return { nodes, height: Math.max(0, y - startY) };
};

/** Stack blocks and centre the whole group vertically inside [top, bottom]. */
export const stackCentered = (blocks, top, bottom) => {
    const bs = blocks.filter(Boolean);
    if (!bs.length) return { nodes: [], height: 0, y: top };
    const total = bs.reduce((n, b) => n + b.h + (b.mb || 0), 0) - (bs[bs.length - 1].mb || 0);
    const y = top + Math.max(0, (bottom - top - total) / 2);
    return { ...stack(bs, y), y };
};
