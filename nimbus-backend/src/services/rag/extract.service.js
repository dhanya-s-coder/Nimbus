import path from 'path';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse/lib/pdf-parse.js'; // import the lib directly: the package index runs a debug read on import

const MAX_CHARS = 200000;

/** Plain text from an uploaded PDF / DOCX / TXT / MD / CSV buffer. */
export const extractText = async ({ buffer, originalname = '', mimetype = '' }) => {
    const ext = path.extname(originalname).toLowerCase();
    let text;
    if (ext === '.pdf' || mimetype === 'application/pdf') {
        text = (await pdfParse(buffer)).text;
    } else if (ext === '.docx' || mimetype.includes('wordprocessingml')) {
        text = (await mammoth.extractRawText({ buffer })).value;
    } else if (['.txt', '.md', '.markdown', '.csv'].includes(ext) || mimetype.startsWith('text/')) {
        text = buffer.toString('utf8');
    } else {
        const e = new Error('Unsupported file type. Upload a PDF, DOCX, TXT or MD file.');
        e.status = 415;
        throw e;
    }
    text = String(text || '').replace(/\u0000/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    if (!text) {
        const e = new Error('No readable text found in that file (scanned PDFs need OCR).');
        e.status = 422;
        throw e;
    }
    return text.slice(0, MAX_CHARS);
};
