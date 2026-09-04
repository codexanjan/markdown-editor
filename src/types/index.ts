export type ThemeMode = 'dark' | 'light' | 'system';

export type ViewMode = 'split' | 'editor-only' | 'preview-only' | 'focus';

export interface DocumentItem {
  id: string;
  title: string;
  content: string;
  folderId?: string | null;
  tags: string[];
  favorite: boolean;
  archived: boolean;
  isTrash: boolean;
  createdAt: number;
  updatedAt: number;
  lastOpenedAt?: number;
  cursorPosition?: { line: number; ch: number };
  wordCount: number;
  characterCount: number;
}

export interface FolderItem {
  id: string;
  name: string;
  createdAt: number;
  parentId?: string | null;
}

export interface VersionSnapshot {
  id: string;
  documentId: string;
  title: string;
  content: string;
  timestamp: number;
  wordCount: number;
}

export interface DocumentStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  lines: number;
  paragraphs: number;
  readingTimeMinutes: number;
}

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
  line: number;
}

export interface EditorSettings {
  theme: ThemeMode;
  fontSize: number; // in px, e.g. 14, 16, 18
  fontFamily: string; // 'JetBrains Mono', 'Fira Code', 'monospace'
  lineHeight: number; // e.g. 1.6
  tabSize: number; // 2 or 4
  showLineNumbers: boolean;
  wordWrap: boolean;
  syncScroll: boolean;
  previewFontSize: number;
}

export type SidebarFilter = 'all' | 'recents' | 'favorites' | 'trash' | 'archive';

export interface SearchReplaceState {
  isOpen: boolean;
  searchQuery: string;
  replaceQuery: string;
  caseSensitive: boolean;
  wholeWord: boolean;
  isRegex: boolean;
  currentMatchIndex: number;
  totalMatches: number;
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';
