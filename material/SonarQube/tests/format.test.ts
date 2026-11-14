import { describe, expect, it } from 'vitest';
import { initials, truncate } from '../src/utils/format';

describe('format helpers', () => {
  it('builds initials', () => {
    expect(initials('Mariana López')).toBe('ML');
  });

  it('truncates long text', () => {
    expect(truncate('abcdefghij', 5)).toBe('abcde…');
  });
});
