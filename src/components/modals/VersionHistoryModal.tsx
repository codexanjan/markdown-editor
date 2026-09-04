import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { VersionSnapshot } from '../../types';
import { getSnapshotsForDocument, saveVersionSnapshot } from '../../services/db';
import { X, History, RotateCcw, Clock, Plus, Check } from 'lucide-react';

export const VersionHistoryModal: React.FC = () => {
  const {
    isHistoryModalOpen,
    setHistoryModalOpen,
    getActiveDocument,
    updateDocumentContent,
  } = useAppStore();

  const activeDoc = getActiveDocument();
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<VersionSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [restoredSuccess, setRestoredSuccess] = useState(false);

  useEffect(() => {
    if (isHistoryModalOpen && activeDoc) {
      setLoading(true);
      getSnapshotsForDocument(activeDoc.id).then((snaps) => {
        setSnapshots(snaps);
        if (snaps.length > 0) {
          setSelectedSnapshot(snaps[0]);
        }
        setLoading(false);
      });
    }
  }, [isHistoryModalOpen, activeDoc?.id]);

  if (!isHistoryModalOpen || !activeDoc) return null;

  const handleCreateSnapshot = async () => {
    const newSnap = await saveVersionSnapshot(
      activeDoc.id,
      activeDoc.title,
      activeDoc.content
    );
    setSnapshots([newSnap, ...snapshots]);
    setSelectedSnapshot(newSnap);
  };

  const handleRestore = () => {
    if (!selectedSnapshot) return;
    if (confirm(`Restore snapshot from ${new Date(selectedSnapshot.timestamp).toLocaleString()}?`)) {
      updateDocumentContent(selectedSnapshot.content);
      setRestoredSuccess(true);
      setTimeout(() => {
        setRestoredSuccess(false);
        setHistoryModalOpen(false);
      }, 1200);
    }
  };

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-4xl h-[560px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d]">
          <div className="flex items-center space-x-2.5 text-slate-100 font-semibold">
            <History className="w-5 h-5 text-blue-400" />
            <span>Version History: {activeDoc.title}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCreateSnapshot}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-medium hover:bg-blue-600 hover:text-white transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Snapshot</span>
            </button>
            <button
              type="button"
              onClick={() => setHistoryModalOpen(false)}
              className="text-slate-400 hover:text-slate-100 p-1 rounded-md hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Split: Snapshots list + snapshot content preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Snapshots Sidebar */}
          <div className="w-72 border-r border-[#30363d] overflow-y-auto p-3 space-y-1.5 bg-[#0f1117]/50">
            {loading ? (
              <div className="p-4 text-xs text-slate-500 text-center">Loading revisions...</div>
            ) : snapshots.length === 0 ? (
              <div className="p-4 text-xs text-slate-500 text-center italic">
                No snapshots recorded yet. Click "Save Snapshot" to create one.
              </div>
            ) : (
              snapshots.map((snap) => {
                const isSelected = selectedSnapshot?.id === snap.id;
                return (
                  <button
                    key={snap.id}
                    type="button"
                    onClick={() => setSelectedSnapshot(snap)}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex flex-col space-y-1 ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/50 text-slate-100 shadow-xs'
                        : 'border-transparent hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatTimestamp(snap.timestamp)}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{snap.wordCount} words</span>
                      <span className="font-mono text-[10px]">
                        {snap.content.length} chars
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Snapshot Content Preview */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1117]">
            {selectedSnapshot ? (
              <>
                <div className="px-5 py-2.5 border-b border-[#30363d] bg-[#161b22]/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    Snapshot from: <strong className="text-slate-200">{formatTimestamp(selectedSnapshot.timestamp)}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleRestore}
                    className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium transition"
                  >
                    {restoredSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Restored!</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore This Version</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedSnapshot.content}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                Select a revision on the left to preview its content.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[#30363d] bg-[#12161c] text-xs text-slate-400">
          <span>Automatic snapshots are retained up to 30 revisions per document.</span>
          <button
            type="button"
            onClick={() => setHistoryModalOpen(false)}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
