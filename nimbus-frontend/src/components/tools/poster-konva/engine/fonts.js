// Self-hosted fonts (no runtime Google CSS injection) + a load gate so canvas
// text is never drawn or exported with a fallback font.
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/outfit/800.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/orbitron/400.css';
import '@fontsource/orbitron/700.css';
import '@fontsource/orbitron/800.css';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/800.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700.css';
import '@fontsource/dm-serif-display/400.css';
import '@fontsource/libre-baskerville/400.css';
import '@fontsource/libre-baskerville/700.css';
import '@fontsource/oswald/400.css';
import '@fontsource/oswald/600.css';
import '@fontsource/oswald/700.css';
import '@fontsource/bebas-neue/400.css';
import '@fontsource/work-sans/400.css';
import '@fontsource/work-sans/600.css';
import '@fontsource/work-sans/700.css';
import '@fontsource/work-sans/800.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/source-sans-3/400.css';
import '@fontsource/source-sans-3/600.css';
import '@fontsource/source-sans-3/700.css';
import '@fontsource/nunito-sans/400.css';
import '@fontsource/nunito-sans/600.css';
import '@fontsource/nunito-sans/700.css';
import '@fontsource/eb-garamond/400.css';
import '@fontsource/eb-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/eb-garamond/600.css';
import '@fontsource/eb-garamond/700.css';

const WEIGHTS = ['400', '600', '700', '800', '900'];

/** Resolve once every requested family (all used weights) is ready for canvas drawing. */
export const loadPosterFonts = async (families = []) => {
    if (!document.fonts?.load) return;
    const unique = [...new Set(families.filter(Boolean))];
    await Promise.all(
        unique.flatMap((f) => WEIGHTS.map((w) => document.fonts.load(`${w} 32px "${f}"`).catch(() => null)))
    );
    if (document.fonts.ready) await document.fonts.ready;
};

export const familiesForPalette = (palette) => [
    'Inter',
    'Montserrat',
    ...(palette.titleFonts || []),
    palette.bodyFont,
];
