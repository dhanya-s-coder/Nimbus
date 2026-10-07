import { POSTER_W } from './constants';

/**
 * Render the stage at `outputWidth` px wide (default 2x the 1080 logical width)
 * and return a PNG Blob. Same stage that is on screen -> exact WYSIWYG.
 */
export const exportPosterBlob = (stage, { outputWidth = POSTER_W * 2 } = {}) =>
    new Promise((resolve, reject) => {
        if (!stage) return reject(new Error('Poster stage not ready'));
        const pixelRatio = outputWidth / stage.width();
        stage.toBlob({
            pixelRatio,
            mimeType: 'image/png',
            callback: (blob) => (blob ? resolve(blob) : reject(new Error('Export failed'))),
        });
    });

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
