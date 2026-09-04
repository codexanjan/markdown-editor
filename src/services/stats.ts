import { DocumentStats } from '../types';

export function calculateDocumentStats(text: string): DocumentStats {
  if (!text || text.trim() === '') {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      lines: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
    };
  }

  // Characters
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;

  // Words: match alphanumeric sequences and hyphenated words
  const trimmed = text.trim();
  const wordsArray = trimmed.match(/[\p{L}\p{N}_\-]+/gu) || [];
  const words = wordsArray.length;

  // Lines
  const lines = text.split(/\r\n|\r|\n/).length;

  // Paragraphs (non-empty blocks separated by double newlines or more)
  const paragraphs = text
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0).length;

  // Reading time (average 200 WPM, rounded up to 1 min if words > 0)
  const readingTimeMinutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));

  return {
    words,
    characters,
    charactersNoSpaces,
    lines,
    paragraphs,
    readingTimeMinutes,
  };
}
