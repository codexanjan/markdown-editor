import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Search,
  ChevronUp,
  ChevronDown,
  X,
  Replace,
  CaseSensitive,
  WholeWord,
  Regex,
} from 'lucide-react';

interface SearchReplaceBarProps {
  onFindNext: () => void;
  onFindPrev: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
}

export const SearchReplaceBar: React.FC<SearchReplaceBarProps> = ({
  onFindNext,
  onFindPrev,
  onReplace,
  onReplaceAll,
}) => {
  const { searchState, setSearchState, closeSearch } = useAppStore();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchState.isOpen) {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }
  }, [searchState.isOpen]);

  if (!searchState.isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onFindPrev();
      } else {
        onFindNext();
      }
    }
  };

  return (
    <div className="absolute top-2 right-4 z-40 bg-[#161b22]/95 backdrop-blur-md border border-[#30363d] rounded-xl shadow-2xl p-2.5 w-80 sm:w-96 text-xs text-slate-200 transition-all duration-150 animate-in slide-in-from-top-2">
      {/* Search Row */}
      <div className="flex items-center space-x-1.5 mb-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchState.searchQuery}
            onChange={(e) => setSearchState({ searchQuery: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Find in document..."
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-8 pr-16 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
          {searchState.searchQuery && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
              {searchState.totalMatches > 0
                ? `${searchState.currentMatchIndex + 1} of ${searchState.totalMatches}`
                : 'No results'}
            </span>
          )}
        </div>

        {/* Options */}
        <div className="flex items-center space-x-0.5">
          <button
            type="button"
            title="Match Case (Alt+C)"
            onClick={() => setSearchState({ caseSensitive: !searchState.caseSensitive })}
            className={`p-1.5 rounded-md transition ${
              searchState.caseSensitive
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <CaseSensitive className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Match Whole Word (Alt+W)"
            onClick={() => setSearchState({ wholeWord: !searchState.wholeWord })}
            className={`p-1.5 rounded-md transition ${
              searchState.wholeWord
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <WholeWord className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Use Regular Expression (Alt+R)"
            onClick={() => setSearchState({ isRegex: !searchState.isRegex })}
            className={`p-1.5 rounded-md transition ${
              searchState.isRegex
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Regex className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Next / Prev */}
        <div className="flex items-center space-x-0.5 border-l border-[#30363d] pl-1">
          <button
            type="button"
            title="Previous match (Shift+Enter)"
            onClick={onFindPrev}
            disabled={searchState.totalMatches === 0}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 transition"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Next match (Enter)"
            onClick={onFindNext}
            disabled={searchState.totalMatches === 0}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 transition"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Close (Escape)"
            onClick={closeSearch}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Replace Row */}
      <div className="flex items-center space-x-1.5">
        <div className="relative flex-1">
          <Replace className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchState.replaceQuery}
            onChange={(e) => setSearchState({ replaceQuery: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Replace with..."
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-8 pr-2 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <button
          type="button"
          onClick={onReplace}
          disabled={searchState.totalMatches === 0}
          className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 text-[11px] font-medium transition"
        >
          Replace
        </button>
        <button
          type="button"
          onClick={onReplaceAll}
          disabled={searchState.totalMatches === 0}
          className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 text-[11px] font-medium transition"
        >
          All
        </button>
      </div>
    </div>
  );
};
