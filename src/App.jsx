import { createBrowserRouter } from 'react-router';
import AppLayout from './components/app/AppLayout.jsx';
import WikiLayout from './components/layout/WikiLayout.jsx';
import HomePage from './routes/HomePage.jsx';
import ArticlePage from './routes/ArticlePage.jsx';
import LoginPage from './routes/LoginPage.jsx';
import RegisterPage from './routes/RegisterPage.jsx';
import RandomPage from './routes/RandomPage.jsx';
import MyPagesPage from './routes/MyPagesPage.jsx';
import NotFoundPage from './routes/NotFoundPage.jsx';
import ComingSoonPage from './routes/ComingSoonPage.jsx';
import CreatePage from './routes/CreatePage.jsx';
import EditPage from './routes/EditPage.jsx';
import RequireAuth from './routes/RequireAuth.jsx';
import LegacyWikiRedirect from './routes/LegacyWikiRedirect.jsx';

// Route table — PROJECT_SPEC §8. Static paths outrank /:slug, so app routes are never shadowed;
// any new top-level route must also be added to the reserved slugs (§6.4, lib/slug.js).
export const routes = [
  {
    // MyWiki's own design
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'random', element: <RandomPage /> },
      { path: 'search', element: <ComingSoonPage title="Search" /> },
      {
        path: 'create',
        element: (
          <RequireAuth>
            <CreatePage />
          </RequireAuth>
        ),
      },
      {
        path: 'my-pages',
        element: (
          <RequireAuth>
            <MyPagesPage />
          </RequireAuth>
        ),
      },
      {
        path: ':slug/edit',
        element: (
          <RequireAuth>
            <EditPage />
          </RequireAuth>
        ),
      },
      { path: 'wiki/:slug', element: <LegacyWikiRedirect /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    // Wikipedia clone
    element: <WikiLayout />,
    children: [
      { path: ':slug', element: <ArticlePage /> },
      { path: ':slug/history', element: <ComingSoonPage title="Revision history" variant="wiki" /> },
      { path: ':slug/revisions/:revId', element: <ComingSoonPage title="Old revision" variant="wiki" /> },
    ],
  },
];

export const createRouter = () => createBrowserRouter(routes);
