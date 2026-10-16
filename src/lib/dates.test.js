import { describe, it, expect } from 'vitest';
import { formatDate, ageBetween, ageToday, parseDate } from './dates.js';

describe('dates', () => {
  it('formats full, month and year dates', () => {
    expect(formatDate('1998-03-15')).toBe('15 March 1998');
    expect(formatDate('1998-03')).toBe('March 1998');
    expect(formatDate('1998')).toBe('1998');
  });

  it('rejects invalid dates', () => {
    expect(parseDate('1998-02-30')).toBeNull();
    expect(parseDate('98-1-1')).toBeNull();
  });

  it('computes ages', () => {
    expect(ageBetween('1998-03-15', '2026-03-14')).toBe(27);
    expect(ageBetween('1998-03-15', '2026-03-15')).toBe(28);
    expect(ageBetween('1998', '2026-03-15')).toBeNull();
    expect(ageToday('1998-03-15', new Date(2026, 9, 15))).toBe(28);
  });
});
