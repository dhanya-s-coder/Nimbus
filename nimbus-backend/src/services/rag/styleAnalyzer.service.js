import { z } from 'zod';
import { TextFactory } from '../ai/text/text.factory.js';

// models sometimes return a list where text is expected (or a string where a list is expected): be tolerant
const text = (max, dflt = '') => z.preprocess((v) => (Array.isArray(v) ? v.join('; ') : v ?? dflt), z.string()).transform((s) => String(s).slice(0, max));
const asList = (v) => (Array.isArray(v) ? v : typeof v === 'string' && v ? v.split(/[;\n]/).map((x) => x.trim()).filter(Boolean) : []);
const list = (max = 8) => z.preprocess(asList, z.array(z.string())).default([]).transform((a) => a.map((x) => String(x).slice(0, 160)).slice(0, max));
const hex = z.string().regex(/^#?[0-9a-fA-F]{6}$/).transform((c) => (c.startsWith('#') ? c : `#${c}`).toLowerCase());

export const styleCardSchema = z.object({
    name: text(80, 'Reference poster'),
    eventType: text(60, 'event'),
    layoutType: text(200, ''),
    composition: text(500, ''),
    palette: z.preprocess(asList, z.array(z.string())).default([]).transform((a) => a.map((c) => hex.safeParse(c)).filter((r) => r.success).map((r) => r.data).slice(0, 6)),
    colorStory: text(300, ''),
    typography: text(400, ''),
    motifs: list(8),
    textures: list(6),
    infoStructure: list(8),
    extras: list(8),          // logos, QR codes, badges, callouts, script annotations...
    mood: text(120, ''),
    strengths: list(6),
    doNotCopy: list(8),       // specific subjects/people/wording that must not be reused
    bestFor: list(6),
});

const PROMPT = `You are a senior poster designer analysing a reference poster made by a university department society.
Describe its DESIGN CRAFT so that another designer could take inspiration from it without copying it. Be specific and concrete.
Return JSON with exactly these keys:
{
 "name": "short descriptive name of the style (not the event name)",
 "eventType": "e.g. competition | cultural fest | tech talk | workshop | social event",
 "layoutType": "e.g. full-bleed collage | torn-paper centre panel | diagonal split with cut-out photo | badge title on organic shapes",
 "composition": "where the title, visuals and info blocks sit; hierarchy and balance",
 "palette": ["#rrggbb", ... up to 6 dominant colours],
 "colorStory": "how colour is used (contrast, accent, discipline)",
 "typography": "display/accent/body font styles (e.g. condensed outline + solid, handwritten script accent), sizes and hierarchy",
 "motifs": ["recurring graphic ideas, e.g. paint stroke, torn paper, halftone"],
 "textures": ["paper grain, newsprint, noise ..."],
 "infoStructure": ["how date/time/venue/prizes/speaker details are presented, e.g. icon rows with divider lines, timeline with dots"],
 "extras": ["logos placement, QR codes and their labels, badges, callouts, script annotations, arrows"],
 "mood": "3-5 adjectives",
 "strengths": ["what makes it effective"],
 "doNotCopy": ["specific subjects, people, event names, slogans or illustrations that are particular to THIS poster and must not be reused"],
 "bestFor": ["kinds of events this style suits"]
}
Never transcribe personal names of people shown; refer to them generically (e.g. "a speaker portrait").`;

/** Vision analysis of one poster image -> validated style card. */
export const analyzePosterImage = async ({ buffer, mimeType = 'image/png', textProvider }) => {
    const raw = await TextFactory.generateJSON({
        customProvider: textProvider,
        prompt: PROMPT,
        systemPrompt: 'You are a precise design analyst. You output only JSON.',
        images: [{ data: buffer, mimeType }],
    });
    const parsed = styleCardSchema.safeParse(raw);
    if (!parsed.success) {
        const e = new Error(`Could not understand that poster (${parsed.error.issues[0]?.message || 'invalid analysis'})`);
        e.status = 502;
        throw e;
    }
    return parsed.data;
};

/** Plain-text rendering of a card: this is what gets chunked, embedded and retrieved. */
export const styleCardToText = (c) => [
    `POSTER STYLE REFERENCE: ${c.name} (${c.eventType}). Best for: ${c.bestFor.join(', ') || c.eventType}.`,
    `Layout: ${c.layoutType}. ${c.composition}`,
    `Colour: ${c.palette.join(', ')}. ${c.colorStory}`,
    `Typography: ${c.typography}`,
    c.motifs.length ? `Motifs: ${c.motifs.join('; ')}.` : '',
    c.textures.length ? `Textures: ${c.textures.join('; ')}.` : '',
    c.infoStructure.length ? `Information design: ${c.infoStructure.join('; ')}.` : '',
    c.extras.length ? `Extras: ${c.extras.join('; ')}.` : '',
    `Mood: ${c.mood}. Strengths: ${c.strengths.join('; ')}.`,
    c.doNotCopy.length ? `Do NOT reuse (specific to this poster): ${c.doNotCopy.join('; ')}.` : '',
].filter(Boolean).join('\n');
