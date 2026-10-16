import { Link } from 'react-router';
import { useWikiContext } from '../wikitext/WikiContext.js';

export default function Categories({ categories }) {
  const { mode } = useWikiContext();
  const list = categories.filter((c) => c?.trim());
  if (list.length === 0) return null;
  return (
    <div className="catlinks" aria-label="Categories">
      {list.length === 1 ? 'Category' : 'Categories'}:{' '}
      <ul>
        {list.map((c) => (
          <li key={c}>
            {mode === 'preview' ? (
              <a href="#" onClick={(e) => e.preventDefault()} tabIndex={-1}>
                {c}
              </a>
            ) : (
              <Link to={`/search?q=${encodeURIComponent(c)}`}>{c}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
