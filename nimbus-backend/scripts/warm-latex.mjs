// Compile a tiny document once so Tectonic downloads and caches every package the report template needs.
// Run after installing Tectonic (and once on every new server):  npm run latex:warmup
import 'dotenv/config';
import { buildReportLatex } from '../src/services/latex/template.js';
import { compileLatex } from '../src/services/latex/compile.service.js';

process.env.TECTONIC_TIMEOUT_MS = process.env.TECTONIC_TIMEOUT_MS || '600000';
const doc = {
    title: 'Warm-up', meta: [{ label: 'Date', value: 'today' }], summary: 'Cache warm-up.',
    sections: [{ heading: 'Table', paragraphs: ['Text'], bullets: ['a', 'b'], table: { columns: ['A', 'B'], rows: [['1', '2']] } }],
    actionItems: [{ task: 'x', owner: 'y', due: 'z' }], conclusion: 'Done.',
};
console.log('Compiling a sample report (the first run downloads LaTeX packages and can take a few minutes)...');
const t = Date.now();
const pdf = await compileLatex(buildReportLatex(doc));
console.log(`OK: ${pdf.length} bytes in ${Math.round((Date.now() - t) / 1000)}s. LaTeX reports are ready.`);
