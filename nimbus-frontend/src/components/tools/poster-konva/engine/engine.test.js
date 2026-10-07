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
