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
    <div className="flex flex-col h-full space-y-4 text-main">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border select-none">
        <div>
          <div className="flex items-center gap-2 text-caption font-mono text-secondary">
            <span>Workbench</span>
            <span>/</span>
            <span>Data explorer</span>
          </div>
          <h1 className="text-title-card font-semibold text-main font-mono">{dataset.name}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Table Selector */}
          {dataset.tables.length > 1 && (
            <div className="flex items-center gap-2 bg-page border border-border rounded-lg min-h-[40px] px-3 py-1.5 text-control text-main font-medium">
              <Layers className="w-4 h-4 text-primary" aria-hidden="true" />
              <span className="text-caption">Table:</span>
              <select
                value={selectedTable}
                onChange={(e) => {
                  setSelectedTable(e.target.value);
                  if (onSelectTable) onSelectTable(e.target.value);
                }}
                className="bg-transparent text-main font-mono text-control focus:outline-none cursor-pointer"
                aria-label="Select table to view"
              >
                {dataset.tables.map((t) => (
                  <option key={t} value={t} className="bg-card text-main">
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            icon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search Input Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Filter ${preview?.rows.length || 0} loaded records in '${selectedTable}'...`}
          className="w-full pl-10 pr-4 py-2.5 min-h-[42px] rounded-lg bg-card border border-border text-control text-main placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
        />
      </div>

      {/* Data Table */}
      <div className="flex-1 rounded-lg border border-border bg-card shadow-sm overflow-hidden flex flex-col min-h-[300px]">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left text-table-cell border-collapse">
            <thead className="sticky top-0 bg-page/70 z-10 border-b border-border select-none">
              <tr>
                <th className="py-3 px-3.5 font-mono text-table-header font-medium text-secondary text-center w-12 border-r border-border">
                  #
                </th>
                {preview?.columns.map((col) => (
                  <th
                    key={col}
                    className="py-3 px-4 font-mono text-table-header font-medium text-secondary whitespace-nowrap border-r border-border last:border-r-0"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-page/40 transition-colors font-mono text-table-cell"
                >
                  <td className="py-2.5 px-3.5 text-center text-caption text-secondary bg-card border-r border-border">
                    {rowIdx + 1}
                  </td>
                  {row.map((cell, cellIdx) => (
                    <td
                      key={cellIdx}
                      className="py-2.5 px-4 whitespace-nowrap border-r border-border/60 last:border-r-0"
                    >
                      {cell !== null && cell !== undefined ? String(cell) : (
                        <span className="text-secondary italic">NULL</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td
                    colSpan={(preview?.columns.length || 0) + 1}
                    className="py-12 text-center text-body text-secondary"
                  >
                    <Table className="w-8 h-8 mx-auto mb-2 opacity-40 text-secondary" />
                    <span>No records found matching query.</span>
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
