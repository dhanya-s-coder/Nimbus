// Analyse reference posters with the vision model and store them as shared (global) style knowledge.
// usage: node scripts/seed-style-library.mjs <folder-with-posters> [--user]   (default scope: global)
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { analyzePosterImage, styleCardToText } from '../src/services/rag/styleAnalyzer.service.js';
import { ingestText } from '../src/services/rag/ingest.service.js';

const dir = process.argv[2];
const scope = process.argv.includes('--user') ? 'user' : 'global';
if (!dir || !fs.existsSync(dir)) { console.error('Pass a folder with poster images'); process.exit(1); }
const files = fs.readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort();
const mime = (f) => ({ '.png': 'image/png', '.webp': 'image/webp' }[path.extname(f).toLowerCase()] || 'image/jpeg');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let n = 0;
for (const f of files) {
    if (n++) await sleep(Number(process.env.SEED_DELAY_MS) || 14000); // stay under the free-tier request limit
    try {
        const card = await analyzePosterImage({ buffer: fs.readFileSync(path.join(dir, f)), mimeType: mime(f) });
        const r = await ingestText({ ownerId: null, scope, type: 'poster_style', title: card.name, text: styleCardToText(card), metadata: { card, file: f } });
        console.log(`OK   ${f} -> "${card.name}" [${card.layoutType}] ${r.duplicate ? '(already stored)' : `${r.chunks} chunk(s)`}`);
    } catch (e) {
        console.log(`FAIL ${f}: ${e.message.slice(0, 160)}`);
    }
}
process.exit(0);
