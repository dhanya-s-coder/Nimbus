import { escapeLatex, inline } from './escape.js';

const BRAND = '1F3A5F'; // deep navy (matches the society's look); change here to re-theme every report

const preamble = (organization, docTitle) => String.raw`\documentclass[11pt,a4paper]{article}
\usepackage[margin=2.2cm,top=2.8cm,bottom=2.4cm,headheight=1.6cm]{geometry}
\usepackage{graphicx}
\usepackage{booktabs,array,tabularx,longtable}
\usepackage{enumitem}
\usepackage[table]{xcolor}
\usepackage{fancyhdr}
\usepackage{titlesec}
\usepackage{lastpage}
\usepackage[hidelinks]{hyperref}
\usepackage{parskip}
\definecolor{brand}{HTML}{${BRAND}}
\definecolor{soft}{HTML}{EEF2F7}
\hypersetup{pdftitle={${escapeLatex(docTitle)}},pdfauthor={${escapeLatex(organization)}}}
\titleformat{\section}{\large\bfseries\color{brand}}{}{0pt}{}[{\color{brand}\titlerule[0.6pt]}]
\titlespacing*{\section}{0pt}{1.4em}{0.6em}
\setlist{itemsep=2pt,topsep=4pt}
\renewcommand{\arraystretch}{1.25}
\pagestyle{fancy}\fancyhf{}
\renewcommand{\headrulewidth}{0.4pt}
\lhead{\includegraphics[height=0.95cm]{cses-logo.png}}
\rhead{\small\color{brand}\textbf{${escapeLatex(organization)}}}
\cfoot{\small Page \thepage\ of \pageref{LastPage}}
\setlength{\parindent}{0pt}
`;

const table = (t) => {
    const cols = (t.columns || []).slice(0, 6);
    if (!cols.length) return '';
    const spec = `*{${cols.length}}{>{\\raggedright\\arraybackslash}X}`;
    const head = cols.map((c) => `\\textbf{${inline(c)}}`).join(' & ');
    const rows = (t.rows || []).slice(0, 40).map((r) => cols.map((_, i) => inline(r[i] ?? '')).join(' & ') + ' \\\\').join('\n');
    return `\\begin{center}\n\\begin{tabularx}{\\linewidth}{${spec}}\n\\toprule\n\\rowcolor{soft} ${head} \\\\\n\\midrule\n${rows}\n\\bottomrule\n\\end{tabularx}\n\\end{center}`;
};

const section = (s) => {
    const out = [`\\section*{${inline(s.heading)}}`];
    (s.paragraphs || []).forEach((p) => out.push(inline(p), ''));
    if (s.bullets?.length) out.push('\\begin{itemize}[leftmargin=*]', ...s.bullets.map((b) => `  \\item ${inline(b)}`), '\\end{itemize}', '');
    if (s.table) out.push(table(s.table), '');
    return out.join('\n');
};

/**
 * Structured report data -> a complete, compilable LaTeX document.
 * doc = { title, subtitle?, meta:[{label,value}], summary?, sections:[{heading, paragraphs[], bullets[], table?}],
 *         actionItems?:[{task, owner, due}], conclusion? }
 */
export const buildReportLatex = (doc, { organization = 'CSE Society', reportType = 'Report' } = {}) => {
    const parts = [preamble(organization, doc.title), '\\begin{document}', ''];

    parts.push('\\begin{center}',
        `{\\color{brand}\\scshape\\large ${escapeLatex(reportType)}}\\\\[0.5em]`,
        `{\\Huge\\bfseries ${inline(doc.title)}}`,
        ...(doc.subtitle && doc.subtitle.trim().toLowerCase() !== String(reportType).trim().toLowerCase() ? [`\\\\[0.5em]{\\large ${inline(doc.subtitle)}}`] : []),
        '\\end{center}', '\\vspace{0.4em}', '');

    if (doc.meta?.length) {
        // plain tabular (not tabularx) + parskip off inside cells keeps label and value on the same baseline
        parts.push(String.raw`{\setlength{\parskip}{0pt}\small`, String.raw`\begin{center}`,
            String.raw`\begin{tabular}{@{}>{\bfseries\color{brand}}l@{\hspace{1.6em}}p{0.68\linewidth}@{}}`, String.raw`\toprule`,
            ...doc.meta.slice(0, 12).map((m) => `${inline(m.label)} & ${inline(m.value)} \\\\`),
            String.raw`\bottomrule`, String.raw`\end{tabular}`, String.raw`\end{center}}`, '');
    }
    if (doc.summary) {
        parts.push('\\colorbox{soft}{\\parbox{\\dimexpr\\linewidth-2\\fboxsep\\relax}{\\textbf{\\color{brand}Summary}\\\\[2pt]', inline(doc.summary), '}}', '\\medskip', '');
    }
    (doc.sections || []).forEach((s) => parts.push(section(s)));

    if (doc.actionItems?.length) {
        parts.push('\\section*{Action Items}',
            '\\begin{tabularx}{\\linewidth}{>{\\raggedright\\arraybackslash}X >{\\raggedright\\arraybackslash}p{0.2\\linewidth} >{\\raggedright\\arraybackslash}p{0.17\\linewidth}}',
            '\\toprule', '\\rowcolor{soft} \\textbf{Task} & \\textbf{Owner} & \\textbf{Due} \\\\', '\\midrule',
            ...doc.actionItems.slice(0, 30).map((a) => `${inline(a.task)} & ${inline(a.owner || '--')} & ${inline(a.due || '--')} \\\\`),
            '\\bottomrule', '\\end{tabularx}', '');
    }
    if (doc.conclusion) parts.push('\\section*{Conclusion}', inline(doc.conclusion), '');

    parts.push('\\vfill', '{\\footnotesize\\color{gray} Prepared with Nimbus for ' + escapeLatex(organization) + '.}', '\\end{document}', '');
    return parts.join('\n');
};
