import { useMemo } from 'react';
import { parseBlocks, parseInline } from '../../lib/wikitext/parser.js';
import InternalLink from './InternalLink.jsx';
import ExternalLink from './ExternalLink.jsx';
import CitationRef from './CitationRef.jsx';

/** Renders WikiLite AST nodes as React elements (never via innerHTML). */
export function WikiNodes({ nodes }) {
  return nodes.map((node, i) => <WikiNode key={i} node={node} />);
}

function WikiNode({ node }) {
  switch (node.type) {
    case 'text':
      return node.value;
    case 'paragraph':
      return (
        <p>
          <WikiNodes nodes={node.children} />
        </p>
      );
    case 'list': {
      const Tag = node.ordered ? 'ol' : 'ul';
      return (
        <Tag>
          <WikiNodes nodes={node.children} />
        </Tag>
      );
    }
    case 'listItem':
      return (
        <li>
          <WikiNodes nodes={node.children} />
        </li>
      );
    case 'bold':
      return (
        <b>
          <WikiNodes nodes={node.children} />
        </b>
      );
    case 'italic':
      return (
        <i>
          <WikiNodes nodes={node.children} />
        </i>
      );
    case 'lineBreak':
      return <br />;
    case 'internalLink':
      return (
        <InternalLink slug={node.slug} title={node.target}>
          <WikiNodes nodes={node.children} />
        </InternalLink>
      );
    case 'externalLink':
      return (
        <ExternalLink url={node.url}>
          <WikiNodes nodes={node.children} />
        </ExternalLink>
      );
    case 'cite':
      return <CitationRef refId={node.refId} number={node.number} index={node.index} />;
    default:
      return null;
  }
}

/**
 * Parses and renders WikiLite source.
 *  - block (default): paragraphs and lists (lead/sections)
 *  - inline: a single run of text; `lineBreaks` turns newlines into <br> (infobox values)
 */
export default function WikiText({ source, inline = false, lineBreaks = false }) {
  const nodes = useMemo(
    () => (inline ? parseInline(source, { allowLineBreaks: lineBreaks }) : parseBlocks(source)),
    [source, inline, lineBreaks],
  );
  return <WikiNodes nodes={nodes} />;
}
