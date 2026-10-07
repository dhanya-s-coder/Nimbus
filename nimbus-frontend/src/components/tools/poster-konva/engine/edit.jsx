import React, { createContext, useContext, useLayoutEffect, useRef, useState } from 'react';
import { Group, Rect } from 'react-konva';

/**
 * Direct-manipulation layer. Every movable poster element is wrapped in <Editable id="...">.
 * Overrides (per id) are { x, y, sx, sy, hidden } = the Konva node's own translation/scale and are
 * saved with the poster. When `editing` is false this is a plain pass-through that only applies them.
 */
export const EditContext = createContext({
    editing: false,
    overrides: {},
    selectedId: null,
    select: () => {},
    commit: () => {},
    register: () => {},
    setGuides: () => {},
    designW: 600,
    designH: 750,
});

export const useEdit = () => useContext(EditContext);

// element ids -> labels shown in the editor
export const ELEMENT_LABELS = {
    logos: 'Logos', org: 'Organizer', title: 'Title', sub: 'Subtitle', desc: 'Description', speaker: 'Speaker',
    spk: 'Speaker name', des: 'Designation', extra: 'Details', cards: 'Detail cards', grid: 'Info grid', info: 'Date / venue',
    footer: 'Footer', qr1: 'QR code', qr2: 'QR code 2', avatar: 'Speaker photo', tag: 'Tag', rule: 'Divider',
    div: 'Divider', bar: 'Accent bar', orn: 'Ornament', kicker: 'Kicker',
};
export const labelFor = (id) => ELEMENT_LABELS[id] || (id.startsWith('x_') ? 'Text' : id);

const SNAP = 5;
const MARGIN = 28;

export const Editable = ({ id, children }) => {
    const ctx = useEdit();
    const ov = ctx.overrides?.[id] || {};
    const ref = useRef(null);
    const hitRef = useRef(null);
    const [box, setBox] = useState(null);
    const [hover, setHover] = useState(false);

    // measure content (excluding our own hit rect) so the whole element is clickable/draggable
    // measures after every render on purpose; setBox is guarded by an equality check
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useLayoutEffect(() => {
        if (!ctx.editing || !ref.current) return;
        const hit = hitRef.current;
        hit?.visible(false);
        const r = ref.current.getClientRect({ skipTransform: true });
        hit?.visible(true);
        if (!r || (!r.width && !r.height)) return;
        setBox((b) => (b && Math.abs(b.x - r.x) < 0.5 && Math.abs(b.y - r.y) < 0.5 && Math.abs(b.width - r.width) < 0.5 && Math.abs(b.height - r.height) < 0.5 ? b : r));
    });

    if (ov.hidden && !ctx.editing) return null;
    const ghost = ov.hidden && ctx.editing;

    const snapDrag = (e) => {
        const node = e.target;
        const layer = node.getLayer();
        const r = node.getClientRect({ relativeTo: layer });
        const guides = {};
        const tryAxis = (axis) => {
            const size = axis === 'x' ? ctx.designW : ctx.designH;
            const start = axis === 'x' ? r.x : r.y;
            const len = axis === 'x' ? r.width : r.height;
            const cands = [
                { at: size / 2, mine: start + len / 2 },
                { at: MARGIN, mine: start },
                { at: size - MARGIN, mine: start + len },
            ];
            let best = null;
            cands.forEach((c) => { const d = c.at - c.mine; if (Math.abs(d) < SNAP && (!best || Math.abs(d) < Math.abs(best.d))) best = { d, at: c.at }; });
            if (best) {
                node[axis](node[axis]() + best.d);
                guides[axis] = best.at;
            }
        };
        tryAxis('x');
        tryAxis('y');
        ctx.setGuides(guides);
    };

    return (
        <Group
            ref={(n) => { ref.current = n; ctx.register(id, n); }}
            x={ov.x || 0}
            y={ov.y || 0}
            scaleX={ov.sx || 1}
            scaleY={ov.sy || 1}
            opacity={ghost ? 0.25 : 1}
            draggable={ctx.editing}
            listening={ctx.editing}
            onClick={(e) => { if (ctx.editing) { e.cancelBubble = true; ctx.select(id); } }}
            onTap={(e) => { if (ctx.editing) { e.cancelBubble = true; ctx.select(id); } }}
            onDragStart={() => ctx.select(id)}
            onDragMove={snapDrag}
            onDragEnd={(e) => { ctx.setGuides({}); ctx.commit(id, { x: e.target.x(), y: e.target.y() }); }}
            onTransformEnd={(e) => { const n = e.target; ctx.commit(id, { x: n.x(), y: n.y(), sx: n.scaleX(), sy: n.scaleY() }); }}
            onMouseEnter={(e) => { if (ctx.editing) { setHover(true); const c = e.target.getStage()?.container(); if (c) c.style.cursor = 'move'; } }}
            onMouseLeave={(e) => { setHover(false); const c = e.target.getStage()?.container(); if (c) c.style.cursor = ''; }}
        >
            {children}
            {ctx.editing && box && (
                <Rect
                    ref={hitRef}
                    name="editor-ui"
                    x={box.x - 3} y={box.y - 3} width={box.width + 6} height={box.height + 6}
                    fill="rgba(0,0,0,0.002)"
                    stroke={hover || ctx.selectedId === id ? '#f97316' : undefined}
                    strokeWidth={0.8}
                    dash={[4, 3]}
                />
            )}
        </Group>
    );
};
