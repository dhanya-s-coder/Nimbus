// Free-form poster elements (the "Design" tab). Pure data helpers: no React, easy to test.
//
// custom.elements = [ { id:'e_xxxx', type, x, y, w, h, ...type fields } ]   (array order = stacking, last on top)
// Move / rotate / hide / lock live in custom.overrides[id] ({x,y,r,hidden,locked}) like every other element;
// resizing is folded into w/h (and font size for text) by foldTransform(), so shapes stay crisp.

export const isElementId = (id) => typeof id === 'string' && id.startsWith('e_');
export const newId = () => `e_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

/** Event data a "field" element can show live (so a saved layout works for any event). */
export const FIELD_OPTIONS = [
    { bind: 'title', label: 'Title' },
    { bind: 'subtitle', label: 'Subtitle' },
    { bind: 'organizer', label: 'Organiser' },
    { bind: 'description', label: 'Description' },
    { bind: 'date', label: 'Date' },
    { bind: 'time', label: 'Time' },
    { bind: 'venue', label: 'Venue' },
    { bind: 'info', label: 'All details (date / time / venue)' },
    { bind: 'speakerName', label: 'Speaker name' },
    { bind: 'speakerDesignation', label: 'Speaker designation' },
    { bind: 'footer', label: 'Footer / contact' },
];

const infoValue = (data, label) => (data.infoItems || []).find((i) => String(i.label).toLowerCase().startsWith(label))?.value || '';

/** Current text for a field binding ('' when the event has nothing for it). */
export const fieldValue = (data = {}, bind) => {
    switch (bind) {
        case 'date': return infoValue(data, 'date') || infoValue(data, 'apply');
        case 'time': return infoValue(data, 'time');
        case 'venue': return infoValue(data, 'venue') || infoValue(data, 'mode');
        case 'info': return (data.infoItems || []).map((i) => `${i.label}: ${i.value}`).join('\n');
        default: return data[bind] ? String(data[bind]) : '';
    }
};
export const fieldLabel = (bind) => FIELD_OPTIONS.find((f) => f.bind === bind)?.label || bind;

// -- factories ------------------------------------------------------------------------------------
export const makeText = (o = {}) => ({ id: newId(), type: 'text', text: 'Your text', x: 60, y: 300, w: 480, size: 32, align: 'center', style: {}, ...o });
export const makeField = (bind, o = {}) => ({ id: newId(), type: 'field', bind, x: 60, y: 300, w: 480, size: bind === 'title' ? 56 : 22, align: 'center', style: bind === 'title' ? { weight: '800' } : {}, ...o });
export const makeShape = (kind, o = {}) => {
    const line = kind === 'line';
    return { id: newId(), type: 'shape', kind, x: 100, y: 300, w: line ? 400 : 220, h: line ? 0 : 160, fill: line ? undefined : '#f97316', stroke: line ? '#ffffff' : undefined, strokeWidth: line ? 4 : 0, radius: kind === 'rect' ? 12 : 0, opacity: 1, ...o };
};
export const makeImage = (src, naturalW, naturalH, o = {}) => {
    const w = Math.min(320, naturalW || 320);
    const h = naturalW ? Math.round((w * (naturalH || naturalW)) / naturalW) : 240;
    return { id: newId(), type: 'image', src, x: 140, y: 240, w, h, fit: 'cover', mask: 'none', radius: 0, opacity: 1, ...o };
};
/** Event blocks drawn from the form: 'logos' | 'qr1' | 'qr2' | 'avatar'. */
export const makeBlock = (block, o = {}) => ({
    id: newId(), type: 'block', block, x: 60, y: 60,
    w: block === 'logos' ? 220 : block === 'avatar' ? 120 : 90, h: block === 'logos' ? 40 : block === 'avatar' ? 120 : 90, shape: 'Circle', ...o,
});

export const BLOCK_LABELS = { logos: 'Logos', qr1: 'QR code', qr2: 'QR code 2', avatar: 'Speaker photo' };

/** Short name shown in the layers list. */
export const elementLabel = (el) => {
    if (el.type === 'text') return `Text: ${String(el.text || '').slice(0, 18) || '(empty)'}`;
    if (el.type === 'field') return fieldLabel(el.bind);
    if (el.type === 'shape') return { rect: 'Rectangle', ellipse: 'Circle', line: 'Line', triangle: 'Triangle' }[el.kind] || 'Shape';
    if (el.type === 'image') return 'Image';
    if (el.type === 'block') return BLOCK_LABELS[el.block] || 'Block';
    return 'Element';
};

// -- list operations (all return NEW arrays) ------------------------------------------------------------------
export const reorder = (list, id, where) => {
    const i = list.findIndex((e) => e.id === id);
    if (i < 0) return list;
    const out = list.slice();
    const [item] = out.splice(i, 1);
    const to = where === 'front' ? out.length : where === 'back' ? 0 : where === 'up' ? Math.min(out.length, i + 1) : Math.max(0, i - 1);
    out.splice(to, 0, item);
    return out;
};

export const duplicate = (list, id, offset = 16) => {
    const i = list.findIndex((e) => e.id === id);
    if (i < 0) return { list, copy: null };
    const copy = { ...list[i], id: newId(), x: (list[i].x || 0) + offset, y: (list[i].y || 0) + offset };
    const out = list.slice();
    out.splice(i + 1, 0, copy);
    return { list: out, copy };
};

/** Fold a Transformer scale into the element's own size, so the saved override only carries x/y/rotation. */
export const foldTransform = (el, sx = 1, sy = 1) => {
    if (!el || (sx === 1 && sy === 1)) return el;
    if (el.type === 'text' || el.type === 'field') {
        const k = Math.max(0.05, sx); // text keeps its aspect: the box and the font grow together
        return { ...el, w: Math.max(20, Math.round(el.w * k)), size: Math.max(6, Math.round(el.size * k * 10) / 10) };
    }
    if (el.type === 'shape' && el.kind === 'line') return { ...el, w: Math.max(4, Math.round(el.w * sx)), strokeWidth: Math.max(1, Math.round(el.strokeWidth * (sy === 1 ? 1 : sy))) };
    return { ...el, w: Math.max(8, Math.round(el.w * sx)), h: Math.max(8, Math.round(el.h * sy)) };
};

/** The element's un-rotated box in poster coordinates (override translation included). */
export const boxOf = (el, ov = {}) => ({ x: (el.x || 0) + (ov.x || 0), y: (el.y || 0) + (ov.y || 0), w: el.w || 0, h: el.type === 'text' || el.type === 'field' ? (el.size || 20) * 1.2 : el.h || 0 });

/** New override translation that aligns the element to the canvas edge/centre (no rotation handling: fine for the common case). */
export const alignTo = (el, ov, how, W, H) => {
    const b = boxOf(el, { x: 0, y: 0 });
    const h = el.type === 'text' || el.type === 'field' ? b.h : b.h;
    const target = {
        left: [28 - b.x, null], center: [(W - b.w) / 2 - b.x, null], right: [W - 28 - b.w - b.x, null],
        top: [null, 28 - b.y], middle: [null, (H - h) / 2 - b.y], bottom: [null, H - 28 - h - b.y],
    }[how];
    if (!target) return ov;
    return { ...ov, x: target[0] === null ? ov.x || 0 : Math.round(target[0]), y: target[1] === null ? ov.y || 0 : Math.round(target[1]) };
};

/** Starting layout for "blank canvas": a few bound fields so it is never an empty page. */
export const starterElements = (H = 750) => [
    makeField('title', { x: 40, y: Math.round(H * 0.34), w: 520, size: 58 }),
    makeField('subtitle', { x: 60, y: Math.round(H * 0.34) + 120, w: 480, size: 22, style: { color: undefined } }),
    makeField('info', { x: 60, y: Math.round(H * 0.72), w: 480, size: 18 }),
];
