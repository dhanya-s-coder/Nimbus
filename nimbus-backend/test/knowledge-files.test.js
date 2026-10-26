import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { splitFrontMatter, parseKnowledgeFile, SKIP_FILE } from '../scripts/lib/knowledge-files.mjs';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-test-'));
const write = (rel, content) => { const p = path.join(tmp, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, content); return p; };

test('front matter is split off and read', () => {
    const { meta, body } = splitFrontMatter('---\ntitle: "Hello"\ntype: policy\ntags: a, b\n---\nBody text');
    assert.equal(meta.title, 'Hello');
    assert.equal(meta.type, 'policy');
    assert.equal(body, 'Body text');
    assert.deepEqual(splitFrontMatter('no header').meta, {});
});

test('type comes from the header, else the folder, else note; title from header, heading or file name', async () => {
    const a = await parseKnowledgeFile(write('events/udbhav-2025.md', '# Udbhav 2025\nThe cultural fest was held on 29 August 2025 at Penman Auditorium.'), 'events/udbhav-2025.md');
    assert.equal(a.type, 'past_event');
    assert.equal(a.title, 'Udbhav 2025');
    const b = await parseKnowledgeFile(write('misc/who-we-are.txt', 'We are a student society of the CSE department at IIT (ISM).'), 'misc/who-we-are.txt');
    assert.equal(b.type, 'note');
    assert.equal(b.title, 'Who We Are');
    const c = await parseKnowledgeFile(write('events/x.md', '---\ntype: brand_kit\n---\nBrand colours are navy and mint green for every poster.'), 'events/x.md');
    assert.equal(c.type, 'brand_kit');
});

test('bad input is rejected with a clear reason', async () => {
    await assert.rejects(parseKnowledgeFile(write('a/tiny.md', 'short'), 'a/tiny.md'), /too short/);
    await assert.rejects(parseKnowledgeFile(write('a/t.md', '---\ntype: banana\n---\nSome long enough text for the check to pass here.'), 'a/t.md'), /not valid/);
    await assert.rejects(parseKnowledgeFile(write('a/t.md', '---\ntype: poster_style\n---\nSome long enough text for the check to pass here.'), 'a/t.md'), /not valid/);
    await assert.rejects(parseKnowledgeFile(write('a/pic.xyz', 'whatever whatever whatever'), 'a/pic.xyz'), /unsupported/);
});

test('README, underscore files, hidden files and images are never loaded', () => {
    for (const n of ['README.md', 'readme.txt', '_example.md', '.DS_Store', 'logo.png', 'photo.JPG']) assert.ok(SKIP_FILE.test(n), n);
    for (const n of ['brand.md', 'events.pdf', 'notes.docx']) assert.ok(!SKIP_FILE.test(n), n);
});
