import { z } from 'zod';
import { runGeneration } from './rag/orchestrator.service.js';
import { buildReportLatex } from './latex/template.js';

// Models sometimes return a string where a list is expected (or the reverse): be tolerant.
const toList = (v) => (Array.isArray(v) ? v.map(String) : typeof v === 'string' && v.trim() ? v.split(/\n+/).map((x) => x.replace(/^[-•*]\s*/, '').trim()).filter(Boolean) : []);
const str = (max) => z.preprocess((v) => (v == null ? '' : Array.isArray(v) ? v.join(' ') : String(v)), z.string()).transform((s) => s.trim().slice(0, max));
const list = (max, each = 400) => z.preprocess(toList, z.array(z.string())).default([]).transform((a) => a.map((x) => x.slice(0, each)).slice(0, max));

const tableSchema = z.object({
    columns: z.preprocess(toList, z.array(z.string())).transform((a) => a.slice(0, 6)),
    rows: z.array(z.preprocess(toList, z.array(z.string()))).default([]).transform((r) => r.slice(0, 40)),
}).nullish().transform((t) => (t && t.columns.length ? t : undefined));

export const reportDocSchema = z.object({
    title: str(160),
    subtitle: str(200).optional(),
    meta: z.array(z.object({ label: str(40), value: str(300) })).default([]).transform((m) => m.filter((x) => x.label && x.value).slice(0, 10)),
    summary: str(900).optional(),
    sections: z.array(z.object({
        heading: str(120),
        paragraphs: list(8, 1200),
        bullets: list(14, 400),
        table: tableSchema.optional(),
    })).default([]).transform((s) => s.filter((x) => x.heading).slice(0, 12)),
    actionItems: z.array(z.object({ task: str(300), owner: str(80).optional(), due: str(60).optional() })).default([]).transform((a) => a.filter((x) => x.task).slice(0, 25)),
    conclusion: str(900).optional(),
});

const GUIDE = {
    'Meeting Minutes': 'Meta: Date, Time, Venue, Chairperson, Attendees, Absent (only if given). Sections in order: Agenda (bullets), Discussion Points, Decisions Made. Fill actionItems (task, owner, due) from the notes.',
    'Event Summary': 'Meta: Event, Date, Venue, Organiser, Participants/Attendance (only if given). Sections: Overview, Participation (use a table if numbers per category/round exist), Key Highlights (bullets), Challenges, Recommendations. Fill actionItems only for concrete follow-ups.',
    'Monthly Progress': 'Meta: Month, Prepared by, Team/Department. Sections: Metrics (table with Metric | Target | Achieved when numbers exist), Achievements (bullets), Challenges, Goals for next month. Fill actionItems for next steps.',
};

/**
 * Notes (+ Knowledge Base facts) -> structured report -> LaTeX source.
 * The model returns DATA; our template turns it into LaTeX, so output always compiles and always looks consistent.
 */
export const generateReportLatex = async ({ userId, reportType, title, rawInput, textProvider, organization = 'CSE Society' }) => {
    const today = new Date().toISOString().slice(0, 10);
    const result = await runGeneration({
        kind: 'report-latex', userId, textProvider, k: 6,
        query: `${reportType} ${title} ${String(rawInput).slice(0, 300)}`,
        input: { reportType, title },
        systemPrompt: 'You are an expert administrative writer. You output only JSON.',
        schema: reportDocSchema,
        buildPrompt: (context) => `Write a professional "${reportType}" titled "${title}" for ${organization}. Today's date: ${today}.

NOTES FROM THE USER (the main source of facts):
"""
${String(rawInput).slice(0, 8000)}
"""
${context}

${GUIDE[reportType] || 'Choose clear sections that suit the content. Use tables for tabular data.'}
Rules:
- Use formal, concise language. Use ONLY facts from the user's notes or the knowledge base. If something important is missing, write "To be confirmed" instead of inventing it.
- No markdown except **bold** for emphasis inside text. No LaTeX commands. No emoji.
- Put numeric/tabular data into section tables ("table": {"columns": [...], "rows": [[...]]}).
Return JSON exactly like:
{"title": "...", "subtitle": "...", "meta": [{"label": "Date", "value": "..."}], "summary": "2-3 sentence executive summary",
 "sections": [{"heading": "...", "paragraphs": ["..."], "bullets": ["..."], "table": null}],
 "actionItems": [{"task": "...", "owner": "...", "due": "..."}], "conclusion": "..."}`,
    });
    const doc = { ...result.output, title: result.output.title || title };
    return { latex: buildReportLatex(doc, { organization, reportType }), doc, sources: result.sources, grounded: result.grounded, runId: result.runId };
};
