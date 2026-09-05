import React, { useState, useRef, useEffect } from 'react';
import logoImg from '../../assets/logo.png';
import { useAppStore } from '../../store/useAppStore';
import { ViewMode } from '../../types';
import {
  exportAsMarkdown,
  exportAsPlainText,
  exportAsHtml,
  triggerPrintDialog,
  copyToClipboard,
  generateStandaloneHtml,
} from '../../services/fileExport';
import {
  Sidebar as SidebarIcon,
  Columns2,
  FileCode,
  Eye,
  Maximize2,
  Download,
  History,
  Settings,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  Sparkles,
  Search,
  Copy,
  Printer,
  FileDown,
  Globe,
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    getActiveDocument,
    updateDocumentTitle,
    saveCurrentDocument,
    saveStatus,
    isSidebarOpen,
    toggleSidebar,
    viewMode,
    setViewMode,
    isFullscreen,
    toggleFullscreen,
    openSearch,
    setTemplateModalOpen,
    setHistoryModalOpen,
    setSettingsModalOpen,
    setShortcutsModalOpen,
  } = useAppStore();

  const activeDoc = getActiveDocument();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeDoc) {
      setTitleInput(activeDoc.title);
    }
  }, [activeDoc?.title]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(e.target as Node)
      ) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleSubmit = () => {
    if (activeDoc && titleInput.trim()) {
      updateDocumentTitle(activeDoc.id, titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleExport = (type: 'md' | 'txt' | 'html' | 'pdf' | 'copy-md' | 'copy-html') => {
    if (!activeDoc) return;
    setIsExportMenuOpen(false);

    switch (type) {
      case 'md':
        exportAsMarkdown(activeDoc.title, activeDoc.content);
        showToast('Downloaded .md file');
        break;
      case 'txt':
        exportAsPlainText(activeDoc.title, activeDoc.content);
        showToast('Downloaded .txt file');
        break;
      case 'html': {
        const previewElement = document.querySelector('.markdown-preview');
        const renderedHtml = previewElement ? previewElement.innerHTML : activeDoc.content;
        exportAsHtml(activeDoc.title, renderedHtml);
        showToast('Downloaded styled .html file');
        break;
      }
      case 'pdf':
        triggerPrintDialog();
        break;
      case 'copy-md':
        copyToClipboard(activeDoc.content).then(() => {
          showToast('Markdown copied to clipboard!');
        });
        break;
      case 'copy-html': {
        const previewElement = document.querySelector('.markdown-preview');
        const html = previewElement ? previewElement.innerHTML : activeDoc.content;
        copyToClipboard(html).then(() => {
          showToast('Rendered HTML copied to clipboard!');
        });
        break;
      }
    }
  };

  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center space-x-1 text-amber-400 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Saving...</span>
          </div>
        );
      case 'unsaved':
        return (
          <button
            type="button"
            onClick={saveCurrentDocument}
            title="Click to save now (Ctrl+S)"
            className="flex items-center space-x-1 text-yellow-400 text-[11px] px-2 py-0.5 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 transition cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <span>Unsaved</span>
          </button>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-1 text-red-400 text-[11px] px-2 py-0.5 rounded-full bg-red-500/10">
            <AlertCircle className="w-3 h-3" />
            <span>Save error</span>
          </div>
        );
      case 'saved':
      default:
        return (
          <div className="flex items-center space-x-1 text-emerald-400 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10">
            <CheckCircle2 className="w-3 h-3" />
            <span>Saved</span>
          </div>
        );
    }
  };

  return (
    <header className="h-12 border-b border-[#30363d] bg-[#161b22] px-3 flex items-center justify-between select-none z-30 app-topbar no-print">
      {/* Left: Sidebar Toggle, Logo & Title */}
      <div className="flex items-center space-x-3 min-w-0">
        <button
          type="button"
          onClick={toggleSidebar}
          title={isSidebarOpen ? 'Close sidebar (Ctrl+\\)' : 'Open sidebar (Ctrl+\\)'}
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition"
        >
          <SidebarIcon className="w-4 h-4" />
        </button>

        {/* Logo */}
        <div className="flex items-center space-x-2 shrink-0">
          <img
            src={logoImg}
            alt="Markdown Studio Logo"
            className="w-6 h-6 rounded-md object-cover shadow-sm ring-1 ring-blue-500/30"
          />
          <span className="text-xs font-semibold text-slate-200 hidden sm:inline tracking-tight">
            Markdown Studio
          </span>
        </div>

        <div className="h-4 w-px bg-[#30363d] hidden sm:block" />

        {/* Inline Editable Document Title */}
        <div className="flex items-center space-x-2 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              autoFocus
              className="bg-[#0d1117] border border-blue-500 rounded-md px-2 py-0.5 text-xs text-slate-100 font-medium focus:outline-hidden max-w-xs"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename"
              className="text-xs font-medium text-slate-200 hover:text-white px-2 py-1 rounded-md hover:bg-slate-800/80 truncate max-w-[180px] sm:max-w-xs transition text-left"
            >
              {activeDoc?.title || 'Untitled Document'}
            </button>
          )}

          {renderSaveStatus()}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
        {/* Search trigger */}
        <button
          type="button"
          onClick={openSearch}
          title="Find & Replace (Ctrl+F)"
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Templates Picker Trigger */}
        <button
          type="button"
          onClick={() => setTemplateModalOpen(true)}
          title="Document Templates"
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
        </button>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('editor-only')}
            title="Editor Only"
            className={`p-1 rounded-md text-xs transition ${
              viewMode === 'editor-only'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            title="Split (Editor + Preview)"
            className={`p-1 rounded-md text-xs transition ${
              viewMode === 'split'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview-only')}
            title="Preview Only"
            className={`p-1 rounded-md text-xs transition ${
              viewMode === 'preview-only'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Export Dropdown */}
        <div className="relative" ref={exportMenuRef}>
          <button
            type="button"
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-[#30363d] transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl py-1.5 z-40 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] uppercase font-semibold text-slate-500">
                Download
              </div>
              <button
                type="button"
                onClick={() => handleExport('md')}
                className="w-full px-3 py-1.5 text-left hover:bg-blue-600 hover:text-white flex items-center space-x-2"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-400" />
                <span>Markdown (.md)</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport('txt')}
                className="w-full px-3 py-1.5 text-left hover:bg-blue-600 hover:text-white flex items-center space-x-2"
              >
                <FileCode className="w-3.5 h-3.5 text-slate-400" />
                <span>Plain Text (.txt)</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport('html')}
                className="w-full px-3 py-1.5 text-left hover:bg-blue-600 hover:text-white flex items-center space-x-2"
              >
                <Globe className="w-3.5 h-3.5 text-orange-400" />
                <span>Styled HTML (.html)</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                className="w-full px-3 py-1.5 text-left hover:bg-blue-600 hover:text-white flex items-center space-x-2"
              >
                <Printer className="w-3.5 h-3.5 text-red-400" />
                <span>Print / PDF (Ctrl+P)</span>
              </button>

              <div className="border-t border-[#30363d] my-1" />
              <div className="px-3 py-1 text-[10px] uppercase font-semibold text-slate-500">
                Clipboard
              </div>
              <button
                type="button"
                onClick={() => handleExport('copy-md')}
                className="w-full px-3 py-1.5 text-left hover:bg-blue-600 hover:text-white flex items-center space-x-2"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Markdown</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport('copy-html')}
                className="w-full px-3 py-1.5 text-left hover:bg-blue-600 hover:text-white flex items-center space-x-2"
              >
                <Copy className="w-3.5 h-3.5 text-purple-400" />
                <span>Copy Rendered HTML</span>
              </button>
            </div>
          )}
        </div>

        {/* Document History Snapshots */}
        <button
          type="button"
          onClick={() => setHistoryModalOpen(true)}
          title="Version History & Snapshots"
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition"
        >
          <History className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen (F11)' : 'Enter Fullscreen (F11)'}
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition hidden sm:block"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Shortcuts Cheat Sheet */}
        <button
          type="button"
          onClick={() => setShortcutsModalOpen(true)}
          title="Keyboard Shortcuts (?)"
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Settings Modal */}
        <button
          type="button"
          onClick={() => setSettingsModalOpen(true)}
          title="Settings & Appearance"
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* GitHub Repository */}
        <a
          href="https://github.com/codexanjan/markdown-editor"
          target="_blank"
          rel="noopener noreferrer"
          title="View on GitHub (codexanjan/markdown-editor)"
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition flex items-center"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        </a>
      </div>

      {/* Ephemeral Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#161b22] border border-blue-500/50 text-slate-100 text-xs px-4 py-2 rounded-lg shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </header>
  );
};
