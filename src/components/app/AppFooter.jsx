import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { SITE_NAME } from '../../hooks/useDocumentTitle.js';
import AppLogo from './AppLogo.jsx';

function Column({ title, links }) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold tracking-wider text-app-muted uppercase">{title}</h2>
      <ul className="m-0 list-none space-y-2 p-0 text-sm">
        {links.map(([to, label]) => (
          <li key={to}>
            <Link to={to} className="text-app-ink-soft hover:text-app-accent">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AppFooter() {
  const { user } = useAuth();
  return (
    <footer className="mt-24 border-t border-app-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr]">
        <div className="max-w-xs">
          <AppLogo />
          <p className="mt-3 text-sm text-app-muted">
            Encyclopedia-style biographies, written by the people who know the story best.
          </p>
        </div>
        <Column
          title="Explore"
          links={[
            ['/random', 'Random page'],
            ['/search?q=', 'Search'],
            ['/create', 'Create a page'],
          ]}
        />
        <Column
          title="Account"
          links={user ? [['/my-pages', 'My pages'], ['/create', 'New page']] : [['/login', 'Log in'], ['/register', 'Create account']]}
        />
      </div>
      <div className="border-t border-app-border">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-app-muted sm:px-6">
          © {new Date().getFullYear()} {SITE_NAME}. An independent project, not affiliated with Wikipedia or the
          Wikimedia Foundation.
        </p>
      </div>
    </footer>
  );
}
