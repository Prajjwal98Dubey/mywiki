import { Navigate, useParams } from 'react-router';
import { pagePath, slugify } from '../lib/slug.js';

/** Old /wiki/Jane_Doe links → /jane-doe */
export default function LegacyWikiRedirect() {
  const { slug } = useParams();
  return <Navigate to={pagePath(slugify(slug))} replace />;
}
