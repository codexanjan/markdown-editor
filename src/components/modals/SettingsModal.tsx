import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { X, Settings, Moon, Sun, Monitor, Type, Sliders } from 'lucide-react';
import { ThemeMode } from '../../types';

export const SettingsModal: React.FC = () => {
  const { isSettingsModalOpen, setSettingsModalOpen, settings, updateSettings } =
    useAppStore();

  if (!isSettingsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d]">
          <div className="flex items-center space-x-2 text-slate-100 font-semibold">
            <Settings className="w-5 h-5 text-blue-400" />
            <span>Settings & Preferences</span>
          </div>
          <button
            onClick={() => setSettingsModalOpen(false)}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-md hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[480px]">
          {/* Theme Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Color Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
                { id: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
                { id: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => updateSettings({ theme: t.id as ThemeMode })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition ${
                    settings.theme === t.id
                      ? 'border-blue-500 bg-blue-600/15 text-blue-400 font-medium'
                      : 'border-[#30363d] hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.icon}
                  <span className="text-xs mt-1.5">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Typography Settings */}
          <div className="space-y-4 pt-4 border-t border-[#30363d]">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Type className="w-4 h-4 text-purple-400" />
              <span>Editor Typography</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Font Family
              </label>
              <select
                value={settings.fontFamily}
                onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-hidden focus:border-blue-500"
              >
                <option value="JetBrains Mono">JetBrains Mono (Recommended)</option>
                <option value="Fira Code">Fira Code</option>
                <option value="ui-monospace">System Monospace</option>
                <option value="Consolas">Consolas</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Editor Font Size</span>
                  <span className="text-slate-400 font-mono">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={22}
                  step={1}
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Preview Font Size</span>
                  <span className="text-slate-400 font-mono">{settings.previewFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={13}
                  max={22}
                  step={1}
                  value={settings.previewFontSize}
                  onChange={(e) => updateSettings({ previewFontSize: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Line Height</span>
                  <span className="text-slate-400 font-mono">{settings.lineHeight}</span>
                </div>
                <input
                  type="range"
                  min={1.4}
                  max={2.2}
                  step={0.1}
                  value={settings.lineHeight}
                  onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tab Width
                </label>
                <select
                  value={settings.tabSize}
                  onChange={(e) => updateSettings({ tabSize: parseInt(e.target.value) })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-hidden focus:border-blue-500"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                </select>
              </div>
            </div>
          </div>

          {/* Editor Behaviors */}
          <div className="space-y-3 pt-4 border-t border-[#30363d]">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Editor Behavior</span>
            </div>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/40 cursor-pointer">
              <span className="text-xs text-slate-300">Show Line Numbers</span>
              <input
                type="checkbox"
                checked={settings.showLineNumbers}
                onChange={(e) => updateSettings({ showLineNumbers: e.target.checked })}
                className="accent-blue-500 w-4 h-4 rounded-sm"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/40 cursor-pointer">
              <span className="text-xs text-slate-300">Word Wrap</span>
              <input
                type="checkbox"
                checked={settings.wordWrap}
                onChange={(e) => updateSettings({ wordWrap: e.target.checked })}
                className="accent-blue-500 w-4 h-4 rounded-sm"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/40 cursor-pointer">
              <span className="text-xs text-slate-300">Synchronized Scrolling</span>
              <input
                type="checkbox"
                checked={settings.syncScroll}
                onChange={(e) => updateSettings({ syncScroll: e.target.checked })}
                className="accent-blue-500 w-4 h-4 rounded-sm"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#30363d] bg-[#12161c]">
          <button
            type="button"
            onClick={() =>
              updateSettings({
                theme: 'dark',
                fontSize: 15,
                fontFamily: 'JetBrains Mono',
                lineHeight: 1.6,
                tabSize: 2,
                showLineNumbers: true,
                wordWrap: true,
                syncScroll: true,
                previewFontSize: 16,
              })
            }
            className="text-xs text-slate-500 hover:text-slate-300 transition"
          >
            Reset to Defaults
          </button>
          <button
            type="button"
            onClick={() => setSettingsModalOpen(false)}
            className="px-5 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
