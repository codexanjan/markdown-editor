export interface ImportedFile {
  title: string;
  content: string;
  originalName: string;
}

export async function readTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function cleanTitleFromFilename(filename: string): string {
  return filename
    .replace(/\.(md|markdown|mdx|txt)$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim() || 'Imported Document';
}

export async function pickAndImportFiles(): Promise<ImportedFile[]> {
  // Check if modern File System Access API is supported
  if ('showOpenFilePicker' in window) {
    try {
      const picker = (window as unknown as {
        showOpenFilePicker: (options: unknown) => Promise<FileSystemFileHandle[]>;
      }).showOpenFilePicker;

      const handles = await picker({
        multiple: true,
        types: [
          {
            description: 'Markdown & Text Files',
            accept: {
              'text/markdown': ['.md', '.markdown'],
              'text/plain': ['.txt', '.mdx'],
            },
          },
        ],
      });

      const results: ImportedFile[] = [];
      for (const handle of handles) {
        const file = await handle.getFile();
        const content = await file.text();
        results.push({
          title: cleanTitleFromFilename(file.name),
          content,
          originalName: file.name,
        });
      }
      return results;
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') {
        return [];
      }
      // Fallback to standard input if error
    }
  }

  // Fallback: programmatic <input type="file" multiple>
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.md,.markdown,.mdx,.txt,text/markdown,text/plain';

    input.onchange = async () => {
      if (!input.files || input.files.length === 0) {
        resolve([]);
        return;
      }

      const results: ImportedFile[] = [];
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        try {
          const content = await readTextFromFile(file);
          results.push({
            title: cleanTitleFromFilename(file.name),
            content,
            originalName: file.name,
          });
        } catch {
          // Skip unreadable files
        }
      }
      resolve(results);
    };

    input.click();
  });
}

export async function processDroppedFiles(fileList: FileList): Promise<ImportedFile[]> {
  const results: ImportedFile[] = [];
  const validExtensions = ['.md', '.markdown', '.mdx', '.txt'];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const hasValidExt = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (hasValidExt || file.type.startsWith('text/')) {
      try {
        const content = await readTextFromFile(file);
        results.push({
          title: cleanTitleFromFilename(file.name),
          content,
          originalName: file.name,
        });
      } catch {
        // Skip unreadable files
      }
    }
  }

  return results;
}
