import { HeadingItem } from '../types';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function extractHeadings(markdown: string): HeadingItem[] {
  if (!markdown) return [];

  const lines = markdown.split(/\r\n|\r|\n/);
  const headings: HeadingItem[] = [];
  let inCodeBlock = false;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Toggle fenced code block state
    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock;
      return;
    }

    if (inCodeBlock) return;

    // Match ATX headings (# through ######)
    const match = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      // Remove trailing # if present (e.g. `## Heading ##`)
      let headingText = match[2].replace(/\s+#+$/, '').trim();
      // Clean inline formatting tags from heading for TOC display
      const cleanText = headingText
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

      const id = slugify(cleanText) || `heading-${index + 1}`;

      headings.push({
        id,
        text: cleanText,
        level,
        line: index + 1,
      });
    }
  });

  return headings;
}
