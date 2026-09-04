import { describe, it, expect } from 'vitest';
import { extractHeadings, slugify } from '../services/outline';

describe('outline service', () => {
  it('slugify converts titles to valid anchor identifiers', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
    expect(slugify('Section 1.2: Architecture & Design')).toBe('section-12-architecture-design');
    expect(slugify('   Trim Spaces   ')).toBe('trim-spaces');
  });

  it('extractHeadings correctly identifies H1 through H6', () => {
    const md = `
# Title H1
Some content here.

## Section H2
More content.

### Sub-section H3
Detail.

#### Deep H4
##### Very Deep H5
###### Deepest H6
`;

    const headings = extractHeadings(md);
    expect(headings.length).toBe(6);
    expect(headings[0]).toEqual({
      id: 'title-h1',
      text: 'Title H1',
      level: 1,
      line: 2,
    });
    expect(headings[1].level).toBe(2);
    expect(headings[2].level).toBe(3);
    expect(headings[3].level).toBe(4);
    expect(headings[4].level).toBe(5);
    expect(headings[5].level).toBe(6);
  });

  it('ignores headings inside fenced code blocks', () => {
    const md = `
# Genuine Heading

\`\`\`markdown
# Fake Heading in Code Block
## Another Fake Heading
\`\`\`

## Genuine Subsection
`;

    const headings = extractHeadings(md);
    expect(headings.length).toBe(2);
    expect(headings[0].text).toBe('Genuine Heading');
    expect(headings[1].text).toBe('Genuine Subsection');
  });

  it('strips inline markdown styles from heading text', () => {
    const md = `# **Bold Heading** with \`code\` and *italic*`;
    const headings = extractHeadings(md);
    expect(headings[0].text).toBe('Bold Heading with code and italic');
  });
});
