import React from 'react';
import { Table, Download } from 'lucide-react';
import { Button } from '../common/Button';

export interface ResultTableProps {
  columns: string[];
  rows: (string | number | boolean | null)[][];
  rowCount?: number;
  tableName?: string;
}

export const ResultTable: React.FC<ResultTableProps> = ({
  columns,
  rows,
  rowCount,
  tableName = 'Query results',
}) => {
  const exportToCsv = () => {
    if (!columns || !rows) return;
    const headerLine = columns.map((col) => `"${col.replace(/"/g, '""')}"`).join(',');
    const rowLines = rows.map((row) =>
      row
        .map((val) => (val !== null && val !== undefined ? `"${String(val).replace(/"/g, '""')}"` : '""'))
        .join(',')
    );
    const csvContent = [headerLine, ...rowLines].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `datatalk_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const total = rowCount !== undefined ? rowCount : rows.length;

  return (
    <div className="flex flex-col h-full rounded-lg border border-tint bg-surface shadow-subtle overflow-hidden">
      {/* Table Header Action Bar */}
      <div className="px-4 py-2.5 bg-surface border-b border-tint flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider text-ink">
            {tableName}
          </span>
          <span className="text-xs text-ink-muted font-mono">
            {total} {total === 1 ? 'row' : 'rows'}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={exportToCsv}
          icon={<Download className="w-3.5 h-3.5" />}
          className="text-xs text-ink hover:text-primary"
          aria-label="Export results to CSV"
        >
          Export
        </Button>
      </div>

      {/* Internal Scrollable Table Body */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-[#E8E4DA] z-10 border-b border-tint select-none">
            <tr>
              <th className="py-2.5 px-3 font-mono font-medium text-ink-muted text-center w-10 border-r border-tint">
                #
              </th>
              {columns.map((col) => (
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
            {rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-tint/25 transition-colors font-mono text-ink text-[13px]"
              >
                <td className="py-2 px-3 text-center text-ink-muted bg-surface/70 border-r border-tint select-none">
                  {rowIdx + 1}
                </td>
                {row.map((val, colIdx) => (
                  <td
                    key={colIdx}
                    className="py-2 px-4 whitespace-nowrap border-r border-tint/60 last:border-r-0"
                  >
                    {val !== null && val !== undefined ? String(val) : (
                      <span className="text-ink-muted italic">NULL</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="py-8 text-center text-xs text-ink-muted"
                >
                  No results returned by query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

