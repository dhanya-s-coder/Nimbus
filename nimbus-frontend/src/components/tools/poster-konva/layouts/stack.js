import React from 'react';
import { Editable } from '../engine/edit';

/**
 * Minimal vertical stacking (replaces CSS flex columns).
 * blocks: [{ h, mb?, render: (y) => element }]  ->  { nodes, height }
 */
export const stack = (blocks, startY = 0) => {
    let y = startY;
    const nodes = [];
    blocks.filter(Boolean).forEach((b, i) => {
        const id = b.key ?? `b${i}`;
        nodes.push(React.createElement(Editable, { id, key: id }, b.render(y)));
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
