import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { emptyDraft } from '../lib/pageDraft.js';
import Wizard from '../components/wizard/Wizard.jsx';

export default function CreatePage() {
  useDocumentTitle('Create a page');
  const [params] = useSearchParams();
  const title = params.get('title') ?? '';
  const [initialValues] = useState(() => emptyDraft(title));
  // Re-mount when the prefilled title changes (e.g. clicking a different red link).
  return <Wizard key={title} mode="create" initialValues={initialValues} />;
}
