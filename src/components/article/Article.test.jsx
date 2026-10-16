import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AppearanceProvider } from '../../context/AppearanceContext.jsx';
import sample from '../../fixtures/samplePage.json';
import Article from './Article.jsx';

function renderArticle(props = {}) {
  return render(
    <MemoryRouter>
      <AppearanceProvider>
        <Article page={sample.page} linkStatus={sample.linkStatus} canEdit={false} {...props} />
      </AppearanceProvider>
    </MemoryRouter>,
  );
}

describe('Article', () => {
  it('renders the title, lead, sections and fixed blocks', () => {
    renderArticle();
    expect(screen.getByRole('heading', { level: 1, name: 'Jane Doe' })).toBeInTheDocument();
    for (const name of ['Early life and education', 'Career', 'See also', 'References', 'External links']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
    expect(screen.getByRole('heading', { level: 3, name: 'Open source' })).toHaveAttribute('id', 'Open_source');
    expect(screen.getByText('Living people')).toBeInTheDocument();
  });

  it('numbers citations by first appearance and links them to the reference list', () => {
    renderArticle();
    const sups = document.querySelectorAll('sup.reference');
    expect([...sups].map((s) => s.textContent)).toEqual(['[1]', '[2]', '[1]', '[2]', '[1]', '[3]']);
    expect(sups[0]).toHaveAttribute('id', 'cite_ref-r1-0');
    expect(sups[2]).toHaveAttribute('id', 'cite_ref-r1-1');
    const note = document.getElementById('cite_note-r1');
    expect(within(note).getAllByRole('link').map((a) => a.getAttribute('href')).slice(0, 3)).toEqual([
      '#cite_ref-r1-0',
      '#cite_ref-r1-1',
      '#cite_ref-r1-2',
    ]);
  });

  it('renders missing pages as red links to the create page', () => {
    renderArticle();
    const red = screen.getAllByRole('link', { name: 'Mumbai' })[0];
    expect(red).toHaveClass('new');
    expect(red).toHaveAttribute('href', '/create?title=Mumbai');
    const blue = screen.getAllByRole('link', { name: 'John Doe' })[0];
    expect(blue).not.toHaveClass('new');
    expect(blue).toHaveAttribute('href', '/john-doe');
  });

  it('shows [edit] links only for the owner', () => {
    const { unmount } = renderArticle();
    expect(screen.queryByRole('link', { name: /edit section/i })).not.toBeInTheDocument();
    unmount();
    renderArticle({ canEdit: true, editSectionHref: (id) => `/jane-doe/edit?section=${id}` });
    expect(screen.getByRole('link', { name: 'Edit section: Career' })).toHaveAttribute(
      'href',
      '/jane-doe/edit?section=s2',
    );
  });

  it('gives external links safe rel attributes', () => {
    renderArticle();
    const ext = screen.getByRole('link', { name: 'Official website' });
    expect(ext).toHaveAttribute('rel', 'nofollow noopener noreferrer');
    expect(ext).toHaveClass('external');
  });
});
