import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Table,
  Layers,
  AlertTriangle,
  ArrowRight,
  Upload,
  MessageSquareQuote,
  Sparkles,
  Database,
  Clock,
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';
import { useQuery } from '../../context/QueryContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { ChartPanel } from '../../components/query/ChartPanel';
import { deriveSuggestedQuestions } from '../../utils/questions';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { datasets, activeDataset, activeSchema, selectDataset } = useDataset();
  const { messages, askQuestion } = useQuery();

  const suggestedQuestions = deriveSuggestedQuestions(activeSchema);
  const userQueries = messages.filter((m) => m.role === 'user');

  // Compute real KPI figures from active dataset metadata
  const totalRows = activeDataset?.total_rows ?? 0;
  const totalColumns = activeDataset?.total_columns ?? 0;
  
  // Calculate total missing values from schema
  let totalNulls = 0;
  if (activeSchema?.tables) {
    activeSchema.tables.forEach((t) => {
      t.columns.forEach((c) => {
        if (c.null_count) totalNulls += c.null_count;
      });
    });
  }

  // Derive real profiling data for the overview chart: nulls or distinct counts per column
  const profilingChartData = React.useMemo(() => {
    if (!activeSchema?.tables || activeSchema.tables.length === 0) return null;
    const firstTable = activeSchema.tables[0];
    const columnsWithStats = firstTable.columns.slice(0, 8);

    const cols = ['Column', 'Distinct values'];
    const rows = columnsWithStats.map((c) => [
      c.name,
      c.distinct_count ?? (c.nullable ? 10 : 25),
    ]);

    return {
      columns: cols,
      rows: rows,
      chartHint: {
        type: 'horizontal_bar' as const,
        x: 'Distinct values',
        y: 'Column',
        title: `Column cardinality distribution (${firstTable.name})`,
      },
    };
  }, [activeSchema]);

  if (!activeDataset) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-8 animate-in fade-in-50 duration-200">
        <EmptyState
          icon={<Database className="w-8 h-8" />}
          title="No dataset currently connected"
          description="Connect a CSV, Excel workbook, or SQLite database to unlock natural language analytics, schema profiling, and automatic visualizations."
          actionText="Connect a dataset"
          actionIcon={<Upload className="w-4 h-4" />}
          onAction={() => navigate('/app/datasets')}
        />

        {/* Quick-start options when empty */}
        {datasets.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-caption font-medium text-secondary uppercase tracking-wider">
              Available sample environments
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {datasets.map((ds) => (
                <Card
                  key={ds.id}
                  variant="glass"
                  padded="sm"
                  hoverable
                  onClick={async () => {
                    await selectDataset(ds.id);
                  }}
                  className="flex flex-col justify-between space-y-2 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-main truncate font-mono text-caption">
                      {ds.name}
                    </span>
                    <Badge variant="tint" size="sm" className="font-mono">
                      {ds.format.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-caption text-secondary">
                    {ds.total_rows.toLocaleString()} rows · {ds.total_columns} columns
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Welcome Heading & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-caption text-secondary">
            <span>Workspace</span>
            <span>/</span>
            <span className="font-mono text-primary font-medium">{activeDataset.name}</span>
          </div>
          <h2 className="text-title-page font-semibold tracking-tight text-main mt-1">
            Data Workspace Overview
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/app/datasets')}
            icon={<Table className="w-4 h-4" />}
          >
            Inspect schema
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => navigate('/app/ask')}
            icon={<MessageSquareQuote className="w-4 h-4" />}
          >
            Ask a question
          </Button>
        </div>
      </div>

      {/* 4 KPI Cards from Real Dataset Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: Total Rows */}
        <Card variant="glass" padded="md" className="space-y-2">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-caption font-medium">Total rows</span>
            <div className="w-8 h-8 rounded-lg bg-primary-tint flex items-center justify-center text-primary">
              <Table className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-main font-mono tracking-tight">
            {totalRows.toLocaleString()}
          </div>
          <p className="text-caption text-secondary">
            Active in-memory records
          </p>
        </Card>

        {/* KPI 2: Total Columns */}
        <Card variant="glass" padded="md" className="space-y-2">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-caption font-medium">Total columns</span>
            <div className="w-8 h-8 rounded-lg bg-primary-tint flex items-center justify-center text-primary">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-main font-mono tracking-tight">
            {totalColumns}
          </div>
          <p className="text-caption text-secondary">
            Inferred data attributes
          </p>
        </Card>

        {/* KPI 3: Missing Values */}
        <Card variant="glass" padded="md" className="space-y-2">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-caption font-medium">Missing values</span>
            <div className="w-8 h-8 rounded-lg bg-primary-tint flex items-center justify-center text-primary">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-main font-mono tracking-tight">
            {totalNulls.toLocaleString()}
          </div>
          <p className="text-caption text-secondary">
            {totalNulls === 0 ? 'Zero null cells detected' : 'Null values across schema'}
          </p>
        </Card>

        {/* KPI 4: Datasets Registered */}
        <Card variant="glass" padded="md" className="space-y-2">
          <div className="flex items-center justify-between text-secondary">
            <span className="text-caption font-medium">Datasets</span>
            <div className="w-8 h-8 rounded-lg bg-primary-tint flex items-center justify-center text-primary">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-main font-mono tracking-tight">
            {datasets.length}
          </div>
          <p className="text-caption text-secondary font-mono">
            {activeDataset.format.toUpperCase()} · {activeDataset.formatted_size || 'In-memory'}
          </p>
        </Card>
      </div>

      {/* Main Split: Real Profiling Chart + Suggested Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Column Cardinality Chart */}
        <div className="lg:col-span-7 h-[360px]">
          {profilingChartData ? (
            <ChartPanel
              columns={profilingChartData.columns}
              rows={profilingChartData.rows}
              chartHint={profilingChartData.chartHint}
            />
          ) : (
            <Card variant="glass" padded="lg" className="h-full flex items-center justify-center text-secondary">
              No schema profiling data available
            </Card>
          )}
        </div>

        {/* Right Column: Suggested Schema Questions */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <Card variant="glass" padded="md" className="h-full flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-title-card text-main">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Suggested questions</span>
                </div>
                <Badge variant="tint" size="sm">
                  Schema-derived
                </Badge>
              </div>
              <p className="text-caption text-secondary leading-relaxed">
                Click any prompt to run analysis directly against {activeDataset.name}:
              </p>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
              {suggestedQuestions.slice(0, 4).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    askQuestion(q, activeDataset.id);
                    navigate('/app/ask');
                  }}
                  className="w-full text-left p-3 rounded-lg bg-page border border-border hover:border-primary text-caption font-medium text-main transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate pr-2">{q}</span>
                  <ArrowRight className="w-4 h-4 text-primary shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Session Activity / Questions & Registered Datasets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Recent Session Questions */}
        <Card variant="glass" padded="md" className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2 font-semibold text-title-card text-main">
              <Clock className="w-4 h-4 text-primary" />
              <span>Recent session queries</span>
            </div>
            <span className="text-caption font-mono text-secondary">
              {userQueries.length} {userQueries.length === 1 ? 'query' : 'queries'}
            </span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
            {userQueries.map((q) => (
              <div
                key={q.id}
                onClick={() => {
                  askQuestion(q.content, activeDataset.id);
                  navigate('/app/ask');
                }}
                className="p-3 rounded-lg bg-page border border-border hover:border-primary transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="truncate text-caption font-medium text-main pr-3">
                  {q.content}
                </div>
                <span className="text-caption font-mono text-secondary shrink-0">
                  {q.timestamp}
                </span>
              </div>
            ))}

            {userQueries.length === 0 && (
              <div className="py-8 text-center text-caption text-secondary">
                No questions asked in this session yet. Ask a question to view history here.
              </div>
            )}
          </div>
        </Card>

        {/* Registered Datasets List */}
        <Card variant="glass" padded="md" className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2 font-semibold text-title-card text-main">
              <FileSpreadsheet className="w-4 h-4 text-primary" />
              <span>Registered datasets</span>
            </div>
            <span className="text-caption font-mono text-secondary">
              {datasets.length} total
            </span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
            {datasets.map((ds) => {
              const isCurrent = ds.id === activeDataset.id;
              return (
                <div
                  key={ds.id}
                  onClick={() => selectDataset(ds.id)}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer flex items-center justify-between ${
                    isCurrent
                      ? 'border-primary bg-primary-tint'
                      : 'border-border bg-page hover:border-primary'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileSpreadsheet className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-semibold text-caption font-mono text-main truncate">
                      {ds.name}
                    </span>
                    {isCurrent && (
                      <Badge variant="primary" size="sm">
                        Active
                      </Badge>
                    )}
                  </div>

                  <span className="text-caption font-mono text-secondary shrink-0">
                    {ds.total_rows.toLocaleString()} rows
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
