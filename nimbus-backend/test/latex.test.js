import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { escapeLatex, inline } from '../src/services/latex/escape.js';
import { buildReportLatex } from '../src/services/latex/template.js';
import { validateLatex, compileLatex, LatexError } from '../src/services/latex/compile.service.js';
import { reportDocSchema } from '../src/services/reportLatex.service.js';

test('escapeLatex neutralises every LaTeX special character and unprintable glyphs', () => {
    assert.equal(escapeLatex('50% & $5 #1 a_b {x} ~^'), String.raw`50\% \& \$5 \#1 a\_b \{x\} \textasciitilde{}\^{}`);
    assert.equal(escapeLatex('Prize ₹2500 → done 🎉'), 'Prize Rs 2500 -> done ');
    assert.match(escapeLatex('back\\slash'), /\\textbackslash\{\}/);
    assert.equal(escapeLatex('say "hi"'), "say ``hi''");
});

test('inline converts **bold** / *italic* markers after escaping', () => {
    assert.equal(inline('a **b_c** d'), String.raw`a \textbf{b\_c} d`);
    assert.equal(inline('an *emphasis* here'), String.raw`an \textit{emphasis} here`);
});

test('report schema tolerates sloppy model output', () => {
    const doc = reportDocSchema.parse({
        title: 'T', meta: [{ label: 'Date', value: 'x' }, { label: '', value: 'dropped' }],
        sections: [{ heading: 'S', paragraphs: 'one\ntwo', bullets: ['- a', 'b'], table: { columns: ['A', 'B'], rows: [['1', '2'], '3, 4'] } }, { heading: '' }],
        actionItems: [{ task: 'do it' }, { task: '' }],
    });
    assert.equal(doc.meta.length, 1);
    assert.equal(doc.sections.length, 1);
    assert.deepEqual(doc.sections[0].paragraphs, ['one', 'two']);
    assert.equal(doc.sections[0].table.rows.length, 2);
    assert.equal(doc.actionItems.length, 1);
});

test('template produces a complete document with every section', () => {
    const tex = buildReportLatex({
        title: 'Budget & Plan', subtitle: 'Event Summary', meta: [{ label: 'Date', value: '1 Jan' }], summary: 'Short.',
        sections: [{ heading: 'Numbers', paragraphs: ['p'], bullets: ['b'], table: { columns: ['A'], rows: [['1']] } }],
        actionItems: [{ task: 't', owner: 'o', due: 'd' }], conclusion: 'End.',
    }, { reportType: 'Event Summary' });
    assert.match(tex, /\\documentclass/);
    assert.match(tex, /\\end\{document\}/);
    assert.match(tex, /Budget \\& Plan/);
    assert.match(tex, /Action Items/);
    // a subtitle equal to the report type is not repeated
    assert.equal((tex.match(/Event Summary/g) || []).length, 1);
});

test('validateLatex blocks file access, shell escape, unknown packages and path images', () => {
    const wrap = (b, pre = '') => String.raw`\documentclass{article}${pre}\begin{document}${b}\end{document}`;
    assert.doesNotThrow(() => validateLatex(wrap('hello', String.raw`\usepackage{booktabs}\usepackage[margin=1cm]{geometry}`)));
    assert.doesNotThrow(() => validateLatex(wrap(String.raw`\includegraphics{cses-logo.png}`, String.raw`\usepackage{graphicx}`)));
    for (const bad of [String.raw`\input{/etc/passwd}`, String.raw`\include{x}`, String.raw`\immediate\write18{ls}`, String.raw`\openin1=secret`, String.raw`\catcode`]) {
        assert.throws(() => validateLatex(wrap(bad)), LatexError, bad);
    }
    assert.throws(() => validateLatex(wrap('x', String.raw`\usepackage{shellesc}`)), /not allowed/);
    assert.throws(() => validateLatex(wrap(String.raw`\includegraphics{../../secret.png}`)), /not allowed/);
    assert.throws(() => validateLatex(''), LatexError);
    assert.throws(() => validateLatex('x'.repeat(300 * 1024)), /too large/);
});

// real compile only when Tectonic is available (local tools/ copy, TECTONIC_PATH or PATH)
const here = path.dirname(fileURLToPath(import.meta.url));
const hasTectonic = (() => {
    if (fs.existsSync(path.resolve(here, '../tools/tectonic/tectonic.exe')) || process.env.TECTONIC_PATH) return true;
    try { execFileSync('tectonic', ['--version'], { stdio: 'ignore' }); return true; } catch { return false; }
})();

test('compiles a generated report to a real PDF', { skip: !hasTectonic && 'Tectonic not installed' }, async () => {
    const tex = buildReportLatex({ title: 'Test', meta: [], sections: [{ heading: 'A', paragraphs: ['x'] }] });
    const pdf = await compileLatex(tex);
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
});

test('compile errors carry a readable log', { skip: !hasTectonic && 'Tectonic not installed' }, async () => {
    await assert.rejects(compileLatex(String.raw`\documentclass{article}\begin{document}\nonexistentcommand\end{document}`), (e) => e instanceof LatexError && /Undefined control sequence/.test(e.log));
});
