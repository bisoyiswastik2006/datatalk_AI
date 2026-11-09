import React, { useState } from 'react';
import { Table, Search, Download, Layers } from 'lucide-react';
import { Button } from '../common/Button';
import { DatasetDetail, DatasetPreviewResponse } from '../../types/dataset';

export interface DataExplorerViewProps {
  dataset: DatasetDetail;
  preview: DatasetPreviewResponse | null;
  onSelectTable?: (tableName: string) => void;
}

export const DataExplorerView: React.FC<DataExplorerViewProps> = ({
  dataset,
  preview,
  onSelectTable,
}) => {
  const [selectedTable, setSelectedTable] = useState(preview?.table_name || dataset.tables[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRows = preview?.rows.filter((row) =>
    searchQuery
      ? row.some((val) => String(val).toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  ) || [];

  const handleExport = () => {
    if (!preview?.columns || !preview?.rows) return;
    const headerLine = preview.columns.map((c) => `"${c.replace(/"/g, '""')}"`).join(',');
    const rowLines = preview.rows.map((row) =>
      row.map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const blob = new Blob([headerLine + '\n' + rowLines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataset.name}_${selectedTable}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-tint select-none">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-ink-muted uppercase tracking-wider">
            <span>WORKBENCH</span>
            <span>/</span>
            <span>DATA EXPLORER</span>
          </div>
          <h1 className="text-xl font-semibold text-ink font-mono">{dataset.name}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Table Selector */}
          {dataset.tables.length > 1 && (
            <div className="flex items-center gap-1.5 bg-surface border border-tint rounded px-2.5 py-1 text-xs text-ink font-medium">
              <Layers className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span>Table:</span>
              <select
                value={selectedTable}
                onChange={(e) => {
                  setSelectedTable(e.target.value);
                  if (onSelectTable) onSelectTable(e.target.value);
                }}
                className="bg-transparent text-ink font-mono focus:outline-none cursor-pointer"
              >
                {dataset.tables.map((t) => (
                  <option key={t} value={t} className="bg-surface text-ink">
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search records in ${selectedTable}...`}
          className="w-full pl-9 pr-3 py-1.5 rounded bg-surface border border-tint text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Tabular Data View */}
      <div className="flex-1 rounded-lg border border-tint bg-surface shadow-subtle overflow-hidden flex flex-col min-h-[300px]">
        <div className="px-4 py-2 bg-surface border-b border-tint flex items-center justify-between text-xs text-ink-muted select-none">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            <span className="font-semibold uppercase tracking-wider text-ink font-mono">
              {selectedTable}
            </span>
          </div>
          <span className="font-mono text-[11px]">
            Showing {filteredRows.length} rows
          </span>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#E8E4DA] z-10 border-b border-tint select-none">
              <tr>
                <th className="py-2.5 px-3 font-mono font-medium text-ink-muted text-center w-12 border-r border-tint">
                  #
                </th>
                {preview?.columns.map((col) => (
                  <th
                    key={col}
                    className="py-2.5 px-4 font-mono font-semibold text-ink whitespace-nowrap border-r border-tint last:border-r-0 uppercase text-[11px]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-tint/60">
              {filteredRows.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-tint/25 transition-colors font-mono text-ink text-[13px]"
                >
                  <td className="py-2 px-3 text-center text-ink-muted bg-surface/80 border-r border-tint select-none">
                    {idx + 1}
                  </td>
                  {row.map((val, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="py-2 px-4 whitespace-nowrap border-r border-tint/60 last:border-r-0"
                    >
                      {val !== null && val !== undefined ? String(val) : (
                        <span className="text-ink-muted italic">NULL</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td
                    colSpan={(preview?.columns.length || 0) + 1}
                    className="py-12 text-center text-xs text-ink-muted"
                  >
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

