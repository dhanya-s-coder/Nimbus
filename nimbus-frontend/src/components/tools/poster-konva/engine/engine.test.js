import { alpha, clear, lighten, darken, cssLinearGradient, contentPaletteFor } from './color';
import { buildAutoPalette } from './autoPalette';
import { SIZES, setDesignHeight } from './constants';
import { normalizeFormData } from '../data/normalizeFormData';
import { getDesignRecipes } from '../data/autoDesigner';
import { PALETTES } from '../data/palettes';
import { LAYOUTS } from '../layouts';
import { BACKGROUNDS } from '../layers/backgrounds';
import { DECORATIONS } from '../layers/decorations';
import { FRAMES } from '../layers/frames';

test('color helpers', () => {
    expect(alpha('#112233', 0.5)).toBe('#11223380');
    expect(clear('#112233')).toBe('#11223300');
    expect(clear('rgba(1,2,3,0.5)')).toBe('rgba(1,2,3,0)');
    expect(lighten('#000000', 1)).toBe('#ffffff');
    expect(darken('#ffffff', 1)).toBe('#000000');
});

test('cssLinearGradient converts a CSS gradient for Konva', () => {
    const g = cssLinearGradient('linear-gradient(145deg, #0c1425 0%, #162240 40%, #1e3a5f 100%)', 600, 750);
    expect(g.fillLinearGradientColorStops).toEqual([0, '#0c1425', 0.4, '#162240', 1, '#1e3a5f']);
    expect(g.fillLinearGradientEndPoint.x).toBeGreaterThan(g.fillLinearGradientStartPoint.x);
    expect(cssLinearGradient('radial-gradient(red, blue)', 10, 10)).toBeNull();
});

test('contentPaletteFor picks readable text and adapts accents when a light palette sits on a dark photo', () => {
    const dark = contentPaletteFor(PALETTES.universityBlue);
    expect(dark.text).toBe('#FFFFFF');
    const light = contentPaletteFor(PALETTES.creamFormal);
    expect(light.text).toBe('#111827');
    const flipped = contentPaletteFor(PALETTES.creamFormal, true);
    expect(flipped.text).toBe('#FFFFFF');
    expect(flipped.secondary).not.toBe(PALETTES.creamFormal.secondary);
});

