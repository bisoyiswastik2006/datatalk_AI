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
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="full">
      <div className="flex flex-col h-[82vh] -m-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-tint bg-surface/90 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-ink-muted uppercase tracking-wider">
              <span>STEP 02</span>
              <span>/</span>
              <span>DATASET INGESTION & VALIDATION</span>
              <span className="inline-flex items-center gap-1 text-status-success font-medium ml-2">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>File validated</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-ink font-mono">{dataset.name}</h2>
              <Badge variant="outline" size="sm" className="uppercase font-mono">
                {dataset.format}
              </Badge>
              {dataset.formatted_size && (
                <span className="text-xs text-ink-muted font-mono">{dataset.formatted_size}</span>
              )}
              <span className="text-xs text-ink-muted">
                {dataset.total_rows.toLocaleString()} rows
              </span>
              <span className="text-xs text-ink-muted">
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
          <div className="px-6 py-2.5 bg-tint/20 border-b border-tint flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-xs font-mono uppercase text-ink-muted mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
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
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white shadow-subtle'
                      : 'bg-surface border border-tint text-ink hover:bg-tint/30'
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
          <div className="px-6 py-2 bg-status-warning-bg border-b border-status-warning/20 text-status-warning text-xs flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <div className="truncate">
              {dataset.processing_warnings.join(' | ')}
            </div>
          </div>
        )}

        {/* Main Split: Bounded Preview Table (left) & Schema Inspector (right) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Raw Data Preview */}
          <div className="flex-1 flex flex-col p-6 overflow-hidden border-r border-tint">
            <div className="flex items-center justify-between pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink">
                  Raw data preview (first {preview?.rows.length || 0} of{' '}
                  {currentTableSchema?.row_count?.toLocaleString() || dataset.total_rows.toLocaleString()}{' '}
                  rows)
                </span>
                <span className="text-xs text-ink-muted bg-tint/30 px-2 py-0.5 rounded">
                  Read-only sample
                </span>
              </div>
            </div>

            {/* Table Container with Internal Scroll and Non-wrapping IDs/Dates */}
            <div className="flex-1 border border-tint rounded-lg overflow-auto custom-scrollbar bg-surface shadow-subtle">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#E8E4DA] z-10 border-b border-tint">
                  <tr>
                    <th className="py-2.5 px-3 font-mono font-medium text-ink-muted text-center w-12 border-r border-tint">
                      #
                    </th>
                    {preview?.columns.map((col) => (
                      <th
                        key={col}
                        className="py-2.5 px-4 font-mono font-semibold text-ink whitespace-nowrap border-r border-tint last:border-r-0"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-tint/60">
                  {preview?.rows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="hover:bg-tint/20 transition-colors font-mono text-ink text-[13px]"
                    >
                      <td className="py-2 px-3 text-center text-ink-muted bg-surface/80 border-r border-tint">
                        {rowIdx + 1}
                      </td>
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="py-2 px-4 whitespace-nowrap border-r border-tint/60 last:border-r-0"
                        >
                          {cell !== null && cell !== undefined ? String(cell) : (
                            <span className="text-ink-muted italic">NULL</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {(!preview || preview.rows.length === 0) && (
                    <tr>
                      <td
                        colSpan={(preview?.columns.length || 0) + 1}
                        className="py-8 text-center text-ink-muted"
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
          <div className="w-96 flex flex-col p-6 bg-surface/60 overflow-hidden shrink-0">
            <div className="pb-3 border-b border-tint space-y-2 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-sm text-ink">
                  <Database className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span>Schema & inferred types</span>
                </div>
                <span className="text-[11px] font-mono text-ink-muted">
                  {currentTableSchema?.columns.length || 0} columns
                </span>
              </div>

              {/* Column Search Filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="text"
                  value={columnFilter}
                  onChange={(e) => setColumnFilter(e.target.value)}
                  placeholder="Filter columns or data types..."
                  className="w-full pl-8 pr-3 py-1.5 rounded bg-surface border border-tint text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Column Schema Cards List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pt-3 space-y-2">
              {filteredColumns.map((col) => (
                <div
                  key={col.name}
                  className="p-2.5 rounded bg-surface border border-tint hover:border-secondary transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-semibold text-ink truncate">
                      {col.name}
                    </span>
                    <Badge variant="tint" size="sm" className="font-mono">
                      {col.type}
                    </Badge>
                  </div>

                  <div className="text-[11px] text-ink-muted space-y-0.5">
                    <div className="flex items-center gap-1">
                      {col.nullable ? (
                        <span>
                          {col.null_count !== undefined
                            ? `${col.null_count} nulls (${col.null_percentage || 0}%)`
                            : 'Nullable'}
                        </span>
                      ) : (
                        <span className="text-ink font-medium">Non-null</span>
                      )}
                      {col.distinct_count !== undefined && (
                        <span>| {col.distinct_count.toLocaleString()} distinct</span>
                      )}
                    </div>

                    {col.sample_values && col.sample_values.length > 0 && (
                      <div className="truncate font-mono text-[10px] text-ink-muted">
                        e.g. {col.sample_values.slice(0, 2).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredColumns.length === 0 && (
                <div className="py-6 text-center text-xs text-ink-muted">
                  No columns match '{columnFilter}'
                </div>
              )}
            </div>

            {/* Schema verification note */}
            <div className="mt-4 p-3 rounded bg-tint/40 border border-tint text-xs text-ink shrink-0 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-primary">
                <CheckCircle2 className="w-4 h-4 text-primary" aria-hidden="true" />
                <span>Schema verified</span>
              </div>
              <p className="text-[11px] text-ink-muted">
                Natural language queries will be ready immediately upon confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
