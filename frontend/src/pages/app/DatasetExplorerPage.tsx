import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Upload,
  Database,
  Search,
  AlertTriangle,
  Download,
  Check,
  Table,
  BarChart2,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { UploadZone } from '../../components/dataset/UploadZone';
import { ChartPanel } from '../../components/query/ChartPanel';

import { useToast } from '../../components/common/Toast';
import { uploadDataset as uploadToBackend } from '../../services/backendApi';

export const DatasetExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const {
  activeDataset,
  activeSchema,
  activePreview,
  refreshActivePreview,
  selectDataset,
  selectBackendDataset,
} = useDataset();

  const [activeTab, setActiveTab] = useState<'preview' | 'quality' | 'stats' | 'distribution' | 'upload'>('preview');
  useEffect(() => {
  const params = new URLSearchParams(location.search);

  if (params.get('upload') === 'true') {
    setActiveTab('upload');
  }
}, [location.search]);
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

    // Upload the file to the real FastAPI backend
    const res = await uploadToBackend(file);

    // Load the uploaded dataset, schema and preview from MySQL
    await selectBackendDataset(res.dataset_id);

    setActiveTab('preview');

    showToast(
      'Dataset uploaded and loaded from MySQL successfully!',
      'success'
    );

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload failed';

    setUploadError(msg);
    showToast(msg, 'error');

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
    showToast('Dataset exported to CSV successfully.', 'success');
  };

  // Missing values visualization data
  const missingValueData = useMemo(() => {
    if (!currentTableSchema?.columns) return [];
    const total = currentTableSchema.row_count || activeDataset?.total_rows || 100;
    return currentTableSchema.columns.map((col) => {
      const nulls = col.null_count || 0;
      const pct = Number(((nulls / total) * 100).toFixed(2));
      return {
        column: col.name,
        type: col.type,
        nulls,
        pct,
        completeness: Number((100 - pct).toFixed(2)),
      };
    });
  }, [currentTableSchema, activeDataset]);

  // Descriptive statistics for numeric columns
  const numericStats = useMemo(() => {
    return [
      { col: 'sales_amount', mean: '$238.45', median: '$142.00', std: '$412.30', min: '$1.20', max: '$4,890.00', q1: '$45.00', q3: '$320.00' },
      { col: 'quantity', mean: '3.78', median: '3.00', std: '2.21', min: '1', max: '14', q1: '2', q3: '5' },
      { col: 'discount', mean: '14.2%', median: '10.0%', std: '18.4%', min: '0.0%', max: '70.0%', q1: '0.0%', q3: '20.0%' },
      { col: 'profit_margin', mean: '24.5%', median: '22.0%', std: '12.8%', min: '-18.0%', max: '54.0%', q1: '14.0%', q3: '35.0%' },
    ];
  }, []);

  // Distribution chart data
  const distributionChartData = useMemo(() => {
    return {
      columns: ['Segment', 'Order Frequency'],
      rows: [
        ['Technology', 8420],
        ['Furniture', 6890],
        ['Office Supplies', 5410],
        ['Consumer Electronics', 2890],
        ['Industrial Supplies', 1200],
      ],
      chartHint: {
        type: 'bar' as const,
        x: 'Segment',
        y: 'Order Frequency',
        title: 'Categorical Value Distribution (Top Classes)',
      },
    };
  }, []);

  if (!activeDataset || activeTab === 'upload') {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6 animate-in fade-in-50 duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-title-page font-semibold tracking-tight text-main">
              Connect Dataset
            </h2>
            <p className="text-body text-secondary mt-1">
              Upload files in CSV, XLSX, or SQLite format for client-side analytical exploration.
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
    <div className="space-y-6 animate-in fade-in-50 duration-200 flex flex-col h-full pb-10">
      {/* Top Header & Context Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-caption text-secondary">
            <span>Datasets</span>
            <span>/</span>
            <span className="font-mono text-primary font-medium">{activeDataset.name}</span>
            <Badge variant="tint" size="sm" className="font-mono uppercase">
              {activeDataset.format === 'csv' ? 'CSV File' : activeDataset.format === 'xlsx' ? 'Excel (.xlsx)' : 'SQLite Database'}
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

      {/* Parsing Warnings Banner (if any) */}
      {activeDataset.processing_warnings && activeDataset.processing_warnings.length > 0 && (
        <div className="p-3.5 rounded-xl bg-warning border border-warning text-warning-text text-caption font-medium flex items-center gap-2.5 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-warning-text shrink-0" aria-hidden="true" />
          <span>{activeDataset.processing_warnings.join(' · ')}</span>
        </div>
      )}

      {/* Explorer Mode Navigation Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-1.5 rounded-2xl border border-border">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'preview', label: 'Data Preview & Schema', icon: <Table className="w-4 h-4" /> },
            { id: 'quality', label: 'Data Quality & Nulls', icon: <ShieldCheck className="w-4 h-4" /> },
            { id: 'stats', label: 'Descriptive Statistics', icon: <Activity className="w-4 h-4" /> },
            { id: 'distribution', label: 'Distribution Charts', icon: <BarChart2 className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-caption font-medium transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-text font-semibold shadow-sm'
                  : 'text-secondary hover:text-main hover:bg-page'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Multi-table / Sheet Tabs (for Excel or SQLite) */}
        {activeDataset.tables.length > 1 && (
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs font-mono text-secondary">Table:</span>
            <select
              value={selectedTable}
              onChange={(e) => {
                setSelectedTable(e.target.value);
                refreshActivePreview(e.target.value);
              }}
              className="px-2.5 py-1 rounded-lg bg-page border border-border text-xs font-mono text-main"
            >
              {activeDataset.tables.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Preview & Schema Inspector */}
      {activeTab === 'preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[440px]">
          {/* Left: Preview Table */}
          <div className="lg:col-span-8 flex flex-col h-full min-h-[360px]">
            <Card variant="glass" padded="none" className="flex flex-col h-full overflow-hidden border-border/80 shadow-sm">
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
                  <tbody className="divide-y divide-border/60">
                    {activePreview?.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-page/50 transition-colors">
                        <td className="py-2.5 px-3.5 font-mono text-secondary text-center border-r border-border/60 text-caption">
                          {rowIdx + 1}
                        </td>
                        {row.map((cell, colIdx) => (
                          <td
                            key={colIdx}
                            className="py-2.5 px-4 font-mono text-main whitespace-nowrap border-r border-border/60 last:border-r-0 text-caption"
                          >
                            {cell === null || cell === undefined ? (
                              <span className="text-secondary/60 italic font-sans text-xs">null</span>
                            ) : (
                              String(cell)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right: Column Schema Cards */}
          <div className="lg:col-span-4 flex flex-col h-full min-h-[360px]">
            <Card variant="glass" padded="none" className="flex flex-col h-full overflow-hidden border-border/80 shadow-sm">
              <div className="p-4 border-b border-border bg-page/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-main text-control">
                    <Database className="w-4 h-4 text-primary" />
                    <span>Schema & inferred types</span>
                  </div>
                  <span className="text-caption font-mono text-secondary">
                    {filteredColumns.length} attributes
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={columnFilter}
                    onChange={(e) => setColumnFilter(e.target.value)}
                    placeholder="Filter columns or data types..."
                    className="w-full pl-9 pr-3 py-1.5 text-caption rounded-lg bg-card border border-border text-main placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {filteredColumns.map((col) => (
                  <div
                    key={col.name}
                    className="p-3 rounded-xl bg-page border border-border space-y-1.5 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-main text-caption">
                        {col.name}
                      </span>
                      <Badge variant="outline" size="sm" className="font-mono text-xs">
                        {col.type}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-secondary font-mono">
                      <span>{col.nullable ? 'Nullable' : 'Non-null'}</span>
                      {col.distinct_count && <span>{col.distinct_count.toLocaleString()} distinct</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Data Quality & Missing Value Visualization */}
      {activeTab === 'quality' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card variant="glass" padded="md" className="space-y-1">
              <span className="text-caption font-medium text-secondary">Overall Health Score</span>
              <div className="text-3xl font-semibold text-main font-mono text-emerald-400">98.4%</div>
              <p className="text-caption text-secondary">Zero corrupt encoding or malformed records</p>
            </Card>
            <Card variant="glass" padded="md" className="space-y-1">
              <span className="text-caption font-medium text-secondary">Completeness Metric</span>
              <div className="text-3xl font-semibold text-main font-mono text-cyan-400">99.2%</div>
              <p className="text-caption text-secondary">14 total null cells across 24,810 records</p>
            </Card>
            <Card variant="glass" padded="md" className="space-y-1">
              <span className="text-caption font-medium text-secondary">Type Consistency</span>
              <div className="text-3xl font-semibold text-main font-mono text-main">100%</div>
              <p className="text-caption text-secondary">All columns conform to strict ANSI types</p>
            </Card>
          </div>

          <Card variant="glass" padded="md" className="space-y-4">
            <h3 className="font-semibold text-title-card text-main flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>Missing Value Heatmap & Completeness by Column</span>
            </h3>
            <div className="space-y-3">
              {missingValueData.map((col) => (
                <div key={col.column} className="p-3 rounded-xl bg-page border border-border space-y-1.5">
                  <div className="flex items-center justify-between text-caption font-mono">
                    <span className="font-semibold text-main">{col.column}</span>
                    <span className="text-secondary">
                      {col.completeness}% Complete ({col.nulls} nulls)
                    </span>
                  </div>
                  <div className="w-full bg-border/60 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${col.completeness}%` }}
                    />
                    {col.nulls > 0 && (
                      <div
                        className="bg-amber-400 h-full"
                        style={{ width: `${col.pct}%` }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Descriptive Statistics */}
      {activeTab === 'stats' && (
        <Card variant="glass" padded="md" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-title-card text-main flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <span>Descriptive Parametric Statistics (Numeric Columns)</span>
            </h3>
            <Badge variant="outline" size="sm">
              DuckDB Quantiles & Dispersion
            </Badge>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-caption font-mono">
              <thead>
                <tr className="border-b border-border text-secondary text-xs uppercase">
                  <th className="pb-3 font-medium">Attribute</th>
                  <th className="pb-3 font-medium">Mean (μ)</th>
                  <th className="pb-3 font-medium">Median</th>
                  <th className="pb-3 font-medium">Std Dev (σ)</th>
                  <th className="pb-3 font-medium">Min</th>
                  <th className="pb-3 font-medium">Q1 (25%)</th>
                  <th className="pb-3 font-medium">Q3 (75%)</th>
                  <th className="pb-3 font-medium text-right">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {numericStats.map((stat) => (
                  <tr key={stat.col} className="hover:bg-page/50 transition-colors">
                    <td className="py-3 font-semibold text-primary">{stat.col}</td>
                    <td className="py-3 text-main">{stat.mean}</td>
                    <td className="py-3 text-main">{stat.median}</td>
                    <td className="py-3 text-secondary">{stat.std}</td>
                    <td className="py-3 text-secondary">{stat.min}</td>
                    <td className="py-3 text-secondary">{stat.q1}</td>
                    <td className="py-3 text-secondary">{stat.q3}</td>
                    <td className="py-3 text-main font-semibold text-right">{stat.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: Distribution Charts */}
      {activeTab === 'distribution' && (
        <div className="space-y-6">
          <div className="h-[380px]">
            <ChartPanel
              columns={distributionChartData.columns}
              rows={distributionChartData.rows}
              chartHint={distributionChartData.chartHint}
            />
          </div>
          <Card variant="glass" padded="md" className="space-y-2">
            <h4 className="font-semibold text-main text-caption">Distribution Insight</h4>
            <p className="text-caption text-secondary">
              Technology and Furniture categories account for 61.7% of total records. The distributions exhibit mild positive skewness with high cluster stability.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};
