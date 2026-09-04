import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { useAppStore } from '../../store/useAppStore';
import { extractHeadings } from '../../services/outline';
import { TableOfContents } from './TableOfContents';
import { Copy, Check, ListCollapse, Eye, ExternalLink } from 'lucide-react';

interface MarkdownPreviewProps {
  scrollSyncRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  scrollSyncRef,
  onScroll,
}) => {
  const { getActiveDocument, updateDocumentContent, settings } = useAppStore();
  const activeDoc = getActiveDocument();
  const content = activeDoc ? activeDoc.content : '';

  const [showOutline, setShowOutline] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const internalRef = scrollSyncRef || containerRef;

  // Extract outline headings from content
  const headings = useMemo(() => extractHeadings(content), [content]);

  // Strict sanitization schema extending defaultSchema
  const sanitizeSchema = useMemo(() => {
    return {
      ...defaultSchema,
      protocols: {
        ...defaultSchema.protocols,
        href: ['http', 'https', 'mailto'],
        src: ['http', 'https', 'data'],
      },
      attributes: {
        ...defaultSchema.attributes,
        code: [...(defaultSchema.attributes?.code || []), 'className'],
        span: [...(defaultSchema.attributes?.span || []), 'className'],
        div: [...(defaultSchema.attributes?.div || []), 'className', 'id'],
        h1: [...(defaultSchema.attributes?.h1 || []), 'id'],
        h2: [...(defaultSchema.attributes?.h2 || []), 'id'],
        h3: [...(defaultSchema.attributes?.h3 || []), 'id'],
        h4: [...(defaultSchema.attributes?.h4 || []), 'id'],
        h5: [...(defaultSchema.attributes?.h5 || []), 'id'],
        h6: [...(defaultSchema.attributes?.h6 || []), 'id'],
        input: ['type', 'checked', 'disabled'],
      },
      tagNames: [
        ...(defaultSchema.tagNames || []),
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'input',
      ],
    };
  }, []);

  // Handle scroll-spy for headings
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (onScroll) {
      onScroll(target.scrollTop, target.scrollHeight, target.clientHeight);
    }

    if (headings.length === 0) return;

    const headingElements = headings
      .map((h) => ({ id: h.id, el: document.getElementById(h.id) }))
      .filter((h) => h.el !== null);

    const currentScroll = target.scrollTop + 60;
    let currentId = null;

    for (const h of headingElements) {
      if (h.el && h.el.offsetTop <= currentScroll) {
        currentId = h.id;
      } else {
        break;
      }
    }

    setActiveHeadingId(currentId || (headings[0] ? headings[0].id : null));
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el && internalRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveHeadingId(id);
    }
  };

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText).then(() => {
      setCopiedCodeIndex(index);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    });
  };

  // Interactive Task List click: toggles checkbox in the original markdown!
  const handleTaskCheckboxClick = (index: number) => {
    if (!activeDoc) return;
    let count = 0;
    const lines = activeDoc.content.split(/\r\n|\r|\n/);
    const newLines = lines.map((line) => {
      const taskMatch = line.match(/^(\s*[-*+]\s+\[)( |x|X)(\]\s+.*)$/);
      if (taskMatch) {
        if (count === index) {
          const currentChecked = taskMatch[2].toLowerCase() === 'x';
          const newChecked = currentChecked ? ' ' : 'x';
          count++;
          return `${taskMatch[1]}${newChecked}${taskMatch[3]}`;
        }
        count++;
      }
      return line;
    });

    updateDocumentContent(newLines.join('\n'));
  };

  let codeBlockCounter = 0;
  let taskCheckboxCounter = 0;

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-slate-100 overflow-hidden relative app-preview-container">
      {/* Preview Header / Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#30363d] bg-[#161b22]/70 backdrop-blur-xs text-xs select-none no-print">
        <div className="flex items-center space-x-2 text-slate-400 font-medium">
          <Eye className="w-3.5 h-3.5 text-blue-400" />
          <span>Live Preview</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowOutline(!showOutline)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
              showOutline
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ListCollapse className="w-3.5 h-3.5" />
            <span>Outline ({headings.length})</span>
          </button>
        </div>
      </div>

      {/* Main Preview Container with optional Outline drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Rendered Markdown Body */}
        <div
          ref={internalRef as React.RefObject<HTMLDivElement>}
          onScroll={handleScroll}
          className="flex-1 h-full overflow-y-auto px-6 py-6 sm:px-10 sm:py-8"
        >
          <div
            className="markdown-preview max-w-3xl mx-auto"
            style={{ fontSize: `${settings.previewFontSize}px` }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[
                rehypeSlug,
                rehypeHighlight,
                [rehypeSanitize, sanitizeSchema],
              ]}
              components={{
                // Custom code block renderer with copy button
                pre: ({ children, ...props }) => {
                  const preCodeText = extractTextFromChildren(children);
                  const currentIndex = codeBlockCounter++;

                  return (
                    <div className="relative group my-4 rounded-lg overflow-hidden border border-[#30363d]">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-[#30363d] text-[11px] text-slate-400">
                        <span className="font-mono">Code</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(preCodeText, currentIndex)}
                          className="flex items-center space-x-1 px-2 py-0.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                        >
                          {copiedCodeIndex === currentIndex ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 text-[10px]">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span className="text-[10px]">Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre {...props} className="m-0! p-4 bg-[#0f1117]! overflow-x-auto text-xs font-mono">
                        {children}
                      </pre>
                    </div>
                  );
                },
                // Custom interactive task list checkbox
                input: ({ type, checked, ...props }) => {
                  if (type === 'checkbox') {
                    const currentTaskIndex = taskCheckboxCounter++;
                    return (
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleTaskCheckboxClick(currentTaskIndex)}
                        className="cursor-pointer accent-blue-500 rounded-sm w-4 h-4 mr-2 align-middle transition hover:opacity-80"
                        {...props}
                      />
                    );
                  }
                  return <input type={type} checked={checked} {...props} />;
                },
                // Links open safely in external tabs
                a: ({ href, children, ...props }) => {
                  const isExternal = href?.startsWith('http');
                  return (
                    <a
                      href={href}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center space-x-0.5"
                      {...props}
                    >
                      <span>{children}</span>
                      {isExternal && <ExternalLink className="w-3 h-3 inline ml-0.5 opacity-60" />}
                    </a>
                  );
                },
              }}
            >
              {content || '*No content to preview*'}
            </ReactMarkdown>
          </div>
        </div>

        {/* Collapsible Outline / Table of Contents Drawer */}
        {showOutline && (
          <div className="w-64 border-l border-[#30363d] bg-[#161b22]/90 backdrop-blur-md overflow-y-auto no-print toc-sidebar animate-in slide-in-from-right-4 duration-150">
            <TableOfContents
              headings={headings}
              activeHeadingId={activeHeadingId}
              onSelectHeading={scrollToHeading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

function extractTextFromChildren(children: React.ReactNode): string {
  if (!children) return '';
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('');
  }
  if (React.isValidElement(children)) {
    const props = children.props as { children?: React.ReactNode };
    return extractTextFromChildren(props.children);
  }
  return '';
}

