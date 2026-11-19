import React, { useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Search,
  Layers,
  Database,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { DatasetDetail, SchemaResponse, DatasetPreviewResponse } from '../../types/dataset';

export interface DatasetPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: DatasetDetail;
  schema?: SchemaResponse | null;
  preview?: DatasetPreviewResponse | null;
  onConfirm: () => void;
  onSelectTable?: (tableName: string) => void;
}

export const DatasetPreviewModal: React.FC<DatasetPreviewModalProps> = ({
  isOpen,
  onClose,
  dataset,
  schema,
  preview,
  onConfirm,
  onSelectTable,
}) => {
  const [selectedTable, setSelectedTable] = useState<string>(
    preview?.table_name || dataset.tables[0] || 'Default'
  );
  const [columnFilter, setColumnFilter] = useState('');

  const currentTableSchema = schema?.tables.find((t) => t.name === selectedTable) || schema?.tables[0];
  const filteredColumns = currentTableSchema?.columns.filter(
    (col) =>
      col.name.toLowerCase().includes(columnFilter.toLowerCase()) ||
      col.type.toLowerCase().includes(columnFilter.toLowerCase())
  ) || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Dataset preview: ${dataset.name}`} maxWidth="full">
      <div className="flex flex-col h-[82vh] -m-5 bg-card text-main">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border bg-card flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-caption text-secondary">
              <span className="inline-flex items-center gap-1.5 text-primary font-medium text-caption">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>File validated</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
              <h2 className="text-title-card font-semibold text-main font-mono">{dataset.name}</h2>
              <Badge variant="outline" size="sm" className="font-mono">
                {dataset.format}
              </Badge>
              {dataset.formatted_size && (
                <span className="text-caption text-secondary font-mono">{dataset.formatted_size}</span>
              )}
              <span className="text-caption text-secondary">
                {dataset.total_rows.toLocaleString()} rows
              </span>
              <span className="text-caption text-secondary">
                {dataset.total_columns} columns
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={onConfirm}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Use this dataset
            </Button>
          </div>
        </div>

        {/* Multi-table / Sheet Tabs (for Excel or SQLite) */}
        {dataset.tables.length > 1 && (
          <div className="px-6 py-2.5 bg-card border-b border-border flex items-center gap-2.5 overflow-x-auto shrink-0 min-h-[50px]">
            <span className="text-caption font-medium text-secondary mr-1 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>Tables:</span>
            </span>
            {dataset.tables.map((table) => {
              const isActive = selectedTable === table;
              return (
                <button
                  key={table}
                  onClick={() => {
                    setSelectedTable(table);
                    if (onSelectTable) onSelectTable(table);
                  }}
                  className={`min-h-[40px] px-4 py-1.5 rounded-lg text-control font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-primary text-primary-text font-semibold'
                      : 'bg-page border border-border text-main hover:bg-card'
                  }`}
                  aria-pressed={isActive}
                >
                  {table}
                </button>
              );
            })}
          </div>
        )}

        {/* Processing Warnings Banner */}
        {dataset.processing_warnings && dataset.processing_warnings.length > 0 && (
          <div className="px-6 py-2.5 bg-warning border-b border-warning text-warning-text text-caption flex items-center gap-2.5 shrink-0 min-h-[40px] font-medium">
            <AlertTriangle className="w-4 h-4 text-warning-text shrink-0" aria-hidden="true" />
            <div className="truncate">
              {dataset.processing_warnings.join(' | ')}
            </div>
          </div>
        )}

        {/* Main Split: Bounded Preview Table (left) & Schema Inspector (right) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Raw Data Preview */}
          <div className="flex-1 flex flex-col p-6 overflow-hidden border-r border-border">
            <div className="flex items-center justify-between pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-title-card font-semibold text-main">
                  Raw data preview (first {preview?.rows.length || 0} of{' '}
                  {currentTableSchema?.row_count?.toLocaleString() || dataset.total_rows.toLocaleString()}{' '}
                  rows)
                </span>
                <span className="text-caption text-secondary bg-page px-2.5 py-1 rounded-md border border-border">
                  Read-only sample
                </span>
              </div>
            </div>

            {/* Table Container with Internal Scroll and Non-wrapping IDs/Dates */}
            <div className="flex-1 border border-border rounded-lg overflow-auto custom-scrollbar bg-card shadow-sm">
              <table className="w-full text-left text-table-cell border-collapse">
                <thead className="sticky top-0 bg-page/70 z-10 border-b border-border">
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
                  {preview?.rows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="hover:bg-page/40 transition-colors font-mono text-table-cell min-h-[42px]"
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
                  {(!preview || preview.rows.length === 0) && (
                    <tr>
                      <td
                        colSpan={(preview?.columns.length || 0) + 1}
                        className="py-10 text-center text-body text-secondary"
                      >
                        No preview records available for this table.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Schema & Inferred Types Inspector */}
          <div className="w-[380px] flex flex-col p-6 bg-card overflow-hidden shrink-0">
            <div className="pb-3 border-b border-border space-y-2.5 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-title-card text-main">
                  <Database className="w-5 h-5 text-primary" aria-hidden="true" />
                  <span>Schema & inferred types</span>
                </div>
                <span className="text-caption font-mono text-secondary">
                  {currentTableSchema?.columns.length || 0} columns
                </span>
              </div>

              {/* Column Search Filter */}
              <div className="relative">
                <Search className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="text"
                  value={columnFilter}
                  onChange={(e) => setColumnFilter(e.target.value)}
                  placeholder="Filter columns or data types..."
                  className="w-full pl-9 pr-3.5 py-2 min-h-[40px] rounded-lg bg-page border border-border text-control text-main placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Column Schema Cards List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pt-3 space-y-2.5">
              {filteredColumns.map((col) => (
                <div
                  key={col.name}
                  className="p-3 rounded-lg bg-page border border-border hover:border-primary transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-control font-semibold text-main truncate">
                      {col.name}
                    </span>
                    <Badge variant="tint" size="sm" className="font-mono">
                      {col.type}
                    </Badge>
                  </div>

                  <div className="text-caption text-secondary space-y-1">
                    <div className="flex items-center gap-1.5">
                      {col.nullable ? (
                        <span>
                          {col.null_count !== undefined
                            ? `${col.null_count} nulls (${col.null_percentage || 0}%)`
                            : 'Nullable'}
                        </span>
                      ) : (
                        <span className="text-main font-medium">Non-null</span>
                      )}
                      {col.distinct_count !== undefined && (
                        <span>| {col.distinct_count.toLocaleString()} distinct</span>
                      )}
                    </div>

                    {col.sample_values && col.sample_values.length > 0 && (
                      <div className="truncate font-mono text-caption text-secondary">
                        e.g. {col.sample_values.slice(0, 2).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredColumns.length === 0 && (
                <div className="py-8 text-center text-body text-secondary">
                  No columns match '{columnFilter}'
                </div>
              )}
            </div>

            {/* Schema verification note */}
            <div className="mt-4 p-3.5 rounded-lg bg-page border border-border text-caption text-main shrink-0 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <CheckCircle2 className="w-4 h-4 text-primary" aria-hidden="true" />
                <span>Schema verified</span>
              </div>
              <p className="text-caption text-secondary leading-relaxed">
                Natural language queries will be ready immediately upon confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
