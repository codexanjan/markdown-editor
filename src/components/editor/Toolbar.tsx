import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Heading,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link2,
  Image as ImageIcon,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Table as TableIcon,
  Code2,
  Minus,
  Undo,
  Redo,
  ChevronDown,
} from 'lucide-react';

interface ToolbarProps {
  onFormat: (action: string, extra?: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onFormat,
  onUndo,
  onRedo,
}) => {
  const {
    setTableBuilderModalOpen,
    setLinkModalOpen,
    setImageModalOpen,
    setCodeBlockModalOpen,
  } = useAppStore();

  const [isHeadingMenuOpen, setHeadingMenuOpen] = useState(false);
  const headingMenuRef = useRef<HTMLDivElement>(null);

  // Close heading dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        headingMenuRef.current &&
        !headingMenuRef.current.contains(e.target as Node)
      ) {
        setHeadingMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHeadingSelect = (level: number) => {
    onFormat('heading', level.toString());
    setHeadingMenuOpen(false);
  };

  return (
    <div className="flex items-center flex-wrap gap-1 px-3 py-1.5 border-b border-[#30363d] bg-[#161b22]/70 backdrop-blur-xs select-none text-slate-300">
      {/* Undo / Redo */}
      <div className="flex items-center space-x-0.5 pr-2 border-r border-[#30363d]">
        <button
          type="button"
          onClick={onUndo}
          title="Undo (Ctrl+Z)"
          className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-100 transition disabled:opacity-40"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          title="Redo (Ctrl+Shift+Z)"
          className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-100 transition disabled:opacity-40"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Headings Dropdown */}
      <div className="relative" ref={headingMenuRef}>
        <button
          type="button"
          onClick={() => setHeadingMenuOpen(!isHeadingMenuOpen)}
          title="Headings"
          className="flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium hover:bg-slate-800 hover:text-slate-100 transition"
        >
          <Heading className="w-3.5 h-3.5" />
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {isHeadingMenuOpen && (
          <div className="absolute left-0 top-full mt-1 w-36 bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl py-1 z-30 animate-in fade-in zoom-in duration-100">
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => handleHeadingSelect(level)}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-600 hover:text-white transition flex items-center justify-between"
              >
                <span>Heading {level}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {'#'.repeat(level)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-4 w-px bg-[#30363d] mx-1" />

      {/* Text Styles */}
      <div className="flex items-center space-x-0.5">
        <button
          type="button"
          onClick={() => onFormat('bold')}
          title="Bold (Ctrl+B)"
          className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-100 transition"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onFormat('italic')}
          title="Italic (Ctrl+I)"
          className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-100 transition"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onFormat('strikethrough')}
          title="Strikethrough"
          className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-100 transition"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onFormat('inline-code')}
          title="Inline Code"
          className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-100 transition"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="h-4 w-px bg-[#30363d] mx-1" />

      {/* Lists */}
      <div className="flex items-center space-x-0.5">
        <button
          type="button"
          onClick={() => onFormat('bullet-list')}
          title="Bullet List"
          className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-100 transition"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onFormat('ordered-list')}
          title="Numbered List"
          className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-100 transition"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onFormat('task-list')}
          title="Task List"
          className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-100 transition"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="h-4 w-px bg-[#30363d] mx-1" />

      {/* Blocks & Inserts */}
      <div className="flex items-center space-x-0.5">
        <button
          type="button"
          onClick={() => onFormat('quote')}
          title="Blockquote"
          className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-100 transition"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setCodeBlockModalOpen(true)}
          title="Code Block"
          className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-100 transition"
        >
          <Code2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setLinkModalOpen(true)}
          title="Insert Link (Ctrl+K)"
          className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-100 transition"
        >
          <Link2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setImageModalOpen(true)}
          title="Insert Image"
          className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-100 transition"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setTableBuilderModalOpen(true)}
          title="Insert Table"
          className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-100 transition"
        >
          <TableIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onFormat('divider')}
          title="Horizontal Rule"
          className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-100 transition"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
