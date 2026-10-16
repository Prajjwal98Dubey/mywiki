import { Link } from 'react-router';
import { pagePath } from '../../lib/slug.js';

/**
 * Vector 2022 tab row: "Article" on the left; Read | Edit | View history on the right.
 * active: 'read' | 'edit' | 'history' | null
 */
export default function PageTabs({ slug, active = 'read', canEdit = false, leftLabel = 'Article' }) {
  const base = pagePath(slug);
  const tab = (key, to, label) => (
    <li key={key} className={active === key ? 'selected' : undefined}>
      <Link to={to} aria-current={active === key ? 'page' : undefined}>
        {label}
      </Link>
    </li>
  );
  return (
    <nav className="vector-tabs" aria-label="Page tools">
      <ul aria-label="Namespaces">
        <li className="selected">
          <Link to={base}>{leftLabel}</Link>
        </li>
      </ul>
      <ul aria-label="Views">
        {tab('read', base, 'Read')}
        {canEdit && tab('edit', `${base}/edit`, 'Edit')}
        {tab('history', `${base}/history`, 'View history')}
      </ul>
    </nav>
  );
}
