/** Wikipedia-style section anchor: "Early life and education" → "Early_life_and_education". */
export function toAnchor(text) {
  return String(text ?? '')
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\p{L}\p{M}\p{N}_\-().,']/gu, '')
    .slice(0, 100);
}

/** Returns a function that turns heading text into unique anchors: Career, Career_2, … */
export function createAnchorFactory() {
  const used = new Map();
  return (text) => {
    const base = toAnchor(text) || 'section';
    const n = (used.get(base) || 0) + 1;
    used.set(base, n);
    let id = n === 1 ? base : `${base}_${n}`;
    while (used.has(id) && id !== base) id = `${id}_`;
    if (id !== base) used.set(id, 1);
    return id;
  };
}

/**
 * Builds the nested TOC from flat headings [{ id, text, level }]:
 * h2 entries with their following h3s as children. Orphan h3s (no h2 before) become top level.
 */
export function buildTocTree(headings) {
  const tree = [];
  let current = null;
  for (const h of headings) {
    const entry = { id: h.id, text: h.text, level: h.level, children: [] };
    if (h.level === 3 && current) current.children.push(entry);
    else {
      tree.push(entry);
      current = h.level === 2 ? entry : current;
    }
  }
  return tree;
}
