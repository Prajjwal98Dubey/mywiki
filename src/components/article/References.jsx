import { backlinkLabel, citeNoteId, citeRefId } from '../../lib/wikitext/citations.js';
import Citation from './Citation.jsx';

function Backlinks({ refId, occurrences, inert }) {
  if (occurrences === 0) return null;
  const onClick = inert ? (e) => e.preventDefault() : undefined;
  if (occurrences === 1) {
    return (
      <span className="mw-cite-backlink">
        <b>
          <a href={`#${citeRefId(refId, 0)}`} onClick={onClick} aria-label="Jump up">
            ^
          </a>
        </b>{' '}
      </span>
    );
  }
  return (
    <span className="mw-cite-backlink">
      ^{' '}
      {Array.from({ length: occurrences }, (_, k) => (
        <a key={k} href={`#${citeRefId(refId, k)}`} onClick={onClick} aria-label={`Jump up to use ${k + 1}`}>
          <sup>
            <i>
              <b>{backlinkLabel(k)}</b>
            </i>
          </sup>{' '}
        </a>
      ))}
    </span>
  );
}

/** Numbered reference list: entries from buildReferenceList(). */
export default function References({ entries, inert = false }) {
  return (
    <div className="reflist">
      <ol className="references">
        {entries.map(({ ref, number, occurrences }) => (
          <li key={ref.id} id={inert ? undefined : citeNoteId(ref.id)} value={number}>
            <Backlinks refId={ref.id} occurrences={occurrences} inert={inert} />
            <span className="reference-text">
              <Citation reference={ref} />
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
