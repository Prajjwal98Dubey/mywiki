import { Outlet } from 'react-router';
import AppHeader from './AppHeader.jsx';
import AppFooter from './AppFooter.jsx';

/** Shell for MyWiki's own pages (home, auth, my pages, wizard, search, 404). */
export default function AppLayout() {
  return (
    <div className="app flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only-focusable absolute top-3 left-3 z-[100] rounded-full bg-app-ink px-4 py-2 text-sm text-app-bg"
      >
        Skip to content
      </a>
      <AppHeader />
      <main id="main" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
