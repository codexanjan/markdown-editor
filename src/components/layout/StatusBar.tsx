import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { calculateDocumentStats } from '../../services/stats';
import { FileText, Clock, AlignJustify, CheckCircle2, ChevronUp } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { getActiveDocument, cursorPosition, selectionInfo, saveStatus } = useAppStore();
  const activeDoc = getActiveDocument();
  const content = activeDoc ? activeDoc.content : '';
  const stats = calculateDocumentStats(content);

  const [showDetailedStats, setShowDetailedStats] = useState(false);

  return (
    <footer className="h-7 border-t border-[#30363d] bg-[#161b22] px-3 flex items-center justify-between text-[11px] text-slate-400 select-none z-30 app-statusbar no-print relative">
      {/* Left: Language & Position */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 hover:text-slate-200 transition">
          <FileText className="w-3 h-3 text-blue-400" />
          <span>Markdown</span>
        </div>

        <div className="h-3 w-px bg-[#30363d]" />

        <div className="hover:text-slate-200 transition font-mono">
          Ln {cursorPosition.line}, Col {cursorPosition.ch}
        </div>

        {selectionInfo && (
          <>
            <div className="h-3 w-px bg-[#30363d]" />
            <div className="text-blue-400 font-medium">({selectionInfo})</div>
          </>
        )}
      </div>

      {/* Right: Metrics & Details */}
      <div className="flex items-center space-x-3">
        {/* Toggleable Detailed Stats Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDetailedStats(!showDetailedStats)}
            className="flex items-center space-x-1 hover:text-slate-200 transition cursor-pointer"
          >
            <span>{stats.words} words</span>
            <span className="text-slate-600">·</span>
            <span>{stats.characters} chars</span>
            <ChevronUp className={`w-3 h-3 transition-transform ${showDetailedStats ? 'rotate-180' : ''}`} />
          </button>

          {showDetailedStats && (
            <div className="absolute right-0 bottom-full mb-1.5 w-60 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl p-3 z-40 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] uppercase font-semibold text-slate-500 mb-2 pb-1 border-b border-[#30363d]">
                Document Metrics
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Words:</span>
                  <span className="font-mono font-medium">{stats.words.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Characters (all):</span>
                  <span className="font-mono font-medium">{stats.characters.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Characters (no spaces):</span>
                  <span className="font-mono font-medium">{stats.charactersNoSpaces.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lines:</span>
                  <span className="font-mono font-medium">{stats.lines.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Paragraphs:</span>
                  <span className="font-mono font-medium">{stats.paragraphs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#30363d]/60">
                  <span className="text-slate-400">Reading time:</span>
                  <span className="font-mono font-medium text-blue-400">~{stats.readingTimeMinutes} min</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-3 w-px bg-[#30363d] hidden sm:block" />

        <div className="hidden sm:flex items-center space-x-1 text-slate-500">
          <Clock className="w-3 h-3" />
          <span>{stats.readingTimeMinutes}m read</span>
        </div>

        <div className="h-3 w-px bg-[#30363d]" />

        <div className="font-mono text-[10px] text-slate-400">
          UTF-8
        </div>
      </div>
    </footer>
  );
};
