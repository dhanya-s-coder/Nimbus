import test from 'node:test';
import assert from 'node:assert/strict';
import { styleCardSchema, styleCardToText } from '../src/services/rag/styleAnalyzer.service.js';

test('style card parsing tolerates lists-for-text, text-for-lists and bad hex values', () => {
    const card = styleCardSchema.parse({
        name: ['Torn paper', 'centre panel'],
        layoutType: ['torn-paper centre', 'dark edges'],
        palette: ['#112233', 'not-a-colour', 'AABBCC'],
        motifs: 'paint stroke; halftone',
        doNotCopy: ['the statue head'],
    });
    assert.equal(card.name, 'Torn paper; centre panel');
    assert.deepEqual(card.palette, ['#112233', '#aabbcc']);
    assert.deepEqual(card.motifs, ['paint stroke', 'halftone']);
    assert.equal(card.strengths.length, 0);
});

test('styleCardToText produces a retrievable description including the do-not-copy list', () => {
    const text = styleCardToText(styleCardSchema.parse({ name: 'Diagonal split', eventType: 'tech talk', doNotCopy: ['speaker portrait'], bestFor: ['talks'] }));
    assert.match(text, /POSTER STYLE REFERENCE: Diagonal split/);
    assert.match(text, /Do NOT reuse.*speaker portrait/);
});
