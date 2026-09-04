export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAsMarkdown(title: string, content: string): void {
  const filename = `${sanitizeFilename(title)}.md`;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, filename);
}

export function exportAsPlainText(title: string, content: string): void {
  const filename = `${sanitizeFilename(title)}.txt`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, filename);
}

export function generateStandaloneHtml(title: string, renderedHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --bg: #ffffff;
      --text: #24292f;
      --border: #d0d7de;
      --code-bg: #f6f8fa;
      --accent: #0969da;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0d1117;
        --text: #e6edf3;
        --border: #30363d;
        --code-bg: #161b22;
        --accent: #58a6ff;
      }
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      max-width: 880px;
      margin: 0 auto;
      padding: 40px 24px;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    h1 { font-size: 2em; border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    p { margin-top: 0; margin-bottom: 16px; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    blockquote {
      margin: 16px 0;
      padding: 0 1em;
      color: #656d76;
      border-left: 0.25em solid var(--border);
    }
    pre {
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: var(--code-bg);
      border-radius: 6px;
      border: 1px solid var(--border);
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
    }
    code:not(pre code) {
      padding: 0.2em 0.4em;
      margin: 0;
      font-size: 85%;
      background-color: var(--code-bg);
      border-radius: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }
    table {
      border-spacing: 0;
      border-collapse: collapse;
      margin-top: 0;
      margin-bottom: 16px;
      width: 100%;
      overflow: auto;
    }
    th, td {
      padding: 6px 13px;
      border: 1px solid var(--border);
    }
    th {
      font-weight: 600;
      background-color: var(--code-bg);
    }
    tr:nth-child(2n) {
      background-color: var(--code-bg);
    }
    hr {
      height: 0.25em;
      padding: 0;
      margin: 24px 0;
      background-color: var(--border);
      border: 0;
    }
    img {
      max-width: 100%;
      box-sizing: content-box;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  ${renderedHtml}
</body>
</html>`;
}

export function exportAsHtml(title: string, renderedHtml: string): void {
  const fullHtml = generateStandaloneHtml(title, renderedHtml);
  const filename = `${sanitizeFilename(title)}.html`;
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  downloadBlob(blob, filename);
}

export function triggerPrintDialog(): void {
  window.print();
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'untitled';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
