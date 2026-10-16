import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import Infobox from './Infobox.jsx';

const NOW = new Date(2026, 9, 15); // 15 October 2026

const renderBox = (infobox, title = 'Jane Doe') =>
  render(
    <MemoryRouter>
      <Infobox infobox={infobox} title={title} now={NOW} />
    </MemoryRouter>,
  );

const base = { name: '', image: null, birthDate: null, birthPlace: '', deathDate: null, deathPlace: '', fields: [] };

describe('Infobox', () => {
  it('shows the birth date with the current age and place', () => {
    renderBox({ ...base, birthDate: '1998-03-15', birthPlace: 'Mumbai, India' });
    const row = screen.getByRole('rowheader', { name: 'Born' }).closest('tr');
    expect(row).toHaveTextContent('15 March 1998 (age 28)Mumbai, India');
  });

  it('does not show an age for year-only birth dates', () => {
    renderBox({ ...base, birthDate: '1998' });
    expect(screen.getByRole('rowheader', { name: 'Born' }).closest('tr')).toHaveTextContent(/^Born1998$/);
  });

  it('shows age at death and no current age when died', () => {
    renderBox({ ...base, birthDate: '1900-06-01', deathDate: '1980-05-31', deathPlace: 'Pune' });
    expect(screen.getByRole('rowheader', { name: 'Born' }).closest('tr')).not.toHaveTextContent('age');
    expect(screen.getByRole('rowheader', { name: 'Died' }).closest('tr')).toHaveTextContent('31 May 1980 (aged 79)Pune');
  });

  it('uses the name override, renders WikiLite values and skips empty rows', () => {
    renderBox({
      ...base,
      name: 'J. Doe',
      fields: [
        { label: 'Alma mater', value: '[[IIT Bombay]]' },
        { label: 'Empty', value: '  ' },
      ],
    });
    expect(screen.getByRole('columnheader', { name: 'J. Doe' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'IIT Bombay' })).toHaveAttribute('href', '/iit-bombay');
    expect(screen.queryByText('Empty')).not.toBeInTheDocument();
  });

  it('renders the image with alt text and caption', () => {
    renderBox({ ...base, image: { url: '/uploads/a.jpg', alt: 'Portrait', caption: "Doe in ''2024''" } });
    expect(screen.getByRole('img', { name: 'Portrait' })).toHaveAttribute('src', '/uploads/a.jpg');
    expect(screen.getByText('2024').tagName).toBe('I');
  });
});
