// Layouts are authored in a 600-wide "design space" (REM = 16 design px) and scaled up on export.
// The design HEIGHT depends on the chosen size preset. DESIGN_H is a live ES-module binding: PosterStage
// calls setDesignHeight() before its children render, and every layer reads it at render time.
// NOTE: all stages on one page must use the same preset (the binding is shared).
export const DESIGN_W = 600;
export let DESIGN_H = 750;

export const SIZES = {
    post: { label: 'Post 4:5', hint: '1080×1350', h: 750 },
    square: { label: 'Square 1:1', hint: '1080×1080', h: 600 },
    story: { label: 'Story 9:16', hint: '1080×1920', h: 1067 },
    a4: { label: 'A4 / Print', hint: '210×297 mm', h: 849 },
};
export const DEFAULT_SIZE = 'post';

export const setDesignHeight = (sizeKey) => {
    DESIGN_H = (SIZES[sizeKey] || SIZES[DEFAULT_SIZE]).h;
    return DESIGN_H;
};

export const POSTER_W = 1080;
export const DESIGN_SCALE = POSTER_W / DESIGN_W; // 1.8

export const REM = 16;
export const rem = (n) => n * REM;
