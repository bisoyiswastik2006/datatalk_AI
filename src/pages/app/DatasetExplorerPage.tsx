import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Database,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  Download,
  Check,
  Table,
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Tabs } from '../../components/common/Tabs';
import { UploadZone } from '../../components/dataset/UploadZone';
import { api } from '../../services/api';

export const DatasetExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeDataset,
    activeSchema,
    activePreview,
    refreshActivePreview,
    selectDataset,
  } = useDataset();

  const [activeTab, setActiveTab] = useState<'preview' | 'schema' | 'upload'>(() => {
    const param = new URLSearchParams(window.location.search).get('tab');
    if (param === 'schema' || param === 'upload') return param;
    return 'preview';
  });
  const [selectedTable, setSelectedTable] = useState<string>(
    activePreview?.table_name || activeDataset?.tables[0] || 'Default'
  );
  const [columnFilter, setColumnFilter] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const currentTableSchema =
    activeSchema?.tables.find((t) => t.name === selectedTable) || activeSchema?.tables[0];

  const filteredColumns =
    currentTableSchema?.columns.filter(
      (col) =>
        col.name.toLowerCase().includes(columnFilter.toLowerCase()) ||
        col.type.toLowerCase().includes(columnFilter.toLowerCase())
    ) || [];

  const handleFileSelected = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      const res = await api.uploadDataset(file);
      await selectDataset(res.dataset_id);
      setActiveTab('preview');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportCsv = () => {
    if (!activePreview?.columns || !activePreview?.rows) return;
    const headerLine = activePreview.columns.map((c) => `"${c.replace(/"/g, '""')}"`).join(',');
    const rowLines = activePreview.rows.map((row) =>
      row.map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const blob = new Blob([headerLine + '\n' + rowLines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeDataset?.name || 'dataset'}_${selectedTable}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!activeDataset || activeTab === 'upload') {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6 animate-in fade-in-50 duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-title-page font-semibold tracking-tight text-main">
              Connect Dataset
            </h2>
            <p className="text-body text-secondary mt-1">
              Upload files in CSV, XLSX, or SQLite format.
            </p>
          </div>
          {activeDataset && (
            <Button variant="outline" size="sm" onClick={() => setActiveTab('preview')}>
              Back to active dataset
            </Button>
          )}
        </div>

        <UploadZone
          onFileSelected={handleFileSelected}
          onSelectQuickStart={async (id) => {
            await selectDataset(id);
            setActiveTab('preview');
          }}
          isUploading={isUploading}
          uploadError={uploadError}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200 flex flex-col h-full">
      {/* Top Header & Context Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-caption text-secondary">
            <span>Datasets</span>
            <span>/</span>
            <span className="font-mono text-primary font-medium">{activeDataset.name}</span>
            <Badge variant="tint" size="sm" className="font-mono">
              {activeDataset.format.toUpperCase()}
            </Badge>
          </div>
          <h2 className="text-title-page font-semibold tracking-tight text-main mt-1">
            Dataset Explorer & Schema Inspector
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('upload')}
            icon={<Upload className="w-4 h-4" />}
          >
            Upload new
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            icon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/app/ask')}
            icon={<Check className="w-4 h-4" />}
          >
            Use this dataset
          </Button>
        </div>
      </div>

      {/* Parsing Warnings Banner (if any returned by backend) */}
      {activeDataset.processing_warnings && activeDataset.processing_warnings.length > 0 && (
        <div className="p-3.5 rounded-xl bg-warning border border-warning text-warning-text text-caption font-medium flex items-center gap-2.5 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-warning-text shrink-0" aria-hidden="true" />
          <span>{activeDataset.processing_warnings.join(' · ')}</span>
        </div>
      )}

      {/* Multi-table / Sheet Tabs (for Excel or SQLite) */}
      {activeDataset.tables.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-caption font-medium text-secondary mr-2 flex items-center gap-1.5 shrink-0">
            <Layers className="w-4 h-4 text-primary" />
            <span>Tables:</span>
          </span>
          <Tabs
            tabs={activeDataset.tables.map((t) => ({ id: t, label: t }))}
            activeTab={selectedTable}
            onChange={(tabId) => {
              setSelectedTable(tabId);
              refreshActivePreview(tabId);
            }}
          />
        </div>
      )}

      {/* Main Split: Bounded Preview Table & Column Schema Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[440px]">
        {/* Left (8 cols): Bounded Preview Table */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[360px]">
          <Card variant="glass" padded="none" className="flex flex-col h-full overflow-hidden border-border/80 shadow-sm">
            {/* Table Action Bar */}
            <div className="px-4 py-3 bg-page/70 border-b border-border flex items-center justify-between select-none">
              <div className="flex items-center gap-2 font-semibold text-main text-control">
                <Table className="w-4 h-4 text-primary" />
                <span>
                  Raw data preview (first {activePreview?.rows.length || 0} of{' '}
                  {currentTableSchema?.row_count?.toLocaleString() || activeDataset.total_rows.toLocaleString()}{' '}
                  rows)
                </span>
              </div>
              <span className="text-caption font-mono text-secondary">
                Read-only sample
              </span>
            </div>

            {/* Bounded Scrollable Table with Non-wrapping IDs and Dates */}
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left text-table-cell border-collapse">
                <thead className="sticky top-0 bg-page/90 z-10 border-b border-border select-none">
                  <tr>
                    <th className="py-3 px-3.5 font-mono text-table-header font-medium text-secondary text-center w-12 border-r border-border">
                      #
                    </th>
                    {activePreview?.columns.map((col) => (
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
                  {activePreview?.rows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="hover:bg-page/40 transition-colors font-mono text-table-cell"
                    >
                      <td className="py-2.5 px-3.5 text-center text-caption text-secondary bg-card border-r border-border">
                        {rowIdx + 1}
                      </td>
                      {row.map((cell, cellIdx) => {
                        const colName = activePreview?.columns[cellIdx]?.toLowerCase() || '';
                        const isIdOrDate =
                          colName.includes('id') || colName.includes('date') || colName.includes('code');

                        return (
                          <td
                            key={cellIdx}
                            className={`py-2.5 px-4 whitespace-nowrap border-r border-border/60 last:border-r-0 ${
                              isIdOrDate ? 'whitespace-nowrap font-mono' : ''
                            }`}
                          >
                            {cell !== null && cell !== undefined ? (
                              String(cell)
                            ) : (
                              <span className="text-secondary italic">null</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {(!activePreview || activePreview.rows.length === 0) && (
                    <tr>
                      <td
                        colSpan={(activePreview?.columns.length || 0) + 1}
                        className="py-12 text-center text-body text-secondary"
                      >
                        No preview records available for this table.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right (4 cols): Column Schema & Type Inspector */}
        <div className="lg:col-span-4 flex flex-col h-full min-h-[360px]">
          <Card variant="glass" padded="none" className="flex flex-col h-full overflow-hidden border-border/80 shadow-sm">
            {/* Inspector Header */}
            <div className="p-4 border-b border-border bg-page/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-main text-control">
                  <Database className="w-4 h-4 text-primary" />
                  <span>Schema inspector</span>
                </div>
                <span className="text-caption font-mono text-secondary">
                  {currentTableSchema?.columns.length || 0} columns
                </span>
              </div>

              {/* Column Search Filter */}
              <div className="relative">
                <Search className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={columnFilter}
                  onChange={(e) => setColumnFilter(e.target.value)}
                  placeholder="Filter columns or data types..."
                  className="w-full pl-9 pr-3.5 py-1.5 min-h-[36px] rounded-lg bg-card border border-border text-caption text-main placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Column Cards List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
              {filteredColumns.map((col) => (
                <div
                  key={col.name}
                  className="p-3 rounded-lg bg-page/80 border border-border hover:border-primary transition-colors text-caption"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-control font-semibold text-main truncate">
                      {col.name}
                    </span>
                    <Badge variant="tint" size="sm" className="font-mono">
                      {col.type}
                    </Badge>
                  </div>

                  <div className="text-secondary space-y-1">
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
                        <span>· {col.distinct_count.toLocaleString()} distinct</span>
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

            {/* Verification Footer */}
            {activeSchema?.verified && (
              <div className="p-3.5 border-t border-border bg-page/50 flex items-center gap-2 text-caption text-primary font-medium">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Schema verified for safe in-memory execution</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
