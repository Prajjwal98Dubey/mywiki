import { describe, it, expect } from 'vitest';
import { slugify, humanizeSlug } from './slug.js';

describe('slugify', () => {
  it.each([
    ['Sam Singh', 'sam-singh'],
    ['  sam   SINGH ', 'sam-singh'],
    ['Jane_Doe', 'jane-doe'],
    ["O'Brien (actor)", 'obrien-actor'],
    ['O’Brien', 'obrien'],
    ['Dr. J. Smith, Jr.', 'dr-j-smith-jr'],
    ['Jane <script>Doe', 'jane-script-doe'],
    ['Élodie Durand', 'élodie-durand'],
    ['élodie', 'élodie'], // NFC: e + combining acute → é
    ['प्रज्ज्वल दुबे', 'प्रज्ज्वल-दुबे'],
    ['a/b?c#d', 'a-b-c-d'],
    ['--hello--world--', 'hello-world'],
    ['sam-singh-1rqdasr3r', 'sam-singh-1rqdasr3r'],
    ['!!!', ''],
    ['', ''],
  ])('%j → %j', (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it('is idempotent', () => {
    for (const s of ['Sam Singh', "O'Brien (actor)", 'प्रज्ज्वल दुबे', 'Dr. J. Smith, Jr.', 'x'.repeat(120)]) {
      expect(slugify(slugify(s))).toBe(slugify(s));
    }
  });

  it('caps the base at 80 code points without a trailing hyphen', () => {
    expect(slugify('x'.repeat(150))).toHaveLength(80);
    expect(slugify(`${'a'.repeat(79)} b`)).toBe('a'.repeat(79));
  });
});

describe('humanizeSlug', () => {
  it('turns slugs into display titles', () => {
    expect(humanizeSlug('sam-singh')).toBe('Sam Singh');
    expect(humanizeSlug('élodie-durand')).toBe('Élodie Durand');
  });
});