test('buildAutoPalette produces a complete dark palette from hues', () => {
    const p = buildAutoPalette([200, 40]);
    ['primary', 'secondary', 'accent', 'bg', 'bgMid', 'gradient'].forEach((k) => expect(p[k]).toBeTruthy());
    expect(p.isDark).toBe(true);
    expect(buildAutoPalette(null).primary).toMatch(/^#[0-9a-f]{6}$/);
});

test('size presets drive the live design height', () => {
    Object.entries(SIZES).forEach(([key, s]) => expect(setDesignHeight(key)).toBe(s.h));
    expect(setDesignHeight('nope')).toBe(SIZES.post.h);
});

test('every curated design recipe resolves to real layouts, skins and palettes', () => {
    ['academic', 'recruitment', 'event', 'hackathon', 'announcement'].forEach((t) => {
        getDesignRecipes(t).forEach((d) => {
            expect(LAYOUTS[d.skeleton]).toBeDefined();
            expect(BACKGROUNDS[d.background]).toBeDefined();
            expect(DECORATIONS[d.decoration]).toBeDefined();
            expect(FRAMES[d.frame]).toBeDefined();
            d.palettes.forEach((id) => expect(PALETTES[id]).toBeDefined());
        });
    });
});

test('normalizeFormData maps template-specific fields to the universal shape', () => {
    const n = normalizeFormData('event', { eventName: 'Fest', tagline: 'Hi', date: 'Mar 1', venue: 'Hall', highlights: 'A. B' });
    expect(n.title).toBe('Fest');
    expect(n.subtitle).toBe('Hi');
    expect(n.infoItems.map((i) => i.label)).toEqual(['Date', 'Venue']);
    expect(n.extraItems[0].label).toBe('Highlights');
    expect(normalizeFormData('academic', {}).qr1).toBeNull();
});

// ---- opt-in typography -----------------------------------------------------------------------
import { applyStyleToProps, caseText, buildFontStyle, roleStyleFor, fontsInUse } from './typography';
import { FONT_LIBRARY, getFontInfo } from './fontLibrary';

test('typography helpers are no-ops when nothing is set', () => {
    const props = { fontSize: 20, fontFamily: 'Inter', fontStyle: '700', fill: '#fff' };
    expect(applyStyleToProps(props, undefined)).toBe(props);
    expect(applyStyleToProps(props, {})).toBe(props);
    expect(roleStyleFor('title', undefined)).toBeNull();
    expect(roleStyleFor('title', { title: {} })).toBeNull();
    expect(fontsInUse({})).toEqual([]);
});

test('applyStyleToProps merges only the keys the user set', () => {
    const out = applyStyleToProps({ fontSize: 20, fontFamily: 'Inter', fontStyle: 'italic 400', fill: '#fff', letterSpacing: 1 }, { weight: '800', color: '#f00' });
    expect(out).toMatchObject({ fontStyle: 'italic 800', fill: '#f00', fontFamily: 'Inter', letterSpacing: 1 });
    expect(buildFontStyle('700', { italic: true })).toBe('italic 700');
    expect(buildFontStyle('italic 400', {})).toBe('italic 400');
});

test('case transforms', () => {
    expect(caseText('hello world', 'upper')).toBe('HELLO WORLD');
    expect(caseText('HELLO wORLD', 'title')).toBe('Hello World');
    expect(caseText('Keep', undefined)).toBe('Keep');
});

test('role styles only reach the keys that are safe per role', () => {
    const typography = { body: { font: 'Lora', weight: '800', color: '#abc' }, accent: { case: 'upper' } };
    expect(roleStyleFor('desc', typography)).toEqual({ font: 'Lora', color: '#abc' }); // weight is not global for body text
    expect(roleStyleFor('org', typography)).toEqual({ case: 'upper' });
    expect(roleStyleFor('qr1', typography)).toBeNull();
});

test('font library is consistent', () => {
    const names = FONT_LIBRARY.map((f) => f.family);
    expect(new Set(names).size).toBe(names.length);
    FONT_LIBRARY.forEach((f) => { expect(f.weights.length).toBeGreaterThan(0); });
    expect(getFontInfo('Anton').weights).toEqual(['400']);
    // every palette font must still be in the library so the picker can show it
    Object.values(PALETTES).forEach((p) => [...p.titleFonts, p.bodyFont].forEach((f) => expect(names).toContain(f)));
});

// ---- free-form elements (Design tab) ---------------------------------------------------------------------
import { makeText, makeField, makeShape, makeImage, makeBlock, reorder, duplicate, foldTransform, alignTo, fieldValue, isElementId, starterElements, elementLabel } from '../editor/elements';

test('element factories produce typed, uniquely-identified elements', () => {
    const a = makeText(); const b = makeText();
    expect(a.id).not.toBe(b.id);
    expect(isElementId(a.id)).toBe(true);
    expect(isElementId('x_old')).toBe(false); // legacy "Add text" boxes keep their own ids
    expect(makeShape('line').h).toBe(0);
    expect(makeImage('data:x', 800, 400).h).toBe(160); // 320 wide, aspect kept
    expect(makeBlock('qr1').type).toBe('block');
    expect(starterElements(750).map((e) => e.bind)).toEqual(['title', 'subtitle', 'info']);
    expect(elementLabel(makeField('venue'))).toBe('Venue');
});

test('layer ordering and duplication', () => {
    const [a, b, c] = [makeText({ text: 'a' }), makeText({ text: 'b' }), makeText({ text: 'c' })];
    const list = [a, b, c];
    expect(reorder(list, a.id, 'front').map((e) => e.text)).toEqual(['b', 'c', 'a']);
    expect(reorder(list, c.id, 'back').map((e) => e.text)).toEqual(['c', 'a', 'b']);
    expect(reorder(list, b.id, 'up').map((e) => e.text)).toEqual(['a', 'c', 'b']);
    expect(reorder(list, b.id, 'down').map((e) => e.text)).toEqual(['b', 'a', 'c']);
    expect(reorder(list, 'nope', 'up')).toBe(list);
    const d = duplicate(list, b.id);
    expect(d.list.map((e) => e.text)).toEqual(['a', 'b', 'b', 'c']);
    expect(d.copy.id).not.toBe(b.id);
    expect(list).toHaveLength(3); // never mutates
});

test('resizing folds into the element so shapes stay crisp and text keeps its aspect', () => {
    const rect = makeShape('rect', { w: 100, h: 50 });
    expect(foldTransform(rect, 2, 3)).toMatchObject({ w: 200, h: 150 });
    const text = makeText({ w: 200, size: 20 });
    expect(foldTransform(text, 1.5, 1.5)).toMatchObject({ w: 300, size: 30 });
    expect(foldTransform(text, 1, 1)).toBe(text);
});

test('field bindings read the normalised event data', () => {
    const data = { title: 'Fest', infoItems: [{ label: 'Date', value: '1 May' }, { label: 'Venue', value: 'Hall' }], speakerName: 'Dr Rao' };
    expect(fieldValue(data, 'title')).toBe('Fest');
    expect(fieldValue(data, 'date')).toBe('1 May');
    expect(fieldValue(data, 'venue')).toBe('Hall');
    expect(fieldValue(data, 'time')).toBe('');
    expect(fieldValue(data, 'info')).toBe('Date: 1 May\nVenue: Hall');
    expect(fieldValue({}, 'footer')).toBe('');
});

test('align to canvas moves via the override translation', () => {
    const el = makeShape('rect', { x: 100, y: 100, w: 200, h: 100 });
    expect(alignTo(el, {}, 'center', 600, 750).x).toBe(100); // (600-200)/2 = 200 -> 200-100
    expect(alignTo(el, { x: 5 }, 'top', 600, 750)).toMatchObject({ x: 5, y: -72 });
});

// ---- wording edits on the poster ---------------------------------------------------------------------------
import { applyContent, isEdited, withoutElement, CONTENT_FIELD, valueToText, textToValue } from '../editor/content';

test('wording edits overlay the form data without touching it', () => {
    const data = { title: 'A', subtitle: 'S', infoItems: [{ label: 'Date', value: '1' }], extraItems: [], footer: '' };
    expect(applyContent(data, undefined)).toBe(data);
    const out = applyContent(data, { title: 'B', infoItems: [{ label: 'Date', value: '2' }] });
    expect(out).toMatchObject({ title: 'B', subtitle: 'S', infoItems: [{ value: '2' }] });
    expect(data.title).toBe('A');
    // an empty string is a real edit (it removes the text from the layout)
    expect(applyContent(data, { subtitle: '' }).subtitle).toBe('');
});

test('which element owns which wording, and resetting one leaves the others', () => {
    expect(CONTENT_FIELD.title).toBe('title');
    const c = { title: 'B', subtitle: 'X', footer: 'F' };
    expect(isEdited('title', c)).toBe(true);
    expect(isEdited('desc', c)).toBe(false);
    expect(withoutElement('title', c)).toEqual({ subtitle: 'X', footer: 'F' });
    expect(withoutElement('footer', { footer: 'F' })).toBeUndefined();
    expect(textToValue(valueToText(['a', 'b']))).toEqual(['a', 'b']);
    expect(textToValue('one line')).toBe('one line');
});

// ---- decorations are editable pieces ---------------------------------------------------------------------------
import { piecesFor, DECOR_LABELS, DECOR_PIECES, FRAME_PIECES } from './decorLabels';
import { labelFor } from './edit';

test('every decorative piece has a name and the right pieces are listed per design', () => {
    const all = [...Object.values(DECOR_PIECES), ...Object.values(FRAME_PIECES)].flat();
    all.forEach((id) => expect(DECOR_LABELS[id]).toBeTruthy());
    expect(labelFor('d_rings1')).toBe('Rings (top corner)');
    const ids = piecesFor({ decoration: 'glow-orbs', frame: 'corner-brackets', background: 'hex-grid', skeleton: 'bold-hero' }, { templateType: 'hackathon' });
    expect(ids).toEqual(expect.arrayContaining(['d_pattern', 'd_orb1', 'd_rings1', 'd_hud', 'badge', 'd_br_tl', 'd_br_br']));
    expect(new Set(ids).size).toBe(ids.length);                       // ids are unique, so hide/move never hits two pieces
    expect(piecesFor({ decoration: 'none', frame: 'none', background: 'solid-gradient', skeleton: 'centered' })).toEqual([]);
    expect(piecesFor({ skeleton: 'split-panel', decoration: 'none', frame: 'none', background: 'solid-gradient' }, {})).toEqual(['rings', 'rule']);
    expect(piecesFor({ skeleton: 'split-panel', decoration: 'none', frame: 'none', background: 'solid-gradient' }, { speakerPhoto: 'x' })).toEqual([]);
});

// ---- picture shapes and borders -----------------------------------------------------------------------------------
import { MASKS, BORDERS, maskPath, maskOf, frameBox } from '../editor/shapes';

test('every picture shape draws a closed outline inside its box', () => {
    MASKS.forEach(([mask]) => {
        const pts = []; let closed = false;
        const ctx = {
            moveTo: (x, y) => pts.push([x, y]), lineTo: (x, y) => pts.push([x, y]), closePath: () => { closed = true; },
            bezierCurveTo: (a, b, c, d, x, y) => pts.push([x, y]),
            arc: (cx, cy, r, a0, a1) => { pts.push([cx + r * Math.cos(a0), cy + r * Math.sin(a0)], [cx + r * Math.cos(a1), cy + r * Math.sin(a1)]); },
        };
        maskPath(mask, 200, 120, 30)(ctx);
        expect(closed).toBe(true);
        expect(pts.length).toBeGreaterThan(2);
        pts.forEach(([x, y]) => { expect(x).toBeGreaterThanOrEqual(-1); expect(x).toBeLessThanOrEqual(201); expect(y).toBeGreaterThanOrEqual(-1); expect(y).toBeLessThanOrEqual(121); });
    });
    expect(BORDERS.map(([k]) => k)).toEqual(expect.arrayContaining(['none', 'solid', 'dashed', 'dotted', 'double', 'glow', 'shadow', 'polaroid']));
    expect(maskOf('Hexagon')).toBe('hexagon');   // speaker photos saved before masks existed keep working
    expect(maskOf('Square')).toBe('none');
    expect(maskOf(undefined)).toBe('none');
    const f = frameBox(200, 200, 4);
    expect(f.w).toBeLessThan(200); expect(f.h).toBeLessThan(f.w);   // thicker bottom, like an instant photo
});
