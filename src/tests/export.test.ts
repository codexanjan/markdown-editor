import { describe, it, expect } from 'vitest';
import { generateStandaloneHtml } from '../services/fileExport';
import { cleanTitleFromFilename } from '../services/fileImport';

describe('file export and import utilities', () => {
  it('generateStandaloneHtml embeds title and styles cleanly', () => {
    const title = 'Test Document';
    const html = '<p>This is a test paragraph.</p>';
    const output = generateStandaloneHtml(title, html);

    expect(output).toContain('<!DOCTYPE html>');
    expect(output).toContain('<title>Test Document</title>');
    expect(output).toContain('<p>This is a test paragraph.</p>');
    expect(output).toContain('body {');
  });

  it('cleanTitleFromFilename removes file extensions and formats readable titles', () => {
    expect(cleanTitleFromFilename('my-awesome-notes.md')).toBe('my awesome notes');
    expect(cleanTitleFromFilename('Release_Notes_v2.markdown')).toBe('Release Notes v2');
    expect(cleanTitleFromFilename('spec.txt')).toBe('spec');
    expect(cleanTitleFromFilename('architecture-diagrams.mdx')).toBe('architecture diagrams');
  });
});
