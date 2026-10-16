import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { SITE_NAME } from '../../hooks/useDocumentTitle.js';
import { humanizeSlug } from '../../lib/slug.js';
import PageFrame from '../layout/PageFrame.jsx';

/** Wikipedia-style "does not have an article with this exact name" page. */
export default function MissingArticle({ slug }) {
  const { user } = useAuth();
  const title = humanizeSlug(slug);
  const createHref = `/create?title=${encodeURIComponent(title)}`;

  return (
    <PageFrame
      title={title}
      tabs={
        <nav className="vector-tabs" aria-label="Page tools">
          <ul>
            <li className="selected">
              <a href="#" onClick={(e) => e.preventDefault()} className="!text-wiki-red">
                Article
              </a>
            </li>
          </ul>
          <ul>
            {user && (
              <li>
                <Link to={createHref}>Create</Link>
              </li>
            )}
          </ul>
        </nav>
      }
    >
      <div className="mw-content">
        <div className="mw-message-box">
          <p className="m-0">
            <b>
              {SITE_NAME} does not have an article with this exact name.
            </b>{' '}
            Please <Link to={`/search?q=${encodeURIComponent(title)}`}>search for {title} in {SITE_NAME}</Link> to
            check for alternative titles or spellings.
          </p>
          <ul className="mt-2">
            {user ? (
              <li>
                <Link to={createHref}>Create this page</Link>, or start a page about yourself.
              </li>
            ) : (
              <li>
                <Link to={`/login?returnTo=${encodeURIComponent(createHref)}`}>Log in</Link> or{' '}
                <Link to={`/register?returnTo=${encodeURIComponent(createHref)}`}>create an account</Link> to start the{' '}
                <i>{title}</i> article.
              </li>
            )}
          </ul>
        </div>
      </div>
    </PageFrame>
  );
}
