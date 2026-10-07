import { z } from 'zod';
import { runGeneration } from './rag/orchestrator.service.js';

/** Fields the model may fill per template (everything else, incl. the title, is user-owned). */
const TITLE_FIELD = { academic: 'eventTitle', recruitment: 'recruitmentTitle', event: 'eventName', hackathon: 'eventName', announcement: 'announcementTitle' };
const CREATIVE = new Set(['description', 'subdescription', 'details', 'tagline', 'highlights', 'benefits']);
const FILLABLE = {
    academic: ['speakerName', 'speakerDesignation', 'department', 'date', 'time', 'venue', 'description', 'subdescription'],
    recruitment: ['teamName', 'description', 'subdescription', 'eligibility', 'benefits', 'deadline', 'contactInfo'],
    event: ['tagline', 'description', 'subdescription', 'date', 'time', 'venue', 'organizer', 'highlights', 'prizes'],
    hackathon: ['hackathonTheme', 'duration', 'subdescription', 'dateDuration', 'organizer', 'prizes', 'registrationDeadline'],
    announcement: ['details', 'subdescription', 'applicableTo', 'importantDates', 'issuedBy'],
};
const COLORS = ['Vibrant', 'Cool Blues', 'Warm Oranges', 'Modern Purple'];

const schema = z.object({
    fields: z.record(z.string(), z.union([z.string(), z.number()]).transform(String)).default({}),
    colorPreference: z.enum(COLORS).nullish(),
});

export const posterTemplates = () => Object.keys(FILLABLE);

/**
 * Suggest values for the EMPTY text fields of a poster form, grounded in the user's/global knowledge base.
 * Facts (dates, venues, names, prizes) are only taken from the user's input or retrieved context — never invented.
 */
export const generatePosterContent = async ({ userId, templateType, formData = {}, instruction = '', brief = '', textProvider }) => {
    const fillable = FILLABLE[templateType];
    if (!fillable) { const e = new Error(`Unknown templateType "${templateType}"`); e.status = 400; throw e; }
    const titleField = TITLE_FIELD[templateType];
    const title = String(formData[titleField] || '').trim();
    const briefText = String(brief || '').trim().slice(0, 1500);
    if (!title && !briefText) { const e = new Error('Enter a title or describe your event'); e.status = 400; throw e; }

    const given = Object.fromEntries(Object.entries(formData)
        .filter(([k, v]) => typeof v === 'string' && v.trim() && !k.toLowerCase().includes('logo') && !k.toLowerCase().includes('photo') && !k.toLowerCase().includes('qr'))
        .map(([k, v]) => [k, v.slice(0, 500)]));
    // when only a description was given, the model may also propose the title
    const targets = title ? fillable : [titleField, ...fillable];
    const empty = targets.filter((f) => !String(formData[f] || '').trim());
    if (!empty.length) return { fields: {}, colorPreference: null, sources: [], runId: null, grounded: true };

    const query = [title, templateType, given.organizer, given.department, given.teamName, briefText.slice(0, 300), instruction].filter(Boolean).join(' ');
    const result = await runGeneration({
        kind: 'poster-content', userId, query, k: 8, textProvider,
        input: { templateType, given, brief: briefText.slice(0, 300), instruction: String(instruction).slice(0, 300) },
        systemPrompt: 'You write concise, polished copy for event/society posters. You output only JSON.',
        schema,
        buildPrompt: (context) => `Poster type: ${templateType}
Title: ${title || '(not given yet)'}
${briefText ? `The user's own description of the poster (a SOURCE OF FACTS: extract dates, times, venues, names, prizes, contacts, deadlines from it; never contradict it):\n"""${briefText}"""\n` : ''}Fields already provided by the user (do not change or repeat them):
${JSON.stringify(given)}
${instruction ? `User instruction: ${String(instruction).slice(0, 300)}\n` : ''}
${context}

Fill ONLY these empty fields when you can do so well: ${JSON.stringify(empty)}
Rules:
- Creative copy fields (${[...CREATIVE].filter((f) => empty.includes(f)).join(', ') || 'none'}) may be written freshly: keep "description"/"details"/"tagline" under 90 characters; "subdescription" 2 short sentences; highlights/benefits a comma-separated list of 3-4 items.
- Factual fields (dates, times, venues, names, designations, prizes, contacts, deadlines) may ONLY come from the user's fields, the user's description or the knowledge base. If unknown, OMIT the key. Never invent facts.
- If the title is empty, propose a short, strong title (max 6 words) taken from the description.
- Also choose "colorPreference" from ${JSON.stringify(COLORS)} if the knowledge base specifies brand colours or the mood clearly suggests one, else null.
Return JSON exactly like: {"fields": {"<fieldId>": "<text>"}, "colorPreference": null}`,
    });

    // Only allow requested, still-empty, whitelisted keys; trim length.
    const fields = Object.fromEntries(Object.entries(result.output.fields)
        .filter(([k, v]) => empty.includes(k) && String(v).trim())
        .map(([k, v]) => [k, String(v).trim().slice(0, 600)]));
    return { fields, colorPreference: result.output.colorPreference || null, sources: result.sources, runId: result.runId, grounded: result.grounded, provider: result.provider };
};
