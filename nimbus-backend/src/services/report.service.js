import { runTextGeneration } from './rag/orchestrator.service.js';

export const generateReportContent = async ({ userId, reportType, title, rawInput, textProvider }) => {
    const buildPrompt = (context, hasContext) => `
You are an expert administrative assistant. Your task is to generate a professional, structured report based on the following details.

Report Type: ${reportType}
Report Title: ${title}
Raw Notes/Input: 
${rawInput}
${hasContext ? `
${context}

Use facts from the knowledge base (names, dates, venues, contacts, figures) only when they are clearly relevant to the request. Never invent facts that are neither in the request nor in the knowledge base.
` : ''}
Guidelines:
1. Use professional, formal language.
2. Structure the report with clear Markdown headers (# for title, ## for sections).
3. Use bullet points and tables where appropriate for clarity.
4. If it's "Meeting Minutes", include sections for Attendees, Discussion Points, Decisions Made, and Action Items.
5. If it's "Event Summary", include Participation, Key Highlights, Challenges, and Recommendations.
6. If it's "Monthly Progress", summarize metrics, achievements, and future goals.
7. Do not include conversational filler. Just the report text.

Generate the report now in English.
`;

    return runTextGeneration({
        kind: 'report', userId, textProvider, buildPrompt,
        query: `${reportType} ${title} ${String(rawInput).slice(0, 300)}`,
        input: { reportType, title },
    });
};
