import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TableOfContents from './TableOfContents.jsx';
import { buildTocTree } from '../../lib/headings.js';

const entries = buildTocTree([
  { id: 'Early_life', text: 'Early life', level: 2 },
  { id: 'Career', text: 'Career', level: 2 },
  { id: 'Open_source', text: 'Open source', level: 3 },
  { id: 'Speaking', text: 'Speaking', level: 3 },
  { id: 'References', text: 'References', level: 2 },
]);

describe('buildTocTree', () => {
  it('nests h3 entries under the preceding h2', () => {
    expect(entries.map((e) => [e.id, e.children.map((c) => c.id)])).toEqual([
      ['Early_life', []],
      ['Career', ['Open_source', 'Speaking']],
      ['References', []],
    ]);
  });
});

describe('TableOfContents', () => {
  it('renders (Top) and the top-level entries with anchors', () => {
    render(<TableOfContents entries={entries} activeId={null} />);
    expect(screen.getByRole('link', { name: '(Top)' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Career' })).toHaveAttribute('href', '#Career');
    // Collapsed by default: subsections hidden.
    expect(screen.queryByRole('link', { name: 'Open source' })).not.toBeInTheDocument();
  });

  it('auto-expands the group containing the active section and marks it current', () => {
    render(<TableOfContents entries={entries} activeId="Speaking" />);
    const link = screen.getByRole('link', { name: 'Speaking' });
    expect(link).toHaveAttribute('aria-current', 'location');
    expect(screen.getByRole('button', { name: /toggle career/i })).toHaveAttribute('aria-expanded', 'true');
  });

  it('expands and collapses subsections with the toggle', async () => {
    const user = userEvent.setup();
    render(<TableOfContents entries={entries} activeId={null} />);
    const toggle = screen.getByRole('button', { name: /toggle career/i });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const sublist = document.getElementById(toggle.getAttribute('aria-controls'));
    expect(within(sublist).getByRole('link', { name: 'Open source' })).toBeVisible();
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows the pin action when provided', async () => {
    const user = userEvent.setup();
    let hidden = false;
    render(<TableOfContents entries={entries} pinAction="hide" onPinAction={() => (hidden = true)} />);
    await user.click(screen.getByRole('button', { name: 'hide' }));
    expect(hidden).toBe(true);
  });
});
