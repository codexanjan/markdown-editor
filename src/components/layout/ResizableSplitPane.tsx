import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { MarkdownEditor } from '../editor/MarkdownEditor';
import { MarkdownPreview } from '../preview/MarkdownPreview';

export const ResizableSplitPane: React.FC = () => {
  const { viewMode, setViewMode, settings } = useAppStore();
  const [splitRatio, setSplitRatio] = useState<number>(50); // percentage for editor width
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  const containerRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef<boolean>(false);

  // Synchronized scrolling handler from editor
  const handleEditorScroll = useCallback(
    (scrollTop: number, scrollHeight: number, clientHeight: number) => {
      if (!settings.syncScroll || isSyncingScroll.current || !previewScrollRef.current) return;
      isSyncingScroll.current = true;

      const scrollPercent = scrollTop / Math.max(1, scrollHeight - clientHeight);
      const preview = previewScrollRef.current;
      preview.scrollTop = scrollPercent * (preview.scrollHeight - preview.clientHeight);

      requestAnimationFrame(() => {
        isSyncingScroll.current = false;
      });
    },
    [settings.syncScroll]
  );

  // Synchronized scrolling handler from preview
  const handlePreviewScroll = useCallback(
    (scrollTop: number, scrollHeight: number, clientHeight: number) => {
      if (!settings.syncScroll || isSyncingScroll.current) return;
      // Reverse sync can also be smooth
    },
    [settings.syncScroll]
  );

  // Drag divider handling
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      const newPercentage = Math.min(80, Math.max(20, (newWidth / rect.width) * 100));
      setSplitRatio(newPercentage);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className={`flex-1 flex flex-col md:flex-row h-full w-full overflow-hidden relative ${
        isDragging ? 'cursor-col-resize select-none' : ''
      }`}
    >
      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden items-center border-b border-[#30363d] bg-[#161b22] px-3 py-1.5 no-print">
        <button
          type="button"
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-1 text-center text-xs font-medium rounded-md transition ${
            mobileTab === 'editor'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Editor
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-1 text-center text-xs font-medium rounded-md transition ml-2 ${
            mobileTab === 'preview'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Editor Panel */}
      {(viewMode === 'split' || viewMode === 'editor-only' || viewMode === 'focus') && (
        <div
          style={{
            width: viewMode === 'split' ? `${splitRatio}%` : '100%',
          }}
          className={`h-full overflow-hidden ${
            mobileTab === 'preview' ? 'hidden md:block' : 'block'
          }`}
        >
          <MarkdownEditor onScroll={handleEditorScroll} />
        </div>
      )}

      {/* Draggable Divider (Only in Split View on desktop) */}
      {viewMode === 'split' && (
        <div
          onMouseDown={handleMouseDown}
          className="hidden md:flex w-1.5 h-full bg-[#161b22] hover:bg-blue-500/60 transition cursor-col-resize items-center justify-center resizer-divider shrink-0 z-20 group no-print"
        >
          <div className="w-0.5 h-8 rounded-full bg-slate-600 group-hover:bg-blue-300 transition" />
        </div>
      )}

      {/* Live Preview Panel */}
      {(viewMode === 'split' || viewMode === 'preview-only') && (
        <div
          style={{
            width: viewMode === 'split' ? `${100 - splitRatio}%` : '100%',
          }}
          className={`h-full overflow-hidden ${
            mobileTab === 'editor' && viewMode === 'split' ? 'hidden md:block' : 'block'
          }`}
        >
          <MarkdownPreview
            scrollSyncRef={previewScrollRef}
            onScroll={handlePreviewScroll}
          />
        </div>
      )}
    </div>
  );
};
