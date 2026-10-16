import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import SearchBox from './SearchBox.jsx';

vi.mock('../../api/search.js', () => ({
  suggest: vi.fn(async () => ({
    results: [
      { slug: 'jane-doe', title: 'Jane Doe', shortDescription: 'Engineer', thumbnail: null },
      { slug: 'janet-roe', title: 'Janet Roe', shortDescription: '', thumbnail: null },
    ],
  })),
}));

function Where() {
  const loc = useLocation();
  return <div data-testid="where">{loc.pathname + loc.search}</div>;
}

function setup() {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/']}>
      <SearchBox />
      <Routes>
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  );
  return { user, input: screen.getByRole('combobox') };
}

describe('SearchBox', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows suggestions with the typed part in bold plus a full-search row', async () => {
    const { user, input } = setup();
    await user.type(input, 'jan');
    await screen.findByRole('option', { name: /Jane Doe/ });
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0].querySelector('b')).toHaveTextContent('Jan');
    expect(options[2]).toHaveTextContent('Search for pages containing jan');
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('moves the highlight with arrow keys and opens the highlighted page on Enter', async () => {
    const { user, input } = setup();
    await user.type(input, 'jan');
    await screen.findByRole('option', { name: /Jane Doe/ });
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true');
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getAllByRole('option')[1].id);
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('where')).toHaveTextContent('/janet-roe');
  });

  it('wraps around with ArrowUp and goes to the search page', async () => {
    const { user, input } = setup();
    await user.type(input, 'jan');
    await screen.findByRole('option', { name: /Jane Doe/ });
    await user.keyboard('{ArrowUp}{Enter}');
    expect(screen.getByTestId('where')).toHaveTextContent('/search?q=jan');
  });

  it('submits the full search on Enter without a highlight, and closes on Escape', async () => {
    const { user, input } = setup();
    await user.type(input, 'engineer');
    await screen.findByRole('option', { name: /Jane Doe/ });
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('where')).toHaveTextContent('/search?q=engineer');
  });
});
