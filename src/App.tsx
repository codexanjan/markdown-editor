import React, { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/sidebar/Sidebar';
import { ResizableSplitPane } from './components/layout/ResizableSplitPane';
import { StatusBar } from './components/layout/StatusBar';
import { TemplatePickerModal } from './components/modals/TemplatePickerModal';
import { VersionHistoryModal } from './components/modals/VersionHistoryModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { FileDown, Minimize2 } from 'lucide-react';

export const App: React.FC = () => {
  const {
    isLoaded,
    initialize,
    viewMode,
    setViewMode,
    toggleSidebar,
    saveCurrentDocument,
    createDocument,
    importFiles,
    importDroppedFiles,
    openSearch,
    openReplace,
    setShortcutsModalOpen,
  } = useAppStore();

  const [isDragOver, setIsDragOver] = useState(false);

  // Initialize DB & Seed data on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // New Document (Ctrl/Cmd + N)
      if (isMod && !e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        createDocument();
        return;
      }

      // Open / Import (Ctrl/Cmd + O)
      if (isMod && !e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        importFiles();
        return;
      }

      // Force Save (Ctrl/Cmd + S)
      if (isMod && !e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentDocument();
        return;
      }

      // Find (Ctrl/Cmd + F)
      if (isMod && !e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        openSearch();
        return;
      }

      // Replace (Ctrl/Cmd + H)
      if (isMod && !e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        openReplace();
        return;
      }

      // Toggle Sidebar (Ctrl/Cmd + \)
      if (isMod && e.key === '\\') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // Toggle View Mode (Ctrl/Cmd + /)
      if (isMod && e.key === '/') {
        e.preventDefault();
        if (viewMode === 'split') setViewMode('editor-only');
        else if (viewMode === 'editor-only') setViewMode('preview-only');
        else setViewMode('split');
        return;
      }

      // Shortcuts Modal (?)
      if (!isMod && e.key === '?' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        setShortcutsModalOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    createDocument,
    importFiles,
    saveCurrentDocument,
    openSearch,
    openReplace,
    toggleSidebar,
    viewMode,
    setViewMode,
    setShortcutsModalOpen,
  ]);

  // Global Drag and Drop files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await importDroppedFiles(e.dataTransfer.files);
    }
  };

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0d1117] text-slate-200">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg mb-4 animate-pulse">
          M
        </div>
        <div className="text-sm font-semibold tracking-tight text-slate-100">
          Markdown Studio
        </div>
        <div className="text-xs text-slate-500 mt-1">Initializing local database...</div>
      </div>
    );
  }

  const isFocusMode = viewMode === 'focus';

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="h-screen w-screen flex flex-col bg-[#0d1117] text-slate-100 overflow-hidden relative select-none"
    >
      {/* Drag & Drop Visual Overlay */}
      {isDragOver && (
        <div className="fixed inset-0 z-50 bg-blue-600/20 backdrop-blur-xs border-4 border-dashed border-blue-500 flex flex-col items-center justify-center text-white pointer-events-none animate-in fade-in duration-150">
          <FileDown className="w-16 h-16 mb-4 text-blue-400 animate-bounce" />
          <h2 className="text-2xl font-bold">Drop Markdown or Text Files</h2>
          <p className="text-sm text-blue-200 mt-1">
            Files will be imported into Markdown Studio
          </p>
        </div>
      )}

      {/* Focus Mode Exit Floating Button */}
      {isFocusMode && (
        <button
          type="button"
          onClick={() => setViewMode('split')}
          className="fixed top-3 right-3 z-40 p-2 rounded-lg bg-[#161b22]/80 hover:bg-[#161b22] text-slate-400 hover:text-white border border-[#30363d] backdrop-blur-xs shadow-lg transition"
          title="Exit Focus Mode (Esc / Ctrl+/)"
        >
          <Minimize2 className="w-4 h-4" />
        </button>
      )}

      {/* Top Bar (Hidden in Focus Mode) */}
      {!isFocusMode && <TopBar />}

      {/* Main Workspace: Sidebar + ResizableSplitPane */}
      <div className="flex-1 flex overflow-hidden relative">
        {!isFocusMode && <Sidebar />}
        <ResizableSplitPane />
      </div>

      {/* Bottom Status Bar (Hidden in Focus Mode) */}
      {!isFocusMode && <StatusBar />}

      {/* Modals */}
      <TemplatePickerModal />
      <VersionHistoryModal />
      <SettingsModal />
      <ShortcutsModal />
    </div>
  );
};

export default App;
