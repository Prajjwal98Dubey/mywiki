import { Link } from 'react-router';
import { SITE_NAME } from '../../hooks/useDocumentTitle.js';

export default function Footer() {
  return (
    <footer className="page-container w-full">
      <div className="border-t border-wiki-border-subtle py-5 text-xs text-wiki-text">
        <p className="m-0 mb-2">
          {SITE_NAME} pages are written by their owners. {SITE_NAME} is an independent project and is not affiliated
          with Wikipedia or the Wikimedia Foundation.
        </p>
        <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
          <li>
            <Link to="/">Main page</Link>
          </li>
          <li>
            <Link to="/create">Create a page</Link>
          </li>
          <li>
            <Link to="/random">Random page</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
