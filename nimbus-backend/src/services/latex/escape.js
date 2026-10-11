// Text -> safe LaTeX. All user/AI text goes through here before it reaches a template.

// Latin Modern (the default font) has no glyph for these; map them to something that renders.
const REPLACEMENTS = [
    [/₹/g, 'Rs '], [/→|⇒|➔|➜/g, '->'], [/←/g, '<-'], [/✓|✔|☑/g, '[x]'], [/✗|✘|☐/g, '[ ]'],
    [/[•●▪◦]/g, '-'], [/…/g, '...'], [/ /g, ' '], [/[​-‏﻿]/g, ''],
    [/[“”]/g, '"'], [/[‘’]/g, "'"],
];

const SPECIALS = {
    '\\': '\\textbackslash{}', '{': '\\{', '}': '\\}', '$': '\\$', '&': '\\&', '#': '\\#', '^': '\\^{}', '_': '\\_', '%': '\\%', '~': '\\textasciitilde{}',
};

/** Escape plain text for LaTeX. Also drops emoji / astral characters that cannot be typeset. */
export const escapeLatex = (input) => {
    let s = String(input ?? '');
    for (const [re, to] of REPLACEMENTS) s = s.replace(re, to);
    s = s.replace(/[\u{10000}-\u{10FFFF}]/gu, '').replace(/[☀-➿️]/g, '');
    s = s.replace(/[\\{}$&#^_%~]/g, (c) => SPECIALS[c]);
    // straight double quotes -> typographic pairs
    s = s.replace(/"([^"]*)"/g, '``$1\'\'');
    return s;
};

/** Escape, then turn **bold** and *italic* markers (which models like to emit) into LaTeX. */
export const inline = (input) => {
    const parts = String(input ?? '').split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g);
    return parts.map((p) => {
        if (/^\*\*[^*]+\*\*$/.test(p)) return `\\textbf{${escapeLatex(p.slice(2, -2))}}`;
        if (/^\*[^*]+\*$/.test(p)) return `\\textit{${escapeLatex(p.slice(1, -1))}}`;
        return escapeLatex(p);
    }).join('');
};
