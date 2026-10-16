import { Link } from 'react-router';

/** h2/h3 with an optional Wikipedia-style [edit] link. */
export default function SectionHeading({ id, level, children, editTo, onEdit }) {
  const Tag = level === 3 ? 'h3' : 'h2';
  return (
    <Tag id={id}>
      {children}
      {(editTo || onEdit) && (
        <span className="mw-editsection">
          <span className="mw-editsection-bracket">[</span>
          {editTo ? (
            <Link to={editTo} aria-label={`Edit section: ${children}`}>
              edit
            </Link>
          ) : (
            <button type="button" className="text-wiki-link hover:underline" onClick={onEdit} aria-label={`Edit section: ${children}`}>
              edit
            </button>
          )}
          <span className="mw-editsection-bracket">]</span>
        </span>
      )}
    </Tag>
  );
}
