import { describe, it, expect } from 'vitest';
import { parseBlocks, parseInline } from './parser.js';

const t = (value) => ({ type: 'text', value });

describe('parseInline', () => {
  it('parses bold and italic', () => {
    expect(parseInline("a '''b''' c")).toEqual([t('a '), { type: 'bold', children: [t('b')] }, t(' c')]);
    expect(parseInline("''i''")).toEqual([{ type: 'italic', children: [t('i')] }]);
  });

  it('parses bold+italic with five apostrophes', () => {
    expect(parseInline("'''''x'''''")).toEqual([
      { type: 'bold', children: [{ type: 'italic', children: [t('x')] }] },
    ]);
  });

  it('nests italic inside bold', () => {
    expect(parseInline("'''a ''b'' c'''")).toEqual([
      { type: 'bold', children: [t('a '), { type: 'italic', children: [t('b')] }, t(' c')] },
    ]);
  });

  it('parses internal links with and without labels', () => {
    expect(parseInline('[[jane doe]]')).toEqual([
      { type: 'internalLink', target: 'jane doe', slug: 'jane-doe', children: [t('jane doe')] },
    ]);
    expect(parseInline('[[Jane Doe|Jane]]')).toEqual([
      { type: 'internalLink', target: 'Jane Doe', slug: 'jane-doe', children: [t('Jane')] },
    ]);
  });

  it('handles links nested in bold', () => {
    expect(parseInline("'''[[A|b]]'''")).toEqual([
      { type: 'bold', children: [{ type: 'internalLink', target: 'A', slug: 'a', children: [t('b')] }] },
    ]);
  });

  it('allows formatting in link labels', () => {
    expect(parseInline("[[A|''b'']]")[0].children).toEqual([{ type: 'italic', children: [t('b')] }]);
  });

  it('parses external links', () => {
    expect(parseInline('[https://example.com Example site]')).toEqual([
      { type: 'externalLink', url: 'https://example.com', children: [t('Example site')] },
    ]);
    expect(parseInline('[http://x.org]')).toEqual([
      { type: 'externalLink', url: 'http://x.org', children: [t('http://x.org')] },
    ]);
  });

  it('rejects javascript: and other schemes', () => {
    expect(parseInline('[javascript:alert(1) click]')).toEqual([t('[javascript:alert(1) click]')]);
    expect(parseInline('[ftp://x.org files]')).toEqual([t('[ftp://x.org files]')]);
  });

  it('keeps raw HTML as text', () => {
    expect(parseInline('<script>alert(1)</script><b>x</b>')).toEqual([t('<script>alert(1)</script><b>x</b>')]);
  });

  it('falls back to literal text for unbalanced markup', () => {
    expect(parseInline("'''bold")).toEqual([t("'''bold")]);
    expect(parseInline("a ''b")).toEqual([t("a ''b")]);
    expect(parseInline('[[broken')).toEqual([t('[[broken')]);
    expect(parseInline('[[]]')).toEqual([t('[[]]')]);
    expect(parseInline('{{cite|r1')).toEqual([t('{{cite|r1')]);
  });

  it('only parses cites when allowed', () => {
    expect(parseInline('x{{cite|r1}}')).toEqual([t('x{{cite|r1}}')]);
    expect(parseInline('x{{cite|r1}}', { allowCite: true })).toEqual([t('x'), { type: 'cite', refId: 'r1' }]);
  });

  it('turns newlines into line breaks only when allowed', () => {
    expect(parseInline('a\nb', { allowLineBreaks: true })).toEqual([t('a'), { type: 'lineBreak' }, t('b')]);
    expect(parseInline('a\nb')).toEqual([t('a b')]);
  });

  it('never throws on weird input', () => {
    const inputs = [undefined, null, 42, "''''''''", "'''''", '[[|]]', '[[a|b|c]]', '{{}}', '[]', "'''a''b'''c''"];
    for (const s of inputs) {
      expect(() => parseInline(s)).not.toThrow();
      expect(() => parseBlocks(s)).not.toThrow();
    }
  });

  it('closes and reopens overlapping formatting', () => {
    expect(parseInline("'''a ''b''' c''")).toEqual([
      { type: 'bold', children: [t('a '), { type: 'italic', children: [t('b')] }] },
      { type: 'italic', children: [t(' c')] },
    ]);
  });
});

describe('parseBlocks', () => {
  it('splits paragraphs on blank lines and joins single newlines', () => {
    expect(parseBlocks('one\ntwo\n\nthree')).toEqual([
      { type: 'paragraph', children: [t('one two')] },
      { type: 'paragraph', children: [t('three')] },
    ]);
  });

  it('parses bulleted and numbered lists', () => {
    const blocks = parseBlocks('Intro\n* a\n* b\n# one\n# two');
    expect(blocks.map((b) => b.type)).toEqual(['paragraph', 'list', 'list']);
    expect(blocks[1].ordered).toBe(false);
    expect(blocks[1].children).toHaveLength(2);
    expect(blocks[2].ordered).toBe(true);
    expect(blocks[2].children[1]).toEqual({ type: 'listItem', children: [t('two')] });
  });

  it('requires a space after the list marker', () => {
    expect(parseBlocks('*not a list')).toEqual([{ type: 'paragraph', children: [t('*not a list')] }]);
  });

  it('parses cites in paragraphs and list items', () => {
    const blocks = parseBlocks('x{{cite|r1}}\n\n* y{{ cite | r2 }}');
    expect(blocks[0].children[1]).toEqual({ type: 'cite', refId: 'r1' });
    expect(blocks[1].children[0].children[1]).toEqual({ type: 'cite', refId: 'r2' });
  });

  it('handles CRLF and empty input', () => {
    expect(parseBlocks('')).toEqual([]);
    expect(parseBlocks('a\r\n\r\nb')).toHaveLength(2);
  });
});
