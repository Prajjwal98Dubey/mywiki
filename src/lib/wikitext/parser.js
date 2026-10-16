// WikiLite parser (PROJECT_SPEC §5). Pure, never throws.
//
// Block nodes:   paragraph{children} | list{ordered, children: listItem[]} | listItem{children}
// Inline nodes:  text{value} | bold{children} | italic{children} | lineBreak
//                internalLink{target, slug, children} | externalLink{url, children} | cite{refId}
//
// Unknown or unbalanced markup falls back to literal text. Raw HTML is just text.

import { slugify } from '../slug.js';

const INTERNAL_LINK = /^\[\[([^[\]|\n]+)(?:\|([^[\]\n]*))?\]\]/;
const EXTERNAL_LINK = /^\[(https?:\/\/[^\s[\]<>"]+)(?:[ \t]+([^\]\n]*))?\]/i;
const CITE = /^\{\{\s*cite\s*\|\s*([A-Za-z0-9_-]{1,32})\s*\}\}/;

const BOLD = 'bold';
const ITALIC = 'italic';
const MARKERS = { [BOLD]: "'''", [ITALIC]: "''" };

export function isSafeExternalUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Tokenizer                                                           */
/* ------------------------------------------------------------------ */

function tokenize(src, opts) {
  const tokens = [];
  let text = '';
  const flush = () => {
    if (text) tokens.push({ t: 'text', value: text });
    text = '';
  };

  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    const rest = src.slice(i);

    if (ch === "'" && src[i + 1] === "'") {
      let n = 0;
      while (src[i + n] === "'") n++;
      // MediaWiki-style apostrophe runs: 2 italic, 3 bold, 4 = "'" + bold, 5+ = extras + both.
      if (n === 4) {
        text += "'";
      } else if (n > 5) {
        text += "'".repeat(n - 5);
      }
      flush();
      if (n === 2) tokens.push({ t: 'toggle', kind: ITALIC });
      else if (n === 3 || n === 4) tokens.push({ t: 'toggle', kind: BOLD });
      else tokens.push({ t: 'both' });
      i += n;
      continue;
    }

    if (opts.allowLinks && ch === '[') {
      const il = INTERNAL_LINK.exec(rest);
      if (il) {
        const target = il[1].trim();
        const slug = slugify(target);
        if (slug) {
          const labelSrc = il[2] !== undefined && il[2].trim() !== '' ? il[2] : il[1].trim();
          flush();
          tokens.push({
            t: 'node',
            node: {
              type: 'internalLink',
              target,
              slug,
              children: parseInline(labelSrc, { ...opts, allowLinks: false, allowCite: false, allowLineBreaks: false }),
            },
          });
          i += il[0].length;
          continue;
        }
      }
      const el = EXTERNAL_LINK.exec(rest);
      if (el && isSafeExternalUrl(el[1])) {
        const url = el[1];
        const labelSrc = el[2] && el[2].trim() ? el[2].trim() : url;
        flush();
        tokens.push({
          t: 'node',
          node: {
            type: 'externalLink',
            url,
            children: parseInline(labelSrc, { ...opts, allowLinks: false, allowCite: false, allowLineBreaks: false }),
          },
        });
        i += el[0].length;
        continue;
      }
    }

    if (opts.allowCite && ch === '{' && src[i + 1] === '{') {
      const c = CITE.exec(rest);
      if (c) {
        flush();
        tokens.push({ t: 'node', node: { type: 'cite', refId: c[1] } });
        i += c[0].length;
        continue;
      }
    }

    if (ch === '\n') {
      flush();
      tokens.push({ t: 'newline' });
      i += 1;
      continue;
    }

    text += ch;
    i += 1;
  }
  flush();
  return tokens;
}

/* ------------------------------------------------------------------ */
/* Inline tree builder                                                 */
/* ------------------------------------------------------------------ */

function pushText(children, value) {
  if (!value) return;
  const last = children[children.length - 1];
  if (last && last.type === 'text') last.value += value;
  else children.push({ type: 'text', value });
}

function pushNode(children, node) {
  if (node.type === 'text') pushText(children, node.value);
  else children.push(node);
}

function buildInline(tokens, opts) {
  const root = { kind: 'root', children: [] };
  const stack = [root];
  const top = () => stack[stack.length - 1];
  const isOpen = (kind) => stack.some((f) => f.kind === kind);

  const open = (kind) => stack.push({ kind, children: [] });

  // Close `kind`, closing (and later reopening) any formatting nested inside it.
  const close = (kind) => {
    const reopen = [];
    while (stack.length > 1) {
      const frame = stack.pop();
      if (frame.children.length > 0) pushNode(top().children, { type: frame.kind, children: frame.children });
      if (frame.kind === kind) break;
      reopen.unshift(frame.kind);
    }
    reopen.forEach(open);
  };

  const toggle = (kind) => (isOpen(kind) ? close(kind) : open(kind));

  for (const tok of tokens) {
    if (tok.t === 'text') pushText(top().children, tok.value);
    else if (tok.t === 'node') pushNode(top().children, tok.node);
    else if (tok.t === 'newline') {
      if (opts.allowLineBreaks) top().children.push({ type: 'lineBreak' });
      else pushText(top().children, ' ');
    } else if (tok.t === 'toggle') toggle(tok.kind);
    else if (tok.t === 'both') {
      // Close whatever is open (innermost first), then open what isn't (bold outside italic).
      const openKinds = stack.slice(1).map((f) => f.kind).reverse();
      const both = [BOLD, ITALIC];
      for (const k of openKinds) if (both.includes(k)) close(k);
      for (const k of both) if (!openKinds.includes(k)) open(k);
    }
  }

  // Unbalanced markers: fall back to literal text.
  while (stack.length > 1) {
    const frame = stack.pop();
    const parent = top().children;
    pushText(parent, MARKERS[frame.kind]);
    for (const child of frame.children) pushNode(parent, child);
  }
  return root.children;
}

/**
 * Parses inline WikiLite (no paragraphs or lists).
 * opts: { allowCite = false, allowLineBreaks = false, allowLinks = true }
 */
export function parseInline(src, opts = {}) {
  const o = { allowCite: false, allowLineBreaks: false, allowLinks: true, ...opts };
  const text = normalize(src);
  if (!text) return [];
  return buildInline(tokenize(text, o), o);
}

/* ------------------------------------------------------------------ */
/* Blocks                                                              */
/* ------------------------------------------------------------------ */

function normalize(src) {
  return typeof src === 'string' ? src.replace(/\r\n?/g, '\n') : '';
}

const LIST_ITEM = /^([*#]) (.*)$/;

/** Parses block WikiLite (lead and sections): paragraphs, lists, cites. */
export function parseBlocks(src) {
  const lines = normalize(src).split('\n');
  const blocks = [];
  const inlineOpts = { allowCite: true, allowLineBreaks: false, allowLinks: true };
  let para = [];
  let list = null;

  const endPara = () => {
    if (para.length) {
      const children = parseInline(para.join('\n'), inlineOpts);
      if (children.length) blocks.push({ type: 'paragraph', children });
    }
    para = [];
  };
  const endList = () => {
    if (list) blocks.push(list);
    list = null;
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (line.trim() === '') {
      endPara();
      endList();
      continue;
    }
    const m = LIST_ITEM.exec(line);
    if (m) {
      endPara();
      const ordered = m[1] === '#';
      if (list && list.ordered !== ordered) endList();
      if (!list) list = { type: 'list', ordered, children: [] };
      list.children.push({ type: 'listItem', children: parseInline(m[2], inlineOpts) });
      continue;
    }
    endList();
    para.push(line);
  }
  endPara();
  endList();
  return blocks;
}

/** Walks every node in a tree (blocks or inline), depth-first in reading order. */
export function walk(nodes, visit) {
  for (const node of nodes) {
    visit(node);
    if (node.children) walk(node.children, visit);
  }
}
