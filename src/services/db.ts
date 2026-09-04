import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { DocumentItem, FolderItem, VersionSnapshot } from '../types';
import { calculateDocumentStats } from './stats';

interface MarkdownStudioDB extends DBSchema {
  documents: {
    key: string;
    value: DocumentItem;
    indexes: {
      'by-updated': number;
      'by-folder': string;
      'by-favorite': number;
      'by-trash': number;
    };
  };
  folders: {
    key: string;
    value: FolderItem;
    indexes: {
      'by-created': number;
    };
  };
  snapshots: {
    key: string;
    value: VersionSnapshot;
    indexes: {
      'by-doc': string;
      'by-timestamp': number;
    };
  };
}

const DB_NAME = 'markdown_studio_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MarkdownStudioDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<MarkdownStudioDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MarkdownStudioDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Documents store
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('by-updated', 'updatedAt');
          docStore.createIndex('by-folder', 'folderId');
          docStore.createIndex('by-favorite', 'favorite');
          docStore.createIndex('by-trash', 'isTrash');
        }

        // Folders store
        if (!db.objectStoreNames.contains('folders')) {
          const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
          folderStore.createIndex('by-created', 'createdAt');
        }

        // Snapshots store
        if (!db.objectStoreNames.contains('snapshots')) {
          const snapStore = db.createObjectStore('snapshots', { keyPath: 'id' });
          snapStore.createIndex('by-doc', 'documentId');
          snapStore.createIndex('by-timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
}

const WELCOME_DOCUMENT_CONTENT = `# Welcome to Markdown Studio 🚀

A fast, modern, privacy-focused Markdown editor with live preview, document management, developer tools, and rich export options.

---

## ✨ Key Features at a Glance

- **⚡ Real-time Live Preview:** Instant GFM rendering with side-by-side synchronized scrolling.
- **🔒 Privacy First:** All your documents, folders, and history are saved **locally** in your browser's IndexedDB. Zero tracking, zero cloud telemetry.
- **⌨️ Keyboard Shortcuts & Slash Commands:** Type \`/\` on any line to open the quick insertion menu.
- **📊 Document Outline & TOC:** Automatic Table of Contents with scroll-spy heading tracking.
- **💾 Autosave & Version History:** Automatic debounced saving with point-in-time snapshot restore.
- **📤 Versatile Export:** Download as \`.md\`, \`.txt\`, standalone styled \`.html\`, or print to \`.pdf\` (\`Ctrl+P\`).

---

## 🛠️ Markdown Syntax Showcase

### 1. Text Formatting & Styles

Combine formatting easily:
- **Bold text** with \`**bold**\` or \`__bold__\`
- *Italic text* with \`*italic*\` or \`_italic_\`
- ~~Strikethrough~~ with \`~~strikethrough~~\`
- \`Inline code\` with backticks
- [Hyperlink to GitHub](https://github.com)

### 2. Interactive Task Lists

- [x] Create project architecture spec
- [x] Build CodeMirror 6 live editor
- [x] Add Table of Contents scroll-spy
- [ ] Try typing \`/\` in the editor to test slash commands
- [ ] Export your document as HTML or PDF

### 3. Syntax Highlighted Code Blocks

\`\`\`typescript
interface DeveloperTool {
  name: string;
  isFast: boolean;
  isPrivate: boolean;
}

const studio: DeveloperTool = {
  name: "Markdown Studio",
  isFast: true,
  isPrivate: true,
};

console.log(\`Running \${studio.name} at the speed of light!\`);
\`\`\`

### 4. Rich Tables

| Feature | Markdown Studio | Cloud Editors |
| :--- | :---: | :---: |
| **Offline Support** | ✅ 100% Offline | ❌ Limited |
| **Data Privacy** | ✅ Zero Cloud Leakage | ⚠️ Third-Party Cloud |
| **Instant Autosave** | ✅ IndexedDB | ⚠️ Network Dependent |
| **Code Highlighting** | ✅ 30+ Languages | ⚠️ Basic |

### 5. Callouts & Blockquotes

> 💡 **Pro-Tip:** Press \`Ctrl + F\` or \`Cmd + F\` to launch the search and replace panel with Regex and case sensitivity options.

---

## ⌨️ Essential Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| \`Ctrl / Cmd + N\` | Create New Document |
| \`Ctrl / Cmd + S\` | Force Save Document |
| \`Ctrl / Cmd + B\` | Bold Selected Text |
| \`Ctrl / Cmd + I\` | Italicize Selected Text |
| \`Ctrl / Cmd + K\` | Insert Link Dialog |
| \`Ctrl / Cmd + F\` | Find in Document |
| \`Ctrl / Cmd + H\` | Replace in Document |
| \`Ctrl / Cmd + P\` | Print / Export to PDF |
| \`F11\` | Toggle Fullscreen |

Enjoy writing in **Markdown Studio**!
`;

export async function initializeDatabase(): Promise<DocumentItem[]> {
  const db = await getDb();
  const allDocs = await db.getAll('documents');

  if (allDocs.length === 0) {
    const now = Date.now();
    const stats = calculateDocumentStats(WELCOME_DOCUMENT_CONTENT);

    const initialDoc: DocumentItem = {
      id: 'doc-welcome',
      title: 'Welcome to Markdown Studio',
      content: WELCOME_DOCUMENT_CONTENT,
      folderId: null,
      tags: ['guide', 'welcome'],
      favorite: true,
      archived: false,
      isTrash: false,
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
      wordCount: stats.words,
      characterCount: stats.characters,
    };

    await db.put('documents', initialDoc);

    // Initial folder
    const initialFolder: FolderItem = {
      id: 'folder-notes',
      name: 'General Notes',
      createdAt: now,
      parentId: null,
    };
    await db.put('folders', initialFolder);

    return [initialDoc];
  }

  return allDocs;
}

export async function getAllDocuments(): Promise<DocumentItem[]> {
  const db = await getDb();
  return db.getAll('documents');
}

export async function getDocumentById(id: string): Promise<DocumentItem | undefined> {
  const db = await getDb();
  return db.get('documents', id);
}

export async function saveDocument(doc: DocumentItem): Promise<void> {
  const db = await getDb();
  const stats = calculateDocumentStats(doc.content);
  const updatedDoc: DocumentItem = {
    ...doc,
    updatedAt: Date.now(),
    wordCount: stats.words,
    characterCount: stats.characters,
  };
  await db.put('documents', updatedDoc);
}

export async function deleteDocument(id: string, permanent: boolean = false): Promise<void> {
  const db = await getDb();
  if (permanent) {
    await db.delete('documents', id);
    // Also delete associated snapshots
    const tx = db.transaction('snapshots', 'readwrite');
    const index = tx.store.index('by-doc');
    let cursor = await index.openCursor(id);
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  } else {
    const doc = await db.get('documents', id);
    if (doc) {
      doc.isTrash = true;
      doc.updatedAt = Date.now();
      await db.put('documents', doc);
    }
  }
}

export async function restoreDocument(id: string): Promise<void> {
  const db = await getDb();
  const doc = await db.get('documents', id);
  if (doc) {
    doc.isTrash = false;
    doc.updatedAt = Date.now();
    await db.put('documents', doc);
  }
}

export async function emptyTrash(): Promise<void> {
  const db = await getDb();
  const all = await db.getAll('documents');
  const trashDocs = all.filter((d) => d.isTrash);
  for (const doc of trashDocs) {
    await deleteDocument(doc.id, true);
  }
}

export async function getAllFolders(): Promise<FolderItem[]> {
  const db = await getDb();
  return db.getAll('folders');
}

export async function saveFolder(folder: FolderItem): Promise<void> {
  const db = await getDb();
  await db.put('folders', folder);
}

export async function deleteFolder(id: string): Promise<void> {
  const db = await getDb();
  // Move documents in this folder to root (folderId: null)
  const allDocs = await db.getAll('documents');
  for (const doc of allDocs) {
    if (doc.folderId === id) {
      doc.folderId = null;
      await db.put('documents', doc);
    }
  }
  await db.delete('folders', id);
}

export async function saveVersionSnapshot(
  docId: string,
  title: string,
  content: string
): Promise<VersionSnapshot> {
  const db = await getDb();
  const stats = calculateDocumentStats(content);
  const snapshot: VersionSnapshot = {
    id: 'snap-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    documentId: docId,
    title,
    content,
    timestamp: Date.now(),
    wordCount: stats.words,
  };
  await db.put('snapshots', snapshot);

  // Keep maximum 30 snapshots per document to prevent uncontrolled growth
  const tx = db.transaction('snapshots', 'readwrite');
  const index = tx.store.index('by-doc');
  const allForDoc: VersionSnapshot[] = [];
  let cursor = await index.openCursor(docId);
  while (cursor) {
    allForDoc.push(cursor.value);
    cursor = await cursor.continue();
  }
  if (allForDoc.length > 30) {
    allForDoc.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = allForDoc.slice(0, allForDoc.length - 30);
    for (const snap of toRemove) {
      await tx.store.delete(snap.id);
    }
  }
  await tx.done;

  return snapshot;
}

export async function getSnapshotsForDocument(docId: string): Promise<VersionSnapshot[]> {
  const db = await getDb();
  const index = db.transaction('snapshots').store.index('by-doc');
  const snaps = await index.getAll(docId);
  return snaps.sort((a, b) => b.timestamp - a.timestamp);
}

export async function deleteSnapshot(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('snapshots', id);
}
