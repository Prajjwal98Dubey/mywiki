// Citation numbering (PROJECT_SPEC §5): numbered by first appearance in reading order
// (lead, then sections). Reusing an id reuses the number. Uncited refs are appended.
import { walk } from './parser.js';

/**
 * Annotates every `cite` node in `trees` (already parsed, in reading order) with
 * `number` and `index` (0-based occurrence of that ref), and returns
 * Map<refId, { number, occurrences }>. Cites to unknown ref ids get `number: null`.
 * Mutates the cite nodes, so pass freshly parsed trees.
 */
export function numberCitations(trees, references = []) {
  const known = new Set(references.map((r) => r.id));
  const map = new Map();
  for (const tree of trees) {
    walk(tree, (node) => {
      if (node.type !== 'cite') return;
      if (!known.has(node.refId)) {
        node.number = null;
        node.index = 0;
        return;
      }
      let entry = map.get(node.refId);
      if (!entry) {
        entry = { number: map.size + 1, occurrences: 0 };
        map.set(node.refId, entry);
      }
      node.number = entry.number;
      node.index = entry.occurrences;
      entry.occurrences += 1;
    });
  }
  return map;
}

/** Ordered list for the References section: cited refs by number, then uncited in input order. */
export function buildReferenceList(references = [], citeMap = new Map()) {
  const cited = [];
  const uncited = [];
  for (const ref of references) {
    const entry = citeMap.get(ref.id);
    if (entry) cited.push({ ref, number: entry.number, occurrences: entry.occurrences });
    else uncited.push(ref);
  }
  cited.sort((a, b) => a.number - b.number);
  let next = cited.length;
  return [...cited, ...uncited.map((ref) => ({ ref, number: ++next, occurrences: 0 }))];
}

/** 0 → "a", 25 → "z", 26 → "aa", 27 → "ab" … (MediaWiki backlink labels). */
export function backlinkLabel(i) {
  let n = i;
  let s = '';
  do {
    s = String.fromCharCode(97 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

export const citeRefId = (refId, index) => `cite_ref-${refId}-${index}`;
export const citeNoteId = (refId) => `cite_note-${refId}`;
