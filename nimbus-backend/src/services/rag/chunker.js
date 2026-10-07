/**
 * Split text into ~`size`-char chunks on paragraph / sentence boundaries with a small overlap,
 * so retrieved snippets stay self-contained.
 */
export const chunkText = (text, { size = 900, overlap = 120 } = {}) => {
    const clean = String(text || '').replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
    if (!clean) return [];
    if (clean.length <= size) return [clean];

    const units = clean
        .split(/\n{2,}/)
        .flatMap((p) => (p.length > size ? p.split(/(?<=[.!?])\s+/) : [p]))
        .map((s) => s.trim())
        .filter(Boolean);

    const chunks = [];
    let cur = '';
    for (const u of units) {
        if (cur && cur.length + u.length + 1 > size) {
            chunks.push(cur);
            cur = cur.slice(-overlap).replace(/^\S*\s/, '') + ' ' + u;
        } else {
            cur = cur ? `${cur}\n${u}` : u;
        }
    }
    if (cur.trim()) chunks.push(cur.trim());
    // a single unit can still exceed size (no punctuation): hard-split it
    return chunks.flatMap((c) => (c.length > size * 1.5 ? c.match(new RegExp(`[\\s\\S]{1,${size}}`, 'g')) : [c]));
};
