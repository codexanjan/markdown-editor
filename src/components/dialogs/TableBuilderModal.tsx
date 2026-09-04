import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { X, Table, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface TableBuilderModalProps {
  onInsertTable: (markdownTable: string) => void;
}

export const TableBuilderModal: React.FC<TableBuilderModalProps> = ({ onInsertTable }) => {
  const { isTableBuilderModalOpen, setTableBuilderModalOpen } = useAppStore();
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');

  if (!isTableBuilderModalOpen) return null;

  const handleGenerate = () => {
    const validRows = Math.max(1, Math.min(20, rows));
    const validCols = Math.max(1, Math.min(10, cols));

    let markdown = '\n';

    // Header row
    const headers: string[] = [];
    for (let c = 1; c <= validCols; c++) {
      headers.push(`Header ${c}`);
    }
    markdown += `| ${headers.join(' | ')} |\n`;

    // Delimiter row with alignment
    const delimiters: string[] = [];
    for (let c = 1; c <= validCols; c++) {
      if (alignment === 'center') delimiters.push(':---:');
      else if (alignment === 'right') delimiters.push('---:');
      else delimiters.push(':---');
    }
    markdown += `| ${delimiters.join(' | ')} |\n`;

    // Body rows
    for (let r = 1; r <= validRows; r++) {
      const cells: string[] = [];
      for (let c = 1; c <= validCols; c++) {
        cells.push(`Row ${r} Col ${c}`);
      }
      markdown += `| ${cells.join(' | ')} |\n`;
    }
    markdown += '\n';

    onInsertTable(markdown);
    setTableBuilderModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d]">
          <div className="flex items-center space-x-2 text-slate-100 font-semibold">
            <Table className="w-5 h-5 text-blue-400" />
            <span>Insert Table</span>
          </div>
          <button
            onClick={() => setTableBuilderModalOpen(false)}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-md hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Columns ({cols})
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Rows ({rows})
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Column Alignment
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAlignment('left')}
                className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg border text-xs font-medium transition ${
                  alignment === 'left'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-[#30363d] hover:bg-slate-800 text-slate-400'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span>Left</span>
              </button>
              <button
                type="button"
                onClick={() => setAlignment('center')}
                className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg border text-xs font-medium transition ${
                  alignment === 'center'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-[#30363d] hover:bg-slate-800 text-slate-400'
                }`}
              >
                <AlignCenter className="w-3.5 h-3.5" />
                <span>Center</span>
              </button>
              <button
                type="button"
                onClick={() => setAlignment('right')}
                className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg border text-xs font-medium transition ${
                  alignment === 'right'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-[#30363d] hover:bg-slate-800 text-slate-400'
                }`}
              >
                <AlignRight className="w-3.5 h-3.5" />
                <span>Right</span>
              </button>
            </div>
          </div>

          {/* Quick Grid Preview */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Preview</label>
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-2 overflow-x-auto max-h-36">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#30363d] bg-slate-800/40">
                    {Array.from({ length: cols }).map((_, i) => (
                      <th
                        key={i}
                        className={`p-1.5 font-medium text-slate-300 text-${alignment}`}
                      >
                        H{i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.min(3, rows) }).map((_, r) => (
                    <tr key={r} className="border-b border-[#30363d]/50">
                      {Array.from({ length: cols }).map((_, c) => (
                        <td
                          key={c}
                          className={`p-1.5 text-slate-400 text-${alignment}`}
                        >
                          R{r + 1}C{c + 1}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows > 3 && (
                <div className="text-[11px] text-slate-500 text-center pt-1.5">
                  + {rows - 3} more rows...
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 px-5 py-3 border-t border-[#30363d] bg-[#12161c]">
          <button
            type="button"
            onClick={() => setTableBuilderModalOpen(false)}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition"
          >
            Insert Table
          </button>
        </div>
      </div>
    </div>
  );
};
