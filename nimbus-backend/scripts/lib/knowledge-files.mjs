import fs from 'fs/promises';
import path from 'path';
import { extractText } from '../../src/services/rag/extract.service.js';
import { SOURCE_TYPES } from '../../src/services/rag/ingest.service.js';

// files we never load: README, names starting with "_" (examples / drafts), hidden files, images
export const SKIP_FILE = /^(readme(\.\w+)?|_.*|\..*|.*\.(png|jpe?g|webp|gif|zip))$/i;

const FOLDER_TYPES = {
    brand: 'brand_kit', 'brand_kit': 'brand_kit', events: 'past_event', 'past_event': 'past_event', 'past-events': 'past_event',
    policies: 'policy', policy: 'policy', contacts: 'contact', contact: 'contact', templates: 'template_copy', 'template_copy': 'template_copy',
    notes: 'note', note: 'note', about: 'note',
};

/** Optional "--- key: value ---" header at the top of a text file. */
export const splitFrontMatter = (raw) => {
    const m = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/.exec(raw);
    if (!m) return { meta: {}, body: raw };
    const meta = {};
    for (const line of m[1].split(/\r?\n/)) {
        const kv = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line.trim());
        if (kv) meta[kv[1].toLowerCase()] = kv[2].replace(/^["']|["']$/g, '').trim();
    }
    return { meta, body: raw.slice(m[0].length) };
};

const titleFromFile = (rel) => path.basename(rel, path.extname(rel)).replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** File -> { title, type, text, tags }. Type: front matter > top folder name > "note". */
export const parseKnowledgeFile = async (absPath, rel) => {
    const ext = path.extname(absPath).toLowerCase();
    let raw;
    if (['.md', '.markdown', '.txt', '.csv'].includes(ext)) raw = await fs.readFile(absPath, 'utf8');
    else if (['.pdf', '.docx'].includes(ext)) raw = await extractText({ buffer: await fs.readFile(absPath), originalname: path.basename(absPath), mimetype: '' });
    else throw new Error(`unsupported file type "${ext}" (use .md .txt .csv .pdf .docx)`);

    const { meta, body } = ['.md', '.markdown', '.txt'].includes(ext) ? splitFrontMatter(raw) : { meta: {}, body: raw };
    const text = body.replace(/\r\n/g, '\n').trim();
    if (text.length < 20) throw new Error('file is empty or too short');

    const folder = rel.includes('/') ? rel.split('/')[0].toLowerCase() : '';
    const type = (meta.type || FOLDER_TYPES[folder] || 'note').toLowerCase();
    if (!SOURCE_TYPES.includes(type) || type === 'poster_style') throw new Error(`type "${type}" is not valid (use ${SOURCE_TYPES.filter((t) => t !== 'poster_style').join(', ')})`);

    const heading = /^#\s+(.+)$/m.exec(text)?.[1]?.trim();
    return { title: (meta.title || heading || titleFromFile(rel)).slice(0, 120), type, text, tags: meta.tags ? meta.tags.split(/[;,]/).map((t) => t.trim()).filter(Boolean) : [] };
};
