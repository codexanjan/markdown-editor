import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { X, Image as ImageIcon, Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';

interface ImageModalProps {
  onInsertImage: (markdownImage: string) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ onInsertImage }) => {
  const { isImageModalOpen, setImageModalOpen } = useAppStore();
  const [tab, setTab] = useState<'url' | 'upload'>('url');
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [title, setTitle] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isImageModalOpen) return null;

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Selected file is not an image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image is larger than 5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewDataUrl(reader.result as string);
      if (!alt) {
        setAlt(file.name.replace(/\.[^/.]+$/, ''));
      }
      setError('');
    };
    reader.onerror = () => setError('Failed to read image file.');
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = tab === 'upload' ? previewDataUrl : url.trim();

    if (!finalUrl) {
      setError(tab === 'upload' ? 'Please select an image to upload.' : 'Please enter an image URL.');
      return;
    }

    if (tab === 'url' && /^(javascript|vbscript):/i.test(finalUrl)) {
      setError('Unsafe URL scheme detected.');
      return;
    }

    const altText = alt.trim() || 'Image';
    let md = '';
    if (title.trim()) {
      md = `![${altText}](${finalUrl} "${title.trim().replace(/"/g, '\\"')}")`;
    } else {
      md = `![${altText}](${finalUrl})`;
    }

    onInsertImage(md);
    setImageModalOpen(false);
    // Reset state
    setUrl('');
    setAlt('');
    setTitle('');
    setPreviewDataUrl(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d]">
          <div className="flex items-center space-x-2 text-slate-100 font-semibold">
            <ImageIcon className="w-5 h-5 text-blue-400" />
            <span>Insert Image</span>
          </div>
          <button
            onClick={() => setImageModalOpen(false)}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-md hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#30363d] px-5 pt-3">
          <button
            type="button"
            onClick={() => { setTab('url'); setError(''); }}
            className={`flex items-center space-x-2 pb-3 px-2 border-b-2 text-xs font-medium transition ${
              tab === 'url'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Image URL</span>
          </button>
          <button
            type="button"
            onClick={() => { setTab('upload'); setError(''); }}
            className={`flex items-center space-x-2 pb-3 px-2 border-b-2 text-xs font-medium transition ml-4 ${
              tab === 'upload'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
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

            {tab === 'url' ? (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Image URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="https://example.com/image.png"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  autoFocus
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Upload Local File
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#30363d] hover:border-blue-500/60 rounded-xl p-6 text-center cursor-pointer transition bg-[#0d1117]/50 hover:bg-slate-800/30"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  {previewDataUrl ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={previewDataUrl}
                        alt="Upload preview"
                        className="max-h-32 max-w-full rounded-lg object-contain shadow-sm mb-2"
                      />
                      <span className="text-xs text-blue-400">Click to change image</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <Upload className="w-8 h-8 text-slate-500" />
                      <div className="text-xs">
                        <span className="text-blue-400 font-medium">Click to browse</span> or drag and drop image here
                      </div>
                      <div className="text-[11px] text-slate-500">PNG, JPG, SVG, WebP up to 5MB</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Alt Text (Accessibility)
              </label>
              <input
                type="text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Description for screen readers"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Image Caption / Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Hover caption"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 px-5 py-3 border-t border-[#30363d] bg-[#12161c]">
            <button
              type="button"
              onClick={() => setImageModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition"
            >
              Insert Image
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
