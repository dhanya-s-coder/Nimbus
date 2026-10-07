import { z } from 'zod';
import { runGeneration } from './rag/orchestrator.service.js';

const MOODS = ['formal', 'elegant', 'playful', 'energetic', 'tech', 'minimal'];

const hex = z.string().regex(/^#?[0-9a-fA-F]{6}$/).transform((c) => (c.startsWith('#') ? c : `#${c}`).toLowerCase());
const schema = z.object({
    imagePrompt: z.string().min(12).transform((t) => t.slice(0, 900)),
    mood: z.string().transform((m) => (MOODS.includes(m.toLowerCase()) ? m.toLowerCase() : 'minimal')).default('minimal'),
    colors: z.array(z.string()).default([]).transform((arr) => arr.map((c) => hex.safeParse(c)).filter((r) => r.success).map((r) => r.data).slice(0, 3)),
});

/** Rules every background must follow, whatever the art director wrote. */
export const BACKGROUND_RULES = `poster background artwork only, empty clean composition with calm space for text overlay,
NO text, NO letters, NO words, NO typography, NO watermarks, NO logos, NO people, NO faces, NO hands,
vertical portrait orientation, 4:5 aspect ratio, high quality`;

const TEMPLATE_HINT = {
    academic: 'an academic talk / seminar',
    recruitment: 'a student society recruitment drive',
    event: 'a college fest / cultural or social event',
    hackathon: 'a hackathon / coding competition',
    announcement: 'an official notice / announcement',
};

/**
 * "Art director": turns the poster details + the user's style notes + brand knowledge (RAG) into
 *   { imagePrompt, mood, colors[] }.  The caller must fall back to the keyword prompt when this throws.
 */
export const planArtDirection = async ({ userId, templateType, formData = {}, instruction = '', textProvider }) => {
    const title = formData.eventTitle || formData.eventName || formData.announcementTitle || formData.recruitmentTitle || '';
    const org = formData.organizer || formData.department || formData.teamName || formData.issuedBy || '';
    const style = String(instruction || '').slice(0, 400);
    const result = await runGeneration({
        kind: 'art-direction', userId, textProvider, k: 6,
        types: ['brand_kit', 'past_event', 'template_copy', 'note'],
        query: [title, TEMPLATE_HINT[templateType], org, style, 'brand colours visual style mood'].filter(Boolean).join(' '),
        input: { templateType, title, style },
        systemPrompt: 'You are an award-winning poster art director. You output only JSON.',
        schema,
        buildPrompt: (context) => `Write the brief for the BACKGROUND ARTWORK of a poster for ${TEMPLATE_HINT[templateType] || 'an event'}.
Title: ${title || '(untitled)'}
${org ? `Organiser: ${org}\n` : ''}${formData.colorPreference ? `Colour preference: ${formData.colorPreference}\n` : ''}${style ? `The user's style notes (highest priority, follow them): ${style}\n` : ''}
${context}

If the knowledge base describes the brand's colours, tone or imagery, honour it (it ranks below the user's style notes).
Return JSON exactly like:
{"imagePrompt": "<one rich paragraph for an AI image generator: subject/scene, art style, lighting, colour palette, texture, composition>", "mood": "formal|elegant|playful|energetic|tech|minimal", "colors": ["#rrggbb", "#rrggbb"]}
Rules for imagePrompt:
- Describe an abstract, architectural, environmental or graphic backdrop that suits the topic. Never include readable text, letters, logos, people or faces.
- Keep the centre and lower third calm (soft gradients, bokeh, gentle shapes) so headline text stays readable.
- Name the colour palette in words.
"colors": 1-3 dominant hex colours of the artwork/brand (from the knowledge base or style notes if given, otherwise the palette you described).`,
    });
    return { ...result.output, sources: result.sources, grounded: result.grounded };
};
