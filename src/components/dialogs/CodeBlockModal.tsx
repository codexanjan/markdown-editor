import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { X, Code2 } from 'lucide-react';

interface CodeBlockModalProps {
  onInsertCodeBlock: (markdownCode: string) => void;
}

const COMMON_LANGUAGES = [
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'Rust', value: 'rust' },
  { label: 'Go', value: 'go' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'SQL', value: 'sql' },
  { label: 'Bash / Shell', value: 'bash' },
  { label: 'JSON', value: 'json' },
  { label: 'YAML', value: 'yaml' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'C++', value: 'cpp' },
  { label: 'C#', value: 'csharp' },
  { label: 'Java', value: 'java' },
  { label: 'Kotlin', value: 'kotlin' },
  { label: 'PHP', value: 'php' },
  { label: 'Swift', value: 'swift' },
  { label: 'Ruby', value: 'ruby' },
  { label: 'Docker', value: 'dockerfile' },
];

export const CodeBlockModal: React.FC<CodeBlockModalProps> = ({ onInsertCodeBlock }) => {
  const { isCodeBlockModalOpen, setCodeBlockModalOpen } = useAppStore();
  const [language, setLanguage] = useState('typescript');
  const [code, setCode] = useState('');

  if (!isCodeBlockModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const snippet = code.trim();
    const md = `\n\`\`\`${language}\n${snippet}\n\`\`\`\n`;
    onInsertCodeBlock(md);
    setCodeBlockModalOpen(false);
    setCode('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d]">
          <div className="flex items-center space-x-2 text-slate-100 font-semibold">
            <Code2 className="w-5 h-5 text-blue-400" />
            <span>Insert Code Block</span>
          </div>
          <button
            onClick={() => setCodeBlockModalOpen(false)}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-md hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
              >
                {COMMON_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label} ({lang.value})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Code Snippet
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={7}
                placeholder="// Enter or paste your code here..."
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-hidden focus:border-blue-500 resize-y"
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 px-5 py-3 border-t border-[#30363d] bg-[#12161c]">
            <button
              type="button"
              onClick={() => setCodeBlockModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition"
            >
              Insert Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
