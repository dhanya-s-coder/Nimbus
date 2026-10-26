// Bulk-load shared knowledge from files in nimbus-backend/knowledge/ into Supabase.
//
//   npm run seed:knowledge                 load / update everything (shared with all users)
//   npm run seed:knowledge -- --dry-run    show what would happen, touches nothing
//   npm run seed:knowledge -- --prune      also remove shared entries whose file was deleted
//   npm run seed:knowledge -- --user <id>  load as one user's private knowledge instead
//   npm run seed:knowledge -- --dir other-folder
//
// Re-running is safe: unchanged files are skipped, edited files replace their old version.
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { parseKnowledgeFile, SKIP_FILE } from './lib/knowledge-files.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);

const root = path.resolve(here, '..', opt('--dir') || 'knowledge');
const dryRun = flag('--dry-run');
const prune = flag('--prune');
const userId = opt('--user');
const scope = userId ? 'user' : 'global';

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
});

if (!fs.existsSync(root)) { console.error(`Folder not found: ${root}`); process.exit(1); }
const files = walk(root).filter((f) => !SKIP_FILE.test(path.basename(f))).sort();
console.log(`${dryRun ? '[dry run] ' : ''}${files.length} file(s) in ${path.relative(process.cwd(), root) || root} -> ${scope === 'global' ? 'shared knowledge' : `private knowledge of user ${userId}`}\n`);

const parsed = [];
for (const f of files) {
    const rel = path.relative(root, f).replace(/\\/g, '/');
    try {
        const doc = await parseKnowledgeFile(f, rel);
        parsed.push({ rel, ...doc, hash: crypto.createHash('sha256').update(doc.text).digest('hex') });
    } catch (e) {
        console.log(`SKIP  ${rel}: ${e.message}`);
    }
}

if (dryRun) {
    for (const d of parsed) console.log(`WOULD ${d.type.padEnd(13)} ${d.rel}  ->  "${d.title}" (${d.text.length} chars, ~${Math.ceil(d.text.length / 900)} chunk(s))`);
    console.log(`\n${parsed.length} document(s) ready. Run without --dry-run to load them.`);
    process.exit(0);
}

const { getSupabase } = await import('../src/config/supabase.js');
const { ingestText } = await import('../src/services/rag/ingest.service.js');
const sb = getSupabase();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const owner = scope === 'global' ? null : userId;

// what is already stored from files (matched by relative path)
let existingQ = sb.from('knowledge_sources').select('id,content_hash,metadata').eq('scope', scope);
existingQ = owner === null ? existingQ.is('owner_id', null) : existingQ.eq('owner_id', owner);
const { data: existing, error } = await existingQ;
if (error) { console.error('Could not read Supabase:', error.message); process.exit(1); }
const byFile = new Map(existing.filter((s) => s.metadata?.file).map((s) => [s.metadata.file, s]));

let added = 0, updated = 0, same = 0, failed = 0;
for (const d of parsed) {
    const prev = byFile.get(d.rel);
    if (prev && prev.content_hash === d.hash) { same += 1; console.log(`same  ${d.rel}`); continue; }
    try {
        if (prev) await sb.from('knowledge_sources').delete().eq('id', prev.id); // replace the old version (chunks cascade)
        const r = await ingestText({ ownerId: owner, scope, type: d.type, title: d.title, text: d.text, metadata: { file: d.rel, tags: d.tags } });
        if (prev) updated += 1; else added += 1;
        console.log(`${prev ? 'upd ' : 'new '}  ${d.rel}  ->  "${d.title}" [${d.type}] ${r.chunks} chunk(s)`);
        await sleep(Number(process.env.SEED_DELAY_MS) || 700); // be gentle with the free embedding quota
    } catch (e) {
        failed += 1;
        console.log(`FAIL  ${d.rel}: ${e.message.slice(0, 140)}`);
    }
}

let pruned = 0;
if (prune) {
    const keep = new Set(parsed.map((d) => d.rel));
    for (const [file, s] of byFile) if (!keep.has(file)) { await sb.from('knowledge_sources').delete().eq('id', s.id); pruned += 1; console.log(`gone  ${file} (removed from the database)`); }
}
console.log(`\nDone: ${added} new, ${updated} updated, ${same} unchanged, ${failed} failed${prune ? `, ${pruned} pruned` : ''}.`);
process.exit(failed ? 1 : 0);
