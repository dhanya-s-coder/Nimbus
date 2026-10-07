// Export resolution (logical canvas). Layouts are authored in the legacy 600x750
// "design space" so existing measurements carry over; the root group scales it up.
export const POSTER_W = 1080;
export const POSTER_H = 1350;
export const DESIGN_W = 600;
export const DESIGN_H = 750;
export const DESIGN_SCALE = POSTER_W / DESIGN_W; // 1.8

export const REM = 16;
export const rem = (n) => n * REM;
