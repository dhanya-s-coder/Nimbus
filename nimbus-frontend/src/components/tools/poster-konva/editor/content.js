// Wording edits made on the poster itself (select an element in the Edit tab, change its text).
// They live in custom.content and are laid over the poster data BEFORE the layout runs, so the layout measures
// and auto-fits the new words exactly like the original ones. Generate (a fresh form) starts clean again.

/** Built-in element id -> field of the normalised poster data that it shows. */
export const CONTENT_FIELD = {
    title: 'title',
    sub: 'subtitle',
    org: 'organizer', kicker: 'organizer',
    desc: 'description',
    spk: 'speakerName', des: 'speakerDesignation',
    footer: 'footer',
};
export const INFO_IDS = ['info', 'grid', 'infostack'];   // Date / Time / Venue rows
export const EXTRA_IDS = ['extra', 'cards'];             // Prizes / Highlights ... rows

const TEXT_FIELDS = ['title', 'subtitle', 'organizer', 'description', 'speakerName', 'speakerDesignation', 'footer'];

/** Poster data with the user's wording edits applied (returns the same object when there are none). */
export const applyContent = (data, content) => {
    if (!content) return data;
    const out = { ...data };
    TEXT_FIELDS.forEach((k) => { if (content[k] !== undefined) out[k] = content[k]; });
    if (content.infoItems) out.infoItems = content.infoItems;
    if (content.extraItems) out.extraItems = content.extraItems;
    return out;
};

/** Is anything about this element's wording changed from the form? */
export const isEdited = (id, content) => {
    if (!content) return false;
    if (CONTENT_FIELD[id]) return content[CONTENT_FIELD[id]] !== undefined;
    if (INFO_IDS.includes(id)) return !!content.infoItems;
    if (EXTRA_IDS.includes(id)) return !!content.extraItems;
    return false;
};

/** Content without the keys that belong to this element (undefined when nothing is left). */
export const withoutElement = (id, content = {}) => {
    const next = { ...content };
    if (CONTENT_FIELD[id]) delete next[CONTENT_FIELD[id]];
    if (INFO_IDS.includes(id)) delete next.infoItems;
    if (EXTRA_IDS.includes(id)) delete next.extraItems;
    return Object.keys(next).length ? next : undefined;
};

/** Extra-detail values are strings or lists of bullets; the editor shows one bullet per line. */
export const valueToText = (v) => (Array.isArray(v) ? v.join('\n') : String(v ?? ''));
export const textToValue = (t) => (String(t).includes('\n') ? String(t).split('\n') : String(t));
