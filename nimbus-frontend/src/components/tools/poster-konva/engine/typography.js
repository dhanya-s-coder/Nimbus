// Opt-in typography overrides. Nothing here changes a poster until the user sets a value:
// every helper returns its input untouched when the style object is empty/undefined.
//
// A "style" is { font, weight, italic, case, tracking, lineHeight, align, color, opacity, shadow, scale }.
//  - global roles live in custom.typography = { title, body, accent }  (read through palette.type)
//  - per-element styles live in custom.overrides[id].style               (read by Txt)

export const hasStyle = (s) => !!s && Object.values(s).some((v) => v !== undefined && v !== null && v !== '');

/** Apply a text-case mode. 'none'/undefined leaves the text as the layout wrote it. */
export const caseText = (text, mode) => {
    const t = String(text ?? '');
    if (mode === 'upper') return t.toUpperCase();
    if (mode === 'lower') return t.toLowerCase();
    if (mode === 'title') return t.toLowerCase().replace(/(^|[\s\-–—(])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());
    return t;
};

/** Konva fontStyle string ("italic 700") from parts, falling back to the layout's own style. */
export const buildFontStyle = (base, { weight, italic } = {}) => {
    const b = String(base || '400');
    const baseItalic = /italic/.test(b);
    const baseWeight = (b.match(/\d{3}/) || ['400'])[0];
    const w = weight ?? baseWeight;
    const i = italic === undefined ? baseItalic : !!italic;
    return `${i ? 'italic ' : ''}${w}`;
};

/**
 * Merge a style onto a text node's props. `props` are what the layout asked for; the style wins
 * only for the keys the user actually set.
 */
export const applyStyleToProps = (props, style) => {
    if (!hasStyle(style)) return props;
    const out = { ...props };
    if (style.font) out.fontFamily = style.font;
    if (style.weight !== undefined || style.italic !== undefined) out.fontStyle = buildFontStyle(props.fontStyle, style);
    if (style.tracking !== undefined) out.letterSpacing = style.tracking;
    if (style.lineHeight !== undefined) out.lineHeight = style.lineHeight;
    if (style.align) out.align = style.align;
    if (style.color) out.fill = style.color;
    if (style.opacity !== undefined) out.opacity = style.opacity;
    if (style.shadow === false) { out.shadowBlur = 0; out.shadowOpacity = 0; }
    if (style.shadow === true && !out.shadowBlur) { out.shadowColor = 'rgba(0,0,0,0.5)'; out.shadowBlur = 8; out.shadowOpacity = 0.6; }
    if (style.scale && out.fontSize) out.fontSize = out.fontSize * style.scale;
    return out;
};

// Which global role styles a built-in element (by its Editable id).
const ROLE_OF = {
    title: 'title',
    org: 'accent', kicker: 'accent', tag: 'accent',
    sub: 'body', desc: 'body', spk: 'body', des: 'body', extra: 'body', cards: 'body', grid: 'body', info: 'body', footer: 'body',
};
// Keys a role may set. Weight/line-height/size are deliberately only global for the title: stacked body blocks are
// measured before styling, so those would overlap neighbours. They stay available per element.
const ROLE_KEYS = {
    title: ['font', 'weight', 'italic', 'case', 'tracking', 'lineHeight', 'align', 'color', 'shadow'],
    body: ['font', 'italic', 'case', 'tracking', 'color'],
    accent: ['font', 'case', 'tracking', 'color'],
};
export const roleKeys = (role) => ROLE_KEYS[role] || [];

/** Style a built-in element inherits from the global typography roles ({} when none is set). */
export const roleStyleFor = (id, typography) => {
    const role = ROLE_OF[id];
    const src = role && typography?.[role];
    if (!src) return null;
    const out = {};
    ROLE_KEYS[role].forEach((k) => { if (src[k] !== undefined && src[k] !== '') out[k] = src[k]; });
    return hasStyle(out) ? out : null;
};

/** Every font family a typography/overrides/elements tree refers to (so they get loaded before drawing). */
export const fontsInUse = (custom = {}) => {
    const out = new Set();
    const t = custom.typography || {};
    ['title', 'body', 'accent'].forEach((r) => t[r]?.font && out.add(t[r].font));
    Object.values(custom.overrides || {}).forEach((o) => o?.style?.font && out.add(o.style.font));
    (custom.extras || []).forEach((e) => e.font && out.add(e.font));
    (custom.elements || []).forEach((e) => e.style?.font && out.add(e.style.font));
    return [...out];
};
