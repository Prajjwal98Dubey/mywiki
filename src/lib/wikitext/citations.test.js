import { describe, it, expect } from 'vitest';
import { parseBlocks } from './parser.js';
import { numberCitations, buildReferenceList, backlinkLabel } from './citations.js';

const refs = [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }, { id: 'r4' }];

describe('numberCitations', () => {
  it('numbers by first appearance across lead then sections', () => {
    const lead = parseBlocks('a{{cite|r2}}');
    const s1 = parseBlocks('b{{cite|r1}} c{{cite|r2}}');
    const map = numberCitations([lead, s1], refs);
    expect(map.get('r2')).toEqual({ number: 1, occurrences: 2 });
    expect(map.get('r1')).toEqual({ number: 2, occurrences: 1 });
    expect(lead[0].children[1]).toMatchObject({ number: 1, index: 0 });
    expect(s1[0].children[3]).toMatchObject({ number: 1, index: 1 });
  });

  it('gives unknown refs no number', () => {
    const tree = parseBlocks('x{{cite|nope}}');
    const map = numberCitations([tree], refs);
    expect(map.size).toBe(0);
    expect(tree[0].children[1].number).toBeNull();
  });
});

describe('buildReferenceList', () => {
  it('orders cited refs by number and appends uncited ones', () => {
    const map = numberCitations([parseBlocks('{{cite|r3}}{{cite|r1}}')], refs);
    const list = buildReferenceList(refs, map);
    expect(list.map((e) => [e.ref.id, e.number, e.occurrences])).toEqual([
      ['r3', 1, 1],
      ['r1', 2, 1],
      ['r2', 3, 0],
      ['r4', 4, 0],
    ]);
  });
});

describe('backlinkLabel', () => {
  it('produces a, b, … z, aa, ab', () => {
    expect([0, 1, 25, 26, 27, 51, 52].map(backlinkLabel)).toEqual(['a', 'b', 'z', 'aa', 'ab', 'az', 'ba']);
  });
});
