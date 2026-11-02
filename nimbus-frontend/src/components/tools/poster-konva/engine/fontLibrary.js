// Font library for the editor's font picker.
// Families imported statically in fonts.js load with the page. Families marked `lazy` are fetched
// the first time they are used (picker preview or poster render), so the main bundle stays small.
// Each loader lists only the weights the package ships. Explicit import() per file on purpose:
// a template-string specifier would make webpack bundle every @fontsource file.

const LAZY = {
    Poppins: () => Promise.all([import('@fontsource/poppins/400.css'), import('@fontsource/poppins/600.css'), import('@fontsource/poppins/700.css'), import('@fontsource/poppins/800.css'), import('@fontsource/poppins/900.css'), import('@fontsource/poppins/400-italic.css')]),
    Raleway: () => Promise.all([import('@fontsource/raleway/400.css'), import('@fontsource/raleway/600.css'), import('@fontsource/raleway/700.css'), import('@fontsource/raleway/800.css'), import('@fontsource/raleway/900.css'), import('@fontsource/raleway/400-italic.css')]),
    Rubik: () => Promise.all([import('@fontsource/rubik/400.css'), import('@fontsource/rubik/600.css'), import('@fontsource/rubik/700.css'), import('@fontsource/rubik/800.css'), import('@fontsource/rubik/900.css')]),
    Syne: () => Promise.all([import('@fontsource/syne/400.css'), import('@fontsource/syne/600.css'), import('@fontsource/syne/700.css'), import('@fontsource/syne/800.css')]),
    'Bricolage Grotesque': () => Promise.all([import('@fontsource/bricolage-grotesque/400.css'), import('@fontsource/bricolage-grotesque/600.css'), import('@fontsource/bricolage-grotesque/700.css'), import('@fontsource/bricolage-grotesque/800.css')]),
    'Archivo Black': () => import('@fontsource/archivo-black/400.css'),
    Anton: () => import('@fontsource/anton/400.css'),
    'Barlow Condensed': () => Promise.all([import('@fontsource/barlow-condensed/400.css'), import('@fontsource/barlow-condensed/600.css'), import('@fontsource/barlow-condensed/700.css'), import('@fontsource/barlow-condensed/800.css'), import('@fontsource/barlow-condensed/900.css')]),
    Lora: () => Promise.all([import('@fontsource/lora/400.css'), import('@fontsource/lora/600.css'), import('@fontsource/lora/700.css'), import('@fontsource/lora/400-italic.css')]),
    Merriweather: () => Promise.all([import('@fontsource/merriweather/400.css'), import('@fontsource/merriweather/700.css'), import('@fontsource/merriweather/900.css'), import('@fontsource/merriweather/400-italic.css')]),
    Fraunces: () => Promise.all([import('@fontsource/fraunces/400.css'), import('@fontsource/fraunces/600.css'), import('@fontsource/fraunces/700.css'), import('@fontsource/fraunces/800.css'), import('@fontsource/fraunces/900.css'), import('@fontsource/fraunces/400-italic.css')]),
    'Abril Fatface': () => import('@fontsource/abril-fatface/400.css'),
    Cinzel: () => Promise.all([import('@fontsource/cinzel/400.css'), import('@fontsource/cinzel/600.css'), import('@fontsource/cinzel/700.css'), import('@fontsource/cinzel/800.css'), import('@fontsource/cinzel/900.css')]),
    Righteous: () => import('@fontsource/righteous/400.css'),
    Lobster: () => import('@fontsource/lobster/400.css'),
    Pacifico: () => import('@fontsource/pacifico/400.css'),
    'Dancing Script': () => Promise.all([import('@fontsource/dancing-script/400.css'), import('@fontsource/dancing-script/600.css'), import('@fontsource/dancing-script/700.css')]),
    'Great Vibes': () => import('@fontsource/great-vibes/400.css'),
    Caveat: () => Promise.all([import('@fontsource/caveat/400.css'), import('@fontsource/caveat/600.css'), import('@fontsource/caveat/700.css')]),
    'JetBrains Mono': () => Promise.all([import('@fontsource/jetbrains-mono/400.css'), import('@fontsource/jetbrains-mono/700.css'), import('@fontsource/jetbrains-mono/800.css')]),
    'Space Mono': () => Promise.all([import('@fontsource/space-mono/400.css'), import('@fontsource/space-mono/700.css'), import('@fontsource/space-mono/400-italic.css')]),
};

