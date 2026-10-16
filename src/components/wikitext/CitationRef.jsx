import { citeNoteId, citeRefId } from '../../lib/wikitext/citations.js';
import { useWikiContext } from './WikiContext.js';

/** Superscript [n] citation marker linking to the References list. */
export default function CitationRef({ refId, number, index = 0 }) {
  const { mode } = useWikiContext();

  if (number == null) {
    return (
      <sup className="reference cite-error" title={`Unknown reference "${refId}"`}>
        [?]
      </sup>
    );
  }

  const inert = mode === 'preview';
  return (
    <sup id={inert ? undefined : citeRefId(refId, index)} className="reference">
      <a
        href={`#${citeNoteId(refId)}`}
        data-cite-ref={refId}
        onClick={inert ? (e) => e.preventDefault() : undefined}
        tabIndex={inert ? -1 : undefined}
      >
        [{number}]
      </a>
    </sup>
  );
}
