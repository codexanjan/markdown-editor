import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { X, Command, Keyboard } from 'lucide-react';

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsModalOpen, setShortcutsModalOpen } = useAppStore();

  if (!isShortcutsModalOpen) return null;

  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcutGroups = [
    {
      title: 'File & Document',
      items: [
        { keys: [`${modKey}`, 'N'], desc: 'New Document' },
        { keys: [`${modKey}`, 'O'], desc: 'Open / Import File' },
        { keys: [`${modKey}`, 'S'], desc: 'Save Document Now' },
        { keys: [`${modKey}`, 'P'], desc: 'Print / Export to PDF' },
      ],
    },
    {
      title: 'Editing & Formatting',
      items: [
        { keys: [`${modKey}`, 'B'], desc: 'Bold Selected Text' },
        { keys: [`${modKey}`, 'I'], desc: 'Italic Selected Text' },
        { keys: [`${modKey}`, 'K'], desc: 'Insert Link Dialog' },
        { keys: [`${modKey}`, 'Z'], desc: 'Undo' },
        { keys: [`${modKey}`, 'Shift', 'Z'], desc: 'Redo' },
        { keys: ['/'], desc: 'Open Slash Command Menu' },
      ],
    },
    {
      title: 'Search & Navigation',
      items: [
        { keys: [`${modKey}`, 'F'], desc: 'Find in Document' },
        { keys: [`${modKey}`, 'H'], desc: 'Find & Replace' },
        { keys: ['Enter'], desc: 'Next Search Match' },
        { keys: ['Shift', 'Enter'], desc: 'Previous Search Match' },
        { keys: ['Esc'], desc: 'Close Search / Dialogs' },
      ],
    },
    {
      title: 'View & Interface',
      items: [
        { keys: [`${modKey}`, '\\'], desc: 'Toggle Sidebar' },
        { keys: [`${modKey}`, '/'], desc: 'Toggle View Mode' },
        { keys: ['F11'], desc: 'Toggle Fullscreen Mode' },
        { keys: ['?'], desc: 'Open Keyboard Shortcuts' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d]">
          <div className="flex items-center space-x-2 text-slate-100 font-semibold">
            <Keyboard className="w-5 h-5 text-blue-400" />
            <span>Keyboard Shortcuts</span>
          </div>
          <button
            onClick={() => setShortcutsModalOpen(false)}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-md hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-y-auto max-h-[480px]">
          {shortcutGroups.map((group) => (
            <div key={group.title} className="space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {group.title}
              </h4>
              <div className="space-y-2">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 border-b border-[#30363d]/40"
                  >
                    <span className="text-slate-300">{item.desc}</span>
                    <div className="flex items-center space-x-1">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-0.5 rounded-md bg-[#0d1117] border border-[#30363d] text-[11px] font-mono text-slate-200 shadow-xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#30363d] bg-[#12161c]">
          <div className="text-[11px] text-slate-500">
            Detected OS: <span className="font-medium text-slate-400">{isMac ? 'macOS' : 'Windows / Linux'}</span>
          </div>
          <button
            type="button"
            onClick={() => setShortcutsModalOpen(false)}
            className="px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
