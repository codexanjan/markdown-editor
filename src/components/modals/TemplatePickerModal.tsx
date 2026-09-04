import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { DOCUMENT_TEMPLATES, DocumentTemplate } from '../../services/templates';
import {
  X,
  Sparkles,
  FileText,
  BookOpen,
  Layers,
  Users,
  PenTool,
  Code,
  GitCommit,
  GraduationCap,
  Calendar,
  Check,
} from 'lucide-react';

export const TemplatePickerModal: React.FC = () => {
  const { isTemplateModalOpen, setTemplateModalOpen, createDocument } = useAppStore();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(
    DOCUMENT_TEMPLATES[0]
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isTemplateModalOpen) return null;

  const categories = ['All', 'General', 'Development', 'Productivity', 'Writing'];

  const filtered = DOCUMENT_TEMPLATES.filter(
    (t) => selectedCategory === 'All' || t.category === selectedCategory
  );

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-purple-400" />;
      case 'Users':
        return <Users className="w-4 h-4 text-indigo-400" />;
      case 'PenTool':
        return <PenTool className="w-4 h-4 text-pink-400" />;
      case 'Code':
        return <Code className="w-4 h-4 text-amber-400" />;
      case 'GitCommit':
        return <GitCommit className="w-4 h-4 text-cyan-400" />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4 text-yellow-400" />;
      case 'Calendar':
        return <Calendar className="w-4 h-4 text-red-400" />;
      default:
        return <FileText className="w-4 h-4 text-blue-400" />;
    }
  };

  const handleUseTemplate = async () => {
    await createDocument(selectedTemplate.content, selectedTemplate.name);
    setTemplateModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-4xl h-[560px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d]">
          <div className="flex items-center space-x-2.5 text-slate-100 font-semibold">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Document Templates</span>
          </div>
          <button
            type="button"
            onClick={() => setTemplateModalOpen(false)}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-md hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex border-b border-[#30363d] px-6 pt-2 bg-[#12161c]">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition ${
                selectedCategory === cat
                  ? 'border-blue-500 text-blue-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Body Split: Templates List + Live Content Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Template Cards */}
          <div className="w-72 border-r border-[#30363d] overflow-y-auto p-3 space-y-1.5 bg-[#0f1117]/50">
            {filtered.map((tpl) => {
              const isSelected = selectedTemplate.id === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-start space-x-3 ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500/50 text-slate-100 shadow-xs'
                      : 'border-transparent hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-800/80 shrink-0">
                    {renderIcon(tpl.icon)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate">{tpl.name}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      {tpl.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Template Preview */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1117]">
            <div className="px-5 py-2.5 border-b border-[#30363d] bg-[#161b22]/60 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                Template Preview: <strong className="text-slate-200">{selectedTemplate.name}</strong>
              </span>
              <span className="text-[11px] text-slate-500">
                {selectedTemplate.content.split('\n').length} lines
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {selectedTemplate.content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#30363d] bg-[#12161c]">
          <span className="text-xs text-slate-400">
            Clicking create will generate a new document with this template.
          </span>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setTemplateModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUseTemplate}
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Create from Template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
