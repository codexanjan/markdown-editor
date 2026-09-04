import { create } from 'zustand';
import {
  DocumentItem,
  FolderItem,
  ViewMode,
  EditorSettings,
  SidebarFilter,
  SearchReplaceState,
  SaveStatus,
} from '../types';
import * as dbService from '../services/db';
import { calculateDocumentStats } from '../services/stats';
import { pickAndImportFiles, processDroppedFiles } from '../services/fileImport';

const DEFAULT_SETTINGS: EditorSettings = {
  theme: 'dark',
  fontSize: 15,
  fontFamily: 'JetBrains Mono',
  lineHeight: 1.6,
  tabSize: 2,
  showLineNumbers: true,
  wordWrap: true,
  syncScroll: true,
  previewFontSize: 16,
};

function loadSettingsFromStorage(): EditorSettings {
  try {
    const raw = localStorage.getItem('markdown_studio_settings');
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // Fallback to default
  }
  return DEFAULT_SETTINGS;
}

function saveSettingsToStorage(settings: EditorSettings) {
  try {
    localStorage.setItem('markdown_studio_settings', JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors
  }
}

interface AppStore {
  // Data State
  documents: DocumentItem[];
  activeDocumentId: string | null;
  folders: FolderItem[];
  isLoaded: boolean;

  // Filters & Sorting
  sidebarFilter: SidebarFilter;
  selectedFolderId: string | null;
  selectedTag: string | null;
  searchFilter: string;
  sortOrder: 'updated-desc' | 'updated-asc' | 'title-asc' | 'title-desc';

  // Layout & UI
  isSidebarOpen: boolean;
  viewMode: ViewMode;
  isFullscreen: boolean;
  saveStatus: SaveStatus;
  cursorPosition: { line: number; ch: number };
  selectionInfo: string;
  activeOutlineSectionId: string | null;

  // Search & Replace
  searchState: SearchReplaceState;

  // Settings
  settings: EditorSettings;

  // Modals
  isTemplateModalOpen: boolean;
  isHistoryModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isShortcutsModalOpen: boolean;
  isTableBuilderModalOpen: boolean;
  isLinkModalOpen: boolean;
  isImageModalOpen: boolean;
  isCodeBlockModalOpen: boolean;

  // Internal autosave timer ref
  _autosaveTimer: number | null;

  // Actions
  initialize: () => Promise<void>;
  setActiveDocument: (id: string) => void;
  getActiveDocument: () => DocumentItem | undefined;
  createDocument: (content?: string, title?: string, folderId?: string | null) => Promise<string>;
  updateDocumentContent: (content: string) => void;
  updateDocumentTitle: (id: string, title: string) => Promise<void>;
  saveCurrentDocument: () => Promise<void>;
  duplicateDocument: (id: string) => Promise<string | undefined>;
  deleteDocument: (id: string, permanent?: boolean) => Promise<void>;
  restoreDocument: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  moveDocumentToFolder: (docId: string, folderId: string | null) => Promise<void>;
  addTagToDocument: (docId: string, tag: string) => Promise<void>;
  removeTagFromDocument: (docId: string, tag: string) => Promise<void>;

  // Folders
  createFolder: (name: string) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;

  // File Import
  importFiles: () => Promise<void>;
  importDroppedFiles: (files: FileList) => Promise<void>;

  // Layout Setters
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  setViewMode: (mode: ViewMode) => void;
  toggleFullscreen: () => void;
  setCursorPosition: (pos: { line: number; ch: number }) => void;
  setSelectionInfo: (info: string) => void;
  setActiveOutlineSectionId: (id: string | null) => void;

  // Filters Setters
  setSidebarFilter: (filter: SidebarFilter) => void;
  setSelectedFolderId: (folderId: string | null) => void;
  setSelectedTag: (tag: string | null) => void;
  setSearchFilter: (query: string) => void;
  setSortOrder: (order: 'updated-desc' | 'updated-asc' | 'title-asc' | 'title-desc') => void;

  // Search & Replace Setters
  setSearchState: (partial: Partial<SearchReplaceState>) => void;
  openSearch: () => void;
  openReplace: () => void;
  closeSearch: () => void;

  // Settings Setters
  updateSettings: (partial: Partial<EditorSettings>) => void;

  // Modal Setters
  setTemplateModalOpen: (open: boolean) => void;
  setHistoryModalOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
  setShortcutsModalOpen: (open: boolean) => void;
  setTableBuilderModalOpen: (open: boolean) => void;
  setLinkModalOpen: (open: boolean) => void;
  setImageModalOpen: (open: boolean) => void;
  setCodeBlockModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  documents: [],
  activeDocumentId: null,
  folders: [],
  isLoaded: false,

  sidebarFilter: 'all',
  selectedFolderId: null,
  selectedTag: null,
  searchFilter: '',
  sortOrder: 'updated-desc',

  isSidebarOpen: true,
  viewMode: 'split',
  isFullscreen: false,
  saveStatus: 'saved',
  cursorPosition: { line: 1, ch: 1 },
  selectionInfo: '',
  activeOutlineSectionId: null,

  searchState: {
    isOpen: false,
    searchQuery: '',
    replaceQuery: '',
    caseSensitive: false,
    wholeWord: false,
    isRegex: false,
    currentMatchIndex: 0,
    totalMatches: 0,
  },

  settings: loadSettingsFromStorage(),

  isTemplateModalOpen: false,
  isHistoryModalOpen: false,
  isSettingsModalOpen: false,
  isShortcutsModalOpen: false,
  isTableBuilderModalOpen: false,
  isLinkModalOpen: false,
  isImageModalOpen: false,
  isCodeBlockModalOpen: false,

  _autosaveTimer: null,

  initialize: async () => {
    try {
      const initialDocs = await dbService.initializeDatabase();
      const folders = await dbService.getAllFolders();

      // Find last active or first non-trash document
      const validDoc =
        initialDocs.find((d) => !d.isTrash && !d.archived) || initialDocs[0];

      set({
        documents: initialDocs,
        folders,
        activeDocumentId: validDoc ? validDoc.id : null,
        isLoaded: true,
      });

      // Apply initial theme
      const settings = get().settings;
      if (settings.theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
        document.documentElement.classList.toggle('light', !prefersDark);
      }
    } catch (err) {
      console.error('Failed to initialize Markdown Studio DB:', err);
      set({ isLoaded: true });
    }
  },

  getActiveDocument: () => {
    const { documents, activeDocumentId } = get();
    return documents.find((d) => d.id === activeDocumentId);
  },

  setActiveDocument: (id: string) => {
    const { saveCurrentDocument, documents } = get();
    saveCurrentDocument(); // Save previous doc if dirty

    const targetDoc = documents.find((d) => d.id === id);
    if (targetDoc) {
      targetDoc.lastOpenedAt = Date.now();
      dbService.saveDocument(targetDoc);
    }

    set({
      activeDocumentId: id,
      saveStatus: 'saved',
    });
  },

  createDocument: async (content?: string, title?: string, folderId?: string | null) => {
    const docTitle = title || 'Untitled Document';
    const docContent = content !== undefined ? content : `# ${docTitle}\n\n`;
    const now = Date.now();
    const stats = calculateDocumentStats(docContent);

    const newDoc: DocumentItem = {
      id: 'doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: docTitle,
      content: docContent,
      folderId: folderId || null,
      tags: [],
      favorite: false,
      archived: false,
      isTrash: false,
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
      wordCount: stats.words,
      characterCount: stats.characters,
    };

    await dbService.saveDocument(newDoc);
    // Create initial snapshot
    await dbService.saveVersionSnapshot(newDoc.id, newDoc.title, newDoc.content);

    set((state) => ({
      documents: [newDoc, ...state.documents],
      activeDocumentId: newDoc.id,
      saveStatus: 'saved',
    }));

    return newDoc.id;
  },

  updateDocumentContent: (content: string) => {
    const { activeDocumentId, documents, _autosaveTimer } = get();
    if (!activeDocumentId) return;

    const stats = calculateDocumentStats(content);

    // Update in-memory document immediately for reactive UI
    const updatedDocs = documents.map((doc) => {
      if (doc.id === activeDocumentId) {
        return {
          ...doc,
          content,
          updatedAt: Date.now(),
          wordCount: stats.words,
          characterCount: stats.characters,
        };
      }
      return doc;
    });

    set({
      documents: updatedDocs,
      saveStatus: 'unsaved',
    });

    // Clear previous debounced autosave timer
    if (_autosaveTimer) {
      window.clearTimeout(_autosaveTimer);
    }

    // Set new debounced autosave timer (1.5 seconds)
    const newTimer = window.setTimeout(async () => {
      set({ saveStatus: 'saving' });
      const currentDoc = get().getActiveDocument();
      if (currentDoc) {
        try {
          await dbService.saveDocument(currentDoc);
          set({ saveStatus: 'saved' });
        } catch (err) {
          console.error('Autosave error:', err);
          set({ saveStatus: 'error' });
        }
      }
    }, 1500);

    set({ _autosaveTimer: newTimer });
  },

  updateDocumentTitle: async (id: string, title: string) => {
    const cleanTitle = title.trim() || 'Untitled Document';
    const { documents } = get();
    const target = documents.find((d) => d.id === id);
    if (!target) return;

    const updatedDoc = { ...target, title: cleanTitle, updatedAt: Date.now() };
    await dbService.saveDocument(updatedDoc);

    set((state) => ({
      documents: state.documents.map((d) => (d.id === id ? updatedDoc : d)),
    }));
  },

  saveCurrentDocument: async () => {
    const { _autosaveTimer } = get();
    if (_autosaveTimer) {
      window.clearTimeout(_autosaveTimer);
      set({ _autosaveTimer: null });
    }

    const doc = get().getActiveDocument();
    if (!doc) return;

    set({ saveStatus: 'saving' });
    try {
      await dbService.saveDocument(doc);
      // Create version snapshot
      await dbService.saveVersionSnapshot(doc.id, doc.title, doc.content);
      set({ saveStatus: 'saved' });
    } catch (err) {
      console.error('Manual save failed:', err);
      set({ saveStatus: 'error' });
    }
  },

  duplicateDocument: async (id: string) => {
    const { documents } = get();
    const source = documents.find((d) => d.id === id);
    if (!source) return;

    const now = Date.now();
    const duplicateDoc: DocumentItem = {
      ...source,
      id: 'doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: `${source.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
    };

    await dbService.saveDocument(duplicateDoc);
    set((state) => ({
      documents: [duplicateDoc, ...state.documents],
      activeDocumentId: duplicateDoc.id,
      saveStatus: 'saved',
    }));

    return duplicateDoc.id;
  },

  deleteDocument: async (id: string, permanent: boolean = false) => {
    await dbService.deleteDocument(id, permanent);

    set((state) => {
      let updatedDocs: DocumentItem[];
      if (permanent) {
        updatedDocs = state.documents.filter((d) => d.id !== id);
      } else {
        updatedDocs = state.documents.map((d) =>
          d.id === id ? { ...d, isTrash: true, updatedAt: Date.now() } : d
        );
      }

      // If active document was deleted, select next available active doc
      let nextActiveId = state.activeDocumentId;
      if (nextActiveId === id) {
        const nextDoc = updatedDocs.find((d) => !d.isTrash && !d.archived);
        nextActiveId = nextDoc ? nextDoc.id : null;
      }

      return {
        documents: updatedDocs,
        activeDocumentId: nextActiveId,
      };
    });
  },

  restoreDocument: async (id: string) => {
    await dbService.restoreDocument(id);
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, isTrash: false, updatedAt: Date.now() } : d
      ),
      activeDocumentId: id,
    }));
  },

  emptyTrash: async () => {
    await dbService.emptyTrash();
    set((state) => ({
      documents: state.documents.filter((d) => !d.isTrash),
    }));
  },

  toggleFavorite: async (id: string) => {
    const { documents } = get();
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;

    const updated = { ...doc, favorite: !doc.favorite, updatedAt: Date.now() };
    await dbService.saveDocument(updated);

    set((state) => ({
      documents: state.documents.map((d) => (d.id === id ? updated : d)),
    }));
  },

  toggleArchive: async (id: string) => {
    const { documents } = get();
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;

    const updated = { ...doc, archived: !doc.archived, updatedAt: Date.now() };
    await dbService.saveDocument(updated);

    set((state) => ({
      documents: state.documents.map((d) => (d.id === id ? updated : d)),
    }));
  },

  moveDocumentToFolder: async (docId: string, folderId: string | null) => {
    const { documents } = get();
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;

    const updated = { ...doc, folderId, updatedAt: Date.now() };
    await dbService.saveDocument(updated);

    set((state) => ({
      documents: state.documents.map((d) => (d.id === docId ? updated : d)),
    }));
  },

  addTagToDocument: async (docId: string, tag: string) => {
    const cleanTag = tag.trim().toLowerCase().replace(/^#/, '');
    if (!cleanTag) return;

    const { documents } = get();
    const doc = documents.find((d) => d.id === docId);
    if (!doc || doc.tags.includes(cleanTag)) return;

    const updated = {
      ...doc,
      tags: [...doc.tags, cleanTag],
      updatedAt: Date.now(),
    };
    await dbService.saveDocument(updated);

    set((state) => ({
      documents: state.documents.map((d) => (d.id === docId ? updated : d)),
    }));
  },

  removeTagFromDocument: async (docId: string, tag: string) => {
    const { documents } = get();
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;

    const updated = {
      ...doc,
      tags: doc.tags.filter((t) => t !== tag),
      updatedAt: Date.now(),
    };
    await dbService.saveDocument(updated);

    set((state) => ({
      documents: state.documents.map((d) => (d.id === docId ? updated : d)),
    }));
  },

  createFolder: async (name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;

    const folder: FolderItem = {
      id: 'folder-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: cleanName,
      createdAt: Date.now(),
      parentId: null,
    };

    await dbService.saveFolder(folder);
    set((state) => ({
      folders: [...state.folders, folder],
    }));
  },

  renameFolder: async (id: string, name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;

    const { folders } = get();
    const folder = folders.find((f) => f.id === id);
    if (!folder) return;

    const updated = { ...folder, name: cleanName };
    await dbService.saveFolder(updated);

    set((state) => ({
      folders: state.folders.map((f) => (f.id === id ? updated : f)),
    }));
  },

  deleteFolder: async (id: string) => {
    await dbService.deleteFolder(id);
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
      documents: state.documents.map((d) => (d.folderId === id ? { ...d, folderId: null } : d)),
      selectedFolderId: state.selectedFolderId === id ? null : state.selectedFolderId,
    }));
  },

  importFiles: async () => {
    const imported = await pickAndImportFiles();
    if (imported.length === 0) return;

    const { selectedFolderId } = get();
    let firstNewId: string | null = null;

    for (const item of imported) {
      const id = await get().createDocument(item.content, item.title, selectedFolderId);
      if (!firstNewId) firstNewId = id;
    }

    if (firstNewId) {
      get().setActiveDocument(firstNewId);
    }
  },

  importDroppedFiles: async (files: FileList) => {
    const imported = await processDroppedFiles(files);
    if (imported.length === 0) return;

    const { selectedFolderId } = get();
    let firstNewId: string | null = null;

    for (const item of imported) {
      const id = await get().createDocument(item.content, item.title, selectedFolderId);
      if (!firstNewId) firstNewId = id;
    }

    if (firstNewId) {
      get().setActiveDocument(firstNewId);
    }
  },

  setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setViewMode: (viewMode: ViewMode) => set({ viewMode }),
  toggleFullscreen: () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      set({ isFullscreen: true });
    } else {
      document.exitFullscreen().catch(() => {});
      set({ isFullscreen: false });
    }
  },
  setCursorPosition: (pos) => set({ cursorPosition: pos }),
  setSelectionInfo: (info) => set({ selectionInfo: info }),
  setActiveOutlineSectionId: (id) => set({ activeOutlineSectionId: id }),

  setSidebarFilter: (filter) => set({ sidebarFilter: filter, selectedFolderId: null, selectedTag: null }),
  setSelectedFolderId: (folderId) => set({ selectedFolderId: folderId, sidebarFilter: 'all', selectedTag: null }),
  setSelectedTag: (tag) => set({ selectedTag: tag, sidebarFilter: 'all', selectedFolderId: null }),
  setSearchFilter: (query) => set({ searchFilter: query }),
  setSortOrder: (order) => set({ sortOrder: order }),

  setSearchState: (partial) =>
    set((state) => ({ searchState: { ...state.searchState, ...partial } })),
  openSearch: () =>
    set((state) => ({ searchState: { ...state.searchState, isOpen: true } })),
  openReplace: () =>
    set((state) => ({ searchState: { ...state.searchState, isOpen: true } })),
  closeSearch: () =>
    set((state) => ({ searchState: { ...state.searchState, isOpen: false } })),

  updateSettings: (partial) => {
    set((state) => {
      const newSettings = { ...state.settings, ...partial };
      saveSettingsToStorage(newSettings);

      // Handle theme change in DOM
      if (partial.theme) {
        if (partial.theme === 'light') {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        } else if (partial.theme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.toggle('dark', prefersDark);
          document.documentElement.classList.toggle('light', !prefersDark);
        }
      }

      return { settings: newSettings };
    });
  },

  setTemplateModalOpen: (open) => set({ isTemplateModalOpen: open }),
  setHistoryModalOpen: (open) => set({ isHistoryModalOpen: open }),
  setSettingsModalOpen: (open) => set({ isSettingsModalOpen: open }),
  setShortcutsModalOpen: (open) => set({ isShortcutsModalOpen: open }),
  setTableBuilderModalOpen: (open) => set({ isTableBuilderModalOpen: open }),
  setLinkModalOpen: (open) => set({ isLinkModalOpen: open }),
  setImageModalOpen: (open) => set({ isImageModalOpen: open }),
  setCodeBlockModalOpen: (open) => set({ isCodeBlockModalOpen: open }),
}));
