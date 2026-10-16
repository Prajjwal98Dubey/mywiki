import { parseBlocks, parseInline } from './parser.js';

/** AST (blocks or inline) → plain text. Cites are dropped. */
export function toPlainText(nodes) {
  const parts = [];
  for (const node of nodes) {
    switch (node.type) {
      case 'text':
        parts.push(node.value);
        break;
      case 'lineBreak':
        parts.push(' ');
        break;
      case 'cite':
        break;
      case 'paragraph':
      case 'list':
        parts.push(` ${toPlainText(node.children)} `);
        break;
      case 'listItem':
        parts.push(` ${toPlainText(node.children)}`);
        break;
      default:
        if (node.children) parts.push(toPlainText(node.children));
    }
  }
  return parts.join('').replace(/\s+/g, ' ').trim();
}

export const blockPlainText = (src) => toPlainText(parseBlocks(src));
export const inlinePlainText = (src) => toPlainText(parseInline(src, { allowLineBreaks: true }));

/** Truncates at a word boundary and adds an ellipsis. */
export function excerpt(text, max = 300) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.]+$/, '')}…`;
}
