import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SidebarFilter } from '../../types';
import {
  FileText,
  Plus,
  Folder,
  FolderPlus,
  Star,
  Clock,
  Trash2,
  Archive,
  Search,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Tag,
  Copy,
  Edit2,
  Upload,
  Layers,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    documents,
    activeDocumentId,
    folders,
    sidebarFilter,
    selectedFolderId,
    selectedTag,
    searchFilter,
    sortOrder,
    isSidebarOpen,
    setActiveDocument,
    createDocument,
    duplicateDocument,
    deleteDocument,
    restoreDocument,
    emptyTrash,
    toggleFavorite,
    toggleArchive,
    moveDocumentToFolder,
    createFolder,
    deleteFolder,
    setSidebarFilter,
    setSelectedFolderId,
    setSelectedTag,
    setSearchFilter,
    setSortOrder,
    importFiles,
    setTemplateModalOpen,
  } = useAppStore();

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null);
  const [isFoldersExpanded, setFoldersExpanded] = useState(true);
  const [isTagsExpanded, setTagsExpanded] = useState(true);

  if (!isSidebarOpen) return null;

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    // Trash filter
    if (sidebarFilter === 'trash') {
      if (!doc.isTrash) return false;
    } else {
      if (doc.isTrash) return false;
    }

    // Archive filter
    if (sidebarFilter === 'archive') {
      if (!doc.archived) return false;
    } else if (sidebarFilter !== 'trash') {
      if (doc.archived) return false;
    }

    // Favorites
    if (sidebarFilter === 'favorites' && !doc.favorite) {
      return false;
    }

    // Folder filter
    if (selectedFolderId !== null && doc.folderId !== selectedFolderId) {
      return false;
    }

    // Tag filter
    if (selectedTag !== null && !doc.tags.includes(selectedTag)) {
      return false;
    }

    // Search query
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchContent = doc.content.toLowerCase().includes(q);
      const matchTag = doc.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTag) return false;
    }

    return true;
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sidebarFilter === 'recents') {
      return (b.lastOpenedAt || b.updatedAt) - (a.lastOpenedAt || a.updatedAt);
    }
    switch (sortOrder) {
      case 'updated-desc':
        return b.updatedAt - a.updatedAt;
      case 'updated-asc':
        return a.updatedAt - b.updatedAt;
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      default:
        return b.updatedAt - a.updatedAt;
    }
  });

  // Collect all unique tags
  const allTags = Array.from(
    new Set(
      documents
        .filter((d) => !d.isTrash && !d.archived)
        .flatMap((d) => d.tags)
    )
  );

  // Counts
  const allCount = documents.filter((d) => !d.isTrash && !d.archived).length;
  const favCount = documents.filter((d) => !d.isTrash && !d.archived && d.favorite).length;
  const archiveCount = documents.filter((d) => !d.isTrash && d.archived).length;
  const trashCount = documents.filter((d) => d.isTrash).length;

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const handleStartRename = (doc: { id: string; title: string }) => {
    setEditingDocId(doc.id);
    setEditingTitle(doc.title);
    setActiveMenuDocId(null);
  };

  const handleFinishRename = async (id: string) => {
    if (editingTitle.trim()) {
      await useAppStore.getState().updateDocumentTitle(id, editingTitle.trim());
    }
    setEditingDocId(null);
  };

  const formatTimestamp = (ts: number) => {
    const diffSeconds = Math.floor((Date.now() - ts) / 1000);
    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <aside className="w-72 h-full bg-[#161b22] border-r border-[#30363d] flex flex-col select-none no-print app-sidebar">
      {/* Top Action Buttons */}
      <div className="p-3 border-b border-[#30363d] space-y-2">
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => createDocument()}
            className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Document</span>
          </button>
          <button
            type="button"
            onClick={() => setTemplateModalOpen(true)}
            title="New from Template"
            className="p-1.5 rounded-lg border border-[#30363d] bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
          </button>
          <button
            type="button"
            onClick={importFiles}
            title="Import Files (.md, .txt)"
            className="p-1.5 rounded-lg border border-[#30363d] bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <Upload className="w-4 h-4 text-blue-400" />
          </button>
        </div>

        {/* Live Filter / Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search documents or #tags..."
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-8 pr-7 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {/* Primary Views */}
        <div className="space-y-0.5 text-xs">
          <button
            type="button"
            onClick={() => setSidebarFilter('all')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition ${
              sidebarFilter === 'all' && selectedFolderId === null && selectedTag === null
                ? 'bg-blue-600/15 text-blue-400 font-medium'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-3.5 h-3.5" />
              <span>All Documents</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{allCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setSidebarFilter('recents')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition ${
              sidebarFilter === 'recents'
                ? 'bg-blue-600/15 text-blue-400 font-medium'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Recent</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSidebarFilter('favorites')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition ${
              sidebarFilter === 'favorites'
                ? 'bg-blue-600/15 text-blue-400 font-medium'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Star className="w-3.5 h-3.5 text-yellow-500" />
              <span>Favorites</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{favCount}</span>
          </button>
        </div>

        {/* Folders Section */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setFoldersExpanded(!isFoldersExpanded)}
              className="flex items-center space-x-1 hover:text-slate-200"
            >
              {isFoldersExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Folders</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingFolder(true)}
              title="Add New Folder"
              className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded-sm"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          {isFoldersExpanded && (
            <div className="space-y-0.5 mt-1 text-xs">
              {isCreatingFolder && (
                <form onSubmit={handleCreateFolder} className="flex items-center space-x-1 px-2 py-1">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name..."
                    autoFocus
                    className="flex-1 bg-[#0d1117] border border-blue-500 rounded-sm px-2 py-1 text-xs text-slate-200 focus:outline-hidden"
                  />
                  <button type="submit" className="text-emerald-400 p-1">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsCreatingFolder(false); setNewFolderName(''); }}
                    className="text-slate-500 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {folders.map((folder) => {
                const count = documents.filter((d) => !d.isTrash && !d.archived && d.folderId === folder.id).length;
                const isSelected = selectedFolderId === folder.id;

                return (
                  <div
                    key={folder.id}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md transition ${
                      isSelected
                        ? 'bg-blue-600/15 text-blue-400 font-medium'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedFolderId(folder.id)}
                      className="flex items-center space-x-2 flex-1 text-left truncate"
                    >
                      <Folder className="w-3.5 h-3.5 shrink-0 text-amber-400/80" />
                      <span className="truncate">{folder.name}</span>
                    </button>
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] text-slate-500 font-mono">{count}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete folder "${folder.name}"? Documents inside will move to root.`)) {
                            deleteFolder(folder.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tags Section */}
        {allTags.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setTagsExpanded(!isTagsExpanded)}
                className="flex items-center space-x-1 hover:text-slate-200"
              >
                {isTagsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <span>Tags</span>
              </button>
            </div>

            {isTagsExpanded && (
              <div className="flex flex-wrap gap-1 px-2 pt-1">
                {allTags.map((tag) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(isSelected ? null : tag)}
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] transition ${
                        isSelected
                          ? 'bg-blue-600 text-white font-medium'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <Tag className="w-2.5 h-2.5" />
                      <span>#{tag}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Document List Header & Sort Controls */}
        <div className="pt-2 border-t border-[#30363d]">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-400">
            <span className="font-semibold uppercase tracking-wider">
              Documents ({sortedDocuments.length})
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'updated-desc' | 'updated-asc' | 'title-asc' | 'title-desc')}
              className="bg-transparent border-0 text-[10px] text-slate-400 hover:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="updated-desc" className="bg-[#161b22]">Newest</option>
              <option value="updated-asc" className="bg-[#161b22]">Oldest</option>
              <option value="title-asc" className="bg-[#161b22]">Title A-Z</option>
              <option value="title-desc" className="bg-[#161b22]">Title Z-A</option>
            </select>
          </div>

          {/* Document Cards */}
          <div className="space-y-1 mt-1">
            {sortedDocuments.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 italic">
                No documents found.
              </div>
            ) : (
              sortedDocuments.map((doc) => {
                const isActive = activeDocumentId === doc.id;
                const isMenuOpen = activeMenuDocId === doc.id;

                return (
                  <div
                    key={doc.id}
                    onClick={() => setActiveDocument(doc.id)}
                    className={`group relative p-2.5 rounded-lg cursor-pointer transition border ${
                      isActive
                        ? 'bg-blue-600/10 border-blue-500/40 text-slate-100 shadow-xs'
                        : 'border-transparent hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      {editingDocId === doc.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => handleFinishRename(doc.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleFinishRename(doc.id);
                            if (e.key === 'Escape') setEditingDocId(null);
                          }}
                          autoFocus
                          className="bg-[#0d1117] border border-blue-500 rounded-sm px-1.5 py-0.5 text-xs text-slate-100 w-full focus:outline-hidden"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-xs font-medium truncate flex-1 leading-snug">
                          {doc.title || 'Untitled Document'}
                        </span>
                      )}

                      <div className="flex items-center space-x-1 shrink-0">
                        {/* Favorite button */}
                        {!doc.isTrash && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(doc.id);
                            }}
                            className={`p-0.5 rounded-sm transition ${
                              doc.favorite
                                ? 'text-yellow-500'
                                : 'text-slate-600 opacity-0 group-hover:opacity-100 hover:text-slate-400'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>
                        )}

                        {/* Context menu button */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuDocId(isMenuOpen ? null : doc.id);
                            }}
                            className="p-0.5 text-slate-500 hover:text-slate-200 opacity-0 group-hover:opacity-100 rounded-sm hover:bg-slate-700 transition"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {/* Context menu popup */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 w-44 bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl py-1 z-40 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100"
                            >
                              {!doc.isTrash ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleStartRename(doc)}
                                    className="w-full px-3 py-1.5 text-left hover:bg-blue-600 hover:text-white flex items-center space-x-2"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    <span>Rename</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      duplicateDocument(doc.id);
                                      setActiveMenuDocId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left hover:bg-blue-600 hover:text-white flex items-center space-x-2"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Duplicate</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      toggleArchive(doc.id);
                                      setActiveMenuDocId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left hover:bg-blue-600 hover:text-white flex items-center space-x-2"
                                  >
                                    <Archive className="w-3.5 h-3.5" />
                                    <span>{doc.archived ? 'Unarchive' : 'Archive'}</span>
                                  </button>
                                  {folders.length > 0 && (
                                    <div className="border-t border-[#30363d] my-1 py-1">
                                      <div className="px-3 py-1 text-[10px] text-slate-500 uppercase font-semibold">
                                        Move to Folder
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          moveDocumentToFolder(doc.id, null);
                                          setActiveMenuDocId(null);
                                        }}
                                        className="w-full px-3 py-1 text-left text-slate-400 hover:bg-blue-600 hover:text-white"
                                      >
                                        Root (None)
                                      </button>
                                      {folders.map((f) => (
                                        <button
                                          key={f.id}
                                          type="button"
                                          onClick={() => {
                                            moveDocumentToFolder(doc.id, f.id);
                                            setActiveMenuDocId(null);
                                          }}
                                          className="w-full px-3 py-1 text-left truncate text-slate-400 hover:bg-blue-600 hover:text-white"
                                        >
                                          {f.name}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                  <div className="border-t border-[#30363d] my-1" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteDocument(doc.id, false);
                                      setActiveMenuDocId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-red-600 hover:text-white flex items-center space-x-2"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Move to Trash</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      restoreDocument(doc.id);
                                      setActiveMenuDocId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-emerald-400 hover:bg-emerald-600 hover:text-white flex items-center space-x-2"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Restore Document</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm('Permanently delete this document? This cannot be undone.')) {
                                        deleteDocument(doc.id, true);
                                      }
                                      setActiveMenuDocId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-red-600 hover:text-white flex items-center space-x-2"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Forever</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Preview snippet */}
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-mono">
                      {doc.content.replace(/[#*`_~[\]]/g, '').trim() || 'Empty document'}
                    </div>

                    {/* Metadata footer */}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#30363d]/40 text-[10px] text-slate-500">
                      <span>{formatTimestamp(doc.updatedAt)}</span>
                      <span>{doc.wordCount} words</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Archive & Trash Bar */}
      <div className="p-2 border-t border-[#30363d] bg-[#12161c] flex items-center justify-between text-xs text-slate-400">
        <button
          type="button"
          onClick={() => setSidebarFilter('archive')}
          className={`flex items-center space-x-1.5 px-2 py-1 rounded-md transition ${
            sidebarFilter === 'archive'
              ? 'text-blue-400 bg-blue-600/10 font-medium'
              : 'hover:text-slate-200'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Archive ({archiveCount})</span>
        </button>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setSidebarFilter('trash')}
            className={`flex items-center space-x-1.5 px-2 py-1 rounded-md transition ${
              sidebarFilter === 'trash'
                ? 'text-red-400 bg-red-600/10 font-medium'
                : 'hover:text-slate-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Trash ({trashCount})</span>
          </button>
          {sidebarFilter === 'trash' && trashCount > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Permanently empty all trash documents?')) {
                  emptyTrash();
                }
              }}
              title="Empty Trash"
              className="text-[10px] text-red-400 hover:text-red-300 font-semibold px-1"
            >
              Empty
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
