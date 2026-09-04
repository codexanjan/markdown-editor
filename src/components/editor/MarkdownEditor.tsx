import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine, drawSelection, dropCursor } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, undo, redo } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { bracketMatching } from '@codemirror/language';
import { oneDark } from '@codemirror/theme-one-dark';
import { SearchQuery, findNext, findPrevious, replaceNext, replaceAll } from '@codemirror/search';

import { useAppStore } from '../../store/useAppStore';
import { Toolbar } from './Toolbar';
import { SlashCommandMenu, SlashCommand } from './SlashCommandMenu';
import { SearchReplaceBar } from '../dialogs/SearchReplaceBar';
import { TableBuilderModal } from '../dialogs/TableBuilderModal';
import { LinkModal } from '../dialogs/LinkModal';
import { ImageModal } from '../dialogs/ImageModal';
import { CodeBlockModal } from '../dialogs/CodeBlockModal';

interface MarkdownEditorProps {
  onScroll?: (scrollTop: number, scrollHeight: number, clientHeight: number) => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ onScroll }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);

  const {
    getActiveDocument,
    updateDocumentContent,
    settings,
    setCursorPosition,
    setSelectionInfo,
    searchState,
    setSearchState,
    setTableBuilderModalOpen,
    setLinkModalOpen,
    setImageModalOpen,
    setCodeBlockModalOpen,
  } = useAppStore();

  const activeDoc = getActiveDocument();
  const [selectedText, setSelectedText] = useState('');

  // Slash command state
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });
  const [slashStartPos, setSlashStartPos] = useState<number | null>(null);

  // Formatting execution handler
  const handleFormat = useCallback(
    (action: string, extra?: string) => {
      const view = editorViewRef.current;
      if (!view) return;

      const { state, dispatch } = view;
      const { main } = state.selection;
      const selected = state.sliceDoc(main.from, main.to);

      let insertBefore = '';
      let insertAfter = '';
      let newSelectionFrom = main.from;
      let newSelectionTo = main.to;

      switch (action) {
        case 'bold':
          insertBefore = '**';
          insertAfter = '**';
          break;
        case 'italic':
          insertBefore = '*';
          insertAfter = '*';
          break;
        case 'strikethrough':
          insertBefore = '~~';
          insertAfter = '~~';
          break;
        case 'inline-code':
          insertBefore = '`';
          insertAfter = '`';
          break;
        case 'quote': {
          const line = state.doc.lineAt(main.from);
          dispatch({
            changes: { from: line.from, insert: '> ' },
            selection: { anchor: main.from + 2, head: main.to + 2 },
          });
          view.focus();
          return;
        }
        case 'bullet-list': {
          const line = state.doc.lineAt(main.from);
          dispatch({
            changes: { from: line.from, insert: '- ' },
            selection: { anchor: main.from + 2, head: main.to + 2 },
          });
          view.focus();
          return;
        }
        case 'ordered-list': {
          const line = state.doc.lineAt(main.from);
          dispatch({
            changes: { from: line.from, insert: '1. ' },
            selection: { anchor: main.from + 3, head: main.to + 3 },
          });
          view.focus();
          return;
        }
        case 'task-list': {
          const line = state.doc.lineAt(main.from);
          dispatch({
            changes: { from: line.from, insert: '- [ ] ' },
            selection: { anchor: main.from + 6, head: main.to + 6 },
          });
          view.focus();
          return;
        }
        case 'heading': {
          const level = parseInt(extra || '1', 10);
          const prefix = '#'.repeat(level) + ' ';
          const line = state.doc.lineAt(main.from);
          // Remove existing heading markers if present
          const lineText = line.text;
          const cleanedText = lineText.replace(/^#{1,6}\s*/, '');
          dispatch({
            changes: { from: line.from, to: line.to, insert: prefix + cleanedText },
            selection: { anchor: line.from + prefix.length + cleanedText.length },
          });
          view.focus();
          return;
        }
        case 'divider': {
          const line = state.doc.lineAt(main.to);
          const insertText = '\n\n---\n\n';
          dispatch({
            changes: { from: line.to, insert: insertText },
            selection: { anchor: line.to + insertText.length },
          });
          view.focus();
          return;
        }
        default:
          return;
      }

      if (selected.length > 0) {
        const replacement = `${insertBefore}${selected}${insertAfter}`;
        dispatch({
          changes: { from: main.from, to: main.to, insert: replacement },
          selection: { anchor: main.from, head: main.from + replacement.length },
        });
      } else {
        const replacement = `${insertBefore}${insertAfter}`;
        dispatch({
          changes: { from: main.from, to: main.to, insert: replacement },
          selection: { anchor: main.from + insertBefore.length },
        });
      }
      view.focus();
    },
    []
  );

  // Text insertion handler for modals
  const handleInsertRaw = useCallback((text: string) => {
    const view = editorViewRef.current;
    if (!view) return;

    const { state, dispatch } = view;
    const { main } = state.selection;

    dispatch({
      changes: { from: main.from, to: main.to, insert: text },
      selection: { anchor: main.from + text.length },
    });
    view.focus();
  }, []);

  // Initialize CodeMirror 6 instance
  useEffect(() => {
    if (!containerRef.current) return;

    const currentDocContent = activeDoc ? activeDoc.content : '';

    const customTheme = EditorView.theme({
      '&': {
        fontSize: `${settings.fontSize}px`,
        height: '100%',
        backgroundColor: 'transparent',
      },
      '.cm-content': {
        fontFamily: `${settings.fontFamily}, monospace`,
        lineHeight: `${settings.lineHeight}`,
        padding: '16px 20px',
      },
      '.cm-cursor': {
        borderLeftColor: settings.theme === 'light' ? '#0969da' : '#58a6ff',
        borderLeftWidth: '2px',
      },
      '.cm-selectionBackground': {
        backgroundColor:
          settings.theme === 'light'
            ? 'rgba(9, 105, 218, 0.2) !important'
            : 'rgba(88, 166, 255, 0.25) !important',
      },
    });

    const startState = EditorState.create({
      doc: currentDocContent,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        drawSelection(),
        dropCursor(),
        bracketMatching(),
        markdown(),
        settings.wordWrap ? EditorView.lineWrapping : [],
        settings.theme === 'light' ? [] : oneDark,
        customTheme,
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            updateDocumentContent(newContent);
          }

          if (update.selectionSet || update.docChanged) {
            const pos = update.state.selection.main.head;
            const line = update.state.doc.lineAt(pos);
            const lineNum = line.number;
            const col = pos - line.from + 1;
            setCursorPosition({ line: lineNum, ch: col });

            const sel = update.state.sliceDoc(
              update.state.selection.main.from,
              update.state.selection.main.to
            );
            setSelectedText(sel);
            setSelectionInfo(sel.length > 0 ? `${sel.length} selected` : '');

            // Slash command detection
            const currentLineText = line.text;
            const lineCol = pos - line.from;
            const textBeforeCursor = currentLineText.slice(0, lineCol);
            const slashMatch = textBeforeCursor.match(/(?:^|\s)\/([a-zA-Z0-9_-]*)$/);

            if (slashMatch) {
              const query = slashMatch[1];
              const matchStart = line.from + (textBeforeCursor.lastIndexOf('/') || 0);
              setSlashQuery(query);
              setSlashStartPos(matchStart);

              const coords = view.coordsAtPos(pos);
              if (coords) {
                setSlashPos({ top: coords.bottom + 6, left: coords.left });
                setSlashMenuOpen(true);
              }
            } else {
              setSlashMenuOpen(false);
            }
          }
        }),
        EditorView.domEventHandlers({
          scroll(event, view) {
            const scroller = view.scrollDOM;
            if (onScroll && scroller) {
              onScroll(scroller.scrollTop, scroller.scrollHeight, scroller.clientHeight);
            }
          },
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
      editorViewRef.current = null;
    };
  }, [activeDoc?.id, settings.theme, settings.fontSize, settings.fontFamily, settings.lineHeight, settings.wordWrap]);

  // Handle active document content change from external (like restore or template)
  useEffect(() => {
    const view = editorViewRef.current;
    if (view && activeDoc) {
      const currentText = view.state.doc.toString();
      if (currentText !== activeDoc.content) {
        view.dispatch({
          changes: { from: 0, to: currentText.length, insert: activeDoc.content },
        });
      }
    }
  }, [activeDoc?.content]);

  // Execute Slash Command
  const handleSlashSelect = (command: SlashCommand) => {
    const view = editorViewRef.current;
    if (!view || slashStartPos === null) return;

    const { state, dispatch } = view;
    const currentPos = state.selection.main.head;

    // Delete the slash and query typed
    dispatch({
      changes: { from: slashStartPos, to: currentPos, insert: '' },
    });

    setSlashMenuOpen(false);

    if (command.action === 'table-modal') {
      setTableBuilderModalOpen(true);
    } else if (command.action === 'link-modal') {
      setLinkModalOpen(true);
    } else if (command.action === 'image-modal') {
      setImageModalOpen(true);
    } else if (command.action === 'code-block-modal') {
      setCodeBlockModalOpen(true);
    } else {
      handleFormat(command.action, command.extra);
    }
  };

  // Search & Replace actions with CodeMirror SearchQuery
  const executeSearch = useCallback(() => {
    const view = editorViewRef.current;
    if (!view || !searchState.searchQuery) {
      setSearchState({ totalMatches: 0, currentMatchIndex: 0 });
      return;
    }

    try {
      const query = new SearchQuery({
        search: searchState.searchQuery,
        caseSensitive: searchState.caseSensitive,
        regexp: searchState.isRegex,
        wholeWord: searchState.wholeWord,
      });

      const cursor = query.getCursor(view.state);
      let count = 0;
      let match = cursor.next();
      while (!match.done) {
        count++;
        match = cursor.next();
      }

      setSearchState({ totalMatches: count });
    } catch {
      // Regex syntax error
      setSearchState({ totalMatches: 0 });
    }
  }, [searchState.searchQuery, searchState.caseSensitive, searchState.isRegex, searchState.wholeWord, setSearchState]);

  useEffect(() => {
    if (searchState.isOpen) {
      executeSearch();
    }
  }, [searchState.searchQuery, searchState.caseSensitive, searchState.isRegex, searchState.wholeWord, searchState.isOpen, executeSearch]);

  const handleFindNext = () => {
    const view = editorViewRef.current;
    if (!view || !searchState.searchQuery) return;
    try {
      findNext(view);
    } catch {}
  };

  const handleFindPrev = () => {
    const view = editorViewRef.current;
    if (!view || !searchState.searchQuery) return;
    try {
      findPrevious(view);
    } catch {}
  };

  const handleReplace = () => {
    const view = editorViewRef.current;
    if (!view || !searchState.searchQuery) return;
    try {
      replaceNext(view);
    } catch {}
  };

  const handleReplaceAll = () => {
    const view = editorViewRef.current;
    if (!view || !searchState.searchQuery) return;
    try {
      replaceAll(view);
    } catch {}
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-slate-100 overflow-hidden relative app-editor">
      {/* Formatting Toolbar */}
      <Toolbar
        onFormat={handleFormat}
        onUndo={() => editorViewRef.current && undo(editorViewRef.current)}
        onRedo={() => editorViewRef.current && redo(editorViewRef.current)}
      />

      {/* CodeMirror Scroller Container */}
      <div className="flex-1 overflow-hidden relative">
        <div ref={containerRef} className="h-full w-full" />

        {/* Floating Search & Replace */}
        <SearchReplaceBar
          onFindNext={handleFindNext}
          onFindPrev={handleFindPrev}
          onReplace={handleReplace}
          onReplaceAll={handleReplaceAll}
        />

        {/* Floating Slash Command Menu */}
        <SlashCommandMenu
          isOpen={slashMenuOpen}
          query={slashQuery}
          position={slashPos}
          onSelect={handleSlashSelect}
          onClose={() => setSlashMenuOpen(false)}
        />
      </div>

      {/* Modals triggered by toolbar / slash menu */}
      <TableBuilderModal onInsertTable={handleInsertRaw} />
      <LinkModal initialText={selectedText} onInsertLink={handleInsertRaw} />
      <ImageModal onInsertImage={handleInsertRaw} />
      <CodeBlockModal onInsertCodeBlock={handleInsertRaw} />
    </div>
  );
};
