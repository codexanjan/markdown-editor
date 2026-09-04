import { describe, it, expect } from 'vitest';
import { calculateDocumentStats } from '../services/stats';

describe('calculateDocumentStats', () => {
  it('returns zeros for empty string', () => {
    const stats = calculateDocumentStats('');
    expect(stats.words).toBe(0);
    expect(stats.characters).toBe(0);
    expect(stats.charactersNoSpaces).toBe(0);
    expect(stats.lines).toBe(0);
    expect(stats.paragraphs).toBe(0);
    expect(stats.readingTimeMinutes).toBe(0);
  });

  it('calculates word count and characters correctly', () => {
    const text = 'Hello world! This is Markdown Studio.';
    const stats = calculateDocumentStats(text);
    expect(stats.words).toBe(6);
    expect(stats.characters).toBe(37);
    expect(stats.charactersNoSpaces).toBe(32);
    expect(stats.lines).toBe(1);
    expect(stats.paragraphs).toBe(1);
    expect(stats.readingTimeMinutes).toBe(1);
  });

  it('calculates multiple lines and paragraphs correctly', () => {
    const text = `Paragraph 1 line 1.
Paragraph 1 line 2.

Paragraph 2 line 1.

Paragraph 3 line 1.`;
    const stats = calculateDocumentStats(text);
    expect(stats.lines).toBe(6);
    expect(stats.paragraphs).toBe(3);
  });

  it('calculates estimated reading time accurately for long text', () => {
    // 600 words should be ~3 minutes at 200 WPM
    const words = Array.from({ length: 600 }, (_, i) => `word${i}`).join(' ');
    const stats = calculateDocumentStats(words);
    expect(stats.words).toBe(600);
    expect(stats.readingTimeMinutes).toBe(3);
  });
});
