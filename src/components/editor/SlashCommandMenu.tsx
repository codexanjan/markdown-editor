import React, { useState, useEffect, useRef } from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Code2,
  Quote,
  Table,
  Image as ImageIcon,
  Link2,
  CheckSquare,
  List,
  ListOrdered,
  Minus,
} from 'lucide-react';

export interface SlashCommand {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  extra?: string;
}

const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: 'h1',
    name: 'Heading 1',
    description: 'Large primary section header',
    icon: <Heading1 className="w-4 h-4 text-blue-400" />,
    action: 'heading',
    extra: '1',
  },
  {
    id: 'h2',
    name: 'Heading 2',
    description: 'Medium subsection header',
    icon: <Heading2 className="w-4 h-4 text-blue-400" />,
    action: 'heading',
    extra: '2',
  },
  {
    id: 'h3',
    name: 'Heading 3',
    description: 'Small sub-subsection header',
    icon: <Heading3 className="w-4 h-4 text-blue-400" />,
    action: 'heading',
    extra: '3',
  },
  {
    id: 'bullet',
    name: 'Bullet List',
    description: 'Unordered bulleted list',
    icon: <List className="w-4 h-4 text-purple-400" />,
    action: 'bullet-list',
  },
  {
    id: 'numbered',
    name: 'Numbered List',
    description: 'Ordered numerical list',
    icon: <ListOrdered className="w-4 h-4 text-purple-400" />,
    action: 'ordered-list',
  },
  {
    id: 'task',
    name: 'Task List',
    description: 'Checklist with interactive checkboxes',
    icon: <CheckSquare className="w-4 h-4 text-emerald-400" />,
    action: 'task-list',
  },
  {
    id: 'code',
    name: 'Code Block',
    description: 'Fenced code with syntax highlighting',
    icon: <Code2 className="w-4 h-4 text-amber-400" />,
    action: 'code-block-modal',
  },
  {
    id: 'quote',
    name: 'Blockquote',
    description: 'Callout or quotation block',
    icon: <Quote className="w-4 h-4 text-cyan-400" />,
    action: 'quote',
  },
  {
    id: 'table',
    name: 'Table',
    description: 'Grid layout table with headers',
    icon: <Table className="w-4 h-4 text-indigo-400" />,
    action: 'table-modal',
  },
  {
    id: 'image',
    name: 'Image',
    description: 'Embed image from URL or upload',
    icon: <ImageIcon className="w-4 h-4 text-pink-400" />,
    action: 'image-modal',
  },
  {
    id: 'link',
    name: 'Link',
    description: 'Insert web hyperlink',
    icon: <Link2 className="w-4 h-4 text-blue-400" />,
    action: 'link-modal',
  },
  {
    id: 'bold',
    name: 'Bold Text',
    description: 'Strong bold text styling',
    icon: <Bold className="w-4 h-4 text-yellow-400" />,
    action: 'bold',
  },
  {
    id: 'italic',
    name: 'Italic Text',
    description: 'Emphasis italic styling',
    icon: <Italic className="w-4 h-4 text-orange-400" />,
    action: 'italic',
  },
  {
    id: 'divider',
    name: 'Horizontal Divider',
    description: 'Visual separation rule',
    icon: <Minus className="w-4 h-4 text-slate-400" />,
    action: 'divider',
  },
];

interface SlashCommandMenuProps {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number };
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  isOpen,
  query,
  position,
  onSelect,
  onClose,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter commands
  const filteredCommands = SLASH_COMMANDS.filter((cmd) => {
    const q = query.toLowerCase().replace(/^\//, '').trim();
    if (!q) return true;
    return (
      cmd.name.toLowerCase().includes(q) ||
      cmd.id.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? Math.max(0, filteredCommands.length - 1) : prev - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, selectedIndex, filteredCommands, onSelect, onClose]);

  if (!isOpen || filteredCommands.length === 0) return null;

  return (
    <div
      ref={menuRef}
      style={{
        top: `${Math.min(window.innerHeight - 320, Math.max(20, position.top))}px`,
        left: `${Math.min(window.innerWidth - 300, Math.max(20, position.left))}px`,
      }}
      className="fixed z-50 w-72 max-h-72 overflow-y-auto bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
        Commands
      </div>
      {filteredCommands.map((command, idx) => (
        <button
          key={command.id}
          type="button"
          onClick={() => onSelect(command)}
          onMouseEnter={() => setSelectedIndex(idx)}
          className={`w-full flex items-center space-x-2.5 px-3 py-2 text-left transition ${
            idx === selectedIndex
              ? 'bg-blue-600/20 text-blue-200'
              : 'text-slate-300 hover:bg-slate-800/60'
          }`}
        >
          <div className="p-1 rounded-md bg-slate-800/80 shrink-0">
            {command.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-slate-100 truncate">{command.name}</div>
            <div className="text-[10px] text-slate-400 truncate">{command.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
};
