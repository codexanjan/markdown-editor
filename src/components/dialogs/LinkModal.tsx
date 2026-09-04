import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { X, Link2, AlertCircle } from 'lucide-react';

interface LinkModalProps {
  initialText?: string;
  onInsertLink: (markdownLink: string) => void;
}

export const LinkModal: React.FC<LinkModalProps> = ({ initialText = '', onInsertLink }) => {
  const { isLinkModalOpen, setLinkModalOpen } = useAppStore();
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLinkModalOpen) {
      setText(initialText || '');
      setUrl('');
      setTitle('');
      setError('');
    }
  }, [isLinkModalOpen, initialText]);

  if (!isLinkModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      setError('Please enter a destination URL or anchor');
      return;
    }

    // Security check: block javascript: and vbscript: URLs
    if (/^(javascript|vbscript|data):/i.test(cleanUrl)) {
      setError('Unsafe protocol detected. Please use https://, mailto:, or relative links.');
      return;
    }

    const displayText = text.trim() || cleanUrl;
    let md = '';

    if (title.trim()) {
      md = `[${displayText}](${cleanUrl} "${title.trim().replace(/"/g, '\\"')}")`;
    } else {
      md = `[${displayText}](${cleanUrl})`;
    }

    onInsertLink(md);
    setLinkModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d]">
          <div className="flex items-center space-x-2 text-slate-100 font-semibold">
            <Link2 className="w-5 h-5 text-blue-400" />
            <span>Insert Link</span>
          </div>
          <button
            onClick={() => setLinkModalOpen(false)}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-md hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Link Text
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Read the Documentation"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                URL <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError('');
                }}
                placeholder="https://example.com, mailto:info@example.com, or #heading"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Tooltip Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Hover tooltip preview"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 px-5 py-3 border-t border-[#30363d] bg-[#12161c]">
            <button
              type="button"
              onClick={() => setLinkModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition"
            >
              Insert Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
