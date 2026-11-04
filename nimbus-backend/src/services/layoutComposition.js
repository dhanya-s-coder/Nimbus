/**
 * What the AI background must leave free (or fill) for each poster layout.
 * The frontend picks the layout first and sends its id, so the image is composed for THAT layout:
 * focal artwork where the layout shows the photo, calm dark areas where its text sits.
 * Keys are the layout (skeleton) ids used by the frontend (poster-konva/layouts/index.js).
 */
export const LAYOUT_COMPOSITION = {
    centered: 'soft glow or depth in the middle, calm and slightly darker behind the centre column; detail and light concentrated toward the edges and corners',
    'bold-hero': 'cinematic atmosphere across the top third, a dark smooth low-detail centre for a huge headline, subtle energy lines near the bottom',
    'split-panel': 'visually rich scene on the right half, a quiet darker gradient on the left half',
    editorial: 'asymmetric composition: main scenery on the right, a quiet dark margin down the left side and a calm lower third',
    asymmetric: 'focal scenery in the upper right, a large calm area on the left and across the bottom third',
    'framed-classic': 'elegant even texture with a calm soft centre and a gentle vignette, nothing important near the borders',
    'event-cards': 'colourful aurora-like lights in the upper half, a calm darker lower half',
    'magazine-cover': 'a dramatic hero scene filling the upper half like a magazine cover photograph with strong focal depth, fading smoothly into a dark, low-detail lower half',
    'arch-window': 'one striking, symmetrical, vertically composed scene with a clear central subject and real depth (it will be cropped into a tall arch-shaped window and seen sharply, with no text over it), vivid full colour, a soft sky-like gradient at the top',
    'neo-brutal': 'bold saturated pop-art or halftone style artwork with flat colour shapes and strong contrast, dark enough overall that bright flat colour blocks stand out, minimal fine detail',
    'ticket-pass': 'a cinematic scene in the upper half with a focal point just left of centre (it is seen through a rounded window under a title), richly coloured, everything around it dark and softly out of focus',
    'big-type': 'a dark, smooth, atmospheric background with a single soft light source and subtle texture, very little detail and lots of negative space so huge white lettering stays readable',
    'diagonal-split': 'the scene lives in the top 45% of the canvas with horizon-like depth and a diagonal rise toward the right, the lower half is a smooth dark gradient',
    'glass-card': 'vivid depth-rich scene with soft bokeh lights and colourful gradients across the whole canvas, the main subject in the upper 40%, the lower 60% dreamy and softly blurred (a frosted glass card will sit on it)',
    'swiss-grid': 'a wide, cinematic landscape-style scene that will be cropped into a short banner (about 3:1) across the upper third: strong horizontal composition, rich colour, one clear focal point left of centre, everything else restrained',
    'photo-hero': 'a full-bleed hero scene in the upper half of the canvas with real depth and a clear focal point in the middle, vivid colour, fading to a soft calm gradient in the lower half (a paper-coloured card covers it)',
    'retro-sunburst': 'a single iconic, centred subject or scene with strong depth and rich colour, framed so the central circle (about 40% of the canvas width) shows it well, nothing important near the corners (a round window crops it), warm vintage poster palette',
    blank: 'a versatile, balanced piece of artwork with moderate detail and soft focus areas, nothing dominant, so text, shapes and images can be placed anywhere on it',
    'circle-badge': 'radial composition with a soft glow in the upper middle, a darker vignette toward the corners, a gently darker centre where a round emblem sits, a calm lower third',
};

export const isKnownLayout = (id) => typeof id === 'string' && Object.prototype.hasOwnProperty.call(LAYOUT_COMPOSITION, id);

/** Composition sentence for a layout id, or '' when the layout is unknown / not given. */
export const compositionFor = (id) => (isKnownLayout(id) ? LAYOUT_COMPOSITION[id] : '');