const lib = (family, category, weights, extra = {}) => ({ family, category, weights, ...extra });

/** Every family the editor can offer. `weights` = weights actually shipped (the picker only offers those). */
export const FONT_LIBRARY = [
    // Sans
    lib('Montserrat', 'Sans', ['400', '600', '700', '800', '900']),
    lib('Outfit', 'Sans', ['400', '600', '700', '800']),
    lib('Inter', 'Sans', ['400', '600', '700', '800']),
    lib('Space Grotesk', 'Sans', ['400', '600', '700']),
    lib('Work Sans', 'Sans', ['400', '600', '700', '800']),
    lib('DM Sans', 'Sans', ['400', '600', '700']),
    lib('Source Sans 3', 'Sans', ['400', '600', '700']),
    lib('Nunito Sans', 'Sans', ['400', '600', '700']),
    lib('Poppins', 'Sans', ['400', '600', '700', '800', '900'], { italic: true }),
    lib('Raleway', 'Sans', ['400', '600', '700', '800', '900'], { italic: true }),
    lib('Rubik', 'Sans', ['400', '600', '700', '800', '900']),
    lib('Syne', 'Sans', ['400', '600', '700', '800']),
    lib('Bricolage Grotesque', 'Sans', ['400', '600', '700', '800']),
    // Serif
    lib('Playfair Display', 'Serif', ['400', '700', '800']),
    lib('Cormorant Garamond', 'Serif', ['400', '600', '700'], { italic: true }),
    lib('EB Garamond', 'Serif', ['400', '600', '700'], { italic: true }),
    lib('DM Serif Display', 'Serif', ['400']),
    lib('Libre Baskerville', 'Serif', ['400', '700']),
    lib('Lora', 'Serif', ['400', '600', '700'], { italic: true }),
    lib('Merriweather', 'Serif', ['400', '700', '900'], { italic: true }),
    lib('Fraunces', 'Serif', ['400', '600', '700', '800', '900'], { italic: true }),
    lib('Cinzel', 'Serif', ['400', '600', '700', '800', '900']),
    // Display / condensed
    lib('Bebas Neue', 'Display', ['400']),
    lib('Oswald', 'Display', ['400', '600', '700']),
    lib('Orbitron', 'Display', ['400', '700', '800']),
    lib('Anton', 'Display', ['400']),
    lib('Archivo Black', 'Display', ['400']),
    lib('Abril Fatface', 'Display', ['400']),
    lib('Barlow Condensed', 'Display', ['400', '600', '700', '800', '900']),
    lib('Righteous', 'Display', ['400']),
    // Script / handwriting
    lib('Lobster', 'Script', ['400']),
    lib('Pacifico', 'Script', ['400']),
    lib('Dancing Script', 'Script', ['400', '600', '700']),
    lib('Great Vibes', 'Script', ['400']),
    lib('Caveat', 'Script', ['400', '600', '700']),
    // Mono
    lib('JetBrains Mono', 'Mono', ['400', '700', '800']),
    lib('Space Mono', 'Mono', ['400', '700'], { italic: true }),
];

export const FONT_CATEGORIES = ['Sans', 'Serif', 'Display', 'Script', 'Mono'];

const BY_FAMILY = Object.fromEntries(FONT_LIBRARY.map((f) => [f.family, f]));
export const getFontInfo = (family) => BY_FAMILY[family] || null;

const loaded = new Map();
/** Fetch a lazy family's CSS once (no-op for families bundled with the page). */
export const ensureFontCss = (family) => {
    if (!LAZY[family]) return Promise.resolve();
    if (!loaded.has(family)) loaded.set(family, Promise.resolve(LAZY[family]()).catch(() => null));
    return loaded.get(family);
};
