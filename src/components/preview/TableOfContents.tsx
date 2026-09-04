import React from 'react';
import { HeadingItem } from '../../types';
import { ListCollapse } from 'lucide-react';

interface TableOfContentsProps {
  headings: HeadingItem[];
  activeHeadingId: string | null;
  onSelectHeading: (id: string) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  headings,
  activeHeadingId,
  onSelectHeading,
}) => {
  if (headings.length === 0) {
    return (
      <div className="p-4 text-xs text-slate-500 text-center italic">
        No headings detected in this document. Add # H1, ## H2 to generate an outline.
      </div>
    );
  }

  return (
    <div className="p-3 text-xs">
      <div className="flex items-center space-x-2 pb-2 mb-2 border-b border-[#30363d] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
        <ListCollapse className="w-3.5 h-3.5 text-blue-400" />
        <span>Document Outline</span>
      </div>

      <nav className="space-y-1">
        {headings.map((heading) => {
          const isActive = activeHeadingId === heading.id;
          const indent = Math.max(0, heading.level - 1) * 12;

          return (
            <button
              key={`${heading.id}-${heading.line}`}
              type="button"
              onClick={() => onSelectHeading(heading.id)}
              style={{ paddingLeft: `${indent + 8}px` }}
              className={`w-full text-left py-1.5 pr-2 rounded-md transition flex items-center justify-between text-xs group ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span className="truncate">{heading.text}</span>
              <span className="text-[10px] text-slate-600 group-hover:text-slate-500 font-mono shrink-0 ml-2">
                H{heading.level}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
