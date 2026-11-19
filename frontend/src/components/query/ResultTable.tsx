import React, { useState } from 'react';
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
  const [selectedRowIdx, setSelectedRowIdx] = useState<number | null>(null);

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
    <div className="flex flex-col h-full rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      {/* Table Header Action Bar */}
      <div className="px-4 py-2.5 bg-card border-b border-border flex items-center justify-between shrink-0 select-none min-h-[48px]">
        <div className="flex items-center gap-2.5">
          <Table className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          <span className="text-title-card font-semibold text-main">
            {tableName}
          </span>
          <span className="text-caption text-secondary font-mono">
            {total} {total === 1 ? 'row' : 'rows'}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={exportToCsv}
          icon={<Download className="w-4 h-4" />}
          className="text-control"
          title="Export query results to CSV"
        >
          Export
        </Button>
      </div>

      {/* Table Viewport with Internal Scroll and Horizontal Overflow */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full border-collapse text-left" role="table">
          <thead className="bg-page/70 sticky top-0 z-10 select-none border-b border-border">
            <tr>
              <th className="py-3 px-4 text-table-header font-medium text-secondary whitespace-nowrap">
                #
              </th>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="py-3 px-4 text-table-header font-medium text-secondary whitespace-nowrap tracking-wide"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, rowIdx) => {
              const isSelected = selectedRowIdx === rowIdx;
              return (
                <tr
                  key={rowIdx}
                  onClick={() => setSelectedRowIdx(isSelected ? null : rowIdx)}
                  className={`transition-colors cursor-pointer select-text ${
                    isSelected
                      ? 'bg-primary-tint border-l-4 border-primary text-main'
                      : 'hover:bg-page/50 text-main'
                  }`}
                  aria-selected={isSelected}
                >
                  <td className="py-2.5 px-4 text-table-cell font-mono text-secondary whitespace-nowrap">
                    {rowIdx + 1}
                  </td>
                  {row.map((cell, cellIdx) => {
                    const isIdOrDate =
                      columns[cellIdx]?.toLowerCase().includes('id') ||
                      columns[cellIdx]?.toLowerCase().includes('date') ||
                      columns[cellIdx]?.toLowerCase().includes('code');

                    const isNumeric =
                      typeof cell === 'number' ||
                      (typeof cell === 'string' && /^[0-9,.$% -]+$/.test(cell.trim()));

                    return (
                      <td
                        key={cellIdx}
                        className={`py-2.5 px-4 text-table-cell ${
                          isIdOrDate
                            ? 'font-mono whitespace-nowrap'
                            : isNumeric
                            ? 'font-mono'
                            : ''
                        }`}
                      >
                        {cell === null || cell === undefined ? (
                          <span className="text-secondary italic">null</span>
                        ) : (
                          String(cell)
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
