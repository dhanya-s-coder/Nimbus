import { spawn } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ASSET_DIR = path.resolve(here, '../../../assets/latex');
const LOCAL_TECTONIC = path.resolve(here, '../../../tools/tectonic/tectonic.exe');

export const MAX_SOURCE_BYTES = 200 * 1024;

// Packages a user may load from the editor (tectonic downloads packages on demand, so keep this list closed).
const ALLOWED_PACKAGES = new Set([
    'geometry', 'graphicx', 'booktabs', 'array', 'tabularx', 'longtable', 'enumitem', 'xcolor', 'colortbl', 'fancyhdr', 'titlesec',
    'lastpage', 'hyperref', 'parskip', 'amsmath', 'amssymb', 'multirow', 'makecell', 'float', 'caption', 'setspace', 'microtype',
    'lmodern', 'fontenc', 'inputenc', 'textcomp', 'siunitx', 'mathtools', 'pdflscape', 'ragged2e', 'tcolorbox', 'listings', 'url',
    'titling', 'multicol', 'wrapfig', 'subcaption', 'tikz', 'pgfplots', 'xspace', 'etoolbox', 'calc', 'ifthen', 'enumerate', 'babel',
]);

export class LatexError extends Error {
    constructor(message, { status = 422, log = '' } = {}) {
        super(message);
        this.name = 'LatexError';
        this.status = status;
        this.log = log;
    }
}

/** Reject anything that could read/write files or run commands, or pull in arbitrary packages. */
export const validateLatex = (src) => {
    if (typeof src !== 'string' || !src.trim()) throw new LatexError('LaTeX source is empty', { status: 400 });
    if (Buffer.byteLength(src) > MAX_SOURCE_BYTES) throw new LatexError('LaTeX source is too large (max 200 KB)', { status: 413 });
    const banned = [
        [/\\write18|\\immediate\s*\\write|\\openout|\\openin|\\read\b|\\newread|\\newwrite|\\closeout|\\closein/, 'file/command access commands are not allowed'],
        [/\\(input|include|InputIfFileExists|lstinputlisting|verbatiminput|openin)\b/, '\\input / \\include are not allowed'],
        [/\\catcode|\\csname\s*write|\\directlua|\\ShellEscape|\\pdfshellescape/, 'low-level commands are not allowed'],
    ];
    for (const [re, msg] of banned) if (re.test(src)) throw new LatexError(`Not allowed: ${msg}`, { status: 400 });

    for (const m of src.matchAll(/\\(?:usepackage|RequirePackage)(?:\[[^\]]*\])?\{([^}]*)\}/g)) {
        for (const pkg of m[1].split(',').map((p) => p.trim()).filter(Boolean)) {
            if (!ALLOWED_PACKAGES.has(pkg)) throw new LatexError(`Package "${pkg}" is not allowed. Allowed: ${[...ALLOWED_PACKAGES].sort().join(', ')}`, { status: 400 });
        }
    }
    for (const m of src.matchAll(/\\includegraphics(?:\[[^\]]*\])?\{([^}]*)\}/g)) {
        if (!/^[\w.-]+$/.test(m[1]) || m[1].includes('..')) throw new LatexError(`Image "${m[1]}" is not allowed (only bundled images such as cses-logo.png)`, { status: 400 });
    }
};

const tectonicCmd = async () => {
    if (process.env.TECTONIC_PATH) return process.env.TECTONIC_PATH;
    try { await fs.access(LOCAL_TECTONIC); return LOCAL_TECTONIC; } catch { return 'tectonic'; }
};

// at most N compiles at once (each is CPU heavy)
let active = 0;
const waiters = [];
const acquire = () => new Promise((res) => {
    const max = Number(process.env.LATEX_MAX_PARALLEL) || 2;
    if (active < max) { active += 1; res(); } else waiters.push(res);
});
const release = () => { const next = waiters.shift(); if (next) next(); else active -= 1; };

const friendlyLog = (log) => {
    const lines = log.split(/\r?\n/);
    const key = lines.filter((l) => /^(error|!)|Undefined control sequence|Missing|Runaway|File `.*' not found|LaTeX Error/i.test(l.trim()));
    return (key.length ? key : lines.slice(-25)).slice(0, 25).join('\n').trim();
};

/** Compile LaTeX source to a PDF Buffer with Tectonic (sandboxed temp dir, --untrusted, hard timeout). */
export const compileLatex = async (source) => {
    validateLatex(source);
    const cmd = await tectonicCmd();
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'nimbus-tex-'));
    await acquire();
    try {
        await fs.writeFile(path.join(dir, 'main.tex'), source, 'utf8');
        for (const f of await fs.readdir(ASSET_DIR).catch(() => [])) await fs.copyFile(path.join(ASSET_DIR, f), path.join(dir, f));

        const timeoutMs = Number(process.env.TECTONIC_TIMEOUT_MS) || 120000;
        const { code, output, timedOut, spawnError } = await new Promise((resolve) => {
            let output = '';
            let timedOut = false;
            const child = spawn(cmd, ['-X', 'compile', 'main.tex', '--untrusted'], { cwd: dir, windowsHide: true });
            const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, timeoutMs);
            child.stdout.on('data', (d) => { output += d; });
            child.stderr.on('data', (d) => { output += d; });
            child.on('error', (e) => { clearTimeout(timer); resolve({ code: -1, output, timedOut, spawnError: e }); });
            child.on('close', (c) => { clearTimeout(timer); resolve({ code: c, output, timedOut }); });
        });

        if (spawnError) throw new LatexError('The LaTeX engine (Tectonic) is not installed on the server. Set TECTONIC_PATH or run the setup in the README.', { status: 503, log: String(spawnError.message) });
        if (timedOut) throw new LatexError('Compilation timed out. The first compile on a new machine downloads packages and can take a few minutes; try again.', { status: 504, log: friendlyLog(output) });
        if (code !== 0) throw new LatexError('LaTeX compile failed. See the log below.', { log: friendlyLog(output) });
        return await fs.readFile(path.join(dir, 'main.pdf'));
    } finally {
        release();
        fs.rm(dir, { recursive: true, force: true }).catch(() => {});
    }
};
