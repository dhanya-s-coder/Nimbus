import { POSTER_W, SIZES, DEFAULT_SIZE } from './constants';

/**
 * Render the stage at `outputWidth` px wide (default 2x the 1080 logical width) and return a Blob.
 * Same stage that is on screen -> exact WYSIWYG. mimeType: image/png | image/jpeg.
 */
export const exportPosterBlob = (stage, { outputWidth = POSTER_W * 2, mimeType = 'image/png', quality = 0.95 } = {}) =>
    new Promise((resolve, reject) => {
        if (!stage) return reject(new Error('Poster stage not ready'));
        const pixelRatio = outputWidth / stage.width();
        // selection handles / guides / hover outlines must never reach the exported file
        const ui = stage.find('.editor-ui');
        const was = ui.map((n) => n.visible());
        ui.forEach((n) => n.visible(false));
        const restore = () => ui.forEach((n, i) => n.visible(was[i]));
        stage.toBlob({
            pixelRatio,
            mimeType,
            quality,
            callback: (blob) => { restore(); return blob ? resolve(blob) : reject(new Error('Export failed')); },
        });
    });

const blobToDataUrl = (blob) =>
    new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(blob);
    });

/** One-page PDF sized to the poster (A4 preset prints at true A4). jsPDF is loaded on demand. */
export const exportPosterPdf = async (stage, { sizeKey = DEFAULT_SIZE, outputWidth = POSTER_W * 2 } = {}) => {
    const jpeg = await exportPosterBlob(stage, { outputWidth, mimeType: 'image/jpeg', quality: 0.95 });
    const dataUrl = await blobToDataUrl(jpeg);
    const { jsPDF } = await import('jspdf');
    const preset = SIZES[sizeKey] || SIZES[DEFAULT_SIZE];
    // PDF user units: points. A4 = 595x842pt; other presets keep the same 595pt width.
    const w = 595.28;
    const h = (w * preset.h) / 600;
    const pdf = new jsPDF({ unit: 'pt', format: [w, h], orientation: 'portrait', compress: true });
    pdf.addImage(dataUrl, 'JPEG', 0, 0, w, h, undefined, 'FAST');
    return pdf.output('blob');
};

export const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
};

/** Downscale an uploaded photo to <= maxDim and re-encode as JPEG (keeps saves small). */
export const fileToPhotoDataUrl = (file, maxDim = 1800) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            const img = new window.Image();
            img.onerror = () => reject(new Error('Could not read that image'));
            img.onload = () => {
                const r = Math.min(1, maxDim / Math.max(img.width, img.height));
                const c = document.createElement('canvas');
                c.width = Math.round(img.width * r);
                c.height = Math.round(img.height * r);
                c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
                resolve(c.toDataURL('image/jpeg', 0.9));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
